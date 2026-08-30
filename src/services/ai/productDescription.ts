import { supabaseClient, isSupabaseConfigured } from '@/lib/supabase/client';

export type ProductDescriptionResult = {
  configured: boolean;
  title?: string;
  description?: string;
  tags?: string[];
  message: string;
};

export async function generateProductDescription(
  productName: string,
  category: string,
  userId?: string
): Promise<ProductDescriptionResult> {
  const isApiConfigured = Boolean(
    process.env.GEMINI_API_KEY || process.env.GOOGLE_CLOUD_API_KEY
  );

  // Track generation attempt in Supabase ai_generations table
  if (isSupabaseConfigured && supabaseClient && userId) {
    try {
      await supabaseClient.from('ai_generations').insert({
        user_id: userId,
        generation_type: 'product_description',
        input_reference: JSON.stringify({ productName, category }),
        status: isApiConfigured ? 'processing' : 'pending',
        error_message: isApiConfigured ? null : 'AI API key not configured',
      });
    } catch (e) {
      console.warn('Failed to log AI generation event:', e);
    }
  }

  if (!isApiConfigured) {
    return {
      configured: false,
      message: 'AI Service is not configured yet. Please provide a GEMINI_API_KEY or connection credentials.',
    };
  }

  // Future API execution hook (e.g. Gemini API / Edge Function call)
  return {
    configured: true,
    title: productName,
    description: `Handcrafted ${productName} in ${category} craft category.`,
    tags: [category, 'Handmade'],
    message: 'Generated successfully.',
  };
}
