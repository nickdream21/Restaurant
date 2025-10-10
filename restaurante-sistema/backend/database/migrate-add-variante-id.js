const Database = require('better-sqlite3');
const path = require('path');

/**
 * Script de migración para agregar la columna variante_id a pedido_items
 * Este script es necesario para bases de datos existentes
 */
function migrateAddVarianteId() {
  const dbPath = path.join(__dirname, 'restaurant.db');
  const db = new Database(dbPath);

  console.log('Iniciando migración: Agregar variante_id a pedido_items...');

  try {
    // Verificar si la columna ya existe
    const tableInfo = db.prepare("PRAGMA table_info(pedido_items)").all();
    const hasVarianteId = tableInfo.some(col => col.name === 'variante_id');

    if (hasVarianteId) {
      console.log('✓ La columna variante_id ya existe. No se requiere migración.');
      db.close();
      return;
    }

    // Verificar si hay pedidos existentes
    const pedidosCount = db.prepare('SELECT COUNT(*) as count FROM pedido_items').get();

    if (pedidosCount.count > 0) {
      console.log(`⚠️ Se encontraron ${pedidosCount.count} items de pedidos existentes.`);
      console.log('Esta migración recreará la tabla pedido_items.');
      console.log('⚠️ ADVERTENCIA: Los pedidos existentes se eliminarán.');

      // Limpiar pedidos existentes
      db.prepare('DELETE FROM pedido_items').run();
      db.prepare('DELETE FROM pedidos').run();
      console.log('✓ Pedidos antiguos eliminados.');
    }

    // SQLite no soporta ALTER TABLE para agregar FOREIGN KEY
    // Debemos recrear la tabla
    console.log('Recreando tabla pedido_items con variante_id...');

    // Paso 1: Renombrar la tabla antigua
    db.prepare('ALTER TABLE pedido_items RENAME TO pedido_items_old').run();

    // Paso 2: Crear nueva tabla con la columna variante_id
    db.exec(`
      CREATE TABLE pedido_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pedido_id INTEGER NOT NULL,
        producto_id INTEGER NOT NULL,
        variante_id INTEGER NOT NULL,
        cantidad INTEGER NOT NULL,
        precio_unitario REAL NOT NULL,
        notas TEXT DEFAULT '',
        FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
        FOREIGN KEY (producto_id) REFERENCES productos(id),
        FOREIGN KEY (variante_id) REFERENCES producto_variantes(id)
      )
    `);

    // Paso 3: Si hubiera datos que migrar (en este caso ya los eliminamos)
    // En un futuro, aquí se podría intentar recuperar el variante_id basado en el precio
    // pero es más seguro empezar desde cero

    // Paso 4: Eliminar tabla antigua
    db.prepare('DROP TABLE pedido_items_old').run();

    console.log('✓ Tabla pedido_items recreada exitosamente con variante_id');
    console.log('✓ Migración completada exitosamente');

  } catch (error) {
    console.error('❌ Error durante la migración:', error.message);
    throw error;
  } finally {
    db.close();
  }
}

// Ejecutar migración si se ejecuta directamente
if (require.main === module) {
  migrateAddVarianteId();
}

module.exports = { migrateAddVarianteId };
