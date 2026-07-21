# Specification artifact — NOT run by any BDD engine in this repo.
# Translated by hand into examples/two-factor-challenge-browser-test.php.
# Grounded in real flow: tests/Feature/Auth/TwoFactorChallengeTest.php,
# routes (login.store, two-factor.login), User::factory()->withTwoFactor().

Feature: Two-factor authentication challenge
  As a registered user with two-factor authentication enabled
  I want to be asked for a second factor after my password
  So that a stolen password alone cannot access my account

  # ❌ Imperative / technical — do NOT write it this way (contrast only):
  #
  # Scenario: 2FA
  #   Given a user row with a non-null "two_factor_confirmed_at"
  #   When I POST valid credentials to "/login.store"
  #   Then the HTTP response is a 302 redirect to "/two-factor-challenge"
  #   And "auth.two_factor.remember" is absent from the session

  # ✅ Declarative / business language:

  Scenario: A user with two-factor enabled is challenged after entering valid credentials
    Given a registered user who has enabled two-factor authentication
    When the user signs in with valid credentials
    Then the user is asked for a second authentication factor
    And the user is not yet signed in
