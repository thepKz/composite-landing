'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { publicChoreography } from '@/lib/public-choreography';

gsap.registerPlugin(ScrollTrigger);

// Lo hai việc cho mọi trang công khai: hiện dần so le các khối `data-reveal`, và dựng các cảnh GSAP.
// Lưới an toàn cho khối hiện dần, theo ba lớp:
// 1. Quan sát giao cắt với vùng đệm 200px phía trên và dưới, nên khối hiện ngay khi sắp vào khung nhìn.
// 2. Quét định kỳ mỗi 250ms: khối đã nằm trong hoặc phía trên khung nhìn mà chưa hiện (cuộn nhảy, máy chậm) thì hiện ngay. Sau 1 giây kể từ khi tải, mọi khối ở phía trên cũng hiện hết.
// 3. Nếu script này chưa chạy sau 2 giây thì CSS (chrome.css, quy tắc html:not([data-tl-motion])) tự hiện mọi khối.
export default function PublicMotion() {
  const pathname = usePathname();

  useEffect(() => {
    document.documentElement.setAttribute('data-tl-motion', 'on');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const targets = [...document.querySelectorAll<HTMLElement>('[data-reveal]:not([data-revealed]), .tp-rv:not(.tp-in), [data-art-reveal]:not(.is-in)')];
    const pending = new Set(targets);
    // Ba hệ hiện dần cùng tồn tại trên các trang công khai: data-reveal (trang chủ), tp-rv (trang phụ), data-art-reveal (tin và bài). Lưới an toàn phủ cả ba.
    const show = (element: HTMLElement) => {
      if (element.hasAttribute('data-reveal')) element.setAttribute('data-revealed', 'true');
      if (element.classList.contains('tp-rv')) element.classList.add('tp-in');
      if (element.hasAttribute('data-art-reveal')) element.classList.add('is-in');
      pending.delete(element);
    };
    let observer: IntersectionObserver | undefined;
    let sweep = 0;
    if (reduced.matches || typeof IntersectionObserver === 'undefined') targets.forEach(show);
    else {
      observer = new IntersectionObserver(entries => {
        let index = 0;
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const element = entry.target as HTMLElement;
          observer?.unobserve(element);
          if (!element.style.getPropertyValue('--reveal-index')) element.style.setProperty('--reveal-index', String(Math.min(index, 4)));
          index += 1;
          show(element);
        }
      }, { threshold: 0, rootMargin: '200px 0px 200px 0px' });
      targets.forEach(element => observer!.observe(element));
      const started = performance.now();
      sweep = window.setInterval(() => {
        if (!pending.size) { window.clearInterval(sweep); return; }
        const limit = window.innerHeight + 120;
        const aboveAll = performance.now() - started > 1000;
        for (const element of [...pending]) {
          const box = element.getBoundingClientRect();
          if (box.height === 0 && box.width === 0) continue;
          if (box.top < limit && (box.bottom > 0 || aboveAll)) { element.style.setProperty('--reveal-index', '0'); show(element); observer?.unobserve(element); }
        }
      }, 250);
    }
    let cleanup: (() => void) | undefined;
    const frame = requestAnimationFrame(() => { cleanup = publicChoreography(gsap, ScrollTrigger); ScrollTrigger.sort(); ScrollTrigger.refresh(); });
    return () => { observer?.disconnect(); window.clearInterval(sweep); cancelAnimationFrame(frame); cleanup?.(); };
  }, [pathname]);

  return null;
}
