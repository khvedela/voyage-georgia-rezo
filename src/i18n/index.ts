/**
 * i18n helpers used by every page, component and endpoint.
 *
 *   const lang = getLang(Astro);        // 'en' | 'ru' | 'ka' | 'lv', from the URL
 *   const t = useT(lang);               // the typed dictionary for that language
 *   <a href={l(lang, '/destinations')}> // '/ru/destinations' (paths in code are always written unprefixed)
 *   fmt(t.pages.home.world.stopOf, { i: 2, n: 6 })
 *   plural(lang, 3, t.common.units.days) // '3 дня'
 *
 * Rules: no user-visible string is ever hard-coded in a component; every one lives in src/i18n/<lang>/.
 * Client islands import from './utils' (no dictionaries) and receive their strings as props. See docs/I18N.md.
 */
import { defaultLocale, isLocale, type Locale } from './config';
import { dictionaries, type Dict } from './dictionaries';
import { stripLang } from './utils';

export * from './utils';
export { type Dict };

/** Language of the current page, from the first path segment. Works in pages, components and endpoints. */
export function getLang(ctx: { url: URL } | URL | string): Locale {
  const seg = cleanPath(ctx).split('/')[1];
  return isLocale(seg) && seg !== defaultLocale ? seg : defaultLocale;
}

/** The request path without '.html', '/index' or a trailing slash (build.format 'file' renders '/ru' as '/ru.html'). */
function cleanPath(ctx: { url: URL } | URL | string): string {
  const pathname = typeof ctx === 'string' ? ctx : ctx instanceof URL ? ctx.pathname : ctx.url.pathname;
  return pathname.replace(/\.html$/, '').replace(/\/index$/, '').replace(/\/$/, '') || '/';
}

/** The current page's language-neutral path: '/ru/destinations/kazbegi' -> '/destinations/kazbegi'. */
export const currentPath = (ctx: { url: URL } | URL | string): string => stripLang(cleanPath(ctx));

export const useT = (lang: Locale): Dict => dictionaries[lang];
