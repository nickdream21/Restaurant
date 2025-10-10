const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'restaurant.db');
const db = new Database(dbPath);

console.log('\n=== MESAS CERRADAS ===');
const mesasCerradas = db.prepare(`
  SELECT id, numero, abierta_en, cerrada_en
  FROM mesas
  WHERE cerrada_en IS NOT NULL
  ORDER BY cerrada_en DESC
  LIMIT 10
`).all();
console.log(mesasCerradas);

console.log('\n=== PEDIDOS COMPLETADOS ===');
const pedidosCompletados = db.prepare(`
  SELECT p.id, p.mesa_id, p.estado, p.creado_en, p.completado_en, m.numero as mesa_numero
  FROM pedidos p
  LEFT JOIN mesas m ON p.mesa_id = m.id
  WHERE p.estado = 'completado'
  ORDER BY p.creado_en DESC
  LIMIT 10
`).all();
console.log(pedidosCompletados);

console.log('\n=== TODOS LOS PEDIDOS ===');
const todosPedidos = db.prepare(`
  SELECT p.id, p.mesa_id, p.estado, p.creado_en, p.completado_en, m.numero as mesa_numero
  FROM pedidos p
  LEFT JOIN mesas m ON p.mesa_id = m.id
  ORDER BY p.creado_en DESC
  LIMIT 20
`).all();
console.log(todosPedidos);

console.log('\n=== ITEMS DE PEDIDOS ===');
const items = db.prepare(`
  SELECT
    pi.pedido_id,
    pi.producto_id,
    pi.cantidad,
    pi.precio_unitario,
    p.nombre as producto_nombre
  FROM pedido_items pi
  LEFT JOIN productos p ON pi.producto_id = p.id
  LIMIT 20
`).all();
console.log(items);

db.close();
