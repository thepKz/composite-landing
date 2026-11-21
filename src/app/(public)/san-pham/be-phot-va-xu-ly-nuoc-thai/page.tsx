import Link from 'next/link';
import { ArrowUpRight, Home, Factory } from 'lucide-react';
import { shortStat } from '@/components/product-card';
import PageHero from '@/components/pages/page-hero';
import CtaBand from '@/components/pages/cta-band';
import Reveal from '@/components/pages/reveal';
import FaqList from '@/components/pages/faq-list';
import { ScaleChips, ScaleProvider, ScaleTableView } from '@/components/pages/scale-picker';
import { products } from '@/lib/content';
import { faqs } from '@/lib/site-facts';
import { productGuidance } from '@/lib/product-guidance';
import '@/components/pages/pages.css';
import '../../secondary-pages.css';
import '../[slug]/product-detail.css';

export const metadata = { title: 'Bể phốt và bể xử lý nước thải composite', description: 'Chọn bể phốt dân dụng hoặc module xử lý nước thải hợp khối bằng composite FRP theo số người dùng và lưu lượng nước thải.', alternates: { canonical: '/san-pham/be-phot-va-xu-ly-nuoc-thai' } };

// Trang nhóm dựa vào nút chọn quy mô và bảng phân khúc (hai thứ khách cần để quyết định), không dùng ô ảnh lớn
// vì hai dòng này chưa có ảnh thật đã xác nhận.
export default async function WastewaterGroup() {
  const items = (await products()).filter(product => ['be-phot-composite', 'be-xu-ly-nuoc-thai'].includes(product.slug));
  const table = productGuidance('be-phot-composite').scale;
  const icons = { 'be-phot-composite': Home, 'be-xu-ly-nuoc-thai': Factory } as const;
  return <main id="main" className="public-page tp tp-group">
    <Reveal/>
    <PageHero tone="teal" crumbs={[{ label: 'Trang chủ', href: '/' }, { label: 'Sản phẩm', href: '/san-pham' }, { label: 'Bể phốt và xử lý nước thải' }]} title="Bể phốt và bể xử lý nước thải"/>
    <ScaleProvider table={table} productName="Bể phốt composite">
      <section className="tp-section tp-group-pick"><div className="tp-wrap">
        <div className="tp-group-top">
          <div className="tp-rv"><ScaleChips/></div>
          <ul className="tp-group-links tp-rv" style={{ ['--i' as string]: 1 }}>
            {items.map(product => {
              const Icon = icons[product.slug as keyof typeof icons] ?? Home;
              return <li key={product.slug}><Link href={`/san-pham/${product.slug}`} className="tp-group-row">
                <Icon size={30} aria-hidden="true"/>
                <span className="tp-group-name">{product.name}</span>
                <span className="tp-group-stat">{shortStat(product.specifications[0]?.value.split(':')[0])}</span>
                <ArrowUpRight size={20} aria-hidden="true"/>
              </Link></li>;
            })}
          </ul>
        </div>
        <div className="tp-rv"><ScaleTableView/></div>
      </div></section>
    </ScaleProvider>
    <section className="tp-section tp-faq-section"><div className="tp-wrap tp-pd-faq-grid is-solo">
      <div className="tp-section-head tp-rv"><h2 className="tp-sr">Hỏi đáp thường gặp</h2></div>
      <div className="tp-rv"><FaqList items={[faqs[3], faqs[0], faqs[2]]} name="hoi-dap-nhom-phot"/></div>
    </div></section>
    <CtaBand/>
  </main>;
}
