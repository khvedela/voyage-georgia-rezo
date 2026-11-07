/**
 * Page copy. `meta` holds what feeds <title>, the meta description, the sitemap, llms.txt and OG images
 * (keyed by the page's slug in src/data/pages.ts). The rest is the visible copy of each page.
 * Keys ending in `Html` are trusted HTML (set:html); write internal links unprefixed, e.g. <a href="/contact">.
 */
export default {
  meta: {
    home: {
      nav: 'Home',
      title: 'Private Georgia Tours, Designed by Rezo',
      description: 'Custom private tours of Georgia (the country) planned personally by Rezo, 20+ years in Georgian tourism. Tell him what you imagine; he designs the route, days and price.',
    },
    'design-my-trip': {
      nav: 'Design my trip',
      title: 'Design My Trip to Georgia: Free, About 3 Minutes',
      description: 'Answer a few easy questions or just write a sentence. Rezo reads every request himself and plans a private Georgia itinerary around you. Free, not a booking.',
    },
    journeys: {
      nav: 'Example journeys',
      title: 'Example Georgia Itineraries: 6, 8 and 10 Days',
      description: 'Three starting points for a private trip to Georgia: mountains, wine and sea; wine valleys to high villages; a first taste. Never fixed packages. Rezo sets route and price.',
    },
    destinations: {
      nav: 'Destinations',
      title: 'Where to Go in Georgia: Regions and Road Notes',
      description: 'Tbilisi, Kazbegi, Kakheti, Tusheti, Kutaisi, Svaneti and Batumi: what each region is like, how far apart they are, when the roads are open and how Rezo links them.',
    },
    guides: {
      nav: 'Guides',
      title: 'Georgia Travel Guides: Seasons, Wine and Mountain Roads',
      description: 'Practical, plain-spoken guides for planning Georgia: the best time to go month by month, how Kakheti wine works and how the high mountain roads behave.',
    },
    rezo: {
      nav: 'Meet Rezo',
      title: 'Meet Rezo: Your Georgia Tour Planner and Guide',
      description: 'Rezo owns and personally runs Voyage Georgia Rezo. Twenty years in Georgian tourism, an experienced private guide, and the person you actually message.',
    },
    vehicles: {
      nav: 'Vehicles',
      title: 'Our Vehicles: Sprinters, 4×4 and Wheelchair-Accessible',
      description: 'Five private vehicles for Georgia: a long and a short Mercedes Sprinter, a wheelchair-accessible Sprinter, a 4×4 Sprinter and two Mitsubishi Delicas.',
    },
    'accessible-travel': {
      nav: 'Accessible travel',
      title: 'Wheelchair-Accessible Tours in Georgia',
      description: 'A wheelchair-accessible Sprinter and honest planning: Rezo talks through your needs, checks every stop before it enters your itinerary and tells you what is not possible.',
    },
    'adventure-4x4': {
      nav: '4×4 adventure',
      title: '4×4 Tours in Georgia: Tusheti, Svaneti and Kazbegi',
      description: 'A short 4×4 Sprinter and Rezo’s back-road knowledge open Georgia’s mountain valleys, high passes and remote villages. Road and weather decide every plan.',
    },
    faq: {
      nav: 'FAQ',
      title: 'Georgia Private Tour FAQ: Pricing, Changes, Access',
      description: 'How Rezo prices a trip, whether you can change the plan, wheelchair access, vehicles and what happens after you send a request. Straight answers.',
    },
    contact: {
      nav: 'Contact',
      title: 'Contact Rezo: Message, Email or Start a Trip',
      description: 'Start with a sentence or message Rezo directly. A real person reads every request. Nothing to pay and nothing booked until you both agree.',
    },
  },

  home: {
    /** The model on the homepage (src/components/home/World.astro and src/scripts/home-world.ts). */
    world: {
      label: 'Georgia on a model: pick your places, or watch a sample route',
      canvas: 'A three-dimensional model of Georgia. Regions you pick are marked with red flags and joined into a route; the play button drives a sample route across it.',
      h1: 'Your Georgia, designed by Rezo.',
      lead: 'Tap the places that call to you and plant a flag. Rezo, a private guide with twenty years on these roads, plans the days between them himself.',
      regionsLabel: 'Regions on the model',
      trayKicker: 'Your trip',
      trayEmpty: 'Nothing picked yet. Tap a region on the model.',
      trayGoOne: 'Plan it with Rezo',
      trayGoMany: 'Plan these with Rezo',
      /** The sentence carried into the builder: {places} is a list of region phrases. */
      idea: 'I’d love to see {places}.',
      /** {days} is a count of days, e.g. "4 days". */
      trayDays: 'about {days}',
      play: 'Watch a sample route',
      playMeta: 'Tbilisi to the Black Sea in half a minute',
      pause: 'Pause the route',
      resume: 'Play the route',
      exit: 'Back to the model',
      replay: 'Watch it again',
      hint: 'Drag to turn the model',
      stopOf: ', stop {i} of {n}',
      moreAbout: 'More about {name}',
      to: ' to ',
      barLabel: 'Stops on the sample route',
      outroTitle: 'That was one route. Yours will be different.',
      outroText: 'Add a week in the mountains, drop the sea, stay longer at the table. Rezo builds the route around you, schedules every day and prices it himself.',
      outroPick: 'Pick places on the model',
    },
    howTitle: 'Not a package. A conversation.',
    howText: 'Most agencies hand you a brochure itinerary. Rezo starts with a blank map and your own words, then plans the journey around you.',
    calloutHtml: '<strong>Technology helps us keep track. It never replaces Rezo.</strong> Every itinerary and every price is reviewed and approved by him before you see it, and nothing is final until he says so.',
    whereTitle: 'Where do you want to wake up?',
    whereText: 'Every region on the model is a place Rezo knows by its roads. Pick what moves you and he connects the dots.',
    alsoHtml: '<strong>Also on Rezo’s map:</strong> Mtskheta, Borjomi, Vardzia, Racha, David Gareja, Martvili Canyon, and the small roads between them.',
    allDestinations: 'All destinations',
    journeysTitle: 'Journeys Rezo might plan',
    journeysText: 'Starting points, never fixed packages. Route, length, pace and price are always set for you.',
    fleetTitle: 'Five vehicles, one for every road',
    fleetText: 'The vehicle is chosen after the route, never the other way round.',
    aboutVehicles: 'About the vehicles',
    testimonialsLabel: 'Testimonials (placeholder)',
    testimonialsTitle: 'In travellers’ words',
    testimonialsText: 'Only genuine testimonials, shown with permission. Nothing appears here until Rezo has real ones to share.',
    testimonialQuote: '[A real traveller’s quote about their journey.]',
    testimonialWho: '[Name, country, trip]: {hint}',
    testimonialHints: ['photo with permission', 'trip dates', 'link to original post'],
    faqTitle: 'Questions travellers ask',
    moreFaq: 'More questions and answers',
    listJourneys: 'Example journeys',
    listDestinations: 'Destinations',
  },

  designTrip: {
    crumb: 'Design my trip',
    howTitle: 'How the trip builder works',
    howHtml:
      '<p>Voyage Georgia Rezo does not sell fixed packages. This builder collects what you want (interests, rough dates, group, pace) and draws a first sketch of where those interests usually lead in Georgia. Rezo, who has more than twenty years in Georgian tourism, then reads your request himself and plans the real route, the daily schedule, the vehicle and the price.</p>' +
      '<p>You do not need to know the map. If you would rather start from an idea, browse the <a href="/journeys">example journeys</a> or the <a href="/destinations">destinations</a>, and read <a href="/guides/best-time-to-visit-georgia">the best time to visit Georgia</a> if dates are still open.</p>',
    faqs: [
      { q: 'Does it cost anything to send a request?', a: 'No. Sending a request is free and is not a booking. Rezo reads it himself and plans the real trip with you; nothing is charged until you both agree.' },
      { q: 'Will I see a price?', a: 'Not in the builder. Your choices draw a first sketch of the route, but Rezo writes a real quotation, line by line, once your trip is planned.' },
      { q: 'What if I don’t know Georgia at all?', a: 'That is the point of the builder. Tap what draws you (mountains, wine, old churches, the sea) and it shows where those interests usually lead. You can also just write a sentence.' },
    ],
    serviceName: 'Custom private tour design for Georgia',
    serviceDescription: 'A free request form: choose interests, dates, group and pace, or write a sentence. Rezo plans a private itinerary and writes the quotation himself.',
    serviceType: 'Private tour planning',
    channelName: 'Online trip request',
  },

  journeys: {
    eyebrow: 'Example journeys',
    title: 'Journeys Rezo might plan',
    summary: 'Three starting points for a private trip to Georgia: six, eight and ten days. They are ideas, never fixed packages. Route, length, pace and price are always set for you, and no price is shown until Rezo has planned your trip.',
    listName: 'Example Georgia journeys',
    ctaTitle: 'None of these quite right?',
    ctaText: 'Describe your own trip in a sentence or answer a few easy questions. Rezo plans from a blank map and your own words.',
  },
  journey: {
    best: 'Best: {months}',
    nightsTitle: 'Where the nights go',
    mapLabel: 'Route map',
    start: 'Start from this idea',
    faqTitle: 'Questions about this journey',
    othersTitle: 'Other starting points',
    ctaTitle: 'Start from this idea.',
    ctaText: 'Choosing it fills in the answers for you, and you can change each one. Nothing is booked and no price is shown until Rezo has planned the real trip.',
    /** JSON-LD TouristTrip name. */
    tripName: '{title} ({days}-day example itinerary)',
    ogEyebrow: 'Example journey · {meta}',
  },

  destinations: {
    eyebrow: 'Destinations',
    title: 'Where to go in Georgia',
    summary: 'Georgia is small enough that most regions are a half-day’s drive apart, and varied enough that each one feels like a different country. These seven are where Rezo’s journeys usually go; pick what moves you and he connects the dots.',
    listName: 'Georgia destinations',
    legsTitle: 'How far apart are they?',
    legsText: 'Typical distances and times, without stops. Your pace sets the real day, and Rezo splits the long legs with a night in between.',
    colLeg: 'Leg',
    colDistance: 'Distance',
    colTime: 'Typical time',
    legs: [
      ['Tbilisi → Kakheti (Telavi)', '≈ 85 km', 'about 2 h over the Gombori pass'],
      ['Tbilisi → Kazbegi (Stepantsminda)', 'Military Highway', 'about 3 h, without stops'],
      ['Tbilisi → Kutaisi', '≈ 230 km', 'about 3½ h'],
      ['Kutaisi → Mestia (Svaneti)', '≈ 225 km', 'about 4½ h via Zugdidi'],
      ['Mestia → Batumi', '≈ 260 km', 'about 5 h'],
      ['Telavi → Omalo (Tusheti)', '≈ 100 km', '4–5 h by 4×4, June to October'],
    ] as [string, string, string][],
  },
  destination: {
    asideLabel: 'Map and photo',
    mapNote: 'Routes follow real highways. Relief from SRTM, GMTED2010 and ETOPO1 elevation data.',
    add: 'Add {name} to my trip',
    faqTitle: 'Questions about {name}',
    nearbyTitle: 'Nearby on the map',
    readNext: 'Worth reading next',
  },

  guides: {
    eyebrow: 'Guides',
    title: 'Planning Georgia, plainly',
    summary: 'Practical notes on the things that decide a Georgia trip: when to go, how the wine works and how the mountain roads behave. Written in the voice we plan in: specific over superlative, and honest about limits.',
    listName: 'Georgia travel guides',
  },
  guide: {
    eyebrow: 'Guide · {n} min read',
    asideLabel: 'On this page',
    contents: 'Contents',
    onThisPage: 'On this page',
    faqTitle: 'Quick answers',
    placesTitle: 'The places in this guide',
    moreTitle: 'More guides',
    ogEyebrow: 'Georgia travel guide',
    feedTitle: '{site} — Georgia travel guides',
  },

  rezo: {
    eyebrow: 'About',
    title: 'Meet Rezo',
    summary: 'Rezo owns and personally runs Voyage Georgia Rezo. He has worked in Georgian tourism for more than twenty years, is an experienced private tour guide, and plans every itinerary himself. When you message the agency, you are messaging him.',
    howTitle: 'How a trip works with Rezo',
    howText: 'Most agencies hand you a brochure itinerary. Rezo starts with a blank map and your own words, then plans the journey around you.',
    techEyebrow: 'Technology amplifies Rezo',
    techTitle: 'Assistants draft. Rezo decides.',
    techHtml: '<strong>Helps with:</strong> summarising inquiries, sketching regions from interests, drafting a day skeleton from his templates, sanity-checking drive times, translating messages and reminding him to follow up.',
    techRules: [
      'Nothing generated reaches a traveller until Rezo publishes it.',
      'Prices are written by Rezo himself; any estimate stays in his private view as a reference.',
      'Every itinerary reads “Designed by Rezo”, with who changed what in the version history.',
    ],
    ctaTitle: 'Send Rezo a sentence.',
  },

  vehicles: {
    eyebrow: 'The fleet',
    title: 'Five vehicles. One for every road.',
    summary: 'The vehicle is chosen after the route, never the other way round. Voyage Georgia Rezo runs a long and a short Mercedes Sprinter, a wheelchair-accessible Sprinter, a 4×4 Sprinter and two Mitsubishi Delicas, all driven by drivers Rezo works with.',
    listName: 'Voyage Georgia Rezo vehicles',
    chooseTitle: 'How Rezo chooses',
    chooseHtml:
      '<p>Group size, luggage, road conditions and access needs decide the vehicle, and Rezo makes the choice once the route is drawn. A couple on a wine route does not need what a family of six crossing mountain valleys needs.</p>' +
      '<ul>' +
      '<li><strong>Mountain valleys and rough tracks</strong> (for example <a href="/destinations/tusheti">Tusheti</a>): the short <a href="/adventure-4x4">4×4 Sprinter</a>.</li>' +
      '<li><strong>Travellers who use a wheelchair</strong>: the short, <a href="/accessible-travel">wheelchair-accessible Sprinter</a>, with access confirmed stop by stop.</li>' +
      '<li><strong>Longer touring days with a group</strong>: the long-wheelbase Sprinter.</li>' +
      '<li><strong>Couples, families and small groups</strong>: the Delicas.</li>' +
      '</ul>' +
      '<p>Your private itinerary names the vehicle Rezo has assigned once the plan is settled.</p>',
  },

  accessible: {
    eyebrow: 'Accessible travel',
    title: 'Accessible travel, planned honestly.',
    summary: 'One of our Mercedes Sprinters is wheelchair-accessible. For every request, Rezo talks through your needs first, then checks each stop before it goes into your itinerary. If something isn’t possible, he’ll say so and suggest what is.',
    bodyHtml:
      '<h2 style="margin-top:0">What Rezo does differently</h2>' +
      '<p>Georgia’s old towns, mountain villages and monasteries were not built with wheelchairs in mind, and a brochure cannot tell you which stops will work for you. So there is no standard accessible package. Instead:</p>' +
      '<ol>' +
      '<li><strong>He listens first.</strong> Before a route is drawn, Rezo talks through your needs: how you travel, what helps and what does not.</li>' +
      '<li><strong>He checks each stop.</strong> Every place is confirmed before it goes into your itinerary, day by day.</li>' +
      '<li><strong>He tells you the truth.</strong> If something isn’t possible, he’ll say so and suggest what is.</li>' +
      '</ol>' +
      '<h2>The vehicle</h2>',
    vehicleText: 'The accessible vehicle is a short-wheelbase Mercedes Sprinter. Rezo confirms access at every stop before you commit.',
    vehicleTodo: 'Adaptation details (ramp or lift, securing points, seating) — to be verified and listed here.',
    earlyHtml:
      '<h2>Tell him early</h2>' +
      '<p>In the <a href="/design-my-trip">trip builder</a>, choose <em>Someone uses a wheelchair</em> or <em>Limited walking or stairs</em>, then add details in the last step. You can also <a href="/contact">write to Rezo directly</a>. Nothing is booked and nothing is charged until you both agree on the plan.</p>' +
      '<p>Also useful: slower days and fewer hotel changes make a big difference when travelling with older parents or small children, whether or not a wheelchair is involved.</p>',
    photo: 'Photo of the accessible Sprinter goes here',
    faqTitle: 'Questions about accessible travel',
    faqs: [
      { q: 'Do you have a wheelchair-accessible vehicle in Georgia?', a: 'Yes. One of our Mercedes Sprinters is wheelchair-accessible. Rezo confirms access at every stop before you commit.' },
      { q: 'What if a place is not accessible?', a: 'Rezo tells you plainly and suggests what is possible instead. He checks every stop before it goes into your itinerary, so you are not surprised on the day.' },
      { q: 'Is the trip priced differently?', a: 'Every trip is priced by Rezo for the route, group and vehicle, and you see a clear quotation with what is included. Access needs are part of that plan, not a surcharge added afterwards.' },
      { q: 'How do I tell you about access needs?', a: 'In the trip builder, choose “Someone uses a wheelchair” or “Limited walking or stairs” and add details in the last step, or simply write to Rezo. He talks through your needs before planning anything.' },
    ],
    ctaTitle: 'Tell Rezo what you need.',
    ctaText: 'He talks through your needs first, then plans around them. Free, and nothing is booked until you both agree.',
  },

  adventure: {
    eyebrow: '4×4 adventure',
    title: 'Where the road gets interesting.',
    summary: 'A shorter 4×4 Sprinter and Rezo’s knowledge of Georgia’s back roads open up mountain valleys, high passes and villages that ordinary vans leave out. Road and weather conditions shape every mountain plan.',
    bodyHtml:
      '<h2 style="margin-top:0">Best for travellers who want the road to be part of the trip</h2>' +
      '<p>Some of Georgia’s most memorable places are at the end of tracks. Rezo plans these journeys around the season and the vehicle, not the other way round.</p>' +
      '<h2>Where a 4×4 matters</h2>' +
      '<ul>' +
      '<li><a href="/destinations/tusheti"><strong>Tusheti</strong></a>: a 4×4-only dirt road over the Abano Pass (about 2,850 m) into stone villages and summer pastures; about 100 km and four to five hours from Telavi, usually open June to October.</li>' +
      '<li><a href="/destinations/svaneti"><strong>Ushguli and Upper Svaneti</strong></a>: a day trip from Mestia on a mountain road, with the vehicle chosen for the conditions that day.</li>' +
      '<li><a href="/destinations/kazbegi"><strong>Gergeti and the Juta valley</strong></a>: reached by 4×4 or on foot above Stepantsminda; Rezo decides on the day depending on the weather.</li>' +
      '</ul>' +
      '<h2>The vehicle</h2>' +
      '<p>A short-wheelbase Mercedes Sprinter 4×4, one of five vehicles in the <a href="/vehicles">fleet</a>. <a href="/guides/georgia-mountain-roads-guide">Read how Georgia’s mountain roads behave</a> before you choose your dates.</p>',
    photo: 'Photo of the 4×4 Sprinter goes here',
    faqTitle: 'Questions about 4×4 travel',
    faqs: [
      { q: 'Which vehicle do you use for mountain roads?', a: 'A short Mercedes Sprinter with 4×4, chosen for mountain valleys and rough tracks that ordinary vans avoid.' },
      { q: 'Can I drive myself on these roads?', a: 'Rezo’s tours are driven by drivers he works with, who know the roads. The roads are seasonal and weather-led, which is the main reason the vehicle and driver matter more than the schedule.' },
      { q: 'When is the road to Tusheti open?', a: 'Usually June to October, snow permitting. The route crosses the Abano Pass at about 2,850 m and is 4×4-only.' },
      { q: 'What happens if the weather changes the plan?', a: 'Road and weather conditions shape every mountain plan. Rezo builds slack into mountain days and, if conditions change, revises the day and tells you.' },
    ],
    ctaTitle: 'Start from the high villages.',
    ctaText: 'Choosing the Wine valleys to high villages idea fills in the answers for you. You can change each one.',
  },

  faq: {
    eyebrow: 'FAQ',
    crumb: 'Questions',
    title: 'Questions travellers ask',
    summary: 'Straight answers about how Rezo plans a private trip to Georgia: how the price is worked out, whether you can change the plan, wheelchair access, vehicles and what happens after you send a request.',
    groups: {
      planning: 'Planning your trip',
      pricing: 'Price and payment',
      access: 'Accessibility',
      roads: 'Roads and seasons',
      practical: 'Practical',
    },
    ctaTitle: 'Still have a question?',
    ctaText: 'Ask Rezo directly. A real person reads every message.',
  },

  contact: {
    eyebrow: 'Contact',
    title: 'Talk to Rezo.',
    summary: 'Start with a sentence about the trip you imagine, or message Rezo directly. A real person reads every request. It is free, nothing is booked, and nothing is charged until you and Rezo agree on the plan.',
    nextTitle: 'What happens next',
    steps: [
      { title: 'Rezo reads it himself.', text: 'He may reply with a question or two first, on the channel you choose.' },
      { title: 'He plans your first proposal.', text: 'Route, daily schedule, vehicle and price, worked out by hand. How long it takes depends on the season and the trip.' },
      { title: 'You get a private link.', text: 'Review the journey and ask for changes. Nothing is booked until you and Rezo agree.' },
    ],
    responseTodo: 'Rezo to add his usual response time.',
    prefer: 'Prefer to answer a few easy questions instead of writing?',
    designTrip: 'Design my trip',
  },
};
