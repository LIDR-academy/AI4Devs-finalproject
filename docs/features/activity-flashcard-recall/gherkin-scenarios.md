# Gherkin scenarios — activity-flashcard-recall

```gherkin
Feature: Flashcard / recall activity slide
  As a learner, I want to reveal a flashcard's answer and mark for myself whether I recalled it,
  so that I can gauge my own understanding as I study, even though it isn't part of my graded score.

  Background:
    Given a valid flashcard slide with a front/prompt and a back/answer

  @s1
  Scenario: The slide renders with only the front visible
    When the slide renders
    Then only the front/prompt is visible
    And the back/answer is hidden
    And a reveal action is available
    And no self-mark actions are shown yet

  @s2
  Scenario: Revealing shows the answer alongside the front
    Given the answer is hidden
    When the learner taps to reveal
    Then the back/answer becomes visible alongside the front

  @s3
  Scenario: Self-mark actions become available once the answer is revealed
    Given the learner has revealed the answer
    When the revealed view is shown
    Then a "Recalled" self-mark action is available
    And a "Not recalled" self-mark action is available

  @s4
  Scenario Outline: Choosing a self-mark locks it in and confirms it
    Given the learner has revealed the answer
    When the learner taps "<mark>"
    Then that self-mark is locked in for this view
    And the chosen mark is visually and accessibly confirmed
    And the self-mark actions are no longer interactive

    Examples:
      | mark          |
      | Recalled      |
      | Not recalled  |

  @s5
  Scenario Outline: A locked self-mark cannot be changed or re-emitted
    Given the learner has self-marked "Recalled"
    When the learner taps "<tapped>"
    Then the locked self-mark stays "Recalled"
    And no new answered state is produced

    Examples:
      | tapped        |
      | Not recalled  |
      | Recalled      |

  @s6
  Scenario Outline: The self-mark is emitted once as answered state and is excluded from the score
    Given the learner has revealed the answer
    When the learner taps "<mark>"
    Then the answered state is reported exactly once
    And it reports activity type "flashcard" with the slide id and recalled = <recalled>
    And it does not contribute to the end-of-lesson auto-graded score total

    Examples:
      | mark          | recalled |
      | Recalled      | true     |
      | Not recalled  | false    |

  @s7
  Scenario: An explanation is shown with the revealed answer
    Given the slide has an explanation
    And the answer is hidden
    When the learner reveals the answer
    Then the explanation is displayed alongside the answer

  @s8
  Scenario Outline: A slide missing its front or back degrades to an unavailable notice
    Given a flashcard slide whose <missing> is empty
    When the slide renders
    Then an unavailable notice is shown instead of the card
    And nothing is interactive
    And the slide does not crash

    Examples:
      | missing        |
      | front/prompt   |
      | back/answer    |

  @s9
  Scenario: User-facing chrome is localized
    Given the app is set to a supported locale
    When the slide renders, the answer is revealed, and a self-mark is chosen
    Then the reveal label, the self-mark actions, the locked confirmation, the answer and explanation headings, and the unavailable notice render from the active locale bundle
    And no user-facing chrome string is hardcoded

  @s10
  Scenario: The slide is accessible
    When the slide renders and the learner reveals and self-marks
    Then the reveal and self-mark controls expose a button role and an accessible label
    And the revealed and locked-self-mark states are conveyed via accessibility state, not color alone
    And the revealed answer is announced to assistive technology
    And interactive targets meet the minimum touch-target size
```
