import type { ImageMetadata } from 'astro';
import type { Localized } from '@/i18n/config';
import educationGraphic from '@/assets/topics/education.jpg';

/**
 * News posts. The list page sorts newest first and paginates (NEWS_PAGE_SIZE per page), so adding a story is
 * one entry here and nothing else. The owner supplies each story; never write one that was not supplied.
 *
 * CONTENT INTEGRITY: a post states only what its source states. Third-party articles are shown as attributed
 * excerpts with a link to the source, and their claims stay attributed to the author. Never announce a
 * customer, partnership, funding, award, event, publication or metric that the owner has not supplied.
 */
export type NewsBlock =
  | { type: 'p'; text: Localized }
  | { type: 'h2'; text: Localized }
  | { type: 'ul'; items: Localized[] };

export interface NewsPost {
  slug: string;
  /** ISO date (YYYY-MM-DD). */
  date: string;
  category: Localized;
  title: Localized;
  summary: Localized;
  /** Byline for a post written by someone else. */
  author?: Localized;
  /** Where the story was first published. */
  source?: { label: Localized; url: string };
  /** A short note shown above the body, for example "Excerpt, translated from Arabic". */
  note?: Localized;
  cover?: { src: ImageMetadata; alt: Localized };
  body: NewsBlock[];
  /** Calls to action shown under the post. */
  links?: { label: Localized; path: string }[];
}

export const NEWS_PAGE_SIZE = 6;

export const news: NewsPost[] = [
  {
    slug: 'students-suffering-above-all',
    date: '2025-12-10',
    category: { en: 'SudaTutor', ar: 'SudaTutor' },
    title: {
      en: 'Students’ suffering above all else',
      ar: 'معاناة الطلاب فوق كل اعتبار',
    },
    summary: {
      en: 'An article by Dr. Amjad Ibrahim Salman on SudaTutor and the education crisis the war has caused for Sudanese children.',
      ar: 'مقال للدكتور أمجد إبراهيم سلمان عن SudaTutor وأزمة التعليم التي خلّفتها الحرب على أطفال السودان.',
    },
    author: { en: 'Dr. Amjad Ibrahim Salman', ar: 'د. أمجد إبراهيم سلمان' },
    source: {
      label: { en: 'Read the full article on LinkedIn', ar: 'اقرأ المقال كاملًا على LinkedIn' },
      url: 'https://lnkd.in/ggpMYbgn',
    },
    note: {
      en: 'An excerpt from the article, translated from Arabic. The claims below are the author’s.',
      ar: 'مقتطف من المقال. الادعاءات الواردة أدناه هي للكاتب.',
    },
    cover: {
      src: educationGraphic,
      alt: {
        en: 'Sudaverse graphic: Education will no longer be for the few, it will be for everyone, with an open book, a monitor and a graduation cap.',
        ar: 'رسم من سودافيرس بعنوان: التعليم لن يكون للقلة بعد اليوم بل للجميع (نص الرسم بالإنجليزية)، وفيه كتاب مفتوح وشاشة وقبعة تخرج.',
      },
    },
    body: [
      {
        type: 'p',
        text: {
          en: 'This project comes in an extremely sensitive humanitarian context. More than 19 million Sudanese children and young people are suffering from the halt of their education because of the war. The SudaTutor platform is a direct contribution to easing the effects of the war on this generation, by providing smart, free education that can be reached from anywhere inside or outside Sudan.',
          ar: 'يأتي هذا المشروع في سياق إنساني بالغ الحساسية، حيث يعاني أكثر من 19 مليون طفل ويافع سوداني من توقف العملية التعليمية بسبب الحرب. وتمثل منصة SudaTutor مساهمة مباشرة في تخفيف آثار الحرب على هذا الجيل، من خلال توفير تعليم ذكي ومجاني يمكن الوصول إليه من أي مكان داخل السودان وخارجه.',
        },
      },
      {
        type: 'p',
        text: {
          en: 'The team was able to digitize and upload 117 complete textbooks, from the first year of primary school to the twelfth grade, across all the literary and scientific tracks, so that the system becomes the first AI platform dedicated exclusively to serving the Sudanese curriculum, without any external sources.',
          ar: 'استطاع الفريق رقمنة ورفع 117 كتابًا دراسيًا كاملًا من الصف الأول الابتدائي وحتى الصف الثاني عشر، بجميع المسارات الأدبية والعلمية، ليصبح النظام أول منصة ذكاء اصطناعي موجهة حصريًا لخدمة المنهج السوداني دون أي مصادر خارجية.',
        },
      },
      { type: 'h2', text: { en: 'Three innovative learning interfaces', ar: 'ثلاث واجهات تعليمية مبتكرة' } },
      {
        type: 'ul',
        items: [
          {
            en: 'First, the student entry: personalized smart learning based on the student’s level, with support for the Sudanese language and dialects and simplification of concepts according to the student’s ability and pace.',
            ar: 'أولًا: مدخل الطالب/التلميذ يوفر تعلّمًا ذكيًا شخصيًا يعتمد على مستوى الطالب، مع دعم اللغة واللهجات السودانية وتبسيط المفاهيم وفق قدرته وسرعته.',
          },
          {
            en: 'Second, the teacher entry: tools for planning, preparing lessons and managing content, and for raising the effectiveness of the teaching process by supporting teaching skills.',
            ar: 'ثانيًا: مدخل المعلّم، يقدّم أدوات للتخطيط، إعداد الدروس، إدارة المحتوى، ورفع كفاءة العملية التعليمية من خلال دعم مهارات التدريس.',
          },
          {
            en: 'Third, the teacher-to-colleague dialogue entry: it lets teachers exchange professional experience, improve their teaching performance and discuss challenges in an interactive environment supported by AI.',
            ar: 'ثالثًا: مدخل حوار الأستاذ مع زميله الأستاذ يسمح للمعلمين بتبادل الخبرات المهنية، وتحسين الأداء التدريسي، ومناقشة التحديات في بيئة تفاعلية مدعومة بالذكاء الاصطناعي.',
          },
        ],
      },
    ],
    links: [{ label: { en: 'About SudaTutor', ar: 'عن SudaTutor' }, path: 'products/sudatutor' }],
  },
];

export const newsBySlug = (slug: string) => news.find((n) => n.slug === slug);
export const newsSorted = [...news].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
