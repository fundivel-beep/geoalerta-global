'use client';

interface StatusCardProps {
  icon: string;
  title: string;
  subtitle: string;
  status: 'active' | 'standby' | 'warning' | 'error';
}

const statusStyles = {
  active: {
    dot: 'bg-green-400',
    ring: 'ring-green-400/20',
    label: 'text-green-400',
    labelText: 'Activo',
  },
  standby: {
    dot: 'bg-yellow-400',
    ring: 'ring-yellow-400/20',
    label: 'text-yellow-400',
    labelText: 'Espera',
  },
  warning: {
    dot: 'bg-orange-400',
    ring: 'ring-orange-400/20',
    label: 'text-orange-400',
    labelText: 'Alerta',
  },
  error: {
    dot: 'bg-red-400',
    ring: 'ring-red-400/20',
    label: 'text-red-400',
    labelText: 'Error',
  },
};

export function StatusCard({ icon, title, subtitle, status }: StatusCardProps) {
  const style = statusStyles[status];

  return (
    <div className="glass rounded-2xl p-4 flex items-center gap-4 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
      {/* Icon */}
      <div className="flex-shrink-0 w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-white/5 flex items-center justify-center text-xl sm:text-2xl">
        {icon}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-sm sm:text-base font-semibold text-white truncate">{title}</p>
        <p className="text-xs sm:text-sm text-gray-400 truncate">{subtitle}</p>
      </div>

      {/* Status indicator */}
      <div className="flex-shrink-0 flex flex-col items-center gap-1">
        <div className={`w-2.5 h-2.5 rounded-full ${style.dot} ring-4 ${style.ring}`} />
        <span className={`text-[10px] font-medium ${style.label}`}>{style.labelText}</span>
      </div>
    </div>
  );
}
