'use client';

import { RESORT_CONTENT } from '@/lib/content';

export function Villas({ onSelectVilla }: { onSelectVilla: (villaId: string) => void }) {
  return (
    <section className="bg-[#0a0a09] px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <p className="mb-5 text-[10px] uppercase tracking-luxury text-gold">{RESORT_CONTENT.villas.eyebrow}</p>
        <h2 className="font-serif text-4xl font-light text-ivory sm:text-6xl">{RESORT_CONTENT.villas.title}</h2>
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {RESORT_CONTENT.villas.items.map((villa) => (
            <article key={villa.id} className="border border-white/10 p-7">
              <div className="mb-8 h-40 border border-gold/15 bg-gradient-to-br from-gold/15 via-white/[0.03] to-transparent" />
              <p className="text-[9px] uppercase tracking-luxury text-gold">{villa.id.replaceAll('-', ' ')}</p>
              <h3 className="mt-3 font-serif text-3xl text-ivory">{villa.name}</h3>
              <p className="mt-3 min-h-12 text-sm text-ivory/60">{villa.detail}</p>
              <button onClick={() => onSelectVilla(villa.id)} className="mt-8 border-b border-gold/60 pb-2 text-[9px] uppercase tracking-luxury text-gold">Enquire about this villa</button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
