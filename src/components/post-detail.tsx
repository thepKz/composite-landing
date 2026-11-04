import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import { postPath } from '@/lib/post-path';
import { cache } from 'react';
import { db } from '@/lib/db';
import { siteUrl, jsonLd } from '@/lib/seo';
import RichContent from '@/components/rich-content';
import { cleanDocument } from '@/lib/rich-text';
import './post-detail.css';

const getPost = cache(async (slug: string, kind: string) => (await db.query("SELECT p.*,m.alt AS cover_alt FROM posts p LEFT JOIN media_assets m ON m.id=p.cover_id WHERE p.slug=$1 AND p.status='published' AND p.published_at<=now() AND ($2='' OR p.kind=$2)", [slug, kind])).rows[0]);
type Props = { slug: string; kind?: 'article' | 'project' };

export async function postMetadata({ slug, kind }: Props) {
  const post = await getPost(slug, kind === 'project' ? 'project' : '');
  if (!post) return { title: 'Không tìm thấy bài viết', robots: { index: false, follow: false } };
  return { title: post.seo_title || post.title, description: post.seo_description || post.excerpt, alternates: { canonical: postPath(post) }, openGraph: { type: 'article', locale: 'vi_VN', title: post.seo_title || post.title, description: post.seo_description || post.excerpt, url: siteUrl(postPath(post)), publishedTime: new Date(post.published_at).toISOString(), modifiedTime: new Date(post.updated_at).toISOString(), images: post.cover_id ? [{ url: siteUrl(`/api/media/${post.cover_id}`), alt: post.cover_alt || post.title }] : [] } };
}

export default async function PostDetail({ slug, kind = 'article' }: Props) {
  const post = await getPost(slug, kind === 'project' ? 'project' : '');
  if (!post) notFound();
  if (kind === 'article' && post.kind === 'project') permanentRedirect(postPath(post));
  const related = (await db.query("SELECT id,title,slug,excerpt,kind,cover_id FROM posts WHERE id<>$1 AND status='published' AND published_at<=now() ORDER BY (kind=$2) DESC,published_at DESC,id DESC LIMIT 3", [post.id, post.kind])).rows;
  const schema = { '@context': 'https://schema.org', '@type': 'Article', headline: post.title, description: post.excerpt, datePublished: new Date(post.published_at).toISOString(), dateModified: new Date(post.updated_at).toISOString(), inLanguage: 'vi', author: { '@type': 'Organization', name: 'Thành Lợi Composite' }, publisher: { '@type': 'Organization', name: 'Thành Lợi Composite' }, mainEntityOfPage: siteUrl(postPath(post)), ...(post.cover_id ? { image: siteUrl(`/api/media/${post.cover_id}`) } : {}) };
  return <main id="main" className="public-page editorial-page">
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }}/>
      <header className="editorial-heading"><div className="container">
      <nav className="breadcrumb" aria-label="Đường dẫn"><Link href="/">Trang chủ</Link><span aria-hidden="true">/</span><Link href={post.kind === 'project' ? '/du-an' : '/tin-tuc'}>{post.kind === 'project' ? 'Dự án' : 'Tin tức'}</Link></nav>
      <div className={post.cover_id ? 'editorial-intro has-photo' : 'editorial-intro'}><div>
      <h1>{post.title}</h1><div className="article-meta"><Link href={post.kind === 'project' ? '/du-an' : '/tin-tuc?kind=article'}>{post.kind === 'project' ? 'Công trình thực tế' : 'Kiến thức sản phẩm'}</Link><time dateTime={new Date(post.published_at).toISOString()}>{new Date(post.published_at).toLocaleDateString('vi-VN',{timeZone:'Asia/Ho_Chi_Minh'})}</time></div>
      {post.excerpt && <p className="article-excerpt">{post.excerpt}</p>}
      </div>{post.cover_id && <figure className="editorial-cover"><img className="article-cover" src={`/api/media/${post.cover_id}`} alt={post.cover_alt || post.title}/></figure>}</div>
      </div></header>
      <div className="container reading editorial-body">
      <RichContent document={cleanDocument(post.content)}/>
      <div className="article-cta"><h2>Chọn sản phẩm cho nhu cầu của bạn</h2><p>Trao đổi mục đích sử dụng và quy cách dự kiến với Thành Lợi.</p><div className="editorial-actions"><Link href="/lien-he#gui-yeu-cau" className="button">Tư vấn & báo giá</Link><Link href="/san-pham" className="text-link dark">Xem sản phẩm</Link></div></div>
      </div>
    </article>
    {related.length > 0 && <section className="section container editorial-related"><h2>Bài viết liên quan</h2><div className="news-list">{related.map(item => <article className="news-card" key={item.id}>
      {item.cover_id && <Link href={postPath(item)} tabIndex={-1} aria-hidden="true"><img src={`/api/media/${item.cover_id}`} alt="" loading="lazy"/></Link>}
      <div><h3><Link href={postPath(item)}>{item.title}</Link></h3>{item.excerpt && <p>{item.excerpt}</p>}</div>
    </article>)}</div></section>}
  </main>;
}
