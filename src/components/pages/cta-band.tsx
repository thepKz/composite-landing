import Link from 'next/link';
import { ArrowUpRight, Phone } from 'lucide-react';
import { contact } from '@/lib/content';

// Lời kêu gọi cuối trang, dùng chung cho mọi trang phụ: một nút cam báo giá, một nút gọi.
export default async function CtaBand({ title = 'Cần chọn đúng dung tích?', text = 'Gửi quy mô sử dụng, kỹ sư báo giá trong 15 – 60 phút.', href = '/lien-he#gui-yeu-cau' }: { title?: string; text?: string; href?: string }) {
  const hotline = (await contact()).hotlines[0];
  return <section className="tp-cta-band"><div className="tp-wrap tp-cta-inner tp-rv">
    <div><h2>{title}</h2><p>{text}</p></div>
    <div className="tp-cta-actions">
      <Link href={href} className="tp-btn tp-btn-cta">Nhận báo giá <ArrowUpRight size={18} aria-hidden="true"/></Link>
      <a href={`tel:${hotline.tel}`} className="tp-btn tp-btn-ghost-light"><Phone size={18} aria-hidden="true"/>{hotline.display}</a>
    </div>
  </div></section>;
}
