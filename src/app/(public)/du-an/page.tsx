import { isDemoMode } from '@/lib/demo-mode';
import Link from 'next/link';
import { ArrowUpRight, Building2, Factory, Fish, Sprout, Trash2 } from 'lucide-react';
import { db } from '@/lib/db';
import { additionalCustomerAssets } from '@/lib/customer-product-assets';
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
  { icon: Trash2, title: 'Vệ sinh đô thị', text: 'Thùng rác công cộng và xe gom rác đẩy tay composite cho xã nông thôn mới, khu đô thị.', href: '/san-pham/xe-gom-rac', link: 'Xem thùng rác' },
];

type Row = { id: string; slug: string; title: string; excerpt: string; cover_id: string | null };

export default async function ProjectsPage() {
  const { rows } = isDemoMode() ? { rows: [] as Row[] } : await db.query<Row>("SELECT id,slug,title,excerpt,cover_id FROM posts WHERE kind='project' AND status='published' AND published_at <= now() ORDER BY published_at DESC");
  const yard = additionalCustomerAssets[1];
  return <main id="main" className="public-page tp tp-projects">
    <Reveal/>
    <PageHero tone="lime" crumbs={[{ label: 'Trang chủ', href: '/' }, { label: 'Dự án' }]} title="Dự án và công trình" lead="Hơn 100 công trình bể biogas, bể phốt, bể thủy sản và xử lý nước thải cho hộ gia đình, trang trại, doanh nghiệp trên toàn quốc."/>

    <section className="tp-section tp-projects-body"><div className="tp-wrap">
      {rows.length ? <>
        <div className="tp-section-head tp-rv"><h2>Dự án đã đăng</h2></div>
        <div className="tp-grid tp-grid-3">{rows.map((project, i) => <article className="tp-project-card tp-rv" style={{ ['--i' as string]: i }} key={project.id}>
          <Link href={`/du-an/${project.slug}`} className="tp-project-media" tabIndex={-1} aria-hidden="true">{project.cover_id ? <img src={`/api/media/${project.cover_id}`} alt="" loading="lazy"/> : <span className="tp-project-blank"><Building2 size={36}/></span>}</Link>
          <div className="tp-project-body"><h3><Link href={`/du-an/${project.slug}`}>{project.title}</Link></h3><p>{project.excerpt}</p><Link className="tp-text-link" href={`/du-an/${project.slug}`}>Xem dự án <ArrowUpRight size={18} aria-hidden="true"/></Link></div>
        </article>)}</div>
      </> : <div className="tp-empty tp-empty-photo tp-rv">
        <figure><img src={yard.src} alt={yard.alt} width={yard.width} height={yard.height} loading="lazy"/></figure>
        <div>
          <h2>Hồ sơ dự án đang được cập nhật</h2>
          <p>Chưa có dự án nào được đăng. Bạn đang chuẩn bị một công trình, gửi mục đích sử dụng và mặt bằng để trao đổi phương án.</p>
          <Link href="/lien-he#gui-yeu-cau" className="tp-btn tp-btn-cta">Trao đổi dự án <ArrowUpRight size={18} aria-hidden="true"/></Link>
        </div>
      </div>}
    </div></section>

    <section className="tp-section tp-field-section"><div className="tp-wrap">
      <div className="tp-section-head tp-rv"><h2>Năm lĩnh vực chúng tôi làm</h2><p>Đây là nhóm lĩnh vực của sản phẩm, chưa phải danh sách dự án đã bàn giao.</p></div>
      <div className="tp-field-grid">
        {fields.map((field, i) => <article className="tp-field-card tp-rv" style={{ ['--i' as string]: i }} key={field.title}>
          <field.icon size={30} aria-hidden="true"/>
          <h3>{field.title}</h3>
          <p>{field.text}</p>
          <Link className="tp-text-link" href={field.href}>{field.link} <ArrowUpRight size={18} aria-hidden="true"/></Link>
        </article>)}
      </div>
    </div></section>
    <CtaBand title="Có công trình cần tư vấn?" text="Gửi quy mô và mặt bằng, kỹ sư Thành Lợi trao đổi phương án và báo giá."/>
  </main>;
}
