import { db } from './db';
import { catalogue, type Product } from './catalogue';
import { isDemoMode } from './demo-mode';
import { facts } from './site-facts';
import { resolveContact } from './contact-info';

type Company = { name: string; phone: string; email: string; address: string; zalo: string; description: string; phone2: string; hours: string };
// Ô nào trong phần cài đặt còn trống (hoặc chỉ ghi chung chung) thì dùng dữ kiện trong hồ sơ nội dung.
function withFacts(value?: Partial<Company>): Company {
  const address = value?.address?.trim();
  return {
    name: value?.name?.trim() || facts.shortName,
    phone: value?.phone?.trim() || facts.hotlines[0].display,
    email: value?.email?.trim() || facts.email,
    address: !address || address === 'Phú Thọ' ? facts.address : address,
    zalo: value?.zalo?.trim() || facts.zalo,
    phone2: value?.phone2?.trim() || facts.hotlines[1]?.display || '',
    hours: value?.hours?.trim() || facts.hours,
    description: value?.description?.trim() || 'Bồn bể composite cho dân dụng, chăn nuôi, thủy sản và công nghiệp.',
  };
}

export async function products(): Promise<Product[]> {
  if (isDemoMode()) return catalogue.map(product => ({ ...product, specifications: product.specifications.map(spec => ({ ...spec })), applications: [...product.applications] }));
  return (await db.query('SELECT * FROM products WHERE is_published=true ORDER BY sort_order,name')).rows;
}

export async function company() {
  if (isDemoMode()) return withFacts();
  const result = await db.query("SELECT value FROM site_settings WHERE key='company'");
  return withFacts(result.rows[0]?.value);
}

// Thông tin liên hệ đã chốt (cài đặt admin thắng, ô trống rơi về hồ sơ) cho các thành phần công khai.
export async function contact() {
  return resolveContact(await company().catch(() => undefined));
}

export async function publishedPosts(limit = 12) {
  if (isDemoMode()) return [];
  return (await db.query("SELECT id,title,slug,excerpt,kind,cover_id,published_at FROM posts WHERE status='published' AND published_at <= now() ORDER BY published_at DESC,id DESC LIMIT $1", [limit])).rows;
}
