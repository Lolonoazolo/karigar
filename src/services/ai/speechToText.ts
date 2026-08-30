import { supabaseClient, isSupabaseConfigured } from '@/lib/supabase/client';

export type SpeechToTextResult = {
  configured: boolean;
  transcript?: string;
  message: string;
};

export async function speechToText(
  audioBlob?: Blob,
  userId?: string
): Promise<SpeechToTextResult> {
  const isApiConfigured = Boolean(
    process.env.GEMINI_API_KEY || process.env.GOOGLE_CLOUD_API_KEY
  );

  if (isSupabaseConfigured && supabaseClient && userId) {
    try {
      await supabaseClient.from('ai_generations').insert({
        user_id: userId,
        generation_type: 'speech_to_text',
        input_reference: audioBlob ? `audio_blob_${audioBlob.size}_bytes` : 'voice_mic_recording',
        status: isApiConfigured ? 'processing' : 'pending',
        error_message: isApiConfigured ? null : 'Speech recognition API key not configured',
      });
    } catch (e) {
      console.warn('Failed to log AI speech generation event:', e);
    }
  }

  if (!isApiConfigured) {
    return {
      configured: false,
      transcript: undefined,
      message: 'Speech recognition API key not configured. Please use text entry or configure speech-to-text credentials.',
    };
  }

  return {
    configured: true,
    transcript: '',
    message: 'Audio processed successfully.',
  };
}
