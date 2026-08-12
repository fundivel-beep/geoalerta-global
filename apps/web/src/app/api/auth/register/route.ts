import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, nombre, apellidos, password } = body;

    if (!email || !nombre || !apellidos || !password) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 8 caracteres' },
        { status: 400 }
      );
    }

    const supabase = getSupabase();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nombre: `${nombre} ${apellidos}`,
          nombre_corto: nombre,
          apellidos,
        },
      },
    });

    if (error) {
      if (error.message.includes('already registered')) {
        return NextResponse.json(
          { error: 'Este correo ya está registrado' },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: 'Registro exitoso. Verifica tu correo electrónico.',
      user: { email: data.user?.email, nombre: `${nombre} ${apellidos}` },
    });
  } catch {
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
