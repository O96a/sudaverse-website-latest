import type { ImageMetadata } from 'astro';
import type { Localized } from '@/i18n/config';
import sudatutorLogo from '@/assets/products/sudatutor-logo.png';
import terabLogo from '@/assets/products/terab-logo.png';
import sudandrLogo from '@/assets/products/sudandr-logo.png';
import sudafloodLogo from '@/assets/products/sudaflood-logo.png';
import urriLogo from '@/assets/products/urri-logo.png';
import sudataLogo from '@/assets/products/sudata-logo.png';
import sudanMonitorLogo from '@/assets/products/sudan-monitor-logo.png';
import sudanizerLogo from '@/assets/products/sudanizer-logo.png';

/**
 * Product registry: the single source of truth for menus, product pages, the ecosystem
 * diagram and the footer.
 *
 * CONTENT INTEGRITY: every field must come from the owner's own brief or the already-public
 * site. `problem`, `approach` and `flow` (the project page story, 2026-09-26) restate the approved
 * summary and capabilities and add no new claims; the owner reviews them. Optional fields are omitted
 * until real, approved material exists; the project template hides empty sections.
 * Logos: drop an owner-supplied SVG into src/assets/products/ and point the import at it.
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
  /** The problem the project addresses, in one or two sentences. Drafted from the approved description. */
  problem?: Localized;
  /** How the project tackles it, in one or two sentences. */
  approach?: Localized;
  /** The user flow shown as an animated diagram on the project page (4 to 6 steps). */
  flow?: FlowStep[];
}

export interface FlowStep {
  id: string;
  title: Localized;
  desc: Localized;
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
    problem: {
      en: 'Learners following Sudan’s national curriculum need explanations that match their grade, their books and their context. General-purpose AI tools are not built around the Sudanese curriculum.',
      ar: 'يحتاج المتعلّمون الذين يدرسون المنهج القومي السوداني إلى شرح يناسب صفّهم وكتبهم وسياقهم، وأدوات الذكاء الاصطناعي العامة ليست مبنية حول المنهج السوداني.',
    },
    approach: {
      en: 'SudaTutor is built around the curriculum itself, 12 grade levels and 117 books. Its adaptive engine adjusts each explanation to the learner’s level and age, and progress tracking shows what has been mastered.',
      ar: 'بُني سودا تيوتر حول المنهج نفسه، 12 صفًّا دراسيًا و117 كتابًا. يكيّف محرّكه التكيّفي كل شرح مع مستوى المتعلّم وعمره، وتُظهر متابعة التقدّم ما أتقنه.',
    },
    flow: [
      { id: 'start', title: { en: 'Start', ar: 'البدء' }, desc: { en: 'Begin as a guest, or create a free account.', ar: 'ابدأ كضيف، أو أنشئ حسابًا مجانيًا.' } },
      { id: 'choose', title: { en: 'Choose', ar: 'الاختيار' }, desc: { en: 'Pick your grade and the book you are studying.', ar: 'اختر صفّك والكتاب الذي تدرسه.' } },
      { id: 'ask', title: { en: 'Ask', ar: 'السؤال' }, desc: { en: 'Ask about a lesson, in Arabic.', ar: 'اسأل عن درس، بالعربية.' } },
      { id: 'learn', title: { en: 'Learn', ar: 'التعلّم' }, desc: { en: 'Get an explanation adapted to your level and age.', ar: 'احصل على شرح يناسب مستواك وعمرك.' } },
      { id: 'track', title: { en: 'Track', ar: 'المتابعة' }, desc: { en: 'Follow your progress through continuous assessment.', ar: 'تابع تقدّمك عبر تقييم مستمر.' } },
    ],
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
    problem: {
      en: 'Sudanese farmers make decisions about pests, rainfall and irrigation with little access to specialized agricultural advice, and every wrong call costs a season’s productivity.',
      ar: 'يتخذ المزارع السوداني قراراته بشأن الآفات والأمطار والري دون وصول كافٍ إلى استشارات زراعية متخصصة، وكل قرار خاطئ يكلّف إنتاجية موسم كامل.',
    },
    approach: {
      en: 'Terab brings satellite crop monitoring, weather forecasts, irrigation planning and early pest diagnosis into one platform, and speaks with farmers in their local dialect.',
      ar: 'يجمع تراب مراقبة المحاصيل بالأقمار الصناعية، وتوقعات الطقس، وتخطيط الري، والتشخيص المبكر للآفات في منصة واحدة، ويتحدث مع المزارع بلهجته المحلية.',
    },
    flow: [
      { id: 'join', title: { en: 'Join', ar: 'الانضمام' }, desc: { en: 'Create a farmer account, or sign in.', ar: 'أنشئ حساب مزارع، أو سجّل الدخول.' } },
      { id: 'farm', title: { en: 'Your farm', ar: 'مزرعتك' }, desc: { en: 'Register your farm and the crops you grow.', ar: 'سجّل مزرعتك والمحاصيل التي تزرعها.' } },
      { id: 'monitor', title: { en: 'Monitor', ar: 'المراقبة' }, desc: { en: 'Follow crop health from satellite imagery.', ar: 'تابع صحة المحاصيل عبر صور الأقمار الصناعية.' } },
      { id: 'plan', title: { en: 'Plan', ar: 'التخطيط' }, desc: { en: 'Get weather forecasts and an irrigation schedule.', ar: 'احصل على توقعات الطقس وجدول للري.' } },
      { id: 'diagnose', title: { en: 'Diagnose', ar: 'التشخيص' }, desc: { en: 'Describe a pest in your own dialect and get a suggestion.', ar: 'صِف الآفة بلهجتك واحصل على اقتراح.' } },
    ],
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
    problem: {
      en: 'Teams following critical situations in conflict areas piece together information from many scattered sources, with no single view of what is happening, and where.',
      ar: 'تجمع فرق متابعة الحالات الحرجة في مناطق النزاع معلوماتها من مصادر متفرقة كثيرة، دون صورة واحدة لما يحدث وأين يحدث.',
    },
    approach: {
      en: 'Sudan Monitor ingests information live from multiple sources, news and television included, and places it on a multi-layer, Sudan-centred map beside critical infrastructure.',
      ar: 'يستوعب سودان مونيتور المعلومات حيةً من مصادر متعددة، منها الأخبار والقنوات التلفزيونية، ويضعها على خريطة متعددة الطبقات محورها السودان بجوار البنية التحتية الحيوية.',
    },
    flow: [
      { id: 'ingest', title: { en: 'Ingest', ar: 'الاستيعاب' }, desc: { en: 'Information arrives live from multiple sources.', ar: 'تصل المعلومات حيةً من مصادر متعددة.' } },
      { id: 'watch', title: { en: 'Watch', ar: 'الرصد' }, desc: { en: 'News and television are followed as they broadcast.', ar: 'تُتابَع الأخبار والقنوات أثناء البث.' } },
      { id: 'map', title: { en: 'Map', ar: 'الخريطة' }, desc: { en: 'Each item lands on a Sudan-centred map.', ar: 'يظهر كل عنصر على خريطة محورها السودان.' } },
      { id: 'layer', title: { en: 'Layer', ar: 'الطبقات' }, desc: { en: 'Switch layers, critical infrastructure included.', ar: 'بدّل الطبقات، ومنها البنية التحتية الحيوية.' } },
      { id: 'follow', title: { en: 'Follow', ar: 'المتابعة' }, desc: { en: 'The team sees what is happening, and where.', ar: 'يرى الفريق ما يحدث وأين يحدث.' } },
    ],
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
    problem: {
      en: 'Advanced attacks hide inside normal network traffic. Security teams have to spot them and respond before the damage spreads across servers and connection points.',
      ar: 'تختبئ الهجمات المتقدمة داخل حركة الشبكة العادية، وعلى فرق الأمن أن تكتشفها وتستجيب لها قبل أن ينتشر الضرر عبر الخوادم ونقاط الاتصال.',
    },
    approach: {
      en: 'SudaNDR’s AI engine analyzes network traffic in real time, flags attack patterns and abnormal behavior, and recommends immediate protection, including isolating suspicious devices.',
      ar: 'يحلّل محرك الذكاء الاصطناعي في SudaNDR حركة الشبكة لحظيًا، ويرصد أنماط الهجوم والسلوك الشاذ، ويقترح تدابير حماية فورية منها عزل الأجهزة المشبوهة.',
    },
    flow: [
      { id: 'observe', title: { en: 'Observe', ar: 'المراقبة' }, desc: { en: 'Traffic in and out of servers and connection points is followed.', ar: 'تُتابَع الحركة الواردة والصادرة عبر الخوادم ونقاط الاتصال.' } },
      { id: 'analyze', title: { en: 'Analyze', ar: 'التحليل' }, desc: { en: 'The AI engine analyzes traffic in real time.', ar: 'يحلّل محرك الذكاء الاصطناعي الحركة لحظيًا.' } },
      { id: 'detect', title: { en: 'Detect', ar: 'الكشف' }, desc: { en: 'Attack patterns and abnormal behavior are flagged.', ar: 'تُرصد أنماط الهجوم والسلوك الشاذ.' } },
      { id: 'isolate', title: { en: 'Isolate', ar: 'العزل' }, desc: { en: 'Suspicious devices are isolated immediately.', ar: 'تُعزل الأجهزة المشبوهة فورًا.' } },
      { id: 'protect', title: { en: 'Protect', ar: 'الحماية' }, desc: { en: 'Protection rules tailored to the organization are issued.', ar: 'تصدر قواعد حماية مخصصة للمؤسسة.' } },
    ],
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
    problem: {
      en: 'Floods and torrents along Sudan’s rivers can rise quickly. Communities need warning, and a safe place to go, before the water arrives.',
      ar: 'قد ترتفع الفيضانات والسيول على مجاري أنهار السودان بسرعة، وتحتاج المجتمعات إلى إنذار ومكان آمن تلجأ إليه قبل وصول المياه.',
    },
    approach: {
      en: 'SudaFlood analyzes satellite data with AI to forecast rising water ahead of time, then sends safety alerts, with the nearest safe areas, directly to citizens.',
      ar: 'يحلّل SudaFlood بيانات الأقمار الصناعية بالذكاء الاصطناعي ليتوقع ارتفاع المياه مسبقًا، ثم يرسل تنبيهات السلامة مع أقرب المناطق الآمنة مباشرة إلى المواطنين.',
    },
    flow: [
      { id: 'observe', title: { en: 'Observe', ar: 'الرصد' }, desc: { en: 'Satellite data covers river courses and hazard areas.', ar: 'تغطي بيانات الأقمار الصناعية مجاري الأنهار ومناطق الخطر.' } },
      { id: 'forecast', title: { en: 'Forecast', ar: 'التنبؤ' }, desc: { en: 'AI predicts the path and rise of water levels.', ar: 'يتوقع الذكاء الاصطناعي مسار المياه وارتفاع مناسيبها.' } },
      { id: 'alert', title: { en: 'Alert', ar: 'الإنذار' }, desc: { en: 'Evacuation alerts go directly to citizens.', ar: 'تصل تنبيهات الإخلاء مباشرة إلى المواطنين.' } },
      { id: 'shelter', title: { en: 'Shelter', ar: 'الإيواء' }, desc: { en: 'The nearest safe areas are identified.', ar: 'تُحدَّد أقرب المناطق الآمنة.' } },
    ],
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
    problem: {
      en: 'Reliable information about Sudan is scattered and hard to search, especially for readers moving between Arabic and English.',
      ar: 'المعلومات الموثوقة عن السودان متفرقة ويصعب البحث فيها، خاصة لمن ينتقل بين العربية والإنجليزية.',
    },
    approach: {
      en: 'Sudata organizes knowledge about Sudan into clear, linked references in Arabic and English, easy to search and available for research.',
      ar: 'تنظّم سوداتا المعرفة عن السودان في مراجع واضحة ومترابطة بالعربية والإنجليزية، يسهل البحث فيها ومتاحة للبحث العلمي.',
    },
    flow: [
      { id: 'search', title: { en: 'Search', ar: 'البحث' }, desc: { en: 'Search for a topic in Arabic or English.', ar: 'ابحث عن موضوع بالعربية أو الإنجليزية.' } },
      { id: 'read', title: { en: 'Read', ar: 'القراءة' }, desc: { en: 'Open a clear reference entry.', ar: 'افتح مدخلًا مرجعيًا واضحًا.' } },
      { id: 'follow', title: { en: 'Follow', ar: 'التتبّع' }, desc: { en: 'Move through linked references on related topics.', ar: 'تنقّل عبر المراجع المترابطة في الموضوعات ذات الصلة.' } },
      { id: 'use', title: { en: 'Use', ar: 'الاستخدام' }, desc: { en: 'Use what you found in your own research.', ar: 'استخدم ما وجدته في بحثك.' } },
    ],
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
    problem: {
      en: 'Sudanese colloquial Arabic is a low-resource dialect, and general-purpose language models are not built around its vocabulary. Many also depend on a constant internet connection.',
      ar: 'العربية السودانية الدارجة لهجة شحيحة الموارد، والنماذج اللغوية العامة ليست مبنية حول مفرداتها، وكثير منها يعتمد على اتصال دائم بالإنترنت.',
    },
    approach: {
      en: 'URRI is a family of Sudanese language models built on Sudanese vocabulary and colloquial expressions, and designed to run locally on phones and tablets, without an internet connection.',
      ar: 'أوري عائلة نماذج لغوية سودانية مبنية على المفردات والتعبيرات السودانية الدارجة، ومصمّمة للعمل محليًا على الهواتف والأجهزة اللوحية دون اتصال بالإنترنت.',
    },
    flow: [
      { id: 'request', title: { en: 'Request', ar: 'الطلب' }, desc: { en: 'Access is by invitation: ask the team for a code.', ar: 'الدخول بالدعوة: اطلب رمزًا من الفريق.' } },
      { id: 'signin', title: { en: 'Sign in', ar: 'الدخول' }, desc: { en: 'Enter your invitation code.', ar: 'أدخل رمز الدعوة.' } },
      { id: 'write', title: { en: 'Write', ar: 'الكتابة' }, desc: { en: 'Write in Sudanese Arabic, the way you speak.', ar: 'اكتب بالعربية السودانية كما تتحدث.' } },
      { id: 'reply', title: { en: 'Reply', ar: 'الرد' }, desc: { en: 'Get a reply from a model built on Sudanese vocabulary.', ar: 'احصل على رد من نموذج مبني على المفردات السودانية.' } },
    ],
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
    problem: {
      en: 'General-purpose tokenizers split Sudanese dialect words into many small fragments. In our public benchmark, a widely used tokenizer needs more than four tokens per word, and distinctive cultural words are broken apart.',
      ar: 'تقطّع أدوات التجزئة العامة كلمات اللهجة السودانية إلى أجزاء صغيرة كثيرة. في معيارنا المفتوح احتاجت أداة تجزئة واسعة الاستخدام إلى أكثر من أربعة رموز للكلمة الواحدة، وتتفكك الكلمات الثقافية المميّزة.',
    },
    approach: {
      en: 'Sudanizer is a byte-pair encoding tokenizer trained at scale on Sudanese dialect vocabulary, with a wide vocabulary for cultural expressions and careful handling of word forms, emoji and spelling variation.',
      ar: 'Sudanizer أداة تجزئة بترميز أزواج البايتات، دُرّبت على نطاق واسع على مفردات اللهجات السودانية، بحجم مفردات واسع للتعبيرات الثقافية ومعالجة دقيقة للأشكال الصرفية والرموز التعبيرية والتغيّرات الإملائية.',
    },
    flow: [
      { id: 'input', title: { en: 'Input', ar: 'الإدخال' }, desc: { en: 'Raw Sudanese dialect text, as people write it.', ar: 'نص خام باللهجة السودانية، كما يكتبه الناس.' } },
      { id: 'normalize', title: { en: 'Normalize', ar: 'التوحيد' }, desc: { en: 'Spelling variation, word forms and emoji are handled.', ar: 'تُعالج التغيّرات الإملائية والأشكال الصرفية والرموز التعبيرية.' } },
      { id: 'segment', title: { en: 'Segment', ar: 'التجزئة' }, desc: { en: 'Text is split into dialect-aware subword tokens.', ar: 'يُقسَّم النص إلى رموز فرعية تراعي اللهجة.' } },
      { id: 'use', title: { en: 'Use', ar: 'الاستخدام' }, desc: { en: 'Tokens feed language models and dialect research.', ar: 'تغذّي الرموز النماذج اللغوية وأبحاث اللهجة.' } },
    ],
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
    problem: {
      en: 'Large Arabic corpora collected for training are noisy: broken sentences, inconsistent spelling and fragments lower the quality of any model trained on them.',
      ar: 'المدونات العربية الكبيرة المجمّعة للتدريب مليئة بالضوضاء: جمل مكسورة وإملاء غير متسق وأجزاء متقطعة تُضعف جودة أي نموذج يُدرَّب عليها.',
    },
    approach: {
      en: 'LLMCorpusKit refines a corpus in stages, from surface normalization to deep semantic analysis. It repairs sentences with AI and standardizes spelling while keeping dialect vocabulary.',
      ar: 'ينقّي LLMCorpusKit المدونة على مراحل، من التطبيع السطحي إلى التحليل الدلالي العميق، ويصلح الجمل بالذكاء الاصطناعي، ويوحّد الإملاء مع الحفاظ على مفردات اللهجة.',
    },
    flow: [
      { id: 'load', title: { en: 'Load', ar: 'التحميل' }, desc: { en: 'Point the kit at a large Arabic corpus.', ar: 'وجّه الحزمة إلى مدونة عربية كبيرة.' } },
      { id: 'clean', title: { en: 'Clean', ar: 'التنظيف' }, desc: { en: 'Multi-stage cleaning, from normalization to semantic analysis.', ar: 'تنظيف متعدد المراحل، من التطبيع إلى التحليل الدلالي.' } },
      { id: 'repair', title: { en: 'Repair', ar: 'الإصلاح' }, desc: { en: 'AI repairs grammatical errors and fragmented sentences.', ar: 'يصلح الذكاء الاصطناعي الأخطاء النحوية والجمل المتقطعة.' } },
      { id: 'standardize', title: { en: 'Standardize', ar: 'التوحيد' }, desc: { en: 'Spelling is standardized, dialect expressions are kept.', ar: 'يُوحَّد الإملاء وتُحفظ التعابير اللهجية.' } },
      { id: 'process', title: { en: 'Process', ar: 'المعالجة' }, desc: { en: 'Chunks run with live progress and resume after an interruption.', ar: 'تُعالج الدفعات مع عرض حي للتقدّم واستئناف بعد الانقطاع.' } },
    ],
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
