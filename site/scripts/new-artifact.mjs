// Scaffold a new artifact:  npm run new:artifact -- "Title of the artifact" [--lang ar]
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const args = process.argv.slice(2);
const langAt = args.indexOf('--lang');
const lang = langAt >= 0 ? args.splice(langAt, 2)[1] : 'en';
const title = args.join(' ').trim();
if (!title || !['en', 'ar'].includes(lang)) {
  console.error('Usage: npm run new:artifact -- "Title of the artifact" [--lang ar]');
  process.exit(1);
}
const permalink = title.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `artifact-${Date.now()}`;
const dir = resolve('src/content/artifacts', lang);
const file = resolve(dir, `${permalink}.mdx`);
if (existsSync(file)) {
  console.error(`Already exists: ${file}`);
  process.exit(1);
}
const today = new Date().toISOString().slice(0, 10);
const tpl = readFileSync(resolve('src/content/artifacts/_template.mdx'), 'utf8')
  .replace(/^#.*\n/gm, '')
  .replace("title: 'A clear, specific title'", `title: '${title.replace(/'/g, "''")}'`)
  .replace('permalink: my-artifact', `permalink: ${permalink}`)
  .replace('lang: en', `lang: ${lang}`)
  .replace('date: 2026-01-01', `date: ${today}`);
mkdirSync(dir, { recursive: true });
writeFileSync(file, tpl);
console.log(`Created ${file}\nIt is a draft (draft: true). Write it, set draft: false, then build and deploy.`);
