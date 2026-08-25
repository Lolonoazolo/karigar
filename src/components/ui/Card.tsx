'use client';

import React from 'react';

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: 'surface' | 'container' | 'primary' | 'outline';
  padding?: 'none' | 'sm' | 'md' | 'lg';
};

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'surface',
  padding = 'md',
  className = '',
  ...props
}) => {
  const variantStyles = {
    surface: 'bg-white border border-[#c4c8bc]/30 soft-shadow',
    container: 'bg-[#f5f1ea] border border-[#c4c8bc]/20',
    primary: 'bg-[#d8f0de] border border-[#4a7c59]/20 text-[#002110]',
    outline: 'bg-transparent border border-[#c4c8bc]/60',
  };

  const paddingStyles = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-6',
  };

  return (
    <div
      className={`rounded-2xl transition-all duration-200 ${variantStyles[variant]} ${paddingStyles[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
