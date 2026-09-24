// Builds one consistent portrait set for the Company page: 720x900 (4:5) JPEG, head and shoulders,
// grayscale with a slight contrast lift and a gentle pull toward a shared mid-tone, so all twelve
// read as one set even though the source photographs differ in size, framing and background.
//
// Sources live in brand-src/team/ (original photographs). Output goes to src/assets/team/<slug>.jpg and is
// then processed again by astro:assets at build time (widths 360 and 720).
// Run: node scripts/build-team-portraits.mjs
import { mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const here = dirname(fileURLToPath(import.meta.url));
const site = resolve(here, '..');
const imagesDir = join(site, 'brand-src/team');
const outDir = join(site, 'src/assets/team');
mkdirSync(outDir, { recursive: true });

const W = 720;
const H = 900;

/**
 * Per-person crop in source pixels: { left, top, width }. Height is width * 1.25 so the crop is
 * always exactly 4:5. Crops keep the head at roughly 40 to 55 percent of the frame height and stay
 * clear of the small generator mark that sits in the bottom-right corner of some 1024px sources.
 */
const people = [
  { slug: 'anour-dafaalla', src: 'anwar.png', crop: { left: 190, top: 40, width: 640 } },
  { slug: 'aamer-mihaysi', src: 'aamer.jpg', crop: { left: 0, top: 215, width: 704 } },
  { slug: 'tamir-s', src: 'tamir.png', crop: { left: 160, top: 40, width: 720 } },
  { slug: 'salma-mahgoub', src: 'salma.png', crop: { left: 40, top: 0, width: 336 } },
  { slug: 'mohammed-adil-yassin', src: 'mohammed-adil.png', crop: { left: 367, top: 112, width: 290 } },
  { slug: 'abdalgader-abubaker', src: 'abdalgader.png', crop: { left: 190, top: 0, width: 752 } },
  { slug: 'mohamed-altayeb', src: 'mohamed-altayeb.png', crop: { left: 130, top: 0, width: 752 } },
  { slug: 'mohammed-el-mustafa', src: 'mohammed-elmustafa.png', crop: { left: 70, top: 0, width: 752 } },
  { slug: 'mustafa-gafer', src: 'mustafa-gafer.png', crop: { left: 110, top: 0, width: 752 } },
  { slug: 'samahir-elzaki', src: 'Samahir.png', crop: { left: 0, top: 0, width: 1585 } },
  { slug: 'maram-mohamed', src: 'maram.png', crop: { left: 0, top: 88, width: 1824 } },
  { slug: 'hiba-eljozouly', src: 'hiba.png', crop: { left: 0, top: 0, width: 1632 } },
];

const TARGET_MEAN = 132; // shared mid-tone
const PULL = 0.45; // how far each portrait is moved toward it (0 to 1)
const CONTRAST = 1.1; // slight contrast lift around mid-grey

for (const p of people) {
  const { left, top, width } = p.crop;
  const height = Math.round(width * 1.25);
  const base = await sharp(join(imagesDir, p.src))
    .flatten({ background: '#ffffff' })
    .extract({ left, top, width, height })
    .resize(W, H, { kernel: 'lanczos3', fit: 'fill' })
    .grayscale()
    .toBuffer();

  const { channels } = await sharp(base).stats();
  const mean = channels[0].mean;
  // Contrast lift about mid-grey, then a partial shift of the mean toward the shared tone.
  const shift = (TARGET_MEAN - mean) * PULL;
  const b = 128 - 128 * CONTRAST + shift;

  await sharp(base)
    .linear(CONTRAST, b)
    .sharpen({ sigma: 0.8, m1: 0.6, m2: 1 })
    .jpeg({ quality: 80, mozjpeg: true, chromaSubsampling: '4:4:4' })
    .toFile(join(outDir, `${p.slug}.jpg`));
  console.log(p.slug.padEnd(24), `mean ${mean.toFixed(0)} -> shift ${shift.toFixed(1)}`);
}
console.log(`wrote ${people.length} portraits (${W}x${H}) to ${outDir}`);
