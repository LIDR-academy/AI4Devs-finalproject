# Harness smoke test — it proves the acceptance chain (Nx target -> live API
# process -> Cypress -> Gherkin -> step definitions) is wired end to end.
#
# It asserts nothing about API behavior, because there is none to assert yet:
# `apps/api` declares no controller until T-C10-28, so every route answers 404.
# Adding a route to make this greener is explicitly forbidden by T-C10-06.
Feature: The API acceptance harness reaches a live API process

  Scenario: The API process answers HTTP on the port the harness configured
    When the harness requests the API root
    Then the API answers over HTTP
