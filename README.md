# 🌐 GeoAlerta Global & Resiliencia de Personal

Plataforma PWA de alerta temprana sísmica y gestión de seguridad del personal para **FUNDIVEL**.

## Características principales

- ⚡ Motor de alerta temprana ultra-rápida (<500ms end-to-end)
- 📱 Detección de Ondas P en dispositivo (acelerómetro)
- 🔴 Botón SOS y Modo Baliza de supervivencia automático
- 🌐 Red Mesh P2P para comunicación sin infraestructura
- 📡 Agregador multi-fuente: OpenEEW, Grillo, USGS, EMSC
- 🗺️ Dashboard en tiempo real con mapa vectorial (Mapbox GL)
- 📴 Arquitectura Offline-First con Service Workers

## Requisitos previos

- Node.js >= 20.0.0
- Docker y Docker Compose
- npm >= 10.x

## Inicio rápido

```bash
# 1. Clonar e instalar dependencias
cd geoalerta-global
npm install

# 2. Levantar PostgreSQL + Redis
docker compose up -d

# 3. Copiar variables de entorno
cp .env.example .env

# 4. Iniciar en modo desarrollo
npm run dev
```

## Estructura del monorepo

```
geoalerta-global/
├── apps/web/          → PWA Personal (Next.js + TypeScript)
├── apps/admin/        → Dashboard Admin FUNDIVEL (Next.js)
├── packages/shared/   → Tipos y utilidades compartidas
├── packages/mesh-protocol/ → Protocolo binario de mensajes P2P
├── services/api/      → Backend API + WebSocket Hub (Fastify)
├── services/workers/  → Background jobs (BullMQ)
└── docker-compose.yml → PostgreSQL + PostGIS + Redis
```

## Puertos en desarrollo

| Servicio | Puerto |
|----------|--------|
| PWA Personal | http://localhost:3000 |
| API REST | http://localhost:3001 |
| WebSocket Hub | ws://localhost:3002 |
| Dashboard Admin | http://localhost:3003 |
| PostgreSQL | localhost:5432 |
| Redis | localhost:6379 |

## Licencia

Propietario - FUNDIVEL
