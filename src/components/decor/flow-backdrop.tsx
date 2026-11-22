'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import './flow-backdrop.css';

export type FlowBackdropProps = {
  /** Tông hiện khi chưa có JavaScript hoặc khi giảm chuyển động. Nên trùng tông của khối đầu trang. Mặc định 'light'. */
  initial?: 'dark' | 'light' | 'photo';
  /** Ảnh cho tông 'photo'. Mặc định là sóng nhựa đã xử lý. */
  photoSrc?: string;
};

const TONES = ['dark', 'light', 'photo'] as const;
type Tone = (typeof TONES)[number];

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/**
 * Lớp nền cố định đổi dần theo cuộn giữa các tông mà từng FlowSection khai báo (data-flow-tone).
 * Chỉ opacity và transform. Thấy được ở nơi khối trang để trống nền (FlowSection solid={false}) hoặc ở khe giữa các mép.
 * Không có JavaScript hoặc giảm chuyển động: một tông tĩnh theo `initial`.
 */
export default function FlowBackdrop({ initial = 'light', photoSrc = '/images/decor/song-nhua-1600.webp' }: FlowBackdropProps) {
  const pathname = usePathname();

  useEffect(() => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    if (reduced.matches) return;
    const root = document.querySelector<HTMLElement>('[data-flow-backdrop]');
    if (!root) return;
    const layers = Object.fromEntries(TONES.map(tone => [tone, root.querySelector<HTMLElement>(`[data-layer="${tone}"]`)])) as Record<Tone, HTMLElement | null>;
    let cancelled = false;
    let teardown: (() => void) | undefined;

    (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([import('gsap'), import('gsap/ScrollTrigger')]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      const setters = Object.fromEntries(TONES.map(tone => [tone, layers[tone] ? gsap.quickSetter(layers[tone]!, 'opacity') : null])) as Record<Tone, ((v: number) => void) | null>;
      const shifters = Object.fromEntries(TONES.map(tone => [tone, layers[tone] ? gsap.quickSetter(layers[tone]!, 'y', 'px') : null])) as Record<Tone, ((v: number) => void) | null>;
      let ranges: { tone: Tone; top: number; bottom: number }[] = [];

      const measure = () => {
        const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-flow-tone]'));
        ranges = sections.map((section, index) => {
          const box = section.getBoundingClientRect();
          const top = box.top + window.scrollY;
          return { tone: (section.dataset.flowTone as Tone) ?? 'light', top: index === 0 ? -Infinity : top, bottom: index === sections.length - 1 ? Infinity : top + box.height };
        });
      };

      const apply = () => {
        if (!ranges.length) return;
        // Đổi tông sớm một nhịp: khi tiêu đề khối sau mới ló ở mép dưới khung nhìn thì nền đã gần đúng tông của nó.
        const span = Math.max(200, window.innerHeight * 0.34);
        const y = window.scrollY + window.innerHeight * 0.92;
        const weight: Record<Tone, number> = { dark: 0, light: 0, photo: 0 };
        for (const range of ranges) {
          const rise = Number.isFinite(range.top) ? smooth(range.top - span / 2, range.top + span / 2, y) : 1;
          const fall = Number.isFinite(range.bottom) ? smooth(range.bottom - span / 2, range.bottom + span / 2, y) : 0;
          weight[range.tone] += Math.max(0, rise - fall);
        }
        const drift = -Math.min(1, window.scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight)) * window.innerHeight * 0.04;
        for (const tone of TONES) { setters[tone]?.(Math.min(1, weight[tone])); shifters[tone]?.(drift); }
      };

      measure();
      apply();
      const trigger = ScrollTrigger.create({ start: 0, end: 'max', onUpdate: apply, onRefresh: () => { measure(); apply(); } });
      teardown = () => {
        trigger.kill();
        for (const tone of TONES) { if (layers[tone]) { gsap.set(layers[tone]!, { clearProps: 'opacity,transform' }); } }
      };
    })();

    return () => { cancelled = true; teardown?.(); };
  }, [pathname]);

  return (
    <div className="tl-fb" data-flow-backdrop="" data-initial={initial} aria-hidden="true">
      <div className="tl-fb__layer" data-layer="dark"><span className="tl-fb__weave" /></div>
      <div className="tl-fb__layer" data-layer="light">{/* eslint-disable-next-line @next/next/no-img-element */}<img src="/images/decor/giay-soi-960.webp" alt="" loading="lazy" decoding="async" /></div>
      <div className="tl-fb__layer" data-layer="photo">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={photoSrc} alt="" loading="lazy" decoding="async" /><span className="tl-fb__shade" /></div>
    </div>
  );
}
