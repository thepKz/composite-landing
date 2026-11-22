import Link from 'next/link';
import { ArrowUpRight, Phone } from 'lucide-react';
import { FlowSection, Pattern, ShapeFrame, Stack } from '@/components/decor';
import FlowHero from '@/components/pages/flow-hero';
import FlowCta from '@/components/pages/flow-cta';
import Reveal from '@/components/pages/reveal';
import FaqList from '@/components/pages/faq-list';
import { faqs } from '@/lib/site-facts';
import { editorialAssets } from '@/lib/customer-product-assets';
import { variants } from '@/lib/trang-phu-media';
import { contact } from '@/lib/content';
import { jsonLd } from '@/lib/seo';
import '@/components/pages/pages.css';
import '@/components/pages/pages-v4.css';
import '../secondary-pages.css';

export const metadata = { title: 'Hỏi đáp về bể composite', description: 'Câu hỏi thường gặp khi mua bể composite FRP: độ bền, độ dày, sửa chữa, lắp đặt vùng đất trũng, thời gian báo giá và giao hàng.', alternates: { canonical: '/hoi-dap' } };

export default async function FaqPage() {
  const hotline = (await contact()).hotlines[0];
  const schema = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map(item => ({ '@type': 'Question', name: item.q, acceptedAnswer: { '@type': 'Answer', text: item.a } })) };
  const photo = editorialAssets.gallery[0];
  return <main id="main" className="public-page tp tp-faq-page tp4">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }}/>
    <Reveal/>
    <FlowHero tone="forest" crumbs={[{ label: 'Trang chủ', href: '/' }, { label: 'Hỏi đáp' }]}
      title="Những câu khách hàng hỏi trước khi chọn bể"
      lead="Năm câu hỏi về độ bền, độ dày, sửa chữa, lắp đặt và giao hàng."
      visual={<Stack pattern={{ kind: 'ripple', blend: 'screen', opacity: 0.55 }} floatAt="br">
        <ShapeFrame shape="circle" ratio={1.15} outline="bronze" outlineOffset={12} focus="50% 50%">
          <img src={variants(photo.src).r43} alt={photo.alt} width={960} height={720} fetchPriority="high"/>
        </ShapeFrame>
      </Stack>}/>
    <FlowSection tone="light" top="dome" className="tp4-faq-page-body" decor={<Pattern kind="paper" fade="both" opacity={0.85}/>}>
      <div className="tp4-faq-layout">
        <div className="tp-rv"><FaqList items={faqs} name="hoi-dap"/></div>
        <aside className="tp4-faq-aside tp-rv" style={{ ['--i' as string]: 1 }}>
          <h2>Cần tư vấn thêm</h2>
          <p>Gọi hotline hoặc gửi nhu cầu. Thành Lợi báo giá trong 15 – 60 phút kể từ khi nhận đủ thông tin.</p>
          <a className="tp-btn tp-btn-cta" href={`tel:${hotline.tel}`}><Phone size={18} aria-hidden="true"/>{hotline.display}</a>
          <Link className="tp-text-link" href="/huong-dan-dat-hang">Xem hướng dẫn đặt hàng <ArrowUpRight size={18} aria-hidden="true"/></Link>
        </aside>
      </div>
    </FlowSection>
    <FlowCta/>
  </main>;
}
