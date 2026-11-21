'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

type Phase = 'idle' | 'loading' | 'done';

// Thanh tiến trình mảnh ở trên cùng: chạy khi bấm một liên kết nội bộ, về đích khi đường dẫn đổi.
export default function RouteFeedback() {
  const pathname = usePathname();
  const [phase, setPhase] = useState<Phase>('idle');
  const previous = useRef(pathname);
  const timer = useRef<number>(0);
  const safety = useRef<number>(0);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target instanceof Element ? event.target.closest('a[href]') : null;
      if (!(link instanceof HTMLAnchorElement) || link.target === '_blank' || link.hasAttribute('download')) return;
      const url = new URL(link.href, location.href);
      if (url.origin !== location.origin || url.pathname === location.pathname) return;
      window.clearTimeout(timer.current);
      window.clearTimeout(safety.current);
      setPhase('loading');
      safety.current = window.setTimeout(() => setPhase('idle'), 8000);
    }
    document.addEventListener('click', onClick, true);
    return () => { document.removeEventListener('click', onClick, true); window.clearTimeout(timer.current); window.clearTimeout(safety.current); };
  }, []);

  useEffect(() => {
    if (previous.current === pathname) return;
    previous.current = pathname;
    window.clearTimeout(safety.current);
    setPhase('done');
    timer.current = window.setTimeout(() => setPhase('idle'), 420);
  }, [pathname]);

  return <div className="tl-progress" data-phase={phase} role="presentation" aria-hidden="true"><span /></div>;
}
