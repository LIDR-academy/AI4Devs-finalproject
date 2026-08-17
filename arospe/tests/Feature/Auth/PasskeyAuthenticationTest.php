<?php

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Laravel\Passkeys\Passkeys;

// Story 0005: a soft-deleted user must not be able to complete passkey
// sign-in either. laravel/passkeys' PasskeyLoginController resolves the
// signing-in user via `$passkey->user` (a BelongsTo relation on the vendor
// Passkey model, pointed at App\Models\User) and hands that straight to
// `$guard->login(...)` -- so whether that relation still resolves a
// soft-deleted owner is exactly the mechanism this story must close.
//
// A full HTTP round trip through POST /passkeys/login would additionally
// require a cryptographically well-formed WebAuthn assertion (CBOR-encoded
// authenticatorData, a real challenge/signature pair validated by
// web-auth/webauthn-lib) that no fixture exists for anywhere in this repo,
// and laravel/passkeys ships no test helper to fabricate one -- building
// one from scratch is a WebAuthn-ceremony-simulation project in its own
// right, not a proportionate cost for this story. This test instead
// exercises the real relation the controller depends on directly.
test("a soft-deleted user's passkey no longer resolves an owner, closing the relation PasskeyLoginController::store() uses to sign them in", function () {
    $user = User::factory()->create();

    $passkey = $user->passkeys()->create([
        'name' => 'YubiKey',
        'credential_id' => Str::random(40),
        'credential' => '{}',
    ]);

    $user->delete();

    expect($passkey->fresh()->user)->toBeNull();
});

// Story 0007: a non-active user must not be able to complete passkey sign-in
// either. Passkey login bypasses Fortify's pipeline entirely -- it never
// reaches Fortify::authenticateUsing() -- so it needs its own enforcement
// point: Laravel\Passkeys\Passkeys::authorizeLoginUsing(), consulted by
// PasskeyLoginController::store() via Passkeys::allowsLogin() before it ever
// calls $guard->login(). As with the soft-delete test above, a full WebAuthn
// ceremony is not practical to fabricate here, so this asserts against the
// registered authorization callback directly rather than a fake assertion
// payload through POST /passkeys/login.
test('a suspended user cannot sign in with a passkey', function () {
    $user = User::factory()->suspended()->create();

    $passkey = $user->passkeys()->create([
        'name' => 'YubiKey',
        'credential_id' => Str::random(40),
        'credential' => '{}',
    ]);

    $request = Request::create('/passkeys/login', 'POST');

    expect(Passkeys::allowsLogin($request, $passkey))->toBeFalse();
});

// Phase 4 security audit (F2, story 0007): Passkeys::allowsLogin() calls the
// registered authorizeLoginUsing() callback with $passkey->user unchanged --
// and, per the soft-delete test above, that relation resolves null for a
// trashed owner (SoftDeletingScope). Before this fix, the callback's User
// parameter was non-nullable, so this scenario threw a TypeError instead of
// cleanly refusing the login.
test('a soft-deleted user cannot sign in with a passkey, and the attempt is refused cleanly rather than throwing', function () {
    $user = User::factory()->create();

    $passkey = $user->passkeys()->create([
        'name' => 'YubiKey',
        'credential_id' => Str::random(40),
        'credential' => '{}',
    ]);

    $user->delete();

    $request = Request::create('/passkeys/login', 'POST');

    expect(Passkeys::allowsLogin($request, $passkey->fresh()))->toBeFalse();
});
