<?php

use App\Models\User;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;

beforeEach(function () {
    Route::middleware('web')->get('/__test/users/{user}', function (User $user) {
        return response()->json(['id' => $user->id]);
    });
});

test('a valid uuid resolves the correct user via implicit route binding', function () {
    $user = User::factory()->create();

    $this->get('/__test/users/'.$user->id)
        ->assertOk()
        ->assertJson(['id' => $user->id]);
});

test('a malformed non-uuid identifier 404s via model-not-found rather than a 500', function () {
    $this->get('/__test/users/not-a-uuid')->assertNotFound();
});

test('a stale integer-style identifier 404s via model-not-found rather than a 500', function () {
    $this->assertDatabaseMissing('users', ['id' => '1']);

    $this->get('/__test/users/1')->assertNotFound();
});

test('a well-formed but nonexistent uuid 404s', function () {
    $this->get('/__test/users/'.Str::uuid7())->assertNotFound();
});

test('a soft-deleted user route parameter is rejected as not found', function () {
    $user = User::factory()->create();
    $user->delete();

    $this->get('/__test/users/'.$user->id)->assertNotFound();
});

test('User::find() returns null for stale bigint-style lookups', function () {
    User::factory()->create();

    // Must be the string '1', not the int 1: MySQL numerically coerces a CHAR column
    // against an unquoted integer literal, and a UUIDv7 minted today can start with
    // digits that coerce to exactly 1 (e.g. '01a0...' -> 1), producing a false match.
    $this->assertDatabaseMissing('users', ['id' => '1']);

    expect(User::find(1))->toBeNull()
        ->and(User::find('1'))->toBeNull();
});
