/**
 * Telegram and Signal channels with a mocked global fetch, plus how the relay combines channels:
 * partial delivery, total failure, timeouts, and the "nothing configured" answer.
 * The test client uses node:http, so replacing globalThis.fetch does not affect it.
 */

import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import {
  MAIL_FROM,
  MAIL_TO,
  SIGNAL,
  TELEGRAM,
  closedPort,
  contact,
  jsonResponse,
  mockFetch,
  smtpConfig,
  startRelay,
  startSmtp,
} from './support/harness.mjs';

const TELEGRAM_URL = `https://api.telegram.org/bot${TELEGRAM.token}/sendMessage`;
const SIGNAL_URL = 'http://signal:8080/v2/send';

/** Run `fn` with a mocked fetch and a fresh relay; always restores and closes. */
async function withRelay(config, handler, fn) {
  const mock = mockFetch(handler);
  const relay = await startRelay(config);
  try {
    return await fn({ relay, calls: mock.calls });
  } finally {
    mock.restore();
    await relay.close();
  }
}

describe('Telegram channel', () => {
  test('posts the summary to the Bot API sendMessage endpoint', async () => {
    await withRelay(
      { telegram: TELEGRAM },
      () => jsonResponse(200, { ok: true, result: { message_id: 1 } }),
      async ({ relay, calls }) => {
        const res = await relay.post(contact({ locale: 'ar' }));
        assert.equal(res.status, 200);
        assert.deepEqual(res.json, { ok: true, delivered: ['telegram'] });

        assert.equal(calls.length, 1);
        const [call] = calls;
        assert.equal(call.url, TELEGRAM_URL);
        assert.equal(call.init.method, 'POST');
        assert.equal(call.init.headers['Content-Type'], 'application/json');
        assert.equal(call.body.chat_id, TELEGRAM.chatId);
        assert.equal(call.body.parse_mode, undefined, 'plain text: no parse_mode, so no markup is interpreted');
        assert.match(call.body.text, /Name: Ada Lovelace/);
        assert.match(call.body.text, /Organization: Analytical Engines Ltd/);
        assert.match(call.body.text, /Email: ada@example\.org/);
        assert.match(call.body.text, /Topic: Product inquiry/);
        assert.match(call.body.text, /Locale: ar/);
        assert.match(call.body.text, /Hello, we would like a demo of the platform\./);
      },
    );
  });

  test('sends markup characters through unchanged (plain text, nothing to escape)', async () => {
    await withRelay({ telegram: TELEGRAM }, () => jsonResponse(200, { ok: true }), async ({ relay, calls }) => {
      await relay.post(contact({ message: '<b>bold</b> & <a href="x">link</a>' }));
      assert.match(calls[0].body.text, /<b>bold<\/b> & <a href="x">link<\/a>/);
      assert.equal(calls[0].body.parse_mode, undefined);
    });
  });

  test('keeps the text within the Telegram 4096 character limit', async () => {
    await withRelay({ telegram: TELEGRAM }, () => jsonResponse(200, { ok: true }), async ({ relay, calls }) => {
      const res = await relay.post(contact({ message: 'x'.repeat(5000) }));
      assert.equal(res.status, 200);
      assert.ok(calls[0].body.text.length <= 4096, `text was ${calls[0].body.text.length}`);
    });
  });

  test('an HTTP error from Telegram is a failed delivery, reported as 502 with a status-only log', async () => {
    await withRelay(
      { telegram: TELEGRAM },
      () => jsonResponse(401, { ok: false, description: 'Unauthorized' }),
      async ({ relay }) => {
        const res = await relay.post(contact());
        assert.equal(res.status, 502);
        assert.deepEqual(res.json, { ok: false });
        const failure = relay.logs.find((l) => l.event === 'channel' && l.channel === 'telegram');
        assert.equal(failure.ok, false);
        assert.equal(failure.reason, 'http_401');
        assert.equal(JSON.stringify(relay.logs).includes(TELEGRAM.token), false, 'the bot token is never logged');
      },
    );
  });

  test('a 200 answer carrying ok:false is still a failure', async () => {
    await withRelay({ telegram: TELEGRAM }, () => jsonResponse(200, { ok: false }), async ({ relay }) => {
      const res = await relay.post(contact());
      assert.equal(res.status, 502);
    });
  });

  test('a network error is a failed delivery and does not leak into the log', async () => {
    await withRelay(
      { telegram: TELEGRAM },
      () => {
        throw new TypeError(`fetch failed for ${TELEGRAM_URL}`);
      },
      async ({ relay }) => {
        const res = await relay.post(contact());
        assert.equal(res.status, 502);
        const failure = relay.logs.find((l) => l.event === 'channel');
        assert.equal(failure.reason, 'network');
        assert.equal(JSON.stringify(relay.logs).includes(TELEGRAM.token), false);
      },
    );
  });

  test('gives up after the timeout when the API hangs and ignores the abort signal', async () => {
    await withRelay(
      { telegram: TELEGRAM, timeoutMs: 150 },
      () => new Promise(() => {}),
      async ({ relay }) => {
        const started = Date.now();
        const res = await relay.post(contact());
        assert.equal(res.status, 502);
        assert.ok(Date.now() - started < 3000);
        assert.equal(relay.logs.find((l) => l.event === 'channel').reason, 'timeout');
      },
    );
  });

  test('aborts the request when the timeout fires', async () => {
    let aborted = false;
    await withRelay(
      { telegram: TELEGRAM, timeoutMs: 150 },
      (_url, init) =>
        new Promise((_, reject) => {
          init.signal.addEventListener('abort', () => {
            aborted = true;
            reject(Object.assign(new Error('aborted'), { name: 'AbortError' }));
          });
        }),
      async ({ relay }) => {
        const res = await relay.post(contact());
        assert.equal(res.status, 502);
        assert.equal(aborted, true);
      },
    );
  });
});

describe('Signal channel (signal-cli-rest-api)', () => {
  test('posts {message, number, recipients} to /v2/send', async () => {
    await withRelay({ signal: SIGNAL }, () => jsonResponse(201, { timestamp: '1' }), async ({ relay, calls }) => {
      const res = await relay.post(contact());
      assert.equal(res.status, 200);
      assert.deepEqual(res.json, { ok: true, delivered: ['signal'] });

      assert.equal(calls.length, 1);
      const [call] = calls;
      assert.equal(call.url, SIGNAL_URL);
      assert.equal(call.init.method, 'POST');
      assert.equal(call.init.headers['Content-Type'], 'application/json');
      assert.deepEqual(Object.keys(call.body).sort(), ['message', 'number', 'recipients']);
      assert.equal(call.body.number, SIGNAL.number);
      assert.deepEqual(call.body.recipients, SIGNAL.recipients);
      assert.match(call.body.message, /Name: Ada Lovelace/);
      assert.match(call.body.message, /Email: ada@example\.org/);
      assert.match(call.body.message, /Topic: Product inquiry/);
      assert.match(call.body.message, /Hello, we would like a demo of the platform\./);
    });
  });

  test('tolerates a trailing slash on SIGNAL_API_URL', async () => {
    await withRelay(
      { signal: { ...SIGNAL, url: 'http://signal:8080/' } },
      () => jsonResponse(201, {}),
      async ({ relay, calls }) => {
        await relay.post(contact());
        assert.equal(calls[0].url, SIGNAL_URL);
      },
    );
  });

  test('an error status from the gateway is a failed delivery', async () => {
    await withRelay({ signal: SIGNAL }, () => jsonResponse(400, { error: 'nope' }), async ({ relay }) => {
      const res = await relay.post(contact());
      assert.equal(res.status, 502);
      assert.deepEqual(res.json, { ok: false });
      assert.equal(relay.logs.find((l) => l.event === 'channel').reason, 'http_400');
    });
  });

  test('an unreachable gateway is a failed delivery', async () => {
    await withRelay(
      { signal: SIGNAL },
      () => {
        throw new TypeError('fetch failed');
      },
      async ({ relay }) => {
        assert.equal((await relay.post(contact())).status, 502);
      },
    );
  });
});

describe('combining channels', () => {
  test('email fails, Telegram succeeds: 200 with delivered [telegram]', async () => {
    const port = await closedPort();
    await withRelay(
      { smtp: smtpConfig(port), telegram: TELEGRAM },
      (url) => (url === TELEGRAM_URL ? jsonResponse(200, { ok: true }) : jsonResponse(500, {})),
      async ({ relay }) => {
        const res = await relay.post(contact());
        assert.equal(res.status, 200);
        assert.deepEqual(res.json, { ok: true, delivered: ['telegram'] });
        const email = relay.logs.find((l) => l.event === 'channel' && l.channel === 'email');
        assert.equal(email.ok, false);
        assert.match(email.reason, /^[A-Z_]+$/, 'only an error code is logged, not the message');
      },
    );
  });

  test('Telegram fails, email succeeds: 200 with delivered [email]', async () => {
    const smtp = await startSmtp();
    try {
      await withRelay(
        { smtp: smtpConfig(smtp.port), telegram: TELEGRAM, mailFrom: MAIL_FROM, mailTo: MAIL_TO },
        () => jsonResponse(500, { ok: false }),
        async ({ relay }) => {
          const res = await relay.post(contact());
          assert.equal(res.status, 200);
          assert.deepEqual(res.json, { ok: true, delivered: ['email'] });
          assert.equal(smtp.messages.length, 1);
        },
      );
    } finally {
      await smtp.close();
    }
  });

  test('every channel succeeds: all are reported, in order, and all are sent in parallel', async () => {
    const smtp = await startSmtp();
    try {
      await withRelay(
        { smtp: smtpConfig(smtp.port), telegram: TELEGRAM, signal: SIGNAL },
        (url) => (url === SIGNAL_URL ? jsonResponse(201, {}) : jsonResponse(200, { ok: true })),
        async ({ relay, calls }) => {
          const res = await relay.post(contact());
          assert.equal(res.status, 200);
          assert.deepEqual(res.json, { ok: true, delivered: ['email', 'telegram', 'signal'] });
          assert.equal(smtp.messages.length, 1);
          assert.deepEqual(calls.map((c) => c.url).sort(), [SIGNAL_URL, TELEGRAM_URL].sort());
        },
      );
    } finally {
      await smtp.close();
    }
  });

  test('a slow channel does not hold back a fast one beyond the timeout', async () => {
    await withRelay(
      { telegram: TELEGRAM, signal: SIGNAL, timeoutMs: 200 },
      (url) => (url === TELEGRAM_URL ? jsonResponse(200, { ok: true }) : new Promise(() => {})),
      async ({ relay }) => {
        const started = Date.now();
        const res = await relay.post(contact());
        assert.equal(res.status, 200);
        assert.deepEqual(res.json, { ok: true, delivered: ['telegram'] });
        assert.ok(Date.now() - started < 3000);
      },
    );
  });

  test('every enabled channel failing gives 502 {ok:false}', async () => {
    const port = await closedPort();
    await withRelay(
      { smtp: smtpConfig(port), telegram: TELEGRAM, signal: SIGNAL },
      () => jsonResponse(500, {}),
      async ({ relay }) => {
        const res = await relay.post(contact());
        assert.equal(res.status, 502);
        assert.deepEqual(res.json, { ok: false });
        assert.equal(relay.logs.filter((l) => l.event === 'channel' && l.ok === false).length, 3);
      },
    );
  });

  test('nothing configured gives 503 not_configured, and startup warns about it', async () => {
    const relay = await startRelay({});
    try {
      const warning = relay.logs.find((l) => l.level === 'warn' && l.event === 'channels');
      assert.ok(warning, 'a warning is logged at startup');
      assert.deepEqual(warning.enabled, []);

      const res = await relay.post(contact());
      assert.equal(res.status, 503);
      assert.deepEqual(res.json, { ok: false, error: 'not_configured' });
    } finally {
      await relay.close();
    }
  });

  test('startup logs which channels are enabled and never their secrets', async () => {
    const relay = await startRelay({
      smtp: { host: 'smtp.example.net', port: 587, user: 'the-user', pass: 'the-password-value' },
      telegram: { token: 'TOKEN-SECRET-VALUE', chatId: '4242424242' },
      signal: { ...SIGNAL },
    });
    try {
      const startup = relay.logs.find((l) => l.event === 'channels');
      assert.deepEqual(startup.enabled, ['email', 'telegram', 'signal']);
      const logged = JSON.stringify(relay.logs);
      for (const secret of ['the-password-value', 'the-user', 'TOKEN-SECRET-VALUE', '4242424242', SIGNAL.number, SIGNAL.recipients[0]]) {
        assert.equal(logged.includes(secret), false, `startup log must not contain ${secret}`);
      }
    } finally {
      await relay.close();
    }
  });
});
