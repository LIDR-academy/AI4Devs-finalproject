# AAA Prompt — Frontend Architecture Design Document for EventFlow

## ACT AS

You are a **Senior Frontend Architect, Technical Lead, UX-aware Software Architect, and AI-assisted SDLC Documentation Specialist**.

You specialize in designing scalable, maintainable, SEO-aware, production-ready frontend architectures for modern responsive web applications. You have strong experience with:

* Next.js.
* TypeScript.
* App Router.
* Server Components and Client Components boundaries.
* Public SEO-ready pages.
* Authenticated dashboards.
* Feature-first frontend architecture.
* REST API integration.
* Authentication and protected routing.
* RBAC and ownership-aware frontend UX.
* i18n and localization.
* Design systems and reusable UI foundations.
* State management strategies.
* Form architecture and validation.
* AI-assisted user experiences.
* Accessibility and responsive design.
* Frontend testing strategy.
* Clean separation between UI, application state, API clients, domain mappers, frontend models, and shared components.
* Translating backend and system architecture documents into frontend implementation guidance.

You are working on **EventFlow**, an AI-assisted event planning platform for an academic Master Final Project.

EventFlow MVP is defined as:

```text
AI-assisted event planning workspace + simplified vendor quote flow
```

The system already has:

* Domain Discovery Report.
* Product Owner Decisions.
* MVP Scope Definition.
* Business Rules Document.
* User Roles & Permissions Matrix.
* Domain Data Model.
* AI Features Specification.
* Use Cases Specification.
* Functional Requirements Document.
* Non-Functional Requirements.
* Data Seed Strategy.
* Architecture Vision & Principles.
* System Architecture Document.
* Backend Technical Design Document.

You must now generate the next technical artifact:

```text
/docs/15-Frontend-Architecture-Design.md
```

The document must be written in **Spanish LATAM neutral**, but the analysis and reasoning behind the document must follow professional frontend architecture standards.

---

## ASK

Generate a complete **Frontend Architecture Design Document** for EventFlow.

The document must translate the already-defined system architecture and backend technical design into a concrete frontend architecture that can guide implementation.

The document must define:

1. Purpose and scope of the frontend architecture.
2. Source documents used.
3. Frontend architectural vision.
4. Required frontend stack decision.
5. Next.js architecture strategy.
6. App Router strategy.
7. Public vs authenticated frontend areas.
8. SEO-ready vendor profile and portfolio strategy.
9. Frontend application structure.
10. Feature-first folder organization.
11. Routing architecture.
12. Route groups and layout hierarchy.
13. Layout architecture.
14. Authentication and session handling.
15. Authorization strategy for RBAC + ownership-aware UI.
16. API integration strategy with the REST backend.
17. DTO, API client, mapper, and frontend model strategy.
18. State management strategy.
19. Server state vs client state boundaries.
20. Form architecture and validation.
21. Error handling and empty states.
22. Loading states and skeleton strategy.
23. AI-assisted UX patterns.
24. Human-in-the-loop frontend flows for AI suggestions.
25. i18n and localization strategy.
26. Currency display strategy without automatic conversion.
27. Responsive design strategy.
28. Accessibility strategy.
29. Design system and UI component architecture.
30. Page and feature module responsibilities.
31. Frontend architecture per role:

    * Organizer.
    * Vendor.
    * Admin.
32. Frontend architecture per public SEO area:

    * Public vendor profile pages.
    * Public vendor portfolio pages.
    * Future category/city landing pages.
    * Future public service discovery pages.
33. Frontend architecture per MVP module:

    * Auth.
    * User profile.
    * Events.
    * AI assistance.
    * Tasks.
    * Budget.
    * Vendor profile.
    * Vendor directory.
    * Quote requests.
    * Quotes.
    * Booking intent.
    * Reviews.
    * Notifications.
    * Admin dashboard.
    * Seed/demo support.
34. Data fetching, caching, invalidation, and optimistic update rules.
35. File upload / attachment handling from the frontend perspective.
36. Notification UI strategy.
37. Observability from the frontend:

    * user-facing errors,
    * frontend logs,
    * correlation IDs,
    * API error tracking,
    * AI fallback visibility.
38. Security considerations in the frontend:

    * route protection,
    * token/session handling,
    * no sensitive data in localStorage when avoidable,
    * captcha integration,
    * role-based rendering as UX only,
    * backend remains source of truth.
39. Testing strategy:

    * unit tests,
    * component tests,
    * integration tests,
    * E2E tests,
    * accessibility tests,
    * mocked API and MockAIProvider scenarios.
40. Performance strategy:

    * route-level rendering decisions,
    * static generation where appropriate,
    * server rendering where appropriate,
    * client rendering where required,
    * code splitting,
    * lazy loading,
    * bundle boundaries,
    * caching,
    * avoiding unnecessary re-renders,
    * perceived performance.
41. Environment configuration.
42. Demo readiness strategy.
43. Explicit MVP exclusions from the frontend.
44. Risks and mitigations.
45. Recommended ADRs related to frontend.
46. Implementation checklist.
47. Traceability matrix to FRD, NFR, Use Cases, System Architecture, and Backend Technical Design.

The document must be detailed enough for:

* Frontend developers.
* Tech leads.
* QA engineers.
* AI coding agents.
* Academic evaluators.
* Future user story and task generation.

---

## ADDITIONAL CONTEXT

Use the following architectural constraints as mandatory.

---

### Product and MVP constraints

EventFlow is not a transactional marketplace in the MVP.

The frontend must support:

* Responsive web application only.
* Organizer workspace.
* Vendor workspace.
* Admin panel.
* AI-assisted planning flows.
* Simplified quote flow.
* In-app notifications.
* Simulated email visibility where relevant.
* Demo-ready flows using seed data.
* Future-ready public vendor profile and portfolio URLs.

The frontend must not introduce or imply support for:

* Native mobile app.
* Real payments.
* Commissions.
* Signed contracts.
* Real-time chat.
* WhatsApp integration.
* SMS or push notifications.
* Automatic currency conversion.
* AI autonomous decisions.
* AI moderation.
* Provider ranking/matching by AI.
* Multi-user collaboration per event.

---

### System architecture constraints

EventFlow architecture is:

```text
Responsive Web Frontend
→ REST API Backend
→ Modular Monolith Backend with Clean/Hexagonal Architecture
→ PostgreSQL
→ LLMProvider abstraction
```

The frontend must consume the backend through REST APIs only.

The frontend must not directly call:

* OpenAI.
* Anthropic.
* PostgreSQL.
* Email services.
* File storage services directly unless explicitly mediated by backend contracts.

All AI features are backend-mediated.

---

### Required frontend stack decision

The frontend architecture must be based on:

```text
Next.js + TypeScript
Next.js App Router
```

This is a **Product Owner / Architecture decision**.

The rationale is that EventFlow is not only an authenticated planning workspace. It can naturally evolve into a public vendor discovery and portfolio platform where vendors can share public URLs for their profiles and portfolios.

Therefore, the frontend architecture must support both:

1. **Authenticated application areas:**

   * Organizer workspace.
   * Vendor workspace.
   * Admin panel.

2. **Public SEO-ready areas:**

   * Public vendor profile pages.
   * Public vendor portfolio pages.
   * Future category/city landing pages.
   * Future public event service discovery pages.

Use the following frontend stack baseline:

```text
Next.js
TypeScript
Next.js App Router
TanStack Query
React Hook Form
Zod
next-intl
Tailwind CSS + design tokens
Vitest + Testing Library
Playwright
MSW
```

Do **not** recommend React + Vite as the primary option.

You may mention React + Vite only as an evaluated alternative that was discarded because EventFlow benefits from:

* SEO-ready public vendor portfolio pages.
* Public profile URLs.
* Metadata management.
* Open Graph previews.
* Route-level rendering strategies.
* Future public directory growth.
* The ability to combine public pages and authenticated dashboards in the same frontend architecture.

---

### Next.js architecture constraints

The document must explicitly define how EventFlow uses Next.js.

Address at least:

* App Router route groups.
* Public routes.
* Authenticated private routes.
* Role-based route areas.
* Layout nesting.
* Metadata strategy.
* Dynamic routes for vendor profiles.
* Dynamic routes for vendor portfolio pages.
* Loading UI.
* Error boundaries.
* Not found pages.
* Client Component boundaries.
* Server Component usage where appropriate.
* Server Actions decision: use or avoid, and why.
* API route handlers decision: use or avoid, and why.
* Middleware usage for auth/session checks where appropriate.
* Route protection strategy.
* SEO strategy for public pages.
* Open Graph and social sharing strategy for vendor profile URLs.

The frontend must still treat the backend REST API as the source of truth.

Next.js should not replace backend responsibilities.

---

### Public SEO-ready areas

Even if public vendor portfolio pages are not fully implemented in the MVP, the architecture must be prepared for them.

Define a future-ready structure for:

```text
/(public)/vendors/[vendorSlug]
/(public)/vendors/[vendorSlug]/portfolio
/(public)/vendors/[vendorSlug]/portfolio/[workSlug]
/(public)/services/[categorySlug]
/(public)/services/[categorySlug]/[citySlug]
```

Clarify which routes are MVP, Should Have, Future, or Out of Scope.

The MVP can include vendor directory and vendor profile viewing, but the architecture should not block future SEO expansion.

Public SEO pages must not expose private organizer event data.

---

### Backend alignment constraints

The backend is organized around application use cases, REST controllers, DTOs, authorization policies, AI provider abstraction, notifications, attachments, jobs, observability, and seed/demo support.

The frontend must align with this backend design by defining:

* API clients per module.
* Request/response DTO handling.
* Frontend mappers.
* Error response handling.
* Authenticated request handling.
* Correlation ID propagation if applicable.
* Consistent loading, success, empty, and error states.
* Clear API boundary ownership.
* File upload boundaries.
* AI request/response boundaries.

---

### Roles

The MVP has three active roles:

```text
organizer
vendor
admin
```

The frontend must clearly define route groups, navigation, dashboards, allowed screens, and restricted UI behaviors for each role.

Remember:

* Frontend role guards improve UX.
* Backend authorization remains the source of truth.
* Never assume hiding UI is enough security.

---

### AI frontend principles

AI in EventFlow is a copiloto, not an autonomous agent.

Frontend AI UX must support:

* Generate suggestion.
* Show loading state.
* Show timeout/fallback/error state.
* Display generated suggestion as editable.
* Allow accept, edit, regenerate, or discard.
* Clearly distinguish AI-generated suggestions from official confirmed data.
* Prevent AI output from becoming official until explicit user confirmation.
* Show fallback usage where relevant for demo/testing.
* Support MockAIProvider demo flows.

AI features include:

* Event plan generation.
* Checklist generation.
* Budget suggestion.
* Vendor category recommendation.
* Quote brief generation.
* Quote comparison summary.
* Vendor bio/package description generation.
* Urgent task prioritization.

The frontend must never let AI silently mutate official event data.

---

### i18n and currency

The frontend must support:

```text
es-LATAM
es-ES
pt
en
```

Currency is configured per event and cannot be changed after event creation.

The frontend must:

* Display event currency consistently.
* Never perform automatic currency conversion.
* Prevent or disable currency editing after event creation.
* Show clear user feedback explaining immutability.
* Pass the selected language to backend-mediated AI flows where required.
* Support localized public SEO metadata in the future.

---

### Recommended stack baseline

Use this stack as the target frontend architecture:

| Concern                | Technology                   |
| ---------------------- | ---------------------------- |
| Framework              | Next.js                      |
| Language               | TypeScript                   |
| Routing                | Next.js App Router           |
| Server state           | TanStack Query               |
| Forms                  | React Hook Form              |
| Validation             | Zod                          |
| i18n                   | next-intl                    |
| Styling                | Tailwind CSS + design tokens |
| Unit/component testing | Vitest + Testing Library     |
| E2E testing            | Playwright                   |
| API mocking            | MSW                          |
| Linting/formatting     | ESLint + Prettier            |
| Package scripts        | npm scripts or pnpm scripts  |
| Runtime config         | Environment variables        |

If you recommend a different supporting library for a specific concern, justify why.

Do not over-engineer.

Prefer the simplest architecture that remains scalable, SEO-aware, testable, and aligned with the backend.

---

## ANSWER FORMAT

Generate the final document in **Spanish LATAM neutral**.

Use this exact structure:

```markdown
# EventFlow — Frontend Architecture Design Document

> Versión:
> Fecha:
> Producto:
> MVP target:
> Idioma del documento:
> Estado:
> Audiencia:

## 1. Propósito del documento

## 2. Alcance del documento

### 2.1 Incluye

### 2.2 No incluye

## 3. Fuentes utilizadas

## 4. Resumen ejecutivo de arquitectura frontend

## 5. Decisión arquitectónica frontend principal

## 6. Principios de diseño frontend

## 7. Stack frontend definido

## 8. Justificación de Next.js para EventFlow

## 9. Alternativas evaluadas y descartadas

## 10. Arquitectura frontend general

## 11. Next.js App Router strategy

## 12. Server Components vs Client Components strategy

## 13. Public vs authenticated frontend areas

## 14. SEO-ready public vendor architecture

## 15. Estructura de carpetas propuesta

## 16. Feature-first architecture

## 17. Routing architecture

## 18. Route groups y layout hierarchy

## 19. Layout architecture

## 20. Navegación por rol

## 21. Autenticación y sesión

## 22. Autorización frontend: RBAC + ownership-aware UX

## 23. Integración con REST API backend

## 24. DTOs, API clients, mappers y frontend models

## 25. Estrategia de estado

### 25.1 Server state

### 25.2 Client/UI state

### 25.3 Form state

### 25.4 Auth/session state

## 26. Data fetching, caching e invalidación

## 27. Arquitectura de formularios y validación

## 28. Manejo de errores, empty states y loading states

## 29. AI-assisted UX architecture

## 30. Human-in-the-loop AI flows

## 31. i18n y localización

## 32. Estrategia de currency display

## 33. Responsive design

## 34. Accesibilidad

## 35. Design system y componentes UI

## 36. Page architecture por rol

### 36.1 Organizer frontend area

### 36.2 Vendor frontend area

### 36.3 Admin frontend area

## 37. Public SEO page architecture

### 37.1 Public vendor profile pages

### 37.2 Public vendor portfolio pages

### 37.3 Future category/city landing pages

### 37.4 Public metadata and Open Graph strategy

## 38. Page architecture por módulo MVP

### 38.1 Auth

### 38.2 User profile

### 38.3 Events

### 38.4 AI assistance

### 38.5 Tasks

### 38.6 Budget

### 38.7 Vendor profile

### 38.8 Vendor directory

### 38.9 Quote requests

### 38.10 Quotes

### 38.11 Booking intent

### 38.12 Reviews

### 38.13 Notifications

### 38.14 Admin dashboard

### 38.15 Seed/demo support

## 39. File upload y attachments

## 40. Notification UI strategy

## 41. Observabilidad frontend

## 42. Seguridad frontend

## 43. Testing strategy frontend

## 44. Performance strategy

## 45. Environment configuration

## 46. Demo readiness

## 47. Límites explícitos del MVP en frontend

## 48. Riesgos y mitigaciones

## 49. ADRs recomendados

## 50. Checklist de implementación frontend

## 51. Matriz de trazabilidad

## 52. Conclusión
```

Each section must be substantive and specific to EventFlow.

Avoid generic frontend advice.

Use tables where useful.

Include Mermaid diagrams where useful, especially for:

1. Frontend container/module overview.
2. Next.js route hierarchy.
3. Public vs authenticated route groups.
4. AI human-in-the-loop frontend flow.
5. API integration flow.
6. State ownership diagram.
7. SEO-ready vendor profile flow.

---

## QUALITY BAR

The output must:

* Be specific to EventFlow.
* Be consistent with the already defined backend and system architecture.
* Treat Next.js + TypeScript + App Router as a closed architecture decision.
* Justify Next.js based on future public vendor portfolio URLs and SEO needs.
* Not contradict the MVP scope.
* Not introduce out-of-scope features.
* Clearly separate frontend responsibilities from backend responsibilities.
* Treat frontend authorization as UX protection, not security enforcement.
* Define how frontend communicates with backend APIs.
* Define how AI suggestions appear and are confirmed in UI.
* Define clear page/feature responsibilities.
* Define which public SEO routes are MVP, Should Have, Future, or Out of Scope.
* Define how public vendor pages avoid leaking private event or quote data.
* Be implementation-ready.
* Be useful for generating user stories, frontend tasks, QA scenarios, and AI coding tasks.
* Be written in Spanish LATAM neutral.
* Use professional technical language but remain understandable.
* Include explicit traceability to the existing documentation.
s