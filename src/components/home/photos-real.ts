// Tạo bằng scripts/xu-ly-anh-trang-chu-v5.mjs. Tỉ lệ đo từ ảnh gốc, ảnh đủ khung, không cắt.
export type RealPhoto = { base: string; widths: readonly number[]; ratio: number; alt: string };
export const realPhotos = {
  "aerated-transport-tank": { base: "aerated-transport-tank", widths: [360, 540, 720, 960], ratio: 0.75, alt: "Thùng composite màu xanh có nắp, vòi xả và hệ ống sục khí" },
  "pickup-blue-tank": { base: "pickup-blue-tank", widths: [480, 720, 960, 1280], ratio: 1.3333, alt: "Thùng composite xanh đặt trên xe bán tải màu cam" },
  "blue-tanks-loading": { base: "blue-tanks-loading", widths: [480, 720, 960, 1280], ratio: 1.3333, alt: "Bốc xếp bể composite màu xanh lên xe vận chuyển" },
  "round-tanks-installation": { base: "round-tanks-installation", widths: [480, 720, 960, 1280], ratio: 1.3333, alt: "Công nhân lắp ghép bể composite tròn màu xanh ngoài trời" },
  "round-blue-tanks-site": { base: "round-blue-tanks-site", widths: [360, 540, 720, 960], ratio: 0.7531, alt: "Ba bể composite tròn màu xanh đặt cạnh nhau trên sườn đồi" },
  "white-spherical-tank": { base: "white-spherical-tank", widths: [360, 540, 720, 960], ratio: 0.75, alt: "Bể composite dạng cầu màu trắng có chữ Thành Lợi" },
  "white-tanks-yard": { base: "white-tanks-yard", widths: [360, 540, 720, 960], ratio: 0.75, alt: "Các bồn composite trắng đặt tại khu vực ngoài trời" },
  "white-double-lid-tank": { base: "white-double-lid-tank", widths: [360, 540, 720, 960], ratio: 0.75, alt: "Thùng composite trắng có hai nắp mở tại xưởng" },
  "rectangular-tanks-workshop": { base: "rectangular-tanks-workshop", widths: [480, 720, 960, 1280], ratio: 1.3333, alt: "Các bể composite chữ nhật màu xanh xếp trong xưởng" },
  "blue-open-tanks-yard": { base: "blue-open-tanks-yard", widths: [480, 720, 960], ratio: 1.3347, alt: "Các bể composite xanh nhiều hình dạng trong sân xưởng" },
  "blue-white-lidded-tanks": { base: "blue-white-lidded-tanks", widths: [480, 720, 960], ratio: 1.3347, alt: "Thùng composite xanh và trắng có nắp mở tại xưởng" },
  "blue-box-tank-front": { base: "blue-box-tank-front", widths: [360, 540, 720, 960], ratio: 0.75, alt: "Mặt trước thùng composite màu xanh đặt trong sân xưởng" },
  "blue-long-tank-shell": { base: "blue-long-tank-shell", widths: [360, 540, 720, 960], ratio: 0.75, alt: "Cấu kiện bồn dài màu xanh cùng nhiều cấu kiện composite tại xưởng" },
  "green-components-workshop": { base: "green-components-workshop", widths: [480, 720, 960, 1280], ratio: 1.3333, alt: "Các cấu kiện composite màu xanh lá trong nhà xưởng" },
  "green-wheeled-bin": { base: "green-wheeled-bin", widths: [360, 540, 720, 960], ratio: 0.75, alt: "Thùng rác màu xanh lá có nắp và bánh xe tại xưởng" },
  "custom-shells-workshop": { base: "custom-shells-workshop", widths: [480, 720, 960], ratio: 1.3347, alt: "Các chi tiết composite nhiều hình dáng trong nhà xưởng" },
  "blue-composite-boat": { base: "blue-composite-boat", widths: [360, 540, 720, 960], ratio: 0.75, alt: "Thuyền composite màu xanh với các khoang và ghế ngồi" },
  "yellow-tank-detail": { base: "yellow-tank-detail", widths: [480, 720, 960, 1280], ratio: 1.3333, alt: "Bề mặt thùng composite màu vàng với vòi xả và ống dẫn" },
} as const satisfies Record<string, RealPhoto>;
export type RealKey = keyof typeof realPhotos;
const dir = '/images/home/ph-';
export const realSrc = (photo: RealPhoto, width?: number) => `${dir}${photo.base}-${width ?? photo.widths[photo.widths.length - 1]}.webp`;
export const realSrcSet = (photo: RealPhoto) => photo.widths.map(width => `${dir}${photo.base}-${width}.webp ${width}w`).join(', ');
export const realHeight = (photo: RealPhoto, width: number) => Math.round(width / photo.ratio);
// Dải ảnh dài: mọi ảnh thật khác nhau, thứ tự xen ảnh ngang và dọc.
export const stripOrder: RealKey[] = ['round-tanks-installation', 'white-spherical-tank', 'pickup-blue-tank', 'aerated-transport-tank', 'rectangular-tanks-workshop', 'blue-box-tank-front', 'blue-open-tanks-yard', 'white-double-lid-tank', 'custom-shells-workshop', 'green-wheeled-bin', 'blue-tanks-loading', 'round-blue-tanks-site', 'green-components-workshop', 'blue-composite-boat', 'blue-white-lidded-tanks', 'blue-long-tank-shell', 'yellow-tank-detail', 'white-tanks-yard'];
