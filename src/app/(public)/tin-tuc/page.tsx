import { isDemoMode } from '@/lib/demo-mode';
import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, ArrowUpRight, Newspaper } from 'lucide-react';
import { FlowSection, Pattern, ShapeFrame, Stack } from '@/components/decor';
import { db } from '@/lib/db';
import PostCard, { type CardPost } from '@/components/article/post-card';
import Reveal from '@/components/article/reveal';
import ListHero from '@/components/article/list-hero';
import QuoteBand from '@/components/article/quote-band';
import NewsToolbar from './news-toolbar';
import '@/components/article/list.css';
import './news.css';

type SearchValues = Record<string, string | string[] | undefined>;
type Props = { searchParams: Promise<SearchValues> };
type NewsItem = CardPost & { published_at: Date };
const pageSize = 9;
const workshopPhoto = { src: '/images/home/gioi-thieu-xuong-960.webp', set: '/images/home/gioi-thieu-xuong-640.webp 640w, /images/home/gioi-thieu-xuong-960.webp 960w', small: '/images/home/giao-hang-boc-xep-480.webp', smallSet: '/images/home/giao-hang-boc-xep-480.webp 480w' };
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
  const blank = !filtered && allTotal === 0;

  return <main id="main" className="public-page nl">
    <ListHero id="nl-title" titleWidth="15.5em" crumb="Tin tức" title="Kiến thức về bồn bể composite, kể từ xưởng đến công trình" lead="Mỗi bài giải thích một vấn đề kỹ thuật hoặc ghi lại một công trình." />

    <FlowSection tone="light" top="wave" className="nl-body" decor={<Pattern kind="paper" opacity={0.9} fade="both" />}>
      {!blank && <NewsToolbar q={q} kind={kind} suggestions={suggestions} kinds={kinds.map(item => ({ ...item, count: item.value ? byKind[item.value] : allTotal }))} />}

      {blank && <div className="nl-void" aria-labelledby="nl-void-title" role="group">
        <Stack className="nl-void-stack" pattern={{ kind: 'ripple', opacity: 0.7 }} floatAt="br"
          float={<ShapeFrame shape="circle" outline="green" outlineOffset={8} focus="50% 50%"><img src={workshopPhoto.small} srcSet={workshopPhoto.smallSet} sizes="200px" alt="" loading="lazy" decoding="async" /></ShapeFrame>}>
          <ShapeFrame shape="arch" ratio={0.92} outline="bronze" focus="50% 55%" parallax>
            <img src={workshopPhoto.src} srcSet={workshopPhoto.set} sizes="(max-width:900px) 80vw, 460px" alt="Xưởng sản xuất bể composite của Thành Lợi" loading="lazy" decoding="async" />
          </ShapeFrame>
        </Stack>
        <div className="nl-void-text" data-art-reveal>
          <h2 id="nl-void-title">Kiến thức và công trình sẽ được đăng tại đây</h2>
          <p>Trong lúc chờ, phần Hỏi đáp đã có sẵn lời giải đáp về độ bền, loại nhựa, cách lắp đặt và cách sửa chữa bể composite.</p>
          <div className="nl-void-actions">
            <Link href="/lien-he#gui-yeu-cau" className="lh-btn-quote pressable">Nhận báo giá<ArrowUpRight size={18} aria-hidden="true" /></Link>
            <Link href="/hoi-dap" className="lh-btn-ghost pressable">Hỏi đáp</Link>
            <Link href="/san-pham" className="lh-link pressable">Sản phẩm<ArrowRight size={18} aria-hidden="true" /></Link>
          </div>
        </div>
      </div>}

      {!blank && <div className="nl-results">
        {total > 0 && (q || pageCount > 1) && <p className="nl-count">{total} bài viết{q ? <> cho “<strong>{q}</strong>”</> : null}{pageCount > 1 ? `, trang ${page} trên ${pageCount}` : ''}</p>}

        {featured && <PostCard post={featured} featured titleTag="h2" />}
        {rest.length > 0 && <div className="nl-grid">{rest.map((post, index) => <PostCard key={post.id} post={post} index={index} titleTag="h2" />)}</div>}

        {rows.length === 0 && filtered && <div className="nl-empty" data-art-reveal>
          <span className="nl-empty-icon" aria-hidden="true"><Newspaper size={32} strokeWidth={1.5} /></span>
          <h2>{q ? <>Không tìm thấy bài viết cho “{q}”</> : 'Chưa có bài viết thuộc loại này'}</h2>
          <p>Từ khóa ngắn hơn hoặc một trong các gợi ý dưới đây sẽ cho kết quả rộng hơn.</p>
          <div className="nl-suggest is-center">{suggestions.map(item => <Link key={item.q} href={newsUrl(item.q, '')} className="nl-tag pressable">{item.label}</Link>)}</div>
          <div className="nl-empty-actions"><Link href="/tin-tuc" className="nl-btn pressable">Bỏ lọc</Link></div>
        </div>}

        {pageCount > 1 && <nav className="nl-pagination" aria-label="Phân trang tin tức">
          {page > 1 ? <Link href={newsUrl(q, kind, page - 1)} rel="prev" className="nl-page pressable"><ArrowLeft size={18} aria-hidden="true" />Trang trước</Link> : <span />}
          <div className="nl-page-numbers">{pageNumbers.map((number, index) => <span key={number} className="nl-page-item">{index > 0 && number - pageNumbers[index - 1] > 1 && <span className="nl-gap" aria-hidden="true">…</span>}{number === page ? <span className="nl-page is-current" aria-current="page" aria-label={`Trang ${number}, trang hiện tại`}>{number}</span> : <Link href={newsUrl(q, kind, number)} className="nl-page pressable" aria-label={`Trang ${number}`}>{number}</Link>}</span>)}</div>
          {page < pageCount ? <Link href={newsUrl(q, kind, page + 1)} rel="next" className="nl-page pressable">Trang sau<ArrowRight size={18} aria-hidden="true" /></Link> : <span />}
        </nav>}
      </div>}
    </FlowSection>

    {rows.length > 0 && <QuoteBand id="nl-cta-title" />}
    <Reveal />
  </main>;
}
