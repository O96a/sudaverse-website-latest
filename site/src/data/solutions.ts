import type { Localized } from '@/i18n/config';

/**
 * Solutions are organized around customer needs ("what can we help an organization do"),
 * not around products. Each links to the products and technical capabilities behind it.
 * Descriptions stay at the level the owner's brief supports: no past deployments, no results.
 */
export interface Solution {
  slug: string;
  title: Localized;
  /** One sentence: the need. */
  need: Localized;
  /** One or two sentences: what Sudaverse builds toward it. */
  offer: Localized;
  /** Product slugs from products.ts. */
  products: string[];
  /** Capability ids from capabilities.ts (optional). */
  capabilities?: string[];
}

export const solutions: Solution[] = [
  {
    slug: 'institutional-ai',
    title: { en: 'AI knowledge systems (RAG)', ar: 'أنظمة معرفة بالذكاء الاصطناعي (RAG)' },
    need: {
      en: 'Institutions hold decades of documents that nobody can search or query in Arabic.',
      ar: 'تحتفظ المؤسسات بعقود من الوثائق التي لا يستطيع أحد البحث فيها أو الاستعلام عنها بالعربية.',
    },
    offer: {
      en: 'Arabic-first assistants and retrieval-augmented generation (RAG) systems built on an institution’s own documents and data, with deployment options that keep that data in its control.',
      ar: 'مساعدون وأنظمة توليد معزَّز بالاسترجاع (RAG) عربية أولاً تُبنى على وثائق المؤسسة وبياناتها، مع خيارات نشر تُبقي البيانات تحت سيطرتها.',
    },
    products: ['sudatutor'],
    capabilities: ['llm-rag', 'private-deployment'],
  },
  {
    slug: 'arabic-conversational-ai',
    title: { en: 'Arabic-first conversational AI', ar: 'ذكاء اصطناعي محادثي عربي أولاً' },
    need: {
      en: 'Most language models handle Sudanese dialects, code-switching and informal writing poorly.',
      ar: 'تتعامل معظم النماذج اللغوية بضعف مع اللهجات السودانية والتبديل اللغوي والكتابة غير الرسمية.',
    },
    offer: {
      en: 'Assistants that understand Sudanese Arabic, supported by our data pipelines and language tooling from collection to deployment.',
      ar: 'مساعدون يفهمون العربية السودانية، بدعم من خطوط معالجة البيانات وأدوات اللغة لدينا من الجمع حتى النشر.',
    },
    products: ['sudatutor', 'urri', 'sudanizer', 'llmcorpuskit'],
    capabilities: ['llm-rag', 'data-engineering'],
  },
  {
    slug: 'data-intelligence',
    title: { en: 'Data insights and decision support', ar: 'تحليل البيانات ودعم القرار' },
    need: {
      en: 'Decisions depend on data that is scattered, noisy and hard to trust.',
      ar: 'تعتمد القرارات على بيانات مبعثرة ومشوشة يصعب الوثوق بها.',
    },
    offer: {
      en: 'Cleaning, curation and analytics infrastructure that turns raw information into something a team can act on.',
      ar: 'بنية تحتية للتنقية والتنظيم والتحليل تحوّل المعلومات الخام إلى ما يمكن للفريق أن يتصرف بناءً عليه.',
    },
    products: ['sudan-monitor', 'sudaflood', 'sudata'],
    capabilities: ['data-engineering', 'machine-learning'],
  },
  {
    slug: 'geospatial-monitoring',
    title: { en: 'Geospatial monitoring', ar: 'المراقبة الجغرافية المكانية' },
    need: {
      en: 'Organizations need to know what is happening, where, and early enough to respond.',
      ar: 'تحتاج الجهات إلى معرفة ما يحدث وأين يحدث، وبوقت كافٍ للاستجابة.',
    },
    offer: {
      en: 'Situational-awareness and early-warning platforms built on location data.',
      ar: 'منصات للوعي بالموقف والإنذار المبكر مبنية على البيانات المكانية.',
    },
    products: ['sudan-monitor', 'sudaflood'],
    capabilities: ['geospatial', 'machine-learning'],
  },
  {
    slug: 'secure-ai',
    title: { en: 'Secure and private AI', ar: 'ذكاء اصطناعي آمن وخاص' },
    need: {
      en: 'Some organizations cannot send sensitive data to a public model or a foreign cloud.',
      ar: 'لا تستطيع بعض الجهات إرسال بياناتها الحساسة إلى نموذج عام أو سحابة أجنبية.',
    },
    offer: {
      en: 'AI systems designed for local and private deployment, with security engineering built in, including AI-assisted network detection and response.',
      ar: 'أنظمة ذكاء اصطناعي مصمّمة للنشر المحلي والخاص، مع هندسة أمنية مدمجة، بما فيها كشف الشبكات والاستجابة لها بمساعدة الذكاء الاصطناعي.',
    },
    products: ['sudandr'],
    capabilities: ['cybersecurity', 'private-deployment'],
  },
  {
    slug: 'education-platforms',
    title: { en: 'Education platforms', ar: 'منصات التعليم' },
    need: {
      en: 'Learners and teachers need support in the language they actually speak.',
      ar: 'يحتاج المتعلمون والمعلمون إلى دعم باللغة التي يتحدثون بها فعلًا.',
    },
    offer: {
      en: 'Adaptive tutoring and teaching tools in Sudanese Arabic and English.',
      ar: 'أدوات تعليم ومعلّم تكيّفي بالعربية السودانية والإنجليزية.',
    },
    products: ['sudatutor'],
    capabilities: ['llm-rag'],
  },
  {
    slug: 'agricultural-intelligence',
    title: { en: 'Agricultural intelligence', ar: 'الذكاء الزراعي' },
    need: {
      en: 'Farm records and crop knowledge rarely live in one place, and rarely in Arabic.',
      ar: 'نادرًا ما تجتمع سجلات المزارع ومعرفة المحاصيل في مكان واحد، ونادرًا ما تكون بالعربية.',
    },
    offer: {
      en: 'Farm records, crop intelligence and Arabic AI assistance in one platform designed for Sudanese agricultural workflows.',
      ar: 'سجلات المزرعة وذكاء المحاصيل والمساعدة بالذكاء الاصطناعي العربي في منصة واحدة مصمّمة لسير العمل الزراعي السوداني.',
    },
    products: ['terab'],
    capabilities: ['machine-learning', 'geospatial'],
  },
  {
    slug: 'custom-solutions',
    title: { en: 'Customized digital and AI solutions', ar: 'حلول رقمية وحلول ذكاء اصطناعي مخصصة' },
    need: {
      en: 'Some needs are not met by any off-the-shelf product.',
      ar: 'بعض الاحتياجات لا يلبّيها أي منتج جاهز.',
    },
    offer: {
      en: 'Sudaverse scopes, designs and builds digital and AI systems around an organization’s own workflows, data and constraints. We start with a discovery conversation, agree a scoped pilot, and expand only after security, traceability and results have been checked.',
      ar: 'تحدّد سودافيرس نطاق أنظمة رقمية وأنظمة ذكاء اصطناعي وتصمّمها وتبنيها حول سير عمل المؤسسة وبياناتها وقيودها. نبدأ بمحادثة استكشاف، ثم نتفق على تجربة محدودة النطاق، ولا نتوسّع إلا بعد التحقق من الأمن وقابلية التتبع والنتائج.',
    },
    products: [],
    capabilities: ['llm-rag', 'data-engineering', 'private-deployment'],
  },
];
