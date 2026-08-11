'use client';

import { useEffect, useState } from 'react';

export default function ZonaPage() {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLoading(false);
        },
        () => setLoading(false),
        { enableHighAccuracy: true, timeout: 10000 },
      );
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <main className="min-h-[100dvh] px-4 pt-14 pb-8 safe-top safe-bottom">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <a href="/" className="w-10 h-10 rounded-xl glass flex items-center justify-center text-lg">←</a>
          <div>
            <h1 className="text-xl font-bold">Mi Zona de Riesgo</h1>
            <p className="text-xs text-gray-400">Evaluación sísmica de tu ubicación</p>
          </div>
        </div>

        {/* Location card */}
        <div className="glass rounded-2xl p-5 mb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-600/20 flex items-center justify-center text-2xl">📍</div>
            <div>
              <p className="text-sm font-semibold">Tu ubicación actual</p>
              {loading ? (
                <p className="text-xs text-gray-400">Obteniendo GPS...</p>
              ) : location ? (
                <p className="text-xs text-gray-400">{location.lat.toFixed(4)}°, {location.lng.toFixed(4)}°</p>
              ) : (
                <p className="text-xs text-red-400">GPS no disponible</p>
              )}
            </div>
          </div>

          {/* Map placeholder */}
          <div className="w-full h-48 rounded-xl bg-gray-800 flex items-center justify-center border border-white/5">
            {location ? (
              <div className="text-center">
                <p className="text-3xl mb-2">🗺️</p>
                <p className="text-xs text-gray-400">Mapa vectorial</p>
                <p className="text-[10px] text-gray-500">Requiere token de Mapbox para visualización</p>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Activa la geolocalización</p>
            )}
          </div>
        </div>

        {/* Risk assessment */}
        <div className="glass rounded-2xl p-5 mb-4">
          <h3 className="text-sm font-semibold mb-3">Evaluación de riesgo actual</h3>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-green-500/10 border border-green-500/20">
            <span className="text-2xl">✅</span>
            <div>
              <p className="text-sm font-medium text-green-400">Sin alertas activas</p>
              <p className="text-xs text-gray-400">No hay eventos sísmicos reportados en tu zona</p>
            </div>
          </div>
        </div>

        {/* Seismic history */}
        <div className="glass rounded-2xl p-5">
          <h3 className="text-sm font-semibold mb-3">Actividad sísmica reciente (zona)</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-yellow-600/20 flex items-center justify-center text-sm font-bold text-yellow-400">3.2</div>
              <div className="flex-1">
                <p className="text-xs font-medium">M3.2 — 45 km al sur</p>
                <p className="text-[10px] text-gray-500">Hace 3 días · Profundidad 12 km</p>
              </div>
              <span className="text-[10px] text-gray-500 px-2 py-0.5 rounded-full bg-gray-800">Leve</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-green-600/20 flex items-center justify-center text-sm font-bold text-green-400">2.8</div>
              <div className="flex-1">
                <p className="text-xs font-medium">M2.8 — 78 km al este</p>
                <p className="text-[10px] text-gray-500">Hace 5 días · Profundidad 8 km</p>
              </div>
              <span className="text-[10px] text-gray-500 px-2 py-0.5 rounded-full bg-gray-800">Micro</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
