# Spec — global-error-handler

**Ticket:** T-04-02 · **User Story:** US-04 (y alineación US-06 S4, US-19 S2/S4)

## ADDED Requirements

### Requirement: Clases de error discriminables en dominio

El backend SHALL exponer clases de error en la capa de dominio (o módulo compartido sin dependencias de Express) que permitan al middleware clasificar la respuesta HTTP.

#### Scenario: DoD T-04-02 — Tipos de error exportados

- **WHEN** se inspecciona el módulo de errores del backend tras implementar T-04-02
- **THEN** existen las clases `ValidationError`, `NotFoundError`, `ConflictError` y `UnprocessableError` que extienden `Error`
- **AND** cada instancia expone al menos `code` (string estable en inglés) y `message` (español para el cliente)
- **AND** `ValidationError` y `UnprocessableError` pueden incluir `details` opcional (array u objeto según diseño)

### Requirement: Middleware errorHandler registrado al final de la cadena

`createApp.ts` SHALL registrar el middleware de errores después de todas las rutas y middlewares de aplicación.

#### Scenario: DoD T-04-02 — Orden en createApp

- **WHEN** se inspecciona `backend/src/presentation/http/createApp.ts`
- **THEN** `errorHandler` se importa desde `presentation/http/middleware/errorHandler`
- **AND** se registra con `app.use(errorHandler)` como último middleware (tras rutas `/health` y `/api/*`)

### Requirement: Mapeo HTTP de errores tipados

El middleware SHALL traducir errores conocidos a códigos HTTP y cuerpo JSON `{ code, message, details? }`.

#### Scenario: DoD T-04-02 — Mapeo de códigos HTTP

- **WHEN** el middleware recibe un `ValidationError`
- **THEN** responde con HTTP `400` y cuerpo que incluye `code` y `message` del error
- **AND** incluye `details` en el JSON cuando el error los define

#### Scenario: NotFoundError → 404

- **WHEN** el middleware recibe un `NotFoundError`
- **THEN** responde con HTTP `404` y cuerpo `{ code, message, details? }`

#### Scenario: ConflictError → 409

- **WHEN** el middleware recibe un `ConflictError`
- **THEN** responde con HTTP `409` y cuerpo `{ code, message, details? }`

#### Scenario: UnprocessableError → 422

- **WHEN** el middleware recibe un `UnprocessableError` (p. ej. `code: "INSUFFICIENT_POINTS"`)
- **THEN** responde con HTTP `422` y cuerpo `{ code, message, details? }` (US-19 Scenario 4 — base de mapeo)

#### Scenario: US-19 Scenario 2 — ValidationError con details

- **WHEN** un caso de uso o capa de validación lanza `ValidationError` con `details: [{ field: "name", message: "..." }]`
- **THEN** la respuesta HTTP es `400` con `code: "VALIDATION_ERROR"` (o el code definido en la instancia)
- **AND** el campo `details` se replica en el JSON de respuesta

### Requirement: Errores no controlados → 500 INTERNAL_ERROR

Errores que no son instancias de las clases tipadas SHALL convertirse en respuesta genérica sin filtrar detalles de infraestructura en producción.

#### Scenario: US-04 Scenario 4 — Excepción no controlada

- **WHEN** una ruta propaga un `Error` genérico (p. ej. fallo de Prisma simulado) al `errorHandler`
- **THEN** la respuesta es HTTP `500`
- **AND** el cuerpo incluye `code: "INTERNAL_ERROR"` y `message: "Error interno del servidor"` (o mensaje genérico equivalente en español definido en el handler)

#### Scenario: US-06 Scenario 4 — Sin detalles de BD en producción

- **WHEN** `NODE_ENV` es `production` y el error no es tipado
- **THEN** la respuesta `500` NO incluye mensajes de Prisma, SQL ni propiedades internas del error original
- **AND** NO incluye el campo `stack`

#### Scenario: DoD T-04-02 — Edge: error genérico en producción

- **WHEN** `NODE_ENV=production` y se lanza `new Error("connection refused")`
- **THEN** el cliente recibe solo `{ code: "INTERNAL_ERROR", message: "..." }` sin `stack` ni texto "connection refused"

### Requirement: Stack trace solo en desarrollo

El campo `stack` en la respuesta JSON SHALL estar presente únicamente fuera de producción.

#### Scenario: DoD T-04-02 — NODE_ENV production

- **WHEN** `NODE_ENV` es `production` (o `process.env.NODE_ENV === 'production'`)
- **THEN** ninguna respuesta de error del `errorHandler` incluye la propiedad `stack`

#### Scenario: DoD T-04-02 — Entorno development

- **WHEN** `NODE_ENV` no es `production` (p. ej. `development` o `test`)
- **THEN** las respuestas de error pueden incluir `stack` con el stack trace del error para depuración

### Requirement: Formato JSON de respuesta de error

Todas las respuestas de error generadas por el middleware SHALL usar la forma plana acordada en el ticket.

#### Scenario: DoD T-04-02 — Formato estándar

- **WHEN** el middleware serializa cualquier error tipado o genérico
- **THEN** el cuerpo JSON contiene `code` y `message` como strings
- **AND** `details` aparece solo cuando aplica
- **AND** no se usa el formato legacy `{ error: "string" }` para errores gestionados por el handler

### Requirement: Tests unitarios del errorHandler

El proyecto SHALL incluir tests Vitest que verifiquen mapeo, formato y comportamiento por entorno sin depender de PostgreSQL.

#### Scenario: DoD ticket — errorHandler.test.ts

- **WHEN** se ejecuta `npm test` tras implementar T-04-02
- **THEN** existe `errorHandler.test.ts` con casos para cada tipo de error (400/404/409/422/500)
- **AND** casos que verifican ausencia/presencia de `stack` según `NODE_ENV`
- **AND** los tests pasan sin levantar el servidor HTTP completo (prueba del handler aislado o app mínima en memoria)
