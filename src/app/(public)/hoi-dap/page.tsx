import Link from 'next/link';
import { ArrowUpRight, Phone } from 'lucide-react';
import PageHero from '@/components/pages/page-hero';
import CtaBand from '@/components/pages/cta-band';
import Reveal from '@/components/pages/reveal';
import FaqList from '@/components/pages/faq-list';
import { faqs } from '@/lib/site-facts';
import { contact } from '@/lib/content';
import { jsonLd } from '@/lib/seo';
import '@/components/pages/pages.css';
import '../secondary-pages.css';

export const metadata = { title: 'Hỏi đáp về bể composite', description: 'Câu hỏi thường gặp khi mua bể composite FRP: độ bền, độ dày, sửa chữa, lắp đặt vùng đất trũng, thời gian báo giá và giao hàng.', alternates: { canonical: '/hoi-dap' } };

export default async function FaqPage() {
  const hotline = (await contact()).hotlines[0];
  const schema = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map(item => ({ '@type': 'Question', name: item.q, acceptedAnswer: { '@type': 'Answer', text: item.a } })) };
  return <main id="main" className="public-page tp tp-faq-page">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }}/>
    <Reveal/>
    <PageHero tone="lime" crumbs={[{ label: 'Trang chủ', href: '/' }, { label: 'Hỏi đáp' }]} title="Hỏi đáp thường gặp" lead="Năm câu khách hàng hỏi nhiều nhất trước khi đặt bể."/>
    <section className="tp-section"><div className="tp-wrap tp-faq-layout">
      <div className="tp-rv"><FaqList items={faqs} name="hoi-dap"/></div>
      <aside className="tp-faq-aside tp-rv" style={{ ['--i' as string]: 1 }}>
        <h2>Chưa thấy câu trả lời</h2>
        <p>Gọi hotline hoặc gửi nhu cầu, kỹ sư trả lời trong 15 – 60 phút.</p>
        <a className="tp-btn tp-btn-ghost" href={`tel:${hotline.tel}`}><Phone size={18} aria-hidden="true"/>{hotline.display}</a>
        <Link className="tp-text-link" href="/huong-dan-dat-hang">Xem hướng dẫn đặt hàng <ArrowUpRight size={18} aria-hidden="true"/></Link>
      </aside>
    </div></section>
    <CtaBand/>
  </main>;
}
