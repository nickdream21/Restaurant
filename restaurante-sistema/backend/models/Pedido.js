const { getDbInstance } = require('../database/db');

/**
 * Modelo para gestión de pedidos
 */
class Pedido {
  /**
   * Crea un nuevo pedido con sus items
   * @param {number} mesa_id - ID de la mesa
   * @param {Array} items - Array de items [{producto_id, variante_id, cantidad}]
   * @returns {Object} Pedido creado con sus items
   */
  static crear(mesa_id, items) {
    const db = getDbInstance();

    try {
      // Validar que la mesa existe y está ocupada
      const mesa = db.prepare('SELECT * FROM mesas WHERE id = ?').get(mesa_id);

      if (!mesa) {
        throw new Error(`Mesa con ID ${mesa_id} no encontrada`);
      }

      if (mesa.estado !== 'ocupada') {
        throw new Error(`Mesa ${mesa.numero} no está ocupada. Debe abrirse primero`);
      }

      if (!items || items.length === 0) {
        throw new Error('Debe incluir al menos un item en el pedido');
      }

      // Iniciar transacción
      const insertPedido = db.prepare(`
        INSERT INTO pedidos (mesa_id, estado, creado_en)
        VALUES (?, 'pendiente', CURRENT_TIMESTAMP)
      `);

      const insertItem = db.prepare(`
        INSERT INTO pedido_items (pedido_id, producto_id, variante_id, cantidad, precio_unitario, notas)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      const transaction = db.transaction((mesa_id, items) => {
        // Crear el pedido
        const result = insertPedido.run(mesa_id);
        const pedidoId = result.lastInsertRowid;

        // Insertar cada item del pedido
        for (const item of items) {
          // Obtener precio de la variante
          const variante = db.prepare('SELECT precio FROM producto_variantes WHERE id = ?')
            .get(item.variante_id);

          if (!variante) {
            throw new Error(`Variante con ID ${item.variante_id} no encontrada`);
          }

          // Verificar que el producto está disponible
          const producto = db.prepare('SELECT disponible FROM productos WHERE id = ?')
            .get(item.producto_id);

          if (!producto) {
            throw new Error(`Producto con ID ${item.producto_id} no encontrado`);
          }

          if (!producto.disponible) {
            throw new Error(`Producto con ID ${item.producto_id} no está disponible`);
          }

          if (!item.cantidad || item.cantidad <= 0) {
            throw new Error('La cantidad debe ser mayor a 0');
          }

          insertItem.run(
            pedidoId,
            item.producto_id,
            item.variante_id,
            item.cantidad,
            variante.precio,
            item.notas || ''
          );
        }

        return pedidoId;
      });

      const pedidoId = transaction(mesa_id, items);

      // Retornar pedido creado con detalle
      return this.obtenerDetalle(pedidoId);

    } catch (error) {
      throw new Error(`Error al crear pedido: ${error.message}`);
    }
  }

  /**
   * Lista todos los pedidos de una mesa
   * @param {number} mesa_id - ID de la mesa
   * @returns {Array} Lista de pedidos
   */
  static listarPorMesa(mesa_id) {
    try {
      const db = getDbInstance();

      const pedidos = db.prepare(`
        SELECT
          p.id,
          p.mesa_id,
          p.estado,
          p.creado_en,
          p.completado_en,
          COUNT(pi.id) as total_items,
          COALESCE(SUM(pi.cantidad * pi.precio_unitario), 0) as total
        FROM pedidos p
        LEFT JOIN pedido_items pi ON p.id = pi.pedido_id
        WHERE p.mesa_id = ?
        GROUP BY p.id, p.mesa_id, p.estado, p.creado_en, p.completado_en
        ORDER BY p.creado_en DESC
      `).all(mesa_id);

      return pedidos;
    } catch (error) {
      throw new Error(`Error al listar pedidos por mesa: ${error.message}`);
    }
  }

  /**
   * Lista todos los pedidos pendientes o en preparación con sus items
   * @returns {Array} Lista de pedidos pendientes con items
   */
  static listarPendientes() {
    try {
      const db = getDbInstance();

      // Obtener pedidos pendientes
      const pedidos = db.prepare(`
        SELECT
          p.id,
          p.mesa_id,
          m.numero as mesa_numero,
          p.estado,
          p.creado_en
        FROM pedidos p
        INNER JOIN mesas m ON p.mesa_id = m.id
        WHERE p.estado IN ('pendiente', 'en_preparacion', 'completado')
        ORDER BY p.creado_en ASC
      `).all();

      // Para cada pedido, obtener sus items
      const pedidosConItems = pedidos.map(pedido => {
        const items = db.prepare(`
          SELECT
            pi.id,
            pi.cantidad,
            pi.precio_unitario,
            pi.notas,
            p.id as producto_id,
            p.nombre as producto_nombre,
            p.categoria as producto_categoria,
            pv.tamano as variante_tamano
          FROM pedido_items pi
          INNER JOIN productos p ON pi.producto_id = p.id
          INNER JOIN producto_variantes pv ON pi.variante_id = pv.id
          WHERE pi.pedido_id = ?
          ORDER BY pi.id ASC
        `).all(pedido.id);

        return {
          ...pedido,
          items,
          total_items: items.length
        };
      });

      return pedidosConItems;
    } catch (error) {
      throw new Error(`Error al listar pedidos pendientes: ${error.message}`);
    }
  }

  /**
   * Cambia el estado de un pedido
   * @param {number} id - ID del pedido
   * @param {string} nuevo_estado - Nuevo estado (pendiente, en_preparacion, completado, cancelado)
   * @returns {Object} Pedido actualizado
   */
  static cambiarEstado(id, nuevo_estado) {
    try {
      const db = getDbInstance();

      // Validar estado
      const estadosValidos = ['pendiente', 'en_preparacion', 'listo', 'completado', 'cancelado'];
      if (!estadosValidos.includes(nuevo_estado)) {
        throw new Error(`Estado inválido. Debe ser: ${estadosValidos.join(', ')}`);
      }

      const pedido = db.prepare('SELECT * FROM pedidos WHERE id = ?').get(id);

      if (!pedido) {
        throw new Error(`Pedido con ID ${id} no encontrado`);
      }

      // Actualizar estado
      const updateQuery = db.prepare(`
        UPDATE pedidos
        SET estado = ?,
            completado_en = CASE
              WHEN ? IN ('completado', 'cancelado') THEN CURRENT_TIMESTAMP
              ELSE NULL
            END
        WHERE id = ?
      `);

      updateQuery.run(nuevo_estado, nuevo_estado, id);

      // Obtener pedido actualizado con información de la mesa
      const pedidoActualizado = db.prepare(`
        SELECT p.*, m.numero as mesa_numero
        FROM pedidos p
        JOIN mesas m ON p.mesa_id = m.id
        WHERE p.id = ?
      `).get(id);

      return pedidoActualizado;
    } catch (error) {
      throw new Error(`Error al cambiar estado del pedido: ${error.message}`);
    }
  }

  /**
   * Obtiene detalle completo de un pedido con sus items
   * @param {number} id - ID del pedido
   * @returns {Object} Detalle completo del pedido
   */
  static obtenerDetalle(id) {
    try {
      const db = getDbInstance();

      // Obtener información del pedido
      const pedido = db.prepare(`
        SELECT p.*, m.numero as mesa_numero
        FROM pedidos p
        INNER JOIN mesas m ON p.mesa_id = m.id
        WHERE p.id = ?
      `).get(id);

      if (!pedido) {
        throw new Error(`Pedido con ID ${id} no encontrado`);
      }

      // Obtener items del pedido
      const items = db.prepare(`
        SELECT
          pi.id,
          pi.cantidad,
          pi.precio_unitario,
          pi.notas,
          pi.cantidad * pi.precio_unitario as subtotal,
          p.id as producto_id,
          p.nombre as producto_nombre,
          p.categoria as producto_categoria,
          pv.tamano as variante_tamano
        FROM pedido_items pi
        INNER JOIN productos p ON pi.producto_id = p.id
        INNER JOIN producto_variantes pv ON pi.variante_id = pv.id
        WHERE pi.pedido_id = ?
        ORDER BY pi.id ASC
      `).all(id);

      // Calcular total
      const total = items.reduce((sum, item) => sum + item.subtotal, 0);

      return {
        ...pedido,
        items,
        total
      };
    } catch (error) {
      throw new Error(`Error al obtener detalle del pedido: ${error.message}`);
    }
  }
}

module.exports = Pedido;
