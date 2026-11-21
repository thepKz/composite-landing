// Cập nhật các dòng sản phẩm theo catalogue.ts mới (hồ sơ nội dung Final V2).
// Chỉ ghi đè dòng còn nguyên như bản seed cũ. Dòng quản trị viên đã sửa thì giữ nguyên.
// Chỉ đụng bảng products. Chạy lại không đổi thêm.
// Chạy: node --env-file=.env --import tsx scripts/apply-final-content.ts
import { db } from '../src/lib/db';
import { catalogue } from '../src/lib/catalogue';

type Spec = { label: string; value: string };
type Shape = { name: string; category: string; description: string; specifications: Spec[]; applications: string[]; sort_order: number };

// Bản seed cũ, đúng như catalogue.ts trước khi nâng cấp. Dùng để nhận biết dòng chưa ai sửa.
const legacy: Record<string, Shape> = {
  'be-biogas-composite': { name: 'Bể biogas composite', category: 'Chăn nuôi', description: 'Bể dùng để thu gom và xử lý chất thải chăn nuôi tại hộ gia đình, trang trại. Có 5 cỡ đường kính để lựa chọn theo diện tích lắp đặt.', specifications: [{ label: 'Đường kính', value: '2,70 / 2,45 / 2,40 / 2,25 / 1,90 m' }], applications: ['Hộ chăn nuôi', 'Trang trại'], sort_order: 0 },
  'be-phot-composite': { name: 'Bể phốt composite', category: 'Dân dụng', description: 'Bể xử lý nước thải sinh hoạt cho nhà ở và công trình dân dụng, dung tích từ 1 m³. Nhận sản xuất theo kích thước yêu cầu.', specifications: [{ label: 'Dung tích', value: 'Từ 1 m³' }, { label: 'Kích thước', value: 'Theo yêu cầu' }], applications: ['Nhà ở', 'Công trình dân dụng'], sort_order: 1 },
  'be-xu-ly-nuoc-thai': { name: 'Bể xử lý nước thải', category: 'Môi trường', description: 'Bể dùng trong hệ thống xử lý nước thải của công trình và cơ sở sản xuất. Kích thước, kết cấu được tư vấn theo lưu lượng và tính chất nước thải.', specifications: [{ label: 'Cấu hình', value: 'Tư vấn theo hệ thống' }], applications: ['Công trình', 'Cơ sở sản xuất'], sort_order: 2 },
  'bon-chua-hoa-chat': { name: 'Bồn chứa hóa chất', category: 'Công nghiệp', description: 'Bồn lưu trữ hóa chất cho nhà xưởng và hệ thống công nghiệp. Vật liệu được lựa chọn theo loại hóa chất, nồng độ và nhiệt độ sử dụng.', specifications: [{ label: 'Vật liệu', value: 'Xác nhận theo hóa chất' }], applications: ['Nhà xưởng', 'Hệ thống công nghiệp'], sort_order: 3 },
  'be-nuoi-trong-thuy-san': { name: 'Bể nuôi trồng thủy sản', category: 'Thủy sản', description: 'Bể phục vụ nuôi trồng thủy sản và trại giống. Kích thước được lựa chọn theo diện tích mặt bằng và cách bố trí khu nuôi.', specifications: [{ label: 'Kích thước', value: 'Theo yêu cầu' }], applications: ['Trại giống', 'Cơ sở nuôi trồng'], sort_order: 4 },
  'thung-cho-tom-ca': { name: 'Thùng vận chuyển tôm cá', category: 'Vận chuyển', description: 'Thùng chở tôm cá trên xe tải hoặc xe bán tải. Kích thước được lựa chọn theo lòng thùng xe và tải trọng cho phép.', specifications: [{ label: 'Dòng xe', value: 'Xe tải / xe bán tải' }], applications: ['Vận chuyển thủy sản'], sort_order: 5 },
  'xe-gom-rac': { name: 'Xe gom rác sinh hoạt', category: 'Môi trường', description: 'Xe thu gom rác sinh hoạt cho khu dân cư và đơn vị vệ sinh. Kích thước được tư vấn theo lượng rác và điều kiện sử dụng.', specifications: [{ label: 'Quy cách', value: 'Tư vấn theo nhu cầu' }], applications: ['Khu dân cư', 'Đơn vị vệ sinh'], sort_order: 6 },
  'composite-theo-yeu-cau': { name: 'Sản phẩm composite theo yêu cầu', category: 'Theo yêu cầu', description: 'Nhận sản xuất chi tiết và sản phẩm composite theo bản vẽ, ảnh mẫu hoặc yêu cầu sử dụng. Phương án chế tạo được thống nhất trước khi đặt hàng.', specifications: [{ label: 'Quy cách', value: 'Theo bản vẽ hoặc yêu cầu đã thống nhất' }, { label: 'Vật liệu', value: 'Tư vấn theo môi trường sử dụng' }], applications: ['Chi tiết kỹ thuật', 'Sản phẩm dân dụng', 'Thiết bị công nghiệp'], sort_order: 7 },
};

// Bản seed đời trước, còn nằm trong cơ sở dữ liệu cục bộ. Cũng là nội dung chưa ai sửa tay.
const legacyEarlier: Record<string, Shape> = {
  'be-biogas-composite': { name: 'Bể biogas composite', category: 'Chăn nuôi', description: 'Các lựa chọn đường kính cho nhu cầu thu gom và xử lý chất thải chăn nuôi. Tư vấn kích thước theo điều kiện lắp đặt thực tế.', specifications: [{ label: 'Đường kính', value: '2,70 / 2,45 / 2,40 / 2,25 / 1,90 m' }], applications: ['Hộ chăn nuôi', 'Trang trại'], sort_order: 0 },
  'be-phot-composite': { name: 'Bể phốt composite', category: 'Dân dụng', description: 'Dung tích từ 1 m³, nhận đặt theo kích thước. Trao đổi nhu cầu sử dụng và mặt bằng để lựa chọn bể phù hợp.', specifications: [{ label: 'Dung tích', value: 'Từ 1 m³' }, { label: 'Kích thước', value: 'Theo yêu cầu' }], applications: ['Nhà ở', 'Công trình dân dụng'], sort_order: 1 },
  'be-xu-ly-nuoc-thai': { name: 'Bể xử lý nước thải', category: 'Môi trường', description: 'Bể composite cho hệ thống xử lý nước thải. Cấu hình cần được xác định theo lưu lượng, tính chất nước thải và phương án xử lý.', specifications: [{ label: 'Cấu hình', value: 'Tư vấn theo hệ thống' }], applications: ['Công trình', 'Cơ sở sản xuất'], sort_order: 2 },
  'bon-chua-hoa-chat': { name: 'Bồn chứa hóa chất', category: 'Công nghiệp', description: 'Thiết kế theo nhu cầu lưu trữ. Loại hóa chất, nồng độ và nhiệt độ vận hành cần được xác nhận trước khi chọn vật liệu.', specifications: [{ label: 'Vật liệu', value: 'Xác nhận theo hóa chất' }], applications: ['Nhà xưởng', 'Hệ thống công nghiệp'], sort_order: 3 },
  'be-nuoi-trong-thuy-san': { name: 'Bể nuôi trồng thủy sản', category: 'Thủy sản', description: 'Các loại bể phục vụ nuôi trồng thủy sản, lựa chọn kích thước theo mặt bằng và nhu cầu vận hành.', specifications: [{ label: 'Kích thước', value: 'Theo yêu cầu' }], applications: ['Trại giống', 'Cơ sở nuôi trồng'], sort_order: 4 },
  'thung-cho-tom-ca': { name: 'Thùng vận chuyển tôm cá', category: 'Vận chuyển', description: 'Thùng chuyên chở tôm cá cho xe tải và xe bán tải. Cần đối chiếu kích thước thùng xe và tải trọng cho phép.', specifications: [{ label: 'Dòng xe', value: 'Xe tải / xe bán tải' }], applications: ['Vận chuyển thủy sản'], sort_order: 5 },
  'xe-gom-rac': { name: 'Xe gom rác sinh hoạt', category: 'Môi trường', description: 'Xe thu gom rác thải sinh hoạt. Trao đổi điều kiện sử dụng để xác định quy cách và kích thước.', specifications: [{ label: 'Quy cách', value: 'Tư vấn theo nhu cầu' }], applications: ['Khu dân cư', 'Đơn vị vệ sinh'], sort_order: 6 },
  'composite-theo-yeu-cau': { name: 'Sản phẩm composite theo yêu cầu', category: 'Theo yêu cầu', description: 'Trao đổi bản vẽ, hình ảnh hoặc ý tưởng để xác định vật liệu, kết cấu và phương án sản xuất phù hợp. Quy cách và khả năng thực hiện được xác nhận trước khi đặt hàng.', specifications: [{ label: 'Quy cách', value: 'Theo bản vẽ hoặc yêu cầu đã thống nhất' }, { label: 'Vật liệu', value: 'Tư vấn theo môi trường sử dụng' }], applications: ['Chi tiết kỹ thuật', 'Sản phẩm dân dụng', 'Thiết bị công nghiệp'], sort_order: 7 },
};

const canonical = (shape: Shape) => JSON.stringify([shape.name, shape.category, shape.description, shape.specifications.map(s => [s.label, s.value]), shape.applications, shape.sort_order]);
const parse = (value: unknown) => (typeof value === 'string' ? JSON.parse(value) : value);

try {
  let changed = 0, same = 0, kept = 0, missing = 0;
  for (const [index, product] of catalogue.entries()) {
    const next: Shape = { name: product.name, category: product.category, description: product.description, specifications: product.specifications.map(s => ({ label: s.label, value: s.value })), applications: [...product.applications], sort_order: index };
    const found = await db.query('SELECT name,category,description,specifications,applications,sort_order FROM products WHERE slug=$1', [product.slug]);
    const row = found.rows[0];
    if (!row) { missing++; console.log(`Chưa có dòng "${product.slug}" trong cơ sở dữ liệu, bỏ qua (script nạp mẫu sẽ tạo).`); continue; }
    const current: Shape = { name: row.name, category: row.category, description: row.description, specifications: parse(row.specifications), applications: parse(row.applications), sort_order: row.sort_order };
    if (canonical(current) === canonical(next)) { same++; console.log(`Đã khớp: ${product.slug}`); continue; }
    const olds = [legacy[product.slug], legacyEarlier[product.slug]].filter(Boolean);
    if (!olds.some(old => canonical(current) === canonical(old))) { kept++; console.log(`Giữ nguyên (đã được chỉnh tay): ${product.slug}`); continue; }
    await db.query('UPDATE products SET name=$2,category=$3,description=$4,specifications=$5,applications=$6,sort_order=$7,updated_at=now() WHERE slug=$1', [product.slug, next.name, next.category, next.description, JSON.stringify(next.specifications), JSON.stringify(next.applications), next.sort_order]);
    changed++;
    console.log(`Đã đổi: ${product.slug}`);
    console.log(`  tên: "${current.name}" thành "${next.name}"`);
    console.log(`  nhóm: "${current.category}" thành "${next.category}"`);
    console.log(`  thông số: ${current.specifications.length} dòng thành ${next.specifications.length} dòng`);
    console.log(`  thứ tự: ${current.sort_order} thành ${next.sort_order}`);
  }
  console.log(`Xong. Đã đổi ${changed}, đã khớp sẵn ${same}, giữ nguyên vì đã chỉnh tay ${kept}, chưa có dòng ${missing}.`);
} finally { await db.end(); }
