## Índice

0. [Ficha del proyecto](#0-ficha-del-proyecto)
1. [Descripción general del producto](#1-descripción-general-del-producto)
2. [Arquitectura del sistema](#2-arquitectura-del-sistema)
3. [Modelo de datos](#3-modelo-de-datos)
4. [Especificación de la API](#4-especificación-de-la-api)
5. [Historias de usuario](#5-historias-de-usuario)
6. [Tickets de trabajo](#6-tickets-de-trabajo)
7. [Pull requests](#7-pull-requests)
8. [Backend Bootstrap (US-001)](#8-backend-bootstrap-us-001)
9. [Database Models and Migrations (US-002)](#9-database-models-and-migrations-us-002)
10. [Frontend Auth and Dashboard (US-104)](#10-frontend-auth-and-dashboard-us-104)
11. [Frontend File Upload Interface (US-105)](#11-frontend-file-upload-interface-us-105)
12. [Frontend File Retrieval Interface (US-106)](#12-frontend-file-retrieval-interface-us-106)
13. [Frontend Files Management Page (US-107)](#13-frontend-files-management-page-us-107)
14. [Frontend Documentation Pages (US-108)](#14-frontend-documentation-pages-us-108)
15. [Frontend Error Handling and Feedback (US-109)](#15-frontend-error-handling-and-feedback-us-109)
16. [Frontend Testing Suite (US-110)](#16-frontend-testing-suite-us-110)
17. [Docker Configuration (US-201)](#17-docker-configuration-us-201)
18. [Deployment Scripts (US-202)](#18-deployment-scripts-us-202)

---

## 0. Ficha del proyecto

### **0.1. Tu nombre completo:**
Christian Zoror

### **0.2. Nombre del proyecto:**
Interplanetary SaaS Gateway

### **0.3. Descripción breve del proyecto:**
Este proyecto es una plataforma SaaS que permite a los usuarios almacenar, gestionar y compartir archivos de manera descentralizada utilizando la tecnología IPFS (InterPlanetary File System). Ofrece una interfaz intuitiva para cargar, recuperar y administrar archivos, garantizando seguridad, permanencia y accesibilidad global.

### **0.4. URL del proyecto:**

> Puede ser pública o privada, en cuyo caso deberás compartir los accesos de manera segura. Puedes enviarlos a [alvaro@lidr.co](mailto:alvaro@lidr.co) usando algún servicio como [onetimesecret](https://onetimesecret.com/).

### 0.5. URL o archivo comprimido del repositorio

> Puedes tenerlo alojado en público o en privado, en cuyo caso deberás compartir los accesos de manera segura. Puedes enviarlos a [alvaro@lidr.co](mailto:alvaro@lidr.co) usando algún servicio como [onetimesecret](https://onetimesecret.com/). También puedes compartir por correo un archivo zip con el contenido


---

## 1. Descripción general del producto


### **1.1. Objetivo:**

El protocolo ipfs sirve para almacenar y compartir datos de manera descentralizada, lo que mejora la seguridad, la resistencia a la censura y la eficiencia en la distribución de contenido. 
Esto sirve especialmente en aplicaciones donde la disponibilidad y la integridad de los datos son cruciales, como en sistemas de archivos distribuidos, aplicaciones web descentralizadas (dApps), redes de distribución de contenido (CDN) y almacenamiento de datos a largo plazo o como ficheros necesarios para aplicaciones blockchain , smart contracts, NFTs, etc.
El objetivo de este proyecto es crear una plataforma SaaS que facilite a los usuarios el acceso y la gestión de archivos utilizando IPFS, proporcionando una interfaz amigable y funcionalidades avanzadas para maximizar los beneficios de esta tecnología descentralizada.

### **1.2. Características y funcionalidades principales:**

La applicación ofrece las siguientes funcionalidades principales:
- **Registro y autenticación de usuarios**: Permite a los usuarios crear cuentas y autenticarse de manera segura utilizando API keys, gestionar a API keys (renovación, revocación).
- **Carga de archivos**: Los usuarios pueden subir archivos a la plataforma, que serán almacenados en la red IPFS.
- **Recuperación de archivos**: Los usuarios pueden recuperar sus archivos utilizando los hashes generados por IPFS.
- **Gestión de archivos**: Los usuarios pueden ver una lista de sus archivos subidos, con opciones para eliminar, pin o unpin archivos.
- **Panel de control del usuario**: Proporciona una vista general del uso de la cuenta, incluyendo estadísticas de uso, estado de la API key, renovación y acciones rápidas.
- **Documentación de la API**: Incluye documentación detallada de la API para facilitar la integración por parte de desarrolladores externos.

A continuación se presenta una tabla resumen de las funcionalidades principales:

| Feature | Description |
|---------|-------------|
| 🔐 **User Registration** | Register with email and receive a unique API key |
| 📤 **File Upload** | Upload files to IPFS and receive a CID |
| 📥 **File Retrieval** | Download files using their CID |
| 📌 **Content Pinning** | Pin/unpin content to manage availability |
| 🔑 **API Key Management** | Check status, renew, or revoke API keys |
| 📊 **Usage Tracking** | Monitor your API usage and file statistics |
| 🛡️ **Rate Limiting** | Fair usage policies to ensure platform stability |
| 📝 **Audit Logging** | Complete audit trail of all operations |

---

### **1.3. Diseño y experiencia de usuario:**

> Proporciona imágenes y/o videotutorial mostrando la experiencia del usuario desde que aterriza en la aplicación, pasando por todas las funcionalidades principales.

### **1.4. Instrucciones de instalación:**
> Documenta de manera precisa las instrucciones para instalar y poner en marcha el proyecto en local (librerías, backend, frontend, servidor, base de datos, migraciones y semillas de datos, etc.)

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**


```mermaid
flowchart TB
    subgraph Client["Client Layer"]
        WEB[Web Browser]
        API_CLIENT[API Client]
    end

    subgraph Frontend["Frontend - Next.js"]
        NEXTJS[Next.js App]
        PAGES[Pages & Components]
        API_LAYER[API Client Layer]
    end

    subgraph LoadBalancer["Load Balancer"]
        NGINX[Nginx Reverse Proxy]
    end

    subgraph Backend["Backend - Flask"]
        FLASK[Flask Application]
        AUTH[Auth Middleware]
        ROUTES[API Routes]
        SERVICES[Service Layer]
        IPFS_SVC[IPFS Service]
    end

    subgraph TaskQueue["Async Processing"]
        CELERY[Celery Workers]
        REDIS[(Redis)]
    end

    subgraph DataLayer["Data Layer"]
        POSTGRES[(PostgreSQL)]
        ALEMBIC[Alembic Migrations]
    end

    subgraph ExternalServices["External Services"]
        FILEBASE[Filebase IPFS API]
        IPFS_NET((IPFS Network))
    end

    subgraph Monitoring["Monitoring & Logging"]
        PROMETHEUS[Prometheus]
        GRAFANA[Grafana]
        ELK[ELK Stack]
    end

    WEB --> NEXTJS
    API_CLIENT --> NGINX
    NEXTJS --> PAGES
    PAGES --> API_LAYER
    API_LAYER --> NGINX

    NGINX --> FLASK
    FLASK --> AUTH
    AUTH --> ROUTES
    ROUTES --> SERVICES
    SERVICES --> IPFS_SVC

    SERVICES --> POSTGRES
    SERVICES --> CELERY
    CELERY --> REDIS
    CELERY --> IPFS_SVC

    IPFS_SVC --> FILEBASE
    FILEBASE --> IPFS_NET

    FLASK --> PROMETHEUS
    FLASK --> ELK
    PROMETHEUS --> GRAFANA

    ALEMBIC --> POSTGRES

    style FLASK fill:#3776ab,color:#fff
    style NEXTJS fill:#000,color:#fff
    style POSTGRES fill:#336791,color:#fff
    style REDIS fill:#dc382d,color:#fff
    style FILEBASE fill:#00d395,color:#fff
```

## 16. Frontend Testing Suite (US-110)

Se fortalecio la estrategia de pruebas del frontend para cerrar cobertura funcional y calidad de regresion en CI.

### 16.1. Alcance implementado

- Cobertura unificada para pruebas unitarias, de componentes y accesibilidad (Jest).
- E2E de rutas criticas con Playwright (autenticacion, upload, files, retrieve).
- Infraestructura de mocking reutilizable para pruebas aisladas (fixtures/factories + mocks por suite).
- Utilidades compartidas de render para reducir duplicacion en pruebas con providers.
- Pipeline CI dedicado para frontend con type-check, lint, cobertura, build y E2E.

### 16.2. Estructura de testing

```text
tests/frontend/
├── a11y/
│   └── pages.a11y.test.tsx
├── components/
├── fixtures/
│   └── mockData.ts
├── unit/
└── utils/
    └── test-utils.tsx
```

### 16.3. Configuracion y calidad

- `frontend/jest.config.cjs` define `coverageThreshold` global (lines >= 82%, functions/statements >= 70%, branches >= 65%).
- `frontend/jest.setup.ts` centraliza setup compartido para pruebas frontend.
- `frontend/package.json` agrega `test:coverage` para reportes de cobertura.
- `.github/workflows/frontend-tests.yml` ejecuta validaciones frontend en CI (incluyendo Playwright).

### 16.4. Flujo de validacion

```mermaid
flowchart TD
    A[Type Check] --> B[Lint]
    B --> C[Jest Unit + Components + A11y]
    C --> D[Coverage >= 82%]
    D --> E[Build Next.js]
    E --> F[Playwright E2E]
    F --> G[Ready for QA]
```

### 16.5. Comandos principales

```bash
cd frontend
npm run type-check
npm run lint
npm run test:coverage
npm run build
npm run test:e2e
```

## 10. Frontend Auth and Dashboard (US-104)

Se implemento el flujo de autenticacion por API key y dashboard de usuario en `frontend/` con enfoque de seguridad en sesion.

### 10.1. Cambios principales

- Login por API key con formulario validado (`/login`).
- Dashboard protegido (`/dashboard`) con:
    - Account Overview
    - API Key Status + renovacion por challenge/codigo
    - Usage Statistics
    - Recent Files section (con fallback explicito mientras no exista endpoint backend de listado)
    - Quick Actions
- Logout y redireccion de rutas protegidas cuando no hay sesion valida.

### 10.2. Estrategia de sesion segura

- No se almacena API key en `localStorage` ni `sessionStorage`.
- La sesion se guarda en cookie `HttpOnly` via rutas internas Next.js (`/api/auth/session`).
- El frontend no llama endpoints sensibles con API key desde cliente cuando no es necesario; usa proxy server-side.

### 10.3. Rutas API internas (Next.js)

- `POST/GET/DELETE /api/auth/session`
- `POST /api/auth/renew`
- `POST /api/auth/revoke` (retorna bloqueo explicito: backend actual solo soporta revoke admin)
- `GET /api/dashboard/overview`

### 10.4. Arquitectura de flujo

```mermaid
flowchart LR
        U[Browser] --> L[Login Form]
        L --> S[/api/auth/session POST]
        S --> B[/api/v1/users/status backend]
        B --> S
        S --> C[(HttpOnly session cookie)]

        U --> D[Dashboard]
        D --> O[/api/dashboard/overview GET]
        O --> B
        O --> D

        D --> R[/api/auth/renew POST]
        R --> RB[/api/v1/users/renew/challenge + /renew]
        RB --> R
        R --> C
```

### 10.5. Pruebas ejecutadas

- `npm run type-check`
- `npm test` (Jest: unit + integration)
- `npm run build`
- `npm run test:e2e` (Playwright)

## 11. Frontend File Upload Interface (US-105)

Se implemento la interfaz de carga de archivos en `frontend/` con cola de subida, validacion temprana y flujo seguro a traves de proxy server-side.

### 11.1. Cambios principales

- Pagina `/upload` protegida con:
    - zona drag-and-drop y click-to-browse
    - validacion client-side de tipo / tamano / nombre de archivo
    - cola de subida con progreso por archivo
    - cancelacion y retry en errores
    - vista de exito con CID, copy-to-clipboard y enlace IPFS
    - historial de subidas de la sesion actual
- Nuevas rutas internas Next.js:
    - `POST /api/upload`
    - `GET /api/upload/status/[taskId]`
- Estado local de subidas e historial con Zustand.

### 11.2. Seguridad y coherencia backend/frontend

- El navegador nunca envia la API key directamente al backend para subidas.
- La API key se recupera desde la cookie `HttpOnly` en el proxy Next.js.
- El whitelist MIME de frontend y backend se alineo al contrato de US-105:
    - `image/jpeg`, `image/png`, `image/webp`, `image/gif`
    - `application/pdf`, `text/plain`, `application/json`
    - `video/mp4`, `video/webm`

### 11.3. Flujo de subida

```mermaid
flowchart LR
        U[Browser Upload UI] --> D[react-dropzone + client validation]
        D --> Q[Upload queue in Zustand]
        Q --> P[/api/upload POST]
        P --> B[/api/v1/files/upload backend]
        B -->|201| Q
        B -->|202 task_id| S[/api/upload/status/[taskId] GET]
        S --> T[/api/v1/files/upload/status/<task_id> backend]
        T --> Q
        Q --> H[Session upload history + CID actions]
```

### 11.4. Pruebas ejecutadas

- `npm run type-check`
- `npm run lint`
- `npm test`
- `python -m unittest tests/backend/unit/test_file_validators.py`
- `npm run build`
- `npm run test:e2e`

Nota: para ejecutar E2E repetidas veces en local, puede ser necesario limpiar contadores de rate limiting en Redis del entorno de desarrollo.

## 12. Frontend File Retrieval Interface (US-106)

Se implemento la interfaz de recuperacion de archivos en `/retrieve` con validacion estricta de CID mediante libreria dedicada, proxy seguro en Next.js, previsualizacion por tipo de contenido y utilidades de historial.

### 12.1. Cambios principales

- Pagina `/retrieve` protegida con:
    - input CID + validacion por parseo (`multiformats`)
    - boton de recuperacion con estado de carga
    - gestion de errores para CID invalido y CIDs inexistentes/no autorizados
    - panel de metadatos (nombre, tamano, tipo, fecha)
    - previsualizacion para `image/*`, `text/*`/`json`/`xml`, y `application/pdf`
    - boton de descarga del archivo recuperado
    - historial reciente de recuperaciones en `localStorage`
    - generacion y copia de enlace compartible por CID
- Nueva ruta interna Next.js:
    - `GET /api/retrieve/[cid]`

### 12.2. Seguridad y coherencia backend/frontend

- La API key no se expone al cliente para recuperar archivos.
- `/api/retrieve/[cid]` lee la cookie de sesion `HttpOnly` y reenvia la solicitud al backend con `X-API-Key`.
- El proxy valida formato CID antes de llamar backend y devuelve errores consistentes al cliente.

### 12.3. Flujo de recuperacion

```mermaid
flowchart LR
        U[Browser Retrieve UI] --> V[CID parse validation]
        V --> P[/api/retrieve/[cid] GET]
        P --> B[/api/v1/files/retrieve/<cid> backend]
        B -->|200 stream + headers| P
        P --> U
        U --> M[Metadata panel + preview]
        U --> H[Recent retrievals history]
        U --> S[Share-link generation]
```

### 12.4. Pruebas ejecutadas

- `npm run type-check`
- `npm run lint`
- `npm test`
- `npm run build`

## 13. Frontend Files Management Page (US-107)

Se implemento la pagina `/files` para gestionar los archivos subidos por el usuario con listado paginado, vista grid, filtros y acciones de pinning a traves de proxies seguros en Next.js.

### 13.1. Cambios principales

- Pagina `/files` protegida con:
    - vista tabla con columnas Name, CID, Size, Pinned, Uploaded y Actions
    - vista grid con tarjetas, miniaturas placeholder y acciones rapidas
    - busqueda por nombre o CID con debounce
    - filtro por estado de pinning
    - ordenacion por nombre, tamano, fecha y pin status
    - paginacion server-side con total y rango visible
    - seleccion multiple y acciones bulk pin/unpin
    - drawer lateral de detalles con metadatos y acciones contextuales
    - estado vacio para usuarios sin archivos
- Nuevas rutas internas Next.js:
    - `GET /api/files`
    - `POST /api/files/[cid]/pin`
- Nuevo endpoint backend:
    - `GET /api/v1/files`

### 13.2. Seguridad y coherencia backend/frontend

- La lista y las acciones de pin/unpin usan proxy server-side con API key obtenida desde cookie `HttpOnly`.
- El listado backend devuelve solo archivos del usuario autenticado y soporta busqueda, filtro y ordenacion compatibles con la UI.
- Las acciones de pin/unpin mantienen actualizacion optimista en frontend y despues invalidan cache para sincronizar con backend.

### 13.3. Flujo de gestion de archivos

```mermaid
flowchart LR
        U[Browser Files UI] --> Q[React Query state]
        Q --> P[/api/files GET]
        P --> B[/api/v1/files backend]
        B --> P
        P --> Q
        Q --> T[List or grid rendering]
        Q --> D[Details drawer]
        T --> A[/api/files/[cid]/pin POST]
        A --> BP[/api/v1/files/pin or /unpin backend]
        BP --> A
        A --> Q
```

### 13.4. Pruebas ejecutadas

- `npm run type-check`
- `npm test`
- `npm run lint`
- `npm run build`
- `npm run test:e2e`
- `/PROJECTS/python/ipfs-saas-ai4devs/.venv/bin/python -m unittest discover -s tests/backend/unit`

    Request Flow Diagram:

```mermaid
sequenceDiagram
    participant C as Client
    participant N as Nginx
    participant F as Flask API
    participant R as Redis
    participant W as Celery Worker
    participant P as PostgreSQL
    participant FB as Filebase
    participant IPFS as IPFS Network

    C->>N: POST /upload (file + API key)
    N->>F: Forward request
    F->>P: Validate API key
    P-->>F: User authenticated
    
    alt Small file (< 10MB)
        F->>FB: Upload file
        FB->>IPFS: Pin content
        IPFS-->>FB: CID generated
        FB-->>F: Return CID
        F->>P: Save file metadata
        F-->>C: 201 Created + CID
    else Large file (>= 10MB)
        F->>R: Queue upload task
        F-->>C: 202 Accepted + task_id
        R->>W: Process task
        W->>FB: Upload file
        FB->>IPFS: Pin content
        IPFS-->>FB: CID generated
        FB-->>W: Return CID
        W->>P: Save file metadata
        C->>F: GET /tasks/{id}/status
        F-->>C: Task complete + CID
    end
```

---



### **2.2. Descripción de componentes principales:**

#### Prerequisites

- Python 3.11+
- Node.js 20+
- PostgreSQL 15+
- Redis 7+
- Docker & Docker Compose (optional)

#### Quick Start with Docker

```bash
# Clone the repository
git clone https://github.com/your-org/ipfs-gateway.git
cd ipfs-gateway

# Copy environment files
cp .env.example .env

# Start all services
docker-compose up -d

# Run database migrations
docker-compose exec backend flask db upgrade

# Access the application
# Backend API: http://localhost:5000
# Frontend: http://localhost:3000
```

### Manual Setup

#### Backend
```bash
cd backend

# Create virtual environment
uv venv .venv
source .venv/bin/activate

# Install dependencies
uv pip install -e ".[dev]"

# Set environment variables
export APP_SETTINGS_MODULE=config.development
export DATABASE_URL=postgresql+psycopg2://user:pass@localhost:5432/ipfs_gateway

# Run migrations
flask db upgrade

# Start the server
flask run --port 5000
```

#### Frontend
```bash
cd frontend

# Install dependencies
npm install

# Set environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

---

Technology Stack

| Layer | Technology |
|-------|------------|
| **Backend** | Python 3.11+, Flask 3.x |
| **Frontend** | Next.js 14+, TypeScript, Tailwind CSS |
| **Database** | PostgreSQL 15+ |
| **ORM** | SQLModel (SQLAlchemy + Pydantic) |
| **Migrations** | Alembic |
| **Task Queue** | Celery 5.x |
| **Message Broker** | Redis 7.x |
| **IPFS Provider** | Filebase (S3-compatible API) |
| **Web Server** | Gunicorn + Nginx |
| **Containerization** | Docker, Docker Compose |
| **CI/CD** | GitHub Actions |
| **Monitoring** | Prometheus, Grafana, ELK Stack |

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

El proyecto sigue una arquitectura en capas con separación entre `backend/` (API Flask) y `frontend/` (Next.js App Router).

Para US-101 se estableció la base de frontend con estructura modular por dominio:

```text
frontend/
├── src/
│   ├── app/                    # Páginas, layout global y boundaries loading/error
│   │   ├── (auth)/             # Login, register, dashboard
│   │   ├── upload/
│   │   ├── retrieve/
│   │   ├── files/
│   │   └── docs/
│   ├── components/
│   │   ├── ui/                 # Button, Input, Card, Spinner, Skeleton
│   │   ├── layout/             # Header, Footer, Container
│   │   └── providers/          # React Query + toaster global
│   ├── hooks/                  # Hooks de auth/files/toast
│   ├── lib/                    # API client, constantes y utilidades
│   ├── stores/                 # Zustand store
│   └── types/                  # Tipos compartidos
├── tests/e2e/                  # Playwright
├── jest.config.cjs
├── playwright.config.ts
└── package.json
```

Con US-102, esta base se extendio con una landing page orientada a visitantes, navegacion responsive con menu hamburguesa, metadatos SEO por pagina y footer con accesos rapidos a rutas clave.

Con US-103, se incorporo el flujo de registro de usuarios en `src/app/(auth)/register/page.tsx`, incluyendo validacion con React Hook Form + Zod, indicador de fortaleza de password, modal de exito con API key de una sola visualizacion (copiar/descargar) y redireccion a dashboard sin persistir la key en `localStorage`/`sessionStorage`.

```mermaid
flowchart TD
    A[App Router Pages] --> B[Layout + Providers]
    B --> C[Reusable Components]
    B --> D[Hooks + Zustand]
    D --> E[Typed API Client]
    E --> F[Backend API]
```

### **2.4. Infraestructura y despliegue**

> Detalla la infraestructura del proyecto, incluyendo un diagrama en el formato que creas conveniente, y explica el proceso de despliegue que se sigue

## 17. Docker Configuration (US-201)

Se implemento la base de containerizacion para backend, frontend, worker y reverse proxy en `deployment/`, siguiendo reglas de seguridad y estandarizacion para entornos dev/prod.

### 17.1. Artefactos creados

- `deployment/docker/backend/Dockerfile` (multi-stage, Python 3.11-slim, non-root, healthcheck)
- `deployment/docker/frontend/Dockerfile` (multi-stage, Node 20-alpine, Next.js standalone, non-root)
- `deployment/docker/celery/Dockerfile` (multi-stage, worker dedicado, non-root)
- `deployment/docker/nginx/Dockerfile` y `deployment/docker/nginx/nginx.conf`
- `deployment/docker-compose.yml` (entrypoint local por defecto)
- `deployment/docker-compose.dev.yml` (desarrollo con montajes de codigo)
- `deployment/docker-compose.prod.yml` (produccion con healthchecks y limites CPU/RAM)
- `deployment/.env.example` y `deployment/README.md`
- scripts operativos: `deployment/scripts/dev-up.sh`, `deployment/scripts/dev-down.sh`, `deployment/scripts/prod-up.sh`, `deployment/scripts/prod-down.sh`

### 17.2. Salud y seguridad en contenedores

- Ejecucion como usuario no-root en backend/frontend/celery.
- Multi-stage builds para reducir tamano y superficie de ataque.
- Health checks declarados en Dockerfiles y compose prod.
- Variables sensibles externalizadas en `.env` (con plantilla versionada en `.env.example`).
- Volumenes persistentes para PostgreSQL, Redis y logs backend en produccion.
- Logging driver configurado en compose prod (`json-file` con rotacion de logs).

### 17.3. Validacion realizada

- Validacion de sintaxis compose:
    - `docker compose -f deployment/docker-compose.dev.yml config --quiet`
    - `docker compose -f deployment/docker-compose.prod.yml config --quiet`
- Bloqueador detectado en este entorno al descargar capas base desde Docker Hub (`context deadline exceeded`), por lo que la prueba de arranque end-to-end queda pendiente hasta estabilizar conectividad de pull.

### 17.4. Flujo de despliegue local

```bash
cp deployment/.env.example deployment/.env
docker compose -f deployment/docker-compose.dev.yml up --build
```

Para produccion-like:

```bash
cp deployment/.env.example deployment/.env
docker compose -f deployment/docker-compose.prod.yml up --build -d
```

## 18. Deployment Scripts (US-202)

Se implemento una CLI de despliegue multiplataforma para operaciones Docker en `deployment/scripts/`:

- `deploy.sh` para Linux/macOS.
- `deploy.ps1` para Windows PowerShell.

Tambien se agregaron scripts operativos para el flujo de release a VPS:

- `deployment/scripts/prod-pull.sh`: construye y publica imagenes de produccion en registry privado.
- `deployment/scripts/upload-to-vps.sh`: wrapper para centralizar el comando en `deployment/scripts/`.
- `upload-deployment-to-vps.sh` (raiz del proyecto): sube el directorio `deployment/` completo al VPS en `/root/DELIVERIES/ai4devs/`.

### 18.1. Capacidades incluidas

- Menu interactivo con opciones numeradas.
- Seleccion de entorno (`development`, `staging`, `production`).
- Listado de imagenes, build con tag, retag y push a registry.
- Despliegue por `docker compose`, logs por stack/servicio y control stop/restart.
- Modo `dry-run`, validacion de dependencias y logging en `deployment/logs/`.

### 18.2. Uso rapido

```bash
./deployment/scripts/deploy.sh
./deployment/scripts/deploy.sh --dry-run --env development --registry ghcr.io/your-org
```

Flujo de release recomendado (build -> push -> upload -> pull en VPS):

```bash
# Local: construir y publicar imagenes
./deployment/scripts/prod-pull.sh

# Local: sincronizar directorio deployment/ al VPS
./upload-deployment-to-vps.sh
# o
./deployment/scripts/upload-to-vps.sh

# VPS: arrancar con pull desde registry privado
cd /root/DELIVERIES/ai4devs/deployment
./scripts/prod-up.sh
```

```powershell
.\deployment\scripts\deploy.ps1
.\deployment\scripts\deploy.ps1 -DryRun -Env development -Registry ghcr.io/your-org
```

### 18.3. Validacion en este entorno

- `bash -n deployment/scripts/deploy.sh` completado sin errores.
- Parse de `deploy.ps1` pendiente de validacion local en Windows (no hay `pwsh` instalado en este entorno Linux).
- `docker compose -f deployment/docker-compose.dev.yml config -q` valido.
- Intento de `docker compose ... up -d --build` iniciado; la descarga de metadata/base images desde Docker Hub no completo dentro de la ventana de ejecucion de la sesion, por lo que el smoke test de arranque total queda como pendiente operativo del entorno.

### **2.5. Seguridad**

> Enumera y describe las prácticas de seguridad principales que se han implementado en el proyecto, añadiendo ejemplos si procede

### **2.6. Tests**

El backend cuenta con una suite de pruebas organizada en:

- `tests/backend/unit/`: pruebas unitarias e integraciones aisladas con `unittest`.
- `tests/backend/e2e/`: pruebas end-to-end contra servicios reales (Filebase + Redis) usando variables de entorno.
- `tests/backend/factories/`: factorias de datos de prueba (`factory-boy`).
- `tests/backend/cassettes/`: grabaciones HTTP de VCR para reproducibilidad.

El frontend cuenta con una suite de pruebas organizada en:

- `tests/frontend/unit/`: pruebas unitarias de utilidades.
- `tests/frontend/components/`: pruebas de componentes base.
- `frontend/tests/e2e/`: pruebas E2E con Playwright.

Comandos principales (ejecutar desde la **raíz del proyecto**):

```bash
# Pruebas unitarias
python -m unittest discover -s tests/backend/unit -p "test_*.py" -v

# Pruebas E2E contra servicios reales (requiere backend/.env y RUN_E2E_TESTS=1)
# Asegúrate de que FILEBASE_ACCESS_KEY, FILEBASE_SECRET_KEY, FILEBASE_BUCKET y REDIS_URL estén en backend/.env
RUN_E2E_TESTS=1 python -m unittest discover -s tests/backend/e2e -p "test_*.py" -v

# Cobertura (objetivo mínimo 80%)
coverage run -m unittest discover -s tests/backend/unit -p "test_*.py"
coverage report

# Frontend
npm run lint
npm run type-check
npm run test
npm run build
npm run test:e2e
```

La ejecución automática en CI/CD está definida en `.github/workflows/backend-tests.yml`.

---

## 14. Frontend Documentation Pages (US-108)

Se implementó la sección `/docs` completa con navegación lateral, búsqueda en tiempo real, tabla de contenidos automática y páginas de contenido en TSX puro (sin MDX).

### 14.1. Cambios principales

- Nuevas rutas de documentación:
    - `/docs` — Página de inicio con tarjetas de sección y Quick Start
    - `/docs/getting-started` — Guía de inicio rápido, registro, primera carga y gestión de API key
    - `/docs/authentication` — Uso del header `X-API-Key`, endpoints públicos, buenas prácticas de seguridad
    - `/docs/api-reference` — Referencia completa de todos los endpoints REST (Users, Files, Tasks) con ejemplos de request/response y tabla de códigos de error
    - `/docs/code-examples` — Ejemplos listos para usar en cURL, Python y JavaScript con selector de lenguaje
    - `/docs/faq` — Preguntas frecuentes sobre IPFS, CIDs, rate limits y gestión de claves
- Nuevos componentes compartidos:
    - `CodeBlock` — Bloque de código con resaltado de lenguaje y botón de copia al portapapeles
    - `DocsSearch` — Búsqueda con debounce 150ms, navegación por teclado (↑↓ Enter Escape) y resaltado de coincidencias
    - `DocsSidebar` — Navegación jerárquica con enlace activo resaltado, submenús expandibles y drawer en mobile
    - `TableOfContents` — TOC auto-generado con IntersectionObserver para rastrear la sección activa
    - `Callout` — Caja de aviso de tipo `info`, `warning` o `tip`
- Nuevo índice de búsqueda estático: `src/lib/docs-search-index.ts` (28 entradas, 6 secciones)
- Layout de tres columnas: sidebar fijo + contenido + TOC lateral

### 14.2. Arquitectura de documentación

```mermaid
graph TD
    L[docs/layout.tsx<br/>DocsSearch + DocsSidebar + TOC] --> H[docs/page.tsx<br/>Home - tarjetas de sección]
    L --> GS[docs/getting-started/page.tsx]
    L --> AU[docs/authentication/page.tsx]
    L --> AR[docs/api-reference/page.tsx]
    L --> CE[docs/code-examples/page.tsx]
    L --> FA[docs/faq/page.tsx]
    DS[DocsSearch] --> SI[docs-search-index.ts<br/>28 entradas]
    GS --> CB[CodeBlock]
    GS --> CA[Callout]
    AR --> CB
    CE --> CB
    AU --> CB
    AU --> CA
    FA --> CA
```

### 14.3. Decisiones de implementación

- **Sin MDX**: Las páginas se implementaron como componentes TSX puros para evitar cambios en la configuración de Next.js y dependencias adicionales.
- **Sin librería de búsqueda externa**: Filtrado simple con `String.includes` sobre un índice estático. Sin dependencias de `fuse.js` ni equivalentes.
- **Componentes cliente mínimos**: Solo los componentes interactivos (`DocsSearch`, `DocsSidebar`, `CodeBlock`, `TableOfContents`, `CodeExamplesPage`) llevan `"use client"`. El layout y las páginas de contenido son server components.

### 14.4. Pruebas ejecutadas

```
npm run type-check
npm test
npm run lint
```

Tests de integración en `tests/frontend/components/docs-page.integration.test.tsx` — 29 tests — todos pasan.

---

## 15. Frontend Error Handling and Feedback (US-109)

Se implementó una capa transversal de feedback y manejo de errores en `frontend/` para ofrecer mensajes claros, recuperación guiada y estados de carga/vacío consistentes en toda la aplicación.

### 15.1. Cambios principales

- Sistema de notificaciones unificado:
    - Nuevo helper `src/lib/toast.ts` con variantes `success`, `error`, `warning`, `info`.
    - Integración en `login`, `register`, dashboard y flujos de páginas de archivos.
    - Configuración global del `Toaster` en `app-providers`.
- Páginas y estados de error personalizados:
    - `src/app/not-found.tsx` para 404.
    - `src/app/forbidden/page.tsx` para 403.
    - Mejora de `src/app/error.tsx` para fallback 500 con reintento.
    - `src/components/providers/offline-banner.tsx` para estado offline.
- Estados de carga y vacío:
    - `src/app/files/loading.tsx` y `src/app/retrieve/loading.tsx`.
    - Nuevo componente `src/components/ui/empty-state.tsx`.
- Confirmaciones de acciones destructivas:
    - Nuevo `src/components/ui/confirm-dialog.tsx`.
    - Reemplazo de confirmaciones nativas por modal en operaciones de borrado.
- Manejo avanzado de errores de red y límites:
    - Nuevo `src/components/ui/rate-limit-countdown.tsx`.
    - Mensajes con countdown para `429` usando `Retry-After`.
    - Aviso de expiración de sesión desde `src/hooks/use-auth.ts`.

### 15.2. Flujo de feedback

```mermaid
flowchart TD
    A[User Action] --> B{Request Result}
    B -->|Success| C[Show Success Toast]
    B -->|Validation Error| D[Inline Form Errors]
    B -->|403| E[Forbidden Page]
    B -->|404| F[Not Found Page]
    B -->|429| G[Warning Toast + Retry Countdown]
    B -->|Network Offline| H[Offline Banner + Retry CTA]
    B -->|Unexpected Runtime| I[App Error Boundary Fallback]
```

### 15.3. Pruebas ejecutadas

```bash
npm run type-check
npm run lint
npm test -- --runInBand
npm run build
```

Resultados:
- `67/67` tests de Jest pasando.
- Build de producción de Next.js completado correctamente.
- Lint sin errores (2 warnings conocidos por `no-img-element` en previews).

---

## 3. Modelo de Datos

### **3.1. Diagrama del modelo de datos:**


```mermaid
erDiagram
    USER {
        int id PK "Primary Key"
        string email UK "Unique, Not Null"
        string password_hash "Not Null"
        string api_key UK "Unique, Not Null"
        boolean is_active "Default: true"
        boolean is_admin "Default: false"
        boolean is_deleted "Default: false"
        int usage_count "Default: 0"
        datetime created_at "Auto-generated"
        datetime updated_at "Auto-updated"
        datetime last_renewed_at "Nullable"
    }

    FILE {
        int id PK "Primary Key"
        string cid UK "IPFS Content ID"
        int user_id FK "Foreign Key"
        string original_filename "Not Null"
        string safe_filename "Not Null"
        int size "Bytes"
        boolean pinned "Default: true"
        datetime uploaded_at "Auto-generated"
    }

    AUDIT_LOG {
        int id PK "Primary Key"
        int user_id FK "Foreign Key"
        string action "Not Null"
        datetime timestamp "Auto-generated"
        text details "JSON metadata"
    }

    USER ||--o{ FILE : "uploads"
    USER ||--o{ AUDIT_LOG : "generates"
```



### **3.2. Descripción de entidades principales:**

> Recuerda incluir el máximo detalle de cada entidad, como el nombre y tipo de cada atributo, descripción breve si procede, claves primarias y foráneas, relaciones y tipo de relación, restricciones (unique, not null…), etc.

---

## 4. Especificación de la API


### Base URL
```
Production: https://api.ipfs-gateway.com
Development: http://localhost:5000
```

All examples below are shown as absolute paths. In the current backend implementation, endpoints are mounted under `/api/v1/users`.

### Authentication
All API requests (except registration) require an API key in the header:
```
X-API-Key: ipfs_gw_your_api_key_here
```

### Swagger / OpenAPI Documentation
Interactive API documentation is available directly from the backend:
```
Swagger UI:  http://localhost:5000/swagger
OpenAPI JSON: http://localhost:5000/swagger.json
```

The generated specification includes:
- API versioning under `/api/v1`
- API key security (`X-API-Key` header)
- Request and response schemas
- Error envelope schemas (`status`, `message`, `code`, `details`, `request_id`)
- Endpoint examples for interactive testing

### Endpoints

#### User Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/users/register` | Register new user |
| `GET` | `/api/v1/users/status` | Health-style user route check |
| `POST` | `/api/v1/users/status` | Get API key status (`active`, `inactive`, `revoked`) |
| `POST` | `/api/v1/users/renew/challenge` | Start API key renewal step-up challenge |
| `POST` | `/api/v1/users/renew` | Renew API key with verification code |
| `POST` | `/api/v1/users/revoke` | Revoke API key (admin) |
| `POST` | `/api/v1/users/reactivate` | Reactivate API key (admin) |

#### File Operations

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/files/upload` | Upload file to IPFS |
| `GET` | `/api/v1/files/upload/status/<task_id>` | Check file-upload async task status |
| `GET` | `/api/v1/files` | List authenticated user's files with pagination and filters |
| `GET` | `/api/v1/files/retrieve/<cid>` | Retrieve file by CID |

#### Content Pinning

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/files/pin/<cid>` | Pin content |
| `POST` | `/api/v1/files/unpin/<cid>` | Unpin content |

#### Task Operations

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/tasks/<task_id>/status` | Check async task status |
| `GET` | `/api/v1/tasks/failed` | List failed tasks |
| `POST` | `/api/v1/tasks/failed/<failure_id>/replay` | Replay failed task |

### Request/Response Examples

#### Register User
```bash
curl -X POST https://api.ipfs-gateway.com/api/v1/users/register \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "SecurePass123!"}'
```

**Response (201 Created):**
```json
{
  "status": 201,
  "message": "Registration successful",
  "data": {
    "email": "user@example.com",
    "api_key": "ipfs_gw_a1b2c3d4e5f6..."
  }
}
```

Registration endpoint constraints:
- Email format validation and normalization are enforced.
- Password validation rules are enforced before hashing.
- Duplicate email returns `422 Unprocessable Entity`.
- Rate limiting is set to `5` requests per hour per IP.

#### API Key Status
```bash
curl -X POST http://localhost:5000/api/v1/users/status \
    -H "X-API-Key: ipfs_gw_your_api_key_here"
```

#### API Key Renewal (Step-Up)
Step 1: request verification challenge
```bash
curl -X POST http://localhost:5000/api/v1/users/renew/challenge \
    -H "X-API-Key: ipfs_gw_your_api_key_here"
```

Step 2: renew key with verification code
```bash
curl -X POST http://localhost:5000/api/v1/users/renew \
    -H "Content-Type: application/json" \
    -H "X-API-Key: ipfs_gw_your_api_key_here" \
    -d '{"verification_code": "123456"}'
```

#### Admin Revoke / Reactivate
```bash
curl -X POST http://localhost:5000/api/v1/users/revoke \
    -H "Content-Type: application/json" \
    -H "X-API-Key: ipfs_gw_admin_api_key_here" \
    -d '{"user_email": "user@example.com"}'

curl -X POST http://localhost:5000/api/v1/users/reactivate \
    -H "Content-Type: application/json" \
    -H "X-API-Key: ipfs_gw_admin_api_key_here" \
    -d '{"user_email": "user@example.com"}'
```

#### Upload File
```bash
curl -X POST https://api.ipfs-gateway.com/upload \
  -H "X-API-Key: ipfs_gw_your_api_key" \
  -F "file=@document.pdf"
```

**Response (201 Created):**
```json
{
  "status": 201,
  "message": "File uploaded successfully",
  "data": {
    "cid": "QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco",
    "original_filename": "document.pdf",
    "size": 1048576,
    "pinned": true,
    "uploaded_at": "2026-01-29T10:30:00Z"
  }
}
```

#### Retrieve File
```bash
curl -X GET https://api.ipfs-gateway.com/retrieve/QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco \
  -H "X-API-Key: ipfs_gw_your_api_key" \
  -o downloaded_file.pdf
```

### Error Responses

| Status Code | Description |
|-------------|-------------|
| `400` | Bad Request - Invalid input |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Insufficient permissions |
| `404` | Not Found - Resource doesn't exist |
| `413` | Payload Too Large - File exceeds limit |
| `422` | Validation Error - Input validation failed |
| `429` | Too Many Requests - Rate limit exceeded |
| `500` | Internal Server Error |
| `503` | Service Unavailable - IPFS service down |

### Standard Response Contract (US-011)

From US-011 onward, API responses use a consistent JSON envelope.

Success responses:
```json
{
    "status": 200,
    "message": "Operation successful",
    "data": {
        "key": "value"
    },
    "request_id": "optional-request-id"
}
```

Error responses:
```json
{
    "status": 422,
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
        {
            "field": "email",
            "message": "Invalid email format"
        }
    ],
    "request_id": "optional-request-id"
}
```

Notes:
- `request_id` is included when available and can be propagated via `X-Request-ID`.
- Internal server errors are sanitized for clients and fully logged server-side.
- `GET /api/v1/users/status` remains a lightweight compatibility health-style route.



---

## 5. Historias de Usuario

The following are the three most critical user stories that form the foundation of the IPFS Gateway. These must be completed first as they enable all other functionality.

### 🔴 US-001: Backend Project Setup and Configuration

| Attribute | Value |
|-----------|-------|
| **Priority** | 🔴 Critical |
| **Difficulty** | ⭐⭐ Medium |
| **Estimated Effort** | 8 hours |
| **Tasks** | 6 tasks |
| **Dependencies** | None |

**Purpose:**  
Establish the foundational backend project structure following the IAM-gateway reference pattern. This includes setting up the Flask application factory, configuring dependencies with `uv` package manager, implementing logging, and creating environment-specific configurations.

**Why Critical:**  
All other backend features depend on this foundation. Without proper project structure, configuration management, and logging, subsequent development would be chaotic and unmaintainable.

**Acceptance Criteria:**
- Project directory structure follows IAM-gateway pattern
- Flask application factory is implemented
- All dependencies are pinned in `pyproject.toml`
- Logging is configured with file and console handlers
- Environment configurations for dev/staging/production exist
- Pre-commit hooks are configured

---


### 🔴 US-005: File Upload to IPFS

| Attribute | Value |
|-----------|-------|
| **Priority** | 🔴 Critical |
| **Difficulty** | ⭐⭐⭐⭐ High |
| **Estimated Effort** | 12 hours |
| **Tasks** | 6 tasks |
| **Dependencies** | US-001, US-002, US-004, US-007 |

**Purpose:**  
Implement the core file upload functionality that allows users to upload files to the IPFS network through the Filebase S3-compatible API. This includes synchronous uploads for small files and asynchronous processing via Celery for large files.

**Why Critical:**  
File upload is the primary value proposition of the IPFS Gateway. Without this functionality, the platform has no core purpose. The implementation includes critical patterns like circuit breakers and retry logic that ensure reliability.

**Acceptance Criteria:**
- `POST /upload` endpoint accepts multipart file uploads
- Files are uploaded to Filebase and pinned on IPFS
- CID is returned and stored in database
- Large files (>10MB) are processed asynchronously
- Circuit breaker prevents cascade failures
- Retry logic handles transient errors
- File size limits are enforced (100MB max)

---

### 🔴 US-101: Frontend Project Setup

| Attribute | Value |
|-----------|-------|
| **Priority** | 🔴 Critical |
| **Difficulty** | ⭐⭐ Medium |
| **Estimated Effort** | 6 hours |
| **Tasks** | 5 tasks |
| **Dependencies** | None |

**Purpose:**  
Initialize the Next.js 14+ frontend project with TypeScript, Tailwind CSS, and all necessary tooling. Create the API client layer for backend communication and establish the component library foundation.

**Why Critical:**  
The frontend provides the user interface for all platform interactions. Proper setup with TypeScript ensures type safety, and the API client layer provides consistent backend communication across all components.

**Acceptance Criteria:**
- Next.js 14+ project with App Router is initialized
- TypeScript strict mode is configured
- Tailwind CSS is set up with custom theme
- API client with Axios and React Query is created
- Base component library structure exists
- ESLint and Prettier are configured
- Environment variables are properly managed

---

## 6. Tickets de Trabajo

### Tasks for US-001: Backend Project Setup

| Task ID | Title | Effort | Description |
|---------|-------|--------|-------------|
| TASK-US-001-01 | Create Directory Structure | 1h | Set up the complete backend directory structure following IAM-gateway pattern with core/, config/, server/, tests/, and migrations/ directories |
| TASK-US-001-02 | Configure Dependencies | 1h | Create `pyproject.toml` with all pinned dependencies, set up uv environment, generate `requirements.txt` |
| TASK-US-001-03 | Implement Flask Factory | 2h | Create Flask application factory in `core/__init__.py` with extension initialization, blueprint registration, and error handlers |
| TASK-US-001-04 | Setup Logging | 1h | Configure Python logging with file and console handlers, log rotation, and environment-specific log levels |
| TASK-US-001-05 | Create Config Files | 2h | Create configuration files for development, staging, production, and testing environments |
| TASK-US-001-06 | Setup Pre-commit | 1h | Configure `.pre-commit-config.yaml` with black, isort, flake8, mypy, and bandit hooks |

### Tasks for US-005: File Upload to IPFS

| Task ID | Title | Effort | Description |
|---------|-------|--------|-------------|
| TASK-US-005-01 | Create Upload Endpoint | 2h | Implement `POST /upload` route with file validation, authentication, and response formatting |
| TASK-US-005-02 | Implement Filebase Service | 4h | Create IPFS service layer with boto3 for S3-compatible Filebase API, including upload, retrieve, and pin operations |
| TASK-US-005-03 | Implement Circuit Breaker | 1h | Configure pybreaker circuit breaker for Filebase API calls with fail_max=5, reset_timeout=60 |
| TASK-US-005-04 | Implement Retry Logic | 1h | Configure tenacity retry decorator with exponential backoff for transient errors |
| TASK-US-005-05 | Create Async Upload Task | 2h | Implement Celery task for processing large file uploads with progress tracking |
| TASK-US-005-06 | Implement File Validation | 2h | Create file validation utilities for size limits, filename sanitization, and MIME type detection |

### Tasks for US-101: Frontend Project Setup

| Task ID | Title | Effort | Description |
|---------|-------|--------|-------------|
| TASK-US-101-01 | Initialize Next.js Project | 2h | Create Next.js 14+ project with TypeScript, Tailwind CSS, App Router, and install all dependencies |
| TASK-US-101-02 | Configure TypeScript | 0.5h | Set up TypeScript strict mode, path aliases, and proper tsconfig.json |
| TASK-US-101-03 | Setup Tailwind CSS | 0.5h | Configure Tailwind with custom theme colors, extend configuration for project needs |
| TASK-US-101-04 | Create API Client | 2h | Implement Axios client with interceptors, React Query setup, and typed API functions for all endpoints |
| TASK-US-101-05 | Setup Base Components | 1h | Create foundational UI components (Button, Input, Card) and layout components (Header, Footer) |

---

## 7. Pull Requests

> Documenta 3 de las Pull Requests realizadas durante la ejecución del proyecto

**Pull Request 1**

**Pull Request 2**

**Pull Request 3**

---

## 8. Backend Bootstrap (US-001)

La base del backend ya esta creada en `backend/` usando Flask application factory.

### 8.1. Estructura base

- `backend/core/`: modulos de dominio (`users`, `files`, `auth`, `common`)
- `backend/config/`: configuraciones por entorno (`development`, `staging`, `production`, `testing`)
- `backend/server/config/logs.py`: configuracion centralizada de logs
- `backend/application.py`: entrypoint para ejecucion local
- `tests/backend/`: pruebas unitarias con `unittest`

### 8.2. Setup local backend

```bash
cd backend
uv venv .venv
source .venv/bin/activate
uv pip install -e ".[dev]"
cp .env.example .env
python application.py
```

### 8.3. Ejecutar pruebas

```bash
cd ..
python -m unittest discover -s tests/backend -p "test_*.py" -v
```

### 8.4. Flujo de inicio del backend

```mermaid
flowchart LR
    A[Cargar .env] --> B[Resolver clase de configuracion]
    B --> C[Validar variables requeridas]
    C --> D[Configurar logging]
    D --> E[Inicializar extensiones]
    E --> F[Registrar blueprints y handlers]
    F --> G[Aplicacion lista]
```

## 9. Database Models and Migrations (US-002)

Se implementaron los modelos SQLModel base con llaves primarias enteras autoincrementales y relaciones:

- `backend/core/users/models.py`: entidad `User`
- `backend/core/files/models.py`: entidad `File`
- `backend/core/common/models.py`: entidad `AuditLog`

### 9.1. Migraciones Alembic

- Entorno de migraciones: `backend/migrations/env.py`
- Revision inicial: `backend/migrations/versions/0001_initial_models.py`

Comandos recomendados:

```bash
cd backend
alembic upgrade head
alembic downgrade base
```

### 9.2. Validacion de migraciones por entorno (SQLite)

Se valido el ciclo de migraciones para escenarios local/staging/production usando archivos SQLite separados:

- Local (destroy/recreate): `downgrade base` + `upgrade head`
- Staging (update mode): `upgrade head` sobre base existente
- Production (update mode): `upgrade head` sobre base existente

### 9.3. Diagrama ERD actualizado

```mermaid
erDiagram
    USER ||--o{ FILE : uploads
    USER ||--o{ AUDIT_LOG : generates

    USER {
        int id PK
        string email UK
        string password_hash
        string api_key UK
        bool is_active
        bool is_admin
        bool is_deleted
        int usage_count
        datetime created_at
        datetime updated_at
        datetime last_renewed_at
    }

    FILE {
        int id PK
        string cid UK
        int user_id FK
        string original_filename
        string safe_filename
        int size
        bool pinned
        datetime uploaded_at
    }

    AUDIT_LOG {
        int id PK
        int user_id FK
        string action
        datetime timestamp
        text details
    }
```

