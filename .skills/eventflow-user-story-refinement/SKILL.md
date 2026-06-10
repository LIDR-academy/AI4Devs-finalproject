# EventFlow Skill — User Story Refinement & PO/BA Review

## Purpose

This skill reviews, validates, refines, and optionally updates EventFlow User Stories from the perspective of a **Product Owner**, **Business Analyst**, and **Delivery Readiness Reviewer**.

Its purpose is to determine whether a User Story is:

* Clear.
* Valuable.
* Testable.
* Traceable.
* Aligned with the EventFlow MVP.
* Safe from scope creep.
* Ready to move into the formal Approval Gate.

This skill may update the User Story file in place **only when no blocking decisions remain**.

If blocking decisions exist, this skill must not update the original User Story file. Instead, it must create or update a refinement review artifact containing the review findings and pending questions for the `eventflow-po-ba-decision-resolver` skill.

This skill does **not** approve User Stories.

This skill does **not** generate Development Tasks.

---

## When to Use This Skill

Use this skill after a User Story has been generated and before the formal Approval Gate.

Typical usage:

```text
Use the eventflow-user-story-refinement skill.

Review and refine:

management/user-stories/US-099.md
```

This skill should be run:

1. After initial User Story generation.
2. After PO/BA decision resolution, if a second validation pass is desired.
3. Before running the `eventflow-user-story-approval` skill.

---

## Expected Input

The user should provide the path to a User Story markdown file.

Example:

```text
management/user-stories/US-099.md
```

The skill must read the file directly from the provided path.

---

## Required Files and Artifact Paths

### Input User Story File

The provided User Story file path is the main input.

Example:

```text
management/user-stories/US-099.md
```

### Optional Decision Resolution Artifact

Before reviewing, this skill must check whether a decision resolution artifact exists at:

```text
management/user-stories/decision-resolutions/<USER_STORY_ID>-decision-resolution.md
```

If it exists, the skill must read it before validating the User Story.

### Refinement Review Artifact

If blocking questions exist, this skill must create or overwrite:

```text
management/user-stories/refinement-reviews/<USER_STORY_ID>-refinement-review.md
```

This artifact must contain the full refinement review and all pending questions needed by the `eventflow-po-ba-decision-resolver` skill.

---

## Source of Truth

Use the official EventFlow documentation as source of truth:

* `/management/artifacts/Product-Backlog-Prioritized.md`
* `/management/artifacts/EventFlow-Epic-Map.md`
* `/management/templates/user-story.tpl.md`
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
* `/docs/12-Architecture-Vision-and-Principles.md`
* `/docs/13-System-Architecture-Document.md`
* `/docs/14-Backend-Technical-Design.md`
* `/docs/15-Frontend-Architecture-Design.md`
* `/docs/16-API-Design-Specification.md`
* `/docs/17-AI-Architecture-and-PromptOps-Design.md`
* `/docs/18-Database-Physical-Design.md`
* `/docs/19-Security-and-Authorization-Design.md`
* `/docs/20-Testing-Strategy.md`
* `/docs/21-Deployment-and-DevOps-Design.md`
* `/docs/22-Architecture-Decision-Records.md`

---

## Decision Precedence Rules

When reviewing a User Story, apply this decision hierarchy:

1. Accepted ADRs.
2. Decision Resolution artifacts located at:

```text
management/user-stories/decision-resolutions/<USER_STORY_ID>-decision-resolution.md
```

3. The User Story section `PO/BA Decisions Applied`.
4. Product Backlog Prioritized.
5. Epic Map.
6. Architecture and technical design documents.
7. Domain discovery and earlier analysis documents.

If the User Story includes a `PO/BA Decisions Applied` section, treat those decisions as already resolved unless:

* They contradict an accepted ADR.
* They introduce MVP scope creep.
* They create a clear implementation impossibility.
* They require a formal ADR because they override a major architectural decision.

Do **not** ask again a question that is already explicitly answered in:

* The Decision Resolution artifact.
* The User Story section `PO/BA Decisions Applied`.
* A formal ADR.

If a decision already exists but conflicts with another document, classify it as:

```text
Documentation Alignment Required
```

Do not classify it as an unresolved PO/Tech/QA/Security question unless the decision itself is missing.

---

## Documentation Alignment Rules

If a decision is already made in the User Story or in the Decision Resolution artifact but conflicts with another source document, do not ask the same question again.

Instead, create a finding like this:

| Severidad | Hallazgo                                                                            | Impacto                                                         | Recomendación                                                                                                      |
| --------- | ----------------------------------------------------------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Media     | Documentation Alignment Required: `<decision>` conflicts with `<document/section>`. | Puede generar confusión futura o reabrir decisiones ya tomadas. | Actualizar el documento fuente o crear ADR de override. No bloquear la User Story si la decisión está formalizada. |

Use this classification logic:

| Situation                                        | Classification                   |
| ------------------------------------------------ | -------------------------------- |
| Decision missing                                 | Pending Question                 |
| Decision already in User Story                   | Resolved Decision                |
| Decision already in Decision Resolution artifact | Resolved Decision                |
| Decision conflicts with older docs               | Documentation Alignment Required |
| Decision conflicts with accepted ADR             | Blocking Issue                   |
| Decision introduces scope creep                  | Blocking Issue                   |
| Decision creates implementation impossibility    | Blocking Issue                   |

Documentation alignment issues should not block approval if:

* The decision is already formalized in the Decision Resolution artifact or `PO/BA Decisions Applied`.
* The decision does not contradict an accepted ADR.
* The decision does not introduce scope creep.
* The decision does not create implementation impossibility.

---

## EventFlow Product Principles

Always preserve these EventFlow principles:

1. MVP-first.
2. Foundation before product.
3. Demo-first.
4. Human-in-the-loop for AI.
5. Backend as source of truth for authorization.
6. Seed-first demo readiness.
7. No transactional marketplace in MVP.
8. No scope creep.
9. Traceability is mandatory.
10. Quality gates are part of delivery, not polish.
11. Academic evidence must remain traceable.

---

## MVP Guardrails

Reject, flag, or keep out of scope anything that introduces:

* Real payments.
* Commissions.
* Signed contracts.
* E-signature.
* WhatsApp integration.
* Real-time chat.
* Native mobile app.
* Push notifications in MVP.
* Automatic currency conversion.
* Autonomous AI decisions.
* AI moderation of reviews.
* RAG / vector database.
* Enterprise multi-tenancy.
* Functional AnthropicProvider beyond approved stub.
* Google OAuth if marked Future.
* Vendor AI bio/package generation if marked Future.
* Vendor response to reviews if marked Future.
* Any other P4 / Future item unless explicitly promoted through ADR and PO approval.

If any User Story introduces one of these items, mark it as:

```text
Blocked
```

Unless the item is explicitly and formally promoted through a Product Owner decision and ADR.

---

## Required Actions

The skill must:

1. Read the User Story file from the provided path.
2. Verify that the file exists.
3. Verify that the file is a markdown User Story.
4. Extract the User Story ID from the file.
5. Search for the Decision Resolution artifact at:

```text
management/user-stories/decision-resolutions/<USER_STORY_ID>-decision-resolution.md
```

6. Read the Decision Resolution artifact if it exists.
7. Validate the User Story against EventFlow documentation.
8. Apply the Decision Precedence Rules.
9. Apply the Documentation Alignment Rules.
10. Review the story as Product Owner and Business Analyst.
11. Validate metadata, story statement, business context, acceptance criteria, traceability, scope guardrails, technical notes, QA notes, Definition of Ready, Definition of Done, and out-of-scope sections.
12. Detect missing business, technical, QA, security, AI, seed/demo, or traceability details.
13. Confirm the story does not introduce scope creep.
14. Produce the standard User Story Refinement Review.
15. Decide whether the User Story file can be updated safely.
16. If safe, overwrite the original file with the refined User Story.
17. If not safe, leave the original file unchanged and create/update the refinement review artifact.
18. Do not approve the User Story.
19. Do not generate Development Tasks.
20. Do not create implementation code.

---

## Review Criteria

### Product / BA Review

Check whether:

* The role is correct.
* The goal is clear.
* The business value is explicit.
* The story aligns with its Epic and Backlog Item.
* The story is small enough to implement.
* The story contributes to MVP, demo readiness, technical foundation, QA, or academic evidence.
* Dependencies are clear.
* Assumptions are explicit.
* Out of Scope is explicit.
* Any pending decision is truly unresolved and not already answered in the Decision Resolution artifact or `PO/BA Decisions Applied`.

### Acceptance Criteria Review

Check whether Acceptance Criteria are:

* Specific.
* Testable.
* Written clearly.
* Linked to actual behavior.
* Complete enough for QA.
* Covering happy path.
* Covering negative cases.
* Covering relevant edge cases.
* Aligned with MVP scope.
* Not mixing multiple unrelated stories.
* Not including work that belongs to another User Story.
* Not contradicting already formalized decisions.

If an AC conflicts with an older document but follows a formalized decision, mark as `Documentation Alignment Required`, not as an unresolved question.

### Traceability Review

Check whether the story references relevant:

* Epic.
* Backlog Item.
* FRD.
* Use Cases.
* Business Rules.
* NFRs.
* ADRs.
* API Design.
* Data Model.
* Security Design.
* Testing Strategy.
* Product Owner decisions.
* Architecture documents.
* Decision Resolution artifact, when present.

If a story is technical/foundation and does not implement a direct functional use case, use:

```text
Transversal — no implementa directamente un UC; habilita capacidades futuras.
```

Do not invent fake FR, UC, BR, NFR, or ADR IDs.

### Security Review

If the story touches protected data, roles, resources, authentication, admin actions, AI, upload, quote flows, vendors, organizer data, or ownership, validate:

* Auth requirements.
* Role requirements.
* Ownership requirements.
* Assignment-based authorization.
* Admin-scoped access.
* 401/403 negative cases.
* Audit requirements.
* Sensitive data handling.

If security does not apply, explicitly mark:

```text
No aplica — esta historia no introduce endpoints ni runtime authorization.
```

### AI Review

If the story touches AI, validate:

* Human-in-the-loop.
* `AIRecommendation`.
* Prompt versioning.
* `LLMProvider`.
* `MockAIProvider`.
* Timeout/fallback.
* JSON schema validation.
* Language propagation.
* No autonomous decisions.

If AI does not apply, explicitly mark:

```text
No aplica — esta historia no invoca IA directamente.
```

### QA Review

Validate whether the User Story includes test expectations for:

* Unit tests.
* Integration tests.
* API tests.
* Contract tests.
* E2E tests.
* Security tests.
* Accessibility tests.
* AI tests.
* Seed/demo tests.
* CI quality gates.

Only include applicable test types.

If a QA framework decision is already present in a Decision Resolution artifact, do not ask for it again.

### Seed / Demo Review

If the story affects demo flows, seeded users, events, vendors, quotes, bookings, reviews, notifications, admin metrics, or AI outputs, validate seed/demo impact.

If it does not require seed/demo changes, explicitly mark:

```text
No requiere cambios de seed/demo.
```

---

## File Safety Rules

Before writing any change:

1. Verify the file path exists.
2. Verify the file is a markdown User Story.
3. Verify the file contains a User Story ID.
4. Preserve the same User Story ID.
5. Preserve the same file path.
6. Do not update the User Story file if the User Story ID is ambiguous.
7. Do not update the User Story file if the story contains unresolved blocking questions.
8. Do not update the User Story file if a Tech Lead, QA Lead, Security Lead, or PO decision is truly blocking and unresolved.
9. Do not update the User Story file if the story would introduce scope creep.
10. Do not update the User Story file if the correct refinement would require splitting the story first.
11. Do not treat already formalized decisions as blockers.
12. Do not treat documentation conflicts as blockers when the decision is already formalized and does not contradict an accepted ADR.

If the file path does not exist, return:

```text
User Story file updated: No
Reason: File path not found.
```

If the User Story ID cannot be found, return:

```text
User Story file updated: No
Reason: User Story ID not found or ambiguous.
```

---

## File Persistence Behavior

The provided User Story file path is both the input path and the output path only when the story can be safely refined.

If the User Story can be safely refined:

* Overwrite the original file at the same provided path.
* Replace the full file content with the refined User Story.
* Preserve the same User Story ID.
* Preserve the same file path.
* Do not create a new User Story file.
* Do not create a copy.
* Do not create a backup unless explicitly requested.
* Do not move the file.
* Set `Status: Ready for Approval`.
* Update `Last Updated` to the current date.
* Do not set `Status: Approved`.

If the User Story cannot be safely refined because blocking questions remain:

* Leave the original User Story file unchanged.
* Create or overwrite a refinement review artifact using this path pattern:

```text
management/user-stories/refinement-reviews/<USER_STORY_ID>-refinement-review.md
```

* Store the full User Story Refinement Review in that file.
* Include the exact pending questions that must be resolved by `eventflow-po-ba-decision-resolver`.

The skill must never store pending questions only in the chat response.

The skill must never write to a different path unless the user explicitly provides a separate output path.

---

## File Update Rules

You may update the original User Story file only when all of these conditions are true:

* The User Story can be refined safely using existing EventFlow documentation.
* No blocking PO decision remains unresolved.
* No blocking Tech Lead decision remains unresolved.
* No blocking QA decision remains unresolved.
* No blocking Security decision remains unresolved.
* Any conflict with older documentation is classified as `Documentation Alignment Required`, not as an unresolved question, if the decision is already present in the Decision Resolution artifact or `PO/BA Decisions Applied`.
* The refined story remains within MVP scope.
* The refined story does not introduce out-of-scope functionality.
* The refined story does not need to be split first.
* The final recommended status is `Ready for Approval`, not `Approved`.

If you update the User Story file:

* Replace the full User Story content with the refined version.
* Preserve the same User Story ID.
* Preserve the same file path.
* Preserve the same Epic and Backlog Item unless the current value is clearly wrong.
* Set `Status: Ready for Approval`.
* Update `Last Updated` to the current date.
* Do not set `Status: Approved`.
* Do not generate Development Tasks.
* Do not create implementation code.
* Do not create a new User Story file unless explicitly requested.
* Keep the final User Story in Spanish LATAM neutral.
* Keep technical identifiers, file paths, endpoint names, enums, and code concepts in English.
* Optionally create or update the refinement review artifact as evidence, marking it as non-blocking.

If you do not update the User Story file:

* Keep the original User Story file unchanged.
* Create or update the refinement review artifact.
* Return the review report.
* Clearly list blocking questions.
* Clearly explain why the User Story file was not updated.
* Recommend the next skill: `eventflow-po-ba-decision-resolver`.

---

## Refinement Review Artifact Rules

When blocking questions exist, write the refinement review artifact at:

```text
management/user-stories/refinement-reviews/<USER_STORY_ID>-refinement-review.md
```

If the folder does not exist, create it.

The review artifact must be complete enough for the `eventflow-po-ba-decision-resolver` skill to run without needing previous chat context.

The review artifact must include:

```markdown
# User Story Refinement Review — <USER_STORY_ID>

## Source User Story File
<PATH>

## Decision Resolution Artifact
management/user-stories/decision-resolutions/<USER_STORY_ID>-decision-resolution.md

## Review Date
<YYYY-MM-DD>

## 1. Resultado Ejecutivo
...

## 2. Diagnóstico PO/BA
...

## 3. Hallazgos Principales
...

## 4. Validación de Alcance MVP
...

## 5. Revisión de Acceptance Criteria
...

## 6. Gaps Detectados
...

## 7. Preguntas Pendientes
...

## 8. Documentation Alignment Required
...

## 9. File Update Result
...

## 10. Recomendación Final
...
```

If no blocking questions exist, the refinement review artifact is optional.

---

## Status Rules

Use only these statuses during refinement:

* `Ready for Approval`
* `Needs Refinement`
* `Blocked`
* `Split Required`

Do not use:

* `Approved`
* `Done`
* `In Progress`
* `Ready for Development`
* `Ready for Sprint`

Approval belongs only to the `eventflow-user-story-approval` skill.

Development task generation belongs only to the `eventflow-user-story-to-development-tasks` skill.

---

## Output Language

Always return the review output in **Spanish LATAM neutral**.

Use English only for:

* Technical identifiers.
* File paths.
* Endpoint names.
* Enums.
* Database fields.
* Code-level concepts.
* Official artifact names.

---

## Expected Review Output

Use this format:

# User Story Refinement Review — `<USER_STORY_ID>`

## 1. Resultado Ejecutivo

| Campo                                      | Evaluación                                                       |
| ------------------------------------------ | ---------------------------------------------------------------- |
| User Story ID                              |                                                                  |
| File Path                                  |                                                                  |
| Backlog Item                               |                                                                  |
| Epic                                       |                                                                  |
| Estado actual                              |                                                                  |
| Estado recomendado                         | Ready for Approval / Needs Refinement / Blocked / Split Required |
| Nivel de riesgo                            | Bajo / Medio / Alto                                              |
| Calidad general                            | Alta / Media / Baja                                              |
| Requiere decisión PO                       | Sí / No                                                          |
| Requiere decisión técnica                  | Sí / No                                                          |
| Requiere decisión QA                       | Sí / No                                                          |
| Requiere decisión Seguridad                | Sí / No                                                          |
| Decision Resolution artifact found         | Yes / No                                                         |
| User Story file updated                    | Yes / No                                                         |
| Refinement review artifact created/updated | Yes / No                                                         |
| Refinement review path                     |                                                                  |

---

## 2. Diagnóstico PO/BA

Explain whether the User Story is valuable, clear, aligned with the backlog, and useful for MVP execution.

---

## 3. Hallazgos Principales

| Severidad           | Hallazgo | Impacto | Recomendación |
| ------------------- | -------- | ------- | ------------- |
| Alta / Media / Baja |          |         |               |

---

## 4. Validación de Alcance MVP

| Check                                | Resultado         | Comentario |
| ------------------------------------ | ----------------- | ---------- |
| No introduce pagos reales            | Pass / Fail / N/A |            |
| No introduce contratos firmados      | Pass / Fail / N/A |            |
| No introduce WhatsApp/chat/push      | Pass / Fail / N/A |            |
| Respeta human-in-the-loop IA         | Pass / Fail / N/A |            |
| Respeta backend como source of truth | Pass / Fail / N/A |            |
| Respeta seed/demo si aplica          | Pass / Fail / N/A |            |
| No introduce RAG/vector DB           | Pass / Fail / N/A |            |
| No introduce multi-tenant enterprise | Pass / Fail / N/A |            |
| No introduce P4/Future scope         | Pass / Fail / N/A |            |

---

## 5. Revisión de Acceptance Criteria

| AC    | Calidad                                                                                        | Problema detectado | Acción recomendada |
| ----- | ---------------------------------------------------------------------------------------------- | ------------------ | ------------------ |
| AC-01 | Clear / Needs Detail / Not Testable / Missing Negative Case / Missing Edge Case / Out of Scope |                    |                    |

If an AC should be rewritten, provide the suggested rewritten AC.

---

## 6. Gaps Detectados

### Producto / Negocio

### Backend / API

### Frontend / UX

### Base de Datos

### Seguridad / Autorización

### IA / PromptOps

### QA / Testing

### Seed / Demo

### Documentación / Trazabilidad

If an area does not apply, write:

```text
No aplica.
```

---

## 7. Preguntas Pendientes

| Tipo                      | Pregunta | Bloquea aprobación | Responsable |
| ------------------------- | -------- | ------------------ | ----------- |
| PO / Tech / QA / Security |          | Sí / No            |             |

If there are no pending blocking questions, write:

```text
No pending blocking questions.
```

Do not include questions that are already answered in the Decision Resolution artifact or in `PO/BA Decisions Applied`.

---

## 8. Documentation Alignment Required

| Documento / Fuente | Conflicto detectado | Decisión vigente | Acción recomendada | ¿Bloquea aprobación? |
| ------------------ | ------------------- | ---------------- | ------------------ | -------------------- |
|                    |                     |                  |                    | Sí / No              |

If there are no documentation alignment issues, write:

```text
No documentation alignment issues detected.
```

---

## 9. File Update Result

| Campo                                      | Valor                                                                                 |
| ------------------------------------------ | ------------------------------------------------------------------------------------- |
| User Story file updated                    | Yes / No                                                                              |
| User Story file path                       | `<PATH>`                                                                              |
| User Story ID verified                     | Yes / No                                                                              |
| Decision Resolution artifact found         | Yes / No                                                                              |
| Decision Resolution path                   | `management/user-stories/decision-resolutions/<USER_STORY_ID>-decision-resolution.md` |
| Refinement review artifact created/updated | Yes / No                                                                              |
| Refinement review path                     | `management/user-stories/refinement-reviews/<USER_STORY_ID>-refinement-review.md`     |
| Final recommended status                   | Ready for Approval / Needs Refinement / Blocked / Split Required                      |
| Next recommended skill                     | eventflow-po-ba-decision-resolver / eventflow-user-story-approval                     |
| Reason                                     |                                                                                       |

---

## 10. Cambios Aplicados o Recomendados

If the User Story file was updated, list the actual applied changes.

If the User Story file was not updated, list the recommended changes to be applied after pending decisions are resolved.

Group by section:

### Metadata

### Business Context

### PO/BA Decisions Applied

### Traceability

### Scope Guardrails

### Acceptance Criteria

### Technical Notes

### QA Notes

### Definition of Ready

### Definition of Done

### Notes

---

## 11. Recomendación Final

Choose one:

* `Ready for Approval`
* `Needs Refinement`
* `Blocked`
* `Split Required`

Explain why.

---

## Required Behavior When User Story File Is Updated

If you update the User Story file, the final response must include:

```text
User Story file updated: Yes
Path: <PATH>
Status: Ready for Approval
Next step: Run `eventflow-user-story-approval`.
```

Also include a concise summary of the most important changes.

---

## Required Behavior When User Story File Is Not Updated

If you do not update the User Story file, the final response must include:

```text
User Story file updated: No
Path: <PATH>
Refinement review artifact created/updated: Yes
Review path: management/user-stories/refinement-reviews/<USER_STORY_ID>-refinement-review.md
Status: Needs Refinement / Blocked / Split Required
Next step: Run `eventflow-po-ba-decision-resolver`.
```

Also include the exact pending questions that must be resolved.

---

## Quality Rules

Before finalizing:

* Do not approve the User Story.
* Do not generate Development Tasks.
* Do not create implementation code.
* Do not introduce unsupported requirements.
* Do not invent fake traceability IDs.
* Do not weaken MVP scope guardrails.
* Do not silently update files when blockers exist.
* Do not overwrite the User Story file if the User Story ID is missing or ambiguous.
* Do not change the User Story ID.
* Do not mark a story as `Ready for Approval` if any blocking decision remains.
* Do not store pending questions only in the chat response.
* Always create/update the refinement review artifact if blocking questions exist.
* Do not re-ask questions already answered by Decision Resolution artifacts.
* Do not re-ask questions already answered in `PO/BA Decisions Applied`.
* Use `Documentation Alignment Required` for conflicts with older docs when a decision is already formalized.
* Prefer explicit pending questions over assumptions.
* Keep all output in Spanish LATAM neutral.
