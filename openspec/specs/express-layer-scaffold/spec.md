# Spec — express-layer-scaffold

**Ticket:** T-04-01 · **User Story:** US-04

## Requirements

### Requirement: Punto de entrada main.ts con PrismaClient

El proceso API SHALL inicializar `PrismaClient`, construir la aplicación Express mediante `createApp(prisma)` y escuchar en el puerto definido por `API_PORT`.

#### Scenario: DoD T-04-01 — main.ts

- **WHEN** se inspecciona `backend/src/main.ts` tras implementar T-04-01
- **THEN** el fichero importa y crea una instancia de `PrismaClient`
- **AND** invoca `createApp(prisma)` pasando el cliente Prisma
- **AND** el servidor escucha en `Number(process.env.API_PORT) || 3001`

#### Scenario: US-04 Scenario 1 — Arranque del servidor

- **WHEN** se ejecuta `npm run api` desde la raíz del monorepo
- **THEN** el servidor Express arranca en el puerto definido en `API_PORT` (default `3001`)
- **AND** el log de consola incluye el texto `Server running on port 3001` (o el puerto configurado)

### Requirement: Factory createApp con middleware base

`backend/src/presentation/http/createApp.ts` SHALL crear una instancia Express, aplicar CORS para el origen configurado y parsear cuerpos JSON.

#### Scenario: DoD T-04-01 — createApp.ts

- **WHEN** se inspecciona `createApp.ts` tras implementar T-04-01
- **THEN** la función exportada `createApp` acepta `PrismaClient` como argumento principal
- **AND** registra middleware CORS con origen `process.env.CORS_ORIGIN` o default `http://localhost:5173`
- **AND** registra `express.json()` para peticiones `application/json`

#### Scenario: US-04 Scenario 3 — CORS y body parser

- **WHEN** el servidor está corriendo
- **THEN** las peticiones desde el origen configurado en `CORS_ORIGIN` reciben headers CORS apropiados
- **AND** el servidor acepta y parsea cuerpos JSON en rutas POST/PUT/PATCH (middleware registrado globalmente)

### Requirement: Endpoint de health check

El servidor SHALL exponer `GET /health` sin autenticación que indique disponibilidad del proceso API.

#### Scenario: DoD T-04-01 — GET /health

- **WHEN** se envía `GET http://localhost:3001/health` con el servidor en ejecución
- **THEN** la respuesta tiene código HTTP `200`
- **AND** el cuerpo JSON contiene `{ "status": "ok", "timestamp": "<ISO-8601>" }`
- **AND** `timestamp` es una cadena ISO-8601 válida (p. ej. generada con `new Date().toISOString()`)

#### Scenario: US-04 Scenario 1 — Health check en arranque

- **WHEN** el servidor arranca correctamente con `npm run api`
- **AND** se ejecuta `curl http://localhost:3001/health`
- **THEN** la respuesta es `200` con `status` igual a `"ok"`

### Requirement: Estructura de directorios Clean Architecture

El backend SHALL organizar el código fuente en las capas domain, application (con ports), infrastructure y presentation (con middleware).

#### Scenario: DoD T-04-01 — Directorios de capas

- **WHEN** se inspecciona `backend/src/` tras implementar T-04-01
- **THEN** existen los directorios `domain/`, `application/`, `application/ports/`, `infrastructure/` y `presentation/http/middleware/`
- **AND** cada directorio es utilizable para código TypeScript del proyecto (no vacío de forma accidental en capas ya pobladas)

#### Scenario: US-04 Scenario 2 — Estructura de capas

- **WHEN** el proyecto backend está scaffoldeado
- **THEN** `backend/src/domain/` contiene entidades e interfaces de dominio
- **AND** `backend/src/application/` contiene casos de uso
- **AND** `backend/src/application/ports/` contiene interfaces puerto
- **AND** `backend/src/infrastructure/` contiene adaptadores (p. ej. repositorios Prisma)
- **AND** `backend/src/presentation/` contiene rutas HTTP y middleware

### Requirement: Script npm run api

El monorepo SHALL exponer un script npm que arranque el servidor backend en modo watch.

#### Scenario: DoD T-04-01 — Script api

- **WHEN** se inspecciona `package.json` raíz
- **THEN** existe el script `"api": "tsx watch backend/src/main.ts"`
- **AND** ejecutar `npm run api` inicia el mismo entrypoint que `npm run dev:api`

### Requirement: Compatibilidad con endpoint de perfil existente

El scaffold SHALL preservar el endpoint `GET /api/profile` ya consumido por el frontend, construyendo repositorios internamente a partir de `PrismaClient`.

#### Scenario: Regresión — GET /api/profile tras refactor

- **WHEN** PostgreSQL está activo, el seed demo está aplicado y el servidor arranca
- **AND** se ejecuta `GET http://localhost:3001/api/profile`
- **THEN** la respuesta es `200` con el usuario demo `{ id: 1, email: "demo@ConRutina.app", name: "Demo User" }`
