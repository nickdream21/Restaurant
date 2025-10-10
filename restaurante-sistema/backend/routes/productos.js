const express = require('express');
const router = express.Router();
const Producto = require('../models/Producto');

/**
 * GET /api/productos
 * Lista todos los productos del menú
 */
router.get('/', async (req, res) => {
  try {
    const productos = Producto.listarTodos();
    res.json({
      success: true,
      data: productos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/productos/:id
 * Obtiene un producto por su ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'ID de producto inválido'
      });
    }

    const producto = Producto.obtenerPorId(parseInt(id));
    res.json({
      success: true,
      data: producto
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/productos
 * Crea un nuevo producto con sus variantes
 * Body: { nombre, categoria, variantes: [{tamano, precio}] }
 */
router.post('/', async (req, res) => {
  try {
    const { nombre, categoria, variantes } = req.body;

    if (!nombre || !categoria || !variantes) {
      return res.status(400).json({
        success: false,
        error: 'Faltan campos requeridos: nombre, categoria, variantes'
      });
    }

    const producto = Producto.crear({ nombre, categoria, variantes });
    res.status(201).json({
      success: true,
      data: producto,
      message: 'Producto creado exitosamente'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PUT /api/productos/:id
 * Actualiza un producto existente
 * Body: { nombre?, categoria? }
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, categoria } = req.body;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'ID de producto inválido'
      });
    }

    const producto = Producto.actualizar(parseInt(id), { nombre, categoria });
    res.json({
      success: true,
      data: producto,
      message: 'Producto actualizado exitosamente'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/productos/:id
 * Elimina un producto
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'ID de producto inválido'
      });
    }

    Producto.eliminar(parseInt(id));
    res.json({
      success: true,
      message: 'Producto eliminado exitosamente'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PATCH /api/productos/:id/disponibilidad
 * Cambia la disponibilidad de un producto
 * Body: { disponible: boolean }
 */
router.patch('/:id/disponibilidad', async (req, res) => {
  try {
    const { id } = req.params;
    const { disponible } = req.body;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'ID de producto inválido'
      });
    }

    if (disponible === undefined) {
      return res.status(400).json({
        success: false,
        error: 'El campo "disponible" es requerido'
      });
    }

    const producto = Producto.cambiarDisponibilidad(parseInt(id), disponible);
    res.json({
      success: true,
      data: producto,
      message: `Producto ${disponible ? 'activado' : 'desactivado'} exitosamente`
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/productos/categoria/:categoria
 * Lista productos filtrados por categoría
 */
router.get('/categoria/:categoria', async (req, res) => {
  try {
    const { categoria } = req.params;

    if (!categoria) {
      return res.status(400).json({
        success: false,
        error: 'Categoría no especificada'
      });
    }

    const productos = Producto.listarPorCategoria(categoria);
    res.json({
      success: true,
      data: productos,
      categoria: categoria
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// ============ RUTAS DE VARIANTES ============

/**
 * POST /api/productos/:id/variantes
 * Agrega una variante a un producto
 * Body: { tamano, precio }
 */
router.post('/:id/variantes', async (req, res) => {
  try {
    const { id } = req.params;
    const { tamano, precio } = req.body;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'ID de producto inválido'
      });
    }

    if (!tamano || !precio) {
      return res.status(400).json({
        success: false,
        error: 'Faltan campos requeridos: tamano, precio'
      });
    }

    const variante = Producto.agregarVariante(parseInt(id), { tamano, precio: parseFloat(precio) });
    res.status(201).json({
      success: true,
      data: variante,
      message: 'Variante agregada exitosamente'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PUT /api/productos/variantes/:varianteId
 * Actualiza una variante existente
 * Body: { tamano?, precio? }
 */
router.put('/variantes/:varianteId', async (req, res) => {
  try {
    const { varianteId } = req.params;
    const { tamano, precio } = req.body;

    if (!varianteId || isNaN(varianteId)) {
      return res.status(400).json({
        success: false,
        error: 'ID de variante inválido'
      });
    }

    const datos = {};
    if (tamano !== undefined) datos.tamano = tamano;
    if (precio !== undefined) datos.precio = parseFloat(precio);

    const variante = Producto.actualizarVariante(parseInt(varianteId), datos);
    res.json({
      success: true,
      data: variante,
      message: 'Variante actualizada exitosamente'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/productos/variantes/:varianteId
 * Elimina una variante
 */
router.delete('/variantes/:varianteId', async (req, res) => {
  try {
    const { varianteId } = req.params;

    if (!varianteId || isNaN(varianteId)) {
      return res.status(400).json({
        success: false,
        error: 'ID de variante inválido'
      });
    }

    Producto.eliminarVariante(parseInt(varianteId));
    res.json({
      success: true,
      message: 'Variante eliminada exitosamente'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
