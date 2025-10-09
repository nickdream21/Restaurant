import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 flex items-center justify-center p-6">
      <div className="text-center max-w-4xl">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-white mb-4 drop-shadow-lg">🍽️ RestaurantPro</h1>
          <p className="text-2xl text-white/90 mb-2">Sistema de Gestión Integral</p>
          <p className="text-lg text-white/70">Selecciona tu rol para continuar</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {/* Mesera */}
          <Link
            to="/mesera"
            className="group bg-white rounded-2xl p-8 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300"
          >
            <div className="text-6xl mb-4">👩‍🍳</div>
            <h2 className="text-2xl font-bold text-blue-600 mb-2">Mesera</h2>
            <p className="text-gray-600 text-sm">
              Gestión de mesas, pedidos y atención al cliente
            </p>
            <div className="mt-4 text-blue-500 group-hover:text-blue-700 font-semibold">
              Acceder →
            </div>
          </Link>

          {/* Cocina */}
          <Link
            to="/cocina"
            className="group bg-white rounded-2xl p-8 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300"
          >
            <div className="text-6xl mb-4">🍳</div>
            <h2 className="text-2xl font-bold text-purple-600 mb-2">Cocina</h2>
            <p className="text-gray-600 text-sm">
              Visualización y gestión de pedidos en preparación
            </p>
            <div className="mt-4 text-purple-500 group-hover:text-purple-700 font-semibold">
              Acceder →
            </div>
          </Link>

          {/* Administrador */}
          <Link
            to="/admin"
            className="group bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-8 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300"
          >
            <div className="text-6xl mb-4">👨‍💼</div>
            <h2 className="text-2xl font-bold text-white mb-2">Administrador</h2>
            <p className="text-white/90 text-sm">
              Reportes, ventas, estadísticas y gestión completa
            </p>
            <div className="mt-4 text-white font-semibold flex items-center justify-center gap-2">
              <span>🔒</span> Acceso Admin →
            </div>
          </Link>
        </div>

        <div className="mt-12 text-white/60 text-sm">
          <p>© 2025 RestaurantPro - Sistema de Gestión Profesional</p>
        </div>
      </div>
    </div>
  );
}

export default Home;
