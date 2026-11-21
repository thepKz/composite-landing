import Link from 'next/link';
import { ArrowUpRight, Clock, Mail, MapPin, Phone } from 'lucide-react';
import { company, products } from '@/lib/content';
import { productGroups } from '@/lib/product-groups';
import { footerLabel } from '@/lib/nav-labels';
import { facts } from '@/lib/site-facts';
import { resolveContact } from '@/lib/contact-info';
import FooterMap from './footer-map';

const quick = [
  ['/', 'Trang chủ'],
  ['/gioi-thieu', 'Giới thiệu'],
  ['/san-pham', 'Sản phẩm'],
  ['/du-an', 'Dự án tiêu biểu'],
  ['/tin-tuc', 'Tin tức'],
  ['/lien-he', 'Liên hệ'],
] as const;

export default async function SiteFooter() {
  const [info, items] = await Promise.all([company(), products()]);
  const { address, email, zalo, hotlines, hours } = resolveContact(info);
  return <footer className="tl-footer">
    <div className="container tl-footer-cta">
      <div>
        <h2>Cần báo giá nhanh</h2>
        <p>Gửi nhu cầu, kỹ sư Thành Lợi phản hồi trong 15 đến 60 phút.</p>
      </div>
      <Link href="/lien-he#gui-yeu-cau" className="tl-footer-button pressable">Nhận báo giá<ArrowUpRight size={20} aria-hidden="true" /></Link>
    </div>
    <div className="container tl-footer-grid">
      <div className="tl-footer-about">
        <Link href="/" className="tl-footer-brand" aria-label="Thành Lợi Composite, về trang chủ">
          <img src="/images/thanh-loi-logo.png" alt="" width="48" height="48" loading="lazy" />
          <span>THÀNH LỢI<small>COMPOSITE</small></span>
        </Link>
        <p>Nhà máy tại Phú Thọ, sản xuất và gia công composite FRP từ năm {facts.founded}.</p>
        <div className="tl-footer-social">
          <a href={facts.facebook} target="_blank" rel="noopener noreferrer" className="pressable">Facebook</a>
          <a href={facts.tiktok} target="_blank" rel="noopener noreferrer" className="pressable">TikTok</a>
          <a href={`https://zalo.me/${zalo}`} target="_blank" rel="noopener noreferrer" className="pressable">Zalo</a>
        </div>
      </div>
      <nav aria-label="Sản phẩm chủ lực"><h3 className="tl-sr">Sản phẩm chủ lực</h3>{productGroups(items).map(group => <Link key={group.slug} href={`/san-pham/${group.slug}`}>{footerLabel(group.slug, group.name)}</Link>)}</nav>
      <nav aria-label="Chính sách và hỗ trợ"><h3 className="tl-sr">Hỗ trợ</h3>
        <Link href="/huong-dan-dat-hang">Cách đặt hàng</Link>
        <Link href="/hoi-dap">Hỏi đáp</Link>
        <Link href="/chinh-sach-bao-hanh">Bảo hành</Link>
        <Link href="/chinh-sach-bao-mat">Bảo mật</Link>
      </nav>
      <div className="tl-footer-contact">
        <h3 className="tl-sr">Liên hệ</h3>
        <p><MapPin size={18} aria-hidden="true" /><span>Nhà máy: {address}</span></p>
        <p><Phone size={18} aria-hidden="true" /><span>{hotlines.map((line, index) => <span key={line.tel}>{index > 0 && ', '}<a href={`tel:${line.tel}`}>{line.display}</a></span>)}</span></p>
        <p><Mail size={18} aria-hidden="true" /><a href={`mailto:${email}`}>{email}</a></p>
        <p><Clock size={18} aria-hidden="true" /><span>{hours}</span></p>
        <FooterMap src={facts.mapEmbed} address={address} title="Bản đồ nhà máy Thành Lợi Composite" />
      </div>
    </div>
    <div className="container tl-footer-bottom">
      <span>© {new Date().getFullYear()} {facts.legalName}. Mã số thuế: {facts.taxCode}. Bảo lưu mọi quyền.</span>
      <div><Link href="/chinh-sach-bao-mat">Chính sách bảo mật</Link><Link href="/chinh-sach-bao-hanh">Chính sách bảo hành</Link><Link href="/admin">Quản trị</Link></div>
    </div>
  </footer>;
}
