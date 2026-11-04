import { isDemoMode } from '@/lib/demo-mode';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { db } from '@/lib/db';
import '../secondary-pages.css';

export const metadata = { title: 'Dự án Thành Lợi Composite', description: 'Các dự án và câu chuyện ứng dụng composite được Thành Lợi công bố.', alternates: { canonical: '/du-an' } };

export default async function ProjectsPage() {
  const { rows } = isDemoMode() ? { rows: [] } : await db.query<{ id: string; slug: string; title: string; excerpt: string; cover_id: string | null }>("SELECT id,slug,title,excerpt,cover_id FROM posts WHERE kind='project' AND status='published' AND published_at <= now() ORDER BY published_at DESC");
  return <main id="main" className="public-page secondary-page projects-page">
    <section className="page-intro"><div className="container"><nav className="breadcrumb" aria-label="Đường dẫn"><Link href="/">Trang chủ</Link><span aria-hidden="true">/</span><span aria-current="page">Dự án</span></nav><h1>Dự án và công trình</h1><p>Thông tin về sản phẩm, quá trình lắp đặt và bàn giao tại các công trình.</p></div></section>
    <section className="section container">{rows.length ? <div className="project-list">{rows.map(project => <article className="news-card" key={project.id}>{project.cover_id && <img src={`/api/media/${project.cover_id}`} alt="" loading="lazy"/>}<h2><Link href={`/du-an/${project.slug}`}>{project.title}</Link></h2><p>{project.excerpt}</p><Link className="text-link dark" href={`/du-an/${project.slug}`}>Xem dự án <ArrowUpRight size={18}/></Link></article>)}</div> : <div className="project-empty"><figure><img src="/images/products-2026/blue-open-tanks-yard.webp" alt="Các bể composite xanh nhiều hình dạng trong sân xưởng" width="1276" height="956"/></figure><div><h2>Hồ sơ dự án đang được cập nhật</h2><p>Bạn đang chuẩn bị một công trình? Gửi mục đích sử dụng, mặt bằng và quy cách dự kiến để trao đổi phương án.</p><Link href="/lien-he#gui-yeu-cau" className="button">Trao đổi dự án của bạn <ArrowUpRight size={18}/></Link></div></div>}</section>
  </main>;
}

