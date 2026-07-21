# Pest Conventions

For how to create a test file (`php artisan make:test --pest`) and basic `test()`/`it()`/`expect()` syntax, see [`.claude/skills/pest-testing/SKILL.md`](../../../.claude/skills/pest-testing/SKILL.md). This file covers this codebase's naming and structure conventions on top of that.

## `test()` vs. `it()`

Every existing test in this repo uses `test('description', ...)`, not `it('should...', ...)` — see [`tests/Feature/DashboardTest.php`](../../../tests/Feature/DashboardTest.php) and [`tests/Unit/ExampleTest.php`](../../../tests/Unit/ExampleTest.php). Match that: use `test('<behavior in plain English>', function () { ... })` for new tests in this codebase, not `it()`. (If a future file already uses `it()` locally, match that file instead — consistency within a file beats a repo-wide rule.)

```php
// ✅ Matches this repo's convention
test('authenticated users can visit the dashboard', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $this->get(route('dashboard'))->assertOk();
});
```

Write the description as a plain statement of behavior, third person, no "should": `'authenticated users can visit the dashboard'`, not `'should allow authenticated users to visit the dashboard'` or `'test_it_works'`.

## File naming and location

- One test file per class/component under test, suffixed `Test.php`: `DashboardTest.php`, not `dashboard_test.php` or `TestDashboard.php`.
- Location mirrors what's being tested, under `tests/Feature/` or `tests/Unit/` — e.g. a future `Security` Livewire test belongs at `tests/Feature/Settings/SecurityTest.php`, mirroring `app/Livewire/Settings/Security.php`.
- Scaffold with `php artisan make:test --pest <Name>` (or `--unit` for `tests/Unit/`) — never hand-create the file — per the artisan-first workflow in [conventions/base-standards.md](../../conventions/base-standards.md#artisan-first-workflow). Remember the `{name}` argument excludes the suite prefix: `php artisan make:test --pest Settings/SecurityTest` produces `tests/Feature/Settings/SecurityTest.php`.

## Arrange-Act-Assert

Every test body follows Arrange-Act-Assert, in that order, even when brief. Blank-line-separate the sections once a test has more than a couple of lines — it makes the boundary visible at a glance:

```php
test('disables two-factor when confirmation was never completed', function () {
    // Arrange
    $user = User::factory()->withTwoFactor()->create(['two_factor_confirmed_at' => null]);
    $this->actingAs($user);

    // Act
    $response = Livewire::test(Security::class);

    // Assert
    expect($user->fresh()->two_factor_confirmed_at)->toBeNull()
        ->and($user->fresh()->two_factor_secret)->toBeNull();
});
```

Don't interleave extra Act/Assert pairs into one test "for efficiency" — if a test needs a second Act step to check a second behavior, that's usually two tests, not one long one. Exception: a genuine sequence-dependent behavior (e.g. "deleting the same passkey twice returns 404 the second time") *is* the behavior under test — keep that as one test, since splitting it would lose the sequencing.

## `describe()` blocks

Use `describe('ClassOrFeature', function () { ... })` to group related tests only when it reduces repetition (e.g. via a shared `beforeEach()` — see [datasets-and-factories.md](datasets-and-factories.md) and the hooks section in the [Pest skill](../../../.claude/skills/pest-testing/SKILL.md)). Don't add a `describe()` wrapper purely for visual grouping around one or two tests — the file name and test descriptions already provide that.

## Assertions: prefer specific over generic

Per the existing [pest-testing skill](../../../.claude/skills/pest-testing/SKILL.md), use `assertSuccessful()`/`assertNotFound()`/`assertForbidden()` instead of `assertStatus(200)` etc. This carries the same "specific over generic" principle into `expect()`: prefer `expect($user->name)->toBe('Ada Lovelace')` over `expect($user->name)->not->toBeNull()` — the former fails loudly and specifically when wrong; the latter passes for any non-null garbage.
