import type { Locale } from '@/i18n/config';

/**
 * Layout for the step-flow diagrams (the home pipeline and every project's user flow). A flow is a row of
 * 3 to 7 cards on wide containers and a zig-zag stack on narrow ones. Everything here is pure geometry in
 * virtual pixels: the React Flow viewport scales the scene to the container. The server placeholder list
 * uses heights estimated from the text length; once the island mounts it measures the real cards and
 * lays the scene out again, so no card is taller than its text needs.
 */
export type StepLink =
  | { kind: 'external'; href: string; label: Record<Locale, string> }
  | { kind: 'internal'; path: string; label: Record<Locale, string> };

export interface FlowStepData {
  id: string;
  /** Graphic colour for the dot, ring and wire (never text). Defaults to the flow palette by index. */
  color?: string;
  title: Record<Locale, string>;
  desc: Record<Locale, string>;
  link?: StepLink;
}

/** Graphic hues from tokens.css (--viz-*), in the order a flow uses them. */
export const FLOW_PALETTE = ['var(--viz-sky)', 'var(--viz-gold)', 'var(--viz-navy)', 'var(--viz-green)', 'var(--viz-copper)', 'var(--sage-600)', 'var(--brand-blue-600)'];
export const stepColor = (step: FlowStepData, i: number) => step.color ?? FLOW_PALETTE[i % FLOW_PALETTE.length];

/** One step lit at a time, in sequence. */
export const CYCLE_MS = 3200;
/** Vertical centre of a card's title bar, where the wires attach in the row layout (virtual px). */
export const HEAD_MID = 17;

/**
 * Container width (rem) at which a flow switches from the stack to the row, per step count. The row is one
 * scene scaled to fit; below these widths its 13px card text would drop under about 10px. Keep in sync with
 * the `@container` queries in pipeline.css (they choose the layout before the island mounts).
 */
export const ROW_MIN_REM: Record<number, number> = { 3: 31.25, 4: 42, 5: 53, 6: 64, 7: 75 };
export const rowMinRem = (n: number) => ROW_MIN_REM[Math.min(7, Math.max(3, n))];

export type LayoutName = 'wide' | 'narrow';
export interface Slot {
  x: number;
  y: number;
  w: number;
  h: number;
}
export interface Layout {
  name: LayoutName;
  /** Virtual scene size; the viewport fits this into the container, and the container reserves this aspect ratio. */
  w: number;
  h: number;
  slots: Slot[];
}

/* Card anatomy in virtual px (see .pf-card in pipeline.css): title bar, body padding, 13px text at 1.4. */
const HEAD = 34;
const PAD = 23;
const LINE = 18.2;
const LINK = 26;
const longest = (s: FlowStepData) => Math.max(s.desc.en.length, s.desc.ar.length);
const cardH = (s: FlowStepData, charsPerLine: number) => Math.round(HEAD + PAD + Math.ceil(longest(s) / charsPerLine) * LINE + (s.link ? LINK : 0) + 4);

/** Card widths (virtual px) in each layout; FlowDiagram measures the real card heights at these widths. */
export const CARD_W: Record<LayoutName, number> = { wide: 176, narrow: 292 };
/** Card heights read from the DOM once the island mounts, so every card fits its own text exactly. */
export type MeasuredHeights = Record<LayoutName, number[]>;

function buildWide(steps: FlowStepData[], fixedH?: number, measured?: number[]): Layout {
  const n = steps.length;
  const cw = CARD_W.wide;
  const ch = fixedH ?? (measured ? Math.max(...measured) : Math.max(110, ...steps.map((s) => cardH(s, 21))));
  const gap = 60;
  const rise = 14; // each step sits a little higher than the last, so the row reads as progress
  const padX = 12;
  const padTop = 12;
  const padBottom = 20;
  return {
    name: 'wide',
    w: padX * 2 + n * cw + (n - 1) * gap,
    h: padTop + (n - 1) * rise + ch + padBottom,
    slots: steps.map((_, i) => ({ x: padX + i * (cw + gap), y: padTop + (n - 1 - i) * rise, w: cw, h: ch })),
  };
}

function buildNarrow(steps: FlowStepData[], measured?: number[]): Layout {
  const cw = CARD_W.narrow;
  const gap = 34;
  const dx = 24; // alternate cards shift sideways so the wires curve
  const padX = 12;
  const padTop = 12;
  const padBottom = 20;
  let y = padTop;
  const slots: Slot[] = steps.map((s, i) => {
    const h = measured?.[i] ?? cardH(s, 39);
    const slot = { x: padX + (i % 2) * dx, y, w: cw, h };
    y += h + gap;
    return slot;
  });
  return { name: 'narrow', w: padX * 2 + cw + dx, h: y - gap + padBottom, slots };
}

export function buildLayouts(steps: FlowStepData[], opts: { wideCardH?: number; measured?: MeasuredHeights | null } = {}): Record<LayoutName, Layout> {
  return { wide: buildWide(steps, opts.wideCardH, opts.measured?.wide), narrow: buildNarrow(steps, opts.measured?.narrow) };
}
