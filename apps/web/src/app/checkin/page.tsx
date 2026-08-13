'use client';

import { useState, useEffect } from 'react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';

type EstadoCheckIn = 'a_salvo' | 'necesita_ayuda' | 'atrapado_en_peligro';

export default function CheckInPage() {
  const [submitted, setSubmitted] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<EstadoCheckIn | null>(null);
  const [loading, setLoading] = useState(false);
  const [uid, setUid] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setUid(user?.uid || null);
    });
    return () => unsub();
  }, []);

  const getBattery = async (): Promise<number | null> => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const nav = navigator as any;
      if ('getBattery' in nav) {
        const battery = await nav.getBattery();
        return Math.round(battery.level * 100);
      }
    } catch { /* no battery API */ }
    return null;
  };

  const getLocation = (): Promise<{ lat: number; lng: number } | null> => {
    return new Promise((resolve) => {
      if (!('geolocation' in navigator)) { resolve(null); return; }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => resolve(null),
        { enableHighAccuracy: true, timeout: 8000 }
      );
    });
  };

  const estadoMap: Record<EstadoCheckIn, string> = {
    a_salvo: 'seguro',
    necesita_ayuda: 'sin_respuesta',
    atrapado_en_peligro: 'sos',
  };

  const handleSelect = async (estado: EstadoCheckIn) => {
    setLoading(true);
    setError('');
    navigator.vibrate?.([100]);

    try {
      const [location, bat] = await Promise.all([getLocation(), getBattery()]);
      const now = new Date();
      const hora = now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });

      if (uid) {
        // Update Firestore if logged in
        await updateDoc(doc(db, 'personal', uid), {
          estado: estadoMap[estado],
          ultimoContacto: `Hoy ${hora}`,
          ultimoCheckin: serverTimestamp(),
          ...(location && { lat: location.lat, lng: location.lng }),
          ...(bat !== null && { bat }),
        });
      }

      setSelectedStatus(estado);
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setError('No se pudo enviar el reporte. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    const icons: Record<EstadoCheckIn, string> = {
      a_salvo: '✅',
      necesita_ayuda: '🟠',
      atrapado_en_peligro: '🔴',
    };
    const msgs: Record<EstadoCheckIn, string> = {
      a_salvo: 'Tu reporte fue enviado al centro de mando. Estás marcado como seguro.',
      necesita_ayuda: 'Tu reporte fue enviado. El equipo coordinador fue notificado.',
      atrapado_en_peligro: 'ALERTA enviada al centro de mando. Mantén el dispositivo activo.',
    };

    return (
      <main className="min-h-[100dvh] flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-4xl mb-5">
            {icons[selectedStatus!]}
          </div>
          <h2 className="text-xl font-bold mb-2">Estado registrado</h2>
          <p className="text-gray-400 text-sm mb-6">{msgs[selectedStatus!]}</p>
          {!uid && (
            <p className="text-[11px] text-yellow-400 mb-4 bg-yellow-500/10 px-3 py-2 rounded-lg">
              ⚠️ No estás logueado — el reporte no se guardó en el servidor.
              <a href="/login" className="underline ml-1">Inicia sesión</a> para sincronizar.
            </p>
          )}
          <a href="/" className="inline-block px-6 py-3 rounded-xl glass text-sm font-medium hover:bg-white/10 transition">
            ← Volver al inicio
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[100dvh] px-4 pt-14 pb-8 safe-top safe-bottom">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <a href="/" className="w-10 h-10 rounded-xl glass flex items-center justify-center text-lg">←</a>
          <div>
            <h1 className="text-xl font-bold">Check-In</h1>
            <p className="text-xs text-gray-400">Reporta tu estado actual</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs">
            ⚠️ {error}
          </div>
        )}

        <div className="glass rounded-2xl p-4 mb-6 flex items-center gap-3">
          <span className="text-xl">💡</span>
          <p className="text-xs text-gray-300 leading-relaxed">
            Tu ubicación GPS y batería se adjuntan automáticamente y se sincronizan con el Centro de Mando en tiempo real.
          </p>
        </div>

        <div className="space-y-3">
          <button onClick={() => handleSelect('a_salvo')} disabled={loading}
            className="w-full p-5 rounded-2xl bg-gradient-to-r from-green-600/20 to-green-800/20 border border-green-500/20 flex items-center gap-4 transition-all hover:scale-[1.02] active:scale-[0.98] hover:border-green-500/40 disabled:opacity-50">
            <div className="w-14 h-14 rounded-xl bg-green-500/20 flex items-center justify-center text-3xl">✅</div>
            <div className="text-left">
              <p className="text-lg font-semibold text-green-300">Estoy A Salvo</p>
              <p className="text-xs text-gray-400 mt-0.5">Me encuentro bien, sin lesiones</p>
            </div>
          </button>

          <button onClick={() => handleSelect('necesita_ayuda')} disabled={loading}
            className="w-full p-5 rounded-2xl bg-gradient-to-r from-orange-600/20 to-orange-800/20 border border-orange-500/20 flex items-center gap-4 transition-all hover:scale-[1.02] active:scale-[0.98] hover:border-orange-500/40 disabled:opacity-50">
            <div className="w-14 h-14 rounded-xl bg-orange-500/20 flex items-center justify-center text-3xl">🟠</div>
            <div className="text-left">
              <p className="text-lg font-semibold text-orange-300">Necesito Ayuda</p>
              <p className="text-xs text-gray-400 mt-0.5">Requiero asistencia pero no es emergencia vital</p>
            </div>
          </button>

          <button onClick={() => handleSelect('atrapado_en_peligro')} disabled={loading}
            className="w-full p-5 rounded-2xl bg-gradient-to-r from-red-600/20 to-red-800/20 border border-red-500/20 flex items-center gap-4 transition-all hover:scale-[1.02] active:scale-[0.98] hover:border-red-500/40 disabled:opacity-50">
            <div className="w-14 h-14 rounded-xl bg-red-500/20 flex items-center justify-center text-3xl">🔴</div>
            <div className="text-left">
              <p className="text-lg font-semibold text-red-300">Atrapado / En Peligro</p>
              <p className="text-xs text-gray-400 mt-0.5">Situación de emergencia — activa Modo Baliza</p>
            </div>
          </button>
        </div>

        {loading && (
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
            <div className="w-4 h-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
            Obteniendo ubicación y enviando reporte...
          </div>
        )}
      </div>
    </main>
  );
}
