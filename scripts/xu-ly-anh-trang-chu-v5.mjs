// Vòng 5: xuất mọi ảnh sản phẩm thật (đủ khung, không cắt) thành webp nhiều cỡ vào public/images/home/ph-*.webp
// và ghi src/components/home/photos-real.ts (tỉ lệ đo từ ảnh gốc). Ảnh gốc ở products-2026 giữ nguyên.
// Chạy: node scripts/xu-ly-anh-trang-chu-v5.mjs
import sharp from 'sharp';
import { writeFileSync } from 'node:fs';

const items = [
  ['aerated-transport-tank', 'Thùng composite màu xanh có nắp, vòi xả và hệ ống sục khí'],
  ['pickup-blue-tank', 'Thùng composite xanh đặt trên xe bán tải màu cam'],
  ['blue-tanks-loading', 'Bốc xếp bể composite màu xanh lên xe vận chuyển'],
  ['round-tanks-installation', 'Công nhân lắp ghép bể composite tròn màu xanh ngoài trời'],
  ['round-blue-tanks-site', 'Ba bể composite tròn màu xanh đặt cạnh nhau trên sườn đồi'],
  ['white-spherical-tank', 'Bể composite dạng cầu màu trắng có chữ Thành Lợi'],
  ['white-tanks-yard', 'Các bồn composite trắng đặt tại khu vực ngoài trời'],
  ['white-double-lid-tank', 'Thùng composite trắng có hai nắp mở tại xưởng'],
  ['rectangular-tanks-workshop', 'Các bể composite chữ nhật màu xanh xếp trong xưởng'],
  ['blue-open-tanks-yard', 'Các bể composite xanh nhiều hình dạng trong sân xưởng'],
  ['blue-white-lidded-tanks', 'Thùng composite xanh và trắng có nắp mở tại xưởng'],
  ['blue-box-tank-front', 'Mặt trước thùng composite màu xanh đặt trong sân xưởng'],
  ['blue-long-tank-shell', 'Cấu kiện bồn dài màu xanh cùng nhiều cấu kiện composite tại xưởng'],
  ['green-components-workshop', 'Các cấu kiện composite màu xanh lá trong nhà xưởng'],
  ['green-wheeled-bin', 'Thùng rác màu xanh lá có nắp và bánh xe tại xưởng'],
  ['custom-shells-workshop', 'Các chi tiết composite nhiều hình dáng trong nhà xưởng'],
  ['blue-composite-boat', 'Thuyền composite màu xanh với các khoang và ghế ngồi'],
  ['yellow-tank-detail', 'Bề mặt thùng composite màu vàng với vòi xả và ống dẫn'],
];
const rows = [];
for (const [base, alt] of items) {
  const src = `public/images/products-2026/${base}.webp`;
  const meta = await sharp(src).metadata();
  const portrait = meta.height > meta.width;
  const widths = (portrait ? [360, 540, 720, 960] : [480, 720, 960, 1280]).filter(w => w <= meta.width);
  for (const w of widths) await sharp(src).resize({ width: w }).webp({ quality: 80 }).toFile(`public/images/home/ph-${base}-${w}.webp`);
  rows.push({ base, widths, ratio: Number((meta.width / meta.height).toFixed(4)), alt });
}
const body = rows.map(r => `  ${JSON.stringify(r.base)}: { base: ${JSON.stringify(r.base)}, widths: [${r.widths.join(', ')}], ratio: ${r.ratio}, alt: ${JSON.stringify(r.alt)} },`).join('\n');
writeFileSync('src/components/home/photos-real.ts', `// Tạo bằng scripts/xu-ly-anh-trang-chu-v5.mjs. Tỉ lệ đo từ ảnh gốc, ảnh đủ khung, không cắt.
export type RealPhoto = { base: string; widths: readonly number[]; ratio: number; alt: string };
export const realPhotos = {
${body}
} as const satisfies Record<string, RealPhoto>;
export type RealKey = keyof typeof realPhotos;
const dir = '/images/home/ph-';
export const realSrc = (photo: RealPhoto, width?: number) => \`\${dir}\${photo.base}-\${width ?? photo.widths[photo.widths.length - 1]}.webp\`;
export const realSrcSet = (photo: RealPhoto) => photo.widths.map(width => \`\${dir}\${photo.base}-\${width}.webp \${width}w\`).join(', ');
export const realHeight = (photo: RealPhoto, width: number) => Math.round(width / photo.ratio);
// Dải ảnh dài: mọi ảnh thật khác nhau, thứ tự xen ảnh ngang và dọc.
export const stripOrder: RealKey[] = ['round-tanks-installation', 'white-spherical-tank', 'pickup-blue-tank', 'aerated-transport-tank', 'rectangular-tanks-workshop', 'blue-box-tank-front', 'blue-open-tanks-yard', 'white-double-lid-tank', 'custom-shells-workshop', 'green-wheeled-bin', 'blue-tanks-loading', 'round-blue-tanks-site', 'green-components-workshop', 'blue-composite-boat', 'blue-white-lidded-tanks', 'blue-long-tank-shell', 'yellow-tank-detail', 'white-tanks-yard'];
`);
console.log(rows.length, 'ảnh');
