# Sudaverse website

Bilingual (English and Arabic, RTL-ready) static site for Sudaverse, built with Astro 7 and TypeScript.
This is the source of the Sudaverse website. `npm run publish:root` builds it and copies the result to the repository root, which is what a host serving the repo root publishes. The previous static site stays in git history (its last commit is `ecc2482`).

```
npm install
npm run dev        # http://localhost:4321  (redirects / to /en/ or /ar/)
npm run build      # static output in ./dist
npm run preview    # serve the build
npm run verify     # type check, build, content integrity, links, secret scan
```

Astro documentation: <https://docs.astro.build> (routing, components, framework components, styling and
internationalization are the guides this site leans on).

Node 22.12 or newer. React is used for exactly one lazy-loaded island (the React Flow pipeline diagram in `src/components/flow`); everything else is server-rendered Astro with almost no JavaScript.

## Where things live

| Path | What |
| --- | --- |
| `src/pages/[lang]/` | Every page, once per language (`/en/…`, `/ar/…`). `src/pages/index.astro` redirects `/`, `404.astro` is bilingual. |
| `src/data/` | Single sources of truth: `products.ts`, `solutions.ts`, `capabilities.ts`, `research.ts`, `team.ts`. Bilingual fields, no invented facts. |
| `src/i18n/` | Locale config, shared UI strings (`ui.ts`), helpers. Page copy sits next to each page as `{ en, ar }`. |
| `src/styles/` | `tokens.css` (semantic design tokens), `base.css`, `fonts.css`. |
| `src/components/` | Header, Footer, Button, Logo, TraceArt, ProductPitch, ChatLauncher, … |
| `src/config/site.ts` | Contact, socials, feature flags. |
| `scripts/` | Reproducible asset builds (logo variants, social image, team portraits) and the checks CI runs. |
| `relay/` | The contact relay: a small Node service that delivers form messages by SMTP, Telegram or Signal. |
| `CONVENTIONS.md` | The contract for anyone editing the site: design rules, i18n pattern, content-integrity rules. Read it first. |

## Configuration (environment variables, all optional)

| Variable | Effect |
| --- | --- |
| `PUBLIC_WHATSAPP_NUMBER` | WhatsApp Business number, digits with country code (for example `2499XXXXXXXX`). Enables the floating chat launcher and the contact-page WhatsApp block. Until it is set the launcher is hidden in production builds (shown with a notice in dev). |
| `PUBLIC_CONTACT_ENDPOINT` | URL of a JSON form endpoint (Formspree, Web3Forms or similar). Without it the contact form opens the visitor's email app with the message ready. |
| `PUBLIC_PREVIEW_WHATSAPP=1` | Show the WhatsApp launcher in a build even without a number (for design review only). |

## Content rules (this repository is public)

Nothing may be published that is not supported by evidence: no customers, contracts, ministry relationships, user numbers, uptime, accuracy figures, publications, datasets or testimonials, and no internal architecture or private URLs. Products appear only if they are in `src/data/products.ts`; anything not yet approved is deliberately absent from the repository. Stage labels must be honest (Live, Beta, Pilot, In Development). See `CONVENTIONS.md` and the root `PRODUCT.md`.

## Brand assets

`brand-src/logo.jpg` is the master logo (baobab grown from circuit traces, with the SUDAVERSE wordmark). `node scripts/build-brand-assets.mjs` derives the transparent, reversed and icon variants in `public/`. Replace the master with a vector file when one exists and re-run. `node scripts/build-og.mjs` renders the 1200x630 social preview with headless Chrome.

## Internationalisation

`/en/` and `/ar/` are separate static routes with `lang`, `dir`, `hreflang` alternates and localized metadata. Styles use logical properties so layouts mirror without overrides; directional icons flip through `.icon-dir`. Arabic pages switch to IBM Plex Sans Arabic and drop letter-spacing. All Arabic copy is a first draft for the architecture: have a native editor review it before launch.

## Deployment (GitHub Pages)

The site is plain static output, so GitHub Pages can serve it. `www.sudaverse.com` is set by the repository-root `CNAME` file.

**Workflows** (`.github/workflows/`):

- `site-ci.yml` runs on every pull request and push to `main`: `astro check`, the build, content-integrity checks (banned strings, one `h1`, `lang` and `dir`, titles, alt text, JSON-LD, dashes), an internal link and `#fragment` check, a secret scan, the contact relay tests and a dependency audit.
- `publish.yml` builds and deploys with GitHub Actions on every push to `main` and on the 1st of every month. The monthly run is what keeps the footer year current: the year is taken from the build date, so a rebuild on 1 January rolls it over with no manual step. Nothing is committed back to the repository.

**One-time setup, as the repository owner:**

1. Settings, Pages, Build and deployment, Source: **GitHub Actions**.
2. Settings, Secrets and variables, Actions, Variables: `DEPLOY_MODE` = `actions`. Until it is set the publish workflow does nothing.
3. Optional public build variables (also embedded in the public site): `PUBLIC_CONTACT_ENDPOINT` (the relay, `https://<relay-host>/contact`), `PUBLIC_WHATSAPP_NUMBER`, `PUBLIC_SIGNAL_NUMBER` or `PUBLIC_SIGNAL_URL`, `PUBLIC_TELEGRAM_HANDLE`. With none set the chat launcher stays hidden and the form opens the visitor's email app.

**It adapts to the URL Pages serves it from.** Links and assets are prefix-aware: on the custom domain the prefix is empty, and on a project page (`<owner>.github.io/<repo>/`) the publish workflow detects `/<repo>` and builds for it. To build for a prefix by hand, run `SITE_BASE=/<repo> npm run build` (and `SITE_BASE=/<repo> npm run test:links`). The site needs no dev server and no port at run time: it is static files, and `npm` is only used to build.

**Serving from a branch instead.** The built site is also committed at the repository root, so Pages source "Deploy from a branch" (`main`, `/ (root)`) works with no setup. That copy only changes when someone runs `npm run publish:root` and commits it, so the footer year does not roll over on its own in that mode. Use the Actions route for automatic updates.

**What GitHub Pages cannot do** (plan around these):

- Static files only. There is no server code, so no SMTP: the contact form needs the relay in `relay/` (a small Node service on any host) or falls back to `mailto:`.
- No custom HTTP headers (no Content-Security-Policy, no cache control) and no server-side redirects. The site root uses a meta refresh to `/en/`.
- Custom domain: DNS `CNAME www` to `<owner>.github.io`; HTTPS certificates are issued by GitHub and can take up to an hour. An apex domain needs A records instead.
- Documented soft limits (check GitHub's current documentation): about 1 GB published size, 100 GB bandwidth a month, deployments time out after 10 minutes. The built site is about 16 MB.
- Free Pages need a public repository, which matches the content rules here (everything committed is public). Pages is for informational sites, not online stores.
- Scheduled workflows are switched off by GitHub after 60 days without repository activity: re-enable them in the Actions tab, or push any commit.

## Still needed from the team

WhatsApp number; approval and stage confirmation for any product not yet listed; real product screenshots or short screen recordings (with synthetic data labelled as such); higher-resolution photography (2000px or wider) for full-width imagery, since the legacy photos are about 700px; a vector logo master; native review of the Arabic copy; privacy, terms, security and responsible-AI pages before they are linked; confirmation of which partner relationships may be shown publicly.
