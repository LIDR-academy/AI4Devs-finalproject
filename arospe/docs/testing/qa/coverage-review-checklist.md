# Coverage Review Checklist (for PR reviewers)

Run through this when reviewing a PR's tests — as a reviewer, not the author. The goal is catching gaps the author's own perspective made invisible, not re-deriving [risk-based-testing.md](risk-based-testing.md) from scratch for every PR.

## Before approving

- [ ] **Does the test fail if I revert the fix?** If the PR fixes a bug, mentally (or actually) undo the production-code change and confirm the new test would go red. If you can't tell, ask the author to demonstrate it (`git stash` the fix, run the test, `git stash pop`).
- [ ] **Does it cover the critical business rule the PR touches** — not just the code path? A test that hits every line of `CreateNewUser::create()` but never asserts on the *validation rule* that motivated the change isn't coverage of the rule.
- [ ] **Are there silent gaps?** Walk the diff's `if`/`match`/`->when()` branches. For each one, is there a test that takes the other branch? A PR that adds an `if ($user->hasEnabledTwoFactorAuthentication())` branch needs a test for both true and false, not just the one the author was focused on.
- [ ] **Authorization**: if the change touches a route, Livewire component, or Action reachable by more than one type of user, is there a test for the unauthorized/unauthenticated case? (See [risk-based-testing.md #4](risk-based-testing.md).)
- [ ] **Are assertions specific?** Reject `assertOk()` alone where the PR is about *what* the response contains, not just that it succeeded. Prefer `assertSee(...)`, `assertJson([...])`, or a DB assertion over a bare status check when the behavior under test is the content/state, not just reachability.
- [ ] **Is the test named after behavior?** `it('handles two factor')` doesn't tell you what would make it fail; `it('disables two-factor when confirmation was never completed')` does. Push back on vague names per [backend/pest-conventions.md](../backend/pest-conventions.md).
- [ ] **Determinism**: no bare `now()`/`Carbon::now()` comparisons without `Carbon::setTestNow()`, no test that depends on array/DB ordering the schema doesn't guarantee, no hidden dependency on another test having run first.
- [ ] **Is 80%+ coverage being chased with meaningless tests?** If a diff adds coverage-inflating tests (e.g. testing a getter, or re-testing framework behavior) to clear a CI threshold, that's a finding to raise, not a pass — see [what-not-to-test.md](what-not-to-test.md) and [ci/pipeline-integration.md](../ci/pipeline-integration.md) on why 80% is a floor, not a target.

## Red flags that should block approval

- A new `if`/branch in production code with no corresponding test for at least one of its outcomes.
- A test whose only assertion is "no exception was thrown" (`expect(fn () => ...)->not->toThrow(...)`) where a real return-value or state assertion is possible.
- Mocking the very thing the PR is supposed to prove works (see [philosophy.md](../philosophy.md#2-tests-that-mock-everything-and-verify-nothing-real)).
- A test that duplicates an existing one almost verbatim instead of extending it with `->with()` (see [backend/datasets-and-factories.md](../backend/datasets-and-factories.md)).

## What "approve" means here

Approving a PR's tests means: *if this logic breaks in the future, in the way this PR just changed it, CI will turn red.* If you can't say that with confidence after this checklist, ask for more tests before approving — don't approve on the assumption that coverage percentage alone proves it.
