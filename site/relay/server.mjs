/**
 * Sudaverse contact relay.
 *
 *   POST /contact   JSON body from the website form; delivered to every configured channel.
 *   GET  /health    { ok: true }
 *   OPTIONS         CORS preflight for /contact.
 *
 * No web framework: node:http plus nodemailer. Nothing is logged except request ids, channel
 * names and status codes. Message bodies, names, email addresses and IP addresses are never logged.
 */

import http from 'node:http';
import { randomBytes } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { deliver, createChannels } from './lib/channels.mjs';
import { defaultLogger, enabledChannels, loadConfigFromEnv, resolveConfig } from './lib/config.mjs';
import { clientIp, createRateLimiter, ipKey } from './lib/ratelimit.mjs';
import { honeypotTripped, validateContact } from './lib/validate.mjs';

/** After answering 413 we keep discarding the upload for a moment, but never more than this. */
const DRAIN_LIMIT_BYTES = 1024 * 1024;

const BASE_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
  'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'",
};

export function createServer(input = {}) {
  const config = resolveConfig(input);
  const log = config.logger;
  const allowedOrigins = new Set(config.allowedOrigins);
  const limiter = createRateLimiter(config.rateLimit);
  const channels = createChannels(config);

  const enabled = enabledChannels(config);
  if (enabled.length) log.info('channels', { enabled });
  else log.warn('channels', { enabled, note: 'no delivery channel configured; POST /contact will answer 503' });

  /* ---------- helpers ---------- */

  function reply(res, status, body, extra = {}) {
    if (res.headersSent || res.writableEnded) return;
    const payload = body === undefined ? '' : JSON.stringify(body);
    res.writeHead(status, {
      ...BASE_HEADERS,
      ...extra,
      ...(body === undefined ? {} : { 'Content-Length': Buffer.byteLength(payload) }),
    });
    res.end(payload);
  }

  function readBody(req, limit) {
    return new Promise((resolve) => {
      const declared = Number(req.headers['content-length']);
      const chunks = [];
      let size = 0;
      let settled = false;
      const settle = (result) => {
        if (!settled) {
          settled = true;
          resolve(result);
        }
      };
      if (Number.isFinite(declared) && declared > limit) settle({ tooLarge: true });
      req.on('data', (chunk) => {
        size += chunk.length;
        if (settled) {
          // Rejected already: discard the rest of the upload, within reason.
          if (size > limit + DRAIN_LIMIT_BYTES) req.destroy();
          return;
        }
        if (size > limit) {
          chunks.length = 0;
          settle({ tooLarge: true });
          return;
        }
        chunks.push(chunk);
      });
      req.on('end', () => settle({ body: Buffer.concat(chunks) }));
      req.on('error', () => settle({ aborted: true }));
      req.on('close', () => settle({ aborted: true }));
    });
  }

  /* ---------- POST /contact ---------- */

  async function handleContact(req, res, ctx) {
    const { id, cors } = ctx;

    // Browsers always send Origin on a cross-origin POST. Anything else is not our website.
    // CORS headers are echoed (via `cors`) on every later answer so the browser can read the status.
    if (!ctx.originAllowed) {
      log.info('rejected', { id, status: 403, reason: 'origin' });
      return reply(res, 403, { ok: false, error: 'forbidden_origin' });
    }

    const key = ipKey(clientIp(req, config.trustProxy));
    const verdict = limiter.hit(key);
    if (!verdict.allowed) {
      log.info('rejected', { id, status: 429, reason: 'rate_limit' });
      return reply(res, 429, { ok: false, error: 'rate_limited' }, { ...cors, 'Retry-After': String(verdict.retryAfterSeconds) });
    }

    const type = String(req.headers['content-type'] ?? '').split(';')[0].trim().toLowerCase();
    if (type !== 'application/json') {
      log.info('rejected', { id, status: 415, reason: 'content_type' });
      return reply(res, 415, { ok: false, error: 'unsupported_media_type' }, cors);
    }

    const read = await readBody(req, config.maxBodyBytes);
    if (read.aborted) return;
    if (read.tooLarge) {
      log.info('rejected', { id, status: 413, reason: 'body_size' });
      return reply(res, 413, { ok: false, error: 'payload_too_large' }, { ...cors, Connection: 'close' });
    }

    let body;
    try {
      body = JSON.parse(read.body.toString('utf8'));
    } catch {
      log.info('rejected', { id, status: 400, reason: 'json' });
      return reply(res, 400, { ok: false, error: 'invalid_json' }, cors);
    }

    // Honeypot: real visitors leave `website` empty. Look like a success and send nothing.
    if (honeypotTripped(body)) {
      log.info('honeypot', { id, status: 200 });
      return reply(res, 200, { ok: true }, cors);
    }

    const result = validateContact(body);
    if (!result.ok) {
      log.info('rejected', { id, status: 400, reason: 'validation', fields: result.fields });
      return reply(res, 400, { ok: false, error: 'invalid_fields', fields: result.fields }, cors);
    }

    if (!channels.length) {
      log.warn('rejected', { id, status: 503, reason: 'not_configured' });
      return reply(res, 503, { ok: false, error: 'not_configured' }, cors);
    }

    const { delivered, results } = await deliver(channels, result.value, { timeoutMs: config.timeoutMs, requestId: id });
    for (const r of results) log.info('channel', { id, channel: r.channel, ok: r.ok, ...(r.reason ? { reason: r.reason } : {}) });

    if (delivered.length) {
      log.info('delivered', { id, status: 200, delivered });
      return reply(res, 200, { ok: true, delivered }, cors);
    }
    log.error('delivery_failed', { id, status: 502 });
    return reply(res, 502, { ok: false }, cors);
  }

  /* ---------- routing ---------- */

  async function handle(req, res) {
    const id = randomBytes(6).toString('hex');
    res.setHeader('X-Request-Id', id);

    let path = '/';
    try {
      path = new URL(req.url ?? '/', 'http://relay.invalid').pathname;
    } catch {
      return reply(res, 404, { ok: false, error: 'not_found' });
    }

    const origin = typeof req.headers.origin === 'string' ? req.headers.origin : '';
    const originAllowed = origin !== '' && allowedOrigins.has(origin);
    const cors = originAllowed
      ? {
          'Access-Control-Allow-Origin': origin,
          Vary: 'Origin',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '600',
        }
      : {};
    const ctx = { id, origin, originAllowed, cors };

    if (path === '/health' && (req.method === 'GET' || req.method === 'HEAD')) {
      return reply(res, 200, { ok: true });
    }

    if (path === '/contact' && req.method === 'OPTIONS') {
      if (origin && !originAllowed) return reply(res, 403, { ok: false, error: 'forbidden_origin' });
      return reply(res, 204, undefined, origin ? cors : { Allow: 'POST, OPTIONS' });
    }

    if (path === '/contact' && req.method === 'POST') {
      return handleContact(req, res, ctx);
    }

    return reply(res, 404, { ok: false, error: 'not_found' });
  }

  const server = http.createServer((req, res) => {
    handle(req, res).catch((err) => {
      log.error('internal_error', { name: err?.name ?? 'Error' });
      reply(res, 500, { ok: false, error: 'internal' });
    });
  });

  // Slow-client protection.
  server.headersTimeout = 10_000;
  server.requestTimeout = 15_000;
  server.keepAliveTimeout = 5_000;
  server.maxHeadersCount = 50;

  return server;
}

/* ---------- process entry point ---------- */

export function main(env = process.env) {
  const { config, warnings } = loadConfigFromEnv(env);
  const log = defaultLogger;
  for (const warning of warnings) log.warn('config', { note: warning });

  const server = createServer(config);
  server.listen(config.port, config.host, () => {
    log.info('listening', { host: config.host, port: config.port, origins: config.allowedOrigins.length });
  });

  const stop = (signal) => {
    log.info('stopping', { signal });
    server.close(() => process.exit(0));
    server.closeIdleConnections();
    setTimeout(() => process.exit(0), 5000).unref();
  };
  process.once('SIGTERM', () => stop('SIGTERM'));
  process.once('SIGINT', () => stop('SIGINT'));
  return server;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
