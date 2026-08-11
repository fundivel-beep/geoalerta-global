import { query, queryOne } from '../db/pool.js';
import { calcularRadioAfectacion, clasificarZonaRiesgo, haversine } from '@geoalerta/shared';

interface SeismicEvent {
  source: string;
  lat: number;
  lng: number;
  magnitude: number;
  depth_km: number;
  timestamp: string;
}

interface CorrelationWindow {
  events: SeismicEvent[];
  timer: NodeJS.Timeout;
  eventId?: string;
}

const CORRELATION_WINDOW_MS = 30_000;
const CORRELATION_RADIUS_KM = 100;

// Active correlation windows
const pendingCorrelations = new Map<string, CorrelationWindow>();

/**
 * Process an incoming seismic report from an external source.
 * Applies correlation logic: 2+ sources within 30s and 100km = confirmed.
 */
export async function processSeismicReport(event: SeismicEvent): Promise<{
  confirmed: boolean;
  eventId: string;
}> {
  // Find matching pending correlation
  let matchedKey: string | null = null;

  for (const [key, window] of pendingCorrelations.entries()) {
    const firstEvent = window.events[0]!;
    const distance = haversine(firstEvent.lat, firstEvent.lng, event.lat, event.lng);
    const timeDiff = Math.abs(new Date(event.timestamp).getTime() - new Date(firstEvent.timestamp).getTime());

    if (distance <= CORRELATION_RADIUS_KM && timeDiff <= CORRELATION_WINDOW_MS) {
      matchedKey = key;
      break;
    }
  }

  if (matchedKey) {
    // Add to existing correlation window
    const window = pendingCorrelations.get(matchedKey)!;
    window.events.push(event);

    // 2+ sources = confirmed
    if (window.events.length >= 2 && window.eventId) {
      clearTimeout(window.timer);
      pendingCorrelations.delete(matchedKey);

      // Update event to confirmed
      await query(
        `UPDATE eventos_sismicos SET estado = 'confirmado', confianza = $1,
         fuentes = $2::jsonb WHERE id = $3`,
        [
          window.events.length,
          JSON.stringify(window.events.map((e) => ({
            fuente: e.source,
            timestamp: e.timestamp,
            magnitud_reportada: e.magnitude,
          }))),
          window.eventId,
        ],
      );

      return { confirmed: true, eventId: window.eventId };
    }

    return { confirmed: false, eventId: window.eventId! };
  }

  // New event — create correlation window
  const radioBase = calcularRadioAfectacion(event.magnitude, event.depth_km);

  const inserted = await queryOne<{ id: string }>(
    `INSERT INTO eventos_sismicos (epicentro, magnitud, profundidad_km, radio_base_km, radio_final_km, estado, confianza, fuentes, timestamp_evento)
     VALUES (ST_SetSRID(ST_MakePoint($1, $2), 4326), $3, $4, $5, $6, 'no_confirmado', 1, $7::jsonb, $8)
     RETURNING id`,
    [
      event.lng, event.lat, event.magnitude, event.depth_km,
      radioBase, radioBase,
      JSON.stringify([{ fuente: event.source, timestamp: event.timestamp, magnitud_reportada: event.magnitude }]),
      event.timestamp,
    ],
  );

  const eventId = inserted!.id;
  const key = `${eventId}`;

  // Set correlation timeout (30s)
  const timer = setTimeout(async () => {
    pendingCorrelations.delete(key);
    // Single source after 30s = not confirmed, notify dashboard for manual review
    console.log(`⚠️ Event ${eventId} not confirmed after 30s (single source: ${event.source})`);
  }, CORRELATION_WINDOW_MS);

  pendingCorrelations.set(key, { events: [event], timer, eventId });

  return { confirmed: false, eventId };
}

/**
 * Once an event is confirmed, calculate affected personnel and generate alerts.
 */
export async function generateAlertsForEvent(eventId: string) {
  const evento = await queryOne<{
    id: string;
    magnitud: number;
    profundidad_km: number;
    radio_final_km: number;
    timestamp_evento: string;
  }>(
    `SELECT id, magnitud, profundidad_km, radio_final_km,
            ST_Y(epicentro::geometry) as lat, ST_X(epicentro::geometry) as lng,
            timestamp_evento
     FROM eventos_sismicos WHERE id = $1`,
    [eventId],
  );

  if (!evento) return [];

  const radioFinal = evento.radio_final_km;
  const radioAlerta = radioFinal * 1.5; // Include amarilla zone (150%)

  // Find all personnel within 150% of impact radius (last 24h location)
  const affectedPersonnel = await query<{
    usuario_id: string;
    lat: number;
    lng: number;
    distancia_km: number;
  }>(
    `SELECT DISTINCT ON (u.id)
       u.id as usuario_id,
       ST_Y(l.punto::geometry) as lat,
       ST_X(l.punto::geometry) as lng,
       ST_Distance(l.punto::geography, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography) / 1000 as distancia_km
     FROM usuarios u
     JOIN ubicaciones l ON l.usuario_id = u.id
     WHERE u.estado = 'activo'
       AND l.timestamp_dispositivo > NOW() - INTERVAL '24 hours'
       AND ST_DWithin(l.punto::geography, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography, $3)
     ORDER BY u.id, l.created_at DESC`,
    [(evento as any).lng, (evento as any).lat, radioAlerta * 1000], // Convert km to meters
  );

  // Classify and create alerts
  const alerts = [];
  for (const person of affectedPersonnel) {
    const zona = clasificarZonaRiesgo(person.distancia_km, radioFinal);
    if (!zona) continue;

    await query(
      `INSERT INTO alertas (evento_id, usuario_id, zona_riesgo, distancia_km, estado_entrega)
       VALUES ($1, $2, $3, $4, 'pendiente')
       ON CONFLICT (evento_id, usuario_id) DO NOTHING`,
      [eventId, person.usuario_id, zona, person.distancia_km],
    );

    alerts.push({
      usuario_id: person.usuario_id,
      zona,
      distancia_km: person.distancia_km,
    });
  }

  return alerts;
}
