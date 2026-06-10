# AAA Prompt — Generate Data Seed Strategy Document for EventFlow

## ACT — Role and Context

You are a Senior Product Manager, Senior Business Analyst, QA Strategist, Data Modeling Analyst, Demo Planning Specialist, and AI-assisted Software Documentation Architect.

You are working on **EventFlow**, an AI-assisted event planning and vendor management platform.

EventFlow helps event organizers create structured event plans, generate AI-assisted checklists, manage budgets, discover vendors, request quotes, compare vendor responses, create simulated booking intent, manage reviews, and track event progress.

The MVP must be built as an:

```text
AI-assisted event planning workspace + simplified vendor quote flow
````

It must **not** become a full transactional marketplace in v1.

You must generate a formal **Data Seed Strategy Document** based on the existing updated project documentation located in:

```text
/docs/1-Domain-Discovery-Report.md
/docs/2-Product-Owner-Decisions.md
/docs/3-MVP-Scope-Definition.md
/docs/4-Business-Rules-Document.md
/docs/5-User-Roles-Permissions-Matrix.md
/docs/6-Domain-Data-Model.md
/docs/7-AI-Features-Specification.md
/docs/8-Use-Cases-Specification.md
/docs/8.1-Product-Owner-Decisions-Use-Cases-Addendum.md
/docs/8.2-Documentation-Alignment-Review-Before-FRD.md
/docs/9-Functional-Requirements-Document.md
/docs/10-Non-Functional-Requirements.md
```

These documents are the source of truth.

Your job is **not** to invent unrelated demo data, fake product scope, or unnecessary entities.

Your job is to:

1. Read the existing updated documents.
2. Extract the seed/demo data requirements already defined, implied, or required by the MVP.
3. Define a realistic seed data strategy that supports demo, QA, development, and academic evaluation.
4. Map seed data to roles, use cases, FRD requirements, NFRs, business rules, entities, AI features, and demo scenarios.
5. Define seed scenarios that make EventFlow look alive and ready for presentation.
6. Ensure seed data supports organizer, vendor, admin, AI, quote, review, moderation, notification, and localization flows.
7. Validate that seed data does not introduce out-of-scope features.
8. Generate a clean, formal, traceable, and implementation-ready seed strategy.

---

## AIM — Objective

Generate a complete **Data Seed Strategy Document** for EventFlow.

The document must define:

* What data must be seeded.
* Why that data is needed.
* Which MVP flows each dataset supports.
* Which roles and users must exist for demo.
* Which event types must exist.
* Which service categories must exist.
* Which vendor profiles must exist.
* Which events must exist.
* Which event states must be represented.
* Which tasks, budgets, quotes, booking intents, reviews, notifications, AI recommendations, and admin actions must be preloaded.
* How data should support QA and demo scenarios.
* How seed data should be reset or regenerated.
* What data must not be seeded because it is out of scope.
* How seed data relates to the FRD, NFR, Use Cases, Data Model, and AI Features.

The document must be useful for:

* Product Owner
* Development team
* QA team
* Demo presenter
* Academic reviewers
* AI agents generating tasks
* AI agents generating test cases
* AI agents generating user stories
* Seed script implementation
* Local development setup
* Staging/demo environment setup

The strategy must remain realistic for a Master’s final project and MVP implementation.

---

## ACTION — Instructions

Read and analyze the following source documents:

```text
/docs/1-Domain-Discovery-Report.md
/docs/2-Product-Owner-Decisions.md
/docs/3-MVP-Scope-Definition.md
/docs/4-Business-Rules-Document.md
/docs/5-User-Roles-Permissions-Matrix.md
/docs/6-Domain-Data-Model.md
/docs/7-AI-Features-Specification.md
/docs/8-Use-Cases-Specification.md
/docs/8.1-Product-Owner-Decisions-Use-Cases-Addendum.md
/docs/8.2-Documentation-Alignment-Review-Before-FRD.md
/docs/9-Functional-Requirements-Document.md
/docs/10-Non-Functional-Requirements.md
```

Then generate the document:

```text
/docs/11-Data-Seed-Strategy.md
```

The output must be written in **Spanish LATAM**.

Use a professional Product Manager / Business Analyst / QA Strategist tone.

Use clear tables, dataset definitions, demo scenarios, validation rules, and traceability references.

---

## CRITICAL SEED STRATEGY EXTRACTION RULE

Do **not** create seed data from generic marketplace, generic SaaS, generic event planning, or generic fake data assumptions.

First, perform a **seed data extraction pass** over the source documents.

Extract seed data needs from:

* Product Owner Decisions
* MVP Scope Definition
* Business Rules Document
* User Roles & Permissions Matrix
* Domain Data Model
* AI Features Specification
* Use Cases Specification
* Product Owner Decisions Use Cases Addendum
* Documentation Alignment Review Before FRD
* Functional Requirements Document
* Non-Functional Requirements Document

A seed dataset can only be included as **MVP seed data** if it is supported by one or more source documents or is directly required to make the MVP testable, demonstrable, and academically evaluable.

If a seed dataset is directly stated in the documents, mark it as **Explicit**.

If a seed dataset is logically required by an existing FR, NFR, BR, UC, role, permission, entity, AI feature, or demo requirement, mark it as **Derived**.

If a seed dataset is useful but not clearly supported, mark it as **Recommended** and do not treat it as mandatory unless justified.

If a seed dataset belongs to future scope, mark it as **Future**.

If a seed dataset supports an out-of-scope feature, mark it as **Out of Scope**.

If a seed dataset needs Product Owner clarification, mark it as:

```text
Requires Product Owner Decision
```

The seed strategy creation process must follow this order:

```text
Read → Extract → Classify → Validate Scope → Define Seed Strategy → Trace
```

Do not follow this order:

```text
Invent demo data → Force it into the model → Add justification later
```

---

## Seed Data Source Classification

Use these source type values:

```text
Explicit / Derived / Assumption / Recommended
```

Definitions:

* **Explicit:** Directly stated in source documents.
* **Derived:** Logically required by an existing FR, NFR, BR, UC, role, permission, entity, AI feature, demo scenario, or MVP decision.
* **Assumption:** Needed to make the seed data coherent, but not clearly specified.
* **Recommended:** Suggested as a best practice for demo, QA, or development, but optional.

Use these scope values:

```text
MVP / Future / Out of Scope / Requires Product Owner Decision
```

Use these priority values:

```text
Must Have / Should Have / Could Have / Future / Out of Scope
```

---

## Seed Dataset ID Format

Use this ID format:

```text
SEED-[DOMAIN]-[NUMBER]
```

Examples:

```text
SEED-USER-001
SEED-ROLE-001
SEED-EVENTTYPE-001
SEED-CATEGORY-001
SEED-VENDOR-001
SEED-EVENT-001
SEED-TASK-001
SEED-BUDGET-001
SEED-QUOTE-001
SEED-BOOKING-001
SEED-REVIEW-001
SEED-NOTIF-001
SEED-AI-001
SEED-ADMIN-001
SEED-I18N-001
SEED-DEMO-001
SEED-QA-001
SEED-OOS-001
```

Use these domain prefixes:

| Prefix         | Domain                                     |
| -------------- | ------------------------------------------ |
| SEED-USER      | Users and roles                            |
| SEED-EVENTTYPE | Event types                                |
| SEED-CATEGORY  | Service categories                         |
| SEED-VENDOR    | Vendor profiles and services               |
| SEED-EVENT     | Events                                     |
| SEED-TASK      | Event tasks and checklist                  |
| SEED-BUDGET    | Budgets and budget items                   |
| SEED-QUOTE     | Quote requests and quotes                  |
| SEED-BOOKING   | Booking intent                             |
| SEED-REVIEW    | Reviews and moderation                     |
| SEED-NOTIF     | Notifications                              |
| SEED-AI        | AI recommendations and MockAIProvider data |
| SEED-ADMIN     | Admin actions and governance               |
| SEED-I18N      | Languages and currency examples            |
| SEED-DEMO      | Demo scenarios                             |
| SEED-QA        | QA validation datasets                     |
| SEED-OOS       | Out-of-scope seed data                     |

---

## Required Output Structure

Generate the document using this exact structure:

```markdown
# EventFlow — Data Seed Strategy

## 1. Propósito del documento

## 2. Alcance del documento

## 3. Fuentes utilizadas

## 4. Principios de seed data para el MVP

## 5. Metodología de extracción de seed data

## 6. Seed Data Extraction from Source Documents

## 7. Resumen ejecutivo de la estrategia seed

## 8. Objetivos de la estrategia seed

## 9. Ambientes que usarán seed data

## 10. Datasets incluidos en el MVP

## 11. Datasets futuros o fuera de alcance

## 12. Usuarios y roles demo

## 13. EventTypes seed

## 14. ServiceCategories seed

## 15. VendorProfiles y VendorServices seed

## 16. VendorPortfolio y Attachments seed

## 17. Events seed

## 18. EventTasks y checklist seed

## 19. Budgets y BudgetItems seed

## 20. QuoteRequests y Quotes seed

## 21. BookingIntent seed

## 22. Reviews y moderación seed

## 23. Notifications seed

## 24. AIRecommendations y MockAIProvider seed

## 25. AdminActions y governance seed

## 26. Idiomas, monedas y localización seed

## 27. Demo scenarios soportados por seed data

## 28. QA scenarios soportados por seed data

## 29. Estrategia de reset y regeneración de datos

## 30. Convenciones de nombres y datos demo

## 31. Seguridad, privacidad y datos sensibles en seed

## 32. Datos explícitamente fuera de alcance

## 33. Matriz consolidada de seed data

## 34. Matriz de trazabilidad seed → FRD / NFR / UC / Entidades

## 35. Riesgos de seed data y mitigaciones

## 36. Supuestos, restricciones y dependencias

## 37. Preguntas abiertas o decisiones pendientes

## 38. Checklist de readiness de seed data

## 39. Resumen final
```

---

## Seed Data Extraction Method

Before defining the final strategy, create a section called:

```markdown
## Seed Data Extraction from Source Documents
```

Use this table format:

| Candidate Seed Dataset | Domain | Found in source document | Evidence / context | Classification | MVP decision |
| ---------------------- | ------ | ------------------------ | ------------------ | -------------- | ------------ |

Where:

* **Candidate Seed Dataset** is the dataset identified from the documents.
* **Domain** is the seed domain.
* **Found in source document** references which document supports it.
* **Evidence / context** explains why the dataset is needed.
* **Classification** must be Explicit / Derived / Assumption / Recommended.
* **MVP decision** must be MVP / Future / Out of Scope / Requires Product Owner Decision.

Only after this extraction table, define the final MVP seed strategy.

---

## Seed Dataset Definition Format

For each dataset, use this format:

```markdown
### SEED-[DOMAIN]-[NUMBER] — Dataset Name

#### Propósito
Explain why this dataset is needed.

#### Clasificación
- Scope: MVP / Future / Out of Scope / Requires Product Owner Decision
- Priority: Must Have / Should Have / Could Have / Future / Out of Scope
- Source type: Explicit / Derived / Assumption / Recommended

#### Entidades involucradas
List related entities from the data model.

#### Flujos soportados
List related use cases, demo flows, or QA scenarios.

#### Cantidad recomendada

| Item | Quantity | Notes |
|---|---:|---|

#### Campos mínimos

| Field | Example value | Notes |
|---|---|---|

#### Estados requeridos
List statuses that must be represented.

#### Reglas de negocio relacionadas
Reference related business rules.

#### Consideraciones QA
Explain how QA can use this dataset.

#### Consideraciones demo
Explain how this dataset helps the final demo.

#### Notas de implementación
Provide practical implementation notes without writing actual seed code.
```

---

## Mandatory Product Decisions to Reflect

The seed strategy must reflect the following Product Owner and MVP decisions:

### Market and localization

* Primary market: Guatemala.
* Future vision: Spain and LATAM.
* MVP supports Spanish LATAM neutral, Spanish Spain, Portuguese, and English.
* English is mandatory.
* Event currency must be selected during event creation.
* Event currency cannot be changed after creation.
* User chooses local currency or USD during event creation.
* Currency conversion is out of scope.

### Platform and scope

* MVP is web responsive only.
* No native mobile app in v1.
* No WhatsApp integration in MVP.
* No real payments.
* No real commissions.
* No legal contracts.
* No invoices or tax handling.
* No full transactional marketplace.

### Users and demo

* Product Owner is admin in the demo.
* Demo should include 5 to 10 organizer users.
* Mostly seed data will be used.
* Real providers are optional and not required.
* Seed data should support created, active, advanced, completed, and cancelled scenarios where applicable.

### Event types

The MVP event types are:

* Bodas
* XV años
* Bautizos
* Baby showers
* Cumpleaños
* Eventos corporativos

### Vendor and portfolio

* Vendor portfolio can support up to 10 images per event/work shown.
* Vendor category changes are limited to 5 times.
* Substantive category changes may require admin review.
* Vendor response to reviews is future scope.

### Quotes and booking intent

* Quote default validity is 15 calendar days if no validity date is specified.
* Maximum 5 active QuoteRequests per service category per event.
* Provider is notified in platform when quote is rejected or expired.
* BookingIntent is simulated.
* Confirmed BookingIntent can be cancelled in MVP.
* No platform financial penalty applies; penalties depend on external agreement with vendor.

### Reviews and moderation

* Review rating scale is 1 to 5.
* Rating 5 is highest.
* Rating 1 is lowest.
* Deleted/removed reviews must be audited.
* Recommended behavior is soft delete or hidden status.
* AI sentiment analysis is out of scope.
* AI moderation of reviews is out of scope.

### AI

* OpenAIProvider is primary functional MVP provider.
* MockAIProvider is required for testing/demo.
* AnthropicProvider is future or optional stub, not required as functional MVP implementation.
* AI timeout is 1 minute.
* AI outputs require human validation.
* AI outputs must not become official data without user confirmation.

### Admin

* Admin can list events and see general status for demo/support/governance.
* Admin cannot edit organizer-owned events in MVP.
* Admin can manage EventTypes in a controlled way.
* Admin cannot hard delete EventType if associated with events.
* Admin can manage service category hierarchy up to 2 levels.
* Admin dashboard metrics focus on activity, governance, AI usage, quotes, and demo readiness.
* Admin actions should be auditable where relevant.

---

## Recommended Dataset Volumes

Use source documents as primary truth.

If exact volumes are not fully defined, use the following as recommended MVP seed ranges and mark them as **Recommended**:

| Dataset                        |          Recommended quantity |
| ------------------------------ | ----------------------------: |
| Admin users                    |                             1 |
| Organizer users                |                          5–10 |
| Vendor users                   |                         10–20 |
| EventTypes                     |                             6 |
| ServiceCategories              |                         10–15 |
| Approved VendorProfiles        |                          8–12 |
| Pending VendorProfiles         |                           2–4 |
| Rejected/hidden VendorProfiles |                           1–2 |
| VendorServices                 |                         20–40 |
| Vendor portfolio images        | Up to 10 per event/work shown |
| Events                         |                         10–15 |
| Draft events                   |                           2–3 |
| Active/planning events         |                           4–5 |
| Completed events               |                           2–3 |
| Cancelled events               |                           1–2 |
| EventTasks                     |                        50–100 |
| Budgets                        |                         10–15 |
| BudgetItems                    |                         40–80 |
| QuoteRequests                  |                         15–25 |
| Quotes                         |                         10–20 |
| BookingIntents                 |                           5–8 |
| Reviews                        |                         20–40 |
| Notifications                  |                         15–30 |
| AIRecommendations              |                         10–20 |
| AdminActions                   |                          5–10 |

Do not make these volumes mandatory if source documents define different values. If there is a conflict, preserve source document decisions and explain the conflict.

---

## Users and Roles Seed Requirements

Define seed users for:

* Admin
* Organizers
* Vendors

For each user type, define:

| Seed User Type | Quantity | Purpose | Required status | Notes |
| -------------- | -------: | ------- | --------------- | ----- |

Include demo account recommendations such as:

* One admin account for Product Owner.
* Multiple organizer accounts with different event states.
* Multiple vendor accounts with approved, pending, rejected, and hidden statuses.

Do not include real personal data.

Use fictional names, fictional businesses, and safe demo emails.

Recommended email pattern:

```text
admin@eventflow.demo
organizer01@eventflow.demo
vendor01@eventflow.demo
```

Do not include real passwords in the document. Use placeholder guidance such as:

```text
Password should be configured securely in seed script or environment setup.
```

---

## EventTypes Seed Requirements

The seed must include the six MVP event types:

| EventType            | Code suggestion | Notes |
| -------------------- | --------------- | ----- |
| Bodas                | wedding         | MVP   |
| XV años              | quinceanera     | MVP   |
| Bautizos             | baptism         | MVP   |
| Baby showers         | baby_shower     | MVP   |
| Cumpleaños           | birthday        | MVP   |
| Eventos corporativos | corporate       | MVP   |

For each EventType, define:

* Name.
* Code.
* Description.
* Active status.
* Suggested default vendor categories.
* Suggested AI template key if supported by the AI spec.

---

## ServiceCategories Seed Requirements

Define seed categories and simple hierarchy up to 2 levels.

Categories should support vendor discovery, quote requests, budget items, and AI recommendations.

Include categories such as, only if supported by source documents:

* Catering
* Fotografía
* Video
* Decoración
* Música / DJ
* Venue / Salón
* Mobiliario
* Flores
* Pasteles y postres
* Maquillaje y peinado
* Entretenimiento
* Transporte
* Event planner

For hierarchy:

* Maximum 2 levels.
* No deep hierarchy.
* Use parent category and optional child category if supported by data model.

Example:

```text
Música
  └── DJ
  └── Marimba
  └── Mariachi

Decoración
  └── Flores
  └── Mobiliario
```

---

## Vendor Seed Requirements

Define seed vendors to support:

* Directory browsing.
* Vendor profile detail.
* Vendor approval flow.
* Quote request flow.
* Vendor service categories.
* Reviews.
* Portfolio display.
* Admin moderation.

Vendor states to include:

* Approved.
* Pending approval.
* Rejected.
* Hidden, if supported.

For each vendor profile, define:

| Vendor seed type | Quantity | Status | Purpose |
| ---------------- | -------: | ------ | ------- |

Include:

* Business name.
* Vendor user.
* Service categories.
* City/country.
* Description.
* Contact placeholders.
* Portfolio images if applicable.
* Services/packages.
* Rating/reviews.
* Approval status.

Do not use real provider data unless explicitly available and approved.

---

## Vendor Portfolio and Attachment Seed Requirements

Define seed strategy for vendor portfolio and attachments.

Must reflect:

* Up to 10 images per event/work shown.
* Attachments use soft delete metadata.
* Physical deletion may happen later.
* Portfolio should demonstrate premium/aspirational brand direction.
* Seed images may be placeholders or static demo references.

Define:

| Portfolio scenario | Quantity | Purpose |
| ------------------ | -------: | ------- |

Examples:

* Approved vendor with complete portfolio.
* Approved vendor with minimal portfolio.
* Vendor with hidden/deleted attachment.
* Vendor with portfolio near image limit.

Do not require actual image files unless the project has assets available.

If no image files exist, define placeholders and implementation notes.

---

## Events Seed Requirements

Define seed events to support:

* Organizer dashboard.
* Event creation and editing.
* AI planning.
* Checklist.
* Budget.
* Vendor discovery.
* Quote requests.
* Quote comparison.
* Booking intent.
* Reviews.
* Event auto-completion.
* Admin event listing.

Event states to represent:

* Draft.
* Active/planning.
* Quoting.
* Completed.
* Cancelled.
* Past event waiting for auto-completion, if useful.

Must reflect:

* Event auto-completes 2 days after event date.
* Event currency is selected at creation and immutable.
* Event currency should be local currency or USD.
* Events must belong to organizers.
* Events should cover the six MVP event types.

For each event scenario, define:

| Scenario | Event type | Status | Currency | Purpose |
| -------- | ---------- | ------ | -------- | ------- |

---

## EventTasks and Checklist Seed Requirements

Define seed tasks to support:

* Manual tasks.
* AI-generated tasks.
* Confirmed AI tasks.
* Pending tasks.
* In-progress tasks.
* Completed tasks.
* Event progress dashboard.
* QA validation of task state transitions.

Task sources to represent:

* Manual.
* AI.
* Template, if supported.

Task statuses to represent:

* Pending.
* In progress.
* Completed.
* Cancelled or skipped, if supported.

Include tasks for each main event type where useful.

---

## Budget and BudgetItem Seed Requirements

Define budget seed data to support:

* Budget dashboard.
* Budget items by service category.
* Budget planned amount.
* Committed amount.
* Warnings.
* Quote comparison.
* Currency display.
* Currency immutability.

Must reflect:

* Currency cannot change after event creation.
* Currency conversion is out of scope.
* Budgets should use event currency.
* Budget items should align to service categories.

Include scenarios:

* Budget under control.
* Budget near limit.
* Budget exceeded warning.
* Budget with quote committed amount.

---

## QuoteRequest and Quote Seed Requirements

Define seed data to support:

* Organizer sends quote request.
* Vendor sees assigned quote request.
* Vendor responds.
* Organizer sees quote responses.
* Quote comparison.
* Quote expiration.
* Quote rejection.
* Provider notification when rejected or expired.
* QuoteRequest active limit.

Must reflect:

* Default quote validity = 15 calendar days.
* Maximum 5 active QuoteRequests per service category per event.
* Quote expiration/rejection changes platform status.
* Email notification only when email functionality exists.
* Quote flow does not create payment or legal contract.

QuoteRequest statuses should represent:

* Sent.
* Viewed.
* Responded.
* Cancelled.
* Expired.
* Rejected, if supported.

Quote statuses should represent:

* Submitted.
* Preferred.
* Accepted, if supported by booking intent flow.
* Rejected.
* Expired.

Define scenario table:

| Scenario | QuoteRequest status | Quote status | Purpose |
| -------- | ------------------- | ------------ | ------- |

---

## BookingIntent Seed Requirements

Define seed data to support simulated booking intent.

Must reflect:

* BookingIntent is simulated.
* Confirmed BookingIntent can be cancelled.
* No platform payment.
* No platform penalty.
* Penalties depend on external agreement with vendor.
* BookingIntent does not represent legal contract.

BookingIntent states should include:

* Created.
* Confirmed intent, if supported.
* Cancelled.

Include:

| Scenario | Status | Purpose |
| -------- | ------ | ------- |

---

## Reviews and Moderation Seed Requirements

Define seed reviews to support:

* Public reviews.
* Vendor profile rating.
* Admin moderation.
* Soft delete / hidden status.
* Audit of deleted/hidden reviews.
* Rating scale 1 to 5.

Must reflect:

* 5 is highest.
* 1 is lowest.
* Vendor response to reviews is future scope.
* AI sentiment analysis is out of scope.
* AI moderation is out of scope.

Review statuses should represent:

* Published.
* Hidden.
* Removed, if supported.
* Pending, only if supported by source documents.

Seed review scenarios:

* Positive review.
* Neutral review.
* Low rating review.
* Hidden/offensive review.
* Removed review with audit trail.

---

## Notifications Seed Requirements

Define notification seed data to support:

* In-app notifications.
* Quote rejected/expired notification to vendor.
* Quote request received.
* Quote response received.
* Booking intent created/cancelled.
* Review moderation result if supported.
* AI generation completed or failed if supported.

Must reflect:

* Email notification applies only when email functionality exists.
* WhatsApp notification is out of scope.
* Notifications may be simulated or in-app.

Notification states:

* Unread.
* Read.
* Archived, if supported.

---

## AIRecommendations and MockAIProvider Seed Requirements

Define AI seed data to support:

* AI event plan generation.
* AI checklist generation.
* AI budget suggestion.
* AI vendor category recommendations.
* AI quote brief.
* AI quote comparison.
* AI timeout/fallback behavior.
* MockAIProvider deterministic responses.
* Human validation flow.

Must reflect:

* OpenAIProvider is primary functional MVP provider.
* MockAIProvider is required for testing/demo.
* AnthropicProvider is future or optional stub.
* AI timeout is 1 minute.
* AI outputs must be accepted by user before becoming official data.

Seed scenarios:

* Accepted AI plan.
* Edited AI checklist.
* Rejected AI recommendation.
* AI quote comparison generated.
* MockAIProvider deterministic response.
* Timeout/fallback scenario if useful.

---

## AdminActions and Governance Seed Requirements

Define seed data to support admin governance.

AdminActions should support audit of:

* Vendor approval.
* Vendor rejection.
* Vendor hidden status.
* Review hidden/removed.
* EventType changes.
* ServiceCategory changes.
* Attachment soft delete if applicable.

Must reflect:

* Admin can list events but not edit organizer-owned events.
* Admin dashboard metrics focus on activity, governance, AI usage, quotes, and demo readiness.
* Admin can manage EventTypes in controlled way.
* Admin cannot hard delete EventType if associated with events.
* Admin can manage service category hierarchy up to 2 levels.

---

## Language, Currency, and Localization Seed Requirements

Define seed examples for:

* Spanish LATAM neutral.
* Spanish Spain.
* Portuguese.
* English.

Must include English because it is mandatory.

Define events using:

* Local currency.
* USD.

Recommended currencies:

* GTQ for Guatemala.
* USD for demo/international.
* EUR for Spain future/demo scenario if supported.
* MXN/COP only if needed for future LATAM demonstration.

Do not implement currency conversion.

---

## Demo Scenario Requirements

The seed strategy must support these demo scenarios if supported by FRD and use cases:

### Demo Scenario 1 — Organizer creates event with AI assistance

Seed support needed:

* Organizer account.
* EventTypes.
* Service categories.
* MockAIProvider or AI templates.
* AIRecommendations.
* Empty/new event option.

### Demo Scenario 2 — Organizer requests and compares quotes

Seed support needed:

* Active event.
* Approved vendors.
* Vendor services.
* QuoteRequests.
* Quotes.
* Quote comparison AI data.
* BookingIntent option.

### Demo Scenario 3 — Vendor responds to quote request

Seed support needed:

* Vendor account.
* Assigned QuoteRequests.
* Vendor services.
* Quote response scenarios.

### Demo Scenario 4 — Admin governs platform

Seed support needed:

* Admin account.
* Pending vendors.
* Reviews to moderate.
* Categories.
* EventTypes.
* AdminActions.

### Demo Scenario 5 — Multi-language and currency behavior

Seed support needed:

* Language preferences.
* Events in local currency and USD.
* AI output examples in supported languages.
* UI/content samples if applicable.

---

## QA Scenario Requirements

The seed strategy must support QA validation for:

* Login by role.
* Organizer ownership rules.
* Vendor quote visibility rules.
* Admin governance permissions.
* Event currency immutability.
* Quote validity default.
* QuoteRequest active limit.
* Event auto-completion after 2 days.
* BookingIntent cancellation.
* Review rating range 1–5.
* Review soft delete/audit.
* Attachment soft delete.
* Vendor category change limit.
* Service category hierarchy max 2 levels.
* AI timeout/fallback.
* MockAIProvider deterministic outputs.
* Multi-language output.
* Currency display.
* Out-of-scope feature absence.

---

## Reset and Regeneration Strategy

Define how seed data should be reset or regenerated.

Include recommendations for:

* Idempotent seed script.
* Safe reset for local/dev/demo.
* Avoiding real personal data.
* Deterministic demo data.
* Stable demo accounts.
* Repeatable QA scenarios.
* Optional environment flag for seed mode.
* MockAIProvider deterministic responses.
* Avoiding destructive reset in production.

Recommended commands can be described conceptually, for example:

```text
seed:reset
seed:demo
seed:qa
```

Do not implement code unless explicitly requested.

---

## Data Privacy and Safety Requirements

Seed data must:

* Use fictional users.
* Use fictional businesses.
* Use demo email domains.
* Avoid real phone numbers.
* Avoid real addresses unless generic city/country only.
* Avoid sensitive personal information.
* Avoid real payment data.
* Avoid real contracts.
* Avoid real tax/invoice data.
* Avoid real provider data unless explicitly approved.
* Avoid offensive content in hidden reviews; describe moderation scenario safely without using harmful text.
* Avoid sending unnecessary seed PII to AI prompts.

---

## Out-of-Scope Seed Data

Explicitly exclude seed data for:

* Real payments.
* Payment cards.
* Invoices.
* Tax documents.
* Real commissions.
* Legal contracts.
* WhatsApp messages.
* Real-time chat messages.
* Native mobile devices.
* Push notification tokens.
* Calendar integrations.
* Guest lists.
* RSVP.
* Seating plans.
* Advanced geolocation routes.
* AI moderation results.
* AI sentiment analysis results.
* Automated vendor verification.
* KYC data.
* Real personal data.

These may appear only under future or out-of-scope seed notes.

---

## Traceability Requirements

The seed strategy must include a traceability matrix.

Use this table:

| Seed Dataset ID | Related FRD requirement | Related NFR | Related use case | Related business rule | Related entity | Related AI feature |
| --------------- | ----------------------- | ----------- | ---------------- | --------------------- | -------------- | ------------------ |

The matrix should connect seed datasets to:

* FRD requirements from `/docs/9-Functional-Requirements-Document.md`
* NFRs from `/docs/10-Non-Functional-Requirements.md`
* Use cases from `/docs/8-Use-Cases-Specification.md`
* Business rules from `/docs/4-Business-Rules-Document.md`
* Entities from `/docs/6-Domain-Data-Model.md`
* AI features from `/docs/7-AI-Features-Specification.md`

If exact IDs exist in the source documents, use them.

If exact IDs do not exist, use names and mark as Derived.

---

## Risk Requirements

Include risks related to seed data.

Use this table:

| Risk ID | Risk | Impact | Probability | Mitigation | Related dataset |
| ------- | ---- | ------ | ----------- | ---------- | --------------- |

Use:

```text
Impact: Low / Medium / High
Probability: Low / Medium / High
```

Consider risks such as:

* Demo data too small.
* Demo data too large.
* Inconsistent seed states.
* Seed script not idempotent.
* Real personal data accidentally included.
* AI demo unstable without MockAIProvider.
* Quote flow not demonstrable.
* Admin flow not demonstrable.
* Translation data incomplete.
* Currency scenarios missing.
* Seed data contradicts business rules.
* Out-of-scope features accidentally seeded.

---

## Readiness Checklist Requirements

Include a final readiness checklist.

Use this format:

```markdown
## Checklist de readiness de seed data

- [ ] Admin demo user exists.
- [ ] Organizer demo users exist.
- [ ] Vendor demo users exist.
- [ ] EventTypes seed include all MVP event types.
- [ ] ServiceCategories seed support quote and vendor flows.
- [ ] Vendor profiles include approved, pending, rejected/hidden examples.
- [ ] Vendor portfolio examples respect 10-image limit.
- [ ] Events exist in multiple states.
- [ ] Event currency scenarios are represented.
- [ ] EventTasks support progress demo.
- [ ] Budgets and BudgetItems support currency and warning scenarios.
- [ ] QuoteRequests and Quotes support quote comparison demo.
- [ ] Quote validity and expiration scenarios exist.
- [ ] BookingIntent simulated scenarios exist.
- [ ] Reviews include rating 1–5.
- [ ] Review moderation and audit scenarios exist.
- [ ] Notifications support quote and admin scenarios.
- [ ] AIRecommendations or MockAIProvider outputs support AI demo.
- [ ] AdminActions support governance demo.
- [ ] Multi-language examples exist.
- [ ] Out-of-scope data is not seeded.
- [ ] Seed reset strategy is documented.
```

Adjust checklist based on source documents.

---

## Mandatory Scope Guardrails

While generating the seed strategy, preserve the EventFlow MVP boundaries.

Do not add seed data for any of the following as MVP:

* Real payment data.
* Payment processing.
* Payment cards.
* Real commissions.
* Commission calculation.
* Invoices.
* Tax documents.
* Legal contracts.
* Contract signing.
* WhatsApp messages.
* WhatsApp notifications.
* Native mobile devices.
* Native push tokens.
* Real-time chat messages.
* Full messaging module.
* Automated vendor verification.
* KYC data.
* AI sentiment analysis.
* AI moderation results.
* AI autonomous vendor approval.
* AI autonomous booking.
* AI autonomous payment.
* Full transactional marketplace behavior.
* Advanced geolocation routes.
* External calendar integration data.
* Multi-user event collaboration.
* Co-organizer data.
* Guest list data.
* RSVP data.
* Seating plan data.
* Currency conversion rates.

These may appear only as:

* Future seed data.
* Out-of-scope seed data.
* Roadmap notes.
* Risk/constraint notes.
* Product Owner decision needed.

If unclear, classify as:

```text
Requires Product Owner Decision
```

---

## Quality Requirements

The Data Seed Strategy must:

* Be written in Spanish LATAM.
* Be formal and structured.
* Be consistent with all source documents.
* Start from source-document extraction, not generic assumptions.
* Reflect the latest Product Owner decisions from document `8.1`.
* Align with the FRD and NFR.
* Avoid contradictory seed data.
* Clearly separate MVP, Future, Out of Scope, and Requires Product Owner Decision items.
* Clearly identify assumptions and recommendations.
* Be useful for development, QA, demo, user stories, technical tasks, and academic evaluation.
* Avoid overengineering.
* Avoid turning EventFlow into a full marketplace.
* Avoid adding seed data for payments, contracts, commissions, WhatsApp, native mobile app, real-time chat, AI moderation, autonomous AI decisions, external calendar integration, or currency conversion into MVP.
* Include seed dataset IDs.
* Include traceability.
* Include demo scenarios.
* Include QA scenarios.
* Include reset/regeneration strategy.
* Include readiness checklist.

---

## Final Validation Before Output

Before finalizing the document, verify:

1. Seed datasets were extracted from source documents.
2. Every MVP seed dataset has evidence, rationale, or classification.
3. Seed data supports the FRD.
4. Seed data supports the NFR.
5. Seed data supports Use Cases.
6. Seed data supports demo scenarios.
7. Seed data supports QA scenarios.
8. Seed data supports Organizer, Vendor, and Admin roles.
9. Seed data supports AI demo through AIRecommendations or MockAIProvider.
10. Seed data supports quote flow and booking intent.
11. Seed data supports reviews and moderation.
12. Seed data supports event states.
13. Seed data supports EventTypes and ServiceCategories.
14. Seed data supports language and currency.
15. Seed data respects rating scale 1–5.
16. Seed data respects vendor portfolio image limit.
17. Seed data respects QuoteRequest active limit.
18. Seed data respects quote validity.
19. Seed data respects no real payment / no commission / no contract scope.
20. Seed data avoids real personal data.
21. Seed data excludes WhatsApp, native mobile, real-time chat, AI moderation, external calendar integration, and currency conversion.
22. Future, out-of-scope, and requires-decision seed data are clearly separated.
23. The strategy is practical and not overengineered.

---

## Final Instruction

Generate the full **EventFlow — Data Seed Strategy** now and save it as:

```text
/docs/11-Data-Seed-Strategy.md
```

