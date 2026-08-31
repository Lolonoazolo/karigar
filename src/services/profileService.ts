import { supabaseClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { ArtisanUser } from '@/types';

/**
 * Fetches artisan profile from public.artisans using the authenticated user ID.
 */
export async function getProfile(userId: string) {
  if (!isSupabaseConfigured || !supabaseClient || !userId) return null;

  const { data, error } = await supabaseClient
    .from('artisans')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.warn('Notice: Error fetching artisan profile:', error.message);
    return null;
  }

  return data;
}

/**
 * Alias helper fetching artisan record from public.artisans table.
 */
export async function getArtisanProfile(profileId: string) {
  return getProfile(profileId);
}

/**
 * Upserts artisan profile data strictly into public.artisans table using user id.
 */
export async function updateArtisanFullProfile(
  userId: string,
  updates: {
    name?: string;
    craft?: string;
    location?: string;
    bio?: string;
    avatarUrl?: string;
    mobile?: string;
  }
) {
  if (!isSupabaseConfigured || !supabaseClient || !userId) {
    return null;
  }

  // Build upsert payload for public.artisans table using id = userId
  const artisanUpdates: Record<string, any> = {
    id: userId,
    updated_at: new Date().toISOString(),
  };

  if (updates.craft !== undefined) artisanUpdates.craft_type = updates.craft;
  if (updates.location !== undefined) artisanUpdates.location = updates.location;
  if (updates.bio !== undefined) artisanUpdates.bio = updates.bio;

  // Perform Upsert on public.artisans
  const { data: artisanData, error: artisanError } = await supabaseClient
    .from('artisans')
    .upsert(artisanUpdates, { onConflict: 'id' })
    .select()
    .single();

  if (artisanError) {
    console.error('Failed to upsert artisan details into public.artisans:', artisanError.message);
    throw artisanError;
  }

  return artisanData;
}

/**
 * Helper to upsert ArtisanUser data into public.artisans.
 */
export async function upsertArtisanProfileData(artisanUser: ArtisanUser) {
  if (!isSupabaseConfigured || !supabaseClient || !artisanUser.id) {
    return null;
  }

  return updateArtisanFullProfile(artisanUser.id, {
    name: artisanUser.name,
    craft: artisanUser.craft || artisanUser.shop,
    location: artisanUser.location || '',
    bio: artisanUser.bio || '',
    avatarUrl: artisanUser.avatarUrl || '',
    mobile: artisanUser.mobile || '',
  });
}

/**
 * Uploads artisan avatar image to Supabase Storage.
 */
export async function uploadAvatar(userId: string, fileOrBlob: File | Blob, fileExt: string = 'png'): Promise<string | null> {
  if (!isSupabaseConfigured || !supabaseClient) return null;

  const extension = fileOrBlob instanceof File ? fileOrBlob.name.split('.').pop() || fileExt : fileExt;
  const filePath = `${userId}/avatar-${Date.now()}.${extension}`;

  const { error: uploadError } = await supabaseClient.storage
    .from('avatars')
    .upload(filePath, fileOrBlob, {
      contentType: `image/${extension}`,
      upsert: true,
    });

  if (uploadError) {
    console.error('Error uploading avatar to Supabase Storage:', uploadError.message);
    throw uploadError;
  }

  const { data } = supabaseClient.storage.from('avatars').getPublicUrl(filePath);
  return data.publicUrl;
}
