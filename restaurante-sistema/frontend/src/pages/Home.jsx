import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-white mb-8">Sistema de Restaurante</h1>
        <p className="text-xl text-white mb-12">Selecciona tu rol</p>

        <div className="flex gap-6 justify-center">
          <Link
            to="/mesera"
            className="bg-white text-blue-600 px-8 py-4 rounded-lg text-xl font-semibold hover:bg-gray-100 transition-colors shadow-lg"
          >
            👩‍🍳 Mesera
          </Link>

          <Link
            to="/cocina"
            className="bg-white text-purple-600 px-8 py-4 rounded-lg text-xl font-semibold hover:bg-gray-100 transition-colors shadow-lg"
          >
            🍳 Cocina
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Home;
