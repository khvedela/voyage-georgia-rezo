/**
 * Drives the homepage model (src/components/home/World.astro): turns scroll into drive progress, keeps the HTML
 * labels pinned to the model, and carries the visitor's picks into the trip builder.
 */
import { canLoad3D, whenIdle, sceneQuality } from './terrain';
import { scrollToY } from './smooth';
import { buildTimeline, locate, stopCenter } from './drive-timeline';
import { regions, stops } from '../data/drive';

interface World {
  setProgress(p: number): void;
  setSelected(ids: string[]): void;
  setHover(id: string | null): void;
  setFraming(f: Record<string, number>): void;
  regionScreen(id: string): { x: number; y: number; visible: boolean } | null;
  dispose(): void;
}

const world = document.querySelector<HTMLElement>('.world');
const stage = world?.querySelector<HTMLElement>('.w-stage');
const canvas = document.getElementById('world3d') as HTMLCanvasElement | null;
const labelsRoot = world?.querySelector<HTMLElement>('.w-labels');
const labels = [...(world?.querySelectorAll<HTMLButtonElement>('.w-label') ?? [])];
const cards = new Map([...(world?.querySelectorAll<HTMLElement>('.w-card') ?? [])].map((c) => [c.dataset.card!, c]));
const dots = [...(world?.querySelectorAll<HTMLButtonElement>('.w-dot') ?? [])];
const fill = world?.querySelector<HTMLElement>('[data-bar-fill]');
const trayList = world?.querySelector<HTMLElement>('[data-tray-list]');
const trayGo = world?.querySelector<HTMLAnchorElement>('[data-tray-go]');
const phone = window.matchMedia('(max-width: 760px)');
const TL = buildTimeline(stops.length);

let scene: World | null = null;
let picked: string[] = [];

// ---- picks: the flags, the tray, and the hand-off to the builder ----
try { picked = JSON.parse(sessionStorage.getItem('vgr:picks') || '[]').filter((id: string) => regions.some((r) => r.id === id)); } catch { picked = []; }

const listPhrase = (items: string[]) => (items.length < 2 ? items.join('') : `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`);
function renderPicks() {
  labels.forEach((b) => b.setAttribute('aria-pressed', String(picked.includes(b.dataset.region!))));
  const chosen = regions.filter((r) => picked.includes(r.id));
  if (trayList) {
    trayList.innerHTML = chosen.length
      ? `<b>${listPhrase(chosen.map((r) => r.name))}</b>`
      : 'Nothing picked yet. Tap a region on the model.';
  }
  if (trayGo) trayGo.textContent = chosen.length ? `Plan ${chosen.length === 1 ? 'it' : 'these'} with Rezo` : 'Design my trip';
  scene?.setSelected(picked);
  try { sessionStorage.setItem('vgr:picks', JSON.stringify(picked)); } catch { /* storage blocked: picks last for this page only */ }
}
function toggle(id: string) {
  picked = picked.includes(id) ? picked.filter((x) => x !== id) : [...picked, id];
  renderPicks();
}
labels.forEach((b) => {
  b.addEventListener('click', () => toggle(b.dataset.region!));
  b.addEventListener('pointerenter', () => scene?.setHover(b.dataset.region!));
  b.addEventListener('pointerleave', () => scene?.setHover(null));
});
// The builder opens on its "write to Rezo" step with the picks already in a sentence.
trayGo?.addEventListener('click', () => {
  const chosen = regions.filter((r) => picked.includes(r.id));
  if (!chosen.length) return;
  try { sessionStorage.setItem('vgr:idea', `I’d love to see ${listPhrase(chosen.map((r) => r.phrase))}.`); } catch { /* the builder simply starts empty */ }
});
renderPicks();

// ---- scroll → progress ----
function geometry() {
  const vh = window.innerHeight;
  const top = (world?.getBoundingClientRect().top ?? 0) + window.scrollY;
  const range = (world?.offsetHeight ?? 0) - (stage?.offsetHeight ?? 0);
  const lead = vh * 0.35; // a little scroll before the drive starts, so the opening is not left by accident
  const hold = vh * 0.8;  // the finished route stays on screen for a moment at the end
  return { top, lead, span: Math.max(1, range - lead - hold) };
}
function progress() {
  const g = geometry();
  return Math.min(1, Math.max(0, (window.scrollY - g.top - g.lead) / g.span));
}
function yFor(p: number) { const g = geometry(); return g.top + g.lead + p * g.span; }

let phase = '';
let card = '';
function setPhase(p: string) { if (p !== phase && world) { phase = p; world.dataset.phase = p; } }
function show(id: string) {
  if (id === card) return;
  card = id;
  cards.forEach((el, k) => el.classList.toggle('is-on', k === id));
}

function update() {
  raf = 0;
  if (!world || world.classList.contains('is-flat')) return;
  const p = progress();
  scene?.setProgress(p);
  if (p <= 0) { setPhase('pick'); show(''); }
  else {
    const { seg, t } = locate(TL, p);
    let id = '';
    if (seg.kind === 'in') id = t > 0.5 ? 's0' : '';
    else if (seg.kind === 'dwell') id = `s${seg.i}`;
    else if (seg.kind === 'travel') id = t < 0.18 ? `s${seg.i}` : t > 0.85 ? `s${seg.i + 1}` : `l${seg.i}`;
    else id = t < 0.25 ? `s${seg.i}` : '';
    setPhase(seg.kind === 'out' && t >= 0.25 ? 'outro' : 'drive');
    show(id);
    // the route bar fills from stop to stop
    const centers = stops.map((_, i) => stopCenter(TL, i));
    let f = 0, at = -1;
    for (let i = 0; i < centers.length; i++) if (p >= centers[i]) { at = i; f = i; }
    if (at >= 0 && at < centers.length - 1) f = at + Math.min(1, (p - centers[at]) / (centers[at + 1] - centers[at]));
    fill?.style.setProperty('--fill', String(Math.max(0, f) / (stops.length - 1)));
    const cur = seg.kind === 'travel' ? (t > 0.5 ? seg.i + 1 : seg.i) : seg.i;
    dots.forEach((d, k) => { d.setAttribute('aria-current', String(k === cur)); d.classList.toggle('is-done', k < cur); });
  }
}
let raf = 0;
const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', () => { onScroll(); frame(); });

dots.forEach((d, k) => d.addEventListener('click', () => scrollToY(yFor(stopCenter(TL, k)))));
world?.querySelector('[data-back-to-pick]')?.addEventListener('click', (e) => { e.preventDefault(); scrollToY(geometry().top - 1, 2.2); });

// ---- labels follow their regions on the model ----
function placeLabels() {
  if (!scene || phone.matches || phase !== 'pick') return;
  const W = stage?.clientWidth ?? 0, H = stage?.clientHeight ?? 0;
  labels.forEach((el, k) => {
    const s = scene!.regionScreen(el.dataset.region!);
    const off = !s || !s.visible || s.x < 0 || s.x > W || s.y < 40 || s.y > H;
    el.classList.toggle('is-off', off);
    el.style.setProperty('--k', String(k));
    if (s && !off) el.style.transform = `translate3d(${s.x.toFixed(1)}px, ${s.y.toFixed(1)}px, 0)`;
  });
}

// ---- framing: keep the model clear of the copy at every size ----
function frame() {
  if (!scene) return;
  if (phone.matches) {
    // the model sits between the headline and the chips
    scene.setFraming({ sx: 0, sy: 0.02, fitW: 1.02, fitH: 0.5, driveSx: 0, driveSy: -0.14 });
  } else {
    const W = stage?.clientWidth || window.innerWidth;
    const intro = world?.querySelector<HTMLElement>('.w-intro');
    const left = intro ? intro.getBoundingClientRect().right / W : 0.4;
    // the model fills the space right of the headline (its empty sea corner may slip under the copy a little);
    // in the drive the stop sits right of the card
    const from = Math.min(0.5, left * 0.7), to = 0.985;
    scene.setFraming({ sx: (from + to) / 2 - 0.5, sy: 0.07, fitW: (to - from) * 0.86, fitH: 0.8, driveSx: 0.16, driveSy: -0.04 });
  }
}

// ---- start ----
function goFlat() {
  world?.classList.add('is-flat');
  world?.setAttribute('data-phase', 'pick');
  cards.forEach((el) => el.classList.add('is-on'));
}

if (!world || !canvas || !canLoad3D()) goFlat();
else {
  update();
  whenIdle(async () => {
    try {
      const { mountWorld } = await import('./world3d.js');
      scene = mountWorld(canvas, {
        ...sceneQuality(),
        regions: regions.map((r) => ({ id: r.id, node: r.node })),
        stops: stops.map((s) => ({ key: s.key, node: s.node })),
        onPick: (id: string) => toggle(id),
        onFrame: placeLabels,
        onReady: () => {
          world.classList.add('is-live');
          window.setTimeout(() => labelsRoot?.classList.add('is-ready'), 250);
        },
        onFail: () => { scene?.dispose(); scene = null; goFlat(); },
      }) as World | null;
    } catch (e) {
      console.warn('[world] the 3D model could not be mounted; showing the still render', e);
      scene = null;
    }
    if (!scene) { goFlat(); return; }
    frame();
    scene.setSelected(picked);
    update();
  }, { delay: 200 });
}
phone.addEventListener('change', frame);
document.addEventListener('astro:before-swap', () => scene?.dispose());
