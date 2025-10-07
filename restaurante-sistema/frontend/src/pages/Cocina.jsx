import { useState, useEffect } from 'react';
import TarjetaPedido from '../components/TarjetaPedido';
import FiltroPedidos from '../components/FiltroPedidos';
import { getPedidosPendientes, cambiarEstadoPedido } from '../services/api';

function Cocina() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('todos'); // 'todos', 'pendiente', 'en_preparacion'
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    cargarPedidos();

    // Auto-refresh cada 5 segundos si está activado
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        cargarPedidos();
      }, 5000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const cargarPedidos = async () => {
    try {
      setLoading(true);
      const response = await getPedidosPendientes();
      setPedidos(response.data || []);
    } catch (error) {
      console.error('Error al cargar pedidos:', error);
      alert('Error al cargar pedidos: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleCambiarEstado = async (pedidoId, nuevoEstado) => {
    try {
      await cambiarEstadoPedido(pedidoId, nuevoEstado);
      // Actualizar estado local inmediatamente para mejor UX
      setPedidos(prevPedidos =>
        prevPedidos.map(p =>
          p.id === pedidoId ? { ...p, estado: nuevoEstado } : p
        ).filter(p => p.estado !== 'completado') // Remover completados
      );
    } catch (error) {
      alert('Error al cambiar estado: ' + (error.response?.data?.error || error.message));
      cargarPedidos(); // Recargar en caso de error
    }
  };

  // Calcular contadores para cada filtro
  const contadores = {
    todos: pedidos.length,
    pendiente: pedidos.filter(p => p.estado === 'pendiente').length,
    en_preparacion: pedidos.filter(p => p.estado === 'en_preparacion').length,
    completado: pedidos.filter(p => p.estado === 'completado').length
  };

  // Filtrar pedidos según el filtro seleccionado
  const pedidosFiltrados = pedidos.filter(pedido => {
    if (filtroEstado === 'todos') return true;
    return pedido.estado === filtroEstado;
  });

  // Ordenar pedidos por antigüedad (más antiguos primero)
  const pedidosOrdenados = [...pedidosFiltrados].sort((a, b) => {
    return new Date(a.creado_en) - new Date(b.creado_en);
  });

  // Agrupar pedidos por estado
  const pedidosPendientes = pedidosOrdenados.filter(p => p.estado === 'pendiente');
  const pedidosEnPreparacion = pedidosOrdenados.filter(p => p.estado === 'en_preparacion');
  const pedidosCompletados = pedidosOrdenados.filter(p => p.estado === 'completado');

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-800">🍳 Panel de Cocina</h1>
              <p className="text-gray-600 mt-1">
                {pedidos.length} {pedidos.length === 1 ? 'pedido' : 'pedidos'} activo{pedidos.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="flex gap-3 flex-wrap">
              {/* Botón Auto-refresh */}
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  autoRefresh
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                }`}
              >
                {autoRefresh ? '🔄 Auto' : '⏸️ Manual'}
              </button>

              {/* Botón Refrescar manual */}
              <button
                onClick={cargarPedidos}
                disabled={loading}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? '⏳' : '🔄'} Refrescar
              </button>
            </div>
          </div>

          {/* Filtros */}
          <div className="mt-4">
            <FiltroPedidos
              filtroActual={filtroEstado}
              onCambiarFiltro={setFiltroEstado}
              contadores={contadores}
            />
          </div>
        </div>

        {/* Loading */}
        {loading && pedidos.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Cargando pedidos...</p>
          </div>
        )}

        {/* Sin pedidos */}
        {!loading && pedidosFiltrados.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500 text-xl">
              {filtroEstado === 'todos'
                ? '🎉 No hay pedidos pendientes'
                : `No hay pedidos en estado "${filtroEstado.replace('_', ' ')}"`
              }
            </p>
          </div>
        )}

        {/* Columnas de pedidos */}
        {!loading && pedidosFiltrados.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Columna: Pendientes */}
            {(filtroEstado === 'todos' || filtroEstado === 'pendiente') && pedidosPendientes.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-yellow-700 flex items-center gap-2 sticky top-0 bg-purple-50 py-2 z-10">
                  ⏳ Pendientes
                  <span className="bg-yellow-500 text-white text-lg rounded-full px-4 py-2">
                    {pedidosPendientes.length}
                  </span>
                </h2>
                {pedidosPendientes.map(pedido => (
                  <TarjetaPedido
                    key={pedido.id}
                    pedido={pedido}
                    onCambiarEstado={handleCambiarEstado}
                  />
                ))}
              </div>
            )}

            {/* Columna: En Preparación */}
            {(filtroEstado === 'todos' || filtroEstado === 'en_preparacion') && pedidosEnPreparacion.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-blue-700 flex items-center gap-2 sticky top-0 bg-purple-50 py-2 z-10">
                  👨‍🍳 En Preparación
                  <span className="bg-blue-500 text-white text-lg rounded-full px-4 py-2">
                    {pedidosEnPreparacion.length}
                  </span>
                </h2>
                {pedidosEnPreparacion.map(pedido => (
                  <TarjetaPedido
                    key={pedido.id}
                    pedido={pedido}
                    onCambiarEstado={handleCambiarEstado}
                  />
                ))}
              </div>
            )}

            {/* Columna: Listos */}
            {(filtroEstado === 'todos' || filtroEstado === 'completado') && pedidosCompletados.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-green-700 flex items-center gap-2 sticky top-0 bg-purple-50 py-2 z-10">
                  ✅ Listos
                  <span className="bg-green-500 text-white text-lg rounded-full px-4 py-2">
                    {pedidosCompletados.length}
                  </span>
                </h2>
                {pedidosCompletados.map(pedido => (
                  <TarjetaPedido
                    key={pedido.id}
                    pedido={pedido}
                    onCambiarEstado={handleCambiarEstado}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Cocina;
