import PropTypes from 'prop-types';

function CarritoPedido({ items, onCambiarCantidad, onEliminar, onEnviar }) {
  const subtotal = items.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);

  if (items.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-300 rounded-lg p-8 text-center">
        <p className="text-gray-500">No hay productos en el carrito</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="p-4 bg-blue-50 border-b border-blue-200">
        <h3 className="font-bold text-lg text-gray-800">Carrito de Pedido</h3>
      </div>

      <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
        {items.map((item, index) => (
          <div key={index} className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800">
                  {item.nombre}{item.tamano ? ` (${item.tamano})` : ''}
                </h4>
                <p className="text-sm text-gray-600">S/ {item.precio.toFixed(2)} c/u</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onCambiarCantidad(index, item.cantidad - 1)}
                  className="w-8 h-8 bg-gray-300 hover:bg-gray-400 rounded-full flex items-center justify-center font-bold text-gray-700"
                >
                  -
                </button>

                <span className="w-8 text-center font-bold text-gray-800">
                  {item.cantidad}
                </span>

                <button
                  onClick={() => onCambiarCantidad(index, item.cantidad + 1)}
                  className="w-8 h-8 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center font-bold text-white"
                >
                  +
                </button>
              </div>

              <div className="w-20 text-right">
                <p className="font-bold text-gray-800">
                  S/ {(item.precio * item.cantidad).toFixed(2)}
                </p>
              </div>

              <button
                onClick={() => onEliminar(index)}
                className="ml-2 w-8 h-8 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white"
              >
                ×
              </button>
            </div>

            {/* Mostrar notas si existen */}
            {item.notas && (
              <div className="mt-2 pt-2 border-t border-gray-300">
                <p className="text-xs text-gray-500 font-semibold">Nota:</p>
                <p className="text-sm text-gray-700 italic">{item.notas}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="p-4 bg-gray-50 border-t border-gray-200 space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold text-gray-700">Subtotal:</span>
          <span className="text-2xl font-bold text-blue-600">
            S/ {subtotal.toFixed(2)}
          </span>
        </div>

        <button
          onClick={onEnviar}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
        >
          Enviar a Cocina
        </button>
      </div>
    </div>
  );
}

CarritoPedido.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      nombre: PropTypes.string.isRequired,
      precio: PropTypes.number.isRequired,
      cantidad: PropTypes.number.isRequired,
      producto_id: PropTypes.number.isRequired,
      variante_id: PropTypes.number.isRequired,
      tamano: PropTypes.string
    })
  ).isRequired,
  onCambiarCantidad: PropTypes.func.isRequired,
  onEliminar: PropTypes.func.isRequired,
  onEnviar: PropTypes.func.isRequired
};

export default CarritoPedido;
