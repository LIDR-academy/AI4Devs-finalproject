# AAA Prompt — Generate Non-Functional Requirements Document (NFR) for EventFlow

## ACT — Role and Context

You are a Senior Software Architect, Senior Business Analyst, Product Manager, QA Strategist, Security & Reliability Analyst, and AI-assisted Documentation Specialist.

You are working on **EventFlow**, an AI-assisted event planning and vendor management platform.

EventFlow helps event organizers create structured event plans, generate AI-assisted checklists, manage budgets, discover vendors, request quotes, compare vendor responses, create simulated booking intent, manage reviews, and track event progress.

The MVP must be built as an:

```text
AI-assisted event planning workspace + simplified vendor quote flow
````

It must **not** become a full transactional marketplace in v1.

You must generate a formal **Non-Functional Requirements Document — NFR** based on the existing updated project documentation located in:

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
```

These documents are the source of truth.

Your job is **not** to invent enterprise-grade non-functional requirements that are too large for the MVP.

Your job is to:

1. Read the existing documentation.
2. Extract non-functional requirements already defined, implied, or required by the MVP.
3. Classify each NFR by category, priority, scope, and source type.
4. Define measurable, testable, realistic NFRs.
5. Align NFRs with the FRD, AI features, data model, permissions, business rules, and MVP scope.
6. Validate that NFRs do not introduce out-of-scope functionality.
7. Separate MVP NFRs from future NFRs and out-of-scope quality concerns.
8. Generate a clean, formal, traceable, and implementation-ready NFR document.

---

## AIM — Objective

Generate a complete **Non-Functional Requirements Document — NFR** for EventFlow.

The NFR must define how the system should behave in terms of quality, reliability, security, performance, maintainability, usability, accessibility, testability, observability, privacy, internationalization, AI safety, and demo readiness.

The document must be useful for:

* Product Owner
* Software Architect
* Development team
* QA team
* DevOps / deployment planning
* UX/UI team
* AI agents generating technical tasks
* AI agents generating test cases
* Academic reviewers
* Portfolio evaluators

The NFR must support later generation of:

* User Stories
* Acceptance Criteria
* Technical Tasks
* QA scenarios
* Test strategy
* Architecture decisions
* Deployment plan
* Security checklist
* Demo readiness checklist

The NFR must remain realistic for a Master’s final project and MVP implementation.

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
```

Then generate the document:

```text
/docs/10-Non-Functional-Requirements.md
```

The output must be written in **Spanish LATAM**.

Use a professional Software Architect / Business Analyst / QA Strategist tone.

Use clear tables, requirement IDs, measurable criteria, validation notes, and traceability references.

---

## CRITICAL NFR EXTRACTION RULE

Do **not** create NFRs from generic enterprise SaaS, banking, healthcare, marketplace, or large-scale distributed-system assumptions.

First, perform a **non-functional requirements extraction pass** over the source documents.

Extract NFRs from:

* MVP Scope Definition
* Business Rules Document
* User Roles & Permissions Matrix
* Domain Data Model
* AI Features Specification
* Use Cases Specification
* Product Owner Decisions Use Cases Addendum
* Documentation Alignment Review Before FRD
* Functional Requirements Document
* Domain Discovery Report
* Product Owner Decisions

An NFR can only be included as **MVP** if it is supported by one or more source documents or is directly required to make the MVP safe, testable, usable, and demonstrable.

If an NFR is directly stated in the documents, mark it as **Explicit**.

If an NFR is logically required by an existing functional requirement, business rule, permission, AI feature, data model decision, or MVP constraint, mark it as **Derived**.

If an NFR is useful but not clearly supported, mark it as **Recommended** and do not treat it as mandatory MVP unless justified.

If an NFR belongs to future scope, mark it as **Future**.

If an NFR is explicitly excluded from the MVP, mark it as **Out of Scope**.

If an NFR needs Product Owner or technical clarification, mark it as:

```text
Requires Product Owner Decision
```

The NFR creation process must follow this order:

```text
Read → Extract → Classify → Validate Scope → Specify → Trace
```

Do not follow this order:

```text
Invent enterprise requirements → Apply them to the project
```

---

## NFR Source Classification

Use these source type values:

```text
Explicit / Derived / Assumption / Recommended
```

Definitions:

* **Explicit:** Directly stated in source documents.
* **Derived:** Logically required by an existing FR, BR, UC, role, permission, entity, AI feature, or MVP decision.
* **Assumption:** Needed to make the NFR coherent, but not clearly specified.
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

## NFR ID Format

Use this ID format:

```text
NFR-[CATEGORY]-[NUMBER]
```

Examples:

```text
NFR-PERF-001
NFR-SEC-001
NFR-PRIV-001
NFR-REL-001
NFR-USAB-001
NFR-A11Y-001
NFR-I18N-001
NFR-AI-001
NFR-MAINT-001
NFR-TEST-001
NFR-OBS-001
NFR-DEMO-001
NFR-DATA-001
NFR-DEPLOY-001
NFR-OOS-001
```

Use these category prefixes:

| Prefix     | Category                                |
| ---------- | --------------------------------------- |
| NFR-PERF   | Performance                             |
| NFR-SEC    | Security                                |
| NFR-PRIV   | Privacy and data protection             |
| NFR-REL    | Reliability and resilience              |
| NFR-USAB   | Usability                               |
| NFR-A11Y   | Accessibility                           |
| NFR-I18N   | Internationalization and localization   |
| NFR-AI     | AI quality, safety, and fallback        |
| NFR-MAINT  | Maintainability                         |
| NFR-TEST   | Testability                             |
| NFR-OBS    | Observability and logging               |
| NFR-DATA   | Data integrity and auditability         |
| NFR-DEMO   | Demo readiness and seed reproducibility |
| NFR-DEPLOY | Deployment and environment readiness    |
| NFR-OOS    | Out-of-scope non-functional concerns    |

---

## Required Output Structure

Generate the document using this exact structure:

```markdown
# EventFlow — Non-Functional Requirements Document (NFR)

## 1. Propósito del documento

## 2. Alcance del documento

## 3. Fuentes utilizadas

## 4. Principios no funcionales del MVP

## 5. Metodología de extracción de NFRs

## 6. Non-Functional Requirements Extraction from Source Documents

## 7. Resumen ejecutivo del NFR

## 8. Categorías NFR incluidas en el MVP

## 9. Requerimientos de performance

## 10. Requerimientos de seguridad

## 11. Requerimientos de privacidad y protección de datos

## 12. Requerimientos de confiabilidad y resiliencia

## 13. Requerimientos de usabilidad

## 14. Requerimientos de accesibilidad

## 15. Requerimientos de internacionalización y localización

## 16. Requerimientos no funcionales de IA

## 17. Requerimientos de mantenibilidad

## 18. Requerimientos de testabilidad

## 19. Requerimientos de observabilidad y logging

## 20. Requerimientos de integridad, auditoría y trazabilidad de datos

## 21. Requerimientos de datos seed y demo readiness

## 22. Requerimientos de despliegue y ambientes

## 23. NFRs futuros

## 24. NFRs explícitamente fuera de alcance

## 25. Matriz consolidada de NFRs

## 26. Matriz de trazabilidad NFR → FRD / UC / BR / Entidades

## 27. Criterios de validación por categoría NFR

## 28. Riesgos no funcionales y mitigaciones

## 29. Supuestos, restricciones y dependencias

## 30. Preguntas abiertas o decisiones pendientes

## 31. Checklist de readiness no funcional

## 32. Resumen final
```

---

## NFR Extraction Method

Before defining the final NFRs, create a section called:

```markdown
## Non-Functional Requirements Extraction from Source Documents
```

Use this table format:

| Candidate NFR | Category | Found in source document | Evidence / context | Classification | MVP decision |
| ------------- | -------- | ------------------------ | ------------------ | -------------- | ------------ |

Where:

* **Candidate NFR** is the quality requirement identified from the documents.
* **Category** is the NFR category.
* **Found in source document** references which document supports it.
* **Evidence / context** explains why the NFR exists.
* **Classification** must be Explicit / Derived / Assumption / Recommended.
* **MVP decision** must be MVP / Future / Out of Scope / Requires Product Owner Decision.

Only after this extraction table, define the final MVP NFRs.

---

## NFR Table Format

For every NFR, use this table format:

| NFR ID | Requirement | Category | Priority | Scope | Source type | Measurement / Validation | Related FR / UC |
| ------ | ----------- | -------- | -------- | ----- | ----------- | ------------------------ | --------------- |

Each NFR must be:

* Clear
* Measurable or verifiable
* Realistic for MVP
* Testable
* Traceable
* Consistent with source documents
* Aligned to the FRD

Write NFRs using language such as:

```text
El sistema debe...
La aplicación debe...
El backend debe...
La integración de IA debe...
La demo debe...
```

Avoid vague language such as:

```text
El sistema debe ser rápido.
El sistema debe ser seguro.
La app debe ser moderna.
La IA debe ser buena.
```

When exact numerical thresholds are not defined in source documents, provide a realistic recommended value and mark it as **Recommended**.

---

## Performance Requirements

Extract and define NFRs related to performance.

Consider:

* Page load time.
* API response time.
* AI timeout.
* Handling seeded demo data.
* Admin dashboard metrics load time.
* Vendor directory browsing.
* Quote comparison response time.
* Avoiding unnecessary expensive AI calls.

Must reflect:

```text
AI timeout is 1 minute.
```

Recommended MVP targets may include, if not contradicted by source documents:

* Main pages should load in under 3 seconds under normal demo conditions.
* Standard API requests should respond in under 2 seconds under normal demo conditions.
* AI requests should timeout after 1 minute.
* Admin dashboard metrics should load in under 3 seconds with seed/demo data.
* Vendor directory should remain usable with expected seed data volume.

Mark numerical targets as **Recommended** if not explicitly defined.

Do not require enterprise-scale performance such as millions of users, high-availability clusters, global CDN strategy, or advanced caching unless source documents support it.

---

## Security Requirements

Extract and define NFRs related to security.

Consider:

* Authentication.
* Role-based authorization.
* Ownership-based access.
* Captcha / anti-bot for registration and login.
* Admin access restrictions.
* Vendor quote visibility restrictions.
* Organizer event privacy.
* Preventing unauthorized access to other users’ resources.
* Basic input validation.
* Secure handling of files/attachments.
* Secure handling of AI provider credentials.

Must reflect:

```text
Captcha and anti-bot protection must be included for registration and login.
```

Must reflect:

```text
Organizer can manage only owned events.
Vendor can manage only own profile/services and assigned quote requests.
Admin can perform documented governance actions.
```

Do not add enterprise security requirements such as SSO, MFA, KYC, SOC 2, ISO 27001, advanced fraud detection, or full compliance programs unless source documents support them.

If mentioned, classify them as Future, Out of Scope, or Requires Product Owner Decision.

---

## Privacy and Data Protection Requirements

Extract and define NFRs related to privacy and data protection.

Consider:

* Good privacy and security practices.
* Minimum necessary data collection.
* User data separation by role.
* Avoiding data leakage between organizers and vendors.
* AI prompt data minimization.
* Avoid sending unnecessary personal data to the LLM.
* No formal country-specific legal compliance required in MVP unless source documents say otherwise.
* Sensitive data should not be included in logs.
* AI input snapshots should be handled carefully.

Must reflect:

```text
MVP follows good privacy and security practices, but does not implement formal country-specific legal compliance.
```

Do not define full GDPR, LFPDPPP, LOPD, or similar compliance programs as MVP unless explicitly required by the source documents.

---

## Reliability and Resilience Requirements

Extract and define NFRs related to reliability and resilience.

Consider:

* Controlled error handling.
* AI timeout.
* AI fallback.
* MockAIProvider.
* Graceful failures.
* Avoiding broken demo flows.
* Consistent seed data.
* BookingIntent simulated behavior.
* Quote expiration handling.
* Event auto-completion.
* Admin moderation audit.

Must reflect:

```text
If an AI request exceeds 1 minute, the system must stop waiting and show a controlled error or use fallback/MockAIProvider when demo/testing mode is enabled.
```

Must reflect:

```text
OpenAIProvider is the primary functional MVP provider.
MockAIProvider is required for testing/demo.
AnthropicProvider is future or optional stub, not required as functional MVP implementation.
```

Do not require enterprise-level failover, multi-region deployment, or zero downtime unless supported by source documents.

---

## Usability Requirements

Extract and define NFRs related to usability.

Consider:

* Web responsive only.
* Clear user flows.
* Organizer, vendor, and admin dashboards.
* Premium / aspirational but accessible branding direction.
* Clear validation messages.
* Clear AI review and confirmation steps.
* Clear status labels for events, quotes, reviews, and tasks.
* No overly complex marketplace interactions.
* Demo-friendly workflows.

Must reflect:

```text
MVP is web responsive only. No native mobile app in v1.
```

Do not define native mobile usability requirements.

---

## Accessibility Requirements

Extract and define practical accessibility NFRs.

Consider:

* Semantic HTML.
* Keyboard navigation for main flows.
* Visible focus states.
* Form labels.
* Error messages.
* Color contrast.
* Accessible buttons and links.
* Basic screen-reader-friendly structure.

Recommended MVP target:

```text
The MVP should follow basic WCAG-inspired accessibility practices where practical.
```

Mark exact WCAG certification as Future or Recommended unless source documents require it.

Do not require formal accessibility certification in MVP unless source documents support it.

---

## Internationalization and Localization Requirements

Extract and define NFRs related to i18n/l10n.

Must reflect:

* Spanish LATAM neutral.
* Spanish Spain.
* Portuguese.
* English.
* English is mandatory.
* No complex local modisms in v1.
* AI output should respect selected language when applicable.
* Currency display is required.
* Currency conversion is out of scope.
* Event currency cannot be changed after creation.
* User chooses local currency or USD during event creation.

Consider:

* Translation keys.
* UI language switching.
* Locale-aware labels.
* Currency formatting.
* AI prompt target language.
* Seed/demo data language coverage.

Do not require full country-specific localization or automatic currency conversion unless source documents support it.

---

## AI Quality, Safety, and Fallback Requirements

Extract and define NFRs related to AI quality and safety.

Must reflect:

* AI is assistive, not autonomous.
* Human validation is required.
* AI output must be editable.
* AI output must not become official data until confirmed.
* AI timeout is 1 minute.
* OpenAIProvider is functional MVP provider.
* MockAIProvider is required for testing/demo.
* AnthropicProvider is future/stub optional.
* No AI moderation.
* No AI sentiment analysis.
* No AI autonomous booking.
* No AI autonomous payment.
* No AI autonomous vendor approval.
* No AI legal/contract generation.

Consider:

* Structured JSON outputs.
* Prompt versioning.
* Input minimization.
* Output validation.
* Error handling.
* Regeneration or fallback.
* Traceability through AIRecommendation or equivalent.
* Mock deterministic responses.

---

## Maintainability Requirements

Extract and define NFRs related to maintainability.

Consider:

* Modular code organization.
* Separation between frontend, backend, database, and AI provider logic.
* Provider abstraction for AI.
* Avoid coupling to one LLM SDK.
* Clear domain modules.
* Consistent naming.
* Configuration-driven language/currency.
* Seed scripts separated from production logic.
* Business rules documented and traceable.
* Future readiness without overengineering.

Must reflect:

```text
AIProvider interface is required.
OpenAIProvider is the primary functional MVP provider.
MockAIProvider is required for testing/demo.
AnthropicProvider is future or optional stub.
```

---

## Testability Requirements

Extract and define NFRs related to testability.

Consider:

* Unit tests for business rules.
* Integration tests for core flows.
* Authorization tests.
* AI MockAIProvider tests.
* Seed data reproducibility.
* Use case validation.
* FRD traceability.
* Quote expiration logic.
* Event auto-completion logic.
* Currency immutability.
* Review moderation audit.
* Captcha/anti-bot test strategy.

Recommended MVP targets may include:

* Critical business rules should have automated test coverage.
* MockAIProvider must support deterministic tests.
* Seed data must support repeatable demo and QA flows.
* At least the main E2E flows should be testable.

Mark coverage percentages as Recommended unless already defined.

---

## Observability and Logging Requirements

Extract and define NFRs related to observability.

Consider:

* Error logging.
* AI provider errors.
* Timeout events.
* Admin actions.
* Review moderation actions.
* Quote expiration/rejection status changes.
* BookingIntent cancellation.
* Attachment soft delete.
* Event auto-completion.
* Security/auth failures.
* Captcha/anti-bot failures.

Do not require advanced observability stacks, distributed tracing, or enterprise monitoring unless source documents support it.

Keep MVP observability practical.

---

## Data Integrity, Auditability, and Traceability Requirements

Extract and define NFRs related to data integrity and auditability.

Must reflect:

* Review deletion/removal must be audited.
* Attachment delete uses soft delete metadata.
* Event currency is immutable after creation.
* Event auto-completion occurs 2 days after event date.
* Quote default validity is 15 calendar days.
* QuoteRequest active limit is 5 per service category per event.
* Admin cannot hard delete EventType if associated with events.
* Service category hierarchy max 2 levels.
* AI outputs require human validation.
* BookingIntent is simulated and cancelable.

Consider:

* AdminAction logging.
* Soft delete status.
* Status transition constraints.
* Timestamp fields.
* Owner tracking.
* Reason fields for moderation/cancellation when applicable.

---

## Seed Data and Demo Readiness Requirements

Extract and define NFRs related to seed/demo.

Consider:

* Seed users.
* Seed organizers.
* Seed vendors.
* Seed admin.
* Seed events in different states.
* Seed categories and EventTypes.
* Seed quote requests and quotes.
* Seed reviews.
* Seed AI recommendations or deterministic MockAIProvider outputs.
* Demo reset capability if supported or recommended.
* Demo scenarios from FRD and Use Cases.

Must reflect:

* Mostly seed data.
* Real vendors optional, not required.
* Product Owner is admin for demo.
* 5 to 10 organizer users for demo.
* Enough events to show created, active, advanced, completed states.

---

## Deployment and Environment Requirements

Extract and define NFRs related to deployment and environments.

Consider:

* MVP should be deployable for academic/demo evaluation.
* Environment variables for AI provider keys.
* Separate demo/testing configuration.
* MockAIProvider mode.
* Seed data execution.
* Database setup.
* Basic deployment documentation.
* Web responsive deployment.

Do not require complex CI/CD, multi-region, blue-green deployment, Kubernetes, or enterprise infrastructure unless source documents support it.

---

## Future NFRs Section

Create a section for future NFRs.

Use this table:

| Future NFR ID | Requirement | Reason deferred | Dependency | Possible version |
| ------------- | ----------- | --------------- | ---------- | ---------------- |

Future NFRs may include only if supported by source documents:

* Formal legal compliance by country.
* Advanced accessibility certification.
* Enterprise observability.
* Multi-region deployment.
* Advanced rate limiting.
* SSO/MFA.
* Native mobile performance.
* WhatsApp reliability.
* Real payment security.
* Advanced vendor verification.
* AI moderation safety.
* Advanced marketplace scalability.
* External calendar synchronization reliability.

Do not mix future NFRs with MVP NFRs.

---

## Out-of-Scope NFR Section

Create a section for explicitly out-of-scope non-functional requirements.

Use this table:

| Out-of-Scope NFR ID | Requirement / capability | Source evidence | Reason excluded from MVP | Risk if included now |
| ------------------- | ------------------------ | --------------- | ------------------------ | -------------------- |

Evaluate:

* Native mobile app quality requirements.
* Payment security requirements.
* PCI-like payment handling.
* Commission calculation reliability.
* Invoice/tax compliance.
* WhatsApp delivery guarantees.
* Real-time chat performance.
* External calendar synchronization reliability.
* Enterprise compliance.
* Advanced fraud detection.
* AI moderation safety.
* Multi-user collaboration scalability.
* Advanced geolocation accuracy.

Only mark functionality as explicitly out of scope if supported by source documents or clearly derived from MVP restrictions.

If something is unclear, classify it as:

```text
Requires Product Owner Decision
```

---

## Traceability Requirements

The NFR must include a traceability matrix.

Use this table:

| NFR ID | Related FRD requirement | Related use case | Related business rule | Related entity | Related AI feature | Source document |
| ------ | ----------------------- | ---------------- | --------------------- | -------------- | ------------------ | --------------- |

The matrix should connect NFRs to:

* FRD requirements from `/docs/9-Functional-Requirements-Document.md`
* Use cases from `/docs/8-Use-Cases-Specification.md`
* Business rules from `/docs/4-Business-Rules-Document.md`
* Entities from `/docs/6-Domain-Data-Model.md`
* AI features from `/docs/7-AI-Features-Specification.md`
* Product Owner decisions from `/docs/8.1-Product-Owner-Decisions-Use-Cases-Addendum.md`

If exact IDs exist in the source documents, use them.

If exact IDs do not exist, use names and mark as Derived.

---

## Validation Criteria Requirements

Include validation criteria at the category level.

Use this table:

| NFR Category | Validation Criteria ID | Criteria | Related NFR |
| ------------ | ---------------------- | -------- | ----------- |

Criteria must be testable or reviewable.

Examples only; do not include unless supported:

```text
Given an AI request exceeds 1 minute, when the timeout is reached, then the system stops waiting and displays a controlled error or uses MockAIProvider in demo/testing mode.
Given an organizer tries to access another organizer’s event, when the request is made, then access is denied.
Given a review is removed by admin, when the action is completed, then the review is hidden/soft-deleted and an audit trail is preserved.
Given an event is created with a currency, when the user later edits the event, then the currency cannot be changed.
```

---

## NFR Risk Requirements

Include risks related to:

* AI provider failure.
* AI latency.
* Poor AI output quality.
* Unauthorized access.
* Weak role enforcement.
* Seed data inconsistency.
* Demo failure.
* Missing translations.
* Currency display inconsistencies.
* Overengineering.
* Scope creep.
* Poor error handling.
* Missing audit logs.
* Attachment deletion inconsistencies.
* Admin dashboard becoming too complex.

Use this table:

| Risk ID | Risk | Impact | Probability | Mitigation | Related NFR |
| ------- | ---- | ------ | ----------- | ---------- | ----------- |

Use:

```text
Impact: Low / Medium / High
Probability: Low / Medium / High
```

---

## Readiness Checklist Requirements

Include a final readiness checklist.

Use this format:

```markdown
## Checklist de readiness no funcional

- [ ] Performance básica validada para flujos principales.
- [ ] Auth y roles validados.
- [ ] Captcha/anti-bot definido para registro/login.
- [ ] AI timeout de 1 minuto documentado.
- [ ] MockAIProvider disponible para demo/testing.
- [ ] Manejo de errores controlado.
- [ ] Seed data reproducible.
- [ ] Idiomas MVP definidos.
- [ ] Moneda inmutable validada.
- [ ] Auditoría de reseñas eliminadas documentada.
- [ ] Soft delete de attachments documentado.
- [ ] Admin actions trazables.
- [ ] Restricciones out-of-scope validadas.
```

Adjust checklist based on source documents.

---

## Mandatory Scope Guardrails

While generating NFRs, preserve the EventFlow MVP boundaries.

Do not add any of the following as MVP NFRs unless explicitly supported by the source documents:

* Real payment security.
* PCI-like compliance.
* Commission financial accuracy.
* Invoice/tax compliance.
* Legal contract compliance.
* WhatsApp reliability.
* Native mobile performance.
* Native push notification delivery.
* Real-time chat latency.
* Automated vendor verification reliability.
* KYC automation requirements.
* AI moderation safety.
* AI sentiment analysis quality.
* AI autonomous approval safeguards.
* Full transactional marketplace scalability.
* Advanced geolocation accuracy.
* Route planning performance.
* External calendar synchronization reliability.
* Multi-user collaboration scalability.
* Guest list / RSVP performance.
* Seating plan usability.
* Complex country-specific legal compliance.
* Currency conversion accuracy.

These capabilities may appear only as:

* Future NFRs.
* Out-of-scope NFRs.
* Roadmap notes.
* Risk/constraint notes.
* Product Owner decision needed.

If a capability is unclear, mark it as:

```text
Requires Product Owner Decision
```

---

## Quality Requirements

The NFR must:

* Be written in Spanish LATAM.
* Be formal and structured.
* Be consistent with all source documents.
* Start from source-document extraction, not generic assumptions.
* Reflect the latest Product Owner decisions from document `8.1`.
* Align with the FRD.
* Avoid contradictory NFRs.
* Clearly separate MVP, Future, Out of Scope, and Requires Product Owner Decision items.
* Clearly identify assumptions and recommendations.
* Be useful for User Stories, Acceptance Criteria, QA, technical tasks, architecture, and deployment.
* Avoid overengineering.
* Avoid turning EventFlow into a full marketplace.
* Avoid adding NFRs for payments, contracts, commissions, WhatsApp, native mobile app, real-time chat, AI moderation, autonomous AI decisions, external calendar integration, or currency conversion into MVP unless explicitly supported by source documents.
* Include NFR IDs.
* Include traceability.
* Include validation criteria.
* Include risk analysis.
* Include readiness checklist.

---

## Final Validation Before Output

Before finalizing the document, verify:

1. The NFRs were extracted from source documents.
2. Every MVP NFR has evidence, rationale, or classification.
3. Every NFR category is supported by existing documentation or clearly derived from MVP needs.
4. The NFR aligns with `/docs/9-Functional-Requirements-Document.md`.
5. Captcha/anti-bot is documented.
6. AI timeout is documented as 1 minute.
7. MockAIProvider is documented for testing/demo.
8. OpenAIProvider is the functional MVP provider.
9. AnthropicProvider is future/stub optional.
10. Human validation for AI outputs is represented.
11. Role-based access and ownership checks are represented.
12. Event currency immutability is represented.
13. Currency conversion is not included as MVP.
14. Review audit/soft delete is represented.
15. Attachment soft delete is represented.
16. Event auto-completion after 2 days is represented.
17. Quote validity and QuoteRequest limits are represented.
18. Admin dashboard metrics are framed as activity/governance/demo metrics, not commercial revenue metrics.
19. Multi-language support is represented.
20. Seed/demo readiness is represented.
21. Future, out-of-scope, and requires-decision items are clearly separated.
22. No payment security, PCI-like compliance, invoice/tax compliance, WhatsApp reliability, native mobile performance, real-time chat latency, AI moderation safety, external calendar sync, multi-user collaboration, guest list, RSVP, seating plan, or currency conversion is included as MVP unless explicitly supported by source documents.
23. The document is practical and not overengineered.

---

## Final Instruction

Generate the full **EventFlow — Non-Functional Requirements Document (NFR)** now and save it as:

```text
/docs/10-Non-Functional-Requirements.md
```