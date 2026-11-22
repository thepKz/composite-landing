import type { CSSProperties } from 'react';
import './pattern.css';

/** Năm hoa văn nền đã xử lý ở public/images/decor/ (chạy scripts/build-decor.mjs). */
export type PatternKind = 'ripple' | 'drum' | 'weave' | 'resin' | 'paper';

export type PatternProps = {
  kind: PatternKind;
  /** Độ đục 0 tới 1. Mặc định theo loại: hoa văn nét mảnh .55, vải sợi .18, sóng nhựa .5, giấy .9, trống đồng .28. */
  opacity?: number;
  /** Bề rộng của hoa văn tách rời (ripple, drum), ví dụ '420px' hoặc 'clamp(240px,32vw,480px)'. Resin, paper, weave luôn phủ kín khối cha. */
  size?: string;
  /** Vị trí tuyệt đối trong khối cha. Đưa số âm để hoa văn ló ra ngoài mép, ví dụ { right: '-8%', top: '-12%' }. */
  top?: string; right?: string; bottom?: string; left?: string;
  /** Xoay (độ). */
  rotate?: number;
  /** Cách trộn với nền. 'screen' hợp nền tối, 'multiply' hợp nền sáng. Mặc định 'normal'. */
  blend?: 'normal' | 'screen' | 'multiply' | 'soft-light';
  /** Mờ dần ở mép (mask) cho resin và paper. Mặc định 'none'. */
  fade?: 'none' | 'bottom' | 'top' | 'both' | 'edges';
  className?: string;
  style?: CSSProperties;
};

const FILES: Record<PatternKind, { base: string; widths: number[]; ratio: string }> = {
  ripple: { base: 'gon-nuoc', widths: [480, 960], ratio: '3 / 2' },
  drum: { base: 'trong-dong', widths: [480, 720], ratio: '1 / 1' },
  weave: { base: 'soi-thuy-tinh', widths: [512], ratio: '1 / 1' },
  resin: { base: 'song-nhua', widths: [960, 1600], ratio: '16 / 9' },
  paper: { base: 'giay-soi', widths: [960, 1600], ratio: '16 / 9' },
};

const DEFAULT_OPACITY: Record<PatternKind, number> = { ripple: 0.55, drum: 0.28, weave: 0.18, resin: 0.5, paper: 0.9 };

const dir = '/images/decor';

/** Lớp trang trí tuyệt đối. aria-hidden, alt rỗng, tải lười. Không thay ảnh sản phẩm và không nhận sự kiện chuột. */
export default function Pattern({ kind, opacity, size, top, right, bottom, left, rotate, blend, fade = 'none', className, style }: PatternProps) {
  const f = FILES[kind];
  const o = opacity ?? DEFAULT_OPACITY[kind];
  const vars = { '--pt-o': o, mixBlendMode: blend && blend !== 'normal' ? blend : undefined, transform: rotate ? `rotate(${rotate}deg)` : undefined, ...style } as CSSProperties;
  const cls = `tl-pt tl-pt--${kind}${className ? ` ${className}` : ''}`;
  if (kind === 'weave') {
    return <span className={cls} aria-hidden="true" data-pattern={kind} data-fade={fade} style={{ ...vars, backgroundImage: `url(${dir}/${f.base}-512.webp)` }} />;
  }
  const src = `${dir}/${f.base}-${f.widths[f.widths.length - 1]}.webp`;
  const srcSet = f.widths.map(w => `${dir}/${f.base}-${w}.webp ${w}w`).join(', ');
  const place: CSSProperties = kind === 'ripple' || kind === 'drum' ? { top, right, bottom, left, width: size ?? (kind === 'drum' ? '360px' : '420px'), aspectRatio: f.ratio } : {};
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img className={cls} src={src} srcSet={srcSet} sizes={size ?? '100vw'} alt="" aria-hidden="true" loading="lazy" decoding="async" draggable={false} data-pattern={kind} data-fade={fade} style={{ ...vars, ...place }} />
  );
}
