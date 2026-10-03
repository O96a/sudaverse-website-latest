// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';

// Canonical origin. The legacy site served www.sudaverse.com (see ../CNAME).
const site = 'https://www.sudaverse.com';

// https://astro.build/config
export default defineConfig({
  site,
  // Serve from a domain root by default. On a GitHub project page set SITE_BASE=/repo-name at build time
  // (the publish workflow does this automatically); every link and asset follows it.
  base: process.env.SITE_BASE || '/',
  trailingSlash: 'always',
  build: { format: 'directory' },
  // Allows isolated builds (e.g. ASTRO_OUT_DIR=/tmp/sv-build npm run build) without clobbering dist/.
  outDir: process.env.ASTRO_OUT_DIR || './dist',
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ar'],
    routing: { prefixDefaultLocale: true, redirectToDefaultLocale: false },
  },
  // Retired or renamed pages (2026-09 restructure). Static builds emit a redirect page for each; nginx also
  // answers these with a 301 (see deploy-sudaverse.sh at the server).
  redirects: Object.fromEntries(
    ['en', 'ar'].flatMap((l) => [
      [`/${l}/company`, `/${l}/about/`],
      [`/${l}/research/published`, `/${l}/research/papers/`],
      [`/${l}/solutions`, `/${l}/#services`],
      [`/${l}/for`, `/${l}/#services`],
      ...['academic-institutions', 'developers', 'large-organizations', 'ngos', 'private-sector', 'public-institutions'].map((a) => [`/${l}/for/${a}`, `/${l}/#services`]),
      [`/${l}/news`, `/${l}/research/artifacts/`],
      [`/${l}/news/students-suffering-above-all`, `/${l}/research/artifacts/`],
      [`/${l}/resources`, `/${l}/projects/`],
      [`/${l}/resources/documentation`, `/${l}/projects/`],
      [`/${l}/resources/faq`, `/${l}/about/`],
      [`/${l}/products`, `/${l}/projects/`],
      ...['sudatutor', 'terab', 'sudan-monitor', 'sudata', 'urri', 'sudanizer', 'llmcorpuskit'].map((p) => [`/${l}/products/${p}`, `/${l}/projects/${p}/`]),
      // SudaNDR and SudaFlood were renamed AegisNDR and FloodWatch on 2026-10-03.
      ...[['sudandr', 'aegisndr'], ['sudaflood', 'floodwatch']].flatMap(([o, n]) => [
        [`/${l}/products/${o}`, `/${l}/projects/${n}/`],
        [`/${l}/projects/${o}`, `/${l}/projects/${n}/`],
      ]),
    ]),
  ),
  integrations: [
    mdx(),
    // React is used only for the lazy-loaded React Flow island (src/components/flow).
    react(),
    sitemap({
      i18n: { defaultLocale: 'en', locales: { en: 'en', ar: 'ar' } },
      filter: (page) => !page.includes('/404') && !/\/(company|solutions|for|news|resources|products)\/|\/research\/published\//.test(page),
    }),
  ],
});
