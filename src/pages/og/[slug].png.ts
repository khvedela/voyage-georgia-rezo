import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { corePages } from '../../data/pages';
import { renderOg } from '../../lib/og';

export const getStaticPaths: GetStaticPaths = async () => {
  const [dest, guides, journeys] = await Promise.all([getCollection('destinations'), getCollection('guides'), getCollection('journeys')]);
  const entries = [
    ...corePages.map((p) => ({
      slug: p.slug,
      eyebrow: p.slug === 'home' ? 'Private tours of Georgia' : p.nav,
      title: p.slug === 'home' ? 'Your Georgia, designed by Rezo.' : p.title.split(/[:|]/)[0].trim(),
    })),
    ...dest.map((d) => ({ slug: `destinations-${d.id}`, eyebrow: d.data.eyebrow, title: d.data.title.split(':')[0] })),
    ...guides.map((g) => ({ slug: `guides-${g.id}`, eyebrow: 'Georgia travel guide', title: g.data.title })),
    ...journeys.map((j) => ({ slug: `journeys-${j.id}`, eyebrow: `Example journey · ${j.data.meta}`, title: j.data.title })),
  ];
  return entries.map((e) => ({ params: { slug: e.slug }, props: e }));
};

export const GET: APIRoute = async ({ props }) => {
  const png = await renderOg({ eyebrow: props.eyebrow, title: props.title });
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=31536000, immutable' } });
};
