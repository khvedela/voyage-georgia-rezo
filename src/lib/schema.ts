/**
 * schema.org JSON-LD builders. Every entity has a stable @id so pages reference one
 * Organization / Person / WebSite instead of redefining them (this is what knowledge graphs
 * and AI answer engines use to resolve "who is this business").
 */
import { site, sameAs, absoluteUrl } from '../config/site';

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

export const georgia: Node = {
  '@type': 'Country',
  '@id': ids.georgia,
  name: 'Georgia',
  alternateName: 'Sakartvelo',
  sameAs: ['https://www.wikidata.org/wiki/Q230', 'https://en.wikipedia.org/wiki/Georgia_(country)'],
};

export function organization(): Node {
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
    url: `${site.url}/`,
    logo: { '@type': 'ImageObject', '@id': ids.logo, url: absoluteUrl('/icon-512.png'), width: 512, height: 512 },
    image: absoluteUrl('/og/home.png'),
    description: site.description,
    slogan: site.tagline,
    founder: { '@id': ids.rezo },
    areaServed: { '@id': ids.georgia },
    serviceType: ['Private tours', 'Custom itinerary design', 'Wine tours', 'Accessible tours', '4x4 mountain tours'],
    knowsAbout: [
      'Private tours in Georgia', 'Custom Georgia itineraries', 'Kakheti wine tourism and qvevri winemaking',
      'Georgian Military Highway and Kazbegi', 'Upper Svaneti', 'Tusheti and the Abano Pass',
      'Wheelchair-accessible travel in Georgia', 'Batumi and the Black Sea coast', 'Tbilisi',
    ],
    contactPoint,
    sameAs,
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Private tours in Georgia',
      itemListElement: [
        { '@type': 'Service', name: 'Custom private tour of Georgia', description: 'A multi-day private journey with a route, daily schedule, vehicle and price designed by Rezo for each traveller.', url: absoluteUrl('/design-my-trip') },
        { '@type': 'Service', name: 'Wheelchair-accessible private tour', url: absoluteUrl('/accessible-travel') },
        { '@type': 'Service', name: '4x4 mountain tour to Tusheti, Svaneti and Kazbegi', url: absoluteUrl('/adventure-4x4') },
      ],
    },
  });
}

export function person(): Node {
  return clean({
    '@type': 'Person',
    '@id': ids.rezo,
    name: site.founder.name,
    jobTitle: site.founder.jobTitle,
    description: 'Owner of Voyage Georgia Rezo. More than twenty years in Georgian tourism and an experienced private tour guide who plans every itinerary himself.',
    url: absoluteUrl('/rezo'),
    worksFor: { '@id': ids.org },
    knowsAbout: ['Georgian tourism', 'Private tour guiding', 'Kakheti wine', 'Mountain roads in Georgia', 'Accessible travel'],
    sameAs,
  });
}

export function website(): Node {
  return {
    '@type': 'WebSite',
    '@id': ids.site,
    url: `${site.url}/`,
    name: site.name,
    description: site.description,
    inLanguage: site.locale,
    publisher: { '@id': ids.org },
  };
}

export interface Crumb { name: string; path: string }

export function breadcrumbs(items: Crumb[]): Node {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((c, i) => ({
      '@type': 'ListItem', position: i + 1, name: c.name, item: absoluteUrl(c.path),
    })),
  };
}

export interface PageOpts {
  path: string;
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
  const url = absoluteUrl(o.path);
  return clean({
    '@type': o.type ?? 'WebPage',
    '@id': `${url}#webpage`,
    url,
    name: o.name,
    description: o.description,
    inLanguage: site.locale,
    isPartOf: { '@id': ids.site },
    about: o.about ?? { '@id': ids.org },
    mentions: o.mentions,
    primaryImageOfPage: o.image ? { '@type': 'ImageObject', url: o.image } : undefined,
    datePublished: o.datePublished,
    dateModified: o.dateModified,
    breadcrumb: o.crumbs ? { '@id': `${url}#breadcrumb` } : undefined,
    mainEntity: o.mainEntity,
  });
}

export function breadcrumbWithId(path: string, items: Crumb[]): Node {
  return { '@id': `${absoluteUrl(path)}#breadcrumb`, ...breadcrumbs(items) };
}

export interface Faq { q: string; a: string }

export function faqPage(path: string, faqs: Faq[]): Node {
  return {
    '@type': 'FAQPage',
    '@id': `${absoluteUrl(path)}#faq`,
    mainEntity: faqs.map((f) => ({
      '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

export interface Dest { name: string; description: string; path: string; lat: number; lng: number; image?: string; touristType?: string[] }

export function destination(d: Dest): Node {
  return clean({
    '@type': 'TouristDestination',
    '@id': `${absoluteUrl(d.path)}#destination`,
    name: d.name,
    description: d.description,
    url: absoluteUrl(d.path),
    image: d.image,
    touristType: d.touristType,
    containedInPlace: { '@id': ids.georgia },
    geo: { '@type': 'GeoCoordinates', latitude: d.lat, longitude: d.lng },
  });
}

export interface Trip {
  path: string; name: string; description: string; days: number; image?: string;
  stops: { name: string; description?: string; path?: string }[];
  touristType?: string[];
}

export function touristTrip(t: Trip): Node {
  return clean({
    '@type': 'TouristTrip',
    '@id': `${absoluteUrl(t.path)}#trip`,
    name: t.name,
    description: t.description,
    url: absoluteUrl(t.path),
    image: t.image,
    touristType: t.touristType,
    itinerary: {
      '@type': 'ItemList',
      numberOfItems: t.stops.length,
      itemListElement: t.stops.map((s, i) => ({
        '@type': 'ListItem', position: i + 1,
        item: clean({ '@type': 'TouristDestination', name: s.name, description: s.description, url: s.path ? absoluteUrl(s.path) : undefined }),
      })),
    },
  });
}

export interface Article { path: string; headline: string; description: string; image?: string; published: string; modified: string; keywords?: string[] }

export function article(a: Article): Node {
  return clean({
    '@type': 'Article',
    '@id': `${absoluteUrl(a.path)}#article`,
    headline: a.headline,
    description: a.description,
    url: absoluteUrl(a.path),
    mainEntityOfPage: { '@id': `${absoluteUrl(a.path)}#webpage` },
    image: a.image,
    datePublished: a.published,
    dateModified: a.modified,
    inLanguage: site.locale,
    keywords: a.keywords?.join(', '),
    author: { '@id': ids.org },
    publisher: { '@id': ids.org },
    about: { '@id': ids.georgia },
  });
}

export function itemList(name: string, items: { name: string; path: string }[]): Node {
  return {
    '@type': 'ItemList',
    name,
    numberOfItems: items.length,
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, url: absoluteUrl(it.path) })),
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
export function baseGraph(): Node[] {
  return [organization(), person(), website(), georgia];
}
