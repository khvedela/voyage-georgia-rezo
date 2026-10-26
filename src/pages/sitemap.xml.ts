import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { getImage } from 'astro:assets';
import { corePages } from '../data/pages';
import { photos, type PhotoId } from '../data/photos';
import { absoluteUrl, site } from '../config/site';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const day = (d: Date | string) => new Date(d).toISOString().slice(0, 10);

interface Entry { path: string; lastmod: string; changefreq: string; priority: number; photo?: PhotoId }

export const GET: APIRoute = async () => {
  const [dest, guides, journeys] = await Promise.all([getCollection('destinations'), getCollection('guides'), getCollection('journeys')]);
  const entries: Entry[] = [
    ...corePages.map((p) => ({ path: p.path, lastmod: p.updated, changefreq: p.changefreq, priority: p.priority })),
    ...dest.map((d) => ({ path: `/destinations/${d.id}`, lastmod: day(d.data.updated), changefreq: 'monthly', priority: 0.8, photo: d.data.photo })),
    ...journeys.map((j) => ({ path: `/journeys/${j.id}`, lastmod: day(j.data.updated), changefreq: 'monthly', priority: 0.8, photo: j.data.photo })),
    ...guides.map((g) => ({ path: `/guides/${g.id}`, lastmod: day(g.data.updated), changefreq: 'monthly', priority: 0.7, photo: g.data.photo })),
  ];

  const body: string[] = [];
  for (const e of entries) {
    const loc = esc(absoluteUrl(e.path));
    let img = '';
    if (e.photo) {
      const p = photos[e.photo];
      const opt = await getImage({ src: p.src, width: 1200, format: 'webp' });
      const url = opt.src.startsWith('http') ? opt.src : `${site.url}${opt.src}`;
      img = `<image:image><image:loc>${esc(url)}</image:loc><image:caption>${esc(p.alt)}</image:caption><image:license>${esc(p.licenceUrl)}</image:license></image:image>`;
    }
    body.push(
      `<url><loc>${loc}</loc><lastmod>${e.lastmod}</lastmod><changefreq>${e.changefreq}</changefreq><priority>${e.priority.toFixed(1)}</priority>` +
        `<xhtml:link rel="alternate" hreflang="en" href="${loc}"/><xhtml:link rel="alternate" hreflang="x-default" href="${loc}"/>${img}</url>`,
    );
  }

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n` +
    body.join('\n') + `\n</urlset>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
