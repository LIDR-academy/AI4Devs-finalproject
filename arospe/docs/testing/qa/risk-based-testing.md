# Risk-Based Testing Checklist

Before writing a test — or reviewing someone else's — reason like a tester trying to break the feature, not like the implementer who just made it work. Framework-agnostic; applies whether you're testing a Livewire component, an Action class, or a validation rule.

Work through these questions for every non-trivial piece of behavior. Not every question applies to every feature — but you should be able to say *why* a question doesn't apply, not just skip it silently.

## The checklist

**1. What can fail here?**
List the ways this code path can go wrong before writing the happy-path test. For `App\Actions\Fortify\CreateNewUser::create()`: invalid email format, weak password, mismatched confirmation, duplicate email — each is a separate test, not a footnote on the happy-path one.

**2. What happens with empty, null, negative, duplicated, or maximum-boundary input?**
- Empty: what if `name` is `''` vs. not present in the array at all?
- Null: does a nullable column (e.g. `two_factor_confirmed_at` on `User`) behave correctly both when null and when set?
- Duplicated: registering with an email that already exists — does `profileRules()` actually catch it? (Check [`App\Concerns\ProfileValidationRules`](../../../app/Concerns).)
- Maximum boundary: does the `name` field enforce a max length, and what happens exactly at that length vs. one character over?

**3. What happens if this runs twice, out of order, or concurrently?**
- Deleting the same passkey twice (`Security::deletePasskey()`) — does the second call throw, no-op, or corrupt state?
- Two requests racing to verify the same email — does `email_verified_at` end up in a consistent state?
- If a test passes only when run after another specific test, it's not actually isolated — see [DoD checklist](../README.md) and the run commands in [ci/commands.md](../ci/commands.md). (Order-randomised runs are the way to surface this; note that [ci/commands.md](../ci/commands.md) does not document a `--random` recipe today, so reach for Pest's ordering flags directly.)

**4. What happens if the user doesn't have permission / the resource doesn't exist?**
This codebase gates access via route middleware (`auth`, `verified`, `password.confirm` on the settings screens; `can:users.view` on `users.index` — see [`routes/settings.php`](../../../routes/settings.php), [`routes/users.php`](../../../routes/users.php) and [architecture/authorization.md](../../architecture/authorization.md)), **and** via seeded permissions plus policies (`app/Policies/UserPolicy.php`). So a "no permission" test is now the guest-redirect case of `DashboardTest` *and* a signed-in user lacking the permission getting a 403, asserted at both the route and the Livewire-action layer; "resource doesn't exist" looks like calling `deletePasskey()` (or `openEditModal()` with an unknown UUID) and asserting a 404/`ModelNotFoundException`, not silent success.

Ask specifically: **is the deny path reachable by a route the allow-path test never touches?** A Livewire action arrives at `/livewire/update` without re-running most route middleware, so a screen can be locked at the route and wide open per action.

Since task 0015a there is a **fourth** thing that can deny, and it is not a permission: the Users screen's five privileged writes also require a password confirmed within `config('auth.password_timeout')` (see [architecture/authorization.md](../../architecture/authorization.md#step-up-authentication--the-third-layer)). Two questions it adds to this checklist. **"Does this test's actor have a fresh confirmation, and did I mean them to?"** — a pre-existing test that changes a role, status or email, deletes a user, or creates an Administrator-tier user now fails without `session(['auth.password_confirmed_at' => now()->unix()])`, and seeding it is the *correct* fix only where the test was never about step-up. And **"which refusal do I actually want here?"** — when an actor lacks the ability *and* has a stale confirmation, the permission refusal must win; a test that asserts only "it was refused" cannot tell the two apart and will pass against an inverted ordering.

**5. What external dependency could fail (network, queue, third-party API), and how should the system behave?**
This app currently has no outbound HTTP/third-party API calls and `QUEUE_CONNECTION=sync` in tests (see [`phpunit.xml`](../../../phpunit.xml)) — so today this mostly applies to `Mail`/`Notification` (e.g. password-reset, two-factor recovery-code emails). Ask: if `Notification::fake()` weren't there and the mailer actually failed, would the user-facing action (e.g. password reset) still complete, or does it silently swallow the failure? See [backend/mocking-and-fakes.md](../backend/mocking-and-fakes.md).

**6. Is there a business rule here that, if silently broken, would NOT be caught by any existing test?**
This is the one to actively hunt for, not wait to stumble on. Walk the feature's rules one by one and ask "which test fails if I delete this `if`?" For example: `Security::mount()` disables two-factor when `Fortify::confirmsTwoFactorAuthentication()` is true but `two_factor_confirmed_at` is null — is there a test that fails if that safety check is removed?

**7. If I revert this fix on purpose, does at least one test turn red?**
The single highest-signal check. Before closing out a bug fix, `git stash` the fix (keep the test), run the suite, confirm it fails; then restore the fix and confirm it passes. If the test stays green either way, it isn't testing the fix.

## Using this as a reviewer

This checklist doubles as a review tool independent of the code: read the PR description, and for each risk category above, ask "is there a test for this?" without looking at the diff first. Then check the diff. A mismatch between what you expected and what's actually tested is the gap to raise. For the PR-approval-specific version of this, see [coverage-review-checklist.md](coverage-review-checklist.md).

_Last updated: 2026-08-24 — Task 0015a (step-up authentication for privileged Users actions): question 4 gained the fourth thing that can deny, which is not a permission — and the two questions it adds that no existing entry on this page covers: whether a test's actor has a fresh confirmation *and whether that was intended* (seeding the session key is the correct fix only where the test was never about step-up), and which of two simultaneous refusals is actually wanted (a test asserting only "it was refused" passes against an inverted ordering). Nothing else on this page changed._

_Previously: 2026-08-20 — Task 0040: question 4's route-file citation for `can:users.view` on `users.index` now points at `routes/users.php`, which the route moved into. The gating itself is unchanged, so the test cases the question asks for are too._

_Previously: 2026-08-13 — Task 0004: corrected question 4, which still described this codebase as gating "not yet via Policies/Gates" with `spatie/laravel-permission` "not attached to `User`" — both false since tasks 0002 and 0004 — and added the deny-path-reachability question a Livewire screen makes necessary._
