import { processSeismicReport } from '../services/ews-engine.js';

const USGS_FEED_URL = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_hour.geojson';
const POLL_INTERVAL_MS = 10_000; // 10 seconds

let lastEventTime = Date.now();
let pollTimer: NodeJS.Timeout | null = null;

interface USGSFeature {
  properties: {
    mag: number;
    place: string;
    time: number;
    type: string;
  };
  geometry: {
    coordinates: [number, number, number]; // [lng, lat, depth_km]
  };
  id: string;
}

/**
 * USGS Earthquake Feed Adapter
 * Polls GeoJSON feed every 10 seconds for new events.
 */
export function startUSGSAdapter(onEvent?: (eventId: string, confirmed: boolean) => void) {
  console.log('🌐 Starting USGS adapter (polling every 10s)');

  async function poll() {
    try {
      const res = await fetch(USGS_FEED_URL);
      if (!res.ok) {
        console.warn(`USGS feed returned ${res.status}`);
        return;
      }

      const data = await res.json();
      const features: USGSFeature[] = data.features || [];

      for (const feature of features) {
        const eventTime = feature.properties.time;
        if (eventTime <= lastEventTime) continue; // Already processed

        const [lng, lat, depth] = feature.geometry.coordinates;
        const magnitude = feature.properties.mag;

        if (magnitude < 3.0) continue; // Skip small events

        console.log(`🌐 USGS event: M${magnitude} at ${lat},${lng} depth=${depth}km`);

        const result = await processSeismicReport({
          source: 'usgs',
          lat,
          lng,
          magnitude,
          depth_km: depth,
          timestamp: new Date(eventTime).toISOString(),
        });

        onEvent?.(result.eventId, result.confirmed);
      }

      if (features.length > 0) {
        lastEventTime = Math.max(...features.map((f) => f.properties.time));
      }
    } catch (err) {
      console.error('USGS poll error:', err);
    }
  }

  poll(); // Initial poll
  pollTimer = setInterval(poll, POLL_INTERVAL_MS);

  return {
    stop: () => {
      if (pollTimer) clearInterval(pollTimer);
    },
  };
}
