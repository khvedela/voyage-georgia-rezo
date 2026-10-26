import { roads, type RoadId } from './routes';

/** The sample proposal shown in the customer-facing Itinerary Studio. All names, dates, prices and times are illustrative. */
export type ItemKind = 'drive' | 'visit' | 'meal' | 'stay';
export interface Item { time: string; kind: ItemKind; text: string; detail: string }
export interface Day {
  n: number; title: string; route: string; drive: string; stay: string; road?: RoadId;
  change?: 'new' | 'edited'; note?: string; items: Item[];
}

export const ICON: Record<ItemKind, string> = {
  drive: 'M3 14l2-6h14l2 6v4H3z M7 18v2 M17 18v2',
  visit: 'M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z M12 12a2.2 2.2 0 1 0 0-4.4 2.2 2.2 0 0 0 0 4.4',
  meal: 'M7 3v7 M4.5 3v5a2.5 2.5 0 0 0 5 0V3 M7 10v11 M17 3c-2.2 1.8-3 4.5-3 8h3v10',
  stay: 'M3 18V8 M3 14h18v4 M21 14v-2a3 3 0 0 0-3-3h-7v5',
};

const i = (time: string, kind: ItemKind, text: string, detail = ''): Item => ({ time, kind, text, detail });

export const DAYS: Day[] = [
  { n: 1, title: 'Welcome to Tbilisi', route: 'Airport → Tbilisi', drive: '≈ 30 min', stay: 'Tbilisi · [hotel — Rezo to add]',
    items: [i('Arrival', 'drive', 'Airport pickup and transfer to your hotel', '≈ 30 min · timing follows your flight'), i('Evening', 'meal', 'A relaxed first dinner near the hotel', 'Nothing ambitious after a long journey')] },
  { n: 2, title: 'Tbilisi, unhurried', route: 'On foot in the old city', drive: 'No driving', stay: 'Tbilisi · [hotel — Rezo to add]',
    items: [i('09:30', 'visit', 'Old Town on foot, up to Narikala fortress', 'Cable car up, a gentle walk down'), i('12:30', 'meal', 'Lunch with khachapuri and a first glass of qvevri wine'), i('15:00', 'visit', 'The Abanotubani bathhouse district', 'Optional — a rest day is also fine'), i('19:30', 'meal', 'Dinner in a traditional restaurant')] },
  { n: 3, title: 'North on the Military Highway', route: 'Tbilisi → Mtskheta → Ananuri → Gudauri → Stepantsminda', drive: '≈ 3 h 15 m', stay: 'Stepantsminda (Kazbegi) · [guesthouse — Rezo to add]', road: 'tbilisiKazbegi',
    items: [i('09:00', 'drive', 'Leave Tbilisi', '≈ 30 min to Mtskheta'), i('09:30', 'visit', 'Mtskheta: Jvari Monastery and Svetitskhoveli Cathedral', 'Ancient churches above the rivers’ meeting point'), i('11:30', 'drive', 'North on the Georgian Military Highway', '≈ 1 h to Ananuri'), i('12:30', 'visit', 'Ananuri fortress by the reservoir'), i('13:30', 'meal', 'Lunch in the mountains'), i('15:00', 'drive', 'Over the pass to Stepantsminda', '≈ 1 h 45 m with viewpoint stops'), i('17:00', 'stay', 'Check in, evening walk')] },
  { n: 4, title: 'Gergeti and the mountain', route: 'Stepantsminda', drive: '≈ 30 min', stay: 'Stepantsminda · same guesthouse',
    items: [i('09:30', 'visit', 'Gergeti Trinity Church', 'By 4×4 or on foot — Rezo decides on the day, depending on weather'), i('12:30', 'meal', 'Lunch in Stepantsminda'), i('15:00', 'visit', 'Free afternoon', 'A café, a walk, or simply a rest')] },
  { n: 5, title: 'A slower mountain day', route: 'Stepantsminda → Juta valley and back', drive: '≈ 1 h 30 m', stay: 'Stepantsminda · same guesthouse', change: 'new',
    note: 'You asked for another night here, so this day is yours — easy walking, no schedule to beat.',
    items: [i('10:00', 'drive', 'Drive to Juta village', '≈ 45 min on a mountain road'), i('11:00', 'visit', 'Short walk beneath the Chaukhi massif', 'An easy option; Rezo adapts it to the group'), i('13:30', 'meal', 'Lunch in Juta'), i('15:30', 'drive', 'Return to Stepantsminda', '≈ 45 min')] },
  { n: 6, title: 'Down from the mountains to Kakheti', route: 'Stepantsminda → Ananuri → Gombori Pass → Telavi', drive: '≈ 5 h', stay: 'Telavi · [hotel — Rezo to add]', road: 'kazbegiTelavi', change: 'edited',
    note: 'A long road day, so a late start and a proper lunch halfway.',
    items: [i('09:30', 'drive', 'Leave Stepantsminda — a late start', '≈ 2 h 45 m to the lunch stop'), i('12:30', 'meal', 'Long lunch on the way down'), i('14:30', 'drive', 'Over the Gombori Pass to Kakheti', '≈ 2 h 15 m'), i('17:15', 'stay', 'Arrive in Telavi', 'An evening stroll beneath the fortress')] },
  { n: 7, title: 'Wine at the source', route: 'Telavi → Tsinandali → Sighnaghi', drive: '≈ 1 h 45 m', stay: 'Sighnaghi · [guesthouse — Rezo to add]', road: 'telaviSighnaghi',
    items: [i('10:00', 'visit', 'Tsinandali estate and garden'), i('12:00', 'visit', 'A family qvevri winery', '[Winery — Rezo to choose] · wine made in buried clay vessels'), i('13:30', 'meal', 'Long lunch with the winemaker'), i('16:00', 'drive', 'To Sighnaghi', '≈ 1 h'), i('17:30', 'visit', 'The town walls at sunset')] },
  { n: 8, title: 'Across the country to Kutaisi', route: 'Sighnaghi → Gori → Uplistsikhe → Kutaisi', drive: '≈ 6 h', stay: 'Kutaisi · [hotel — Rezo to add]', road: 'sighnaghiKutaisi', change: 'edited',
    note: 'The longest day. I split it at Uplistsikhe so you can walk, eat and stretch before the last stretch.',
    items: [i('08:30', 'drive', 'Leave Sighnaghi', '≈ 2 h 45 m to Gori'), i('11:30', 'visit', 'Uplistsikhe cave town', 'A walk among rock-cut halls'), i('13:00', 'meal', 'Late lunch in Gori'), i('14:30', 'drive', 'On to Kutaisi', '≈ 2 h 30 m'), i('17:30', 'stay', 'Arrive in Kutaisi')] },
  { n: 9, title: 'Monasteries and caves', route: 'Kutaisi and around', drive: '≈ 1 h', stay: 'Kutaisi · same hotel',
    items: [i('09:30', 'visit', 'Gelati Monastery'), i('11:30', 'visit', 'Motsameta Monastery'), i('13:00', 'meal', 'Lunch in Kutaisi'), i('15:00', 'visit', 'Prometheus Cave — or a free afternoon', 'Your choice on the day')] },
  { n: 10, title: 'To the Black Sea', route: 'Kutaisi → Batumi', drive: '≈ 2 h 30 m', stay: 'Batumi · [hotel — Rezo to add]', road: 'kutaisiBatumi',
    items: [i('10:00', 'drive', 'Leave Kutaisi', '≈ 2 h 30 m with a coffee stop'), i('13:00', 'stay', 'Arrive in Batumi and check in'), i('15:00', 'visit', 'The boulevard and the old town'), i('18:30', 'meal', 'Dinner by the sea at sunset')] },
  { n: 11, title: 'Farewell', route: 'Batumi → airport', drive: '≈ 20 min', stay: '—',
    items: [i('Morning', 'visit', 'One last coffee by the sea'), i('Transfer', 'drive', 'Airport transfer', '≈ 20 min · timing follows your flight')] },
];

export const roadPath = (d: Day) => (d.road ? roads[d.road] : '');

export const PLACES = [
  { n: 'Tbilisi', sub: 'Days 1–2', x: 681, y: 387, ds: [1, 2], tx: 698, ty: 424, ty2: 448, a: 'start' },
  { n: 'Kazbegi', sub: 'Days 3–5', x: 662, y: 228, ds: [3, 4, 5], tx: 644, ty: 214, ty2: 238, a: 'end' },
  { n: 'Telavi', sub: 'Day 6', x: 767, y: 354, ds: [6], tx: 782, ty: 342, ty2: 366, a: 'start' },
  { n: 'Sighnaghi', sub: 'Day 7', x: 824, y: 405, ds: [7], tx: 836, ty: 446, ty2: 470, a: 'end' },
  { n: 'Kutaisi', sub: 'Days 8–9', x: 419, y: 294, ds: [8, 9], tx: 436, ty: 290, ty2: 314, a: 'start' },
  { n: 'Batumi', sub: 'Days 10–11', x: 283, y: 405, ds: [10, 11], tx: 266, ty: 402, ty2: 426, a: 'end' },
] as const;

export const LINES = [
  { label: 'Private vehicle and driver', v2: 1760, v1: 1560 },
  { label: 'Accommodation, 10 nights', v2: 1540, v1: 1400 },
  { label: 'Planning, guiding and support', v2: 660, v1: 600 },
  { label: 'Visits and entrance fees', v2: 390, v1: 390 },
  { label: 'Meals included', v2: 300, v1: 300 },
];

export const eur = (n: number) => `€${n.toLocaleString('en-US')}`;
