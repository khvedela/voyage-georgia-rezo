/**
 * Single source of truth for who the business is and how it can be reached.
 * Anything left empty is omitted from the page AND from structured data, so the
 * site never publishes a claim that has not been supplied by Rezo.
 */
const env = import.meta.env;

const clean = (v: string | undefined) => (v && v.trim() ? v.trim() : undefined);
const digits = (v: string | undefined) => clean(v)?.replace(/[^\d]/g, '');

export const site = {
  name: 'Voyage Georgia Rezo',
  shortName: 'Voyage Georgia',
  // `site` in astro.config.mjs, without trailing slash.
  url: String(env.SITE ?? 'https://voyagegeorgiarezo.com').replace(/\/$/, ''),
  locale: 'en',
  tagline: 'Your Georgia, designed by Rezo.',
  titleTagline: 'Your Georgia. Personally designed by Rezo.',
  description:
    'Private tours of Georgia planned by Rezo, a guide with more than twenty years in Georgian tourism. Tell him what you imagine and he designs the route, the days and the price himself.',
  themeColor: '#D62839',
  founder: {
    name: 'Rezo',
    jobTitle: 'Private tour guide and founder',
    experienceYears: 20,
  },
  contact: {
    whatsapp: digits(env.PUBLIC_WHATSAPP),
    email: clean(env.PUBLIC_EMAIL),
    messenger: clean(env.PUBLIC_MESSENGER_URL),
    facebook: clean(env.PUBLIC_FACEBOOK_URL),
    instagram: clean(env.PUBLIC_INSTAGRAM_URL),
    googleBusiness: clean(env.PUBLIC_GOOGLE_BUSINESS_URL),
  },
  inquiryEndpoint: clean(env.PUBLIC_INQUIRY_ENDPOINT),
  /** Bracketed placeholders are shown while developing, and in production only when asked. */
  showPlaceholders: Boolean(env.DEV) || env.PUBLIC_SHOW_PLACEHOLDERS === 'true',
  /**
   * AI / answer-engine crawlers. true = welcome (recommended for discovery);
   * flip to false to disallow training and retrieval bots in robots.txt.
   */
  allowAiCrawlers: true,
} as const;

export const sameAs = [
  site.contact.facebook,
  site.contact.instagram,
  site.contact.googleBusiness,
].filter((u): u is string => Boolean(u));

export const whatsappLink = (text?: string) =>
  site.contact.whatsapp
    ? `https://wa.me/${site.contact.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ''}`
    : undefined;

export const mailtoLink = (subject?: string, body?: string) => {
  if (!site.contact.email) return undefined;
  const q = [subject && `subject=${encodeURIComponent(subject)}`, body && `body=${encodeURIComponent(body)}`]
    .filter(Boolean)
    .join('&');
  return `mailto:${site.contact.email}${q ? `?${q}` : ''}`;
};

export const absoluteUrl = (path = '/') => `${site.url}${path.startsWith('/') ? path : `/${path}`}`;
