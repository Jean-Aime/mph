import { promises as fs } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const source = path.join(root, 'sequence');
const output = path.join(root, 'public');
const files = (await fs.readdir(source))
  .filter((name) => /^ezgif-frame-\d+\.jpg$/i.test(name))
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

if (files.length !== 120) {
  throw new Error(`Expected 120 source frames in ${source}; found ${files.length}.`);
}

const desktop = path.join(output, 'sequence-1');
const mobile = path.join(output, 'sequence-1-mobile');
const images = path.join(output, 'images');
await Promise.all([desktop, mobile, images].map((directory) => fs.mkdir(directory, { recursive: true })));

for (let index = 0; index < files.length; index += 1) {
  const sourcePath = path.join(source, files[index]);
  const filename = `frame_${String(index + 1).padStart(4, '0')}.jpg`;
  await sharp(sourcePath)
    .resize({ width: 1920, withoutEnlargement: true })
    .jpeg({ quality: 74, progressive: true })
    .toFile(path.join(desktop, filename));
  if (index % 2 === 0) {
    const mobileName = `frame_${String(Math.floor(index / 2) + 1).padStart(4, '0')}.jpg`;
    await sharp(sourcePath).resize({ width: 900, withoutEnlargement: true }).jpeg({ quality: 68, progressive: true }).toFile(path.join(mobile, mobileName));
  }
}

const heroSource = path.join(source, files[0]);
const revealSource = path.join(source, files.at(-1));
for (const [input, name] of [[heroSource, 'poster-hero.webp'], [revealSource, 'poster-reveal.webp']]) {
  const destination = path.join(images, name);
  let quality = 74;
  while (quality >= 35) {
    await sharp(input).resize({ width: 1600, withoutEnlargement: true }).webp({ quality, effort: 6 }).toFile(destination);
    if ((await fs.stat(destination)).size < 80 * 1024) break;
    quality -= 5;
  }
  const size = (await fs.stat(destination)).size;
  if (size >= 80 * 1024) throw new Error(`${name} is ${size} bytes, above the 80 KB budget.`);
  console.log(`${name}: ${size} bytes`);
}
console.log(`Prepared ${files.length} desktop frames and ${files.length / 2} mobile frames from sequence/.`);
