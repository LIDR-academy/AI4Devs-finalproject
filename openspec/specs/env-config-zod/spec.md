# Spec — env-config-zod

**Ticket:** T-04-03 · **User Stories:** US-04 (S5), US-01 (S4)

## Requirements

### Requirement: Schema Zod de variables de entorno del backend

El backend SHALL validar al arranque las variables `DATABASE_URL`, `API_PORT`, `CORS_ORIGIN` y `NODE_ENV` mediante un schema Zod definido en `backend/src/config.ts`.

#### Scenario: DoD T-04-03 — Variables y defaults del schema

- **WHEN** se inspecciona el schema Zod en `backend/src/config.ts`
- **THEN** `DATABASE_URL` es un string no vacío (obligatorio)
- **AND** `API_PORT` tiene valor por defecto `"3001"` si no está definido
- **AND** `CORS_ORIGIN` tiene valor por defecto `"http://localhost:5173"` si no está definido
- **AND** `NODE_ENV` es un enum `development` | `production` | `test` con default `"development"`

#### Scenario: Happy path — variables válidas con defaults

- **WHEN** `process.env` incluye `DATABASE_URL=postgresql://user:pass@localhost:5432/db` y no define `API_PORT`, `CORS_ORIGIN` ni `NODE_ENV`
- **THEN** el módulo de configuración parsea correctamente
- **AND** `apiPort` es `3001`
- **AND** `corsOrigin` es `http://localhost:5173`
- **AND** `nodeEnv` es `development`

### Requirement: Fallo controlado si falta DATABASE_URL

Si `DATABASE_URL` no está definida o está vacía, el proceso SHALL terminar con código de salida 1 y un mensaje claro antes de escuchar conexiones TCP.

#### Scenario: DoD T-04-03 — DATABASE_URL ausente

- **WHEN** el desarrollador arranca el backend sin `DATABASE_URL` en el entorno (p. ej. sin `.env` o clave omitida)
- **THEN** el proceso termina con `process.exit(1)`
- **AND** el mensaje incluye el texto `Variable obligatoria DATABASE_URL no definida. Ver .env.example`
- **AND** el servidor NO llega a invocar `app.listen`

#### Scenario: Edge — DATABASE_URL vacía

- **WHEN** `DATABASE_URL` está definida como cadena vacía (`""`)
- **THEN** el comportamiento es equivalente a variable ausente (exit 1 con mensaje que cite `.env.example`)
- **AND** no se propaga una excepción no controlada al usuario

#### Scenario: US-01 Scenario 4 — .env faltante

- **WHEN** el desarrollador no ha creado el archivo `.env` y `DATABASE_URL` no está en el entorno
- **THEN** el backend falla al arrancar con un mensaje claro sobre la variable obligatoria
- **AND** no se lanza una excepción no controlada sin mensaje accionable

#### Scenario: US-04 Scenario 5 — Sin escuchar TCP

- **WHEN** `DATABASE_URL` no está definida en `.env`
- **THEN** el proceso termina inmediatamente
- **AND** no se abre ningún puerto TCP para peticiones HTTP

### Requirement: Validación de NODE_ENV

`NODE_ENV` SHALL aceptar únicamente los valores `development`, `production` o `test`.

#### Scenario: Happy path — enum válido

- **WHEN** `NODE_ENV=production` y el resto de variables son válidas
- **THEN** la configuración parseada expone `nodeEnv` como `"production"`

#### Scenario: Edge — valor desconocido rechazado

- **WHEN** `NODE_ENV=staging` (u otro valor fuera del enum) y `DATABASE_URL` es válida
- **THEN** la validación falla al arranque (exit o error controlado, no arranque silencioso con valor inválido)

### Requirement: Import de config antes del bootstrap en main.ts

`backend/src/main.ts` SHALL importar el módulo de configuración validado inmediatamente después de cargar variables desde disco y antes de instanciar Prisma, `createApp` o iniciar el servidor.

#### Scenario: DoD T-04-03 — Orden de imports en main.ts

- **WHEN** se inspecciona `backend/src/main.ts`
- **THEN** `./loadEnv.js` (o equivalente) se importa en la primera línea efectiva de bootstrap
- **AND** `./config.js` (o `./config`) se importa antes de `@prisma/client`, `createApp` y `app.listen`
- **AND** el side effect de validación ocurre al evaluar el import de config

### Requirement: Tests unitarios de configuración

El proyecto SHALL incluir tests Vitest en `backend/src/config.test.ts` que cubran happy path, variable obligatoria ausente/vacía y enum `NODE_ENV`.

#### Scenario: DoD T-04-03 — Suite config.test.ts

- **WHEN** se ejecuta `npm test` con la suite `config.test.ts`
- **THEN** existen casos que verifican defaults con `DATABASE_URL` presente
- **AND** existen casos que verifican exit/mensaje cuando falta `DATABASE_URL` (mock de `process.exit`)
- **AND** existen casos que verifican rechazo de `NODE_ENV` inválido
