# Collaboration Rules

## Purpose

These rules define how agents collaborate, delegate responsibilities, escalate concerns, and coordinate work across the software development lifecycle.

The goal is to avoid overlapping responsibilities, conflicting outputs, and fragmented workflows.

---

## Collaboration Principles

All agents must prioritize:

- Clear ownership
- Explicit responsibility boundaries
- Minimal overlap
- Structured handoffs
- Context sharing
- Consistent outputs
- Workflow continuity

---

## Responsibility Rules

Each agent owns its specialization.

Agents must:

- Stay within their domain expertise.
- Avoid replacing other specialized agents unnecessarily.
- Recommend involving another agent when required.
- Clearly identify when work should be handed off.

---

## Escalation Rules

Agents should escalate when:

### Product Owner Agent

Involve when:

- business requirements are unclear
- acceptance criteria are missing
- scope is ambiguous
- business rules conflict

---

### Tech Lead Agent

Involve when:

- technical trade-offs exist
- implementation strategy is unclear
- scalability concerns exist
- technical feasibility is uncertain

---

### Software Architect Agent

Involve when:

- architecture changes affect multiple modules
- integration boundaries are unclear
- scalability strategy is required
- system structure must evolve

---

### QA Engineer Agent

Involve when:

- edge-case validation is required
- regression risk exists
- acceptance validation is needed
- workflows require behavioral testing

---

### Test Automation Engineer Agent

Involve when:

- automated testing strategy is needed
- CI testing integration is needed
- regression automation is required

---

### Security Reviewer Agent

Involve when:

- authentication is involved
- authorization is involved
- sensitive data exists
- external exposure exists
- permissions or secrets are involved

---

### DevOps Engineer Agent

Involve when:

- deployment changes exist
- infrastructure changes exist
- CI/CD changes exist
- environment configuration changes exist

---

### Technical Writer Agent

Involve when:

- documentation changes are needed
- onboarding documentation is missing
- operational documentation is needed

---

## Handoff Rules

When handing work to another agent:

- provide context
- summarize assumptions
- identify risks
- clarify scope
- avoid forcing implementation details outside your expertise

---

## Conflict Resolution Rules

When agent recommendations conflict:

- prioritize project architecture
- prioritize maintainability
- prioritize simplicity
- prioritize explicit project constraints
- escalate to Tech Lead Agent or Software Architect Agent when necessary

---

## Workflow Coordination Rules

When multiple agents collaborate:

- responsibilities must be explicit
- execution order should be logical
- outputs should feed the next step
- duplicated work should be avoided

---

## Minimalism Rule

Do not involve unnecessary agents for simple tasks.

Simple requests should remain lightweight.

---

## Final Rule

Agents should collaborate like a real engineering team: with clear ownership, explicit communication, minimal overlap, and shared responsibility for software quality.