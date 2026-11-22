'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const GEOMETRY = 'path,line,polyline,polygon,circle,ellipse,rect';

function format(value: number, decimals: number, grouping = true) {
  return value.toLocaleString('vi-VN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals, useGrouping: grouping });
}

/**
 * Bộ khởi tạo GSAP duy nhất cho bốn móc:
 * - data-parallax="0.12": phần tử trượt chậm hơn khối cha (tỉ lệ chiều cao, ±), theo tiến độ cuộn.
 * - data-depth="0.6": tách nhẹ theo độ sâu, số âm trượt ngược. Cỡ dịch tối đa 48px nhân với số này.
 * - data-draw: đường SVG (hoặc nhóm) vẽ dần theo cuộn. data-draw="once" thì vẽ một lần khi vào khung nhìn.
 * - data-count="1500": đếm số một lần khi cuộn tới. Chỉ áp cho phần tử không có phần tử con, nên không đụng tới
 *   các thuộc tính data-count đã dùng làm số lượng ở lưới tin. Thêm data-count-decimals="1" nếu cần số lẻ, data-count-group="false" để bỏ dấu phân cách (năm).
 * Nạp GSAP động, không chặn màn đầu. Bỏ qua hoàn toàn khi giảm chuyển động (nội dung đã ở trạng thái cuối).
 * Đặt một lần trên mỗi trang. Dọn sạch khi rời trang.
 */
export default function ScrollFx() {
  const pathname = usePathname();

  useEffect(() => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    if (reduced.matches) return;
    let cancelled = false;
    let revert: (() => void) | undefined;
    const timers: number[] = [];

    (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([import('gsap'), import('gsap/ScrollTrigger')]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      const ctx = gsap.context(() => {
        const scrub = { ease: 'none' } as const;

        document.querySelectorAll<HTMLElement>('[data-parallax]').forEach(element => {
          const speed = parseFloat(element.dataset.parallax ?? '');
          if (!Number.isFinite(speed) || speed === 0) return;
          gsap.fromTo(element, { yPercent: -speed * 100 }, { yPercent: speed * 100, ...scrub, scrollTrigger: { trigger: element.parentElement ?? element, start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true } });
        });

        document.querySelectorAll<HTMLElement>('[data-depth]').forEach(element => {
          const depth = parseFloat(element.dataset.depth ?? '');
          if (!Number.isFinite(depth) || depth === 0) return;
          const travel = depth * 48;
          gsap.fromTo(element, { y: -travel }, { y: travel, ...scrub, scrollTrigger: { trigger: element.parentElement ?? element, start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true } });
        });

        document.querySelectorAll<SVGElement>('[data-draw]').forEach(element => {
          const shapes = element.matches(GEOMETRY) ? [element] : Array.from(element.querySelectorAll<SVGElement>(GEOMETRY));
          if (!shapes.length) return;
          const once = element.getAttribute('data-draw') === 'once';
          shapes.forEach(shape => { shape.setAttribute('pathLength', '1'); });
          const trigger = element.ownerSVGElement ?? element;
          gsap.fromTo(shapes, { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, ease: once ? 'power2.out' : 'none', duration: once ? 1.2 : undefined, stagger: once ? 0.12 : 0, scrollTrigger: once ? { trigger, start: 'top 85%', once: true } : { trigger, start: 'top 80%', end: 'bottom 55%', scrub: true, invalidateOnRefresh: true } });
        });

        document.querySelectorAll<HTMLElement>('[data-count]').forEach(element => {
          if (element.childElementCount > 0) return;
          const target = parseFloat(element.dataset.count ?? '');
          if (!Number.isFinite(target)) return;
          const decimals = Number(element.dataset.countDecimals ?? '0') || 0;
          const grouping = element.dataset.countGroup !== 'false';
          const final = format(target, decimals, grouping);
          const state = { value: 0 };
          let done = false;
          const finish = () => { done = true; element.textContent = final; };
          element.textContent = format(0, decimals, grouping);
          timers.push(window.setTimeout(() => { if (!done) finish(); }, 4500));
          ScrollTrigger.create({
            trigger: element, start: 'top 88%', once: true,
            onEnter: () => {
              gsap.to(state, { value: target, duration: 1.4, ease: 'power2.out', onUpdate: () => { element.textContent = format(state.value, decimals, grouping); }, onComplete: finish });
            },
          });
        });
      });
      revert = () => ctx.revert();
      requestAnimationFrame(() => { if (!cancelled) ScrollTrigger.refresh(); });
    })();

    const onChange = () => { if (reduced.matches) { revert?.(); revert = undefined; } };
    reduced.addEventListener('change', onChange);
    return () => {
      cancelled = true;
      reduced.removeEventListener('change', onChange);
      timers.forEach(window.clearTimeout);
      revert?.();
      // Đưa số đếm về giá trị cuối khi dọn, để quay lại trang không thấy số 0.
      document.querySelectorAll<HTMLElement>('[data-count]').forEach(element => {
        if (element.childElementCount > 0) return;
        const target = parseFloat(element.dataset.count ?? '');
        if (Number.isFinite(target)) element.textContent = format(target, Number(element.dataset.countDecimals ?? '0') || 0, element.dataset.countGroup !== 'false');
      });
    };
  }, [pathname]);

  return null;
}
