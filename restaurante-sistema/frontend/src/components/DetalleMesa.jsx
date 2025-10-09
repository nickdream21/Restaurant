import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getMesaDetalle, cerrarMesa, cancelarPedido, eliminarItemPedido, cambiarEstadoPedido } from '../services/api';
import { formatearFechaCompletaPerú } from '../utils/dateUtils';

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
    // Verificar que no haya pedidos pendientes o en preparación
    const pedidosNoCompletados = mesa.pedidos?.filter(pedido =>
      pedido.estado !== 'completado' && pedido.estado !== 'cancelado'
    ) || [];

    if (pedidosNoCompletados.length > 0) {
      const pedidosListos = pedidosNoCompletados.filter(p => p.estado === 'listo');
      const pedidosEnProceso = pedidosNoCompletados.filter(p => p.estado !== 'listo');

      let mensaje = '❌ No se puede cobrar aún\n\n';

      if (pedidosListos.length > 0) {
        mensaje += '🍽️ PEDIDOS LISTOS PARA SERVIR:\n';
        pedidosListos.forEach(p => {
          mensaje += `  • Pedido #${p.id} - Listo (no servido)\n`;
        });
        mensaje += '\n👉 Debes marcar como SERVIDO usando el botón "✓ Servido"\n\n';
      }

      if (pedidosEnProceso.length > 0) {
        mensaje += '⏳ PEDIDOS EN PROCESO:\n';
        pedidosEnProceso.forEach(p => {
          const estadoTexto = p.estado === 'pendiente' ? 'Pendiente en cocina' :
                             p.estado === 'en_preparacion' ? 'En Preparación' : p.estado;
          mensaje += `  • Pedido #${p.id} - ${estadoTexto}\n`;
        });
        mensaje += '\n👉 Espera a que cocina termine o cancela si es necesario\n';
      }

      alert(mensaje);
      return;
    }

    // Calcular el total desde los pedidos (excluyendo cancelados)
    const totalAcumulado = mesa.pedidos?.reduce((sum, pedido) => {
      if (pedido.estado === 'cancelado') return sum;
      const totalPedido = pedido.items?.reduce((s, item) => s + item.subtotal, 0) || 0;
      return sum + totalPedido;
    }, 0) || 0;

    // Generar resumen de items
    const todosLosItems = [];
    mesa.pedidos?.forEach(pedido => {
      pedido.items?.forEach(item => {
        // Buscar si ya existe este producto en el resumen
        const existente = todosLosItems.find(i => i.nombre === item.producto_nombre && i.precio === item.precio_unitario);
        if (existente) {
          existente.cantidad += item.cantidad;
          existente.subtotal += item.subtotal;
        } else {
          todosLosItems.push({
            nombre: item.producto_nombre,
            cantidad: item.cantidad,
            precio: item.precio_unitario,
            subtotal: item.subtotal
          });
        }
      });
    });

    // Crear mensaje detallado
    let mensaje = `CERRAR Y COBRAR MESA ${mesa.numero}\n\n`;
    mensaje += '═══════════════════════════\n';
    mensaje += 'RESUMEN DE CONSUMO:\n';
    mensaje += '═══════════════════════════\n\n';

    todosLosItems.forEach(item => {
      mensaje += `${item.cantidad}x ${item.nombre}\n`;
      mensaje += `   S/ ${item.precio.toFixed(2)} c/u = S/ ${item.subtotal.toFixed(2)}\n\n`;
    });

    mensaje += '───────────────────────────\n';
    mensaje += `TOTAL A COBRAR: S/ ${totalAcumulado.toFixed(2)}\n`;
    mensaje += '═══════════════════════════\n\n';
    mensaje += '¿Confirmar cobro y cerrar mesa?';

    if (!confirm(mensaje)) {
      return;
    }

    try {
      await cerrarMesa(mesa_id);
      alert(`✅ Mesa ${mesa.numero} cerrada exitosamente\n\n💰 Total cobrado: S/ ${totalAcumulado.toFixed(2)}`);
      if (onCerrar) onCerrar();
    } catch (err) {
      alert('❌ Error al cerrar mesa: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleCancelarPedido = async (pedido) => {
    if (!confirm(`¿Cancelar pedido #${pedido.id}?\n\nEsto eliminará todos los items del pedido.\nEsta acción no se puede deshacer.`)) {
      return;
    }

    try {
      await cancelarPedido(pedido.id);
      alert('✅ Pedido cancelado exitosamente');
      await cargarDetalleMesa();
    } catch (err) {
      alert('❌ Error: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleEliminarItem = async (pedido_id, item) => {
    if (!confirm(`¿Eliminar este producto del pedido?\n\n${item.cantidad}x ${item.producto_nombre}\n\nEsta acción no se puede deshacer.`)) {
      return;
    }

    try {
      await eliminarItemPedido(pedido_id, item.id);
      alert('✅ Producto eliminado del pedido');
      await cargarDetalleMesa();
    } catch (err) {
      alert('❌ Error: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleMarcarServido = async (pedido) => {
    if (!confirm(`¿Marcar pedido #${pedido.id} como SERVIDO?\n\nConfirma que ya entregaste este pedido al cliente.`)) {
      return;
    }

    try {
      await cambiarEstadoPedido(pedido.id, 'completado');
      alert('✅ Pedido marcado como servido');
      await cargarDetalleMesa();
    } catch (err) {
      alert('❌ Error: ' + (err.response?.data?.error || err.message));
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'pendiente': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'en_preparacion': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'listo': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'completado': return 'bg-green-100 text-green-800 border-green-300';
      case 'cancelado': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const puedeEliminarItem = (estadoPedido) => {
    return ['pendiente', 'en_preparacion', 'listo'].includes(estadoPedido);
  };

  const puedeCancelarPedido = (estadoPedido) => {
    return estadoPedido === 'pendiente';
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
              S/ {totalAcumulado.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Pedidos */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-700">Pedidos</h3>

        {mesa.pedidos && mesa.pedidos.length > 0 ? (
          mesa.pedidos.map((pedido) => (
            <div
              key={pedido.id}
              className={`bg-white border rounded-lg p-4 ${
                pedido.estado === 'cancelado' ? 'opacity-60 border-gray-400' : 'border-gray-300'
              }`}
            >
              <div className="flex justify-between items-center mb-3">
                <span className={`text-sm ${pedido.estado === 'cancelado' ? 'text-gray-500 line-through' : 'text-gray-600'}`}>
                  Pedido #{pedido.id} - {formatearFechaCompletaPerú(pedido.creado_en)}
                </span>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getEstadoColor(pedido.estado)}`}>
                    {pedido.estado === 'en_preparacion' ? 'En Preparación' :
                     pedido.estado === 'listo' ? 'Listo' :
                     pedido.estado.charAt(0).toUpperCase() + pedido.estado.slice(1)}
                  </span>

                  {/* Botón marcar como servido (solo si está listo) */}
                  {pedido.estado === 'listo' && (
                    <button
                      onClick={() => handleMarcarServido(pedido)}
                      className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold rounded transition-colors"
                      title="Marcar como servido al cliente"
                    >
                      ✓ Servido
                    </button>
                  )}

                  {/* Botón cancelar pedido completo (solo si está pendiente) */}
                  {puedeCancelarPedido(pedido.estado) && (
                    <button
                      onClick={() => handleCancelarPedido(pedido)}
                      className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded transition-colors"
                      title="Cancelar pedido completo"
                    >
                      ✕ Cancelar
                    </button>
                  )}
                </div>
              </div>

              {pedido.items && pedido.items.length > 0 ? (
                <div className="space-y-2">
                  {pedido.items.map((item) => (
                    <div
                      key={item.id}
                      className={`bg-gray-50 p-2 rounded ${
                        pedido.estado === 'cancelado' ? 'opacity-60' : ''
                      }`}
                    >
                      <div className="flex justify-between items-center text-sm">
                        <span className={`font-medium flex-1 ${pedido.estado === 'cancelado' ? 'line-through' : ''}`}>
                          {item.producto_nombre}
                        </span>
                        <span className={`text-gray-600 ${pedido.estado === 'cancelado' ? 'line-through' : ''}`}>
                          {item.cantidad} × S/ {item.precio_unitario.toFixed(2)} = S/ {item.subtotal.toFixed(2)}
                        </span>

                        {/* Botón eliminar item individual */}
                        {puedeEliminarItem(pedido.estado) && (
                          <button
                            onClick={() => handleEliminarItem(pedido.id, item)}
                            className="ml-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold transition-colors"
                            title="Eliminar este producto"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                      {item.notas && (
                        <div className="mt-1 pt-1 border-t border-gray-300">
                          <p className={`text-xs text-gray-600 ${pedido.estado === 'cancelado' ? 'line-through' : ''}`}>
                            <span className="font-semibold">Nota:</span> <span className="italic">{item.notas}</span>
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Sin items</p>
              )}

              {/* Mensaje informativo para pedidos cancelados */}
              {pedido.estado === 'cancelado' && (
                <div className="mt-2 pt-2 border-t border-gray-300">
                  <p className="text-xs text-gray-500 italic">
                    ⓘ Este pedido fue cancelado y no se cobrará
                  </p>
                </div>
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
