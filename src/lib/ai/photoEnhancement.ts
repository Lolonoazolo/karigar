import { analyzeProductImage } from '@/services/ai/imageAnalysis';

export type PhotoEnhancementResult = {
  enhancedImage: string;
  detectedCategory: string;
  suggestedTitle: string;
  suggestedDescription: string;
  tags: string[];
  configured: boolean;
  message: string;
};

export async function enhanceProductPhoto(
  originalPhotoUrl?: string | null,
  language?: string,
  userId?: string
): Promise<PhotoEnhancementResult> {
  const result = await analyzeProductImage(originalPhotoUrl || '', userId);

  return {
    enhancedImage: result.enhancedPhotoUrl || originalPhotoUrl || '',
    detectedCategory: result.detectedCategory || '',
    suggestedTitle: result.suggestedTitle || '',
    suggestedDescription: result.suggestedDescription || '',
    tags: result.tags || [],
    configured: result.configured,
    message: result.message,
  };
}
