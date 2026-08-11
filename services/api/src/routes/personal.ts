import { FastifyInstance } from 'fastify';
import { query, queryOne } from '../db/pool.js';

export async function personalRoutes(app: FastifyInstance) {
  // Middleware: require auth
  app.addHook('onRequest', async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch {
      return reply.status(401).send({ error: 'No autorizado' });
    }
  });

  // GET /api/personal — List personnel
  app.get('/', async (request) => {
    const { sub, org } = request.user as { sub: string; org: string };
    const { estado, zona_riesgo, buscar, page = '1', limit = '50' } = request.query as Record<string, string>;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    let whereClause = 'WHERE u.organizacion_id = $1';
    const params: unknown[] = [org];
    let paramIdx = 2;

    if (estado) {
      whereClause += ` AND u.estado = $${paramIdx++}`;
      params.push(estado);
    }
    if (buscar) {
      whereClause += ` AND (u.nombre ILIKE $${paramIdx} OR u.apellidos ILIKE $${paramIdx} OR u.email ILIKE $${paramIdx})`;
      params.push(`%${buscar}%`);
      paramIdx++;
    }

    const countResult = await queryOne<{ count: string }>(
      `SELECT COUNT(*) as count FROM usuarios u ${whereClause}`,
      params,
    );

    const users = await query(
      `SELECT u.id, u.email, u.nombre, u.apellidos, u.rol, u.estado,
              u.geoloc_activa, u.ultimo_contacto, u.nivel_bateria
       FROM usuarios u ${whereClause}
       ORDER BY u.nombre ASC
       LIMIT $${paramIdx++} OFFSET $${paramIdx}`,
      [...params, parseInt(limit), offset],
    );

    return {
      data: users,
      total: parseInt(countResult?.count || '0'),
      page: parseInt(page),
      limit: parseInt(limit),
    };
  });

  // GET /api/personal/:id — Single user detail
  app.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const { org } = request.user as { sub: string; org: string };

    const user = await queryOne(
      `SELECT u.id, u.email, u.nombre, u.apellidos, u.rol, u.estado,
              u.geoloc_activa, u.ultimo_contacto, u.nivel_bateria,
              ST_Y(l.punto::geometry) as lat, ST_X(l.punto::geometry) as lng,
              l.precision_m, l.timestamp_dispositivo as ultima_ubicacion_ts
       FROM usuarios u
       LEFT JOIN LATERAL (
         SELECT punto, precision_m, timestamp_dispositivo
         FROM ubicaciones WHERE usuario_id = u.id
         ORDER BY created_at DESC LIMIT 1
       ) l ON true
       WHERE u.id = $1 AND u.organizacion_id = $2`,
      [id, org],
    );

    if (!user) {
      return reply.status(404).send({ error: 'Usuario no encontrado' });
    }

    return user;
  });

  // GET /api/personal/:id/ubicaciones — Location history
  app.get('/:id/ubicaciones', async (request) => {
    const { id } = request.params as { id: string };
    const { desde, hasta } = request.query as { desde?: string; hasta?: string };

    let sql = `SELECT ST_Y(punto::geometry) as lat, ST_X(punto::geometry) as lng,
               precision_m, timestamp_dispositivo, fuente
               FROM ubicaciones WHERE usuario_id = $1`;
    const params: unknown[] = [id];
    let paramIdx = 2;

    if (desde) {
      sql += ` AND timestamp_dispositivo >= $${paramIdx++}`;
      params.push(desde);
    }
    if (hasta) {
      sql += ` AND timestamp_dispositivo <= $${paramIdx++}`;
      params.push(hasta);
    }

    sql += ' ORDER BY timestamp_dispositivo DESC LIMIT 500';

    const locations = await query(sql, params);
    return { data: locations };
  });

  // GET /api/personal/:id/check-ins — Check-in history
  app.get('/:id/check-ins', async (request) => {
    const { id } = request.params as { id: string };
    const { evento_id } = request.query as { evento_id?: string };

    let sql = `SELECT id, evento_id, estado, ST_Y(punto::geometry) as lat, ST_X(punto::geometry) as lng,
               es_ubicacion_realtime, nivel_bateria, origen, timestamp_dispositivo
               FROM check_ins WHERE usuario_id = $1`;
    const params: unknown[] = [id];

    if (evento_id) {
      sql += ' AND evento_id = $2';
      params.push(evento_id);
    }

    sql += ' ORDER BY timestamp_dispositivo DESC LIMIT 100';

    const checkins = await query(sql, params);
    return { data: checkins };
  });
}
