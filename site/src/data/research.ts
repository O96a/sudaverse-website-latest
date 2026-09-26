import type { Localized } from '@/i18n/config';

/**
 * Research content: publications, open-source releases (`openWork`) and research directions.
 * Only real, public outputs appear here. Never add a publication without a real citation.
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
 * Papers, preprints and technical reports, newest first on the page. Add an entry only with a real
 * citation: at least the venue and year, plus a DOI or stable URL once one exists. Optional fields
 * (authors, DOI, links, abstract) render only when present, so an entry can be completed later.
 */
export interface Publication {
  id: string;
  /** Title exactly as published (Latin, never translated). */
  title: string;
  /** Author names in citation order, exactly as on the paper. */
  authors?: string[];
  /** Short venue name as cited, e.g. "IEEE FITAT 2026". */
  venue: string;
  year: number;
  kind: 'paper' | 'preprint' | 'report';
  /** A plain-language line about the paper, written from its title and abstract only. */
  summary: Localized;
  abstract?: Localized;
  doi?: string;
  /** Publisher or proceedings page. */
  href?: string;
  pdf?: string;
  direction: DirectionId;
  /** Related project slugs from products.ts. */
  projects?: string[];
}

// Owner-supplied (2026-09-26): both papers are published at IEEE FITAT 2026. Authors, DOI and links follow.
export const publications: Publication[] = [
  {
    id: 'sudanizer-bpe',
    title: 'Sudanizer: A Dialect-Specific Byte-Pair Encoding Tokenizer for NLP Arabic',
    venue: 'IEEE FITAT 2026',
    year: 2026,
    kind: 'paper',
    summary: {
      en: 'Presents Sudanizer, a byte-pair encoding tokenizer built specifically for Sudanese Arabic dialect text.',
      ar: 'تقدّم الورقة Sudanizer، أداة تجزئة بترميز أزواج البايتات بُنيت خصيصًا لنصوص اللهجة العربية السودانية.',
    },
    direction: 'arabic-nlp',
    projects: ['sudanizer'],
  },
  {
    id: 'maritime-ai-security',
    title: 'AI Cybersecurity in the Maritime Industry: A Comprehensive Review of Threats, Regulations, and Defensive Strategies',
    venue: 'IEEE FITAT 2026',
    year: 2026,
    kind: 'paper',
    summary: {
      en: 'A review of AI cybersecurity in the maritime industry: the threats, the regulations that apply, and the defensive strategies available.',
      ar: 'مراجعة للأمن السيبراني للذكاء الاصطناعي في القطاع البحري: التهديدات، والتنظيمات المنطبقة، واستراتيجيات الدفاع المتاحة.',
    },
    direction: 'adversarial-security',
  },
];

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

export type DirectionId =
  | 'arabic-nlp'
  | 'adversarial-security'
  | 'cognitive-architectures'
  | 'public-sector'
  | 'geospatial'
  | 'adaptive-learning';

/**
 * Research directions (owner-set on 2026-09-26; the last two were added to cover every project).
 * `projects` lists the projects a direction feeds, from products.ts. `color` is a graphic token for
 * dots and wires only, never text.
 */
export interface Direction {
  id: DirectionId;
  icon: 'chat' | 'shield' | 'network' | 'landmark' | 'globe' | 'cap';
  color: string;
  title: Localized;
  /** Short label for diagrams. */
  short: Localized;
  summary: Localized;
  topics: Localized[];
  projects: string[];
}

export const directions: Direction[] = [
  {
    id: 'arabic-nlp',
    icon: 'chat',
    color: 'var(--viz-sky)',
    title: { en: 'Arabic NLP, with a focus on Sudanese dialects', ar: 'معالجة اللغة العربية، مع تركيز على اللهجات السودانية' },
    short: { en: 'Arabic NLP', ar: 'معالجة العربية' },
    summary: {
      en: 'Language technology for the Arabic people actually write and speak in Sudan: dialect vocabulary, informal spelling and code-switching, in a low-resource setting.',
      ar: 'تقنيات لغوية للعربية التي يكتبها الناس ويتحدثونها فعلًا في السودان: مفردات اللهجة، والإملاء غير الرسمي، والتبديل اللغوي، في بيئة شحيحة الموارد.',
    },
    topics: [
      { en: 'Dialect-specific tokenization', ar: 'التجزئة الخاصة باللهجة' },
      { en: 'Cleaning and normalizing dialect corpora', ar: 'تنظيف مدونات اللهجة وتوحيدها' },
      { en: 'Sudanese language models that run on phones and tablets', ar: 'نماذج لغوية سودانية تعمل على الهواتف والأجهزة اللوحية' },
      { en: 'Code-switching between Arabic, English and local languages', ar: 'التبديل اللغوي بين العربية والإنجليزية واللغات المحلية' },
    ],
    projects: ['urri', 'sudanizer', 'llmcorpuskit'],
  },
  {
    id: 'adversarial-security',
    icon: 'shield',
    color: 'var(--viz-copper)',
    title: { en: 'Adversarial cyberattack prevention', ar: 'الوقاية من الهجمات السيبرانية العدائية' },
    short: { en: 'Adversarial security', ar: 'الأمن العدائي' },
    summary: {
      en: 'Detecting and stopping attacks on networks and on AI systems themselves, from abnormal traffic to attempts to mislead or manipulate a model.',
      ar: 'كشف الهجمات على الشبكات وعلى أنظمة الذكاء الاصطناعي نفسها وإيقافها، من الحركة غير الطبيعية إلى محاولات تضليل النموذج أو التلاعب به.',
    },
    topics: [
      { en: 'AI-assisted detection of abnormal network behavior', ar: 'كشف السلوك الشاذ في الشبكات بمساعدة الذكاء الاصطناعي' },
      { en: 'Robustness of models against adversarial inputs', ar: 'متانة النماذج أمام المدخلات العدائية' },
      { en: 'Threats to AI in critical sectors such as maritime', ar: 'التهديدات التي تواجه الذكاء الاصطناعي في القطاعات الحيوية كالقطاع البحري' },
      { en: 'Security requirements for locally deployed models', ar: 'متطلبات الأمان للنماذج المنشورة محليًا' },
    ],
    projects: ['sudandr'],
  },
  {
    id: 'cognitive-architectures',
    icon: 'network',
    color: 'var(--viz-navy)',
    title: { en: 'AI cognitive architectures', ar: 'المعماريات الإدراكية للذكاء الاصطناعي' },
    short: { en: 'Cognitive architectures', ar: 'المعماريات الإدراكية' },
    summary: {
      en: 'How AI agents perceive, remember, plan and act over long tasks, and how to build agentic systems that stay reliable and inspectable.',
      ar: 'كيف يدرك وكيل الذكاء الاصطناعي ويتذكّر ويخطط ويتصرف في المهام الطويلة، وكيف تُبنى أنظمة وكيلية تبقى موثوقة وقابلة للفحص.',
    },
    topics: [
      { en: 'Memory and planning in agentic systems', ar: 'الذاكرة والتخطيط في الأنظمة الوكيلية' },
      { en: 'Tool use and multi-step reasoning', ar: 'استخدام الأدوات والاستدلال متعدد الخطوات' },
      { en: 'Evaluating agent behavior on long tasks', ar: 'تقييم سلوك الوكلاء في المهام الطويلة' },
      { en: 'Grounding agents in Arabic-language context', ar: 'ربط الوكلاء بالسياق العربي' },
    ],
    projects: [],
  },
  {
    id: 'public-sector',
    icon: 'landmark',
    color: 'var(--viz-gold)',
    title: { en: 'Public sector infrastructure adaptation', ar: 'تكييف البنية التحتية للقطاع العام' },
    short: { en: 'Public sector', ar: 'القطاع العام' },
    summary: {
      en: 'Adapting digital infrastructure and AI to the constraints of public institutions: limited connectivity, sensitive data that must stay in the country, and systems that have to keep running.',
      ar: 'تكييف البنية الرقمية والذكاء الاصطناعي مع قيود المؤسسات العامة: اتصال محدود، وبيانات حساسة يجب أن تبقى داخل البلد، وأنظمة يجب أن تستمر في العمل.',
    },
    topics: [
      { en: 'Local and private deployment of AI for institutions', ar: 'النشر المحلي والخاص للذكاء الاصطناعي في المؤسسات' },
      { en: 'Bilingual public knowledge bases', ar: 'قواعد معرفة عامة ثنائية اللغة' },
      { en: 'Monitoring critical infrastructure', ar: 'مراقبة البنية التحتية الحيوية' },
      { en: 'Resilient systems for low-connectivity settings', ar: 'أنظمة صامدة في بيئات الاتصال المحدود' },
    ],
    projects: ['sudata', 'sudan-monitor'],
  },
  {
    id: 'geospatial',
    icon: 'globe',
    color: 'var(--viz-green)',
    title: { en: 'Geospatial and climate intelligence', ar: 'الذكاء الجغرافي المكاني والمناخي' },
    short: { en: 'Geospatial and climate', ar: 'الجغرافيا والمناخ' },
    summary: {
      en: 'Turning satellite imagery and live information into early warnings and decisions on the ground: floods, crops and critical sites.',
      ar: 'تحويل صور الأقمار الصناعية والمعلومات الحية إلى إنذارات مبكرة وقرارات على الأرض: الفيضانات والمحاصيل والمواقع الحيوية.',
    },
    topics: [
      { en: 'Flood forecasting and early warning', ar: 'التنبؤ بالفيضانات والإنذار المبكر' },
      { en: 'Crop health from satellite imagery', ar: 'صحة المحاصيل من صور الأقمار الصناعية' },
      { en: 'Weather-aware irrigation planning', ar: 'تخطيط الري المراعي للطقس' },
      { en: 'Multi-layer situational maps', ar: 'خرائط متعددة الطبقات للوعي بالموقف' },
    ],
    projects: ['sudaflood', 'terab', 'sudan-monitor'],
  },
  {
    id: 'adaptive-learning',
    icon: 'cap',
    color: 'var(--sage-600)',
    title: { en: 'Adaptive learning for low-resource settings', ar: 'التعلّم التكيّفي في البيئات شحيحة الموارد' },
    short: { en: 'Adaptive learning', ar: 'التعلّم التكيّفي' },
    summary: {
      en: 'Education technology that adapts to each learner’s level, follows the national curriculum and works where connectivity and devices are limited.',
      ar: 'تقنيات تعليمية تتكيّف مع مستوى كل متعلّم، وتتبع المنهج القومي، وتعمل حيث يكون الاتصال والأجهزة محدودة.',
    },
    topics: [
      { en: 'Explanations adapted to age and level', ar: 'شرح يتكيّف مع العمر والمستوى' },
      { en: 'Curriculum-aligned content in Arabic', ar: 'محتوى عربي متوافق مع المنهج' },
      { en: 'Progress tracking and assessment', ar: 'متابعة التقدم والتقييم' },
      { en: 'Learning over low-bandwidth connections', ar: 'التعلّم عبر اتصالات منخفضة السرعة' },
    ],
    projects: ['sudatutor'],
  },
];

export const directionById = (id: string) => directions.find((d) => d.id === id);
export const papersFor = (id: DirectionId) => publications.filter((p) => p.direction === id);
