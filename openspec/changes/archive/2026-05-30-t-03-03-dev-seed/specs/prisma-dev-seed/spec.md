# Spec — prisma-dev-seed

**Ticket:** T-03-03 · **User Story:** US-03

## ADDED Requirements

### Requirement: Script de seed Prisma en el repositorio

El proyecto SHALL incluir `backend/prisma/seed.ts` registrado en la configuración Prisma del monorepo para poblar datos de desarrollo.

#### Scenario: DoD T-03-03 — Fichero seed.ts

- **WHEN** se inspecciona el repositorio tras implementar T-03-03
- **THEN** existe el fichero `backend/prisma/seed.ts`
- **AND** `package.json` raíz define `prisma.seed` apuntando al comando de ejecución del seed (p. ej. `tsx backend/prisma/seed.ts`)
- **AND** existe el script `npm run db:seed` que invoca `npx prisma db seed`

#### Scenario: US-03 Scenario 2 — Ejecución del seed

- **WHEN** existe el fichero `backend/prisma/seed.ts`
- **AND** la migración `init` está aplicada en PostgreSQL
- **AND** se ejecuta `npx prisma db seed` desde la raíz del monorepo
- **THEN** el comando termina con exit code 0
- **AND** se insertan datos de ejemplo en la base de datos

### Requirement: Usuario demo determinista

El seed SHALL crear o actualizar un único usuario de desarrollo con identificador fijo `id = 1`.

#### Scenario: DoD — Usuario demo

- **WHEN** se ejecuta el seed en una BD migrada
- **THEN** existe exactamente un registro `User` con `id = 1`
- **AND** `email = "demo@ConRutina.app"`
- **AND** `name = "Demo User"`

### Requirement: Catálogo de hábitos demo

El seed SHALL insertar tres hábitos activos del usuario demo con nombres y puntuaciones distintas.

#### Scenario: DoD — Tres hábitos

- **WHEN** se ejecuta el seed
- **THEN** existen tres registros `Habit` asociados a `userId = 1`
- **AND** los nombres son `"Correr"`, `"Meditar"` y `"Leer"`
- **AND** cada hábito tiene valores distintos de `pointsPerDay` y `penalty` (todos con `pointsPerDay >= 1` y `penalty >= 0`)
- **AND** cada hábito incluye un `emoji` no vacío

#### Scenario: US-03 Scenario 2 — Mínimo de hábitos

- **WHEN** se ejecuta `npx prisma db seed`
- **THEN** hay al menos 3 hábitos en la base de datos para el usuario demo

### Requirement: Semana activa con entradas semanales

El seed SHALL crear la semana en curso del usuario demo con hábitos vinculados y entradas diarias pendientes.

#### Scenario: DoD — Semana, WeekHabits y HabitEntries

- **WHEN** se ejecuta el seed
- **THEN** existe un registro `Week` para `userId = 1` cuya `startDate` corresponde al lunes 00:00:00 de la semana calendario en curso (zona local del entorno de ejecución)
- **AND** `endDate` corresponde al domingo 23:59:59.999 de esa misma semana
- **AND** existen exactamente 3 registros `WeekHabit` para esa semana (uno por cada hábito demo)
- **AND** cada `WeekHabit` contiene `snapshotName`, `snapshotPoints` y `snapshotPenalty` coherentes con el hábito origen
- **AND** existen exactamente 21 registros `HabitEntry` (7 por cada `WeekHabit`)
- **AND** todos los `HabitEntry` tienen `status = pending`
- **AND** los `dayIndex` cubren 0–6 (lunes–domingo) sin duplicados por `WeekHabit`

### Requirement: Recompensas demo

El seed SHALL insertar dos recompensas activas para el usuario demo.

#### Scenario: DoD — Dos recompensas

- **WHEN** se ejecuta el seed
- **THEN** existen dos registros `Reward` para `userId = 1`
- **AND** una recompensa se llama `"Tarde libre"` con `cost = 50`
- **AND** otra recompensa se llama `"Cena especial"` con `cost = 80`
- **AND** ambas tienen `isActive = true` y campos `emoji` y `description` no vacíos

#### Scenario: US-03 Scenario 2 — Mínimo de recompensas

- **WHEN** se ejecuta `npx prisma db seed`
- **THEN** hay al menos 2 recompensas en la base de datos para el usuario demo

### Requirement: Idempotencia del seed

El seed SHALL ser ejecutable múltiples veces sin duplicar entidades demo ni violar restricciones únicas.

#### Scenario: DoD — Idempotencia

- **WHEN** se ejecuta `npx prisma db seed` dos veces consecutivas sobre la misma BD
- **THEN** ambas ejecuciones terminan con exit code 0
- **AND** tras la segunda ejecución sigue existiendo un único `User` con `id = 1`
- **AND** el número de hábitos demo del usuario 1 sigue siendo 3 (no 6)
- **AND** el número de recompensas demo del usuario 1 sigue siendo 2 (no 4)
- **AND** para la semana en curso sigue habiendo exactamente 3 `WeekHabit` y 21 `HabitEntry`

#### Scenario: US-03 Scenario 2 — Datos deterministas

- **WHEN** se ejecuta el seed en dos máquinas distintas el mismo día calendario
- **THEN** los datos de usuario, hábitos y recompensas son idénticos (mismos ids, nombres, puntos y costes)
- **AND** la semana activa apunta al mismo rango lunes–domingo de la semana en curso

### Requirement: Integración con migrate reset

Tras configurar el seed, `npx prisma migrate reset` SHALL volver a insertar los datos demo automáticamente.

#### Scenario: US-03 Scenario 3 — Reset con seed

- **WHEN** el seed está configurado en `package.json`
- **AND** el desarrollador ejecuta `npx prisma migrate reset` (confirmando el reset)
- **THEN** todas las tablas se eliminan y recrean mediante migraciones
- **AND** los datos de seed se insertan automáticamente al finalizar el reset
- **AND** el usuario demo con `id = 1` existe tras el reset
