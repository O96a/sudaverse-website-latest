/**
 * Shared behaviour for the Artifacts chart kit (DonutChart, BarChart). No dependencies.
 *
 * Draw-in: every chart renders in its final state. With motion allowed, charts that start below the fold are
 * "armed" (drawn empty) and draw in once when scrolled into view; charts already on screen are left alone,
 * so nothing flashes. Under prefers-reduced-motion nothing moves.
 *
 * Tooltip: one element for the page. Marks carry `data-tip` (plain text, inserted with textContent) and show
 * it on hover and on keyboard focus. Tooltips only repeat values that are also in the labels and the table.
 */
const charts = Array.from(document.querySelectorAll<HTMLElement>('[data-viz]:not([data-viz-ready])'));
charts.forEach((c) => c.setAttribute('data-viz-ready', ''));

const motion = window.matchMedia('(prefers-reduced-motion: no-preference)').matches;
if (motion && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        requestAnimationFrame(() => e.target.classList.add('is-in'));
      });
    },
    { threshold: 0.35 },
  );
  charts.forEach((c) => {
    const r = c.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) return;
    c.setAttribute('data-armed', '');
    io.observe(c);
  });
}

let tip = document.querySelector<HTMLDivElement>('.viz-tip');
if (!tip) {
  tip = document.createElement('div');
  tip.className = 'viz-tip';
  tip.setAttribute('role', 'presentation');
  tip.hidden = true;
  document.body.append(tip);
}
const tipEl = tip;

const place = (x: number, y: number) => {
  const pad = 12;
  const w = tipEl.offsetWidth;
  const h = tipEl.offsetHeight;
  let left = x + pad;
  let top = y - h - pad;
  if (left + w > window.innerWidth - 8) left = x - w - pad;
  if (top < 8) top = y + pad;
  tipEl.style.left = `${Math.max(8, left)}px`;
  tipEl.style.top = `${top}px`;
};
const show = (mark: Element, x: number, y: number) => {
  const text = mark.getAttribute('data-tip');
  if (!text) return;
  const [value, label] = text.split('|');
  tipEl.replaceChildren();
  const v = document.createElement('strong');
  v.textContent = value;
  tipEl.append(v);
  if (label) {
    const l = document.createElement('span');
    l.textContent = label;
    tipEl.append(l);
  }
  const color = mark.getAttribute('data-color');
  tipEl.style.setProperty('--c', color ?? 'transparent');
  tipEl.hidden = false;
  place(x, y);
};
const hide = () => {
  tipEl.hidden = true;
};

charts.forEach((chart) => {
  chart.querySelectorAll('[data-tip]').forEach((mark) => {
    mark.addEventListener('pointermove', (e) => {
      const ev = e as PointerEvent;
      if (ev.pointerType === 'touch') return;
      show(mark, ev.clientX, ev.clientY);
    });
    mark.addEventListener('pointerleave', hide);
    mark.addEventListener('focus', () => {
      const r = mark.getBoundingClientRect();
      show(mark, r.left + r.width / 2, r.top);
    });
    mark.addEventListener('blur', hide);
  });
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') hide();
});
window.addEventListener('scroll', hide, { passive: true });
