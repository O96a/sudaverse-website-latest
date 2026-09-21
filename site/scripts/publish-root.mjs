// Publishes the built site (site/dist) into the REPOSITORY ROOT so that hosts that serve the repo root
// (for example GitHub Pages "deploy from branch") show the new site at /, /en/ and /ar/.
//
//   cd site && npm run publish:root
//
// Safety: it only ever writes or deletes paths that came from a build, tracked in
// ../.published-manifest.json. It never touches site/, .git, .github, CNAME, PRODUCT.md, README.md or .gitignore.
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';

const site = resolve(new URL('..', import.meta.url).pathname);
const dist = join(site, 'dist');
const root = resolve(site, '..');
const manifestPath = join(root, '.published-manifest.json');
const PROTECTED = ['site', '.git', '.github', 'CNAME', 'PRODUCT.md', 'README.md', '.gitignore', '.nojekyll', '.published-manifest.json'];

if (!existsSync(join(dist, 'index.html'))) {
  console.error('site/dist is missing. Run `npm run build` first.');
  process.exit(1);
}

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [relative(dist, p)];
  });
const next = walk(dist).sort();
const guard = (rel) => {
  const top = rel.split('/')[0];
  if (PROTECTED.includes(top)) throw new Error(`Refusing to publish over protected path: ${rel}`);
};
next.forEach(guard);

// remove files a previous publish created that this build no longer contains
const prev = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, 'utf8')) : [];
let removed = 0;
for (const rel of prev.filter((f) => !next.includes(f))) {
  guard(rel);
  rmSync(join(root, rel), { force: true });
  removed++;
}
for (const rel of next) {
  const to = join(root, rel);
  mkdirSync(dirname(to), { recursive: true });
  cpSync(join(dist, rel), to);
}
writeFileSync(join(root, '.nojekyll'), ''); // GitHub Pages must not run Jekyll (it would drop /_astro)
writeFileSync(manifestPath, JSON.stringify(next, null, 1) + '\n');
console.log(`published ${next.length} files to repo root (${removed} stale removed)`);
