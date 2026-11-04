import { db } from './db';
import type { Product } from './catalogue';

export async function products(): Promise<Product[]> {
  return (await db.query('SELECT * FROM products WHERE is_published=true ORDER BY sort_order,name')).rows;
}

export async function company() {
  const result = await db.query("SELECT value FROM site_settings WHERE key='company'");
  return result.rows[0]?.value as { name: string; phone: string; email: string; address: string; zalo: string; description: string } | undefined;
}

export async function publishedPosts(limit = 12) {
  return (await db.query("SELECT id,title,slug,excerpt,kind,cover_id,published_at FROM posts WHERE status='published' AND published_at <= now() ORDER BY published_at DESC,id DESC LIMIT $1", [limit])).rows;
}
