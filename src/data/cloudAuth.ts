import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

export type CloudAuthResult = { ok: boolean; message?: string; email?: string; userId?: string };

function fallback(message: string): CloudAuthResult {
  return { ok: false, message };
}

export async function cloudSignIn(email: string, password: string): Promise<CloudAuthResult> {
  if (!isSupabaseConfigured || !supabase) return fallback('Cloud authentication is not configured yet.');
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.session || !data.user) return fallback(error?.message ?? 'No active session was created.');
  return { ok: true, email: data.user.email ?? email, userId: data.user.id };
}

export async function cloudSignUp(email: string, password: string): Promise<CloudAuthResult> {
  if (!isSupabaseConfigured || !supabase) return fallback('Cloud authentication is not configured yet.');
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return fallback(error.message);
  if (!data.user || !data.session) return fallback('Check your email to verify the account, then sign in to continue.');
  return { ok: true, email: data.user.email ?? email, userId: data.user.id };
}

export async function cloudSignOut(): Promise<CloudAuthResult> {
  if (!isSupabaseConfigured || !supabase) return { ok: true };
  const { error } = await supabase.auth.signOut();
  return error ? fallback(error.message) : { ok: true };
}

export async function getCloudSession() {
  if (!isSupabaseConfigured || !supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export function subscribeToCloudAuth(callback: (authenticated: boolean, email?: string) => void) {
  if (!isSupabaseConfigured || !supabase) return () => undefined;
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(Boolean(session), session?.user.email ?? undefined);
  });
  return () => data.subscription.unsubscribe();
}
