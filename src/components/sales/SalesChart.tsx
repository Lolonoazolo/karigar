'use client';

import React from 'react';

type SalesChartProps = {
  data: { label: string; value: number }[];
};

export const SalesChart: React.FC<SalesChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="w-full text-center text-[#6b6358] font-label text-xs py-8">
        Koi sales chart data nahi hai.
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const barColors = ['bg-[#4a7c59]', 'bg-[#c4a66a]', 'bg-[#78a886]', 'bg-[#f0e8db]'];

  return (
    <div className="w-full bg-white rounded-2xl p-5 soft-shadow border border-[#c4c8bc]/30 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-headline text-base font-bold text-[#2e3230]">
          This Month Sales
        </h3>
        <span className="font-label text-xs text-[#6b6358]">Weekly breakdown</span>
      </div>

      <div className="flex items-end justify-between h-36 gap-3 pt-4 border-b border-[#f0ece4] pb-2">
        {data.map((item, index) => {
          const heightPercent = Math.max(12, Math.round((item.value / maxValue) * 100));
          return (
            <div key={item.label} className="flex flex-col items-center gap-2 flex-1 h-full justify-end">
              <span className="font-label text-[10px] font-bold text-[#4a7c59]">
                ₹{item.value >= 1000 ? `${(item.value / 1000).toFixed(1)}k` : item.value}
              </span>
              <div className="w-full bg-[#f0ece4] rounded-t-lg h-full flex items-end overflow-hidden max-w-[36px]">
                <div
                  className={`w-full ${barColors[index % barColors.length]} rounded-t-lg transition-all duration-500`}
                  style={{ height: `${heightPercent}%` }}
                />
              </div>
              <span className="font-label text-xs font-bold text-[#6b6358]">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
