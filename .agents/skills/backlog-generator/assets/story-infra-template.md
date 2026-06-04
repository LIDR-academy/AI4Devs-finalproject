# User Story: {title}

> ID: US-{epic}-{number}
> Epic: EP-{number} — {epic-name}
> Feature: FT-{epic}-{number} — {feature-name}
> Type: infra
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

## Infrastructure Specifications

### Environment & Deployment

| Environment | Purpose | Configuration |
|-------------|---------|---------------|
| Development | {purpose} | {config details} |
| Staging | {purpose} | {config details} |
| Production | {purpose} | {config details} |

### CI/CD Pipeline Changes

| Stage | Tool | Change | Description |
|-------|------|--------|-------------|
| Build | {tool} | Add / Modify | {description} |
| Test | {tool} | Add / Modify | {description} |
| Deploy | {tool} | Add / Modify | {description} |

### Infrastructure Resources

| Resource | Type | Action | Specs |
|----------|------|--------|-------|
| {resource} | Compute / Storage / Network / IAM | Create / Modify / Remove | {specifications} |

### Monitoring & Observability

| Type | Tool | What to Monitor | Alert Threshold |
|------|------|-----------------|-----------------|
| Metrics | {tool} | {metric} | {threshold} |
| Logs | {tool} | {log pattern} | {level} |
| Traces | {tool} | {trace scope} | {latency threshold} |

### Security Considerations
- [ ] Secrets management configured
- [ ] Network policies defined
- [ ] IAM roles follow least-privilege
- [ ] Encryption at rest and in transit

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
    US --> ST1[Subtask: Environment Setup]
    US --> ST2[Subtask: CI/CD Pipeline]
    US --> ST3[Subtask: Monitoring]
    US --> ST4[Subtask: Security]
```
