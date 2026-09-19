'use client';
import { useEffect, useRef } from 'react';
import { assetPath } from '@/lib/site-path';
export default function IntroScene({ staticFrame }: { staticFrame: boolean }) {
  const video = useRef<HTMLVideoElement>(null);
  useEffect(() => { if (!staticFrame) return; const element = video.current; if (!element) return; const setFrame = () => { if (Number.isFinite(element.duration)) element.currentTime = element.duration * .94; }; setFrame(); element.addEventListener('loadedmetadata', setFrame); return () => element.removeEventListener('loadedmetadata', setFrame); }, [staticFrame]);
  return <section id="inicio" className="intro-scene scene" aria-labelledby="intro-title"><h1 id="intro-title" className="sr-only">FUXION</h1><video ref={video} className="intro-video" muted playsInline preload="auto" poster={assetPath('/videos/intro/fuxion-intro-poster.png')}><source media="(max-width: 699px)" src={assetPath('/videos/intro/intro.mp4')} type="video/mp4" /><source src={assetPath('/videos/intro/fuxion-intro-v2.mp4')} type="video/mp4" /></video></section>;
}
