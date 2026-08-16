# Unit Tests

## What counts as "unit" here

In `tests/Unit/`, with no `RefreshDatabase` applied (see [`tests/Pest.php`](../../../tests/Pest.php) — the trait is bound `->in('Feature', 'Browser')`, and `Unit` is the one suite left out). If your test needs the database, a route, or a Livewire mount, it isn't a unit test in this codebase — put it in `tests/Feature/` instead (see [feature-integration-tests.md](feature-integration-tests.md)).

A unit test targets one class or method, with its collaborators either genuinely absent (pure functions) or trivial enough not to need faking.

## When to use it in this codebase

Good unit-test candidates, concretely:

- **Validation-rule traits** — `App\Concerns\PasswordValidationRules::passwordRules()` / `currentPasswordRules()`, `App\Concerns\ProfileValidationRules`. These return plain arrays with no DB/HTTP involvement.
- **Pure model methods** — `App\Models\User::initials()`. No database row is required; construct a `new User(['name' => '...'])` in memory or use an unsaved factory instance (`User::factory()->make()`, not `->create()` — `make()` doesn't hit the DB).
- **Any future plain PHP service/value object** that doesn't depend on Eloquent persistence or the HTTP kernel.

## Example: testing a validation-rule trait

```php
<?php

use App\Concerns\PasswordValidationRules;
use Illuminate\Validation\Rules\Password;

test('password rules require a string, confirmation, and the default password policy', function () {
    $rules = new class
    {
        use PasswordValidationRules;

        public function rules(): array
        {
            return $this->passwordRules();
        }
    };

    expect($rules->rules())
        ->toContain('required', 'string', 'confirmed')
        ->and(collect($rules->rules())->contains(fn ($rule) => $rule instanceof Password))->toBeTrue();
});
```

## Example: testing a pure model method

```php
<?php

use App\Models\User;

test('initials returns the first and last initial for a multi-word name', function () {
    $user = User::factory()->make(['name' => 'Ada Katherine Lovelace']);

    expect($user->initials())->toBe('AL');
});

test('initials returns a single letter for a one-word name', function () {
    $user = User::factory()->make(['name' => 'Ada']);

    expect($user->initials())->toBe('A');
});
```

Note `User::factory()->make()`, not `->create()` — this builds the model in memory without touching the database, which is what keeps this a `tests/Unit/` test instead of a `tests/Feature/` one.

## When a "unit" test is actually a feature test in disguise

If you find yourself reaching for `RefreshDatabase`, `$this->actingAs()`, `$this->get(route(...))`, or `Livewire::test(...)` inside `tests/Unit/`, stop — that's a feature/integration test, and it belongs in `tests/Feature/` per this repo's `Pest.php` wiring. Don't manually add `uses(RefreshDatabase::class)` inside a `tests/Unit/` file to work around this; move the file.
