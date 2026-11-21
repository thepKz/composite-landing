import Link from 'next/link';
import { ArrowUpRight, Cookie, ListChecks, ShieldCheck, UserRoundCheck } from 'lucide-react';
import PageHero from '@/components/pages/page-hero';
import Reveal from '@/components/pages/reveal';
import '@/components/pages/pages.css';
import '../secondary-pages.css';

export const metadata = { title: 'Chính sách bảo mật', description: 'Thành Lợi dùng họ tên, số điện thoại và nhu cầu sản phẩm trong biểu mẫu để liên hệ tư vấn. Biểu mẫu không đăng công khai thông tin của bạn.', alternates: { canonical: '/chinh-sach-bao-mat' } };

const sections = [
  { id: 'thu-thap', icon: ListChecks, title: 'Thông tin thu thập', text: 'Khi gửi biểu mẫu, bạn cung cấp họ tên, số điện thoại và nhu cầu sản phẩm để Thành Lợi liên hệ tư vấn.' },
  { id: 'muc-dich', icon: ShieldCheck, title: 'Mục đích sử dụng', text: 'Thông tin được lưu trong hệ thống quản trị và dùng để tiếp nhận, trao đổi và xử lý yêu cầu. Biểu mẫu không đăng công khai thông tin của bạn.' },
  { id: 'quyen', icon: UserRoundCheck, title: 'Quyền kiểm soát thông tin', text: 'Bạn có thể yêu cầu điều chỉnh hoặc xóa thông tin khi trao đổi với Thành Lợi. Chỉ cung cấp thông tin cần thiết, không gửi mật khẩu, thông tin thanh toán hoặc dữ liệu nhạy cảm trong nội dung tư vấn.' },
  { id: 'cookie', icon: Cookie, title: 'Cookie', text: 'Khu vực quản trị dùng cookie phiên để duy trì đăng nhập. Website không tích hợp công cụ quảng cáo hoặc theo dõi hành vi trong phiên bản này.' },
];

export default function Privacy() {
  return <main id="main" className="public-page tp tp-privacy">
    <Reveal/>
    <PageHero tone="paper" crumbs={[{ label: 'Trang chủ', href: '/' }, { label: 'Chính sách bảo mật' }]} title="Chính sách bảo mật" lead="Thông tin cá nhân và yêu cầu tư vấn của bạn."/>
    <section className="tp-section"><div className="tp-wrap tp-privacy-grid">
      <nav className="tp-toc tp-rv" aria-label="Mục lục"><p>Nội dung</p>{sections.map(item => <a key={item.id} href={`#${item.id}`}>{item.title}</a>)}</nav>
      <div className="tp-privacy-list">
        {sections.map((item, i) => <article id={item.id} className="tp-privacy-item tp-rv" style={{ ['--i' as string]: i }} key={item.id}><item.icon size={28} aria-hidden="true"/><div><h2>{item.title}</h2><p>{item.text}</p></div></article>)}
        <p className="tp-privacy-ask tp-rv">Cần điều chỉnh hoặc xóa thông tin, hãy <Link href="/lien-he#gui-yeu-cau">liên hệ Thành Lợi <ArrowUpRight size={16} aria-hidden="true"/></Link></p>
      </div>
    </div></section>
  </main>;
}
