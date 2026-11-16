'use client';

import { useCallback, useEffect, useRef } from 'react';

type Props = {
  images: (HTMLImageElement | null)[];
  totalFrames: number;
  frameIndex: number;
  posterSrc?: string;
};

export function SequenceCanvas({ images, totalFrames, frameIndex, posterSrc }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef(images);
  const frameRef = useRef(frameIndex);
  const posterRef = useRef<HTMLImageElement | null>(null);
  const sizeRef = useRef({ width: 0, height: 0 });
  const drawnRef = useRef(-1);

  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  useEffect(() => {
    frameRef.current = frameIndex;
  }, [frameIndex]);

  const draw = useCallback((requested: number, force = false) => {
    const canvas = canvasRef.current;
    const { width, height } = sizeRef.current;
    if (!canvas || !width || !height || !totalFrames) return;
    const index = Math.max(0, Math.min(totalFrames - 1, requested));
    if (!force && index === drawnRef.current) return;
    let image = imagesRef.current[index];
    if (!image) {
      for (let distance = 1; distance < totalFrames && !image; distance += 1) {
        image = imagesRef.current[index - distance] || imagesRef.current[index + distance] || null;
      }
    }
    image = image || posterRef.current;
    if (!image?.complete || !image.naturalWidth) return;
    const context = canvas.getContext('2d');
    if (!context) return;
    const ratio = Math.max(width / image.naturalWidth, height / image.naturalHeight);
    const drawWidth = image.naturalWidth * ratio;
    const drawHeight = image.naturalHeight * ratio;
    context.clearRect(0, 0, width, height);
    context.drawImage(image, (width - drawWidth) / 2, (height - drawHeight) / 2, drawWidth, drawHeight);
    drawnRef.current = index;
  }, [totalFrames]);

  useEffect(() => {
    if (!posterSrc) return;
    let cancelled = false;
    const poster = new Image();
    poster.onload = () => {
      if (cancelled) return;
      posterRef.current = poster;
      draw(frameRef.current, true);
    };
    poster.src = posterSrc;
    return () => { cancelled = true; };
  }, [draw, posterSrc]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = window.innerWidth;
      const height = window.innerHeight;
      sizeRef.current = { width, height };
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      canvas.getContext('2d')?.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw(frameRef.current, true);
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [draw]);

  useEffect(() => {
    draw(frameIndex, true);
  }, [draw, frameIndex, images]);

  return <canvas ref={canvasRef} aria-hidden="true" className="block h-full w-full bg-transparent" />;
}
