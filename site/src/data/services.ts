import type { Localized } from '@/i18n/config';

/**
 * Services, shown as a high-level overview under the homepage hero (owner request, 2026-09-26).
 * Descriptions stay general on purpose: no customers, results, ranks, standards or figures. The detail
 * of every engagement is agreed with each institution. Each row links to the contact page with
 * `?topic=services&service=<id>`, which prefills the form.
 */
export type ServiceIcon = 'server' | 'spark' | 'shield' | 'compass' | 'cap' | 'database';

export interface Offering {
  id: string;
  icon: ServiceIcon;
  name: Localized;
  summary: Localized;
}

export const offerings: Offering[] = [
  {
    id: 'infrastructure',
    icon: 'server',
    name: { en: 'Infrastructure setup', ar: 'إعداد البنية التحتية' },
    summary: {
      en: 'Networks, servers and cloud or on-premises environments, planned, built and documented, ready to host data and AI workloads securely.',
      ar: 'تخطيط الشبكات والخوادم وبيئات السحابة أو البيئات المحلية وبناؤها وتوثيقها، لتكون جاهزة لاستضافة البيانات وأحمال الذكاء الاصطناعي بأمان.',
    },
  },
  {
    id: 'ai-adoption',
    icon: 'spark',
    name: { en: 'AI adoption', ar: 'تبنّي الذكاء الاصطناعي' },
    summary: {
      en: 'From choosing the right use case to running Arabic-capable models inside your own environment and connecting them to daily work.',
      ar: 'من اختيار حالة الاستخدام المناسبة إلى تشغيل نماذج تفهم العربية داخل بيئتكم وربطها بالعمل اليومي.',
    },
  },
  {
    id: 'cybersecurity',
    icon: 'shield',
    name: { en: 'Cybersecurity', ar: 'الأمن السيبراني' },
    summary: {
      en: 'Security assessments, hardening and monitoring for networks and systems, including the models and data behind AI applications.',
      ar: 'تقييم أمني وتحصين ومراقبة للشبكات والأنظمة، بما فيها النماذج والبيانات التي تقوم عليها تطبيقات الذكاء الاصطناعي.',
    },
  },
  {
    id: 'it-consulting',
    icon: 'compass',
    name: { en: 'IT consulting', ar: 'الاستشارات التقنية' },
    summary: {
      en: 'Independent advice on digital strategy, architecture and technology choices, before money is spent and before anything is built.',
      ar: 'مشورة مستقلة في الاستراتيجية الرقمية والمعمارية واختيار التقنيات، قبل الإنفاق وقبل بدء البناء.',
    },
  },
  {
    id: 'training',
    icon: 'cap',
    name: { en: 'Training and capacity building', ar: 'التدريب وبناء القدرات' },
    summary: {
      en: 'Practical courses in applied AI, data and cybersecurity for teams, institutions and students, in levels from foundations to leadership.',
      ar: 'دورات عملية في الذكاء الاصطناعي التطبيقي والبيانات والأمن السيبراني للفرق والمؤسسات والطلاب، في مستويات من الأساسيات حتى القيادة.',
    },
  },
  {
    id: 'data',
    icon: 'database',
    name: { en: 'Data engineering and analytics', ar: 'هندسة البيانات والتحليلات' },
    summary: {
      en: 'Pipelines, databases and dashboards that turn scattered records, Arabic text included, into information teams can act on.',
      ar: 'خطوط معالجة وقواعد بيانات ولوحات متابعة تحوّل السجلات المتفرقة، ومنها النصوص العربية، إلى معلومات تعمل بها الفرق.',
    },
  },
];
