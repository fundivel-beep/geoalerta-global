import { processSeismicReport } from '../services/ews-engine.js';

const OPENEEW_WS_URL = process.env.OPENEEW_WS_URL || 'wss://openeew-earthquakes.mybluemix.net';

let ws: WebSocket | null = null;
let reconnectTimer: NodeJS.Timeout | null = null;

/**
 * OpenEEW WebSocket Adapter
 * Connects to OpenEEW real-time sensor network.
 */
export function startOpenEEWAdapter(onEvent?: (eventId: string, confirmed: boolean) => void) {
  console.log('🔴 Starting OpenEEW adapter (WebSocket)');

  function connect() {
    try {
      ws = new WebSocket(OPENEEW_WS_URL);

      ws.onopen = () => {
        console.log('🔴 OpenEEW WebSocket connected');
      };

      ws.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data.toString());

          // OpenEEW sends sensor readings and earthquake detections
          if (data.type === 'earthquake' || data.earthquake) {
            const eq = data.earthquake || data;
            const result = await processSeismicReport({
              source: 'openeew',
              lat: eq.lat || eq.latitude,
              lng: eq.lng || eq.longitude,
              magnitude: eq.magnitude || eq.mag,
              depth_km: eq.depth || 10,
              timestamp: new Date().toISOString(),
            });

            onEvent?.(result.eventId, result.confirmed);
          }
        } catch (err) {
          // Ignore parsing errors for non-earthquake messages
        }
      };

      ws.onclose = () => {
        console.log('🔴 OpenEEW WebSocket disconnected, reconnecting in 5s...');
        reconnectTimer = setTimeout(connect, 5000);
      };

      ws.onerror = () => {
        ws?.close();
      };
    } catch (err) {
      console.error('OpenEEW connection error:', err);
      reconnectTimer = setTimeout(connect, 10000);
    }
  }

  connect();

  return {
    stop: () => {
      if (reconnectTimer) clearTimeout(reconnectTimer);
      ws?.close();
    },
  };
}
