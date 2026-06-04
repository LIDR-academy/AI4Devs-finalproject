# User Story: {title}

> ID: US-{epic}-{number}
> Epic: EP-{number} — {epic-name}
> Feature: FT-{epic}-{number} — {feature-name}
> Type: fullstack
> Status: Draft | In Progress | Done
> Priority: Must | Should | Could | Won't

---

## Story

**As** {role/persona from PRD}
**I want** {desired action or capability}
**So that** {benefit or value obtained}

---

## Acceptance Criteria

### Scenario 1: {name — happy path}
**Given** {initial context / preconditions with concrete data}
**When** {specific user action}
**Then** {expected observable result}

### Scenario 2: {name — alternative case}
**Given** {context}
**When** {action}
**Then** {result}

### Scenario 3: {name — error case}
**Given** {context}
**When** {incorrect or unexpected action}
**Then** {error handling / user message}

---

## Prioritization

| Method | Value |
|--------|-------|
| MoSCoW | Must / Should / Could / Won't |
| RICE (optional) | Reach: _ · Impact: _ · Confidence: _ · Effort: _ = **Score: _** |

**Rationale**: {why this priority}

---

## Effort Estimation

| Size | Time Range | Story Points |
|------|-----------|--------------|
| XS | 0.5 – 1 day | 1 – 2 |
| S | 1 – 2 days | 3 – 5 |
| M | 3 – 5 days | 8 – 13 |
| L | 1 – 2 weeks | 13 – 21 |
| XL | 2 – 4 weeks | 21 – 40 |

> ⚠️ If size is **XL**, consider splitting the story into smaller ones.

**Assigned Size**: {size}
**Estimated Time**: {time_range}
**Story Points**: {points}
**Confidence**: High / Medium / Low

**Effort Rationale**: {why this estimate — technical complexity, integrations, uncertainty, etc.}

---

## Dependencies

| Story / Subtask | Type | Description |
|-----------------|------|-------------|
| US-{x}-{y} | Blocking / Preferred / Informational | {description} |

---

## Technical Notes
<!-- Considerations for the dev team. Do not prescribe solutions, provide context -->

### Frontend Considerations
<!-- UI components affected, state management, responsive requirements -->

### Backend Considerations
<!-- API endpoints, business logic, data models, integrations -->

### Data Considerations
<!-- Schema changes, migrations, data transformations -->

---

## INVEST Validation

| Criterion | Passes? | Observation |
|-----------|---------|-------------|
| **I**ndependent | ✅ / ⚠️ / ❌ | {can be implemented without depending on another story} |
| **N**egotiable | ✅ / ⚠️ / ❌ | {details are flexible, not prescriptive} |
| **V**aluable | ✅ / ⚠️ / ❌ | {delivers measurable value to user or business} |
| **E**stimable | ✅ / ⚠️ / ❌ | {team can estimate the effort} |
| **S**mall | ✅ / ⚠️ / ❌ | {completable in a sprint} |
| **T**estable | ✅ / ⚠️ / ❌ | {has verifiable acceptance criteria} |

---

## Subtasks

<!-- Generated in Phase 3 -->

---

## Traceability

```mermaid
graph LR
    PRD[PRD] --> EP[EP-{n}]
    EP --> FT[FT-{ep}-{n}]
    FT --> US[US-{ep}-{n}]
    US --> AC1[AC: Scenario 1]
    US --> AC2[AC: Scenario 2]
    US --> AC3[AC: Scenario 3]
    US --> ST1[Subtask: Frontend]
    US --> ST2[Subtask: Backend]
    US --> ST3[Subtask: Testing]
```
