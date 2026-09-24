// Content-integrity and page-quality checks over a BUILT site (default ./dist, or the directory in argv[2]).
// The site is public and its content rules are strict (see PRODUCT.md and CONVENTIONS.md), so these run in CI.
//   node scripts/check-integrity.mjs [dist-dir]
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const dist = resolve(process.argv[2] ?? 'dist');

/** Strings that must never appear in visible page text or metadata. */
const BANNED = [
  [/O96/i, 'old third-party design credit'],
  [/Design:\s*O/i, 'old design credit line'],
  [/Sudaverse 2025/i, 'old copyright line'],
  [/Preserving Sudanese Heritage/i, 'old template headline'],
  [/HTML5 UP|Spectral/i, 'old template name'],
  [/\bSuda?Data\b|\bSuData\b/, 'retired product names (the current name is Sudata)'],
  [/CVify/i, 'a product that is not part of the site'],
  [/mehaisi|police-companion/i, 'personal or third-party domains and repositories'],
  [/thousands of/i, 'unverifiable user counts'],
  [/\bTBD\b|coming soon/i, 'placeholders'],
  [/Data (?:&|and) Intelligence|Data intelligence|Flood intelligence/i, 'renamed labels'],
];

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });

const decode = (s) =>
  s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)));

const failures = [];
const fail = (file, msg) => failures.push(`${relative(dist, file)}: ${msg}`);
const titles = new Map();

const pages = walk(dist).filter((f) => f.endsWith('.html'));
if (pages.length === 0) {
  console.error(`No HTML found in ${dist}. Build the site first.`);
  process.exit(2);
}

for (const file of pages) {
  const html = readFileSync(file, 'utf8');
  const rel = relative(dist, file).replace(/\\/g, '/');
  const isRedirect = rel === 'index.html';
  const is404 = rel === '404.html';
  const noindex = /<meta[^>]+name="robots"[^>]+noindex/i.test(html);

  const visible = decode(
    html
      .replace(/<(script|style|svg|noscript)[^>]*>[\s\S]*?<\/\1>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' '),
  );
  const meta = decode(html.match(/<head[\s\S]*?<\/head>/i)?.[0] ?? '').replace(/<[^>]+>/g, ' ');
  // The organization SIPAQ may be named in an attributed news story; nowhere else until the owner says so.
  if (/SIPAQ/i.test(visible + meta) && !/(^|\/)news\//.test(rel)) fail(file, 'names SIPAQ outside the news section');
  for (const [re, why] of BANNED) {
    if (re.test(visible) || re.test(meta)) fail(file, `contains a banned string (${why}): ${re}`);
  }

  if (isRedirect) continue; // the root page only redirects to a language

  if (!is404 && (html.match(/<h1[\s>]/gi) ?? []).length !== 1) fail(file, 'must have exactly one <h1>');
  if (/[–—]/.test(visible)) fail(file, 'contains an en or em dash in visible text (use a comma, colon or period)');

  const lang = html.match(/<html[^>]*\blang="([^"]+)"/i)?.[1];
  const dir = html.match(/<html[^>]*\bdir="([^"]+)"/i)?.[1];
  if (!is404) {
    const expected = rel.startsWith('ar/') ? 'ar' : 'en';
    if (lang !== expected) fail(file, `<html lang> is "${lang}", expected "${expected}"`);
    if (expected === 'ar' && dir !== 'rtl') fail(file, 'Arabic pages must set dir="rtl"');
  }

  const title = html.match(/<title>([^<]*)<\/title>/i)?.[1]?.trim();
  if (!title) fail(file, 'missing <title>');
  else if (!is404) titles.set(title, [...(titles.get(title) ?? []), rel]);

  if (!is404 && !noindex) {
    const desc = html.match(/<meta name="description" content="([^"]*)"/i)?.[1] ?? '';
    if (desc.length < 50) fail(file, 'meta description missing or shorter than 50 characters');
    if (!/<link rel="canonical" href="[^"]+"/i.test(html)) fail(file, 'missing canonical link');
    if (!/hreflang="en"/.test(html) || !/hreflang="ar"/.test(html)) fail(file, 'missing hreflang alternates');
  }

  for (const img of html.match(/<img\b[^>]*>/gi) ?? []) {
    // alt may be empty (decorative): the serializer writes it as `alt` or `alt=""`, both fine.
    if (!/\salt(?=[\s>=/])/.test(img)) fail(file, `image without an alt attribute: ${img.slice(0, 90)}`);
  }
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      JSON.parse(m[1]);
    } catch {
      fail(file, 'invalid JSON-LD');
    }
  }
  for (const m of html.matchAll(/<a\b[^>]*target="_blank"[^>]*>/gi)) {
    if (!/rel="[^"]*noopener/.test(m[0])) fail(file, `target=_blank link without rel=noopener: ${m[0].slice(0, 90)}`);
  }
}

for (const [title, files] of titles) {
  if (files.length > 1) failures.push(`duplicate <title> "${title}" on: ${files.join(', ')}`);
}

if (failures.length) {
  console.error(`Integrity check failed (${failures.length}):\n - ${failures.join('\n - ')}`);
  process.exit(1);
}
console.log(`Integrity check passed: ${pages.length} pages.`);
