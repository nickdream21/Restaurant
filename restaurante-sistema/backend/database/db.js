const Database = require('better-sqlite3');
const path = require('path');
require('dotenv').config();

/**
 * Obtiene una conexión a la base de datos SQLite
 * Configurada con mejor rendimiento y modo verbose opcional
 * @returns {Database} Instancia de la base de datos
 */
function getDatabase() {
  const dbPath = process.env.DB_PATH || path.join(__dirname, 'restaurant.db');

  const db = new Database(dbPath, {
    verbose: process.env.NODE_ENV === 'development' ? console.log : null
  });

  // Optimizaciones de rendimiento
  db.pragma('journal_mode = WAL'); // Write-Ahead Logging para mejor concurrencia
  db.pragma('synchronous = NORMAL'); // Balance entre velocidad y seguridad
  db.pragma('foreign_keys = ON'); // Habilitar restricciones de claves foráneas

  return db;
}

/**
 * Singleton de la conexión a la base de datos
 * Reutiliza la misma instancia en toda la aplicación
 */
let dbInstance = null;

/**
 * Obtiene la instancia singleton de la base de datos
 * @returns {Database} Instancia única de la base de datos
 */
function getDbInstance() {
  if (!dbInstance) {
    dbInstance = getDatabase();
  }
  return dbInstance;
}

/**
 * Cierra la conexión a la base de datos
 * Útil para limpieza en shutdown de la aplicación
 */
function closeDatabase() {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
    console.log('Conexión a la base de datos cerrada');
  }
}

module.exports = {
  getDatabase,
  getDbInstance,
  closeDatabase
};
