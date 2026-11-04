/** Shared by React and the static demo.
 * @param {typeof import('gsap').gsap} gsap
 * @param {typeof import('gsap/ScrollTrigger').ScrollTrigger} ScrollTrigger
 */
export function publicChoreography(gsap, ScrollTrigger) {
  const media = gsap.matchMedia();
  media.add({ motion: '(prefers-reduced-motion: no-preference)', desktop: '(min-width: 961px)', tall: '(min-height: 680px)' }, context => {
    if (!context.conditions.motion) return;
    const desktop = context.conditions.desktop;
    const hero = document.querySelector('.cinematic-hero');
    if (hero) {
      gsap.timeline({ defaults: { ease: 'expo.out', duration: 1.15 } })
        .fromTo('.hero-title-main', { yPercent: 35, opacity: .35 }, { yPercent: 0, opacity: 1, clearProps: 'transform,opacity' })
        .fromTo('.hero-title-message', { x: -55, opacity: .3 }, { x: 0, opacity: 1, clearProps: 'transform,opacity' }, .12)
        .fromTo('.hero-shutters span', { scaleY: 1 }, { scaleY: 0, stagger: { each: .075, from: 'center' }, duration: 1.05, clearProps: 'transform' }, .05);
      if (desktop && context.conditions.tall) {
        const headerHeight = () => document.querySelector('.public-header')?.getBoundingClientRect().height || 116;
        const scene = gsap.timeline({ scrollTrigger: { trigger: hero, start: () => `top top+=${headerHeight()}`, end: '+=650', pin: true, scrub: .65, invalidateOnRefresh: true, refreshPriority: 2 } });
        scene.to('.cinematic-heading, .cinematic-bottom', { y: -80, autoAlpha: 0, ease: 'power1.in', duration: .35 }, 0)
          .to('.cinematic-image', { top: '0%', left: '0%', duration: .8, ease: 'power2.inOut' }, .08)
          .to('#hero-aperture-path', { morphSVG: 'M0.18,0 C0.05,0.18 0,0.5 0,1 L0.82,1 C0.95,0.82 1,0.5 1,0 Z', duration: .3, ease: 'power1.inOut' }, .08)
          .to('#hero-aperture-path', { morphSVG: 'M0,0 L0,1 L1,1 L1,0 Z', duration: .5, ease: 'power2.out' }, .38)
          .fromTo('.cinematic-image>img', { scale: 1.12 }, { scale: 1, duration: .8, ease: 'none' }, .08)
          .to('.hero-reveal-message', { opacity: 1, duration: .25 }, .65)
          .to('.hero-orbits', { rotation: 35, duration: 1, ease: 'none' }, 0);
      }
    }
    gsap.utils.toArray('.story-phrase').forEach((phrase, index) => {
      gsap.fromTo(phrase, { opacity: .25, x: index % 2 ? 55 : -55 }, { opacity: 1, x: 0, ease: 'none', scrollTrigger: { trigger: phrase, start: 'top 88%', end: 'top 48%', scrub: .4 } });
    });
    const bridge = document.querySelector('.photo-bridge');
    if (bridge) {
      gsap.fromTo('.photo-bridge-visual', { clipPath: desktop ? 'inset(12% 20% 12% 20% round 200px)' : 'inset(4% 5% 4% 5% round 70px)' }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none', scrollTrigger: { trigger: bridge, start: 'top 85%', end: 'top 12%', scrub: .55 } });
      gsap.fromTo('.photo-bridge img', { scale: 1.24 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: bridge, start: 'top bottom', end: 'bottom top', scrub: .6 } });
      gsap.fromTo('.photo-bridge-copy h2', { x: -70 }, { x: 0, ease: 'none', scrollTrigger: { trigger: bridge, start: 'top 70%', end: 'top 15%', scrub: .5 } });
    }
    gsap.utils.toArray('.workshop-gallery button').forEach((element, index) => {
      gsap.fromTo(element, { y: desktop ? 90 + index * 55 : 28, rotation: desktop ? (index - 1) * 5 : 0, clipPath: 'inset(0 0 25% 0)' }, { y: 0, rotation: 0, clipPath: 'inset(0 0 0% 0)', ease: 'none', scrollTrigger: { trigger: element, start: 'top 100%', end: 'top 35%', scrub: .5 } });
    });
    gsap.utils.toArray('[data-reveal]:not(.workshop-gallery)').forEach(element => {
      const image = element.classList.contains('fit-image');
      gsap.fromTo(element, image ? { clipPath: 'inset(0 75% 0 0 round 80px 0 0 0)' } : { y: 32, opacity: .4 }, { ...(image ? { clipPath: 'inset(0 0% 0 0 round 0px)' } : {}), y: 0, opacity: 1, duration: 1, ease: 'expo.out', clearProps: 'transform,opacity,clipPath', scrollTrigger: { trigger: element, start: 'top 88%', once: true } });
    });
    gsap.utils.toArray('.process-steps li').forEach(element => {
      gsap.fromTo(element, { x: desktop ? 90 : 20, opacity: .35 }, { x: 0, opacity: 1, ease: 'none', scrollTrigger: { trigger: element, start: 'top 92%', end: 'top 60%', scrub: .3 } });
    });
    if (document.querySelector('.process-steps')) gsap.to('.process-steps', { '--process-progress': 1, ease: 'none', scrollTrigger: { trigger: '.process-steps', start: 'top 65%', end: 'bottom 65%', scrub: .3 } });
    const dimensions = document.querySelector('.dimension-options');
    if (dimensions) gsap.fromTo(dimensions.children, { yPercent: 90, opacity: .3 }, { yPercent: 0, opacity: 1, stagger: .1, ease: 'expo.out', duration: .9, clearProps: 'transform,opacity', scrollTrigger: { trigger: dimensions, start: 'top 88%', once: true } });
    const signature = document.querySelector('.footer-signature');
    if (signature) gsap.fromTo('.footer-signature span', { yPercent: 100, rotation: 4 }, { yPercent: 0, rotation: 0, stagger: .14, duration: 1.25, ease: 'expo.out', scrollTrigger: { trigger: signature, start: 'top 95%', once: true } });
    const choices = [...document.querySelectorAll('.explorer-item')];
    let refresh;
    context.add('revealChoice', event => {
      const detail = event.currentTarget;
      if (detail.open) gsap.fromTo(detail.querySelector('.explorer-content'), { opacity: .4, y: 12 }, { opacity: 1, y: 0, duration: .45, overwrite: true, clearProps: 'transform,opacity' });
      refresh?.kill();
      // Disclosure height settles before recalculating downstream scroll scenes.
      refresh = gsap.delayedCall(.4, () => ScrollTrigger.refresh());
    });
    choices.forEach(detail => detail.addEventListener('toggle', context.revealChoice));
    return () => { refresh?.kill(); choices.forEach(detail => detail.removeEventListener('toggle', context.revealChoice)); };
  });
  return () => media.revert();
}

