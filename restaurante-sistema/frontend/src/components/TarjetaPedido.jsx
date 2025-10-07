import PropTypes from 'prop-types';

function TarjetaPedido({ pedido, onCambiarEstado }) {
  const getEstadoConfig = (estado) => {
    switch (estado) {
      case 'pendiente':
        return {
          color: 'bg-yellow-100 border-yellow-500 text-yellow-800',
          btnColor: 'bg-blue-500 hover:bg-blue-600',
          btnText: 'Iniciar Preparación',
          nuevoEstado: 'en_preparacion'
        };
      case 'en_preparacion':
        return {
          color: 'bg-blue-100 border-blue-500 text-blue-800',
          btnColor: 'bg-green-500 hover:bg-green-600',
          btnText: 'Marcar Listo',
          nuevoEstado: 'completado'
        };
      case 'completado':
        return {
          color: 'bg-green-100 border-green-500 text-green-800',
          btnColor: 'bg-gray-400',
          btnText: 'Completado',
          nuevoEstado: null
        };
      default:
        return {
          color: 'bg-gray-100 border-gray-500 text-gray-800',
          btnColor: 'bg-gray-400',
          btnText: 'Desconocido',
          nuevoEstado: null
        };
    }
  };

  const config = getEstadoConfig(pedido.estado);
  const tiempoTranscurrido = pedido.creado_en
    ? Math.floor((Date.now() - new Date(pedido.creado_en).getTime()) / 60000)
    : 0;

  return (
    <div className={`border-2 rounded-lg shadow-lg p-5 ${config.color} transition-all`}>
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-2xl font-bold">Mesa {pedido.mesa_numero}</h3>
          <p className="text-sm opacity-75">Pedido #{pedido.id}</p>
        </div>
        <div className="text-right">
          <span className="text-xs opacity-75">Hace</span>
          <p className="text-lg font-bold">{tiempoTranscurrido} min</p>
        </div>
      </div>

      {/* Items del pedido */}
      <div className="bg-white bg-opacity-50 rounded-lg p-3 mb-4 space-y-2">
        {pedido.items && pedido.items.length > 0 ? (
          pedido.items.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center">
              <span className="font-semibold">
                <span className="inline-block w-8 h-8 rounded-full bg-gray-800 text-white text-center leading-8 mr-2">
                  {item.cantidad}
                </span>
                {item.producto_nombre}
              </span>
              <span className="text-sm opacity-75 capitalize">
                {item.producto_categoria?.replace('_', ' ')}
              </span>
            </div>
          ))
        ) : (
          <p className="text-sm opacity-75">Sin items</p>
        )}
      </div>

      {/* Estado y acción */}
      <div className="flex justify-between items-center">
        <span className="font-bold text-sm uppercase tracking-wide">
          {pedido.estado.replace('_', ' ')}
        </span>

        {config.nuevoEstado && (
          <button
            onClick={() => onCambiarEstado(pedido.id, config.nuevoEstado)}
            className={`${config.btnColor} text-white font-bold py-2 px-4 rounded-lg transition-colors`}
          >
            {config.btnText}
          </button>
        )}
      </div>

      {/* Hora de creación */}
      <p className="text-xs opacity-50 mt-2">
        {new Date(pedido.creado_en).toLocaleTimeString()}
      </p>
    </div>
  );
}

TarjetaPedido.propTypes = {
  pedido: PropTypes.shape({
    id: PropTypes.number.isRequired,
    mesa_numero: PropTypes.number.isRequired,
    estado: PropTypes.string.isRequired,
    creado_en: PropTypes.string.isRequired,
    items: PropTypes.arrayOf(
      PropTypes.shape({
        cantidad: PropTypes.number.isRequired,
        producto_nombre: PropTypes.string.isRequired,
        producto_categoria: PropTypes.string
      })
    )
  }).isRequired,
  onCambiarEstado: PropTypes.func.isRequired
};

export default TarjetaPedido;
