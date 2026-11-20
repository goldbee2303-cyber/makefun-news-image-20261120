// main.ts — entry program for news-image-20261120.
// Copies entry.png (the image this repository holds) to MAKEFUN_OUTPUT_DIR
// (default /output), after validating it, and verifies the copy byte for byte.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const OUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const SRC = join(import.meta.dirname, 'entry.png');
const DST = join(OUT_DIR, 'entry.png');
const MAX_BYTES = 1048576;
const MAX_SIDE = 1024;

function fail(message: string): never {
  console.error(`main.ts: ${message}`);
  process.exit(1);
}

if (!existsSync(SRC)) fail(`entry.png not found at ${SRC}`);

const png = readFileSync(SRC);
if (png.length === 0 || png.length > MAX_BYTES) {
  fail(`entry.png is ${png.length} bytes; must be 1..${MAX_BYTES}`);
}
const SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
if (!png.subarray(0, 8).equals(SIGNATURE)) fail('entry.png is not a PNG file');
// IHDR: width at bytes 16..19, height at 20..23, big-endian.
const width = png.readUInt32BE(16);
const height = png.readUInt32BE(20);
if (width === 0 || height === 0 || width > MAX_SIDE || height > MAX_SIDE) {
  fail(`entry.png is ${width}x${height}; must be at most ${MAX_SIDE}x${MAX_SIDE}`);
}
mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(DST, png);
const back = readFileSync(DST);
if (!back.equals(png)) fail('output differs from entry.png after copy');
console.log(`wrote ${DST} (${width}x${height}, ${png.length} bytes, byte-identical to source)`);
