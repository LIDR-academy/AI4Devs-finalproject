# Especificación de Estructura de Proyecto y Tecnologías

Este documento define la estructura de directorios, el stack tecnológico y la configuración de entorno para el proyecto **TRACÉ**. El proyecto sigue una estrategia de **Monorepo** para compartir lógica de negocio (Dominio) entre el API y el Worker, manteniendo interfaces separadas.

## 1. Estructura de Directorios Global

El proyecto se organiza en un espacio de trabajo (workspace) que contiene aplicaciones (`apps`) y paquetes compartidos (`packages`).

```bash
/ai4devs-finalproject
├── apps/                           # Aplicaciones desplegables
│   ├── frontend/                   # Web SPA (Nuxt 3)
│   ├── backend/                    # API REST & Websockets (Express)
│   └── worker/                     # Procesamiento en segundo plano (Node)
│
├── packages/                       # Librerías compartidas
│   └── core/                       # Lógica de Dominio, Entidades y Contratos
│
├── docs/                           # Documentación del proyecto
├── docker-compose.yml              # Orquestación local (DB, Redis, MinIO)
├── .gitignore
├── package.json                    # Scripts globales y workspaces
└── README.md
```

---

## 2. Tecnologías y Librerías

### General
*   **Lenguaje:** TypeScript (Estricto)
*   **Gestor de Paquetes:** npm / yarn / pnpm (Workspaces habilitados)
*   **Linting/Formatting:** ESLint, Prettier

### Apps/Frontend (Nuxt)
*   **Core:** Nuxt 3 (Vue 3)
*   **Estado:** Pinia
*   **Estilos:** Tailwind CSS
*   **Comunicación:** `$fetch` (REST), `socket.io-client` (Real-time)
*   **UI Components:** Headless UI o componentes propios.

### Apps/Backend (Express API)
*   **Server Framework:** Express.js
*   **ORM:** Prisma
*   **Validación:** Zod
*   **Colas:** BullMQ (Productor)
*   **Auth:** JWT (jsonwebtoken), bcrypt
*   **Sockets:** Socket.io (Server)

### Apps/Worker (Background Service)
*   **Runtime:** Node.js
*   **Colas:** BullMQ (Consumidor)
*   **Procesamiento de Imagen:** `sharp`
*   **Procesamiento de PDF:** `ghostscript-node` o `pdf-poppler`
*   **Storage:** `@aws-sdk/client-s3` (Compatible con S3 y MinIO)

### Packages/Core (Shared)
*   **Dependencias mínimas:** Solo librerías de utilidad (date-fns, zod, uuid). No debe depender de frameworks web (Express/Nuxt) ni de BD (Prisma) directamente, solo interfaces.

---

## 3. Descripción de Módulos y Arquitectura

### 3.1. Package `core` (Shared Kernel)
*   **Arquitectura:** Domain-Driven Design (DDD).
*   **Descripción:** Contiene las definiciones puras del negocio. Aquí residen las Entidades (`Project`, `Plan`), Value Objects, Interfaces de Repositorios (`IProjectRepository`) y Casos de Uso abstractos. Es agnóstico a la infraestructura.

### 3.2. App `backend` (API Rest)
*   **Arquitectura:** Hexagonal (Ports & Adapters).
*   **Descripción:** Actúa como la interfaz HTTP para el sistema. Implementa los repositorios definidos en `core` usando Prisma. Gestiona la autenticación, recibe peticiones HTTP y delega la ejecución a los Casos de Uso del `core` o encola trabajos pesados en Redis.
*   **Docker:** Contenedor Node.js expuesto en puerto 3000/4000.

### 3.3. App `worker` (Procesador)
*   **Arquitectura:** Event-Driven / Worker Pattern.
*   **Descripción:** Servicio sin interfaz gráfica que escucha la cola de Redis. Su única función es procesar archivos pesados (PDF -> Imágenes), generar miniaturas y subir los resultados al Storage. Reutiliza la lógica de negocio de `core` para actualizar el estado en la base de datos una vez finalizado el trabajo.
*   **Docker:** Contenedor Node.js con dependencias del sistema instaladas (Ghostscript/GraphicsMagick).

### 3.4. App `frontend` (UI)
*   **Arquitectura:** Component-Based (Vue) + Server Side Rendering (SSR/Hybrido).
*   **Descripción:** Interfaz de usuario para arquitectos y clientes. Consume la API para datos y se conecta vía WebSockets para actualizaciones de estado (ej: "Plano procesado").

---

## 4. Estructura Detallada de Archivos

### 4.1. Estructura `apps/backend/`
```bash
apps/backend/
├── src/
│   ├── controllers/        # Handlers HTTP (Express)
│   ├── infrastructure/     # Implementaciones concretas (Prisma, S3, Redis)
│   ├── app.ts              # Configuración de Express
│   └── server.ts           # Entry point
├── Dockerfile
├── package.json
└── tsconfig.json
```

### 4.2. Estructura `apps/frontend/`
```bash
apps/frontend/
├── components/             # Átomos, moléculas, organismos
├── composables/            # Lógica reactiva (Hooks)
├── layouts/                # Plantillas de página
├── pages/                  # Rutas (File-based routing)
├── server/                 # API Routes (si se usa server de Nuxt, generalmente proxy)
├── Dockerfile
├── nuxt.config.ts
└── package.json
```

### 4.3. Estructura `apps/worker/`
```bash
apps/worker/
├── src/
│   ├── processors/         # Lógica de cada tipo de Job
│   ├── infrastructure/     # Wrappers de Sharp/Ghostscript
│   └── index.ts            # Entry point y configuración de Workers
├── Dockerfile              # Debe instalar librerías OS (apt-get install ghostscript)
├── package.json
└── tsconfig.json
```

---

## 5. Especificaciones Docker

Cada aplicación en `apps/` tendrá su propio `Dockerfile`.

**Ejemplo `apps/backend/Dockerfile` & `apps/frontend/Dockerfile`:**
Basados en `node:18-alpine` o `node:20-alpine`. Construcción multi-stage para optimizar tamaño.

**Ejemplo `apps/worker/Dockerfile`:**
Requiere una imagen base que permita instalar binarios de sistema.
```dockerfile
FROM node:20-slim
# Instalación de dependencias para procesamiento de imágenes
RUN apt-get update && apt-get install -y \
    ghostscript \
    graphicsmagick \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
...
```

**`docker-compose.yml` (Raíz):**
Define los servicios de infraestructura y levanta las apps en modo desarrollo.
*   `postgres`: Base de datos.
*   `redis`: Para colas BullMQ y caché.
*   `minio`: Emulador de S3 local.
*   `backend`: Mapeo de puertos, volúmenes para hot-reload.
*   `worker`: Volúmenes para código.
*   `frontend`: Mapeo de puertos (3000), volúmenes.

---

## 6. Variables de Entorno (.env)

Se requiere un archivo `.env` en la raíz (para docker-compose) o `.env` específicos en cada carpeta de app.

### Comunes / Infraestructura
```ini
DATABASE_URL="postgresql://user:password@localhost:5432/trace_db?schema=public"
REDIS_HOST="localhost"
REDIS_PORT=6379
```

### Storage (MinIO / S3)
```ini
S3_ENDPOINT="http://localhost:9000"
S3_ACCESS_KEY="minioadmin"
S3_SECRET_KEY="minioadmin"
S3_BUCKET_NAME="trace-storage"
S3_REGION="us-east-1"
```

### Backend
```ini
PORT=4000
JWT_SECRET="super-secret-key-change-me"
CORS_ORIGIN="http://localhost:3000"
```

### Worker
```ini
CONCURRENCY=5 # Número de trabajos simultáneos
```

### Frontend
```ini
NUXT_PUBLIC_API_BASE="http://localhost:4000/api/v1"
NUXT_PUBLIC_SOCKET_URL="http://localhost:4000"
```
