import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import TarjetaMesa from '../components/TarjetaMesa';
import DetalleMesa from '../components/DetalleMesa';
import ListaProductos from '../components/ListaProductos';
import CarritoPedido from '../components/CarritoPedido';
import { getMesas, abrirMesa, getProductos, crearPedido } from '../services/api';
import { formatearHoraPerú } from '../utils/dateUtils';

function Mesera() {
  // Estado principal
  const [mesas, setMesas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estado de vistas y modales
  const [vistaActual, setVistaActual] = useState('lista'); // 'lista', 'detalle', 'pedido'
  const [mesaSeleccionada, setMesaSeleccionada] = useState(() => {
    try {
      const mesaGuardada = localStorage.getItem('mesa_seleccionada');
      return mesaGuardada ? JSON.parse(mesaGuardada) : null;
    } catch (error) {
      console.error('Error al cargar mesa seleccionada:', error);
      return null;
    }
  });

  // Estado del carrito (con persistencia en localStorage)
  const [carrito, setCarrito] = useState(() => {
    try {
      const carritoGuardado = localStorage.getItem('carrito_mesera');
      return carritoGuardado ? JSON.parse(carritoGuardado) : [];
    } catch (error) {
      console.error('Error al cargar carrito desde localStorage:', error);
      return [];
    }
  });

  // Estado de notificaciones
  const [notificaciones, setNotificaciones] = useState([]);

  // Cargar mesas al montar
  useEffect(() => {
    cargarMesas();
    cargarProductos();
  }, []);

  // Guardar carrito en localStorage cada vez que cambie
  useEffect(() => {
    try {
      localStorage.setItem('carrito_mesera', JSON.stringify(carrito));
    } catch (error) {
      console.error('Error al guardar carrito en localStorage:', error);
    }
  }, [carrito]);

  // Guardar mesa seleccionada en localStorage
  useEffect(() => {
    try {
      if (mesaSeleccionada) {
        localStorage.setItem('mesa_seleccionada', JSON.stringify(mesaSeleccionada));
      } else {
        localStorage.removeItem('mesa_seleccionada');
      }
    } catch (error) {
      console.error('Error al guardar mesa seleccionada:', error);
    }
  }, [mesaSeleccionada]);

  // Socket.IO para notificaciones
  useEffect(() => {
    const getSocketURL = () => {
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:3000';
      }
      return `http://${window.location.hostname}:3000`;
    };

    const socket = io(getSocketURL());

    socket.on('connect', () => {
      console.log('Conectado a Socket.IO');
    });

    socket.on('pedido-listo', (data) => {
      console.log('Pedido listo:', data);

      // Crear nueva notificación
      const nuevaNotificacion = {
        id: Date.now(),
        mensaje: `¡Pedido listo para Mesa ${data.mesaNumero}!`,
        mesaId: data.mesaId,
        mesaNumero: data.mesaNumero,
        timestamp: new Date()
      };

      // Agregar notificación
      setNotificaciones(prev => [...prev, nuevaNotificacion]);

      // Reproducir sonido de notificación
      reproducirSonidoNotificacion();

      // Auto-ocultar después de 15 segundos
      setTimeout(() => {
        setNotificaciones(prev => prev.filter(n => n.id !== nuevaNotificacion.id));
      }, 15000);

      // Recargar mesas para actualizar el estado
      cargarMesas();
    });

    return () => {
      socket.disconnect();
    };
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

  // Función para reproducir sonido de notificación usando Web Audio API
  const reproducirSonidoNotificacion = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();

      // Crear sonido de campana más prolongado y melodioso
      const duracion = 0.4; // Duración más larga de cada tono
      const frecuencias = [800, 1000, 1200, 1000]; // 4 tonos: sube y baja
      const repeticiones = 2; // Repetir 2 veces
      const pausaEntreRepeticiones = 1.2; // Pausa de 1.2 segundos entre repeticiones

      for (let rep = 0; rep < repeticiones; rep++) {
        const offsetRepeticion = rep * pausaEntreRepeticiones;

        frecuencias.forEach((frecuencia, index) => {
          const oscilador = audioContext.createOscillator();
          const ganancia = audioContext.createGain();

          oscilador.connect(ganancia);
          ganancia.connect(audioContext.destination);

          oscilador.frequency.value = frecuencia;
          oscilador.type = 'sine';

          // Envelope: ataque rápido, decaimiento más suave y prolongado
          const tiempoInicio = audioContext.currentTime + offsetRepeticion + (index * 0.25);
          ganancia.gain.setValueAtTime(0, tiempoInicio);
          ganancia.gain.linearRampToValueAtTime(0.35, tiempoInicio + 0.02);
          ganancia.gain.exponentialRampToValueAtTime(0.01, tiempoInicio + duracion);

          oscilador.start(tiempoInicio);
          oscilador.stop(tiempoInicio + duracion);
        });
      }

      // Vibración en dispositivos móviles - patrón repetido
      if ('vibrate' in navigator) {
        // Patrón repetido 2 veces con pausa
        navigator.vibrate([300, 150, 300, 150, 400, 800, 300, 150, 300, 150, 400]);
      }
    } catch (error) {
      console.log('Error reproduciendo sonido:', error);
    }
  };

  const handleClickMesa = async (mesa) => {
    if (mesa.estado === 'libre') {
      // Confirmar y abrir mesa
      if (confirm(`¿Abrir Mesa ${mesa.numero}?`)) {
        try {
          await abrirMesa(mesa.id);
          const mesasActualizadas = await getMesas();
          setMesas(mesasActualizadas.data);
          // Encontrar la mesa reci\u00e9n abierta y navegar directamente a hacer pedido
          const mesaAbierta = mesasActualizadas.data.find(m => m.id === mesa.id);
          setMesaSeleccionada(mesaAbierta);
          setCarrito([]);
          setVistaActual('pedido');
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

  const handleAgregarProducto = (producto, variante, notas = '') => {
    setCarrito(prev => {
      // Si tiene notas, siempre crear un item nuevo (aunque sea el mismo producto)
      // porque las notas pueden ser diferentes
      if (notas.trim()) {
        return [...prev, {
          producto_id: producto.id,
          variante_id: variante.id,
          nombre: producto.nombre,
          tamano: variante.tamano,
          precio: variante.precio,
          cantidad: 1,
          notas: notas.trim()
        }];
      }

      // Sin notas, agrupar productos iguales
      const existe = prev.find(item =>
        item.producto_id === producto.id &&
        item.variante_id === variante.id &&
        !item.notas
      );

      if (existe) {
        return prev.map(item =>
          item.producto_id === producto.id &&
          item.variante_id === variante.id &&
          !item.notas
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }

      return [...prev, {
        producto_id: producto.id,
        variante_id: variante.id,
        nombre: producto.nombre,
        tamano: variante.tamano,
        precio: variante.precio,
        cantidad: 1,
        notas: ''
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
        variante_id: item.variante_id,
        cantidad: item.cantidad,
        notas: item.notas || ''
      }));

      await crearPedido(mesaSeleccionada.id, items);
      alert('Pedido enviado a cocina exitosamente');
      setCarrito([]);
      localStorage.removeItem('carrito_mesera');
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

  // Componente de notificaciones (visible en todas las vistas)
  const NotificacionesFlotantes = () => {
    if (notificaciones.length === 0) return null;

    return (
      <div className="fixed top-4 right-4 z-50 space-y-3 max-w-md">
        {notificaciones.map((notif, index) => (
          <div
            key={notif.id}
            className="animate-slideIn"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-5 rounded-xl shadow-2xl flex items-center gap-4 border-2 border-green-300 hover:scale-105 transition-transform">
              <div className="flex-shrink-0">
                <div className="bg-white rounded-full p-2">
                  <span className="text-3xl">🍽️</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-lg mb-1">{notif.mensaje}</p>
                <p className="text-sm opacity-90">El pedido está listo para servir</p>
                <p className="text-xs opacity-75 mt-1">
                  {formatearHoraPerú(notif.timestamp)}
                </p>
              </div>
              <button
                onClick={() => setNotificaciones(prev => prev.filter(n => n.id !== notif.id))}
                className="flex-shrink-0 text-white hover:text-gray-200 text-2xl font-bold hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        ))}

        {/* Badge de contador en la esquina */}
        {notificaciones.length > 0 && (
          <div className="absolute -top-2 -left-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm shadow-lg animate-pulse">
            {notificaciones.length}
          </div>
        )}
      </div>
    );
  };

  // VISTA LISTA DE MESAS
  if (vistaActual === 'lista') {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <NotificacionesFlotantes />

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
                  onAgregarPedidoRapido={(mesa) => {
                    setMesaSeleccionada(mesa);
                    setCarrito([]);
                    setVistaActual('pedido');
                  }}
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
        <NotificacionesFlotantes />

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
    const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
    const totalPrecio = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);

    return (
      <div className="min-h-screen bg-gray-100 pb-32 lg:pb-6">
        <NotificacionesFlotantes />

        <div className="max-w-7xl mx-auto p-6">
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

            {/* Carrito - Desktop (sticky sidebar) */}
            <div className="hidden lg:block lg:col-span-1">
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

        {/* Carrito Flotante - Mobile */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t-4 border-blue-500 shadow-2xl">
          <div className="p-4">
            {/* Resumen compacto siempre visible */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="bg-blue-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold">
                  {totalItems}
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-xl font-bold text-gray-800">
                    S/. {totalPrecio.toFixed(2)}
                  </p>
                </div>
              </div>
              <button
                onClick={handleEnviarPedido}
                disabled={carrito.length === 0}
                className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-bold px-6 py-3 rounded-lg transition-colors text-sm"
              >
                Enviar a Cocina
              </button>
            </div>

            {/* Lista de items del carrito - scrolleable */}
            {carrito.length > 0 && (
              <div className="max-h-48 overflow-y-auto border-t pt-3">
                <div className="space-y-2">
                  {carrito.map((item, index) => (
                    <div key={index} className="bg-gray-50 p-2 rounded">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">
                            {item.nombre} - {item.tamano}
                          </p>
                          <p className="text-xs text-gray-600">
                            S/. {item.precio.toFixed(2)} x {item.cantidad}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 ml-2">
                          <button
                            onClick={() => handleCambiarCantidad(index, item.cantidad - 1)}
                            className="bg-red-500 text-white w-7 h-7 rounded flex items-center justify-center font-bold text-sm"
                          >
                            -
                          </button>
                          <span className="text-sm font-bold w-6 text-center">{item.cantidad}</span>
                          <button
                            onClick={() => handleCambiarCantidad(index, item.cantidad + 1)}
                            className="bg-green-500 text-white w-7 h-7 rounded flex items-center justify-center font-bold text-sm"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      {/* Mostrar notas si existen */}
                      {item.notas && (
                        <div className="mt-1 pt-1 border-t border-gray-300">
                          <p className="text-xs text-gray-600 italic">📝 {item.notas}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {carrito.length === 0 && (
              <p className="text-center text-gray-500 text-sm py-2 border-t">
                No hay productos en el carrito
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default Mesera;
