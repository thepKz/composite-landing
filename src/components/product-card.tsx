import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { Product } from '@/lib/catalogue';
import { productPhotos } from '@/lib/product-photos';
import ProductTile from '@/components/pages/product-tile';
import { Morph, morphName } from '@/components/decor';
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
  /** Thẻ nằm ngang: ảnh bên trái, chữ bên phải. Dùng trong khối bento của danh mục */
  wide?: boolean;
  /** Hiện nhãn nhóm trên thẻ. Tắt khi bộ lọc đã nói rõ nhóm */
  showCategory?: boolean;
  /** Thẻ lớn của khối bento: ảnh cao, chữ to hơn */
  feature?: boolean;
  /** Gắn tên morph để ảnh và tên biến thành đầu trang chi tiết. Chỉ bật khi thẻ dẫn đúng tới trang của chính sản phẩm */
  morph?: boolean;
  /** Không còn dùng: khung ảnh luôn là chữ nhật bo nhẹ. Giữ để các nơi gọi cũ không gãy */
  shape?: string;
};

// Rút gọn con số lớn trong ô thay thế: "Từ 1 m³ đến 100 m³ trở lên" thành "1 – 100+ m³".
export const shortStat = (value?: string) => value?.replace(/^Từ\s+([\d.,]+)\s*m³\s+đến\s+([\d.,]+)\s*m³\s+trở lên$/i, '$1 – $2+ m³');

// Thẻ sản phẩm. Ảnh thật đúng sản phẩm đặt trong khung có nền mờ cùng ảnh, ảnh nét nằm giữa.
// Sản phẩm chưa có ảnh xác nhận thì thẻ dựa vào thông số, không gán ảnh sai.
export default function ProductCard({ product, compact = false, href, title, rank, index = 0, still = false, wide = false, feature = false, showCategory = true, morph = false }: Props) {
  const own = productPhotos[product.slug]?.[0];
  const image = product.cover_id ? { src: `/api/media/${product.cover_id}`, alt: product.name, width: 1200, height: 900 } : own ? { src: own.src, alt: own.alt, width: own.width, height: own.height } : undefined;
  const name = title || product.name;
  const frame = <div className="tp-card-frame">
    {image
      ? <img className="tp-card-photo" src={image.src} sizes={feature ? '(min-width: 1000px) 480px, 92vw' : wide ? '(min-width: 1000px) 280px, 92vw' : '(min-width: 1000px) 300px, 92vw'} alt={image.alt} width={image.width} height={image.height} loading="lazy" decoding="async"/>
      : <ProductTile slug={product.slug} stat={shortStat(product.specifications[0]?.value.split(':')[0])} />}
  </div>;
  const media = morph && image ? <Morph name={morphName('product-photo', product.slug)}>{frame}</Morph> : frame;
  const heading = <h3 className={name.length > 26 ? 'is-long' : undefined}>{name}</h3>;
  return <Link href={href || `/san-pham/${product.slug}`} className={`tp-card${wide ? ' is-wide' : ''}${feature ? ' is-feature' : ''}${rank ? ' is-flagship' : ''}${image ? '' : ' no-photo'}${still ? '' : ' tp-rv'}`} style={{ ['--i' as string]: index }}>
    <div className="tp-card-media">{media}</div>
    <div className="tp-card-body">
      {showCategory && <span className="tp-card-category">{product.category}</span>}
      {morph ? <Morph name={morphName('product-title', product.slug)}>{heading}</Morph> : heading}
      {!compact && <p>{product.description}</p>}
      <ul className="tp-chips" aria-label="Ứng dụng">{product.applications.slice(0, 3).map(item => <li key={item}>{item}</li>)}</ul>
      <span className="tp-card-more"><span className="tp-sr">Xem quy cách</span><ArrowUpRight size={20} aria-hidden="true"/></span>
    </div>
  </Link>;
}
