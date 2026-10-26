export interface FaqItem {
  q: string;
  /** Plain-text answer (also used verbatim in FAQPage structured data). */
  a: string;
  /** Appears in the short list on the homepage. */
  home?: boolean;
  topic: 'planning' | 'pricing' | 'access' | 'roads' | 'practical';
}

/**
 * Only answers Rezo can stand behind today. Questions that depend on facts he has not yet supplied
 * (reply time, deposit, cancellation terms) are answered at the level the design supports, and
 * the specifics are listed in docs/LAUNCH-CHECKLIST.md.
 */
export const faqs: FaqItem[] = [
  {
    q: 'Do you sell fixed tour packages?', home: true, topic: 'planning',
    a: 'No. Every journey is designed for the person who asks for it. The example journeys on this site are starting points; route, pace, vehicle and price are all set by Rezo for you.',
  },
  {
    q: 'How is the price worked out?', home: true, topic: 'pricing',
    a: 'Rezo calculates it himself from your route, dates, group size, vehicle and the experiences you choose. You see a clear quotation with what is included and excluded. It changes if the plan changes, and nothing is final until Rezo has approved it. No price is shown on this website because there is no fixed package to price.',
  },
  {
    q: 'Can I change the plan once I’ve seen it?', home: true, topic: 'planning',
    a: 'Yes. Ask on your private itinerary page or by message. Rezo revises the schedule and the price, and you can compare each version.',
  },
  {
    q: 'Can you travel with wheelchair users or people with limited mobility?', home: true, topic: 'access',
    a: 'We have a wheelchair-accessible Sprinter. Rezo talks through your needs first and confirms what is possible for each place and day before you commit. If something is not possible he will say so and suggest what is.',
  },
  {
    q: 'How soon will I hear back?', home: true, topic: 'practical',
    a: 'Rezo reads every request himself and replies personally. We don’t promise instant answers, we promise a personal one.',
  },
  {
    q: 'How do I reserve and pay?', home: true, topic: 'pricing',
    a: 'Sending a request is free and is not a booking. Nothing is booked and nothing is charged until you and Rezo agree on the plan. He then confirms availability and explains the next steps and payment terms with you directly.',
  },
  {
    q: 'Who will I actually be talking to?', topic: 'practical',
    a: 'Rezo. He owns and personally runs Voyage Georgia Rezo, has worked in Georgian tourism for more than twenty years and is an experienced private tour guide. He plans each trip himself and is the person who answers your messages. Drivers he works with help deliver your tours and transfers.',
  },
  {
    q: 'Do I need to know Georgia’s geography to start?', topic: 'planning',
    a: 'No. Pick what draws you (wine, mountains, old churches, the sea) or write a few lines in your own words. Rezo works out where those interests lead and in what order, and keeps driving days short enough to enjoy.',
  },
  {
    q: 'Which vehicles do you use?', topic: 'practical',
    a: 'Five private vehicles: a long-wheelbase Mercedes Sprinter for groups, a short wheelchair-accessible Mercedes Sprinter, a short 4×4 Mercedes Sprinter for mountain roads, and two Mitsubishi Delicas for couples, families and small groups. Rezo chooses the vehicle after the route, never the other way round.',
  },
  {
    q: 'Is Tusheti open all year?', topic: 'roads',
    a: 'No. The road to Tusheti crosses the Abano Pass at about 2,850 m and is a 4×4-only road. It is usually open from June to October, snow permitting, and snow decides the exact dates each year. Rezo plans Tusheti days around the season.',
  },
  {
    q: 'When is the best time to visit Georgia?', topic: 'planning',
    a: 'It depends on what you want. Summer is the best time for high mountains, Svaneti and hiking. September and October bring the wine harvest in Kakheti and clear mountain views, and are among the busiest months. Spring is green and quiet, and late autumn and winter suit cities, wine cellars and food. See the month-by-month guide for detail.',
  },
  {
    q: 'Can we travel with children?', topic: 'planning',
    a: 'Yes. Tell Rezo the children’s ages when you send your request. Slower days and fewer hotel changes make a big difference with small children or older parents, and he plans around them.',
  },
  {
    q: 'Is this a tour with strangers?', topic: 'planning',
    a: 'No. Voyage Georgia Rezo runs private journeys for you and the people you travel with. Nobody else joins your vehicle.',
  },
];

export const homeFaqs = faqs.filter((f) => f.home);
