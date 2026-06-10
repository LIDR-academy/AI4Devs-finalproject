# Development Tasks — PB-P0-001 / US-100: Generar baseline migration Prisma y operar flujo `migrate dev` / `migrate deploy`

## 1. Metadata

| Field | Value |
|---|---|
| User Story ID | US-100 |
| Source User Story | `management/user-stories/US-100-prisma-migrations.md` |
| Source Technical Specification | `management/technical-specs/P0/PB-P0-001/US-100-technical-spec.md` |
| Decision Resolution Artifact | `management/user-stories/decision-resolutions/US-100-decision-resolution.md` |
| Priority | P0 |
| Backlog ID | PB-P0-001 |
| Backlog Title | Database Schema, Migrations & Constraints — Implementar schema Prisma + PostgreSQL alineado al Domain Data Model |
| Backlog Execution Order | 1 (primer ítem P0) — US-100 = posición 2 de 4 dentro del ítem |
| User Story Position in Backlog Item | 2 of 4 |
| Related User Stories in Backlog Item | US-099 (Approved), US-100 (Approved), US-101, US-102 |
| Epic | EPIC-DB-001 — Database & Prisma Physical Model |
| Backlog Item Dependencies | — (foundation); US-100 depende fuertemente de US-099 mergeado |
| Feature | Prisma Migrations — baseline + multi-environment |
| Module / Domain | Platform / DB |
| Backlog Alignment Status | **Found** |
| Task Breakdown Status | **Ready for Sprint Planning** |
| Created Date | 2026-06-10 |
| Last Updated | 2026-06-10 |

---

## 2. Source Validation

| Source | Found | Used | Notes |
|---|---|---|---|
| User Story | Yes | Yes | `Approved` 2026-06-10; 10 AC vigentes. |
| Technical Specification | Yes | **Yes (primaria)** | Sections 4–19 son la fuente principal de tareas. |
| Decision Resolution Artifact | Yes | Yes | 11 decisiones (Q1–Q7 + 4 auxiliares) consolidadas. |
| Product Backlog Prioritized | Yes | Yes | PB-P0-001 líneas 185–202; US-100 = posición 2. |
| ADRs | Yes | Yes | ADR-ARCH-001, ADR-BE-001, ADR-DB-001..005. |

---

## 3. Backlog Execution Context

### Parent Backlog Item

`PB-P0-001 — Database Schema, Migrations & Constraints` (P0, EPIC-DB-001). Cubre fundación completa de persistencia: schema → migraciones → índices → constraints.

### Execution Order Rationale

US-100 ocupa la posición 2 dentro de `PB-P0-001` porque:

- Depende de US-099 (Approved) que ya entregó `prisma/schema.prisma` validado.
- Es precondición fuerte para US-101 (raw SQL índices) y US-102 (raw SQL constraints) — ambas agregan migrations adicionales que **deben** llegar después de la baseline `<ts>_init/migration.sql`.
- Sin migraciones aplicables, EPIC-BE-001 operativo, EPIC-SEED-001, PB-P0-017 y US-137 quedan bloqueados.
- Mitiga R-14 ("Migraciones Prisma rompen entornos") al introducir drift detection PR-time + smoke deploy en DB ephemeral.

### Related User Stories in Same Backlog Item

| User Story | Role in Backlog Item | Suggested Order |
|---|---|---|
| US-099 | Schema Prisma declarativo + Prisma Client | 1 (Approved) |
| **US-100** | Baseline init migration schema-only + `migrate dev`/`migrate deploy` + drift detection + smoke CI | **2 (Approved)** |
| US-101 | Migration(s) con raw SQL para índices funcionales/GIN/parciales | 3 |
| US-102 | Migration(s) con raw SQL para check constraints, unique parciales, enforcement append-only | 4 |

---

## 4. Task Breakdown Summary

| Area | Number of Tasks | Notes |
|---|---:|---|
| Database / Prisma (DB) | 2 | Generación + inspección de la baseline migration. |
| Backend (BE) | 2 | Scripts npm + wrapper script env-aware. |
| QA / Testing (QA) | 4 | Tests estructurales sobre `migration.sql` + test del wrapper. |
| Security (SEC) | 1 | Secret scan defensivo sobre `prisma/migrations/`. |
| DevOps / Environment (OPS) | 5 | 5 jobs CI (diff, smoke, structural, secret-scan, reset-block). |
| Documentation (DOC) | 4 | README backend + 3 housekeeping post-merge. |
| Seed / Demo (SEED) | 0 | Cubierto indirectamente por smoke CI; seed real en EPIC-SEED-001. |
| Observability (OBS) | 0 | Logs CI cubiertos por OPS-001..OPS-005. |
| **Total** | **18** | |

---

## 5. Traceability Matrix

| Acceptance Criterion | Technical Spec Section | Task IDs |
|---|---|---|
| AC-01 — Baseline init migration generada | §10 Database/Prisma Design — Baseline Migration | DB-001, DB-002 |
| AC-02 — `migrate dev` aplica sin errores | §10; §13 Integration Tests | DB-002 |
| AC-03 — `migrate deploy` idempotente | §10; §13 Integration Tests; §13 CI Checks | DB-002, OPS-002 |
| AC-04 — Drift detection en CI | §10 Environment Matrix; §13 CI Checks | OPS-001 |
| AC-05 — Smoke test CI verifica 19 tablas + 14 enums | §10; §13 CI Checks | OPS-002 |
| AC-06 — Migration sin secretos | §12 Security; §13 Security Tests | SEC-001, OPS-004 |
| AC-07 — Matriz de entornos documentada | §10 Environment Matrix; §18 README backend | DOC-001 |
| AC-08 — Scripts npm disponibles | §7 Backend Technical Design | BE-001 |
| AC-09 — Raw SQL NO en US-100 | §10 Raw SQL Boundary; §13 (TS-08) | DB-002, QA-003 |
| AC-10 — Rollback forward-only documentado | §10 Forward-only Policy; §18 README | BE-002, DOC-001, OPS-005 |
| EC-01..EC-04 (Edge Cases) | §17 Risks & Mitigations | OPS-001, OPS-002, OPS-005 |
| VR-01..VR-08 (Validation Rules) | §13 Testing; §10 | OPS-001, OPS-002, OPS-004, OPS-005, QA-001..QA-004 |
| SEC-01..SEC-05 (Security Rules) | §12 Security | SEC-001, OPS-004, BE-002 |

Cada AC mapea a ≥1 tarea. Cada tarea mapea a ≥1 sección del Technical Spec.

---

## 6. Development Tasks

### TASK-PB-P0-001-US-100-DB-001 — Generar baseline init migration desde `prisma/schema.prisma`

| Field | Value |
|---|---|
| Area | Database / Prisma |
| Type | Implementation |
| Priority | Must |
| Estimate | S |
| Depends On | — (requiere US-099 mergeado) |
| Source AC(s) | AC-01 |
| Technical Spec Section(s) | §10 Database/Prisma Design — Baseline Migration; §18 Implementation Guidance |
| Backlog ID | PB-P0-001 |
| User Story ID | US-100 |
| Owner Role | Backend |
| Status | To Do |

#### Objective

Generar el archivo baseline init migration en `prisma/migrations/<YYYYMMDDHHMMSS>_init/migration.sql` derivado exclusivamente del schema declarado en US-099.

#### Scope

##### Include

- Ejecutar `npx prisma migrate dev --create-only --name init` con `DATABASE_URL` apuntando a DB local PostgreSQL 14+.
- Versionar en git el directorio resultante: `prisma/migrations/<ts>_init/migration.sql` + `prisma/migrations/migration_lock.toml`.

##### Exclude

- Aplicar la migration a una BD real fuera de local (es responsabilidad del smoke CI).
- Editar manualmente el contenido del SQL generado por Prisma.

#### Implementation Notes

- `DATABASE_URL` local puede ser una DB Docker recién levantada.
- `--create-only` evita aplicar; solo genera el archivo.
- El sufijo del nombre es `init` por convención.

#### Acceptance Criteria Covered

AC-01.

#### Definition of Done

- [ ] Directorio `prisma/migrations/<ts>_init/` versionado.
- [ ] `migration.sql` no vacío.
- [ ] `migration_lock.toml` con `provider = "postgresql"` versionado.

---

### TASK-PB-P0-001-US-100-DB-002 — Inspeccionar contenido y aplicar `migrate dev` en local

| Field | Value |
|---|---|
| Area | Database / Prisma |
| Type | Review |
| Priority | Must |
| Estimate | S |
| Depends On | DB-001 |
| Source AC(s) | AC-01, AC-02, AC-03, AC-09 |
| Technical Spec Section(s) | §10; §13 Integration Tests |
| Backlog ID | PB-P0-001 |
| User Story ID | US-100 |
| Owner Role | Backend / Tech Lead |
| Status | To Do |

#### Objective

Validar el contenido del `migration.sql` generado y confirmar que se aplica correctamente en local con idempotency en re-ejecución.

#### Scope

##### Include

- Verificar 19 `CREATE TABLE` correspondientes a las tablas físicas listadas en §10.
- Verificar 14 `CREATE TYPE ... AS ENUM` correspondientes a los enums listados.
- Verificar FKs con `ON DELETE RESTRICT` por defecto.
- Verificar `ON DELETE CASCADE` exclusivamente en `budget_items.budget_id`.
- Verificar ausencia de raw SQL para indices funcionales/GIN/parciales y check constraints/unique parciales.
- Ejecutar `pnpm db:migrate:dev` contra DB vacía y confirmar las 19 tablas.
- Ejecutar `pnpm db:migrate:deploy` una segunda vez y confirmar exit code 0 sin cambios.

##### Exclude

- Modificaciones al SQL (si se detectan problemas, ajustar el schema en `prisma/schema.prisma` y regenerar).

#### Implementation Notes

- Revisión técnica documentada en el PR.
- Si se detectan patrones raw SQL no permitidos, el SQL NO debe editarse manualmente: ajustar `schema.prisma` y regenerar.

#### Acceptance Criteria Covered

AC-01, AC-02, AC-03, AC-09.

#### Definition of Done

- [ ] Checklist de inspección documentado en PR (19 tablas, 14 enums, FKs correctos, sin raw SQL).
- [ ] `pnpm db:migrate:dev` exitoso en local contra DB vacía.
- [ ] `pnpm db:migrate:deploy` exitoso e idempotente (verificado localmente).

---

### TASK-PB-P0-001-US-100-BE-001 — Agregar scripts npm `db:migrate:*` al backend

| Field | Value |
|---|---|
| Area | Backend |
| Type | Setup |
| Priority | Must |
| Estimate | XS |
| Depends On | — |
| Source AC(s) | AC-08 |
| Technical Spec Section(s) | §7 Backend Technical Design; §10 Environment Matrix |
| Backlog ID | PB-P0-001 |
| User Story ID | US-100 |
| Owner Role | Backend |
| Status | To Do |

#### Objective

Agregar los 4 scripts npm necesarios para operar el flujo Prisma migrate desde el backend.

#### Scope

##### Include

- `db:migrate:dev` → `prisma migrate dev`.
- `db:migrate:deploy` → `prisma migrate deploy`.
- `db:migrate:status` → `prisma migrate status`.
- `db:migrate:diff` → `prisma migrate diff --from-migrations ./prisma/migrations --to-schema-datamodel ./prisma/schema.prisma --exit-code`.

##### Exclude

- Scripts de seed (`db:seed`) → EPIC-SEED-001.
- Scripts de pipeline CD → US-139.

#### Implementation Notes

- Documentar brevemente cada script en el README backend (DOC-001 lo cubre).

#### Acceptance Criteria Covered

AC-08.

#### Definition of Done

- [ ] 4 scripts declarados en `package.json` del backend.
- [ ] Cada script ejecuta exitosamente en local con `DATABASE_URL` válido.

---

### TASK-PB-P0-001-US-100-BE-002 — Implementar wrapper script `db-migrate-reset.sh` env-aware

| Field | Value |
|---|---|
| Area | Backend |
| Type | Implementation |
| Priority | Must |
| Estimate | S |
| Depends On | BE-001 |
| Source AC(s) | AC-10 (parcial), SEC-05 |
| Technical Spec Section(s) | §7 Backend Technical Design; §12 Security; §17 Risks & Mitigations |
| Backlog ID | PB-P0-001 |
| User Story ID | US-100 |
| Owner Role | Backend / DevOps |
| Status | To Do |

#### Objective

Implementar un wrapper script que envuelve `prisma migrate reset` y falla con exit code distinto de 0 si se ejecuta en CI/QA/Demo.

#### Scope

##### Include

- Crear `apps/backend/scripts/db-migrate-reset.sh` (o equivalente `.ts`).
- Guard env-aware: si `CI=true` OR `NODE_ENV !== "local"` → exit 1 con mensaje claro.
- Si pasa el guard, invocar `prisma migrate reset`.
- Opcional: agregar script npm `db:migrate:reset` que invoque el wrapper (NO `prisma migrate reset` directo).

##### Exclude

- Enforcement adicional vía IAM en producción (eso pertenece a US-139).

#### Implementation Notes

- Mensaje de error sugerido: `"❌ prisma migrate reset bloqueado en CI/QA/Demo. Permitido solo en local. Ver Doc 21 §10 y README."`.
- El script debe ser portable (POSIX shell o Node).

#### Acceptance Criteria Covered

AC-10 (parcial — bloqueo `migrate reset` en pipelines).

#### Definition of Done

- [ ] Script `db-migrate-reset.sh` versionado y ejecutable.
- [ ] Guard env-aware verificado en local (sin `CI` ni `NODE_ENV !== "local"` → permite) y manualmente con `CI=true` (falla).
- [ ] (Opcional) Script npm `db:migrate:reset` apunta al wrapper.

---

### TASK-PB-P0-001-US-100-QA-001 — Test estructural Vitest: 19 `CREATE TABLE` en `migration.sql`

| Field | Value |
|---|---|
| Area | QA / Testing |
| Type | Test |
| Priority | Must |
| Estimate | S |
| Depends On | DB-001, DB-002 |
| Source AC(s) | AC-01 (verificación), AC-02 (parcial) |
| Technical Spec Section(s) | §13 Testing — Unit Tests (TS-01..TS-02 sub-set) |
| Backlog ID | PB-P0-001 |
| User Story ID | US-100 |
| Owner Role | QA |
| Status | To Do |

#### Objective

Verificar la presencia de los 19 `CREATE TABLE` esperados en `prisma/migrations/<ts>_init/migration.sql` vía test Vitest.

#### Scope

##### Include

- Test en `apps/backend/tests/migrations/migration-structure.spec.ts`.
- Lista canónica de las 19 tablas: `users`, `events`, `event_types`, `event_tasks`, `budgets`, `budget_items`, `vendor_profiles`, `vendor_services`, `service_categories`, `locations`, `quote_requests`, `quotes`, `booking_intents`, `reviews`, `notifications`, `attachments`, `admin_actions`, `ai_recommendations`, `ai_prompt_versions`.
- Negative test NT-01: si falta una tabla, el test falla con mensaje claro.

##### Exclude

- Verificación de campos internos por tabla (cubierto por US-099 tests + smoke CI).

#### Acceptance Criteria Covered

AC-01 (verificación estructural).

#### Definition of Done

- [ ] Test verde para las 19 tablas presentes en `migration.sql`.
- [ ] Test falla deterministicamente si se elimina una tabla (verificado vía mutación local).

---

### TASK-PB-P0-001-US-100-QA-002 — Test estructural Vitest: 14 `CREATE TYPE ... AS ENUM`

| Field | Value |
|---|---|
| Area | QA / Testing |
| Type | Test |
| Priority | Must |
| Estimate | XS |
| Depends On | DB-001, DB-002 |
| Source AC(s) | AC-01 (verificación), AC-05 (parcial) |
| Technical Spec Section(s) | §13 Testing |
| Backlog ID | PB-P0-001 |
| User Story ID | US-100 |
| Owner Role | QA |
| Status | To Do |

#### Objective

Verificar la presencia de los 14 enums físicos esperados en `migration.sql`.

#### Scope

##### Include

- Lista canónica: `user_role`, `currency_code`, `language_code`, `llm_provider`, `event_status`, `quote_request_status`, `quote_status`, `booking_intent_status`, `review_status`, `notification_status`, `attachment_status`, `vendor_profile_status`, `vendor_service_status`, `ai_recommendation_status`.

##### Exclude

- Verificación de valores internos de cada enum (cubierto en US-099 tests).

#### Acceptance Criteria Covered

AC-01, AC-05 (parcial).

#### Definition of Done

- [ ] Test verde para los 14 enums presentes.

---

### TASK-PB-P0-001-US-100-QA-003 — Test estructural Vitest: ausencia de raw SQL no permitido

| Field | Value |
|---|---|
| Area | QA / Testing |
| Type | Test |
| Priority | Must |
| Estimate | S |
| Depends On | DB-001, DB-002 |
| Source AC(s) | AC-09 (VR-04, NT-05, NT-06) |
| Technical Spec Section(s) | §10 Raw SQL Boundary; §13 (TS-08, NT-05, NT-06) |
| Backlog ID | PB-P0-001 |
| User Story ID | US-100 |
| Owner Role | QA |
| Status | To Do |

#### Objective

Verificar que `migration.sql` NO contiene patrones raw SQL que pertenecen a US-101 o US-102.

#### Scope

##### Include

- Regex defensivo para detectar:
  - Índices funcionales: `CREATE INDEX [^;]*\(lower\(`, `CREATE INDEX [^;]*\((upper|trim|coalesce)\(`.
  - Índices GIN: `CREATE INDEX [^;]*USING gin`.
  - Índices parciales: `CREATE (UNIQUE )?INDEX [^;]*WHERE`.
  - Check constraints: `CHECK\s*\(`.
- Allowlist: foreign keys con `ON DELETE`, `CREATE TABLE` con `CHECK` constraint inline declarado por Prisma (raro pero posible) → revisar si aplica.
- NT-05: agregar manualmente raw SQL de índice funcional al SQL temporalmente → test falla.
- NT-06: agregar manualmente CHECK constraint → test falla.

##### Exclude

- Patrones legítimos generados por Prisma a partir del schema (FK constraints, NOT NULL, DEFAULT, UNIQUE simple).

#### Implementation Notes

- Documentar la lista de patrones prohibidos como constante en el test para facilitar review.

#### Acceptance Criteria Covered

AC-09.

#### Definition of Done

- [ ] Test verde sobre `migration.sql` actual.
- [ ] Tests negativos NT-05 y NT-06 fallan correctamente con patrones sintéticos.

---

### TASK-PB-P0-001-US-100-QA-004 — Test del wrapper script `db-migrate-reset.sh` env-aware

| Field | Value |
|---|---|
| Area | QA / Testing |
| Type | Test |
| Priority | Must |
| Estimate | XS |
| Depends On | BE-002 |
| Source AC(s) | AC-10 (parcial), NT-03 |
| Technical Spec Section(s) | §13 (NT-03) |
| Backlog ID | PB-P0-001 |
| User Story ID | US-100 |
| Owner Role | QA |
| Status | To Do |

#### Objective

Verificar que el wrapper script falla con exit code distinto de 0 cuando se ejecuta con `CI=true`.

#### Scope

##### Include

- Test que invoca el wrapper con `CI=true` y captura exit code → debe ser 1.
- Test que invoca el wrapper con `NODE_ENV=production` → debe ser 1.
- Test que invoca el wrapper en modo local (sin `CI`, `NODE_ENV=local`) → debería invocar `prisma migrate reset` (mockear o usar `--dry-run` si Prisma soporta).

##### Exclude

- Tests de integración contra DB real (eso quedaría cubierto por el desarrollador localmente).

#### Acceptance Criteria Covered

AC-10 (parcial), NT-03.

#### Definition of Done

- [ ] Test verde para los 3 escenarios (CI=true falla; NODE_ENV=production falla; local permite).

---

### TASK-PB-P0-001-US-100-SEC-001 — Secret scan defensivo sobre `prisma/migrations/`

| Field | Value |
|---|---|
| Area | Security / Authorization |
| Type | Test |
| Priority | Must |
| Estimate | XS |
| Depends On | DB-001 |
| Source AC(s) | AC-06, SEC-01, SEC-02, SEC-03 |
| Technical Spec Section(s) | §12 Security; §13 Security Tests |
| Backlog ID | PB-P0-001 |
| User Story ID | US-100 |
| Owner Role | DevOps |
| Status | To Do |

#### Objective

Asegurar que ningún archivo en `prisma/migrations/` contiene secretos hardcodeados ni cadenas de conexión reales.

#### Scope

##### Include

- Test estructural Vitest que recorre archivos `migration.sql` y verifica ausencia de patrones: `DATABASE_URL=`, `postgresql://[^env]`, claves API, tokens (`AKIA[0-9A-Z]{16}`, `ghp_`, etc.).
- Integración con TruffleHog o gitleaks sobre `prisma/migrations/` en pipeline CI (configurado por OPS-004).

##### Exclude

- Secret scan del repositorio completo (DevOps general, no esta historia).

#### Acceptance Criteria Covered

AC-06, SEC-01, SEC-02, SEC-03.

#### Definition of Done

- [ ] Test estructural Vitest verde.
- [ ] Falsos positivos identificados y documentados (allowlist).

---

### TASK-PB-P0-001-US-100-OPS-001 — Configurar job CI `prisma-migrate-diff` (drift detection)

| Field | Value |
|---|---|
| Area | DevOps / Environment |
| Type | Setup |
| Priority | Must |
| Estimate | S |
| Depends On | BE-001 |
| Source AC(s) | AC-04 (VR-01, VR-07, NT-01) |
| Technical Spec Section(s) | §10 Environment Matrix; §13 CI Checks |
| Backlog ID | PB-P0-001 |
| User Story ID | US-100 |
| Owner Role | DevOps |
| Status | To Do |

#### Objective

Agregar un job en GitHub Actions que ejecute `pnpm db:migrate:diff` en cada PR y bloquee merge ante drift.

#### Scope

##### Include

- Job `prisma-migrate-diff` en `.github/workflows/ci.yml`.
- Trigger en PR.
- Falla del job bloquea merge.

##### Exclude

- CD integration (US-139).

#### Acceptance Criteria Covered

AC-04, EC-01, EC-04, NT-01, NT-04.

#### Definition of Done

- [ ] Job definido y ejecutándose.
- [ ] PR sintético sin migration (mutación local) → job falla.
- [ ] PR con migration coherente → job pasa.

---

### TASK-PB-P0-001-US-100-OPS-002 — Configurar job CI `prisma-migrate-smoke` con PostgreSQL service container

| Field | Value |
|---|---|
| Area | DevOps / Environment |
| Type | Setup |
| Priority | Must |
| Estimate | M |
| Depends On | BE-001, DB-002 |
| Source AC(s) | AC-03, AC-05 (VR-02, EC-02) |
| Technical Spec Section(s) | §10; §13 CI Checks; §17 Risks |
| Backlog ID | PB-P0-001 |
| User Story ID | US-100 |
| Owner Role | DevOps |
| Status | To Do |

#### Objective

Agregar un job CI que levante PostgreSQL como service container, ejecute `pnpm db:migrate:deploy` y verifique presencia de 19 tablas + 14 enums vía `information_schema`.

#### Scope

##### Include

- Job `prisma-migrate-smoke` en `.github/workflows/ci.yml`.
- `services.postgres` con healthcheck (image `postgres:14` o versión alineada con Doc 18 §10 y US-137).
- Variables de entorno: `DATABASE_URL` apuntando al service container.
- Pasos: `prisma migrate deploy` + script de verificación (Node/Bash) que consulta `information_schema.tables` y `information_schema.types`.
- Verificar idempotency: ejecutar `migrate deploy` una segunda vez → exit code 0 sin cambios.

##### Exclude

- CD integration (US-139).
- Snapshot/backup (US-137/US-139).

#### Implementation Notes

- Versión PostgreSQL alineada con Doc 18 §10 (recomendado: `14`).
- Healthcheck del service container reduce intermitencias.

#### Acceptance Criteria Covered

AC-03, AC-05, EC-02.

#### Definition of Done

- [ ] Job definido y verde en branch base.
- [ ] Verificación de 19 tablas + 14 enums implementada.
- [ ] Verificación de idempotency (segunda ejecución sin cambios).

---

### TASK-PB-P0-001-US-100-OPS-003 — Configurar job CI `migration-structural-tests`

| Field | Value |
|---|---|
| Area | DevOps / Environment |
| Type | Setup |
| Priority | Must |
| Estimate | S |
| Depends On | QA-001, QA-002, QA-003, QA-004 |
| Source AC(s) | AC-01, AC-05, AC-09, AC-10 |
| Technical Spec Section(s) | §13 CI Checks |
| Backlog ID | PB-P0-001 |
| User Story ID | US-100 |
| Owner Role | DevOps |
| Status | To Do |

#### Objective

Agregar el job CI que ejecuta la suite estructural Vitest sobre `migration.sql` y sobre el wrapper script.

#### Scope

##### Include

- Job `migration-structural-tests` en `.github/workflows/ci.yml`.
- Ejecuta `pnpm vitest run tests/migrations`.
- Falla del job bloquea merge.

##### Exclude

- Tests de schema (cubierto por US-099 OPS-005).

#### Acceptance Criteria Covered

AC-01, AC-05, AC-09, AC-10.

#### Definition of Done

- [ ] Job definido y verde sobre branch base.
- [ ] Falla del job bloquea merge.

---

### TASK-PB-P0-001-US-100-OPS-004 — Configurar job CI `migration-secret-scan`

| Field | Value |
|---|---|
| Area | DevOps / Environment |
| Type | Setup |
| Priority | Must |
| Estimate | S |
| Depends On | SEC-001 |
| Source AC(s) | AC-06, SEC-01, SEC-02, SEC-03 |
| Technical Spec Section(s) | §12 Security; §13 Security Tests |
| Backlog ID | PB-P0-001 |
| User Story ID | US-100 |
| Owner Role | DevOps |
| Status | To Do |

#### Objective

Integrar TruffleHog o gitleaks como job CI que escanea `prisma/migrations/` y bloquea merge ante secretos.

#### Scope

##### Include

- Job `migration-secret-scan` en `.github/workflows/ci.yml`.
- Scanner sobre `prisma/migrations/`.
- Allowlist para falsos positivos (documentar en el repo).

##### Exclude

- Secret scan del repositorio completo (otra historia DevOps).

#### Acceptance Criteria Covered

AC-06, NT-02.

#### Definition of Done

- [ ] Job definido y verde sobre branch base.
- [ ] PR sintético con `DATABASE_URL=postgresql://user:pass@host` → job falla.

---

### TASK-PB-P0-001-US-100-OPS-005 — Configurar job CI `migrate-reset-block-test`

| Field | Value |
|---|---|
| Area | DevOps / Environment |
| Type | Setup |
| Priority | Must |
| Estimate | XS |
| Depends On | BE-002, QA-004 |
| Source AC(s) | AC-10, SEC-05, NT-03 |
| Technical Spec Section(s) | §12 Security; §13 CI Checks |
| Backlog ID | PB-P0-001 |
| User Story ID | US-100 |
| Owner Role | DevOps |
| Status | To Do |

#### Objective

Agregar un job CI que verifica que el wrapper `db-migrate-reset.sh` falla en CI (cubre el caso real, no solo el test mockeado).

#### Scope

##### Include

- Job `migrate-reset-block-test` en `.github/workflows/ci.yml`.
- Paso que invoca el wrapper directamente y verifica exit code != 0.

##### Exclude

- Enforcement adicional (IAM) → US-139.

#### Acceptance Criteria Covered

AC-10 (parcial), NT-03.

#### Definition of Done

- [ ] Job definido y verde (en CI, el wrapper debe fallar como esperado).

---

### TASK-PB-P0-001-US-100-DOC-001 — Documentar sección `Database Migrations` en README backend

| Field | Value |
|---|---|
| Area | Documentation / Traceability |
| Type | Documentation |
| Priority | Must |
| Estimate | S |
| Depends On | BE-001, BE-002 |
| Source AC(s) | AC-07, AC-10 |
| Technical Spec Section(s) | §10 Environment Matrix; §18 Implementation Guidance |
| Backlog ID | PB-P0-001 |
| User Story ID | US-100 |
| Owner Role | Backend / Tech Writer |
| Status | To Do |

#### Objective

Agregar al README del backend la sección `Database Migrations` con comandos cotidianos, matriz de entornos, política forward-only y bloqueo `migrate reset` en pipelines.

#### Scope

##### Include

- Comandos cotidianos (`pnpm db:migrate:dev/deploy/status/diff/reset`).
- Matriz de entornos (Local/CI/QA/Demo) con comando por entorno (Doc 21 §10 como fuente).
- Política forward-only: archivos mergeados son inmutables; correcciones via nuevas migrations.
- Bloqueo `migrate reset` en CI/QA/Demo (referencia al wrapper script y al guard env-aware).
- Referencia explícita a Doc 21 §10 como source of truth operativa.

##### Exclude

- Runbook completo de operaciones (lo cubre Doc 21 §10).
- Procedimientos de incident response (otra historia DevOps).

#### Acceptance Criteria Covered

AC-07, AC-10.

#### Definition of Done

- [ ] Sección `Database Migrations` agregada al README backend.
- [ ] Tabla de matriz de entornos presente.
- [ ] Referencia a Doc 21 §10 presente.

---

### TASK-PB-P0-001-US-100-DOC-002 — Amendar Doc 18 §35.2 (split raw SQL US-100/US-101/US-102)

| Field | Value |
|---|---|
| Area | Documentation / Traceability |
| Type | Documentation |
| Priority | Should |
| Estimate | XS |
| Depends On | DB-002 |
| Source AC(s) | AC-09 (Documentation Alignment) |
| Technical Spec Section(s) | §16 Documentation Alignment Required |
| Backlog ID | PB-P0-001 |
| User Story ID | US-100 |
| Owner Role | Tech Lead |
| Status | To Do |

#### Objective

Amendar Doc 18 §35.2 (línea 1385–1387) para reflejar el split aprobado: baseline schema-only en US-100, raw SQL para indices en US-101, raw SQL para constraints en US-102.

#### Scope

##### Include

- Editar `/docs/18-Database-Physical-Design.md` §35.2 líneas 1385–1387.
- Reemplazar "Migración baseline `20260601000000_init` ... acompañada de los archivos raw SQL para constraints y unique parciales" por "Migración baseline `<ts>_init` schema-only (US-100). Raw SQL para índices avanzados en US-101. Raw SQL para constraints en US-102."
- Agregar nota: "Alineación con ADR-DB-005 y US-100 Decision Resolution §Decisión 1".

##### Exclude

- Otros cambios en Doc 18.

#### Acceptance Criteria Covered

Documentation Alignment Required (no bloqueante).

#### Definition of Done

- [ ] Doc 18 §35.2 amendado.
- [ ] PR de housekeeping documental abierto (puede ser parte del PR de housekeeping conjunto con US-099).

---

### TASK-PB-P0-001-US-100-DOC-003 — Amendar Doc 18 §35.2 (`prisma/seed.ts` → EPIC-SEED-001)

| Field | Value |
|---|---|
| Area | Documentation / Traceability |
| Type | Documentation |
| Priority | Should |
| Estimate | XS |
| Depends On | — |
| Source AC(s) | Documentation Alignment |
| Technical Spec Section(s) | §16 Documentation Alignment Required |
| Backlog ID | PB-P0-001 |
| User Story ID | US-100 |
| Owner Role | Tech Lead |
| Status | To Do |

#### Objective

Amendar Doc 18 §35.2 (línea 1465) para excluir `prisma/seed.ts` del baseline US-100.

#### Scope

##### Include

- Editar `/docs/18-Database-Physical-Design.md` §35.2 línea 1465.
- Remover la mención de `prisma/seed.ts` del scope del baseline.
- Agregar referencia a EPIC-SEED-001 (US-085, US-086, US-087, US-088) como propietario.

##### Exclude

- Cambios en Doc 11 (Data Seed Strategy).

#### Acceptance Criteria Covered

Documentation Alignment Required (no bloqueante).

#### Definition of Done

- [ ] Doc 18 §35.2 línea 1465 amendada.

---

### TASK-PB-P0-001-US-100-DOC-004 — Amendar PB-P0-001 acceptance summary (wording "up/down" → forward-only)

| Field | Value |
|---|---|
| Area | Documentation / Traceability |
| Type | Documentation |
| Priority | Could |
| Estimate | XS |
| Depends On | — |
| Source AC(s) | AC-10 (Documentation Alignment) |
| Technical Spec Section(s) | §16 Documentation Alignment Required |
| Backlog ID | PB-P0-001 |
| User Story ID | US-100 |
| Owner Role | Product Owner |
| Status | To Do |

#### Objective

Amendar la acceptance summary de PB-P0-001 en `management/artifacts/4-Product-Backlog-Prioritized.md` para reflejar la política forward-only canónica Prisma.

#### Scope

##### Include

- Editar la fila `Acceptance Summary` de PB-P0-001 (línea 200).
- Reemplazar "Migraciones reproducibles up/down" por "Migraciones reproducibles forward-only con `migrate deploy` idempotente (ADR-DB-005)".

##### Exclude

- Cambios estructurales en el backlog.

#### Acceptance Criteria Covered

Documentation Alignment Required (no bloqueante).

#### Definition of Done

- [ ] Acceptance summary actualizada.

---

## 7. Required QA Tasks

| Task ID | Test Type | Purpose |
|---|---|---|
| TASK-PB-P0-001-US-100-QA-001 | Unit (structural) | 19 `CREATE TABLE` en `migration.sql`. |
| TASK-PB-P0-001-US-100-QA-002 | Unit (structural) | 14 `CREATE TYPE ... AS ENUM` en `migration.sql`. |
| TASK-PB-P0-001-US-100-QA-003 | Unit (structural) | Ausencia de raw SQL para indices/constraints (TS-08, NT-05, NT-06). |
| TASK-PB-P0-001-US-100-QA-004 | Unit | Wrapper script `db-migrate-reset.sh` env-aware (NT-03). |
| TASK-PB-P0-001-US-100-OPS-001 | CI Gate | Drift detection (`prisma migrate diff --exit-code`) en cada PR. |
| TASK-PB-P0-001-US-100-OPS-002 | CI Gate | Smoke deploy en DB ephemeral + verificación 19 tablas + 14 enums + idempotency. |
| TASK-PB-P0-001-US-100-OPS-003 | CI Gate | Ejecución de tests estructurales en pipeline. |
| TASK-PB-P0-001-US-100-OPS-005 | CI Gate | Verificación real del bloqueo `migrate reset` en CI. |

---

## 8. Required Security Tasks

| Task ID | Security Concern | Purpose |
|---|---|---|
| TASK-PB-P0-001-US-100-SEC-001 | Secrets exposure en `migration.sql` | Verificar ausencia de patrones de secretos (test estructural). |
| TASK-PB-P0-001-US-100-OPS-004 | Secrets exposure en `prisma/migrations/` | Secret scanner CI (TruffleHog/gitleaks). |
| TASK-PB-P0-001-US-100-BE-002 | `migrate reset` accidental en pipelines | Wrapper script env-aware. |
| TASK-PB-P0-001-US-100-OPS-005 | `migrate reset` accidental en pipelines | Verificación CI del bloqueo. |

---

## 9. Required Seed / Demo Tasks

`No aplica` directamente. La habilitación del seed real ocurre indirectamente cuando OPS-002 confirma que las 19 tablas + 14 enums se crean. El seed real (`prisma/seed.ts`, fixtures, reset demo operativo) pertenece a EPIC-SEED-001 (US-085, US-086, US-087, US-088).

---

## 10. Observability / Audit Tasks

`No aplica` runtime — esta historia no introduce ejecutables ni endpoints. La observabilidad se limita a logs CI cubiertos por OPS-001..OPS-005 (jobs CI con output preservado en GitHub Actions UI).

---

## 11. Documentation / Traceability Tasks

| Task ID | Document / Artifact | Purpose |
|---|---|---|
| TASK-PB-P0-001-US-100-DOC-001 | README backend | Sección `Database Migrations` con comandos + matriz de entornos + forward-only + `migrate reset` block. Referencia a Doc 21 §10. |
| TASK-PB-P0-001-US-100-DOC-002 | `docs/18-Database-Physical-Design.md` §35.2 línea 1385–1387 | Reflejar split US-100/US-101/US-102 de raw SQL. |
| TASK-PB-P0-001-US-100-DOC-003 | `docs/18-Database-Physical-Design.md` §35.2 línea 1465 | Excluir `prisma/seed.ts` del baseline (delegado a EPIC-SEED-001). |
| TASK-PB-P0-001-US-100-DOC-004 | `management/artifacts/4-Product-Backlog-Prioritized.md` PB-P0-001 acceptance summary | Reemplazar "up/down" por "forward-only con `migrate deploy` idempotente". |

> Sinergia con US-099: los items DOC-002..DOC-004 pueden agruparse con los 4 items de Documentation Alignment de US-099 en un único PR de housekeeping post-merge a nivel del backlog item PB-P0-001.

---

## 12. Dependency Graph

```mermaid
flowchart TD
  DB_001[DB-001: Generate baseline migration]
  DB_002[DB-002: Inspect content + apply migrate dev]

  BE_001[BE-001: npm scripts db:migrate:*]
  BE_002[BE-002: Wrapper db-migrate-reset.sh]

  QA_001[QA-001: 19 CREATE TABLE]
  QA_002[QA-002: 14 enums]
  QA_003[QA-003: No raw SQL]
  QA_004[QA-004: Wrapper test]

  SEC_001[SEC-001: Secret scan defensive]

  OPS_001[OPS-001: CI prisma-migrate-diff]
  OPS_002[OPS-002: CI prisma-migrate-smoke + PG service]
  OPS_003[OPS-003: CI migration-structural-tests]
  OPS_004[OPS-004: CI migration-secret-scan]
  OPS_005[OPS-005: CI migrate-reset-block-test]

  DOC_001[DOC-001: README backend section]
  DOC_002[DOC-002: Doc 18 §35.2 split]
  DOC_003[DOC-003: Doc 18 §35.2 seed.ts]
  DOC_004[DOC-004: PB-P0-001 wording]

  DB_001 --> DB_002
  DB_001 --> QA_001
  DB_001 --> QA_002
  DB_001 --> QA_003
  DB_001 --> SEC_001
  DB_001 --> DOC_002

  DB_002 --> QA_001
  DB_002 --> QA_002
  DB_002 --> QA_003

  BE_001 --> BE_002
  BE_001 --> DOC_001
  BE_001 --> OPS_001
  BE_001 --> OPS_002

  BE_002 --> QA_004
  BE_002 --> OPS_005
  BE_002 --> DOC_001

  QA_001 --> OPS_003
  QA_002 --> OPS_003
  QA_003 --> OPS_003
  QA_004 --> OPS_003

  SEC_001 --> OPS_004
```

---

## 13. Suggested Implementation Order

### Phase 1 — Foundation

1. **DB-001** — Generar baseline init migration.
2. **BE-001** — Agregar scripts npm `db:migrate:*`.
3. **DB-002** — Inspeccionar contenido + aplicar `migrate dev` en local.
4. **BE-002** — Implementar wrapper script env-aware.
5. **SEC-001** — Secret scan defensivo (puede ir en paralelo a QA).

### Phase 2 — QA Implementation

6. **QA-001** — Test estructural 19 `CREATE TABLE`.
7. **QA-002** — Test estructural 14 enums.
8. **QA-003** — Test estructural ausencia de raw SQL.
9. **QA-004** — Test del wrapper script env-aware.

### Phase 3 — CI Gates

10. **OPS-001** — Job CI `prisma-migrate-diff`.
11. **OPS-002** — Job CI `prisma-migrate-smoke` con PostgreSQL service container.
12. **OPS-003** — Job CI `migration-structural-tests`.
13. **OPS-004** — Job CI `migration-secret-scan`.
14. **OPS-005** — Job CI `migrate-reset-block-test`.

### Phase 4 — Documentation / Housekeeping

15. **DOC-001** — README backend con sección `Database Migrations`.
16. **DOC-002** — Amenda Doc 18 §35.2 (split raw SQL).
17. **DOC-003** — Amenda Doc 18 §35.2 (`prisma/seed.ts`).
18. **DOC-004** — Amenda PB-P0-001 wording.

---

## 14. Risks & Mitigations

| Risk | Impact | Mitigation | Related Task |
|---|---|---|---|
| Desarrollador edita `schema.prisma` y olvida generar la migration. | Alto — pero detectable temprano. | OPS-001 (drift detection) bloquea merge con mensaje claro. | OPS-001 |
| Smoke test PostgreSQL service container intermitente por arranque lento. | Medio. | Healthcheck en `services.postgres.options`. | OPS-002 |
| `migration.sql` ejecuta en local pero falla en QA/Demo (drift de versión PG). | Medio. | Smoke usa misma versión PG que RDS (US-137). | OPS-002 |
| Modificación retroactiva de migration mergeado. | Alto — corrompe QA/Demo. | OPS-001 detecta + VR-05 enforcement vía revisión PR. | OPS-001 |
| `migrate reset` ejecutado accidentalmente en CI/QA/Demo. | Alto. | BE-002 wrapper + OPS-005 verificación CI real. | BE-002, OPS-005 |
| `DATABASE_URL` filtrado en `migration.sql`. | Alto. | SEC-001 + OPS-004 + test defensivo. | SEC-001, OPS-004 |
| Inclusión accidental de raw SQL para indices/constraints. | Medio — viola split. | QA-003 + VR-04 + revisión PR. | QA-003 |
| Versión de Prisma local ≠ versión CI. | Medio. | Pin exacto en `package.json` + lockfile estricto. | BE-001 |
| Doc 18 §35.2 sin amendar genera confusión durante US-101/US-102. | Bajo — mitigado por decisiones formalizadas. | DOC-002, DOC-003 ejecutadas post-merge. | DOC-002, DOC-003 |
| Wrapper script bypass via flag o variable override. | Bajo. | Documentar la política y revisar en PR; enforcement adicional en US-139 (IAM). | BE-002, DOC-001 |

---

## 15. Out of Scope Confirmation

Esta historia NO debe implementar:

- Raw SQL para índices funcionales/GIN/parciales (US-101).
- Raw SQL para check constraints, unique parciales, enforcement append-only (US-102).
- Pipeline CD (`migrate deploy` automático a QA/Demo/prod) y orquestación de release (US-139).
- Provisioning RDS, `DATABASE_URL` real en entornos no-locales (US-137).
- Snapshot/backup automático antes de `migrate deploy` (US-137/US-139).
- Seed real, fixtures, `prisma/seed.ts`, demo reset operativo (EPIC-SEED-001).
- Down migrations / rollback automático (política forward-only).
- Connection pooling, `$queryRaw` runtime, transactions runtime.
- Endpoints REST, controllers, use cases, repositorios runtime.
- Particionamiento físico, sharding, base vectorial / RAG.
- Multi-tenant enterprise, pagos reales, contratos firmados, e-signature, WhatsApp, chat, push notifications.

---

## 16. Readiness for Sprint Planning

| Check | Status |
|---|---|
| Product Backlog mapping found | **Pass** (PB-P0-001, posición 2) |
| Every AC maps to tasks | **Pass** (matriz §5) |
| Technical Spec used when available | **Pass** (primaria) |
| QA tasks included | **Pass** (QA-001..QA-004 + OPS-001..OPS-005) |
| Security tasks included if applicable | **Pass** (SEC-001 + OPS-004 + BE-002 + OPS-005) |
| Seed/demo tasks included if applicable | **N/A** (delegado a EPIC-SEED-001; cobertura indirecta vía OPS-002) |
| Observability tasks included if applicable | **N/A** (sin runtime; logs CI cubiertos por OPS-*) |
| Documentation tasks included if applicable | **Pass** (DOC-001 must + DOC-002..DOC-004 housekeeping) |
| Task dependencies clear | **Pass** (§12 grafo Mermaid) |
| Tasks small enough | **Pass** (todas ≤ M, ninguna L) |
| Ready for Sprint Planning | **Yes** |

---

## 17. Final Recommendation

`Ready for Sprint Planning`.

Justificación:

1. La Technical Specification se utiliza como fuente primaria; cada tarea referencia su sección de origen.
2. El mapeo a `PB-P0-001` (orden 1 del backlog P0; US-100 posición 2 de 4) está confirmado.
3. Los 10 AC mapean a ≥1 tarea (matriz §5); cada tarea es testable.
4. QA cubre los tres niveles requeridos por Decision Resolution §Decisión 4: generación local (DB-002) + smoke deploy CI con PostgreSQL service container (OPS-002) + drift detection CI (OPS-001), reforzado con tests estructurales (QA-001..QA-004) y test del wrapper (QA-004).
5. Seguridad cubierta por SEC-001 (test defensivo) + OPS-004 (secret scanner CI) + BE-002 (wrapper env-aware) + OPS-005 (verificación CI real del bloqueo).
6. Las 4 tareas de documentación: DOC-001 es `Must` (parte del entregable); DOC-002..DOC-004 son `Should`/`Could` housekeeping post-merge (no bloquean el sprint).
7. Todas las tareas son ≤ M en estimación; ninguna requiere split.
8. El grafo de dependencias permite paralelización razonable: Phase 1 (DB+BE+SEC) → Phase 2 (QA) → Phase 3 (OPS) → Phase 4 (DOC).
9. Las decisiones formalizadas en US-100 Decision Resolution (Q1–Q7) están encapsuladas como invariantes y ninguna tarea debe reabrirlas.
10. Sinergia con US-099 (Approved): los 4 items de Documentation Alignment de US-099 + los 3 items de US-100 pueden agruparse en un único PR de housekeeping post-merge a nivel del backlog item PB-P0-001.
