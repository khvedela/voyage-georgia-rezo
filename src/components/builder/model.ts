/**
 * Data and pure logic for the trip builder: no UI, so it is easy to test and to keep in sync with the design.
 * Structure only (ids, coordinates, scores, photo ids): every visible word comes from the builder dictionary
 * (src/i18n/<lang>/builder.ts), passed in by the functions that produce text.
 */
import type { Locale } from '../../i18n/config';
import type { Dict } from '../../i18n/dictionaries';
import { fmt, listFormat, plural } from '../../i18n/utils';

export type Id = string;
export type BuilderDict = Dict['builder'];
export type Places = Dict['common']['places'];

/** Look up a dictionary entry by an id that comes from state (falls back to undefined for unknown ids). */
const pick = <T extends object>(o: T, k: string): T[keyof T] | undefined => (o as Record<string, T[keyof T]>)[k];

/** Localized place name, keyed by its English name; unknown names are shown as they are. */
export const placeName = (places: Places, n: string) => pick(places, n) ?? n;

export interface Interest { id: Id; photo?: 'svaneti' | 'kakheti' | 'kutaisi' | 'tbilisi' | 'tusheti' | 'batumi' }

export const TILES: Interest[] = [
  { id: 'mountains', photo: 'svaneti' },
  { id: 'wine', photo: 'kakheti' },
  { id: 'churches', photo: 'kutaisi' },
  { id: 'history', photo: 'tbilisi' },
  { id: 'adventure', photo: 'tusheti' },
  { id: 'sea', photo: 'batumi' },
];
export const MORE: Interest[] = [{ id: 'food' }, { id: 'hiking' }, { id: 'villages' }, { id: 'nature' }];
export const ALL = [...TILES, ...MORE];
export const labelOf = (t: BuilderDict, id: Id) => pick(t.interests.labels, id) ?? id;

/** Month values kept in state, the URL and the payload (language-neutral). Display names come from t.dates.months. */
export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;
export const monthName = (t: BuilderDict, month: string) => {
  const i = MONTHS.indexOf(month as (typeof MONTHS)[number]);
  return i === -1 ? month : t.dates.months[i] ?? month;
};

const SEASON: Record<number, keyof BuilderDict['dates']['seasons']> = {
  1: 'winter', 3: 'earlySpring', 5: 'lateSpring', 7: 'summer', 9: 'autumn', 11: 'lateAutumn',
};

export function season(t: BuilderDict, month: string) {
  const mi = MONTHS.indexOf(month as (typeof MONTHS)[number]) + 1;
  if (mi === 0) return { key: 0, name: '', text: '', tushetiOpen: true };
  const key = mi <= 2 || mi === 12 ? 1 : mi <= 4 ? 3 : mi <= 6 ? 5 : mi <= 8 ? 7 : mi <= 10 ? 9 : 11;
  const se = t.dates.seasons[SEASON[key]];
  return { key, name: fmt(t.dates.seasonLabel, { season: se.name, month: monthName(t, month) }), text: se.text, tushetiOpen: mi >= 6 && mi <= 10 };
}

/** `n` is the English place name: the key into common.places and a stable id. */
export interface Region { n: string; x: number; y: number; e?: 1; left?: 1; t: Record<string, number>; summer?: boolean }
export const TBILISI = { n: 'Tbilisi', x: 681, y: 387 };
export const REG: Region[] = [
  { n: 'Kakheti', x: 767, y: 354, e: 1, t: { wine: 3, food: 2, villages: 1, history: 1 } },
  { n: 'Tusheti', x: 787, y: 276, e: 1, t: { adventure: 3, hiking: 2, villages: 2 }, summer: true },
  { n: 'Kazbegi', x: 662, y: 228, e: 1, t: { mountains: 3, hiking: 2, churches: 1 } },
  { n: 'Mtskheta', x: 672, y: 366, e: 1, left: 1, t: { churches: 2, history: 2 } },
  { n: 'Borjomi', x: 507, y: 367, t: { nature: 2, hiking: 1 } },
  { n: 'Vardzia', x: 491, y: 445, t: { history: 2, churches: 2 } },
  { n: 'Kutaisi', x: 419, y: 294, t: { churches: 2, nature: 2, history: 1, food: 1 } },
  { n: 'Svaneti', x: 420, y: 162, t: { mountains: 3, villages: 2, hiking: 3, adventure: 1 } },
  { n: 'Batumi', x: 283, y: 405, t: { sea: 3, food: 1 } },
];

/** Access needs (labels in t.group.access). */
export const MOBS: Id[] = ['none', 'wheel', 'walk', 'other'];
/** Paces (labels and notes in t.pace.options); xs are the dots of the little pace diagram. */
export const PACES = [
  { id: 'slow', xs: [12, 60, 108] },
  { id: 'balanced', xs: [10, 35, 60, 85, 110] },
  { id: 'full', xs: [8, 23, 38, 53, 68, 83, 98, 112] },
];
/** Budget feelings (labels in t.pace.budgets). */
export const BUDGETS: Id[] = ['simple', 'comfort', 'treat', 'advise'];
export const CHANNELS = ['WhatsApp', 'Messenger', 'Email'] as const;
export type Channel = (typeof CHANNELS)[number];

export const paceLabel = (t: BuilderDict, id: Id) => pick(t.pace.options, id)?.label;
export const paceNote = (t: BuilderDict, id: Id) => pick(t.pace.options, id)?.note;
export const budgetLabel = (t: BuilderDict, id: Id) => pick(t.pace.budgets, id);
export const accessLabel = (t: BuilderDict, id: Id) => pick(t.group.access, id) ?? id;

export interface State {
  step: number; from: number; text: string; picks: Id[]; surprise: boolean; month: string; flex: boolean;
  days: number; daysOpen: boolean; adults: number; kids: number; mob: Id[]; pace: Id; budget: Id; extra: string;
  name: string; contact: string; channel: Channel; sample: Id; mode: 'guided' | 'write';
}
export const INITIAL: State = {
  step: 0, from: 0, text: '', picks: [], surprise: false, month: '', flex: false, days: 10, daysOpen: false, adults: 2, kids: 0,
  mob: ['none'], pace: 'balanced', budget: '', extra: '', name: '', contact: '', channel: 'WhatsApp', sample: '', mode: 'guided',
};

/** Sample trips (title, meta and route in t.samples.items). */
export const SAMPLES: { id: 'classic' | 'wild' | 'first'; photo: Interest['photo']; set: Partial<State> }[] = [
  { id: 'classic', photo: 'svaneti', set: { picks: ['mountains', 'wine', 'churches', 'sea'], days: 10, pace: 'balanced', month: 'Sep' } },
  { id: 'wild', photo: 'tusheti', set: { picks: ['wine', 'adventure', 'villages', 'hiking'], days: 8, pace: 'full', month: 'Jul' } },
  { id: 'first', photo: 'tbilisi', set: { picks: ['history', 'churches', 'wine', 'food'], days: 6, pace: 'slow', month: '' } },
];

export function applySample(id: string): Partial<State> | null {
  const x = SAMPLES.find((s) => s.id === id);
  if (!x) return null;
  return { sample: x.id, mode: 'guided', surprise: false, flex: !x.set.month, daysOpen: false, step: 5, from: 9, ...x.set };
}

/** Which "Good to know" tip each screen shows (step 2 picks its own, see the component). */
export const TIPS: Record<number, keyof BuilderDict['tips']> = {
  0: 'start', 9: 'samples', 8: 'write', 1: 'interests', 3: 'group', 4: 'pace', 5: 'send', 6: 'done',
};

export function derive(s: State, lang: Locale, t: BuilderDict, places: Places) {
  const picks = s.surprise ? ['wine', 'mountains', 'churches', 'food', 'history'] : s.picks;
  const se = season(t, s.month);
  const blockedT = !se.tushetiOpen && picks.includes('adventure');
  const scored = REG.map((r, i) => ({ r, i, sc: picks.reduce((a, p) => a + (r.t[p] || 0), 0) }));
  let eligible = scored.filter((x) => x.sc > 0 && !(x.r.summer && !se.tushetiOpen));
  const days = s.daysOpen ? 10 : s.days;
  if (days <= 8 && eligible.length) {
    const east = eligible.filter((x) => x.r.e).reduce((a, x) => a + x.sc, 0);
    const west = eligible.filter((x) => !x.r.e).reduce((a, x) => a + x.sc, 0);
    eligible = eligible.filter((x) => (east >= west ? !!x.r.e : !x.r.e));
  }
  const per = { slow: 3.2, balanced: 2.5, full: 2 }[(s.pace || 'balanced') as 'slow' | 'balanced' | 'full'];
  const nStops = Math.max(1, Math.min(6, Math.round((days - 1) / per)));
  const chosen = eligible.slice().sort((a, b) => b.sc - a.sc || a.i - b.i).slice(0, nStops).sort((a, b) => a.i - b.i);
  const route: { n: string; x: number; y: number }[] = [TBILISI, ...chosen.map((c) => c.r)];
  const hasSketch = chosen.length > 0;
  const nights = Math.max(1, days - 1);
  const perStop = nights / route.length;
  const [lo, hi] = perStop < 1.6 ? [1, 2] : perStop < 2.6 ? [2, 3] : [3, 4];
  const nightsText = hasSketch
    ? fmt(t.aside.nightsEach, { nights: plural(lang, hi, t.units.nightsRange, { from: lo }), days: plural(lang, days, t.units.days) })
    : '';
  const recN = Math.max(1, Math.min(5, eligible.length));
  const lenTip = picks.length
    ? plural(lang, recN * 3 + 1, t.dates.lenTipPicked, { from: recN * 2 + 1 })
    : t.dates.lenTipNone;

  const pins = [TBILISI as { n: string; x: number; y: number; left?: 1 }, ...REG].map((p) => {
    const idx = route.map((r) => r.n).indexOf(p.n);
    const hit = p.n === 'Tbilisi' ? true : scored.some((x) => x.r.n === p.n && x.sc > 0);
    const inR = idx > -1 && (hasSketch || p.n !== 'Tbilisi');
    const label = placeName(places, p.n);
    const lw = label.length * 9.4 + 18;
    const left = p.x > 820 || !!p.left;
    return {
      x: p.x, y: p.y, n: p.n, label, r: inR ? 13 : hit ? 7 : 5, fill: inR ? '#D62839' : '#FFFFFF',
      stroke: inR ? '#FFFFFF' : hit ? '#1D2A35' : '#8B99A3', num: inR ? String(idx + 1) : '', ny: p.y + 5.5,
      op: inR || hit ? 1 : 0.55, lop: inR || hit ? 1 : 0, lw, lx: left ? p.x - 20 - lw : p.x + 18, ly: p.y - 13,
      tx: left ? p.x - 20 - lw + 9 : p.x + 27, ty: p.y + 5.5,
    };
  });

  return {
    picks, days, blockedT, hasSketch, route, pins, nightsText, lenTip,
    sketchPts: route.map((p) => `${p.x},${p.y}`).join(' '),
    sketchText: route.map((p) => placeName(places, p.n)).join(' → '),
  };
}

export function texts(s: State, lang: Locale, t: BuilderDict) {
  const a = t.answers;
  const adults = plural(lang, s.adults, t.units.adults);
  const travellers = s.kids ? fmt(a.travellersWithKids, { adults, children: plural(lang, s.kids, t.units.children) }) : adults;
  const hasAccess = !s.mob.includes('none');
  const access = hasAccess ? listFormat(lang, s.mob.map((m) => accessLabel(t, m))) : t.group.access.none;
  const interests = s.surprise ? a.favourites : s.picks.length ? listFormat(lang, s.picks.map((id) => labelOf(t, id))) : a.notChosenYet;
  const when = s.flex ? a.notDecided : s.month ? monthName(t, s.month) : a.notChosenYet;
  const length = s.daysOpen ? a.rezoSuggests : plural(lang, s.days, t.units.days);
  const pace = paceLabel(t, s.pace) ?? a.notChosen;
  const budget = budgetLabel(t, s.budget) ?? a.rezoWillSuggest;
  return { travellers, access, hasAccess, interests, when, length, pace, budget };
}

/** Plain-text summary used for the WhatsApp / email hand-off and the JSON payload, in the visitor's language. */
export function summaryText(s: State, lang: Locale, t: BuilderDict): string {
  const x = texts(s, lang, t);
  const m = t.message;
  const lines = s.mode === 'write'
    ? [fmt(m.words, { text: s.text || m.nothingWritten })]
    : [
      fmt(m.drawnTo, { value: x.interests }),
      fmt(m.when, { when: x.when, length: x.length }),
      fmt(m.who, { value: x.travellers }),
      fmt(m.access, { value: x.access }),
      fmt(m.pace, { value: x.pace }),
      fmt(m.budget, { value: x.budget }),
    ];
  if (s.extra.trim()) lines.push(fmt(m.extra, { value: s.extra.trim() }));
  return [
    fmt(m.hello, { name: s.name.trim() || m.anonymous }), '', ...lines, '',
    fmt(m.replyOn, { channel: t.send.channels[s.channel] }),
  ].join('\n');
}
