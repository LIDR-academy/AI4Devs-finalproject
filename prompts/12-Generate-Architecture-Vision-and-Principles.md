# AAA Prompt — Generate Architecture Vision & Principles Document for EventFlow

## ACT — Role / Context / Expertise

Act as a **Senior Software Architect, AI Product Architect, Technical Lead, and Solution Designer** specialized in SaaS platforms, AI-assisted products, modular systems, scalable backend architecture, maintainable frontend architecture, role-based security, domain-driven design, clean architecture, and end-to-end academic software projects.

You are working on **EventFlow**, the final project for the **AI4Devs Master Program**.

EventFlow is a **responsive web platform assisted by AI for event planning and simplified vendor quote management**. The MVP must be designed as an:

```text
AI-assisted event planning workspace + simplified vendor quote flow
```

It must **not** become a full transactional marketplace in the MVP.

The project already has strong Planning and Analysis documentation from the SDLC process, including:

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

Use these documents as the **single source of truth**.

Do not invent functionality outside the documented MVP. Do not add real payments, digital contracts, WhatsApp integration, real-time chat, native mobile apps, AI-based automatic moderation, automatic currency conversion, multi-collaborator event management, or a full transactional marketplace.

The architecture must respect the following documented decisions:

* The MVP is an **AI-assisted planning workspace**, not a full marketplace.
* AI acts as an **assistive copilot**, not as an autonomous decision-maker.
* Every AI output requires **explicit human validation** before becoming official data.
* The system must use an `LLMProvider` abstraction.
* `OpenAIProvider` is the main functional AI provider for the MVP.
* `MockAIProvider` is mandatory for testing, fallback, and demo reproducibility.
* `AnthropicProvider` may remain as a stub or future implementation.
* The MVP must support the roles `organizer`, `vendor`, and `admin`.
* Authorization must combine RBAC and ownership-based access control.
* The MVP must support `es-LATAM`, `es-ES`, `pt`, and `en`.
* Event currency is configured during event creation and must not support automatic currency conversion.
* Seed data must support a reproducible academic demo.
* The backend must be robust, modular, testable, and prepared for future growth.
* The frontend must grow by features without becoming fragile, tightly coupled, or hard to maintain.

---

## ASK — Task / Instructions

Generate the full content for the following document:

```text
/docs/12-Architecture-Vision-and-Principles.md
```

The document must define the **initial architecture vision** for EventFlow and act as the bridge between the existing functional analysis documentation and the next technical design documents:

* System Architecture Document
* Backend Technical Design
* Frontend Architecture Design
* API Design Specification
* AI Architecture & PromptOps Design
* Database Physical Design
* Security & Authorization Design
* Testing Strategy
* Deployment & DevOps Design
* ADR Log
* User Stories, Product Backlog, and Development Tasks

The document must clearly answer:

1. What architecture style is recommended for EventFlow MVP?
2. Why is this architecture the best fit for the documented scope?
3. What architecture alternatives were considered and rejected?
4. What architectural principles must guide the implementation?
5. What are the technical boundaries of the MVP?
6. How should backend, frontend, database, and AI capabilities be organized?
7. How can the system preserve future scalability without overengineering the MVP?
8. What decisions should be captured later as ADRs?
9. What technical risks must be monitored?
10. What technical documents should be generated next?

You must explicitly recommend the following architecture:

```text
Modular Monolith + Clean Architecture / Hexagonal Architecture + PostgreSQL + REST API + LLMProvider abstraction
```

Justify this recommendation by comparing it against these alternatives:

* Simple monolith
* Modular monolith
* Microservices
* Serverless-first architecture
* Backend-as-a-Service-only approach
* Full event-driven architecture

Make it clear that **microservices are not recommended for the MVP**, but that the internal modular design should allow future extraction of selected modules if the product grows.

---

## AIM — Output / Format / Quality Bar

The generated document must be written in **Spanish LATAM neutral**, even though this prompt is written in English.

Use a professional, technical, clear, and structured tone.

The document must be detailed enough for a technical team or an AI agent to use it as the foundation for the next architecture and technical design documents.

Use Markdown format.

The document must follow this required structure:

```markdown
# EventFlow — Architecture Vision & Principles

> Versión:
> Fecha:
> Producto:
> MVP target:
> Idioma:
> Estado:
> Audiencia:

---

## 1. Propósito del documento

## 2. Alcance del documento

### 2.1 Incluye

### 2.2 No incluye

## 3. Fuentes utilizadas

## 4. Contexto arquitectónico del producto

## 5. Resumen ejecutivo de la visión arquitectónica

## 6. Decisión arquitectónica principal

### 6.1 Arquitectura recomendada

### 6.2 Justificación

### 6.3 Decisión resumida

## 7. Alternativas arquitectónicas evaluadas

### 7.1 Monolito simple

### 7.2 Modular Monolith

### 7.3 Microservicios

### 7.4 Serverless-first

### 7.5 Backend-as-a-Service-only

### 7.6 Event-driven architecture completa

### 7.7 Tabla comparativa de alternativas

## 8. Principios arquitectónicos

### 8.1 Domain-first architecture

### 8.2 Modularidad antes que distribución

### 8.3 IA desacoplada del dominio

### 8.4 Human-in-the-loop by design

### 8.5 Security and ownership by default

### 8.6 Demo readiness

### 8.7 Testability first

### 8.8 Observabilidad y trazabilidad

### 8.9 Internacionalización desde el inicio

### 8.10 No overengineering

## 9. Vista conceptual de arquitectura

Include a high-level Mermaid diagram.

## 10. Capas lógicas recomendadas

### 10.1 Presentation Layer

### 10.2 API / Interface Layer

### 10.3 Application Layer

### 10.4 Domain Layer

### 10.5 Infrastructure Layer

### 10.6 AI Provider Layer

### 10.7 Persistence Layer

## 11. Módulos backend recomendados

Include a table with:

- Module
- Responsibility
- Main entities
- Critical rules
- Technical risks

The minimum backend modules are:

- Auth & Identity
- Users & Preferences
- Event Planning
- Tasks
- Budget
- Vendor Management
- Service Categories
- Quote Flow
- Booking Intent
- Reviews & Moderation
- Notifications
- AI Assistance
- Admin & Governance
- Seed & Demo

## 12. Arquitectura frontend recomendada

### 12.1 Principios frontend

### 12.2 Estructura feature-first

### 12.3 Routing y guards

### 12.4 Manejo de estado

### 12.5 i18n frontend

### 12.6 Componentes compartidos y design system

### 12.7 UX para salidas IA

## 13. Arquitectura de IA recomendada

### 13.1 LLMProvider abstraction

### 13.2 OpenAIProvider

### 13.3 MockAIProvider

### 13.4 AnthropicProvider stub

### 13.5 Prompt versioning

### 13.6 AIRecommendation persistence

### 13.7 Fallback and timeout strategy

### 13.8 Human validation flow

## 14. Persistencia y base de datos

### 14.1 Recomendación principal

### 14.2 PostgreSQL como base relacional

### 14.3 Prisma ORM

### 14.4 Índices y constraints

### 14.5 Soft delete y auditoría

## 15. Seguridad y autorización

### 15.1 Authentication

### 15.2 RBAC

### 15.3 Ownership-based access

### 15.4 Admin auditability

### 15.5 Captcha / anti-bot

### 15.6 Privacy by minimization

## 16. Observabilidad, auditoría y trazabilidad

## 17. Testing strategy desde arquitectura

## 18. Deployment y ambientes

## 19. Límites explícitos del MVP

Include a table of out-of-scope capabilities and the architectural reason why they must not be included.

The table must include at least:

- Real payments
- Digital contracts
- WhatsApp integration
- Real-time chat
- Native mobile app
- AI moderation
- AI autonomous vendor approval
- Automatic currency conversion
- Multi-collaborator event management
- Full marketplace transactions

## 20. Escalabilidad futura

### 20.1 Qué queda preparado para crecer

### 20.2 Qué módulos podrían extraerse en el futuro

### 20.3 Cuándo considerar microservicios

### 20.4 Cuándo considerar event-driven architecture

## 21. Riesgos técnicos y mitigaciones

Include a table with:

- Risk
- Impact
- Probability
- Mitigation
- Related document or rule

## 22. ADRs recomendados

List the Architecture Decision Records that should be created after this document.

At minimum include:

- ADR-001: Choose Modular Monolith for MVP
- ADR-002: Use Clean/Hexagonal Architecture
- ADR-003: Use PostgreSQL as primary database
- ADR-004: Use REST API for MVP
- ADR-005: Use LLMProvider abstraction
- ADR-006: Use OpenAIProvider + MockAIProvider
- ADR-007: Keep AnthropicProvider as stub/future
- ADR-008: Avoid microservices in MVP
- ADR-009: Use ownership-based authorization
- ADR-010: Use seed-based demo strategy

## 23. Documentos técnicos siguientes

Include the recommended next documents and their purpose:

- `/docs/13-System-Architecture-Document.md`
- `/docs/14-Backend-Technical-Design.md`
- `/docs/15-Frontend-Architecture-Design.md`
- `/docs/16-API-Design-Specification.md`
- `/docs/17-AI-Architecture-and-PromptOps-Design.md`
- `/docs/18-Database-Physical-Design.md`
- `/docs/19-Security-and-Authorization-Design.md`
- `/docs/20-Testing-Strategy.md`
- `/docs/21-Deployment-and-DevOps-Design.md`
- `/docs/22-Architecture-Decision-Records.md`

## 24. Criterios de calidad del documento

## 25. Checklist de readiness arquitectónico

## 26. Conclusión
```

Additional requirements:

* Use tables where they improve clarity.
* Use Mermaid diagrams where useful.
* Use clear architectural language, but avoid unnecessary enterprise jargon.
* Keep the MVP realistic and buildable.
* Do not propose microservices as the MVP architecture.
* Do not propose marketplace features outside the documented scope.
* Do not introduce external integrations that are out of scope.
* Do not add unsupported product assumptions.
* Preserve traceability with the existing documentation.
* Make clear which recommendations are MVP, Future, or Out of Scope.
* The outcome must be ready to be saved directly as `/docs/12-Architecture-Vision-and-Principles.md`.
