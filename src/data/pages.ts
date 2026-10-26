/**
 * The indexable top-level pages: one registry feeds the sitemap, llms.txt and Open Graph images,
 * so a page cannot exist in one and be missing from another.
 */
export interface CorePage {
  path: string;
  slug: string; // Open Graph image slug
  nav: string; // short label for link lists
  title: string;
  description: string;
  priority: number;
  changefreq: 'weekly' | 'monthly' | 'yearly';
  updated: string; // ISO date, bump when the content materially changes
}

export const corePages: CorePage[] = [
  {
    path: '/', slug: 'home', nav: 'Home',
    title: 'Private Georgia Tours, Designed by Rezo',
    description: 'Custom private tours of Georgia (the country) planned personally by Rezo, 20+ years in Georgian tourism. Tell him what you imagine; he designs the route, days and price.',
    priority: 1, changefreq: 'weekly', updated: '2026-10-26',
  },
  {
    path: '/design-my-trip', slug: 'design-my-trip', nav: 'Design my trip',
    title: 'Design My Trip to Georgia: Free, About 3 Minutes',
    description: 'Answer a few easy questions or just write a sentence. Rezo reads every request himself and plans a private Georgia itinerary around you. Free, not a booking.',
    priority: 0.9, changefreq: 'monthly', updated: '2026-10-26',
  },
  {
    path: '/journeys', slug: 'journeys', nav: 'Example journeys',
    title: 'Example Georgia Itineraries: 6, 8 and 10 Days',
    description: 'Three starting points for a private trip to Georgia: mountains, wine and sea; wine valleys to high villages; a first taste. Never fixed packages. Rezo sets route and price.',
    priority: 0.9, changefreq: 'monthly', updated: '2026-10-26',
  },
  {
    path: '/destinations', slug: 'destinations', nav: 'Destinations',
    title: 'Where to Go in Georgia: Regions and Road Notes',
    description: 'Tbilisi, Kazbegi, Kakheti, Tusheti, Kutaisi, Svaneti and Batumi: what each region is like, how far apart they are, when the roads are open and how Rezo links them.',
    priority: 0.9, changefreq: 'monthly', updated: '2026-10-26',
  },
  {
    path: '/guides', slug: 'guides', nav: 'Guides',
    title: 'Georgia Travel Guides: Seasons, Wine and Mountain Roads',
    description: 'Practical, plain-spoken guides for planning Georgia: the best time to go month by month, how Kakheti wine works and how the high mountain roads behave.',
    priority: 0.8, changefreq: 'monthly', updated: '2026-10-26',
  },
  {
    path: '/rezo', slug: 'rezo', nav: 'Meet Rezo',
    title: 'Meet Rezo: Your Georgia Tour Planner and Guide',
    description: 'Rezo owns and personally runs Voyage Georgia Rezo. Twenty years in Georgian tourism, an experienced private guide, and the person you actually message.',
    priority: 0.8, changefreq: 'monthly', updated: '2026-10-26',
  },
  {
    path: '/vehicles', slug: 'vehicles', nav: 'Vehicles',
    title: 'Our Vehicles: Sprinters, 4×4 and Wheelchair-Accessible',
    description: 'Five private vehicles for Georgia: a long and a short Mercedes Sprinter, a wheelchair-accessible Sprinter, a 4×4 Sprinter and two Mitsubishi Delicas.',
    priority: 0.7, changefreq: 'monthly', updated: '2026-10-26',
  },
  {
    path: '/accessible-travel', slug: 'accessible-travel', nav: 'Accessible travel',
    title: 'Wheelchair-Accessible Tours in Georgia',
    description: 'A wheelchair-accessible Sprinter and honest planning: Rezo talks through your needs, checks every stop before it enters your itinerary and tells you what is not possible.',
    priority: 0.8, changefreq: 'monthly', updated: '2026-10-26',
  },
  {
    path: '/adventure-4x4', slug: 'adventure-4x4', nav: '4×4 adventure',
    title: '4×4 Tours in Georgia: Tusheti, Svaneti and Kazbegi',
    description: 'A short 4×4 Sprinter and Rezo’s back-road knowledge open Georgia’s mountain valleys, high passes and remote villages. Road and weather decide every plan.',
    priority: 0.8, changefreq: 'monthly', updated: '2026-10-26',
  },
  {
    path: '/faq', slug: 'faq', nav: 'FAQ',
    title: 'Georgia Private Tour FAQ: Pricing, Changes, Access',
    description: 'How Rezo prices a trip, whether you can change the plan, wheelchair access, vehicles and what happens after you send a request. Straight answers.',
    priority: 0.8, changefreq: 'monthly', updated: '2026-10-26',
  },
  {
    path: '/contact', slug: 'contact', nav: 'Contact',
    title: 'Contact Rezo: Message, Email or Start a Trip',
    description: 'Start with a sentence or message Rezo directly. A real person reads every request. Nothing to pay and nothing booked until you both agree.',
    priority: 0.7, changefreq: 'yearly', updated: '2026-10-26',
  },
];

export const pageByPath = (p: string) => {
  const hit = corePages.find((c) => c.path === p);
  if (!hit) throw new Error(`Unknown core page: ${p}`);
  return hit;
};
