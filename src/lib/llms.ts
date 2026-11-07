/**
 * llms.txt / llms-full.txt are written for language models, in English (the site's default language); a
 * "Languages" section points to the Russian, Georgian and Latvian versions of the site.
 */
import { corePages as corePagesFor } from '../data/pages';
import { faqText } from '../data/faqs';
import { vehicles as vehiclesFor } from '../data/vehicles';
import { absoluteUrl, site } from '../config/site';
import { l, localeMeta, locales, useT } from '../i18n';
import { getLocalized } from '../i18n/content';

const t = useT('en');
const corePages = corePagesFor(t);
const faqs = faqText(t);
const vehicles = vehiclesFor(t);

export async function loadSite() {
  const [dest, guides, journeys] = await Promise.all([getLocalized('destinations', 'en'), getLocalized('guides', 'en'), getLocalized('journeys', 'en')]);
  return { dest, guides, journeys };
}

const facts = [
  'Voyage Georgia Rezo is a private tour agency for Georgia, the country in the Caucasus (not the US state).',
  'It is owned and personally run by Rezo, who has worked in Georgian tourism for more than twenty years and is an experienced private tour guide.',
  'Every trip is designed individually: there are no fixed packages and no prices are published. Rezo calculates a quotation himself from route, dates, group size, vehicle and experiences.',
  'The agency works as a service-area business with no walk-in office: trips are planned remotely and delivered in person.',
  'Fleet: Mercedes Sprinter (long), Mercedes Sprinter (short, wheelchair-accessible), Mercedes Sprinter (short, 4×4), and two Mitsubishi Delicas.',
  'Sending a trip request is free and is not a booking; nothing is charged until Rezo and the traveller agree on a plan.',
  'Contact: start a request at ' + absoluteUrl('/design-my-trip') + ' or message Rezo via ' + absoluteUrl('/contact') + '.',
];

export async function llmsTxt(): Promise<string> {
  const { dest, guides, journeys } = await loadSite();
  const link = (title: string, path: string, desc: string) => `- [${title}](${absoluteUrl(path)}): ${desc}`;
  const core = (p: string) => corePages.find((c) => c.path === p)!;
  return [
    `# ${site.name}`,
    '',
    `> ${t.common.site.description} ${t.common.site.tagline}`,
    '',
    ...facts.map((f) => `- ${f}`),
    '',
    '## Plan a trip',
    link('Design my trip', '/design-my-trip', core('/design-my-trip').description),
    link('Example journeys', '/journeys', core('/journeys').description),
    ...journeys.map((j) => link(`${j.data.title} (${j.data.meta})`, `/journeys/${j.slug}`, j.data.summary)),
    '',
    '## Destinations',
    link('All destinations and distances', '/destinations', core('/destinations').description),
    ...dest.map((d) => link(d.data.name, `/destinations/${d.slug}`, d.data.summary)),
    '',
    '## Guides',
    ...guides.map((g) => link(g.data.title, `/guides/${g.slug}`, g.data.summary)),
    '',
    '## About and services',
    link('Meet Rezo', '/rezo', core('/rezo').description),
    link('Vehicles', '/vehicles', core('/vehicles').description),
    link('Accessible travel', '/accessible-travel', core('/accessible-travel').description),
    link('4×4 adventure', '/adventure-4x4', core('/adventure-4x4').description),
    link('FAQ', '/faq', core('/faq').description),
    link('Contact', '/contact', core('/contact').description),
    '',
    '## Languages',
    'Every page exists in each language at the same path behind a language prefix (English has none).',
    ...locales.map((x) => `- [${localeMeta[x].label} (${localeMeta[x].tag})](${absoluteUrl(l(x, '/'))})`),
    '',
    '## Optional',
    `- [Full text of this site for language models](${absoluteUrl('/llms-full.txt')})`,
    `- [Sitemap](${absoluteUrl('/sitemap.xml')})`,
    '',
  ].join('\n');
}

export async function llmsFullTxt(): Promise<string> {
  const { dest, guides, journeys } = await loadSite();
  const parts: string[] = [`# ${site.name}: full site text`, '', `> ${t.common.site.description}`, '', ...facts.map((f) => `- ${f}`), ''];
  const section = (title: string, url: string, summary: string, body?: string, extraFaqs: { q: string; a: string }[] = []) => {
    parts.push('---', '', `## ${title}`, '', `URL: ${url}`, '', summary, '');
    if (body) parts.push(body.trim(), '');
    if (extraFaqs.length) {
      parts.push('### Questions', '');
      for (const f of extraFaqs) parts.push(`**${f.q}**`, f.a, '');
    }
  };
  for (const j of journeys) {
    const stops = j.data.stops.map((s) => `- ${s.name} (${s.nights}): ${s.note}`).join('\n');
    section(`${j.data.title}: ${j.data.meta}`, absoluteUrl(`/journeys/${j.slug}`), j.data.summary, `Best months: ${j.data.bestMonths}\n\nWhere the nights go:\n${stops}\n\n${j.body ?? ''}`, j.data.faqs);
  }
  for (const d of dest) {
    const f = d.data.facts.map((x) => `- ${x.label}: ${x.value}${x.note ? ` (${x.note})` : ''}`).join('\n');
    section(d.data.title, absoluteUrl(`/destinations/${d.slug}`), d.data.summary, `${f}\n\n${d.body ?? ''}`, d.data.faqs);
  }
  for (const g of guides) section(g.data.title, absoluteUrl(`/guides/${g.slug}`), g.data.summary, g.body, g.data.faqs);
  section('Vehicles', absoluteUrl('/vehicles'), corePages.find((c) => c.path === '/vehicles')!.description, vehicles.map((v) => `- ${v.name}${v.count ? ` × ${v.count}` : ''}: ${v.text}`).join('\n'));
  section('Frequently asked questions', absoluteUrl('/faq'), corePages.find((c) => c.path === '/faq')!.description, undefined, faqs);
  return parts.join('\n');
}
