import { Fragment } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import { DAYS, ICON, LINES, PLACES, eur as money, isTimeWord, roadPath } from '../../data/studio';
import { canLoad3D, mountTerrain, whenIdle, type Terrain } from '../../scripts/terrain';
import { fmt, l } from '../../i18n/utils';
import type { Locale } from '../../i18n/config';
import type { Dict } from '../../i18n/dictionaries';

export interface TripStudioProps {
  lang: Locale;
  /** Copy for this page: studio.trip of the page's dictionary. */
  t: Dict['studio']['trip'];
  /** Localized place names (common.places), keyed by English name. */
  places: Dict['common']['places'];
  mapSrc: string;
  whatsapp?: string;
  /** The sample trip's month, formatted on the server (browsers without Georgian locale data would print English). */
  when: string;
}

export default function TripStudio({ lang, t, places, mapSrc, whatsapp, when }: TripStudioProps) {
  const eur = (n: number, signed = false) => money(lang, n, signed);
  const pinSub = (ds: readonly number[]) =>
    ds.length === 1 ? fmt(t.route.pinDay, { n: ds[0] }) : fmt(t.route.pinDays, { from: ds[0], to: ds[ds.length - 1] });
  const [open, setOpen] = useState(3);
  const [diff, setDiff] = useState(true);
  const [qOpen, setQOpen] = useState(false);
  const [reqOpen, setReqOpen] = useState(false);
  const [reqText, setReqText] = useState('');
  const [sentText, setSentText] = useState('');
  const [reqSent, setReqSent] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [approved, setApproved] = useState(false);
  const [flat, setFlat] = useState(false);
  const canvas = useRef<HTMLCanvasElement>(null);
  const fb = useRef<SVGSVGElement>(null);

  useEffect(() => {
    let scene: Terrain | null = null;
    let dead = false;
    if (!canvas.current || !canLoad3D()) { setFlat(true); return; }
    whenIdle(async () => {
      try {
        scene = await mountTerrain(canvas.current!, {
          routes: ['Tbilisi>Stepantsminda', 'Stepantsminda>Telavi', 'Telavi>Sighnaghi', 'Sighnaghi>Gori', 'Gori>Kutaisi', 'Kutaisi>Batumi'],
          // [key, label]: keys stay English (they name places in the model); only the label is localized.
          pins: [['Tbilisi', places.Tbilisi], ['Stepantsminda', places.Kazbegi], ['Telavi', places.Telavi], ['Sighnaghi', places.Sighnaghi], ['Kutaisi', places.Kutaisi], ['Batumi', places.Batumi]],
          elevation: 38, overviewYaw: -0.32, fallback: fb.current,
        });
      } catch { scene = null; }
      if (!scene && !dead) setFlat(true);
    });
    const t = setTimeout(() => { if (!scene && fb.current && fb.current.style.display !== 'none') setFlat(true); }, 5000);
    return () => { dead = true; clearTimeout(t); scene?.dispose(); };
  }, []);

  const od = DAYS.find((d) => d.n === open);
  const odCopy = od && t.days[od.n];
  const total = LINES.reduce((a, x) => a + x.v2, 0);
  const totalV1 = LINES.reduce((a, x) => a + x.v1, 0);
  const status = approved ? { t: t.status.approved, bg: '#1D2A35', fg: '#FFFFFF' }
    : reqSent ? { t: t.status.requested, bg: '#D62839', fg: '#1D2A35' }
    : { t: t.status.review, bg: '#E1E9ED', fg: '#1D2A35' };
  const v = t.versions;

  const versions = [
    ...(reqSent ? [{ title: v.yourRequest, meta: v.waiting, body: sentText, dot: '#FFFFFF' }] : []),
    { title: v.v2, meta: v.v2Meta, body: v.v2Body, dot: '#D62839' },
    { title: v.yourRequest, meta: v.afterV1, body: v.firstRequest, dot: '#FFFFFF' },
    { title: v.v1, meta: v.v1Meta, body: fmt(v.v1Body, { price: eur(totalV1) }), dot: '#1D2A35' },
  ];
  const lines = (xs: string[]) => xs.map((x, k) => <Fragment key={k}>{k > 0 && <br />}{x}</Fragment>);

  return (
    <div class="st">
      <div class="st-banner">{t.banner}</div>
      <header class="st-hd">
        <a href={l(lang, '/')} class="brand">
          <svg width="32" height="32" viewBox="0 0 34 34" fill="none" aria-hidden="true"><circle cx="17" cy="17" r="16" stroke="#D62839" stroke-width="1.5" /><path d="M8 24C12 10 16 26 20 15S25 12 26 9" stroke="#1D2A35" stroke-width="2" stroke-linecap="round" /><circle cx="8" cy="24" r="2.4" fill="#D62839" /><circle cx="26" cy="9" r="2.4" fill="#D62839" /></svg>
          <span class="brand-name" style="font-weight:400;font-size:21px">Voyage Georgia <span class="red">Rezo</span></span>
        </a>
        <span class="st-private"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>{t.privateLink}</span>
        <span class="st-status" style={`background:${status.bg};color:${status.fg}`} role="status">{status.t}</span>
      </header>

      <section class="st-hero">
        <div class="wrap st-hero-in">
          <div style="flex:1 1 min(100%,400px);min-width:0">
            <p class="eyebrow" style="margin-bottom:20px">{t.hero.eyebrow}</p>
            <h1 style="font-size:clamp(40px,5vw,76px);line-height:1;letter-spacing:-.035em">{t.hero.title}</h1>
            <p class="disp red" style="margin:14px 0 0;font-weight:600;font-size:clamp(24px,2.6vw,36px);letter-spacing:-.02em">{t.hero.by}</p>
            <p style="margin:22px 0 0;max-width:500px;font-size:18px;color:#4A5762">{t.hero.lede}</p>
            <ul style="list-style:none;margin:26px 0 0;padding:0;display:flex;flex-wrap:wrap;gap:10px">
              {[t.hero.pills.days, when, t.hero.pills.travellers, t.hero.pills.pace].map((x) => <li key={x} class="pill">{x}</li>)}
            </ul>
            <div style="margin-top:30px;display:flex;flex-wrap:wrap;gap:12px">
              <a href="#days" class="btn btn--primary btn--sm" style="min-height:52px">{t.hero.walk}</a>
              <a href="#quote" class="btn btn--secondary btn--sm" style="min-height:52px">{t.hero.seeQuote}</a>
            </div>
          </div>
          <div style="flex:1.3 1 min(100%,460px);min-width:0">
            <div style="position:relative;width:100%;aspect-ratio:3/2;min-height:300px">
              <svg ref={fb} viewBox="150 100 800 460" preserveAspectRatio="xMidYMid meet" style={`position:absolute;inset:0;width:100%;height:100%;opacity:${flat ? 1 : 0};transition:opacity .4s`} role="img" aria-label={t.hero.mapAlt}><image href={mapSrc} x="0" y="0" width="1000" height="560" /></svg>
              <canvas ref={canvas} role="img" aria-label={t.hero.modelAlt} style="position:absolute;inset:0;width:100%;height:100%;display:block" />
            </div>
            <p style="margin:10px 4px 0;font-size:13px;color:#4A5762">{t.hero.caption}</p>
          </div>
        </div>
      </section>

      <section class="section" style="padding-bottom:0">
        <div class="wrap" style="display:flex;flex-wrap:wrap;gap:28px">
          <div style="flex:1.5 1 min(100%,520px);min-width:0;background:#E1E9ED;border-radius:12px;padding:clamp(18px,2.4vw,32px)">
            <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:baseline;gap:8px 16px;margin-bottom:10px">
              <h2 class="disp" style="font-weight:600;letter-spacing:-.02em;font-size:30px">{t.route.title}</h2>
              <span style="font-size:14.5px;color:#4A5762">{fmt(t.route.current, { n: open, title: odCopy?.title ?? '' })}</span>
            </div>
            <svg viewBox="60 60 880 490" style="width:100%;height:auto;display:block;border-radius:8px" role="img" aria-label={t.route.mapAlt}>
              <image href={mapSrc} x="0" y="0" width="1000" height="560" />
              <text x="96" y="330" font-family="Atkinson Hyperlegible Next Variable, sans-serif" font-size="17" letter-spacing="3" fill="#8B99A3">{places['BLACK SEA']}</text>
              {DAYS.filter((d) => d.road).map((d) => {
                const a = open === d.n;
                return <path key={d.n} d={roadPath(d)} fill="none" stroke="#D62839" stroke-width={a ? 7 : 3.5} stroke-opacity={a ? 1 : 0.5} stroke-dasharray={a ? '0' : '1 10'} stroke-linecap="round" stroke-linejoin="round" />;
              })}
              {PLACES.map((p) => {
                const on = (p.ds as readonly number[]).includes(open);
                return (
                  <g key={p.n}>
                    <circle cx={p.x} cy={p.y} r={on ? 24 : 0} fill="#D62839" opacity=".3" />
                    <circle cx={p.x} cy={p.y} r={on ? 11 : 8} fill={on ? '#D62839' : '#F8FAFB'} stroke="#1D2A35" stroke-width="3" />
                    <text x={p.tx} y={p.ty} text-anchor={p.a} font-family="Atkinson Hyperlegible Next Variable, sans-serif" font-size="27" font-weight="600" fill="#1D2A35" paint-order="stroke" stroke="#F8FAFB" stroke-width="7" stroke-linejoin="round">{places[p.n]}</text>
                    <text x={p.tx} y={p.ty2} text-anchor={p.a} font-family="Atkinson Hyperlegible Next Variable, sans-serif" font-size="20" font-weight="500" fill="#4A5762" paint-order="stroke" stroke="#F8FAFB" stroke-width="6" stroke-linejoin="round">{pinSub(p.ds)}</text>
                  </g>
                );
              })}
            </svg>
            <p style="margin:8px 0 0;font-size:13.5px;color:#4A5762">{t.route.caption}</p>
          </div>
          <div style="flex:1 1 min(100%,340px);min-width:0;display:flex;flex-direction:column;gap:20px">
            <div style="background:#F8FAFB;border:1px solid #D6DFE4;border-radius:12px;padding:26px 26px 28px">
              <p class="eyebrow" style="font-size:12.5px;margin-bottom:10px">{t.note.title} <span style="text-transform:none;letter-spacing:0;color:#4A5762;font-weight:400">{t.note.sample}</span></p>
              <p style="margin:0;font-size:17px;line-height:1.55">{t.note.text}</p>
              <p class="disp red" style="margin:12px 0 0;font-weight:600;font-size:16px">{t.note.sign}</p>
            </div>
            <dl style="margin:0;display:grid;grid-template-columns:auto 1fr;gap:10px 18px;font-size:15.5px;padding:0 4px">
              <dt style="color:#4A5762">{t.facts.travelling}</dt><dd style="margin:0">{t.facts.travellingValue}</dd>
              <dt style="color:#4A5762">{t.facts.pace}</dt><dd style="margin:0">{t.facts.paceValue}</dd>
              <dt style="color:#4A5762">{t.facts.vehicle}</dt><dd style="margin:0">{t.facts.vehicleValue}</dd>
              <dt style="color:#4A5762">{t.facts.stays}</dt><dd style="margin:0">{t.facts.staysValue}</dd>
              <dt style="color:#4A5762">{t.facts.access}</dt><dd style="margin:0">{t.facts.accessValue}</dd>
            </dl>
          </div>
        </div>
      </section>

      <section class="section">
        <div class="wrap" style="display:flex;flex-wrap:wrap;gap:40px clamp(28px,4vw,56px);align-items:flex-start">
          <div id="days" style="flex:1 1 min(100%,560px);min-width:0">
            <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:flex-end;gap:12px 20px;margin-bottom:18px">
              <h2 class="h-md" style="line-height:1;letter-spacing:-.02em">{t.daysSection.title}</h2>
              <button type="button" aria-pressed={diff ? 'true' : 'false'} onClick={() => setDiff(!diff)} class="st-pillbtn" style={`border-color:#1D2A35;background:${diff ? '#1D2A35' : 'transparent'};color:${diff ? '#fff' : '#1D2A35'}`}>{t.daysSection.showChanges}</button>
            </div>
            <p style="margin:0 0 20px;font-size:14.5px;color:#4A5762">{t.daysSection.disclaimer}</p>
            <div style="display:flex;flex-direction:column;gap:12px">
              {DAYS.map((d) => {
                const isOpen = open === d.n;
                const c = t.days[d.n];
                const badge = diff && d.change ? (d.change === 'new' ? t.daysSection.new : t.daysSection.changed) : '';
                return (
                  <article key={d.n} style={`background:#F8FAFB;border:1.5px solid ${isOpen ? '#1D2A35' : '#D6DFE4'};border-radius:12px;overflow:hidden`}>
                    <h3 style="margin:0">
                      <button type="button" aria-expanded={isOpen ? 'true' : 'false'} onClick={() => setOpen(isOpen ? 0 : d.n)} class="st-dayhd" style={`background:${isOpen ? '#E1E9ED' : '#F8FAFB'}`}>
                        <span class="disp" style="flex:none;width:58px;font-size:42px;line-height:1;color:#D62839;font-weight:400">{d.n}</span>
                        <span style="flex:1;min-width:0">
                          <span class="disp" style="display:block;font-size:24px;line-height:1.15;font-weight:400">{c.title}</span>
                          <span style="display:block;margin-top:2px;font-size:15px;color:#4A5762;font-family:var(--font-body)">{c.route}</span>
                        </span>
                        {badge && <span style="flex:none;padding:3px 10px;border-radius:999px;background:#D62839;color:#FFFFFF;font-size:12.5px;font-weight:600;font-family:var(--font-body)">{badge}</span>}
                        <span style="flex:none;font-size:14px;color:#4A5762;text-align:right;font-family:var(--font-body)">{c.drive}</span>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1D2A35" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style={`flex:none;transform:rotate(${isOpen ? 180 : 0}deg)`}><path d="M6 9l6 6 6-6" /></svg>
                      </button>
                    </h3>
                    {isOpen && (
                      <div style="padding:6px 20px 24px 20px;border-top:1px solid #D6DFE4">
                        <ol style="list-style:none;margin:14px 0 0;padding:0;display:flex;flex-direction:column">
                          {d.items.map((it, k) => (
                            <li key={k} style="display:grid;grid-template-columns:70px 26px minmax(0,1fr);gap:12px;padding:12px 0;border-bottom:1px dashed #D6DFE4;align-items:start">
                              <span style="font-size:14.5px;font-weight:600;color:#4A5762;padding-top:2px">{isTimeWord(it.time) ? t.times[it.time] : it.time}</span>
                              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D62839" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d={ICON[it.kind]} /></svg>
                              <span><span style="display:block;font-size:16.5px;font-weight:500">{c.items[k]?.text}</span>{c.items[k]?.detail && <span style="display:block;font-size:14.5px;color:#4A5762">{c.items[k].detail}</span>}</span>
                            </li>
                          ))}
                        </ol>
                        <p style="margin:14px 0 0;font-size:15px;color:#4A5762"><strong style="color:#1D2A35;font-weight:600">{t.daysSection.overnight}</strong> {c.stay}</p>
                        {d.note && c.note && <p style="margin:14px 0 0;padding:14px 18px;background:#E1E9ED;border-radius:8px;font-size:15.5px;line-height:1.5">{c.note} <span class="red">{t.daysSection.sign}</span></p>}
                        <button type="button" class="st-pillbtn" style="margin-top:16px;border-color:#1D2A35;background:transparent;color:#1D2A35" onClick={() => { setReqOpen(true); setReqSent(false); setReqText(fmt(t.daysSection.askPrefix, { n: d.n })); }}>{t.daysSection.ask}</button>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </div>

          <aside id="quote" aria-label={t.quote.label} style="flex:0 1 420px;min-width:min(100%,320px);display:flex;flex-direction:column;gap:20px">
            <div style="background:#1D2A35;color:#FFFFFF;border-radius:14px;padding:28px 26px">
              <p style="margin:0 0 6px;display:flex;flex-wrap:wrap;gap:8px;align-items:center;font-size:12.5px;letter-spacing:.14em;text-transform:uppercase;color:#8B99A3">{t.quote.title} <span style="text-transform:none;letter-spacing:0;padding:2px 9px;border-radius:999px;border:1px solid #3F424A">{t.quote.illustrative}</span></p>
              <div class="disp" style="font-size:62px;line-height:1.05;letter-spacing:-.02em;font-weight:400">{eur(total)}</div>
              <p style="margin:2px 0 0;font-size:15.5px;color:#C2CED5">{fmt(t.quote.split, { each: eur(total / 2) })}</p>
              {diff && <p style="margin:12px 0 0;display:inline-block;padding:4px 12px;border-radius:999px;background:#D62839;color:#FFFFFF;font-size:14px;font-weight:600">{fmt(t.quote.sinceV1, { amount: eur(total - totalV1, true) })}</p>}
              <button type="button" aria-expanded={qOpen ? 'true' : 'false'} onClick={() => setQOpen(!qOpen)} class="st-calc"><span>{t.quote.how}</span><span aria-hidden="true">{qOpen ? '−' : '+'}</span></button>
              {qOpen && (
                <ul style="list-style:none;margin:6px 0 0;padding:0;display:flex;flex-direction:column;gap:2px">
                  {LINES.map((x) => (
                    <li key={x.id} style="display:flex;justify-content:space-between;gap:12px;padding:9px 0;border-bottom:1px solid #2A2D35;font-size:15px"><span>{t.quote.lines[x.id]} {diff && x.v2 > x.v1 && <span style="color:#FF6B77">{eur(x.v2 - x.v1, true)}</span>}</span><span>{eur(x.v2)}</span></li>
                  ))}
                </ul>
              )}
              <div style="margin-top:18px;display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:16px;font-size:14.5px;color:#C2CED5">
                <div><strong style="display:block;color:#FFFFFF;font-size:15.5px;margin-bottom:4px">{t.quote.included}</strong>{lines(t.quote.includedItems)}</div>
                <div><strong style="display:block;color:#FFFFFF;font-size:15.5px;margin-bottom:4px">{t.quote.notIncluded}</strong>{lines(t.quote.notIncludedItems)}</div>
              </div>
              <p style="margin:16px 0 0;font-size:13px;color:#8B99A3">{t.quote.fine}</p>
            </div>

            <div style="background:#F8FAFB;border:1.5px solid #1D2A35;border-radius:14px;padding:24px 24px 26px">
              {approved && (
                <div role="status">
                  <h3 class="disp" style="font-weight:500;font-size:26px;margin:0 0 8px">{t.decide.approvedTitle}</h3>
                  <p style="margin:0;font-size:16px;color:#4A5762">{t.decide.approvedText}</p>
                </div>
              )}
              {!approved && (
                <>
                  <h3 class="disp" style="font-weight:500;font-size:26px;margin:0 0 6px">{t.decide.title}</h3>
                  <p style="margin:0 0 16px;font-size:15.5px;color:#4A5762">{t.decide.text}</p>
                  {confirming && (
                    <div style="padding:16px 18px;background:#E1E9ED;border-radius:10px;margin-bottom:12px">
                      <p style="margin:0 0 12px;font-size:15.5px"><strong>{t.decide.confirmQ}</strong> {t.decide.confirmText}</p>
                      <div style="display:flex;flex-wrap:wrap;gap:10px">
                        <button type="button" class="st-btn" style="background:#1D2A35;color:#fff;border:0" onClick={() => { setApproved(true); setConfirming(false); setReqOpen(false); }}>{t.decide.yes}</button>
                        <button type="button" class="st-btn" style="background:transparent;color:#1D2A35;border:1.5px solid #1D2A35" onClick={() => setConfirming(false)}>{t.decide.notYet}</button>
                      </div>
                    </div>
                  )}
                  {!confirming && !reqOpen && (
                    <div style="display:flex;flex-direction:column;gap:10px">
                      <button type="button" class="st-btn st-btn--lg" style="background:#D62839;color:#fff;border:0" onClick={() => setConfirming(true)}>{t.decide.approve}</button>
                      <button type="button" class="st-btn st-btn--lg" style="background:transparent;color:#1D2A35;border:1.5px solid #1D2A35" onClick={() => { setReqOpen(true); setReqSent(false); }}>{t.decide.change}</button>
                    </div>
                  )}
                  {reqOpen && (
                    <div style="margin-top:16px">
                      <label for="req" style="display:block;margin-bottom:6px;font-size:15px;font-weight:600">{t.decide.reqLabel}</label>
                      <textarea id="req" rows={4} class="field" value={reqText} onInput={(e) => setReqText((e.target as HTMLTextAreaElement).value)} placeholder={t.decide.reqPlaceholder} />
                      <div style="margin-top:10px;display:flex;flex-wrap:wrap;gap:8px">
                        {t.decide.quick.map((q) => <button key={q} type="button" class="st-quick" onClick={() => setReqText((reqText ? `${reqText} ` : '') + q + '.')}>{q}</button>)}
                      </div>
                      <div style="margin-top:14px;display:flex;flex-wrap:wrap;gap:10px">
                        <button type="button" class="st-btn" disabled={reqText.trim().length < 4} style="background:#1D2A35;color:#fff;border:0" onClick={() => { setSentText(fmt(t.decide.quoted, { text: reqText.trim() })); setReqOpen(false); setReqSent(true); setReqText(''); }}>{t.decide.send}</button>
                        <button type="button" class="tb-textlink" onClick={() => setReqOpen(false)}>{t.decide.cancel}</button>
                      </div>
                    </div>
                  )}
                  {reqSent && !reqOpen && (
                    <div style="margin-top:4px;padding:16px 18px;background:#E1E9ED;border-radius:10px" role="status">
                      <strong style="font-size:16px">{t.decide.sentTitle}</strong>
                      <p style="margin:4px 0 0;font-size:15.5px;color:#4A5762">{t.decide.sentText}</p>
                    </div>
                  )}
                </>
              )}
              <p style="margin:16px 0 0;font-size:14.5px;color:#4A5762">{t.decide.talk} {whatsapp ? <a href={`https://wa.me/${whatsapp}`} style="color:#1D2A35;font-weight:600" rel="noopener">{t.decide.whatsapp}</a> : <a href={l(lang, '/contact')} style="color:#1D2A35;font-weight:600">{t.decide.message}</a>}</p>
            </div>

            <div style="background:#E1E9ED;border-radius:14px;padding:24px 26px">
              <h3 class="disp" style="font-weight:500;font-size:24px;margin:0 0 14px">{v.title}</h3>
              <ol style="list-style:none;margin:0;padding:0;display:flex;flex-direction:column">
                {versions.map((x, k) => (
                  <li key={k} style="display:flex;gap:14px;padding-bottom:18px">
                    <span aria-hidden="true" style={`flex:none;margin-top:6px;width:14px;height:14px;border-radius:50%;background:${x.dot};border:2px solid #1D2A35`} />
                    <div style="min-width:0"><strong style="font-size:16px">{x.title}</strong> <span style="font-size:13.5px;color:#4A5762">{x.meta}</span><p style="margin:2px 0 0;font-size:15px;color:#4A5762">{x.body}</p></div>
                  </li>
                ))}
              </ol>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
