/**
 * The URL prefix the site is served under: '' on a domain root (www.sudaverse.com), or '/repo-name' when
 * GitHub Pages serves a project page. It comes from Astro's `base` option (SITE_BASE at build time), so the
 * same source works in both places. Every root-absolute link and asset goes through withBase().
 */
export const BASE: string = (import.meta.env.BASE_URL ?? '/').replace(/\/+$/, '');

/** '/en/' -> '/repo/en/' (or unchanged on a domain root). Relative and external URLs pass through. */
export const withBase = (path: string): string => (path.startsWith('/') && !path.startsWith('//') ? BASE + path : path);

/** '/repo/en/x/' -> '/en/x/'. */
export const stripBase = (pathname: string): string =>
  BASE && (pathname === BASE || pathname.startsWith(BASE + '/')) ? pathname.slice(BASE.length) || '/' : pathname;
