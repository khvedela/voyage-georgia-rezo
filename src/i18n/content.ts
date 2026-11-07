/**
 * Localized content collections. Every entry lives at src/content/<collection>/<lang>/<slug>.md; English is the
 * source of truth for structure, so ids, coordinates, order, dates, maps, photos and cross-links always come from
 * the English file and only the words come from the translation. A missing translation falls back to English
 * (and `npm run verify` fails the build so it cannot ship that way).
 */
import { getCollection, type CollectionEntry } from 'astro:content';
import { defaultLocale, type Locale } from './config';

type Name = 'destinations' | 'guides' | 'journeys';

/** Front-matter fields that are structure, not words: always taken from the English entry. */
const STRUCTURE: Record<Name, string[]> = {
  destinations: ['map', 'photo', 'lat', 'lng', 'order', 'updated', 'nearby', 'guides'],
  guides: ['order', 'published', 'updated', 'photo', 'readingMinutes', 'destinations'],
  journeys: ['days', 'order', 'map', 'photo', 'updated', 'builderSample'],
};

export type Localized<C extends Name> = CollectionEntry<C> & {
  /** Language-neutral slug used in URLs: '/ru/destinations/<slug>'. */
  slug: string;
  /** Language the words actually came from (differs from the page language only on a missing translation). */
  contentLang: Locale;
};

const split = (id: string) => {
  const i = id.indexOf('/');
  return { lang: id.slice(0, i), slug: id.slice(i + 1) };
};

export async function getLocalized<C extends Name>(collection: C, lang: Locale): Promise<Localized<C>[]> {
  const all = (await getCollection(collection)) as CollectionEntry<C>[];
  const base = all.filter((e) => split(e.id).lang === defaultLocale);
  return base
    .map((b) => {
      const { slug } = split(b.id);
      const tr = lang === defaultLocale ? undefined : all.find((e) => e.id === `${lang}/${slug}`);
      const src = tr ?? b;
      const data = { ...src.data } as Record<string, unknown>;
      const bd = b.data as Record<string, unknown>;
      for (const k of STRUCTURE[collection]) data[k] = bd[k];
      // Journeys: which destination each stop links to is structure too.
      if (collection === 'journeys' && tr) {
        const bs = bd.stops as { destination?: string }[];
        data.stops = (data.stops as { destination?: string }[]).map((s, i) => ({ ...s, destination: bs[i]?.destination }));
      }
      return { ...src, data, slug, contentLang: tr ? lang : defaultLocale } as Localized<C>;
    })
    .sort((a, b) => (a.data as { order: number }).order - (b.data as { order: number }).order);
}

/** Slugs of every English entry, for getStaticPaths. */
export async function slugs(collection: Name): Promise<string[]> {
  return (await getCollection(collection)).map((e) => split(e.id)).filter((x) => x.lang === defaultLocale).map((x) => x.slug);
}
