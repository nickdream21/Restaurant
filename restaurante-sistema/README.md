# 🍽️ Sistema de Gestión de Restaurante

Sistema completo de gestión para restaurantes con panel de mesera, cocina y administración. Desarrollado con Node.js, Express, SQLite y React.

## 📋 Características

- **Panel de Mesera**: Gestión de mesas, creación de pedidos y notificaciones en tiempo real
- **Panel de Cocina**: Visualización y actualización de estados de pedidos
- **Panel de Administrador**: Dashboard con estadísticas, ventas y reportes
- **Notificaciones en Tiempo Real**: Usando Socket.IO para comunicación bidireccional
- **Sistema de Variantes**: Productos con diferentes tamaños y precios
- **Gestión de Ventas**: Seguimiento completo de ventas y cierres de mesas

## 🛠️ Tecnologías

### Backend
- Node.js
- Express 5
- SQLite3 (better-sqlite3)
- Socket.IO
- CORS

### Frontend
- React 19
- Vite
- React Router DOM
- Axios
- Socket.IO Client
- Tailwind CSS

## 📦 Requisitos Previos

- Node.js v16 o superior
- npm o yarn

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd Restaurant/restaurante-sistema
```

### 2. Configurar el Backend

```bash
cd backend
npm install
```

Crear archivo `.env` basado en `.env.example`:

```bash
cp .env.example .env
```

Editar `.env` con tus configuraciones:

```env
PORT=3000
NODE_ENV=development
```

Inicializar la base de datos:

```bash
node database/init.js
```

### 3. Configurar el Frontend

```bash
cd ../frontend
npm install
```

Crear archivo `.env` si necesitas configurar variables:

```env
VITE_API_URL=http://localhost:3000
```

## 🎯 Ejecución

### Modo Desarrollo

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

El servidor estará disponible en `http://localhost:3000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

### Modo Producción

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

## 📱 Acceso a la Aplicación

Una vez iniciados ambos servidores:

1. Accede a `http://localhost:5173`
2. Selecciona el panel deseado:
   - **Mesera**: Para gestionar mesas y tomar pedidos
   - **Cocina**: Para ver y procesar pedidos
   - **Admin**: Para ver estadísticas y reportes

### Acceso desde otros dispositivos en la red local

El backend muestra automáticamente la IP de red al iniciar. Por ejemplo:

```
Server running on port 3000
Local: http://localhost:3000
Network: http://192.168.1.100:3000
```

Desde otros dispositivos en la misma red, accede a:
- Frontend: `http://<IP-DEL-SERVIDOR>:5173`
- Backend: `http://<IP-DEL-SERVIDOR>:3000`

## 📂 Estructura del Proyecto

```
restaurante-sistema/
├── backend/
│   ├── config/          # Configuraciones
│   ├── database/        # Base de datos y migraciones
│   │   ├── db.js
│   │   ├── init.js
│   │   └── schema.sql
│   ├── models/          # Modelos de datos
│   │   ├── Mesa.js
│   │   ├── Pedido.js
│   │   ├── Producto.js
│   │   └── Reporte.js
│   ├── routes/          # Rutas de la API
│   │   ├── mesas.js
│   │   ├── pedidos.js
│   │   ├── productos.js
│   │   └── reportes.js
│   ├── .env
│   ├── .env.example
│   ├── server.js
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/  # Componentes reutilizables
    │   ├── pages/       # Páginas principales
    │   │   ├── Home.jsx
    │   │   ├── Mesera.jsx
    │   │   ├── Cocina.jsx
    │   │   └── Admin.jsx
    │   ├── services/    # Servicios API
    │   ├── utils/       # Utilidades
    │   ├── App.jsx
    │   └── main.jsx
    ├── package.json
    └── vite.config.js
```

## 🔌 API Endpoints

### Mesas
- `GET /api/mesas` - Listar todas las mesas
- `POST /api/mesas/:id/abrir` - Abrir una mesa
- `POST /api/mesas/:id/cerrar` - Cerrar una mesa
- `POST /api/mesas/:id/cancelar` - Cancelar cuenta de una mesa

### Productos
- `GET /api/productos` - Listar productos disponibles

### Pedidos
- `POST /api/pedidos` - Crear nuevo pedido
- `GET /api/pedidos/pendientes` - Listar pedidos pendientes
- `GET /api/pedidos/mesa/:mesa_id` - Pedidos de una mesa
- `PUT /api/pedidos/:id/estado` - Cambiar estado del pedido
- `POST /api/pedidos/:id/cancelar` - Cancelar pedido
- `DELETE /api/pedidos/:pedido_id/items/:item_id` - Eliminar item

### Reportes
- `GET /api/reportes/ventas-dia` - Ventas del día
- `GET /api/reportes/estadisticas` - Estadísticas generales
- `GET /api/reportes/historial` - Historial de ventas

## 🗄️ Base de Datos

El proyecto utiliza SQLite3 para almacenar datos. La base de datos se crea automáticamente al ejecutar `node database/init.js`.

### Tablas principales:
- **mesas**: Información de mesas del restaurante
- **productos**: Catálogo de productos
- **producto_variantes**: Variantes de productos (tamaños y precios)
- **pedidos**: Pedidos realizados
- **pedido_items**: Items individuales de cada pedido
- **ventas**: Registro de ventas completadas

### Reiniciar la base de datos:

⚠️ **ADVERTENCIA**: Esto eliminará todos los datos.

```bash
cd backend/database
rm restaurant.db
node init.js
```

## 🔧 Scripts Disponibles

### Backend

```bash
npm start       # Inicia el servidor en modo producción
npm run dev     # Inicia el servidor con nodemon (auto-reload)
```

### Frontend

```bash
npm run dev     # Inicia servidor de desarrollo
npm run build   # Construye para producción
npm run preview # Preview del build de producción
npm run lint    # Ejecuta el linter
```

## 🌐 Configuración de Red

Para usar el sistema en una red local:

1. Asegúrate de que el firewall permita conexiones en los puertos 3000 y 5173
2. El backend escucha en `0.0.0.0` por defecto (todas las interfaces)
3. Configura el frontend para apuntar a la IP correcta del backend

## 🐛 Solución de Problemas

### El backend no se conecta

- Verifica que el puerto 3000 no esté en uso
- Revisa el archivo `.env` y las configuraciones
- Asegúrate de que la base de datos existe

### El frontend no se comunica con el backend

- Verifica que el backend esté ejecutándose
- Revisa la configuración de CORS en `backend/server.js`
- Comprueba la URL del API en el frontend

### Problemas con Socket.IO

- Verifica que ambos cliente y servidor usen la misma versión
- Revisa la consola del navegador para errores de conexión
- Asegúrate de que no haya proxies bloqueando WebSocket

## 📝 Zona Horaria

El sistema está configurado para la zona horaria de Perú (America/Lima). Para cambiar:

Edita `backend/server.js`:

```javascript
process.env.TZ = 'America/Lima'; // Cambiar a tu zona horaria
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia ISC.

## 👥 Autor

Desarrollado para gestión de restaurantes en Sullana, Piura - Perú

## 🆘 Soporte

Para reportar bugs o solicitar nuevas características, por favor abre un issue en el repositorio.

---

**¡Disfruta gestionando tu restaurante!** 🍕🍔🍰
