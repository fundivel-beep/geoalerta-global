'use client';

const fuentesData = [
  {
    id: '1',
    nombre: 'USGS Earthquake Hazards',
    siglas: 'USGS',
    tipo: 'API REST',
    url: 'https://earthquake.usgs.gov/fdsnws/event/1/',
    estado: 'activa',
    ultimaConsulta: '2026-08-11T19:30:00Z',
    eventosHoy: 12,
    latencia: '1.2s',
    cobertura: 'Global',
    descripcion: 'United States Geological Survey — Servicio de datos sísmicos globales en tiempo real.',
  },
  {
    id: '2',
    nombre: 'European-Mediterranean Seismological Centre',
    siglas: 'EMSC',
    tipo: 'API REST',
    url: 'https://www.seismicportal.eu/fdsnws/event/1/',
    estado: 'activa',
    ultimaConsulta: '2026-08-11T19:28:00Z',
    eventosHoy: 8,
    latencia: '2.1s',
    cobertura: 'Europa + Mediterráneo + Global (M4+)',
    descripcion: 'Centro Sismológico Euro-Mediterráneo — Detección rápida de terremotos significativos.',
  },
  {
    id: '3',
    nombre: 'Instituto Geofísico del Perú',
    siglas: 'IGP',
    tipo: 'Web Scraping',
    url: 'https://ultimosismo.igp.gob.pe/',
    estado: 'activa',
    ultimaConsulta: '2026-08-11T19:25:00Z',
    eventosHoy: 5,
    latencia: '4.5s',
    cobertura: 'Perú',
    descripcion: 'Instituto Geofísico del Perú — Monitoreo local de actividad sísmica nacional.',
  },
  {
    id: '4',
    nombre: 'GeoNet New Zealand',
    siglas: 'GNS',
    tipo: 'API REST',
    url: 'https://api.geonet.org.nz/',
    estado: 'inactiva',
    ultimaConsulta: '2026-08-10T12:00:00Z',
    eventosHoy: 0,
    latencia: '—',
    cobertura: 'Nueva Zelanda + Pacífico',
    descripcion: 'GeoNet — Red sísmica de Nueva Zelanda. Desactivada por no estar en zona de interés.',
  },
  {
    id: '5',
    nombre: 'Japan Meteorological Agency',
    siglas: 'JMA',
    tipo: 'WebSocket',
    url: 'wss://earthquake.jma.go.jp/',
    estado: 'error',
    ultimaConsulta: '2026-08-11T15:00:00Z',
    eventosHoy: 0,
    latencia: '—',
    cobertura: 'Japón + Pacífico Oeste',
    descripcion: 'Agencia Meteorológica de Japón — Error de conexión desde hace 4 horas.',
  },
];

const estadoConfig: Record<string, { color: string; bg: string; label: string; icon: string }> = {
  activa: { color: 'text-green-400', bg: 'bg-green-500', label: 'Activa', icon: '🟢' },
  inactiva: { color: 'text-gray-400', bg: 'bg-gray-500', label: 'Inactiva', icon: '⚪' },
  error: { color: 'text-red-400', bg: 'bg-red-500', label: 'Error', icon: '🔴' },
};

export default function FuentesPage() {
  const activas = fuentesData.filter(f => f.estado === 'activa').length;
  const totalEventosHoy = fuentesData.reduce((acc, f) => acc + f.eventosHoy, 0);

  return (
    <>
      <header className="sticky top-0 z-10 bg-[#0a0f1a]/80 backdrop-blur-lg border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Fuentes Sísmicas</h2>
          <p className="text-xs text-gray-500">Monitoreo multiagencia — APIs y servicios conectados</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-xs font-medium transition">
          + Agregar Fuente
        </button>
      </header>

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-2xl p-4 bg-gradient-to-br from-green-600/20 to-green-800/10 border border-green-500/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xl">📡</span>
              <span className="text-2xl font-bold text-green-400">{activas}</span>
            </div>
            <p className="text-xs text-gray-400">Fuentes Activas</p>
          </div>
          <div className="rounded-2xl p-4 bg-gradient-to-br from-blue-600/20 to-blue-800/10 border border-blue-500/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xl">🌍</span>
              <span className="text-2xl font-bold text-blue-400">{totalEventosHoy}</span>
            </div>
            <p className="text-xs text-gray-400">Eventos Hoy</p>
          </div>
          <div className="rounded-2xl p-4 bg-gradient-to-br from-red-600/20 to-red-800/10 border border-red-500/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xl">⚠️</span>
              <span className="text-2xl font-bold text-red-400">{fuentesData.filter(f => f.estado === 'error').length}</span>
            </div>
            <p className="text-xs text-gray-400">Con Error</p>
          </div>
        </div>

        {/* Sources */}
        <div className="space-y-4">
          {fuentesData.map(fuente => {
            const estado = estadoConfig[fuente.estado];
            const ultima = new Date(fuente.ultimaConsulta);
            return (
              <div key={fuente.id} className="glass rounded-2xl p-5 hover:bg-white/[0.03] transition">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-sm font-bold text-blue-400">
                      {fuente.siglas}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold mb-0.5">{fuente.nombre}</h3>
                      <p className="text-xs text-gray-500">{fuente.descripcion}</p>
                      <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-500">
                        <span>🔗 {fuente.tipo}</span>
                        <span>🌐 {fuente.cobertura}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium ${estado.color} bg-white/5`}>
                      {estado.icon} {estado.label}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-3 mt-4 pt-4 border-t border-white/5">
                  <div>
                    <p className="text-[10px] text-gray-500 mb-0.5">Última consulta</p>
                    <p className="text-xs font-medium">{ultima.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 mb-0.5">Eventos hoy</p>
                    <p className="text-xs font-medium">{fuente.eventosHoy}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 mb-0.5">Latencia</p>
                    <p className="text-xs font-medium">{fuente.latencia}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 mb-0.5">Endpoint</p>
                    <p className="text-xs font-medium text-blue-400 truncate">{fuente.url}</p>
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
