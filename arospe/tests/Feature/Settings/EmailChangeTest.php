<?php

use App\Actions\Users\ConfirmEmailChange;
use App\Actions\Users\RequestEmailChange;
use App\Enums\UserStatus;
use App\Livewire\Settings\Profile;
use App\Models\User;
use App\Notifications\PendingEmailVerification;
use Illuminate\Auth\Events\Verified;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Livewire\Livewire;

// --- Requesting a change ---

test('requesting a change stores pending_email, leaves email/status untouched, and notifies only the new address', function () {
    Notification::fake();

    $user = User::factory()->create(['status' => UserStatus::Active]);
    $originalEmail = $user->getRawOriginal('email');
    $originalVerifiedAt = $user->email_verified_at;

    app(RequestEmailChange::class)($user, 'new-address@example.com');

    $user->refresh();

    expect($user->pending_email)->toBe('new-address@example.com')
        ->and($user->getRawOriginal('email'))->toBe($originalEmail)
        ->and($user->email_verified_at)->toEqual($originalVerifiedAt)
        ->and($user->status)->toBe(UserStatus::Active);

    Notification::assertSentOnDemandTimes(PendingEmailVerification::class, 1);
    Notification::assertSentOnDemand(
        PendingEmailVerification::class,
        fn ($notification, $channels, $notifiable): bool => ($notifiable->routes['mail'] ?? null) === 'new-address@example.com',
    );
    Notification::assertNothingSentTo($user);
});

test('no pending value is stored and nothing is sent when submitting the current address', function (string $submitted) {
    Notification::fake();

    $user = User::factory()->create(['email' => 'marta.ruiz@arospe.es', 'status' => UserStatus::Active]);

    app(RequestEmailChange::class)($user, $submitted);

    expect($user->fresh()->pending_email)->toBeNull();
    Notification::assertNothingSent();
})->with([
    'same case' => ['marta.ruiz@arospe.es'],
    'different case' => ['MARTA.RUIZ@AROSPE.ES'],
]);

test('case handling: requesting a mixed-case address stores and applies it lowercased', function () {
    $user = User::factory()->create(['status' => UserStatus::Active]);

    app(RequestEmailChange::class)($user, 'MARTA@X.COM');

    expect($user->fresh()->pending_email)->toBe('marta@x.com');

    $url = URL::temporarySignedRoute(
        'email-change.confirm',
        now()->addMinutes(60),
        ['user' => $user->id, 'hash' => sha1('marta@x.com')],
    );

    $this->get($url);

    expect($user->fresh()->getRawOriginal('email'))->toBe('marta@x.com');
});

test('the verification link hash is built from the normalised address, not the raw input', function () {
    Notification::fake();

    $user = User::factory()->create(['status' => UserStatus::Active]);

    app(RequestEmailChange::class)($user, 'MARTA@X.COM');

    Notification::assertSentOnDemand(
        PendingEmailVerification::class,
        function ($notification, $channels, $notifiable): bool {
            $mail = $notification->toMail($notifiable);

            preg_match('/([a-f0-9]{40})/', (string) $mail->actionUrl, $matches);

            expect($matches[1] ?? null)->toBe(sha1('marta@x.com'))
                ->and($matches[1] ?? null)->not->toBe(sha1('MARTA@X.COM'));

            return true;
        },
    );
});

// --- Uniqueness at request time ---

test('an address already used as another users email is rejected at validation, storing nothing', function () {
    User::factory()->create(['email' => 'taken@example.com']);
    $user = User::factory()->create(['status' => UserStatus::Active]);
    $this->actingAs($user);

    Livewire::test(Profile::class)
        ->set('email', 'taken@example.com')
        ->call('updateProfileInformation')
        ->assertHasErrors(['email']);

    expect($user->fresh()->pending_email)->toBeNull();
});

test('an address already pending for another user is rejected at validation, storing nothing', function () {
    User::factory()->pendingEmail('claimed@example.com')->create();
    $user = User::factory()->create(['status' => UserStatus::Active]);
    $this->actingAs($user);

    Livewire::test(Profile::class)
        ->set('email', 'claimed@example.com')
        ->call('updateProfileInformation')
        ->assertHasErrors(['email']);

    expect($user->fresh()->pending_email)->toBeNull();
});

test('a pending_email uniqueness collision that slips past validation is rethrown as a validation error on the email field', function () {
    User::factory()->pendingEmail('claimed@example.com')->create();
    $user = User::factory()->create(['status' => UserStatus::Active]);

    try {
        app(RequestEmailChange::class)($user, 'claimed@example.com');
        $this->fail('Expected a ValidationException to be thrown.');
    } catch (ValidationException $exception) {
        expect($exception->errors())->toHaveKey('email');
    }

    expect($user->fresh()->pending_email)->toBeNull();
});

// --- Throttling ---

test('a 4th email change request within the throttle window is rejected without sending a notification', function () {
    Notification::fake();

    $user = User::factory()->create(['status' => UserStatus::Active]);

    app(RequestEmailChange::class)($user, 'first@example.com');
    app(RequestEmailChange::class)($user, 'second@example.com');
    app(RequestEmailChange::class)($user, 'third@example.com');

    try {
        app(RequestEmailChange::class)($user, 'fourth@example.com');
        $this->fail('Expected a ValidationException to be thrown.');
    } catch (ValidationException $exception) {
        expect($exception->errors())->toHaveKey('email');
    }

    // The throttled 4th call never reaches forceFill()->save(): the pending
    // value stays whatever the 3rd (allowed) call left it at.
    expect($user->fresh()->pending_email)->toBe('third@example.com');

    Notification::assertSentOnDemandTimes(PendingEmailVerification::class, 3);
});

test('the email change throttle is scoped per user, not global', function () {
    Notification::fake();

    $throttledUser = User::factory()->create(['status' => UserStatus::Active]);
    $otherUser = User::factory()->create(['status' => UserStatus::Active]);

    app(RequestEmailChange::class)($throttledUser, 'one@example.com');
    app(RequestEmailChange::class)($throttledUser, 'two@example.com');
    app(RequestEmailChange::class)($throttledUser, 'three@example.com');

    // $throttledUser has now exhausted its 3 attempts, but a different
    // user's own first request in the same window must still succeed —
    // the limiter key includes the user's id, so it can't collide.
    app(RequestEmailChange::class)($otherUser, 'four@example.com');

    expect($otherUser->fresh()->pending_email)->toBe('four@example.com');
    Notification::assertSentOnDemandTimes(PendingEmailVerification::class, 4);
});

// --- Confirming a pending change ---

test('using the link applies the pending address, verifies it, and clears the pending value', function () {
    $user = User::factory()->pendingEmail('new-address@example.com')->create(['status' => UserStatus::Active]);

    $url = URL::temporarySignedRoute(
        'email-change.confirm',
        now()->addMinutes(60),
        ['user' => $user->id, 'hash' => sha1('new-address@example.com')],
    );

    $this->get($url)->assertRedirect(route('profile.edit'));

    $user->refresh();

    expect($user->getRawOriginal('email'))->toBe('new-address@example.com')
        ->and($user->pending_email)->toBeNull()
        ->and($user->email_verified_at)->not->toBeNull();
});

test('confirming a pending email dispatches the Verified event', function () {
    Event::fake([Verified::class]);

    $user = User::factory()->pendingEmail('new-address@example.com')->create(['status' => UserStatus::Active]);

    $url = URL::temporarySignedRoute(
        'email-change.confirm',
        now()->addMinutes(60),
        ['user' => $user->id, 'hash' => sha1('new-address@example.com')],
    );

    $this->get($url);

    Event::assertDispatched(Verified::class, fn (Verified $event): bool => $event->user->is($user));
});

test('confirming a pending email applies the activation rule for the accounts status', function (string $initialStatus, string $expectedStatus) {
    $user = User::factory()->pendingEmail('new-address@example.com')->create([
        'status' => UserStatus::from($initialStatus),
        'email_verified_at' => null,
    ]);

    $url = URL::temporarySignedRoute(
        'email-change.confirm',
        now()->addMinutes(60),
        ['user' => $user->id, 'hash' => sha1('new-address@example.com')],
    );

    $this->get($url);

    expect($user->fresh()->status)->toBe(UserStatus::from($expectedStatus));
})->with([
    'inactive becomes active' => ['inactive', 'active'],
    'suspended stays suspended' => ['suspended', 'suspended'],
]);

// Phase 4 security audit follow-up (F5, story 0007): the dataset test above
// forces email_verified_at to null on both rows, so its "inactive becomes
// active" case only exercises a user who has never verified before — never
// the exploit shape the F1 fix actually guards against. This test drives
// that shape through real Eloquent and the real ConfirmEmailChange action
// (no hand-built model double): a user who was genuinely Active and verified
// in the past, then deactivated by an administrator (status flipped to
// Inactive directly — status isn't mass-assignable, see User's #[Fillable]
// and how App\Actions\Users\UpdateUser writes it), still carries that old,
// non-null email_verified_at. Confirming a pending email change for them
// must not silently reactivate the account.
test('confirming a pending email change does not reactivate a user who was deactivated after a genuine prior verification', function () {
    $user = User::factory()
        ->pendingEmail('new-address@example.com')
        ->inactive()
        ->create();

    // The factory's base state already sets a genuine email_verified_at
    // (now()); ->inactive() only overrides status, leaving that prior
    // verification timestamp in place — exactly the "was Active and
    // verified, then deactivated" history the exploit relies on.
    expect($user->email_verified_at)->not->toBeNull();

    $url = URL::temporarySignedRoute(
        'email-change.confirm',
        now()->addMinutes(60),
        ['user' => $user->id, 'hash' => sha1('new-address@example.com')],
    );

    $this->get($url)->assertRedirect(route('profile.edit'));

    $fresh = $user->fresh();

    expect($fresh->status)->toBe(UserStatus::Inactive)
        ->and($fresh->getRawOriginal('email'))->toBe('new-address@example.com')
        ->and($fresh->pending_email)->toBeNull();
});

test('the confirmation route is reachable while signed out', function () {
    $user = User::factory()->pendingEmail('new-address@example.com')->create([
        'status' => UserStatus::Inactive,
        'email_verified_at' => null,
    ]);

    $url = URL::temporarySignedRoute(
        'email-change.confirm',
        now()->addMinutes(60),
        ['user' => $user->id, 'hash' => sha1('new-address@example.com')],
    );

    $response = $this->get($url);

    $response->assertRedirect(route('profile.edit'));
    $response->assertHeader('Location', route('profile.edit'));

    expect($user->fresh()->status)->toBe(UserStatus::Active)
        ->and($user->fresh()->getRawOriginal('email'))->toBe('new-address@example.com');
});

// --- Negative and edge cases ---

test('a verification link cannot be used twice', function () {
    $user = User::factory()->pendingEmail('new-address@example.com')->create(['status' => UserStatus::Active]);

    $url = URL::temporarySignedRoute(
        'email-change.confirm',
        now()->addMinutes(60),
        ['user' => $user->id, 'hash' => sha1('new-address@example.com')],
    );

    $this->get($url);
    expect($user->fresh()->getRawOriginal('email'))->toBe('new-address@example.com');

    $response = $this->get($url);

    $response->assertRedirect(route('profile.edit'));
    $response->assertSessionHas('status', trans('users.email_change.refused'));
    expect($user->fresh()->getRawOriginal('email'))->toBe('new-address@example.com');
});

test('a tampered verification link is refused with a 403, not the controllers refusal redirect', function (Closure $tamper) {
    $user = User::factory()->pendingEmail('new-address@example.com')->create(['status' => UserStatus::Active]);

    $url = URL::temporarySignedRoute(
        'email-change.confirm',
        now()->addMinutes(60),
        ['user' => $user->id, 'hash' => sha1('new-address@example.com')],
    );

    $tamperedUrl = $tamper($url, $user);

    $this->get($tamperedUrl)->assertForbidden();

    expect($user->fresh()->pending_email)->toBe('new-address@example.com')
        ->and($user->fresh()->getRawOriginal('email'))->not->toBe('new-address@example.com');
})->with([
    'altered hash' => [fn (string $url): string => str_replace(sha1('new-address@example.com'), sha1('someone-else@example.com'), $url)],
    'altered user id' => [fn (string $url, User $user): string => str_replace((string) $user->id, (string) Str::uuid7(), $url)],
    'altered signature' => [fn (string $url): string => $url.'tampered'],
]);

test('an expired verification link is refused with a 403', function () {
    $user = User::factory()->pendingEmail('new-address@example.com')->create(['status' => UserStatus::Active]);

    $url = URL::temporarySignedRoute(
        'email-change.confirm',
        now()->addMinutes(60),
        ['user' => $user->id, 'hash' => sha1('new-address@example.com')],
    );

    $this->travel(61)->minutes();

    $this->get($url)->assertForbidden();

    expect($user->fresh()->pending_email)->toBe('new-address@example.com')
        ->and($user->fresh()->getRawOriginal('email'))->not->toBe('new-address@example.com');
});

test('requesting a second address replaces the first pending one, and the first link then fails at the hash check', function () {
    $user = User::factory()->create(['status' => UserStatus::Active]);

    app(RequestEmailChange::class)($user, 'first-address@example.com');

    $firstUrl = URL::temporarySignedRoute(
        'email-change.confirm',
        now()->addMinutes(60),
        ['user' => $user->id, 'hash' => sha1('first-address@example.com')],
    );

    app(RequestEmailChange::class)($user, 'second-address@example.com');

    expect($user->fresh()->pending_email)->toBe('second-address@example.com');

    $response = $this->get($firstUrl);

    $response->assertRedirect(route('profile.edit'));
    $response->assertSessionHas('status', trans('users.email_change.refused'));

    expect($user->fresh()->pending_email)->toBe('second-address@example.com')
        ->and($user->fresh()->getRawOriginal('email'))->not->toBe('first-address@example.com');
});

test('cancelling a pending email change clears it and invalidates the outstanding link', function () {
    $user = User::factory()->create(['status' => UserStatus::Active]);
    app(RequestEmailChange::class)($user, 'cancel-me@example.com');

    $url = URL::temporarySignedRoute(
        'email-change.confirm',
        now()->addMinutes(60),
        ['user' => $user->id, 'hash' => sha1('cancel-me@example.com')],
    );

    $this->actingAs($user);
    Livewire::test(Profile::class)->call('cancelEmailChange');

    expect($user->fresh()->pending_email)->toBeNull();

    $response = $this->get($url);

    $response->assertRedirect(route('profile.edit'));
    $response->assertSessionHas('status', trans('users.email_change.refused'));
    expect($user->fresh()->getRawOriginal('email'))->not->toBe('cancel-me@example.com');
});

test('re-submitting the form after cancelling a pending change does not resurrect it', function () {
    Notification::fake();

    $user = User::factory()->create(['status' => UserStatus::Active]);
    $this->actingAs($user);

    $component = Livewire::test(Profile::class)
        ->set('email', 'stale-pending@example.com')
        ->call('updateProfileInformation');

    expect($user->fresh()->pending_email)->toBe('stale-pending@example.com');

    $component->call('cancelEmailChange');

    expect($user->fresh()->pending_email)->toBeNull();

    // Re-submit whatever the form now holds, with no further edits: the
    // bound $email property must have resynced to the stored address after
    // the cancel, not still hold the address that was just cancelled.
    $component->call('updateProfileInformation');

    expect($user->fresh()->pending_email)->toBeNull();
    Notification::assertSentOnDemandTimes(PendingEmailVerification::class, 1);
});

test('a name-only save after requesting an email change leaves the pending change untouched', function () {
    Notification::fake();

    $user = User::factory()->create(['status' => UserStatus::Active]);
    $this->actingAs($user);

    $component = Livewire::test(Profile::class)
        ->set('email', 'pending-address@example.com')
        ->call('updateProfileInformation');

    expect($user->fresh()->pending_email)->toBe('pending-address@example.com');

    $component->set('name', 'Updated Name')
        ->call('updateProfileInformation');

    // The bound $email mirrors the stored column (not the pending one), so
    // this second, email-untouched submit resubmits the user's current
    // *stored* address. Only the explicit Cancel action may drop a pending
    // change — Profile::updateProfileInformation() no longer calls
    // RequestEmailChange at all when the submitted address matches what's
    // stored, so an unrelated name-only save must leave the pending change
    // exactly as it was: no cancel, no resend, no error.
    expect($user->fresh()->name)->toBe('Updated Name')
        ->and($user->fresh()->pending_email)->toBe('pending-address@example.com');

    Notification::assertSentOnDemandTimes(PendingEmailVerification::class, 1);
});

test('an address claimed by another account between request and confirmation is refused, not half-applied', function () {
    $user = User::factory()->pendingEmail('contested@example.com')->create(['status' => UserStatus::Active]);

    $url = URL::temporarySignedRoute(
        'email-change.confirm',
        now()->addMinutes(60),
        ['user' => $user->id, 'hash' => sha1('contested@example.com')],
    );

    User::factory()->create(['email' => 'contested@example.com']);

    $response = $this->get($url);

    $response->assertRedirect(route('profile.edit'));
    $response->assertSessionHas('status', trans('users.email_change.refused'));
    $response->assertSessionMissing('status', trans('users.email_change.confirmed'));

    expect($user->fresh()->getRawOriginal('email'))->not->toBe('contested@example.com')
        ->and($user->fresh()->pending_email)->toBe('contested@example.com');
});

test('calling ConfirmEmailChange directly returns false and makes no change when the pending value no longer matches', function () {
    $user = User::factory()->create(['status' => UserStatus::Active, 'pending_email' => null]);

    $result = (new ConfirmEmailChange)($user, 'never-requested@example.com');

    expect($result)->toBeFalse()
        ->and($user->fresh()->getRawOriginal('email'))->not->toBe('never-requested@example.com');
});

// --- Surfacing the confirmation/refusal flash as a toast on profile.edit ---

test('landing on profile.edit with a confirmed email-change status shows a success toast', function () {
    $user = User::factory()->create(['status' => UserStatus::Active]);
    $this->actingAs($user);
    $this->session(['status' => trans('users.email_change.confirmed')]);

    Livewire::test(Profile::class)
        ->assertDispatched(
            'toast-show',
            dataset: ['variant' => 'success'],
            slots: ['text' => trans('users.email_change.confirmed')],
        );
});

test('landing on profile.edit with a refused email-change status shows a danger toast', function () {
    $user = User::factory()->create(['status' => UserStatus::Active]);
    $this->actingAs($user);
    $this->session(['status' => trans('users.email_change.refused')]);

    Livewire::test(Profile::class)
        ->assertDispatched(
            'toast-show',
            dataset: ['variant' => 'danger'],
            slots: ['text' => trans('users.email_change.refused')],
        );
});

test('landing on profile.edit with no status flash shows no toast', function () {
    $user = User::factory()->create(['status' => UserStatus::Active]);
    $this->actingAs($user);

    Livewire::test(Profile::class)
        ->assertNotDispatched('toast-show');
});

test('landing on profile.edit with an unrelated status flash shows no toast', function () {
    $user = User::factory()->create(['status' => UserStatus::Active]);
    $this->actingAs($user);
    $this->session(['status' => 'some-unrelated-status-string']);

    Livewire::test(Profile::class)
        ->assertNotDispatched('toast-show');
});
