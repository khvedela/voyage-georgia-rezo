/**
 * Itinerary Studio (the traveller's private trip page, src/components/studio/TripStudio.tsx) and Rezo's field
 * dashboard prototype (src/layouts/Dash.astro, src/pages/[...lang]/studio/). Everything here is SAMPLE content:
 * names, dates, prices and times are illustrative. Structure (day numbers, item kinds, clock times, roads, prices)
 * lives in src/data/studio.ts and the pages; only words live here. Place names come from common.places.
 */
import type { DayNo, LineId, TimeWord } from '../../data/studio';

/** One timeline entry of a sample day. `detail` is the grey second line (undefined = none). */
interface ItemCopy { text: string; detail: string | undefined }
/** One sample day; `items` match the day's items in src/data/studio.ts, in order. `note` is shown when the day has one. */
interface DayCopy { title: string; route: string; drive: string; stay: string; note?: string; items: ItemCopy[] }

const it = (text: string, detail?: string): ItemCopy => ({ text, detail });
const days = (d: Record<DayNo, DayCopy>) => d;
const lines = (d: Record<LineId, string>) => d;
const times = (d: Record<TimeWord, string>) => d;

export default {
  /** The traveller's private itinerary page (/trip/demo). */
  trip: {
    meta: {
      title: 'Your Personal Georgian Journey (sample)',
      description: 'A sample of the private itinerary page Rezo sends to each traveller.',
    },
    banner: 'Design sample — traveller names, dates, prices and times are illustrative. Real proposals are written by Rezo.',
    privateLink: 'Private link, just for you',
    /** Status pill in the header. */
    status: {
      review: 'Proposal v2 · awaiting your review',
      requested: 'Change requested — with Rezo',
      approved: 'Version 2 approved',
    },

    hero: {
      eyebrow: 'Prepared for Anna & Daniel · Proposal v2',
      title: 'Your Personal Georgian Journey',
      by: 'Designed by Rezo',
      lede: 'Eleven days from the capital to the mountains, the vineyards and the sea — at the slow pace you asked for.',
      /** Fact pills; the month pill between `days` and `travellers` is a formatted date. */
      pills: { days: '11 days', travellers: '2 travellers', pace: 'Slow & spacious' },
      walk: 'Walk through the days',
      seeQuote: 'See the quotation',
      mapAlt: 'Map of Georgia',
      modelAlt: 'Three-dimensional model of Georgia with the eleven-day route from Tbilisi to Kazbegi, Kakheti, Kutaisi and Batumi',
      caption: 'Your route over Georgia’s terrain, following real roads. Move your pointer to tilt it. Terrain from SRTM, GMTED2010 and ETOPO1 elevation data, heights exaggerated 9×.',
    },

    route: {
      title: 'The route',
      /** "Day 3 · North on the Military Highway" */
      current: 'Day {n} · {title}',
      mapAlt: 'Map of Georgia with the journey drawn along real roads from Tbilisi to Kazbegi, Kakheti, Kutaisi and Batumi',
      /** Second line under each map pin. */
      pinDay: 'Day {n}',
      pinDays: 'Days {from}–{to}',
      caption: 'Routes follow real highways over real terrain. Pick a day below to see its leg.',
    },

    note: {
      title: 'A note from Rezo',
      sample: '· sample',
      text: 'Anna, Daniel — you asked for another night in the mountains, so Kazbegi now has three. I moved that day’s walk to Juta, which is quieter. The drive to Kutaisi is long, so I broke it at Uplistsikhe. Tell me what feels wrong — that’s what the button is for.',
      sign: '— Rezo',
    },

    /** The short facts list beside the note. */
    facts: {
      travelling: 'Travelling',
      travellingValue: '2 adults',
      pace: 'Pace',
      paceValue: 'Slow & spacious',
      vehicle: 'Vehicle',
      vehicleValue: '[Rezo assigns — depends on group and roads]',
      stays: 'Stays',
      staysValue: '10 nights · [hotels — Rezo to add]',
      access: 'Access',
      accessValue: 'No special requirements noted',
    },

    daysSection: {
      title: 'Day by day',
      showChanges: 'Show changes since v1',
      disclaimer: 'Drive times are Rezo’s estimates including normal stops. Roads and weather can change them.',
      new: 'New in v2',
      changed: 'Changed in v2',
      overnight: 'Overnight:',
      /** Signature after a day's note. */
      sign: '— Rezo',
      ask: 'Ask about this day',
      /** Pre-filled start of a change request about one day. */
      askPrefix: 'About day {n}: ',
    },

    /** Item times that are words, not clock times. */
    times: times({ arrival: 'Arrival', evening: 'Evening', morning: 'Morning', transfer: 'Transfer' }),

    /** The sample proposal, by day number. */
    days: days({
      1: {
        title: 'Welcome to Tbilisi', route: 'Airport → Tbilisi', drive: '≈ 30 min', stay: 'Tbilisi · [hotel — Rezo to add]',
        items: [it('Airport pickup and transfer to your hotel', '≈ 30 min · timing follows your flight'), it('A relaxed first dinner near the hotel', 'Nothing ambitious after a long journey')],
      },
      2: {
        title: 'Tbilisi, unhurried', route: 'On foot in the old city', drive: 'No driving', stay: 'Tbilisi · [hotel — Rezo to add]',
        items: [it('Old Town on foot, up to Narikala fortress', 'Cable car up, a gentle walk down'), it('Lunch with khachapuri and a first glass of qvevri wine'), it('The Abanotubani bathhouse district', 'Optional — a rest day is also fine'), it('Dinner in a traditional restaurant')],
      },
      3: {
        title: 'North on the Military Highway', route: 'Tbilisi → Mtskheta → Ananuri → Gudauri → Stepantsminda', drive: '≈ 3 h 15 m', stay: 'Stepantsminda (Kazbegi) · [guesthouse — Rezo to add]',
        items: [it('Leave Tbilisi', '≈ 30 min to Mtskheta'), it('Mtskheta: Jvari Monastery and Svetitskhoveli Cathedral', 'Ancient churches above the rivers’ meeting point'), it('North on the Georgian Military Highway', '≈ 1 h to Ananuri'), it('Ananuri fortress by the reservoir'), it('Lunch in the mountains'), it('Over the pass to Stepantsminda', '≈ 1 h 45 m with viewpoint stops'), it('Check in, evening walk')],
      },
      4: {
        title: 'Gergeti and the mountain', route: 'Stepantsminda', drive: '≈ 30 min', stay: 'Stepantsminda · same guesthouse',
        items: [it('Gergeti Trinity Church', 'By 4×4 or on foot — Rezo decides on the day, depending on weather'), it('Lunch in Stepantsminda'), it('Free afternoon', 'A café, a walk, or simply a rest')],
      },
      5: {
        title: 'A slower mountain day', route: 'Stepantsminda → Juta valley and back', drive: '≈ 1 h 30 m', stay: 'Stepantsminda · same guesthouse',
        note: 'You asked for another night here, so this day is yours — easy walking, no schedule to beat.',
        items: [it('Drive to Juta village', '≈ 45 min on a mountain road'), it('Short walk beneath the Chaukhi massif', 'An easy option; Rezo adapts it to the group'), it('Lunch in Juta'), it('Return to Stepantsminda', '≈ 45 min')],
      },
      6: {
        title: 'Down from the mountains to Kakheti', route: 'Stepantsminda → Ananuri → Gombori Pass → Telavi', drive: '≈ 5 h', stay: 'Telavi · [hotel — Rezo to add]',
        note: 'A long road day, so a late start and a proper lunch halfway.',
        items: [it('Leave Stepantsminda — a late start', '≈ 2 h 45 m to the lunch stop'), it('Long lunch on the way down'), it('Over the Gombori Pass to Kakheti', '≈ 2 h 15 m'), it('Arrive in Telavi', 'An evening stroll beneath the fortress')],
      },
      7: {
        title: 'Wine at the source', route: 'Telavi → Tsinandali → Sighnaghi', drive: '≈ 1 h 45 m', stay: 'Sighnaghi · [guesthouse — Rezo to add]',
        items: [it('Tsinandali estate and garden'), it('A family qvevri winery', '[Winery — Rezo to choose] · wine made in buried clay vessels'), it('Long lunch with the winemaker'), it('To Sighnaghi', '≈ 1 h'), it('The town walls at sunset')],
      },
      8: {
        title: 'Across the country to Kutaisi', route: 'Sighnaghi → Gori → Uplistsikhe → Kutaisi', drive: '≈ 6 h', stay: 'Kutaisi · [hotel — Rezo to add]',
        note: 'The longest day. I split it at Uplistsikhe so you can walk, eat and stretch before the last stretch.',
        items: [it('Leave Sighnaghi', '≈ 2 h 45 m to Gori'), it('Uplistsikhe cave town', 'A walk among rock-cut halls'), it('Late lunch in Gori'), it('On to Kutaisi', '≈ 2 h 30 m'), it('Arrive in Kutaisi')],
      },
      9: {
        title: 'Monasteries and caves', route: 'Kutaisi and around', drive: '≈ 1 h', stay: 'Kutaisi · same hotel',
        items: [it('Gelati Monastery'), it('Motsameta Monastery'), it('Lunch in Kutaisi'), it('Prometheus Cave — or a free afternoon', 'Your choice on the day')],
      },
      10: {
        title: 'To the Black Sea', route: 'Kutaisi → Batumi', drive: '≈ 2 h 30 m', stay: 'Batumi · [hotel — Rezo to add]',
        items: [it('Leave Kutaisi', '≈ 2 h 30 m with a coffee stop'), it('Arrive in Batumi and check in'), it('The boulevard and the old town'), it('Dinner by the sea at sunset')],
      },
      11: {
        title: 'Farewell', route: 'Batumi → airport', drive: '≈ 20 min', stay: '—',
        items: [it('One last coffee by the sea'), it('Airport transfer', '≈ 20 min · timing follows your flight')],
      },
    }),

    quote: {
      label: 'Quotation and actions',
      title: 'Your quotation',
      illustrative: 'illustrative figures',
      /** Under the total: "for 2 travellers · €2,325 each". */
      split: 'for 2 travellers · {each} each',
      /** {amount} is signed, e.g. "+€400". */
      sinceV1: '{amount} since v1 · one more night, one more day',
      how: 'How Rezo calculated this',
      /** Price lines, by id (amounts in src/data/studio.ts). */
      lines: lines({
        vehicle: 'Private vehicle and driver',
        stays: 'Accommodation, 10 nights',
        guiding: 'Planning, guiding and support',
        visits: 'Visits and entrance fees',
        meals: 'Meals included',
      }),
      included: 'Included',
      includedItems: ['Private vehicle with driver, all 11 days', 'Route design and trip support from Rezo', '10 nights’ accommodation as listed', 'Entrance fees for listed visits'],
      notIncluded: 'Not included',
      notIncludedItems: ['International flights', 'Travel insurance', 'Most meals and drinks', 'Personal expenses and tips'],
      fine: 'Sample inclusions — Rezo edits these for every trip. Payment terms: [to be supplied by Rezo].',
    },

    decide: {
      approvedTitle: 'Version 2 approved',
      approvedText: 'Thank you. Rezo will confirm availability and the next steps with you directly. Until he does, nothing is booked.',
      title: 'Happy with it?',
      text: 'This is a proposal. Prices and times are final only when Rezo confirms them.',
      confirmQ: 'Approve version 2 as it stands?',
      confirmText: 'Rezo will then confirm availability and arrange the next steps with you.',
      yes: 'Yes, approve',
      notYet: 'Not yet',
      approve: 'Approve this version',
      change: 'Ask for a change',
      reqLabel: 'What would you like to change?',
      reqPlaceholder: 'Can we spend another night in the mountains?',
      /** Quick-reply chips; tapping one appends it to the request (followed by a full stop). */
      quick: ['Another night here', 'A slower day', 'Swap a stop', 'A question about the price'],
      send: 'Send to Rezo',
      cancel: 'Cancel',
      sentTitle: 'Sent to Rezo.',
      sentText: 'He reads every request himself. If the plan or the price changes, he’ll publish a new version here and you can compare it with this one.',
      talk: 'Rather talk it through?',
      whatsapp: 'Message Rezo on WhatsApp',
      message: 'Message Rezo',
      /** Wraps the traveller's own words in the versions list. */
      quoted: '“{text}”',
    },

    versions: {
      title: 'Versions',
      yourRequest: 'Your request',
      waiting: 'waiting for Rezo',
      v2: 'Version 2',
      v2Meta: 'current · from Rezo',
      v2Body: 'Third night in Kazbegi with a Juta valley day. Long drive to Kutaisi split at Uplistsikhe.',
      afterV1: 'after v1',
      firstRequest: '“Can we spend another night in the mountains?”',
      v1: 'Version 1',
      v1Meta: 'first proposal',
      /** "10 days · €4,250" */
      v1Body: '10 days · {price}',
    },
  },

  /** Dashboard chrome (src/layouts/Dash.astro) and sample content shared by its screens. */
  dash: {
    /** Browser title: "Rezo’s dashboard — Today". */
    title: 'Rezo’s dashboard — {title}',
    description: 'Prototype of Rezo’s private field dashboard. Sample data only.',
    navLabel: 'Dashboard',
    nav: { today: 'Today', inquiries: 'Inquiries', trips: 'Trips', quotes: 'Quotes' },
    /** Sample travellers. */
    people: {
      annaDaniel: 'Anna & Daniel',
      leila: 'Leila H.',
      tomas: 'Tomás R.',
      james: 'James & family',
      karlInes: 'Karl & Ines',
    },
    /** Interest tags from the trip form. */
    interests: { mountains: 'Mountains', wine: 'Wine', churches: 'Churches', blackSea: 'Black Sea', history: 'History' },
  },

  /** Today (/studio). */
  today: {
    title: 'Today',
    greeting: 'Good morning, Rezo',
    synced: 'Synced',
    sample: 'Sample data',
    needsYou: 'Needs you · {n}',
    change: {
      tag: 'Change request · v2',
      ago: '12 min ago',
      quote: '“Could day 8 start later? We’d love a lie-in.”',
      action: 'Revise to v3 →',
    },
    leila: { tag: 'New inquiry · web form', ago: '1 h ago', summary: '10 days · 2 adults · September · slow pace' },
    tomas: { tag: 'New inquiry · Messenger', ago: '3 h ago', summary: '7 days · 4 adults · October', access: 'Wheelchair user in group' },
    james: { tag: 'Inquiry · web form', ago: 'Yesterday', summary: '8 days · 2 adults, 2 children · July' },
    onRoad: {
      title: 'On the road',
      progress: 'Day 4 of 9',
      tomorrow: 'Tomorrow: Stepantsminda → Telavi · pickup 09:30',
      crew: 'Driver: [name] · Vehicle: [assigned]',
    },
  },

  /** A new inquiry (/studio/inquiry). */
  inquiry: {
    title: 'New inquiry',
    back: 'Back to Today',
    meta: 'Web form · received 1 h ago · sample data',
    badge: 'New',
    inWords: 'In their words',
    words: '“We have ten days in September. We’d love mountains, wine, old churches and a little sea — without exhausting travel days.”',
    answersLabel: 'Their answers',
    answers: {
      when: { label: 'When', value: 'September · dates flexible' },
      length: { label: 'Length', value: '10 days' },
      travellers: { label: 'Travellers', value: '2 adults' },
      pace: { label: 'Pace', value: 'Slow & spacious' },
      budget: { label: 'Budget', value: 'Comfortable' },
      access: { label: 'Access', value: 'Nothing special' },
      reply: { label: 'Reply via', value: 'WhatsApp' },
    },
    sketch: 'Assistant sketch',
    draft: 'Draft · only you see this',
    mapAlt: 'Map suggesting a route from Tbilisi to Kazbegi, Kakheti, Kutaisi and Batumi',
    sketchNote: 'Five bases fit ten days at a slow pace. It’s a starting thought — your route, your call.',
    askLabel: 'Questions to ask',
    askTitle: 'Worth asking first',
    ask: { airports: 'Arrival & departure airports', hotels: 'Hotel style', dates: 'Fixed dates?' },
    start: 'Start the itinerary',
    reply: 'Reply on WhatsApp',
    template: 'Use a template',
  },

  /** The day builder (/studio/builder). */
  builder: {
    title: 'Itinerary builder',
    back: 'Back to inquiry',
    heading: '{name} · 10 days',
    meta: 'Draft v1 · not shared · sample data',
    daysLabel: 'Days',
    /** Day tab: "D3". */
    chip: 'D{n}',
    addDay: '+ Day',
    offline: 'No signal — saved on this phone. 1 change will sync later.',
    day: 'Day {n}',
    dayTitle: 'Tbilisi → Kazbegi',
    stops: {
      leave: { title: 'Leave Tbilisi', sub: 'Hotel pickup', gap: '≈ 30 min · estimate' },
      mtskheta: { title: 'Mtskheta — Jvari & Svetitskhoveli', sub: '2 h on site', gap: '≈ 1 h · estimate' },
      ananuri: { title: 'Ananuri fortress', sub: '45 min', gap: '≈ 1 h 45 m · estimate' },
      arrive: { title: 'Stepantsminda — check in', sub: '[guesthouse]', gap: '' },
    },
    addStop: '+ Add a stop',
    kinds: { visit: 'Visit', meal: 'Meal', drive: 'Drive', library: 'From library' },
    driving: 'Driving today',
    drivingValue: '≈ 3 h 15 m',
    length: 'Day length',
    lengthValue: '≈ 8 h',
    pace: 'Pace check · slow',
    paceValue: 'Within your usual limit',
    estimates: 'Drive times are estimates. You confirm them before anything is published.',
    noteLabel: 'Note to the traveller (shown on this day)',
    notePlaceholder: 'Why this day works, what to bring…',
    quoteSoFar: 'Quote so far',
    draft: 'draft',
    openQuote: 'Open quotation',
  },

  /** The quotation editor (/studio/quote). */
  quote: {
    title: 'Quotation',
    back: 'Back to itinerary',
    heading: 'Quotation · {name}',
    meta: 'Draft v1 · only you see the costs · sample data',
    vehicle: 'Vehicle',
    vehicles: { delica: 'Delica', long: 'Sprinter long', short: 'Sprinter short', x4: 'Sprinter 4×4' },
    linesLabel: 'Price lines',
    lines: 'Lines',
    price: 'Price',
    cost: 'Your cost',
    items: {
      vehicle: { label: 'Vehicle & driver', sub: '10 days' },
      stays: { label: 'Accommodation', sub: '9 nights' },
      guiding: { label: 'Planning, guiding & support', sub: '' },
      visits: { label: 'Visits & entrance fees', sub: '' },
      meals: { label: 'Meals included', sub: '' },
    },
    addLine: '+ Add a line',
    totals: 'Totals',
    sees: 'Traveller sees',
    perPerson: '{amount} per person · rounded to {step}',
    margin: 'Your margin',
    /** "€470 · 11.9%" */
    marginValue: '{amount} · {pct}',
    /** {lo} and {hi} are plain numbers: "€3,800–4,200". */
    range: '€{lo}–{hi}',
    rangeNote: 'Assistant’s rough range for this kind of trip: {range}. For your reference only — it is never shown to the traveller and never sets the price.',
    beforeLabel: 'Before publishing',
    before: 'Before it reaches Leila',
    checks: { drives: 'I’ve checked every drive time', access: 'Access needs confirmed (none noted)', hotels: 'Hotel prices are current' },
    publish: 'Publish v1 to Leila',
    tick: 'Tick everything to publish. Nothing reaches the traveller until you do.',
    preview: 'Preview as traveller',
    saveTemplate: 'Save as template',
  },
};
