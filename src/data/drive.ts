/**
 * Content for the homepage model: the regions a visitor can pick on it, and the sample drive that plays as the page
 * scrolls. `node` is the object's name in public/models/georgia.glb (see blender/README.md).
 */

export interface Region { id: string; node: string; name: string; ka: string; phrase: string }

/** Every region on the model that can be tapped, west to east so the chip row reads like the map. */
export const regions: Region[] = [
  { id: 'batumi-adjara', node: 'Batumi', name: 'Batumi', ka: 'ბათუმი', phrase: 'Batumi and the Black Sea coast' },
  { id: 'svaneti', node: 'Svaneti', name: 'Svaneti', ka: 'სვანეთი', phrase: 'Svaneti and its towers' },
  { id: 'kutaisi-imereti', node: 'Scenery_Kutaisi', name: 'Kutaisi', ka: 'ქუთაისი', phrase: 'Kutaisi and Imereti' },
  { id: 'kazbegi', node: 'Scenery_Kazbegi', name: 'Kazbegi', ka: 'ყაზბეგი', phrase: 'Kazbegi and the high Caucasus' },
  { id: 'tbilisi', node: 'Tbilisi', name: 'Tbilisi', ka: 'თბილისი', phrase: 'Tbilisi' },
  { id: 'tusheti', node: 'Tusheti', name: 'Tusheti', ka: 'თუშეთი', phrase: 'Tusheti by 4×4' },
  { id: 'kakheti', node: 'Kakheti', name: 'Kakheti', ka: 'კახეთი', phrase: 'Kakheti’s wine country' },
];

export interface Stop {
  key: string;
  node: string;
  name: string;
  ka: string;
  title: string;
  line: string;
  facts: [string, string][];
  href: string;
}

/** The sample drive, in order. Facts and times are typical, without stops. */
export const stops: Stop[] = [
  {
    key: 'tbilisi', node: 'Tbilisi', name: 'Tbilisi', ka: 'თბილისი', title: 'Start in the old city, slowly.',
    line: 'Sulphur-bath domes, carved balconies and courtyards that open onto wine bars. Most trips begin here, so the first evening stays light.',
    facts: [['≈ 400 m', 'on the Mtkvari'], ['25 min', 'to Mtskheta, a UNESCO site']], href: '/destinations/tbilisi',
  },
  {
    key: 'kakheti', node: 'Kakheti', name: 'Kakheti', ka: 'კახეთი', title: 'East into wine country.',
    line: 'Vineyards under the Greater Caucasus, wine still made in buried clay qvevri, the walls of Sighnaghi and a long lunch.',
    facts: [['Sept–Oct', 'the rtveli harvest'], ['≈ 570 m', 'at Telavi']], href: '/destinations/kakheti',
  },
  {
    key: 'tusheti', node: 'Tusheti', name: 'Tusheti', ka: 'თუშეთი', title: 'Over the Abano Pass.',
    line: 'A 4×4-only road climbs to about 2,850 m and drops into stone villages, slate towers and summer pastures.',
    facts: [['June–Oct', 'when the road is open'], ['≈ 1,880 m', 'at Omalo']], href: '/destinations/tusheti',
  },
  {
    key: 'kutaisi', node: 'Scenery_Kutaisi', name: 'Kutaisi', ka: 'ქუთაისი', title: 'Across to the green west.',
    line: 'Over the Likhi range the land softens into Imereti: Gelati Monastery, Prometheus Cave and the Martvili canyon.',
    facts: [['UNESCO', 'Gelati Monastery'], ['≈ 150 m', 'on the Rioni']], href: '/destinations/kutaisi-imereti',
  },
  {
    key: 'svaneti', node: 'Svaneti', name: 'Svaneti', ka: 'სვანეთი', title: 'Up to the towers.',
    line: 'Up the Enguri gorge to Mestia’s medieval towers, then on to Ushguli beneath Shkhara, Georgia’s highest peak.',
    facts: [['5,193 m', 'Shkhara'], ['≈ 2,100 m', 'at Ushguli']], href: '/destinations/svaneti',
  },
  {
    key: 'batumi', node: 'Batumi', name: 'Batumi', ka: 'ბათუმი', title: 'Finish at the sea.',
    line: 'Palms, the seafront boulevard and the Botanical Garden at Green Cape: an easy last day before the flight home.',
    facts: [['Sea level', 'the Black Sea'], ['Subtropical', 'warm, often rainy']], href: '/destinations/batumi-adjara',
  },
];

/** The road between stop i and stop i + 1. */
export const legs: { dist: string; time: string; via: string }[] = [
  { dist: '≈ 85 km', time: 'about 2 h', via: 'over the Gombori pass' },
  { dist: '≈ 100 km', time: '4–5 h by 4×4', via: 'over the Abano Pass at about 2,850 m' },
  { dist: 'Two days', time: 'back through Telavi', via: 'with a night in Tbilisi on the way west' },
  { dist: '≈ 225 km', time: 'about 4½ h', via: 'via Zugdidi and the Enguri gorge' },
  { dist: '≈ 260 km', time: 'about 5 h', via: 'down from the mountains to the coast' },
];
