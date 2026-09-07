---
name: sport-itsm-engineering-principles
description: Cross-cutting engineering craft standard for Sport ITSM — SOLID principles and clean-code universals (DRY, KISS, YAGNI, cohesion/coupling, naming, small functions, immutability, error handling) applied in TypeScript across both frontend and backend. Use this skill whenever writing or reviewing any code, to keep class- and function-level design sound. Stack-agnostic; complements the architecture and stack skills.
---

# Sport ITSM — Engineering Principles (SOLID & Clean Code)

This skill is the authoritative standard for **code craft** in Sport ITSM at the **class and function level**, applied in **TypeScript across frontend and backend**. It is **stack-agnostic**: the same principles hold in NestJS and Angular.

All code, identifiers, comments, and documentation are written in **English**.

> **Altitude:** this skill governs *micro* design (classes, functions). System-level structure (bounded contexts, hexagonal layers, module boundaries) belongs to **`sport-itsm-architecture`**; tech-specific rules belong to **`sport-itsm-backend`** / **`sport-itsm-frontend`**. Apply all of them together.
>
> **Precedence:** these project principles, together with the stack and architecture skills, **override** any generic guidance from `nestjs-best-practices` / `angular-developer` where they differ. Those skills *apply* these principles in framework terms; this skill *states* them.

---

# SOLID

**S — Single Responsibility.** A class/module/function has one reason to change. Split "god" services; keep controllers thin, use cases focused, components presentational. One responsibility per unit.

**O — Open/Closed.** Open for extension, closed for modification. Prefer polymorphism, strategy objects, and composition over editing existing branching logic. Adding a new behavior should mean adding code, not rewiring stable code.

**L — Liskov Substitution.** Subtypes/implementations must be usable wherever their interface is expected, without weakening contracts (no strengthened preconditions, no weakened postconditions, no surprise exceptions). If an implementation can't honor the contract, the abstraction is wrong.

**I — Interface Segregation.** Prefer small, role-specific interfaces over broad ones. Consumers should not depend on methods they don't use. Split fat ports into focused ones.

**D — Dependency Inversion.** High-level policy depends on **abstractions**, not concretions; details depend on abstractions. Depend on interfaces/ports, inject implementations.
> **Cross-link:** DIP is the heart of the hexagonal architecture — its concrete, system-level form is the **inward-only dependency rule** and the ports/adapters wiring defined in **`sport-itsm-architecture`**. Honor DIP at the class level here; honor it at the module level there.

---

# Clean-Code Universals

- **DRY** — remove knowledge duplication; extract a single source of truth. (But don't over-abstract incidental similarity — see YAGNI.)
- **KISS** — the simplest solution that fully solves the problem. Avoid cleverness that costs readability.
- **YAGNI** — build what the current requirement needs; don't add speculative generality, options, or layers "for later."
- **High cohesion, low coupling** — related things live together; unrelated things don't know about each other. Depend through narrow interfaces.
- **Composition over inheritance** — prefer composing behavior; use inheritance only for genuine "is-a" with a stable contract.
- **Fail fast** — validate inputs at the boundary and use **guard clauses** / early returns to keep the happy path flat.

---

# Naming

- Reveal intent: names say **what** and **why**, not **how**. No abbreviations that aren't domain-standard.
- Use the **ubiquitous language** of the bounded context (Incident, ServiceRequest, Change, Release, ConfigurationItem, SLA…) — code should read in the domain's terms.
- Booleans read as predicates (`isResolved`, `hasBreachedSla`); functions are verbs; classes/types are nouns.
- Avoid noise words (`data`, `info`, `manager`, `helper`) unless they carry real meaning.

# Functions

- **Small and single-purpose**; a function does one thing at one level of abstraction.
- **Few parameters** (prefer an options object past 2–3); avoid boolean flag parameters that hide two behaviors — split the function.
- **No side effects hidden behind a query name**; command/query separation.
- Return early; keep nesting shallow.

# Types & Immutability

- **Leverage the type system** (strict TypeScript): precise types over `any`; discriminated unions over stringly-typed states; `readonly` and immutable updates by default.
- Treat value objects as immutable; produce new values instead of mutating.
- Make illegal states unrepresentable where practical.

# Error Handling

- Throw meaningful, typed errors at the boundary; never swallow errors silently.
- Don't use exceptions for normal control flow; use them for exceptional conditions.
- Preserve context (cause/message) when rethrowing; let framework layers (NestJS exception filters, Angular ErrorHandler) translate to user-facing, localized messages.

# Comments & Documentation

- Prefer **self-documenting code** over comments. Comment the **why**, not the **what**.
- Delete commented-out code and dead code — version control is the history.
- Keep public APIs of libraries documented at their `index.ts` barrel.

# Testing Discipline

- Design for testability: depend on abstractions so units can be tested in isolation (aligns with DIP/ISP).
- Tests assert **behavior**, not implementation details; one logical assertion focus per test.
- (Coverage thresholds and tooling are defined by the stack skills.)

---

# What NOT to do (guardrails)

- **Do NOT** write "god" classes/services/components — one responsibility per unit.
- **Do NOT** add speculative abstraction or configurability (YAGNI); do NOT copy-paste knowledge (DRY).
- **Do NOT** depend on concretions where an abstraction/port is warranted (DIP).
- **Do NOT** use boolean flag parameters that encode two behaviors — split the function.
- **Do NOT** use `any` to bypass the type system, or represent states as loose strings when a union fits.
- **Do NOT** swallow errors or use exceptions for ordinary control flow.
- **Do NOT** leave dead or commented-out code, or comments that restate the code.
- **Do NOT** deepen nesting where a guard clause / early return would flatten it.
