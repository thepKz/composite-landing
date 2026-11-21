import Link from 'next/link';
import { ArrowUpRight, Home, Factory } from 'lucide-react';
import ProductCard from '@/components/product-card';
import PageHero from '@/components/pages/page-hero';
import CtaBand from '@/components/pages/cta-band';
import Reveal from '@/components/pages/reveal';
import FaqList from '@/components/pages/faq-list';
import { products } from '@/lib/content';
import { faqs } from '@/lib/site-facts';
import '@/components/pages/pages.css';
import '../../secondary-pages.css';

export const metadata = { title: 'Bể phốt và bể xử lý nước thải composite', description: 'Chọn bể phốt dân dụng hoặc module xử lý nước thải hợp khối bằng composite FRP theo số người dùng và lưu lượng nước thải.', alternates: { canonical: '/san-pham/be-phot-va-xu-ly-nuoc-thai' } };

export default async function WastewaterGroup() {
  const items = (await products()).filter(product => ['be-phot-composite', 'be-xu-ly-nuoc-thai'].includes(product.slug));
  return <main id="main" className="public-page tp tp-group">
    <Reveal/>
    <PageHero tone="teal" crumbs={[{ label: 'Trang chủ', href: '/' }, { label: 'Sản phẩm', href: '/san-pham' }, { label: 'Bể phốt và xử lý nước thải' }]} title="Bể phốt và bể xử lý nước thải" lead="Hai dòng bể composite liền khối cho hai nhu cầu."/>
    <section className="tp-section"><div className="tp-wrap">
      {items.length ? <div className="tp-grid tp-grid-2">{items.map((product, i) => <ProductCard key={product.slug} product={product} index={i} rank={2}/>)}</div> : <div className="tp-empty"><h2>Thông tin sản phẩm đang được cập nhật</h2><Link href="/lien-he#gui-yeu-cau" className="tp-btn tp-btn-cta">Nhận báo giá <ArrowUpRight size={18} aria-hidden="true"/></Link></div>}
    </div></section>
    <section className="tp-section tp-decide"><div className="tp-wrap">
      <div className="tp-section-head tp-rv"><h2>Chưa rõ nên chọn loại nào</h2></div>
      <div className="tp-decide-grid">
        <article className="tp-decide-card tp-rv"><Home size={30} aria-hidden="true"/><h3>Chọn bể phốt</h3><p>Nhà ở, nhà trọ, nhà hàng, trường học, cơ quan. Tính dung tích theo số người dùng.</p><Link className="tp-text-link" href="/san-pham/be-phot-composite">Xem bể phốt <ArrowUpRight size={18} aria-hidden="true"/></Link></article>
        <article className="tp-decide-card tp-rv" style={{ ['--i' as string]: 1 }}><Factory size={30} aria-hidden="true"/><h3>Chọn bể xử lý nước thải</h3><p>Khu dân cư, nhà máy, lưu lượng lớn. Dùng module hợp khối theo nguồn thải.</p><Link className="tp-text-link" href="/san-pham/be-xu-ly-nuoc-thai">Xem bể xử lý <ArrowUpRight size={18} aria-hidden="true"/></Link></article>
      </div>
    </div></section>
    <section className="tp-section tp-faq-section"><div className="tp-wrap tp-pd-faq-grid">
      <div className="tp-section-head tp-rv"><h2>Hỏi đáp thường gặp</h2></div>
      <div className="tp-rv"><FaqList items={[faqs[3], faqs[0], faqs[2]]} name="hoi-dap-nhom-phot"/></div>
    </div></section>
    <CtaBand/>
  </main>;
}
