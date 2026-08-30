import { supabaseClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { ArtisanUser } from '@/types';

export async function getProfile(userId: string) {
  if (!isSupabaseConfigured || !supabaseClient) return null;

  const { data, error } = await supabaseClient
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching profile:', error.message);
    throw error;
  }

  return data;
}

export async function getArtisanProfile(profileId: string) {
  if (!isSupabaseConfigured || !supabaseClient) return null;

  const { data, error } = await supabaseClient
    .from('artisans')
    .select('*')
    .eq('profile_id', profileId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching artisan profile:', error.message);
    throw error;
  }

  return data;
}

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

  // 1. Upsert Profiles table
  const profileUpdates: Record<string, any> = {
    id: userId,
    updated_at: new Date().toISOString(),
  };
  if (updates.name !== undefined) profileUpdates.full_name = updates.name;
  if (updates.avatarUrl !== undefined) profileUpdates.avatar_url = updates.avatarUrl;
  if (updates.craft !== undefined) profileUpdates.craft = updates.craft;
  if (updates.location !== undefined) profileUpdates.location = updates.location;
  if (updates.bio !== undefined) profileUpdates.bio = updates.bio;
  if (updates.mobile !== undefined) profileUpdates.phone = updates.mobile;

  const { error: profileError } = await supabaseClient
    .from('profiles')
    .upsert(profileUpdates, { onConflict: 'id' });

  if (profileError) {
    console.error('Failed to update profile:', profileError.message);
    throw profileError;
  }

  // 2. Upsert Artisans table
  const artisanUpdates: Record<string, any> = {
    profile_id: userId,
    updated_at: new Date().toISOString(),
  };
  if (updates.craft !== undefined) artisanUpdates.craft_type = updates.craft;
  if (updates.location !== undefined) artisanUpdates.location = updates.location;
  if (updates.bio !== undefined) artisanUpdates.bio = updates.bio;

  const { data: artisanData, error: artisanError } = await supabaseClient
    .from('artisans')
    .upsert(artisanUpdates, { onConflict: 'profile_id' })
    .select()
    .single();

  if (artisanError) {
    console.error('Failed to upsert artisan details:', artisanError.message);
    throw artisanError;
  }

  return artisanData;
}

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
