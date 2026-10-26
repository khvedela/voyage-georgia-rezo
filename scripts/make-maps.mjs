// Builds every map raster on the site from real elevation data.
//
//   public/maps/georgia-map.webp (+ -1600)  flat basemap for all 2D maps: shaded relief, muted neighbours,
//                                            the Black Sea with depth and coastal water lines, Georgia on top
//   public/terrain/height.webp               heights for the 3D diorama (metres = R * 256 + G), lossless
//   src/scripts/terrain-meta.json            the raster bounds of height.webp, read by vgr3d.js
//
// Elevation: AWS Terrain Tiles (terrarium encoding), sourced from SRTM (NASA), GMTED2010 (USGS) and ETOPO1
// (NOAA). Tiles are cached in scripts/.cache. Map units are the site's 1000 x 560 map coordinates; the
// projection was fitted to 21 known places (rms error about 2 units, i.e. 1.3 km).
//
// Run: npm run maps
import sharp from 'sharp';
import { readFile, writeFile, mkdir, access } from 'node:fs/promises';

const ROOT = new URL('../', import.meta.url).pathname;
const CACHE = ROOT + 'scripts/.cache/dem/';

// ---------- projection: map units <-> lon/lat ----------
const AX = 126.29793363721565, BX = -4976.426795553534; // x = AX * lon + BX
const AY = -169.67823623774657, BY = 7466.30887790042;  // y = AY * lat + BY
const lonOf = (x) => (x - BX) / AX;
const latOf = (y) => (y - BY) / AY;

// ---------- the diorama hexagon (pointy left and right), sized to hold Georgia with a margin ----------
const vgr = await readFile(ROOT + 'src/scripts/vgr3d.js', 'utf8');
const GEO_RINGS = JSON.parse(vgr.match(/var G = (\{.*?\});\n/s)[1]).geo;
const pts = GEO_RINGS.flat();
const HEX = (() => {
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2, cy = (Math.min(...ys) + Math.max(...ys)) / 2;
  const s3 = Math.sqrt(3);
  let R = 0;
  for (const [x, y] of pts) R = Math.max(R, Math.abs(y - cy) / (s3 / 2), (s3 * Math.abs(x - cx) + Math.abs(y - cy)) / s3);
  return { cx: +cx.toFixed(2), cy: +cy.toFixed(2), R: Math.ceil(R + 26) };
})();
const T3 = {
  minx: Math.floor(HEX.cx - HEX.R - 8), maxx: Math.ceil(HEX.cx + HEX.R + 8),
  miny: Math.floor(HEX.cy - HEX.R * 0.8660254 - 8), maxy: Math.ceil(HEX.cy + HEX.R * 0.8660254 + 8),
};

// ---------- elevation tiles (web mercator, zoom 9) ----------
const Z = 9;
const N = 2 ** Z;
const tx = (lon) => ((lon + 180) / 360) * N;
const ty = (lat) => ((1 - Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360)) / Math.PI) / 2) * N;
const X0 = Math.floor(tx(lonOf(Math.min(-60, T3.minx)))), X1 = Math.floor(tx(lonOf(Math.max(1060, T3.maxx))));
const Y0 = Math.floor(ty(latOf(Math.min(-60, T3.miny)))), Y1 = Math.floor(ty(latOf(Math.max(620, T3.maxy))));
const MW = (X1 - X0 + 1) * 256, MH = (Y1 - Y0 + 1) * 256;
const dem = new Float32Array(MW * MH);

await mkdir(CACHE, { recursive: true });
const jobs = [];
for (let x = X0; x <= X1; x++) for (let y = Y0; y <= Y1; y++) jobs.push([x, y]);
let next = 0;
async function worker() {
  while (next < jobs.length) {
    const [x, y] = jobs[next++];
    const file = `${CACHE}${Z}-${x}-${y}.png`;
    const cached = await access(file).then(() => true, () => false);
    if (!cached) {
      const res = await fetch(`https://s3.amazonaws.com/elevation-tiles-prod/terrarium/${Z}/${x}/${y}.png`);
      if (!res.ok) throw new Error(`tile ${x}/${y}: ${res.status}`);
      await writeFile(file, Buffer.from(await res.arrayBuffer()));
    }
    const { data } = await sharp(file).removeAlpha().raw().toBuffer({ resolveWithObject: true });
    const ox = (x - X0) * 256, oy = (y - Y0) * 256;
    for (let j = 0; j < 256; j++) for (let i = 0; i < 256; i++) {
      const k = (j * 256 + i) * 3;
      dem[(oy + j) * MW + ox + i] = data[k] * 256 + data[k + 1] + data[k + 2] / 256 - 32768;
    }
  }
}
await Promise.all(Array.from({ length: 8 }, worker));
console.log(`elevation: ${jobs.length} tiles`);

/** Elevation in metres at a map coordinate (bilinear). Negative values are sea depth. */
function elev(mx, my) {
  const gx = (tx(lonOf(mx)) - X0) * 256 - 0.5;
  const gy = (ty(latOf(my)) - Y0) * 256 - 0.5;
  const x = Math.max(0, Math.min(MW - 2, Math.floor(gx))), y = Math.max(0, Math.min(MH - 2, Math.floor(gy)));
  const fx = Math.min(1, Math.max(0, gx - x)), fy = Math.min(1, Math.max(0, gy - y));
  const a = dem[y * MW + x], b = dem[y * MW + x + 1], c = dem[(y + 1) * MW + x], d = dem[(y + 1) * MW + x + 1];
  return (a * (1 - fx) + b * fx) * (1 - fy) + (c * (1 - fx) + d * fx) * fy;
}

// ---------- vector layers from the original basemap ----------
const svg = await readFile(ROOT + 'public/maps/georgia-light.svg', 'utf8');
const tags = [...svg.matchAll(/<(?:rect|path)\b[^>]*\/>/g)].map((m) => m[0]);
const pathD = (t) => t.match(/\sd="([^"]+)"/)[1];
const of = (needle) => tags.filter((t) => t.startsWith('<path') && t.includes(needle)).map(pathD);
const neighbours = of('fill="#F3F3F4"');
const georgia = of('fill="#FFFFFF"');
const admin = of('stroke="#E2E2E6"');
const lakes = of('fill="#E6ECF0"');
const rivers = of('stroke="#B5C9D6"');
const border = of('stroke="#1A1D23"');
const paths = (list, attrs) => list.map((p) => `<path d="${p}" ${attrs}/>`).join('');
const doc = (body, w, h, vb = '0 0 1000 560', bg = '') =>
  Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="${w}" height="${h}">${bg ? `<rect x="-100" y="-100" width="1200" height="760" fill="${bg}"/>` : ''}${body}</svg>`);
async function mask(body, w, h, vb) {
  const { data } = await sharp(doc(body, w, h, vb, '#000')).extractChannel(0).raw().toBuffer({ resolveWithObject: true });
  return Float32Array.from(data, (v) => v / 255);
}
const LAND = paths(neighbours, 'fill="#fff"') + paths(georgia, 'fill="#fff" fill-rule="evenodd"') + paths(lakes, 'fill="#000"');
const GEO = paths(georgia, 'fill="#fff" fill-rule="evenodd"') + paths(lakes, 'fill="#000"');

// ---------- shared helpers ----------
const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const mix = (a, b, t) => a + (b - a) * t;
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
function grid(w, h, x0, y0, perUnit) {
  const g = new Float32Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) g[y * w + x] = elev(x0 + (x + 0.5) / perUnit, y0 + (y + 0.5) / perUnit);
  return g;
}
/** Gaussian blur in float precision (three box passes), so heights are never quantised. */
function blurF(field, w, h, sigma) {
  const passes = 3;
  const ideal = Math.sqrt((12 * sigma * sigma) / passes + 1);
  let lower = Math.floor(ideal); if (lower % 2 === 0) lower--;
  const m = Math.round((12 * sigma * sigma - passes * lower * lower - 4 * passes * lower - 3 * passes) / (-4 * lower - 4));
  const sizes = Array.from({ length: passes }, (_, i) => (i < m ? lower : lower + 2));
  let a = Float32Array.from(field);
  let b = new Float32Array(w * h);
  const boxH = (src, dst, r) => {
    for (let y = 0; y < h; y++) {
      const o = y * w;
      let acc = src[o] * (r + 1);
      for (let x = 0; x < r; x++) acc += src[o + Math.min(w - 1, x)];
      for (let x = 0; x < w; x++) {
        acc += src[o + Math.min(w - 1, x + r)] - src[o + Math.max(0, x - r - 1)];
        dst[o + x] = acc / (2 * r + 1);
      }
    }
  };
  const boxV = (src, dst, r) => {
    for (let x = 0; x < w; x++) {
      let acc = src[x] * (r + 1);
      for (let y = 0; y < r; y++) acc += src[Math.min(h - 1, y) * w + x];
      for (let y = 0; y < h; y++) {
        acc += src[Math.min(h - 1, y + r) * w + x] - src[Math.max(0, y - r - 1) * w + x];
        dst[y * w + x] = acc / (2 * r + 1);
      }
    }
  };
  for (const size of sizes) {
    const r = (size - 1) / 2;
    if (r < 1) continue;
    boxH(a, b, r); boxV(b, a, r);
  }
  return a;
}
/** Multi-directional hillshade (1 = flat ground), with land heights only (sea is flat). */
function hillshade(hgt, w, h, cellMetres, zf) {
  const dirs = [[315, 0.6], [270, 0.2], [0, 0.2]].map(([azDeg, wt]) => {
    const az = (azDeg * Math.PI) / 180, alt = (45 * Math.PI) / 180;
    return [Math.cos(alt) * Math.sin(az), -Math.cos(alt) * Math.cos(az), Math.sin(alt), wt];
  });
  const out = new Float32Array(w * h);
  const H = (x, y) => Math.max(0, hgt[Math.min(h - 1, Math.max(0, y)) * w + Math.min(w - 1, Math.max(0, x))]);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const nx = (-(H(x + 1, y) - H(x - 1, y)) / (2 * cellMetres)) * zf;
    const ny = (-(H(x, y + 1) - H(x, y - 1)) / (2 * cellMetres)) * zf;
    const nl = Math.hypot(nx, ny, 1);
    let s = 0;
    for (const [lx, ly, lz, wt] of dirs) s += wt * Math.max(0, (nx * lx + ny * ly + lz) / nl) / lz;
    out[y * w + x] = s;
  }
  return out;
}

// =====================================================================================================
// 1. Flat basemap
// =====================================================================================================
{
  const S = 3, W = 1000 * S, Hh = 560 * S, cell = 653 / S;
  const hgt = grid(W, Hh, 0, 0, S);
  const land = await mask(LAND, W, Hh);
  const geo = await mask(GEO, W, Hh);
  const shade = hillshade(blurF(hgt, W, Hh, 1.2), W, Hh, cell, 1.9);
  // Georgia lifts off the page: a soft shadow cast onto neighbours and sea.
  const shadowSrc = new Float32Array(W * Hh);
  for (let y = 0; y < Hh; y++) for (let x = 0; x < W; x++) {
    const sx = x - 3 * S, sy = y - 4 * S;
    shadowSrc[y * W + x] = sx >= 0 && sy >= 0 ? geo[sy * W + sx] : 0;
  }
  const lift = blurF(shadowSrc, W, Hh, 8 * S);
  const coast = [2.5, 6, 11].map((s) => blurF(land, W, Hh, s * S));
  // Neighbouring relief fades with distance from Georgia, keeping the eye on the country.
  const near = blurF(geo, W, Hh, 34 * S);

  // The same palette as the 3D map's uncovered colour (vgr3d.js), after Bump's soft, bright map style.
  const LOW = hex('#C6E4AA'), MEADOW = hex('#E0E7B8'), STONE = hex('#EBDDC8'), LILAC = hex('#DAD6E8');
  const NEIGH = hex('#F0F0F2'), SHALLOW = hex('#CCE4F4'), DEEP = hex('#B8D9EF'), LINE = hex('#A6CBE6');
  const out = Buffer.alloc(W * Hh * 3);
  for (let i = 0; i < W * Hh; i++) {
    const h = hgt[i];
    const r = Math.min(1.2, Math.max(0.6, shade[i]));
    const t1 = smooth(150, 900, h), t2 = smooth(900, 2000, h), t3 = smooth(2000, 3100, h), snow = smooth(3200, 4300, h);
    const g = [0, 1, 2].map((c) => {
      let v = mix(mix(mix(LOW[c], MEADOW[c], t1), STONE[c], t2), LILAC[c], t3) * (1 + (r - 1) * 0.85);
      return mix(v, 255 * Math.min(1, 0.92 + (r - 1) * 0.4), snow * 0.85);
    });
    const k = 0.1 + 0.32 * Math.min(1, near[i] * 2.2);
    const n = [0, 1, 2].map((c) => NEIGH[c] * (1 + (r - 1) * k) * (1 - 0.06 * lift[i]));
    let sea = [0, 1, 2].map((c) => mix(SHALLOW[c], DEEP[c], smooth(-50, -1800, h)));
    [0.3, 0.2, 0.12].forEach((alpha, k) => {
      const v = coast[k][i];
      const a = Math.max(0, 1 - Math.abs(v - 0.06) / 0.022) * alpha;
      sea = sea.map((c, j) => mix(c, LINE[j], a));
    });
    sea = sea.map((c) => c * (1 - 0.05 * lift[i]));
    for (let c = 0; c < 3; c++) out[i * 3 + c] = Math.round(Math.min(255, Math.max(0, mix(sea[c], mix(n[c], g[c], geo[i]), land[i]))));
  }
  const overlay = doc(
    paths(admin, 'fill="none" stroke="#FFFFFF" stroke-width=".6" stroke-linejoin="round" opacity=".55"') +
    paths(neighbours, 'fill="none" stroke="#CDCED4" stroke-width=".55" stroke-linejoin="round"') +
    paths(lakes, 'fill="#C6E0F2" stroke="#A6CBE6" stroke-width=".5"') +
    paths(rivers, 'fill="none" stroke="#8DBEE0" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"') +
    paths(border, 'fill="none" stroke="#FFFFFF" stroke-width="2.2" stroke-linejoin="round" opacity=".7"') +
    paths(border, 'fill="none" stroke="#1A1D23" stroke-width=".8" stroke-linejoin="round"'),
    W, Hh,
  );
  const png = await sharp(out, { raw: { width: W, height: Hh, channels: 3 } }).composite([{ input: overlay }]).png().toBuffer();
  for (const [w, q, name] of [[3000, 76, 'georgia-map.webp'], [1600, 78, 'georgia-map-1600.webp']]) {
    const info = await sharp(png).resize(w).webp({ quality: q, effort: 6 }).toFile(ROOT + 'public/maps/' + name);
    console.log(`maps/${name}: ${Math.round(info.size / 1024)} KB`);
  }
}

// =====================================================================================================
// 2. 3D model input: one height map covering Georgia and the sea piece beside it
// =====================================================================================================
{
  const T = T3;
  const vb = `${T.minx} ${T.miny} ${T.maxx - T.minx} ${T.maxy - T.miny}`;
  const per = 0.75; // raster pixels per map unit (the model's mesh is 2.5-4 units apart)
  const w = Math.round((T.maxx - T.minx) * per), h = Math.round((T.maxy - T.miny) * per);

  // Heights in metres = R * 256 + G (sea clamped to 0).
  const hgt = grid(w, h, T.minx, T.miny, per);
  const hb = Buffer.alloc(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    // 5 m precision: invisible once smoothed, and rounding lets the WebP compress far better.
    const m = Math.max(0, Math.min(65535, Math.round(hgt[i] / 5) * 5));
    hb[i * 4] = m >> 8; hb[i * 4 + 1] = m & 255; hb[i * 4 + 2] = 0; hb[i * 4 + 3] = 255;
  }
  const hInfo = await sharp(hb, { raw: { width: w, height: h, channels: 4 } }).removeAlpha().webp({ lossless: true, effort: 6 }).toFile(ROOT + 'public/terrain/height.webp');
  console.log(`terrain/height.webp: ${w}x${h}, ${Math.round(hInfo.size / 1024)} KB`);

  await writeFile(ROOT + 'src/scripts/terrain-meta.json', JSON.stringify({ hex: HEX, tr: { ...T, w, h } }, null, 2) + '\n');
  console.log('terrain-meta.json', JSON.stringify({ hex: HEX, tr: T }));
}
