const { getDbInstance } = require('../database/db');

/**
 * Modelo para gestión de mesas del restaurante
 */
class Mesa {
  /**
   * Lista todas las mesas con su estado actual
   * @returns {Array} Lista de mesas
   */
  static listarTodas() {
    try {
      const db = getDbInstance();
      const query = db.prepare(`
        SELECT id, numero, estado, total_actual, abierta_en, cerrada_en
        FROM mesas
        ORDER BY numero ASC
      `);
      return query.all();
    } catch (error) {
      throw new Error(`Error al listar mesas: ${error.message}`);
    }
  }

  /**
   * Abre una mesa para comenzar a recibir pedidos
   * @param {number} numero - Número de la mesa
   * @returns {Object} Mesa actualizada
   */
  static abrir(numero) {
    try {
      const db = getDbInstance();

      // Verificar que la mesa existe y está disponible
      const mesa = db.prepare('SELECT * FROM mesas WHERE numero = ?').get(numero);

      if (!mesa) {
        throw new Error(`Mesa ${numero} no encontrada`);
      }

      if (mesa.estado === 'ocupada') {
        throw new Error(`Mesa ${numero} ya está ocupada`);
      }

      // Abrir la mesa
      const updateQuery = db.prepare(`
        UPDATE mesas
        SET estado = 'ocupada',
            abierta_en = CURRENT_TIMESTAMP,
            total_actual = 0.0,
            cerrada_en = NULL
        WHERE numero = ?
      `);

      updateQuery.run(numero);

      // Retornar mesa actualizada
      return db.prepare('SELECT * FROM mesas WHERE numero = ?').get(numero);
    } catch (error) {
      throw new Error(`Error al abrir mesa: ${error.message}`);
    }
  }

  /**
   * Obtiene detalle completo de una mesa incluyendo sus pedidos
   * @param {number} id - ID de la mesa
   * @returns {Object} Detalle completo de la mesa
   */
  static obtenerDetalle(id) {
    try {
      const db = getDbInstance();

      // Obtener información de la mesa
      const mesa = db.prepare('SELECT * FROM mesas WHERE id = ?').get(id);

      if (!mesa) {
        throw new Error(`Mesa con ID ${id} no encontrada`);
      }

      // Obtener pedidos de la mesa con sus items
      const pedidos = db.prepare(`
        SELECT
          p.id,
          p.estado,
          p.creado_en,
          p.completado_en,
          pi.id as item_id,
          pi.cantidad,
          pi.precio_unitario,
          prod.nombre as producto_nombre,
          prod.categoria as producto_categoria
        FROM pedidos p
        LEFT JOIN pedido_items pi ON p.id = pi.pedido_id
        LEFT JOIN productos prod ON pi.producto_id = prod.id
        WHERE p.mesa_id = ?
        ORDER BY p.creado_en DESC, pi.id ASC
      `).all(id);

      // Agrupar items por pedido
      const pedidosAgrupados = [];
      const pedidosMap = {};

      pedidos.forEach(row => {
        if (!pedidosMap[row.id]) {
          pedidosMap[row.id] = {
            id: row.id,
            estado: row.estado,
            creado_en: row.creado_en,
            completado_en: row.completado_en,
            items: []
          };
          pedidosAgrupados.push(pedidosMap[row.id]);
        }

        if (row.item_id) {
          pedidosMap[row.id].items.push({
            id: row.item_id,
            cantidad: row.cantidad,
            precio_unitario: row.precio_unitario,
            producto_nombre: row.producto_nombre,
            producto_categoria: row.producto_categoria,
            subtotal: row.cantidad * row.precio_unitario
          });
        }
      });

      return {
        ...mesa,
        pedidos: pedidosAgrupados
      };
    } catch (error) {
      throw new Error(`Error al obtener detalle de mesa: ${error.message}`);
    }
  }

  /**
   * Cierra una mesa y la marca como disponible
   * @param {number} id - ID de la mesa
   * @returns {Object} Mesa cerrada
   */
  static cerrar(id) {
    try {
      const db = getDbInstance();

      const mesa = db.prepare('SELECT * FROM mesas WHERE id = ?').get(id);

      if (!mesa) {
        throw new Error(`Mesa con ID ${id} no encontrada`);
      }

      if (mesa.estado !== 'ocupada') {
        throw new Error(`Mesa ${mesa.numero} no está ocupada`);
      }

      // Cerrar la mesa
      const updateQuery = db.prepare(`
        UPDATE mesas
        SET estado = 'disponible',
            cerrada_en = CURRENT_TIMESTAMP,
            total_actual = 0.0
        WHERE id = ?
      `);

      updateQuery.run(id);

      return db.prepare('SELECT * FROM mesas WHERE id = ?').get(id);
    } catch (error) {
      throw new Error(`Error al cerrar mesa: ${error.message}`);
    }
  }

  /**
   * Obtiene el total acumulado de todos los pedidos de una mesa
   * @param {number} id - ID de la mesa
   * @returns {Object} Total de la mesa
   */
  static obtenerTotal(id) {
    try {
      const db = getDbInstance();

      const result = db.prepare(`
        SELECT
          m.id,
          m.numero,
          m.estado,
          COALESCE(SUM(pi.cantidad * pi.precio_unitario), 0) as total
        FROM mesas m
        LEFT JOIN pedidos p ON m.id = p.mesa_id
        LEFT JOIN pedido_items pi ON p.id = pi.pedido_id
        WHERE m.id = ?
        GROUP BY m.id, m.numero, m.estado
      `).get(id);

      if (!result) {
        throw new Error(`Mesa con ID ${id} no encontrada`);
      }

      // Actualizar el total actual en la mesa
      db.prepare('UPDATE mesas SET total_actual = ? WHERE id = ?').run(result.total, id);

      return result;
    } catch (error) {
      throw new Error(`Error al obtener total de mesa: ${error.message}`);
    }
  }
}

module.exports = Mesa;
