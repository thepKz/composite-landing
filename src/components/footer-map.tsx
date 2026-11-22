'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, MapPin } from 'lucide-react';

// Bản đồ chân trang: khung giữ chỗ có nội dung (địa chỉ và liên kết chỉ đường) hiện ngay.
// Bản đồ thật tải sớm khi còn cách khung nhìn khoảng hai màn rồi hiện dần đè lên khung giữ chỗ.
export default function FooterMap({ src, address, title }: { src: string; address: string; title: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [load, setLoad] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const element = box.current;
    if (!element) return;
    if (typeof IntersectionObserver === 'undefined') { setLoad(true); return; }
    const observer = new IntersectionObserver(entries => { if (entries.some(entry => entry.isIntersecting)) { setLoad(true); observer.disconnect(); } }, { rootMargin: '1600px 0px' });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const directions = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Thành Lợi Composite ${address}`)}`;
  return <div className="tl-footer-map" ref={box} data-ready={ready}>
    <div className="tl-footer-map-frame">
      <div className="tl-footer-map-holder"><MapPin size={28} aria-hidden="true" /><p>{address}</p>{!load && <button type="button" className="tl-footer-map-open pressable" onClick={() => setLoad(true)}>Xem bản đồ</button>}</div>
      {load && <iframe title={title} tabIndex={-1} src={src} referrerPolicy="no-referrer-when-downgrade" onLoad={() => setReady(true)} />}
    </div>
    <a className="tl-footer-map-link pressable" href={directions} target="_blank" rel="noopener noreferrer">Chỉ đường<ArrowUpRight size={20} aria-hidden="true" /></a>
  </div>;
}
