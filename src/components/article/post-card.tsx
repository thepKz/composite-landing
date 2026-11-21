import Link from 'next/link';
import type { CSSProperties } from 'react';
import { ArrowRight, Building2, Newspaper } from 'lucide-react';
import { postPath } from '@/lib/post-path';
import { formatDateVi, kindLabel } from './article-utils';
import './cards.css';

export type CardPost = { id: string; title: string; slug: string; excerpt?: string | null; kind: string; cover_id: string | null; published_at?: Date | string | null };

/** Khung ảnh: ảnh nằm trọn trong khung, phần thừa hai bên là chính ảnh đó làm mờ. Ảnh dọc hay ngang đều không bị cắt. */
export function PostMedia({ post, sizes }: { post: CardPost; sizes?: string }) {
  const Icon = post.kind === 'project' ? Building2 : Newspaper;
  if (!post.cover_id) return <div className="pc-media pc-media-empty" aria-hidden="true"><Icon size={40} strokeWidth={1.5} /></div>;
  const src = `/api/media/${post.cover_id}`;
  return <div className="pc-media" aria-hidden="true">
    <img src={src} alt="" loading="lazy" decoding="async" sizes={sizes} />
  </div>;
}

export default function PostCard({ post, featured = false, index = 0, titleTag = 'h3' }: { post: CardPost; featured?: boolean; index?: number; titleTag?: 'h2' | 'h3' }) {
  const Title = titleTag;
  const href = postPath(post);
  return <article className={`pc-card${featured ? ' is-featured' : ''}`} data-art-reveal style={{ '--i': index } as CSSProperties}>
    <PostMedia post={post} />
    <div className="pc-body">
      <div className="pc-meta"><span className={`pc-kind kind-${post.kind}`}>{kindLabel(post.kind)}</span>{post.published_at && <time dateTime={new Date(post.published_at).toISOString()}>{formatDateVi(post.published_at)}</time>}</div>
      <Title className="pc-title"><Link href={href}>{post.title}</Link></Title>
      {post.excerpt ? <p className="pc-excerpt">{post.excerpt}</p> : null}
      <span className="pc-more" aria-hidden="true">Đọc bài viết<ArrowRight size={18} /></span>
    </div>
  </article>;
}
