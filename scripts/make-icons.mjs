// One-off: renders public/favicon.svg to the PNG sizes browsers, iOS and the manifest want.
import sharp from 'sharp';
import { readFile } from 'node:fs/promises';
const svg = await readFile(new URL('../public/favicon.svg', import.meta.url));
for (const [name, size] of [['favicon-32.png', 32], ['apple-touch-icon.png', 180], ['icon-192.png', 192], ['icon-512.png', 512]]) {
  await sharp(svg, { density: 384 }).resize(size, size).png().toFile(new URL(`../public/${name}`, import.meta.url).pathname);
}
