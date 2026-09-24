import type { Localized } from '@/i18n/config';
import consultations from '@/assets/services/consultations.png';
import training from '@/assets/services/training.png';

/**
 * Services offered next to the products. Descriptions stay general on purpose (no customers, results,
 * ranks, standards or figures): they restate the discovery-first way of working and the levelled training
 * pathway from the owner's presentation, and the detail is agreed with each institution.
 */
export interface Service {
  id: string;
  logo: ImageMetadata;
  name: Localized;
  summary: Localized;
}

export const services: Service[] = [
  {
    id: 'consultations',
    logo: consultations,
    name: { en: 'Sudaverse Consultations', ar: 'استشارات سودافيرس' },
    summary: {
      en: 'Advice from the Sudaverse team for organizations and academic institutions planning work in applied AI, data or cybersecurity. We help define the use case, choose how and where it is deployed, and set out the data and security requirements before anything is built.',
      ar: 'استشارات من فريق سودافيرس للمنظمات والمؤسسات الأكاديمية التي تخطط لأعمال في الذكاء الاصطناعي التطبيقي أو البيانات أو الأمن السيبراني. نساعد في تحديد حالة الاستخدام، واختيار طريقة النشر ومكانه، وتحديد متطلبات البيانات والأمن قبل بدء البناء.',
    },
  },
  {
    id: 'training',
    logo: training,
    name: { en: 'Sudaverse Training Services', ar: 'خدمات التدريب من سودافيرس' },
    summary: {
      en: 'Training for organizations, academic institutions and students: practical skills in applied AI, data and cybersecurity, organized in levels that build from foundations to leadership. Content and duration are agreed with each institution.',
      ar: 'تدريب للمنظمات والمؤسسات الأكاديمية والطلاب: مهارات عملية في الذكاء الاصطناعي التطبيقي والبيانات والأمن السيبراني، مرتبة في مستويات تبني من الأساسيات حتى القيادة. ويُتفق على المحتوى والمدة مع كل جهة.',
    },
  },
];
