'use client';

import dynamic from 'next/dynamic';
import { useCallback, useState } from 'react';
import { useImagePreloader } from '@/hooks/useImagePreloader';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { SmoothScrollProvider, useSmoothScroll } from './SmoothScrollProvider';
import { Preloader } from './Preloader';
import { Navbar } from './Navbar';
import { HeroScroll } from './HeroScroll';
import { ResortReveal } from './ResortReveal';
import { About } from './About';
import { Footer } from './Footer';

const Experiences = dynamic(() => import('./Experiences').then((module) => module.Experiences), { ssr: false });
const Villas = dynamic(() => import('./Villas').then((module) => module.Villas), { ssr: false });
const InquirySection = dynamic(() => import('./InquirySection').then((module) => module.InquirySection), { ssr: false });

function DeferredSection({
  id,
  minHeight,
  children,
}: {
  id: string;
  minHeight: string;
  children: () => React.ReactNode;
}) {
  const [shouldRender, setShouldRender] = useState(false);
  const placeholderRef = useCallback((element: HTMLDivElement | null) => {
    if (!element || shouldRender) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldRender(true);
          observer.disconnect();
        }
      },
      { rootMargin: '800px 0px' }
    );
    observer.observe(element);
  }, [shouldRender]);

  return (
    <div id={id} ref={placeholderRef} style={{ minHeight: shouldRender ? undefined : minHeight }}>
      {shouldRender ? children() : null}
    </div>
  );
}

function ExperiencePage() {
  const reducedMotion = usePrefersReducedMotion();
  const { scrollTo } = useSmoothScroll();
  const { images, totalFrames, progress, isComplete, updateScrollCursor } = useImagePreloader(reducedMotion);
  const [selectedVilla, setSelectedVilla] = useState('');
  const onFrameFocus = useCallback((index: number) => updateScrollCursor(index), [updateScrollCursor]);

  return (
    <>
      {!reducedMotion && <Preloader progress={progress} isComplete={isComplete} />}
      <Navbar />
      <main id="main-content">
        <HeroScroll images={images} totalFrames={totalFrames} onFrameFocus={onFrameFocus} />
        <ResortReveal />
        <About />
        <DeferredSection id="experiences" minHeight="500px">
          {() => <Experiences />}
        </DeferredSection>
        <DeferredSection id="villas" minHeight="700px">
          {() => <Villas onSelectVilla={(villa) => {
            setSelectedVilla(villa);
            if (reducedMotion) {
              document.querySelector('#inquiry')?.scrollIntoView({ behavior: 'auto' });
            } else {
              scrollTo('#inquiry');
            }
          }} />}
        </DeferredSection>
        <DeferredSection id="inquiry" minHeight="650px">
          {() => <InquirySection selectedVilla={selectedVilla} />}
        </DeferredSection>
      </main>
      <Footer />
    </>
  );
}

export function HomeClient() {
  return <SmoothScrollProvider><ExperiencePage /></SmoothScrollProvider>;
}
