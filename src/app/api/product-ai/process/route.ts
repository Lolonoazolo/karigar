import { NextRequest, NextResponse } from 'next/server';
import {
  detectLanguage,
  translateDescription,
  extractProductInformation,
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
    } else {
      const jsonBody = await req.json().catch(() => ({}));
      descriptionText = jsonBody.description || '';
      languageCode = jsonBody.language || 'hi';
      artisanId = jsonBody.artisanId || '';
      currentProduct = jsonBody.currentProduct || {};
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

        let parsedPrice: number | null = null;
        if (rawProduct.price !== undefined && rawProduct.price !== null) {
          const cleanP = String(rawProduct.price).replace(/[^\d.]/g, '');
          if (cleanP && !isNaN(Number(cleanP))) {
            parsedPrice = Number(cleanP);
          }
        }

        let parsedQty: number | null = null;
        const rawQtyVal = rawProduct.quantity !== undefined && rawProduct.quantity !== null ? rawProduct.quantity : rawProduct.stock;
        if (rawQtyVal !== undefined && rawQtyVal !== null) {
          const cleanQ = String(rawQtyVal).replace(/[^\d]/g, '');
          if (cleanQ && !isNaN(Number(cleanQ))) {
            parsedQty = Number(cleanQ);
          }
        }

        const extractedProduct: ProductDataSchema = {
          product_name: rawProduct.product_name || rawProduct.name || null,
          category: rawProduct.category || null,
          craft_type: rawProduct.craft_type || rawProduct.craftType || null,
          material: rawProduct.material || null,
          description: rawProduct.description || pyData.english_description || descriptionText || null,
          price: parsedPrice,
          currency: rawProduct.currency || 'INR',
          quantity: parsedQty,
          color: rawProduct.color || null,
          dimensions: rawProduct.dimensions || null,
          weight: rawProduct.weight || null,
          production_time_days: rawProduct.production_time_days || null,
          origin: rawProduct.origin || null,
          care_instructions: rawProduct.care_instructions || null,
          tags: rawProduct.tags || [],
        };

        return NextResponse.json({
          detected_language: pyData.detected_language || languageCode,
          original_description: pyData.original_description || pyData.transcription || descriptionText,
          english_description: pyData.english_description || extractedProduct.description || descriptionText,
          transcription: pyData.transcription || pyData.original_description || descriptionText,
          product: extractedProduct,
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

    return NextResponse.json({
      detected_language: detectedLang,
      original_description: descriptionText,
      english_description: englishDesc || descriptionText,
      transcription: descriptionText,
      product: extractedProduct,
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
