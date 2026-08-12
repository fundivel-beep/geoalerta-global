'use client';

import { useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase-client';

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
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });

      if (error) {
        setError('Credenciales incorrectas');
      } else {
        localStorage.setItem('access_token', data.session.access_token);
        localStorage.setItem('refresh_token', data.session.refresh_token);
        localStorage.setItem('user', JSON.stringify({
          id: data.user.id,
          email: data.user.email,
          nombre: data.user.user_metadata?.nombre || data.user.email,
        }));
        window.location.href = '/';
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error de conexión';
      setError(message);
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
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-2xl mb-3">
            🌐
          </div>
          <h1 className="text-xl sm:text-2xl font-bold">Iniciar Sesión</h1>
          <p className="text-gray-400 text-sm mt-1">GeoAlerta — FUNDIVEL</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-300 text-sm p-3 rounded-xl">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5 font-medium">Correo electrónico</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition text-sm"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1.5 font-medium">Contraseña</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition text-sm"
                placeholder="Tu contraseña"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition p-1"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
            <div className="flex justify-end mt-1.5">
              <a href="/recuperar" className="text-[11px] text-blue-400 hover:text-blue-300 transition">
                ¿Olvidaste tu contraseña?
              </a>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg shadow-blue-600/25 hover:shadow-blue-500/40 active:scale-[0.98]"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              Ingresando...
            </span>
          ) : 'Iniciar Sesión'}
        </button>

        <p className="text-center text-sm text-gray-500">
          ¿No tienes cuenta?{' '}
          <a href="/registro" className="text-blue-400 hover:text-blue-300 font-medium transition">Regístrate</a>
        </p>
      </form>
    </main>
  );
}
