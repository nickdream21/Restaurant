const { getDbInstance } = require('../database/db');

/**
 * Modelo para gestión de productos del menú
 */
class Producto {
  /**
   * Lista todos los productos disponibles
   * @returns {Array} Lista de productos
   */
  static listarTodos() {
    try {
      const db = getDbInstance();
      const query = db.prepare(`
        SELECT id, nombre, precio, categoria, disponible
        FROM productos
        ORDER BY categoria ASC, nombre ASC
      `);
      return query.all();
    } catch (error) {
      throw new Error(`Error al listar productos: ${error.message}`);
    }
  }

  /**
   * Lista productos filtrados por categoría
   * @param {string} categoria - Categoría a filtrar (bebida, entrada, plato_principal, postre)
   * @returns {Array} Lista de productos de la categoría
   */
  static listarPorCategoria(categoria) {
    try {
      const db = getDbInstance();

      // Validar categoría
      const categoriasValidas = ['bebida', 'entrada', 'plato_principal', 'postre'];
      if (!categoriasValidas.includes(categoria)) {
        throw new Error(`Categoría inválida. Debe ser: ${categoriasValidas.join(', ')}`);
      }

      const query = db.prepare(`
        SELECT id, nombre, precio, categoria, disponible
        FROM productos
        WHERE categoria = ?
        ORDER BY nombre ASC
      `);

      return query.all(categoria);
    } catch (error) {
      throw new Error(`Error al listar productos por categoría: ${error.message}`);
    }
  }

  /**
   * Obtiene un producto por su ID
   * @param {number} id - ID del producto
   * @returns {Object|null} Producto encontrado o null
   */
  static obtenerPorId(id) {
    try {
      const db = getDbInstance();
      const query = db.prepare(`
        SELECT id, nombre, precio, categoria, disponible
        FROM productos
        WHERE id = ?
      `);

      const producto = query.get(id);

      if (!producto) {
        throw new Error(`Producto con ID ${id} no encontrado`);
      }

      return producto;
    } catch (error) {
      throw new Error(`Error al obtener producto: ${error.message}`);
    }
  }
}

module.exports = Producto;
