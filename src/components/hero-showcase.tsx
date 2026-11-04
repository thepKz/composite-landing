'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Pause, Play } from 'lucide-react';

const scenes = [
  { file: '07', title: 'Bể composite dạng hộp', alt: 'Bể composite màu xanh dạng chữ nhật tại xưởng' },
  { file: '08', title: 'Nhiều kiểu dáng bồn bể', alt: 'Các bể composite màu xanh và cam trong xưởng' },
  { file: '02', title: 'Sản phẩm tại xưởng', alt: 'Nhiều cấu kiện và bồn bể composite tại xưởng' },
];

export default function HeroShowcase() {
  const root = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(true);
  const [visible, setVisible] = useState(false);
  const [foreground, setForeground] = useState(true);
  const [interacting, setInteracting] = useState(false);
  const [focused, setFocused] = useState(false);
  const running = !paused && !reduced && visible && foreground && !interacting && !focused;

  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduced(preference.matches);
    const visibility = () => setForeground(!document.hidden);
    sync(); visibility(); preference.addEventListener('change', sync);
    document.addEventListener('visibilitychange', visibility);
    const observer = new IntersectionObserver(entries => setVisible(entries[0].isIntersecting), { threshold: 0.2 });
    if (root.current) observer.observe(root.current);
    return () => { observer.disconnect(); preference.removeEventListener('change', sync); document.removeEventListener('visibilitychange', visibility); };
  }, []);

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      if (document.hidden || !root.current) return;
      const bounds = root.current.getBoundingClientRect();
      if (bounds.bottom <= 0 || bounds.top >= window.innerHeight) return;
      setSelected(value => (value + 1) % scenes.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [running]);

  function choose(index: number) { setSelected(index); setPaused(true); }

  return <div ref={root} className="hero-studio" data-running={running} role="region" aria-label="Ảnh sản phẩm Thành Lợi" aria-roledescription="trình chiếu ảnh"
    onMouseEnter={() => setInteracting(true)} onMouseLeave={() => setInteracting(false)}
    onFocusCapture={() => setFocused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
    <span className="studio-word" aria-hidden="true">COMPOSITE</span>
    <div className="studio-plate">
      {scenes.map((scene, index) => <figure key={scene.file} className={`studio-slide ${index === selected ? 'is-current' : ''}`} aria-hidden={index !== selected}>
        <img src={`/images/customer/customer-${scene.file}.webp`} alt={scene.alt} fetchPriority={index === 0 ? 'high' : 'low'} width="1276" height="956"/>
      </figure>)}
      <div className="studio-caption"><span>SẢN PHẨM THÀNH LỢI<strong>{scenes[selected].title}</strong></span></div>
    </div>
    <figure className="studio-detail"><img src="/images/customer/customer-01.webp" alt="Chi tiết bề mặt lòng bể composite xanh" width="1920" height="2560"/><figcaption>Chi tiết bề mặt <ArrowUpRight size={16}/></figcaption></figure>
    <div className="studio-controls" aria-label="Điều khiển ảnh">
      {scenes.map((scene, index) => <button key={scene.file} type="button" aria-label={`Xem ảnh ${index + 1}: ${scene.title}`} aria-pressed={index === selected} onClick={() => choose(index)}><img src={`/images/customer/customer-${scene.file}.webp`} alt="" width="64" height="48"/><span>0{index + 1}</span></button>)}
      {!reduced && <button className="studio-play" type="button" onClick={() => setPaused(value => !value)} aria-label={paused ? 'Bật tự chuyển ảnh' : 'Dừng tự chuyển ảnh'}>{paused ? <Play size={16}/> : <Pause size={16}/>}</button>}
    </div>
  </div>;
}
