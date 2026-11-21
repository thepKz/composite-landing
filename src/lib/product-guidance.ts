// Nội dung tư vấn theo từng sản phẩm, rút gọn từ hồ sơ nội dung bản Final V2 (mục 4.2 đến 4.8).
// Không thêm số liệu ngoài hồ sơ. Các cam kết tuyệt đối trong hồ sơ được viết giảm xuống mức trung thực.

export type ScaleRow = {
  /** Nhãn nút chọn nhanh, giống mục 4.9 của hồ sơ */
  chip: string;
  /** Gợi ý hiện ra khi bấm nút */
  suggest: string;
  /** Ô đầu của dòng (mã sản phẩm hoặc tên phân khúc) */
  lead: string;
  /** Các ô còn lại, đúng thứ tự cột sau cột đầu */
  cells: string[];
};
export type ScaleTable = { title: string; question: string; columns: string[]; rows: ScaleRow[]; note?: string };
export type Feature = { title: string; text: string; icon: 'shape' | 'seal' | 'bolt' | 'layers' | 'drop' | 'funnel' | 'move' | 'flask' | 'truck' | 'wind' | 'tool' | 'recycle' | 'shield' | 'ruler' };
export type Guidance = {
  tagline: string;
  features: Feature[];
  order: string[];
  scale?: ScaleTable;
  accessories?: { title: string; items: string[] };
  highlights?: { title: string; items: string[] };
  /** Chỉ số câu hỏi trong faqs của site-facts */
  faqs: number[];
};

const biogas: ScaleTable = {
  title: 'Chọn dung tích theo đàn',
  question: 'Đàn của bạn đang nuôi bao nhiêu?',
  columns: ['Mã sản phẩm', 'Đường kính, dung tích', 'Quy mô đàn', 'Đối tượng phù hợp', 'Khí và bảo hành'],
  rows: [
    { chip: '5 – 10 con lợn', suggest: 'Bể 1,5 m³', lead: 'TLC-BIO-1.5', cells: ['1,50 m (1,5 m³)', '5 – 10 con lợn, hoặc 1 – 2 con trâu bò', 'Hộ nhỏ lẻ tận dụng thức ăn thừa, kết hợp xử lý vệ sinh gia đình', 'Đun nấu cho gia đình 2 – 4 người. Bảo hành đến 10 năm'] },
    { chip: '15 – 30 con lợn', suggest: 'Bể 6 m³', lead: 'TLC-BIO-2.25', cells: ['2,25 m (6,0 m³)', '15 – 30 con lợn, hoặc 3 – 5 con bò, 200 – 300 gà vịt', 'Nông hộ chăn nuôi bán chuyên ở trung du, miền núi', 'Đun nấu cho gia đình 4 – 6 người và nấu cám. Bảo hành đến 10 năm'] },
    { chip: '30 – 50 con lợn', suggest: 'Bể 7,2 m³', lead: 'TLC-BIO-2.40', cells: ['2,40 m (7,2 m³)', '30 – 50 con lợn, hoặc 5 – 8 con bò, 300 – 500 gia cầm', 'Gia trại quy mô vừa, hộ nuôi lợn nái kết hợp lợn thịt', 'Đun nấu, thắp sáng, sưởi úm heo con và gà con mùa đông. Bảo hành đến 10 năm'] },
    { chip: '50 – 80 con lợn', suggest: 'Bể 9,2 m³', lead: 'TLC-BIO-2.60', cells: ['2,60 m (9,2 m³)', '50 – 80 con lợn, hoặc 8 – 12 con bò', 'Trang trại tập trung quy mô vừa, hợp tác xã nông nghiệp', 'Cấp khí cho 2 – 3 hộ dùng chung hoặc máy phát nhỏ. Bảo hành đến 10 năm'] },
    { chip: 'Trên 80 con lợn', suggest: 'Bể 10 – 13 m³, hoặc ghép dãy', lead: 'TLC-BIO-3.00', cells: ['2,9 – 3,0 m (10 – 13 m³)', '80 – 120 con lợn mỗi bể, ghép nối tiếp 2 – 10 bể cho trại 200 – 1.000 con trở lên', 'Trang trại công nghiệp quy mô lớn, dự án nông nghiệp sạch', 'Xử lý mùi hôi trang trại lớn, chạy máy phát biogas. Bảo hành đến 10 năm'] },
  ],
  note: 'Đối chiếu số vật nuôi thực tế trong chuồng để chọn đúng mã bể. Kỹ sư rà lại bảng quy đổi trước khi chốt đơn.',
};

const septic: ScaleTable = {
  title: 'Chọn dung tích theo số người dùng',
  question: 'Công trình của bạn có bao nhiêu người dùng?',
  columns: ['Phân khúc', 'Dung tích', 'Số người, quy mô', 'Công trình phù hợp', 'Kiểu dáng, lắp đặt'],
  rows: [
    { chip: 'Gia đình 3 – 6 người', suggest: 'Bể 1,0 – 1,5 m³', lead: 'Gia đình nhỏ', cells: ['1,0 – 1,5 m³', '3 – 6 người, 1 – 2 phòng vệ sinh', 'Nhà phố nhỏ, nhà cấp 4 nông thôn, nhà vườn, homestay mini', 'Bể cầu hoặc trụ nằm ngang, chôn gọn dưới gầm cầu thang hoặc sân'] },
    { chip: 'Biệt thự 7 – 15 người', suggest: 'Bể 2,0 – 3,0 m³', lead: 'Gia đình lớn, biệt thự', cells: ['2,0 – 3,0 m³', '7 – 15 người, 3 – 5 phòng vệ sinh', 'Biệt thự sân vườn, nhà ống nhiều tầng, nhà ở kết hợp kinh doanh', 'Bể trụ nằm ba ngăn kỵ khí, có gân gia cường chịu lực đất đè'] },
    { chip: 'Nhà trọ, nhà hàng 15 – 50 người', suggest: 'Bể 4 – 10 m³', lead: 'Kinh doanh dịch vụ', cells: ['4 – 10 m³', '15 – 50 người, hoặc khu nhà trọ 10 – 25 phòng', 'Nhà trọ, nhà hàng, quán cà phê, khách sạn mini, văn phòng', 'Bể trụ nằm dung tích lớn, ngăn lọc vi sinh mật độ cao chống tắc'] },
    { chip: 'Trường học, cơ quan 50 – 200 người', suggest: 'Bể 12 – 30 m³', lead: 'Công cộng và đô thị', cells: ['12 – 30 m³', '50 – 200 người dùng thường xuyên', 'Trường học, phòng khám, chung cư mini, trụ sở cơ quan, chợ', 'Bể tự hoại cải tiến Bastian hoặc module xử lý hợp khối'] },
    { chip: 'Nhà máy, dự án trên 200 người', suggest: 'Tư vấn module theo lưu lượng', lead: 'Công nghiệp và dự án', cells: ['35 – 100 m³ trở lên, hoặc ghép module', '200 – 1.000 công nhân trở lên, lưu lượng 10 – 500 m³ mỗi ngày đêm', 'Nhà máy trong khu công nghiệp, khu đô thị mới, resort, trạm dừng nghỉ', 'Module AAO, MBBR hợp khối, tham chiếu QCVN 14 và QCVN 40'] },
  ],
  note: 'Bảng tra nhanh theo số người dùng hoặc quy mô công trình. Dung tích chốt theo khảo sát thực tế.',
};

const fish: ScaleTable = {
  title: 'Chọn kiểu bể theo mục đích nuôi',
  question: 'Bạn nuôi để làm gì?',
  columns: ['Nhóm bể', 'Dung tích phổ biến', 'Khách hàng', 'Vật nuôi, mục đích', 'Cấu hình đề xuất'],
  rows: [
    { chip: 'Hồ cá Koi sân vườn', suggest: 'Hồ 1,0 – 5,0 m³ có vách lọc 3 – 4 ngăn, gắn kính', lead: 'Hồ cá Koi, cảnh quan', cells: ['1,0 – 5,0 m³, chữ nhật bo góc, tròn hoặc uốn lượn', 'Chủ nhà phố, sân thượng, biệt thự, quán cà phê Koi', 'Cá Koi, cá vàng, cá rồng, trồng sen súng', 'Đúc liền vách lọc 3 – 4 ngăn, Gelcoat đen hoặc xanh rêu, gắn kính cường lực mặt trước'] },
    { chip: 'Bể trữ hải sản nhà hàng', suggest: 'Bể chữ nhật 0,5 – 3,0 m³', lead: 'Bể trữ hải sản sống', cells: ['0,5 – 3,0 m³, chữ nhật xếp tầng hoặc đặt riêng', 'Nhà hàng hải sản, khách sạn, siêu thị, chợ đầu mối, vựa', 'Tôm hùm, cua biển, cá song, cá tầm, ốc hương tươi sống', 'Lòng trắng sứ hoặc xanh dương sáng, ống xả tràn, van xả đáy, khung chân chịu lực'] },
    { chip: 'Ươm giống, nuôi lươn ếch', suggest: 'Bể tròn đáy bằng hoặc đáy côn 2 – 10 m³', lead: 'Bể ươm giống, nuôi đặc sản', cells: ['2,0 – 10 m³, tròn đáy bằng, đáy côn nhẹ, vuông bo góc, máng ấp', 'Trại tôm giống, cá giống, hộ nuôi lươn không bùn, ếch, ba ba', 'Ươm ấu trùng, nuôi vỗ cá bố mẹ, nuôi đặc sản mật độ cao', 'Mặt nhẵn chống xước cá con, đáy dốc thoát cặn, dễ khử trùng giữa các vụ'] },
    { chip: 'Nuôi tôm cá RAS', suggest: 'Bể tròn đáy phễu đường kính 3 – 8 m', lead: 'Nuôi thủy sản công nghệ cao RAS', cells: ['10 – 50 m³ trở lên, đường kính 3 – 8 m, nguyên khối hoặc lắp ghép', 'Doanh nghiệp thủy sản, trang trại tôm trong nhà màng, trại RAS', 'Tôm thẻ chân trắng, cá tầm, cá hồi, cá chình mật độ cao', 'Đáy phễu dốc 5% – 15% thu cặn tâm đáy, chân đế khung thép hoặc FRP, nối hệ lọc tuần hoàn'] },
  ],
  note: 'Kích thước theo khuôn hiện có tại xưởng, hoặc làm khuôn mới theo mặt bằng của bạn.',
};

const trash: ScaleTable = {
  title: 'Chọn dòng và dung tích',
  question: 'Bạn cần loại nào?',
  columns: ['Dòng sản phẩm', 'Dung tích', 'Cấu tạo chính', 'Đối tượng sử dụng'],
  rows: [
    { chip: 'Thùng rác công cộng', suggest: 'Thùng đơn 60, 90, 120 hoặc 240 lít', lead: 'Thùng rác công cộng đơn', cells: ['60, 90, 120, 240 lít', 'Nắp kín ngăn mưa và mùi, 2 – 4 bánh cao su đặc xoay 360 độ, chốt inox', 'Đơn vị môi trường đô thị, khu dân cư, trường học, bệnh viện'] },
    { chip: 'Thùng phân loại', suggest: 'Thùng 2 – 3 ngăn, 2x60, 3x60 hoặc 2x80 lít', lead: 'Thùng rác phân loại 2 – 3 ngăn', cells: ['2x60, 3x60, 2x80 lít', 'Nắp bập bênh tự đóng hoặc đạp chân, phân màu theo chuẩn Bộ Tài nguyên và Môi trường', 'Công viên, khu du lịch, tòa nhà văn phòng, nhà máy'] },
    { chip: 'Thùng hình thú', suggest: 'Thùng trang trí 50 – 70 lít', lead: 'Thùng rác hình thú trang trí', cells: ['50 – 70 lít', 'Hình cá heo, chim cánh cụt, gấu trúc, giả gỗ, có giỏ đựng rác rời', 'Trường mầm non, tiểu học, khu vui chơi'] },
    { chip: 'Xe gom rác đẩy tay', suggest: 'Xe 400, 500, 660 hoặc 1000 lít', lead: 'Xe gom rác đẩy tay', cells: ['400, 500, 660, 1000 lít', 'Thùng composite dày 4 – 5 mm, khung thép phi 34, 3 bánh cao su đúc', 'Hợp tác xã vệ sinh môi trường, ban quản lý khu đô thị, nhà xưởng'] },
  ],
};

const faqSets = { grow: [3, 0, 2, 4], water: [0, 1, 2, 4], tank: [1, 2, 4], light: [1, 4] };

const guidance: Record<string, Guidance> = {
  'be-biogas-composite': {
    tagline: 'Thay hầm xây gạch và túi ủ bạt nhựa',
    features: [
      { icon: 'shape', title: 'Hình cầu, nhiều lớp', text: 'Hình cầu chia đều áp suất khí, không có góc chết đọng cặn. Lớp trong phủ Gelcoat và nhựa kháng axit hữu cơ, khí H2S. Lớp ngoài đan sợi thủy tinh Mat và Roving chịu áp lực đất và nước ngầm.' },
      { icon: 'seal', title: 'Đúc liền khối, kín khí', text: 'Không nứt ngầm hay rò khí khi đất sụt lún. Giữ nhiệt tốt nên vi sinh kỵ khí hoạt động ổn định cả mùa đông miền Bắc.' },
      { icon: 'bolt', title: 'Tự đẩy bã, lắp nhanh', text: 'Áp suất khí đẩy bã ra hố chứa làm phân hữu cơ, không cần hút thủ công. Hạ bể và vận hành trong một buổi, có thể đào lên di dời khi đổi vị trí chuồng.' },
    ],
    accessories: { title: 'Phụ kiện đi kèm', items: ['Ống dẫn khí PVC hoặc PE', 'Van khóa tổng', 'Đồng hồ đo áp suất khí', 'Bầu lọc khử mùi H2S', 'Bếp gas đôi biogas'] },
    order: ['Loại vật nuôi, số lượng hiện tại và dự kiến tăng đàn', 'Mặt bằng hạ bể: đất vườn khô, ruộng trũng có nước ngầm hay đất đồi đá', 'Khoảng cách từ chuồng đến vị trí đặt bể và bếp, để tính chiều dài dây dẫn khí'],
    scale: biogas,
    faqs: faqSets.grow,
  },
  'be-phot-composite': {
    tagline: 'Thay bể xây gạch cho nhà ở và công trình',
    features: [
      { icon: 'layers', title: 'Ba ngăn kỵ khí', text: 'Ngăn chứa, ngăn lắng và ngăn lọc sinh học kỵ khí có giá thể vi sinh. Phân hủy chất hữu cơ, giảm mùi và hạn chế tắc nghẽn.' },
      { icon: 'shield', title: 'Thân liền khối có gân', text: 'Chịu áp lực đất đè và lún lệch móng mà không nứt ngầm hay rò nước bẩn ra mạch nước ngầm. Kháng khí H2S và hóa chất tẩy rửa.' },
      { icon: 'bolt', title: 'Thi công nhanh', text: 'Rút ngắn thời gian thi công so với bể xây gạch, chống thấm nhờ đúc liền khối.' },
    ],
    order: ['Loại công trình và số người dùng tối đa, ví dụ nhà dân 5 người, nhà trọ 15 phòng, xưởng 150 công nhân', 'Vị trí hạ bể: dưới nền nhà, sân vườn hay đường có xe tải chạy qua, để tính độ dày thành 5 – 18 mm và tấm đan bê tông bảo vệ', 'Đường kính ống thoát chờ sẵn (90, 110, 140, 160 mm) để nhà máy đúc cổ nối đúng chuẩn'],
    scale: septic,
    faqs: faqSets.grow,
  },
  'be-xu-ly-nuoc-thai': {
    tagline: 'Module hợp khối cho công trình và nhà máy',
    features: [
      { icon: 'flask', title: 'Chọn công nghệ theo nguồn thải', text: 'Module AAO, AO, MBBR, Jokaso, cấu hình theo lưu lượng và tính chất nước thải của từng công trình.' },
      { icon: 'seal', title: 'Liền khối, chống thấm', text: 'Thân composite FRP không gỉ, không nứt ngầm, kháng ăn mòn trong môi trường nước thải.' },
      { icon: 'bolt', title: 'Lắp đặt nhanh', text: 'Sản xuất sẵn tại nhà máy, vận chuyển và lắp đặt trọn gói đến công trình.' },
    ],
    order: ['Loại công trình, số người hoặc lưu lượng nước thải mỗi ngày đêm', 'Tính chất nguồn thải và yêu cầu chuẩn đầu ra', 'Mặt bằng lắp đặt và kích thước ống vào, ra'],
    scale: { ...septic, title: 'Chọn module theo quy mô công trình', rows: septic.rows.slice(2) },
    faqs: faqSets.water,
  },
  'be-nuoi-trong-thuy-san': {
    tagline: 'Từ hồ Koi sân vườn đến trại nuôi RAS',
    features: [
      { icon: 'drop', title: 'An toàn cho vật nuôi', text: 'Gelcoat mặt trong láng như gương, không tiết kiềm hay phèn vôi như bể xi măng mới xây, không làm trầy da và vảy cá, hạn chế rêu tảo bám.' },
      { icon: 'funnel', title: 'Đáy phễu thu cặn', text: 'Đáy côn dốc 5% – 15% gom phân cá và thức ăn thừa về tâm xả, giảm công thay nước.' },
      { icon: 'move', title: 'Cơ động, giữ giá trị', text: 'Không cần đào móng, đặt được trên sân thượng, ban công hay trong xưởng. Dễ di chuyển hoặc chuyển nhượng khi đổi mặt bằng.' },
    ],
    order: ['Mục đích nuôi và loại thủy sản: Koi cảnh quan, trữ hải sản nhà hàng hay nuôi thương phẩm', 'Kiểu dáng, kích thước mong muốn và lối vào vị trí đặt bể, để chọn đúc nguyên khối hay lắp ghép tại chỗ', 'Tùy chọn kỹ thuật: đáy bằng hay đáy phễu, vách ngăn lọc, kính quan sát, màu lòng bể'],
    scale: fish,
    faqs: faqSets.water,
  },
  'bon-chua-hoa-chat': {
    tagline: 'Chọn nhựa nền theo từng loại hóa chất',
    features: [
      { icon: 'layers', title: 'Ba lớp tiêu chuẩn', text: 'Lớp lót kháng hóa chất dày 2,5 – 3,0 mm giàu nhựa Vinyl Ester hoặc Isophthalic. Lớp kết cấu quấn sợi đan chéo chịu lực. Lớp phủ ngoài kháng tia UV.' },
      { icon: 'flask', title: 'Nhiều loại hóa chất', text: 'Axit HCl, H2SO4, HNO3, H3PO4, kiềm NaOH, KOH, nước Javen, muối công nghiệp, dung dịch mạ điện, PAC, Polymer, FeCl3.' },
      { icon: 'tool', title: 'Phụ kiện theo vận hành', text: 'Ống thủy đo mức, cửa thăm Manhole, thang leo, giá đỡ motor khuấy.' },
    ],
    highlights: { title: 'Nhà máy thường dùng', items: ['Hóa chất', 'Xi mạ', 'Dệt nhuộm', 'Thực phẩm', 'Trạm xử lý nước'] },
    order: ['Tên hóa chất', 'Nồng độ (%)', 'Nhiệt độ làm việc (độ C)', 'Dung tích (m³)'],
    faqs: faqSets.tank,
  },
  'thung-cho-tom-ca': {
    tagline: 'May đo vừa khít lòng thùng xe',
    features: [
      { icon: 'layers', title: 'Ba lớp bảo ôn', text: 'Kết cấu ba lớp cách nhiệt giữ nước ổn định trên đường dài, có vách chắn sóng.' },
      { icon: 'tool', title: 'Phụ kiện chắc chắn', text: 'Khóa inox 304, van xả đáy lớn, hệ thống chia oxy đáy thùng.' },
      { icon: 'truck', title: 'May đo theo xe', text: 'Vừa lòng thùng xe bán tải (Ford Ranger, Hilux, Triton, Navara) và xe tải 500 kg, 1,25 tấn, 2,5 tấn, 5 tấn đến 15 tấn.' },
    ],
    highlights: { title: 'Dòng xe phù hợp', items: ['Xe bán tải', '500 kg', '1,25 tấn', '2,5 tấn', '5 tấn', 'Đến 15 tấn'] },
    order: ['Loại xe và kích thước lòng thùng', 'Loại thủy sản và quãng đường vận chuyển', 'Nhu cầu sục khí, chia ngăn, cửa xả'],
    faqs: faqSets.tank,
  },
  'xe-gom-rac': {
    tagline: 'Bền màu, không mục gỉ cho đô thị',
    features: [
      { icon: 'recycle', title: 'Không mục gỉ, bền màu', text: 'Composite FRP bền màu dưới nắng mưa, không mục gỉ, không bị mất cắp để tái chế.' },
      { icon: 'tool', title: 'Bánh xe và nắp chắc chắn', text: 'Bánh cao su đặc xoay 360 độ, chốt inox, nắp kín ngăn mưa và mùi.' },
      { icon: 'shield', title: 'Xe gom dày và cứng', text: 'Thùng composite dày 4 – 5 mm, khung thép phi 34, ba bánh cao su đúc.' },
    ],
    order: ['Loại rác và lượng thu gom mỗi ngày', 'Dung tích, số ngăn phân loại, màu sắc, hình dáng', 'Số lượng và địa điểm giao hàng'],
    scale: trash,
    faqs: faqSets.light,
  },
  'composite-theo-yeu-cau': {
    tagline: 'Từ bản vẽ CAD hoặc ý tưởng đến sản phẩm',
    features: [
      { icon: 'wind', title: 'Thiết bị xử lý khí thải', text: 'Tháp hấp thụ Scrubber, ống dẫn khí FRP, nắp đậy ngăn mùi bể nước thải.' },
      { icon: 'layers', title: 'Bọc phủ FRP', text: 'Chống thấm, chống ăn mòn cho bể bê tông và sàn nhà xưởng.' },
      { icon: 'ruler', title: 'Vỏ thiết bị và dân dụng', text: 'Vỏ tủ điện, máng cáp, phễu công nghiệp, bể bơi nguyên khối, bồn tắm, chậu hoa, nhà vệ sinh di động.' },
    ],
    highlights: { title: 'Quy trình năm bước', items: ['Nhận bản vẽ CAD hoặc mẫu', 'Tư vấn kết cấu và báo giá', 'Làm khuôn, đúc mẫu thử', 'Sản xuất hàng loạt và kiểm tra', 'Giao hàng, lắp đặt toàn quốc'] },
    order: ['Bản vẽ CAD, ảnh mẫu hoặc mô tả ý tưởng', 'Kích thước, số lượng và môi trường làm việc', 'Tiêu chí nghiệm thu và nhu cầu làm mẫu thử'],
    faqs: faqSets.light,
  },
};

const fallback: Guidance = {
  tagline: 'Tư vấn theo mục đích sử dụng',
  features: [
    { icon: 'ruler', title: 'Quy cách theo nhu cầu', text: 'Trao đổi quy cách theo mục đích sử dụng và mặt bằng thực tế.' },
    { icon: 'flask', title: 'Vật liệu theo môi trường', text: 'Chọn nhựa nền và phụ kiện theo điều kiện vận hành.' },
  ],
  order: ['Mục đích sử dụng, kích thước hoặc dung tích dự kiến', 'Số lượng và địa điểm giao hàng'],
  faqs: faqSets.light,
};

export function productGuidance(slug: string): Guidance { return guidance[slug] || fallback; }
