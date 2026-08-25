'use client';

import React from 'react';

type MetricCardProps = {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: string;
  highlight?: boolean;
};

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  highlight = false,
}) => {
  if (highlight) {
    return (
      <div className="col-span-2 bg-[#faf6f0] rounded-2xl p-5 soft-shadow border border-[#4a7c59]/30 relative overflow-hidden flex flex-col justify-between">
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-[#8ecf9e]/20 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center justify-between mb-3 relative z-10">
          <h2 className="font-label text-xs font-semibold text-[#6b6358] uppercase tracking-wider flex items-center gap-1.5">
            {icon} {title}
          </h2>
          {trend && (
            <span className="font-label text-xs font-bold text-[#4a7c59] bg-[#d8f0de] px-2.5 py-0.5 rounded-full border border-[#4a7c59]/20">
              {trend}
            </span>
          )}
        </div>
        <div className="relative z-10">
          <p className="font-headline text-4xl font-extrabold text-[#4a7c59] tracking-tight">
            {value}
          </p>
          {subtitle && (
            <p className="font-label text-xs text-[#6b6358] mt-1 font-medium">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-4 soft-shadow border border-[#c4c8bc]/30 flex flex-col justify-between">
      <h2 className="font-label text-xs font-semibold text-[#6b6358] mb-2 flex items-center gap-1.5">
        {icon} {title}
      </h2>
      <p className="font-headline text-3xl font-bold text-[#2e3230]">{value}</p>
      {subtitle && (
        <p className="font-label text-[11px] text-[#6b6358] mt-1 font-medium">
          {subtitle}
        </p>
      )}
    </div>
  );
};
