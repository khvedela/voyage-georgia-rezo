/**
 * Site-wide copy: chrome (header, footer, CTAs), shared components, formats and place names.
 * Strings may contain {placeholders}; keys ending in `Html` are trusted HTML rendered with set:html
 * (internal links inside them are localized automatically by localizeHtml).
 */
import type { Plural } from '../index';

const p = (forms: Plural) => forms;

export default {
  site: {
    tagline: 'Your Georgia, designed by Rezo.',
    titleTagline: 'Your Georgia. Personally designed by Rezo.',
    description:
      'Private tours of Georgia planned by Rezo, a guide with more than twenty years in Georgian tourism. Tell him what you imagine and he designs the route, the days and the price himself.',
    founderJobTitle: 'Private tour guide and founder',
    /** Footer line under the OG image and in feeds. */
    privateTours: 'Private tours of Georgia, designed by Rezo',
  },

  a11y: {
    skip: 'Skip to content',
    homeLink: 'Voyage Georgia Rezo, home',
    mainNav: 'Main',
    breadcrumb: 'Breadcrumb',
    feedTitle: 'Georgia travel guides',
    llmsTitle: 'LLM-readable site summary',
  },

  lang: {
    label: 'Language',
    /** Shown on the switcher's button for screen readers: "Language: English". */
    current: 'Language: {name}',
  },

  nav: {
    destinations: 'Destinations',
    journeys: 'Journeys',
    vehicles: 'Vehicles',
    guides: 'Guides',
    rezo: 'Meet Rezo',
    faq: 'Questions',
    designTrip: 'Design my trip',
    /** The header button on phones, where the full label does not fit beside the brand. */
    designTripShort: 'Design my trip',
    home: 'Home',
  },

  footer: {
    about:
      'A family-owned private tour agency in Georgia. Planned remotely, delivered in person: there is no walk-in office, just Rezo and a message away.',
    plan: 'Plan',
    planLabel: 'Plan your trip',
    learn: 'Learn',
    talk: 'Talk to Rezo',
    designTrip: 'Design my trip',
    journeys: 'Example journeys',
    destinations: 'Destinations',
    vehicles: 'Vehicles',
    guides: 'Travel guides',
    accessible: 'Accessible travel',
    adventure: '4×4 adventure',
    faq: 'Questions',
    aboutRezo: 'About Rezo',
    contact: 'Contact',
    registrationTodo: 'Business registration details — to add',
    credits:
      'Maps: borders from Natural Earth; elevation from SRTM (NASA), GMTED2010 (USGS) and ETOPO1 (NOAA), all public domain. Photo credits sit beside each photograph. Photo areas marked as slots are placeholders for Rezo’s own pictures.',
  },

  cta: {
    title: 'Tell Rezo what you imagine.',
    text: 'Free, about three minutes, and nothing is booked. He reads every request himself and plans the real trip with you.',
    label: 'Start planning',
    designTrip: 'Design my trip',
    message: 'Message Rezo',
  },

  contactCta: {
    title: 'Start with a sentence.',
    text: 'Tell Rezo what you imagine. He’ll take it from there.',
    label: 'Describe your ideal trip',
    placeholder: 'We have ten days in September. We’d love mountains, wine, old churches and a little sea — without exhausting travel days.',
    submit: 'Continue',
    then: 'Then a few quick, visual questions.',
    preferTalk: 'Prefer to talk?',
  },

  channels: {
    whatsapp: 'WhatsApp',
    messenger: 'Messenger',
    email: 'Email {address}',
    /** Subject line of the pre-filled email. */
    mailSubject: 'Trip to Georgia',
  },

  intro: {
    by: 'By {name}',
    updated: 'Last updated {date}',
  },

  cards: {
    addToTrip: 'Add to my trip',
    readJourney: 'Read this journey',
    readGuide: 'Read the guide',
    minRead: '{n} min read',
    vehiclePhoto: 'Photo of this vehicle',
    toVerify: 'to be verified',
  },

  meetRezo: {
    photo: 'Portrait photo of Rezo goes here, ideally on the road, in daylight.',
    title: 'The person who plans your journey is the person you message.',
    text: 'Rezo owns and personally runs Voyage Georgia Rezo. He has worked in Georgian tourism for more than twenty years and is an experienced private tour guide. Drivers he works with help deliver your tours and transfers.',
    wordsTodo: 'Rezo’s own words about why he does this — to be written with him.',
    years: '20+ years',
    yearsNote: 'in Georgian tourism',
    handBuilt: 'Hand-built',
    handBuiltNote: 'routes, schedules and prices',
    licenceTodo: 'Licence',
    licenceNote: 'guide credentials — to verify',
    more: 'More about Rezo',
  },

  notFound: {
    title: 'Page not found',
    description: 'That page does not exist. Start from the homepage or design your trip.',
    heading: 'This road doesn’t go anywhere.',
    text: 'The page you were looking for isn’t here. Try one of these instead.',
    home: 'Back to home',
    destinations: 'Destinations',
    designTrip: 'Design my trip',
  },

  /** Shared units and counts. Use with plural(lang, n, …). */
  units: {
    days: p({ one: '{n} day', other: '{n} days' }),
    nights: p({ one: '{n} night', other: '{n} nights' }),
  },

  /** Place names as shown on maps and in route lines, keyed by their English name. */
  places: {
    Tbilisi: 'Tbilisi',
    Mtskheta: 'Mtskheta',
    Ananuri: 'Ananuri',
    Gudauri: 'Gudauri',
    Kazbegi: 'Kazbegi',
    Stepantsminda: 'Stepantsminda',
    'Mt Kazbek': 'Mt Kazbek',
    Kakheti: 'Kakheti',
    Telavi: 'Telavi',
    Sighnaghi: 'Sighnaghi',
    'David Gareja': 'David Gareja',
    Tusheti: 'Tusheti',
    Omalo: 'Omalo',
    Borjomi: 'Borjomi',
    Vardzia: 'Vardzia',
    Kutaisi: 'Kutaisi',
    Svaneti: 'Svaneti',
    Mestia: 'Mestia',
    Ushguli: 'Ushguli',
    Ushba: 'Ushba',
    Shkhara: 'Shkhara',
    Batumi: 'Batumi',
    Gori: 'Gori',
    'BLACK SEA': 'BLACK SEA',
  },
};
