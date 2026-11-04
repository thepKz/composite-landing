import Link from 'next/link';
import ProductCard from '@/components/product-card';
import { products } from '@/lib/content';
export const metadata={title:'Sản phẩm',description:'Các dòng bồn bể composite Thành Lợi cho chăn nuôi, dân dụng, công nghiệp và thủy sản.',alternates:{canonical:'/san-pham'}};
export default async function Catalogue({searchParams}:{searchParams:Promise<{nhom?:string}>}) {
  const [items,query]=await Promise.all([products(),searchParams]);
  const groups=[...new Set(items.map(p=>p.category))];
  const active=groups.includes(query.nhom||'')?query.nhom:'';
  const shown=active?items.filter(p=>p.category===active):items;
  return <main id="main" className="public-page catalogue-refined">
    <section className="catalogue-heading"><div className="container"><nav className="breadcrumb" aria-label="Đường dẫn"><Link href="/">Trang chủ</Link><span>/</span><span>Sản phẩm</span></nav><div className="catalogue-heading-row"><h1>Sản phẩm cho từng nhu cầu.</h1><p>Chọn theo ứng dụng để xem hình ảnh, quy cách và thông tin đặt hàng.</p></div></div></section>
    <section className="catalogue-section"><div className="container">
      <nav className="category-filters" aria-label="Lọc nhóm sản phẩm"><Link href="/san-pham" aria-current={!active?'page':undefined}>Tất cả</Link>{groups.map(group=><Link href={`/san-pham?nhom=${encodeURIComponent(group)}`} key={group} aria-current={active===group?'page':undefined}>{group}</Link>)}</nav>
      <div className="catalogue-result-line"><h2>{active || 'Tất cả sản phẩm'} <span>({shown.length})</span></h2><Link href="/lien-he#gui-yeu-cau">Cần tư vấn lựa chọn?</Link></div>
      <div className="catalogue-grid">{shown.map(product=><ProductCard key={product.slug} product={product} compact/>)}</div>
    </div></section>
  </main>;
}
