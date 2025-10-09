const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

/**
 * Inicializa la base de datos del restaurante
 * Crea las tablas según el schema y carga datos de ejemplo
 */
function initializeDatabase() {
  const dbPath = path.join(__dirname, 'restaurant.db');
  const schemaPath = path.join(__dirname, 'schema.sql');

  // Crear conexión a la base de datos
  const db = new Database(dbPath);

  console.log('Inicializando base de datos...');

  try {
    // Leer y ejecutar el schema SQL
    const schema = fs.readFileSync(schemaPath, 'utf8');
    db.exec(schema);
    console.log('✓ Tablas creadas exitosamente');

    // Verificar si ya hay datos
    const mesasCount = db.prepare('SELECT COUNT(*) as count FROM mesas').get();
    if (mesasCount.count > 0) {
      console.log('✓ La base de datos ya contiene datos');
      db.close();
      return;
    }

    // Insertar datos de ejemplo
    insertSampleData(db);
    console.log('✓ Datos de ejemplo insertados exitosamente');

  } catch (error) {
    console.error('Error inicializando la base de datos:', error);
    throw error;
  } finally {
    db.close();
  }

  console.log('Base de datos inicializada correctamente');
}

/**
 * Inserta datos de ejemplo en la base de datos
 * @param {Database} db - Instancia de la base de datos
 */
function insertSampleData(db) {
  // Insertar 5 mesas
  const insertMesa = db.prepare(`
    INSERT INTO mesas (numero, estado, total_actual)
    VALUES (?, ?, ?)
  `);

  const mesas = [
    [1, 'disponible', 0.0],
    [2, 'disponible', 0.0],
    [3, 'disponible', 0.0],
    [4, 'disponible', 0.0],
    [5, 'disponible', 0.0]
  ];

  for (const mesa of mesas) {
    insertMesa.run(...mesa);
  }
  console.log('  → 5 mesas creadas');

  // No insertar productos de ejemplo aquí
  // Los productos se insertarán con el script productos-reales-variantes.js
  console.log('  → Productos se deben insertar con productos-reales-variantes.js');
}

// Ejecutar inicialización si se ejecuta directamente
if (require.main === module) {
  initializeDatabase();
}

module.exports = { initializeDatabase };
