# Datasets and Factories

## Datasets: parameterize instead of duplicating

When two or more tests differ only in their input and expected output, that's a Pest dataset, not copy-pasted `test()` blocks. Basic `->with()` syntax is covered in [`.claude/skills/pest-testing/SKILL.md`](../../../.claude/skills/pest-testing/SKILL.md) — this section covers when and how to apply it in this codebase.

❌ Bad — three near-identical tests, one changed line each:

```php
test('rejects an empty name', function () {
    expect(fn () => (new CreateNewUser)->create(['name' => '', 'email' => 'a@example.com', 'password' => 'secret1234', 'password_confirmation' => 'secret1234']))
        ->toThrow(ValidationException::class);
});

test('rejects an invalid email', function () {
    expect(fn () => (new CreateNewUser)->create(['name' => 'Ada', 'email' => 'not-an-email', 'password' => 'secret1234', 'password_confirmation' => 'secret1234']))
        ->toThrow(ValidationException::class);
});

test('rejects a mismatched password confirmation', function () {
    expect(fn () => (new CreateNewUser)->create(['name' => 'Ada', 'email' => 'a@example.com', 'password' => 'secret1234', 'password_confirmation' => 'different']))
        ->toThrow(ValidationException::class);
});
```

✅ Good — one test, one dataset, and adding a fourth invalid case is a one-line diff instead of a new `test()` block:

```php
test('rejects registration with invalid input', function (array $overrides) {
    expect(fn () => (new CreateNewUser)->create([
        'name' => 'Ada',
        'email' => 'a@example.com',
        'password' => 'secret1234',
        'password_confirmation' => 'secret1234',
        ...$overrides,
    ]))->toThrow(ValidationException::class);
})->with([
    'empty name' => [['name' => '']],
    'invalid email' => [['email' => 'not-an-email']],
    'mismatched confirmation' => [['password_confirmation' => 'different']],
]);
```

Named dataset keys (`'empty name' => ...`) matter: they show up in test output and CI failures, so `php artisan test --filter="rejects registration with invalid input with data set \"empty name\""` (or a `--compact` failure line) tells you exactly which case broke, not just "test 2 of 3."

## When *not* to use a dataset

If the test bodies would need different assertions per case (not just different inputs/expected values), a dataset is the wrong tool — it forces awkward `if` branching inside the closure. Write separate tests instead; a dataset should keep the test body identical across all its cases.

## Factories

`User::factory()` ([`database/factories/UserFactory.php`](../../../database/factories/UserFactory.php)) is the only factory in this codebase today. Use its documented states instead of hand-building attribute arrays:

```php
// Unverified email
$user = User::factory()->unverified()->create();

// Two-factor already configured and confirmed
$user = User::factory()->withTwoFactor()->create();

// In-memory only, no DB row — for tests/Unit/ (see unit-tests.md)
$user = User::factory()->make(['name' => 'Ada Lovelace']);
```

Note the factory reuses one hashed `password` across every created user (`static::$password ??= Hash::make('password')`) for speed — if your test needs to assert against the *plaintext* password, it's `'password'`, not a random string; don't assume the plaintext is derivable from the hash.

When a new model needs its own state variant (e.g. a future `expired()` state), add it to that model's factory rather than constructing the raw attribute array inline at each test call site — same reasoning as the shared validation traits in [conventions/code-style.md](../../conventions/code-style.md#centralize-shared-validation-in-traits): one definition, not N call sites to keep in sync.

## Seeders

[`database/seeders/DatabaseSeeder.php`](../../../database/seeders/DatabaseSeeder.php) does two different things, and only one of them is fixture data:

- A single fixed `test@example.com` user, created **only** when `app()->environment(['local', 'testing'])` — local/dev seeding (`php artisan migrate:fresh --seed`), not feature-test input.
- `$this->call(RolePermissionSeeder::class)`, unconditionally in every environment — the roles and 42-permission catalog the app authorizes against (see [architecture/authorization.md](../../architecture/authorization.md#seeding)).

Don't rely on either inside a test by default; `RefreshDatabase` gives each test a clean, unseeded schema (see [database-strategy.md](database-strategy.md)), and a test that implicitly depends on the seeder having run is a hidden coupling that breaks the moment someone runs a single test file in isolation. Create exactly the data a given test needs, via factories, inside that test (or its `beforeEach()`).

The one legitimate exception is a test **about** authorization: a permission check against an unseeded name throws `PermissionDoesNotExist`, so such a test must seed the catalog explicitly (`$this->seed(RolePermissionSeeder::class)`) rather than fabricate ad-hoc `Role`/`Permission` rows — see `tests/Feature/Authorization/`. When it does, flush the permission cache in `beforeEach()` with `app(PermissionRegistrar::class)->forgetCachedPermissions()`, or role/permission lookups leak across tests through the shared cache store.

_Last updated: 2026-08-10 — Task 0002: `DatabaseSeeder` now environment-gates the `test@example.com` fixture and unconditionally calls `RolePermissionSeeder`; documented the one legitimate case for seeding inside a test (authorization tests) and the required permission-cache flush._
