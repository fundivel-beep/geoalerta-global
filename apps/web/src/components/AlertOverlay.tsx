'use client';

import { useEffect, useState } from 'react';

interface AlertOverlayProps {
  magnitud: number;
  etaSeconds: number;
  zonRiesgo: string;
  onDismiss: () => void;
}

export function AlertOverlay({ magnitud, etaSeconds, zonRiesgo, onDismiss }: AlertOverlayProps) {
  const [countdown, setCountdown] = useState(etaSeconds);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 0) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Trigger device vibration pattern
  useEffect(() => {
    navigator.vibrate?.([500, 200, 500, 200, 500]);
  }, []);

  const zonaColor = {
    roja: 'bg-red-600',
    naranja: 'bg-orange-600',
    amarilla: 'bg-yellow-600',
  }[zonRiesgo] || 'bg-red-600';

  return (
    <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center ${zonaColor} animate-pulse-alert p-6`}>
      <div className="text-center text-white">
        <div className="text-6xl mb-4">⚠️</div>
        <h1 className="text-3xl font-black mb-2">ALERTA SÍSMICA</h1>
        <p className="text-xl mb-4">Magnitud {magnitud.toFixed(1)}</p>

        {countdown > 0 ? (
          <div className="bg-black/40 rounded-xl p-4 mb-6">
            <p className="text-sm opacity-80">Ondas S llegan en aproximadamente</p>
            <p className="text-5xl font-mono font-bold">{countdown}s</p>
          </div>
        ) : (
          <div className="bg-black/40 rounded-xl p-4 mb-6">
            <p className="text-lg font-bold">¡PROTÉGETE AHORA!</p>
          </div>
        )}

        <div className="bg-black/30 rounded-lg p-3 mb-6 text-sm">
          <p className="font-medium mb-1">Acción inmediata:</p>
          <p>Agáchate, cúbrete y sujétate. Aléjate de ventanas y objetos que puedan caer.</p>
        </div>

        <button
          onClick={onDismiss}
          className="px-6 py-3 bg-white/20 rounded-full text-white font-medium hover:bg-white/30 transition"
        >
          Entendido
        </button>
      </div>
    </div>
  );
}
