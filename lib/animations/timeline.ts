import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { products } from '@/data/products';
import { createThermoVideoScene } from './thermo-video';
import { createNocarbVideoScene } from './nocarb-video';
import { createIntroVideoScene } from './intro-video';
import { createBeautyVideoScene } from './beauty-video';

export const CHAPTER_TIMES = [0, 3.25, 7.20, 11.70, 18.10];
export const DURATION = 20.10;

export function createExperience(root: HTMLElement, onChapter: (chapter: number) => void, initialProgress = 0) {
  gsap.registerPlugin(ScrollTrigger);
  let timeline: gsap.core.Timeline;
  let thermo: ReturnType<typeof createThermoVideoScene>;
  let nocarb: ReturnType<typeof createNocarbVideoScene>;
  let intro: ReturnType<typeof createIntroVideoScene>;
  let beauty: ReturnType<typeof createBeautyVideoScene>;
  let activeChapter = -1;
  let resizeProgress: number | null = null;
  let restoreFrame = 0;
  const progressFill = root.querySelector<HTMLElement>('.timeline-fill');
  const scrollCaption = root.querySelector<HTMLElement>('.scroll-caption');
  const onResize = () => { resizeProgress ??= timeline?.progress() ?? initialProgress; };
  window.addEventListener('resize', onResize, { passive: true });
  const ctx = gsap.context(() => {
    const stage = root.querySelector<HTMLElement>('.cinema-stage')!;
    const scenes = gsap.utils.toArray<HTMLElement>('.scene');
    const mobile = () => window.innerWidth < 700;
    gsap.set('.product-scene, .final-scene', { autoAlpha: 0 });
    gsap.set('.backlight, .horizon, .floor-light, .ambient-particles', { opacity: 0 });
    timeline = gsap.timeline({ defaults: { ease: 'power2.inOut' }, scrollTrigger: {
      trigger: root, start: 'top top', end: () => `+=${window.innerHeight * (mobile() ? 13 : 16)}`,
      pin: stage, scrub: 0.75, invalidateOnRefresh: true,
      onRefresh: self => {
        if (resizeProgress === null) return;
        const saved = resizeProgress;
        cancelAnimationFrame(restoreFrame);
        restoreFrame = requestAnimationFrame(() => {
          self.scroll(self.start + (self.end - self.start) * saved);
          self.update(); self.getTween()?.progress(1); timeline.progress(saved);
          thermo?.resize(); resizeProgress = null;
        });
      },
    }, onUpdate: () => {
      const time = timeline.time();
      const chapter = time < 3.05 ? 0 : time < 7.10 ? 1 : time < 11.70 ? 2 : time < 17.95 ? 3 : 4;
      if (activeChapter !== chapter) {
        activeChapter = chapter; onChapter(chapter);
        scenes.forEach((scene, i) => { scene.inert = i !== chapter; scene.setAttribute('aria-hidden', String(i !== chapter)); });
      }
      // Only the current chapter receives progress updates. This merely warms
      // the next source before its transition; it never starts playback.
      if (time >= 6.2) nocarb?.prepare();
      if (time >= 11.25) beauty?.prepare();
      if (progressFill) progressFill.style.transform = `scaleX(${time / DURATION})`;
      if (scrollCaption) scrollCaption.style.opacity = String(1 - gsap.utils.clamp(0, 1, (time - 13.1) / 0.6));
    } });
    const introScene = root.querySelector<HTMLElement>('#inicio')!;
    intro = createIntroVideoScene(introScene);
    gsap.set('.site-header, .experience-controls', { autoAlpha: 0 });
    timeline.to(intro.state, { progress: 1, duration: 2.45, ease: 'none', onUpdate: intro.render }, 0)
      .to({}, { duration: .25 }, 2.45)
      .to(introScene, { autoAlpha: 0, duration: .16 }, 2.84)
      .to('.site-header, .experience-controls', { autoAlpha: 1, duration: .18 }, 2.82)
      .to('.backlight', { opacity: 0.8, duration: 0.8 }, 2.55)
      .to('.horizon, .floor-light', { opacity: 1, duration: 1 }, 0.15)
      .to('.ambient-particles', { opacity: 1, duration: 1 }, 0.2)
      .to('.ambient-particles', { opacity: 0, duration: .24 }, 2.62);

    products.forEach((product, i) => {
      const scene = root.querySelector<HTMLElement>(`#${product.slug}`)!;
      const q = (selector: string) => scene.querySelectorAll(selector);
      const start = i === 0 ? 3.00 : i === 1 ? 7.20 : 12.30;
      if (i === 0) {
        thermo = createThermoVideoScene(scene);
        gsap.set(q('.product-content-panel'), { autoAlpha: 0, y: 22, filter: 'blur(6px)' });
        gsap.set(q('.editorial-scrim'), { opacity: .12 });
        timeline.to(thermo.state, { progress: 1, duration: 3.6, ease: 'none', onUpdate: thermo.render }, start)
          .to(scene, { autoAlpha: 1, duration: 0.2 }, start)
          .to('.backlight', { backgroundColor: product.accent, duration: 0.8 }, start)
          .fromTo(q('.thermo-video'), { autoAlpha: 0, scale: 1.015 }, { autoAlpha: 1, scale: 1, duration: 0.32 }, start)
          .to(q('.product-content-panel'), { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.55, ease: 'power2.out' }, start + 1.00)
          .to(q('.editorial-scrim'), { opacity: .55, duration: 0.4 }, start + 1.00)
          .to(q('.product-content-panel'), { autoAlpha: 0, y: -16, filter: 'blur(4px)', duration: 0.32, ease: 'power2.in' }, start + 3.90)
          .to(q('.editorial-scrim'), { opacity: 0, duration: 0.25 }, start + 3.95)
          .to(scene, { autoAlpha: 0, duration: 0.12 }, start + 4.30);
        return;
      }
      if (i === 1) {
        nocarb = createNocarbVideoScene(scene);
        gsap.set(q('.product-content-panel'), { autoAlpha: 0, y: 22, filter: 'blur(6px)' });
        gsap.set(q('.editorial-scrim'), { opacity: .12 });
        timeline.to(nocarb.state, { progress: 1, duration: 4.0, ease: 'none', onUpdate: nocarb.render }, start)
          .to(scene, { autoAlpha: 1, duration: 0.12 }, start)
          .to('.backlight', { backgroundColor: product.accent, duration: 0.45 }, start + 0.20)
          .fromTo(q('.nocarb-video'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.10 }, start + 0.16)
          .to(q('.product-content-panel'), { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.55, ease: 'power2.out' }, start + 1.00)
          .to(q('.editorial-scrim'), { opacity: .55, duration: 0.4 }, start + 1.00)
          .to(q('.product-content-panel'), { autoAlpha: 0, y: -16, filter: 'blur(4px)', duration: 0.32, ease: 'power2.in' }, start + 4.25)
          .to(q('.editorial-scrim'), { opacity: 0, duration: 0.25 }, start + 4.30)
          .to(scene, { autoAlpha: 0, scale: 1.1, duration: 0.45 }, start + 4.72)
          .fromTo('.transition-light', { opacity: 0, scale: 0.6, xPercent: -15 }, { opacity: 0.5, scale: 1.2, xPercent: 15, duration: 0.25 }, start + 4.75)
          .to('.transition-light', { opacity: 0, scale: 1.8, duration: 0.3 }, start + 5.03);
        return;
      }
      if (i === 2) {
        beauty = createBeautyVideoScene(scene);
        // Start BEAUTY while NOCARB is still fading so the stage never falls
        // back to its dark base layer between the two real-video chapters.
        const beautyStart = 11.70;
        gsap.set(q('.product-content-panel'), { autoAlpha: 0, y: 22, filter: 'blur(6px)' });
        gsap.set(q('.editorial-scrim'), { opacity: .10 });
        timeline.to(beauty.state, { progress: 1, duration: 4.1, ease: 'none', onUpdate: beauty.render }, beautyStart)
          .to(scene, { autoAlpha: 1, duration: .12 }, beautyStart)
          .to('.backlight', { backgroundColor: product.accent, duration: .35 }, beautyStart + .18)
          .fromTo(q('.beauty-video'), { autoAlpha: 0 }, { autoAlpha: 1, duration: .12 }, beautyStart)
          .to(q('.product-content-panel'), { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.55, ease: 'power2.out' }, beautyStart + 1.00)
          .to(q('.editorial-scrim'), { opacity: .45, duration: 0.4 }, beautyStart + 1.00)
          .to(q('.product-content-panel'), { autoAlpha: 0, y: -16, filter: 'blur(4px)', duration: 0.32, ease: 'power2.in' }, beautyStart + 4.55)
          .to(q('.editorial-scrim'), { opacity: 0, duration: 0.25 }, beautyStart + 4.60)
          .to(scene, { autoAlpha: 0, duration: .12 }, beautyStart + 5.0);
        return;
      }
      gsap.set(q('.product-content-panel'), { autoAlpha: 0, y: 22 });
      gsap.set(q('.glass-assembly'), { opacity: 0, y: 80 });
      gsap.set(q('.glass-liquid'), { scaleY: 0.04, transformOrigin: '50% 100%' });
      gsap.set(q('.powder'), { opacity: 0, scaleY: 0, transformOrigin: '50% 0%' });
      gsap.set(q('.sachet'), { x: product.sceneConfig.entryX, y: 80, scale: 0.85, rotation: product.sceneConfig.tilt });
      timeline.to(scene, { autoAlpha: 1, duration: 0.35 }, start)
        .to('.backlight', { backgroundColor: product.accent, duration: 0.8 }, start)
        .to(q('.sachet'), { x: 0, y: 0, scale: 1, duration: 0.75 }, start)
        .to(q('.product-content-panel'), { autoAlpha: 1, y: 0, duration: 0.5 }, start + 1.00)
        .to(q('.sachet'), { x: () => mobile() ? -15 : 35, y: () => mobile() ? -30 : -80, scale: () => mobile() ? 0.85 : 0.78, rotation: product.sceneConfig.pourTilt, duration: 0.65 }, start + 0.85)
        .to(q('.sachet-tear'), { x: 28, y: -55, rotation: 18, opacity: 0, duration: 0.35 }, start + 1)
        .to(q('.glass-assembly'), { opacity: 1, y: 0, duration: 0.5 }, start + 1.05)
        .to(q('.powder'), { opacity: 0.95, scaleY: 1, duration: 0.22 }, start + 1.32)
        .to(q('.powder-grain'), { y: 48, stagger: { each: 0.009, from: 'start' }, duration: 0.7, ease: 'none' }, start + 1.34)
        .to(q('.glass-liquid'), { scaleY: 0.75, duration: 0.65 }, start + 1.58)
        .to(q('.liquid-swirl'), { rotation: 240 + i * 40, scale: 1.2, duration: 0.9 }, start + 1.65)
        .to(q('.powder'), { opacity: 0, duration: 0.25 }, start + 2.1)
        .to(q('.product-content-panel'), { autoAlpha: 0, y: -16, duration: 0.3 }, start + 2.80)
        .to(scene, { autoAlpha: 0, scale: i === 2 ? 0.96 : 1.1, duration: 0.45 }, start + 3.05)
        .fromTo('.transition-light', { opacity: 0, scale: 0.6, xPercent: -15 }, { opacity: 0.5, scale: 1.2, xPercent: 15, duration: 0.25 }, start + 3.08)
        .to('.transition-light', { opacity: 0, scale: 1.8, duration: 0.3 }, start + 3.33);
    });
    timeline.fromTo('.final-scene', { autoAlpha: 0, scale: 1.1 }, { autoAlpha: 1, scale: 1, duration: 0.8 }, 17.40)
      .fromTo('.collection-product', { y: 70, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.15, duration: 0.65 }, 17.55)
      .fromTo('.final-action', { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.4 }, 18.35)
      .to({}, { duration: 0.6 }, 18.75);
  }, root);
  if (initialProgress > 0) {
    const trigger = timeline!.scrollTrigger!;
    trigger.scroll(trigger.start + (trigger.end - trigger.start) * initialProgress);
    trigger.update(); trigger.getTween()?.progress(1); timeline!.progress(initialProgress);
  }
  return {
    getProgress() { return timeline.progress(); },
    goTo(chapter: number) {
      const trigger = timeline.scrollTrigger;
      if (trigger) window.scrollTo({ top: trigger.start + (trigger.end - trigger.start) * CHAPTER_TIMES[chapter] / DURATION, behavior: 'smooth' });
    },
    destroy() {
      window.removeEventListener('resize', onResize); cancelAnimationFrame(restoreFrame);
      ctx.revert(); intro?.destroy(); thermo?.destroy(); nocarb?.destroy(); beauty?.destroy();
      scrollCaption?.style.removeProperty('opacity');
      root.querySelectorAll<HTMLElement>('.scene').forEach(scene => { scene.inert = false; scene.removeAttribute('aria-hidden'); });
    },
  };
}
