'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { icon: '📊', label: 'Dashboard', href: '/' },
  { icon: '👥', label: 'Personal', href: '/personal' },
  { icon: '🌍', label: 'Eventos Sísmicos', href: '/eventos' },
  { icon: '📋', label: 'Reportes SAR', href: '/reportes' },
  { icon: '📡', label: 'Fuentes Sísmicas', href: '/fuentes' },
  { icon: '⚙️', label: 'Configuración', href: '/configuracion' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-white/5 bg-[#0d1321] flex flex-col flex-shrink-0">
      <div className="p-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-lg">
            🌐
          </div>
          <div>
            <h1 className="text-sm font-bold">GeoAlerta</h1>
            <p className="text-[10px] text-gray-500">Centro de Mando</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm cursor-pointer transition ${
                isActive
                  ? 'bg-blue-600/15 text-blue-400'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>{item.icon}</span>
              <span className="font-medium text-xs">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-xs font-bold">
            AD
          </div>
          <div>
            <p className="text-xs font-medium">Admin FUNDIVEL</p>
            <p className="text-[10px] text-gray-500">admin@fundivel.org</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
