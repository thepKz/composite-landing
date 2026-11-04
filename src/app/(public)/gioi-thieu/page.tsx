import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { company } from '@/lib/content';
import { editorialAssets } from '@/lib/customer-product-assets';
import '../secondary-pages.css';

export const metadata = {
  title: 'Giới thiệu Thành Lợi',
  description: 'Tìm hiểu các dòng bồn bể composite Thành Lợi và cách trao đổi quy cách theo nhu cầu sử dụng.',
  alternates: { canonical: '/gioi-thieu' },
};

export default async function AboutPage() {
  const info = await company();
  const photo = editorialAssets.story;
  return <main id="main" className="public-page secondary-page about-page">
    <section className="page-intro"><div className="container">
      <nav className="breadcrumb" aria-label="Đường dẫn"><Link href="/">Trang chủ</Link><span aria-hidden="true">/</span><span aria-current="page">Giới thiệu</span></nav>
      <h1>Về Thành Lợi Composite</h1>
      <p>Sản xuất composite tại Phú Thọ từ năm 2010. Tạo hình sản phẩm theo nhu cầu sử dụng.</p>
    </div></section>
    <section className="section container about-layout secondary-about">
      <figure><img src={photo.src} alt={photo.alt} width={photo.width} height={photo.height}/></figure>
      <div><h2>Sản xuất bồn bể và sản phẩm composite</h2>
        <p>Bể cho chăn nuôi, thủy sản, môi trường hay sản xuất đều có yêu cầu riêng. Thành Lợi trao đổi mục đích sử dụng, kích thước và nơi lắp đặt trước khi thống nhất quy cách.</p>
        <Link href="/san-pham" className="button">Xem các dòng sản phẩm <ArrowUpRight size={18}/></Link>
        <details className="secondary-disclosure"><summary>Thông tin công ty</summary><div>
          <p>Công ty Cổ phần Thành Lợi Composite. Nhà máy tại Khu Tiên Sơn, xã Tiên Lương, tỉnh Phú Thọ. Mã số thuế: 2600665401.</p>
          {info?.description && <p>{info.description}</p>}
          <p>Chữ tín – Chất lượng – Tận tâm – Sáng tạo.</p>
        </div></details>
      </div>
    </section>
    <section className="secondary-fields"><div className="container"><h2>Các lĩnh vực ứng dụng</h2><nav aria-label="Ứng dụng composite">
      <Link href="/san-pham/be-biogas-composite">Chăn nuôi <ArrowUpRight size={20}/></Link>
      <Link href="/san-pham/be-nuoi-trong-thuy-san">Thủy sản <ArrowUpRight size={20}/></Link>
      <Link href="/san-pham/be-phot-va-xu-ly-nuoc-thai">Môi trường <ArrowUpRight size={20}/></Link>
      <Link href="/san-pham/composite-theo-yeu-cau">Tạo hình theo yêu cầu <ArrowUpRight size={20}/></Link>
    </nav></div></section>
    <section className="section container secondary-next"><h2>Đặt sản phẩm theo yêu cầu</h2><div><p>Gửi mục đích sử dụng và vị trí dự kiến. Anh/chị chưa cần có sẵn bản vẽ.</p><Link href="/lien-he#gui-yeu-cau" className="button">Nhận tư vấn <ArrowUpRight size={18}/></Link></div></section>
  </main>;
}
