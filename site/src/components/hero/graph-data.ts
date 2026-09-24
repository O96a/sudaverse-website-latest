import type { Locale } from '@/i18n/config';

/**
 * Data and layout for the hero graph. Capability cards (inputs, each with a real switch) are wired into
 * one "products" output card. Which products light up follows the same true product-to-capability
 * relationships as the rest of the site. This is a simplified view of the portfolio, not a system
 * architecture. Colours come from the logo-derived tokens; wires are neutral until a capability is active.
 */
export type CapId = 'language' | 'geo' | 'models' | 'data' | 'security';

export interface Cap {
  id: CapId;
  /** A CSS colour (token reference) used only for the small dot, the switch and the active wire. */
  color: string;
  label: Record<Locale, string>;
  hint: Record<Locale, string>;
}

export const CAPS: Cap[] = [
  { id: 'language', color: 'var(--viz-sky)', label: { en: 'Language', ar: 'اللغة' }, hint: { en: 'Sudanese Arabic', ar: 'العربية السودانية' } },
  { id: 'geo', color: 'var(--viz-green)', label: { en: 'Geospatial', ar: 'جغرافي مكاني' }, hint: { en: 'Maps and places', ar: 'الخرائط والأماكن' } },
  { id: 'models', color: 'var(--viz-navy)', label: { en: 'Models', ar: 'النماذج' }, hint: { en: 'Language models', ar: 'نماذج لغوية' } },
  { id: 'data', color: 'var(--viz-gold)', label: { en: 'Data', ar: 'البيانات' }, hint: { en: 'Data pipelines', ar: 'خطوط معالجة البيانات' } },
  { id: 'security', color: 'var(--viz-copper)', label: { en: 'Security', ar: 'الأمن' }, hint: { en: 'Threat detection', ar: 'كشف التهديدات' } },
];

export const capById = (id: CapId) => CAPS.find((c) => c.id === id)!;

/** Which capabilities each product draws on (true relationships only). */
export const WIRING: { slug: string; uses: CapId[] }[] = [
  { slug: 'sudatutor', uses: ['language', 'models'] },
  { slug: 'terab', uses: ['language', 'models', 'geo'] },
  { slug: 'sudan-monitor', uses: ['data', 'geo'] },
  { slug: 'sudaflood', uses: ['data', 'models', 'geo'] },
  { slug: 'sudandr', uses: ['models', 'security'] },
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
    out: { w: 452, h: 540, x: 428, y: 35 },
    squares: 7,
    canopyH: 96,
  },
  narrow: {
    w: 360,
    h: 540,
    compact: true,
    cap: { w: 128, h: 66, x: 0, y0: 14, dy: 104 },
    out: { w: 204, h: 520, x: 156, y: 8 },
    squares: 5,
    canopyH: 72,
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

export const TEXT: Record<Locale, { group: string; hint: string; out: string; idle: string; pause: string; play: string; open: string; uses: string }> = {
  en: {
    group: 'Interactive map: Sudaverse products and the capabilities they draw on',
    hint: 'Select a product, or switch a capability on, to see how they connect.',
    out: 'Products',
    idle: 'Showing every connection',
    pause: 'Pause animation',
    play: 'Play animation',
    open: 'Open',
    uses: 'Uses',
  },
  ar: {
    group: 'خريطة تفاعلية: منتجات سودافيرس والقدرات التي تعتمد عليها',
    hint: 'اختر منتجًا، أو فعّل قدرة، لترى كيف يرتبطان.',
    out: 'المنتجات',
    idle: 'عرض كل الارتباطات',
    pause: 'إيقاف الحركة',
    play: 'تشغيل الحركة',
    open: 'افتح',
    uses: 'يستخدم',
  },
};
