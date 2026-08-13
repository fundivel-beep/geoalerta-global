'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

type Personal = {
  id: string;
  nombre: string;
  estado: string;
  ultimoContacto: string;
  bat: number | null;
  cargo: string;
  zona: string;
};

const estadoConfig: Record<string, { color: string; label: string; textColor: string }> = {
  seguro: { color: 'bg-green-500', label: 'Seguro', textColor: 'text-green-400' },
  sos: { color: 'bg-red-500', label: 'SOS', textColor: 'text-red-400' },
  sin_respuesta: { color: 'bg-orange-500', label: 'Sin respuesta', textColor: 'text-orange-400' },
  sin_senal: { color: 'bg-gray-500', label: 'Sin señal', textColor: 'text-gray-400' },
};

export default function EquipoPage() {
  const [personal, setPersonal] = useState<Personal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('todos');

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'personal'), (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Personal));
      setPersonal(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const filtrados = filtro === 'todos' ? personal : personal.filter(m => m.estado === filtro);

  const conteo = {
    total: personal.length,
    seguro: personal.filter(m => m.estado === 'seguro').length,
    sos: personal.filter(m => m.estado === 'sos').length,
    sin_respuesta: personal.filter(m => m.estado === 'sin_respuesta').length,
    sin_senal: personal.filter(m => m.estado === 'sin_senal').length,
  };

  return (
    <main className="min-h-[100dvh] px-4 pt-14 pb-8 safe-top safe-bottom">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <a href="/" className="w-10 h-10 rounded-xl glass flex items-center justify-center text-lg">←</a>
          <div>
            <h1 className="text-xl font-bold">Equipo FUNDIVEL</h1>
            <p className="text-xs text-gray-400">{conteo.total} miembros registrados</p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 mb-5">
          <div className="glass rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-blue-400">{conteo.total}</p>
            <p className="text-[10px] text-gray-400">Total</p>
          </div>
          <div className="glass rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-green-400">{conteo.seguro}</p>
            <p className="text-[10px] text-gray-400">Seguros</p>
          </div>
          <div className="glass rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-orange-400">{conteo.sin_respuesta}</p>
            <p className="text-[10px] text-gray-400">Sin resp.</p>
          </div>
          <div className="glass rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-red-400">{conteo.sos}</p>
            <p className="text-[10px] text-gray-400">SOS</p>
          </div>
        </div>

        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {[
            { key: 'todos', label: 'Todos' },
            { key: 'seguro', label: '🟢 Seguros' },
            { key: 'sos', label: '🔴 SOS' },
            { key: 'sin_respuesta', label: '🟠 Sin respuesta' },
            { key: 'sin_senal', label: '⚪ Sin señal' },
          ].map(f => (
            <button key={f.key} onClick={() => setFiltro(f.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                filtro === f.key ? 'bg-blue-600 text-white' : 'glass text-gray-300 hover:text-white'
              }`}>
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin mx-auto mb-3" />
              <p className="text-xs text-gray-500">Cargando equipo...</p>
            </div>
          </div>
        ) : filtrados.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-3xl mb-3">👥</p>
            <p className="text-gray-500 text-sm">
              {personal.length === 0 ? 'Aún no hay miembros registrados' : 'No hay miembros con este filtro'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtrados.map(miembro => {
              const cfg = (estadoConfig[miembro.estado] ?? estadoConfig['sin_senal'])!;
              const initials = miembro.nombre?.split(' ').map(n => n[0]).slice(0, 2).join('') || '?';
              return (
                <div key={miembro.id} className="glass rounded-2xl p-4 flex items-center gap-3 transition-all hover:scale-[1.01] active:scale-[0.99]">
                  <div className="relative flex-shrink-0">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-sm font-bold">
                      {initials}
                    </div>
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full ${cfg.color} ring-2 ring-gray-900`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{miembro.nombre}</p>
                    <p className="text-xs text-gray-400">{miembro.cargo || 'Sin cargo asignado'} · {miembro.ultimoContacto || '—'}</p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className={`text-xs font-medium ${cfg.textColor}`}>{cfg.label}</p>
                    {miembro.bat !== null && miembro.bat !== undefined && (
                      <p className="text-[10px] text-gray-500 mt-0.5">🔋 {miembro.bat}%</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
