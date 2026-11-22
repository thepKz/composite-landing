// Xuất hoa văn nền dùng chung từ ảnh gốc ở assets/decor-originals/ sang public/images/decor/.
// Chạy: node scripts/build-decor.mjs
// Không sửa ảnh gốc. Ảnh nền lớn giữ dưới 250 KB (hạ chất lượng dần nếu vượt). Hoa văn trong giữ alpha.
import sharp from 'sharp';
import { mkdirSync, statSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const src = 'assets/decor-originals';
const out = 'public/images/decor';
const LIMIT = 250 * 1024;
mkdirSync(out, { recursive: true });

// width: bề rộng mục tiêu (không phóng to quá ảnh gốc), quality: chất lượng khởi điểm, alpha: giữ kênh trong suốt
const jobs = [
  { file: 'song-nhua-toi.png', name: 'song-nhua', widths: [960, 1600, 2400], quality: 70 },
  { file: 'giay-soi-sang.png', name: 'giay-soi', widths: [960, 1600, 2400], quality: 72 },
  { file: 'gon-nuoc-net-manh.png', name: 'gon-nuoc', widths: [480, 960], quality: 82, alpha: true },
  { file: 'hoa-van-trong-dong.png', name: 'trong-dong', widths: [480, 720], quality: 70, alpha: true, alphaQuality: 60 },
  { file: 'soi-thuy-tinh-toi.png', name: 'soi-thuy-tinh', widths: [512], quality: 78, tile: true },
];

const rows = [];
for (const job of jobs) {
  const input = readFileSync(join(src, job.file));
  const meta = await sharp(input).metadata();
  for (const width of job.widths) {
    if (width > (meta.width ?? 0)) {
      rows.push({ name: `${job.name}-${width}.webp`, note: `bỏ qua: ảnh gốc chỉ rộng ${meta.width}px, không phóng to` });
      continue;
    }
    let quality = job.quality;
    let buffer;
    for (;;) {
      let pipeline = sharp(input).resize({ width, withoutEnlargement: true });
      if (!job.alpha) pipeline = pipeline.removeAlpha();
      buffer = await pipeline.webp({ quality, effort: 5, alphaQuality: job.alphaQuality ?? (job.alpha ? 85 : 100), smartSubsample: true }).toBuffer();
      if (buffer.length <= LIMIT || quality <= 40) break;
      quality -= 6;
    }
    const file = `${job.name}-${width}.webp`;
    writeFileSync(join(out, file), buffer);
    const info = await sharp(buffer).metadata();
    rows.push({ name: file, size: statSync(join(out, file)).size, w: info.width, h: info.height, q: quality, alpha: info.hasAlpha });
  }
}

const lines = rows.map(r => r.size
  ? `${r.name}\t${r.w}x${r.h}\t${(r.size / 1024).toFixed(1)} KB\tq${r.q}\t${r.alpha ? 'alpha' : 'đặc'}${r.size > LIMIT ? '\tVƯỢT 250KB' : ''}`
  : `${r.name}\t${r.note}`);
writeFileSync(join(out, 'manifest.json'), JSON.stringify(rows, null, 2) + '\n');
console.log(lines.join('\n'));
