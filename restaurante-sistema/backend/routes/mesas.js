const express = require('express');
const router = express.Router();
const Mesa = require('../models/Mesa');

/**
 * GET /api/mesas
 * Lista todas las mesas con su estado actual
 */
router.get('/', async (req, res) => {
  try {
    const mesas = Mesa.listarTodas();
    res.json({
      success: true,
      data: mesas
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/mesas/:id
 * Obtiene detalle completo de una mesa con sus pedidos
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'ID de mesa inválido'
      });
    }

    const mesa = Mesa.obtenerDetalle(parseInt(id));
    res.json({
      success: true,
      data: mesa
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/mesas/:id/abrir
 * Abre una mesa para comenzar a recibir pedidos
 */
router.post('/:id/abrir', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'ID de mesa inválido'
      });
    }

    const mesa = Mesa.abrir(parseInt(id));
    res.json({
      success: true,
      data: mesa,
      message: `Mesa ${mesa.numero} abierta exitosamente`
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/mesas/:id/cerrar
 * Cierra una mesa y la marca como disponible (cobro realizado)
 */
router.post('/:id/cerrar', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'ID de mesa inválido'
      });
    }

    // Obtener total antes de cerrar
    const total = Mesa.obtenerTotal(parseInt(id));

    // Cerrar la mesa
    const mesa = Mesa.cerrar(parseInt(id));

    res.json({
      success: true,
      data: mesa,
      total_cobrado: total.total,
      message: `Mesa ${mesa.numero} cerrada. Total cobrado: $${total.total.toFixed(2)}`
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
