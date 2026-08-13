'use client';

import { useEffect, useState } from 'react';
import { signOut } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export function HeroHeader() {
  const [userName, setUserName] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserName(user.displayName || user.email || 'Usuario');
      } else {
        setUserName(null);
      }
    });
    return () => unsub();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <header className="text-center relative">
      {/* User menu top-right */}
      {userName && (
        <div className="absolute right-0 top-0">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl glass text-xs text-gray-300 hover:text-white transition"
          >
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-[9px] font-bold">
              {userName.charAt(0).toUpperCase()}
            </div>
            <span className="max-w-24 truncate">{userName.split(' ')[0]}</span>
            <span className="text-gray-500">▾</span>
          </button>

          {showMenu && (
            <div className="absolute right-0 top-10 glass rounded-xl p-1 min-w-36 shadow-xl z-50 border border-white/10">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-red-400 hover:bg-red-500/10 transition"
              >
                🚪 Cerrar sesión
              </button>
            </div>
          )}
        </div>
      )}

      {/* Logo */}
      <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 shadow-lg shadow-blue-500/25 mb-4 animate-float">
        <span className="text-3xl sm:text-4xl">🌐</span>
      </div>

      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight bg-gradient-to-r from-white via-blue-100 to-cyan-200 bg-clip-text text-transparent">
        GeoAlerta Global
      </h1>
      <p className="mt-1 text-sm sm:text-base text-gray-400 font-medium">
        FUNDIVEL — Sistema de Alerta Temprana
      </p>

      {/* Greeting if logged in */}
      {userName && (
        <p className="mt-2 text-xs text-gray-500">
          Hola, <span className="text-gray-300 font-medium">{userName.split(' ')[0]}</span>
        </p>
      )}

      {/* Status pill */}
      <div className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs sm:text-sm text-green-300">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
        </span>
        Sistema operativo — Protección activa
      </div>
    </header>
  );
}
