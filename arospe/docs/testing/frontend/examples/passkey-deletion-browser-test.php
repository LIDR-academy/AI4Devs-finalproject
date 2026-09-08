<?php

/*
 * Hand translation of examples/passkey-deletion.feature into a Pest 4 browser test.
 *
 * SKELETON — worked example under docs/, not in tests/Browser/. The suite is wired up
 * (see ../playwright-setup.md), so this it() block can be moved into
 * tests/Browser/Settings/PasskeyTest.php and will run as-is. It stays here as
 * documentation; nothing under docs/ is executed by the test runner.
 *
 * Given/When/Then -> it() mapping: ../gherkin-guidelines.md.
 * Grounded in: app/Livewire/Settings/Security.php::deletePasskey(),
 * resources/views/livewire/settings/security.blade.php (real "Remove passkey" / "No passkeys yet" text),
 * route security.edit (needs auth + verified + a confirmed password in the session).
 *
 * NOTE ON SEEDING THE PRECONDITION:
 * There is no Passkey factory in this repo (database/factories/ has only UserFactory), and the
 * `passkeys.credential` column stores a full WebAuthn credential payload. So the Given below
 * cannot use `Passkey::factory()`.
 * TODO: confirm the exact way to seed a passkey row for tests — either add a Passkey factory
 * (an app-code change, needs approval) or build a minimal valid `credential` payload for
 * $user->passkeys()->create([...]). The array below is a placeholder shape, NOT verified to
 * satisfy laravel/passkeys' credential validation.
 */

use App\Models\User;
use Laravel\Fortify\Features;

beforeEach(function () {
    $this->skipUnlessFortifyHas(Features::twoFactorAuthentication());

    Features::passkeys([
        'confirmPassword' => true,
    ]);
});

// Scenario: A user removes one of their registered passkeys
it('removes a registered passkey and shows the empty state', function () {
    // Given a signed-in user who has a registered passkey.
    // security.edit is gated by password.confirm, so seed a confirmed password in the session
    // instead of driving the confirm-password screen through the browser.
    $user = User::factory()->create();

    // TODO: replace with a verified seeding approach (see file header note).
    $user->passkeys()->create([
        'name' => 'My laptop',
        'credential_id' => 'placeholder-credential-id',
        'credential' => [/* TODO: minimal valid WebAuthn credential payload */],
    ]);

    $this->actingAs($user)->withSession(['auth.password_confirmed_at' => time()]);

    // When the user removes that passkey (open the confirm modal, then confirm).
    // Then the passkey is no longer listed, and the empty state is shown.
    visit('/settings/security')
        ->assertNoJavaScriptErrors()
        ->assertSee('My laptop')
        ->click('Remove passkey')          // opens the "Remove passkey" confirmation modal
        ->click('Remove passkey')          // confirms deletion inside the modal
        ->assertDontSee('My laptop')
        ->assertSee('No passkeys yet');
});
