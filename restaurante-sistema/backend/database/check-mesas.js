const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'restaurant.db');
const db = new Database(dbPath);

const mesas = db.prepare('SELECT * FROM mesas ORDER BY CAST(numero AS INTEGER)').all();
console.log('Mesas en la base de datos:');
console.table(mesas);

db.close();
