# Guía de Configuración Local - PetCharms

Esta guía te ayudará a configurar y ejecutar el proyecto PetCharms en tu máquina local.

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** (versión 18 o superior)
  - Verificar: `node --version`
  - Descargar: [nodejs.org](https://nodejs.org/)
  
- **pnpm** (gestor de paquetes)
  - Instalar: `npm install -g pnpm`
  - Verificar: `pnpm --version`

## 🚀 Configuración Inicial

### 1. Clonar el Repositorio

Si aún no tienes el proyecto, clónalo:

```bash
git clone <url-del-repositorio>
cd petcharms
```

### 2. Instalar Dependencias

Instala todas las dependencias del proyecto usando pnpm:

```bash
pnpm install
```

Este comando instalará:
- Dependencias del frontend (React, Vite, TailwindCSS, etc.)
- Dependencias del backend (Express, Zod, etc.)
- Dependencias de desarrollo (TypeScript, Vitest, etc.)

**Tiempo estimado:** 1-2 minutos

### 3. Configurar Variables de Entorno

El proyecto usa un archivo `.env` para configuraciones. Si no existe, créalo:

```bash
# Crear archivo .env (si no existe)
touch .env
```

El archivo `.env` puede contener las siguientes variables (opcionales):

```env
# Mensaje personalizado para el endpoint /api/ping
PING_MESSAGE=ping pong

# Puerto del servidor (por defecto: 8080)
PORT=8080
```

**Nota:** El proyecto funciona sin estas variables, ya que tienen valores por defecto.

## 🗄️ Base de Datos

### Supabase (Autenticación)

El proyecto usa **Supabase** para la autenticación de usuarios. Las credenciales están configuradas en `client/lib/supabase.ts`.

**Estado actual:** Las credenciales están hardcodeadas en el código. Para producción, deberías moverlas a variables de entorno.

### Almacenamiento de Datos

**Backend (Órdenes):**
- Las órdenes se almacenan **en memoria** (Map en `server/routes/orders.ts`)
- ⚠️ **Importante:** Las órdenes se pierden al reiniciar el servidor
- Para producción, deberías migrar a una base de datos real (PostgreSQL, SQLite, etc.)

**Datos de Productos/Charms:**
- Los productos, charms, shapes y colores están **hardcodeados** en las rutas del servidor
- Archivos: `server/routes/products.ts`, `server/routes/charms.ts`, `server/routes/shapes.ts`

## ▶️ Ejecutar el Proyecto

### Modo Desarrollo

Inicia el servidor de desarrollo que incluye tanto el frontend como el backend:

```bash
pnpm dev
```

Este comando:
- ✅ Inicia el servidor Vite (frontend) en el puerto **8080**
- ✅ Inicia el servidor Express (backend) integrado
- ✅ Habilita hot-reload para cambios en tiempo real
- ✅ Sirve el frontend y la API en el mismo puerto

**URLs disponibles:**
- **Frontend:** http://localhost:8080
- **API:** http://localhost:8080/api
- **API Ping:** http://localhost:8080/api/ping

### Verificar que Funciona

Abre tu navegador y visita:
- http://localhost:8080 - Deberías ver la página principal de PetCharms

O prueba la API desde la terminal:

```bash
# Probar endpoint ping
curl http://localhost:8080/api/ping

# Probar productos
curl http://localhost:8080/api/v1/products

# Probar charms
curl http://localhost:8080/api/v1/charms
```

## 🏗️ Estructura del Proyecto

```
petcharms/
├── client/              # Frontend React
│   ├── pages/           # Páginas/rutas
│   ├── components/      # Componentes React
│   ├── lib/             # Utilidades (Supabase, utils)
│   └── App.tsx          # Punto de entrada
├── server/              # Backend Express
│   ├── routes/          # Handlers de API
│   ├── index.ts         # Configuración del servidor
│   └── node-build.ts    # Build de producción
├── shared/              # Tipos compartidos
│   └── api.ts           # Interfaces de API
├── public/              # Archivos estáticos
├── package.json         # Dependencias
├── vite.config.ts       # Configuración Vite
└── .env                 # Variables de entorno
```

## 🔧 Comandos Disponibles

```bash
# Desarrollo
pnpm dev              # Inicia servidor de desarrollo (frontend + backend)

# Producción
pnpm build            # Build de producción (cliente + servidor)
pnpm start            # Inicia servidor de producción

# Calidad de Código
pnpm typecheck        # Verifica tipos TypeScript
pnpm test             # Ejecuta tests con Vitest
pnpm format.fix       # Formatea código con Prettier
```

## 📡 Endpoints de la API

### Productos
- `GET /api/v1/products` - Lista de productos (collares)

### Charms
- `GET /api/v1/charms` - Lista de charms disponibles

### Shapes (Formas)
- `GET /api/v1/shapes` - Lista de formas disponibles
- `GET /api/v1/colors` - Lista de colores disponibles

### Órdenes
- `POST /api/v1/orders` - Crear una nueva orden
- `GET /api/v1/orders` - Listar todas las órdenes
- `GET /api/v1/orders/:orderId` - Obtener una orden específica

### Otros
- `GET /api/ping` - Endpoint de prueba
- `GET /api/demo` - Endpoint demo

## 🐛 Solución de Problemas

### El servidor no inicia

**Error:** `Port 8080 is already in use`

**Solución:**
```bash
# Encontrar proceso usando el puerto 8080
lsof -ti:8080

# Matar el proceso
kill -9 $(lsof -ti:8080)

# O cambiar el puerto en vite.config.ts
```

### Dependencias no se instalan

**Error:** `pnpm: command not found`

**Solución:**
```bash
npm install -g pnpm
```

### Errores de TypeScript

**Error:** `Cannot find module '@shared/api'`

**Solución:**
```bash
# Verificar que los alias estén configurados en:
# - vite.config.ts
# - tsconfig.json

# Reinstalar dependencias
rm -rf node_modules
pnpm install
```

### El frontend no carga

**Verificar:**
1. El servidor está corriendo: `curl http://localhost:8080/api/ping`
2. No hay errores en la consola del navegador
3. El puerto 8080 está disponible

## 🔐 Configuración de Supabase (Opcional)

Si quieres usar tu propia instancia de Supabase:

1. Crea un proyecto en [supabase.com](https://supabase.com)
2. Obtén tu URL y API Key
3. Actualiza `client/lib/supabase.ts`:

```typescript
const supabaseUrl = 'TU_SUPABASE_URL';
const supabaseKey = 'TU_SUPABASE_KEY';
```

O mejor aún, usa variables de entorno:

```typescript
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'URL_DEFAULT';
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || 'KEY_DEFAULT';
```

Y agrega al `.env`:
```env
VITE_SUPABASE_URL=tu_url
VITE_SUPABASE_KEY=tu_key
```

## 📝 Notas Importantes

1. **Datos en Memoria:** Las órdenes se pierden al reiniciar el servidor. Esto es intencional para el MVP.

2. **Hot Reload:** Los cambios en el código se reflejan automáticamente. No necesitas reiniciar el servidor.

3. **Puerto Único:** El frontend y backend comparten el puerto 8080. El servidor Express está integrado con Vite.

4. **Base de Datos:** Actualmente no hay base de datos real. Los datos están hardcodeados o en memoria.

## 🚀 Próximos Pasos

Para mejorar el proyecto:

- [ ] Migrar órdenes a base de datos (PostgreSQL/SQLite)
- [ ] Mover credenciales de Supabase a variables de entorno
- [ ] Agregar migraciones de base de datos
- [ ] Implementar tests E2E
- [ ] Configurar CI/CD

## 📞 Soporte

Si encuentras problemas:

1. Verifica que todos los requisitos estén instalados
2. Revisa los logs del servidor en la terminal
3. Verifica la consola del navegador para errores del frontend
4. Asegúrate de que el puerto 8080 esté disponible

---

**Última actualización:** Enero 2025
**Versión del proyecto:** 1.0.0

