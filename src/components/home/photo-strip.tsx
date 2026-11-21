'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowUpRight, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { heightOf, srcOf, srcSet, strip } from './images';

// Dải ảnh thật: cùng chiều cao, ảnh dọc hẹp hơn ảnh ngang, cuộn ngang bằng ngón tay, nút mũi tên hoặc phím.
// Bấm ảnh mở hộp xem lớn (tiêu điểm vào trong, Esc đóng, tiêu điểm về ảnh đã bấm).
export default function PhotoStrip() {
  const track = useRef<HTMLUListElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const [selected, setSelected] = useState(0);
  const [progress, setProgress] = useState(0);
  const [edges, setEdges] = useState({ start: true, end: false });

  const measure = useCallback(() => {
    const element = track.current;
    if (!element) return;
    const max = element.scrollWidth - element.clientWidth;
    setProgress(max > 0 ? element.scrollLeft / max : 0);
    setEdges({ start: element.scrollLeft < 4, end: element.scrollLeft > max - 4 });
  }, []);

  useEffect(() => {
    const element = track.current;
    if (!element) return;
    measure();
    let frame = 0;
    const onScroll = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(measure); };
    element.addEventListener('scroll', onScroll, { passive: true });
    const resize = new ResizeObserver(measure);
    resize.observe(element);
    return () => { cancelAnimationFrame(frame); element.removeEventListener('scroll', onScroll); resize.disconnect(); };
  }, [measure]);

  function slide(direction: number) {
    const element = track.current;
    if (!element) return;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    element.scrollBy({ left: direction * Math.max(280, element.clientWidth * 0.7), behavior: reduce ? 'auto' : 'smooth' });
  }

  function open(index: number, button: HTMLButtonElement) {
    opener.current = button;
    setSelected(index);
    dialog.current?.showModal();
  }
  const move = (direction: number) => setSelected(index => (index + direction + strip.length) % strip.length);
  const current = strip[selected];
  const big = current.widths[current.widths.length - 1];

  return <div className="tl-strip">
    <ul className="tl-strip-track" ref={track} aria-label="Dải ảnh sản phẩm thật" tabIndex={0} onKeyDown={event => {
      if (event.key === 'ArrowRight') { event.preventDefault(); slide(1); }
      if (event.key === 'ArrowLeft') { event.preventDefault(); slide(-1); }
    }}>
      {strip.map((item, index) => <li key={item.base} className="tl-strip-item" style={{ ['--ratio' as string]: item.ratio }}>
        <figure>
          <button type="button" className="tl-strip-photo" aria-label={`Xem ảnh lớn: ${item.alt}`} style={{ backgroundImage: `url(${item.lqip})` }} onClick={event => open(index, event.currentTarget)}>
            <img src={srcOf(item, item.widths[1])} srcSet={srcSet(item)} sizes="(max-width: 760px) 80vw, 520px" alt={item.alt} width={item.widths[1]} height={heightOf(item, item.widths[1])} loading="eager" decoding={index < 3 ? 'sync' : 'async'} />
            <span className="tl-strip-expand" aria-hidden="true"><ArrowUpRight size={22} /></span>
          </button>
        </figure>
      </li>)}
    </ul>
    <div className="tl-strip-bar">
      <div className="tl-strip-progress" aria-hidden="true"><span style={{ transform: `scaleX(${Math.max(0.12, progress)})` }} /></div>
      <div className="tl-strip-arrows">
        <button type="button" className="tl-hero-arrow tl-strip-arrow pressable" aria-label="Ảnh trước" disabled={edges.start} onClick={() => slide(-1)}><ChevronLeft size={22} aria-hidden="true" /></button>
        <button type="button" className="tl-hero-arrow tl-strip-arrow pressable" aria-label="Ảnh sau" disabled={edges.end} onClick={() => slide(1)}><ChevronRight size={22} aria-hidden="true" /></button>
      </div>
    </div>
    <dialog ref={dialog} className="tl-lightbox" aria-label="Ảnh sản phẩm Thành Lợi" onClose={() => opener.current?.focus({ preventScroll: true })}
      onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }}
      onKeyDown={event => { if (event.key === 'ArrowLeft') { event.preventDefault(); move(-1); } if (event.key === 'ArrowRight') { event.preventDefault(); move(1); } }}>
      <button className="tl-lightbox-close" autoFocus type="button" aria-label="Đóng ảnh" onClick={() => dialog.current?.close()}><X size={24} aria-hidden="true" /></button>
      <figure>
        <img src={srcOf(current)} alt={current.alt} width={big} height={heightOf(current, big)} style={{ backgroundImage: `url(${current.lqip})` }} />
        <figcaption><span>{selected + 1} trên {strip.length}</span></figcaption>
      </figure>
      <div className="tl-lightbox-controls">
        <button type="button" className="pressable" onClick={() => move(-1)}><ChevronLeft size={20} aria-hidden="true" />Ảnh trước</button>
        <button type="button" className="pressable" onClick={() => move(1)}>Ảnh sau<ChevronRight size={20} aria-hidden="true" /></button>
      </div>
    </dialog>
  </div>;
}
