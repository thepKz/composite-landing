import { db } from './db';
import { catalogue, type Product } from './catalogue';
import { isDemoMode } from './demo-mode';

export async function products(): Promise<Product[]> {
  if (isDemoMode()) return catalogue.map(product => ({ ...product, specifications: product.specifications.map(spec => ({ ...spec })), applications: [...product.applications] }));
  return (await db.query('SELECT * FROM products WHERE is_published=true ORDER BY sort_order,name')).rows;
}

export async function company() {
  if (isDemoMode()) return { name: 'Thành Lợi Composite', phone: '', email: '', address: 'Phú Thọ', zalo: '', description: 'Bồn bể composite cho dân dụng, chăn nuôi, thủy sản và công nghiệp.' };
  const result = await db.query("SELECT value FROM site_settings WHERE key='company'");
  return result.rows[0]?.value as { name: string; phone: string; email: string; address: string; zalo: string; description: string } | undefined;
}

export async function publishedPosts(limit = 12) {
  if (isDemoMode()) return [];
  return (await db.query("SELECT id,title,slug,excerpt,kind,cover_id,published_at FROM posts WHERE status='published' AND published_at <= now() ORDER BY published_at DESC,id DESC LIMIT $1", [limit])).rows;
}
