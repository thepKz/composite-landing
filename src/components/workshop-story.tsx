'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { editorialAssets } from '@/lib/customer-product-assets';
import ScrollDots from '@/components/home/scroll-dots';
import './workshop-story.css';

gsap.registerPlugin(ScrollTrigger);

const descriptions = [
  'Nhìn gần kết cấu, nắp mở và bề mặt thành phẩm.',
  'Đối chiếu kích thước sản phẩm với không gian sử dụng.',
  'Trao đổi quy cách trước khi thống nhất bàn giao.',
];

export default function WorkshopStory() {
  const root = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const [selected, setSelected] = useState(0);
  const photos = editorialAssets.gallery;

  function showPhoto(index: number, button: HTMLButtonElement) {
    opener.current = button;
    setSelected(index);
    dialog.current?.showModal();
  }

  function movePhoto(direction: number) {
    setSelected(index => (index + direction + photos.length) % photos.length);
  }

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const media = gsap.matchMedia(element);
    media.add('(min-width: 1000px) and (min-height: 680px) and (prefers-reduced-motion: no-preference)', () => {
      const stage = element.querySelector<HTMLElement>('.workshop-story-stage');
      const cards = gsap.utils.toArray<HTMLElement>('.workshop-story-frame', element);
      if (!stage || cards.length !== 3) return;

      // The static grid remains the default until this bounded scroll scene exists.
      element.setAttribute('data-story-motion', 'stack');
      gsap.set(cards, { xPercent: -50, yPercent: -50, transformOrigin: '50% 65%' });
      gsap.set(cards[0], { rotation: -4, scale: .94, zIndex: 3 });
      gsap.set(cards[1], { rotation: 5, scale: .92, y: 14, zIndex: 2 });
      gsap.set(cards[2], { rotation: -8, scale: .9, y: 26, zIndex: 1 });

      const scene = gsap.timeline({
        defaults: { ease: 'power2.inOut' },
        scrollTrigger: {
          trigger: stage,
          start: () => `top top+=${(document.querySelector('.public-header')?.getBoundingClientRect().height || 116) + 24}`,
          end: '+=560',
          scrub: .55,
          pin: true,
          invalidateOnRefresh: true,
        },
      });
      scene.to(cards[0], { width: '30%', xPercent: -160, rotation: -3, scale: 1, y: -18, duration: 1.1 }, .08)
        .to(cards[1], { width: '30%', xPercent: 60, rotation: 3, scale: 1, y: 20, duration: 1.1 }, .32)
        .to(cards[2], { width: '30%', xPercent: -50, rotation: 0, scale: 1, y: -12, duration: 1.1 }, .48)
        .fromTo('.workshop-story-thread', { scaleX: 0 }, { scaleX: 1, duration: 1.35, ease: 'none' }, .08);

      return () => element.removeAttribute('data-story-motion');
    });
    return () => media.revert();
  }, []);

  return <div className="workshop-story" ref={root}>
    <div className="workshop-story-stage" id="tl-photo-strip" aria-label="Ba góc nhìn về sản phẩm thực tế">
      <div className="workshop-story-thread" aria-hidden="true"/>
      {photos.map((photo, index) => <figure className="workshop-story-frame" key={photo.src}>
        <button className="workshop-story-photo" type="button" aria-label={`Xem ảnh lớn: ${photo.label}`} onClick={event => showPhoto(index, event.currentTarget)}><img src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} loading="lazy"/><span className="workshop-story-expand" aria-hidden="true"><ArrowUpRight size={22}/></span></button>
        <figcaption><strong>{photo.label}</strong><p>{descriptions[index]}</p></figcaption>
      </figure>)}
    </div>
    <ScrollDots target="tl-photo-strip" label="Ảnh sản phẩm" />
    <p className="workshop-story-note">Kiểu dáng, không gian sử dụng và quy cách được trao đổi cùng nhau.</p>
    <dialog ref={dialog} className="workshop-story-dialog" aria-label="Ảnh sản phẩm Thành Lợi" onClose={() => opener.current?.focus({ preventScroll: true })} onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }} onKeyDown={event => {
      if (event.key === 'ArrowLeft') { event.preventDefault(); movePhoto(-1); }
      if (event.key === 'ArrowRight') { event.preventDefault(); movePhoto(1); }
    }}>
      <button className="workshop-story-close" autoFocus type="button" aria-label="Đóng ảnh" onClick={() => dialog.current?.close()}><X size={24}/></button>
      <figure><img src={photos[selected].src} alt={photos[selected].alt} width={photos[selected].width} height={photos[selected].height}/><figcaption><span>{photos[selected].label}</span><span>{selected + 1} / {photos.length}</span></figcaption></figure>
      <div className="workshop-story-controls"><button type="button" onClick={() => movePhoto(-1)}><ChevronLeft size={20}/>Ảnh trước</button><button type="button" onClick={() => movePhoto(1)}>Ảnh tiếp theo<ChevronRight size={20}/></button></div>
    </dialog>
  </div>;
}
