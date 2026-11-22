'use client';

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ShapeFrame } from '@/components/decor';
import type { FrameShape } from '@/components/decor';

// Dáng khung xoay vòng, cùng chiều cao nên bề rộng mỗi ô theo tỉ lệ của dáng.
const SHAPES: { shape: FrameShape; ratio: number }[] = [{ shape: 'arch', ratio: 0.85 }, { shape: 'slant', ratio: 1.25 }, { shape: 'circle', ratio: 1 }, { shape: 'slant-reverse', ratio: 1.25 }, { shape: 'arch', ratio: 0.85 }, { shape: 'capsule', ratio: 1.5 }];

export type StripPhoto = { src: string; srcSet?: string; alt: string; label: string };

// Dải ảnh trượt ngang: bắt cuộn (scroll-snap), có hai nút lùi tới cho người dùng chuột, phím mũi tên khi dải có tiêu điểm.
export default function PhotoStrip({ photos, label }: { photos: StripPhoto[]; label: string }) {
  const track = useRef<HTMLUListElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });

  const measure = useCallback(() => {
    const el = track.current; if (!el) return;
    setEdge({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 8 });
  }, []);
  useEffect(() => {
    measure();
    const el = track.current; if (!el) return;
    const observer = new ResizeObserver(measure); observer.observe(el);
    return () => observer.disconnect();
  }, [measure]);

  function go(step: number) {
    const el = track.current; if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollBy({ left: step * Math.round(el.clientWidth * 0.8), behavior: reduce ? 'auto' : 'smooth' });
  }
  function onKey(event: KeyboardEvent) {
    if (event.key === 'ArrowRight') { event.preventDefault(); go(1); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); go(-1); }
  }

  return <div className="tp-strip">
    <ul className="tp-strip-track" ref={track} onScroll={measure} onKeyDown={onKey} tabIndex={0} aria-label={label}>
      {photos.map((photo, i) => {
        const frame = SHAPES[i % SHAPES.length];
        return <li className="tp-strip-item" key={photo.src} style={{ ['--r' as string]: frame.ratio }}>
          <ShapeFrame shape={frame.shape} ratio={frame.ratio} focus="50% 50%">
            <img src={photo.src} srcSet={photo.srcSet} sizes="(min-width: 900px) 420px, 78vw" alt={photo.alt} width={960} height={720} loading={i < 2 ? 'eager' : 'lazy'} draggable={false}/>
          </ShapeFrame>
        </li>;
      })}
    </ul>
    <div className="tp-strip-nav">
      <button type="button" className="tp-strip-btn pressable" aria-label="Ảnh trước" disabled={edge.start} onClick={() => go(-1)}><ChevronLeft size={22} aria-hidden="true"/></button>
      <button type="button" className="tp-strip-btn pressable" aria-label="Ảnh sau" disabled={edge.end} onClick={() => go(1)}><ChevronRight size={22} aria-hidden="true"/></button>
    </div>
  </div>;
}
