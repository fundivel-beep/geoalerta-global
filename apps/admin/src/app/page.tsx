'use client';

import { useState } from 'react';

const personalDemo = [
  { id: '1', nombre: 'Carlos Mendoza Rivera', estado: 'seguro', contacto: 'Hace 2 min', bat: 85, lat: -12.046, lng: -77.042 },
  { id: '2', nombre: 'María Gutiérrez López', estado: 'seguro', contacto: 'Hace 5 min', bat: 72, lat: -12.048, lng: -77.038 },
  { id: '3', nombre: 'Jorge Paredes Soto', estado: 'sin_respuesta', contacto: 'Hace 18 min', bat: 45, lat: -12.051, lng: -77.045 },
  { id: '4', nombre: 'Ana Villanueva Cruz', estado: 'seguro', contacto: 'Hace 1 min', bat: 93, lat: -12.044, lng: -77.040 },
  { id: '5', nombre: 'Roberto Chávez Díaz', estado: 'sin_senal', contacto: 'Hace 2 horas', bat: null, lat: null, lng: null },
  { id: '6', nombre: 'Laura Fernández Rojas', estado: 'seguro', contacto: 'Hace 3 min', bat: 68, lat: -12.049, lng: -77.036 },
  { id: '7', nombre: 'Pedro Quispe Huamán', estado: 'sos', contacto: 'Hace 1 min', bat: 23, lat: -12.053, lng: -77.041 },
  { id: '8', nombre: 'Rosa Díaz Vargas', estado: 'seguro', contacto: 'Hace 4 min', bat: 91, lat: -12.047, lng: -77.043 },
];

const estadoConfig: Record<string, { color: string; bg: string; label: string }> = {
  seguro: { color: 'text-green-400', bg: 'bg-green-500', label: 'Seguro' },
  sos: { color: 'text-red-400', bg: 'bg-red-500', label: 'SOS' },
  sin_respuesta: { color: 'text-orange-400', bg: 'bg-orange-500', label: 'Sin respuesta' },
  sin_senal: { color: 'text-gray-400', bg: 'bg-gray-500', label: 'Sin señal' },
};

export default function DashboardPage() {
  const [filtro, setFiltro] = useState('todos');

  const stats = {
    total: personalDemo.length,
    gps: personalDemo.filter(p => p.lat !== null).length,
    riesgo: personalDemo.filter(p => p.estado === 'sos' || p.estado === 'sin_respuesta').length,
    sos: personalDemo.filter(p => p.estado === 'sos').length,
  };

  const filtrados = filtro === 'todos' ? personalDemo : personalDemo.filter(p => p.estado === filtro);

  return (
    <>
      <header className="sticky top-0 z-10 bg-[#0a0f1a]/80 backdrop-blur-lg border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Centro de Mando — FUNDIVEL</h2>
          <p className="text-xs text-gray-500">Monitoreo en tiempo real del personal</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Sistema activo
          </span>
        </div>
      </header>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Personal Total" value={stats.total} icon="👥" color="blue" />
          <StatCard label="GPS Activo" value={stats.gps} icon="📍" color="green" />
          <StatCard label="En Riesgo" value={stats.riesgo} icon="⚠️" color="orange" />
          <StatCard label="SOS Activos" value={stats.sos} icon="🆘" color="red" />
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 glass rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">Mapa en Vivo</h3>
              <span className="text-[10px] text-gray-500">Actualizado hace 5s</span>
            </div>
            <div className="w-full h-[400px] rounded-xl bg-gray-900 flex items-center justify-center border border-white/5">
              <div className="text-center">
                <p className="text-4xl mb-3">🗺️</p>
                <p className="text-sm text-gray-400">Mapa Vectorial (Mapbox GL)</p>
                <p className="text-xs text-gray-600 mt-1">Requiere token NEXT_PUBLIC_MAPBOX_TOKEN</p>
                <div className="mt-4 flex items-center justify-center gap-3 text-[10px]">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" /> Seguro</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> SOS</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500" /> Sin resp.</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-500" /> Sin señal</span>
                </div>
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-4 flex flex-col max-h-[500px]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">Personal</h3>
              <span className="text-[10px] text-gray-500">{filtrados.length} miembros</span>
            </div>
            <div className="flex gap-1.5 mb-3 flex-wrap">
              {['todos', 'seguro', 'sos', 'sin_respuesta', 'sin_senal'].map(f => (
                <button
                  key={f}
                  onClick={() => setFiltro(f)}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium transition ${
                    filtro === f ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:text-white'
                  }`}
                >
                  {f === 'todos' ? 'Todos' : estadoConfig[f]?.label}
                </button>
              ))}
            </div>
            <div className="flex-1 overflow-y-auto space-y-1.5">
              {filtrados.map(p => {
                const cfg = estadoConfig[p.estado] || estadoConfig.sin_senal;
                return (
                  <div key={p.id} className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-white/5 transition cursor-pointer">
                    <div className="relative flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-[10px] font-bold">
                        {p.nombre.split(' ').map(n => n[0]).slice(0, 2).join('')}
                      </div>
                      <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ${cfg.bg} ring-2 ring-[#0d1321]`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{p.nombre}</p>
                      <p className="text-[10px] text-gray-500">{p.contacto}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`text-[10px] font-medium ${cfg.color}`}>{cfg.label}</p>
                      {p.bat !== null && <p className="text-[9px] text-gray-600">🔋{p.bat}%</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-4">
          <h3 className="text-sm font-semibold mb-3">Actividad Reciente</h3>
          <div className="space-y-2">
            <ActivityItem time="16:41" icon="🆘" text="Pedro Quispe Huamán activó SOS — Lat: -12.053, Lng: -77.041" type="danger" />
            <ActivityItem time="16:38" icon="✅" text="Ana Villanueva Cruz reportó: Estoy A Salvo" type="success" />
            <ActivityItem time="16:35" icon="⚠️" text="Jorge Paredes Soto sin respuesta al check-in (18 min)" type="warning" />
            <ActivityItem time="16:30" icon="📡" text="Evento sísmico M4.2 confirmado — 2 fuentes (USGS + EMSC)" type="info" />
            <ActivityItem time="16:29" icon="🌐" text="Sistema de alerta activado — 6 personal en zona de impacto" type="info" />
          </div>
        </div>
      </div>
    </>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: string; color: string }) {
  const colors: Record<string, string> = {
    blue: 'from-blue-600/20 to-blue-800/10 border-blue-500/10',
    green: 'from-green-600/20 to-green-800/10 border-green-500/10',
    orange: 'from-orange-600/20 to-orange-800/10 border-orange-500/10',
    red: 'from-red-600/20 to-red-800/10 border-red-500/10',
  };
  const textColors: Record<string, string> = { blue: 'text-blue-400', green: 'text-green-400', orange: 'text-orange-400', red: 'text-red-400' };

  return (
    <div className={`rounded-2xl p-4 bg-gradient-to-br ${colors[color]} border`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xl">{icon}</span>
        <span className={`text-2xl font-bold ${textColors[color]}`}>{value}</span>
      </div>
      <p className="text-xs text-gray-400">{label}</p>
    </div>
  );
}

function ActivityItem({ time, icon, text, type }: { time: string; icon: string; text: string; type: string }) {
  const border: Record<string, string> = {
    danger: 'border-l-red-500',
    warning: 'border-l-orange-500',
    success: 'border-l-green-500',
    info: 'border-l-blue-500',
  };
  return (
    <div className={`flex items-start gap-3 p-2.5 rounded-lg bg-white/[0.02] border-l-2 ${border[type]}`}>
      <span className="text-sm mt-0.5">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-300">{text}</p>
      </div>
      <span className="text-[10px] text-gray-600 flex-shrink-0">{time}</span>
    </div>
  );
}
