'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

type Personal = {
  id: string;
  nombre: string;
  cargo: string;
  zona: string;
  estado: string;
  bat: number | null;
  lat: number | null;
  lng: number | null;
  telefono: string;
  email: string;
  ultimoContacto: string;
};

const estadoConfig: Record<string, { color: string; bg: string; label: string }> = {
  seguro: { color: 'text-green-400', bg: 'bg-green-500', label: 'Seguro' },
  sos: { color: 'text-red-400', bg: 'bg-red-500', label: 'SOS' },
  sin_respuesta: { color: 'text-orange-400', bg: 'bg-orange-500', label: 'Sin respuesta' },
  sin_senal: { color: 'text-gray-400', bg: 'bg-gray-500', label: 'Sin señal' },
};

const defaultForm = { nombre: '', cargo: '', zona: '', telefono: '', email: '', estado: 'seguro' };

export default function PersonalPage() {
  const [personal, setPersonal] = useState<Personal[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [seleccionado, setSeleccionado] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'personal'), (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Personal));
      setPersonal(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const filtrados = personal.filter(p => {
    const matchBusqueda = p.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.cargo?.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.zona?.toLowerCase().includes(busqueda.toLowerCase());
    const matchEstado = filtroEstado === 'todos' || p.estado === filtroEstado;
    return matchBusqueda && matchEstado;
  });

  const personaSeleccionada = personal.find(p => p.id === seleccionado);

  const handleSave = async () => {
    if (!form.nombre.trim()) return;
    setSaving(true);
    try {
      if (editandoId) {
        await updateDoc(doc(db, 'personal', editandoId), { ...form });
      } else {
        await addDoc(collection(db, 'personal'), {
          ...form,
          bat: null, lat: null, lng: null,
          ultimoContacto: 'Recién registrado',
          creadoEn: serverTimestamp(),
        });
      }
      setShowModal(false);
      setForm(defaultForm);
      setEditandoId(null);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (p: Personal) => {
    setForm({ nombre: p.nombre, cargo: p.cargo, zona: p.zona, telefono: p.telefono, email: p.email, estado: p.estado });
    setEditandoId(p.id);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este miembro del personal?')) return;
    await deleteDoc(doc(db, 'personal', id));
    if (seleccionado === id) setSeleccionado(null);
  };

  return (
    <>
      <header className="sticky top-0 z-10 bg-[#0a0f1a]/80 backdrop-blur-lg border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Gestión de Personal</h2>
          <p className="text-xs text-gray-500">{personal.length} miembros registrados</p>
        </div>
        <button onClick={() => { setForm(defaultForm); setEditandoId(null); setShowModal(true); }}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-xs font-medium transition">
          + Agregar Personal
        </button>
      </header>

      <div className="p-6">
        <div className="flex gap-4 mb-6 flex-wrap">
          <div className="flex-1 min-w-48">
            <input type="text" placeholder="Buscar por nombre, cargo o zona..."
              value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition" />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {['todos', 'seguro', 'sos', 'sin_respuesta', 'sin_senal'].map(f => (
              <button key={f} onClick={() => setFiltroEstado(f)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition ${filtroEstado === f ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:text-white'}`}>
                {f === 'todos' ? 'Todos' : estadoConfig[f]?.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin mx-auto mb-3" />
              <p className="text-xs text-gray-500">Cargando personal...</p>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 glass rounded-2xl overflow-hidden">
              {filtrados.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <p className="text-3xl mb-3">👥</p>
                  <p className="text-sm text-gray-400">No hay personal registrado</p>
                  <button onClick={() => { setForm(defaultForm); setEditandoId(null); setShowModal(true); }}
                    className="mt-4 px-4 py-2 bg-blue-600 rounded-lg text-xs font-medium">
                    + Agregar el primero
                  </button>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="text-left px-4 py-3 text-[10px] text-gray-500 font-medium uppercase">Nombre</th>
                      <th className="text-left px-4 py-3 text-[10px] text-gray-500 font-medium uppercase">Cargo</th>
                      <th className="text-left px-4 py-3 text-[10px] text-gray-500 font-medium uppercase">Estado</th>
                      <th className="text-left px-4 py-3 text-[10px] text-gray-500 font-medium uppercase">Acc.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtrados.map(p => {
                      const cfg = estadoConfig[p.estado] || estadoConfig.sin_senal;
                      return (
                        <tr key={p.id} onClick={() => setSeleccionado(p.id)}
                          className={`border-b border-white/5 cursor-pointer transition ${seleccionado === p.id ? 'bg-blue-600/10' : 'hover:bg-white/5'}`}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-[9px] font-bold flex-shrink-0">
                                {p.nombre?.split(' ').map(n => n[0]).slice(0, 2).join('')}
                              </div>
                              <span className="text-xs font-medium truncate">{p.nombre}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-400">{p.cargo}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${cfg.color} bg-white/5`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${cfg.bg}`} />{cfg.label}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                              <button onClick={() => handleEdit(p)} className="p-1 text-gray-400 hover:text-blue-400 transition text-xs">✏️</button>
                              <button onClick={() => handleDelete(p.id)} className="p-1 text-gray-400 hover:text-red-400 transition text-xs">🗑️</button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            <div className="glass rounded-2xl p-5">
              {personaSeleccionada ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-xl font-bold mx-auto mb-3">
                      {personaSeleccionada.nombre?.split(' ').map(n => n[0]).slice(0, 2).join('')}
                    </div>
                    <h3 className="text-sm font-bold">{personaSeleccionada.nombre}</h3>
                    <p className="text-xs text-gray-500">{personaSeleccionada.cargo}</p>
                  </div>
                  <div className="space-y-2 pt-3 border-t border-white/5 text-xs">
                    <InfoRow label="Estado" value={estadoConfig[personaSeleccionada.estado]?.label || '—'} />
                    <InfoRow label="Zona" value={personaSeleccionada.zona || '—'} />
                    <InfoRow label="Batería" value={personaSeleccionada.bat !== null ? `${personaSeleccionada.bat}%` : 'Sin datos'} />
                    <InfoRow label="Teléfono" value={personaSeleccionada.telefono || '—'} />
                    <InfoRow label="Email" value={personaSeleccionada.email || '—'} />
                  </div>
                  <div className="pt-3 border-t border-white/5 space-y-2">
                    <button onClick={() => handleEdit(personaSeleccionada)}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-xs font-medium transition">✏️ Editar</button>
                    <button onClick={() => handleDelete(personaSeleccionada.id)}
                      className="w-full py-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded-lg text-xs font-medium transition">🗑️ Eliminar</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-center py-12">
                  <div><p className="text-2xl mb-2">👤</p><p className="text-xs text-gray-500">Selecciona un miembro</p></div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-strong rounded-2xl p-6 w-full max-w-md space-y-4">
            <h3 className="text-sm font-bold">{editandoId ? 'Editar Personal' : 'Agregar Personal'}</h3>
            <div className="space-y-3">
              {[
                { label: 'Nombre completo', key: 'nombre', placeholder: 'Carlos Mendoza Rivera' },
                { label: 'Cargo', key: 'cargo', placeholder: 'Coordinador de Campo' },
                { label: 'Zona', key: 'zona', placeholder: 'Lima Centro' },
                { label: 'Teléfono', key: 'telefono', placeholder: '+51 987 654 321' },
                { label: 'Email', key: 'email', placeholder: 'carlos@fundivel.org' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-[10px] text-gray-400 mb-1">{f.label}</label>
                  <input type="text" value={form[f.key as keyof typeof form] as string}
                    onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    placeholder={f.placeholder}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs placeholder-gray-600 focus:outline-none focus:border-blue-500 transition" />
                </div>
              ))}
              <div>
                <label className="block text-[10px] text-gray-400 mb-1">Estado inicial</label>
                <select value={form.estado} onChange={e => setForm({ ...form, estado: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500 transition">
                  <option value="seguro">Seguro</option>
                  <option value="sin_senal">Sin señal</option>
                  <option value="sin_respuesta">Sin respuesta</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => { setShowModal(false); setForm(defaultForm); setEditandoId(null); }}
                className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-medium transition">Cancelar</button>
              <button onClick={handleSave} disabled={saving || !form.nombre.trim()}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl text-xs font-medium transition">
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-[10px] text-gray-500">{label}</span>
      <span className="text-xs font-medium truncate max-w-32">{value}</span>
    </div>
  );
}
