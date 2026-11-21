// Tạo bản 960 và 1600 điểm ảnh cho ba ảnh banner trang chủ (chạy một lần, tệp gốc giữ nguyên).
import sharp from 'sharp';
for (const name of ['round-tanks-installation', 'white-spherical-tank', 'pickup-blue-tank']) {
  for (const width of [960, 1600]) {
    const info = await sharp(`public/images/products-2026/${name}.webp`).resize({ width, withoutEnlargement: true }).webp({ quality: 74 }).toFile(`public/images/products-2026/${name}-w${width}.webp`);
    console.log(name, width, info.width + 'x' + info.height, info.size);
  }
}
