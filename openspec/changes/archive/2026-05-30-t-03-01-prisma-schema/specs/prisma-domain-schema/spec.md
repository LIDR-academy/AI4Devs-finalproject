# Spec — prisma-domain-schema

**Ticket:** T-03-01 · **User Story:** US-03

## ADDED Requirements

### Requirement: Esquema Prisma con datasource PostgreSQL

El repositorio SHALL mantener `backend/prisma/schema.prisma` con `generator client` (`prisma-client-js`) y `datasource db` con `provider = "postgresql"` y `url = env("DATABASE_URL")`. El bloque `prisma.schema` en `package.json` raíz SHALL apuntar a `backend/prisma/schema.prisma`.

#### Scenario: DoD T-03-01 — Configuración base Prisma

- **WHEN** se inspecciona `backend/prisma/schema.prisma` y `package.json` raíz
- **THEN** el datasource usa PostgreSQL y la variable `DATABASE_URL`
- **AND** las dependencias `prisma` y `@prisma/client` están declaradas en el monorepo raíz
- **AND** `npx prisma validate` termina con código de salida 0

### Requirement: Modelos de dominio completos según PRD §5.1

El schema SHALL definir exactamente los modelos de dominio ConRutina: `User`, `Week`, `Habit`, `WeekHabit`, `HabitEntry`, `Reward`, `RewardRedemption`, con los campos clave indicados en US-03 Scenario 5 y el PRD. El schema SHALL NOT incluir el modelo heredado `Calendar`.

#### Scenario: US-03 Scenario 5 — Lista de verificación de modelos

- **WHEN** se revisa `backend/prisma/schema.prisma`
- **THEN** existen los modelos `User`, `Week`, `Habit`, `WeekHabit`, `HabitEntry`, `Reward`, `RewardRedemption`
- **AND** `User` incluye `id`, `email` (unique), `name?`, `avatarUrl?`, `createdAt`
- **AND** `Week` incluye `id`, `userId` (FK), `startDate`, `endDate`, `isLocked`, `totalPointsEarned`, `totalPenalties`, `createdAt`
- **AND** `Habit` incluye `id`, `userId` (FK), `emoji`, `name`, `pointsPerDay`, `penalty`, `isActive`, `createdAt`
- **AND** `WeekHabit` incluye `id`, `weekId` (FK), `habitId` (FK), `order`, `snapshotName`, `snapshotPoints`, `snapshotPenalty`
- **AND** `HabitEntry` incluye `id`, `weekHabitId` (FK), `dayIndex`, `status`, `updatedAt`
- **AND** `Reward` incluye `id`, `userId` (FK), `emoji`, `name`, `description`, `cost`, `isActive`, `createdAt`
- **AND** `RewardRedemption` incluye `id`, `weekId` (FK), `rewardId` (FK), `pointsSpent`, `redeemedAt`
- **AND** no existe el modelo `Calendar`

#### Scenario: US-03 Scenario 1 — Schema listo para migración (alcance schema)

- **WHEN** el fichero `backend/prisma/schema.prisma` contiene todos los modelos del PRD
- **THEN** `npx prisma validate` confirma que el schema es válido
- **AND** el schema está preparado para que T-03-02 ejecute `npx prisma migrate dev --name init` (sin ejecutar migración en T-03-01)

### Requirement: Enum CompletionStatus para entradas diarias

El schema SHALL declarar `enum CompletionStatus { pending completed failed }` y el campo `HabitEntry.status` SHALL ser de ese tipo.

#### Scenario: Estados de hábito por día

- **WHEN** se inspecciona el modelo `HabitEntry` en el schema
- **THEN** el campo `status` usa el enum `CompletionStatus`
- **AND** los valores permitidos son `pending`, `completed` y `failed`

### Requirement: Valores por defecto en campos booleanos y contadores

Los modelos SHALL aplicar los defaults exigidos por el DoD de T-03-01.

#### Scenario: DoD — Defaults de Week, Habit y contadores

- **WHEN** se inspeccionan los campos con `@default` en el schema
- **THEN** `Week.isLocked` tiene `@default(false)`
- **AND** `Week.totalPointsEarned` tiene `@default(0)`
- **AND** `Week.totalPenalties` tiene `@default(0)`
- **AND** `Habit.isActive` tiene `@default(true)`
- **AND** `Reward.isActive` tiene `@default(true)`

### Requirement: Índices y unicidad en tablas relacionadas

El schema SHALL incluir los índices del DoD y la restricción única compuesta en `WeekHabit` para evitar duplicar un hábito en la misma semana.

#### Scenario: DoD — Índices declarados

- **WHEN** se inspeccionan los bloques `@@index` y `@@unique` del schema
- **THEN** `Week` tiene `@@index([userId, startDate])`
- **AND** `WeekHabit` tiene `@@index([weekId])`
- **AND** `HabitEntry` tiene `@@index([weekHabitId])`
- **AND** `RewardRedemption` tiene `@@index([weekId])`

#### Scenario: Edge case T-03-01 — Hábito duplicado en la misma semana

- **WHEN** se inspecciona el modelo `WeekHabit`
- **THEN** existe `@@unique([weekId, habitId])`
- **AND** la base de datos (tras T-03-02) rechazará dos filas con el mismo par `weekId` + `habitId`

### Requirement: Validación del schema sin migración

El proyecto SHALL poder validar y regenerar el cliente Prisma sin aplicar migraciones en el alcance de T-03-01.

#### Scenario: US-03 Scenario 4 — Schema válido (inverso del edge case incompleto)

- **WHEN** el schema incluye todos los modelos requeridos
- **AND** se ejecuta `npx prisma validate`
- **THEN** el comando termina sin errores descriptivos sobre entidades faltantes
- **AND** `npm run prisma:generate` regenera `@prisma/client` sin fallos

#### Scenario: US-03 Scenario 4 — Detección de schema incompleto (referencia)

- **WHEN** un modelo requerido (p. ej. `HabitEntry`) estuviera ausente del schema
- **AND** se ejecutara `npx prisma validate` o revisión contra US-03 Scenario 5
- **THEN** el schema no cumpliría T-03-01 hasta corregir la omisión
- **AND** T-03-02 no debería proceder con migración hasta cumplir el DoD de T-03-01
