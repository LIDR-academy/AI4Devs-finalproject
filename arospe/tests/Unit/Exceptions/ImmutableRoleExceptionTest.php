<?php

use App\Exceptions\ImmutableRoleException;
use Illuminate\Http\Request;

test('it is a runtime exception', function () {
    expect(new ImmutableRoleException('The Super Admin role cannot be modified.'))
        ->toBeInstanceOf(RuntimeException::class);
});

test('rendering it produces a 403 response, converging on the same status the policy denial produces', function () {
    $exception = new ImmutableRoleException('The Super Admin role cannot be modified.');

    $response = $exception->render(Request::create('/roles/1'));

    expect($response->getStatusCode())->toBe(403);
});
