# Informe de verificación — Paso 6 · T-03-02

**Change:** `t-03-02-prisma-init-migration`  
**Fecha:** 2026-05-30  
**Rama:** `feature/T-03-02-prisma-init-migration`  
**Estado:** PASS

## Resumen

Migración inicial Prisma `20260530120258_init` generada y aplicada. PostgreSQL contiene las siete tablas del dominio, enum `CompletionStatus`, FK/índices y restricción única en `WeekHabit`. Scripts `db:migrate` y Prisma Studio operativos.

## Estado BD previo

| Elemento | Valor |
| -------- | ----- |
| Tablas públicas | `Calendar`, `User` (legacy pre-T-03-01) |
| `_prisma_migrations` | No existía |
| Decisión | `npx prisma migrate reset --force --skip-seed` para alinear BD al schema actual (sin historial Prisma) |

## Estado BD posterior

| Elemento | Valor |
| -------- | ----- |
| Migración aplicada | `20260530120258_init` |
| Tablas dominio | `User`, `Week`, `Habit`, `WeekHabit`, `HabitEntry`, `Reward`, `RewardRedemption` |
| Enum `CompletionStatus` | `pending`, `completed`, `failed` |
| Índice único `WeekHabit` | `WeekHabit_weekId_habitId_key` sobre (`weekId`, `habitId`) |

## Salida `migrate dev`

```
Applying migration `20260530120258_init`
migrations/
  └─ 20260530120258_init/
    └─ migration.sql
Your database is now in sync with your schema.
```

## Tests unitarios (paso 5)

**N/A — ticket de migración Prisma.** No existen tests que referencien migraciones, `schema.prisma` o conexión Prisma a tablas nuevas.

## Verificaciones ejecutadas

| ID | Comando / acción | Resultado |
|----|------------------|-----------|
| 1.1 | `npm run db:up` + `docker ps` | PASS — `conrutina-db` Up (healthy) |
| 1.2 | `.env` / `DATABASE_URL` | PASS — Prisma cargó variables desde `.env` (localhost:5432/conrutina) |
| 1.3 | `npx prisma validate` | PASS — exit code 0 |
| 2.1 | Reset legacy | PASS — `migrate reset --force --skip-seed` |
| 2.2 | `npx prisma migrate dev --name init` | PASS — carpeta `backend/prisma/migrations/20260530120258_init/` |
| 2.3 | `_prisma_migrations` | PASS — registro `20260530120258_init` |
| 2.4 | `npm run prisma:generate` | PASS — cliente regenerado |
| 3.1–3.2 | Consultas SQL (tablas, enum, unique) | PASS |
| 3.3 | `npx prisma studio` | PASS — disponible en `http://localhost:5555` (7 modelos del dominio) |
| 3.4 | Usuario demo `id=1` | PASS — insertado vía SQL para pruebas de API |
| 4.1–4.2 | `npm run db:migrate` | PASS — "No pending migrations to apply" |
| 6.1 | `npm run lint` | PASS — exit code 0 |
| 6.2 | `npm run test` / `npx vitest run` | N/A — sin ficheros de test en el repo (vitest exit 1 por ausencia de tests) |
| 6.3 | `npm run dev:api` | PASS — API en puerto 3001, conexión Prisma OK |

## Pasos N/A

- **Paso E2E N/A — T-03-02 solo afecta migración Prisma/BD**
- **Paso 6.4 (dev:web)** — omitido; no hay cambios de frontend en este ticket

## Ficheros añadidos / modificados

- `backend/prisma/migrations/20260530120258_init/migration.sql` — DDL inicial
- `backend/prisma/migrations/migration_lock.toml` — lock PostgreSQL
- `docs/data-model.md` — entidades marcadas como migradas
- `docs/development_guide.md` — flujo `migrate dev` / `db:migrate`
