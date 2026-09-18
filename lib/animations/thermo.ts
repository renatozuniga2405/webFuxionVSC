import { gsap } from 'gsap';

// The source window is 566 × 153 actual JPEG pixels, not the SVG's nominal size.
const SOURCE_WIDTH = 566;
const ASPECT = 566 / 153;
const clamp = gsap.utils.clamp(0, 1);
const ease = gsap.parseEase('power2.inOut');
const phase = (p: number, a: number, b: number) => ease(clamp((p - a) / (b - a)));
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
const hash = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

export function createThermoScene(scene: HTMLElement) {
  const stage = scene.querySelector<HTMLElement>('.product-stage')!;
  const sachet = scene.querySelector<HTMLElement>('.sachet')!;
  const tear = scene.querySelector<HTMLElement>('.sachet-tear')!;
  const mouth = scene.querySelector<HTMLElement>('.thermo-mouth')!;
  const glass = scene.querySelector<HTMLElement>('.glass-assembly')!;
  const liquid = scene.querySelector<HTMLElement>('.glass-liquid')!;
  const liquidCanvas = scene.querySelector<HTMLCanvasElement>('.thermo-liquid-canvas')!;
  const liquidCtx = liquidCanvas.getContext('2d');
  const surface = scene.querySelector<HTMLElement>('.liquid-surface')!;
  const swirl = scene.querySelector<HTMLElement>('.liquid-swirl')!;
  const glow = scene.querySelector<HTMLElement>('.liquid-glow')!;
  const light = scene.querySelector<HTMLElement>('.thermo-studio-light')!;
  const canvas = scene.querySelector<HTMLCanvasElement>('.thermo-powder')!;
  const ctx = canvas.getContext('2d');
  const editorial = scene.querySelector<HTMLElement>('.product-editorial')!;
  const notes = [...scene.querySelectorAll<HTMLElement>('.product-note')];
  const preparation = scene.querySelector<HTMLElement>('.preparation-note')!;
  const state = { progress: 0 };
  let width = 0, height = 0, packWidth = 0, glassWidth = 0, glassHeight = 0;
  let glassX = 0, glassY = 0, dpr = 1, mobile = false;
  let originX = 0, originY = 0;
  // Fixed particle pool. Births are deterministic; no wall-clock simulation or RAF loop.
  const particles = Array.from({ length: 640 }, (_, i) => {
    const layer = i % 11;
    return {
      birth: 0.448 + hash(i + 31) * 0.226,
      spread: (hash(i + 1) - .5) * (layer === 0 ? 4.0 : layer < 4 ? 1.7 : .62),
      radius: layer === 0 ? 1.0 + hash(i + 600) * 1.1 : layer < 4 ? .48 + hash(i + 600) * .62 : .16 + hash(i + 600) * .34,
      strength: hash(i + 200), haze: layer === 0, micro: layer > 5,
    };
  });
  // Reused output object for both sachet transforms and particle spawn transforms.
  const pose = { x: 0, y: 0, angle: 0, scale: 1 };
  function samplePose(p: number) {
    const enter = phase(p, 0, 0.16), approach = phase(p, 0.16, 0.29);
    const tilt = phase(p, 0.28, 0.44), reveal = phase(p, 0.79, 0.90);
    const pourScale = mobile ? 0.8 : 0.74;
    const angle = (mobile ? 30 : 28) * Math.PI / 180;
    const pourX = glassX - Math.cos(angle) * packWidth * pourScale * 0.44;
    const pourY = height * 0.45 - Math.sin(angle) * packWidth * pourScale * 0.44;
    pose.x = lerp(lerp(width * 0.5 + 20 * (1 - enter), pourX, tilt), width * (mobile ? 0.45 : 0.40), reveal);
    pose.y = lerp(lerp(height * 0.23 + 25 * (1 - enter), pourY, tilt), height * 0.25, reveal);
    pose.angle = lerp(lerp(-7 + approach * 3, mobile ? 30 : 28, tilt), -4, reveal);
    pose.scale = lerp(lerp(0.94 + approach * 0.06, pourScale, tilt), 0.94, reveal);
  }
  function sampleOrigin(p: number) {
    samplePose(p);
    const angle = pose.angle * Math.PI / 180;
    originX = pose.x + Math.cos(angle) * packWidth * pose.scale * 0.44;
    originY = pose.y + Math.sin(angle) * packWidth * pose.scale * 0.44;
  }
  function flowAt(p: number) { return phase(p, 0.452, 0.495) * (1 - phase(p, 0.665, 0.72)); }
  function renderLiquid(mix: number, impact: number) {
    if (!liquidCtx) return;
    const canvasWidth = liquidCanvas.clientWidth, canvasHeight = liquidCanvas.clientHeight;
    liquidCtx.clearRect(0, 0, canvasWidth, canvasHeight);
    const cloud = phase(mix, 0.11, 0.72);
    if (cloud <= 0) return;
    const centerX = canvasWidth * .52;
    const centerY = canvasHeight * (.09 + cloud * .31);
    const spreadX = canvasWidth * (.08 + cloud * .43);
    const spreadY = canvasHeight * (.06 + cloud * .32);
    // Layered, offset soft blobs make a localized volumetric plume instead of a uniform recolor or visible vector rings.
    liquidCtx.save();
    liquidCtx.filter = `blur(${Math.max(1.5, 3.5 * cloud)}px)`;
    for (let lobe = 0; lobe < 19; lobe++) {
      const seed = hash(lobe + 880);
      const x = centerX + (seed - .5) * spreadX * (1.05 + cloud * .7);
      const y = centerY + hash(lobe + 903) * spreadY * .95;
      const radius = (4 + hash(lobe + 927) * 14) * (.3 + cloud * .78);
      const plume = liquidCtx.createRadialGradient(x, y, 0, x, y, radius);
      plume.addColorStop(0, `rgba(125,80,43,${(.16 + hash(lobe + 944) * .20) * cloud})`);
      plume.addColorStop(.44, `rgba(172,119,65,${(.09 + hash(lobe + 961) * .13) * cloud})`);
      plume.addColorStop(1, 'rgba(175,124,70,0)');
      liquidCtx.fillStyle = plume; liquidCtx.beginPath(); liquidCtx.arc(x, y, radius, 0, Math.PI * 2); liquidCtx.fill();
    }
    liquidCtx.restore();
    // Fine suspended flecks sit within the cloud; they are tied to progress and fade as the drink homogenizes.
    const fleckAlpha = cloud * (1 - phase(mix, .74, .96));
    for (let fleck = 0; fleck < 52; fleck++) {
      const x = centerX + (hash(fleck + 980) - .5) * spreadX * 1.35;
      const y = centerY + hash(fleck + 1010) * spreadY;
      liquidCtx.globalAlpha = fleckAlpha * (.12 + hash(fleck + 1040) * .18);
      liquidCtx.fillStyle = fleck % 4 ? '#b77c40' : '#efd0a0';
      liquidCtx.fillRect(x, y, .45 + hash(fleck + 1060), .45 + hash(fleck + 1080));
    }
    liquidCtx.globalAlpha = 1;
  }
  function render() {
    const p = state.progress;
    sampleOrigin(p);
    const currentOriginX = originX, currentOriginY = originY;
    const open = phase(p, 0.325, 0.415), tension = phase(p, 0.28, 0.325);
    const detach = phase(p, 0.33, 0.43), glassIn = phase(p, 0.30, 0.43);
    const mix = phase(p, 0.50, 0.83), impact = phase(p, 0.505, 0.54) * (1 - phase(p, 0.74, 0.83));
    const packHeight = packWidth / ASPECT;
    sachet.style.transform = `translate3d(${pose.x - packWidth / 2}px,${pose.y - packHeight / 2}px,0) rotate(${pose.angle}deg) scale(${pose.scale})`;
    sachet.style.opacity = String(phase(p, 0, 0.13));
    tear.style.transform = `translate(${detach * 33 + tension * 2}px,${-detach * 30 - tension * 3}px) rotate(${-detach * 14 - tension * 2}deg)`;
    tear.style.opacity = String(1 - phase(p, 0.395, 0.455));
    mouth.style.opacity = String(open);
    mouth.style.transform = `translate(-50%,-50%) scaleX(${0.1 + open * 0.9})`;
    glass.style.opacity = String(glassIn);
    glass.style.transform = `translateY(${(1 - glassIn) * 18}px)`;
    // Water is already in the glass: powder changes color and turbulence, not water volume.
    // The final drink stays translucent, but needs enough density to read through the photographed glass.
    liquid.style.background = `linear-gradient(106deg,rgba(170,199,201,${lerp(.11,.17,mix)}),rgba(221,181,113,${lerp(.11,.42,mix)}) 52%,rgba(123,88,53,${lerp(.04,.25,mix)})),linear-gradient(180deg,rgba(255,255,255,.05),rgba(132,87,47,${lerp(.012,.28,mix)}))`;
    liquid.style.opacity = String(.88 + mix * .12);
    surface.style.background = `linear-gradient(90deg,rgba(255,247,224,.04),rgba(230,195,137,${lerp(.10,.42,mix)}),rgba(255,247,224,.04))`;
    swirl.style.opacity = String(impact * 0.5);
    swirl.style.transform = `rotate(${p * 720}deg) scale(${0.8 + impact * 0.35}, .6)`;
    glow.style.opacity = String(0.1 + mix * 0.65);
    light.style.opacity = String(phase(p, 0, 0.20) * (0.4 + phase(p, 0.78, 0.92) * 0.3));
    editorial.style.opacity = String(phase(p, mobile ? 0.74 : 0.1, mobile ? 0.82 : 0.23));
    editorial.style.transform = `translateY(${(1 - phase(p, mobile ? 0.74 : 0.1, mobile ? 0.82 : 0.23)) * 10}px)`;
    notes.forEach((note,i) => { note.style.opacity = String(phase(p, 0.77 + i * 0.015, 0.85 + i * 0.015)); });
    preparation.style.opacity = String(phase(p, 0.81, 0.9) * 0.7);
    renderLiquid(mix, impact);
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    const liquidY = glassY + glassHeight * 0.38;
    const gravity = height * 3.2, velocity = height * 0.30;
    let activeParticles = 0;
    if (p > 0.452 && p < 0.82) {
      for (let i = 0; i < particles.length; i++) {
        const particle = particles[i];
        if (mobile && i % 2 === 0) continue;
        const age = (p - particle.birth) * 9;
        if (age < 0 || age > 0.9 || particle.strength > flowAt(particle.birth)) continue;
        sampleOrigin(particle.birth);
        const travel = velocity * age + gravity * age * age / 2;
        const y = originY + travel;
        const x = originX + particle.spread * (2 + age * (mobile ? 9 : 14));
        if (y < liquidY) {
          const alpha = particle.haze ? .025 + particle.strength * .045 : particle.micro ? .18 + particle.strength * .22 : .26 + particle.strength * .30;
          ctx.globalAlpha = alpha;
          ctx.fillStyle = particle.haze ? '#c89157' : i % 5 ? '#e7c38d' : '#fff1cf';
          if (particle.haze) {
            ctx.save(); ctx.filter = 'blur(2px)'; ctx.fillRect(x - particle.radius * 5, y - particle.radius * 2, particle.radius * 10, particle.radius * 4); ctx.restore();
          } else {
            ctx.save(); ctx.translate(x, y); ctx.rotate((hash(i + 1300) - .5) * .8);
            ctx.fillRect(-particle.radius, -particle.radius * .55, particle.radius * 2, particle.radius * (particle.micro ? 1.05 : 1.6)); ctx.restore();
          }
          activeParticles++;
        } else {
          // Analytic flight time; the impact happens only after the grain reaches the surface.
          const hitTime = (-velocity + Math.sqrt(velocity * velocity + 2 * gravity * (liquidY - originY))) / gravity;
          const since = age - hitTime;
          if (since > 0 && since < 0.16 && i % 7 === 0) {
            ctx.globalAlpha = (1 - since / .16) * .42;
            ctx.fillStyle = i % 2 ? '#e6c28d' : '#fff1d1';
            ctx.fillRect(glassX + particle.spread * 9 + since * (particle.spread * 120), liquidY - Math.sin(since / .16 * Math.PI) * (5 + particle.strength * 10), .65 + particle.strength, 1.3 + particle.strength * 1.2);
          }
        }
      }
      // A dense but dry granular core, plus progressively wider micrograins, removes the dotted-line read.
      const stream = flowAt(p);
      const front = Math.min(liquidY - currentOriginY, Math.max(0, (p - .452) * 9 * velocity));
      if (stream > .01 && front > 3) {
        const grains = mobile ? 90 : 168;
        for (let grain = 0; grain < grains; grain++) {
          const u = hash(grain + 1380);
          const widthAtDepth = .45 + u * 3.1;
          const offset = (hash(grain + 1410) - .5) * widthAtDepth * (grain % 6 ? 1 : 2.3);
          const x = currentOriginX + offset;
          const y = currentOriginY + u * front;
          const size = grain % 7 ? .28 + hash(grain + 1440) * .55 : .8 + hash(grain + 1440) * .6;
          ctx.globalAlpha = stream * (grain % 7 ? .22 + hash(grain + 1470) * .25 : .15 + hash(grain + 1470) * .14);
          ctx.fillStyle = grain % 9 ? '#e9c68d' : '#fff1d0';
          ctx.save(); ctx.translate(x, y); ctx.rotate((hash(grain + 1500) - .5) * 1.1);
          ctx.fillRect(-size, -size * .4, size * 2, size * (grain % 5 ? .95 : 1.55)); ctx.restore();
        }
      }
      // Small, granular impact: no vector circles or liquid-like crown.
      if (impact > .025) {
        for (let splash = 0; splash < 18; splash++) {
          const direction = hash(splash + 1200) - .5;
          const lift = Math.sin((splash + 1) * 1.71) * .5 + .5;
          ctx.globalAlpha = impact * (.16 + hash(splash + 1240) * .25);
          ctx.fillStyle = splash % 3 ? '#e7c38d' : '#fff1d2';
          ctx.fillRect(glassX + direction * (7 + impact * 17), liquidY - lift * (3 + impact * 12), .6 + hash(splash + 1260), 1.2 + hash(splash + 1280) * 1.5);
        }
      }
    }
    ctx.globalAlpha = 1;
    // Small fixed diagnostics enable geometry/reversal tests without exposing a global debug API.
    scene.dataset.thermoProgress = p.toFixed(5);
    canvas.dataset.origin = `${currentOriginX.toFixed(3)},${currentOriginY.toFixed(3)}`;
    canvas.dataset.particles = String(activeParticles);
    canvas.dataset.flow = flowAt(p).toFixed(4);
    canvas.dataset.mix = mix.toFixed(4);
  }
  function resize() {
    mobile = window.innerWidth < 700;
    width = stage.clientWidth; height = stage.clientHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const angle = (mobile ? 30 : 28) * Math.PI / 180;
    const poseBudget = (height * 0.45 - 12) / ((0.94 * Math.sin(angle) + Math.cos(angle) / ASPECT / 2) * (mobile ? 0.8 : 0.74));
    packWidth = Math.min(width * (mobile ? 0.90 : 0.88), poseBudget, mobile ? 410 : 470, SOURCE_WIDTH / Math.max(1,window.devicePixelRatio));
    glassWidth = Math.min(mobile ? 94 : 128, width * 0.25);
    glassHeight = Math.min(mobile ? 154 : 188, height * 0.37);
    glassX = width * (mobile ? 0.68 : 0.73); glassY = height * 0.59;
    sachet.style.width = `${packWidth}px`; sachet.style.height = `${packWidth / ASPECT}px`;
    glass.style.width = `${glassWidth}px`; glass.style.height = `${glassHeight}px`;
    glass.style.left = `${glassX - glassWidth / 2}px`; glass.style.top = `${glassY}px`;
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    ctx?.setTransform(dpr,0,0,dpr,0,0);
    const liquidDpr = Math.min(window.devicePixelRatio || 1, 2);
    const liquidWidth = Math.max(1, Math.round(glassWidth * .76));
    const liquidHeight = Math.max(1, Math.round(glassHeight * .60));
    liquidCanvas.width = Math.round(liquidWidth * liquidDpr); liquidCanvas.height = Math.round(liquidHeight * liquidDpr);
    liquidCtx?.setTransform(liquidDpr,0,0,liquidDpr,0,0);
    canvas.dataset.dpr = String(dpr);
    render();
  }
  resize();
  const observer = new ResizeObserver(resize);
  observer.observe(stage);
  return { state, render, resize, destroy() {
    observer.disconnect(); ctx?.clearRect(0,0,width,height);
    [sachet,tear,mouth,glass,liquid,surface,swirl,glow,light,editorial,preparation,...notes].forEach(el=>el.removeAttribute('style'));
    delete scene.dataset.thermoProgress;
  } };
}
