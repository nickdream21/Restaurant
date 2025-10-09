import { useState, useEffect } from 'react';
import { getVentasDelDia, getEstadisticas, getHistorialVentas } from '../services/api';

function Admin() {
  const [vistaActual, setVistaActual] = useState('dashboard'); // dashboard, ventas, productos, mesas
  const [ventasHoy, setVentasHoy] = useState(null);
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [ventasRes, statsRes] = await Promise.all([
        getVentasDelDia(),
        getEstadisticas()
      ]);
      setVentasHoy(ventasRes.data);
      setEstadisticas(statsRes.data);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      alert('Error al cargar datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Componente de tarjeta estadística
  const TarjetaEstadistica = ({ titulo, valor, subtitulo, icono, color }) => (
    <div className={`bg-gradient-to-br ${color} rounded-xl shadow-lg p-6 text-white`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm opacity-90 mb-1">{titulo}</p>
          <p className="text-3xl font-bold">{valor}</p>
          {subtitulo && <p className="text-xs opacity-75 mt-1">{subtitulo}</p>}
        </div>
        <div className="text-5xl opacity-30">{icono}</div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  // Vista Dashboard Principal
  const DashboardPrincipal = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">📊 Resumen del Día</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <TarjetaEstadistica
            titulo="Ventas del Día"
            valor={`S/ ${ventasHoy?.ventas_completadas?.total_vendido?.toFixed(2) || '0.00'}`}
            subtitulo={`${ventasHoy?.ventas_completadas?.mesas_cerradas || 0} mesas cerradas`}
            icono="💰"
            color="from-green-500 to-green-600"
          />

          <TarjetaEstadistica
            titulo="Mesas Activas"
            valor={ventasHoy?.mesas_activas?.cantidad || 0}
            subtitulo={`S/ ${ventasHoy?.mesas_activas?.total_acumulado?.toFixed(2) || '0.00'} acumulado`}
            icono="🍽️"
            color="from-blue-500 to-blue-600"
          />

          <TarjetaEstadistica
            titulo="Ocupación"
            valor={`${estadisticas?.mesas?.porcentaje_ocupacion || 0}%`}
            subtitulo={`${estadisticas?.mesas?.ocupadas || 0} de ${estadisticas?.mesas?.total || 0} mesas`}
            icono="📍"
            color="from-purple-500 to-purple-600"
          />

          <TarjetaEstadistica
            titulo="Productos Activos"
            valor={estadisticas?.productos?.total_disponibles || 0}
            subtitulo="En el menú"
            icono="🍴"
            color="from-orange-500 to-orange-600"
          />
        </div>
      </div>

      {/* Productos más vendidos */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">🔥 Productos Más Vendidos Hoy</h3>
        {ventasHoy?.productos_mas_vendidos?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Producto</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Cantidad</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Total Generado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {ventasHoy.productos_mas_vendidos.map((prod, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">{prod.nombre}</td>
                    <td className="px-4 py-3 text-sm text-center text-gray-600">{prod.cantidad_vendida}</td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-green-600">
                      S/ {prod.total_generado.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No hay ventas registradas hoy</p>
        )}
      </div>

      {/* Estado de pedidos */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">📋 Estado de Pedidos del Día</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {ventasHoy?.pedidos_por_estado?.map((estado, idx) => (
            <div key={idx} className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-gray-800">{estado.cantidad}</p>
              <p className="text-sm text-gray-600 capitalize mt-1">
                {estado.estado === 'en_preparacion' ? 'En Preparación' :
                 estado.estado === 'listo' ? 'Listos' :
                 estado.estado}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Estadísticas históricas */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">📈 Estadísticas Generales</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border-l-4 border-green-500 pl-4">
            <p className="text-sm text-gray-600">Total Generado (Histórico)</p>
            <p className="text-2xl font-bold text-green-600">
              S/ {estadisticas?.ventas_historicas?.total_generado?.toFixed(2) || '0.00'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {estadisticas?.ventas_historicas?.mesas_atendidas || 0} mesas atendidas
            </p>
          </div>

          <div className="border-l-4 border-blue-500 pl-4">
            <p className="text-sm text-gray-600">Promedio por Mesa</p>
            <p className="text-2xl font-bold text-blue-600">
              S/ {estadisticas?.ventas_historicas?.promedio_por_mesa?.toFixed(2) || '0.00'}
            </p>
            <p className="text-xs text-gray-500 mt-1">Ticket promedio</p>
          </div>

          <div className="border-l-4 border-purple-500 pl-4">
            <p className="text-sm text-gray-600">Tasa de Ocupación</p>
            <p className="text-2xl font-bold text-purple-600">
              {estadisticas?.mesas?.porcentaje_ocupacion || 0}%
            </p>
            <p className="text-xs text-gray-500 mt-1">Actual</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navegación lateral */}
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-gradient-to-b from-gray-900 to-gray-800 min-h-screen text-white p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-1">👨‍💼 Admin Panel</h1>
            <p className="text-sm text-gray-400">Panel de Administración</p>
          </div>

          <nav className="space-y-2">
            <button
              onClick={() => setVistaActual('dashboard')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                vistaActual === 'dashboard'
                  ? 'bg-orange-500 text-white'
                  : 'hover:bg-gray-700 text-gray-300'
              }`}
            >
              📊 Dashboard
            </button>

            <button
              onClick={() => setVistaActual('ventas')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                vistaActual === 'ventas'
                  ? 'bg-orange-500 text-white'
                  : 'hover:bg-gray-700 text-gray-300'
              }`}
            >
              💰 Historial de Ventas
            </button>

            <button
              onClick={() => setVistaActual('productos')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                vistaActual === 'productos'
                  ? 'bg-orange-500 text-white'
                  : 'hover:bg-gray-700 text-gray-300'
              }`}
            >
              🍴 Gestión de Productos
            </button>

            <button
              onClick={() => setVistaActual('mesas')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                vistaActual === 'mesas'
                  ? 'bg-orange-500 text-white'
                  : 'hover:bg-gray-700 text-gray-300'
              }`}
            >
              🪑 Gestión de Mesas
            </button>

            <div className="pt-4 mt-4 border-t border-gray-700">
              <button
                onClick={() => window.location.href = '/'}
                className="w-full text-left px-4 py-3 rounded-lg hover:bg-red-600 text-gray-300 transition-colors"
              >
                🚪 Salir
              </button>
            </div>
          </nav>

          <div className="mt-8 pt-8 border-t border-gray-700">
            <button
              onClick={cargarDatos}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-semibold transition-colors"
            >
              🔄 Actualizar Datos
            </button>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {vistaActual === 'dashboard' && <DashboardPrincipal />}
            {vistaActual === 'ventas' && <div className="bg-white rounded-lg shadow-md p-6"><p className="text-gray-600">Historial de ventas - En construcción</p></div>}
            {vistaActual === 'productos' && <div className="bg-white rounded-lg shadow-md p-6"><p className="text-gray-600">Gestión de productos - En construcción</p></div>}
            {vistaActual === 'mesas' && <div className="bg-white rounded-lg shadow-md p-6"><p className="text-gray-600">Gestión de mesas - En construcción</p></div>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Admin;
