import ArticleView from '@/components/article/article-view';
import { cleanDocument, type RichNode } from '@/lib/rich-text';

export type PreviewData = { title: string; excerpt: string; kind: 'article' | 'project'; cover_id: string | null; content: RichNode; date: string };

/*
 * Bản xem trước của trang bài viết công khai. Dùng chung ArticleView với src/components/post-detail.tsx
 * nên khung (đầu bài, ảnh bìa, lưới đọc, mục lục, chia sẻ, kêu gọi báo giá) luôn khớp, không phải sửa hai nơi.
 * Không có: thanh đầu trang website, bài liên quan, bài trước và sau, dữ liệu có cấu trúc. Mọi liên kết là liên kết chết.
 */

/** Trang công khai đọc nội dung đã qua cleanDocument (bỏ thuộc tính mặc định), bản xem trước làm y hệt để hai bên khớp. */
function publicContent(content: RichNode): RichNode {
  try { return cleanDocument(content); } catch { return content; }
}

export default function ArticlePreview({ data }: { data: PreviewData }) {
  return <ArticleView
    preview
    title={data.title || 'Tiêu đề bài viết'} excerpt={data.excerpt} kind={data.kind} document={publicContent(data.content)}
    cover={data.cover_id ? `/api/media/${data.cover_id}` : null} publishedAt={new Date()} url="" />;
}
