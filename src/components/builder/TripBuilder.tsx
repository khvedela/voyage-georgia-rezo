import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import type { ComponentChildren } from 'preact';
import type { Locale } from '../../i18n/config';
import type { Dict } from '../../i18n/dictionaries';
import { fmt, l, localizeHtml, plural } from '../../i18n/utils';
import {
  BUDGETS, CHANNELS, INITIAL, MOBS, MONTHS, MORE, PACES, SAMPLES, TILES, TIPS,
  accessLabel, applySample, budgetLabel, derive, labelOf, monthName, paceLabel, paceNote, season, summaryText, texts, type State,
} from './model';

export interface BuilderProps {
  lang: Locale;
  /** The builder dictionary for `lang` (t.builder). */
  t: Dict['builder'];
  /** Localized place names (t.common.places), for the map pins and the route line. */
  places: Dict['common']['places'];
  /** Optimised thumbnail URLs for the six places, keyed by photo id. */
  photos: Record<string, string>;
  mapSrc: string;
  endpoint?: string;
  whatsapp?: string;
  email?: string;
}

const Arrow = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);
const Chevron = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1D2A35" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
);
const Check = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5 9-10" /></svg>
);

const Chip = ({ on, onClick, soft, children, style }: { on?: boolean; onClick: () => void; soft?: boolean; children: ComponentChildren; style?: string }) => (
  <button type="button" class={`tb-chip${soft ? ' soft' : ''}`} aria-pressed={on ? 'true' : 'false'} onClick={onClick} style={style}>{children}</button>
);

const Stepper = ({ downLabel, upLabel, value, onDown, onUp, big = 44 }: { downLabel: string; upLabel: string; value: number | string; onDown: () => void; onUp: () => void; big?: number }) => (
  <div style="display:flex;align-items:center;gap:14px">
    <button type="button" class="tb-step" aria-label={downLabel} onClick={onDown}>−</button>
    <span class="disp" style={`min-width:44px;text-align:center;font-weight:600;font-size:${big}px;line-height:1;font-variant-numeric:tabular-nums`} aria-live="polite">{value}</span>
    <button type="button" class="tb-step" aria-label={upLabel} onClick={onUp}>+</button>
  </div>
);

export default function TripBuilder({ lang, t: tr, places, photos, mapSrc, endpoint, whatsapp, email }: BuilderProps) {
  const [s, setS] = useState<State>(INITIAL);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [delivery, setDelivery] = useState<'sent' | 'handoff' | 'none'>('sent');
  const heading = useRef<HTMLHeadingElement>(null);
  const set = (o: Partial<State>) => setS((p) => ({ ...p, ...o }));
  const go = (n: number) => () => setS((p) => ({ ...p, step: n, from: p.step }));
  const d = useMemo(() => derive(s, lang, tr, places), [s, lang, tr, places]);
  const t = texts(s, lang, tr);
  const se = season(tr, s.month);
  const message = summaryText(s, lang, tr);
  const firstName = s.name.trim().split(' ')[0] || tr.done.traveller;

  // Entry points from the rest of the site: ?sample=<id> (example journeys) and the "start with a sentence" box.
  useEffect(() => {
    try {
      const sample = new URLSearchParams(location.search).get('sample');
      const fromSample = sample ? applySample(sample) : null;
      if (fromSample) { setS((p) => ({ ...p, ...fromSample })); return; }
      const idea = sessionStorage.getItem('vgr:idea');
      if (idea) { sessionStorage.removeItem('vgr:idea'); setS((p) => ({ ...p, step: 8, mode: 'write', text: idea })); }
    } catch { /* blocked storage or an unusual URL: start from the beginning */ }
  }, []);

  // Move focus to the new step's heading so screen-reader and keyboard users are not left behind.
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    heading.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }, [s.step]);

  const toggle = (id: string) => set({ picks: s.picks.includes(id) ? s.picks.filter((x) => x !== id) : [...s.picks, id], surprise: false });
  const inFlow = s.step >= 1 && s.step <= 5;
  const ready = s.name.trim().length > 1 && s.contact.trim().length > 4;
  const notReady = s.step === 5 && !ready;
  const backTo: Record<number, number> = { 1: 0, 2: 1, 3: 2, 4: 3, 5: s.mode === 'write' ? 8 : s.sample && s.from === 9 ? 9 : 4, 8: 0, 9: 0 };
  const nextTo: Record<number, number> = { 1: 2, 2: 3, 3: 4, 4: 5, 5: 6, 8: 5 };
  const left = ({ 1: tr.nav.timeLeft.interests, 2: tr.nav.timeLeft.dates, 3: tr.nav.timeLeft.group, 4: tr.nav.timeLeft.pace } as Record<number, string>)[s.step] ?? '';
  const showNav = inFlow || s.step === 8 || s.step === 9;

  async function submit() {
    setError('');
    const payload = {
      source: 'design-my-trip', lang, submittedAt: new Date().toISOString(), mode: s.mode, name: s.name.trim(), contact: s.contact.trim(), channel: s.channel,
      answers: { text: s.text, interests: s.surprise ? ['rezos-favourites'] : s.picks, month: s.flex ? null : s.month || null, flexibleDates: s.flex, days: s.daysOpen ? null : s.days, adults: s.adults, children: s.kids, access: s.mob, pace: s.pace, budget: s.budget || null, extra: s.extra.trim(), sample: s.sample || null },
      message,
    };
    if (endpoint) {
      setSending(true);
      try {
        const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(payload) });
        if (!res.ok) throw new Error(String(res.status));
        setDelivery('sent');
        set({ step: 6, from: 5 });
      } catch {
        setError(tr.send.error);
      } finally {
        setSending(false);
      }
      return;
    }
    // No form backend configured: hand the message to the traveller's own WhatsApp / mail app.
    const target = s.channel === 'Email' ? mail || wa : wa || mail;
    if (target) { window.open(target, '_blank', 'noopener'); setDelivery('handoff'); } else setDelivery('none');
    set({ step: 6, from: 5 });
  }

  const wa = whatsapp ? `https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}` : '';
  const mail = email ? `mailto:${email}?subject=${encodeURIComponent(tr.message.subject)}&body=${encodeURIComponent(message)}` : '';

  const progress = [1, 2, 3, 4, 5].map((n, k) => ({
    n, label: [tr.header.steps.interests, tr.header.steps.dates, tr.header.steps.group, tr.header.steps.pace, tr.header.steps.send][k],
    st: s.step === n ? 'now' : s.step > n && s.step <= 5 ? 'done' : s.step === 6 ? 'done' : 'todo',
    locked: !(s.step >= n || s.sample),
  }));

  const rv = tr.send.rows, ca = tr.send.changeAria, an = tr.answers;
  const review = s.mode === 'write'
    ? [{ k: rv.words, v: s.text || tr.send.nothingWritten, step: 8, aria: ca.words }]
    : [
      { k: rv.drawnTo, v: t.interests, step: 1, aria: ca.interests },
      { k: rv.when, v: fmt(an.whenLength, { when: t.when, length: t.length }), step: 2, aria: ca.dates },
      { k: rv.who, v: t.hasAccess ? fmt(an.whoAccess, { who: t.travellers, access: t.access }) : t.travellers, step: 3, aria: ca.group },
      { k: rv.daysStays, v: fmt(an.paceBudget, { pace: t.pace, budget: t.budget }), step: 4, aria: ca.pace },
    ];

  const ar = tr.aside.rows;
  const summary: { k: string; v: string }[] = [];
  if (s.text && s.mode === 'write') summary.push({ k: ar.words, v: s.text.length > 90 ? `${s.text.slice(0, 90)}…` : s.text });
  if (d.picks.length) summary.push({ k: ar.drawnTo, v: t.interests });
  if (s.month || s.flex) summary.push({ k: ar.when, v: t.when });
  if (s.step >= 2 || s.sample) summary.push({ k: ar.length, v: t.length });
  if (s.step >= 3 || s.sample) summary.push({ k: ar.who, v: t.travellers });
  if (s.step >= 4 || s.sample) summary.push({ k: ar.pace, v: t.pace });
  if (!summary.length) summary.push({ k: ar.soFar, v: tr.aside.nothingYet });

  const tip = s.step === 2 ? (d.blockedT ? tr.tips.datesTushetiClosed : tr.tips.dates) : tr.tips[TIPS[s.step] ?? 'start'];

  return (
    <div class="tb">
      <header class="tb-hd">
        <a href={l(lang, '/')} class="brand" aria-label={tr.header.homeLabel} style="min-height:44px">
          <svg width="30" height="30" viewBox="0 0 34 34" fill="none" aria-hidden="true"><circle cx="17" cy="17" r="16" stroke="#1D2A35" stroke-width="1.5" /><path d="M8 24C12 10 16 26 20 15S25 12 26 9" stroke="#1D2A35" stroke-width="2" stroke-linecap="round" /><circle cx="8" cy="24" r="2.4" fill="#D62839" /><circle cx="26" cy="9" r="2.4" fill="#D62839" /></svg>
          <span class="brand-name" style="font-size:19px">Voyage Georgia <span class="red">Rezo</span></span>
        </a>
        {inFlow && s.mode !== 'write' && (
          <nav aria-label={tr.header.stepsNav} class="tb-stepsnav">
            <ol class="tb-prog">
              {progress.map((g) => (
                <li key={g.n}>
                  <button type="button" data-st={g.st} disabled={g.locked} onClick={go(g.n)} aria-current={s.step === g.n ? 'step' : undefined}>
                    <i /><span>{g.label}</span>
                  </button>
                </li>
              ))}
            </ol>
          </nav>
        )}
        <a href={l(lang, '/')} class="tb-close"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>{tr.header.close}</a>
      </header>

      <div class="tb-body">
        <div class="tb-main">
          <div class="tb-col">
            {s.step === 0 && (
              <>
                <p class="eyebrow">{tr.start.eyebrow}</p>
                <h1 class="tb-q" ref={heading} tabIndex={-1}>{tr.start.title}</h1>
                <p class="tb-lead">{tr.start.lead}</p>
                <div style="display:flex;flex-direction:column;gap:12px">
                  <button type="button" class="tb-way" onClick={() => set({ step: 1, mode: 'guided', sample: '' })}>
                    <span class="wi"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D62839" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 6h10M4 12h16M4 18h7" /><circle cx="18" cy="6" r="2" /><circle cx="15" cy="18" r="2" /></svg></span>
                    <span><span class="wt">{tr.start.guided}<span class="tb-badge">{tr.start.guidedBadge}</span></span><span class="wn">{tr.start.guidedNote}</span></span>
                    <Chevron />
                  </button>
                  <button type="button" class="tb-way" onClick={() => set({ step: 9 })}>
                    <span class="wi"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D62839" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 15l5-5 4 4 3-3 6 6" /></svg></span>
                    <span><span class="wt">{tr.start.sample}</span><span class="wn">{tr.start.sampleNote}</span></span>
                    <Chevron />
                  </button>
                  <button type="button" class="tb-way" onClick={() => set({ step: 8, mode: 'write' })}>
                    <span class="wi"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D62839" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20l4-1 11-11-3-3L5 16z" /><path d="M14 7l3 3" /></svg></span>
                    <span><span class="wt">{tr.start.write}</span><span class="wn">{tr.start.writeNote}</span></span>
                    <Chevron />
                  </button>
                </div>
                <p class="tb-assure">{tr.start.assure.map((a) => <span key={a}>✓ {a}</span>)}</p>
              </>
            )}

            {s.step === 9 && (
              <>
                <p class="eyebrow">{tr.samples.eyebrow}</p>
                <h1 class="tb-q" ref={heading} tabIndex={-1}>{tr.samples.title}</h1>
                <p class="tb-lead">{tr.samples.lead}</p>
                <div style="display:flex;flex-direction:column;gap:12px">
                  {SAMPLES.map((x) => { const xt = tr.samples.items[x.id]; return (
                    <button type="button" class="tb-sample" key={x.id} onClick={() => set(applySample(x.id)!)}>
                      <img src={photos[x.photo!]} alt="" width="132" height="118" loading="lazy" />
                      <span class="sb">
                        <span style="display:block;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#D62839;font-weight:600">{xt.meta}</span>
                        <span class="disp" style="display:block;margin:4px 0 6px;font-weight:600;font-size:20px;letter-spacing:-.015em;line-height:1.15">{xt.title}</span>
                        <span style="display:block;font-size:14px;color:#4A5762;line-height:1.45">{xt.route}</span>
                      </span>
                    </button>
                  ); })}
                </div>
              </>
            )}

            {s.step === 8 && (
              <>
                <p class="eyebrow">{tr.write.eyebrow}</p>
                <h1 class="tb-q" ref={heading} tabIndex={-1}>{tr.write.title}</h1>
                <p class="tb-lead">{tr.write.lead}</p>
                <label for="story" class="sr-only">{tr.write.label}</label>
                <textarea id="story" class="field" rows={6} value={s.text} onInput={(e) => set({ text: (e.target as HTMLTextAreaElement).value })} placeholder={tr.write.placeholder} style="font-size:18px" />
                <p class="tb-sub" style="margin-top:20px">{tr.write.nudge}</p>
                <div style="display:flex;flex-direction:column;gap:8px;align-items:flex-start">
                  {tr.write.examples.map((ex) => <button type="button" class="tb-chip" key={ex} onClick={() => set({ text: ex })} style="text-align:left;padding:10px 16px;line-height:1.4;height:auto">{ex}</button>)}
                </div>
              </>
            )}

            {s.step === 1 && (
              <>
                <p class="eyebrow">{tr.interests.eyebrow}</p>
                <h1 class="tb-q" ref={heading} tabIndex={-1}>{tr.interests.title}</h1>
                <p class="tb-lead">{tr.interests.lead}</p>
                <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:12px">
                  {TILES.map((it) => {
                    const on = s.picks.includes(it.id);
                    return (
                      <button type="button" class="tb-tile" key={it.id} onClick={() => toggle(it.id)} aria-pressed={on ? 'true' : 'false'}>
                        <img src={photos[it.photo!]} alt="" width="280" height="210" loading="lazy" />
                        <span class="ck" aria-hidden="true"><Check /></span>
                        <span class="tl">{labelOf(tr, it.id)}</span>
                      </button>
                    );
                  })}
                </div>
                <p class="tb-sub">{tr.interests.more}</p>
                <div style="display:flex;flex-wrap:wrap;gap:8px">
                  {MORE.map((m) => <Chip key={m.id} on={s.picks.includes(m.id)} onClick={() => toggle(m.id)}>{labelOf(tr, m.id)}</Chip>)}
                  <Chip soft on={s.surprise} onClick={() => set({ surprise: !s.surprise, picks: [] })}>{tr.interests.surprise}</Chip>
                </div>
              </>
            )}

            {s.step === 2 && (
              <>
                <p class="eyebrow">{tr.dates.eyebrow}</p>
                <h1 class="tb-q" ref={heading} tabIndex={-1}>{tr.dates.title}</h1>
                <p class="tb-lead">{tr.dates.lead}</p>
                <div style="display:flex;flex-wrap:wrap;gap:8px;max-width:620px">
                  {MONTHS.map((m) => <Chip key={m} on={!s.flex && s.month === m} onClick={() => set({ month: s.month === m ? '' : m, flex: false })} style="min-width:62px;justify-content:center">{monthName(tr, m)}</Chip>)}
                  <Chip soft on={s.flex} onClick={() => set({ flex: !s.flex, month: '' })}>{tr.dates.notDecided}</Chip>
                </div>
                {se.key > 0 && (
                  <div class="tb-note" style="margin-top:16px;max-width:620px">
                    <p style="margin:0 0 4px;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#4A5762;font-weight:600">{se.name}</p>
                    <p style="margin:0;font-size:15px;color:#2A3741;line-height:1.5">{se.text}</p>
                  </div>
                )}
                {d.blockedT && (
                  <div class="tb-warn" role="status" style="max-width:620px">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D62839" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 3l10 18H2z" /><path d="M12 10v4M12 17.5v.5" /></svg>
                    <span>{fmt(tr.dates.tushetiClosed, { month: s.month ? monthName(tr, s.month) : tr.dates.theseDates })}</span>
                  </div>
                )}
                <p class="tb-sub" style="margin-top:34px">{tr.dates.howMany}</p>
                <div style="display:flex;flex-wrap:wrap;align-items:center;gap:16px 28px">
                  <div style="display:flex;align-items:center;gap:16px">
                    <button type="button" class="tb-step" aria-label={tr.dates.dayFewer} onClick={() => set({ days: Math.max(3, (s.daysOpen ? 10 : s.days) - 1), daysOpen: false })}>−</button>
                    <div style="min-width:110px;text-align:center"><span class="disp" style="font-weight:600;font-size:56px;line-height:1;letter-spacing:-.03em;font-variant-numeric:tabular-nums" aria-live="polite">{s.daysOpen ? '–' : s.days}</span> <span style="font-size:16px;color:#4A5762">{plural(lang, s.days, tr.units.daysWord)}</span></div>
                    <button type="button" class="tb-step" aria-label={tr.dates.dayMore} onClick={() => set({ days: Math.min(21, (s.daysOpen ? 10 : s.days) + 1), daysOpen: false })}>+</button>
                  </div>
                  <div style="display:flex;flex-wrap:wrap;gap:8px">
                    {[5, 7, 10, 14].map((n) => <Chip key={n} on={!s.daysOpen && s.days === n} onClick={() => set({ days: n, daysOpen: false })}>{plural(lang, n, tr.units.days)}</Chip>)}
                    <Chip soft on={s.daysOpen} onClick={() => set({ daysOpen: !s.daysOpen })}>{tr.dates.suggest}</Chip>
                  </div>
                </div>
                <p style="margin:14px 0 0;font-size:14.5px;color:#4A5762;max-width:600px">{d.lenTip}</p>
              </>
            )}

            {s.step === 3 && (
              <>
                <p class="eyebrow">{tr.group.eyebrow}</p>
                <h1 class="tb-q" ref={heading} tabIndex={-1}>{tr.group.title}</h1>
                <p class="tb-lead">{tr.group.lead}</p>
                <div style="display:flex;flex-wrap:wrap;gap:20px 48px">
                  <div><p style="margin:0 0 8px;font-size:14.5px;color:#4A5762">{tr.group.adults}</p><Stepper downLabel={tr.group.adultFewer} upLabel={tr.group.adultMore} value={s.adults} onDown={() => set({ adults: Math.max(1, s.adults - 1) })} onUp={() => set({ adults: Math.min(16, s.adults + 1) })} /></div>
                  <div><p style="margin:0 0 8px;font-size:14.5px;color:#4A5762">{tr.group.children}</p><Stepper downLabel={tr.group.childFewer} upLabel={tr.group.childMore} value={s.kids} onDown={() => set({ kids: Math.max(0, s.kids - 1) })} onUp={() => set({ kids: Math.min(10, s.kids + 1) })} /></div>
                </div>
                <p class="tb-sub" style="margin-top:34px">{tr.group.accessQ}</p>
                <div style="display:flex;flex-wrap:wrap;gap:8px">
                  {MOBS.map((id) => {
                    const on = s.mob.includes(id);
                    return <Chip key={id} on={on} onClick={() => {
                      if (id === 'none') return set({ mob: ['none'] });
                      const rest = s.mob.filter((x) => x !== 'none');
                      const next = on ? rest.filter((x) => x !== id) : [...rest, id];
                      set({ mob: next.length ? next : ['none'] });
                    }}>{accessLabel(tr, id)}</Chip>;
                  })}
                </div>
                {(s.mob.includes('wheel') || s.mob.includes('walk')) && (
                  <div class="tb-note" style="margin-top:16px;max-width:620px;font-size:15px;color:#2A3741;line-height:1.5">{tr.group.accessNote}</div>
                )}
                {s.kids > 0 && <div class="tb-note" style="margin-top:12px;max-width:620px;font-size:15px;color:#2A3741;line-height:1.5">{tr.group.kidsNote}</div>}
              </>
            )}

            {s.step === 4 && (
              <>
                <p class="eyebrow">{tr.pace.eyebrow}</p>
                <h1 class="tb-q" ref={heading} tabIndex={-1}>{tr.pace.title}</h1>
                <p class="tb-lead">{tr.pace.lead}</p>
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(190px,100%),1fr));gap:12px">
                  {PACES.map((p) => (
                    <button type="button" class="tb-card" key={p.id} aria-pressed={s.pace === p.id ? 'true' : 'false'} onClick={() => set({ pace: p.id })}>
                      <svg viewBox="0 0 120 14" width="120" height="14" aria-hidden="true"><path d="M4 7H116" stroke="#C2CED5" stroke-width="2" stroke-linecap="round" />{p.xs.map((x) => <circle key={x} cx={x} cy="7" r="4" fill="#D62839" />)}</svg>
                      <span class="ct">{paceLabel(tr, p.id)}</span><span class="cn">{paceNote(tr, p.id)}</span>
                    </button>
                  ))}
                </div>
                <p class="tb-sub" style="margin-top:34px">{tr.pace.budgetQ}</p>
                <div style="display:flex;flex-wrap:wrap;gap:8px">
                  {BUDGETS.map((b) => <Chip key={b} on={s.budget === b} onClick={() => set({ budget: s.budget === b ? '' : b })}>{budgetLabel(tr, b)}</Chip>)}
                </div>
                <p style="margin:12px 0 0;font-size:14px;color:#4A5762">{tr.pace.budgetNote}</p>
              </>
            )}

            {s.step === 5 && (
              <form onSubmit={(e) => { e.preventDefault(); if (ready && !sending) submit(); }} noValidate>
                <p class="eyebrow">{tr.send.eyebrow}</p>
                <h1 class="tb-q" ref={heading} tabIndex={-1}>{tr.send.title}</h1>
                <p class="tb-lead">{tr.send.lead}</p>
                <div style="border-bottom:1px solid #D6DFE4">
                  {review.map((r) => (
                    <div class="tb-row" key={r.k}><span class="k">{r.k}</span><span>{r.v}</span><button type="button" class="tb-edit" onClick={go(r.step)} aria-label={r.aria}>{tr.send.change}</button></div>
                  ))}
                </div>
                <div style="margin-top:28px;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(250px,100%),1fr));gap:14px">
                  <div><label for="nm" class="tb-label">{tr.send.name}</label><input id="nm" class="field" type="text" value={s.name} onInput={(e) => set({ name: (e.target as HTMLInputElement).value })} autocomplete="name" placeholder={tr.send.namePlaceholder} required /></div>
                  <div><label for="ct" class="tb-label">{tr.send.contact}</label><input id="ct" class="field" type="text" value={s.contact} onInput={(e) => set({ contact: (e.target as HTMLInputElement).value })} placeholder={tr.send.contactPlaceholder} autocomplete="email" required /></div>
                </div>
                <fieldset style="border:0;padding:0;margin:18px 0 0">
                  <legend class="tb-label" style="padding:0;margin-bottom:8px">{tr.send.channelQ}</legend>
                  <div style="display:flex;flex-wrap:wrap;gap:8px">{CHANNELS.map((c) => <Chip key={c} on={s.channel === c} onClick={() => set({ channel: c })}>{tr.send.channels[c]}</Chip>)}</div>
                </fieldset>
                <label for="extra" class="tb-label" style="margin-top:20px">{tr.send.extra} <span style="font-weight:400;color:var(--muted)">{tr.send.optional}</span></label>
                <textarea id="extra" class="field" rows={3} value={s.extra} onInput={(e) => set({ extra: (e.target as HTMLTextAreaElement).value })} placeholder={tr.send.extraPlaceholder} />
                <p style="margin:12px 0 0;font-size:13.5px;color:#4A5762">{tr.send.privacy}</p>
                {error && <div class="tb-warn" role="alert"><span aria-hidden="true">!</span><span>{error}{(wa || mail) && <> {wa && <a href={wa} rel="noopener" target="_blank">{tr.send.channels.WhatsApp}</a>}{wa && mail && ' · '}{mail && <a href={mail}>{tr.send.channels.Email}</a>}</>}</span></div>}
              </form>
            )}

            {s.step === 6 && (
              <>
                <div style="width:56px;height:56px;border-radius:50%;background:#D62839;display:flex;align-items:center;justify-content:center;margin-bottom:22px"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5 9-10" /></svg></div>
                {delivery === 'sent' && <h1 class="tb-q" ref={heading} tabIndex={-1}>{fmt(tr.done.sent, { name: firstName })}</h1>}
                {delivery === 'handoff' && <h1 class="tb-q" ref={heading} tabIndex={-1}>{fmt(tr.done.handoff, { name: firstName })}</h1>}
                {delivery === 'none' && <h1 class="tb-q" ref={heading} tabIndex={-1}>{fmt(tr.done.ready, { name: firstName })}</h1>}
                {delivery === 'handoff' && <p class="tb-lead">{tr.done.handoffLead}</p>}
                {delivery === 'none' && (
                  <>
                    <p class="tb-lead" dangerouslySetInnerHTML={{ __html: localizeHtml(lang, tr.done.noneLeadHtml) }} />
                    <textarea class="field" rows={8} readOnly value={message} aria-label={tr.done.requestLabel} />
                  </>
                )}
                {delivery !== 'none' && <p class="tb-lead">{tr.done.next}</p>}
                {delivery !== 'none' && <ol style="list-style:none;margin:0;padding:0;max-width:600px;border-bottom:1px solid #D6DFE4">
                  {tr.done.steps.map((x) => [x.title, fmt(x.text, { channel: tr.done.channelInText[s.channel] })] as const).map(([a, b], i) => (
                    <li key={a} style="display:grid;grid-template-columns:40px minmax(0,1fr);gap:14px;padding:18px 0;border-top:1px solid #D6DFE4">
                      <span class="disp" style="font-weight:600;font-size:15px;width:30px;height:30px;border-radius:50%;border:1px solid #C2CED5;display:flex;align-items:center;justify-content:center;color:#D62839">{i + 1}</span>
                      <div><strong class="disp" style="font-weight:600;font-size:19px">{a}</strong><p style="margin:4px 0 0;color:#4A5762;font-size:15px">{b}</p></div>
                    </li>
                  ))}
                </ol>}
                <div style="margin-top:26px;display:flex;flex-wrap:wrap;gap:10px">
                  <a href={l(lang, '/journeys')} class="btn btn--sm" style="background:#1D2A35;color:#fff;min-height:52px;border-radius:10px">{tr.done.journeys}</a>
                  <a href={l(lang, '/')} class="btn btn--sm btn--secondary" style="min-height:52px;border-radius:10px;border-color:#C2CED5">{tr.done.home}</a>
                </div>
              </>
            )}

            {showNav && (
              <div class="tb-nav">
                <button type="button" class="tb-ghost" onClick={() => set({ step: backTo[s.step] ?? 0, from: s.step })}>{tr.nav.back}</button>
                <button type="button" class="tb-primary" disabled={notReady || sending} onClick={() => (s.step === 5 ? submit() : set({ step: nextTo[s.step], from: s.step }))}>
                  {sending ? tr.nav.sending : s.step === 5 ? tr.nav.send : s.step === 4 ? tr.nav.review : tr.nav.continue} <Arrow />
                </button>
                {s.step >= 1 && s.step <= 4 && <button type="button" class="tb-textlink" onClick={() => set({ step: nextTo[s.step], from: s.step })}>{tr.nav.skip}</button>}
                <span style="margin-left:auto;font-size:13px;color:var(--muted)">{left}</span>
              </div>
            )}
          </div>
        </div>

        <aside class="tb-aside" aria-label={tr.aside.title}>
          <div style="display:flex;justify-content:space-between;align-items:baseline;gap:12px">
            <h2 class="disp" style="margin:0;font-weight:600;letter-spacing:-.02em;font-size:22px">{tr.aside.title}</h2>
            <span style="font-size:12.5px;color:var(--muted)">{tr.aside.badge}</span>
          </div>
          <div class="tb-tip">
            <span class="av" aria-hidden="true">R</span>
            <div><p style="margin:0 0 2px;font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:#D62839;font-weight:600">{tr.aside.tipTitle}</p><p style="margin:0;font-size:14.5px;color:#2A3741;line-height:1.5">{tip}</p></div>
          </div>
          <div style="background:#FFFFFF;border:1px solid #D6DFE4;border-radius:14px;padding:8px">
            <svg viewBox="240 110 700 390" style="width:100%;height:auto;display:block" role="img" aria-label={d.hasSketch ? fmt(tr.aside.mapLabelRoute, { route: d.sketchText }) : tr.aside.mapLabel}>
              <image href={mapSrc} x="0" y="0" width="1000" height="560" />
              <polyline points={d.hasSketch ? d.sketchPts : '681,387'} fill="none" stroke="#D62839" stroke-width="3.5" stroke-dasharray="2 9" stroke-linecap="round" stroke-linejoin="round" opacity={d.hasSketch ? 1 : 0} />
              {d.pins.map((p) => (
                <g key={p.n} opacity={p.op}>
                  <circle cx={p.x} cy={p.y} r={p.r} fill={p.fill} stroke={p.stroke} stroke-width="2.5" />
                  <text x={p.x} y={p.ny} text-anchor="middle" font-family="Inter Variable, Inter, sans-serif" font-size="15" font-weight="700" fill="#FFFFFF">{p.num}</text>
                  <rect x={p.lx} y={p.ly} width={p.lw} height="26" rx="6" fill="#FFFFFF" stroke="#C2CED5" opacity={p.lop} />
                  <text x={p.tx} y={p.ty} font-family="Inter Variable, Inter, sans-serif" font-size="16" font-weight="600" fill="#1D2A35" opacity={p.lop}>{p.label}</text>
                </g>
              ))}
            </svg>
          </div>
          {d.hasSketch ? (
            <div>
              <p style="margin:0 0 6px;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#4A5762;font-weight:600">{tr.aside.routeTitle}</p>
              <p class="disp" style="margin:0;font-weight:600;font-size:18px;letter-spacing:-.01em;line-height:1.35">{d.sketchText}</p>
              <p style="margin:6px 0 0;font-size:14px;color:#4A5762">{d.nightsText}</p>
            </div>
          ) : (
            <p style="margin:0;font-size:14.5px;color:#4A5762">{tr.aside.empty}</p>
          )}
          <dl style="margin:0;border-top:1px solid #C2CED5;padding-top:14px;display:flex;flex-direction:column;gap:8px">
            {summary.map((r) => (
              <div key={r.k} style="display:grid;grid-template-columns:86px minmax(0,1fr);gap:12px;font-size:14.5px"><dt style="color:var(--muted)">{r.k}</dt><dd style="margin:0">{r.v}</dd></div>
            ))}
          </dl>
        </aside>
      </div>
    </div>
  );
}

