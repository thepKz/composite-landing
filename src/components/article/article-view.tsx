import Link from 'next/link';
import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { ArrowUpRight, Clock, Link2, MessageCircle } from 'lucide-react';
import RichContent from '@/components/rich-content';
import CoverOrient from '@/components/article/cover-orient';
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
  product?: { slug: string; name: string } | null;
  preview?: boolean;
  /** Đặt trước phần bài, ví dụ dữ liệu có cấu trúc cho công cụ tìm kiếm. */
  top?: ReactNode;
  /** Đặt sau phần kêu gọi báo giá: bài trước sau, bài liên quan, bộ tăng cường. */
  children?: ReactNode;
};

type AnchorProps = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; preview?: boolean; external?: boolean };

/** Liên kết nội bộ dùng Link, liên kết ngoài dùng thẻ a, bản xem trước thì không đi đâu cả. */
function Anchor({ preview, external, href, children, ...rest }: AnchorProps) {
  if (preview) return <a {...rest} href="#" onClick={event => event.preventDefault()}>{children}</a>;
  if (external) return <a {...rest} href={href} target="_blank" rel="noopener noreferrer">{children}</a>;
  return <Link {...rest} href={href}>{children}</Link>;
}

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

export default function ArticleView({ title, excerpt, kind, document, cover, coverAlt, publishedAt, updatedAt, url, product, preview, top, children }: ArticleViewProps) {
  const isProject = kind === 'project';
  const toc = buildToc(document);
  const minutes = readingMinutes(document);
  const wasUpdated = !!updatedAt && updatedAt.getTime() - publishedAt.getTime() > 24 * 3600 * 1000 && formatDateVi(updatedAt) !== formatDateVi(publishedAt);
  const listPath = isProject ? '/du-an' : '/tin-tuc';
  const listLabel = isProject ? 'Dự án' : 'Tin tức';
  const reveal = preview ? {} : { 'data-art-reveal': true };
  return <main id="main" className="public-page art">
    {top}
    <article>
      <div className="art-opener">
        <header className="art-head"><div className="container">
          <nav className="art-crumbs" aria-label="Đường dẫn">
            <Anchor preview={preview} href="/">Trang chủ</Anchor><span aria-hidden="true">/</span><Anchor preview={preview} href={listPath}>{listLabel}</Anchor>
          </nav>
          <div className="art-head-text">
            <Anchor preview={preview} href={isProject ? '/du-an' : '/tin-tuc?kind=article'} className={`art-kind${isProject ? ' is-project' : ''}`}>{kindLabel(kind)}</Anchor>
            <h1>{title}</h1>
            {excerpt && <p className="art-excerpt">{excerpt}</p>}
            <div className="art-meta">
              <time dateTime={publishedAt.toISOString()}>{formatDateVi(publishedAt)}</time>
              <span className="art-meta-read"><Clock size={16} aria-hidden="true" />{minutes} phút đọc</span>
              {wasUpdated && updatedAt && <span>Cập nhật {formatDateVi(updatedAt)}</span>}
            </div>
          </div>
        </div></header>

        {cover && <div className="container art-cover-wrap"><figure className="art-cover" {...reveal}>
          <button type="button" className="art-zoom" {...(preview ? {} : { 'data-zoom': true })} aria-label="Xem ảnh bìa lớn"><img src={cover} alt={coverAlt || title} decoding="async" {...(preview ? {} : { fetchPriority: 'high' as const })} /></button>
        </figure></div>}
      </div>
      {cover && <CoverOrient key={cover} />}

      <div className="art-layout container">
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
    </article>

    <section className="art-cta" aria-labelledby="art-cta-title"><div className="container"><div className="art-cta-card" {...reveal}>
      <div><h2 id="art-cta-title">Chọn bồn bể cho nhu cầu của bạn</h2><p>Gửi mục đích và quy cách dự kiến để được tư vấn dung tích.</p></div>
      <div className="art-cta-actions">
        <Anchor preview={preview} href="/lien-he#gui-yeu-cau" className="art-btn-quote pressable">Nhận báo giá<ArrowUpRight size={18} aria-hidden="true" /></Anchor>
        <Anchor preview={preview} href={product ? `/san-pham/${product.slug}` : '/san-pham'} className="art-btn-ghost pressable">{product ? product.name : 'Xem sản phẩm'}</Anchor>
      </div>
    </div></div></section>
    {children}
  </main>;
}
