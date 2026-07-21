# Specification artifact — NOT run by any BDD engine in this repo.
# It is translated by hand into examples/login-browser-test.php (Pest 4 browser test).
# Grounded in real routes/flows: routes/web.php (login, login.store, dashboard),
# resources/views/livewire/auth/login.blade.php.

Feature: Sign in
  As a registered user
  I want to sign in with my email and password
  So that I can reach my dashboard

  # ❌ Imperative / technical — narrates clicks, DOM IDs, and framework internals.
  # Do NOT write scenarios like this (kept here only to contrast):
  #
  # Scenario: Log in
  #   Given I open "/login"
  #   When I type "ada@example.com" into #email
  #   And I type "password" into #password
  #   And I click the button with id "#login-button"
  #   Then a session cookie is set and I am redirected to "/dashboard"

  # ✅ Declarative / business language — intent and observable outcome only.

  Scenario: A registered user signs in with valid credentials
    Given a registered user
    When the user signs in with valid credentials
    Then the user reaches their dashboard

  Scenario: Sign-in is refused with a wrong password
    Given a registered user
    When the user tries to sign in with an incorrect password
    Then the user is told the credentials are invalid
    And the user remains signed out
