# Soft-Delete Security Patterns

Rules established by the Phase 4 audit of task **0005** (soft-delete `users` + the trashed-target
delete guard), which put `Illuminate\Database\Eloquent\SoftDeletes` on `App\Models\User` — the app's
only authenticatable model. Every rule here exists because soft-deleting an **authenticatable** is a
different security problem from soft-deleting an ordinary domain row: the record that "no longer
exists" still carries credentials, role grants and relations.

## Table of Contents

- [The global scope *is* the sign-in refusal — there is no second check](#the-global-scope-is-the-sign-in-refusal--there-is-no-second-check)
- [A vendor relation is the one place that scope can be lost silently](#a-vendor-relation-is-the-one-place-that-scope-can-be-lost-silently)
- [Freeing an identifier means revoking everything keyed by its string, not just the row](#freeing-an-identifier-means-revoking-everything-keyed-by-its-string-not-just-the-row)
- [Adding SoftDeletes silently stops Spatie from detaching role grants](#adding-softdeletes-silently-stops-spatie-from-detaching-role-grants)
- [A deterministic placeholder written into a UNIQUE column still needs the 23000 catch](#a-deterministic-placeholder-written-into-a-unique-column-still-needs-the-23000-catch)
- [Confirmed safe: what the scope already covers](#confirmed-safe-what-the-scope-already-covers)

## The global scope *is* the sign-in refusal — there is no second check

Nothing in `app/` refuses a soft-deleted user's login. The refusal is entirely a side effect of
`SoftDeletingScope` being applied by `Illuminate\Auth\EloquentUserProvider`, which resolves every
authentication path through `$model->newQuery()` — and `newQuery()` registers global scopes:

```php
// vendor/laravel/framework/src/Illuminate/Auth/EloquentUserProvider.php
protected function newModelQuery($model = null)
{
    $query = is_null($model)
        ? $this->createModel()->newQuery()   // <- global scopes applied here
        : $model->newQuery();

    with($query, $this->queryCallback);

    return $query;
}
```

`retrieveById()` (every session request), `retrieveByToken()` (remember-me cookie),
`retrieveByCredentials()` (password login) and `PasswordBroker::getUser()` (reset / invitation) all
go through it. That single fact is what makes all of the following true at once: a trashed user
cannot log in, an already-signed-in user is logged out on their next request, their remember-me
cookie is inert, and their password-reset link resolves no user.

**The rule:** treat `SoftDeletingScope` on `App\Models\User` as a load-bearing authentication
control, not a query convenience. Any code that removes it for a user — `User::withTrashed()`,
`withoutGlobalScope(SoftDeletingScope::class)`, a custom `UserProvider`, or an
`Auth::provider()`/`viaRequest()` callback — is writing an authentication bypass unless it
re-establishes an explicit `deleted_at IS NULL` (or `! $user->trashed()`) check itself. There is no
`status`/`deleted_at` guard in a login pipeline to catch it. There is exactly one `withTrashed()`
call site in the whole repo today and it is in a test.

## A vendor relation is the one place that scope can be lost silently

`laravel/passkeys` signs a user in through a **relation**, not through the user provider:

```php
// vendor/laravel/passkeys/src/Http/Controllers/PasskeyLoginController.php
$guard->login($passkey->user, $request->remember());
```

`Passkey::user()` is a plain `belongsTo(Passkeys::userModel(), 'user_id')`, so it builds from
`User::newQuery()` and today correctly resolves `null` for a trashed owner — the refusal holds.
`tests/Feature/Auth/PasskeyAuthenticationTest.php` asserts exactly that relation, and it is asserting
a security control, not a data detail.

**The rule:** if a future story ever replaces the vendor `Passkey` model (`Passkeys::usePasskeyModel()`)
or makes `user()` resolve trashed owners for a restore/admin screen, `Passkeys::authorizeLoginUsing()`
**must** be registered in the same change to reject `$user->trashed()`. Making the relation
`withTrashed()` without that callback turns a soft-deleted account back into a fully loggable one,
and no other layer stops it. The same applies to any future non-provider login path (magic links,
SSO, impersonation) — each one re-introduces this question independently.

## Freeing an identifier means revoking everything keyed by its string, not just the row

`User::delete()` obfuscates `users.email` so the address becomes reusable. But
`password_reset_tokens` is keyed by the **email string** with no foreign key, and Laravel matches a
reset token by that string alone:

```php
// vendor/laravel/framework/src/Illuminate/Auth/Passwords/DatabaseTokenRepository.php
public function exists(CanResetPasswordContract $user, #[\SensitiveParameter] $token)
{
    $record = (array) $this->getTable()->where(
        'email', $user->getEmailForPasswordReset()
    )->first();

    return $record && ! $this->tokenExpired($record['created_at'])
        && $this->hasher->check($token, $record['token']);
}
```

So an unexpired token issued to the *old* holder of an address keeps validating for whoever holds
that address next — the previous owner's link sets the new account's password. Recycling an
identifier is therefore never a single-table operation.

**The rule:** whenever a delete/rename frees an identifier for reuse, the same transaction must
invalidate every artefact keyed by that identifier's *value* rather than by the row's key. In this
repo that is `password_reset_tokens` (invitation tokens and password resets both live there); a
future audit-log, mailing-list or notification-routing table keyed by address inherits the same
obligation. Ask "what else in this database joins on the string, not the id?" before declaring an
address freed.

The implemented revocation in `App\Models\User::delete()` captures the pre-obfuscation value with
`getRawOriginal('email')` — deliberately, because `$this->email` is already a *derived* value here
and the raw column is what the row actually held:

```php
// app/Models/User.php
$originalEmail = $this->getRawOriginal('email');

DB::table('password_reset_tokens')->where('email', $originalEmail)->delete();

$this->forceFill([...])->saveQuietly();
```

### Corollary: the revocation key must be normalised the way the *consumer* normalises it

Deleting by the right string is not the same as deleting by the stored string. Two facts about
`users.email` in this repo pull in opposite directions:

- **Writes are not uniformly normalised.** `App\Actions\Users\CreateUser` and
  `App\Livewire\Settings\Profile` both `Str::lower()` before writing, but
  `App\Actions\Fortify\CreateNewUser` (self-registration) passes `$input['email']` through verbatim
  and `ProfileValidationRules::emailRules()` has no lowercasing rule — so a mixed-case
  `users.email` is reachable.
- **The token table is always lowercase.** `DatabaseTokenRepository::create()` keys the row on
  `$user->getEmailForPasswordReset()`, which returns `$this->email` and therefore passes through
  `User::email()`'s `strtolower()` read accessor.

So the raw column and the token key can differ in case, and the `where('email', $originalEmail)`
above matches only because `config/database.php` pins the connection to `utf8mb4_unicode_ci` — a
**case-insensitive** collation doing the normalisation implicitly.

**The rule:** never let a collation be the thing that makes a revocation query match. A revocation
query is a security control, and a control that silently depends on a config default breaks
silently when the default changes — moving to Postgres, to SQLite, or to a `_bin`/`_cs` collation
turns this delete into a no-op and reopens the takeover path with no test failure. Normalise
explicitly in the query, covering both spellings so a legacy mixed-case token row is caught too:

```php
$originalEmail = $this->getRawOriginal('email');

DB::table('password_reset_tokens')
    ->whereIn('email', array_unique([$originalEmail, Str::lower($originalEmail)]))
    ->delete();
```

The same reasoning applies to the *test* for any such revocation: seeding the row with a
hand-written `DB::table(...)->insert()` proves only that the delete matches your own fixture. Drive
it through the real producer (`Password::broker()->createToken($user)`) at least once, so the test
would fail if the producer's key format and the revoker's ever drift apart.

## Adding SoftDeletes silently stops Spatie from detaching role grants

`spatie/laravel-permission` boots a `deleting` listener that detaches the model's roles and
permissions — but it opts out for soft deletes:

```php
// vendor/spatie/laravel-permission/src/Traits/HasRoles.php
static::deleting(function ($model) {
    if (method_exists($model, 'isForceDeleting') && ! $model->isForceDeleting()) {
        return;   // soft delete: pivots are KEPT
    }
    // ...
    $model->roles()->detach();
});
```

The moment `SoftDeletes` landed on `User`, `method_exists()` started returning `true` and this
behaviour flipped: `model_has_roles` / `model_has_permissions` rows now survive a delete. That is the
desired outcome for story 0005 ("role assignments untouched"), and it is safe *today* only because
the `SoftDeletingScope` keeps the trashed user out of every authenticated request.

**The rule:** a soft-deleted account retains its privileges, including `Super Admin`. Any restore
flow must therefore treat role re-grant as an explicit, separately authorized decision — `restore()`
alone silently reinstates whatever the row held at delete time, and this repo has no restore call
site yet precisely so that decision has not been made by default. Equally, any future report that
counts privilege holders by querying the pivot tables directly (rather than through
`Role::users()` / `User::query()`, which are scoped) will count deleted users as administrators.

## A deterministic placeholder written into a UNIQUE column still needs the 23000 catch

Every other writer of `users.email` / `users.pending_email` in this repo treats a duplicate-key error
as an expected outcome and converts it into a refusal — `App\Actions\Users\RequestEmailChange`,
`App\Actions\Users\ConfirmEmailChange` and `App\Actions\Users\CreateUser` all carry the same shape:

```php
// app/Actions/Users/ConfirmEmailChange.php
try {
    $locked->forceFill([...])->save();
} catch (QueryException $e) {
    if ($e->getCode() === '23000') {
        return false;
    }

    throw $e;
}
```

`User::delete()`'s obfuscation write targets the same unique column and is the one writer without
that catch. "Collision-proof because it is derived from an immutable UUID" is only true against
*other placeholders*: nothing stops a live row from already holding `deleted+<uuid>@deleted.invalid`,
because that string passes the `email` validation rule and the uniqueness rules see it as free.

**The rule:** derivation from a unique key proves the value cannot collide with *itself*, never that
it cannot collide with attacker-chosen input. Any write into a `UNIQUE` column either catches
SQLSTATE `23000` or is preceded by a rule that makes the value un-typeable by a user — and the
reserved `@deleted.invalid` namespace this repo uses for tombstones should be rejected by
`App\Concerns\ProfileValidationRules::emailRules()` so it stays reserved.

## Confirmed safe: what the scope already covers

Verified during this audit and worth not re-deriving:

- **Route-model binding.** `Model::resolveRouteBinding()` builds from `newQuery()`, so a trashed
  user's UUID 404s on every `{user}` route, including the unauthenticated `email-change.confirm`.
- **`Rule::unique(User::class)` does *not* apply the scope.** `DatabaseRule::resolveTableName()`
  reduces the model class to a raw table name, so validation sees trashed rows. That is the correct
  behaviour here — it is what keeps a live user from claiming a tombstone address — but it means
  uniqueness validation and `User::query()` deliberately disagree about what exists.
- **`Index::loadUsers()` and `Index::usersSummary()`** both build from a bare `User::query()`, so the
  list and both header counts exclude trashed users with no component change.
- **Sessions.** `sessions` rows survive the delete, but `retrieveById()` re-resolves the user on every
  request through the scope, so an in-flight session stops authenticating immediately. No explicit
  session-invalidation step is required for that alone.

_Last updated: 2026-08-14 — created by the Phase 4 audit of task 0005 (soft-delete users +
administrator-level protection guard); the identifier-revocation section extended during the
post-fix re-audit with the implemented `getRawOriginal()` capture and the corollary that the
revocation key must be normalised explicitly rather than by collation._
