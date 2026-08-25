'use client';

import React, { useState, useRef, useCallback } from 'react';
import Image from 'next/image';

type BeforeAfterSliderProps = {
  beforeImage?: string | null;
  afterImage?: string | null;
};

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  beforeImage,
  afterImage,
}) => {
  const [sliderPosition, setSliderPosition] = useState<number>(50); // 0 to 100%
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    let percentage = (x / rect.width) * 100;
    if (percentage < 0) percentage = 0;
    if (percentage > 100) percentage = 100;
    setSliderPosition(percentage);
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging) return;
      handleMove(e.touches[0].clientX);
    },
    [isDragging, handleMove]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      handleMove(e.clientX);
    },
    [isDragging, handleMove]
  );

  const handlePointerDown = () => setIsDragging(true);
  const handlePointerUp = () => setIsDragging(false);

  // Fallback demo imagery if none provided
  const beforeSrc = beforeImage || 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=800&auto=format&fit=crop';
  const afterSrc = afterImage || 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800&auto=format&fit=crop';

  return (
    <div className="w-full space-y-3">
      <div
        ref={containerRef}
        className="w-full aspect-square rounded-2xl overflow-hidden relative select-none touch-none cursor-ew-resize soft-shadow bg-[#f0ece4] border border-[#c4c8bc]/40"
        onMouseDown={handlePointerDown}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
        onMouseMove={handleMouseMove}
        onTouchStart={handlePointerDown}
        onTouchEnd={handlePointerUp}
        onTouchMove={handleTouchMove}
      >
        {/* AFTER IMAGE (Background - Full) */}
        <div className="absolute inset-0 w-full h-full">
          <img
            src={afterSrc}
            alt="AI Enhanced Product"
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3 right-3 bg-[#705c30] text-white px-3 py-1 rounded-full font-label text-xs font-bold shadow-md z-10">
            AFTER ✨
          </div>
        </div>

        {/* BEFORE IMAGE (Clipped Foreground) */}
        <div
          className="absolute inset-0 h-full overflow-hidden border-r-2 border-white shadow-xl"
          style={{ width: `${sliderPosition}%` }}
        >
          <img
            src={beforeSrc}
            alt="Original Product Photo"
            className="w-full h-full object-cover max-w-none"
            style={{ width: containerRef.current ? containerRef.current.clientWidth : '100%' }}
          />
          <div className="absolute top-3 left-3 bg-[#2e3230]/80 text-white px-3 py-1 rounded-full font-label text-xs font-bold backdrop-blur-sm z-10">
            BEFORE
          </div>
        </div>

        {/* DRAG HANDLE KNOCK / KNOB */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white cursor-ew-resize z-20 flex items-center justify-center"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="w-10 h-10 bg-[#4a7c59] text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white font-bold text-sm select-none">
            ↔
          </div>
        </div>
      </div>
      <p className="text-center font-label text-xs font-semibold text-[#6b6358]">
        👈 Drag slider to compare Original vs AI Studio Enhanced photo 👉
      </p>
    </div>
  );
};
