# ADR 009: Paquete `packages/prisma-db` como Fuente Única del Schema Prisma

**Estado**: ✅ Aceptada  
**Fecha**: 2026-03-02  
**Decidido en**: Change `infra-prisma-shared-schema` — refactorización Opción B  
**Implementado en**: `openspec/changes/infra-prisma-shared-schema`  
**Reemplaza a**: [ADR-008](./008-prisma-schema-worker-opcion-c.md) (Opción C — Worker apuntando al schema del API)

---

## Contexto

ADR-008 (Opción C) resolvió el drift del schema Prisma entre API y Worker haciendo que el Worker leyera el schema del API vía ruta relativa. Esto generaba una **dependencia cross-app implícita** no declarada en `package.json`. Este ADR implementa la **Opción B**: un workspace package `packages/prisma-db` como fuente neutral, siguiendo el patrón de [ADR-007](./007-shared-types-package.md).

---

## Decisión

Crear `packages/prisma-db` (`@adresles/prisma-db`) que contiene:
- `schema.prisma` — fuente única de verdad del modelo de datos
- `generated/` — cliente Prisma generado (`output = "./generated"` en el schema)
- Export del cliente Prisma para que API y Worker importen `PrismaClient` y tipos desde `@adresles/prisma-db`

Las migraciones y el seed están en `packages/prisma-db/` (`migrations/` y `seed.ts`). El script `db:generate` ejecuta `prisma generate` desde `packages/prisma-db`.

---

## Justificación

| Aspecto | Opción C (ADR-008) | Opción B (este ADR) |
|---------|-------------------|---------------------|
| Dependencia declarada | ❌ Implícita | ✅ `@adresles/prisma-db` en `package.json` |
| Turborepo | ❌ No gestiona | ✅ Gestiona el grafo |
| Schema en ubicación | `apps/api/` | `packages/prisma-db/` |
| Patrón ADR-007 | Parcial | ✅ Coherente |

---

## Implementación

- `packages/prisma-db/`: `schema.prisma`, `package.json`, `generated/` (output del cliente), `migrations/`, `seed.ts`
- API y Worker: dependencia `@adresles/prisma-db`, imports desde `@adresles/prisma-db` (no `@prisma/client`)
- `db:generate`: `pnpm --filter @adresles/prisma-db run generate`

---

## Referencias

- **Change**: `openspec/changes/infra-prisma-shared-schema`
- **ADR-007**: [007-shared-types-package.md](./007-shared-types-package.md)
- **ADR-008**: [008-prisma-schema-worker-opcion-c.md](./008-prisma-schema-worker-opcion-c.md) (obsoleto)

---

**Creado por**: Sergio  
**Última actualización**: 2026-03-02
