import type { APIRoute, GetStaticPaths } from 'astro';
import { corePages } from '../../../data/pages';
import { renderOg } from '../../../lib/og';
import { defaultLocale, fmt, locales, useT } from '../../../i18n';
import { getLocalized } from '../../../i18n/content';

/** Open Graph images per language: /og/<slug>.png for English, /og/<lang>/<slug>.png for the others. */
export const getStaticPaths: GetStaticPaths = async () => {
  const out = [];
  for (const lang of locales) {
    const t = useT(lang);
    const [dest, guides, journeys] = await Promise.all([getLocalized('destinations', lang), getLocalized('guides', lang), getLocalized('journeys', lang)]);
    const entries = [
      ...corePages(t).map((p) => ({
        slug: p.slug,
        eyebrow: p.slug === 'home' ? t.schema.og.homeEyebrow : p.nav,
        title: p.slug === 'home' ? t.common.site.tagline : p.title.split(/[:|]/)[0].trim(),
      })),
      ...dest.map((d) => ({ slug: `destinations-${d.slug}`, eyebrow: d.data.eyebrow, title: d.data.title.split(':')[0] })),
      ...guides.map((g) => ({ slug: `guides-${g.slug}`, eyebrow: t.pages.guide.ogEyebrow, title: g.data.title })),
      ...journeys.map((j) => ({ slug: `journeys-${j.slug}`, eyebrow: fmt(t.pages.journey.ogEyebrow, { meta: j.data.meta }), title: j.data.title })),
    ];
    for (const e of entries) out.push({ params: { lang: lang === defaultLocale ? undefined : lang, slug: e.slug }, props: { ...e, footer: t.common.site.privateTours } });
  }
  return out;
};

export const GET: APIRoute = async ({ props }) => {
  const png = await renderOg({ eyebrow: props.eyebrow, title: props.title, footer: props.footer });
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=31536000, immutable' } });
};
