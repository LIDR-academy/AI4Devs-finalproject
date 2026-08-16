<?php

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;

// Story 0005: none of this exists yet -- no `deleted_at` column, no SoftDeletes
// trait, no User::delete() override. Every test below is new-behavior coverage
// and is expected to fail until backend-expert implements the migration and the
// model override.

// --- Soft-delete mechanics ---

test('deleting a user sets deleted_at and the row still exists in the database', function () {
    $user = User::factory()->create();

    $user->delete();

    $this->assertDatabaseHas('users', ['id' => $user->id]);
    expect(DB::table('users')->where('id', $user->id)->value('deleted_at'))->not->toBeNull();
});

test('deleted_at is null on a freshly created user', function () {
    $user = User::factory()->create();

    expect($user->deleted_at)->toBeNull();
});

test('a soft-deleted user is excluded from default queries', function () {
    $user = User::factory()->create();
    $user->delete();

    expect(User::find($user->id))->toBeNull()
        ->and(User::all()->pluck('id'))->not->toContain($user->id)
        ->and(User::query()->pluck('id'))->not->toContain($user->id);
});

test('withTrashed find still returns the soft-deleted user, with its deletion timestamp set', function () {
    $user = User::factory()->create();
    $user->delete();

    $found = User::withTrashed()->find($user->id);

    expect($found)->not->toBeNull()
        ->and($found->id)->toBe($user->id)
        ->and($found->deleted_at)->not->toBeNull();
});

test('onlyTrashed returns exactly the deleted set', function () {
    $active = User::factory()->create();
    $deleted = User::factory()->create();
    $deleted->delete();

    $trashedIds = User::onlyTrashed()->pluck('id');

    expect($trashedIds)->toHaveCount(1)
        ->and($trashedIds)->toContain($deleted->id)
        ->and($trashedIds)->not->toContain($active->id);
});

test('deleting a user leaves the name and role assignment unchanged on the retained record', function () {
    $editorRole = Role::create(['name' => 'Editor', 'guard_name' => 'web']);
    $user = User::factory()->create(['name' => 'Diego Ferrer']);
    $user->assignRole($editorRole);

    $user->delete();

    $retained = User::withTrashed()->find($user->id);

    expect($retained->name)->toBe('Diego Ferrer')
        ->and($retained->hasRole('Editor'))->toBeTrue();
});

// --- Email obfuscation and reuse ---

test('deleting a user obfuscates the stored email to the deleted+id@deleted.invalid placeholder and nulls email_verified_at', function () {
    $user = User::factory()->create(['email' => 'diego.ferrer@arospe.es']);
    $id = $user->id;

    $user->delete();

    $retained = User::withTrashed()->find($id);

    // getRawOriginal(), not ->email: story 0003 added a read-only lowercasing
    // accessor on `email`, so the plain property no longer reflects the raw column.
    expect($retained->getRawOriginal('email'))->toBe("deleted+{$id}@deleted.invalid")
        ->and($retained->email_verified_at)->toBeNull();
});

test('deleting a user frees their email address for a new user to reuse immediately', function () {
    $user = User::factory()->create(['email' => 'diego.ferrer@arospe.es']);
    $deletedId = $user->id;
    $user->delete();

    $newUser = User::factory()->create(['email' => 'diego.ferrer@arospe.es']);

    expect($newUser->getRawOriginal('email'))->toBe('diego.ferrer@arospe.es')
        ->and($newUser->id)->not->toBe($deletedId);
});

// --- pending_email is cleared in the same write ---

test('deleting a user with a pending email change nulls pending_email, so the outstanding confirmation link writes nothing and the address is immediately reusable', function () {
    $user = User::factory()->pendingEmail('pending@arospe.es')->create();
    $id = $user->id;

    $url = URL::temporarySignedRoute(
        'email-change.confirm',
        now()->addMinutes(60),
        ['user' => $id, 'hash' => sha1('pending@arospe.es')],
    );

    $user->delete();

    expect(User::withTrashed()->find($id)->pending_email)->toBeNull();

    // Whether the now-stale link 404s (route-model binding excludes a trashed
    // user by default) or is refused by the controller is an implementation
    // detail this test does not pin down -- what matters is that it writes
    // nothing back onto the trashed row.
    $this->get($url);

    expect(User::withTrashed()->find($id)->getRawOriginal('email'))->not->toBe('pending@arospe.es');

    // The unique index no longer reserves the pending address, so a new user
    // can claim it right away.
    $newUser = User::factory()->create(['email' => 'pending@arospe.es']);
    expect($newUser->getRawOriginal('email'))->toBe('pending@arospe.es');
});

// --- Obfuscation is collision-proof ---

test('obfuscation is collision-proof across multiple deletions and a restore-then-redelete cycle', function () {
    $first = User::factory()->create();
    $second = User::factory()->create();

    $first->delete();
    $second->delete();

    // Restore the first user and delete it again: the placeholder must
    // regenerate identically (it is anchored to the immutable id) without a
    // duplicate-key error against the still-deleted second user or itself.
    $first->restore();
    $first->refresh();

    expect(fn () => $first->delete())->not->toThrow(Exception::class);

    expect(User::withTrashed()->find($first->id)->getRawOriginal('email'))
        ->toBe("deleted+{$first->id}@deleted.invalid")
        ->and(User::withTrashed()->find($second->id)->getRawOriginal('email'))
        ->toBe("deleted+{$second->id}@deleted.invalid");
});

// --- Guarding the non-persisted-instance early return ---

test('calling delete on a non-persisted user instance inserts nothing and leaves the users table untouched', function () {
    $countBefore = User::withTrashed()->count();

    $result = (new User)->delete();

    expect($result)->toBeFalse()
        ->and(User::withTrashed()->count())->toBe($countBefore);
});

// --- Deleting a user revokes its stale password_reset_tokens row ---
//
// Story 0005 Phase 4 (appsec-auditor) finding F1: password_reset_tokens is
// keyed by plain email with no FK, so obfuscating the email without deleting
// the token would let a still-valid reset link resolve against whichever new
// user later claims the recycled address (account takeover). Fixed in
// User::delete().

test('deleting a user with an outstanding password reset token deletes that token row', function () {
    $user = User::factory()->create(['email' => 'diego.ferrer@arospe.es']);

    // Drive the fixture through the real producer rather than a hand-written
    // insert(), so the test pins Fortify's actual key format
    // (getEmailForPasswordReset(), via User::email()'s lowercasing accessor)
    // together with the revocation logic -- not just a shape we invented.
    Password::broker()->createToken($user);

    $user->delete();

    $this->assertDatabaseMissing('password_reset_tokens', ['email' => 'diego.ferrer@arospe.es']);
});

test('deleting a user frees the email for reuse without leaving a stale reset token for the new owner', function () {
    // The stored (raw) email is mixed-case while the token repository always
    // keys on the lowercased form returned by getEmailForPasswordReset() --
    // this is exactly the gap User::delete() must cover by revoking both
    // spellings (see docs/security/soft-delete-patterns.md, "the revocation
    // key must be normalised the way the consumer normalises it"). Note: on
    // MySQL's utf8mb4_unicode_ci this case would also pass without the
    // explicit Str::lower() -- the collation matches case-insensitively.
    // This test documents the mixed-case shape; the explicit normalisation
    // exists so the control does not silently depend on that collation
    // default (Postgres, SQLite, or a _bin/_cs collation would turn the old
    // query into a no-op).
    $user = User::factory()->create(['email' => 'Diego.Ferrer@arospe.es']);

    expect($user->getRawOriginal('email'))->toBe('Diego.Ferrer@arospe.es');

    Password::broker()->createToken($user);
    $this->assertDatabaseHas('password_reset_tokens', ['email' => 'diego.ferrer@arospe.es']);

    $user->delete();

    $newUser = User::factory()->create(['email' => 'diego.ferrer@arospe.es']);

    expect($newUser->getRawOriginal('email'))->toBe('diego.ferrer@arospe.es')
        ->and(DB::table('password_reset_tokens')->where('email', 'diego.ferrer@arospe.es')->exists())->toBeFalse();
});

// --- Passkeys survive a soft delete ---

test('deleting a user does not remove their passkey records', function () {
    $user = User::factory()->create();

    $passkey = $user->passkeys()->create([
        'name' => 'YubiKey',
        'credential_id' => Str::random(40),
        'credential' => '{}',
    ]);

    $user->delete();

    $this->assertDatabaseHas('passkeys', ['id' => $passkey->id]);
});
