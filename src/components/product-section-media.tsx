import type { ReactNode } from 'react';
import type { SectionLayout } from '@/lib/product-layout';

export default function ProductSectionMedia({ value, productName, children }: { value?: SectionLayout; productName: string; children: ReactNode }) {
  if (!value?.images.length) return <>{children}</>;
  return <div className={`product-section-media is-${value.position}`}>
    <div className="product-section-media__content">{children}</div>
    <div className={`product-section-media__images is-${value.layout}`}>
      {value.images.map(image => <figure key={image.media_id}>
        <img src={`/api/media/${image.media_id}`} alt={image.alt || productName} width={960} height={720} loading="lazy" style={{ objectFit: image.fit }}/>
        {image.caption && <figcaption>{image.caption}</figcaption>}
      </figure>)}
    </div>
  </div>;
}
