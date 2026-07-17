# Gherkin scenarios — login-and-logout

The signed contract. Every `@s` tag is the traceability key the `implementer` and reviewers use;
each maps to ≥ 1 concrete test. Every acceptance criterion in `spec.md` maps to ≥ 1 scenario here.

```gherkin
Feature: Login and logout
  As a user of AI Study Buddy, I want to log in and log out securely with
  email and password so that my documents and lessons stay private to me and
  are available whenever I return.

  Background:
    Given the app is configured with Supabase Auth email/password

  @s1
  Scenario: Unauthenticated user is routed to login on startup
    Given I am not authenticated
    When the app starts
    Then I see the login screen
    And I cannot reach any protected screen

  @s2
  Scenario: Successful login with valid credentials
    Given I am on the login screen
    And I enter a valid email and a valid password for an existing account
    When I submit the login form
    Then a session is established
    And I am taken to the home screen
    And I can access protected screens

  @s3
  Scenario: The form shows a loading state while authenticating
    Given I am on the login screen with valid credentials entered
    When I submit the login form
    And the authentication request has not yet resolved
    Then the form shows a loading state
    And the submit control is disabled until the request resolves

  @s4
  Scenario: Logging out with confirmation clears the session and returns to login
    Given I am authenticated
    When I tap "Log Out" and confirm in the dialog
    Then my session is cleared
    And I am returned to the login screen
    And I can no longer access protected screens without re-authenticating

  @s5
  Scenario: Invalid credentials show a generic error and create no session
    Given I am on the login screen
    And I enter an email and password that match no account
    When I submit the login form
    Then I see the error "Invalid email or password"
    And I remain on the login screen
    And no session is created

  @s6
  Scenario: Network failure shows a retryable error
    Given I am on the login screen with valid credentials entered
    And the network is unavailable
    When I submit the login form
    Then I see the error "Network error"
    And I remain on the login screen
    When the connection is restored and I submit again
    Then a session is established
    And I am taken to the home screen

  @s7
  Scenario: Session persists across app restart
    Given I logged in previously
    And I have not logged out
    When I close and reopen the app
    Then I am still authenticated
    And I land on the home screen without re-entering credentials

  @s8
  Scenario: Pristine form disables submission and shows no error
    Given I am on the login screen
    And I have not entered any credentials
    Then the submit control is disabled
    And no error is shown

  @s9
  Scenario: Malformed email or empty password is rejected inline
    Given I am on the login screen
    When I enter a malformed email address or leave the password empty
    And I attempt to submit the login form
    Then I see an inline validation message on the invalid field
    And the login form is not submitted

  @s10
  Scenario: Logout confirmation dialog can be dismissed
    Given I am authenticated
    When I tap "Log Out" and dismiss the confirmation dialog
    Then my session remains active
    And I remain on the current screen

  @s11
  Scenario: Logging out from the Home screen with confirmation
    Given I am authenticated and on the home screen
    When I tap "Log Out" and confirm in the dialog
    Then my session is cleared
    And I am returned to the login screen
    And I can no longer access protected screens without re-authenticating

  @s12
  Scenario: The login form is accessible
    Given I am on the login screen
    Then the email and password fields expose accessible labels
    And the submit control exposes a button role
    And an authentication error is announced to assistive technology

  @s13
  Scenario: All user-facing strings are localized
    Given the app locale is set to a supported language
    When I view the login form
    Then all labels, placeholders, button text, and error messages are rendered from the active locale bundle
    And no user-facing string is hardcoded
```

## AC → scenario coverage

| AC | Scenario(s) |
|---|---|
| AC1 (routed to login when unauthenticated) | @s1 |
| AC2 (successful login → home) | @s2 |
| AC3 (loading state) | @s3 |
| AC4 (logout with confirmation) | @s4, @s10 |
| AC5 (invalid credentials) | @s5 |
| AC6 (network error + retry) | @s6 |
| AC7 (session persists) | @s7 |
| AC8 (pristine/empty state) | @s8 |
| AC9 (email + password validation) | @s9 |
| AC10 (logout confirm behavior) | @s10 |
| AC11 (logout on Home) | @s11 |
| AC12 (accessibility) | @s12 |
| AC13 (i18n) | @s13 |

## Scenario → primary test kind (how the implementer consumes it)

| Scenario | Primary test |
|---|---|
| @s1, @s7 | Integration (app routing driven by `useSession`) + `use-session`/`use-auth` unit tests |
| @s2 | `auth.dao.test.ts` + `auth.service.test.ts` + `use-auth.test.ts` + integration (hook→service→DAO, mocked Supabase) |
| @s3 | `login-form.test.tsx` (loading render) + `use-auth.test.ts` (isSubmitting) |
| @s4, @s10, @s11 | `sign-out.test.tsx` (confirm dialog) + `auth.dao.test.ts`/`auth.service.test.ts` (signOut) + `use-auth.test.ts` + integration (session cleared → redirect) |
| @s5, @s6 | `auth.service.test.ts` (error normalization) + `login-form.test.tsx` (error banner + retry) + Playwright e2e |
| @s8 | `login-form.test.tsx` (pristine → submit disabled) |
| @s9 | `auth.service.test.ts` (email/password validators) + `login-form.test.tsx` (inline messages) |
| @s12 | `login-form.test.tsx` (roles/labels/error announcement) + Playwright e2e |
| @s13 | `login-form.test.tsx` (strings from `t()`) + localization coverage test (en/es/pt/de) |
