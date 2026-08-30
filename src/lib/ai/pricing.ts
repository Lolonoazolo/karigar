import { recommendProductPrice } from '@/services/ai/pricingRecommendation';

export type PricingBreakdown = {
  materialCost: number;
  craftsmanshipCost: number;
  desiredProfit: number;
  marketAdjustment: number;
  recommendedPrice: number;
  explanation: string;
  configured: boolean;
};

export async function recommendPrice(
  makingCost: number = 0,
  desiredProfit: number = 0,
  productName?: string,
  userId?: string
): Promise<PricingBreakdown> {
  const result = await recommendProductPrice(makingCost, desiredProfit, productName, userId);

  return {
    materialCost: result.materialCost,
    craftsmanshipCost: result.craftsmanshipCost,
    desiredProfit: result.desiredProfit,
    marketAdjustment: 0,
    recommendedPrice: result.recommendedPrice,
    explanation: result.explanation || '',
    configured: result.configured,
  };
}
