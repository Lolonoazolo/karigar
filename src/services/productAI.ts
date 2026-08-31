import { ProductDataSchema } from '@/types';

export type ProductAIProcessRequest = {
  action?: 'process_description' | 'answer_missing' | 'analyze_image';
  description?: string;
  language?: string;
  imageUrl?: string;
  currentProduct?: Partial<ProductDataSchema>;
  missingFieldAnswer?: { field: string; answer: string };
  audioBlob?: Blob | null;
};

export type ProductAIProcessResponse = {
  detected_language: string;
  english_description: string;
  original_description: string;
  transcription?: string;
  product: ProductDataSchema;
  missing_required_fields: string[];
  next_question?: string | null;
  sku?: string;
};

const PYTHON_API_URL =
  process.env.PYTHON_API_URL ||
  process.env.NEXT_PUBLIC_PYTHON_API_URL ||
  'http://localhost:8000';

/**
 * Sends audio recording and/or text description to Python/FastAPI AI backend.
 * Falls back to Next.js API route if Python backend is unreachable.
 */
export async function processProductAI(
  params: ProductAIProcessRequest
): Promise<ProductAIProcessResponse> {
  const { description, audioBlob, language, imageUrl, currentProduct, missingFieldAnswer } = params;

  const hasText = Boolean(description && description.trim());
  const hasAudio = Boolean(audioBlob && audioBlob.size > 0);

  if (!hasText && !hasAudio && !missingFieldAnswer) {
    throw new Error('Please record your product description or enter it manually.');
  }

  // 1. Prepare FormData for multipart upload if audio exists
  const formData = new FormData();
  if (hasAudio && audioBlob) {
    const ext = audioBlob.type.includes('ogg') ? 'ogg' : audioBlob.type.includes('mp4') ? 'm4a' : 'webm';
    formData.append('audio', audioBlob, `recording.${ext}`);
    formData.append('file', audioBlob, `recording.${ext}`);
  }
  if (hasText) {
    formData.append('description', description!.trim());
  }
  if (language) {
    formData.append('language', language);
  }
  if (imageUrl) {
    formData.append('imageUrl', imageUrl);
  }
  if (currentProduct) {
    formData.append('currentProduct', JSON.stringify(currentProduct));
  }
  if (missingFieldAnswer) {
    formData.append('missingFieldAnswer', JSON.stringify(missingFieldAnswer));
  }

  // 2. Try Primary Python/FastAPI Endpoint
  try {
    const pythonEndpoint = `${PYTHON_API_URL.replace(/\/$/, '')}/api/product-ai/process`;
    console.log(`[productAI] Sending request to Python AI backend: ${pythonEndpoint}`);

    const res = await fetch(pythonEndpoint, {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      return normalizeResponse(data, description || '');
    }
  } catch (pythonErr) {
    console.warn('[productAI] Python backend notice:', pythonErr);
  }

  // 3. Fallback to Next.js Internal API Route (/api/product-ai/process)
  console.log('[productAI] Calling internal Next.js API fallback route...');
  const nextRes = await fetch('/api/product-ai/process', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: params.action || 'process_description',
      description: description || '',
      language: language || 'hi',
      imageUrl,
      currentProduct,
      missingFieldAnswer,
    }),
  });

  if (!nextRes.ok) {
    const errJson = await nextRes.json().catch(() => ({}));
    throw new Error(errJson.error || 'AI processing service is currently unavailable. Please try again.');
  }

  const nextData = await nextRes.json();
  return normalizeResponse(nextData, description || '');
}

function normalizeResponse(raw: any, fallbackDesc: string): ProductAIProcessResponse {
  const prod = raw.product || {};

  const normalizedProduct: ProductDataSchema = {
    product_name: prod.product_name || prod.name || prod.title || null,
    category: prod.category || null,
    craft_type: prod.craft_type || prod.craftType || null,
    material: prod.material || null,
    description: prod.description || raw.english_description || fallbackDesc || null,
    price: prod.price ? Number(prod.price) : null,
    currency: prod.currency || 'INR',
    quantity: prod.quantity !== undefined ? Number(prod.quantity) : prod.stock !== undefined ? Number(prod.stock) : null,
    color: prod.color || null,
    dimensions: prod.dimensions || null,
    weight: prod.weight || null,
    production_time_days: prod.production_time_days || prod.productionTimeDays || null,
    origin: prod.origin || null,
    care_instructions: prod.care_instructions || null,
    tags: prod.tags || [],
  };

  return {
    detected_language: raw.detected_language || raw.language || 'hi',
    original_description: raw.original_description || raw.transcription || fallbackDesc,
    english_description: raw.english_description || normalizedProduct.description || fallbackDesc,
    transcription: raw.transcription || raw.original_description || fallbackDesc,
    product: normalizedProduct,
    missing_required_fields: raw.missing_required_fields || [],
    next_question: raw.next_question || null,
    sku: raw.sku || prod.sku || `SKU-${Date.now().toString().slice(-6)}`,
  };
}
