/**
 * The indexable top-level pages: one registry feeds the sitemap, llms.txt and Open Graph images,
 * so a page cannot exist in one and be missing from another. Structure here; nav label, title and
 * description per language in src/i18n/<lang>/pages.ts (`meta`, keyed by slug).
 */
import type { Dict } from '../i18n/dictionaries';

export type PageSlug = keyof Dict['pages']['meta'];

export interface CorePageBase {
  /** Language-neutral path. */
  path: string;
  slug: PageSlug; // Open Graph image slug and key into pages.meta
  priority: number;
  changefreq: 'weekly' | 'monthly' | 'yearly';
  updated: string; // ISO date, bump when the content materially changes
}
export interface CorePage extends CorePageBase { nav: string; title: string; description: string }

export const corePageList: CorePageBase[] = [
  { path: '/', slug: 'home', priority: 1, changefreq: 'weekly', updated: '2026-10-26' },
  { path: '/design-my-trip', slug: 'design-my-trip', priority: 0.9, changefreq: 'monthly', updated: '2026-10-26' },
  { path: '/journeys', slug: 'journeys', priority: 0.9, changefreq: 'monthly', updated: '2026-10-26' },
  { path: '/destinations', slug: 'destinations', priority: 0.9, changefreq: 'monthly', updated: '2026-10-26' },
  { path: '/guides', slug: 'guides', priority: 0.8, changefreq: 'monthly', updated: '2026-10-26' },
  { path: '/rezo', slug: 'rezo', priority: 0.8, changefreq: 'monthly', updated: '2026-10-26' },
  { path: '/vehicles', slug: 'vehicles', priority: 0.7, changefreq: 'monthly', updated: '2026-10-26' },
  { path: '/accessible-travel', slug: 'accessible-travel', priority: 0.8, changefreq: 'monthly', updated: '2026-10-26' },
  { path: '/adventure-4x4', slug: 'adventure-4x4', priority: 0.8, changefreq: 'monthly', updated: '2026-10-26' },
  { path: '/faq', slug: 'faq', priority: 0.8, changefreq: 'monthly', updated: '2026-10-26' },
  { path: '/contact', slug: 'contact', priority: 0.7, changefreq: 'yearly', updated: '2026-10-26' },
];

/** Every core page with its words in the given language. */
export const corePages = (t: Dict): CorePage[] => corePageList.map((p) => ({ ...p, ...t.pages.meta[p.slug] }));

export const pageByPath = (t: Dict, p: string): CorePage => {
  const hit = corePages(t).find((c) => c.path === p);
  if (!hit) throw new Error(`Unknown core page: ${p}`);
  return hit;
};
