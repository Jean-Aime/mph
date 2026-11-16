import { RESORT_CONTENT } from '@/lib/content';

export function Footer() {
  return <footer className="border-t border-white/10 bg-charcoal px-6 py-8 text-center text-[9px] uppercase tracking-[0.18em] text-ivory/45">{RESORT_CONTENT.brand} <span className="mx-2 text-gold">·</span> Rwanda</footer>;
}
