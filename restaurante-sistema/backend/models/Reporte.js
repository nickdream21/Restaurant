const { getDbInstance } = require('../database/db');

/**
 * Modelo para generación de reportes y estadísticas
 */
class Reporte {
  /**
   * Obtiene resumen de ventas del día actual
   * @returns {Object} Resumen de ventas del día
   */
  static ventasDelDia() {
    try {
      const db = getDbInstance();
      const hoy = new Date().toISOString().split('T')[0];

      // Total de ventas del día (mesas cerradas hoy)
      // Buscar mesas que fueron cerradas hoy (tienen cerrada_en del día)
      const ventasHoy = db.prepare(`
        SELECT
          COUNT(DISTINCT m.id) as total_mesas_cerradas,
          COALESCE(SUM(pi.cantidad * pi.precio_unitario), 0) as total_ventas
        FROM mesas m
        INNER JOIN pedidos p ON m.id = p.mesa_id
        INNER JOIN pedido_items pi ON p.id = pi.pedido_id
        WHERE DATE(m.cerrada_en) = ?
          AND p.estado = 'completado'
      `).get(hoy);

      // Mesas actualmente ocupadas
      const mesasOcupadas = db.prepare(`
        SELECT COUNT(*) as total
        FROM mesas
        WHERE estado = 'ocupada'
      `).get();

      // Total acumulado de mesas ocupadas
      const totalMesasOcupadas = db.prepare(`
        SELECT COALESCE(SUM(pi.cantidad * pi.precio_unitario), 0) as total
        FROM mesas m
        INNER JOIN pedidos p ON m.id = p.mesa_id
        INNER JOIN pedido_items pi ON p.id = pi.pedido_id
        WHERE m.estado = 'ocupada'
          AND p.estado != 'cancelado'
      `).get();

      // Pedidos del día por estado
      const pedidosPorEstado = db.prepare(`
        SELECT
          estado,
          COUNT(*) as cantidad
        FROM pedidos
        WHERE DATE(creado_en) = ?
        GROUP BY estado
      `).all(hoy);

      // Productos más vendidos del día
      const productosMasVendidos = db.prepare(`
        SELECT
          prod.nombre,
          SUM(pi.cantidad) as cantidad_vendida,
          SUM(pi.cantidad * pi.precio_unitario) as total_generado
        FROM pedido_items pi
        INNER JOIN productos prod ON pi.producto_id = prod.id
        INNER JOIN pedidos p ON pi.pedido_id = p.id
        WHERE DATE(p.creado_en) = ?
          AND p.estado != 'cancelado'
        GROUP BY prod.id, prod.nombre
        ORDER BY cantidad_vendida DESC
        LIMIT 10
      `).all(hoy);

      return {
        fecha: hoy,
        ventas_completadas: {
          mesas_cerradas: ventasHoy.total_mesas_cerradas || 0,
          total_vendido: ventasHoy.total_ventas || 0
        },
        mesas_activas: {
          cantidad: mesasOcupadas.total || 0,
          total_acumulado: totalMesasOcupadas.total || 0
        },
        pedidos_por_estado: pedidosPorEstado,
        productos_mas_vendidos: productosMasVendidos
      };
    } catch (error) {
      throw new Error(`Error al obtener ventas del día: ${error.message}`);
    }
  }

  /**
   * Obtiene historial de ventas por rango de fechas
   * @param {string} fechaInicio - Fecha inicio (YYYY-MM-DD)
   * @param {string} fechaFin - Fecha fin (YYYY-MM-DD)
   * @returns {Object} Historial de ventas con resumen y detalles
   */
  static historialVentas(fechaInicio, fechaFin) {
    try {
      const db = getDbInstance();

      // Ventas agrupadas por fecha
      const ventasPorFecha = db.prepare(`
        SELECT
          DATE(m.cerrada_en) as fecha,
          COUNT(DISTINCT m.id) as mesas_atendidas,
          COUNT(DISTINCT p.id) as total_pedidos,
          COALESCE(SUM(pi.cantidad * pi.precio_unitario), 0) as total_ventas
        FROM mesas m
        INNER JOIN pedidos p ON m.id = p.mesa_id
        INNER JOIN pedido_items pi ON p.id = pi.pedido_id
        WHERE DATE(m.cerrada_en) BETWEEN ? AND ?
          AND p.estado = 'completado'
        GROUP BY DATE(m.cerrada_en)
        ORDER BY fecha DESC
      `).all(fechaInicio, fechaFin);

      // Resumen del período
      const resumen = db.prepare(`
        SELECT
          COUNT(DISTINCT m.id) as total_mesas,
          COUNT(DISTINCT p.id) as total_pedidos,
          COALESCE(SUM(pi.cantidad * pi.precio_unitario), 0) as total_ingresos,
          COALESCE(AVG(pi.cantidad * pi.precio_unitario), 0) as promedio_por_pedido
        FROM mesas m
        INNER JOIN pedidos p ON m.id = p.mesa_id
        INNER JOIN pedido_items pi ON p.id = pi.pedido_id
        WHERE DATE(m.cerrada_en) BETWEEN ? AND ?
          AND p.estado = 'completado'
      `).get(fechaInicio, fechaFin);

      // Productos más vendidos en el período
      const productosMasVendidos = db.prepare(`
        SELECT
          prod.nombre,
          prod.categoria,
          SUM(pi.cantidad) as cantidad_vendida,
          SUM(pi.cantidad * pi.precio_unitario) as total_generado
        FROM pedido_items pi
        INNER JOIN productos prod ON pi.producto_id = prod.id
        INNER JOIN pedidos p ON pi.pedido_id = p.id
        INNER JOIN mesas m ON p.mesa_id = m.id
        WHERE DATE(m.cerrada_en) BETWEEN ? AND ?
          AND p.estado = 'completado'
        GROUP BY prod.id, prod.nombre, prod.categoria
        ORDER BY cantidad_vendida DESC
        LIMIT 10
      `).all(fechaInicio, fechaFin);

      // Detalles de todas las ventas con sus productos
      const ventasDetalladas = db.prepare(`
        SELECT
          m.id as mesa_id,
          m.numero as mesa_numero,
          m.cerrada_en as fecha_cierre,
          m.abierta_en as fecha_apertura,
          COUNT(DISTINCT p.id) as total_pedidos,
          COALESCE(SUM(pi.cantidad * pi.precio_unitario), 0) as total_venta
        FROM mesas m
        INNER JOIN pedidos p ON m.id = p.mesa_id
        INNER JOIN pedido_items pi ON p.id = pi.pedido_id
        WHERE DATE(m.cerrada_en) BETWEEN ? AND ?
          AND p.estado = 'completado'
        GROUP BY m.id, m.numero, m.cerrada_en, m.abierta_en
        ORDER BY m.cerrada_en DESC
      `).all(fechaInicio, fechaFin);

      // Para cada venta, obtener el detalle de productos
      const ventasConProductos = ventasDetalladas.map(venta => {
        const productos = db.prepare(`
          SELECT
            prod.nombre as producto,
            pv.tamano as variante,
            pi.cantidad,
            pi.precio_unitario,
            (pi.cantidad * pi.precio_unitario) as subtotal,
            pi.notas
          FROM pedidos p
          INNER JOIN pedido_items pi ON p.id = pi.pedido_id
          INNER JOIN productos prod ON pi.producto_id = prod.id
          LEFT JOIN producto_variantes pv ON pi.variante_id = pv.id
          WHERE p.mesa_id = ?
            AND DATE(p.creado_en) BETWEEN ? AND ?
            AND p.estado = 'completado'
          ORDER BY prod.nombre, pi.id
        `).all(venta.mesa_id, fechaInicio, fechaFin);

        return {
          ...venta,
          productos
        };
      });

      return {
        ventas_por_fecha: ventasPorFecha,
        resumen: {
          total_mesas: resumen.total_mesas || 0,
          total_pedidos: resumen.total_pedidos || 0,
          total_ingresos: resumen.total_ingresos || 0,
          promedio_por_pedido: resumen.promedio_por_pedido || 0,
          promedio_por_mesa: resumen.total_mesas > 0
            ? resumen.total_ingresos / resumen.total_mesas
            : 0
        },
        productos_mas_vendidos: productosMasVendidos,
        ventas_detalladas: ventasConProductos
      };
    } catch (error) {
      throw new Error(`Error al obtener historial de ventas: ${error.message}`);
    }
  }

  /**
   * Obtiene estadísticas generales del negocio
   * @returns {Object} Estadísticas generales
   */
  static estadisticasGenerales() {
    try {
      const db = getDbInstance();

      // Total productos disponibles
      const totalProductos = db.prepare(`
        SELECT COUNT(*) as total
        FROM productos
        WHERE disponible = 1
      `).get();

      // Total de mesas
      const totalMesas = db.prepare(`
        SELECT
          COUNT(*) as total,
          SUM(CASE WHEN estado = 'ocupada' THEN 1 ELSE 0 END) as ocupadas,
          SUM(CASE WHEN estado = 'libre' THEN 1 ELSE 0 END) as libres
        FROM mesas
      `).get();

      // Ventas totales históricas
      const ventasTotales = db.prepare(`
        SELECT
          COUNT(DISTINCT m.id) as mesas_totales,
          COALESCE(SUM(pi.cantidad * pi.precio_unitario), 0) as total_historico
        FROM mesas m
        INNER JOIN pedidos p ON m.id = p.mesa_id
        INNER JOIN pedido_items pi ON p.id = pi.pedido_id
        WHERE m.cerrada_en IS NOT NULL
          AND p.estado = 'completado'
      `).get();

      // Promedio de venta por mesa
      const promedioVenta = ventasTotales.mesas_totales > 0
        ? ventasTotales.total_historico / ventasTotales.mesas_totales
        : 0;

      return {
        productos: {
          total_disponibles: totalProductos.total
        },
        mesas: {
          total: totalMesas.total,
          ocupadas: totalMesas.ocupadas,
          libres: totalMesas.libres,
          porcentaje_ocupacion: totalMesas.total > 0
            ? ((totalMesas.ocupadas / totalMesas.total) * 100).toFixed(1)
            : 0
        },
        ventas_historicas: {
          mesas_atendidas: ventasTotales.mesas_totales,
          total_generado: ventasTotales.total_historico,
          promedio_por_mesa: promedioVenta
        }
      };
    } catch (error) {
      throw new Error(`Error al obtener estadísticas generales: ${error.message}`);
    }
  }

  /**
   * Obtiene detalles de una mesa cerrada (factura)
   * @param {number} mesa_id - ID de la mesa
   * @returns {Object} Detalles de la factura
   */
  static obtenerFactura(mesa_id) {
    try {
      const db = getDbInstance();

      // Información de la mesa
      const mesa = db.prepare(`
        SELECT *
        FROM mesas
        WHERE id = ?
      `).get(mesa_id);

      if (!mesa) {
        throw new Error(`Mesa con ID ${mesa_id} no encontrada`);
      }

      // Pedidos de la mesa con items
      const pedidos = db.prepare(`
        SELECT
          p.id as pedido_id,
          p.estado,
          p.creado_en,
          pi.id as item_id,
          pi.cantidad,
          pi.precio_unitario,
          pi.notas,
          prod.nombre as producto_nombre
        FROM pedidos p
        INNER JOIN pedido_items pi ON p.id = pi.pedido_id
        INNER JOIN productos prod ON pi.producto_id = prod.id
        WHERE p.mesa_id = ?
          AND p.estado != 'cancelado'
        ORDER BY p.creado_en ASC
      `).all(mesa_id);

      // Agrupar items por pedido
      const pedidosAgrupados = [];
      const pedidosMap = {};

      pedidos.forEach(row => {
        if (!pedidosMap[row.pedido_id]) {
          pedidosMap[row.pedido_id] = {
            id: row.pedido_id,
            estado: row.estado,
            creado_en: row.creado_en,
            items: []
          };
          pedidosAgrupados.push(pedidosMap[row.pedido_id]);
        }

        pedidosMap[row.pedido_id].items.push({
          id: row.item_id,
          cantidad: row.cantidad,
          precio_unitario: row.precio_unitario,
          producto_nombre: row.producto_nombre,
          notas: row.notas,
          subtotal: row.cantidad * row.precio_unitario
        });
      });

      // Calcular total
      const total = pedidosAgrupados.reduce((sum, pedido) => {
        return sum + pedido.items.reduce((s, item) => s + item.subtotal, 0);
      }, 0);

      return {
        mesa,
        pedidos: pedidosAgrupados,
        total
      };
    } catch (error) {
      throw new Error(`Error al obtener factura: ${error.message}`);
    }
  }
}

module.exports = Reporte;
