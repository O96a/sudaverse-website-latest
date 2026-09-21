/**
 * Shared test helpers: a relay started on a random port, an in-process SMTP server that records
 * mail, a request helper that does not use global fetch (tests replace it), and a fetch mock.
 * Every credential, token and phone number below is a made-up placeholder.
 */

import http from 'node:http';
import net from 'node:net';
import { SMTPServer } from 'smtp-server';
import { createServer } from '../../server.mjs';
import { parseMime } from './mime.mjs';

export const ORIGIN = 'https://www.sudaverse.com';
export const MAIL_FROM = 'Sudaverse website <no-reply@sudaverse.com>';
export const MAIL_TO = 'info@sudaverse.com';

export const VALID = Object.freeze({
  name: 'Ada Lovelace',
  organization: 'Analytical Engines Ltd',
  email: 'ada@example.org',
  topic: 'product',
  message: 'Hello, we would like a demo of the platform.',
  locale: 'en',
});

export function contact(overrides = {}) {
  return { ...VALID, ...overrides };
}

/** Collects log calls so tests can assert on what was (and was not) logged. */
export function captureLogger() {
  const entries = [];
  const add = (level) => (event, fields = {}) => entries.push({ level, event, ...fields });
  return { entries, info: add('info'), warn: add('warn'), error: add('error') };
}

/** Start the relay on 127.0.0.1 with a random port. */
export async function startRelay(overrides = {}) {
  const logger = captureLogger();
  const server = createServer({ allowedOrigins: [ORIGIN], logger, ...overrides });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  const relay = {
    server,
    logger,
    logs: logger.entries,
    url: `http://127.0.0.1:${port}`,
    close: () =>
      new Promise((resolve) => {
        server.closeAllConnections();
        server.close(() => resolve());
      }),
    request: (path, options) => request(`http://127.0.0.1:${port}${path}`, options),
    /** POST /contact with the allowed origin unless overridden. */
    post: (body, options = {}) =>
      request(`http://127.0.0.1:${port}/contact`, {
        method: 'POST',
        headers: { Origin: ORIGIN, 'Content-Type': 'application/json', ...options.headers },
        body: typeof body === 'string' ? body : JSON.stringify(body),
        ...(options.chunks ? { chunks: options.chunks } : {}),
      }),
  };
  return relay;
}

/** Minimal HTTP client on node:http. Resolves `{ status, headers, text, json }`. */
export function request(url, { method = 'GET', headers = {}, body, chunks } = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, { method, headers, agent: false }, (res) => {
      const parts = [];
      res.on('data', (c) => parts.push(c));
      res.on('end', () => {
        const text = Buffer.concat(parts).toString('utf8');
        let json;
        try {
          json = JSON.parse(text);
        } catch {
          /* not JSON */
        }
        resolve({ status: res.statusCode, headers: res.headers, text, json });
      });
    });
    req.on('error', reject);
    if (chunks) for (const chunk of chunks) req.write(chunk);
    if (body !== undefined) req.write(body);
    req.end();
  });
}

/** An SMTP server that accepts anything (optionally requiring given credentials) and records mail. */
export async function startSmtp({ auth } = {}) {
  const messages = [];
  const authAttempts = [];
  const server = new SMTPServer({
    authOptional: !auth,
    allowInsecureAuth: true, // plain loopback in tests only
    disabledCommands: ['STARTTLS'],
    logger: false,
    onAuth(credentials, session, callback) {
      authAttempts.push({ user: credentials.username });
      if (auth && credentials.username === auth.user && credentials.password === auth.pass) {
        return callback(null, { user: credentials.username });
      }
      return callback(new Error('Invalid credentials'));
    },
    onData(stream, session, callback) {
      const chunks = [];
      stream.on('data', (c) => chunks.push(c));
      stream.on('end', () => {
        const raw = Buffer.concat(chunks).toString('utf8');
        messages.push({
          raw,
          mail: parseMime(raw),
          mailFrom: session.envelope.mailFrom.address,
          rcptTo: session.envelope.rcptTo.map((r) => r.address),
        });
        callback();
      });
    },
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  return {
    messages,
    authAttempts,
    port: server.server.address().port,
    close: () => new Promise((resolve) => server.close(resolve)),
  };
}

/** SMTP settings for the relay config pointing at a local test server (no TLS). */
export function smtpConfig(port, extra = {}) {
  return { host: '127.0.0.1', port, secure: false, requireTLS: false, ...extra };
}

/** A port that nothing listens on, so connecting fails fast with ECONNREFUSED. */
export async function closedPort() {
  const probe = net.createServer();
  await new Promise((resolve) => probe.listen(0, '127.0.0.1', resolve));
  const { port } = probe.address();
  await new Promise((resolve) => probe.close(resolve));
  return port;
}

export function jsonResponse(status, payload) {
  return new Response(JSON.stringify(payload), { status, headers: { 'Content-Type': 'application/json' } });
}

/**
 * Replace globalThis.fetch. `handler(url, init, body)` returns a Response (or a promise of one).
 * Returns `{ calls, restore }`; call `restore()` in a `finally` or `t.after`.
 */
export function mockFetch(handler) {
  const original = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, init = {}) => {
    const body = typeof init.body === 'string' ? JSON.parse(init.body) : undefined;
    calls.push({ url: String(url), init, body });
    return handler(String(url), init, body);
  };
  return { calls, restore: () => (globalThis.fetch = original) };
}

export const TELEGRAM = Object.freeze({ token: '123456:TEST_TOKEN_NOT_REAL', chatId: '-1000000000001' });
export const SIGNAL = Object.freeze({
  url: 'http://signal:8080',
  number: '+15550100001',
  recipients: ['+15550100002', '+15550100003'],
});
