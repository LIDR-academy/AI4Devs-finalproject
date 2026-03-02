# INFRA — Prisma Schema como paquete compartido (`packages/prisma-db`)

**App**: `packages/` (nuevo workspace package) + `apps/api` + `apps/worker`  
**Estado**: Pendiente de implementación  
**Fecha**: 2026-03-02  
**Prerrequisitos**: CU03-B1 completado (Opción C activa — `worker/package.json` apunta al schema del API)  
**Tipo**: Refactorización de infraestructura de desarrollo (sin impacto en comportamiento en producción)

---

## Contexto y Motivación

En CU03-B1 se adoptó la **Opción C** como solución temporal para sincronizar el schema de Prisma entre `apps/api` y `apps/worker`: el Worker lee el schema del API directamente vía `"prisma": { "schema": "../api/prisma/schema.prisma" }` en su `package.json`.

Esta solución resuelve el drift pero introduce una **dependencia cross-app implícita** no declarada en `package.json` ni gestionada por Turborepo. Este ticket implementa la **Opción B**: crear un workspace package `packages/prisma-db` que actúa como fuente única de verdad neutral para el schema de Prisma, siguiendo el mismo patrón establecido en [ADR-007](../../memory-bank/architecture/007-shared-types-package.md) para `packages/shared-types`.

---

## Historia de Usuario

**Como** desarrollador de Adresles,  
**quiero** que el schema de Prisma viva en `packages/prisma-db` como fuente única de verdad explícita,  
**para** que cualquier app del monorepo que use Prisma declare la dependencia formalmente en su `package.json` y Turborepo pueda gestionar el grafo de dependencias correctamente.

---

## Especificaciones Técnicas

### Estructura objetivo

```
packages/
  shared-types/         ← ADR-007 (existente)
  prisma-db/            ← NUEVO
    package.json        ← name: "@adresles/prisma-db", private: true, sin build step
    schema.prisma       ← contenido movido desde apps/api/prisma/schema.prisma

apps/
  api/
    prisma/
      migrations/       ← migraciones siguen aquí (API es el dueño de las migraciones)
    package.json        ← añadir: "@adresles/prisma-db": "workspace:*" en devDependencies
                        ← cambiar: "prisma": { "schema": "../../packages/prisma-db/schema.prisma" }
  worker/
    package.json        ← añadir: "@adresles/prisma-db": "workspace:*" en devDependencies
                        ← cambiar: "prisma": { "schema": "../../packages/prisma-db/schema.prisma" }
```

### `packages/prisma-db/package.json`

```json
{
  "name": "@adresles/prisma-db",
  "version": "0.1.0",
  "private": true,
  "files": ["schema.prisma"]
}
```

> **No requiere `build` step ni TypeScript.** El schema es un archivo de texto consumido directamente por `prisma generate`. La sección `"files"` es solo documental.

### Scripts del root `package.json` a actualizar

```json
{
  "db:generate": "pnpm --filter api exec prisma generate && pnpm --filter worker exec prisma generate",
  "db:migrate": "pnpm --filter api exec prisma migrate dev",
  "db:migrate:deploy": "pnpm --filter api exec prisma migrate deploy"
}
```

### `pnpm-workspace.yaml` — sin cambios necesarios

El workspace ya incluye `packages/*`, por lo que `packages/prisma-db` se registra automáticamente.

---

## Diferencias respecto a la Opción C (CU03-B1)

| Aspecto | Opción C (CU03-B1) | Opción B (este ticket) |
|---------|-------------------|----------------------|
| Dependencia declarada | ❌ Implícita | ✅ `@adresles/prisma-db` en `package.json` |
| Turborepo gestiona el grafo | ❌ No | ✅ Sí |
| Schema en ubicación neutral | ❌ `apps/api/` | ✅ `packages/prisma-db/` |
| Patrón ADR-007 | Parcial | ✅ Coherente |
| Complejidad de implementación | Mínima | Baja (nuevo dir + config) |
| Nuevo build step | No | No (schema = texto plano) |

---

## Definición de Hecho (DoD)

- [ ] Crear `packages/prisma-db/package.json` con `name: "@adresles/prisma-db"`, `private: true`, `files: ["schema.prisma"]`
- [ ] Mover `apps/api/prisma/schema.prisma` a `packages/prisma-db/schema.prisma`
- [ ] En `apps/api/package.json`: añadir `"@adresles/prisma-db": "workspace:*"` en `devDependencies` y actualizar `"prisma": { "schema": "../../packages/prisma-db/schema.prisma" }`
- [ ] En `apps/worker/package.json`: añadir `"@adresles/prisma-db": "workspace:*"` en `devDependencies` y actualizar `"prisma": { "schema": "../../packages/prisma-db/schema.prisma" }`
- [ ] Ejecutar `pnpm install` en la raíz del monorepo para registrar el nuevo workspace
- [ ] Ejecutar `pnpm --filter api exec prisma generate` y verificar que el cliente se genera correctamente
- [ ] Ejecutar `pnpm --filter worker exec prisma generate` y verificar lo mismo
- [ ] Actualizar el script `db:generate` del root `package.json` para regenerar tanto API como Worker
- [ ] Verificar que `pnpm --filter api exec prisma migrate dev` sigue funcionando con el schema en su nueva ubicación
- [ ] Ejecutar `npx tsc --noEmit` en `apps/api/` y `apps/worker/` sin errores de tipo
- [ ] Verificar que las migraciones existentes en `apps/api/prisma/migrations/` siguen accesibles (las migraciones apuntan al schema, no al revés)
- [ ] Actualizar [ADR-007](../../memory-bank/architecture/007-shared-types-package.md) para mencionar `packages/prisma-db` como extensión del patrón de paquetes compartidos

## Requisitos No Funcionales

- **Sin impacto en producción**: Este cambio es puramente de infraestructura de desarrollo. El schema de Prisma define los tipos generados en desarrollo/CI; no hay cambios en la DB ni en el comportamiento de las apps en runtime.
- **CI/CD**: El pipeline deberá ejecutar `prisma generate` en ambas apps tras cualquier cambio en `packages/prisma-db/schema.prisma`. Turborepo gestionará esto automáticamente una vez declaradas las dependencias.
