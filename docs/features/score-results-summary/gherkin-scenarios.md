# Gherkin contract — score-results-summary

Feature: End-of-lesson score and results summary
  As a learner, I want to see my score when I finish a lesson and have each retake
  recorded as its own attempt, so I can gauge what I learned and track improvement.

  Background:
    Given I am an authenticated learner who has reached the end of a lesson
    And the results summary shows only the current attempt

  @s1
  Scenario: Score is shown for a completed lesson with system-checked activities
    Given a lesson with 3 system-checked activity slides
    And I answered all 3 correctly
    When I reach the results summary
    Then I see my score as 3 out of 3
    And I see the score as a percentage

  @s2
  Scenario: Only system-checked types count toward the score
    Given a lesson with 2 multiple-choice slides, 1 fill-in-the-blank slide, 1 flashcard slide, and 1 open-ended slide
    And I answered the 3 system-checked slides correctly
    When I reach the results summary
    Then the total counts only the 3 system-checked slides
    And the flashcard and open-ended slides are excluded from the score

  @s3
  Scenario Outline: A matching slide contributes a single whole-slide result
    Given a lesson whose only gradable slide is one matching slide
    And I submit the matching slide with "<pairing>"
    When I reach the results summary
    Then the matching slide counts as "<result>" out of 1

    Examples:
      | pairing                  | result |
      | every pair correct       | 1      |
      | at least one pair wrong  | 0      |
      | an item left unpaired    | 0      |

  @s4
  Scenario: Unanswered system-checked slides count toward the total but not the correct count
    Given a lesson with 4 system-checked activity slides
    And I answered 2 correctly and left 2 unanswered
    When I reach the results summary
    Then I see my score as 2 out of 4

  @s5
  Scenario: Loading state while the attempt is being saved
    Given a scorable lesson has just been completed
    When the attempt is being saved
    Then I see a loading indicator on the results summary
    And the actions are unavailable until saving resolves

  @s6
  Scenario: Each completed attempt is recorded separately
    Given I completed and scored a lesson once
    When I retake the lesson and complete it again
    Then a new attempt with its own score, total, and timestamp is recorded
    And the previous attempt's record is not overwritten

  @s7
  Scenario: A failed save shows the score with a retry action
    Given a scorable lesson has been completed
    And saving the attempt fails
    When the results summary renders
    Then I still see my score
    And I see a non-blocking notice that the attempt could not be saved
    And a retry action re-attempts the save

  @s8
  Scenario: An instructional-only lesson shows a completion state
    Given an instructional-only lesson
    When I reach the end of the lesson
    Then I see a completion state instead of a score
    And no attempt record is created

  @s9
  Scenario: A lesson with zero system-checked slides shows a completion state
    Given a lesson whose only activities are flashcards and open-ended slides
    When I reach the end of the lesson
    Then I see the completion state rather than a score of 0 out of 0
    And no attempt record is created

  @s10
  Scenario: The completion state offers both retake and return actions
    Given I am on the completion state
    When the actions render
    Then I can retake the lesson
    And I can return to my lessons

  @s11
  Scenario: Retake restarts the same lesson from the beginning
    Given I am on the results summary
    When I choose to retake the lesson
    Then I restart the same lesson from its first slide
    And the lesson is not regenerated
    And completing it again records a new attempt

  @s12
  Scenario: Results copy is localized
    Given the active locale is Spanish
    When the results summary renders
    Then every visible label comes from a translation key in Spanish
    And no hardcoded results copy remains

  @s13
  Scenario: The results summary is accessible
    Given the results summary is rendered
    When assistive technology inspects it
    Then the score and any state change are announced
    And each action exposes an accessible role and label
    And correctness is conveyed by more than color alone
