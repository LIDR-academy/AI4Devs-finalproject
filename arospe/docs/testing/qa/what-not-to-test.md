# What Not to Test

Not writing a test for something is a decision, not an omission — and it should be justifiable the same way a test itself should be: "if this breaks, would anything else catch it, and does it matter if it doesn't?"

## Reasonable to skip

### Trivial getters / pure delegation
A property accessor or a one-line method that just returns a constructor-injected value with no logic doesn't need its own test — it's covered as a side effect of any test that exercises the object at all, and it can't fail independently of the framework itself.

### Framework-generated / vendor code
Don't write tests for Fortify's own registration flow, Livewire's reactivity, or `spatie/laravel-permission`'s pivot-table behavior — that's the framework/package's job to have tested, and this project already pins versions via `composer.json` rather than vendoring the code. Test *this app's* usage of it (e.g. `App\Actions\Fortify\CreateNewUser`, which this repo owns), not the package internals.

### Static config values
`config/fortify.php`, `config/permission.php` and friends are declarative data, not logic. A test that asserts `config('fortify.features')` equals a hardcoded array duplicates the config file without verifying any behavior — if you need to lock in that a feature is enabled, assert the *effect* (e.g. the route/UI it gates) instead, which also catches the config being right but the code ignoring it.

### Migration `up()`/`down()` mechanics
Don't write a Pest test that runs a migration and asserts the table exists — `RefreshDatabase` running before every `Feature` test already proves every migration in `database/migrations/` runs cleanly, on every test run. See [database/migrations.md](../../database/migrations.md) for the real convention (symmetric `down()`, etc.), which is a code-review concern, not a test-suite one.

### `App\Models\User::initials()`-style pure formatting helpers, once
A pure string-formatting helper like `initials()` is worth *one* test with a couple of representative names (single name, multi-word name) — not an exhaustive matrix of every possible name shape. Push further only if a real bug was found in a boundary case; don't speculatively test every Unicode edge case for a display-only helper unless this app's users are known to hit that boundary.

## Not reasonable to skip — always test

- **Business rules and validations** — anything in `App\Concerns\*ValidationRules` or an Action's `Validator::make()` call. This is exactly the kind of rule that breaks silently if untested (see [risk-based-testing.md #6](risk-based-testing.md)).
- **Authorization** — all four of its layers: route middleware (`auth`, `verified`, `password.confirm`, `can:`), permissions (`spatie/laravel-permission`, seeded and in use), policies (`app/Policies/`), and — since task 0015a — **step-up authentication** (`App\Actions\Auth\EnsureRecentPasswordConfirmation`, an in-method password-freshness guard on five Users writes). Every policy ability needs **both an allow and a deny test**, and for a Livewire screen the component's own `Gate::authorize()` calls need their own tests — route-level tests never exercise them. The step-up layer needs its **exempt** cases tested as deliberately as its refusals: an over-block is the failure mode there, and no `Gate` test can detect it. See [architecture/authorization.md](../../architecture/authorization.md) and [backend/feature-integration-tests.md](../backend/feature-integration-tests.md#authorization-tests).
- **Edge cases identified via [risk-based-testing.md](risk-based-testing.md)** — empty/null/boundary/duplicate input, concurrent/repeated actions.
- **Error and exception handling** — e.g. what `CreateNewUser::create()` does when validation fails (`ValidationException`), not just what it does when it succeeds.

## The rule of thumb

Skipping a test should save real effort without giving up a real safety net. If you're skipping a test *because* it would push coverage over an arbitrary threshold rather than because the code genuinely can't fail in a meaningful way, that's chasing a number, not writing tests — see [philosophy.md](../philosophy.md) and [ci/pipeline-integration.md](../ci/pipeline-integration.md) on treating 80% as a floor.

_Last updated: 2026-08-24 — Task 0015a (step-up authentication for privileged Users actions): the Authorization bullet said "all three of its layers" and is now four — step-up is neither an ability nor a policy, so nothing already on this page implied it. Added the note that its **exempt** cases must be tested as deliberately as its refusals, since an over-block is the failure mode there and no `Gate` test can detect one. Nothing else on this page changed._

_Previously: 2026-08-13 — Task 0004: corrected the Authorization bullet, which still said `spatie/laravel-permission` was "not yet wired to `User`" (false since task 0002) and treated policies as hypothetical; it now names the three real layers and the Livewire-action tests route-level tests never reach._
