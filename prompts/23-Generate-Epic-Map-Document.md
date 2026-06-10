# AAA Prompt — Generate EventFlow Epic Map Document

## ACT AS

You are a senior Product Manager, Business Analyst, Agile Delivery Lead, and AI-assisted SDLC documentation specialist.

You are working on **EventFlow**, an academic MVP project for the AI4Devs Master Final Project.

EventFlow is an **AI-assisted event planning workspace with a simplified vendor quote flow**, not a full transactional marketplace.

Your task is to generate a new management artifact called:

```text
EventFlow — Epic Map
```

This document must be created and stored in:

```text
/management/artifacts/EventFlow-Epic-Map.md
```

The output language must be **Spanish LATAM neutral**, using clear, professional, implementation-ready language.

---

## AVAILABLE SOURCE DOCUMENTATION

Use the existing EventFlow documentation as the only source of truth.

The Epic Map must be derived from the following documents:

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
/docs/16-API-Design-Specification.md
/docs/17-AI-Architecture-and-PromptOps-Design.md
/docs/18-Database-Physical-Design.md
/docs/19-Security-and-Authorization-Design.md
/docs/20-Testing-Strategy.md
/docs/21-Deployment-and-DevOps-Design.md
/docs/22-Architecture-Decision-Records.md
```

Also consider the user story template:

```text
/management/templates/user-story.tpl.md
```

Do not invent features that are not supported by the documentation.

---

## ACTION

Generate a complete **Epic Map** for EventFlow.

The Epic Map must organize the MVP into clear product, technical, AI, security, QA, DevOps, and demo-ready epics.

The document must help the team move from documentation into:

* User Stories
* Backlog creation
* Sprint planning
* Development tasks
* QA planning
* Demo readiness
* Academic evaluation traceability

The Epic Map must not be a generic agile document. It must be specific to EventFlow and must reflect the current scope, architecture, technical decisions, business rules, use cases, AI features, and MVP exclusions.

---

## ANALYSIS REQUIREMENTS

Before generating the final Epic Map, analyze the documentation and extract:

1. The main MVP product areas.
2. The roles involved:

   * Organizer
   * Vendor
   * Admin
   * System
   * Anonymous user, only where public access applies.
3. The main functional modules from the FRD and Use Cases.
4. The business-critical flows.
5. The AI-assisted capabilities.
6. The authorization and ownership boundaries.
7. The technical architecture epics needed to enable implementation.
8. The testing, seed, deployment, observability, and demo-readiness needs.
9. The explicit out-of-scope areas that must not become epics.
10. Dependencies between epics.

---

## EPIC MAP STRUCTURE

Create the document using this structure:

```markdown
# EventFlow — Epic Map

## 1. Propósito del documento

## 2. Alcance del Epic Map

### 2.1 Incluye
### 2.2 No incluye

## 3. Fuentes utilizadas

## 4. Principios de definición de épicas

## 5. Resumen ejecutivo del Epic Map

## 6. Mapa visual de épicas

## 7. Catálogo de épicas MVP

## 8. Épicas por rol

## 9. Épicas técnicas habilitadoras

## 10. Épicas de IA y PromptOps

## 11. Épicas de seguridad, autorización y privacidad

## 12. Épicas de testing, QA y calidad

## 13. Épicas de DevOps, despliegue y demo readiness

## 14. Épicas futuras y fuera de alcance

## 15. Matriz de trazabilidad

## 16. Dependencias entre épicas

## 17. Priorización sugerida

## 18. Riesgos de planificación

## 19. Criterios de readiness para pasar a User Stories

## 20. Conclusión
```

---

## EPIC FORMAT

Each epic must use the following format:

```markdown
## EPIC-<DOMAIN>-<NUMBER> — <Epic Name>

| Campo | Valor |
|---|---|
| ID | EPIC-<DOMAIN>-<NUMBER> |
| Dominio | <Auth / Events / AI / Vendors / Quotes / Booking / Reviews / Admin / I18N / Notifications / Seed / Platform / Security / QA / DevOps / Demo> |
| Tipo | <Product / Technical / AI / Security / QA / DevOps / Demo> |
| Rol principal | <Organizer / Vendor / Admin / System / Anonymous / Cross-role> |
| Prioridad | <Must Have / Should Have / Could Have / Future / Out of Scope> |
| Alcance | <MVP / Future / Out of Scope> |
| Dependencias | <Other Epic IDs> |
| Fuente principal | <FRD / Use Cases / Business Rules / Architecture / API / Security / Testing / DevOps / ADR> |

### Objetivo
<Describe the purpose of the epic.>

### Resultado esperado
<Describe the business or technical outcome.>

### Capacidades incluidas
- <Capability 1>
- <Capability 2>
- <Capability 3>

### Capacidades excluidas
- <Out-of-scope capability 1>
- <Out-of-scope capability 2>

### User Stories candidatas
- US-<placeholder>: <Candidate story title>
- US-<placeholder>: <Candidate story title>

### Reglas y restricciones relevantes
- <BR / FR / UC / NFR / ADR reference>
- <BR / FR / UC / NFR / ADR reference>

### Consideraciones de QA
- <Validation or testing consideration>

### Consideraciones técnicas
- <Architecture, API, DB, frontend, backend, security, or AI note>

### Criterios de completion de la épica
- <Completion criterion 1>
- <Completion criterion 2>
- <Completion criterion 3>
```

---

## REQUIRED EPIC DOMAINS

At minimum, include epics for the following areas if supported by the documentation:

### Product / Functional Epics

1. Authentication & User Access
2. Organizer Event Management
3. AI-Assisted Event Planning
4. Checklist & Task Management
5. Budget Management
6. Vendor Directory & Vendor Profile
7. Quote Request & Quote Response Flow
8. Quote Comparison & Booking Intent
9. Reviews & Moderation
10. Notifications
11. Admin Governance
12. Internationalization & Currency
13. Seed Data & Demo Scenarios

### Technical Epics

14. Backend Modular Monolith Foundation
15. REST API Contract Implementation
16. Database & Prisma Physical Model
17. Frontend Next.js Application Foundation
18. Security & Authorization Enforcement
19. AI Architecture & PromptOps
20. Testing & Quality Gates
21. Deployment & DevOps on AWS
22. Observability, Audit & Traceability

### Demo / Academic Delivery Epics

23. Demo Readiness Flow
24. Academic Traceability & Documentation Alignment

---

## SCOPE GUARDRAILS

The Epic Map must explicitly prevent scope creep.

Do not create MVP epics for:

* Real payments
* Commissions
* Contracts or electronic signatures
* WhatsApp integration
* Real-time chat
* Native mobile app
* Multi-user event collaboration
* RSVP / guest list management
* Table seating
* AI autonomous decision-making
* AI automatic moderation
* AI image generation
* Vector databases / RAG
* Multi-tenant enterprise architecture
* Kubernetes
* Microservices
* Advanced compliance such as PCI, SOC 2, ISO 27001, GDPR formal certification

These may only appear under **Future** or **Out of Scope**, never as MVP epics.

---

## TRACEABILITY REQUIREMENTS

For every epic, include traceability to the most relevant sources.

Use references such as:

* FR-AUTH-001
* UC-EVENT-001
* BR-AI-001
* NFR-SEC-001
* ADR-ARCH-001
* API endpoint groups
* Data entities
* Frontend route groups
* Backend modules
* Testing strategy categories

If an exact ID is not available, reference the document and section conceptually, but do not invent fake IDs.

---

## PRIORITIZATION REQUIREMENTS

Include a prioritization section with:

1. Suggested delivery order.
2. MVP critical path.
3. Dependencies.
4. Demo-critical epics.
5. Technical foundation epics that must happen before product epics.
6. Epics that can be deferred if time is limited.

Use this priority model:

```text
P0 — Foundation / blocking
P1 — MVP critical
P2 — MVP important
P3 — Demo polish
P4 — Future / out of scope
```

---

## OUTPUT FORMAT

Generate the final document in clean Markdown.

The document must be ready to be saved as:

```text
/management/artifacts/EventFlow-Epic-Map.md
```

Use tables where useful.

Use Mermaid diagrams where helpful, especially for:

1. Epic dependency map.
2. MVP critical path.
3. Role-to-epic mapping.

Use concise but complete descriptions.

Avoid unnecessary filler.

---

## ACCEPTANCE CRITERIA

The generated Epic Map is acceptable only if:

1. It is specific to EventFlow.
2. It is aligned with the MVP scope.
3. It does not introduce unsupported features.
4. It separates product epics from technical epics.
5. It includes AI, security, testing, DevOps, seed, and demo readiness epics.
6. It includes candidate user stories per epic.
7. It includes dependencies between epics.
8. It includes traceability to source documentation.
9. It marks future and out-of-scope areas clearly.
10. It is implementation-ready for backlog generation.
11. It uses Spanish LATAM neutral.
12. It can be saved directly under `/management/artifacts/EventFlow-Epic-Map.md`.

---

## FINAL INSTRUCTION

Generate the complete `EventFlow — Epic Map` document now.

Do not ask for additional clarification unless there is a real blocker.

If information is missing, make a reasonable assumption, mark it explicitly as `Assumption`, and keep the Epic Map aligned with the MVP documentation.
