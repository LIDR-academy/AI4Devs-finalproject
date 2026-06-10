# AAA Prompt — Generate EventFlow AI Architecture & PromptOps Design Document

## ACT AS

You are a **Senior AI Solutions Architect, PromptOps Lead, Backend Architect, and Security-aware LLM Integration Specialist** working on the final academic MVP project **EventFlow**.

You specialize in:

* AI architecture for SaaS products.
* LLM provider abstraction.
* PromptOps and prompt lifecycle management.
* Human-in-the-loop AI workflows.
* AI traceability and auditability.
* Secure prompt and payload design.
* Multi-provider LLM integrations.
* AI fallback, timeout, retry, and mock strategies.
* Clean / Hexagonal Architecture.
* Modular Monolith architecture.
* Node.js + TypeScript + Express.js backend design.
* Prisma + PostgreSQL persistence design.
* REST API integration.
* AI testing, deterministic mocks, and demo readiness.

You must generate a formal document named:

```text
/docs/17-AI-Architecture-and-PromptOps-Design.md
```

The document must be written in **Spanish LATAM neutral**.

The document must be aligned with the existing EventFlow documentation and must not introduce features, providers, infrastructure, or scope that contradicts the approved MVP.

---

## AIM

Generate the complete **AI Architecture & PromptOps Design Document** for EventFlow.

The purpose of this document is to translate the approved AI features, system architecture, backend design, API design, frontend expectations, data model, NFRs, and product decisions into a concrete and implementable design for:

* AI provider architecture.
* Prompt lifecycle and versioning.
* Prompt templates and prompt registry.
* Input/output contracts for AI features.
* AI request orchestration.
* Fallback, timeout, retry, and error handling.
* Human-in-the-loop validation.
* AIRecommendation persistence.
* AIPromptVersion strategy.
* Traceability, observability, and auditability.
* Security and privacy controls for prompts and outputs.
* Testing strategy for AI flows.
* Demo mode and MockAIProvider behavior.
* Future extensibility toward Anthropic or other providers without coupling the domain to a vendor SDK.

The document must become the source of truth for implementing the AI layer of EventFlow.

It must answer, at minimum:

1. How is the AI layer architected inside the Modular Monolith?
2. Which provider implementations exist in the MVP?
3. How does `LLMProvider` decouple the application from OpenAI, Anthropic, and Mock providers?
4. How are prompts stored, versioned, selected, reviewed, and evolved?
5. How does each AI feature map to prompt templates, input schemas, output schemas, validation, persistence, and human acceptance?
6. How does fallback work when the real provider fails, times out, or returns invalid JSON?
7. How is each AI call traced from request → prompt version → provider → output → user decision → materialized entity?
8. How are privacy, prompt injection, sensitive data minimization, and output safety handled?
9. How are AI flows tested deterministically?
10. What is explicitly out of scope for the MVP?

---

## AVAILABLE CONTEXT

Use the following existing documents as the source of truth:

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
```

You must read and synthesize these documents before writing the new document.

Do not invent unsupported scope. If something is not clearly supported by the documentation, classify it as one of:

* `Assumption`
* `Recommended`
* `Future`
* `Out of Scope`
* `Requires Product Owner Decision`

---

## NON-NEGOTIABLE PROJECT DECISIONS

The generated document must respect these decisions:

### Product and MVP Scope

* EventFlow MVP is an **AI-assisted event planning workspace + simplified vendor quote flow**.
* It is **not** a full transactional marketplace.
* No real payments.
* No contracts or digital signatures.
* No real-time chat.
* No WhatsApp integration.
* No native mobile app.
* No automatic currency conversion.
* No autonomous AI decisions.

### AI Principles

* AI is a **copilot**, never an autonomous decision-maker.
* Every AI output must be editable and must require explicit human confirmation before becoming official data.
* AI must not approve vendors.
* AI must not moderate reviews automatically.
* AI must not select or hire vendors autonomously.
* AI must not process payments.
* AI must not generate contracts.
* AI must not override official user data without confirmation.

### Providers

The MVP provider strategy is:

```text
LLMProvider / AIProvider interface: mandatory.
OpenAIProvider: main functional MVP provider.
MockAIProvider: mandatory for tests, demo, offline mode, and controlled fallback.
AnthropicProvider: stub / future extension, not required as functional MVP provider.
```

Do not add a dynamic provider selector in the UI.

Do not implement automatic OpenAI → Anthropic failover in the MVP.

Do not require Anthropic to be fully operational in the MVP.

### Timeout and Fallback

* AI timeout is **60,000 ms**.
* If the provider fails, times out, or returns invalid JSON:

  * In demo/testing mode, the system may use `MockAIProvider` or static deterministic templates.
  * Outside demo/testing mode, the system must return a controlled error.
* Fallback to MockAIProvider must only be enabled by explicit configuration.
* The system must record whether fallback was used.

### Traceability

Every AI call must be traceable through:

* User.
* Event or vendor context when applicable.
* AI feature type.
* Prompt version.
* Provider.
* Input payload.
* Output payload.
* Validation result.
* Timeout / latency.
* Fallback usage.
* Human decision.
* Materialized entities when accepted.

### Security and Privacy

The document must define:

* Prompt data minimization.
* No secrets in prompts.
* No API keys exposed to frontend.
* No direct frontend calls to OpenAI, Anthropic, or any LLM provider.
* Prompt injection risk mitigation.
* Structured output validation.
* Safe error messages.
* Redaction or omission of sensitive data from logs.
* RBAC + ownership enforcement before any AI call.
* Audit trail for AI outputs.
* Environment variable strategy for provider configuration.

---

## EXPECTED OUTPUT

Generate a complete Markdown document in **Spanish LATAM neutral** with the following structure.

Use this exact title:

```markdown
# EventFlow — AI Architecture & PromptOps Design
```

The document must include, at minimum, the following sections.

---

# 1. Propósito del documento

Explain the purpose of the AI Architecture & PromptOps Design document.

Clarify that this document operationalizes the approved AI features into an implementable architecture and PromptOps strategy.

Mention that it is an input for:

* Backend implementation.
* API implementation.
* Frontend AI-assisted UX.
* Database Physical Design.
* Security and Authorization Design.
* Testing Strategy.
* Deployment and DevOps.
* ADRs.
* User Stories, Backlog, and Development Tasks.

---

# 2. Alcance del documento

Include:

## 2.1 Incluye

Cover at least:

* AI provider architecture.
* `LLMProvider` port.
* `OpenAIProvider`.
* `MockAIProvider`.
* `AnthropicProvider` stub.
* Prompt registry.
* Prompt templates.
* Prompt versioning.
* AI input/output schemas.
* AIRecommendation persistence.
* AIPromptVersion persistence.
* Human-in-the-loop flow.
* Timeout and fallback.
* JSON validation.
* AI observability.
* AI security.
* AI testing.
* Demo mode.

## 2.2 No incluye

Explicitly exclude:

* Final production prompt copywriting if not yet required.
* Full implementation code.
* OpenAPI YAML.
* Database DDL.
* Frontend screen designs.
* Payment AI.
* Contract AI.
* Autonomous vendor selection.
* Automatic review moderation.
* Free-form chatbot.
* Image generation.
* WhatsApp AI integration.
* Native mobile AI features.
* Production-grade multi-provider routing.
* Real Anthropic implementation for MVP.

---

# 3. Fuentes utilizadas

Create a table listing all source documents used.

Columns:

```text
Documento
Uso en este diseño
```

Include all documents from `/docs/1` to `/docs/16`.

---

# 4. Resumen ejecutivo

Provide a concise executive summary of the AI architecture.

It must mention:

```text
Frontend Next.js
→ REST API Backend
→ AI Assistance Module
→ LLMProvider port
→ OpenAIProvider / MockAIProvider / AnthropicProvider stub
→ PostgreSQL
→ AIRecommendation + AIPromptVersion
```

Explain that the AI layer is backend-only, traceable, validated, and human-in-the-loop.

---

# 5. Principios de arquitectura IA

Create a table with principles.

Minimum principles:

1. AI as copilot, not decision-maker.
2. Backend-only AI integration.
3. Provider abstraction.
4. PromptOps by design.
5. Human-in-the-loop.
6. Structured outputs only.
7. Traceability by default.
8. Privacy by minimization.
9. Deterministic demo and tests.
10. No autonomous high-impact actions.
11. No provider SDK leakage outside Infrastructure.
12. No overengineering for MVP.

Columns:

```text
#
Principio
Significado
Implicación técnica
Ejemplo en EventFlow
```

---

# 6. Arquitectura lógica de IA

Describe the logical AI architecture.

Include:

* AI Assistance Module.
* Application use cases.
* `LLMProvider` port.
* Provider adapters.
* Prompt registry.
* Prompt builder.
* Output validator.
* AIRecommendation repository.
* AIPromptVersion repository.
* Fallback service.
* AI audit/logging service.

Include a Mermaid diagram:

```mermaid
flowchart TB
```

The diagram must show frontend, REST API, AI use case, prompt registry, LLMProvider, providers, output validator, AIRecommendation repository, PostgreSQL, and human acceptance flow.

---

# 7. Ubicación dentro del Modular Monolith

Explain where AI components live within Clean / Hexagonal Architecture.

Include a table:

```text
Layer
AI responsibility
Allowed components
Forbidden dependencies
```

Layers:

* Interface Layer.
* Application Layer.
* Domain Layer.
* Ports Layer.
* Infrastructure Layer.
* Shared Kernel.

Make clear that:

* Controllers do not contain AI business logic.
* Domain does not import OpenAI SDK.
* Application depends on `LLMProvider`, not providers.
* Infrastructure implements OpenAI, Mock, and Anthropic stub.

---

# 8. Catálogo de funcionalidades IA del MVP

Create a table for all MVP AI features.

Include:

* AI-001 Generate Event Plan.
* AI-002 Generate Checklist.
* AI-003 Suggest Budget.
* AI-004 Recommend Vendor Categories.
* AI-005 Generate Quote Brief.
* AI-006 Compare Quotes.
* AI-007 Generate Vendor Bio / Package Description.
* AI-008 Prioritize Tasks.

Columns:

```text
AI ID
Funcionalidad
Actor principal
Prioridad MVP
Entrada principal
Salida esperada
Materializa entidades
Requiere aceptación humana
Prompt template ID
```

Use clear template IDs such as:

```text
PROMPT-EVENT-PLAN-V1
PROMPT-CHECKLIST-V1
PROMPT-BUDGET-SUGGESTION-V1
PROMPT-VENDOR-CATEGORIES-V1
PROMPT-QUOTE-BRIEF-V1
PROMPT-QUOTE-COMPARISON-V1
PROMPT-VENDOR-BIO-V1
PROMPT-TASK-PRIORITIZATION-V1
```

---

# 9. Diseño de Provider Abstraction

Define the provider architecture.

Include:

## 9.1 `LLMProvider` port

Provide a TypeScript interface example.

It must include methods for the 8 AI features.

Include an `AIContext` interface with:

* `language`
* `currency`
* `userId`
* `eventId`
* `vendorProfileId`
* `promptVersionId`
* `correlationId`
* `timeoutMs`

## 9.2 Provider implementations

Create a table:

```text
Provider
Estado MVP
Responsabilidad
Uso permitido
Restricciones
```

Providers:

* `OpenAIProvider`
* `MockAIProvider`
* `AnthropicProvider`

## 9.3 Provider selection

Explain environment-based provider selection.

Include example environment variables:

```env
LLM_PROVIDER=openai
OPENAI_API_KEY=
AI_TIMEOUT_MS=60000
AI_DEMO_MODE=false
AI_USE_MOCK_FALLBACK=false
AI_PROMPT_REGISTRY_VERSION=v1
AI_LOG_PAYLOADS=false
```

Explain safe defaults for local, demo, test, and production-academic environments.

---

# 10. PromptOps Strategy

This is one of the most important sections.

Cover:

## 10.1 Prompt registry

Explain how prompts are organized and referenced by stable IDs.

Include recommended folder structure:

```text
src/modules/ai-assistance/
  application/
  domain/
  ports/
  infrastructure/
    providers/
    prompt-registry/
      prompts/
        event-plan.v1.prompt.ts
        checklist.v1.prompt.ts
        budget-suggestion.v1.prompt.ts
        vendor-categories.v1.prompt.ts
        quote-brief.v1.prompt.ts
        quote-comparison.v1.prompt.ts
        vendor-bio.v1.prompt.ts
        task-prioritization.v1.prompt.ts
      prompt-registry.ts
      prompt-version-loader.ts
```

## 10.2 Prompt template anatomy

Each prompt must have:

* Stable prompt ID.
* Version.
* Feature type.
* System instructions.
* Developer/business rules.
* Input schema reference.
* Output schema reference.
* Locale handling.
* Safety constraints.
* JSON-only instruction.
* Human-in-the-loop reminder.
* Exclusions / out-of-scope constraints.
* Test fixtures.

## 10.3 Prompt versioning

Explain semantic prompt versioning:

```text
PROMPT-EVENT-PLAN-V1
PROMPT-EVENT-PLAN-V2
```

Explain when to create a new version:

* Output schema changes.
* Business rules change.
* Safety constraints change.
* Feature behavior changes.
* Prompt causes regression in tests.

Explain when not to create a new version:

* Typo fixes that do not change behavior.
* Internal comments.
* Refactors that preserve output.

## 10.4 Prompt lifecycle

Include lifecycle stages:

```text
Draft → Reviewed → Approved → Active → Deprecated → Archived
```

Create a table explaining each stage.

## 10.5 Prompt ownership and review

Define who reviews prompt changes:

* Product Owner.
* AI Architect / PromptOps Lead.
* Backend Engineer.
* QA.
* Security reviewer when prompt touches sensitive data.

## 10.6 Prompt changelog

Define that every prompt version should include:

* Reason for change.
* Related FR/BR/UC/NFR.
* Reviewer.
* Date.
* Compatibility notes.
* Test evidence.

---

# 11. `AIPromptVersion` design

Define the recommended `AIPromptVersion` entity.

Include fields such as:

```text
id
prompt_id
version
feature_type
status
language_support
input_schema_version
output_schema_version
template_hash
change_reason
created_by
approved_by
created_at
approved_at
deprecated_at
```

Explain whether this entity is mandatory or recommended based on the existing data model.

Explain how it links to `AIRecommendation.prompt_version_id`.

---

# 12. `AIRecommendation` persistence design

Define how every AI output is persisted.

Include fields such as:

```text
id
type
user_id
event_id
vendor_profile_id
llm_provider
prompt_version_id
language_code
input_payload
output_payload
validated_output_payload
status
accepted
edited
fallback_used
timeout_ms
latency_ms
schema_valid
error_code
correlation_id
created_at
accepted_at
rejected_at
```

Explain statuses:

```text
pending
accepted
rejected
discarded
failed
expired
```

Explain:

* Why pending is the default.
* How accepted materializes official entities.
* How rejected/discarded remains historical.
* How edited outputs should be stored.
* How fallback usage is recorded.

---

# 13. Input and Output Schema Strategy

Explain that all AI inputs and outputs must be schema-based.

Mention Zod as the recommended validation strategy.

For each AI feature, provide a high-level schema table with:

```text
Feature
Input DTO
Output DTO
Validator
Materialization target
```

Include examples for at least:

* Event plan output.
* Checklist output.
* Budget suggestion output.
* Quote brief output.
* Quote comparison output.

Include TypeScript/Zod pseudocode for one output schema.

---

# 14. AI Runtime Flow

Document the standard runtime flow.

Include this flow:

```text
User action
→ Frontend calls REST endpoint
→ Backend validates auth/RBAC/ownership
→ Use case loads domain context
→ Prompt builder selects prompt version
→ Prompt builder minimizes input payload
→ LLMProvider calls active provider with timeout
→ Output validator validates structured JSON
→ AIRecommendation is persisted as pending
→ Frontend displays suggestion
→ User accepts/edits/rejects
→ Backend materializes official entities if accepted
→ Trace/audit remains available
```

Include a Mermaid sequence diagram.

---

# 15. Human-in-the-loop Materialization

Explain how AI suggestions become official data.

Include table:

```text
AI feature
AIRecommendation type
Accepted target entity
Materialization use case
Editable before accepting
```

Examples:

* Checklist → EventTask.
* Budget suggestion → BudgetItem.
* Quote brief → QuoteRequest.brief.
* Vendor bio → VendorProfile.bio.
* Vendor package description → VendorService.description.

Explain that AI-006 and AI-008 may not materialize entities and can remain read-only recommendations.

---

# 16. Timeout, Retry, and Fallback Design

Document:

* Timeout = 60,000 ms.
* Maximum one retry for invalid structured output if applicable.
* No aggressive retry loops.
* Fallback allowed only in demo/testing mode if configured.
* Controlled error outside demo/testing.
* Fallback must be visible in metadata and logs.

Create decision table:

```text
Scenario
AI_DEMO_MODE
AI_USE_MOCK_FALLBACK
Behavior
User-facing result
Trace fields
```

Include scenarios:

* OpenAI success.
* OpenAI timeout in demo mode with fallback enabled.
* OpenAI timeout in production-academic mode.
* Invalid JSON with retry success.
* Invalid JSON with retry failure.
* Provider not configured.
* AnthropicProvider selected by mistake.

Include Mermaid sequence diagram for timeout fallback.

---

# 17. Error Handling Strategy

Define AI-specific error codes.

Examples:

```text
AI_PROVIDER_TIMEOUT
AI_PROVIDER_UNAVAILABLE
AI_INVALID_OUTPUT_SCHEMA
AI_PROMPT_VERSION_NOT_FOUND
AI_PROVIDER_NOT_CONFIGURED
AI_FALLBACK_USED
AI_RECOMMENDATION_NOT_PENDING
AI_UNAUTHORIZED_CONTEXT
AI_INPUT_POLICY_VIOLATION
```

Include:

* HTTP mapping.
* User-facing message.
* Internal log details.
* Whether retry is allowed.
* Whether fallback is allowed.

---

# 18. Observability and Traceability

Define the observability strategy.

Include:

* Correlation ID.
* Structured logs.
* Metrics.
* AIRecommendation persistence.
* Prompt version trace.
* Provider latency.
* Fallback usage.
* Schema validation result.
* User decision.

Create table of required metrics:

```text
Metric
Description
Dimension
Purpose
```

Examples:

* `ai_request_total`
* `ai_request_latency_ms`
* `ai_timeout_total`
* `ai_fallback_total`
* `ai_schema_validation_failed_total`
* `ai_recommendation_accepted_total`
* `ai_recommendation_rejected_total`
* `ai_provider_error_total`

Mention that logs must not store secrets or unnecessary sensitive payloads.

---

# 19. Security and Privacy Design for AI

This section must be detailed.

Cover:

## 19.1 Data minimization

Prompts must include only the minimum necessary data.

Do not send:

* Passwords.
* Session tokens.
* API keys.
* Payment data.
* Full private contact data unless strictly required.
* Internal admin notes unless needed.
* Sensitive legal or identity documents.

## 19.2 Prompt injection mitigation

Explain that user-provided content is treated as data, not instructions.

Include techniques:

* Delimit user content.
* Strong system/developer prompt boundaries.
* Output schema validation.
* Do not allow user content to override system rules.
* Avoid tool execution from model output.
* Do not trust model output as executable logic.
* Validate all materialized data server-side.

## 19.3 Output safety

Define:

* JSON validation.
* Domain rule validation after AI output.
* No direct side effects from provider response.
* Human review before materialization.
* Safe fallback messages.

## 19.4 Secrets management

Mention:

* API keys only in backend environment variables.
* No frontend exposure.
* No secrets in logs.
* `.env.example` with placeholder values only.

## 19.5 Authorization before AI calls

Every AI endpoint must validate:

* Authentication.
* Role.
* Ownership.
* Entity status.
* Feature permission.

## 19.6 Logging privacy

Define when payload logging is disabled by default.

Mention `AI_LOG_PAYLOADS=false`.

If enabled locally, logs must be redacted.

---

# 20. Multi-language Prompt Strategy

EventFlow supports:

```text
es-LATAM
es-ES
pt
en
```

Explain:

* Language is passed through `AIContext`.
* Prompt templates must instruct the provider to respond in the event/user language.
* Output keys remain stable in English or technical identifiers.
* Human-readable text follows the target locale.
* Fallback templates must also support language.
* If language is missing, fallback to `es-LATAM`.

Include a table:

```text
Language code
Expected tone
Use case
Fallback behavior
```

---

# 21. Currency and Locale Constraints in Prompts

Explain:

* Event currency is immutable after event creation.
* AI can suggest budget distribution but cannot convert currencies automatically.
* AI output must preserve the event currency.
* Prompts must include currency code as context.
* Budget suggestions must not invent exchange rates.

---

# 22. API Integration for AI Flows

Summarize AI-related REST endpoints expected from the API Design document.

Include endpoints such as:

```text
POST /api/v1/events/:eventId/ai/plan
POST /api/v1/events/:eventId/ai/checklist
POST /api/v1/events/:eventId/ai/budget
POST /api/v1/events/:eventId/ai/vendor-categories
POST /api/v1/quote-requests/ai/brief
POST /api/v1/quotes/ai/comparison
POST /api/v1/vendors/:vendorProfileId/ai/bio
POST /api/v1/events/:eventId/ai/task-prioritization
POST /api/v1/ai-recommendations/:id/accept
POST /api/v1/ai-recommendations/:id/reject
```

If actual endpoint paths in `/docs/16` differ, use those instead.

Explain request/response conventions at high level.

---

# 23. Frontend AI UX Contract

Explain what the frontend must receive from the backend.

Include:

* Recommendation ID.
* Type.
* Provider metadata.
* Prompt version.
* Fallback flag.
* Output payload.
* Status.
* Editable fields.
* Acceptance/rejection actions.
* Clear "AI suggestion" badges.
* Error messages.
* Loading and timeout states.

Explain that the frontend:

* Does not call LLM providers directly.
* Does not store provider keys.
* Does not materialize AI output locally as official data.
* Must call backend accept/reject endpoints.

---

# 24. Testing Strategy for AI Architecture

Include:

## 24.1 Unit tests

* Prompt builder.
* Prompt registry.
* Output validators.
* Fallback service.
* AI use cases.
* Provider selection.

## 24.2 Integration tests

* AI endpoint with MockAIProvider.
* AIRecommendation persistence.
* Accept/reject flows.
* RBAC + ownership negative tests.
* Invalid JSON handling.
* Timeout handling.

## 24.3 Contract tests

* Input/output DTO compatibility.
* Frontend MSW fixtures.
* Zod schemas.

## 24.4 E2E tests

* Generate checklist → edit → accept → EventTask created.
* Generate budget → accept → BudgetItem created.
* Generate quote brief → edit → send QuoteRequest.
* Timeout fallback in demo mode.

## 24.5 Deterministic mock strategy

Explain that `MockAIProvider` must return stable outputs by:

* Feature type.
* Event type.
* Locale.
* Seed scenario.
* Prompt version.

---

# 25. Demo Mode Design

Explain how demo mode works.

Include:

* `AI_DEMO_MODE=true`.
* `LLM_PROVIDER=mock` or OpenAI with fallback enabled.
* Deterministic output.
* Seed data alignment.
* No dependence on network availability if mock is selected.
* Visible metadata for demo/debug if needed.
* Clear warning in logs when mock is active.

---

# 26. Configuration Matrix by Environment

Create a table:

```text
Environment
LLM_PROVIDER
AI_DEMO_MODE
AI_USE_MOCK_FALLBACK
AI_LOG_PAYLOADS
Expected behavior
```

Include:

* local-dev
* test
* demo-academic
* production-academic

---

# 27. Prompt and AI Governance

Define governance rules:

* Who can approve prompt versions.
* How prompt changes are reviewed.
* When ADR is required.
* When Product Owner decision is required.
* How regressions are handled.
* How prompt changes are traced to FR/BR/UC/NFR.
* How deprecated prompts are kept for audit.

---

# 28. Risks and Mitigations

Create a table:

```text
Risk
Impact
Probability
Mitigation
Related document/rule
```

Include at least:

* Provider coupling.
* Prompt injection.
* Sensitive data leakage.
* Invalid JSON outputs.
* AI hallucinated prices or exchange rates.
* AI output applied without human confirmation.
* Demo failure due to provider outage.
* Prompt version drift.
* Logs storing too much information.
* Anthropic stub accidentally enabled.
* Scope creep toward chatbot or autonomous agent.

---

# 29. ADRs Recommended

List ADRs that should be formalized or referenced.

At minimum:

* Use `LLMProvider` abstraction.
* Use OpenAIProvider as MVP provider.
* Use MockAIProvider for tests/demo/fallback.
* Keep AnthropicProvider as stub/future.
* Enforce human-in-the-loop AI materialization.
* Use prompt versioning.
* Persist AIRecommendation for every AI output.
* Use structured JSON outputs with schema validation.
* Use 60s timeout and controlled fallback.
* Keep AI integration backend-only.

---

# 30. Implementation Checklist

Create checklist grouped by:

## Architecture

## Providers

## PromptOps

## Persistence

## API

## Frontend contract

## Security

## Observability

## Testing

## Demo readiness

Each item must be actionable.

---

# 31. Límites explícitos del MVP

Create a clear list of out-of-scope items:

* No autonomous AI agent.
* No general-purpose chatbot.
* No AI vendor approval.
* No AI review moderation.
* No AI contract generation.
* No payment processing.
* No AI-based legal advice.
* No image generation.
* No WhatsApp AI.
* No direct frontend-to-LLM calls.
* No production-grade provider routing.
* No automatic provider comparison.
* No real Anthropic implementation required.
* No vector database / RAG unless explicitly approved later.
* No embeddings-based semantic search unless explicitly approved later.

---

# 32. Conclusión

Summarize how this document enables implementation of a safe, testable, traceable, and MVP-aligned AI layer.

Mention that any deviation must be reflected in the corresponding architecture documents and ADRs.

---

## QUALITY RULES

The generated document must:

* Be written in **Spanish LATAM neutral**.
* Use precise technical language.
* Avoid generic AI architecture advice not tied to EventFlow.
* Avoid introducing unsupported scope.
* Include tables where useful.
* Include Mermaid diagrams where useful.
* Include TypeScript pseudocode where useful.
* Clearly distinguish MVP vs Future vs Out of Scope.
* Maintain traceability to existing documents.
* Be implementation-ready but not actual production code.
* Be consistent with Node.js + Express + TypeScript + Prisma + PostgreSQL.
* Be consistent with Next.js frontend consuming REST only.
* Be consistent with Clean / Hexagonal Architecture.
* Be consistent with Modular Monolith.
* Be consistent with human-in-the-loop AI.
* Be consistent with provider abstraction.
* Be consistent with 60s timeout and fallback strategy.
* Be consistent with AIRecommendation and AIPromptVersion traceability.

---

## IMPORTANT VALIDATION BEFORE FINALIZING

Before producing the final document, verify:

1. No provider SDK leaks outside Infrastructure.
2. No frontend direct call to any AI provider.
3. No autonomous AI decision is introduced.
4. Every AI output is persisted as AIRecommendation.
5. Every materialized AI output requires human acceptance.
6. Prompt versioning is explicitly covered.
7. Fallback behavior is environment-controlled.
8. Timeout is exactly 60,000 ms.
9. MockAIProvider is mandatory.
10. AnthropicProvider remains stub/future.
11. Security and privacy are covered in detail.
12. Traceability is covered end-to-end.
13. Testing includes deterministic mock behavior.
14. MVP exclusions are explicitly listed.

Now generate the complete document `/docs/17-AI-Architecture-and-PromptOps-Design.md`.
