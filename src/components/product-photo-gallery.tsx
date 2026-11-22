'use client';

import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react';
import Morph from '@/components/decor/morph';
import './product-assets.css';

export type GalleryPhoto = { src: string; alt: string; label?: string; width?: number; height?: number; /** Ảnh nhỏ cho dải chọn */ thumb?: string; /** Ảnh lớn cho hộp phóng to */ full?: string };

// Bộ xem ảnh sản phẩm: ảnh chính hiện trọn (khung chữ nhật, nền trung tính), dải ảnh nhỏ cuộn ngang, mũi tên, phím mũi tên,
// vuốt ngang, đếm "3 / 10", phóng to toàn màn (Esc đóng, tiêu điểm về nút đã mở). Chỉ ảnh đầu tải ngay, ảnh kế bên tải trước khi cần.
export default function ProductPhotoGallery({ photos, morph }: { photos: GalleryPhoto[]; morph?: string }) {
  const [selected, setSelected] = useState(0);
  const [direction, setDirection] = useState(1);
  const [closing, setClosing] = useState(false);
  const imageId = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement>(null);
  const strip = useRef<HTMLDivElement>(null);
  const swipeStart = useRef<{ x: number; y: number } | null>(null);
  const count = photos.length;
  const photo = photos[selected];

  const go = useCallback((step: number) => {
    if (count < 2) return;
    setDirection(step);
    setSelected(value => (value + step + count) % count);
  }, [count]);
  const pick = (index: number) => { setDirection(index > selected ? 1 : -1); setSelected(index); };

  // Tải trước ảnh kế bên, và cuộn dải ảnh nhỏ để ảnh đang chọn luôn thấy (chỉ cuộn ngang trong dải, không kéo cả trang).
  useEffect(() => {
    for (const step of [1, -1]) { const next = photos[(selected + step + count) % count]; if (next && next !== photo) { const img = new Image(); img.src = next.src; } }
    const box = strip.current; const button = box?.children[selected] as HTMLElement | undefined;
    if (box && button) box.scrollTo({ left: button.offsetLeft - (box.clientWidth - button.offsetWidth) / 2, behavior: 'smooth' });
  }, [selected, photos, count, photo]);

  function onKey(event: KeyboardEvent) {
    if (event.key === 'ArrowLeft') { event.preventDefault(); go(-1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); go(1); }
  }
  // Giữ Tab quay vòng trong hộp phóng to, không thoát ra trang phía sau.
  function trapTab(event: KeyboardEvent) {
    if (event.key !== 'Tab') return;
    const items = [...(dialog.current?.querySelectorAll<HTMLElement>('button:not([disabled])') ?? [])];
    if (!items.length) return;
    const first = items[0], last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
  function swipeDown(event: PointerEvent) { if (event.pointerType === 'touch' || event.pointerType === 'pen') swipeStart.current = { x: event.clientX, y: event.clientY }; }
  function swipeUp(event: PointerEvent) {
    const start = swipeStart.current; swipeStart.current = null;
    if (!start) return;
    const dx = event.clientX - start.x, dy = event.clientY - start.y;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5) go(dx < 0 ? 1 : -1);
  }
  function open() { setClosing(false); dialog.current?.showModal(); }
  function close() {
    if (closing) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { dialog.current?.close(); return; }
    setClosing(true);
    window.setTimeout(() => { dialog.current?.close(); setClosing(false); }, 170);
  }

  if (!photo) return null;
  const single = count === 1;
  const ratio = single && photo.width && photo.height ? Math.min(1.5, Math.max(0.8, photo.width / photo.height)) : undefined;
  const stage = <div className="pg-stage" role="group" aria-roledescription="thư viện ảnh" aria-label="Ảnh sản phẩm" tabIndex={0} onKeyDown={onKey} onPointerDown={swipeDown} onPointerUp={swipeUp} onPointerCancel={() => { swipeStart.current = null; }} style={ratio ? { ['--pg-ratio' as string]: ratio } : undefined}>
      <figure id={imageId} className="pg-figure" style={{ ['--dir' as string]: direction }}>
        <img key={photo.src} className="pg-photo" src={photo.src} alt={photo.alt} width={photo.width ?? 1200} height={photo.height ?? 900} draggable={false} loading={selected === 0 ? 'eager' : 'lazy'} fetchPriority={selected === 0 ? 'high' : 'auto'} decoding="async"/>
      </figure>
      {count > 1 && <span className="pg-count" aria-live="polite">{selected + 1} / {count}</span>}
      {count > 1 && <>
        <button type="button" className="pg-arrow is-prev pressable" aria-label="Ảnh trước" aria-controls={imageId} onClick={() => go(-1)}><ChevronLeft size={22} aria-hidden="true"/></button>
        <button type="button" className="pg-arrow is-next pressable" aria-label="Ảnh sau" aria-controls={imageId} onClick={() => go(1)}><ChevronRight size={22} aria-hidden="true"/></button>
      </>}
      <button ref={opener} type="button" className="pg-expand pressable" aria-label="Phóng to ảnh" onClick={open}><Expand size={18} aria-hidden="true"/><span>Phóng to</span></button>
    </div>;
  return <div className={`tp-gallery pg${single ? ' is-single' : ''}`} data-count={count}>
    {morph ? <Morph name={morph}>{stage}</Morph> : stage}
    {count > 1 && <div className="pg-thumbs" ref={strip} role="group" aria-label="Chọn ảnh sản phẩm" onKeyDown={onKey}>
      {photos.map((item, index) => <button key={item.src} type="button" className="pressable" aria-label={`Xem ảnh ${index + 1}${item.label ? `: ${item.label}` : ''}`} aria-pressed={selected === index} aria-controls={imageId} onClick={() => pick(index)}><img src={item.thumb || item.src} alt="" width={96} height={72} loading={index < 4 ? 'eager' : 'lazy'} decoding="async"/></button>)}
    </div>}
    <dialog ref={dialog} className={`tp-lightbox pg-lightbox${closing ? ' is-closing' : ''}`} aria-label="Ảnh sản phẩm phóng to" onCancel={event => { event.preventDefault(); close(); }} onClose={() => opener.current?.focus({ preventScroll: true })} onClick={event => { if (event.target === event.currentTarget) close(); }} onKeyDown={event => { onKey(event); trapTab(event); }}>
      <button className="pg-close pressable" type="button" autoFocus aria-label="Đóng ảnh" onClick={close}><X size={22} aria-hidden="true"/></button>
      <figure onPointerDown={swipeDown} onPointerUp={swipeUp} style={{ ['--dir' as string]: direction }}>
        <img key={photo.src} src={photo.full || photo.src} alt={photo.alt}/>
        <figcaption>{count > 1 && <span className="pg-count is-plain">{selected + 1} / {count}</span>}{photo.label && <span className="pg-caption">{photo.label}</span>}</figcaption>
      </figure>
      {count > 1 && <>
        <button type="button" className="pg-arrow is-prev pressable" aria-label="Ảnh trước" onClick={() => go(-1)}><ChevronLeft size={24} aria-hidden="true"/></button>
        <button type="button" className="pg-arrow is-next pressable" aria-label="Ảnh sau" onClick={() => go(1)}><ChevronRight size={24} aria-hidden="true"/></button>
      </>}
    </dialog>
  </div>;
}
