import type { Localized } from '@/i18n/config';

/**
 * Services, shown as a high-level overview under the homepage hero (owner request, 2026-09-26).
 * Descriptions are one short line (owner: a direct home page, 2026-09-27) and stay general on purpose: no customers, results, ranks, standards or figures. The detail
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
      en: 'Networks, servers and cloud or on-premises environments, built, secured and documented.',
      ar: 'شبكات وخوادم وبيئات سحابية أو محلية، مبنية ومؤمّنة وموثّقة.',
    },
  },
  {
    id: 'ai-adoption',
    icon: 'spark',
    name: { en: 'AI adoption', ar: 'تبنّي الذكاء الاصطناعي' },
    summary: {
      en: 'From the right use case to Arabic-capable models running inside your own environment.',
      ar: 'من اختيار حالة الاستخدام المناسبة إلى نماذج تفهم العربية تعمل داخل بيئتكم.',
    },
  },
  {
    id: 'cybersecurity',
    icon: 'shield',
    name: { en: 'Cybersecurity', ar: 'الأمن السيبراني' },
    summary: {
      en: 'Assessments, hardening and monitoring for systems, data and AI models.',
      ar: 'تقييم وتحصين ومراقبة للأنظمة والبيانات ونماذج الذكاء الاصطناعي.',
    },
  },
  {
    id: 'it-consulting',
    icon: 'compass',
    name: { en: 'IT consulting', ar: 'الاستشارات التقنية' },
    summary: {
      en: 'Independent advice on strategy, architecture and technology, before you spend.',
      ar: 'مشورة مستقلة في الاستراتيجية والمعمارية والتقنيات، قبل الإنفاق.',
    },
  },
  {
    id: 'training',
    icon: 'cap',
    name: { en: 'Training', ar: 'التدريب' },
    summary: {
      en: 'Practical courses in applied AI, data and cybersecurity for teams and students.',
      ar: 'دورات عملية في الذكاء الاصطناعي التطبيقي والبيانات والأمن السيبراني للفرق والطلاب.',
    },
  },
  {
    id: 'data',
    icon: 'database',
    name: { en: 'Data and analytics', ar: 'البيانات والتحليلات' },
    summary: {
      en: 'Pipelines, databases and dashboards that turn scattered records into answers.',
      ar: 'خطوط معالجة وقواعد بيانات ولوحات متابعة تحوّل السجلات المتفرقة إلى إجابات.',
    },
  },
];
