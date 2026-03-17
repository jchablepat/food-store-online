#

# Food Store (Fast Food) — Monorepo Angular + Node.js + MongoDB

Tienda online de comida rápida construida como monorepo, con frontend en Angular y backend en Node.js (Express) conectado a MongoDB. Incluye autenticación con JWT, carrito de compras, creación/seguimiento de pedidos y flujo de pago con PayPal (SDK en el cliente).

## Características principales

- Catálogo de productos: listado, detalle, búsqueda por texto y filtrado por etiquetas.
- Autenticación de usuarios: registro e inicio de sesión con JWT.
- Carrito de compras persistente en el navegador (localStorage).
- Checkout protegido por autenticación.
- Creación de pedidos y seguimiento por ID.
- Pago con PayPal (captura en el frontend) y registro del `paymentId` en el backend.

## Tecnologías utilizadas

**Frontend**

- Angular 19 (standalone components, routing)
- RxJS (Reactive Extensions for JavaScript)
- ngx-toastr (notificaciones)
- Leaflet (mapa / geolocalización)

**Backend**

- Node.js + Express
- TypeScript
- MongoDB + Mongoose
- JWT (jsonwebtoken) + bcryptjs
- dotenv, cors, morgan, express-async-handler

## Estructura del proyecto (monorepo)

```
.
├─ frontend/                 # Aplicación Angular
│  ├─ src/
│  └─ angular.json           # outputPath apunta a ../backend/built/public
├─ backend/                  # API REST + servidor estático (producción)
│  ├─ src/
│  │  ├─ routers/            # /api/foods, /api/users, /api/orders
│  │  ├─ models/             # Mongoose: Food, User, Order
│  │  └─ .env.example        # Variables requeridas
│  └─ tsconfig.json          # outDir: ./built
└─ package.json              # Scripts de build/start a nivel raíz
```

Notas:

- El build de Angular genera los archivos estáticos en `backend/built/public` (ver `frontend/angular.json`).
- El build del backend compila TypeScript a `backend/built`.
- En producción, el backend sirve el frontend desde `backend/built/public`.

## Instalación y configuración

### Requisitos

- Node.js: `>=20.11.0 <23` (según `package.json` en la raíz)
- npm (incluido con Node)
- MongoDB (local o Atlas)

### Backend (API)

1. Instala dependencias:
   ```bash
   cd backend
   npm install
   ```
2. Crea tu archivo de entorno a partir del ejemplo:
   - Copia `backend/src/.env.example` a `backend/src/.env`
3. Completa las variables (ver sección “Variables de entorno”).
4. Ejecuta en modo desarrollo:
   ```bash
   npm run start
   ```
   Este script se ejecuta dentro de `backend/src` con `nodemon`.

### Frontend (Angular)

1. Instala dependencias:
   ```bash
   cd frontend
   npm install
   ```
2. Ejecuta en modo desarrollo:
   ```bash
   npm run start
   ```
   Por defecto: `http://localhost:4200`.

## Variables de entorno necesarias (Backend)

Ubicación: `backend/src/.env` (en desarrollo).

```
MONGODB_REMOTE_URL=<cadena de conexión de MongoDB>
JWT_SECRET=<secreto para firmar JWT>
CLIENT_URL=http://localhost:4200
```

Variables adicionales soportadas:

- `PORT` (opcional): por defecto `5000`.
- `NODE_ENV` (opcional): si es distinto de `production`, se habilita logging con `morgan`.

Importante:

- En producción, el servidor compilado se ejecuta desde `backend/built`. Si vas a usar `dotenv` también en producción, las variables deben estar disponibles en el entorno del proceso, o el `.env` debe ser accesible desde el directorio de ejecución.

## Cómo ejecutar el proyecto en desarrollo

En dos terminales:

1. Backend:

```bash
cd backend
npm run start
```

1. Frontend:

```bash
cd frontend
npm run start
```

El frontend (modo desarrollo) consume la API en `http://localhost:5000` (ver `frontend/src/app/shared/constants/urls.ts`).

## Build y ejecución tipo “producción” (sirviendo frontend desde el backend)

Desde la raíz del repo:

```bash
npm run build
npm run start
```

Qué hace:

- `npm run build` en la raíz:
  - Compila el backend (TypeScript → `backend/built`).
  - Compila el frontend y lo deja en `backend/built/public`.
- `npm run start` en la raíz:
  - Ejecuta `node backend/built/server.js`.

## Despliegue del backend en Render

Este proyecto puede desplegarse como **Web Service** en Render usando el subdirectorio `backend/` como raíz de la app.

### Configuración recomendada (Root Directory = backend)

En Render → New → Web Service:

- **Root Directory**: `backend`
- **Build Command**: `npm ci && npm run build`
- **Start Command**: `npm start`

Variables de entorno (Environment Variables):

- `MONGODB_REMOTE_URL`: cadena de conexión (MongoDB Atlas u otra)
- `JWT_SECRET`: secreto para firmar JWT
- `CLIENT_URL`: URL del frontend permitido por CORS (en producción será tu dominio del frontend)
- `NODE_ENV` (opcional): `production`
- `PORT` (opcional): Render lo inyecta automáticamente en la mayoría de casos

Notas:

- Evita usar comas para encadenar comandos. Si necesitas dos comandos, usa `&&` (por ejemplo: `npm run prebuild && npm run build`).
- En este repo el comando `start` de `backend` ejecuta el servidor compilado: `node built/server.js`.

### Ejemplo de URL final (rutas)

Suponiendo que Render te da una URL como:

- `https://food-store-backend.onrender.com`

Entonces algunas rutas quedarían así:

- `GET https://food-store-backend.onrender.com/api/foods`
- `POST https://food-store-backend.onrender.com/api/users/login`
- `GET https://food-store-backend.onrender.com/api/orders/track/<orderId>`

## Despliegue del frontend en Vercel

El frontend puede desplegarse como sitio estático (SPA) en Vercel usando el subdirectorio `frontend/` como raíz del proyecto.

### Configuración recomendada (Root Directory = frontend)

En Vercel → New Project:

- **Root Directory**: `frontend`
- **Install Command**: `npm ci`
- **Build Command**: `npm run build:vercel`
- **Output Directory**: `dist/angular-app/browser`
- **Node.js Version**: `20.x` o `22.x` (LTS)

Notas:

- El script `build:vercel` fuerza el output a `frontend/dist` (evita escribir en `backend/built/public`, que es el output del build “monorepo”).
- Si al refrescar rutas (por ejemplo `/login` o `/track/123`) Vercel devuelve 404, necesitas configurar un rewrite para que todas las rutas apunten a `index.html` (SPA routing).

### Conectar frontend (Vercel) con backend (Render)

El frontend consume el backend a través de una URL base configurable por environment.

- **Dev**: `apiBaseUrl = http://localhost:5000`
- **Prod**: `apiBaseUrl = https://<tu-backend>.onrender.com`

Archivos:

- `frontend/src/environments/environment.development.ts` (dev)
- `frontend/src/environments/environment.ts` (prod)

Ejemplo (producción):

- `apiBaseUrl: 'https://food-store-backend.onrender.com'`

Además, en el backend (Render) configura CORS con:

- `CLIENT_URL = https://<tu-app>.vercel.app`

### PayPal client-id (frontend)

El `client-id` de PayPal no está hardcodeado en `index.html`. Se configura en:

- `frontend/src/environments/environment.development.ts` (dev)
- `frontend/src/environments/environment.ts` (prod)

Variable:

- `paypalClientId`

## API REST (resumen)

Base URL (dev): `http://localhost:5000`

**Foods**

- `GET /api/foods` — listado
- `GET /api/foods/:id` — detalle
- `GET /api/foods/search/:searchTerm` — búsqueda
- `GET /api/foods/tags` — tags con conteo
- `GET /api/foods/tags/:tagName` — filtrado por tag
- `GET /api/foods/seed` — carga de datos de ejemplo

**Users**

- `POST /api/users/login` — login (devuelve token JWT)
- `POST /api/users/register` — registro (devuelve token JWT)
- `GET /api/users/seed` — carga de usuarios de ejemplo

**Orders** (requiere autenticación)

- `POST /api/orders/create` — crea pedido
- `GET /api/orders/latest` — obtiene el pedido con estado `NEW` del usuario
- `POST /api/orders/pay` — marca pedido como `PAYED` guardando `paymentId`
- `GET /api/orders/track/:id` — tracking de pedido

Autenticación:

- El frontend envía el token en el header `access_token`.

## Flujo general de la aplicación

1. El usuario navega el catálogo (home, tags, búsqueda) y revisa el detalle del producto.
2. Agrega productos al carrito (persistencia en localStorage).
3. Se registra o inicia sesión (JWT se almacena en localStorage).
4. En checkout (ruta protegida), completa nombre/dirección y ubicación (mapa / geolocalización).
5. Se crea un pedido en el backend con estado `NEW`.
6. En el paso de pago, se muestra el botón de PayPal:
   - El SDK captura el pago en el cliente.
   - Se envía el `paymentId` al backend para marcar el pedido como `PAYED`.
7. Se navega a la pantalla de tracking (`/track/:orderId`).

## Integración con PayPal (breve)

- El SDK de PayPal se carga dinámicamente desde el componente `paypal-button` usando el `paypalClientId` configurado en los environments.
- El componente `paypal-button` crea la orden y ejecuta `capture()` al aprobar el pago.
- Tras capturar el pago, se envía el `paymentId` al backend (`POST /api/orders/pay`) para actualizar el pedido.

## Posibles mejoras / Roadmap

- Mover el `client-id` de PayPal a configuración segura (variables de entorno / CI) y evitar hardcode en el HTML.
- Validar pagos del lado del servidor (p. ej. verificación contra APIs de PayPal) y/o integrar webhooks.
- Unificar el manejo de tokens usando el header estándar `Authorization: Bearer <token>`.
- Añadir validaciones más estrictas de entrada (DTOs/schemas) y rate limiting.
- Añadir tests automatizados (backend) y pipeline de CI.
- Docker Compose para levantar frontend+backend+MongoDB de forma reproducible.
