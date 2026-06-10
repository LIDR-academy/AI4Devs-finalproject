# AAA Prompt — Generate Business Rules Document for EventFlow

## ACT — Role and Context

You are a Senior Business Analyst, Product Manager, Domain Analyst, and Functional Documentation Specialist.

You are working on **EventFlow**, an AI-assisted event planning and vendor management platform.

EventFlow helps event organizers create structured event plans, generate AI-assisted checklists, manage event budgets, discover vendors, request quotes, compare vendor responses, and track event progress.

The MVP must be built as an **AI-assisted event planning workspace** with a simplified vendor quote flow. It must **not** become a full transactional marketplace in v1.

You must generate a formal **Business Rules Document** based only on the existing project documentation located in:

- `/docs/1-Domain-Discovery-Report.md`
- `/docs/2-Product-Owner-Decisions.md`
- `/docs/3-MVP-Scope-Definition.md`

These documents are the source of truth.

Do not invent product scope that contradicts these documents.

If a rule is not explicitly defined but can be reasonably inferred, mark it as **Assumption** or **Recommended Rule**.

---

## AIM — Objective

Generate a complete **Business Rules Document** for EventFlow.

The document must define all important business rules that govern the MVP behavior, including:

- User roles and permissions
- Event ownership
- Event lifecycle
- Event task lifecycle
- AI-generated recommendations
- Budget management
- Vendor profile visibility
- Vendor onboarding
- Quote request rules
- Quote response rules
- Quote comparison rules
- Booking intent rules
- Review and moderation rules
- Notification rules
- Language and currency rules
- Seed data rules
- Admin governance rules
- Out-of-scope business rules for future versions

The goal is to create a document that can be used later by:

- Product Owner
- Business Analyst
- Development team
- QA team
- AI agents generating user stories
- AI agents generating test cases
- AI agents generating the FRD
- AI agents generating acceptance criteria

The document must be precise, structured, testable, and useful for software development.

---

## ACTION — Instructions

Read and analyze the three source documents:

1. `/docs/1-Domain-Discovery-Report.md`
2. `/docs/2-Product-Owner-Decisions.md`
3. `/docs/3-MVP-Scope-Definition.md`

Then generate the document:

```text
/docs/4-Business-Rules-Document.md
````

The output must be written in **Spanish LATAM**.

Use a professional Product / Business Analyst tone.

Use clear tables and IDs for each business rule.

Every business rule must have:

* Rule ID
* Rule name
* Description
* Applies to
* Priority
* MVP/Future classification
* Source or rationale
* Validation notes when relevant

Use this priority scale:

```text
Must Have / Should Have / Could Have / Future
```

Use this classification:

```text
MVP / Future / Out of Scope
```

Use this source type:

```text
Explicit / Derived / Assumption / Recommended
```

---

## Required Output Structure

Generate the document using this exact structure:

```markdown
# EventFlow — Business Rules Document

## 1. Propósito del documento

## 2. Alcance del documento

## 3. Fuentes utilizadas

## 4. Principios generales de reglas de negocio

## 5. Resumen ejecutivo de reglas críticas

## 6. Convenciones de identificación

## 7. Reglas de roles y permisos

## 8. Reglas de usuarios

## 9. Reglas de eventos

## 10. Reglas de tipos de evento

## 11. Reglas de planificación asistida por IA

## 12. Reglas de checklist y tareas

## 13. Reglas de presupuesto y moneda

## 14. Reglas de proveedores

## 15. Reglas de servicios y categorías

## 16. Reglas de solicitudes de cotización

## 17. Reglas de respuestas de cotización

## 18. Reglas de comparación de cotizaciones

## 19. Reglas de booking intent simulado

## 20. Reglas de reseñas y moderación

## 21. Reglas de notificaciones

## 22. Reglas de idioma e internacionalización

## 23. Reglas de datos seed y demo

## 24. Reglas de administración y auditoría

## 25. Reglas de privacidad y buenas prácticas

## 26. Reglas fuera de alcance para el MVP

## 27. Reglas futuras recomendadas

## 28. Matriz consolidada de reglas de negocio

## 29. Reglas críticas para QA y aceptación

## 30. Preguntas abiertas o decisiones pendientes

## 31. Resumen final
```

---

## Business Rule ID Format

Use the following ID format:

```text
BR-[DOMAIN]-[NUMBER]
```

Examples:

```text
BR-AUTH-001
BR-USER-001
BR-EVENT-001
BR-AI-001
BR-TASK-001
BR-BUDGET-001
BR-VENDOR-001
BR-QUOTE-001
BR-BOOKING-001
BR-REVIEW-001
BR-ADMIN-001
BR-I18N-001
BR-SEED-001
```

Use these domain prefixes:

| Prefix       | Domain                             |
| ------------ | ---------------------------------- |
| BR-AUTH      | Authentication and authorization   |
| BR-USER      | Users                              |
| BR-EVENT     | Events                             |
| BR-EVENTTYPE | Event types                        |
| BR-AI        | AI-assisted planning               |
| BR-TASK      | Checklist and tasks                |
| BR-BUDGET    | Budget and currency                |
| BR-VENDOR    | Vendors                            |
| BR-SERVICE   | Services and categories            |
| BR-QUOTE     | Quote requests and quote responses |
| BR-BOOKING   | Booking intent                     |
| BR-REVIEW    | Reviews and moderation             |
| BR-NOTIF     | Notifications                      |
| BR-I18N      | Language and localization          |
| BR-SEED      | Seed data and demo                 |
| BR-ADMIN     | Admin governance                   |
| BR-PRIVACY   | Privacy and data handling          |
| BR-FUTURE    | Future business rules              |
| BR-OOS       | Out of scope                       |

---

## Minimum Business Rules to Include

At minimum, include rules for the following areas:

### Roles and permissions

* Organizer can manage only their own events.
* Vendor can manage only their own vendor profile and quote responses.
* Admin can manage categories, vendors, reviews, and demo governance.
* Multi-role users are future scope unless explicitly included.
* Event collaboration is future scope unless explicitly included.

### Events

* Every event must have an owner.
* Every event must have an event type.
* Supported MVP event types are: weddings, XV años, baptisms, baby showers, birthdays, and corporate events.
* Event must support city/country, date, estimated guests, budget, currency, and status.
* Event status lifecycle must be defined.
* Only valid events can request quotes.

### AI

* AI suggestions are never official until the user confirms them.
* AI-generated plan, checklist, budget, and messages must be editable.
* AI output must be visually distinguishable from user-confirmed data.
* AI must assist decisions, not make final hiring or payment decisions.
* AI provider must be abstracted to allow OpenAI, Anthropic, or MockAIProvider.
* MockAIProvider must be supported for testing/demo scenarios.

### Checklist and tasks

* Tasks may be AI-generated or manually created.
* AI-generated tasks require user confirmation.
* Tasks must have status.
* Tasks must belong to an event.
* Task progress contributes to event progress.

### Budget and currency

* Budget belongs to an event.
* Currency is configured at event level.
* MVP supports currency display but no automatic currency conversion.
* Budget items must be editable.
* If committed amount exceeds total budget, the system warns but does not block.

### Vendors

* Vendor profile must be approved before appearing in public search.
* Vendor profiles may be seed data or optionally real.
* Vendor services must belong to service categories.
* Vendor portfolio/gallery basic support is MVP or premium/future depending on source documents.
* Automated vendor verification is out of scope.

### Quotes

* Organizer can send quote requests to vendors.
* Quote request must include structured event brief.
* Vendor can only see quote requests addressed to them.
* Vendor can respond with price, package details, validity, and conditions.
* Quote comparison must be supported in MVP.
* Quote acceptance creates booking intent, not real booking/payment.

### Booking intent

* Booking intent is simulated in MVP.
* No real payment, contract, invoice, or commission is processed.
* Booking intent represents interest or agreement to continue outside the platform.

### Reviews and moderation

* Reviews must be supported and seeded.
* Admin can remove or hide offensive reviews/comments.
* AI sentiment analysis and AI moderation are deferred.
* Review rules must be defined for MVP and future state.

### Notifications

* MVP can use in-app or simulated notifications.
* Real email/WhatsApp integrations are future or simulated depending on source documents.
* WhatsApp integration is out of scope for MVP.

### Internationalization

* MVP must support Spanish LATAM neutral, Spanish Spain, Portuguese, and English.
* English is mandatory.
* MVP must support currency display.
* No complex local modisms or country-specific localization are required in v1 unless explicitly stated.

### Seed data and demo

* MVP relies primarily on seed data.
* Seed data must include organizers, vendors, events, quote requests, quotes, reviews, categories, and event states.
* Demo data must support created, active, advanced, and completed events.
* Real providers are optional and not a dependency.

### Privacy and compliance

* MVP must follow good security and privacy practices.
* No formal country-specific legal compliance is required in MVP.
* Sensitive personal data collection should be minimized.
* User data must not be exposed across roles without authorization.

### Out of scope

* Real payments
* Real commissions
* Legal contracts
* WhatsApp integration
* Native mobile app
* Real-time chat
* AI sentiment analysis
* AI moderation
* Automated vendor verification
* Complex tax/invoice handling
* Advanced geolocation
* Full transactional marketplace

---

## Rule Table Format

For each section, use this table format:

| Rule ID | Rule name | Description | Applies to | Priority | Scope | Source type | Validation notes |
| ------- | --------- | ----------- | ---------- | -------- | ----- | ----------- | ---------------- |

Example:

| Rule ID   | Rule name                                    | Description                                                                                                            | Applies to                                | Priority  | Scope | Source type | Validation notes                                                       |
| --------- | -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- | --------- | ----- | ----------- | ---------------------------------------------------------------------- |
| BR-AI-001 | Human validation required for AI suggestions | Any AI-generated suggestion must be reviewed and explicitly confirmed by the user before becoming official event data. | AI recommendations, events, tasks, budget | Must Have | MVP   | Explicit    | QA must verify that AI output is editable and not saved automatically. |

---

## Quality Requirements

The Business Rules Document must:

* Be formal and structured.
* Be written in Spanish LATAM.
* Be consistent with all source documents.
* Avoid duplicated or contradictory rules.
* Clearly separate MVP rules from future rules.
* Clearly identify out-of-scope rules.
* Be useful for QA and acceptance criteria.
* Be useful for generating user stories later.
* Be useful for validating implementation.
* Include enough detail to support future FRD and test case generation.
* Avoid overengineering.
* Avoid expanding the product into a full marketplace.

---

## Final Validation Before Output

Before finalizing the document, verify:

1. Every major MVP feature has at least one business rule.
2. Every role has clear rule coverage.
3. AI rules include human validation.
4. Quote flow rules are complete.
5. Booking intent is clearly simulated.
6. Payments and commissions are out of scope.
7. WhatsApp and native mobile app are out of scope.
8. Language and currency decisions are reflected.
9. Seed data rules are included.
10. Admin moderation rules are included.
11. Future rules are separated from MVP rules.
12. No rule contradicts the source documents.

---

## Final Instruction

Generate the full **EventFlow — Business Rules Document** now and save it as: