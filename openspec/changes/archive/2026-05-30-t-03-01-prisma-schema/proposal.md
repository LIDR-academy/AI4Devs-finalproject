# Proposal — T-03-01 · Instalar Prisma y definir esquema completo (todos los modelos del PRD)

**Ticket:** T-03-01  
**User Story:** US-03 — Configurar Prisma ORM con esquema inicial y migraciones  
**Sprint:** 0 · Scaffolding e Infraestructura

## Why

ConRutina necesita persistir usuarios, semanas, hábitos, entradas diarias y recompensas en PostgreSQL. Tras T-02-01 el contenedor `db` está operativo, pero el esquema Prisma actual solo define un `User` parcial y un modelo heredado `Calendar` ajeno al dominio. Sin el esquema completo del PRD (§5.1), no pueden implementarse repositorios, migraciones ni seed (T-03-02, T-03-03) ni ninguna API de negocio. Este ticket establece la fuente única de verdad del modelo relacional antes de versionar la primera migración.

## What Changes

- Completar `backend/prisma/schema.prisma` con datasource PostgreSQL y **todos** los modelos del PRD: `User`, `Week`, `Habit`, `WeekHabit`, `HabitEntry`, `Reward`, `RewardRedemption`.
- Añadir enum `CompletionStatus { pending completed failed }` para `HabitEntry.status`.
- Definir valores por defecto del DoD: `isLocked @default(false)`, `isActive @default(true)`, `totalPointsEarned @default(0)`, `totalPenalties @default(0)`.
- Definir índices e índice compuesto único `@@unique([weekId, habitId])` en `WeekHabit`.
- Ampliar `User` con `avatarUrl` y `createdAt` según PRD; **eliminar** el modelo heredado `Calendar` (no pertenece a ConRutina).
- Confirmar dependencias `prisma` y `@prisma/client` en `package.json` raíz y bloque `prisma.schema` apuntando a `backend/prisma/schema.prisma`.
- Ejecutar `npx prisma validate` y `npm run prisma:generate` para verificar el schema (sin crear migración en este ticket).
- **Nota sobre estado actual:** Prisma ya está instalado y existe un `schema.prisma` mínimo; el apply debe converger al DoD de T-03-01 sin ejecutar `migrate dev` (alcance de T-03-02).

## Capabilities

### New Capabilities

- `prisma-domain-schema`: Esquema Prisma completo del dominio ConRutina — modelos, relaciones, enum `CompletionStatus`, defaults, índices y restricción única `WeekHabit`; validación con `prisma validate`.

### Modified Capabilities

_(Ninguna — no se alteran requisitos normativos en `openspec/specs/`; las capacidades existentes (`docker-postgres-dev`, etc.) no cambian de comportamiento.)_

## Impact

- **Backend / persistencia:** `backend/prisma/schema.prisma` (reescritura/ampliación del esquema).
- **Dependencias:** `prisma`, `@prisma/client` en `package.json` raíz (verificar versiones ya presentes).
- **Cliente generado:** `npm run prisma:generate` tras cambios de schema; `@prisma/client` tipos ampliados (sin cambio de código de aplicación obligatorio en este ticket).
- **Documentación:** actualizar `docs/data-model.md` para reflejar modelos definidos en Prisma (paso obligatorio en apply).
- **Dependencias previas:** T-02-01 (PostgreSQL Docker) — ✅ implementado.
- **Tickets posteriores:** T-03-02 (primera migración `init`), T-03-03 (seed), T-04-xx (APIs).

## Non-goals

- Ejecutar `prisma migrate dev` ni crear carpeta `backend/prisma/migrations/` (T-03-02).
- Implementar `backend/prisma/seed.ts` ni script `db:seed` (T-03-03).
- Cambios en endpoints Express, repositorios de infraestructura ni frontend.
- Pruebas unitarias del schema (el ticket indica validación con `prisma validate` y revisión manual).
- CI/CD, despliegue o Dockerfile de producción.

## Criterios de aceptación (US-03 — alcance T-03-01)

| Escenario Gherkin | Aplicabilidad en T-03-01 |
|-------------------|---------------------------|
| Scenario 1 — Happy path: schema con todos los modelos + `migrate dev` | **Parcial** — solo la parte del schema completo; la migración es T-03-02 |
| Scenario 2 — Seed de desarrollo | **Fuera de alcance** — T-03-03 |
| Scenario 3 — Reset de BD | **Fuera de alcance** — requiere migraciones y seed (T-03-02/03) |
| Scenario 4 — Edge case: schema incompleto, `prisma validate` | **Completo** — el schema final debe pasar validate |
| Scenario 5 — Lista de verificación de modelos y campos clave | **Completo** — todos los modelos y campos del PRD en `schema.prisma` |
