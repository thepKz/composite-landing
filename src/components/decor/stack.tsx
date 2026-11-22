import type { CSSProperties, ReactNode } from 'react';
import Pattern, { type PatternProps } from './pattern';
import './stack.css';

export type StackProps = {
  /** Lớp 2, tiêu điểm: thường là một ShapeFrame. */
  children: ReactNode;
  /** Lớp 1, hoa văn nằm sau và ló ra ngoài mép. Chỉ cần `kind`, vị trí mặc định theo `float` đối diện. */
  pattern?: PatternProps;
  /** Lớp 3, thứ nổi đè góc: ảnh nhỏ (kèm ShapeFrame), StackStat hoặc StackCard. */
  float?: ReactNode;
  /** Góc đặt lớp nổi. Mặc định 'br' (dưới phải). Hoa văn ló ra ở góc đối diện. */
  floatAt?: 'br' | 'bl' | 'tr' | 'tl';
  /** Lớp nổi và hoa văn tách nhẹ theo độ sâu khi cuộn (cần ScrollFx). Mặc định true. */
  depth?: boolean;
  /** Lớp nổi nằm dưới ảnh, chỉ chạm mép dưới 20px, để không che sản phẩm. Dùng cho mọi ảnh sản phẩm. */
  clear?: boolean;
  className?: string;
  style?: CSSProperties;
};

const OPPOSITE = { br: 'tl', bl: 'tr', tr: 'bl', tl: 'br' } as const;

/** Cụm chồng lớp tối đa ba lớp. Ở 390px các lớp gọn lại, không ló quá mép khung nhìn. */
export default function Stack({ children, pattern, float, floatAt = 'br', depth = true, clear = false, className, style }: StackProps) {
  const corner = OPPOSITE[floatAt];
  return (
    <div className={`tl-stack${className ? ` ${className}` : ''}`} data-float-at={floatAt} data-clear={clear ? "" : undefined} style={style}>
      {pattern ? (
        <div className="tl-stack__pattern" data-corner={corner} data-depth={depth ? '-0.5' : undefined} aria-hidden="true">
          <Pattern {...pattern} className={`tl-stack__pt${pattern.className ? ` ${pattern.className}` : ''}`} />
        </div>
      ) : null}
      <div className="tl-stack__main">{children}</div>
      {float ? (
        <div className="tl-stack__float" data-depth={depth ? '0.7' : undefined}>
          {float}
        </div>
      ) : null}
    </div>
  );
}

export type StackStatProps = {
  /** Số lớn. Số thì đếm một lần khi cuộn tới (ScrollFx); chữ thì hiện nguyên. */
  value: number | string;
  /** Đơn vị đi kèm, ví dụ 'năm'. */
  unit?: string;
  /** Dòng nhãn ngắn dưới số. Bỏ trống nếu số và đơn vị đã tự nói đủ. */
  label?: string;
  decimals?: number;
  /** Phân cách hàng nghìn (1.500). Tắt khi số là năm, ví dụ 2010. Mặc định true. */
  grouping?: boolean;
  tone?: 'dark' | 'light';
};

/** Thẻ số liệu lớn, nằm nửa trong nửa ngoài khung ảnh khi đặt làm lớp nổi. */
export function StackStat({ value, unit, label, decimals = 0, grouping = true, tone = 'dark' }: StackStatProps) {
  const numeric = typeof value === 'number';
  const shown = numeric ? value.toLocaleString('vi-VN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals, useGrouping: grouping }) : value;
  return (
    <div className="tl-stat" data-tone={tone}>
      <p className="tl-stat__line">
        <span className="tl-stat__num" data-count={numeric ? String(value) : undefined} data-count-decimals={numeric && decimals ? String(decimals) : undefined} data-count-group={numeric && !grouping ? 'false' : undefined}>{shown}</span>
        {unit ? <span className="tl-stat__unit">{unit}</span> : null}
      </p>
      {label ? <p className="tl-stat__label">{label}</p> : null}
    </div>
  );
}

/** Thẻ chữ đè góc ảnh. Chữ nằm trên nền đặc, không bao giờ đè lên vùng ảnh nhiễu. */
export function StackCard({ children, tone = 'light' }: { children: ReactNode; tone?: 'dark' | 'light' }) {
  return <div className="tl-stackcard" data-tone={tone}>{children}</div>;
}
