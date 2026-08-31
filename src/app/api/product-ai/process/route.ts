import { NextRequest, NextResponse } from 'next/server';
import {
  detectLanguage,
  translateDescription,
  extractProductInformation,
  detectMissingRequiredFields,
  generateMissingQuestion,
} from '@/services/ai/productListingAI';
import { ProductDataSchema } from '@/types';

const PYTHON_AI_API_URL =
  process.env.PYTHON_AI_API_URL ||
  process.env.PYTHON_API_URL ||
  process.env.NEXT_PUBLIC_PYTHON_API_URL ||
  'http://localhost:8000';

export async function POST(req: NextRequest) {
  try {
    let audioFile: Blob | null = null;
    let descriptionText = '';
    let languageCode = 'hi';
    let artisanId = '';
    let currentProduct: Partial<ProductDataSchema> = {};
    let missingFieldAnswer: { field: string; answer: string } | null = null;

    const contentType = req.headers.get('content-type') || '';

    // 1. Parse Multipart Form Data or JSON Body
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const audioField = formData.get('audio') || formData.get('file');
      if (audioField && (audioField instanceof Blob || typeof (audioField as any).stream === 'function')) {
        audioFile = audioField as Blob;
      }
      descriptionText = (formData.get('description') as string) || '';
      languageCode = (formData.get('language') as string) || 'hi';
      artisanId = (formData.get('artisanId') as string) || '';

      const currentProductRaw = formData.get('currentProduct') as string;
      if (currentProductRaw) {
        try {
          currentProduct = JSON.parse(currentProductRaw);
        } catch (e) {
          // ignore
        }
      }

      const missingAnswerRaw = formData.get('missingFieldAnswer') as string;
      if (missingAnswerRaw) {
        try {
          missingFieldAnswer = JSON.parse(missingAnswerRaw);
        } catch (e) {
          // ignore
        }
      }
    } else {
      const jsonBody = await req.json().catch(() => ({}));
      descriptionText = jsonBody.description || '';
      languageCode = jsonBody.language || 'hi';
      artisanId = jsonBody.artisanId || '';
      currentProduct = jsonBody.currentProduct || {};
      missingFieldAnswer = jsonBody.missingFieldAnswer || null;
    }

    // 2. Server-to-Server Proxy Call to Python FastAPI Backend (PYTHON_AI_API_URL)
    const pythonEndpoint = `${PYTHON_AI_API_URL.replace(/\/$/, '')}/api/product-ai/process`;
    console.log(`[Next.js API Bridge] Proxying request to Python backend: ${pythonEndpoint}`);

    try {
      const pyFormData = new FormData();
      if (audioFile) {
        const mimeType = audioFile.type || 'audio/webm';
        const ext = mimeType.includes('ogg') ? 'ogg' : mimeType.includes('mp4') ? 'm4a' : 'webm';
        pyFormData.append('audio', audioFile, `recording.${ext}`);
      }
      if (descriptionText) {
        pyFormData.append('description', descriptionText);
      }
      if (languageCode) {
        pyFormData.append('language', languageCode);
      }
      if (artisanId) {
        pyFormData.append('artisan_id', artisanId);
      }

      const pythonRes = await fetch(pythonEndpoint, {
        method: 'POST',
        body: pyFormData,
      });

      if (pythonRes.ok) {
        const pyData = await pythonRes.json();
        console.log('[Next.js API Bridge] Python AI backend response received successfully.');

        const rawProduct = pyData.product || {};
        const extractedProduct: ProductDataSchema = {
          product_name: rawProduct.product_name || rawProduct.name || null,
          category: rawProduct.category || null,
          craft_type: rawProduct.craft_type || rawProduct.craftType || null,
          material: rawProduct.material || null,
          description: rawProduct.description || pyData.english_description || descriptionText || null,
          price: rawProduct.price !== undefined && rawProduct.price !== null ? Number(rawProduct.price) : null,
          currency: rawProduct.currency || 'INR',
          quantity: rawProduct.quantity !== undefined && rawProduct.quantity !== null
            ? Number(rawProduct.quantity)
            : rawProduct.stock !== undefined && rawProduct.stock !== null
            ? Number(rawProduct.stock)
            : null,
          color: rawProduct.color || null,
          dimensions: rawProduct.dimensions || null,
          weight: rawProduct.weight || null,
          production_time_days: rawProduct.production_time_days || null,
          origin: rawProduct.origin || null,
          care_instructions: rawProduct.care_instructions || null,
          tags: rawProduct.tags || [],
        };

        const missingFields = detectMissingRequiredFields(extractedProduct);
        const nextQuestion = missingFields.length > 0 ? generateMissingQuestion(missingFields[0], languageCode) : null;

        return NextResponse.json({
          detected_language: pyData.detected_language || languageCode,
          original_description: pyData.original_description || pyData.transcription || descriptionText,
          english_description: pyData.english_description || extractedProduct.description || descriptionText,
          transcription: pyData.transcription || pyData.original_description || descriptionText,
          product: extractedProduct,
          missing_required_fields: missingFields,
          next_question: nextQuestion,
          sku: pyData.sku || rawProduct.sku || `SKU-${Date.now().toString().slice(-6)}`,
          python_backend_success: true,
        });
      } else {
        console.warn(`[Next.js API Bridge] Python backend returned status ${pythonRes.status}`);
      }
    } catch (pythonErr: any) {
      console.warn('[Next.js API Bridge] Could not connect to Python backend, using local fallback:', pythonErr.message);
    }

    // 3. Fallback Entity Extraction logic if Python backend is offline
    const detectedLang = await detectLanguage(descriptionText || languageCode);
    const englishDesc = await translateDescription(descriptionText, detectedLang);
    const extractedProduct = extractProductInformation(englishDesc, currentProduct);

    if (missingFieldAnswer && missingFieldAnswer.field && missingFieldAnswer.answer) {
      const field = missingFieldAnswer.field as keyof ProductDataSchema;
      const ansText = missingFieldAnswer.answer;
      if (field === 'price' || field === 'quantity' || field === 'production_time_days') {
        const parsedNum = parseInt(ansText.replace(/\D/g, ''), 10);
        if (!isNaN(parsedNum)) {
          (extractedProduct as any)[field] = parsedNum;
        }
      } else {
        (extractedProduct as any)[field] = ansText;
      }
    }

    const missingFields = detectMissingRequiredFields(extractedProduct);
    const nextQuestion = missingFields.length > 0
      ? generateMissingQuestion(missingFields[0], languageCode)
      : null;

    return NextResponse.json({
      detected_language: detectedLang,
      original_description: descriptionText,
      english_description: englishDesc || descriptionText,
      transcription: descriptionText,
      product: extractedProduct,
      missing_required_fields: missingFields,
      next_question: nextQuestion,
      sku: `SKU-${Date.now().toString().slice(-6)}`,
      python_backend_success: false,
    });
  } catch (error: any) {
    console.error('Error in /api/product-ai/process route:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process product AI listing.' },
      { status: 500 }
    );
  }
}
