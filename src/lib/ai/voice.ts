/**
 * Voice processing service abstraction for KarigarAI prototype.
 */

export async function processVoiceInput(audioBlob?: Blob): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 1500));
  return 'Main pichhle 8 saal se Banarasi cotton dupatta aur saaree haath se bunta hoon. Mera parivar do peedhi se is craft mein juda hua hai.';
}
