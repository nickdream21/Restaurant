const { getDbInstance } = require('./db');

/**
 * Script para agregar la columna 'notas' a la tabla pedido_items
 */
function addNotasColumn() {
  const db = getDbInstance();

  try {
    // Verificar si la columna ya existe
    const tableInfo = db.prepare("PRAGMA table_info(pedido_items)").all();
    const columnExists = tableInfo.some(col => col.name === 'notas');

    if (columnExists) {
      console.log('✓ La columna "notas" ya existe en pedido_items');
      return;
    }

    // Agregar la columna notas
    db.prepare(`
      ALTER TABLE pedido_items
      ADD COLUMN notas TEXT DEFAULT ''
    `).run();

    console.log('✓ Columna "notas" agregada exitosamente a pedido_items');

  } catch (error) {
    console.error('Error al agregar columna notas:', error.message);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  addNotasColumn();
  process.exit(0);
}

module.exports = { addNotasColumn };
