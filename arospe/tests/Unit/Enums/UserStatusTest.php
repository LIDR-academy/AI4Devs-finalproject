<?php

use App\Enums\UserStatus;
use Tests\TestCase;

// `label()` resolves through the translator (`__()`), which needs the app container —
// bound per-file here rather than directory-wide, so this stays a `tests/Unit/` test
// (no `RefreshDatabase`, no database touched) per docs/testing/backend/unit-tests.md.
uses(TestCase::class);

test('backing values are exactly active, inactive and suspended', function () {
    expect(UserStatus::Active->value)->toBe('active')
        ->and(UserStatus::Inactive->value)->toBe('inactive')
        ->and(UserStatus::Suspended->value)->toBe('suspended');
});

test('an unrecognized status value throws', function () {
    expect(fn () => UserStatus::from('deleted'))->toThrow(ValueError::class);
});

test('label resolves through the translator rather than returning a literal', function () {
    expect(UserStatus::Active->label())->toBe(trans('users.statuses.active'))
        ->and(UserStatus::Inactive->label())->toBe(trans('users.statuses.inactive'))
        ->and(UserStatus::Suspended->label())->toBe(trans('users.statuses.suspended'));
});
