/**
 * Lazy loader for the 3D terrain scene. three.js (~150 kB gzipped) is only fetched when the visitor's
 * connection and preferences allow it, and only after the page has painted.
 */
export interface Terrain {
  dispose(): void;
  goTo(i: number | null): void;
  stops(): number;
  pinScreen(i: number): { x: number; y: number; visible: boolean } | null;
  setOptions(o: Record<string, unknown>): void;
}

interface NetworkInformation { saveData?: boolean; effectiveType?: string }

export function canLoad3D(): boolean {
  const c = (navigator as Navigator & { connection?: NetworkInformation }).connection;
  if (c?.saveData) return false;
  if (c?.effectiveType && /^(slow-2g|2g|3g)$/.test(c.effectiveType)) return false;
  if (window.matchMedia?.('(prefers-reduced-data: reduce)').matches) return false;
  return true;
}

/** Run after the page has loaded, painted and gone idle, so the scene never competes with LCP or first input. */
export function whenIdle(fn: () => void, { delay = 900, timeout = 3000 } = {}) {
  const run = () => setTimeout(() => ('requestIdleCallback' in window ? window.requestIdleCallback(fn, { timeout }) : fn()), delay);
  if (document.readyState === 'complete') run();
  else window.addEventListener('load', run, { once: true });
}

/** Shadow-map size and pixel ratio: phones and low-core devices get a lighter model. */
export function sceneQuality(): { shadowMap: number; maxDpr: number } {
  const low = window.innerWidth <= 900 || (navigator.hardwareConcurrency ?? 8) <= 4;
  return { shadowMap: low ? 1024 : 2048, maxDpr: low ? 1.5 : 2 };
}

type MountOptions = Record<string, unknown>;

/** The Blender-built miniature (public/models/georgia.glb, ~2 MB with Draco), loaded only once the page is idle. */
export async function mountTerrain(canvas: HTMLCanvasElement, opts: MountOptions): Promise<Terrain | null> {
  const { VGRGLB } = await import('./vgr-glb.js');
  return VGRGLB.mount(canvas, {
    model: '/models/georgia.glb',
    dracoPath: '/draco/',
    ...sceneQuality(),
    ...opts,
  });
}
