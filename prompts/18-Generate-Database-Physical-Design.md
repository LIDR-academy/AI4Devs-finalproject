# AAA Prompt — Generate EventFlow Database Physical Design Document

## ACT AS

You are a **Senior Database Architect, PostgreSQL Specialist, Prisma ORM Expert, and Data Integrity Reviewer** working on the EventFlow MVP.

You are responsible for generating the official:

`/docs/18-Database-Physical-Design.md`

for **EventFlow**, an AI-assisted event planning workspace with a simplified vendor quote flow.

You must work as a rigorous technical document generator. Your job is not to invent a new product, new modules, or new entities. Your job is to translate the approved functional, architectural, backend, API, AI, seed, and data model documentation into a concrete, implementable, and traceable **physical database design** for PostgreSQL + Prisma.

The final document must be written in **Spanish LATAM neutral**, with professional technical language, clear structure, tables, Mermaid diagrams where useful, and strong traceability to the existing documentation.

---

## AVAILABLE SOURCE DOCUMENTS

Use the following documents as the complete source of truth:

1. `/docs/1-Domain-Discovery-Report.md`
2. `/docs/2-Product-Owner-Decisions.md`
3. `/docs/3-MVP-Scope-Definition.md`
4. `/docs/4-Business-Rules-Document.md`
5. `/docs/5-User-Roles-Permissions-Matrix.md`
6. `/docs/6-Domain-Data-Model.md`
7. `/docs/7-AI-Features-Specification.md`
8. `/docs/8-Use-Cases-Specification.md`
9. `/docs/8.1-Product-Owner-Decisions-Use-Cases-Addendum.md`
10. `/docs/8.2-Documentation-Alignment-Review-Before-FRD.md`
11. `/docs/9-Functional-Requirements-Document.md`
12. `/docs/10-Non-Functional-Requirements.md`
13. `/docs/11-Data-Seed-Strategy.md`
14. `/docs/12-Architecture-Vision-and-Principles.md`
15. `/docs/13-System-Architecture-Document.md`
16. `/docs/14-Backend-Technical-Design.md`
17. `/docs/15-Frontend-Architecture-Design.md`
18. `/docs/16-API-Design-Specification.md`
19. `/docs/17-AI-Architecture-and-PromptOps-Design.md`

You must treat `/docs/6-Domain-Data-Model.md` as the logical data model source, but you must also incorporate the later technical decisions from:

* `/docs/14-Backend-Technical-Design.md`
* `/docs/16-API-Design-Specification.md`
* `/docs/17-AI-Architecture-and-PromptOps-Design.md`

The AI Architecture document is especially important for the physical design of:

* `AIRecommendation`
* `AIPromptVersion`
* prompt versioning
* AI traceability
* `LLMProvider` metadata
* input/output JSON payloads
* fallback tracking
* timeout tracking
* human-in-the-loop states
* demo/testing support with `MockAIProvider`

---

## ASK

Generate the complete **Database Physical Design Document** for EventFlow.

The document must translate the approved EventFlow domain model into a concrete PostgreSQL + Prisma physical database design.

The document must cover, at minimum:

1. Purpose, scope, and non-scope of the Database Physical Design.
2. Source documents and how each one influences the physical design.
3. Physical database principles for EventFlow.
4. PostgreSQL as the primary database.
5. Prisma ORM as the schema and migration tool.
6. Naming conventions for:

   * tables
   * columns
   * enums
   * indexes
   * foreign keys
   * unique constraints
   * check constraints
   * migration files
7. Physical schema strategy.
8. Prisma schema organization strategy.
9. Mapping from logical entities to physical tables.
10. Detailed table-by-table design.
11. Physical column types.
12. Primary keys and ID strategy.
13. Foreign keys and referential actions.
14. Required enums.
15. Required constraints.
16. Unique constraints.
17. Check constraints.
18. Indexing strategy.
19. Query-driven indexes based on API, use cases, permissions, admin dashboard, seed/demo, and AI traceability.
20. Soft delete strategy.
21. Auditability strategy.
22. AI persistence strategy.
23. `AIRecommendation` physical design.
24. `AIPromptVersion` physical design, including whether it is mandatory or recommended.
25. JSONB usage strategy for AI input/output payloads.
26. Human-in-the-loop persistence model for AI-generated outputs.
27. Fallback and timeout persistence for AI calls.
28. Prompt version traceability.
29. Admin action audit log design.
30. Attachments physical design and soft delete.
31. Notification persistence design.
32. Seed data support and `is_seed` strategy.
33. Migration strategy with Prisma.
34. Rollback and migration safety strategy.
35. Data integrity rules derived from Business Rules and Product Owner decisions.
36. Transactional consistency considerations.
37. Concurrency and race-condition risks.
38. Performance and scalability considerations for MVP.
39. Security and privacy considerations at database level.
40. Environment configuration.
41. Development, test, QA, demo, and production database considerations.
42. Exclusions and out-of-scope data structures.
43. Open questions or decisions that require ADRs, only if truly necessary.
44. Readiness checklist for implementation.
45. Traceability matrix.

---

## CRITICAL DATABASE DESIGN REQUIREMENTS

### 1. Do not invent entities

Do not create new entities unless they are explicitly present, recommended, or clearly derived from the source documents.

If an entity is not in the Domain Data Model but appears later in the Backend, API, or AI Architecture documents, explain why it is included or excluded.

If a concept can be implemented as an attribute, enum, JSONB payload, or seed/static catalog instead of a new table, prefer the simpler option and justify it.

---

### 2. Respect the approved MVP scope

The physical database design must not introduce support for:

* real payments
* payment methods
* invoices
* commissions
* contracts
* digital signatures
* real-time chat
* WhatsApp integration
* SMS
* push notifications
* native mobile devices
* calendar integrations
* RSVP
* guest lists
* seating plans
* AI moderation
* sentiment analysis
* vector databases
* embeddings
* RAG
* multi-tenant enterprise features
* autonomous AI decision-making

If any of these appear in the source documents as Future or Out of Scope, include them only in an explicit **Out of Scope / Future** section and do not model them physically for the MVP.

---

### 3. Use PostgreSQL-specific strengths carefully

Use PostgreSQL features where they add real value:

* `uuid`
* `timestamptz`
* `numeric`
* `jsonb`
* partial indexes
* composite indexes
* check constraints
* foreign keys
* enum strategy
* unique constraints
* soft-delete-friendly indexes

Avoid overengineering. Do not introduce triggers, stored procedures, materialized views, partitioning, or advanced extensions unless there is a strong MVP justification.

If you recommend any PostgreSQL extension, explain why and whether it is required or optional.

---

### 4. Prisma compatibility is mandatory

The document must explain how the physical design maps to Prisma.

Include:

* Prisma model naming strategy.
* Prisma enum naming strategy.
* Prisma relation naming guidance.
* How to represent PostgreSQL `jsonb`.
* How to represent `numeric`.
* How to represent timestamps.
* How to represent soft delete.
* How to model indexes using `@@index`, `@@unique`, and mapped table/column names.
* How to handle constraints not fully expressible in Prisma.
* How to document raw SQL migrations when necessary.

Do not produce a full final `schema.prisma` unless needed as illustrative excerpts. Prefer representative examples per complex area.

---

### 5. AI persistence must be fully addressed

Because `/docs/17-AI-Architecture-and-PromptOps-Design.md` now exists, the Database Physical Design must include a dedicated AI persistence section.

It must define the physical design for `AIRecommendation`, including fields such as:

* `id`
* `type`
* `status`
* `user_id`
* `event_id`
* optional `vendor_profile_id`
* optional `quote_request_id`
* optional `quote_id`
* `llm_provider`
* `model`
* `prompt_version_id`
* `language_code`
* `input_payload`
* `output_payload`
* `validated_output_payload`
* `accepted`
* `edited`
* `fallback_used`
* `fallback_reason`
* `timeout_ms`
* `latency_ms`
* `error_code`
* `error_message`
* `correlation_id`
* `created_at`
* `accepted_at`
* `rejected_at`
* `discarded_at`
* `is_seed`

Also define whether `AIPromptVersion` should be:

* a physical table,
* a code registry only,
* or a hybrid approach.

If recommending a hybrid approach, explain:

* what lives in code,
* what lives in database,
* how prompt version IDs are traced,
* how deployments and migrations stay consistent.

The design must support PromptOps traceability without turning the MVP into an enterprise prompt management platform.

---

### 6. Human-in-the-loop must be reflected in data design

The database must support the rule:

AI outputs are suggestions and do not become official domain data until explicitly accepted by the user.

For every AI-generated artifact that can become official data, explain where the suggestion is stored first and how it becomes official after acceptance.

Examples:

* AI checklist suggestions → `AIRecommendation` first, then accepted tasks into `EventTask`.
* AI budget suggestions → `AIRecommendation` first, then accepted items into `BudgetItem`.
* AI quote brief → `AIRecommendation` first, then applied to `QuoteRequest`.
* AI vendor bio/package suggestions → `AIRecommendation` first, then applied to `VendorProfile` or `VendorService`.
* AI quote comparison summary → may remain as `AIRecommendation` without becoming official domain data.

---

### 7. Data integrity rules must reflect Product Owner decisions

Ensure the physical design supports these decisions:

* Rating scale from 1 to 5.
* Up to 10 portfolio images per work/event shown.
* Vendor category changes limited to 5.
* Quote default validity: 15 calendar days.
* `BookingIntent.confirmed_intent` can be cancelled without platform penalty.
* Event auto-completion 2 days after `event_date`.
* Event currency is immutable after creation.
* Captcha/anti-bot is required in auth flows, but do not store captcha secrets.
* AI timeout is 60,000 ms.
* Admin metrics must be supported without overbuilding analytics.
* Deleted/hidden reviews require auditability.
* Quote rejection/expiration notification must be supported.
* Vendor response to reviews is out of MVP.
* `AnthropicProvider` is a stub/future adapter, but the data model must not block provider traceability.
* Admin can list events read-only.
* `EventType` management must avoid destructive deletion when referenced.
* Service category hierarchy is maximum 2 levels.
* Attachments use soft delete.

---

### 8. Authorization and ownership must be supported physically

The database design must support backend enforcement of:

* organizer owns events
* vendor owns vendor profile and vendor services
* vendor only sees quote requests assigned to them
* organizer only sees quotes for their own events
* admin actions are audited
* seed users/data are clearly identifiable
* public directory only exposes approved vendors
* reviews are only created by organizers with confirmed booking intent

The database should not rely on frontend-only guards.

---

### 9. Indexing must be query-driven

Define indexes based on real access patterns from the API and use cases.

At minimum, consider indexes for:

* login by email
* users by role/status
* events by owner/status/date/type
* public vendor directory search/filter
* vendor profile approval queues
* vendor services by category
* quote requests by event/vendor/status
* quotes by request/status/valid_until
* booking intents by event/vendor/status
* reviews by vendor/status/rating
* notifications by user/read status
* admin actions by actor/resource/action/date
* AI recommendations by user/event/type/status/provider/prompt version
* attachments by owner/status
* seed data reset by `is_seed`

Use partial indexes where useful for soft delete and status-based queries.

---

### 10. Migration strategy must be actionable

Include a Prisma migration strategy covering:

* initial baseline migration
* enum changes
* adding nullable columns safely
* backfills
* adding constraints after backfill
* index creation
* seed migration coordination
* dev/test/demo reset
* production-safe migration principles
* when raw SQL migrations are acceptable
* migration naming convention

---

### 11. The output must be implementation-ready but not code-heavy

The document should be detailed enough for backend engineers and AI coding agents to implement:

* `prisma/schema.prisma`
* migrations
* seed scripts
* repository adapters
* integration tests

But it should remain a design document, not a full generated implementation.

Use code snippets only when they clarify complex decisions.

---

## ACHIEVE

Produce a complete Markdown document with the following structure:

# EventFlow — Database Physical Design Document

## 1. Propósito del documento

Explain what this document defines and why it exists.

## 2. Alcance del documento

### 2.1 Incluye

### 2.2 No incluye

## 3. Fuentes utilizadas

Create a table listing every source document and how it influences the physical database design.

## 4. Resumen ejecutivo

Summarize the physical database strategy:

* PostgreSQL
* Prisma
* UUIDs
* relational core
* JSONB for AI payloads
* soft delete
* auditability
* seed support
* query-driven indexes
* human-in-the-loop AI persistence

## 5. Principios de diseño físico de base de datos

Include principles such as:

* source-of-truth traceability
* PostgreSQL first, Prisma compatible
* constraints over application-only validation where useful
* no overengineering
* AI traceability
* soft delete where required
* seed determinism
* ownership support
* MVP boundaries

## 6. Stack de persistencia aprobado

Include PostgreSQL + Prisma + Node.js backend context.

## 7. Convenciones de naming

Cover tables, columns, enums, indexes, constraints, foreign keys, and migrations.

## 8. Estrategia de IDs, timestamps y auditoría básica

Define UUIDs, `created_at`, `updated_at`, `deleted_at`, `is_seed`, and audit fields.

## 9. Estrategia de tipos PostgreSQL

Cover:

* `uuid`
* `text`
* `varchar`
* `numeric`
* `integer`
* `boolean`
* `date`
* `timestamptz`
* `jsonb`
* enums

## 10. Estrategia Prisma

Explain:

* Prisma models
* Prisma enums
* relation mapping
* `@map` and `@@map`
* `Json` fields for JSONB
* Decimal usage
* timestamps
* indexes
* unsupported constraints
* raw SQL migrations when needed

## 11. Mapeo entidad lógica → tabla física

Create a table mapping each logical entity to its physical table name and scope.

## 12. Catálogo físico de tablas MVP

For each MVP table, include:

* purpose
* source documents
* owner
* main columns
* primary key
* foreign keys
* important constraints
* indexes
* soft delete strategy
* seed strategy
* notes

Include at minimum:

* users
* events
* event_types
* event_tasks
* budgets
* budget_items
* vendor_profiles
* vendor_services
* service_categories
* quote_requests
* quotes
* booking_intents
* reviews
* notifications
* attachments
* admin_actions
* ai_recommendations
* ai_prompt_versions, if recommended
* currencies, if modeled physically
* languages, if modeled physically
* locations, if modeled physically

## 13. Diseño físico de `users`

## 14. Diseño físico de eventos y planificación

Cover:

* `events`
* `event_types`
* `event_tasks`
* `budgets`
* `budget_items`

## 15. Diseño físico de proveedores y catálogo

Cover:

* `vendor_profiles`
* `vendor_services`
* `service_categories`
* portfolio/attachment ownership

## 16. Diseño físico del flujo de cotización

Cover:

* `quote_requests`
* `quotes`
* `booking_intents`

## 17. Diseño físico de reseñas y moderación

Cover:

* `reviews`
* hidden/removed status
* audit through `admin_actions`

## 18. Diseño físico de notificaciones

Cover in-app notification persistence and simulated email support.

## 19. Diseño físico de attachments

Cover:

* polymorphic ownership or explicit owner strategy
* soft delete
* portfolio limit support
* MIME/type/size metadata
* storage key/path
* no real sensitive documents beyond MVP

## 20. Diseño físico de auditoría administrativa

Cover `admin_actions`, resource references, JSONB metadata, actor, action, timestamps, and indexes.

## 21. Diseño físico de IA y PromptOps

This section is mandatory and must be detailed.

Cover:

* `ai_recommendations`
* `ai_prompt_versions`
* provider metadata
* model metadata
* prompt version traceability
* input/output JSONB
* validated output JSONB
* fallback metadata
* timeout metadata
* latency metadata
* correlation ID
* human-in-the-loop statuses
* accepted/edited/rejected/discarded lifecycle
* relation to official domain data
* seed/mock support
* indexing strategy
* privacy considerations

## 22. Estrategia JSONB

Explain where JSONB is allowed and where it is not.

JSONB is acceptable for:

* AI input payload
* AI output payload
* validated AI output payload
* admin action metadata
* notification metadata
* quote structured details if justified
* attachment metadata if needed

JSONB should not replace core relational fields needed for filtering, ownership, constraints, or authorization.

## 23. Enums físicos requeridos

List all required enums and values.

Include enums for:

* user role
* user status
* event status
* task status
* source/origin
* vendor profile status
* quote request status
* quote status
* booking intent status
* review status
* notification type/status
* attachment owner type/status
* AI recommendation type
* AI recommendation status
* LLM provider
* language code
* currency code, if modeled as enum

## 24. Constraints e invariantes de negocio

Create a table with:

* constraint ID/name
* table
* rule
* enforcement mechanism
* source rule/decision
* notes

Cover all key Product Owner and Business Rule decisions.

## 25. Índices físicos

Create an index catalog table with:

* index name
* table
* columns
* type
* condition, if partial
* query/use case supported
* priority

## 26. Estrategia de soft delete

Explain which tables use soft delete and why.

Include:

* `deleted_at`
* status-based soft delete
* partial indexes excluding deleted records
* audit requirements

## 27. Estrategia de seed data

Explain:

* `is_seed`
* deterministic seed
* reset strategy
* constraints for seed data
* environment protection
* indexes supporting seed reset

## 28. Estrategia de migraciones Prisma

Include:

* migration naming
* baseline migration
* incremental migrations
* enum changes
* nullable first strategy
* backfill strategy
* constraint addition strategy
* raw SQL policy
* rollback considerations
* migration review checklist

## 29. Transacciones y consistencia

Identify operations that require transactions, such as:

* creating event with budget
* accepting AI recommendations into official tables
* creating quote request
* submitting quote
* accepting quote and creating booking intent
* cancelling booking intent
* publishing review
* admin moderation
* seed reset

## 30. Riesgos físicos de base de datos y mitigaciones

Include risks such as:

* weak AI traceability
* excessive JSONB usage
* missing ownership indexes
* enum migration pain
* soft delete inconsistencies
* seed drift
* over-modeling future marketplace features
* race conditions in quote/booking flows

## 31. Consideraciones de seguridad y privacidad

Cover:

* no credentials in DB
* password hash only
* no captcha secrets stored
* prompt minimization
* no payment data
* no sensitive legal IDs
* safe logging through correlation IDs
* role/ownership-supporting schema
* PII minimization

## 32. Consideraciones de performance MVP

Cover:

* expected MVP scale
* indexes
* avoiding premature partitioning
* avoiding unnecessary materialized views
* pagination support
* admin dashboard query support

## 33. Exclusiones explícitas del modelo físico MVP

List all out-of-scope entities and why they are excluded.

## 34. ADRs o decisiones pendientes

Only include if necessary. Do not invent fake blockers.

## 35. Checklist de readiness para implementación

Create a checklist for:

* Prisma schema
* migrations
* constraints
* indexes
* seed
* AI persistence
* soft delete
* tests
* documentation

## 36. Matriz de trazabilidad

Create a traceability matrix mapping:

* table
* source entity / FR / UC / BR / AI feature
* related API endpoints
* related backend module
* related seed scenario
* related NFR

## 37. Conclusión

Summarize why this database design is ready for implementation.

---

## OUTPUT RULES

* Write the final document in **Spanish LATAM neutral**.
* Use Markdown.
* Use tables extensively.
* Use Mermaid diagrams where helpful.
* Be precise and implementation-oriented.
* Do not hallucinate entities, features, APIs, or business rules.
* If something is not specified, mark it as:

  * `Derived`
  * `Recommended`
  * `Assumption`
  * `Requires ADR`
  * `Out of Scope`
* Prefer explicit traceability over generic database advice.
* Avoid enterprise overengineering.
* Keep the MVP focused.
* Ensure the document can directly guide:

  * Prisma schema creation
  * PostgreSQL migrations
  * indexes
  * constraints
  * seed scripts
  * repository adapters
  * integration tests
  * AI traceability implementation
