// Chuẩn hoá nhãn nhóm sản phẩm hiện trên menu và chân trang: dùng chữ "và" thay cho ký hiệu "&".
export function cleanLabel(name: string) {
  return name.replace(/\s*&\s*/g, ' và ');
}

// Nhãn ngắn cho chân trang (cột hẹp trên điện thoại), rút gọn từ tên nhóm trong hồ sơ, giữ nguyên nghĩa.
const footerLabels: Record<string, string> = {
  'be-biogas-composite': 'Bể biogas',
  'be-phot-va-xu-ly-nuoc-thai': 'Bể phốt, nước thải',
  'be-nuoi-trong-thuy-san': 'Bể cá, thủy sản',
  'bon-chua-hoa-chat': 'Bồn hóa chất',
  'thung-cho-tom-ca': 'Thùng chở hải sản',
  'xe-gom-rac': 'Thùng rác, xe gom',
  'composite-theo-yeu-cau': 'Theo yêu cầu',
};
export function footerLabel(slug: string, name: string) {
  return footerLabels[slug] ?? cleanLabel(name);
}
