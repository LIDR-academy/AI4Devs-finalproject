# AAA Prompt — Generate Domain Data Model Document for EventFlow

## ACT — Role and Context

You are a Senior Software Architect, Data Modeler, Database Designer, Domain-Driven Design Analyst, and Functional Documentation Specialist.

You are working on **EventFlow**, an AI-assisted event planning and vendor management platform.

EventFlow helps event organizers create structured event plans, generate AI-assisted checklists, manage budgets, discover vendors, request quotes, compare vendor responses, create simulated booking intent, manage reviews, and track event progress.

The MVP must be built as an **AI-assisted event planning workspace** with a simplified vendor quote flow. It must **not** become a full transactional marketplace in v1.

You must generate a formal **Domain Data Model Document** based on the existing project documentation located in:

- `/docs/1-Domain-Discovery-Report.md`
- `/docs/2-Product-Owner-Decisions.md`
- `/docs/3-MVP-Scope-Definition.md`
- `/docs/4-Business-Rules-Document.md`
- `/docs/5-User-Roles-Permissions-Matrix.md`

These documents are the source of truth.

Your job is **not** to invent a new data model from scratch.

Your job is to:

1. Read the existing documents.
2. Extract the entities, attributes, states, relationships, ownership rules, permissions, and constraints already defined or implied.
3. Classify each data model element by source type.
4. Build a coherent MVP domain data model from that evidence.
5. Separate MVP data structures from future or out-of-scope structures.

---

## AIM — Objective

Generate a complete **Domain Data Model Document** for EventFlow.

The document must define the functional/domain data model needed to support the MVP, including:

- Entities extracted from existing documentation.
- Entity descriptions.
- Entity ownership.
- Key attributes.
- Relationships.
- Cardinalities.
- Status fields and enums.
- Business constraints.
- Validation rules.
- Data ownership rules.
- MVP vs future classification.
- AI-related data structures.
- Seed/demo data considerations.
- Mermaid ER diagram.
- Notes for future physical implementation.

This document must help the team later create:

- Database schema.
- Prisma schema or ORM model.
- ERD diagrams.
- API contracts.
- Backend services.
- User stories.
- Test cases.
- Acceptance criteria.
- Seed scripts.
- Data validation rules.

The model must remain practical for the MVP and must avoid overengineering.

---

## ACTION — Instructions

Read and analyze the following source documents:

1. `/docs/1-Domain-Discovery-Report.md`
2. `/docs/2-Product-Owner-Decisions.md`
3. `/docs/3-MVP-Scope-Definition.md`
4. `/docs/4-Business-Rules-Document.md`
5. `/docs/5-User-Roles-Permissions-Matrix.md`

Then generate the document:

```text
/docs/6-Domain-Data-Model.md
````

The output must be written in **Spanish LATAM**.

Use a professional Software Architect / Business Analyst tone.

Use clear tables, entity definitions, relationship descriptions, and Mermaid syntax.

---

## CRITICAL MODELING INSTRUCTION

Do **not** assume the data model from a predefined entity list.

First, perform an **entity discovery pass** over the source documents.

Extract:

* Entities explicitly mentioned.
* Entities implied by business rules.
* Entities required by MVP features.
* Entities required by roles and permissions.
* Entities needed to support AI features.
* Entities needed to support seed/demo data.
* Entities explicitly deferred or out of scope.

The data model must be derived from the existing documentation, not invented independently.

Any entity, attribute, relationship, enum, or constraint must be classified as one of:

* **Explicit:** Directly stated in the source documents.
* **Derived:** Logically required by a feature, rule, permission, or process.
* **Assumption:** Needed to make the model coherent, but not clearly defined.
* **Recommended:** Suggested as a best practice, but optional.
* **Future:** Useful later, but not part of the MVP.
* **Out of Scope:** Explicitly excluded from the MVP.

If an entity is not supported by the source documents, do not include it as an MVP entity.

You may include a section called **Candidate Entities Not Included in MVP** to explain why certain entities are deferred or excluded.

The modeling process must follow this order:

```text
Read → Extract → Classify → Validate → Model
```

Do not follow this order:

```text
Use a predefined entity list → Build the model
```

---

## Entity Discovery Method

Before defining the final model, create a section called:

```markdown
## Entity Extraction from Source Documents
```

Use this table format:

| Candidate Entity | Found in source document | Evidence / context | Classification | MVP decision |
| ---------------- | ------------------------ | ------------------ | -------------- | ------------ |

Where:

* **Candidate Entity** is the entity name identified from the documents.
* **Found in source document** references which source document mentions or implies it.
* **Evidence / context** explains why the entity exists.
* **Classification** must be Explicit / Derived / Assumption / Recommended.
* **MVP decision** must be MVP / Future / Out of Scope.

Only after this extraction table, define the final MVP data model.

---

## Validation Checklist Only — Not Mandatory Model

The following list is **not** a mandatory model.

Use it only as a validation checklist to verify whether the documents already support these concepts:

* User
* Role
* Event
* EventType
* EventTask
* Budget
* BudgetItem
* VendorProfile
* VendorService
* ServiceCategory
* QuoteRequest
* Quote
* BookingIntent
* Review
* Notification
* AIRecommendation
* Location
* Attachment
* AdminAction
* UserPreference
* EventPlan
* EventTimeline
* EventTemplate
* VendorPortfolioItem
* VendorSubscription
* DemoScenario
* AuditLog
* AIProviderLog
* AIRequestLog
* AIOutputVersion
* Currency
* Language
* Country
* EventCollaborator
* Conversation
* Message
* Payment
* Invoice
* Commission
* Contract
* WhatsAppIntegration
* CalendarIntegration

If any of these are not supported by the source documents, mark them as:

* Assumption
* Recommended
* Future
* Out of Scope

Do not force unsupported entities into the MVP.

---

## Required Output Structure

Generate the document using this exact structure:

```markdown
# EventFlow — Domain Data Model Document

## 1. Propósito del documento

## 2. Alcance del modelo de datos

## 3. Fuentes utilizadas

## 4. Principios de modelado

## 5. Metodología de extracción del modelo

## 6. Entity Extraction from Source Documents

## 7. Resumen ejecutivo del modelo

## 8. Mapa de dominios funcionales

## 9. Entidades incluidas en el MVP

## 10. Entidades futuras o fuera de alcance

## 11. Catálogo detallado de entidades MVP

## 12. Entidades recomendadas para soporte del MVP

## 13. Entidades diferidas para versiones futuras

## 14. Entidades explícitamente fuera de alcance

## 15. Relaciones y cardinalidades

## 16. Estados y enums del dominio

## 17. Reglas de integridad y constraints

## 18. Reglas de ownership y acceso a datos

## 19. Modelo de datos para funcionalidades de IA

## 20. Modelo de datos para idiomas y moneda

## 21. Modelo de datos para seed/demo

## 22. Mermaid ER Diagram

## 23. Diccionario de datos consolidado

## 24. Notas para implementación física

## 25. Índices, unicidad y performance sugerida

## 26. Riesgos del modelo de datos y mitigaciones

## 27. Preguntas abiertas o decisiones pendientes

## 28. Resumen final
```

---

## Entity Documentation Format

For each MVP entity in the detailed catalog, use this structure:

```markdown
### EntityName

#### Descripción
Explain what this entity represents in the EventFlow domain.

#### Evidencia de origen
Explain where this entity comes from in the source documents.

#### Clasificación
- Scope: MVP / Future / Out of Scope
- Source type: Explicit / Derived / Assumption / Recommended
- Owner: Organizer / Vendor / Admin / System / Shared
- Domain area: Auth / Events / AI / Vendors / Quotes / Reviews / Admin / Demo

#### Atributos principales

| Attribute | Type suggestion | Required | Description | Source type | Validation / Notes |
|---|---|---|---|---|---|

#### Relaciones

| Related entity | Relationship | Cardinality | Description | MVP/Future |
|---|---|---|---|---|

#### Reglas relevantes
List business rules or permission rules from the source documents that affect this entity.

#### Notas de implementación
Include practical implementation notes without overengineering.
```

---

## Source Type Rules

Use these source type values:

```text
Explicit
Derived
Assumption
Recommended
```

Definitions:

* **Explicit:** Directly stated in source documents.
* **Derived:** Logically derived from business rules, permissions, MVP scope, or user flows.
* **Assumption:** Needed for a coherent model, but not clearly specified.
* **Recommended:** Suggested best practice for implementation or future scalability.

---

## Scope Classification Rules

Use these values:

```text
MVP
Future
Out of Scope
```

Definitions:

* **MVP:** Required for v1 implementation or demo.
* **Future:** Valuable for later versions but not required in v1.
* **Out of Scope:** Explicitly excluded from MVP and should not be implemented now.

---

## Domain / Bounded Context Discovery

After extracting entities, organize them into functional domains based on the documentation.

Possible domains may include, only if supported by source documents:

* Identity & Access
* Event Planning
* AI Assistance
* Vendor Management
* Quote Flow
* Booking Intent
* Reviews & Moderation
* Notifications
* Admin & Governance
* Localization & Currency
* Seed / Demo Data

If useful, propose future bounded contexts such as:

* Payments & Billing
* Messaging
* Collaboration
* Calendar & Availability
* Compliance & Audit

Mark future domains as Future or Out of Scope.

---

## Attribute Discovery Requirements

For every MVP entity, extract or derive only the attributes needed to support documented MVP behavior.

Attributes should be derived from:

* Business rules.
* MVP scope.
* User roles and permissions.
* User flows.
* AI feature requirements.
* Seed/demo requirements.
* Localization and currency requirements.

Do not add attributes only because they are common in generic systems.

For every attribute, classify the source type as:

* Explicit
* Derived
* Assumption
* Recommended

Use practical type suggestions, but do not over-specify implementation.

Recommended type labels:

```text
uuid
string
text
integer
decimal
boolean
date
datetime
json
enum
array
url
email
phone
currency_code
locale_code
```

Avoid tying the model to a specific database engine unless useful.

PostgreSQL-friendly implementation notes are allowed because the project is likely to use a relational database, but the document must remain a domain data model, not only a physical schema.

---

## Relationship and Cardinality Discovery Requirements

Define relationships and cardinalities only after extracting entities from the source documents.

For each relationship, indicate whether it is:

* Explicit
* Derived
* Assumption
* Recommended

Use this table format:

| Source entity | Relationship | Target entity | Cardinality | Source type | Rationale |
| ------------- | ------------ | ------------- | ----------- | ----------- | --------- |

Examples of valid rationale:

* Required because an event must have an owner.
* Required because a quote request belongs to an event and a vendor.
* Required because vendor visibility depends on approval status.
* Required because AI recommendations must be linked to the event they affect.

If a relationship has uncertainty, mark it as **Assumption** and explain the recommendation.

---

## Enum Discovery Requirements

Extract or derive enums from source documents.

Potential enums may include, only if supported by the documents:

* UserStatus
* UserRole
* EventStatus
* TaskStatus
* TaskSource
* VendorStatus
* QuoteRequestStatus
* QuoteStatus
* BookingIntentStatus
* ReviewStatus
* NotificationStatus
* AIRecommendationType
* AIRecommendationStatus
* LanguageCode
* CurrencyCode

For each enum, include:

| Enum | Values | Source type | Rationale | MVP/Future |
| ---- | ------ | ----------- | --------- | ---------- |

If the documents contain inconsistent states, propose a clean MVP enum and explicitly label it as **Recommended**.

---

## Integrity and Constraint Requirements

Define constraints from the source documents.

At minimum, extract or derive constraints related to:

* Event ownership.
* Event type requirement.
* Event status lifecycle.
* Task ownership through Event.
* Budget ownership through Event.
* Currency at event and/or budget level.
* Vendor profile approval before visibility.
* Vendor service category assignment.
* Quote request visibility.
* Quote response ownership.
* Booking intent simulation.
* Review creation and moderation.
* Notification ownership.
* AI recommendation human validation.
* Admin governance and moderation.
* Seed/demo data.
* Out-of-scope payments and commissions.

Use this table format:

| Constraint ID | Constraint | Applies to | Source type | Validation notes |
| ------------- | ---------- | ---------- | ----------- | ---------------- |

---

## Ownership and Access Data Rules

Use the source documents to model ownership and access.

Include rules for:

* Organizer-owned resources.
* Vendor-owned resources.
* Admin-governed resources.
* System-generated resources.
* AI-generated but user-confirmed resources.
* Seed/demo resources.

The model must reflect that:

* Organizer can manage only their own events.
* Vendor can manage only their own profile/services and quote responses assigned to them.
* Admin can govern categories, vendors, reviews, demo data, and moderation.
* AI suggestions are not official until validated by the user.
* Booking intent is simulated in MVP.
* Payments and commissions are not part of the MVP.

---

## AI Data Modeling Requirements

The model must explain how AI-related data should be represented based on the source documents.

Include the minimum data needed to support:

* Event plan generation.
* Checklist generation.
* Budget suggestion.
* Vendor category recommendation.
* Quote brief generation.
* Quote comparison.
* Human validation.
* Editing or accepting AI output.
* Provider abstraction: OpenAI, Anthropic, MockAIProvider.
* Prompt/version traceability if supported or recommended by the source documents.

Clarify that:

* AI outputs are suggestions.
* AI outputs require human validation.
* Accepted AI output may create or update official event data.
* The system must distinguish AI-generated data from user-confirmed data.
* MockAIProvider exists for testing and demo support if supported by prior documents.
* The model must not represent autonomous AI decisions.

If a dedicated AI entity is not explicitly defined but required for traceability, propose it as **Recommended** and explain why.

---

## Internationalization and Currency Requirements

Use the source documents to model language and currency support.

The MVP must support:

* Spanish LATAM neutral.
* Spanish Spain.
* Portuguese.
* English.

English is mandatory.

The MVP must support currency display.

Currency conversion is out of scope unless the source documents say otherwise.

Model language and currency using only the data needed for MVP:

* User preference, if supported or recommended.
* Event language, if needed.
* Event currency.
* Budget currency.
* Quote currency.
* Country/city context.

Do not create a complex localization model unless the documents justify it.

---

## Seed and Demo Data Requirements

The model must support seed/demo data for the MVP based on source documents.

Include support for:

* Organizer users.
* Vendor users.
* Admin user.
* Events in multiple states.
* Event types.
* Service categories.
* Vendor profiles.
* Vendor services.
* Quote requests.
* Quotes.
* Reviews.
* AI recommendations or generated examples if useful.
* Admin/moderation examples.

If seed-specific fields are useful, propose them as **Recommended** or **Implementation-specific**, not mandatory domain requirements unless source documents define them.

Possible optional seed metadata:

* is_seed_data
* demo_scenario
* created_by_seed_script

Do not overcomplicate the production model only for demo.

---

## Out-of-Scope Data Modeling

Explicitly identify entities or structures excluded from the MVP.

At minimum, evaluate exclusion for:

* Payment
* Invoice
* Commission
* LegalContract
* RealTimeConversation
* Message
* WhatsAppMessage
* WhatsAppIntegration
* NativeMobileDevice
* PushNotificationDevice
* AutomatedVendorVerification
* SentimentAnalysis
* AIModerationResult
* TaxDocument
* AdvancedGeoLocation
* RoutePlanning
* MultiUserEventCollaboration
* GuestList
* RSVP
* SeatingPlan

For each, explain briefly:

* Whether the source documents exclude it.
* Why it is out of scope.
* When it could be considered in the future.

---

## Mermaid ER Diagram Requirements

Generate a Mermaid `erDiagram`.

The diagram must:

* Use valid Mermaid `erDiagram` syntax.
* Include MVP entities extracted from the source documents.
* Include only key attributes.
* Mark primary keys and foreign keys using comments like `PK` and `FK`.
* Use clear relationship labels.
* Use cardinalities where appropriate.
* Avoid implementation-specific complexity.
* Avoid including out-of-scope entities.
* Avoid forcing entities that were not supported by the source documents.

If Mermaid syntax becomes too large, prioritize correctness over completeness.

Before producing the diagram, ensure the entity list is derived from the **Entity Extraction from Source Documents** section.

---

## Dictionary of Data Format

Include a consolidated dictionary table with:

| Entity | Attribute | Type suggestion | Required | Source type | Description | Notes |
| ------ | --------- | --------------- | -------- | ----------- | ----------- | ----- |

The dictionary should consolidate attributes from MVP entities only.

Future or out-of-scope attributes should appear in their own section, not mixed with the MVP dictionary.

---

## Index and Performance Suggestions

Include suggested indexes only after deriving the final MVP entities.

Keep them practical and mark them as **Recommended**.

Examples of index types that may be recommended if the entity exists:

* Unique index for user email.
* Index for event owner.
* Index for event status.
* Index for vendor profile status.
* Index for vendor country/city.
* Index for vendor service category.
* Index for quote request event.
* Index for quote request vendor profile.
* Index for quote request status.
* Index for review vendor profile.
* Index for notification user/status.
* Index for AI recommendation event/type.
* Index for admin action target.

Do not add performance complexity beyond MVP needs.

---

## Quality Requirements

The Domain Data Model Document must:

* Be written in Spanish LATAM.
* Be formal and structured.
* Be consistent with all source documents.
* Start from source-document extraction, not predefined assumptions.
* Avoid contradictory entities or relationships.
* Clearly separate MVP entities from future and out-of-scope entities.
* Clearly identify assumptions and recommendations.
* Be useful for backend development, database design, API contracts, QA, and future FRD generation.
* Avoid overengineering.
* Avoid turning EventFlow into a full marketplace.
* Avoid adding payments, contracts, commissions, WhatsApp, chat, or mobile-specific models into MVP.
* Include a valid Mermaid ERD.
* Include enough detail to support a future Prisma/PostgreSQL implementation.

---

## Final Validation Before Output

Before finalizing the document, verify:

1. The model was extracted from the source documents.
2. Every MVP entity has evidence, rationale, or classification.
3. Every MVP feature has supporting data structures.
4. Every MVP role has ownership/access coverage.
5. Event ownership is clearly modeled.
6. Vendor profile approval is clearly modeled.
7. Quote flow is clearly modeled.
8. Booking intent is simulated and not treated as real payment.
9. AI-related data requires human validation and does not overwrite official data automatically.
10. Language and currency support are represented.
11. Seed/demo data requirements are represented.
12. Admin moderation and governance are represented.
13. Future and out-of-scope entities are clearly separated.
14. No payment, invoice, commission, legal contract, WhatsApp, native mobile, or real-time chat model is included in MVP.
15. Mermaid ERD syntax is valid.
16. The model is practical and not overengineered.

---

## Final Instruction

Generate the full **EventFlow — Domain Data Model Document** now and save it as:

```text
/docs/6-Domain-Data-Model.md
```