import { isLocale, type Locale } from '@/i18n/config';

/** Chart chrome strings. Chart content (titles, labels, sources) comes from the artifact itself. */
export const vizText = {
  en: { table: 'Show the data as a table', source: 'Source', category: 'Category', value: 'Value', share: 'Share', other: 'Other', step: 'Step' },
  ar: { table: 'اعرض البيانات في جدول', source: 'المصدر', category: 'الفئة', value: 'القيمة', share: 'النسبة', other: 'أخرى', step: 'الخطوة' },
} as const;

/** Charts render inside a page under /[lang]/: read the locale from the route. */
export const vizLocale = (lang: string | undefined): Locale => (isLocale(lang) ? lang : 'en');

/** Latin digits on both locales, as elsewhere on the site. */
export const fmt = (locale: Locale, n: number, decimals = 0) =>
  new Intl.NumberFormat(locale === 'ar' ? 'ar-u-nu-latn' : 'en', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(n);

/** Categorical slots in fixed order (tokens.css). Never cycled: callers fold a sixth series into "Other". */
export const SLOTS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)'];
export const OTHER = 'var(--chart-other)';
