import { NextRequest, NextResponse } from 'next/server';
import {
  detectLanguage,
  translateDescription,
  extractProductInformation,
  detectMissingRequiredFields,
  generateMissingQuestion,
  ProductAIProcessRequest,
  ProductAIProcessResponse,
} from '@/services/ai/productListingAI';
import { ProductDataSchema } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body: ProductAIProcessRequest = await req.json();

    const originalDesc = body.description || '';
    const userLang = body.language || 'hi';
    const currentDraft: Partial<ProductDataSchema> = body.currentProduct || {};

    // 1. Language Detection
    const detectedLang = await detectLanguage(originalDesc || userLang);

    // 2. Translation to English
    const englishDesc = await translateDescription(originalDesc, detectedLang);

    // 3. Structured Information Extraction
    const extractedProduct = extractProductInformation(englishDesc, currentDraft);

    // Handle missing field answer if provided
    if (body.missingFieldAnswer && body.missingFieldAnswer.field && body.missingFieldAnswer.answer) {
      const field = body.missingFieldAnswer.field as keyof ProductDataSchema;
      const ansText = body.missingFieldAnswer.answer;

      if (field === 'price' || field === 'quantity' || field === 'production_time_days') {
        const parsedNum = parseInt(ansText.replace(/\D/g, ''), 10);
        if (!isNaN(parsedNum)) {
          (extractedProduct as any)[field] = parsedNum;
        }
      } else {
        (extractedProduct as any)[field] = ansText;
      }
    }

    // 4. Missing Required Fields Detection
    const missingFields = detectMissingRequiredFields(extractedProduct);
    const nextQuestion = missingFields.length > 0
      ? generateMissingQuestion(missingFields[0], userLang)
      : null;

    const responseData: ProductAIProcessResponse = {
      detected_language: detectedLang,
      original_description: originalDesc,
      english_description: englishDesc || originalDesc,
      product: extractedProduct,
      missing_required_fields: missingFields,
      next_question: nextQuestion,
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (error: any) {
    console.error('Error in /api/product-ai/process:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process product AI listing.' },
      { status: 500 }
    );
  }
}
