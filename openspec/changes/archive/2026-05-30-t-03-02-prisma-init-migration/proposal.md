# Proposal — T-03-02 · Generar y aplicar primera migración Prisma

**Ticket:** T-03-02  
**User Story:** US-03 — Configurar Prisma ORM con esquema inicial y migraciones  
**Sprint:** 0 · Scaffolding e Infraestructura

## Why

Tras T-03-01 el esquema Prisma define las siete entidades del dominio ConRutina, pero PostgreSQL aún no tiene las tablas correspondientes: no existe la carpeta `backend/prisma/migrations/` y la persistencia real del dominio está bloqueada. Sin la migración inicial versionada (`init`), el equipo no puede reproducir la base de datos en otros entornos, validar restricciones FK/unique en BD ni continuar con seed (T-03-03) ni repositorios de negocio. Este ticket materializa el schema en PostgreSQL y establece el flujo de migraciones del proyecto.

## What Changes

- Ejecutar `npx prisma migrate dev --name init` contra la BD de desarrollo (Docker PostgreSQL de T-02-01) con el schema completo de T-03-01.
- Versionar el SQL generado en `backend/prisma/migrations/<timestamp>_init/`.
- Confirmar que PostgreSQL contiene las tablas: `User`, `Week`, `Habit`, `WeekHabit`, `HabitEntry`, `Reward`, `RewardRedemption`, más el enum `CompletionStatus` y las FK/índices del schema.
- Verificar que `npx prisma studio` lista los siete modelos del dominio.
- Asegurar script `npm run db:migrate` en `package.json` raíz para aplicar migraciones pendientes (`prisma migrate deploy`).
- Actualizar `docs/data-model.md` y `docs/development_guide.md` para reflejar que las entidades están **migradas** a PostgreSQL (no solo definidas en Prisma).
- **Nota sobre estado actual:** `db:migrate` ya existe como `npx prisma migrate deploy`; no hay carpeta `migrations/`; el schema en `backend/prisma/schema.prisma` está completo (T-03-01 ✅).

## Capabilities

### New Capabilities

- `prisma-init-migration`: Primera migración Prisma versionada (`init`), tablas del dominio en PostgreSQL, script `db:migrate` operativo y verificación con Prisma Studio.

### Modified Capabilities

_(Ninguna — `prisma-domain-schema` cubre la definición del schema; este change implementa la migración sin alterar requisitos normativos del schema.)_

## Impact

- **Backend / persistencia:** nueva carpeta `backend/prisma/migrations/` con migración `init`; estado real de tablas en PostgreSQL.
- **Scripts:** `package.json` — verificar/ajustar `db:migrate` si hace falta alinearlo con el flujo documentado.
- **Cliente Prisma:** `npm run prisma:generate` tras migración (regeneración automática con `migrate dev`).
- **Documentación:** `docs/data-model.md` (estado de persistencia), `docs/development_guide.md` (flujo migrate dev / db:migrate).
- **Dependencias previas:** T-02-01 (PostgreSQL Docker) ✅, T-03-01 (schema completo) ✅.
- **Tickets posteriores:** T-03-03 (seed), T-04-xx (APIs con repositorios sobre tablas reales).

## Non-goals

- Implementar `backend/prisma/seed.ts` ni script `db:seed` (T-03-03).
- Cambios en `schema.prisma` salvo ajustes mínimos imprescindibles si Prisma detectara drift (no esperado tras T-03-01).
- Nuevos endpoints Express, repositorios de dominio ni frontend.
- `prisma migrate reset` con seed automático (requiere T-03-03).
- CI/CD de migraciones en producción.
- Pruebas unitarias de migración (el ticket indica verificación manual/integración con BD).

## Criterios de aceptación (US-03 — alcance T-03-02)

| Escenario Gherkin | Aplicabilidad en T-03-02 |
|-------------------|---------------------------|
| Scenario 1 — Happy path: primera migración | **Completo** — `migrate dev --name init`, tablas en PostgreSQL, FK/restricciones |
| Scenario 2 — Seed de desarrollo | **Fuera de alcance** — T-03-03 |
| Scenario 3 — Reset de BD | **Fuera de alcance** — requiere seed (T-03-03); migración `init` es prerequisito |
| Scenario 4 — Edge case: schema incompleto | **Referencia** — T-03-01 ya cumplido; no proceder si `prisma validate` falla |
| Scenario 5 — Lista de verificación de modelos | **Verificación en BD** — tablas creadas tras migración; detalle de campos ya cubierto en T-03-01 |
