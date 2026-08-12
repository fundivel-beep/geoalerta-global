'use client';

import { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function RecuperarPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setSent(true);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'code' in err) {
        const code = (err as { code: string }).code;
        if (code === 'auth/user-not-found') {
          // Don't reveal if user exists
          setSent(true);
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

  if (sent) {
    return (
      <main className="flex items-center justify-center min-h-[100dvh] p-4">
        <div className="glass-strong rounded-3xl p-8 max-w-sm w-full text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-3xl mb-4">📬</div>
          <h2 className="text-xl font-bold mb-2">Correo enviado</h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            Si <span className="text-white font-medium">{email}</span> está registrado,
            recibirás un enlace para restablecer tu contraseña.
          </p>
          <p className="text-gray-500 text-xs mt-3">Revisa también tu carpeta de spam.</p>
          <a href="/login" className="inline-block mt-6 px-6 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition">
            Volver al Login
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="flex items-center justify-center min-h-[100dvh] p-4 relative overflow-hidden">
      <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-600/15 rounded-full blur-[100px]" />
      <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-purple-600/10 rounded-full blur-[100px]" />

      <form onSubmit={handleSubmit} className="relative glass-strong rounded-3xl p-6 sm:p-8 max-w-sm w-full space-y-5">
        <div className="text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-2xl mb-3">🔑</div>
          <h1 className="text-xl sm:text-2xl font-bold">Recuperar Contraseña</h1>
          <p className="text-gray-400 text-sm mt-1">Te enviaremos un enlace de recuperación</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-300 text-sm p-3 rounded-xl">
            <span>⚠️</span><span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-xs text-gray-400 mb-1.5 font-medium">Correo electrónico</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition text-sm"
            placeholder="tu@email.com" />
        </div>

        <button type="submit" disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg shadow-blue-600/25 active:scale-[0.98]">
          {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
        </button>

        <p className="text-center text-sm text-gray-500">
          <a href="/login" className="text-blue-400 hover:text-blue-300 font-medium transition">← Volver al login</a>
        </p>
      </form>
    </main>
  );
}
