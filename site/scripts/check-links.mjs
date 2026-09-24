// Internal link and asset check over a BUILT site (default ./dist, or the directory in argv[2]).
// Every internal href, src and srcset target must exist, and every #fragment must match an id on its page.
//   node scripts/check-links.mjs [dist-dir]
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';

const dist = resolve(process.argv[2] ?? 'dist');
// When the site was built for a sub-path (SITE_BASE=/repo), every root-absolute reference must carry it.
const base = (process.env.SITE_BASE ?? '').replace(/\/+$/, '');
const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });

const pages = walk(dist).filter((f) => f.endsWith('.html'));
if (pages.length === 0) {
  console.error(`No HTML found in ${dist}. Build the site first.`);
  process.exit(2);
}

const ids = new Map();
const idsOf = (file) => {
  if (!ids.has(file)) {
    const html = readFileSync(file, 'utf8');
    ids.set(file, new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));
  }
  return ids.get(file);
};

/** Resolve a URL path to a file in dist, or null. */
const resolveTarget = (urlPath) => {
  const clean = decodeURIComponent(urlPath.split('?')[0]);
  const base = join(dist, clean);
  for (const candidate of [base, join(base, 'index.html'), `${base}.html`]) {
    if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  }
  return null;
};

const failures = [];
let checked = 0;
for (const file of pages) {
  const html = readFileSync(file, 'utf8');
  const pagePath = '/' + relative(dist, dirname(file)).replace(/\\/g, '/');
  const refs = [];
  for (const m of html.matchAll(/\s(?:href|src)="([^"]+)"/g)) refs.push(m[1]);
  for (const m of html.matchAll(/\ssrcset="([^"]+)"/g)) for (const part of m[1].split(',')) refs.push(part.trim().split(/\s+/)[0]);

  for (const ref of new Set(refs)) {
    if (!ref || /^(https?:|mailto:|tel:|sms:|data:|javascript:|sgnl:|\/\/)/i.test(ref)) continue;
    checked++;
    const [pathPart, fragment] = ref.split('#');
    let urlPath = pathPart ? (pathPart.startsWith('/') ? pathPart : join(pagePath, pathPart)) : pagePath + '/';
    if (base && pathPart.startsWith('/')) {
      if (pathPart !== base && !pathPart.startsWith(base + '/')) {
        failures.push(`${relative(dist, file)}: root-absolute "${ref}" is missing the base path ${base}`);
        continue;
      }
      urlPath = pathPart.slice(base.length) || '/';
    }
    // A bare #fragment refers to the page it is on (which may be 404.html, not an index.html).
    const target = pathPart ? resolveTarget(urlPath) : file;
    if (!target) {
      failures.push(`${relative(dist, file)}: broken link "${ref}"`);
      continue;
    }
    if (fragment && target.endsWith('.html') && !idsOf(target).has(fragment)) {
      failures.push(`${relative(dist, file)}: "${ref}" points to a missing #${fragment}`);
    }
  }
}

if (failures.length) {
  console.error(`Link check failed (${failures.length}):\n - ${[...new Set(failures)].join('\n - ')}`);
  process.exit(1);
}
console.log(`Link check passed: ${checked} internal references across ${pages.length} pages.`);
