'use client';

import { FormEvent, useState } from 'react';

export function InquirySection({ selectedVilla }: { selectedVilla: string }) {
  const [status, setStatus] = useState('');
  const [sending, setSending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setSending(true);
    setStatus('');
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());
    try {
      const response = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to send your enquiry.');
      setStatus('Thank you. Your enquiry has been sent.');
      form.reset();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Unable to send your enquiry.');
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="bg-charcoal px-6 py-24 sm:py-32">
      <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="mb-5 text-[10px] uppercase tracking-luxury text-gold">Begin your stay</p>
          <h2 className="font-serif text-4xl font-light text-ivory sm:text-6xl">Tell us what you’re dreaming of.</h2>
          <p className="mt-6 text-sm leading-7 text-ivory/60">Our team will be in touch to help shape your stay.</p>
          {selectedVilla && <p className="mt-6 text-sm text-gold">Selected villa: {selectedVilla.replaceAll('-', ' ')}</p>}
        </div>
        <form onSubmit={submit} className="grid gap-5 border border-white/10 p-7 sm:p-9">
          <input type="hidden" name="villa" value={selectedVilla} />
          <label className="grid gap-2 text-[9px] uppercase tracking-luxury text-ivory/65">Your name<input required name="name" autoComplete="name" className="field-control" /></label>
          <label className="grid gap-2 text-[9px] uppercase tracking-luxury text-ivory/65">Email address<input required type="email" name="email" autoComplete="email" className="field-control" /></label>
          <label className="grid gap-2 text-[9px] uppercase tracking-luxury text-ivory/65">Message<textarea required name="message" rows={4} className="field-control resize-y" /></label>
          <button disabled={sending} className="justify-self-start bg-gold px-6 py-3 text-[9px] uppercase tracking-luxury text-charcoal disabled:opacity-60">{sending ? 'Sending…' : 'Send enquiry'}</button>
          <p aria-live="polite" className="min-h-5 text-sm text-ivory/70">{status}</p>
        </form>
      </div>
    </section>
  );
}
