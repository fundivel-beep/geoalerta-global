import { processSeismicReport } from '../services/ews-engine.js';

const EMSC_API_URL = 'https://www.seismicportal.eu/fdsnws/event/1/query';
const POLL_INTERVAL_MS = 15_000; // 15 seconds

let lastCheckedTime = new Date(Date.now() - 60_000).toISOString(); // Start 1min ago
let pollTimer: NodeJS.Timeout | null = null;

/**
 * EMSC (European-Mediterranean Seismological Centre) Adapter
 * Polls FDSN Web Service for new events.
 */
export function startEMSCAdapter(onEvent?: (eventId: string, confirmed: boolean) => void) {
  console.log('🇪🇺 Starting EMSC adapter (polling every 15s)');

  async function poll() {
    try {
      const params = new URLSearchParams({
        format: 'json',
        starttime: lastCheckedTime,
        minmag: '3.0',
        orderby: 'time',
        limit: '10',
      });

      const res = await fetch(`${EMSC_API_URL}?${params}`);
      if (!res.ok) {
        console.warn(`EMSC API returned ${res.status}`);
        return;
      }

      const data = await res.json();
      const events = data.features || [];

      for (const feature of events) {
        const props = feature.properties;
        const [lng, lat, depth] = feature.geometry.coordinates;

        console.log(`🇪🇺 EMSC event: M${props.mag} at ${lat},${lng}`);

        const result = await processSeismicReport({
          source: 'emsc',
          lat,
          lng,
          magnitude: props.mag,
          depth_km: depth,
          timestamp: props.time,
        });

        onEvent?.(result.eventId, result.confirmed);
      }

      lastCheckedTime = new Date().toISOString();
    } catch (err) {
      console.error('EMSC poll error:', err);
    }
  }

  poll();
  pollTimer = setInterval(poll, POLL_INTERVAL_MS);

  return {
    stop: () => {
      if (pollTimer) clearInterval(pollTimer);
    },
  };
}
