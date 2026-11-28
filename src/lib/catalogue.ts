import type { SectionLayout } from './product-layout';
// Danh mục sản phẩm theo hồ sơ nội dung bản Final V2 (mục 1, 2.5, 4.2 đến 4.8).
// Thứ tự trong mảng cũng là thứ tự hiển thị: ba dòng mũi nhọn đứng đầu.
// Giữ nguyên slug cũ để không gãy liên kết. Số đường kính biogas lấy theo bảng mới của hồ sơ.
export const catalogue = [
  {
    slug: 'be-biogas-composite',
    name: 'Bể biogas composite',
    category: 'Chăn nuôi',
    description: 'Bể composite FRP đúc liền khối để xử lý chất thải chăn nuôi. Kín khí, tự đẩy bã, thu khí sinh học cho nông hộ đến trang trại.',
    specifications: [
      { label: 'Dung tích', value: '1,5 – 13 m³' },
      { label: 'Đường kính', value: '1,50 – 3,00 m' },
      { label: 'Quy mô đàn', value: 'Từ 5 con lợn đến trại 1.000 con' },
      { label: 'Bảo hành', value: 'Đến 10 năm' },
    ],
    applications: ['Hộ chăn nuôi', 'Trang trại', 'Hợp tác xã'],
    type: 'biogas',
  },
  {
    slug: 'be-phot-composite',
    name: 'Bể phốt composite',
    category: 'Dân dụng',
    description: 'Bể tự hoại ba ngăn liền khối cho nhà ở, nhà trọ, nhà hàng và công trình. Thi công nhanh hơn bể xây gạch.',
    specifications: [
      { label: 'Dung tích', value: 'Từ 1 m³ đến 100 m³ trở lên' },
      { label: 'Độ dày thành', value: '5 – 18 mm theo vị trí chôn' },
      { label: 'Kiểu bể', value: 'Trụ nằm ngang, chia ba ngăn' },
    ],
    applications: ['Nhà ở', 'Nhà trọ', 'Trường học', 'Khu công nghiệp'],
    type: 'horizontal',
  },
  {
    slug: 'be-xu-ly-nuoc-thai',
    name: 'Bể xử lý nước thải',
    category: 'Môi trường',
    description: 'Module xử lý nước thải hợp khối AAO, AO, MBBR, Jokaso bằng composite FRP cho khu dân cư, nhà hàng, trường học và nhà máy.',
    specifications: [
      { label: 'Công nghệ', value: 'AAO, AO, MBBR, Jokaso' },
      { label: 'Dung tích', value: 'Từ 35 m³ hoặc ghép module' },
      { label: 'Lưu lượng', value: '10 – 500 m³ mỗi ngày đêm' },
    ],
    applications: ['Nhà máy', 'Khu đô thị', 'Nhà hàng', 'Phòng khám'],
    type: 'vertical',
  },
  {
    slug: 'be-nuoi-trong-thuy-san',
    name: 'Bể cá Koi và bể nuôi thủy sản',
    category: 'Thủy sản',
    description: 'Hồ cá Koi có vách lọc, bể trữ hải sản nhà hàng, bể ươm giống, bể tròn đáy phễu nuôi tôm cá.',
    specifications: [
      { label: 'Dung tích', value: '0,5 – 50 m³ trở lên' },
      { label: 'Kiểu bể', value: 'Chữ nhật, tròn, đáy bằng hoặc đáy phễu' },
      { label: 'Bề mặt', value: 'Gelcoat láng bóng' },
    ],
    applications: ['Hồ cá Koi', 'Nhà hàng hải sản', 'Trại giống', 'Nuôi RAS'],
    type: 'open',
  },
  {
    slug: 'bon-chua-hoa-chat',
    name: 'Bồn chứa hóa chất composite',
    category: 'Công nghiệp',
    description: 'Bồn FRP lưu trữ và khuấy trộn axit, kiềm, muối và dung dịch ăn mòn. Nhựa nền chọn theo hóa chất, nồng độ và nhiệt độ.',
    specifications: [
      { label: 'Cấu tạo', value: 'Ba lớp: lót, quấn sợi, phủ chống UV' },
      { label: 'Lớp lót', value: 'Dày 2,5 – 3,0 mm, Vinyl Ester hoặc Isophthalic' },
      { label: 'Kiểu bồn', value: 'Trụ đứng đáy bằng, đáy côn hoặc trụ nằm' },
    ],
    applications: ['Nhà máy hóa chất', 'Xi mạ', 'Dệt nhuộm', 'Xử lý nước'],
    type: 'vertical',
  },
  {
    slug: 'thung-cho-tom-ca',
    name: 'Thùng chở thủy hải sản sống',
    category: 'Vận chuyển',
    description: 'Thùng composite ba lớp bảo ôn PU Foam, có vách chắn sóng, may đo vừa lòng thùng xe bán tải và xe tải.',
    specifications: [
      { label: 'Dòng xe', value: 'Bán tải đến xe tải 15 tấn' },
      { label: 'Cấu tạo', value: 'Ba lớp bảo ôn PU Foam, vách chắn sóng' },
      { label: 'Phụ kiện', value: 'Khóa inox 304, van xả đáy, chia oxy' },
    ],
    applications: ['Thương lái', 'Vận tải thủy sản'],
    type: 'box',
  },
  {
    slug: 'xe-gom-rac',
    name: 'Thùng rác và xe gom rác',
    category: 'Vệ sinh đô thị',
    description: 'Thùng rác công cộng 60 – 240 lít và xe gom rác đẩy tay 400 – 1000 lít bằng composite FRP, không mục gỉ, bền màu.',
    specifications: [
      { label: 'Thùng rác', value: '60 – 240 lít' },
      { label: 'Xe gom rác', value: '400 – 1000 lít' },
      { label: 'Vật liệu', value: 'Composite FRP, không mục gỉ' },
    ],
    applications: ['Đô thị', 'Khu dân cư', 'Trường học', 'Khu công nghiệp'],
    type: 'cart',
  },
  {
    slug: 'composite-theo-yeu-cau',
    name: 'Sản phẩm composite theo yêu cầu',
    category: 'Theo yêu cầu',
    description: 'Gia công theo bản vẽ CAD, ảnh mẫu hoặc ý tưởng: bọc phủ FRP chống thấm, tháp xử lý khí thải, vỏ thiết bị, bể bơi.',
    specifications: [
      { label: 'Quy cách', value: 'Theo bản vẽ hoặc mẫu' },
      { label: 'Hạng mục', value: 'Xử lý khí thải, bọc phủ FRP, vỏ thiết bị, bể bơi' },
      { label: 'Quy trình', value: 'Năm bước, từ nhận bản vẽ đến lắp đặt' },
    ],
    applications: ['Chi tiết kỹ thuật', 'Thiết bị công nghiệp', 'Dân dụng'],
    type: 'custom',
  },
] as const;

export type Product = { id?: string; slug: string; name: string; category: string; description: string; specifications: {label:string;value:string}[]; applications: string[]; cover_id?: string | null; section_images?: SectionLayout[]; type?: string };
