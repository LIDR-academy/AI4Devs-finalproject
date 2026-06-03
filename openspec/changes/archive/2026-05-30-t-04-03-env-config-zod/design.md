# Design — T-04-03 · Validación de variables de entorno con Zod

**Ticket:** T-04-03 · **User Story:** US-04 · **Change:** `t-04-03-env-config-zod`

## Context

- **Completado (T-04-01, T-04-02):** Express con capas, `/health`, `/api/profile`, `errorHandler`, `loadEnv.ts` carga `.env` desde la raíz del monorepo.
- **Estado actual:** `main.ts` importa `./loadEnv.js` primero, luego instancia Prisma y lee `process.env.API_PORT` con fallback `3001`; `createApp.ts` lee `CORS_ORIGIN` con fallback inline; no hay validación de `DATABASE_URL` antes de arrancar.
- **Plantilla:** `.env.example` (T-01-04) documenta `DATABASE_URL`, `API_PORT`, `CORS_ORIGIN`, `NODE_ENV` y variables Docker.
- **Stack:** Node ESM, Vitest para tests, sin `zod` instalado aún en `package.json`.

## Goals / Non-Goals

**Goals:**

- Cumplir DoD T-04-03: schema Zod, mensaje exacto si falta `DATABASE_URL`, import de config en `main.ts` antes del resto del bootstrap.
- Exportar objeto `config` tipado (`databaseUrl`, `apiPort`, `corsOrigin`, `nodeEnv`) para uso en `main.ts` y `createApp.ts`.
- Tests Vitest aislados con manipulación controlada de `process.env` (sin levantar servidor en tests de config).
- Regresión: con `.env` válido, `npm run api` y `GET /health` siguen funcionando.

**Non-Goals:**

- Validar `POSTGRES_*` en el proceso API (solo las cuatro variables del DoD).
- Sustituir `loadEnv.ts` — sigue siendo responsable de cargar el fichero `.env`.
- `validateBody` middleware (ticket posterior).
- Configuración por entorno distinto a las cuatro variables listadas.

## Decisions

### 1. Orden de bootstrap en `main.ts`

**Decisión:**

```typescript
import './loadEnv.js'   // 1. Cargar .env desde disco
import { config } from './config.js'  // 2. Validar y parsear (side effect: exit si inválido)
// 3. Resto: Prisma, createApp, listen
```

**Alternativa descartada:** Fusionar dotenv dentro de `config.ts` — separación clara: `loadEnv` = I/O de fichero; `config` = validación y tipado.

### 2. Schema Zod y defaults

**Decisión:** Un schema en `config.ts`:

| Variable | Regla Zod | Default |
|----------|-----------|---------|
| `DATABASE_URL` | `z.string().min(1)` | _(obligatoria, sin default)_ |
| `API_PORT` | `z.coerce.number().int().positive()` | `"3001"` vía `.default("3001")` en string antes de coerce, o preprocess |
| `CORS_ORIGIN` | `z.string().url()` o `z.string().min(1)` | `"http://localhost:5173"` |
| `NODE_ENV` | `z.enum(['development', 'production', 'test'])` | `"development"` |

Para `API_PORT`, aceptar string en env y convertir a number (coherente con `.env` y DoD que menciona default `"3001"`).

**Mensaje de fallo `DATABASE_URL`:** Antes de delegar solo en Zod genérico, comprobar explícitamente ausencia/vacío y llamar:

```typescript
console.error('Variable obligatoria DATABASE_URL no definida. Ver .env.example')
process.exit(1)
```

Esto cumple el texto exacto del DoD; otros fallos de Zod pueden usar mensaje derivado del error de validación.

**Alternativa descartada:** `process.env` sin coerce — `API_PORT` llega como string desde dotenv.

### 3. Export de `config` y uso en capas

**Decisión:** Exportar singleton parseado:

```typescript
export type AppConfig = {
  databaseUrl: string
  apiPort: number
  corsOrigin: string
  nodeEnv: 'development' | 'production' | 'test'
}

export const config: AppConfig = parseConfig(process.env)
```

- `main.ts`: `config.apiPort` para `listen`; opcionalmente log de BD usando `config.databaseUrl`.
- `createApp.ts`: importar `config.corsOrigin` en lugar de `process.env.CORS_ORIGIN`.

**Alternativa descartada:** Inyectar config como parámetro de `createApp(prisma, config)` — añade ruido; importar config desde infra es aceptable para scaffold (capa de composición en `main`).

### 4. Dependencia `zod`

**Decisión:** Instalar `zod` como dependencia de producción en el `package.json` raíz del monorepo (donde están `express`, `dotenv`, etc.).

### 5. Tests unitarios (`config.test.ts`)

**Decisión:** Vitest con `vi.stubEnv` / restauración de `process.env` entre tests:

| Caso | Expectativa |
|------|-------------|
| Env válido mínimo (`DATABASE_URL` + resto por default) | `parseConfig` / export devuelve defaults `apiPort=3001`, `corsOrigin=5173`, `nodeEnv=development` |
| Sin `DATABASE_URL` | `process.exit(1)` mockeado; stderr contiene `.env.example` |
| `DATABASE_URL=""` | Mismo comportamiento que ausente |
| `NODE_ENV=production` | Enum aceptado |
| `NODE_ENV=staging` | Fallo de validación (exit o throw según implementación) |

Mockear `process.exit` para no terminar el runner de Vitest.

**Alternativa descartada:** Tests de integración arrancando servidor sin `.env` — más lentos; unitarios cubren DoD.

## Risks / Trade-offs

| Riesgo | Mitigación |
|--------|------------|
| Tests que mutan `process.env` afectan paralelismo | Restaurar env en `afterEach`; considerar `vi.isolateModules` al reimportar config |
| Doble parse si varios módulos importan config | Módulo singleton evaluado una vez por proceso Node |
| Mensaje US-04 S5 vs DoD ticket (texto ligeramente distinto) | Priorizar texto exacto del DoD T-04-03 (incluye "Ver .env.example") |
| `zod` no instalado rompe CI hasta apply | Paso explícito en tasks: `npm install zod` |

## Migration Plan

1. Instalar `zod`.
2. Añadir `config.ts` y tests.
3. Actualizar `main.ts` / `createApp.ts`.
4. Verificar arranque con `.env` existente y fallo sin `DATABASE_URL`.
5. Actualizar `docs/backend-standards.md`.

Rollback: revertir imports y eliminar `config.ts`; restaurar lectura directa de `process.env`.

## Open Questions

_(Ninguna bloqueante — defaults y variables están definidos en el DoD del ticket.)_
