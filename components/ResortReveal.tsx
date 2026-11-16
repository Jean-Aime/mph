import Image from 'next/image';
import { REVEAL_POSTER_PATH } from '@/lib/constants';

export function ResortReveal() {
  return (
    <section aria-label="The resort in its forest setting" className="relative flex min-h-[82vh] items-center justify-center overflow-hidden bg-charcoal px-6 py-24">
      <Image src={REVEAL_POSTER_PATH} alt="Forest canopy at Sankore Retreat" fill sizes="100vw" unoptimized className="object-cover opacity-55" />
      <div className="absolute inset-0 bg-gradient-to-b from-charcoal/35 via-charcoal/40 to-charcoal" />
      <div className="relative z-10 max-w-3xl text-center">
        <p className="mb-5 text-[10px] uppercase tracking-luxury text-gold">The sanctuary</p>
        <h2 className="font-serif text-4xl font-light leading-tight text-ivory sm:text-6xl">A canopy of stillness, shaped around the land.</h2>
        <p className="mx-auto mt-7 max-w-xl text-sm leading-7 text-ivory/75 sm:text-base">Architecture and landscape meet in a retreat designed to feel less like a destination, and more like a return.</p>
      </div>
    </section>
  );
}
