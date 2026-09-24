/**
 * Configuration: defaults, normalisation, and loading from environment variables.
 *
 * `loadConfigFromEnv(env)` turns environment variables into a plain config object plus a list of
 * human-readable warnings. `resolveConfig(input)` fills in defaults for a (possibly partial)
 * config object; `createServer` calls it, so tests can pass only what they care about.
 *
 * Nothing here logs. Secrets (SMTP_PASS, TELEGRAM_BOT_TOKEN) only ever live inside the returned
 * config object and are never included in warnings.
 */

export const DEFAULT_PROD_ORIGINS = ['https://www.sudaverse.com', 'https://sudaverse.com'];
export const DEFAULT_DEV_ORIGINS = ['http://localhost:4321', 'http://127.0.0.1:8090'];

export const DEFAULT_MAIL_FROM = 'Sudaverse website <no-reply@sudaverse.com>';
export const DEFAULT_MAIL_TO = 'info@sudaverse.com';

const E164 = /^\+[1-9]\d{6,14}$/;

/** Normalise an origin string ("https://Example.com/" -> "https://example.com"). Null if unusable. */
export function normalizeOrigin(value) {
  try {
    const url = new URL(String(value).trim());
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    return url.origin;
  } catch {
    return null;
  }
}

function origins(list) {
  const out = [];
  for (const item of list) {
    const origin = normalizeOrigin(item);
    if (origin && !out.includes(origin)) out.push(origin);
  }
  return out;
}

function splitList(value) {
  return String(value ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Fill defaults into a (possibly partial) config object.
 * Channels are `null` unless configured, so "enabled" simply means "not null".
 */
export function resolveConfig(input = {}) {
  const rate = input.rateLimit ?? {};
  const smtp = input.smtp ?? null;
  const signal = input.signal ?? null;
  const telegram = input.telegram ?? null;
  return {
    port: input.port ?? 8787,
    host: input.host ?? '0.0.0.0',
    allowedOrigins: origins(input.allowedOrigins ?? DEFAULT_PROD_ORIGINS),
    trustProxy: Number.isInteger(input.trustProxy) && input.trustProxy > 0 ? input.trustProxy : 0,
    rateLimit: { max: rate.max ?? 5, windowMs: rate.windowMs ?? 10 * 60 * 1000 },
    maxBodyBytes: input.maxBodyBytes ?? 16384,
    timeoutMs: input.timeoutMs ?? 10_000,
    mailFrom: input.mailFrom ?? DEFAULT_MAIL_FROM,
    mailTo: (Array.isArray(input.mailTo) ? input.mailTo : splitList(input.mailTo ?? DEFAULT_MAIL_TO)),
    smtp: smtp
      ? {
          host: smtp.host,
          port: smtp.port ?? 587,
          secure: Boolean(smtp.secure),
          user: smtp.user || '',
          pass: smtp.pass || '',
          // Refuse to send credentials or mail in clear text unless explicitly allowed.
          requireTLS: smtp.requireTLS ?? !smtp.secure,
        }
      : null,
    telegram: telegram ? { token: telegram.token, chatId: String(telegram.chatId) } : null,
    signal: signal
      ? {
          url: String(signal.url).replace(/\/+$/, ''),
          number: signal.number,
          recipients: [...signal.recipients],
        }
      : null,
    logger: input.logger ?? defaultLogger,
  };
}

/** Names of the channels that are enabled in a resolved config. */
export function enabledChannels(config) {
  const names = [];
  if (config.smtp) names.push('email');
  if (config.telegram) names.push('telegram');
  if (config.signal) names.push('signal');
  return names;
}

/** JSON-lines logger. Callers only ever pass ids, channel names and status codes. */
export const defaultLogger = {
  info: (event, fields = {}) => write('info', event, fields),
  warn: (event, fields = {}) => write('warn', event, fields),
  error: (event, fields = {}) => write('error', event, fields),
};

function write(level, event, fields) {
  const line = JSON.stringify({ t: new Date().toISOString(), level, event, ...fields });
  (level === 'info' ? process.stdout : process.stderr).write(line + '\n');
}

/** Read environment variables into `{ config, warnings }`. */
export function loadConfigFromEnv(env = process.env) {
  const warnings = [];
  const str = (name) => (env[name] ?? '').trim();

  const int = (name, fallback, { min = 1, max = Number.MAX_SAFE_INTEGER } = {}) => {
    const raw = str(name);
    if (!raw) return fallback;
    const n = Number(raw);
    if (!Number.isInteger(n) || n < min || n > max) {
      warnings.push(`${name} is not a valid integer between ${min} and ${max}; using ${fallback}`);
      return fallback;
    }
    return n;
  };

  const bool = (name, fallback) => {
    const raw = str(name).toLowerCase();
    if (!raw) return fallback;
    if (['1', 'true', 'yes', 'on'].includes(raw)) return true;
    if (['0', 'false', 'no', 'off'].includes(raw)) return false;
    warnings.push(`${name} is not a boolean (use true or false); using ${fallback}`);
    return fallback;
  };

  const production = str('NODE_ENV') === 'production';

  /* ---------- origins ---------- */
  const rawOrigins = splitList(env.ALLOWED_ORIGINS);
  let allowedOrigins;
  if (rawOrigins.length) {
    allowedOrigins = [];
    for (const item of rawOrigins) {
      const origin = item === '*' ? null : normalizeOrigin(item);
      if (origin) allowedOrigins.push(origin);
      else warnings.push('ALLOWED_ORIGINS contains an entry that is not a valid http(s) origin (wildcards are not supported); ignoring it');
    }
    if (!allowedOrigins.length) warnings.push('ALLOWED_ORIGINS has no usable entries, so every browser POST will be rejected');
  } else {
    allowedOrigins = production ? DEFAULT_PROD_ORIGINS : [...DEFAULT_PROD_ORIGINS, ...DEFAULT_DEV_ORIGINS];
  }

  /* ---------- proxy and limits ---------- */
  let trustProxy = 0;
  const rawProxy = str('TRUST_PROXY').toLowerCase();
  if (rawProxy) {
    if (['true', 'yes', 'on'].includes(rawProxy)) trustProxy = 1;
    else if (['false', 'no', 'off', '0'].includes(rawProxy)) trustProxy = 0;
    else if (/^\d+$/.test(rawProxy) && Number(rawProxy) <= 10) trustProxy = Number(rawProxy);
    else warnings.push('TRUST_PROXY must be 1 (one proxy in front) or a small number of hops; not trusting X-Forwarded-For');
  }

  const rateLimit = {
    max: int('RATE_LIMIT', 5, { max: 10_000 }),
    windowMs: int('RATE_WINDOW_SECONDS', 600, { max: 86_400 }) * 1000,
  };

  /* ---------- email ---------- */
  const mailFrom = str('MAIL_FROM') || DEFAULT_MAIL_FROM;
  const mailTo = splitList(env.MAIL_TO ?? '');
  let smtp = null;
  if (str('SMTP_HOST')) {
    const secure = bool('SMTP_SECURE', false);
    const port = int('SMTP_PORT', secure ? 465 : 587, { max: 65535 });
    const user = str('SMTP_USER');
    const pass = env.SMTP_PASS ?? '';
    if (Boolean(user) !== Boolean(pass)) warnings.push('SMTP_USER and SMTP_PASS should be set together; sending without authentication');
    if (port === 465 && !secure) warnings.push('SMTP_PORT is 465 but SMTP_SECURE is not true; port 465 normally needs SMTP_SECURE=true');
    if (/[\r\n]/.test(mailFrom)) warnings.push('MAIL_FROM contains a line break; email disabled');
    else {
      smtp = {
        host: str('SMTP_HOST'),
        port,
        secure,
        user: user && pass ? user : '',
        pass: user && pass ? pass : '',
        requireTLS: bool('SMTP_REQUIRE_TLS', !secure),
      };
    }
  } else if (str('SMTP_USER') || str('SMTP_PASS')) {
    warnings.push('SMTP_USER or SMTP_PASS is set but SMTP_HOST is not; email is disabled');
  }

  /* ---------- telegram ---------- */
  let telegram = null;
  const token = str('TELEGRAM_BOT_TOKEN');
  const chatId = str('TELEGRAM_CHAT_ID');
  if (token && chatId) telegram = { token, chatId };
  else if (token || chatId) warnings.push('Telegram needs both TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID; it is disabled');

  /* ---------- signal ---------- */
  let signal = null;
  const signalUrl = str('SIGNAL_API_URL');
  const signalNumber = str('SIGNAL_NUMBER');
  const signalRecipients = splitList(env.SIGNAL_RECIPIENTS);
  if (signalUrl || signalNumber || signalRecipients.length) {
    const urlOk = /^https?:\/\//i.test(signalUrl);
    const numbersOk = E164.test(signalNumber) && signalRecipients.length > 0 && signalRecipients.every((n) => E164.test(n));
    if (urlOk && numbersOk) signal = { url: signalUrl, number: signalNumber, recipients: signalRecipients };
    else warnings.push('Signal needs SIGNAL_API_URL (http or https), SIGNAL_NUMBER and SIGNAL_RECIPIENTS, with numbers in E.164 form (a plus sign, country code and number, no spaces); it is disabled');
  }

  const config = {
    port: int('PORT', 8787, { max: 65535 }),
    host: str('HOST') || '0.0.0.0',
    allowedOrigins,
    trustProxy,
    rateLimit,
    maxBodyBytes: int('MAX_BODY_BYTES', 16384, { min: 256, max: 1_048_576 }),
    mailFrom,
    mailTo: mailTo.length ? mailTo : [DEFAULT_MAIL_TO],
    smtp,
    telegram,
    signal,
  };
  return { config, warnings };
}
