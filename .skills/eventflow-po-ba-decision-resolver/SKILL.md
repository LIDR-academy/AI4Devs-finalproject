# EventFlow Skill — PO/BA Decision Resolver

## Purpose

This skill acts as a **Product Owner / Business Analyst Decision Resolver** for EventFlow User Stories.

Its purpose is to answer pending PO/BA, business, scope, traceability, QA, and technical-alignment questions generated during User Story refinement.

This skill must formalize decisions so that the `eventflow-user-story-refinement` skill does not ask the same questions again.

It must:

1. Read the User Story file.
2. Read the refinement review artifact.
3. Resolve pending questions.
4. Apply the decisions directly to the User Story file when safe.
5. Create or update a Decision Resolution artifact.
6. Mark documentation conflicts as alignment work instead of leaving them as repeated unresolved questions.

This skill does **not** approve the User Story.

This skill does **not** generate Development Tasks.

---

## When to Use This Skill

Use this skill after the `eventflow-user-story-refinement` skill returns:

* `Needs Refinement`.
* `Blocked`.
* `Split Required`.
* Pending questions.
* Unresolved PO decisions.
* Unresolved BA decisions.
* Scope boundary questions.
* MVP guardrail questions.
* Traceability conflicts.
* Documentation alignment issues requiring formal PO/BA decision.

Typical usage:

```text
Use the eventflow-po-ba-decision-resolver skill.

Resolve pending decisions for:

management/user-stories/US-099.md

Using:

management/user-stories/refinement-reviews/US-099-refinement-review.md
```

---

## Position in Workflow

Recommended EventFlow workflow:

```text
1. Generate User Story
2. Run eventflow-user-story-refinement
3. If blockers or pending questions exist, run eventflow-po-ba-decision-resolver
4. The resolver updates the User Story and creates a Decision Resolution artifact
5. Run eventflow-user-story-refinement again if a second validation pass is desired
6. Run eventflow-user-story-approval
7. Run eventflow-user-story-to-development-tasks
```

---

## Expected Input

The user should provide:

1. User Story file path.
2. Refinement review artifact path.

Example:

```text
User Story:
management/user-stories/US-099.md

Refinement Review:
management/user-stories/refinement-reviews/US-099-refinement-review.md
```

If the refinement review path is not provided, derive it using:

```text
management/user-stories/refinement-reviews/<USER_STORY_ID>-refinement-review.md
```

---

## Required Files and Artifact Paths

### Input User Story File

```text
management/user-stories/<USER_STORY_ID>.md
```

### Input Refinement Review Artifact

```text
management/user-stories/refinement-reviews/<USER_STORY_ID>-refinement-review.md
```

### Output Decision Resolution Artifact

This skill must create or overwrite:

```text
management/user-stories/decision-resolutions/<USER_STORY_ID>-decision-resolution.md
```

The Decision Resolution artifact is mandatory.

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

## Decision Authority

This skill may make decisions as:

* Product Owner.
* Business Analyst.
* MVP Scope Guardian.
* Traceability Reviewer.
* Delivery Readiness Reviewer.

This skill may make final decisions on:

* MVP scope.
* Story boundaries.
* Out of scope.
* Priority interpretation.
* Backlog alignment.
* Business rules interpretation.
* User role clarification.
* Acceptance Criteria intent.
* Demo readiness expectations.
* Traceability cleanup.
* Documentation alignment when older docs conflict with the current refined User Story.
* Whether the story is ready to move back to refinement or approval.

This skill may recommend technical decisions, but must clearly label them as:

```text
Recommended Decision — Requires Tech Lead Validation
```

Use this label when the decision belongs primarily to:

* Tech Lead.
* Security Lead.
* QA Lead.
* DevOps Lead.
* AI Engineer.

However, if the project documentation already defines the technical direction clearly, apply the documented decision directly and cite it as a project decision.

---

## Decision Formalization Rule

Every answered question must be formalized in the Decision Resolution artifact.

If a decision is applied to the User Story, it must also appear in the User Story section:

```markdown
### PO/BA Decisions Applied
```

If the User Story does not contain this section, create it under `## 🧠 Business Context`.

The purpose of this section is to prevent future refinement passes from reopening the same decisions.

Each decision should be written as a clear, stable statement.

Example:

| Decision            | Resolution                                                                                           |
| ------------------- | ---------------------------------------------------------------------------------------------------- |
| `EventType` PK      | `EventType` uses `id UUID` as Primary Key and `code String` as functional unique identifier.         |
| QA structural tests | Structural tests use Vitest and may inspect `schema.prisma` as text or lightweight parsed structure. |

---

## Decision Precedence Rules

When resolving pending questions, apply this hierarchy:

1. Accepted ADRs.
2. Existing Decision Resolution artifact.
3. `PO/BA Decisions Applied` section in the User Story.
4. Product Backlog Prioritized.
5. Epic Map.
6. Architecture and technical design documents.
7. Domain discovery and earlier analysis documents.

If a question was already answered in an existing Decision Resolution artifact or in `PO/BA Decisions Applied`, do not change it unless:

* It contradicts an accepted ADR.
* It introduces scope creep.
* It creates implementation impossibility.
* The user explicitly asks to reverse or reconsider it.

If an existing decision conflicts with older documentation, classify it as:

```text
Documentation Alignment Required
```

Do not reopen it as a pending question.

---

## Documentation Alignment Rules

If resolving a question creates a conflict with an older document, do not leave it as unresolved if the decision is needed to move the User Story forward.

Instead:

1. Make the PO/BA decision if within authority.
2. Apply it to the User Story.
3. Record it in the Decision Resolution artifact.
4. Add a `Documentation Alignment Required` section to the Decision Resolution artifact.
5. Recommend updating the affected document or creating an ADR if the conflict overrides a major architectural decision.

Use this format:

| Documento / Fuente | Conflicto detectado | Decisión vigente | Acción recomendada | ¿Bloquea aprobación? |
| ------------------ | ------------------- | ---------------- | ------------------ | -------------------- |
|                    |                     |                  |                    | Sí / No              |

Documentation alignment issues should not block the User Story if:

* The decision is formally recorded.
* It does not contradict an accepted ADR.
* It does not introduce scope creep.
* It does not create implementation impossibility.

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

Do not make decisions that introduce:

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

If a pending question suggests any of the above, answer with:

```text
Decision: Out of Scope for MVP
```

And explain where it belongs:

* `Future`
* `v1.1`
* `P4`
* `Requires ADR if promoted`

---

## Required Actions

The skill must:

1. Read the User Story file from the provided path.
2. Read the refinement review artifact from the provided path.
3. Verify that both files exist.
4. Extract the User Story ID from both files.
5. Verify that the User Story ID matches in both files.
6. Extract pending questions from the refinement review.
7. Check for an existing Decision Resolution artifact.
8. If a Decision Resolution artifact exists, read it before answering.
9. Avoid re-answering already formalized decisions unless they must be updated.
10. Answer each pending question as PO/BA.
11. Make clear formal decisions.
12. Explain the rationale for each decision.
13. Identify which sections of the User Story must change.
14. Update the original User Story file in place when all blockers are resolved.
15. Add or update the `PO/BA Decisions Applied` section in the User Story.
16. Create or overwrite the Decision Resolution artifact.
17. Set the User Story `Status` to `Ready for Approval` only if all blocking questions are resolved.
18. Keep the User Story `Status` as `Needs Refinement`, `Blocked`, or `Split Required` if any blocking question remains unresolved.
19. Do not set the User Story to `Approved`.
20. Do not generate Development Tasks.
21. Do not create implementation code.

---

## File Safety Rules

Before writing any change:

1. Verify the User Story file path exists.
2. Verify the refinement review artifact path exists.
3. Verify both files contain the same User Story ID.
4. Do not update the User Story file if the IDs do not match.
5. Do not update the User Story file if pending questions cannot be extracted.
6. Do not update the User Story file if unresolved blockers remain.
7. Do not update the User Story file if the required decision belongs to another owner and the documentation does not provide enough support.
8. Do not update the User Story file if the answer would introduce scope creep.
9. Do not update the User Story file if the story must be split first.

If the User Story file path does not exist, return:

```text
User Story file updated: No
Reason: User Story file path not found.
```

If the refinement review artifact path does not exist, return:

```text
User Story file updated: No
Reason: Refinement review artifact path not found.
```

If the IDs do not match, return:

```text
User Story file updated: No
Reason: User Story ID mismatch between User Story file and refinement review artifact.
```

---

## File Persistence Behavior

The User Story file path is both the input path and output path for the updated User Story.

If all blocking questions are resolved:

* Overwrite the original User Story file at the same provided path.
* Apply the decisions into the relevant sections.
* Add or update the `PO/BA Decisions Applied` section.
* Set `Status: Ready for Approval`.
* Update `Last Updated` to the current date.
* Do not create a new User Story file.
* Do not move the User Story file.
* Do not create a copy unless explicitly requested.

If some blockers remain:

* Do not update the User Story file.
* Create or update the Decision Resolution artifact explaining why blockers remain.
* Recommend the next action.

In all cases, create or overwrite the Decision Resolution artifact using this path pattern:

```text
management/user-stories/decision-resolutions/<USER_STORY_ID>-decision-resolution.md
```

If the folder does not exist, create it.

---

## Decision Resolution Artifact Rules

The Decision Resolution artifact must be complete enough to understand:

* What questions were asked.
* What answers were given.
* What decisions were taken.
* Why each decision was made.
* Whether each question blocked approval.
* What User Story sections were updated.
* Whether documentation alignment is required.
* Whether any validation remains.
* Whether the User Story is now ready for approval.

Write the artifact at:

```text
management/user-stories/decision-resolutions/<USER_STORY_ID>-decision-resolution.md
```

Use this structure:

```markdown
# PO/BA Decision Resolution — <USER_STORY_ID>

## Source User Story File
<PATH>

## Source Refinement Review File
<PATH>

## Decision Date
<YYYY-MM-DD>

## 1. Resumen Ejecutivo
...

## 2. Decisiones Respondidas
...

## 3. Consolidated Decision Table
...

## 4. Cambios Aplicados a la User Story
...

## 5. Documentation Alignment Required
...

## 6. Estado recomendado después de aplicar decisiones
...

## 7. Próximo Paso Recomendado
...
```

---

## Sections to Update in the User Story

Apply decisions directly into the User Story where relevant.

Possible sections:

* Metadata.
* Business Context.
* PO/BA Decisions Applied.
* Assumptions.
* Dependencies.
* Traceability.
* Scope Guardrails.
* Acceptance Criteria.
* Edge Cases.
* Validation Rules.
* Authorization & Security Rules.
* AI Behavior.
* Technical Notes.
* Test Scenarios.
* Definition of Ready.
* Definition of Done.
* Notes.

Do not append unresolved decision notes randomly at the end if they belong in a specific section.

Keep the User Story clean, execution-ready, and readable.

---

## Status Rules

Use only these statuses after decision resolution:

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

Always return the decision resolution output in **Spanish LATAM neutral**.

Use English only for:

* Technical identifiers.
* File paths.
* Endpoint names.
* Enums.
* Database fields.
* Code-level concepts.
* Official artifact names.

---

## Expected Output

Use this format:

# PO/BA Decision Resolution — `<USER_STORY_ID>`

## 1. Resumen Ejecutivo

| Campo                                        | Valor                              |
| -------------------------------------------- | ---------------------------------- |
| User Story ID                                |                                    |
| User Story file path                         |                                    |
| Refinement review artifact path              |                                    |
| Existing decision resolution found           | Yes / No                           |
| Backlog Item                                 |                                    |
| Epic                                         |                                    |
| Estado antes de decisiones                   | Needs Refinement / Blocked / Other |
| Cantidad de preguntas revisadas              |                                    |
| Decisiones PO/BA tomadas                     |                                    |
| Decisiones técnicas recomendadas             |                                    |
| ¿Desbloquea aprobación?                      | Sí / No / Parcialmente             |
| User Story file updated                      | Yes / No                           |
| Decision Resolution artifact created/updated | Yes / No                           |
| Decision Resolution path                     |                                    |
| Próximo paso recomendado                     |                                    |

---

## 2. Decisiones Respondidas

For each question, use this structure:

## Decisión `<N>` — `<Topic>`

### Pregunta original

> Paste or summarize the pending question.

### Respuesta PO/BA

Provide the direct answer.

### Decisión formal

```text
<Clear decision in one or two sentences>
```

### Rationale

Explain why this decision is correct for EventFlow MVP.

### Impacto en la User Story

| Sección                 | Cambio requerido |
| ----------------------- | ---------------- |
| Metadata                |                  |
| Business Context        |                  |
| PO/BA Decisions Applied |                  |
| Assumptions             |                  |
| Dependencies            |                  |
| Traceability            |                  |
| Scope Guardrails        |                  |
| Acceptance Criteria     |                  |
| Technical Notes         |                  |
| QA Notes                |                  |
| Definition of Ready     |                  |
| Definition of Done      |                  |
| Notes                   |                  |

Only include rows that apply.

### ¿Bloqueaba aprobación?

Answer:

* Sí
* No
* Parcialmente

### Validación adicional requerida

Choose one:

* No requiere validación adicional.
* Requiere validación Tech Lead.
* Requiere validación QA Lead.
* Requiere validación Security Lead.
* Requiere ADR.
* Requiere decisión PO adicional.

---

## 3. Consolidated Decision Table

|  # | Tema | Decisión | Tipo                                              | ¿Bloqueaba aprobación? | Validación adicional |
| -: | ---- | -------- | ------------------------------------------------- | ---------------------- | -------------------- |
|  1 |      |          | PO / BA / Tech Recommendation / QA Recommendation | Sí / No / Parcialmente |                      |

---

## 4. Cambios Aplicados a la User Story

If the User Story file was updated, list the actual applied changes.

If the User Story file was not updated, explain why.

### Metadata

### Business Context

### PO/BA Decisions Applied

### Assumptions

### Scope Guardrails

### Acceptance Criteria

### Technical Notes

### QA Notes

### Definition of Ready

### Definition of Done

### Notes

---

## 5. Documentation Alignment Required

| Documento / Fuente | Conflicto detectado | Decisión vigente | Acción recomendada | ¿Bloquea aprobación? |
| ------------------ | ------------------- | ---------------- | ------------------ | -------------------- |
|                    |                     |                  |                    | Sí / No              |

If there are no documentation alignment issues, write:

```text
No documentation alignment issues detected.
```

---

## 6. File Update Result

| Campo                                        | Valor                                                                                 |
| -------------------------------------------- | ------------------------------------------------------------------------------------- |
| User Story file updated                      | Yes / No                                                                              |
| User Story file path                         | `<PATH>`                                                                              |
| Decision Resolution artifact created/updated | Yes / No                                                                              |
| Decision Resolution path                     | `management/user-stories/decision-resolutions/<USER_STORY_ID>-decision-resolution.md` |
| New User Story status                        | Ready for Approval / Needs Refinement / Blocked / Split Required                      |
| Remaining blockers                           | Yes / No                                                                              |
| Reason                                       |                                                                                       |

---

## 7. Estado recomendado después de aplicar decisiones

Choose one:

* `Ready for Approval`
* `Needs Refinement`
* `Blocked`
* `Split Required`

Explain why.

---

## 8. Próximo Paso Recomendado

Choose one:

* `Run User Story Refinement again`
* `Run User Story Approval Gate`
* `Ask Tech Lead for validation`
* `Ask QA Lead for validation`
* `Create ADR`
* `Split User Story`

Provide the recommended sequence.

Example:

```text
1. Review the updated User Story file.
2. Run `eventflow-user-story-refinement` again only if a second validation pass is desired.
3. If no blockers remain, run `eventflow-user-story-approval`.
```

---

## Required Behavior When User Story File Is Updated

If you update the User Story file, the final response must include:

```text
User Story file updated: Yes
Path: <PATH>
Status: Ready for Approval
Decision Resolution artifact: management/user-stories/decision-resolutions/<USER_STORY_ID>-decision-resolution.md
Next step: Run `eventflow-user-story-approval` or run `eventflow-user-story-refinement` again if a second validation pass is desired.
```

---

## Required Behavior When User Story File Is Not Updated

If you do not update the User Story file, the final response must include:

```text
User Story file updated: No
Path: <PATH>
Decision Resolution artifact: management/user-stories/decision-resolutions/<USER_STORY_ID>-decision-resolution.md
Status: Needs Refinement / Blocked / Split Required
Remaining blockers: Yes
Next step: Resolve remaining blockers or ask the responsible owner.
```

---

## Quality Rules

Before finalizing:

* Do not approve the User Story.
* Do not generate Development Tasks.
* Do not create implementation code.
* Do not introduce unsupported requirements.
* Do not invent fake traceability IDs.
* Do not weaken MVP scope guardrails.
* Do not update the User Story file if the User Story ID does not match the review artifact.
* Do not update the User Story file if blockers remain unresolved.
* Do not mark a story as `Ready for Approval` if any blocking decision remains.
* Always create/update the Decision Resolution artifact.
* Always update or create `PO/BA Decisions Applied` when decisions are applied to the User Story.
* Keep the User Story clean and avoid dumping the full decision log inside the User Story.
* Store the full decision log in the Decision Resolution artifact.
* Use `Documentation Alignment Required` for conflicts with older docs when the decision is already formalized.
* Do not leave a resolved decision as a repeated pending question.
* Keep all output in Spanish LATAM neutral.
