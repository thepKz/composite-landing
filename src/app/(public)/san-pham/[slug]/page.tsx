import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowUpRight } from 'lucide-react';
import { products } from '@/lib/content';
import { siteUrl, jsonLd } from '@/lib/seo';
import InquiryForm from '@/components/inquiry-form';
import ProductPhotoGallery from '@/components/product-photo-gallery';
import { productGuidance } from '@/lib/product-guidance';
import { productAssetBySlug, editorialAssets, additionalCustomerAssets } from '@/lib/customer-product-assets';
import '@/components/product-assets.css';
import './product-detail.css';

type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const p = (await products()).find(p => p.slug === slug);
  return { title: p?.name ?? 'Sản phẩm', description: p?.description, alternates: { canonical: `/san-pham/${slug}` } };
}

// Supplement only families whose shapes and use are identifiable in the supplied photographs.
const supportingPhotos = {
  'be-biogas-composite': [editorialAssets.gallery[2]],
  'be-nuoi-trong-thuy-san': [editorialAssets.hero, editorialAssets.fit],
  'thung-cho-tom-ca': [editorialAssets.gallery[1], additionalCustomerAssets[2]],
  'composite-theo-yeu-cau': [editorialAssets.story],
};

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const items = await products();
  const product = items.find(p => p.slug === slug);
  if (!product) notFound();
  const asset = productAssetBySlug[slug];
  const image = product.cover_id ? { src: `/api/media/${product.cover_id}`, alt: product.name, label: product.name } : asset;
  const extra = supportingPhotos[slug as keyof typeof supportingPhotos] || [];
  const photos = image ? [image, ...extra].filter((photo, index, all) => all.findIndex(item => item.src === photo.src) === index) : [];
  const schema = { '@context': 'https://schema.org', '@type': 'Product', name: product.name, description: product.description, brand: { '@type': 'Brand', name: 'Thành Lợi Composite' }, url: siteUrl(`/san-pham/${slug}`), ...(image ? { image: siteUrl(image.src) } : {}) };
  const guidance = productGuidance(slug);

  return <main id="main" className="public-page product-focus">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }}/>
    <nav className="container breadcrumb detail-breadcrumb" aria-label="Đường dẫn"><Link href="/">Trang chủ</Link><span>/</span><Link href="/san-pham">Sản phẩm</Link><span>/</span><span>{product.category}</span></nav>
    <section className="container product-focus-top">
      {photos.length ? <ProductPhotoGallery key={slug} photos={photos}/> : <aside className="product-spec-portrait"><h2>Chế tạo theo điều kiện sử dụng.</h2><p>{guidance.selection.join('. ')}.</p><Link href="#tu-van" className="text-link">Trao đổi mẫu phù hợp <ArrowUpRight size={20}/></Link></aside>}
      <div className="product-focus-copy">
        <h1>{product.name}</h1>
        <p>{product.description}</p>
        <div className="product-applications">{product.applications.map(item => <span key={item}>{item}</span>)}</div>
        <h2>Quy cách</h2>
        <table className="spec-table"><tbody>{product.specifications.map(spec => <tr key={spec.label}><th scope="row">{spec.label}</th><td>{spec.value}</td></tr>)}</tbody></table>
        <Link href="#tu-van" className="button">Nhận tư vấn & báo giá <ArrowUpRight size={20}/></Link>
      </div>
    </section>
    <section className="detail-reading"><div className="container detail-reading-grid">
      <h2>Thông tin đặt hàng.</h2>
      <div className="detail-disclosures">
        <details><summary>Ứng dụng & điểm phù hợp</summary><ul>{guidance.benefits.map(text => <li key={text}>{text}</li>)}</ul></details>
        <details><summary>Cần chuẩn bị gì để nhận báo giá?</summary><ul>{guidance.selection.map(text => <li key={text}>{text}</li>)}</ul><p>Chưa có kích thước cụ thể? Gửi mục đích sử dụng và mặt bằng dự kiến để được tư vấn.</p></details>
        <details><summary>Lắp đặt & vận hành</summary><ul>{guidance.installation.map(text => <li key={text}>{text}</li>)}</ul><p>Cấu hình và phụ kiện được xác nhận theo từng đơn hàng.</p></details>
        <details><summary>Giao hàng & bảo hành</summary><p>Phạm vi vận chuyển, lắp đặt và thời hạn bảo hành được thống nhất trong báo giá hoặc hợp đồng.</p><p><Link href="/huong-dan-dat-hang#van-chuyen">Xem hướng dẫn giao nhận</Link> · <Link href="/huong-dan-dat-hang#bao-hanh">Điều kiện bảo hành</Link></p></details>
      </div>
    </div></section>
    <section id="tu-van" className="contact-section"><div className="container contact-layout"><div><h2>Nhận báo giá cho nhu cầu của bạn.</h2><p>Để lại số liên hệ và quy cách dự kiến. Thành Lợi sẽ trao đổi về {product.name.toLowerCase()}.</p></div><InquiryForm key={slug} product={product.name} compact/></div></section>
    <section className="container detail-related"><h2>Các dòng sản phẩm khác</h2><div className="detail-related-links">{items.filter(item => item.slug !== slug).slice(0,3).map(item => <Link key={item.slug} href={`/san-pham/${item.slug}`}>{item.name}<ArrowUpRight size={20}/></Link>)}</div></section>
  </main>;
}
