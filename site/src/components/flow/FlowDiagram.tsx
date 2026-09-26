import { memo, useCallback, useEffect, useId, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
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
import './pipeline.css';
import { t, localePath } from '@/i18n/utils';
import type { Locale } from '@/i18n/config';
import { CYCLE_MS, HEAD_MID, buildLayouts, rowMinRem, stepColor, type FlowStepData, type Layout, type LayoutName } from './flow-layout';

/**
 * A step-flow diagram in the Sudaverse style: glass cards joined by dashed wires, one step lit at a time.
 * Used by the homepage pipeline (PipelineFlow) and by every project page's user flow. Pass the steps, an
 * accessible label for the group, and any Latin names that must stay untranslated inside Arabic text.
 */
export interface FlowDiagramProps {
  locale: Locale;
  steps: FlowStepData[];
  /** Accessible name of the whole diagram, per locale (it reads as a list of steps). */
  label: string;
  /** Latin brand names kept untranslated and bidi-isolated inside Arabic descriptions. */
  names?: string[];
  /** Fixed card height for the row layout (virtual px). By default it is measured from the text. */
  wideCardH?: number;
}

type Level = 'strong' | 'soft';


interface StepData extends Record<string, unknown> {
  step: FlowStepData;
  color: string;
  last: boolean;
  split: RegExp | null;
  index: number;
  locale: Locale;
  uid: string;
  active: boolean;
  vertical: boolean;
  rtl: boolean;
  onHold: (index: number | null) => void;
}
interface WireData extends Record<string, unknown> {
  color: string;
  level: Level;
  animate: boolean;
}
type StepNode = Node<StepData, 'step'>;
type WireEdge = Edge<WireData, 'wire'>;

/* ---------- icons (same paths as the site Icon component) ---------- */

function Ico({ kind }: { kind: 'external' | 'arrow' }) {
  return (
    <svg className={`pf-ico pf-ico--${kind}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {kind === 'external' ? <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" /> : <path d="M4 12h15M13 6l6 6-6 6" />}
    </svg>
  );
}

/** Wraps Latin product names so they stay untranslated and isolated inside Arabic sentences. */
function Desc({ text, split }: { text: string; split: RegExp | null }): ReactNode {
  if (!split) return text;
  return text.split(split).map((part, i) =>
    i % 2 === 1 ? (
      <span key={i} translate="no" className="pf-name">
        {part}
      </span>
    ) : (
      part
    ),
  );
}

/* ---------- step card: shared by the graph nodes and the server placeholder list ---------- */

function StepCard({
  step,
  color,
  split,
  index,
  locale,
  uid,
  active = false,
  onHold,
}: {
  step: FlowStepData;
  color: string;
  split: RegExp | null;
  index: number;
  locale: Locale;
  uid: string;
  active?: boolean;
  onHold?: (index: number | null) => void;
}) {
  const link = step.link;
  const external = link?.kind === 'external';
  const href = link ? (link.kind === 'external' ? link.href : localePath(locale, link.path)) : undefined;
  const titleId = `${uid}-t${index}`;
  return (
    <div
      className={`pf-card${active ? ' is-active' : ''}${link ? ' has-link' : ''}`}
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
      style={{ ['--c' as string]: color }}
      onPointerEnter={onHold ? (e) => e.pointerType === 'mouse' && onHold(index) : undefined}
      onPointerLeave={onHold ? (e) => e.pointerType === 'mouse' && onHold(null) : undefined}
      onFocus={onHold ? () => onHold(index) : undefined}
      onBlur={onHold ? () => onHold(null) : undefined}
    >
      <h4 className="pf-card__head" id={titleId}>
        <span className="pf-card__dot" aria-hidden="true" />
        <span className="pf-card__title">{step.title[locale]}</span>
      </h4>
      <div className="pf-card__body">
        <p className="pf-card__desc">
          <Desc text={step.desc[locale]} split={split} />
        </p>
        {link && (
          <a
            className="pf-card__link"
            href={href}
            aria-describedby={titleId}
            {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          >
            <span className="pf-card__linktext" translate={link.kind === 'internal' ? 'no' : undefined}>
              {link.label[locale]}
            </span>
            <Ico kind={external ? 'external' : 'arrow'} />
            {external && <span className="sr-only"> ({t(locale, 'a11y.external')})</span>}
          </a>
        )}
      </div>
    </div>
  );
}

/* ---------- graph node ---------- */

const StepNodeView = memo(function StepNodeView({ data }: NodeProps<StepNode>) {
  const { step, color, last, split } = data;
  const inPos = data.vertical ? Position.Top : data.rtl ? Position.Right : Position.Left;
  const outPos = data.vertical ? Position.Bottom : data.rtl ? Position.Left : Position.Right;
  const handleStyle = data.vertical ? undefined : { top: HEAD_MID };
  return (
    <div className="pf-node" style={{ ['--c' as string]: color }}>
      <StepCard step={step} color={color} split={split} index={data.index} locale={data.locale} uid={data.uid} active={data.active} onHold={data.onHold} />
      {data.index > 0 && <Handle type="target" position={inPos} isConnectable={false} className="pf-handle" style={handleStyle} />}
      {!last && <Handle type="source" position={outPos} isConnectable={false} className="pf-handle" style={handleStyle} />}
    </div>
  );
});

/* ---------- wire: neutral dashed hairline; the active one takes its step colour ---------- */

const WireView = memo(function WireView(props: EdgeProps<WireEdge>) {
  const { sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data } = props;
  if (!data) return null;
  const [path] = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition, curvature: 0.4 });
  const strong = data.level === 'strong';
  return (
    <g className={`pf-wire pf-wire--${data.level}`} style={{ ['--c' as string]: data.color }}>
      <path d={path} className={`pf-wire__line${strong && data.animate ? ' is-flowing' : ''}`} />
    </g>
  );
});

const nodeTypes = { step: StepNodeView };
const edgeTypes = { wire: WireView };

/* ---------- graph ---------- */

function Flow({
  steps,
  split,
  locale,
  layout,
  uid,
  active,
  animate,
  onHold,
}: {
  steps: FlowStepData[];
  split: RegExp | null;
  locale: Locale;
  layout: Layout;
  uid: string;
  active: number | null;
  animate: boolean;
  onHold: (index: number | null) => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const { fitBounds } = useReactFlow();
  const vertical = layout.name === 'narrow';
  const rtl = locale === 'ar';

  // Fit the whole scene (cards plus the room around them for rings and shadows) into the container, which
  // reserves the same aspect ratio. fitView would fit only the cards' bounding box and crop that room.
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

  // React Flow marks its root role="application" and every edge as an image. Neither helps here: expose the
  // steps as the list they are, and hide the decorative wires.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    el.querySelector('.react-flow')?.setAttribute('role', 'none');
    el.querySelector('.react-flow__nodes')?.setAttribute('role', 'list');
    el.querySelectorAll('.react-flow__edges').forEach((e) => e.setAttribute('aria-hidden', 'true'));
  }, []);

  const { nodes, edges } = useMemo(() => {
    const ns: StepNode[] = steps.map((step, i) => {
      const s = layout.slots[i];
      return {
        id: `s${i}`,
        type: 'step' as const,
        position: { x: rtl ? layout.w - s.x - s.w : s.x, y: s.y },
        width: s.w,
        height: s.h,
        draggable: false,
        selectable: false,
        focusable: false,
        ariaRole: 'listitem' as const,
        data: { step, color: stepColor(step, i), last: i === steps.length - 1, split, index: i, locale, uid, active: active === i, vertical, rtl, onHold },
      };
    });
    const es: WireEdge[] = steps.slice(0, -1).map((step, i) => ({
      id: `w${i}`,
      type: 'wire' as const,
      source: `s${i}`,
      target: `s${i + 1}`,
      selectable: false,
      focusable: false,
      data: { color: stepColor(step, i), level: active === i ? 'strong' : 'soft', animate },
    }));
    return { nodes: ns, edges: es };
  }, [steps, split, layout, locale, uid, active, animate, vertical, rtl, onHold]);

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

/* ---------- island ---------- */

const NO_NAMES: string[] = [];

export default function FlowDiagram({ locale, steps, label, names = NO_NAMES, wideCardH }: FlowDiagramProps) {
  const uid = useId();
  const layouts = useMemo(() => buildLayouts(steps, { wideCardH }), [steps, wideCardH]);
  const split = useMemo(() => (names.length ? new RegExp(`(${names.map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`) : null), [names]);
  const rowMin = rowMinRem(steps.length);
  const rootRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [layoutName, setLayoutName] = useState<LayoutName>('wide');
  const [motion, setMotion] = useState(false);
  const [inView, setInView] = useState(true);
  const [pageVisible, setPageVisible] = useState(true);
  const [cursor, setCursor] = useState(0);
  const [held, setHeld] = useState<number | null>(null);
  const [ready, setReady] = useState(false);
  const [listGone, setListGone] = useState(false);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const measure = () => {
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      setLayoutName(el.getBoundingClientRect().width < rowMin * rem ? 'narrow' : 'wide');
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
  }, [rowMin]);

  // React Flow places its viewport a frame after mounting: fade the graph in once it has, and let the
  // placeholder list (identical cards in identical places) fade out and leave the DOM.
  useEffect(() => {
    if (!mounted) return;
    setReady(false);
    const timer = window.setTimeout(() => setReady(true), 90);
    return () => window.clearTimeout(timer);
  }, [mounted, layoutName]);
  useEffect(() => {
    if (!ready || listGone) return;
    const timer = window.setTimeout(() => setListGone(true), 800);
    return () => window.clearTimeout(timer);
  }, [ready, listGone]);

  // The "signal": one step lit at a time, in sequence. Pauses while a card is hovered or focused, when the
  // diagram is scrolled out of view or the tab is hidden, and never runs under reduced motion.
  const cycling = mounted && ready && motion && inView && pageVisible && held === null;
  useEffect(() => {
    if (!cycling) return;
    const timer = window.setInterval(() => setCursor((c) => (c + 1) % steps.length), CYCLE_MS);
    return () => window.clearInterval(timer);
  }, [cycling, steps.length]);

  const onHold = useCallback((index: number | null) => setHeld(index), []);
  const active = held ?? (motion ? cursor : null);
  const animate = motion && inView && pageVisible;

  const wide = layouts.wide;
  const narrow = layouts.narrow;
  const vars: Record<string, string | number> = {
    '--pf-ar-wide': `${wide.w} / ${wide.h}`,
    '--pf-ar-narrow': `${narrow.w} / ${narrow.h}`,
    '--pf-w-wide': wide.w,
    '--pf-w-narrow': narrow.w,
  };
  const layout = layouts[layoutName];

  return (
    <div ref={rootRef} className="pf" data-n={Math.min(7, Math.max(3, steps.length))} data-layout={mounted ? layoutName : undefined} data-motion={motion ? 'on' : 'off'} style={vars as CSSProperties}>
      <div className="pf__box" role="group" aria-label={label}>
        {mounted && (
          <div className={`pf__flow${ready ? ' is-ready' : ''}`}>
            <ReactFlowProvider key={layoutName}>
              <Flow steps={steps} split={split} locale={locale} layout={layout} uid={uid} active={active} animate={animate} onHold={onHold} />
            </ReactFlowProvider>
          </div>
        )}
        {!listGone && (
          <ol className={`pf__list${ready ? ' is-leaving' : ''}`} role="list" aria-hidden={mounted ? true : undefined}>
            {steps.map((step, i) => {
              const w = wide.slots[i];
              const n = narrow.slots[i];
              const mx = (x: number, cw: number, sceneW: number) => (locale === 'ar' ? sceneW - x - cw : x);
              const pos = { '--wx': mx(w.x, w.w, wide.w), '--wy': w.y, '--ww': w.w, '--wh': w.h, '--nx': mx(n.x, n.w, narrow.w), '--ny': n.y, '--nw': n.w, '--nh': n.h } as CSSProperties;
              return (
                <li key={step.id} className="pf__item" style={pos}>
                  <StepCard step={step} color={stepColor(step, i)} split={split} index={i} locale={locale} uid={`${uid}-l`} />
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </div>
  );
}
