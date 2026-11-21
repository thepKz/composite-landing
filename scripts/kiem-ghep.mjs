// Ghép ảnh dài 390px thành nhiều cột cạnh nhau để xem. node scripts/kiem-ghep.mjs <thư mục> <tên...>
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
const [dir, ...names] = process.argv.slice(2);
const out = join(dir, 'ghep'); mkdirSync(out, { recursive: true });
const colH = 1500, cols = 4;
for (const name of names) {
  const f = join(dir, name + '.png'); const m = await sharp(f).metadata();
  const n = Math.ceil(m.height / colH); const sheets = Math.ceil(n / cols);
  for (let s = 0; s < sheets; s++) {
    const comps = []; let k = 0;
    for (let c = s * cols; c < Math.min(n, (s + 1) * cols); c++, k++) {
      const h = Math.min(colH, m.height - c * colH);
      comps.push({ input: await sharp(f).extract({ left: 0, top: c * colH, width: m.width, height: h }).toBuffer(), left: k * (m.width + 6), top: 0 });
    }
    await sharp({ create: { width: k * (m.width + 6), height: colH, channels: 3, background: '#ff00ff' } }).composite(comps).jpeg({ quality: 72 }).toFile(join(out, `${name}-${s + 1}.jpg`));
  }
  console.log(name, sheets);
}
