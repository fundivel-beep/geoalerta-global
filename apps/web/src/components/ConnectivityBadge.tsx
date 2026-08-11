'use client';

import { useEffect, useState } from 'react';

export function ConnectivityBadge() {
  const [isOnline, setIsOnline] = useState(true);
  const [showBadge, setShowBadge] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => { setIsOnline(true); setShowBadge(true); };
    const handleOffline = () => { setIsOnline(false); setShowBadge(true); };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Auto-hide badge after 5s if online
    const timer = setTimeout(() => {
      if (navigator.onLine) setShowBadge(false);
    }, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearTimeout(timer);
    };
  }, []);

  // Always show when offline
  if (!isOnline) {
    return (
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 safe-top animate-shake">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full glass-strong border border-red-500/30 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
          <span className="text-xs font-medium text-red-300">Sin conexión — Modo offline activo</span>
        </div>
      </div>
    );
  }

  if (!showBadge) return null;

  return (
    <div className="fixed top-4 right-4 z-50 safe-top">
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass text-xs font-medium text-green-300 transition-opacity duration-500">
        <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
        Conectado
      </div>
    </div>
  );
}
