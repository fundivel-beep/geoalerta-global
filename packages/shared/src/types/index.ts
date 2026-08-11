// === USUARIOS ===
export interface Usuario {
  id: string;
  organizacion_id: string;
  email: string;
  nombre: string;
  apellidos: string;
  rol: 'admin' | 'operador' | 'personal';
  email_verificado: boolean;
  geoloc_activa: boolean;
  estado: 'activo' | 'inactivo' | 'baja';
  ultimo_contacto?: string;
  nivel_bateria?: number;
}

// === UBICACIÓN ===
export interface Coordenadas {
  lat: number;
  lng: number;
}

export interface Ubicacion extends Coordenadas {
  precision_m: number;
  timestamp_dispositivo: string;
  fuente: 'gps' | 'red' | 'mesh' | 'manual';
}

// === EVENTOS SÍSMICOS ===
export interface EventoSismico {
  id: string;
  epicentro: Coordenadas;
  magnitud: number;
  profundidad_km: number;
  radio_base_km: number;
  radio_final_km: number;
  estado: 'no_confirmado' | 'confirmado' | 'descartado';
  confianza: number;
  fuentes: FuenteReporte[];
  timestamp_evento: string;
}

export interface FuenteReporte {
  fuente: string;
  timestamp: string;
  magnitud_reportada: number;
}

// === ZONAS DE RIESGO ===
export type ZonaRiesgo = 'roja' | 'naranja' | 'amarilla';

// === ALERTAS ===
export interface Alerta {
  id: string;
  evento_id: string;
  usuario_id: string;
  zona_riesgo: ZonaRiesgo;
  distancia_km: number;
  canal_entrega: 'websocket' | 'push' | 'sms' | 'whatsapp' | 'telegram';
  estado_entrega: 'pendiente' | 'enviada' | 'recibida' | 'fallida';
  latencia_ms?: number;
}

// === CHECK-IN ===
export type EstadoCheckIn = 'a_salvo' | 'necesita_ayuda' | 'atrapado_en_peligro';

export interface CheckIn {
  id: string;
  usuario_id: string;
  evento_id?: string;
  estado: EstadoCheckIn;
  ubicacion?: Coordenadas;
  es_ubicacion_realtime: boolean;
  nivel_bateria: number;
  origen: 'usuario' | 'mesh' | 'automatico';
  timestamp_dispositivo: string;
}

// === SOS ===
export interface SenalSOS {
  id: string;
  usuario_id: string;
  ubicacion?: Coordenadas;
  es_ubicacion_realtime: boolean;
  nivel_bateria: number;
  modo_baliza_activo: boolean;
  origen: 'manual' | 'automatico' | 'mesh';
  estado: 'activo' | 'resuelto' | 'cancelado';
  timestamp_dispositivo: string;
}

// === MODO BALIZA ===
export type EstadoBaliza = 'normal' | 'countdown' | 'baliza_activa' | 'ultra_low_power';

// === FUENTES SÍSMICAS ===
export interface FuenteSismica {
  id: string;
  nombre: string;
  protocolo: 'websocket' | 'mqtt' | 'sse' | 'rest';
  estado: 'activa' | 'degradada' | 'offline';
  ultimo_dato?: string;
  latencia_avg_ms?: number;
}

// === MENSAJES WEBSOCKET ===
export type WsMessageType =
  | 'ping'
  | 'pong'
  | 'alerta_sismica'
  | 'alerta_confirmada'
  | 'alerta_cancelada'
  | 'sensor_report'
  | 'ubicacion'
  | 'check_in'
  | 'sos'
  | 'baliza_activada'
  | 'baliza_desactivada';

export interface WsMessage<T = unknown> {
  type: WsMessageType;
  payload?: T;
  priority?: 'urgent' | 'normal';
  ts: number;
}

// === DASHBOARD ===
export type EstadoMarcador = 'seguro' | 'peligro' | 'sin_respuesta' | 'sin_senal';

export interface MarcadorMapa {
  id: string;
  lat: number;
  lng: number;
  estado: EstadoMarcador;
  zona_riesgo?: ZonaRiesgo;
  ultimo_contacto: string;
}

export interface ResumenDashboard {
  total_personal: number;
  con_geolocalizacion: number;
  en_zona_riesgo: number;
  sin_contacto_15min: number;
  sos_activos: number;
  balizas_activas: number;
  fuentes_activas: number;
  fuentes_degradadas: number;
}
