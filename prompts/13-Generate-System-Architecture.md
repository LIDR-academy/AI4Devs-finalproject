# AAA Prompt — Generate the EventFlow System Architecture Document

## ACT AS

You are a **Senior Software Architect, AI Solutions Architect, and Technical Documentation Lead** helping me design the architecture documentation for my final master project: **EventFlow**.

EventFlow is an **AI-assisted event planning platform** for social and corporate events. The MVP must be implemented as an **AI-assisted event planning workspace + simplified vendor quote flow**, not as a full transactional marketplace.

You must behave as an architect who can transform product, functional, non-functional, AI, data, and architecture vision documentation into a clear, technical, structured, and traceable **System Architecture Document**.

Your job is not to invent a new product direction. Your job is to translate the existing approved documentation into a practical architectural specification that can guide backend, frontend, AI, database, security, testing, DevOps, and future implementation tasks.

Use the existing documentation as the source of truth:

* `/docs/1-Domain-Discovery-Report.md`
* `/docs/2-Product-Owner-Decisions.md`
* `/docs/3-MVP-Scope-Definition.md`
* `/docs/4-Business-Rules-Document.md`
* `/docs/5-User-Roles-Permissions-Matrix.md`
* `/docs/6-Domain-Data-Model.md`
* `/docs/7-AI-Features-Specification.md`
* `/docs/8-Use-Cases-Specification.md`
* `/docs/8.1-Product-Owner-Decisions-Use-Cases-Addendum.md`
* `/docs/8.2-Documentation-Alignment-Review-Before-FRD.md`
* `/docs/9-Functional-Requirements-Document.md`
* `/docs/10-Non-Functional-Requirements.md`
* `/docs/11-Data-Seed-Strategy.md`
* `/docs/12-Architecture-Vision-and-Principles.md`

The previously approved architecture vision states that EventFlow MVP should be implemented as:

```text
Modular Monolith
+ Clean Architecture / Hexagonal Architecture
+ REST API
+ PostgreSQL
+ LLMProvider abstraction
+ OpenAIProvider as primary functional provider
+ MockAIProvider as mandatory testing/demo/fallback provider
+ AnthropicProvider as future/stub provider
```

You must preserve this architecture decision unless a serious contradiction is found in the documentation.

---

## ASK

Generate the complete **System Architecture Document** for EventFlow.

The document must explain how the system is structured at a high level and how its major components collaborate. It must include **C4 architecture views**, system modules, responsibilities, integrations, runtime flows, deployment assumptions, cross-cutting concerns, and architectural guardrails.

The document must be written in **Spanish LATAM neutral**, with a professional but clear technical style.

The document must not be generic. It must be specific to EventFlow and grounded in the approved MVP scope, business rules, data model, functional requirements, non-functional requirements, AI features, use cases, and architecture vision.

The output should be ready to be saved as:

```text
/docs/13-System-Architecture-Document.md
```

---

## AIM

The final document must help the development team understand:

1. What the EventFlow system is.
2. Who interacts with it.
3. What external systems it integrates with.
4. What the main containers are.
5. What backend modules exist.
6. What responsibilities each module owns.
7. How frontend, backend, database, AI provider, notifications, seed, and admin governance collaborate.
8. How Clean/Hexagonal Architecture should be applied inside the modular monolith.
9. How data ownership, RBAC, human-in-the-loop AI, traceability, i18n, currency, and seed/demo readiness are supported architecturally.
10. What is explicitly out of scope and should not be designed into the MVP.

---

# Required Output Structure

Create the document using the following structure.

---

# EventFlow — System Architecture Document

## 1. Propósito del documento

Explain the purpose of the System Architecture Document.

It must clarify that this document translates the approved architecture vision into concrete system-level views, modules, responsibilities, integrations, and runtime interactions.

It must serve as input for:

* Backend Technical Design
* Frontend Architecture
* API Design Specification
* AI Architecture and PromptOps Design
* Database Physical Design
* Security Design
* Testing Strategy
* Deployment and DevOps Design
* ADRs
* User Stories, Backlog, and Development Tasks

---

## 2. Alcance del documento

Include:

### 2.1 Incluye

The document must include:

* System context.
* C4 diagrams: Context, Container, Component-level backend/module view, and optional runtime flow views.
* Main actors and external systems.
* Main application containers.
* Backend modules and responsibilities.
* Frontend responsibilities and feature areas.
* Database responsibilities.
* AI provider abstraction and integration.
* Notification strategy.
* Seed/demo strategy.
* Security and authorization responsibilities.
* Observability and audit responsibilities.
* Cross-cutting architectural concerns.
* MVP boundaries and explicit exclusions.
* Architecture risks and mitigations.
* Traceability to existing documentation.

### 2.2 No incluye

Explicitly state that this document does not include:

* Full API contracts.
* Physical database DDL.
* Detailed UI design.
* Prompt templates.
* CI/CD pipeline implementation.
* Test case catalog.
* Production cloud infrastructure selection.
* ADR final approval.

These will be handled in later documents.

---

## 3. Fuentes utilizadas

Create a table listing all source documents and how they contribute to the System Architecture Document.

Use this format:

|  # | Documento | Aporte a la arquitectura del sistema |
| -: | --------- | ------------------------------------ |

Include all documents from `/docs/1` through `/docs/12`.

---

## 4. Resumen ejecutivo de arquitectura del sistema

Provide a concise executive summary.

It must state that EventFlow MVP is architected as:

```text
Responsive Web Frontend
→ REST API Backend
→ Modular Monolith with Clean/Hexagonal Architecture
→ PostgreSQL Database
→ LLMProvider abstraction
→ OpenAIProvider / MockAIProvider / AnthropicProvider stub
```

Mention that this architecture supports:

* Organizer workspace.
* Vendor onboarding and quote flow.
* Admin governance.
* AI-assisted planning.
* Human validation of AI outputs.
* Seed-based demo readiness.
* RBAC + ownership.
* Internationalization.
* Traceability and auditability.

---

## 5. Principios arquitectónicos aplicados

Summarize the architectural principles that directly influence the system architecture.

Include at least:

1. Modular Monolith over microservices for MVP.
2. Clean/Hexagonal boundaries.
3. Domain-first module design.
4. AI provider abstraction.
5. Human-in-the-loop AI.
6. RBAC + ownership enforcement.
7. PostgreSQL as system of record.
8. REST API as primary integration contract.
9. Feature-first frontend organization.
10. Seed/demo reproducibility.
11. Observability and audit by design.
12. MVP scope protection and no overengineering.

For each principle, explain:

* Meaning.
* Architectural implication.
* Example in EventFlow.

Use a table.

---

## 6. C4 Model — Level 1: System Context Diagram

Create a C4 Level 1 diagram using Mermaid.

The diagram must show:

### People / Actors

* Organizer
* Vendor
* Admin
* Product Owner / Demo Evaluator, if relevant

### EventFlow System

* EventFlow Web Platform

### External Systems

* OpenAI API
* MockAIProvider
* AnthropicProvider stub/future
* Email simulation/logging system
* Browser
* Optional deployment platform placeholder
* Optional object/file storage placeholder for attachments

Do not include WhatsApp, payments, real-time chat, mobile native apps, SMS, push notifications, or calendar integrations as MVP systems.

After the diagram, include a table:

| Elemento | Tipo | Responsabilidad | MVP/Future/Out of Scope | Notas |

---

## 7. C4 Model — Level 2: Container Diagram

Create a C4 Level 2 diagram using Mermaid.

It must include these containers:

1. **Responsive Web Frontend**

   * Browser-based application.
   * Used by organizer, vendor, and admin.
   * Handles UI, routing, forms, i18n display, AI review/acceptance screens.

2. **REST API Backend**

   * Modular monolith.
   * Owns business use cases, authorization, validation, orchestration, AI calls, notification creation, seed operations.

3. **PostgreSQL Database**

   * System of record.
   * Stores users, events, tasks, budgets, vendors, quotes, bookings, reviews, notifications, AIRecommendation, AdminAction, attachments metadata, seed data.

4. **LLM Provider Layer**

   * Logical abstraction inside backend or infrastructure adapter.
   * Routes calls to OpenAIProvider or MockAIProvider.
   * AnthropicProvider remains stub/future.

5. **Object/File Storage**

   * Stores portfolio images or attachments if implemented.
   * Metadata remains in PostgreSQL.
   * Can be local/dev storage for MVP.

6. **Notification Adapter**

   * In-app notifications persisted in DB.
   * Email simulated via structured log.

7. **Seed/Demo Scripts**

   * Populate deterministic demo data.
   * May be invoked as CLI/backend script, not a public user-facing service.

After the diagram, create a container responsibility table:

| Container | Responsabilidad principal | Datos que maneja | Interacciones | Notas MVP |

---

## 8. C4 Model — Level 3: Backend Component / Module Diagram

Create a C4 Level 3 view focused on the backend modular monolith.

Represent the backend as modules or bounded contexts.

Required backend modules:

1. Identity & Access Module
2. User/Profile Module
3. Event Planning Module
4. Task/Checklist Module
5. Budget Module
6. Vendor Management Module
7. Service Category Module
8. Quote Flow Module
9. Booking Intent Module
10. Review & Moderation Module
11. Notification Module
12. AI Assistance Module
13. Admin & Governance Module
14. Seed/Demo Module
15. Localization & Currency Module
16. Attachment Module
17. Observability/Audit support

For each module, define:

* Purpose.
* Main responsibilities.
* Main entities.
* Main use cases or functional requirements supported.
* Dependencies.
* Outbound integrations, if any.
* Ownership/authorization rules.
* Notes on Clean/Hexagonal boundaries.

Use this table format:

| Módulo | Responsabilidades | Entidades principales | Casos de uso / FR relacionados | Dependencias | Reglas críticas |

Also create a Mermaid diagram showing module relationships.

Important: The diagram should not imply distributed microservices. Make it clear these are internal modules inside a single backend deployable.

---

## 9. Internal Architecture Style — Clean / Hexagonal Layers

Explain how each backend module should be organized internally.

Include the following logical layers:

1. **Domain Layer**

   * Entities, value objects, domain rules, domain services.
   * No dependency on frameworks, database, HTTP, or LLM SDKs.

2. **Application Layer**

   * Use cases.
   * Orchestration.
   * Authorization checks.
   * Transaction boundaries.
   * Calls to ports.

3. **Ports**

   * Repository ports.
   * LLMProvider port.
   * Notification port.
   * File storage port.
   * Clock/Date provider.
   * Transaction manager.
   * Audit logger.

4. **Infrastructure Adapters**

   * Prisma/PostgreSQL repositories.
   * OpenAI adapter.
   * MockAI adapter.
   * Email log adapter.
   * File storage adapter.
   * Seed data adapter.

5. **Interface/API Layer**

   * REST controllers.
   * DTOs.
   * Request validation.
   * Response mapping.
   * Auth middleware/guards.

Include a Mermaid diagram showing these layers.

Also explain key dependency rules:

* Domain must not import infrastructure.
* Application uses ports, not SDKs.
* Controllers call use cases.
* Repositories implement ports.
* LLM SDKs live only in infrastructure adapters.
* AI outputs are persisted as `AIRecommendation`.
* Official domain data is only updated after explicit human acceptance.

---

## 10. Frontend Architecture Overview

Explain the frontend architecture at system level.

It must be:

* Responsive web application.
* Feature-first structure.
* Role-aware navigation.
* API-client based.
* i18n-aware.
* AI review/confirmation UX aware.
* Not coupled to provider-specific AI details.

Recommended feature areas:

* Auth
* Organizer Events
* Event Dashboard
* AI Planning Review
* Tasks
* Budget
* Vendor Directory
* Vendor Profile Management
* Quote Requests
* Quote Comparison
* Booking Intent
* Reviews
* Notifications
* Admin Dashboard
* Admin Vendor Review
* Admin Categories/EventTypes
* Admin Audit Logs
* Shared UI / Design System
* i18n

Include a table:

| Frontend feature area | Responsabilidad | APIs consumidas | Roles | Notas de arquitectura |

Explain route guards:

* Authenticated routes.
* Role-based routes.
* Ownership is enforced by backend, not trusted only in frontend.
* Admin routes are restricted.

---

## 11. Data Architecture Overview

Explain that PostgreSQL is the system of record.

Include the main data groups:

* Identity
* Events
* Tasks
* Budgets
* Vendors
* Categories
* Quotes
* Booking Intents
* Reviews
* Notifications
* AIRecommendations
* AdminActions
* Attachments
* Localization/Currency
* Seed data

Include a high-level data responsibility table:

| Grupo de datos | Entidades | Owner funcional | Reglas de integridad críticas | Notas |

Mention important invariants:

* Event belongs to one organizer.
* VendorProfile belongs to one vendor.
* QuoteRequest belongs to an event and is addressed to a vendor.
* Quote belongs to a QuoteRequest.
* BookingIntent is simulated and not a payment.
* Review requires confirmed booking intent.
* AIRecommendation keeps prompt/output traceability.
* AdminAction records admin actions.
* Attachments use soft delete.
* Currency is immutable after event creation.
* ServiceCategory depth is maximum 2 levels.
* Quote default validity is 15 calendar days.
* AI timeout is 60 seconds.

---

## 12. AI Architecture Overview

Explain the AI architecture at system level.

Required content:

* AI Assistance Module coordinates AI use cases.
* `LLMProvider` is the abstraction.
* `OpenAIProvider` is the functional MVP provider.
* `MockAIProvider` is mandatory for tests, demo, fallback, and offline mode.
* `AnthropicProvider` is a future/stub provider, not functional in MVP.
* The frontend never calls OpenAI directly.
* All AI calls go through the backend.
* AI outputs are persisted as `AIRecommendation`.
* Human acceptance is required before creating official tasks, budget items, quote briefs, or vendor bios.
* AI does not approve vendors, moderate reviews, contract providers, process payments, or make autonomous decisions.

Include a Mermaid sequence diagram for:

### AI Event Plan Generation Flow

Actors:

* Organizer
* Frontend
* Backend REST API
* AI Assistance Module
* LLMProvider
* OpenAIProvider or MockAIProvider
* PostgreSQL

Flow:

1. Organizer requests AI plan generation.
2. Frontend sends request to backend.
3. Backend validates auth and event ownership.
4. Application use case builds prompt input.
5. AI Assistance calls LLMProvider.
6. Provider returns structured output.
7. Backend validates output schema.
8. Backend persists AIRecommendation with accepted=false.
9. Frontend displays recommendation.
10. Organizer edits/accepts.
11. Backend materializes accepted items into official domain entities.

Also include fallback behavior:

* Provider timeout after 60 seconds.
* Invalid JSON/schema response.
* Provider unavailable.
* Use MockAIProvider or static template if demo/testing mode allows it.
* Return controlled error otherwise.

---

## 13. Integration Architecture

List all integrations.

Use this table:

| Integración | Tipo | Dirección | MVP/Future/Out of Scope | Propósito | Notas técnicas |

Required integrations:

* Browser ↔ Frontend
* Frontend ↔ Backend REST API
* Backend ↔ PostgreSQL
* Backend ↔ OpenAI API
* Backend ↔ MockAIProvider
* Backend ↔ AnthropicProvider stub
* Backend ↔ File/Object storage
* Backend ↔ Email simulation/logging
* Backend ↔ Seed scripts / CLI
* Backend ↔ Observability/logging

Also explicitly list excluded integrations:

* WhatsApp
* Payments
* SMS
* Push notifications
* Native mobile apps
* Real-time chat
* Calendar providers
* Currency conversion APIs
* AI moderation/sentiment services

---

## 14. Runtime Flows

Document the most important runtime flows using Mermaid sequence diagrams and explanations.

Include at least:

### 14.1 User Registration and Login Flow

Must include captcha/anti-bot validation.

### 14.2 Organizer Creates Event Flow

Must include language and currency selection, with currency immutable after creation.

### 14.3 AI Plan Generation and Human Acceptance Flow

Must include `AIRecommendation`.

### 14.4 Vendor Profile Approval Flow

Must include admin approval and visibility in public directory only after approved.

### 14.5 Quote Request and Quote Response Flow

Must include organizer, vendor, QuoteRequest, Quote, notification.

### 14.6 Booking Intent Simulated Flow

Must make clear there is no payment or contract.

### 14.7 Review Moderation Flow

Must include soft delete/hidden status and AdminAction.

### 14.8 Seed/Demo Reset Flow

Must include deterministic seed data and demo readiness.

Each flow should include:

* Trigger.
* Actors.
* Main system components.
* Main data created/updated.
* Critical business rules.
* Failure cases.

---

## 15. Security and Authorization Architecture

Explain security at architecture level.

Include:

* Authentication required for protected routes.
* User roles: organizer, vendor, admin.
* Admin users created by seed/configuration, not public registration.
* RBAC for coarse-grained access.
* Ownership checks for resource-level access.
* Backend is the source of truth for authorization.
* Frontend route guards improve UX but do not replace backend checks.
* Captcha/anti-bot required for registration and login.
* Password hashing.
* Minimal personal data collection.
* No payment data.
* No legal documents.
* No sensitive unnecessary data in prompts.
* Prompt input minimization.
* AdminAction audit for admin operations.

Include a table:

| Security concern | Architectural decision | Applied in | Validation approach |

---

## 16. Observability, Audit, and Traceability

Explain:

* Structured logging.
* AIRecommendation traceability.
* AdminAction audit.
* Notification logs.
* Email simulated logs.
* Error handling.
* Correlation IDs recommended.
* Metrics for demo readiness.
* Metrics for AI calls: provider, latency, fallback_used, timeout, schema_valid.
* Metrics for REST endpoints: status code, latency, error rate.

Include a table:

| Concern | Data captured | Purpose | Stored in | MVP priority |

---

## 17. Deployment View

Provide a practical MVP deployment view.

It should include:

* Frontend deployed as static web app or SPA hosting.
* Backend deployed as one service.
* PostgreSQL managed or local depending on environment.
* Environment variables for database, auth, AI provider, AI timeout, mock mode.
* Seed script execution.
* File storage local/dev or object storage.
* Logs.

Create a Mermaid deployment diagram.

Do not lock the project into a specific cloud provider unless the source docs explicitly require it.

Include environments:

* Local development.
* QA/demo.
* Academic production/demo.

Use a table:

| Ambiente | Propósito | Componentes | Datos | Notas |

---

## 18. Cross-Cutting Concerns

Document cross-cutting concerns and how the architecture supports them.

Include:

* Authorization.
* Validation.
* Error handling.
* i18n.
* Currency display.
* AI fallback.
* Logging.
* Audit.
* Soft delete.
* Data ownership.
* Seed reproducibility.
* Testing.
* Configuration.
* Rate limiting / anti-abuse basics.
* Accessibility support from frontend architecture.

Use a table:

| Concern transversal | Decisión arquitectónica | Módulos afectados | Riesgo mitigado |

---

## 19. MVP Boundaries and Explicit Exclusions

Create a section that clearly protects the MVP scope.

Include a table:

| Capability | Status | Why excluded from MVP | Architectural implication |

Must include:

* Real payments.
* Commissions.
* Digital contracts.
* WhatsApp integration.
* Real-time chat.
* Native mobile app.
* Push notifications.
* SMS.
* Calendar integrations.
* Automatic currency conversion.
* AI moderation.
* AI sentiment analysis.
* Autonomous vendor approval.
* Autonomous booking/payment decisions.
* Multi-collaborator event management.
* Guest list / RSVP / seating plan.
* Full transactional marketplace.

Make clear these must not be introduced indirectly through architecture.

---

## 20. Architecture Risks and Mitigations

Create a risk table:

| Riesgo | Impacto | Probabilidad | Mitigación arquitectónica | Documento fuente relacionado |

Include at least:

* Modular monolith becoming a messy monolith.
* AI provider latency or failure.
* Invalid AI output.
* Authorization mistakes.
* Overengineering into marketplace.
* Seed/demo instability.
* i18n complexity.
* Attachment handling and soft delete.
* Admin audit gaps.
* Frontend feature coupling.
* Database schema drift.
* Environment/configuration issues.

---

## 21. Architecture Decisions to Formalize as ADRs

List ADR candidates that should be created later.

Include:

1. Modular Monolith over Microservices.
2. Clean/Hexagonal Architecture.
3. REST API over GraphQL for MVP.
4. PostgreSQL as primary database.
5. Prisma or ORM/migration strategy.
6. LLMProvider abstraction.
7. OpenAIProvider + MockAIProvider + AnthropicProvider stub.
8. Backend-owned AI orchestration.
9. RBAC + ownership authorization.
10. Seed-first demo strategy.
11. In-app notifications + simulated email.
12. Soft delete strategy for reviews and attachments.
13. i18n from MVP.
14. Currency immutable by event.
15. No real payments/contracts/chat/WhatsApp in MVP.

Use a table:

| ADR ID sugerido | Decisión | Estado | Justificación breve |

---

## 22. Traceability Matrix

Create a traceability matrix connecting architecture sections to source documents.

Use this format:

| Sección del System Architecture Document | Documentos fuente principales | Decisiones / reglas relacionadas |

This must show that the architecture is grounded in the source documentation.

---

## 23. System Architecture Readiness Checklist

Create a checklist with yes/no expected answers.

Include:

* C4 Level 1 defined.
* C4 Level 2 defined.
* Backend module view defined.
* Frontend responsibilities defined.
* AI integration defined.
* Database system of record defined.
* Security model defined.
* Runtime flows documented.
* MVP exclusions documented.
* Risks and mitigations documented.
* ADR candidates identified.
* Traceability matrix included.
* Ready for backend/frontend/API/AI/DB/testing/DevOps design.

Use a table:

| # | Pregunta | Respuesta esperada |

---

## 24. Conclusión

Write a concise conclusion explaining that this System Architecture Document translates the approved architecture vision into a concrete implementation map for EventFlow MVP.

It must reinforce:

* Modular Monolith.
* Clean/Hexagonal.
* REST API.
* PostgreSQL.
* LLMProvider abstraction.
* Human-in-the-loop.
* RBAC + ownership.
* Seed/demo readiness.
* Strict MVP scope boundaries.

---

# Quality Requirements

The document must be:

* Written in **Spanish LATAM neutral**.
* Clear enough for a technical team.
* Specific to EventFlow.
* Not generic SaaS architecture.
* Grounded in the provided documentation.
* Explicit about MVP vs Future vs Out of Scope.
* Useful for generating user stories, backlog items, development tasks, API specs, and technical designs.
* Diagram-rich, using Mermaid.
* Traceable.
* Practical for implementation.
* Aligned with the previously approved Architecture Vision & Principles.

---

# Mermaid Requirements

Use Mermaid diagrams where useful.

At minimum include:

1. C4 Level 1 — System Context.
2. C4 Level 2 — Container Diagram.
3. C4 Level 3 — Backend Module/Component Diagram.
4. Clean/Hexagonal Layer Diagram.
5. AI Generation Sequence Diagram.
6. Quote Flow Sequence Diagram.
7. Deployment Diagram.

Use readable Mermaid syntax compatible with Markdown.

---

# Important Constraints

Do not design or recommend:

* Microservices for the MVP.
* Event-driven architecture with external broker for the MVP.
* Serverless-first architecture for the MVP.
* Full marketplace architecture.
* Real payment integrations.
* Contract signing.
* WhatsApp integration.
* Real-time chat.
* Native mobile apps.
* Automatic currency conversion.
* AI moderation.
* AI autonomous decisions.
* Public admin registration.
* Frontend-only authorization.
* Direct frontend calls to OpenAI or any LLM provider.

If any of these appear in the source documentation as future ideas, mark them clearly as **Future** or **Out of Scope**, not MVP.

---

# Final Instruction

Generate the full `/docs/13-System-Architecture-Document.md` content now.

Do not summarize.
Do not ask clarifying questions.
Do not produce a partial outline.
Produce the full document in Spanish LATAM neutral.
