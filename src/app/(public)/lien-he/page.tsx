import { isDemoMode } from '@/lib/demo-mode';
import Link from 'next/link';
import { Building2, Clock, Hash, Mail, MapPin, MessageCircle, Phone, ArrowUpRight } from 'lucide-react';
import InquiryForm from '@/components/inquiry-form';
import PageHero from '@/components/pages/page-hero';
import Reveal from '@/components/pages/reveal';
import { company } from '@/lib/content';
import { facts } from '@/lib/site-facts';
import { resolveContact } from '@/lib/contact-info';
import '@/components/pages/pages.css';
import '../secondary-pages.css';

export const metadata = {
  title: 'Liên hệ tư vấn và báo giá',
  description: 'Gửi quy mô chăn nuôi, số người dùng hoặc kích thước bể. Kỹ sư Thành Lợi Composite tư vấn dung tích và báo giá trong 15 – 60 phút.',
  alternates: { canonical: '/lien-he' },
};

const digits = (value: string) => value.replace(/[\s.()-]/g, '');

export default async function ContactPage() {
  const info = await company();
  const { hotlines, zalo, email, address, hours } = resolveContact(info);
  const validZalo = /^(?:0\d{9,10}|84\d{9,10})$/.test(zalo);
  const mapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${facts.shortName} ${address}`)}`;
  return <main id="main" className="public-page tp tp-contact">
    <Reveal/>
    <PageHero tone="forest" crumbs={[{ label: 'Trang chủ', href: '/' }, { label: 'Liên hệ' }]} title="Liên hệ và báo giá" lead="Cho biết quy mô chăn nuôi, số người dùng hoặc kích thước bể cá. Kỹ sư tư vấn đúng dung tích và báo giá trong 15 – 60 phút.">
      <a href={`tel:${hotlines[0].tel}`} className="tp-btn tp-btn-cta"><Phone size={18} aria-hidden="true"/>{hotlines[0].display}</a>
      {validZalo && <a href={`https://zalo.me/${zalo.replace(/^\+/, '')}`} target="_blank" rel="noopener noreferrer" className="tp-btn tp-btn-ghost-light"><MessageCircle size={18} aria-hidden="true"/>Nhắn Zalo</a>}
    </PageHero>

    <section className="tp-contact-section" id="gui-yeu-cau"><div className="tp-wrap tp-contact-grid">
      <div className="tp-contact-info">
        <h2 className="tp-sr">Thông tin liên hệ</h2>
        <div className="tp-hotline tp-rv">
          <p><Phone size={20} aria-hidden="true"/>Hotline và Zalo tư vấn</p>
          {hotlines.map(item => <a key={item.tel} href={`tel:${item.tel}`}>{item.display}</a>)}
        </div>
        <ul className="tp-info-list">
          <li className="tp-info tp-rv"><Mail size={22} aria-hidden="true"/><div><span className="tp-sr">Email</span><a href={`mailto:${email}`}>{email}</a></div></li>
          <li className="tp-info tp-rv" style={{ ['--i' as string]: 1 }}><MapPin size={22} aria-hidden="true"/><div><span className="tp-sr">Nhà máy và trụ sở</span><p>{address}</p></div></li>
          <li className="tp-info tp-rv" style={{ ['--i' as string]: 2 }}><Clock size={22} aria-hidden="true"/><div><span className="tp-sr">Giờ làm việc</span><p>{hours}</p></div></li>
          <li className="tp-info tp-rv" style={{ ['--i' as string]: 3 }}><Building2 size={22} aria-hidden="true"/><div><span className="tp-sr">Đơn vị</span><p>{facts.legalName}</p></div></li>
          <li className="tp-info tp-rv" style={{ ['--i' as string]: 4 }}><Hash size={22} aria-hidden="true"/><div><p className="is-wide">Mã số thuế {facts.taxCode}</p></div></li>
        </ul>
      </div>
      <div className="tp-contact-form tp-rv">
        <InquiryForm demo={isDemoMode()} hours={hours} hotlineTel={hotlines[0].tel}/>
      </div>
    </div></section>

    <section className="tp-map-section"><div className="tp-wrap">
      <div className="tp-section-head tp-rv"><h2 className="tp-sr">Vị trí nhà máy</h2><Link href={mapLink} target="_blank" rel="noopener noreferrer" className="tp-text-link">Mở Google Maps <ArrowUpRight size={18} aria-hidden="true"/></Link></div>
      <figure className="tp-map-frame tp-rv">
        <MapPin className="tp-map-ghost" size={48} aria-hidden="true"/>
        <iframe src={facts.mapEmbed} tabIndex={-1} title="Bản đồ nhà máy Thành Lợi Composite" loading="lazy" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen/>
      </figure>
    </div></section>
  </main>;
}
