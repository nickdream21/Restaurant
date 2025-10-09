const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'restaurant.db');
const db = new Database(dbPath);

console.log('\n🧪 CREANDO VENTA DE PRUEBA...\n');

try {
  // 1. Abrir mesa 3
  console.log('1️⃣ Abriendo Mesa 3...');
  db.prepare(`
    UPDATE mesas
    SET estado = 'ocupada',
        abierta_en = CURRENT_TIMESTAMP,
        total_actual = 0
    WHERE id = 3
  `).run();
  console.log('✅ Mesa 3 abierta');

  // 2. Crear pedido
  console.log('\n2️⃣ Creando pedido...');
  const pedidoResult = db.prepare(`
    INSERT INTO pedidos (mesa_id, estado, creado_en)
    VALUES (3, 'pendiente', CURRENT_TIMESTAMP)
  `).run();
  const pedidoId = pedidoResult.lastInsertRowid;
  console.log(`✅ Pedido #${pedidoId} creado`);

  // 3. Agregar items al pedido
  console.log('\n3️⃣ Agregando items al pedido...');

  // Obtener productos para el pedido
  const productos = db.prepare(`
    SELECT pv.id as variante_id, p.id as producto_id, p.nombre, pv.precio
    FROM productos p
    INNER JOIN producto_variantes pv ON p.id = pv.producto_id
    LIMIT 3
  `).all();

  if (productos.length === 0) {
    console.log('❌ No hay productos en la BD');
    db.close();
    process.exit(1);
  }

  let totalPedido = 0;
  productos.forEach((prod, idx) => {
    const cantidad = idx + 1; // 1, 2, 3
    const subtotal = prod.precio * cantidad;
    totalPedido += subtotal;

    db.prepare(`
      INSERT INTO pedido_items (pedido_id, producto_id, cantidad, precio_unitario, notas)
      VALUES (?, ?, ?, ?, ?)
    `).run(pedidoId, prod.producto_id, cantidad, prod.precio, '');

    console.log(`   ✅ ${cantidad}x ${prod.nombre} - S/ ${subtotal.toFixed(2)}`);
  });

  console.log(`\n   💰 Total del pedido: S/ ${totalPedido.toFixed(2)}`);

  // 4. Marcar pedido como completado (simulando el flujo completo)
  console.log('\n4️⃣ Marcando pedido como completado...');
  db.prepare(`
    UPDATE pedidos
    SET estado = 'completado',
        completado_en = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(pedidoId);
  console.log('✅ Pedido completado');

  // 5. Cerrar mesa (ahora SIN eliminar pedidos)
  console.log('\n5️⃣ Cerrando mesa...');
  db.prepare(`
    UPDATE mesas
    SET estado = 'libre',
        cerrada_en = CURRENT_TIMESTAMP,
        total_actual = 0,
        abierta_en = NULL
    WHERE id = 3
  `).run();
  console.log('✅ Mesa cerrada');

  // 6. Verificar que el pedido sigue en la BD
  console.log('\n6️⃣ Verificando que el pedido se guardó...');
  const pedidoGuardado = db.prepare(`
    SELECT p.*, COUNT(pi.id) as items, SUM(pi.cantidad * pi.precio_unitario) as total
    FROM pedidos p
    LEFT JOIN pedido_items pi ON p.id = pi.pedido_id
    WHERE p.id = ?
    GROUP BY p.id
  `).get(pedidoId);

  if (pedidoGuardado) {
    console.log('✅ PEDIDO GUARDADO CORRECTAMENTE:');
    console.log(pedidoGuardado);
  } else {
    console.log('❌ ERROR: El pedido fue eliminado');
  }

  // 7. Verificar ventas del día
  console.log('\n7️⃣ Consultando ventas del día...');
  const hoy = new Date().toISOString().split('T')[0];
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

  console.log('📊 Ventas del día:', ventasHoy);

  if (ventasHoy.total_ventas > 0) {
    console.log('\n✅✅✅ ¡ÉXITO! El sistema de ventas funciona correctamente');
  } else {
    console.log('\n❌ ERROR: Las ventas no se están registrando');
  }

} catch (error) {
  console.error('\n❌ ERROR:', error.message);
} finally {
  db.close();
  console.log('\n🏁 Prueba completada\n');
}
