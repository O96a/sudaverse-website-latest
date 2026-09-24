// Verifies that the site published at the repository root (see publish-root.mjs) matches a fresh build.
// Catches "source changed but nobody re-ran npm run publish:root".
//   node scripts/check-root-sync.mjs [dist-dir]
//
// Compares the set of published files, ignoring the content-hashed names under _astro/ (those change with
// any edit, and are checked separately: every _astro file the published pages reference must exist).
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const dist = resolve(process.argv[2] ?? 'dist');
const root = resolve(dist, '..', '..');
const manifestPath = join(root, '.published-manifest.json');
if (!existsSync(manifestPath)) {
  console.log('No .published-manifest.json at the repository root: nothing to compare.');
  process.exit(0);
}
const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
const notHashed = (f) => !f.startsWith('_astro/');
const built = new Set(walk(dist).map((f) => relative(dist, f).replace(/\\/g, '/')).filter(notHashed));
const published = new Set(JSON.parse(readFileSync(manifestPath, 'utf8')).filter(notHashed));
const missing = [...built].filter((f) => !published.has(f));
const stale = [...published].filter((f) => !built.has(f));

// Every hashed asset a published page references must be present at the root.
const dangling = new Set();
for (const f of published) {
  if (!f.endsWith('.html')) continue;
  const html = readFileSync(join(root, f), 'utf8');
  for (const m of html.matchAll(/["'(](\/_astro\/[^"'()\s,]+)/g)) {
    if (!existsSync(join(root, m[1]))) dangling.add(`${f} -> ${m[1]}`);
  }
}

if (missing.length || stale.length || dangling.size) {
  console.error(
    'The published root is out of date. Run "npm run publish:root" in site/ and commit the result.\n' +
      (missing.length ? ` not published yet (${missing.length}): ${missing.slice(0, 8).join(', ')}\n` : '') +
      (stale.length ? ` no longer built (${stale.length}): ${stale.slice(0, 8).join(', ')}\n` : '') +
      (dangling.size ? ` pages reference missing assets (${dangling.size}): ${[...dangling].slice(0, 5).join('; ')}\n` : ''),
  );
  process.exit(1);
}
console.log(`Published root matches the build (${built.size} files, no dangling assets).`);
