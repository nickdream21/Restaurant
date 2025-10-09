const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'restaurant.db');
const db = new Database(dbPath);

console.log('Reseteando mesas...\n');

try {
  // Primero, eliminar todos los pedidos existentes (por integridad referencial)
  db.prepare('DELETE FROM pedidos').run();
  console.log('✓ Pedidos eliminados');

  // Eliminar todas las mesas
  db.prepare('DELETE FROM mesas').run();
  console.log('✓ Mesas eliminadas');

  // Resetear el autoincremento de SQLite
  db.prepare("DELETE FROM sqlite_sequence WHERE name='mesas'").run();
  console.log('✓ Secuencia reseteada');

  // Crear las mesas del 1 al 10 con IDs coincidentes
  const stmt = db.prepare('INSERT INTO mesas (numero, estado) VALUES (?, ?)');

  for (let i = 1; i <= 10; i++) {
    const result = stmt.run(i.toString(), 'libre');
    console.log(`✓ Mesa ${i} creada con id=${result.lastInsertRowid}`);
  }

  console.log('\n✓ Proceso completado');

  // Verificar resultado
  const rows = db.prepare('SELECT id, numero, estado, total_actual FROM mesas ORDER BY id').all();
  console.log('\nMesas actuales:');
  console.table(rows);

} catch (err) {
  console.error('Error:', err);
} finally {
  db.close();
}
