# Gherkin scenarios — activity-open-ended

The signed contract. Every `@s` tag is the traceability key the `implementator` and reviewers use;
each maps to ≥ 1 concrete test. Every acceptance criterion in `spec.md` / the user story maps to ≥ 1 scenario here.

```gherkin
Feature: Open-ended activity slide
  As a learner, I want to write a free-text answer on an open-ended activity slide
  and compare it against a model answer, so that I can self-assess my understanding
  even when the answer cannot be auto-graded.

  Background:
    Given a valid open-ended slide with a non-empty prompt and a non-empty model answer

  @s1
  Scenario: The slide renders unanswered with an editable free-text input
    When the slide renders
    Then the prompt is shown
    And an empty editable multiline text input is shown
    And the Submit control is enabled
    And the model answer is hidden
    And no self-mark controls are shown

  @s2
  Scenario: Submitting a typed response locks the input and reveals the model answer
    Given the learner has typed a free-text response
    When the learner submits via the Submit control
    Then the input becomes read-only
    And the learner's submitted text remains visible
    And the model answer is revealed
    And the activity is locked
    And no correct or incorrect result is shown
    And no self-mark controls are shown

  @s3
  Scenario: Explanation is shown when the model answer is revealed
    Given the slide has an explanation
    When the learner submits any response
    Then the explanation is displayed alongside the model answer

  @s4
  Scenario: After submit the attempt cannot be changed or resubmitted
    Given the learner has already submitted a response
    When the learner tries to edit the input or submit again
    Then the original submitted text is unchanged
    And no new answer is recorded

  @s5
  Scenario: Submitting an empty response still reveals the model answer
    Given the text input is empty
    When the learner submits via the Submit control
    Then the model answer is revealed
    And the input becomes read-only
    And the activity is locked
    And the answered state records an empty submitted answer

  @s6
  Scenario: The submitted result is answered-state only and excluded from the score
    Given a valid open-ended slide
    When the learner submits a response
    Then the answered state reports activity type "open-ended" with the slide id
    And it reports the raw submitted answer
    And it does not report a correct or incorrect grade
    And that answered state is available for resume
    And the slide does not contribute to the end-of-lesson score total

  @s7
  Scenario Outline: Invalid prompt or model answer shows an unavailable notice
    Given a slide whose <field> is empty or whitespace-only
    When the slide renders
    Then an unavailable notice is shown
    And nothing is interactive
    And no submission is recorded

    Examples:
      | field        |
      | prompt       |
      | model answer |

  @s8
  Scenario: User-facing chrome is localized
    Given the app is set to a supported locale
    When the slide and its submitted comparison render
    Then the Submit label, your-answer heading, model-answer heading, explanation heading, answer input name, and unavailable notice render from the active locale bundle
    And no user-facing chrome string is hardcoded

  @s9
  Scenario: The slide is accessible
    When the slide renders and the learner interacts with it
    Then the text input exposes an accessible name
    And the Submit control is reachable and meets the minimum touch-target size
    And the model-answer reveal is announced to assistive technology on submit
    And locked state is conveyed to assistive technology

  @s10
  Scenario: Enter/return inserts a newline and does not submit
    Given the learner has typed a free-text response
    When the learner presses Enter/return in the input
    Then a newline is inserted into the draft text
    And the activity remains unanswered and unlocked
    And the model answer stays hidden
    And no answer is recorded
```

## AC → scenario coverage

| Story / spec AC | Scenario(s) |
|---|---|
| Renders empty editable input; model hidden | @s1 |
| Submit → lock + reveal model answer beside learner text | @s2 |
| Explanation with model-answer reveal | @s3 |
| Lock after submit (read-only, no resubmit) | @s4 |
| Empty submit still reveals model answer | @s5 |
| No correct/incorrect; excluded from R7; answered for R9 | @s6 |
| Malformed → unavailable | @s7 |
| i18n chrome | @s8 |
| Accessibility | @s9 |
| Enter/return = newline only (does not submit) | @s10 |
| Component-split folder (`tsx` / types / hook / helpers) | task-3 done criteria (structural; not a runtime `@s`) |

## Scenario → primary test kind

| Scenario | Primary test |
|---|---|
| @s1 | `open-ended.test.tsx` (unanswered + model hidden) |
| @s2 | organism + `open-ended-activity.test.tsx` (submit → lock + reveal) |
| @s3 | `open-ended.test.tsx` (explanation with reveal) |
| @s4 | organism + activity (ignore edit/resubmit; onAnswered once) |
| @s5 | organism + activity (empty submit → reveal + `submittedAnswer: ''`) |
| @s6 | activity answered-state shape + `isSystemCheckedActivity('open-ended') === false` |
| @s7 | `isOpenEndedSlideValid` false + organism unavailable |
| @s8 | activity labels via `t()` + localization key alignment |
| @s9 | organism a11y assertions + Playwright e2e |
| @s10 | `open-ended.test.tsx` + Playwright e2e (Enter → newline, still unlocked) |
