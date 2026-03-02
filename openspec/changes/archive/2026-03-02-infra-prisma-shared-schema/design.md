## Context

En ADR-008 (Opción C) el Worker lee el schema Prisma del API vía `"prisma": { "schema": "../api/prisma/schema.prisma" }`. La dependencia es implícita: no figura en `package.json`, Turborepo no la gestiona y nuevas apps deben copiar la ruta manualmente. El monorepo ya tiene `packages/shared-types` (ADR-007) como patrón de paquetes compartidos. Este diseño aplica el mismo patrón al schema Prisma.

**Restricciones**: Usar `path.join()` / `path.resolve()` para rutas; mantener compatibilidad Windows/macOS/Linux; no añadir build step (schema = texto plano).

## Goals / Non-Goals

**Goals:**
- Schema Prisma en ubicación neutral (`packages/prisma-db`) como fuente única de verdad
- Dependencia explícita `@adresles/prisma-db` en `package.json` de API y Worker
- Turborepo capaz de gestionar el grafo de dependencias del schema
- Migraciones y seed en `packages/prisma-db/` (junto al schema; API ejecuta `prisma migrate` en su contexto)
- Zero impacto en comportamiento en producción

**Non-Goals:**
- Cambiar el contenido del schema ni el modelo de datos
- Compartir un único cliente Prisma generado entre apps (cada app genera el suyo)
- Añadir tests unitarios al paquete `prisma-db` (sin lógica ejecutable)

## Decisions

### 1. Estructura del paquete `packages/prisma-db`

**Decisión**: Solo `package.json` + `schema.prisma`. Sin `build`, sin TypeScript, sin `tsconfig.json`.

**Alternativas consideradas**:
- Migraciones en `apps/api/prisma/`: rechazado — causa drift en shadow database cuando el schema está en otro path.
- Generar cliente y exportar: rechazado por problemas de connection pools en contenedores independientes (ADR-008).

### 2. Path del schema en `prisma.schema`

**Decisión**: Rutas relativas al proyecto de cada app: `../../packages/prisma-db/schema.prisma` (desde `apps/api/` y `apps/worker/`).

**Alternativas**:
- Path absoluto: rechazado — no portable entre máquinas/CI.
- Variable de entorno: rechazado — over-engineering para monorepo con estructura fija.

**Nota**: Prisma acepta rutas relativas al `package.json` del proyecto; las rutas relativas funcionan en Windows (forward slashes aceptados) y en CI.

### 3. Migraciones y seed en `packages/prisma-db/`

**Decisión**: Las migraciones y el seed residen en `packages/prisma-db/migrations/` y `packages/prisma-db/seed.ts`, junto al schema. `prisma migrate` y `prisma db seed` se ejecutan en el contexto del API; el schema y las migraciones se resuelven desde el package.

**Rationale**: Mantener migraciones junto al schema evita drift en la shadow database de Prisma y centraliza el modelo de datos en un único paquete.

### 4. Script `db:generate` en root

**Decisión**: Actualizar para ejecutar `prisma generate` en API y Worker secuencialmente.

**Alternativa**: Turborepo `turbo run prisma:generate` — viable si ambas apps definen el script; para mantener simplicidad se usa el filtro `--filter` directo.

## Risks / Trade-offs

| Riesgo | Mitigación |
|--------|------------|
| Rutas rotas tras el move | Verificar `prisma generate` y `prisma migrate dev` en API y Worker antes de merge |
| Migraciones referencian path viejo | Las migraciones de Prisma no embeben el path del schema; el path se define en `package.json` en tiempo de ejecución |
| CI no regenera tras cambio en schema | Turborepo gestionará dependencias; añadir `packages/prisma-db` como dependencia explícita asegura invalidación de cache |
| Diferencias Windows/Linux en paths | Prisma y Node aceptan forward slashes; usar rutas relativas estándar minimiza problemas |

## Migration Plan

1. Crear `packages/prisma-db/package.json` y `schema.prisma` (copiar desde API)
2. Actualizar `apps/api/package.json` y `apps/worker/package.json`
3. Eliminar `apps/api/prisma/` (schema, migraciones y seed movidos a `packages/prisma-db/`)
4. `pnpm install` en root
5. `pnpm db:generate` (o ejecutar generate en cada app)
6. `pnpm --filter api exec prisma migrate dev` (dry-run o status para validar)
7. `npx tsc --noEmit` en API y Worker
8. `pnpm test` en API y Worker
9. Actualizar ADRs

**Rollback**: Git revert del commit; restaurar `schema.prisma`, `migrations/` y `seed.ts` en `apps/api/prisma/`; revertir cambios en `package.json` de API, Worker y root; eliminar `packages/prisma-db`.

## Open Questions

- Ninguno para este cambio. La estructura está definida por ADR-007 y ADR-008.
