// Xử lý ảnh trang chủ bằng sharp thành tệp mới trong public/images/home/ (không ghi đè, không xoá ảnh gốc).
// Mỗi ảnh: cắt đúng tỉ lệ khung dùng, cân sáng về cùng độ sáng trung bình, tăng nhẹ màu và độ nét, xuất webp nhiều cỡ.
// Chạy: node scripts/xu-ly-anh-trang-chu.mjs
import sharp from 'sharp';
import { mkdirSync, writeFileSync } from 'node:fs';

const src = 'public/images/products-2026/';
const out = 'public/images/home/';
mkdirSync(out, { recursive: true });

const TARGET_MEAN = 118;

// ratio = rộng / cao của khung cắt. position = điểm giữ lại khi cắt.
const jobs = [
  { name: 'hero-lap-dat', file: 'round-tanks-installation.webp', ratio: 16 / 9, widths: [960, 1600, 2000], position: 'centre' },
  { name: 'hero-xe-ban-tai', file: 'pickup-blue-tank.webp', ratio: 16 / 9, widths: [960, 1600], position: 'centre' },
  { name: 'hero-be-biogas', file: 'white-spherical-tank.webp', ratio: 3 / 4, widths: [480, 720, 1080], position: 'centre' },
  { name: 'gioi-thieu-xuong', file: 'custom-shells-workshop.webp', ratio: 4 / 3, widths: [640, 960, 1276], position: 'centre' },
  { name: 'vat-lieu-be-mat', file: 'yellow-tank-detail.webp', ratio: 16 / 10, widths: [640, 960, 1280], position: 'centre' },
  { name: 'dai-xe-ban-tai', file: 'pickup-blue-tank.webp', ratio: 4 / 3, widths: [480, 720, 960], position: 'centre' },
  { name: 'dai-be-chu-nhat', file: 'rectangular-tanks-workshop.webp', ratio: 4 / 3, widths: [480, 720, 960], position: 'centre' },
  { name: 'dai-bon-trang', file: 'white-tanks-yard.webp', ratio: 3 / 4, widths: [360, 540, 720], position: 'centre' },
  { name: 'dai-cau-kien-xanh-la', file: 'green-components-workshop.webp', ratio: 4 / 3, widths: [480, 720, 960], position: 'centre' },
  { name: 'dai-thung-co-nap', file: 'blue-white-lidded-tanks.webp', ratio: 4 / 3, widths: [480, 720, 960], position: 'centre' },
  { name: 'dai-be-ho-nhieu-kieu', file: 'blue-open-tanks-yard.webp', ratio: 4 / 3, widths: [480, 720, 960], position: 'centre' },
  { name: 'ket-cau-be-mat', file: 'rectangular-tanks-workshop.webp', ratio: 16 / 10, widths: [640, 960, 1280], region: [0.40, 0.36, 0.60] },
  { name: 'be-nuoi-thuy-san', file: 'round-blue-tanks-site.webp', ratio: 4 / 3, widths: [480, 720, 960], region: [0.04, 0.5, 0.88] },
  { name: 'be-tron-lap-dat', file: 'round-tanks-installation.webp', ratio: 4 / 3, widths: [480, 720, 960], region: [0.08, 0.04, 0.7] },
  { name: 'giao-hang-boc-xep', file: 'blue-tanks-loading.webp', ratio: 4 / 3, widths: [480, 720, 960], position: 'centre' },
];

const manifest = {};
for (const job of jobs) {
  const input = sharp(src + job.file);
  const meta = await input.metadata();
  // Cắt lớn nhất có thể theo tỉ lệ, không phóng to ảnh.
  let cropW = meta.width, cropH = Math.round(cropW / job.ratio), left = 0, top = 0;
  if (job.region) { const [x, y, w] = job.region; cropW = Math.round(meta.width * w); cropH = Math.round(cropW / job.ratio); left = Math.round(meta.width * x); top = Math.round(meta.height * y); if (left + cropW > meta.width) left = meta.width - cropW; if (top + cropH > meta.height) top = meta.height - cropH; }
  else { if (cropH > meta.height) { cropH = meta.height; cropW = Math.round(cropH * job.ratio); } left = Math.round((meta.width - cropW) / 2); top = Math.round((meta.height - cropH) / 2); }
  const cropped = await sharp(src + job.file).extract({ left, top, width: cropW, height: cropH }).toBuffer();
  const stats = await sharp(cropped).stats();
  const mean = stats.channels.slice(0, 3).reduce((sum, channel) => sum + channel.mean, 0) / 3;
  const gain = Math.min(1.22, Math.max(0.86, TARGET_MEAN / mean));
  const lq = await sharp(cropped).resize(24, Math.round(24 / job.ratio)).linear(gain, 0).blur(1.2).webp({ quality: 40 }).toBuffer();
  manifest[job.name] = { lqip: 'data:image/webp;base64,' + lq.toString('base64'), source: job.file, crop: [cropW, cropH], meanBefore: Math.round(mean), gain: Math.round(gain * 100) / 100, files: [] };
  for (const width of job.widths) {
    if (width > cropW + 1) continue;
    const height = Math.round(width / job.ratio);
    const file = `${job.name}-${width}.webp`;
    await sharp(cropped)
      .resize(width, height, { fit: 'cover', position: job.position })
      .linear(gain, 0)
      .modulate({ saturation: 1.05 })
      .sharpen({ sigma: 0.7 })
      .webp({ quality: 78, effort: 5 })
      .toFile(out + file);
    const check = await sharp(out + file).stats();
    manifest[job.name].files.push({ file, width, height, meanAfter: Math.round(check.channels.slice(0, 3).reduce((sum, channel) => sum + channel.mean, 0) / 3) });
  }
}
writeFileSync(out + 'manifest.json', JSON.stringify(manifest, null, 2));
console.log(JSON.stringify(manifest, null, 1));
