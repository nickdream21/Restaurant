const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'restaurant.db');
const db = new Database(dbPath);

const fechaInicio = '2025-10-09';
const fechaFin = '2025-10-10';

console.log('\n=== PRUEBA DE CONSULTA DE VENTAS ===');
console.log(`Buscando entre ${fechaInicio} y ${fechaFin}`);

const ventas = db.prepare(`
  SELECT
    DATE(m.cerrada_en) as fecha,
    COUNT(DISTINCT m.id) as mesas_atendidas,
    COUNT(DISTINCT p.id) as total_pedidos,
    COALESCE(SUM(pi.cantidad * pi.precio_unitario), 0) as total_ventas
  FROM mesas m
  INNER JOIN pedidos p ON m.id = p.mesa_id
  INNER JOIN pedido_items pi ON p.id = pi.pedido_id
  WHERE DATE(m.cerrada_en) BETWEEN ? AND ?
    AND p.estado = 'completado'
  GROUP BY DATE(m.cerrada_en)
  ORDER BY fecha DESC
`).all(fechaInicio, fechaFin);

console.log('\nResultado:');
console.log(ventas);

console.log('\n=== PRUEBA SIN CONDICION DE PEDIDO COMPLETADO ===');
const ventasSinFiltro = db.prepare(`
  SELECT
    DATE(m.cerrada_en) as fecha,
    COUNT(DISTINCT m.id) as mesas_atendidas,
    COUNT(DISTINCT p.id) as total_pedidos,
    COALESCE(SUM(pi.cantidad * pi.precio_unitario), 0) as total_ventas
  FROM mesas m
  INNER JOIN pedidos p ON m.id = p.mesa_id
  INNER JOIN pedido_items pi ON p.id = pi.pedido_id
  WHERE DATE(m.cerrada_en) BETWEEN ? AND ?
  GROUP BY DATE(m.cerrada_en)
  ORDER BY fecha DESC
`).all(fechaInicio, fechaFin);

console.log(ventasSinFiltro);

console.log('\n=== DETALLES DE LAS VENTAS ===');
const detalles = db.prepare(`
  SELECT
    m.id as mesa_id,
    m.numero as mesa_numero,
    m.cerrada_en as fecha_cierre,
    DATE(m.cerrada_en) as solo_fecha,
    p.id as pedido_id,
    p.estado as pedido_estado,
    COUNT(DISTINCT p.id) as total_pedidos,
    COALESCE(SUM(pi.cantidad * pi.precio_unitario), 0) as total_venta
  FROM mesas m
  INNER JOIN pedidos p ON m.id = p.mesa_id
  INNER JOIN pedido_items pi ON p.id = pi.pedido_id
  WHERE DATE(m.cerrada_en) BETWEEN ? AND ?
    AND p.estado = 'completado'
  GROUP BY m.id, m.numero, m.cerrada_en, p.id, p.estado
  ORDER BY m.cerrada_en DESC
`).all(fechaInicio, fechaFin);

console.log(detalles);

db.close();
