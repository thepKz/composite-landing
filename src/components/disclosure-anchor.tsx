'use client';

import { useEffect } from 'react';

export default function DisclosureAnchor() {
  useEffect(() => {
    let frame = 0;
    function revealTarget() {
      let id: string;
      try { id = decodeURIComponent(window.location.hash.slice(1)); } catch { return; }
      const target = document.getElementById(id);
      if (!(target instanceof HTMLDetailsElement)) return;
      target.open = true;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => target.scrollIntoView({ block: 'start', behavior: 'instant' }));
    }
    revealTarget();
    function revealLinkedTarget(event: MouseEvent) {
      const link = event.target instanceof Element ? event.target.closest('a[href]') : null;
      if (!(link instanceof HTMLAnchorElement)) return;
      const url = new URL(link.href);
      if (url.origin !== location.origin || url.pathname !== location.pathname || !url.hash) return;
      let id: string;
      try { id = decodeURIComponent(url.hash.slice(1)); } catch { return; }
      const target = document.getElementById(id);
      if (target instanceof HTMLDetailsElement) target.open = true;
    }
    document.addEventListener('click', revealLinkedTarget, true);
    window.addEventListener('hashchange', revealTarget);
    return () => { cancelAnimationFrame(frame); document.removeEventListener('click', revealLinkedTarget, true); window.removeEventListener('hashchange', revealTarget); };
  }, []);
  return null;
}
