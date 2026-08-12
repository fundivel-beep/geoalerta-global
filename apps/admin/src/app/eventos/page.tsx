'use client';

import { useState } from 'react';

const eventosDemo = [
  {
    id: '1',
    magnitud: 6.2,
    lugar: 'Costa Central de Perú',
    profundidad: 35,
    fecha: '2026-08-11T19:30:00Z',
    fuentes: ['USGS', 'EMSC'],
    alerta: 'naranja',
    impacto: { personal_zona: 6, distancia_km: 45 },
    coordenadas: { lat: -12.15, lng: -77.80 },
  },
  {
    id: '2',
    magnitud: 4.2,
    lugar: 'Cañete, Lima',
    profundidad: 28,
    fecha: '2026-08-11T16:30:00Z',
    fuentes: ['USGS', 'EMSC'],
    alerta: 'amarilla',
    impacto: { personal_zona: 3, distancia_km: 120 },
    coordenadas: { lat: -13.08, lng: -76.33 },
  },
  {
    id: '3',
    magnitud: 3.8,
    lugar: 'Huancavelica',
    profundidad: 15,
    fecha: '2026-08-11T14:15:00Z',
    fuentes: ['IGP'],
    alerta: 'verde',
    impacto: { personal_zona: 0, distancia_km: 280 },
    coordenadas: { lat: -12.78, lng: -74.97 },
  },
  {
    id: '4',
    magnitud: 5.1,
    lugar: 'Ica, Perú',
    profundidad: 42,
    fecha: '2026-08-10T22:45:00Z',
    fuentes: ['USGS', 'IGP'],
    alerta: 'amarilla',
    impacto: { personal_zona: 2, distancia_km: 200 },
    coordenadas: { lat: -14.03, lng: -75.73 },
  },
  {
    id: '5',
    magnitud: 7.1,
    lugar: 'Arequipa, Perú',
    profundidad: 70,
    fecha: '2026-08-09T08:12:00Z',
    fuentes: ['USGS', 'EMSC', 'IGP'],
    alerta: 'roja',
    impacto: { personal_zona: 4, distancia_km: 95 },
    coordenadas: { lat: -16.40, lng: -71.54 },
  },
];

const alertaConfig: Record<string, { color: string; bg: string; label: string }> = {
  roja: { color: 'text-red-400', bg: 'bg-red-500', label: 'Roja' },
  naranja: { color: 'text-orange-400', bg: 'bg-orange-500', label: 'Naranja' },
  amarilla: { color: 'text-yellow-400', bg: 'bg-yellow-500', label: 'Amarilla' },
  verde: { color: 'text-green-400', bg: 'bg-green-500', label: 'Verde' },
};

export default function EventosPage() {
  const [filtroAlerta, setFiltroAlerta] = useState('todas');

  const filtrados = filtroAlerta === 'todas' ? eventosDemo : eventosDemo.filter(e => e.alerta === filtroAlerta);

  return (
    <>
      <header className="sticky top-0 z-10 bg-[#0a0f1a]/80 backdrop-blur-lg border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Eventos Sísmicos</h2>
          <p className="text-xs text-gray-500">Monitoreo multiagencia en tiempo real</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            3 fuentes activas
          </span>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl p-4 bg-gradient-to-br from-red-600/20 to-red-800/10 border border-red-500/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xl">🔴</span>
              <span className="text-2xl font-bold text-red-400">{eventosDemo.filter(e => e.alerta === 'roja').length}</span>
            </div>
            <p className="text-xs text-gray-400">Alerta Roja</p>
          </div>
          <div className="rounded-2xl p-4 bg-gradient-to-br from-orange-600/20 to-orange-800/10 border border-orange-500/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xl">🟠</span>
              <span className="text-2xl font-bold text-orange-400">{eventosDemo.filter(e => e.alerta === 'naranja').length}</span>
            </div>
            <p className="text-xs text-gray-400">Alerta Naranja</p>
          </div>
          <div className="rounded-2xl p-4 bg-gradient-to-br from-yellow-600/20 to-yellow-800/10 border border-yellow-500/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xl">🟡</span>
              <span className="text-2xl font-bold text-yellow-400">{eventosDemo.filter(e => e.alerta === 'amarilla').length}</span>
            </div>
            <p className="text-xs text-gray-400">Alerta Amarilla</p>
          </div>
          <div className="rounded-2xl p-4 bg-gradient-to-br from-green-600/20 to-green-800/10 border border-green-500/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xl">🟢</span>
              <span className="text-2xl font-bold text-green-400">{eventosDemo.filter(e => e.alerta === 'verde').length}</span>
            </div>
            <p className="text-xs text-gray-400">Sin Alerta</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          {['todas', 'roja', 'naranja', 'amarilla', 'verde'].map(f => (
            <button
              key={f}
              onClick={() => setFiltroAlerta(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                filtroAlerta === f ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              {f === 'todas' ? 'Todas' : `Alerta ${alertaConfig[f]?.label}`}
            </button>
          ))}
        </div>

        {/* Event cards */}
        <div className="space-y-3">
          {filtrados.map(evento => {
            const cfg = alertaConfig[evento.alerta];
            const fecha = new Date(evento.fecha);
            return (
              <div key={evento.id} className="glass rounded-2xl p-5 hover:bg-white/[0.03] transition">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 rounded-xl ${cfg.bg}/20 flex items-center justify-center`}>
                      <span className={`text-2xl font-bold ${cfg.color}`}>M{evento.magnitud}</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold mb-1">{evento.lugar}</h3>
                      <div className="flex items-center gap-3 text-[10px] text-gray-500">
                        <span>📅 {fecha.toLocaleDateString('es-PE')} {fecha.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}</span>
                        <span>📏 Prof. {evento.profundidad} km</span>
                        <span>📍 {evento.coordenadas.lat.toFixed(2)}, {evento.coordenadas.lng.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        {evento.fuentes.map(f => (
                          <span key={f} className="px-2 py-0.5 rounded bg-white/5 text-[10px] text-gray-400 font-medium">
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium ${cfg.color} bg-white/5`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${cfg.bg}`} />
                      Alerta {cfg.label}
                    </span>
                    <p className="text-[10px] text-gray-500">👥 {evento.impacto.personal_zona} personal en zona</p>
                    <p className="text-[10px] text-gray-500">📐 {evento.impacto.distancia_km} km de base</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
