# Feature / Integration Tests

## What counts as "feature" here

Everything in `tests/Feature/`: HTTP requests through the real router/middleware stack, Livewire component lifecycles, and any Action/class hitting a real (migrated) database — all with `RefreshDatabase` applied automatically (see [`tests/Pest.php`](../../../tests/Pest.php)). This is also where this codebase puts "integration"-shaped tests (an Action class + real DB, no HTTP) since there's no separate `tests/Integration/` directory — see [philosophy.md](../philosophy.md#unit-vs-integration-vs-feature-in-this-codebase).

## HTTP route example

The existing pattern, from [`tests/Feature/DashboardTest.php`](../../../tests/Feature/DashboardTest.php):

```php
<?php

use App\Models\User;

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));

    $response->assertRedirect(route('login'));
});

test('authenticated users can visit the dashboard', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->get(route('dashboard'));

    $response->assertOk();
});
```

Note both the allowed and denied path are tested — not just the happy one. Any route gated by `auth`/`verified`/`password.confirm` middleware (see [api/routes.md](../../api/routes.md)) needs both.

## Livewire component example

For a class-based component like `App\Livewire\Settings\Security` (see [conventions/base-standards.md](../../conventions/base-standards.md#livewire-component-convention-class-based-not-single-file)):

```php
<?php

use App\Livewire\Settings\Security;
use App\Models\User;
use Livewire\Livewire;

test('deleting a passkey removes it and closes the modal', function () {
    $user = User::factory()->create();
    $passkey = $user->passkeys()->create([
        'name' => 'YubiKey',
        'credential_id' => 'test-credential-id',
        'credential' => '{}',
    ]);
    $this->actingAs($user);

    Livewire::test(Security::class)
        ->set('deletingPasskeyId', $passkey->id)
        ->call('deletePasskey')
        ->assertSet('showDeleteModal', false);

    expect($user->passkeys()->find($passkey->id))->toBeNull();
});
```

This asserts on real database state (`passkeys()->find()` returning null) rather than only on the Livewire response — the DB assertion is what actually proves the deletion happened, not just that the method returned without error.

## Authorization tests

Access control in this app comes in three layers, and a test that exercises one proves nothing about the others:

1. **Route middleware** — `auth`, `verified`, `password.confirm` on the settings screens; `can:users.view` on `users.index`.
2. **Roles & permissions** — `spatie/laravel-permission`, with `HasRoles` attached to `App\Models\User` and a seeded 38-permission catalog (see [architecture/authorization.md](../../architecture/authorization.md)).
3. **Policies** — `app/Policies/UserPolicy.php`, auto-discovered and called via `Gate::authorize()` from `App\Livewire\Users\Index`.

Rules that follow from that:

- **Test both the allowed and the denied path.** Never only the allowed one because "that's what the feature is for": `$this->actingAs($user)->get(route('users.index'))->assertForbidden()` for a user without the permission, `assertOk()` for one with it. `tests/Feature/Policies/UserPolicyTest.php` does this per ability with `Gate::forUser($actor)->allows(...)`, and asserts `Gate::forUser($actor)->authorize(...)` still throws `AuthorizationException` — which is what proves a denial is server-side rather than merely hidden in the UI.
- **A `Livewire::test()` authorization test and an HTTP authorization test are not substitutes for each other.** `Livewire::test(Index::class)` mounts the component without ever running route middleware, so it proves the component's own `Gate::authorize()` calls; `$this->get(route('users.index'))` proves the route's `can:` gate. `tests/Feature/Users/IndexTest.php` carries both for that reason — see [security/livewire-authorization.md](../../security/livewire-authorization.md).
- **Re-check authorization inside the action, not only at mount.** A component method reached over `/livewire/update` is a separate entry point; a test that only asserts `mount()` is denied will pass against a component whose `save()` is wide open.
- **Assert a user cannot act on another user's resource.** E.g. `deletePasskey` for a passkey ID belonging to someone else should 404/throw rather than silently succeed — still *not* covered by any test, which is exactly the kind of silent gap [risk-based-testing.md](../qa/risk-based-testing.md) is meant to catch.
- **Flush the permission cache in `beforeEach`, never between Act and Assert.** The `database` cache store leaks across `RefreshDatabase` tests, so a stale cache hides *revocations*; flushing mid-test destroys the test's ability to detect its own bug.

## Database assertions

Prefer asserting on returned/fetched model state (`expect($user->fresh()->...)`) or `assertDatabaseHas()`/`assertDatabaseMissing()` over trusting the HTTP response alone. A `302` redirect or `200 OK` proves the request didn't crash — it doesn't prove the database ended up in the right state.

See [database-strategy.md](database-strategy.md) for why `RefreshDatabase` is what makes `$user->passkeys()->find($passkey->id)` a trustworthy assertion here (each test starts from a clean, migrated schema).

_Last updated: 2026-08-13 — Task 0004: replaced the "Authorization: today vs. once Policies exist" section, which had gone stale on two counts (`app/Policies/` now exists, and `HasRoles` has been attached to `App\Models\User` since task 0002), with the real three-layer picture and the rules that follow — including why a `Livewire::test()` authorization test and an HTTP one are not substitutes for each other._
