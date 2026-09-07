# Harness smoke test — it proves the acceptance chain (Nx target -> served
# shell -> Cypress -> Gherkin -> step definitions) is wired end to end.
#
# It asserts no user-facing copy, because the shell renders none: UI strings
# are Transloco keys and Transloco belongs to the NFR epic's i18n slice. What
# is observable today is the structure of the shell.
Feature: The web acceptance harness reaches the served application shell

  Scenario: The shell renders its main landmark with the default route resolved
    When the harness visits the application root
    Then the shell exposes its main landmark
    And the router has settled on the default route
