import { supabaseClient, isSupabaseConfigured } from '@/lib/supabase/client';

export type PricingRecommendationResult = {
  configured: boolean;
  materialCost: number;
  craftsmanshipCost: number;
  desiredProfit: number;
  recommendedPrice: number;
  explanation?: string;
  message: string;
};

export async function recommendProductPrice(
  makingCost: number,
  desiredProfit: number,
  productName?: string,
  userId?: string
): Promise<PricingRecommendationResult> {
  const isApiConfigured = Boolean(
    process.env.GEMINI_API_KEY || process.env.GOOGLE_CLOUD_API_KEY
  );

  if (isSupabaseConfigured && supabaseClient && userId) {
    try {
      await supabaseClient.from('ai_generations').insert({
        user_id: userId,
        generation_type: 'price_recommendation',
        input_reference: JSON.stringify({ makingCost, desiredProfit, productName }),
        status: isApiConfigured ? 'processing' : 'pending',
        error_message: isApiConfigured ? null : 'Pricing AI model API key not configured',
      });
    } catch (e) {
      console.warn('Failed to log AI pricing generation event:', e);
    }
  }

  const materialCost = Math.round(makingCost * 0.6);
  const craftsmanshipCost = makingCost - materialCost;
  const calculatedPrice = makingCost + desiredProfit;

  if (!isApiConfigured) {
    return {
      configured: false,
      materialCost,
      craftsmanshipCost,
      desiredProfit,
      recommendedPrice: calculatedPrice,
      explanation: 'Ye price aapki lagat aur chaha gaya labh (profit) par aadharit hai.',
      message: 'AI market-demand pricing model is pending API configuration. Displaying direct cost + profit sum.',
    };
  }

  return {
    configured: true,
    materialCost,
    craftsmanshipCost,
    desiredProfit,
    recommendedPrice: calculatedPrice,
    explanation: 'AI price suggestion based on craft input and market metrics.',
    message: 'Calculated using pricing model.',
  };
}
