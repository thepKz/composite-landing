// Xử lý ảnh xưởng thành tệp mới cho các trang phụ: cắt đúng tỉ lệ khung, cân sáng và tông cho đồng bộ, xuất webp nhiều cỡ.
// Không ghi đè, không xoá ảnh gốc. Chạy: node scripts/xu-ly-anh-trang-phu.mjs
import sharp from 'sharp';
import { mkdirSync, readdirSync } from 'node:fs';
const src = 'public/images/products-2026', out = 'public/images/trang-phu';
mkdirSync(out, { recursive: true });
const names = readdirSync(src).filter(f => f.endsWith('.webp') && !/-w\d+\.webp$/.test(f)).map(f => f.replace('.webp', ''));
// Một tông chung: kéo dải sáng, tăng nhẹ độ tươi, làm nét nhẹ. Ảnh chụp ở nhà xưởng tối nên nâng nhẹ vùng tối.
const tone = (img) => img.normalise({ lower: 2, upper: 99 }).modulate({ brightness: 1.03, saturation: 1.06 }).gamma(1.08).sharpen({ sigma: 0.7 });
const jobs = [
  ['sq', 1000, 1000], ['sq', 560, 560],      // khung ảnh chính trang chi tiết, 1:1
  ['r43', 960, 720], ['r43', 520, 390],      // thẻ danh mục, 4:3
  ['r32', 1400, 933],                          // dải ảnh rộng, 3:2
  ['r169', 1600, 900],                         // ảnh tràn đầu trang, 16:9
];
for (const name of names) {
  const file = `${src}/${name}.webp`;
  const meta = await sharp(file).metadata();
  for (const [tag, w, h] of jobs) {
    const W = Math.min(w, meta.width), H = Math.round(W * h / w);
    await tone(sharp(file).resize(W, H, { fit: 'cover', position: sharp.strategy.attention })).webp({ quality: 80 }).toFile(`${out}/${name}-${tag}-${w}.webp`);
  }
  // Bản đủ khung, không cắt, dùng cho hộp phóng to.
  const fw = Math.min(1600, meta.width);
  await tone(sharp(file).resize({ width: fw })).webp({ quality: 82 }).toFile(`${out}/${name}-full.webp`);
  console.log('xong', name, meta.width + 'x' + meta.height);
}
