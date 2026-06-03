# Spec — prisma-init-migration

**Ticket:** T-03-02 · **User Story:** US-03

## ADDED Requirements

### Requirement: Migración inicial versionada en el repositorio

El proyecto SHALL crear la primera migración Prisma con nombre `init` y versionar el SQL generado bajo `backend/prisma/migrations/`.

#### Scenario: DoD T-03-02 — Creación de migración init

- **WHEN** el schema en `backend/prisma/schema.prisma` cumple el DoD de T-03-01
- **AND** PostgreSQL de desarrollo está accesible vía `DATABASE_URL`
- **AND** el desarrollador ejecuta `npx prisma migrate dev --name init` desde la raíz del monorepo
- **THEN** se crea un directorio bajo `backend/prisma/migrations/` con sufijo `_init`
- **AND** el directorio contiene `migration.sql` con DDL de las tablas del dominio
- **AND** la tabla `_prisma_migrations` registra la migración `init` como aplicada

#### Scenario: US-03 Scenario 1 — Happy path primera migración

- **WHEN** el fichero `backend/prisma/schema.prisma` contiene todos los modelos del PRD
- **AND** se ejecuta `npx prisma migrate dev --name init`
- **THEN** se crea la migración en `backend/prisma/migrations/`
- **AND** PostgreSQL contiene todas las tablas: `User`, `Week`, `Habit`, `WeekHabit`, `HabitEntry`, `Reward`, `RewardRedemption`
- **AND** todas las claves foráneas y restricciones del schema están definidas en la base de datos

### Requirement: Tablas del dominio materializadas en PostgreSQL

Tras aplicar la migración `init`, PostgreSQL SHALL reflejar el modelo relacional ConRutina con enum, índices y unicidad compuesta definidos en el schema.

#### Scenario: DoD — Tablas y enum en BD

- **WHEN** la migración `init` está aplicada en la BD de desarrollo
- **AND** se consulta el catálogo de PostgreSQL (p. ej. `\dt` en psql o Prisma Studio)
- **THEN** existen las siete tablas del dominio listadas en US-03 Scenario 5
- **AND** existe el tipo enum `CompletionStatus` con valores `pending`, `completed`, `failed`
- **AND** la restricción única compuesta en `WeekHabit` (`weekId`, `habitId`) está activa en BD

#### Scenario: Edge case — Schema incompleto bloquea migración

- **WHEN** el schema no cumple T-03-01 (p. ej. falta un modelo requerido)
- **AND** se intenta `npx prisma migrate dev --name init`
- **THEN** Prisma no debe producir una migración válida del dominio completo
- **AND** el equipo debe corregir el schema antes de versionar la migración `init`

### Requirement: Script npm para aplicar migraciones

El monorepo SHALL exponer `npm run db:migrate` en `package.json` raíz para aplicar migraciones pendientes en entornos donde ya existen ficheros en `backend/prisma/migrations/`.

#### Scenario: DoD — Script db:migrate

- **WHEN** se inspecciona `package.json` raíz
- **THEN** existe el script `db:migrate`
- **AND** el script ejecuta `npx prisma migrate deploy` (o equivalente documentado) usando el schema en `backend/prisma/schema.prisma`
- **AND** tras clonar el repo y levantar PostgreSQL, `npm run db:migrate` aplica la migración `init` sin errores

### Requirement: Verificación con Prisma Studio

Tras la migración inicial, Prisma Studio SHALL mostrar todos los modelos del dominio para inspección manual de datos.

#### Scenario: DoD — Prisma Studio lista modelos

- **WHEN** la migración `init` está aplicada
- **AND** se ejecuta `npx prisma studio` desde la raíz
- **THEN** la interfaz muestra los modelos `User`, `Week`, `Habit`, `WeekHabit`, `HabitEntry`, `Reward`, `RewardRedemption`
- **AND** cada modelo permite abrir la vista de registros (vacía o con datos existentes)
