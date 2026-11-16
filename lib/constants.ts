export const SEQ1_FRAMES = 120;
export const SEQ1_MOBILE_FRAMES = 60;
export const HERO_PRIORITY_FRAME_COUNT = 4;
export const MOBILE_BREAKPOINT = 768;
export const HERO_POSTER_PATH = '/images/poster-hero.webp';
export const REVEAL_POSTER_PATH = '/images/poster-reveal.webp';
export const SEQUENCE_PATHS = {
  desktop: '/sequence-1',
  mobile: '/sequence-1-mobile',
} as const;

export function getFrameUrl(basePath: string, index: number): string {
  return `${basePath}/frame_${String(index + 1).padStart(4, '0')}.jpg`;
}
