import { RESORT_CONTENT } from '@/lib/content';

export function Experiences() {
  return (
    <section className="bg-charcoal px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <p className="mb-5 text-[10px] uppercase tracking-luxury text-gold">{RESORT_CONTENT.experiences.eyebrow}</p>
        <h2 className="max-w-2xl font-serif text-4xl font-light text-ivory sm:text-6xl">{RESORT_CONTENT.experiences.title}</h2>
        <div className="mt-14 grid gap-px bg-white/10 md:grid-cols-3">
          {RESORT_CONTENT.experiences.items.map(([title, detail], index) => (
            <article key={title} className="bg-charcoal p-8 sm:p-10">
              <span className="text-xs text-gold">0{index + 1}</span>
              <h3 className="mt-10 font-serif text-2xl text-ivory">{title}</h3>
              <p className="mt-4 text-sm leading-6 text-ivory/60">{detail}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
