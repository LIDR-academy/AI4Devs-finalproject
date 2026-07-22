# Skill: CI/CD Design

## Purpose

Design reliable, maintainable, secure, and scalable CI/CD pipelines that support safe software delivery and fast feedback loops.

This skill helps agents define build, test, deployment, and release automation strategies aligned with the project's operational requirements.

---

## Responsibilities

When using this skill:

- Design CI/CD workflows.
- Improve deployment reliability.
- Improve build reproducibility.
- Improve automation consistency.
- Reduce deployment risk.
- Improve feedback visibility.
- Improve rollback readiness.
- Improve pipeline maintainability.
- Improve operational scalability.
- Identify CI/CD bottlenecks and risks.

---

## CI/CD Principles

Always prioritize:

- Reliability
- Reproducibility
- Automation
- Fast feedback
- Traceability
- Deployment safety
- Operational simplicity
- Maintainability
- Observability

Avoid:

- fragile pipelines
- undocumented manual steps
- hidden dependencies
- environment drift
- insecure secret handling
- overly complex workflows
- long blocking pipelines without justification

---

## Pipeline Design Guidelines

Pipelines should:

- be deterministic
- fail predictably
- provide actionable feedback
- support reproducible builds
- isolate stages clearly
- support safe deployments
- remain understandable and maintainable

Consider:

- caching
- parallelization
- artifact management
- rollback support
- deployment traceability

---

## Build Strategy Guidelines

Build processes should:

- be reproducible
- avoid environment-specific assumptions
- isolate dependencies
- validate integrity when relevant

Avoid:

- hidden runtime dependencies
- non-repeatable build behavior
- local-only assumptions

---

## Testing Integration Guidelines

CI/CD should support:

- automated unit tests
- integration tests
- contract tests when relevant
- E2E tests for critical flows
- static analysis when useful

Balance:

- feedback speed
- confidence
- operational cost

---

## Deployment Strategy Guidelines

When designing deployments, consider:

- rollback capability
- environment isolation
- health checks
- migration sequencing
- deployment ordering
- downtime minimization

Possible strategies:

- rolling deployments
- blue/green deployments
- canary releases

Do not introduce unnecessary deployment complexity without justification.

---

## Environment Management Guidelines

Environment configuration should:

- be externalized
- support reproducibility
- remain environment-specific
- avoid hardcoded values

Consider:

- secrets management
- feature flags
- runtime configuration
- deployment configuration

---

## Security Awareness

CI/CD pipelines should:

- protect secrets
- minimize permissions
- isolate environments
- audit deployment activity when possible
- avoid exposing credentials

Never store secrets directly in source control.

---

## Observability Guidelines

Pipelines should expose enough visibility to:

- debug failures
- track deployments
- identify bottlenecks
- monitor pipeline health

Consider:

- logging
- metrics
- notifications
- deployment tracking

---

## Scalability Guidelines

When scaling delivery systems, consider:

- parallel execution
- distributed runners
- artifact storage
- caching efficiency
- deployment concurrency
- infrastructure bottlenecks

Avoid optimizing for unrealistic scale without evidence.

---

## Reliability Guidelines

CI/CD systems should support:

- rollback
- retry strategies when appropriate
- failure visibility
- environment consistency
- deployment safety

---

## Collaboration Guidelines

Recommend involving:

- DevOps Engineer Agent → infrastructure and operational implementation.
- Test Automation Engineer Agent → automated testing integration.
- QA Engineer Agent → release validation strategy.
- Security Reviewer Agent → pipeline security and secrets handling.
- Tech Lead Agent → delivery trade-offs and technical constraints.
- Backend Developer Agent → backend deployment dependencies.
- Frontend Developer Agent → frontend build and deployment concerns.

---

## Output Format

```md
## CI/CD Design Analysis

### Pipeline Goals

[Goals]

### Proposed Pipeline Stages

- Build
- Test
- Security Checks
- Deployment
- Post-Deployment Validation

### Deployment Strategy

[Strategy]

### Environment Considerations

- [Consideration]

### Testing Integration

- [Testing integration]

### Security Considerations

- [Security consideration]

### Observability Considerations

- [Observability consideration]

### Scalability Considerations

- [Scalability consideration]

### Risks / Concerns

- [Risk]

### Recommended Improvements

- [Improvement]

### Recommended Next Agents

- [Agent] → [Reason]