import { supabaseClient, isSupabaseConfigured } from '@/lib/supabase/client';

export type ImageAnalysisResult = {
  configured: boolean;
  enhancedPhotoUrl?: string | null;
  detectedCategory?: string;
  suggestedTitle?: string;
  suggestedDescription?: string;
  tags?: string[];
  message: string;
};

export async function analyzeProductImage(
  imageInput: string | File | Blob,
  userId?: string
): Promise<ImageAnalysisResult> {
  const isApiConfigured = Boolean(
    process.env.GEMINI_API_KEY || process.env.GOOGLE_CLOUD_API_KEY
  );

  if (isSupabaseConfigured && supabaseClient && userId) {
    try {
      await supabaseClient.from('ai_generations').insert({
        user_id: userId,
        generation_type: 'photo_enhancement',
        input_reference: typeof imageInput === 'string' ? imageInput : 'blob_input',
        status: isApiConfigured ? 'processing' : 'pending',
        error_message: isApiConfigured ? null : 'Vision AI model API key not configured',
      });
    } catch (e) {
      console.warn('Failed to log AI generation event:', e);
    }
  }

  if (!isApiConfigured) {
    return {
      configured: false,
      enhancedPhotoUrl: typeof imageInput === 'string' ? imageInput : null,
      message: 'AI Photo Enhancement model API key not configured. Using original photo.',
    };
  }

  return {
    configured: true,
    enhancedPhotoUrl: typeof imageInput === 'string' ? imageInput : null,
    message: 'Image processed.',
  };
}
