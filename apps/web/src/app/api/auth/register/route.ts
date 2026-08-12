import { NextRequest, NextResponse } from 'next/server';

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

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Configuración del servidor incompleta' },
        { status: 500 }
      );
    }

    const res = await fetch(`${supabaseUrl}/auth/v1/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({
        email,
        password,
        data: {
          nombre: `${nombre} ${apellidos}`,
          nombre_corto: nombre,
          apellidos,
        },
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      const errorMsg = data.error_description || data.msg || data.error || 'Error en el registro';
      if (errorMsg.includes('already registered') || errorMsg.includes('already been registered')) {
        return NextResponse.json({ error: 'Este correo ya está registrado' }, { status: 409 });
      }
      return NextResponse.json({ error: errorMsg }, { status: res.status });
    }

    return NextResponse.json({
      message: 'Registro exitoso. Verifica tu correo electrónico.',
      user: { email: data.email, nombre: `${nombre} ${apellidos}` },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error desconocido';
    return NextResponse.json(
      { error: `Error del servidor: ${message}` },
      { status: 500 }
    );
  }
}
