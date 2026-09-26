/**
 * Layout for hierarchy diagrams (the research direction map and the Artifacts <Hierarchy> component).
 * Input is a small graph: one or more roots, and nodes that name their parents (a node may have several, as a
 * project that feeds two research directions). Wide containers get layered rows, top to bottom, ordered by
 * the parents' positions; narrow containers get an indented outline in which a shared node appears under each
 * of its parents. Everything is virtual pixels; the React Flow viewport scales the scene to the container.
 */
export interface HierNode {
  id: string;
  label: string;
  /** One short line under the label. */
  sub?: string;
  parents?: string[];
  /** Graphic colour for the dot, ring and wires. Defaults to the branch colour. */
  color?: string;
  href?: string;
}

export interface PlacedNode {
  /** Unique per placement (a shared node placed twice in the outline gets two keys). */
  key: string;
  node: HierNode;
  depth: number;
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  /** Indexes of the depth-1 branches this placement belongs to (the roots belong to all). */
  branches: number[];
}
export interface PlacedEdge {
  key: string;
  source: string;
  target: string;
  color: string;
}
export type HierLayoutName = 'wide' | 'narrow';
export interface HierLayout {
  name: HierLayoutName;
  w: number;
  h: number;
  nodes: PlacedNode[];
  edges: PlacedEdge[];
}

export const BRANCH_PALETTE = ['var(--viz-sky)', 'var(--viz-copper)', 'var(--viz-navy)', 'var(--viz-gold)', 'var(--viz-green)', 'var(--sage-600)', 'var(--brand-blue-600)'];
const ROOT_COLOR = 'var(--brand-navy)';

/** Container widths (rem) at which a hierarchy may switch to the wide layout. Keep in sync with hierarchy.css. */
export const HIER_BUCKETS = [36, 44, 52, 60, 68, 76, 84];

const HEAD = 40; // a title-only card
const SUB_TOP = 34; // title bar when there is a sub line
const PAD = 20;
const LINE = 17;
const textW = (s: string) => Math.ceil(s.length * 7.1) + 44; // label at 13px plus dot and padding

function depths(nodes: HierNode[]) {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const d = new Map<string, number>();
  const visit = (n: HierNode, seen: Set<string>): number => {
    if (d.has(n.id)) return d.get(n.id)!;
    if (seen.has(n.id)) throw new Error(`Hierarchy: cycle at "${n.id}"`);
    seen.add(n.id);
    const ps = (n.parents ?? []).map((p) => {
      const parent = byId.get(p);
      if (!parent) throw new Error(`Hierarchy: "${n.id}" names an unknown parent "${p}"`);
      return visit(parent, seen);
    });
    const v = ps.length ? Math.max(...ps) + 1 : 0;
    d.set(n.id, v);
    return v;
  };
  nodes.forEach((n) => visit(n, new Set()));
  return d;
}

function cardH(n: HierNode, w: number) {
  if (!n.sub) return HEAD;
  const perLine = Math.max(10, Math.floor((w - 28) / 6.6));
  return Math.round(SUB_TOP + PAD + Math.ceil(n.sub.length / perLine) * LINE + 2);
}

function colorsAndBranches(nodes: HierNode[], depth: Map<string, number>) {
  const branchIds = nodes.filter((n) => depth.get(n.id) === 1).map((n) => n.id);
  const color = new Map<string, string>();
  const branches = new Map<string, number[]>();
  const all = branchIds.map((_, i) => i);
  const ordered = [...nodes].sort((a, b) => depth.get(a.id)! - depth.get(b.id)!);
  ordered.forEach((n) => {
    const dp = depth.get(n.id)!;
    if (dp === 0) {
      color.set(n.id, n.color ?? ROOT_COLOR);
      branches.set(n.id, all);
    } else if (dp === 1) {
      const i = branchIds.indexOf(n.id);
      color.set(n.id, n.color ?? BRANCH_PALETTE[i % BRANCH_PALETTE.length]);
      branches.set(n.id, [i]);
    } else {
      const ps = n.parents ?? [];
      color.set(n.id, n.color ?? color.get(ps[0]) ?? ROOT_COLOR);
      branches.set(n.id, [...new Set(ps.flatMap((p) => branches.get(p) ?? []))].sort((a, b) => a - b));
    }
  });
  return { color, branches, branchCount: branchIds.length };
}

export function buildHierarchy(nodes: HierNode[]): Record<HierLayoutName, HierLayout> & { branchCount: number } {
  const depth = depths(nodes);
  const { color, branches, branchCount } = colorsAndBranches(nodes, depth);
  const maxDepth = Math.max(0, ...depth.values());
  const pad = 12;

  /* ---------- wide: layered rows ---------- */
  const hgap = 18;
  const vgap = 64;
  const layers: HierNode[][] = Array.from({ length: maxDepth + 1 }, () => []);
  nodes.forEach((n) => layers[depth.get(n.id)!].push(n));
  const cw = layers.map((l) => (l.some((n) => n.sub) ? 196 : Math.min(210, Math.max(118, ...l.map((n) => textW(n.label))))));
  const layerW = layers.map((l, i) => l.length * cw[i] + (l.length - 1) * hgap);
  const innerW = Math.max(...layerW);
  const centreX = new Map<string, number>();
  let y = pad;
  const wideNodes: PlacedNode[] = [];
  layers.forEach((layer, li) => {
    const order =
      li < 2
        ? layer
        : [...layer]
            .map((n, i) => {
              const xs = (n.parents ?? []).map((p) => centreX.get(p) ?? 0);
              return { n, i, bc: xs.reduce((s, v) => s + v, 0) / Math.max(1, xs.length) };
            })
            .sort((a, b) => a.bc - b.bc || a.i - b.i)
            .map((o) => o.n);
    const w = cw[li];
    const h = Math.max(...order.map((n) => cardH(n, w)));
    let x = pad + (innerW - layerW[li]) / 2;
    order.forEach((n) => {
      wideNodes.push({ key: n.id, node: n, depth: li, x, y, w, h, color: color.get(n.id)!, branches: branches.get(n.id)! });
      centreX.set(n.id, x + w / 2);
      x += w + hgap;
    });
    y += h + vgap;
  });
  const wideEdges: PlacedEdge[] = nodes.flatMap((n) =>
    (n.parents ?? []).map((p) => ({ key: `${p}>${n.id}`, source: p, target: n.id, color: depth.get(n.id) === 1 ? color.get(n.id)! : color.get(p)! })),
  );
  const wide: HierLayout = { name: 'wide', w: innerW + pad * 2, h: y - vgap + pad + 8, nodes: wideNodes, edges: wideEdges };

  /* ---------- narrow: indented outline ---------- */
  const W = 320;
  const indent = 26;
  const gap = 12;
  const narrowNodes: PlacedNode[] = [];
  const narrowEdges: PlacedEdge[] = [];
  const childrenOf = (id: string) => nodes.filter((n) => (n.parents ?? []).includes(id));
  let ny = pad;
  const seenKeys = new Map<string, number>();
  const walk = (n: HierNode, d: number, parentKey: string | null, branch: number[]) => {
    const k = (seenKeys.get(n.id) ?? 0) + 1;
    seenKeys.set(n.id, k);
    const key = k === 1 ? n.id : `${n.id}~${k}`;
    const x = pad + d * indent;
    const w = W - pad - x;
    const h = cardH(n, w);
    const own = d === 0 ? branches.get(n.id)! : d === 1 ? branches.get(n.id)! : branch;
    const c = d >= 2 && parentKey ? narrowNodes.find((p) => p.key === parentKey)!.color : color.get(n.id)!;
    narrowNodes.push({ key, node: n, depth: d, x, y: ny, w, h, color: c, branches: own });
    if (parentKey) narrowEdges.push({ key: `${parentKey}>${key}`, source: parentKey, target: key, color: d === 1 ? c : narrowNodes.find((p) => p.key === parentKey)!.color });
    ny += h + gap;
    childrenOf(n.id).forEach((ch) => walk(ch, d + 1, key, own));
  };
  nodes.filter((n) => depth.get(n.id) === 0).forEach((r) => walk(r, 0, null, branches.get(r.id)!));
  const narrow: HierLayout = { name: 'narrow', w: W, h: ny - gap + pad + 4, nodes: narrowNodes, edges: narrowEdges };

  return { wide, narrow, branchCount };
}

/** The smallest bucket (rem) at or above the width where the wide scene still shows 13px text at about 10px. */
export function wideMinRem(wide: HierLayout) {
  const need = (wide.w * 0.742) / 16;
  return HIER_BUCKETS.find((b) => b >= need) ?? HIER_BUCKETS[HIER_BUCKETS.length - 1];
}
