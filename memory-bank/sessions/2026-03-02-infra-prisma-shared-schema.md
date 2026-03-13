# Sesión 2026-03-02: infra-prisma-shared-schema — packages/prisma-db (Opción B) — Completado

> **Change**: `infra-prisma-shared-schema`  
> **Estado**: ✅ Completado y verificado (19/19 tareas)

## Resumen

Implementación de la Opción B (ADR-009): schema Prisma en un paquete workspace neutral `packages/prisma-db`, sustituyendo la dependencia implícita del Worker sobre el API (ADR-008, Opción C). Incluye migración de schema, migraciones y seed desde `apps/api/prisma/` a `packages/prisma-db/`.

---

## Completado

### Estructura packages/prisma-db

- `schema.prisma` — fuente única de verdad
- `generated/` — cliente Prisma (output del generator)
- `migrations/` — historial de migraciones (movido desde apps/api/prisma)
- `seed.ts` — script de seed (movido desde apps/api/prisma)
- `package.json` con `files: ["schema.prisma", "generated", "seed.ts", "migrations"]`

### API y Worker

- Dependencia `@adresles/prisma-db` en `dependencies` (runtime)
- `prisma.schema` apunta a `../../packages/prisma-db/schema.prisma`
- Imports de `PrismaClient` y enums desde `@adresles/prisma-db`

### Scripts raíz

- `db:generate`: `pnpm --filter @adresles/prisma-db run generate`
- `db:migrate`, `db:migrate:deploy`, `db:studio`: contexto API
- `db:seed`: ejecutado directamente desde root (bypass de `prisma db seed`)

---

## Aprendizajes Significativos

### 1. Migraciones junto al schema

**Problema**: Con schema en `packages/prisma-db/` y migraciones en `apps/api/prisma/`, la shadow database de Prisma fallaba: migraciones aplicadas en orden creaban enums/tablas que una migración posterior intentaba recrear → "EcommerceStatus already exists".

**Solución**: Mover migraciones a `packages/prisma-db/migrations/`. Prisma busca migraciones junto al schema por defecto; al estar en el mismo paquete se evita el drift.

### 2. Migración baseline vs incremental

**Problema**: La migración `20260221000000_init` contenía el esquema completo desde cero. Al aplicarse tras `20260218` y `20260219`, duplicaba la creación de enums.

**Solución**: Convertir la migración en incremental: solo los cambios nuevos (p. ej. `StatusSource` + `status_source`). Eliminar la migración baseline duplicada si ya existían incrementales equivalentes.

### 3. Checksum en _prisma_migrations

**Problema**: Tras modificar el contenido de una migración ya aplicada, Prisma reportaba "The migration was modified after it was applied".

**Solución**: Actualizar el campo `checksum` en `_prisma_migrations` con el SHA-256 del contenido actual del `migration.sql` para que coincida con lo que Prisma espera.

### 4. db:seed y resolución de módulos

**Problema**: `prisma db seed` lanza un subproceso donde `@adresles/prisma-db` no se resuelve correctamente en el contexto del workspace → "Cannot find module '@adresles/prisma-db'".

**Solución**: Ejecutar el seed directamente desde la raíz: `node -r dotenv/config -r ts-node/register packages/prisma-db/seed.ts dotenv_config_path=apps/api/.env`. En el seed, usar `import { PrismaClient } from './generated'` (ruta relativa) en lugar del nombre del package.

### 5. Jest y variables de entorno

**Problema**: Tests de API mostraban warnings de `REDIS_URL not set` al instanciar `MockSseService`.

**Solución**: Añadir `setupFiles: ['dotenv/config']` en `jest.config.js` para cargar `apps/api/.env` antes de los tests.

---

## ADRs Actualizados

- **ADR-009** — `packages/prisma-db` (Opción B) implementado
- **ADR-008** — Obsoleto (Worker ya no apunta al API)
- **ADR-007** — Menciona `packages/prisma-db` como extensión del patrón

---

## Patrón Documentado

- **[prisma-shared-package-patterns.md](../patterns/prisma-shared-package-patterns.md)** — Reglas para schema, migraciones, seed y comandos en monorepo con Prisma compartido
