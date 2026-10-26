import { useEffect, useRef, useState } from 'preact/hooks';
import { DAYS, ICON, LINES, PLACES, eur, roadPath } from '../../data/studio';
import { canLoad3D, mountTerrain, whenIdle, type Terrain } from '../../scripts/terrain';

const QUICK = ['Another night here', 'A slower day', 'Swap a stop', 'A question about the price'];

export default function TripStudio({ mapSrc, whatsapp }: { mapSrc: string; whatsapp?: string }) {
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
          pins: [['Tbilisi', 'Tbilisi'], ['Stepantsminda', 'Kazbegi'], ['Telavi', 'Telavi'], ['Sighnaghi', 'Sighnaghi'], ['Kutaisi', 'Kutaisi'], ['Batumi', 'Batumi']],
          elevation: 38, overviewYaw: -0.32, fallback: fb.current,
        });
      } catch { scene = null; }
      if (!scene && !dead) setFlat(true);
    });
    const t = setTimeout(() => { if (!scene && fb.current && fb.current.style.display !== 'none') setFlat(true); }, 5000);
    return () => { dead = true; clearTimeout(t); scene?.dispose(); };
  }, []);

  const od = DAYS.find((d) => d.n === open);
  const total = LINES.reduce((a, l) => a + l.v2, 0);
  const status = approved ? { t: 'Version 2 approved', bg: '#14161A', fg: '#FFFFFF' }
    : reqSent ? { t: 'Change requested — with Rezo', bg: '#D62839', fg: '#14161A' }
    : { t: 'Proposal v2 · awaiting your review', bg: '#F4F4F5', fg: '#14161A' };

  const versions = [
    ...(reqSent ? [{ title: 'Your request', meta: 'waiting for Rezo', body: sentText, dot: '#FFFFFF' }] : []),
    { title: 'Version 2', meta: 'current · from Rezo', body: 'Third night in Kazbegi with a Juta valley day. Long drive to Kutaisi split at Uplistsikhe.', dot: '#D62839' },
    { title: 'Your request', meta: 'after v1', body: '“Can we spend another night in the mountains?”', dot: '#FFFFFF' },
    { title: 'Version 1', meta: 'first proposal', body: `10 days · ${eur(4250)}`, dot: '#14161A' },
  ];

  return (
    <div class="st">
      <div class="st-banner">Design sample — traveller names, dates, prices and times are illustrative. Real proposals are written by Rezo.</div>
      <header class="st-hd">
        <a href="/" class="brand">
          <svg width="32" height="32" viewBox="0 0 34 34" fill="none" aria-hidden="true"><circle cx="17" cy="17" r="16" stroke="#D62839" stroke-width="1.5" /><path d="M8 24C12 10 16 26 20 15S25 12 26 9" stroke="#14161A" stroke-width="2" stroke-linecap="round" /><circle cx="8" cy="24" r="2.4" fill="#D62839" /><circle cx="26" cy="9" r="2.4" fill="#D62839" /></svg>
          <span class="brand-name" style="font-weight:400;font-size:21px">Voyage Georgia <span class="red">Rezo</span></span>
        </a>
        <span class="st-private"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>Private link, just for you</span>
        <span class="st-status" style={`background:${status.bg};color:${status.fg}`} role="status">{status.t}</span>
      </header>

      <section class="st-hero">
        <div class="wrap st-hero-in">
          <div style="flex:1 1 min(100%,400px);min-width:0">
            <p class="eyebrow" style="margin-bottom:20px">Prepared for Anna &amp; Daniel · Proposal v2</p>
            <h1 style="font-size:clamp(40px,5vw,76px);line-height:1;letter-spacing:-.035em">Your Personal Georgian Journey</h1>
            <p class="disp red" style="margin:14px 0 0;font-weight:600;font-size:clamp(24px,2.6vw,36px);letter-spacing:-.02em">Designed by Rezo</p>
            <p style="margin:22px 0 0;max-width:500px;font-size:18px;color:#52525B">Eleven days from the capital to the mountains, the vineyards and the sea — at the slow pace you asked for.</p>
            <ul style="list-style:none;margin:26px 0 0;padding:0;display:flex;flex-wrap:wrap;gap:10px">
              {['11 days', 'September 2027', '2 travellers', 'Slow & spacious'].map((x) => <li key={x} class="pill">{x}</li>)}
            </ul>
            <div style="margin-top:30px;display:flex;flex-wrap:wrap;gap:12px">
              <a href="#days" class="btn btn--primary btn--sm" style="min-height:52px">Walk through the days</a>
              <a href="#quote" class="btn btn--secondary btn--sm" style="min-height:52px">See the quotation</a>
            </div>
          </div>
          <div style="flex:1.3 1 min(100%,460px);min-width:0">
            <div style="position:relative;width:100%;aspect-ratio:3/2;min-height:300px">
              <svg ref={fb} viewBox="150 100 800 460" preserveAspectRatio="xMidYMid meet" style={`position:absolute;inset:0;width:100%;height:100%;opacity:${flat ? 1 : 0};transition:opacity .4s`} role="img" aria-label="Map of Georgia"><image href={mapSrc} x="0" y="0" width="1000" height="560" /></svg>
              <canvas ref={canvas} role="img" aria-label="Three-dimensional model of Georgia with the eleven-day route from Tbilisi to Kazbegi, Kakheti, Kutaisi and Batumi" style="position:absolute;inset:0;width:100%;height:100%;display:block" />
            </div>
            <p style="margin:10px 4px 0;font-size:13px;color:#52525B">Your route over Georgia’s terrain, following real roads. Move your pointer to tilt it. Terrain from SRTM, GMTED2010 and ETOPO1 elevation data, heights exaggerated 9×.</p>
          </div>
        </div>
      </section>

      <section class="section" style="padding-bottom:0">
        <div class="wrap" style="display:flex;flex-wrap:wrap;gap:28px">
          <div style="flex:1.5 1 min(100%,520px);min-width:0;background:#F4F4F5;border-radius:12px;padding:clamp(18px,2.4vw,32px)">
            <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:baseline;gap:8px 16px;margin-bottom:10px">
              <h2 class="disp" style="font-weight:600;letter-spacing:-.02em;font-size:30px">The route</h2>
              <span style="font-size:14.5px;color:#52525B">Day {open} · {od?.title}</span>
            </div>
            <svg viewBox="60 60 880 490" style="width:100%;height:auto;display:block;border-radius:8px" role="img" aria-label="Map of Georgia with the journey drawn along real roads from Tbilisi to Kazbegi, Kakheti, Kutaisi and Batumi">
              <image href={mapSrc} x="0" y="0" width="1000" height="560" />
              <text x="96" y="330" font-family="Inter Variable, Inter, sans-serif" font-size="17" letter-spacing="3" fill="#A1A1AA">BLACK SEA</text>
              {DAYS.filter((d) => d.road).map((d) => {
                const a = open === d.n;
                return <path key={d.n} d={roadPath(d)} fill="none" stroke="#D62839" stroke-width={a ? 7 : 3.5} stroke-opacity={a ? 1 : 0.5} stroke-dasharray={a ? '0' : '1 10'} stroke-linecap="round" stroke-linejoin="round" />;
              })}
              {PLACES.map((p) => {
                const on = (p.ds as readonly number[]).includes(open);
                return (
                  <g key={p.n}>
                    <circle cx={p.x} cy={p.y} r={on ? 24 : 0} fill="#D62839" opacity=".3" />
                    <circle cx={p.x} cy={p.y} r={on ? 11 : 8} fill={on ? '#D62839' : '#FAFAFA'} stroke="#14161A" stroke-width="3" />
                    <text x={p.tx} y={p.ty} text-anchor={p.a} font-family="Inter Variable, Inter, sans-serif" font-size="27" font-weight="600" fill="#14161A" paint-order="stroke" stroke="#FAFAFA" stroke-width="7" stroke-linejoin="round">{p.n}</text>
                    <text x={p.tx} y={p.ty2} text-anchor={p.a} font-family="Inter Variable, Inter, sans-serif" font-size="20" font-weight="500" fill="#52525B" paint-order="stroke" stroke="#FAFAFA" stroke-width="6" stroke-linejoin="round">{p.sub}</text>
                  </g>
                );
              })}
            </svg>
            <p style="margin:8px 0 0;font-size:13.5px;color:#52525B">Routes follow real highways over real terrain. Pick a day below to see its leg.</p>
          </div>
          <div style="flex:1 1 min(100%,340px);min-width:0;display:flex;flex-direction:column;gap:20px">
            <div style="background:#FAFAFA;border:1px solid #E4E4E7;border-radius:12px;padding:26px 26px 28px">
              <p class="eyebrow" style="font-size:12.5px;margin-bottom:10px">A note from Rezo <span style="text-transform:none;letter-spacing:0;color:#52525B;font-weight:400">· sample</span></p>
              <p style="margin:0;font-size:17px;line-height:1.55">Anna, Daniel — you asked for another night in the mountains, so Kazbegi now has three. I moved that day’s walk to Juta, which is quieter. The drive to Kutaisi is long, so I broke it at Uplistsikhe. Tell me what feels wrong — that’s what the button is for.</p>
              <p class="disp red" style="margin:12px 0 0;font-weight:600;font-size:16px">— Rezo</p>
            </div>
            <dl style="margin:0;display:grid;grid-template-columns:auto 1fr;gap:10px 18px;font-size:15.5px;padding:0 4px">
              <dt style="color:#52525B">Travelling</dt><dd style="margin:0">2 adults</dd>
              <dt style="color:#52525B">Pace</dt><dd style="margin:0">Slow &amp; spacious</dd>
              <dt style="color:#52525B">Vehicle</dt><dd style="margin:0">[Rezo assigns — depends on group and roads]</dd>
              <dt style="color:#52525B">Stays</dt><dd style="margin:0">10 nights · [hotels — Rezo to add]</dd>
              <dt style="color:#52525B">Access</dt><dd style="margin:0">No special requirements noted</dd>
            </dl>
          </div>
        </div>
      </section>

      <section class="section">
        <div class="wrap" style="display:flex;flex-wrap:wrap;gap:40px clamp(28px,4vw,56px);align-items:flex-start">
          <div id="days" style="flex:1 1 min(100%,560px);min-width:0">
            <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:flex-end;gap:12px 20px;margin-bottom:18px">
              <h2 class="h-md" style="line-height:1;letter-spacing:-.02em">Day by day</h2>
              <button type="button" aria-pressed={diff ? 'true' : 'false'} onClick={() => setDiff(!diff)} class="st-pillbtn" style={`border-color:#14161A;background:${diff ? '#14161A' : 'transparent'};color:${diff ? '#fff' : '#14161A'}`}>Show changes since v1</button>
            </div>
            <p style="margin:0 0 20px;font-size:14.5px;color:#52525B">Drive times are Rezo’s estimates including normal stops. Roads and weather can change them.</p>
            <div style="display:flex;flex-direction:column;gap:12px">
              {DAYS.map((d) => {
                const isOpen = open === d.n;
                const badge = diff && d.change ? (d.change === 'new' ? 'New in v2' : 'Changed in v2') : '';
                return (
                  <article key={d.n} style={`background:#FAFAFA;border:1.5px solid ${isOpen ? '#14161A' : '#E4E4E7'};border-radius:12px;overflow:hidden`}>
                    <h3 style="margin:0">
                      <button type="button" aria-expanded={isOpen ? 'true' : 'false'} onClick={() => setOpen(isOpen ? 0 : d.n)} class="st-dayhd" style={`background:${isOpen ? '#F4F4F5' : '#FAFAFA'}`}>
                        <span class="disp" style="flex:none;width:58px;font-size:42px;line-height:1;color:#D62839;font-weight:400">{d.n}</span>
                        <span style="flex:1;min-width:0">
                          <span class="disp" style="display:block;font-size:24px;line-height:1.15;font-weight:400">{d.title}</span>
                          <span style="display:block;margin-top:2px;font-size:15px;color:#52525B;font-family:var(--font-body)">{d.route}</span>
                        </span>
                        {badge && <span style="flex:none;padding:3px 10px;border-radius:999px;background:#D62839;color:#FFFFFF;font-size:12.5px;font-weight:600;font-family:var(--font-body)">{badge}</span>}
                        <span style="flex:none;font-size:14px;color:#52525B;text-align:right;font-family:var(--font-body)">{d.drive}</span>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#14161A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style={`flex:none;transform:rotate(${isOpen ? 180 : 0}deg)`}><path d="M6 9l6 6 6-6" /></svg>
                      </button>
                    </h3>
                    {isOpen && (
                      <div style="padding:6px 20px 24px 20px;border-top:1px solid #E4E4E7">
                        <ol style="list-style:none;margin:14px 0 0;padding:0;display:flex;flex-direction:column">
                          {d.items.map((it) => (
                            <li key={it.time + it.text} style="display:grid;grid-template-columns:70px 26px minmax(0,1fr);gap:12px;padding:12px 0;border-bottom:1px dashed #E4E4E7;align-items:start">
                              <span style="font-size:14.5px;font-weight:600;color:#52525B;padding-top:2px">{it.time}</span>
                              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D62839" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d={ICON[it.kind]} /></svg>
                              <span><span style="display:block;font-size:16.5px;font-weight:500">{it.text}</span>{it.detail && <span style="display:block;font-size:14.5px;color:#52525B">{it.detail}</span>}</span>
                            </li>
                          ))}
                        </ol>
                        <p style="margin:14px 0 0;font-size:15px;color:#52525B"><strong style="color:#14161A;font-weight:600">Overnight:</strong> {d.stay}</p>
                        {d.note && <p style="margin:14px 0 0;padding:14px 18px;background:#F4F4F5;border-radius:8px;font-size:15.5px;line-height:1.5">{d.note} <span class="red">— Rezo</span></p>}
                        <button type="button" class="st-pillbtn" style="margin-top:16px;border-color:#14161A;background:transparent;color:#14161A" onClick={() => { setReqOpen(true); setReqSent(false); setReqText(`About day ${d.n}: `); }}>Ask about this day</button>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </div>

          <aside id="quote" aria-label="Quotation and actions" style="flex:0 1 420px;min-width:min(100%,320px);display:flex;flex-direction:column;gap:20px">
            <div style="background:#14161A;color:#FFFFFF;border-radius:14px;padding:28px 26px">
              <p style="margin:0 0 6px;display:flex;flex-wrap:wrap;gap:8px;align-items:center;font-size:12.5px;letter-spacing:.14em;text-transform:uppercase;color:#A1A1AA">Your quotation <span style="text-transform:none;letter-spacing:0;padding:2px 9px;border-radius:999px;border:1px solid #3F424A">illustrative figures</span></p>
              <div class="disp" style="font-size:62px;line-height:1.05;letter-spacing:-.02em;font-weight:400">{eur(total)}</div>
              <p style="margin:2px 0 0;font-size:15.5px;color:#D4D4D8">for 2 travellers · {eur(total / 2)} each</p>
              {diff && <p style="margin:12px 0 0;display:inline-block;padding:4px 12px;border-radius:999px;background:#D62839;color:#FFFFFF;font-size:14px;font-weight:600">+€400 since v1 · one more night, one more day</p>}
              <button type="button" aria-expanded={qOpen ? 'true' : 'false'} onClick={() => setQOpen(!qOpen)} class="st-calc"><span>How Rezo calculated this</span><span aria-hidden="true">{qOpen ? '−' : '+'}</span></button>
              {qOpen && (
                <ul style="list-style:none;margin:6px 0 0;padding:0;display:flex;flex-direction:column;gap:2px">
                  {LINES.map((l) => (
                    <li key={l.label} style="display:flex;justify-content:space-between;gap:12px;padding:9px 0;border-bottom:1px solid #2A2D35;font-size:15px"><span>{l.label} {diff && l.v2 > l.v1 && <span style="color:#FF6B77">+{eur(l.v2 - l.v1)}</span>}</span><span>{eur(l.v2)}</span></li>
                  ))}
                </ul>
              )}
              <div style="margin-top:18px;display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:16px;font-size:14.5px;color:#D4D4D8">
                <div><strong style="display:block;color:#FFFFFF;font-size:15.5px;margin-bottom:4px">Included</strong>Private vehicle with driver, all 11 days<br />Route design and trip support from Rezo<br />10 nights’ accommodation as listed<br />Entrance fees for listed visits</div>
                <div><strong style="display:block;color:#FFFFFF;font-size:15.5px;margin-bottom:4px">Not included</strong>International flights<br />Travel insurance<br />Most meals and drinks<br />Personal expenses and tips</div>
              </div>
              <p style="margin:16px 0 0;font-size:13px;color:#A1A1AA">Sample inclusions — Rezo edits these for every trip. Payment terms: [to be supplied by Rezo].</p>
            </div>

            <div style="background:#FAFAFA;border:1.5px solid #14161A;border-radius:14px;padding:24px 24px 26px">
              {approved && (
                <div role="status">
                  <h3 class="disp" style="font-weight:500;font-size:26px;margin:0 0 8px">Version 2 approved</h3>
                  <p style="margin:0;font-size:16px;color:#52525B">Thank you. Rezo will confirm availability and the next steps with you directly. Until he does, nothing is booked.</p>
                </div>
              )}
              {!approved && (
                <>
                  <h3 class="disp" style="font-weight:500;font-size:26px;margin:0 0 6px">Happy with it?</h3>
                  <p style="margin:0 0 16px;font-size:15.5px;color:#52525B">This is a proposal. Prices and times are final only when Rezo confirms them.</p>
                  {confirming && (
                    <div style="padding:16px 18px;background:#F4F4F5;border-radius:10px;margin-bottom:12px">
                      <p style="margin:0 0 12px;font-size:15.5px"><strong>Approve version 2 as it stands?</strong> Rezo will then confirm availability and arrange the next steps with you.</p>
                      <div style="display:flex;flex-wrap:wrap;gap:10px">
                        <button type="button" class="st-btn" style="background:#14161A;color:#fff;border:0" onClick={() => { setApproved(true); setConfirming(false); setReqOpen(false); }}>Yes, approve</button>
                        <button type="button" class="st-btn" style="background:transparent;color:#14161A;border:1.5px solid #14161A" onClick={() => setConfirming(false)}>Not yet</button>
                      </div>
                    </div>
                  )}
                  {!confirming && !reqOpen && (
                    <div style="display:flex;flex-direction:column;gap:10px">
                      <button type="button" class="st-btn st-btn--lg" style="background:#D62839;color:#fff;border:0" onClick={() => setConfirming(true)}>Approve this version</button>
                      <button type="button" class="st-btn st-btn--lg" style="background:transparent;color:#14161A;border:1.5px solid #14161A" onClick={() => { setReqOpen(true); setReqSent(false); }}>Ask for a change</button>
                    </div>
                  )}
                  {reqOpen && (
                    <div style="margin-top:16px">
                      <label for="req" style="display:block;margin-bottom:6px;font-size:15px;font-weight:600">What would you like to change?</label>
                      <textarea id="req" rows={4} class="field" value={reqText} onInput={(e) => setReqText((e.target as HTMLTextAreaElement).value)} placeholder="Can we spend another night in the mountains?" />
                      <div style="margin-top:10px;display:flex;flex-wrap:wrap;gap:8px">
                        {QUICK.map((q) => <button key={q} type="button" class="st-quick" onClick={() => setReqText((reqText ? `${reqText} ` : '') + q + '.')}>{q}</button>)}
                      </div>
                      <div style="margin-top:14px;display:flex;flex-wrap:wrap;gap:10px">
                        <button type="button" class="st-btn" disabled={reqText.trim().length < 4} style="background:#14161A;color:#fff;border:0" onClick={() => { setSentText(`“${reqText.trim()}”`); setReqOpen(false); setReqSent(true); setReqText(''); }}>Send to Rezo</button>
                        <button type="button" class="tb-textlink" onClick={() => setReqOpen(false)}>Cancel</button>
                      </div>
                    </div>
                  )}
                  {reqSent && !reqOpen && (
                    <div style="margin-top:4px;padding:16px 18px;background:#F4F4F5;border-radius:10px" role="status">
                      <strong style="font-size:16px">Sent to Rezo.</strong>
                      <p style="margin:4px 0 0;font-size:15.5px;color:#52525B">He reads every request himself. If the plan or the price changes, he’ll publish a new version here and you can compare it with this one.</p>
                    </div>
                  )}
                </>
              )}
              <p style="margin:16px 0 0;font-size:14.5px;color:#52525B">Rather talk it through? {whatsapp ? <a href={`https://wa.me/${whatsapp}`} style="color:#14161A;font-weight:600" rel="noopener">Message Rezo on WhatsApp</a> : <a href="/contact" style="color:#14161A;font-weight:600">Message Rezo</a>}</p>
            </div>

            <div style="background:#F4F4F5;border-radius:14px;padding:24px 26px">
              <h3 class="disp" style="font-weight:500;font-size:24px;margin:0 0 14px">Versions</h3>
              <ol style="list-style:none;margin:0;padding:0;display:flex;flex-direction:column">
                {versions.map((v, k) => (
                  <li key={k} style="display:flex;gap:14px;padding-bottom:18px">
                    <span aria-hidden="true" style={`flex:none;margin-top:6px;width:14px;height:14px;border-radius:50%;background:${v.dot};border:2px solid #14161A`} />
                    <div style="min-width:0"><strong style="font-size:16px">{v.title}</strong> <span style="font-size:13.5px;color:#52525B">{v.meta}</span><p style="margin:2px 0 0;font-size:15px;color:#52525B">{v.body}</p></div>
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
