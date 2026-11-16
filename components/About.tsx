import { RESORT_CONTENT } from '@/lib/content';

export function About() {
  return (
    <section id="story" className="bg-[#0a0a09] px-6 py-28 sm:py-36">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[1fr_1.4fr] md:items-end">
        <p className="text-[10px] uppercase tracking-luxury text-gold">{RESORT_CONTENT.story.eyebrow}</p>
        <div>
          <h2 className="font-serif text-4xl font-light leading-tight text-ivory sm:text-6xl">{RESORT_CONTENT.story.title}</h2>
          <p className="mt-7 max-w-2xl text-sm leading-7 text-ivory/65 sm:text-base">{RESORT_CONTENT.story.body}</p>
        </div>
      </div>
    </section>
  );
}
