'use client';

import { useSmoothScroll } from './SmoothScrollProvider';
import { RESORT_CONTENT } from '@/lib/content';

export function Navbar() {
  const { scrollTo } = useSmoothScroll();
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-charcoal/20 backdrop-blur-sm">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <button onClick={() => scrollTo('#top')} className="text-[10px] uppercase tracking-luxury text-ivory" aria-label="Back to top">{RESORT_CONTENT.brand}</button>
        <div className="hidden items-center gap-8 text-[9px] uppercase tracking-[0.2em] text-ivory/75 sm:flex">
          <button onClick={() => scrollTo('#story')}>The retreat</button>
          <button onClick={() => scrollTo('#experiences')}>Experiences</button>
          <button onClick={() => scrollTo('#villas')}>Villas</button>
          <button onClick={() => scrollTo('#inquiry')} className="border border-gold/60 px-4 py-2 text-gold">Enquire</button>
        </div>
      </nav>
    </header>
  );
}
