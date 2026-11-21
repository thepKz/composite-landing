import { safeLink } from './text';
import { RequestError } from './http';

export type RichNode = {
  type: string;
  text?: string;
  attrs?: Record<string, unknown>;
  marks?: { type: string; attrs?: Record<string, unknown> }[];
  content?: RichNode[];
};

export const mediaPath = /^\/api\/media\/([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})$/i;

/**
 * Thuộc tính ảnh trong bài (đọc phía công khai):
 *  - src      đường dẫn /api/media/<id>
 *  - alt      mô tả ảnh
 *  - title    chú thích hiện dưới ảnh
 *  - align    'center' (mặc định, vắng mặt nghĩa là center), 'left', 'wide' (tràn rộng hơn cột chữ)
 *  - width    phần trăm bề rộng cột chữ: 40, 60, 80 hoặc 100 (mặc định 100, vắng mặt nghĩa là 100)
 * Hai thuộc tính align và width chỉ được ghi khi khác mặc định, nên bài cũ không đổi.
 *  (Ngoại lệ: ảnh căn trái giữ width 100, vì khi đó 100 nghĩa là mức rộng nhất của ảnh nổi.)
 */
export const imageAlignments = ['center', 'left', 'wide'] as const;
export const imageWidths = [40, 60, 80, 100] as const;
export type ImageAlignment = (typeof imageAlignments)[number];
export type ImageWidth = (typeof imageWidths)[number];

const allowed = new Set([
  'doc', 'paragraph', 'heading', 'text', 'bulletList', 'orderedList', 'listItem', 'blockquote', 'codeBlock',
  'hardBreak', 'horizontalRule', 'image', 'video', 'table', 'tableRow', 'tableCell', 'tableHeader',
]);
const plainMarks = ['bold', 'italic', 'strike', 'underline', 'code'];

function cleanText(node: RichNode, result: RichNode) {
  if (typeof node.text !== 'string' || node.text.length > 100000) throw new RequestError('Đoạn văn chưa hợp lệ.', 400);
  result.text = node.text;
  if (!node.marks) return;
  if (!Array.isArray(node.marks) || node.marks.length > 8) throw new RequestError('Định dạng chữ chưa hợp lệ.', 400);
  result.marks = node.marks.map(mark => {
    if (plainMarks.includes(mark.type)) return { type: mark.type };
    const href = mark.attrs?.href;
    if (mark.type === 'link' && typeof href === 'string' && href.length <= 2000 && safeLink(href)) return { type: 'link', attrs: { href } };
    throw new RequestError('Liên kết hoặc định dạng chữ chưa hợp lệ.', 400);
  });
}

function cleanMedia(node: RichNode, result: RichNode) {
  const src = node.attrs?.src;
  if (typeof src !== 'string' || !mediaPath.test(src)) throw new RequestError('Vui lòng chọn ảnh hoặc video từ thư viện.', 400);
  const attrs: Record<string, unknown> = {
    src,
    alt: String(node.attrs?.alt ?? '').slice(0, 500),
    title: String(node.attrs?.title ?? '').slice(0, 500),
  };
  if (node.type === 'image') {
    const align = node.attrs?.align;
    if (align !== undefined && align !== null && align !== 'center') {
      if (!imageAlignments.includes(align as ImageAlignment)) throw new RequestError('Cách căn ảnh chưa hợp lệ.', 400);
      attrs.align = align;
    }
    const width = Number(node.attrs?.width);
    // Bề rộng 100 là mặc định nên bỏ đi, trừ ảnh căn trái: ở đó 100 là mức rộng nhất (tối đa 60 phần trăm cột) khác với mặc định.
    const keepFull = width === 100 && attrs.align === 'left';
    if (node.attrs?.width !== undefined && node.attrs?.width !== null && (width !== 100 || keepFull)) {
      if (!imageWidths.includes(width as ImageWidth)) throw new RequestError('Bề rộng ảnh chưa hợp lệ.', 400);
      attrs.width = width;
    }
  }
  result.attrs = attrs;
}

export function cleanDocument(input: unknown): RichNode {
  let count = 0;
  function clean(value: unknown, depth: number): RichNode {
    if (depth > 30 || ++count > 15000 || !value || typeof value !== 'object') throw new RequestError('Nội dung quá phức tạp hoặc chưa hợp lệ.', 400);
    const node = value as RichNode;
    if (!allowed.has(node.type)) throw new RequestError('Nội dung có định dạng không được hỗ trợ.', 400);
    const result: RichNode = { type: node.type };
    if (node.type === 'text') cleanText(node, result);
    if (node.type === 'heading') result.attrs = { level: [2, 3, 4].includes(Number(node.attrs?.level)) ? Number(node.attrs?.level) : 2 };
    if (node.type === 'orderedList') result.attrs = { start: Math.max(1, Math.min(10000, Number(node.attrs?.start) || 1)) };
    if (node.type === 'tableCell' || node.type === 'tableHeader') {
      result.attrs = {
        colspan: Math.max(1, Math.min(20, Number(node.attrs?.colspan) || 1)),
        rowspan: Math.max(1, Math.min(100, Number(node.attrs?.rowspan) || 1)),
      };
    }
    if (node.type === 'image' || node.type === 'video') cleanMedia(node, result);
    if (node.content) {
      if (!Array.isArray(node.content)) throw new RequestError('Nội dung chưa hợp lệ.', 400);
      result.content = node.content.map(child => clean(child, depth + 1));
    }
    return result;
  }
  const result = clean(input, 0);
  if (result.type !== 'doc') throw new RequestError('Nội dung cần bắt đầu bằng một bài viết.', 400);
  return result;
}

export function documentText(node: RichNode): string {
  return node.type === 'text'
    ? node.text ?? ''
    : (node.content ?? []).map(documentText).join(node.type === 'paragraph' || node.type === 'heading' ? '' : ' ').trim();
}

export function documentMedia(node: RichNode): string[] {
  const ids = new Set<string>();
  function visit(n: RichNode) {
    if (n.type === 'image' || n.type === 'video') {
      const match = String(n.attrs?.src).match(mediaPath);
      if (match) ids.add(match[1]);
    }
    n.content?.forEach(visit);
  }
  visit(node);
  return [...ids];
}

/** Đếm chữ tiếng Việt theo khoảng trắng, dùng chung cho số từ và thời gian đọc. */
export function documentWords(node: RichNode): number {
  return documentText(node).split(/\s+/).filter(Boolean).length;
}

/** Ảnh trong bài còn thiếu mô tả, dùng cho danh sách kiểm trước khi đăng. */
export function imagesMissingAlt(node: RichNode): number {
  let missing = 0;
  function visit(n: RichNode) {
    if (n.type === 'image' && !String(n.attrs?.alt ?? '').trim()) missing++;
    n.content?.forEach(visit);
  }
  visit(node);
  return missing;
}
