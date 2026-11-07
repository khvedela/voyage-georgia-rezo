/**
 * Drives the homepage model (src/components/home/World.astro). Two things happen on it:
 *   - picking: tap regions to plant flags; the picks are joined into a route on the model, the tray reads them out
 *     in travel order with a rough length, and the hand-off carries them into the trip builder;
 *   - the sample route: a play button runs the drive on a clock (pause, jump to a stop, replay, leave).
 * The page itself scrolls normally: nothing here listens to scroll.
 */
import { canLoad3D, whenIdle, sceneQuality } from './terrain';
import { scrollToY } from './smooth';
import { buildTimeline, locate, stopCenter } from './drive-timeline';
import { regions, stops, tripOrder } from '../data/drive';
import { fmt, listFormat, plural, type Locale, type Plural } from '../i18n/utils';

interface World {
  setProgress(p: number): void;
  setSelected(ids: string[]): void;
  setPlan(ids: string[]): void;
  setHover(id: string | null): void;
  setFraming(f: Record<string, number>): void;
  regionScreen(id: string): { x: number; y: number; visible: boolean } | null;
  dispose(): void;
}

/** How long the whole sample route takes to play. The timeline's weights share this out (drive-timeline.ts). */
const PLAY_SECONDS = 34;
/** With reduced motion the route steps from stop to stop instead of flying, one stop per this many seconds. */
const STEP_SECONDS = 6;

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
const pauseBtn = world?.querySelector<HTMLButtonElement>('[data-pause]');
const phone = window.matchMedia('(max-width: 760px)');
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const TL = buildTimeline(stops.length);
const centers = stops.map((_, i) => stopCenter(TL, i));
// Copy in the page's language, rendered by World.astro (names and phrases sit on each region's button).
const T: {
  lang: Locale; trayEmpty: string; goOne: string; goMany: string; go: string; idea: string;
  days: Plural; about: string; pause: string; resume: string;
} = JSON.parse(world?.dataset.i18n || '{}');
const word = (id: string, k: 'name' | 'phrase') => labels.find((b) => b.dataset.region === id)?.dataset[k] ?? id;

let scene: World | null = null;
let picked: string[] = [];

// ---- picks: the flags, the route between them, the tray, and the hand-off to the builder ----
try { picked = JSON.parse(sessionStorage.getItem('vgr:picks') || '[]').filter((id: string) => regions.some((r) => r.id === id)); } catch { picked = []; }

const listPhrase = (items: string[]) => listFormat(T.lang ?? 'en', items);
const inOrder = () => tripOrder.filter((id) => picked.includes(id));
function renderPicks() {
  labels.forEach((b) => b.setAttribute('aria-pressed', String(picked.includes(b.dataset.region!))));
  const route = inOrder();
  if (trayList) {
    if (!route.length) trayList.textContent = T.trayEmpty;
    else {
      const days = route.reduce((s, id) => s + (regions.find((r) => r.id === id)?.days ?? 0), 0);
      const names = document.createElement('b');
      names.textContent = route.map((id) => word(id, 'name')).join(' → ');
      const len = document.createElement('span');
      len.className = 'w-tray-days';
      len.textContent = fmt(T.about, { days: plural(T.lang, days, T.days) });
      trayList.replaceChildren(names, len);
    }
  }
  if (trayGo) trayGo.textContent = route.length ? (route.length === 1 ? T.goOne : T.goMany) : T.go;
  scene?.setSelected(picked);
  scene?.setPlan(route);
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
  const route = inOrder();
  if (!route.length) return;
  try { sessionStorage.setItem('vgr:idea', fmt(T.idea, { places: listPhrase(route.map((id) => word(id, 'phrase'))) })); } catch { /* the builder simply starts empty */ }
});
renderPicks();

// ---- the sample route, on a clock ----
let p = 0;
let playing = false;
let seek: { from: number; to: number; t0: number; ms: number; then: 'play' | 'hold' } | null = null;
let raf = 0, lastT = 0, stepT = 0;
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

function tick(now: number) {
  raf = 0;
  const dt = lastT ? Math.min(0.1, (now - lastT) / 1000) : 0;
  lastT = now;
  if (seek) {
    const k = seek.ms ? clamp01((now - seek.t0) / seek.ms) : 1;
    p = seek.from + (seek.to - seek.from) * easeInOut(k);
    if (k >= 1) { p = seek.to; playing = seek.then === 'play' && p > 0 && p < 1; seek = null; stepT = 0; }
  } else if (playing && reduce) {
    // no flying: hold each stop, then cut to the next one
    stepT += dt;
    if (stepT >= STEP_SECONDS) {
      stepT = 0;
      const next = centers.find((c) => c > p + 1e-4);
      p = next ?? 1;
    }
  } else if (playing) p = Math.min(1, p + dt / PLAY_SECONDS);
  if (p >= 1) playing = false;
  update();
  if (seek || playing) raf = requestAnimationFrame(tick);
  else lastT = 0;
}
function run() { if (!raf) { lastT = 0; raf = requestAnimationFrame(tick); } }
/** Glide to progress `to`; the glide's length follows the distance, so a jump to the next stop is quick. */
function glide(to: number, then: 'play' | 'hold') {
  const ms = reduce ? 0 : Math.min(2400, Math.max(700, Math.abs(to - p) * PLAY_SECONDS * 260));
  seek = { from: p, to, t0: performance.now(), ms, then };
  playing = false;
  run();
}
function play() {
  if (p <= 0 || p >= 1) { seek = null; p = reduce ? centers[0] : 1e-4; }
  playing = true;
  stepT = 0;
  bringIntoView();
  run();
}
function pause() { playing = false; seek = null; update(); }
function leave() { glide(0, 'hold'); }
/** Is the tour on screen (playing, gliding, or paused part-way)? */
const touring = () => p > 0 || !!seek;

// Whoever presses play should see the whole stage, not half of it under the header.
function bringIntoView() {
  if (!world) return;
  const header = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 0;
  const off = world.getBoundingClientRect().top - header;
  if (Math.abs(off) > 40) scrollToY(window.scrollY + off, 0.9);
}

// ---- what the page shows for the current progress ----
let phase = '';
let card = '';
function setPhase(ph: string) { if (ph !== phase && world) { phase = ph; world.dataset.phase = ph; } }
function show(id: string) {
  if (id === card) return;
  card = id;
  cards.forEach((el, k) => el.classList.toggle('is-on', k === id));
}

function update() {
  if (!world || world.classList.contains('is-flat')) return;
  scene?.setProgress(p);
  world.dataset.playing = String(playing || (!!seek && seek.then === 'play'));
  if (pauseBtn) pauseBtn.setAttribute('aria-label', playing ? T.pause : T.resume);
  if (p <= 0 && !seek) { setPhase('pick'); show(''); return; }
  const { seg, t } = locate(TL, p);
  let id = '';
  if (seg.kind === 'in') id = t > 0.6 ? 's0' : '';
  else if (seg.kind === 'dwell') id = `s${seg.i}`;
  else if (seg.kind === 'travel') id = t < 0.12 ? `s${seg.i}` : t > 0.9 ? `s${seg.i + 1}` : `l${seg.i}`;
  else id = t < 0.25 ? `s${seg.i}` : '';
  // gliding home to the opening: the opening's copy comes back straight away, while the camera is still on its way
  const home = !!seek && seek.to === 0;
  setPhase(home ? 'pick' : seg.kind === 'out' && t >= 0.25 ? 'outro' : 'drive');
  show(home ? '' : id);
  // the route bar fills from stop to stop
  let f = 0, at = -1;
  for (let i = 0; i < centers.length; i++) if (p >= centers[i]) { at = i; f = i; }
  if (at >= 0 && at < centers.length - 1) f = at + Math.min(1, (p - centers[at]) / (centers[at + 1] - centers[at]));
  fill?.style.setProperty('--fill', String(Math.max(0, f) / (stops.length - 1)));
  const cur = seg.kind === 'travel' ? (t > 0.5 ? seg.i + 1 : seg.i) : seg.i;
  dots.forEach((d, k) => { d.setAttribute('aria-current', String(k === cur)); d.classList.toggle('is-done', k < cur); });
}

// ---- controls ----
world?.querySelectorAll('[data-play]').forEach((b) => b.addEventListener('click', () => play()));
pauseBtn?.addEventListener('click', () => { if (playing || seek?.then === 'play') pause(); else play(); });
world?.querySelector('[data-replay]')?.addEventListener('click', () => { p = 0; play(); });
world?.querySelectorAll('[data-exit], [data-back-to-pick]').forEach((b) => b.addEventListener('click', (e) => { e.preventDefault(); leave(); }));
// a stop on the bar: go there and wait, so its card can be read
dots.forEach((d, k) => d.addEventListener('click', () => glide(centers[k], 'hold')));
// arrows step through the stops, Escape leaves the tour
document.addEventListener('keydown', (e) => {
  if (!touring() || e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
  const tag = (e.target as HTMLElement | null)?.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
  const at = seek ? seek.to : p;
  if (e.key === 'Escape') { leave(); return; }
  if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
  const next = e.key === 'ArrowRight' ? centers.find((c) => c > at + 1e-4) ?? 1 : [...centers].reverse().find((c) => c < at - 1e-4) ?? centers[0];
  e.preventDefault();
  glide(next, 'hold');
});
// the tour waits while it is off screen or the tab is hidden, and carries on when it is back
let waiting = false;
function hold(away: boolean) {
  if (away && playing) { waiting = true; pause(); }
  else if (!away && waiting) { waiting = false; play(); }
}
if (world && 'IntersectionObserver' in window) {
  new IntersectionObserver((en) => hold(!en[0].isIntersecting), { threshold: 0.35 }).observe(world);
}
document.addEventListener('visibilitychange', () => hold(document.hidden));

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
    // the model sits in the gap between the headline (with the play button) and the chips, however tall the copy
    // runs in each language
    const box = stage?.getBoundingClientRect();
    const intro = world?.querySelector<HTMLElement>('.w-intro')?.getBoundingClientRect();
    const chips = labelsRoot?.getBoundingClientRect();
    if (box && intro && chips && box.height > 0) {
      const top = intro.bottom - box.top + 8, bottom = chips.top - box.top - 4;
      const gap = Math.max(0.24, (bottom - top) / box.height);
      scene.setFraming({ sx: 0, sy: (top + bottom) / 2 / box.height - 0.5, fitW: 1.02, fitH: gap * 0.98, driveSx: 0, driveSy: -0.14 });
    } else scene.setFraming({ sx: 0, sy: 0.02, fitW: 1.02, fitH: 0.5, driveSx: 0, driveSy: -0.14 });
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
window.addEventListener('resize', frame);
// the chips sit on top of the tray, which grows with the picks and the language: keep them clear of it
const trayEl = world?.querySelector<HTMLElement>('.w-tray');
if (trayEl && 'ResizeObserver' in window) {
  new ResizeObserver(() => {
    world?.style.setProperty('--tray-h', `${trayEl.offsetHeight}px`);
    frame();
  }).observe(trayEl);
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
    scene.setPlan(inOrder());
    update();
  }, { delay: 200 });
}
phone.addEventListener('change', frame);
document.addEventListener('astro:before-swap', () => scene?.dispose());
