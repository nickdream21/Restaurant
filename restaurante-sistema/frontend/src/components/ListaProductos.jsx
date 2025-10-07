import { useState, useMemo } from 'react';
import PropTypes from 'prop-types';

function ListaProductos({ productos, onAgregarProducto }) {
  const [busqueda, setBusqueda] = useState('');

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
                  <p className="text-lg font-bold text-blue-600">
                    ${producto.precio.toFixed(2)}
                  </p>
                </div>

                <button
                  onClick={() => onAgregarProducto(producto)}
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
    </div>
  );
}

ListaProductos.propTypes = {
  productos: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      nombre: PropTypes.string.isRequired,
      precio: PropTypes.number.isRequired,
      categoria: PropTypes.string.isRequired,
      disponible: PropTypes.number.isRequired
    })
  ).isRequired,
  onAgregarProducto: PropTypes.func.isRequired
};

export default ListaProductos;
