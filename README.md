# Sistema de Gestión de Restaurante

Sistema completo de punto de venta (POS) para restaurantes con gestión de mesas, pedidos, productos y reportes de ventas en tiempo real.

## Características Principales

### Gestión de Mesas
- **Control en tiempo real** de mesas con estados: libre, ocupada, reservada
- **Apertura y cierre** de mesas con seguimiento de tiempo
- **Total acumulado** por mesa visible en todo momento
- **Actualización automática** mediante WebSockets

### Sistema de Pedidos
- **Interfaz intuitiva** para crear pedidos por mesa
- **Productos con variantes** (tamaños: Personal, Mediano, Familiar)
- **Estados de pedidos**: pendiente, en preparación, completado
- **Notas especiales** para cada item del pedido
- **Historial completo** de pedidos por mesa

### Panel de Administración
- **Gestión de productos** con categorías y variantes de precio
- **Reportes de ventas** con filtros por fecha
- **Estadísticas en tiempo real**: ventas totales, productos más vendidos
- **Gráficos y visualizaciones** de datos de ventas
- **Control de disponibilidad** de productos

### Comunicación en Tiempo Real
- **WebSockets (Socket.IO)** para actualizaciones instantáneas
- **Sincronización automática** entre múltiples dispositivos
- **Notificaciones** de cambios de estado de pedidos y mesas

## Stack Tecnológico

### Backend
- **Node.js** + **Express** v5.1.0
- **SQLite** (better-sqlite3) para base de datos
- **Socket.IO** v4.8.1 para comunicación en tiempo real
- **CORS** habilitado para desarrollo multiplataforma
- **dotenv** para gestión de variables de entorno

### Frontend
- **React** v19.1.1 con **React Router** v7.9.3
- **Vite** v7.1.7 como build tool
- **Tailwind CSS** v3.4.18 para estilos
- **Axios** v1.12.2 para peticiones HTTP
- **Socket.IO Client** v4.8.1 para WebSockets

## Estructura del Proyecto

```
Restaurant/
├── restaurante-sistema/
│   ├── backend/
│   │   ├── database/
│   │   │   ├── schema.sql           # Esquema de base de datos
│   │   │   ├── init.js              # Inicialización de BD
│   │   │   └── restaurant.db        # Base de datos SQLite
│   │   ├── models/
│   │   │   ├── Mesa.js              # Modelo de mesas
│   │   │   ├── Pedido.js            # Modelo de pedidos
│   │   │   ├── Producto.js          # Modelo de productos
│   │   │   └── Reporte.js           # Modelo de reportes
│   │   ├── routes/
│   │   │   ├── mesas.js             # Rutas de mesas
│   │   │   ├── pedidos.js           # Rutas de pedidos
│   │   │   ├── productos.js         # Rutas de productos
│   │   │   └── reportes.js          # Rutas de reportes
│   │   ├── .env.example             # Variables de entorno ejemplo
│   │   ├── server.js                # Servidor principal
│   │   └── package.json
│   └── frontend/
│       ├── src/
│       │   ├── components/
│       │   │   ├── TarjetaMesa.jsx         # Componente de mesa
│       │   │   ├── TarjetaPedido.jsx       # Componente de pedido
│       │   │   ├── GestionProductos.jsx    # Gestión de productos
│       │   │   └── ReporteVentas.jsx       # Reportes de ventas
│       │   ├── pages/
│       │   │   ├── Home.jsx                # Página principal (mesas)
│       │   │   └── Admin.jsx               # Panel de administración
│       │   ├── services/
│       │   │   └── api.js                  # Cliente API y WebSockets
│       │   ├── App.jsx
│       │   └── main.jsx
│       ├── .env.example             # Variables de entorno ejemplo
│       ├── package.json
│       ├── vite.config.js
│       └── tailwind.config.js
└── README.md
```

## Modelo de Base de Datos

### Tablas Principales

**mesas**
- `id`: Identificador único
- `numero`: Número de mesa (único)
- `estado`: libre | ocupada | reservada
- `total_actual`: Total acumulado en la mesa
- `abierta_en`: Timestamp de apertura
- `cerrada_en`: Timestamp de cierre

**productos**
- `id`: Identificador único
- `nombre`: Nombre del producto
- `categoria`: Categoría del producto
- `disponible`: Estado de disponibilidad (0/1)

**producto_variantes**
- `id`: Identificador único
- `producto_id`: Referencia a producto
- `tamano`: Personal | Mediano | Familiar
- `precio`: Precio de la variante

**pedidos**
- `id`: Identificador único
- `mesa_id`: Referencia a mesa
- `estado`: pendiente | en preparación | completado
- `creado_en`: Timestamp de creación
- `completado_en`: Timestamp de completado

**pedido_items**
- `id`: Identificador único
- `pedido_id`: Referencia a pedido
- `producto_id`: Referencia a producto
- `variante_id`: Referencia a variante
- `cantidad`: Cantidad del producto
- `precio_unitario`: Precio al momento del pedido
- `notas`: Notas especiales del item

## Instalación y Configuración

### Prerrequisitos
- Node.js v18 o superior
- npm v9 o superior

### Paso 1: Clonar el Repositorio
```bash
git clone https://github.com/nickdream21/Restaurant.git
cd Restaurant/restaurante-sistema
```

### Paso 2: Configurar Backend

```bash
cd backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# Editar .env con tus configuraciones
# PORT=3000
# NODE_ENV=development
# TZ=America/Lima
# FRONTEND_URL=http://localhost:5173
# DB_PATH=./database/restaurant.db

# Inicializar base de datos
npm run init-db
```

### Paso 3: Configurar Frontend

```bash
cd ../frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# Editar .env con la URL del backend
# VITE_API_URL=http://localhost:3000
```

### Paso 4: Ejecutar la Aplicación

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Servidor corriendo en http://localhost:3000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# Aplicación corriendo en http://localhost:5173
```

## Scripts Disponibles

### Backend
- `npm start` - Iniciar servidor en producción
- `npm run dev` - Iniciar servidor con nodemon (desarrollo)
- `npm run init-db` - Inicializar/resetear base de datos

### Frontend
- `npm run dev` - Iniciar servidor de desarrollo
- `npm run build` - Compilar para producción
- `npm run preview` - Previsualizar build de producción
- `npm run lint` - Ejecutar linter ESLint

## API Endpoints

### Mesas
- `GET /api/mesas` - Obtener todas las mesas
- `POST /api/mesas` - Crear nueva mesa
- `PUT /api/mesas/:id/estado` - Actualizar estado de mesa
- `DELETE /api/mesas/:id` - Eliminar mesa

### Pedidos
- `GET /api/pedidos/mesa/:mesaId` - Obtener pedidos de una mesa
- `POST /api/pedidos` - Crear nuevo pedido
- `PUT /api/pedidos/:id/estado` - Actualizar estado de pedido
- `POST /api/pedidos/:id/items` - Agregar items a pedido
- `DELETE /api/pedidos/:id` - Eliminar pedido

### Productos
- `GET /api/productos` - Obtener todos los productos con variantes
- `POST /api/productos` - Crear nuevo producto con variantes
- `PUT /api/productos/:id` - Actualizar producto
- `PUT /api/productos/:id/disponibilidad` - Toggle disponibilidad
- `DELETE /api/productos/:id` - Eliminar producto

### Reportes
- `GET /api/reportes/ventas` - Obtener reporte de ventas (con filtros de fecha)
- `GET /api/reportes/productos-vendidos` - Productos más vendidos

## Eventos WebSocket

### Servidor -> Cliente
- `mesa:actualizada` - Mesa actualizada
- `mesa:creada` - Nueva mesa creada
- `mesa:eliminada` - Mesa eliminada
- `pedido:actualizado` - Pedido actualizado
- `pedido:creado` - Nuevo pedido creado

### Cliente -> Servidor
- `connection` - Cliente conectado
- `disconnect` - Cliente desconectado

## Características de Seguridad

- Validación de datos en backend
- Manejo de errores centralizado
- CORS configurado para URLs específicas
- Variables de entorno para configuración sensible
- Base de datos con restricciones de integridad referencial

## Desarrollo Futuro

- [ ] Sistema de autenticación de usuarios
- [ ] Roles y permisos (mesero, cocinero, administrador)
- [ ] Impresión de tickets/facturas
- [ ] Integración con pasarelas de pago
- [ ] Aplicación móvil nativa
- [ ] Multi-restaurante (franquicias)
- [ ] Inventario de productos
- [ ] Sistema de propinas
- [ ] Reservaciones de mesas
- [ ] Dashboard de analytics avanzado

## Contribución

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/NuevaCaracteristica`)
3. Commit tus cambios (`git commit -m 'Agregar nueva característica'`)
4. Push a la rama (`git push origin feature/NuevaCaracteristica`)
5. Abre un Pull Request

## Licencia

ISC

## Autor

**nickdream21**

## Soporte

Para reportar bugs o solicitar características, por favor abre un issue en el repositorio de GitHub.

---

**Nota:** Este proyecto fue desarrollado como sistema de punto de venta para restaurantes pequeños y medianos, con enfoque en simplicidad y eficiencia operativa.
