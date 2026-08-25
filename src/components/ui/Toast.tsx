'use client';

import React from 'react';

type ToastProps = {
  message: string;
  visible: boolean;
};

export const Toast: React.FC<ToastProps> = ({ message, visible }) => {
  if (!visible) return null;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-[#2e3230] text-[#f5f0e8] px-5 py-3 rounded-xl font-label text-sm font-semibold z-[9999] whitespace-nowrap shadow-xl border border-white/10 animate-fade-in">
      {message}
    </div>
  );
};
