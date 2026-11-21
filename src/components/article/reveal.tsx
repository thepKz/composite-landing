'use client';
import { useEffect } from 'react';

/** Đánh dấu khối [data-art-reveal] đã vào khung nhìn. Khối đang thấy sẵn thì hiện luôn, không chớp. */
export default function Reveal() {
  // Ảnh trong khung thẻ hiện dần khi tải xong. Có chốt an toàn 5 giây và khi lỗi: ảnh không bao giờ kẹt ẩn.
  useEffect(() => {
    const images = [...document.querySelectorAll<HTMLImageElement>('img[data-fade]')];
    const show = (image: HTMLImageElement) => image.classList.add('is-loaded');
    const cleanups: (() => void)[] = [];
    for (const image of images) {
      if (image.complete) { if (image.naturalWidth === 0) image.classList.add('is-broken'); show(image); continue; }
      const done = () => show(image);
      image.addEventListener('load', done, { once: true });
      const broken = () => { image.classList.add('is-broken'); show(image); };
      image.addEventListener('error', broken, { once: true });
      cleanups.push(() => { image.removeEventListener('load', done); image.removeEventListener('error', broken); });
    }
    const guard = window.setTimeout(() => images.forEach(show), 5000);
    return () => { window.clearTimeout(guard); cleanups.forEach(fn => fn()); };
  }, []);
  useEffect(() => {
    const root = document.documentElement;
    const items = [...document.querySelectorAll<HTMLElement>('[data-art-reveal]')];
    const viewport = window.innerHeight;
    const pending: HTMLElement[] = [];
    for (const item of items) {
      const rect = item.getBoundingClientRect();
      if (rect.top < viewport * 0.95 && rect.bottom > 0) item.classList.add('is-in');
      else pending.push(item);
    }
    root.classList.add('art-js');
    if (!pending.length) return () => { root.classList.remove('art-js'); };
    if (!('IntersectionObserver' in window)) { pending.forEach(item => item.classList.add('is-in')); return () => { root.classList.remove('art-js'); }; }
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) { entry.target.classList.add('is-in'); observer.unobserve(entry.target); }
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    pending.forEach(item => observer.observe(item));
    return () => { observer.disconnect(); root.classList.remove('art-js'); };
  }, []);
  return null;
}
