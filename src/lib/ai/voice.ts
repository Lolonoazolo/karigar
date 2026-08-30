import { speechToText } from '@/services/ai/speechToText';

export async function processVoiceInput(audioBlob?: Blob, userId?: string): Promise<string> {
  const result = await speechToText(audioBlob, userId);
  return result.transcript || '';
}
