import type { CSSProperties } from 'react';

type Metric = { readonly value: string; readonly unit: string; readonly label: string };

// Nhãn rút gọn từ hồ sơ, không đổi nghĩa, để vừa hai dòng ở cột hẹp.
const shortLabel: Record<string, string> = {
  'Sản xuất và gia công composite FRP, từ năm 2010': 'Sản xuất composite FRP từ năm 2010',
  'Công trình, trang trại đã bàn giao và vận hành ổn định': 'Đã bàn giao và vận hành ổn định',
  'Khách hàng, đại lý, trang trại và nhà máy trên toàn quốc': 'Khách hàng, đại lý, trang trại, nhà máy',
  'Tuổi thọ thiết kế trong điều kiện tiêu chuẩn': 'Tuổi thọ thiết kế, điều kiện tiêu chuẩn',
  'Bảo hành tối đa, theo từng dòng sản phẩm': 'Bảo hành tối đa theo từng dòng',
};

// Dải số liệu không hộp: số lớn trên nền chung, đường kẻ mảnh ngăn giữa các số. Số đếm một lần khi cuộn tới (data-count của ScrollFx),
// chữ ban đầu đã là số cuối nên không có JavaScript vẫn đúng.
export default function MetricsStrip({ items }: { items: readonly Metric[] }) {
  return <section className="tl-metrics" aria-label="Số liệu nổi bật">
    <ul className="tl-metrics-list">
      {items.map((item, index) => {
        const match = /^(\d+)(.*)$/.exec(item.value);
        const target = match ? match[1] : item.value;
        const suffix = match ? match[2] : '';
        return <li key={item.label} className="tl-metric" data-reveal style={{ ['--reveal-index' as string]: index } as CSSProperties}>
          <p className="tl-metric-value">
            <span className="tl-metric-num" data-count={match ? target : undefined}>{target}</span>
            {suffix && <span className="tl-metric-plus">{suffix}</span>}
            <span className="tl-metric-unit">{item.unit}</span>
          </p>
          <p className="tl-metric-label">{shortLabel[item.label] ?? item.label}</p>
        </li>;
      })}
    </ul>
  </section>;
}
