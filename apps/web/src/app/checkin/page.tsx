'use client';

import { useState } from 'react';
import type { EstadoCheckIn } from '@geoalerta/shared';

export default function CheckInPage() {
  const [submitted, setSubmitted] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<EstadoCheckIn | null>(null);

  const handleSelect = (estado: EstadoCheckIn) => {
    setSelectedStatus(estado);
    setSubmitted(true);
    navigator.vibrate?.([100]);
    // TODO: Send via WebSocket or store offline
  };

  if (submitted) {
    return (
      <main className="min-h-[100dvh] flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-4xl mb-5 animate-float">
            {selectedStatus === 'a_salvo' ? '✅' : selectedStatus === 'necesita_ayuda' ? '🟠' : '🔴'}
          </div>
          <h2 className="text-xl font-bold mb-2">Estado registrado</h2>
          <p className="text-gray-400 text-sm mb-6">Tu reporte fue enviado al centro de mando de FUNDIVEL.</p>
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
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <a href="/" className="w-10 h-10 rounded-xl glass flex items-center justify-center text-lg">←</a>
          <div>
            <h1 className="text-xl font-bold">Check-In</h1>
            <p className="text-xs text-gray-400">Reporta tu estado actual</p>
          </div>
        </div>

        {/* Info card */}
        <div className="glass rounded-2xl p-4 mb-6 flex items-center gap-3">
          <span className="text-xl">💡</span>
          <p className="text-xs text-gray-300 leading-relaxed">
            Este reporte se envía a tu organización para verificar que estás bien. 
            Se adjunta automáticamente tu ubicación GPS y nivel de batería.
          </p>
        </div>

        {/* Status options */}
        <div className="space-y-3">
          <button
            onClick={() => handleSelect('a_salvo')}
            className="w-full p-5 rounded-2xl bg-gradient-to-r from-green-600/20 to-green-800/20 border border-green-500/20 flex items-center gap-4 transition-all hover:scale-[1.02] active:scale-[0.98] hover:border-green-500/40"
          >
            <div className="w-14 h-14 rounded-xl bg-green-500/20 flex items-center justify-center text-3xl">✅</div>
            <div className="text-left">
              <p className="text-lg font-semibold text-green-300">Estoy A Salvo</p>
              <p className="text-xs text-gray-400 mt-0.5">Me encuentro bien, sin lesiones</p>
            </div>
          </button>

          <button
            onClick={() => handleSelect('necesita_ayuda')}
            className="w-full p-5 rounded-2xl bg-gradient-to-r from-orange-600/20 to-orange-800/20 border border-orange-500/20 flex items-center gap-4 transition-all hover:scale-[1.02] active:scale-[0.98] hover:border-orange-500/40"
          >
            <div className="w-14 h-14 rounded-xl bg-orange-500/20 flex items-center justify-center text-3xl">🟠</div>
            <div className="text-left">
              <p className="text-lg font-semibold text-orange-300">Necesito Ayuda</p>
              <p className="text-xs text-gray-400 mt-0.5">Requiero asistencia pero no es emergencia vital</p>
            </div>
          </button>

          <button
            onClick={() => handleSelect('atrapado_en_peligro')}
            className="w-full p-5 rounded-2xl bg-gradient-to-r from-red-600/20 to-red-800/20 border border-red-500/20 flex items-center gap-4 transition-all hover:scale-[1.02] active:scale-[0.98] hover:border-red-500/40"
          >
            <div className="w-14 h-14 rounded-xl bg-red-500/20 flex items-center justify-center text-3xl">🔴</div>
            <div className="text-left">
              <p className="text-lg font-semibold text-red-300">Atrapado / En Peligro</p>
              <p className="text-xs text-gray-400 mt-0.5">Situación de emergencia — activa Modo Baliza</p>
            </div>
          </button>
        </div>
      </div>
    </main>
  );
}
