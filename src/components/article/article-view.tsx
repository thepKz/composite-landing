import type { CSSProperties, ReactNode } from 'react';
import { Clock, Link2, MessageCircle } from 'lucide-react';
import RichContent from '@/components/rich-content';
import { Anchor } from '@/components/article/anchor';
import QuoteBand from '@/components/article/quote-band';
import { FlowSection, Morph, Pattern, ShapeFrame, Stack, morphName } from '@/components/decor';
import { buildToc, formatDateVi, kindLabel, readingMinutes, type TocItem } from '@/components/article/article-utils';
import type { RichNode } from '@/lib/rich-text';

/*
 * Phần trình bày thuần của một bài viết: đầu bài, ảnh bìa, lưới đọc có mục lục và chia sẻ, kêu gọi báo giá.
 * Trang công khai (post-detail.tsx) và khung xem trước của admin (admin/article-preview.tsx) cùng dùng thành phần này
 * nên khung hai bên luôn khớp. Thành phần không tự truy vấn: mọi thứ vào qua props.
 * Ở chế độ preview mọi liên kết thành liên kết chết và các móc của bộ tăng cường (phóng ảnh, hiện dần) được bỏ.
 */

export type ArticleViewProps = {
  title: string;
  excerpt?: string | null;
  kind: 'article' | 'project';
  document: RichNode;
  cover: string | null;
  coverAlt?: string | null;
  publishedAt: Date;
  updatedAt?: Date | null;
  url: string;
  /** Mã bài: đặt tên morph chung với thẻ ở danh sách (ảnh bìa và tiêu đề). Bỏ trống ở bản xem trước. */
  slug?: string;
  product?: { slug: string; name: string } | null;
  preview?: boolean;
  /** Đặt trước phần bài, ví dụ dữ liệu có cấu trúc cho công cụ tìm kiếm. */
  top?: ReactNode;
  /** Đặt sau phần kêu gọi báo giá: bài trước sau, bài liên quan, bộ tăng cường. */
  children?: ReactNode;
};

function TocList({ toc, preview }: { toc: TocItem[]; preview?: boolean }) {
  return <ol className="art-toc-list">{toc.map(item => <li key={item.id} className={item.level === 3 ? 'is-sub' : undefined}><a href={`#${item.id}`} {...(preview ? {} : { 'data-toc-link': true })}>{item.text}</a></li>)}</ol>;
}

function Share({ url, title, className, preview }: { url: string; title: string; className: string; preview?: boolean }) {
  const encoded = encodeURIComponent(url);
  return <div className={className} role="group" aria-label="Chia sẻ bài viết">
    <button type="button" className="art-share-btn pressable" {...(preview ? {} : { 'data-copy-link': true })} aria-label="Sao chép liên kết"><Link2 size={20} aria-hidden="true" /><span>Sao chép</span></button>
    <Anchor preview={preview} external className="art-share-btn pressable" href={`https://www.facebook.com/sharer/sharer.php?u=${encoded}`} aria-label={`Chia sẻ lên Facebook: ${title}`}><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M14 8h3V4h-3a4 4 0 0 0-4 4v2H7v4h3v8h4v-8h3l1-4h-4V8z" /></svg><span>Facebook</span></Anchor>
    <Anchor preview={preview} external className="art-share-btn pressable" href={`https://sp.zalo.me/plugins/share?url=${encoded}`} aria-label={`Chia sẻ lên Zalo: ${title}`}><MessageCircle size={20} aria-hidden="true" /><span>Zalo</span></Anchor>
  </div>;
}

export default function ArticleView({ title, excerpt, kind, document, cover, coverAlt, publishedAt, updatedAt, url, slug, product, preview, top, children }: ArticleViewProps) {
  const isProject = kind === 'project';
  const toc = buildToc(document);
  const minutes = readingMinutes(document);
  const wasUpdated = !!updatedAt && updatedAt.getTime() - publishedAt.getTime() > 24 * 3600 * 1000 && formatDateVi(updatedAt) !== formatDateVi(publishedAt);
  const listPath = isProject ? '/du-an' : '/tin-tuc';
  const listLabel = isProject ? 'Dự án' : 'Tin tức';
  const morph = !preview && slug;
  const heading = <h1 id="art-title">{title}</h1>;
  return <main id="main" className="public-page art">
    {top}

    {/* Đầu bài: nền sóng nhựa tối, ảnh bìa trong vòm có viền đồng lệch, tiêu đề và ảnh bìa cùng tên morph với thẻ ở danh sách */}
    <FlowSection tone="dark" top="none" className="art-hero" aria-labelledby="art-title" style={{ '--fs-pad': 'clamp(28px,3.5vw,48px)' } as CSSProperties}
      decor={<>
        <Pattern kind="resin" opacity={0.6} fade="bottom" />
        {cover ? <Pattern kind="ripple" size="clamp(240px,32vw,480px)" top="-20%" right="-8%" opacity={0.42} blend="screen" /> : <Pattern kind="drum" size="clamp(220px,30vw,420px)" top="-10%" right="-4%" opacity={0.22} />}
      </>}>
      <nav className="art-crumbs" aria-label="Đường dẫn">
        <Anchor preview={preview} href="/">Trang chủ</Anchor><span aria-hidden="true">/</span><Anchor preview={preview} href={listPath}>{listLabel}</Anchor>
      </nav>
      <div className={`art-hero-grid${cover ? ' has-cover' : ''}`}>
        <div className="art-head-text">
          <Anchor preview={preview} href={isProject ? '/du-an' : '/tin-tuc?kind=article'} className={`art-kind${isProject ? ' is-project' : ''}`}>{kindLabel(kind)}</Anchor>
          {morph ? <Morph name={morphName('post-title', slug)}>{heading}</Morph> : heading}
          {excerpt && <p className="art-excerpt">{excerpt}</p>}
          <div className="art-meta">
            <time dateTime={publishedAt.toISOString()}>{formatDateVi(publishedAt)}</time>
            <span className="art-meta-read"><Clock size={16} aria-hidden="true" />{minutes} phút đọc</span>
            {wasUpdated && updatedAt && <span>Cập nhật {formatDateVi(updatedAt)}</span>}
          </div>
        </div>
        {cover && <figure className="art-cover">
          <Stack depth={false} className="art-cover-stack">
            <ShapeFrame shape="arch" ratio={0.95} outline="bronze" outlineOffset={14} focus="50% 45%" parallax={preview ? undefined : 0.06} morph={morph ? morphName('post-cover', slug) : undefined}>
              <button type="button" className="art-zoom" {...(preview ? {} : { 'data-zoom': true })} aria-label="Xem ảnh bìa lớn"><img src={cover} alt={coverAlt || title} decoding="async" {...(preview ? {} : { fetchPriority: 'high' as const })} /></button>
            </ShapeFrame>
          </Stack>
        </figure>}
      </div>
    </FlowSection>

    {/* Thân bài: cột đọc ở giữa, chia sẻ bên trái, mục lục bên phải. Hai lề bằng nhau ở mọi bề rộng */}
    <FlowSection tone="light" top="wave" className="art-body" aria-label="Nội dung bài viết" decor={<Pattern kind="paper" opacity={0.9} fade="both" />}>
      <div className="art-layout">
        <aside className="art-rail" aria-label="Chia sẻ"><Share url={url} title={title} className="art-share is-rail" preview={preview} /></aside>
        <div className="art-main" {...(preview ? {} : { 'data-art-body': true })}>
          {toc.length >= 3 && <details className="art-toc-mobile"><summary>Mục lục<span className="art-toc-count">{toc.length} mục</span></summary><TocList toc={toc} preview={preview} /></details>}
          <RichContent document={document} article />
          <footer className="art-foot">
            <Share url={url} title={title} className="art-share is-row" preview={preview} />
          </footer>
        </div>
        {toc.length >= 3 && <aside className="art-toc" aria-label="Mục lục"><TocList toc={toc} preview={preview} /></aside>}
      </div>
    </FlowSection>

    <QuoteBand preview={preview} product={product} id="art-cta-title" />
    {children}
  </main>;
}
