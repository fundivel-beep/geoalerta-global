import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Centro de Mando — GeoAlerta FUNDIVEL',
  description: 'Panel administrativo de monitoreo y respuesta sísmica',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-['Inter'] text-white min-h-screen">{children}</body>
    </html>
  );
}
