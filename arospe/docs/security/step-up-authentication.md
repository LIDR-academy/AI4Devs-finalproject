# Step-up authentication

Durable rules for the app's **third** authorization layer, established by task 0015a — the
password-confirmation freshness guard on the Users screen's role change, status change, third-party
email change, deletion, and Administrator-tier creation. Route middleware answers *are you signed in
and do you hold the ability*; a policy answers
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
- [Closed after the first Phase 4 audit, by human decision rather than by the original scope](#closed-after-the-first-phase-4-audit-by-human-decision-rather-than-by-the-original-scope)
- [⚠️ Open items this layer still does not close](#-open-items-this-layer-still-does-not-close)

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

**The rule extends to a notice's *exemptions*, not only to whether it fires at all.** Both Users
modals also gate on `isEditingOwnRow()` / `isDeletingOwnRow()` (`App\Livewire\Users\Index`, Phase 4
re-audit finding N6) — a self-edit reaches no step-up check, and `deleteUser()` no-ops silently on the
actor's own row (story 0015's F11) rather than throwing, so a notice with no self-row exemption would
promise a re-confirmation prompt a click would never produce. The delete modal shipped with exactly
that gap once: `isDeletingOwnRow()` did not exist yet, so its notice rendered on the actor's own row
regardless of freshness. Closed in the same N6 pass that added the predicate.

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
if (! $isNoOpRoleChange || $emailChanged || $statusChanged) {
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
never a nearby, wider condition that happens to be in scope *and* never a narrower one that leaves a
privileged write uncovered. Both directions are mistakes; task 0015a made one of each, in two rounds.

**Round 1 (Phase 3) got the direction of the mistake right and the boundary wrong.** The original
condition was `! $isNoOpRoleChange || $statusChanged` — deliberately narrower than the
`updateSensitiveAttributes` gate's own `$emailChanged || $statusChanged` immediately above it in the
same method, specifically to exempt an email-only edit. That exemption was correct for a *self-service*
email change (there is no third party to protect), but the same narrow condition also exempted a
**third-party** email change — and `UserPolicy::updateSensitiveAttributes()`'s own docblock already
called an email rewrite "severity-equivalent to account takeover". Phase 4 finding F2 (decision D7)
closed it.

✅ Good — the shipped condition, widened by F2. It is exactly `updateSensitiveAttributes`'s own
condition, evaluated only for a non-self edit (`authorizeRoleAndStatusChange()` is reached only when
`! $isSelfEdit` — see `__invoke()`), which is what keeps the self-service exemption intact without a
second flag inside this method:

```php
// app/Actions/Users/UpdateUser.php — last statement of authorizeRoleAndStatusChange(),
// reached only when ! $isSelfEdit
if (! $isNoOpRoleChange || $emailChanged || $statusChanged) {
    ($this->ensureRecentPasswordConfirmation)();
}
```

❌ Bad — the story's own Phase 3 shape, narrower than the sensitive-attributes gate one line above it
for no stated reason once a third party is involved (adapted to illustrate; no longer present in the
repo):

```php
// anti-pattern — exempts a THIRD-PARTY email change from step-up, contradicting
// UserPolicy::updateSensitiveAttributes()'s own "severity-equivalent to account takeover" rule
if (! $isNoOpRoleChange || $statusChanged) {
    ($this->ensureRecentPasswordConfirmation)();
}
```

The disjointness that matters — a third-party email-only change is refused, a self-service one is not
— is pinned by two dedicated regression tests in
`tests/Feature/Users/UpdateUserStepUpAuthorizationTest.php`: "a third-party email-only change is
refused when the confirmation is stale, and the pending email is left unset" and "a self-service
email-only change is accepted and parked as pending despite a stale confirmation". Not by review alone
— the self-edit exemption is structural (`$isSelfEdit`), so the two cases cannot be conflated by a
future edit to this one `if`.

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

## Closed after the first Phase 4 audit, by human decision rather than by the original scope

The first Phase 4 audit (Phase 3's shipped code) found four gaps that left open exactly the class of
escalation this layer exists to close. All four were escalated per
[contracts.md](../contracts.md)'s Uncertainty Handling Rule and approved; a **re-audit** then verified
each fix rather than taking the commit message's word for it (`docs/errors-log.md`'s own precedent —
a fix is new code to be audited as such). Recorded as ❌/✅ pairs, not deleted, so a later reader does
not have to reconstruct what "closed" means from the diff alone.

- **Creation was not step-up-gated (decision D6, finding F1) — closed.** A hijacked session holding
  `promoteToAdministrator` could still mint a new `Administrator` account (10/hour, per task 0015's
  limiter) with the invitation link delivered to an attacker-chosen address — a *durable* escalation
  that outlives the hijacked session, where promoting an existing user is not.

  ❌ Before — `App\Actions\Users\CreateUser` authorized the Administrator-tier branch and stopped:
  ```php
  Gate::authorize('promoteToAdministrator', User::class);
  // no step-up check — a hijacked session could mint a new Administrator account outright
  ```
  ✅ After — the guard fires immediately after that Gate call, never before it, so a caller lacking
  `roles.manage-administrators` always sees the permission refusal:
  ```php
  // app/Actions/Users/CreateUser.php
  Gate::authorize('promoteToAdministrator', User::class);
  ($this->ensureRecentPasswordConfirmation)();
  ```
  Ordinary-role creation reaches no step-up check at all — deliberately narrow, per
  `tests/Feature/Users/CreateUserStepUpAuthorizationTest.php`.

- **A third-party email change was not step-up-gated (decision D7, finding F2) — closed.** The most
  direct account-seizure primitive on the screen: the verification link goes only to the **new**
  address, the account's current address is never notified, and `UserPolicy::updateSensitiveAttributes()`
  already classifies an email rewrite as severity-equivalent to account takeover. See
  [Hang the guard off the narrowest condition](#hang-the-guard-off-the-narrowest-condition-that-describes-the-privileged-write)
  above for the shipped ❌/✅ pair. A **self-service** email change (the actor's own address) stays
  exempt — structurally, since `authorizeRoleAndStatusChange()` is reached only when `! $isSelfEdit`.

- **`POST /user/confirm-password` was not rate-limited (decision D8, finding F3) — closed.** Verified
  at the time: `ConfirmablePasswordController::store()`'s route carried no throttle at all —
  `config/fortify.php`'s `limiters` names only `login`, `two-factor` and `passkeys` — so once this
  layer made that endpoint the sole barrier in front of
  role/status/delete/promote-to-Administrator/third-party-email-change, an attacker holding a
  hijacked session could guess the account's own password against it without limit.

  ✅ `App\Providers\FortifyServiceProvider::configurePasswordConfirmationRateLimiting()` appends
  `throttle:confirm-password` (5/min, keyed by user id when authenticated, else IP — matching
  Fortify's own `login` limiter's shape) to the already-registered vendor route from an
  `$this->app->booted()` callback, since Fortify's `routes.php` consults no `config('fortify.limiters.*')`
  key for this route and there is therefore no config hook to wire a limiter through the normal way.
  Re-audit finding N2 added a direct test that the middleware is actually attached
  (`tests/Feature/Auth/PasswordConfirmationTest.php`), independent of whether a request happens to
  trip the limit — the attachment mechanism (mutating an already-booted route object) has no config
  or migration to make its absence loud otherwise.

- **A step-up refusal wrote no audit record (finding F4) — closed.** Both catch blocks in
  `App\Livewire\Users\Index` (`save()`, `deleteUser()`) now emit `Log::warning('Step-up password
  confirmation required', ['actor_id' => ..., 'action' => ..., 'user_id' => ...])` before redirecting
  — matching the `Log::info` shape task 0015's finding F5 already established on this same class for
  successful mutations. A step-up refusal is the strongest available signal of a hijacked or
  unattended session; it is no longer invisible to the audit trail.

## ⚠️ Open items this layer still does not close

- **`settings/security` still relies on route middleware alone**, so its own `/livewire/update` round
  trips are not re-checked for password freshness. Pre-existing, explicitly out of task 0015a's scope,
  and a candidate for its own follow-up story.
- **`settings/profile` (`profile.edit`) lets an actor change their own email with no step-up check at
  all (re-audit finding N5).** This is the *same* self-service email change this layer's own
  `$isSelfEdit` exemption leaves alone on the Users screen — but for a different reason there (there is
  no third party to protect on that screen). Under this layer's own hijacked-session threat model the
  account holder is the party at risk from their own address being rewritten with no re-confirmation,
  so gating `UpdateUser` alone closes nothing while this wider-open door on `settings/profile` stays
  open. Recorded as a residual rather than closed in this story, since a `settings/profile` step-up
  check is a different screen's story with its own tests.

_Last updated: 2026-08-24 — Task 0015a, Phase 5 code review finding F-3: this page was authored during
the first Phase 4 audit (Phase 3's shipped code) and never revisited after the widened, human-approved
fixes (F1/F2/F3/F4, decisions D6/D7/D8) and the Phase 4 re-audit that verified them — the exact failure
[errors-log.md](../errors-log.md#a-security-page-documented-the-vulnerable-code-as-current-because-it-was-written-before-its-own-fix--2026-08-20)
already names, recurring one story later. Corrected the stale `! $isNoOpRoleChange || $statusChanged`
code quote (now `|| $emailChanged`), rewrote "Hang the guard off the narrowest condition" around the
two-round history rather than a single ❌/✅ pair that labelled the shipped, decision-D7-approved
behaviour an anti-pattern, and converted four of the five "Open items" into closed ❌/✅ pairs — the
fifth (`settings/security`) still holds, and a new one (`settings/profile`, N5) replaces the closed
email-change item as this layer's remaining known-open door._

_Previously: 2026-08-24 — Added from the Phase 4 audit of task 0015a (step-up authentication for
privileged Users actions), the first code in this repo to act on the `password.confirm` row of
[livewire-authorization.md](livewire-authorization.md)'s `PersistentMiddleware` table._
