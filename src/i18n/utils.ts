/**
 * Pure i18n helpers with no dictionaries attached: safe to import from client islands and scripts.
 * Server code imports them through './index'.
 */
import { defaultLocale, intlLocale, isLocale, listAnd, localeMeta, locales, type Locale } from './config';

export { locales, defaultLocale, localeMeta, intlLocale, isLocale, type Locale };

/** A string with plural forms (CLDR categories). `other` is required; give each language the forms it needs. */
export type Plural = Partial<Record<Intl.LDMLPluralRule, string>> & { other: string };

/** Remove any locale prefix: '/ru/destinations' -> '/destinations', '/ru' -> '/'. */
export function stripLang(path: string): string {
  const m = path.match(/^\/([a-z]{2})(?=\/|$|[?#])/);
  if (m && isLocale(m[1]) && m[1] !== defaultLocale) return path.slice(3) || '/';
  return path;
}

/**
 * Localize an internal path for `lang`. Accepts query strings and hashes ('/design-my-trip?sample=wild', '/#how').
 * External URLs, mailto:, tel:, and in-page '#anchors' are returned untouched.
 */
export function l(lang: Locale, path: string): string {
  if (!path.startsWith('/') || path.startsWith('//')) return path;
  const bare = stripLang(path);
  if (lang === defaultLocale) return bare;
  const i = bare.search(/[?#]/);
  const p = i === -1 ? bare : bare.slice(0, i);
  const rest = i === -1 ? '' : bare.slice(i);
  return `/${lang}${p === '/' ? '' : p}${rest}`;
}

/** Every language version of an (unprefixed) path, for hreflang and the switcher. */
export const alternates = (path: string) => locales.map((lang) => ({ lang, href: l(lang, path) }));

/** Static paths for a page under src/pages/[...lang]/: English has no prefix (lang undefined). */
export const langPaths = () => locales.map((lang) => ({ params: { lang: lang === defaultLocale ? undefined : lang } }));

/** Replace {name} placeholders. */
export function fmt(template: string, vars: Record<string, string | number> = {}): string {
  return template.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
}

/** Pick the right plural form and fill {n} (and any other placeholders). */
export function plural(lang: Locale, n: number, forms: Plural, vars: Record<string, string | number> = {}): string {
  const rule = new Intl.PluralRules(intlLocale[lang]).select(n);
  return fmt(forms[rule] ?? forms.other, { n, ...vars });
}

export const formatDate = (lang: Locale, d: Date | string, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' }) =>
  new Date(d).toLocaleDateString(intlLocale[lang], { timeZone: 'UTC', ...opts });

/** Number formatting; where a browser lacks Georgian data, Russian conventions (space groups, € after) are the closest. */
export const formatNumber = (lang: Locale, n: number, opts?: Intl.NumberFormatOptions) => {
  const tag = Intl.NumberFormat.supportedLocalesOf(intlLocale[lang]).length ? intlLocale[lang] : lang === 'ka' ? 'ru-RU' : intlLocale[lang];
  return n.toLocaleString(tag, opts);
};

/** "A, B and C" in the page's language. */
export const listFormat = (lang: Locale, items: string[], type: 'conjunction' | 'disjunction' = 'conjunction') => {
  if (type === 'conjunction' && !Intl.ListFormat.supportedLocalesOf(intlLocale[lang]).length) {
    return items.length < 2 ? items.join('') : `${items.slice(0, -1).join(', ')} ${listAnd[lang]} ${items[items.length - 1]}`;
  }
  return new Intl.ListFormat(intlLocale[lang], { style: 'long', type }).format(items);
};

/**
 * Localize every internal link inside a trusted HTML snippet from a dictionary (rendered with set:html),
 * so translators write '<a href="/contact">' and readers of /ru get '/ru/contact'.
 */
export const localizeHtml = (lang: Locale, html: string) =>
  lang === defaultLocale ? html : html.replace(/href="(\/(?!\/)[^"]*)"/g, (_, p: string) => `href="${l(lang, p)}"`);
