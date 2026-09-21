import type { Localized } from '@/i18n/config';

/**
 * Engineering capabilities. Each carries evidence that already exists publicly
 * (team biographies, public documentation, named products). No capability is listed
 * without a source; "evidence" is shown to visitors so the claim is checkable.
 */
export interface Capability {
  id: string;
  title: Localized;
  /** What it means in practice, one sentence. */
  summary: Localized;
  /** Where the claim comes from. */
  evidence: Localized;
}

export const capabilities: Capability[] = [
  {
    id: 'llm-rag',
    title: { en: 'Language models and retrieval', ar: 'النماذج اللغوية والاسترجاع' },
    summary: {
      en: 'Tutoring, assistants and knowledge systems built Arabic first.',
      ar: 'معلّمون ومساعدون وأنظمة معرفة مبنية بالعربية أولًا.',
    },
    evidence: {
      en: 'SudaTutor is live. LLMCorpusKit repairs and scores Arabic corpora for model training.',
      ar: 'سودا تيوتر متاح. وتقوم LLMCorpusKit بإصلاح المدونات العربية وتقييمها لتدريب النماذج.',
    },
  },
  {
    id: 'data-engineering',
    title: { en: 'Data engineering', ar: 'هندسة البيانات' },
    summary: {
      en: 'Cleaning, repair and quality scoring for large Arabic text corpora.',
      ar: 'تنظيف المدونات النصية العربية الكبيرة وإصلاحها وتقييم جودتها.',
    },
    evidence: {
      en: 'LLMCorpusKit is public: multi-stage cleaning, AI-powered sentence repair and quality scoring.',
      ar: 'LLMCorpusKit متاحة علنًا: تنظيف متعدد المراحل، وإصلاح للجمل بالذكاء الاصطناعي، وتقييم للجودة.',
    },
  },
  {
    id: 'machine-learning',
    title: { en: 'Applied machine learning', ar: 'التعلم الآلي التطبيقي' },
    summary: {
      en: 'Prediction and analysis for agriculture, health and operations.',
      ar: 'تنبؤ وتحليل للزراعة والصحة والعمليات.',
    },
    evidence: {
      en: 'Team members work on applied machine learning, competitive modeling and real-world experimentation.',
      ar: 'يعمل أعضاء في الفريق على التعلم الآلي التطبيقي والنمذجة التنافسية والتجارب الواقعية.',
    },
  },
  {
    id: 'computer-vision',
    title: { en: 'Computer vision', ar: 'الرؤية الحاسوبية' },
    summary: {
      en: 'Image understanding for documents, heritage material and accessibility.',
      ar: 'فهم الصور للوثائق والمواد التراثية وإتاحة الوصول.',
    },
    evidence: {
      en: 'A PhD researcher on the team works on computer vision and generative AI, including sign language translation.',
      ar: 'باحثة دكتوراه في الفريق تعمل على الرؤية الحاسوبية والذكاء الاصطناعي التوليدي، ومنه ترجمة لغة الإشارة.',
    },
  },
  {
    id: 'graph-learning',
    title: { en: 'Graph learning', ar: 'التعلم على الرسوم البيانية' },
    summary: {
      en: 'Models over networks and relationships, and self-supervised learning at scale.',
      ar: 'نماذج على الشبكات والعلاقات، وتعلّم ذاتي الإشراف على نطاق واسع.',
    },
    evidence: {
      en: 'A senior AI engineer on the team is a former Meta AI Resident specializing in graph neural networks.',
      ar: 'مهندس ذكاء اصطناعي أول في الفريق، وهو مقيم سابق في Meta AI متخصص في الشبكات العصبية الرسومية.',
    },
  },
  {
    id: 'geospatial',
    title: { en: 'Geospatial systems', ar: 'الأنظمة الجغرافية المكانية' },
    summary: {
      en: 'Situational awareness and early warning built on location data.',
      ar: 'وعي بالموقف وإنذار مبكر مبنيان على البيانات المكانية.',
    },
    evidence: {
      en: 'Sudan Monitor and SudaFlood are live.',
      ar: 'سودان مونيتور وسودا فلود متاحان.',
    },
  },
  {
    id: 'cybersecurity',
    title: { en: 'Cybersecurity', ar: 'الأمن السيبراني' },
    summary: {
      en: 'Secure architecture, threat detection and protection of critical data infrastructure.',
      ar: 'بنية آمنة وكشف للتهديدات وحماية للبنية التحتية الحيوية للبيانات.',
    },
    evidence: {
      en: 'The team includes a SIEM and cybersecurity engineer and a CISSP-certified information systems expert. SudaNDR is live.',
      ar: 'يضم الفريق مهندس SIEM وأمن سيبراني وخبير نظم معلومات حاصلًا على شهادة CISSP. وSudaNDR متاح.',
    },
  },
  {
    id: 'private-deployment',
    title: { en: 'Local and private deployment', ar: 'النشر المحلي والخاص' },
    summary: {
      en: 'Options that keep sensitive data and models inside an organization’s own environment.',
      ar: 'خيارات تُبقي البيانات والنماذج الحساسة داخل بيئة المؤسسة نفسها.',
    },
    evidence: {
      en: 'Selected Sudaverse systems can run against locally hosted models.',
      ar: 'يمكن لبعض أنظمة سودافيرس العمل مع نماذج مستضافة محليًا.',
    },
  },
];

export const capabilityById = (id: string) => capabilities.find((c) => c.id === id);
