const express = require('express');
const router = express.Router();
const Reporte = require('../models/Reporte');

/**
 * GET /api/reportes/ventas-del-dia
 * Obtiene resumen de ventas del día actual
 */
router.get('/ventas-del-dia', async (req, res) => {
  try {
    const reporte = Reporte.ventasDelDia();
    res.json({
      success: true,
      data: reporte
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/reportes/historial
 * Obtiene historial de ventas por rango de fechas
 * Query params: fecha_inicio, fecha_fin
 */
router.get('/historial', async (req, res) => {
  try {
    let { fecha_inicio, fecha_fin } = req.query;

    // Si no se proporcionan fechas, usar últimos 30 días
    if (!fecha_fin) {
      fecha_fin = new Date().toISOString().split('T')[0];
    }

    if (!fecha_inicio) {
      const treintaDiasAtras = new Date();
      treintaDiasAtras.setDate(treintaDiasAtras.getDate() - 30);
      fecha_inicio = treintaDiasAtras.toISOString().split('T')[0];
    }

    console.log('📊 Reporte de historial solicitado:', { fecha_inicio, fecha_fin });

    const historial = Reporte.historialVentas(fecha_inicio, fecha_fin);

    console.log('📊 Resultado del reporte:', {
      ventas_por_fecha: historial.ventas_por_fecha?.length || 0,
      ventas_detalladas: historial.ventas_detalladas?.length || 0,
      total_ingresos: historial.resumen?.total_ingresos || 0
    });

    res.json({
      success: true,
      data: {
        fecha_inicio,
        fecha_fin,
        ...historial
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/reportes/estadisticas
 * Obtiene estadísticas generales del negocio
 */
router.get('/estadisticas', async (req, res) => {
  try {
    const estadisticas = Reporte.estadisticasGenerales();
    res.json({
      success: true,
      data: estadisticas
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/reportes/factura/:mesa_id
 * Obtiene detalles de factura de una mesa
 */
router.get('/factura/:mesa_id', async (req, res) => {
  try {
    const { mesa_id } = req.params;

    if (!mesa_id || isNaN(mesa_id)) {
      return res.status(400).json({
        success: false,
        error: 'ID de mesa inválido'
      });
    }

    const factura = Reporte.obtenerFactura(parseInt(mesa_id));
    res.json({
      success: true,
      data: factura
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
