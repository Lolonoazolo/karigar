import { ProductDataSchema } from '@/types';

export type ProductAIProcessResponse = {
  detected_language: string;
  english_description: string;
  original_description: string;
  transcription?: string;
  product: ProductDataSchema;
  sku?: string;
  success?: boolean;
};

export type ProcessProductAIParams = {
  action?: string;
  audioBlob?: Blob | null;
  textDescription?: string;
  description?: string;
  language?: string;
  imageUrl?: string;
  currentProduct?: Partial<ProductDataSchema>;
  artisanId?: string;
};

/**
 * Service layer for calling Next.js API route /api/product-ai/process.
 * Constructs multipart/form-data containing audio Blob and text description.
 */
export async function processProductAI(
  params: ProcessProductAIParams
): Promise<ProductAIProcessResponse> {
  const { audioBlob, textDescription, description, language, imageUrl, currentProduct, artisanId, action } = params;

  const targetDesc = (textDescription || description || '').trim();
  const hasAudio = Boolean(audioBlob && audioBlob.size > 0);
  const hasText = Boolean(targetDesc);

  if (!hasAudio && !hasText) {
    throw new Error('कृपया अपनी उत्पाद जानकारी बोलें या लिखें।');
  }

  const formData = new FormData();

  if (action) {
    formData.append('action', action);
  }

  if (hasAudio && audioBlob) {
    const mimeType = audioBlob.type || 'audio/webm';
    const ext = mimeType.includes('ogg') ? 'ogg' : mimeType.includes('mp4') ? 'm4a' : 'webm';
    formData.append('audio', audioBlob, `recording.${ext}`);
  }

  if (hasText) {
    formData.append('description', targetDesc);
  }

  if (language) {
    formData.append('language', language);
  }

  if (artisanId) {
    formData.append('artisanId', artisanId);
  }

  if (currentProduct) {
    formData.append('currentProduct', JSON.stringify(currentProduct));
  }

  const res = await fetch('/api/product-ai/process', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || 'AI service is unavailable. Please try again.');
  }

  const data = await res.json();
  return normalizeProductAIResponse(data, targetDesc);
}

function normalizeProductAIResponse(data: any, fallbackDesc: string): ProductAIProcessResponse {
  const rawProduct = data.product || {};

  // Extract Price robustly
  let parsedPrice: number | null = null;
  if (rawProduct.price !== undefined && rawProduct.price !== null) {
    const cleanP = String(rawProduct.price).replace(/[^\d.]/g, '');
    if (cleanP && !isNaN(Number(cleanP))) {
      parsedPrice = Number(cleanP);
    }
  }

  // Extract Quantity robustly
  let parsedQty: number | null = null;
  const rawQ = rawProduct.quantity !== undefined && rawProduct.quantity !== null ? rawProduct.quantity : rawProduct.stock;
  if (rawQ !== undefined && rawQ !== null) {
    const cleanQ = String(rawQ).replace(/[^\d]/g, '');
    if (cleanQ && !isNaN(Number(cleanQ))) {
      parsedQty = Number(cleanQ);
    }
  }

  let rawName = rawProduct.product_name || rawProduct.name || rawProduct.title || null;
  if (rawName && (rawName.length > 50 || rawName.startsWith('यह') || rawName.toLowerCase().startsWith('this is'))) {
    rawName = null;
  }

  const product: ProductDataSchema = {
    product_name: rawName,
    category: rawProduct.category || null,
    craft_type: rawProduct.craft_type || rawProduct.craftType || null,
    material: rawProduct.material || null,
    description: rawProduct.description || data.english_description || fallbackDesc || null,
    price: parsedPrice,
    currency: rawProduct.currency || 'INR',
    quantity: parsedQty,
    color: rawProduct.color || null,
    dimensions: rawProduct.dimensions || null,
    weight: rawProduct.weight || null,
    production_time_days: rawProduct.production_time_days || rawProduct.productionTimeDays || null,
    origin: rawProduct.origin || null,
    care_instructions: rawProduct.care_instructions || null,
    tags: rawProduct.tags || [],
  };

  return {
    success: true,
    detected_language: data.detected_language || data.language_code || 'hi',
    original_description: data.original_description || data.transcription || fallbackDesc,
    english_description: data.english_description || product.description || fallbackDesc,
    transcription: data.transcription || data.original_description || fallbackDesc,
    product,
    sku: data.sku || rawProduct.sku || `SKU-${Date.now().toString().slice(-6)}`,
  };
}
