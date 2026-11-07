import { roads, type RoadId } from './routes';
import { formatNumber, type Locale } from '../i18n/utils';

/**
 * Structure of the sample proposal shown in the customer-facing Itinerary Studio: day numbers, item kinds,
 * clock times, roads, change flags, map coordinates and prices. All words (titles, routes, drive times, item
 * texts, notes, line labels) live in the dictionary under studio.trip (src/i18n/<lang>/studio.ts), looked up by
 * day number, item index and line id. All names, dates, prices and times are illustrative.
 */
export type ItemKind = 'drive' | 'visit' | 'meal' | 'stay';
export type DayNo = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;
/** Item times that are words rather than clock times (translated via studio.trip.times). */
export type TimeWord = 'arrival' | 'evening' | 'morning' | 'transfer';
export type LineId = 'vehicle' | 'stays' | 'guiding' | 'visits' | 'meals';

/** `time` is a clock time ('09:30', never translated) or a TimeWord. Its words are studio.trip.days[n].items[i]. */
export interface Item { time: string; kind: ItemKind }
export interface Day {
  n: DayNo; road?: RoadId;
  change?: 'new' | 'edited';
  /** The day carries a note from Rezo (studio.trip.days[n].note). */
  note?: boolean;
  items: Item[];
}

export const TIME_WORDS: readonly TimeWord[] = ['arrival', 'evening', 'morning', 'transfer'];
export const isTimeWord = (t: string): t is TimeWord => (TIME_WORDS as readonly string[]).includes(t);

export const ICON: Record<ItemKind, string> = {
  drive: 'M3 14l2-6h14l2 6v4H3z M7 18v2 M17 18v2',
  visit: 'M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z M12 12a2.2 2.2 0 1 0 0-4.4 2.2 2.2 0 0 0 0 4.4',
  meal: 'M7 3v7 M4.5 3v5a2.5 2.5 0 0 0 5 0V3 M7 10v11 M17 3c-2.2 1.8-3 4.5-3 8h3v10',
  stay: 'M3 18V8 M3 14h18v4 M21 14v-2a3 3 0 0 0-3-3h-7v5',
};

const i = (time: string, kind: ItemKind): Item => ({ time, kind });

export const DAYS: Day[] = [
  { n: 1, items: [i('arrival', 'drive'), i('evening', 'meal')] },
  { n: 2, items: [i('09:30', 'visit'), i('12:30', 'meal'), i('15:00', 'visit'), i('19:30', 'meal')] },
  { n: 3, road: 'tbilisiKazbegi',
    items: [i('09:00', 'drive'), i('09:30', 'visit'), i('11:30', 'drive'), i('12:30', 'visit'), i('13:30', 'meal'), i('15:00', 'drive'), i('17:00', 'stay')] },
  { n: 4, items: [i('09:30', 'visit'), i('12:30', 'meal'), i('15:00', 'visit')] },
  { n: 5, change: 'new', note: true, items: [i('10:00', 'drive'), i('11:00', 'visit'), i('13:30', 'meal'), i('15:30', 'drive')] },
  { n: 6, road: 'kazbegiTelavi', change: 'edited', note: true, items: [i('09:30', 'drive'), i('12:30', 'meal'), i('14:30', 'drive'), i('17:15', 'stay')] },
  { n: 7, road: 'telaviSighnaghi', items: [i('10:00', 'visit'), i('12:00', 'visit'), i('13:30', 'meal'), i('16:00', 'drive'), i('17:30', 'visit')] },
  { n: 8, road: 'sighnaghiKutaisi', change: 'edited', note: true,
    items: [i('08:30', 'drive'), i('11:30', 'visit'), i('13:00', 'meal'), i('14:30', 'drive'), i('17:30', 'stay')] },
  { n: 9, items: [i('09:30', 'visit'), i('11:30', 'visit'), i('13:00', 'meal'), i('15:00', 'visit')] },
  { n: 10, road: 'kutaisiBatumi', items: [i('10:00', 'drive'), i('13:00', 'stay'), i('15:00', 'visit'), i('18:30', 'meal')] },
  { n: 11, items: [i('morning', 'visit'), i('transfer', 'drive')] },
];

export const roadPath = (d: Day) => (d.road ? roads[d.road] : '');

/** Map pins: `n` is the English place name, a key of common.places; `ds` are the days spent there. */
export const PLACES = [
  { n: 'Tbilisi', x: 681, y: 387, ds: [1, 2], tx: 698, ty: 424, ty2: 448, a: 'start' },
  { n: 'Kazbegi', x: 662, y: 228, ds: [3, 4, 5], tx: 644, ty: 214, ty2: 238, a: 'end' },
  { n: 'Telavi', x: 767, y: 354, ds: [6], tx: 782, ty: 342, ty2: 366, a: 'start' },
  { n: 'Sighnaghi', x: 824, y: 405, ds: [7], tx: 836, ty: 446, ty2: 470, a: 'end' },
  { n: 'Kutaisi', x: 419, y: 294, ds: [8, 9], tx: 436, ty: 290, ty2: 314, a: 'start' },
  { n: 'Batumi', x: 283, y: 405, ds: [10, 11], tx: 266, ty: 402, ty2: 426, a: 'end' },
] as const;

/** Price lines of the sample quotation (v1 → v2), labels in studio.trip.quote.lines. */
export const LINES: { id: LineId; v2: number; v1: number }[] = [
  { id: 'vehicle', v2: 1760, v1: 1560 },
  { id: 'stays', v2: 1540, v1: 1400 },
  { id: 'guiding', v2: 660, v1: 600 },
  { id: 'visits', v2: 390, v1: 390 },
  { id: 'meals', v2: 300, v1: 300 },
];

/** Whole euros in the page's language: en €1,760 · ru 1 760 € · lv 1760 €. `signed` adds the sign: +€400. */
export const eur = (lang: Locale, n: number, signed = false) =>
  formatNumber(lang, n, { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0, signDisplay: signed ? 'always' : 'auto' });
