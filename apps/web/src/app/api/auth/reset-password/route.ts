import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'El correo electrónico es requerido' },
        { status: 400 }
      );
    }

    const supabase = getSupabase();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'https://geoalerta.fundivel.org'}/reset-password`,
    });

    if (error) {
      return NextResponse.json(
        { error: 'Error al enviar el correo de recuperación' },
        { status: 500 }
      );
    }

    // Always return success to prevent email enumeration
    return NextResponse.json({
      message: 'Si el correo existe, recibirás un enlace de recuperación.',
    });
  } catch {
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
