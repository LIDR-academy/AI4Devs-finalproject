<?php

use App\Models\User;
use Illuminate\Support\Str;

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
