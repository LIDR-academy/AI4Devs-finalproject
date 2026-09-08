<?php

use App\Models\User;

test('the user model reports a non-incrementing string key type', function () {
    $user = new User;

    expect($user->getKeyType())->toBe('string')
        ->and($user->getIncrementing())->toBeFalse();
});

test('status is not mass-assignable', function () {
    $user = new User;

    $user->fill(['status' => 'suspended']);

    expect($user->isDirty('status'))->toBeFalse()
        ->and($user->status)->toBeNull();
});

test('pending_email is not mass-assignable', function () {
    $user = new User;

    $user->fill(['pending_email' => 'x@y.com']);

    expect($user->isDirty('pending_email'))->toBeFalse()
        ->and($user->pending_email)->toBeNull();
});

test('the email accessor lowercases on read without mutating the stored value', function () {
    $user = new User;
    $user->forceFill(['email' => 'MARTA@X.COM']);

    // getRawOriginal() reads Model::$original, which Eloquent only syncs on construct/save/
    // refresh — an unpersisted `new User` has an empty $original regardless of what the accessor
    // does, so it can never prove the accessor is read-only. getAttributes() reflects the actual
    // in-memory attribute bag that forceFill()/setAttribute() write to, bypassing accessors —
    // that is what distinguishes a read-only accessor from a write mutator here.
    expect($user->email)->toBe('marta@x.com')
        ->and($user->getAttributes()['email'])->toBe('MARTA@X.COM');
});
