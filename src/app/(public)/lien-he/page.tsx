import { isDemoMode } from '@/lib/demo-mode';
import Link from 'next/link';
import { Building2, Clock, Hash, Mail, MapPin, MessageCircle, Phone, ArrowUpRight } from 'lucide-react';
import InquiryForm from '@/components/inquiry-form';
import { FlowSection, Pattern, ShapeFrame, Stack, StackStat } from '@/components/decor';
import FlowHero from '@/components/pages/flow-hero';
import Reveal from '@/components/pages/reveal';
import { company } from '@/lib/content';
import { facts } from '@/lib/site-facts';
import { editorialAssets } from '@/lib/customer-product-assets';
import { variants } from '@/lib/trang-phu-media';
import { resolveContact } from '@/lib/contact-info';
import '@/components/pages/pages.css';
import '@/components/pages/pages-v4.css';
import '../secondary-pages.css';

export const metadata = {
  title: 'Liên hệ tư vấn và báo giá',
  description: 'Gửi quy mô chăn nuôi, số người dùng hoặc kích thước bể. Kỹ sư Thành Lợi Composite tư vấn dung tích và báo giá trong 15 – 60 phút.',
  alternates: { canonical: '/lien-he' },
};

export default async function ContactPage() {
  const info = await company();
  const { hotlines, zalo, email, address, hours } = resolveContact(info);
  const validZalo = /^(?:0\d{9,10}|84\d{9,10})$/.test(zalo);
  const mapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${facts.shortName} ${address}`)}`;
  const photo = editorialAssets.gallery[1];
  const mapFrame = (shape: 'capsule' | 'arch', ratio: number, cls: string) => <div className={`tp4-map ${cls}`}>
    <ShapeFrame shape={shape} ratio={ratio} outline="light" outlineOffset={12}>
      <MapPin className="tp-map-ghost" size={48} aria-hidden="true"/>
      <iframe src={facts.mapEmbed} tabIndex={-1} title={`Bản đồ nhà máy ${facts.shortName}`} loading="lazy" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen/>
    </ShapeFrame>
  </div>;
  return <main id="main" className="public-page tp tp-contact tp4">
    <Reveal/>
    <FlowHero tone="forest" crumbs={[{ label: 'Trang chủ', href: '/' }, { label: 'Liên hệ' }]}
      title="Kỹ sư Thành Lợi báo giá trong 15 – 60 phút"
      lead="Gửi quy mô sử dụng hoặc kích thước bể, kỹ sư tư vấn dung tích kèm báo giá."
      actions={<>
        <a href={`tel:${hotlines[0].tel}`} className="tp-btn tp-btn-cta"><Phone size={18} aria-hidden="true"/>{hotlines[0].display}</a>
        {validZalo && <a href={`https://zalo.me/${zalo.replace(/^\+/, '')}`} target="_blank" rel="noopener noreferrer" className="tp-btn tp-btn-ghost-light"><MessageCircle size={18} aria-hidden="true"/>Nhắn Zalo</a>}
      </>}
      visual={<Stack pattern={{ kind: 'ripple', blend: 'screen', opacity: 0.55 }} floatAt="bl" float={<StackStat value="15 – 60 phút" label="Thời gian báo giá" tone="light"/>}>
        <ShapeFrame shape="slant" ratio={1.45} outline="bronze" outlineOffset={12} focus="50% 55%">
          <img src={variants(photo.src).r43} alt={photo.alt} width={960} height={720} fetchPriority="high"/>
        </ShapeFrame>
      </Stack>}/>

    <FlowSection id="gui-yeu-cau" tone="light" top="dome" className="tp4-contact-body" decor={<Pattern kind="paper" fade="both" opacity={0.85}/>}>
      <div className="tp4-contact">
        <div className="tp4-contact__info">
          <h2 className="tp-sr">Thông tin liên hệ</h2>
          <div className="tp4-hotline tp-rv">
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
        <div className="tp-contact-form tp4-contact__form tp-rv">
          <InquiryForm demo={isDemoMode()} hours={hours} hotlineTel={hotlines[0].tel}/>
        </div>
      </div>
    </FlowSection>

    <FlowSection tone="dark" top="arc" className="tp4-contact-map" decor={<>
      <Pattern kind="resin" fade="both" opacity={0.4}/>
      <Pattern kind="ripple" size="clamp(240px,30vw,440px)" bottom="-12%" right="-6%" opacity={0.45} blend="screen"/>
    </>}>
      <div className="tp4-map-head tp-rv">
        <h2 className="tp4-h2">Nhà máy đặt tại Phú Thọ</h2>
        <Link href={mapLink} target="_blank" rel="noopener noreferrer" className="tp-text-link">Mở Google Maps <ArrowUpRight size={18} aria-hidden="true"/></Link>
      </div>
      <div className="tp-rv">{mapFrame('capsule', 2.7, 'is-wide')}{mapFrame('arch', 1, 'is-narrow')}</div>
    </FlowSection>
  </main>;
}
