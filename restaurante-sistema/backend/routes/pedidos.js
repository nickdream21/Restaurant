const express = require('express');
const router = express.Router();
const Pedido = require('../models/Pedido');

/**
 * POST /api/pedidos
 * Crea un nuevo pedido para una mesa
 * Body: { mesa_id: number, items: [{producto_id: number, cantidad: number}] }
 */
router.post('/', async (req, res) => {
  try {
    const { mesa_id, items } = req.body;

    // Validaciones
    if (!mesa_id || isNaN(mesa_id)) {
      return res.status(400).json({
        success: false,
        error: 'mesa_id es requerido y debe ser un número'
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'items es requerido y debe ser un array con al menos un elemento'
      });
    }

    // Validar cada item
    for (const item of items) {
      if (!item.producto_id || isNaN(item.producto_id)) {
        return res.status(400).json({
          success: false,
          error: 'Cada item debe tener producto_id válido'
        });
      }

      if (!item.cantidad || isNaN(item.cantidad) || item.cantidad <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Cada item debe tener cantidad válida mayor a 0'
        });
      }
    }

    const pedido = Pedido.crear(parseInt(mesa_id), items);
    res.status(201).json({
      success: true,
      data: pedido,
      message: 'Pedido creado exitosamente'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/pedidos/pendientes
 * Lista todos los pedidos pendientes o en preparación (para cocina)
 */
router.get('/pendientes', async (req, res) => {
  try {
    const pedidos = Pedido.listarPendientes();
    res.json({
      success: true,
      data: pedidos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/pedidos/mesa/:mesa_id
 * Lista todos los pedidos de una mesa específica
 */
router.get('/mesa/:mesa_id', async (req, res) => {
  try {
    const { mesa_id } = req.params;

    if (!mesa_id || isNaN(mesa_id)) {
      return res.status(400).json({
        success: false,
        error: 'mesa_id inválido'
      });
    }

    const pedidos = Pedido.listarPorMesa(parseInt(mesa_id));
    res.json({
      success: true,
      data: pedidos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PUT /api/pedidos/:id/estado
 * Cambia el estado de un pedido
 * Body: { estado: string }
 */
router.put('/:id/estado', async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'ID de pedido inválido'
      });
    }

    if (!estado) {
      return res.status(400).json({
        success: false,
        error: 'estado es requerido'
      });
    }

    const pedido = Pedido.cambiarEstado(parseInt(id), estado);
    res.json({
      success: true,
      data: pedido,
      message: `Estado actualizado a: ${estado}`
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
