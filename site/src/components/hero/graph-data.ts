import type { Locale } from '@/i18n/config';

/**
 * Data and layout for the hero graph. Capability cards (inputs, each with a real switch) are wired into
 * one "sectors" output card: the sectors Sudaverse works in (owner direction, 2026-09-26: the home page
 * shows sectors and services, not products). A sector lights up when a capability it draws on is active.
 * This is a simplified view of how the capabilities apply, not a list of clients or deployments.
 * Colours come from the logo-derived tokens; wires are neutral until a capability is active.
 */
export type CapId = 'ai' | 'language' | 'data' | 'security' | 'infra';

export interface Cap {
  id: CapId;
  /** A CSS colour (token reference) used only for the small dot, the switch and the active wire. */
  color: string;
  label: Record<Locale, string>;
  hint: Record<Locale, string>;
}

export const CAPS: Cap[] = [
  { id: 'ai', color: 'var(--viz-navy)', label: { en: 'Applied AI', ar: 'الذكاء الاصطناعي' }, hint: { en: 'Models and automation', ar: 'النماذج والأتمتة' } },
  { id: 'language', color: 'var(--viz-sky)', label: { en: 'Arabic AI', ar: 'اللغة العربية' }, hint: { en: 'Arabic-first language tools', ar: 'أدوات لغوية عربية أولًا' } },
  { id: 'data', color: 'var(--viz-gold)', label: { en: 'Data', ar: 'البيانات' }, hint: { en: 'Pipelines and analytics', ar: 'المعالجة والتحليلات' } },
  { id: 'security', color: 'var(--viz-copper)', label: { en: 'Security', ar: 'الأمن' }, hint: { en: 'Assessment and monitoring', ar: 'التقييم والمراقبة' } },
  { id: 'infra', color: 'var(--viz-green)', label: { en: 'Infrastructure', ar: 'البنية التحتية' }, hint: { en: 'Cloud and on-premises', ar: 'سحابية ومحلية' } },
];

export const capById = (id: CapId) => CAPS.find((c) => c.id === id)!;

export interface Sector {
  id: string;
  label: Record<Locale, string>;
  /** The capabilities work in this sector draws on. */
  uses: CapId[];
}

export const SECTORS: Sector[] = [
  { id: 'healthcare', label: { en: 'Healthcare', ar: 'الرعاية الصحية' }, uses: ['ai', 'data', 'security'] },
  { id: 'agriculture', label: { en: 'Agriculture', ar: 'الزراعة' }, uses: ['ai', 'data'] },
  { id: 'education', label: { en: 'Education', ar: 'التعليم' }, uses: ['ai', 'language'] },
  { id: 'geospatial', label: { en: 'Geospatial', ar: 'المعلومات الجغرافية' }, uses: ['data', 'ai', 'infra'] },
  { id: 'ai-adoption', label: { en: 'AI adoption', ar: 'تبنّي الذكاء الاصطناعي' }, uses: ['ai', 'language', 'infra'] },
  { id: 'cybersecurity', label: { en: 'Cybersecurity', ar: 'الأمن السيبراني' }, uses: ['security', 'infra'] },
  { id: 'training', label: { en: 'Training', ar: 'التدريب' }, uses: ['ai', 'data', 'security'] },
];

export type LayoutName = 'wide' | 'narrow';

export interface Layout {
  /** Virtual scene size; the viewport fits this into the container. */
  w: number;
  h: number;
  compact: boolean;
  cap: { w: number; h: number; x: number; y0: number; dy: number };
  out: { w: number; h: number; x: number; y: number };
  /** Number of static hollow squares (the baobab "leaves") in the output card. */
  squares: number;
  /** Height of the leaf area inside the output card. */
  canopyH: number;
}

export const LAYOUTS: Record<LayoutName, Layout> = {
  wide: {
    w: 880,
    h: 646,
    compact: false,
    cap: { w: 236, h: 84, x: 0, y0: 14, dy: 118 },
    out: { w: 452, h: 600, x: 428, y: 23 },
    squares: 7,
    canopyH: 80,
  },
  narrow: {
    w: 360,
    h: 540,
    compact: true,
    cap: { w: 128, h: 66, x: 0, y0: 14, dy: 104 },
    out: { w: 204, h: 520, x: 156, y: 8 },
    squares: 5,
    canopyH: 56,
  },
};

export const capY = (l: Layout, i: number) => l.cap.y0 + i * l.cap.dy;
/**
 * Vertical position of capability i's wire attachment on the output card, relative to its top edge.
 * The five attachments cluster near the top so the wires fan in and curve, like a real node graph.
 */
export const handleTop = (l: Layout, i: number) => (l.compact ? 40 + i * 20 : 58 + i * 30);

/** Mirror a horizontal position inside the scene for right-to-left reading. */
export const mirrorX = (l: Layout, x: number, w: number, rtl: boolean) => (rtl ? l.w - x - w : x);

export const TEXT: Record<Locale, { group: string; hint: string; out: string; idle: string; uses: string }> = {
  en: {
    group: 'Interactive map: the sectors Sudaverse works in and the capabilities behind them',
    hint: 'Select a sector, or switch a capability on, to see how they connect.',
    out: 'Sectors we serve',
    idle: 'Showing every connection',
    uses: 'Draws on',
  },
  ar: {
    group: 'خريطة تفاعلية: القطاعات التي تعمل فيها سودافيرس والقدرات التي تقوم عليها',
    hint: 'اختر قطاعًا، أو فعّل قدرة، لترى كيف يرتبطان.',
    out: 'القطاعات التي نخدمها',
    idle: 'عرض كل الارتباطات',
    uses: 'يعتمد على',
  },
};
