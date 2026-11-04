import Link from 'next/link';
import { editorialAssets } from '@/lib/customer-product-assets';
import { ArrowUpRight } from 'lucide-react';
import { company, products } from '@/lib/content';
import { productGroups } from '@/lib/product-groups';

export default async function SiteFooter() {
  const [info, items] = await Promise.all([company(), products()]);
  const phone = info?.phone?.replace(/[\s.()-]/g, '');
  const validPhone = phone && /^(?:0\d{9}|\+84\d{9})$/.test(phone);
  const email = info?.email?.trim();
  const validEmail = email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  return <footer className="site-footer">
    <div className="container footer-finale">
      <div>
        <Link href="/" className="footer-signature" aria-label="Thành Lợi Composite - Trang chủ"><span>Thành Lợi</span><span>Composite.</span></Link>
        <p>Sản xuất bồn bể và sản phẩm composite theo yêu cầu.</p>
      </div>
      <img className="footer-workshop" src={editorialAssets.footer.src} alt={editorialAssets.footer.alt} loading="lazy" width="1280" height="960"/>
    </div>
    <div className="container footer-grid footer-directory">
      <div><Link href="/lien-he#gui-yeu-cau" className="footer-inquiry">Liên hệ tư vấn và báo giá <ArrowUpRight size={24}/></Link><p>Công ty Cổ phần Thành Lợi Composite</p><p>Mã số thuế: 2600665401</p><p>{info?.address || 'Khu Tiên Sơn, xã Tiên Lương, tỉnh Phú Thọ'}</p>{validPhone && <a href={`tel:${phone}`}>{info?.phone}</a>}{validEmail && <a href={`mailto:${email}`}>{email}</a>}<div className="footer-social"><a href="https://www.facebook.com/thanhloicompositevn/" target="_blank" rel="noopener noreferrer">Facebook</a><a href="https://www.tiktok.com/@thnh.li.composite" target="_blank" rel="noopener noreferrer">TikTok</a></div></div>
      <nav aria-label="Thông tin công ty"><h3>Công ty</h3><Link href="/">Trang chủ</Link><Link href="/gioi-thieu">Về chúng tôi</Link><Link href="/du-an">Dự án</Link><Link href="/tin-tuc">Tin tức & kiến thức</Link><Link href="/lien-he">Liên hệ</Link></nav>
      <nav aria-label="Danh mục ở chân trang"><h3>Sản phẩm</h3>{productGroups(items).map(item => <Link key={item.slug} href={`/san-pham/${item.slug}`}>{item.name}</Link>)}</nav>
      <nav aria-label="Hỗ trợ khách hàng"><h3>Hỗ trợ</h3><Link href="/huong-dan-dat-hang">Quy trình đặt hàng</Link><Link href="/huong-dan-dat-hang#van-chuyen">Vận chuyển & lắp đặt</Link><Link href="/huong-dan-dat-hang#bao-hanh">Thông tin bảo hành</Link><Link href="/chinh-sach-bao-mat">Chính sách bảo mật</Link><Link href="/lien-he#gui-yeu-cau">Nhận báo giá</Link></nav>
    </div>
    <div className="container footer-bottom"><span>© {new Date().getFullYear()} {info?.name || 'Thành Lợi Composite'}</span><Link href="/chinh-sach-bao-mat">Chính sách bảo mật</Link><Link href="/admin">Quản trị</Link></div>
  </footer>;
}
