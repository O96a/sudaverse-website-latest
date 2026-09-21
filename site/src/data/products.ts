import type { ImageMetadata } from 'astro';
import type { Localized } from '@/i18n/config';
import sudatutorLogo from '@/assets/products/sudatutor-logo.png';
import terabLogo from '@/assets/products/terab-logo.png';
import sudandrLogo from '@/assets/products/sudandr-logo.png';
import sudafloodLogo from '@/assets/products/sudaflood-logo.png';
import urriLogo from '@/assets/products/urri-logo.png';
import sudataLogo from '@/assets/products/sudata-logo.png';
import agriLead from '@/assets/topics/agri-lead.jpg';
import breadbasket from '@/assets/topics/breadbasket.jpg';
import sudanMonitorLogo from '@/assets/products/sudan-monitor-logo.png';
import sudanizerLogo from '@/assets/products/sudanizer-logo.png';
import sudatutorScreen from '@/assets/products/screens/sudatutor.png';
import terabScreen from '@/assets/products/screens/terab.png';
import urriScreen from '@/assets/products/screens/urri.png';

/**
 * Product registry: the single source of truth for menus, product pages, the ecosystem
 * diagram and the footer.
 *
 * CONTENT INTEGRITY: every field must come from the owner's own brief or the already-public
 * site. Optional fields (capabilities, approach, security, deployment, screenshots) are omitted
 * until real, approved material exists; the product template hides empty sections.
 * Owner direction (2026-09-21): products that are not yet approved for public presentation are
 * NOT listed here at all (this repository is public). Show "In Development" products with a
 * one-line description only: no screenshots, no internals, no metrics.
 */
export type Stage = 'live' | 'beta' | 'pilot' | 'development' | 'research';

export type CategoryId = 'ai-products' | 'data-intelligence' | 'secure-ai' | 'language-research';

export const categoryOrder: CategoryId[] = ['ai-products', 'data-intelligence', 'secure-ai', 'language-research'];

export interface Product {
  slug: string;
  /** Latin brand name. Rendered inside a bidi-isolated span in Arabic pages. */
  name: string;
  category: CategoryId;
  stage: Stage;
  tagline: Localized;
  /** One or two sentences. No claim beyond the owner's description. */
  summary: Localized;
  /** Derived from the description; owner to confirm. */
  audience?: Localized;
  /** Only real, approved capabilities. */
  capabilities?: Localized[];
  languages?: ('ar' | 'en')[];
  /** Public product URL, if one exists. */
  url?: string;
  /** Public repository or documentation, if one exists and is safe to link. */
  docs?: string;
  /** Shown on the homepage as a flagship. */
  flagship?: boolean;
  /** The product's own logo, only where the owner publishes one (source: the product's public site). */
  logo?: ImageMetadata;
  /** Owner-supplied campaign graphics about the product's topic (not product screens). */
  topics?: ProductScreen[];
  /** Approved, real product visuals only (captures of the owner's own public pages). Never add mock-ups. */
  screens?: ProductScreen[];
}

export interface ProductScreen {
  src: ImageMetadata;
  /** Address shown in the browser frame; set only when the owner has approved showing it. */
  host?: string;
  alt: Localized;
  caption?: Localized;
}

export const products: Product[] = [
  {
    slug: 'sudatutor',
    name: 'SudaTutor',
    category: 'ai-products',
    stage: 'live',
    flagship: true,
    logo: sudatutorLogo,
    // Source: the live product page (https://sudatutor.sudaverse.com/). Claims that appeared only on the
    // previous site (English answers, dialect understanding, teacher tools, a "free for everyone" pledge)
    // are left out until the owner confirms them.
    tagline: {
      en: 'Learn the Sudanese curriculum with AI assistance.',
      ar: 'تعلّم المنهج السوداني بمساعدة الذكاء الاصطناعي.',
    },
    summary: {
      en: 'An intelligent educational platform that helps learners study Sudan’s national curriculum in an interactive, clear and easy-to-understand way. It is supported by AI that adapts to the learner’s level and gives explanations appropriate to the student’s age.',
      ar: 'منصة تعليمية ذكية تساعدك على دراسة المنهج القومي السوداني بطريقة تفاعلية، واضحة، وسهلة الفهم، مدعومة بذكاء اصطناعي يتكيّف مع مستواك ويقدّم الشرح المناسب حسب عمر الطالب.',
    },
    audience: {
      en: 'Learners studying the Sudanese national curriculum.',
      ar: 'المتعلّمون الذين يدرسون المنهج القومي السوداني.',
    },
    capabilities: [
      {
        en: 'Covers 12 grade levels and 117 books of the Sudanese curriculum.',
        ar: 'يغطي 12 صفًّا دراسيًا و117 كتابًا من المنهج السوداني.',
      },
      {
        en: 'Adaptive learning engine: dynamically adapts to each student’s level and abilities.',
        ar: 'محرك التعلم التكيفي: يتكيّف ديناميكيًا مع مستوى وقدرات كل طالب على حدة.',
      },
      {
        en: 'Targeted educational content: aligned specifically with the national curriculum and Sudanese culture.',
        ar: 'محتوى تعليمي محدد: يتماشى فقط مع المنهج القومي والثقافة السودانية.',
      },
      {
        en: 'Precise progress tracking: continuous assessment and intelligent tools for measuring academic achievement.',
        ar: 'متابعة دقيقة للتقدم: تقييم مستمر وأدوات ذكية لقياس مستوى التحصيل الأكاديمي.',
      },
      {
        en: 'Start as a guest, or create a free account.',
        ar: 'ابدأ كضيف، أو أنشئ حسابًا مجانيًا.',
      },
    ],
    languages: ['ar'],
    url: 'https://sudatutor.sudaverse.com/',
    screens: [
      {
        src: sudatutorScreen,
        host: 'sudatutor.sudaverse.com',
        alt: {
          en: 'The SudaTutor start page in Arabic: “Learn the Sudanese curriculum with AI assistance”, with buttons to create a free account or try it as a guest.',
          ar: 'صفحة البداية في سودا تيوتر: «تعلّم المنهج السوداني بمساعدة الذكاء الاصطناعي»، مع زرّين لإنشاء حساب مجاني أو التجربة كضيف.',
        },
        caption: {
          en: 'The start page today: create a free account, or try SudaTutor as a guest.',
          ar: 'صفحة البداية اليوم: أنشئ حسابًا مجانيًا، أو جرّب سودا تيوتر كضيف.',
        },
      },
    ],
  },
  {
    slug: 'terab',
    name: 'Terab',
    category: 'ai-products',
    stage: 'live',
    flagship: true,
    logo: terabLogo,
    // Public app, confirmed reachable; source: the owner's presentation.
    url: 'https://terab.sudaverse.com/farmer',
    tagline: { en: 'Arabic-first agriculture platform.', ar: 'منصة زراعية عربية أولاً.' },
    summary: {
      en: 'An integrated agriculture platform powered by AI that gives Sudanese farmers access to specialized agricultural advice and helps them monitor pests, rainfall and irrigation, to raise productivity and reduce risk.',
      ar: 'منصة زراعية ذكية متكاملة مدعومة بالذكاء الاصطناعي تمكّن المزارع السوداني من الوصول إلى استشارات زراعية متخصصة، ومراقبة الآفات والأمطار وطرق الري، لزيادة الإنتاجية وتقليل المخاطر.',
    },
    audience: {
      en: 'Farmers and agricultural teams working in Sudan.',
      ar: 'المزارعون والفرق الزراعية العاملة في السودان.',
    },
    capabilities: [
      {
        en: 'Crop health monitoring from satellite imagery: tracks crop growth and key vital indicators regularly.',
        ar: 'مراقبة صحة المحاصيل عبر الأقمار الصناعية: تتبّع نمو المحاصيل ورصد المؤشرات الحيوية بانتظام.',
      },
      {
        en: 'Weather forecasts and irrigation planning to improve water use and irrigation schedules.',
        ar: 'التنبؤ بالطقس وتحسين الري: توقعات جوية لتحسين استهلاك المياه وجدولة الري.',
      },
      {
        en: 'Early diagnosis of pests and plant diseases, with immediate suggestions.',
        ar: 'التشخيص المبكر للآفات: أنظمة ذكية لاكتشاف أمراض النباتات وتقديم حلول فورية.',
      },
      {
        en: 'Speaks with farmers in their local dialect.',
        ar: 'يتحدث مع المزارع باللهجة المحلية.',
      },
    ],
    screens: [
      {
        src: terabScreen,
        alt: {
          en: 'The Terab start page in Arabic: “A smart agriculture platform for Sudanese farmers”, with buttons to start and to sign in.',
          ar: 'صفحة البداية في تراب: «منصة زراعية ذكية للمزارعين السودانيين»، مع زرّين للبدء وتسجيل الدخول.',
        },
        caption: {
          en: 'The start page for farmers: create an account, or sign in.',
          ar: 'صفحة البداية للمزارعين: أنشئ حسابًا أو سجّل الدخول.',
        },
      },
    ],
    topics: [
      {
        src: agriLead,
        alt: {
          en: 'Sudaverse graphic: a combine harvester crossing a golden field at sunset, with the line Sudan can lead Africa in AI-powered agriculture.',
          ar: 'رسم من سودافيرس: حصادة تعبر حقلًا ذهبيًا عند الغروب، مع عبارة إن السودان قادر على قيادة أفريقيا في الزراعة المدعومة بالذكاء الاصطناعي (نص الرسم بالإنجليزية).',
        },
      },
      {
        src: breadbasket,
        alt: {
          en: 'Sudaverse graphic: an aerial view of green and ochre fields, with the line With AI, Sudan can once again become the breadbasket of the world.',
          ar: 'رسم من سودافيرس: منظر جوي لحقول خضراء وترابية، مع عبارة بالذكاء الاصطناعي يمكن للسودان أن يصبح مجددًا سلة غذاء العالم (نص الرسم بالإنجليزية).',
        },
      },
    ],
  },
  {
    slug: 'sudan-monitor',
    name: 'Sudan Monitor',
    category: 'data-intelligence',
    stage: 'live',
    flagship: true,
    logo: sudanMonitorLogo,
    tagline: {
      en: 'Geospatial situational-awareness platform.',
      ar: 'منصة وعي بالموقف على الخريطة.',
    },
    summary: {
      en: 'Sudan Monitor brings information onto a map so teams can follow what is happening, and where.',
      ar: 'يضع سودان مونيتور المعلومات على الخريطة ليتابع الفريق ما يحدث وأين يحدث.',
    },
    audience: {
      en: 'Organizations and teams that follow critical situations in conflict areas.',
      ar: 'المنظمات وفرق متابعة الحالات الحرجة في مناطق النزاع.',
    },
    capabilities: [
      {
        en: 'A Sudan-centred map with multiple layers.',
        ar: 'خريطة مركزية للسودان متعددة الطبقات.',
      },
      {
        en: 'Monitoring of critical infrastructure in Sudan.',
        ar: 'مراقبة البنية التحتية الحيوية في السودان.',
      },
      {
        en: 'Live ingestion of information from multiple sources.',
        ar: 'استيعاب حي للمعلومات من مصادر متعددة.',
      },
      {
        en: 'Live news and television monitoring.',
        ar: 'مراقبة حية للأخبار والقنوات التلفزيونية.',
      },
    ],
  },
  {
    slug: 'sudandr',
    name: 'SudaNDR',
    category: 'secure-ai',
    stage: 'live',
    flagship: true,
    logo: sudandrLogo,
    tagline: {
      en: 'AI-assisted network detection and response.',
      ar: 'كشف الشبكات والاستجابة لها بمساعدة الذكاء الاصطناعي.',
    },
    summary: {
      en: 'A smart cyber-defense platform that detects attacks and protects network traffic. Its AI engine analyzes network traffic in real time and recommends immediate protection measures.',
      ar: 'منصة دفاع سيبراني ذكية لرصد الهجمات وحماية حركة الشبكة، مدعومة بمحرك ذكاء اصطناعي يحلل حركة الشبكة لحظيًا ويقدّم تدابير الحماية المباشرة.',
    },
    audience: {
      en: 'Security and IT teams responsible for defending networks.',
      ar: 'فرق الأمن وتقنية المعلومات المسؤولة عن حماية الشبكات.',
    },
    capabilities: [
      {
        en: 'Smart threat detection: analyzes advanced attack patterns and spots abnormal behavior.',
        ar: 'كشف ذكي للتهديدات: تحليل لأنماط الهجوم المتقدمة واكتشاف السلوكيات الشاذة.',
      },
      {
        en: 'Infrastructure-wide monitoring: follows data flowing in and out of servers and connection points.',
        ar: 'مراقبة شاملة للبنية التحتية: تتبّع تدفقات البيانات الصادرة والواردة وحماية الخوادم ونقاط الاتصال.',
      },
      {
        en: 'Immediate isolation: isolates suspicious devices and issues protection rules tailored to the organization.',
        ar: 'عزل فوري: عزل الأجهزة المشبوهة وإصدار قواعد حماية مخصصة لحفظ أمان المؤسسة.',
      },
    ],
  },
  {
    slug: 'sudaflood',
    name: 'SudaFlood',
    category: 'data-intelligence',
    stage: 'live',
    logo: sudafloodLogo,
    tagline: { en: 'Flood monitoring and early warning.', ar: 'رصد الفيضانات والإنذار المبكر.' },
    summary: {
      en: 'An early-warning platform that helps monitor floods and torrents in Sudan interactively. Its AI analyzes satellite data and sends safety alerts directly to citizens.',
      ar: 'منصة ذكية للإنذار المبكر تساعد في رصد فيضانات وسيول السودان بطريقة تفاعلية، مدعومة بذكاء اصطناعي يحلل بيانات الأقمار الصناعية ويقدّم تنبيهات السلامة المباشرة للمواطنين.',
    },
    audience: {
      en: 'Organizations and communities exposed to flood risk.',
      ar: 'الجهات والمجتمعات المعرّضة لخطر الفيضانات.',
    },
    capabilities: [
      {
        en: 'Hydrological forecasting: predicts the path and rise of water levels ahead of time.',
        ar: 'تنبّؤ هيدرولوجي ذكي: يتوقع مسار مناسيب المياه وارتفاعها مسبقًا.',
      },
      {
        en: 'Coverage of Sudan: focuses on river courses and critical hazard areas.',
        ar: 'تغطية جغرافية سودانية: تركّز على مجاري الأنهار ومناطق الخطر الحيوية في السودان.',
      },
      {
        en: 'Shelter guidance and alerts: identifies the nearest safe areas and issues evacuation alerts.',
        ar: 'إيواء وإنذار فوري: تحديد أقرب المناطق الآمنة وإطلاق تنبيهات الإخلاء.',
      },
      {
        en: 'Alerts can be extended to local languages.',
        ar: 'إمكانية إضافة اللغات المحلية للتنبيه.',
      },
    ],
  },
  {
    slug: 'sudata',
    name: 'Sudata',
    category: 'data-intelligence',
    stage: 'live',
    logo: sudataLogo,
    // Owner approved this product for the site on 2026-09-21 with a short, general overview only. How it
    // gathers or verifies information is deliberately not described.
    tagline: { en: 'Sudanese knowledge atlas.', ar: 'أطلس المعرفة السودانية.' },
    summary: {
      en: 'Sudata is a bilingual knowledge base about Sudan, in Arabic and English. It organizes information into clear, linked references that are easy to search and use, and makes it available for research.',
      ar: 'سوداتا قاعدة معرفة ثنائية اللغة عن السودان، بالعربية والإنجليزية. تنظّم المعلومات في روابط مرجعية واضحة تتيح سهولة البحث والاستخدام، وتتيحها للبحث العلمي.',
    },
    audience: {
      en: 'Researchers and readers looking for information about Sudan.',
      ar: 'الباحثون والقرّاء الذين يبحثون عن معلومات عن السودان.',
    },
    capabilities: [
      {
        en: 'Bilingual: Arabic and English.',
        ar: 'ثنائية اللغة: العربية والإنجليزية.',
      },
      {
        en: 'Knowledge organized into clear, linked references.',
        ar: 'تصنيف المعرفة وربطها في روابط مرجعية واضحة.',
      },
    ],
    languages: ['ar', 'en'],
  },
  {
    slug: 'urri',
    name: 'URRI',
    category: 'language-research',
    stage: 'live',
    logo: urriLogo,
    // Source: the owner's presentation. Its superlatives and size claims ("first", "open source", "millions
    // of words") are left out until they can be evidenced.
    tagline: { en: 'Sudanese language models.', ar: 'نماذج لغوية سودانية.' },
    summary: {
      en: 'URRI is a family of Sudanese language models built on Sudanese vocabulary and colloquial expressions, and designed to run locally on smartphones and tablets.',
      ar: 'أوري عائلة نماذج لغوية سودانية مبنية على المفردات والتعبيرات السودانية الدارجة، ومصمّمة للعمل محليًا على الهواتف الذكية والأجهزة اللوحية.',
    },
    audience: {
      en: 'People and teams who work in Sudanese Arabic.',
      ar: 'الأفراد والفرق الذين يعملون بالعربية السودانية.',
    },
    capabilities: [
      {
        en: 'Built on a large base of Sudanese vocabulary and colloquial expressions.',
        ar: 'مبني على قاعدة كبيرة من المفردات والتعبيرات السودانية الدارجة.',
      },
      {
        en: 'Can run locally on phones and tablets, without an internet connection.',
        ar: 'إمكانية التشغيل المحلي على الهواتف الذكية والأجهزة اللوحية دون إنترنت.',
      },
      {
        en: 'An experimental release that keeps evolving with the needs of Sudanese-dialect users.',
        ar: 'إصدار تجريبي مرن قابل للتطور المستمر لتلبية احتياجات مستخدمي اللهجة السودانية.',
      },
    ],
    languages: ['ar'],
    screens: [
      {
        src: urriScreen,
        alt: {
          en: 'The Sudanese LLM sign-in screen, which asks for an invitation code.',
          ar: 'شاشة الدخول إلى النموذج اللغوي السوداني، وهي تطلب رمز دعوة.',
        },
        caption: {
          en: 'Access is by invitation. To ask for a code, talk to the Sudaverse team.',
          ar: 'الدخول بالدعوة فقط. لطلب رمز، تواصل مع فريق سودافيرس.',
        },
      },
    ],
  },
  {
    slug: 'sudanizer',
    name: 'Sudanizer',
    category: 'language-research',
    stage: 'live',
    logo: sudanizerLogo,
    tagline: { en: 'Tokenization engine for Sudanese dialects.', ar: 'محرك ترميز للهجات السودانية.' },
    summary: {
      en: 'Sudanizer is a text tokenization and segmentation engine built specifically to process Sudanese dialects and to study how distinctive cultural words and expressions are represented, in support of research on Sudanese dialects.',
      ar: 'محرك ترميز وتجزئة للنصوص مصمّم خصيصًا لمعالجة اللهجات السودانية ودراسة تمثيل الكلمات والتعبيرات الثقافية الفريدة، دعمًا للدراسات والبحث العلمي الخاص باللهجات السودانية.',
    },
    audience: {
      en: 'Researchers and teams working with Sudanese dialect text.',
      ar: 'الباحثون والفرق الذين يعملون على نصوص اللهجات السودانية.',
    },
    capabilities: [
      {
        en: 'Trained at scale on a database of Sudanese dialect vocabulary.',
        ar: 'تدريب واسع النطاق على قاعدة بيانات من مفردات اللهجات السودانية.',
      },
      {
        en: 'A wide vocabulary designed to carry cultural expressions and distinctive words.',
        ar: 'حجم مفردات واسع مصمّم لاستيعاب التعبيرات الثقافية والمفردات الفريدة.',
      },
      {
        en: 'Careful handling of word forms, emoji and spelling variation.',
        ar: 'معالجة دقيقة للأشكال الصرفية والرموز التعبيرية والتغيّرات الإملائية.',
      },
    ],
    languages: ['ar'],
  },
  {
    slug: 'llmcorpuskit',
    name: 'LLMCorpusKit',
    category: 'language-research',
    stage: 'live',
    tagline: {
      en: 'Corpus refinery for large-scale Arabic language-model training data.',
      ar: 'مصفاة مدونات لبيانات تدريب النماذج اللغوية العربية واسعة النطاق.',
    },
    summary: {
      en: 'LLMCorpusKit cleans and polishes large Arabic corpora and uses AI-powered semantic repair to fix sentences and improve quality, so the refined corpus stays coherent and culturally authentic.',
      ar: 'ينظّف LLMCorpusKit المدونات العربية الكبيرة ويصقلها ويستخدم إصلاحًا دلاليًا مدعومًا بالذكاء الاصطناعي لتصحيح الجمل ورفع الجودة، فتبقى المدونة المكرّرة متماسكة وأصيلة ثقافيًا.',
    },
    audience: {
      en: 'Teams building or fine-tuning Arabic language models.',
      ar: 'الفرق التي تبني النماذج اللغوية العربية أو تضبطها.',
    },
    capabilities: [
      {
        en: 'Multi-stage cleaning from surface normalization to deep semantic analysis.',
        ar: 'تنظيف متعدد المراحل من التطبيع السطحي إلى التحليل الدلالي العميق.',
      },
      {
        en: 'AI-powered sentence repair for grammatical errors and fragmented text.',
        ar: 'إصلاح الجمل بالذكاء الاصطناعي للأخطاء النحوية والنصوص المجزأة.',
      },
      {
        en: 'Keeps dialect expressions and vocabulary while standardizing orthography. It does not translate to Modern Standard Arabic.',
        ar: 'يحافظ على التعابير والمفردات اللهجية مع توحيد الإملاء. ولا يترجم إلى العربية الفصحى.',
      },
      {
        en: 'Processes large corpora in chunks, resumes after an interruption and shows live progress.',
        ar: 'يعالج المدونات الكبيرة على دفعات، ويستأنف بعد الانقطاع، ويعرض التقدّم مباشرة.',
      },
    ],
    languages: ['ar'],
    docs: 'https://github.com/sudaverse/LLMCorpusKit',
  },
];

export const productBySlug = (slug: string) => products.find((p) => p.slug === slug);
export const productsByCategory = (id: CategoryId) => products.filter((p) => p.category === id);
export const flagshipProducts = products.filter((p) => p.flagship);
