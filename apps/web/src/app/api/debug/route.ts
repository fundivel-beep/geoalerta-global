import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  // Test if we can reach Supabase from the server
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  let fetchResult = 'not tested';
  
  if (supabaseUrl && supabaseKey) {
    try {
      const res = await fetch(`${supabaseUrl}/auth/v1/settings`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      });
      fetchResult = `status: ${res.status}, ok: ${res.ok}`;
    } catch (err: unknown) {
      fetchResult = `error: ${err instanceof Error ? err.message : 'unknown'}`;
    }
  }

  return NextResponse.json({
    env_url: supabaseUrl ? supabaseUrl.substring(0, 40) : 'NOT SET',
    env_key: supabaseKey ? `${supabaseKey.substring(0, 20)}...` : 'NOT SET',
    fetch_to_supabase: fetchResult,
    node_version: process.version,
    timestamp: new Date().toISOString(),
  });
}
