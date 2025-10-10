import { useState, useEffect } from 'react';
import {
  getProductos,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  cambiarDisponibilidadProducto,
  agregarVariante,
  actualizarVariante,
  eliminarVariante
} from '../services/api';

function GestionProductos() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalVarianteAbierto, setModalVarianteAbierto] = useState(false);
  const [productoEditar, setProductoEditar] = useState(null);
  const [filtroCategoria, setFiltroCategoria] = useState('todas');
  const [busqueda, setBusqueda] = useState('');

  // Estado del formulario de producto
  const [formProducto, setFormProducto] = useState({
    nombre: '',
    categoria: 'bebida',
    variantes: [{ tamano: 'Personal', precio: '' }]
  });

  // Estado del formulario de variante
  const [formVariante, setFormVariante] = useState({
    productoId: null,
    varianteId: null,
    tamano: '',
    precio: '',
    esEdicion: false
  });

  const categorias = [
    { value: 'bebida', label: 'Bebidas', icon: '🥤' },
    { value: 'entrada', label: 'Entradas', icon: '🥗' },
    { value: 'plato_principal', label: 'Platos Principales', icon: '🍽️' },
    { value: 'postre', label: 'Postres', icon: '🍰' }
  ];

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      setLoading(true);
      const response = await getProductos();
      setProductos(response.data);
    } catch (error) {
      console.error('Error al cargar productos:', error);
      alert('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const handleAbrirModal = (producto = null) => {
    if (producto) {
      setProductoEditar(producto);
      setFormProducto({
        nombre: producto.nombre,
        categoria: producto.categoria,
        variantes: [] // No editamos variantes desde el modal principal
      });
    } else {
      setProductoEditar(null);
      setFormProducto({
        nombre: '',
        categoria: 'bebida',
        variantes: [{ tamano: 'Personal', precio: '' }]
      });
    }
    setModalAbierto(true);
  };

  const handleCerrarModal = () => {
    setModalAbierto(false);
    setProductoEditar(null);
    setFormProducto({
      nombre: '',
      categoria: 'bebida',
      variantes: [{ tamano: 'Personal', precio: '' }]
    });
  };

  const handleAgregarVarianteFormulario = () => {
    setFormProducto(prev => ({
      ...prev,
      variantes: [...prev.variantes, { tamano: '', precio: '' }]
    }));
  };

  const handleEliminarVarianteFormulario = (index) => {
    if (formProducto.variantes.length <= 1) {
      alert('Debe haber al menos una variante');
      return;
    }
    setFormProducto(prev => ({
      ...prev,
      variantes: prev.variantes.filter((_, i) => i !== index)
    }));
  };

  const handleChangeVariante = (index, field, value) => {
    setFormProducto(prev => ({
      ...prev,
      variantes: prev.variantes.map((v, i) =>
        i === index ? { ...v, [field]: value } : v
      )
    }));
  };

  const handleSubmitProducto = async (e) => {
    e.preventDefault();

    try {
      if (productoEditar) {
        // Actualizar producto (solo nombre y categoría)
        await actualizarProducto(productoEditar.id, {
          nombre: formProducto.nombre,
          categoria: formProducto.categoria
        });
        alert('Producto actualizado exitosamente');
      } else {
        // Crear nuevo producto con variantes
        const variantes = formProducto.variantes.map(v => ({
          tamano: v.tamano,
          precio: parseFloat(v.precio)
        }));

        await crearProducto({
          nombre: formProducto.nombre,
          categoria: formProducto.categoria,
          variantes
        });
        alert('Producto creado exitosamente');
      }

      handleCerrarModal();
      await cargarProductos();
    } catch (error) {
      console.error('Error al guardar producto:', error);
      alert(error.response?.data?.error || 'Error al guardar producto');
    }
  };

  const handleEliminarProducto = async (id, nombre) => {
    if (!confirm(`¿Estás seguro de eliminar el producto "${nombre}"?\n\nNota: No podrás eliminarlo si tiene pedidos activos.`)) {
      return;
    }

    try {
      await eliminarProducto(id);
      alert('Producto eliminado exitosamente');
      await cargarProductos();
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      alert(error.response?.data?.error || 'Error al eliminar producto');
    }
  };

  const handleToggleDisponibilidad = async (id, disponibleActual) => {
    try {
      await cambiarDisponibilidadProducto(id, !disponibleActual);
      await cargarProductos();
    } catch (error) {
      console.error('Error al cambiar disponibilidad:', error);
      alert('Error al cambiar disponibilidad');
    }
  };

  // === GESTIÓN DE VARIANTES ===

  const handleAbrirModalVariante = (producto, variante = null) => {
    if (variante) {
      // Editar variante existente
      setFormVariante({
        productoId: producto.id,
        varianteId: variante.id,
        tamano: variante.tamano,
        precio: variante.precio,
        esEdicion: true
      });
    } else {
      // Agregar nueva variante
      setFormVariante({
        productoId: producto.id,
        varianteId: null,
        tamano: '',
        precio: '',
        esEdicion: false
      });
    }
    setModalVarianteAbierto(true);
  };

  const handleCerrarModalVariante = () => {
    setModalVarianteAbierto(false);
    setFormVariante({
      productoId: null,
      varianteId: null,
      tamano: '',
      precio: '',
      esEdicion: false
    });
  };

  const handleSubmitVariante = async (e) => {
    e.preventDefault();

    try {
      const datos = {
        tamano: formVariante.tamano,
        precio: parseFloat(formVariante.precio)
      };

      if (formVariante.esEdicion) {
        await actualizarVariante(formVariante.varianteId, datos);
        alert('Variante actualizada exitosamente');
      } else {
        await agregarVariante(formVariante.productoId, datos);
        alert('Variante agregada exitosamente');
      }

      handleCerrarModalVariante();
      await cargarProductos();
    } catch (error) {
      console.error('Error al guardar variante:', error);
      alert(error.response?.data?.error || 'Error al guardar variante');
    }
  };

  const handleEliminarVariante = async (varianteId, tamano) => {
    if (!confirm(`¿Eliminar variante "${tamano}"?`)) return;

    try {
      await eliminarVariante(varianteId);
      alert('Variante eliminada exitosamente');
      await cargarProductos();
    } catch (error) {
      console.error('Error al eliminar variante:', error);
      alert(error.response?.data?.error || 'Error al eliminar variante');
    }
  };

  // Filtrar productos por categoría y búsqueda
  const productosFiltrados = productos
    .filter(p => filtroCategoria === 'todas' || p.categoria === filtroCategoria)
    .filter(p => {
      if (!busqueda.trim()) return true;
      const searchLower = busqueda.toLowerCase();
      return (
        p.nombre.toLowerCase().includes(searchLower) ||
        p.variantes?.some(v => v.tamano.toLowerCase().includes(searchLower))
      );
    });

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Cargando productos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con botón crear */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Gestión de Productos</h2>
        <button
          onClick={() => handleAbrirModal()}
          className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-2 rounded-lg transition-colors whitespace-nowrap"
        >
          + Nuevo Producto
        </button>
      </div>

      {/* Buscador */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="relative">
          <input
            type="text"
            placeholder="🔍 Buscar producto por nombre o tamaño..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl">
            🔍
          </span>
          {busqueda && (
            <button
              onClick={() => setBusqueda('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              title="Limpiar búsqueda"
            >
              ✕
            </button>
          )}
        </div>
        {busqueda && (
          <p className="text-sm text-gray-600 mt-2">
            {productosFiltrados.length} resultado{productosFiltrados.length !== 1 ? 's' : ''} encontrado{productosFiltrados.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Filtros por categoría */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFiltroCategoria('todas')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              filtroCategoria === 'todas'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Todas
          </button>
          {categorias.map(cat => (
            <button
              key={cat.value}
              onClick={() => setFiltroCategoria(cat.value)}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filtroCategoria === cat.value
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de productos */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {productosFiltrados.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-2">
              {busqueda ? '🔍 No se encontraron productos' : 'No hay productos en esta categoría'}
            </p>
            {busqueda && (
              <p className="text-sm text-gray-400">
                Intenta con otro término de búsqueda
              </p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Variantes / Precios
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {productosFiltrados.map(producto => (
                  <tr key={producto.id} className={!producto.disponible ? 'bg-gray-50 opacity-60' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{producto.nombre}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {categorias.find(c => c.value === producto.categoria)?.label || producto.categoria}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {producto.variantes?.map(variante => (
                          <div key={variante.id} className="flex items-center justify-between bg-gray-50 px-2 py-1 rounded">
                            <span className="text-sm text-gray-700">
                              {variante.tamano}: <span className="font-semibold">S/ {variante.precio.toFixed(2)}</span>
                            </span>
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleAbrirModalVariante(producto, variante)}
                                className="text-blue-600 hover:text-blue-800 text-xs"
                                title="Editar variante"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => handleEliminarVariante(variante.id, variante.tamano)}
                                className="text-red-600 hover:text-red-800 text-xs"
                                title="Eliminar variante"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        ))}
                        <button
                          onClick={() => handleAbrirModalVariante(producto)}
                          className="text-xs text-green-600 hover:text-green-800 font-semibold"
                        >
                          + Agregar Variante
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => handleToggleDisponibilidad(producto.id, producto.disponible)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          producto.disponible
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        {producto.disponible ? 'Disponible' : 'No disponible'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <button
                        onClick={() => handleAbrirModal(producto)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                        title="Editar producto"
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => handleEliminarProducto(producto.id, producto.nombre)}
                        className="text-red-600 hover:text-red-900"
                        title="Eliminar producto"
                      >
                        🗑️ Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal para crear/editar producto */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                {productoEditar ? 'Editar Producto' : 'Nuevo Producto'}
              </h3>

              <form onSubmit={handleSubmitProducto} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del Producto *
                  </label>
                  <input
                    type="text"
                    required
                    value={formProducto.nombre}
                    onChange={(e) => setFormProducto(prev => ({ ...prev, nombre: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: Pizza Hawaiana"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoría *
                  </label>
                  <select
                    required
                    value={formProducto.categoria}
                    onChange={(e) => setFormProducto(prev => ({ ...prev, categoria: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {categorias.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.icon} {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Solo mostrar variantes al crear (no al editar) */}
                {!productoEditar && (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Variantes (Tamaños y Precios) *
                      </label>
                      <button
                        type="button"
                        onClick={handleAgregarVarianteFormulario}
                        className="text-sm text-blue-600 hover:text-blue-800 font-semibold"
                      >
                        + Agregar Variante
                      </button>
                    </div>
                    <div className="space-y-2">
                      {formProducto.variantes.map((variante, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            required
                            placeholder="Tamaño (Ej: Personal, Mediana)"
                            value={variante.tamano}
                            onChange={(e) => handleChangeVariante(index, 'tamano', e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            required
                            placeholder="Precio"
                            value={variante.precio}
                            onChange={(e) => handleChangeVariante(index, 'precio', e.target.value)}
                            className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                          {formProducto.variantes.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleEliminarVarianteFormulario(index)}
                              className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {productoEditar && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Nota:</strong> Para editar precios y variantes, usa los botones en la tabla principal.
                    </p>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCerrarModal}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold"
                  >
                    {productoEditar ? 'Actualizar' : 'Crear Producto'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal para agregar/editar variante */}
      {modalVarianteAbierto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                {formVariante.esEdicion ? 'Editar Variante' : 'Agregar Variante'}
              </h3>

              <form onSubmit={handleSubmitVariante} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tamaño *
                  </label>
                  <input
                    type="text"
                    required
                    value={formVariante.tamano}
                    onChange={(e) => setFormVariante(prev => ({ ...prev, tamano: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: Personal, Mediana, Grande"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Precio (S/) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formVariante.precio}
                    onChange={(e) => setFormVariante(prev => ({ ...prev, precio: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCerrarModalVariante}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold"
                  >
                    {formVariante.esEdicion ? 'Actualizar' : 'Agregar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GestionProductos;
