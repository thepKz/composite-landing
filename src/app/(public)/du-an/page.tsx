import { isDemoMode } from '@/lib/demo-mode';
import Link from 'next/link';
import { ArrowUpRight, Building2, Factory, Fish, Sprout, Trash2 } from 'lucide-react';
import { db } from '@/lib/db';
import { additionalCustomerAssets, editorialAssets } from '@/lib/customer-product-assets';
import { variants } from '@/lib/trang-phu-media';
import PhotoStrip from '@/components/pages/photo-strip';
import PageHero from '@/components/pages/page-hero';
import CtaBand from '@/components/pages/cta-band';
import Reveal from '@/components/pages/reveal';
import '@/components/pages/pages.css';
import '../secondary-pages.css';

export const metadata = { title: 'Dự án Thành Lợi Composite', description: 'Các lĩnh vực và dự án ứng dụng composite FRP do Thành Lợi thực hiện và công bố.', alternates: { canonical: '/du-an' } };

const fields = [
  { icon: Sprout, title: 'Chăn nuôi', text: 'Bể biogas composite đường kính 2,4 – 3,0 m cho trang trại lợn quy mô lớn.', href: '/san-pham/be-biogas-composite', link: 'Xem bể biogas' },
  { icon: Building2, title: 'Dân dụng và khu đô thị', text: 'Bể phốt tự hoại ba ngăn và module xử lý nước thải cho khu dân cư, nhà trọ, nhà máy.', href: '/san-pham/be-phot-va-xu-ly-nuoc-thai', link: 'Xem bể phốt' },
  { icon: Fish, title: 'Thủy sản và cảnh quan', text: 'Dàn bể tròn đáy phễu nuôi tôm cá công nghệ cao RAS và hồ cá Koi tích hợp lọc.', href: '/san-pham/be-nuoi-trong-thuy-san', link: 'Xem bể thủy sản' },
  { icon: Factory, title: 'Công nghiệp và vận tải', text: 'Bồn chứa hóa chất kháng axit và thùng chở thủy hải sản sống bảo ôn ba lớp.', href: '/san-pham/bon-chua-hoa-chat', link: 'Xem bồn hóa chất' },
  { icon: Trash2, title: 'Vệ sinh đô thị', text: 'Thùng rác công cộng và xe gom rác đẩy tay cho xã nông thôn mới, khu đô thị.', href: '/san-pham/xe-gom-rac', link: 'Xem thùng rác' },
];

// Khi chưa có dự án đăng riêng, trang dùng ảnh công trình và xưởng thật đã có, không chú thích.
const strip = [editorialAssets.hero, editorialAssets.bridge, editorialAssets.fit, additionalCustomerAssets[1], editorialAssets.gallery[1], editorialAssets.footer].map(asset => { const v = variants(asset.src); return { src: v.r43, srcSet: `${v.r43Small} 520w, ${v.r43} 960w`, alt: asset.alt, label: '' }; });

type Row = { id: string; slug: string; title: string; excerpt: string; cover_id: string | null };

export default async function ProjectsPage() {
  const { rows } = isDemoMode() ? { rows: [] as Row[] } : await db.query<Row>("SELECT id,slug,title,excerpt,cover_id FROM posts WHERE kind='project' AND status='published' AND published_at <= now() ORDER BY published_at DESC");
  // Chia hàng cho đủ ba cột, không để ô trống: dư 2 thì một thẻ rộng, dư 1 thì hai thẻ rộng, từ 3 mục trở lên.
  const wide = rows.length >= 3 ? [0, 2, 1][rows.length % 3] : 0;
  return <main id="main" className="public-page tp tp-projects">
    <Reveal/>
    <PageHero tone="lime" crumbs={[{ label: 'Trang chủ', href: '/' }, { label: 'Dự án' }]} title="Dự án và công trình"
      aside={<p className="tp-hero-count" aria-label="Hơn 100 công trình"><strong>100+</strong><span>công trình</span></p>}/>

    {rows.length ? <section className="tp-section tp-projects-body"><div className="tp-wrap">
      <>
        <h2 className="tp-sr">Dự án đã đăng</h2>
        <div className={`tp-project-grid is-${Math.min(rows.length, 3)}`}>{rows.map((project, i) => <article className={`tp-project-card tp-rv${i < wide ? ' is-wide' : ''}`} style={{ ['--i' as string]: i }} key={project.id}>
          <Link href={`/du-an/${project.slug}`} className="tp-project-media" tabIndex={-1} aria-hidden="true">{project.cover_id ? <img src={`/api/media/${project.cover_id}`} alt="" loading="lazy"/> : <span className="tp-project-blank"><Building2 size={36}/></span>}</Link>
          <div className="tp-project-body"><h3><Link href={`/du-an/${project.slug}`}>{project.title}</Link></h3><p>{project.excerpt}</p><Link className="tp-text-link" href={`/du-an/${project.slug}`}>Xem dự án <ArrowUpRight size={18} aria-hidden="true"/></Link></div>
        </article>)}</div>
      </>
    </div></section> : <section className="tp-strip-section" aria-labelledby="tp-projects-photos">
      <h2 id="tp-projects-photos" className="tp-sr">Ảnh công trình</h2>
      <PhotoStrip photos={strip} label="Ảnh xưởng và công trình, dùng phím mũi tên để xem tiếp"/>
    </section>}


    <section className="tp-section tp-field-section"><div className="tp-wrap">
      <div className="tp-section-head tp-rv"><h2>Năm lĩnh vực chúng tôi làm</h2></div>
      <ul className="tp-field-list">
        {fields.map((field, i) => <li className="tp-rv" style={{ ['--i' as string]: i }} key={field.title}>
          <Link className="tp-field-row" href={field.href} aria-label={`${field.title}: ${field.link}`}>
            <field.icon size={32} aria-hidden="true"/>
            <span className="tp-field-title">{field.title}</span>
            <span className="tp-field-text">{field.text}</span>
            <span className="tp-field-go">{field.link}<ArrowUpRight size={18} aria-hidden="true"/></span>
          </Link>
        </li>)}
      </ul>
    </div></section>
    <CtaBand title="Có công trình cần tư vấn?" text="Gửi quy mô và mặt bằng, kỹ sư Thành Lợi trao đổi phương án và báo giá."/>
  </main>;
}
