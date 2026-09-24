import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Handle,
  Position,
  ReactFlow,
  ReactFlowProvider,
  getBezierPath,
  useReactFlow,
  type Edge,
  type EdgeProps,
  type Node,
  type NodeProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import './hero-graph.css';
import { products } from '@/data/products';
import { ui } from '@/i18n/ui';
import { withBase } from '@/i18n/base';
import type { Locale } from '@/i18n/config';
import { CAPS, LAYOUTS, TEXT, WIRING, capById, capY, handleTop, mirrorX, type CapId, type Layout, type LayoutName } from './graph-data';

type Level = 'strong' | 'soft' | 'off';

interface CapData extends Record<string, unknown> {
  id: CapId;
  label: string;
  hint: string;
  color: string;
  level: Level;
  on: boolean;
  compact: boolean;
  rtl: boolean;
  onToggle: (id: CapId) => void;
  onHold: (on: boolean) => void;
}
interface OutData extends Record<string, unknown> {
  locale: Locale;
  compact: boolean;
  rtl: boolean;
  canopyH: number;
  squares: number;
  lit: CapId[];
  litSlugs: Set<string>;
  selected: string[];
  handleTops: number[];
  onHover: (slug: string | null) => void;
  onSelect: (slug: string) => void;
}
interface WireData extends Record<string, unknown> {
  color: string;
  level: Level;
  animate: boolean;
}
type CapNode = Node<CapData, 'cap'>;
type OutNode = Node<OutData, 'out'>;
type WireEdge = Edge<WireData, 'wire'>;

/* ---------- capability card (input) ---------- */

const CapNodeView = memo(function CapNodeView({ data }: NodeProps<CapNode>) {
  return (
    <div
      className={`hg-cap hg-cap--${data.level}${data.on ? ' is-on' : ''}`}
      dir={data.rtl ? 'rtl' : 'ltr'}
      style={{ ['--c' as string]: data.color }}
    >
      <button
        type="button"
        className="hg-cap__btn"
        role="switch"
        aria-checked={data.on}
        onClick={() => data.onToggle(data.id)}
        onMouseEnter={() => data.onHold(true)}
        onMouseLeave={() => data.onHold(false)}
        onFocus={() => data.onHold(true)}
        onBlur={() => data.onHold(false)}
      >
        <span className="hg-cap__head">
          <span className="hg-cap__dot" aria-hidden="true" />
          <span className="hg-cap__label">{data.label}</span>
        </span>
        <span className="hg-cap__body">
          <span className="hg-switch" aria-hidden="true">
            <i />
          </span>
          {!data.compact && <span className="hg-cap__hint">{data.hint}</span>}
        </span>
      </button>
      <Handle type="source" position={data.rtl ? Position.Left : Position.Right} isConnectable={false} className="hg-handle" />
    </div>
  );
});

/* ---------- output card: a few static leaves + the product list ---------- */

/** Hand-placed baobab "leaves" (percent of the leaf area, px size, rotation), so they never overlap. */
const LEAVES = [
  { x: 6, y: 34, s: 18, r: 45 },
  { x: 19, y: 62, s: 12, r: 0 },
  { x: 32, y: 18, s: 26, r: 0 },
  { x: 49, y: 56, s: 16, r: 45 },
  { x: 62, y: 20, s: 14, r: 0 },
  { x: 74, y: 50, s: 24, r: 45 },
  { x: 90, y: 24, s: 12, r: 0 },
];

const OutNodeView = memo(function OutNodeView({ data }: NodeProps<OutNode>) {
  const t = TEXT[data.locale];
  const litCaps = data.lit.length ? data.lit : CAPS.map((c) => c.id);
  const leaves = useMemo(
    () =>
      LEAVES.slice(0, data.squares).map((l, i) => ({
        key: i,
        x: l.x,
        y: l.y,
        size: Math.round(l.s * (data.compact ? 0.72 : 1)),
        rot: l.r,
        slot: i % 5,
      })),
    [data.squares, data.compact],
  );

  return (
    <div className="hg-out" dir={data.rtl ? 'rtl' : 'ltr'}>
      {CAPS.map((c, i) => (
        <Handle
          key={c.id}
          id={c.id}
          type="target"
          position={data.rtl ? Position.Right : Position.Left}
          isConnectable={false}
          className="hg-handle hg-handle--tgt"
          style={{ top: data.handleTops[i], ['--c' as string]: c.color }}
        />
      ))}
      <div className="hg-out__clip">
        <div className="hg-out__head">{t.out}</div>
        <div className="hg-canopy" style={{ height: data.canopyH }} aria-hidden="true">
          {leaves.map((s) => (
            <i
              key={s.key}
              className="hg-leaf"
              style={{
                left: `${s.x}%`,
                top: `${s.y}%`,
                width: s.size,
                height: s.size,
                borderColor: capById(litCaps[s.slot % litCaps.length]).color,
                rotate: `${s.rot}deg`,
              }}
            />
          ))}
        </div>
        <ul className={`hg-list${data.lit.length ? ' is-focused' : ''}`} role="list">
          {WIRING.map((w) => {
            const p = products.find((x) => x.slug === w.slug);
            if (!p) return null;
            const lit = data.litSlugs.has(w.slug);
            const sel = data.selected.includes(w.slug);
            return (
              <li
                key={w.slug}
                className={`${lit ? 'is-lit' : 'is-dim'}${sel ? ' is-selected' : ''}`}
                onMouseEnter={() => data.onHover(w.slug)}
                onMouseLeave={() => data.onHover(null)}
                onFocus={() => data.onHover(w.slug)}
                onBlur={() => data.onHover(null)}
              >
                <div className="hg-row">
                  <button type="button" className="hg-row__pick" aria-pressed={sel} onClick={() => data.onSelect(w.slug)}>
                    <span className="hg-row__name" translate="no">
                      {p.name}
                    </span>
                    <span className="hg-row__chips" aria-hidden="true">
                      {w.uses.map((u) => (
                        <i key={u} style={{ ['--c' as string]: capById(u).color }} />
                      ))}
                    </span>
                    <span className="sr-only">{`${t.uses}: ${w.uses.map((u) => capById(u).label[data.locale]).join(', ')}`}</span>
                    {!data.compact && (
                      <span className={`hg-row__stage hg-row__stage--${p.stage}`}>{ui[data.locale][`stage.${p.stage}` as const]}</span>
                    )}
                  </button>
                  <a className="hg-row__open" href={withBase(`/${data.locale}/products/${w.slug}/`)} aria-label={`${t.open} ${p.name}`}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                      <path d="M4 12h15M13 6l6 6-6 6" />
                    </svg>
                  </a>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
});

/* ---------- wire: neutral and dashed; coloured only when its capability is active ---------- */

const WireEdgeView = memo(function WireEdgeView(props: EdgeProps<WireEdge>) {
  const { sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data } = props;
  if (!data) return null;
  const [path] = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition, curvature: 0.36 });
  return (
    <g className={`hg-wire hg-wire--${data.level}`} style={{ ['--c' as string]: data.color }}>
      <path d={path} className={`hg-wire__line${data.level === 'strong' && data.animate ? ' is-flowing' : ''}`} />
    </g>
  );
});

const nodeTypes = { cap: CapNodeView, out: OutNodeView };
const edgeTypes = { wire: WireEdgeView };

/* ---------- graph ---------- */

function Graph({
  locale,
  layout,
  layoutName,
  animate,
  ready,
}: {
  locale: Locale;
  layout: Layout;
  layoutName: LayoutName;
  animate: boolean;
  ready: boolean;
}) {
  const t = TEXT[locale];
  const rtl = locale === 'ar';
  const [picked, setPicked] = useState<CapId[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [hoverProd, setHoverProd] = useState<string | null>(null);
  const [hold, setHold] = useState(0);
  const [auto, setAuto] = useState<CapId | null>(null);
  const [visible, setVisible] = useState(true);
  const rootRef = useRef<HTMLDivElement>(null);
  const { fitView } = useReactFlow();

  const onToggle = useCallback((id: CapId) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id])), []);
  const onSelect = useCallback((slug: string) => setSelected((p) => (p.includes(slug) ? p.filter((x) => x !== slug) : [...p, slug])), []);
  const onHover = useCallback((slug: string | null) => setHoverProd(slug), []);
  const onHold = useCallback((on: boolean) => setHold((n) => Math.max(0, n + (on ? 1 : -1))), []);

  // Auto-play: after a still first look, fire one capability at a time. It yields to any interaction, stops
  // when scrolled out of view or when the tab is hidden, can be paused by the visitor, and never runs
  // under reduced motion (the parent passes animate=false).
  const acted = picked.length > 0 || selected.length > 0 || hoverProd !== null || hold > 0;
  useEffect(() => {
    if (!animate || !visible || acted) {
      setAuto(null);
      return;
    }
    let i = 0;
    let timer = 0;
    const start = window.setTimeout(() => {
      setAuto(CAPS[0].id);
      timer = window.setInterval(() => {
        if (document.hidden) return;
        i = (i + 1) % CAPS.length;
        setAuto(CAPS[i].id);
      }, 3600);
    }, 1800);
    return () => {
      window.clearTimeout(start);
      window.clearInterval(timer);
    };
  }, [animate, visible, acted]);

  useEffect(() => {
    const el = rootRef.current;
    if (!el || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    let raf = 0;
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => fitView({ padding: 0.01, duration: 0 }));
    });
    ro.observe(el);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [fitView]);

  const { nodes, edges, summary } = useMemo(() => {
    // Which capabilities light up (wires, switches) and which product rows are highlighted.
    // Selecting a product highlights only that product; switching a capability highlights the products
    // that use it. Ambient and autoplay states light everything or one capability at a time.
    const usesOf = (slugs: string[]) => WIRING.filter((w) => slugs.includes(w.slug)).flatMap((w) => w.uses);
    const byCaps = (caps: CapId[]) => WIRING.filter((w) => w.uses.some((u) => caps.includes(u))).map((w) => w.slug);
    let lit: CapId[];
    let rowSlugs: string[];
    let focused = true;
    if (picked.length || selected.length) {
      lit = Array.from(new Set([...picked, ...usesOf(selected)]));
      rowSlugs = Array.from(new Set([...selected, ...byCaps(picked)]));
    } else if (hoverProd) {
      lit = usesOf([hoverProd]);
      rowSlugs = [hoverProd];
    } else if (auto) {
      lit = [auto];
      rowSlugs = byCaps([auto]);
    } else {
      lit = CAPS.map((c) => c.id);
      rowSlugs = WIRING.map((w) => w.slug);
      focused = false;
    }
    const litSlugs = new Set(rowSlugs);
    const levelOf = (c: CapId): Level => (lit.includes(c) ? (focused ? 'strong' : 'soft') : 'off');
    const tops = CAPS.map((_, i) => handleTop(layout, i));

    const ns: (CapNode | OutNode)[] = CAPS.map((c, i) => ({
      id: `cap-${c.id}`,
      type: 'cap' as const,
      position: { x: mirrorX(layout, layout.cap.x, layout.cap.w, rtl), y: capY(layout, i) },
      width: layout.cap.w,
      height: layout.cap.h,
      draggable: false,
      selectable: false,
      focusable: false,
      data: {
        id: c.id,
        label: c.label[locale],
        hint: c.hint[locale],
        color: c.color,
        level: levelOf(c.id),
        on: picked.includes(c.id),
        compact: layout.compact,
        rtl,
        onToggle,
        onHold,
      },
    }));
    ns.push({
      id: 'out',
      type: 'out',
      position: { x: mirrorX(layout, layout.out.x, layout.out.w, rtl), y: layout.out.y },
      width: layout.out.w,
      height: layout.out.h,
      draggable: false,
      selectable: false,
      focusable: false,
      data: {
        locale,
        compact: layout.compact,
        rtl,
        canopyH: layout.canopyH,
        squares: layout.squares,
        lit: focused ? lit : [],
        litSlugs,
        selected,
        handleTops: tops,
        onHover,
        onSelect,
      },
    });

    const es: WireEdge[] = CAPS.map((c) => ({
      id: `w-${c.id}`,
      type: 'wire' as const,
      source: `cap-${c.id}`,
      target: 'out',
      targetHandle: c.id,
      selectable: false,
      focusable: false,
      data: { color: c.color, level: levelOf(c.id), animate },
    }));

    // Only the visitor's own actions are announced; the autoplay is silent.
    let summary = t.idle;
    if (focused && acted) {
      const capNames = lit.map((c) => capById(c).label[locale]).join(', ');
      const prodNames = (slugs: string[]) => slugs.map((sl) => products.find((p) => p.slug === sl)?.name).filter(Boolean).join(', ');
      summary = selected.length ? `${prodNames(selected)}: ${capNames}` : `${capNames}: ${prodNames(rowSlugs)}`;
    }
    return { nodes: ns, edges: es, summary };
  }, [layout, locale, rtl, picked, selected, hoverProd, auto, acted, animate, onToggle, onSelect, onHover, onHold, t]);

  return (
    <div ref={rootRef} className={`hg-flow${ready ? ' is-ready' : ''}`} data-layout={layoutName}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.01 }}
        minZoom={0.2}
        maxZoom={1.25}
        nodesDraggable={false}
        nodesConnectable={false}
        nodesFocusable={false}
        edgesFocusable={false}
        elementsSelectable={false}
        panOnDrag={false}
        panOnScroll={false}
        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        preventScrolling={false}
        colorMode="light"
        attributionPosition={rtl ? 'bottom-left' : 'bottom-right'}
      />
      <p className="sr-only" aria-live="polite">
        {summary}
      </p>
    </div>
  );
}

/* ---------- island ---------- */

export default function HeroGraph({ locale }: { locale: Locale }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [layoutName, setLayoutName] = useState<LayoutName>('wide');
  const [motion, setMotion] = useState(false);
  const [paused, setPaused] = useState(false);
  const [ready, setReady] = useState(false);
  const t = TEXT[locale];

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const measure = () => setLayoutName(el.getBoundingClientRect().width < 560 ? 'narrow' : 'wide');
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setMotion(!mq.matches);
    sync();
    mq.addEventListener('change', sync);
    const timer = window.setTimeout(() => {
      setReady(true);
      // Hide the loading skeleton behind the (translucent) glass cards once the real graph is up.
      el.closest('.stage__box')?.setAttribute('data-ready', '');
    }, 80);
    return () => {
      ro.disconnect();
      mq.removeEventListener('change', sync);
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <div ref={wrapRef} className="hg" role="group" aria-label={t.group} data-rtl={locale === 'ar' ? '' : undefined}>
      <ReactFlowProvider key={layoutName}>
        <Graph locale={locale} layout={LAYOUTS[layoutName]} layoutName={layoutName} animate={motion && !paused} ready={ready} />
      </ReactFlowProvider>
      {motion && ready && (
        <button type="button" className="hg-pause" onClick={() => setPaused((p) => !p)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
            {paused ? <path d="M7 4.5v15l12-7.5z" /> : <path d="M6.5 4.5h4v15h-4zM13.5 4.5h4v15h-4z" />}
          </svg>
          <span>{paused ? t.play : t.pause}</span>
        </button>
      )}
    </div>
  );
}
