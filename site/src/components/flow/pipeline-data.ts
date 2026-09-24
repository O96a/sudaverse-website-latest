import type { Locale } from '@/i18n/config';

/**
 * Data and layout for the engineering pipeline diagram. Six steps, left to right, each with its own
 * colour (decorative strokes and tints only; all text stays in ink). Copy is written per locale; the
 * Arabic titles are verbal nouns, the natural form for process stages in Modern Standard Arabic.
 * Product and repository names stay Latin.
 */
export type StepLink =
  | { kind: 'external'; href: string; label: Record<Locale, string> }
  | { kind: 'internal'; path: string; label: Record<Locale, string> };

export interface Step {
  id: string;
  color: string;
  title: Record<Locale, string>;
  desc: Record<Locale, string>;
  link?: StepLink;
}

const GITHUB: Record<Locale, string> = { en: 'View on GitHub', ar: 'عرض على GitHub' };

export const STEPS: Step[] = [
  {
    id: 'collect',
    color: '#1f86c4',
    title: { en: 'Collect', ar: 'الجمع' },
    desc: {
      en: 'Gather raw Sudanese Arabic text from many sources.',
      ar: 'جمع نصوص خام بالعربية السودانية من مصادر متعددة.',
    },
  },
  {
    id: 'clean',
    color: '#c08a1e',
    title: { en: 'Clean and normalize', ar: 'التنظيف والتوحيد' },
    desc: {
      en: 'Standardize spelling, dialect variation and formatting.',
      ar: 'توحيد الإملاء والتباين اللهجي والتنسيق.',
    },
    link: { kind: 'external', href: 'https://github.com/sudaverse/sudaverse-normalizer-latest', label: GITHUB },
  },
  {
    id: 'refine',
    color: '#155386',
    title: { en: 'Refine', ar: 'التنقيح' },
    desc: {
      en: 'Repair sentences and score quality at corpus scale.',
      ar: 'إصلاح الجمل وتقييم الجودة على نطاق المدونة.',
    },
    link: { kind: 'internal', path: 'products/llmcorpuskit', label: { en: 'LLMCorpusKit', ar: 'LLMCorpusKit' } },
  },
  {
    id: 'train',
    color: '#3e9440',
    title: { en: 'Train', ar: 'التدريب' },
    desc: {
      en: 'Fine-tune language models on the curated corpus.',
      ar: 'ضبط دقيق للنماذج اللغوية على المدونة المنتقاة.',
    },
  },
  {
    id: 'evaluate',
    color: '#b25a2c',
    title: { en: 'Evaluate', ar: 'التقييم' },
    desc: {
      en: 'Measure how well tokenizers and models handle Sudanese dialects.',
      ar: 'قياس مدى تعامل أدوات التجزئة والنماذج مع اللهجات السودانية.',
    },
    link: { kind: 'external', href: 'https://github.com/sudaverse/sudanese-dialect-tokenizer-benchmark', label: GITHUB },
  },
  {
    id: 'deploy',
    color: '#1e8a87',
    title: { en: 'Deploy', ar: 'النشر' },
    desc: {
      en: 'Ship products that run on the models, starting with SudaTutor.',
      ar: 'إطلاق منتجات تعمل على النماذج، بدءًا بـ SudaTutor.',
    },
    link: { kind: 'internal', path: 'products/sudatutor', label: { en: 'SudaTutor', ar: 'SudaTutor' } },
  },
];

/** Latin names that must stay untranslated and bidi-isolated inside running Arabic text. */
export const NAMES = ['SudaTutor', 'LLMCorpusKit'];

export const TEXT: Record<Locale, { group: string }> = {
  en: { group: 'The Sudaverse language pipeline in six steps: collect, clean and normalize, refine, train, evaluate, deploy' },
  ar: { group: 'خط معالجة سودافيرس اللغوي في ست خطوات: الجمع، التنظيف والتوحيد، التنقيح، التدريب، التقييم، النشر' },
};

/** One step lit at a time, in sequence. */
export const CYCLE_MS = 3200;
/**
 * Container width (rem) at which the diagram switches from a vertical stack to a horizontal row. The row is
 * one 1380px-wide scene scaled to fit, so below about 64rem its text would drop under 10px; the stack keeps
 * full-size text down to phones. Keep in sync with the @container query in pipeline.css.
 */
export const ROW_MIN_REM = 64;
/** Vertical centre of a card's title bar, where the wires attach in the row layout (virtual px). */
export const HEAD_MID = 17;

export type LayoutName = 'wide' | 'narrow';

export interface Slot {
  x: number;
  y: number;
  w: number;
  h: number;
}
export interface Layout {
  name: LayoutName;
  /** Virtual scene size; the viewport fits this into the container, and the container reserves this aspect ratio. */
  w: number;
  h: number;
  slots: Slot[];
}

const N = STEPS.length;

function buildWide(): Layout {
  const cw = 176;
  const ch = 164;
  const gap = 60;
  const rise = 14; // each step sits a little higher than the last, so the row reads as progress
  const padX = 12;
  const padTop = 12;
  const padBottom = 20;
  return {
    name: 'wide',
    w: padX * 2 + N * cw + (N - 1) * gap,
    h: padTop + (N - 1) * rise + ch + padBottom,
    slots: STEPS.map((_, i) => ({ x: padX + i * (cw + gap), y: padTop + (N - 1 - i) * rise, w: cw, h: ch })),
  };
}

function buildNarrow(): Layout {
  const cw = 292;
  const gap = 34;
  const dx = 24; // alternate cards shift sideways so the wires curve
  const padX = 12;
  const padTop = 12;
  const padBottom = 20;
  let y = padTop;
  const slots: Slot[] = STEPS.map((s, i) => {
    const h = s.link ? 124 : 98;
    const slot = { x: padX + (i % 2) * dx, y, w: cw, h };
    y += h + gap;
    return slot;
  });
  return { name: 'narrow', w: padX * 2 + cw + dx, h: y - gap + padBottom, slots };
}

export const LAYOUTS: Record<LayoutName, Layout> = { wide: buildWide(), narrow: buildNarrow() };
