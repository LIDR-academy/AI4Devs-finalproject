Feature: MVP estimation smoke flow
  As a user
  I want to complete the main estimation flow
  So that I can validate roadmap and report generation end to end

  Scenario: User completes project estimation and views report
    Given I open the ProjectScope AI application
    When I create a new project with valid data
    And I add two use cases to the selected project
    And I trigger an estimation
    And I load the generated report
    Then I should see estimation success feedback
    And I should see the report with roadmap, use cases, assumptions, and risks
