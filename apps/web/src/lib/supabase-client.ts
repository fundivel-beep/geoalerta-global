import { createClient, SupabaseClient } from '@supabase/supabase-js';

let instance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (instance) return instance;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    // In development/build, env vars might not be available
    // Log for debugging in browser console
    if (typeof window !== 'undefined') {
      console.error('[GeoAlerta] Supabase env vars missing:', { url: !!url, key: !!key });
    }
    throw new Error('Sistema no configurado. Contacte al administrador.');
  }

  instance = createClient(url, key, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  });
  return instance;
}

// Expose for debugging in browser console
if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).__SUPABASE_DEBUG__ = {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET',
    key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET',
  };
}
