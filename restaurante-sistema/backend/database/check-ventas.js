const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'restaurant.db');
const db = new Database(dbPath);

console.log('\n=== VERIFICACIÓN DE DATOS DE VENTAS ===\n');

// Ver mesas cerradas
console.log('📋 MESAS CERRADAS:');
const mesasCerradas = db.prepare(`
  SELECT id, numero, cerrada_en, DATE(cerrada_en) as fecha
  FROM mesas
  WHERE cerrada_en IS NOT NULL
  ORDER BY cerrada_en DESC
  LIMIT 10
`).all();
console.log(mesasCerradas);

// Ver pedidos completados
console.log('\n📦 PEDIDOS COMPLETADOS:');
const pedidosCompletados = db.prepare(`
  SELECT p.id, p.mesa_id, p.estado, p.creado_en,
         COUNT(pi.id) as items,
         SUM(pi.cantidad * pi.precio_unitario) as total
  FROM pedidos p
  LEFT JOIN pedido_items pi ON p.id = pi.pedido_id
  WHERE p.estado = 'completado'
  GROUP BY p.id
  LIMIT 10
`).all();
console.log(pedidosCompletados);

// Ver todos los pedidos de hoy
const hoy = new Date().toISOString().split('T')[0];
console.log(`\n📅 PEDIDOS DE HOY (${hoy}):`);
const pedidosHoy = db.prepare(`
  SELECT p.id, p.mesa_id, p.estado, p.creado_en, DATE(p.creado_en) as fecha
  FROM pedidos p
  WHERE DATE(p.creado_en) = ?
`).all(hoy);
console.log(pedidosHoy);

// Simular consulta de ventas del día
console.log('\n💰 SIMULACIÓN DE VENTAS DEL DÍA:');
const ventasHoy = db.prepare(`
  SELECT
    COUNT(DISTINCT m.id) as mesas_cerradas,
    COALESCE(SUM(pi.cantidad * pi.precio_unitario), 0) as total_ventas
  FROM mesas m
  INNER JOIN pedidos p ON m.id = p.mesa_id
  INNER JOIN pedido_items pi ON p.id = pi.pedido_id
  WHERE DATE(m.cerrada_en) = ?
    AND p.estado = 'completado'
`).get(hoy);
console.log(ventasHoy);

db.close();
console.log('\n✅ Verificación completada\n');
