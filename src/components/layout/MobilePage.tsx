'use client';

import React from 'react';

type MobilePageProps = {
  children: React.ReactNode;
  className?: string;
  hasBottomNav?: boolean;
};

export const MobilePage: React.FC<MobilePageProps> = ({
  children,
  className = '',
  hasBottomNav = true,
}) => {
  return (
    <div className="min-h-screen bg-[#faf6f0] flex flex-col items-center justify-start text-[#2e3230] selection:bg-[#d8f0de]">
      {/* Container wrapper: mobile-first, centered on desktop */}
      <div
        className={`w-full max-w-[430px] min-h-screen bg-[#faf6f0] flex flex-col relative shadow-[0_0_50px_rgba(0,0,0,0.06)] border-x border-[#c4c8bc]/20 ${
          hasBottomNav ? 'pb-24' : 'pb-6'
        } ${className}`}
      >
        {children}
      </div>
    </div>
  );
};
