'use client';

import { SOSButton } from '@/components/SOSButton';
import { ConnectivityBadge } from '@/components/ConnectivityBadge';
import { StatusCard } from '@/components/StatusCard';
import { QuickActions } from '@/components/QuickActions';
import { HeroHeader } from '@/components/HeroHeader';

export default function HomePage() {
  return (
    <main className="relative flex flex-col min-h-[100dvh] overflow-hidden">
      {/* Aurora background effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-600/20 rounded-full blur-[100px] animate-aurora" />
        <div className="absolute top-1/3 -right-20 w-60 h-60 bg-purple-600/15 rounded-full blur-[80px] animate-aurora [animation-delay:4s]" />
        <div className="absolute -bottom-20 left-1/4 w-72 h-72 bg-cyan-600/10 rounded-full blur-[90px] animate-aurora [animation-delay:2s]" />
      </div>

      <ConnectivityBadge />

      {/* Content */}
      <div className="relative z-10 flex flex-col flex-1 px-4 pt-16 pb-8 safe-top safe-bottom max-w-lg mx-auto w-full">
        <HeroHeader />

        {/* Status cards */}
        <div className="mt-8 space-y-3">
          <StatusCard
            icon="📡"
            title="Motor Sísmico"
            subtitle="Sensores activos — Monitoreando ondas P"
            status="active"
          />
          <StatusCard
            icon="🔗"
            title="Canal de Alertas"
            subtitle="WebSocket conectado — Latencia < 500ms"
            status="active"
          />
          <StatusCard
            icon="📍"
            title="Geolocalización"
            subtitle="Reportando cada 5 minutos"
            status="active"
          />
          <StatusCard
            icon="🕸️"
            title="Red Mesh P2P"
            subtitle="En espera — Se activa si cae la red"
            status="standby"
          />
        </div>

        {/* Quick actions */}
        <QuickActions />

        {/* Spacer for SOS button */}
        <div className="h-36" />
      </div>

      <SOSButton />
    </main>
  );
}
