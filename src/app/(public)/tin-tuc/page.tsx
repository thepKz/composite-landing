import { isDemoMode } from '@/lib/demo-mode';
import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, ArrowUpRight, Newspaper, Search } from 'lucide-react';
import { db } from '@/lib/db';
import PostCard, { type CardPost } from '@/components/article/post-card';
import Reveal from '@/components/article/reveal';
import './news.css';

type SearchValues = Record<string, string | string[] | undefined>;
type Props = { searchParams: Promise<SearchValues> };
type NewsItem = CardPost & { published_at: Date };
const pageSize = 9;
const suggestions = [{ label: 'Biogas', q: 'biogas' }, { label: 'Bể phốt', q: 'bể phốt' }, { label: 'Bể cá', q: 'bể cá' }];
const kinds = [{ value: '', label: 'Tất cả' }, { value: 'article', label: 'Kiến thức sản phẩm' }, { value: 'project', label: 'Công trình thực tế' }];

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
  const search = "p.status='published' AND p.published_at<=now() AND ($1='' OR p.title ILIKE $2 OR p.excerpt ILIKE $2)";
  const where = `${search} AND ($3='' OR p.kind=$3)`;
  const [counts] = await Promise.all([
    isDemoMode() ? Promise.resolve({ rows: [] as { kind: string; total: number }[] }) : db.query<{ kind: string; total: number }>(`SELECT p.kind,count(*)::integer AS total FROM posts p WHERE ${search} GROUP BY p.kind`, [q, pattern]),
  ]);
  const byKind: Record<string, number> = { article: 0, project: 0 };
  for (const row of counts.rows) byKind[row.kind] = row.total;
  const allTotal = byKind.article + byKind.project;
  const total = kind ? byKind[kind] : allTotal;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  if (page > pageCount) notFound();
  const result = isDemoMode() ? { rows: [] as NewsItem[] } : await db.query<NewsItem>(`SELECT p.id,p.title,p.slug,p.excerpt,p.kind,p.cover_id,p.published_at FROM posts p WHERE ${where} ORDER BY p.published_at DESC,p.id DESC LIMIT $4 OFFSET $5`, [q, pattern, kind, pageSize, (page - 1) * pageSize]);
  const rows = result.rows;
  const featured = page === 1 && rows.length > 0 ? rows[0] : null;
  const rest = featured ? rows.slice(1) : rows;
  const pageNumbers = Array.from(new Set([1, pageCount, page - 1, page, page + 1].filter(value => value >= 1 && value <= pageCount))).sort((a, b) => a - b);
  const filtered = Boolean(q || kind);

  return <main id="main" className="public-page nl">
    <section className="nl-hero"><div className="container">
      <nav className="nl-crumbs" aria-label="Đường dẫn"><Link href="/">Trang chủ</Link><span aria-hidden="true">/</span><span aria-current="page">Tin tức</span></nav>
      <h1>Tin tức và kiến thức</h1>
      <p>Hướng dẫn chọn bồn bể và những công trình Thành Lợi chia sẻ.</p>
    </div></section>

    <section className="container nl-toolbar" aria-label="Tìm và lọc bài viết">
      <nav className="nl-chips" aria-label="Loại nội dung">
        {kinds.map(item => {
          const count = item.value ? byKind[item.value] : allTotal;
          const active = kind === item.value;
          return <Link key={item.value || 'all'} href={newsUrl(q, item.value)} className={`nl-chip pressable${active ? ' is-active' : ''}`} aria-current={active ? 'true' : undefined}>{item.label}<span className="nl-chip-count">{count}</span></Link>;
        })}
      </nav>
      <form action="/tin-tuc" method="get" className="nl-search" role="search">
        <label htmlFor="nl-q" className="nl-sr">Tìm bài viết</label>
        <Search size={20} aria-hidden="true" className="nl-search-icon" />
        <input id="nl-q" type="search" name="q" defaultValue={q} maxLength={200} placeholder="Tìm bài viết" autoComplete="off" />
        {kind && <input type="hidden" name="kind" value={kind} />}
        <button type="submit" className="nl-btn pressable">Tìm</button>
      </form>
      <div className="nl-suggest"><span>Gợi ý tìm</span>{suggestions.map(item => <Link key={item.q} href={newsUrl(item.q, kind)} className={`nl-tag pressable${q === item.q ? ' is-active' : ''}`}>{item.label}</Link>)}</div>
    </section>

    <section className="container nl-results">
      {total > 0 && <p className="nl-count">{total} bài viết{q ? <> cho “<strong>{q}</strong>”</> : null}{pageCount > 1 ? `, trang ${page} trên ${pageCount}` : ''}</p>}

      {featured && <PostCard post={featured} featured titleTag="h2" />}
      {rest.length > 0 && <div className="nl-grid">{rest.map((post, index) => <PostCard key={post.id} post={post} index={index} titleTag="h2" />)}</div>}

      {rows.length === 0 && <div className="nl-empty" data-art-reveal>
        <span className="nl-empty-icon" aria-hidden="true"><Newspaper size={32} strokeWidth={1.5} /></span>
        {filtered ? <>
          <h2>{q ? <>Không tìm thấy bài viết cho “{q}”</> : 'Chưa có bài viết thuộc loại này'}</h2>
          <p>Hãy thử từ khóa ngắn hơn hoặc chọn một gợi ý.</p>
          <div className="nl-suggest is-center">{suggestions.map(item => <Link key={item.q} href={newsUrl(item.q, '')} className="nl-tag pressable">{item.label}</Link>)}</div>
          <div className="nl-empty-actions"><Link href="/tin-tuc" className="nl-btn pressable">Xem tất cả bài viết</Link></div>
        </> : <>
          <h2>Chưa có bài viết nào</h2>
          <p>Thành Lợi đang chuẩn bị nội dung. Trong lúc chờ, bạn có thể xem sản phẩm hoặc gửi nhu cầu để được tư vấn.</p>
          <div className="nl-empty-actions"><Link href="/lien-he#gui-yeu-cau" className="nl-btn-quote pressable">Nhận báo giá<ArrowUpRight size={18} aria-hidden="true" /></Link><Link href="/san-pham" className="nl-btn-ghost pressable">Xem sản phẩm</Link></div>
        </>}
      </div>}

      {pageCount > 1 && <nav className="nl-pagination" aria-label="Phân trang tin tức">
        {page > 1 ? <Link href={newsUrl(q, kind, page - 1)} rel="prev" className="nl-page pressable"><ArrowLeft size={18} aria-hidden="true" />Trang trước</Link> : <span />}
        <div className="nl-page-numbers">{pageNumbers.map((number, index) => <span key={number} className="nl-page-item">{index > 0 && number - pageNumbers[index - 1] > 1 && <span className="nl-gap" aria-hidden="true">…</span>}{number === page ? <span className="nl-page is-current" aria-current="page" aria-label={`Trang ${number}, trang hiện tại`}>{number}</span> : <Link href={newsUrl(q, kind, number)} className="nl-page pressable" aria-label={`Trang ${number}`}>{number}</Link>}</span>)}</div>
        {page < pageCount ? <Link href={newsUrl(q, kind, page + 1)} rel="next" className="nl-page pressable">Trang sau<ArrowRight size={18} aria-hidden="true" /></Link> : <span />}
      </nav>}
    </section>

    {rows.length > 0 && <section className="container nl-cta" aria-labelledby="nl-cta-title"><div className="nl-cta-card" data-art-reveal>
      <div><h2 id="nl-cta-title">Cần chọn bồn bể cho công trình</h2><p>Gửi mục đích sử dụng và quy cách dự kiến để được tư vấn.</p></div>
      <Link href="/lien-he#gui-yeu-cau" className="nl-btn-quote pressable">Nhận báo giá<ArrowUpRight size={18} aria-hidden="true" /></Link>
    </div></section>}
    <Reveal />
  </main>;
}
