import { canLoad3D, mountTerrain, whenIdle, type Terrain } from './terrain';
import { scrollToElement } from './smooth';

const root = document.documentElement;
const stage = document.querySelector<HTMLElement>('.jstage');
const textCol = document.querySelector<HTMLElement>('.jtext');
const chapters = [...document.querySelectorAll<HTMLElement>('.jch')];
const pills = [...document.querySelectorAll<HTMLButtonElement>('.jpill')];
const stagePrints = [...document.querySelectorAll<HTMLElement>('.jprint--stage')];
const inlinePrints = [...document.querySelectorAll<HTMLElement>('.jprint--inline')];
const narrow = window.matchMedia('(max-width: 900px)');
const printSet = () => (narrow.matches ? inlinePrints : stagePrints);
const rail = document.querySelector<HTMLElement>('.jstops');
const progress = document.getElementById('jprog');
const canvas = document.getElementById('j3d') as HTMLCanvasElement | null;
const fallback = document.getElementById('j3d-fb') as SVGSVGElement | null;
const marksRoot = document.querySelector<HTMLElement>('.jmarks');
const marks = [...document.querySelectorAll<HTMLButtonElement>('.jm')];
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let scene: Terrain | null = null;
let current = -1;
let raf = 0;

root.classList.add('js-journey');

// ---- Prints: attach the images just before they are needed, and only show a print once its photo is decoded ----
const ready = new WeakMap<HTMLElement, Promise<void>>();
function load(el: HTMLElement | undefined): Promise<void> {
  if (!el) return Promise.resolve();
  let p = ready.get(el);
  if (!p) {
    const img = el.querySelector<HTMLImageElement>('img');
    if (img?.dataset.src) {
      img.srcset = img.dataset.srcset ?? '';
      img.src = img.dataset.src;
      delete img.dataset.src;
    }
    p = img ? img.decode().catch(() => undefined) : Promise.resolve();
    ready.set(el, p);
  }
  return p;
}
const printFor = (i: number) => printSet().find((el) => Number(el.dataset.ph) === i);

/** Stage: stop i's print lands on top of the pile; earlier stops sit underneath, later ones wait off-stage. */
function showPrint(i: number) {
  for (const el of stagePrints) {
    const k = Number(el.dataset.ph);
    const d = i - k;
    el.classList.toggle('is-past', d > 0);
    el.classList.toggle('is-deep', d > 3);
    el.style.setProperty('--d', String(Math.max(0, d)));
    el.style.zIndex = String(20 - Math.max(0, d));
    if (d !== 0) el.classList.remove('is-on');
    if (d > 0 && d <= 3) load(el);
  }
  for (const el of inlinePrints) if (Number(el.dataset.ph) !== i) el.classList.remove('is-on');
  const el = printFor(i);
  if (el) load(el).then(() => {
    // The stop may have changed while the photo decoded; only land the one still current.
    if (current === i) requestAnimationFrame(() => el.classList.add('is-on'));
  });
  // Warm up the next stop so scrolling on never waits.
  load(printFor(i + 1));
}

// ---- Map labels: name pills pinned to each stop on the terrain, repositioned every frame ----
let marksRaf = 0;
let stageVisible = true;
let safeX = 0; // labels left of this (under the text column) are hidden
function measure() {
  if (!stage || !textCol) return;
  safeX = narrow.matches ? 0 : textCol.getBoundingClientRect().right - stage.getBoundingClientRect().left + 16;
}
function placeMarks() {
  marksRaf = 0;
  if (!scene || !stage) return;
  const W = stage.clientWidth;
  const H = stage.clientHeight;
  marks.forEach((el, k) => {
    const p = scene!.pinScreen(k);
    const off = !p || !p.visible || p.x < safeX || p.x > W + 40 || p.y < -20 || p.y > H + 60;
    el.classList.toggle('is-off', off);
    if (p && !off) el.style.transform = `translate3d(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px, 0)`;
  });
  if (stageVisible) marksRaf = requestAnimationFrame(placeMarks);
}
function markState(i: number) {
  marks.forEach((el, k) => {
    el.classList.toggle('is-active', k === i - 1);
    // The hero and the closing chapter show the whole country in colour, so every bubble is in colour too.
    el.classList.toggle('is-visited', i === 0 || i >= 7 || k < i - 1);
  });
}
marks.forEach((el, k) => el.addEventListener('click', () => {
  const ch = chapters[k + 1];
  if (ch) scrollToElement(ch, { center: true });
}));
if (stage && 'IntersectionObserver' in window) {
  new IntersectionObserver(([e]) => {
    stageVisible = e.isIntersecting;
    if (stageVisible && !marksRaf && scene) marksRaf = requestAnimationFrame(placeMarks);
  }).observe(stage);
}

// ---- Camera framing, derived from the real layout so the stop always lands just right of the print ----
function framing() {
  const W = stage?.clientWidth || window.innerWidth;
  if (narrow.matches || !stage || !textCol) return { shift: 0, focusShift: 0, safeLeft: 0, fitFrac: 1, overviewZoom: 1.06 };
  const textRight = textCol.getBoundingClientRect().right - stage.getBoundingClientRect().left;
  const print = stagePrints[0];
  const printRight = print ? print.offsetLeft + print.offsetWidth : textRight;
  const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
  return {
    // Overview: centre the country in the space right of the text.
    shift: clamp((textRight + W) / 2 / W - 0.5, 0.05, 0.3),
    // A stop: centre its pin in the open space right of the print.
    focusShift: clamp((printRight + Math.max(170, W * 0.13)) / W - 0.5, 0.1, 0.4),
    safeLeft: clamp((textRight + 12) / W, 0, 0.6),
    // Fit the whole country into the space right of the text, with a little air.
    fitFrac: clamp((W - textRight - Math.max(24, W * 0.015)) / W, 0.4, 1),
    overviewZoom: 1.1, // a little air around the model, like a model on a table
  };
}

// ---- Active stop ----
function setActive(i: number) {
  chapters.forEach((c, k) => c.classList.toggle('is-active', k === i));
  pills.forEach((p, k) => {
    p.setAttribute('aria-current', i - 1 === k ? 'true' : 'false');
    p.classList.toggle('done', k < i - 1);
  });
  showPrint(i);
  markState(i);
  const active = pills[i - 1];
  if (active && rail && rail.scrollWidth > rail.clientWidth) {
    rail.scrollTo({ left: Math.max(0, active.offsetLeft - 24), behavior: reduce ? 'auto' : 'smooth' });
  }
  progress?.style.setProperty('--p', String(i <= 0 ? 0 : i >= 7 ? 1 : (i - 1) / 5));
  scene?.goTo(i >= 1 && i <= 6 ? i - 1 : null);
}

function pick() {
  raf = 0;
  const vh = Math.min((window.innerHeight || 800) - 71, 1000);
  const mid = window.innerWidth > 900 ? 71 + vh * 0.5 : 400 + (vh - 400) * 0.5;
  let best = 0;
  let bd = Infinity;
  chapters.forEach((c, k) => {
    const r = c.getBoundingClientRect();
    const d = r.top <= mid && r.bottom >= mid ? 0 : Math.min(Math.abs(r.top - mid), Math.abs(r.bottom - mid));
    if (d < bd) { bd = d; best = k; }
  });
  if (best !== current) { current = best; setActive(best); }
}

const onScroll = () => { if (!raf) raf = requestAnimationFrame(pick); };
window.addEventListener('scroll', onScroll, { passive: true });
let resizeT = 0;
window.addEventListener('resize', () => {
  onScroll();
  clearTimeout(resizeT);
  resizeT = window.setTimeout(() => { measure(); scene?.setOptions(framing()); }, 150);
});
pills.forEach((p, k) => p.addEventListener('click', () => {
  const ch = chapters[k + 1];
  if (ch) scrollToElement(ch, { center: true });
}));
pick();
// Have the first stop ready before the visitor reaches it.
whenIdle(() => { load(printFor(1)); }, { delay: 300 });
narrow.addEventListener('change', () => { if (current > 0) showPrint(current); });

const showFlatMap = () => {
  const base = fallback?.querySelector<SVGImageElement>('image[data-href]');
  if (base) { base.setAttribute('href', base.dataset.href!); delete base.dataset.href; }
  fallback?.classList.add('show');
};

if (!canvas || !canLoad3D()) {
  showFlatMap();
} else {
  whenIdle(async () => {
    try {
      scene = await mountTerrain(canvas, {
        routes: ['Tbilisi>Telavi', 'Telavi>Omalo', 'Omalo>Kutaisi', 'Kutaisi>Mestia', 'Mestia>Batumi'],
        sequential: true, hideVan: true, hidePins: true,
        pins: [['Tbilisi', 'Tbilisi'], ['Telavi', 'Kakheti', 'Telavi'], ['Omalo', 'Tusheti', 'Omalo'], ['Kutaisi', 'Kutaisi'], ['Mestia', 'Svaneti', 'Mestia'], ['Batumi', 'Batumi']],
        elevation: 47, focusElev: 40, focusZoom: 0.4, overviewYaw: -0.32,
        ...framing(), fallback,
      });
    } catch {
      scene = null;
    }
    if (!scene) showFlatMap();
    else {
      if (current >= 0) {
        scene.goTo(current >= 1 && current <= 6 ? current - 1 : null);
      }
      measure();
      // Labels pop in once the terrain has drawn its first frames.
      window.setTimeout(() => { marksRoot?.classList.add('is-ready'); if (!marksRaf) marksRaf = requestAnimationFrame(placeMarks); }, 700);
    }
  });
  // If the terrain textures are slow, show the flat map rather than a blank stage.
  setTimeout(() => { if (!scene && fallback && fallback.style.display !== 'none') showFlatMap(); }, 5000);
}

document.addEventListener('astro:before-swap', () => scene?.dispose());
