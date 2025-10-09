const express = require('express');
const router = express.Router();
const Pedido = require('../models/Pedido');
const { getDbInstance } = require('../database/db');

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

    // Si el pedido está listo, notificar a los meseros
    if (estado === 'listo') {
      const io = req.app.get('io');
      if (io) {
        io.emit('pedido-listo', {
          pedidoId: pedido.id,
          mesaId: pedido.mesa_id,
          mesaNumero: pedido.mesa_numero || pedido.mesa_id,
          items: pedido.items
        });
      }
    }

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

/**
 * POST /api/pedidos/:id/cancelar
 * Cancela un pedido completo (solo si está en estado 'pendiente')
 * Body: { motivo: string (opcional) }
 */
router.post('/:id/cancelar', async (req, res) => {
  try {
    const { id } = req.params;
    const { motivo } = req.body;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'ID de pedido inválido'
      });
    }

    const db = getDbInstance();

    // Obtener el pedido
    const pedido = db.prepare('SELECT * FROM pedidos WHERE id = ?').get(parseInt(id));

    if (!pedido) {
      return res.status(404).json({
        success: false,
        error: 'Pedido no encontrado'
      });
    }

    // Solo se puede cancelar si está pendiente
    if (pedido.estado !== 'pendiente') {
      return res.status(400).json({
        success: false,
        error: `No se puede cancelar un pedido en estado "${pedido.estado}". Solo se pueden cancelar pedidos pendientes.`
      });
    }

    // Cancelar el pedido
    const pedidoActualizado = Pedido.cambiarEstado(parseInt(id), 'cancelado');

    res.json({
      success: true,
      data: pedidoActualizado,
      message: `Pedido #${id} cancelado exitosamente${motivo ? `: ${motivo}` : ''}`
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/pedidos/:pedido_id/items/:item_id
 * Cancela/elimina un item individual de un pedido
 * Solo permitido si el pedido está en 'pendiente', 'en_preparacion' o 'listo'
 */
router.delete('/:pedido_id/items/:item_id', async (req, res) => {
  try {
    const { pedido_id, item_id } = req.params;

    if (!pedido_id || isNaN(pedido_id) || !item_id || isNaN(item_id)) {
      return res.status(400).json({
        success: false,
        error: 'IDs inválidos'
      });
    }

    const db = getDbInstance();

    // Obtener el pedido
    const pedido = db.prepare('SELECT * FROM pedidos WHERE id = ?').get(parseInt(pedido_id));

    if (!pedido) {
      return res.status(404).json({
        success: false,
        error: 'Pedido no encontrado'
      });
    }

    // Verificar que el pedido no esté completado o cancelado
    if (pedido.estado === 'completado' || pedido.estado === 'cancelado') {
      return res.status(400).json({
        success: false,
        error: `No se puede eliminar items de un pedido ${pedido.estado}`
      });
    }

    // Verificar que el item existe y pertenece al pedido
    const item = db.prepare('SELECT * FROM pedido_items WHERE id = ? AND pedido_id = ?')
      .get(parseInt(item_id), parseInt(pedido_id));

    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Item no encontrado en este pedido'
      });
    }

    // Contar cuántos items tiene el pedido
    const totalItems = db.prepare('SELECT COUNT(*) as total FROM pedido_items WHERE pedido_id = ?')
      .get(parseInt(pedido_id)).total;

    // Si es el último item, cancelar el pedido completo en lugar de eliminar el item
    if (totalItems === 1) {
      const pedidoActualizado = Pedido.cambiarEstado(parseInt(pedido_id), 'cancelado');
      return res.json({
        success: true,
        data: pedidoActualizado,
        message: 'Era el último item del pedido. Pedido completo cancelado.'
      });
    }

    // Eliminar el item
    db.prepare('DELETE FROM pedido_items WHERE id = ?').run(parseInt(item_id));

    // Obtener pedido actualizado
    const pedidoActualizado = Pedido.obtenerDetalle(parseInt(pedido_id));

    res.json({
      success: true,
      data: pedidoActualizado,
      message: 'Item eliminado exitosamente'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
