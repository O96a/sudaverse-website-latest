import type { Localized } from '@/i18n/config';

/**
 * "Who we serve": one page per kind of organization, in the way large AI and data companies organize
 * their sites (the challenge, how the company helps, how the work proceeds, where the data lives).
 *
 * CONTENT INTEGRITY: every line restates something already on the site (solutions.ts, products.ts,
 * capabilities.ts, services.ts, PRODUCT.md). Pages describe what Sudaverse offers and invites; they never
 * claim a customer, contract, deployment or relationship, and they never name one. Products and solutions
 * are referenced by slug so links and stage badges stay correct.
 */
export type AudienceIcon = 'briefcase' | 'building' | 'landmark' | 'globe' | 'cap' | 'code';
export type ContactTopic = 'product' | 'institutional' | 'research' | 'data' | 'integration' | 'other';

export interface AudiencePoint {
  t: Localized;
  d: Localized;
  /** Site path handed to localePath, optionally with a query or hash. */
  link?: string;
}

export interface Audience {
  slug: string;
  icon: AudienceIcon;
  /** Menu label. */
  name: Localized;
  /** One line under the label in the menu and on the overview page. */
  short: Localized;
  h1: Localized;
  lead: Localized;
  needs: AudiencePoint[];
  help: AudiencePoint[];
  /** Product slugs from products.ts. */
  products: string[];
  topic: ContactTopic;
}

export const audiences: Audience[] = [
  {
    slug: 'private-sector',
    icon: 'briefcase',
    name: { en: 'Private sector', ar: 'القطاع الخاص' },
    short: { en: 'Companies putting AI and data to work in Arabic.', ar: 'شركات توظّف الذكاء الاصطناعي والبيانات بالعربية.' },
    h1: { en: 'AI and digital systems for companies', ar: 'ذكاء اصطناعي وأنظمة رقمية للشركات' },
    lead: {
      en: 'Companies working in Sudan and the region serve customers who write in Arabic, keep data in many places and cannot always send it outside. Sudaverse builds AI products and infrastructure that fit those conditions, and advises on where AI will pay off before anything is built.',
      ar: 'تخدم الشركات العاملة في السودان والمنطقة عملاء يكتبون بالعربية، وتحتفظ ببياناتها في أماكن متعددة، ولا تستطيع دائمًا إرسالها إلى الخارج. تبني سودافيرس منتجات وبنية تحتية بالذكاء الاصطناعي تناسب هذه الظروف، وتقدّم المشورة في المواضع التي يعود فيها الذكاء الاصطناعي بنفع حقيقي قبل بدء أي بناء.',
    },
    needs: [
      {
        t: { en: 'Customers and staff who work in Arabic', ar: 'عملاء وموظفون يعملون بالعربية' },
        d: {
          en: 'Most language models handle Sudanese dialects, code-switching and informal writing poorly, so assistants built on them let people down.',
          ar: 'تتعامل معظم النماذج اللغوية بضعف مع اللهجات السودانية والتبديل اللغوي والكتابة غير الرسمية، فيخيّب المساعدون المبنيون عليها ظنّ المستخدمين.',
        },
      },
      {
        t: { en: 'Data nobody fully trusts', ar: 'بيانات لا يثق بها أحد تمامًا' },
        d: {
          en: 'Decisions depend on data that is scattered, noisy and hard to trust.',
          ar: 'تعتمد القرارات على بيانات مبعثرة ومشوشة يصعب الوثوق بها.',
        },
      },
      {
        t: { en: 'Sensitive data that should stay put', ar: 'بيانات حساسة ينبغي أن تبقى في مكانها' },
        d: {
          en: 'Some companies cannot send sensitive data to a public model or a foreign cloud.',
          ar: 'لا تستطيع بعض الشركات إرسال بياناتها الحساسة إلى نموذج عام أو سحابة أجنبية.',
        },
      },
    ],
    help: [
      {
        t: { en: 'AI assistants and knowledge systems', ar: 'مساعدون وأنظمة معرفة بالذكاء الاصطناعي' },
        d: {
          en: 'Arabic-first assistants and retrieval systems built on your own documents and data.',
          ar: 'مساعدون وأنظمة استرجاع عربية أولًا تُبنى على وثائقك وبياناتك.',
        },
        link: 'solutions#institutional-ai',
      },
      {
        t: { en: 'Data engineering and insight', ar: 'هندسة البيانات والتحليل' },
        d: {
          en: 'Cleaning, organizing and analysing data so that decisions rest on something you can check.',
          ar: 'تنظيف البيانات وتنظيمها وتحليلها لتقوم القرارات على ما يمكنك التحقق منه.',
        },
        link: 'solutions#data-intelligence',
      },
      {
        t: { en: 'Private and local deployment', ar: 'النشر الخاص والمحلي' },
        d: {
          en: 'Options that keep sensitive data and models inside your own environment.',
          ar: 'خيارات تُبقي البيانات والنماذج الحساسة داخل بيئتك.',
        },
        link: 'solutions#secure-ai',
      },
      {
        t: { en: 'Advice before you build', ar: 'مشورة قبل البناء' },
        d: {
          en: 'Sudaverse Consultations helps define the use case and the data and security requirements first.',
          ar: 'تساعد استشارات سودافيرس في تحديد حالة الاستخدام ومتطلبات البيانات والأمن أولًا.',
        },
        link: 'solutions#services',
      },
    ],
    products: ['terab', 'sudandr', 'urri', 'llmcorpuskit'],
    topic: 'institutional',
  },
  {
    slug: 'large-organizations',
    icon: 'building',
    name: { en: 'Large organizations', ar: 'المؤسسات الكبرى' },
    short: { en: 'Enterprise-scale systems, governance and integration.', ar: 'أنظمة بمقياس المؤسسة، وحوكمة، وتكامل.' },
    h1: { en: 'AI for large organizations', ar: 'الذكاء الاصطناعي للمؤسسات الكبرى' },
    lead: {
      en: 'Large organizations do not need another isolated pilot. They need AI that fits their data governance, connects to the systems they already run and can be checked. Sudaverse plans, builds and integrates in stages, and designs systems so that models can be replaced as they change.',
      ar: 'لا تحتاج المؤسسات الكبرى إلى تجربة معزولة أخرى. تحتاج إلى ذكاء اصطناعي يناسب حوكمة بياناتها، ويرتبط بالأنظمة التي تشغّلها فعلًا، ويمكن التحقق منه. تخطط سودافيرس وتبني وتدمج على مراحل، وتصمّم الأنظمة بحيث يمكن استبدال النماذج مع تغيّرها.',
    },
    needs: [
      {
        t: { en: 'Governance before scale', ar: 'الحوكمة قبل التوسع' },
        d: {
          en: 'Data classification, access control and audit have to be settled before AI reaches many users.',
          ar: 'يجب حسم تصنيف البيانات وضبط الصلاحيات والتدقيق قبل أن يصل الذكاء الاصطناعي إلى مستخدمين كثيرين.',
        },
      },
      {
        t: { en: 'Integration with what already runs', ar: 'التكامل مع ما هو قائم' },
        d: {
          en: 'Value comes from connecting AI to the documents, databases and workflows people already rely on.',
          ar: 'تأتي القيمة من ربط الذكاء الاصطناعي بالوثائق وقواعد البيانات وسير العمل التي يعتمد عليها الناس أصلًا.',
        },
      },
      {
        t: { en: 'Models that keep changing', ar: 'نماذج تتغيّر باستمرار' },
        d: {
          en: 'Models and vendors change quickly, and a system tied to one of them carries risk.',
          ar: 'تتغيّر النماذج والموردون بسرعة، والنظام المرتبط بأحدهم يحمل مخاطرة.',
        },
      },
    ],
    help: [
      {
        t: { en: 'A staged approach', ar: 'نهج مرحلي' },
        d: {
          en: 'A discovery conversation, a scoped pilot, and expansion only after security, traceability and results have been checked.',
          ar: 'محادثة استكشاف، ثم تجربة محدودة النطاق، ولا توسّع إلا بعد التحقق من الأمن وقابلية التتبع والنتائج.',
        },
      },
      {
        t: { en: 'Traceable outputs', ar: 'مخرجات قابلة للتتبع' },
        d: {
          en: 'We design systems so that answers can be traced to their sources and high-risk actions pass a human approval step.',
          ar: 'نصمّم الأنظمة بحيث يمكن تتبّع الإجابات إلى مصادرها، وتمرّ الإجراءات عالية الخطورة بخطوة موافقة بشرية.',
        },
      },
      {
        t: { en: 'Deployment where your data must stay', ar: 'نشر حيث يجب أن تبقى بياناتك' },
        d: {
          en: 'Options that keep data and models in your own environment, agreed product by product.',
          ar: 'خيارات تُبقي البيانات والنماذج داخل بيئتك، يُتفق عليها منتجًا بمنتج.',
        },
        link: 'solutions#secure-ai',
      },
      {
        t: { en: 'Security engineering', ar: 'هندسة الأمن' },
        d: {
          en: 'A team with cybersecurity engineering experience, and SudaNDR for network detection and response.',
          ar: 'فريق ذو خبرة في هندسة الأمن السيبراني، وSudaNDR لكشف الشبكات والاستجابة لها.',
        },
        link: 'products/sudandr',
      },
    ],
    products: ['sudandr', 'llmcorpuskit', 'urri', 'sudata'],
    topic: 'institutional',
  },
  {
    slug: 'public-institutions',
    icon: 'landmark',
    name: { en: 'Public institutions', ar: 'المؤسسات العامة' },
    short: { en: 'Public bodies that need Arabic AI, data and monitoring.', ar: 'جهات عامة تحتاج ذكاءً اصطناعيًا وبيانات ومراقبة بالعربية.' },
    h1: { en: 'AI and digital systems for public institutions', ar: 'ذكاء اصطناعي وأنظمة رقمية للمؤسسات العامة' },
    lead: {
      en: 'Public institutions hold decades of records, serve people who work in Arabic and often need to see what is happening on the ground early enough to act. Sudaverse builds Arabic AI, data and geospatial systems for them, with deployment options that keep sensitive data under the institution’s control.',
      ar: 'تحتفظ المؤسسات العامة بعقود من السجلات، وتخدم أناسًا يعملون بالعربية، وكثيرًا ما تحتاج إلى معرفة ما يجري على الأرض في وقت يكفي للتحرك. تبني سودافيرس لها أنظمة ذكاء اصطناعي وبيانات وخرائط بالعربية، مع خيارات نشر تُبقي البيانات الحساسة تحت سيطرة المؤسسة.',
    },
    needs: [
      {
        t: { en: 'Records nobody can search', ar: 'سجلات لا يستطيع أحد البحث فيها' },
        d: {
          en: 'Institutions hold decades of documents that nobody can search or query in Arabic.',
          ar: 'تحتفظ المؤسسات بعقود من الوثائق التي لا يستطيع أحد البحث فيها أو الاستعلام عنها بالعربية.',
        },
      },
      {
        t: { en: 'Knowing what is happening, and where', ar: 'معرفة ما يحدث وأين' },
        d: {
          en: 'Organizations need to know what is happening, where, and early enough to respond.',
          ar: 'تحتاج الجهات إلى معرفة ما يحدث وأين يحدث، وبوقت كافٍ للاستجابة.',
        },
      },
      {
        t: { en: 'Control over sensitive data', ar: 'السيطرة على البيانات الحساسة' },
        d: {
          en: 'Some institutions cannot send sensitive data to a public model or a foreign cloud.',
          ar: 'لا تستطيع بعض المؤسسات إرسال بياناتها الحساسة إلى نموذج عام أو سحابة أجنبية.',
        },
      },
    ],
    help: [
      {
        t: { en: 'AI knowledge systems', ar: 'أنظمة معرفة بالذكاء الاصطناعي' },
        d: {
          en: 'Arabic-first assistants and retrieval built on an institution’s own documents and data.',
          ar: 'مساعدون واسترجاع عربية أولًا، مبنية على وثائق المؤسسة وبياناتها.',
        },
        link: 'solutions#institutional-ai',
      },
      {
        t: { en: 'Geospatial monitoring', ar: 'المراقبة الجغرافية المكانية' },
        d: {
          en: 'Sudan Monitor and SudaFlood bring information onto a map, with early warning for floods.',
          ar: 'يضع Sudan Monitor وSudaFlood المعلومات على الخريطة، مع إنذار مبكر بالفيضانات.',
        },
        link: 'solutions#geospatial-monitoring',
      },
      {
        t: { en: 'Secure and private AI', ar: 'ذكاء اصطناعي آمن وخاص' },
        d: {
          en: 'Options that keep sensitive data and models inside the institution’s own environment.',
          ar: 'خيارات تُبقي البيانات والنماذج الحساسة داخل بيئة المؤسسة نفسها.',
        },
        link: 'solutions#secure-ai',
      },
      {
        t: { en: 'Training for institutional teams', ar: 'تدريب فرق المؤسسة' },
        d: {
          en: 'Practical training in applied AI, data and cybersecurity, agreed with each institution.',
          ar: 'تدريب عملي في الذكاء الاصطناعي التطبيقي والبيانات والأمن السيبراني، يُتفق عليه مع كل مؤسسة.',
        },
        link: 'solutions#services',
      },
    ],
    products: ['sudan-monitor', 'sudaflood', 'sudandr', 'sudata'],
    topic: 'institutional',
  },
  {
    slug: 'ngos',
    icon: 'globe',
    name: { en: 'NGOs and international organizations', ar: 'المنظمات غير الحكومية والدولية' },
    short: { en: 'Situational awareness, early warning and Arabic tools.', ar: 'وعي بالموقف وإنذار مبكر وأدوات بالعربية.' },
    h1: { en: 'Tools for NGOs and international organizations', ar: 'أدوات للمنظمات غير الحكومية والدولية' },
    lead: {
      en: 'Organizations working in Sudan need reliable information, early warning and tools in the languages people actually use. Sudaverse builds them with local context and talks with programme teams about how they fit the work.',
      ar: 'تحتاج المنظمات العاملة في السودان إلى معلومات موثوقة وإنذار مبكر وأدوات باللغات التي يستخدمها الناس فعلًا. تبنيها سودافيرس بسياق محلي، وتتحدث مع فرق البرامج حول كيفية ملاءمتها للعمل.',
    },
    needs: [
      {
        t: { en: 'Following critical situations', ar: 'متابعة الحالات الحرجة' },
        d: {
          en: 'Teams need to see what is happening and where, from many sources, in one place.',
          ar: 'تحتاج الفرق إلى رؤية ما يحدث وأين، من مصادر متعددة، في مكان واحد.',
        },
      },
      {
        t: { en: 'Warning before floods', ar: 'إنذار قبل الفيضانات' },
        d: {
          en: 'Flood risk needs warning that reaches people early enough to act.',
          ar: 'يحتاج خطر الفيضانات إلى إنذار يصل إلى الناس مبكرًا بما يكفي للتحرك.',
        },
      },
      {
        t: { en: 'Tools in the local language', ar: 'أدوات باللغة المحلية' },
        d: {
          en: 'Learning, farming and information tools work best in the language and curriculum people already use.',
          ar: 'تعمل أدوات التعلم والزراعة والمعلومات بأفضل صورة حين تكون باللغة والمنهج اللذين يستخدمهما الناس أصلًا.',
        },
      },
    ],
    help: [
      {
        t: { en: 'Situational awareness', ar: 'الوعي بالموقف' },
        d: {
          en: 'Sudan Monitor puts information from multiple sources on one map.',
          ar: 'يضع Sudan Monitor المعلومات من مصادر متعددة على خريطة واحدة.',
        },
        link: 'products/sudan-monitor',
      },
      {
        t: { en: 'Flood early warning', ar: 'الإنذار المبكر بالفيضانات' },
        d: {
          en: 'SudaFlood monitors floods and issues safety alerts.',
          ar: 'يرصد SudaFlood الفيضانات ويطلق تنبيهات السلامة.',
        },
        link: 'products/sudaflood',
      },
      {
        t: { en: 'Agriculture support', ar: 'دعم الزراعة' },
        d: {
          en: 'Terab gives farmers agricultural advice and monitoring, and speaks with them in the local dialect.',
          ar: 'يقدّم Terab للمزارعين استشارات زراعية ومراقبة، ويتحدث معهم باللهجة المحلية.',
        },
        link: 'solutions#agricultural-intelligence',
      },
      {
        t: { en: 'Education', ar: 'التعليم' },
        d: {
          en: 'SudaTutor helps learners study the Sudanese national curriculum.',
          ar: 'يساعد SudaTutor المتعلمين على دراسة المنهج القومي السوداني.',
        },
        link: 'solutions#education-platforms',
      },
    ],
    products: ['sudan-monitor', 'sudaflood', 'terab', 'sudatutor'],
    topic: 'institutional',
  },
  {
    slug: 'academic-institutions',
    icon: 'cap',
    name: { en: 'Academic institutions', ar: 'المؤسسات الأكاديمية' },
    short: { en: 'Universities, researchers and students.', ar: 'جامعات وباحثون وطلاب.' },
    h1: { en: 'For universities, researchers and students', ar: 'للجامعات والباحثين والطلاب' },
    lead: {
      en: 'Sudaverse welcomes cooperation with universities and research groups on curricula, student training and applied research, and builds tools that students and teachers can use today.',
      ar: 'ترحّب سودافيرس بالتعاون مع الجامعات والمجموعات البحثية في المناهج وتدريب الطلاب والبحث التطبيقي، وتبني أدوات يستطيع الطلاب والمعلمون استخدامها اليوم.',
    },
    needs: [
      {
        t: { en: 'Support in the national curriculum', ar: 'دعم في المنهج القومي' },
        d: {
          en: 'Learners and teachers need support in the language and curriculum they actually use.',
          ar: 'يحتاج المتعلمون والمعلمون إلى دعم باللغة والمنهج اللذين يستخدمونهما فعلًا.',
        },
      },
      {
        t: { en: 'Language resources for Sudanese Arabic', ar: 'موارد لغوية للعربية السودانية' },
        d: {
          en: 'Sudanese dialects are a low-resource language variant, so tokenizers, normalization and corpora have to be built and measured for them.',
          ar: 'اللهجات السودانية متغيّر لغوي شحيح الموارد، لذا يجب بناء أدوات التجزئة والتطبيع والمدونات وقياسها خصيصًا لها.',
        },
      },
      {
        t: { en: 'Practical skills', ar: 'مهارات عملية' },
        d: {
          en: 'Training that builds practical skills in applied AI, data and cybersecurity.',
          ar: 'تدريب يبني مهارات عملية في الذكاء الاصطناعي التطبيقي والبيانات والأمن السيبراني.',
        },
      },
    ],
    help: [
      {
        t: { en: 'A tutor for the national curriculum', ar: 'معلّم للمنهج القومي' },
        d: {
          en: 'SudaTutor covers 12 grade levels and 117 books of the Sudanese curriculum.',
          ar: 'يغطي SudaTutor 12 صفًّا دراسيًا و117 كتابًا من المنهج السوداني.',
        },
        link: 'products/sudatutor',
      },
      {
        t: { en: 'Open tools for research', ar: 'أدوات مفتوحة للبحث' },
        d: {
          en: 'LLMCorpusKit, a normalizer and a dialect tokenizer benchmark are public on GitHub.',
          ar: 'LLMCorpusKit ومطبّع نصوص ومعيار قياس لتجزئة اللهجات منشورة علنًا على GitHub.',
        },
        link: 'research/published',
      },
      {
        t: { en: 'Training and consulting', ar: 'التدريب والاستشارات' },
        d: {
          en: 'For academic institutions and students, agreed with each institution.',
          ar: 'للمؤسسات الأكاديمية والطلاب، ويُتفق عليها مع كل مؤسسة.',
        },
        link: 'solutions#services',
      },
      {
        t: { en: 'Research collaboration', ar: 'التعاون البحثي' },
        d: {
          en: 'Propose joint work on datasets, benchmarks, models and applied studies.',
          ar: 'اقترح عملًا مشتركًا في مجموعات البيانات ومعايير القياس والنماذج والدراسات التطبيقية.',
        },
        link: 'contact?topic=research',
      },
    ],
    products: ['sudatutor', 'llmcorpuskit', 'sudanizer', 'sudata'],
    topic: 'research',
  },
  {
    slug: 'developers',
    icon: 'code',
    name: { en: 'Developers and technical teams', ar: 'المطورون والفرق التقنية' },
    short: { en: 'Open tools, documentation and integration.', ar: 'أدوات مفتوحة وتوثيق وتكامل.' },
    h1: { en: 'For developers and technical teams', ar: 'للمطورين والفرق التقنية' },
    lead: {
      en: 'Sudaverse publishes open tools for Arabic language data, documents how to use them, and works with technical teams on integration.',
      ar: 'تنشر سودافيرس أدوات مفتوحة لبيانات اللغة العربية، وتوثّق طريقة استخدامها، وتعمل مع الفرق التقنية على التكامل.',
    },
    needs: [
      {
        t: { en: 'Clean Arabic training data', ar: 'بيانات تدريب عربية نظيفة' },
        d: {
          en: 'Large Arabic corpora need cleaning, repair and quality scoring before they are useful for model training.',
          ar: 'تحتاج المدونات العربية الكبيرة إلى تنظيف وإصلاح وتقييم للجودة قبل أن تنفع في تدريب النماذج.',
        },
      },
      {
        t: { en: 'Tokenizers that cope with dialects', ar: 'أدوات تجزئة تتعامل مع اللهجات' },
        d: {
          en: 'How efficiently a tokenizer handles Sudanese dialect text matters, and it can be measured.',
          ar: 'تهمّ كفاءة أداة التجزئة في التعامل مع النص السوداني العامّي، ويمكن قياسها.',
        },
      },
      {
        t: { en: 'Clear documentation and a team to ask', ar: 'توثيق واضح وفريق تسأله' },
        d: {
          en: 'Connecting a product to your systems needs documentation and people who can answer questions.',
          ar: 'يحتاج ربط أي منتج بأنظمتك إلى توثيق وأشخاص يجيبون عن الأسئلة.',
        },
      },
    ],
    help: [
      {
        t: { en: 'LLMCorpusKit', ar: 'LLMCorpusKit' },
        d: {
          en: 'An MIT-licensed toolkit for cleaning and scoring Arabic corpora.',
          ar: 'حزمة أدوات بترخيص MIT لتنظيف المدونات العربية وتقييمها.',
        },
        link: 'products/llmcorpuskit',
      },
      {
        t: { en: 'Documentation', ar: 'التوثيق' },
        d: {
          en: 'Guides for installing and using the public open-source toolkit.',
          ar: 'أدلة لتثبيت الحزمة المفتوحة المصدر واستخدامها.',
        },
        link: 'resources/documentation',
      },
      {
        t: { en: 'Open source on GitHub', ar: 'مفتوح المصدر على GitHub' },
        d: {
          en: 'A normalizer and a tokenizer benchmark alongside the toolkit.',
          ar: 'مطبّع نصوص ومعيار قياس لأدوات التجزئة إلى جانب الحزمة.',
        },
        link: 'research/published',
      },
      {
        t: { en: 'Integration', ar: 'التكامل' },
        d: {
          en: 'Talk to the engineering team about connecting a product to your systems.',
          ar: 'تحدّث مع الفريق الهندسي عن ربط أحد المنتجات بأنظمتك.',
        },
        link: 'contact?topic=integration',
      },
    ],
    products: ['llmcorpuskit', 'sudanizer', 'urri'],
    topic: 'integration',
  },
];

export const audienceBySlug = (slug: string) => audiences.find((a) => a.slug === slug);
