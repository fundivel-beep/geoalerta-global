'use client';

import { useState } from 'react';

const personalData = [
  { id: '1', nombre: 'Carlos Mendoza Rivera', cargo: 'Coordinador de Campo', zona: 'Lima Centro', estado: 'seguro', contacto: 'Hace 2 min', bat: 85, lat: -12.046, lng: -77.042, telefono: '+51 987 654 321', email: 'cmendoza@fundivel.org' },
  { id: '2', nombre: 'María Gutiérrez López', cargo: 'Técnica en Emergencias', zona: 'Lima Sur', estado: 'seguro', contacto: 'Hace 5 min', bat: 72, lat: -12.048, lng: -77.038, telefono: '+51 987 654 322', email: 'mgutierrez@fundivel.org' },
  { id: '3', nombre: 'Jorge Paredes Soto', cargo: 'Brigadista', zona: 'Callao', estado: 'sin_respuesta', contacto: 'Hace 18 min', bat: 45, lat: -12.051, lng: -77.045, telefono: '+51 987 654 323', email: 'jparedes@fundivel.org' },
  { id: '4', nombre: 'Ana Villanueva Cruz', cargo: 'Paramédica', zona: 'Lima Norte', estado: 'seguro', contacto: 'Hace 1 min', bat: 93, lat: -12.044, lng: -77.040, telefono: '+51 987 654 324', email: 'avillanueva@fundivel.org' },
  { id: '5', nombre: 'Roberto Chávez Díaz', cargo: 'Logística', zona: 'Ventanilla', estado: 'sin_senal', contacto: 'Hace 2 horas', bat: null, lat: null, lng: null, telefono: '+51 987 654 325', email: 'rchavez@fundivel.org' },
  { id: '6', nombre: 'Laura Fernández Rojas', cargo: 'Comunicaciones', zona: 'Miraflores', estado: 'seguro', contacto: 'Hace 3 min', bat: 68, lat: -12.049, lng: -77.036, telefono: '+51 987 654 326', email: 'lfernandez@fundivel.org' },
  { id: '7', nombre: 'Pedro Quispe Huamán', cargo: 'Brigadista Senior', zona: 'San Juan de Lurigancho', estado: 'sos', contacto: 'Hace 1 min', bat: 23, lat: -12.053, lng: -77.041, telefono: '+51 987 654 327', email: 'pquispe@fundivel.org' },
  { id: '8', nombre: 'Rosa Díaz Vargas', cargo: 'Coordinadora Zonal', zona: 'Surco', estado: 'seguro', contacto: 'Hace 4 min', bat: 91, lat: -12.047, lng: -77.043, telefono: '+51 987 654 328', email: 'rdiaz@fundivel.org' },
];

const estadoConfig: Record<string, { color: string; bg: string; label: string }> = {
  seguro: { color: 'text-green-400', bg: 'bg-green-500', label: 'Seguro' },
  sos: { color: 'text-red-400', bg: 'bg-red-500', label: 'SOS' },
  sin_respuesta: { color: 'text-orange-400', bg: 'bg-orange-500', label: 'Sin respuesta' },
  sin_senal: { color: 'text-gray-400', bg: 'bg-gray-500', label: 'Sin señal' },
};

export default function PersonalPage() {
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [seleccionado, setSeleccionado] = useState<string | null>(null);

  const filtrados = personalData.filter(p => {
    const matchBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.cargo.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.zona.toLowerCase().includes(busqueda.toLowerCase());
    const matchEstado = filtroEstado === 'todos' || p.estado === filtroEstado;
    return matchBusqueda && matchEstado;
  });

  const personaSeleccionada = personalData.find(p => p.id === seleccionado);

  return (
    <>
      <header className="sticky top-0 z-10 bg-[#0a0f1a]/80 backdrop-blur-lg border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Gestión de Personal</h2>
          <p className="text-xs text-gray-500">{personalData.length} miembros registrados</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-xs font-medium transition">
          + Agregar Personal
        </button>
      </header>

      <div className="p-6">
        <div className="flex gap-4 mb-6">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar por nombre, cargo o zona..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
            />
          </div>
          {/* Filter */}
          <div className="flex gap-1.5">
            {['todos', 'seguro', 'sos', 'sin_respuesta', 'sin_senal'].map(f => (
              <button
                key={f}
                onClick={() => setFiltroEstado(f)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition ${
                  filtroEstado === f ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:text-white'
                }`}
              >
                {f === 'todos' ? 'Todos' : estadoConfig[f]?.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Table */}
          <div className="lg:col-span-2 glass rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-4 py-3 text-[10px] text-gray-500 font-medium uppercase">Nombre</th>
                  <th className="text-left px-4 py-3 text-[10px] text-gray-500 font-medium uppercase">Cargo</th>
                  <th className="text-left px-4 py-3 text-[10px] text-gray-500 font-medium uppercase">Zona</th>
                  <th className="text-left px-4 py-3 text-[10px] text-gray-500 font-medium uppercase">Estado</th>
                  <th className="text-left px-4 py-3 text-[10px] text-gray-500 font-medium uppercase">Batería</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map(p => {
                  const cfg = estadoConfig[p.estado] || estadoConfig.sin_senal;
                  return (
                    <tr
                      key={p.id}
                      onClick={() => setSeleccionado(p.id)}
                      className={`border-b border-white/5 cursor-pointer transition ${
                        seleccionado === p.id ? 'bg-blue-600/10' : 'hover:bg-white/5'
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-[9px] font-bold">
                            {p.nombre.split(' ').map(n => n[0]).slice(0, 2).join('')}
                          </div>
                          <span className="text-xs font-medium">{p.nombre}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400">{p.cargo}</td>
                      <td className="px-4 py-3 text-xs text-gray-400">{p.zona}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${cfg.color} bg-white/5`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.bg}`} />
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400">
                        {p.bat !== null ? `${p.bat}%` : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Detail panel */}
          <div className="glass rounded-2xl p-5">
            {personaSeleccionada ? (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-xl font-bold mx-auto mb-3">
                    {personaSeleccionada.nombre.split(' ').map(n => n[0]).slice(0, 2).join('')}
                  </div>
                  <h3 className="text-sm font-bold">{personaSeleccionada.nombre}</h3>
                  <p className="text-xs text-gray-500">{personaSeleccionada.cargo}</p>
                </div>

                <div className="space-y-3 pt-3 border-t border-white/5">
                  <InfoRow label="Estado" value={estadoConfig[personaSeleccionada.estado]?.label || '—'} />
                  <InfoRow label="Zona" value={personaSeleccionada.zona} />
                  <InfoRow label="Último contacto" value={personaSeleccionada.contacto} />
                  <InfoRow label="Batería" value={personaSeleccionada.bat !== null ? `${personaSeleccionada.bat}%` : 'Sin datos'} />
                  <InfoRow label="Teléfono" value={personaSeleccionada.telefono} />
                  <InfoRow label="Email" value={personaSeleccionada.email} />
                  {personaSeleccionada.lat && (
                    <InfoRow label="Ubicación" value={`${personaSeleccionada.lat}, ${personaSeleccionada.lng}`} />
                  )}
                </div>

                <div className="pt-3 border-t border-white/5 space-y-2">
                  <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-xs font-medium transition">
                    📍 Ver en mapa
                  </button>
                  <button className="w-full py-2 bg-orange-600 hover:bg-orange-700 rounded-lg text-xs font-medium transition">
                    📞 Contactar
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-center py-12">
                <div>
                  <p className="text-2xl mb-2">👤</p>
                  <p className="text-xs text-gray-500">Selecciona un miembro para ver detalles</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-[10px] text-gray-500">{label}</span>
      <span className="text-xs font-medium">{value}</span>
    </div>
  );
}
