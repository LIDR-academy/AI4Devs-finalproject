# Patrones — Paquete Prisma Compartido en Monorepo

> **Última actualización**: 2026-03-02  
> **Origen**: Change `infra-prisma-shared-schema` — Opción B (ADR-009)  
> **Referencia**: [ADR-009](../architecture/009-prisma-db-package.md)

---

## Contexto

En un monorepo con API y Worker que comparten PostgreSQL, el schema Prisma debe residir en un paquete neutral (`packages/prisma-db`) para declarar dependencias explícitas, permitir a Turborepo gestionar el grafo y evitar drift entre apps.

---

## Reglas Principales

### 1. Schema, migraciones y seed en el mismo paquete

> **Las migraciones y el seed DEBEN estar junto al schema en `packages/prisma-db/`.**

- **Por qué**: Cuando el schema está en un path distinto, Prisma busca migraciones por defecto junto al schema. Si migraciones están en `apps/api/prisma/` y el schema en `packages/prisma-db/`, la shadow database falla con errores tipo "EcommerceStatus already exists" al aplicar migraciones duplicadas en secuencia.
- **Estructura**: `packages/prisma-db/` contiene `schema.prisma`, `migrations/`, `seed.ts`, `generated/`.

### 2. Dependencia en `dependencies` (no devDependencies)

> **API y Worker declaran `@adresles/prisma-db` en `dependencies`.**

- **Por qué**: Ambas apps usan `PrismaClient` en runtime (requests, jobs). Las devDependencies no se instalan en producción por defecto.
- **Excepción**: `prisma` CLI y `ts-node` para seed siguen en devDependencies de cada app/paquete.

### 3. Campo `files` en el package

> **El package incluye `files: ["schema.prisma", "generated", "seed.ts", "migrations"]`.**

- `schema.prisma`: fuente de verdad
- `generated`: cliente Prisma (PrismaClient, tipos, enums)
- `seed.ts`: script de seed
- `migrations`: historial para `prisma migrate`

### 4. Seed ejecutado desde raíz

> **`db:seed` en el root ejecuta el seed directamente, no vía `prisma db seed`.**

- **Problema**: `prisma db seed` lanza un subproceso donde `@adresles/prisma-db` no se resuelve bien en el contexto del workspace.
- **Solución**: `node -r dotenv/config -r ts-node/register packages/prisma-db/seed.ts dotenv_config_path=apps/api/.env`
- **Import en seed**: Usar `import { PrismaClient } from './generated'` (relativo) en lugar de `@adresles/prisma-db` para evitar problemas de resolución dentro del package.

---

## Comandos Raíz

| Script | Comando |
|--------|---------|
| `db:generate` | `pnpm --filter @adresles/prisma-db run generate` |
| `db:migrate` | `pnpm --filter api exec prisma migrate dev` |
| `db:migrate:deploy` | `pnpm --filter api exec prisma migrate deploy` |
| `db:seed` | `node -r dotenv/config -r ts-node/register packages/prisma-db/seed.ts dotenv_config_path=apps/api/.env` |
| `db:studio` | `pnpm --filter api exec prisma studio` |

---

## Migraciones: Evitar duplicados

Si una migración aplica el esquema completo desde cero (baseline) pero ya existen migraciones incrementales anteriores, Prisma fallará en la shadow DB al intentar crear enums/tablas que ya existen. **Solución**: convertir la migración baseline en incremental (solo los cambios nuevos, p. ej. un nuevo enum o columna).

Si una migración se modificó después de aplicarse, Prisma reportará "migration was modified after it was applied". **Solución**: actualizar el checksum en `_prisma_migrations` con SHA-256 del contenido actual del `migration.sql`.
