import type { CSSProperties, ReactNode } from 'react';
import Morph from './morph';
import './shape-frame.css';

/** Các dáng khung. Mỗi dáng lấy từ chính sản phẩm: vòm bể biogas, bể tròn nhìn từ trên, bồn nằm, thùng xe. */
export type FrameShape = 'arch' | 'circle' | 'ring' | 'capsule' | 'slant' | 'slant-reverse' | 'porthole-trio';

export type ShapeFrameProps = {
  shape: FrameShape;
  /** Thẻ img (hoặc picture) đặt trong khung. Ảnh được phủ kín khung bằng object-fit: cover. */
  children: ReactNode;
  /** Tỉ lệ rộng / cao của khung. Mặc định theo dáng. Đổi tỉ lệ thì dáng vẫn đúng vì đường cắt được tính lại theo tỉ lệ. */
  ratio?: number;
  /** Viền mảnh lệch ra ngoài một nhịp, vẽ đúng theo dáng khung. `true` là màu đồng, hoặc chọn 'bronze' | 'light' | 'green' | 'navy'. */
  outline?: boolean | 'bronze' | 'light' | 'green' | 'navy';
  /** Khoảng lệch của viền (px). Mặc định 14. Âm hoặc dương đều được, đặt `outlineDirection` để đổi hướng. */
  outlineOffset?: number;
  /** Hướng lệch của viền. Mặc định 'br' (xuống phải). */
  outlineDirection?: 'br' | 'bl' | 'tr' | 'tl';
  /** Ảnh trượt chậm hơn khung khi cuộn. `true` ứng với 0.12 (tỉ lệ chiều cao khung), hoặc đưa số từ 0.04 tới 0.3. Cần ScrollFx trên trang. */
  parallax?: boolean | number;
  /** Trọng tâm cắt ảnh, ví dụ '50% 30%'. Đặt cho từng ảnh để không cắt mất sản phẩm. */
  focus?: string;
  /** Tên morph chung (xem morphName). Hai khung ở hai trang cùng tên thì ảnh biến từ khung này sang khung kia khi chuyển trang. */
  morph?: string;
  className?: string;
  style?: CSSProperties;
};

const DEFAULT_RATIO: Record<FrameShape, number> = {
  arch: 0.8,
  circle: 1,
  ring: 1,
  capsule: 2.2,
  slant: 1.5,
  'slant-reverse': 1.5,
  'porthole-trio': 2.2,
};

const n = (value: number) => Number(value.toFixed(3));

/** Đường viền của dáng trong hệ toạ độ rộng 100, cao 100/ratio. Cung tròn luôn là cung tròn thật vì đo theo đúng tỉ lệ khung. */
export function framePath(shape: FrameShape, ratio: number): { d: string; evenodd: boolean; h: number } {
  const w = 100;
  const h = n(100 / ratio);
  switch (shape) {
    case 'arch': {
      const r = w / 2;
      return { d: `M0 ${h}V${r}A${r} ${r} 0 0 1 ${w} ${r}V${h}Z`, evenodd: false, h };
    }
    case 'circle': {
      const ry = h / 2;
      return { d: `M0 ${ry}A50 ${n(ry)} 0 1 1 100 ${ry}A50 ${n(ry)} 0 1 1 0 ${ry}Z`, evenodd: false, h };
    }
    case 'ring': {
      const ry = h / 2;
      const ix = 50 * 0.56;
      const iy = ry * 0.56;
      const outer = `M0 ${ry}A50 ${n(ry)} 0 1 1 100 ${ry}A50 ${n(ry)} 0 1 1 0 ${ry}Z`;
      const inner = `M${n(50 - ix)} ${ry}A${n(ix)} ${n(iy)} 0 1 0 ${n(50 + ix)} ${ry}A${n(ix)} ${n(iy)} 0 1 0 ${n(50 - ix)} ${ry}Z`;
      return { d: outer + inner, evenodd: true, h };
    }
    case 'capsule': {
      const r = n(h / 2);
      return { d: `M${r} 0H${n(w - r)}A${r} ${r} 0 0 1 ${n(w - r)} ${h}H${r}A${r} ${r} 0 0 1 ${r} 0Z`, evenodd: false, h };
    }
    case 'slant': {
      // Thùng xe: vát một góc trên bên trái, đáy phẳng.
      return { d: `M0 ${n(h * 0.24)}L${n(w * 0.7)} 0H${w}V${h}H0Z`, evenodd: false, h };
    }
    case 'slant-reverse': {
      return { d: `M0 0H${n(w * 0.3)}L${w} ${n(h * 0.24)}V${h}H0Z`, evenodd: false, h };
    }
    case 'porthole-trio': {
      // Ba ô vòm cạnh nhau, một ảnh trải qua cả ba.
      const gap = 3;
      const cell = (w - gap * 2) / 3;
      const r = cell / 2;
      const arch = (x: number) => `M${n(x)} ${h}V${n(r)}A${n(r)} ${n(r)} 0 0 1 ${n(x + cell)} ${n(r)}V${h}Z`;
      return { d: arch(0) + arch(cell + gap) + arch((cell + gap) * 2), evenodd: false, h };
    }
  }
}

const OUTLINE_COLOR: Record<string, string> = { bronze: 'var(--decor-bronze,#c9985a)', light: 'rgb(255 255 255 / .7)', green: 'var(--tl-green,#187447)', navy: 'var(--tl-navy,#103b50)' };

export function clipId(shape: FrameShape, ratio: number) {
  return `tl-clip-${shape}-${String(ratio).replace('.', '_')}`;
}

/** Khung ảnh không vuông. Dùng clip-path tham chiếu SVG nội tuyến, có dự phòng bo góc khi trình duyệt không hỗ trợ. */
export default function ShapeFrame({ shape, children, ratio, outline, outlineOffset = 14, outlineDirection = 'br', parallax, focus, morph, className, style }: ShapeFrameProps) {
  const r = ratio ?? DEFAULT_RATIO[shape];
  const { d, evenodd, h } = framePath(shape, r);
  const id = clipId(shape, r);
  const speed = parallax === true ? 0.12 : typeof parallax === 'number' ? parallax : 0;
  const color = outline ? OUTLINE_COLOR[typeof outline === 'string' ? outline : 'bronze'] : undefined;
  const dx = outlineDirection.endsWith('r') ? 1 : -1;
  const dy = outlineDirection.startsWith('b') ? 1 : -1;
  const vars = {
    '--sf-ratio': r,
    '--sf-focus': focus ?? '50% 50%',
    '--sf-par': speed || undefined,
    '--sf-ox': `${dx * outlineOffset}px`,
    '--sf-oy': `${dy * outlineOffset}px`,
    '--sf-outline': color,
    ...style,
  } as CSSProperties;
  const frame = (
    <div className={`tl-sf${className ? ` ${className}` : ''}`} data-shape={shape} data-sf="" data-sf-parallax={speed ? '' : undefined} style={vars}>
      <svg className="tl-sf__defs" width="0" height="0" aria-hidden="true" focusable="false">
        <defs>
          <clipPath id={id} clipPathUnits="objectBoundingBox">
            <path d={d} clipRule={evenodd ? 'evenodd' : 'nonzero'} transform={`scale(0.01 ${(1 / h).toFixed(8)})`} />
          </clipPath>
        </defs>
      </svg>
      {outline ? (
        <svg className="tl-sf__outline" viewBox={`0 0 100 ${h}`} preserveAspectRatio="none" aria-hidden="true" focusable="false" data-sf-outline="">
          <path d={d} fillRule={evenodd ? 'evenodd' : 'nonzero'} fill="none" stroke="currentColor" strokeWidth="1.25" vectorEffect="non-scaling-stroke" />
        </svg>
      ) : null}
      <div className="tl-sf__mask" style={{ clipPath: `url(#${id})` }}>
        <div className="tl-sf__media" data-parallax={speed ? String(speed) : undefined} data-sf-media="">
          {children}
        </div>
      </div>
    </div>
  );
  return morph ? <Morph name={morph}>{frame}</Morph> : frame;
}
