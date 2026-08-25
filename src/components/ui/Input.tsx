'use client';

import React from 'react';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  prefixText?: string;
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, helperText, error, leftIcon, prefixText, className = '', ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="block font-label text-sm font-semibold text-[#4a4e4a]">
            {label}
            {props.required && <span className="text-[#b83230] ml-1">*</span>}
          </label>
        )}
        <div className="relative flex items-center rounded-xl overflow-hidden bg-[#f5f1ea] border border-[#c4c8bc]/60 focus-within:border-[#4a7c59] focus-within:ring-2 focus-within:ring-[#4a7c59]/20 transition-all">
          {prefixText && (
            <div className="pl-4 pr-3 py-3.5 bg-[#eae6de] border-r border-[#c4c8bc]/40 flex items-center gap-2 text-[#2e3230] font-semibold text-base select-none shrink-0 h-14">
              {prefixText}
            </div>
          )}
          {leftIcon && !prefixText && (
            <span className="absolute left-4 text-[#74796e] z-10 flex items-center justify-center">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            className={`w-full bg-transparent border-none py-3.5 text-[#2e3230] placeholder:text-[#74796e] focus:outline-none focus:ring-0 font-body text-base h-14 ${
              leftIcon && !prefixText ? 'pl-12 pr-4' : 'px-4'
            } ${className}`}
            {...props}
          />
        </div>
        {error ? (
          <p className="font-label text-xs text-[#b83230] font-medium mt-1">{error}</p>
        ) : helperText ? (
          <p className="font-label text-xs text-[#6b6358] mt-1">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
