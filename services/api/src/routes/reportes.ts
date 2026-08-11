import { FastifyInstance } from 'fastify';
import { query } from '../db/pool.js';

export async function reportesRoutes(app: FastifyInstance) {
  app.addHook('onRequest', async (request, reply) => {
    try {
      await request.jwtVerify();
      const { rol } = request.user as { rol: string };
      if (rol !== 'admin' && rol !== 'operador') {
        return reply.status(403).send({ error: 'Acceso denegado' });
      }
    } catch {
      return reply.status(401).send({ error: 'No autorizado' });
    }
  });

  // POST /api/reportes/sar
  app.post('/sar', async (request, reply) => {
    const { evento_id, filtros, formato } = request.body as {
      evento_id: string;
      filtros?: { zona_riesgo?: string[]; estado_checkin?: string[] };
      formato: 'pdf' | 'csv';
    };

    const startTime = Date.now();

    let sql = `
      SELECT
        u.nombre || ' ' || u.apellidos as nombre_completo,
        u.email,
        a.zona_riesgo,
        a.distancia_km,
        COALESCE(c.estado, 'sin_respuesta') as estado_checkin,
        ST_Y(l.punto::geometry) as lat,
        ST_X(l.punto::geometry) as lng,
        u.ultimo_contacto,
        u.nivel_bateria,
        EXTRACT(EPOCH FROM (NOW() - u.ultimo_contacto)) / 60 as minutos_sin_contacto
      FROM alertas a
      JOIN usuarios u ON a.usuario_id = u.id
      LEFT JOIN LATERAL (
        SELECT punto FROM ubicaciones WHERE usuario_id = u.id ORDER BY created_at DESC LIMIT 1
      ) l ON true
      LEFT JOIN LATERAL (
        SELECT estado FROM check_ins WHERE usuario_id = u.id AND evento_id = $1 ORDER BY created_at DESC LIMIT 1
      ) c ON true
      WHERE a.evento_id = $1
    `;
    const params: unknown[] = [evento_id];
    let paramIdx = 2;

    if (filtros?.zona_riesgo?.length) {
      sql += ` AND a.zona_riesgo = ANY($${paramIdx++})`;
      params.push(filtros.zona_riesgo);
    }
    if (filtros?.estado_checkin?.length) {
      sql += ` AND COALESCE(c.estado, 'sin_respuesta') = ANY($${paramIdx++})`;
      params.push(filtros.estado_checkin);
    }

    sql += ' ORDER BY a.zona_riesgo, a.distancia_km ASC';

    const rows = await query(sql, params);
    const generadoEnMs = Date.now() - startTime;

    if (formato === 'csv') {
      const header = 'Nombre,Email,Zona,Distancia_km,Estado,Lat,Lng,Ultimo_Contacto,Bateria,Min_Sin_Contacto';
      const csvRows = rows.map((r: any) =>
        `"${r.nombre_completo}","${r.email}","${r.zona_riesgo}",${r.distancia_km?.toFixed(2) || ''},` +
        `"${r.estado_checkin}",${r.lat || ''},${r.lng || ''},"${r.ultimo_contacto || ''}",` +
        `${r.nivel_bateria || ''},${Math.round(r.minutos_sin_contacto || 0)}`
      );
      const csv = [header, ...csvRows].join('\n');

      return reply
        .header('Content-Type', 'text/csv')
        .header('Content-Disposition', `attachment; filename="reporte_sar_${evento_id.slice(0, 8)}.csv"`)
        .send(csv);
    }

    // For PDF, return JSON data (frontend or worker generates actual PDF)
    return {
      evento_id,
      formato,
      total_registros: rows.length,
      generado_en_ms: generadoEnMs,
      data: rows,
    };
  });
}
