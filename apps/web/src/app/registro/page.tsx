'use client';

import { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export default function RegistroPage() {
  const [form, setForm] = useState({ email: '', nombre: '', apellidos: '', password: '', telefono: '', zona: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (form.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      setLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, form.email, form.password);
      const user = userCredential.user;

      await updateProfile(user, {
        displayName: `${form.nombre} ${form.apellidos}`,
      });

      await setDoc(doc(db, 'personal', user.uid), {
        uid: user.uid,
        nombre: `${form.nombre} ${form.apellidos}`,
        nombre_corto: form.nombre,
        apellidos: form.apellidos,
        email: form.email,
        telefono: form.telefono,
        zona: form.zona,
        cargo: '',
        estado: 'sin_senal',
        bat: null,
        lat: null,
        lng: null,
        ultimoContacto: 'Recién registrado',
        creadoEn: serverTimestamp(),
        activo: true,
      });

      setSuccess(true);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'code' in err) {
        const code = (err as { code: string }).code;
        if (code === 'auth/email-already-in-use') {
          setError('Este correo ya está registrado');
        } else if (code === 'auth/weak-password') {
          setError('La contraseña es muy débil');
        } else if (code === 'auth/invalid-email') {
          setError('Correo electrónico inválido');
        } else {
          setError(`Error: ${code}`);
        }
      } else {
        setError('Error de conexión. Intenta de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <main className="flex items-center justify-center min-h-[100dvh] p-4">
        <div className="glass-strong rounded-3xl p-8 max-w-sm w-full text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-3xl mb-4">
            ✅
          </div>
          <h2 className="text-xl font-bold mb-2">Cuenta creada</h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            Tu cuenta ha sido creada exitosamente. Ya puedes iniciar sesión y usar GeoAlerta.
          </p>
          <a href="/login" className="inline-block mt-6 px-6 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition">
            Ir a Login
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="flex items-center justify-center min-h-[100dvh] p-4 relative overflow-hidden">
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-600/15 rounded-full blur-[100px]" />
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-600/10 rounded-full blur-[100px]" />

      <form onSubmit={handleSubmit} className="relative glass-strong rounded-3xl p-6 sm:p-8 max-w-sm w-full space-y-4">
        <div className="text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-2xl mb-3">🌐</div>
          <h1 className="text-xl sm:text-2xl font-bold">Crear Cuenta</h1>
          <p className="text-gray-400 text-sm mt-1">GeoAlerta — FUNDIVEL</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-300 text-sm p-3 rounded-xl">
            <span>⚠️</span><span>{error}</span>
          </div>
        )}

        <div className="space-y-3">
          {/* Email */}
          <div>
            <label className="block text-xs text-gray-400 mb-1.5 font-medium">Correo electrónico</label>
            <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition text-sm"
              placeholder="tu@email.com" />
          </div>

          {/* Nombre + Apellidos */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1.5 font-medium">Nombre</label>
              <input type="text" required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5 font-medium">Apellidos</label>
              <input type="text" required value={form.apellidos} onChange={(e) => setForm({ ...form, apellidos: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition text-sm" />
            </div>
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-xs text-gray-400 mb-1.5 font-medium">Teléfono</label>
            <input type="tel" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition text-sm"
              placeholder="+51 987 654 321" />
          </div>

          {/* Zona */}
          <div>
            <label className="block text-xs text-gray-400 mb-1.5 font-medium">Zona / Distrito</label>
            <input type="text" value={form.zona} onChange={(e) => setForm({ ...form, zona: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition text-sm"
              placeholder="Ej: Lima Centro, Miraflores..." />
          </div>

          {/* Contraseña */}
          <div>
            <label className="block text-xs text-gray-400 mb-1.5 font-medium">Contraseña</label>
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} required minLength={8} value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition text-sm"
                placeholder="Mín. 8 caracteres" />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition p-1"
                aria-label={showPassword ? 'Ocultar' : 'Mostrar'}>
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>
        </div>

        <button type="submit" disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg shadow-blue-600/25 active:scale-[0.98]">
          {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
        </button>

        <p className="text-center text-sm text-gray-500">
          ¿Ya tienes cuenta?{' '}
          <a href="/login" className="text-blue-400 hover:text-blue-300 font-medium transition">Inicia sesión</a>
        </p>
      </form>
    </main>
  );
}
