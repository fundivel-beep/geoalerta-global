'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';

export function SOSButton() {
  const [isPressed, setIsPressed] = useState(false);
  const [isActivated, setIsActivated] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uid, setUid] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressRef = useRef<NodeJS.Timeout | null>(null);
  const HOLD_DURATION_MS = 2000;

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setUid(user?.uid || null);
    });
    return () => unsub();
  }, []);

  const getLocation = (): Promise<{ lat: number; lng: number } | null> => {
    return new Promise((resolve) => {
      if (!('geolocation' in navigator)) { resolve(null); return; }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => resolve(null),
        { enableHighAccuracy: true, timeout: 5000 }
      );
    });
  };

  const activateSOS = useCallback(async () => {
    setIsActivated(true);
    setProgress(1);
    navigator.vibrate?.([100, 50, 100, 50, 300]);
    if (progressRef.current) clearInterval(progressRef.current);

    if (!uid) return;

    try {
      const location = await getLocation();
      const hora = new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });

      await updateDoc(doc(db, 'personal', uid), {
        estado: 'sos',
        ultimoContacto: `SOS activado ${hora}`,
        ultimoCheckin: serverTimestamp(),
        sosActivadoEn: serverTimestamp(),
        ...(location && { lat: location.lat, lng: location.lng }),
      });
    } catch (err) {
      console.error('[SOS] Error al enviar alerta:', err);
    }
  }, [uid]);

  const cancelSOS = useCallback(async () => {
    setIsCancelling(true);
    try {
      if (uid) {
        const hora = new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
        await updateDoc(doc(db, 'personal', uid), {
          estado: 'seguro',
          ultimoContacto: `SOS cancelado ${hora}`,
          ultimoCheckin: serverTimestamp(),
        });
      }
    } catch (err) {
      console.error('[SOS] Error al cancelar:', err);
    } finally {
      setIsActivated(false);
      setIsCancelling(false);
    }
  }, [uid]);

  const handlePressStart = useCallback(() => {
    setIsPressed(true);
    setProgress(0);

    const startTime = Date.now();
    progressRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setProgress(Math.min(elapsed / HOLD_DURATION_MS, 1));
    }, 16);

    timerRef.current = setTimeout(() => {
      activateSOS();
    }, HOLD_DURATION_MS);
  }, [activateSOS]);

  const handlePressEnd = useCallback(() => {
    setIsPressed(false);
    setProgress(0);
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    if (progressRef.current) { clearInterval(progressRef.current); progressRef.current = null; }
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
          <div className="flex items-center justify-center gap-3 mb-3">
            <span className="text-2xl animate-pulse">🆘</span>
            <div>
              <p className="text-lg font-bold text-red-400">SOS ACTIVADO</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {uid ? 'Señal enviada al Centro de Mando — FUNDIVEL' : 'Inicia sesión para sincronizar con el admin'}
              </p>
            </div>
          </div>
          {!uid && (
            <p className="text-[11px] text-yellow-400 mb-3 bg-yellow-500/10 px-3 py-2 rounded-lg">
              ⚠️ No estás logueado — el SOS no se guardó en el servidor.
            </p>
          )}
          <button
            onClick={cancelSOS}
            disabled={isCancelling}
            className="mt-1 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-gray-300 transition disabled:opacity-50"
          >
            {isCancelling ? 'Cancelando...' : '✅ Cancelar SOS — Estoy bien'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-28 left-0 right-0 z-50 flex flex-col items-center pointer-events-none safe-bottom">
      {isPressed && (
        <div className="absolute bottom-3 w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-red-500/20 animate-pulse-ring" />
      )}

      <div className="relative">
        <svg className="absolute inset-0 w-[88px] h-[88px] sm:w-[104px] sm:h-[104px] -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(239, 68, 68, 0.2)" strokeWidth="4" />
          <circle
            cx="50" cy="50" r="44" fill="none" stroke="#ef4444" strokeWidth="4"
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
            flex items-center justify-center select-none pointer-events-auto
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

      <p className="mt-2 text-[11px] text-gray-500 font-medium pointer-events-none">
        {isPressed ? 'Manteniendo...' : 'Mantener 2s para activar'}
      </p>
    </div>
  );
}
