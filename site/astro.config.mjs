// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

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
  integrations: [
    // React is used only for the lazy-loaded React Flow island (src/components/flow).
    react(),
    sitemap({
      i18n: { defaultLocale: 'en', locales: { en: 'en', ar: 'ar' } },
      filter: (page) => !page.includes('/404'),
    }),
  ],
});
