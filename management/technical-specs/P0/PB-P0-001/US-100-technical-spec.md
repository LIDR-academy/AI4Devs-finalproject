# Technical Specification — US-100: Generar baseline migration Prisma y operar flujo `migrate dev` / `migrate deploy`

## 1. Metadata

| Field | Value |
|---|---|
| User Story ID | US-100 |
| Source User Story | `management/user-stories/US-100-prisma-migrations.md` |
| Decision Resolution Artifact | `management/user-stories/decision-resolutions/US-100-decision-resolution.md` |
| Priority | P0 |
| Backlog ID | PB-P0-001 |
| Backlog Title | Database Schema, Migrations & Constraints — Implementar schema Prisma + PostgreSQL alineado al Domain Data Model |
| Backlog Execution Order | 1 (primer ítem P0 del backlog) — US-100 es la posición 2 dentro del ítem |
| User Story Position in Backlog Item | 2 of 4 |
| Related User Stories in Backlog Item | US-099, US-100, US-101, US-102 |
| Epic | EPIC-DB-001 — Database & Prisma Physical Model |
| Backlog Item Dependencies | — (foundation); US-100 depende fuertemente de US-099 (mergeado) |
| Feature | Prisma Migrations — baseline + multi-environment |
| Module / Domain | Platform / DB |
| User Story Status | Approved (2026-06-10) |
| Backlog Alignment Status | **Found** |
| Technical Spec Status | **Ready for Task Breakdown** |
| Created Date | 2026-06-10 |
| Last Updated | 2026-06-10 |

---

## 2. Backlog Execution Context

### Product Backlog Item

`PB-P0-001 — Database Schema, Migrations & Constraints` (P0, EPIC-DB-001). Es el primer ítem P0 del backlog y cubre la fundación completa de persistencia EventFlow: schema declarativo (US-099 — `Approved`), migraciones reproducibles (US-100 — esta historia), índices críticos (US-101) y enforcement de los 62 constraints (US-102).

### Execution Order Rationale

US-100 se ejecuta como posición 2 de 4 dentro de `PB-P0-001` porque:

- Es precondición fuerte para US-101 y US-102: ambas agregan archivos migration adicionales que **deben** llegar después de la baseline `<ts>_init/migration.sql`.
- Sin migraciones aplicables, el backend (PB-P0-002+) no puede operar contra una BD real; CI tests de integración fallarían.
- Sin la baseline migration, el provisioning RDS (US-137) no tiene nada que ejecutar en `migrate deploy`.
- EPIC-SEED-001 (US-085 Run seed script) depende de las migraciones aplicadas para insertar fixtures.
- US-099 (`Approved` 2026-06-09) ya entregó `prisma/schema.prisma` validado; los 19 modelos + 14 enums están listos para materializarse.
- Mitiga directamente el riesgo R-14 del backlog ("Migraciones Prisma rompen entornos") al introducir drift detection en CI y smoke test en DB ephemeral.

### Related User Stories in Same Backlog Item

| User Story | Role in Backlog Item | Suggested Order |
|---|---|---|
| US-099 | Schema Prisma declarativo + Prisma Client | 1 (Approved) |
| **US-100** | Baseline init migration schema-only + `migrate dev`/`migrate deploy` + drift detection + smoke CI | **2** |
| US-101 | Migration(s) con raw SQL para índices funcionales / GIN / parciales | 3 |
| US-102 | Migration(s) con raw SQL para check constraints, unique parciales, enforcement append-only | 4 |

---

## 3. Executive Technical Summary

US-100 entrega los siguientes artefactos técnicos en un único PR:

- **Baseline init migration** `prisma/migrations/<YYYYMMDDHHMMSS>_init/migration.sql` derivada exclusivamente del schema declarado en US-099 (sin raw SQL para indices/constraints).
- **Scripts npm** `db:migrate:dev`, `db:migrate:deploy`, `db:migrate:status`, `db:migrate:diff` en `package.json` del backend.
- **Wrapper script env-aware** que bloquea `prisma migrate reset` en CI/QA/Demo (permitido únicamente en local).
- **Job CI `prisma-migrate-diff`** que ejecuta `prisma migrate diff --from-migrations ./prisma/migrations --to-schema-datamodel ./prisma/schema.prisma --exit-code` en cada PR (drift detection PR-time).
- **Job CI `prisma-migrate-smoke`** que levanta un service container PostgreSQL en GitHub Actions, ejecuta `prisma migrate deploy` y verifica vía `information_schema.tables` + `information_schema.types` que existen las 19 tablas + 14 enums esperados.
- **Secret scan defensivo** en CI sobre `prisma/migrations/` para detectar `DATABASE_URL=`, cadenas de conexión hardcodeadas, claves API o credenciales.
- **Sección `Database Migrations`** en el README del backend documentando los comandos cotidianos, la política forward-only y el bloqueo de `migrate reset` en pipelines, con referencia a Doc 21 §10 como source of truth operativa.

La política rectora es **forward-only canónico Prisma** (alineada con ADR-DB-005): correcciones se aplican vía migraciones correctivas adicionales; archivos migration mergeados son inmutables.

---

## 4. Scope Boundary

### In Scope

- Generación de la baseline init migration vía `npx prisma migrate dev --create-only --name init`.
- Verificación de contenido del `migration.sql`: 19 `CREATE TABLE` + 14 `CREATE TYPE ... AS ENUM` + foreign keys con `ON DELETE RESTRICT` (default) y `ON DELETE CASCADE` exclusivamente en `budget_items.budget_id`.
- Scripts npm `db:migrate:dev`, `db:migrate:deploy`, `db:migrate:status`, `db:migrate:diff`.
- Wrapper script `scripts/db-migrate-reset.sh` (o equivalente) env-aware con guard sobre `CI=true` y `NODE_ENV`.
- Job CI `prisma-migrate-diff` (drift detection) en `.github/workflows/ci.yml`.
- Job CI `prisma-migrate-smoke` con PostgreSQL service container.
- Job CI secret scan defensivo sobre `prisma/migrations/`.
- Documentación: sección `Database Migrations` en el README backend con matriz de entornos (citando Doc 21 §10) + política forward-only + bloqueo `migrate reset`.
- Tests estructurales sobre `migration.sql` (presencia de 19 `CREATE TABLE`, 14 enums, ausencia de raw SQL para indices/constraints).
- Tests negativos NT-01..NT-06.
- Verificación de que `migration.sql` NO contiene `DATABASE_URL` ni secretos.

### Out of Scope

- Raw SQL para índices funcionales / GIN / parciales → **US-101**.
- Raw SQL para check constraints, unique parciales, enforcement append-only sobre `ai_prompt_versions` → **US-102**.
- Integración con pipeline CD (despliegue automático `migrate deploy` a QA/Demo/prod, orquestación de release, pre/post hooks) → **US-139**.
- Provisioning RDS y configuración real de `DATABASE_URL` en entornos no-locales → **US-137**.
- Snapshot/backup automático previo a `migrate deploy` → **US-137 / US-139**.
- Seed real, fixtures, `prisma/seed.ts` → **EPIC-SEED-001** (US-085, US-086, US-087, US-088).
- Down migrations / rollback automático (no soportado por Prisma — política forward-only).
- Connection pooling, `$queryRaw` en código de aplicación, runtime SQL.
- Configuración de PgBouncer, Aurora-specific tuning, particionamiento, sharding.

### Explicit Non-Goals

- No proveer mecanismo de rollback automático.
- No introducir el seed real ni declarar fixtures.
- No tocar infraestructura RDS ni `DATABASE_URL` real.
- No introducir endpoints REST, controllers ni use cases.
- No declarar índices ni constraints físicos complejos (delegado a US-101/US-102).
- No introducir IA, autenticación runtime, ni autorización runtime.

---

## 5. Architecture Alignment

### Backend Architecture

- El directorio `prisma/migrations/<YYYYMMDDHHMMSS>_init/` se ubica dentro del módulo backend (alineado con la ubicación de `prisma/schema.prisma` definida en US-099 §5).
- Los scripts npm viven en el `package.json` del backend.
- El wrapper script env-aware vive en `apps/backend/scripts/` o equivalente.
- Sin cambios en la capa de aplicación (use cases, controllers); esta historia es 100% infraestructura DB.
- Alineado con ADR-BE-001 (Node.js + Express + TypeScript) y la arquitectura Modular Monolith.

### Frontend Architecture

`No aplica` — esta historia no toca el frontend.

### Database Architecture

- PostgreSQL 14+ como motor (ADR-DB-001).
- Prisma como mecanismo único de gestión del esquema (ADR-DB-005).
- Migraciones forward-only: correcciones vía nuevas migrations (no edición retroactiva).
- Archivos migration mergeados son inmutables (VR-05).
- Raw SQL NO se incluye en US-100 (delegado a US-101/US-102 según ADR-DB-005 implementation guidance).
- El comando único oficial de generación es `prisma migrate dev --create-only --name init`.

### API Architecture

`No aplica` — esta historia es declarativa/infraestructura.

### AI / PromptOps Architecture

`No aplica` — esta historia no toca IA.

### Security Architecture

- `migration.sql` NO contiene `DATABASE_URL`, contraseñas ni cadenas de conexión reales (SEC-01).
- `DATABASE_URL` vive en env vars / Secrets Manager (SEC-02; alineado con US-099 y US-138 — Configure Secrets Manager).
- Logs CI no imprimen `DATABASE_URL` ni payloads sensibles (SEC-03).
- Ejecución de `migrate deploy` en QA/Demo limitada al pipeline CD (SEC-04, enforcement detallado en US-139).
- `prisma migrate reset` bloqueado en CI/QA/Demo via wrapper script env-aware (SEC-05).

### Testing Architecture

- Stack: Vitest (estructural sobre `migration.sql`) + jobs CI nativos del CLI Prisma + secret scanner CI (TruffleHog / gitleaks).
- PostgreSQL service container en GitHub Actions para smoke test deploy.
- Cobertura matriz: TS-01..TS-08 (positive) + NT-01..NT-06 (negative).
- Alineado con Doc 20 — Testing Strategy.

---

## 6. Functional Interpretation

| Acceptance Criterion | Technical Interpretation | Impacted Layer(s) |
|---|---|---|
| AC-01 — Baseline init migration generada | Ejecutar `npx prisma migrate dev --create-only --name init` con `DATABASE_URL` apuntando a DB local. Verificar que `prisma/migrations/<ts>_init/migration.sql` contiene 19 `CREATE TABLE` + 14 `CREATE TYPE ... AS ENUM` + FKs `ON DELETE RESTRICT` + `CASCADE` exclusivo en `budget_items.budget_id`. | DB (migration file) |
| AC-02 — `migrate dev` aplica sin errores | Ejecutar `npx prisma migrate dev` contra DB vacía → confirmar las 19 tablas físicas creadas. | DB (runtime), Backend (CLI Prisma) |
| AC-03 — `migrate deploy` idempotente | Segunda ejecución de `migrate deploy` retorna exit code 0 sin cambios en BD ni en `_prisma_migrations`. | DB (runtime), CI |
| AC-04 — Drift detection en CI | Job `prisma-migrate-diff` ejecuta `prisma migrate diff --from-migrations ./prisma/migrations --to-schema-datamodel ./prisma/schema.prisma --exit-code` y bloquea merge ante divergencia. | CI / DevOps |
| AC-05 — Smoke test CI verifica 19 tablas + 14 enums | Job `prisma-migrate-smoke` con PostgreSQL service container ejecuta `migrate deploy` + queries a `information_schema.tables` e `information_schema.types`. | CI / DevOps |
| AC-06 — Migration sin secretos | Secret scanner CI sobre `prisma/migrations/` detecta `DATABASE_URL=`, cadenas de conexión y patrones sospechosos. | Security / CI |
| AC-07 — Matriz de entornos documentada | Sección `Database Migrations` en README backend con tabla Local/CI/QA/Demo + Doc 21 §10 como fuente operativa. | Documentation |
| AC-08 — Scripts npm disponibles | `package.json` declara `db:migrate:dev`, `db:migrate:deploy`, `db:migrate:status`, `db:migrate:diff`. | Backend (config) |
| AC-09 — Raw SQL NO en US-100 | Test estructural sobre `migration.sql` verifica ausencia de patrones raw SQL para índices funcionales/GIN/parciales y check constraints/unique parciales. | QA / CI |
| AC-10 — Rollback forward-only documentado | README backend documenta política forward-only + bloqueo `migrate reset` en pipelines. | Documentation |

---

## 7. Backend Technical Design

### Modules / Bounded Contexts

US-100 no agrega módulos backend nuevos. Modifica:

- `apps/backend/package.json` (scripts npm).
- `apps/backend/prisma/migrations/<ts>_init/` (nuevo directorio con `migration.sql` + `migration_lock.toml`).
- `apps/backend/scripts/db-migrate-reset.sh` (nuevo wrapper script).
- `apps/backend/README.md` (sección `Database Migrations`).

### Use Cases / Application Services

`No aplica` — esta historia es infraestructura.

### Controllers / Routes

`No aplica`.

### DTOs / Schemas

`No aplica` — no introduce DTOs runtime. El "schema" de esta historia es `prisma/schema.prisma` (entregado por US-099).

### Repository / Persistence

`No aplica` runtime. Los repositorios Prisma se implementarán en historias backend posteriores.

### Validation Rules

- VR-01: `prisma migrate diff --exit-code` debe pasar en CI en cada PR.
- VR-02: Smoke test CI debe pasar.
- VR-03: `migration.sql` NO debe contener secretos.
- VR-04: `migration.sql` NO debe contener raw SQL para indices/constraints.
- VR-05: Archivos migration mergeados son inmutables.
- VR-06: `prisma migrate reset` bloqueado en CI/QA/Demo.
- VR-07: PR que toca `schema.prisma` debe incluir el archivo migration.
- VR-08: Política forward-only documentada.

### Error Handling

- Errores del CLI Prisma (CLI exit code distinto de 0) bloquean merge en CI.
- Wrapper script env-aware retorna exit code 1 si detecta `CI=true` o `NODE_ENV !== "local"` con mensaje claro.
- Smoke test verifica explícitamente la presencia de las 19 tablas + 14 enums; falla con mensaje detallando qué falta.

### Transactions

`No aplica` runtime. `prisma migrate deploy` maneja transacciones internamente.

### Observability

- Logs CI obligatorios para `prisma migrate diff`, `prisma migrate deploy` (smoke), secret scan.
- Logs CI NO deben imprimir `DATABASE_URL` ni payloads sensibles (SEC-03).
- Falla de cualquier job CI relacionado bloquea merge.

---

## 8. Frontend Technical Design

`No aplica` — esta historia es 100% backend/DB/CI.

---

## 9. API Contract Design

`No aplica` — no introduce endpoints.

---

## 10. Database / Prisma Design

### Baseline Migration

| Atributo | Valor |
|---|---|
| Path | `prisma/migrations/<YYYYMMDDHHMMSS>_init/migration.sql` |
| Comando de generación | `npx prisma migrate dev --create-only --name init` |
| Fuente | `prisma/schema.prisma` declarado en US-099 (Approved) |
| Contenido esperado | 19 `CREATE TABLE` + 14 `CREATE TYPE ... AS ENUM` + FKs con `ON DELETE RESTRICT` (default) + `ON DELETE CASCADE` exclusivo en `budget_items.budget_id` + columnas con tipos PG (`timestamptz(6)`, `numeric(14,2)`, `jsonb`) |
| Contenido NO permitido | Raw SQL para índices funcionales/GIN/parciales (US-101), raw SQL para check constraints / unique parciales / enforcement append-only (US-102), seed data (EPIC-SEED-001), secretos |
| Inmutabilidad | Archivos mergeados son inmutables; correcciones via migraciones correctivas adicionales |

### Tablas físicas esperadas (verificadas por smoke test)

`users`, `events`, `event_types`, `event_tasks`, `budgets`, `budget_items`, `vendor_profiles`, `vendor_services`, `service_categories`, `locations`, `quote_requests`, `quotes`, `booking_intents`, `reviews`, `notifications`, `attachments`, `admin_actions`, `ai_recommendations`, `ai_prompt_versions`.

### Enums físicos esperados (verificados por smoke test)

`user_role`, `currency_code`, `language_code`, `llm_provider`, `event_status`, `quote_request_status`, `quote_status`, `booking_intent_status`, `review_status`, `notification_status`, `attachment_status`, `vendor_profile_status`, `vendor_service_status`, `ai_recommendation_status`.

### Environment Matrix (Doc 21 §10)

| Entorno | Comando | Owner / Trigger |
|---|---|---|
| Local | `pnpm db:migrate:dev` | Desarrollador manualmente |
| CI | `pnpm db:migrate:diff` (drift) + `pnpm db:migrate:deploy` smoke (DB ephemeral) | GitHub Actions on every PR |
| QA | `pnpm db:migrate:deploy` | Pipeline `staging.yml` (US-139) |
| Demo | `pnpm db:migrate:deploy` | Pipeline `main.yml` (US-139) |

### Forward-only Policy

- Correcciones se aplican vía migraciones correctivas adicionales.
- Archivos migration mergeados son inmutables.
- `prisma migrate reset` permitido solo en local; bloqueado en pipelines via wrapper script env-aware.

### Raw SQL Boundary

US-100 NO incluye raw SQL. US-101 entrega migration(s) con raw SQL para índices avanzados. US-102 entrega migration(s) con raw SQL para check constraints, unique parciales y enforcement append-only.

### Migration Naming

Convención Prisma estándar: `<YYYYMMDDHHMMSS>_<name>`. La baseline usa el sufijo `init`. Migraciones futuras siguen el mismo patrón con sufijos descriptivos (`<ts>_add_index_email`, `<ts>_check_rating_range`, etc.).

---

## 11. AI / PromptOps Design

`No aplica` — esta historia no invoca IA ni declara prompts.

---

## 12. Security & Authorization Design

### Authentication

`No aplica` runtime — no introduce endpoints.

### Authorization

`No aplica` runtime — no introduce policies.

### Ownership Rules

`No aplica`.

### Role Rules

`No aplica` runtime. La ejecución de `migrate deploy` en QA/Demo queda limitada al pipeline CD (enforcement detallado en US-139).

### Negative Authorization Scenarios

`No aplica` runtime. En su lugar, US-100 cubre escenarios de hardening operativo:

- EC-03: `prisma migrate reset` ejecutado en CI/QA/Demo → wrapper script falla.
- NT-03: idem vía test negativo.

### Audit Requirements

`No aplica` runtime — sin endpoints. Audit del schema/migrations queda implícito en git history (PRs, blames).

### Sensitive Data Handling

- `migration.sql` NO contiene `DATABASE_URL`, contraseñas, ni cadenas de conexión (SEC-01).
- `DATABASE_URL` vive en env vars / Secrets Manager (SEC-02).
- Logs CI no imprimen `DATABASE_URL` ni payloads sensibles (SEC-03).
- Secret scanner CI sobre `prisma/migrations/` bloquea merge ante secretos hardcodeados (AC-06).

---

## 13. Testing Strategy

### Unit Tests

Tests estructurales sobre `prisma/migrations/<ts>_init/migration.sql` con Vitest. Sugerencia de archivos:

- `apps/backend/tests/migrations/migration-structure.spec.ts`

Casos:

- TS-01: Verificar que `prisma/migrations/<ts>_init/migration.sql` existe y es no-vacío.
- TS-06: Verificar que `package.json` declara los 4 scripts `db:migrate:*`.
- TS-07: Verificar que README backend contiene la sección `Database Migrations` con referencia a Doc 21 §10 + política forward-only + bloqueo `migrate reset`.
- TS-08: Verificar que `migration.sql` NO contiene patrones raw SQL para índices funcionales/GIN/parciales (`CREATE INDEX ... USING gin`, `CREATE INDEX ... WHERE`, `CREATE INDEX ... (lower(...))`) ni check constraints (`CHECK (...)`) ni unique parciales (`CREATE UNIQUE INDEX ... WHERE`).
- NT-05/NT-06 (sub-casos de TS-08).

### Integration Tests

Las TS-02 y TS-03 son integration tests que requieren DB real (PostgreSQL local o ephemeral). Se ejecutan localmente y en el smoke job CI.

- TS-02: Local: `pnpm db:migrate:dev` aplica la migration y crea las 19 tablas físicas.
- TS-03: Local: segunda ejecución de `pnpm db:migrate:deploy` retorna exit code 0 sin cambios.

### API Tests

`No aplica`.

### E2E Tests

`No aplica`.

### Security Tests

- AC-06 / NT-02: secret scanner CI sobre `prisma/migrations/` falla ante `DATABASE_URL=`, cadenas de conexión hardcodeadas, claves API.
- Test estructural defensivo (regex) sobre `migration.sql` con allowlist para patrones idiomáticos Prisma (`env("DATABASE_URL")` no aparece en migration.sql; solo en schema.prisma).

### Accessibility Tests

`No aplica` — no hay UI.

### AI Tests

`No aplica`.

### Seed / Demo Tests

`No aplica` directamente — el seed real pertenece a EPIC-SEED-001. Sí se verifica indirectamente: el smoke test confirma que las 19 tablas + 14 enums existen, lo cual habilita el seed posterior.

### CI Checks

| Job | Comando | Bloquea merge |
|---|---|---|
| `prisma-migrate-diff` | `pnpm db:migrate:diff` | Sí |
| `prisma-migrate-smoke` | PostgreSQL service container + `pnpm db:migrate:deploy` + queries a `information_schema` | Sí |
| `migration-structural-tests` | `pnpm vitest run tests/migrations` | Sí |
| `migration-secret-scan` | TruffleHog / gitleaks sobre `prisma/migrations/` | Sí |
| `migrate-reset-block-test` | Test del wrapper script env-aware | Sí |

---

## 14. Observability & Audit

### Logs

- Jobs CI relacionados con migraciones producen logs visibles en GitHub Actions UI.
- `prisma migrate deploy` en smoke imprime las migrations aplicadas; usado para debugging.
- Logs NO deben contener `DATABASE_URL` ni payloads sensibles (SEC-03).

### Correlation ID

`No aplica` — no hay runtime.

### AdminAction

`No aplica`.

### Error Tracking

Errores del CLI Prisma en CI quedan reflejados en el job output. No se integra a un sistema de error tracking externo (eso pertenece a observability runtime, no a esta historia).

### Metrics

`No aplica` — no hay runtime con métricas.

---

## 15. Seed / Demo Data Impact

### Seed Data Required

US-100 **no** genera seed data. El seed real pertenece a EPIC-SEED-001 (US-085 Run seed script).

### Demo Scenario Supported

Esta historia desbloquea EPIC-SEED-001: una vez aplicadas las migraciones, el seed script puede insertar fixtures con `is_seed=true` y el reset demo (`DELETE WHERE is_seed=true`) funciona conforme a NFR-DEMO-003.

### Reset / Isolation Notes

- `prisma migrate reset` permitido solo en local; bloqueado en CI/QA/Demo.
- Demo reset operativo (insertar/borrar seed data) es responsabilidad de EPIC-SEED-001 (US-086 Admin reset demo).
- Snapshot RDS automático antes de `migrate deploy` en QA/Demo es responsabilidad de US-137/US-139.

---

## 16. Documentation Alignment Required

| Document / Source | Conflict | Current Decision | Recommended Action | Blocks Implementation? |
|---|---|---|---|---|
| Doc 18 §35.2 (línea 1385–1387) | Declara baseline `20260601000000_init` con raw SQL bundled para unique parciales, check constraints, índice funcional email, default `valid_until`. | Decision Resolution §Decisión 1 + ADR-DB-005: raw SQL en migrations separadas (US-101 índices, US-102 constraints). | Amendar Doc 18 §35.2 para reflejar el split US-100 (schema-only) / US-101 (índices) / US-102 (constraints). | **No** |
| Doc 18 §35.2 (línea 1465) | Menciona `prisma/seed.ts` como parte del baseline. | Decision Resolution §Decisión 8: `prisma/seed.ts` pertenece a EPIC-SEED-001 (US-085..US-088). | Amendar Doc 18 §35.2 para excluir `prisma/seed.ts` de US-100. | **No** |
| PB-P0-001 (Backlog Prioritized) — Acceptance Summary | Wording: "Migraciones reproducibles up/down". | Decision Resolution §Decisión 2: forward-only canónico Prisma (ADR-DB-005). | Amendar wording a "Migraciones reproducibles forward-only con `migrate deploy` idempotente". | **No** |

Los 3 items son **housekeeping documental post-merge**. Ninguno bloquea la implementación de US-100.

---

## 17. Technical Risks & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Desarrollador edita `schema.prisma` y olvida generar la migration. | Alto — drift en CI; pero detectable temprano. | Job CI `prisma-migrate-diff` bloquea el PR con mensaje claro (AC-04, VR-01). PR template recuerda el comando. |
| Smoke test en DB ephemeral falla intermitentemente por arranque lento del service container. | Medio. | Configurar `services.postgres.options` con healthcheck antes de iniciar el job. Documentar timeout/retry policy. |
| `migration.sql` contiene un statement que ejecuta correctamente en local pero falla en QA/Demo (diferencias de versión PG). | Medio. | Smoke test usa la misma versión PG declarada en Doc 18 §10 y en RDS (US-137). |
| Modificación retroactiva de un archivo migration ya mergeado. | Alto — corrompe estado de QA/Demo. | Job CI `prisma-migrate-diff` detecta divergencia entre migrations y schema (EC-04, NT-04). VR-05 enforcement vía revisión PR. |
| `prisma migrate reset` ejecutado accidentalmente en CI/QA/Demo. | Alto — destruye datos seed/demo. | Wrapper script env-aware (`scripts/db-migrate-reset.sh`) falla con exit code 1 si detecta CI=true o NODE_ENV !== "local" (EC-03, NT-03). |
| `DATABASE_URL` filtrado en `migration.sql` por copy-paste accidental. | Alto. | Secret scanner CI sobre `prisma/migrations/` (AC-06, NT-02) + test defensivo regex. |
| Doc 18 §35.2 sin amendar genera confusión durante US-101/US-102. | Bajo — mitigado por decisiones formalizadas. | Tareas DOC ejecutadas post-merge (housekeeping documental). |
| Inclusión accidental de raw SQL para indices/constraints en US-100. | Medio — viola split aprobado. | TS-08 + NT-05/NT-06 + VR-04 + revisión PR. |
| Wrapper script env-aware bypass via flag o variable override. | Bajo. | Documentar la política y revisar en PR; enforcement adicional puede ir en US-139 con permisos IAM. |
| Versión de Prisma usada en local difiere de la usada en CI. | Medio. | Pinear versión exacta en `package.json` + `pnpm-lock.yaml`. CI usa lockfile estricto. |

---

## 18. Implementation Guidance for Coding Agents

### Files / folders likely impacted

- `apps/backend/package.json` (scripts npm `db:migrate:*`).
- `apps/backend/prisma/migrations/<YYYYMMDDHHMMSS>_init/migration.sql` (nuevo).
- `apps/backend/prisma/migrations/<YYYYMMDDHHMMSS>_init/migration_lock.toml` (nuevo).
- `apps/backend/prisma/migrations/migration_lock.toml` (nuevo, provider lock).
- `apps/backend/scripts/db-migrate-reset.sh` (nuevo wrapper script).
- `apps/backend/tests/migrations/migration-structure.spec.ts` (nuevo).
- `apps/backend/README.md` (nueva sección `Database Migrations`).
- `.github/workflows/ci.yml` (nuevos jobs `prisma-migrate-diff`, `prisma-migrate-smoke`, `migration-structural-tests`, `migration-secret-scan`, `migrate-reset-block-test`).
- `.env.example` (asegurar que `DATABASE_URL` dummy permite ejecutar `migrate diff`).

### Recommended order of implementation

1. Verificar que US-099 está mergeado en la rama base y `prisma/schema.prisma` existe.
2. Generar la baseline migration: `npx prisma migrate dev --create-only --name init`.
3. Inspeccionar `prisma/migrations/<ts>_init/migration.sql` y confirmar las 19 tablas + 14 enums + FKs esperadas. Confirmar ausencia de raw SQL para indices/constraints.
4. Agregar scripts npm `db:migrate:dev`, `db:migrate:deploy`, `db:migrate:status`, `db:migrate:diff` a `package.json`.
5. Implementar wrapper script `scripts/db-migrate-reset.sh` con guard env-aware.
6. Aplicar la migration en local: `pnpm db:migrate:dev` y verificar las 19 tablas físicas.
7. Verificar idempotency: re-ejecutar `pnpm db:migrate:deploy` localmente.
8. Implementar tests estructurales Vitest sobre `migration.sql`.
9. Configurar el job CI `prisma-migrate-diff`.
10. Configurar el job CI `prisma-migrate-smoke` con PostgreSQL service container.
11. Configurar el job CI `migration-structural-tests`.
12. Configurar el job CI `migration-secret-scan`.
13. Configurar el job CI `migrate-reset-block-test` (que verifica que el wrapper falla en CI).
14. Documentar sección `Database Migrations` en README backend.
15. Verificar todos los jobs CI en verde antes de mergear.

### Decisions that must not be reopened

- US-100 NO incluye raw SQL (Decision Resolution §1; raw SQL pertenece a US-101/US-102).
- Forward-only canónico Prisma; sin down migrations (Decision Resolution §2; ADR-DB-005).
- Drift detection PR-time en US-100; CD en US-139 (Decision Resolution §3).
- Tres niveles QA: gen + smoke + drift (Decision Resolution §4).
- Snapshot pre-deploy delegado a US-137/US-139 (Decision Resolution §5).
- Runbook: README backend + Doc 21 §10 (Decision Resolution §6).
- `prisma migrate reset` permitido solo en local; bloqueado en pipelines via wrapper script env-aware (Decision Resolution §7).
- `prisma/seed.ts` pertenece a EPIC-SEED-001, no US-100 (Decision Resolution §8).
- Archivos migration mergeados son inmutables (VR-05).
- Baseline naming: convención Prisma `<ts>_init`.

### What must not be implemented

- Raw SQL para índices funcionales/GIN/parciales.
- Raw SQL para check constraints, unique parciales, enforcement append-only.
- Pipeline CD (`migrate deploy` automático a QA/Demo en push a main/staging).
- Provisioning RDS / configuración `DATABASE_URL` real.
- Snapshot/backup automático.
- `prisma/seed.ts`, fixtures, demo reset operativo.
- Down migrations, rollback automático.
- Connection pooling, `$queryRaw` en código de aplicación.
- Endpoints REST, controllers, use cases, repositorios runtime.
- Lógica de autenticación, autorización, transacciones runtime.

### Assumptions to preserve

- `prisma/schema.prisma` declarado en US-099 está mergeado y validado en CI.
- `DATABASE_URL` está disponible vía env (dummy en CI, real en QA/Demo).
- PostgreSQL 14+ disponible en local (Docker), CI (service container), QA/Demo (RDS).
- Módulo backend (PB-P0-002) disponible para alojar `prisma/migrations/` y scripts.
- Versión de Prisma pinned en `package.json` + lockfile.

---

## 19. Task Generation Notes

### Suggested task groups

| Grupo | Tareas sugeridas |
|---|---|
| **DB / Migration** | Generar baseline init migration (`migrate dev --create-only --name init`); inspeccionar contenido (19 `CREATE TABLE` + 14 enums + FKs); confirmar ausencia de raw SQL. |
| **Backend / Scripts** | Agregar scripts `db:migrate:dev`, `db:migrate:deploy`, `db:migrate:status`, `db:migrate:diff` a `package.json`; implementar wrapper script env-aware `db-migrate-reset.sh`. |
| **QA / Structural Tests** | Test Vitest sobre `migration.sql` (presencia tablas/enums esperados, ausencia de raw SQL no permitido); test del wrapper script env-aware. |
| **DevOps / CI** | Job `prisma-migrate-diff`; job `prisma-migrate-smoke` con PostgreSQL service container; job `migration-structural-tests`; job `migration-secret-scan`; job `migrate-reset-block-test`. |
| **Security** | Secret scan defensivo sobre `prisma/migrations/` integrado al pipeline. |
| **Documentation** | README backend con sección `Database Migrations` (comandos cotidianos + matriz de entornos citando Doc 21 §10 + política forward-only + bloqueo `migrate reset`). |
| **Documentation Alignment (post-merge, no bloqueante)** | Amendar Doc 18 §35.2 (split US-100/US-101/US-102); amendar Doc 18 §35.2 (`prisma/seed.ts` → EPIC-SEED-001); amendar PB-P0-001 wording. |

### Required QA tasks

- Test estructural Vitest sobre `migration.sql`: 19 `CREATE TABLE` + 14 enums + FKs.
- Test estructural sobre ausencia de raw SQL para indices/constraints (regex defensivo).
- Test del wrapper script env-aware: ejecutar con `CI=true` debe fallar.
- Configurar todos los jobs CI listados arriba (todos bloquean merge).

### Required security tasks

- Secret scan defensivo sobre `prisma/migrations/` (CI con TruffleHog/gitleaks).
- Test estructural Vitest que verifica ausencia de patrones de secretos en `migration.sql`.

### Required seed/demo tasks

`No aplica` directamente — pertenece a EPIC-SEED-001. Tarea informativa: documentar que la baseline migration habilita el seed posterior.

### Required documentation tasks

- README backend: sección `Database Migrations` (must).
- Post-merge housekeeping (should/could): amendas a Doc 18 §35.2 y PB-P0-001.

### Dependencies between tasks

- DB / Migration tasks deben completarse antes que QA / Structural Tests.
- Scripts `db:migrate:*` deben existir antes que los jobs CI los puedan invocar.
- Wrapper script env-aware debe existir antes que el job `migrate-reset-block-test`.
- Documentación se hace al final.

### Consolidated `tasks.md` for PB-P0-001

Sí: cuando US-101 y US-102 generen sus respectivos technical specs y tasks, el ítem padre `PB-P0-001` debería consolidar un único `tasks.md` que oriente la secuencia DB completa (US-099 schema → US-100 migrations → US-101 indices → US-102 constraints) para Sprint Planning.

---

## 20. Technical Spec Readiness

| Check | Status |
|---|---|
| User Story approved or explicitly allowed for draft spec | **Pass** (Approved 2026-06-10) |
| Product Backlog mapping found | **Pass** (PB-P0-001, posición 2 de 4) |
| Decision Resolution reviewed if present | **Pass** (consolidado en §1, §5, §16) |
| Scope clear | **Pass** (§4) |
| Architecture alignment clear | **Pass** (§5, alineado con ADR-BE-001, ADR-DB-001, ADR-DB-005, Doc 21 §10) |
| API impact clear | **N/A** (infraestructura) |
| DB impact clear | **Pass** (§10) |
| AI impact clear | **N/A** |
| Security impact clear | **Pass** (§12) |
| Testing strategy clear | **Pass** (§13) |
| Ready for Development Task Breakdown | **Yes** |

---

## 21. Final Recommendation

`Ready for Task Breakdown`.

Justificación:

1. La User Story está **Approved** (2026-06-10) con las 11 decisiones PO/BA formalizadas y respaldadas por ADR-DB-001..005 + Doc 21 §10.
2. El mapeo al Product Backlog Prioritized fue exitoso: **PB-P0-001**, orden de ejecución 1, posición 2 de 4 dentro del ítem (después de US-099, antes de US-101/US-102).
3. El alcance está delimitado con claridad: baseline schema-only migration + scripts npm + jobs CI + wrapper script + documentación. Raw SQL, CD pipeline, RDS y seed real están **explícitamente fuera de scope** y delegados a US-101/US-102/US-139/US-137/EPIC-SEED-001.
4. Los 10 Acceptance Criteria son específicos, testables y trazables a layers concretos (DB, Backend, CI/DevOps, Documentation, Security).
5. Las decisiones técnicas críticas (raw SQL boundary, rollback strategy, drift detection ownership, QA verification approach, `migrate reset` policy) están consolidadas y no deben reabrirse.
6. Los 3 items de Documentation Alignment Required son housekeeping documental post-merge y **no bloquean** la implementación.
7. La estrategia de testing es completa y ejecutable con el stack aprobado (Vitest + CLI Prisma + PostgreSQL service container en GitHub Actions + secret scanner CI).
8. La sinergia con US-099 (ya `Approved`) está formalizada: los items de Documentation Alignment de ambas historias pueden agruparse en un único PR de housekeeping post-merge.

El siguiente paso recomendado es ejecutar `eventflow-user-story-to-development-tasks` sobre `management/user-stories/US-100-prisma-migrations.md` para generar el desglose técnico de tareas listas para Sprint Planning.
