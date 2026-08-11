-- GeoAlerta Global - Database Schema
-- PostgreSQL 16 + PostGIS 3.4

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ORGANIZACIONES
-- ============================================
CREATE TABLE organizaciones (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre          VARCHAR(255) NOT NULL,
    slug            VARCHAR(100) UNIQUE NOT NULL,
    plan            VARCHAR(50) DEFAULT 'enterprise',
    max_usuarios    INTEGER DEFAULT 1000,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- USUARIOS
-- ============================================
CREATE TABLE usuarios (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organizacion_id UUID NOT NULL REFERENCES organizaciones(id),
    email           VARCHAR(255) UNIQUE NOT NULL,
    nombre          VARCHAR(100) NOT NULL,
    apellidos       VARCHAR(150) NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    rol             VARCHAR(20) NOT NULL DEFAULT 'personal',
    email_verificado BOOLEAN DEFAULT FALSE,
    geoloc_activa   BOOLEAN DEFAULT FALSE,
    totp_secret     VARCHAR(64),
    estado          VARCHAR(20) DEFAULT 'activo',
    ultimo_contacto TIMESTAMPTZ,
    nivel_bateria   INTEGER,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_usuarios_org ON usuarios(organizacion_id);
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_estado ON usuarios(estado);

-- ============================================
-- UBICACIONES (con PostGIS)
-- ============================================
CREATE TABLE ubicaciones (
    id              BIGSERIAL PRIMARY KEY,
    usuario_id      UUID NOT NULL REFERENCES usuarios(id),
    punto           GEOMETRY(Point, 4326) NOT NULL,
    precision_m     FLOAT,
    fuente          VARCHAR(20) DEFAULT 'gps',
    timestamp_dispositivo TIMESTAMPTZ NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ubicaciones_usuario ON ubicaciones(usuario_id);
CREATE INDEX idx_ubicaciones_timestamp ON ubicaciones(created_at DESC);
CREATE INDEX idx_ubicaciones_punto ON ubicaciones USING GIST(punto);

-- ============================================
-- EVENTOS SÍSMICOS
-- ============================================
CREATE TABLE eventos_sismicos (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    epicentro       GEOMETRY(Point, 4326) NOT NULL,
    magnitud        DECIMAL(3,1) NOT NULL CHECK (magnitud BETWEEN 3.0 AND 9.5),
    profundidad_km  DECIMAL(6,2) NOT NULL,
    radio_base_km   DECIMAL(8,2),
    radio_final_km  DECIMAL(8,2),
    estado          VARCHAR(20) DEFAULT 'no_confirmado',
    confianza       INTEGER DEFAULT 0,
    fuentes         JSONB DEFAULT '[]',
    timestamp_evento TIMESTAMPTZ NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_eventos_estado ON eventos_sismicos(estado);
CREATE INDEX idx_eventos_timestamp ON eventos_sismicos(timestamp_evento DESC);
CREATE INDEX idx_eventos_epicentro ON eventos_sismicos USING GIST(epicentro);

-- ============================================
-- ALERTAS EMITIDAS
-- ============================================
CREATE TABLE alertas (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evento_id       UUID NOT NULL REFERENCES eventos_sismicos(id),
    usuario_id      UUID NOT NULL REFERENCES usuarios(id),
    zona_riesgo     VARCHAR(10) NOT NULL,
    distancia_km    DECIMAL(8,2),
    canal_entrega   VARCHAR(20),
    estado_entrega  VARCHAR(20) DEFAULT 'pendiente',
    timestamp_envio TIMESTAMPTZ,
    timestamp_recepcion TIMESTAMPTZ,
    latencia_ms     INTEGER,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(evento_id, usuario_id)
);

CREATE INDEX idx_alertas_evento ON alertas(evento_id);
CREATE INDEX idx_alertas_usuario ON alertas(usuario_id);
CREATE INDEX idx_alertas_estado ON alertas(estado_entrega);

-- ============================================
-- CHECK-INS
-- ============================================
CREATE TABLE check_ins (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id      UUID NOT NULL REFERENCES usuarios(id),
    evento_id       UUID REFERENCES eventos_sismicos(id),
    estado          VARCHAR(30) NOT NULL,
    punto           GEOMETRY(Point, 4326),
    precision_m     FLOAT,
    es_ubicacion_realtime BOOLEAN DEFAULT TRUE,
    nivel_bateria   INTEGER,
    origen          VARCHAR(20) DEFAULT 'usuario',
    timestamp_dispositivo TIMESTAMPTZ NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_checkins_usuario ON check_ins(usuario_id);
CREATE INDEX idx_checkins_evento ON check_ins(evento_id);

-- ============================================
-- SEÑALES SOS
-- ============================================
CREATE TABLE senales_sos (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id      UUID NOT NULL REFERENCES usuarios(id),
    punto           GEOMETRY(Point, 4326),
    es_ubicacion_realtime BOOLEAN DEFAULT TRUE,
    nivel_bateria   INTEGER,
    modo_baliza_activo BOOLEAN DEFAULT FALSE,
    origen          VARCHAR(20) DEFAULT 'manual',
    estado          VARCHAR(20) DEFAULT 'activo',
    timestamp_dispositivo TIMESTAMPTZ NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    resolved_at     TIMESTAMPTZ
);

CREATE INDEX idx_sos_usuario ON senales_sos(usuario_id);
CREATE INDEX idx_sos_estado ON senales_sos(estado);

-- ============================================
-- FUENTES SÍSMICAS
-- ============================================
CREATE TABLE fuentes_sismicas (
    id              VARCHAR(50) PRIMARY KEY,
    nombre          VARCHAR(100) NOT NULL,
    protocolo       VARCHAR(20) NOT NULL,
    url_endpoint    VARCHAR(500),
    estado          VARCHAR(20) DEFAULT 'activa',
    ultimo_dato     TIMESTAMPTZ,
    latencia_avg_ms INTEGER,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INVITACIONES
-- ============================================
CREATE TABLE invitaciones (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organizacion_id UUID NOT NULL REFERENCES organizaciones(id),
    email           VARCHAR(255),
    token           VARCHAR(255) UNIQUE NOT NULL,
    rol_asignado    VARCHAR(20) DEFAULT 'personal',
    estado          VARCHAR(20) DEFAULT 'pendiente',
    creado_por      UUID REFERENCES usuarios(id),
    expires_at      TIMESTAMPTZ NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SEED: FUNDIVEL
-- ============================================
INSERT INTO organizaciones (nombre, slug, plan, max_usuarios)
VALUES ('FUNDIVEL', 'fundivel', 'enterprise', 10000);

INSERT INTO fuentes_sismicas (id, nombre, protocolo, url_endpoint) VALUES
  ('openeew', 'OpenEEW', 'websocket', 'wss://openeew-earthquakes.mybluemix.net'),
  ('grillo', 'Grillo', 'mqtt', 'mqtt://grillo-sensor-network.com'),
  ('usgs', 'USGS Earthquake Hazards', 'sse', 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson'),
  ('emsc', 'EMSC', 'rest', 'https://www.seismicportal.eu/fdsnws/event/1/query');
