import Link from 'next/link';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import { editorialAssets } from '@/lib/customer-product-assets';

export default function CinematicHero() {
  return <section className="cinematic-hero" aria-label="Thành Lợi Composite">
    <div className="hero-orbits" aria-hidden="true"><span/><span/><span/></div>
    <div className="container cinematic-heading">
      <h1><span className="hero-title-main">Bồn bể</span>{' '}<span className="hero-title-message">composite.</span></h1>
    </div>
    <div className="cinematic-image">
      <img src={editorialAssets.hero.src} alt={editorialAssets.hero.alt} fetchPriority="high" width="1920" height="1440"/>
      <div className="hero-shutters" aria-hidden="true">{Array.from({length:6},(_,index)=><span key={index}/>)}</div>
      <div className="hero-image-caption"><span>Lắp ghép bể tròn composite</span><span>Thành Lợi Composite</span></div>
    </div>
    <div className="container cinematic-bottom">
      <div className="cinematic-intro"><p>Chế tạo theo yêu cầu cho chăn nuôi, thủy sản và sản xuất. Bắt đầu từ nơi lắp đặt và cách bạn sử dụng.</p><Link href="/san-pham" className="button hero-primary">Tìm sản phẩm phù hợp <ArrowUpRight size={20}/></Link><Link href="/lien-he#gui-yeu-cau" className="hero-secondary">Nhận tư vấn quy cách <ArrowUpRight size={17}/></Link></div>
      <a href="#cau-chuyen" className="hero-scroll" aria-label="Khám phá Thành Lợi"><span>Khám phá Thành Lợi</span><ArrowDown size={22} aria-hidden="true"/></a>
    </div>
    <div className="hero-reveal-message" aria-hidden="true"><span>Từ quy cách.</span><span>Đến thực tế.</span></div>
    <svg className="hero-clip-definitions" aria-hidden="true" width="0" height="0"><defs><clipPath id="hero-aperture" clipPathUnits="objectBoundingBox"><path id="hero-aperture-path" d="M0.24,0 C0.1,0 0,0.12 0,0.28 L0,1 L1,1 L1,0 Z"/></clipPath></defs></svg>
  </section>;
}
