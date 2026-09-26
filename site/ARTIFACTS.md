# Writing an Artifact

Artifacts are long technical write-ups under **Research → Artifacts** (`/en/research/artifacts/`, `/ar/research/artifacts/`).
Each one is a single MDX file: Markdown plus a few chart and diagram tags. No imports are needed.

## Publish a new artifact

```sh
cd site
npm run new:artifact -- "Your title"            # English; add --lang ar for Arabic
# edit src/content/artifacts/en/<permalink>.mdx, then set draft: false
npm run verify                                   # type check, build, integrity, links, secrets
npm run publish:root                             # build and copy to the repository root
```

Then deploy (on the server: build output to `~/sudaverse-release`, then `sudo bash ~/deploy-sudaverse.sh`), and commit.

## Frontmatter

| Field | Meaning |
| --- | --- |
| `title`, `summary` | Shown on the index and in search results. Summary is 40 to 320 characters. |
| `permalink` | The URL part: `/research/artifacts/<permalink>/`. A translation uses the **same** permalink in the other language folder. |
| `lang` | `en` or `ar`. Without a translation, the other language shows the original with a note. |
| `date`, `updated` | ISO dates. |
| `authors` | Team slugs from `src/data/team.ts` (for example `aamer-mihaysi`). Unknown slugs fail the build. |
| `direction` | One of `arabic-nlp`, `adversarial-security`, `cognitive-architectures`, `public-sector`, `geospatial`, `adaptive-learning`. |
| `projects` | Project slugs from `src/data/products.ts`. |
| `paper` | Optional publication id from `src/data/research.ts`. |
| `tags`, `draft` | Free tags; `draft: true` keeps it out of the build. |

## Components

All components animate once when scrolled into view, stay still under reduced motion, and are readable without JavaScript.

- `<Stats items={[{ value, label }]} source sourceHref />`: two to four headline figures.
- `<BarChart title subtitle data={[{ label, value, note? }]} decimals unit valueLabel emphasis? source sourceHref />`: compare magnitudes. `emphasis="Label"` highlights one bar and grays the rest.
- `<DonutChart title subtitle data={[{ label, value }]} center={{ value, label }} unit source sourceHref />`: part of a whole, five parts at most (more fold into "Other").
- `<Hierarchy label nodes={[{ id, label, sub?, parents?: [...], href? }]} caption />`: animated tree; a node may have several parents.
- `<Steps label steps={[{ title, desc }]} caption />`: animated step flow, 3 to 7 steps.
- `<Callout kind="note|caution" title>…</Callout>`, `<Figure caption>…</Figure>`, and normal Markdown code fences.

## Content rules (the site is public)

- **Every number in a chart has a real source**, named in `source` (and linked in `sourceHref` when public). Never estimate or invent data.
- Never invent customers, deployments, partnerships, metrics or results. Say what a measurement does not show.
- No em or en dashes in copy, no "cutting-edge, revolutionary, transformative" style words (see `CONVENTIONS.md`).
- Chart colours are fixed (`--chart-1..5` in `tokens.css`, validated for colour-vision deficiency); never set colours by hand.
