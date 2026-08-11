import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GeoAlerta Admin - FUNDIVEL Centro de Mando',
  description: 'Panel administrativo de GeoAlerta Global para FUNDIVEL',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-gray-900 text-white min-h-screen">{children}</body>
    </html>
  );
}
