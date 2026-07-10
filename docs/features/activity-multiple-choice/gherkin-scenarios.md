# Gherkin scenarios — activity-multiple-choice

The signed contract. Every `@s` tag is the traceability key the `implementator` and reviewers use;
each maps to ≥ 1 concrete test. Every acceptance criterion in `spec.md` maps to ≥ 1 scenario here.

```gherkin
Feature: Multiple-choice activity slide
  As a learner, I want to select an answer on a multiple-choice activity slide
  and see immediately whether I got it right, so that I know if I understood the
  material without waiting until the end of the lesson.

  Background:
    Given a multiple-choice slide with a question, several options, and one correct option

  @s1
  Scenario: The slide renders all options, unanswered
    When the slide is shown
    Then every option is visible and selectable
    And no option is pre-selected
    And no result is shown

  @s2
  Scenario: Selecting an option locks the attempt
    When I select an option
    Then that option becomes my answer
    And all options become non-interactive
    And I cannot change my answer on this view

  @s3
  Scenario: A correct choice is marked correct
    When I select the correct option
    Then my option is marked correct
    And a correct result is shown

  @s4
  Scenario: An incorrect choice is marked incorrect and reveals the correct option
    When I select an option that is not the correct one
    Then my option is marked incorrect
    And the correct option is revealed alongside it
    And an incorrect result is shown

  @s5
  Scenario: The explanation is shown with the result
    Given the slide has an explanation
    When I select any option
    Then the explanation is shown together with the result

  @s6
  Scenario: Only one option can be chosen per attempt
    Given I have already selected an option
    When I attempt to select a different option
    Then my original answer is unchanged
    And no new answer is recorded

  @s7
  Scenario: The graded result is exposed as answered state
    When I select an option
    Then the slide's answered state reports the chosen option, the correct option, and whether it was correct
    And that answered state is available to the end-of-lesson score and to resume

  @s8
  Scenario: A slide with no options shows an unavailable state
    Given a multiple-choice slide that has no options
    When the slide is shown
    Then an unavailable notice is shown instead of a question
    And nothing is selectable

  @s9
  Scenario: A malformed slide degrades gracefully
    Given a multiple-choice slide whose correct option is not among its options
    When the slide is shown
    Then an unavailable notice is shown instead of a broken question
    And the slide does not crash

  @s10
  Scenario: Result and explanation chrome are localized
    Given the app locale is set to a supported language
    When feedback is shown after I answer
    Then the correct/incorrect result label and the explanation heading are rendered from the active locale bundle
    And no user-facing chrome string is hardcoded

  @s11
  Scenario: The slide is accessible
    When the slide is shown
    Then each option exposes a button role and an accessible label
    And correctness is conveyed by text and icon, not color alone
    When I answer
    Then the result is announced to assistive technology
```

## AC → scenario coverage

| AC | Scenario(s) |
|---|---|
| AC1 (renders all options, none pre-selected) | @s1 |
| AC2 (select → lock → disable) | @s2 |
| AC3 (correct feedback) | @s3 |
| AC4 (incorrect feedback + reveal correct) | @s4 |
| AC5 (explanation shown with result) | @s5 |
| AC6 (single-select, no re-selection) | @s6 |
| AC7 (answered state exposed for R7/R9) | @s7 |
| AC8 (empty — no options) | @s8 |
| AC9 (error — malformed payload) | @s9 |
| AC10 (i18n chrome) | @s10 |
| AC11 (accessibility) | @s11 |

## Scenario → primary test kind (how the implementator consumes it)

| Scenario | Primary test |
|---|---|
| @s1 | `multiple-choice.test.tsx` (unanswered render: all options, none selected, no banner) |
| @s2 | `multiple-choice.test.tsx` (options disabled once answered) + `multiple-choice-activity.test.tsx` (select → locked) |
| @s3 | `grade-multiple-choice.test.ts` (isCorrect true) + `multiple-choice.test.tsx` (correct tile + banner) |
| @s4 | `grade-multiple-choice.test.ts` (isCorrect false) + `multiple-choice.test.tsx` (incorrect tile + revealed correct + banner) |
| @s5 | `multiple-choice.test.tsx` (explanation renders with result; absent when no explanation) |
| @s6 | `multiple-choice.test.tsx` (locked options ignore taps) + `multiple-choice-activity.test.tsx` (second select is a no-op; onAnswered fires once) |
| @s7 | `grade-multiple-choice.test.ts` (MultipleChoiceAnswer shape) + `multiple-choice-activity.test.tsx` integration (onAnswered payload) |
| @s8 | `multiple-choice.test.tsx` (zero options → unavailable, non-interactive) |
| @s9 | `multiple-choice.test.tsx` (correctOptionId ∉ options → unavailable, no crash) + `grade-multiple-choice.test.ts` (throws on unknown option) |
| @s10 | `multiple-choice-activity.test.tsx` (labels sourced from `t()`) + localization coverage test (en/es/pt/de key alignment) |
| @s11 | `multiple-choice.test.tsx` (roles/labels, non-color-only feedback, result announced) + Playwright e2e (`multiple-choice.e2e.js`) |
```
