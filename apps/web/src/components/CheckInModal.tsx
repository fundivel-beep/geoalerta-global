'use client';

import { useState } from 'react';
import type { EstadoCheckIn } from '@geoalerta/shared';

interface CheckInModalProps {
  eventoId: string;
  magnitud: number;
  onSubmit: (estado: EstadoCheckIn) => void;
  onClose: () => void;
}

export function CheckInModal({ eventoId, magnitud, onSubmit, onClose }: CheckInModalProps) {
  const [submitted, setSubmitted] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<EstadoCheckIn | null>(null);

  const handleSelect = (estado: EstadoCheckIn) => {
    setSelectedStatus(estado);
    setSubmitted(true);
    navigator.vibrate?.([100]);
    onSubmit(estado);
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
        <div className="bg-gray-800 rounded-xl p-6 max-w-sm w-full text-center">
          <div className="text-4xl mb-3">
            {selectedStatus === 'a_salvo' ? '✅' : selectedStatus === 'necesita_ayuda' ? '🟠' : '🔴'}
          </div>
          <p className="text-lg font-medium">Respuesta registrada</p>
          <p className="text-gray-400 text-sm mt-2">Tu estado ha sido enviado al centro de mando.</p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-gray-700 rounded text-sm hover:bg-gray-600"
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="bg-gray-800 rounded-xl p-6 max-w-sm w-full">
        {/* Alert header */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-2 animate-pulse-alert">⚠️</div>
          <h2 className="text-xl font-bold text-red-400">ALERTA SÍSMICA</h2>
          <p className="text-gray-300 text-sm mt-1">
            Magnitud {magnitud.toFixed(1)} detectada
          </p>
          <p className="text-gray-400 text-xs mt-1">¿Cuál es tu estado actual?</p>
        </div>

        {/* Check-in options */}
        <div className="space-y-3">
          <button
            onClick={() => handleSelect('a_salvo')}
            className="w-full py-4 rounded-lg bg-green-700 hover:bg-green-600 text-white font-medium text-lg transition active:scale-95"
          >
            ✅ Estoy A Salvo
          </button>

          <button
            onClick={() => handleSelect('necesita_ayuda')}
            className="w-full py-4 rounded-lg bg-orange-700 hover:bg-orange-600 text-white font-medium text-lg transition active:scale-95"
          >
            🟠 Necesito Ayuda
          </button>

          <button
            onClick={() => handleSelect('atrapado_en_peligro')}
            className="w-full py-4 rounded-lg bg-red-700 hover:bg-red-600 text-white font-medium text-lg transition active:scale-95"
          >
            🔴 Atrapado / En Peligro
          </button>
        </div>
      </div>
    </div>
  );
}
