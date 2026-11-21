'use client';

import { useCallback, useId, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react';
import './product-assets.css';

type Photo = { src: string; alt: string; label?: string };

// Thư viện ảnh sản phẩm: ảnh chính có mũi tên, phím mũi tên, vuốt ngang, phóng to trong hộp thoại có chuyển cảnh.
export default function ProductPhotoGallery({ photos }: { photos: Photo[] }) {
  const [selected, setSelected] = useState(0);
  const [direction, setDirection] = useState(1);
  const [closing, setClosing] = useState(false);
  const imageId = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement>(null);
  const swipeStart = useRef<number | null>(null);
  const count = photos.length;
  const photo = photos[selected];

  const go = useCallback((step: number) => {
    if (count < 2) return;
    setDirection(step);
    setSelected(value => (value + step + count) % count);
  }, [count]);

  const pick = (index: number) => { setDirection(index > selected ? 1 : -1); setSelected(index); };

  function onKey(event: KeyboardEvent) {
    if (event.key === 'ArrowLeft') { event.preventDefault(); go(-1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); go(1); }
  }
  function swipeDown(event: PointerEvent) { if (event.pointerType === 'touch' || event.pointerType === 'pen') swipeStart.current = event.clientX; }
  function swipeUp(event: PointerEvent) {
    if (swipeStart.current === null) return;
    const delta = event.clientX - swipeStart.current;
    swipeStart.current = null;
    if (Math.abs(delta) > 40) go(delta < 0 ? 1 : -1);
  }
  function open() { setClosing(false); dialog.current?.showModal(); }
  function close() {
    if (closing) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { dialog.current?.close(); return; }
    setClosing(true);
    window.setTimeout(() => { dialog.current?.close(); setClosing(false); }, 170);
  }

  if (!photo) return null;
  const caption = photo.label || photo.alt;
  return <div className="tp-gallery">
    <div className="tp-gallery-stage" role="group" aria-roledescription="thư viện ảnh" aria-label="Ảnh sản phẩm" tabIndex={0} onKeyDown={onKey} onPointerDown={swipeDown} onPointerUp={swipeUp} onPointerCancel={() => { swipeStart.current = null; }}>
      <figure id={imageId} className="tp-gallery-figure" style={{ ['--dir' as string]: direction }}>
        <div className="tp-gallery-frame" key={photo.src}>
          <img className="tp-gallery-photo" src={photo.src} alt={photo.alt} width={1000} height={1000} draggable={false}/>
        </div>
        <figcaption><span>{caption}</span><span className="tp-gallery-count" aria-live="polite">{selected + 1} / {count}</span></figcaption>
      </figure>
      {count > 1 && <>
        <button type="button" className="tp-gallery-arrow is-prev pressable" aria-label="Ảnh trước" aria-controls={imageId} onClick={() => go(-1)}><ChevronLeft size={22} aria-hidden="true"/></button>
        <button type="button" className="tp-gallery-arrow is-next pressable" aria-label="Ảnh sau" aria-controls={imageId} onClick={() => go(1)}><ChevronRight size={22} aria-hidden="true"/></button>
      </>}
      <button ref={opener} type="button" className="tp-gallery-expand pressable" onClick={open}><Expand size={16} aria-hidden="true"/>Phóng to</button>
    </div>
    {count > 1 && <div className="tp-gallery-thumbs" role="group" aria-label="Chọn ảnh sản phẩm">
      {photos.map((item, index) => <button key={item.src} type="button" className="pressable" aria-label={`Xem ảnh: ${item.label || item.alt}`} aria-pressed={selected === index} aria-controls={imageId} onClick={() => pick(index)}><img src={item.src} alt="" width={100} height={80} loading="lazy"/></button>)}
    </div>}
    <dialog ref={dialog} className={`tp-lightbox${closing ? ' is-closing' : ''}`} aria-label="Ảnh sản phẩm phóng to" onCancel={event => { event.preventDefault(); close(); }} onClose={() => opener.current?.focus({ preventScroll: true })} onClick={event => { if (event.target === event.currentTarget) close(); }} onKeyDown={onKey}>
      <button className="tp-lightbox-close pressable" type="button" autoFocus aria-label="Đóng ảnh" onClick={close}><X size={22} aria-hidden="true"/></button>
      <figure onPointerDown={swipeDown} onPointerUp={swipeUp} style={{ ['--dir' as string]: direction }}>
        <img key={photo.src} src={photo.src} alt={photo.alt}/>
        <figcaption><span>{caption}</span><span className="tp-gallery-count">{selected + 1} / {count}</span></figcaption>
      </figure>
      {count > 1 && <>
        <button type="button" className="tp-gallery-arrow is-prev pressable" aria-label="Ảnh trước" onClick={() => go(-1)}><ChevronLeft size={24} aria-hidden="true"/></button>
        <button type="button" className="tp-gallery-arrow is-next pressable" aria-label="Ảnh sau" onClick={() => go(1)}><ChevronRight size={24} aria-hidden="true"/></button>
      </>}
    </dialog>
  </div>;
}
