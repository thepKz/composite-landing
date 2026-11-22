import Link from 'next/link';
import type { CSSProperties } from 'react';
import { ArrowRight, Building2, Newspaper } from 'lucide-react';
import { Morph, ShapeFrame, morphName, type FrameShape } from '@/components/decor';
import { postPath } from '@/lib/post-path';
import { formatDateVi, kindLabel } from './article-utils';
import './cards.css';

export type CardPost = { id: string; title: string; slug: string; excerpt?: string | null; kind: string; cover_id: string | null; published_at?: Date | string | null };

/** Khung ảnh có chủ đích: nền xanh đậm có biểu tượng làm chỗ giữ cho tới khi ảnh tải xong (ảnh hiện dần), bài không bìa dùng chính khung này.
 *  Ảnh phủ kín khung theo tỉ lệ, cắt giữa. Không đệm mờ hai bên. `fill` để lấp đầy khung ShapeFrame bên ngoài thay vì tự giữ tỉ lệ 16:10. */
export function PostMedia({ post, sizes, fill = false }: { post: CardPost; sizes?: string; fill?: boolean }) {
  const Icon = post.kind === 'project' ? Building2 : Newspaper;
  const cls = `pc-media${fill ? ' is-fill' : ''}`;
  if (!post.cover_id) return <div className={`${cls} pc-media-empty`} aria-hidden="true"><Icon size={44} strokeWidth={1.5} /></div>;
  const src = `/api/media/${post.cover_id}`;
  return <div className={cls} aria-hidden="true">
    <span className="pc-media-ph"><Icon size={44} strokeWidth={1.5} /></span>
    <img data-fade src={src} alt="" loading="lazy" decoding="async" sizes={sizes} />
  </div>;
}

type Look = { shape: FrameShape; ratio: number; outline: 'bronze' | 'green' | 'navy'; dir: 'br' | 'bl' };
/** Bốn dáng xen kẽ theo thứ tự thẻ: thùng xe vát trái, vòm bể, thùng xe vát phải, bồn nằm. Bài nổi bật luôn là vòm lớn. */
const CYCLE: Look[] = [
  { shape: 'slant', ratio: 1.4, outline: 'bronze', dir: 'br' },
  { shape: 'arch', ratio: 1, outline: 'green', dir: 'bl' },
  { shape: 'slant-reverse', ratio: 1.4, outline: 'navy', dir: 'bl' },
  { shape: 'capsule', ratio: 1.8, outline: 'bronze', dir: 'br' },
];
const FEATURED: Look = { shape: 'arch', ratio: 1.05, outline: 'bronze', dir: 'br' };

export default function PostCard({ post, featured = false, index = 0, titleTag = 'h3' }: { post: CardPost; featured?: boolean; index?: number; titleTag?: 'h2' | 'h3' }) {
  const Title = titleTag;
  const href = postPath(post);
  const look = featured ? FEATURED : CYCLE[index % CYCLE.length];
  return <article className={`pc-card${featured ? ' is-featured' : ''}`} data-shape={look.shape} data-art-reveal style={{ '--i': index } as CSSProperties}>
    <div className="pc-frame" data-dir={look.dir}>
      <ShapeFrame shape={look.shape} ratio={look.ratio} outline={look.outline} outlineOffset={featured ? 16 : 12} outlineDirection={look.dir} focus="50% 50%" morph={morphName('post-cover', post.slug)}>
        <PostMedia post={post} fill />
      </ShapeFrame>
    </div>
    <div className="pc-body">
      <div className="pc-meta"><span className={`pc-kind kind-${post.kind}`}>{kindLabel(post.kind)}</span>{post.published_at && <time dateTime={new Date(post.published_at).toISOString()}>{formatDateVi(post.published_at)}</time>}</div>
      <Morph name={morphName('post-title', post.slug)}>
        <Title className="pc-title"><Link href={href}>{post.title}</Link></Title>
      </Morph>
      {post.excerpt ? <p className="pc-excerpt">{post.excerpt}</p> : null}
      <span className="pc-more" aria-hidden="true"><ArrowRight size={20} /></span>
    </div>
  </article>;
}
