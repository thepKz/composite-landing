import Link from 'next/link';
import type { ReactNode } from 'react';
import { FlowSection, Pattern } from '@/components/decor';
import type { FlowSectionBackdrop } from '@/components/decor';
import type { Crumb } from './page-hero';
import './pages-v4.css';

/** Đường dẫn trang, dùng trên nền tối của đầu trang. */
export function Crumbs({ crumbs }: { crumbs: Crumb[] }) {
  return <nav className="tp4-crumbs" aria-label="Đường dẫn">
    {crumbs.map((crumb, index) => {
      const last = index === crumbs.length - 1;
      return <span className="tp-crumb" key={crumb.label}>
        {index > 0 && <span className="tp-crumb-sep" aria-hidden="true">/</span>}
        {crumb.href && !last ? <Link href={crumb.href}>{crumb.label}</Link> : <span aria-current={last ? 'page' : undefined}>{crumb.label}</span>}
      </span>;
    })}
  </nav>;
}

/**
 * Đầu trang phụ vòng bốn: nền sóng nhựa hoặc ảnh thật tan dần, tiêu đề một dòng trải hết bề rộng,
 * dưới là câu dẫn cùng nút và cụm hình chồng lớp (visual). Khối sau phải là FlowSection kề liền để mép cong nối được.
 */
export default function FlowHero({ tone = 'forest', crumbs, title, lead, actions, visual, backdrop, decor, id }: {
  tone?: 'forest' | 'teal';
  crumbs: Crumb[];
  title: string;
  lead?: string;
  actions?: ReactNode;
  visual?: ReactNode;
  backdrop?: FlowSectionBackdrop;
  decor?: ReactNode;
  id?: string;
}) {
  return <FlowSection id={id} tone={backdrop ? 'photo' : 'dark'} top="none" backdrop={backdrop} className={`tp4-hero tp4-fs--${tone}`}
    decor={<>
      <Pattern kind="resin" fade="both" opacity={0.5}/>
      <Pattern kind="ripple" size="clamp(260px,34vw,520px)" top="-12%" right="-8%" opacity={0.5} blend="screen"/>
      {decor}
    </>}>
    <div className={`tp4-hero__grid${visual ? ' has-visual' : ''}`}>
      <div className="tp4-hero__head"><Crumbs crumbs={crumbs}/><h1>{title}</h1></div>
      <div className="tp4-hero__copy">
        {lead && <p className="tp4-lead">{lead}</p>}
        {actions && <div className="tp4-actions">{actions}</div>}
      </div>
      {visual && <div className="tp4-hero__visual">{visual}</div>}
    </div>
  </FlowSection>;
}
