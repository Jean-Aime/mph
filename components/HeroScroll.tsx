'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { RESORT_CONTENT } from '@/lib/content';
import { HERO_POSTER_PATH } from '@/lib/constants';
import { SequenceCanvas } from './SequenceCanvas';

export function HeroScroll({
  images,
  totalFrames,
  onFrameFocus,
}: {
  images: (HTMLImageElement | null)[];
  totalFrames: number;
  onFrameFocus: (index: number) => void;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const secondStageRef = useRef<HTMLDivElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);
  const currentFrameRef = useRef(-1);
  const [frameIndex, setFrameIndex] = useState(0);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const section = sectionRef.current;
      if (!section) return;
      const range = Math.max(1, section.offsetHeight - window.innerHeight);
      const progress = Math.max(0, Math.min(1, -section.getBoundingClientRect().top / range));
      const frame = Math.round(progress * (totalFrames - 1));
      if (frame !== currentFrameRef.current) {
        currentFrameRef.current = frame;
        setFrameIndex(frame);
        onFrameFocus(frame);
      }

      const ramp = (value: number, start: number, end: number) =>
        Math.max(0, Math.min(1, (value - start) / (end - start)));
      if (introRef.current) introRef.current.style.opacity = String(1 - ramp(progress, 0.3, 0.42));
      if (secondStageRef.current) {
        secondStageRef.current.style.opacity = String(ramp(progress, 0.46, 0.58) * (1 - ramp(progress, 0.82, 0.94)));
      }
      if (cueRef.current) cueRef.current.style.opacity = String(1 - ramp(progress, 0, 0.08));
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    schedule();
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      cancelAnimationFrame(raf);
    };
  }, [onFrameFocus, totalFrames]);

  return (
    <section ref={sectionRef} id="top" aria-label="Sankore forest retreat" className="relative h-[400vh] bg-charcoal">
      <div className="sticky top-0 h-screen overflow-hidden">
        <Image
          src={HERO_POSTER_PATH}
          alt="A quiet view into the forest surrounding Sankore Retreat"
          fill
          priority
          sizes="100vw"
          unoptimized
          className="z-0 object-cover"
        />
        <div className="absolute inset-0 z-[1]">
          <SequenceCanvas images={images} totalFrames={totalFrames} frameIndex={frameIndex} posterSrc={HERO_POSTER_PATH} />
        </div>
        <div className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-b from-black/50 via-black/10 to-black/65" />
        <div ref={introRef} className="absolute inset-0 z-[3] flex flex-col items-center justify-center px-6 text-center transition-opacity duration-200">
          <p className="mb-6 text-[10px] uppercase tracking-luxury text-gold sm:text-xs">{RESORT_CONTENT.hero.eyebrow}</p>
          <h1 className="max-w-5xl font-serif text-5xl font-light leading-[1.05] text-ivory sm:text-7xl lg:text-8xl">{RESORT_CONTENT.hero.headline}</h1>
          <p className="mt-7 max-w-xl text-sm leading-7 text-ivory/80 sm:text-base">{RESORT_CONTENT.hero.subheadline}</p>
        </div>
        <div ref={secondStageRef} className="pointer-events-none absolute inset-0 z-[3] flex items-center justify-center px-6 text-center opacity-0 transition-opacity duration-200">
          <p className="font-serif text-4xl italic text-ivory sm:text-6xl">A slower kind of somewhere.</p>
        </div>
        <div ref={cueRef} className="pointer-events-none absolute inset-x-0 bottom-9 z-[3] text-center text-[10px] uppercase tracking-luxury text-ivory/70 transition-opacity duration-200">
          {RESORT_CONTENT.hero.scrollPrompt}<span className="mx-auto mt-3 block h-8 w-px bg-gold" />
        </div>
      </div>
    </section>
  );
}
