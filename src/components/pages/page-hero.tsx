import Link from 'next/link';
import type { ReactNode } from 'react';

export type Crumb = { label: string; href?: string };
type Tone = 'forest' | 'teal' | 'lime' | 'paper';

// Đầu trang phụ: mỗi trang một tông và một nhịp riêng nhưng cùng hệ chữ, khoảng cách, đường dẫn.
export default function PageHero({ tone = 'forest', crumbs, title, lead, image, children, aside }: {
  tone?: Tone;
  crumbs: Crumb[];
  title: string;
  lead?: string;
  image?: { src: string; alt: string; width?: number; height?: number };
  children?: ReactNode;
  aside?: ReactNode;
}) {
  return <section className={`tp-hero tp-hero-${tone}${image ? ' has-photo' : ''}${aside ? ' has-aside' : ''}`}>
    <div className="tp-wrap tp-hero-grid">
      <div className="tp-hero-copy">
        <nav className="tp-crumbs" aria-label="Đường dẫn">
          {crumbs.map((crumb, index) => {
            const last = index === crumbs.length - 1;
            return <span className="tp-crumb" key={crumb.label}>
              {index > 0 && <span className="tp-crumb-sep" aria-hidden="true">/</span>}
              {crumb.href && !last ? <Link href={crumb.href}>{crumb.label}</Link> : <span aria-current={last ? 'page' : undefined}>{crumb.label}</span>}
            </span>;
          })}
        </nav>
        <h1>{title}</h1>
        {lead && <p className="tp-lead">{lead}</p>}
        {children && <div className="tp-hero-actions">{children}</div>}
      </div>
      {image && <figure className="tp-hero-photo"><img src={image.src} alt={image.alt} width={image.width} height={image.height} fetchPriority="high"/></figure>}
      {aside && <div className="tp-hero-aside">{aside}</div>}
    </div>
  </section>;
}
