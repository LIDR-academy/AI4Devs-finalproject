# Development Tasks — PB-P0-001 / US-099: Definir schema Prisma declarativo por dominio MVP

## 1. Metadata

| Field | Value |
|---|---|
| User Story ID | US-099 |
| Source User Story | `management/user-stories/US-099-prisma-schema.md` |
| Source Technical Specification | `management/technical-specs/P0/PB-P0-001/US-099-technical-spec.md` |
| Decision Resolution Artifact | `management/user-stories/decision-resolutions/US-099-decision-resolution.md` |
| Priority | P0 |
| Backlog ID | PB-P0-001 |
| Backlog Title | Database Schema, Migrations & Constraints — Implementar schema Prisma + PostgreSQL alineado al Domain Data Model |
| Backlog Execution Order | 1 (primer ítem P0 del backlog, foundation) |
| User Story Position in Backlog Item | 1 of 4 |
| Related User Stories in Backlog Item | US-099, US-100, US-101, US-102 |
| Epic | EPIC-DB-001 — Database & Prisma Physical Model |
| Backlog Item Dependencies | — (foundation) |
| Feature | Schema Prisma — definición declarativa |
| Module / Domain | Platform / DB |
| Backlog Alignment Status | **Found** |
| Task Breakdown Status | **Ready for Sprint Planning** |
| Created Date | 2026-06-09 |
| Last Updated | 2026-06-09 |

---

## 2. Source Validation

| Source | Found | Used | Notes |
|---|---|---|---|
| User Story | Yes | Yes | `Approved` (2026-06-09); 11 AC vigentes. |
| Technical Specification | Yes | **Yes (primaria)** | Sections 4–19 son la fuente principal de tareas. |
| Decision Resolution Artifact | Yes | Yes | 11 decisiones formalizadas; ninguna se reabre. |
| Product Backlog Prioritized | Yes | Yes | PB-P0-001, líneas 185–202. Orden de ejecución 1. |
| ADRs | Yes | Yes | ADR-DB-001..005, ADR-AI-006, ADR-BE-001, ADR-ARCH-001. |

---

## 3. Backlog Execution Context

### Parent Backlog Item

`PB-P0-001 — Database Schema, Migrations & Constraints` (P0, EPIC-DB-001). Cubre la fundación completa de persistencia EventFlow: schema Prisma + migraciones reproducibles + índices críticos + enforcement de constraints C-001..C-062.

### Execution Order Rationale

US-099 se ejecuta en primer lugar dentro de `PB-P0-001` porque:

- El orden sugerido del backlog es DB → Backend → API → Security → AI → Frontend → Seed → DevOps base.
- Sin schema declarativo validado, US-100 (migraciones), US-101 (índices) y US-102 (constraints) no pueden derivarse.
- Sin Prisma Client tipado, los módulos backend (PB-P0-002+) no pueden importar tipos del dominio.
- Sin marcas `is_seed` y `deletedAt`, el seed (EPIC-SEED-001) y la moderación admin (P1) carecen de fundación.
- Mitiga R-14 ("Migraciones Prisma rompen entornos") al validar la declaración estática antes de tocar la BD.

### Related User Stories in Same Backlog Item

| User Story | Role in Backlog Item | Suggested Order |
|---|---|---|
| **US-099** | Schema Prisma declarativo + Prisma Client | **1** |
| US-100 | Migraciones Prisma ejecutables y SQL raw | 2 |
| US-101 | Índices críticos (FK, status, fechas, funcionales, GIN, parciales) | 3 |
| US-102 | Constraints C-001..C-062 + enforcement append-only `ai_prompt_versions` | 4 |

---

## 4. Task Breakdown Summary

| Area | Number of Tasks | Notes |
|---|---:|---|
| DevOps / Environment (OPS) | 5 | Setup Prisma deps + scripts + 3 CI jobs. |
| Database / Prisma (DB) | 8 | 1 enums + 6 grupos de modelos + 1 cross-cutting review. |
| Backend (BE) | 1 | Verificación de generación e import surface del Prisma Client. |
| Security / Authorization (SEC) | 1 | Secret scan defensivo sobre `schema.prisma`. |
| QA / Testing (QA) | 8 | TS-03..TS-10 + NT-01..NT-08 cobertura completa. |
| Seed / Demo Data (SEED) | 0 | Cubierto por QA-002 (validación `isSeed`). |
| Observability / Audit (OBS) | 0 | Cubierto por OPS-003/004/005 (logs CI). |
| Documentation / Traceability (DOC) | 4 | Housekeeping documental post-merge (no bloqueante). |
| **Total** | **27** | |

---

## 5. Traceability Matrix

| Acceptance Criterion | Technical Spec Section | Task IDs |
|---|---|---|
| AC-01 — Declaración de 19 modelos MVP | §10 Database/Prisma Design — Models Impacted | DB-002, DB-003, DB-004, DB-005, DB-006, DB-007, DB-008, QA-001 |
| AC-02 — Enums canónicos separados por entidad | §10 Database/Prisma Design — Enums | DB-001, QA-004, QA-005 |
| AC-03 — Convenciones de naming físico (`@@map`/`@map`) | §10 Database/Prisma Design — Naming | DB-002..DB-007, DB-008 (review), QA-008 |
| AC-04 — Tipos PostgreSQL específicos | §10 Database/Prisma Design — Fields/Columns | DB-002..DB-007, DB-008 (review) |
| AC-05 — Timestamps obligatorios | §10 Database/Prisma Design — Fields/Columns | DB-002..DB-008 |
| AC-06 — Marca `isSeed` obligatoria | §10 Database/Prisma Design — Fields/Columns; §15 Seed Impact | DB-002..DB-008, QA-002 |
| AC-07 — Soft delete declarativo | §10 Database/Prisma Design — Fields/Columns | DB-002, DB-003, DB-006, DB-008, QA-003 |
| AC-08 — Relaciones explícitas y `onDelete` | §10 Database/Prisma Design — Relations | DB-005 (Cascade BudgetItem), DB-008, QA (cubierto en DB-008 review) |
| AC-09 — `EventType` UUID PK + `code` unique | §10 Database/Prisma Design — Models Impacted | DB-002, QA-006 |
| AC-10 — `AIPromptVersion` (estrategia híbrida) | §11 AI/PromptOps Design | DB-008, QA-007 |
| AC-11 — Generación del Prisma Client | §7 Backend Technical Design; §13 Testing — CI Checks | BE-001, OPS-004 |
| EC-01..EC-04 (Edge Cases) | §13 Testing Strategy | QA-001..QA-008 |
| VR-01..VR-10 (Validation Rules) | §13 Testing Strategy | OPS-003, OPS-004, QA-001..QA-008 |
| SEC-01..SEC-05 (Security Rules) | §12 Security Design | SEC-001 |

Cada AC mapea a ≥1 tarea. Cada tarea mapea a ≥1 sección del Technical Spec.

---

## 6. Development Tasks

### TASK-PB-P0-001-US-099-OPS-001 — Instalar Prisma y configurar datasource/generator

| Field | Value |
|---|---|
| Area | DevOps / Environment |
| Type | Setup |
| Priority | Must |
| Estimate | S |
| Depends On | — |
| Source AC(s) | AC-11 (precondición) |
| Technical Spec Section(s) | §5 Backend Architecture; §18 Implementation Guidance |
| Backlog ID | PB-P0-001 |
| User Story ID | US-099 |
| Owner Role | Backend |
| Status | To Do |

#### Objective

Agregar Prisma como dependencia del backend y configurar el bloque `datasource db` (PostgreSQL) y el bloque `generator client` (Prisma Client JS) en `prisma/schema.prisma`.

#### Scope

##### Include

- Instalar `prisma` (dev) y `@prisma/client` (prod) en el backend.
- Crear `prisma/schema.prisma` con `generator client { provider = "prisma-client-js" }` y `datasource db { provider = "postgresql"; url = env("DATABASE_URL") }`.
- Definir binary targets si el deploy lo requiere (Doc 21).
- Crear `.env.example` con `DATABASE_URL` dummy.

##### Exclude

- Conexión real a base de datos.
- Migraciones (US-100).

#### Implementation Notes

- Versión de Prisma alineada al stack confirmado (Doc 14, Doc 18).
- El binary target debe contemplar el entorno de despliegue final (Doc 21).
- El bloque `datasource` lee `DATABASE_URL` desde `process.env`; nunca hardcoded (SEC-01, SEC-02).

#### Acceptance Criteria Covered

AC-11 (precondición).

#### Definition of Done

- [ ] `prisma` y `@prisma/client` listados en `package.json` con versiones bloqueadas.
- [ ] `prisma/schema.prisma` con bloques `generator` y `datasource` correctamente configurados.
- [ ] `.env.example` incluye `DATABASE_URL=postgresql://user:password@localhost:5432/eventflow` (dummy).
- [ ] Sin `DATABASE_URL` real ni secretos hardcodeados en repo.

---

### TASK-PB-P0-001-US-099-OPS-002 — Agregar npm scripts `db:validate` y `db:generate`

| Field | Value |
|---|---|
| Area | DevOps / Environment |
| Type | Setup |
| Priority | Must |
| Estimate | XS |
| Depends On | OPS-001 |
| Source AC(s) | AC-01, AC-11 |
| Technical Spec Section(s) | §13 Testing Strategy — CI Checks |
| Backlog ID | PB-P0-001 |
| User Story ID | US-099 |
| Owner Role | Backend |
| Status | To Do |

#### Objective

Agregar scripts npm/pnpm que ejecuten `prisma validate` y `prisma generate` localmente y en CI.

#### Scope

##### Include

- Script `db:validate` → `prisma validate`.
- Script `db:generate` → `prisma generate`.
- Script consolidado `db:check` → `db:validate && db:generate` (opcional).

##### Exclude

- Scripts de migración (`db:migrate`) → US-100.
- Scripts de seed → EPIC-SEED-001.

#### Implementation Notes

- Documentar los scripts en el README del backend.

#### Acceptance Criteria Covered

AC-01 (verificable vía `db:validate`), AC-11 (verificable vía `db:generate`).

#### Definition of Done

- [ ] Scripts `db:validate` y `db:generate` declarados en `package.json`.
- [ ] Ambos scripts ejecutan exitosamente en local con `DATABASE_URL` dummy.

---

### TASK-PB-P0-001-US-099-DB-001 — Declarar enums base y enums de status por entidad

| Field | Value |
|---|---|
| Area | Database / Prisma |
| Type | Implementation |
| Priority | Must |
| Estimate | M |
| Depends On | OPS-001 |
| Source AC(s) | AC-02 |
| Technical Spec Section(s) | §10 Database/Prisma Design — Enums |
| Backlog ID | PB-P0-001 |
| User Story ID | US-099 |
| Owner Role | Backend |
| Status | To Do |

#### Objective

Declarar los 4 enums base + 10 enums de status por entidad en `prisma/schema.prisma` conforme a Doc 6, Doc 18 y la Decision Resolution §Decisión 5 / §Decisión 11.

#### Scope

##### Include

- **Enums base**: `UserRole` (organizer, vendor, admin), `CurrencyCode` (GTQ, EUR, MXN, COP, USD), `LanguageCode` (es-LATAM, es-ES, pt, en), `LLMProvider` (openai, mock, anthropic).
- **Enums de status por entidad**: `EventStatus`, `QuoteRequestStatus`, `QuoteStatus`, `BookingIntentStatus`, `ReviewStatus`, `NotificationStatus`, `AttachmentStatus`, `VendorProfileStatus`, `VendorServiceStatus`, `AIRecommendationStatus`.
- Valores de cada enum tomados de la máquina de estados específica de su entidad (Doc 6 §6, Doc 18 §9.1).

##### Exclude

- Reuso de un enum genérico `Status` (prohibido por VR-08).
- Enums de transiciones (lógica) — pertenece a use cases futuros.
- Tablas físicas para `Role`, `Currency` o `Language` (van como enums, no tablas — Decision §11).

#### Implementation Notes

- `AIRecommendationStatus` debe incluir mínimo: `pending`, `accepted`, `edited`, `rejected`, `discarded` (cubre flujo HITL).
- `QuoteStatus` debe reflejar `draft → sent → accepted/rejected/expired` (Doc 18 §9.1).
- `EventStatus` debe reflejar `draft → published → cancelled` (Doc 18 §9.1).

#### Acceptance Criteria Covered

AC-02.

#### Definition of Done

- [ ] 4 enums base declarados con sus valores canónicos.
- [ ] 10 enums de status por entidad declarados con sus valores canónicos.
- [ ] `prisma validate` pasa.
- [ ] No existe un enum genérico `Status` reutilizado en múltiples entidades.

---

### TASK-PB-P0-001-US-099-DB-002 — Declarar modelos Platform/Shared (`User`, `Location`, `ServiceCategory`, `EventType`)

| Field | Value |
|---|---|
| Area | Database / Prisma |
| Type | Implementation |
| Priority | Must |
| Estimate | M |
| Depends On | DB-001 |
| Source AC(s) | AC-01, AC-03, AC-04, AC-05, AC-06, AC-07, AC-09 |
| Technical Spec Section(s) | §10 Database/Prisma Design — Models Impacted; §18 Implementation Guidance |
| Backlog ID | PB-P0-001 |
| User Story ID | US-099 |
| Owner Role | Backend |
| Status | To Do |

#### Objective

Declarar los 4 modelos Platform/Shared en `prisma/schema.prisma` aplicando las convenciones físicas EventFlow.

#### Scope

##### Include

- `User` con `id @id @default(uuid()) @db.Uuid`, email único, `passwordHash`, `role UserRole`, `preferredLanguage LanguageCode`, timestamps + `isSeed`.
- `Location` con UUID PK, `country`, `region`, `city`, `lat`/`lng` opcionales, timestamps + `isSeed` + `deletedAt`.
- `ServiceCategory` con UUID PK, `code @unique`, `label`, `description`, `isActive`, timestamps + `isSeed` + `deletedAt`.
- `EventType` con `id @id @default(uuid()) @db.Uuid` + `code @unique`, `label`, `description`, `isActive`, timestamps + `isSeed` + `deletedAt` (AC-09, ADR-DB-002).
- Aplicar `@@map("snake_case_plural")` (`users`, `locations`, `service_categories`, `event_types`).
- Aplicar `@map("snake_case")` donde el nombre físico difiere del nombre lógico.
- Aplicar `@db.Timestamptz(6)` en timestamps.

##### Exclude

- Relaciones hacia modelos aún no declarados (se agregarán en DB-008 cross-cutting review).
- Índices avanzados (US-101).
- Constraints físicos complejos (US-102).

#### Implementation Notes

- **`EventType` NO usa `code` como PK** (decisión vigente sobre Doc 18 §11/§12). Aplica ADR-DB-002 (UUID v4 PK universal).
- `Location` y `ServiceCategory` son MVP obligatorios (Decision §7).
- `User.passwordHash` almacena únicamente el hash (SEC-03).

#### Acceptance Criteria Covered

AC-01 (parcial: 4 modelos), AC-03, AC-04, AC-05, AC-06, AC-07 (3 modelos: Location, ServiceCategory, EventType), AC-09.

#### Definition of Done

- [ ] 4 modelos declarados con `@@map` correcto y campos en `camelCase` con `@map` cuando aplica.
- [ ] `EventType` declara `id UUID` PK + `code @unique`.
- [ ] Soft delete (`deletedAt`) declarado en `Location`, `ServiceCategory`, `EventType`.
- [ ] `isSeed` declarado en los 4 modelos.
- [ ] Timestamps con `@db.Timestamptz(6)`.
- [ ] `prisma validate` pasa.

---

### TASK-PB-P0-001-US-099-DB-003 — Declarar modelos Vendor (`VendorProfile`, `VendorService`, `Attachment`)

| Field | Value |
|---|---|
| Area | Database / Prisma |
| Type | Implementation |
| Priority | Must |
| Estimate | M |
| Depends On | DB-001, DB-002 |
| Source AC(s) | AC-01, AC-03, AC-04, AC-05, AC-06, AC-07, AC-08 |
| Technical Spec Section(s) | §10 Database/Prisma Design — Models Impacted, Relations |
| Backlog ID | PB-P0-001 |
| User Story ID | US-099 |
| Owner Role | Backend |
| Status | To Do |

#### Objective

Declarar los 3 modelos Vendor con sus relaciones, mappings físicos y conventions.

#### Scope

##### Include

- `VendorProfile` con UUID PK, FK `userId → User.id`, `status VendorProfileStatus`, FK `locationId? → Location.id`, timestamps + `isSeed` + `deletedAt`.
- `VendorService` con UUID PK, FK `vendorProfileId → VendorProfile.id`, FK `serviceCategoryId → ServiceCategory.id`, `status VendorServiceStatus`, `priceMin`/`priceMax` `@db.Decimal(14,2)`, timestamps + `isSeed` + `deletedAt`.
- `Attachment` con UUID PK, `entityType String`, `entityId String @db.Uuid` (polimórfico, sin FK), `status AttachmentStatus`, `url`, `fileName`, `mimeType`, timestamps + `isSeed` + `deletedAt`.
- Aplicar `@@map("vendor_profiles" | "vendor_services" | "attachments")`.
- Aplicar `@relation` explícito + `onDelete: Restrict` (default) en FKs.

##### Exclude

- Validación de consistencia del polimorfismo (`entityType` válido) → US-102.
- Índices por `serviceCategoryId`, `vendorProfileId` → US-101 (los índices simples naturales pueden agregarse aquí si son obvios).

#### Implementation Notes

- `Attachment` es polimórfico: no declara FK formal hacia `Event`, `VendorProfile`, `Review`, etc. La consistencia se valida en aplicación.
- `priceMin`/`priceMax` deben usar `@db.Decimal(14, 2)`.

#### Acceptance Criteria Covered

AC-01 (parcial: 3 modelos), AC-03, AC-04, AC-05, AC-06, AC-07 (3 modelos), AC-08 (Restrict default).

#### Definition of Done

- [ ] 3 modelos declarados con `@@map` correcto.
- [ ] FKs con `@relation` explícito + `onDelete: Restrict`.
- [ ] Soft delete (`deletedAt`) declarado en los 3 modelos.
- [ ] `isSeed` declarado en los 3 modelos.
- [ ] Montos con `@db.Decimal(14,2)`.
- [ ] `prisma validate` pasa.

---

### TASK-PB-P0-001-US-099-DB-004 — Declarar modelos Event (`Event`, `EventTask`, `Budget`, `BudgetItem`)

| Field | Value |
|---|---|
| Area | Database / Prisma |
| Type | Implementation |
| Priority | Must |
| Estimate | M |
| Depends On | DB-001, DB-002 |
| Source AC(s) | AC-01, AC-03, AC-04, AC-05, AC-06, AC-08 |
| Technical Spec Section(s) | §10 Database/Prisma Design — Models Impacted, Relations |
| Backlog ID | PB-P0-001 |
| User Story ID | US-099 |
| Owner Role | Backend |
| Status | To Do |

#### Objective

Declarar los 4 modelos del bounded context Event, incluyendo la única excepción de `onDelete: Cascade` permitida (`Budget → BudgetItem`).

#### Scope

##### Include

- `Event` con UUID PK, FK `userId → User.id`, FK `eventTypeId → EventType.id`, FK `locationId? → Location.id`, `status EventStatus`, `currency CurrencyCode`, `language LanguageCode`, `eventDate`, timestamps + `isSeed`.
- `EventTask` con UUID PK, FK `eventId → Event.id`, `title`, `dueDate?`, `status`, `origin` (manual / ai), timestamps + `isSeed`.
- `Budget` con UUID PK, FK 1:1 `eventId → Event.id @unique`, `totalPlanned` y `totalCommitted` `@db.Decimal(14,2)`, timestamps + `isSeed`.
- `BudgetItem` con UUID PK, FK `budgetId → Budget.id` con **`onDelete: Cascade`** (única excepción AC-08), `label`, `categoryCode`, `amountPlanned`/`amountCommitted` `@db.Decimal(14,2)`, timestamps + `isSeed`.
- Aplicar `@@map("events" | "event_tasks" | "budgets" | "budget_items")`.

##### Exclude

- Lógica de máquina de estados de `Event` → use cases backend.
- Soft delete (no aplica a estos 4 modelos según AC-07; se filtran por status).

#### Implementation Notes

- **`onDelete: Cascade` exclusivamente en `BudgetItem.budgetId → Budget.id`** — única composición pura permitida (Decision §10).
- `Event` no usa soft delete; el ciclo de vida se controla con `EventStatus`.
- Montos con `@db.Decimal(14, 2)`.

#### Acceptance Criteria Covered

AC-01 (parcial: 4 modelos), AC-03, AC-04, AC-05, AC-06, AC-08 (Cascade explícito en BudgetItem).

#### Definition of Done

- [ ] 4 modelos declarados con `@@map` correcto.
- [ ] FKs con `@relation` explícito; default `Restrict`; `Cascade` aplicado solo en `BudgetItem.budgetId`.
- [ ] Montos con `@db.Decimal(14,2)`.
- [ ] `isSeed` declarado en los 4 modelos.
- [ ] Timestamps con `@db.Timestamptz(6)`.
- [ ] `prisma validate` pasa.

---

### TASK-PB-P0-001-US-099-DB-005 — Declarar modelos Quote (`QuoteRequest`, `Quote`, `BookingIntent`)

| Field | Value |
|---|---|
| Area | Database / Prisma |
| Type | Implementation |
| Priority | Must |
| Estimate | M |
| Depends On | DB-001, DB-002, DB-003, DB-004 |
| Source AC(s) | AC-01, AC-03, AC-04, AC-05, AC-06, AC-08 |
| Technical Spec Section(s) | §10 Database/Prisma Design — Models Impacted, Relations |
| Backlog ID | PB-P0-001 |
| User Story ID | US-099 |
| Owner Role | Backend |
| Status | To Do |

#### Objective

Declarar los 3 modelos del bounded context Quote con sus relaciones hacia Event, ServiceCategory y VendorProfile.

#### Scope

##### Include

- `QuoteRequest` con UUID PK, FK `eventId → Event.id`, FK `serviceCategoryId → ServiceCategory.id`, `status QuoteRequestStatus`, `aiBriefMeta Json? @db.JsonB`, timestamps + `isSeed`.
- `Quote` con UUID PK, FK `quoteRequestId → QuoteRequest.id`, FK `vendorProfileId → VendorProfile.id`, `amount @db.Decimal(14,2)`, `currency CurrencyCode`, `validUntil DateTime @db.Timestamptz(6)`, `status QuoteStatus`, timestamps + `isSeed`.
- `BookingIntent` con UUID PK, FK `quoteId → Quote.id`, `status BookingIntentStatus`, timestamps + `isSeed`.
- Aplicar `@@map("quote_requests" | "quotes" | "booking_intents")`.

##### Exclude

- Lógica de expiración automática (`auto-expire`) → US-055.
- Pagos / contratos firmados (fuera de MVP).

#### Implementation Notes

- `aiBriefMeta` usa `@db.JsonB` para payload acotado (ADR-DB-003).
- Validación de validez de quote (15 días) y máquinas de estado → US-053 / US-052 (no en US-099).

#### Acceptance Criteria Covered

AC-01 (parcial: 3 modelos), AC-03, AC-04, AC-05, AC-06, AC-08 (Restrict default).

#### Definition of Done

- [ ] 3 modelos declarados con `@@map` correcto.
- [ ] FKs con `@relation` explícito + `onDelete: Restrict`.
- [ ] Montos con `@db.Decimal(14,2)`.
- [ ] `aiBriefMeta` con `@db.JsonB`.
- [ ] `isSeed` declarado en los 3 modelos.
- [ ] `prisma validate` pasa.

---

### TASK-PB-P0-001-US-099-DB-006 — Declarar modelos transversales (`Review`, `Notification`)

| Field | Value |
|---|---|
| Area | Database / Prisma |
| Type | Implementation |
| Priority | Must |
| Estimate | S |
| Depends On | DB-001, DB-002, DB-003, DB-005 |
| Source AC(s) | AC-01, AC-03, AC-04, AC-05, AC-06, AC-07 (Review) |
| Technical Spec Section(s) | §10 Database/Prisma Design — Models Impacted, Relations |
| Backlog ID | PB-P0-001 |
| User Story ID | US-099 |
| Owner Role | Backend |
| Status | To Do |

#### Objective

Declarar los modelos transversales `Review` (con soft delete) y `Notification`.

#### Scope

##### Include

- `Review` con UUID PK, FK `bookingIntentId → BookingIntent.id`, FK `vendorProfileId → VendorProfile.id`, FK `authorId → User.id`, `rating Int`, `comment String?`, `status ReviewStatus`, timestamps + `isSeed` + **`deletedAt`** (AC-07).
- `Notification` con UUID PK, FK `userId → User.id`, `type String`, `payload Json @db.JsonB`, `status NotificationStatus`, `readAt DateTime?`, timestamps + `isSeed`.
- Aplicar `@@map("reviews" | "notifications")`.

##### Exclude

- Validación de rating (1..5) → US-102 (check constraint).
- Moderación admin runtime → US-067.

#### Implementation Notes

- `Review` requiere soft delete uniforme (`deletedAt`) según AC-07 y Doc 18 §26 amendado.
- `Notification.payload` usa `@db.JsonB` (payload bounded por tipo).

#### Acceptance Criteria Covered

AC-01 (parcial: 2 modelos), AC-03, AC-04, AC-05, AC-06, AC-07 (Review).

#### Definition of Done

- [ ] 2 modelos declarados con `@@map` correcto.
- [ ] FKs con `@relation` explícito + `onDelete: Restrict`.
- [ ] `Review` declara `deletedAt`.
- [ ] `Notification.payload` con `@db.JsonB`.
- [ ] `isSeed` declarado en los 2 modelos.
- [ ] `prisma validate` pasa.

---

### TASK-PB-P0-001-US-099-DB-007 — Declarar modelos Admin/AI (`AdminAction`, `AIRecommendation`, `AIPromptVersion`)

| Field | Value |
|---|---|
| Area | Database / Prisma |
| Type | Implementation |
| Priority | Must |
| Estimate | M |
| Depends On | DB-001, DB-002, DB-004 |
| Source AC(s) | AC-01, AC-03, AC-04, AC-05, AC-06, AC-10 |
| Technical Spec Section(s) | §10 Database/Prisma Design — Models Impacted; §11 AI/PromptOps Design |
| Backlog ID | PB-P0-001 |
| User Story ID | US-099 |
| Owner Role | Backend |
| Status | To Do |

#### Objective

Declarar los modelos `AdminAction`, `AIRecommendation` y `AIPromptVersion` conforme a ADR-AI-006 (estrategia híbrida).

#### Scope

##### Include

- `AdminAction` con UUID PK, FK `adminUserId → User.id`, `action String`, `targetEntity String`, `targetId String @db.Uuid`, `metadata Json? @db.JsonB`, timestamps + `isSeed`.
- `AIRecommendation` con UUID PK, FK `eventId → Event.id`, FK `aiPromptVersionId → AIPromptVersion.id`, `kind String`, `inputPayload Json @db.JsonB`, `outputPayload Json @db.JsonB`, `status AIRecommendationStatus`, timestamps + `isSeed`.
- `AIPromptVersion` con UUID PK, `promptKey String`, `version String`, `provider LLMProvider`, `templateChecksum String`, `description String?`, timestamps. `isSeed` no aplica (append-only conceptual).
- Aplicar `@@map("admin_actions" | "ai_recommendations" | "ai_prompt_versions")`.
- Aplicar `@@unique([promptKey, version])` en `AIPromptVersion`.

##### Exclude

- Enforcement append-only (trigger NO UPDATE / NO DELETE) → US-102.
- Sincronización automática `PromptRegistry` (código) ↔ `ai_prompt_versions` (BD) → historias AI futuras.

#### Implementation Notes

- `AIRecommendation.aiPromptVersionId` permite trazar qué versión de prompt produjo cada output (ADR-AI-006).
- `AIRecommendationStatus` ya está declarado en DB-001 con valores `pending / accepted / edited / rejected / discarded` (HITL).
- `AIPromptVersion` no declara `deletedAt` ni `isSeed`: su naturaleza append-only se documenta como intención.

#### Acceptance Criteria Covered

AC-01 (parcial: 3 modelos), AC-03, AC-04, AC-05, AC-06 (Admin/AIRecommendation), AC-10.

#### Definition of Done

- [ ] 3 modelos declarados con `@@map` correcto.
- [ ] FKs con `@relation` explícito + `onDelete: Restrict`.
- [ ] JSON con `@db.JsonB`.
- [ ] `AIPromptVersion.promptKey + version` con `@@unique` compuesto.
- [ ] `prisma validate` pasa.

---

### TASK-PB-P0-001-US-099-DB-008 — Cross-cutting review del schema y validación final

| Field | Value |
|---|---|
| Area | Database / Prisma |
| Type | Review |
| Priority | Must |
| Estimate | S |
| Depends On | DB-001, DB-002, DB-003, DB-004, DB-005, DB-006, DB-007 |
| Source AC(s) | AC-01, AC-03, AC-04, AC-05, AC-06, AC-07, AC-08, AC-09, AC-10 |
| Technical Spec Section(s) | §10 Database/Prisma Design; §18 Implementation Guidance |
| Backlog ID | PB-P0-001 |
| User Story ID | US-099 |
| Owner Role | Tech Lead |
| Status | To Do |

#### Objective

Revisión transversal del `schema.prisma` completo para asegurar consistencia, cobertura de convenciones y ausencia de regresiones.

#### Scope

##### Include

- Verificar que los 19 modelos MVP están presentes.
- Verificar `@@map("snake_case_plural")` en cada modelo.
- Verificar `@map("snake_case")` donde corresponda.
- Verificar `@db.Timestamptz(6)`, `@db.Decimal(14,2)`, `@db.JsonB` aplicados consistentemente.
- Verificar `isSeed` presente en cada modelo MVP operativo.
- Verificar `deletedAt` presente en los 7 modelos con soft delete.
- Verificar `@relation` explícito + `onDelete: Restrict` (default).
- Verificar `onDelete: Cascade` exclusivo en `BudgetItem.budgetId`.
- Verificar `EventType` con UUID PK + `code @unique`.
- Verificar `AIPromptVersion` declarado.
- Ejecutar `npx prisma validate` localmente.

##### Exclude

- Cambios de fondo en modelos individuales (eso pertenece a DB-002..DB-007).

#### Implementation Notes

- Esta tarea actúa como puerta de calidad pre-PR. Si algo falta, abrir issue/sub-tarea contra el modelo correspondiente.

#### Acceptance Criteria Covered

AC-01..AC-10 (verificación transversal).

#### Definition of Done

- [ ] Checklist transversal completo y documentado en el PR.
- [ ] `prisma validate` pasa sin errores ni warnings bloqueantes.
- [ ] Los 7 modelos con soft delete confirmados: `Review`, `Attachment`, `VendorProfile`, `VendorService`, `ServiceCategory`, `EventType`, `Location`.
- [ ] `Cascade` confirmado exclusivamente en `BudgetItem.budgetId`.

---

### TASK-PB-P0-001-US-099-BE-001 — Generar Prisma Client y verificar import surface

| Field | Value |
|---|---|
| Area | Backend |
| Type | Implementation |
| Priority | Must |
| Estimate | XS |
| Depends On | DB-008 |
| Source AC(s) | AC-11 |
| Technical Spec Section(s) | §7 Backend Technical Design; §5 Backend Architecture |
| Backlog ID | PB-P0-001 |
| User Story ID | US-099 |
| Owner Role | Backend |
| Status | To Do |

#### Objective

Ejecutar `npx prisma generate` y verificar que los tipos del Prisma Client quedan disponibles para importación desde `src/`.

#### Scope

##### Include

- Ejecutar `prisma generate` localmente con `DATABASE_URL` dummy.
- Verificar que `@prisma/client` exporta los tipos esperados (`PrismaClient`, `User`, `Event`, ..., los 19 modelos + enums).
- Crear un archivo de smoke (`src/infrastructure/prisma/client.ts`) que instancia `new PrismaClient()` sin conectarse (smoke type-level únicamente).

##### Exclude

- Inyección de `PrismaClient` en use cases reales → historias backend.
- Connection pooling, transactions → historias backend posteriores.

#### Implementation Notes

- El smoke debe compilar con TypeScript (`tsc --noEmit`).
- No debe ejecutarse `connect()` ni conectarse a BD real.

#### Acceptance Criteria Covered

AC-11.

#### Definition of Done

- [ ] `npx prisma generate` pasa sin warnings bloqueantes.
- [ ] Imports de tipos desde `@prisma/client` compilan en `src/`.
- [ ] Smoke type-level disponible y compilando.

---

### TASK-PB-P0-001-US-099-OPS-003 — Configurar job CI `prisma-validate`

| Field | Value |
|---|---|
| Area | DevOps / Environment |
| Type | Setup |
| Priority | Must |
| Estimate | S |
| Depends On | OPS-002 |
| Source AC(s) | AC-01 (VR-01) |
| Technical Spec Section(s) | §13 Testing Strategy — CI Checks |
| Backlog ID | PB-P0-001 |
| User Story ID | US-099 |
| Owner Role | DevOps |
| Status | To Do |

#### Objective

Agregar un job en GitHub Actions que ejecute `pnpm db:validate` (o equivalente) en cada PR que toque `prisma/schema.prisma`.

#### Scope

##### Include

- Job `prisma-validate` en `.github/workflows/ci.yml`.
- Trigger en PR y push a `main` cuando cambia `prisma/schema.prisma`.
- Falla del job bloquea merge.

##### Exclude

- Conexión a BD real (sólo `DATABASE_URL` dummy).
- Migraciones.

#### Acceptance Criteria Covered

AC-01 (gate CI).

#### Definition of Done

- [ ] Job `prisma-validate` definido y ejecutándose en el pipeline.
- [ ] Falla en `prisma validate` bloquea el merge.

---

### TASK-PB-P0-001-US-099-OPS-004 — Configurar job CI `prisma-generate`

| Field | Value |
|---|---|
| Area | DevOps / Environment |
| Type | Setup |
| Priority | Must |
| Estimate | S |
| Depends On | OPS-002 |
| Source AC(s) | AC-11 (VR-02) |
| Technical Spec Section(s) | §13 Testing Strategy — CI Checks |
| Backlog ID | PB-P0-001 |
| User Story ID | US-099 |
| Owner Role | DevOps |
| Status | To Do |

#### Objective

Agregar un job en GitHub Actions que ejecute `pnpm db:generate` y falle ante warnings bloqueantes.

#### Scope

##### Include

- Job `prisma-generate` en `.github/workflows/ci.yml`.
- Falla del job bloquea merge.

##### Exclude

- Publicación del Prisma Client como artefacto.

#### Acceptance Criteria Covered

AC-11 (gate CI).

#### Definition of Done

- [ ] Job `prisma-generate` definido y ejecutándose en el pipeline.
- [ ] Falla en `prisma generate` bloquea el merge.

---

### TASK-PB-P0-001-US-099-OPS-005 — Configurar job CI para tests estructurales del schema

| Field | Value |
|---|---|
| Area | DevOps / Environment |
| Type | Setup |
| Priority | Must |
| Estimate | S |
| Depends On | OPS-002, QA-001..QA-008 (al menos QA-001) |
| Source AC(s) | AC-01..AC-10 (gate CI) |
| Technical Spec Section(s) | §13 Testing Strategy — CI Checks |
| Backlog ID | PB-P0-001 |
| User Story ID | US-099 |
| Owner Role | DevOps |
| Status | To Do |

#### Objective

Agregar un job en GitHub Actions que ejecute la suite estructural Vitest sobre `prisma/schema.prisma`.

#### Scope

##### Include

- Job `schema-structural-tests` en `.github/workflows/ci.yml`.
- Ejecuta `pnpm vitest run tests/schema` (o equivalente).
- Reporte de cobertura básica visible.

##### Exclude

- Cobertura runtime (no aplica a US-099).

#### Acceptance Criteria Covered

AC-01..AC-10 vía tests estructurales TS-03..TS-10.

#### Definition of Done

- [ ] Job `schema-structural-tests` definido y ejecutándose.
- [ ] Falla de cualquier test estructural bloquea el merge.

---

### TASK-PB-P0-001-US-099-SEC-001 — Secret scan defensivo sobre `prisma/schema.prisma`

| Field | Value |
|---|---|
| Area | Security / Authorization |
| Type | Test |
| Priority | Must |
| Estimate | XS |
| Depends On | OPS-001 |
| Source AC(s) | SEC-01, SEC-02, SEC-03 |
| Technical Spec Section(s) | §12 Security Design; §13 Testing — Security Tests |
| Backlog ID | PB-P0-001 |
| User Story ID | US-099 |
| Owner Role | DevOps |
| Status | To Do |

#### Objective

Asegurar que `prisma/schema.prisma` no contiene secretos hardcodeados ni cadenas de conexión reales.

#### Scope

##### Include

- Test estructural Vitest que recorre `schema.prisma` y verifica ausencia de patrones sospechosos: `DATABASE_URL=`, `postgresql://[^env]`, claves API hardcodeadas, etc.
- Integración con un secret scanner (TruffleHog/gitleaks) en el pipeline CI sobre la carpeta `prisma/`.

##### Exclude

- Secret scan de todo el repositorio (DevOps general).

#### Implementation Notes

- El test debe permitir el patrón `env("DATABASE_URL")` (idiomático Prisma).
- Falsos positivos en `description` o `label` de seeds deben tener regex permisivo.

#### Acceptance Criteria Covered

SEC-01, SEC-02, SEC-03.

#### Definition of Done

- [ ] Test estructural de secret scan implementado y pasando.
- [ ] Job CI integra el scanner sobre `prisma/`.

---

### TASK-PB-P0-001-US-099-QA-001 — Test estructural: 19 modelos MVP presentes

| Field | Value |
|---|---|
| Area | QA / Testing |
| Type | Test |
| Priority | Must |
| Estimate | S |
| Depends On | DB-002..DB-007 |
| Source AC(s) | AC-01 |
| Technical Spec Section(s) | §13 Testing Strategy — Unit Tests (TS-03) |
| Backlog ID | PB-P0-001 |
| User Story ID | US-099 |
| Owner Role | QA |
| Status | To Do |

#### Objective

Verificar la presencia de los 19 modelos MVP en `prisma/schema.prisma` mediante test Vitest.

#### Scope

##### Include

- Test que parsea `schema.prisma` (texto o AST ligero) y valida presencia exacta de los 19 modelos enumerados en AC-01.
- Negative test NT-01: agregar un test que confirme que si falta cualquier modelo, el test falla con mensaje claro.

##### Exclude

- Validación de campos internos (cubierto por tests específicos).

#### Acceptance Criteria Covered

AC-01, NT-01 (cobertura negativa de modelo faltante).

#### Definition of Done

- [ ] Test verde con los 19 modelos presentes.
- [ ] Test falla deterministicamente si se elimina un modelo (probado vía mutación local).

---

### TASK-PB-P0-001-US-099-QA-002 — Test estructural: `isSeed` en modelos MVP operativos

| Field | Value |
|---|---|
| Area | QA / Testing |
| Type | Test |
| Priority | Must |
| Estimate | XS |
| Depends On | DB-002..DB-007 |
| Source AC(s) | AC-06 (VR-06, EC-03, NT-03) |
| Technical Spec Section(s) | §13 Testing Strategy (TS-04, NT-03) |
| Backlog ID | PB-P0-001 |
| User Story ID | US-099 |
| Owner Role | QA |
| Status | To Do |

#### Objective

Verificar que `isSeed Boolean @default(false) @map("is_seed")` está declarado en cada modelo MVP operativo.

#### Scope

##### Include

- Lista canónica de modelos operativos (excluye `AIPromptVersion`).
- Test que falla si algún modelo operativo omite `isSeed`.

##### Exclude

- Verificación de `isSeed` en `AIPromptVersion` (append-only, no aplica).

#### Acceptance Criteria Covered

AC-06.

#### Definition of Done

- [ ] Test verde para los modelos operativos.
- [ ] Test negativo (NT-03) falla si se elimina `isSeed` de cualquier modelo.

---

### TASK-PB-P0-001-US-099-QA-003 — Test estructural: `deletedAt` en modelos con soft delete

| Field | Value |
|---|---|
| Area | QA / Testing |
| Type | Test |
| Priority | Must |
| Estimate | XS |
| Depends On | DB-002, DB-003, DB-006 |
| Source AC(s) | AC-07 (VR-07, EC-04, NT-05) |
| Technical Spec Section(s) | §13 Testing Strategy (TS-05, NT-05) |
| Backlog ID | PB-P0-001 |
| User Story ID | US-099 |
| Owner Role | QA |
| Status | To Do |

#### Objective

Verificar que `deletedAt DateTime? @map("deleted_at") @db.Timestamptz(6)` está declarado en los 7 modelos con soft delete.

#### Scope

##### Include

- Lista canónica de los 7 modelos: `Review`, `Attachment`, `VendorProfile`, `VendorService`, `ServiceCategory`, `EventType`, `Location`.
- Test que falla si alguno omite `deletedAt`.

##### Exclude

- Verificación de filtros runtime (`deletedAt IS NULL`) → repositorios futuros.

#### Acceptance Criteria Covered

AC-07.

#### Definition of Done

- [ ] Test verde para los 7 modelos.
- [ ] Test negativo (NT-05) falla si se elimina `deletedAt`.

---

### TASK-PB-P0-001-US-099-QA-004 — Test estructural: 4 enums base presentes

| Field | Value |
|---|---|
| Area | QA / Testing |
| Type | Test |
| Priority | Must |
| Estimate | XS |
| Depends On | DB-001 |
| Source AC(s) | AC-02 |
| Technical Spec Section(s) | §13 Testing Strategy (TS-06) |
| Backlog ID | PB-P0-001 |
| User Story ID | US-099 |
| Owner Role | QA |
| Status | To Do |

#### Objective

Verificar la presencia de los 4 enums base con sus valores canónicos: `UserRole`, `CurrencyCode`, `LanguageCode`, `LLMProvider`.

#### Scope

##### Include

- Test que parsea bloques `enum` y valida nombres + valores mínimos esperados por enum.

##### Exclude

- Valores extendidos opcionales (sólo se exige el set mínimo).

#### Acceptance Criteria Covered

AC-02 (parcial).

#### Definition of Done

- [ ] Test verde con los 4 enums base presentes.

---

### TASK-PB-P0-001-US-099-QA-005 — Test estructural: 10 enums de status por entidad

| Field | Value |
|---|---|
| Area | QA / Testing |
| Type | Test |
| Priority | Must |
| Estimate | S |
| Depends On | DB-001 |
| Source AC(s) | AC-02 (VR-08, NT-06) |
| Technical Spec Section(s) | §13 Testing Strategy (TS-07, NT-06) |
| Backlog ID | PB-P0-001 |
| User Story ID | US-099 |
| Owner Role | QA |
| Status | To Do |

#### Objective

Verificar la presencia de los 10 enums de status por entidad y la **ausencia** de un enum genérico `Status` reutilizado.

#### Scope

##### Include

- Test que valida nombres de los 10 enums por entidad.
- Negative test NT-06: falla si se detecta un único `enum Status` reutilizado por múltiples entidades.

##### Exclude

- Validación de transiciones de estado (lógica, no schema).

#### Acceptance Criteria Covered

AC-02 (status enums).

#### Definition of Done

- [ ] Test verde con los 10 enums por entidad presentes.
- [ ] Test negativo falla si aparece enum genérico `Status` reutilizado.

---

### TASK-PB-P0-001-US-099-QA-006 — Test estructural: `EventType.id UUID` PK + `code @unique`

| Field | Value |
|---|---|
| Area | QA / Testing |
| Type | Test |
| Priority | Must |
| Estimate | XS |
| Depends On | DB-002 |
| Source AC(s) | AC-09 (VR-09, NT-07) |
| Technical Spec Section(s) | §13 Testing Strategy (TS-08, NT-07) |
| Backlog ID | PB-P0-001 |
| User Story ID | US-099 |
| Owner Role | QA |
| Status | To Do |

#### Objective

Verificar que `EventType` declara `id` como UUID PK y `code` como `@unique`, y NO usa `code` como PK.

#### Scope

##### Include

- Test que valida `id @id @default(uuid()) @db.Uuid` en `EventType`.
- Test que valida `code @unique`.
- Negative test NT-07: falla si `id` no es UUID PK o si `code` fuera PK.

##### Exclude

- Validación física en la BD (eso lo hace US-100).

#### Acceptance Criteria Covered

AC-09.

#### Definition of Done

- [ ] Test verde con `EventType.id UUID` PK + `code @unique`.
- [ ] Test negativo falla si la configuración cambia.

---

### TASK-PB-P0-001-US-099-QA-007 — Test estructural: `AIPromptVersion` declarado

| Field | Value |
|---|---|
| Area | QA / Testing |
| Type | Test |
| Priority | Must |
| Estimate | XS |
| Depends On | DB-007 |
| Source AC(s) | AC-10 (VR-10, NT-08) |
| Technical Spec Section(s) | §13 Testing Strategy (TS-09, NT-08); §11 AI/PromptOps Design |
| Backlog ID | PB-P0-001 |
| User Story ID | US-099 |
| Owner Role | QA |
| Status | To Do |

#### Objective

Verificar la presencia del modelo `AIPromptVersion` y su relación con `AIRecommendation`.

#### Scope

##### Include

- Test que valida presencia del modelo `AIPromptVersion`.
- Test que valida campos mínimos: `promptKey`, `version`, `provider LLMProvider`, `templateChecksum`.
- Test que valida la relación `AIRecommendation.aiPromptVersionId → AIPromptVersion.id`.
- Negative test NT-08: falla si `AIPromptVersion` desaparece.

##### Exclude

- Enforcement append-only → US-102.

#### Acceptance Criteria Covered

AC-10.

#### Definition of Done

- [ ] Test verde con `AIPromptVersion` declarado y relacionado.
- [ ] Test negativo falla si el modelo desaparece.

---

### TASK-PB-P0-001-US-099-QA-008 — Test estructural: convenciones `@@map` / `@map` + tipos PG

| Field | Value |
|---|---|
| Area | QA / Testing |
| Type | Test |
| Priority | Must |
| Estimate | S |
| Depends On | DB-002..DB-007 |
| Source AC(s) | AC-03, AC-04 (VR-04, VR-05, NT-02, NT-04) |
| Technical Spec Section(s) | §13 Testing Strategy (TS-10, NT-02, NT-04) |
| Backlog ID | PB-P0-001 |
| User Story ID | US-099 |
| Owner Role | QA |
| Status | To Do |

#### Objective

Verificar convenciones de naming físico (`@@map`/`@map`) y tipos PostgreSQL específicos en todo el schema.

#### Scope

##### Include

- Test que valida `@@map("snake_case_plural")` en cada modelo.
- Test que valida que cada campo en `camelCase` cuyo nombre físico difiere usa `@map("snake_case")`.
- Test que valida `@db.Decimal(14, 2)` en campos monetarios conocidos (`amount`, `priceMin`, `priceMax`, `totalPlanned`, `totalCommitted`, `amountPlanned`, `amountCommitted`).
- Test que valida `@db.Timestamptz(6)` en `createdAt`, `updatedAt`, `deletedAt`.
- Test que valida `@db.JsonB` en campos JSON conocidos (`aiBriefMeta`, `payload`, `inputPayload`, `outputPayload`, `metadata`).
- Test que valida `@relation` explícito en cada FK.
- Negative tests NT-02 y NT-04.

##### Exclude

- Validaciones funcionales runtime.

#### Acceptance Criteria Covered

AC-03, AC-04, AC-08 (parcial: `@relation` explícito).

#### Definition of Done

- [ ] Test verde para `@@map`/`@map`, `@db.Decimal`, `@db.Timestamptz`, `@db.JsonB`, `@relation` explícito.
- [ ] Tests negativos NT-02 y NT-04 fallan correctamente al introducir incumplimientos sintéticos.

---

### TASK-PB-P0-001-US-099-DOC-001 — Amendar Doc 18 §11/§12 (EventType PK)

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
| User Story ID | US-099 |
| Owner Role | Tech Lead |
| Status | To Do |

#### Objective

Amendar Doc 18 §11/§12 para reflejar que `event_types` usa `id uuid` PK + `code text UNIQUE NOT NULL`, alineado con ADR-DB-002.

#### Scope

##### Include

- Editar `/docs/18-Database-Physical-Design.md` §11 y §12.
- Reemplazar `event_types | PK code` por `event_types | PK id uuid, code text UNIQUE`.
- Agregar nota: "Alineación con ADR-DB-002 y US-099".

##### Exclude

- Otras secciones de Doc 18.

#### Acceptance Criteria Covered

Documentation Alignment Required (no bloqueante).

#### Definition of Done

- [ ] Doc 18 §11 y §12 amendados.
- [ ] PR de housekeeping documental abierto (puede ir en paralelo o después del merge de US-099).

---

### TASK-PB-P0-001-US-099-DOC-002 — Amendar Doc 18 §26 (soft delete uniforme)

| Field | Value |
|---|---|
| Area | Documentation / Traceability |
| Type | Documentation |
| Priority | Should |
| Estimate | S |
| Depends On | DB-008 |
| Source AC(s) | AC-07 (Documentation Alignment) |
| Technical Spec Section(s) | §16 Documentation Alignment Required |
| Backlog ID | PB-P0-001 |
| User Story ID | US-099 |
| Owner Role | Tech Lead |
| Status | To Do |

#### Objective

Amendar Doc 18 §26 para reflejar el mecanismo uniforme `deletedAt` y aclarar que `status`/`is_active` permanecen como atributos funcionales coexistentes.

#### Scope

##### Include

- Editar `/docs/18-Database-Physical-Design.md` §26.
- Reemplazar mecanismos mixtos por: "Marcador canónico de soft delete: `deletedAt` en los 7 modelos. `status`/`is_active` son atributos funcionales de visibilidad/estado."
- Agregar nota: "Alineación con ADR-DB-004 (que admite `status` o `deleted_at`) y US-099".

##### Exclude

- Cambios en otras secciones.

#### Acceptance Criteria Covered

Documentation Alignment Required (no bloqueante).

#### Definition of Done

- [ ] Doc 18 §26 amendado.
- [ ] PR de housekeeping documental abierto.

---

### TASK-PB-P0-001-US-099-DOC-003 — Amendar PB-P0-001 description (`VendorWork`/`Task` → `EventTask`/`Attachment`)

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
| User Story ID | US-099 |
| Owner Role | Product Owner |
| Status | To Do |

#### Objective

Amendar la descripción de `PB-P0-001` en `management/artifacts/4-Product-Backlog-Prioritized.md` para usar el lenguaje canónico (`EventTask`, `Attachment` polimórfico) en lugar de `VendorWork`/`Task`.

#### Scope

##### Include

- Editar la fila `Description` de PB-P0-001 (línea 194).
- Reemplazar `VendorWork` por `Attachment` polimórfico.
- Reemplazar `Task` por `EventTask`.

##### Exclude

- Cambios estructurales del backlog.

#### Acceptance Criteria Covered

Documentation Alignment Required (no bloqueante).

#### Definition of Done

- [ ] Descripción PB-P0-001 actualizada.
- [ ] PR de housekeeping documental abierto.

---

### TASK-PB-P0-001-US-099-DOC-004 — Limpieza/explicitación del alias `US-DB-001` en EPIC Map

| Field | Value |
|---|---|
| Area | Documentation / Traceability |
| Type | Documentation |
| Priority | Could |
| Estimate | XS |
| Depends On | — |
| Source AC(s) | Documentation Alignment |
| Technical Spec Section(s) | §16 Documentation Alignment Required |
| Backlog ID | PB-P0-001 |
| User Story ID | US-099 |
| Owner Role | Product Owner |
| Status | To Do |

#### Objective

Decidir si se elimina el alias `US-DB-001` del EPIC Map o se explicita como referencia interna no funcional.

#### Scope

##### Include

- Editar `management/artifacts/1-EventFlow-Epic-Map.md`.
- Si se mantiene: agregar nota "Alias interno; ID oficial: US-099".
- Si se elimina: reemplazar todas las ocurrencias por US-099.

##### Exclude

- Renombrar archivos de User Story.

#### Acceptance Criteria Covered

Documentation Alignment Required (no bloqueante).

#### Definition of Done

- [ ] EPIC Map actualizado de forma consistente.

---

## 7. Required QA Tasks

| Task ID | Test Type | Purpose |
|---|---|---|
| TASK-PB-P0-001-US-099-QA-001 | Unit (structural) | 19 modelos MVP presentes (TS-03). |
| TASK-PB-P0-001-US-099-QA-002 | Unit (structural) | `isSeed` en modelos operativos (TS-04, NT-03). |
| TASK-PB-P0-001-US-099-QA-003 | Unit (structural) | `deletedAt` en los 7 modelos soft delete (TS-05, NT-05). |
| TASK-PB-P0-001-US-099-QA-004 | Unit (structural) | 4 enums base (TS-06). |
| TASK-PB-P0-001-US-099-QA-005 | Unit (structural) | 10 enums status por entidad + ausencia enum genérico (TS-07, NT-06). |
| TASK-PB-P0-001-US-099-QA-006 | Unit (structural) | `EventType` UUID PK + `code @unique` (TS-08, NT-07). |
| TASK-PB-P0-001-US-099-QA-007 | Unit (structural) | `AIPromptVersion` declarado (TS-09, NT-08). |
| TASK-PB-P0-001-US-099-QA-008 | Unit (structural) | `@@map`/`@map` + tipos PG + `@relation` explícito (TS-10, NT-02, NT-04). |
| TASK-PB-P0-001-US-099-OPS-003 | CI Gate | `prisma validate` (TS-01, VR-01). |
| TASK-PB-P0-001-US-099-OPS-004 | CI Gate | `prisma generate` (TS-02, VR-02). |
| TASK-PB-P0-001-US-099-OPS-005 | CI Gate | Ejecución de tests estructurales en pipeline. |

---

## 8. Required Security Tasks

| Task ID | Security Concern | Purpose |
|---|---|---|
| TASK-PB-P0-001-US-099-SEC-001 | Secrets exposure | Verificar que `schema.prisma` no contiene `DATABASE_URL` real ni secretos hardcodeados (SEC-01, SEC-02, SEC-03). |

---

## 9. Required Seed / Demo Tasks

`No aplica` directamente — la marca `isSeed` se declara como parte de los modelos (DB-002..DB-007) y se valida estructuralmente vía QA-002. El seed real pertenece a EPIC-SEED-001.

---

## 10. Observability / Audit Tasks

`No aplica` runtime — esta historia no introduce ejecutables ni endpoints. La observabilidad se limita a logs CI cubiertos por OPS-003, OPS-004 y OPS-005 (jobs CI con output preservado).

---

## 11. Documentation / Traceability Tasks

| Task ID | Document / Artifact | Purpose |
|---|---|---|
| TASK-PB-P0-001-US-099-DOC-001 | `docs/18-Database-Physical-Design.md` §11/§12 | Alinear `EventType` PK con ADR-DB-002. |
| TASK-PB-P0-001-US-099-DOC-002 | `docs/18-Database-Physical-Design.md` §26 | Alinear soft delete uniforme con ADR-DB-004. |
| TASK-PB-P0-001-US-099-DOC-003 | `management/artifacts/4-Product-Backlog-Prioritized.md` (PB-P0-001 description) | Reemplazar `VendorWork`/`Task` por `Attachment`/`EventTask`. |
| TASK-PB-P0-001-US-099-DOC-004 | `management/artifacts/1-EventFlow-Epic-Map.md` | Limpiar o explicitar el alias `US-DB-001`. |

---

## 12. Dependency Graph

```mermaid
flowchart TD
  OPS_001[OPS-001: Install Prisma + datasource/generator]
  OPS_002[OPS-002: npm scripts db:validate / db:generate]
  OPS_003[OPS-003: CI prisma-validate]
  OPS_004[OPS-004: CI prisma-generate]
  OPS_005[OPS-005: CI structural tests]

  DB_001[DB-001: Enums base + status]
  DB_002[DB-002: Platform/Shared models]
  DB_003[DB-003: Vendor models]
  DB_004[DB-004: Event models]
  DB_005[DB-005: Quote models]
  DB_006[DB-006: Transversal models]
  DB_007[DB-007: Admin/AI models]
  DB_008[DB-008: Cross-cutting review + prisma validate]

  BE_001[BE-001: Prisma Client + smoke]

  SEC_001[SEC-001: Secret scan]

  QA_001[QA-001: 19 models]
  QA_002[QA-002: isSeed]
  QA_003[QA-003: deletedAt]
  QA_004[QA-004: 4 base enums]
  QA_005[QA-005: 10 status enums]
  QA_006[QA-006: EventType UUID PK + code]
  QA_007[QA-007: AIPromptVersion]
  QA_008[QA-008: @@map/@map + tipos PG]

  DOC_001[DOC-001: Doc 18 §11/§12]
  DOC_002[DOC-002: Doc 18 §26]
  DOC_003[DOC-003: PB-P0-001 description]
  DOC_004[DOC-004: EPIC Map alias]

  OPS_001 --> OPS_002
  OPS_001 --> SEC_001
  OPS_001 --> DB_001

  DB_001 --> DB_002
  DB_001 --> DB_003
  DB_001 --> DB_004
  DB_001 --> DB_005
  DB_001 --> DB_006
  DB_001 --> DB_007

  DB_002 --> DB_003
  DB_002 --> DB_004
  DB_002 --> DB_005
  DB_002 --> DB_006
  DB_002 --> DB_007

  DB_003 --> DB_005
  DB_003 --> DB_006

  DB_004 --> DB_005
  DB_004 --> DB_007

  DB_005 --> DB_006

  DB_002 --> DB_008
  DB_003 --> DB_008
  DB_004 --> DB_008
  DB_005 --> DB_008
  DB_006 --> DB_008
  DB_007 --> DB_008

  DB_008 --> BE_001

  DB_002 --> QA_001
  DB_003 --> QA_001
  DB_004 --> QA_001
  DB_005 --> QA_001
  DB_006 --> QA_001
  DB_007 --> QA_001

  DB_002 --> QA_002
  DB_002 --> QA_003
  DB_002 --> QA_006

  DB_001 --> QA_004
  DB_001 --> QA_005

  DB_007 --> QA_007

  DB_002 --> QA_008
  DB_003 --> QA_008
  DB_004 --> QA_008
  DB_005 --> QA_008
  DB_006 --> QA_008
  DB_007 --> QA_008

  OPS_002 --> OPS_003
  OPS_002 --> OPS_004
  OPS_002 --> OPS_005
  QA_001 --> OPS_005

  DB_002 --> DOC_001
  DB_008 --> DOC_002
```

---

## 13. Suggested Implementation Order

### Phase 1 — Foundation

1. **OPS-001** — Instalar Prisma + datasource/generator.
2. **OPS-002** — npm scripts `db:validate` / `db:generate`.
3. **DB-001** — Declarar enums base y de status por entidad.
4. **SEC-001** — Secret scan defensivo (puede ir en paralelo a DB-001).

### Phase 2 — Core Implementation

5. **DB-002** — Modelos Platform/Shared (`User`, `Location`, `ServiceCategory`, `EventType`).
6. **DB-003** — Modelos Vendor (`VendorProfile`, `VendorService`, `Attachment`).
7. **DB-004** — Modelos Event (`Event`, `EventTask`, `Budget`, `BudgetItem`) con `Cascade` en `BudgetItem`.
8. **DB-005** — Modelos Quote (`QuoteRequest`, `Quote`, `BookingIntent`).
9. **DB-006** — Modelos transversales (`Review`, `Notification`).
10. **DB-007** — Modelos Admin/AI (`AdminAction`, `AIRecommendation`, `AIPromptVersion`).
11. **DB-008** — Cross-cutting review + `prisma validate` final.
12. **BE-001** — Generar Prisma Client + smoke type-level.

### Phase 3 — Validation / Security / QA

13. **QA-001** — Test estructural: 19 modelos.
14. **QA-002** — Test estructural: `isSeed`.
15. **QA-003** — Test estructural: `deletedAt`.
16. **QA-004** — Test estructural: 4 enums base.
17. **QA-005** — Test estructural: 10 enums status + ausencia genérico.
18. **QA-006** — Test estructural: `EventType` UUID PK + `code`.
19. **QA-007** — Test estructural: `AIPromptVersion`.
20. **QA-008** — Test estructural: convenciones + tipos PG + `@relation`.
21. **OPS-003** — CI job `prisma-validate`.
22. **OPS-004** — CI job `prisma-generate`.
23. **OPS-005** — CI job `schema-structural-tests`.

### Phase 4 — Documentation / Review

24. **DOC-001** — Amenda Doc 18 §11/§12.
25. **DOC-002** — Amenda Doc 18 §26.
26. **DOC-003** — Amenda PB-P0-001 description.
27. **DOC-004** — Limpieza alias `US-DB-001` en EPIC Map.

---

## 14. Risks & Mitigations

| Risk | Impact | Mitigation | Related Task |
|---|---|---|---|
| FK declarada sin `@relation` explícito. | Medio (cascadas o nombres FK inesperados). | VR-03 + QA-008 + DB-008 review. | DB-002..DB-007, DB-008, QA-008 |
| Cambio de enum sin coordinar con US-100. | Medio (rompe migración futura). | EC-02 + PR template + dependencia explícita DB-001 → todos los DB. | DB-001 |
| Olvidar `isSeed` en nuevo modelo MVP. | Alto (rompe reset demo, NFR-DEMO-003). | VR-06 + QA-002. | DB-002..DB-007, QA-002 |
| Olvidar `deletedAt` en modelo soft delete. | Alto (divergencia con repositorios futuros). | VR-07 + QA-003 + DB-008 review. | DB-002, DB-003, DB-006, QA-003 |
| `EventType.code` se usa como PK por inercia en US-100. | Medio (rompe alineación ADR-DB-002). | AC-09 reforzado + QA-006 + DOC-001 + handoff explícito a US-100. | DB-002, QA-006, DOC-001 |
| Doc 18 sin amendar genera confusión durante US-100. | Bajo (mitigado por PO/BA Decisions). | DOC-001 + DOC-002 ejecutadas en paralelo o inmediatamente post-merge. | DOC-001, DOC-002 |
| `prisma generate` introduce warnings no bloqueantes. | Bajo (oculta problemas). | OPS-004 configurado para fallar ante warnings críticos. | OPS-004 |
| Polimorfismo de `Attachment` no enforceable a nivel FK. | Bajo. | Validación a nivel aplicación + check constraint funcional en US-102. | DB-003 (declaración), US-102 (futuro) |
| Secret leak vía `DATABASE_URL` en repo. | Alto. | SEC-001 + revisión PR + secret scanner CI. | SEC-001 |

---

## 15. Out of Scope Confirmation

Esta historia NO debe implementar:

- `prisma migrate dev` / `prisma migrate deploy` (US-100).
- Migraciones SQL ejecutables (US-100).
- Índices funcionales, GIN o parciales (`WHERE deleted_at IS NULL`) (US-101).
- Check constraints, unique parciales, enforcement C-001..C-062 (US-102).
- Trigger append-only sobre `ai_prompt_versions` (US-102).
- Triggers, SQL raw, particionamiento, sharding, base vectorial (RAG).
- Repositorios Prisma, use cases, controllers, endpoints.
- Lógica de autenticación, autorización runtime, transacciones, cache.
- Seed real, fixtures, scripts de datos demo (EPIC-SEED-001).
- Lógica de máquina de estados (transiciones validadas en use cases).
- Modelos para pagos reales, contratos firmados, e-signature, WhatsApp, chat real-time, push notifications, multi-tenant enterprise.
- AnthropicProvider funcional más allá del enum value (sigue como future/stub).
- Sincronización automática `PromptRegistry` (código) ↔ `ai_prompt_versions` (BD).

---

## 16. Readiness for Sprint Planning

| Check | Status |
|---|---|
| Product Backlog mapping found | **Pass** (PB-P0-001) |
| Every AC maps to tasks | **Pass** (matriz §5) |
| Technical Spec used when available | **Pass** (primaria) |
| QA tasks included | **Pass** (QA-001..QA-008 + OPS-003/004/005) |
| Security tasks included if applicable | **Pass** (SEC-001) |
| Seed/demo tasks included if applicable | **N/A** (cubierto por QA-002; seed real en EPIC-SEED-001) |
| Observability tasks included if applicable | **N/A** (sin runtime; logs CI cubiertos por OPS-003/004/005) |
| Documentation tasks included if applicable | **Pass** (DOC-001..DOC-004) |
| Task dependencies clear | **Pass** (§12 grafo Mermaid) |
| Tasks small enough | **Pass** (todas ≤ M, ninguna L) |
| Ready for Sprint Planning | **Yes** |

---

## 17. Final Recommendation

`Ready for Sprint Planning`.

Justificación:

1. La Technical Specification se utiliza como fuente primaria; cada tarea referencia su sección de origen.
2. El mapeo a `PB-P0-001` (orden 1 del backlog P0) está confirmado.
3. Los 11 AC mapean a ≥1 tarea (matriz §5); cada tarea es testable.
4. QA cubre los tres niveles requeridos: `prisma validate` (OPS-003), `prisma generate` (OPS-004) y 8 tests estructurales Vitest (QA-001..QA-008).
5. Seguridad cubierta por SEC-001 (secret scan defensivo + scanner CI).
6. Las 4 tareas de documentación son housekeeping post-merge, marcadas como `Should` o `Could` (no bloquean el sprint del schema).
7. Todas las tareas son ≤ M en estimación; ninguna requiere split.
8. El grafo de dependencias es explícito y permite paralelización razonable (los grupos de modelos DB-002..DB-007 pueden trabajarse en paralelo dentro de Phase 2 después de DB-001 + DB-002).
9. Las decisiones formalizadas (ADRs, PO/BA, Decision Resolution) están encapsuladas como invariantes que ninguna tarea debe reabrir.
