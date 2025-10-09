import axios from 'axios';

// Configurar instancia de axios con la URL base del backend
// Usa variable de entorno o detecta automáticamente la URL
const getBaseURL = () => {
  // Si hay variable de entorno, úsala
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // Si estás en localhost (desarrollo en PC), usa localhost
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:3000/api';
  }

  // Si accedes desde otra IP (móvil), usa la IP del host
  return `http://${window.location.hostname}:3000/api`;
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json'
  }
});

// ==================== MESAS ====================

/**
 * Obtiene todas las mesas
 */
export const getMesas = async () => {
  const response = await api.get('/mesas');
  return response.data;
};

/**
 * Obtiene detalle de una mesa específica
 */
export const getMesaDetalle = async (id) => {
  const response = await api.get(`/mesas/${id}`);
  return response.data;
};

/**
 * Abre una mesa
 */
export const abrirMesa = async (id) => {
  const response = await api.post(`/mesas/${id}/abrir`);
  return response.data;
};

/**
 * Cierra una mesa
 */
export const cerrarMesa = async (id) => {
  const response = await api.post(`/mesas/${id}/cerrar`);
  return response.data;
};

// ==================== PRODUCTOS ====================

/**
 * Obtiene todos los productos
 */
export const getProductos = async () => {
  const response = await api.get('/productos');
  return response.data;
};

/**
 * Obtiene productos por categoría
 */
export const getProductosPorCategoria = async (categoria) => {
  const response = await api.get(`/productos/categoria/${categoria}`);
  return response.data;
};

// ==================== PEDIDOS ====================

/**
 * Crea un nuevo pedido
 * @param {number} mesa_id - ID de la mesa
 * @param {Array} items - Array de items [{producto_id, cantidad}]
 */
export const crearPedido = async (mesa_id, items) => {
  const response = await api.post('/pedidos', { mesa_id, items });
  return response.data;
};

/**
 * Obtiene pedidos pendientes (para cocina)
 */
export const getPedidosPendientes = async () => {
  const response = await api.get('/pedidos/pendientes');
  return response.data;
};

/**
 * Obtiene pedidos de una mesa específica
 */
export const getPedidosPorMesa = async (mesa_id) => {
  const response = await api.get(`/pedidos/mesa/${mesa_id}`);
  return response.data;
};

/**
 * Cambia el estado de un pedido
 */
export const cambiarEstadoPedido = async (id, estado) => {
  const response = await api.put(`/pedidos/${id}/estado`, { estado });
  return response.data;
};

/**
 * Cancela un pedido completo (solo si está pendiente)
 */
export const cancelarPedido = async (id, motivo = '') => {
  const response = await api.post(`/pedidos/${id}/cancelar`, { motivo });
  return response.data;
};

/**
 * Elimina un item individual de un pedido
 */
export const eliminarItemPedido = async (pedido_id, item_id) => {
  const response = await api.delete(`/pedidos/${pedido_id}/items/${item_id}`);
  return response.data;
};

// ==================== REPORTES ====================

/**
 * Obtiene ventas del día actual
 */
export const getVentasDelDia = async () => {
  const response = await api.get('/reportes/ventas-del-dia');
  return response.data;
};

/**
 * Obtiene historial de ventas
 */
export const getHistorialVentas = async (fecha_inicio, fecha_fin) => {
  const params = {};
  if (fecha_inicio) params.fecha_inicio = fecha_inicio;
  if (fecha_fin) params.fecha_fin = fecha_fin;

  const response = await api.get('/reportes/historial', { params });
  return response.data;
};

/**
 * Obtiene estadísticas generales
 */
export const getEstadisticas = async () => {
  const response = await api.get('/reportes/estadisticas');
  return response.data;
};

/**
 * Obtiene factura de una mesa
 */
export const getFactura = async (mesa_id) => {
  const response = await api.get(`/reportes/factura/${mesa_id}`);
  return response.data;
};

// Manejo de errores global
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
