import { ProductDataSchema } from '@/types';

export type ProductAIProcessResponse = {
  detected_language: string;
  english_description: string;
  original_description: string;
  transcription?: string;
  product: ProductDataSchema;
  missing_required_fields: string[];
  next_question?: string | null;
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
  missingFieldAnswer?: { field: string; answer: string };
  artisanId?: string;
};

/**
 * Service layer for calling Next.js API route /api/product-ai/process.
 * Constructs multipart/form-data containing audio Blob and text description.
 */
export async function processProductAI(
  params: ProcessProductAIParams
): Promise<ProductAIProcessResponse> {
  const { audioBlob, textDescription, description, language, imageUrl, currentProduct, missingFieldAnswer, artisanId, action } = params;

  const targetDesc = (textDescription || description || '').trim();
  const hasAudio = Boolean(audioBlob && audioBlob.size > 0);
  const hasText = Boolean(targetDesc);

  if (!hasAudio && !hasText && !missingFieldAnswer) {
    throw new Error('Please record your product description or enter it manually.');
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

  if (missingFieldAnswer) {
    formData.append('missingFieldAnswer', JSON.stringify(missingFieldAnswer));
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
  return normalizeProductAIResponse(data, textDescription || '');
}

function normalizeProductAIResponse(data: any, fallbackDesc: string): ProductAIProcessResponse {
  const rawProduct = data.product || {};

  const product: ProductDataSchema = {
    product_name: rawProduct.product_name || rawProduct.name || rawProduct.title || null,
    category: rawProduct.category || null,
    craft_type: rawProduct.craft_type || rawProduct.craftType || null,
    material: rawProduct.material || null,
    description: rawProduct.description || data.english_description || fallbackDesc || null,
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
    production_time_days: rawProduct.production_time_days || rawProduct.productionTimeDays || null,
    origin: rawProduct.origin || null,
    care_instructions: rawProduct.care_instructions || null,
    tags: rawProduct.tags || [],
  };

  const missingFields = detectMissingRequiredFields(product);
  const nextQuestion = missingFields.length > 0 ? getMissingFieldQuestion(missingFields[0]) : null;

  return {
    success: true,
    detected_language: data.detected_language || data.language_code || 'hi',
    original_description: data.original_description || data.transcription || fallbackDesc,
    english_description: data.english_description || product.description || fallbackDesc,
    transcription: data.transcription || data.original_description || fallbackDesc,
    product,
    missing_required_fields: missingFields,
    next_question: nextQuestion,
    sku: data.sku || rawProduct.sku || `SKU-${Date.now().toString().slice(-6)}`,
  };
}

function detectMissingRequiredFields(product: ProductDataSchema): string[] {
  const missing: string[] = [];
  if (!product.product_name || !product.product_name.trim()) missing.push('product_name');
  if (!product.category || !product.category.trim()) missing.push('category');
  if (!product.craft_type || !product.craft_type.trim()) missing.push('craft_type');
  if (!product.material || !product.material.trim()) missing.push('material');
  if (!product.description || !product.description.trim()) missing.push('description');
  if (product.price === null || product.price === undefined || isNaN(product.price) || product.price <= 0) missing.push('price');
  if (product.quantity === null || product.quantity === undefined || isNaN(product.quantity) || product.quantity <= 0) missing.push('quantity');
  return missing;
}

function getMissingFieldQuestion(field: string): string {
  const questions: Record<string, string> = {
    product_name: 'Yeh product kya hai? (Product Ka Naam)',
    category: 'Yeh kis category mein aata hai?',
    craft_type: 'Yeh kis craft/kala se bana hai?',
    material: 'Yeh kis material se bana hai?',
    description: 'Is product ki thodi jankari batayein.',
    price: 'Ek piece ki keemat kitni hai? (Price in ₹)',
    quantity: 'Abhi kitne pieces available hain?',
  };
  return questions[field] || 'Kripya is field ki jankari batayein.';
}
