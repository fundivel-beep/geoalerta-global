import { FastifyInstance } from 'fastify';
import { query, queryOne } from '../db/pool.js';

export async function dashboardRoutes(app: FastifyInstance) {
  // Middleware: require auth with admin/operador role
  app.addHook('onRequest', async (request, reply) => {
    try {
      await request.jwtVerify();
      const { rol } = request.user as { rol: string };
      if (rol !== 'admin' && rol !== 'operador') {
        return reply.status(403).send({ error: 'Acceso denegado. Se requiere rol admin u operador.' });
      }
    } catch {
      return reply.status(401).send({ error: 'No autorizado' });
    }
  });

  // GET /api/dashboard/resumen
  app.get('/resumen', async (request) => {
    const { org } = request.user as { org: string };

    const stats = await queryOne<{
      total_personal: string;
      con_geolocalizacion: string;
      sin_contacto_15min: string;
    }>(
      `SELECT
        COUNT(*) as total_personal,
        COUNT(*) FILTER (WHERE geoloc_activa = true) as con_geolocalizacion,
        COUNT(*) FILTER (WHERE ultimo_contacto < NOW() - INTERVAL '15 minutes' OR ultimo_contacto IS NULL) as sin_contacto_15min
       FROM usuarios
       WHERE organizacion_id = $1 AND estado = 'activo'`,
      [org],
    );

    const sosActivos = await queryOne<{ count: string }>(
      `SELECT COUNT(*) as count FROM senales_sos s
       JOIN usuarios u ON s.usuario_id = u.id
       WHERE u.organizacion_id = $1 AND s.estado = 'activo'`,
      [org],
    );

    const fuentes = await query<{ estado: string; count: string }>(
      'SELECT estado, COUNT(*) as count FROM fuentes_sismicas GROUP BY estado',
    );

    const fuentesActivas = fuentes.find((f) => f.estado === 'activa');
    const fuentesDegradadas = fuentes.find((f) => f.estado === 'degradada');

    return {
      total_personal: parseInt(stats?.total_personal || '0'),
      con_geolocalizacion: parseInt(stats?.con_geolocalizacion || '0'),
      en_zona_riesgo: 0, // TODO: Calculate from active events
      sin_contacto_15min: parseInt(stats?.sin_contacto_15min || '0'),
      sos_activos: parseInt(sosActivos?.count || '0'),
      balizas_activas: 0, // TODO: Track from beacon mode activations
      fuentes_activas: parseInt(fuentesActivas?.count || '0'),
      fuentes_degradadas: parseInt(fuentesDegradadas?.count || '0'),
    };
  });

  // GET /api/dashboard/mapa — Get markers within bounds
  app.get('/mapa', async (request) => {
    const { org } = request.user as { org: string };
    const { bounds } = request.query as { bounds?: string };

    let sql = `
      SELECT u.id, u.nombre, u.apellidos, u.estado as user_estado, u.ultimo_contacto, u.nivel_bateria,
             ST_Y(l.punto::geometry) as lat, ST_X(l.punto::geometry) as lng,
             CASE
               WHEN s.estado = 'activo' THEN 'peligro'
               WHEN u.ultimo_contacto < NOW() - INTERVAL '15 minutes' THEN 'sin_respuesta'
               WHEN u.ultimo_contacto IS NULL THEN 'sin_senal'
               ELSE 'seguro'
             END as estado_marcador
      FROM usuarios u
      LEFT JOIN LATERAL (
        SELECT punto FROM ubicaciones WHERE usuario_id = u.id ORDER BY created_at DESC LIMIT 1
      ) l ON true
      LEFT JOIN LATERAL (
        SELECT estado FROM senales_sos WHERE usuario_id = u.id AND estado = 'activo' LIMIT 1
      ) s ON true
      WHERE u.organizacion_id = $1 AND u.estado = 'activo' AND l.punto IS NOT NULL
    `;
    const params: unknown[] = [org];

    if (bounds) {
      // bounds format: sw_lat,sw_lng,ne_lat,ne_lng
      const [swLat, swLng, neLat, neLng] = bounds.split(',').map(Number);
      if (swLat && swLng && neLat && neLng) {
        sql += ` AND ST_Within(l.punto, ST_MakeEnvelope($2, $3, $4, $5, 4326))`;
        params.push(swLng, swLat, neLng, neLat);
      }
    }

    sql += ' LIMIT 100000';

    const marcadores = await query(sql, params);
    return { marcadores };
  });

  // GET /api/dashboard/fuentes — Seismic source status
  app.get('/fuentes', async () => {
    const fuentes = await query(
      'SELECT id, nombre, protocolo, estado, ultimo_dato, latencia_avg_ms FROM fuentes_sismicas ORDER BY nombre',
    );
    return { data: fuentes };
  });
}
