# INFRA — Prisma Schema como paquete compartido (`packages/prisma-db`)

**ID**: `infra-prisma-shared-schema`  
**App**: `packages/` (nuevo workspace package) + `apps/api` + `apps/worker`  
**Estado**: Pendiente de implementación  
**Fecha**: 2026-03-02  
**Prerrequisitos**: CU03-B1 completado (Opción C activa — `worker/package.json` apunta al schema del API)  
**Tipo**: Refactorización de infraestructura de desarrollo (sin impacto en comportamiento en producción)

---

## Contexto y Problema

En CU03-B1 se adoptó la **Opción C** ([ADR-008](../../memory-bank/architecture/008-prisma-schema-worker-opcion-c.md)) como solución temporal para sincronizar el schema de Prisma entre `apps/api` y `apps/worker`: el Worker lee el schema del API directamente vía `"prisma": { "schema": "../api/prisma/schema.prisma" }` en su `package.json`.

Esta solución resuelve el drift de tipos (`OrderStatus`, `StatusSource`, etc.) pero introduce una **dependencia cross-app implícita** no declarada en `package.json` ni gestionada por Turborepo:

- El Worker depende de `apps/api/prisma/schema.prisma` sin declararlo como dependencia formal.
- Turborepo no puede optimizar el grafo de tareas tras cambios en el schema.
- Nuevas apps que necesiten Prisma deben copiar manualmente la ruta relativa al API.

Este ticket implementa la **Opción B** documentada en ADR-008: crear un workspace package `packages/prisma-db` que actúa como **fuente única de verdad neutral** para el schema de Prisma, siguiendo el mismo patrón establecido en [ADR-007](../../memory-bank/architecture/007-shared-types-package.md) para `packages/shared-types`.

---

## Historia de Usuario

**Como** desarrollador de Adresles,  
**quiero** que el schema de Prisma viva en `packages/prisma-db` como fuente única de verdad explícita,  
**para** que cualquier app del monorepo que use Prisma declare la dependencia formalmente en su `package.json` y Turborepo pueda gestionar el grafo de dependencias correctamente.

---

## Especificaciones Técnicas

### Backend / Infraestructura

| Área | Cambio |
|------|--------|
| **Nuevo package** | `packages/prisma-db`: contiene únicamente `schema.prisma` (sin build step, sin TypeScript) |
| **API** | Añadir `"@adresles/prisma-db": "workspace:*"` en devDependencies; configurar `prisma.schema` apuntando a `../../packages/prisma-db/schema.prisma` |
| **Worker** | Añadir `"@adresles/prisma-db": "workspace:*"` en devDependencies; reemplazar `prisma.schema` para apuntar a `../../packages/prisma-db/schema.prisma` |
| **Migraciones** | Siguen en `apps/api/prisma/migrations/` — el API es el dueño de las migraciones; las migraciones referencian el schema por path configurado en `package.json` |
| **Scripts root** | Actualizar `db:generate` para ejecutar `prisma generate` en ambas apps; mantener `db:migrate` y `db:migrate:deploy` (API como dueño) |

**DTOs / Lógica de negocio**: No aplica — este cambio es puramente de estructura de archivos y configuración.

### Frontend

No aplica. Este ticket no modifica componentes, estados ni hooks de frontend.

---

## Estructura Objetivo

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
                        ← añadir: "prisma": { "schema": "../../packages/prisma-db/schema.prisma" }
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

> **No requiere `build` step ni TypeScript.** El schema es un archivo de texto consumido directamente por `prisma generate`. La sección `"files"` es documental.

### Scripts del root `package.json` a actualizar

```json
{
  "db:generate": "pnpm --filter api exec prisma generate && pnpm --filter worker exec prisma generate",
  "db:migrate": "pnpm --filter api exec prisma migrate dev",
  "db:migrate:deploy": "pnpm --filter api exec prisma migrate deploy"
}
```

> **Nota**: El script `db:migrate:deploy` puede no existir actualmente; añadirlo si el pipeline CI/CD lo utiliza para aplicar migraciones en producción.

### `pnpm-workspace.yaml` — sin cambios necesarios

El workspace ya incluye `packages/*` ([pnpm-workspace.yaml](../../pnpm-workspace.yaml)), por lo que `packages/prisma-db` se registra automáticamente.

---

## Diferencias respecto a la Opción C (CU03-B1)

| Aspecto | Opción C (CU03-B1) | Opción B (este ticket) |
|---------|-------------------|------------------------|
| Dependencia declarada | ❌ Implícita | ✅ `@adresles/prisma-db` en `package.json` |
| Turborepo gestiona el grafo | ❌ No | ✅ Sí |
| Schema en ubicación neutral | ❌ `apps/api/` | ✅ `packages/prisma-db/` |
| Patrón ADR-007 | Parcial | ✅ Coherente |
| Complejidad de implementación | Mínima | Baja (nuevo dir + config) |
| Nuevo build step | No | No (schema = texto plano) |

---

## Arquitectura

| ADR | Afectación |
|-----|------------|
| [ADR-007: packages/shared-types](../../memory-bank/architecture/007-shared-types-package.md) | Patrón análogo — `prisma-db` extiende el modelo de paquetes compartidos de workspace |
| [ADR-008: Worker schema → API (Opción C)](../../memory-bank/architecture/008-prisma-schema-worker-opcion-c.md) | Este ticket **reemplaza** la Opción C; tras implementación, ADR-008 quedará obsoleto o se actualizará para referenciar ADR-009 (packages/prisma-db) |

**Referencia**: [memory-bank/README.md](../../memory-bank/README.md) — Stack: Prisma 5.22.0, pnpm workspaces, Turborepo.

---

## Definición de Hecho (DoD)

- [ ] Crear `packages/prisma-db/package.json` con `name: "@adresles/prisma-db"`, `private: true`, `files: ["schema.prisma"]`
- [ ] Mover `apps/api/prisma/schema.prisma` a `packages/prisma-db/schema.prisma`
- [ ] En `apps/api/package.json`: añadir `"@adresles/prisma-db": "workspace:*"` en devDependencies y añadir `"prisma": { "schema": "../../packages/prisma-db/schema.prisma" }`
- [ ] En `apps/worker/package.json`: añadir `"@adresles/prisma-db": "workspace:*"` en devDependencies y actualizar `"prisma": { "schema": "../../packages/prisma-db/schema.prisma" }`
- [ ] Ejecutar `pnpm install` en la raíz del monorepo para registrar el nuevo workspace
- [ ] Ejecutar `pnpm --filter api exec prisma generate` y verificar que el cliente se genera correctamente
- [ ] Ejecutar `pnpm --filter worker exec prisma generate` y verificar lo mismo
- [ ] Actualizar el script `db:generate` del root `package.json` para regenerar tanto API como Worker
- [ ] Verificar que `pnpm --filter api exec prisma migrate dev` sigue funcionando con el schema en su nueva ubicación
- [ ] Ejecutar `npx tsc --noEmit` en `apps/api/` y `apps/worker/` sin errores de tipo
- [ ] Verificar que las migraciones existentes en `apps/api/prisma/migrations/` siguen accesibles
- [ ] Ejecutar `pnpm test` en API y Worker para asegurar que no hay regresiones
- [ ] Actualizar [ADR-007](../../memory-bank/architecture/007-shared-types-package.md) para mencionar `packages/prisma-db` como extensión del patrón de paquetes compartidos
- [ ] Crear/actualizar ADR-009 (o actualizar ADR-008) documentando la Opción B como decisión final

---

## Requisitos No Funcionales

| Área | Requisito |
|------|-----------|
| **Seguridad** | Sin impacto — no hay cambios en credenciales, RLS ni acceso a datos |
| **Rendimiento** | Sin impacto en runtime — solo reorganización de archivos y configuración de desarrollo |
| **Observabilidad** | Sin cambios en logs, métricas ni tracing |
| **CI/CD** | El pipeline deberá ejecutar `prisma generate` en ambas apps tras cualquier cambio en `packages/prisma-db/schema.prisma`; Turborepo gestionará esto automáticamente una vez declaradas las dependencias en `package.json` |
| **Producción** | Sin impacto — este cambio es puramente de infraestructura de desarrollo. El schema de Prisma define los tipos generados en desarrollo/CI; no hay cambios en la DB ni en el comportamiento de las apps en runtime |

---

## Referencias

- **Memory Bank**: [memory-bank/README.md](../../memory-bank/README.md)
- **Tech Stack**: [memory-bank/project-context/tech-stack.md](../../memory-bank/project-context/tech-stack.md)
- **ADR-007**: [007-shared-types-package.md](../../memory-bank/architecture/007-shared-types-package.md)
- **ADR-008**: [008-prisma-schema-worker-opcion-c.md](../../memory-bank/architecture/008-prisma-schema-worker-opcion-c.md)
