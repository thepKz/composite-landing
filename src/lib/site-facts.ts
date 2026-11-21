// Dữ kiện công ty lấy nguyên từ hồ sơ nội dung "final.docx" (bản Final V2) do chủ doanh nghiệp cung cấp.
// Không thêm số liệu, khách hàng, chứng nhận ngoài tệp đó. Sửa ở đây thì mọi trang công khai đổi theo.

export const facts = {
  legalName: 'Công ty Cổ phần Thành Lợi Composite',
  shortName: 'Thành Lợi Composite',
  taxCode: '2600665401',
  founded: 2010,
  address: 'Khu Tiên Sơn, xã Tiên Lương, tỉnh Phú Thọ',
  hotlines: [
    { display: '0964.444.2626', tel: '09644442626' },
    { display: '0943.924.816', tel: '0943924816' },
  ],
  zalo: '09644442626',
  email: 'info@thanhloicomposite.com',
  website: 'thanhloicomposite.com',
  hours: '7h30 – 17h30, thứ Hai đến thứ Bảy',
  facebook: 'https://www.facebook.com/thanhloicompositevn/',
  tiktok: 'https://www.tiktok.com/@thnh.li.composite',
  mapEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3712.4447580971832!2d104.9893577759779!3d21.4902923717653!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x313361007146b3f1%3A0xf4a42a90f4187fad!2zVGjDoG5oIEzhu6NpIENvbXBvc2l0ZQ!5e0!3m2!1svi!2s!4v1793708025019!5m2!1svi!2s',
  motto: 'Đúng yêu cầu – Đúng tiến độ – Bền vững theo thời gian',
} as const;

// Mục 2.2 của hồ sơ
export const metrics = [
  { value: '15+', unit: 'năm', label: 'Sản xuất và gia công composite FRP, từ năm 2010' },
  { value: '100+', unit: 'dự án', label: 'Công trình, trang trại đã bàn giao và vận hành ổn định' },
  { value: '25+', unit: 'tỉnh thành', label: 'Khách hàng, đại lý, trang trại và nhà máy trên toàn quốc' },
  { value: '10', unit: 'năm', label: 'Bảo hành tối đa, theo từng dòng sản phẩm' },
  { value: '30+', unit: 'năm', label: 'Tuổi thọ thiết kế trong điều kiện tiêu chuẩn' },
] as const;

// Mục 2.4 của hồ sơ
export const comparison = {
  columns: ['Composite FRP Thành Lợi', 'Bể xi măng, xây gạch', 'Bồn thép, kim loại'],
  rows: [
    { criterion: 'Chống ăn mòn', values: ['Chọn nhựa nền theo môi trường axit, kiềm, mặn', 'Dễ bị axit hữu cơ và nước thải bào mòn, mục vữa', 'Dễ rỉ sét, ăn mòn nhanh tại mối hàn và bề mặt'] },
    { criterion: 'Trọng lượng', values: ['Nhẹ, dễ vận chuyển đến vùng sâu, vùng đồi núi', 'Rất nặng, tốn chi phí gia cố móng và xây dựng', 'Nặng, cần thiết bị nâng hạ lớn'] },
    { criterion: 'Độ kín, chống thấm', values: ['Đúc liền khối, kín khí và chống thấm', 'Dễ nứt ngầm, thấm rò do lún lệch địa chất', 'Phụ thuộc chất lượng mối hàn và lớp sơn phủ'] },
    { criterion: 'Thời gian thi công', values: ['Lắp đặt trong 1–2 ngày, dùng ngay', 'Hàng tuần đến hàng tháng, phụ thuộc thời tiết', 'Trung bình'] },
    { criterion: 'Chi phí bảo trì', values: ['Rất thấp, không cần sơn phủ chống gỉ định kỳ', 'Tốn kém khi phải đào lên chống thấm, trát lại', 'Phải sơn chống gỉ và kiểm tra ăn mòn định kỳ'] },
    { criterion: 'Hình dạng, kích thước', values: ['Linh hoạt theo bản vẽ và mặt bằng thực tế', 'Cố định, không thể di dời khi đổi mặt bằng', 'Hạn chế về kiểu dáng uốn lượn'] },
  ],
} as const;

export const reasons = [
  { title: 'Vật liệu chính phẩm', text: 'Nhựa nền Polyester, Vinyl Ester kết hợp sợi thủy tinh gia cường nhập khẩu, không pha tạp chất.' },
  { title: 'Bảo hành dài hạn', text: 'Bảo hành đến 10 năm tùy dòng sản phẩm, tuổi thọ thiết kế trên 30 năm.' },
  { title: 'Đủ mọi quy mô', text: 'Từ hộ gia đình, nhà hàng, trang trại vừa đến dự án công nghiệp lớn.' },
  { title: 'Kỹ thuật trọn gói', text: 'Tư vấn dung tích, thiết kế, sản xuất, vận chuyển, lắp đặt tận nơi và bảo hành toàn quốc.' },
] as const;

// Mục 2.6 của hồ sơ
export const processSteps = [
  { title: 'Tiếp nhận nhu cầu', text: 'Chọn quy mô sử dụng trên website hoặc gọi hotline, nhắn Zalo.' },
  { title: 'Tư vấn dung tích', text: 'Kỹ sư dựa trên số vật nuôi, số người dùng hoặc mặt bằng để chốt phương án tiết kiệm nhất.' },
  { title: 'Báo giá, ký hợp đồng', text: 'Gửi báo giá chi tiết trong 1–24 giờ, thống nhất bản vẽ và tiến độ bàn giao.' },
  { title: 'Sản xuất, kiểm định', text: 'Gia công tại nhà máy Phú Thọ, kiểm độ dày, độ cứng, mối nối và thử kín trước khi xuất xưởng.' },
  { title: 'Lắp đặt, bảo hành', text: 'Giao hàng toàn quốc, hướng dẫn hoặc trực tiếp lắp đặt tại công trình, bảo hành dài hạn.' },
] as const;

// Mục 4.10 của hồ sơ
export const faqs = [
  { q: 'Bể composite có bền hơn bể xây xi măng không?', a: 'Composite FRP không gỉ, không nứt ngầm do co ngót nhiệt hay lún địa chất và chống thấm tốt, nên bền hơn và hầu như không tốn chi phí bảo trì trong môi trường ẩm ướt, hóa chất hoặc nước thải.' },
  { q: 'Làm sao biết bể dùng đúng loại nhựa và đủ độ dày?', a: 'Mọi đơn hàng ghi rõ độ dày thành bồn, chủng loại nhựa và trọng lượng tiêu chuẩn ngay trong hợp đồng. Khách hàng có thể kiểm tra tại xưởng hoặc đo độ dày thực tế khi nghiệm thu.' },
  { q: 'Bể bị nứt vỡ có sửa được không?', a: 'Có. Kỹ thuật viên mài nhám và đắp vá bằng chính sợi thủy tinh và nhựa nền tại chỗ. Vị trí gia cố sau khi đóng rắn sẽ liền khối, đạt độ bền và độ kín tương đương ban đầu.' },
  { q: 'Lắp bể ở vùng đất trũng, nhiều nước ngầm cần lưu ý gì?', a: 'Hút cạn nước trong hố, gia cố đáy bằng cát đầm chặt hoặc bê tông lót phẳng. Ngay khi hạ bể đúng vị trí, bơm nước vào lòng bể để cân bằng lực đẩy nổi, rồi lấp đất mịn theo từng lớp và đầm đều tay.' },
  { q: 'Thời gian báo giá, sản xuất và giao hàng thế nào?', a: 'Báo giá trong 15–60 phút kể từ khi nhận đủ thông tin. Giao hàng khoảng 2–3 ngày với mẫu bể tiêu chuẩn có sẵn khuôn và 10–25 ngày với đơn thiết kế riêng. Hỗ trợ xe tải ghép chuyến giao hàng và lắp đặt toàn quốc.' },
] as const;

// Mục 4.9 của hồ sơ: các nút chọn nhanh quy mô trong biểu mẫu báo giá
export const quoteScales = {
  biogas: { label: 'Bể biogas composite', question: 'Quy mô chăn nuôi', options: [
    { label: 'Dưới 15 con lợn', hint: 'Gợi ý bể 1,5 – 6 m³' },
    { label: '15 – 30 con lợn', hint: 'Gợi ý bể 6 m³' },
    { label: '30 – 50 con lợn', hint: 'Gợi ý bể 7,2 m³' },
    { label: '50 – 80 con lợn', hint: 'Gợi ý bể 9,2 m³' },
    { label: 'Trên 80 con lợn', hint: 'Gợi ý bể 10 – 13 m³ hoặc ghép dãy' },
  ] },
  septic: { label: 'Bể phốt, xử lý nước thải', question: 'Số người dùng hoặc loại công trình', options: [
    { label: 'Gia đình 3 – 6 người', hint: 'Gợi ý bể 1,0 – 1,5 m³' },
    { label: 'Gia đình lớn, biệt thự 7 – 15 người', hint: 'Gợi ý bể 2,0 – 3,0 m³' },
    { label: 'Nhà trọ, nhà hàng 15 – 50 người', hint: 'Gợi ý bể 4 – 10 m³' },
    { label: 'Trường học, cơ quan 50 – 200 người', hint: 'Gợi ý bể 12 – 30 m³' },
    { label: 'Nhà máy, dự án trên 200 người', hint: 'Tư vấn module theo lưu lượng' },
  ] },
  fish: { label: 'Bể cá Koi, bể thủy sản', question: 'Mục đích nuôi', options: [
    { label: 'Hồ cá Koi sân vườn, sân thượng', hint: 'Có vách lọc 3–4 ngăn, gắn kính' },
    { label: 'Bể trữ hải sản nhà hàng, vựa', hint: 'Bể chữ nhật' },
    { label: 'Bể ươm giống, nuôi lươn, ếch, ba ba', hint: 'Bể tròn đáy bằng hoặc đáy côn' },
    { label: 'Bể tròn đáy phễu nuôi tôm cá RAS', hint: 'Đường kính 3 – 8 m' },
  ] },
  other: { label: 'Sản phẩm khác', question: 'Dòng sản phẩm', options: [
    { label: 'Bồn chứa hóa chất', hint: '' },
    { label: 'Thùng chở hải sản sống', hint: '' },
    { label: 'Thùng rác, xe gom rác', hint: '' },
    { label: 'Gia công theo yêu cầu', hint: '' },
  ] },
} as const;
