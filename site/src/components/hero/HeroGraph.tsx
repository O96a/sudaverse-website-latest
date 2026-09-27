import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  Handle,
  Position,
  ReactFlow,
  ReactFlowProvider,
  getBezierPath,
  type Edge,
  type EdgeProps,
  type Node,
  type NodeProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import './hero-graph.css';
import type { Locale } from '@/i18n/config';
import {
  CAPS,
  SECTORS,
  TEXT,
  buildScene,
  capById,
  capMaxW,
  layoutFor,
  outWidth,
  type CapId,
  type LayoutName,
  type Scene,
} from './graph-data';

type Level = 'strong' | 'soft' | 'off';

/* ---------- capability card (input): a real switch, sized by its own text ---------- */

interface CapCardProps {
  id: CapId;
  label: string;
  hint: string;
  color: string;
  level: Level;
  on: boolean;
  compact: boolean;
  rtl: boolean;
  onToggle?: (id: CapId) => void;
  onHold?: (on: boolean) => void;
  children?: ReactNode;
}

function CapCard({ id, label, hint, color, level, on, compact, rtl, onToggle, onHold, children }: CapCardProps) {
  return (
    <div
      className={`hg-cap hg-cap--${level}${on ? ' is-on' : ''}${compact ? ' hg-cap--compact' : ''}`}
      dir={rtl ? 'rtl' : 'ltr'}
      style={{ ['--c' as string]: color }}
    >
      <button
        type="button"
        className="hg-cap__btn"
        role="switch"
        aria-checked={on}
        onClick={() => onToggle?.(id)}
        onMouseEnter={() => onHold?.(true)}
        onMouseLeave={() => onHold?.(false)}
        onFocus={() => onHold?.(true)}
        onBlur={() => onHold?.(false)}
      >
        {compact ? (
          <>
            <span className="hg-switch hg-switch--mini" aria-hidden="true">
              <i />
            </span>
            <span className="hg-cap__label">{label}</span>
          </>
        ) : (
          <>
            <span className="hg-cap__head">
              <span className="hg-cap__dot" aria-hidden="true" />
              <span className="hg-cap__label">{label}</span>
            </span>
            <span className="hg-cap__body">
              <span className="hg-switch" aria-hidden="true">
                <i />
              </span>
              <span className="hg-cap__hint">{hint}</span>
            </span>
          </>
        )}
      </button>
      {children}
    </div>
  );
}

/* ---------- canopy: the baobab "leaves", alive in the logo colours ---------- */

type Shape = 'square' | 'diamond' | 'triangle' | 'dot';
/** Hand-placed leaves (percent of the canopy, px size, spin direction), spread so they never collide. */
const LEAVES: { x: number; y: number; s: number; shape: Shape; spin: 1 | -1 }[] = [
  { x: 7, y: 44, s: 17, shape: 'diamond', spin: 1 },
  { x: 15, y: 74, s: 8, shape: 'dot', spin: 1 },
  { x: 25, y: 34, s: 24, shape: 'square', spin: -1 },
  { x: 37, y: 66, s: 15, shape: 'triangle', spin: 1 },
  { x: 47, y: 30, s: 9, shape: 'dot', spin: -1 },
  { x: 57, y: 60, s: 19, shape: 'diamond', spin: -1 },
  { x: 68, y: 30, s: 13, shape: 'triangle', spin: -1 },
  { x: 79, y: 62, s: 22, shape: 'square', spin: 1 },
  { x: 92, y: 38, s: 13, shape: 'triangle', spin: 1 },
];
const NARROW_LEAVES = [0, 2, 3, 5, 7];

function LeafShape({ shape }: { shape: Shape }) {
  if (shape === 'dot') return <circle cx="12" cy="12" r="6" />;
  if (shape === 'triangle') return <polygon points="12,3.5 21,19.5 3,19.5" />;
  return <rect x="4" y="4" width="16" height="16" rx="2" transform={shape === 'diamond' ? 'rotate(45 12 12)' : undefined} />;
}

function Canopy({ compact, lit, still }: { compact: boolean; lit: CapId[]; still: boolean }) {
  // Every leaf wears one of the logo colours. When capabilities light up, alternate leaves take their
  // colours and all of them pop once, so the canopy answers the wires while staying multicoloured.
  const pop = lit.join('.');
  const picked = compact ? NARROW_LEAVES : LEAVES.map((_, i) => i);
  return (
    <div className={`hg-canopy${still ? ' is-still' : ''}`} aria-hidden="true">
      {picked.map((i, k) => {
        const l = LEAVES[i];
        // On narrow cards the few leaves are spaced evenly, clear of the rounded edges.
        const x = compact ? 12 + (k * 76) / (picked.length - 1) : l.x;
        const size = Math.round(l.s * (compact ? 0.8 : 1));
        const own = CAPS[i % CAPS.length].id;
        const color = lit.length && k % 2 === 0 ? lit[(k / 2) % lit.length] : own;
        return (
          <span
            key={i}
            className={`hg-leaf hg-leaf--${l.shape}`}
            style={{
              left: `${x}%`,
              top: `${l.y}%`,
              width: size,
              height: size,
              ['--c' as string]: capById(color).color,
              ['--i' as string]: k,
              ['--dur' as string]: `${4.6 + ((i * 1.7) % 3.4)}s`,
              ['--delay' as string]: `${-((i * 1.3) % 4)}s`,
              ['--dx' as string]: `${((i % 3) - 1) * 5}px`,
              ['--dy' as string]: `${i % 2 ? -7 : 6}px`,
              ['--spin' as string]: `${12 + ((i * 5) % 11)}s`,
              ['--turn' as string]: l.spin > 0 ? 'normal' : 'reverse',
            }}
          >
            <svg viewBox="0 0 24 24" className="hg-leaf__svg">
              <g key={pop} className="hg-leaf__pop">
                <LeafShape shape={l.shape} />
              </g>
            </svg>
          </span>
        );
      })}
    </div>
  );
}

/* ---------- output card: canopy + the sector list ---------- */

interface OutCardProps {
  locale: Locale;
  compact: boolean;
  rtl: boolean;
  still: boolean;
  lit: CapId[];
  litSlugs: Set<string>;
  selected: string[];
  onHover?: (slug: string | null) => void;
  onSelect?: (slug: string) => void;
  children?: ReactNode;
}

function OutCard({ locale, compact, rtl, still, lit, litSlugs, selected, onHover, onSelect, children }: OutCardProps) {
  const t = TEXT[locale];
  return (
    <div className={`hg-out${compact ? ' hg-out--compact' : ''}`} dir={rtl ? 'rtl' : 'ltr'}>
      {children}
      <div className="hg-out__clip">
        <div className="hg-out__head">{t.out}</div>
        <Canopy compact={compact} lit={lit} still={still} />
        <ul className={`hg-list${lit.length ? ' is-focused' : ''}`} role="list">
          {SECTORS.map((sec) => {
            const isLit = litSlugs.has(sec.id);
            const sel = selected.includes(sec.id);
            return (
              <li
                key={sec.id}
                className={`${isLit ? 'is-lit' : 'is-dim'}${sel ? ' is-selected' : ''}`}
                onMouseEnter={() => onHover?.(sec.id)}
                onMouseLeave={() => onHover?.(null)}
                onFocus={() => onHover?.(sec.id)}
                onBlur={() => onHover?.(null)}
              >
                <button type="button" className="hg-row" aria-pressed={sel} onClick={() => onSelect?.(sec.id)}>
                  <span className="hg-row__name">{sec.label[locale]}</span>
                  <span className="hg-row__chips" aria-hidden="true">
                    {sec.uses.map((u) => (
                      <i key={u} style={{ ['--c' as string]: capById(u).color }} />
                    ))}
                  </span>
                  <span className="sr-only">{`${t.uses}: ${sec.uses.map((u) => capById(u).label[locale]).join(', ')}`}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

/* ---------- React Flow nodes and wires ---------- */

interface CapData extends Omit<CapCardProps, 'children'>, Record<string, unknown> {}
interface OutData extends Omit<OutCardProps, 'children'>, Record<string, unknown> {
  handleTops: number[];
}
interface WireData extends Record<string, unknown> {
  color: string;
  level: Level;
  animate: boolean;
}
type CapNode = Node<CapData, 'cap'>;
type OutNode = Node<OutData, 'out'>;
type WireEdge = Edge<WireData, 'wire'>;

const CapNodeView = memo(function CapNodeView({ data }: NodeProps<CapNode>) {
  return (
    <CapCard {...data}>
      <Handle type="source" position={data.rtl ? Position.Left : Position.Right} isConnectable={false} className="hg-handle" />
    </CapCard>
  );
});

const OutNodeView = memo(function OutNodeView({ data }: NodeProps<OutNode>) {
  const { handleTops, ...card } = data;
  return (
    <OutCard {...card}>
      {CAPS.map((c, i) => (
        <Handle
          key={c.id}
          id={c.id}
          type="target"
          position={data.rtl ? Position.Right : Position.Left}
          isConnectable={false}
          className="hg-handle hg-handle--tgt"
          style={{ top: handleTops[i], ['--c' as string]: c.color }}
        />
      ))}
    </OutCard>
  );
});

/* Wires: each in its capability colour, soft until active. */
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

function Graph({ locale, scene, animate, ready }: { locale: Locale; scene: Scene; animate: boolean; ready: boolean }) {
  const t = TEXT[locale];
  const rtl = locale === 'ar';
  const compact = scene.name === 'narrow';
  const [picked, setPicked] = useState<CapId[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [hoverProd, setHoverProd] = useState<string | null>(null);
  const [hold, setHold] = useState(0);
  const [auto, setAuto] = useState<CapId | null>(null);
  const [visible, setVisible] = useState(true);
  const rootRef = useRef<HTMLDivElement>(null);

  const onToggle = useCallback((id: CapId) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id])), []);
  const onSelect = useCallback((slug: string) => setSelected((p) => (p.includes(slug) ? p.filter((x) => x !== slug) : [...p, slug])), []);
  const onHover = useCallback((slug: string | null) => setHoverProd(slug), []);
  const onHold = useCallback((on: boolean) => setHold((n) => Math.max(0, n + (on ? 1 : -1))), []);

  // Auto-play: after a still first look, fire one capability at a time. It yields to any interaction, stops
  // when scrolled out of view or when the tab is hidden, and never runs under reduced motion (animate=false).
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

  const { nodes, edges, summary } = useMemo(() => {
    // Selecting a sector lights the capabilities it draws on; switching a capability lights the sectors
    // that use it. Ambient and autoplay states light everything or one capability at a time.
    const usesOf = (ids: string[]) => SECTORS.filter((w) => ids.includes(w.id)).flatMap((w) => w.uses);
    const byCaps = (caps: CapId[]) => SECTORS.filter((w) => w.uses.some((u) => caps.includes(u))).map((w) => w.id);
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
      rowSlugs = SECTORS.map((w) => w.id);
      focused = false;
    }
    const levelOf = (c: CapId): Level => (lit.includes(c) ? (focused ? 'strong' : 'soft') : 'off');

    const ns: (CapNode | OutNode)[] = CAPS.map((c, i) => {
      const b = scene.caps[i];
      return {
        id: `cap-${c.id}`,
        type: 'cap' as const,
        position: { x: b.x, y: b.y },
        width: b.w,
        height: b.h,
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
          compact,
          rtl,
          onToggle,
          onHold,
        },
      };
    });
    ns.push({
      id: 'out',
      type: 'out',
      position: { x: scene.out.x, y: scene.out.y },
      width: scene.out.w,
      height: scene.out.h,
      draggable: false,
      selectable: false,
      focusable: false,
      data: {
        locale,
        compact,
        rtl,
        still: !animate,
        lit: focused ? lit : [],
        litSlugs: new Set(rowSlugs),
        selected,
        handleTops: scene.handleTops,
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
      const names = (ids: string[]) => ids.map((id) => SECTORS.find((x) => x.id === id)?.label[locale]).filter(Boolean).join(', ');
      summary = selected.length ? `${names(selected)}: ${capNames}` : `${capNames}: ${names(rowSlugs)}`;
    }
    return { nodes: ns, edges: es, summary };
  }, [scene, compact, locale, rtl, picked, selected, hoverProd, auto, acted, animate, onToggle, onSelect, onHover, onHold, t]);

  return (
    <div ref={rootRef} className={`hg-flow${ready ? ' is-ready' : ''}${visible ? '' : ' is-paused'}`} data-layout={scene.name}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        minZoom={1}
        maxZoom={1}
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
        proOptions={{ hideAttribution: true }}
      />
      <p className="sr-only" aria-live="polite">
        {summary}
      </p>
    </div>
  );
}

/* ---------- island: measure the real text, then lay the scene out at 1:1 ---------- */

const EMPTY = new Set<string>();

export default function HeroGraph({ locale }: { locale: Locale }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [fontsTick, setFontsTick] = useState(0);
  const [scene, setScene] = useState<Scene | null>(null);
  const [motion, setMotion] = useState(false);
  const [ready, setReady] = useState(false);
  const t = TEXT[locale];
  const rtl = locale === 'ar';
  const name: LayoutName = layoutFor(width);
  const compact = name === 'narrow';

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(Math.round(e.contentRect.width)));
    ro.observe(el);
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setMotion(!mq.matches);
    sync();
    mq.addEventListener('change', sync);
    // Card sizes depend on the final fonts: measure again once they have loaded.
    const bump = () => setFontsTick((n) => n + 1);
    document.fonts?.ready.then(bump);
    document.fonts?.addEventListener('loadingdone', bump);
    return () => {
      ro.disconnect();
      mq.removeEventListener('change', sync);
      document.fonts?.removeEventListener('loadingdone', bump);
    };
  }, []);

  // Every card is sized by its own text: the capability column takes the width of its longest card (up to a
  // cap, then text wraps), the output card takes the rest, and heights are read back from the DOM.
  useLayoutEffect(() => {
    const root = measureRef.current;
    if (!root || !width) return;
    const caps = Array.from(root.querySelectorAll<HTMLElement>('[data-m="cap"]'));
    const out = root.querySelector<HTMLElement>('[data-m="out"]');
    if (!out || !caps.length) return;
    caps.forEach((el) => (el.style.width = 'max-content'));
    const natural = Math.ceil(Math.max(...caps.map((el) => el.getBoundingClientRect().width)));
    const capW = Math.min(natural, capMaxW(width, name));
    caps.forEach((el) => (el.style.width = `${capW}px`));
    const capH = caps.map((el) => Math.ceil(el.getBoundingClientRect().height));
    out.style.width = `${outWidth(width, capW, name)}px`;
    const outH = Math.ceil(out.getBoundingClientRect().height);
    setScene(buildScene(width, name, capW, capH, outH, rtl));
  }, [width, name, rtl, fontsTick]);

  useEffect(() => {
    const box = wrapRef.current?.closest<HTMLElement>('.stage__box');
    if (!scene || !box) return;
    box.style.blockSize = `${scene.h}px`;
    const timer = window.setTimeout(() => {
      setReady(true);
      box.setAttribute('data-ready', '');
    }, 60);
    return () => window.clearTimeout(timer);
  }, [scene]);

  return (
    <div ref={wrapRef} className="hg" role="group" aria-label={t.group} data-rtl={rtl ? '' : undefined}>
      <div ref={measureRef} className="hg-measure" aria-hidden="true" inert>
        {CAPS.map((c) => (
          <div key={c.id} data-m="cap" className="hg-measure__item">
            <CapCard id={c.id} label={c.label[locale]} hint={c.hint[locale]} color={c.color} level="soft" on={false} compact={compact} rtl={rtl} />
          </div>
        ))}
        <div data-m="out" className="hg-measure__item">
          <OutCard locale={locale} compact={compact} rtl={rtl} still lit={[]} litSlugs={EMPTY} selected={[]} />
        </div>
      </div>
      {scene && (
        <ReactFlowProvider key={scene.name}>
          <Graph locale={locale} scene={scene} animate={motion} ready={ready} />
        </ReactFlowProvider>
      )}
    </div>
  );
}
