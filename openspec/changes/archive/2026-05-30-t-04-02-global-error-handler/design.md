# Design — T-04-02 · Middleware de manejo global de errores

**Ticket:** T-04-02 · **User Story:** US-04 · **Change:** `t-04-02-global-error-handler`

## Context

- **Completado (T-04-01):** `createApp(prisma)` con CORS, `express.json()`, `GET /health`, `GET /api/profile`, directorio `presentation/http/middleware/` con placeholder.
- **Estado actual de errores:** `/api/profile` usa `try/catch` local y responde `{ error: "..." }` con códigos 404/500 ad hoc; no hay clases `ValidationError` / `NotFoundError` en el repo.
- **Stack:** Express **4.19** (los rechazos de promesas en handlers `async` no llegan al error middleware sin `next(err)` o wrapper).
- **Contrato objetivo:** JSON plano `{ code, message, details?, stack? }` alineado con backlog US-04 S4, US-06 S4 y US-19; `code` en inglés, `message` en español.

## Goals / Non-Goals

**Goals:**

- Cumplir DoD T-04-02: `errorHandler` último en `createApp`, mapeo 400/404/409/422/500, `stack` condicionado por `NODE_ENV`.
- Introducir errores tipados reutilizables por casos de uso futuros (T-06-01, T-07-xx, T-12-xx).
- Tests unitarios Vitest del handler (tabla happy/edge del ticket).
- Refactor mínimo de `/api/profile` para usar `next(error)` en fallos y permitir 500 vía handler.

**Non-Goals:**

- `validateBody` / Zod en middleware (ticket posterior).
- `config.ts` con validación de env (T-04-03).
- Cambiar respuesta 404 de perfil a `USER_NOT_FOUND` (T-06-01).
- Logger estructurado centralizado (solo `console.error` en handler si aplica).
- Migración masiva de todos los endpoints.

## Decisions

### 1. Ubicación de clases de error: `backend/src/domain/errors/`

**Decisión:** Un fichero (o barrel) `appErrors.ts` con jerarquía:

```typescript
export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly details?: unknown
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Array<{ field: string; message: string }>) {
    super('VALIDATION_ERROR', message, details)
    this.name = 'ValidationError'
  }
}
// NotFoundError (default code USER_NOT_FOUND), ConflictError, UnprocessableError — mismo patrón
```

**Alternativa descartada:** Definir errores solo en `presentation/` — viola Clean Architecture; los casos de uso deben lanzar errores sin importar Express.

### 2. Middleware `errorHandler` con firma Express 4

**Decisión:** Exportar función de 4 argumentos `(err, req, res, next)` en `middleware/errorHandler.ts`:

- Detectar tipo con `instanceof` (o helper `isAppError`) en orden: Validation → NotFound → Conflict → Unprocessable → default 500.
- Respuesta: `res.status(status).json({ code, message, ...(details && { details }), ...(stack && { stack }) })`.
- Log interno: `console.error` con ruta y mensaje; nunca reenviar mensaje Prisma al cliente en producción.

**Mapeo:**

| Clase | HTTP | code por defecto (si no se pasa otro) |
|-------|------|----------------------------------------|
| ValidationError | 400 | VALIDATION_ERROR |
| NotFoundError | 404 | USER_NOT_FOUND (parametrizable en constructor) |
| ConflictError | 409 | CONFLICT |
| UnprocessableError | 422 | según instancia (p. ej. INSUFFICIENT_POINTS) |
| Otros | 500 | INTERNAL_ERROR |

### 3. Stack trace según NODE_ENV

**Decisión:** Considerar producción solo cuando `process.env.NODE_ENV === 'production'`. En cualquier otro valor (`development`, `test`, undefined), añadir `stack: err.stack` al JSON de error.

**Alternativa descartada:** Usar `NODE_ENV !== 'development'` para ocultar stack — el DoD distingue explícitamente production vs development.

### 4. Registro en createApp

**Decisión:** Tras todas las rutas:

```typescript
app.get('/api/profile', asyncHandler(async (req, res) => { ... }))
// ...
app.use(errorHandler)
```

Añadir helper `asyncHandler` en `middleware/asyncHandler.ts` que envuelve `(req, res, next) => Promise` y hace `.catch(next)`.

**Alternativa descartada:** Dependencia `express-async-errors` — evitar dependencia nueva para un wrapper de ~5 líneas.

### 5. Refactor mínimo de GET /api/profile

**Decisión:**

- Éxito: sin cambios en payload `{ id, name, email }`.
- Usuario no encontrado: mantener comportamiento actual **fuera de alcance estricto del ticket** — puede seguir respondiendo 404 legacy en esta entrega, **o** lanzar `NotFoundError` si el refactor es trivial; preferir **mantener 404 inline** en T-04-02 para no acoplar T-06-01, y solo usar `next(err)` para errores inesperados del `catch`.
- Errores de Prisma/excepción: `next(err)` → `errorHandler` → 500 INTERNAL_ERROR.

**Nota:** Los tests unitarios validan el handler directamente; la integración curl verifica regresión de `/health` y `/api/profile` happy path.

### 6. Tests Vitest

**Decisión:** `backend/src/presentation/http/middleware/errorHandler.test.ts`:

- Invocar el handler con mocks de `Request`, `Response`, `NextFunction` (o mini-app Express sin listen).
- Casos: cada clase de error, `Error` genérico, `NODE_ENV` production vs development (restaurar env en `afterEach`).
- Sin tests E2E de API en este ticket (cubierto en paso obligatorio de verificación manual).

### 7. Documentación API

**Decisión:** Actualizar `docs/api-spec.yml` con schema `ApiErrorResponse` `{ code, message, details?, stack? }` y referenciarlo en respuestas 4xx/5xx de `/api/profile` como evolución; actualizar sección de manejo de errores en `docs/backend-standards.md`.

## Risks / Trade-offs

| Riesgo | Mitigación |
|--------|------------|
| Rutas async sin `asyncHandler` no alcanzan el handler | Documentar patrón en backend-standards; envolver rutas existentes y futuras |
| Coexistencia formato `{ error }` vs `{ code, message }` en 404 de perfil | Migración explícita en T-06-01; documentar en design/tasks |
| Filtrar demasiado en 500 oculta bugs en dev | `stack` disponible fuera de production |
| Tests dependen de mutar `NODE_ENV` | Restaurar valor anterior en hooks de Vitest |

## Migration Plan

1. Implementar `domain/errors` + `errorHandler` + `asyncHandler`.
2. Registrar handler y envolver `/api/profile`.
3. Ejecutar `npm test`, `npm run typecheck`, curl regresión.
4. Actualizar docs.
5. Sin migración de BD ni despliegue especial.

## Open Questions

- _(Ninguna bloqueante)_ — Códigos por defecto de `NotFoundError` se alinearán con US-06 (`USER_NOT_FOUND`) cuando T-06-01 refactorice el endpoint de perfil.
