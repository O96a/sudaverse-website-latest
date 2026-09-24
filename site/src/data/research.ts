import type { Localized } from '@/i18n/config';

/**
 * Research content. Only real, public outputs appear under `openWork`.
 * `directions` are research directions, not publications. Never add a publication without a
 * real citation (venue, DOI, arXiv id or equivalent).
 */
export interface OpenWork {
  id: string;
  name: string;
  kind: Localized;
  description: Localized;
  /** SPDX-style license name if the repository declares one. */
  license?: string;
  href: string;
  /** Year-month of the last public push, for honesty about activity. */
  updated: string;
}

/**
 * Papers, preprints and technical reports. EMPTY ON PURPOSE: add an entry only with a real citation
 * (venue, DOI, arXiv id or a stable URL). The Published research page renders this list only when
 * it has entries.
 */
export interface Publication {
  id: string;
  title: string;
  authors: string;
  venue: string;
  year: number;
  kind: 'paper' | 'preprint' | 'report';
  href: string;
}
export const publications: Publication[] = [];

export const openWork: OpenWork[] = [
  {
    id: 'llmcorpuskit',
    name: 'LLMCorpusKit',
    kind: { en: 'Toolkit', ar: 'حزمة أدوات' },
    description: {
      en: 'A toolkit for building LLM training datasets: multi-stage cleaning, AI-powered sentence repair and quality scoring for large Arabic corpora.',
      ar: 'حزمة أدوات لبناء مجموعات بيانات تدريب النماذج اللغوية: تنظيف متعدد المراحل، وإصلاح للجمل بالذكاء الاصطناعي، وتقييم للجودة للمدونات العربية الكبيرة.',
    },
    license: 'MIT',
    href: 'https://github.com/sudaverse/LLMCorpusKit',
    updated: '2025-07',
  },
  {
    id: 'normalizer',
    name: 'Sudaverse Normalizer',
    kind: { en: 'Toolkit', ar: 'حزمة أدوات' },
    description: {
      en: 'A Sudanese Arabic text normalization and cleaning toolkit.',
      ar: 'حزمة أدوات لتطبيع النصوص العربية السودانية وتنظيفها.',
    },
    license: 'MIT',
    href: 'https://github.com/sudaverse/sudaverse-normalizer-latest',
    updated: '2025-12',
  },
  {
    id: 'tokenizer-benchmark',
    name: 'Sudanese Dialect Tokenizer Benchmark',
    kind: { en: 'Benchmark', ar: 'معيار قياس' },
    description: {
      en: 'Benchmarks how efficiently different tokenizers handle Sudanese dialect text, comparing token counts across models on a low-resource language variant.',
      ar: 'يقيس مدى كفاءة أدوات التجزئة المختلفة في التعامل مع النص السوداني العامّي، ويقارن أعداد الرموز عبر النماذج لمتغيّر لغوي شحيح الموارد.',
    },
    href: 'https://github.com/sudaverse/sudanese-dialect-tokenizer-benchmark',
    updated: '2025-06',
  },
];

export interface Direction {
  id: string;
  title: Localized;
  summary: Localized;
  topics: Localized[];
}

export const directions: Direction[] = [
  {
    id: 'nlp',
    title: { en: 'Natural language processing for Sudanese Arabic', ar: 'معالجة اللغة الطبيعية للعربية السودانية' },
    summary: {
      en: 'Language technology that captures the richness of Sudanese dialects and the low-resource conditions they live in.',
      ar: 'تقنيات لغوية تلتقط ثراء اللهجات السودانية والظروف شحيحة الموارد التي تعيش فيها.',
    },
    topics: [
      { en: 'Dialect recognition across Sudanese Arabic varieties', ar: 'التعرّف على اللهجات عبر أنماط العربية السودانية' },
      { en: 'Code-switching between Arabic, English and local languages', ar: 'التبديل اللغوي بين العربية والإنجليزية واللغات المحلية' },
      { en: 'Low-resource language modeling', ar: 'نمذجة اللغات شحيحة الموارد' },
    ],
  },
  {
    id: 'ethics',
    title: { en: 'Ethical AI and bias mitigation', ar: 'الذكاء الاصطناعي الأخلاقي وتخفيف التحيز' },
    summary: {
      en: 'Measuring and reducing cultural bias, with evaluation suited to African contexts.',
      ar: 'قياس التحيز الثقافي وتقليله، بتقييم يناسب السياقات الأفريقية.',
    },
    topics: [
      { en: 'Cultural bias detection in language models', ar: 'كشف التحيز الثقافي في النماذج اللغوية' },
      { en: 'Fairness metrics for African contexts', ar: 'مقاييس العدالة للسياقات الأفريقية' },
      { en: 'Privacy preservation in data collection', ar: 'حماية الخصوصية في جمع البيانات' },
    ],
  },
  {
    id: 'vision',
    title: { en: 'Computer vision for heritage material', ar: 'الرؤية الحاسوبية للمواد التراثية' },
    summary: {
      en: 'Digitizing and analyzing documents, archives and visual heritage.',
      ar: 'رقمنة الوثائق والأرشيفات والتراث البصري وتحليلها.',
    },
    topics: [
      { en: 'Document restoration for historical manuscripts', ar: 'ترميم الوثائق للمخطوطات التاريخية' },
      { en: 'Pattern recognition for cultural motifs', ar: 'التعرّف على الأنماط في الزخارف الثقافية' },
      { en: 'Image enhancement for archived photographs', ar: 'تحسين الصور الأرشيفية' },
    ],
  },
  {
    id: 'applied',
    title: { en: 'Applied AI for health, education and agriculture', ar: 'الذكاء الاصطناعي التطبيقي للصحة والتعليم والزراعة' },
    summary: {
      en: 'Research that feeds the products: tutoring, crop and farm intelligence, and health information.',
      ar: 'أبحاث تغذّي المنتجات: التعليم، وذكاء المحاصيل والمزارع، والمعلومات الصحية.',
    },
    topics: [
      { en: 'Adaptive tutoring in Sudanese Arabic', ar: 'التعليم التكيّفي بالعربية السودانية' },
      { en: 'Crop and farm intelligence', ar: 'ذكاء المحاصيل والمزارع' },
      { en: 'Multilingual health information', ar: 'المعلومات الصحية متعددة اللغات' },
    ],
  },
];
