import type { CSSProperties, ReactNode } from 'react';
import './flow-section.css';

export type FlowTone = 'dark' | 'light' | 'photo';
export type FlowEdge = 'fade' | 'arc' | 'dome' | 'wave' | 'none';

export type FlowBackdrop = {
  /** Ảnh nền (webp). Luôn có lớp phủ để chữ đạt tương phản 4,5:1. */
  src: string;
  srcSet?: string;
  sizes?: string;
  /** object-position của ảnh, ví dụ '50% 40%'. */
  position?: string;
  /** Độ đậm lớp phủ tối trên ảnh, 0 tới 1. Mặc định 0.72 (tone 'photo' và 'dark'), 0.0 không phủ. Với tone 'light' lớp phủ là màu giấy. */
  overlay?: number;
  /** Mờ dần phần ảnh ở mép để tan sang khối kề. Mặc định 'bottom'. */
  fade?: 'none' | 'top' | 'bottom' | 'both';
  /** Ảnh trượt chậm khi cuộn (cần ScrollFx). `true` là 0.08. */
  parallax?: boolean | number;
  /** Độ đục của ảnh trước khi phủ, 0 tới 1. Mặc định 1. */
  opacity?: number;
};

export type FlowSectionProps = {
  /** `dark` nền xanh đen chữ sáng, `light` nền giấy chữ tối, `photo` nền ảnh (bắt buộc có `backdrop`) chữ sáng. */
  tone?: FlowTone;
  /** Mép trên. `fade` chuyển màu dài 180px, `arc` cung thoải, `dome` vòm lớn, `wave` sóng thoải, `none` thẳng (chỉ dùng khi hai khối kề cùng tông). */
  top?: FlowEdge;
  /** Mép dưới, khối kế tiếp được kéo lên dưới mép này. Mỗi mối nối chỉ cần khai một bên (thường là `top` của khối sau). */
  bottom?: FlowEdge;
  backdrop?: FlowBackdrop;
  /** `false` thì khối không tô nền, để lớp nền cố định của FlowBackdrop lộ ra (nền liền toàn trang). Mép khi đó không có tác dụng. Mặc định true. */
  solid?: boolean;
  /** Bọc children trong cột có lề trái bằng lề phải (tối đa 1240px). `false` nếu trang tự lo bố cục. Mặc định true. */
  inner?: boolean;
  /** Thẻ gốc. Mặc định 'section'. */
  as?: 'section' | 'div' | 'aside' | 'footer';
  id?: string;
  className?: string;
  style?: CSSProperties;
  'aria-labelledby'?: string;
  'aria-label'?: string;
  /** Lớp trang trí đặt sau nội dung nhưng trước nền (Pattern, ShapeFrame cỡ lớn). Nằm trong vùng bị cắt theo mép. */
  decor?: ReactNode;
  children: ReactNode;
};

/** Vỏ khối trang. Nền (màu, ảnh, hoa văn) bị cắt theo hai mép bằng mask nên hai khối cạnh nhau không có đường ngang thẳng. */
export default function FlowSection({ tone = 'light', top = 'fade', bottom = 'none', backdrop, solid = true, inner = true, as: Tag = 'section', id, className, style, decor, children, ...aria }: FlowSectionProps) {
  const par = backdrop?.parallax === true ? 0.08 : typeof backdrop?.parallax === 'number' ? backdrop.parallax : 0;
  const overlay = backdrop?.overlay ?? (tone === 'light' ? 0.78 : 0.72);
  const bdStyle = backdrop
    ? ({ '--bd-pos': backdrop.position ?? '50% 50%', '--bd-o': backdrop.opacity ?? 1, '--bd-ov': overlay, '--bd-par': par || undefined } as CSSProperties)
    : undefined;
  return (
    <Tag id={id} className={`tl-fs${className ? ` ${className}` : ''}`} data-tone={tone} data-flow-tone={tone} data-top={top} data-bottom={bottom} data-solid={solid ? 'true' : 'false'} data-has-backdrop={backdrop ? 'true' : undefined} style={style} {...aria}>
      <div className="tl-fs__bg" aria-hidden="true">
        {backdrop ? (
          <div className="tl-fs__backdrop" data-fade={backdrop.fade ?? 'bottom'} style={bdStyle}>
            <div className="tl-fs__bd-media" data-parallax={par ? String(par) : undefined}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={backdrop.src} srcSet={backdrop.srcSet} sizes={backdrop.sizes ?? '100vw'} alt="" loading="lazy" decoding="async" draggable={false} />
            </div>
            <span className="tl-fs__overlay" />
          </div>
        ) : null}
        {decor}
      </div>
      <div className={inner ? 'tl-fs__body tl-fs__inner' : 'tl-fs__body'}>{children}</div>
    </Tag>
  );
}
