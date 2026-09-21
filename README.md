# Sudaverse website

The public website for [Sudaverse](https://www.sudaverse.com): an AI and digital-systems company building
Arabic-first products for Sudan. English and Arabic (RTL), static, no tracking.

## Layout

| Path | What it is |
| --- | --- |
| `site/` | The source: Astro + TypeScript, plain CSS design tokens, one lazy React Flow island for the hero. See [`site/README.md`](site/README.md) and [`site/CONVENTIONS.md`](site/CONVENTIONS.md). |
| repository root (`index.html`, `en/`, `ar/`, `_astro/`, ...) | The **built** site, produced by `npm run publish:root` from `site/`. Do not edit these by hand. |
| `PRODUCT.md` | Positioning, audience, content-integrity rules. |
| `CNAME` | Custom domain for static hosting. |

## Work on the site

```sh
cd site
npm ci
npm run dev            # http://localhost:4321
npm run build          # static output in site/dist
npm run publish:root   # build, then copy the result to the repository root
```

## Content rules

Everything committed here is public. Only real, approved facts appear on the site: no invented customers,
partners, publications, metrics or product internals. Products and claims come from `site/src/data/`.

The previous static site (the original template) stays in git history: its last commit is `ecc2482`, also marked by the tag `legacy-static-site` on the fork.

See `site/README.md` for deployment on GitHub Pages, CI and the contact relay (`site/relay/`).
