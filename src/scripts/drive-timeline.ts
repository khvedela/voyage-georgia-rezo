/**
 * The sample drive as one timeline from 0 to 1, shared by the 3D scene (camera, van, route) and the page (captions,
 * route bar), so both always agree on where the drive is. The camera dives in, rests at each stop, travels each leg
 * (longer legs take a little longer), then pulls back out over the whole route.
 */
export type SegKind = 'in' | 'dwell' | 'travel' | 'out';
export interface Seg { kind: SegKind; i: number; a: number; b: number }

const W_IN = 0.9;
const W_DWELL = 1.6;
const W_TRAVEL = [1.1, 1.3, 1.6, 1.4, 1.4];
const W_OUT = 0.9;

export function buildTimeline(n: number): Seg[] {
  const raw: { kind: SegKind; i: number; w: number }[] = [{ kind: 'in', i: 0, w: W_IN }];
  for (let i = 0; i < n; i++) {
    raw.push({ kind: 'dwell', i, w: W_DWELL });
    if (i < n - 1) raw.push({ kind: 'travel', i, w: W_TRAVEL[i] ?? 1.3 });
  }
  raw.push({ kind: 'out', i: n - 1, w: W_OUT });
  const total = raw.reduce((s, r) => s + r.w, 0);
  let acc = 0;
  return raw.map((r) => {
    const a = acc / total;
    acc += r.w;
    return { kind: r.kind, i: r.i, a, b: acc / total };
  });
}

/** The segment at progress p (0..1) and how far through it we are (0..1). */
export function locate(tl: Seg[], p: number): { seg: Seg; t: number } {
  const q = Math.min(1, Math.max(0, p));
  const seg = tl.find((s) => q <= s.b) ?? tl[tl.length - 1];
  return { seg, t: seg.b > seg.a ? (q - seg.a) / (seg.b - seg.a) : 0 };
}

/** Progress at the middle of stop i's rest, for jumping straight to a stop. */
export function stopCenter(tl: Seg[], i: number): number {
  const s = tl.find((x) => x.kind === 'dwell' && x.i === i);
  return s ? (s.a + s.b) / 2 : 0;
}
