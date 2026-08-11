'use client';

import { useState } from 'react';

interface Miembro {
  id: string;
  nombre: string;
  apellidos: string;
  estado: 'seguro' | 'peligro' | 'sin_respuesta' | 'sin_senal';
  ultimo_contacto: string;
  bateria?: number;
}

// Datos de demostración
const miembrosDemo: Miembro[] = [
  { id: '1', nombre: 'Carlos', apellidos: 'Mendoza Rivera', estado: 'seguro', ultimo_contacto: 'Hace 2 min', bateria: 85 },
  { id: '2', nombre: 'María', apellidos: 'Gutiérrez López', estado: 'seguro', ultimo_contacto: 'Hace 5 min', bateria: 72 },
  { id: '3', nombre: 'Jorge', apellidos: 'Paredes Soto', estado: 'sin_respuesta', ultimo_contacto: 'Hace 18 min', bateria: 45 },
  { id: '4', nombre: 'Ana', apellidos: 'Villanueva Cruz', estado: 'seguro', ultimo_contacto: 'Hace 1 min', bateria: 93 },
  { id: '5', nombre: 'Roberto', apellidos: 'Chávez Díaz', estado: 'sin_senal', ultimo_contacto: 'Hace 2 horas', bateria: undefined },
  { id: '6', nombre: 'Laura', apellidos: 'Fernández Rojas', estado: 'seguro', ultimo_contacto: 'Hace 3 min', bateria: 68 },
];

const estadoConfig = {
  seguro: { color: 'bg-green-500', label: 'Seguro', textColor: 'text-green-400' },
  peligro: { color: 'bg-red-500', label: 'SOS', textColor: 'text-red-400' },
  sin_respuesta: { color: 'bg-orange-500', label: 'Sin respuesta', textColor: 'text-orange-400' },
  sin_senal: { color: 'bg-gray-500', label: 'Sin señal', textColor: 'text-gray-400' },
};

export default function EquipoPage() {
  const [filtro, setFiltro] = useState<string>('todos');

  const miembrosFiltrados = filtro === 'todos'
    ? miembrosDemo
    : miembrosDemo.filter((m) => m.estado === filtro);

  const conteo = {
    total: miembrosDemo.length,
    seguro: miembrosDemo.filter((m) => m.estado === 'seguro').length,
    sin_respuesta: miembrosDemo.filter((m) => m.estado === 'sin_respuesta').length,
    sin_senal: miembrosDemo.filter((m) => m.estado === 'sin_senal').length,
  };

  return (
    <main className="min-h-[100dvh] px-4 pt-14 pb-8 safe-top safe-bottom">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <a href="/" className="w-10 h-10 rounded-xl glass flex items-center justify-center text-lg">←</a>
          <div>
            <h1 className="text-xl font-bold">Equipo FUNDIVEL</h1>
            <p className="text-xs text-gray-400">{conteo.total} miembros registrados</p>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          <div className="glass rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-green-400">{conteo.seguro}</p>
            <p className="text-[10px] text-gray-400">Seguros</p>
          </div>
          <div className="glass rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-orange-400">{conteo.sin_respuesta}</p>
            <p className="text-[10px] text-gray-400">Sin respuesta</p>
          </div>
          <div className="glass rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-gray-400">{conteo.sin_senal}</p>
            <p className="text-[10px] text-gray-400">Sin señal</p>
          </div>
        </div>

        {/* Filter pills */}
        <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar pb-1">
          {[
            { key: 'todos', label: 'Todos' },
            { key: 'seguro', label: '🟢 Seguros' },
            { key: 'sin_respuesta', label: '🟠 Sin respuesta' },
            { key: 'sin_senal', label: '⚪ Sin señal' },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFiltro(f.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                filtro === f.key
                  ? 'bg-blue-600 text-white'
                  : 'glass text-gray-300 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Member list */}
        <div className="space-y-2">
          {miembrosFiltrados.map((miembro) => {
            const config = estadoConfig[miembro.estado];
            return (
              <div key={miembro.id} className="glass rounded-2xl p-4 flex items-center gap-3 transition-all hover:scale-[1.01] active:scale-[0.99]">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-sm font-bold">
                    {miembro.nombre[0]}{miembro.apellidos[0]}
                  </div>
                  <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full ${config.color} ring-2 ring-gray-900`} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{miembro.nombre} {miembro.apellidos}</p>
                  <p className="text-xs text-gray-400">{miembro.ultimo_contacto}</p>
                </div>

                {/* Right side */}
                <div className="flex-shrink-0 text-right">
                  <p className={`text-xs font-medium ${config.textColor}`}>{config.label}</p>
                  {miembro.bateria !== undefined && (
                    <p className="text-[10px] text-gray-500 mt-0.5">🔋 {miembro.bateria}%</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty state */}
        {miembrosFiltrados.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-sm">No hay miembros con este filtro</p>
          </div>
        )}
      </div>
    </main>
  );
}
