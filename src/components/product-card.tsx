import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { Product } from '@/lib/catalogue';
import { productAssetBySlug } from '@/lib/customer-product-assets';
import './product-assets.css';
export default function ProductCard({ product, compact = false }: { product: Product; compact?: boolean }) {
  const asset = productAssetBySlug[product.slug];
  const image = product.cover_id ? { src: `/api/media/${product.cover_id}`, alt: product.name } : asset;
  return <Link href={`/san-pham/${product.slug}`} className={`product-card${image ? '' : ' product-card-specification'}`} data-reveal>
    {image ? <div className={product.cover_id ? 'product-card-image' : 'product-card-image product-card-evidence'}><img src={image.src} alt={image.alt} loading="lazy"/></div> : <div className="product-card-material"><span>{product.category}</span><dl>{product.specifications.slice(0, 3).map(spec => <div key={spec.label}><dt>{spec.label}</dt><dd>{spec.value}</dd></div>)}</dl></div>}
    <div className="product-card-copy"><h3>{product.name}</h3>{compact ? <p>{product.applications.join(' · ')}</p> : <p>{product.description}</p>}<span className="product-card-link">Xem quy cách <ArrowUpRight size={19}/></span></div>
  </Link>;
}
