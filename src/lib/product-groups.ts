// Bảy nhóm sản phẩm theo mục 1 của hồ sơ nội dung. Ba nhóm đầu là dòng mũi nhọn.
type NavigationProduct = { slug: string; name: string };

export const fields = [
  { key: 'chan-nuoi', label: 'Chăn nuôi' },
  { key: 'dan-dung-moi-truong', label: 'Dân dụng và môi trường' },
  { key: 'thuy-san', label: 'Thủy sản' },
  { key: 'cong-nghiep', label: 'Công nghiệp' },
] as const;

export type FieldKey = (typeof fields)[number]['key'];

const groups: { slug: string; name: string; members: string[]; field: FieldKey; flagship?: number }[] = [
  { slug: 'be-biogas-composite', name: 'Bể biogas composite', members: ['be-biogas-composite'], field: 'chan-nuoi', flagship: 1 },
  { slug: 'be-phot-va-xu-ly-nuoc-thai', name: 'Bể phốt và xử lý nước thải', members: ['be-phot-composite', 'be-xu-ly-nuoc-thai'], field: 'dan-dung-moi-truong', flagship: 2 },
  { slug: 'be-nuoi-trong-thuy-san', name: 'Bể cá Koi và thủy sản', members: ['be-nuoi-trong-thuy-san'], field: 'thuy-san', flagship: 3 },
  { slug: 'bon-chua-hoa-chat', name: 'Bồn chứa hóa chất', members: ['bon-chua-hoa-chat'], field: 'cong-nghiep' },
  { slug: 'thung-cho-tom-ca', name: 'Thùng chở hải sản sống', members: ['thung-cho-tom-ca'], field: 'thuy-san' },
  { slug: 'xe-gom-rac', name: 'Thùng rác và xe gom rác', members: ['xe-gom-rac'], field: 'dan-dung-moi-truong' },
  { slug: 'composite-theo-yeu-cau', name: 'Composite theo yêu cầu', members: ['composite-theo-yeu-cau'], field: 'cong-nghiep' },
];

export function productGroups(products: readonly NavigationProduct[]) {
  const published = new Set(products.map(product => product.slug));
  const grouped = new Set(groups.flatMap(group => group.members));
  return [
    ...groups.filter(group => group.members.some(slug => published.has(slug))),
    ...products.filter(product => !grouped.has(product.slug)).map(product => ({ ...product, members: [product.slug], field: 'cong-nghiep' as FieldKey, flagship: undefined as number | undefined })),
  ];
}

/** Nhóm sản phẩm chứa một slug sản phẩm, dùng cho breadcrumb và sản phẩm liên quan. */
export function groupOfProduct(slug: string) {
  return groups.find(group => group.members.includes(slug));
}

/** Đổi tên nhóm cũ trên đường dẫn (?nhom=Chăn nuôi) sang lĩnh vực mới. */
export function fieldFromQuery(value: string | undefined): FieldKey | '' {
  if (!value) return '';
  const direct = fields.find(field => field.label === value || field.key === value);
  if (direct) return direct.key;
  const legacy: Record<string, FieldKey> = { 'Chăn nuôi': 'chan-nuoi', 'Dân dụng': 'dan-dung-moi-truong', 'Môi trường': 'dan-dung-moi-truong', 'Thủy sản': 'thuy-san', 'Vận chuyển': 'thuy-san', 'Công nghiệp': 'cong-nghiep', 'Theo yêu cầu': 'cong-nghiep', 'Vệ sinh đô thị': 'dan-dung-moi-truong' };
  return legacy[value] ?? '';
}
