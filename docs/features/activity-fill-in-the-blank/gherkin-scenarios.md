# Gherkin scenarios — activity-fill-in-the-blank

The signed contract. Every `@s` tag is the traceability key the `implementator` and reviewers use;
each maps to ≥ 1 concrete test. Every acceptance criterion in `spec.md` / the user story maps to ≥ 1 scenario here.

```gherkin
Feature: Fill-in-the-blank activity slide
  As a learner, I want to type an answer into a fill-in-the-blank activity slide
  and see immediately whether it's correct, so that I know if I understood the
  material without waiting until the end of the lesson.

  Background:
    Given a valid fill-in-the-blank slide whose content has exactly one "____" blank
    And a non-empty list of accepted answers

  @s1
  Scenario: The slide renders unanswered with an inline editable blank
    When the slide renders
    Then the prompt is shown with an inline empty editable text input in place of the blank
    And the Submit control is enabled
    And no result is shown

  @s2
  Scenario: A normalized matching answer is marked correct and locks
    Given the learner has typed an answer that matches an accepted answer after normalization
    When the learner submits
    Then a correct result is shown
    And the input becomes read-only
    And the activity is locked

  @s3
  Scenario: A non-matching answer is marked incorrect, reveals the first accepted answer, and locks
    Given the learner has typed an answer that matches no accepted answer after normalization
    When the learner submits
    Then an incorrect result is shown
    And the first accepted answer (acceptedAnswers[0]) is revealed
    And acceptedAnswerShown is acceptedAnswers[0]
    And the input becomes read-only
    And the activity is locked

  @s4
  Scenario: Explanation is shown with the result
    Given the slide has an explanation
    When the learner submits any answer
    Then the explanation is displayed alongside the result

  @s5
  Scenario: After submit the attempt cannot be changed or resubmitted
    Given the learner has already submitted an answer
    When the learner tries to edit the input or submit again
    Then the original answer is unchanged
    And no new answer is recorded

  @s6
  Scenario: Submitting an empty input grades incorrect and still resolves
    Given the blank is empty
    When the learner submits
    Then an incorrect result is shown
    And the first accepted answer (acceptedAnswers[0]) is revealed
    And acceptedAnswerShown is acceptedAnswers[0]
    And the activity is locked

  @s7
  Scenario Outline: Submit button and Enter/return use the same grade path
    Given the learner has typed an answer
    When the learner submits via <method>
    Then the answer is graded once
    And the result is shown
    And the activity is locked

    Examples:
      | method         |
      | Submit control |
      | Enter/return   |

  @s8
  Scenario Outline: Normalization equates case, trim, whitespace, and diacritics
    Given an accepted answer of "<accepted>"
    And the learner types "<typed>"
    When the learner submits
    Then the result is marked correct

    Examples:
      | accepted | typed        |
      | Paris    | paris        |
      | Paris    |  Paris       |
      | New York | new   york   |
      | café     | cafe         |
      | café     | CAFÉ         |

  @s9
  Scenario: Matching any of multiple accepted answers counts as correct
    Given the slide accepts more than one answer
    And the learner types a value that matches a non-first accepted answer after normalization
    When the learner submits
    Then the result is marked correct
    And acceptedAnswerShown is that matched non-first accepted answer (not acceptedAnswers[0])

  @s10
  Scenario Outline: The graded result is exposed as answered state with concrete acceptedAnswerShown
    Given a valid fill-in-the-blank slide with acceptedAnswers ["Paris", "City of Light"]
    When the learner submits "<raw>"
    Then the answered state reports activity type "fill-in-the-blank" with the slide id
    And it reports the raw submitted answer "<raw>"
    And it reports whether the answer was correct as <is-correct>
    And acceptedAnswerShown is "<shown>"
    And that answered state is available to the end-of-lesson score and to resume

    Examples:
      | raw           | is-correct | shown         |
      | paris         | true       | Paris         |
      | city of light | true       | City of Light |
      | london        | false      | Paris         |
      |               | false      | Paris         |

  @s11
  Scenario Outline: Invalid acceptedAnswers show an unavailable notice
    Given a slide whose acceptedAnswers <invalid-shape>
    When the slide renders
    Then an unavailable notice is shown
    And nothing is interactive
    And no grading is attempted

    Examples:
      | invalid-shape |
      | is an empty list |
      | contains an empty-string entry (e.g. ["Paris", ""]) |

  @s12
  Scenario: Missing or invalid blank marker shows an unavailable notice
    Given a slide whose content is missing "____" or cannot render a single inline blank
    When the slide renders
    Then an unavailable notice is shown
    And the slide does not crash
    And no grading is attempted

  @s13
  Scenario: User-facing chrome is localized
    Given the app is set to a supported locale
    When the slide and its results render
    Then the Submit label, result labels, explanation heading, blank input name, and unavailable notice render from the active locale bundle
    And no user-facing chrome string is hardcoded

  @s14
  Scenario: The slide is accessible
    When the slide renders and the learner interacts with it
    Then the blank input exposes an accessible name
    And the Submit control is reachable and meets the minimum touch-target size
    And correctness is conveyed by text and icon, not color alone
    And the result is announced to assistive technology on submit
```

## AC → scenario coverage

| Story / spec AC | Scenario(s) |
|---|---|
| Renders empty editable input with prompt | @s1 |
| Matching answer → correct feedback | @s2, @s8, @s9 |
| Non-matching → incorrect + reveal accepted | @s3 |
| Explanation with result | @s4 |
| Lock after submit (read-only, no resubmit) | @s5 |
| Empty submit → incorrect + resolves | @s6 |
| Answered state for R7/R9 | @s10 |
| Submit button + Enter | @s7 |
| Normalize (trim/case/whitespace/diacritics) | @s8 |
| Multi acceptedAnswers | @s9, @s10 |
| Malformed / empty → unavailable | @s11, @s12 |
| i18n chrome | @s13 |
| Accessibility | @s14 |

## Scenario → primary test kind

| Scenario | Primary test |
|---|---|
| @s1 | `fill-in-the-blank.test.tsx` (unanswered inline blank + Submit enabled) |
| @s2 | `grade-fill-in-the-blank.test.ts` + organism/wiring (correct + lock) |
| @s3 | grader + organism (incorrect + reveal `[0]` + lock) |
| @s4 | `fill-in-the-blank.test.tsx` (explanation with result) |
| @s5 | organism + `fill-in-the-blank-activity.test.tsx` (ignore edit/resubmit; onAnswered once) |
| @s6 | grader (empty → incorrect) + organism/wiring resolve path |
| @s7 | organism (Enter + button → same `onSubmit`) + wiring once |
| @s8 | `normalizeFillInAnswer` / grader unit outline |
| @s9 | grader (non-first accepted match + `acceptedAnswerShown` = matched) |
| @s10 | grader shape + `acceptedAnswerShown` rules + activity `onAnswered` payload |
| @s11 | `isFillInTheBlankSlideValid` false (empty list **or** any empty entry) + organism unavailable |
| @s12 | valid=false / unrenderable → unavailable, no crash |
| @s13 | activity labels via `t()` + localization key alignment |
| @s14 | organism a11y assertions + Playwright e2e |
