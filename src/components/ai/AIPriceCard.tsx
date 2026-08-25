'use client';

import React from 'react';
import { Sparkles, Info } from 'lucide-react';

type AIPriceCardProps = {
  makingCost: number;
  desiredProfit: number;
  recommendedPrice: number;
  onEditPrice?: () => void;
};

export const AIPriceCard: React.FC<AIPriceCardProps> = ({
  makingCost,
  desiredProfit,
  recommendedPrice,
  onEditPrice,
}) => {
  const materialCost = Math.round(makingCost * 0.64);
  const craftsmanshipCost = makingCost - materialCost;
  const marketAdjustment = recommendedPrice - makingCost - desiredProfit;

  return (
    <div className="w-full space-y-4">
      {/* Large Green Card */}
      <div className="bg-[#d8f0de] rounded-2xl p-6 soft-shadow border border-[#4a7c59]/20 relative overflow-hidden text-[#002110]">
        <div className="flex items-center justify-between mb-4">
          <div className="inline-flex items-center gap-1.5 bg-[#4a7c59] text-white px-3.5 py-1 rounded-full text-xs font-bold font-label">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Recommended Price</span>
          </div>
          {onEditPrice && (
            <button
              onClick={onEditPrice}
              className="text-xs font-label font-bold text-[#4a7c59] hover:underline"
            >
              Edit Price
            </button>
          )}
        </div>

        <div className="text-center my-4">
          <span className="font-headline text-5xl font-extrabold text-[#002110] tracking-tight">
            ₹{recommendedPrice.toLocaleString('en-IN')}
          </span>
          <p className="font-label text-xs text-[#2a6038] mt-1 font-semibold">
            Optimized for maximum Karigar earnings & buyer trust
          </p>
        </div>

        {/* Price Breakdown Table */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 space-y-2 text-sm font-label border border-[#4a7c59]/10">
          <div className="flex justify-between items-center text-[#4a4e4a]">
            <span>Material Cost</span>
            <span className="font-bold text-[#2e3230]">₹{materialCost}</span>
          </div>
          <div className="flex justify-between items-center text-[#4a4e4a]">
            <span>Craftsmanship</span>
            <span className="font-bold text-[#2e3230]">₹{craftsmanshipCost}</span>
          </div>
          <div className="flex justify-between items-center text-[#4a4e4a]">
            <span>Profit Margin</span>
            <span className="font-bold text-[#4a7c59]">₹{desiredProfit}</span>
          </div>
          {marketAdjustment !== 0 && (
            <div className="flex justify-between items-center text-[#4a4e4a] pt-1 border-t border-[#c4c8bc]/30">
              <span>Market Position Value</span>
              <span className="font-bold text-[#705c30]">
                +₹{marketAdjustment > 0 ? marketAdjustment : 0}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="bg-[#f0ece4] rounded-xl p-3.5 flex items-start gap-2.5 border border-[#c4c8bc]/40">
        <Info className="w-4 h-4 text-[#705c30] shrink-0 mt-0.5" />
        <p className="text-xs text-[#4a4e4a] font-label leading-relaxed">
          Ye sirf AI recommendation hai. Aap final price khud badal sakte hain.
        </p>
      </div>
    </div>
  );
};
