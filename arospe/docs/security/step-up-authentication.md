# Step-up authentication

Durable rules for the app's **third** authorization layer, established by task 0015a — the
password-confirmation freshness guard on the Users screen's role change, status change and delete
actions. Route middleware answers *are you signed in and do you hold the ability*; a policy answers
*may you do it to this target*; step-up answers a different question entirely — **is the person at
the keyboard still the account holder**. A session that is hijacked, borrowed or simply left
unattended passes the first two layers perfectly.

What the layer *means* and where it sits belongs to
[architecture/authorization.md](../architecture/authorization.md). This page is the mechanical rules
only.

## Table of Contents

- [Reuse the framework's own check — never re-derive the comparison](#reuse-the-frameworks-own-check--never-re-derive-the-comparison)
- [One predicate, two shapes — the UI hint must call the guard, not copy it](#one-predicate-two-shapes--the-ui-hint-must-call-the-guard-not-copy-it)
- [A step-up refusal must never mask a permission refusal](#a-step-up-refusal-must-never-mask-a-permission-refusal)
- [The refusal is a direct throw, and is not a 403](#the-refusal-is-a-direct-throw-and-is-not-a-403)
- [Hang the guard off the narrowest condition that describes the privileged write](#hang-the-guard-off-the-narrowest-condition-that-describes-the-privileged-write)
- [Confirmed safe — verified mechanics a later story should not re-derive](#confirmed-safe--verified-mechanics-a-later-story-should-not-re-derive)
- [⚠️ Open items this layer does not close](#-open-items-this-layer-does-not-close)

## Reuse the framework's own check — never re-derive the comparison

`password.confirm` resolves to `Illuminate\Auth\Middleware\RequirePassword`, which is already the
sole protection on `settings/security`. A second freshness rule — a Users-specific window, a
different session key, a `>=` where the vendor uses `>` — is a second thing to keep in sync, and the
drift is silent in both directions (an over-strict copy annoys administrators into clicking through;
an under-strict copy quietly widens the window the control exists to close).

✅ Good — the shipped guard, the single implementation in the app. Same session key, same config key,
and the exact negation of the vendor's comparison:

```php
// app/Actions/Auth/EnsureRecentPasswordConfirmation.php
public function isRecentlyConfirmed(): bool
{
    $elapsedSeconds = Date::now()->unix() - session('auth.password_confirmed_at', 0);

    return $elapsedSeconds <= (int) config('auth.password_timeout');
}
```

```php
// vendor/laravel/framework/src/Illuminate/Auth/Middleware/RequirePassword.php — the source of truth
$confirmedAt = Date::now()->unix() - $request->session()->get('auth.password_confirmed_at', 0);

return $confirmedAt > ($passwordTimeoutSeconds ?? $this->passwordTimeout);
```

Verified against `laravel/framework` 13.19.0, and by execution rather than by reading: a confirmation
exactly `config('auth.password_timeout')` seconds old is **still valid** and one second older is not.
`tests/Feature/Users/UpdateUserStepUpAuthorizationTest.php` pins both sides of that boundary with
`Carbon::setTestNow()` — a boundary asserted from one side only cannot tell `>` from `>=`.

❌ Bad — a per-call-site inline comparison, or a new config key (adapted to illustrate; not present
in the repo):

```php
// anti-pattern — a second freshness rule, and a second timeout to keep in sync
if (time() - session('auth.password_confirmed_at', 0) >= config('users.step_up_timeout')) {
    abort(403);
}
```

## One predicate, two shapes — the UI hint must call the guard, not copy it

This screen shows a warning *before* the administrator commits to a change, which means a second
place in the codebase asks "is the confirmation fresh?". The rule is the same one the
`Gate::allows()` row-action hints follow: **the hint calls the guard's own predicate.** The throwing
form must be a wrapper around the non-throwing one, never a parallel implementation.

✅ Good — `__invoke()` is three lines of branching over `isRecentlyConfirmed()`, so there is exactly
one comparison in the app:

```php
// app/Actions/Auth/EnsureRecentPasswordConfirmation.php
public function __invoke(): void
{
    if (! $this->isRecentlyConfirmed()) {
        throw new PasswordConfirmationRequiredException(/* … */);
    }
}
```

```php
// app/Livewire/Users/Index.php — the view's gate reads the same predicate
#[Computed]
public function requiresPasswordConfirmation(): bool
{
    return ! app(EnsureRecentPasswordConfirmation::class)->isRecentlyConfirmed();
}
```

The notice itself carries no capability — it is a `flux:callout` with a `data-test` hook and no
password field. Removing it client-side changes nothing server-side, which is the property that makes
it safe to render from a client-reachable computed property at all.

## A step-up refusal must never mask a permission refusal

This is the rule most easily inverted, and inverting it produces the *opposite* of the control's
intent — it was task 0015a's own round-1 Phase 2 finding. Two independent harms:

1. **A needless credential surface.** Prompting an actor who may not perform the action at all to
   re-enter their password invites them to type it in response to a request that was going to be
   refused regardless.
2. **A disclosure.** Reaching a step-up prompt proves the target row resolved and that every
   preceding authorization check passed — information a refused actor should not receive.

**Rule: the guard runs strictly after every `Gate::authorize()` call on its branch, and still above
the first write.** Those two are simultaneously satisfiable here because the whole authorization
method runs above `__invoke()`'s `DB::transaction()`.

✅ Good — the shipped ordering in `authorizeRoleAndStatusChange()`: the two Super Admin direct
throws, then `promoteToAdministrator`/`downgrade`, then `updateSensitiveAttributes`, and only then:

```php
// app/Actions/Users/UpdateUser.php — last statement of authorizeRoleAndStatusChange()
if (! $isNoOpRoleChange || $statusChanged) {
    ($this->ensureRecentPasswordConfirmation)();
}
```

```php
// app/Livewire/Users/Index.php — deleteUser(), same ordering
Gate::authorize('delete', $target);

try {
    $ensureRecentPasswordConfirmation();
} catch (PasswordConfirmationRequiredException) { /* redirect to re-confirm */ }

$target->delete();
```

**A branch with no preceding `Gate` call is not an exemption.** On an ordinary-to-ordinary role
change neither `promoteToAdministrator` nor `downgrade` fires — the role still changed, so the guard
still must. "After every `Gate` call" is vacuously satisfied there, not skippable.

## The refusal is a direct throw, and is not a 403

Two separate properties, each load-bearing.

**Direct throw, not a `Gate` check.** `Gate::before` grants a Super Admin every ability before any
policy method runs, so a `Gate`-mediated step-up rule would be inert for exactly the most privileged
actor in the app. This is the same reasoning
[authorization-patterns.md](authorization-patterns.md#a-rule-that-must-bind-a-super-admin-actor-must-be-a-direct-throw-not-a-gate-check)
already records for the Super Admin tier guards, applied to a non-ability rule. Pinned by
`UpdateUserStepUpAuthorizationTest.php`'s "the step-up guard binds a Super Admin actor" case.

**423, never 403.** A 403 is indistinguishable from "you lack the permission", and the entire premise
of this refusal is that the actor *does* hold it. 423 is not invented for this app — it is the status
`RequirePassword::handle()` itself returns on its JSON branch for the identical condition.
`App\Exceptions\PasswordConfirmationRequiredException` follows `ImmutableRoleException` (403) and
`RoleInUseException` (409) byte-for-byte apart from the status, and must **not** extend
`AuthorizationException`.

Verified in vendor source rather than assumed: `Handler::render()` checks
`method_exists($e, 'render')` **first**, before `prepareException()` and before the debug renderer, so
this exception's 423 body is byte-identical at both `APP_DEBUG` settings and never carries a stack
trace — the same guarantee task 0012 recorded for `can:`-gated 403s, reached by a different route.
Keep the thrown message a **constant**: `render()` returns it into an `Illuminate\Http\Response` with
no escaping, so a future caller passing user-supplied text into the constructor would reflect it.

## Hang the guard off the narrowest condition that describes the privileged write

An over-block is a usability regression that trains administrators to click through the prompt, which
weakens the control. The guard must key off the booleans that describe the privileged write itself —
never a nearby, wider condition that happens to be in scope.

✅ Good — `! $isNoOpRoleChange || $statusChanged`: exactly "a role or status change is happening".

❌ Bad — reusing the condition immediately above it (adapted to illustrate; this is the mistake the
shipped code carries a comment against):

```php
// anti-pattern — this is the updateSensitiveAttributes gate's condition, and it is WIDER
if ($emailChanged || $statusChanged) {
    ($this->ensureRecentPasswordConfirmation)();
}
```

`$emailChanged` is in that condition because an email rewrite is a sensitive *attribute*, not because
it is a step-up trigger. Reusing it silently extends the guard to an email-only edit. The
disjointness that matters is pinned by a dedicated regression test ("an email-only change is accepted
and parked as pending despite a stale confirmation"), not by review.

## Confirmed safe — verified mechanics a later story should not re-derive

Each of these was verified by execution or by reading installed vendor source during task 0015a's
Phase 4 audit. Re-deriving them costs an hour each.

- **Absent key, and no session at all, both fail closed.** The `0` default makes "never confirmed"
  resolve to an unbounded elapsed time. Confirmed in a genuine console context (no started session):
  `isRecentlyConfirmed()` returns `false` and `__invoke()` throws. A caller outside a web request is
  *denied*, never exempted — matching the precedent task 0008a set for these same actions.
- **A future timestamp reads as fresh**, in this guard and in the vendor middleware alike. Not drift,
  and not reachable: the key is written only by
  `ConfirmablePasswordController::store()`, from `Date::now()->unix()`.
- **A logout clears it.** Both logout paths in this app (`App\Livewire\Actions\Logout` and
  `App\Listeners\RejectNonActiveUserLogin`) call `Session::invalidate()`, which flushes the key. Note
  that `SessionGuard::login()`'s `migrate(true)` regenerates the session **id** while *keeping* its
  data, so a logout that only called `Auth::logout()` would let the next user on that session inherit
  the previous one's confirmation. Neither path does; keep it that way.
- **The intended-URL round trip is a fixed route, not request input.**
  `redirect()->setIntendedUrl(route('users.index'))` writes a constant, and Fortify's
  `PasswordConfirmedResponse` pulls it with `redirect()->intended(...)`. Nothing between the two
  requests overwrites it — `password.confirm` carries `['web', 'Authenticate:web']` only, and
  `Authenticate` writes `url.intended` solely when redirecting an *unauthenticated* caller. No
  attacker-controlled value reaches it, so there is no open-redirect surface here.
- **`$this->redirect()`, not `redirect()->route()`.** A Livewire action method does not turn a
  returned `Redirector` into a browser navigation, and the refusal originates from a POST to
  `/livewire/update` rather than the GET `RequirePassword::redirectGuest()` normally handles — which
  is also why nothing populates `url.intended` for us. Both halves are only provable end to end;
  `tests/Browser/UsersIndexTest.php` pins the full round trip.
- **`RequirePassword` is not on Livewire 4's `PersistentMiddleware` allow-list**, so route middleware
  is not an option for a Livewire screen — it would guard the initial `GET` and leave every
  `/livewire/update` round trip, which is where the mutations actually run, unguarded. This is the
  worked example for the row
  [livewire-authorization.md](livewire-authorization.md) already carries.

## ⚠️ Open items this layer does not close

Named here so a later story does not read the layer's existence as coverage it does not have.

- **Creation is not step-up-gated.** A hijacked session holding `promoteToAdministrator` can still
  mint a new `Administrator` account (10/hour, per task 0015's limiter) with the invitation link
  delivered to an attacker-chosen address — a *durable* escalation that outlives the hijacked
  session, where promoting an existing user is not. Scope decision D1, recorded rather than derived.
- **An email change is not step-up-gated**, although it is the most direct account-seizure primitive
  on the screen: the verification link goes only to the **new** address and the account's current
  address is never notified, so confirming it rewrites `users.email`, sets `email_verified_at`, and
  a password reset then yields the account. `UserPolicy::updateSensitiveAttributes()` classifies an
  email rewrite as severity-equivalent to account takeover, which makes the exemption inconsistent
  with the app's own severity model. Scope decision D1.
- **`POST /user/confirm-password` is not rate-limited.** Verified: its middleware is
  `['web', 'Authenticate:web']`, `config/fortify.php`'s `limiters` names only `login`, `two-factor`
  and `passkeys`, and `ConfirmPassword::__invoke()` performs a bare `$guard->validate()` with no
  attempt counting or lockout. Step-up's only bypass is therefore an unthrottled online password
  oracle against the already-compromised account — while `/login` limits the same credential check to
  5/min.
- **A step-up refusal writes no audit record.** Both catch blocks in `App\Livewire\Users\Index`
  swallow the exception and redirect, so it never reaches the framework handler's `report()` either.
  Task 0015 added `Log::info` for created/updated/deleted on this exact screen; a refusal — the
  strongest available signal of an unattended or hijacked session — is currently invisible.
- **`settings/security` still relies on route middleware alone**, so its own `/livewire/update` round
  trips are not re-checked. Pre-existing, explicitly out of task 0015a's scope, and a candidate for
  its own story.

_Last updated: 2026-08-24 — Added from the Phase 4 audit of task 0015a (step-up authentication for
privileged Users actions), the first code in this repo to act on the `password.confirm` row of
[livewire-authorization.md](livewire-authorization.md)'s `PersistentMiddleware` table._
