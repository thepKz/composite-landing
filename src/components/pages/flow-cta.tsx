import Link from 'next/link';
import { ArrowUpRight, Phone } from 'lucide-react';
import { FlowSection, Pattern } from '@/components/decor';
import type { FlowEdge } from '@/components/decor';
import { contact } from '@/lib/content';
import './pages-v4.css';

/** Lời kêu gọi cuối trang vòng bốn. Nền xanh đen cùng màu chân trang nên hai khối liền nhau, mép trên cong. */
export default async function FlowCta({ title = 'Kỹ sư chốt dung tích từ quy mô sử dụng thực tế', text = 'Gửi quy mô sử dụng, Thành Lợi báo giá trong 15 – 60 phút kể từ khi nhận đủ thông tin.', href = '/lien-he#gui-yeu-cau', top = 'arc', label = 'Nhận báo giá' }: { title?: string; text?: string; href?: string; top?: FlowEdge; label?: string }) {
  const hotline = (await contact()).hotlines[0];
  return <FlowSection tone="dark" top={top} className="tp4-cta"
    decor={<>
      <Pattern kind="weave" fade="top" opacity={0.2}/>
      <Pattern kind="ripple" size="clamp(240px,30vw,460px)" bottom="-30%" left="-6%" opacity={0.5} blend="screen"/>
    </>}>
    <div className="tp4-cta__row tp-rv">
      <div><h2>{title}</h2><p>{text}</p></div>
      <div className="tp4-actions">
        <Link href={href} className="tp-btn tp-btn-cta">{label} <ArrowUpRight size={18} aria-hidden="true"/></Link>
        <a href={`tel:${hotline.tel}`} className="tp-btn tp-btn-ghost-light"><Phone size={18} aria-hidden="true"/>{hotline.display}</a>
      </div>
    </div>
  </FlowSection>;
}
