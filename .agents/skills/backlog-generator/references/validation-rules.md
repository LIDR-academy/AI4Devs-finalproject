# Validation Rules — Backlog Generator

## INVEST (User Stories)

Every user story MUST pass these 6 validations. If any fails, correct before presenting to the user.

| Criterion | Validation Question | Failure Signal |
|-----------|-------------------|----------------|
| **I**ndependent | Can it be implemented without completing another story first? | Direct reference to another US as prerequisite |
| **N**egotiable | Do the details allow implementation flexibility? | Prescribes specific technical solution |
| **V**aluable | Does the user or business get measurable value? | No clear benefit in the "So that..." |
| **E**stimable | Could a team estimate the effort? | Ambiguous scope or unknown dependencies |
| **S**mall | Is it completable in a sprint? | More than 3 complex acceptance criteria |
| **T**estable | Can it be objectively verified? | Vague ACs without concrete Given/When/Then |

### Actions on Failure
- **I fails** → split into independent stories or document explicit dependency
- **N fails** → rewrite without prescribing technical implementation
- **V fails** → rewrite the "So that..." with concrete benefit
- **E fails** → add context, split if too large
- **S fails** → split into smaller stories
- **T fails** → rewrite ACs with concrete data in Given/When/Then

---

## Acceptance Criteria

### Mandatory Rules
1. Every story MUST have **at least 2 scenarios** Given/When/Then
2. Scenarios MUST cover: **happy path + at least 1 alternative or error case**
3. Use **concrete data** in scenarios, never generic
4. Each "Then" must be **observable and verifiable**

### Format
```
Given {concrete system state/context}
When {specific user action}
Then {observable and verifiable result}
```

### Anti-patterns to Avoid
- ❌ "Then the system works correctly" → too vague
- ❌ "Given the user is authenticated" without specifying how
- ❌ Mixing multiple actions in a single "When"
- ❌ Criteria requiring subjective judgment to verify

---

## Traceability

### Rules
1. Every story references its **parent epic** (EP-X)
2. Every story references its **feature** (FT-X-Y)
3. Every subtask references its **parent story** (US-X-Y)
4. Every DoD item is linked to a **subtask**
5. The README index maintains the **complete traceability map**

### Expected Traceability Diagram
```
PRD
├── Business Objective 1
│   ├── EP-1: Epic 1
│   │   ├── FT-1-1: Feature 1
│   │   │   ├── US-1-1: Story 1 → AC-1, AC-2
│   │   │   │   ├── ST-1-1-FE-1: Frontend subtask → DoD[5 items]
│   │   │   │   ├── ST-1-1-BE-1: Backend subtask → DoD[7 items]
│   │   │   │   └── ST-1-1-QA-1: Testing subtask → DoD[6 items]
│   │   │   └── US-1-2: Story 2 → AC-1, AC-2, AC-3
│   │   └── FT-1-2: Feature 2
│   │       └── US-1-3: Story 3 → AC-1, AC-2
│   └── EP-2: Epic 2
│       └── ...
└── Business Objective 2
    └── ...
```

### Traceability Validation
- No **orphan stories** (without epic)
- No **empty features** (without stories)
- No **uncovered stories** (without subtasks after Phase 3)
- Every epic must have at least **1 success criterion** linked to a PRD KPI
- Every subtask must have a **complete DoD checklist**

---

## Dependencies

### Classification
| Type | Meaning | Action |
|------|---------|--------|
| **Blocking** | Story B cannot start until A is complete | Order in backlog, document in both stories |
| **Preferred** | B benefits from A being complete, but can start without it | Note preference, don't block |
| **Informational** | B has a relationship with A but they are independent | Document cross-reference |

### Rules
1. Identify dependencies **between stories in the same epic** and **between epics**
2. Mark blocking dependencies in the **dependencies section** of each story/subtask
3. If dependency cycles exist → **error**: restructure the stories
4. Dependencies between subtasks within a story are expected (e.g., BE before FE)
5. Cross-epic blocking dependencies must be flagged with ⚠️ in the epic overview

---

## Prioritization

### MoSCoW (Quick Classification)
| Category | Meaning | Criterion |
|----------|---------|-----------|
| **Must** | Essential for MVP | Product doesn't make sense without it |
| **Should** | Important, but doesn't block launch | High value but viable without it |
| **Could** | Desirable if time/resources allow | Improves experience but not essential |
| **Won't** | Not in this cycle | Documented for future |

### RICE (Quantitative Analysis — use when >10 stories)
| Factor | Scale | Description |
|--------|-------|-------------|
| **R**each | 1-10 | How many users it impacts |
| **I**mpact | 0.25, 0.5, 1, 2, 3 | Impact level per user |
| **C**onfidence | 50%, 80%, 100% | Confidence in estimates |
| **E**ffort | Person-sprint | Estimated effort |
| **Score** | (R × I × C) / E | Higher score = higher priority |

### Prioritization Rules
1. Every story MUST have MoSCoW priority assigned
2. RICE is optional but recommended when there are more than 10 stories
3. Document the **rationale** for the priority, not just the value

---

## Effort Estimation

### Size ↔ Time Reference Table

| Size | Time Range | Story Points | Typical Complexity |
|------|-----------|--------------|---------------------|
| **XS** | 0.5 – 1 day | 1 – 2 | Trivial change, config, copy, visual adjustment |
| **S** | 1 – 2 days | 3 – 5 | Simple feature, one component, no integrations |
| **M** | 3 – 5 days | 8 – 13 | Feature with logic, 2-3 components, some integration |
| **L** | 1 – 2 weeks | 13 – 21 | Complex feature, multiple components, integrations |
| **XL** | 2 – 4 weeks | 21 – 40 | Poorly divided epic — mandatory split required |

### Estimation Rules
1. Every story MUST have **size + time range + points** assigned
2. Size and time MUST be **coherent** with the reference table
3. If size is **XL** → signal that the story must be split. Document with ⚠️
4. Every estimate MUST include **rationale** (technical complexity, uncertainty, integrations, dependencies)
5. Include **confidence level**: High (>80%), Medium (50-80%), Low (<50%)

### Per-Epic Aggregation
When completing stories for an epic, generate an **effort summary**:

| Metric | Value |
|--------|-------|
| Total Stories | {n} |
| Size Distribution | XS: _ · S: _ · M: _ · L: _ · XL: _ |
| Estimated Time | {min} – {max} days |
| Total Points | {min} – {max} |

---

## Technical Coherence (Subtasks)

### Coverage Validation
1. Every story MUST have subtasks that **fully cover** its scope
2. No acceptance criterion should be left **uncovered** by subtasks
3. Every subtask type must have a **complete DoD checklist**

### DoD Validation
1. Every DoD item MUST be **verifiable** (not subjective)
2. DoD items should reference the **AC scenario** they validate
3. Testing subtasks MUST cover all **AC scenarios** as test cases
4. DoD completion is binary: done or not done — no "partially done"

### Complexity Estimation per Subtask Type
| Category | Base Complexity Factors |
|----------|----------------------|
| Frontend | Components count, state complexity, responsive requirements, a11y |
| Backend | Endpoints count, business rules, data model changes, integrations |
| Testing | Scenarios count, E2E complexity, data fixtures needed |
| Infrastructure | Resources count, security requirements, pipeline changes |
| UX/Design | Screens count, flow complexity, design system changes |

### Alert Signals
- ⚠️ Story with size XL → mandatory split
- ⚠️ Low confidence in >30% of stories → needs more investigation/spike
- ⚠️ Epic with >80 total points → review epic scope
- ⚠️ Size/time incoherence → recalibrate estimate
- ⚠️ Story with >5 subtasks → consider splitting the story
- ⚠️ Subtask with no DoD items → incomplete, must add DoD
- ⚠️ Circular dependency detected → restructure required
