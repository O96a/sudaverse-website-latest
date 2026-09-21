/**
 * A tiny MIME reader, just enough to check what nodemailer produced (headers, multipart/alternative,
 * quoted-printable and base64 bodies, RFC 2047 encoded words). Test code only.
 */

export function decodeQuotedPrintable(input) {
  const joined = input.replace(/=\r?\n/g, '');
  const latin1 = joined.replace(/=([0-9A-Fa-f]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
  return Buffer.from(latin1, 'latin1').toString('utf8');
}

/** Decode `=?UTF-8?B?...?=` and `=?UTF-8?Q?...?=` words inside a header value. */
export function decodeWords(value) {
  return value
    .replace(/\?=\s+=\?/g, '?==?') // whitespace between adjacent encoded words is not content
    .replace(/=\?utf-8\?([QqBb])\?([^?]*)\?=/gi, (_, kind, data) => {
      if (kind.toUpperCase() === 'B') return Buffer.from(data, 'base64').toString('utf8');
      return decodeQuotedPrintable(data.replace(/_/g, ' '));
    });
}

function splitHeadBody(raw) {
  const index = raw.search(/\r?\n\r?\n/);
  if (index === -1) return [raw, ''];
  const sep = raw.slice(index).match(/^\r?\n\r?\n/)[0];
  return [raw.slice(0, index), raw.slice(index + sep.length)];
}

function parseHeaders(head) {
  const unfolded = head.replace(/\r?\n[ \t]+/g, ' ');
  const headers = {};
  for (const line of unfolded.split(/\r?\n/)) {
    const i = line.indexOf(':');
    if (i < 1) continue;
    const name = line.slice(0, i).trim().toLowerCase();
    (headers[name] ??= []).push(line.slice(i + 1).trim());
  }
  return headers;
}

function decodeBody(body, encoding) {
  switch ((encoding ?? '7bit').toLowerCase()) {
    case 'quoted-printable':
      return decodeQuotedPrintable(body);
    case 'base64':
      return Buffer.from(body.replace(/\s+/g, ''), 'base64').toString('utf8');
    default:
      return body;
  }
}

/** Parse a message into `{ headers, header(name), text, html, raw }`. */
export function parseMime(raw) {
  const result = { raw, headers: {}, text: '', html: '' };
  const walk = (source, top) => {
    const [head, body] = splitHeadBody(source);
    const headers = parseHeaders(head);
    if (top) result.headers = headers;
    const type = headers['content-type']?.[0] ?? 'text/plain';
    const boundary = type.match(/boundary="?([^";]+)"?/i)?.[1];
    if (/^multipart\//i.test(type) && boundary) {
      const parts = body.split(`--${boundary}`).slice(1);
      for (const part of parts) {
        if (part.startsWith('--')) break; // closing delimiter
        walk(part.replace(/^\r?\n/, ''), false);
      }
      return;
    }
    const decoded = decodeBody(body, headers['content-transfer-encoding']?.[0]);
    if (/^text\/html/i.test(type)) result.html += decoded;
    else result.text += decoded;
  };
  walk(raw, true);
  result.header = (name) => (result.headers[name.toLowerCase()] ?? []).map(decodeWords);
  return result;
}
