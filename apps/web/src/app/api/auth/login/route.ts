import { NextRequest, NextResponse } from 'next/server';

// Demo users for development — replace with real DB auth in production
const DEMO_USERS = [
  { email: 'admin@fundivel.org', password: 'Fundivel2026!', nombre: 'Admin FUNDIVEL', rol: 'admin' },
  { email: 'carlos@fundivel.org', password: 'Carlos2026!', nombre: 'Carlos Mendoza Rivera', rol: 'coordinador' },
  { email: 'maria@fundivel.org', password: 'Maria2026!', nombre: 'María Gutiérrez López', rol: 'tecnico' },
  { email: 'demo@fundivel.org', password: 'Demo2026!', nombre: 'Usuario Demo', rol: 'brigadista' },
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña son requeridos' },
        { status: 400 }
      );
    }

    const user = DEMO_USERS.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (!user) {
      return NextResponse.json(
        { error: 'Credenciales incorrectas' },
        { status: 401 }
      );
    }

    // Generate simple token for demo (in production use JWT with proper signing)
    const token = Buffer.from(`${user.email}:${Date.now()}`).toString('base64');

    return NextResponse.json({
      access_token: token,
      refresh_token: `refresh_${token}`,
      user: {
        email: user.email,
        nombre: user.nombre,
        rol: user.rol,
      },
    });
  } catch {
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
