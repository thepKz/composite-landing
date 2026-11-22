// Vòng 5: 26 ảnh thật của khách, mỗi ảnh một tệp, giữ nguyên tỉ lệ gốc (không cắt), ba cỡ do scripts/xu-ly-anh-san-pham-v5.mjs tạo.
// m: ảnh chính, t: ảnh nhỏ, f: phóng to. Chú thích và alt chỉ tả điều nhìn thấy.
// Ba nhóm chưa được khách xác nhận ảnh (bể phốt, xử lý nước thải, bồn hóa chất) KHÔNG có ảnh ở đây.
import dims from '../../public/images/san-pham/kich-thuoc.json';

export type Photo = { id: string; src: string; thumb: string; full: string; alt: string; label: string; width: number; height: number };
type Size = { w: number; h: number; fw: number; fh: number };

const dir = '/images/san-pham';
function photo(id: string, label: string, alt: string): Photo {
  const d = (dims as Record<string, Size>)[id];
  return { id, src: `${dir}/${id}-m.webp`, thumb: `${dir}/${id}-t.webp`, full: `${dir}/${id}-f.webp`, alt, label, width: d.w, height: d.h };
}

export const photos = {
  sphere: photo('white-spherical-tank', 'Bể dạng cầu màu trắng', 'Bể composite dạng cầu màu trắng có chữ Thành Lợi, đặt trong nhà xưởng'),
  yardTanks: photo('white-tanks-yard', 'Bể trụ nằm ngang màu trắng', 'Bốn bể composite màu trắng hình trụ nằm ngang đặt trên bãi đất'),
  roundInstall: photo('round-tanks-installation', 'Lắp ghép bể tròn', 'Công nhân lắp ghép bể composite tròn màu xanh bên bờ nước'),
  roundSite: photo('round-blue-tanks-site', 'Bể tròn xanh ngoài trời', 'Các bể composite tròn màu xanh đặt cạnh hố đất ngoài trời'),
  rectWorkshop: photo('rectangular-tanks-workshop', 'Dãy bể chữ nhật', 'Các bể composite chữ nhật màu xanh có vòi xả xếp trong xưởng'),
  openTrays: photo('blue-open-tanks-yard', 'Bể hở nhiều kiểu dáng', 'Ba bể composite xanh dạng khay có nắp đặt trong sân xưởng'),
  loading: photo('blue-tanks-loading', 'Bốc xếp bể lên xe', 'Mấy người bốc bể composite chữ nhật màu xanh lên thùng xe tải'),
  tankWater: photo('customer-05', 'Bể chữ nhật đang chứa nước', 'Bể composite chữ nhật màu xanh chứa nước, có ống dẫn, đặt trong phòng'),
  longTank: photo('customer-07', 'Bể chữ nhật dài', 'Bể composite chữ nhật dài màu xanh đặt giữa sân xưởng'),
  stacked: photo('customer-06', 'Bể chữ nhật xếp chồng', 'Hai chồng bể composite chữ nhật màu xanh trong nhà xưởng'),
  trough: photo('customer-01', 'Bể dạng máng dài', 'Bể composite màu xanh dạng máng dài đặt trên nền xưởng'),
  orangeTank: photo('customer-08', 'Bể chữ nhật màu cam', 'Bể composite chữ nhật lòng màu cam đặt trong nhà xưởng'),
  workshopTanks: photo('customer-02', 'Khu bể trong xưởng', 'Bể composite tròn và chữ nhật màu xanh xếp dưới mái xưởng'),
  workshopTanks2: photo('customer-03', 'Khu bể trong xưởng, góc khác', 'Bể composite chữ nhật xếp chồng màu xanh và một bể màu xanh lá dưới mái xưởng'),
  horizontalRow: photo('customer-04', 'Dãy bể nằm ngang', 'Dãy bể composite màu trắng và xanh lá nằm ngang bên đường đất'),
  longShell: photo('blue-long-tank-shell', 'Bồn dài màu xanh', 'Bồn composite dài màu xanh nằm trên nền xưởng, phía sau có nhiều cấu kiện'),
  aerated: photo('aerated-transport-tank', 'Thùng có hệ sục khí', 'Thùng composite màu xanh có nắp, vòi xả đáy và ống sục khí'),
  pickup: photo('pickup-blue-tank', 'Thùng đặt trên xe bán tải', 'Thùng composite màu xanh đặt trên thùng xe bán tải màu cam'),
  boxFront: photo('blue-box-tank-front', 'Thùng dạng hộp', 'Mặt trước thùng composite màu xanh dạng hộp có vòi xả'),
  lidded: photo('blue-white-lidded-tanks', 'Thùng xanh và trắng có nắp', 'Hai thùng composite màu trắng và xanh có nắp mở, vòi xả đáy'),
  doubleLid: photo('white-double-lid-tank', 'Thùng trắng hai nắp', 'Thùng composite màu trắng có hai nắp mở đặt trên khung chân'),
  yellow: photo('yellow-tank-detail', 'Thùng màu vàng', 'Thùng composite màu vàng có vòi xả đáy và ống dẫn'),
  bin: photo('green-wheeled-bin', 'Thùng rác có nắp và bánh xe', 'Thùng rác composite màu xanh lá có nắp và bánh xe tại xưởng'),
  boat: photo('blue-composite-boat', 'Thuyền composite', 'Thuyền composite màu xanh có các khoang và ghế ngồi'),
  shells: photo('custom-shells-workshop', 'Chi tiết tạo hình riêng', 'Các vỏ thuyền và chi tiết composite nhiều hình dáng trong nhà xưởng'),
  greenParts: photo('green-components-workshop', 'Cấu kiện màu xanh lá', 'Nhiều cấu kiện composite màu xanh lá xếp trên nền xưởng'),
};

// Mọi ảnh thật đúng sản phẩm đó, ảnh đầu là ảnh đại diện. Mỗi ảnh chỉ thuộc những sản phẩm nhìn thấy rõ trong ảnh.
export const productPhotos: Record<string, Photo[]> = {
  'be-biogas-composite': [photos.sphere],
  'be-nuoi-trong-thuy-san': [photos.roundInstall, photos.roundSite, photos.rectWorkshop, photos.openTrays, photos.loading, photos.tankWater, photos.longTank, photos.stacked, photos.trough, photos.orangeTank, photos.workshopTanks],
  'thung-cho-tom-ca': [photos.aerated, photos.pickup, photos.boxFront, photos.lidded, photos.doubleLid, photos.yellow],
  'xe-gom-rac': [photos.bin],
  'composite-theo-yeu-cau': [photos.boat, photos.shells, photos.greenParts],
};

// Ảnh chưa gán cho sản phẩm nào, chỉ dùng làm ảnh xưởng ở trang giới thiệu, dự án và hướng dẫn.
export const unassignedPhotos = [photos.yardTanks, photos.workshopTanks2, photos.horizontalRow, photos.longShell];
export const allPhotos: Photo[] = Object.values(photos);
