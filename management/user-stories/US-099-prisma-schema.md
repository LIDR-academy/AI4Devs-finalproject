# 🧾 User Story: Definir schema Prisma declarativo por dominio MVP

## 🆔 Metadata

| Field              | Value                                                 |
| ------------------ | ----------------------------------------------------- |
| ID                 | US-099                                                |
| Epic               | EPIC-DB-001 — Database & Prisma Physical Model        |
| Backlog Item       | PB-P0-001 — Database Schema, Migrations & Constraints |
| Feature            | Schema Prisma — definición declarativa                |
| Module / Domain    | Platform / DB                                         |
| User Role          | System                                                |
| Priority           | Must Have (P0)                                        |
| Status             | Approved                                              |
| Owner              | Product Owner / Tech Lead                             |
| Approved By        | PO/BA Review                                          |
| Approval Date      | 2026-06-09                                            |
| Ready for Development Tasks | Yes                                          |
| Sprint / Milestone | MVP                                                   |
| Created Date       | 2026-06-09                                            |
| Last Updated       | 2026-06-09 (PO/BA approval gate)                      |

---

## 🎯 User Story

**As the** sistema EventFlow
**I want** declarar en `prisma/schema.prisma` los 19 modelos del dominio MVP, con sus enums, relaciones, mappings `@@map` / `@map`, soft delete, `is_seed`, timestamps y tipos PostgreSQL específicos, alineados con `Doc 6 — Domain Data Model` y `Doc 18 — Database Physical Design`
**So that** todo el backend, use cases, repositorios, seed, IA y QA puedan persistir y consumir el dominio MVP de forma tipada, consistente y trazable.

---

## 🧠 Business Context

### Context Summary

Esta historia entrega la **declaración estática del schema Prisma** que servirá como base para:

* La generación del cliente Prisma tipado.
* Las migraciones posteriores definidas en US-100.
* Los índices posteriores definidos en US-101.
* Los constraints físicos y reglas avanzadas definidos en US-102.
* La implementación futura de repositorios, use cases, APIs, seed, QA e IA.

Sin este schema declarativo no es posible iniciar correctamente EPIC-BE-001, EPIC-API-001, EPIC-AI-001 ni EPIC-SEED-001.

---

### Related Domain Concepts

Esta historia declara las entidades MVP:

* `User`
* `Event`
* `EventType`
* `EventTask`
* `Budget`
* `BudgetItem`
* `VendorProfile`
* `VendorService`
* `ServiceCategory`
* `Location`
* `QuoteRequest`
* `Quote`
* `BookingIntent`
* `Review`
* `Notification`
* `Attachment`
* `AdminAction`
* `AIRecommendation`
* `AIPromptVersion`

También aplica las convenciones físicas definidas para EventFlow:

* `snake_case`
* `is_seed`
* `deleted_at`
* `created_at`
* `updated_at`
* `timestamptz(6)`
* `numeric(14,2)`
* `jsonb`

---

### PO/BA Decisions Applied

| Decision                         | Resolution                                                                                                      |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Scope of US-099                  | US-099 cubre exclusivamente la declaración de `prisma/schema.prisma`.                                           |
| Relationship with US-100         | Migraciones Prisma ejecutables quedan fuera de US-099 y pertenecen a US-100.                                    |
| Relationship with US-101         | Índices avanzados, funcionales, GIN y parciales quedan fuera de US-099 y pertenecen a US-101.                   |
| Relationship with US-102         | Constraints C-001..C-062, check constraints y unique parciales quedan fuera de US-099 y pertenecen a US-102.    |
| Official ID                      | Se mantiene `US-099` como ID oficial. `US-DB-001` puede usarse sólo como alias interno del Epic Map si aparece. |
| `AIPromptVersion` strategy       | Estrategia híbrida aprobada: prompt registry versionado en código + tabla `AIPromptVersion` para trazabilidad.  |
| `EventType` PK                   | `EventType` usa `id UUID` como Primary Key y `code String` como identificador funcional único.                  |
| Status enums                     | Se usan enums separados por entidad, no un enum genérico reutilizado.                                           |
| QA strategy                      | QA debe cubrir `prisma validate`, `prisma generate` y tests estructurales sobre `schema.prisma`.                |
| `Location` and `ServiceCategory` | Ambos modelos se incluyen desde US-099 como modelos MVP obligatorios.                                           |
| Soft delete mechanism            | Tech Decision aprobada (permitida por ADR-DB-004 que admite `status` o `deleted_at`): los 7 modelos con soft delete declaran un campo uniforme `deletedAt DateTime? @map("deleted_at") @db.Timestamptz(6)`. Status y `is_active` permanecen como atributos funcionales de visibilidad/estado, pero la marca canónica de soft delete es `deletedAt`. Doc 18 §26 deberá amendarse para reflejar el mecanismo uniforme (Documentation Alignment Required, no bloqueante). |
| EventType PK precedence          | El uso de `id UUID` PK en `EventType` aplica ADR-DB-002 (Accepted, UUID v4 para todas las tablas) sobre lo descrito en Doc 18 §11/§12, que aún lista `code` como PK. Doc 18 deberá amendarse (Documentation Alignment Required, no bloqueante). |

---

### Assumptions

* La US-099 entrega únicamente el archivo `prisma/schema.prisma` y la generación exitosa del Prisma Client.
* `prisma migrate dev`, `prisma migrate deploy` y migraciones SQL ejecutables son responsabilidad de **US-100**.
* Índices declarativos `@@index` soportados nativamente por Prisma pueden declararse en esta historia cuando sean parte natural del modelo.
* Índices funcionales, GIN, parciales o que requieran SQL manual quedan delegados a **US-101**.
* Constraints C-001..C-062, check constraints y unique parciales se aplican en **US-102**.
* El stack confirmado es PostgreSQL + Prisma + Node.js + Express + TypeScript.
* `AIPromptVersion` se declara como tabla en Prisma, aunque el prompt registry versionado también vive en código.
* `EventType` se modela con `id UUID` como PK y `code` como identificador funcional único.
* `Location` y `ServiceCategory` forman parte del schema MVP inicial.

---

### Dependencies

* `PB-P0-002 — Backend Modular Monolith Bootstrap`, para que `prisma generate` pueda ejecutarse dentro del módulo backend.
* Variable `DATABASE_URL` definida en entorno, sin necesidad de conexión real para `prisma validate`.
* `Doc 6 — Domain Data Model`.
* `Doc 18 — Database Physical Design`.
* `Doc 22 — Architecture Decision Records`.
* ADR-DB-001 — PostgreSQL.
* ADR-BE-001 — Node.js + Express + TypeScript.

---

## 🔗 Traceability

| Source                 | Reference                                                                                                                                                                                                                                                                                 |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FRD Requirement(s)     | Transversal — habilita persistencia de FR-EVENT-*, FR-VENDOR-*, FR-QUOTE-*, FR-REVIEW-*, FR-AI-*, FR-ADMIN-*, FR-ATTACH-*                                                                                                                                                                 |
| Use Case(s)            | Transversal — no implementa directamente un UC; habilita persistencia para múltiples casos de uso                                                                                                                                                                                         |
| Business Rule(s)       | BR-EVENT-007, BR-QUOTE-009, BR-QUOTE-015, BR-REVIEW-005, BR-PRIVACY-011, BR-EVENTTYPE-007, BR-SERVICE-005, BR-SEED-005                                                                                                                                                                    |
| Permission Rule(s)     | No aplica — declaración estática; permisos de acceso a datos se gestionan en repositorios, use cases y policies futuras                                                                                                                                                                   |
| Data Entity / Entities | 19 entidades MVP listadas en esta User Story                                                                                                                                                                                                                                              |
| API Endpoint(s)        | No aplica — capa de persistencia declarativa                                                                                                                                                                                                                                              |
| NFR Reference(s)       | NFR-PERF-001, NFR-PERF-005, NFR-OBS-001, NFR-DATA-001..NFR-DATA-008, NFR-DEMO-003                                                                                                                                                                                                         |
| Related ADR(s)         | ADR-ARCH-001, ADR-BE-001, ADR-DB-001, ADR-DB-002, ADR-DB-003, ADR-DB-004, ADR-DB-005, ADR-AI-006                                                                                                                                                                                          |
| Related Document(s)    | `/docs/6-Domain-Data-Model.md`, `/docs/12-Architecture-Vision-and-Principles.md`, `/docs/13-System-Architecture-Document.md`, `/docs/14-Backend-Technical-Design.md`, `/docs/18-Database-Physical-Design.md`, `/docs/20-Testing-Strategy.md`, `/docs/22-Architecture-Decision-Records.md` |

---

## 🧭 Scope Guardrails

### MVP Scope

* Scope Classification: **In Scope**
* MVP Relevance: **Must Have (P0)**
* Delivery Type: **Technical foundation**
* Scope Boundary: **Declarative Prisma schema only**

---

### Explicitly Out of Scope

* Migraciones SQL ejecutables → **US-100**
* `prisma migrate dev` / `prisma migrate deploy` → **US-100**
* Índices funcionales, GIN y parciales vía raw SQL → **US-101**
* Check constraints, unique parciales y enforcement C-001..C-062 → **US-102**
* Seed real / fixtures → EPIC-SEED-001
* Repositorios Prisma → historias backend futuras
* Use cases de aplicación → historias backend futuras
* Controllers / API endpoints → historias API futuras
* Multi-tenant enterprise architecture
* Particionamiento físico
* Base vectorial / RAG
* Pagos reales
* Comisiones
* Contratos firmados
* Chat en tiempo real
* WhatsApp
* Push notifications
* Moderación IA
* Booking autónomo por IA

---

### Scope Notes

* La US-099 **no debe ejecutar `prisma migrate`** sobre una base real.
* La US-099 **sí debe permitir** que `npx prisma validate` y `npx prisma generate` corran exitosamente.
* La US-099 **no debe incluir lógica de aplicación**.
* La US-099 **debe respetar la convención `is_seed`** en cada modelo MVP operativo para habilitar reset quirúrgico de demo.
* La US-099 **debe incluir `Location` y `ServiceCategory`** desde el schema inicial.
* La US-099 **debe declarar `AIPromptVersion`** como tabla para trazabilidad, aunque el prompt registry operativo viva también en código.
* La US-099 **debe declarar `EventType.id` como UUID PK** y `EventType.code` como identificador funcional único.

---

## ✅ Acceptance Criteria

## 🎯 Happy Path

### AC-01: Declaración de modelos MVP

**Given** el archivo `prisma/schema.prisma` versionado en el repositorio backend
**When** ejecuto `npx prisma validate`
**Then** valida sin errores y declara los 19 modelos MVP:

* `User`
* `Event`
* `EventType`
* `EventTask`
* `Budget`
* `BudgetItem`
* `VendorProfile`
* `VendorService`
* `ServiceCategory`
* `Location`
* `QuoteRequest`
* `Quote`
* `BookingIntent`
* `Review`
* `Notification`
* `Attachment`
* `AdminAction`
* `AIRecommendation`
* `AIPromptVersion`

---

### AC-02: Enums canónicos separados por entidad

**Given** las entidades MVP declaradas en `schema.prisma`
**When** se inspeccionan los enums Prisma
**Then** se declaran los enums base:

* `UserRole`
* `CurrencyCode`
* `LanguageCode`
* `LLMProvider`

**And** se declaran enums de status separados por entidad cuando aplique, incluyendo al menos:

* `EventStatus`
* `QuoteRequestStatus`
* `QuoteStatus`
* `BookingIntentStatus`
* `ReviewStatus`
* `NotificationStatus`
* `AttachmentStatus`
* `VendorProfileStatus`
* `VendorServiceStatus`
* `AIRecommendationStatus`

**And** no se utiliza un enum genérico `Status` para múltiples entidades con máquinas de estado diferentes.

---

### AC-03: Convenciones de naming físico

**Given** los modelos declarados en `schema.prisma`
**When** se inspecciona la definición física
**Then** cada modelo declara `@@map("snake_case_plural")`
**And** cada campo Prisma en `camelCase` declara `@map("snake_case")` cuando el nombre físico difiere del nombre lógico.

---

### AC-04: Tipos PostgreSQL específicos

**Given** los campos monetarios, temporales y JSON del schema
**When** se inspecciona `schema.prisma`
**Then** los montos usan `@db.Decimal(14, 2)`
**And** los timestamps usan `@db.Timestamptz(6)`
**And** los campos JSON estructurados usan `@db.JsonB`.

---

### AC-05: Timestamps obligatorios

**Given** cualquier modelo persistente MVP
**When** se inspecciona `schema.prisma`
**Then** declara:

```prisma
createdAt DateTime @default(now()) @db.Timestamptz(6) @map("created_at")
updatedAt DateTime @updatedAt @db.Timestamptz(6) @map("updated_at")
```

---

### AC-06: Marca seed obligatoria

**Given** cualquier modelo MVP operativo
**When** se inspecciona `schema.prisma`
**Then** declara:

```prisma
isSeed Boolean @default(false) @map("is_seed")
```

**And** esta marca permite diferenciar datos seed/demo de datos operativos.

---

### AC-07: Soft delete declarativo

**Given** los modelos con soft delete requerido para el MVP, conforme a ADR-DB-004 (que admite `status` o `deleted_at`) y a la Tech Decision uniforme acordada en `PO/BA Decisions Applied`
**When** se inspecciona `schema.prisma`
**Then** declaran:

```prisma
deletedAt DateTime? @map("deleted_at") @db.Timestamptz(6)
```

**And** aplica como mínimo a los 7 modelos listados en Doc 18 §26:

* `Review`
* `Attachment`
* `VendorProfile`
* `VendorService`
* `ServiceCategory`
* `EventType`
* `Location`

**And** los atributos funcionales `status` / `is_active` pueden permanecer en cada entidad para reflejar su máquina de estados de visibilidad, pero **el marcador canónico de soft delete es `deletedAt`** y los filtros estándar deben usar `deletedAt IS NULL`.

---

### AC-08: Relaciones explícitas y estrategia `onDelete`

**Given** los modelos con relaciones
**When** se inspeccionan las Foreign Keys declaradas en Prisma
**Then** toda FK usa `@relation` explícito
**And** se usa `onDelete: Restrict` por defecto
**And** únicamente la relación de composición pura `Budget → BudgetItem` usa `onDelete: Cascade`.

---

### AC-09: Modelo `EventType` con UUID PK y code funcional

**Given** el modelo `EventType` declarado en `schema.prisma`, alineado con ADR-DB-002 (UUID v4 como PK para todas las tablas) y con la PO/BA Decision Applied que precede a Doc 18 §11/§12
**When** se inspeccionan sus identificadores
**Then** `EventType` declara `id` como UUID Primary Key (`@id @default(uuid()) @db.Uuid`)
**And** declara `code` como identificador funcional único (`@unique`)
**And** las relaciones hacia `EventType` deben usar la PK técnica o la relación Prisma correspondiente sin depender exclusivamente del texto del código como PK
**And** la migración derivada (US-100) deberá generar la tabla `event_types` con `id uuid` PK y `code text` unique, no con `code` como PK físico.

---

### AC-10: Modelo `AIPromptVersion` para estrategia híbrida

**Given** la estrategia híbrida aprobada para PromptOps
**When** se inspecciona `schema.prisma`
**Then** se declara el modelo `AIPromptVersion` como entidad persistente
**And** permite relacionar versiones de prompt con `AIRecommendation`
**And** no implementa sincronización automática código → base de datos dentro de esta User Story.

---

### AC-11: Generación del Prisma Client

**Given** un schema validado
**When** ejecuto `npx prisma generate`
**Then** genera el Prisma Client sin warnings bloqueantes
**And** los tipos de `@prisma/client` quedan disponibles para imports en `src/`.

---

## ⚠️ Edge Cases

### EC-01: FK a entidad inexistente

**Given** un cambio que referencia una entidad o campo no declarado
**When** se ejecuta `npx prisma validate`
**Then** falla con mensaje claro indicando la relación inválida.

#### Handling

* CI debe ejecutar `prisma validate` en cada PR que toque `schema.prisma`.
* El PR no debe avanzar si `prisma validate` falla.

---

### EC-02: Cambio de enum sin migración

**Given** un cambio en un enum Prisma
**When** se ejecuta `prisma validate`
**Then** la validación estructural puede pasar
**But** el PR debe documentar que la migración ejecutable correspondiente pertenece a US-100.

#### Handling

* PR template debe recordar revisar impacto de migración cuando cambien enums.
* La ejecución de la migración no pertenece a US-099.

---

### EC-03: Omisión de `isSeed`

**Given** un modelo MVP operativo nuevo o existente
**When** se ejecuta el test estructural de schema
**Then** el test falla si el modelo no declara `isSeed Boolean @default(false) @map("is_seed")`.

---

### EC-04: Soft delete faltante

**Given** un modelo con soft delete requerido
**When** se ejecuta el test estructural de schema
**Then** el test falla si el modelo no declara `deletedAt DateTime? @map("deleted_at") @db.Timestamptz(6)`.

---

## 🚫 Validation Rules

| ID    | Rule                                                            | Message / Behavior                             |
| ----- | --------------------------------------------------------------- | ---------------------------------------------- |
| VR-01 | `prisma validate` debe pasar en CI                              | Falla del job bloquea merge                    |
| VR-02 | `prisma generate` debe pasar en CI                              | Falla del job bloquea merge                    |
| VR-03 | Toda FK debe usar `@relation` explícito                         | Revisión técnica o test estructural falla      |
| VR-04 | Tipos monetarios deben usar `@db.Decimal(14, 2)`                | Test estructural o revisión PR falla           |
| VR-05 | Timestamps deben usar `@db.Timestamptz(6)`                      | Test estructural o revisión PR falla           |
| VR-06 | Todo modelo MVP operativo debe declarar `isSeed`                | Test estructural falla                         |
| VR-07 | Todo modelo con soft delete requerido debe declarar `deletedAt` | Test estructural falla                         |
| VR-08 | Status enums deben ser separados por entidad                    | Revisión técnica falla si se usa enum genérico |
| VR-09 | `EventType` debe usar `id UUID` como PK y `code` como funcional | Test estructural o revisión PR falla           |
| VR-10 | `AIPromptVersion` debe existir como modelo Prisma               | Test estructural falla                         |

---

## 🔐 Authorization & Security Rules

| ID     | Rule                                                                                                                    |
| ------ | ----------------------------------------------------------------------------------------------------------------------- |
| SEC-01 | El archivo `schema.prisma` no debe contener `DATABASE_URL` ni secretos hardcodeados.                                    |
| SEC-02 | Variables sensibles como `DATABASE_URL` viven en env vars / Secrets Manager, nunca en el repo.                          |
| SEC-03 | El schema no debe declarar campos de tarjetas, CVV ni datos de pago reales.                                             |
| SEC-04 | El schema no debe introducir modelos de chat real-time, WhatsApp, contratos firmados o pagos reales.                    |
| SEC-05 | El schema debe permitir soporte futuro para RBAC, ownership y assignment, pero no implementa policies en esta historia. |

### Negative Authorization Scenarios

No aplica directamente. Esta historia no introduce endpoints ni runtime authorization.

---

## 🤖 AI Behavior

This story does not invoke AI directly.

### AI Involvement

| Field                     | Value                 |
| ------------------------- | --------------------- |
| AI Feature                | None                  |
| Provider Layer            | Not applicable        |
| Human Validation Required | Not applicable        |
| Persist AIRecommendation  | Habilitado vía schema |
| Fallback Required         | Not applicable        |

### Human-in-the-loop Rules

* `AIRecommendation` debe declarar un status que permita representar el flujo HITL.
* Status mínimos esperados para `AIRecommendationStatus`:

  * `pending`
  * `accepted`
  * `edited`
  * `rejected`
  * `discarded`
* `AIPromptVersion` debe declararse como modelo persistente para trazabilidad.
* El carácter append-only de `AIPromptVersion` se documenta como intención de diseño, pero el enforcement técnico pertenece a US-102 o historias posteriores de PromptOps.

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

| Topic                | Guidance                                                    |
| -------------------- | ----------------------------------------------------------- |
| Use Case / Service   | No aplica — declaración estática                            |
| Controller / Route   | No aplica                                                   |
| Authorization Policy | No aplica                                                   |
| Validation           | `prisma validate` + `prisma generate` + tests estructurales |
| Transaction Required | No aplica                                                   |
| Runtime Logic        | No aplica                                                   |

---

### Database

#### Main Models

Se deben declarar los siguientes 19 modelos MVP:

* `User`
* `Event`
* `EventType`
* `EventTask`
* `Budget`
* `BudgetItem`
* `VendorProfile`
* `VendorService`
* `ServiceCategory`
* `Location`
* `QuoteRequest`
* `Quote`
* `BookingIntent`
* `Review`
* `Notification`
* `Attachment`
* `AdminAction`
* `AIRecommendation`
* `AIPromptVersion`

---

#### Required Base Enums

* `UserRole`
* `CurrencyCode`
* `LanguageCode`
* `LLMProvider`

---

#### Required Status Enums by Entity

* `EventStatus`
* `QuoteRequestStatus`
* `QuoteStatus`
* `BookingIntentStatus`
* `ReviewStatus`
* `NotificationStatus`
* `AttachmentStatus`
* `VendorProfileStatus`
* `VendorServiceStatus`
* `AIRecommendationStatus`

Cada enum debe reflejar la máquina de estados propia de su entidad.

---

#### Naming Conventions

* Prisma models use `PascalCase`.
* Prisma fields use `camelCase`.
* Database tables use `snake_case_plural`.
* Database columns use `snake_case`.
* Every model must use `@@map`.
* Every field with a physical name different from the Prisma name must use `@map`.

---

#### PostgreSQL Types

| Field Type             | Prisma / PG Mapping       |
| ---------------------- | ------------------------- |
| Monetary amounts       | `@db.Decimal(14, 2)`      |
| Timestamps             | `@db.Timestamptz(6)`      |
| Structured JSON        | `@db.JsonB`               |
| Optional string arrays | `String[]` where approved |

---

#### Seed Convention

Cada modelo MVP operativo debe declarar:

```prisma
isSeed Boolean @default(false) @map("is_seed")
```

---

#### Soft Delete

Los modelos con soft delete requerido deben declarar:

```prisma
deletedAt DateTime? @map("deleted_at") @db.Timestamptz(6)
```

Aplica al menos a:

* `Review`
* `Attachment`
* `VendorProfile`
* `VendorService`
* `ServiceCategory`
* `EventType`
* `Location`

---

#### Relation Strategy

* Toda relación debe usar `@relation` explícito.
* `onDelete: Restrict` es el comportamiento por defecto.
* `onDelete: Cascade` sólo se permite en composición pura `Budget → BudgetItem`.

---

#### `EventType`

`EventType` debe declararse con:

* `id UUID` como Primary Key.
* `code String` como identificador funcional único.
* Campos para label, descripción, active/inactive y soft delete cuando aplique.

---

#### `AIPromptVersion`

`AIPromptVersion` debe declararse como modelo persistente para:

* Guardar versión de prompt.
* Relacionarse con `AIRecommendation`.
* Apoyar trazabilidad AI4Devs.
* Permitir auditoría de qué versión de prompt produjo una recomendación.

El prompt registry versionado también vive en código. Esta historia sólo declara la tabla.

---

#### Prisma vs Raw SQL Boundary

Esta historia puede declarar:

* Modelos.
* Enums.
* Relaciones.
* `@@map` / `@map`.
* `@unique` simple si aplica.
* `@@index` simple si aplica.
* Tipos PostgreSQL soportados por Prisma.

Esta historia no implementa:

* Unique parciales.
* Check constraints complejos.
* Índices funcionales.
* Índices GIN.
* Triggers.
* SQL manual.

Eso pertenece a US-101 y US-102.

---

### API

| Method | Endpoint | Purpose   |
| ------ | -------- | --------- |
| —      | —        | No aplica |

---

### Observability / Audit

| Topic                             | Required                                       |
| --------------------------------- | ---------------------------------------------- |
| Correlation ID                    | No aplica                                      |
| Runtime logs                      | No aplica                                      |
| AdminAction                       | No aplica                                      |
| AIRecommendation runtime creation | No aplica                                      |
| CI logs                           | Sí, para `prisma validate` y `prisma generate` |

---

## 🧪 Test Scenarios

### Functional Tests

| ID    | Scenario                                                                                              | Type       |
| ----- | ----------------------------------------------------------------------------------------------------- | ---------- |
| TS-01 | `npx prisma validate` pasa en CI sobre `prisma/schema.prisma`                                         | CI / Build |
| TS-02 | `npx prisma generate` produce Prisma Client sin warnings bloqueantes                                  | CI / Build |
| TS-03 | Test estructural verifica presencia de los 19 modelos MVP                                             | Unit       |
| TS-04 | Test estructural verifica presencia de `isSeed` en cada modelo MVP operativo                          | Unit       |
| TS-05 | Test estructural verifica `deletedAt` en modelos con soft delete requerido                            | Unit       |
| TS-06 | Test estructural verifica enums base: `UserRole`, `CurrencyCode`, `LanguageCode`, `LLMProvider`       | Unit       |
| TS-07 | Test estructural verifica enums de status separados por entidad                                       | Unit       |
| TS-08 | Test estructural verifica `EventType.id` como UUID PK y `EventType.code` como identificador funcional | Unit       |
| TS-09 | Test estructural verifica existencia del modelo `AIPromptVersion`                                     | Unit       |
| TS-10 | Test estructural verifica convenciones `@@map` y `@map`                                               | Unit       |

---

### Negative Tests

| ID    | Scenario                                               | Expected Result                           |
| ----- | ------------------------------------------------------ | ----------------------------------------- |
| NT-01 | FK a modelo inexistente                                | `prisma validate` falla con mensaje claro |
| NT-02 | Campo monetario declarado sin `@db.Decimal(14,2)`      | Test estructural falla                    |
| NT-03 | Modelo MVP operativo sin `isSeed`                      | Test estructural falla                    |
| NT-04 | Relación FK sin `@relation` explícito                  | Test estructural o revisión PR falla      |
| NT-05 | Modelo con soft delete requerido sin `deletedAt`       | Test estructural falla                    |
| NT-06 | Uso de enum genérico `Status` para múltiples entidades | Revisión técnica o test estructural falla |
| NT-07 | `EventType` sin UUID PK                                | Test estructural falla                    |
| NT-08 | Ausencia de `AIPromptVersion`                          | Test estructural falla                    |

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

| Field               | Value                                                                                           |
| ------------------- | ----------------------------------------------------------------------------------------------- |
| KPI Affected        | Time-to-Build, Demo Completion, Technical Foundation Readiness                                  |
| Expected Impact     | Desbloquea EPIC-BE-001, EPIC-API-001, EPIC-AI-001 y EPIC-SEED-001                               |
| Success Criteria    | `prisma validate` + `prisma generate` verdes en CI sobre PR principal                           |
| Academic Demo Value | Permite demostrar persistencia tipada, soft delete, marca seed, trazabilidad IA y base auditada |

---

## 🧩 Task Breakdown Readiness

Esta historia ya queda lista para pasar por aprobación PO/BA antes de generar Development Tasks.

### Potential Database Tasks

* Declarar enums base.
* Declarar enums de status por entidad.
* Declarar los 19 modelos MVP.
* Declarar `@@map` y `@map`.
* Declarar tipos PostgreSQL específicos.
* Declarar `isSeed`.
* Declarar `deletedAt` donde aplique.
* Declarar timestamps.
* Declarar relaciones explícitas con `@relation`.
* Declarar `EventType` con UUID PK + `code`.
* Declarar `AIPromptVersion`.

### Potential QA Tasks

* Agregar job CI para `prisma validate`.
* Agregar job CI para `prisma generate`.
* Crear tests estructurales sobre `schema.prisma`.
* Validar presencia de modelos, enums, mappings, `isSeed`, `deletedAt`, `EventType` y `AIPromptVersion`.

---

## ✅ Definition of Ready

* [x] Decisión PO confirmando límite de alcance US-099 vs US-100/US-101/US-102.
* [x] Decisión PO confirmando que `US-099` es el ID oficial.
* [x] Decisión Tech/PO sobre `AIPromptVersion`: estrategia híbrida código + tabla.
* [x] Decisión Tech/PO sobre `EventType`: `id UUID` como PK + `code` funcional único.
* [x] Decisión Tech/PO sobre enums Prisma: enums separados por entidad.
* [x] Decisión QA sobre estrategia de validación: `prisma validate` + `prisma generate` + tests estructurales.
* [x] Decisión Tech/PO sobre inclusión de `Location` y `ServiceCategory`.
* [x] Rol claro: System.
* [x] Goal técnico claro.
* [x] Alcance delimitado.
* [x] Out of Scope explícito.
* [x] Acceptance Criteria testables.
* [x] Referencias arquitectónicas corregidas.
* [x] Entidades listadas explícitamente.
* [x] Lista para Approval Gate.

---

## 🏁 Definition of Done

* [ ] `prisma/schema.prisma` versionado y revisado en PR.
* [ ] Los 19 modelos MVP están declarados.
* [ ] Enums base declarados.
* [ ] Enums de status por entidad declarados.
* [ ] `EventType` declarado con `id UUID` como PK y `code` como identificador funcional único.
* [ ] `AIPromptVersion` declarado como modelo persistente.
* [ ] `Location` y `ServiceCategory` declarados como modelos MVP.
* [ ] Convenciones `@@map` y `@map` aplicadas.
* [ ] `isSeed` declarado en modelos MVP operativos.
* [ ] `deletedAt` declarado en modelos con soft delete requerido.
* [ ] Timestamps declarados con `@db.Timestamptz(6)`.
* [ ] Campos monetarios declarados con `@db.Decimal(14, 2)`.
* [ ] Campos JSON estructurados declarados con `@db.JsonB`.
* [ ] Relaciones declaradas con `@relation` explícito.
* [ ] `onDelete: Restrict` aplicado por defecto.
* [ ] `onDelete: Cascade` usado únicamente en `Budget → BudgetItem`.
* [ ] `npx prisma validate` verde en CI.
* [ ] `npx prisma generate` verde en CI.
* [ ] Tests estructurales TS-03..TS-10 verdes.
* [ ] Tests negativos NT-01..NT-08 verdes.
* [ ] PR revisado por Tech Lead.
* [ ] Documentación técnica actualizada si aplica.

---

## 📝 Notes

* La US-099 **no aplica migraciones** sobre base real; eso pertenece a US-100.
* La US-099 **no implementa índices avanzados**; eso pertenece a US-101.
* La US-099 **no implementa constraints físicos complejos**; eso pertenece a US-102.
* La marca `is_seed` es obligatoria por convención EventFlow; cualquier omisión rompe el reset quirúrgico del entorno demo.
* `AIPromptVersion` se declara como tabla, pero el prompt registry operativo también vive en código (ADR-AI-006).
* `EventType` usa `id UUID` como PK y `code` como identificador funcional único (ADR-DB-002).
* Los status enums se declaran por entidad para evitar máquinas de estado ambiguas.
* `Location` y `ServiceCategory` son parte del schema MVP inicial porque desbloquean vendors, eventos, búsqueda, categorías IA y cotizaciones.
* El soft delete uniforme vía `deletedAt` aplica a los 7 modelos listados en Doc 18 §26 y es válido bajo ADR-DB-004 (que admite `status` o `deleted_at`).

### Documentation Alignment Required (no bloqueante)

Estos puntos deben amendarse en documentos fuente posteriores al merge, pero **no bloquean la aprobación de US-099** porque están respaldados por ADRs aceptados o decisiones PO/BA formalizadas:

* **Doc 18 §11 / §12** — Actualmente lista `event_types | PK code`. Debe amendarse para reflejar `id UUID` PK y `code` unique, alineado con ADR-DB-002.
* **Doc 18 §26** — Actualmente lista mecanismos mixtos de soft delete (`is_active`, `status`, `deleted_at` solo en attachments). Debe amendarse para reflejar el mecanismo uniforme `deletedAt` aprobado en la Tech Decision (allowed por ADR-DB-004).
* **PB-P0-001 (Backlog Prioritized) — Description** — Aún menciona `VendorWork` y `Task`. Debe alinearse al lenguaje canónico `EventTask` y a Doc 6 §6 que indica que el portafolio del vendor se cubre con `Attachment` polimórfico (`VendorWork` se cubre con `Attachment`).
* **EPIC Map — `US-DB-001` alias** — La convención oficial es `US-099` como ID. `US-DB-001` queda como alias interno del Epic Map sin valor funcional.
