import Link from 'next/link';
import { ArrowUpRight, BadgeCheck, ClipboardCheck, Eye, HeartHandshake, Lightbulb, Layers, Rocket, Shapes, Sparkles, ShieldCheck, Waypoints } from 'lucide-react';
import { facts, metrics } from '@/lib/site-facts';
import { editorialAssets } from '@/lib/customer-product-assets';
import PageHero from '@/components/pages/page-hero';
import Reveal from '@/components/pages/reveal';
import '@/components/pages/pages.css';
import '../secondary-pages.css';

export const metadata = {
  title: 'Giới thiệu Thành Lợi Composite',
  description: 'Thành Lợi Composite sản xuất bể biogas, bể phốt, bể thủy sản và bồn bể composite FRP tại Phú Thọ từ năm 2010.',
  alternates: { canonical: '/gioi-thieu' },
};

const milestones = [
  { year: '2010', text: 'Thành lập tại Phú Thọ, cửa ngõ vùng trung du và miền núi phía Bắc.' },
  { year: '15+ năm', text: 'Chuẩn hóa quy trình, mở rộng xưởng tại Khu Tiên Sơn, xã Tiên Lương.' },
  { year: '25+ tỉnh', text: 'Sản phẩm có mặt ở nông hộ, trang trại, nhà máy và dự án đô thị.' },
];

const values = [
  { icon: ShieldCheck, title: 'Chữ tín làm gốc', text: 'Đúng độ dày vật liệu, đúng loại nhựa, đúng dung tích, đúng tiến độ đã thỏa thuận.' },
  { icon: BadgeCheck, title: 'Chất lượng làm nền tảng', text: 'Không pha tạp chất làm giảm cơ tính. Thử kín nước, kín khí trước khi xuất xưởng.' },
  { icon: HeartHandshake, title: 'Tận tâm phục vụ', text: 'Tư vấn đúng và đủ theo quy mô thực tế để tiết kiệm chi phí cho khách hàng.' },
  { icon: Lightbulb, title: 'Đổi mới và sáng tạo', text: 'Cải tiến khuôn mẫu và công nghệ gia công cho bề mặt đẹp, chịu lực tốt, dễ vận chuyển.' },
];

const zones = [
  { icon: Shapes, name: 'Chế tạo khuôn mẫu' },
  { icon: Layers, name: 'Đắp tay và phun sợi' },
  { icon: Waypoints, name: 'Quấn sợi bồn công nghiệp' },
  { icon: Sparkles, name: 'Hoàn thiện bề mặt' },
  { icon: ClipboardCheck, name: 'Kiểm định chất lượng' },
];

const qc = [
  { title: 'Nguyên liệu đầu vào', text: 'Kiểm tra nhựa nền và sợi thủy tinh trước khi đưa vào sản xuất.' },
  { title: 'Độ dày từng lớp', text: 'Giám sát lớp lót chống thấm và lớp kết cấu chịu lực.' },
  { title: 'Hình học và độ kín', text: 'Đo kích thước, độ cứng Barcol, thử kín nước hoặc kín khí sau khi tháo khuôn.' },
  { title: 'Nghiệm thu công trình', text: 'Cùng chủ đầu tư kiểm tra thực tế ngay tại chân công trình.' },
];

const fields = [
  { label: 'Chăn nuôi', href: '/san-pham/be-biogas-composite' },
  { label: 'Thủy sản', href: '/san-pham/be-nuoi-trong-thuy-san' },
  { label: 'Xử lý nước thải', href: '/san-pham/be-phot-va-xu-ly-nuoc-thai' },
  { label: 'Hóa chất', href: '/san-pham/bon-chua-hoa-chat' },
  { label: 'Vệ sinh đô thị', href: '/san-pham/xe-gom-rac' },
  { label: 'Theo yêu cầu', href: '/san-pham/composite-theo-yeu-cau' },
];

export default function AboutPage() {
  const hero = editorialAssets.story;
  const field = editorialAssets.hero;
  const shop = editorialAssets.fit;
  return <main id="main" className="public-page tp tp-about">
    <Reveal/>
    <PageHero tone="forest" crumbs={[{ label: 'Trang chủ', href: '/' }, { label: 'Giới thiệu' }]} title="Về Thành Lợi" lead="Sản xuất composite FRP tại Phú Thọ từ năm 2010." image={hero}>
      <Link href="/lien-he#gui-yeu-cau" className="tp-btn tp-btn-cta">Nhận báo giá <ArrowUpRight size={18} aria-hidden="true"/></Link>
      <Link href="/san-pham" className="tp-btn tp-btn-ghost-light">Xem sản phẩm</Link>
    </PageHero>

    <section className="tp-metrics" aria-label="Số liệu nổi bật"><div className="tp-wrap tp-metrics-grid">
      {metrics.map((metric, i) => <div className="tp-metric tp-rv" style={{ ['--i' as string]: i }} key={metric.label}>
        <p className="tp-metric-value">{metric.value}<span>{metric.unit}</span></p>
        <p className="tp-metric-label">{metric.label}</p>
      </div>)}
    </div></section>

    <section className="tp-section tp-story"><div className="tp-wrap tp-story-grid">
      <div className="tp-rv">
        <h2>Đi tìm vật liệu không nứt, không thấm, không gỉ</h2>
        <p className="tp-statement">Thành Lợi khởi đầu từ nhu cầu thay bê tông xây gạch hay nứt thấm và kim loại hay gỉ sét trong môi trường khắc nghiệt.</p>
        <p>Mỗi bể xuất xưởng đều qua khảo sát thực tế, tính độ dày kết cấu và chọn nhựa nền Polyester hoặc Vinyl Ester theo từng khách hàng.</p>
        <ol className="tp-timeline">
          {milestones.map(item => <li key={item.year}><strong>{item.year}</strong><span>{item.text}</span></li>)}
        </ol>
      </div>
      <figure className="tp-story-photo tp-rv" style={{ ['--i' as string]: 1 }}>
        <img src={field.src} alt={field.alt} width={field.width} height={field.height} loading="lazy"/>
        <figcaption>{field.label}</figcaption>
      </figure>
    </div></section>

    <section className="tp-purpose"><div className="tp-wrap tp-purpose-grid">
      <article className="tp-rv"><Eye size={32} aria-hidden="true"/><h2>Tầm nhìn</h2><p>Trở thành thương hiệu sản xuất và gia công composite FRP được tin dùng hàng đầu Việt Nam, đưa vật liệu bền vững vào môi trường, nông nghiệp tuần hoàn và công nghiệp hiện đại.</p></article>
      <article className="tp-rv" style={{ ['--i' as string]: 1 }}><Rocket size={32} aria-hidden="true"/><h2>Sứ mệnh</h2><p>Cung cấp thiết bị composite bền trên 30 năm, tối ưu chi phí dài hạn, đồng hành kỹ thuật từ khảo sát, thiết kế đến lắp đặt và bảo hành.</p></article>
    </div></section>

    <section className="tp-section tp-values"><div className="tp-wrap">
      <div className="tp-section-head tp-rv"><h2>Bốn giá trị cốt lõi</h2></div>
      <div className="tp-values-grid">
        {values.map((value, i) => <article className="tp-value tp-rv" style={{ ['--i' as string]: i }} key={value.title}><value.icon size={30} aria-hidden="true"/><h3>{value.title}</h3><p>{value.text}</p></article>)}
      </div>
    </div></section>

    <section className="tp-section tp-capacity"><div className="tp-wrap">
      <div className="tp-capacity-top">
        <figure className="tp-capacity-photo tp-rv"><img src={shop.src} alt={shop.alt} width={shop.width} height={shop.height} loading="lazy"/><figcaption>{shop.label}</figcaption></figure>
        <div className="tp-rv" style={{ ['--i' as string]: 1 }}>
          <h2>Nhà máy phân khu rõ ràng</h2>
          <p>Xưởng tại {facts.address} có năm khu chức năng đi theo dòng chảy sản xuất.</p>
          <h3>Nguyên vật liệu tuyển chọn</h3>
          <ul className="tp-pill-list">
            <li>Nhựa Polyester không no</li><li>Nhựa Isophthalic</li><li>Nhựa Vinyl Ester</li><li>Sợi thủy tinh Mat</li><li>Sợi Woven Roving</li>
          </ul>
          <p>Nhựa nền chính phẩm kết hợp sợi thủy tinh nhập khẩu, kháng tia UV, kháng axit, kiềm và chịu lực cơ học tốt.</p>
        </div>
      </div>
      <ol className="tp-zones" aria-label="Các khu trong nhà máy">
        {zones.map((zone, i) => <li className="tp-zone tp-rv" style={{ ['--i' as string]: i }} key={zone.name}><span className="tp-zone-icon"><zone.icon size={24} aria-hidden="true"/></span><strong>{zone.name}</strong></li>)}
      </ol>
    </div></section>

    <section className="tp-qc"><div className="tp-wrap">
      <div className="tp-section-head tp-rv"><h2>Chất lượng qua bốn bước</h2></div>
      <ol className="tp-qc-flow">
        {qc.map((step, i) => <li className="tp-qc-step tp-rv" style={{ ['--i' as string]: i }} key={step.title}>
          <span className="tp-qc-no" aria-hidden="true">{i + 1}</span>
          <h3>{step.title}</h3>
          <p>{step.text}</p>
        </li>)}
      </ol>
    </div></section>

    <section className="tp-fields"><div className="tp-wrap tp-fields-grid">
      <h2 className="tp-rv">Lĩnh vực ứng dụng</h2>
      <nav className="tp-fields-links" aria-label="Lĩnh vực ứng dụng">
        {fields.map((item, i) => <Link key={item.label} href={item.href} className="tp-rv" style={{ ['--i' as string]: i }}>{item.label}<ArrowUpRight size={20} aria-hidden="true"/></Link>)}
      </nav>
    </div></section>

  </main>;
}
