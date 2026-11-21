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
import FaqList from '@/components/pages/faq-list';
import { QuoteButton, ScaleChips, ScaleProvider, ScaleTableView, StickyBuyBar } from '@/components/pages/scale-picker';
import { productGuidance, type Feature } from '@/lib/product-guidance';
import { groupOfProduct } from '@/lib/product-groups';
import { productAssetBySlug, editorialAssets, additionalCustomerAssets } from '@/lib/customer-product-assets';
import { variants } from '@/lib/trang-phu-media';
import { Drawing, kindOf } from '@/components/pages/product-tile';
import '@/components/pages/pages.css';
import '@/components/product-assets.css';
import './product-detail.css';

type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const p = (await products()).find(p => p.slug === slug);
  return { title: p?.name ?? 'Sản phẩm', description: p?.description, alternates: { canonical: `/san-pham/${slug}` } };
}

// Chỉ bổ sung ảnh cho dòng mà hình dáng và công dụng nhìn thấy rõ trong ảnh khách cung cấp.
const supportingPhotos = {
  'be-biogas-composite': [editorialAssets.gallery[2]],
  // Ảnh có người nhỏ đứng ở mép bể (round-blue-tanks-site) để cuối, không đứng đầu.
  'be-nuoi-trong-thuy-san': [editorialAssets.fit, { src: '/images/products-2026/round-blue-tanks-site.webp', alt: 'Các bể composite tròn màu xanh được bố trí ngoài trời', label: 'Bể tròn composite', width: 964, height: 1280 }],
  'thung-cho-tom-ca': [editorialAssets.gallery[1], additionalCustomerAssets[2]],
  'composite-theo-yeu-cau': [editorialAssets.story],
};

// Ảnh đã cắt đúng khung vuông, cân tông; bản đủ khung dùng cho hộp phóng to.
const toPhoto = (a: { src: string; alt: string; label?: string }) => { const v = variants(a.src); return { src: v.sq, alt: a.alt, label: a.label, zoom: v.full }; };

const icons: Record<Feature['icon'], LucideIcon> = { shape: Shapes, seal: ShieldCheck, bolt: Zap, layers: Layers, drop: Droplets, funnel: Funnel, move: Move, flask: FlaskConical, truck: Truck, wind: Wind, tool: Wrench, recycle: Recycle, shield: ShieldCheck, ruler: Ruler };

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const items = await products();
  const info = await contact();
  const index = items.findIndex(p => p.slug === slug);
  const product = items[index];
  if (!product) notFound();
  const asset = productAssetBySlug[slug];
  const image = product.cover_id ? { src: `/api/media/${product.cover_id}`, alt: product.name, label: product.name, zoom: undefined as string | undefined } : asset ? toPhoto(asset) : undefined;
  const extra = (supportingPhotos[slug as keyof typeof supportingPhotos] || []).map(toPhoto);
  const photos = image ? [image, ...extra].filter((photo, i, all) => all.findIndex(item => item.src === photo.src) === i) : [];
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

  return <main id="main" className="public-page tp tp-product">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }}/>
    {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(faqSchema) }}/>}
    <Reveal/>
    <ScaleProvider table={table} productName={product.name}>
      <StickyBuyBar anchors={anchors}/>
      <nav className="tp-wrap tp-pd-crumbs tp-crumbs-dark" aria-label="Đường dẫn">
        <span className="tp-crumb"><Link href="/">Trang chủ</Link><span className="tp-crumb-sep" aria-hidden="true">/</span></span>
        {crumbs.map((crumb, i) => <span className="tp-crumb" key={crumb.label}>{'href' in crumb && crumb.href ? <><Link href={crumb.href}>{crumb.label}</Link><span className="tp-crumb-sep" aria-hidden="true">/</span></> : <span aria-current="page">{crumb.label}</span>}</span>)}
      </nav>

      <section id="tp-top" className={`tp-wrap tp-pd-top${photos.length ? '' : ' is-plain'}`}>
        {photos.length ? <ProductPhotoGallery key={slug} photos={photos}/> : null}
        <div className="tp-pd-copy">
          <div className="tp-pd-badges">
            <span className="tp-badge">{product.category}</span>
          </div>
          <h1 className={product.name.length > 20 ? 'is-long' : undefined}>{product.name}</h1>
          <p className="tp-pd-tagline">{guidance.tagline}</p>
          <p className="tp-pd-lead">{product.description}</p>
          {photos.length ? null : <ul className="tp-chips tp-pd-apps" aria-label="Ứng dụng">{product.applications.map(item => <li key={item}>{item}</li>)}</ul>}
          <div className="tp-pd-actions">
            <QuoteButton/>
            <a className="tp-btn tp-btn-ghost" href={`tel:${info.hotlines[0].tel}`}><Phone size={18} aria-hidden="true"/>{info.hotlines[0].display}</a>
          </div>
          {photos.length ? factList : null}
          <ScaleChips/>
        </div>
        {photos.length ? null : <aside className="tp-pd-spec" aria-label="Thông số chính">
          <Drawing kind={kindOf(slug)} color="#16714e" className="tp-pd-draw"/>
          {factList}
        </aside>}
      </section>

      {table ? <section id="bang-chon" className="tp-pd-section tp-pd-table"><div className="tp-wrap">
        <div className="tp-section-head tp-rv"><h2 className="tp-sr">{table.title}</h2></div>
        <div className="tp-rv"><ScaleTableView/></div>
      </div></section> : guidance.highlights ? <section id="bang-chon" className="tp-pd-section tp-pd-table"><div className="tp-wrap">
        <div className="tp-section-head tp-rv"><h2>{guidance.highlights.title}</h2></div>
        <ul className="tp-pill-list tp-rv">{guidance.highlights.items.map(item => <li key={item}>{item}</li>)}</ul>
      </div></section> : null}

      <section id="cau-tao" className="tp-pd-section tp-pd-build"><div className={`tp-wrap tp-build-grid${guidance.accessories ? '' : ' is-solo'}`}>
        <div className="tp-build-head tp-rv">
          <h2>Cấu tạo và ưu điểm</h2>
          {guidance.accessories && <div className="tp-accessories"><h3>{guidance.accessories.title}</h3><ul>{guidance.accessories.items.map(item => <li key={item}><CircleCheck size={18} aria-hidden="true"/>{item}</li>)}</ul></div>}
        </div>
        <ol className="tp-build-list">
          {guidance.features.map((feature, i) => {
            const Icon = icons[feature.icon] || Boxes;
            return <li className="tp-build-row tp-rv" style={{ ['--i' as string]: i }} key={feature.title}><Icon size={30} aria-hidden="true"/><div><h3>{feature.title}</h3><p>{feature.text}</p></div></li>;
          })}
        </ol>
      </div></section>

      <section id="dat-hang" className="tp-pd-section tp-pd-order"><div className="tp-wrap tp-pd-order-grid">
        <div className="tp-rv">
          <h2>Thông tin cần cung cấp khi đặt hàng</h2>
          <ol className="tp-order-list">{guidance.order.map(text => <li key={text}>{text}</li>)}</ol>
        </div>
        <aside className="tp-order-aside tp-rv" style={{ ['--i' as string]: 1 }}>
          <h3>Chưa có đủ thông tin</h3>
          <p>Mô tả cách sử dụng là đủ. Kỹ thuật sẽ kết bạn Zalo gửi bảng giá, ảnh thật và bản vẽ trong 15 – 30 phút.</p>
          <a className="tp-btn tp-btn-ghost" href={`https://zalo.me/${info.zalo}`} target="_blank" rel="noopener noreferrer">Nhắn Zalo</a>
        </aside>
      </div></section>

      {faqItems.length > 0 && <section id="hoi-dap" className="tp-pd-section tp-pd-faq"><div className="tp-wrap tp-pd-faq-grid is-solo">
        <div className="tp-section-head tp-rv"><h2 className="tp-sr">Hỏi đáp liên quan</h2></div>
        <div className="tp-rv"><FaqList items={faqItems} name={`hoi-dap-${slug}`}/></div>
      </div></section>}

      <section id="tu-van" className="tp-form-section"><div className="tp-wrap tp-form-grid">
        <div className="tp-form-copy tp-rv">
          <h2>Nhận báo giá</h2>
          <p className="tp-form-product">{product.name}</p>
          <ul>
            <li><CircleCheck size={20} aria-hidden="true"/>Báo giá trong 15 – 60 phút kể từ khi đủ thông tin</li>
            <li><CircleCheck size={20} aria-hidden="true"/>Vận chuyển và lắp đặt toàn quốc</li>
            <li><CircleCheck size={20} aria-hidden="true"/>Bảo hành đến 10 năm tùy dòng</li>
          </ul>
        </div>
        <InquiryForm demo={isDemoMode()} key={slug} product={product.name} compact hours={info.hours} hotlineTel={info.hotlines[0].tel}/>
      </div></section>

      <section className="tp-pd-section tp-pd-related"><div className="tp-wrap">
        <div className="tp-section-head tp-rv"><h2 className="tp-sr">Sản phẩm liên quan</h2></div>
        <div className="tp-grid tp-grid-3">{related.map((item, i) => <ProductCard key={item.slug} product={item} compact index={i}/>)}</div>
      </div></section>
    </ScaleProvider>
  </main>;
}
