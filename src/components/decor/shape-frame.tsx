import type { CSSProperties, ReactNode } from 'react';
import Morph from './morph';
import './shape-frame.css';

/** Tên dáng giữ nguyên để các trang cũ không vỡ. Từ vòng năm mọi dáng đều hiện thành khung chữ nhật hoặc vuông bo góc nhẹ,
 *  dáng chỉ còn quyết định tỉ lệ mặc định. Không clip-path, không mặt nạ, không cắt góc. */
export type FrameShape = 'arch' | 'circle' | 'ring' | 'capsule' | 'slant' | 'slant-reverse' | 'porthole-trio';

export type ShapeFrameProps = {
  shape: FrameShape;
  /** Thẻ img (hoặc picture) đặt trong khung. */
  children: ReactNode;
  /** Tỉ lệ rộng / cao của khung. Với ảnh sản phẩm hãy đặt đúng bằng width / height thật của ảnh để thấy trọn ảnh. Mặc định theo dáng. */
  ratio?: number;
  /** Cách đặt ảnh. 'contain' (mặc định, an toàn cho ảnh sản phẩm): thấy trọn ảnh, khoảng thừa nằm trên nền giấy.
   *  'cover': phủ kín khung và cắt phần thừa, chỉ dùng cho ảnh trang trí hoặc khi tỉ lệ khung đã bằng tỉ lệ ảnh. */
  fit?: 'contain' | 'cover';
  /** Viền mảnh lệch ra ngoài một nhịp, hình chữ nhật. `true` là màu đồng, hoặc chọn 'bronze' | 'light' | 'green' | 'navy'. */
  outline?: boolean | 'bronze' | 'light' | 'green' | 'navy';
  /** Khoảng lệch của viền (px). Mặc định 14. */
  outlineOffset?: number;
  /** Hướng lệch của viền. Mặc định 'br' (xuống phải). */
  outlineDirection?: 'br' | 'bl' | 'tr' | 'tl';
  /** Ảnh trượt chậm hơn khung khi cuộn. Chỉ có tác dụng khi fit='cover' (ảnh phải rộng hơn khung mới trượt được). Cần ScrollFx trên trang. */
  parallax?: boolean | number;
  /** Trọng tâm của ảnh trong khung (object-position), ví dụ '50% 30%'. */
  focus?: string;
  /** Bo góc (px). Mặc định 12. */
  radius?: number;
  /** Tên morph chung (xem morphName). Hai khung ở hai trang cùng tên thì ảnh biến từ khung này sang khung kia khi chuyển trang. */
  morph?: string;
  className?: string;
  style?: CSSProperties;
};

/** Tỉ lệ mặc định theo dáng, chỉ để khung có hình khi không truyền `ratio`. */
const DEFAULT_RATIO: Record<FrameShape, number> = {
  arch: 0.8,
  circle: 1,
  ring: 1,
  capsule: 2,
  slant: 1.5,
  'slant-reverse': 1.5,
  'porthole-trio': 1.5,
};

const OUTLINE_COLOR: Record<string, string> = { bronze: 'var(--decor-bronze,#c9985a)', light: 'rgb(255 255 255 / .7)', green: 'var(--tl-green,#187447)', navy: 'var(--tl-navy,#103b50)' };

/** Khung ảnh chữ nhật hoặc vuông, bo góc nhẹ. Ảnh nằm trong khung theo `fit`. */
export default function ShapeFrame({ shape, children, ratio, fit = 'contain', outline, outlineOffset = 14, outlineDirection = 'br', parallax, focus, radius = 12, morph, className, style }: ShapeFrameProps) {
  const r = ratio ?? DEFAULT_RATIO[shape];
  const speed = fit === 'cover' ? (parallax === true ? 0.12 : typeof parallax === 'number' ? parallax : 0) : 0;
  const color = outline ? OUTLINE_COLOR[typeof outline === 'string' ? outline : 'bronze'] : undefined;
  const dx = outlineDirection.endsWith('r') ? 1 : -1;
  const dy = outlineDirection.startsWith('b') ? 1 : -1;
  const vars = {
    '--sf-ratio': r,
    '--sf-focus': focus ?? '50% 50%',
    '--sf-par': speed || undefined,
    '--sf-radius': `${radius}px`,
    '--sf-ox': `${dx * outlineOffset}px`,
    '--sf-oy': `${dy * outlineOffset}px`,
    '--sf-outline': color,
    ...style,
  } as CSSProperties;
  const frame = (
    <div className={`tl-sf${className ? ` ${className}` : ''}`} data-shape={shape} data-fit={fit} data-sf="" data-sf-parallax={speed ? '' : undefined} style={vars}>
      {outline ? <span className="tl-sf__outline" aria-hidden="true" data-sf-outline="" /> : null}
      <div className="tl-sf__mask">
        <div className="tl-sf__media" data-parallax={speed ? String(speed) : undefined} data-sf-media="">
          {children}
        </div>
      </div>
    </div>
  );
  return morph ? <Morph name={morph}>{frame}</Morph> : frame;
}
