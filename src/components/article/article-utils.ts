import type { RichNode } from '@/lib/rich-text';
import { slugify } from '@/lib/text';

export type TocItem = { id: string; text: string; level: 2 | 3 };
export type PostKind = 'article' | 'project';

export function kindLabel(kind: string): string {
  return kind === 'project' ? 'Công trình thực tế' : 'Kiến thức sản phẩm';
}

export function plainText(node: RichNode): string {
  if (node.type === 'text') return node.text ?? '';
  const parts = (node.content ?? []).map(plainText);
  return parts.join(['paragraph', 'heading', 'listItem', 'tableCell', 'tableHeader'].includes(node.type) ? '' : ' ').trim();
}

function headings(node: RichNode, out: { level: number; text: string }[] = []) {
  if (node.type === 'heading') out.push({ level: Number(node.attrs?.level) || 2, text: plainText(node).trim() });
  node.content?.forEach(child => headings(child, out));
  return out;
}

/** Mã neo cho mọi tiêu đề (h2, h3, h4) theo thứ tự trong bài. Duy nhất, ổn định giữa máy chủ và mục lục. */
export function headingIds(doc: RichNode): string[] {
  const seen = new Map<string, number>();
  return headings(doc).map((item, index) => {
    const base = slugify(item.text) || `muc-${index + 1}`;
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return count ? `${base}-${count + 1}` : base;
  });
}

export function buildToc(doc: RichNode): TocItem[] {
  const ids = headingIds(doc);
  return headings(doc)
    .map((item, index) => ({ id: ids[index], text: item.text, level: item.level as number }))
    .filter((item): item is TocItem => (item.level === 2 || item.level === 3) && item.text.length > 0);
}

export function wordCount(doc: RichNode): number {
  const text = plainText(doc).replace(/\s+/g, ' ').trim();
  return text ? text.split(' ').length : 0;
}

/** Tiếng Việt đọc khoảng 200 từ mỗi phút. Tối thiểu 1 phút. */
export function readingMinutes(doc: RichNode): number {
  return Math.max(1, Math.round(wordCount(doc) / 200));
}

export function formatDateVi(value: string | Date): string {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return '';
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Ho_Chi_Minh', day: 'numeric', month: 'numeric', year: 'numeric' }).formatToParts(date);
  const get = (type: string) => parts.find(part => part.type === type)?.value ?? '';
  return `${get('day')} tháng ${get('month')}, ${get('year')}`;
}

/** Sản phẩm gần nghĩa nhất với bài, theo từ khoá trong tiêu đề và tóm tắt. Không khớp thì trả về null. */
export function relatedProductSlug(title: string, excerpt: string, slugs: string[]): string | null {
  const text = `${title} ${excerpt}`.toLowerCase();
  const rules: [RegExp, string][] = [
    [/biogas|khí sinh học|hầm ủ/, 'be-biogas-composite'],
    [/bể phốt|phốt|hầm cầu/, 'be-phot-composite'],
    [/nước thải|xử lý nước/, 'be-xu-ly-nuoc-thai'],
    [/hóa chất|axit|kiềm/, 'bon-chua-hoa-chat'],
    [/thủy sản|bể cá|cá koi|nuôi tôm|nuôi cá|nuôi trồng/, 'be-nuoi-trong-thuy-san'],
    [/vận chuyển tôm|thùng chở/, 'thung-cho-tom-ca'],
    [/xe gom|thùng rác|rác thải/, 'xe-gom-rac'],
  ];
  for (const [pattern, slug] of rules) if (pattern.test(text) && slugs.includes(slug)) return slug;
  return null;
}
