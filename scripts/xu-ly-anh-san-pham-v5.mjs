// Vòng 5: xử lý 26 ảnh thật (không cắt, giữ tỉ lệ gốc) thành ba cỡ cho bộ xem ảnh sản phẩm.
// m = ảnh chính (cạnh dài 1200), t = ảnh nhỏ (cạnh dài 240), f = phóng to (cạnh dài 2000). Kiểm luôn ảnh trong data/uploads có trùng không (chỉ đọc).
// Chạy: node scripts/xu-ly-anh-san-pham-v5.mjs
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const P = 'public/images/products-2026/', C = 'public/images/customer/';
export const sources = {
  'aerated-transport-tank': P + 'aerated-transport-tank.webp',
  'blue-box-tank-front': P + 'blue-box-tank-front.webp',
  'blue-composite-boat': P + 'blue-composite-boat.webp',
  'blue-long-tank-shell': P + 'blue-long-tank-shell.webp',
  'blue-open-tanks-yard': P + 'blue-open-tanks-yard.webp',
  'blue-tanks-loading': P + 'blue-tanks-loading.webp',
  'blue-white-lidded-tanks': P + 'blue-white-lidded-tanks.webp',
  'custom-shells-workshop': P + 'custom-shells-workshop.webp',
  'green-components-workshop': P + 'green-components-workshop.webp',
  'green-wheeled-bin': P + 'green-wheeled-bin.webp',
  'pickup-blue-tank': P + 'pickup-blue-tank.webp',
  'rectangular-tanks-workshop': P + 'rectangular-tanks-workshop.webp',
  'round-blue-tanks-site': P + 'round-blue-tanks-site.webp',
  'round-tanks-installation': P + 'round-tanks-installation.webp',
  'white-double-lid-tank': P + 'white-double-lid-tank.webp',
  'white-spherical-tank': P + 'white-spherical-tank.webp',
  'white-tanks-yard': P + 'white-tanks-yard.webp',
  'yellow-tank-detail': P + 'yellow-tank-detail.webp',
  'customer-01': C + 'customer-01.webp', 'customer-02': C + 'customer-02.webp', 'customer-03': C + 'customer-03.webp',
  'customer-04': C + 'customer-04.webp', 'customer-05': C + 'customer-05.webp', 'customer-06': C + 'customer-06.webp',
  'customer-07': C + 'customer-07.webp', 'customer-08': C + 'customer-08.webp',
};
const out = 'public/images/san-pham';
const sizes = { m: [1200, 80], t: [240, 76], f: [2000, 82] };
const dims = {};
const hashes = {};
async function hash(file) { const b = await sharp(file).rotate().resize(16, 16, { fit: 'fill' }).greyscale().raw().toBuffer(); const mean = b.reduce((a, v) => a + v, 0) / b.length; return [...b].map(v => (v > mean ? 1 : 0)); }
for (const [id, file] of Object.entries(sources)) {
  for (const [k, [edge, q]] of Object.entries(sizes)) {
    const info = await sharp(file).rotate().resize({ width: edge, height: edge, fit: 'inside', withoutEnlargement: true }).webp({ quality: q }).toFile(path.join(out, `${id}-${k}.webp`));
    if (k === 'm') dims[id] = { w: info.width, h: info.height };
    if (k === 'f') dims[id] = { ...dims[id], fw: info.width, fh: info.height };
  }
  hashes[id] = await hash(file);
}
fs.writeFileSync(path.join(out, 'kich-thuoc.json'), JSON.stringify(dims, null, 1));
// So ảnh thư viện (chỉ đọc) với 26 ảnh gốc: hash cảm nhận 16x16.
const up = 'data/uploads'; const matched = {};
for (const f of fs.readdirSync(up).filter(f => f.endsWith('.webp'))) {
  const h = await hash(path.join(up, f)); let best = ['', 999];
  for (const [id, hh] of Object.entries(hashes)) { const d = h.reduce((a, v, i) => a + (v !== hh[i] ? 1 : 0), 0); if (d < best[1]) best = [id, d]; }
  matched[f] = best;
}
console.log(JSON.stringify(matched, null, 1));
const ids = new Set(Object.values(matched).filter(m => m[1] <= 12).map(m => m[0]));
console.log('ảnh thư viện khớp ảnh gốc:', Object.values(matched).filter(m => m[1] <= 12).length, '/', Object.keys(matched).length, ' ảnh gốc khác nhau:', ids.size);
