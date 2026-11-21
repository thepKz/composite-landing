import Link from 'next/link';
import { ArrowUpRight, Clock, Truck, ShieldCheck } from 'lucide-react';
import PageHero from '@/components/pages/page-hero';
import Reveal from '@/components/pages/reveal';
import OrderTabs, { type OrderLine } from '@/components/pages/order-tabs';
import { processSteps } from '@/lib/site-facts';
import { productGuidance } from '@/lib/product-guidance';
import '@/components/pages/pages.css';
import '../secondary-pages.css';

export const metadata = { title: 'Hướng dẫn đặt hàng', description: 'Quy trình đặt hàng năm bước, thông tin cần cung cấp theo từng dòng sản phẩm, thời gian báo giá, giao hàng và lắp đặt.', alternates: { canonical: '/huong-dan-dat-hang' } };

const lines: OrderLine[] = [
  { id: 'biogas', label: 'Bể biogas', slug: 'be-biogas-composite' },
  { id: 'phot', label: 'Bể phốt', slug: 'be-phot-composite' },
  { id: 'ca', label: 'Bể cá', slug: 'be-nuoi-trong-thuy-san' },
  { id: 'hoa-chat', label: 'Bồn hóa chất', slug: 'bon-chua-hoa-chat' },
  { id: 'thung-cho', label: 'Thùng chở', slug: 'thung-cho-tom-ca' },
  { id: 'rac', label: 'Thùng rác', slug: 'xe-gom-rac' },
  { id: 'yeu-cau', label: 'Theo yêu cầu', slug: 'composite-theo-yeu-cau' },
].map(item => ({ id: item.id, label: item.label, href: `/san-pham/${item.slug}`, items: productGuidance(item.slug).order }));

// Rút gọn một câu bước 1 cho vừa cột, không đổi nghĩa.
const stepText: Record<string, string> = { [processSteps[0].title]: 'Chọn quy mô trên website hoặc gọi hotline, nhắn Zalo.' };

const times = [
  { value: '15 – 60 phút', label: 'Báo giá nhanh, kể từ khi nhận đủ thông tin' },
  { value: '2 – 3 ngày', label: 'Giao mẫu tiêu chuẩn có sẵn khuôn' },
  { value: '10 – 25 ngày', label: 'Giao hàng đơn thiết kế riêng' },
];

const groundSteps = ['Hút cạn nước trong hố đào', 'Gia cố đáy bằng cát đầm chặt hoặc bê tông lót phẳng, không để gạch đá sắc nhọn', 'Hạ bể đúng vị trí rồi bơm nước vào lòng bể để cân bằng với lực đẩy nổi của nước ngầm', 'Lấp đất mịn theo từng lớp và đầm đều tay'];

export default function OrderingGuide() {
  return <main id="main" className="public-page tp tp-order">
    <Reveal/>
    <PageHero tone="paper" crumbs={[{ label: 'Trang chủ', href: '/' }, { label: 'Hướng dẫn đặt hàng' }]} title="Hướng dẫn đặt hàng">
      <Link href="/lien-he#gui-yeu-cau" className="tp-btn tp-btn-cta">Nhận báo giá <ArrowUpRight size={18} aria-hidden="true"/></Link>
    </PageHero>

    <section className="tp-section tp-steps"><div className="tp-wrap">
      <div className="tp-section-head tp-rv"><h2 className="tp-sr">Quy trình năm bước</h2></div>
      <ol className="tp-step-flow">
        {processSteps.map((step, i) => <li className="tp-step tp-rv" style={{ ['--i' as string]: i }} key={step.title}>
          <span className="tp-step-no" aria-hidden="true">{i + 1}</span>
          <h3>{step.title}</h3>
          <p>{stepText[step.title] ?? step.text}</p>
        </li>)}
      </ol>
    </div></section>

    <section className="tp-section tp-order-info"><div className="tp-wrap tp-order-info-grid">
      <div className="tp-section-head tp-rv"><h2>Thông tin cần có</h2></div>
      <div className="tp-rv"><OrderTabs lines={lines}/></div>
    </div></section>

    <section className="tp-section tp-times"><div className="tp-wrap">
      <div className="tp-times-grid">
        {times.map((item, i) => <div className="tp-time tp-rv" style={{ ['--i' as string]: i }} key={item.value}><Clock size={24} aria-hidden="true"/><p className="tp-time-value">{item.value}</p><p>{item.label}</p></div>)}
      </div>
      <p className="tp-times-note">Báo giá chi tiết kèm bản vẽ và tiến độ gửi trong 1 – 24 giờ.</p>
    </div></section>

    <section className="tp-section tp-ship" id="van-chuyen"><div className="tp-wrap tp-ship-grid">
      <div className="tp-rv">
        <Truck size={32} aria-hidden="true"/>
        <h2>Vận chuyển và lắp đặt</h2>
        <p>Hỗ trợ xe tải ghép chuyến giao hàng và lắp đặt toàn quốc. Cung cấp địa chỉ, đường tiếp cận và điều kiện nâng hạ. Chi phí và thời gian giao nhận được xác nhận trong báo giá hoặc hợp đồng.</p>
      </div>
      <div className="tp-ground tp-rv" style={{ ['--i' as string]: 1 }}>
        <h3>Vùng đất trũng, nước ngầm</h3>
        <ol className="tp-order-list">{groundSteps.map(text => <li key={text}>{text}</li>)}</ol>
      </div>
    </div></section>

    <section className="tp-section tp-warranty-teaser" id="bao-hanh"><div className="tp-wrap tp-teaser-inner tp-rv">
      <ShieldCheck size={32} aria-hidden="true"/>
      <div><h2>Bảo hành đến 10 năm</h2><p>Thời hạn tùy dòng sản phẩm, ghi trong hợp đồng.</p></div>
      <Link href="/chinh-sach-bao-hanh" className="tp-btn tp-btn-ghost">Xem chính sách <ArrowUpRight size={18} aria-hidden="true"/></Link>
    </div></section>
  </main>;
}
