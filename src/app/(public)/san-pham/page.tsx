import { products } from '@/lib/content';
import { fieldFromQuery, fields, productGroups } from '@/lib/product-groups';
import { additionalCustomerAssets } from '@/lib/customer-product-assets';
import { variants } from '@/lib/trang-phu-media';
import { FlowSection, Pattern, ShapeFrame, Stack, StackStat } from '@/components/decor';
import FlowHero from '@/components/pages/flow-hero';
import FlowCta from '@/components/pages/flow-cta';
import Reveal from '@/components/pages/reveal';
import CatalogueBrowser, { type CatalogueItem } from '@/components/pages/catalogue-browser';
import '@/components/pages/pages.css';
import '@/components/pages/pages-v4.css';
import '../secondary-pages.css';

export const metadata = { title: 'Sản phẩm composite', description: 'Bảy nhóm sản phẩm composite Thành Lợi: bể biogas, bể phốt, bể cá và thủy sản, bồn hóa chất, thùng chở hải sản, thùng rác và gia công theo yêu cầu.', alternates: { canonical: '/san-pham' } };

// Mô tả ngắn cho thẻ (bản trong cơ sở dữ liệu dài hơn, giữ nguyên ở trang chi tiết).
const cardText: Record<string, string> = { 'be-nuoi-trong-thuy-san': 'Hồ cá Koi có vách lọc, bể trữ hải sản nhà hàng, bể ươm giống, bể tròn đáy phễu nuôi tôm cá.' };

export default async function Catalogue({ searchParams }: { searchParams: Promise<{ nhom?: string }> }) {
  const [items, query] = await Promise.all([products(), searchParams]);
  const bySlug = new Map(items.map(product => [product.slug, product]));
  const list: CatalogueItem[] = productGroups(items).flatMap(group => {
    const members = group.members.map(slug => bySlug.get(slug)).filter((product): product is NonNullable<typeof product> => !!product);
    const first = members[0];
    if (!first) return [];
    const multi = members.length > 1;
    const plain = { slug: first.slug, name: first.name, category: first.category, description: cardText[first.slug] ?? first.description, specifications: first.specifications, applications: first.applications, cover_id: first.cover_id ?? null };
    // Nhóm nhiều sản phẩm: một thẻ nhóm, gộp ứng dụng của các thành viên, dẫn tới trang nhóm.
    const product = multi
      ? { ...plain, slug: group.slug, name: group.name, category: 'Dân dụng và môi trường', description: 'Bể phốt tự hoại cho nhà ở và công trình, bể xử lý nước thải hợp khối cho khu dân cư, nhà máy.', applications: [...new Set(members.flatMap(member => member.applications))] }
      : plain;
    return [{ key: group.slug, product, href: `/san-pham/${group.slug}`, title: group.name, field: group.field, rank: group.flagship }];
  });
  const v = variants(additionalCustomerAssets[1].src);
  return <main id="main" className="public-page tp tp-catalogue tp4">
    <Reveal/>
    <FlowHero tone="teal" crumbs={[{ label: 'Trang chủ', href: '/' }, { label: 'Sản phẩm' }]}
      title="Bảy nhóm sản phẩm làm từ composite FRP"
      lead="Bể biogas, bể phốt và xử lý nước thải, bể nuôi trồng thủy sản là ba dòng mũi nhọn của Thành Lợi."
      visual={<Stack pattern={{ kind: 'ripple', blend: 'screen', opacity: 0.55 }} floatAt="bl" float={<StackStat value={7} label="Nhóm sản phẩm" tone="light"/>}>
        <ShapeFrame shape="capsule" ratio={1.9} outline="bronze" outlineOffset={12} focus="50% 50%">
          <img src={v.r43} srcSet={`${v.r43Small} 520w, ${v.r43} 960w`} sizes="(min-width: 1000px) 520px, 90vw" alt={additionalCustomerAssets[1].alt} width={960} height={720} fetchPriority="high"/>
        </ShapeFrame>
      </Stack>}/>
    <FlowSection tone="light" top="dome" className="tp4-catalogue-body" decor={<Pattern kind="paper" fade="both" opacity={0.8}/>}>
      <CatalogueBrowser items={list} fields={[...fields]} initial={fieldFromQuery(query.nhom)}/>
    </FlowSection>
    <FlowCta/>
  </main>;
}
