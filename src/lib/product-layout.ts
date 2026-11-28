import { z } from 'zod';

export const productSections = [
  { id: 'scale', label: 'Chọn dung tích / quy cách' },
  { id: 'features', label: 'Cấu tạo và ưu điểm' },
  { id: 'ordering', label: 'Thông tin đặt hàng' },
  { id: 'faq', label: 'Hỏi đáp' },
  { id: 'inquiry', label: 'Tư vấn báo giá' },
] as const;
export type ProductSection = typeof productSections[number]['id'];
export const sectionImageSchema = z.object({
  media_id: z.uuid(),
  alt: z.string().trim().max(500),
  caption: z.string().trim().max(500),
  fit: z.enum(['contain', 'cover']),
});
export const sectionLayoutSchema = z.object({
  section: z.enum(['scale', 'features', 'ordering', 'faq', 'inquiry']),
  position: z.enum(['left', 'right', 'before', 'after']),
  layout: z.enum(['stack', 'grid']),
  images: z.array(sectionImageSchema).max(6),
});
export const productLayoutSchema = z.array(sectionLayoutSchema).max(5)
  .refine(items => new Set(items.map(item => item.section)).size === items.length, 'Mỗi phần chỉ có một bố cục ảnh.')
  .refine(items => items.every(item => new Set(item.images.map(image => image.media_id)).size === item.images.length), 'Một ảnh không được lặp lại trong cùng phần.');
export type SectionImage = z.infer<typeof sectionImageSchema>;
export type SectionLayout = z.infer<typeof sectionLayoutSchema>;
export function emptySection(section: ProductSection): SectionLayout {
  return { section, position: 'right', layout: 'stack', images: [] };
}
export function sectionImageIds(items: SectionLayout[]): string[] {
  return [...new Set(items.flatMap(item => item.images.map(image => image.media_id)))];
}

/** A move preserves the image settings; duplicate/full destinations leave the source intact. */
export function moveSectionImage(items: SectionLayout[], from: ProductSection, id: string, to: ProductSection, before?: string): SectionLayout[] {
  const source = items.find(item => item.section === from);
  const image = source?.images.find(item => item.media_id === id);
  if (!image || before === id && from === to) return items;
  const target = items.find(item => item.section === to) ?? emptySection(to);
  if (from !== to && (target.images.length >= 6 || target.images.some(item => item.media_id === id))) return items;
  const remaining = target.images.filter(item => item.media_id !== id);
  const at = before ? remaining.findIndex(item => item.media_id === before) : remaining.length;
  remaining.splice(at < 0 ? remaining.length : at, 0, image);
  const next = items.map(item => item.section === to ? { ...target, images: remaining } : item.section === from ? { ...item, images: item.images.filter(item => item.media_id !== id) } : item);
  return items.some(item => item.section === to) ? next : [...next, { ...target, images: remaining }];
}
