'use client';
import { useEffect, useRef } from 'react';

/** Đo ảnh bìa thật rồi đánh dấu bài là ảnh dọc hoặc ngang để đầu bài đổi bố cục (dọc thì chữ một bên, ảnh một bên).
 *  Tìm theo vị trí của chính nó nên chạy đúng cả khi bài được dựng vào khung xem trước của admin. */
export default function CoverOrient() {
  const mark = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const root = mark.current?.closest('.art');
    const image = root?.querySelector<HTMLImageElement>('.art-cover img');
    if (!image || !root) return;
    const apply = () => { if (image.naturalWidth) root.setAttribute('data-orient', image.naturalHeight > image.naturalWidth * 1.1 ? 'portrait' : 'landscape'); };
    if (image.complete) apply(); else image.addEventListener('load', apply, { once: true });
    return () => image.removeEventListener('load', apply);
  }, []);
  return <span ref={mark} hidden aria-hidden="true" />;
}
