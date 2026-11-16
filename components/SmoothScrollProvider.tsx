'use client';

import { createContext, useContext, useEffect, useMemo, useRef } from 'react';
import Lenis from 'lenis';

type ScrollContextValue = { scrollTo: (selector: string) => void };
const ScrollContext = createContext<ScrollContextValue>({ scrollTo: () => undefined });

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (media.matches) return;
    const lenis = new Lenis({ lerp: 0.06, duration: 1.6, smoothWheel: true });
    lenisRef.current = lenis;
    let frame = 0;
    const tick = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  const context = useMemo(() => ({
    scrollTo: (selector: string) => {
      const target = document.querySelector(selector);
      if (target instanceof HTMLElement) lenisRef.current?.scrollTo(target, { duration: 1.2 });
    },
  }), []);

  return <ScrollContext.Provider value={context}>{children}</ScrollContext.Provider>;
}

export const useSmoothScroll = () => useContext(ScrollContext);
