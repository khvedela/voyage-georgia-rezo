#!/usr/bin/env node
// Post-build SEO / GEO audit. Run: npm run build && npm run verify
// Fails (exit 1) on anything that would hurt discoverability: missing/duplicate titles, descriptions, canonicals,
// H1 count, invalid JSON-LD, broken internal links, images without alt, placeholders leaking into indexable pages.
// i18n: every page exists in every language with the right <html lang>, reciprocal hreflang, and words that are not
// simply the English copy; every content file and dictionary is translated (see docs/I18N.md).
import { readdir, readFile, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { parse } from 'node-html-parser';

const DIST = new URL('../dist/', import.meta.url).pathname;
const ROOT = new URL('../', import.meta.url).pathname;
// Keep in sync with src/i18n/config.ts.
const LOCALES = ['en', 'ru', 'ka', 'lv'];
const DEFAULT = 'en';
const langOf = (url) => { const s = url.split('/')[1]; return LOCALES.includes(s) && s !== DEFAULT ? s : DEFAULT; };
const neutral = (url) => { const g = langOf(url); return g === DEFAULT ? url : url.slice(3) || '/'; };
const localize = (g, path) => (g === DEFAULT ? path : `/${g}${path === '/' ? '' : path}`);
const errors = [];
const warns = [];
const err = (p, m) => errors.push(`${p}: ${m}`);
const warn = (p, m) => warns.push(`${p}: ${m}`);

async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else out.push(p);
  }
  return out;
}
const exists = (p) => stat(p).then(() => true, () => false);

const files = await walk(DIST);
const htmlFiles = files.filter((f) => f.endsWith('.html'));
const urlOf = (f) => {
  let u = '/' + relative(DIST, f).replace(/\\/g, '/').replace(/\.html$/, '');
  return u === '/index' ? '/' : u;
};
const pages = new Map();
const titles = new Map();
const descs = new Map();

for (const f of htmlFiles) {
  const url = urlOf(f);
  const root = parse(await readFile(f, 'utf8'));
  pages.set(url, root);
}

// Sitemap
const sitemap = await readFile(join(DIST, 'sitemap.xml'), 'utf8');
const sitemapLocs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const origin = new URL(sitemapLocs[0]).origin;

for (const [url, root] of pages) {
  const robots = root.querySelector('meta[name="robots"]')?.getAttribute('content') ?? '';
  const noindex = /noindex/.test(robots);
  const title = root.querySelector('title')?.text.trim() ?? '';
  const desc = root.querySelector('meta[name="description"]')?.getAttribute('content') ?? '';
  const canonical = root.querySelector('link[rel="canonical"]')?.getAttribute('href');
  const h1s = root.querySelectorAll('h1');

  if (h1s.length !== 1) err(url, `expected exactly one <h1>, found ${h1s.length}`);
  const htmlLang = root.querySelector('html')?.getAttribute('lang');
  if (!htmlLang) err(url, 'missing <html lang>');
  else if (htmlLang !== langOf(url)) err(url, `<html lang="${htmlLang}"> but the URL is the ${langOf(url)} version`);
  if (!root.querySelector('meta[name="viewport"]')) err(url, 'missing viewport meta');
  if (!root.querySelector('main')) err(url, 'missing <main> landmark');

  // Images
  for (const img of root.querySelectorAll('img')) {
    if (img.getAttribute('alt') === undefined) err(url, `<img> without alt: ${img.getAttribute('src')}`);
    if (!img.getAttribute('width') && !img.getAttribute('style')?.includes('aspect-ratio')) warn(url, `<img> without dimensions (CLS risk): ${img.getAttribute('src')}`);
  }

  // JSON-LD
  const ld = root.querySelectorAll('script[type="application/ld+json"]');
  if (!ld.length) err(url, 'no JSON-LD');
  const idsSeen = new Set();
  for (const s of ld) {
    try {
      const j = JSON.parse(s.text);
      for (const n of j['@graph'] ?? [j]) {
        if (n['@id']) { if (idsSeen.has(n['@id'])) err(url, `duplicate JSON-LD @id ${n['@id']}`); idsSeen.add(n['@id']); }
      }
    } catch (e) { err(url, `invalid JSON-LD: ${e.message}`); }
  }

  if (noindex) continue; // private/utility pages: skip content checks
  if (!title) err(url, 'missing <title>');
  else {
    if (title.length > 65) warn(url, `title is ${title.length} chars (may truncate): ${title}`);
    if (titles.has(title)) err(url, `duplicate title with ${titles.get(title)}`);
    titles.set(title, url);
  }
  if (desc.length < 70 || desc.length > 175) warn(url, `meta description is ${desc.length} chars`);
  if (descs.has(desc)) err(url, `duplicate meta description with ${descs.get(desc)}`);
  descs.set(desc, url);
  const expected = origin + (url === '/' ? '/' : url);
  if (canonical !== expected) err(url, `canonical ${canonical} !== ${expected}`);
  for (const p of ['og:title', 'og:description', 'og:image', 'og:url', 'twitter:card']) {
    if (!root.querySelector(`meta[property="${p}"], meta[name="${p}"]`)) err(url, `missing ${p}`);
  }
  const mainEl = root.querySelector('main');
  mainEl?.querySelectorAll('script,style').forEach((e) => e.remove());
  const text = mainEl?.text ?? '';
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  if (wordCount < 150) warn(url, `thin content: ${wordCount} words`);
  if (/\[\p{L}[^\]]{6,}\]/u.test(text) && !/<script/.test(text)) err(url, `bracketed placeholder text in indexable page: ${text.match(/\[[^\]]{6,}\]/)?.[0]}`);

  // hreflang: every language version (plus x-default) is listed, exists, and lists this page back.
  const alts = new Map(root.querySelectorAll('link[rel="alternate"][hreflang]').map((x) => [x.getAttribute('hreflang'), x.getAttribute('href')]));
  for (const g of [...LOCALES, 'x-default']) {
    const want = origin + localize(g === 'x-default' ? DEFAULT : g, neutral(url));
    if (alts.get(g) !== want) err(url, `hreflang ${g} is ${alts.get(g)}, expected ${want}`);
  }
  // A translated page whose main text is identical to the English page has not been translated.
  if (langOf(url) !== DEFAULT) {
    const en = pages.get(neutral(url));
    if (!en) err(url, 'no English counterpart');
    else {
      const enMain = en.querySelector('main')?.clone();
      enMain?.querySelectorAll('script,style').forEach((e) => e.remove());
      if ((enMain?.text ?? '').replace(/\s+/g, ' ').trim() === text.replace(/\s+/g, ' ').trim()) err(url, 'main content is identical to the English page (untranslated)');
    }
  }
  if (!sitemapLocs.includes(expected)) err(url, 'indexable page missing from sitemap.xml');
}

// Sitemap entries exist and are indexable
for (const loc of sitemapLocs) {
  const u = new URL(loc);
  const key = u.pathname === '' ? '/' : u.pathname;
  const root = pages.get(key);
  if (!root) { err(loc, 'in sitemap but no built page'); continue; }
  if (/noindex/.test(root.querySelector('meta[name="robots"]')?.getAttribute('content') ?? '')) err(loc, 'noindex page listed in sitemap');
}

// Internal links and assets
for (const [url, root] of pages) {
  for (const a of root.querySelectorAll('a[href]')) {
    const href = a.getAttribute('href');
    if (!href.startsWith('/') || href.startsWith('//')) continue;
    const [path, hash] = href.split('#');
    const clean = path.split('?')[0].replace(/\/$/, '') || '/';
    const target = pages.get(clean);
    const isFile = await exists(join(DIST, clean));
    if (!target && !isFile && !(await exists(join(DIST, clean + '.html')))) err(url, `broken link ${href}`);
    if (hash && target && !target.querySelector(`[id="${hash}"]`)) err(url, `broken anchor ${href}`);
    if (!a.text.trim() && !a.getAttribute('aria-label') && !a.querySelector('img,svg[aria-label]')) warn(url, `link with no accessible text: ${href}`);
  }
}

// Every language has every page (including private and utility ones).
for (const url of pages.keys()) {
  if (langOf(url) !== DEFAULT) continue;
  for (const g of LOCALES) if (!pages.has(localize(g, url))) err(url, `missing ${g} version ${localize(g, url)}`);
}

// Source translations: every content entry exists in every language, and no dictionary still falls back to English.
for (const c of ['destinations', 'guides', 'journeys']) {
  const base = (await readdir(join(ROOT, 'src/content', c, DEFAULT))).filter((f) => f.endsWith('.md'));
  for (const g of LOCALES) for (const f of base) if (!(await exists(join(ROOT, 'src/content', c, g, f)))) err(`src/content/${c}/${g}/${f}`, 'translation missing');
}
for (const g of LOCALES.filter((x) => x !== DEFAULT)) {
  const idx = await readFile(join(ROOT, 'src/i18n', g, 'index.ts'), 'utf8').catch(() => '');
  if (!idx) err(`src/i18n/${g}/index.ts`, 'dictionary missing');
  else if (/TEMPORARY|TODO\(i18n\)|from '\.\.\/en/.test(idx)) err(`src/i18n/${g}/index.ts`, 'dictionary still falls back to English');
}

// Machine-readable files
for (const f of ['robots.txt', 'llms.txt', 'llms-full.txt', 'sitemap.xml', 'site.webmanifest', '_headers', ...LOCALES.map((g) => localize(g, '/rss.xml').slice(1))]) {
  if (!(await exists(join(DIST, f)))) err(f, 'missing from build output');
}
const robotsTxt = await readFile(join(DIST, 'robots.txt'), 'utf8');
if (!robotsTxt.includes(`Sitemap: ${origin}/sitemap.xml`)) err('robots.txt', 'sitemap line missing');

console.log(`Checked ${pages.size} pages, ${sitemapLocs.length} sitemap URLs.`);
for (const w of warns) console.log(`  warn  ${w}`);
for (const e of errors) console.log(`  FAIL  ${e}`);
console.log(errors.length ? `\n${errors.length} problem(s).` : '\nAll SEO checks passed.');
process.exit(errors.length ? 1 : 0);
