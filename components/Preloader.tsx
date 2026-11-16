'use client';

export function Preloader({ progress, isComplete }: { progress: number; isComplete: boolean }) {
  return (
    <div
      role="progressbar"
      aria-label="Loading forest sequence"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={progress}
      aria-hidden={isComplete}
      className={`pointer-events-none fixed inset-x-0 top-0 z-50 h-[2px] bg-white/10 transition-opacity duration-700 ${isComplete ? 'opacity-0' : 'opacity-100'}`}
    >
      <div
        className="h-full bg-gold shadow-[0_0_10px_rgba(201,169,110,.7)] transition-[width] duration-300"
        style={{ width: `${Math.max(4, progress)}%` }}
      />
    </div>
  );
}
