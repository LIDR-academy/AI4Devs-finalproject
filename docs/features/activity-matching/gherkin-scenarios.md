# Gherkin scenarios — activity-matching

```gherkin
Feature: Matching activity slide
  As a learner, I want to pair related items by tapping one then its match and see which
  pairs I got right on submit, so I learn relationships without drag-and-drop.

  Background:
    Given a valid matching slide with equal-length left and right columns and a well-formed correct pairing

  @s1
  Scenario: The slide renders with both columns unpaired and tappable
    When the slide renders
    Then both the left and right columns of items are visible
    And every item is unpaired and tappable
    And no drag-and-drop interaction is present

  @s2
  Scenario: First tap selects a pending item
    Given no item is pending
    When the learner taps an unpaired item
    Then that item becomes the pending selection
    And it is shown as highlighted/selected

  @s3
  Scenario Outline: Tapping an opposite-column item forms a pair, in either order
    Given the learner has tapped a <first> item as pending
    When the learner taps an unpaired <second> item
    Then a pair is formed between the two items
    And both items are shown as paired but not yet graded
    And no item remains pending

    Examples:
      | first | second |
      | left  | right  |
      | right | left   |

  @s4
  Scenario: Tapping the pending item again deselects it
    Given the learner has a pending item
    When the learner taps that same pending item again
    Then it is deselected
    And no pair is formed

  @s5
  Scenario: Tapping another same-column item retargets the pending selection
    Given the learner has a pending item in a column
    When the learner taps a different unpaired item in that same column
    Then the pending selection moves to the newly tapped item
    And the first item is no longer pending

  @s6
  Scenario: Tapping a paired item before submit releases its pair
    Given the learner has formed a pair
    When the learner taps one of the paired items before submitting
    Then that pair is released
    And both of its items become unpaired again

  @s7
  Scenario Outline: Submit is enabled only when every item is paired
    Given <paired-state>
    When the slide is shown
    Then the Submit control is <submit-state>

    Examples:
      | paired-state                        | submit-state |
      | at least one item is still unpaired | disabled     |
      | every item is paired                | enabled      |

  @s8
  Scenario: Submitting grades every pair and locks the activity
    Given every item is paired
    When the learner taps Submit
    Then each formed pair is graded against the correct pairing
    And each pair's correct/incorrect result is shown
    And the activity is locked with no further re-pairing

  @s9
  Scenario: All pairs correct
    Given every formed pair matches the correct pairing
    When the learner submits
    Then every pair is marked correct
    And an all-correct result is shown

  @s10
  Scenario: Some pairs incorrect
    Given some formed pairs do not match the correct pairing
    When the learner submits
    Then the matching pairs are marked correct
    And the non-matching pairs are marked incorrect
    And a mixed (incorrect) result is shown

  @s11
  Scenario: Explanation is shown with the results
    Given the slide has an explanation
    And every item is paired
    When the learner submits
    Then the explanation is displayed alongside the results

  @s12
  Scenario Outline: The graded result is exposed as answered state with partial counts
    Given a slide whose correct pairing has <total> pairs
    And the learner has paired every item
    When the learner submits
    Then the answered state reports activity type "matching" with the slide id
    And it reports <correct> of <total> pairs correct
    And whole-slide correct is <is-correct>

    Examples:
      | total | correct | is-correct |
      | 3     | 3       | true       |
      | 3     | 1       | false      |
      | 3     | 0       | false      |

  @s13
  Scenario: Empty slide shows an unavailable notice
    Given a slide whose left or right item list is empty
    When the slide renders
    Then an unavailable notice is shown instead of the columns
    And nothing is interactive

  @s14
  Scenario: Unequal column lengths degrade to an unavailable notice
    Given a slide whose left and right lists differ in length
    When the slide renders
    Then an unavailable notice is shown
    And the slide does not crash

  @s15
  Scenario: Malformed correct pairing degrades to an unavailable notice
    Given a slide whose correct pairing references an unknown item or is not a one-per-left matching
    When the slide renders
    Then an unavailable notice is shown
    And the slide does not crash
    And no grading is attempted

  @s16
  Scenario: User-facing chrome is localized
    Given the app is set to a supported locale
    And every item is paired
    When the learner submits
    Then the Submit label, result labels, per-pair result wording, summary, explanation heading, and unavailable notice render from the active locale bundle
    And no user-facing chrome string is hardcoded

  @s17
  Scenario: The slide is accessible
    When the slide renders and the learner interacts with it
    Then each item exposes a button role and an accessible label
    And the pending and paired states are conveyed via accessibility state, not color alone
    And each pair's correctness is conveyed by text and icon
    And the result is announced to assistive technology on submit
    And interactive targets meet the minimum touch-target size
```
