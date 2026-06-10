# AAA Prompt — Backend Technical Design Document for EventFlow

## ACT AS

You are a **Senior Backend Architect, Principal Software Engineer, and Technical Design Lead** specialized in:

* Node.js backend architecture.
* Express.js production-grade API design.
* TypeScript backend development.
* Prisma ORM with PostgreSQL.
* Modular Monolith architecture.
* Clean Architecture and Hexagonal Architecture.
* Pragmatic Domain-Driven Design for MVPs.
* REST API backend design.
* RBAC and ownership-based authorization.
* AI product backend integration using provider abstraction.
* Testable backend design.
* Academic-grade technical documentation.

You are working on **EventFlow**, a final Master project for AI4Devs.

EventFlow is an **AI-assisted event planning platform** focused on helping organizers create event plans, manage tasks, budgets, vendors, quote requests, quote responses, booking intents, reviews, notifications, and admin governance.

The MVP is explicitly defined as:

```text
AI-assisted event planning workspace + simplified vendor quote flow
```

It is **not** a transactional marketplace.

The approved system architecture is:

```text
Responsive Web Frontend
→ REST API Backend
→ Modular Monolith with Clean / Hexagonal Architecture
→ PostgreSQL Database
→ LLMProvider abstraction
→ OpenAIProvider / MockAIProvider / AnthropicProvider stub
```

The approved backend technology stack is:

```text
Runtime: Node.js
Language: TypeScript
HTTP framework: Express.js
Database: PostgreSQL
ORM: Prisma
API style: REST JSON
Architecture: Modular Monolith + Clean / Hexagonal Architecture
AI integration: LLMProvider abstraction
```

Your task is to generate the document:

```text
/docs/14-Backend-Technical-Design.md
```

The document must be written in **Spanish LATAM neutral**, but you may keep technical terms in English when they are clearer or standard in software architecture.

---

## ASK

Generate a complete **Backend Technical Design Document** for EventFlow.

The document must translate the approved system architecture and backend technology stack into a concrete backend implementation design using:

* **Node.js** as runtime.
* **TypeScript** as programming language.
* **Express.js** as HTTP framework.
* **Prisma** as ORM.
* **PostgreSQL** as relational database.
* **REST JSON API** as backend/frontend contract.
* **Modular Monolith** as deployment and modularization style.
* **Clean / Hexagonal Architecture** as internal architecture style.
* **LLMProvider abstraction** for AI provider integration.

The document must define:

1. Backend design goals.
2. Backend technology stack.
3. Backend architecture style.
4. Backend layers.
5. Backend modules.
6. Responsibilities per module.
7. Application use cases.
8. Domain services and policies, only where justified.
9. Repository ports only where they add real value.
10. Prisma repository adapters for persisted business entities.
11. DTOs and validation strategy.
12. Express controller responsibilities.
13. Express middleware strategy.
14. Authorization strategy.
15. Error handling strategy.
16. Transaction boundaries using Prisma.
17. AI backend integration.
18. Notification handling.
19. File/attachment handling.
20. Background jobs.
21. Folder structure.
22. Testing approach.
23. Observability and audit strategy.
24. Backend risks and mitigations.
25. Traceability to existing documentation.
26. Out-of-scope backend capabilities.
27. Readiness checklist for implementation.

The document must be detailed enough for backend developers or AI coding agents to generate:

* Express routes.
* Express controllers.
* Express middlewares.
* Application use cases.
* Domain services and policies where needed.
* Repository contracts.
* Prisma repository adapters.
* Prisma schema later.
* API contracts later.
* Unit tests.
* Integration tests.
* Seed scripts.
* Authorization middleware.
* AI provider adapters.

Do **not** write actual production code unless needed as small illustrative pseudocode.

---

## AVAILABLE CONTEXT

Use the existing EventFlow documentation as the source of truth.

Assume the following documents already exist:

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
/docs/11-Data-Seed-Strategy.md
/docs/12-Architecture-Vision-and-Principles.md
/docs/13-System-Architecture-Document.md
```

---

## TECHNOLOGY STACK DECISIONS

The Backend Technical Design Document must treat the following as **approved backend technology decisions**:

| Area                    | Decision                                                                                |
| ----------------------- | --------------------------------------------------------------------------------------- |
| Runtime                 | Node.js                                                                                 |
| Language                | TypeScript                                                                              |
| HTTP framework          | Express.js                                                                              |
| Database                | PostgreSQL                                                                              |
| ORM                     | Prisma                                                                                  |
| API style               | REST JSON                                                                               |
| Architecture style      | Modular Monolith                                                                        |
| Internal architecture   | Clean / Hexagonal Architecture                                                          |
| AI provider abstraction | LLMProvider                                                                             |
| Main AI provider        | OpenAIProvider                                                                          |
| Demo/test AI provider   | MockAIProvider                                                                          |
| Future/stub AI provider | AnthropicProvider                                                                       |
| File storage            | LocalFileStorageAdapter for dev/demo, ObjectStorageAdapter as future option             |
| Password hashing        | bcrypt or argon2                                                                        |
| DTO validation          | Recommend one option and justify it                                                     |
| Testing                 | Recommend one option and justify it                                                     |
| Background jobs         | Lightweight Node.js scheduled jobs for MVP; external queues are future unless justified |

The document must clearly distinguish:

* **Approved decisions.**
* **Recommended implementation choices.**
* **Implementation-dependent choices.**
* **Future options.**
* **Out-of-scope technologies.**

Do not present future technologies as MVP requirements.

---

## IMPORTANT ARCHITECTURE CONSTRAINT

Although the backend uses **Express.js** and **Prisma**, the design must preserve Clean / Hexagonal Architecture:

* Domain layer must not import Express.
* Domain layer must not import Prisma.
* Domain layer must not import OpenAI SDK.
* Application layer must not depend directly on Express request/response objects.
* Application layer must depend on repository ports, provider ports and application services, not Prisma models.
* Prisma must be implemented through Infrastructure adapters.
* Express controllers must be thin.
* Express routes must call application use cases.
* Business rules must live in Application / Domain layers, not in controllers or Prisma adapters.
* DTO validation must happen before invoking use cases.
* Authorization must be enforced in backend middleware and application policies.
* Prisma models are persistence models, not domain entities.
* Mapping between Prisma records and domain entities must happen in mappers.

---

## PRODUCT / MVP DECISIONS

* EventFlow MVP is a web responsive product.
* No native mobile app in MVP.
* No real payments.
* No commissions.
* No contracts.
* No real-time chat.
* No WhatsApp integration.
* No SMS or push notifications.
* No automatic currency conversion.
* No AI moderation.
* No AI sentiment analysis.
* No autonomous AI booking.
* No autonomous provider approval.
* No generic free-form chatbot.
* No AI image generation.
* The MVP must remain a planning workspace with simplified quote flow.

---

## ROLES

The backend must support exactly these MVP roles:

```text
organizer
vendor
admin
```

Rules:

* Public registration can only create `organizer` or `vendor`.
* `admin` users are created by seed or internal configuration.
* A user has only one active role in the MVP.
* Authorization must combine RBAC + ownership-based access.
* Frontend authorization is not enough; backend must enforce all permissions.

---

## MAIN BACKEND DOMAINS / MODULES

Use these backend domains as the recommended modular monolith boundaries:

```text
identity-access
user-profile
event-planning
task-management
budget-management
vendor-management
service-catalog
quote-flow
booking-intent
reviews-moderation
notifications
ai-assistance
admin-governance
attachments
localization
seed-demo
shared-kernel
```

You may refine names, but do not lose these domain responsibilities.

Important rule:

> Do not automatically create a controller, service, repository or module for every entity. Define technical components only when they are useful for implementing MVP behavior, transactional consistency, authorization, business rules, complex querying or integration boundaries.

---

## DOMAIN MODEL BOUNDARIES

The backend must use the existing Domain Data Model as the source of truth.

Do **not** invent new product entities.

### Core persisted business entities

These entities are part of the MVP domain model and may require repositories, Prisma adapters, use cases and authorization policies depending on their behavior:

```text
User
Event
EventTask
Budget
BudgetItem
VendorProfile
VendorService
ServiceCategory
QuoteRequest
Quote
BookingIntent
Review
Notification
AIRecommendation
Attachment
AdminAction
```

### Catalogs / configuration / enum-like entities

These may be implemented as PostgreSQL tables, Prisma enums, TypeScript constants, static configuration or seed-managed read-only data depending on the design decision:

```text
Role
EventType
Location
Currency
Language
```

For each of these, the document must evaluate whether it should be implemented as:

* PostgreSQL table managed by seed/admin.
* Prisma enum.
* TypeScript constant.
* Static configuration.
* Read-only seed data.
* Simple catalog adapter.

Do not create repositories, services or controllers for these automatically.

### Optional / recommended AI support entity

```text
AIPromptVersion
```

The document must evaluate whether `AIPromptVersion` should be implemented as:

* PostgreSQL table.
* Static versioned prompt registry.
* JSON/config file.
* Seed-managed read-only data.

Do not force a repository unless justified.

### Future or out-of-scope entities

These must not be implemented as MVP modules or required repositories:

```text
Payment
Invoice
Commission
Contract
Conversation
Message
WhatsAppIntegration
GuestList
RSVP
SeatingPlan
EventCollaborator
PushNotificationDevice
NativeMobileDevice
SentimentAnalysis
AIModerationResult
```

---

## AI DECISIONS

The backend must use an abstraction:

```text
LLMProvider
```

With these implementations:

```text
OpenAIProvider       // functional MVP provider
MockAIProvider       // mandatory for tests, demo and fallback
AnthropicProvider    // stub / future, not functional in MVP
```

Rules:

* All AI outputs must be persisted as `AIRecommendation`.
* Every AI output must require explicit human validation before becoming official domain data.
* AI timeout is 60,000 ms.
* If AI fails or times out, the system must return a controlled error or use `MockAIProvider` only when demo/testing mode is enabled.
* AI prompts must receive language as input.
* AI must not approve providers, moderate reviews, process payments, book vendors, or make autonomous decisions.
* OpenAI SDK usage must be isolated inside `OpenAIProvider`.
* MockAIProvider must be deterministic.
* AnthropicProvider must exist only as a stub/future adapter.

---

## CRITICAL BUSINESS RULES

The backend design must explicitly support these rules:

* Event currency is selected during event creation and becomes immutable.
* Event supports local currency or USD.
* No automatic currency conversion.
* Event is automatically marked as completed 2 calendar days after `event_date`.
* Quote default validity is 15 calendar days if `valid_until` is not provided.
* Maximum 5 active `QuoteRequest` records per service category per event.
* `BookingIntent.confirmed_intent` can be cancelled without platform penalty.
* Reviews use a rating scale from 1 to 5.
* Admin review deletion must use soft delete / hidden status with audit.
* Attachments must use soft delete.
* Service categories support max depth of 2 levels.
* EventType cannot be physically deleted if events are associated.
* Vendor portfolio supports up to 10 images per work/event shown.
* Vendor category changes are limited to 5 accumulated edits.
* Captcha / anti-bot is required in registration and login.
* Email is simulated through structured logs.
* Notifications are in-app for MVP.
* All admin actions must create `AdminAction`.
* Seed data must be reproducible and deterministic.

---

## NON-FUNCTIONAL BACKEND REQUIREMENTS

The backend design must consider:

* Security and privacy by design.
* Password hashing using bcrypt or argon2.
* RBAC + ownership enforcement.
* Structured error responses.
* Input validation.
* DTO validation.
* Rate limiting or anti-abuse controls for auth and quote flows.
* Correlation IDs.
* Structured logging.
* Audit logging.
* Testability.
* MockAIProvider determinism.
* Seed reproducibility.
* P95 performance goals for non-AI endpoints.
* Controlled AI latency and fallback.
* Environment-based configuration.
* No hardcoded secrets.
* Maintainability and modular boundaries.
* Express middleware consistency.
* Prisma transaction safety.
* Prisma migrations and seed strategy.
* No unnecessary repositories, services or policies.

---

# ACTION

Create the **Backend Technical Design Document** using the following structure.

Use this exact document title:

```markdown
# EventFlow — Backend Technical Design Document
```

Use this metadata block:

```markdown
> **Versión:** 1.0
> **Fecha:** 2026-06-08
> **Producto:** EventFlow — plataforma asistida por IA para planificación de eventos y gestión simplificada de cotizaciones de proveedores
> **MVP target:** AI-assisted event planning workspace + simplified vendor quote flow
> **Idioma del documento:** Español LATAM neutral
> **Estado:** Listo para guiar implementación backend con Node.js, Express, TypeScript, Prisma, PostgreSQL, API Design, Database Physical Design, Security Design, Testing Strategy y User Stories técnicas.
> **Audiencia:** Backend Engineers, Tech Lead, Software Architect, AI Engineers, QA, DevOps, Product Owner, agentes IA generadores de código y evaluadores académicos.
```

---

## 1. Propósito del documento

Explain that this document translates the System Architecture into concrete backend implementation design using Node.js, Express, TypeScript, Prisma and PostgreSQL.

Clarify that it is input for:

* API Design Specification.
* Database Physical Design.
* Security and Authorization Design.
* Testing Strategy.
* DevOps Design.
* User Stories.
* Backend tasks.
* AI coding agents.

---

## 2. Alcance del documento

### 2.1 Incluye

* Node.js + Express backend design.
* TypeScript backend conventions.
* Prisma ORM usage.
* PostgreSQL persistence approach.
* Backend layers.
* Modules.
* Use cases.
* Services and policies only where justified.
* Repositories only where justified.
* DTOs.
* Validation strategy.
* Express controllers.
* Express routes.
* Express middleware.
* Authorization.
* AI integration.
* Notifications.
* Attachments.
* Background jobs.
* Transactions.
* Testing.
* Observability.
* Folder structure.

### 2.2 No incluye

* Complete REST API contract.
* Physical database DDL.
* Frontend architecture.
* Productive prompts.
* Deployment pipeline implementation.
* Full QA test catalog.
* Payment, chat, contracts, WhatsApp, push, SMS, native app.

---

## 3. Fuentes utilizadas

Create a table listing documents 1 through 13 and explain how each one informs backend design.

---

## 4. Backend technology stack

Create a dedicated section describing the approved backend stack:

```text
Node.js
TypeScript
Express.js
PostgreSQL
Prisma ORM
REST JSON API
OpenAI SDK behind provider adapter
MockAIProvider
AnthropicProvider stub
Local file storage adapter
```

For each technology include:

* Purpose.
* Why it fits EventFlow.
* Where it belongs architecturally.
* What must not depend on it.
* Risks.
* Mitigations.

Include a subsection:

```markdown
### Technology boundaries
```

Explain:

* Express belongs to Interface Layer.
* Prisma belongs to Infrastructure Layer.
* OpenAI SDK belongs only to OpenAIProvider.
* Domain and Application layers must remain framework-independent.

---

## 5. Resumen ejecutivo del backend

Summarize the backend as:

```text
Node.js + TypeScript Backend
+ Express REST API
+ Modular Monolith
+ Clean / Hexagonal Architecture
+ Application Use Cases
+ Domain Model
+ Repository Ports where justified
+ Prisma Repository Adapters
+ PostgreSQL persistence
+ LLMProvider abstraction
```

Explain why this backend design fits the MVP.

---

## 6. Principios de diseño backend

Create a table with at least these principles:

1. Domain-first modules.
2. Clean / Hexagonal separation.
3. Use-case driven application layer.
4. Express controllers must be thin.
5. Framework-independent domain.
6. Repository ports only where useful.
7. Prisma adapters isolated in Infrastructure.
8. RBAC + ownership in backend.
9. Human-in-the-loop AI.
10. AI provider abstraction.
11. Deterministic demo and tests.
12. Input validation at Express boundaries.
13. Business rules in application/domain, not controllers.
14. Auditability by design.
15. Soft delete for sensitive historical entities.
16. No automatic technical component per entity.
17. No overengineering.
18. No out-of-scope marketplace capabilities.

For each principle include:

* Meaning.
* Backend implication.
* EventFlow example.

---

## 7. Backend architecture overview

Describe the backend layers:

```text
Interface Layer
Application Layer
Domain Layer
Ports Layer
Infrastructure Layer
Shared Kernel
```

For each layer define:

* Responsibility.
* What belongs there.
* What does not belong there.
* Example components using Node.js + Express + Prisma.

Include a Mermaid diagram showing the layer dependencies.

---

## 8. Express application composition

Add a dedicated section explaining how Express should be composed.

Include:

* `app.ts` / Express app factory.
* `server.ts` bootstrap.
* Route registration.
* Middlewares.
* Error handling middleware.
* Authentication middleware.
* Authorization middleware.
* Correlation ID middleware.
* Request logging middleware.
* Rate limit middleware.
* DTO validation middleware.
* File upload middleware.
* Health check route.
* Versioned API prefix, e.g. `/api/v1`.

Explain that Express must not contain business logic.

---

## 9. Modular monolith boundaries

Create a table of backend modules:

```text
identity-access
user-profile
event-planning
task-management
budget-management
vendor-management
service-catalog
quote-flow
booking-intent
reviews-moderation
notifications
ai-assistance
admin-governance
attachments
localization
seed-demo
shared-kernel
```

For each module include:

* Purpose.
* Primary entities or catalogs involved.
* Main use cases.
* Key business rules.
* Exposed Express routes/controllers, only if needed.
* Dependencies allowed.
* Dependencies forbidden.
* Notes to avoid overengineering.

---

## 10. Module responsibility details

For each module, provide a subsection with:

* Responsibility.
* In-scope capabilities.
* Out-of-scope capabilities.
* Main use cases.
* Domain services or policies only if needed.
* Repository ports only if justified.
* Prisma adapters required only if persisted business behavior requires them.
* Important validations.
* Authorization rules.
* Events or notifications triggered.
* Testing focus.
* Simplification notes.

Cover at minimum:

### 10.1 Identity & Access

Include registration, login, logout, password recovery, captcha, password hashing, role assignment, admin seed-only creation.

### 10.2 User Profile

Include profile view/update and preferred language.

### 10.3 Event Planning

Include event creation wizard, event lifecycle, currency immutability, event auto-completion, ownership.

### 10.4 Task Management

Include manual tasks, AI-generated tasks, confirmation before official creation, task status transitions.

### 10.5 Budget Management

Include budget items, warnings, no automatic currency conversion, AI budget suggestion confirmation.

### 10.6 Vendor Management

Include vendor profile, approval status, category change limit, portfolio limit, services.

### 10.7 Service Catalog

Include service categories max depth 2 and EventType controlled management.

Important: evaluate whether `EventType` and `ServiceCategory` need separate repositories or whether one catalog repository/adapter is enough for MVP.

### 10.8 Quote Flow

Include QuoteRequest, Quote, default validity 15 days, max 5 active requests per category per event, comparison, quote rejection/expiration notifications.

### 10.9 Booking Intent

Include simulated booking, provider confirmation, cancellation including confirmed intent.

### 10.10 Reviews & Moderation

Include verified review creation, rating 1–5, admin soft delete/hidden status, no provider response in MVP.

### 10.11 Notifications

Include in-app notifications and simulated email logs.

### 10.12 AI Assistance

Include LLMProvider, OpenAIProvider, MockAIProvider, AnthropicProvider stub, AIRecommendation, timeout, fallback, human validation.

Important: evaluate whether `AIPromptVersion` needs a repository or static prompt registry for MVP.

### 10.13 Admin Governance

Include provider approvals, review moderation, admin metrics, AdminAction audit log, read-only event access.

### 10.14 Attachments

Include portfolio attachments, soft delete, metadata, no sensitive uploads.

### 10.15 Localization

Include supported languages and currency display.

Important: evaluate whether `Currency` and `Language` should be enums/configuration instead of repositories.

### 10.16 Seed Demo

Include deterministic seed, is_seed flag, demo reset, MockAIProvider seed data.

---

## 11. Application use case design

Create a catalog of backend use cases grouped by module.

For each use case include:

* Use case name.
* Actor.
* Input DTO.
* Output DTO.
* Main business validations.
* Authorization checks.
* Repositories or adapters used.
* Prisma transaction required.
* Domain events / notifications.
* Related BR / FR / UC references.
* Simplification notes where applicable.

Include at least 35 representative use cases.

Examples:

```text
RegisterUserUseCase
LoginUserUseCase
CreateEventUseCase
UpdateEventUseCase
AutoCompletePastEventsUseCase
GenerateEventPlanUseCase
AcceptAIRecommendationUseCase
CreateManualTaskUseCase
ConfirmAIGeneratedTasksUseCase
CreateBudgetItemUseCase
GenerateBudgetSuggestionUseCase
CreateVendorProfileUseCase
SubmitVendorProfileForApprovalUseCase
ApproveVendorProfileUseCase
CreateQuoteRequestUseCase
GenerateQuoteBriefUseCase
RespondToQuoteRequestUseCase
ExpireQuotesUseCase
RejectQuoteUseCase
CreateBookingIntentUseCase
ConfirmBookingIntentUseCase
CancelBookingIntentUseCase
CreateReviewUseCase
ModerateReviewUseCase
CreateNotificationUseCase
MarkNotificationAsReadUseCase
SoftDeleteAttachmentUseCase
SeedDemoDataUseCase
```

Do not invent use cases unrelated to the MVP.

---

## 12. Domain services and policies

Define domain services only when business logic does not naturally belong to:

* an entity method,
* a value object,
* an application use case,
* or a simple validation policy.

Recommended candidate services/policies:

```text
AuthorizationPolicyService
EventLifecycleService
QuoteRequestLimitService
QuoteValidityService
ReviewEligibilityService
VendorCategoryChangePolicyService
PortfolioPolicyService
ServiceCategoryHierarchyPolicyService
AIRecommendationPolicyService
```

Optional candidates, only if justified:

```text
BookingIntentPolicyService
VendorApprovalPolicyService
NotificationRoutingService
AdminAuditService
```

For each included service/policy include:

* Why it deserves to exist.
* Purpose.
* Inputs.
* Outputs.
* Rules enforced.
* Modules that use it.
* Testing notes.

Important:

> Do not create domain services just to mirror modules or entities. If a rule can be handled clearly inside a use case or entity method, keep it there.

---

## 13. Repository ports and Prisma adapters

Define repository ports only for aggregates or persisted entities that require:

* business operations,
* transactional consistency,
* ownership checks,
* complex querying,
* soft delete behavior,
* audit trail,
* or cross-use-case reuse.

### Mandatory repository ports

Include and justify repository ports for:

```text
UserRepository
EventRepository
EventTaskRepository
BudgetRepository
BudgetItemRepository
VendorProfileRepository
VendorServiceRepository
ServiceCategoryRepository
QuoteRequestRepository
QuoteRepository
BookingIntentRepository
ReviewRepository
NotificationRepository
AIRecommendationRepository
AttachmentRepository
AdminActionRepository
```

### Optional / implementation-dependent repository ports

Evaluate whether these are needed or should be implemented as catalogs/config/static data:

```text
EventTypeRepository
LocationRepository
CurrencyRepository
LanguageRepository
AIPromptVersionRepository
```

For optional catalogs, the document must evaluate whether they should be implemented as:

* PostgreSQL tables managed by seed/admin.
* Prisma enums.
* TypeScript constants.
* Static configuration.
* Read-only seed data.
* Simple catalog adapter.

For each repository included, provide:

* Aggregate / entity managed.
* Why it deserves a repository.
* Main query methods.
* Ownership-aware methods if needed.
* Prisma adapter name.
* Transaction usage.
* Notes for indexes.
* Soft delete behavior if applicable.

Explicitly explain:

* Prisma models are infrastructure concerns.
* Domain entities should not be Prisma models.
* Mapping between Prisma records and domain entities must happen in mappers.
* Prisma transactions must be coordinated in Application layer through a transaction boundary or Infrastructure transaction manager.

---

## 14. DTO and validation strategy

Explain DTO categories:

```text
Request DTOs
Response DTOs
Internal Command DTOs
Query DTOs
AI Input DTOs
AI Output DTOs
Seed DTOs
Admin DTOs
```

Explain validation layers:

* Syntactic validation at Express route/controller boundary.
* Semantic validation in application/domain services.
* Persistence constraints at PostgreSQL/Prisma level.
* AI output schema validation.
* Authorization validation before data mutation.

Choose and justify a validation approach for Express:

```text
Zod recommended for schema-first validation
or
class-validator if decorator-based DTOs are preferred
```

Include representative DTO tables for:

* RegisterUserRequest.
* LoginUserRequest.
* CreateEventRequest.
* GenerateEventPlanRequest.
* CreateQuoteRequestRequest.
* RespondQuoteRequest.
* CreateBookingIntentRequest.
* CreateReviewRequest.
* ModerateReviewRequest.
* UploadAttachmentRequest.
* AdminApproveVendorRequest.

For each DTO include fields, type, required, validation, business notes.

---

## 15. Express controller and route design

Explain that controllers are thin.

For each controller group include responsibilities and example endpoints, but do not fully define the API contract because that belongs to `/docs/16-API-Design-Specification.md`.

Include controller groups only when they are useful for the MVP.

Candidate controller groups:

```text
AuthController
UsersController
EventsController
EventTasksController
BudgetsController
VendorsController
ServiceCatalogController
QuoteRequestsController
QuotesController
BookingIntentsController
ReviewsController
NotificationsController
AIAssistanceController
AdminController
AttachmentsController
SeedDemoController
LocalizationController
```

For each controller include:

* Responsibility.
* Express route prefix.
* Calls which use cases.
* Authorization requirements.
* Example endpoint names.
* What must not be inside the controller.
* Whether it is mandatory, optional, or can be merged with another controller for MVP simplicity.

Important:

> Do not create one controller per entity automatically. Group controllers by user workflow and module when that reduces complexity.

---

## 16. Middleware design

Define middleware responsibilities:

```text
correlationIdMiddleware
requestLoggerMiddleware
jsonBodyParser
authMiddleware
roleMiddleware
ownershipMiddleware or policy resolver
validateRequestMiddleware
rateLimitMiddleware
captchaVerificationMiddleware
errorHandlerMiddleware
notFoundMiddleware
fileUploadMiddleware
```

For each middleware include:

* Purpose.
* Applied globally or per route.
* Input.
* Output / request enrichment.
* Failure behavior.
* Related security concern.

---

## 17. Authorization design in backend

Define backend authorization as:

```text
RBAC + ownership + contextual policies
```

Include:

* Role-level permissions.
* Ownership checks.
* Vendor recipient checks.
* Admin-only checks.
* Public endpoint boundaries.
* Seed-only admin creation.
* Authorization failure strategy.
* 401 vs 403 vs 404 masking rules.
* Testing strategy for negative authorization scenarios.

Create an authorization matrix by module.

---

## 18. Error handling strategy

Define a consistent backend error model.

Include:

* ValidationError.
* AuthenticationError.
* AuthorizationError.
* NotFoundError.
* ConflictError.
* BusinessRuleViolationError.
* AIProviderError.
* AITimeoutError.
* ExternalIntegrationError.
* RateLimitError.
* PrismaPersistenceError.
* UnexpectedError.

Define a standard error response shape:

```json
{
  "error": {
    "code": "string",
    "message": "string",
    "details": {},
    "correlationId": "string"
  }
}
```

Explain logging rules and user-safe messages.

---

## 19. Transaction boundaries with Prisma

Explain where Prisma transactions are required.

Include at least:

* User registration.
* Event creation with Budget initialization.
* Accepting AI-generated tasks.
* Creating QuoteRequest with AI brief.
* Responding to QuoteRequest.
* Accepting / rejecting Quote.
* Creating BookingIntent.
* Confirming BookingIntent.
* Creating Review.
* Moderating Review.
* Soft deleting Attachment.
* Admin provider approval.
* Seed reset.

For each transaction include:

* Use case.
* Entities touched.
* Consistency requirement.
* Prisma transaction approach.
* Rollback behavior.
* Notes to avoid overengineering.

---

## 20. AI backend integration design

Define:

```text
LLMProvider port
OpenAIProvider adapter
MockAIProvider adapter
AnthropicProvider stub
AIRecommendation persistence
Prompt version lookup
AI output validation
Fallback behavior
Timeout behavior
Human acceptance flow
```

Include Mermaid sequence diagrams for:

1. Generate event plan.
2. Accept AI recommendation.
3. AI timeout fallback in demo mode.

Define AI provider config via environment variables:

```text
LLM_PROVIDER
OPENAI_API_KEY
AI_TIMEOUT_MS
AI_DEMO_MODE
AI_USE_MOCK_FALLBACK
AI_PROMPT_VERSION
```

Do not include real keys.

---

## 21. Notification backend design

Explain:

* In-app notification persistence.
* Simulated email through structured logs.
* Notification types.
* Trigger points.
* Read/unread state.
* No SMS, no push, no WhatsApp.

Include notification triggers for:

* Vendor profile approved/rejected.
* QuoteRequest received.
* Quote rejected.
* Quote expired.
* BookingIntent created.
* BookingIntent confirmed/cancelled.
* Review created.
* Admin moderation.

---

## 22. Attachment backend design

Explain:

* Attachment metadata persistence.
* File storage abstraction.
* Local storage for dev/demo.
* Optional object storage future.
* Soft delete required.
* Portfolio limit validation.
* Allowed file types.
* Size limits.
* Ownership checks.
* No sensitive documents required in MVP.

Define:

```text
FileStoragePort
LocalFileStorageAdapter
ObjectStorageAdapter // future
```

---

## 23. Background jobs and scheduled tasks

Define jobs:

```text
AutoCompletePastEventsJob
ExpireQuotesJob
SeedResetJob // dev/demo only
CleanupDeletedAttachmentsJob // optional/future technical process
```

For each job include:

* Purpose.
* Recommended implementation in Node.js MVP.
* Schedule.
* Entities affected.
* Idempotency rules.
* Error handling.
* Observability.

Avoid introducing Redis/BullMQ unless explicitly marked as future.

---

## 24. Folder structure

Propose a backend folder structure compatible with Node.js, Express, TypeScript, Prisma, Modular Monolith and Clean/Hexagonal Architecture.

Use a structure similar to:

```text
src/
  app.ts
  server.ts
  config/
  jobs/
  modules/
    event-planning/
      domain/
        entities/
        value-objects/
        services/
        policies/
      application/
        use-cases/
        dto/
        ports/
      infrastructure/
        prisma/
        persistence/
        mappers/
      interface/
        controllers/
        routes/
        presenters/
      tests/
    quote-flow/
      ...
  shared/
    domain/
    application/
    infrastructure/
    interface/
  prisma/
    schema.prisma
    migrations/
    seed.ts
```

Include naming conventions for:

* Use cases.
* DTOs.
* Repository ports.
* Prisma adapters.
* Mappers.
* Express controllers.
* Express routes.
* Middlewares.
* Domain services.
* Policies.
* Errors.
* Tests.

Mention that this is a recommended structure and can be simplified when a module has very few moving parts.

---

## 25. Testing strategy for backend

Define test categories:

```text
Unit tests
Application use case tests
Domain service tests
Prisma repository integration tests
Express controller integration tests
Authorization tests
AI provider contract tests
MockAIProvider deterministic tests
Seed reproducibility tests
Background job tests
```

Recommend a testing stack aligned with Node.js + Express:

```text
Jest or Vitest
Supertest
Prisma test database
MockAIProvider
```

Choose one recommendation and justify it.

Include test priorities by module.

Mention minimum expected coverage for critical backend logic.

---

## 26. Observability, audit and logging

Define:

* Correlation ID per request.
* Structured logs.
* Express request logs.
* Prisma error logs.
* AdminAction audit.
* AIRecommendation audit.
* Error logs.
* Security logs.
* Simulated email logs.
* Job execution logs.
* Metrics candidates.

Include what must never be logged:

* Passwords.
* Tokens.
* API keys.
* Raw sensitive user data.
* Full prompts if they contain unnecessary PII.

---

## 27. Configuration and environment variables

Define backend configuration categories:

```text
APP
DATABASE
AUTH
SECURITY
AI
STORAGE
EMAIL_SIMULATION
SEED
LOGGING
CORS
RATE_LIMITING
PRISMA
EXPRESS
```

Include example env var names and purpose, without real values.

---

## 28. Backend security considerations

Cover:

* Password hashing.
* JWT/session handling.
* Captcha / anti-bot.
* Rate limiting.
* CORS.
* Input validation.
* File upload validation.
* Ownership enforcement.
* Admin-only routes.
* Secret management.
* No payment data.
* No sensitive legal documents.
* Prompt data minimization.
* Safe error messages.
* Express security middleware recommendations.
* Prisma query safety.

---

## 29. Backend risks and mitigations

Create a table with risks such as:

* Business rules leaking into Express controllers.
* Weak ownership checks.
* Prisma models being treated as domain entities.
* Creating unnecessary repositories/services for every entity.
* AI provider coupling.
* AI timeout blocking UX.
* Seed script corrupting non-seed data.
* QuoteRequest limit not enforced atomically.
* Currency mutation bug.
* Soft delete inconsistencies.
* Admin actions not audited.
* Overengineering into microservices.
* Accidental out-of-scope feature implementation.

For each include:

* Impact.
* Likelihood.
* Mitigation.
* Related module.

---

## 30. Out-of-scope backend capabilities

Explicitly list what must not be implemented in the backend for MVP:

* Payment processing.
* Commission calculation.
* Invoice generation.
* Signed contracts.
* Real-time chat.
* WhatsApp integration.
* SMS.
* Push notifications.
* Native mobile device registration.
* Automatic currency conversion.
* AI sentiment analysis.
* AI review moderation.
* Autonomous vendor approval.
* Autonomous booking.
* Guest list / RSVP / seating plan.
* Multi-user event collaboration.
* Full vendor subscription billing.

---

## 31. Traceability matrix

Create a traceability matrix mapping backend modules to:

* FRD modules.
* Use cases.
* Business rules.
* Data model entities.
* AI features.
* NFR categories.
* System architecture components.
* Technology stack elements.

---

## 32. Backend implementation readiness checklist

Create a checklist grouped by:

```text
Architecture
Technology stack
Express application
Modules
Use cases
Repositories
Prisma adapters
DTOs
Validation
Authorization
AI
Persistence
Transactions
Testing
Observability
Seed
Security
Documentation
```

Each checklist item must be phrased as something that can be validated before implementation starts.

---

## 33. Conclusión

Close by explaining that this Backend Technical Design provides the bridge between architecture and implementation, and prepares the project for:

* API Design Specification.
* Database Physical Design.
* Security Design.
* Testing Strategy.
* DevOps Design.
* User Stories.
* Backlog.
* Development tasks.

---

# ADDITIONAL QUALITY RULES

Follow these rules strictly:

1. The output must be in **Spanish LATAM neutral**.
2. Keep technical terms in English when appropriate.
3. Use **Node.js + TypeScript + Express.js + Prisma + PostgreSQL** as the approved backend stack.
4. Do not introduce undocumented product scope.
5. Do not implement payments, contracts, chat, WhatsApp, push, SMS, native mobile, or marketplace transaction logic.
6. Do not make the backend a microservices architecture.
7. Do not make the domain depend on Prisma, Express, OpenAI SDK, or any framework.
8. Keep Express controllers thin.
9. Put business rules in Application / Domain layers.
10. Enforce authorization in backend, not only frontend.
11. Every AI output must be persisted and human-validated.
12. MockAIProvider must be mandatory for tests/demo.
13. AnthropicProvider is stub/future, not functional MVP.
14. All admin actions must be audited.
15. Use soft delete where required.
16. Include clear tables and diagrams.
17. Prefer practical MVP design over enterprise overengineering.
18. Include Mermaid diagrams where useful.
19. Include pseudocode only when it clarifies architecture.
20. Do not include real credentials, API keys or secrets.
21. Use Prisma as ORM, but isolate Prisma in the Infrastructure Layer.
22. Use Express as HTTP framework, but isolate Express in the Interface Layer.
23. Use TypeScript conventions consistently.
24. Do not introduce Redis, queues, Kafka, WebSockets or external brokers for MVP unless explicitly marked as future.
25. Do not create repositories, services, controllers or modules automatically for every entity.
26. Justify each repository, domain service and controller included.
27. Treat `Role`, `EventType`, `Location`, `Currency`, `Language` and `AIPromptVersion` as catalog/config/support concepts unless the document justifies persistence and repositories.
28. Do not invent new entities.
29. Use the existing Domain Data Model as the source of truth.
30. If something is implementation-dependent, mark it clearly as implementation-dependent instead of forcing it as mandatory.

---

## EXPECTED OUTPUT

Return the complete markdown content for:

```text
/docs/14-Backend-Technical-Design.md
```

The output must be ready to copy into the repository.

Do not summarize.

Do not ask clarifying questions.

Generate the full document.
