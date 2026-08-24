# Gherkin Scenario Guidelines

How to write BDD scenarios (Feature + Scenarios) for this app. In this repo a `.feature` file is a **specification artifact**, not something a Cucumber/`playwright-bdd` engine runs — see the [tooling decision](README.md#tooling-decision-read-this-first). A well-written scenario is valuable precisely because a human or LLM translates it faithfully into a Pest browser test; a sloppy scenario translates into a sloppy test.

Every rule below is grounded in this app's **real, existing flows** (login, registration, two-factor authentication, passkeys, profile/appearance/security settings — see [../../architecture/authentication.md](../../architecture/authentication.md) and [../../api/routes.md](../../api/routes.md)). There is no product/order/checkout domain in the code yet, so no example invents one.

## Table of Contents

- [The seven rules](#the-seven-rules)
  1. [Imperative vs. declarative scenarios](#1-imperative-vs-declarative-scenarios)
  2. [No overly technical details](#2-no-overly-technical-details)
  3. [Single When per scenario](#3-single-when-per-scenario)
  4. [Scenario Outline vs. duplicated scenarios](#4-scenario-outline-vs-duplicated-scenarios)
  5. [Consistent language / shared glossary](#5-consistent-language--shared-domain-glossary)
  6. [No ghost scenarios](#6-no-ghost-scenarios)
  7. [No loss of ubiquitous language](#7-no-loss-of-ubiquitous-language)
- [Domain glossary](#domain-glossary)
- [Given/When/Then → Pest it() translation convention](#givenwhenthen--pest-it-translation-convention)

## The seven rules

### 1. Imperative vs. declarative scenarios

Write scenarios in **business language** describing intent and outcome, not the mechanical UI steps to get there. Declarative scenarios survive UI redesigns; imperative ones break when a button moves.

❌ Imperative — narrates clicks and fields:

```gherkin
Scenario: Log in
  Given I open the "/login" page
  When I type "ada@example.com" into the email field
  And I type "password" into the password field
  And I click the "Log in" button
  Then I see the "/dashboard" page
```

✅ Declarative — states intent and observable outcome:

```gherkin
Scenario: A registered user signs in with valid credentials
  Given a registered user
  When the user signs in with valid credentials
  Then the user reaches their dashboard
```

### 2. No overly technical details

Keep DOM IDs, CSS classes, JSON payloads, HTTP status codes, and database column names out of scenarios. Those are implementation details that belong in the Pest translation, not the specification.

❌ Technical leakage:

```gherkin
Scenario: Reject bad login
  When the user POSTs to /login.store with an invalid password
  Then the response has a session error on the "email" key
  And "two_factor_confirmed_at" stays NULL
```

✅ Business-level:

```gherkin
Scenario: Sign-in is refused with a wrong password
  Given a registered user
  When the user tries to sign in with an incorrect password
  Then the user is told the credentials are invalid
  And the user remains signed out
```

(The mapping "session error on email" → `assertSee('...')` / "remains signed out" → `assertGuest()` happens in the [translation](#givenwhenthen--pest-it-translation-convention), invisibly to the scenario.)

### 3. Single When per scenario

Each scenario tests **one** action. If you need two `When` steps, you almost certainly have two scenarios, or the first `When` is really a `Given` precondition.

❌ Two actions in one scenario:

```gherkin
Scenario: Enable and then confirm two-factor authentication
  Given a signed-in user on the security settings page
  When the user enables two-factor authentication
  And the user confirms it with a valid authentication code
  Then two-factor authentication is active
```

✅ Split — the first action becomes the precondition of the second:

```gherkin
Scenario: User confirms a freshly enabled two-factor setup
  Given a signed-in user who has just enabled two-factor authentication
  When the user confirms it with a valid authentication code
  Then two-factor authentication is active on the account
```

### 4. Scenario Outline vs. duplicated scenarios

When several cases share the same structure and differ only by input, use a `Scenario Outline` with `Examples`. Don't copy-paste a scenario per input, and don't over-specify each case.

❌ Duplicated, over-specified:

```gherkin
Scenario: Registration fails with empty name
  Given a visitor on the registration page
  When the visitor registers with a blank name
  Then registration is refused

Scenario: Registration fails with invalid email
  Given a visitor on the registration page
  When the visitor registers with a malformed email address
  Then registration is refused

Scenario: Registration fails with a weak password
  Given a visitor on the registration page
  When the visitor registers with a password that is too weak
  Then registration is refused
```

✅ One outline over the shared structure:

```gherkin
Scenario Outline: Registration is refused with invalid details
  Given a visitor on the registration page
  When the visitor registers with <invalid_detail>
  Then registration is refused and the reason is shown

  Examples:
    | invalid_detail                    |
    | a blank name                      |
    | a malformed email address         |
    | a password that is too weak       |
    | an email that is already taken    |
```

### 5. Consistent language / shared domain glossary

Use the same term for the same concept across every feature file. If one scenario says "sign in" and another says "log in" for the same action, or "passkey" vs. "security key" for the same thing, readers and translators lose the thread. Pick the canonical term from the [domain glossary](#domain-glossary) and stick to it.

❌ Inconsistent within the same suite:

```gherkin
# feature A
When the member logs into the platform
# feature B
When the user signs in to their account
```

✅ One canonical verb everywhere (glossary says "sign in"):

```gherkin
# feature A
When the user signs in
# feature B
When the user signs in
```

### 6. No ghost scenarios

Every precondition and scenario must trace back to a **real user story or business conversation**. Never invent a precondition for narrative convenience or to make a scenario "feel complete". If the user story doesn't mention a state, don't assume it exists.

❌ Ghost precondition — nothing in the login story establishes a trial/subscription concept, and this app has no such thing:

```gherkin
Scenario: Sign in with an active subscription
  Given a registered user with an active premium subscription
  When the user signs in with valid credentials
  Then the user reaches their premium dashboard
```

✅ Grounded only in what exists (a `User`, credentials, the dashboard):

```gherkin
Scenario: A registered user signs in with valid credentials
  Given a registered user
  When the user signs in with valid credentials
  Then the user reaches their dashboard
```

If a scenario seems to need a concept the code doesn't have, that's a signal to ask the product owner — not to invent it. Mark it `TODO` with a concrete question, per the [Uncertainty Handling Rule](../../contracts.md).

### 7. No loss of ubiquitous language

Don't replace an established domain term with a generic synonym. This app's users and code speak of **passkeys**, **recovery codes**, and **two-factor authentication**; flattening those into "login token", "backup password", or "extra security step" erodes the shared vocabulary and makes scenarios ambiguous.

❌ Generic synonyms that blur meaning:

```gherkin
Scenario: Remove a login token
  Given a user who has a saved login token
  When the user deletes that token
  Then the token can no longer be used to log in
```

✅ Uses the real domain terms:

```gherkin
Scenario: Remove a passkey
  Given a signed-in user who has a registered passkey
  When the user removes that passkey
  Then the passkey can no longer be used to sign in
```

## Domain glossary

Canonical terms for what exists in the code **today**, derived from [`app/Models/User.php`](../../../app/Models/User.php), [../../database/schema.md](../../database/schema.md), and [../../architecture/authentication.md](../../architecture/authentication.md). Use these exact terms in scenarios; don't substitute synonyms.

| Term | Definition | Where it lives |
| --- | --- | --- |
| **User** | A registered account holder. The only domain model in the app today. | `App\Models\User`, `users` table |
| **Visitor / guest** | An unauthenticated person (not signed in). | route `auth` middleware, `assertGuest()` |
| **Sign in** | Authenticate with email + password (canonical verb — not "log in", "sign on"). | `login` / `login.store` routes |
| **Sign out** | End the authenticated session. | `logout` route, `App\Livewire\Actions\Logout` |
| **Register** | Create a new user account. | `register` / `register.store` routes |
| **Email verification** | Confirming ownership of the account email via a signed link. | `verification.*` routes, `email_verified_at` |
| **Two-factor authentication (2FA)** | A second sign-in factor via a time-based authentication code. | `two_factor_*` columns, `Security` component |
| **Authentication code** | The 6-digit time-based code entered to confirm/challenge 2FA (not "OTP", "PIN"). | 2FA challenge flow |
| **Recovery code** | A single-use backup code to sign in when the authenticator is unavailable. | `two_factor_recovery_codes`, `RecoveryCodes` component |
| **Passkey** | A WebAuthn credential for passwordless sign-in (not "security key", "login token"). | `passkeys` table, `PasskeyAuthenticatable` |
| **Password confirmation** | Re-entering the current password to re-authorize a sensitive action. | `password.confirm` middleware on `security.edit`; the in-method step-up guard on the Users screen |
| **Step-up authentication** | Requiring a *recently* confirmed password before a privileged action, even though the actor already holds the permission (not "re-login", "2FA"). | `App\Actions\Auth\EnsureRecentPasswordConfirmation`, `auth.password_confirmed_at` |
| **Session** | A server-side authenticated session record. | `sessions` table (`SESSION_DRIVER=database`) |
| **Dashboard** | The authenticated landing page after sign-in. | `dashboard` route |
| **Security settings** | The page to manage password, 2FA, and passkeys. | `security.edit` route, `Security` component |

### TODO — blog / ecommerce vocabulary (undefined)

No blog or ecommerce domain exists in the code yet (`app/Models/` contains only `User`). Do **not** invent terms for it. When that domain is built, this section needs canonical terms decided by the product owner:

> `TODO (product owner): define the canonical vocabulary for the future content/commerce domain. Concretely: (a) for a blog entry, is the term "post" or "article"? (b) for a purchase, what is the canonical term for the whole purchase ("order" vs. "sale") and for a single purchased item within it ("order line" vs. "line item" vs. "order item")? (c) is a buyer a "customer", "client", or "user"? Record the answers as a new row set here and, if the choice is contested, as an ADR in docs/decisions/.`

## Given/When/Then → Pest it() translation convention

Because no BDD engine runs the `.feature` files, each scenario is translated **by hand** into a Pest browser test in `tests/Browser/`. Map the three Gherkin sections onto the three sections of an `it()` body:

| Gherkin | Pest `it()` body section | Typical calls |
| --- | --- | --- |
| **Given** (preconditions) | Arrange | `User::factory()->create()` / `->withTwoFactor()`, `$this->actingAs(...)`, `Notification::fake()`, seeding a passkey |
| **When** (the single action) | Act | `visit('/login')`, `->fill(...)`, `->click('Log in')` — the one user action the scenario names |
| **Then** (outcomes) | Assert | `->assertSee(...)`, `->assertNoJavaScriptErrors()`, `assertGuest()` / `assertAuthenticated()`, DB/state assertions |

Conventions for the translation:

- **Name the `it()` after the scenario**, in behavior-and-condition form: `Scenario: Sign-in is refused with a wrong password` → `it('refuses sign-in with a wrong password')`. Never `it('login test')`.
- **One scenario → one `it()`.** A `Scenario Outline` with `Examples` → one `it()` driven by a Pest **dataset** (`->with([...])`), one dataset row per `Examples` row.
- **Always include `->assertNoJavaScriptErrors()`** in the Assert section (see [test-quality-checklist.md](test-quality-checklist.md)).
- **Set up state via Laravel helpers, not the UI**, whenever the scenario's `Given` is a precondition rather than the behavior under test — e.g. use `actingAs()` + a factory instead of driving the sign-in form when the scenario is about passkey deletion, not sign-in.

See [examples/](examples/) for three complete scenario → Pest translations built on this convention.

_Last updated: 2026-08-24 — Task 0015a (step-up authentication for privileged Users actions): one glossary term added, **Step-up authentication**, with its "not re-login / not 2FA" disambiguation — the story's own Gherkin needed a settled word for "requiring a *recently* confirmed password from an actor who already holds the permission", and the existing **Password confirmation** entry pointed only at `security.edit`'s middleware, which is now one of two places the app requires one. Nothing else on this page changed._

_Previously: 2026-08-21 — Task 0012, Phase 6 link sweep: fixed this file's own table-of-contents anchor for rule 5, which read `#5-consistent-language--shared-glossary` while the heading is "Consistent language / **shared domain** glossary". Content unchanged._

_Previously: 2026-07-19 — New frontend/browser testing guide added by the docs-maintainer skill._
