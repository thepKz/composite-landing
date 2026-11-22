import { isDemoMode } from '@/lib/demo-mode';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Phone, Boxes, Droplets, Funnel, Move, FlaskConical, Truck, Wind, Wrench, Recycle, ShieldCheck, Ruler, Layers, Zap, Shapes, CircleCheck, type LucideIcon } from 'lucide-react';
import { contact, products } from '@/lib/content';
import { siteUrl, jsonLd } from '@/lib/seo';
import { facts, faqs } from '@/lib/site-facts';
import InquiryForm from '@/components/inquiry-form';
import ProductPhotoGallery from '@/components/product-photo-gallery';
import ProductCard from '@/components/product-card';
import Reveal from '@/components/pages/reveal';
import { Crumbs } from '@/components/pages/flow-hero';
import { FlowSection, Morph, Pattern, Stack, morphName } from '@/components/decor';
import { shortStat } from '@/components/product-card';
import FaqList from '@/components/pages/faq-list';
import { QuoteButton, ScaleChips, ScaleProvider, ScaleTableView, StickyBuyBar } from '@/components/pages/scale-picker';
import { productGuidance, type Feature } from '@/lib/product-guidance';
import { groupOfProduct } from '@/lib/product-groups';
import { productPhotos } from '@/lib/product-photos';
import { Drawing, kindOf } from '@/components/pages/product-tile';
import '@/components/pages/pages.css';
import '@/components/product-assets.css';
import '@/components/pages/pages-v4.css';
import './product-detail.css';
import '@/components/pages/pages-v5.css';

type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const p = (await products()).find(p => p.slug === slug);
  return { title: p?.name ?? 'Sản phẩm', description: p?.description, alternates: { canonical: `/san-pham/${slug}` } };
}

const icons: Record<Feature['icon'], LucideIcon> = { shape: Shapes, seal: ShieldCheck, bolt: Zap, layers: Layers, drop: Droplets, funnel: Funnel, move: Move, flask: FlaskConical, truck: Truck, wind: Wind, tool: Wrench, recycle: Recycle, shield: ShieldCheck, ruler: Ruler };

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const items = await products();
  const info = await contact();
  const index = items.findIndex(p => p.slug === slug);
  const product = items[index];
  if (!product) notFound();
  // Ảnh admin chọn làm ảnh đại diện đứng đầu, rồi đến mọi ảnh thật đúng sản phẩm này (không lặp, không mượn ảnh sản phẩm khác).
  const own = (productPhotos[slug] || []).map(p => ({ src: p.src, thumb: p.thumb, full: p.full, alt: p.alt, label: p.label, width: p.width, height: p.height }));
  const photos = [...(product.cover_id ? [{ src: `/api/media/${product.cover_id}`, alt: product.name, label: product.name }] : []), ...own];
  const image = photos[0];
  const guidance = productGuidance(slug);
  const group = groupOfProduct(slug);
  const faqItems = guidance.faqs.map(i => faqs[i]).filter(Boolean);
  const related = [...items.slice(index + 1), ...items.slice(0, index)].slice(0, 3);
  const table = guidance.scale;

  const anchors = [
    ...(table ? [{ id: 'bang-chon', label: 'Chọn dung tích' }] : guidance.highlights ? [{ id: 'bang-chon', label: guidance.highlights.title }] : []),
    { id: 'cau-tao', label: 'Cấu tạo' },
    { id: 'dat-hang', label: 'Đặt hàng' },
    { id: 'hoi-dap', label: 'Hỏi đáp' },
  ];
  const crumbs = group && group.members.length > 1
    ? [{ label: 'Sản phẩm', href: '/san-pham' }, { label: group.name, href: `/san-pham/${group.slug}` }, { label: product.name }]
    : [{ label: 'Sản phẩm', href: '/san-pham' }, { label: product.name }];

  const schema = { '@context': 'https://schema.org', '@type': 'Product', name: product.name, description: product.description, brand: { '@type': 'Brand', name: facts.shortName }, url: siteUrl(`/san-pham/${slug}`), ...(image ? { image: siteUrl(image.src) } : {}) };
  const faqSchema = faqItems.length ? { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqItems.map(item => ({ '@type': 'Question', name: item.q, acceptedAnswer: { '@type': 'Answer', text: item.a } })) } : null;
  const specs = product.specifications.slice(0, 4);
  // Nhãn đứng cạnh con số đã có đơn vị thì bỏ (nhãn còn trong mã cho trình đọc màn hình). Dung tích và đường kính liền nhau gộp một dòng.
  const hasUnit = (value: string) => /\d\s*(m³|m|mm|lít)(\s|,|$)/.test(value);
  const rows: { label?: string; sr?: string; value: string }[] = [];
  for (const spec of specs) {
    if (spec.label === 'Lớp lót') spec.value = spec.value.replace(/, Vinyl Ester/, ', nhựa Vinyl Ester');
    const last = rows[rows.length - 1];
    if (spec.label === 'Đường kính' && last?.sr === 'Dung tích' && hasUnit(spec.value)) { last.value += ', đường kính ' + spec.value; continue; }
    if ((spec.label === 'Dung tích' || spec.label === 'Đường kính') && hasUnit(spec.value)) rows.push({ sr: spec.label, value: spec.value });
    else rows.push({ label: spec.label, value: spec.value });
  }
  const factList = <dl className="tp-pd-facts">{rows.map(row => <div key={row.label ?? row.sr} className={row.label ? undefined : 'is-bare'}>{row.label ? <dt>{row.label}</dt> : <dt className="tp-sr">{row.sr}</dt>}<dd>{row.value}</dd></div>)}</dl>;

  const plainStat = shortStat(product.specifications[0]?.value.split(':')[0]) ?? '';

  return <main id="main" className="public-page tp tp-product tp4">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }}/>
    {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(faqSchema) }}/>}
    <Reveal/>
    <ScaleProvider table={table} productName={product.name}>
      <StickyBuyBar anchors={anchors}/>

      <FlowSection id="tp-top" tone="dark" top="none" className="tp4-fs--teal tp4-pd-hero" decor={<>
        <Pattern kind="resin" fade="both" opacity={0.45}/>
        <Pattern kind="ripple" size="clamp(260px,34vw,520px)" top="-12%" right="-8%" opacity={0.45} blend="screen"/>
      </>}>
        <Crumbs crumbs={[{ label: 'Trang chủ', href: '/' }, ...crumbs]}/>
        <div className={`tp4-pd-grid tp5-pd-grid${photos.length ? '' : ' is-plain'}`}>
          <div className="tp5-pd-head">
            <div className="tp-pd-badges"><span className="tp-badge">{product.category}</span></div>
            <Morph name={morphName('product-title', slug)}><h1 className={product.name.length > 20 ? 'is-long' : undefined}>{product.name}</h1></Morph>
            <p className="tp-pd-tagline">{guidance.tagline}</p>
          </div>
          <div className="tp4-pd-media">
            {photos.length ? <Stack pattern={{ kind: 'ripple', blend: 'screen', opacity: 0.35 }} floatAt="tl">
              <ProductPhotoGallery key={slug} photos={photos} morph={morphName('product-photo', slug)}/>
            </Stack> : <div className="pf tp5-plain"><Drawing kind={kindOf(slug)} color="#d3f56b" className="tp4-plain__art"/>{plainStat ? <strong className="tp5-plain__stat">{plainStat}</strong> : null}</div>}
          </div>
          <div className="tp5-pd-body">
            <p className="tp-pd-lead">{product.description}</p>
            <div className="tp-pd-actions">
              <QuoteButton/>
              <a className="tp-btn tp-btn-ghost-light" href={`tel:${info.hotlines[0].tel}`}><Phone size={18} aria-hidden="true"/>{info.hotlines[0].display}</a>
            </div>
            {photos.length ? null : <ul className="tp-chips tp-pd-apps" aria-label="Ứng dụng">{product.applications.map(item => <li key={item}>{item}</li>)}</ul>}
            {factList}
            <ScaleChips/>
          </div>
        </div>
      </FlowSection>

      {table ? <FlowSection id="bang-chon" tone="light" top="dome" className="tp4-pd-table" decor={<Pattern kind="paper" fade="both" opacity={0.8}/>}>
        <h2 className="tp4-h2 tp-rv">{table.title}</h2>
        <div className="tp-rv"><ScaleTableView/></div>
      </FlowSection> : guidance.highlights ? <FlowSection id="bang-chon" tone="light" top="dome" className="tp4-pd-table" decor={<Pattern kind="paper" fade="both" opacity={0.8}/>}>
        <h2 className="tp4-h2 tp-rv">{guidance.highlights.title}</h2>
        <ul className="tp-pill-list tp-rv">{guidance.highlights.items.map(item => <li key={item}>{item}</li>)}</ul>
      </FlowSection> : null}

      <FlowSection id="cau-tao" tone="dark" top={table || guidance.highlights ? 'wave' : 'dome'} className="tp4-fs--teal tp4-pd-build" decor={<>
        <Pattern kind="weave" fade="both" opacity={0.18}/>
        <Pattern kind="ripple" size="clamp(240px,28vw,420px)" bottom="-6%" left="-6%" opacity={0.4} blend="screen"/>
      </>}>
        <div className={`tp4-build${guidance.accessories ? '' : ' is-solo'}`}>
          <div className="tp4-build__head tp-rv">
            <h2 className="tp4-h2">Cấu tạo và ưu điểm</h2>
            {guidance.accessories && <div className="tp-accessories"><h3>{guidance.accessories.title}</h3><ul>{guidance.accessories.items.map(item => <li key={item}><CircleCheck size={18} aria-hidden="true"/>{item}</li>)}</ul></div>}
          </div>
          <ol className="tp-build-list">
            {guidance.features.map((feature, i) => {
              const Icon = icons[feature.icon] || Boxes;
              return <li className="tp-build-row tp-rv" style={{ ['--i' as string]: i }} key={feature.title}><span className="tp4-build__icon"><Icon size={26} aria-hidden="true"/></span><div><h3>{feature.title}</h3><p>{feature.text}</p></div></li>;
            })}
          </ol>
        </div>
      </FlowSection>

      <FlowSection id="dat-hang" tone="light" top="fade" className="tp4-pd-order" decor={<Pattern kind="paper" fade="both" opacity={0.8}/>}>
        <h2 className="tp4-h2 tp-rv">Kỹ sư lập phương án dựa trên những thông tin sau</h2>
        <div className="tp4-order">
          <div className="tp-rv">
            <ol className="tp4-order-path">{guidance.order.map(text => <li key={text}>{text}</li>)}</ol>
          </div>
          <aside className="tp4-order-aside tp-rv" style={{ ['--i' as string]: 1 }}>
            <h3>Trao đổi qua Zalo</h3>
            <p>Quý khách chỉ cần mô tả nhu cầu sử dụng. Kỹ thuật kết bạn Zalo, gửi bảng giá, ảnh thật và bản vẽ.</p>
            <a className="tp-btn tp-btn-ghost-light" href={`https://zalo.me/${info.zalo}`} target="_blank" rel="noopener noreferrer">Nhắn Zalo</a>
          </aside>
        </div>
        {faqItems.length > 0 && <div id="hoi-dap" className="tp4-faq tp-rv"><h2 className="tp-sr">Hỏi đáp liên quan</h2><FaqList items={faqItems} name={`hoi-dap-${slug}`}/></div>}
      </FlowSection>

      <FlowSection tone="light" top="none" className="tp4-pd-related">
        <h2 className="tp-sr">Sản phẩm liên quan</h2>
        <div className="tp-grid tp-grid-3">{related.map((item, i) => <ProductCard key={item.slug} product={item} compact index={i} morph/>)}</div>
      </FlowSection>

      <FlowSection id="tu-van" tone="dark" top="arc" className="tp4-pd-form" decor={<>
        <Pattern kind="resin" fade="both" opacity={0.4}/>
        <Pattern kind="ripple" size="clamp(240px,30vw,460px)" top="-8%" left="-6%" opacity={0.45} blend="screen"/>
      </>}>
        <div className="tp4-form">
          <div className="tp4-form__copy tp-rv">
            <h2 className="tp4-h2">Nhận báo giá</h2>
            <p className="tp-form-product">{product.name}</p>
            <ul>
              <li><CircleCheck size={20} aria-hidden="true"/>Báo giá trong 15 – 60 phút kể từ khi đủ thông tin</li>
              <li><CircleCheck size={20} aria-hidden="true"/>Vận chuyển và lắp đặt toàn quốc</li>
              <li><CircleCheck size={20} aria-hidden="true"/>Bảo hành đến 10 năm tùy dòng</li>
            </ul>
          </div>
          <div className="tp4-form__card tp-rv" style={{ ['--i' as string]: 1 }}>
            <InquiryForm demo={isDemoMode()} key={slug} product={product.name} compact hours={info.hours} hotlineTel={info.hotlines[0].tel}/>
          </div>
        </div>
      </FlowSection>
    </ScaleProvider>
  </main>;
}
