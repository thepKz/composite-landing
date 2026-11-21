'use client';
import { useEffect, useState } from 'react';
import ArticlePreview, { type PreviewData } from './article-preview';

export type { PreviewData };
export { ArticlePreview as PreviewArticle };

/** Trang xem trước đứng riêng (mở ở tab mới). Nhận nội dung từ trình soạn bằng postMessage. */
export default function PreviewFrame() {
  const [data, setData] = useState<PreviewData | null>(null);
  useEffect(() => {
    function receive(event: MessageEvent) {
      if (event.origin !== window.location.origin || event.data?.type !== 'preview-data') return;
      setData(event.data.payload as PreviewData);
    }
    window.addEventListener('message', receive);
    if (window.opener) window.opener.postMessage({ type: 'preview-ready' }, window.location.origin);
    return () => window.removeEventListener('message', receive);
  }, []);

  if (!data) return <div className="public-site" style={{ padding: 32 }} role="status">Đang mở bản xem trước. Nếu không thấy gì, hãy quay lại trang soạn bài rồi bấm Xem trước lần nữa.</div>;
  return <div className="public-site"><ArticlePreview data={data} /></div>;
}
