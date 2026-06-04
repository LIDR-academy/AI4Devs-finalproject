# User Story: {title}

> ID: US-{epic}-{number}
> Epic: EP-{number} — {epic-name}
> Feature: FT-{epic}-{number} — {feature-name}
> Type: frontend
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

## UI/Frontend Specifications

### Components Affected
<!-- List of UI components to create or modify -->

| Component | Action | Description |
|-----------|--------|-------------|
| {ComponentName} | Create / Modify | {what changes} |

### States & Interactions
<!-- UI states: loading, empty, error, success, disabled -->

| State | Behavior | Visual Feedback |
|-------|----------|-----------------|
| Loading | {behavior} | {spinner/skeleton/placeholder} |
| Empty | {behavior} | {empty state message/illustration} |
| Error | {behavior} | {error message/retry option} |
| Success | {behavior} | {confirmation/transition} |

### Responsive Breakpoints
<!-- Key responsive considerations -->

| Breakpoint | Layout Change |
|------------|---------------|
| Mobile (< 768px) | {layout} |
| Tablet (768-1024px) | {layout} |
| Desktop (> 1024px) | {layout} |

### Accessibility (a11y)
- [ ] Semantic HTML elements used
- [ ] ARIA labels for interactive elements
- [ ] Keyboard navigation supported
- [ ] Color contrast meets WCAG AA
- [ ] Screen reader tested

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
    US --> ST1[Subtask: UI Components]
    US --> ST2[Subtask: State Management]
    US --> ST3[Subtask: Testing]
```
