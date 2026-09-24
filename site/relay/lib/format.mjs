/**
 * Message formatting. Everything here takes the already validated and sanitised contact value.
 */

const HTML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (c) => HTML_ESCAPES[c]);
}

export function truncate(text, max) {
  if (text.length <= max) return text;
  return text.slice(0, Math.max(0, max - 1)).trimEnd() + '…';
}

/** `[Website] <topic label>: <name>`. `name` and the label are single-line by construction. */
export function buildSubject(contact) {
  return `[Website] ${contact.topicLabel}: ${contact.name}`;
}

/** Plain-text summary shared by the email body, Telegram and Signal. */
export function buildText(contact, { maxLength = Infinity } = {}) {
  const head = [
    'New message from the Sudaverse website',
    '',
    `Name: ${contact.name}`,
    `Organization: ${contact.organization || '-'}`,
    `Email: ${contact.email}`,
    `Topic: ${contact.topicLabel}`,
    `Locale: ${contact.locale}`,
    '',
    'Message:',
  ].join('\n');
  const room = maxLength - head.length - 1;
  return `${head}\n${room < contact.message.length ? truncate(contact.message, Math.max(room, 1)) : contact.message}`;
}

/** HTML alternative for the email. Every visitor-supplied value is escaped. */
export function buildHtml(contact) {
  const row = (label, value) =>
    `<tr><th align="left" style="padding:2px 16px 2px 0;font-weight:600;vertical-align:top">${label}</th>` +
    `<td dir="auto" style="padding:2px 0">${escapeHtml(value)}</td></tr>`;
  return [
    '<!doctype html>',
    '<html><body style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.5;color:#1a1a1a">',
    '<h2 style="font-size:16px;margin:0 0 12px">New message from the Sudaverse website</h2>',
    '<table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse">',
    row('Name', contact.name),
    row('Organization', contact.organization || '-'),
    row('Email', contact.email),
    row('Topic', contact.topicLabel),
    row('Locale', contact.locale),
    '</table>',
    '<p style="margin:18px 0 6px;font-weight:600">Message</p>',
    `<div dir="auto" style="white-space:pre-wrap;padding:10px 14px;border-left:3px solid #c9c9c9;background:#f6f6f6">${escapeHtml(contact.message)}</div>`,
    '</body></html>',
  ].join('\n');
}
