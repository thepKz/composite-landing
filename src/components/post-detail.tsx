import { isDemoMode } from '@/lib/demo-mode';
import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { postPath } from '@/lib/post-path';
import { cache } from 'react';
import { db } from '@/lib/db';
import { products } from '@/lib/content';
import { siteUrl, jsonLd } from '@/lib/seo';
import { cleanDocument } from '@/lib/rich-text';
import PostCard from '@/components/article/post-card';
import ArticleEnhancer from '@/components/article/article-enhancer';
import Reveal from '@/components/article/reveal';
import ArticleView from '@/components/article/article-view';
import { buildToc, kindLabel, readingMinutes, relatedProductSlug, wordCount } from '@/components/article/article-utils';
import '@/components/article/cards.css';
import './post-detail.css';

const getPost = cache(async (slug: string, kind: string) => isDemoMode() ? undefined : (await db.query("SELECT p.*,m.alt AS cover_alt FROM posts p LEFT JOIN media_assets m ON m.id=p.cover_id WHERE p.slug=$1 AND p.status='published' AND p.published_at<=now() AND ($2='' OR p.kind=$2)", [slug, kind])).rows[0]);
type Props = { slug: string; kind?: 'article' | 'project' };
type Neighbour = { id: string; title: string; slug: string; kind: string; cover_id: string | null };

export async function postMetadata({ slug, kind }: Props): Promise<Metadata> {
  const post = await getPost(slug, kind === 'project' ? 'project' : '');
  if (!post) return { title: 'Không tìm thấy bài viết', robots: { index: false, follow: false } };
  const title = post.seo_title || post.title;
  const description = post.seo_description || post.excerpt;
  const images = post.cover_id ? [{ url: siteUrl(`/api/media/${post.cover_id}`), alt: post.cover_alt || post.title }] : [];
  return {
    title, description,
    alternates: { canonical: postPath(post) },
    openGraph: { type: 'article', locale: 'vi_VN', siteName: 'Thành Lợi Composite', title, description, url: siteUrl(postPath(post)), section: kindLabel(post.kind), publishedTime: new Date(post.published_at).toISOString(), modifiedTime: new Date(post.updated_at).toISOString(), images },
    twitter: { card: images.length ? 'summary_large_image' : 'summary', title, description, images: images.map(image => image.url) },
  };
}

function NeighbourLink({ post, direction }: { post: Neighbour; direction: 'prev' | 'next' }) {
  return <Link href={postPath(post)} className={`art-neighbour is-${direction} pressable`}>
    <span className="art-neighbour-label">{direction === 'prev' ? <><ArrowLeft size={18} aria-hidden="true" />Bài trước</> : <>Bài sau<ArrowRight size={18} aria-hidden="true" /></>}</span>
    <span className="art-neighbour-title">{post.title}</span>
  </Link>;
}

export default async function PostDetail({ slug, kind = 'article' }: Props) {
  const post = await getPost(slug, kind === 'project' ? 'project' : '');
  if (!post) notFound();
  if (kind === 'article' && post.kind === 'project') permanentRedirect(postPath(post));
  const isProject = post.kind === 'project';
  const document = cleanDocument(post.content);
  const toc = buildToc(document);
  const minutes = readingMinutes(document);
  const publishedAt = new Date(post.published_at);
  const updatedAt = new Date(post.updated_at);
  const path = postPath(post);
  const url = siteUrl(path);
  const [relatedResult, previous, next, catalogue] = await Promise.all([
    db.query<Neighbour & { excerpt: string; published_at: Date }>("SELECT id,title,slug,excerpt,kind,cover_id,published_at FROM posts WHERE id<>$1 AND status='published' AND published_at<=now() ORDER BY (kind=$2) DESC,published_at DESC,id DESC LIMIT 3", [post.id, post.kind]),
    db.query<Neighbour>("SELECT id,title,slug,kind,cover_id FROM posts WHERE status='published' AND published_at<=now() AND kind=$1 AND (published_at,id)<($2::timestamptz,$3::uuid) ORDER BY published_at DESC,id DESC LIMIT 1", [post.kind, post.published_at, post.id]),
    db.query<Neighbour>("SELECT id,title,slug,kind,cover_id FROM posts WHERE status='published' AND published_at<=now() AND kind=$1 AND (published_at,id)>($2::timestamptz,$3::uuid) ORDER BY published_at ASC,id ASC LIMIT 1", [post.kind, post.published_at, post.id]),
    products(),
  ]);
  const related = relatedResult.rows;
  const productSlug = relatedProductSlug(post.title, post.excerpt ?? '', catalogue.map(item => item.slug));
  const product = productSlug ? catalogue.find(item => item.slug === productSlug) : undefined;
  const listPath = isProject ? '/du-an' : '/tin-tuc';
  const listLabel = isProject ? 'Dự án' : 'Tin tức';
  const cover = post.cover_id ? `/api/media/${post.cover_id}` : null;
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Article', '@id': `${url}#article`, headline: post.title, description: post.excerpt, datePublished: publishedAt.toISOString(), dateModified: updatedAt.toISOString(), inLanguage: 'vi', articleSection: kindLabel(post.kind), wordCount: wordCount(document), timeRequired: `PT${minutes}M`, author: { '@type': 'Organization', name: 'Thành Lợi Composite' }, publisher: { '@type': 'Organization', name: 'Thành Lợi Composite' }, mainEntityOfPage: { '@type': 'WebPage', '@id': url }, ...(cover ? { image: [siteUrl(cover)] } : {}) },
      { '@type': 'BreadcrumbList', '@id': `${url}#breadcrumb`, itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Trang chủ', item: siteUrl('/') },
        { '@type': 'ListItem', position: 2, name: listLabel, item: siteUrl(listPath) },
        { '@type': 'ListItem', position: 3, name: post.title, item: url },
      ] },
    ],
  };

  return <ArticleView
    title={post.title} excerpt={post.excerpt} kind={isProject ? 'project' : 'article'} document={document} cover={cover} coverAlt={post.cover_alt}
    publishedAt={publishedAt} updatedAt={updatedAt} url={url} product={product ?? null}
    top={<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} />}
  >
    {(previous.rows[0] || next.rows[0]) && <nav className="container art-neighbours" aria-label="Bài trước và bài sau" data-art-reveal>
      {previous.rows[0] ? <NeighbourLink post={previous.rows[0]} direction="prev" /> : <span />}
      {next.rows[0] ? <NeighbourLink post={next.rows[0]} direction="next" /> : <span />}
    </nav>}

    {related.length > 0 && <section className="art-related" aria-labelledby="art-related-title"><div className="container">
      <h2 id="art-related-title">Bài viết liên quan</h2>
      <div className="art-related-grid">{related.map((item, index) => <PostCard key={item.id} post={item} index={index} />)}</div>
    </div></section>}

    <ArticleEnhancer />
    <Reveal />
  </ArticleView>;
}
