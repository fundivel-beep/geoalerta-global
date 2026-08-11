import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import { authRoutes } from './routes/auth.js';
import { personalRoutes } from './routes/personal.js';
import { dashboardRoutes } from './routes/dashboard.js';
import { reportesRoutes } from './routes/reportes.js';

const PORT = parseInt(process.env.API_PORT || '3001', 10);
const WS_PORT = parseInt(process.env.WS_PORT || '3002', 10);
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';

async function bootstrap() {
  // === HTTP API (Fastify) ===
  const app = Fastify({ logger: true });

  await app.register(cors, {
    origin: ['http://localhost:3000', 'http://localhost:3003'],
    credentials: true,
  });

  await app.register(jwt, { secret: JWT_SECRET });

  // Health check
  app.get('/health', async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: { api: true, ws: true },
  }));

  // Register routes
  await app.register(authRoutes, { prefix: '/api/auth' });
  await app.register(personalRoutes, { prefix: '/api/personal' });
  await app.register(dashboardRoutes, { prefix: '/api/dashboard' });
  await app.register(reportesRoutes, { prefix: '/api/reportes' });

  await app.listen({ port: PORT, host: '0.0.0.0' });
  console.log(`🚀 API Server running on http://localhost:${PORT}`);

  // === WebSocket Hub ===
  const wsServer = createServer();
  const wss = new WebSocketServer({ server: wsServer });

  // Connection pool: userId -> WebSocket
  const connections = new Map<string, WebSocket>();

  wss.on('connection', (ws, req) => {
    const url = new URL(req.url || '/', `http://localhost:${WS_PORT}`);
    const token = url.searchParams.get('token');

    if (!token) {
      ws.close(4001, 'Token requerido');
      return;
    }

    // Verify JWT
    let userId: string;
    try {
      const decoded = app.jwt.verify(token) as { sub: string };
      userId = decoded.sub;
    } catch {
      ws.close(4002, 'Token inválido');
      return;
    }

    // Enforce single session
    const existing = connections.get(userId);
    if (existing) {
      (existing as any).close(4003, 'Nueva sesión iniciada');
    }
    connections.set(userId, ws as any);

    console.log(`🔌 WS connected: ${userId} (total: ${connections.size})`);

    ws.on('message', (data) => {
      try {
        const msg = JSON.parse(data.toString());
        handleWsMessage(userId, msg, ws);
      } catch {
        ws.send(JSON.stringify({ type: 'error', payload: { message: 'Mensaje inválido' } }));
      }
    });

    ws.on('close', () => {
      connections.delete(userId);
      console.log(`🔌 WS disconnected: ${userId} (total: ${connections.size})`);
    });

    // Heartbeat
    const heartbeat = setInterval(() => {
      if (ws.readyState === ws.OPEN) {
        ws.send(JSON.stringify({ type: 'pong', ts: Date.now() }));
      } else {
        clearInterval(heartbeat);
      }
    }, 30_000);

    ws.on('close', () => clearInterval(heartbeat));

    // Send welcome
    ws.send(JSON.stringify({ type: 'connected', ts: Date.now() }));
  });

  function handleWsMessage(userId: string, msg: any, ws: any) {
    switch (msg.type) {
      case 'ping':
        ws.send(JSON.stringify({ type: 'pong', ts: Date.now() }));
        break;

      case 'ubicacion':
        // TODO: Store location in DB, update last contact
        console.log(`📍 Location from ${userId}: ${msg.payload?.lat}, ${msg.payload?.lng}`);
        break;

      case 'sensor_report':
        // TODO: Correlate with other sensors, validate P-wave
        console.log(`📡 Sensor report from ${userId}: STA/LTA=${msg.payload?.sta_lta_ratio}`);
        break;

      case 'check_in':
        // TODO: Store check-in, notify dashboard
        console.log(`✅ Check-in from ${userId}: ${msg.payload?.estado}`);
        break;

      case 'sos':
        // TODO: Store SOS, activate beacon mode tracking, notify dashboard
        console.log(`🆘 SOS from ${userId}!`);
        broadcastToAdmins({ type: 'sos_received', payload: { userId, ...msg.payload }, ts: Date.now() });
        break;

      case 'baliza_activada':
        console.log(`🔴 Beacon activated: ${userId}`);
        broadcastToAdmins({ type: 'baliza_activada', payload: { userId, ...msg.payload }, ts: Date.now() });
        break;

      default:
        console.log(`❓ Unknown message type from ${userId}: ${msg.type}`);
    }
  }

  function broadcastToAdmins(msg: any) {
    // TODO: Filter by admin role from connections metadata
    const payload = JSON.stringify(msg);
    connections.forEach((ws) => {
      if ((ws as any).readyState === 1) {
        (ws as any).send(payload);
      }
    });
  }

  // Public function to push alerts to specific users
  function pushAlertToUser(userId: string, alert: any) {
    const ws = connections.get(userId);
    if (ws && (ws as any).readyState === 1) {
      (ws as any).send(JSON.stringify(alert));
      return true;
    }
    return false; // User not connected, need fallback (push/sms)
  }

  wsServer.listen(WS_PORT, () => {
    console.log(`🔌 WebSocket Hub running on ws://localhost:${WS_PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});
