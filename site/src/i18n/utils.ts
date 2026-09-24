import { defaultLocale, isLocale, localeMeta, locales, type Locale } from './config';
import { ui, type UiKey } from './ui';
import { stripBase, withBase } from './base';

/** Translate a UI string. Falls back to English, then to the key. */
export function t(locale: Locale, key: UiKey): string {
  return ui[locale]?.[key] ?? ui[defaultLocale][key] ?? key;
}

export function dirOf(locale: Locale) {
  return localeMeta[locale].dir;
}

/** Normalise a path segment list into `/segment/segment/` form. */
function clean(path: string) {
  const p = path.replace(/^\/+|\/+$/g, '');
  return p ? `/${p}/` : '/';
}

/** Build a locale-prefixed, trailing-slash path: localePath('ar', 'products/terab') -> /ar/products/terab/ */
export function localePath(locale: Locale, path = ''): string {
  const p = clean(path);
  return withBase(`/${locale}${p === '/' ? '/' : p}`);
}

/** Strip the locale prefix from a pathname: /ar/products/ -> products */
export function stripLocale(pathname: string): string {
  const parts = stripBase(pathname).split('/').filter(Boolean);
  if (parts.length && isLocale(parts[0])) parts.shift();
  return parts.join('/');
}

/** The locale encoded in the URL, defaulting to English. */
export function localeFromUrl(url: URL): Locale {
  const first = stripBase(url.pathname).split('/').filter(Boolean)[0];
  return isLocale(first) ? first : defaultLocale;
}

/** Alternate URLs of the same page in every locale (for hreflang and the switcher). */
export function alternates(pathname: string, origin: string) {
  const rest = stripLocale(pathname);
  return locales.map((l) => ({ locale: l, href: new URL(localePath(l, rest), origin).toString() }));
}

/** getStaticPaths helper: one entry per locale. */
export function localeStaticPaths() {
  return locales.map((lang) => ({ params: { lang } }));
}
