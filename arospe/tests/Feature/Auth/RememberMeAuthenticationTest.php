<?php

use App\Enums\UserStatus;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Cookie;

// Story 0007: a remember-me ("recaller") cookie must stop granting access
// once the user it belongs to becomes non-active. This path reaches neither
// Fortify::authenticateUsing() nor Passkeys::authorizeLoginUsing() -- the
// recaller is resolved by SessionGuard::user() via retrieveByToken(), deep
// inside Auth's own session resolution, entirely outside both of those
// callbacks -- so it needs the Illuminate\Auth\Events\Login listener
// (App\Listeners\RejectNonActiveUserLogin) as its enforcement point.
test('a remember-me cookie stops granting access once the user is suspended', function () {
    $user = User::factory()->create();

    $loginResponse = $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'password',
        'remember' => true,
    ]);

    $loginResponse->assertRedirect(route('dashboard', absolute: false));
    $this->assertAuthenticated();

    $recallerName = Auth::guard()->getRecallerName();

    /** @var Cookie|null $recallerCookie */
    $recallerCookie = collect($loginResponse->headers->getCookies())
        ->first(fn ($cookie) => $cookie->getName() === $recallerName);

    expect($recallerCookie)->not->toBeNull();

    // The session has since ended: flush the server-side session row, as if
    // the browser closed and the session was garbage-collected, leaving only
    // the long-lived recaller cookie able to grant access.
    DB::table('sessions')->where('user_id', $user->id)->delete();

    // A user administrator sets the account to Suspended in the meantime.
    // `status` is deliberately absent from User's #[Fillable] list (see
    // docs/conventions/base-standards.md), so a mass-assignment update()
    // call silently no-ops here -- write it the same way App\Actions\Users\UpdateUser
    // does: a direct property assignment followed by save().
    $user->status = UserStatus::Suspended;
    $user->save();

    // Within a single Feature test, the "second request" below reuses the
    // same booted Application as the first -- including AuthManager's
    // cached SessionGuard (whose $user property was already populated by
    // the login above) and the session Store's in-memory attributes (which
    // Illuminate\Session\Store::loadSession() merges onto via array_replace()
    // rather than replacing outright, so a fresh session ID alone does not
    // clear a stale 'login_web_...' key). Left alone, either one would let
    // the request below resolve as the already-authenticated user without
    // ever consulting the recaller cookie, silently passing this test for
    // the wrong reason. Forgetting the cached guard and flushing the session
    // together force the request below to actually resolve auth state from
    // scratch, the way a genuinely separate HTTP request would.
    Auth::forgetGuards();
    $this->flushSession();

    $response = $this->withUnencryptedCookie($recallerName, $recallerCookie->getValue())
        ->get(route('dashboard'));

    $response->assertRedirect(route('login'));

    $this->assertGuest();
});
