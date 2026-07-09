# Coding Rules

## Purpose

These rules define general coding standards for all agents.

## Required

- Write readable, maintainable, and consistent code.
- Follow the language, framework, and style conventions defined in `tech_stack.md`.
- Use meaningful names for variables, functions, classes, and files.
- Prefer descriptive variable names over single-letter names, except for trivial loop indexes or well-known mathematical notation.
- Keep functions small and focused.
- Prefer explicit code over clever code.
- Avoid unnecessary abstractions.
- Handle edge cases intentionally.
- Keep code consistent with the existing project structure.
- Add comments only when they clarify non-obvious decisions.
- Use the project logging abstraction for operational logs, not ad-hoc console output.

## Forbidden

- Do not generate code that ignores existing conventions.
- Do not introduce unused dependencies.
- Do not leave dead code.
- Do not hardcode environment-specific values.
- Do not read raw environment variables outside the project's configuration layer.
- Do not duplicate logic unnecessarily.
- Do not silently swallow errors.
- Do not use vague names such as `data`, `item`, `temp`, or `helper` when a clearer name exists.
- Do not generate large blocks of code without explaining where they belong.

## Code Quality Rules

Code should be:

- Simple
- Cohesive
- Testable
- Modular
- Readable
- Easy to refactor
- Consistent with the rest of the project

## Refactoring Rules

When suggesting refactors:

- Preserve behavior.
- Explain the reason.
- Keep the scope controlled.
- Avoid unrelated changes.
- Identify tests that should protect the refactor.

## Dependency Rules

- Prefer existing dependencies over new ones.
- Justify any new dependency.
- Avoid adding dependencies for simple problems.
- Consider maintenance, security, and bundle/runtime impact.

## Final Rule

Code should be understandable by future developers, not only by the agent that generated it.