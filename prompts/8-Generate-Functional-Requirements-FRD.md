# AAA Prompt — Generate Functional Requirements Document (FRD) for EventFlow

## ACT — Role and Context

You are a Senior Product Manager, Senior Business Analyst, Functional Requirements Specialist, Software Product Strategist, and AI-assisted Documentation Architect.

You are working on **EventFlow**, an AI-assisted event planning and vendor management platform.

EventFlow helps event organizers create structured event plans, generate AI-assisted checklists, manage budgets, discover vendors, request quotes, compare vendor responses, create simulated booking intent, manage reviews, and track event progress.

The MVP must be built as an:

```text
AI-assisted event planning workspace + simplified vendor quote flow
````

It must **not** become a full transactional marketplace in v1.

You must generate a formal **Functional Requirements Document — FRD** based on the existing updated project documentation located in:

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
```

Also use the documentation alignment review as a mandatory source of truth:

```text
/docs/8.2-Documentation-Alignment-Review-Before-FRD.md
```

These documents are the source of truth.

Your job is **not** to invent new features, modules, roles, use cases, entities, AI behaviors, or business scope.

Your job is to:

1. Read the existing updated documents.
2. Extract the functional requirements already defined, implied, or required by the MVP.
3. Validate that the latest Product Owner decisions from document `8.1` are reflected.
4. Classify each requirement by module, priority, scope, and source type.
5. Connect requirements to business rules, use cases, roles, permissions, entities, AI features, and acceptance expectations.
6. Validate every requirement against the MVP restrictions, exclusions, and future-scope decisions found in the source documents.
7. Separate MVP requirements from future requirements and out-of-scope functionality.
8. Generate a clean, formal, traceable, and implementation-ready FRD.

---

## AIM — Objective

Generate a complete **Functional Requirements Document — FRD** for EventFlow.

The FRD must define what the system must do from a functional perspective.

The document must be useful for:

* Product Owner
* Business Analyst
* Development team
* QA team
* UX/UI team
* AI agents generating implementation tasks
* AI agents generating test cases
* AI agents generating user stories
* Academic reviewers
* Portfolio evaluators

The FRD must consolidate and formalize:

* MVP product scope
* User roles
* Functional modules
* Functional requirements
* AI-assisted requirements
* User flows
* Use cases
* Permissions
* Business rules
* Data dependencies
* Acceptance expectations
* Future scope
* Out-of-scope restrictions
* Traceability
* Demo requirements
* Product Owner decisions

The FRD must remain practical, testable, and aligned with the MVP.

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
```

Also read and use as a mandatory source:

```text
/docs/8.2-Documentation-Alignment-Review-Before-FRD.md
```

Then generate the document:

```text
/docs/9-Functional-Requirements-Document.md
```

The output must be written in **Spanish LATAM**.

Use a professional Product Manager / Business Analyst tone.

Use clear tables, requirement IDs, structured modules, validation notes, acceptance criteria, and traceability references.

---

## CRITICAL FRD EXTRACTION RULE

Do **not** create functional requirements from generic SaaS, generic marketplace, generic event planning, or generic AI product assumptions.

First, perform a **functional requirements extraction pass** over the source documents.

Extract requirements from:

* Domain Discovery Report
* Product Owner Decisions
* MVP Scope Definition
* Business Rules Document
* User Roles & Permissions Matrix
* Domain Data Model
* AI Features Specification
* Use Cases Specification
* Product Owner Decisions Use Cases Addendum
* Documentation Alignment Review Before FRD, if available

A functional requirement can only be included as **MVP** if it is supported by one or more source documents.

If a requirement is directly stated in the documents, mark it as **Explicit**.

If a requirement is logically required by a documented feature, rule, permission, use case, entity, AI feature, or flow, mark it as **Derived**.

If a requirement is useful but not clearly supported, mark it as **Recommended** and do not treat it as mandatory MVP unless clearly justified.

If a requirement belongs to future scope, mark it as **Future**.

If a requirement is explicitly excluded from MVP, mark it as **Out of Scope**.

If a requirement needs Product Owner clarification, mark it as:

```text
Requires Product Owner Decision
```

The FRD creation process must follow this order:

```text
Read → Extract → Classify → Validate Restrictions → Specify → Trace
```

Do not follow this order:

```text
Invent features → Write requirements → Add traceability later
```

---

## Updated Product Owner Decisions to Validate

The FRD must validate and include the latest decisions from:

```text
/docs/8.1-Product-Owner-Decisions-Use-Cases-Addendum.md
```

The FRD must reflect these decisions when supported by the updated documents:

|  # | Decision Area                       | Decision                                                                                                                                           |
| -: | ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
|  1 | Review rating scale                 | Rating scale is **1 to 5**, where 5 is the highest rating and 1 is the lowest.                                                                     |
|  2 | Vendor portfolio images             | Vendor may upload up to **10 images per event/work shown** in the portfolio section.                                                               |
|  3 | Vendor category changes             | Vendor may change/edit categories up to **5 times**. Substantive category changes may require admin review if they affect public visibility.       |
|  4 | Quote validity                      | If no validity date is specified, a Quote is valid for **15 calendar days**.                                                                       |
|  5 | BookingIntent cancellation          | Confirmed BookingIntent can be cancelled in MVP because no payments are processed in platform. Penalties depend on external agreement with vendor. |
|  6 | Automatic event completion          | Event is automatically marked as `completed` **2 days after event date**.                                                                          |
|  7 | Currency change policy              | Event currency cannot be changed after event creation. During creation, user must choose local currency or USD.                                    |
|  8 | Captcha / anti-bot                  | Captcha and anti-bot protection must be included for registration and login.                                                                       |
|  9 | AI timeout                          | AI timeout is **1 minute** before controlled error/fallback/MockAIProvider behavior.                                                               |
| 10 | Admin dashboard metrics             | Admin panel should include operational/demo metrics, not commercial revenue metrics.                                                               |
| 11 | Deleted reviews                     | Deleted reviews must be audited. Recommended behavior: soft delete / hidden status.                                                                |
| 12 | QuoteRequest active limit           | Maximum **5 active QuoteRequests per service category per event**.                                                                                 |
| 13 | Quote rejected/expired notification | Provider must be notified in platform; email notification applies when email functionality exists.                                                 |
| 14 | Vendor response to reviews          | Fully deferred to future scope. Not part of MVP.                                                                                                   |
| 15 | AnthropicProvider                   | MVP only requires provider interface prepared. OpenAIProvider functional, MockAIProvider functional, AnthropicProvider future/stub optional.       |
| 16 | Admin event visibility              | Admin may list events and see general status for demo/support/governance, but cannot edit organizer-owned events in MVP.                           |
| 17 | Admin EventType management          | Admin may manage EventTypes in a controlled way; no hard delete if EventType has associated events.                                                |
| 18 | Category hierarchy                  | Service categories may support simple hierarchy up to **2 levels**. No deep hierarchies in MVP.                                                    |
| 19 | Attachment delete policy            | Use soft delete for attachments metadata; physical deletion may happen later via maintenance/technical process.                                    |

If any updated source document contradicts these decisions, document the conflict and mark the affected requirement as:

```text
Requires Product Owner Decision
```

---

## MVP Restriction Validation

Before generating the final FRD, validate every functional requirement against the restrictions, exclusions, and future-scope decisions found in the source documents.

Do not assume that a capability is allowed in the MVP just because it is common in marketplaces, event platforms, SaaS products, or AI applications.

For every potentially large, risky, or scope-expanding feature, check whether the source documents classify it as:

* MVP
* Future
* Out of Scope
* Simulated
* Recommended
* Not defined

If a capability is not clearly supported by the source documents, do **not** include it as an MVP requirement. Instead, classify it as one of:

* Future
* Out of Scope
* Requires Product Owner Decision
* Recommended but not part of MVP

Pay special attention to capabilities commonly excluded or deferred from the EventFlow MVP, such as:

* Real payments
* Payment processing
* Real commissions
* Commission calculation
* Invoices
* Tax handling
* Legal contract generation
* Legal contract signing
* WhatsApp integration
* WhatsApp notifications
* Native mobile app flows
* Native push notifications
* Real-time chat
* Full messaging module
* Automated vendor verification
* KYC automation
* AI sentiment analysis
* AI moderation of reviews
* AI autonomous vendor approval
* AI autonomous booking
* AI autonomous payment
* Full transactional marketplace behavior
* Advanced geolocation
* Route planning
* Calendar integration with external providers such as Google Calendar, Outlook Calendar, Apple Calendar, or similar services
* Multi-user event collaboration
* Co-organizer permissions
* Guest list management
* RSVP
* Seating plan
* Complex country-specific legal compliance
* Currency conversion
* Complex tax/invoice handling

These capabilities may only appear as MVP functional requirements if they are explicitly supported by the source documents.

Otherwise, they must only appear under:

* Future requirements
* Out-of-scope section
* Roadmap section
* Risk/constraint notes
* Open questions or Product Owner decisions needed

If any source document mentions one of these items, verify whether it is marked as MVP, Future, Out of Scope, Simulated, or Not Defined.

Preserve the classification from the source documents.

The FRD must reinforce that EventFlow MVP is:

```text
AI-assisted event planning workspace + simplified vendor quote flow
```

and is **not**:

```text
Full transactional marketplace
```

---

## Functional Requirement Source Classification

Use these values:

```text
Explicit / Derived / Assumption / Recommended
```

Definitions:

* **Explicit:** Directly stated in source documents.
* **Derived:** Logically required by an existing rule, use case, role, permission, entity, or MVP feature.
* **Assumption:** Needed to make the requirement coherent, but not clearly specified.
* **Recommended:** Suggested as a best practice, but optional.

Use these scope values:

```text
MVP / Future / Out of Scope / Requires Product Owner Decision
```

Use these priority values:

```text
Must Have / Should Have / Could Have / Future / Out of Scope
```

---

## Requirement ID Format

Use this ID format:

```text
FR-[DOMAIN]-[NUMBER]
```

Examples:

```text
FR-AUTH-001
FR-USER-001
FR-EVENT-001
FR-AI-001
FR-TASK-001
FR-BUDGET-001
FR-VENDOR-001
FR-QUOTE-001
FR-BOOKING-001
FR-REVIEW-001
FR-NOTIF-001
FR-I18N-001
FR-ADMIN-001
FR-SEED-001
FR-DEMO-001
FR-FUTURE-001
FR-OOS-001
```

Use these domain prefixes:

| Prefix     | Domain                             |
| ---------- | ---------------------------------- |
| FR-AUTH    | Authentication and access          |
| FR-USER    | User profile and preferences       |
| FR-EVENT   | Event management                   |
| FR-AI      | AI-assisted features               |
| FR-TASK    | Checklist and tasks                |
| FR-BUDGET  | Budget and currency                |
| FR-VENDOR  | Vendors and vendor profiles        |
| FR-SERVICE | Services and categories            |
| FR-QUOTE   | Quote requests and quote responses |
| FR-BOOKING | Simulated booking intent           |
| FR-REVIEW  | Reviews and moderation             |
| FR-NOTIF   | Notifications                      |
| FR-I18N    | Language and localization          |
| FR-ADMIN   | Admin governance                   |
| FR-SEED    | Seed/demo data                     |
| FR-DEMO    | Demo support                       |
| FR-FUTURE  | Future functionality               |
| FR-OOS     | Out-of-scope functionality         |

---

## Required Output Structure

Generate the document using this exact structure:

```markdown
# EventFlow — Functional Requirements Document (FRD)

## 1. Propósito del documento

## 2. Alcance del documento

## 3. Fuentes utilizadas

## 4. Principios funcionales del MVP

## 5. Metodología de extracción de requerimientos

## 6. Functional Requirements Extraction from Source Documents

## 7. Validación de decisiones actualizadas del Product Owner

## 8. Resumen ejecutivo del FRD

## 9. Descripción funcional del producto

## 10. Objetivos funcionales del MVP

## 11. Roles funcionales del sistema

## 12. Módulos funcionales del MVP

## 13. Requerimientos funcionales — Autenticación y acceso

## 14. Requerimientos funcionales — Usuarios y preferencias

## 15. Requerimientos funcionales — Gestión de eventos

## 16. Requerimientos funcionales — Planificación asistida por IA

## 17. Requerimientos funcionales — Checklist y tareas

## 18. Requerimientos funcionales — Presupuesto y moneda

## 19. Requerimientos funcionales — Proveedores y perfiles

## 20. Requerimientos funcionales — Servicios y categorías

## 21. Requerimientos funcionales — Solicitudes y cotizaciones

## 22. Requerimientos funcionales — Booking intent simulado

## 23. Requerimientos funcionales — Reseñas y moderación

## 24. Requerimientos funcionales — Notificaciones

## 25. Requerimientos funcionales — Idioma e internacionalización

## 26. Requerimientos funcionales — Administración

## 27. Requerimientos funcionales — Datos seed y demo

## 28. Requerimientos funcionales de IA — Detalle consolidado

## 29. Requerimientos futuros

## 30. Funcionalidades explícitamente fuera de alcance

## 31. Reglas funcionales críticas

## 32. Validaciones funcionales principales

## 33. Matriz de trazabilidad funcional

## 34. Matriz de restricciones MVP

## 35. Criterios de aceptación funcional por módulo

## 36. Escenarios funcionales principales

## 37. Escenarios funcionales de demo

## 38. Supuestos, restricciones y dependencias

## 39. Riesgos funcionales y mitigaciones

## 40. Preguntas abiertas o decisiones pendientes

## 41. Resumen final
```

---

## Functional Requirements Extraction Method

Before defining the final FRD, create a section called:

```markdown
## Functional Requirements Extraction from Source Documents
```

Use this table format:

| Candidate Requirement | Module | Found in source document | Evidence / context | Classification | MVP decision |
| --------------------- | ------ | ------------------------ | ------------------ | -------------- | ------------ |

Where:

* **Candidate Requirement** is the requirement identified from the documents.
* **Module** is the functional area.
* **Found in source document** references which document supports it.
* **Evidence / context** explains why the requirement exists.
* **Classification** must be Explicit / Derived / Assumption / Recommended.
* **MVP decision** must be MVP / Future / Out of Scope / Requires Product Owner Decision.

Only after this extraction table, define the final MVP functional requirements.

---

## Product Owner Decision Validation Section

Create a section called:

```markdown
## Validación de decisiones actualizadas del Product Owner
```

Use this table:

| Decision ID | Product Owner decision | Reflected in FRD? | Related requirements | Notes |
| ----------- | ---------------------- | ----------------- | -------------------- | ----- |

Every decision from document `8.1` must appear in this table.

If a decision is not reflected because it belongs to Future or Out of Scope, state that clearly.

---

## Functional Requirement Table Format

For every functional requirement, use this table format:

| Requirement ID | Requirement | Module | Primary role | Priority | Scope | Source type | Related use case | Validation notes |
| -------------- | ----------- | ------ | ------------ | -------- | ----- | ----------- | ---------------- | ---------------- |

Each requirement must be:

* Clear
* Atomic
* Testable
* Traceable
* Consistent with source documents
* Aligned to MVP scope

Write requirements using language such as:

```text
El sistema debe permitir...
El sistema debe validar...
El sistema debe mostrar...
El sistema debe registrar...
El sistema debe impedir...
El sistema debe generar...
```

Avoid vague language such as:

```text
El sistema debería ser bueno...
La plataforma debe ser moderna...
El usuario debe tener una mejor experiencia...
```

---

## Functional Modules to Extract

The FRD should organize requirements by modules that are supported by the documents.

Possible modules include, only if supported:

### Authentication and Access

Examples of requirement areas to extract:

* User registration
* Login
* Logout
* Role-based access
* Route access
* Unauthorized access prevention
* Captcha and anti-bot for registration/login

### User Profile and Preferences

Examples:

* View own profile
* Edit own profile
* Preferred language
* User status

### Event Management

Examples:

* Create event
* Edit own event
* View own event dashboard
* Event ownership
* Event type
* Event status
* Event city/country
* Event date
* Estimated guests
* Event currency
* Event language
* Event auto-completion 2 days after event date
* Event currency immutability after creation
* Admin read-only event listing for governance/demo/support

### AI-assisted Planning

Examples:

* Generate event plan
* Generate checklist
* Suggest budget
* Recommend vendor categories
* Generate quote brief
* Compare quotes
* Require human validation
* Store AIRecommendation or equivalent
* Support provider abstraction
* Support OpenAIProvider
* Support MockAIProvider
* AnthropicProvider as future/stub optional
* AI timeout after 1 minute

### Checklist and Tasks

Examples:

* View checklist
* Create task
* Edit task
* Change task status
* Confirm AI-generated tasks
* Track event progress from tasks

### Budget and Currency

Examples:

* Create/view event budget
* Edit budget
* Manage budget items
* Display currency
* Warn if committed amount exceeds planned amount
* Currency selected during event creation
* User chooses local currency or USD
* Currency cannot be changed after event creation
* Avoid currency conversion unless explicitly supported

### Vendors and Profiles

Examples:

* View approved vendors
* Filter vendor directory
* View vendor profile
* Create vendor profile
* Edit own vendor profile
* Submit vendor profile for approval
* Admin approval required
* Vendor category changes up to 5 times
* Category changes may require admin review
* Vendor portfolio with up to 10 images per event/work shown
* Vendor response to reviews as future scope

### Services and Categories

Examples:

* View service categories
* Manage service categories as admin
* Vendor services
* Assign services to categories
* Service category hierarchy up to 2 levels
* No deep hierarchies in MVP

### Quote Requests and Quote Responses

Examples:

* Create quote request
* Generate quote brief
* Send quote request
* Vendor views assigned requests
* Vendor responds to quote request
* Organizer views quote responses
* Compare quotes
* Mark preferred quote if supported
* Default quote validity = 15 calendar days
* Maximum 5 active QuoteRequests per service category per event
* Provider notified when quote is rejected or expired

### Booking Intent

Examples:

* Create simulated booking intent
* View booking intent
* Cancel confirmed BookingIntent
* No platform financial penalty
* Penalties depend on external agreement with vendor
* No payment processing

### Reviews and Moderation

Examples:

* Create review
* View reviews
* Rating scale 1 to 5
* Seed reviews
* Admin hides/removes offensive reviews
* Deleted/hidden reviews are audited
* Soft delete or hidden status for moderation
* No AI moderation unless explicitly supported

### Notifications

Examples:

* In-app notification
* Simulated email notification
* Mark notification as read
* Provider notification when quote is rejected or expired
* Email notification applies when email functionality exists
* No WhatsApp notification unless explicitly supported

### Language and Localization

Examples:

* Support Spanish LATAM neutral
* Support Spanish Spain
* Support Portuguese
* Support English
* English is mandatory
* AI output should respect selected language
* No complex local modisms in v1 unless source documents support it

### Admin

Examples:

* Manage categories
* Manage vendors
* Approve/reject/hide vendors
* Moderate reviews
* View admin action logs
* Manage demo data if supported
* View admin dashboard metrics
* Metrics focused on activity, governance, AI usage, quotes, and demo readiness
* Manage EventTypes in controlled way
* No hard delete of EventType if associated with events
* List events for demo/support/governance
* Cannot edit organizer-owned events in MVP

### Seed and Demo Data

Examples:

* Seed users
* Seed vendors
* Seed events
* Seed quote requests
* Seed quotes
* Seed reviews
* Seed AI examples if supported
* Support demo scenarios

Do not include any module as MVP unless supported by the source documents.

---

## AI Functional Requirements Rules

AI requirements must align with `/docs/7-AI-Features-Specification.md` and latest Product Owner decisions.

For every AI functional requirement, include:

* AI feature name
* Primary user
* Input
* Output
* Human validation
* Persistence behavior
* Fallback behavior
* Provider strategy
* Timeout behavior
* Related entities
* Related use case
* Acceptance notes

The FRD must explicitly state:

```text
No AI-generated output becomes official event, task, budget, quote, review, vendor, booking, or admin data until a human user confirms it.
```

AI must not:

* Make final vendor hiring decisions
* Process payments
* Approve vendors
* Moderate reviews automatically
* Create binding booking decisions
* Generate legal contracts
* Send WhatsApp messages
* Replace human approval

AI features must remain assistive.

The FRD must reflect this provider strategy:

```text
AIProvider interface is required.
OpenAIProvider is the primary functional MVP provider.
MockAIProvider is required for testing/demo.
AnthropicProvider is future or optional stub, not required as functional MVP implementation.
```

The FRD must reflect this timeout rule:

```text
If an AI request exceeds 1 minute, the system must stop waiting and show a controlled error or use fallback/MockAIProvider when demo/testing mode is enabled.
```

---

## MVP Restriction Matrix

Create a section called:

```markdown
## Matriz de restricciones MVP
```

Use this table format:

| Restricted capability | Source classification | MVP status | Allowed as MVP requirement? | Reason | Future consideration |
| --------------------- | --------------------- | ---------- | --------------------------- | ------ | -------------------- |

For **Allowed as MVP requirement?**, use:

```text
Yes / No / Only as Future / Only as Out-of-Scope note / Requires PO Decision
```

Evaluate capabilities that are commonly risky or scope-expanding, including:

* Real payments
* Real commissions
* Invoices
* Tax handling
* Legal contracts
* WhatsApp integration
* Native mobile app
* Real-time chat
* Automated vendor verification
* AI moderation
* AI sentiment analysis
* Autonomous AI decisions
* Full marketplace behavior
* Advanced geolocation
* Route planning
* External calendar integration, such as Google Calendar, Outlook Calendar, Apple Calendar, or similar services
* Multi-user event collaboration
* Guest list / RSVP / seating plan
* Currency conversion

Do not mark these as restricted by default without checking the source documents. Classify them based on evidence from the documents.

---

## Traceability Requirements

The FRD must include a functional traceability matrix.

Use this table:

| Requirement ID | Related use case | Related business rule | Related permission | Related entity | Related AI feature | Source document |
| -------------- | ---------------- | --------------------- | ------------------ | -------------- | ------------------ | --------------- |

The matrix should connect each functional requirement to:

* Use case from `/docs/8-Use-Cases-Specification.md`
* Business rule from `/docs/4-Business-Rules-Document.md`
* Permission from `/docs/5-User-Roles-Permissions-Matrix.md`
* Entity from `/docs/6-Domain-Data-Model.md`
* AI feature from `/docs/7-AI-Features-Specification.md`
* Product Owner decision from `/docs/8.1-Product-Owner-Decisions-Use-Cases-Addendum.md`
* Source document evidence

If exact IDs exist in the source documents, use them.

If exact IDs do not exist, use names and mark as Derived.

---

## Acceptance Criteria Requirements

Include acceptance criteria at the module level.

Use this format:

| Module | Acceptance Criteria ID | Criteria | Related requirement |
| ------ | ---------------------- | -------- | ------------------- |

Acceptance criteria must be testable.

Examples only; do not include unless supported:

```text
Given an authenticated organizer, when they create an event with valid data, then the event is saved and associated with that organizer.
Given an AI-generated checklist, when the organizer accepts selected tasks, then only accepted tasks become official EventTasks.
Given a vendor receives a quote request assigned to their profile, when they submit a valid response, then a Quote is created and linked to the QuoteRequest.
Given an admin removes a review, when the action is completed, then the review is hidden or removed and the action is traceable.
```

---

## Functional Validation Requirements

Include functional validation notes for:

* Required fields
* Ownership checks
* Role-based access
* Status transitions
* AI validation
* AI timeout
* Quote visibility
* Quote default validity
* QuoteRequest active limit
* Vendor visibility
* Vendor category edit limit
* Vendor portfolio image limit
* Review rating scale
* Review moderation audit
* BookingIntent cancellation
* Event auto-completion
* Currency immutability
* Captcha/anti-bot
* Language selection
* Currency display
* Seed/demo flows
* Out-of-scope restrictions

Do not over-specify UI design or technical implementation.

---

## Demo Scenario Requirements

Include demo scenarios derived from use cases and MVP scope.

At minimum, evaluate and include supported scenarios around:

### Demo Scenario 1 — Organizer creates event with AI assistance

Potential flow:

1. Login as organizer.
2. Create event.
3. Select event currency.
4. Generate AI plan.
5. Review and accept plan.
6. Generate checklist.
7. View dashboard.

### Demo Scenario 2 — Organizer requests and compares quotes

Potential flow:

1. Open event.
2. View vendor categories.
3. Search vendor directory.
4. View vendor profile.
5. Generate or edit quote brief.
6. Send quote request.
7. View quote responses.
8. Compare quotes.
9. Create simulated booking intent if supported.
10. Cancel BookingIntent if supported by updated rules.

### Demo Scenario 3 — Vendor responds to quote request

Potential flow:

1. Login as vendor.
2. View assigned quote requests.
3. Open quote request.
4. Submit quote response.
5. View quote history.
6. See quote rejected/expired status notification if applicable.

### Demo Scenario 4 — Admin governs platform

Potential flow:

1. Login as admin.
2. Review vendor profile submission.
3. Approve or reject vendor.
4. Manage service categories.
5. Manage EventTypes if supported.
6. Moderate review.
7. View admin action log if supported.
8. View admin dashboard metrics.

### Demo Scenario 5 — Multi-language and currency behavior

Potential flow:

1. Change language.
2. View UI labels in selected language.
3. Create/view event with selected currency.
4. Generate AI output in selected language if supported.
5. Verify currency cannot be changed after event creation.

Only include demo steps supported by source documents.

---

## Future Requirements Section

Create a section for future requirements.

Use this table:

| Future Requirement ID | Requirement | Reason deferred | Dependency | Possible version |
| --------------------- | ----------- | --------------- | ---------- | ---------------- |

Future requirements may include only if supported by source documents:

* WhatsApp integration
* Real payments
* Commission model
* Premium vendor gallery
* Multi-user collaboration
* Advanced vendor verification
* Real email provider
* External calendar integration
* AI moderation
* Sentiment analysis
* Native mobile app
* Marketplace monetization
* Contracts
* Invoices
* Guest list / RSVP
* Vendor response to reviews
* Functional AnthropicProvider implementation if deferred
* Deep category hierarchy

Do not mix future requirements with MVP requirements.

---

## Out-of-Scope Section

Create a section for explicitly out-of-scope functionality.

Use this table:

| Out-of-Scope ID | Functionality | Source evidence | Reason excluded from MVP | Risk if included now |
| --------------- | ------------- | --------------- | ------------------------ | -------------------- |

Only mark functionality as explicitly out of scope if supported by the source documents or clearly derived from the MVP restrictions.

If something is unclear, classify it as:

```text
Requires Product Owner Decision
```

---

## Non-Functional Notes

This FRD is mainly functional, but include a short section for functional-adjacent constraints if they are needed for requirement clarity.

Include only high-level notes for:

* Web responsive only
* Privacy and security good practices
* Role-based access
* Captcha/anti-bot
* AI fallback
* AI timeout
* Seed data reproducibility
* Multi-language support
* Currency display
* Demo readiness

Do not turn this into a full NFR document.

---

## Quality Requirements

The FRD must:

* Be written in Spanish LATAM.
* Be formal and structured.
* Be consistent with all source documents.
* Start from source-document extraction, not generic assumptions.
* Reflect the latest Product Owner decisions from document `8.1`.
* Avoid contradictory requirements.
* Clearly separate MVP, Future, Out of Scope, and Requires Product Owner Decision items.
* Clearly identify assumptions and recommendations.
* Be useful for user stories, QA, API contracts, frontend screens, backend services, development tasks, and academic evaluation.
* Avoid overengineering.
* Avoid turning EventFlow into a full marketplace.
* Avoid adding payments, contracts, commissions, WhatsApp, native mobile app, real-time chat, AI moderation, autonomous AI decisions, external calendar integration, or currency conversion into MVP unless explicitly supported by source documents.
* Include requirement IDs.
* Include traceability.
* Include acceptance criteria.
* Include MVP restriction validation.
* Include updated Product Owner decision validation.
* Include demo scenarios.
* Include human validation for AI requirements.

---

## Final Validation Before Output

Before finalizing the document, verify:

1. The functional requirements were extracted from source documents.
2. Every MVP requirement has evidence, rationale, or classification.
3. Every MVP module is supported by existing documentation.
4. Every MVP role has functional requirements.
5. Organizer requirements are limited to owned resources where applicable.
6. Vendor requirements are limited to own profile/services and assigned quote requests where applicable.
7. Admin requirements are limited to documented governance capabilities.
8. AI requirements include human validation.
9. Quote flow is complete and aligned with permissions.
10. Booking intent is simulated and not treated as real payment.
11. Language and currency requirements are represented.
12. Seed/demo requirements are represented.
13. Product Owner decisions from document `8.1` are represented.
14. Review rating scale is 1–5.
15. Vendor portfolio limit is documented.
16. Vendor category edit limit is documented.
17. Quote default validity is 15 calendar days.
18. QuoteRequest active limit is documented.
19. BookingIntent cancellation is documented.
20. Event auto-completion after 2 days is documented.
21. Currency immutability is documented.
22. Captcha/anti-bot is documented.
23. AI timeout is documented.
24. Admin dashboard metrics are clarified.
25. Review audit/soft-delete is documented.
26. Quote rejected/expired notification is documented.
27. Vendor response to reviews is marked as future.
28. AnthropicProvider is future/stub, not functional MVP requirement.
29. Admin event visibility is clarified.
30. EventType management is clarified.
31. Category hierarchy max 2 levels is documented.
32. Attachment soft delete is documented.
33. Future, out-of-scope, and requires-decision items are clearly separated.
34. No real payment, invoice, commission, legal contract, WhatsApp, native mobile, real-time chat, AI moderation, autonomous AI decision, full marketplace, advanced geolocation, external calendar integration, multi-user collaboration, guest list, RSVP, seating plan, or currency conversion is included as MVP unless explicitly supported by source documents.
35. The MVP restriction matrix is included.
36. The document is practical and not overengineered.

---

## Final Instruction

Generate the full **EventFlow — Functional Requirements Document (FRD)** now and save it as:

```text
/docs/9-Functional-Requirements-Document.md
```