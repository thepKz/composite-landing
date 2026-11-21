// Cắt ảnh toàn trang thành các lát dễ xem: node scripts/shot-sheet.mjs <thư-mục-ảnh> <tên...>
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
const [dir, ...names] = process.argv.slice(2);
const out = join(dir, 'lat'); mkdirSync(out, { recursive: true });
for (const name of names) {
  const file = join(dir, name + '.png');
  const meta = await sharp(file).metadata();
  const slice = Math.round(meta.width * 1.5);
  const parts = Math.ceil(meta.height / slice);
  for (let i = 0; i < parts; i++) {
    const height = Math.min(slice, meta.height - i * slice);
    await sharp(file).extract({ left: 0, top: i * slice, width: meta.width, height }).resize({ width: Math.min(meta.width, 900) }).jpeg({ quality: 70 }).toFile(join(out, `${name}-${i + 1}.jpg`));
  }
  console.log(name, meta.width + 'x' + meta.height, parts);
}
