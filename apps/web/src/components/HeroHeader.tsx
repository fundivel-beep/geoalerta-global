'use client';

export function HeroHeader() {
  return (
    <header className="text-center">
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
