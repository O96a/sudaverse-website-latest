import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * Artifacts: long technical write-ups under /research/artifacts/. One MDX file per language in
 * src/content/artifacts/<lang>/<slug>.mdx; a translation shares the slug. Files starting with _ are
 * templates and never build. See ARTIFACTS.md for how to write one.
 */
const artifacts = defineCollection({
  loader: glob({ pattern: '**/[^_]*.mdx', base: './src/content/artifacts' }),
  schema: z.object({
    title: z.string().min(8),
    summary: z.string().min(40).max(320),
    permalink: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    lang: z.enum(['en', 'ar']),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    /** Team slugs from src/data/team.ts. */
    authors: z.array(z.string()).min(1),
    direction: z.enum(['arabic-nlp', 'adversarial-security', 'cognitive-architectures', 'public-sector', 'geospatial', 'adaptive-learning']),
    /** Project slugs from src/data/products.ts. */
    projects: z.array(z.string()).default([]),
    /** Publication id from src/data/research.ts. */
    paper: z.string().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { artifacts };
