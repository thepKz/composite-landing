import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/auth';
import PreviewFrame from '@/components/admin/preview-frame';
// Cùng bảng kiểu với trang bài viết công khai để xem trước đúng như khách sẽ thấy.
import '../../(public)/public.css';
import '../../(public)/surface-refinement.css';
import '../../(public)/chrome.css';
import '@/components/article/cards.css';
import '@/components/post-detail.css';

export const metadata = { title: 'Xem trước bài viết', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

/** Trang xem trước có kiểm phiên đăng nhập. Nội dung đang soạn được trình soạn gửi sang bằng postMessage, không lưu ở máy chủ. */
export default async function PreviewPage() {
  if (!await currentUser()) redirect('/admin/login');
  return <PreviewFrame />;
}
