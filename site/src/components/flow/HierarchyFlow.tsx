import { memo, useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import {
  Handle,
  Position,
  ReactFlow,
  ReactFlowProvider,
  getBezierPath,
  getSmoothStepPath,
  useReactFlow,
  type Edge,
  type EdgeProps,
  type Node,
  type NodeProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import './pipeline.css';
import './hierarchy.css';
import type { Locale } from '@/i18n/config';
import { buildHierarchy, wideMinRem, type HierLayout, type HierLayoutName, type HierNode, type PlacedNode } from './hierarchy-layout';

/**
 * A hierarchy in the Sudaverse diagram style: glass cards, dashed wires in each branch's colour, and a signal
 * that walks the branches one at a time, lighting a branch and everything it feeds. Pauses on hover and focus,
 * off screen and in hidden tabs; never moves under reduced motion.
 * The cards are exposed as a list; wires are decorative.
 */
export interface HierarchyFlowProps {
  locale: Locale;
  nodes: HierNode[];
  /** Accessible name of the diagram. */
  label: string;
}

const CYCLE_MS = 2800;
const HEAD_MID = 20;

type Level = 'strong' | 'soft';
interface CardData extends Record<string, unknown> {
  placed: PlacedNode;
  lit: boolean;
  narrow: boolean;
  hasChildren: boolean;
  rtl: boolean;
  onHold: (branches: number[] | null) => void;
}
interface WireData extends Record<string, unknown> {
  color: string;
  level: Level;
  animate: boolean;
  narrow: boolean;
}
type CardNode = Node<CardData, 'card'>;
type WireEdge = Edge<WireData, 'wire'>;

const CardView = memo(function CardView({ data }: NodeProps<CardNode>) {
  const { placed, lit, narrow, hasChildren, rtl, onHold } = data;
  const n = placed.node;
  const hold = () => onHold(placed.depth === 0 ? null : placed.branches);
  const release = () => onHold(null);
  const inPos = narrow ? (rtl ? Position.Right : Position.Left) : Position.Top;
  const inStyle = narrow ? { top: HEAD_MID } : undefined;
  const outStyle = narrow ? (rtl ? { left: 'auto', right: 16 } : { left: 16 }) : undefined;
  return (
    <div className="hf-node" style={{ ['--c' as string]: placed.color }}>
      <div
        className={`pf-card hf-card${lit ? ' is-active' : ''}${n.sub ? '' : ' hf-card--title'}${n.href ? ' has-link' : ''}`}
        dir={rtl ? 'rtl' : 'ltr'}
        onPointerEnter={(e) => e.pointerType === 'mouse' && hold()}
        onPointerLeave={(e) => e.pointerType === 'mouse' && release()}
        onFocus={hold}
        onBlur={release}
      >
        <div className="pf-card__head hf-card__head">
          <span className="pf-card__dot" aria-hidden="true" />
          {n.href ? (
            <a className="pf-card__title hf-link" href={n.href}>
              {n.label}
            </a>
          ) : (
            <span className="pf-card__title">{n.label}</span>
          )}
        </div>
        {n.sub && (
          <div className="pf-card__body">
            <p className="pf-card__desc">{n.sub}</p>
          </div>
        )}
      </div>
      {placed.depth > 0 && <Handle type="target" position={inPos} isConnectable={false} className="pf-handle" style={inStyle} />}
      {hasChildren && <Handle type="source" position={Position.Bottom} isConnectable={false} className="pf-handle" style={outStyle} />}
    </div>
  );
});

const WireView = memo(function WireView(props: EdgeProps<WireEdge>) {
  const { sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data } = props;
  if (!data) return null;
  const [path] = data.narrow
    ? getSmoothStepPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition, borderRadius: 10, offset: 0 })
    : getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition, curvature: 0.35 });
  const strong = data.level === 'strong';
  return (
    <g className={`pf-wire pf-wire--${data.level}`} style={{ ['--c' as string]: data.color }}>
      <path d={path} className={`pf-wire__line${strong && data.animate ? ' is-flowing' : ''}`} />
    </g>
  );
});

const nodeTypes = { card: CardView };
const edgeTypes = { wire: WireView };

function Graph({ layout, active, animate, rtl, onHold }: { layout: HierLayout; active: number | null; animate: boolean; rtl: boolean; onHold: (b: number[] | null) => void }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const { fitBounds } = useReactFlow();
  const narrow = layout.name === 'narrow';
  const fit = useCallback(() => fitBounds({ x: 0, y: 0, width: layout.w, height: layout.h }, { padding: 0, duration: 0 }), [fitBounds, layout]);
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    let raf = 0;
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(fit);
    });
    ro.observe(el);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [fit]);
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    el.querySelector('.react-flow')?.setAttribute('role', 'none');
    el.querySelector('.react-flow__nodes')?.setAttribute('role', 'list');
    el.querySelectorAll('.react-flow__edges').forEach((e) => e.setAttribute('aria-hidden', 'true'));
  }, []);

  const { nodes, edges } = useMemo(() => {
    const isLit = (p: PlacedNode) => active !== null && p.branches.includes(active);
    const byKey = new Map(layout.nodes.map((p) => [p.key, p]));
    const parents = new Set(layout.edges.map((e) => e.source));
    const ns: CardNode[] = layout.nodes.map((p) => ({
      id: p.key,
      type: 'card' as const,
      position: { x: rtl ? layout.w - p.x - p.w : p.x, y: p.y },
      width: p.w,
      height: p.h,
      draggable: false,
      selectable: false,
      focusable: false,
      ariaRole: 'listitem' as const,
      data: { placed: p, lit: isLit(p), narrow, hasChildren: parents.has(p.key), rtl, onHold },
    }));
    const es: WireEdge[] = layout.edges.map((e) => {
      const s = byKey.get(e.source)!;
      const t = byKey.get(e.target)!;
      const on = active !== null && s.branches.includes(active) && t.branches.includes(active);
      return { id: e.key, type: 'wire' as const, source: e.source, target: e.target, selectable: false, focusable: false, data: { color: e.color, level: on ? 'strong' : 'soft', animate, narrow } };
    });
    return { nodes: ns, edges: es };
  }, [layout, active, animate, narrow, rtl, onHold]);

  return (
    <div ref={rootRef} className="pf__rf">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onInit={fit}
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
        disableKeyboardA11y
        deleteKeyCode={null}
        selectionKeyCode={null}
        multiSelectionKeyCode={null}
        colorMode="light"
        proOptions={{ hideAttribution: true }}
      />
    </div>
  );
}

export default function HierarchyFlow({ locale, nodes, label }: HierarchyFlowProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const built = useMemo(() => buildHierarchy(nodes), [nodes]);
  const minRem = wideMinRem(built.wide);
  const [mounted, setMounted] = useState(false);
  const [layoutName, setLayoutName] = useState<HierLayoutName>('wide');
  const [motion, setMotion] = useState(false);
  const [inView, setInView] = useState(true);
  const [pageVisible, setPageVisible] = useState(true);
  const [cursor, setCursor] = useState(0);
  const [held, setHeld] = useState<number | null>(null);
  const [heldAll, setHeldAll] = useState(false);
  const [ready, setReady] = useState(false);
  const rtl = locale === 'ar';

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const measure = () => {
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      setLayoutName(el.getBoundingClientRect().width < minRem * rem ? 'narrow' : 'wide');
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncMotion = () => setMotion(!mq.matches);
    syncMotion();
    mq.addEventListener('change', syncMotion);
    const io = 'IntersectionObserver' in window ? new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.1 }) : null;
    io?.observe(el);
    const syncVisible = () => setPageVisible(!document.hidden);
    syncVisible();
    document.addEventListener('visibilitychange', syncVisible);
    setMounted(true);
    return () => {
      ro.disconnect();
      io?.disconnect();
      mq.removeEventListener('change', syncMotion);
      document.removeEventListener('visibilitychange', syncVisible);
    };
  }, [minRem]);

  useEffect(() => {
    if (!mounted) return;
    setReady(false);
    const timer = window.setTimeout(() => setReady(true), 90);
    return () => window.clearTimeout(timer);
  }, [mounted, layoutName]);

  const holding = held !== null || heldAll;
  const cycling = mounted && ready && motion && inView && pageVisible && !holding && built.branchCount > 1;
  useEffect(() => {
    if (!cycling) return;
    const timer = window.setInterval(() => setCursor((c) => (c + 1) % built.branchCount), CYCLE_MS);
    return () => window.clearInterval(timer);
  }, [cycling, built.branchCount]);

  const onHold = useCallback((branches: number[] | null) => {
    setHeld(branches && branches.length ? branches[0] : null);
    setHeldAll(false);
  }, []);
  const active = held ?? (motion && built.branchCount ? cursor : null);
  const animate = motion && inView && pageVisible;

  const vars: Record<string, string | number> = {
    '--hf-ar-wide': `${built.wide.w} / ${built.wide.h}`,
    '--hf-ar-narrow': `${built.narrow.w} / ${built.narrow.h}`,
  };
  const layout = built[layoutName];

  return (
    <div ref={rootRef} className="pf hf" data-min={minRem} data-layout={mounted ? layoutName : undefined} style={vars as CSSProperties}>
      <div className="hf__box" role="group" aria-label={label}>
        {mounted && (
          <div className={`pf__flow${ready ? ' is-ready' : ''}`}>
            <ReactFlowProvider key={layoutName}>
              <Graph layout={layout} active={active} animate={animate} rtl={rtl} onHold={onHold} />
            </ReactFlowProvider>
          </div>
        )}
      </div>
    </div>
  );
}
