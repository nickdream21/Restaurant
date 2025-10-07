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

module.exports = router;
