export default function AdminDashboard() {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 border-r border-gray-700 p-4">
        <h1 className="text-xl font-bold mb-6">🌐 GeoAlerta</h1>
        <nav className="space-y-2">
          <a href="/dashboard" className="block px-3 py-2 rounded bg-blue-600 text-white">
            Dashboard
          </a>
          <a href="/personal" className="block px-3 py-2 rounded text-gray-300 hover:bg-gray-700">
            Personal
          </a>
          <a href="/eventos" className="block px-3 py-2 rounded text-gray-300 hover:bg-gray-700">
            Eventos Sísmicos
          </a>
          <a href="/reportes" className="block px-3 py-2 rounded text-gray-300 hover:bg-gray-700">
            Reportes SAR
          </a>
          <a href="/configuracion" className="block px-3 py-2 rounded text-gray-300 hover:bg-gray-700">
            Configuración
          </a>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 overflow-auto">
        <h2 className="text-2xl font-bold mb-6">Centro de Mando - FUNDIVEL</h2>

        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-sm text-gray-400">Personal Total</p>
            <p className="text-2xl font-bold">--</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-sm text-gray-400">GPS Activo</p>
            <p className="text-2xl font-bold text-green-400">--</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-sm text-gray-400">En Zona de Riesgo</p>
            <p className="text-2xl font-bold text-orange-400">--</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-sm text-gray-400">SOS Activos</p>
            <p className="text-2xl font-bold text-red-400">--</p>
          </div>
        </div>

        {/* Map placeholder */}
        <div className="bg-gray-800 rounded-lg h-[500px] flex items-center justify-center">
          <p className="text-gray-500">Mapa Vectorial (Mapbox GL) — Se cargará con token configurado</p>
        </div>
      </main>
    </div>
  );
}
