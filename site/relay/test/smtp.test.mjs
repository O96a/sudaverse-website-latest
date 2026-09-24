/**
 * Real SMTP round trips: the relay sends through nodemailer to an in-process smtp-server, and the
 * tests read back the message that server received.
 */

import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { MAIL_FROM, MAIL_TO, ORIGIN, contact, smtpConfig, startRelay, startSmtp } from './support/harness.mjs';

describe('email over SMTP (real round trip)', () => {
  let smtp;
  let relay;

  before(async () => {
    smtp = await startSmtp({ auth: { user: 'relay-test-user', pass: 'relay-test-pass' } });
    relay = await startRelay({
      mailFrom: MAIL_FROM,
      mailTo: MAIL_TO,
      smtp: smtpConfig(smtp.port, { user: 'relay-test-user', pass: 'relay-test-pass' }),
      rateLimit: { max: 100, windowMs: 60_000 },
    });
  });

  after(async () => {
    await relay.close();
    await smtp.close();
  });

  test('delivers a valid contact with the right subject, reply-to, sender and body', async () => {
    const before = smtp.messages.length;
    const res = await relay.post(contact());

    assert.equal(res.status, 200);
    assert.deepEqual(res.json, { ok: true, delivered: ['email'] });
    assert.equal(smtp.messages.length, before + 1);

    const { mail, mailFrom, rcptTo } = smtp.messages.at(-1);
    assert.deepEqual(mail.header('subject'), ['[Website] Product inquiry: Ada Lovelace']);
    assert.deepEqual(mail.header('reply-to'), ['Ada Lovelace <ada@example.org>']);
    assert.deepEqual(mail.header('from'), [MAIL_FROM]);
    assert.deepEqual(mail.header('to'), [MAIL_TO]);
    assert.equal(mailFrom, 'no-reply@sudaverse.com', 'the SMTP envelope sender is the company address');
    assert.deepEqual(rcptTo, [MAIL_TO]);
    assert.match(mail.header('content-type')[0], /^multipart\/alternative/i);

    for (const part of [mail.text, mail.html]) {
      assert.match(part, /Ada Lovelace/);
      assert.match(part, /Analytical Engines Ltd/);
      assert.match(part, /ada@example\.org/);
      assert.match(part, /Product inquiry/);
      assert.match(part, /Hello, we would like a demo of the platform\./);
    }
    assert.match(mail.text, /Name: Ada Lovelace/);
    assert.match(mail.text, /Organization: Analytical Engines Ltd/);
    assert.match(mail.text, /Email: ada@example\.org/);
    assert.match(mail.text, /Topic: Product inquiry/);
    assert.match(mail.text, /Locale: en/);
  });

  test('authenticates with the configured SMTP credentials', async () => {
    assert.ok(smtp.authAttempts.length > 0);
    assert.ok(smtp.authAttempts.every((a) => a.user === 'relay-test-user'));
  });

  test('never uses the visitor address as sender', async () => {
    await relay.post(contact({ email: 'someone.else@example.net' }));
    const { mail, mailFrom } = smtp.messages.at(-1);
    assert.deepEqual(mail.header('from'), [MAIL_FROM]);
    assert.notEqual(mailFrom, 'someone.else@example.net');
    assert.deepEqual(mail.header('reply-to'), ['Ada Lovelace <someone.else@example.net>']);
    assert.equal(mail.header('sender').length, 0);
  });

  test('carries Arabic names and text through intact', async () => {
    const res = await relay.post(
      contact({ name: 'سارة أحمد', organization: 'جامعة الخرطوم', topic: 'research', message: 'مرحبا، نود التعاون معكم في مشروع بحثي.', locale: 'ar' }),
    );
    assert.equal(res.status, 200);
    const { mail } = smtp.messages.at(-1);
    assert.deepEqual(mail.header('subject'), ['[Website] Research collaboration: سارة أحمد']);
    assert.match(mail.text, /مرحبا، نود التعاون معكم في مشروع بحثي\./);
    assert.match(mail.text, /Locale: ar/);
    assert.match(mail.html, /dir="auto"/);
    assert.match(mail.html, /مرحبا، نود التعاون معكم في مشروع بحثي\./);
  });

  test('accepts the localized topic label the site form currently posts', async () => {
    await relay.post(contact({ topic: 'Technical integration' }));
    assert.deepEqual(smtp.messages.at(-1).mail.header('subject'), ['[Website] Technical integration: Ada Lovelace']);
    await relay.post(contact({ topic: 'تعاون بحثي', locale: 'ar' }));
    assert.deepEqual(smtp.messages.at(-1).mail.header('subject'), ['[Website] Research collaboration: Ada Lovelace']);
  });

  test('a header-injection attempt in the name cannot add headers or recipients', async () => {
    const before = smtp.messages.length;
    const res = await relay.post(
      contact({ name: 'Eve\r\nBcc: victim@example.net\r\nSubject: pwned', organization: 'Evil\nCc: victim2@example.net' }),
    );
    assert.equal(res.status, 200);
    assert.equal(smtp.messages.length, before + 1);

    const { mail, rcptTo, raw } = smtp.messages.at(-1);
    assert.deepEqual(rcptTo, [MAIL_TO], 'only the company mailbox is a recipient');
    assert.equal(mail.header('bcc').length, 0);
    assert.equal(mail.header('cc').length, 0);
    assert.equal(mail.header('subject').length, 1, 'exactly one Subject header');
    assert.match(mail.header('subject')[0], /^\[Website\] Product inquiry: Eve Bcc: victim@example\.net Subject: pwned$/);
    // Neither injected line starts a header line anywhere in the raw header block.
    const headerBlock = raw.split(/\r?\n\r?\n/)[0];
    assert.doesNotMatch(headerBlock, /^Bcc:/im);
    assert.doesNotMatch(headerBlock, /^Cc:/im);
  });

  test('a crafted display name cannot smuggle an extra Reply-To address', async () => {
    const res = await relay.post(contact({ name: 'Mallory <attacker@example.net>, "x"' }));
    assert.equal(res.status, 200);
    const { mail } = smtp.messages.at(-1);
    const replyTo = mail.header('reply-to');
    assert.equal(replyTo.length, 1);
    // The visitor's address is the only address in the header: no second "@" survives.
    assert.equal((replyTo[0].match(/@/g) ?? []).length, 1);
    assert.match(replyTo[0], /<ada@example\.org>$/);
    // The name is still reported in full in the body.
    assert.match(mail.text, /Name: Mallory <attacker@example\.net>, "x"/);
  });

  test('HTML is escaped in the HTML alternative and left as plain text in the text part', async () => {
    const res = await relay.post(
      contact({
        name: '<script>alert(1)</script>',
        organization: 'A & B "Co" <b>bold</b>',
        message: '<img src=x onerror=alert(1)> & "quotes" \'single\'',
      }),
    );
    assert.equal(res.status, 200);
    const { mail } = smtp.messages.at(-1);
    assert.doesNotMatch(mail.html, /<script>/i);
    assert.doesNotMatch(mail.html, /<img/i);
    assert.doesNotMatch(mail.html, /<b>bold/i);
    assert.match(mail.html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
    assert.match(mail.html, /A &amp; B &quot;Co&quot; &lt;b&gt;bold&lt;\/b&gt;/);
    assert.match(mail.html, /&lt;img src=x onerror=alert\(1\)&gt; &amp; &quot;quotes&quot; &#39;single&#39;/);
    assert.match(mail.text, /<img src=x onerror=alert\(1\)> & "quotes" 'single'/);
  });

  test('multi-line messages keep their line breaks in the text part', async () => {
    await relay.post(contact({ message: 'Line one\r\nLine two\n\nLine four' }));
    assert.match(smtp.messages.at(-1).mail.text.replace(/\r\n/g, '\n'), /Line one\nLine two\n\nLine four/);
  });

  test('logs channel names and request ids only, never personal data or secrets', async () => {
    relay.logs.length = 0;
    await relay.post(contact({ name: 'Zed Uniquename', email: 'zed.unique@example.org', message: 'A very unique message body' }));
    const logged = JSON.stringify(relay.logs);
    assert.match(logged, /"channel":"email"/);
    for (const secret of ['Zed Uniquename', 'zed.unique@example.org', 'unique message body', 'relay-test-pass', '127.0.0.1']) {
      assert.equal(logged.includes(secret), false, `log must not contain ${secret}`);
    }
  });
});

describe('email transport security', () => {
  test('refuses to send in clear text when TLS is required (the default for STARTTLS) and the server has none', async () => {
    const smtp = await startSmtp();
    const relay = await startRelay({ smtp: { host: '127.0.0.1', port: smtp.port, secure: false } });
    try {
      const res = await relay.post(contact());
      assert.equal(res.status, 502);
      assert.deepEqual(res.json, { ok: false });
      assert.equal(smtp.messages.length, 0);
    } finally {
      await relay.close();
      await smtp.close();
    }
  });

  test('a rejected login is a failed delivery, reported without leaking the password', async () => {
    const smtp = await startSmtp({ auth: { user: 'right-user', pass: 'right-pass' } });
    const relay = await startRelay({ smtp: smtpConfig(smtp.port, { user: 'right-user', pass: 'WRONG-PASS-VALUE' }) });
    try {
      const res = await relay.post(contact());
      assert.equal(res.status, 502);
      assert.equal(smtp.messages.length, 0);
      assert.equal(JSON.stringify(relay.logs).includes('WRONG-PASS-VALUE'), false);
      assert.ok(relay.logs.some((l) => l.event === 'channel' && l.channel === 'email' && l.ok === false));
    } finally {
      await relay.close();
      await smtp.close();
    }
  });

  test('CORS headers accompany the success answer for the site origin', async () => {
    const smtp = await startSmtp();
    const relay = await startRelay({ smtp: smtpConfig(smtp.port) });
    try {
      const res = await relay.post(contact());
      assert.equal(res.status, 200);
      assert.equal(res.headers['access-control-allow-origin'], ORIGIN);
    } finally {
      await relay.close();
      await smtp.close();
    }
  });
});
