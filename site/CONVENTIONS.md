# Sudaverse site conventions

Read this before touching any file. It is the contract between everyone working on the site.

## Stack and commands

Astro 7 + TypeScript, static output, React only for one island (`src/components/flow`). Node 22+.
The dev server is already running at http://localhost:4321 (hot reload). Do **not** start or stop it.
Validate with an isolated build: `cd site && ASTRO_OUT_DIR=/tmp/sv-<yourname> npx astro build` (never plain `npm run build`, other people share `dist/`). Optional: `npx astro check`.
Never commit, push, or edit files you do not own (see ownership in your brief).

## Routing and i18n (English + Arabic, RTL-ready)

- Every page lives at `src/pages/[lang]/...` and exports `getStaticPaths` returning `localeStaticPaths()` (from `@/i18n/utils`). `Astro.params.lang` is `'en' | 'ar'`.
- Dynamic routes return one entry per locale AND per item, e.g. `locales.flatMap(lang => items.map(item => ({ params: { lang, slug: item.slug }, props: { item } })))`.
- Page copy is written next to the page as a bilingual object and selected once:
  `const copy = { en: {...}, ar: {...} }[locale];`
  Shared strings come from `t(locale, key)` (`src/i18n/ui.ts`). Data modules use `Localized` fields and `pick(value, locale)`.
- Links: always `localePath(locale, 'products/terab')`; never hard-code `/en/`.
- Arabic is native MSA copy, not a mirror. Brand and product names stay Latin: wrap in `translate="no"`. Emails, code, URLs inside Arabic text get `dir="ltr"` on their own element.
- Use CSS logical properties only (`margin-inline`, `padding-block`, `inset-inline-start`, `text-align: start`, `border-inline-start`). No `left/right`, no `ml/mr`. Directional icons: `<Icon directional />` (mirrors in RTL).
- Layout wrapper: `import Base from '@/layouts/Base.astro'` with props `title`, `description` (both per locale, unique per page), `nav` (`'products'|'solutions'|'research'|'company'|'resources'|'contact'`), optional `jsonLd` (array of schema.org objects), `image`, `noChat`.

## Design system (tokens live in `src/styles/tokens.css`; use only these)

Never write raw hex. Use custom properties.

- Ground: `--color-bg` (paper), `--color-bg-alt` (paper-2), deep: `--color-bg-deep` (Nile 900). Text: `--color-text`, `--color-text-muted`, `--color-text-meta`; on deep: `--color-text-on-deep`, `--color-text-on-deep-muted`. Lines: `--color-border`, `--color-border-strong`.
- Actions: `--color-action` (Nile blue, primary), `--color-convert` (the logo's blue: "Talk to Us" only), links `--color-link`. Logo hues: `--brand-navy`, `--brand-blue(-600/-700)`, `--brand-green(-700)`; use the -600/-700 steps for text and fills.
- Accents: sage (`--sage-*`) = live/positive, copper (`--copper-*`) = the single warm "live thread" in art, Nile (`--nile-*`) = technical, logo blue = headline accent and conversion. Red only for errors (`--color-error`).
- Type (Schibsted Grotesk; Arabic pages switch to IBM Plex Sans Arabic automatically): sizes `--fs-100` (meta) `--fs-200` (small) `--fs-300` (body) `--fs-400` (lead) `--fs-500` (h3) `--fs-600` (h2) `--fs-700` (h1). Plain `h1..h4` are already styled; use `.t-lead`, `.t-small`, `.t-meta`, `.t-muted`. Mono only for code, data and repo names (`--font-mono`). Max body measure 66ch (`p` is already capped).
- Space: `--s-1`..`--s-10`, section rhythm `--section-y`, `--section-y-tight`.
- Shape: images and plates `--radius-1` (2px); inputs `--radius-2` (6px); popovers `--radius-3`; pills for buttons (the `Button` component is already pill-shaped, never restyle it) and small status chips (`--radius-pill`). Elevation: none, except popovers (`--shadow-pop`). Prefer hairline-ruled lists to boxes; no cards inside cards. **Glass is the one pinned exception** (owner request, 2026-09-21): frosted translucent panels are allowed only as the sticky header, the menu popovers, the chat popover and the two React Flow graphics (hero and pipeline), and on a product page's logo tile. Use the `--glass-*` tokens or the `.glass` utility (never hand-written blur), only where a colour backdrop sits behind the panel, keep text at full contrast (never fade text with opacity), and never nest a `backdrop-filter` element inside another (the header's frosting is a pseudo-element for that reason). Content cards, forms and lists stay flat and hairline-ruled.
- Layout: `.container` (max 82rem), `.container--narrow`, `.section`, `.section--tight`, `.section--alt`, `.section--deep` (+ add class `on-deep` for focus/selection colors), `.grid-12`, `.cluster`, `.stack`. Breakpoints (media queries): 40rem, 48rem, 64rem, 80rem, mobile first.
- Motion: durations `--dur-1..4`, easing `--ease-out`. One authored moment per page, not scattered. Add `data-reveal` on below-the-fold blocks (scroll-linked, default-visible, disabled under reduced motion). Wrap every custom animation in `@media (prefers-reduced-motion: no-preference)` or provide a reduce block.
- Components (all in `src/components`): `Button` (variants primary | convert | secondary | light | outline-deep; props href, arrow, size, external), `Icon` (arrow, external, menu, close, chevron, chat, check, mail), `StageBadge`, `TraceArt` (generative brand circuit-trace art: seed, tone nile|sage|deep, traces, leaves, graticule, thread), `LoomFigure`, `ProductPitch`, `Logo`. Look at `src/pages/[lang]/index.astro` for the established patterns: ruled lists (border-block-start/-end hairlines) instead of card grids, definition lists, deep bands, asymmetric grids.

## React Flow pitfalls (learned the hard way)

The global reset sets `svg { max-width: 100% }` and React Flow marks nodes `pointer-events: none` when nothing is draggable. Any React Flow island must add `.yourroot svg { max-width: none }` and `.yourroot .react-flow__node { pointer-events: auto !important }`, otherwise the wires are invisible (zero-width edge layer) and switches or links inside nodes are unclickable. Also set `.yourroot .react-flow__pane { touch-action: auto }` when nothing pans or zooms, or a finger that starts on the diagram cannot scroll the page. Headless screenshots with `--virtual-time-budget` do not advance React Flow's post-measure frame, so wires can look missing when they are not; verify in a real browser session (a Chrome DevTools driver exists at the path named in your brief).

## Hard bans (brief + Impeccable + Taste)

No eyebrow/kicker label above a heading. No gradient text, glow, neon, colored `border-left/right` above 1px, hard offset shadows, nested cards, same-size icon-plus-heading-plus-text card grids, hero-metric templates, section numbers, emoji, unicode glyphs as icons (`→` `↗`: use `<Icon>`), stock-photo people, fake dashboards or screenshots, decorative gradients. No em dashes or en dashes in copy (use commas, colons, periods). No "cutting-edge, revolutionary, empowering, innovative, transformative, future of AI, unlock, leverage, seamless".

## Content integrity (public repository: everything committed is public)

Allowed facts: what is in `src/data/*`, `PRODUCT.md`, the previous site (kept under the git tag `legacy-static-site`) only where a brief explicitly permits it, and the public GitHub repos in `src/data/research.ts`.
Never invent or imply: customers, contracts, deployments, ministry or government relationships, funding, revenue, user counts, uptime, accuracy figures, awards, certifications, partnerships, case studies, testimonials, publications, datasets, models. Never write "TBD". If a fact is unknown, omit the sentence or section.
Never mention: products or names not in `src/data/products.ts`; anything the owner has put on hold (see `PRODUCT.md`); any technology stack, vendor, model name or hosting detail of a product; private URLs, hosts, repositories or credentials; scraping or social-data collection; the old third-party design credit. Stage labels must match `products.ts` (Live / In Development).
Partner and customer logos are omitted (relationships unverified). Legal pages (privacy, terms, security) do not exist: never link to them.

## Accessibility

One `h1` per page, ordered headings, each `section` has `aria-labelledby`, landmarks come from `Base` (`header`, `main#main`, `footer`). Touch targets at least 44px. Every image has meaningful `alt` (or `alt=""` if decorative). Forms: visible `<label>`, `aria-describedby` for hints, inline errors with `aria-live="polite"`, never placeholder-as-label. External links: `target="_blank" rel="noopener noreferrer"` plus an `.sr-only` "(opens in a new tab)" using `t(locale,'a11y.external')`. Text contrast comes from tokens (all pairs verified AA). Under `prefers-reduced-motion` nothing may move.

## Images

Photography goes through `astro:assets` (`<Picture>`/`<Image>`) from `src/assets/`, with `widths`, `sizes`, `loading="lazy"` below the fold, explicit alt. The legacy photos are LOW resolution (about 700px wide): use them only in constrained frames, never full-bleed. Team portraits: consistent crop and tone (see Company brief). The Company hero uses an owner-supplied illustration (generated, with mock product screens); it must keep its visible "Illustration" caption and must not be presented as the real team or real product screens. The R&D hero uses a cropped owner-supplied illustration (generated): the crop deliberately excludes the projected screen, which shows invented papers, journals and repositories with star counts. Never use the uncropped version, since Sudaverse has published no papers.

## Contact contract

`/[lang]/contact/` accepts `?topic=product|institutional|research|data|integration|other` and `?product=<slug>` and pre-fills the topic and message. Anything that wants a conversation links there, e.g. `` `${localePath(locale,'contact')}?topic=product&product=terab` ``.

## Report format

When done, reply in under 200 words: files created/changed, anything you assumed, anything you could not verify, and the build result. Do not paste code.
