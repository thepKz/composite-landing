/** Cảnh chuyển động cuộn của trang công khai. Chỉ chạy khi người dùng không chọn giảm chuyển động.
 * Hiện dần so le cho các khối `data-reveal` do `public-motion.tsx` lo, tệp này chỉ giữ các cảnh cần GSAP.
 * @param {typeof import('gsap').gsap} gsap
 * @param {typeof import('gsap/ScrollTrigger').ScrollTrigger} ScrollTrigger
 */
export function publicChoreography(gsap, ScrollTrigger) {
  const media = gsap.matchMedia();
  media.add({ motion: '(prefers-reduced-motion: no-preference)' }, context => {
    if (!context.conditions.motion) return;
    
    // Quy trình: đường nối giữa các bước chạy theo nhịp cuộn.
    const steps = document.querySelector('.tl-steps');
    if (steps) {
      gsap.fromTo(steps, { '--steps-progress': 0 }, { '--steps-progress': 1, ease: 'none', scrollTrigger: { trigger: steps, start: 'top 70%', end: 'bottom 60%', scrub: .3 } });
    }
  });
  return () => media.revert();
}
