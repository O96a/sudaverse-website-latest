/**
 * One shared map of generative art per product slug, so the products index, the product page
 * and the "other products" strip always show the same composition for the same product.
 * Pure geometry (see TraceArt.astro): the seed decides the layout, `tone` the colour family.
 * `plate: 'deep'` means the art sits on a Nile 950 plate (tone must then be `deep`).
 */
export interface ArtSpec {
  seed: number;
  tone: 'nile' | 'sage' | 'deep';
  traces: number;
  leaves: number;
  graticule?: boolean;
  plate: 'paper' | 'deep';
}

export const productArt: Record<string, ArtSpec> = {
  sudatutor: { seed: 14, tone: 'nile', traces: 9, leaves: 12, plate: 'paper' },
  terab: { seed: 41, tone: 'sage', traces: 10, leaves: 16, plate: 'paper' },
  'sudan-monitor': { seed: 9, tone: 'deep', traces: 8, leaves: 9, graticule: true, plate: 'deep' },
  sudandr: { seed: 23, tone: 'nile', traces: 8, leaves: 8, plate: 'paper' },
  sudaflood: { seed: 31, tone: 'nile', traces: 8, leaves: 8, graticule: true, plate: 'paper' },
  llmcorpuskit: { seed: 58, tone: 'sage', traces: 12, leaves: 22, plate: 'paper' },
};

/** Stable fallback for any product added later without an entry above. */
export function artFor(slug: string): ArtSpec {
  const known = productArt[slug];
  if (known) return known;
  let h = 0;
  for (const ch of slug) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return { seed: (h % 90) + 3, tone: h % 2 ? 'nile' : 'sage', traces: 9, leaves: 12, plate: 'paper' };
}
