import { useState, useEffect } from 'react';
import TarjetaMesa from '../components/TarjetaMesa';
import DetalleMesa from '../components/DetalleMesa';
import ListaProductos from '../components/ListaProductos';
import CarritoPedido from '../components/CarritoPedido';
import { getMesas, abrirMesa, getProductos, crearPedido } from '../services/api';

function Mesera() {
  // Estado principal
  const [mesas, setMesas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estado de vistas y modales
  const [vistaActual, setVistaActual] = useState('lista'); // 'lista', 'detalle', 'pedido'
  const [mesaSeleccionada, setMesaSeleccionada] = useState(null);

  // Estado del carrito
  const [carrito, setCarrito] = useState([]);

  // Cargar mesas al montar
  useEffect(() => {
    cargarMesas();
    cargarProductos();
  }, []);

  const cargarMesas = async () => {
    try {
      setLoading(true);
      const response = await getMesas();
      setMesas(response.data);
    } catch (error) {
      alert('Error al cargar mesas: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const cargarProductos = async () => {
    try {
      const response = await getProductos();
      setProductos(response.data);
    } catch (error) {
      console.error('Error al cargar productos:', error);
    }
  };

  const handleClickMesa = async (mesa) => {
    if (mesa.estado === 'disponible') {
      // Confirmar y abrir mesa
      if (confirm(`¿Abrir Mesa ${mesa.numero}?`)) {
        try {
          await abrirMesa(mesa.id);
          await cargarMesas();
          alert(`Mesa ${mesa.numero} abierta exitosamente`);
        } catch (error) {
          alert('Error al abrir mesa: ' + (error.response?.data?.error || error.message));
        }
      }
    } else if (mesa.estado === 'ocupada') {
      // Navegar a detalle
      setMesaSeleccionada(mesa);
      setVistaActual('detalle');
    }
  };

  const handleAgregarPedido = () => {
    setCarrito([]);
    setVistaActual('pedido');
  };

  const handleAgregarProducto = (producto) => {
    setCarrito(prev => {
      const existe = prev.find(item => item.producto_id === producto.id);
      if (existe) {
        return prev.map(item =>
          item.producto_id === producto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }
      return [...prev, {
        producto_id: producto.id,
        nombre: producto.nombre,
        precio: producto.precio,
        cantidad: 1
      }];
    });
  };

  const handleCambiarCantidad = (index, nuevaCantidad) => {
    if (nuevaCantidad <= 0) {
      handleEliminarItem(index);
      return;
    }
    setCarrito(prev => prev.map((item, i) =>
      i === index ? { ...item, cantidad: nuevaCantidad } : item
    ));
  };

  const handleEliminarItem = (index) => {
    setCarrito(prev => prev.filter((_, i) => i !== index));
  };

  const handleEnviarPedido = async () => {
    if (carrito.length === 0) {
      alert('El carrito está vacío');
      return;
    }

    try {
      const items = carrito.map(item => ({
        producto_id: item.producto_id,
        cantidad: item.cantidad
      }));

      await crearPedido(mesaSeleccionada.id, items);
      alert('Pedido enviado a cocina exitosamente');
      setCarrito([]);
      setVistaActual('detalle');
      await cargarMesas();
    } catch (error) {
      alert('Error al crear pedido: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleVolverDetalle = () => {
    setCarrito([]);
    setVistaActual('detalle');
  };

  const handleVolverLista = () => {
    setMesaSeleccionada(null);
    setCarrito([]);
    setVistaActual('lista');
    cargarMesas();
  };

  // VISTA LISTA DE MESAS
  if (vistaActual === 'lista') {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Panel Mesera</h1>
            <button
              onClick={cargarMesas}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
            >
              🔄 Refrescar
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Cargando mesas...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {mesas.map(mesa => (
                <TarjetaMesa
                  key={mesa.id}
                  mesa={mesa}
                  onClick={() => handleClickMesa(mesa)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // VISTA DETALLE DE MESA
  if (vistaActual === 'detalle') {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={handleVolverLista}
            className="mb-4 text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-2"
          >
            ← Volver a Mesas
          </button>

          <DetalleMesa
            mesa_id={mesaSeleccionada.id}
            onAgregarPedido={handleAgregarPedido}
            onCerrar={handleVolverLista}
          />
        </div>
      </div>
    );
  }

  // VISTA NUEVO PEDIDO
  if (vistaActual === 'pedido') {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={handleVolverDetalle}
            className="mb-4 text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-2"
          >
            ← Volver a Detalle
          </button>

          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            Nuevo Pedido - Mesa {mesaSeleccionada?.numero}
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Lista de productos */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Productos</h2>
                <ListaProductos
                  productos={productos}
                  onAgregarProducto={handleAgregarProducto}
                />
              </div>
            </div>

            {/* Carrito */}
            <div className="lg:col-span-1">
              <div className="sticky top-6">
                <CarritoPedido
                  items={carrito}
                  onCambiarCantidad={handleCambiarCantidad}
                  onEliminar={handleEliminarItem}
                  onEnviar={handleEnviarPedido}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default Mesera;
