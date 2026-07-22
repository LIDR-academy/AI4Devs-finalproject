Feature: Estimation regression checks
  As a QA engineer
  I want deterministic regression scenarios for critical failures and empty states
  So that UI behavior is stable across releases

  Scenario: Invalid model shows estimation validation error
    Given I open the ProjectScope AI application
    And I create a new project with one use case
    When I set an invalid estimation model value
    And I trigger an estimation
    Then I should see an estimation validation error message
    And I should see the estimation result empty state

  Scenario: Loading report before estimation shows no-estimation warning
    Given I open the ProjectScope AI application
    And I create a new project with one use case
    When I load the generated report
    Then I should see a no-estimation warning in report view
