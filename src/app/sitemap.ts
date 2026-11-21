import { catalogue } from '@/lib/catalogue';
import { isDemoMode } from '@/lib/demo-mode';
import type { MetadataRoute } from 'next';
import { db } from '@/lib/db';
import { siteUrl } from '@/lib/seo';
import { postPath } from '@/lib/post-path';
export const dynamic='force-dynamic';
export default async function sitemap():Promise<MetadataRoute.Sitemap>{if(isDemoMode())return [...['/','/san-pham','/gioi-thieu','/du-an','/huong-dan-dat-hang','/san-pham/be-phot-va-xu-ly-nuoc-thai','/tin-tuc','/lien-he','/hoi-dap','/chinh-sach-bao-hanh','/chinh-sach-bao-mat'],...catalogue.map(p=>`/san-pham/${p.slug}`)].map(path=>({url:siteUrl(path)}));const [products,posts]=await Promise.all([db.query('SELECT slug,updated_at FROM products WHERE is_published=true'),db.query("SELECT slug,kind,updated_at FROM posts WHERE status='published' AND published_at<=now()")]);return [...['/','/san-pham','/gioi-thieu','/du-an','/huong-dan-dat-hang','/san-pham/be-phot-va-xu-ly-nuoc-thai','/tin-tuc','/lien-he','/hoi-dap','/chinh-sach-bao-hanh','/chinh-sach-bao-mat'].map(path=>({url:siteUrl(path)})),...products.rows.map(p=>({url:siteUrl(`/san-pham/${p.slug}`),lastModified:new Date(p.updated_at)})),...posts.rows.map(p=>({url:siteUrl(postPath(p)),lastModified:new Date(p.updated_at)}))];}
