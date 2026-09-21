/**
 * HTTP behaviour of the relay: routes, validation, honeypot, rate limit, CORS, body limits.
 * A mocked fetch stands in for Telegram so successful requests need no network; `calls` shows
 * whether anything was sent.
 */

import { after, afterEach, before, beforeEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { ORIGIN, TELEGRAM, contact, jsonResponse, mockFetch, startRelay, request } from './support/harness.mjs';

describe('routes', () => {
  let relay;
  before(async () => {
    relay = await startRelay({});
  });
  after(() => relay.close());

  test('GET /health answers {ok:true}', async () => {
    const res = await relay.request('/health');
    assert.equal(res.status, 200);
    assert.deepEqual(res.json, { ok: true });
    assert.match(res.headers['content-type'], /application\/json/);
    assert.equal(res.headers['x-content-type-options'], 'nosniff');
  });

  test('everything else is 404', async () => {
    for (const [method, path] of [
      ['GET', '/'],
      ['GET', '/contact'],
      ['POST', '/health'],
      ['POST', '/contact/extra'],
      ['GET', '/nope'],
      ['DELETE', '/contact'],
      ['PUT', '/contact'],
    ]) {
      const res = await relay.request(path, { method, headers: { Origin: ORIGIN } });
      assert.equal(res.status, 404, `${method} ${path}`);
    }
  });

  test('every answer carries a request id', async () => {
    const res = await relay.request('/health');
    assert.match(res.headers['x-request-id'], /^[0-9a-f]{12}$/);
  });
});

describe('POST /contact', () => {
  let relay;
  let mock;

  beforeEach(async () => {
    mock = mockFetch(() => jsonResponse(200, { ok: true }));
    relay = await startRelay({ telegram: TELEGRAM, rateLimit: { max: 1000, windowMs: 60_000 }, maxBodyBytes: 2048 });
  });
  afterEach(async () => {
    mock.restore();
    await relay.close();
  });

  describe('validation', () => {
    test('a valid contact is accepted and sent', async () => {
      const res = await relay.post(contact());
      assert.equal(res.status, 200);
      assert.equal(mock.calls.length, 1);
    });

    test('only the organization is optional', async () => {
      for (const org of [undefined, null, '', '   ']) {
        const body = contact();
        if (org === undefined) delete body.organization;
        else body.organization = org;
        assert.equal((await relay.post(body)).status, 200, `organization ${JSON.stringify(org)}`);
      }
    });

    test('lists invalid field names and nothing else', async () => {
      const cases = [
        [{}, ['name', 'email', 'topic', 'message']],
        [contact({ name: '' }), ['name']],
        [contact({ name: '   ' }), ['name']],
        [contact({ name: 'x'.repeat(121) }), ['name']],
        [contact({ name: 42 }), ['name']],
        [contact({ organization: 'x'.repeat(161) }), ['organization']],
        [contact({ organization: ['a'] }), ['organization']],
        [contact({ email: 'not-an-email' }), ['email']],
        [contact({ email: 'a@b' }), ['email']],
        [contact({ email: 'a@@b.co' }), ['email']],
        [contact({ email: 'two words@example.org' }), ['email']],
        [contact({ email: 'ada@example.org\r\nBcc: x@example.net' }), ['email']],
        [contact({ email: 'ada@example.org>,<x@example.net' }), ['email']],
        [contact({ email: `${'a'.repeat(245)}@example.org` }), ['email']],
        [contact({ email: null }), ['email']],
        [contact({ topic: 'sales' }), ['topic']],
        [contact({ topic: '' }), ['topic']],
        [contact({ topic: 7 }), ['topic']],
        [contact({ topic: '__proto__' }), ['topic']],
        [contact({ message: '' }), ['message']],
        [contact({ message: '  \n ' }), ['message']],
        [contact({ message: { text: 'hi' } }), ['message']],
        [contact({ name: '', email: 'bad', topic: 'nope', message: '' }), ['name', 'email', 'topic', 'message']],
      ];
      for (const [body, fields] of cases) {
        const res = await relay.post(body);
        assert.equal(res.status, 400, JSON.stringify(body).slice(0, 80));
        assert.deepEqual(res.json, { ok: false, error: 'invalid_fields', fields });
      }
      assert.equal(mock.calls.length, 0, 'nothing is sent for invalid input');
    });

    test('the error never echoes what the visitor submitted', async () => {
      const res = await relay.post(contact({ name: '', email: 'leaky-value@nowhere', message: 'secret-text' }));
      assert.equal(res.status, 400);
      assert.equal(res.text.includes('leaky-value'), false);
      assert.equal(res.text.includes('secret-text'), false);
    });

    test('boundary lengths are accepted', async () => {
      const res = await relay.post(
        contact({ name: 'n'.repeat(120), organization: 'o'.repeat(160), email: `${'a'.repeat(64)}@${'d'.repeat(60)}.example.org`, message: 'm'.repeat(1000) }),
      );
      assert.equal(res.status, 200);
      assert.equal((await relay.post(contact({ message: 'm' }))).status, 200);
    });

    test('a message of exactly 5000 characters is accepted (after the size limit is raised)', async () => {
      await relay.close();
      relay = await startRelay({ telegram: TELEGRAM, rateLimit: { max: 1000, windowMs: 60_000 } });
      assert.equal((await relay.post(contact({ message: 'm'.repeat(5000) }))).status, 200);
      assert.equal((await relay.post(contact({ message: 'm'.repeat(5001) }))).status, 400);
    });

    test('trims fields, and an unknown locale becomes en', async () => {
      const res = await relay.post(contact({ name: '  Ada  ', message: '  hi there  ', locale: 'fr' }));
      assert.equal(res.status, 200);
      assert.match(mock.calls[0].body.text, /Name: Ada\n/);
      assert.match(mock.calls[0].body.text, /Locale: en\n/);
      assert.match(mock.calls[0].body.text, /Message:\nhi there$/);
    });

    test('locale ar is kept, extra fields are ignored', async () => {
      const res = await relay.post({ ...contact({ locale: 'ar' }), admin: true, to: 'x@example.net' });
      assert.equal(res.status, 200);
      assert.match(mock.calls[0].body.text, /Locale: ar/);
      assert.equal(JSON.stringify(mock.calls[0].body).includes('x@example.net'), false);
    });

    test('malformed JSON and non-object JSON are rejected with 400', async () => {
      assert.deepEqual((await relay.post('{"name":')).json, { ok: false, error: 'invalid_json' });
      for (const raw of ['null', '[]', '"text"', '42']) {
        const res = await relay.post(raw);
        assert.equal(res.status, 400, raw);
      }
      assert.equal(mock.calls.length, 0);
    });

    test('a non-JSON content type is rejected with 415', async () => {
      const res = await relay.post(JSON.stringify(contact()), { headers: { 'Content-Type': 'text/plain' } });
      assert.equal(res.status, 415);
      assert.equal(mock.calls.length, 0);
    });

    test('a charset parameter on the JSON content type is fine', async () => {
      const res = await relay.post(JSON.stringify(contact()), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
      assert.equal(res.status, 200);
    });

    test('control characters in single-line fields are neutralised', async () => {
      const name = 'A' + String.fromCharCode(0) + 'B' + String.fromCharCode(0x2028) + 'C' + String.fromCharCode(0x202e) + 'D';
      const res = await relay.post(contact({ name, organization: 'X\r\nY' }));
      assert.equal(res.status, 200);
      const text = mock.calls[0].body.text;
      assert.match(text, /Name: A B C D\n/);
      assert.match(text, /Organization: X Y\n/);
    });
  });

  describe('honeypot', () => {
    test('a filled `website` returns 200 {ok:true} and sends nothing', async () => {
      const res = await relay.post(contact({ website: 'http://spam.example' }));
      assert.equal(res.status, 200);
      assert.deepEqual(res.json, { ok: true });
      assert.equal(mock.calls.length, 0);
    });

    test('it wins even over an otherwise invalid body, so bots learn nothing', async () => {
      const res = await relay.post({ website: 'x' });
      assert.equal(res.status, 200);
      assert.deepEqual(res.json, { ok: true });
      assert.equal(mock.calls.length, 0);
    });

    test('an empty or blank `website` is a normal submission', async () => {
      for (const website of ['', '   ']) {
        const res = await relay.post(contact({ website }));
        assert.deepEqual(res.json, { ok: true, delivered: ['telegram'] });
      }
      assert.equal(mock.calls.length, 2);
    });
  });

  describe('size limit', () => {
    test('a body over MAX_BODY_BYTES is rejected with 413 before it is parsed', async () => {
      const res = await relay.post(contact({ message: 'x'.repeat(4000) }));
      assert.equal(res.status, 413);
      assert.deepEqual(res.json, { ok: false, error: 'payload_too_large' });
      assert.equal(mock.calls.length, 0);
    });

    test('a chunked body without Content-Length is cut off at the limit too', async () => {
      const chunk = 'x'.repeat(700);
      const res = await request(`${relay.url}/contact`, {
        method: 'POST',
        headers: { Origin: ORIGIN, 'Content-Type': 'application/json', 'Transfer-Encoding': 'chunked' },
        chunks: ['{"message":"', chunk, chunk, chunk, chunk, '"}'],
      });
      assert.equal(res.status, 413);
      assert.equal(mock.calls.length, 0);
    });

    test('a body just under the limit is accepted', async () => {
      const res = await relay.post(contact({ message: 'x'.repeat(1500) }));
      assert.equal(res.status, 200);
    });
  });

  describe('CORS and origins', () => {
    test('echoes the origin (and Vary) on answers to an allowed origin', async () => {
      const res = await relay.post(contact());
      assert.equal(res.headers['access-control-allow-origin'], ORIGIN);
      assert.match(res.headers.vary, /Origin/i);
      // Also on error answers, so the browser can read them.
      const bad = await relay.post({});
      assert.equal(bad.status, 400);
      assert.equal(bad.headers['access-control-allow-origin'], ORIGIN);
    });

    test('never answers with a wildcard', async () => {
      const res = await relay.post(contact());
      assert.notEqual(res.headers['access-control-allow-origin'], '*');
    });

    test('POST from another origin is 403, sends nothing and gets no CORS headers', async () => {
      for (const origin of ['https://evil.example', 'https://www.sudaverse.com.evil.example', 'http://www.sudaverse.com', 'https://sudaverse.com:8443', 'null']) {
        const res = await relay.post(contact(), { headers: { Origin: origin } });
        assert.equal(res.status, 403, origin);
        assert.equal(res.headers['access-control-allow-origin'], undefined, origin);
      }
      assert.equal(mock.calls.length, 0);
    });

    test('POST without an Origin header is 403', async () => {
      const res = await request(`${relay.url}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contact()),
      });
      assert.equal(res.status, 403);
      assert.equal(mock.calls.length, 0);
    });

    test('preflight from an allowed origin answers 204 with the CORS headers', async () => {
      const res = await relay.request('/contact', {
        method: 'OPTIONS',
        headers: { Origin: ORIGIN, 'Access-Control-Request-Method': 'POST', 'Access-Control-Request-Headers': 'content-type' },
      });
      assert.equal(res.status, 204);
      assert.equal(res.headers['access-control-allow-origin'], ORIGIN);
      assert.match(res.headers['access-control-allow-methods'], /POST/);
      assert.match(res.headers['access-control-allow-headers'], /Content-Type/i);
      assert.equal(res.text, '');
    });

    test('preflight from another origin is 403 without CORS headers', async () => {
      const res = await relay.request('/contact', {
        method: 'OPTIONS',
        headers: { Origin: 'https://evil.example', 'Access-Control-Request-Method': 'POST' },
      });
      assert.equal(res.status, 403);
      assert.equal(res.headers['access-control-allow-origin'], undefined);
    });

    test('OPTIONS on other paths is 404', async () => {
      const res = await relay.request('/elsewhere', { method: 'OPTIONS', headers: { Origin: ORIGIN } });
      assert.equal(res.status, 404);
    });

    test('an origin list is exact: configured origins are allowed, others are not', async () => {
      await relay.close();
      relay = await startRelay({ telegram: TELEGRAM, allowedOrigins: ['https://a.example', 'http://localhost:4321/'] });
      assert.equal((await relay.post(contact(), { headers: { Origin: 'https://a.example' } })).status, 200);
      assert.equal((await relay.post(contact(), { headers: { Origin: 'http://localhost:4321' } })).status, 200);
      assert.equal((await relay.post(contact(), { headers: { Origin: ORIGIN } })).status, 403);
    });
  });
});

describe('rate limit', () => {
  let mock;
  beforeEach(() => {
    mock = mockFetch(() => jsonResponse(200, { ok: true }));
  });
  afterEach(() => mock.restore());

  test('the 6th request from one address inside the window is 429 with Retry-After', async () => {
    const relay = await startRelay({ telegram: TELEGRAM, rateLimit: { max: 5, windowMs: 600_000 } });
    try {
      for (let i = 0; i < 5; i++) assert.equal((await relay.post(contact())).status, 200, `request ${i + 1}`);
      const res = await relay.post(contact());
      assert.equal(res.status, 429);
      assert.deepEqual(res.json, { ok: false, error: 'rate_limited' });
      assert.ok(Number(res.headers['retry-after']) > 0 && Number(res.headers['retry-after']) <= 600);
      assert.equal(res.headers['access-control-allow-origin'], ORIGIN);
      assert.equal(mock.calls.length, 5, 'the limited request sent nothing');
    } finally {
      await relay.close();
    }
  });

  test('invalid and honeypot requests use up the budget too', async () => {
    const relay = await startRelay({ telegram: TELEGRAM, rateLimit: { max: 3, windowMs: 600_000 } });
    try {
      assert.equal((await relay.post({})).status, 400);
      assert.equal((await relay.post(contact({ website: 'x' }))).status, 200);
      assert.equal((await relay.post('not json')).status, 400);
      assert.equal((await relay.post(contact())).status, 429);
    } finally {
      await relay.close();
    }
  });

  test('X-Forwarded-For is ignored unless TRUST_PROXY is set: a spoofed header cannot reset the limit', async () => {
    const relay = await startRelay({ telegram: TELEGRAM, rateLimit: { max: 2, windowMs: 600_000 } });
    try {
      for (let i = 0; i < 2; i++) {
        assert.equal((await relay.post(contact(), { headers: { 'X-Forwarded-For': `203.0.113.${i + 1}` } })).status, 200);
      }
      assert.equal((await relay.post(contact(), { headers: { 'X-Forwarded-For': '203.0.113.99' } })).status, 429);
    } finally {
      await relay.close();
    }
  });

  test('with trustProxy 1 the address the proxy appended (rightmost) is the key; spoofed left entries are ignored', async () => {
    const relay = await startRelay({ telegram: TELEGRAM, trustProxy: 1, rateLimit: { max: 2, windowMs: 600_000 } });
    try {
      const via = (client, spoof) => ({ headers: { 'X-Forwarded-For': `${spoof}, ${client}` } });
      assert.equal((await relay.post(contact(), via('198.51.100.7', '1.1.1.1'))).status, 200);
      assert.equal((await relay.post(contact(), via('198.51.100.7', '2.2.2.2'))).status, 200);
      assert.equal((await relay.post(contact(), via('198.51.100.7', '3.3.3.3'))).status, 429, 'same real client, new spoofed prefix');
      assert.equal((await relay.post(contact(), via('198.51.100.8', '1.1.1.1'))).status, 200, 'a different real client has its own budget');
    } finally {
      await relay.close();
    }
  });

  test('a garbage X-Forwarded-For falls back to the socket address', async () => {
    const relay = await startRelay({ telegram: TELEGRAM, trustProxy: 1, rateLimit: { max: 1, windowMs: 600_000 } });
    try {
      assert.equal((await relay.post(contact(), { headers: { 'X-Forwarded-For': 'not-an-ip' } })).status, 200);
      assert.equal((await relay.post(contact(), { headers: { 'X-Forwarded-For': 'still-not-an-ip' } })).status, 429);
    } finally {
      await relay.close();
    }
  });
});

describe('logging', () => {
  test('logs ids, status and channel names only: no names, addresses or message text', async () => {
    const mock = mockFetch(() => jsonResponse(200, { ok: true }));
    const relay = await startRelay({ telegram: TELEGRAM });
    try {
      await relay.post(contact({ name: 'Quentin Distinct', email: 'quentin.distinct@example.org', message: 'distinct message content' }));
      await relay.post(contact({ name: '', email: 'invalid-distinct', message: 'distinct rejected content' }));
      const logged = JSON.stringify(relay.logs);
      for (const value of ['Quentin', 'quentin.distinct', 'distinct message', 'distinct rejected', 'invalid-distinct', TELEGRAM.token, '127.0.0.1']) {
        assert.equal(logged.includes(value), false, `log must not contain ${value}`);
      }
      const done = relay.logs.find((l) => l.event === 'delivered');
      assert.equal(done.status, 200);
      assert.match(done.id, /^[0-9a-f]{12}$/);
      assert.deepEqual(done.delivered, ['telegram']);
      const rejected = relay.logs.find((l) => l.event === 'rejected' && l.reason === 'validation');
      assert.deepEqual(rejected.fields, ['name', 'email']);
    } finally {
      mock.restore();
      await relay.close();
    }
  });
});
