'use client';

export function QuickActions() {
  return (
    <div className="mt-6">
      <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-3 px-1">
        Acciones rápidas
      </p>
      <div className="grid grid-cols-3 gap-3">
        <ActionButton
          icon="✅"
          label="Check-In"
          sublabel="Reportar estado"
          href="/checkin"
          color="from-green-600/20 to-green-800/20"
        />
        <ActionButton
          icon="🗺️"
          label="Mi Zona"
          sublabel="Ver riesgo"
          href="/zona"
          color="from-blue-600/20 to-blue-800/20"
        />
        <ActionButton
          icon="👥"
          label="Equipo"
          sublabel="Ver personal"
          href="/equipo"
          color="from-purple-600/20 to-purple-800/20"
        />
      </div>
    </div>
  );
}

function ActionButton({
  icon,
  label,
  sublabel,
  href,
  color,
}: {
  icon: string;
  label: string;
  sublabel: string;
  href: string;
  color: string;
}) {
  return (
    <a
      href={href}
      className={`flex flex-col items-center gap-1.5 p-4 rounded-2xl bg-gradient-to-b ${color} border border-white/5 transition-all duration-200 hover:scale-105 active:scale-95 hover:border-white/10`}
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-xs sm:text-sm font-medium text-white">{label}</span>
      <span className="text-[10px] text-gray-500 hidden sm:block">{sublabel}</span>
    </a>
  );
}
