import { useState, useMemo } from 'react';
import PropTypes from 'prop-types';

function ListaProductos({ productos, onAgregarProducto }) {
  const [busqueda, setBusqueda] = useState('');
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [varianteSeleccionada, setVarianteSeleccionada] = useState(null);
  const [notasEspeciales, setNotasEspeciales] = useState('');

  // Agrupar productos por categoría
  const productosAgrupados = useMemo(() => {
    const filtrados = productos.filter(p =>
      p.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );

    return filtrados.reduce((grupos, producto) => {
      const categoria = producto.categoria;
      if (!grupos[categoria]) {
        grupos[categoria] = [];
      }
      grupos[categoria].push(producto);
      return grupos;
    }, {});
  }, [productos, busqueda]);

  const categoriasOrdenadas = {
    'bebida': 'Bebidas',
    'entrada': 'Entradas',
    'plato_principal': 'Platos Principales',
    'postre': 'Postres'
  };

  const handleClickProducto = (producto) => {
    // Siempre mostrar modal para permitir agregar notas
    setProductoSeleccionado(producto);
    if (producto.variantes && producto.variantes.length === 1) {
      setVarianteSeleccionada(producto.variantes[0]);
    } else {
      setVarianteSeleccionada(null);
    }
    setNotasEspeciales('');
  };

  const handleConfirmarVariante = () => {
    if (productoSeleccionado && varianteSeleccionada) {
      onAgregarProducto(productoSeleccionado, varianteSeleccionada, notasEspeciales);
      setProductoSeleccionado(null);
      setVarianteSeleccionada(null);
      setNotasEspeciales('');
    }
  };

  const handleCancelarModal = () => {
    setProductoSeleccionado(null);
    setVarianteSeleccionada(null);
    setNotasEspeciales('');
  };

  return (
    <div className="space-y-6">
      {/* Buscador */}
      <div className="sticky top-0 bg-white z-10 pb-4">
        <input
          type="text"
          placeholder="Buscar productos..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Productos por categoría */}
      {Object.entries(productosAgrupados).map(([categoria, items]) => (
        <div key={categoria} className="space-y-3">
          <h3 className="text-xl font-bold text-gray-700 border-b-2 border-gray-300 pb-2">
            {categoriasOrdenadas[categoria] || categoria}
          </h3>

          <div className="grid gap-3">
            {items.map(producto => (
              <div
                key={producto.id}
                className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800">{producto.nombre}</h4>
                  {producto.variantes && producto.variantes.length === 1 ? (
                    <p className="text-lg font-bold text-blue-600">
                      S/ {producto.variantes[0].precio.toFixed(2)}
                    </p>
                  ) : producto.variantes && producto.variantes.length > 1 ? (
                    <p className="text-sm text-gray-600">
                      Desde S/ {Math.min(...producto.variantes.map(v => v.precio)).toFixed(2)}
                    </p>
                  ) : null}
                </div>

                <button
                  onClick={() => handleClickProducto(producto)}
                  disabled={!producto.disponible}
                  className={`
                    ml-4 w-10 h-10 rounded-full flex items-center justify-center text-white text-xl font-bold
                    transition-colors
                    ${producto.disponible
                      ? 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700'
                      : 'bg-gray-300 cursor-not-allowed'
                    }
                  `}
                >
                  +
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}

      {Object.keys(productosAgrupados).length === 0 && (
        <p className="text-center text-gray-500 py-8">
          No se encontraron productos
        </p>
      )}

      {/* Modal para seleccionar variante y notas */}
      {productoSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">{productoSeleccionado.nombre}</h3>

            {/* Selección de tamaño */}
            {productoSeleccionado.variantes && productoSeleccionado.variantes.length > 1 && (
              <>
                <p className="text-gray-600 mb-3 font-semibold">Selecciona un tamaño:</p>
                <div className="space-y-2 mb-5">
                  {productoSeleccionado.variantes?.map((variante) => (
                    <button
                      key={variante.id}
                      onClick={() => setVarianteSeleccionada(variante)}
                      className={`w-full p-4 border-2 rounded-lg text-left transition-colors ${
                        varianteSeleccionada?.id === variante.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">{variante.tamano}</span>
                        <span className="text-lg font-bold text-blue-600">
                          S/ {variante.precio.toFixed(2)}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* Tamaño único (mostrar solo info) */}
            {productoSeleccionado.variantes && productoSeleccionado.variantes.length === 1 && (
              <div className="mb-5 p-4 bg-blue-50 border-2 border-blue-500 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">{productoSeleccionado.variantes[0].tamano}</span>
                  <span className="text-lg font-bold text-blue-600">
                    S/ {productoSeleccionado.variantes[0].precio.toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {/* Campo de notas especiales */}
            <div className="mb-5">
              <label className="block text-gray-700 font-semibold mb-2">
                Notas especiales (opcional):
              </label>
              <textarea
                value={notasEspeciales}
                onChange={(e) => setNotasEspeciales(e.target.value)}
                placeholder="Ej: Sin cebolla, Extra picante, Término 3/4..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows="3"
              />
              <p className="text-xs text-gray-500 mt-1">
                Estas notas se enviarán a cocina junto con el pedido
              </p>
            </div>

            {/* Botones de acción */}
            <div className="flex gap-3">
              <button
                onClick={handleCancelarModal}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmarVariante}
                disabled={!varianteSeleccionada}
                className={`flex-1 px-4 py-2 rounded-lg text-white font-semibold ${
                  varianteSeleccionada
                    ? 'bg-blue-500 hover:bg-blue-600'
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                Agregar al Carrito
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

ListaProductos.propTypes = {
  productos: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      nombre: PropTypes.string.isRequired,
      categoria: PropTypes.string.isRequired,
      disponible: PropTypes.number.isRequired,
      variantes: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.number.isRequired,
          tamano: PropTypes.string.isRequired,
          precio: PropTypes.number.isRequired
        })
      )
    })
  ).isRequired,
  onAgregarProducto: PropTypes.func.isRequired
};

export default ListaProductos;
