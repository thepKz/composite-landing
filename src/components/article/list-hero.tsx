import Link from 'next/link';
import type { CSSProperties, ReactNode } from 'react';
import { FlowSection, Pattern, type FlowSectionBackdrop } from '@/components/decor';
import './list.css';

/** Đầu trang danh sách (tin tức, dự án): nền sóng nhựa hoặc ảnh thật tan dần, mép dưới nhường cho khối sáng kế tiếp bằng sóng. */
export default function ListHero({ id, crumb, title, lead, backdrop, aside, titleWidth }: { titleWidth?: string; id: string; crumb: string; title: string; lead: string; backdrop?: FlowSectionBackdrop; aside?: ReactNode }) {
  return <FlowSection tone={backdrop ? 'photo' : 'dark'} top="none" className="lh" aria-labelledby={id} backdrop={backdrop}
    style={{ '--fs-pad': 'clamp(32px,4vw,56px)', '--lh-h1': titleWidth } as CSSProperties}
    decor={<>
      <Pattern kind="resin" opacity={backdrop ? 0.3 : 0.62} fade="bottom" />
      <Pattern kind="ripple" size="clamp(260px,36vw,560px)" top="-26%" right="-8%" opacity={0.5} blend="screen" />
    </>}>
    <nav className="lh-crumbs" aria-label="Đường dẫn"><Link href="/">Trang chủ</Link><span aria-hidden="true">/</span><span aria-current="page">{crumb}</span></nav>
    <div className="lh-grid">
      <div className="lh-text">
        <h1 id={id}>{title}</h1>
        <p>{lead}</p>
      </div>
      {aside ? <div className="lh-aside">{aside}</div> : null}
    </div>
  </FlowSection>;
}
