'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { ChevronLeft, ChevronRight, Pause, Phone, Play } from 'lucide-react';
import { FlowSection, Pattern, ShapeFrame, Stack, StackStat } from '@/components/decor';
import { heightOf, photos, srcOf, srcSet } from './images';
import { facts } from '@/lib/site-facts';

// Ba cảnh theo mục 2.1 của hồ sơ, viết lại thành câu trọn vẹn, bỏ cam kết tuyệt đối. Ảnh đã xử lý đồng tông (scripts/xu-ly-anh-trang-chu.mjs).
// Mỗi cảnh một dáng khung lấy từ sản phẩm: cạnh vát (bể tròn lắp tại công trình), vòm (bể biogas), cạnh vát ngược (thùng trên xe).
const scenes = [
  {
    kicker: 'Thành Lợi Composite',
    title: 'Composite bền vững cho môi trường và sản xuất, chế tạo tại Phú Thọ',
    text: 'Bể biogas, bể phốt, bể xử lý nước thải, bồn hóa chất, bể thủy sản và sản phẩm theo yêu cầu đều chống ăn mòn và không gỉ.',
    image: photos.heroInstall,
    shape: 'slant', ratio: 1.3, focus: '30% 58%',
    stat: { value: '15+', unit: 'năm', label: 'Sản xuất composite FRP' },
    more: { href: '/san-pham', label: 'Xem sản phẩm' },
  },
  {
    kicker: 'Bể biogas và bể phốt',
    title: 'Bể biogas và bể phốt liền khối, kín khí, lắp đặt trong một đến hai ngày',
    text: 'Giải pháp xử lý chất thải cho nông hộ, trang trại, nhà ở, nhà trọ, khách sạn và khu công nghiệp.',
    image: photos.heroBiogas,
    shape: 'arch', ratio: 0.8, focus: '50% 62%',
    stat: { value: '1 đến 2', unit: 'ngày', label: 'Lắp đặt tại công trình' },
    more: { href: '/san-pham/be-biogas-composite', label: 'Xem bể biogas' },
  },
  {
    kicker: 'Thủy sản và vận tải',
    title: 'Bể nuôi thủy sản đáy phễu, hồ cá Koi và thùng chở hải sản sống',
    text: 'Bể đáy phễu thu cặn tự động, bề mặt láng bóng dễ vệ sinh, quy mô từ sân vườn gia đình đến trại nuôi RAS. Thùng chở lắp vừa xe bán tải đến xe tải.',
    image: photos.heroPickup,
    shape: 'slant-reverse', ratio: 1.3, focus: '56% 55%',
    stat: { value: '500 kg', unit: 'đến 15 tấn', label: 'Thùng lắp vừa xe' },
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
    const start = () => window.setTimeout(() => setWarm(true), 2500);
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

  return <FlowSection tone="dark" top="none" as="div" inner={false} className="tl-hero" decor={<><Pattern kind="weave" opacity={0.22} /><Pattern kind="resin" opacity={0.5} fade="both" /><Pattern kind="ripple" size="clamp(280px,40vw,620px)" bottom="-6%" left="-10%" opacity={0.28} blend="screen" /></>}>
    <section className="tl-hero-body" aria-roledescription="trình chiếu" aria-label="Giới thiệu Thành Lợi Composite" data-hold={hold} data-moved={cycle > 0}
      onMouseEnter={() => setHovering(true)} onMouseLeave={() => setHovering(false)}
      onFocusCapture={() => setFocusing(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocusing(false); }}
      onPointerDown={onPointerDown} onPointerUp={onPointerUp} onPointerCancel={() => { start.current = null; }} onKeyDown={onKeyDown}>
      <div className="tl-wrap">
        <div className="tl-hero-stage" aria-live={hold ? 'polite' : 'off'}>
          {scenes.map((scene, position) => {
            const active = position === index;
            const Heading = position === 0 ? 'h1' : 'h2';
            const show = position === 0 || warm;
            return <div key={scene.kicker} className="tl-hero-slide" data-active={active} role="group" aria-roledescription="cảnh" aria-label={`${position + 1} trên ${scenes.length}`} aria-hidden={!active} inert={!active}>
              <div className="tl-hero-copy">
                <Heading className="tl-hero-title"><Words text={scene.title} /></Heading>
                <p className="tl-rise tl-hero-text">{scene.text}</p>
                <div className="tl-rise tl-hero-actions">
                  <Link href="#tu-van" className="tl-hero-button is-primary pressable">Nhận báo giá</Link>
                  <Link href={scene.more.href} className="tl-hero-button is-ghost pressable">{scene.more.label}</Link>
                  <a href={`tel:${hotline.tel}`} className="tl-hero-call pressable"><Phone size={18} aria-hidden="true" />Gọi {hotline.display}</a>
                </div>
              </div>
              <div className="tl-hero-visual" style={{ ['--fr' as string]: scene.ratio }}>
                <Stack depth={false} pattern={{ kind: 'ripple', blend: 'screen', opacity: 0.6 }} floatAt="br" float={<StackStat value={scene.stat.value} unit={scene.stat.unit} label={scene.stat.label} tone="light" />}>
                  <ShapeFrame shape={scene.shape} ratio={scene.ratio} outline="bronze" focus={scene.focus}>
                    {show && <img src={srcOf(scene.image, 960)} srcSet={srcSet(scene.image)} sizes={scene.shape === 'arch' ? '(max-width: 760px) 70vw, 420px' : '(max-width: 760px) 90vw, 600px'} alt={active ? scene.image.alt : ''} width={960} height={heightOf(scene.image, 960)} fetchPriority={position === 0 ? 'high' : 'low'} loading={position === 0 ? 'eager' : 'lazy'} decoding={position === 0 ? 'sync' : 'async'} />}
                  </ShapeFrame>
                </Stack>
              </div>
            </div>;
          })}
        </div>
        <div className="tl-hero-controls">
          <div className="tl-hero-dots" role="group" aria-label="Chọn cảnh">
            {scenes.map((scene, position) => <button key={scene.kicker} type="button" className="tl-hero-dot" aria-label={`Cảnh ${position + 1}: ${scene.kicker}`} aria-current={position === index} onClick={() => go(position)}>
              <span className="tl-hero-dot-track">{position === index ? <i key={cycle} onAnimationEnd={() => go(index + 1)} /> : <i className={position < index ? 'is-done' : 'is-idle'} />}</span>
            </button>)}
          </div>
          <div className="tl-hero-arrows">
            <button type="button" className="tl-hero-arrow tl-hero-prev pressable" aria-label="Cảnh trước" onClick={() => go(index - 1)}><ChevronLeft size={22} aria-hidden="true" /></button>
            <button type="button" className="tl-hero-arrow pressable" aria-label={held ? 'Bật tự chuyển cảnh' : 'Dừng tự chuyển cảnh'} aria-pressed={held} onClick={() => setHeld(value => !value)}>{held ? <Play size={20} aria-hidden="true" /> : <Pause size={20} aria-hidden="true" />}</button>
            <button type="button" className="tl-hero-arrow tl-hero-next pressable" aria-label="Cảnh sau" onClick={() => go(index + 1)}><ChevronRight size={22} aria-hidden="true" /></button>
          </div>
        </div>
      </div>
    </section>
  </FlowSection>;
}
