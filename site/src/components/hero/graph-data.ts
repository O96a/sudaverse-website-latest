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

/** Container width (px) under which the compact layout (pill switches, smaller type) is used. */
export const NARROW_MAX = 560;
/** Room around the scene so the glass shadows are not clipped by the React Flow viewport. */
export const SCENE_PAD = 10;

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}
export interface Scene {
  name: LayoutName;
  w: number;
  h: number;
  caps: Box[];
  out: Box;
  /** Vertical position of capability i's wire attachment on the output card, relative to its top edge. */
  handleTops: number[];
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export const layoutFor = (w: number): LayoutName => (w < NARROW_MAX ? 'narrow' : 'wide');

/** Widest a capability card may grow before its text wraps. */
export const capMaxW = (w: number, name: LayoutName) => Math.round(name === 'wide' ? w * 0.4 : w * 0.46);
/** Horizontal space the wires cross between the capability column and the output card. */
export const wireGap = (w: number, name: LayoutName) => Math.round(name === 'wide' ? clamp(w * 0.14, 72, 132) : clamp(w * 0.09, 26, 40));
export const outWidth = (w: number, capW: number, name: LayoutName) => w - 2 * SCENE_PAD - capW - wireGap(w, name);

/**
 * Place the measured cards. Every box is sized by its own text (measured in the DOM, see HeroGraph), so
 * nothing is fixed: the capability column is as wide as its longest card, the output card takes the rest,
 * the shorter column is spread and centred against the taller one, and the wires fan in across the middle
 * of the output card. Mirrors for right-to-left reading.
 */
export function buildScene(w: number, name: LayoutName, capW: number, capH: number[], outH: number, rtl: boolean): Scene {
  const P = SCENE_PAD;
  const n = capH.length;
  const sum = capH.reduce((a, b) => a + b, 0);
  const [minGap, maxGap] = name === 'wide' ? [14, 30] : [8, 20];
  const gap = clamp((outH - sum) / (n - 1), minGap, maxGap);
  const capsH = sum + gap * (n - 1);
  const h = Math.max(capsH, outH);
  const oW = outWidth(w, capW, name);
  const mx = (x: number, bw: number) => (rtl ? w - x - bw : x);

  let y = P + (h - capsH) / 2;
  const caps = capH.map((ch) => {
    const b = { x: mx(P, capW), y, w: capW, h: ch };
    y += ch + gap;
    return b;
  });
  const out = { x: mx(w - P - oW, oW), y: P + (h - outH) / 2, w: oW, h: outH };
  const top = outH * 0.2;
  const span = outH * 0.6;
  const handleTops = capH.map((_, i) => Math.round(top + (span * i) / (n - 1)));
  return { name, w, h: h + 2 * P, caps, out, handleTops };
}

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
