# Design — T-03-01 · Instalar Prisma y definir esquema completo (todos los modelos del PRD)

**Ticket:** T-03-01 · **User Story:** US-03 · **Change:** `t-03-01-prisma-schema`

## Context

Tras T-02-01 PostgreSQL 16 está disponible vía `npm run db:up`. El repositorio ya incluye Prisma 5 en dependencias raíz, bloque `prisma.schema` en `package.json` y un esquema parcial en `backend/prisma/schema.prisma`:

| Elemento | Estado actual | Objetivo (DoD T-03-01) |
|----------|---------------|-------------------------|
| `prisma` / `@prisma/client` | ✅ Instalados en `package.json` raíz | Verificar versiones; no duplicar en `backend/package.json` |
| `prisma.schema` en package.json | ✅ `"backend/prisma/schema.prisma"` | Sin cambio |
| Datasource | ✅ `postgresql` + `DATABASE_URL` | Sin cambio |
| Modelo `User` | ⚠️ Solo `id`, `email`, `name` | Añadir `avatarUrl`, `createdAt`; relaciones 1:N |
| Modelo `Calendar` | ⚠️ Heredado LTI (fuera de dominio) | **Eliminar** del schema |
| `Week`, `Habit`, `WeekHabit`, `HabitEntry`, `Reward`, `RewardRedemption` | ❌ Ausentes | Definir según PRD §5.1 |
| Enum `CompletionStatus` | ❌ Ausente | `pending`, `completed`, `failed` |
| Índices / unique compuesto | ❌ Ausentes | Según DoD del ticket |
| `prisma validate` | ⚠️ Pasa con schema incompleto | Debe pasar con schema completo |
| Migraciones | ❌ Sin carpeta `migrations/` | **Fuera de alcance** (T-03-02) |

Referencias: `docs/prd.md` §5.1, `docs/data-model.md`, `docs/backend-standards.md` (Esquema Prisma), `backend/prisma/schema.prisma`, `backend/src/infrastructure/prismaUserRepository.ts` (solo usa `User` hoy).

**Dependencia previa:** T-02-01 (Docker PostgreSQL) — ✅ implementado.

## Goals / Non-Goals

**Goals:**

- Entregar `backend/prisma/schema.prisma` con los 7 modelos del dominio, relaciones, enum, defaults e índices del DoD.
- Eliminar `Calendar` para alinear el schema al producto ConRutina.
- Pasar `npx prisma validate` y regenerar cliente con `npm run prisma:generate`.
- Actualizar `docs/data-model.md` con el estado de persistencia tras el schema.

**Non-Goals:**

- `prisma migrate dev`, carpeta `migrations/` (T-03-02).
- `seed.ts`, `db:seed` (T-03-03).
- Cambios en repositorios, API o frontend.
- Tests unitarios del schema.

## Decisions

### 1. Ubicación y configuración Prisma (monorepo raíz)

**Decisión:** Mantener Prisma CLI y cliente en `package.json` raíz con:

```json
"prisma": {
  "schema": "backend/prisma/schema.prisma"
}
```

Comandos desde la raíz: `npx prisma validate`, `npm run prisma:generate`.

**Alternativa descartada:** Mover Prisma a `backend/package.json` — el monorepo ya centraliza scripts y dependencias en la raíz (T-01-01).

### 2. Eliminar modelo `Calendar`

**Decisión:** Quitar por completo el model `Calendar` del schema. No forma parte del PRD ni de `docs/data-model.md`.

**Alternativa descartada:** Mantener `Calendar` temporalmente — generaría tablas irrelevantes en T-03-02 y confusión en documentación.

**Impacto:** Si existiera tabla `Calendar` en BD local (p. ej. vía `db push` previo), T-03-02 la eliminará en la migración `init`.

### 3. Enum `CompletionStatus`

**Decisión:** Definir en Prisma:

```prisma
enum CompletionStatus {
  pending
  completed
  failed
}
```

Campo `HabitEntry.status` de tipo `CompletionStatus` con default `pending`.

**Alternativa descartada:** `String` con check constraint — menos type-safe en cliente generado.

### 4. Modelos y relaciones (borrador objetivo)

Convenciones: modelos PascalCase, campos camelCase (`backend-standards.md`). FK con `@relation` explícitas y `onDelete` coherente con dominio (CASCADE en hijos de `User`/`Week`).

```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  avatarUrl String?
  createdAt DateTime @default(now())
  weeks     Week[]
  habits    Habit[]
  rewards   Reward[]
}

model Week {
  id                Int      @id @default(autoincrement())
  userId            Int
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  startDate         DateTime
  endDate           DateTime
  isLocked          Boolean  @default(false)
  totalPointsEarned Int      @default(0)
  totalPenalties    Int      @default(0)
  createdAt         DateTime @default(now())
  weekHabits        WeekHabit[]
  rewardRedemptions RewardRedemption[]

  @@index([userId, startDate])
}

model Habit {
  id           Int      @id @default(autoincrement())
  userId       Int
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  emoji        String
  name         String
  pointsPerDay Int
  penalty      Int
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
  weekHabits   WeekHabit[]
}

model WeekHabit {
  id              Int         @id @default(autoincrement())
  weekId          Int
  week            Week        @relation(fields: [weekId], references: [id], onDelete: Cascade)
  habitId         Int
  habit           Habit       @relation(fields: [habitId], references: [id], onDelete: Restrict)
  order           Int
  snapshotName    String
  snapshotPoints  Int
  snapshotPenalty Int
  habitEntries    HabitEntry[]

  @@unique([weekId, habitId])
  @@index([weekId])
}

model HabitEntry {
  id          Int              @id @default(autoincrement())
  weekHabitId Int
  weekHabit   WeekHabit        @relation(fields: [weekHabitId], references: [id], onDelete: Cascade)
  dayIndex    Int
  status      CompletionStatus @default(pending)
  updatedAt   DateTime         @updatedAt

  @@index([weekHabitId])
}

model Reward {
  id          Int      @id @default(autoincrement())
  userId      Int
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  emoji       String
  name        String
  description String
  cost        Int
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  redemptions RewardRedemption[]
}

model RewardRedemption {
  id          Int      @id @default(autoincrement())
  weekId      Int
  week        Week     @relation(fields: [weekId], references: [id], onDelete: Cascade)
  rewardId    Int
  reward      Reward   @relation(fields: [rewardId], references: [id], onDelete: Restrict)
  pointsSpent Int
  redeemedAt  DateTime @default(now())

  @@index([weekId])
}
```

Nota: `onDelete` en `WeekHabit.habit` y `RewardRedemption.reward` como `Restrict` evita borrar hábitos/recompensas referenciados en histórico; ajustable en apply si el equipo prefiere `Cascade` (no exigido por DoD).

### 5. Índices y restricciones (DoD)

| Modelo | Restricción |
|--------|-------------|
| `Week` | `@@index([userId, startDate])` |
| `WeekHabit` | `@@index([weekId])`, `@@unique([weekId, habitId])` |
| `HabitEntry` | `@@index([weekHabitId])` |
| `RewardRedemption` | `@@index([weekId])` |

**Edge case (ticket):** `@@unique([weekId, habitId])` impide duplicar el mismo hábito en una semana.

### 6. Verificación en apply (schema only)

**Decisión:** Pruebas ejecutadas por el agente:

1. `npx prisma validate` → exit 0.
2. `npm run prisma:generate` → cliente regenerado sin errores.
3. Revisión manual del schema vs tabla US-03 Scenario 5 y PRD §5.1.
4. `npm run lint` y `npm run typecheck` — confirmar que `@prisma/client` ampliado no rompe `backend/src` (p. ej. `prismaUserRepository.ts`).

No ejecutar `migrate dev` ni levantar API con tablas nuevas (aún no existen hasta T-03-02). Paso curl: **N/A** (sin cambios API). E2E: **N/A**.

### 7. Documentación

**Decisión:** Actualizar `docs/data-model.md`:

- Tabla "Estado de persistencia": marcar entidades como **Definidas en Prisma** (pendiente de migración a PostgreSQL hasta T-03-02).
- Eliminar o acortar nota sobre `Calendar`.
- Mantener mapeo frontend provisional hasta APIs de persistencia.

## Risks / Trade-offs

| Riesgo | Mitigación |
|--------|------------|
| Eliminar `Calendar` rompe BD local con tabla legacy | Documentar; T-03-02 migración limpia o `migrate reset` en dev |
| Schema completo sin migración — API sigue sin tablas nuevas | Alcance explícito T-03-01; T-03-02 crea tablas |
| `prismaUserRepository` no usa nuevos campos aún | Compatible; `User` ampliado es superset |
| Tipos generados cambian tras `prisma generate` | Ejecutar `typecheck` en apply |

## Migration Plan

1. Editar `backend/prisma/schema.prisma` con modelos completos.
2. `npx prisma validate` y `npm run prisma:generate`.
3. Actualizar `docs/data-model.md`.
4. **Siguiente ticket:** T-03-02 ejecutará `npx prisma migrate dev --name init` contra BD Docker.

Rollback: restaurar `schema.prisma` desde Git; `prisma generate` con schema anterior.

## Open Questions

- Ninguna bloqueante. En apply, confirmar si conviene `@@unique([weekHabitId, dayIndex])` en `HabitEntry` (no exigido por DoD; opcional para evitar dos entradas el mismo día — puede dejarse para ticket futuro).
