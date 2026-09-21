// Renders the 1200x630 social preview (public/og/sudaverse-og.png) from an HTML template with headless Chrome,
// using the self-hosted brand fonts and the real logo. Run: node scripts/build-og.mjs
// Set CHROME_PATH if Chrome is not at the default macOS location.
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = resolve(new URL('..', import.meta.url).pathname);
const chrome = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const url = (p) => pathToFileURL(join(root, p)).href;
const font = url('node_modules/@fontsource-variable/schibsted-grotesk/files/schibsted-grotesk-latin-wght-normal.woff2');

const html = `<!doctype html><meta charset="utf-8"><style>
@font-face{font-family:SG;src:url('${font}') format('woff2');font-weight:400 900}
*{box-sizing:border-box;margin:0}
html,body{width:1200px;height:630px;background:#f3f4ef;font-family:SG,system-ui,sans-serif;color:#12191d;overflow:hidden}
.wrap{position:relative;width:1200px;height:630px;padding:64px 72px}
.brand{display:flex;align-items:center;gap:16px}
.brand img:first-child{height:64px}.brand img:last-child{height:22px}
h1{margin-top:96px;font-size:76px;line-height:1.02;font-weight:660;letter-spacing:-0.03em;max-width:700px}
p{margin-top:28px;font-size:30px;line-height:1.35;color:#37444c;max-width:640px}
.url{position:absolute;left:72px;bottom:56px;font-size:24px;font-weight:600;color:#155386}
.tree{position:absolute;right:56px;top:96px;height:440px}
.bar{position:absolute;left:0;right:0;bottom:0;height:10px;background:#0f3d66}
</style><div class="wrap">
<div class="brand"><img src="${url('public/brand/logo-tree.png')}"><img src="${url('public/brand/logo-wordmark.png')}"></div>
<h1>Applied AI for Sudan’s most important systems.</h1>
<p>Arabic-first AI products and digital platforms.</p>
<div class="url">sudaverse.com</div>
<img class="tree" src="${url('brand-src/logo-tree-large.png')}">
<div class="bar"></div></div>`;

const dir = mkdtempSync(join(tmpdir(), 'sv-og-'));
const file = join(dir, 'og.html');
writeFileSync(file, html);
const out = join(root, 'public/og/sudaverse-og.png');
execFileSync(chrome, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
  '--virtual-time-budget=4000', '--window-size=1200,630', `--screenshot=${out}`, pathToFileURL(file).href], { stdio: 'ignore' });
console.log('wrote', out);
