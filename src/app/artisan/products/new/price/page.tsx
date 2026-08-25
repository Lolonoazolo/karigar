'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProductDraft } from '@/context/ProductDraftContext';
import { ProgressIndicator } from '@/components/ui/ProgressIndicator';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AIPriceCard } from '@/components/ai/AIPriceCard';
import { ArrowRight, Sparkles } from 'lucide-react';
import { recommendPrice } from '@/lib/ai/pricing';

export default function AIPriceRecommendationPage() {
  const router = useRouter();
  const { draft, updateDraft } = useProductDraft();

  const [makingCost, setMakingCost] = useState<number>(draft.cost || 700);
  const [desiredProfit, setDesiredProfit] = useState<number>(draft.desiredProfit || 250);
  const [recommendedPrice, setRecommendedPrice] = useState<number>(draft.recommendedPrice || 1099);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  // Recalculate price when making cost or profit changes
  useEffect(() => {
    const marketPosition = 149;
    const total = makingCost + desiredProfit + marketPosition;
    setRecommendedPrice(total > 0 ? total : 1099);
  }, [makingCost, desiredProfit]);

  const handleAiPriceRefresh = async () => {
    setIsAiLoading(true);
    const result = await recommendPrice(makingCost, desiredProfit, draft.name);
    setRecommendedPrice(result.recommendedPrice);
    setIsAiLoading(false);
  };

  const handleConfirmPrice = () => {
    updateDraft({
      cost: makingCost,
      desiredProfit: desiredProfit,
      recommendedPrice: recommendedPrice,
      price: recommendedPrice,
    });
    router.push('/artisan/products/new/sku');
  };

  return (
    <div className="flex-1 flex flex-col px-5 py-6 space-y-6">
      {/* Step Header */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs font-label font-semibold text-[#6b6358]">
          <span>Step 3 of 4</span>
          <span>AI Pricing</span>
        </div>
        <ProgressIndicator currentStep={3} totalSteps={4} />
      </div>

      {/* Heading */}
      <div className="text-center space-y-1.5">
        <h2 className="font-headline text-2xl font-bold text-[#2e3230]">
          Apne product ki keemat tay karein
        </h2>
        <p className="font-label text-sm text-[#4a4e4a]">
          AI will help you set the best price based on your inputs.
        </p>
      </div>

      {/* Input Fields */}
      <div className="bg-white rounded-2xl p-5 soft-shadow border border-[#c4c8bc]/30 space-y-4">
        <Input
          label="Product banane mein kitna kharcha aaya? (Making Cost)"
          type="number"
          prefixText="₹"
          placeholder="700"
          value={makingCost || ''}
          onChange={(e) => setMakingCost(parseInt(e.target.value) || 0)}
          required
        />

        <Input
          label="Aap kitna profit chahte/chahti hain? (Desired Profit)"
          type="number"
          prefixText="₹"
          placeholder="250"
          value={desiredProfit || ''}
          onChange={(e) => setDesiredProfit(parseInt(e.target.value) || 0)}
          required
        />

        <button
          type="button"
          onClick={handleAiPriceRefresh}
          disabled={isAiLoading}
          className="w-full bg-[#f0ece4] hover:bg-[#eae6de] text-[#4a7c59] rounded-xl py-2.5 px-4 font-label font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-[#c4c8bc]/40"
        >
          <Sparkles className="w-4 h-4 text-[#4a7c59]" />
          <span>{isAiLoading ? 'AI calculate kar raha hai...' : 'AI se Dobara Price Puchein'}</span>
        </button>
      </div>

      {/* AI Recommendation Card */}
      <AIPriceCard
        makingCost={makingCost}
        desiredProfit={desiredProfit}
        recommendedPrice={recommendedPrice}
      />

      {/* Actions */}
      <div className="pt-2">
        <Button
          onClick={handleConfirmPrice}
          fullWidth
          size="lg"
          icon={<ArrowRight className="w-5 h-5" />}
        >
          Price Confirm Karein & SKU Set Karein
        </Button>
      </div>
    </div>
  );
}
