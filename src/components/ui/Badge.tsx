'use client';

import React from 'react';

type BadgeProps = {
  children: React.ReactNode;
  variant?: 'published' | 'draft' | 'coming' | 'primary' | 'tertiary';
  className?: string;
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  className = '',
}) => {
  const styles = {
    published: 'bg-[#c4a66a] text-[#554020] font-bold',
    draft: 'bg-[#eae6de] text-[#4a4e4a] border border-[#c4c8bc]/40',
    coming: 'bg-[#faf6f0] text-[#4a4e4a] border border-[#c4c8bc]/60 text-[10px]',
    primary: 'bg-[#d8f0de] text-[#002110] font-bold',
    tertiary: 'bg-[#f8e0a8] text-[#554020] font-bold',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-label ${styles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
