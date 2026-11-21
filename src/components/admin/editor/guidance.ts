import { documentWords, imagesMissingAlt, type RichNode } from '@/lib/rich-text';

/** Khung gợi ý: chỉ là dàn ý tiêu đề mục, không có nội dung viết sẵn. */
export type Template = { id: string; label: string; kind: 'article' | 'project'; headings: string[] };
export const templates: Template[] = [
  { id: 'chon', label: 'Hướng dẫn chọn sản phẩm', kind: 'article', headings: ['Nhu cầu cần giải quyết', 'Thông tin cần biết', 'Cách chọn quy cách phù hợp', 'Câu hỏi thường gặp'] },
  { id: 'lap', label: 'Hướng dẫn kỹ thuật lắp đặt', kind: 'article', headings: ['Chuẩn bị mặt bằng', 'Các bước thực hiện', 'Lưu ý khi lắp đặt', 'Câu hỏi thường gặp'] },
  { id: 'sosanh', label: 'So sánh các giải pháp', kind: 'article', headings: ['Các giải pháp đang được dùng', 'Bảng so sánh', 'Nên chọn giải pháp nào khi nào', 'Câu hỏi thường gặp'] },
  { id: 'congtrinh', label: 'Câu chuyện công trình', kind: 'project', headings: ['Nhu cầu của công trình', 'Quy cách sản phẩm', 'Quá trình thực hiện', 'Kết quả và lưu ý'] },
  { id: 'tin', label: 'Tin của công ty', kind: 'article', headings: ['Điều đáng chú ý', 'Chi tiết', 'Liên hệ'] },
];

/** Chủ đề bài viết lấy nguyên từ mục 6 hồ sơ nội dung. Bấm để điền tiêu đề. */
export const topicGroups: { group: string; topics: string[] }[] = [
  { group: 'Bể Biogas', topics: [
    'Bảng giá bể Biogas composite mới nhất và cách chọn dung tích theo số lượng lợn',
    'So sánh bể Biogas composite hình cầu với hầm xây gạch và túi ủ bạt nhựa',
    'Kỹ thuật lắp đặt bể Biogas composite tại vùng đất trũng, nhiều nước ngầm',
    'Hướng dẫn nạp liệu lần đầu và cách xử lý khi bể Biogas ít gas vào mùa đông',
  ] },
  { group: 'Bể phốt và xử lý nước thải', topics: [
    'Cách tính dung tích bể phốt composite cho gia đình từ 4 đến 10 người',
    'Tại sao nhà phố hiện đại và khu nhà trọ chuyển sang dùng bể phốt composite liền khối',
    'Hướng dẫn kỹ thuật hạ bể phốt composite dưới nền nhà và dưới đường ô tô chạy qua',
    'Giải pháp module xử lý nước thải composite cho nhà hàng, phòng khám',
  ] },
  { group: 'Bể cá và thủy sản', topics: [
    'Ưu điểm của bể tròn composite đáy phễu trong nuôi tôm thẻ và cá mật độ cao',
    'Mẫu bể cá Koi composite đúc sẵn tích hợp ngăn lọc cho sân thượng và sân vườn nhỏ',
    'So sánh độ bền và hiệu quả kinh tế giữa bể cá composite và bể lót bạt khung sắt',
    'Thiết kế dàn bể composite trữ hải sản tươi sống cho nhà hàng, vựa hải sản',
  ] },
  { group: 'Tin công ty', topics: [
    'Hành trình 15 năm Thành Lợi Composite đồng hành cùng nông dân và doanh nghiệp Việt',
    'Câu chuyện khách hàng sau khi dùng bể Biogas Thành Lợi',
  ] },
];

export type Check = { id: string; ok: boolean; text: string };

/** Danh sách kiểm trước khi đăng. Chỉ là gợi ý, không chặn việc đăng. */
export function checklist(input: { title: string; excerpt: string; cover: boolean; content: RichNode; seoTitle: string; seoDescription: string }): Check[] {
  const words = documentWords(input.content);
  const missingAlt = imagesMissingAlt(input.content);
  const hasHeading = Boolean(input.content.content?.some(node => node.type === 'heading'));
  const title = input.title.trim().length;
  return [
    { id: 'title', ok: title >= 20 && title <= 70, text: !title ? 'Chưa có tiêu đề' : title < 20 ? 'Tiêu đề hơi ngắn, nên từ 20 ký tự' : title > 70 ? 'Tiêu đề hơi dài, nên dưới 70 ký tự' : 'Tiêu đề có độ dài tốt' },
    { id: 'excerpt', ok: input.excerpt.trim().length >= 60, text: input.excerpt.trim() ? (input.excerpt.trim().length >= 60 ? 'Đã có tóm tắt' : 'Tóm tắt hơi ngắn, nên từ 60 ký tự') : 'Chưa có tóm tắt ngắn' },
    { id: 'cover', ok: input.cover, text: input.cover ? 'Đã chọn ảnh bìa' : 'Chưa chọn ảnh bìa' },
    { id: 'alt', ok: missingAlt === 0, text: missingAlt === 0 ? 'Ảnh trong bài đều có mô tả' : `${missingAlt} ảnh trong bài chưa có mô tả` },
    { id: 'length', ok: words >= 300, text: words >= 300 ? `Bài dài ${words} từ` : `Bài mới ${words} từ, nên từ 300 từ` },
    { id: 'headings', ok: hasHeading, text: hasHeading ? 'Đã chia bài thành các mục' : 'Nên chia bài thành các mục có tiêu đề' },
  ];
}

export function readingMinutes(words: number) { return Math.max(1, Math.round(words / 200)); }

/** Độ dài gợi ý cho phần hiển thị trên Google. */
export const seoLimits = { title: { min: 30, max: 60 }, description: { min: 70, max: 160 } };
export function lengthTone(length: number, range: { min: number; max: number }): 'empty' | 'short' | 'good' | 'long' {
  if (!length) return 'empty';
  return length < range.min ? 'short' : length > range.max ? 'long' : 'good';
}
