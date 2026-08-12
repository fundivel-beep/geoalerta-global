'use client';

import { useState } from 'react';

const reportesDemo = [
  {
    id: '1',
    titulo: 'Evacuación Sector Lima Centro',
    evento: 'M6.2 Costa Central',
    fecha: '2026-08-11T19:45:00Z',
    estado: 'activo',
    prioridad: 'alta',
    coordinador: 'Carlos Mendoza Rivera',
    equipos_desplegados: 3,
    personas_evacuadas: 145,
    heridos: 2,
    desaparecidos: 0,
    notas: 'Evacuación en progreso. Personal desplegado en 3 zonas críticas.',
  },
  {
    id: '2',
    titulo: 'Respuesta SOS Pedro Quispe',
    evento: 'M6.2 Costa Central',
    fecha: '2026-08-11T19:42:00Z',
    estado: 'activo',
    prioridad: 'critica',
    coordinador: 'Ana Villanueva Cruz',
    equipos_desplegados: 1,
    personas_evacuadas: 0,
    heridos: 1,
    desaparecidos: 0,
    notas: 'Brigadista activó SOS. Equipo paramédico en camino. Última ubicación: -12.053, -77.041.',
  },
  {
    id: '3',
    titulo: 'Verificación Zona Cañete',
    evento: 'M4.2 Cañete',
    fecha: '2026-08-11T17:00:00Z',
    estado: 'cerrado',
    prioridad: 'media',
    coordinador: 'Rosa Díaz Vargas',
    equipos_desplegados: 1,
    personas_evacuadas: 30,
    heridos: 0,
    desaparecidos: 0,
    notas: 'Zona verificada. Sin daños estructurales significativos. Personal retornado a base.',
  },
  {
    id: '4',
    titulo: 'Operación SAR Arequipa',
    evento: 'M7.1 Arequipa',
    fecha: '2026-08-09T09:00:00Z',
    estado: 'cerrado',
    prioridad: 'critica',
    coordinador: 'Jorge Paredes Soto',
    equipos_desplegados: 5,
    personas_evacuadas: 520,
    heridos: 18,
    desaparecidos: 2,
    notas: 'Operación finalizada. Todos los desaparecidos localizados. Heridos transferidos al Hospital Regional.',
  },
];

const estadoConfig: Record<string, { color: string; bg: string; label: string }> = {
  activo: { color: 'text-green-400', bg: 'bg-green-500', label: 'Activo' },
  cerrado: { color: 'text-gray-400', bg: 'bg-gray-500', label: 'Cerrado' },
  pendiente: { color: 'text-yellow-400', bg: 'bg-yellow-500', label: 'Pendiente' },
};

const prioridadConfig: Record<string, { color: string; label: string }> = {
  critica: { color: 'text-red-400', label: '🔴 Crítica' },
  alta: { color: 'text-orange-400', label: '🟠 Alta' },
  media: { color: 'text-yellow-400', label: '🟡 Media' },
  baja: { color: 'text-green-400', label: '🟢 Baja' },
};

export default function ReportesPage() {
  const [filtro, setFiltro] = useState('todos');

  const filtrados = filtro === 'todos' ? reportesDemo : reportesDemo.filter(r => r.estado === filtro);

  const statsActivos = reportesDemo.filter(r => r.estado === 'activo').length;
  const totalEvacuados = reportesDemo.reduce((acc, r) => acc + r.personas_evacuadas, 0);
  const totalHeridos = reportesDemo.reduce((acc, r) => acc + r.heridos, 0);

  return (
    <>
      <header className="sticky top-0 z-10 bg-[#0a0f1a]/80 backdrop-blur-lg border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Reportes SAR</h2>
          <p className="text-xs text-gray-500">Búsqueda, rescate y respuesta a emergencias</p>
        </div>
        <button className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-xs font-medium transition">
          + Nuevo Reporte SAR
        </button>
      </header>

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl p-4 bg-gradient-to-br from-green-600/20 to-green-800/10 border border-green-500/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xl">🚨</span>
              <span className="text-2xl font-bold text-green-400">{statsActivos}</span>
            </div>
            <p className="text-xs text-gray-400">Operaciones Activas</p>
          </div>
          <div className="rounded-2xl p-4 bg-gradient-to-br from-blue-600/20 to-blue-800/10 border border-blue-500/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xl">🏃</span>
              <span className="text-2xl font-bold text-blue-400">{totalEvacuados}</span>
            </div>
            <p className="text-xs text-gray-400">Personas Evacuadas</p>
          </div>
          <div className="rounded-2xl p-4 bg-gradient-to-br from-orange-600/20 to-orange-800/10 border border-orange-500/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xl">🏥</span>
              <span className="text-2xl font-bold text-orange-400">{totalHeridos}</span>
            </div>
            <p className="text-xs text-gray-400">Heridos Atendidos</p>
          </div>
          <div className="rounded-2xl p-4 bg-gradient-to-br from-purple-600/20 to-purple-800/10 border border-purple-500/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xl">👥</span>
              <span className="text-2xl font-bold text-purple-400">{reportesDemo.reduce((acc, r) => acc + r.equipos_desplegados, 0)}</span>
            </div>
            <p className="text-xs text-gray-400">Equipos Desplegados</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          {['todos', 'activo', 'cerrado'].map(f => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                filtro === f ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              {f === 'todos' ? 'Todos' : estadoConfig[f]?.label}
            </button>
          ))}
        </div>

        {/* Reports */}
        <div className="space-y-4">
          {filtrados.map(reporte => {
            const estado = estadoConfig[reporte.estado];
            const prioridad = prioridadConfig[reporte.prioridad];
            const fecha = new Date(reporte.fecha);
            return (
              <div key={reporte.id} className="glass rounded-2xl p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-bold">{reporte.titulo}</h3>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${estado.color} bg-white/5`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${estado.bg}`} />
                        {estado.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">Evento: {reporte.evento} · Coordinador: {reporte.coordinador}</p>
                    <p className="text-[10px] text-gray-600 mt-1">
                      {fecha.toLocaleDateString('es-PE')} {fecha.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <span className={`text-xs font-medium ${prioridad.color}`}>{prioridad.label}</span>
                </div>

                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div className="text-center p-2 rounded-lg bg-white/5">
                    <p className="text-lg font-bold text-blue-400">{reporte.equipos_desplegados}</p>
                    <p className="text-[10px] text-gray-500">Equipos</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-white/5">
                    <p className="text-lg font-bold text-green-400">{reporte.personas_evacuadas}</p>
                    <p className="text-[10px] text-gray-500">Evacuados</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-white/5">
                    <p className="text-lg font-bold text-orange-400">{reporte.heridos}</p>
                    <p className="text-[10px] text-gray-500">Heridos</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-white/5">
                    <p className="text-lg font-bold text-red-400">{reporte.desaparecidos}</p>
                    <p className="text-[10px] text-gray-500">Desaparecidos</p>
                  </div>
                </div>

                <p className="text-xs text-gray-400 bg-white/[0.02] rounded-lg p-3 border-l-2 border-blue-500/30">
                  {reporte.notas}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
