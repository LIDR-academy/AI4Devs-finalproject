# 🧾 User Story: Generar baseline migration Prisma y operar flujo `migrate dev` / `migrate deploy`

## 🆔 Metadata

| Field              | Value                                                 |
| ------------------ | ----------------------------------------------------- |
| ID                 | US-100                                                |
| Epic               | EPIC-DB-001 — Database & Prisma Physical Model        |
| Backlog Item       | PB-P0-001 — Database Schema, Migrations & Constraints |
| Feature            | Prisma Migrations — baseline + multi-environment      |
| Module / Domain    | Platform / DB                                         |
| User Role          | System                                                |
| Priority           | Must Have (P0)                                        |
| Status             | Approved                                              |
| Owner              | Tech Lead / Backend Lead                              |
| Approved By        | PO/BA Review                                          |
| Approval Date      | 2026-06-10                                            |
| Ready for Development Tasks | Yes                                          |
| Sprint / Milestone | MVP                                                   |
| Created Date       | 2026-06-09                                            |
| Last Updated       | 2026-06-10 (PO/BA approval gate)                      |

---

## 🎯 User Story

**As the** sistema EventFlow
**I want** generar la baseline init migration derivada de `prisma/schema.prisma` (US-099) y operar el flujo `prisma migrate dev` (local) + `prisma migrate deploy` (CI/QA/Demo) forward-only, con drift detection en CI
**So that** los entornos Local / CI / QA / Demo mantengan el schema sincronizado de forma reproducible, idempotente, auditada y libre de SQL crudo no controlado.

---

## 🧠 Business Context

### Context Summary

Esta historia transforma la declaración estática del schema (entregada por US-099) en migraciones SQL versionadas aplicables a PostgreSQL en los 4 entornos del MVP. Entrega:

* La **baseline init migration** `<YYYYMMDDHHMMSS>_init/migration.sql` derivada exclusivamente del schema declarado en US-099 (sin raw SQL).
* Los **scripts npm** `db:migrate:dev`, `db:migrate:deploy`, `db:migrate:status` para ejecución por entorno.
* El **job CI `prisma-migrate-diff`** que detecta drift (`prisma migrate diff --exit-code`) en cada PR.
* El **smoke test CI** que ejecuta `prisma migrate deploy` contra una DB efímera y verifica las 19 tablas + enums + relaciones esperadas.
* La **matriz de entornos** documentada conforme a Doc 21 §10.

Sin US-100, el Prisma Client generado en US-099 no puede materializarse en PostgreSQL real y se bloquean: US-101 (índices), US-102 (constraints físicos), PB-P0-002 (backend bootstrap operativo), EPIC-SEED-001 (seed real), PB-P0-017 (DevOps base) y US-137 (Connect RDS).

---

### Related Domain Concepts

Esta historia opera sobre el conjunto canónico de **19 modelos MVP + 14 enums** declarados en US-099 (`User`, `Event`, `EventType`, `EventTask`, `Budget`, `BudgetItem`, `VendorProfile`, `VendorService`, `ServiceCategory`, `Location`, `QuoteRequest`, `Quote`, `BookingIntent`, `Review`, `Notification`, `Attachment`, `AdminAction`, `AIRecommendation`, `AIPromptVersion`).

Aplica convenciones físicas EventFlow ya formalizadas en US-099: `snake_case`, `is_seed`, `deleted_at`, `created_at`, `updated_at`, `timestamptz(6)`, `numeric(14,2)`, `jsonb`.

---

### PO/BA Decisions Applied

| Decision                                | Resolution                                                                                                                                                                                                  |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Scope of US-100                         | US-100 entrega exclusivamente la baseline init migration derivada del schema declarado en US-099 (sin raw SQL), los scripts `db:migrate:*`, el job CI `prisma-migrate-diff` y el smoke test CI.              |
| Raw SQL boundary (Q1)                   | US-100 NO incluye raw SQL. Los índices funcionales / GIN / parciales se entregan en US-101 mediante migration(s) separada(s). Los check constraints, unique parciales y enforcement append-only en US-102.   |
| Relationship with US-099                | US-099 entrega `prisma/schema.prisma` declarativo. US-100 deriva la migración desde ese schema.                                                                                                              |
| Relationship with US-101                | US-101 agrega archivos migration adicionales para índices avanzados con raw SQL.                                                                                                                            |
| Relationship with US-102                | US-102 agrega archivos migration adicionales para check constraints, unique parciales y enforcement (`ai_prompt_versions` append-only).                                                                     |
| Relationship with US-139                | US-139 cubre la integración con el pipeline CD (despliegue automático de `migrate deploy` a QA/Demo/prod con orquestación de release). US-100 NO incluye CD.                                                  |
| Relationship with US-137                | US-137 (Connect RDS PostgreSQL) provisiona la BD y la `DATABASE_URL` real. US-100 asume `DATABASE_URL` proveída por env.                                                                                     |
| Rollback strategy (Q2)                  | **Forward-only canónico**. Las correcciones se aplican vía migraciones correctivas adicionales. Prisma no genera "down migrations" automáticas. Snapshots/backups previos se delegan a US-137/US-139.        |
| Drift detection ownership (Q3)          | US-100 introduce el job CI `prisma-migrate-diff` (`prisma migrate diff --exit-code`) que corre en cada PR. US-139 cubre `migrate deploy` automático en CD.                                                    |
| QA verification approach (Q4)           | Tres niveles: (a) `prisma migrate dev --create-only --name init` genera el archivo; (b) smoke test CI ejecuta `migrate deploy` contra DB ephemeral (PostgreSQL service container) + verifica 19 tablas + enums; (c) `migrate diff --exit-code` bloquea drift en PR. |
| Baseline migration name                 | Convención Prisma `<YYYYMMDDHHMMSS>_init` (timestamp de generación + sufijo `init`).                                                                                                                        |
| `prisma migrate reset` policy           | Permitido únicamente en local. Bloqueado en CI/QA/Demo vía script wrapper o env-aware guard. Enforcement técnico se documenta y puede reforzarse en US-139.                                                  |
| Runbook location                        | README del backend (`apps/backend/README.md` o equivalente) con sección `Database Migrations` que cita Doc 21 §10 como source of truth operativa.                                                            |
| Snapshot pre-deploy (recommendation Q5) | Snapshot RDS automático antes de `migrate deploy` en QA/Demo NO pertenece a US-100. Delegado a US-137 (RDS provisioning) y US-139 (CD orquestación).                                                          |
| `prisma/seed.ts` location               | `prisma/seed.ts` y fixtures NO se entregan en US-100. Pertenecen a EPIC-SEED-001 (US-085, US-086, US-087, US-088). US-100 puede declarar el bloque `seed` en `package.json` apuntando al script futuro, pero no implementa el seed real. |

---

### Assumptions

* `prisma/schema.prisma` declarado en US-099 está mergeado en la rama base.
* `DATABASE_URL` está disponible vía env vars / Secrets Manager (no en repo).
* PostgreSQL 14+ disponible en local (Docker), en CI (service container) y en QA/Demo (RDS u otro managed service).
* El módulo backend (PB-P0-002) está disponible para alojar `prisma/migrations/` y los scripts `package.json`.
* No se requiere connection pooling especial para `migrate dev` / `migrate deploy` en esta historia.
* Prisma versionado al stack confirmado (ADR-BE-001 + Doc 14).
* La generación del Prisma Client (US-099 AC-11) está validada en CI.

---

### Dependencies

* `US-099 — Prisma schema declarativo` (precondición fuerte; debe estar mergeado).
* `PB-P0-002 — Backend Modular Monolith Bootstrap` (para alojar `prisma/migrations/` y scripts).
* `DATABASE_URL` definido en env / Secrets Manager.
* `Doc 14 — Backend Technical Design`.
* `Doc 18 — Database Physical Design` §10 (Estrategia Prisma) y §35.2 (Setup baseline).
* `Doc 21 — Deployment and DevOps Design` §10 (Migration matrix por entorno).
* `Doc 22 — Architecture Decision Records` (ADR-DB-001, ADR-DB-005).

---

## 🔗 Traceability

| Source                 | Reference                                                                                                                                                                                                          |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| FRD Requirement(s)     | Transversal — habilita persistencia para FR-EVENT-*, FR-VENDOR-*, FR-QUOTE-*, FR-REVIEW-*, FR-AI-*, FR-ADMIN-*, FR-ATTACH-*                                                                                        |
| Use Case(s)            | Transversal — no implementa directamente un UC; habilita persistencia para múltiples casos de uso                                                                                                                   |
| Business Rule(s)       | Transversal (BR-SEED-005 indirectamente vía `is_seed` ya declarado en US-099)                                                                                                                                       |
| Permission Rule(s)     | No aplica directamente — capacidad técnica; ejecución limitada a pipeline backend, no humanos en producción                                                                                                          |
| Data Entity / Entities | Materializa los 19 modelos MVP declarados en US-099                                                                                                                                                                |
| API Endpoint(s)        | No aplica — capa de persistencia                                                                                                                                                                                   |
| NFR Reference(s)       | NFR-DATA-001..NFR-DATA-008 (integridad, reproducibilidad), NFR-DEMO-003 (reset idempotente), NFR-OBS-001 (logs CI)                                                                                                  |
| Related ADR(s)         | ADR-ARCH-001, ADR-BE-001, ADR-DB-001, ADR-DB-002, ADR-DB-003, ADR-DB-004, ADR-DB-005                                                                                                                                |
| Related Document(s)    | `/docs/14-Backend-Technical-Design.md`, `/docs/18-Database-Physical-Design.md` §10/§35.2, `/docs/21-Deployment-and-DevOps-Design.md` §10, `/docs/22-Architecture-Decision-Records.md` (ADR-DB-005)                  |

---

## 🧭 Scope Guardrails

### MVP Scope

* Scope Classification: **In Scope**
* MVP Relevance: **Must Have (P0)**
* Delivery Type: **Technical foundation**
* Scope Boundary: **Baseline init migration derivada del schema US-099 + flujo `migrate dev`/`migrate deploy` + drift detection en CI**

---

### Explicitly Out of Scope

* Raw SQL para índices funcionales / GIN / parciales → **US-101**
* Raw SQL para check constraints, unique parciales y enforcement append-only → **US-102**
* Integración con pipeline CD (despliegue automático) y orquestación de release → **US-139**
* Provisioning de RDS y `DATABASE_URL` real → **US-137**
* Snapshot/backup automático previo a `migrate deploy` → **US-137 / US-139**
* Seed data, fixtures, `prisma/seed.ts` real, reset demo → **EPIC-SEED-001** (US-085, US-086, US-087, US-088)
* Down migrations / rollback automático (no soportado por Prisma — forward-only)
* Connection pooling, transactions runtime, `$queryRaw` en código de aplicación
* Particionamiento físico, sharding, base vectorial / RAG
* Pagos reales, contratos firmados, e-signature, WhatsApp, push notifications, multi-tenant enterprise

---

### Scope Notes

* `prisma migrate dev` se usa **solo** en desarrollo local.
* `prisma migrate deploy` se usa en **CI (smoke + dry-run), QA y Demo** conforme a Doc 21 §10.
* `prisma migrate diff --exit-code` se ejecuta en CI en cada PR para detectar drift entre `schema.prisma` y la última migration registrada.
* `prisma migrate reset` está **permitido únicamente en local**. En CI/QA/Demo debe bloquearse vía script wrapper o env-aware guard.
* La baseline migration NO contiene secretos, `DATABASE_URL` ni datos de seed.
* La migración es **forward-only**: correcciones se aplican vía migraciones correctivas adicionales.
* `prisma/migrations/` se versiona en el repositorio; cada PR que toca `schema.prisma` debe incluir el archivo migration generado.

---

## ✅ Acceptance Criteria

## 🎯 Happy Path

### AC-01: Baseline init migration generada desde `prisma/schema.prisma`

**Given** el archivo `prisma/schema.prisma` mergeado en la rama base (US-099)
**When** se ejecuta `npx prisma migrate dev --create-only --name init` con `DATABASE_URL` válido apuntando a una DB local
**Then** se crea el directorio `prisma/migrations/<YYYYMMDDHHMMSS>_init/`
**And** el archivo `prisma/migrations/<YYYYMMDDHHMMSS>_init/migration.sql` contiene `CREATE TABLE` para las 19 entidades MVP, `CREATE TYPE ... AS ENUM` para los 14 enums y las foreign keys con `ON DELETE RESTRICT` (default) y `ON DELETE CASCADE` solo en `budget_items.budget_id`.

---

### AC-02: `prisma migrate dev` aplica la migration localmente sin errores

**Given** una base PostgreSQL local vacía y la baseline init migration generada (AC-01)
**When** se ejecuta `npx prisma migrate dev`
**Then** Prisma aplica la migration sin errores
**And** la BD resultante contiene las 19 tablas físicas (`users`, `events`, `event_types`, `event_tasks`, `budgets`, `budget_items`, `vendor_profiles`, `vendor_services`, `service_categories`, `locations`, `quote_requests`, `quotes`, `booking_intents`, `reviews`, `notifications`, `attachments`, `admin_actions`, `ai_recommendations`, `ai_prompt_versions`).

---

### AC-03: `prisma migrate deploy` es idempotente

**Given** una BD con la baseline init migration ya aplicada (AC-02)
**When** se ejecuta `npx prisma migrate deploy` por segunda vez sin cambios en `schema.prisma`
**Then** el comando termina con exit code 0
**And** no se modifica el estado de la BD
**And** el log indica que no hay migrations pendientes.

---

### AC-04: Drift detection en CI

**Given** un PR que modifica `prisma/schema.prisma` sin incluir el archivo migration correspondiente
**When** se ejecuta el job CI `prisma-migrate-diff` (`prisma migrate diff --from-migrations ./prisma/migrations --to-schema-datamodel ./prisma/schema.prisma --exit-code`)
**Then** el job falla con exit code distinto de 0
**And** bloquea el merge del PR.

---

### AC-05: Smoke test CI verifica las 19 tablas tras `migrate deploy`

**Given** una DB ephemeral (PostgreSQL en service container de GitHub Actions) y el repositorio en su estado actual
**When** el job CI `prisma-migrate-smoke` ejecuta `npx prisma migrate deploy` y luego consulta `information_schema.tables` y `information_schema.types`
**Then** confirma la presencia de las 19 tablas físicas esperadas
**And** confirma la presencia de los 14 enums (`user_role`, `currency_code`, `language_code`, `llm_provider` y los 10 enums de status por entidad)
**And** el job termina con exit code 0.

---

### AC-06: La migration NO contiene secretos hardcodeados

**Given** el archivo `prisma/migrations/<YYYYMMDDHHMMSS>_init/migration.sql`
**When** se ejecuta el secret scan defensivo en CI
**Then** no se detectan patrones de secretos (`DATABASE_URL=`, cadenas de conexión `postgresql://[^env]`, claves API, tokens, contraseñas hardcodeadas)
**And** el job falla si se detecta alguno.

---

### AC-07: Matriz de entornos documentada

**Given** la documentación del proyecto
**When** se inspeccionan README del backend y Doc 21 §10
**Then** existe una tabla por entorno con el comando exacto:

| Entorno | Comando                         | Owner                         |
| ------- | ------------------------------- | ----------------------------- |
| Local   | `prisma migrate dev`            | Desarrollador                 |
| CI      | `prisma migrate deploy --dry-run` (smoke) + `prisma migrate diff --exit-code` (drift) | GitHub Actions |
| QA      | `prisma migrate deploy`         | Pipeline `staging.yml` (US-139) |
| Demo    | `prisma migrate deploy`         | Pipeline `main.yml` (US-139)    |

---

### AC-08: Scripts npm disponibles

**Given** el `package.json` del backend
**When** se inspeccionan los scripts
**Then** existen los siguientes scripts:

* `db:migrate:dev` → `prisma migrate dev`
* `db:migrate:deploy` → `prisma migrate deploy`
* `db:migrate:status` → `prisma migrate status`
* `db:migrate:diff` → `prisma migrate diff --from-migrations ./prisma/migrations --to-schema-datamodel ./prisma/schema.prisma --exit-code`

**And** los scripts están documentados en el README del backend.

---

### AC-09: Raw SQL para indices/constraints NO incluido en US-100

**Given** el archivo `prisma/migrations/<YYYYMMDDHHMMSS>_init/migration.sql`
**When** se inspecciona su contenido
**Then** NO contiene bloques raw SQL para índices funcionales, índices GIN, índices parciales, check constraints, unique parciales ni triggers de enforcement append-only
**And** estos artefactos quedan delegados a US-101 y US-102.

---

### AC-10: Rollback strategy documentada como forward-only

**Given** la sección `Database Migrations` del README del backend
**When** se inspecciona la política de rollback
**Then** está documentado explícitamente que las migraciones son **forward-only**
**And** que las correcciones se aplican vía migraciones correctivas adicionales
**And** que `prisma migrate reset` está permitido **solo en local** y bloqueado en CI/QA/Demo.

---

## ⚠️ Edge Cases

### EC-01: Drift entre `schema.prisma` y migrations no detectado

**Given** un PR que modifica `schema.prisma` sin generar la migration correspondiente
**When** se ejecuta el job CI `prisma-migrate-diff`
**Then** el job falla con un mensaje claro indicando la divergencia.

#### Handling

* El PR no debe avanzar hasta que el archivo migration correspondiente esté incluido.
* El PR template debe recordar al desarrollador ejecutar `npx prisma migrate dev --create-only --name <change_name>` antes del push.

---

### EC-02: `migrate deploy` ejecutado en entorno con migration parcialmente aplicada

**Given** una migration con error en uno de sus statements (ej. tipo PG no soportado)
**When** `prisma migrate deploy` se ejecuta
**Then** Prisma marca la migration como `failed` en la tabla `_prisma_migrations`
**And** los entornos posteriores requieren intervención manual (corregir la migration + agregar migration correctiva).

#### Handling

* Smoke test CI ejecuta `migrate deploy` contra DB ephemeral antes de QA/Demo para capturar errores temprano.
* Documentar el procedimiento de recuperación en el README.

---

### EC-03: Ejecución accidental de `migrate reset` en CI/QA/Demo

**Given** un script o desarrollador ejecutando `prisma migrate reset` en CI/QA/Demo
**When** el guard env-aware detecta `NODE_ENV !== "local"` y `CI=true` o equivalente
**Then** el wrapper script falla con exit code distinto de 0
**And** el comando no se ejecuta.

#### Handling

* Guard implementado en wrapper script `scripts/db-migrate-reset.sh` o equivalente.
* Documentar la política en el README.

---

### EC-04: Modificación del archivo migration ya mergeado

**Given** un archivo migration ya aplicado en QA/Demo
**When** un PR modifica retroactivamente su contenido
**Then** el job CI `prisma-migrate-diff` detecta la modificación
**And** falla con mensaje claro.

#### Handling

* Política inmutable: archivos migration mergeados no se editan; se generan migraciones correctivas adicionales.
* Documentar en el README.

---

## 🚫 Validation Rules

| ID    | Rule                                                                           | Message / Behavior                                         |
| ----- | ------------------------------------------------------------------------------ | ---------------------------------------------------------- |
| VR-01 | `prisma migrate diff --exit-code` debe pasar en CI en cada PR                  | Falla del job bloquea merge                                |
| VR-02 | Smoke test CI `prisma migrate deploy` contra DB ephemeral debe pasar           | Falla del job bloquea merge                                |
| VR-03 | El archivo `migration.sql` NO debe contener secretos hardcodeados              | Secret scanner CI falla → bloquea merge                    |
| VR-04 | El archivo `migration.sql` NO debe contener raw SQL para indices/constraints   | Revisión técnica falla; raw SQL pertenece a US-101 / US-102 |
| VR-05 | Archivos migration mergeados son inmutables (no se editan retroactivamente)    | Job `prisma-migrate-diff` detecta y bloquea                |
| VR-06 | `prisma migrate reset` bloqueado en CI/QA/Demo                                 | Wrapper script falla con exit code distinto de 0           |
| VR-07 | Cada PR que modifica `schema.prisma` debe incluir el archivo migration         | Drift detection falla en CI                                |
| VR-08 | Migraciones son forward-only (no se generan down migrations)                   | Política documentada; no aplica check técnico              |

---

## 🔐 Authorization & Security Rules

| ID     | Rule                                                                                                                            |
| ------ | ------------------------------------------------------------------------------------------------------------------------------- |
| SEC-01 | El archivo `migration.sql` NO debe contener `DATABASE_URL`, contraseñas, ni cadenas de conexión reales.                          |
| SEC-02 | `DATABASE_URL` vive en env vars / Secrets Manager; nunca en repo (alineado con US-099 SEC-02 y US-138 — Configure Secrets Manager). |
| SEC-03 | Logs CI de `migrate deploy` NO deben imprimir `DATABASE_URL` ni payloads sensibles.                                              |
| SEC-04 | El acceso a ejecutar `migrate deploy` en QA/Demo está limitado al pipeline CD; humanos NO ejecutan directamente.                  |
| SEC-05 | `prisma migrate reset` NO disponible en CI/QA/Demo. Su ejecución accidental destruiría datos.                                     |

### Negative Authorization Scenarios

No aplica directamente — esta historia no introduce endpoints ni runtime authorization. La ejecución de comandos `prisma migrate` queda restringida al pipeline backend (US-139) y a desarrolladores en local.

---

## 🤖 AI Behavior

This story does not invoke AI directly.

### AI Involvement

| Field                     | Value          |
| ------------------------- | -------------- |
| AI Feature                | None           |
| Provider Layer            | Not applicable |
| Human Validation Required | Not applicable |
| Persist AIRecommendation  | No             |
| Fallback Required         | Not applicable |

### Human-in-the-loop Rules

No aplica — esta historia no invoca IA directamente.

---

## 🎨 UX / UI Notes

No aplica — capacidad técnica sin UI.

| UX Area        | Applicability |
| -------------- | ------------- |
| Screens        | No aplica     |
| Forms          | No aplica     |
| Loading states | No aplica     |
| Error states   | No aplica     |
| Empty states   | No aplica     |
| Success states | No aplica     |
| Accessibility  | No aplica     |
| i18n UI Copy   | No aplica     |

---

## 🛠 Technical Notes

### Frontend

No aplica — esta historia no requiere cambios frontend.

---

### Backend

| Topic                | Guidance                                                                                                                  |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Use Case / Service   | No aplica — capacidad declarativa + scripts                                                                                |
| Controller / Route   | No aplica                                                                                                                  |
| Authorization Policy | No aplica runtime                                                                                                          |
| Validation           | `prisma migrate diff --exit-code` + smoke `migrate deploy` + secret scan                                                   |
| Transaction Required | No aplica                                                                                                                  |
| Scripts              | `db:migrate:dev`, `db:migrate:deploy`, `db:migrate:status`, `db:migrate:diff` en `package.json` del backend                |
| Runbook              | `apps/backend/README.md` § Database Migrations, con referencia a Doc 21 §10 como source of truth operativa                 |
| `migrate reset` policy | Permitido solo en local; bloqueado en CI/QA/Demo vía wrapper script con env-aware guard                                  |

---

### Database

#### Baseline Migration

* **Path**: `prisma/migrations/<YYYYMMDDHHMMSS>_init/migration.sql`
* **Generación**: `npx prisma migrate dev --create-only --name init`
* **Contenido esperado**: `CREATE TABLE` para las 19 entidades + `CREATE TYPE ... AS ENUM` para los 14 enums + foreign keys con `ON DELETE RESTRICT` (default) y `ON DELETE CASCADE` solo en `budget_items.budget_id`.
* **Contenido NO permitido**: raw SQL para índices funcionales/GIN/parciales (US-101), raw SQL para check constraints / unique parciales / enforcement append-only (US-102), seed data (EPIC-SEED-001), secretos.

#### Environment Matrix (Doc 21 §10)

| Entorno | Comando                                                       | Trigger                          |
| ------- | ------------------------------------------------------------- | -------------------------------- |
| Local   | `pnpm db:migrate:dev`                                         | Desarrollador manualmente        |
| CI      | `pnpm db:migrate:diff` (drift) + `pnpm db:migrate:deploy --preview-feature` smoke (DB ephemeral) | GitHub Actions on every PR       |
| QA      | `pnpm db:migrate:deploy`                                      | Pipeline `staging.yml` (US-139)  |
| Demo    | `pnpm db:migrate:deploy`                                      | Pipeline `main.yml` (US-139)     |

#### Forward-only policy

* Las correcciones se aplican vía migraciones correctivas adicionales (Prisma no soporta down migrations).
* Archivos migration mergeados son inmutables.
* `prisma migrate reset` bloqueado fuera de local.

#### Prisma vs Raw SQL Boundary (reiterado)

* US-100 NO incluye raw SQL.
* US-101 entrega migration(s) con raw SQL para índices funcionales / GIN / parciales.
* US-102 entrega migration(s) con raw SQL para check constraints, unique parciales, enforcement append-only.

---

### API

| Method | Endpoint | Purpose   |
| ------ | -------- | --------- |
| —      | —        | No aplica |

---

### Observability / Audit

| Topic                             | Required                                                              |
| --------------------------------- | --------------------------------------------------------------------- |
| Correlation ID                    | No aplica                                                             |
| Runtime logs                      | No aplica                                                             |
| AdminAction                       | No aplica                                                             |
| AIRecommendation runtime creation | No aplica                                                             |
| CI logs                           | Sí, para `prisma migrate diff`, `prisma migrate deploy` (smoke), secret scan |

---

## 🧪 Test Scenarios

### Functional Tests

| ID    | Scenario                                                                                                             | Type          |
| ----- | -------------------------------------------------------------------------------------------------------------------- | ------------- |
| TS-01 | `npx prisma migrate dev --create-only --name init` produce `prisma/migrations/<ts>_init/migration.sql`               | CI / Build    |
| TS-02 | `npx prisma migrate dev` aplica la migration en DB vacía y crea las 19 tablas + 14 enums                             | Integration   |
| TS-03 | `npx prisma migrate deploy` es idempotente: segunda ejecución termina con exit code 0 sin cambios en BD              | Integration   |
| TS-04 | Job CI `prisma-migrate-diff` detecta drift cuando `schema.prisma` cambia sin migration                               | CI            |
| TS-05 | Job CI `prisma-migrate-smoke` ejecuta `migrate deploy` contra DB ephemeral y valida 19 tablas + 14 enums             | CI            |
| TS-06 | Scripts `db:migrate:dev`, `db:migrate:deploy`, `db:migrate:status`, `db:migrate:diff` declarados en `package.json`   | Unit          |
| TS-07 | README backend documenta matriz de entornos y política forward-only + `migrate reset` block                          | Docs review   |
| TS-08 | `migration.sql` NO contiene raw SQL para indices/constraints (regex check)                                            | Unit          |

---

### Negative Tests

| ID    | Scenario                                                              | Expected Result                                                        |
| ----- | --------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| NT-01 | PR modifica `schema.prisma` sin generar migration                     | Job `prisma-migrate-diff` falla con mensaje claro                       |
| NT-02 | `migration.sql` contiene `DATABASE_URL=` o secreto hardcodeado        | Secret scanner CI falla                                                 |
| NT-03 | `prisma migrate reset` ejecutado en CI                                | Wrapper script falla con exit code distinto de 0                        |
| NT-04 | Archivo migration ya mergeado se modifica retroactivamente            | Job `prisma-migrate-diff` detecta y falla                               |
| NT-05 | `migration.sql` contiene raw SQL para índices funcionales/GIN/parciales | Test estructural (TS-08) falla                                          |
| NT-06 | `migration.sql` contiene raw SQL para check constraints / unique parciales | Test estructural (TS-08) falla                                          |

---

### AI Tests

No aplica para esta historia.

---

### Authorization Tests

No aplica para esta historia.

---

### Accessibility Tests

No aplica para esta historia.

---

## 📊 Business Impact

| Field               | Value                                                                                                                |
| ------------------- | -------------------------------------------------------------------------------------------------------------------- |
| KPI Affected        | Time-to-Deploy, Technical Foundation Readiness, Demo Completion                                                       |
| Expected Impact     | Desbloquea EPIC-BE-001 operativo, EPIC-SEED-001, PB-P0-017 (DevOps), US-101, US-102, US-137                           |
| Success Criteria    | `prisma-migrate-diff` + `prisma-migrate-smoke` verdes en CI sobre PR principal; baseline `<ts>_init/migration.sql` mergeado |
| Academic Demo Value | Permite demostrar persistencia tipada reproducible, drift detection, schema-as-code, demo reset idempotente            |

---

## 🧩 Task Breakdown Readiness

### Potential Database Tasks

* Generar baseline init migration vía `prisma migrate dev --create-only --name init`.
* Verificar contenido del `migration.sql` (19 `CREATE TABLE`, 14 `CREATE TYPE`, FKs con `ON DELETE RESTRICT` y `CASCADE` solo en `budget_items.budget_id`).
* Confirmar ausencia de raw SQL en baseline.

### Potential Backend Tasks

* Agregar scripts `db:migrate:dev`, `db:migrate:deploy`, `db:migrate:status`, `db:migrate:diff` a `package.json`.
* Implementar wrapper script env-aware para bloquear `prisma migrate reset` en CI/QA/Demo.

### Potential QA Tasks

* Test estructural sobre `migration.sql` (presencia de tablas/enums esperados, ausencia de raw SQL no permitido).
* Configurar job CI `prisma-migrate-diff` (drift detection).
* Configurar job CI `prisma-migrate-smoke` (DB ephemeral PostgreSQL service container + `migrate deploy` + verificación).
* Configurar secret scan defensivo sobre `prisma/migrations/`.

### Potential DevOps Tasks

* GitHub Actions service container PostgreSQL para smoke test.
* Documentar matriz de entornos en README backend referenciando Doc 21 §10.

### Potential Documentation Tasks

* Documentar política forward-only y `migrate reset` block en README.
* Amendar Doc 18 §35.2 para reflejar split US-100/US-101/US-102 (housekeeping post-merge).
* Amendar PB-P0-001 acceptance summary (wording "up/down") (housekeeping post-merge).

---

## ✅ Definition of Ready

* [x] Decisión PO confirmando límite de alcance US-100 vs US-099/US-101/US-102/US-139 (Q1).
* [x] Decisión PO confirmando rollback strategy: forward-only canónico (Q2).
* [x] Decisión Tech confirmando drift detection ownership: US-100 introduce job CI `prisma-migrate-diff` (Q3).
* [x] Decisión QA confirmando verification approach: tres niveles (gen + smoke + drift) (Q4).
* [x] Decisión recomendada sobre snapshot pre-deploy: delegado a US-137/US-139 (Q5).
* [x] Decisión recomendada sobre runbook location: README backend + referencia a Doc 21 §10 (Q6).
* [x] Decisión recomendada sobre `migrate reset` policy: permitido solo en local; bloqueado en pipelines (Q7).
* [x] Rol claro: System.
* [x] Goal técnico claro.
* [x] Alcance delimitado.
* [x] Out of Scope explícito.
* [x] Acceptance Criteria testables (AC-01..AC-10).
* [x] Referencias arquitectónicas y ADRs ampliadas.
* [x] Entidades habilitadas listadas (19 modelos MVP de US-099).
* [x] Lista para Approval Gate.

---

## 🏁 Definition of Done

* [ ] Baseline init migration `prisma/migrations/<YYYYMMDDHHMMSS>_init/migration.sql` versionada y revisada en PR.
* [ ] Las 19 tablas + 14 enums se crean correctamente vía `prisma migrate dev` en local.
* [ ] `prisma migrate deploy` es idempotente (verificado en smoke CI).
* [ ] Scripts `db:migrate:dev`, `db:migrate:deploy`, `db:migrate:status`, `db:migrate:diff` declarados y documentados.
* [ ] Job CI `prisma-migrate-diff` configurado y bloqueando merge ante drift.
* [ ] Job CI `prisma-migrate-smoke` configurado y verificando 19 tablas + 14 enums tras `migrate deploy` en DB ephemeral.
* [ ] Secret scan defensivo sobre `prisma/migrations/` configurado en CI.
* [ ] Wrapper script env-aware para bloquear `prisma migrate reset` en pipelines.
* [ ] README backend documenta matriz de entornos, política forward-only y bloqueo de `migrate reset`.
* [ ] `migration.sql` NO contiene raw SQL para indices/constraints (verificado por test estructural).
* [ ] Tests funcionales TS-01..TS-08 verdes.
* [ ] Tests negativos NT-01..NT-06 verdes.
* [ ] PR revisado por Tech Lead.
* [ ] Documentación técnica actualizada (Documentation Alignment Required tracked post-merge).

---

## 📝 Notes

* La US-100 **no incluye raw SQL**; eso pertenece a US-101 (índices) y US-102 (constraints).
* La US-100 **no integra el pipeline CD**; eso pertenece a US-139.
* La US-100 **no provisiona RDS**; eso pertenece a US-137.
* La US-100 **no incluye seed real**; eso pertenece a EPIC-SEED-001.
* La política **forward-only** alinea con ADR-DB-005 (Prisma como mecanismo único de gestión del esquema) y Doc 21 §10.
* `prisma migrate reset` está prohibido en pipelines para proteger datos de QA/Demo.
* Cada PR que toque `schema.prisma` debe incluir el archivo migration correspondiente; el drift detection en CI hace cumplir esta regla.

### Documentation Alignment Required (no bloqueante)

Estos puntos deben amendarse en documentos fuente posteriores al merge, pero **no bloquean la aprobación de US-100** porque están respaldados por ADRs aceptados o por decisiones PO/BA formalizadas en este artefacto y en el Decision Resolution `decision-resolutions/US-100-decision-resolution.md`:

* **Doc 18 §35.2 (línea 1385–1387)** — Actualmente declara que la baseline migration `20260601000000_init` incluye raw SQL para unique parciales, check constraints, índice funcional email, default `valid_until`. Debe amendarse para reflejar el split: baseline schema-only en US-100, raw SQL para índices en US-101, raw SQL para constraints en US-102.
* **Doc 18 §35.2 (línea 1465)** — Menciona `prisma/seed.ts` como parte del baseline. Debe amendarse: `prisma/seed.ts` pertenece a EPIC-SEED-001 (US-085, US-086, US-087, US-088).
* **PB-P0-001 — Acceptance Summary** — Wording "Migraciones reproducibles up/down". Debe amendarse para reflejar la política forward-only canónica Prisma alineada con ADR-DB-005.
