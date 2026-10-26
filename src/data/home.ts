import type { PhotoId } from './photos';

export interface Chapter {
  n: string;
  eyebrow: string;
  photo: PhotoId;
  heading: string;
  body: string;
  facts: { dt: string; dd: string; small: string }[];
  note: string;
  /** Destination page for this stop (internal linking). */
  page: { href: string; label: string };
}

/** The six stops of the sample route that the van drives as you scroll. Copy is from the design hand-off. */
export const chapters: Chapter[] = [
  {
    n: '01', eyebrow: 'Tbilisi', photo: 'tbilisi', heading: 'Start in the old city, slowly.',
    body: 'Sulphur-bath domes, carved wooden balconies and courtyards that open onto wine bars. Most routes begin here because the main airport and the roads out to every region are here, so the first evening stays light: a walk, a long dinner, a plan for the morning.',
    facts: [
      { dt: 'Elevation', dd: '≈ 400 m', small: 'on the Mtkvari' },
      { dt: 'Nearby', dd: 'Mtskheta', small: 'UNESCO site · 25 min' },
      { dt: 'Good for', dd: 'Arrival', small: 'and a slow first night' },
    ],
    note: 'Tbilisi sits on the Mtkvari river and is the hub for roads east, west and north.',
    page: { href: '/destinations/tbilisi', label: 'About Tbilisi' },
  },
  {
    n: '02', eyebrow: 'Kakheti', photo: 'kakheti', heading: 'Drive east into wine country.',
    body: 'Over the Gombori pass, vineyards run beneath the Greater Caucasus. Kakheti is the heart of Georgian wine, where grapes are still fermented in buried clay qvevri, a method on UNESCO’s list of intangible cultural heritage. Walk the walls of Sighnaghi, visit the Tsinandali estate, and settle in for a long lunch.',
    facts: [
      { dt: 'Telavi', dd: '≈ 570 m', small: 'above sea level' },
      { dt: 'From Tbilisi', dd: '≈ 85 km', small: 'about 2 h over Gombori' },
      { dt: 'Harvest', dd: 'Sept–Oct', small: 'the rtveli season' },
    ],
    note: 'Telavi is also the gateway to Tusheti, so the next stop starts here.',
    page: { href: '/destinations/kakheti', label: 'About Kakheti' },
  },
  {
    n: '03', eyebrow: 'Tusheti', photo: 'tusheti', heading: 'Then over the Abano Pass.',
    body: 'From the Alazani valley a dirt road climbs to the Abano Pass, at about 2,850 m, and drops into Tusheti: stone villages, slate towers and summer pastures with no through traffic. It is a 4×4-only road, and one of the reasons the fleet includes a 4×4 Sprinter.',
    facts: [
      { dt: 'Omalo', dd: '≈ 1,880 m', small: 'main village' },
      { dt: 'From Telavi', dd: '≈ 100 km', small: '4–5 h by 4×4' },
      { dt: 'Road open', dd: 'June–Oct', small: 'usually, snow permitting' },
    ],
    note: 'Snow decides when the road opens each year, so Tusheti days are planned around the season.',
    page: { href: '/destinations/tusheti', label: 'About Tusheti' },
  },
  {
    n: '04', eyebrow: 'Imereti', photo: 'kutaisi', heading: 'Cross to the green west.',
    body: 'Over the Likhi range the landscape softens into Imereti. Kutaisi is the base for Gelati Monastery, a UNESCO World Heritage Site, the Prometheus Cave and the canyons of Martvili and Okatse, with khachapuri imeruli to finish the day.',
    facts: [
      { dt: 'Kutaisi', dd: '≈ 150 m', small: 'on the Rioni' },
      { dt: 'From Tbilisi', dd: '≈ 230 km', small: 'about 3½ h' },
      { dt: 'Gelati', dd: 'UNESCO', small: 'World Heritage Site' },
    ],
    note: 'Tusheti to Kutaisi is a long way, so a night in Tbilisi in between makes the drive easy.',
    page: { href: '/destinations/kutaisi-imereti', label: 'About Kutaisi and Imereti' },
  },
  {
    n: '05', eyebrow: 'Svaneti', photo: 'svaneti', heading: 'Up to the towers of Svaneti.',
    body: 'The road follows the Enguri gorge from Zugdidi up to Mestia, the heart of Upper Svaneti, a UNESCO World Heritage Site known for its medieval defensive towers. Further on, Ushguli sits at about 2,100 m beneath Shkhara, the highest peak in Georgia.',
    facts: [
      { dt: 'Mestia', dd: '≈ 1,500 m', small: 'Ushguli ≈ 2,100 m' },
      { dt: 'From Kutaisi', dd: '≈ 225 km', small: 'about 4½ h via Zugdidi' },
      { dt: 'Shkhara', dd: '5,193 m', small: 'highest in Georgia' },
    ],
    note: 'Ushguli is a day trip from Mestia on a mountain road, and the vehicle is chosen for the conditions that day.',
    page: { href: '/destinations/svaneti', label: 'About Svaneti' },
  },
  {
    n: '06', eyebrow: 'The Black Sea', photo: 'batumi', heading: 'Finish at the sea.',
    body: 'Palms, subtropical gardens and the Black Sea after days in the mountains. Batumi’s seafront boulevard and the Botanical Garden at Green Cape make an easy last day before the flight home.',
    facts: [
      { dt: 'Elevation', dd: 'Sea level', small: 'the Black Sea' },
      { dt: 'From Mestia', dd: '≈ 260 km', small: 'about 5 h' },
      { dt: 'Climate', dd: 'Subtropical', small: 'warm, often rainy' },
    ],
    note: 'Distances and times are typical, without stops. Your pace sets the real day.',
    page: { href: '/destinations/batumi-adjara', label: 'About Batumi and Adjara' },
  },
];

export const steps = [
  { n: '01', title: 'Tell Rezo what you want', body: 'Pick what draws you — wine, mountains, old churches, the sea — or simply write a few lines. No need to know the map.' },
  { n: '02', title: 'Rezo plans your journey', body: 'He works out the route day by day and hour by hour: distances, roads, pace, vehicle, stays — and the price, by himself.' },
  { n: '03', title: 'Review it privately', body: 'You receive a personal link with the map, the daily schedule, what’s included and a quotation written by Rezo, not generated.' },
  { n: '04', title: 'Change it until it’s right', body: 'Ask for another night in the mountains or a slower day. Rezo revises the plan and the price. Confirm when you’re happy.' },
];

export const trust = [
  { strong: '20+ years', text: 'working in Georgian tourism' },
  { strong: 'One planner', text: 'Rezo designs every itinerary himself' },
  { strong: 'Five vehicles', text: 'including a 4×4 and a wheelchair-accessible Sprinter' },
  { strong: 'Talk your way', text: 'WhatsApp, Messenger or email' },
];
