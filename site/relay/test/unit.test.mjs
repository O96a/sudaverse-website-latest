/**
 * Unit tests for the pure parts: environment parsing, the rate limiter, address handling and
 * formatting. All values are placeholders.
 */

import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { enabledChannels, loadConfigFromEnv, resolveConfig } from '../lib/config.mjs';
import { buildHtml, buildSubject, buildText, escapeHtml, truncate } from '../lib/format.mjs';
import { clientIp, createRateLimiter, ipKey } from '../lib/ratelimit.mjs';
import { TOPICS, validateContact } from '../lib/validate.mjs';

describe('loadConfigFromEnv', () => {
  test('defaults outside production include the local dev origins', () => {
    const { config, warnings } = loadConfigFromEnv({});
    assert.deepEqual(config.allowedOrigins, [
      'https://www.sudaverse.com',
      'https://sudaverse.com',
      'http://localhost:4321',
      'http://127.0.0.1:8090',
    ]);
    assert.equal(config.port, 8787);
    assert.equal(config.maxBodyBytes, 16384);
    assert.deepEqual(config.rateLimit, { max: 5, windowMs: 600_000 });
    assert.equal(config.trustProxy, 0);
    assert.deepEqual(config.mailTo, ['info@sudaverse.com']);
    assert.equal(config.smtp, null);
    assert.equal(config.telegram, null);
    assert.equal(config.signal, null);
    assert.deepEqual(warnings, []);
  });

  test('in production only the two site origins are allowed by default', () => {
    const { config } = loadConfigFromEnv({ NODE_ENV: 'production' });
    assert.deepEqual(config.allowedOrigins, ['https://www.sudaverse.com', 'https://sudaverse.com']);
  });

  test('ALLOWED_ORIGINS replaces the defaults, is normalised, and rejects wildcards', () => {
    const { config, warnings } = loadConfigFromEnv({ ALLOWED_ORIGINS: ' https://A.example/ , *, not a url, http://localhost:3000 ' });
    assert.deepEqual(config.allowedOrigins, ['https://a.example', 'http://localhost:3000']);
    assert.equal(warnings.length, 2);
  });

  test('numbers and switches are parsed, and bad values fall back with a warning', () => {
    const ok = loadConfigFromEnv({ PORT: '9000', RATE_LIMIT: '20', MAX_BODY_BYTES: '4096', TRUST_PROXY: '1', RATE_WINDOW_SECONDS: '60' });
    assert.equal(ok.config.port, 9000);
    assert.deepEqual(ok.config.rateLimit, { max: 20, windowMs: 60_000 });
    assert.equal(ok.config.maxBodyBytes, 4096);
    assert.equal(ok.config.trustProxy, 1);

    const bad = loadConfigFromEnv({ PORT: 'abc', RATE_LIMIT: '-3', MAX_BODY_BYTES: '12', TRUST_PROXY: 'maybe' });
    assert.equal(bad.config.port, 8787);
    assert.equal(bad.config.rateLimit.max, 5);
    assert.equal(bad.config.maxBodyBytes, 16384);
    assert.equal(bad.config.trustProxy, 0);
    assert.equal(bad.warnings.length, 4);

    assert.equal(loadConfigFromEnv({ TRUST_PROXY: 'true' }).config.trustProxy, 1);
    assert.equal(loadConfigFromEnv({ TRUST_PROXY: '2' }).config.trustProxy, 2);
    assert.equal(loadConfigFromEnv({ TRUST_PROXY: '0' }).config.trustProxy, 0);
  });

  test('email is enabled by SMTP_HOST alone, with STARTTLS defaults', () => {
    const { config } = loadConfigFromEnv({ SMTP_HOST: 'smtp.example.net', SMTP_USER: 'u', SMTP_PASS: 'p' });
    assert.deepEqual(config.smtp, { host: 'smtp.example.net', port: 587, secure: false, user: 'u', pass: 'p', requireTLS: true });
    assert.equal(config.mailFrom, 'Sudaverse website <no-reply@sudaverse.com>');
  });

  test('SMTP_SECURE=true means implicit TLS on 465 and MAIL_TO may list several addresses', () => {
    const { config, warnings } = loadConfigFromEnv({
      SMTP_HOST: 'smtp.example.net',
      SMTP_SECURE: 'true',
      MAIL_FROM: 'Site <site@example.org>',
      MAIL_TO: 'a@example.org, b@example.org',
    });
    assert.equal(config.smtp.secure, true);
    assert.equal(config.smtp.port, 465);
    assert.equal(config.smtp.requireTLS, false);
    assert.equal(config.mailFrom, 'Site <site@example.org>');
    assert.deepEqual(config.mailTo, ['a@example.org', 'b@example.org']);
    assert.deepEqual(warnings, []);
  });

  test('warns about port 465 without SMTP_SECURE, and half-set credentials', () => {
    const { config, warnings } = loadConfigFromEnv({ SMTP_HOST: 'h', SMTP_PORT: '465', SMTP_USER: 'u' });
    assert.equal(config.smtp.user, '', 'no authentication is attempted with half a credential');
    assert.equal(warnings.length, 2);
  });

  test('SMTP credentials without a host do not enable email', () => {
    const { config, warnings } = loadConfigFromEnv({ SMTP_USER: 'u', SMTP_PASS: 'p' });
    assert.equal(config.smtp, null);
    assert.equal(warnings.length, 1);
  });

  test('Telegram needs both variables', () => {
    assert.deepEqual(loadConfigFromEnv({ TELEGRAM_BOT_TOKEN: 't', TELEGRAM_CHAT_ID: '1' }).config.telegram, { token: 't', chatId: '1' });
    const half = loadConfigFromEnv({ TELEGRAM_BOT_TOKEN: 't' });
    assert.equal(half.config.telegram, null);
    assert.equal(half.warnings.length, 1);
  });

  test('Signal needs a URL, a sender and recipients, all in E.164 form', () => {
    const good = loadConfigFromEnv({
      SIGNAL_API_URL: 'http://signal:8080',
      SIGNAL_NUMBER: '+15550100001',
      SIGNAL_RECIPIENTS: '+15550100002, +15550100003',
    });
    assert.deepEqual(good.config.signal, {
      url: 'http://signal:8080',
      number: '+15550100001',
      recipients: ['+15550100002', '+15550100003'],
    });
    for (const env of [
      { SIGNAL_API_URL: 'http://signal:8080', SIGNAL_NUMBER: '+15550100001' },
      { SIGNAL_API_URL: 'http://signal:8080', SIGNAL_NUMBER: '15550100001', SIGNAL_RECIPIENTS: '+15550100002' },
      { SIGNAL_API_URL: 'signal:8080', SIGNAL_NUMBER: '+15550100001', SIGNAL_RECIPIENTS: '+15550100002' },
      { SIGNAL_API_URL: 'http://signal:8080', SIGNAL_NUMBER: '+15550100001', SIGNAL_RECIPIENTS: '+15550100002,oops' },
    ]) {
      const r = loadConfigFromEnv(env);
      assert.equal(r.config.signal, null);
      assert.equal(r.warnings.length, 1);
    }
  });

  test('warnings never contain secret values', () => {
    const env = {
      SMTP_HOST: 'h',
      SMTP_PORT: '465',
      SMTP_USER: 'the-user',
      SMTP_PASS: 'the-secret-pass',
      TELEGRAM_BOT_TOKEN: 'the-secret-token',
      SIGNAL_API_URL: 'nope',
      SIGNAL_NUMBER: '+15550100001',
      SIGNAL_RECIPIENTS: '+15550100002',
    };
    const { warnings } = loadConfigFromEnv(env);
    assert.ok(warnings.length >= 2);
    const text = warnings.join('\n');
    for (const secret of ['the-secret-pass', 'the-secret-token', '+15550100001', 'the-user']) assert.equal(text.includes(secret), false);
  });
});

describe('resolveConfig / enabledChannels', () => {
  test('fills defaults and reports enabled channels', () => {
    const config = resolveConfig({});
    assert.equal(config.timeoutMs, 10_000);
    assert.deepEqual(config.allowedOrigins, ['https://www.sudaverse.com', 'https://sudaverse.com']);
    assert.deepEqual(enabledChannels(config), []);
    const all = resolveConfig({
      smtp: { host: 'h' },
      telegram: { token: 't', chatId: 1 },
      signal: { url: 'http://s/', number: '+15550100001', recipients: ['+15550100002'] },
    });
    assert.deepEqual(enabledChannels(all), ['email', 'telegram', 'signal']);
    assert.equal(all.signal.url, 'http://s');
    assert.equal(all.telegram.chatId, '1');
  });
});

describe('rate limiter', () => {
  test('allows `max` hits per window and frees up as the window slides', () => {
    let now = 1_000_000;
    const limiter = createRateLimiter({ max: 3, windowMs: 10_000, now: () => now });
    assert.equal(limiter.hit('a').allowed, true);
    now += 1000;
    assert.equal(limiter.hit('a').allowed, true);
    now += 1000;
    assert.equal(limiter.hit('a').allowed, true);
    now += 1000;
    const blocked = limiter.hit('a');
    assert.equal(blocked.allowed, false);
    assert.equal(blocked.retryAfterSeconds, 7);
    assert.equal(limiter.hit('b').allowed, true, 'other keys are independent');
    now += 7000; // the first hit (t=0) is now 10 s old
    assert.equal(limiter.hit('a').allowed, true);
  });

  test('forgets keys once their window has passed', () => {
    let now = 0;
    const limiter = createRateLimiter({ max: 1, windowMs: 1000, now: () => now });
    for (let i = 0; i < 50; i++) limiter.hit(`k${i}`);
    assert.equal(limiter.size(), 50);
    now += 5000;
    limiter.hit('fresh');
    // Pruning happens lazily when the table is full; a fresh hit on an expired key resets it.
    assert.equal(limiter.hit('k1').allowed, true);
  });
});

describe('client address', () => {
  const req = (remoteAddress, xff) => ({ socket: { remoteAddress }, headers: xff === undefined ? {} : { 'x-forwarded-for': xff } });

  test('uses the socket address unless a proxy is trusted', () => {
    assert.equal(clientIp(req('10.0.0.5', '1.2.3.4'), 0), '10.0.0.5');
  });

  test('takes the entry the trusted proxy appended, counting from the right', () => {
    assert.equal(clientIp(req('10.0.0.5', '9.9.9.9, 1.2.3.4'), 1), '1.2.3.4');
    assert.equal(clientIp(req('10.0.0.5', '9.9.9.9, 1.2.3.4, 10.1.1.1'), 2), '1.2.3.4');
  });

  test('falls back to the socket when the header is missing, too short or not an address', () => {
    assert.equal(clientIp(req('10.0.0.5'), 1), '10.0.0.5');
    assert.equal(clientIp(req('10.0.0.5', '1.2.3.4'), 2), '10.0.0.5');
    assert.equal(clientIp(req('10.0.0.5', 'garbage'), 1), '10.0.0.5');
  });

  test('IPv4-mapped IPv6 collapses to IPv4, and IPv6 keys by /64', () => {
    assert.equal(ipKey('::ffff:192.0.2.1'), '192.0.2.1');
    assert.equal(ipKey('192.0.2.1'), '192.0.2.1');
    assert.equal(ipKey('2001:db8:1:2:aaaa:bbbb:cccc:dddd'), ipKey('2001:0db8:0001:0002::1'));
    assert.notEqual(ipKey('2001:db8:1:2::1'), ipKey('2001:db8:1:3::1'));
  });
});

describe('validateContact', () => {
  const base = { name: 'A', email: 'a@example.org', topic: 'other', message: 'm' };

  test('accepts every documented topic key', () => {
    for (const topic of TOPICS) assert.equal(validateContact({ ...base, topic }).ok, true, topic);
    assert.deepEqual(TOPICS, ['product', 'institutional', 'research', 'data', 'integration', 'other']);
  });

  test('accepts realistic addresses and rejects malformed ones', () => {
    for (const email of ['a@example.org', 'first.last+tag@sub.example.co.uk', "o'brien@example.ie", 'user@مثال.السعودية', 'x@y.io']) {
      assert.equal(validateContact({ ...base, email }).ok, true, email);
    }
    for (const email of ['', 'a', 'a@', '@b.co', 'a@b', 'a@b.c', 'a b@c.co', 'a@b..co', 'a@.co', 'a@b.co.', '<a@b.co>', 'a@b.co,c@d.co', 'a@b.co;c@d.co', '"a"@b.co', 'a@b.co\n']) {
      const result = validateContact({ ...base, email });
      // A trailing newline is trimmed away, so that one is valid; everything else must fail.
      assert.equal(result.ok, email === 'a@b.co\n', JSON.stringify(email));
    }
  });

  test('the sanitised value has single-line name and organization and normalised newlines', () => {
    const result = validateContact({ ...base, name: 'A\r\nB', organization: 'C\nD', message: 'x\r\ny\rz' });
    assert.equal(result.value.name, 'A B');
    assert.equal(result.value.organization, 'C D');
    assert.equal(result.value.message, 'x\ny\nz');
    assert.equal(result.value.topicLabel, 'Other');
  });
});

describe('formatting', () => {
  const value = { name: 'N', organization: '', email: 'e@example.org', topic: 'data', topicLabel: 'Data or model collaboration', message: 'M', locale: 'en' };

  test('escapeHtml covers the five significant characters', () => {
    assert.equal(escapeHtml(`<>&"'`), '&lt;&gt;&amp;&quot;&#39;');
  });

  test('subject, text and html', () => {
    assert.equal(buildSubject(value), '[Website] Data or model collaboration: N');
    assert.match(buildText(value), /Organization: -/);
    assert.match(buildHtml({ ...value, message: '<i>x</i>' }), /&lt;i&gt;x&lt;\/i&gt;/);
  });

  test('truncate and maxLength keep summaries within bounds', () => {
    assert.equal(truncate('abcdef', 4), 'abc…');
    assert.equal(truncate('abc', 4), 'abc');
    const long = buildText({ ...value, message: 'z'.repeat(9000) }, { maxLength: 500 });
    assert.ok(long.length <= 500);
    assert.match(long, /^New message from the Sudaverse website/);
  });
});
