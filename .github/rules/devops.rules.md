# DevOps Rules

## Purpose

These rules define operational, infrastructure, CI/CD, deployment, and environment management expectations for all agents working on delivery pipelines and runtime environments.

The goal is to ensure reliable, reproducible, secure, and maintainable software delivery processes.

---

## Required

- Keep deployments reproducible.
- Keep environments consistent.
- Automate repetitive operational tasks when appropriate.
- Use environment variables or secure configuration management.
- Ensure deployments are observable and traceable.
- Define rollback strategies for critical deployments.
- Keep CI/CD pipelines maintainable and predictable.
- Protect secrets and sensitive configuration.
- Ensure infrastructure changes are reviewable and auditable.
- Validate deployment impact before major operational changes.

---

## Forbidden

- Do not hardcode secrets, credentials, or environment-specific values.
- Do not rely on undocumented manual deployment steps.
- Do not bypass CI/CD validation without justification.
- Do not introduce unnecessary infrastructure complexity.
- Do not expose sensitive operational information publicly.
- Do not deploy untested critical changes directly to production.
- Do not create environment drift between staging and production intentionally.
- Do not depend on non-reproducible infrastructure setup.

---

## CI/CD Rules

CI/CD pipelines should:

- run automatically when appropriate
- provide clear feedback
- fail predictably
- include testing stages
- support reproducible builds
- support traceable deployments
- avoid unnecessary complexity

Consider:

- build caching
- parallel execution
- pipeline observability
- artifact management
- rollback support

---

## Deployment Rules

Deployments should:

- be reproducible
- support rollback when necessary
- validate application health
- minimize downtime
- isolate environments correctly

When relevant, consider:

- blue/green deployments
- rolling deployments
- canary releases
- health checks
- migration sequencing

---

## Environment Rules

Environment configuration should:

- be externalized
- be environment-specific
- avoid hardcoded values
- support reproducibility
- protect sensitive information

Avoid:

- shared mutable production configuration
- hidden operational dependencies
- undocumented runtime requirements

---

## Containerization Rules

When using containers:

- keep images minimal
- avoid unnecessary dependencies
- use reproducible builds
- separate build/runtime stages when possible
- avoid running containers as root when possible
- externalize configuration

---

## Observability Rules

Systems should expose enough operational visibility to:

- debug failures
- monitor health
- track deployments
- identify bottlenecks
- investigate incidents

Consider:

- structured logging
- metrics
- tracing
- dashboards
- alerts
- error tracking

---

## Reliability Rules

When reliability matters, consider:

- retries
- timeouts
- graceful degradation
- circuit breakers
- redundancy
- failure isolation
- backup and recovery strategies

---

## Scalability Rules

When scalability matters, consider:

- horizontal scaling
- stateless services
- async processing
- caching strategies
- infrastructure bottlenecks
- workload distribution

Do not optimize for unrealistic scale without evidence.

---

## Security Awareness Rules

Operational workflows must:

- protect secrets
- minimize permissions
- isolate environments
- avoid exposing internal systems unnecessarily
- audit operational access when relevant

When security impact is significant, involve the Security Reviewer Agent.

---

## Release Readiness Rules

Before releasing critical changes, verify:

- deployments are reproducible
- rollback exists
- required monitoring exists
- migrations are safe
- environment configuration is correct
- critical tests passed
- operational risks are identified

---

## Collaboration Rules

Recommend involving other agents when necessary:

- Tech Lead Agent → technical trade-offs or runtime concerns.
- Software Architect Agent → infrastructure scalability or distributed system concerns.
- Backend Developer Agent → runtime dependencies or backend deployment concerns.
- Frontend Developer Agent → frontend hosting or delivery concerns.
- QA Engineer Agent → release validation and regression concerns.
- Test Automation Engineer Agent → CI/CD testing integration.
- Security Reviewer Agent → secrets, permissions, or infrastructure security concerns.
- Technical Writer Agent → operational documentation and runbooks.

---

## Final Rule

Infrastructure and delivery processes should prioritize reliability, reproducibility, operational simplicity, observability, and safe deployments over unnecessary complexity or trendy toolin