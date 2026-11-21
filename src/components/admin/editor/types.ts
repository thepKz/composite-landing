import type { RichNode } from '@/lib/rich-text';

export type Post = {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: RichNode;
  kind: 'article' | 'project';
  status: 'draft' | 'published';
  published_at?: string | null;
  server_now?: string;
  cover_id: string | null;
  seo_title: string;
  seo_description: string;
  version?: number;
  revisions?: { id: string; created_at: string; snapshot: Post }[];
};

export const emptyPost: Post = {
  title: '', slug: '', excerpt: '', content: { type: 'doc', content: [{ type: 'paragraph' }] },
  kind: 'article', status: 'draft', cover_id: null, seo_title: '', seo_description: '',
};

export type MediaKind = 'image' | 'video' | 'cover';
