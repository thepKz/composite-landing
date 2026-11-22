import Link from 'next/link';
import { Home, Phone } from 'lucide-react';
import { contact, products } from '@/lib/content';
import ProductCard from '@/components/product-card';
import { FlowSection, Pattern } from '@/components/decor';
import FlowCta from './flow-cta';
import './pages.css';
import './pages-v4.css';
import '@/app/(public)/secondary-pages.css';

// Trang 404: huy hiệu trống đồng làm nền số 404, lối về ngay màn đầu, gợi ý ba dòng sản phẩm mũi nhọn.
export default async function NotFoundView() {
  const items = await products().catch(() => []);
  const hotline = (await contact()).hotlines[0];
  return <main id="main" className="public-page tp tp-notfound tp4">
    <FlowSection tone="dark" top="none" className="tp4-fs--teal tp4-nf" decor={<>
      <Pattern kind="resin" fade="both" opacity={0.5}/>
      <Pattern kind="ripple" size="clamp(260px,34vw,520px)" bottom="-14%" left="-8%" opacity={0.45} blend="screen"/>
    </>}>
      <div className="tp4-nf__grid">
        <div className="tp4-nf__badge" aria-hidden="true">
          <Pattern kind="drum" size="100%" top="0" left="0" opacity={0.5} blend="screen" className="tp4-nf__drum"/>
          <p className="tp4-nf__code">404</p>
        </div>
        <div className="tp4-nf__copy">
          <h1>Không tìm thấy trang này</h1>
          <p className="tp4-lead">Đường dẫn có thể đã đổi hoặc nội dung chưa được đăng.</p>
          <div className="tp4-actions">
            <Link href="/" className="tp-btn tp-btn-cta"><Home size={18} aria-hidden="true"/>Về trang chủ</Link>
            <Link href="/san-pham" className="tp-btn tp-btn-ghost-light">Xem sản phẩm</Link>
            <a href={`tel:${hotline.tel}`} className="tp-btn tp-btn-ghost-light"><Phone size={18} aria-hidden="true"/>{hotline.display}</a>
          </div>
        </div>
      </div>
    </FlowSection>
    {items.length > 0 && <FlowSection tone="light" top="dome" className="tp4-nf-products" decor={<Pattern kind="paper" fade="both" opacity={0.85}/>}>
      <h2 className="tp-sr">Có thể bạn đang tìm</h2>
      <div className="tp-grid tp-grid-3">{items.slice(0, 3).map((product, i) => <ProductCard key={product.slug} product={product} compact index={i} still/>)}</div>
    </FlowSection>}
    <FlowCta/>
  </main>;
}
