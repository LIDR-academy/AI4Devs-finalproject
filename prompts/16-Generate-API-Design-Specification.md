# AAA Prompt — API Design Specification Document for EventFlow

## ACT AS

You are a **Senior API Architect, Backend Technical Lead, REST API Designer, Security-aware Software Architect, and Technical Documentation Specialist**.

You are working on **EventFlow**, an academic final project for an AI for Developers Master program.

EventFlow is an **AI-assisted event planning workspace + simplified vendor quote flow**. It is not a transactional marketplace.

You must generate the document:

```text
/docs/16-API-Design-Specification.md
```

The document must be written in **Spanish LATAM neutral**, with clear technical language suitable for:

* Backend Engineers
* Frontend Engineers
* QA Engineers
* Software Architect
* Product Owner
* AI coding agents
* Academic evaluators
* Future maintainers of the project

The document must be formal, structured, traceable, implementation-oriented, and aligned with the existing EventFlow documentation.

---

## ASK

Generate the complete **API Design Specification Document** for EventFlow.

The purpose of this document is to translate the previously defined functional, architectural, backend, frontend, AI, data model, security, and non-functional documentation into a clear and actionable **REST API contract specification**.

The API Design Specification must define:

1. API design principles.
2. REST conventions.
3. API versioning strategy.
4. Resource naming conventions.
5. Authentication and session strategy.
6. Authorization expectations using RBAC + ownership.
7. Request and response conventions.
8. Pagination, filtering, sorting, and search conventions.
9. Error response model.
10. Validation strategy.
11. Status code conventions.
12. DTO naming conventions.
13. Endpoint catalog by module.
14. Request/response schemas per endpoint.
15. Required authorization per endpoint.
16. Business rule enforcement points.
17. AI endpoints and human-in-the-loop application flow.
18. File upload / attachment endpoints.
19. Notification endpoints.
20. Admin governance endpoints.
21. Seed/demo endpoints or commands, if applicable.
22. Observability and correlation ID conventions.
23. Security constraints.
24. API testing guidance.
25. OpenAPI readiness guidance.
26. MVP exclusions and future endpoints explicitly out of scope.

The API must be designed for the approved backend stack:

```text
Node.js + TypeScript + Express.js + Prisma + PostgreSQL
```

The API style must be:

```text
REST JSON API
```

The frontend consumer is:

```text
Next.js + TypeScript + App Router
```

The frontend must consume the backend through REST contracts. Do not introduce GraphQL, Server Actions, API Route Handlers as BFF, WebSockets, or real-time chat.

---

## CONTEXT

Use the existing EventFlow documentation as the source of truth.

The API document must be aligned with the following documents:

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
/docs/14-Backend-Technical-Design.md
/docs/15-Frontend-Architecture-Design.md
```

The document must not invent unrelated SaaS features or generic marketplace functionality.

---

## PRODUCT CONTEXT

EventFlow MVP includes three main roles:

```text
organizer
vendor
admin
```

The MVP supports:

* User registration and login.
* Role-based access.
* Event creation and planning.
* AI-assisted event plan generation.
* AI-assisted checklist generation.
* AI-assisted budget suggestion.
* AI-assisted vendor category recommendation.
* AI-assisted quote brief generation.
* AI-assisted quote comparison summary.
* Optional AI-assisted vendor bio/package description.
* Optional AI-assisted urgent task prioritization.
* Event tasks.
* Budget and budget items.
* Vendor profiles.
* Vendor services.
* Service categories.
* Vendor portfolio attachments.
* Quote requests.
* Quotes.
* Booking intent simulation.
* Reviews.
* Notifications.
* Admin approval and moderation.
* Admin metrics.
* Admin audit actions.
* Seed/demo data support.
* i18n and currency display.

The MVP explicitly excludes:

* Real payments.
* Real commissions.
* Digital contracts.
* WhatsApp integration.
* Real-time chat.
* Native mobile app.
* Push notifications.
* SMS.
* Calendar synchronization.
* Automatic currency conversion.
* Autonomous AI decisions.
* AI moderation.
* AI sentiment analysis.
* AI image generation.
* Multi-user event collaboration.

---

## ARCHITECTURAL CONTEXT

EventFlow uses:

```text
Responsive Web Frontend
→ REST API Backend
→ Modular Monolith with Clean / Hexagonal Architecture
→ PostgreSQL Database
→ LLMProvider abstraction
→ OpenAIProvider / MockAIProvider / AnthropicProvider stub
```

The API must respect the backend architecture:

* Express controllers must be thin.
* Business logic must live in application use cases and domain policies.
* Prisma must remain in the Infrastructure layer.
* Domain and Application layers must not depend on Express, Prisma, or OpenAI SDK.
* Authorization must be enforced in the backend.
* Frontend validation is UX only, not the source of truth.
* Every protected endpoint must validate authentication.
* Every role-sensitive endpoint must validate RBAC.
* Every resource-sensitive endpoint must validate ownership or assignment.
* Every AI output must remain pending until accepted, edited, or discarded by the user.

---

## TECHNICAL DECISIONS TO RESPECT

Use these decisions as fixed constraints:

```text
Backend runtime: Node.js LTS
Language: TypeScript
HTTP framework: Express.js
Database: PostgreSQL
ORM: Prisma
API style: REST JSON
Validation: Zod recommended
Testing: Vitest + Supertest recommended
Frontend: Next.js + TypeScript + App Router
Frontend server state: TanStack Query
Forms: React Hook Form + Zod
AI provider abstraction: LLMProvider
Main AI provider: OpenAIProvider
Demo/test AI provider: MockAIProvider
Future/stub provider: AnthropicProvider
Authentication: cookie/session or token strategy must be explicitly documented
Credential storage: no localStorage for auth tokens
```

Do not introduce:

```text
GraphQL
tRPC
gRPC
WebSockets
Server Actions
Next.js API Routes as BFF
Kafka
Redis queues
BullMQ
Microservices
External payment APIs
WhatsApp APIs
SMS providers
Push notification providers
```

Unless they are explicitly marked as Future or Out of Scope.

---

## API DESIGN REQUIREMENTS

The API Design Specification must define a consistent REST contract using:

```text
/api/v1
```

The document must include API groups for at least:

```text
Health
Auth
Users / Profile
Events
Event Tasks
Budgets
Vendors
Vendor Services
Service Categories
Quote Requests
Quotes
Booking Intents
Reviews
Notifications
AI Assistance
Attachments
Admin Governance
Localization / Currency
Seed / Demo
```

For each API group, define:

* Purpose.
* Main resources.
* Primary actors.
* Authorization rules.
* Endpoint table.
* Request DTOs.
* Response DTOs.
* Validation rules.
* Business rules enforced.
* Error scenarios.
* Notes for frontend consumption.
* Notes for testing.

---

## REQUIRED API CONVENTIONS

Define conventions for:

### Base URL

Use:

```text
/api/v1
```

Include examples such as:

```text
GET /api/v1/events
POST /api/v1/events
GET /api/v1/events/:eventId
PATCH /api/v1/events/:eventId
```

### Resource Naming

Use plural nouns:

```text
/events
/vendors
/quote-requests
/booking-intents
/notifications
```

Use nested routes only when the relationship improves clarity, for example:

```text
GET /events/:eventId/tasks
POST /events/:eventId/tasks
GET /events/:eventId/budget
POST /vendors/:vendorProfileId/services
```

Avoid excessive nesting.

### Request / Response Format

Use JSON by default:

```http
Content-Type: application/json
Accept: application/json
```

Use multipart only for attachment upload endpoints.

### Standard Success Response

Define a standard response envelope. Example:

```json
{
  "data": {},
  "meta": {
    "correlationId": "req_123",
    "timestamp": "2026-06-08T18:30:00.000Z"
  }
}
```

For lists:

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 100,
    "totalPages": 5
  },
  "meta": {
    "correlationId": "req_123"
  }
}
```

### Standard Error Response

Define a standard error envelope:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "One or more fields are invalid.",
    "details": [
      {
        "field": "eventDate",
        "message": "eventDate must be a future date."
      }
    ]
  },
  "meta": {
    "correlationId": "req_123",
    "timestamp": "2026-06-08T18:30:00.000Z"
  }
}
```

Include error code categories:

```text
VALIDATION_ERROR
AUTHENTICATION_REQUIRED
FORBIDDEN
RESOURCE_NOT_FOUND
CONFLICT
BUSINESS_RULE_VIOLATION
RATE_LIMIT_EXCEEDED
AI_PROVIDER_TIMEOUT
AI_PROVIDER_UNAVAILABLE
AI_INVALID_OUTPUT
FILE_UPLOAD_ERROR
INTERNAL_ERROR
```

### HTTP Status Codes

Define when to use:

```text
200 OK
201 Created
202 Accepted
204 No Content
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
422 Unprocessable Entity
429 Too Many Requests
500 Internal Server Error
503 Service Unavailable
```

### Pagination

Use query parameters:

```text
?page=1&pageSize=20
```

Define default and maximum page size.

### Filtering

Use query parameters:

```text
?status=active&type=wedding&city=guatemala
```

### Sorting

Use:

```text
?sort=createdAt:desc
```

### Search

Use:

```text
?q=photography
```

### Correlation ID

Every request must support or generate:

```text
X-Correlation-Id
```

The response must return the same correlation ID.

---

## SECURITY AND AUTHORIZATION REQUIREMENTS

The API document must explain:

1. Authentication requirement per endpoint.
2. Public vs protected routes.
3. Role-based access control.
4. Ownership-based access control.
5. Admin-only routes.
6. Vendor-only routes.
7. Organizer-only routes.
8. Captcha requirements for register and login.
9. Rate limiting for auth endpoints.
10. Secure handling of session/auth tokens.
11. No auth credentials in localStorage.
12. CORS restrictions.
13. No sensitive data in errors.
14. No stack traces in API responses.
15. Request size limits.
16. File upload limits.
17. Allowed MIME types.
18. Anti-abuse constraints.

Use this rule:

```text
Frontend guards improve UX; backend authorization is the source of truth.
```

---

## AI API REQUIREMENTS

The AI endpoints must be explicitly modeled as human-in-the-loop.

Include endpoints for:

```text
POST /events/:eventId/ai/event-plan
POST /events/:eventId/ai/checklist
POST /events/:eventId/ai/budget-suggestion
POST /events/:eventId/ai/vendor-categories
POST /events/:eventId/ai/quote-brief
POST /quote-requests/:quoteRequestId/ai/comparison-summary
POST /vendors/me/ai/bio
POST /events/:eventId/ai/task-prioritization
POST /ai-recommendations/:aiRecommendationId/apply
POST /ai-recommendations/:aiRecommendationId/discard
GET /ai-recommendations/:aiRecommendationId
```

The document must specify:

* AI request DTOs.
* AI response DTOs.
* `AIRecommendation` lifecycle.
* Pending output state.
* Apply/edit/discard flow.
* Timeout behavior.
* Fallback behavior.
* MockAIProvider behavior.
* Prompt version metadata.
* `fallbackUsed`.
* `provider`.
* `latencyMs`.
* `languageCode`.
* JSON schema validation.
* No AI output becomes official without explicit user confirmation.

Include the required timeout:

```text
60 seconds
```

If timeout occurs:

* In demo/testing mode: fallback to MockAIProvider or static template.
* In production-academic mode: controlled error and manual retry option.

---

## BUSINESS RULES TO ENFORCE IN API

The API must document where these rules are enforced:

```text
Only organizer can manage own events.
Only vendor can manage own VendorProfile and VendorServices.
Only admin can approve/reject vendors.
Only approved vendors appear in public directory.
Event currency is immutable after creation.
Event auto-completes 2 days after event_date.
Quote default validity is 15 calendar days.
Maximum 5 active QuoteRequests per service category per event.
BookingIntent is simulated and does not imply payment or contract.
BookingIntent can be cancelled without platform penalty.
Review rating must be 1–5.
Only organizer with confirmed BookingIntent can create Review.
Admin review deletion/moderation uses soft delete and audit.
Vendor portfolio supports up to 10 images per work/event shown.
Vendor category changes are limited to 5.
Attachments use soft delete.
ServiceCategory hierarchy maximum depth is 2.
AI outputs require human confirmation.
No payments, contracts, WhatsApp, chat, push, SMS, native app, or autonomous AI.
```

---

## ENDPOINT CATALOG EXPECTATIONS

For each endpoint, use a table like this:

| Method | Path | Auth | Roles | Purpose | Success | Errors |
| ------ | ---- | ---- | ----- | ------- | ------- | ------ |

Example:

| Method | Path      | Auth     | Roles     | Purpose      | Success | Errors             |
| ------ | --------- | -------- | --------- | ------------ | ------- | ------------------ |
| POST   | `/events` | Required | organizer | Create event | 201     | 400, 401, 403, 422 |

Then define request and response schemas.

Example:

```ts
type CreateEventRequestDto = {
  eventTypeId: string;
  title: string;
  eventDate: string;
  guestCount: number;
  city: string;
  country: string;
  currency: "GTQ" | "USD";
  languageCode: "es-LATAM" | "es-ES" | "pt" | "en";
};
```

```ts
type EventResponseDto = {
  id: string;
  title: string;
  eventType: {
    id: string;
    slug: string;
    name: string;
  };
  status: "draft" | "active" | "completed" | "cancelled";
  eventDate: string;
  guestCount: number;
  city: string;
  country: string;
  currency: string;
  languageCode: string;
  ownerId: string;
  autoCompleted: boolean;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};
```

Use TypeScript-like DTOs for clarity, but keep the document language in Spanish LATAM.

---

## REQUIRED DOCUMENT STRUCTURE

Generate the document with this structure:

```markdown
# EventFlow — API Design Specification

## 1. Propósito del documento
## 2. Alcance del documento
### 2.1 Incluye
### 2.2 No incluye

## 3. Fuentes utilizadas
## 4. Resumen ejecutivo del API
## 5. Principios de diseño del API
## 6. Estilo de API y convenciones REST
## 7. Versionado del API
## 8. Base URL y ambientes
## 9. Convenciones de naming
## 10. Autenticación
## 11. Autorización: RBAC + ownership
## 12. Convenciones de request
## 13. Convenciones de response
## 14. Modelo estándar de errores
## 15. Códigos HTTP
## 16. Paginación, filtros, ordenamiento y búsqueda
## 17. Validación de DTOs
## 18. Seguridad del API
## 19. Observabilidad y correlation IDs
## 20. Catálogo de módulos del API
## 21. Health API
## 22. Auth API
## 23. User / Profile API
## 24. Events API
## 25. Event Tasks API
## 26. Budget API
## 27. Vendor Profiles API
## 28. Vendor Services API
## 29. Service Categories API
## 30. Quote Requests API
## 31. Quotes API
## 32. Booking Intents API
## 33. Reviews API
## 34. Notifications API
## 35. AI Assistance API
## 36. Attachments API
## 37. Admin Governance API
## 38. Localization / Currency API
## 39. Seed / Demo API
## 40. Matriz de autorización por endpoint
## 41. Matriz de reglas de negocio por endpoint
## 42. Contratos críticos de DTOs
## 43. Estrategia OpenAPI
## 44. Estrategia de pruebas del API
## 45. Consideraciones para frontend Next.js
## 46. Límites explícitos del MVP
## 47. Riesgos del diseño API y mitigaciones
## 48. Checklist de readiness del API
## 49. Trazabilidad a documentos fuente
## 50. Conclusión
```

You may add subsections if needed.

---

## OUTPUT FORMAT

Return the complete document in **Markdown**.

The document must be written in:

```text
Spanish LATAM neutral
```

Use tables extensively where useful.

Use Mermaid only if it helps explain flow, for example:

* AI recommendation lifecycle.
* Auth flow.
* Request lifecycle.
* Error handling flow.

Do not generate code implementation.

Do not generate Express controllers.

Do not generate Prisma schema.

Do not generate OpenAPI YAML yet, but include an **OpenAPI readiness section** describing how this document can be converted to OpenAPI later.

---

## QUALITY BAR

The document must be:

* Complete enough to guide implementation.
* Clear enough for frontend/backend contract alignment.
* Strictly aligned with MVP scope.
* Traceable to previous documents.
* Consistent with REST principles.
* Security-aware.
* Testable.
* Friendly for AI coding agents.
* Free of overengineering.
* Explicit about what is future or out of scope.
* Explicit about business rule enforcement.
* Explicit about AI human-in-the-loop behavior.
* Explicit about authorization and ownership.
* Explicit about frontend consumption patterns.

---

## IMPORTANT CONSTRAINTS

Do not hallucinate new features.

Do not include payments, contracts, chat, WhatsApp, push notifications, SMS, mobile native APIs, GraphQL, real-time APIs, or autonomous AI behavior.

Do not make the frontend responsible for security enforcement.

Do not make the API depend on Next.js internals.

Do not make AI endpoints directly call OpenAI from the frontend.

Do not expose provider API keys or prompt internals to the frontend.

Do not store or transmit unnecessary sensitive data.

Do not introduce multi-tenant enterprise complexity unless explicitly marked as future.

Do not introduce microservices or distributed system concerns for the MVP.

---

## FINAL INSTRUCTION

Generate `/docs/16-API-Design-Specification.md` as a complete, polished, technically rigorous Markdown document in Spanish LATAM.

The result must be directly usable as the next SDLC artifact after:

```text
/docs/14-Backend-Technical-Design.md
/docs/15-Frontend-Architecture-Design.md
```

The document must act as the source of truth for:

* REST endpoint implementation.
* Frontend API clients.
* DTO alignment.
* Supertest API tests.
* MSW frontend mocks.
* OpenAPI generation.
* User stories and development tasks.
