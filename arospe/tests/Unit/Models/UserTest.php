<?php

use App\Models\User;

test('the user model reports a non-incrementing string key type', function () {
    $user = new User;

    expect($user->getKeyType())->toBe('string')
        ->and($user->getIncrementing())->toBeFalse();
});
