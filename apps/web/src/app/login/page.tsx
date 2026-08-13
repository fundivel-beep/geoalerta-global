'use client';

import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, form.email, form.password);
      const user = userCredential.user;
      const token = await user.getIdToken();

      // Check if Firestore profile exists — create it if not (for users registered before this update)
      const profileRef = doc(db, 'personal', user.uid);
      const profileSnap = await getDoc(profileRef);
      if (!profileSnap.exists()) {
        const nombre = user.displayName || user.email?.split('@')[0] || 'Usuario';
        await setDoc(profileRef, {
          uid: user.uid,
          nombre,
          nombre_corto: nombre.split(' ')[0],
          apellidos: nombre.split(' ').slice(1).join(' '),
          email: user.email,
          cargo: '',
          zona: '',
          telefono: '',
          estado: 'sin_senal',
          bat: null,
          lat: null,
          lng: null,
          ultimoContacto: 'Recién sincronizado',
          creadoEn: serverTimestamp(),
          activo: true,
        });
      }

      localStorage.setItem('access_token', token);
      localStorage.setItem('user', JSON.stringify({
        id: user.uid,
        email: user.email,
        nombre: user.displayName || user.email,
      }));
      window.location.href = '/';
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'code' in err) {
        const code = (err as { code: string }).code;
        if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
          setError('Credenciales incorrectas');
        } else if (code === 'auth/too-many-requests') {
          setError('Demasiados intentos. Espera unos minutos.');
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

  return (
    <main className="flex items-center justify-center min-h-[100dvh] p-4 relative overflow-hidden">
      <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-600/15 rounded-full blur-[100px]" />
      <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px]" />

      <form onSubmit={handleSubmit} className="relative glass-strong rounded-3xl p-6 sm:p-8 max-w-sm w-full space-y-5">
        <div className="text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-2xl mb-3">🌐</div>
          <h1 className="text-xl sm:text-2xl font-bold">Iniciar Sesión</h1>
          <p className="text-gray-400 text-sm mt-1">GeoAlerta — FUNDIVEL</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-300 text-sm p-3 rounded-xl">
            <span>⚠️</span><span>{error}</span>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5 font-medium">Correo electrónico</label>
            <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition text-sm"
              placeholder="tu@email.com" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5 font-medium">Contraseña</label>
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} required value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition text-sm"
                placeholder="Tu contraseña" />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition p-1"
                aria-label={showPassword ? 'Ocultar' : 'Mostrar'}>
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            <div className="flex justify-end mt-1.5">
              <a href="/recuperar" className="text-[11px] text-blue-400 hover:text-blue-300 transition">¿Olvidaste tu contraseña?</a>
            </div>
          </div>
        </div>

        <button type="submit" disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg shadow-blue-600/25 active:scale-[0.98]">
          {loading ? 'Ingresando...' : 'Iniciar Sesión'}
        </button>

        <p className="text-center text-sm text-gray-500">
          ¿No tienes cuenta?{' '}
          <a href="/registro" className="text-blue-400 hover:text-blue-300 font-medium transition">Regístrate</a>
        </p>
      </form>
    </main>
  );
}
