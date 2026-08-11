import bcrypt from 'bcrypt';
import { randomUUID, randomBytes } from 'crypto';
import { query, queryOne } from '../db/pool.js';

const BCRYPT_ROUNDS = 12;
const EMAIL_VERIFY_EXPIRY_HOURS = 24;

export interface RegisterInput {
  email: string;
  nombre: string;
  apellidos: string;
  password: string;
  token_invitacion?: string;
}

export interface UserRow {
  id: string;
  organizacion_id: string;
  email: string;
  nombre: string;
  apellidos: string;
  password_hash: string;
  rol: string;
  email_verificado: boolean;
  geoloc_activa: boolean;
  totp_secret: string | null;
  estado: string;
}

/**
 * Validates password: min 8 chars, at least 1 uppercase, 1 number
 */
export function validatePassword(password: string): boolean {
  if (password.length < 8) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  return true;
}

/**
 * Validates email format (basic RFC 5322 check)
 */
export function validateEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Register a new user under FUNDIVEL org
 */
export async function registerUser(input: RegisterInput) {
  const { email, nombre, apellidos, password, token_invitacion } = input;

  // Validate
  if (!validateEmail(email)) {
    throw new Error('Email inválido');
  }
  if (!validatePassword(password)) {
    throw new Error('La contraseña debe tener mínimo 8 caracteres, una mayúscula y un número');
  }
  if (!nombre.trim() || !apellidos.trim()) {
    throw new Error('Nombre y apellidos son obligatorios');
  }

  // Check if email exists
  const existing = await queryOne<{ id: string }>('SELECT id FROM usuarios WHERE email = $1', [
    email.toLowerCase(),
  ]);
  if (existing) {
    throw new Error('El email ya está registrado');
  }

  // Determine org (default: FUNDIVEL)
  let organizacion_id: string;
  let rol = 'personal';

  if (token_invitacion) {
    const inv = await queryOne<{ organizacion_id: string; rol_asignado: string; estado: string }>(
      'SELECT organizacion_id, rol_asignado, estado FROM invitaciones WHERE token = $1 AND expires_at > NOW()',
      [token_invitacion],
    );
    if (!inv || inv.estado !== 'pendiente') {
      throw new Error('Invitación inválida o expirada');
    }
    organizacion_id = inv.organizacion_id;
    rol = inv.rol_asignado;

    // Mark invitation as used
    await query('UPDATE invitaciones SET estado = $1 WHERE token = $2', ['aceptada', token_invitacion]);
  } else {
    // Default org: FUNDIVEL
    const org = await queryOne<{ id: string }>("SELECT id FROM organizaciones WHERE slug = 'fundivel'");
    if (!org) throw new Error('Organización FUNDIVEL no encontrada');
    organizacion_id = org.id;
  }

  // Hash password
  const password_hash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  // Create user
  const user = await queryOne<UserRow>(
    `INSERT INTO usuarios (organizacion_id, email, nombre, apellidos, password_hash, rol)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, organizacion_id, email, nombre, apellidos, rol, email_verificado`,
    [organizacion_id, email.toLowerCase(), nombre.trim(), apellidos.trim(), password_hash, rol],
  );

  // Generate email verification token
  const verifyToken = randomBytes(32).toString('hex');
  await query(
    `INSERT INTO invitaciones (organizacion_id, email, token, rol_asignado, estado, expires_at)
     VALUES ($1, $2, $3, 'personal', 'pendiente', NOW() + INTERVAL '${EMAIL_VERIFY_EXPIRY_HOURS} hours')`,
    [organizacion_id, email.toLowerCase(), `verify_${verifyToken}`],
  );

  return { user, verifyToken };
}

/**
 * Verify email with token
 */
export async function verifyEmail(token: string): Promise<boolean> {
  const fullToken = `verify_${token}`;
  const inv = await queryOne<{ email: string }>(
    "SELECT email FROM invitaciones WHERE token = $1 AND estado = 'pendiente' AND expires_at > NOW()",
    [fullToken],
  );
  if (!inv) return false;

  await query('UPDATE usuarios SET email_verificado = TRUE WHERE email = $1', [inv.email]);
  await query("UPDATE invitaciones SET estado = 'aceptada' WHERE token = $1", [fullToken]);
  return true;
}

/**
 * Login user with email and password
 */
export async function loginUser(email: string, password: string) {
  const user = await queryOne<UserRow>(
    'SELECT * FROM usuarios WHERE email = $1 AND estado = $2',
    [email.toLowerCase(), 'activo'],
  );
  if (!user) {
    throw new Error('Credenciales inválidas');
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    throw new Error('Credenciales inválidas');
  }

  if (!user.email_verificado) {
    throw new Error('Email no verificado. Revisa tu bandeja de entrada.');
  }

  return user;
}

/**
 * Generate invitation link for a new member
 */
export async function createInvitation(
  organizacion_id: string,
  creado_por: string,
  rol: string = 'personal',
  email?: string,
) {
  const token = randomBytes(24).toString('hex');
  const expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await query(
    `INSERT INTO invitaciones (organizacion_id, email, token, rol_asignado, estado, creado_por, expires_at)
     VALUES ($1, $2, $3, $4, 'pendiente', $5, $6)`,
    [organizacion_id, email?.toLowerCase() || null, token, rol, creado_por, expires_at.toISOString()],
  );

  return { token, enlace_invitacion: `/registro?token=${token}`, expires_at };
}
