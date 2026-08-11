import { FastifyInstance } from 'fastify';
import { registerUser, verifyEmail, loginUser, validateEmail, validatePassword } from '../services/auth.js';

export async function authRoutes(app: FastifyInstance) {
  // POST /api/auth/register
  app.post('/register', async (request, reply) => {
    const { email, nombre, apellidos, password, token_invitacion } = request.body as {
      email: string;
      nombre: string;
      apellidos: string;
      password: string;
      token_invitacion?: string;
    };

    try {
      const { user, verifyToken } = await registerUser({
        email,
        nombre,
        apellidos,
        password,
        token_invitacion,
      });

      // TODO: Send verification email via worker queue
      console.log(`📧 Verification token for ${email}: ${verifyToken}`);

      return reply.status(201).send({
        user_id: user!.id,
        email: user!.email,
        nombre: user!.nombre,
        apellidos: user!.apellidos,
        email_verificado: false,
      });
    } catch (err: any) {
      return reply.status(400).send({ error: err.message });
    }
  });

  // POST /api/auth/verify-email
  app.post('/verify-email', async (request, reply) => {
    const { token } = request.body as { token: string };

    const verified = await verifyEmail(token);
    if (!verified) {
      return reply.status(400).send({ error: 'Token inválido o expirado' });
    }

    return reply.send({ email_verificado: true });
  });

  // POST /api/auth/login
  app.post('/login', async (request, reply) => {
    const { email, password, totp_code } = request.body as {
      email: string;
      password: string;
      totp_code?: string;
    };

    try {
      const user = await loginUser(email, password);

      // Check 2FA if admin
      if (user.rol === 'admin' && user.totp_secret) {
        if (!totp_code) {
          return reply.status(401).send({ error: 'Se requiere código 2FA', requires_2fa: true });
        }
        // TODO: Verify TOTP code with otplib
      }

      // Generate JWT
      const access_token = app.jwt.sign(
        { sub: user.id, email: user.email, rol: user.rol, org: user.organizacion_id },
        { expiresIn: '30d' },
      );

      const refresh_token = app.jwt.sign(
        { sub: user.id, type: 'refresh' },
        { expiresIn: '60d' },
      );

      // Update last contact
      // No await needed, fire and forget
      import('../db/pool.js').then(({ query }) =>
        query('UPDATE usuarios SET ultimo_contacto = NOW() WHERE id = $1', [user.id]),
      );

      return reply.send({
        access_token,
        refresh_token,
        expires_in: 30 * 24 * 60 * 60, // 30 days in seconds
        user: {
          id: user.id,
          email: user.email,
          nombre: user.nombre,
          apellidos: user.apellidos,
          rol: user.rol,
          geoloc_activa: user.geoloc_activa,
        },
      });
    } catch (err: any) {
      return reply.status(401).send({ error: err.message });
    }
  });

  // POST /api/auth/refresh
  app.post('/refresh', async (request, reply) => {
    const { refresh_token } = request.body as { refresh_token: string };

    try {
      const decoded = app.jwt.verify(refresh_token) as { sub: string; type: string };
      if (decoded.type !== 'refresh') {
        return reply.status(401).send({ error: 'Token inválido' });
      }

      // Get user
      const { queryOne } = await import('../db/pool.js');
      const user = await queryOne<{ id: string; email: string; rol: string; organizacion_id: string }>(
        "SELECT id, email, rol, organizacion_id FROM usuarios WHERE id = $1 AND estado = 'activo'",
        [decoded.sub],
      );

      if (!user) {
        return reply.status(401).send({ error: 'Usuario no encontrado' });
      }

      const access_token = app.jwt.sign(
        { sub: user.id, email: user.email, rol: user.rol, org: user.organizacion_id },
        { expiresIn: '30d' },
      );

      return reply.send({ access_token, expires_in: 30 * 24 * 60 * 60 });
    } catch {
      return reply.status(401).send({ error: 'Token expirado o inválido' });
    }
  });
}
