# Gherkin — lesson-player

```gherkin
Feature: Slide navigation & lesson player
  As a learner, I want to work through my generated lesson one slide at a time —
  with images and in-place activities, visible progress, and forward/back navigation,
  ending on a results slide inside the same deck — so that I answer activities before
  seeing my results, on web or mobile.

  Background:
    Given I am authenticated
    And I open a generated lesson from its detail screen

  # --- Loading / happy display ---

  @s17
  Scenario: The lesson is loading
    Given the lesson has not finished loading
    When the player opens
    Then I see a loading indicator
    And I do not see any slide content yet

  @s1
  Scenario: Player starts on the first slide, one at a time
    Given the lesson has 4 content slides
    When the player finishes loading
    Then I see exactly one slide
    And it is the first content slide of the lesson

  @s5
  Scenario: An instructional slide shows its teaching content
    Given the current slide is an instructional slide
    Then I see its title
    And I see its content text

  @s6
  Scenario: An activity slide shows its answerable activity
    Given the current slide is an activity slide
    Then I see its title
    And I see its prompt
    And I see the matching activity component for its type so I can answer it in place

  @s7
  Scenario: A slide with a resolvable image shows the image
    Given the current slide has an associated extracted image
    And the image reference resolves to a usable URL
    Then I see the image rendered alongside the slide content
    And the image is scaled to fit the viewport

  @s8
  Scenario: A slide without an image shows text only
    Given the current slide has no associated image
    Then I see the slide content as text only
    And no image placeholder or error is shown

  # --- Navigation & progress (results is the final deck slide) ---

  @s2
  Scenario: Advancing between content slides
    Given I am on a content slide that is not the last content slide
    When I choose Next
    Then I see the following content slide
    And I still see exactly one slide

  @s3
  Scenario: Going back to the previous content slide
    Given I am on a content slide that is not the first
    When I choose Back
    Then I see the preceding content slide

  @s4
  Scenario: Back is unavailable on the first slide
    Given I am on the first content slide
    Then the Back control is disabled or not shown

  @s10
  Scenario: Progress is visible and counts the results slide as the final step
    Given the lesson has 4 content slides
    Then the deck has 5 steps in total, the results slide being the last
    And I see a progress bar and a "slide X of N" indicator reflecting the current step out of 5
    When I advance to the next slide
    Then the progress bar and the "slide X of N" indicator update to the new step
    And on the results slide the indicator reads the final step, "slide 5 of 5"

  @s11
  Scenario: I may skip an activity without answering it
    Given the current slide is an activity slide I have not answered
    When I choose Next
    Then I advance to the following slide
    And I am not blocked or prompted to answer first

  # --- Answer state across the session ---

  @s12
  Scenario: Returning to an answered activity restores my prior answer
    Given I answered an activity slide earlier in this session
    And I navigated away from it
    When I return to that slide
    Then I see my previous answer state exactly as I left it
    And it is not reset to unanswered

  # --- Entering results (the last slide of the deck) ---

  @s13
  Scenario: Advancing into the results slide shows the real results and saves once
    Given I am on the last content slide
    And I answered some activities correctly and some incorrectly during this session
    When I choose Next
    Then the results are shown as the final slide of the deck, inside the player
    And the results reflect the real lesson and the answers I gave this session
    And no separate results route is opened and the stub fixture is not used
    And Next is not offered on the results slide
    And my attempt is persisted exactly once for this session

  @s14
  Scenario: Unanswered activities are scored as wrong on entering results
    Given the lesson has system-checked activity slides I left unanswered
    When I advance into the results slide
    Then each unanswered activity is finalized as an incorrect graded answer
    And it counts against the score rather than being omitted

  @s20
  Scenario: Going Back from the results slide returns to the last content slide
    Given I am on the results slide
    When I choose Back
    Then I see the preceding content slide
    And any answer I gave on that slide this session is still shown, not reset

  @s21
  Scenario: Re-entering results after Back does not persist another attempt
    Given I reached the results slide and my attempt was saved for this session
    When I go Back to a content slide
    And I advance into the results slide again in the same session
    Then I see the results again with the score for my current answers
    And no additional attempt is persisted for this session

  @s18
  Scenario: Retaking the lesson starts a fresh session within the deck
    Given I am on the results slide
    When I choose to retake the lesson
    Then the deck returns to the first content slide
    And none of my previous in-session answers remain
    And the results slide is still the final step for the fresh run
    And the session is cleared so the next entry to results may save a new attempt

  @s22
  Scenario: Finishing again after a retake persists a new attempt
    Given I retook the lesson, clearing the previous session
    When I advance through to the results slide again
    Then a new attempt is persisted for this fresh session

  # --- Empty / error / image-degrade edges ---

  @s15
  Scenario: A lesson with no slides shows an empty state
    Given the lesson has 0 slides
    When the player finishes loading
    Then I see an empty state
    And I see a way to go back
    And no player deck, results slide, or error is shown

  @s16
  Scenario: A lesson that fails to load shows an error state
    Given the lesson fails to load
    When the player opens
    Then I see an error state with a retry action and a way to go back
    When I choose retry and the lesson then loads
    Then I see the first content slide

  @s9
  Scenario: An unresolvable image degrades to text only
    Given the current slide references an image
    And the image reference is missing or fails to resolve
    Then I see the slide content as text only
    And no error is shown to me for the missing image

  # --- Responsiveness ---

  @s19
  Scenario Outline: The player is usable on web and mobile viewports
    Given the player is shown on a <viewport> viewport
    Then the navigation controls and the progress indicator stay visible and usable
    And any slide image scales appropriately to that viewport

    Examples:
      | viewport |
      | web      |
      | mobile   |
```
