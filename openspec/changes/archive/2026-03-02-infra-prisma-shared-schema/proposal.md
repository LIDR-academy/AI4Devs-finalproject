## Why

La Opción C (ADR-008) sincroniza el schema Prisma entre API y Worker mediante una ruta relativa (`../api/prisma/schema.prisma`), pero genera una dependencia cross-app implícita no declarada en `package.json`. Turborepo no gestiona el grafo de dependencias y nuevas apps deben copiar manualmente la ruta. Este cambio declara la dependencia explícitamente y mueve el schema a un paquete neutral siguiendo el patrón de ADR-007.

## What Changes

- Crear `packages/prisma-db` como workspace package con `schema.prisma` como única fuente de verdad
- Mover `apps/api/prisma/schema.prisma` → `packages/prisma-db/schema.prisma`
- Añadir `@adresles/prisma-db` en devDependencies de API y Worker; actualizar `prisma.schema` en ambos `package.json`
- Actualizar script `db:generate` del root para regenerar clientes en ambas apps
- Migraciones siguen en `apps/api/prisma/migrations/` (API como dueño)
- Actualizar ADR-007 para mencionar `packages/prisma-db`; documentar decisión (ADR-009 o actualizar ADR-008)

**Rollback**: Revertir el commit; mover `schema.prisma` de vuelta a `apps/api/prisma/`; restaurar `prisma.schema` en API/Worker a la configuración previa; eliminar `packages/prisma-db`.

## Capabilities

### New Capabilities

- `prisma-db-package`: Paquete workspace `@adresles/prisma-db` que expone el schema Prisma como fuente única de verdad para API y Worker.

### Modified Capabilities

<!-- Infraestructura pura: no cambian requisitos funcionales de specs existentes -->

## Impact

- **Código**: `packages/` (nuevo), `apps/api/package.json`, `apps/worker/package.json`, root `package.json`
- **APIs**: Ninguno (sin cambios en endpoints)
- **Dependencias**: Nueva dependencia workspace `@adresles/prisma-db` en API y Worker
- **Sistemas**: Turborepo podrá gestionar el grafo; CI/CD ejecutará `prisma generate` en ambas apps tras cambios en el schema
