import Link from 'next/link';
import { ArrowUpRight, Home, Phone } from 'lucide-react';
import { contact, products } from '@/lib/content';
import ProductCard from '@/components/product-card';
import './pages.css';
import '@/app/(public)/secondary-pages.css';

// Trang 404: nói rõ chuyện gì xảy ra, có lối về, gợi ý ba dòng sản phẩm mũi nhọn.
export default async function NotFoundView() {
  const items = await products().catch(() => []);
  const hotline = (await contact()).hotlines[0];
  return <main id="main" className="public-page tp tp-notfound">
    <section className="tp-nf-hero"><div className="tp-wrap tp-nf-grid">
      <p className="tp-nf-code" aria-hidden="true">404</p>
      <div>
        <h1>Không tìm thấy trang này</h1>
        <p className="tp-lead">Đường dẫn có thể đã đổi hoặc nội dung chưa được đăng.</p>
        <div className="tp-hero-actions">
          <Link href="/" className="tp-btn tp-btn-cta"><Home size={18} aria-hidden="true"/>Về trang chủ</Link>
          <Link href="/san-pham" className="tp-btn tp-btn-ghost-light">Xem sản phẩm</Link>
          <a href={`tel:${hotline.tel}`} className="tp-btn tp-btn-ghost-light"><Phone size={18} aria-hidden="true"/>{hotline.display}</a>
        </div>
      </div>
    </div></section>
    {items.length > 0 && <section className="tp-section"><div className="tp-wrap">
      <div className="tp-section-head"><h2>Có thể bạn đang tìm</h2><Link href="/san-pham" className="tp-text-link">Tất cả sản phẩm <ArrowUpRight size={18} aria-hidden="true"/></Link></div>
      <div className="tp-grid tp-grid-3">{items.slice(0, 3).map((product, i) => <ProductCard key={product.slug} product={product} compact index={i} still/>)}</div>
    </div></section>}
  </main>;
}
