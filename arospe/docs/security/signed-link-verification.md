# Signed-Link Verification Patterns

Durable rules established while auditing task **0003** (user status & email-verification lifecycle),
which introduced this repo's first app-owned signed route, `email-change.confirm`. Everything below
is a **confirmed-safe pattern already in the code** — the per-review finding list for 0003 lives in
the audit response, not here.

## Table of Contents

- [`ValidateSignature` must run before `SubstituteBindings`](#validatesignature-must-run-before-substitutebindings)
- [Normalise before you hash, not after](#normalise-before-you-hash-not-after)
- [A pre-flight check is not a race guard — re-check under a lock, and let the unique index have the last word](#a-pre-flight-check-is-not-a-race-guard--re-check-under-a-lock-and-let-the-unique-index-have-the-last-word)
- [A refusal must be indistinguishable from every other refusal](#a-refusal-must-be-indistinguishable-from-every-other-refusal)

## `ValidateSignature` must run before `SubstituteBindings`

A signed route whose URI carries a **route-model-bound** parameter (`{user}`) leaks information if the
binding resolves first: tampering with `{user}` produces `ModelNotFoundException` → **404**, while
tampering with any other segment produces **403**. The difference is an oracle for "does this user id
exist", answerable without any valid signature.

`bootstrap/app.php` fixes this globally rather than per route:

```php
// bootstrap/app.php
$middleware->prependToPriorityList(
    before: SubstituteBindings::class,
    prepend: ValidateSignature::class,
);
```

Verified side effects across the whole `web` pipeline (re-verify these if the list changes):

- Only two routes carry `signed` today — `email-change.confirm` and Fortify's `verification.verify`.
  Fortify's `VerifyEmailController::__invoke(VerifyEmailRequest $request)` has **no** bound model, so
  the reorder is a no-op for its behaviour.
- Laravel's default priority list places `ThrottleRequests` **before** `SubstituteBindings`, so
  inserting `ValidateSignature` immediately before `SubstituteBindings` leaves it **after** the
  throttle. That is the order you want: rate limiting still applies to requests that fail the
  signature check, instead of being skipped by an early 403.
- `Authenticate` also sits earlier in the priority list, so a route carrying both `auth` and `signed`
  still authenticates first.

**Rule:** any new signed route with a `{model}` segment relies on this priority entry. It is silent
when it regresses, so it must stay covered by a test that tampers with the **bound** segment and
asserts **403** — not merely "no change happened". `tests/Feature/Settings/EmailChangeTest.php`'s
tamper dataset is that test.

## Normalise before you hash, not after

When a link is bound to a value by hashing it (`sha1($address)` as an address-binding token), the
value that is **persisted** and the value that is **hashed** must be the same normalised string, and
normalisation must therefore be the action's *first* statement:

```php
// app/Actions/Users/RequestEmailChange.php
public function __invoke(User $user, string $newEmail): void
{
    $newEmail = Str::lower($newEmail);          // step 0, before anything reads $newEmail
    // ...
    $user->forceFill(['pending_email' => $newEmail])->save();

    Notification::route('mail', $newEmail)
        ->notify(new PendingEmailVerification($user, $newEmail));
}
```

Normalising later — or persisting the normalised value while handing the raw one to the notification —
yields `sha1('MARTA@X.COM') !== sha1('marta@x.com')`. The failure is **silent**: the link is still
validly signed, so it passes `ValidateSignature` and is then refused by the receiving side's
`hash_equals()` check as an ordinary "link no longer valid" redirect. Nothing throws, nothing 500s,
nothing is logged, and every mixed-case request is quietly broken.

**Rule:** a downstream consumer of an already-normalised value (here
`App\Notifications\PendingEmailVerification`) must **not** re-normalise defensively — that hides the
ordering bug instead of surfacing it. Assert the emitted `hash` parameter directly in a test; a
round-trip test can pass while both sides are wrong in the same direction.

## A pre-flight check is not a race guard — re-check under a lock, and let the unique index have the last word

Request-time validation and the write are not atomic. `App\Actions\Users\ConfirmEmailChange` layers
three independent guards, and all three are required:

```php
return DB::transaction(function () use ($user, $email): bool {
    $locked = User::query()->lockForUpdate()->findOrFail($user->getKey());   // 1. lock the row

    if ($locked->pending_email !== $email) {
        return false;                                                        // replayed / superseded
    }

    $addressTaken = User::query()->whereKeyNot($locked->getKey())            // 2. re-check availability
        ->where(fn ($q) => $q->where('email', $email)->orWhere('pending_email', $email))
        ->exists();

    if ($addressTaken) {
        return false;
    }

    try {
        $locked->forceFill([...])->save();
    } catch (QueryException $e) {
        if ($e->getCode() === '23000') {                                     // 3. the unique index wins
            return false;
        }
        throw $e;
    }
    // ...
});
```

Guard 2 alone is **not** sufficient: two users confirming the same address concurrently lock two
*different* rows, so neither blocks the other and both can pass the `exists()` check. What actually
prevents two verified accounts sharing one address is the `users.email` unique index, surfaced as
SQLSTATE `23000` and translated into the same refusal. Guard 2 exists to turn the common case into a
clean message rather than a caught exception.

**Rule:** `lockForUpdate()` on the row you are writing does not serialise checks against *other* rows.
Any "is this value still free?" check must be backed by a real unique index, and the `23000` catch is
the guard — never the pre-flight query. Note `QueryException::getCode()` returns the **SQLSTATE**
string; only `23000` may be converted, everything else must be rethrown so genuine database faults are
not swallowed as business outcomes.

## A refusal must be indistinguishable from every other refusal

`App\Http\Controllers\ConfirmEmailChangeController` has two refusal branches — the pre-flight
`hash_equals()` mismatch, and `ConfirmEmailChange` returning `false` — and both flash the same
`users.email_change.refused` copy:

```php
// app/Http/Controllers/ConfirmEmailChangeController.php
if ($user->pending_email === null || ! hash_equals(sha1($user->pending_email), $hash)) {
    return redirect()->route('profile.edit')->with('status', __('users.email_change.refused'));
}

if (! $confirmEmailChange($user, $user->pending_email)) {
    return redirect()->route('profile.edit')->with('status', __('users.email_change.refused'));
}
```

Distinct copy per branch would tell the holder of a stale link *which* check failed — in particular
that the address is now taken by someone else, which is information about a third party's account.

Two related rules this shape encodes:

- **`hash_equals()`, never `===`,** for comparing a supplied token against a computed one, even when
  the token is not itself secret. The signature is the authenticator; the hash is only the binding.
- **The action returns `bool` and the caller branches on it.** A controller that calls the action and
  then unconditionally flashes the success copy tells the user their address changed when it did not.
  A test asserting only "the stored address is unchanged" passes against that bug — assert the
  response copy too.

_Last updated: 2026-08-12 — Created during the Phase 4 audit of task 0003 (user status &
email-verification lifecycle)._
