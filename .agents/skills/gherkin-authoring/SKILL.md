---
name: gherkin-authoring
description: Distill a spec into a tagged Gherkin `gherkin-scenarios.md` contract for this monorepo's orchestrator. Use when writing or editing a `docs/features/<name>/gherkin-scenarios.md`, turning acceptance criteria into `@s`-tagged scenarios, or on "write the feature file", "gherkin", "BDD scenarios", "the contract". `spec_partner` invokes this in the same step as the spec; the `gherkin-scenarios.md` is part of what the human signs at the single combined spec + contract gate. Do NOT write tests or code here — the TDD implementator consumes the `@s` tags afterward.
---

# Gherkin authoring — the executable contract

The `gherkin-scenarios.md` is part of what the human signs at the single combined spec + contract gate. After approval, ambiguity is a bug in the contract, not the code. `spec_partner` produces it alongside the spec in one step; source it from that `spec.md` and output to `docs/features/<name>/gherkin-scenarios.md`.

## Format

- One `Feature:` block per feature; a short description of the value it delivers.
- One `Scenario:` (or `Scenario Outline:`) per distinct behavior, each **tagged `@s1 … @sn`** on its own line above the scenario. The tag is the traceability key used by `implementator` and the reviewers.
- Steps use `Given` (context) / `When` (action) / `Then` (observable outcome); `And`/`But` to extend.
- Cover the happy path **and** the error/empty/edge behaviors. For UI, include a scenario per relevant state (Loading/Content/Error/Empty).
- Use `Scenario Outline` + `Examples` for the same behavior across data variants.
- Keep steps declarative (business language), not imperative (no clicks/selectors). Selectors belong in step glue / tests, not the contract.
- Every acceptance criterion in `spec.md` must map to at least one scenario.

## Example

```gherkin
Feature: Lesson list
  As a learner, I want to see my lessons so I can resume studying.

  @s1
  Scenario: Lessons load successfully
    Given I am authenticated
    And I have 3 lessons
    When I open the lessons screen
    Then I see my 3 lessons

  @s2
  Scenario: No lessons yet
    Given I am authenticated
    And I have no lessons
    When I open the lessons screen
    Then I see an empty state inviting me to create one

  @s3
  Scenario: Lessons fail to load
    Given the lessons request will fail
    When I open the lessons screen
    Then I see an error state with a retry action
```

## Gherkin → test mapping (how the implementator consumes it)

| Scenario kind | Primary test (TDD-first) |
|---|---|
| UI state/behavior | `<name>.test.tsx` (RN Testing Library) — assert the state renders/handles; plus a Playwright e2e per the `storybook-e2e-tests` skill for the rendered/interaction check |
| Business rule / data flow | `*.service.test.ts` / `*.dao.test.ts` / `use-*.test.ts` |
| Cross-layer behavior | the slice's integration test |

Each `@s` → at least one concrete test. The `implementator` records the `@s → test` map in `tdd.md`; the reviewers verify coverage against it.

## The gate

`orchestrator_lead` presents `spec.md` **and** this `gherkin-scenarios.md` together for a single human approval. The human may loop edits back to `spec_partner`. On approval → `approved`; building begins.
