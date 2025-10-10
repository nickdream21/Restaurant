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
      const productos = db.prepare(`
        SELECT id, nombre, categoria, disponible
        FROM productos
        ORDER BY categoria ASC, nombre ASC
      `).all();

      // Para cada producto, obtener sus variantes
      const productosConVariantes = productos.map(producto => {
        const variantes = db.prepare(`
          SELECT id, tamano, precio
          FROM producto_variantes
          WHERE producto_id = ?
          ORDER BY precio ASC
        `).all(producto.id);

        return {
          ...producto,
          variantes
        };
      });

      return productosConVariantes;
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
      const producto = db.prepare(`
        SELECT id, nombre, categoria, disponible
        FROM productos
        WHERE id = ?
      `).get(id);

      if (!producto) {
        throw new Error(`Producto con ID ${id} no encontrado`);
      }

      // Obtener variantes
      const variantes = db.prepare(`
        SELECT id, tamano, precio
        FROM producto_variantes
        WHERE producto_id = ?
        ORDER BY precio ASC
      `).all(id);

      return {
        ...producto,
        variantes
      };
    } catch (error) {
      throw new Error(`Error al obtener producto: ${error.message}`);
    }
  }

  /**
   * Crea un nuevo producto con sus variantes
   * @param {Object} producto - {nombre, categoria, variantes: [{tamano, precio}]}
   * @returns {Object} Producto creado
   */
  static crear(producto) {
    const db = getDbInstance();

    try {
      const { nombre, categoria, variantes } = producto;

      // Validaciones
      if (!nombre || nombre.trim() === '') {
        throw new Error('El nombre es requerido');
      }

      const categoriasValidas = ['bebida', 'entrada', 'plato_principal', 'postre'];
      if (!categoria || !categoriasValidas.includes(categoria)) {
        throw new Error(`Categoría inválida. Debe ser: ${categoriasValidas.join(', ')}`);
      }

      if (!variantes || !Array.isArray(variantes) || variantes.length === 0) {
        throw new Error('Debe incluir al menos una variante (tamaño/precio)');
      }

      // Validar variantes
      for (const variante of variantes) {
        if (!variante.tamano || variante.tamano.trim() === '') {
          throw new Error('Cada variante debe tener un tamaño');
        }
        if (!variante.precio || isNaN(variante.precio) || variante.precio <= 0) {
          throw new Error('Cada variante debe tener un precio válido mayor a 0');
        }
      }

      // Transacción
      const transaction = db.transaction(() => {
        // Insertar producto
        const resultProducto = db.prepare(`
          INSERT INTO productos (nombre, categoria, disponible)
          VALUES (?, ?, 1)
        `).run(nombre.trim(), categoria);

        const productoId = resultProducto.lastInsertRowid;

        // Insertar variantes
        const insertVariante = db.prepare(`
          INSERT INTO producto_variantes (producto_id, tamano, precio)
          VALUES (?, ?, ?)
        `);

        for (const variante of variantes) {
          insertVariante.run(productoId, variante.tamano.trim(), variante.precio);
        }

        return productoId;
      });

      const productoId = transaction();
      return this.obtenerPorId(productoId);
    } catch (error) {
      throw new Error(`Error al crear producto: ${error.message}`);
    }
  }

  /**
   * Actualiza un producto existente
   * @param {number} id - ID del producto
   * @param {Object} datos - {nombre, categoria}
   * @returns {Object} Producto actualizado
   */
  static actualizar(id, datos) {
    const db = getDbInstance();

    try {
      const { nombre, categoria } = datos;

      // Verificar que existe
      const productoExistente = db.prepare('SELECT * FROM productos WHERE id = ?').get(id);
      if (!productoExistente) {
        throw new Error(`Producto con ID ${id} no encontrado`);
      }

      // Validaciones
      if (nombre !== undefined && nombre.trim() === '') {
        throw new Error('El nombre no puede estar vacío');
      }

      if (categoria !== undefined) {
        const categoriasValidas = ['bebida', 'entrada', 'plato_principal', 'postre'];
        if (!categoriasValidas.includes(categoria)) {
          throw new Error(`Categoría inválida. Debe ser: ${categoriasValidas.join(', ')}`);
        }
      }

      // Actualizar
      const campos = [];
      const valores = [];

      if (nombre !== undefined) {
        campos.push('nombre = ?');
        valores.push(nombre.trim());
      }

      if (categoria !== undefined) {
        campos.push('categoria = ?');
        valores.push(categoria);
      }

      if (campos.length > 0) {
        valores.push(id);
        db.prepare(`
          UPDATE productos
          SET ${campos.join(', ')}
          WHERE id = ?
        `).run(...valores);
      }

      return this.obtenerPorId(id);
    } catch (error) {
      throw new Error(`Error al actualizar producto: ${error.message}`);
    }
  }

  /**
   * Elimina un producto y sus variantes
   * @param {number} id - ID del producto
   * @returns {boolean} true si se eliminó correctamente
   */
  static eliminar(id) {
    const db = getDbInstance();

    try {
      // Verificar que existe
      const producto = db.prepare('SELECT * FROM productos WHERE id = ?').get(id);
      if (!producto) {
        throw new Error(`Producto con ID ${id} no encontrado`);
      }

      // Verificar que no esté en pedidos activos
      const pedidosActivos = db.prepare(`
        SELECT COUNT(*) as total
        FROM pedido_items pi
        INNER JOIN pedidos p ON pi.pedido_id = p.id
        WHERE pi.producto_id = ? AND p.estado NOT IN ('completado', 'cancelado')
      `).get(id);

      if (pedidosActivos.total > 0) {
        throw new Error('No se puede eliminar un producto que tiene pedidos activos. Desactívalo en su lugar.');
      }

      // Eliminar (las variantes se eliminan por CASCADE)
      db.prepare('DELETE FROM productos WHERE id = ?').run(id);

      return true;
    } catch (error) {
      throw new Error(`Error al eliminar producto: ${error.message}`);
    }
  }

  /**
   * Cambia la disponibilidad de un producto
   * @param {number} id - ID del producto
   * @param {boolean} disponible - true o false
   * @returns {Object} Producto actualizado
   */
  static cambiarDisponibilidad(id, disponible) {
    const db = getDbInstance();

    try {
      const producto = db.prepare('SELECT * FROM productos WHERE id = ?').get(id);
      if (!producto) {
        throw new Error(`Producto con ID ${id} no encontrado`);
      }

      db.prepare('UPDATE productos SET disponible = ? WHERE id = ?')
        .run(disponible ? 1 : 0, id);

      return this.obtenerPorId(id);
    } catch (error) {
      throw new Error(`Error al cambiar disponibilidad: ${error.message}`);
    }
  }

  /**
   * Gestión de variantes
   */

  /**
   * Agrega una variante a un producto existente
   * @param {number} productoId - ID del producto
   * @param {Object} variante - {tamano, precio}
   * @returns {Object} Variante creada
   */
  static agregarVariante(productoId, variante) {
    const db = getDbInstance();

    try {
      // Verificar que el producto existe
      const producto = db.prepare('SELECT * FROM productos WHERE id = ?').get(productoId);
      if (!producto) {
        throw new Error(`Producto con ID ${productoId} no encontrado`);
      }

      // Validar variante
      if (!variante.tamano || variante.tamano.trim() === '') {
        throw new Error('El tamaño es requerido');
      }
      if (!variante.precio || isNaN(variante.precio) || variante.precio <= 0) {
        throw new Error('El precio debe ser un número mayor a 0');
      }

      // Verificar que no existe ya una variante con el mismo tamaño
      const existente = db.prepare(`
        SELECT * FROM producto_variantes
        WHERE producto_id = ? AND tamano = ?
      `).get(productoId, variante.tamano.trim());

      if (existente) {
        throw new Error(`Ya existe una variante "${variante.tamano}" para este producto`);
      }

      const result = db.prepare(`
        INSERT INTO producto_variantes (producto_id, tamano, precio)
        VALUES (?, ?, ?)
      `).run(productoId, variante.tamano.trim(), variante.precio);

      return {
        id: result.lastInsertRowid,
        producto_id: productoId,
        tamano: variante.tamano.trim(),
        precio: variante.precio
      };
    } catch (error) {
      throw new Error(`Error al agregar variante: ${error.message}`);
    }
  }

  /**
   * Actualiza una variante existente
   * @param {number} varianteId - ID de la variante
   * @param {Object} datos - {tamano, precio}
   * @returns {Object} Variante actualizada
   */
  static actualizarVariante(varianteId, datos) {
    const db = getDbInstance();

    try {
      const variante = db.prepare('SELECT * FROM producto_variantes WHERE id = ?').get(varianteId);
      if (!variante) {
        throw new Error(`Variante con ID ${varianteId} no encontrada`);
      }

      const campos = [];
      const valores = [];

      if (datos.tamano !== undefined) {
        if (datos.tamano.trim() === '') {
          throw new Error('El tamaño no puede estar vacío');
        }
        campos.push('tamano = ?');
        valores.push(datos.tamano.trim());
      }

      if (datos.precio !== undefined) {
        if (isNaN(datos.precio) || datos.precio <= 0) {
          throw new Error('El precio debe ser un número mayor a 0');
        }
        campos.push('precio = ?');
        valores.push(datos.precio);
      }

      if (campos.length > 0) {
        valores.push(varianteId);
        db.prepare(`
          UPDATE producto_variantes
          SET ${campos.join(', ')}
          WHERE id = ?
        `).run(...valores);
      }

      return db.prepare('SELECT * FROM producto_variantes WHERE id = ?').get(varianteId);
    } catch (error) {
      throw new Error(`Error al actualizar variante: ${error.message}`);
    }
  }

  /**
   * Elimina una variante
   * @param {number} varianteId - ID de la variante
   * @returns {boolean} true si se eliminó
   */
  static eliminarVariante(varianteId) {
    const db = getDbInstance();

    try {
      const variante = db.prepare('SELECT * FROM producto_variantes WHERE id = ?').get(varianteId);
      if (!variante) {
        throw new Error(`Variante con ID ${varianteId} no encontrada`);
      }

      // Verificar que el producto tenga al menos 2 variantes
      const totalVariantes = db.prepare(`
        SELECT COUNT(*) as total
        FROM producto_variantes
        WHERE producto_id = ?
      `).get(variante.producto_id);

      if (totalVariantes.total <= 1) {
        throw new Error('No se puede eliminar la última variante. Un producto debe tener al menos una variante.');
      }

      // Verificar que no esté en pedidos activos
      const pedidosActivos = db.prepare(`
        SELECT COUNT(*) as total
        FROM pedido_items pi
        INNER JOIN pedidos p ON pi.pedido_id = p.id
        WHERE pi.variante_id = ? AND p.estado NOT IN ('completado', 'cancelado')
      `).get(varianteId);

      if (pedidosActivos.total > 0) {
        throw new Error('No se puede eliminar una variante que tiene pedidos activos.');
      }

      db.prepare('DELETE FROM producto_variantes WHERE id = ?').run(varianteId);
      return true;
    } catch (error) {
      throw new Error(`Error al eliminar variante: ${error.message}`);
    }
  }
}

module.exports = Producto;
