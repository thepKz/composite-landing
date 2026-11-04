'use client';

import { useId, useRef, useState } from 'react';
import { Expand, X } from 'lucide-react';

type Photo = { src: string; alt: string; label?: string };

export default function ProductPhotoGallery({ photos }: { photos: Photo[] }) {
  const [selected, setSelected] = useState(0);
  const imageId = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement>(null);
  const photo = photos[selected];
  if (!photo) return null;
  return <div className="detail-gallery">
    <div className="detail-gallery-heading"><span>Góc nhìn sản phẩm</span><button ref={opener} type="button" onClick={() => dialog.current?.showModal()}><Expand size={16}/>Xem ảnh lớn</button></div>
    <figure id={imageId} className="detail-gallery-main">
      <img key={photo.src} src={photo.src} alt={photo.alt} width={1000} height={1000}/>
      <figcaption><span>{photo.label || photo.alt}</span><span>{selected + 1} / {photos.length}</span></figcaption>
    </figure>
    {photos.length > 1 && <div className="detail-gallery-thumbs" aria-label="Chọn ảnh sản phẩm">
      {photos.map((item, index) => <button key={item.src} type="button" aria-label={`Xem ảnh: ${item.label || item.alt}`} aria-pressed={selected === index} aria-controls={imageId} onClick={() => setSelected(index)}><img src={item.src} alt="" width={100} height={80} loading="lazy"/></button>)}
    </div>}
    <dialog ref={dialog} className="detail-gallery-dialog" aria-label="Ảnh sản phẩm" onClose={() => opener.current?.focus({ preventScroll: true })} onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
      <button className="detail-gallery-close" type="button" autoFocus aria-label="Đóng ảnh" onClick={() => dialog.current?.close()}><X size={24}/></button>
      <figure><img src={photo.src} alt={photo.alt}/><figcaption>{photo.label || photo.alt}</figcaption></figure>
    </dialog>
  </div>;
}
