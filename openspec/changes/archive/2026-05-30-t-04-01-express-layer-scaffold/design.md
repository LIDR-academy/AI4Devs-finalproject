# Design — T-04-01 · Inicializar servidor Express con estructura de capas

**Ticket:** T-04-01 · **User Story:** US-04 · **Change:** `t-04-01-express-layer-scaffold`

## Context

El repositorio ya contiene un backend parcialmente implementado antes de formalizar T-04-01:

| Elemento | Estado actual | Objetivo (DoD T-04-01) |
|----------|---------------|-------------------------|
| `backend/src/main.ts` | ✅ Arranca API; compone `createApp({ userRepository })` | Recibir `PrismaClient`, llamar `createApp(prisma)`, log US-04 |
| `backend/src/presentation/http/createApp.ts` | ⚠️ CORS + `GET /api/profile`; sin JSON parser ni `/health` | CORS, `express.json()`, `GET /health`, firma `(prisma: PrismaClient)` |
| Capas `domain/`, `application/`, `infrastructure/` | ✅ Parcialmente pobladas (`UserProfile`, `getUserProfile`, repo Prisma) | Mantener y alinear composición |
| `presentation/http/middleware/` | ❌ No existe | Crear directorio (`.gitkeep` hasta T-04-02) |
| `npm run dev:api` | ✅ `tsx watch backend/src/main.ts` | Añadir alias `npm run api` |
| `GET /health` | ❌ No implementado | `200 { status, timestamp }` |
| `docs/api-spec.yml` | Sin `/health` | Documentar endpoint |

Referencias: `docs/backend-standards.md` (estructura Clean Architecture, composición en `main.ts`), `.env.example` (`API_PORT`, `CORS_ORIGIN`), seed T-03-03 (usuario id=1 para regresión de `/api/profile`).

**Dependencias previas:** T-01-01 ✅, T-02-01 ✅, T-03-01/02/03 ✅.

## Goals / Non-Goals

**Goals:**

- Cumplir el DoD de T-04-01 y US-04 escenarios 1–2 (y parte de 3: CORS + JSON).
- Refactorizar la composición para que `createApp` reciba `PrismaClient` según ticket, instanciando repositorios dentro de `createApp` o en un módulo de composición interno.
- Preservar `GET /api/profile` sin romper el frontend/proxy Vite.
- Añadir `npm run api` y documentación mínima.

**Non-goals:**

- `errorHandler` global (T-04-02).
- `config.ts` con Zod (T-04-03).
- Helmet u otros security headers (mencionados en US-04 S3 pero no en DoD T-04-01).
- Nuevos endpoints de negocio.
- Tests unitarios Vitest del scaffold.

## Decisions

### 1. Firma de createApp: PrismaClient como dependencia raíz

**Decisión:** Cambiar la firma pública a:

```typescript
import type { PrismaClient } from '@prisma/client'

export function createApp(prisma: PrismaClient): Express {
  const userRepository = createPrismaUserRepository(prisma)
  // ... middleware + rutas
}
```

**Alternativa descartada:** Mantener `CreateAppDeps { userRepository }` — incumple el DoD explícito `createApp(prisma)` y acopla tests a un mock de repositorio en la capa de presentación.

### 2. Composición en main.ts

**Decisión:** `main.ts` queda como único composition root:

```typescript
import './loadEnv.js'
import { PrismaClient } from '@prisma/client'
import { createApp } from './presentation/http/createApp.js'

const prisma = new PrismaClient()
const app = createApp(prisma)
const port = Number(process.env.API_PORT) || 3001

app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})
```

Conservar manejo de `EADDRINUSE` y log opcional de BD en desarrollo si no contradice el mensaje requerido.

**Alternativa descartada:** Mover listen a otro módulo — innecesario para el alcance del ticket.

### 3. Middleware base en createApp

**Decisión:** Orden de registro:

1. `cors({ origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173', credentials: false })`
2. `express.json()`
3. Rutas (`GET /health`, luego rutas `/api/*`)

**Health handler:**

```typescript
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() })
})
```

**Alternativa descartada:** Montar `/health` bajo `/api/health` — el DoD y US-04 especifican `/health` en raíz; T-05-xx documenta proxy Vite hacia `/health`.

### 4. Directorio middleware/

**Decisión:** Crear `backend/src/presentation/http/middleware/` con `.gitkeep` (o `README.md` mínimo) para satisfacer DoD sin implementar `errorHandler` (T-04-02).

### 5. Script npm run api

**Decisión:** Añadir en `package.json`:

```json
"api": "tsx watch backend/src/main.ts"
```

Mantener `dev:api` idéntico para no romper `npm run dev` (concurrently).

### 6. Preservar GET /api/profile

**Decisión:** Mantener la ruta existente dentro de `createApp`, delegando en `getUserProfileById` y el repositorio Prisma. No mover a fichero de rutas separado en T-04-01 (refactor incremental en tickets posteriores).

Manejo de errores local en la ruta (try/catch → 500) se mantiene hasta T-04-02.

### 7. Verificación manual (sin tests unitarios)

**Decisión:** Validar en apply mediante:

- `npm run api` / `npm run dev:api` — arranque y log
- `curl http://localhost:3001/health` — 200 + timestamp ISO
- `curl http://localhost:3001/api/profile` — regresión con seed
- `npm run typecheck` y `npm run lint`
- Informes en `openspec/changes/t-04-01-express-layer-scaffold/reports/`

## Risks / Trade-offs

| Riesgo | Mitigación |
|--------|------------|
| Cambio de firma `createApp` rompe imports/tests | Buscar referencias; solo `main.ts` compone hoy |
| Log distinto al actual (`API escuchando...`) | Ajustar a `Server running on port N` según US-04 |
| US-04 S3 pide security headers | Documentar como deferido a ticket futuro o T-04-02 |
| Puerto ocupado | Conservar handler `EADDRINUSE` en `main.ts` |
| DoD pide `npm run api` pero docs usan `dev:api` | Documentar ambos en `development_guide.md` |

## Migration Plan

1. Crear directorio `presentation/http/middleware/` con placeholder.
2. Refactorizar `createApp.ts`: firma `(prisma)`, JSON parser, `/health`, rutas existentes.
3. Actualizar `main.ts`: `createApp(prisma)`, log US-04.
4. Añadir script `api` en `package.json`.
5. `npm run typecheck` + `npm run lint`.
6. Smoke: `npm run db:up`, `npm run db:seed`, `npm run api`, curl `/health` y `/api/profile`.
7. Actualizar `docs/development_guide.md` y `docs/api-spec.yml`.
8. Commit al archivar (no durante apply).

**Rollback (dev):** Revertir cambios en `main.ts`, `createApp.ts` y script `api`.

## Open Questions

- _(Ninguna crítica)_ — Los security headers de US-04 S3 quedan explícitamente fuera del DoD T-04-01; si el equipo los requiere antes de T-04-02, abrir sub-tarea o ampliar T-04-02.
