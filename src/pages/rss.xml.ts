import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { absoluteUrl, site } from '../config/site';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Feed of the guides: a cheap, standard signal that new content exists (feed readers, aggregators, some AI crawlers). */
export const GET: APIRoute = async () => {
  const guides = (await getCollection('guides')).sort((a, b) => b.data.updated.getTime() - a.data.updated.getTime());
  const items = guides
    .map((g) => {
      const url = absoluteUrl(`/guides/${g.id}`);
      return `<item><title>${esc(g.data.title)}</title><link>${url}</link><guid isPermaLink="true">${url}</guid><pubDate>${g.data.published.toUTCString()}</pubDate><description>${esc(g.data.summary)}</description></item>`;
    })
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel>
<title>${esc(site.name)} — Georgia travel guides</title>
<link>${absoluteUrl('/guides')}</link>
<description>${esc(site.description)}</description>
<language>en</language>
<atom:link href="${absoluteUrl('/rss.xml')}" rel="self" type="application/rss+xml"/>
${items}
</channel></rss>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
};
