# User Story: {title}

> ID: US-{epic}-{number}
> Epic: EP-{number} — {epic-name}
> Feature: FT-{epic}-{number} — {feature-name}
> Type: backend
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

**Rationale**: {why this priority}

---

## Effort Estimation

**Assigned Size**: {size}
**Estimated Time**: {time_range}
**Story Points**: {points}
**Confidence**: High / Medium / Low

**Effort Rationale**: {why this estimate}

---

## Dependencies

| Story / Subtask | Type | Description |
|-----------------|------|-------------|
| US-{x}-{y} | Blocking / Preferred / Informational | {description} |

---

## Backend/API Specifications

### API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| {GET/POST/PUT/DELETE} | /api/v1/{resource} | {description} | Yes / No |

### Request/Response Schema

```json
// Request
{
  "field": "type — description"
}

// Response (200)
{
  "field": "type — description"
}

// Error Response (4xx/5xx)
{
  "error": { "code": "string", "message": "string" }
}
```

### Business Logic Rules
<!-- Core domain rules this story implements -->

| Rule | Description | Edge Cases |
|------|-------------|------------|
| {rule-name} | {what it enforces} | {edge cases to handle} |

### Data Model Changes

| Entity | Field | Type | Change | Migration Required |
|--------|-------|------|--------|--------------------|
| {entity} | {field} | {type} | Add / Modify / Remove | Yes / No |

### Integration Points
<!-- External services, APIs, queues, events -->

| System | Type | Description | Failure Handling |
|--------|------|-------------|------------------|
| {system} | REST / Event / Queue | {description} | {retry/fallback/circuit-breaker} |

---

## INVEST Validation

| Criterion | Passes? | Observation |
|-----------|---------|-------------|
| **I**ndependent | ✅ / ⚠️ / ❌ | {observation} |
| **N**egotiable | ✅ / ⚠️ / ❌ | {observation} |
| **V**aluable | ✅ / ⚠️ / ❌ | {observation} |
| **E**stimable | ✅ / ⚠️ / ❌ | {observation} |
| **S**mall | ✅ / ⚠️ / ❌ | {observation} |
| **T**estable | ✅ / ⚠️ / ❌ | {observation} |

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
    US --> ST1[Subtask: API/Endpoints]
    US --> ST2[Subtask: Business Logic]
    US --> ST3[Subtask: Data Model]
    US --> ST4[Subtask: Testing]
```
