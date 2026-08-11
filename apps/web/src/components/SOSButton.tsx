'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

export function SOSButton() {
  const [isPressed, setIsPressed] = useState(false);
  const [isActivated, setIsActivated] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressRef = useRef<NodeJS.Timeout | null>(null);
  const HOLD_DURATION_MS = 2000;

  const handlePressStart = useCallback(() => {
    setIsPressed(true);
    setProgress(0);

    // Progress animation
    const startTime = Date.now();
    progressRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setProgress(Math.min(elapsed / HOLD_DURATION_MS, 1));
    }, 16);

    timerRef.current = setTimeout(() => {
      setIsActivated(true);
      setProgress(1);
      navigator.vibrate?.([100, 50, 100, 50, 300]);
      if (progressRef.current) clearInterval(progressRef.current);
    }, HOLD_DURATION_MS);
  }, []);

  const handlePressEnd = useCallback(() => {
    setIsPressed(false);
    setProgress(0);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (progressRef.current) {
      clearInterval(progressRef.current);
      progressRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, []);

  if (isActivated) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 safe-bottom">
        <div className="max-w-lg mx-auto glass-strong rounded-2xl p-5 text-center border-red-500/30 border animate-glow">
          <div className="flex items-center justify-center gap-3">
            <span className="text-2xl animate-pulse">🆘</span>
            <div>
              <p className="text-lg font-bold text-red-400">SOS ACTIVADO</p>
              <p className="text-xs text-gray-400 mt-0.5">Modo Baliza activándose — Señal enviada</p>
            </div>
          </div>
          <button
            onClick={() => setIsActivated(false)}
            className="mt-3 text-xs text-gray-500 underline"
          >
            Cancelar SOS
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 left-0 right-0 z-50 flex flex-col items-center safe-bottom">
      {/* SOS Ring animation when pressed */}
      {isPressed && (
        <div className="absolute bottom-3 w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-red-500/20 animate-pulse-ring" />
      )}

      {/* Progress ring */}
      <div className="relative">
        <svg className="absolute inset-0 w-[88px] h-[88px] sm:w-[104px] sm:h-[104px] -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50" cy="50" r="44"
            fill="none"
            stroke="rgba(239, 68, 68, 0.2)"
            strokeWidth="4"
          />
          <circle
            cx="50" cy="50" r="44"
            fill="none"
            stroke="#ef4444"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${progress * 276.46} 276.46`}
            className="transition-all duration-75"
          />
        </svg>

        <button
          onMouseDown={handlePressStart}
          onMouseUp={handlePressEnd}
          onMouseLeave={handlePressEnd}
          onTouchStart={handlePressStart}
          onTouchEnd={handlePressEnd}
          className={`
            relative w-[88px] h-[88px] sm:w-[104px] sm:h-[104px] rounded-full
            flex items-center justify-center select-none
            transition-all duration-200
            ${isPressed
              ? 'bg-red-600 scale-110 shadow-2xl shadow-red-600/50'
              : 'bg-gradient-to-b from-red-600 to-red-800 shadow-xl shadow-red-900/40 hover:shadow-red-600/40 hover:scale-105'}
          `}
          aria-label="Botón SOS — Mantener presionado 2 segundos para activar emergencia"
        >
          <span className="text-white font-black text-xl sm:text-2xl tracking-wider">SOS</span>
        </button>
      </div>

      <p className="mt-2 text-[11px] text-gray-500 font-medium">
        {isPressed ? 'Manteniendo...' : 'Mantener 2s para activar'}
      </p>
    </div>
  );
}
