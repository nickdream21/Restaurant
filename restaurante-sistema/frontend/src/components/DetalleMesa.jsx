import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getMesaDetalle, cerrarMesa } from '../services/api';

function DetalleMesa({ mesa_id, onAgregarPedido, onCerrar }) {
  const [mesa, setMesa] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarDetalleMesa();
  }, [mesa_id]);

  const cargarDetalleMesa = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getMesaDetalle(mesa_id);
      setMesa(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar detalle de mesa');
    } finally {
      setLoading(false);
    }
  };

  const handleCerrarMesa = async () => {
    if (!confirm(`¿Confirmar cierre de Mesa ${mesa.numero}? Total: $${mesa.total_actual?.toFixed(2)}`)) {
      return;
    }

    try {
      await cerrarMesa(mesa_id);
      alert('Mesa cerrada exitosamente');
      if (onCerrar) onCerrar();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al cerrar mesa');
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'pendiente': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'en_preparacion': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'completado': return 'bg-green-100 text-green-800 border-green-300';
      case 'cancelado': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-gray-500">Cargando...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-300 rounded-lg p-4 text-red-700">
        {error}
      </div>
    );
  }

  if (!mesa) return null;

  const totalAcumulado = mesa.pedidos?.reduce((sum, pedido) => {
    const totalPedido = pedido.items?.reduce((s, item) => s + item.subtotal, 0) || 0;
    return sum + totalPedido;
  }, 0) || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-gray-300 rounded-lg p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Mesa {mesa.numero}</h2>
            <p className="text-sm text-gray-600 mt-1">
              Estado: <span className="font-semibold capitalize">{mesa.estado}</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Total Acumulado</p>
            <p className="text-3xl font-bold text-blue-600">
              ${totalAcumulado.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Pedidos */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-700">Pedidos</h3>

        {mesa.pedidos && mesa.pedidos.length > 0 ? (
          mesa.pedidos.map((pedido) => (
            <div key={pedido.id} className="bg-white border border-gray-300 rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-gray-600">
                  Pedido #{pedido.id} - {new Date(pedido.creado_en).toLocaleString()}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getEstadoColor(pedido.estado)}`}>
                  {pedido.estado.replace('_', ' ')}
                </span>
              </div>

              {pedido.items && pedido.items.length > 0 ? (
                <div className="space-y-2">
                  {pedido.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded">
                      <span className="font-medium">{item.producto_nombre}</span>
                      <span className="text-gray-600">
                        {item.cantidad} × ${item.precio_unitario.toFixed(2)} = ${item.subtotal.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Sin items</p>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center py-4">No hay pedidos en esta mesa</p>
        )}
      </div>

      {/* Botones de Acción */}
      <div className="flex gap-4">
        <button
          onClick={onAgregarPedido}
          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
        >
          + Agregar Pedido
        </button>

        {mesa.estado === 'ocupada' && (
          <button
            onClick={handleCerrarMesa}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Ver Cuenta / Cobrar
          </button>
        )}
      </div>
    </div>
  );
}

DetalleMesa.propTypes = {
  mesa_id: PropTypes.number.isRequired,
  onAgregarPedido: PropTypes.func.isRequired,
  onCerrar: PropTypes.func
};

export default DetalleMesa;
