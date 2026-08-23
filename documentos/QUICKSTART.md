# 🚀 Guía de Inicio Rápido — Frapen Angels

Esta guía te llevará paso a paso por la instalación y ejecución completa del proyecto Frapen Angels (backend + frontend) en tu máquina local.

---

## 📢 Cambios recientes (Agosto 2026)

✅ **Frontend completamente configurado**:
- React 18 + Vite + TypeScript
- Proxy automático a la API del backend
- Variables de entorno (.env) listas
- Context API para autenticación (JWT)
- Linting con ESLint integrado
- Todo listo para ejecutar con `npm run dev`

**Resultado**: Ahora el proyecto es 100% funcional en local con solo 5 pasos simples.

---

## ✅ Requisitos previos

Antes de comenzar, verifica que tienes instalado:

### Windows:
- **Node.js 18+** con npm (Descarga desde [nodejs.org](https://nodejs.org))
- **Docker Desktop** (Descarga desde [docker.com](https://www.docker.com/products/docker-desktop))
- **Git** (Descarga desde [git-scm.com](https://git-scm.com))

### Verificar la instalación:
```bash
node --version    # Debe mostrar v18 o superior
npm --version     # Debe mostrar 9+
docker --version  # Debe mostrar Docker version 20+
```

Si alguno falta, instálalo desde los enlaces anteriores.

---

## 🗂️ Paso 1: Clonar y preparar el proyecto

```bash
# Clonar el repositorio
git clone https://github.com/Juls-85/AI4Devs-finalproject.git
cd AI4Devs-finalproject

# Instalar dependencias del backend
npm install
```

---

## 🔐 Paso 2: Configurar variables de entorno

1. En la **raíz del proyecto**, copia el archivo de ejemplo:
```bash
# En PowerShell
Copy-Item .env.example -Destination .env

# O en Cmd
copy .env.example .env
```

2. Abre el archivo `.env` y verifica que contiene:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=frapen_user
DB_PASSWORD=frapen_password_dev
DB_NAME=frapen_angels
NODE_ENV=development
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRATION=7d
```

> ⚠️ **IMPORTANTE**: En producción, cambia `JWT_SECRET` por una clave segura y `NODE_ENV=production`.

---

## 🐘 Paso 3: Iniciar PostgreSQL

### Opción A: Script automático (Recomendado para Windows)

Ejecuta este archivo (doble clic desde el explorador):
```
start-db.bat
```

El script:
1. Verifica que Docker Desktop está corriendo
2. Lo inicia automáticamente si no está activo
3. Crea y arranca el contenedor PostgreSQL
4. Muestra las credenciales finales

### Opción B: Comando manual

```bash
# Desde la raíz del proyecto
docker-compose up -d
```

### Verificar que PostgreSQL está corriendo

```bash
docker-compose ps
```

Deberías ver:
```
CONTAINER ID   IMAGE                 COMMAND                  STATUS
xxxxxxxx       postgres:16-alpine    "docker-entrypoint..."   Up X seconds
```

Si no ves el contenedor, revisa la sección [Troubleshooting](#troubleshooting).

---

## 🚀 Paso 4: Iniciar Backend + Frontend simultáneamente

### ⚡ Opción Recomendada (Backend + Frontend juntos)

**En una ÚNICA terminal**, desde la raíz del proyecto:

```bash
npm run dev:all
```

Esto iniciará automáticamente:
- 🔧 Backend en http://localhost:3000 (NestJS)
- 🎨 Frontend en http://localhost:3001 (React + Vite)

Verás logs de ambos en la misma terminal.

---

### 🔧 Opción B: Ejecutar por separado (si lo prefieres)

#### Terminal 1 - Backend:
```bash
npm run dev
```

Verás:
```
[Nest] 20224  - 21/08/2026, 17:56:34     LOG [NestFactory] Starting Nest application...
[Nest] 20224  - 21/08/2026, 17:56:34     LOG [InstanceLoader] AppModule dependencies initialized +79ms
...
[Nest] 20224  - 21/08/2026, 17:56:34     LOG [NestApplication] Nest application successfully started +3ms
```

**El backend estará disponible en http://localhost:3000**

#### Terminal 2 - Frontend:
```bash
npm run dev:frontend
```

Verás:
```
  VITE v4.5.0  ready in 456 ms

  ➜  Local:   http://localhost:3001/
  ➜  press h to show help
```

**El frontend estará disponible en http://localhost:3001**

### Configuración automática
- ✅ Vite está configurado para hacer proxy de `/api` al backend en puerto 3000
- ✅ Las variables de entorno ya están configuradas
- ✅ TypeScript está configurado para React 18 y NestJS
- ✅ Frontend integrado en `src/presentation/`

---

## 📊 Paso 6: Conectar DBeaver (opcional pero recomendado)

Para visualizar y gestionar la base de datos gráficamente:

1. Descarga [DBeaver Community](https://dbeaver.io) (gratuito)
2. Abre DBeaver e instala si es necesario
3. **Archivo → Nueva conexión de BD → PostgreSQL**
4. Rellena los campos:
   - **Host**: `localhost`
   - **Port**: `5432`
   - **Database**: `frapen_angels`
   - **Username**: `frapen_user`
   - **Password**: `frapen_password_dev`
5. **Test Connection → Finish**

Ya puedes explorar las tablas de la base de datos.

---

## 📁 Estructura del proyecto

```
.
├── src/                        # Monolito modular integrado (Backend + Frontend)
│   ├── app/                    # Capa de Aplicación (Backend)
│   │   ├── admin/
│   │   ├── auth/               # Autenticación y registro
│   │   ├── calendar/           # Gestión de calendario
│   │   ├── gallery/            # Galerías de medios
│   │   ├── members/            # Perfiles de socios
│   │   ├── routes/             # Gestión de rutas
│   │   ├── payments/           # Pagos
│   │   ├── notifications/      # Notificaciones
│   │   └── app.module.ts       # Módulo raíz
│   │
│   ├── domain/                 # Capa de Dominio
│   │   ├── activities/         # Lógica de actividades
│   │   ├── members/            # Lógica de socios
│   │   ├── notifications/      # Lógica de notificaciones
│   │   ├── payments/           # Lógica de pagos
│   │   └── routes/             # Lógica de rutas
│   │
│   ├── infrastructure/         # Capa de Infraestructura
│   │   ├── config/             # Configuración TypeORM, etc.
│   │   ├── mail/               # Servicio de email
│   │   ├── payments/           # Pasarela de pagos
│   │   ├── persistence/        # Acceso a BD
│   │   ├── storage/            # Almacenamiento de archivos
│   │   └── database.module.ts
│   │
│   ├── presentation/           # 🆕 Capa de Presentación (Frontend React)
│   │   ├── components/         # Componentes React reutilizables
│   │   ├── context/            # Context API (ej: AuthContext)
│   │   ├── pages/              # Páginas principales
│   │   ├── styles/             # CSS de la aplicación
│   │   ├── App.tsx             # Componente raíz
│   │   ├── main.tsx            # Entrada de la aplicación
│   │   ├── index.html          # Template HTML
│   │   ├── index.css           # Estilos globales
│   │   ├── vite.config.ts      # Configuración de Vite (bundler)
│   │   └── .eslintrc.cjs       # Configuración de linter
│   │
│   ├── shared/                 # Capa Compartida
│   │   ├── config/             # Configuración compartida
│   │   ├── security/           # Guards y Strategies JWT
│   │   └── utils/              # Utilidades comunes
│   │
│   └── main.ts                 # Punto de entrada del Backend
│
├── documentos/                 # Documentación técnica
│   ├── QUICKSTART.md           # Esta guía
│   ├── modeloDatos.md          # Esquema de BD
│   ├── arquitectura.md         # Arquitectura del sistema
│   ├── historiasUsuario.md     # Requisitos funcionales
│   ├── apis.md                 # Especificación de API
│   └── tickets.md              # Tickets de trabajo
│
├── config/                     # Configuración de CI/CD
├── db/                         # Scripts de base de datos
├── scripts/                    # Scripts utilitarios
├── public/                     # Archivos públicos
│
├── docker-compose.yml          # Configuración de Docker
├── .env.example                # Template de variables de entorno
├── package.json                # Dependencias unificadas (Backend + Frontend)
├── tsconfig.json               # Configuración base de TypeScript
├── tsconfig.presentation.json  # Configuración específica de React/Vite
└── README.md                   # Descripción general del proyecto
```

### 🔧 Archivos de configuración (Backend + Frontend unificados)

| Archivo | Propósito |
|---------|-----------|
| `package.json` | Dependencias unificadas (Backend NestJS + Frontend React) |
| `tsconfig.json` | Configuración base de TypeScript |
| `tsconfig.presentation.json` | Configuración específica para React/Vite |
| `src/presentation/vite.config.ts` | Configuración de Vite (bundler rápido), proxy a API |
| `src/presentation/index.html` | Punto de entrada HTML del frontend |
| `.env` | Variables de entorno (compartidas) |
| `src/presentation/.eslintrc.cjs` | Reglas de linting para frontend |
| `.eslintrc.js` | Configuración de linting para backend |

---

## 🎯 Verificar que todo funciona

Con ambas terminales corriendo (backend en una, frontend en otra):

1. **Backend API**: http://localhost:3000
   - Deberías ver mensajes de NestJS en la terminal
   - Los endpoints estarán disponibles en `/api/v1/*`
   
2. **Frontend**: http://localhost:3001
   - Deberías ver la interfaz de la aplicación Frapen Angels
   - Podrás navegar, registrarte y acceder a la app
   - El frontend se conecta automáticamente al backend via proxy

3. **Base de datos**: DBeaver (si está conectado)
   - Deberías ver las tablas en el árbol de la izquierda

Si todo aparece correctamente, ¡el proyecto está completamente listo! 🎉

### ✅ Checklist de verificación

- [ ] Backend en http://localhost:3000 (terminal 1 mostrando logs de NestJS)
- [ ] Frontend en http://localhost:3001 (terminal 2 mostrando "ready in Xms")
- [ ] PostgreSQL corriendo (`docker-compose ps` muestra postgres UP)
- [ ] Puedo acceder a la página de login del frontend
- [ ] DBeaver conectado a la BD (opcional)

---

## 🔨 Comandos útiles

### Backend + Frontend Integrados (raíz del proyecto)
```bash
# ⚡ RECOMENDADO: Iniciar Backend + Frontend juntos
npm run dev:all

# Backend solo
npm run dev

# Frontend solo
npm run dev:frontend

# Build completo (Backend + Frontend)
npm run build:all

# Linting (Backend + Frontend)
npm run lint
```

### Build y Producción
```bash
# Build del backend
npm run build
# Resultado: ./dist/

# Build del frontend
npm run build:frontend
# Resultado: ./dist-frontend/

# Build de ambos
npm run build:all

# Iniciar backend en producción
npm start

# Tests
npm test
npm run test:watch
npm run test:cov
```

### Docker
```bash
# Ver logs de PostgreSQL
docker-compose logs postgres

# Seguir logs en tiempo real
docker-compose logs -f postgres

# Detener PostgreSQL (sin eliminar datos)
docker-compose down

# Detener y eliminar todo (incluyendo datos)
docker-compose down -v

# Reiniciar PostgreSQL
docker-compose restart
```

### Notas importantes

**Frontend (src/presentation/)**
- **Puerto**: Por defecto corre en http://localhost:3001
- **Proxy a API**: Vite redirige automáticamente `/api/*` a http://localhost:3000
- **Hot reload**: Los cambios en archivos se reflejan automáticamente en el navegador
- **Estructura**: Integrada en `src/presentation/` como capa de presentación del monolito

**Backend**
- **Puerto**: http://localhost:3000
- **API URL**: http://localhost:3000/api/v1
- **Hot reload**: NestJS en modo watch automáticamente recarga

**Instalación de dependencias**
- Todas las dependencias (backend + frontend) están en el `package.json` raíz
- Un único `npm install` instala todo

---

## 🐛 Troubleshooting

### ❌ Docker Desktop no inicia o no funciona

**Problema**: "Docker daemon is not running" o similar

**Soluciones**:
1. Verifica que tu Windows es Pro/Enterprise/Education (WSL 2 requiere Hyper-V)
2. Abre Docker Desktop manualmente desde el menú Inicio
3. Espera 30-60 segundos a que inicie completamente
4. Intenta nuevamente

[Guía oficial Docker en Windows](https://docs.docker.com/desktop/setup/install/windows-install/)

---

### ❌ Puerto 5432 ya está en uso

**Problema**: "Error binding: Address already in use"

**Solución**: Cambia el puerto en `docker-compose.yml`:
```yaml
# De:
ports:
  - "5432:5432"

# A:
ports:
  - "5433:5432"  # o cualquier puerto disponible
```

Luego actualiza el `.env`:
```env
DB_PORT=5433
```

---

### ❌ Backend no se conecta a la base de datos

**Problema**: El backend dice que no puede conectar a PostgreSQL

**Checklist**:
1. ¿PostgreSQL está corriendo? 
   ```bash
   docker-compose ps
   ```
   Debe mostrar el contenedor como "Up"

2. ¿El archivo `.env` existe y es correcto?
   ```bash
   cat .env
   ```

3. ¿Las credenciales coinciden?
   - `.env`: DB_USERNAME=frapen_user, DB_PASSWORD=frapen_password_dev
   - `docker-compose.yml`: POSTGRES_USER=frapen_user, POSTGRES_PASSWORD=frapen_password_dev

4. Intenta reconectar:
   ```bash
   docker-compose restart postgres
   ```

---

### ❌ npm install falla (Backend o Frontend)

**Problema**: "npm ERR!" o dependencias no se instalan

**Soluciones**:
1. Verifica tu conexión a internet

2. Limpia la caché de npm:
   ```bash
   npm cache clean --force
   ```

3. Elimina `node_modules` y `package-lock.json`:
   ```bash
   rm -r node_modules package-lock.json
   npm install
   ```

4. Si el error persiste, intenta con npm más nuevo:
   ```bash
   npm install -g npm@latest
   npm install
   ```

5. **Nota para Windows**: Si hay problemas de rutas, ejecuta PowerShell como administrador

---

### ❌ Frontend no carga en http://localhost:3001

**Problema**: La página no responde, muestra error, o no ve los cambios

**Checklist**:
1. ¿Estás en la raíz del proyecto (NO en `src/presentation/`)?
   ```bash
   # Asegúrate de estar en la raíz
   pwd  # Deberías ver .../AI4Devs-finalproject
   ```

2. ¿Ejecutaste `npm install` en la raíz?
   ```bash
   npm install
   ```

3. ¿El comando `npm run dev:frontend` o `npm run dev:all` está corriendo sin errores?
   - Deberías ver: `VITE v4.5.0  ready in Xms`

4. ¿El backend (http://localhost:3000) está corriendo?
   - Si solo ejecutas `npm run dev:frontend`, el backend debe estar en otra terminal

5. ¿El puerto 3001 está disponible?
   - Revisa qué está usando el puerto:
   ```bash
   netstat -ano | findstr :3001  # Windows
   ```

6. Limpia caché y reinstala:
   ```bash
   rm -r node_modules
   rm package-lock.json
   npm install
   npm run dev:frontend
   ```

7. Revisa la consola del navegador (F12) por errores de conexión a la API:
   - Abre DevTools (F12)
   - Ve a la pestaña Console
   - Busca errores de red (debería conectar a http://localhost:3000/api/v1)

---

## 📚 Documentación completa

Para información detallada sobre el proyecto, consulta:

- **[README.md](../readme.md)** — Descripción general y estado del proyecto
- **[Arquitectura](arquitectura.md)** — Patrón, componentes y decisiones técnicas
- **[Modelo de datos](modeloDatos.md)** — Esquema completo de la base de datos
- **[Historias de usuario](historiasUsuario.md)** — Requisitos funcionales (HU-01, HU-02, HU-03)
- **[API Contract](apis.md)** — Especificación detallada de endpoints
- **[Tickets](tickets.md)** — Desglose de tareas por historia de usuario

---

## 🚀 Próximos pasos

1. ✅ Ambiente local configurado
2. 📖 Lee las historias de usuario en [historiasUsuario.md](historiasUsuario.md)
3. 🔍 Explora la arquitectura en [arquitectura.md](arquitectura.md)
4. 📡 Consulta los endpoints en [apis.md](apis.md)
5. 💻 Comienza a desarrollar según los [tickets](tickets.md)

---

## 📝 Notas importantes

### Arquitectura (Monolito Modular)
- **Estructura**: Backend y Frontend integrados bajo `src/`
- **Backend**: Capas app, domain, infrastructure, shared bajo `src/`
- **Frontend**: Integrado en `src/presentation/` (capa de presentación)
- **Configuración**: Unificada en `package.json` raíz
- **Build**: Ambos se compilan desde la raíz

### Backend (NestJS + PostgreSQL)
- **Ubicación**: `src/app/`, `src/domain/`, `src/infrastructure/`, `src/shared/`
- **Base de datos**: Las tablas se crean automáticamente con las migraciones de TypeORM (configuradas en `src/infrastructure/config/typeorm.config.ts`)
- **JWT**: Cambia `JWT_SECRET` en `.env` si desplegaste a producción
- **CORS**: Configurado para aceptar peticiones desde http://localhost:3001 (frontend)
- **Puerto**: Backend en http://localhost:3000
- **Punto de entrada**: `src/main.ts`

### Frontend (React + Vite)
- **Ubicación**: `src/presentation/`
- **Puerto**: Frontend en http://localhost:3001
- **API URL**: Configurada con proxy en `src/presentation/vite.config.ts`
- **Proxy**: Vite redirige automáticamente `/api/*` → `http://localhost:3000/*`
- **Autenticación**: JWT tokens almacenados en `localStorage` tras login
- **Hot reload**: Los cambios en el código se reflejan automáticamente en el navegador
- **Build output**: `dist-frontend/`

### Seguridad en desarrollo
- **Desarrollo**: Usa siempre el ambiente de desarrollo en local
- **Nunca en .env**: credenciales reales, claves de API privadas o datos sensibles
- **Credenciales por defecto**: 
  - BD: usuario `frapen_user`, contraseña `frapen_password_dev`
  - JWT_SECRET: cambiar en producción

### Stack actual de Frapen Angels
```
Frontend:       React 18 + Vite + TypeScript (src/presentation/)
Backend:        NestJS + TypeORM + PostgreSQL (src/app/, src/domain/, etc.)
Autenticación:  JWT (Bearer tokens)
Despliegue:     Docker + Docker Compose
API:            REST endpoints en /api/v1/*
Arquitectura:   Monolito modular con capas bien definidas
```

---

**Proyecto de Fin de Máster — Frapen Angels**
- 🏍️ Club de motos — Web para socios
- 📦 Stack: NestJS + PostgreSQL + React/Next.js
- 🔒 Seguridad: JWT + bcrypt + CORS
- 🐳 Infraestructura: Docker + Docker Compose
- 📄 Documentación: Completa en `documentos/`

**¿Necesitas ayuda?** Consulta la sección [Troubleshooting](#troubleshooting) o revisa la documentación técnica en `documentos/`.
