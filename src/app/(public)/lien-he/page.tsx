import { isDemoMode } from '@/lib/demo-mode';
import Link from 'next/link';
import InquiryForm from '@/components/inquiry-form';
import { company } from '@/lib/content';
import '../secondary-pages.css';

export const metadata = {
  title: 'Liên hệ tư vấn & báo giá',
  description: 'Gửi nhu cầu bồn bể composite, kích thước dự kiến và địa điểm lắp đặt để Thành Lợi tư vấn và báo giá.',
  alternates: { canonical: '/lien-he' },
};

export default async function ContactPage() {
  const info = await company();
  const zalo = info?.zalo?.replace(/[^0-9]/g, '');
  const phone = info?.phone?.replace(/[\s.()-]/g, '');
  const validPhone = phone && /^(?:0\d{9}|\+84\d{9})$/.test(phone);
  const validZalo = zalo && /^(?:0\d{9}|84\d{9})$/.test(zalo);
  const validEmail = info?.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(info.email);
  return <main id="main" className="public-page secondary-page contact-page">
    <section className="page-intro"><div className="container">
      <nav className="breadcrumb" aria-label="Đường dẫn"><Link href="/">Trang chủ</Link><span aria-hidden="true">/</span><span aria-current="page">Liên hệ</span></nav>
      <h1>Bắt đầu từ nhu cầu của bạn.</h1>
      <p>Để lại thông tin. Thành Lợi sẽ trao đổi quy cách trước khi báo giá.</p>
    </div></section>
    <section className="contact-section" id="gui-yeu-cau"><div className="container contact-layout">
      <div className="contact-company"><h2>Thành Lợi Composite</h2>
        <p>Chưa có kích thước cụ thể? Anh/chị có thể mô tả cách sử dụng trong biểu mẫu.</p>
        <dl className="contact-details">
          <div><dt>Đơn vị</dt><dd>{info?.name || 'Thành Lợi Composite'}</dd></div>
          <div><dt>Mã số thuế</dt><dd>2600665401</dd></div>
          <div><dt>Địa điểm</dt><dd>{info?.address || 'Phú Thọ'}</dd></div>
          {validPhone && <div><dt>Điện thoại</dt><dd><a href={`tel:${phone}`}>{info?.phone}</a></dd></div>}
          {validEmail && <div><dt>Email</dt><dd><a href={`mailto:${info?.email}`}>{info?.email}</a></dd></div>}
          {validZalo && <div><dt>Zalo</dt><dd><a href={`https://zalo.me/${zalo}`} target="_blank" rel="noopener noreferrer">Trao đổi qua Zalo</a></dd></div>}
        </dl>
      </div>
      <InquiryForm demo={isDemoMode()}/>
    </div></section>
    <section className="container contact-map"><h2>Vị trí Thành Lợi Composite</h2><iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3712.4447580971832!2d104.9893577759779!3d21.4902923717653!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x313361007146b3f1%3A0xf4a42a90f4187fad!2zVGjDoG5oIEzhu6NpIENvbXBvc2l0ZQ!5e0!3m2!1svi!2s!4v1793708025019!5m2!1svi!2s" title="Bản đồ Thành Lợi Composite" width="1200" height="400" loading="lazy" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen/></section>
  </main>;
}
