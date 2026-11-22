import Link from 'next/link';
import { ArrowUpRight, Home, Factory } from 'lucide-react';
import { shortStat } from '@/components/product-card';
import { FlowSection, Pattern, ShapeFrame, Stack, StackStat } from '@/components/decor';
import FlowHero from '@/components/pages/flow-hero';
import FlowCta from '@/components/pages/flow-cta';
import Reveal from '@/components/pages/reveal';
import FaqList from '@/components/pages/faq-list';
import { Drawing } from '@/components/pages/product-tile';
import { ScaleChips, ScaleProvider, ScaleTableView } from '@/components/pages/scale-picker';
import { products } from '@/lib/content';
import { faqs } from '@/lib/site-facts';
import { productGuidance } from '@/lib/product-guidance';
import '@/components/pages/pages.css';
import '@/components/pages/pages-v4.css';
import '../../secondary-pages.css';
import '../[slug]/product-detail.css';

export const metadata = { title: 'Bể phốt và bể xử lý nước thải composite', description: 'Chọn bể phốt dân dụng hoặc module xử lý nước thải hợp khối bằng composite FRP theo số người dùng và lưu lượng nước thải.', alternates: { canonical: '/san-pham/be-phot-va-xu-ly-nuoc-thai' } };

// Trang nhóm không gán ảnh vì hai dòng này chưa có ảnh thật đã xác nhận. Phần hình là hoa văn, hình vẽ nét và số liệu lớn.
export default async function WastewaterGroup() {
  const items = (await products()).filter(product => ['be-phot-composite', 'be-xu-ly-nuoc-thai'].includes(product.slug));
  const table = productGuidance('be-phot-composite').scale;
  const icons = { 'be-phot-composite': Home, 'be-xu-ly-nuoc-thai': Factory } as const;
  return <main id="main" className="public-page tp tp-group tp4">
    <Reveal/>
    <FlowHero tone="teal" crumbs={[{ label: 'Trang chủ', href: '/' }, { label: 'Sản phẩm', href: '/san-pham' }, { label: 'Bể phốt và xử lý nước thải' }]}
      title="Chọn bể phốt và bể xử lý theo số người dùng"
      lead="Dung tích bắt đầu từ 1 m³ cho gia đình ba đến sáu người và mở rộng theo quy mô công trình."
      visual={<Stack pattern={{ kind: 'ripple', blend: 'screen', opacity: 0.55 }} floatAt="tl" float={<StackStat value="1 – 100+ m³" tone="light"/>}>
        <ShapeFrame shape="capsule" ratio={1.9} outline="bronze" outlineOffset={12}>
          <div className="tp4-plain"><Drawing kind="septic" color="#d3f56b" className="tp4-plain__art"/></div>
        </ShapeFrame>
      </Stack>}/>
    <ScaleProvider table={table} productName="Bể phốt composite">
      <FlowSection tone="light" top="dome" className="tp4-group-pick" decor={<Pattern kind="paper" fade="both" opacity={0.8}/>}>
        <div className="tp4-group-top">
          <div className="tp-rv"><ScaleChips/></div>
          <ul className="tp4-group-links tp-rv" style={{ ['--i' as string]: 1 }}>
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
        <div className="tp4-faq tp-rv"><h2 className="tp-sr">Hỏi đáp thường gặp</h2><FaqList items={[faqs[3], faqs[0], faqs[2]]} name="hoi-dap-nhom-phot"/></div>
      </FlowSection>
    </ScaleProvider>
    <FlowCta/>
  </main>;
}
