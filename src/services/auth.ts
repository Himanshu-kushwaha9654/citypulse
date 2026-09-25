import { Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { AppRole } from '../types/citypulse';

export type { AppRole };

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  role: AppRole;
  city_id: string | null;
}

export interface AuthResult {
  session: Session | null;
  error: string | null;
}

export async function signUpWithEmail(email: string, password: string): Promise<AuthResult> {
  if (!isSupabaseConfigured()) {
    return { session: null, error: 'Backend is not configured. Add VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY to .env.' };
  }
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return { session: null, error: error.message };
  return { session: data.session, error: null };
}

export async function signInWithEmail(email: string, password: string): Promise<AuthResult> {
  if (!isSupabaseConfigured()) {
    return { session: null, error: 'Backend is not configured. Add VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY to .env.' };
  }
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { session: null, error: error.message };
  return { session: data.session, error: null };
}

export async function signOut(): Promise<void> {
  if (!isSupabaseConfigured()) return;
  await supabase.auth.signOut();
}

export async function getCurrentSession(): Promise<Session | null> {
  if (!isSupabaseConfigured()) return null;
  const { data } = await supabase.auth.getSession();
  return data.session;
}

/**
 * Fetches (and, on first login, waits briefly for) the profile row the
 * on_auth_user_created trigger creates automatically. Every new user
 * defaults to the 'viewer' role.
 */
export async function fetchProfile(userId: string): Promise<Profile | null> {
  if (!isSupabaseConfigured()) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, city_id')
    .eq('id', userId)
    .maybeSingle();

  if (!error && data) return data as Profile;

  // The signup trigger runs server-side and is usually instant, but
  // give it one retry in case of a race on a brand-new account.
  await new Promise((resolve) => setTimeout(resolve, 500));
  const retry = await supabase
    .from('profiles')
    .select('id, email, full_name, role, city_id')
    .eq('id', userId)
    .maybeSingle();

  return (retry.data as Profile) ?? null;
}

export function onAuthStateChange(callback: (session: Session | null) => void) {
  if (!isSupabaseConfigured()) return { unsubscribe: () => {} };
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
  return data.subscription;
}

export const ROLE_LABELS: Record<AppRole, string> = {
  admin: 'Administrator',
  operator: 'Ops Dispatcher',
  viewer: 'Resident',
};
