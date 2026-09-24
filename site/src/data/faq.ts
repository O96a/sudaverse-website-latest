import type { Localized } from '@/i18n/config';

/**
 * Frequently asked questions. Every answer restates something that is already on the site or in
 * PRODUCT.md (products.ts, solutions.ts, capabilities.ts, research.ts, the team page). Do not add an
 * answer that needs a new fact: customers, pricing, locations, security practices and certifications
 * are deliberately absent because nothing verified exists for them.
 */
export interface FaqLink {
  label: Localized;
  /** Site path handed to localePath (for example `products/sudatutor`), optionally with a query string. */
  path: string;
}

export interface FaqItem {
  id: string;
  q: Localized;
  a: Localized;
  links?: FaqLink[];
}

export interface FaqGroup {
  id: string;
  title: Localized;
  items: FaqItem[];
}

export const faqGroups: FaqGroup[] = [
  {
    id: 'about',
    title: { en: 'About Sudaverse', ar: 'عن سودافيرس' },
    items: [
      {
        id: 'what',
        q: { en: 'What does Sudaverse do?', ar: 'ماذا تفعل سودافيرس؟' },
        a: {
          en: 'Sudaverse is an applied AI and digital-systems company. We design and build AI products and infrastructure around Arabic and the realities of Sudan, across education, agriculture, cybersecurity and geospatial monitoring, and we release open tools for Arabic language technology.',
          ar: 'سودافيرس شركة للذكاء الاصطناعي التطبيقي والأنظمة الرقمية. نصمّم ونبني منتجات وبنية تحتية بالذكاء الاصطناعي حول اللغة العربية وواقع السودان، في التعليم والزراعة والأمن السيبراني والرصد الجغرافي المكاني، ونُصدر أدوات مفتوحة لتقنيات اللغة العربية.',
        },
        links: [
          { label: { en: 'Products', ar: 'المنتجات' }, path: 'products' },
          { label: { en: 'Solutions', ar: 'الحلول' }, path: 'solutions' },
        ],
      },
      {
        id: 'company',
        q: { en: 'Is Sudaverse a nonprofit or a community initiative?', ar: 'هل سودافيرس منظمة غير ربحية أو مبادرة مجتمعية؟' },
        a: {
          en: 'No. Sudaverse is a company that builds production-oriented AI products. The team is Sudanese-founded and globally connected, and the products are designed around the realities of Sudan.',
          ar: 'لا. سودافيرس شركة تبني منتجات ذكاء اصطناعي موجّهة للإنتاج. أسّسها سودانيون ويعمل فريقها ضمن شبكة عالمية، وتُصمَّم منتجاتها حول واقع السودان.',
        },
        links: [{ label: { en: 'About the company', ar: 'عن الشركة' }, path: 'company' }],
      },
      {
        id: 'team',
        q: { en: 'Who is on the team?', ar: 'من هم أعضاء الفريق؟' },
        a: {
          en: 'Twelve people, including two co-founders: researchers and engineers in machine learning, software, cybersecurity and applied research, plus business development. Names, roles and profiles are on the Company page.',
          ar: 'اثنا عشر شخصًا، بينهم مؤسسان مشاركان: باحثون ومهندسون في التعلم الآلي وهندسة البرمجيات والأمن السيبراني والبحث التطبيقي، إضافة إلى تطوير الأعمال. الأسماء والأدوار والملفات المهنية في صفحة الشركة.',
        },
        links: [{ label: { en: 'Meet the team', ar: 'تعرّف على الفريق' }, path: 'company' }],
      },
    ],
  },
  {
    id: 'products',
    title: { en: 'Products and deployment', ar: 'المنتجات والنشر' },
    items: [
      {
        id: 'available',
        q: { en: 'Which products are available today?', ar: 'ما المنتجات المتاحة اليوم؟' },
        a: {
          en: 'All of them are live: SudaTutor, Terab, Sudan Monitor, SudaFlood, SudaNDR, Sudata, URRI and Sudanizer. LLMCorpusKit is also available as an open-source toolkit under the MIT license. Every product page states its stage plainly.',
          ar: 'كلها متاحة: SudaTutor وTerab وSudan Monitor وSudaFlood وSudaNDR وSudata وURRI وSudanizer. وLLMCorpusKit متاحة أيضًا كحزمة أدوات مفتوحة المصدر بترخيص MIT. وتذكر كل صفحة منتج مرحلتها بوضوح.',
        },
        links: [
          { label: { en: 'All products', ar: 'كل المنتجات' }, path: 'products' },
          { label: { en: 'SudaTutor', ar: 'SudaTutor' }, path: 'products/sudatutor' },
        ],
      },
      {
        id: 'demo',
        q: {
          en: 'Can I see a demo of a product?',
          ar: 'هل يمكنني رؤية عرض تجريبي لأحد المنتجات؟',
        },
        a: {
          en: 'Technical details, demos and pilots are discussed in a briefing. Request one from the contact page and tell us which product you are interested in.',
          ar: 'تُناقَش التفاصيل التقنية والعروض التجريبية والتجارب التجريبية خلال جلسة تعريفية. اطلب جلسة من صفحة التواصل وأخبرنا بالمنتج الذي يهمّك.',
        },
        links: [{ label: { en: 'Request a briefing', ar: 'اطلب عرضًا تعريفيًا' }, path: 'contact?topic=product' }],
      },
      {
        id: 'languages',
        q: { en: 'Which languages do you work in?', ar: 'ما اللغات التي تعملون بها؟' },
        a: {
          en: 'Our language technology focuses on Sudanese Arabic, including dialect variation, code-switching between Arabic, English and local languages, and the low-resource conditions these varieties live in. This website is available in English and Arabic.',
          ar: 'تركّز تقنياتنا اللغوية على العربية السودانية، بما في ذلك تنوّع اللهجات، والتبديل اللغوي بين العربية والإنجليزية واللغات المحلية، وظروف شحّ الموارد التي تعيشها هذه المتغيّرات. وهذا الموقع متاح بالعربية والإنجليزية.',
        },
        links: [{ label: { en: 'Research and development', ar: 'البحث والتطوير' }, path: 'research' }],
      },
      {
        id: 'private',
        q: {
          en: 'Can Sudaverse systems run inside our own environment?',
          ar: 'هل تعمل أنظمة سودافيرس داخل بيئتنا الخاصة؟',
        },
        a: {
          en: 'Selected Sudaverse systems can run against locally hosted models, which keeps sensitive data and models inside an organization’s own environment. Which options apply depends on the product, so raise it in a briefing.',
          ar: 'يمكن لبعض أنظمة سودافيرس العمل مع نماذج مستضافة محليًا، بما يُبقي البيانات والنماذج الحساسة داخل بيئة المؤسسة نفسها. وتختلف الخيارات المتاحة باختلاف المنتج، لذا اطرح سؤالك في جلسة تعريفية.',
        },
        links: [{ label: { en: 'Discuss technical integration', ar: 'ناقش التكامل التقني' }, path: 'contact?topic=integration' }],
      },
      {
        id: 'documents',
        q: {
          en: 'Do you build systems on an organization’s own documents?',
          ar: 'هل تبنون أنظمة على وثائق المؤسسة نفسها؟',
        },
        a: {
          en: 'This is one of our solution areas: Arabic-first assistants and retrieval systems built on an institution’s own documents and data, with deployment options that keep that data in its control.',
          ar: 'هذا أحد مجالات حلولنا: مساعدون وأنظمة استرجاع عربية أولاً تُبنى على وثائق المؤسسة وبياناتها، مع خيارات نشر تُبقي هذه البيانات تحت سيطرتها.',
        },
        links: [
          {
            label: { en: 'AI knowledge systems (RAG)', ar: 'أنظمة معرفة بالذكاء الاصطناعي (RAG)' },
            path: 'solutions#institutional-ai',
          },
        ],
      },
    ],
  },
  {
    id: 'research',
    title: { en: 'Research and open source', ar: 'البحث والمصادر المفتوحة' },
    items: [
      {
        id: 'publish',
        q: { en: 'Do you publish research or open-source work?', ar: 'هل تنشرون أبحاثًا أو أعمالًا مفتوحة المصدر؟' },
        a: {
          en: 'Our public work today is open-source software and benchmarks: LLMCorpusKit and Sudaverse Normalizer, both MIT-licensed, and a Sudanese dialect tokenizer benchmark. Papers and technical reports are listed on the Published research page as they are published.',
          ar: 'أعمالنا العلنية اليوم برمجيات ومعايير قياس مفتوحة المصدر: LLMCorpusKit وSudaverse Normalizer، وكلتاهما بترخيص MIT، ومعيار لقياس أدوات تجزئة النص السوداني العامّي. وتُدرج الأوراق البحثية والتقارير التقنية في صفحة الأبحاث المنشورة عند نشرها.',
        },
        links: [{ label: { en: 'Published research', ar: 'الأبحاث المنشورة' }, path: 'research/published' }],
      },
      {
        id: 'collaborate',
        q: {
          en: 'Can we collaborate with Sudaverse on research or data?',
          ar: 'هل يمكننا التعاون مع سودافيرس في البحث أو البيانات؟',
        },
        a: {
          en: 'We welcome collaboration proposals from researchers and institutions. Choose the research collaboration or the data and model collaboration topic on the contact page.',
          ar: 'نرحّب بمقترحات التعاون من الباحثين والمؤسسات. اختر موضوع التعاون البحثي أو التعاون في البيانات والنماذج في صفحة التواصل.',
        },
        links: [{ label: { en: 'Propose a collaboration', ar: 'اقترح تعاونًا' }, path: 'contact?topic=research' }],
      },
    ],
  },
  {
    id: 'contact',
    title: { en: 'Working with us', ar: 'العمل معنا' },
    items: [
      {
        id: 'services',
        q: { en: 'Does Sudaverse offer consulting and training?', ar: 'هل تقدم سودافيرس الاستشارات والتدريب؟' },
        a: {
          en: 'Yes, for organizations, academic institutions and students. Sudaverse Consultations advises on AI, data and cybersecurity work, and Sudaverse Training Services builds practical skills in those areas in levels from foundations to leadership. Both are described on the Solutions page.',
          ar: 'نعم، للمنظمات والمؤسسات الأكاديمية والطلاب. تقدّم استشارات سودافيرس المشورة في أعمال الذكاء الاصطناعي والبيانات والأمن السيبراني، وتبني خدمات التدريب من سودافيرس مهارات عملية في هذه المجالات في مستويات من الأساسيات حتى القيادة. ويُعرض كلاهما في صفحة الحلول.',
        },
        links: [{ label: { en: 'See the services', ar: 'اطلع على الخدمات' }, path: 'solutions#services' }],
      },
      {
        id: 'start',
        q: { en: 'How do I start a conversation?', ar: 'كيف أبدأ الحديث معكم؟' },
        a: {
          en: 'Use the contact page: pick a topic (product inquiry, institutional partnership, research collaboration, data or model collaboration, technical integration or other), tell us about your project, and your message goes to the Sudaverse team. You can also write to info@sudaverse.com.',
          ar: 'استخدم صفحة التواصل: اختر موضوعًا (استفسار عن منتج، أو شراكة مؤسسية، أو تعاون بحثي، أو تعاون في البيانات والنماذج، أو تكامل تقني، أو غير ذلك)، وأخبرنا عن مشروعك، وستصل رسالتك إلى فريق سودافيرس. ويمكنك أيضًا مراسلة info@sudaverse.com.',
        },
        links: [{ label: { en: 'Talk to Us', ar: 'تواصل معنا' }, path: 'contact' }],
      },
      {
        id: 'institutions',
        q: {
          en: 'Do you work with institutions, enterprises and universities?',
          ar: 'هل تعملون مع المؤسسات والشركات والجامعات؟',
        },
        a: {
          en: 'We welcome partnership proposals from public institutions, enterprises, NGOs, universities and international organizations. Choose the institutional partnership topic on the contact page.',
          ar: 'نرحّب بمقترحات الشراكة من المؤسسات العامة والشركات والمنظمات غير الحكومية والجامعات والمنظمات الدولية. اختر موضوع الشراكة المؤسسية في صفحة التواصل.',
        },
        links: [{ label: { en: 'Institutional partnership', ar: 'شراكة مؤسسية' }, path: 'contact?topic=institutional' }],
      },
    ],
  },
];

export const faqItems = faqGroups.flatMap((g) => g.items);
