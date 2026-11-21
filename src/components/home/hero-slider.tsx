'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { ChevronLeft, ChevronRight, Pause, Phone, Play } from 'lucide-react';
import { editorialAssets, productAssetBySlug } from '@/lib/customer-product-assets';
import { facts } from '@/lib/site-facts';

// Ba cảnh theo mục 2.1 của hồ sơ. Chữ rút gọn, bỏ cam kết tuyệt đối. Ảnh chọn đúng sản phẩm và không phóng quá kích thước thật:
// ảnh ngang đủ lớn thì phủ cả khung, ảnh nhỏ hơn khung (ảnh dọc bể biogas) thì đóng khung một bên và chữ ở bên kia.
const biogasPhoto = productAssetBySlug['be-biogas-composite']!;
const pickup = editorialAssets.gallery[1];

const scenes = [
  {
    layout: 'cover',
    kicker: 'Thành Lợi Composite',
    title: 'Giải pháp composite bền vững cho môi trường và sản xuất',
    text: 'Bể biogas, bể phốt, bể xử lý nước thải, bồn hóa chất, bể thủy sản và sản phẩm theo yêu cầu. Chống ăn mòn, không gỉ, tuổi thọ thiết kế trên 30 năm.',
    image: editorialAssets.hero,
    position: 'center 42%',
    sizes: [['/images/products-2026/round-tanks-installation-w960.webp', 960], ['/images/products-2026/round-tanks-installation-w1600.webp', 1600], ['/images/products-2026/round-tanks-installation.webp', 2000]],
    more: { href: '/san-pham', label: 'Xem sản phẩm' },
  },
  {
    layout: 'frame',
    kicker: 'Bể biogas và bể phốt',
    title: 'Bể liền khối, kín khí, lắp đặt trong 1 đến 2 ngày',
    text: 'Xử lý chất thải cho nông hộ, trang trại, nhà ở, nhà trọ, khách sạn và khu công nghiệp.',
    image: biogasPhoto,
    position: 'center 30%',
    sizes: [['/images/products-2026/white-spherical-tank-w960.webp', 960], ['/images/products-2026/white-spherical-tank.webp', 1200]],
    more: { href: '/san-pham/be-biogas-composite', label: 'Xem bể biogas' },
  },
  {
    layout: 'cover',
    kicker: 'Thủy sản và vận tải',
    title: 'Thùng chở hải sản sống, bể nuôi thủy sản và hồ cá Koi',
    text: 'Bề mặt gelcoat láng bóng, dễ vệ sinh, thu cặn tiện lợi. Lắp vừa xe bán tải đến xe tải, từ hồ sân vườn đến trại nuôi tôm cá.',
    image: pickup,
    position: 'center 58%',
    sizes: [['/images/products-2026/pickup-blue-tank-w960.webp', 960], ['/images/products-2026/pickup-blue-tank.webp', 1600]],
    more: { href: '/san-pham/thung-cho-tom-ca', label: 'Xem thùng chở' },
  },
] as const;

const SWIPE = 48;

// Mỗi từ của tiêu đề trồi lên qua một mặt nạ riêng, so le theo thứ tự từ.
function Words({ text }: { text: string }) {
  return <>{text.split(' ').map((word, index) => <span key={index}><span className="tl-word"><span style={{ ['--w' as string]: index }}>{word}</span></span>{' '}</span>)}</>;
}

export default function HeroSlider({ hotline = facts.hotlines[0] }: { hotline?: { display: string; tel: string } }) {
  const [index, setIndex] = useState(0);
  const [cycle, setCycle] = useState(0);
  const [held, setHeld] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [focusing, setFocusing] = useState(false);
  const [warm, setWarm] = useState(false);
  const start = useRef<{ x: number; y: number } | null>(null);
  const hold = held || hovering || focusing;

  // Ảnh cảnh 2 và 3 chỉ tải sau khi trang đã nhàn, để ảnh cảnh đầu tải nhanh nhất.
  useEffect(() => {
    const start = () => window.setTimeout(() => setWarm(true), 900);
    if (document.readyState === 'complete') { const id = start(); return () => window.clearTimeout(id); }
    let id = 0;
    const onLoad = () => { id = start(); };
    window.addEventListener('load', onLoad, { once: true });
    return () => { window.removeEventListener('load', onLoad); window.clearTimeout(id); };
  }, []);

  const go = useCallback((target: number) => {
    setIndex(((target % scenes.length) + scenes.length) % scenes.length);
    setCycle(value => value + 1);
  }, []);

  function onPointerDown(event: PointerEvent<HTMLElement>) {
    if (event.pointerType === 'mouse') return;
    start.current = { x: event.clientX, y: event.clientY };
  }
  function onPointerUp(event: PointerEvent<HTMLElement>) {
    const origin = start.current;
    start.current = null;
    if (!origin) return;
    const dx = event.clientX - origin.x, dy = event.clientY - origin.y;
    if (Math.abs(dx) > SWIPE && Math.abs(dx) > Math.abs(dy) * 1.5) go(index + (dx < 0 ? 1 : -1));
  }
  function onKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.target instanceof HTMLElement && event.target.closest('input,textarea,select')) return;
    if (event.key === 'ArrowRight') { event.preventDefault(); go(index + 1); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); go(index - 1); }
  }

  return <section className="tl-hero" aria-roledescription="trình chiếu" aria-label="Giới thiệu Thành Lợi Composite" data-hold={hold}
    onMouseEnter={() => setHovering(true)} onMouseLeave={() => setHovering(false)}
    onFocusCapture={() => setFocusing(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocusing(false); }}
    onPointerDown={onPointerDown} onPointerUp={onPointerUp} onPointerCancel={() => { start.current = null; }} onKeyDown={onKeyDown}>
    <div className="tl-hero-stage" aria-live={hold ? 'polite' : 'off'}>
      {scenes.map((scene, position) => {
        const active = position === index;
        const Heading = position === 0 ? 'h1' : 'h2';
        return <div key={scene.kicker} className="tl-hero-slide" data-active={active} data-layout={scene.layout} role="group" aria-roledescription="cảnh" aria-label={`${position + 1} trên ${scenes.length}`} aria-hidden={!active} inert={!active}>
          <div className="tl-hero-slide-media" data-layout={scene.layout}>{(position === 0 || warm) && (scene.layout === 'frame'
            ? <figure className="tl-hero-frame"><img src={scene.sizes[1][0]} srcSet={scene.sizes.map(([url, width]) => `${url} ${width}w`).join(', ')} sizes="(max-width: 760px) 320px, 420px" alt={active ? scene.image.alt : ''} width={scene.image.width} height={scene.image.height} style={{ objectPosition: scene.position }} loading="lazy" decoding="async" /></figure>
            : <img className="tl-hero-slide-image" src={scene.sizes[1 % scene.sizes.length][0]} srcSet={scene.sizes.map(([url, width]) => `${url} ${width}w`).join(', ')} sizes="100vw" alt={active ? scene.image.alt : ''} width={scene.image.width} height={scene.image.height} style={{ objectPosition: scene.position }} fetchPriority={position === 0 ? 'high' : 'low'} decoding={position === 0 ? 'sync' : 'async'} />)}</div>
          <div className="container tl-hero-copy">
            <p className="tl-rise tl-hero-kicker">{scene.kicker}</p>
            <Heading className="tl-hero-title"><Words text={scene.title} /></Heading>
            <p className="tl-rise tl-hero-text">{scene.text}</p>
            <div className="tl-rise tl-hero-actions">
              <Link href="#tu-van" className="tl-hero-button is-primary pressable">Nhận báo giá</Link>
              <Link href={scene.more.href} className="tl-hero-button is-ghost pressable">{scene.more.label}</Link>
              <a href={`tel:${hotline.tel}`} className="tl-hero-call pressable"><Phone size={18} aria-hidden="true" />Gọi {hotline.display}</a>
            </div>
          </div>
        </div>;
      })}
    </div>
    <div className="container tl-hero-controls">
      <div className="tl-hero-dots" role="group" aria-label="Chọn cảnh">
        {scenes.map((scene, position) => <button key={scene.kicker} type="button" className="tl-hero-dot" aria-label={`Cảnh ${position + 1}: ${scene.kicker}`} aria-current={position === index} onClick={() => go(position)}>
          <span className="tl-hero-dot-track">{position === index ? <i key={cycle} onAnimationEnd={() => go(index + 1)} /> : <i className={position < index ? 'is-done' : 'is-idle'} />}</span>
        </button>)}
      </div>
      <div className="tl-hero-arrows">
        <button type="button" className="tl-hero-arrow pressable" aria-label="Cảnh trước" onClick={() => go(index - 1)}><ChevronLeft size={22} aria-hidden="true" /></button>
        <button type="button" className="tl-hero-arrow pressable" aria-label={held ? 'Bật tự chuyển cảnh' : 'Dừng tự chuyển cảnh'} aria-pressed={held} onClick={() => setHeld(value => !value)}>{held ? <Play size={20} aria-hidden="true" /> : <Pause size={20} aria-hidden="true" />}</button>
        <button type="button" className="tl-hero-arrow pressable" aria-label="Cảnh sau" onClick={() => go(index + 1)}><ChevronRight size={22} aria-hidden="true" /></button>
      </div>
    </div>
  </section>;
}
