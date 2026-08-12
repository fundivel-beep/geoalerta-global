import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Hardcoded for reliability — these are public keys safe to expose in client code
const SUPABASE_URL = 'https://xqdiphjkfnrssdpzyxqa.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhxZHBoaWprZm5yc3NkcHp5eHFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY0OTc4MDgsImV4cCI6MjEwMjA3MzgwOH0.WLwst4HzF2fuSge1VopBcUP70mvyKO3piGei3vYKHS4';

let instance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (instance) return instance;

  instance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  });
  return instance;
}
