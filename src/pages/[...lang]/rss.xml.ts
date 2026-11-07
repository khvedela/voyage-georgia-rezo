import type { APIRoute } from 'astro';
import { absoluteUrl, site } from '../../config/site';
import { fmt, getLang, l, langPaths, localeMeta, useT } from '../../i18n';
import { getLocalized } from '../../i18n/content';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Feed of the guides, one per language (/rss.xml, /ru/rss.xml …): a cheap, standard signal that new content exists. */
export const getStaticPaths = () => langPaths();

export const GET: APIRoute = async (ctx) => {
  const lang = getLang(ctx);
  const t = useT(lang);
  const guides = (await getLocalized('guides', lang)).sort((a, b) => b.data.updated.getTime() - a.data.updated.getTime());
  const items = guides
    .map((g) => {
      const url = absoluteUrl(l(lang, `/guides/${g.slug}`));
      return `<item><title>${esc(g.data.title)}</title><link>${url}</link><guid isPermaLink="true">${url}</guid><pubDate>${g.data.published.toUTCString()}</pubDate><description>${esc(g.data.summary)}</description></item>`;
    })
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel>
<title>${esc(fmt(t.pages.guide.feedTitle, { site: site.name }))}</title>
<link>${absoluteUrl(l(lang, '/guides'))}</link>
<description>${esc(t.common.site.description)}</description>
<language>${localeMeta[lang].tag}</language>
<atom:link href="${absoluteUrl(l(lang, '/rss.xml'))}" rel="self" type="application/rss+xml"/>
${items}
</channel></rss>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
};
