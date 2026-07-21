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

## Authorization: today vs. once Policies exist

This app has no `app/Policies/` yet — access control today is entirely route-middleware-based (`auth`, `verified`, `password.confirm`) plus Fortify feature flags. `spatie/laravel-permission` is installed and migrated but **not yet attached** to `App\Models\User` (see [architecture/authorization.md](../../architecture/authorization.md)). Concretely, that means:

- **Today**: authorization tests are the guest/authenticated split shown above, plus asserting a user can't act on another user's resource (e.g. `deletePasskey` for a passkey ID that belongs to someone else should 404/throw, not silently succeed — this is currently *not* covered by any test, which is exactly the kind of silent gap [risk-based-testing.md](../qa/risk-based-testing.md) is meant to catch).
- **Once a Policy is introduced**: test both `Gate::allows()` and `Gate::denies()` paths explicitly, e.g. `$this->actingAs($user)->get(...)->assertForbidden()` for the denied case — don't only test the allowed path because "that's what the feature is for."

## Database assertions

Prefer asserting on returned/fetched model state (`expect($user->fresh()->...)`) or `assertDatabaseHas()`/`assertDatabaseMissing()` over trusting the HTTP response alone. A `302` redirect or `200 OK` proves the request didn't crash — it doesn't prove the database ended up in the right state.

See [database-strategy.md](database-strategy.md) for why `RefreshDatabase` is what makes `$user->passkeys()->find($passkey->id)` a trustworthy assertion here (each test starts from a clean, migrated schema).
