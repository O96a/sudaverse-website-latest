import { getCollection, type CollectionEntry } from 'astro:content';
import { locales, type Locale } from '@/i18n/config';
import { team } from '@/data/team';
import { productBySlug } from '@/data/products';
import { publications } from '@/data/research';

export type Artifact = CollectionEntry<'artifacts'>;

/** Published artifacts, newest first. Unknown authors, projects or papers fail the build. */
export async function allArtifacts(): Promise<Artifact[]> {
  const list = (await getCollection('artifacts', (a) => !a.data.draft)).sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
  for (const a of list) {
    for (const s of a.data.authors) if (!team.some((p) => p.slug === s)) throw new Error(`Artifact ${a.id}: unknown author "${s}"`);
    for (const s of a.data.projects) if (!productBySlug(s)) throw new Error(`Artifact ${a.id}: unknown project "${s}"`);
    if (a.data.paper && !publications.some((p) => p.id === a.data.paper)) throw new Error(`Artifact ${a.id}: unknown paper "${a.data.paper}"`);
  }
  return list;
}

/**
 * One entry per slug for a locale: the version written in that language when it exists, otherwise the
 * original (shown with its own lang and dir, and a note). Every artifact therefore has a page in every locale.
 */
export async function artifactsFor(locale: Locale) {
  const list = await allArtifacts();
  const slugs = [...new Set(list.map((a) => a.data.permalink))];
  return slugs
    .map((slug) => {
      const own = list.find((a) => a.data.permalink === slug && a.data.lang === locale);
      const entry = own ?? list.find((a) => a.data.permalink === slug)!;
      return { entry, translated: Boolean(own) };
    })
    .sort((a, b) => b.entry.data.date.valueOf() - a.entry.data.date.valueOf());
}

export async function artifactPaths() {
  const out = [];
  for (const lang of locales) for (const { entry, translated } of await artifactsFor(lang)) out.push({ params: { lang, slug: entry.data.permalink }, props: { entry, translated } });
  return out;
}

/** Reading time from the MDX body (component tags removed), at a steady technical-reading pace. */
export function readingMinutes(a: Artifact) {
  const text = (a.body ?? '').replace(/<[^>]+>/g, ' ').replace(/\{[^}]*\}/g, ' ');
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / (a.data.lang === 'ar' ? 170 : 200)));
}
