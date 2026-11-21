'use client';

import { useEffect, useRef, useState } from 'react';

type Metric = { readonly value: string; readonly unit: string; readonly label: string };

// Nhãn rút gọn từ hồ sơ, không đổi nghĩa, để vừa hai dòng ở cột hẹp.
const shortLabel: Record<string, string> = {
  'Sản xuất và gia công composite FRP, từ năm 2010': 'Sản xuất composite FRP từ năm 2010',
  'Công trình, trang trại đã bàn giao và vận hành ổn định': 'Đã bàn giao',
  'Khách hàng, đại lý, trang trại và nhà máy trên toàn quốc': 'Khách hàng, đại lý',
  'Tuổi thọ thiết kế trong điều kiện tiêu chuẩn': 'Tuổi thọ thiết kế, điều kiện tiêu chuẩn',
  'Bảo hành tối đa, theo từng dòng sản phẩm': 'Bảo hành tối đa',
};

function Count({ value }: { value: string }) {
  const match = /^(\d+)(.*)$/.exec(value);
  const target = match ? Number(match[1]) : 0;
  const suffix = match ? match[2] : '';
  const element = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(target);

  useEffect(() => {
    if (!match || matchMedia('(prefers-reduced-motion: reduce)').matches || !element.current) return;
    let frame = 0;
    const observer = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) return;
      observer.disconnect();
      const begin = performance.now();
      const duration = 1300;
      const tick = (now: number) => {
        const progress = Math.min(1, Math.max(0, (now - begin) / duration));
        setShown(Math.round(target * (1 - Math.pow(1 - progress, 3))));
        if (progress < 1) frame = requestAnimationFrame(tick);
      };
      setShown(0);
      frame = requestAnimationFrame(tick);
    }, { threshold: 0.6 });
    observer.observe(element.current);
    return () => { observer.disconnect(); cancelAnimationFrame(frame); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!match) return <span>{value}</span>;
  return <span ref={element}><span aria-hidden="true">{shown}{suffix}</span><span className="tl-sr">{value}</span></span>;
}

// Dải số liệu: số lớn đếm lên khi cuộn tới, có đường kẻ ngăn giữa các ô.
export default function MetricsStrip({ items }: { items: readonly Metric[] }) {
  return <section className="tl-metrics" aria-label="Số liệu nổi bật">
    <div className="container">
      <ul className="tl-metrics-list">
        {items.map((item, index) => <li key={item.label} className="tl-metric" data-reveal style={{ ['--reveal-index' as string]: index }}>
          <p className="tl-metric-value"><Count value={item.value} /><span className="tl-metric-unit">{item.unit}</span></p>
          <p className="tl-metric-label">{shortLabel[item.label] ?? item.label}</p>
        </li>)}
      </ul>
    </div>
  </section>;
}
