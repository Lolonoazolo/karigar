import { ProductDraft } from '@/types';

const n8nBaseUrl =
  process.env.NEXT_PUBLIC_N8N_BASE_URL ||
  process.env.EXPO_PUBLIC_N8N_BASE_URL ||
  '';

export const isN8nConfigured = Boolean(n8nBaseUrl && n8nBaseUrl.trim().length > 0);

export type N8nWorkflowResult = {
  success: boolean;
  data?: any;
  message: string;
};

export type ProductSaathiN8nRequest = {
  conversation_id: string;
  state: string;
  user_input: {
    text?: string;
    audio_base64?: string;
    image_url?: string;
  };
  draft: Partial<ProductDraft>;
  language: string;
};

export type ProductSaathiN8nResponse = {
  conversation_id: string;
  state: string;
  message: {
    text: string;
    language: string;
  };
  audio?: {
    url?: string;
    base64?: string;
  };
  extracted_draft: Partial<ProductDraft>;
  next_action: {
    type: 'voice' | 'photo' | 'confirm' | 'review';
  };
};

export async function triggerProductSaathiWorkflow(
  payload: ProductSaathiN8nRequest
): Promise<N8nWorkflowResult> {
  if (!isN8nConfigured) {
    return {
      success: false,
      message: 'n8n Webhook URL is not configured. Please set NEXT_PUBLIC_N8N_BASE_URL.',
    };
  }

  try {
    const res = await fetch(`${n8nBaseUrl}/webhook/product-saathi`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`n8n HTTP error: ${res.statusText}`);
    }

    const data: ProductSaathiN8nResponse = await res.json();
    return { success: true, data, message: 'Product Saathi n8n workflow triggered successfully.' };
  } catch (error: any) {
    console.error('n8n Product Saathi workflow error:', error.message);
    return { success: false, message: error.message };
  }
}

export async function triggerSpeechToTextWorkflow(audioPayload: Blob | string): Promise<N8nWorkflowResult> {
  if (!isN8nConfigured) {
    return {
      success: false,
      message: 'n8n Webhook URL is not configured. Please set NEXT_PUBLIC_N8N_BASE_URL.',
    };
  }

  try {
    const res = await fetch(`${n8nBaseUrl}/webhook/speech-to-text`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payload: audioPayload }),
    });

    if (!res.ok) {
      throw new Error(`n8n HTTP error: ${res.statusText}`);
    }

    const data = await res.json();
    return { success: true, data, message: 'n8n workflow triggered successfully.' };
  } catch (error: any) {
    console.error('n8n speech workflow error:', error.message);
    return { success: false, message: error.message };
  }
}

export async function triggerProductDescriptionWorkflow(productData: Record<string, any>): Promise<N8nWorkflowResult> {
  if (!isN8nConfigured) {
    return {
      success: false,
      message: 'n8n Webhook URL is not configured. Please set NEXT_PUBLIC_N8N_BASE_URL.',
    };
  }

  try {
    const res = await fetch(`${n8nBaseUrl}/webhook/generate-description`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData),
    });

    if (!res.ok) {
      throw new Error(`n8n HTTP error: ${res.statusText}`);
    }

    const data = await res.json();
    return { success: true, data, message: 'n8n description workflow triggered successfully.' };
  } catch (error: any) {
    console.error('n8n description workflow error:', error.message);
    return { success: false, message: error.message };
  }
}

export async function triggerImageAnalysisWorkflow(imageUrlOrPath: string): Promise<N8nWorkflowResult> {
  if (!isN8nConfigured) {
    return {
      success: false,
      message: 'n8n Webhook URL is not configured. Please set NEXT_PUBLIC_N8N_BASE_URL.',
    };
  }

  try {
    const res = await fetch(`${n8nBaseUrl}/webhook/analyze-image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUrl: imageUrlOrPath }),
    });

    if (!res.ok) {
      throw new Error(`n8n HTTP error: ${res.statusText}`);
    }

    const data = await res.json();
    return { success: true, data, message: 'n8n image analysis workflow triggered successfully.' };
  } catch (error: any) {
    console.error('n8n image workflow error:', error.message);
    return { success: false, message: error.message };
  }
}
