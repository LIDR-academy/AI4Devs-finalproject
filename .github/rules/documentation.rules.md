# Documentation Rules

## Purpose

These rules define documentation standards for all agents contributing to technical, operational, onboarding, architectural, or product-related documentation.

The goal is to ensure documentation is clear, accurate, maintainable, discoverable, and useful for its intended audience.

---

## Required

- Keep documentation aligned with the current implementation.
- Write documentation with a clear audience in mind.
- Use structured and readable formatting.
- Keep setup and operational instructions actionable.
- Update documentation when behavior, workflows, or architecture changes.
- Update `CHANGELOG.md` when user-visible behavior changes.
- Use examples when they improve understanding.
- Explain assumptions and prerequisites explicitly.
- Keep terminology consistent across documentation.
- Prefer practical explanations over theoretical descriptions.

---

## Forbidden

- Do not invent undocumented behavior.
- Do not leave outdated examples or instructions.
- Do not expose secrets, credentials, tokens, or sensitive operational information.
- Do not create documentation disconnected from the actual system behavior.
- Do not overcomplicate explanations unnecessarily.
- Do not use vague instructions for operationally sensitive procedures.
- Do not duplicate documentation unnecessarily across multiple files.
- Do not assume prior project knowledge unless explicitly documented.

---

## Readability Rules

Documentation should be:

- clear
- direct
- structured
- scannable
- technically accurate
- easy to maintain

Prefer:

- headings
- bullet points
- tables when useful
- short paragraphs
- examples
- step-by-step instructions

Avoid:

- walls of text
- unnecessary jargon
- filler content
- excessive abstraction

---

## Audience Rules

Documentation must adapt to its audience.

### Developers

Focus on:

- setup
- workflows
- architecture
- APIs
- debugging
- conventions

### QA Engineers

Focus on:

- validation flows
- testing instructions
- environment setup
- troubleshooting

### DevOps / Operations

Focus on:

- deployment
- monitoring
- configuration
- rollback
- runtime considerations

### Product / Business Stakeholders

Focus on:

- workflows
- behavior
- capabilities
- scope

---

## README Rules

A README should generally include:

- project purpose
- setup instructions
- run instructions
- testing instructions
- project structure
- environment requirements
- workflows or conventions
- contribution guidance when relevant

Avoid overly generic README files.

---

## API Documentation Rules

API documentation should include:

- endpoint purpose
- authentication requirements
- request structure
- response structure
- validations
- status codes
- error responses
- usage examples

---

## Architecture Documentation Rules

Architecture documentation should explain:

- module boundaries
- dependency direction
- system structure
- integration points
- architectural patterns
- major decisions
- data flow when relevant

Focus on helping developers understand and evolve the system.

---

## Operational Documentation Rules

Operational documentation should include:

- deployment steps
- rollback procedures
- environment configuration
- troubleshooting guidance
- monitoring expectations
- incident recovery guidance when relevant

Avoid undocumented manual operational steps.

---

## ADR Rules

Architecture Decision Records should include:

- Context
- Problem
- Decision
- Alternatives considered
- Trade-offs
- Consequences

Document why decisions were made, not only what was chosen.

---

## Troubleshooting Rules

Troubleshooting documentation should:

- describe symptoms clearly
- describe likely causes
- provide actionable resolution steps
- provide validation steps after resolution

Avoid vague or generic troubleshooting advice.

---

## Maintenance Rules

Documentation should:

- be reviewed when major changes occur
- avoid stale examples
- avoid dead links
- avoid duplicated instructions
- remain aligned with the current architecture and workflows

---

## Documentation Sync Checklist

When implementation changes are made, review and update the relevant docs in the same task.

| Update this documentation file | When this changes |
|---|---|
| `CHANGELOG.md` | user-visible behavior, API contracts, breaking changes, operationally relevant fixes |
| `README.md` | setup, scripts, env requirements, project structure, usage flows, public capabilities |
| API documentation files | endpoints, request/response contracts, status codes, validations, auth requirements |
| Architecture documentation | module boundaries, dependency direction, major integration points, architecture decisions |
| Data model documentation | tables, columns, constraints, indexes, persistence behavior |
| Operational runbooks | deployment flow, rollback steps, observability, queue/worker operations, incident procedures |

If no documentation update is required, explicitly validate that current docs still match the new behavior.

---

## Changelog Entry Format

Use a consistent entry format in `CHANGELOG.md` with sections such as:

- Added
- Changed
- Fixed
- Removed
- Deprecated
- Security

Each entry should include:

- a short, user-visible summary
- impact on API or behavior when relevant
- migration notes when there is a breaking change

---

## Collaboration Rules

Recommend involving other agents when necessary:

- Product Owner Agent → feature behavior clarification.
- Tech Lead Agent → technical explanation clarification.
- Software Architect Agent → architecture clarification.
- Backend Developer Agent → backend behavior clarification.
- Frontend Developer Agent → frontend behavior clarification.
- QA Engineer Agent → validation flow clarification.
- DevOps Engineer Agent → deployment and operational clarification.
- Security Reviewer Agent → sensitive operational or security-related documentation review.

---

## Final Rule

Documentation should reduce ambiguity, onboarding time, operational dependency, and implementation mistakes. Prioritize clarity, accuracy, usefulness, and maintainability over verbosity.