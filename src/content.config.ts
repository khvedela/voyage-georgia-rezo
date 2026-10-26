import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const faq = z.object({ q: z.string(), a: z.string() });
const fact = z.object({ label: z.string(), value: z.string(), note: z.string().optional() });
const photo = z.enum(['tbilisi', 'kakheti', 'tusheti', 'kutaisi', 'svaneti', 'batumi']);
const map = z.enum(['kazbegi', 'kakheti', 'svaneti', 'batumi', 'kutaisi', 'tusheti', 'tbilisi', 'mountainsWineSea', 'wineToHighVillages', 'firstTaste']);

export const collections = {
  destinations: defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/destinations' }),
    schema: z.object({
      /** H1 / link text, e.g. "Kazbegi (Stepantsminda)". */
      title: z.string(),
      /** Short name for cards and breadcrumbs. */
      name: z.string(),
      eyebrow: z.string(),
      /** <title> without suffix, ~50-60 chars. */
      seoTitle: z.string(),
      /** Meta description, ~140-160 chars. */
      description: z.string(),
      /** Answer-first paragraph shown under the H1 and used for snippets and AI answers. */
      summary: z.string(),
      cardText: z.string(),
      map: map,
      photo: photo.optional(),
      lat: z.number(),
      lng: z.number(),
      order: z.number(),
      updated: z.coerce.date(),
      facts: z.array(fact),
      touristType: z.array(z.string()).default([]),
      faqs: z.array(faq).default([]),
      /** Slugs of destinations to link as "nearby". */
      nearby: z.array(z.string()).default([]),
      /** Slugs of guides worth reading next. */
      guides: z.array(z.string()).default([]),
    }),
  }),
  guides: defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/guides' }),
    schema: z.object({
      title: z.string(),
      seoTitle: z.string(),
      description: z.string(),
      summary: z.string(),
      order: z.number(),
      published: z.coerce.date(),
      updated: z.coerce.date(),
      photo: photo.optional(),
      readingMinutes: z.number(),
      keywords: z.array(z.string()).default([]),
      faqs: z.array(faq).default([]),
      destinations: z.array(z.string()).default([]),
    }),
  }),
  journeys: defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/journeys' }),
    schema: z.object({
      title: z.string(),
      seoTitle: z.string(),
      description: z.string(),
      summary: z.string(),
      /** "10 days · slow pace" */
      meta: z.string(),
      days: z.number(),
      pace: z.string(),
      order: z.number(),
      map: map,
      photo: photo,
      updated: z.coerce.date(),
      cardText: z.string(),
      /** Where the nights go. `destination` links to a destination page. */
      stops: z.array(z.object({ name: z.string(), nights: z.string(), note: z.string(), destination: z.string().optional() })),
      bestMonths: z.string(),
      faqs: z.array(faq).default([]),
      /** Pre-selects interests in the trip builder (/design-my-trip?from=<slug>). */
      builderSample: z.enum(['classic', 'wild', 'first']),
    }),
  }),
};
