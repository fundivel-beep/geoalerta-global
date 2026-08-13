'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';

type Personal = {
  id: string;
  nombre: string;
  estado: string;
  bat: number | null;
  ultimoContacto: string;
  lat: number | null;
  lng: number | null;
};

const estadoConfig: Record<string, { color: string; bg: string; label: string }> = {
  seguro: { color: 'text-green-400', bg: 'bg-green-500', label: 'Seguro' },
  sos: { color: 'text-red-400', bg: 'bg-red-500', label: 'SOS' },
  sin_respuesta: { color: 'text-orange-400', bg: 'bg-orange-500', label: 'Sin respuesta' },
  sin_senal: { color: 'text-gray-400', bg: 'bg-gray-500', label: 'Sin señal' },
};

export default function DashboardPage() {
  const [personal, setPersonal] = useState<Personal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('todos');
  const [ultimaActualizacion, setUltimaActualizacion] = useState('');

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, 'personal')),
      (snap) => {
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Personal));
        setPersonal(data);
        setLoading(false);
        setUltimaActualizacion(new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }));
      }
    );
    return () => unsub();
  }, []);

  const stats = {
    total: personal.length,
    gps: personal.filter(p => p.lat !== null && p.lat !== undefined).length,
    riesgo: personal.filter(p => p.estado === 'sos' || p.estado === 'sin_respuesta').length,
    sos: personal.filter(p => p.estado === 'sos').length,
  };

  const filtrados = filtro === 'todos' ? personal : personal.filter(p => p.estado === filtro);

  return (
    <>
      <header className="sticky top-0 z-10 bg-[#0a0f1a]/80 backdrop-blur-lg border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Centro de Mando — FUNDIVEL</h2>
          <p className="text-xs text-gray-500">
            {loading ? 'Cargando...' : `${personal.length} miembros · Actualizado ${ultimaActualizacion}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Sistema activo
          </span>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Personal Total" value={stats.total} icon="👥" color="blue" />
          <StatCard label="GPS Activo" value={stats.gps} icon="📍" color="green" />
          <StatCard label="En Riesgo" value={stats.riesgo} icon="⚠️" color="orange" />
          <StatCard label="SOS Activos" value={stats.sos} icon="🆘" color="red" />
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          {/* Map placeholder */}
          <div className="lg:col-span-2 glass rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">Mapa en Vivo</h3>
              <span className="text-[10px] text-gray-500">
                {stats.gps} de {stats.total} con GPS activo
              </span>
            </div>
            <div className="w-full h-[400px] rounded-xl bg-gray-900 flex items-center justify-center border border-white/5">
              <div className="text-center">
                <p className="text-4xl mb-3">🗺️</p>
                <p className="text-sm text-gray-400">Mapa Vectorial (Mapbox GL)</p>
                <p className="text-xs text-gray-600 mt-1">Requiere token NEXT_PUBLIC_MAPBOX_TOKEN</p>
                <div className="mt-4 flex items-center justify-center gap-3 text-[10px]">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" /> Seguro ({personal.filter(p=>p.estado==='seguro').length})</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> SOS ({stats.sos})</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500" /> Sin resp. ({personal.filter(p=>p.estado==='sin_respuesta').length})</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-500" /> Sin señal ({personal.filter(p=>p.estado==='sin_senal').length})</span>
                </div>
              </div>
            </div>
          </div>

          {/* Personnel list — real Firestore data */}
          <div className="glass rounded-2xl p-4 flex flex-col max-h-[500px]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">Personal</h3>
              <Link href="/personal" className="text-[10px] text-blue-400 hover:text-blue-300 transition">
                Ver todos →
              </Link>
            </div>
            <div className="flex gap-1.5 mb-3 flex-wrap">
              {['todos', 'seguro', 'sos', 'sin_respuesta', 'sin_senal'].map(f => (
                <button key={f} onClick={() => setFiltro(f)}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium transition ${filtro === f ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:text-white'}`}>
                  {f === 'todos' ? 'Todos' : estadoConfig[f]?.label}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-6 h-6 rounded-full border-2 border-blue-500 border-t-transparent animate-spin mx-auto mb-2" />
                  <p className="text-[10px] text-gray-500">Cargando...</p>
                </div>
              </div>
            ) : filtrados.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-center py-8">
                <div>
                  <p className="text-2xl mb-2">👥</p>
                  <p className="text-xs text-gray-500">
                    {personal.length === 0 ? 'No hay personal registrado aún' : 'Sin resultados para este filtro'}
                  </p>
                  {personal.length === 0 && (
                    <Link href="/personal" className="mt-3 inline-block px-3 py-1.5 bg-blue-600 rounded-lg text-[10px] font-medium">
                      + Agregar personal
                    </Link>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-1.5">
                {filtrados.map(p => {
                  const cfg = estadoConfig[p.estado] ?? estadoConfig.sin_senal;
                  return (
                    <div key={p.id} className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-white/5 transition cursor-pointer">
                      <div className="relative flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-[10px] font-bold">
                          {p.nombre?.split(' ').map((n: string) => n[0]).slice(0, 2).join('') || '?'}
                        </div>
                        <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ${cfg.bg} ring-2 ring-[#0d1321]`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{p.nombre}</p>
                        <p className="text-[10px] text-gray-500">{p.ultimoContacto || '—'}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className={`text-[10px] font-medium ${cfg.color}`}>{cfg.label}</p>
                        {p.bat !== null && p.bat !== undefined && (
                          <p className="text-[9px] text-gray-600">🔋{p.bat}%</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* SOS alerts if any */}
        {stats.sos > 0 && (
          <div className="glass rounded-2xl p-4 border border-red-500/20 bg-red-500/5">
            <h3 className="text-sm font-semibold text-red-400 mb-3">🆘 Alertas SOS Activas</h3>
            <div className="space-y-2">
              {personal.filter(p => p.estado === 'sos').map(p => (
                <div key={p.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20">
                  <span className="text-lg animate-pulse">🆘</span>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-red-300">{p.nombre}</p>
                    <p className="text-[10px] text-gray-400">
                      {p.lat ? `Lat: ${p.lat.toFixed(4)}, Lng: ${p.lng?.toFixed(4)}` : 'Ubicación no disponible'}
                      {' · '}{p.ultimoContacto}
                    </p>
                  </div>
                  <Link href="/personal"
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded-lg text-[10px] font-medium transition">
                    Ver →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick stats footer */}
        <div className="glass rounded-2xl p-4">
          <h3 className="text-sm font-semibold mb-3">Resumen del Sistema</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-xl font-bold text-blue-400">{personal.length}</p>
              <p className="text-[10px] text-gray-500">Miembros registrados</p>
            </div>
            <div>
              <p className="text-xl font-bold text-green-400">{personal.filter(p => p.estado === 'seguro').length}</p>
              <p className="text-[10px] text-gray-500">Reportados seguros</p>
            </div>
            <div>
              <p className="text-xl font-bold text-orange-400">{personal.filter(p => p.estado === 'sin_respuesta').length}</p>
              <p className="text-[10px] text-gray-500">Sin respuesta</p>
            </div>
            <div>
              <p className="text-xl font-bold text-gray-400">{personal.filter(p => p.estado === 'sin_senal').length}</p>
              <p className="text-[10px] text-gray-500">Sin señal</p>
            </div>
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
  const textColors: Record<string, string> = {
    blue: 'text-blue-400', green: 'text-green-400',
    orange: 'text-orange-400', red: 'text-red-400',
  };
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
