# Design — T-03-03 · Implementar seed de datos de desarrollo

**Ticket:** T-03-03 · **User Story:** US-03 · **Change:** `t-03-03-dev-seed`

## Context

Tras T-03-02 el repositorio tiene:

| Elemento | Estado actual | Objetivo (DoD T-03-03) |
|----------|---------------|-------------------------|
| `backend/prisma/schema.prisma` | ✅ 7 modelos + enum | Sin cambios |
| `backend/prisma/migrations/20260530120258_init/` | ✅ Migración aplicada | Prerequisito |
| `backend/prisma/seed.ts` | ❌ No existe | Script con datos demo deterministas |
| `package.json` → `prisma.seed` | ❌ No configurado | Comando tsx para ejecutar seed |
| `npm run db:seed` | ❌ No existe | Alias de `npx prisma db seed` |
| `GET /api/profile` | ⚠️ Requiere `User` id=1 manual | Usuario demo insertado por seed |
| `docs/development_guide.md` §6 | Manual: insertar User vía Studio/SQL | Documentar seed automático |

Referencias: `docs/data-model.md` (roadmap paso 3), `frontend/src/domain/week.ts` (lunes = `dayIndex` 0), T-03-02 `design.md` (BD vacía post-migración).

**Dependencias previas:** T-02-01 ✅, T-03-01 ✅, T-03-02 ✅.

## Goals / Non-Goals

**Goals:**

- Implementar `backend/prisma/seed.ts` idempotente con usuario, hábitos, semana activa, entradas y recompensas según DoD.
- Registrar seed en Prisma y exponer `npm run db:seed`.
- Permitir `npx prisma migrate reset` con re-seed automático (US-03 Scenario 3).
- Actualizar documentación de setup local.

**Non-goals:**

- Cambios de schema, migraciones, API Express o frontend.
- Seed multi-usuario o datos aleatorios.
- Tests unitarios Vitest del seed.

## Decisions

### 1. Ejecutor del seed: `tsx`

**Decisión:** Usar `tsx` (ya en `devDependencies`) para ejecutar TypeScript directamente:

```json
"prisma": {
  "schema": "backend/prisma/schema.prisma",
  "seed": "tsx backend/prisma/seed.ts"
},
"scripts": {
  "db:seed": "npx prisma db seed"
}
```

**Alternativa descartada:** Compilar seed a JS con `tsc` — paso extra innecesario en monorepo con tsx disponible.

### 2. IDs fijos vs autoincrement

**Decisión:** Usar IDs explícitos para entidades demo estables:

| Entidad | IDs | Notas |
|---------|-----|-------|
| `User` | `1` | Requerido por DoD y `GET /api/profile` |
| `Habit` | `1`, `2`, `3` | Estables entre ejecuciones |
| `Reward` | `1`, `2` | Estables entre ejecuciones |
| `Week` | autoincrement o upsert por `(userId, startDate)` | `startDate` dinámico (lunes actual) |
| `WeekHabit`, `HabitEntry` | autoincrement con upsert lógico | Evitar duplicados por unicidad |

Tras inserts con ID explícito, ejecutar `SELECT setval(...)` sobre secuencias PostgreSQL de `User`, `Habit`, `Reward` para evitar colisiones futuras.

**Alternativa descartada:** Solo autoincrement — datos no deterministas entre resets; dificulta documentación y pruebas curl.

### 3. Datos demo concretos (DoD + distinción puntos/penalización)

**Decisión:** Valores fijos alineados con ejemplos del backlog (`Correr` 10/5):

| Habit | emoji | name | pointsPerDay | penalty |
|-------|-------|------|--------------|---------|
| 1 | 🏃 | Correr | 10 | 5 |
| 2 | 🧘 | Meditar | 5 | 2 |
| 3 | 📚 | Leer | 8 | 3 |

| Reward | emoji | name | description | cost |
|--------|-------|------|-------------|------|
| 1 | 🎉 | Tarde libre | Tarde sin obligaciones | 50 |
| 2 | 🍽️ | Cena especial | Cena fuera en restaurante favorito | 80 |

Usuario: `{ id: 1, email: "demo@ConRutina.app", name: "Demo User" }`.

### 4. Cálculo de semana activa (lunes–domingo)

**Decisión:** Reutilizar la misma lógica que `buildWeekData(0)` en `frontend/src/domain/week.ts`:

```typescript
function getCurrentWeekBounds(now = new Date()): { startDate: Date; endDate: Date } {
  const currentDay = now.getDay()
  const diff = currentDay === 0 ? -6 : 1 - currentDay
  const monday = new Date(now)
  monday.setHours(0, 0, 0, 0)
  monday.setDate(now.getDate() + diff)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  sunday.setHours(23, 59, 59, 999)
  return { startDate: monday, endDate: sunday }
}
```

`Week` se localiza con `userId = 1` + `startDate` del lunes calculado; si no existe, se crea.

**Alternativa descartada:** Semana fija hardcodeada — incumple DoD "semana en curso".

### 5. Estrategia de idempotencia

**Decisión:** Patrón **upsert + guard clauses** en transacción Prisma (`$transaction`):

1. **User:** `upsert` where `id: 1`.
2. **Habit / Reward:** `upsert` por `id` fijo (1–3 / 1–2); `update` sincroniza campos demo.
3. **Week:** `findFirst` where `{ userId: 1, startDate }`; `create` si ausente.
4. **WeekHabit:** por cada hábito, `findFirst` `{ weekId, habitId }`; `create` con snapshots si ausente; `order` 0, 1, 2.
5. **HabitEntry:** por cada `WeekHabit`, bucle `dayIndex` 0–6; `findFirst` o `createMany` con `skipDuplicates` si el schema lo permite; preferir upsert individual para control de `status: pending`.

Segunda ejecución: mismos conteos, sin errores de unique constraint.

**Alternativa descartada:** `deleteMany` + recreate total — más destructivo si el dev modificó datos demo intencionalmente en la misma semana.

### 6. Estructura del fichero seed.ts

**Decisión:** Un único módulo en `backend/prisma/seed.ts`:

```typescript
import { PrismaClient, CompletionStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function main() { /* upserts */ }

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
```

No crear capa Clean Architecture — script de infraestructura Prisma, coherente con convención Prisma oficial.

### 7. Verificación manual (sin tests unitarios)

**Decisión:** Validar en apply mediante:

- `npx prisma db seed` (×2 para idempotencia)
- Consultas SQL o Prisma Studio (conteos)
- `curl GET /api/profile` → usuario demo
- Informe en `openspec/changes/t-03-03-dev-seed/reports/`

Paso curl: **regresión** de API existente; no hay endpoints nuevos.

## Risks / Trade-offs

| Riesgo | Mitigación |
|--------|------------|
| Secuencias PostgreSQL desincronizadas tras IDs fijos | `setval` post-seed documentado en seed.ts |
| Semana distinta si seed corre en otro día | Aceptado por DoD; datos de catálogo siguen deterministas |
| Duplicados si idempotencia falla | Upsert + unique `(weekId, habitId)` en schema |
| `migrate reset` borra datos locales del dev | Comportamiento esperado; seed restaura demo |
| Zona horaria en `startDate` | Normalizar a medianoche local; documentar en informe |

## Migration Plan

1. Crear `backend/prisma/seed.ts` con lógica descrita.
2. Añadir `prisma.seed` y `db:seed` en `package.json`.
3. `npm run db:up` + `npm run db:migrate` (si aplica).
4. `npm run db:seed` — verificar datos.
5. Repetir `npm run db:seed` — verificar idempotencia.
6. (Opcional) `npx prisma migrate reset` — verificar re-seed automático.
7. Actualizar `docs/development_guide.md` y `docs/data-model.md`.
8. Commit al archivar (no durante apply).

**Rollback (dev):** Eliminar seed.ts y entradas `package.json`; `migrate reset --skip-seed`.

## Open Questions

- _(Ninguna crítica)_ — Los valores concretos de emoji/descripción de recompensas no están en el DoD; se fijaron valores razonables y estables en este design.
