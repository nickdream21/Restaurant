import { Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Mesera from './pages/Mesera';
import Cocina from './pages/Cocina';

function App() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="min-h-screen">
      {/* Navegación - solo mostrar si no estamos en home */}
      {!isHome && (
        <nav className="bg-white shadow-md">
          <div className="container mx-auto px-4 py-3">
            <div className="flex justify-between items-center">
              <Link to="/" className="text-xl font-bold text-gray-800">
                🍽️ Sistema Restaurante
              </Link>
              <div className="flex gap-4">
                <Link
                  to="/mesera"
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    location.pathname === '/mesera'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Mesera
                </Link>
                <Link
                  to="/cocina"
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    location.pathname === '/cocina'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Cocina
                </Link>
              </div>
            </div>
          </div>
        </nav>
      )}

      {/* Rutas */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/mesera" element={<Mesera />} />
        <Route path="/cocina" element={<Cocina />} />
      </Routes>
    </div>
  );
}

export default App;
