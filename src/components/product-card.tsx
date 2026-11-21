import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { Product } from '@/lib/catalogue';
import { productAssetBySlug } from '@/lib/customer-product-assets';
import ProductTile from '@/components/pages/product-tile';
import './product-assets.css';

type Props = {
  product: Product;
  /** Thẻ gọn: không hiện mô tả, chỉ hiện nhóm ứng dụng */
  compact?: boolean;
  /** Đường dẫn khác mặc định, dùng cho thẻ nhóm sản phẩm */
  href?: string;
  /** Tên hiển thị khác tên sản phẩm, dùng cho thẻ nhóm */
  title?: string;
  /** 1 đến 3: dòng mũi nhọn, hiện nhãn nhận biết */
  rank?: number;
  /** Thứ tự xuất hiện để so le chuyển động */
  index?: number;
  /** Cho phép tắt hiện dần khi thẻ nằm trong khối tự có chuyển động riêng */
  still?: boolean;
};

// Thẻ sản phẩm. Ảnh thật đúng sản phẩm đặt trong khung có nền mờ cùng ảnh, ảnh nét nằm giữa.
// Sản phẩm chưa có ảnh xác nhận thì thẻ dựa vào thông số, không gán ảnh sai.
export default function ProductCard({ product, compact = false, href, title, rank, index = 0, still = false }: Props) {
  const asset = productAssetBySlug[product.slug];
  const image = product.cover_id ? { src: `/api/media/${product.cover_id}`, alt: product.name } : asset;
  const name = title || product.name;
  return <Link href={href || `/san-pham/${product.slug}`} className={`tp-card${rank ? ' is-flagship' : ''}${image ? '' : ' no-photo'}${still ? '' : ' tp-rv'}`} style={{ ['--i' as string]: index }}>
    <div className="tp-card-media">
      {image ? <>
        <img className="tp-card-photo" src={image.src} alt={image.alt} loading="lazy"/>
      </> : <ProductTile slug={product.slug} stat={product.specifications[0]?.value.split(":")[0]} label={product.specifications[0]?.label} />}
      {rank ? <span className="tp-flag">Mũi nhọn</span> : null}
    </div>
    <div className="tp-card-body">
      <span className="tp-card-category">{product.category}</span>
      <h3>{name}</h3>
      {!compact && <p>{product.description}</p>}
      <ul className="tp-chips" aria-label="Ứng dụng">{product.applications.slice(0, 3).map(item => <li key={item}>{item}</li>)}</ul>
      <span className="tp-card-more">Xem quy cách <ArrowUpRight size={18} aria-hidden="true"/></span>
    </div>
  </Link>;
}
