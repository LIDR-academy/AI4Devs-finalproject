<?php

use App\Enums\UserStatus;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Laravel\Fortify\Features;

test('login screen can be rendered', function () {
    $response = $this->get(route('login'));

    $response->assertOk();
});

test('users can authenticate using the login screen', function () {
    $user = User::factory()->create();

    $response = $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('dashboard', absolute: false));

    $this->assertAuthenticated();
});

test('users can not authenticate with invalid password', function () {
    $user = User::factory()->create();

    $response = $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'wrong-password',
    ]);

    $response->assertSessionHasErrorsIn('email');

    $this->assertGuest();
});

test('users with two factor enabled are redirected to two factor challenge', function () {
    $this->skipUnlessFortifyHas(Features::twoFactorAuthentication());

    Features::twoFactorAuthentication([
        'confirm' => true,
        'confirmPassword' => true,
    ]);

    $user = User::factory()->withTwoFactor()->create();

    $response = $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $response->assertRedirect(route('two-factor.login'));
    $this->assertGuest();
});

// Story 0005: a soft-deleted user must not be able to authenticate. Note
// this is the automatic Eloquent SoftDeletingScope doing the work, not
// bespoke login code -- since story 0007, the login pipeline resolves the
// user through App\Actions\Fortify\AuthenticateUser, which calls the
// guard's UserProvider (retrieveByCredentials()), not a hand-rolled
// User::where() -- and it is precisely because that provider lookup goes
// through User::query() that the global scope excludes a trashed row from
// it once SoftDeletes lands on the model. See
// docs/security/login-status-enforcement.md's "A custom authenticateUsing
// callback must resolve credentials through the guard's UserProvider".
test('a soft-deleted user cannot authenticate with the credentials they used before deletion', function () {
    $user = User::factory()->create();
    $originalEmail = $user->email;

    $user->delete();

    $response = $this->post(route('login.store'), [
        'email' => $originalEmail,
        'password' => 'password',
    ]);

    $response->assertSessionHasErrorsIn('email');
    $this->assertGuest();
});

test('users can logout', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post(route('logout'));

    $response->assertRedirect(route('home'));

    $this->assertGuest();
});

// --- Story 0007: non-active status blocks sign-in ---

test('an active user signs in normally', function () {
    $user = User::factory()->create(['status' => UserStatus::Active]);

    $response = $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('dashboard', absolute: false));

    $this->assertAuthenticated();
});

test('a user reactivated after being suspended can sign in on their next attempt', function () {
    $user = User::factory()->suspended()->create();

    // First attempt, while still suspended, is refused.
    $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'password',
    ])->assertSessionHasErrors(['email' => __('users.login.not_active')]);
    $this->assertGuest();

    // `status` is deliberately absent from User's #[Fillable] list (see
    // docs/conventions/base-standards.md), so a mass-assignment update()
    // call silently no-ops here -- write it the same way App\Actions\Users\UpdateUser
    // does: a direct property assignment followed by save().
    $user->status = UserStatus::Active;
    $user->save();

    // The very next attempt succeeds, with no cache to clear or session to reset.
    $response = $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('dashboard', absolute: false));

    $this->assertAuthenticated();
});

test('a non-active user cannot sign in with correct credentials', function (UserStatus $status) {
    // Pin the session driver to 'database' for this test only -- phpunit.xml
    // sets SESSION_DRIVER=array for the suite, under which no `sessions` row
    // is ever written regardless of outcome, which would make the
    // assertDatabaseMissing() below pass unconditionally and prove nothing.
    //
    // Both container singletons below were already resolved against the
    // array driver during application boot (RoutingServiceProvider's
    // 'redirect' factory snapshots app('session.store') the first time it
    // is built), so switching config alone leaves the redirect()->withErrors()
    // call that flashes the login failure writing into a stale, disconnected
    // Store. Forgetting both forces them to re-resolve against the driver
    // just configured, so the assertSessionHasErrors() below observes the
    // same Store the request actually flashed into.
    config(['session.driver' => 'database']);
    $this->app->forgetInstance('session.store');
    $this->app->forgetInstance('redirect');

    $user = User::factory()->create(['status' => $status]);

    $response = $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $response->assertSessionHasErrors(['email' => __('users.login.not_active')]);

    // The message names no specific status -- it must read identically
    // whether the account is Inactive or Suspended.
    $message = session('errors')->first('email');
    expect($message)
        ->not->toContain(UserStatus::Inactive->value)
        ->not->toContain(UserStatus::Suspended->value);

    $this->assertGuest();

    // Proves no session row was ever persisted, not merely that the redirect
    // looked like a failure.
    $this->assertDatabaseMissing('sessions', ['user_id' => $user->id]);
})->with([
    'inactive' => [UserStatus::Inactive],
    'suspended' => [UserStatus::Suspended],
]);

test('a wrong password reveals nothing about a non-active account status', function (UserStatus $status) {
    $user = User::factory()->create(['status' => $status]);

    $response = $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'wrong-password',
    ]);

    // Byte-identical to the generic message asserted for an active user in
    // "users can not authenticate with invalid password" above -- both come
    // from the same trans('auth.failed') call, so a wrong password never
    // discloses that the account exists and is merely non-active.
    $response->assertSessionHasErrors(['email' => trans('auth.failed')]);

    $this->assertGuest();
})->with([
    'inactive' => [UserStatus::Inactive],
    'suspended' => [UserStatus::Suspended],
]);

test('blocked sign-in attempts against a suspended user still count toward the login rate limiter', function () {
    $user = User::factory()->suspended()->create();

    for ($attempt = 0; $attempt < 5; $attempt++) {
        $this->post(route('login.store'), [
            'email' => $user->email,
            'password' => 'password',
        ]);

        // Keep every attempt reaching the `throttle:login` middleware as a
        // guest -- today (before this story lands) a suspended user's
        // credentials still authenticate, and the `guest` middleware
        // guarding login.store would otherwise redirect subsequent attempts
        // away before they ever reach the limiter.
        if (Auth::check()) {
            $this->post(route('logout'));
        }
    }

    $response = $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $response->assertStatus(429);

    $this->assertGuest();
});

test('password rehash on login still occurs for an active user', function () {
    // Configure the hasher to want a higher cost than the fixture below,
    // before any Hash usage resolves and caches the bcrypt driver instance
    // for this test -- EloquentUserProvider::rehashPasswordIfRequired() only
    // has something to do if this is set first.
    config(['hashing.bcrypt.rounds' => 12]);

    // Bypass the User model's 'hashed' cast entirely (a native bcrypt hash
    // it recognises as already-hashed and leaves untouched) so the fixture
    // is hashed at a low, deliberately outdated cost.
    $weakHash = password_hash('password', PASSWORD_BCRYPT, ['cost' => 4]);

    $user = User::factory()->create(['password' => $weakHash]);

    expect($user->password)->toBe($weakHash);

    $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'password',
    ])->assertSessionHasNoErrors();

    expect($user->fresh()->password)->not->toBe($weakHash);
});

test('an already-authenticated user who becomes non-active keeps their live session', function () {
    // Functional decision 4 (human-confirmed): suspending a user blocks a
    // *new* session, not one already granted. This guards specifically
    // against a future "simplification" of
    // App\Listeners\RejectNonActiveUserLogin::handleAuthenticated() that
    // drops its request-scoped DETECTED_FLAG check and force-logs-out every
    // non-active user's Authenticated event unconditionally -- actingAs()
    // itself fires that event synchronously (SessionGuard::setUser() calls
    // fireAuthenticatedEvent()) before the request below is even dispatched,
    // so a regressed listener would already have logged the guard out by
    // the time assertOk() runs.
    $user = User::factory()->suspended()->create();

    $this->actingAs($user)->get(route('dashboard'))->assertOk();

    $this->assertAuthenticatedAs($user);
});
