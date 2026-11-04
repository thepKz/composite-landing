'use client';

import { useEffect } from 'react';

export default function LandingMotion() {
  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const animations = new Set<Animation>();
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        if (preference.matches) continue;
        const frames = entry.target.getAttribute('data-reveal') === 'image'
          ? [{ clipPath: 'inset(0 14% 0 0)', opacity: 0.65 }, { clipPath: 'inset(0 0 0 0)', opacity: 1 }]
          : [{ transform: 'translateY(18px)', opacity: 0.6 }, { transform: 'translateY(0)', opacity: 1 }];
        const animation = entry.target.animate(frames, { duration: 750, easing: 'cubic-bezier(.16,1,.3,1)' });
        animations.add(animation); animation.onfinish = () => animations.delete(animation);
      }
    }, { threshold: 0.15 });
    document.querySelectorAll('[data-reveal]').forEach(element => observer.observe(element));
    const cancel = () => { if (preference.matches) animations.forEach(animation => animation.cancel()); };
    preference.addEventListener('change', cancel);
    return () => { observer.disconnect(); animations.forEach(animation => animation.cancel()); preference.removeEventListener('change', cancel); };
  }, []);
  return null;
}
