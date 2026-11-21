'use client';

import { useEffect } from 'react';

// Hiện dần khi cuộn tới. Nội dung mặc định luôn thấy được: lớp ẩn chỉ bật khi script chạy
// và người dùng không chọn giảm chuyển động. Có đồng hồ an toàn để không khối nào bị kẹt.
export default function Reveal() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const root = document.documentElement;
    const nodes = [...document.querySelectorAll<HTMLElement>('.tp-rv')];
    if (!nodes.length) return;
    const show = (el: Element) => el.classList.add('tp-in');
    root.classList.add('tp-js');
    const viewport = window.innerHeight;
    nodes.forEach(el => { if (el.getBoundingClientRect().top < viewport * 0.96) show(el); });
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { show(entry.target); observer.unobserve(entry.target); }
    }), { rootMargin: '0px 0px -6% 0px' });
    nodes.forEach(el => { if (!el.classList.contains('tp-in')) observer.observe(el); });
    const safety = window.setTimeout(() => nodes.forEach(show), 5000);
    return () => { window.clearTimeout(safety); observer.disconnect(); root.classList.remove('tp-js'); };
  }, []);
  return null;
}
