'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin';
import { publicChoreography } from '@/lib/public-choreography';

gsap.registerPlugin(ScrollTrigger, MorphSVGPlugin);
export default function PublicMotion() {
  const pathname = usePathname();
  useEffect(() => {
    let cleanup: (() => void) | undefined;
    const frame = requestAnimationFrame(() => { cleanup = publicChoreography(gsap, ScrollTrigger); ScrollTrigger.sort(); ScrollTrigger.refresh(); });
    return () => { cancelAnimationFrame(frame); cleanup?.(); };
  }, [pathname]);
  return null;
}
