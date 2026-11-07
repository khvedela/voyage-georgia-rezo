/**
 * schema.org JSON-LD builders. Every entity has a stable @id so pages reference one
 * Organization / Person / WebSite instead of redefining them (this is what knowledge graphs
 * and AI answer engines use to resolve "who is this business").
 */
import { site, sameAs, absoluteUrl } from '../config/site';
import { l, useT, localeMeta, locales, type Locale } from '../i18n';

/*
 * Language: entity @ids are language-neutral (one Organization, one Person across all languages); names,
 * descriptions and URLs follow the page's language. Callers pass language-neutral paths ('/faq') plus `lang`;
 * the builders localize them, exactly like the Base layout does.
 */

type Node = Record<string, unknown>;

export const ids = {
  org: `${site.url}/#organization`,
  site: `${site.url}/#website`,
  rezo: `${site.url}/rezo#person`,
  georgia: `${site.url}/#georgia`,
  logo: `${site.url}/#logo`,
};

const clean = <T extends Node>(n: T): T => {
  for (const k of Object.keys(n)) {
    const v = n[k];
    if (v === undefined || v === null || (Array.isArray(v) && v.length === 0)) delete n[k];
  }
  return n;
};

export const georgia = (lang: Locale): Node => ({
  '@type': 'Country',
  '@id': ids.georgia,
  name: useT(lang).schema.country,
  alternateName: 'Sakartvelo',
  sameAs: ['https://www.wikidata.org/wiki/Q230', 'https://en.wikipedia.org/wiki/Georgia_(country)'],
});

export function organization(lang: Locale): Node {
  const t = useT(lang);
  const contact = site.contact;
  const contactPoint = [
    contact.whatsapp && { '@type': 'ContactPoint', contactType: 'customer service', url: `https://wa.me/${contact.whatsapp}` },
    contact.email && { '@type': 'ContactPoint', contactType: 'customer service', email: contact.email },
  ].filter(Boolean);
  return clean({
    '@type': 'TravelAgency',
    '@id': ids.org,
    name: site.name,
    alternateName: site.shortName,
    url: url(lang, '/'),
    logo: { '@type': 'ImageObject', '@id': ids.logo, url: absoluteUrl('/icon-512.png'), width: 512, height: 512 },
    image: absoluteUrl(ogPath(lang, 'home')),
    description: t.common.site.description,
    slogan: t.common.site.tagline,
    founder: { '@id': ids.rezo },
    areaServed: { '@id': ids.georgia },
    serviceType: t.schema.serviceType,
    knowsAbout: t.schema.orgKnowsAbout,
    knowsLanguage: locales.map((x) => localeMeta[x].tag),
    contactPoint,
    sameAs,
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: t.schema.catalogName,
      itemListElement: [
        { '@type': 'Service', name: t.schema.services.custom.name, description: t.schema.services.custom.description, url: absoluteUrl(l(lang, '/design-my-trip')) },
        { '@type': 'Service', name: t.schema.services.accessible.name, url: absoluteUrl(l(lang, '/accessible-travel')) },
        { '@type': 'Service', name: t.schema.services.adventure.name, url: absoluteUrl(l(lang, '/adventure-4x4')) },
      ],
    },
  });
}

export function person(lang: Locale): Node {
  const t = useT(lang);
  return clean({
    '@type': 'Person',
    '@id': ids.rezo,
    name: site.founder.name,
    jobTitle: t.common.site.founderJobTitle,
    description: t.schema.personDescription,
    url: absoluteUrl(l(lang, '/rezo')),
    worksFor: { '@id': ids.org },
    knowsAbout: t.schema.personKnowsAbout,
    sameAs,
  });
}

export function website(lang: Locale): Node {
  const t = useT(lang);
  return {
    '@type': 'WebSite',
    '@id': ids.site,
    url: `${site.url}/`,
    name: site.name,
    description: t.common.site.description,
    inLanguage: locales.map((x) => localeMeta[x].tag),
    publisher: { '@id': ids.org },
  };
}

/** Open Graph image path for a page slug in a language: /og/home.png, /og/ru/home.png. */
export const ogPath = (lang: Locale, slug: string) => (lang === 'en' ? `/og/${slug}.png` : `/og/${lang}/${slug}.png`);

export interface Crumb { name: string; path: string }

/** Absolute URL of a language-neutral path in `lang`. */
const url = (lang: Locale, path: string) => absoluteUrl(l(lang, path));

export function breadcrumbs(lang: Locale, items: Crumb[]): Node {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((c, i) => ({
      '@type': 'ListItem', position: i + 1, name: c.name, item: url(lang, c.path),
    })),
  };
}

export interface PageOpts {
  /** Language-neutral path, e.g. '/faq'. */
  path: string;
  lang: Locale;
  name: string;
  description: string;
  type?: string | string[];
  image?: string;
  datePublished?: string;
  dateModified?: string;
  about?: Node | Node[];
  mentions?: Node[];
  crumbs?: Crumb[];
  mainEntity?: Node;
}

export function webPage(o: PageOpts): Node {
  const u = url(o.lang, o.path);
  return clean({
    '@type': o.type ?? 'WebPage',
    '@id': `${u}#webpage`,
    url: u,
    name: o.name,
    description: o.description,
    inLanguage: localeMeta[o.lang].tag,
    isPartOf: { '@id': ids.site },
    about: o.about ?? { '@id': ids.org },
    mentions: o.mentions,
    primaryImageOfPage: o.image ? { '@type': 'ImageObject', url: o.image } : undefined,
    datePublished: o.datePublished,
    dateModified: o.dateModified,
    breadcrumb: o.crumbs ? { '@id': `${u}#breadcrumb` } : undefined,
    mainEntity: o.mainEntity,
  });
}

export function breadcrumbWithId(lang: Locale, path: string, items: Crumb[]): Node {
  return { '@id': `${url(lang, path)}#breadcrumb`, ...breadcrumbs(lang, items) };
}

export interface Faq { q: string; a: string }

export function faqPage(lang: Locale, path: string, faqs: Faq[]): Node {
  return {
    '@type': 'FAQPage',
    '@id': `${url(lang, path)}#faq`,
    mainEntity: faqs.map((f) => ({
      '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

export interface Dest { lang: Locale; name: string; description: string; path: string; lat: number; lng: number; image?: string; touristType?: string[] }

export function destination(d: Dest): Node {
  return clean({
    '@type': 'TouristDestination',
    '@id': `${url(d.lang, d.path)}#destination`,
    name: d.name,
    description: d.description,
    url: url(d.lang, d.path),
    image: d.image,
    touristType: d.touristType,
    containedInPlace: { '@id': ids.georgia },
    geo: { '@type': 'GeoCoordinates', latitude: d.lat, longitude: d.lng },
  });
}

export interface Trip {
  lang: Locale; path: string; name: string; description: string; days: number; image?: string;
  stops: { name: string; description?: string; path?: string }[];
  touristType?: string[];
}

export function touristTrip(t: Trip): Node {
  return clean({
    '@type': 'TouristTrip',
    '@id': `${url(t.lang, t.path)}#trip`,
    name: t.name,
    description: t.description,
    url: url(t.lang, t.path),
    image: t.image,
    touristType: t.touristType,
    itinerary: {
      '@type': 'ItemList',
      numberOfItems: t.stops.length,
      itemListElement: t.stops.map((s, i) => ({
        '@type': 'ListItem', position: i + 1,
        item: clean({ '@type': 'TouristDestination', name: s.name, description: s.description, url: s.path ? url(t.lang, s.path) : undefined }),
      })),
    },
  });
}

export interface Article { lang: Locale; path: string; headline: string; description: string; image?: string; published: string; modified: string; keywords?: string[] }

export function article(a: Article): Node {
  return clean({
    '@type': 'Article',
    '@id': `${url(a.lang, a.path)}#article`,
    headline: a.headline,
    description: a.description,
    url: url(a.lang, a.path),
    mainEntityOfPage: { '@id': `${url(a.lang, a.path)}#webpage` },
    image: a.image,
    datePublished: a.published,
    dateModified: a.modified,
    inLanguage: localeMeta[a.lang].tag,
    keywords: a.keywords?.join(', '),
    author: { '@id': ids.org },
    publisher: { '@id': ids.org },
    about: { '@id': ids.georgia },
  });
}

export function itemList(lang: Locale, name: string, items: { name: string; path: string }[]): Node {
  return {
    '@type': 'ItemList',
    name,
    numberOfItems: items.length,
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, url: url(lang, it.path) })),
  };
}

export function imageObject(o: { url: string; alt: string; author?: string; licenceUrl?: string; creditText?: string; creditUrl?: string }): Node {
  return clean({
    '@type': 'ImageObject',
    contentUrl: o.url,
    url: o.url,
    caption: o.alt,
    creator: o.author ? { '@type': 'Person', name: o.author } : undefined,
    license: o.licenceUrl,
    creditText: o.creditText,
    acquireLicensePage: o.creditUrl,
  });
}

/** Site-wide nodes included on every page. */
export function baseGraph(lang: Locale): Node[] {
  return [organization(lang), person(lang), website(lang), georgia(lang)];
}
