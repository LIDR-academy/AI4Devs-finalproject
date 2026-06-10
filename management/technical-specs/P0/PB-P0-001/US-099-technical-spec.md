# Technical Specification — US-099: Definir schema Prisma declarativo por dominio MVP

## 1. Metadata

| Field | Value |
|---|---|
| User Story ID | US-099 |
| Source User Story | `management/user-stories/US-099-prisma-schema.md` |
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
| User Story Status | Approved (2026-06-09) |
| Backlog Alignment Status | **Found** |
| Technical Spec Status | **Ready for Task Breakdown** |
| Created Date | 2026-06-09 |
| Last Updated | 2026-06-09 |

---

## 2. Backlog Execution Context

### Product Backlog Item

`PB-P0-001 — Database Schema, Migrations & Constraints` es el primer ítem priorizado del backlog P0. Cubre la fundación de persistencia completa de EventFlow: schema Prisma alineado a Doc 6/18, migraciones reproducibles, índices críticos en columnas de búsqueda/FK/fechas y enforcement de los constraints físicos C-001..C-062 (unique, FK, check, soft delete). Esta historia, **US-099**, entrega exclusivamente la primera fase: la declaración estática del schema y la generación del Prisma Client tipado.

### Execution Order Rationale

US-099 se ejecuta primero porque:

1. El orden sugerido del backlog es **DB → Backend → API → Security → AI → Frontend → Seed → DevOps base** (Doc backlog §"Orden de implementación sugerido").
2. Sin `prisma/schema.prisma` validado, las migraciones (US-100), los índices (US-101) y los constraints (US-102) no pueden derivarse.
3. Sin el Prisma Client tipado, los módulos backend (PB-P0-002 en adelante) no pueden importar tipos del dominio.
4. Sin la declaración de `is_seed` y `deletedAt`, el seed (EPIC-SEED-001) y la moderación admin (P1) carecen de marca canónica.
5. Riesgo R-14 del backlog ("Migraciones Prisma rompen entornos") mitiga al partir de una declaración estática validada antes de tocar la BD.

### Related User Stories in Same Backlog Item

| User Story | Role in Backlog Item | Suggested Order |
|---|---|---|
| **US-099** | Schema Prisma declarativo + Prisma Client | 1 |
| US-100 | Migraciones Prisma ejecutables (`prisma migrate dev` / `prisma migrate deploy`) y SQL raw | 2 |
| US-101 | Índices críticos: FK, status, fechas, funcionales, GIN, parciales (`WHERE deleted_at IS NULL`) | 3 |
| US-102 | Constraints C-001..C-062: check, unique parciales, enforcement append-only `ai_prompt_versions` | 4 |

US-099 desbloquea las otras tres y no depende de ninguna excepto del backend bootstrap (PB-P0-002) para que `prisma generate` pueda ejecutarse dentro del módulo backend.

---

## 3. Executive Technical Summary

US-099 entrega un único artefacto técnico: el archivo `prisma/schema.prisma` con la declaración estática de **19 modelos MVP**, **4 enums base** (`UserRole`, `CurrencyCode`, `LanguageCode`, `LLMProvider`) y **10 enums de status por entidad**, aplicando las convenciones físicas EventFlow:

- `snake_case` en BD vía `@@map` / `@map`.
- `@db.Decimal(14, 2)` para montos.
- `@db.Timestamptz(6)` para timestamps.
- `@db.JsonB` para payloads estructurados.
- `isSeed Boolean @default(false)` en cada modelo MVP operativo.
- `deletedAt DateTime?` uniforme en los 7 modelos con soft delete (ADR-DB-004).
- `EventType` con `id UUID` PK + `code` unique (ADR-DB-002).
- `@relation` explícito en cada FK; `onDelete: Restrict` por defecto; `Cascade` exclusivo de `Budget → BudgetItem`.
- Modelo `AIPromptVersion` declarado para trazabilidad (ADR-AI-006).

La entrega se verifica con `npx prisma validate`, `npx prisma generate` y tests estructurales sobre el archivo `schema.prisma`. **No** ejecuta migraciones, **no** crea índices avanzados ni constraints físicos complejos, **no** implementa repositorios ni lógica de aplicación.

---

## 4. Scope Boundary

### In Scope

- Archivo `prisma/schema.prisma` versionado en el repositorio backend.
- Declaración de los 19 modelos MVP listados en Doc 6 §6.
- Declaración de los 4 enums base + 10 enums de status por entidad.
- `@@map` y `@map` para alinear nombres lógicos PascalCase/camelCase con nombres físicos snake_case.
- `@db.Decimal(14, 2)`, `@db.Timestamptz(6)`, `@db.JsonB`.
- `isSeed Boolean @default(false) @map("is_seed")` en cada modelo MVP operativo.
- `deletedAt DateTime? @map("deleted_at") @db.Timestamptz(6)` en los 7 modelos con soft delete.
- `createdAt` / `updatedAt` con `@db.Timestamptz(6)` en cada modelo persistente.
- `@relation` explícito + `onDelete: Restrict` (default) + `onDelete: Cascade` sólo en `Budget → BudgetItem`.
- `EventType.id UUID` PK + `EventType.code` `@unique`.
- Modelo `AIPromptVersion` con relación hacia `AIRecommendation`.
- `@@index` simple si es parte natural del modelo Prisma (no funcional ni parcial).
- Generación exitosa del Prisma Client mediante `npx prisma generate`.
- Tests estructurales (Vitest) que validen las convenciones del schema.
- Job CI que ejecute `npx prisma validate` y `npx prisma generate`.

### Out of Scope

- `prisma migrate dev` / `prisma migrate deploy` y migraciones SQL ejecutables → **US-100**.
- Índices funcionales, GIN y parciales vía SQL raw → **US-101**.
- Check constraints, unique parciales y enforcement C-001..C-062 → **US-102**.
- Repositorios Prisma, use cases, controllers, endpoints → historias backend/API futuras.
- Seed real / fixtures → **EPIC-SEED-001** (US-085..US-088).
- Lógica de aplicación, transacciones, autorización runtime.
- Conexión real a base de datos para `prisma validate` (sólo requiere `DATABASE_URL` definido en env).

### Explicit Non-Goals

- No implementar políticas de retención, archivado físico ni jobs de purga.
- No declarar modelos para pagos, contratos firmados, e-signature, WhatsApp, chat real-time, push notifications, RAG, multi-tenant enterprise.
- No exponer el Prisma Client desde el frontend.
- No declarar particionamiento físico, sharding ni base vectorial.
- No introducir funciones de IA autónoma ni moderación automática.

---

## 5. Architecture Alignment

### Backend Architecture

- El archivo `prisma/schema.prisma` se ubica dentro del módulo backend (`apps/backend/prisma/schema.prisma` o `backend/prisma/schema.prisma`, según convención de PB-P0-002).
- El Prisma Client se genera en `node_modules/@prisma/client` y se consume como dependencia tipada desde `src/` (Clean/Hexagonal — capa de Infrastructure).
- La declaración del schema NO acopla controllers ni use cases; los repositorios futuros consumirán `PrismaClient` vía DI.
- Alineado con ADR-BE-001 (Node.js + Express + TypeScript) y la arquitectura Modular Monolith.

### Frontend Architecture

`No aplica` — esta historia no toca el frontend. El frontend nunca debe importar `@prisma/client` (regla de seguridad: el cliente Prisma vive sólo en backend).

### Database Architecture

- PostgreSQL 14+ como motor (ADR-DB-001).
- UUID v4 como PK para **todas** las tablas (ADR-DB-002).
- JSONB acotado para payloads bounded (ADR-DB-003).
- Soft delete vía `deleted_at` (ADR-DB-004) — esta historia estandariza la marca canónica `deletedAt` en los 7 modelos.
- Migraciones generadas con Prisma Migrate + SQL raw sólo para constraints no soportadas (ADR-DB-005) — esto pertenece a US-100/US-102, no a US-099.
- La declaración de `@@map` / `@map` garantiza `snake_case_plural` para tablas y `snake_case` para columnas.

### API Architecture

`No aplica` — esta historia es declarativa y no introduce endpoints REST.

### AI / PromptOps Architecture

- Modelo `AIPromptVersion` declarado conforme a ADR-AI-006 (estrategia híbrida `PromptRegistry` en código + `ai_prompt_versions` en BD).
- `AIRecommendationStatus` declarado para representar el flujo human-in-the-loop (`pending / accepted / edited / rejected / discarded`).
- Esta historia **no** declara enforcement append-only sobre `ai_prompt_versions` (eso pertenece a US-102).

### Security Architecture

- `prisma/schema.prisma` **no** contiene `DATABASE_URL` ni secretos hardcodeados (SEC-01, SEC-02).
- `DATABASE_URL` vive en env vars / Secrets Manager.
- El schema **no** declara campos de tarjetas, CVV ni datos de pago reales (SEC-03).
- El schema permite soporte futuro para RBAC, ownership y assignment, pero **no** implementa policies en esta historia (SEC-05).

### Testing Architecture

- Stack: Vitest (Doc 20 — Testing Strategy).
- Tres niveles de validación:
  1. `npx prisma validate` (CLI Prisma).
  2. `npx prisma generate` (CLI Prisma, verifica que el Prisma Client se genera sin warnings bloqueantes).
  3. Tests estructurales en Vitest que parsean `schema.prisma` como texto o estructura ligera y verifican las convenciones EventFlow específicas.
- Los tres niveles corren en CI (GitHub Actions).
- No requiere Supertest, Playwright, MSW ni MockAIProvider en esta historia.

---

## 6. Functional Interpretation

| Acceptance Criterion | Technical Interpretation | Impacted Layer(s) |
|---|---|---|
| AC-01 — Declaración de 19 modelos MVP | Cada modelo se declara en `prisma/schema.prisma` con su sección `model <Name> { ... }` correspondiente y `@@map("<snake_case_plural>")`. | DB (schema) |
| AC-02 — Enums canónicos separados por entidad | Cada enum `enum <EnumName> { ... }` se declara individualmente; prohibido reusar un enum genérico `Status`. | DB (schema) |
| AC-03 — Convenciones de naming físico | `@@map("snake_case_plural")` en cada modelo; `@map("snake_case")` en cada campo cuyo nombre físico difiere del nombre lógico Prisma. | DB (schema) |
| AC-04 — Tipos PostgreSQL específicos | `@db.Decimal(14, 2)` en montos, `@db.Timestamptz(6)` en timestamps, `@db.JsonB` en JSON estructurado. | DB (schema) |
| AC-05 — Timestamps obligatorios | `createdAt DateTime @default(now()) @db.Timestamptz(6) @map("created_at")` y `updatedAt DateTime @updatedAt @db.Timestamptz(6) @map("updated_at")` en cada modelo persistente. | DB (schema) |
| AC-06 — Marca seed obligatoria | `isSeed Boolean @default(false) @map("is_seed")` en cada modelo MVP operativo. | DB (schema) + Seed (futuro) |
| AC-07 — Soft delete declarativo | `deletedAt DateTime? @map("deleted_at") @db.Timestamptz(6)` en los 7 modelos: `Review`, `Attachment`, `VendorProfile`, `VendorService`, `ServiceCategory`, `EventType`, `Location`. | DB (schema) |
| AC-08 — Relaciones explícitas + `onDelete` | `@relation(...)` explícito en cada FK; `onDelete: Restrict` por defecto; `onDelete: Cascade` exclusivo en `Budget → BudgetItem`. | DB (schema) |
| AC-09 — `EventType` UUID PK + code unique | `EventType.id String @id @default(uuid()) @db.Uuid` + `EventType.code String @unique`. | DB (schema), coordina con US-100 para la migración. |
| AC-10 — `AIPromptVersion` para estrategia híbrida | Modelo `AIPromptVersion` declarado con relación 1:N hacia `AIRecommendation`. | DB (schema), AI (PromptOps). |
| AC-11 — Generación del Prisma Client | `npx prisma generate` produce el Prisma Client sin warnings bloqueantes. | Backend (build), CI. |

---

## 7. Backend Technical Design

### Modules / Bounded Contexts

US-099 no declara módulos backend. Sin embargo, prepara el terreno para los siguientes bounded contexts (definidos en Doc 13/14 y por implementar en historias futuras):

- `auth` (consume `User`)
- `event` (`Event`, `EventTask`, `EventType`, `Budget`, `BudgetItem`)
- `vendor` (`VendorProfile`, `VendorService`, `ServiceCategory`, `Attachment`)
- `quote` (`QuoteRequest`, `Quote`, `BookingIntent`)
- `review` (`Review`)
- `notification` (`Notification`)
- `admin` (`AdminAction`)
- `ai` (`AIRecommendation`, `AIPromptVersion`)
- `platform/shared` (`Location`, enums base)

### Use Cases / Application Services

`No aplica` — esta historia no implementa use cases.

### Controllers / Routes

`No aplica` — esta historia no expone endpoints.

### DTOs / Schemas

`No aplica` — los DTOs Zod los implementan PB-P0-003 y las historias de API.

### Repository / Persistence

- US-099 entrega el cliente Prisma generado, que será consumido por los repositorios futuros.
- Patrón recomendado para historias posteriores: cada bounded context expone un repository (`EventRepository`, `VendorRepository`, etc.) inyectado con `PrismaClient`.
- Filtros estándar de soft delete (`where: { deletedAt: null }`) los implementará la capa de repositorios; no se declaran en `schema.prisma`.

### Validation Rules

- VR-01: `prisma validate` debe pasar en CI.
- VR-02: `prisma generate` debe pasar en CI.
- VR-03..VR-10: ver §13 (Testing Strategy) — validación vía tests estructurales.

### Error Handling

`No aplica` — declaración estática sin runtime.

### Transactions

`No aplica`.

### Observability

- Logs CI obligatorios para `prisma validate` y `prisma generate`.
- Falla del CLI Prisma bloquea el merge (gate en GitHub Actions).

---

## 8. Frontend Technical Design

`No aplica` — esta historia es 100% backend/DB.

---

## 9. API Contract Design

`No aplica` — no introduce endpoints.

---

## 10. Database / Prisma Design

### Models Impacted

Los **19 modelos MVP** declarados en `schema.prisma`:

| Modelo | Tabla física | Soft delete | `is_seed` | Notas |
|---|---|---|---|---|
| `User` | `users` | No | Sí | PK `id UUID`; `UserRole` enum; campos auth (email, hashed password, `preferredLanguage`). |
| `Event` | `events` | No | Sí | `EventStatus`; FK `userId`, `eventTypeId`, `locationId`; `currency CurrencyCode`. |
| `EventType` | `event_types` | **Sí** | Sí | PK `id UUID` + `code @unique`; campos `label`, `description`, `isActive`. |
| `EventTask` | `event_tasks` | No | Sí | FK `eventId`; status + due date; origen (manual / ai). |
| `Budget` | `budgets` | No | Sí | FK 1:1 `eventId`; totales en `@db.Decimal(14,2)`. |
| `BudgetItem` | `budget_items` | No | Sí | FK `budgetId` con `onDelete: Cascade`. |
| `VendorProfile` | `vendor_profiles` | **Sí** | Sí | `VendorProfileStatus`; FK `userId`; `locationId` opcional. |
| `VendorService` | `vendor_services` | **Sí** | Sí | `VendorServiceStatus`; FK `vendorProfileId`, `serviceCategoryId`; `priceMin`/`priceMax` `Decimal(14,2)`. |
| `ServiceCategory` | `service_categories` | **Sí** | Sí | `code @unique`, `label`, `description`, `isActive`. |
| `Location` | `locations` | **Sí** | Sí | `country`, `region`, `city`, opcionales `lat`/`lng`. |
| `QuoteRequest` | `quote_requests` | No | Sí | `QuoteRequestStatus`; FK `eventId`, `serviceCategoryId`; `aiBriefMeta JsonB`. |
| `Quote` | `quotes` | No | Sí | `QuoteStatus`; FK `quoteRequestId`, `vendorProfileId`; `amount Decimal(14,2)`. |
| `BookingIntent` | `booking_intents` | No | Sí | `BookingIntentStatus`; FK `quoteId`. |
| `Review` | `reviews` | **Sí** | Sí | `ReviewStatus`; FK `bookingIntentId`, `vendorProfileId`, `authorId`. |
| `Notification` | `notifications` | No | Sí | `NotificationStatus`; FK `userId`; `payload JsonB`. |
| `Attachment` | `attachments` | **Sí** | Sí | `AttachmentStatus`; relación polimórfica (`entityType` + `entityId`). |
| `AdminAction` | `admin_actions` | No | Sí | FK `adminUserId`; `action`, `targetEntity`, `targetId`, `metadata JsonB`. |
| `AIRecommendation` | `ai_recommendations` | No | Sí | `AIRecommendationStatus`; FK `eventId`, `aiPromptVersionId`; `inputPayload JsonB`, `outputPayload JsonB`. |
| `AIPromptVersion` | `ai_prompt_versions` | No | No (append-only conceptual) | `promptKey`, `version`, `provider LLMProvider`, `templateChecksum`. |

### Fields / Columns

Cada modelo incluye:

- `id String @id @default(uuid()) @db.Uuid` (todos los modelos, ADR-DB-002).
- `createdAt DateTime @default(now()) @db.Timestamptz(6) @map("created_at")`.
- `updatedAt DateTime @updatedAt @db.Timestamptz(6) @map("updated_at")`.
- `isSeed Boolean @default(false) @map("is_seed")` (modelos MVP operativos).
- `deletedAt DateTime? @map("deleted_at") @db.Timestamptz(6)` (en los 7 modelos con soft delete).

Campos por entidad: ver Doc 6 §6 y Doc 18 §11/§12 (con las amendas formalizadas en PO/BA Decisions Applied: `EventType.id UUID` PK, `deletedAt` uniforme).

### Relations

| Relación | FK | `onDelete` | Justificación |
|---|---|---|---|
| `Event.userId → User.id` | userId | `Restrict` | Default. Borrar un usuario con eventos requiere flujo admin. |
| `Event.eventTypeId → EventType.id` | eventTypeId | `Restrict` | Catálogo. Default. |
| `Event.locationId → Location.id` | locationId | `Restrict` | Catálogo. Default. |
| `EventTask.eventId → Event.id` | eventId | `Restrict` | Default. |
| `Budget.eventId → Event.id` | eventId | `Restrict` | 1:1. Default. |
| **`BudgetItem.budgetId → Budget.id`** | budgetId | **`Cascade`** | **Única excepción**: composición pura. |
| `VendorProfile.userId → User.id` | userId | `Restrict` | Default. |
| `VendorProfile.locationId → Location.id?` | locationId (nullable) | `Restrict` | Default. |
| `VendorService.vendorProfileId → VendorProfile.id` | vendorProfileId | `Restrict` | Default. |
| `VendorService.serviceCategoryId → ServiceCategory.id` | serviceCategoryId | `Restrict` | Default. |
| `QuoteRequest.eventId → Event.id` | eventId | `Restrict` | Default. |
| `QuoteRequest.serviceCategoryId → ServiceCategory.id` | serviceCategoryId | `Restrict` | Default. |
| `Quote.quoteRequestId → QuoteRequest.id` | quoteRequestId | `Restrict` | Default. |
| `Quote.vendorProfileId → VendorProfile.id` | vendorProfileId | `Restrict` | Default. |
| `BookingIntent.quoteId → Quote.id` | quoteId | `Restrict` | Default. |
| `Review.bookingIntentId → BookingIntent.id` | bookingIntentId | `Restrict` | Default. |
| `Review.vendorProfileId → VendorProfile.id` | vendorProfileId | `Restrict` | Default. |
| `Review.authorId → User.id` | authorId | `Restrict` | Default. |
| `Notification.userId → User.id` | userId | `Restrict` | Default. |
| `Attachment` (polimórfico) | entityType + entityId | sin FK (polimórfico) | Validación a nivel aplicación (no en schema). |
| `AdminAction.adminUserId → User.id` | adminUserId | `Restrict` | Default. |
| `AIRecommendation.eventId → Event.id` | eventId | `Restrict` | Default. |
| `AIRecommendation.aiPromptVersionId → AIPromptVersion.id` | aiPromptVersionId | `Restrict` | Default. |

Todas las FK usan `@relation` explícito con nombre cuando hay múltiples relaciones entre los mismos modelos.

### Indexes

US-099 declara únicamente `@@index` simples que Prisma soporta nativamente y son parte natural del modelo (p. ej. `@@index([eventId])` en `EventTask`, `@@index([vendorProfileId])` en `Quote`, `@@index([userId])` en `Notification`).

Los índices funcionales, GIN y parciales (`WHERE deleted_at IS NULL`) → **US-101**.

### Constraints

- `@unique` simple permitido en US-099 (p. ej. `User.email @unique`, `EventType.code @unique`, `ServiceCategory.code @unique`).
- Unique parciales, check constraints, enforcement append-only → **US-102**.

### Migrations Impact

- US-099 **no** ejecuta `prisma migrate`.
- La migración generada por US-100 deberá producir:
  - `event_types` con `id uuid` PK + `code text UNIQUE NOT NULL` (no `code` como PK físico).
  - `deleted_at timestamptz(6)` en los 7 modelos con soft delete.
  - `is_seed boolean NOT NULL DEFAULT false` en cada modelo operativo.

### Seed Impact

- US-099 garantiza que la marca `isSeed` está disponible en cada modelo operativo, condición previa para el seed idempotente y el reset quirúrgico del entorno demo (NFR-DEMO-003, BR-SEED-005).
- El seed real (`scripts/seed.ts`, fixtures, dataset) pertenece a EPIC-SEED-001 (US-085..US-088).

---

## 11. AI / PromptOps Design

### AI Feature

`AIPromptVersion` como base de trazabilidad (no es una feature IA propiamente; es la infraestructura de PromptOps).

### Provider

`No aplica` runtime — sólo se declara el enum `LLMProvider` con valores `openai`, `mock`, `anthropic` (este último marcado como future/stub conforme a ADR-AI-002/ADR-AI-003).

### Prompt Version

Modelo `AIPromptVersion`:

- `id String @id @default(uuid()) @db.Uuid`
- `promptKey String` — identificador estable del prompt (p. ej. `event-plan-generator`).
- `version String` — versión semántica del prompt (p. ej. `1.0.0`).
- `provider LLMProvider`
- `templateChecksum String` — hash de la plantilla para detección de cambios.
- `description String?`
- `createdAt`, `updatedAt`, `isSeed`.

Relación: `AIRecommendation.aiPromptVersionId → AIPromptVersion.id` (`Restrict`).

### Input Schema

`No aplica` — la validación de payloads JSON la hace la capa de aplicación con Zod (historias AI futuras).

### Output Schema

`No aplica` — idem.

### Human-in-the-loop

`AIRecommendationStatus` declarado con: `pending`, `accepted`, `edited`, `rejected`, `discarded`. El runtime HITL pertenece a historias AI futuras (US-025, US-026).

### Fallback

`No aplica` runtime — pertenece a US-123.

### Persistence

- `ai_recommendations` y `ai_prompt_versions` declaradas como modelos persistentes.
- Carácter append-only de `ai_prompt_versions` documentado como intención; enforcement técnico → US-102.

### Safety Rules

- No se declaran modelos para autonomous AI decisions.
- No se declara moderación IA de reviews.
- No RAG / vector database.

---

## 12. Security & Authorization Design

### Authentication

`No aplica` runtime — el schema **declara** `User` con campos de credenciales pero no implementa autenticación.

### Authorization

`No aplica` runtime — el schema **permite** soporte futuro para RBAC (`UserRole` enum) y ownership (FKs `userId`), pero no implementa policies.

### Ownership Rules

El schema preserva los campos `userId` necesarios para enforcement de ownership en repositorios futuros (`Event.userId`, `VendorProfile.userId`, `Review.authorId`).

### Role Rules

`UserRole` enum declarado con valores: `organizer`, `vendor`, `admin`.

### Negative Authorization Scenarios

`No aplica` — no introduce endpoints.

### Audit Requirements

Modelo `AdminAction` declarado para soporte futuro de auditoría admin (`adminUserId`, `action`, `targetEntity`, `targetId`, `metadata JsonB`, `createdAt`).

### Sensitive Data Handling

- `prisma/schema.prisma` **no** contiene `DATABASE_URL` ni secretos hardcodeados (SEC-01).
- `DATABASE_URL` vive en env vars / Secrets Manager (SEC-02).
- El schema **no** declara campos de tarjetas, CVV ni datos de pago reales (SEC-03).
- El campo `passwordHash` en `User` almacena únicamente el hash (no la contraseña en claro).

---

## 13. Testing Strategy

### Unit Tests

Tests estructurales sobre `prisma/schema.prisma` con Vitest. Sugerencia de archivos:

- `apps/backend/tests/schema/schema-structure.spec.ts`

Casos:

- TS-03: 19 modelos MVP presentes (parse o regex sobre `model <Name>`).
- TS-04: `is_seed` presente en cada modelo MVP operativo.
- TS-05: `deletedAt` presente en los 7 modelos con soft delete.
- TS-06: 4 enums base presentes (`UserRole`, `CurrencyCode`, `LanguageCode`, `LLMProvider`).
- TS-07: 10 enums de status por entidad presentes.
- TS-08: `EventType` declara `id @id @default(uuid()) @db.Uuid` y `code @unique`.
- TS-09: `AIPromptVersion` declarado.
- TS-10: convenciones `@@map("snake_case_plural")` y `@map("snake_case")` aplicadas.

### Integration Tests

`No aplica` en US-099. Las integraciones contra BD real pertenecen a US-100 y siguientes.

### API Tests

`No aplica`.

### E2E Tests

`No aplica`.

### Security Tests

- Test estructural: `schema.prisma` **no** contiene la cadena `DATABASE_URL=` ni patrones de secretos hardcodeados (regex defensivo).
- Job CI: `npx prisma validate` se ejecuta sin variables de entorno reales, sólo con `DATABASE_URL` dummy.

### Accessibility Tests

`No aplica` — no hay UI.

### AI Tests

`No aplica` runtime. La verificación se limita a la presencia del modelo `AIPromptVersion` y del enum `AIRecommendationStatus`.

### Seed / Demo Tests

Test estructural que verifica `isSeed` declarado en cada modelo MVP operativo (TS-04).

### CI Checks

| Job | Comando | Bloquea merge |
|---|---|---|
| `prisma-validate` | `npx prisma validate` | Sí |
| `prisma-generate` | `npx prisma generate` | Sí |
| `schema-structural-tests` | `pnpm vitest run tests/schema` | Sí |
| `secret-scan-schema` | `grep` defensivo + secret scanner sobre `prisma/schema.prisma` | Sí |

---

## 14. Observability & Audit

### Logs

- Logs CI del CLI Prisma (`prisma validate`, `prisma generate`) deben quedar disponibles en el job de GitHub Actions.
- No se introduce logging runtime en esta historia.

### Correlation ID

`No aplica` — no hay runtime.

### AdminAction

El modelo se declara para uso futuro; no se persiste nada en esta historia.

### Error Tracking

`No aplica` runtime. Errores del CLI Prisma quedan reflejados en el output del job de CI.

### Metrics

`No aplica`.

---

## 15. Seed / Demo Data Impact

### Seed Data Required

US-099 **no** genera seed data. Sí garantiza la infraestructura para que el seed funcione:

- `isSeed Boolean @default(false) @map("is_seed")` en cada modelo operativo.

### Demo Scenario Supported

Esta historia desbloquea el seed determinístico de EPIC-SEED-001 (US-085..US-088) y el reset quirúrgico (`DELETE WHERE is_seed = true`) requerido por NFR-DEMO-003.

### Reset / Isolation Notes

La marca `isSeed` permite distinguir datos demo de datos operativos sin necesidad de tablas separadas ni esquemas distintos.

---

## 16. Documentation Alignment Required

| Document / Source | Conflict | Current Decision | Recommended Action | Blocks Implementation? |
|---|---|---|---|---|
| Doc 18 §11 / §12 | Declara `event_types` con PK `code`. | ADR-DB-002 (Accepted) + PO/BA Decision Applied en US-099: `id UUID` PK + `code @unique`. | Amendar Doc 18 §11 y §12 para alinear con ADR-DB-002. | **No** |
| Doc 18 §26 | Declara mecanismos mixtos de soft delete (`is_active`, `status`, `deleted_at` solo en attachments). | ADR-DB-004 (admite `status` o `deleted_at`) + Tech Decision uniforme en PO/BA Decisions Applied: `deletedAt` en los 7 modelos. | Amendar Doc 18 §26 para reflejar el mecanismo uniforme `deletedAt`. | **No** |
| PB-P0-001 (Backlog Prioritized) — Description | Menciona `VendorWork` y `Task`. | Doc 6 §6: portafolio cubierto por `Attachment` polimórfico; entidad canónica `EventTask`. | Amendar descripción de PB-P0-001 para usar `EventTask` y eliminar `VendorWork`. | **No** |
| EPIC Map — alias `US-DB-001` | Coexiste con `US-099`. | PO/BA Decision Applied: `US-099` es el ID oficial. | Limpiar alias o explicitarlo como referencia interna sin valor funcional. | **No** |

Los 4 items son **housekeeping documental post-merge**. Ninguno bloquea la implementación de US-099.

---

## 17. Technical Risks & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Una FK queda sin `@relation` explícito y el lint de schema no lo detecta. | Medio — puede generar comportamiento inesperado de cascada o nombres de FK incorrectos en BD. | VR-03 + test estructural que valida presencia de `@relation` en cada relación. PR review obligatorio. |
| Cambio de enum en US-099 sin coordinar con US-100 rompe la migración futura. | Medio. | EC-02 + nota explícita en el PR template recordando coordinación con US-100. |
| Olvidar `isSeed` en un nuevo modelo MVP rompe el reset demo. | Alto para QA y demo académica. | VR-06 + TS-04 + EC-03 fallan en CI si se omite. |
| Olvidar `deletedAt` en un modelo con soft delete obligatorio. | Alto — divergencia con repositorios futuros. | VR-07 + TS-05 + EC-04 fallan en CI si se omite. |
| Documentación fuente (Doc 18 §11/§12 y §26) genera confusión durante implementación de US-100. | Bajo — mitigado por PO/BA Decisions Applied. | Amendar Doc 18 post-merge (housekeeping documental). |
| `prisma generate` introduce warnings no bloqueantes que pueden ocultar problemas. | Bajo. | Configurar el job CI para fallar ante warnings críticos seleccionados. |
| `EventType.code` se sigue usando como PK en repositorios futuros por inercia. | Medio. | AC-09 reforzado + Doc 18 amenda + revisión técnica en US-100. |
| El polimorfismo de `Attachment` (`entityType` + `entityId`) no es enforceable a nivel de FK. | Bajo. | Validación de consistencia a nivel de aplicación; constraint funcional en US-102. |

---

## 18. Implementation Guidance for Coding Agents

### Files / folders likely impacted

- `prisma/schema.prisma` (crear).
- `prisma/.gitignore` o equivalente, asegurando que `node_modules` y artefactos generados no se versionen.
- `package.json` del backend: scripts `db:validate` (`prisma validate`) y `db:generate` (`prisma generate`).
- `apps/backend/tests/schema/schema-structure.spec.ts` (tests estructurales).
- `.github/workflows/ci.yml` (jobs `prisma-validate`, `prisma-generate`, `schema-structural-tests`).
- `.env.example` con `DATABASE_URL` dummy para `prisma validate`.

### Recommended order of implementation

1. Configurar Prisma como dependencia del backend (`prisma`, `@prisma/client`) y el binary target.
2. Declarar los 4 enums base + 10 enums de status por entidad.
3. Declarar `User`, `Location`, `ServiceCategory`, `EventType` (modelos sin dependencias internas).
4. Declarar `VendorProfile`, `VendorService`, `Attachment` (modelos vendor).
5. Declarar `Event`, `EventTask`, `Budget`, `BudgetItem` (modelos event).
6. Declarar `QuoteRequest`, `Quote`, `BookingIntent` (modelos quote).
7. Declarar `Review`, `Notification` (modelos transversales).
8. Declarar `AdminAction`, `AIRecommendation`, `AIPromptVersion` (modelos admin/AI).
9. Aplicar `@@map`, `@map`, `@@index` y `@relation` explícito en cada bloque.
10. Aplicar `isSeed`, `deletedAt`, `createdAt`/`updatedAt` por modelo.
11. Ejecutar `npx prisma validate` localmente; corregir hasta que pase.
12. Ejecutar `npx prisma generate` localmente; corregir warnings bloqueantes.
13. Implementar tests estructurales Vitest.
14. Configurar jobs CI.

### Decisions that must not be reopened

- `EventType` usa `id UUID` PK + `code @unique` (ADR-DB-002, PO/BA Decision).
- `deletedAt` es el marcador canónico uniforme de soft delete en los 7 modelos (ADR-DB-004, PO/BA Decision).
- Enums de status separados por entidad; prohibido enum genérico `Status` (PO/BA Decision).
- `onDelete: Restrict` por defecto; `Cascade` exclusivo de `Budget → BudgetItem`.
- `AIPromptVersion` se declara como tabla (estrategia híbrida, ADR-AI-006).
- `Location` y `ServiceCategory` forman parte del schema MVP inicial.
- `is_seed` obligatorio en cada modelo MVP operativo.

### What must not be implemented

- `prisma migrate dev` / `prisma migrate deploy`.
- Índices funcionales, GIN o parciales.
- Check constraints, unique parciales, enforcement de C-001..C-062.
- Triggers, SQL raw, particionamiento.
- Repositorios Prisma, use cases, controllers, endpoints.
- Seed real, fixtures, scripts de datos demo.
- Lógica de autenticación, autorización, transacciones, cache.

### Assumptions to preserve

- Stack confirmado: PostgreSQL + Prisma + Node.js + Express + TypeScript.
- `DATABASE_URL` definido en env (no requiere conexión real para `prisma validate`).
- El módulo backend (PB-P0-002) está disponible o se prepara en paralelo para que `prisma generate` pueda ejecutarse dentro de su contexto.

---

## 19. Task Generation Notes

### Suggested task groups

| Grupo | Tareas sugeridas |
|---|---|
| **Setup Prisma** | Agregar dependencias `prisma` + `@prisma/client`; configurar binary target; scripts `db:validate` / `db:generate`. |
| **Declarar Enums** | Tarea por bloque de enums: base (1 tarea), status por entidad (1 tarea por bloque o 1 sola consolidada). |
| **Declarar Modelos Platform/Shared** | `User`, `Location`, `ServiceCategory`, `EventType`. |
| **Declarar Modelos Vendor** | `VendorProfile`, `VendorService`, `Attachment`. |
| **Declarar Modelos Event** | `Event`, `EventTask`, `Budget`, `BudgetItem`. |
| **Declarar Modelos Quote** | `QuoteRequest`, `Quote`, `BookingIntent`. |
| **Declarar Modelos Transversales** | `Review`, `Notification`. |
| **Declarar Modelos Admin/AI** | `AdminAction`, `AIRecommendation`, `AIPromptVersion`. |
| **Convenciones Físicas** | Aplicar `@@map`, `@map`, `@db.Decimal`, `@db.Timestamptz`, `@db.JsonB` en todos los modelos. |
| **Soft Delete + `isSeed` + Timestamps** | Aplicar el bloque uniforme en cada modelo según corresponda. |
| **Relaciones + `onDelete`** | Aplicar `@relation` explícito + `Restrict` por defecto + `Cascade` en `Budget → BudgetItem`. |
| **Generación Prisma Client** | Verificar `npx prisma generate` local + CI. |

### Required QA tasks

- Implementar tests estructurales TS-03..TS-10.
- Implementar tests negativos NT-01..NT-08.
- Configurar job CI `prisma-validate`.
- Configurar job CI `prisma-generate`.
- Configurar job CI para tests estructurales.

### Required security tasks

- Secret scan defensivo sobre `prisma/schema.prisma` (CI).
- Verificación de que `DATABASE_URL` y demás secretos viven en env vars / Secrets Manager.

### Required seed/demo tasks

- Validar que `isSeed Boolean @default(false) @map("is_seed")` está declarado en cada modelo MVP operativo (cubierto por TS-04).
- Tarea informativa para EPIC-SEED-001: documentar que la marca `isSeed` ya está disponible.

### Required documentation tasks (no bloqueantes, post-merge)

- Amendar Doc 18 §11/§12 (EventType PK).
- Amendar Doc 18 §26 (soft delete uniforme).
- Amendar PB-P0-001 description (`VendorWork` → `Attachment`; `Task` → `EventTask`).
- Limpiar/explicitar alias `US-DB-001` en EPIC Map.

### Dependencies between tasks

- Las tareas de enums deben completarse antes de las tareas de modelos que los referencian.
- Los modelos sin dependencias internas (`User`, `Location`, `ServiceCategory`, `EventType`) deben declararse antes que los modelos que los referencian (`Event`, `VendorProfile`, etc.).
- Las tareas de QA dependen de que el schema esté declarado.
- Los jobs CI dependen de que existan los scripts `db:validate`, `db:generate` y los tests estructurales.

### Consolidated `tasks.md` for PB-P0-001

Sí: cuando US-100, US-101 y US-102 generen sus respectivos technical specs y tareas, el ítem padre `PB-P0-001` debería consolidar un único `tasks.md` que oriente la secuencia DB completa (schema → migraciones → índices → constraints) para Sprint Planning.

---

## 20. Technical Spec Readiness

| Check | Status |
|---|---|
| User Story approved or explicitly allowed for draft spec | **Pass** (Approved 2026-06-09) |
| Product Backlog mapping found | **Pass** (PB-P0-001) |
| Decision Resolution reviewed if present | **Pass** (consolidado en §1 y §5) |
| Scope clear | **Pass** (§4) |
| Architecture alignment clear | **Pass** (§5, alineado a ADR-DB-001..005, ADR-AI-006, ADR-BE-001) |
| API impact clear | **N/A** (declaración estática) |
| DB impact clear | **Pass** (§10) |
| AI impact clear | **Pass** (§11) |
| Security impact clear | **Pass** (§12) |
| Testing strategy clear | **Pass** (§13) |
| Ready for Development Task Breakdown | **Yes** |

---

## 21. Final Recommendation

`Ready for Task Breakdown`.

Justificación:

1. La User Story está **Approved** (2026-06-09) con todas las decisiones PO/BA formalizadas y respaldadas por ADRs aceptados (ADR-DB-001..005, ADR-AI-006).
2. El mapeo al Product Backlog Prioritized fue exitoso: **PB-P0-001**, orden de ejecución 1, posición 1 de 4 dentro del ítem.
3. El alcance está delimitado con claridad: schema declarativo + Prisma Client; migraciones, índices avanzados y constraints físicos están **fuera de scope** y delegados a US-100/US-101/US-102.
4. Los 11 Acceptance Criteria son específicos, testables y trazables a layers concretos (todos a la capa DB con apoyo de QA/CI).
5. Las decisiones técnicas críticas (`EventType` PK, `deletedAt` uniforme, enums por entidad, `AIPromptVersion`, `onDelete`) están consolidadas y no deben reabrirse.
6. Los 4 items de Documentation Alignment Required son housekeeping documental post-merge y **no bloquean** la implementación.
7. La estrategia de testing es completa y ejecutable con el stack aprobado (Vitest + CLI Prisma + GitHub Actions).

El siguiente paso recomendado es ejecutar `eventflow-user-story-to-development-tasks` sobre `management/user-stories/US-099-prisma-schema.md` para generar el desglose técnico de tareas listas para Sprint Planning.
