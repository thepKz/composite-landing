import { products } from '@/lib/content';
import { fieldFromQuery, fields, productGroups } from '@/lib/product-groups';
import PageHero from '@/components/pages/page-hero';
import CtaBand from '@/components/pages/cta-band';
import Reveal from '@/components/pages/reveal';
import CatalogueBrowser, { type CatalogueItem } from '@/components/pages/catalogue-browser';
import '@/components/pages/pages.css';
import '../secondary-pages.css';

export const metadata = { title: 'Sản phẩm composite', description: 'Bảy nhóm sản phẩm composite Thành Lợi: bể biogas, bể phốt, bể cá và thủy sản, bồn hóa chất, thùng chở hải sản, thùng rác và gia công theo yêu cầu.', alternates: { canonical: '/san-pham' } };

export default async function Catalogue({ searchParams }: { searchParams: Promise<{ nhom?: string }> }) {
  const [items, query] = await Promise.all([products(), searchParams]);
  const bySlug = new Map(items.map(product => [product.slug, product]));
  const list: CatalogueItem[] = productGroups(items).flatMap(group => {
    const members = group.members.map(slug => bySlug.get(slug)).filter((product): product is NonNullable<typeof product> => !!product);
    const first = members[0];
    if (!first) return [];
    const multi = members.length > 1;
    const plain = { slug: first.slug, name: first.name, category: first.category, description: first.description, specifications: first.specifications, applications: first.applications, cover_id: first.cover_id ?? null };
    // Nhóm nhiều sản phẩm: một thẻ nhóm, gộp ứng dụng của các thành viên, dẫn tới trang nhóm.
    const product = multi
      ? { ...plain, slug: group.slug, name: group.name, category: 'Dân dụng và môi trường', description: 'Bể phốt tự hoại cho nhà ở và công trình, bể xử lý nước thải hợp khối cho khu dân cư và nhà máy.', applications: [...new Set(members.flatMap(member => member.applications))] }
      : plain;
    return [{ key: group.slug, product, href: `/san-pham/${group.slug}`, title: group.name, field: group.field, rank: group.flagship }];
  });
  return <main id="main" className="public-page tp tp-catalogue">
    <Reveal/>
    <PageHero tone="teal" crumbs={[{ label: 'Trang chủ', href: '/' }, { label: 'Sản phẩm' }]} title="Sản phẩm composite" lead="Bảy nhóm sản phẩm, ba dòng mũi nhọn đứng đầu."
      aside={<p className="tp-hero-count" aria-label={`${list.length} nhóm sản phẩm`}><strong>{list.length}</strong><span>nhóm sản phẩm</span></p>}/>
    <section className="tp-section tp-catalogue-body"><div className="tp-wrap">
      <CatalogueBrowser items={list} fields={[...fields]} initial={fieldFromQuery(query.nhom)}/>
    </div></section>
    <CtaBand/>
  </main>;
}
