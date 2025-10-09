import PropTypes from 'prop-types';
import { calcularTiempoTranscurrido } from '../utils/dateUtils';

function TarjetaMesa({ mesa, onClick, onAgregarPedidoRapido }) {
  const esLibre = mesa.estado === 'libre';
  const esOcupada = mesa.estado === 'ocupada';

  const handleClickPrincipal = (e) => {
    // Solo llamar onClick si no se hizo click en el botón rápido
    if (!e.target.closest('.boton-rapido')) {
      onClick();
    }
  };

  const handleAgregarPedido = (e) => {
    e.stopPropagation();
    if (onAgregarPedidoRapido) {
      onAgregarPedidoRapido(mesa);
    }
  };

  return (
    <div
      onClick={handleClickPrincipal}
      className={`
        p-6 rounded-lg shadow-md cursor-pointer transition-all hover:shadow-xl relative
        ${esLibre ? 'bg-green-100 border-2 border-green-500' : ''}
        ${esOcupada ? 'bg-red-100 border-2 border-red-500' : ''}
        ${mesa.estado === 'reservada' ? 'bg-yellow-100 border-2 border-yellow-500' : ''}
      `}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-2xl font-bold text-gray-800">
          Mesa {mesa.numero}
        </h3>
        <span
          className={`
            px-3 py-1 rounded-full text-sm font-semibold
            ${esLibre ? 'bg-green-500 text-white' : ''}
            ${esOcupada ? 'bg-red-500 text-white' : ''}
            ${mesa.estado === 'reservada' ? 'bg-yellow-500 text-white' : ''}
          `}
        >
          {mesa.estado === 'libre' ? 'Libre' :
           mesa.estado === 'ocupada' ? 'Ocupada' : 'Reservada'}
        </span>
      </div>

      {esOcupada && (
        <>
          <div className="mt-4 pt-4 border-t border-red-300">
            <p className="text-sm text-gray-600 mb-1">Total actual:</p>
            <p className="text-2xl font-bold text-red-700">
              S/ {mesa.total_actual ? mesa.total_actual.toFixed(2) : '0.00'}
            </p>
          </div>

          {/* Resumen de pedidos */}
          {mesa.total_pedidos > 0 && (
            <div className="mt-3 pt-3 border-t border-red-200 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-semibold text-gray-700">📋 {mesa.total_pedidos} {mesa.total_pedidos === 1 ? 'pedido' : 'pedidos'}</span>
              </div>

              {/* Últimos items - Desktop: mostrar 3, Mobile: mostrar 2 */}
              {mesa.ultimos_items && mesa.ultimos_items.length > 0 && (
                <div className="text-xs text-gray-600 space-y-1">
                  {mesa.ultimos_items.slice(0, 3).map((item, idx) => (
                    <div key={idx} className={`flex items-start gap-1 ${idx >= 2 ? 'hidden md:flex' : ''}`}>
                      <span className="text-gray-400">•</span>
                      <span className="flex-1 truncate">
                        {item.cantidad}x {item.producto_nombre}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Tiempo desde último pedido */}
              {mesa.ultimo_pedido_en && (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <span>⏱️</span>
                  <span>Último: hace {calcularTiempoTranscurrido(mesa.ultimo_pedido_en).texto}</span>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {esLibre && (
        <p className="text-sm text-gray-500 mt-4">
          Click para abrir mesa
        </p>
      )}

      {/* Botón rápido para agregar pedido en mesas ocupadas */}
      {esOcupada && onAgregarPedidoRapido && (
        <button
          onClick={handleAgregarPedido}
          className="boton-rapido absolute bottom-2 right-2 bg-blue-500 hover:bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold shadow-lg transition-all hover:scale-110"
          title="Agregar pedido rápido"
        >
          +
        </button>
      )}
    </div>
  );
}

TarjetaMesa.propTypes = {
  mesa: PropTypes.shape({
    id: PropTypes.number.isRequired,
    numero: PropTypes.number.isRequired,
    estado: PropTypes.string.isRequired,
    total_actual: PropTypes.number,
    total_pedidos: PropTypes.number,
    ultimos_items: PropTypes.arrayOf(
      PropTypes.shape({
        cantidad: PropTypes.number,
        producto_nombre: PropTypes.string,
        creado_en: PropTypes.string
      })
    ),
    ultimo_pedido_en: PropTypes.string
  }).isRequired,
  onClick: PropTypes.func.isRequired,
  onAgregarPedidoRapido: PropTypes.func
};

export default TarjetaMesa;
