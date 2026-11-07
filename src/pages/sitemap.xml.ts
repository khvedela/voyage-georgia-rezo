import type { APIRoute } from 'astro';
import { getImage } from 'astro:assets';
import { corePageList } from '../data/pages';
import { photos, photoText, type PhotoId } from '../data/photos';
import { absoluteUrl, site } from '../config/site';
import { alternates, defaultLocale, l, localeMeta, locales, useT } from '../i18n';
import { getLocalized } from '../i18n/content';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const day = (d: Date | string) => new Date(d).toISOString().slice(0, 10);

interface Entry { path: string; lastmod: string; changefreq: string; priority: number; photo?: PhotoId }

/** One <url> per page per language, each listing every language version (hreflang) plus x-default (English). */
export const GET: APIRoute = async () => {
  const [dest, guides, journeys] = await Promise.all([getLocalized('destinations', 'en'), getLocalized('guides', 'en'), getLocalized('journeys', 'en')]);
  const entries: Entry[] = [
    ...corePageList.map((p) => ({ path: p.path, lastmod: p.updated, changefreq: p.changefreq, priority: p.priority })),
    ...dest.map((d) => ({ path: `/destinations/${d.slug}`, lastmod: day(d.data.updated), changefreq: 'monthly', priority: 0.8, photo: d.data.photo })),
    ...journeys.map((j) => ({ path: `/journeys/${j.slug}`, lastmod: day(j.data.updated), changefreq: 'monthly', priority: 0.8, photo: j.data.photo })),
    ...guides.map((g) => ({ path: `/guides/${g.slug}`, lastmod: day(g.data.updated), changefreq: 'monthly', priority: 0.7, photo: g.data.photo })),
  ];

  const imageUrl = new Map<PhotoId, string>();
  for (const id of Object.keys(photos) as PhotoId[]) {
    const opt = await getImage({ src: photos[id].src, width: 1200, format: 'webp' });
    imageUrl.set(id, opt.src.startsWith('http') ? opt.src : `${site.url}${opt.src}`);
  }

  const body: string[] = [];
  for (const e of entries) {
    const alts =
      alternates(e.path).map((a) => `<xhtml:link rel="alternate" hreflang="${localeMeta[a.lang].tag}" href="${esc(absoluteUrl(a.href))}"/>`).join('') +
      `<xhtml:link rel="alternate" hreflang="x-default" href="${esc(absoluteUrl(l(defaultLocale, e.path)))}"/>`;
    for (const lang of locales) {
      const loc = esc(absoluteUrl(l(lang, e.path)));
      let img = '';
      if (e.photo) {
        const p = photos[e.photo];
        img = `<image:image><image:loc>${esc(imageUrl.get(e.photo)!)}</image:loc><image:caption>${esc(photoText(useT(lang), e.photo).alt)}</image:caption><image:license>${esc(p.licenceUrl)}</image:license></image:image>`;
      }
      body.push(`<url><loc>${loc}</loc><lastmod>${e.lastmod}</lastmod><changefreq>${e.changefreq}</changefreq><priority>${e.priority.toFixed(1)}</priority>${alts}${img}</url>`);
    }
  }

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n` +
    body.join('\n') + `\n</urlset>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
