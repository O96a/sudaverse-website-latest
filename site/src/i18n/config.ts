export const locales = ['en', 'ar'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

export interface LocaleMeta {
  /** Name of the language in that language (for the switcher). */
  label: string;
  short: string;
  dir: 'ltr' | 'rtl';
  htmlLang: string;
  ogLocale: string;
}

export const localeMeta: Record<Locale, LocaleMeta> = {
  en: { label: 'English', short: 'EN', dir: 'ltr', htmlLang: 'en', ogLocale: 'en_US' },
  ar: { label: 'العربية', short: 'ع', dir: 'rtl', htmlLang: 'ar', ogLocale: 'ar_AR' },
};

/** A string in every supported language. English is the fallback. */
export type Localized<T = string> = Record<Locale, T>;

export function isLocale(value: string | undefined): value is Locale {
  return !!value && (locales as readonly string[]).includes(value);
}

export function otherLocale(locale: Locale): Locale {
  return locale === 'en' ? 'ar' : 'en';
}

/** Pick a localized value, falling back to English. */
export function pick<T>(value: Localized<T> | undefined, locale: Locale): T | undefined {
  if (!value) return undefined;
  return value[locale] ?? value[defaultLocale];
}
