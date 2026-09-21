// Derives web logo assets from the master JPG (brand-src/logo.jpg).
// The master has a white background; we key white to transparent WITHOUT altering the brand colours
// (threshold key, not colour-to-alpha), then produce tree, wordmark, reversed and icon variants.
// Replace brand-src/logo.jpg with a vector master when one exists and re-run: node scripts/build-brand-assets.mjs
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

const SRC = new URL('../brand-src/logo.jpg', import.meta.url).pathname;
const OUT = new URL('../public/brand/', import.meta.url).pathname;
const PAPER = { r: 0xf3, g: 0xf4, b: 0xef };
await mkdir(OUT, { recursive: true });

const { data, info } = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H } = info;

// 1) key white -> transparent (alpha ramps between min-channel 200 and 240; colour is kept)
const keyed = Buffer.from(data);
for (let i = 0; i < keyed.length; i += 4) {
  const m = Math.min(keyed[i], keyed[i + 1], keyed[i + 2]);
  const a = m >= 240 ? 0 : m <= 200 ? 255 : Math.round(((240 - m) / 40) * 255);
  keyed[i + 3] = a;
}

// 2) reversed variant: navy-ish (all channels dark) -> paper, blues/greens untouched
const rev = Buffer.from(keyed);
let navySamples = [];
for (let i = 0; i < rev.length; i += 4) {
  if (rev[i + 3] > 200 && Math.max(rev[i], rev[i + 1], rev[i + 2]) < 130) {
    if (navySamples.length < 4000) navySamples.push([keyed[i], keyed[i + 1], keyed[i + 2]]);
    rev[i] = PAPER.r; rev[i + 1] = PAPER.g; rev[i + 2] = PAPER.b;
  }
}
const med = (k) => navySamples.map((s) => s[k]).sort((a, b) => a - b)[Math.floor(navySamples.length / 2)];
console.log('brand navy (median of dark pixels): rgb(' + [med(0), med(1), med(2)].join(',') + ')');

const split = 775; // blank rows between tree and wordmark
const raw = (buf) => ({ raw: { width: W, height: H, channels: 4 } });
const part = async (buf, top, height, name, targetH) => {
  let img = sharp(buf, raw(buf)).extract({ left: 0, top, width: W, height }).png();
  const trimmed = await img.toBuffer();
  const t = sharp(trimmed).trim({ threshold: 1 });
  const { data: d, info: inf } = await t.toBuffer({ resolveWithObject: true });
  const out = await sharp(d).resize({ height: targetH, kernel: 'lanczos3' }).png({ compressionLevel: 9 }).toFile(OUT + name);
  console.log(name, out.width + 'x' + out.height, Math.round(out.size / 1024) + 'KB');
};
// Web sizes: about 2x the largest displayed size (header 40px tree / 14px word, footer 48px / 16px).
await part(keyed, 0, split, 'logo-tree.png', 112);
await part(keyed, split, H - split, 'logo-wordmark.png', 40);
await part(rev, 0, split, 'logo-tree-reversed.png', 112);
await part(rev, split, H - split, 'logo-wordmark-reversed.png', 40);
// High-resolution master for the social image only (not shipped to visitors).
await part(keyed, 0, split, '../../brand-src/logo-tree-large.png', 640);

// 3) app icons: tree on paper, padded square
const treeBuf = await sharp(keyed, raw(keyed)).extract({ left: 0, top: 0, width: W, height: split }).png().toBuffer();
const treeTrim = await sharp(treeBuf).trim({ threshold: 1 }).toBuffer();
for (const [size, name, pad] of [[512, 'icon-512.png', 0.14], [192, 'icon-192.png', 0.14], [180, 'apple-touch-icon.png', 0.14], [32, 'favicon-32.png', 0.06]]) {
  const inner = Math.round(size * (1 - pad * 2));
  const tree = await sharp(treeTrim).resize({ width: inner, height: inner, fit: 'inside' }).toBuffer();
  await sharp({ create: { width: size, height: size, channels: 4, background: { ...PAPER, alpha: 1 } } })
    .composite([{ input: tree, gravity: 'center' }]).png().toFile(new URL('../public/' + name, import.meta.url).pathname);
}
console.log('icons written');
