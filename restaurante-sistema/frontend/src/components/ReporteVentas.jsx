import { useState, useEffect } from 'react';
import { getHistorialVentas } from '../services/api';

function ReporteVentas() {
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [reporte, setReporte] = useState(null);
  const [loading, setLoading] = useState(false);
  const [vistaActual, setVistaActual] = useState('resumen'); // resumen, detallada, productos

  // Establecer fechas por defecto (últimos 30 días)
  useEffect(() => {
    const hoy = new Date();
    const hace30Dias = new Date();
    hace30Dias.setDate(hace30Dias.getDate() - 30);

    setFechaFin(formatearFecha(hoy));
    setFechaInicio(formatearFecha(hace30Dias));
  }, []);

  const formatearFecha = (fecha) => {
    return fecha.toISOString().split('T')[0];
  };

  const buscarVentas = async () => {
    if (!fechaInicio || !fechaFin) {
      alert('Por favor selecciona ambas fechas');
      return;
    }

    if (new Date(fechaInicio) > new Date(fechaFin)) {
      alert('La fecha de inicio no puede ser mayor que la fecha fin');
      return;
    }

    try {
      setLoading(true);
      console.log('🔍 Buscando ventas:', { fechaInicio, fechaFin });
      const response = await getHistorialVentas(fechaInicio, fechaFin);
      console.log('📊 Respuesta del servidor:', response.data);
      setReporte(response.data);

      // Auto-seleccionar la vista detallada si hay ventas
      if (response.data?.ventas_detalladas && response.data.ventas_detalladas.length > 0) {
        setVistaActual('detallada');
      }
    } catch (error) {
      console.error('Error al buscar ventas:', error);
      alert('Error al cargar el reporte de ventas: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const exportarACSV = () => {
    if (!reporte?.ventas_detalladas || reporte.ventas_detalladas.length === 0) {
      alert('No hay datos para exportar');
      return;
    }

    // Crear CSV con detalle completo
    let csv = 'Fecha,Mesa,Producto,Variante,Cantidad,Precio Unitario,Subtotal,Total Mesa\n';

    reporte.ventas_detalladas.forEach(venta => {
      const fecha = new Date(venta.fecha_cierre).toLocaleString('es-PE');

      if (venta.productos && venta.productos.length > 0) {
        venta.productos.forEach((producto, idx) => {
          csv += `${fecha},Mesa ${venta.mesa_numero},"${producto.producto}","${producto.variante || 'N/A'}",${producto.cantidad},${producto.precio_unitario.toFixed(2)},${producto.subtotal.toFixed(2)}`;
          // Solo agregar el total en la primera línea de cada mesa
          if (idx === 0) {
            csv += `,${venta.total_venta.toFixed(2)}`;
          }
          csv += '\n';
        });
      } else {
        csv += `${fecha},Mesa ${venta.mesa_numero},Sin productos,,0,0.00,0.00,${venta.total_venta.toFixed(2)}\n`;
      }
    });

    // Agregar resumen al final
    csv += '\n';
    csv += `RESUMEN DEL PERÍODO: ${fechaInicio} a ${fechaFin}\n`;
    csv += `Total de Ventas,${reporte.ventas_detalladas.length}\n`;
    csv += `Ingresos Totales,S/ ${reporte.resumen?.total_ingresos?.toFixed(2) || '0.00'}\n`;
    csv += `Mesas Atendidas,${reporte.resumen?.total_mesas || 0}\n`;
    csv += `Promedio por Mesa,S/ ${reporte.resumen?.promedio_por_mesa?.toFixed(2) || '0.00'}\n`;

    // Descargar archivo
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `reporte-ventas-detallado-${fechaInicio}-${fechaFin}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportarAPDF = () => {
    window.print();
  };

  // Vista de Resumen
  const VistaResumen = () => {
    if (!reporte?.resumen) return null;

    return (
      <div className="space-y-6">
        {/* Tarjetas de resumen */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
            <p className="text-sm opacity-90 mb-1">Ingresos Totales</p>
            <p className="text-3xl font-bold">S/ {(reporte.resumen.total_ingresos || 0).toFixed(2)}</p>
            <p className="text-xs opacity-75 mt-1">{reporte.resumen.total_mesas || 0} mesas</p>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <p className="text-sm opacity-90 mb-1">Total Pedidos</p>
            <p className="text-3xl font-bold">{reporte.resumen.total_pedidos || 0}</p>
            <p className="text-xs opacity-75 mt-1">Período seleccionado</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <p className="text-sm opacity-90 mb-1">Promedio por Mesa</p>
            <p className="text-3xl font-bold">S/ {(reporte.resumen.promedio_por_mesa || 0).toFixed(2)}</p>
            <p className="text-xs opacity-75 mt-1">Ticket promedio</p>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
            <p className="text-sm opacity-90 mb-1">Mesas Atendidas</p>
            <p className="text-3xl font-bold">{reporte.resumen.total_mesas || 0}</p>
            <p className="text-xs opacity-75 mt-1">En el período</p>
          </div>
        </div>

        {/* Ventas por fecha */}
        {reporte.ventas_por_fecha && reporte.ventas_por_fecha.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Ventas por Día</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Fecha</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Mesas</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Pedidos</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Total Vendido</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {reporte.ventas_por_fecha.map((venta, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-800">
                        {new Date(venta.fecha + 'T00:00:00').toLocaleDateString('es-PE', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="px-4 py-3 text-sm text-center text-gray-600">{venta.mesas_atendidas || 0}</td>
                      <td className="px-4 py-3 text-sm text-center text-gray-600">{venta.total_pedidos || 0}</td>
                      <td className="px-4 py-3 text-sm text-right font-semibold text-green-600">
                        S/ {(venta.total_ventas || 0).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td className="px-4 py-3 text-sm font-bold text-gray-800">TOTAL</td>
                    <td className="px-4 py-3 text-sm text-center font-bold text-gray-800">
                      {reporte.ventas_por_fecha.reduce((sum, v) => sum + (v.mesas_atendidas || 0), 0)}
                    </td>
                    <td className="px-4 py-3 text-sm text-center font-bold text-gray-800">
                      {reporte.ventas_por_fecha.reduce((sum, v) => sum + (v.total_pedidos || 0), 0)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-bold text-green-700">
                      S/ {reporte.ventas_por_fecha.reduce((sum, v) => sum + (v.total_ventas || 0), 0).toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Vista Detallada
  const VistaDetallada = () => {
    if (!reporte?.ventas_detalladas) return null;

    return (
      <div className="space-y-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Detalle Completo de Ventas</h3>
          {reporte.ventas_detalladas.length > 0 ? (
            <div className="space-y-6">
              {reporte.ventas_detalladas.map((venta, idx) => (
                <div key={idx} className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                  {/* Encabezado de la venta */}
                  <div className="flex justify-between items-start mb-4 pb-3 border-b border-gray-200">
                    <div>
                      <h4 className="text-lg font-bold text-gray-800">Mesa {venta.mesa_numero}</h4>
                      <p className="text-sm text-gray-600">
                        {new Date(venta.fecha_cierre).toLocaleString('es-PE', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {venta.total_pedidos} {venta.total_pedidos === 1 ? 'pedido' : 'pedidos'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Total</p>
                      <p className="text-2xl font-bold text-green-600">
                        S/ {(venta.total_venta || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Detalle de productos */}
                  {venta.productos && venta.productos.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-2">Productos consumidos:</p>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <table className="w-full">
                          <thead>
                            <tr className="text-xs text-gray-600 border-b border-gray-200">
                              <th className="text-left pb-2">Producto</th>
                              <th className="text-center pb-2">Cant.</th>
                              <th className="text-right pb-2">Precio</th>
                              <th className="text-right pb-2">Subtotal</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {venta.productos.map((producto, pIdx) => (
                              <tr key={pIdx} className="text-sm">
                                <td className="py-2 text-gray-800">
                                  <div>
                                    <p className="font-medium">{producto.producto}</p>
                                    {producto.variante && (
                                      <p className="text-xs text-gray-500">{producto.variante}</p>
                                    )}
                                    {producto.notas && (
                                      <p className="text-xs text-blue-600 italic">Nota: {producto.notas}</p>
                                    )}
                                  </div>
                                </td>
                                <td className="py-2 text-center text-gray-600">
                                  {producto.cantidad}
                                </td>
                                <td className="py-2 text-right text-gray-600">
                                  S/ {(producto.precio_unitario || 0).toFixed(2)}
                                </td>
                                <td className="py-2 text-right font-semibold text-gray-800">
                                  S/ {(producto.subtotal || 0).toFixed(2)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Resumen total */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border-2 border-green-200">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">Total de ventas en el período</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {reporte.ventas_detalladas.length} {reporte.ventas_detalladas.length === 1 ? 'venta' : 'ventas'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Ingresos Totales</p>
                    <p className="text-3xl font-bold text-green-600">
                      S/ {reporte.ventas_detalladas.reduce((sum, v) => sum + (v.total_venta || 0), 0).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No hay ventas en el período seleccionado</p>
          )}
        </div>
      </div>
    );
  };

  // Vista Productos
  const VistaProductos = () => {
    if (!reporte?.productos_mas_vendidos) return null;

    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Productos Más Vendidos</h3>
        {reporte.productos_mas_vendidos.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Producto</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Categoría</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Cantidad</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Total Generado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {reporte.productos_mas_vendidos.map((producto, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">{producto.nombre}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 capitalize">{producto.categoria}</td>
                  <td className="px-4 py-3 text-sm text-center text-gray-600">{producto.cantidad_vendida || 0}</td>
                  <td className="px-4 py-3 text-sm text-right font-semibold text-green-600">
                    S/ {(producto.total_generado || 0).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No hay productos vendidos en el período seleccionado</p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Filtros de búsqueda */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Buscar Ventas por Fecha</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha Inicio
            </label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha Fin
            </label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={buscarVentas}
              disabled={loading}
              className="w-full px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Buscando...' : 'Buscar Ventas'}
            </button>
          </div>
        </div>

        {/* Botones de acceso rápido */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              const hoy = new Date();
              const fechaFormateada = formatearFecha(hoy);
              setFechaInicio(fechaFormateada);
              setFechaFin(fechaFormateada);
              // Auto-buscar después de establecer fechas
              setTimeout(() => buscarVentas(), 100);
            }}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
          >
            Hoy
          </button>
          <button
            onClick={() => {
              const hoy = new Date();
              const ayer = new Date(hoy);
              ayer.setDate(ayer.getDate() - 1);
              const fechaFormateada = formatearFecha(ayer);
              setFechaInicio(fechaFormateada);
              setFechaFin(fechaFormateada);
              setTimeout(() => buscarVentas(), 100);
            }}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
          >
            Ayer
          </button>
          <button
            onClick={() => {
              const hoy = new Date();
              const hace7Dias = new Date(hoy);
              hace7Dias.setDate(hace7Dias.getDate() - 6); // -6 para incluir hoy
              setFechaInicio(formatearFecha(hace7Dias));
              setFechaFin(formatearFecha(hoy));
              setTimeout(() => buscarVentas(), 100);
            }}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
          >
            Últimos 7 días
          </button>
          <button
            onClick={() => {
              const hoy = new Date();
              const hace30Dias = new Date(hoy);
              hace30Dias.setDate(hace30Dias.getDate() - 29); // -29 para incluir hoy
              setFechaInicio(formatearFecha(hace30Dias));
              setFechaFin(formatearFecha(hoy));
              setTimeout(() => buscarVentas(), 100);
            }}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
          >
            Últimos 30 días
          </button>
          <button
            onClick={() => {
              const hoy = new Date();
              const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
              setFechaInicio(formatearFecha(primerDiaMes));
              setFechaFin(formatearFecha(hoy));
              setTimeout(() => buscarVentas(), 100);
            }}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
          >
            Este mes
          </button>
          <button
            onClick={() => {
              const hoy = new Date();
              const mesAnterior = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
              const ultimoDiaMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth(), 0);
              setFechaInicio(formatearFecha(mesAnterior));
              setFechaFin(formatearFecha(ultimoDiaMesAnterior));
              setTimeout(() => buscarVentas(), 100);
            }}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
          >
            Mes anterior
          </button>
        </div>
      </div>

      {/* Resultados */}
      {loading && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Generando reporte...</p>
        </div>
      )}

      {!loading && reporte && (
        <>
          {/* Pestañas de navegación */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => setVistaActual('resumen')}
                className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                  vistaActual === 'resumen'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Resumen
              </button>
              <button
                onClick={() => setVistaActual('detallada')}
                className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                  vistaActual === 'detallada'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Vista Detallada
              </button>
              <button
                onClick={() => setVistaActual('productos')}
                className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                  vistaActual === 'productos'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Productos
              </button>
            </div>

            {/* Botones de exportación */}
            <div className="flex gap-2">
              <button
                onClick={exportarACSV}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition-colors"
              >
                Exportar CSV
              </button>
              <button
                onClick={exportarAPDF}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors"
              >
                Imprimir / PDF
              </button>
            </div>
          </div>

          {/* Contenido según vista */}
          {vistaActual === 'resumen' && <VistaResumen />}
          {vistaActual === 'detallada' && <VistaDetallada />}
          {vistaActual === 'productos' && <VistaProductos />}
        </>
      )}

      {!loading && !reporte && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="text-4xl mb-4">📊</div>
          <p className="text-gray-600">Selecciona un rango de fechas y haz clic en "Buscar Ventas" para ver el reporte</p>
        </div>
      )}
    </div>
  );
}

export default ReporteVentas;
