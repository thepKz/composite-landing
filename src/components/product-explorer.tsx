'use client';

import { useState } from 'react';
import { productAssetBySlug } from '@/lib/customer-product-assets';
import Link from 'next/link';
import { ArrowUpRight, Plus } from 'lucide-react';
import type { Product } from '@/lib/catalogue';

export default function ProductExplorer({ products }: { products: Product[] }) {
  const [selected, setSelected] = useState(products[0]?.slug);
  const product = products.find(item => item.slug === selected) || products[0];
  const asset = product ? productAssetBySlug[product.slug] : undefined;
  return <div className="product-explorer">
    <figure className="explorer-photo">
      {product?.cover_id ? <img key={product.cover_id} src={`/api/media/${product.cover_id}`} alt={product.name} loading="lazy"/> : asset ? <img key={asset.src} src={asset.src} alt={asset.alt} loading="lazy" width={asset.width} height={asset.height}/> : <div className="explorer-technical"><strong>{product?.specifications[0]?.value || 'Trao đổi quy cách'}</strong></div>}
      <figcaption><strong>{asset?.label || product?.name}</strong><span>{product?.applications.join(' / ')}</span></figcaption>
    </figure>
    <div className="explorer-options">
      {products.map((product, index) => <details className="explorer-item" name="product-choice" key={product.slug} open={index === 0} onToggle={event => { if(event.currentTarget.open) setSelected(product.slug); }}>
        <summary><span>{product.name}</span><Plus size={22} aria-hidden="true"/></summary>
        <div className="explorer-content">
          <p>{product.description}</p>
          <dl>{product.specifications.map(spec => <div key={spec.label}><dt>{spec.label}</dt><dd>{spec.value}</dd></div>)}</dl>
          <Link href={`/san-pham/${product.slug}`} className="text-link dark">Xem chi tiết <ArrowUpRight size={19}/></Link>
        </div>
      </details>)}
    </div>
  </div>;
}
