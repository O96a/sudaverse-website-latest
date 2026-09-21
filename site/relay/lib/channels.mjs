/**
 * Delivery channels: email (SMTP via nodemailer), Telegram and Signal (signal-cli-rest-api).
 *
 * A channel is `{ name, send(contact, ctx) }`. `send` resolves on success and throws on failure.
 * `deliver()` runs every enabled channel in parallel with a per-channel timeout and reports which
 * ones succeeded. Failure details are reduced to a short safe reason (a status code or an error
 * code): SMTP and HTTP error messages can echo addresses, tokens or message text, so they are
 * never logged.
 */

import nodemailer from 'nodemailer';
import { buildHtml, buildSubject, buildText } from './format.mjs';

const TELEGRAM_MAX = 4096;
const SIGNAL_MAX = 4000;

class ChannelError extends Error {
  constructor(reason) {
    super(reason);
    this.reason = reason;
  }
}

/** Reduce any thrown value to a short, non-sensitive reason string. */
function safeReason(err) {
  if (err instanceof ChannelError) return err.reason;
  if (err && typeof err.code === 'string' && /^[A-Z][A-Z0-9_]{1,30}$/.test(err.code)) return err.code;
  if (err && Number.isInteger(err.responseCode)) return `smtp_${err.responseCode}`;
  if (err?.name === 'TimeoutError' || err?.name === 'AbortError') return 'timeout';
  return 'error';
}

async function withTimeout(run, ms) {
  const controller = new AbortController();
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => {
      controller.abort();
      reject(new ChannelError('timeout'));
    }, ms);
  });
  try {
    return await Promise.race([run(controller.signal), timeout]);
  } finally {
    clearTimeout(timer);
  }
}

async function postJson(url, payload, signal) {
  let res;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal,
    });
  } catch (err) {
    throw new ChannelError(err?.name === 'AbortError' || err?.name === 'TimeoutError' ? 'timeout' : 'network');
  }
  // Drain the body so the connection can be reused; the content is not needed or logged.
  let text = '';
  try {
    text = await res.text();
  } catch {
    /* ignore */
  }
  return { status: res.status, ok: res.ok, text };
}

/**
 * Reply-To is the visitor's address. Their name is used as display name only after removing
 * characters that could make it look like a second address or break address syntax.
 */
function replyTo(contact) {
  const displayName = contact.name
    .replace(/[<>@"\\,;:()[\]]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return displayName ? { name: displayName, address: contact.email } : contact.email;
}

export function createChannels(config) {
  const channels = [];

  if (config.smtp) {
    const s = config.smtp;
    const transporter = nodemailer.createTransport({
      host: s.host,
      port: s.port,
      secure: s.secure,
      requireTLS: s.requireTLS,
      auth: s.user && s.pass ? { user: s.user, pass: s.pass } : undefined,
      tls: { minVersion: 'TLSv1.2' },
      connectionTimeout: 8000,
      greetingTimeout: 8000,
      socketTimeout: 10_000,
      disableFileAccess: true,
      disableUrlAccess: true,
    });
    channels.push({
      name: 'email',
      async send(contact, { requestId }) {
        await transporter.sendMail({
          // Fixed sender on the company domain. The visitor's address is only ever Reply-To.
          from: config.mailFrom,
          to: config.mailTo,
          replyTo: replyTo(contact),
          subject: buildSubject(contact),
          text: buildText(contact),
          html: buildHtml(contact),
          headers: { 'X-Relay-Request-Id': requestId },
          disableFileAccess: true,
          disableUrlAccess: true,
        });
      },
    });
  }

  if (config.telegram) {
    const { token, chatId } = config.telegram;
    channels.push({
      name: 'telegram',
      async send(contact, { signal }) {
        const r = await postJson(
          `https://api.telegram.org/bot${token}/sendMessage`,
          {
            chat_id: chatId,
            text: buildText(contact, { maxLength: TELEGRAM_MAX }),
            link_preview_options: { is_disabled: true },
          },
          signal,
        );
        let accepted = r.ok;
        if (accepted) {
          try {
            accepted = JSON.parse(r.text).ok !== false;
          } catch {
            /* a 2xx without JSON: trust the status */
          }
        }
        if (!accepted) throw new ChannelError(`http_${r.status}`);
      },
    });
  }

  if (config.signal) {
    const { url, number, recipients } = config.signal;
    channels.push({
      name: 'signal',
      async send(contact, { signal }) {
        const r = await postJson(
          `${url}/v2/send`,
          { message: buildText(contact, { maxLength: SIGNAL_MAX }), number, recipients },
          signal,
        );
        if (!r.ok) throw new ChannelError(`http_${r.status}`);
      },
    });
  }

  return channels;
}

/**
 * Send to every channel in parallel. Resolves to `{ delivered, results }` where `results` holds
 * one `{ channel, ok, reason? }` per channel, in channel order.
 */
export async function deliver(channels, contact, { timeoutMs, requestId }) {
  const results = await Promise.all(
    channels.map(async (channel) => {
      try {
        await withTimeout((signal) => channel.send(contact, { requestId, signal }), timeoutMs);
        return { channel: channel.name, ok: true };
      } catch (err) {
        return { channel: channel.name, ok: false, reason: safeReason(err) };
      }
    }),
  );
  return { delivered: results.filter((r) => r.ok).map((r) => r.channel), results };
}
