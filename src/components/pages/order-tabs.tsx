'use client';

import Link from 'next/link';
import { useId, useRef, useState, type KeyboardEvent } from 'react';
import { ArrowUpRight } from 'lucide-react';

export type OrderLine = { id: string; label: string; href: string; items: string[] };

// Thông tin cần cung cấp theo từng dòng sản phẩm. Tab có phím mũi tên, nội dung đổi có chuyển cảnh.
export default function OrderTabs({ lines }: { lines: OrderLine[] }) {
  const [active, setActive] = useState(0);
  const base = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const line = lines[active];

  function onKey(event: KeyboardEvent, index: number) {
    const last = lines.length - 1;
    let next = index;
    if (event.key === 'ArrowRight') next = index === last ? 0 : index + 1;
    else if (event.key === 'ArrowLeft') next = index === 0 ? last : index - 1;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = last;
    else return;
    event.preventDefault();
    setActive(next);
    refs.current[next]?.focus();
  }

  return <div className="tp-tabs">
    <div className="tp-tablist" role="tablist" aria-label="Dòng sản phẩm">
      {lines.map((item, index) => <button key={item.id} ref={node => { refs.current[index] = node; }} role="tab" type="button" id={`${base}-t${index}`} aria-controls={`${base}-p`} aria-selected={active === index} tabIndex={active === index ? 0 : -1} className="tp-tab pressable" onClick={() => setActive(index)} onKeyDown={event => onKey(event, index)}>{item.label}</button>)}
    </div>
    <div className="tp-tabpanel" role="tabpanel" id={`${base}-p`} aria-labelledby={`${base}-t${active}`}>
      <ol key={line.id} className="tp-order-list">{line.items.map(text => <li key={text}>{text}</li>)}</ol>
      <Link href={line.href} className="tp-text-link">Xem sản phẩm <ArrowUpRight size={18} aria-hidden="true"/></Link>
    </div>
  </div>;
}
