import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import type { ComponentChildren } from 'preact';
import {
  BUDGETS, CHANNELS, EXAMPLES, INITIAL, MOBS, MONTHS, MORE, PACES, SAMPLES, TILES, TIPS,
  applySample, derive, season, summaryText, texts, type State,
} from './model';

export interface BuilderProps {
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
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#14161A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
);
const Check = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5 9-10" /></svg>
);

const Chip = ({ on, onClick, soft, children, style }: { on?: boolean; onClick: () => void; soft?: boolean; children: ComponentChildren; style?: string }) => (
  <button type="button" class={`tb-chip${soft ? ' soft' : ''}`} aria-pressed={on ? 'true' : 'false'} onClick={onClick} style={style}>{children}</button>
);

const Stepper = ({ label, value, onDown, onUp, big = 44 }: { label: string; value: number | string; onDown: () => void; onUp: () => void; big?: number }) => (
  <div style="display:flex;align-items:center;gap:14px">
    <button type="button" class="tb-step" aria-label={`One ${label} fewer`} onClick={onDown}>−</button>
    <span class="disp" style={`min-width:44px;text-align:center;font-weight:600;font-size:${big}px;line-height:1;font-variant-numeric:tabular-nums`} aria-live="polite">{value}</span>
    <button type="button" class="tb-step" aria-label={`One ${label} more`} onClick={onUp}>+</button>
  </div>
);

export default function TripBuilder({ photos, mapSrc, endpoint, whatsapp, email }: BuilderProps) {
  const [s, setS] = useState<State>(INITIAL);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [delivery, setDelivery] = useState<'sent' | 'handoff' | 'none'>('sent');
  const heading = useRef<HTMLHeadingElement>(null);
  const set = (o: Partial<State>) => setS((p) => ({ ...p, ...o }));
  const go = (n: number) => () => setS((p) => ({ ...p, step: n, from: p.step }));
  const d = useMemo(() => derive(s), [s]);
  const t = texts(s);
  const se = season(s.month);

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
  const left = ({ 1: 'About 2 min left', 2: 'About 90 s left', 3: 'About 1 min left', 4: 'Nearly there' } as Record<number, string>)[s.step] ?? '';
  const showNav = inFlow || s.step === 8 || s.step === 9;

  async function submit() {
    setError('');
    const message = summaryText(s);
    const payload = {
      source: 'design-my-trip', submittedAt: new Date().toISOString(), mode: s.mode, name: s.name.trim(), contact: s.contact.trim(), channel: s.channel,
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
        setError('That did not go through. Please try again, or send it straight to Rezo with the buttons below.');
      } finally {
        setSending(false);
      }
      return;
    }
    // No form backend configured: hand the message to the traveller's own WhatsApp / mail app.
    const wa = whatsapp ? `https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}` : '';
    const mail = email ? `mailto:${email}?subject=${encodeURIComponent('Trip to Georgia')}&body=${encodeURIComponent(message)}` : '';
    const target = s.channel === 'Email' ? mail || wa : wa || mail;
    if (target) { window.open(target, '_blank', 'noopener'); setDelivery('handoff'); } else setDelivery('none');
    set({ step: 6, from: 5 });
  }

  const wa = whatsapp ? `https://wa.me/${whatsapp}?text=${encodeURIComponent(summaryText(s))}` : '';
  const mail = email ? `mailto:${email}?subject=${encodeURIComponent('Trip to Georgia')}&body=${encodeURIComponent(summaryText(s))}` : '';

  const progress = [1, 2, 3, 4, 5].map((n, k) => ({
    n, label: ['Interests', 'Dates', 'Group', 'Pace', 'Send'][k],
    st: s.step === n ? 'now' : s.step > n && s.step <= 5 ? 'done' : s.step === 6 ? 'done' : 'todo',
    locked: !(s.step >= n || s.sample),
  }));

  const review = s.mode === 'write'
    ? [{ k: 'Your words', v: s.text || 'Nothing written yet', step: 8, aria: 'Change your description' }]
    : [
      { k: 'Drawn to', v: t.interests, step: 1, aria: 'Change interests' },
      { k: 'When', v: `${t.when} · ${t.length}`, step: 2, aria: 'Change dates and length' },
      { k: 'Who', v: t.travellers + (t.access !== 'Nothing special' ? ` · ${t.access}` : ''), step: 3, aria: 'Change travellers' },
      { k: 'Days & stays', v: `${t.pace} · ${t.budget}`, step: 4, aria: 'Change pace and budget' },
    ];

  const summary: { k: string; v: string }[] = [];
  if (s.text && s.mode === 'write') summary.push({ k: 'Your words', v: s.text.length > 90 ? `${s.text.slice(0, 90)}…` : s.text });
  if (d.picks.length) summary.push({ k: 'Drawn to', v: t.interests });
  if (s.month || s.flex) summary.push({ k: 'When', v: t.when });
  if (s.step >= 2 || s.sample) summary.push({ k: 'Length', v: t.length });
  if (s.step >= 3 || s.sample) summary.push({ k: 'Who', v: t.travellers });
  if (s.step >= 4 || s.sample) summary.push({ k: 'Pace', v: t.pace });
  if (!summary.length) summary.push({ k: 'So far', v: 'Nothing yet. Your answers appear here.' });

  return (
    <div class="tb">
      <header class="tb-hd">
        <a href="/" class="brand" aria-label="Voyage Georgia Rezo, home" style="min-height:44px">
          <svg width="30" height="30" viewBox="0 0 34 34" fill="none" aria-hidden="true"><circle cx="17" cy="17" r="16" stroke="#14161A" stroke-width="1.5" /><path d="M8 24C12 10 16 26 20 15S25 12 26 9" stroke="#14161A" stroke-width="2" stroke-linecap="round" /><circle cx="8" cy="24" r="2.4" fill="#D62839" /><circle cx="26" cy="9" r="2.4" fill="#D62839" /></svg>
          <span class="brand-name" style="font-size:19px">Voyage Georgia <span class="red">Rezo</span></span>
        </a>
        {inFlow && s.mode !== 'write' && (
          <nav aria-label="Steps" class="tb-stepsnav">
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
        <a href="/" class="tb-close"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>Close</a>
      </header>

      <div class="tb-body">
        <div class="tb-main">
          <div class="tb-col">
            {s.step === 0 && (
              <>
                <p class="eyebrow">Design my trip</p>
                <h1 class="tb-q" ref={heading} tabIndex={-1}>Let’s sketch your Georgia.</h1>
                <p class="tb-lead">There’s no wrong way to start, and nothing here is final. Pick whatever feels easiest. Rezo reads every request himself and plans the real trip with you.</p>
                <div style="display:flex;flex-direction:column;gap:12px">
                  <button type="button" class="tb-way" onClick={() => set({ step: 1, mode: 'guided', sample: '' })}>
                    <span class="wi"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D62839" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 6h10M4 12h16M4 18h7" /><circle cx="18" cy="6" r="2" /><circle cx="15" cy="18" r="2" /></svg></span>
                    <span><span class="wt">Answer a few easy questions<span class="tb-badge">Most helpful</span></span><span class="wn">4 short steps, about 2 minutes. You see a first sketch of the route as you go.</span></span>
                    <Chevron />
                  </button>
                  <button type="button" class="tb-way" onClick={() => set({ step: 9 })}>
                    <span class="wi"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D62839" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 15l5-5 4 4 3-3 6 6" /></svg></span>
                    <span><span class="wt">Start from a sample trip</span><span class="wn">Pick an idea that’s close, then change anything you like.</span></span>
                    <Chevron />
                  </button>
                  <button type="button" class="tb-way" onClick={() => set({ step: 8, mode: 'write' })}>
                    <span class="wi"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D62839" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20l4-1 11-11-3-3L5 16z" /><path d="M14 7l3 3" /></svg></span>
                    <span><span class="wt">Just write to Rezo</span><span class="wn">Describe it in your own words. A sentence is plenty.</span></span>
                    <Chevron />
                  </button>
                </div>
                <p class="tb-assure"><span>✓ Free, no booking</span><span>✓ Change everything later</span><span>✓ A real person replies</span></p>
              </>
            )}

            {s.step === 9 && (
              <>
                <p class="eyebrow">Sample trips</p>
                <h1 class="tb-q" ref={heading} tabIndex={-1}>Which one is closest?</h1>
                <p class="tb-lead">These are starting points, never fixed packages. Choosing one fills in the answers for you, and you can change each one on the next screen.</p>
                <div style="display:flex;flex-direction:column;gap:12px">
                  {SAMPLES.map((x) => (
                    <button type="button" class="tb-sample" key={x.id} onClick={() => set(applySample(x.id)!)}>
                      <img src={photos[x.photo!]} alt="" width="132" height="118" loading="lazy" />
                      <span class="sb">
                        <span style="display:block;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#D62839;font-weight:600">{x.meta}</span>
                        <span class="disp" style="display:block;margin:4px 0 6px;font-weight:600;font-size:20px;letter-spacing:-.015em;line-height:1.15">{x.title}</span>
                        <span style="display:block;font-size:14px;color:#52525B;line-height:1.45">{x.route}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {s.step === 8 && (
              <>
                <p class="eyebrow">In your own words</p>
                <h1 class="tb-q" ref={heading} tabIndex={-1}>What would your perfect Georgia look like?</h1>
                <p class="tb-lead">Write it however it comes. Dates, who’s coming, what you love, what you’d rather skip. Rezo will ask about anything he needs.</p>
                <label for="story" class="sr-only">Describe your ideal trip</label>
                <textarea id="story" class="field" rows={6} value={s.text} onInput={(e) => set({ text: (e.target as HTMLTextAreaElement).value })} placeholder="We have ten days in September. We’d love mountains, wine, old churches and a little sea, without long drives every day." style="font-size:18px" />
                <p class="tb-sub" style="margin-top:20px">Need a nudge? Tap one to use it as a start:</p>
                <div style="display:flex;flex-direction:column;gap:8px;align-items:flex-start">
                  {EXAMPLES.map((ex) => <button type="button" class="tb-chip" key={ex} onClick={() => set({ text: ex })} style="text-align:left;padding:10px 16px;line-height:1.4;height:auto">{ex}</button>)}
                </div>
              </>
            )}

            {s.step === 1 && (
              <>
                <p class="eyebrow">Step 1 of 4</p>
                <h1 class="tb-q" ref={heading} tabIndex={-1}>What would you love to see?</h1>
                <p class="tb-lead">Tap a few, or just one. You don’t need to know where anything is. The map fills in as you choose.</p>
                <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:12px">
                  {TILES.map((it) => {
                    const on = s.picks.includes(it.id);
                    return (
                      <button type="button" class="tb-tile" key={it.id} onClick={() => toggle(it.id)} aria-pressed={on ? 'true' : 'false'}>
                        <img src={photos[it.photo!]} alt="" width="280" height="210" loading="lazy" />
                        <span class="ck" aria-hidden="true"><Check /></span>
                        <span class="tl">{it.label}</span>
                      </button>
                    );
                  })}
                </div>
                <p class="tb-sub">More things you might enjoy</p>
                <div style="display:flex;flex-wrap:wrap;gap:8px">
                  {MORE.map((m) => <Chip key={m.id} on={s.picks.includes(m.id)} onClick={() => toggle(m.id)}>{m.label}</Chip>)}
                  <Chip soft on={s.surprise} onClick={() => set({ surprise: !s.surprise, picks: [] })}>Not sure, show me Rezo’s favourites</Chip>
                </div>
              </>
            )}

            {s.step === 2 && (
              <>
                <p class="eyebrow">Step 2 of 4</p>
                <h1 class="tb-q" ref={heading} tabIndex={-1}>When, and for how long?</h1>
                <p class="tb-lead">A rough idea is perfect. Each season changes which roads are open and what’s at its best.</p>
                <div style="display:flex;flex-wrap:wrap;gap:8px;max-width:620px">
                  {MONTHS.map((m) => <Chip key={m} on={!s.flex && s.month === m} onClick={() => set({ month: s.month === m ? '' : m, flex: false })} style="min-width:62px;justify-content:center">{m}</Chip>)}
                  <Chip soft on={s.flex} onClick={() => set({ flex: !s.flex, month: '' })}>Not decided yet</Chip>
                </div>
                {se.key > 0 && (
                  <div class="tb-note" style="margin-top:16px;max-width:620px">
                    <p style="margin:0 0 4px;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#52525B;font-weight:600">{se.name}</p>
                    <p style="margin:0;font-size:15px;color:#27272A;line-height:1.5">{se.text}</p>
                  </div>
                )}
                {d.blockedT && (
                  <div class="tb-warn" role="status" style="max-width:620px">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D62839" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 3l10 18H2z" /><path d="M12 10v4M12 17.5v.5" /></svg>
                    <span>Tusheti’s mountain road is usually closed outside June to October, so it’s left out of the sketch for {s.month || 'these dates'}. Pick a summer month to include it, or keep these dates and Rezo will suggest other high valleys.</span>
                  </div>
                )}
                <p class="tb-sub" style="margin-top:34px">How many days?</p>
                <div style="display:flex;flex-wrap:wrap;align-items:center;gap:16px 28px">
                  <div style="display:flex;align-items:center;gap:16px">
                    <button type="button" class="tb-step" aria-label="One day fewer" onClick={() => set({ days: Math.max(3, (s.daysOpen ? 10 : s.days) - 1), daysOpen: false })}>−</button>
                    <div style="min-width:110px;text-align:center"><span class="disp" style="font-weight:600;font-size:56px;line-height:1;letter-spacing:-.03em;font-variant-numeric:tabular-nums" aria-live="polite">{s.daysOpen ? '–' : s.days}</span> <span style="font-size:16px;color:#52525B">days</span></div>
                    <button type="button" class="tb-step" aria-label="One day more" onClick={() => set({ days: Math.min(21, (s.daysOpen ? 10 : s.days) + 1), daysOpen: false })}>+</button>
                  </div>
                  <div style="display:flex;flex-wrap:wrap;gap:8px">
                    {[5, 7, 10, 14].map((n) => <Chip key={n} on={!s.daysOpen && s.days === n} onClick={() => set({ days: n, daysOpen: false })}>{n} days</Chip>)}
                    <Chip soft on={s.daysOpen} onClick={() => set({ daysOpen: !s.daysOpen })}>Suggest a length</Chip>
                  </div>
                </div>
                <p style="margin:14px 0 0;font-size:14.5px;color:#52525B;max-width:600px">{d.lenTip}</p>
              </>
            )}

            {s.step === 3 && (
              <>
                <p class="eyebrow">Step 3 of 4</p>
                <h1 class="tb-q" ref={heading} tabIndex={-1}>Who’s coming along?</h1>
                <p class="tb-lead">So Rezo can think about the vehicle, rooms and how long each day should be.</p>
                <div style="display:flex;flex-wrap:wrap;gap:20px 48px">
                  <div><p style="margin:0 0 8px;font-size:14.5px;color:#52525B">Adults</p><Stepper label="adult" value={s.adults} onDown={() => set({ adults: Math.max(1, s.adults - 1) })} onUp={() => set({ adults: Math.min(16, s.adults + 1) })} /></div>
                  <div><p style="margin:0 0 8px;font-size:14.5px;color:#52525B">Children</p><Stepper label="child" value={s.kids} onDown={() => set({ kids: Math.max(0, s.kids - 1) })} onUp={() => set({ kids: Math.min(10, s.kids + 1) })} /></div>
                </div>
                <p class="tb-sub" style="margin-top:34px">Anything that changes how you travel?</p>
                <div style="display:flex;flex-wrap:wrap;gap:8px">
                  {MOBS.map((o) => {
                    const on = s.mob.includes(o.id);
                    return <Chip key={o.id} on={on} onClick={() => {
                      if (o.id === 'none') return set({ mob: ['none'] });
                      const rest = s.mob.filter((x) => x !== 'none');
                      const next = on ? rest.filter((x) => x !== o.id) : [...rest, o.id];
                      set({ mob: next.length ? next : ['none'] });
                    }}>{o.label}</Chip>;
                  })}
                </div>
                {(s.mob.includes('wheel') || s.mob.includes('walk')) && (
                  <div class="tb-note" style="margin-top:16px;max-width:620px;font-size:15px;color:#27272A;line-height:1.5">One of Rezo’s Sprinters is wheelchair-accessible. He talks through your needs first and checks each stop before suggesting it. Add any details in the last step.</div>
                )}
                {s.kids > 0 && <div class="tb-note" style="margin-top:12px;max-width:620px;font-size:15px;color:#27272A;line-height:1.5">Add the children’s ages in the last step, so the days can be planned around them.</div>}
              </>
            )}

            {s.step === 4 && (
              <>
                <p class="eyebrow">Step 4 of 4</p>
                <h1 class="tb-q" ref={heading} tabIndex={-1}>What kind of days suit you?</h1>
                <p class="tb-lead">This decides how much fits in. Most people choose the middle option.</p>
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(190px,100%),1fr));gap:12px">
                  {PACES.map((p) => (
                    <button type="button" class="tb-card" key={p.id} aria-pressed={s.pace === p.id ? 'true' : 'false'} onClick={() => set({ pace: p.id })}>
                      <svg viewBox="0 0 120 14" width="120" height="14" aria-hidden="true"><path d="M4 7H116" stroke="#D4D4D8" stroke-width="2" stroke-linecap="round" />{p.xs.map((x) => <circle key={x} cx={x} cy="7" r="4" fill="#D62839" />)}</svg>
                      <span class="ct">{p.label}</span><span class="cn">{p.note}</span>
                    </button>
                  ))}
                </div>
                <p class="tb-sub" style="margin-top:34px">And for stays and extras?</p>
                <div style="display:flex;flex-wrap:wrap;gap:8px">
                  {BUDGETS.map((b) => <Chip key={b.id} on={s.budget === b.id} onClick={() => set({ budget: s.budget === b.id ? '' : b.id })}>{b.label}</Chip>)}
                </div>
                <p style="margin:12px 0 0;font-size:14px;color:#52525B">Just a feeling. There is no price yet: Rezo writes a real quote, line by line, once your trip is planned.</p>
              </>
            )}

            {s.step === 5 && (
              <form onSubmit={(e) => { e.preventDefault(); if (ready && !sending) submit(); }} noValidate>
                <p class="eyebrow">Almost done</p>
                <h1 class="tb-q" ref={heading} tabIndex={-1}>Check it over, then send it to Rezo.</h1>
                <p class="tb-lead">Change anything with one tap. Sending is free and isn’t a booking.</p>
                <div style="border-bottom:1px solid #E4E4E7">
                  {review.map((r) => (
                    <div class="tb-row" key={r.k}><span class="k">{r.k}</span><span>{r.v}</span><button type="button" class="tb-edit" onClick={go(r.step)} aria-label={r.aria}>Change</button></div>
                  ))}
                </div>
                <div style="margin-top:28px;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(250px,100%),1fr));gap:14px">
                  <div><label for="nm" class="tb-label">Your name</label><input id="nm" class="field" type="text" value={s.name} onInput={(e) => set({ name: (e.target as HTMLInputElement).value })} autocomplete="name" placeholder="First name is fine" required /></div>
                  <div><label for="ct" class="tb-label">WhatsApp number or email</label><input id="ct" class="field" type="text" value={s.contact} onInput={(e) => set({ contact: (e.target as HTMLInputElement).value })} placeholder="So Rezo can reply" autocomplete="email" required /></div>
                </div>
                <fieldset style="border:0;padding:0;margin:18px 0 0">
                  <legend class="tb-label" style="padding:0;margin-bottom:8px">Where should Rezo reply?</legend>
                  <div style="display:flex;flex-wrap:wrap;gap:8px">{CHANNELS.map((c) => <Chip key={c} on={s.channel === c} onClick={() => set({ channel: c })}>{c}</Chip>)}</div>
                </fieldset>
                <label for="extra" class="tb-label" style="margin-top:20px">Anything else? <span style="font-weight:400;color:var(--muted)">Optional</span></label>
                <textarea id="extra" class="field" rows={3} value={s.extra} onInput={(e) => set({ extra: (e.target as HTMLTextAreaElement).value })} placeholder="A birthday, children’s ages, a place you’ve always wanted to see, something you’d rather skip…" />
                <p style="margin:12px 0 0;font-size:13.5px;color:#52525B">Your details go to Rezo only.</p>
                {error && <div class="tb-warn" role="alert"><span aria-hidden="true">!</span><span>{error}{(wa || mail) && <> {wa && <a href={wa} rel="noopener" target="_blank">WhatsApp</a>}{wa && mail && ' · '}{mail && <a href={mail}>Email</a>}</>}</span></div>}
              </form>
            )}

            {s.step === 6 && (
              <>
                <div style="width:56px;height:56px;border-radius:50%;background:#D62839;display:flex;align-items:center;justify-content:center;margin-bottom:22px"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5 9-10" /></svg></div>
                {delivery === 'sent' && <h1 class="tb-q" ref={heading} tabIndex={-1}>Thank you, {s.name.trim().split(' ')[0] || 'traveller'}. It’s with Rezo now.</h1>}
                {delivery === 'handoff' && <h1 class="tb-q" ref={heading} tabIndex={-1}>Almost there, {s.name.trim().split(' ')[0] || 'traveller'}. One more tap.</h1>}
                {delivery === 'none' && <h1 class="tb-q" ref={heading} tabIndex={-1}>Your request is ready, {s.name.trim().split(' ')[0] || 'traveller'}.</h1>}
                {delivery === 'handoff' && <p class="tb-lead">We opened a message to Rezo with your answers already written. Press send there and it reaches him.</p>}
                {delivery === 'none' && (
                  <>
                    <p class="tb-lead">This form can’t deliver messages yet. Copy your request below and send it to Rezo from the <a href="/contact">contact page</a>.</p>
                    <textarea class="field" rows={8} readOnly value={summaryText(s)} aria-label="Your request" />
                  </>
                )}
                {delivery !== 'none' && <p class="tb-lead">Here is what happens next.</p>}
                {delivery !== 'none' && <ol style="list-style:none;margin:0;padding:0;max-width:600px;border-bottom:1px solid #E4E4E7">
                  {[
                    ['Rezo reads it himself.', `He may reply on ${s.channel === 'Email' ? 'email' : s.channel} with a question or two first.`],
                    ['He plans your first proposal.', 'Route, daily schedule, vehicle and price, worked out by hand. How long it takes depends on the season and the trip.'],
                    ['You get a private link.', 'Review the journey and ask for changes. Nothing is booked until you and Rezo agree.'],
                  ].map(([a, b], i) => (
                    <li key={a} style="display:grid;grid-template-columns:40px minmax(0,1fr);gap:14px;padding:18px 0;border-top:1px solid #E4E4E7">
                      <span class="disp" style="font-weight:600;font-size:15px;width:30px;height:30px;border-radius:50%;border:1px solid #D4D4D8;display:flex;align-items:center;justify-content:center;color:#D62839">{i + 1}</span>
                      <div><strong class="disp" style="font-weight:600;font-size:19px">{a}</strong><p style="margin:4px 0 0;color:#52525B;font-size:15px">{b}</p></div>
                    </li>
                  ))}
                </ol>}
                <div style="margin-top:26px;display:flex;flex-wrap:wrap;gap:10px">
                  <a href="/journeys" class="btn btn--sm" style="background:#14161A;color:#fff;min-height:52px;border-radius:10px">See example journeys</a>
                  <a href="/" class="btn btn--sm btn--secondary" style="min-height:52px;border-radius:10px;border-color:#D4D4D8">Back to home</a>
                </div>
              </>
            )}

            {showNav && (
              <div class="tb-nav">
                <button type="button" class="tb-ghost" onClick={() => set({ step: backTo[s.step] ?? 0, from: s.step })}>Back</button>
                <button type="button" class="tb-primary" disabled={notReady || sending} onClick={() => (s.step === 5 ? submit() : set({ step: nextTo[s.step], from: s.step }))}>
                  {sending ? 'Sending…' : s.step === 5 ? 'Send to Rezo' : s.step === 4 ? 'Review my trip' : 'Continue'} <Arrow />
                </button>
                {s.step >= 1 && s.step <= 4 && <button type="button" class="tb-textlink" onClick={() => set({ step: nextTo[s.step], from: s.step })}>Skip, Rezo can ask later</button>}
                <span style="margin-left:auto;font-size:13px;color:var(--muted)">{left}</span>
              </div>
            )}
          </div>
        </div>

        <aside class="tb-aside" aria-label="Your trip so far">
          <div style="display:flex;justify-content:space-between;align-items:baseline;gap:12px">
            <h2 class="disp" style="margin:0;font-weight:600;letter-spacing:-.02em;font-size:22px">Your trip so far</h2>
            <span style="font-size:12.5px;color:var(--muted)">First sketch · not a plan</span>
          </div>
          <div class="tb-tip">
            <span class="av" aria-hidden="true">R</span>
            <div><p style="margin:0 0 2px;font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:#D62839;font-weight:600">Good to know</p><p style="margin:0;font-size:14.5px;color:#27272A;line-height:1.5">{s.step === 2 && d.blockedT ? 'Tusheti is only reachable in summer, so the sketch leaves it out for these dates. Svaneti or Kazbegi give you high mountains all year, weather permitting.' : s.step === 2 ? 'September and October are the busiest months. If you’re flexible, May, June and late October are quieter and still beautiful.' : TIPS[s.step] ?? TIPS[0]}</p></div>
          </div>
          <div style="background:#FFFFFF;border:1px solid #E4E4E7;border-radius:14px;padding:8px">
            <svg viewBox="240 110 700 390" style="width:100%;height:auto;display:block" role="img" aria-label={d.hasSketch ? `Map of Georgia with a first sketch: ${d.sketchText}` : 'Map of Georgia'}>
              <image href={mapSrc} x="0" y="0" width="1000" height="560" />
              <polyline points={d.hasSketch ? d.sketchPts : '681,387'} fill="none" stroke="#D62839" stroke-width="3.5" stroke-dasharray="2 9" stroke-linecap="round" stroke-linejoin="round" opacity={d.hasSketch ? 1 : 0} />
              {d.pins.map((p) => (
                <g key={p.n} opacity={p.op}>
                  <circle cx={p.x} cy={p.y} r={p.r} fill={p.fill} stroke={p.stroke} stroke-width="2.5" />
                  <text x={p.x} y={p.ny} text-anchor="middle" font-family="Inter Variable, Inter, sans-serif" font-size="15" font-weight="700" fill="#FFFFFF">{p.num}</text>
                  <rect x={p.lx} y={p.ly} width={p.lw} height="26" rx="6" fill="#FFFFFF" stroke="#D4D4D8" opacity={p.lop} />
                  <text x={p.tx} y={p.ty} font-family="Inter Variable, Inter, sans-serif" font-size="16" font-weight="600" fill="#14161A" opacity={p.lop}>{p.n}</text>
                </g>
              ))}
            </svg>
          </div>
          {d.hasSketch ? (
            <div>
              <p style="margin:0 0 6px;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#52525B;font-weight:600">A route like this could be</p>
              <p class="disp" style="margin:0;font-weight:600;font-size:18px;letter-spacing:-.01em;line-height:1.35">{d.sketchText}</p>
              <p style="margin:6px 0 0;font-size:14px;color:#52525B">{d.nightsText}</p>
            </div>
          ) : (
            <p style="margin:0;font-size:14.5px;color:#52525B">Your choices draw a first sketch here: where your interests usually take you, and roughly in what order.</p>
          )}
          <dl style="margin:0;border-top:1px solid #D4D4D8;padding-top:14px;display:flex;flex-direction:column;gap:8px">
            {summary.map((r) => (
              <div key={r.k} style="display:grid;grid-template-columns:86px minmax(0,1fr);gap:12px;font-size:14.5px"><dt style="color:var(--muted)">{r.k}</dt><dd style="margin:0">{r.v}</dd></div>
            ))}
          </dl>
        </aside>
      </div>
    </div>
  );
}

