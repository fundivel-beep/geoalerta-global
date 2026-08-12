import { NextRequest, NextResponse } from 'next/server';

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

    // In production, save to database and send verification email
    // For now, return success to demo the flow
    return NextResponse.json({
      message: 'Registro exitoso. Verifica tu correo electrónico.',
      user: { email, nombre: `${nombre} ${apellidos}` },
    });
  } catch {
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
