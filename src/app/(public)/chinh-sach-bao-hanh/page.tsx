import Link from 'next/link';
import { ArrowUpRight, FileText, Ruler, Wrench, ScrollText } from 'lucide-react';
import PageHero from '@/components/pages/page-hero';
import Reveal from '@/components/pages/reveal';
import '@/components/pages/pages.css';
import '../secondary-pages.css';

export const metadata = { title: 'Chính sách bảo hành', description: 'Bảo hành đến 10 năm tùy dòng sản phẩm composite Thành Lợi. Thông số ghi trong hợp đồng, bể va đập có thể sửa chữa tại chỗ.', alternates: { canonical: '/chinh-sach-bao-hanh' } };

const points = [
  { icon: FileText, title: 'Thông số ghi trong hợp đồng', text: 'Độ dày thành bồn, loại nhựa Polyester hoặc Vinyl Ester và trọng lượng tiêu chuẩn đều ghi rõ trong hợp đồng.' },
  { icon: Ruler, title: 'Kiểm tra được khi nhận hàng', text: 'Bạn có thể kiểm tra tại xưởng hoặc đo độ dày thực tế khi nghiệm thu.' },
  { icon: Wrench, title: 'Sửa chữa được khi va đập', text: 'Kỹ thuật viên mài nhám và đắp vá bằng sợi thủy tinh và nhựa nền tại chỗ. Vị trí gia cố đóng rắn liền khối.' },
  { icon: ScrollText, title: 'Chi tiết theo hợp đồng', text: 'Thời hạn, phạm vi và điều kiện bảo hành của từng đơn hàng được xác nhận trong báo giá hoặc hợp đồng.' },
];

export default function WarrantyPage() {
  return <main id="main" className="public-page tp tp-warranty">
    <Reveal/>
    <PageHero tone="teal" crumbs={[{ label: 'Trang chủ', href: '/' }, { label: 'Chính sách bảo hành' }]} title="Chính sách bảo hành"
      aside={<p className="tp-hero-count" aria-label="Bảo hành đến 10 năm"><strong>10</strong><span>năm bảo hành tối đa</span></p>}/>
    <section className="tp-section"><div className="tp-wrap">
      <div className="tp-section-head tp-rv"><h2 className="tp-sr">Điều bạn cần biết</h2></div>
      <div className="tp-warranty-grid">
        {points.map((point, i) => <article className="tp-value tp-rv" style={{ ['--i' as string]: i }} key={point.title}><point.icon size={30} aria-hidden="true"/><h3>{point.title}</h3><p>{point.text}</p></article>)}
      </div>
    </div></section>
    <section className="tp-section tp-support"><div className="tp-wrap tp-support-grid tp-rv">
      <div><h2>Khi cần hỗ trợ bảo hành</h2><p>Chuẩn bị thông tin đơn hàng, ảnh tình trạng sản phẩm và mô tả điều kiện sử dụng để kỹ thuật xử lý nhanh hơn.</p></div>
      <Link href="/lien-he#gui-yeu-cau" className="tp-btn tp-btn-cta">Nhận báo giá <ArrowUpRight size={18} aria-hidden="true"/></Link>
    </div></section>
  </main>;
}
