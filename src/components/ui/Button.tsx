'use client';

import React from 'react';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'outline' | 'ghost';
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
};

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  fullWidth = false,
  size = 'md',
  icon,
  iconPosition = 'right',
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'font-label font-bold rounded-xl transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 shadow-sm';

  const variantStyles = {
    primary: 'bg-[#4a7c59] text-white hover:bg-[#3d6849] active:bg-[#34583e]',
    secondary:
      'bg-[#faf6f0] text-[#4a7c59] border border-[#c4c8bc] hover:bg-[#f0ece4]',
    tertiary:
      'bg-[#705c30] text-white hover:bg-[#5c4b26] active:bg-[#4d3e1f]',
    outline:
      'bg-transparent text-[#4a7c59] border border-[#4a7c59] hover:bg-[#d8f0de]/30',
    ghost:
      'bg-transparent text-[#2e3230] hover:bg-[#f0ece4] shadow-none border-none',
  };

  const sizeStyles = {
    sm: 'py-2 px-3 text-sm h-10',
    md: 'py-3.5 px-5 text-base h-12',
    lg: 'py-4 px-6 text-lg h-14',
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
      {icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
    </button>
  );
};
