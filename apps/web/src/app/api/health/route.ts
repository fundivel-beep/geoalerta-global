import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return NextResponse.json({
    supabase_url_set: !!supabaseUrl,
    supabase_key_set: !!supabaseKey,
    supabase_url_prefix: supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : 'NOT SET',
    timestamp: new Date().toISOString(),
  });
}
