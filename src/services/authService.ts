import { supabaseClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { User, Session } from '@supabase/supabase-js';

/**
 * Normalizes phone numbers to standard E.164 format (+919876543210 for India).
 */
export function normalizePhoneNumber(phone: string): string {
  if (!phone) return '';
  const cleaned = phone.replace(/[^\d+]/g, '');

  if (cleaned.startsWith('+')) {
    return cleaned;
  }
  if (cleaned.startsWith('91') && cleaned.length === 12) {
    return `+${cleaned}`;
  }
  if (cleaned.startsWith('0') && cleaned.length === 11) {
    return `+91${cleaned.slice(1)}`;
  }
  if (cleaned.length === 10) {
    return `+91${cleaned}`;
  }
  return cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
}

/**
 * Validates 10-digit Indian mobile numbers or valid E.164 phone numbers.
 */
export function isValidIndianPhone(phone: string): boolean {
  const normalized = normalizePhoneNumber(phone);
  const e164Regex = /^\+91[6-9]\d{9}$/;
  return e164Regex.test(normalized);
}

/**
 * Requests a phone SMS OTP from Supabase.
 */
export async function sendPhoneOtp(phone: string) {
  if (!isSupabaseConfigured || !supabaseClient) {
    throw new Error('Supabase client is not configured. Please check environment variables.');
  }

  const normalizedPhone = normalizePhoneNumber(phone);
  if (!isValidIndianPhone(normalizedPhone)) {
    throw new Error('Kripya 10-digit ka sahi Indian mobile number bharein (+91 9XXXX XXXXX).');
  }

  const { data, error } = await supabaseClient.auth.signInWithOtp({
    phone: normalizedPhone,
  });

  if (error) {
    console.error('Supabase Phone OTP send error:', error.message);
    if (error.message.includes('rate limit') || error.status === 429) {
      throw new Error('Kripya naya OTP mangwane se pehle thoda intezar karein.');
    }
    throw new Error(error.message || 'OTP bhejane mein samasya aayi. Kripya punah prayas karein.');
  }

  return data;
}

/**
 * Verifies the 6-digit SMS OTP using Supabase Auth.
 */
export async function verifyPhoneOtp(phone: string, token: string) {
  if (!isSupabaseConfigured || !supabaseClient) {
    throw new Error('Supabase client is not configured. Please check environment variables.');
  }

  const normalizedPhone = normalizePhoneNumber(phone);
  const cleanToken = token.trim();

  if (!cleanToken || cleanToken.length < 6) {
    throw new Error('Kripya 6-digit ka sahi OTP code bharein.');
  }

  const { data, error } = await supabaseClient.auth.verifyOtp({
    phone: normalizedPhone,
    token: cleanToken,
    type: 'sms',
  });

  if (error) {
    console.error('Supabase Phone OTP verify error:', error.message);
    if (error.message.toLowerCase().includes('expired')) {
      throw new Error('Yeh OTP expire ho gaya hai. Kripya naya OTP mangwayein.');
    }
    throw new Error('Yeh OTP code galat hai. Kripya punah dekhkar bharein.');
  }

  return data;
}

export async function signOut() {
  if (!isSupabaseConfigured || !supabaseClient) return;
  const { error } = await supabaseClient.auth.signOut();
  if (error) {
    console.error('Supabase Auth SignOut error:', error.message);
    throw error;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  if (!isSupabaseConfigured || !supabaseClient) return null;
  const { data: { user }, error } = await supabaseClient.auth.getUser();
  if (error) {
    console.error('Failed to fetch current Supabase user:', error.message);
    return null;
  }
  return user;
}

export async function getCurrentSession(): Promise<Session | null> {
  if (!isSupabaseConfigured || !supabaseClient) return null;
  const { data: { session }, error } = await supabaseClient.auth.getSession();
  if (error) {
    console.error('Failed to fetch current Supabase session:', error.message);
    return null;
  }
  return session;
}

export function subscribeToAuthChanges(callback: (user: User | null, session: Session | null) => void) {
  if (!isSupabaseConfigured || !supabaseClient) {
    return { unsubscribe: () => {} };
  }

  const { data: { subscription } } = supabaseClient.auth.onAuthStateChange((_event, session) => {
    callback(session?.user || null, session);
  });

  return subscription;
}
