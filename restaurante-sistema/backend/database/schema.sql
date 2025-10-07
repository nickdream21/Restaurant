-- Tabla de mesas del restaurante
-- Gestiona el estado y control de cada mesa
CREATE TABLE IF NOT EXISTS mesas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  numero INTEGER NOT NULL UNIQUE, -- Número identificador de la mesa
  estado TEXT NOT NULL CHECK(estado IN ('disponible', 'ocupada', 'reservada')) DEFAULT 'disponible',
  total_actual REAL DEFAULT 0.0, -- Total acumulado de la cuenta actual
  abierta_en DATETIME, -- Timestamp cuando se abrió la mesa
  cerrada_en DATETIME -- Timestamp cuando se cerró la mesa
);

-- Tabla de productos del menú
-- Catálogo de todos los productos disponibles
CREATE TABLE IF NOT EXISTS productos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  precio REAL NOT NULL CHECK(precio > 0), -- Precio debe ser positivo
  categoria TEXT NOT NULL CHECK(categoria IN ('bebida', 'entrada', 'plato_principal', 'postre')),
  disponible INTEGER NOT NULL DEFAULT 1 CHECK(disponible IN (0, 1)) -- Boolean: 1=disponible, 0=no disponible
);

-- Tabla de pedidos
-- Agrupa items pedidos por mesa
CREATE TABLE IF NOT EXISTS pedidos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  mesa_id INTEGER NOT NULL,
  estado TEXT NOT NULL CHECK(estado IN ('pendiente', 'en_preparacion', 'completado', 'cancelado')) DEFAULT 'pendiente',
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completado_en DATETIME,
  FOREIGN KEY (mesa_id) REFERENCES mesas(id) ON DELETE CASCADE
);

-- Tabla de items de pedidos
-- Detalle de productos y cantidades en cada pedido
CREATE TABLE IF NOT EXISTS pedido_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pedido_id INTEGER NOT NULL,
  producto_id INTEGER NOT NULL,
  cantidad INTEGER NOT NULL CHECK(cantidad > 0), -- Cantidad debe ser positiva
  precio_unitario REAL NOT NULL CHECK(precio_unitario > 0), -- Precio al momento del pedido
  FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
  FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE RESTRICT
);

-- Índices para optimizar consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_mesas_estado ON mesas(estado);
CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria);
CREATE INDEX IF NOT EXISTS idx_productos_disponible ON productos(disponible);
CREATE INDEX IF NOT EXISTS idx_pedidos_mesa ON pedidos(mesa_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_estado ON pedidos(estado);
CREATE INDEX IF NOT EXISTS idx_pedido_items_pedido ON pedido_items(pedido_id);
