'use client';

import { useEffect, useRef, type ReactNode } from 'react';

// Ảnh trong khối bọc được tải ngay khi trang nhàn, không đợi cuộn tới, để cuộn nhanh không gặp ô trống.
export default function EagerImages({ children, className, count }: { children: ReactNode; className?: string; count?: number }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const run = () => root.current?.querySelectorAll<HTMLImageElement>('img[loading=lazy]').forEach(img => { img.loading = 'eager'; });
    if (typeof window.requestIdleCallback === 'function') { const id = requestIdleCallback(run, { timeout: 1500 }); return () => cancelIdleCallback(id); }
    const id = window.setTimeout(run, 600);
    return () => window.clearTimeout(id);
  }, []);
  return <div ref={root} className={className} data-count={count}>{children}</div>;
}
