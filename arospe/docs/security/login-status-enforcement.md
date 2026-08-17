# Login-time account-status enforcement

Rules established by the Phase 4 audit of task **0007** (non-active `users.status` blocks sign-in),
which turned `users.status` from a descriptive label into an **authentication control**. Everything
here was verified against the installed vendor code (`laravel/fortify` v1, `laravel/passkeys`,
`illuminate/auth` in `laravel/framework` v13) and, where noted, by executing the path.

Companion pages: [soft-delete-patterns.md](soft-delete-patterns.md) (the *other* control that lives
inside the same login paths) and [authorization-patterns.md](authorization-patterns.md) (what happens
*after* a session exists).

## Table of contents

- [`status` is now an access-control state — every `Inactive` → `Active` transition is a privilege grant](#status-is-now-an-access-control-state--every-inactive--active-transition-is-a-privilege-grant)
- [Three login paths, three enforcement points — the map any new path must be checked against](#three-login-paths-three-enforcement-points--the-map-any-new-path-must-be-checked-against)
- [A custom `authenticateUsing` callback must resolve credentials through the guard's `UserProvider`](#a-custom-authenticateusing-callback-must-resolve-credentials-through-the-guards-userprovider)
- [Refuse *after* credentials verify, never before](#refuse-after-credentials-verify-never-before)
- [A refusal thrown from `authenticateUsing` only counts toward the limiter because the limiter is on the route](#a-refusal-thrown-from-authenticateusing-only-counts-toward-the-limiter-because-the-limiter-is-on-the-route)
- [Rejecting at `Login` alone does not stick — `SessionGuard::login()` overwrites it one line later](#rejecting-at-login-alone-does-not-stick--sessionguardlogin-overwrites-it-one-line-later)
- [Paths verified already covered](#paths-verified-already-covered)

## `status` is now an access-control state — every `Inactive` → `Active` transition is a privilege grant

Before task 0007, `users.status` blocked nothing: `Inactive` was a label the Users screen rendered as
a badge. `App\Listeners\ActivateVerifiedUser` flipping `Inactive` → `Active` on a `Verified` event
was therefore a *bookkeeping* transition, and it was reviewed as one.

Task 0007 changes what that listener is. `Inactive` now denies sign-in on every path, which makes
**`ActivateVerifiedUser` a privilege-granting control** — the only code in the app that can lift an
administrator's block.

Its one guard was written against the wrong half of the problem:

```php
// app/Listeners/ActivateVerifiedUser.php
if (! $user instanceof User || $user->status !== UserStatus::Inactive) {
    return;
}
```

[architecture/authentication.md](../architecture/authentication.md#account-status-and-activation)
describes this condition as what "stops a verification from silently undoing an administrator's
suspension" — true for `Suspended`, and *only* for `Suspended`. `Inactive` is equally a state an
administrator can set from the Users editor (`statusRules()` is `Rule::enum(UserStatus::class)`,
i.e. all three cases), and for that state the condition is not a guard at all: it is the trigger.

**The rule:** `Inactive` carries two meanings this codebase does not distinguish — "never proved
their mailbox yet" (self-registration, invitation) and "an administrator turned this account off".
Any code that promotes a user to `Active` must establish which one it is looking at. Proof of mailbox
control (`Verified`) answers the first and says nothing about the second. Concretely, an
activation-on-verification rule must additionally require that the user has *never* been verified —
or the two meanings must be split into separate enum cases.

**Reading the pre-save value correctly is its own trap: it is `getPrevious()`, not `getOriginal()`.**
This audit's first recommendation was `is_null($user->getOriginal('email_verified_at'))`, and it is
**wrong** — verified by it breaking `EmailVerificationTest` and `PasswordResetTest` when tried.
`Model::save()` ends in `finishSave()`, which calls `syncOriginal()` unconditionally after *every*
successful save, so by the time a listener runs, `getOriginal()` already holds the value that was
just written. A `getOriginal()`-based guard therefore always finds a non-null "original" and refuses
every legitimate first verification. What survives is `$this->previous`, set by `syncChanges()` from
inside `performUpdate()` — which runs *before* `finishSave()` — as
`array_intersect_key($this->getRawOriginal(), $this->changes)`:

```php
// app/Listeners/ActivateVerifiedUser.php
$previous = $user->getPrevious();

$neverVerified = array_key_exists('email_verified_at', $previous) && is_null($previous['email_verified_at']);

if (! $neverVerified) {
    return;
}
```

Three constraints come with `getPrevious()`, all verified against `laravel/framework` v13:

- **`array_key_exists` first, and fail closed.** `previous` only carries attributes that were dirty
  on the last save. An absent key means "this save did not touch `email_verified_at`" — never assume
  that means "never verified".
- **`syncChanges()` replaces `previous` wholesale on every dirty save**, so the event must fire on
  the same instance whose *immediately preceding* `save()` wrote `email_verified_at`. Inserting any
  extra `->save()` between that write and the `event(new Verified(...))` in
  `App\Actions\Users\ConfirmEmailChange` / `App\Actions\Fortify\ResetUserPassword` silently drops the
  key and stops activating legitimate first verifications. It fails safe, but it fails silently.
- **`performInsert()` does not call `syncChanges()`** (only `performUpdate()` and the
  increment/decrement helpers do), so `previous` is empty on a freshly inserted model. Both of this
  app's `Verified` producers run on the update path, so this is inert today — but a future flow that
  inserts a pre-verified user and fires `Verified` on that same instance will not activate them.
- **A queued listener loses this entirely.** `SerializesModels` re-fetches the model, so
  `getPrevious()` comes back empty. Keep `ActivateVerifiedUser` synchronous, or move the "was this
  the first verification?" decision to the producer and carry it on the event.

Corollary, and the reason this is a security rule rather than a modelling nit: **the flows that fire
`Verified` are reachable without a session.** `App\Actions\Users\ConfirmEmailChange` fires it from
[`email-change.confirm`](../api/routes.md#email-changeconfirm--the-first-app-owned-route-deliberately-outside-auth),
which is deliberately registered outside `auth` — so a deactivated user needs only a 60-minute-old
pending-email link, not a live session, to reactivate themselves. Verified by execution:

```
BEFORE: status=inactive
confirm returned: true
AFTER : status=active  isActive=true
```

When you add a new state to this enum, or a new event that writes it, ask what the state *denies*
first and who can undo it second — not what it is called.

## Three login paths, three enforcement points — the map any new path must be checked against

This app grants a fresh session through four vendor call sites, and no single hook covers them.
Verified by reading each one; keep this table current, because "integrate with Fortify's
authentication pipeline" covers only the first two:

| Path | Vendor call site | Enforcement point |
| --- | --- | --- |
| email + password | `AttemptToAuthenticate::handleUsingCustomCallback()` | `Fortify::authenticateUsing()` → `App\Actions\Fortify\AuthenticateUser` |
| email + password, 2FA account | `RedirectIfTwoFactorAuthenticatable::validateCredentials()` | same callback — consulted **before** `twoFactorChallengeResponse()` writes `login.id` |
| passkey | `PasskeyLoginController::store()` | `Passkeys::authorizeLoginUsing()` |
| remember-me recaller | `SessionGuard::user()` → `userFromRecaller()` | `Illuminate\Auth\Events\Login` listener |
| 2FA code submitted after status changed | `TwoFactorAuthenticatedSessionController::store()` → `$guard->login()` | `Illuminate\Auth\Events\Authenticated` listener (see below) |

Two of these are easy to miss for the same structural reason: **they never touch Fortify's pipeline.**
`PasskeyLoginController` is its own controller, and the recaller is resolved inside Auth's own session
resolution. `TwoFactorAuthenticatedSessionController::store()` is the third — it pulls the challenged
user straight from the session and calls `$guard->login($user, ...)` without re-consulting
`Fortify::authenticateUsing()`, so a status change between the password step and the code step is
invisible to the callback.

**The rule:** a new login mechanism (magic link, SSO, impersonation) re-opens this question
independently. Before shipping one, locate its `$guard->login()` / `setUser()` call and state which
of the enforcement points above reaches it. The same enumeration is what
[soft-delete-patterns.md](soft-delete-patterns.md#a-vendor-relation-is-the-one-place-that-scope-can-be-lost-silently)
demands for `SoftDeletingScope`; do both in one pass.

## A custom `authenticateUsing` callback must resolve credentials through the guard's `UserProvider`

`Fortify::authenticateUsing()` replaces `$guard->attempt()` entirely. Everything `attempt()` did on
the way to a `User` is now the callback's responsibility, and two of those things are security
controls rather than conveniences:

```php
// app/Actions/Fortify/AuthenticateUser.php
$provider = $this->guard->getProvider();

$user = $provider->retrieveByCredentials($request->only(Fortify::username(), 'password'));

if (! $user || ! $provider->validateCredentials($user, ['password' => $request->password])) {
    return null;
}

if (config('hashing.rehash_on_login', true) && method_exists($provider, 'rehashPasswordIfRequired')) {
    $provider->rehashPasswordIfRequired($user, ['password' => $request->password]);
}
```

- `EloquentUserProvider::retrieveByCredentials()` builds from `newModelQuery()` → `createModel()->newQuery()`,
  so **global scopes apply** — which is the entire soft-delete sign-in refusal. A hand-rolled
  `User::where('email', …)->first()` would keep working, keep passing every status test, and silently
  re-admit soft-deleted accounts.
- `rehashPasswordIfRequired()` is what upgrades a stored hash when `hashing.bcrypt.rounds` is raised.
  It is invisible in tests unless one is written for it, and losing it degrades every existing
  password silently for as long as the account survives.

❌ Bad — the shortcut this action exists to avoid (adapted; not present in the repo):

```php
// anti-pattern — drops the soft-delete scope AND the rehash in one line
$user = User::where('email', $request->email)->first();

if (! $user || ! Hash::check($request->password, $user->password)) {
    return null;
}
```

## Refuse *after* credentials verify, never before

The `Inactive`/`Suspended` refusal is a **deliberate, PRD-mandated disclosure** (the user is told the
account is not active). That is only acceptable because two properties hold, and both are structural
rather than incidental:

```php
// app/Actions/Fortify/AuthenticateUser.php — order is the control
if (! $user || ! $provider->validateCredentials(...)) {
    return null;                       // generic trans('auth.failed'), unchanged
}
// ...
if (! $user->isActive()) {
    throw ValidationException::withMessages([
        Fortify::username() => [__('users.login.not_active')],
    ]);
}
```

1. **Returning `null` rather than throwing** for bad credentials hands control back to
   `AttemptToAuthenticate::throwFailedAuthenticationException()`, so a wrong password produces the
   byte-identical `trans('auth.failed')` message an active account produces. A wrong password
   therefore never distinguishes "no such account" from "account exists but is blocked".
2. **The message names no status.** `users.login.not_active` is one key for both `Inactive` and
   `Suspended`, and both `lang/en/users.php` and `lang/es/users.php` carry a comment saying so.
   Naming the status would tell an attacker holding valid credentials whether an administrator has
   noticed them.

**The rule:** any future "your account cannot sign in because X" copy inherits both properties —
reachable only past a verified password, and identical across every value of X. Assert property 1 in
a test that reuses the existing wrong-password test's expected string as its baseline, so the two can
never drift apart.

## A refusal thrown from `authenticateUsing` only counts toward the limiter because the limiter is on the route

Throwing `ValidationException` from inside the callback **skips**
`AttemptToAuthenticate::throwFailedAuthenticationException()`, and that method is the only place
Fortify's own `LoginRateLimiter::increment()` is called. So the intuitive reading — "a blocked
attempt increments the login limiter" — is false at the Fortify layer.

It counts anyway, for an unrelated reason: `config/fortify.php` sets

```php
'limiters' => [
    'login' => 'login',
    // ...
],
```

which makes `AuthenticatedSessionController::loginPipeline()` filter `EnsureLoginIsNotThrottled` out
of the pipeline entirely and instead puts `Illuminate\Routing\Middleware\ThrottleRequests:login` on
the `login.store` route (confirmed with `php artisan route:list --json`). `ThrottleRequests` hits the
limiter *before* dispatching, so every request counts regardless of how it ends.

**The rule:** if `fortify.limiters.login` is ever unset — a plausible "simplification", since Fortify
works either way — `EnsureLoginIsNotThrottled` comes back, the route middleware disappears, and
status-blocked attempts stop being counted, turning the login form into an unmetered password oracle
for blocked accounts. The two are coupled; do not change one without re-running the "blocked attempts
still throttle at the sixth try" test.

## Rejecting at `Login` alone does not stick — `SessionGuard::login()` overwrites it one line later

This is the least obvious mechanic in the story and the reason
`App\Listeners\RejectNonActiveUserLogin` is registered on **two** events.

```php
// vendor/laravel/framework/src/Illuminate/Auth/SessionGuard.php
public function login(AuthenticatableContract $user, $remember = false)
{
    $this->updateSession($user->getAuthIdentifier());
    // ...
    $this->fireLoginEvent($user, $remember);   // a logout() here is undone by the next line
    $this->setUser($user);                     // $this->user = $user; loggedOut = false; fires Authenticated
}
```

So the two paths behave differently:

- **Recaller.** `SessionGuard::user()` fires `Login` as the *last* thing it does before
  `return $this->user;`, with no `setUser()` after it. A `logout()` from the `Login` handler is real
  here — and it does the right extra work: `clearUserDataFromStorage()` queues the recaller cookie's
  deletion and `cycleRememberToken()` rotates `remember_token`, so the captured cookie is dead
  server-side too, not merely unset in one browser.
- **`$guard->login()`** (2FA code submission, passkey, `AttemptToAuthenticate`). `setUser()` runs
  immediately after and resurrects the session. Only a handler on `Authenticated` — which
  necessarily runs *inside* `setUser()`, after the assignment — can make the logout stick.

The handoff is a per-request flag, which is correct because `Authenticated` alone must stay a no-op
(an already-signed-in non-active user keeps their session — an accepted, documented scope boundary):

```php
// app/Listeners/RejectNonActiveUserLogin.php
request()->attributes->set(self::DETECTED_FLAG, $user->getAuthIdentifier());
```

**The rule:** `request()->attributes` is a sound channel between two listeners in the same request
(it is the container-bound request instance, and this app runs neither Octane nor any queued-listener
path that fires `Login`). Two constraints come with it, both real, and both now applied:

- **Guard the session call.** `forceLogout()` ends with `request()->session()->invalidate()`, and
  `Illuminate\Http\Request::session()` throws `RuntimeException: Session store not set on request.`
  when `hasSession()` is false. Verified by calling `Auth::guard('web')->login($nonActiveUser)` from
  a console context — it throws. `$guard->logout()` runs first so the failure is closed rather than
  open, but a future command or queued job that logs a user in gets a hard crash for non-active users
  only. Follow Fortify's own `AuthenticatedSessionController::destroy()` and wrap it in
  `if (request()->hasSession())` — which is exactly what makes it a **guard, not a weakening**:
  `hasSession()` is true on every path where `StartSession` ran, i.e. every HTTP request, so the
  invalidation still happens wherever a session genuinely exists. Note Fortify also calls
  `regenerateToken()` there; `invalidate()` flushes `_token` and the next request's `Store::start()`
  regenerates it, so omitting it is safe only while no view is rendered after the forced logout
  (today every such path ends in a redirect). Mirror Fortify fully if that ever changes.
- **Carry the identity, not just a boolean.** A bare boolean says "some non-active user fired `Login`
  this request", and the `Authenticated` handler would then log out whatever principal the *next*
  event names. Store `$user->getAuthIdentifier()` and compare it strictly against
  `$event->user->getAuthIdentifier()`. Strict `!==` is correct here rather than risky: the identifier
  is `users.id`, a `CHAR(36)` UUID hydrated as a PHP string on every path that can reach these
  events (`retrieveByCredentials()`, `retrieveById()`, `retrieveByToken()`, `$passkey->user`), so
  there is no int-vs-string pair to compare — and the unset case (`null !== '<uuid>'`) falls through
  to the early return, which is the safe direction. Re-check this if the primary key type ever
  changes: with an auto-incrementing key, a session-sourced identifier can arrive as a string while
  the model's is an int, and strict comparison would silently stop matching.

## Paths verified already covered

Checked during this audit and found correct — do not re-litigate these without new evidence, and do
not weaken them:

- **`wasRecentlyCreated` is not a spoofable exemption.** The `Login` handler skips a user Eloquent
  just inserted, to preserve Fortify's `RegisteredUserController::store()` signing in a
  freshly-registered (and by design `Inactive`) account. Every *other* `$guard->login()` call site in
  the app receives a model hydrated by `newFromBuilder()` — `retrieveByCredentials()` (password),
  `retrieveById()` (2FA), `retrieveByToken()` (recaller), `$passkey->user` (passkey) — for which the
  property is always `false`. There is no request-controlled route to a `true` value.
- **`Rule` ordering in the 2FA pipe.** `RedirectIfTwoFactorAuthenticatable::handle()` calls
  `validateCredentials()` — and therefore the callback — before `twoFactorChallengeResponse()` writes
  `login.id`, so a non-active 2FA account leaves no pending-challenge state behind. Asserted by
  `assertSessionMissing('login.id')`, which is the assertion that actually proves the ordering.
- **The callback runs twice per successful 2FA login** (once per pipe), so bcrypt is verified twice.
  Stock Fortify does the same (`validateCredentials()` then `$guard->attempt()`), so this is not new
  cost — but a future "optimisation" that caches the result across pipes would be caching an
  authorization decision.
- **Single guard, no event auto-discovery.** `config/auth.php` defines only `web`, and
  `bootstrap/app.php` never calls `withEvents()`, so the explicit `Event::listen()` registrations in
  `AppServiceProvider` are the only ones — the listener is not double-fired.
- **The `authorizeLoginUsing` callback's user parameter must be nullable.**
  `Passkeys::allowsLogin()` calls it as `(self::$authorizeLoginUsing)($request, $passkey->user, $passkey)`
  — `$passkey->user` unchecked. That `BelongsTo` is scoped by `SoftDeletingScope`, so it resolves
  `null` for a soft-deleted owner (see
  [soft-delete-patterns.md](soft-delete-patterns.md)), and a non-nullable `User` parameter turns a
  refusal that should be clean into a `TypeError`. Type it `?User` and refuse on `null` first. The
  general shape: **a vendor callback that hands you a relation result hands you `null` whenever a
  scope filters the parent out** — assume nullable unless the vendor checks it for you.
- **`Suspended` cannot be self-lifted through the password-reset or invitation flow.**
  `ActivateVerifiedUser` ignores `Suspended` outright, and `ResetUserPassword` fires `Verified` only
  when `email_verified_at` was null. (Contrast the `Inactive` case at the top of this page.)

_Last updated: 2026-08-17 — Phase 4 **re-audit** of task 0007, after the four findings were fixed.
Replaced this page's own disproven `getOriginal('email_verified_at')` recommendation with the
`getPrevious()` rule and its four constraints (fail closed on an absent key; `syncChanges()` replaces
`previous` wholesale; `performInsert()` never calls it; a queued listener loses it), recorded the
nullable-`?User` rule for `Passkeys::authorizeLoginUsing()`, and marked the two
`RejectNonActiveUserLogin` constraints applied — including why `hasSession()` guards rather than
weakens the invalidation, and why strict `!==` on `getAuthIdentifier()` is safe only while the
primary key is a UUID string._

_Previously: 2026-08-17 — Created by the Phase 4 audit of task 0007 (non-active status blocks sign-in)._
