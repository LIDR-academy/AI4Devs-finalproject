# Testing Philosophy

## Coverage is not synonymous with quality

A test's job is to verify real behavior: given these inputs, in this state, the system produces this output, causes this side effect, or ends in this state. Executing a line of code is a side effect of a good test, not its goal. A suite can sit at 95% line coverage and still fail to catch a broken business rule, because coverage tools measure *what ran*, not *what was checked*.

The practical test: **if I revert the fix this test was written for, does at least one test turn red?** If not, the test is decoration. See [qa/coverage-review-checklist.md](qa/coverage-review-checklist.md) for how to apply this during review.

## Unit vs. integration vs. feature, in this codebase

Pest doesn't enforce these categories — this repo's own convention does, via `tests/Unit/`, `tests/Feature/` and `tests/Browser/` (wired in [`tests/Pest.php`](../../tests/Pest.php)) plus the three-way `Testsuites` split in [`phpunit.xml`](../../phpunit.xml). Note that `Unit` is the one suite that gets **no** `RefreshDatabase`:

```php
// tests/Pest.php
pest()->extend(TestCase::class)
    ->use(RefreshDatabase::class)
    ->in('Feature', 'Browser');
```

That one line encodes the boundary: if your test needs the database, it belongs in `Feature` (or `Browser`), not `Unit`. Browser tests are covered separately in [frontend/playwright-setup.md](frontend/playwright-setup.md) — the table below is about the backend split.

| Type | What it exercises | Real example in this codebase | Directory |
| --- | --- | --- | --- |
| **Unit** | A single class/method in isolation — no DB, no HTTP, no container resolution beyond what the object needs. Pure logic. | `App\Concerns\PasswordValidationRules::passwordRules()` returning the expected rule array; `App\Models\User::initials()` given various `name` values. | `tests/Unit/` |
| **Integration** | Several collaborators wired together through the framework, still without going through HTTP — e.g. an Action class hitting a real (migrated) database. | `App\Actions\Fortify\CreateNewUser::create()` — validates input via `Validator`, then actually persists a `User` row and asserts on the DB state. | `tests/Feature/` (this repo doesn't have a separate `tests/Integration/` — see below) |
| **Feature** | A full request/response or full Livewire component lifecycle: routing, middleware, authorization, the real database, real views/components. | `tests/Feature/DashboardTest.php` — asserts guests get redirected to `login` and authenticated users get a 200; a Livewire test driving `App\Livewire\Settings\Security::deletePasskey()`. | `tests/Feature/` |

This repo doesn't maintain a third `tests/Integration/` directory — "integration-shaped" tests (Action classes touching a real DB, no HTTP) live in `tests/Feature/` alongside HTTP/Livewire tests, because they share the same `RefreshDatabase` need. Don't invent a new top-level test directory for this distinction; it isn't how this codebase organizes it (see [conventions/base-standards.md](../conventions/base-standards.md) on not creating new base folders without approval).

## Anti-patterns to avoid

### 1. Tests without meaningful assertions

❌ Bad — this test can never fail for the right reason:

```php
it('creates a user', function () {
    $user = User::factory()->create();

    expect($user)->not->toBeNull();
});
```

`User::factory()->create()` throwing would already fail the test before `expect()` runs. The assertion checks nothing this test doesn't already guarantee by construction.

✅ Good — asserts the actual behavior under test:

```php
it('creates a user with the given name and a hashed password', function () {
    $user = User::factory()->create(['name' => 'Ada Lovelace']);

    expect($user->name)->toBe('Ada Lovelace')
        ->and(Hash::check('password', $user->password))->toBeTrue();
});
```

### 2. Tests that mock everything and verify nothing real

❌ Bad — every collaborator is faked, so the test only proves the mocks were called, not that the feature works:

```php
it('registers a user', function () {
    $creator = Mockery::mock(CreatesNewUsers::class);
    $creator->shouldReceive('create')->once()->andReturn(new User);

    expect($creator->create([]))->toBeInstanceOf(User::class);
});
```

This never exercises `App\Actions\Fortify\CreateNewUser`'s real validation or persistence — it tests Mockery, not the app.

✅ Good — exercises the real action, only faking what's genuinely external (see [backend/mocking-and-fakes.md](backend/mocking-and-fakes.md)):

```php
it('rejects registration with a mismatched password confirmation', function () {
    $action = new CreateNewUser;

    $action->create([
        'name' => 'Ada Lovelace',
        'email' => 'ada@example.com',
        'password' => 'correct-horse-battery',
        'password_confirmation' => 'different',
    ]);
})->throws(ValidationException::class);
```

### 3. Tests coupled to implementation instead of behavior

❌ Bad — breaks the moment `Security::mount()` is refactored to compute the flag differently, even though the user-visible behavior didn't change:

```php
it('sets canManageTwoFactor property', function () {
    $component = Livewire::test(Security::class);

    expect($component->get('canManageTwoFactor'))->toBeTrue();
});
```

✅ Good — asserts what the user actually sees:

```php
it('shows the two-factor management section when the feature is enabled', function () {
    Livewire::test(Security::class)
        ->assertSee('Two-Factor Authentication');
});
```

### 4. Duplicated tests

If the same assertion is copy-pasted across multiple `it()` blocks with only one input changed, that's a dataset waiting to happen — see [backend/datasets-and-factories.md](backend/datasets-and-factories.md). Duplicated tests don't add coverage; they add maintenance cost, since every future change to that behavior now needs N synchronized edits instead of one.

### 5. Generic names like `test_it_works`

A test name is the first thing a reviewer (or a future you, staring at a red CI run) reads. `test('it works')` tells them nothing about what broke. Name the test after the behavior and the condition:

❌ `it('works')`
✅ `it('redirects guests to the login page when visiting the dashboard')`

See [backend/pest-conventions.md](backend/pest-conventions.md) for the full naming convention.
