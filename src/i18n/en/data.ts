/**
 * Copy for the structured data in src/data/*.ts. The data files keep ids, coordinates and links; the words live
 * here, keyed by the same ids, so a translation can never change the structure.
 */
export default {
  /** src/data/faqs.ts — keyed by FAQ id. Answers are plain text (also used in FAQPage JSON-LD). */
  faqs: {
    packages: {
      q: 'Do you sell fixed tour packages?',
      a: 'No. Every journey is designed for the person who asks for it. The example journeys on this site are starting points; route, pace, vehicle and price are all set by Rezo for you.',
    },
    price: {
      q: 'How is the price worked out?',
      a: 'Rezo calculates it himself from your route, dates, group size, vehicle and the experiences you choose. You see a clear quotation with what is included and excluded. It changes if the plan changes, and nothing is final until Rezo has approved it. No price is shown on this website because there is no fixed package to price.',
    },
    change: {
      q: 'Can I change the plan once I’ve seen it?',
      a: 'Yes. Ask on your private itinerary page or by message. Rezo revises the schedule and the price, and you can compare each version.',
    },
    wheelchair: {
      q: 'Can you travel with wheelchair users or people with limited mobility?',
      a: 'We have a wheelchair-accessible Sprinter. Rezo talks through your needs first and confirms what is possible for each place and day before you commit. If something is not possible he will say so and suggest what is.',
    },
    reply: {
      q: 'How soon will I hear back?',
      a: 'Rezo reads every request himself and replies personally. We don’t promise instant answers, we promise a personal one.',
    },
    pay: {
      q: 'How do I reserve and pay?',
      a: 'Sending a request is free and is not a booking. Nothing is booked and nothing is charged until you and Rezo agree on the plan. He then confirms availability and explains the next steps and payment terms with you directly.',
    },
    who: {
      q: 'Who will I actually be talking to?',
      a: 'Rezo. He owns and personally runs Voyage Georgia Rezo, has worked in Georgian tourism for more than twenty years and is an experienced private tour guide. He plans each trip himself and is the person who answers your messages. Drivers he works with help deliver your tours and transfers.',
    },
    geography: {
      q: 'Do I need to know Georgia’s geography to start?',
      a: 'No. Pick what draws you (wine, mountains, old churches, the sea) or write a few lines in your own words. Rezo works out where those interests lead and in what order, and keeps driving days short enough to enjoy.',
    },
    vehicles: {
      q: 'Which vehicles do you use?',
      a: 'Five private vehicles: a long-wheelbase Mercedes Sprinter for groups, a short wheelchair-accessible Mercedes Sprinter, a short 4×4 Mercedes Sprinter for mountain roads, and two Mitsubishi Delicas for couples, families and small groups. Rezo chooses the vehicle after the route, never the other way round.',
    },
    tusheti: {
      q: 'Is Tusheti open all year?',
      a: 'No. The road to Tusheti crosses the Abano Pass at about 2,850 m and is a 4×4-only road. It is usually open from June to October, snow permitting, and snow decides the exact dates each year. Rezo plans Tusheti days around the season.',
    },
    bestTime: {
      q: 'When is the best time to visit Georgia?',
      a: 'It depends on what you want. Summer is the best time for high mountains, Svaneti and hiking. September and October bring the wine harvest in Kakheti and clear mountain views, and are among the busiest months. Spring is green and quiet, and late autumn and winter suit cities, wine cellars and food. See the month-by-month guide for detail.',
    },
    children: {
      q: 'Can we travel with children?',
      a: 'Yes. Tell Rezo the children’s ages when you send your request. Slower days and fewer hotel changes make a big difference with small children or older parents, and he plans around them.',
    },
    private: {
      q: 'Is this a tour with strangers?',
      a: 'No. Voyage Georgia Rezo runs private journeys for you and the people you travel with. Nobody else joins your vehicle.',
    },
  },

  /** The four steps of working with Rezo (homepage and Meet Rezo). */
  steps: [
    { title: 'Tell Rezo what you want', body: 'Pick what draws you — wine, mountains, old churches, the sea — or simply write a few lines. No need to know the map.' },
    { title: 'Rezo plans your journey', body: 'He works out the route day by day and hour by hour: distances, roads, pace, vehicle, stays — and the price, by himself.' },
    { title: 'Review it privately', body: 'You receive a personal link with the map, the daily schedule, what’s included and a quotation written by Rezo, not generated.' },
    { title: 'Change it until it’s right', body: 'Ask for another night in the mountains or a slower day. Rezo revises the plan and the price. Confirm when you’re happy.' },
  ],

  /** src/data/vehicles.ts — keyed by vehicle id. */
  vehicles: {
    'sprinter-long': { name: 'Mercedes Sprinter — long', tags: ['Long wheelbase', 'Groups'], text: 'Private tours and group transport over longer touring days.', detailLabel: 'Seats & luggage' },
    'sprinter-accessible': { name: 'Mercedes Sprinter — short, wheelchair-accessible', tags: ['Wheelchair-accessible', 'Short wheelbase'], text: 'For travellers who use a wheelchair. Rezo confirms access at every stop before you commit.', detailLabel: 'Adaptation details' },
    'sprinter-4x4': { name: 'Mercedes Sprinter — short, 4×4 off-road', tags: ['4×4', 'Mountain roads'], text: 'For mountain valleys and rough tracks that ordinary vans avoid.', detailLabel: 'Seats & luggage' },
    delica: { name: 'Mitsubishi Delica', tags: ['Couples & families', 'Small groups'], text: 'Smaller vans for couples, families and small groups.', detailLabel: 'Seats & luggage' },
  },

  /** src/data/drive.ts — the homepage model. */
  regions: {
    'batumi-adjara': { name: 'Batumi', phrase: 'Batumi and the Black Sea coast' },
    svaneti: { name: 'Svaneti', phrase: 'Svaneti and its towers' },
    'kutaisi-imereti': { name: 'Kutaisi', phrase: 'Kutaisi and Imereti' },
    kazbegi: { name: 'Kazbegi', phrase: 'Kazbegi and the high Caucasus' },
    tbilisi: { name: 'Tbilisi', phrase: 'Tbilisi' },
    tusheti: { name: 'Tusheti', phrase: 'Tusheti by 4×4' },
    kakheti: { name: 'Kakheti', phrase: 'Kakheti’s wine country' },
  },
  /** The sample drive, keyed by stop key. facts are [value, label] pairs. */
  stops: {
    tbilisi: {
      name: 'Tbilisi', title: 'Start in the old city, slowly.',
      line: 'Sulphur-bath domes, carved balconies and courtyards that open onto wine bars. Most trips begin here, so the first evening stays light.',
      facts: [['≈ 400 m', 'on the Mtkvari'], ['25 min', 'to Mtskheta, a UNESCO site']],
    },
    kakheti: {
      name: 'Kakheti', title: 'East into wine country.',
      line: 'Vineyards under the Greater Caucasus, wine still made in buried clay qvevri, the walls of Sighnaghi and a long lunch.',
      facts: [['Sept–Oct', 'the rtveli harvest'], ['≈ 570 m', 'at Telavi']],
    },
    tusheti: {
      name: 'Tusheti', title: 'Over the Abano Pass.',
      line: 'A 4×4-only road climbs to about 2,850 m and drops into stone villages, slate towers and summer pastures.',
      facts: [['June–Oct', 'when the road is open'], ['≈ 1,880 m', 'at Omalo']],
    },
    kutaisi: {
      name: 'Kutaisi', title: 'Across to the green west.',
      line: 'Over the Likhi range the land softens into Imereti: Gelati Monastery, Prometheus Cave and the Martvili canyon.',
      facts: [['UNESCO', 'Gelati Monastery'], ['≈ 150 m', 'on the Rioni']],
    },
    svaneti: {
      name: 'Svaneti', title: 'Up to the towers.',
      line: 'Up the Enguri gorge to Mestia’s medieval towers, then on to Ushguli beneath Shkhara, Georgia’s highest peak.',
      facts: [['5,193 m', 'Shkhara'], ['≈ 2,100 m', 'at Ushguli']],
    },
    batumi: {
      name: 'Batumi', title: 'Finish at the sea.',
      line: 'Palms, the seafront boulevard and the Botanical Garden at Green Cape: an easy last day before the flight home.',
      facts: [['Sea level', 'the Black Sea'], ['Subtropical', 'warm, often rainy']],
    },
  } as Record<'tbilisi' | 'kakheti' | 'tusheti' | 'kutaisi' | 'svaneti' | 'batumi', { name: string; title: string; line: string; facts: [string, string][] }>,
  /** The road between stop i and stop i + 1. */
  legs: [
    { dist: '≈ 85 km', time: 'about 2 h', via: 'over the Gombori pass' },
    { dist: '≈ 100 km', time: '4–5 h by 4×4', via: 'over the Abano Pass at about 2,850 m' },
    { dist: 'Two days', time: 'back through Telavi', via: 'with a night in Tbilisi on the way west' },
    { dist: '≈ 225 km', time: 'about 4½ h', via: 'via Zugdidi and the Enguri gorge' },
    { dist: '≈ 260 km', time: 'about 5 h', via: 'down from the mountains to the coast' },
  ],

  /** src/data/model.ts — close-up renders of the model. */
  model: {
    tbilisi: { see: 'Sameba, Narikala fortress, the Mtkvari and the old town', alt: 'Tbilisi on the model: Sameba cathedral, Narikala fortress above the Mtkvari river and the red roofs of the old town.' },
    kakheti: { see: 'Vineyards, Alaverdi, Sighnaghi’s walls and a hot-air balloon', alt: 'Kakheti on the model: rows of vines, clay qvevri, Alaverdi monastery and the walled town of Sighnaghi.' },
    tusheti: { see: 'Keselo towers, Omalo and the summer flocks', alt: 'Tusheti on the model: the stone towers of Keselo above Omalo, with sheep on the high pastures.' },
    'kutaisi-imereti': { see: 'Bagrati, Gelati and the White Bridge', alt: 'Kutaisi on the model: Bagrati cathedral on its hill, Gelati monastery and the Rioni river.' },
    svaneti: { see: 'The towers of Mestia and Ushguli and the Enguri', alt: 'Svaneti on the model: clusters of medieval Svan towers at Mestia and Ushguli beneath snowy peaks.' },
    'batumi-adjara': { see: 'The Alphabet Tower, the boulevard and the sea', alt: 'Batumi on the model: the Alphabet Tower, the glass towers of the seafront, palms and the Black Sea.' },
    kazbegi: { see: 'Gergeti Trinity and Stepantsminda below Kazbek', alt: 'Kazbegi on the model: Gergeti Trinity church on its ridge above the village of Stepantsminda and the Terek river.' },
  },
  modelOverviewAlt: 'The whole model of Georgia on its plinth: the Black Sea on the left, the Caucasus along the top and the regions in between.',
  /** "{name} on the model: {see}." caption on destination pages. */
  modelCaption: '{name} on the model: {see}.',

  /** src/data/photos.ts — keyed by photo id. `title` goes into the visible credit line. */
  photos: {
    tbilisi: { alt: 'The sulphur-bath domes of Abanotubani below Narikala fortress in old Tbilisi', title: 'Abanotubani from Narikala' },
    kakheti: { alt: 'Vineyards at Akhasheni in Kakheti beneath the Greater Caucasus', title: 'Vineyards in Akhasheni' },
    tusheti: { alt: 'The dirt road over the Abano Pass into Tusheti', title: 'The Abano Pass road' },
    kutaisi: { alt: 'Medieval frescoes in the Church of the Virgin at Gelati Monastery near Kutaisi', title: 'Frescoes, Church of the Virgin, Gelati' },
    svaneti: { alt: 'Stone defensive towers and houses of Ushguli in Upper Svaneti', title: 'Ushguli, Upper Svaneti' },
    batumi: { alt: 'The Black Sea coast of Georgia with the Batumi skyline on the horizon', title: 'Black Sea coast, Batumi on the horizon' },
  },
  /** "Photo: {title} · {author} · {licence}" */
  photoCredit: 'Photo: {title} · {author} · {licence}',

  /** src/data/maps.ts — accessible descriptions of each route map (labels use common.places). */
  maps: {
    kazbegi: 'Map of the Georgian Military Highway from Mtskheta north to Stepantsminda, below Mount Kazbek',
    kakheti: 'Map of Kakheti with Telavi, Sighnaghi and David Gareja',
    svaneti: 'Map of Upper Svaneti with Mestia, Ushguli, Ushba and Shkhara',
    batumi: 'Map of the Black Sea coast at Batumi',
    kutaisi: 'Map of Kutaisi in Imereti, on the road between Tbilisi, Svaneti and Batumi',
    tusheti: 'Map of the road from Telavi in Kakheti north to Tusheti over the Abano Pass',
    tbilisi: 'Map of Tbilisi and Mtskheta',
    mountainsWineSea: 'Map: Tbilisi, Kazbegi, Kakheti, Kutaisi and Batumi by road',
    wineToHighVillages: 'Map: Tbilisi, Sighnaghi, Telavi and Tusheti',
    firstTaste: 'Map: Tbilisi, Kazbegi and Kakheti',
  },
};
