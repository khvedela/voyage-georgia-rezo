/** Data and pure logic for the trip builder: no UI, so it is easy to test and to keep in sync with the design. */

export type Id = string;

export interface Interest { id: Id; label: string; photo?: 'svaneti' | 'kakheti' | 'kutaisi' | 'tbilisi' | 'tusheti' | 'batumi' }

export const TILES: Interest[] = [
  { id: 'mountains', label: 'High mountains', photo: 'svaneti' },
  { id: 'wine', label: 'Wine & vineyards', photo: 'kakheti' },
  { id: 'churches', label: 'Monasteries & frescoes', photo: 'kutaisi' },
  { id: 'history', label: 'Old towns & cities', photo: 'tbilisi' },
  { id: 'adventure', label: 'Remote valleys by 4×4', photo: 'tusheti' },
  { id: 'sea', label: 'The Black Sea', photo: 'batumi' },
];
export const MORE: Interest[] = [
  { id: 'food', label: 'Food & supra feasts' }, { id: 'hiking', label: 'Walking & hiking' },
  { id: 'villages', label: 'Villages & local life' }, { id: 'nature', label: 'Canyons & caves' },
];
export const ALL = [...TILES, ...MORE];
export const labelOf = (id: Id) => ALL.find((i) => i.id === id)?.label ?? id;

export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;

const SEASON: Record<number, [string, string]> = {
  1: ['Winter', 'Snow in the mountains and skiing at Gudauri and Bakuriani. Cities, wine cellars and food are at their cosiest. High roads can close after snowfall, and Tusheti is cut off until summer.'],
  3: ['Early spring', 'The lowlands turn green and orchards blossom. Tbilisi, Kakheti and the west are pleasant; high mountains are still under snow.'],
  5: ['Late spring', 'Green, fresh and mostly uncrowded. Good for nearly everything; the Tusheti road usually opens in June.'],
  7: ['Summer', 'The best time for high mountains, Svaneti and hiking. Tbilisi and the lowlands get hot, and the coast is at its busiest.'],
  9: ['Autumn', 'Harvest time in Kakheti and clear mountain views. One of the most popular seasons. Tusheti’s road usually closes during October.'],
  11: ['Late autumn', 'Quiet and good value. Lovely for Tbilisi, wine and food; mountain weather turns and some high roads close.'],
};

export function season(month: string) {
  const mi = MONTHS.indexOf(month as (typeof MONTHS)[number]) + 1;
  if (mi === 0) return { key: 0, name: '', text: '', tushetiOpen: true };
  const key = mi <= 2 || mi === 12 ? 1 : mi <= 4 ? 3 : mi <= 6 ? 5 : mi <= 8 ? 7 : mi <= 10 ? 9 : 11;
  return { key, name: `${SEASON[key][0]} · ${month}`, text: SEASON[key][1], tushetiOpen: mi >= 6 && mi <= 10 };
}

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

export const MOBS = [
  { id: 'none', label: 'Nothing special' }, { id: 'wheel', label: 'Someone uses a wheelchair' },
  { id: 'walk', label: 'Limited walking or stairs' }, { id: 'other', label: 'Something else' },
];
export const PACES = [
  { id: 'slow', label: 'Slow & spacious', note: 'Short drives, long lunches and time to linger. Rest days included.', xs: [12, 60, 108] },
  { id: 'balanced', label: 'Balanced', note: 'A mix of fuller days and easy ones. The most popular choice.', xs: [10, 35, 60, 85, 110] },
  { id: 'full', label: 'Full & active', note: 'See as much as possible. Early starts are fine.', xs: [8, 23, 38, 53, 68, 83, 98, 112] },
];
export const BUDGETS = [
  { id: 'simple', label: 'Simple and good value' }, { id: 'comfort', label: 'Comfortable' },
  { id: 'treat', label: 'Treat ourselves' }, { id: 'advise', label: 'Not sure, advise me' },
];
export const CHANNELS = ['WhatsApp', 'Messenger', 'Email'] as const;
export type Channel = (typeof CHANNELS)[number];

export interface State {
  step: number; from: number; text: string; picks: Id[]; surprise: boolean; month: string; flex: boolean;
  days: number; daysOpen: boolean; adults: number; kids: number; mob: Id[]; pace: Id; budget: Id; extra: string;
  name: string; contact: string; channel: Channel; sample: Id; mode: 'guided' | 'write';
}
export const INITIAL: State = {
  step: 0, from: 0, text: '', picks: [], surprise: false, month: '', flex: false, days: 10, daysOpen: false, adults: 2, kids: 0,
  mob: ['none'], pace: 'balanced', budget: '', extra: '', name: '', contact: '', channel: 'WhatsApp', sample: '', mode: 'guided',
};

export const SAMPLES: { id: 'classic' | 'wild' | 'first'; title: string; meta: string; route: string; photo: Interest['photo']; set: Partial<State> }[] = [
  { id: 'classic', title: 'Mountains, wine and a little sea', meta: '10 days · balanced', route: 'High mountains, Kakheti’s vineyards, old monasteries and a few days by the Black Sea', photo: 'svaneti', set: { picks: ['mountains', 'wine', 'churches', 'sea'], days: 10, pace: 'balanced', month: 'Sep' } },
  { id: 'wild', title: 'Wine valleys to high villages', meta: '8 days · adventurous', route: 'Kakheti’s cellars, then a 4×4 over the Abano Pass into Tusheti’s villages', photo: 'tusheti', set: { picks: ['wine', 'adventure', 'villages', 'hiking'], days: 8, pace: 'full', month: 'Jul' } },
  { id: 'first', title: 'A first taste of Georgia', meta: '6 days · slow', route: 'Tbilisi’s old town, Mtskheta and a day among Kakheti’s vines', photo: 'tbilisi', set: { picks: ['history', 'churches', 'wine', 'food'], days: 6, pace: 'slow', month: '' } },
];

export function applySample(id: string): Partial<State> | null {
  const x = SAMPLES.find((s) => s.id === id);
  if (!x) return null;
  return { sample: x.id, mode: 'guided', surprise: false, flex: !x.set.month, daysOpen: false, step: 5, from: 9, ...x.set };
}

export const EXAMPLES = [
  'Ten days in September: mountains, wine, old churches and a little sea, without long drives every day.',
  'A slow week for two: good food, small villages and a couple of nights in the mountains.',
  'Four of us, one uses a wheelchair. We love history and long lunches.',
];

export const TIPS: Record<number, string> = {
  0: 'You can’t get this wrong. Even a single line is enough for Rezo to start, and he’ll ask about anything he needs.',
  9: 'Every sample can be stretched, shortened or mixed. Pick the one that feels closest, not perfect.',
  8: 'Mention what you’d rather avoid too, like long drives or early starts. It helps as much as what you want.',
  1: 'Mountains and the sea are a long way apart. If you want both, a few more days keeps the driving comfortable.',
  3: 'Travelling with older parents or small children? Slower days and fewer hotel changes make a big difference.',
  4: 'A slow pace usually means staying two or three nights in each place, so you unpack less and see more.',
  5: 'After you send this, Rezo replies personally. Nothing is booked and nothing is charged until you both agree.',
  6: 'While you wait, have a look at a sample itinerary to see how Rezo lays out each day.',
};

export function derive(s: State) {
  const picks = s.surprise ? ['wine', 'mountains', 'churches', 'food', 'history'] : s.picks;
  const se = season(s.month);
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
  const nightsText = hasSketch
    ? `About ${perStop < 1.6 ? '1–2' : perStop < 2.6 ? '2–3' : '3–4'} nights in each place over ${days} days. Rezo sets the real order, roads and timing.`
    : '';
  const recN = Math.max(1, Math.min(5, eligible.length));
  const lenTip = picks.length
    ? `For what you’ve picked, about ${recN * 2 + 1}–${recN * 3 + 1} days lets you enjoy it without rushing. Fewer days is fine too: Rezo simply chooses fewer places.`
    : 'Most first trips are 7 to 12 days. Shorter works well if you focus on one or two regions.';

  const pins = [TBILISI as { n: string; x: number; y: number; left?: 1 }, ...REG].map((p) => {
    const idx = route.map((r) => r.n).indexOf(p.n);
    const hit = p.n === 'Tbilisi' ? true : scored.some((x) => x.r.n === p.n && x.sc > 0);
    const inR = idx > -1 && (hasSketch || p.n !== 'Tbilisi');
    const lw = p.n.length * 9.4 + 18;
    const left = p.x > 820 || !!p.left;
    return {
      x: p.x, y: p.y, n: p.n, r: inR ? 13 : hit ? 7 : 5, fill: inR ? '#D62839' : '#FFFFFF',
      stroke: inR ? '#FFFFFF' : hit ? '#14161A' : '#A1A1AA', num: inR ? String(idx + 1) : '', ny: p.y + 5.5,
      op: inR || hit ? 1 : 0.55, lop: inR || hit ? 1 : 0, lw, lx: left ? p.x - 20 - lw : p.x + 18, ly: p.y - 13,
      tx: left ? p.x - 20 - lw + 9 : p.x + 27, ty: p.y + 5.5,
    };
  });

  return {
    picks, days, blockedT, hasSketch, route, pins, nightsText, lenTip,
    sketchPts: route.map((p) => `${p.x},${p.y}`).join(' '),
    sketchText: route.map((p) => p.n).join(' → '),
  };
}

export function texts(s: State) {
  const travellers = `${s.adults} ${s.adults === 1 ? 'adult' : 'adults'}${s.kids ? `, ${s.kids} ${s.kids === 1 ? 'child' : 'children'}` : ''}`;
  const access = s.mob.includes('none') ? 'Nothing special' : s.mob.map((m) => MOBS.find((o) => o.id === m)?.label).join(', ');
  const interests = s.surprise ? 'Rezo’s favourites' : s.picks.length ? s.picks.map(labelOf).join(', ') : 'Not chosen yet';
  const when = s.flex ? 'Not decided yet' : s.month || 'Not chosen yet';
  const length = s.daysOpen ? 'Rezo suggests' : `${s.days} days`;
  const pace = PACES.find((p) => p.id === s.pace)?.label ?? 'Not chosen';
  const budget = BUDGETS.find((b) => b.id === s.budget)?.label ?? 'Rezo will suggest';
  return { travellers, access, interests, when, length, pace, budget };
}

/** Plain-text summary used for the WhatsApp / email hand-off and the JSON payload. */
export function summaryText(s: State): string {
  const t = texts(s);
  const lines = s.mode === 'write'
    ? [`In my words: ${s.text || '(nothing written)'}`]
    : [`Drawn to: ${t.interests}`, `When: ${t.when} · ${t.length}`, `Who: ${t.travellers}`, `Access: ${t.access}`, `Pace: ${t.pace}`, `Budget feeling: ${t.budget}`];
  if (s.extra.trim()) lines.push(`Anything else: ${s.extra.trim()}`);
  return [`Hello Rezo, I’m ${s.name.trim() || 'a traveller'}. I’d like to plan a trip to Georgia.`, '', ...lines, '', `Please reply on ${s.channel}.`].join('\n');
}
