'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  HERO_PRIORITY_FRAME_COUNT,
  MOBILE_BREAKPOINT,
  SEQ1_FRAMES,
  SEQ1_MOBILE_FRAMES,
  SEQUENCE_PATHS,
  getFrameUrl,
} from '@/lib/constants';

type ConnectionInfo = {
  effectiveType?: string;
  saveData?: boolean;
  addEventListener?: (type: string, listener: () => void) => void;
  removeEventListener?: (type: string, listener: () => void) => void;
};
type BrowserWithConnection = Navigator & {
  connection?: ConnectionInfo;
  mozConnection?: ConnectionInfo;
  webkitConnection?: ConnectionInfo;
};

function readLiteSequence() {
  if (typeof window === 'undefined') return false;
  const nav = navigator as BrowserWithConnection;
  const connection = nav.connection || nav.mozConnection || nav.webkitConnection;
  return (
    window.innerWidth < MOBILE_BREAKPOINT ||
    connection?.saveData === true ||
    ['slow-2g', '2g', '3g'].includes(connection?.effectiveType ?? '')
  );
}

function useLiteSequence() {
  const [lite, setLite] = useState(readLiteSequence);
  useEffect(() => {
    const nav = navigator as BrowserWithConnection;
    const connection = nav.connection || nav.mozConnection || nav.webkitConnection;
    const update = () => setLite(readLiteSequence());
    window.addEventListener('resize', update);
    connection?.addEventListener?.('change', update);
    return () => {
      window.removeEventListener('resize', update);
      connection?.removeEventListener?.('change', update);
    };
  }, []);
  return lite;
}

function loadImage(url: string) {
  return new Promise<HTMLImageElement | null>((resolve) => {
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => resolve(image);
    image.onerror = () => {
      console.error(`Unable to load sequence frame: ${url}`);
      resolve(null);
    };
    image.src = url;
  });
}

export function useImagePreloader(disabled: boolean) {
  const isLiteMode = useLiteSequence();
  const totalFrames = isLiteMode ? SEQ1_MOBILE_FRAMES : SEQ1_FRAMES;
  const basePath = isLiteMode ? SEQUENCE_PATHS.mobile : SEQUENCE_PATHS.desktop;
  const [images, setImages] = useState<(HTMLImageElement | null)[]>([]);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const cursorRef = useRef(0);
  const pumpRef = useRef<(() => void) | null>(null);

  const updateScrollCursor = useCallback((index: number) => {
    cursorRef.current = Math.max(0, Math.min(totalFrames - 1, index));
    pumpRef.current?.();
  }, [totalFrames]);

  useEffect(() => {
    if (disabled) return;

    let cancelled = false;
    const cache = new Array<HTMLImageElement | null>(totalFrames).fill(null);
    const pending = new Set(Array.from({ length: totalFrames - HERO_PRIORITY_FRAME_COUNT }, (_, i) => i + HERO_PRIORITY_FRAME_COUNT));
    const priorityCount = Math.min(HERO_PRIORITY_FRAME_COUNT, totalFrames);
    let loaded = 0;

    const publish = () => {
      if (cancelled) return;
      setImages([...cache]);
      setProgress(Math.min(100, Math.round((loaded / priorityCount) * 100)));
    };

    const pickNext = () => {
      let chosen = -1;
      let best = Infinity;
      for (const index of pending) {
        if (Math.abs(index - cursorRef.current) > 4) continue;
        const score = Math.abs(index - cursorRef.current) + (index < cursorRef.current ? 0.25 : 0);
        if (score < best) {
          best = score;
          chosen = index;
        }
      }
      if (chosen >= 0) pending.delete(chosen);
      return chosen;
    };

    const run = async () => {
      await Promise.all(Array.from({ length: priorityCount }, async (_, index) => {
        cache[index] = await loadImage(getFrameUrl(basePath, index));
        if (!cancelled) loaded += 1;
      }));
      if (cancelled) return;
      publish();
      setProgress(100);
      setIsComplete(true);

      let activeWorkers = 0;
      const concurrency = isLiteMode ? 2 : 3;
      const pump = () => {
        while (!cancelled && activeWorkers < concurrency) {
          const index = pickNext();
          if (index < 0) return;
          pending.delete(index);
          activeWorkers += 1;
          void (async () => {
            try {
              cache[index] = await loadImage(getFrameUrl(basePath, index));
              if (!cancelled) {
                loaded += 1;
                publish();
              }
            } finally {
              activeWorkers -= 1;
              pump();
            }
          })();
        }
      }
      pumpRef.current = pump;
    };
    void run();
    return () => {
      cancelled = true;
      pumpRef.current = null;
    };
  }, [basePath, disabled, isLiteMode, totalFrames]);

  return { images, totalFrames, progress, isComplete, isLiteMode, updateScrollCursor };
}
