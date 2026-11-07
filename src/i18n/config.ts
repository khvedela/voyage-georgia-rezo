/**
 * The site's languages. English is the default and lives at the root (`/destinations`); every other locale is
 * prefixed (`/ru/destinations`, `/ka/destinations`, `/lv/destinations`). Add a locale here, add its dictionary in
 * src/i18n/<code>/ and its content folders in src/content/<collection>/<code>/, and every page, the sitemap,
 * hreflang, the language switcher and the audit pick it up.
 */
export const locales = ['en', 'ru', 'ka', 'lv'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

export interface LocaleMeta {
  /** Name of the language in that language, for the switcher. */
  label: string;
  /** Short code shown in the header switcher. */
  short: string;
  /** BCP 47 tag for <html lang>, hreflang and Intl formatting. */
  tag: string;
  /** Open Graph locale. */
  og: string;
}

export const localeMeta: Record<Locale, LocaleMeta> = {
  en: { label: 'English', short: 'EN', tag: 'en', og: 'en_GB' },
  ru: { label: 'Русский', short: 'RU', tag: 'ru', og: 'ru_RU' },
  ka: { label: 'ქართული', short: 'KA', tag: 'ka', og: 'ka_GE' },
  lv: { label: 'Latviešu', short: 'LV', tag: 'lv', og: 'lv_LV' },
};

/**
 * "and" in each language, for joining lists in browsers whose Intl lacks the locale's data (some Chromium builds
 * ship without Georgian). Normally Intl.ListFormat does the work.
 */
export const listAnd: Record<Locale, string> = { en: 'and', ru: 'и', ka: 'და', lv: 'un' };

/** Intl locale used for dates and numbers (English uses British conventions, like the copy). */
export const intlLocale: Record<Locale, string> = { en: 'en-GB', ru: 'ru-RU', ka: 'ka-GE', lv: 'lv-LV' };

export const isLocale = (v: unknown): v is Locale => typeof v === 'string' && (locales as readonly string[]).includes(v);
