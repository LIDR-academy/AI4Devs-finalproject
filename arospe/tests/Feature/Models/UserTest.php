<?php

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

test('a factory-created user receives a uuidv7 string primary key', function () {
    $user = User::factory()->create();

    expect($user->id)->toBeString()
        ->and(Str::isUuid($user->id, 7))->toBeTrue();
});

test('two users created in immediate succession sort lexicographically in creation order', function () {
    $first = User::factory()->create();
    $second = User::factory()->create();

    expect(Str::isUuid($first->id, 7))->toBeTrue()
        ->and(Str::isUuid($second->id, 7))->toBeTrue();

    expect(strcmp((string) $first->id, (string) $second->id))->toBeLessThan(0);
});

test('an explicitly provided uuid7 id is respected and not overwritten', function () {
    $id = (string) Str::uuid7();

    $user = User::factory()->create(['id' => $id]);

    expect($user->id)->toBe($id);
});

test("a passkey's user_id round-trips the user's full uuid string without truncation", function () {
    $user = User::factory()->create();

    $passkey = $user->passkeys()->create([
        'name' => 'YubiKey',
        'credential_id' => Str::random(40),
        'credential' => '{}',
    ]);

    $storedUserId = $passkey->fresh()->user_id;

    expect($storedUserId)->toBeString()
        ->and($storedUserId)->toBe($user->id);
});

test("a user's passkeys relation is isolated to that user", function () {
    $userA = User::factory()->create();
    $userB = User::factory()->create();

    $passkeyA = $userA->passkeys()->create([
        'name' => 'YubiKey A',
        'credential_id' => Str::random(40),
        'credential' => '{}',
    ]);

    $userB->passkeys()->create([
        'name' => 'YubiKey B',
        'credential_id' => Str::random(40),
        'credential' => '{}',
    ]);

    expect($userA->passkeys()->count())->toBe(1)
        ->and($userA->passkeys()->first()->id)->toBe($passkeyA->id);
});

// Story 0005 (soft-delete): this used to assert a physical-delete cascade
// removed the passkey row. That is no longer the intended behavior --
// deleting a user now soft-deletes it (an UPDATE, not a DELETE), so the
// passkeys.user_id cascadeOnDelete() FK never fires and the row must
// survive. See tests/Feature/Models/UserSoftDeleteTest.php for the fuller
// soft-delete-mechanics coverage; this one stays here because it is the
// direct flip of the old assertion in the same spot.
test('deleting a user does not cascade to delete their passkey rows', function () {
    $user = User::factory()->create();

    $passkey = $user->passkeys()->create([
        'name' => 'YubiKey',
        'credential_id' => Str::random(40),
        'credential' => '{}',
    ]);

    $user->delete();

    $this->assertDatabaseHas('passkeys', ['id' => $passkey->id]);
});

test('signing in records the session user_id as the uuid string', function () {
    config(['session.driver' => 'database']);

    $user = User::factory()->create();

    $response = $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $response->assertRedirect(route('dashboard', absolute: false));
    $this->assertAuthenticatedAs($user);

    $sessionUserId = DB::table('sessions')->where('user_id', $user->id)->value('user_id');

    expect($sessionUserId)->toBeString();
});
