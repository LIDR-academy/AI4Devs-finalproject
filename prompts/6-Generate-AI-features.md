
# AAA Prompt — Generate AI Features Specification Document for EventFlow

## ACT — Role and Context

You are a Senior AI Product Manager, AI Solutions Architect, Business Analyst, Prompt Engineering Specialist, and Functional Documentation Specialist.

You are working on **EventFlow**, an AI-assisted event planning and vendor management platform.

EventFlow helps event organizers create structured event plans, generate AI-assisted checklists, manage budgets, discover vendors, request quotes, compare vendor responses, create simulated booking intent, manage reviews, and track event progress.

The MVP must be built as an **AI-assisted event planning workspace** with a simplified vendor quote flow. It must **not** become a full transactional marketplace in v1.

You must generate a formal **AI Features Specification Document** based on the existing project documentation located in:

- `/docs/1-Domain-Discovery-Report.md`
- `/docs/2-Product-Owner-Decisions.md`
- `/docs/3-MVP-Scope-Definition.md`
- `/docs/4-Business-Rules-Document.md`
- `/docs/5-User-Roles-Permissions-Matrix.md`
- `/docs/6-Domain-Data-Model.md`

These documents are the source of truth.

Your job is **not** to invent new AI features from scratch.

Your job is to:

1. Read the existing documents.
2. Extract the AI features already defined, implied, or deferred.
3. Classify each AI feature by MVP priority and source type.
4. Define inputs, outputs, validation rules, fallback behavior, risks, and acceptance expectations.
5. Specify how AI should support EventFlow without automating high-trust decisions.
6. Separate MVP AI features from future AI features and out-of-scope AI behavior.

Do not create AI features that contradict the MVP scope, business rules, role permissions, or domain data model.

If an AI feature is not explicitly defined but can be reasonably inferred from the source documents, mark it as **Derived**, **Assumption**, or **Recommended**.

If an AI feature belongs to a future version, clearly classify it as **Future**.

If an AI feature is explicitly excluded from the MVP, classify it as **Out of Scope**.

---

## AIM — Objective

Generate a complete **AI Features Specification Document** for EventFlow.

The document must define the AI capabilities needed to support the MVP, including:

- AI feature inventory.
- AI feature classification.
- User problem solved.
- Roles allowed to use each AI feature.
- Inputs required.
- Expected outputs.
- Output structure.
- Human validation rules.
- Persistence rules.
- Data model dependencies.
- Prompting strategy.
- Provider strategy.
- Fallback strategy.
- MockAIProvider behavior.
- Error handling.
- Security and privacy considerations.
- Risks and mitigations.
- Acceptance criteria.
- QA validation scenarios.
- Future AI roadmap.

This document must help the team later create:

- Functional requirements.
- User stories.
- Acceptance criteria.
- API contracts.
- Backend AI services.
- Prompt templates.
- Prompt versioning strategy.
- Test cases.
- Seed/demo AI scenarios.
- Evaluation criteria for AI outputs.

The document must be practical for the MVP and must avoid overengineering.

---

## ACTION — Instructions

Read and analyze the following source documents:

1. `/docs/1-Domain-Discovery-Report.md`
2. `/docs/2-Product-Owner-Decisions.md`
3. `/docs/3-MVP-Scope-Definition.md`
4. `/docs/4-Business-Rules-Document.md`
5. `/docs/5-User-Roles-Permissions-Matrix.md`
6. `/docs/6-Domain-Data-Model.md`

Then generate the document:

```text
/docs/7-AI-Features-Specification.md
````

The output must be written in **Spanish LATAM**.

Use a professional AI Product Manager / AI Solutions Architect tone.

Use clear tables, feature specifications, structured sections, examples, and validation rules.

---

## CRITICAL AI SPECIFICATION INSTRUCTION

Do **not** assume the AI scope from generic AI product ideas.

First, perform an **AI feature discovery pass** over the source documents.

Extract:

* AI features explicitly mentioned.
* AI features implied by MVP flows.
* AI features required by business rules.
* AI features permitted by roles and permissions.
* AI features supported by the domain data model.
* AI features needed for seed/demo.
* AI features explicitly deferred.
* AI features explicitly excluded from MVP.

The AI specification must be derived from the existing documentation, not invented independently.

Any AI feature, input, output, prompt behavior, persistence rule, or validation rule must be classified as one of:

* **Explicit:** Directly stated in the source documents.
* **Derived:** Logically required by a feature, rule, permission, or process.
* **Assumption:** Needed to make the AI flow coherent, but not clearly defined.
* **Recommended:** Suggested as a best practice, but optional.
* **Future:** Useful later, but not part of the MVP.
* **Out of Scope:** Explicitly excluded from the MVP.

If an AI feature is not supported by the source documents, do not include it as an MVP AI feature.

The specification process must follow this order:

```text
Read → Extract → Classify → Validate → Specify
```

Do not follow this order:

```text
Invent AI features → Build the specification
```

---

## AI Feature Discovery Method

Before defining the final AI feature specification, create a section called:

```markdown
## AI Feature Extraction from Source Documents
```

Use this table format:

| Candidate AI Feature | Found in source document | Evidence / context | Classification | MVP decision |
| -------------------- | ------------------------ | ------------------ | -------------- | ------------ |

Where:

* **Candidate AI Feature** is the feature identified from the documents.
* **Found in source document** references which source document mentions or implies it.
* **Evidence / context** explains why the feature exists.
* **Classification** must be Explicit / Derived / Assumption / Recommended.
* **MVP decision** must be MVP / Future / Out of Scope.

Only after this extraction table, define the final MVP AI specification.

---

## Validation Checklist Only — Not Mandatory AI Scope

The following list is **not** a mandatory AI scope.

Use it only as a validation checklist to verify whether the documents already support these AI concepts:

* AI event plan generation
* AI checklist generation
* AI budget suggestion
* AI vendor category recommendation
* AI quote brief generation
* AI quote comparison summary
* AI message generation
* AI task prioritization
* AI event summary
* AI vendor profile generation
* AI vendor matching
* AI provider recommendation
* AI inconsistency detection
* AI sentiment analysis
* AI review moderation
* AI fraud detection
* AI pricing recommendation
* AI chatbot for organizers
* AI chatbot for vendors
* AI autonomous booking decision
* AI autonomous payment decision
* AI WhatsApp assistant

If any of these are not supported by the source documents, mark them as:

* Assumption
* Recommended
* Future
* Out of Scope

Do not force unsupported AI features into the MVP.

---

## Required Output Structure

Generate the document using this exact structure:

```markdown
# EventFlow — AI Features Specification

## 1. Propósito del documento

## 2. Alcance del documento

## 3. Fuentes utilizadas

## 4. Principios de uso de IA en EventFlow

## 5. Metodología de extracción de features IA

## 6. AI Feature Extraction from Source Documents

## 7. Resumen ejecutivo de IA en el MVP

## 8. AI Features incluidas en el MVP

## 9. AI Features futuras o fuera de alcance

## 10. Catálogo detallado de AI Features MVP

## 11. AI Features recomendadas pero no obligatorias

## 12. AI Features diferidas para versiones futuras

## 13. AI Features explícitamente fuera de alcance

## 14. Roles y permisos sobre funcionalidades IA

## 15. Datos de entrada requeridos por feature

## 16. Outputs esperados por feature

## 17. Formatos de respuesta y estructura JSON recomendada

## 18. Reglas de validación humana

## 19. Reglas de persistencia y trazabilidad

## 20. Modelo de proveedor IA

## 21. Estrategia de prompts y versionado

## 22. Fallback, errores y MockAIProvider

## 23. Seguridad, privacidad y manejo de datos

## 24. Riesgos de IA y mitigaciones

## 25. Criterios de aceptación por feature IA

## 26. Escenarios de prueba para QA

## 27. Escenarios seed/demo para IA

## 28. Métricas de evaluación de IA

## 29. Roadmap de IA post-MVP

## 30. Preguntas abiertas o decisiones pendientes

## 31. Resumen final
```

---

## AI Principles to Apply

The document must include and respect these principles:

1. **Human-in-the-loop:** AI suggestions must require explicit user validation before becoming official event data.
2. **Assistive, not autonomous:** AI assists planning and decision-making but does not make final hiring, payment, moderation, or booking decisions.
3. **Editable outputs:** AI-generated plans, checklists, budgets, briefs, and summaries must be editable before confirmation.
4. **Traceability:** AI outputs should be traceable through provider, prompt version, input snapshot, output payload, status, and user decision where supported by the data model.
5. **Fallback-ready:** AI features must have graceful fallback behavior when the LLM fails.
6. **Provider abstraction:** The system should support OpenAI as the primary provider, with architecture that allows Anthropic or MockAIProvider.
7. **No sensitive overcollection:** AI should only receive data necessary to perform the requested task.
8. **No high-risk automation:** AI must not process payments, sign contracts, approve vendors, moderate reviews automatically, or make binding booking decisions.
9. **MVP practicality:** AI scope must remain focused on the strongest product differentiator: turning an event idea into a structured plan.
10. **Multi-language awareness:** AI outputs should respect supported MVP languages when relevant.

---

## MVP AI Features to Extract and Specify

Only include these as MVP features if supported by the source documents.

Likely MVP AI features may include:

### AI Event Plan Generation

Purpose:

Generate a structured event plan from basic event details.

Possible inputs:

* Event type
* Event date
* Estimated guests
* City/country
* Budget
* Currency
* Language
* Event style or preferences if available

Possible outputs:

* Timeline or planning phases
* Recommended planning sections
* Suggested vendor categories
* Initial next steps

### AI Checklist Generation

Purpose:

Generate actionable tasks for an event.

Possible inputs:

* Event type
* Event date
* Event plan
* Estimated guests
* Budget
* Language

Possible outputs:

* Task title
* Task description
* Suggested due date or relative timing
* Priority
* Category
* AI-generated flag

### AI Budget Suggestion

Purpose:

Suggest a budget distribution by category.

Possible inputs:

* Total budget
* Event type
* Estimated guests
* City/country
* Currency
* Vendor categories

Possible outputs:

* Budget categories
* Suggested planned amount
* Percentage allocation
* Explanation
* Warning if budget seems tight

### AI Vendor Category Recommendation

Purpose:

Recommend which service categories are needed for an event.

Possible inputs:

* Event type
* Guest count
* Budget
* Style/preferences
* City/country

Possible outputs:

* Service categories
* Priority
* Rationale
* Required vs optional classification

### AI Quote Brief Generation

Purpose:

Generate a structured brief to request a quote from a vendor.

Possible inputs:

* Event data
* Service category
* Vendor service
* Budget range
* Date/city
* Guest count
* Language

Possible outputs:

* Brief text
* Structured requirements
* Questions for the vendor
* Constraints or preferences

### AI Quote Comparison Summary

Purpose:

Summarize differences between received quotes.

Possible inputs:

* Quote details
* Prices
* Package details
* Conditions
* Validity dates
* Event requirements

Possible outputs:

* Comparison summary
* Strengths and risks
* Missing information
* Best-fit considerations
* Non-binding recommendation

### AI Message Generation

Purpose:

Help generate communication text for organizers or vendors.

Possible inputs:

* User role
* Context
* Event data
* Quote data
* Desired tone
* Language

Possible outputs:

* Editable message draft
* Follow-up message
* Vendor response text

### AI Task Prioritization

Purpose:

Suggest urgent next actions based on event status.

Possible inputs:

* Event date
* Task statuses
* Quote statuses
* Budget status

Possible outputs:

* Top priority tasks
* Reason
* Suggested timing

If any feature is not supported by the source documents, classify it appropriately instead of forcing it into MVP.

---

## AI Features to Evaluate as Future or Out of Scope

Evaluate and classify these features:

* AI vendor matching with ranking
* AI specific vendor recommendation
* AI event summary
* AI inconsistency detection
* AI sentiment analysis
* AI moderation of reviews
* AI fraud detection
* AI pricing recommendation
* Organizer chatbot
* Vendor chatbot
* WhatsApp AI assistant
* Autonomous vendor approval
* Autonomous review moderation
* Autonomous booking
* Autonomous payment
* Autonomous contract generation

For each, explain:

* Why it is Future or Out of Scope.
* What would be needed to support it later.
* Why it should not be included in MVP if applicable.

---

## Detailed AI Feature Format

For each MVP AI feature, use this structure:

````markdown
### AI-[NUMBER] — Feature Name

#### Descripción
Explain what the feature does.

#### Problema que resuelve
Describe the user pain point.

#### Usuario principal
Organizer / Vendor / Admin / System.

#### Clasificación
- Scope: MVP / Future / Out of Scope
- Priority: Must Have / Should Have / Could Have / Future
- Source type: Explicit / Derived / Assumption / Recommended

#### Input requerido

| Input | Type suggestion | Required | Source | Notes |
|---|---|---|---|---|

#### Output esperado

| Output | Type suggestion | Required | Description | Persisted? |
|---|---|---|---|---|

#### Estructura JSON recomendada

```json
{
  "example": "Use a realistic example based on the feature"
}
````

#### Reglas de validación humana

Explain what the user must review, edit, accept, or reject.

#### Reglas de persistencia

Explain where the AI output is stored or how it becomes official data.

#### Dependencias del modelo de datos

List related entities such as Event, EventTask, BudgetItem, QuoteRequest, Quote, AIRecommendation, User, VendorProfile.

#### Prompt strategy

Explain the prompt strategy at a high level without writing overly long prompts.

#### Fallback behavior

Explain what happens if the AI provider fails.

#### Errores esperados

List possible errors and expected behavior.

#### Riesgos

List risks specific to this feature.

#### Criterios de aceptación

List testable acceptance criteria.

````

---

## JSON Output Requirements

For each MVP AI feature, provide a recommended JSON output structure.

Keep schemas practical and implementation-friendly.

Examples:

### Event Plan JSON

```json
{
  "summary": "string",
  "phases": [
    {
      "name": "string",
      "description": "string",
      "relative_timing": "string",
      "recommended_actions": ["string"]
    }
  ],
  "recommended_vendor_categories": [
    {
      "category": "string",
      "priority": "must_have | should_have | optional",
      "reason": "string"
    }
  ],
  "warnings": ["string"]
}
````

### Checklist JSON

```json
{
  "tasks": [
    {
      "title": "string",
      "description": "string",
      "category": "string",
      "relative_due_date": "string",
      "priority": "low | medium | high",
      "source": "ai"
    }
  ]
}
```

### Budget Suggestion JSON

```json
{
  "currency": "string",
  "total_budget": 0,
  "items": [
    {
      "category": "string",
      "suggested_amount": 0,
      "percentage": 0,
      "priority": "must_have | should_have | optional",
      "reason": "string"
    }
  ],
  "warnings": ["string"]
}
```

### Quote Brief JSON

```json
{
  "brief": "string",
  "requirements": ["string"],
  "questions": ["string"],
  "constraints": ["string"]
}
```

### Quote Comparison JSON

```json
{
  "summary": "string",
  "quotes": [
    {
      "quote_id": "string",
      "strengths": ["string"],
      "risks": ["string"],
      "missing_information": ["string"]
    }
  ],
  "non_binding_recommendation": "string",
  "decision_notes": ["string"]
}
```

Use these only as recommended structures. Adjust if the source documents or data model define something different.

---

## Provider Strategy Requirements

The document must define the AI provider strategy.

Use the source documents as truth.

Expected direction:

* OpenAI as primary MVP provider.
* Anthropic as optional alternative/future provider.
* MockAIProvider for testing and demo.
* Provider abstraction through an internal interface.
* Avoid direct business logic dependency on one SDK.
* Model-specific choice can be deferred if not already decided.

Include a recommended interface concept, for example:

```ts
interface AIProvider {
  generateEventPlan(input: EventPlanInput): Promise<EventPlanOutput>;
  generateChecklist(input: ChecklistInput): Promise<ChecklistOutput>;
  suggestBudget(input: BudgetSuggestionInput): Promise<BudgetSuggestionOutput>;
  generateQuoteBrief(input: QuoteBriefInput): Promise<QuoteBriefOutput>;
  compareQuotes(input: QuoteComparisonInput): Promise<QuoteComparisonOutput>;
}
```

Do not over-engineer orchestration, agents, vector databases, or complex RAG unless the source documents require it.

---

## Prompt Strategy Requirements

Define prompt strategy at a product/spec level.

Include:

* Prompt templates per AI feature.
* Prompt versioning.
* Language and locale awareness.
* Structured JSON output requests.
* Safety and scope constraints.
* Human validation reminder in generated outputs when needed.
* Event type-specific context.
* Avoiding unsupported pricing claims.
* Avoiding hallucinated vendors.
* Avoiding legal or payment commitments.
* Clear fallback to templates or mock responses.

Do not generate very long production prompts unless explicitly requested.

---

## Persistence and Traceability Requirements

Use the domain data model to define where AI outputs go.

At minimum, explain:

* AI outputs should be stored as `AIRecommendation` or equivalent if defined.
* AI output should include type, provider, prompt version, input snapshot, output payload, status, and accepted/edited/rejected state where supported.
* Accepted AI checklist items may become `EventTask`.
* Accepted AI budget suggestions may become `BudgetItem`.
* Accepted AI vendor categories may influence `ServiceCategory` recommendations or quote request flow.
* Accepted AI quote brief may become part of `QuoteRequest`.
* Quote comparison summaries may be stored or regenerated depending on MVP decision.
* AI output must not overwrite official data without user confirmation.

If the source documents do not define exact persistence behavior, classify recommendations as **Recommended**.

---

## Human Validation Requirements

The document must clearly define human validation.

For each AI feature, specify:

* Who validates the output.
* What can be accepted.
* What can be edited.
* What can be rejected.
* What becomes official data after validation.
* What remains only as a suggestion.
* What happens if the user does nothing.

The rule must be explicit:

```text
No AI-generated output becomes official event, budget, quote, or booking data until a human user confirms it.
```

---

## Error Handling and Fallback Requirements

Define fallback behavior for:

* LLM unavailable.
* Timeout.
* Invalid JSON response.
* Unsafe or irrelevant output.
* Unsupported language.
* Missing required input.
* Provider quota exceeded.
* MockAIProvider mode.
* User cancels AI generation.
* User rejects AI output.

For each error, provide:

| Error scenario | User-facing behavior | System behavior | Fallback |
| -------------- | -------------------- | --------------- | -------- |

Fallback examples:

* Static event templates.
* Default checklist by event type.
* Default budget category distribution.
* Retry once.
* Ask user for missing fields.
* Use MockAIProvider in demo/testing.

---

## Security and Privacy Requirements

The document must define privacy principles for AI.

Include:

* Send only necessary event data to the LLM.
* Avoid sending sensitive personal data unless required.
* Do not send payment details because payments are out of scope.
* Do not send legal contract content because contracts are out of scope.
* Avoid including unnecessary contact information in prompts.
* Store input snapshots carefully.
* Do not expose one user’s AI outputs to another user.
* Respect ownership and permissions.
* Admin should not use AI to make automatic moderation decisions in MVP.
* AI logs should not contain secrets or credentials.

---

## Multi-Language AI Requirements

The MVP supports:

* Spanish LATAM neutral.
* Spanish Spain.
* Portuguese.
* English.

The document must explain:

* AI output language should match user or event language preference.
* Prompts should include target language.
* English is mandatory.
* No complex country-specific modisms are required in v1.
* Currency display should match event currency, but currency conversion is out of scope.
* AI should not invent exchange rates.

---

## Metrics for AI Evaluation

Include metrics such as:

* AI plan acceptance rate.
* Checklist usefulness.
* Budget suggestion acceptance rate.
* Quote comparison usefulness.
* AI output edit rate.
* AI regeneration rate.
* AI error rate.
* AI latency.
* Mock/demo success rate.
* User satisfaction with AI suggestions.

Separate:

* Product AI metrics.
* Academic AI metrics.
* Technical AI metrics.
* Demo AI metrics.

---

## Acceptance Criteria Requirements

For each MVP AI feature, include acceptance criteria.

Acceptance criteria must be testable.

Examples:

* Given an event with valid basic data, when the organizer requests an AI plan, then the system returns a structured plan.
* Given an AI-generated checklist, when the organizer accepts selected tasks, then only accepted tasks become official EventTasks.
* Given an invalid AI JSON response, when the system fails to parse it, then it shows a controlled error and offers fallback.
* Given the user selects English, when AI output is generated, then the output is returned in English.
* Given the AI provider is unavailable, when the user requests generation, then the system uses fallback or displays a clear error.

---

## QA Scenario Requirements

Include QA scenarios for:

* Successful event plan generation.
* Successful checklist generation.
* User edits AI output before accepting.
* User rejects AI output.
* Invalid JSON from provider.
* Provider timeout.
* Missing event data.
* Unsupported or missing language.
* Currency display preserved.
* Organizer cannot generate AI output for another organizer’s event.
* Vendor cannot access organizer-only AI features unless explicitly permitted.
* Admin cannot use AI moderation in MVP.
* MockAIProvider returns deterministic output for demo/testing.

---

## Seed/Demo AI Requirements

Define how AI should support demo scenarios.

Include:

* Seeded events with pre-generated AI plans.
* Seeded AI recommendations if useful.
* MockAIProvider deterministic outputs.
* Demo scenarios for wedding, XV años, baby shower, birthday, baptism, and corporate event.
* Quote comparison demo with multiple seeded quotes.
* Error/fallback demo scenario if useful.
* Ability to reset demo state if supported by seed strategy.

Do not require real provider data.

---

## Out-of-Scope AI Behavior

Explicitly mark these as out of scope for MVP:

* AI sentiment analysis for reviews.
* AI moderation of reviews.
* AI autonomous vendor approval.
* AI autonomous booking.
* AI autonomous payment.
* AI contract generation or legal advice.
* AI invoice or tax handling.
* AI WhatsApp assistant.
* AI real-time chat agent.
* AI fraud detection.
* AI ranking of real providers based on hidden scoring.
* AI making binding recommendations about who to hire.
* AI estimating exact market prices without reliable data.

For each, briefly explain why it is excluded and whether it could be considered later.

---

## Quality Requirements

The AI Features Specification must:

* Be written in Spanish LATAM.
* Be formal and structured.
* Be consistent with all source documents.
* Start from source-document extraction, not generic AI assumptions.
* Avoid contradictory AI behavior.
* Clearly separate MVP AI from future and out-of-scope AI.
* Clearly identify assumptions and recommendations.
* Be useful for backend development, prompt engineering, QA, FRD, user stories, and acceptance criteria.
* Avoid overengineering.
* Avoid autonomous high-risk decisions.
* Avoid turning EventFlow into a full marketplace.
* Avoid adding payments, contracts, WhatsApp, chat, or AI moderation into MVP.
* Include practical JSON output examples.
* Include provider abstraction, fallback, and MockAIProvider behavior.
* Include human validation rules.

---

## Final Validation Before Output

Before finalizing the document, verify:

1. The AI specification was extracted from source documents.
2. Every MVP AI feature has evidence, rationale, or classification.
3. Every MVP AI feature has inputs and outputs.
4. Every MVP AI feature has human validation.
5. Every MVP AI feature has fallback behavior.
6. AI output persistence is aligned with the domain data model.
7. AI roles and permissions are aligned with the permissions matrix.
8. AI does not make autonomous hiring, payment, contract, moderation, or booking decisions.
9. OpenAI, Anthropic, and MockAIProvider strategy is addressed.
10. Multi-language and currency considerations are addressed.
11. Seed/demo AI behavior is addressed.
12. Out-of-scope AI features are clearly separated.
13. No AI sentiment analysis, AI moderation, WhatsApp AI assistant, real-time AI chat, autonomous vendor approval, payment, contract, or full marketplace behavior is included in MVP.
14. The document is practical and not overengineered.

---

## Final Instruction

Generate the full **EventFlow — AI Features Specification** now and save it as:

```text
/docs/7-AI-Features-Specification.md
```
