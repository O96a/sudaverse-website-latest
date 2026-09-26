import type { Locale } from '@/i18n/config';
import type { FlowStepData } from './flow-layout';

/**
 * Data for the engineering pipeline diagram on the homepage. Six steps, left to right, each with its own
 * colour (decorative strokes and tints only; all text stays in ink). Copy is written per locale; the
 * Arabic titles are verbal nouns, the natural form for process stages in Modern Standard Arabic.
 * Product and repository names stay Latin. Layout lives in flow-layout.ts.
 */
const GITHUB: Record<Locale, string> = { en: 'View on GitHub', ar: 'عرض على GitHub' };

export const STEPS: FlowStepData[] = [
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
    link: { kind: 'internal', path: 'projects/llmcorpuskit', label: { en: 'LLMCorpusKit', ar: 'LLMCorpusKit' } },
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
    link: { kind: 'internal', path: 'projects/sudatutor', label: { en: 'SudaTutor', ar: 'SudaTutor' } },
  },
];

/** Latin names that must stay untranslated and bidi-isolated inside running Arabic text. */
export const NAMES = ['SudaTutor', 'LLMCorpusKit'];

export const TEXT: Record<Locale, { group: string }> = {
  en: { group: 'The Sudaverse language pipeline in six steps: collect, clean and normalize, refine, train, evaluate, deploy' },
  ar: { group: 'خط معالجة سودافيرس اللغوي في ست خطوات: الجمع، التنظيف والتوحيد، التنقيح، التدريب، التقييم، النشر' },
};
