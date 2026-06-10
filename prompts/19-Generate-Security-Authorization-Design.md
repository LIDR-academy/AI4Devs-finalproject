# AAA Prompt — Security & Authorization Design Document for EventFlow

## CONTEXT

You are acting as a **Senior Security Architect, Application Security Engineer, Backend Architect, and Authorization Design Specialist** for the EventFlow project.

EventFlow is an academic MVP for an **AI-assisted event planning workspace + simplified vendor quote flow**. The product is a responsive web platform with three main roles:

* `organizer`
* `vendor`
* `admin`

The system is designed as:

```text
Next.js Frontend
→ REST JSON API
→ Node.js + Express + TypeScript Backend
→ Modular Monolith with Clean / Hexagonal Architecture
→ Prisma ORM
→ PostgreSQL
→ LLMProvider abstraction
→ OpenAIProvider / MockAIProvider / AnthropicProvider stub
```

The project already has the following documentation and decisions:

* Domain Discovery Report.
* Product Owner Decisions.
* MVP Scope Definition.
* Business Rules Document.
* User Roles & Permissions Matrix.
* Domain Data Model.
* AI Features Specification.
* Use Cases Specification.
* Product Owner Decisions Addendum.
* Documentation Alignment Review.
* Functional Requirements Document.
* Non-Functional Requirements.
* Data Seed Strategy.
* Architecture Vision & Principles.
* System Architecture Document.
* Backend Technical Design.
* Frontend Architecture Design.
* API Design Specification.
* AI Architecture & PromptOps Design.
* Database Physical Design.

The new document to generate is:

```text
/docs/19-Security-and-Authorization-Design.md
```

The document must be written in **Spanish LATAM neutral**, but this prompt is intentionally written in English for precision.

---

## GOAL

Generate a complete **Security & Authorization Design Document** for EventFlow.

The document must translate the existing product, architecture, backend, frontend, API, AI, database, and NFR decisions into a concrete, implementation-ready security and authorization design.

The document must clearly define:

1. Security scope for the MVP.
2. Threat model adapted to an academic MVP.
3. Authentication strategy.
4. Session and cookie strategy.
5. Password handling strategy.
6. Registration, login, logout, password reset, and captcha/anti-bot strategy.
7. RBAC model.
8. Ownership-based authorization model.
9. Assignment-based authorization model for vendor quote requests.
10. Admin authorization and audit requirements.
11. Authorization policy catalog by role, module, entity, and API endpoint.
12. Middleware chain and enforcement points in Express.
13. Frontend security responsibilities in Next.js.
14. Backend as the source of truth for authorization.
15. API security controls.
16. Input validation and DTO validation.
17. CORS, CSRF, rate limiting, payload limits, and security headers.
18. File upload and attachment security.
19. AI security and prompt privacy.
20. Secret management and environment variables.
21. Logging, audit trail, correlation IDs, and sensitive data redaction.
22. Database-level security considerations.
23. Seed/demo security constraints.
24. Error handling and information disclosure prevention.
25. Testing strategy for security and authorization.
26. Out-of-scope security capabilities.
27. Future security roadmap.
28. ADRs recommended for formalization.
29. Traceability matrix to source documents, FRs, NFRs, BRs, UCs, API endpoints, database tables, and backend modules.

---

## SOURCE DOCUMENTS TO USE

Use all available project documents as source of truth.

At minimum, the document must align with:

```text
/docs/4-Business-Rules-Document.md
/docs/5-User-Roles-Permissions-Matrix.md
/docs/9-Functional-Requirements-Document.md
/docs/10-Non-Functional-Requirements.md
/docs/12-Architecture-Vision-and-Principles.md
/docs/13-System-Architecture-Document.md
/docs/14-Backend-Technical-Design.md
/docs/15-Frontend-Architecture-Design.md
/docs/16-API-Design-Specification.md
/docs/17-AI-Architecture-and-PromptOps-Design.md
/docs/18-Database-Physical-Design.md
```

Also use, when relevant:

```text
/docs/1-Domain-Discovery-Report.md
/docs/2-Product-Owner-Decisions.md
/docs/3-MVP-Scope-Definition.md
/docs/6-Domain-Data-Model.md
/docs/7-AI-Features-Specification.md
/docs/8-Use-Cases-Specification.md
/docs/8.1-Product-Owner-Decisions-Use-Cases-Addendum.md
/docs/8.2-Documentation-Alignment-Review-Before-FRD.md
/docs/11-Data-Seed-Strategy.md
```

Do not invent features, roles, entities, external integrations, compliance obligations, or enterprise security controls that are not justified by the source documentation.

---

## APPROVED SECURITY AND ARCHITECTURE DECISIONS

The generated document must respect these known decisions:

### Authentication

* Authentication is based on **email + password**.
* Public registration allows only `organizer` and `vendor`.
* `admin` users are created only by seed/configuration/internal setup.
* Captcha or anti-bot protection is mandatory for:

  * register
  * login
  * password reset request
* Google OAuth is optional / Could Have, not mandatory for MVP.
* Session strategy is based on a **signed HTTP-only cookie** issued by the backend.
* Cookies must use:

  * `HttpOnly`
  * `Secure`
  * `SameSite=Lax`
  * `Path=/`
* Tokens must not be stored in `localStorage` or `sessionStorage`.
* JWT may only be used as an opaque cookie payload if justified by implementation, never exposed to JavaScript.

### Passwords

* Passwords must be hashed.
* Use `argon2id` as the recommended option.
* `bcrypt` is acceptable if implementation constraints justify it.
* Password hashes must never be logged or exposed.
* Password reset must use one-time-use tokens with expiration.

### Authorization

* Authorization is enforced in the backend.
* Frontend route guards are only UX helpers, not security boundaries.
* Authorization model combines:

  * RBAC
  * ownership-based access
  * assignment-based access
  * admin-scoped access
* Roles:

  * `anonymous`
  * `organizer`
  * `vendor`
  * `admin`
* Public anonymous access is limited to:

  * health check
  * auth endpoints
  * public vendor directory/profile routes
  * read-only event types
  * read-only service categories
* Organizer only manages owned events, tasks, budgets, quote requests, booking intents, reviews, notifications, and AI flows related to owned events.
* Vendor only manages own vendor profile, services, attachments, assigned quote requests, quotes, booking intents, reviews received, and notifications.
* Admin can approve/reject vendors, manage catalogs, moderate reviews, read events in read-only mode, view metrics, execute seed/demo operations if enabled, and audit platform activity.
* Admin actions must be recorded in `AdminAction`.

### Backend security

The Express middleware chain should include:

```text
correlationId
→ securityHeaders
→ cors
→ rateLimit
→ bodyParser / multipart limits
→ authMiddleware
→ roleMiddleware
→ ownershipMiddleware / policyMiddleware
→ validateRequestMiddleware
→ controller
→ errorMiddleware
```

The document must explain what each middleware does and where it belongs.

### API security

The REST API uses:

* `/api/v1` base path.
* JSON by default.
* `multipart/form-data` only for attachments.
* Zod for DTO validation.
* Strict validation with unknown fields rejected.
* Unified error envelope.
* Correlation ID in request/response.
* Rate limiting for sensitive endpoints.
* Safe error messages without stack traces.
* No direct frontend access to OpenAI, Anthropic, PostgreSQL, file storage internals, or secrets.

### Rate limiting

The document must include rate limits aligned with API design:

* `/auth/login`: max 10 attempts per IP per 10 minutes.
* `/auth/register`: max 5 attempts per IP per 10 minutes.
* `/auth/password/reset-request`: max 3 attempts per email per hour.

It may recommend additional MVP-safe rate limits for:

* AI generation endpoints.
* file uploads.
* quote request creation.
* admin seed reset endpoints.

### CSRF and CORS

Because the system uses HTTP-only cookies, the document must define a CSRF mitigation strategy.

For the MVP, recommend:

* `SameSite=Lax` cookies.
* Origin checking for state-changing requests.
* CSRF token strategy if deployment or cross-site use cases require it.
* Strict CORS allowlist by environment.
* No wildcard CORS with credentials.

### File upload security

The document must cover security for attachments and vendor portfolio uploads:

* MIME type allowlist.
* file size limits.
* extension validation.
* metadata persistence in PostgreSQL.
* storage abstraction.
* no executable files.
* no direct public access to raw storage paths without validation.
* soft delete for attachments.
* future malware scanning as out of scope / future.

### AI security

The document must include a dedicated AI security section covering:

* Prompt data minimization.
* No secrets in prompts.
* No payment data, legal IDs, or sensitive credentials sent to LLM.
* Prompt injection risk.
* Output validation with Zod before persistence.
* Human-in-the-loop required before AI output becomes official data.
* AIRecommendation traceability.
* Fallback to MockAIProvider.
* No autonomous provider approval, review moderation, payments, bookings, or contracts.
* Redaction of prompt payloads in logs when needed.
* LLM provider keys only available in backend environment variables.

### Database security

The document must cover:

* Database accessed only by backend.
* No direct DB access from frontend.
* Prisma as the only data access layer.
* PostgreSQL credentials via environment variables.
* Principle of least privilege for DB user.
* Strong constraints and ownership-supporting foreign keys.
* Soft delete where required.
* Audit tables append-only where applicable.
* No PII or secrets in seed data.
* No database triggers/stored procedures unless explicitly justified.

### Seed/demo security

The document must cover:

* Seed users and demo data must not contain real sensitive data.
* `is_seed=true` must allow safe identification and reset.
* Seed reset endpoints must be disabled by default outside demo/dev.
* Seed reset must require admin role.
* Seed reset should log an `AdminAction`.
* Demo credentials must never be production credentials.

### Frontend security

The document must define frontend responsibilities:

* Next.js is not a BFF.
* No Server Actions for business/security enforcement.
* No direct calls to LLM providers or database.
* No token storage in localStorage/sessionStorage.
* Route groups and middleware may provide UX-level protection.
* Sensitive screens must call `/me` or rely on backend session validation.
* UI must hide unavailable actions but backend must still reject unauthorized requests.
* Forms must validate client-side for UX, but backend validation is final.
* AI suggestions must remain visibly unconfirmed until accepted.

---

## DOCUMENT STRUCTURE REQUIRED

Generate the document using this exact structure unless a small adjustment is necessary for coherence:

````markdown
# EventFlow — Security & Authorization Design

> Versión: 1.0
> Fecha: YYYY-MM-DD
> Producto: EventFlow — plataforma asistida por IA para planificación de eventos y gestión simplificada de cotizaciones de proveedores
> MVP target: AI-assisted event planning workspace + simplified vendor quote flow
> Idioma del documento: Español LATAM neutral
> Estado: Draft académico final
> Audiencia: Security Architect, Backend Engineers, Frontend Engineers, QA, DevOps, Product Owner, evaluadores académicos, agentes IA generadores de código y pruebas.

---

## 1. Propósito del documento

## 2. Alcance del documento

### 2.1 Incluye
### 2.2 No incluye

## 3. Fuentes utilizadas

Use a table with source document, security relevance, and concrete usage.

## 4. Resumen ejecutivo de seguridad

## 5. Principios de seguridad del MVP

Include principles such as:
- Backend as source of truth.
- Least privilege.
- RBAC + ownership.
- Secure by default, simple enough for MVP.
- No secrets in frontend.
- Human-in-the-loop for AI.
- Privacy by minimization.
- Auditability where it matters.
- No overengineering.

## 6. Security assumptions and constraints

Include assumptions about:
- Academic MVP.
- Browser-only client.
- No native mobile app.
- No payments.
- No contracts.
- No WhatsApp.
- No real SMTP requirement.
- No formal compliance certification.
- No enterprise SSO/MFA in MVP.

## 7. Threat model for EventFlow MVP

Include:
- protected assets
- actors
- trust boundaries
- likely threats
- abuse cases
- mitigations
- out-of-scope threats

Use a table.

## 8. Security architecture overview

Include a Mermaid diagram showing:

Browser → Next.js frontend → Express API → Application Layer → Prisma → PostgreSQL
                                      → LLMProvider → OpenAI / Mock / Anthropic stub
                                      → File Storage

Show trust boundaries.

## 9. Authentication design

Cover:
- registration
- login
- logout
- password reset
- `/me`
- captcha
- rate limits
- session cookie
- password hashing
- account status if applicable
- admin creation by seed/config only

Include Mermaid sequence diagrams for login and protected request.

## 10. Session and cookie strategy

Include:
- signed HTTP-only cookie
- Secure
- SameSite=Lax
- Path=/
- expiration recommendation
- rotation recommendation
- logout invalidation
- no localStorage/sessionStorage tokens
- CSRF implications

## 11. Password and credential handling

Cover:
- argon2id recommended
- bcrypt acceptable
- password policy for MVP
- reset tokens
- no credential logging
- `.env` handling
- test/demo credentials limitations

## 12. Anti-bot and abuse prevention

Cover:
- captcha in auth flows
- rate limiting
- AI endpoint throttling
- upload throttling
- quote request anti-abuse
- admin seed reset protection

## 13. Authorization model overview

Explain the combination of:
- RBAC
- ownership
- assignment-based access
- contextual policies
- admin audit requirements

Include a conceptual Mermaid diagram.

## 14. Roles and permission boundaries

Define:
- anonymous
- organizer
- vendor
- admin
- system/internal jobs

For each role include:
- allowed capabilities
- denied capabilities
- important security notes

## 15. Ownership model

Define ownership by entity:

- User
- Event
- EventTask
- Budget
- BudgetItem
- VendorProfile
- VendorService
- Attachment
- QuoteRequest
- Quote
- BookingIntent
- Review
- Notification
- AIRecommendation
- AdminAction
- EventType
- ServiceCategory

Use a table:
Entity | Owner | Visibility | Write Access | Admin Access | Notes

## 16. Assignment-based authorization

Explain:
- vendor access to QuoteRequests assigned to own VendorProfile
- Quote ownership and visibility
- BookingIntent visibility
- Review visibility
- Notification visibility

## 17. Admin authorization and audit

Cover:
- admin routes
- read-only event access
- vendor approval/rejection
- catalog management
- review moderation
- seed/demo reset
- metrics access
- AdminAction required
- admin cannot bypass audit

## 18. Authorization policy catalog

Create policy IDs using this format:

```text
SEC-POL-[DOMAIN]-[NUMBER]
````

Examples:

* SEC-POL-AUTH-001
* SEC-POL-EVENT-001
* SEC-POL-VENDOR-001
* SEC-POL-QUOTE-001
* SEC-POL-AI-001
* SEC-POL-ADMIN-001

Each policy must include:

* Policy ID
* Name
* Applies to
* Roles
* Condition
* Enforcement point
* Related BR/FR/UC/API endpoint
* QA notes

## 19. API endpoint authorization matrix

Use the endpoints from the API Design Specification.

Create a table:

Method | Path | Anonymous | Organizer | Vendor | Admin | Ownership / Policy | Notes

Cover at least:

* auth
* users/me
* events
* tasks
* budgets
* vendors
* vendor services
* attachments
* quote requests
* quotes
* booking intents
* reviews
* notifications
* AI endpoints
* admin endpoints
* seed/demo endpoints
* health

## 20. Express middleware security design

Explain:

* correlationId middleware
* securityHeaders middleware
* CORS middleware
* rateLimit middleware
* body parser limits
* multipart upload middleware
* authMiddleware
* roleMiddleware
* ownershipMiddleware
* policyMiddleware
* validateRequestMiddleware
* errorMiddleware

Include recommended order and rationale.

## 21. Frontend security design

Cover:

* Next.js App Router route groups
* public vs app vs admin areas
* frontend route guards as UX only
* `/me` session hydration
* no token storage
* no direct provider calls
* forms with RHF/Zod for UX validation
* backend validation final
* hidden actions not equal security
* AI confirmation UX

## 22. CSRF, CORS, and browser security

Cover:

* SameSite=Lax
* origin validation
* CORS allowlist by environment
* credentials policy
* no wildcard CORS with credentials
* CSRF token future/conditional recommendation
* XSS considerations
* CSP recommendation
* secure headers

## 23. Input validation and payload security

Cover:

* Zod validation at API boundary
* unknown fields rejected
* request size limits
* query param validation
* enum validation
* ID validation
* JSON only by default
* multipart only for attachments
* no raw entity exposure

## 24. File upload and attachment security

Cover:

* allowed types
* file size limits
* filename normalization
* storage keys
* metadata
* soft delete
* access control
* portfolio limits
* no executable files
* future malware scanning

## 25. AI security and prompt privacy

Cover:

* LLMProvider backend-only
* no API keys in frontend
* prompt minimization
* prompt injection mitigation
* output schema validation
* fallback
* human-in-the-loop
* AIRecommendation audit
* redaction in logs
* no autonomous decisions
* no AI moderation of reviews in MVP
* no chatbot general-purpose

## 26. Secrets and environment variable management

Cover:

* DATABASE_URL
* SESSION_SECRET
* CAPTCHA_SECRET
* OPENAI_API_KEY
* LLM_PROVIDER
* AI_TIMEOUT_MS
* CORS_ORIGIN
* SEED_DEMO_ENABLED
* FILE_STORAGE_MODE
* NODE_ENV

Explain which variables are required by environment.

## 27. Logging, audit, and observability security

Cover:

* correlation ID
* structured logs
* no secrets in logs
* no passwords
* no raw LLM secrets
* admin actions
* AI recommendations
* simulated email logs
* failed auth attempts
* rate limit logs
* redaction rules

## 28. Database security design

Cover:

* DB only reachable by backend
* Prisma as access path
* least privilege DB user
* migrations
* soft delete
* constraints
* ownership FKs
* audit tables
* seed data separation
* no payments/contracts/chat tables
* backups as future/DevOps concern

## 29. Security error handling

Define:

* 400 validation error
* 401 unauthenticated
* 403 forbidden
* 404 not found without resource leakage
* 409 conflict
* 413 payload too large
* 415 unsupported media type
* 429 rate limited
* 500 internal error without stack trace

Include safe examples.

## 30. Security testing strategy

Include:

* unit tests for policies
* middleware tests
* integration tests with Supertest
* negative authorization tests
* ownership tests
* admin audit tests
* auth flow tests
* rate limit tests
* captcha mocked tests
* CSRF/CORS tests
* upload security tests
* AI prompt privacy tests
* E2E tests with Playwright
* MSW frontend tests
* seed/demo security tests

## 31. Security checklist for implementation

Create checklist grouped by:

* auth
* session
* authorization
* API
* frontend
* AI
* uploads
* database
* logging
* seed/demo
* testing

## 32. Out of scope for MVP

Explicitly list:

* MFA
* enterprise SSO
* OAuth mandatory
* PCI compliance
* payment security
* contract signing security
* KYC
* automated vendor verification
* malware scanning
* WAF/CDN rules
* SIEM
* SOC 2
* ISO 27001
* GDPR formal compliance
* advanced anomaly detection
* device management
* mobile app security
* real-time chat security
* WhatsApp integration security

## 33. Future security roadmap

Include:

* MFA
* OAuth/Social login hardening
* refresh token rotation if JWT strategy evolves
* CSRF token if needed
* malware scanning
* signed URLs for files
* object storage policies
* WAF
* centralized audit dashboard
* advanced rate limiting
* anomaly detection
* formal privacy/compliance review
* SSO for enterprise/admin
* secret rotation automation

## 34. Recommended ADRs

Create ADR candidates such as:

* ADR-SEC-001: Use HTTP-only signed cookies for sessions.
* ADR-SEC-002: Enforce RBAC + ownership in backend.
* ADR-SEC-003: Use argon2id for password hashing.
* ADR-SEC-004: Apply captcha and rate limiting to auth endpoints.
* ADR-SEC-005: Keep frontend as UX guard only.
* ADR-SEC-006: Keep LLM provider access backend-only.
* ADR-SEC-007: Use soft delete and audit for moderated content.
* ADR-SEC-008: Disable seed reset outside demo/dev.

## 35. Traceability matrix

Create a table:

Security Concern | Source Documents | BR/FR/NFR/UC/API/DB references | Design Decision | Test Evidence

## 36. Open questions and assumptions

Only include open questions if they are real blockers.

If there are no blockers, say:

```text
No existen preguntas abiertas críticas que bloqueen la implementación del Security & Authorization Design para el MVP. Las decisiones pendientes son evolutivas o de implementación menor.
```

## 37. Final readiness checklist

Create a final checklist confirming whether the document is ready to feed:

* Backend implementation.
* Frontend implementation.
* API security tests.
* QA scenarios.
* DevOps environment setup.
* ADR creation.
* User Stories and development tasks.

```

---

## OUTPUT REQUIREMENTS

The final document must:

1. Be written in **Spanish LATAM neutral**.
2. Use professional technical language, but avoid unnecessary enterprise overengineering.
3. Be implementation-ready for a small academic MVP team.
4. Maintain strict traceability to existing documentation.
5. Avoid inventing new features or roles.
6. Clearly distinguish:
   - MVP
   - Future
   - Out of Scope
7. Use tables where useful.
8. Use Mermaid diagrams where useful.
9. Include policy IDs and security control IDs.
10. Include authorization matrices.
11. Include API endpoint authorization coverage.
12. Include backend and frontend responsibilities separately.
13. Include security tests and negative authorization scenarios.
14. Include AI security and prompt privacy.
15. Include seed/demo security.
16. Include ADR recommendations.
17. Include a final readiness checklist.

---

## IMPORTANT GUARDRAILS

Do not introduce:

- Real payments.
- PCI scope.
- Contracts or e-signature security.
- WhatsApp integration.
- Native mobile app security.
- Real-time chat security.
- Enterprise SSO as MVP.
- MFA as MVP.
- Full GDPR/ISO/SOC2 compliance as MVP.
- KYC or automated vendor verification.
- AI autonomous moderation.
- AI autonomous vendor approval.
- AI autonomous booking or contract decisions.
- Vector database / RAG security.
- Microservices security model.
- Multi-tenant enterprise security model.

These can only be mentioned as **Future** or **Out of Scope**.

---

## QUALITY BAR

Before finalizing the document, validate that:

- Authentication design is consistent with HTTP-only cookie session strategy.
- Authorization design uses backend-enforced RBAC + ownership.
- Frontend is clearly not the security source of truth.
- Admin actions are audited.
- AI calls never expose secrets or bypass human validation.
- File uploads are controlled.
- Seed/demo endpoints are protected.
- Error handling does not leak sensitive data.
- All MVP exclusions remain excluded.
- The document can directly feed user stories, implementation tasks, QA tests, and ADRs.
```
