export const RESORT_CONTENT = {
  brand: 'Sankore Retreat',
  hero: {
    eyebrow: 'A private sanctuary in Rwanda',
    headline: 'Where the forest wakes slowly',
    subheadline:
      'A quiet collection of forest villas, shaped by the landscape and made for a deeper kind of escape.',
    scrollPrompt: 'Scroll to discover',
  },
  story: {
    eyebrow: 'A place apart',
    title: 'Find your own rhythm beneath the canopy.',
    body:
      'Trade hurried days for misty mornings, thoughtful hospitality, and time that belongs entirely to you. Sankore is a considered retreat into the living heart of Rwanda.',
  },
  experiences: {
    eyebrow: 'Made of moments',
    title: 'A softer way to explore.',
    items: [
      ['Forest walks', 'Follow quiet paths through the changing light of the canopy.'],
      ['Slow mornings', 'Take breakfast at your own pace, with the forest just beyond.'],
      ['Evenings by the fire', 'Gather, unwind, and let the day settle into the night.'],
    ],
  },
  villas: {
    eyebrow: 'Your private retreat',
    title: 'Stay close to what matters.',
    items: [
      { id: 'orchid-villa', name: 'Orchid Villa', detail: 'A secluded hideaway at the forest edge.' },
      { id: 'canopy-villa', name: 'Canopy Villa', detail: 'A private outlook into the living green.' },
      { id: 'river-house', name: 'River House', detail: 'A slower stay beside the water.' },
    ],
  },
} as const;
