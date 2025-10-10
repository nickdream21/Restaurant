-- Tabla de mesas
CREATE TABLE IF NOT EXISTS mesas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  numero TEXT NOT NULL UNIQUE,
  estado TEXT DEFAULT 'libre',
  total_actual REAL DEFAULT 0,
  abierta_en DATETIME,
  cerrada_en DATETIME
);

-- Tabla de productos (sin precio aquí)
CREATE TABLE IF NOT EXISTS productos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  categoria TEXT NOT NULL,
  disponible INTEGER DEFAULT 1
);

-- Tabla de variantes de productos (aquí van los precios por tamaño)
CREATE TABLE IF NOT EXISTS producto_variantes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  producto_id INTEGER NOT NULL,
  tamano TEXT NOT NULL,
  precio REAL NOT NULL,
  FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
);

-- Tabla de pedidos
CREATE TABLE IF NOT EXISTS pedidos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  mesa_id INTEGER NOT NULL,
  estado TEXT DEFAULT 'pendiente',
  creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
  completado_en DATETIME,
  FOREIGN KEY (mesa_id) REFERENCES mesas(id)
);

-- Tabla de items de pedidos
CREATE TABLE IF NOT EXISTS pedido_items (
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
);
