/**
 * Translation service abstraction for KarigarAI prototype.
 */

export async function translateContent(text: string, targetLang: string): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return text; // Returns target translation placeholder
}
