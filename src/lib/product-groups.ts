type NavigationProduct = { slug: string; name: string };
const groups = [
  { slug: 'be-biogas-composite', name: 'Bể Biogas composite', members: ['be-biogas-composite'] },
  { slug: 'be-phot-va-xu-ly-nuoc-thai', name: 'Bể phốt & xử lý nước thải', members: ['be-phot-composite', 'be-xu-ly-nuoc-thai'] },
  { slug: 'bon-chua-hoa-chat', name: 'Bồn chứa hóa chất composite', members: ['bon-chua-hoa-chat'] },
  { slug: 'be-nuoi-trong-thuy-san', name: 'Bể thủy sản & cá Koi', members: ['be-nuoi-trong-thuy-san'] },
  { slug: 'thung-cho-tom-ca', name: 'Thùng chở thủy hải sản sống', members: ['thung-cho-tom-ca'] },
  { slug: 'xe-gom-rac', name: 'Thùng rác & xe gom rác', members: ['xe-gom-rac'] },
  { slug: 'composite-theo-yeu-cau', name: 'Composite theo yêu cầu', members: ['composite-theo-yeu-cau'] },
];

export function productGroups(products: readonly NavigationProduct[]) {
  const published = new Set(products.map(product => product.slug));
  const grouped = new Set(groups.flatMap(group => group.members));
  return [...groups.filter(group => group.members.some(slug => published.has(slug))), ...products.filter(product => !grouped.has(product.slug)).map(product => ({ ...product, members: [product.slug] }))];
}
