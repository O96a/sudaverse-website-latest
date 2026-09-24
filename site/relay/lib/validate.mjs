/**
 * Strict validation and sanitising of the contact payload.
 *
 * `validateContact(body)` never throws. It returns either `{ ok: true, value }` with trimmed,
 * sanitised strings, or `{ ok: false, fields }` listing only the names of the invalid fields.
 */

/** English labels: the mailbox is read by the team, so subjects are always English. */
export const TOPIC_LABELS = {
  product: 'Product inquiry',
  institutional: 'Institutional partnership',
  research: 'Research collaboration',
  data: 'Data or model collaboration',
  integration: 'Technical integration',
  other: 'Other',
};

export const TOPICS = Object.keys(TOPIC_LABELS);

/**
 * The site's form currently posts the localized topic label rather than the topic key. Accepting
 * the known labels keeps the relay working with either. The key is the documented contract.
 */
const TOPIC_ALIASES = new Map([
  ...Object.entries(TOPIC_LABELS).map(([key, label]) => [label.toLowerCase(), key]),
  ['استفسار عن منتج', 'product'],
  ['شراكة مؤسسية', 'institutional'],
  ['تعاون بحثي', 'research'],
  ['تعاون في البيانات أو النماذج', 'data'],
  ['تكامل تقني', 'integration'],
  ['أخرى', 'other'],
]);

export const LIMITS = { name: 120, organization: 160, email: 254, emailLocal: 64, message: 5000 };

/**
 * Practical email check: one @, no whitespace or characters that are meaningful in headers or
 * addresses, a dotted domain whose last label has at least two characters. Unicode is allowed so
 * internationalised addresses still work.
 */
const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"./]+(?:\.[^\s@<>()[\]\\,;:"./]+)*\.[^\s@<>()[\]\\,;:"./]{2,}$/u;

/** C0 and C1 controls (this includes CR, LF, NUL and NEL), line and paragraph separators, bidi overrides. */
// eslint-disable-next-line no-control-regex
const LINE_UNSAFE = /[\u0000-\u001F\u007F-\u009F\u2028\u2029\u202A-\u202E\u2066-\u2069]+/g;
// Everything except tab and newline.
// eslint-disable-next-line no-control-regex
const BODY_UNSAFE = /[\u0000-\u0008\u000B-\u001F\u007F-\u009F\u2028\u2029]/g;

/** Collapse a value to a single safe line: nothing in it can start a new header. */
export function oneLine(value) {
  return value.replace(LINE_UNSAFE, ' ').replace(/\s+/g, ' ').trim();
}

function multiLine(value) {
  return value.replace(/\r\n?/g, '\n').replace(BODY_UNSAFE, '').trim();
}

/** True when the honeypot field holds anything a real visitor would not have typed. */
export function honeypotTripped(body) {
  if (body === null || typeof body !== 'object' || Array.isArray(body)) return false;
  const v = body.website;
  if (v === undefined || v === null || v === false) return false;
  if (typeof v === 'string') return v.trim().length > 0;
  return true;
}

export function validateContact(body) {
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, fields: ['name', 'email', 'topic', 'message'] };
  }

  const bad = [];
  const isString = (v) => typeof v === 'string';

  let name = '';
  if (isString(body.name)) name = oneLine(body.name);
  if (!name || name.length > LIMITS.name) bad.push('name');

  let organization = '';
  if (body.organization !== undefined && body.organization !== null) {
    if (isString(body.organization)) {
      organization = oneLine(body.organization);
      if (organization.length > LIMITS.organization) bad.push('organization');
    } else {
      bad.push('organization');
    }
  }

  let email = '';
  if (isString(body.email)) email = body.email.trim();
  const atIndex = email.lastIndexOf('@');
  if (!email || email.length > LIMITS.email || atIndex < 1 || atIndex > LIMITS.emailLocal || /\p{Cc}/u.test(email) || !EMAIL_RE.test(email)) {
    bad.push('email');
  }

  let topic = '';
  if (isString(body.topic)) {
    const raw = body.topic.trim();
    if (Object.hasOwn(TOPIC_LABELS, raw)) topic = raw;
    else topic = TOPIC_ALIASES.get(raw.toLowerCase()) ?? '';
  }
  if (!topic) bad.push('topic');

  let message = '';
  if (isString(body.message)) message = multiLine(body.message);
  if (!message || message.length > LIMITS.message) bad.push('message');

  const locale = body.locale === 'ar' ? 'ar' : 'en';

  if (bad.length) return { ok: false, fields: bad };
  return { ok: true, value: { name, organization, email, topic, topicLabel: TOPIC_LABELS[topic], message, locale } };
}
