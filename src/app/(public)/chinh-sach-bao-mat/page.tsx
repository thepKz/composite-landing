import Link from 'next/link';
import { ArrowUpRight, Cookie, ListChecks, ShieldCheck, UserRoundCheck } from 'lucide-react';
import { FlowSection, Pattern, Stack } from '@/components/decor';
import FlowHero from '@/components/pages/flow-hero';
import FlowCta from '@/components/pages/flow-cta';
import Reveal from '@/components/pages/reveal';
import '@/components/pages/pages.css';
import '@/components/pages/pages-v4.css';
import '../secondary-pages.css';
import '@/components/pages/pages-v5.css';

export const metadata = { title: 'Chính sách bảo mật', description: 'Thành Lợi dùng họ tên, số điện thoại và nhu cầu sản phẩm trong biểu mẫu để liên hệ tư vấn. Biểu mẫu không đăng công khai thông tin của quý khách.', alternates: { canonical: '/chinh-sach-bao-mat' } };

const sections = [
  { id: 'thu-thap', icon: ListChecks, title: 'Thông tin thu thập', text: 'Họ tên, số điện thoại và nhu cầu sản phẩm quý khách điền trong biểu mẫu, để liên hệ tư vấn.' },
  { id: 'muc-dich', icon: ShieldCheck, title: 'Mục đích sử dụng', text: 'Thông tin được lưu trong hệ thống quản trị và dùng để tiếp nhận, trao đổi và xử lý yêu cầu. Biểu mẫu không đăng công khai thông tin của quý khách.' },
  { id: 'quyen', icon: UserRoundCheck, title: 'Quyền kiểm soát thông tin', text: 'Quý khách có thể yêu cầu điều chỉnh hoặc xóa thông tin khi trao đổi với Thành Lợi. Chỉ cung cấp thông tin cần thiết, không gửi mật khẩu, thông tin thanh toán hoặc dữ liệu nhạy cảm trong nội dung tư vấn.' },
  { id: 'cookie', icon: Cookie, title: 'Cookie', text: 'Khu vực quản trị dùng cookie phiên để duy trì đăng nhập. Website không tích hợp công cụ quảng cáo hoặc theo dõi hành vi trong phiên bản này.' },
];

export default function Privacy() {
  return <main id="main" className="public-page tp tp-privacy tp4">
    <Reveal/>
    <FlowHero tone="forest" crumbs={[{ label: 'Trang chủ', href: '/' }, { label: 'Chính sách bảo mật' }]}
      title="Biểu mẫu chỉ dùng thông tin để liên hệ tư vấn"
      lead="Họ tên, số điện thoại và nhu cầu sản phẩm được lưu trong hệ thống quản trị, không đăng công khai."
      visual={<Stack pattern={{ kind: 'ripple', blend: 'screen', opacity: 0.55 }} floatAt="br">
        <div className="pf tp5-plain" style={{ aspectRatio: '4 / 3' }}>
          <div className="tp4-plain"><ShieldCheck className="tp4-plain__art is-icon" strokeWidth={1.25} aria-hidden="true"/></div>
        </div>
      </Stack>}/>
    <FlowSection tone="light" top="dome" className="tp4-privacy-body" decor={<Pattern kind="paper" fade="both" opacity={0.85}/>}>
      <div className="tp4-privacy">
        <nav className="tp4-toc tp-rv" aria-label="Mục lục">{sections.map(item => <a key={item.id} href={`#${item.id}`}>{item.title}</a>)}</nav>
        <div className="tp4-privacy__list">
          {sections.map((item, i) => <article id={item.id} className="tp-rv" style={{ ['--i' as string]: i }} key={item.id}><span className="tp4-badge-ico"><item.icon size={26} aria-hidden="true"/></span><div><h2>{item.title}</h2><p>{item.text}</p></div></article>)}
        </div>
      </div>
    </FlowSection>
    <FlowCta title="Cần điều chỉnh hoặc xóa thông tin" text="Trao đổi trực tiếp với Thành Lợi để điều chỉnh hoặc xóa thông tin của quý khách." label="Liên hệ Thành Lợi"/>
  </main>;
}
