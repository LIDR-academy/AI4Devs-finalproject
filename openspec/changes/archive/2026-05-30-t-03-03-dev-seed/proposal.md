# Proposal — T-03-03 · Implementar seed de datos de desarrollo

**Ticket:** T-03-03  
**User Story:** US-03 — Configurar Prisma ORM con esquema inicial y migraciones  
**Sprint:** 0 · Scaffolding e Infraestructura

## Why

Tras T-03-02 las tablas del dominio existen en PostgreSQL, pero la base de datos de desarrollo está vacía (o solo contiene datos ad hoc insertados manualmente). Sin un seed determinista e idempotente, cada desarrollador debe crear a mano usuario, hábitos, semana activa y recompensas para probar la API (`GET /api/profile` espera `userId = 1`) y el flujo semanal. Este ticket cierra US-03 Scenario 2 y habilita `prisma migrate reset` con datos reproducibles (Scenario 3), desbloqueando T-04-xx y pruebas locales consistentes.

## What Changes

- Crear `backend/prisma/seed.ts` con datos de desarrollo **deterministas** e **idempotentes**.
- Insertar usuario demo fijo: `{ id: 1, email: "demo@ConRutina.app", name: "Demo User" }`.
- Insertar 3 hábitos ("Correr", "Meditar", "Leer") con distintos `pointsPerDay` / `penalty`.
- Crear semana activa con `startDate` = lunes de la semana en curso y `endDate` = domingo correspondiente.
- Crear 3 `WeekHabit` (snapshots) y 21 `HabitEntry` (7 por hábito, `status: pending`).
- Insertar 2 recompensas: "Tarde libre" (50 pts) y "Cena especial" (80 pts).
- Configurar Prisma seed en `package.json` (`prisma.seed`) y script `npm run db:seed`.
- Actualizar `docs/development_guide.md` y `docs/data-model.md` (roadmap de persistencia).
- **Estado actual:** no existe `seed.ts`; `package.json` tiene bloque `prisma.schema` pero sin `seed`; migración `20260530120258_init` ✅; schema completo ✅.

## Capabilities

### New Capabilities

- `prisma-dev-seed`: Script de seed Prisma idempotente con usuario demo, hábitos, semana activa, entradas semanales y recompensas; invocable vía `npx prisma db seed` y `npm run db:seed`.

### Modified Capabilities

_(Ninguna — no cambian requisitos normativos de schema ni migración; solo datos iniciales de desarrollo.)_

## Impact

- **Backend / persistencia:** nuevo `backend/prisma/seed.ts`; datos demo en tablas `User`, `Habit`, `Week`, `WeekHabit`, `HabitEntry`, `Reward`.
- **Scripts:** `package.json` — añadir `db:seed` y configuración `prisma.seed` (comando tsx/node).
- **Flujo dev:** `npx prisma migrate reset` ejecutará seed automáticamente; `npm run db:seed` para re-sembrar sin reset.
- **Documentación:** `docs/development_guide.md`, `docs/data-model.md`.
- **Dependencias previas:** T-02-01 (PostgreSQL) ✅, T-03-01 (schema) ✅, T-03-02 (migración init) ✅.
- **Tickets posteriores:** APIs y frontend consumirán datos demo sin setup manual.

## Non-goals

- Nuevos endpoints Express, repositorios ni lógica de negocio (T-04-xx en adelante).
- Cambios en `schema.prisma` o nuevas migraciones.
- Seed de producción o multi-usuario.
- Tests unitarios del seed (el ticket indica validación por integración / entorno local).
- Modificar datos de seed en cada ejecución según fecha (salvo calcular lunes de semana actual para `Week.startDate`).

## Criterios de aceptación (US-03 — alcance T-03-03)

| Escenario Gherkin | Aplicabilidad en T-03-03 |
|-------------------|---------------------------|
| Scenario 1 — Happy path: primera migración | **Prerequisito cumplido** — T-03-02 ✅ |
| Scenario 2 — Seed de desarrollo | **Completo** — `seed.ts`, `npx prisma db seed`, ≥1 usuario, 3 hábitos, 2 recompensas, datos deterministas |
| Scenario 3 — Reset de BD | **Habilitado** — `migrate reset` reinserta seed automáticamente |
| Scenario 4 — Edge case: schema incompleto | **Fuera de alcance** — T-03-01 ✅ |
| Scenario 5 — Lista de verificación de modelos | **Fuera de alcance** — cubierto en T-03-01/T-03-02 |
