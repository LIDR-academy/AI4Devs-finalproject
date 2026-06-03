# Informe de verificación — Paso 5 · T-03-01

**Change:** `t-03-01-prisma-schema`  
**Fecha:** 2026-05-30  
**Rama:** `feature/T-03-01-prisma-schema`  
**Estado:** PASS

## Resumen

Schema Prisma completo del dominio ConRutina: siete modelos, enum `CompletionStatus`, índices del DoD y eliminación del modelo heredado `Calendar`. Documentación actualizada en `docs/data-model.md` y `docs/development_guide.md`.

## Checklist US-03 Scenario 5 (revisión manual 3.3)

| Modelo | Presente | Campos clave |
|--------|----------|--------------|
| `User` | ✅ | `id`, `email` (unique), `name?`, `avatarUrl?`, `createdAt` |
| `Week` | ✅ | `userId`, `startDate`, `endDate`, `isLocked`, `totalPointsEarned`, `totalPenalties`, `createdAt` |
| `Habit` | ✅ | `userId`, `emoji`, `name`, `pointsPerDay`, `penalty`, `isActive`, `createdAt` |
| `WeekHabit` | ✅ | `weekId`, `habitId`, `order`, snapshots, `@@unique([weekId, habitId])` |
| `HabitEntry` | ✅ | `weekHabitId`, `dayIndex`, `status` (enum), `updatedAt` |
| `Reward` | ✅ | `userId`, `emoji`, `name`, `description`, `cost`, `isActive`, `createdAt` |
| `RewardRedemption` | ✅ | `weekId`, `rewardId`, `pointsSpent`, `redeemedAt` |
| `Calendar` | ❌ eliminado | — |

## Tests unitarios (paso 4)

**N/A — ticket de schema Prisma.** No existen tests en el repositorio que referencien `schema.prisma`, modelos Prisma o `@prisma/client`.

## Verificaciones ejecutadas

| ID | Comando / acción | Resultado |
|----|------------------|-----------|
| 3.1 | `npx prisma validate` | PASS — exit code 0; schema válido |
| 3.2 | `npm run prisma:generate` | PASS — cliente v5.22.0 regenerado (primer intento EPERM por API en `:3001` bloqueando `query_engine-windows.dll.node`; resuelto deteniendo el proceso) |
| 3.4 | `npm run typecheck` | PASS — exit code 0 |
| 5.1 | `npm run lint` | PASS — exit code 0 |
| 5.2 | `npm run test` (Vitest) | N/A — `vitest` no instalado en `package.json`; sin tests de schema en el repo |
| 5.3 | `npm run db:up` + `npm run dev:api` | Omitido (opcional) |
| 5.4 | `npm run dev:web` | Omitido (opcional) |

## Pasos N/A

- **Paso curl N/A — T-03-01 no altera la API**
- **Paso E2E N/A — T-03-01 solo afecta schema Prisma**

## Ficheros modificados

- `backend/prisma/schema.prisma` — schema completo del dominio
- `docs/data-model.md` — estado de persistencia y roadmap
- `docs/development_guide.md` — comando `npx prisma validate` en § migraciones

## Notas

- Migración a PostgreSQL (`prisma migrate dev`) queda para **T-03-02**.
- `onDelete`: CASCADE en hijos de `User`/`Week`; `Restrict` en `WeekHabit.habit` y `RewardRedemption.reward` (referencias históricas).
