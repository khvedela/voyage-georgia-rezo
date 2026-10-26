import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { site } from '../config/site';

const require = createRequire(import.meta.url);
const font = (pkg: string, file: string) => readFile(require.resolve(`${pkg}/files/${file}`));

let fonts: Promise<{ name: string; data: Buffer; weight: 400 | 600; style: 'normal' }[]> | undefined;
const loadFonts = () =>
  (fonts ??= Promise.all([
    font('@fontsource/inter-tight', 'inter-tight-latin-600-normal.woff'),
    font('@fontsource/inter', 'inter-latin-500-normal.woff'),
    font('@fontsource/inter', 'inter-latin-600-normal.woff'),
  ]).then(([tight, i500, i600]) => [
    { name: 'Inter Tight', data: tight, weight: 600 as const, style: 'normal' as const },
    { name: 'Inter', data: i500, weight: 400 as const, style: 'normal' as const },
    { name: 'Inter', data: i600, weight: 600 as const, style: 'normal' as const },
  ]));

const mark = `data:image/svg+xml;utf8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 34 34" fill="none"><circle cx="17" cy="17" r="16" stroke="#fff" stroke-width="1.5"/><path d="M8 24C12 10 16 26 20 15S25 12 26 9" stroke="#fff" stroke-width="2" stroke-linecap="round"/><circle cx="8" cy="24" r="2.4" fill="#D62839"/><circle cx="26" cy="9" r="2.4" fill="#D62839"/></svg>',
)}`;
const route = `data:image/svg+xml;utf8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="420" height="260" viewBox="0 0 420 260" fill="none"><path d="M20 230C90 60 150 250 220 120S340 110 392 30" stroke="#D62839" stroke-width="10" stroke-linecap="round"/><circle cx="20" cy="230" r="16" fill="#fff" stroke="#14161A" stroke-width="6"/><circle cx="392" cy="30" r="16" fill="#fff" stroke="#14161A" stroke-width="6"/></svg>',
)}`;

type El = { type: string; props: Record<string, unknown> };
const h = (type: string, style: Record<string, unknown>, children?: unknown, extra: Record<string, unknown> = {}): El => ({
  type, props: { style: { display: 'flex', ...style }, children, ...extra },
});

export interface OgInput { eyebrow: string; title: string }

export async function renderOg({ eyebrow, title }: OgInput): Promise<Buffer> {
  const size = title.length > 60 ? 54 : title.length > 40 ? 64 : 74;
  const tree = h('div', { boxSizing: 'border-box', width: '100%', height: '100%', background: '#14161A', color: '#fff', padding: '64px 72px', flexDirection: 'column', justifyContent: 'space-between', fontFamily: 'Inter' }, [
    h('div', { alignItems: 'center', gap: 18 }, [
      h('img', {}, undefined, { src: mark, width: 56, height: 56 }),
      h('div', { fontFamily: 'Inter Tight', fontWeight: 600, fontSize: 36, letterSpacing: -0.8 }, [
        h('span', {}, 'Voyage Georgia '), h('span', { color: '#D62839', marginLeft: 10 }, 'Rezo'),
      ]),
    ]),
    h('div', { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 40, width: '100%' }, [
      h('div', { flexDirection: 'column', maxWidth: 700 }, [
        h('div', { fontSize: 24, letterSpacing: 4, textTransform: 'uppercase', color: '#FF6B77', fontWeight: 600, marginBottom: 22 }, eyebrow),
        h('div', { fontFamily: 'Inter Tight', fontWeight: 600, fontSize: size, lineHeight: 1.02, letterSpacing: -2 }, title),
      ]),
      h('img', {}, undefined, { src: route, width: 260, height: 161 }),
    ]),
    h('div', { fontSize: 24, color: '#A1A1AA', justifyContent: 'space-between', width: '100%' }, [
      h('span', {}, 'Private tours of Georgia, designed by Rezo'),
      h('span', {}, site.url.replace(/^https?:\/\//, '')),
    ]),
  ]);
  const svg = await satori(tree as never, { width: 1200, height: 630, fonts: await loadFonts() });
  return new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng() as unknown as Buffer;
}
