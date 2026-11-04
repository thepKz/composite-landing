import Link from 'next/link';
import { postPath } from '@/lib/post-path';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArrowRight, Search } from 'lucide-react';
import { db } from '@/lib/db';
import { products } from '@/lib/content';
import '../secondary-pages.css';

type SearchValues = Record<string, string | string[] | undefined>;
type Props = { searchParams: Promise<SearchValues> };
type NewsItem = { id: string; title: string; slug: string; excerpt: string; kind: 'article' | 'project'; cover_id: string | null; published_at: Date };
const pageSize = 9;

function filters(values: SearchValues) {
  const q = typeof values.q === 'string' ? values.q.trim().slice(0, 200) : '';
  const kind = values.kind === 'article' || values.kind === 'project' ? values.kind : '';
  const number = typeof values.page === 'string' && /^\d+$/.test(values.page) ? Number(values.page) : 1;
  return { q, kind, page: Number.isSafeInteger(number) && number > 0 ? number : 1 };
}

function newsUrl(q: string, kind: string, page = 1) {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (kind) params.set('kind', kind);
  if (page > 1) params.set('page', String(page));
  return `/tin-tuc${params.size ? `?${params}` : ''}`;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q, kind, page } = filters(await searchParams);
  return {
    title: `${kind === 'project' ? 'Công trình thực tế' : kind === 'article' ? 'Kiến thức sản phẩm' : 'Tin tức'}${page > 1 ? ` – Trang ${page}` : ''}`,
    description: 'Thông tin sản phẩm, hướng dẫn lựa chọn bồn bể composite và câu chuyện công trình do Thành Lợi chia sẻ.',
    alternates: { canonical: newsUrl('', kind, page) },
    ...(q ? { robots: { index: false, follow: true } } : {}),
  };
}

export default async function News({ searchParams }: Props) {
  const { q, kind, page } = filters(await searchParams);
  const pattern = `%${q.replace(/[\\%_]/g, '\\$&')}%`;
  const where = "p.status='published' AND p.published_at<=now() AND ($1='' OR p.title ILIKE $2 OR p.excerpt ILIKE $2) AND ($3='' OR p.kind=$3)";
  const count = await db.query(`SELECT count(*)::integer AS total FROM posts p WHERE ${where}`, [q, pattern, kind]);
  const total: number = count.rows[0].total;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  if (page > pageCount) notFound();
  const [result, items] = await Promise.all([
    db.query<NewsItem>(`SELECT p.id,p.title,p.slug,p.excerpt,p.kind,p.cover_id,p.published_at FROM posts p WHERE ${where} ORDER BY p.published_at DESC,p.id DESC LIMIT $4 OFFSET $5`, [q, pattern, kind, pageSize, (page - 1) * pageSize]),
    products(),
  ]);
  const pageNumbers = Array.from(new Set([1, pageCount, page - 1, page, page + 1].filter(value => value >= 1 && value <= pageCount))).sort((a, b) => a - b);

  return <main id="main" className="public-page secondary-page news-page">
    <section className="page-intro"><div className="container">
      <nav className="breadcrumb" aria-label="Đường dẫn"><Link href="/">Trang chủ</Link><span aria-hidden="true">/</span><span aria-current="page">Tin tức</span></nav>
      <h1>Hiểu sản phẩm. Chọn phù hợp.</h1>
      <p>Kiến thức composite và những công trình Thành Lợi chia sẻ.</p>
    </div></section>
    <section className="section container news-layout">
      <div>
        <form action="/tin-tuc" method="get" className="news-filters" role="search">
          <label>Tìm bài viết<input type="search" name="q" defaultValue={q} maxLength={200} placeholder="Tên sản phẩm hoặc điều bạn muốn tìm…"/></label>
          <label>Loại nội dung<select name="kind" defaultValue={kind}><option value="">Tất cả nội dung</option><option value="article">Kiến thức sản phẩm</option><option value="project">Công trình thực tế</option></select></label>
          <button className="button" type="submit"><Search size={18} aria-hidden="true"/>Tìm kiếm</button>
        </form>
        <p className="news-result-count">{total > 0 ? `${total} bài viết${q ? ` cho “${q}”` : ''} · Trang ${page}/${pageCount}` : q || kind ? 'Không có bài viết phù hợp với lựa chọn này.' : 'Nội dung đang được chuẩn bị.'}</p>
        {result.rows.length > 0 ? <div className="news-list">{result.rows.map(post => <article className="news-card" key={post.id}>
          {post.cover_id && <Link href={postPath(post)} tabIndex={-1} aria-hidden="true"><img src={`/api/media/${post.cover_id}`} alt="" loading="lazy"/></Link>}
          <div><div className="article-meta"><span>{post.kind === 'project' ? 'Công trình thực tế' : 'Kiến thức sản phẩm'}</span><time dateTime={new Date(post.published_at).toISOString()}>{new Date(post.published_at).toLocaleDateString('vi-VN',{timeZone:'Asia/Ho_Chi_Minh'})}</time></div>
          <h2><Link href={postPath(post)}>{post.title}</Link></h2>{post.excerpt && <p>{post.excerpt}</p>}<Link className="text-link dark" href={postPath(post)} aria-label={`Đọc bài: ${post.title}`}>Đọc bài viết <ArrowRight size={18} aria-hidden="true"/></Link></div>
        </article>)}</div> : <div className="empty-state"><h2>{q || kind ? 'Thử từ khóa hoặc nhóm nội dung khác.' : 'Bài viết mới sẽ xuất hiện tại đây.'}</h2><p>{q || kind ? 'Anh/chị có thể bỏ bộ lọc để xem toàn bộ bài viết đã xuất bản.' : 'Trong lúc chờ nội dung mới, hãy xem các dòng sản phẩm hoặc gửi nhu cầu để được tư vấn.'}</p><Link className="button button-outline" href={q || kind ? '/tin-tuc' : '/san-pham'}>{q || kind ? 'Xem tất cả bài viết' : 'Khám phá sản phẩm'}</Link></div>}
        {pageCount > 1 && <nav className="pagination" aria-label="Phân trang tin tức">
          {page > 1 && <Link href={newsUrl(q, kind, page - 1)} rel="prev">Trang trước</Link>}
          {pageNumbers.map((number, index) => <span key={number}>{index > 0 && number - pageNumbers[index - 1] > 1 && <span aria-hidden="true">…</span>}{number === page ? <span aria-current="page" aria-label={`Trang ${number}, trang hiện tại`}>{number}</span> : <Link href={newsUrl(q, kind, number)} aria-label={`Trang ${number}`}>{number}</Link>}</span>)}
          {page < pageCount && <Link href={newsUrl(q, kind, page + 1)} rel="next">Trang sau</Link>}
        </nav>}
      </div>
      <aside className="news-sidebar" aria-label="Khám phá thêm">
        <section><h2>Cần chọn bồn bể?</h2><p>Trao đổi mục đích sử dụng để chọn quy cách phù hợp.</p><Link href="/lien-he" className="button">Nhận tư vấn</Link></section>
        <details className="secondary-disclosure"><summary>Xem theo dòng sản phẩm</summary><nav aria-label="Sản phẩm">{items.map(product => <Link key={product.slug} href={`/san-pham/${product.slug}`}>{product.name}</Link>)}</nav></details>
      </aside>
    </section>
  </main>;
}
