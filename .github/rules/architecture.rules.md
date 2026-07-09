# Architecture Rules

## Purpose

These rules ensure that all agents respect the architectural decisions and boundaries of the project.

## Required

- Follow the architecture described in `architecture.md`.
- Respect existing module boundaries.
- Keep responsibilities separated by layer.
- Maintain dependency direction according to the selected architecture.
- Keep business logic independent from infrastructure when possible.
- Isolate external integrations behind adapters, clients, gateways, or repositories.
- Prefer explicit boundaries over implicit coupling.
- Keep code easy to test and replace.

## Forbidden

- Do not bypass architectural layers.
- Do not introduce circular dependencies.
- Do not mix business logic with infrastructure concerns.
- Do not couple domain logic directly to frameworks.
- Do not create shared utilities that become dumping grounds.
- Do not introduce new architectural styles without explaining the trade-offs.
- Do not modify public contracts without considering impact.

## Layering Rules

When the project uses layered architecture, agents must respect:

- Presentation layer: input/output handling only.
- Application layer: orchestration of use cases.
- Domain layer: business rules and core concepts.
- Infrastructure layer: persistence, external APIs, frameworks, and tools.

## Decision-Making Rules

When proposing architectural changes, always include:

- Reason for the change.
- Affected modules.
- Trade-offs.
- Migration impact.
- Testing impact.
- Risks.
- Alternative options.

## Scalability Rules

- Design for current requirements first.
- Avoid premature overengineering.
- Make future extension possible without unnecessary complexity.
- Prefer clear abstractions only when they solve an actual problem.

## Final Rule

Architecture must support maintainability, clarity, testability, and long-term evolution.