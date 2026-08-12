'use client';

import { useState, useEffect } from 'react';

type Evento = {
  id: string;
  magnitud: number;
  lugar: string;
  profundidad: number;
  fecha: string;
  fuentes: string[];
  alerta: string;
  coordenadas: { lat: number; lng: number };
};

const alertaConfig: Record<string, { color: string; bg: string; bgLight: string; label: string }> = {
  roja: { color: 'text-red-400', bg: 'bg-red-500', bgLight: 'from-red-600/20 to-red-800/10', label: 'Roja' },
  naranja: { color: 'text-orange-400', bg: 'bg-orange-500', bgLight: 'from-orange-600/20 to-orange-800/10', label: 'Naranja' },
  amarilla: { color: 'text-yellow-400', bg: 'bg-yellow-500', bgLight: 'from-yellow-600/20 to-yellow-800/10', label: 'Amarilla' },
  verde: { color: 'text-green-400', bg: 'bg-green-500', bgLight: 'from-green-600/20 to-green-800/10', label: 'Verde' },
};

function getAlerta(mag: number): string {
  if (mag >= 6.5) return 'roja';
  if (mag >= 5.5) return 'naranja';
  if (mag >= 4.5) return 'amarilla';
  return 'verde';
}

export default function EventosPage() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtroAlerta, setFiltroAlerta] = useState('todas');
  const [ultimaActualizacion, setUltimaActualizacion] = useState('');

  const fetchEventos = async () => {
    try {
      setLoading(true);
      // USGS API — last 7 days, min magnitude 3.0, South America region
      const url = 'https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&minmagnitude=3.0&minlatitude=-56&maxlatitude=13&minlongitude=-82&maxlongitude=-32&orderby=time&limit=50';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Error al conectar con USGS');
      const data = await res.json();

      const mapped: Evento[] = data.features.map((f: {
        id: string;
        properties: { mag: number; place: string; time: number };
        geometry: { coordinates: [number, number, number] };
      }) => ({
        id: f.id,
        magnitud: Math.round(f.properties.mag * 10) / 10,
        lugar: f.properties.place,
        profundidad: Math.round(f.geometry.coordinates[2]),
        fecha: new Date(f.properties.time).toISOString(),
        fuentes: ['USGS'],
        alerta: getAlerta(f.properties.mag),
        coordenadas: { lat: f.geometry.coordinates[1], lng: f.geometry.coordinates[0] },
      }));

      setEventos(mapped);
      setUltimaActualizacion(new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }));
      setError('');
    } catch (err) {
      setError('No se pudo cargar datos de USGS. Verifica tu conexión.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventos();
    const interval = setInterval(fetchEventos, 5 * 60 * 1000); // refresh every 5 min
    return () => clearInterval(interval);
  }, []);

  const filtrados = filtroAlerta === 'todas' ? eventos : eventos.filter(e => e.alerta === filtroAlerta);

  return (
    <>
      <header className="sticky top-0 z-10 bg-[#0a0f1a]/80 backdrop-blur-lg border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Eventos Sísmicos</h2>
          <p className="text-xs text-gray-500">Datos en tiempo real — USGS (últimos 7 días, M3.0+, Sudamérica)</p>
        </div>
        <div className="flex items-center gap-3">
          {ultimaActualizacion && (
            <span className="text-[10px] text-gray-500">Actualizado: {ultimaActualizacion}</span>
          )}
          <button onClick={fetchEventos} disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg text-xs font-medium transition disabled:opacity-50">
            {loading ? '⏳' : '🔄'} {loading ? 'Cargando...' : 'Actualizar'}
          </button>
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            USGS Live
          </span>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {error && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-300 text-sm p-4 rounded-xl">
            <span>⚠️</span><span>{error}</span>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {['roja', 'naranja', 'amarilla', 'verde'].map(nivel => {
            const cfg = alertaConfig[nivel];
            const count = eventos.filter(e => e.alerta === nivel).length;
            const icons: Record<string, string> = { roja: '🔴', naranja: '🟠', amarilla: '🟡', verde: '🟢' };
            return (
              <div key={nivel} className={`rounded-2xl p-4 bg-gradient-to-br ${cfg.bgLight} border border-white/5`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xl">{icons[nivel]}</span>
                  <span className={`text-2xl font-bold ${cfg.color}`}>{count}</span>
                </div>
                <p className="text-xs text-gray-400">Alerta {cfg.label}</p>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          {['todas', 'roja', 'naranja', 'amarilla', 'verde'].map(f => (
            <button key={f} onClick={() => setFiltroAlerta(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${filtroAlerta === f ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:text-white'}`}>
              {f === 'todas' ? `Todas (${eventos.length})` : `Alerta ${alertaConfig[f]?.label}`}
            </button>
          ))}
        </div>

        {loading && eventos.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin mx-auto mb-3" />
              <p className="text-xs text-gray-500">Conectando con USGS...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filtrados.length === 0 ? (
              <div className="text-center py-12 text-gray-500 text-sm">No hay eventos con ese nivel de alerta</div>
            ) : filtrados.map(evento => {
              const cfg = alertaConfig[evento.alerta];
              const fecha = new Date(evento.fecha);
              return (
                <div key={evento.id} className="glass rounded-2xl p-5 hover:bg-white/[0.03] transition">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${cfg.bgLight} flex items-center justify-center flex-shrink-0`}>
                        <span className={`text-lg font-bold ${cfg.color}`}>M{evento.magnitud}</span>
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold mb-1 truncate">{evento.lugar}</h3>
                        <div className="flex flex-wrap items-center gap-3 text-[10px] text-gray-500">
                          <span>📅 {fecha.toLocaleDateString('es-PE')} {fecha.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}</span>
                          <span>📏 Prof. {evento.profundidad} km</span>
                          <span>📍 {evento.coordenadas.lat.toFixed(2)}, {evento.coordenadas.lng.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          {evento.fuentes.map(f => (
                            <span key={f} className="px-2 py-0.5 rounded bg-white/5 text-[10px] text-gray-400 font-medium">{f}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium ${cfg.color} bg-white/5 flex-shrink-0`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${cfg.bg}`} />
                      M{evento.magnitud} · {cfg.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
