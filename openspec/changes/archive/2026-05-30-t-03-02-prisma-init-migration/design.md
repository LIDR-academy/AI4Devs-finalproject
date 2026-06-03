# Design — T-03-02 · Generar y aplicar primera migración Prisma

**Ticket:** T-03-02 · **User Story:** US-03 · **Change:** `t-03-02-prisma-init-migration`

## Context

Tras T-03-01 y T-02-01 el repositorio tiene:

| Elemento | Estado actual | Objetivo (DoD T-03-02) |
|----------|---------------|-------------------------|
| PostgreSQL Docker (`npm run db:up`) | ✅ Operativo | Requerido antes de migrar |
| `backend/prisma/schema.prisma` | ✅ 7 modelos + enum + índices (T-03-01) | Sin cambios salvo drift inesperado |
| `backend/prisma/migrations/` | ❌ No existe | Carpeta con `<timestamp>_init/migration.sql` |
| Tablas en BD | ⚠️ Solo `User` si hubo migración/push previo; resto ausente | Las 7 tablas del dominio + enum |
| `npm run db:migrate` | ✅ Existe → `npx prisma migrate deploy` | Verificar que aplica `init` en BD limpia |
| `npm run prisma:generate` | ✅ Disponible | Regenerar tras `migrate dev` |
| Modelo `Calendar` legacy | ❌ Eliminado del schema (T-03-01) | Si existía tabla `Calendar` en BD local, la migración `init` puede requerir reset o migración de baseline |

Referencias: `docs/development_guide.md` §5 Migraciones, `docs/data-model.md` (estado "pendiente de migración T-03-02"), `package.json` (`prisma.schema`), T-03-01 `design.md` (impacto de eliminar `Calendar`).

**Dependencias previas:** T-02-01 ✅, T-03-01 ✅.

## Goals / Non-Goals

**Goals:**

- Generar y versionar migración `init` con `npx prisma migrate dev --name init`.
- Materializar en PostgreSQL todas las tablas, FK, índices y `@@unique([weekId, habitId])` del schema.
- Confirmar `npm run db:migrate` y `npx prisma studio` operativos.
- Actualizar documentación: entidades **migradas** en `docs/data-model.md`.

**Non-Goals:**

- Seed (`T-03-03`), reset con seed, cambios de API/frontend.
- Modificar el schema salvo corrección de drift bloqueante.
- Tests unitarios de migración.

## Decisions

### 1. Comando de creación vs aplicación de migraciones

**Decisión:** Separar responsabilidades según convención Prisma y `development_guide.md`:

| Acción | Comando | Cuándo |
|--------|---------|--------|
| Crear migración + aplicar en dev | `npx prisma migrate dev --name init` | Una vez en T-03-02 (y al cambiar schema en tickets futuros) |
| Aplicar migraciones existentes | `npm run db:migrate` → `prisma migrate deploy` | Clones frescos, CI, re-aplicar tras pull |

**Alternativa descartada:** Usar solo `db push` — no versiona SQL en el repo; incumple US-03 Scenario 1.

### 2. Ejecución desde la raíz del monorepo

**Decisión:** Todos los comandos Prisma se ejecutan desde la raíz gracias al bloque:

```json
"prisma": { "schema": "backend/prisma/schema.prisma" }
```

No usar `--schema` manual salvo depuración.

### 3. Baseline en BD con estado legacy (tabla `User` o `Calendar`)

**Decisión:** Antes de `migrate dev`, comprobar estado de `_prisma_migrations` y tablas existentes:

- **BD vacía o sin historial Prisma:** `migrate dev --name init` directo.
- **Solo tabla `User` sin carpeta migrations (estado típico post-T-03-01):** Prisma puede pedir baseline o reset. En desarrollo, **`npx prisma migrate reset`** (sin seed aún) o eliminar volumen Docker y recrear BD es aceptable — documentar en informe de verificación.
- **Tabla `Calendar` legacy:** La migración `init` no la recrea; un reset limpio alinea BD al schema actual.

**Alternativa descartada:** `migrate diff` manual sin `migrate dev` — más frágil para la primera migración del proyecto.

### 4. Contenido esperado de `migration.sql`

**Decisión:** El SQL generado por Prisma debe incluir (verificación manual en apply):

- `CREATE TYPE "CompletionStatus" AS ENUM (...)`
- `CREATE TABLE` para las 7 entidades con nombres PascalCase entre comillas (convención Prisma/PostgreSQL)
- FK con `ON DELETE CASCADE` / `RESTRICT` según schema
- Índices y `UNIQUE` en `WeekHabit`

No editar SQL a mano salvo bug documentado de Prisma.

### 5. Script `db:migrate`

**Decisión:** Mantener `db:migrate` como alias de `npx prisma migrate deploy`. Tras commitear la carpeta `migrations/`, un desarrollador nuevo ejecuta:

```bash
npm run db:up
npm run db:migrate
npm run prisma:generate
```

**Nota:** El DoD del ticket pide el script; ya existe — el apply verifica que funciona post-`init`, no duplica con otro nombre.

### 6. Verificación de tablas

**Decisión:** Combinar:

1. Salida exitosa de `migrate dev` / `db:migrate`
2. Consulta SQL: `SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;`
3. Apertura de Prisma Studio — comprobar 7 modelos (DoD ticket)

**Alternativa descartada:** Solo confiar en Studio — la consulta SQL deja evidencia en el informe de verificación.

## Risks / Trade-offs

| Riesgo | Mitigación |
|--------|------------|
| BD local con tablas parciales sin historial Prisma | Reset dev o volumen Docker nuevo; documentar en informe |
| Pérdida de datos locales en reset | Aceptable en Sprint 0; no hay seed oficial aún |
| `migrate dev` interactivo en CI | Fuera de alcance; solo entorno local en apply |
| Drift schema ↔ BD tras T-03-01 | Ejecutar `npx prisma validate` antes de migrar |
| `GET /api/profile` falla si no hay User id=1 | Tras migración, insertar usuario demo manualmente o esperar T-03-03; verificar API en paso de pruebas |

## Migration Plan

1. `npm run db:up` — PostgreSQL listo (`pg_isready`).
2. `npx prisma validate` — schema OK (T-03-01).
3. (Si aplica) limpiar BD legacy: `npx prisma migrate reset --force --skip-seed` o volumen nuevo.
4. `npx prisma migrate dev --name init` — genera y aplica migración.
5. `npm run prisma:generate` — cliente al día.
6. Verificar tablas (SQL + Studio).
7. Probar `npm run db:migrate` en escenario "solo deploy" (opcional: BD paralela o confirmar idempotencia).
8. Commit de `backend/prisma/migrations/` al archivar (no durante apply).

**Rollback (dev):** `npx prisma migrate reset --force --skip-seed` o `docker volume rm` + `db:up`.

## Open Questions

- _(Ninguna crítica)_ — Si Prisma detecta drift por tabla `User` preexistente, el agente apply documentará la acción tomada (reset vs baseline) en el informe de verificación.
