#!/usr/bin/env node
// Register art for a scene slot in assets/scenes.json.
//
//   node tools/make-frames.mjs <file> <scene> [--universe bleach] [--fps 24] [--width 1600] [--quality 72]
//
// <file> is a video (.mp4/.webm/.mov) -> scroll-scrubbed WebP frame sequence,
//        or a still (.png/.jpg/.webp) -> one WebP image with a slow scroll zoom.
// <scene> is a data-scene slot: hero | descent | frame | hit,
//         p1..p4 for the Work hover previews, or g1..g6 for the gallery panels.
// Needs ffmpeg on PATH.
import { spawnSync } from 'node:child_process';
import { mkdirSync, readdirSync, rmSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const [input, scene, ...rest] = process.argv.slice(2);
if (!input || !scene) {
  console.error('usage: node tools/make-frames.mjs <file> <scene> [--universe bleach] [--fps 24] [--width 1600] [--quality 72]');
  process.exit(1);
}
const opt = { universe: 'bleach', fps: 24, width: 1600, quality: 72 };
for (let i = 0; i < rest.length; i += 2) {
  const k = rest[i].replace(/^--/, '');
  opt[k] = k === 'universe' ? rest[i + 1] : Number(rest[i + 1]);
}
const root = join(dirname(fileURLToPath(import.meta.url)), '..', opt.universe);
const still = ['.png', '.jpg', '.jpeg', '.webp'].includes(extname(input).toLowerCase());

const ffmpeg = (out, vf) => {
  const r = spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', input, '-vf', vf,
    '-c:v', 'libwebp', '-quality', String(opt.quality), '-compression_level', '6', out], { stdio: 'inherit' });
  if (r.status !== 0) process.exit(r.status ?? 1);
};

const manifestPath = join(root, 'assets', 'scenes.json');
const manifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, 'utf8') || '{}') : {};
const gallery = scene.match(/^g([1-6])$/);

if (still) {
  const dir = join(root, 'assets', gallery ? 'gallery' : 'stills');
  mkdirSync(dir, { recursive: true });
  ffmpeg(join(dir, `${scene}.webp`), `scale='min(${opt.width},iw)':-2:flags=lanczos`);
  const src = `assets/${gallery ? 'gallery' : 'stills'}/${scene}.webp?v=${Date.now()}`;
  if (gallery) (manifest.gallery ??= [])[gallery[1] - 1] = src;
  else manifest[scene] = { type: 'image', src };
  console.log(`${scene}: still -> ${src.split('?')[0]}`);
} else {
  const outDir = join(root, 'assets', 'frames', scene);
  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });
  ffmpeg(join(outDir, '%04d.webp'), `fps=${opt.fps},scale=${opt.width}:-2:flags=lanczos`);
  const count = readdirSync(outDir).filter(f => f.endsWith('.webp')).length;
  manifest[scene] = { type: 'frames', path: `assets/frames/${scene}/`, count, ext: 'webp', pad: 4 };
  console.log(`${scene}: ${count} frames -> assets/frames/${scene}/`);
}
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
