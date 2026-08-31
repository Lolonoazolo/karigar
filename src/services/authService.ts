import { supabaseClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { User, Session } from '@supabase/supabase-js';

/**
 * Normalizes phone numbers to standard E.164 format (+919876543210 for India).
 * Kept for artisan profile storage.
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
  if (!phone) return true; // Optional profile field
  const normalized = normalizePhoneNumber(phone);
  const e164Regex = /^\+91[6-9]\d{9}$/;
  return e164Regex.test(normalized);
}

/**
 * Registers a new user via Supabase Auth Email + Password.
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  metadata?: { full_name?: string }
) {
  if (!isSupabaseConfigured || !supabaseClient) {
    throw new Error('KarigarAI Supabase environment variables are missing.');
  }

  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    throw new Error('कृपया सही ईमेल दर्ज करें।');
  }

  if (!password || password.length < 6) {
    throw new Error('पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।');
  }

  const { data, error } = await supabaseClient.auth.signUp({
    email: cleanEmail,
    password: password,
    options: {
      data: metadata || {},
    },
  });

  if (error) {
    console.error('Supabase Auth SignUp error:', error.message);
    const msg = error.message.toLowerCase();
    if (msg.includes('already registered') || msg.includes('user_already_exists')) {
      throw new Error('इस ईमेल से खाता पहले से मौजूद है। कृपया लॉग इन करें।');
    } else if (msg.includes('weak') || msg.includes('at least 6 characters')) {
      throw new Error('पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।');
    }
    throw new Error(error.message || 'खाता बनाने में समस्या हुई। कृपया फिर कोशिश करें।');
  }

  return data;
}

/**
 * Authenticates an existing user via Supabase Auth Email + Password.
 */
export async function signInWithEmail(email: string, password: string) {
  if (!isSupabaseConfigured || !supabaseClient) {
    throw new Error('KarigarAI Supabase environment variables are missing.');
  }

  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    throw new Error('कृपया सही ईमेल दर्ज करें।');
  }

  if (!password) {
    throw new Error('कृपया अपना पासवर्ड दर्ज करें।');
  }

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email: cleanEmail,
    password: password,
  });

  if (error) {
    console.error('Supabase Auth SignIn error:', error.message);
    const msg = error.message.toLowerCase();
    if (msg.includes('invalid login credentials') || msg.includes('invalid_credentials')) {
      throw new Error('ईमेल या पासवर्ड सही नहीं है।');
    } else if (msg.includes('email not confirmed')) {
      throw new Error('कृपया अपने ईमेल पर verification link खोलें और अकाउंट verify करें।');
    }
    throw new Error(error.message || 'लॉग इन करने में समस्या आई। कृपया फिर कोशिश करें।');
  }

  return data;
}

/**
 * Triggers Supabase password reset email.
 */
export async function resetPasswordForEmail(email: string) {
  if (!isSupabaseConfigured || !supabaseClient) {
    throw new Error('KarigarAI Supabase environment variables are missing.');
  }

  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    throw new Error('कृपया सही ईमेल दर्ज करें।');
  }

  const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}/reset-password` : undefined;

  const { data, error } = await supabaseClient.auth.resetPasswordForEmail(cleanEmail, {
    redirectTo: redirectUrl,
  });

  if (error) {
    console.error('Supabase Reset Password error:', error.message);
    throw new Error(error.message || 'पासवर्ड रीसेट ईमेल भेजने में समस्या आई।');
  }

  return data;
}

/**
 * Signs out current Supabase user session.
 */
export async function signOut() {
  if (!isSupabaseConfigured || !supabaseClient) return;
  const { error } = await supabaseClient.auth.signOut();
  if (error) {
    console.error('Supabase Auth SignOut error:', error.message);
    throw error;
  }
}

/**
 * Returns current authenticated Supabase user.
 */
export async function getCurrentUser(): Promise<User | null> {
  if (!isSupabaseConfigured || !supabaseClient) return null;
  const { data: { user }, error } = await supabaseClient.auth.getUser();
  if (error) {
    if (!error.message.includes('Auth session missing') && !error.message.includes('session_not_found')) {
      console.warn('Current Supabase user status:', error.message);
    }
    return null;
  }
  return user;
}

/**
 * Returns current active Supabase session.
 */
export async function getCurrentSession(): Promise<Session | null> {
  if (!isSupabaseConfigured || !supabaseClient) return null;
  const { data: { session }, error } = await supabaseClient.auth.getSession();
  if (error) {
    if (!error.message.includes('Auth session missing') && !error.message.includes('session_not_found')) {
      console.warn('Current Supabase session status:', error.message);
    }
    return null;
  }
  return session;
}

/**
 * Subscribes to real-time Supabase auth state updates (login, logout, token refresh).
 */
export function subscribeToAuthChanges(callback: (user: User | null, session: Session | null) => void) {
  if (!isSupabaseConfigured || !supabaseClient) {
    return { unsubscribe: () => {} };
  }

  const { data: { subscription } } = supabaseClient.auth.onAuthStateChange((_event, session) => {
    callback(session?.user || null, session);
  });

  return subscription;
}
