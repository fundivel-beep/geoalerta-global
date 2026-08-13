'use client';

import { useEffect, useState } from 'react';

type Sismo = {
  id: string;
  mag: number;
  lugar: string;
  tiempo: number;
  profundidad: number;
  distancia?: number;
};

function calcDistancia(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) * Math.sin(dLng/2)**2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
}

export default function ZonaPage() {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locLoading, setLocLoading] = useState(true);
  const [sismos, setSismos] = useState<Sismo[]>([]);
  const [sisLoading, setSisLoading] = useState(false);
  const [alertaActiva, setAlertaActiva] = useState(false);

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLocLoading(false);
        },
        () => setLocLoading(false),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setLocLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!location) return;
    setSisLoading(true);
    // USGS — last 7 days, M2.5+, within ~500km radius
    const { lat, lng } = location;
    const delta = 5; // ~500km
    const url = `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&minmagnitude=2.5&minlatitude=${lat-delta}&maxlatitude=${lat+delta}&minlongitude=${lng-delta}&maxlongitude=${lng+delta}&orderby=time&limit=10`;

    fetch(url)
      .then(r => r.json())
      .then(data => {
        const mapped: Sismo[] = data.features.map((f: {
          id: string;
          properties: { mag: number; place: string; time: number };
          geometry: { coordinates: [number, number, number] };
        }) => ({
          id: f.id,
          mag: Math.round(f.properties.mag * 10) / 10,
          lugar: f.properties.place,
          tiempo: f.properties.time,
          profundidad: Math.round(f.geometry.coordinates[2]),
          distancia: calcDistancia(lat, lng, f.geometry.coordinates[1], f.geometry.coordinates[0]),
        }));
        setSismos(mapped);
        // Alert if any M5+ in last 24h within 300km
        const alerta = mapped.some(s => s.mag >= 5 && s.distancia !== undefined && s.distancia < 300 && (Date.now() - s.tiempo) < 86400000);
        setAlertaActiva(alerta);
      })
      .catch(() => {})
      .finally(() => setSisLoading(false));
  }, [location]);

  const getMagColor = (mag: number) => {
    if (mag >= 6) return 'text-red-400 bg-red-600/20';
    if (mag >= 5) return 'text-orange-400 bg-orange-600/20';
    if (mag >= 4) return 'text-yellow-400 bg-yellow-600/20';
    return 'text-green-400 bg-green-600/20';
  };

  const getMagLabel = (mag: number) => {
    if (mag >= 6) return 'Fuerte';
    if (mag >= 5) return 'Moderado';
    if (mag >= 4) return 'Ligero';
    return 'Menor';
  };

  return (
    <main className="min-h-[100dvh] px-4 pt-14 pb-8 safe-top safe-bottom">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <a href="/" className="w-10 h-10 rounded-xl glass flex items-center justify-center text-lg">←</a>
          <div>
            <h1 className="text-xl font-bold">Mi Zona de Riesgo</h1>
            <p className="text-xs text-gray-400">Evaluación sísmica de tu ubicación actual</p>
          </div>
        </div>

        {/* Location */}
        <div className="glass rounded-2xl p-5 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-600/20 flex items-center justify-center text-2xl">📍</div>
            <div>
              <p className="text-sm font-semibold">Tu ubicación actual</p>
              {locLoading ? (
                <p className="text-xs text-gray-400">Obteniendo GPS...</p>
              ) : location ? (
                <p className="text-xs text-gray-400">{location.lat.toFixed(4)}°, {location.lng.toFixed(4)}°</p>
              ) : (
                <p className="text-xs text-red-400">GPS no disponible — activa los permisos de ubicación</p>
              )}
            </div>
          </div>
        </div>

        {/* Alert status */}
        <div className={`glass rounded-2xl p-5 mb-4 border ${alertaActiva ? 'border-red-500/30' : 'border-green-500/20'}`}>
          <h3 className="text-sm font-semibold mb-3">Estado de alerta</h3>
          {alertaActiva ? (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
              <span className="text-2xl animate-pulse">⚠️</span>
              <div>
                <p className="text-sm font-medium text-red-400">Alerta sísmica activa</p>
                <p className="text-xs text-gray-400">Sismo M5+ en tu zona en las últimas 24h</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-green-500/10 border border-green-500/20">
              <span className="text-2xl">✅</span>
              <div>
                <p className="text-sm font-medium text-green-400">Sin alertas activas</p>
                <p className="text-xs text-gray-400">No hay eventos significativos en tu zona</p>
              </div>
            </div>
          )}
        </div>

        {/* Seismic history */}
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">Actividad sísmica reciente</h3>
            <span className="text-[10px] text-gray-500">Fuente: USGS</span>
          </div>

          {sisLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="w-6 h-6 rounded-full border-2 border-blue-500 border-t-transparent animate-spin mx-auto mb-2" />
                <p className="text-xs text-gray-500">Consultando USGS...</p>
              </div>
            </div>
          ) : !location ? (
            <p className="text-xs text-gray-500 text-center py-4">Activa el GPS para ver sismos cercanos</p>
          ) : sismos.length === 0 ? (
            <p className="text-xs text-gray-500 text-center py-4">Sin actividad sísmica registrada en tu zona</p>
          ) : (
            <div className="space-y-3">
              {sismos.map(s => {
                const fecha = new Date(s.tiempo);
                const hace = Date.now() - s.tiempo;
                const haceStr = hace < 3600000 ? `Hace ${Math.round(hace/60000)} min` :
                  hace < 86400000 ? `Hace ${Math.round(hace/3600000)} h` :
                  `Hace ${Math.round(hace/86400000)} días`;

                return (
                  <div key={s.id} className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${getMagColor(s.mag)}`}>
                      {s.mag}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{s.lugar}</p>
                      <p className="text-[10px] text-gray-500">
                        {haceStr} · Prof. {s.profundidad} km
                        {s.distancia !== undefined && ` · ${s.distancia} km`}
                      </p>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full bg-gray-800 flex-shrink-0 ${getMagColor(s.mag).split(' ')[0]}`}>
                      {getMagLabel(s.mag)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
