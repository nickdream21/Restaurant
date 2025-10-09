import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import Mesera from './pages/Mesera';
import Cocina from './pages/Cocina';
import Admin from './pages/Admin';

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';

  const handleSalir = () => {
    if (confirm('¿Estás seguro de que deseas salir?')) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen">
      {/* Navegación - solo mostrar si no estamos en home */}
      {!isHome && (
        <nav className="bg-white shadow-md">
          <div className="container mx-auto px-4 py-3">
            <div className="flex justify-between items-center">
              <div className="text-xl font-bold text-gray-800">
                🍽️ Sistema Restaurante
                {location.pathname === '/mesera' && (
                  <span className="ml-3 text-sm font-normal text-blue-600">
                    - Panel Mesera
                  </span>
                )}
                {location.pathname === '/cocina' && (
                  <span className="ml-3 text-sm font-normal text-purple-600">
                    - Panel Cocina
                  </span>
                )}
                {location.pathname === '/admin' && (
                  <span className="ml-3 text-sm font-normal text-orange-600">
                    - Panel Administrador
                  </span>
                )}
              </div>
              <button
                onClick={handleSalir}
                className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold transition-colors"
              >
                🚪 Salir
              </button>
            </div>
          </div>
        </nav>
      )}

      {/* Rutas */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/mesera" element={<Mesera />} />
        <Route path="/cocina" element={<Cocina />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </div>
  );
}

export default App;
