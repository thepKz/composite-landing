'use client';

import { useEffect, useRef, useState } from 'react';

// Chỉ báo vị trí cho dải cuộn ngang ở điện thoại: chấm sáng ở mục đang nằm gần mép trái, bấm chấm để nhảy tới mục đó.
export default function ScrollDots({ target, label }: { target: string; label: string }) {
  const [count, setCount] = useState(0);
  const [active, setActive] = useState(0);
  const strip = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const element = document.getElementById(target);
    if (!element) return;
    strip.current = element;
    const items = () => ([...element.children] as HTMLElement[]).filter(child => child.getClientRects().length > 0);
    setCount(items().length);
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const edge = element.getBoundingClientRect().left;
        let best = 0, distance = Infinity;
        items().forEach((item, index) => {
          const gap = Math.abs(item.getBoundingClientRect().left - edge - parseFloat(getComputedStyle(element).paddingLeft || '0'));
          if (gap < distance) { distance = gap; best = index; }
        });
        const atEnd = element.scrollLeft + element.clientWidth >= element.scrollWidth - 4;
        setActive(atEnd ? items().length - 1 : best);
      });
    };
    update();
    element.addEventListener('scroll', update, { passive: true });
    return () => { cancelAnimationFrame(frame); element.removeEventListener('scroll', update); };
  }, [target]);

  function go(index: number) {
    const item = ([...(strip.current?.children ?? [])] as HTMLElement[]).filter(child => child.getClientRects().length > 0)[index];
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    item?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', inline: 'start', block: 'nearest' });
  }

  if (count < 2) return null;
  return <div className="tl-dots" role="group" aria-label={label}>
    {Array.from({ length: count }, (_, index) => <button key={index} type="button" className="tl-dot" aria-label={`Mục ${index + 1} trên ${count}`} aria-current={index === active} onClick={() => go(index)}><span /></button>)}
  </div>;
}
