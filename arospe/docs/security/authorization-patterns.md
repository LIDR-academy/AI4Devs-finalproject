# Authorization Patterns

Rules for working with the `spatie/laravel-permission` authorization foundation established by task
0002. Every rule below was derived from reading the installed vendor source (`spatie/laravel-permission`
8.3.0, `laravel/framework` 13) rather than from documentation, because the package's own docs do not
make these distinctions explicit.

## Table of Contents

- [The Super Admin bypass does not cover every check](#the-super-admin-bypass-does-not-cover-every-check)
- [Flush the permission cache after the transaction commits, never inside it](#flush-the-permission-cache-after-the-transaction-commits-never-inside-it)
- [Always pass the guard to hasRole() / hasAnyRole()](#always-pass-the-guard-to-hasrole--hasanyrole)
- [Read the Super Admin role name with a literal default](#read-the-super-admin-role-name-with-a-literal-default)
- [Gate::before closures must tolerate any authenticatable](#gatebefore-closures-must-tolerate-any-authenticatable)
- [permission: and role: middleware are not a substitute for auth](#permission-and-role-middleware-are-not-a-substitute-for-auth)
- [An ability must cover every attribute that achieves its effect, not only the operation it is named after](#an-ability-must-cover-every-attribute-that-achieves-its-effect-not-only-the-operation-it-is-named-after)
- [Confirmed safe: role-name collision is closed by the database, not by PHP](#confirmed-safe-role-name-collision-is-closed-by-the-database-not-by-php)

## The Super Admin bypass does not cover every check

The bypass installed in [`app/Providers/AppServiceProvider.php`](../../app/Providers/AppServiceProvider.php)
is a **`Gate`** hook:

```php
// app/Providers/AppServiceProvider.php
protected function configureAuthorization(): void
{
    Gate::before(function (mixed $user): ?bool {
        if (! $user instanceof User) {
            return null;
        }

        $superAdminRoleName = config('auth.super_admin.role', 'Super Admin') ?? 'Super Admin';

        return $user->hasRole($superAdminRoleName, 'web') ? true : null;
    });
}
```

`Gate::before` only runs for calls that route through Laravel's Gate. Spatie's own `HasRoles` /
`HasPermissions` methods query the user's relations directly and never consult the Gate. The resulting
coverage matrix is **not** intuitive, and was verified against the vendored middleware:

| Check | Goes through the Gate? | Super Admin bypassed? |
| --- | --- | --- |
| `$user->can('products.delete')` / `Gate::allows(...)` / `authorize(...)` | yes | ✅ |
| `@can('products.delete')` in Blade | yes | ✅ |
| `->middleware('permission:products.delete')` | yes — `PermissionMiddleware` calls `$user->canAny()` | ✅ |
| `->middleware('role_or_permission:Super Admin\|roles.manage')` | yes — calls `$user->canAny()` first | ✅ |
| `->middleware('role:Administrator')` | **no** — `RoleMiddleware` calls `$user->hasAnyRole()` | ❌ **403 for a Super Admin** |
| `$user->hasPermissionTo('products.delete')` | **no** | ❌ |
| `$user->hasRole('Administrator')` | **no** | ❌ |
| `@role('Administrator')` / `@hasPermission(...)` Blade directives | **no** | ❌ |

✅ Good — gate a route or component on a **permission**, so the Super Admin bypass applies:

```php
Route::livewire('roles', Index::class)->middleware('can:roles.manage')->name('roles.index');
```

❌ Bad — gating on a role name locks the Super Admin out of the screen it is supposed to own:

```php
// anti-pattern — a Super Admin holds no Administrator role and hasAnyRole() ignores Gate::before
Route::livewire('roles', Index::class)->middleware('role:Administrator');
```

**Rule.** Gate on permissions (`can:`, `permission:`, `$user->can()`), not on role names. If a role
check is genuinely required, it must explicitly admit the Super Admin as well —
`role_or_permission:Super Admin|<permission>` is the safe form, because its `canAny()` call reaches the
Gate. Never "fix" a Super Admin lockout by granting the Super Admin a second role or by weakening the
gate: that dissolves the single-source-of-truth property the bypass exists to provide.

## Flush the permission cache after the transaction commits, never inside it

`config/permission.php` caches the whole roles+permissions graph for **24 hours** on the
**`database`** cache store (`CACHE_STORE=database`), which is **shared across every web worker** —
it is not a per-process cache. `PermissionRegistrar::loadPermissions()` fills that cache with
`Cache::remember(...)`, so whichever process misses first writes the snapshot every other process
then reads for 24 hours.

That makes the *ordering* of `forgetCachedPermissions()` relative to a transaction commit
security-relevant:

❌ Bad — flushing inside the transaction leaves a window in which a concurrent web request can miss
the cache, read the **pre-commit** (old) rows, and cache them for 24 hours:

```php
// anti-pattern
DB::transaction(function (): void {
    // ... write roles/permissions/grants ...
    app(PermissionRegistrar::class)->forgetCachedPermissions();
}); // <-- a concurrent request between the flush and this COMMIT re-caches the OLD graph
```

This fails **open** whenever the write was a *revocation*: a re-seed that strips an over-granted
permission from a role appears to succeed, while every worker keeps honouring the escalated grant
until the cache expires.

✅ Good — flush again *after* the commit, so the re-populated cache can only ever be filled from
committed state:

```php
DB::transaction(function (): void {
    // ... write roles/permissions/grants ...
    // An in-transaction flush is still needed here so syncPermissions() resolves the
    // permissions this transaction just inserted rather than a stale in-memory collection.
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    // ...
});

app(PermissionRegistrar::class)->forgetCachedPermissions();
```

**Rule.** Any transaction that writes `roles`, `permissions`, or `role_has_permissions` must call
`app(PermissionRegistrar::class)->forgetCachedPermissions()` **after** `DB::transaction()` returns
(or via `DB::afterCommit()`), in addition to any flush it needs *inside* the transaction for its own
correctness.

**Testing caveat.** `phpunit.xml` sets `CACHE_STORE=array`, so the permission cache is per-process in
tests. No test in this suite can reproduce the cross-worker window above — it must be prevented by
construction, not caught by a test.

## Always pass the guard to hasRole() / hasAnyRole()

`Spatie\Permission\Traits\HasRoles::hasRole()` only filters by guard when a guard is **explicitly
passed**:

```php
// vendor/spatie/laravel-permission/src/Traits/HasRoles.php
if (is_string($roles)) {
    return $guard
        ? $this->roles->where('guard_name', $guard)->contains('name', $roles)
        : $this->roles->contains('name', $roles);   // <-- no guard filter
}
```

A role row named `Super Admin` on **any** guard therefore satisfies `hasRole('Super Admin')`. The
`roles` table's unique index is on `(name, guard_name)`, so a second `('Super Admin', 'api')` row is
creatable at the database level.

**Rule.** Security-critical role checks pass the guard explicitly:

```php
$user->hasRole(config('auth.super_admin.role', 'Super Admin'), 'web');
```

Correspondingly, any code path that creates roles must pin `guard_name` to `web` and must not expose
it as user input.

## Read the Super Admin role name with a literal default

`config('auth.super_admin.role')` returns `null` if the key is absent — most realistically when a
deployment serves a `bootstrap/cache/config.php` built **before** the `super_admin` block was added to
`config/auth.php`. `hasRole(null)` matches none of the trait's type branches and reaches its final
`throw new TypeError(...)`, so **every** authorization check in the app throws — a full outage, not a
degraded mode.

**`config()`'s own `$default` argument is not enough.** This is the non-obvious part, and it is why the
shipped code carries what looks like a redundant second fallback. `config($key, $default)` delegates to
`Arr::get()`, which substitutes `$default` only when a key segment is **missing** — a segment that
*exists* and holds `null` is returned as `null`:

```php
// vendor/laravel/framework/src/Illuminate/Collections/Arr.php
foreach (explode('.', $key) as $segment) {
    if (static::accessible($array) && static::exists($array, $segment)) {
        $array = $array[$segment];   // <-- present-but-null returns null, NOT $default
    } else {
        return value($default);
    }
}
```

`Arr::exists()` is `array_key_exists()`, so `'role' => null` counts as present. A config file (or a
cached config, or a test's `config(['auth.super_admin.role' => null])`) that sets the key explicitly to
`null` therefore still reaches `hasRole(null, 'web')` and still throws.

**Rule.** When reading a config value that must never be `null` at the call site, supply **both**
fallbacks — `config()`'s default for the missing-key case and `??` for the present-but-null case:

```php
$superAdminRoleName = config('auth.super_admin.role', 'Super Admin') ?? 'Super Admin';

$user->hasRole($superAdminRoleName, 'web');
```

Do not "simplify" this to one of the two. They cover different failure modes.

## Gate::before closures must tolerate any authenticatable

Laravel decides whether to invoke a before-callback **before** PHP type-checks it:

```php
// vendor/laravel/framework/src/Illuminate/Auth/Access/Gate.php
protected function canBeCalledWithUser($user, $class, $method = null)
{
    if (! is_null($user)) {
        return true;   // <-- the callback's parameter type is never consulted here
    }
    // ... guest handling ...
}
```

So a closure typed `fn (User $user)` is still called for *any* non-null authenticatable and raises a
`TypeError` if a second guard/provider ever resolves a different model.

The parameter type **does** still decide one thing: whether the callback runs for **guests**.
`callbackAllowsGuests()` reflects on the first parameter and skips the callback when no user is
authenticated *unless* the type allows null. `mixed` allows null, so the shipped closure is also invoked
with `$user === null` on every guest check — which is harmless precisely because the `instanceof` guard
is the first statement and returns `null` for it. Do not rely on the type hint to keep any class out of
the body; guard inside it.

```php
// app/Providers/AppServiceProvider.php — the shipped form
Gate::before(function (mixed $user): ?bool {
    if (! $user instanceof User) {
        return null;
    }

    $superAdminRoleName = config('auth.super_admin.role', 'Super Admin') ?? 'Super Admin';

    return $user->hasRole($superAdminRoleName, 'web') ? true : null;
});
```

**Rule.** A `Gate::before` callback in this project returns only `true` or `null` — **never `false`**,
which would hard-deny every other user before their real permissions were consulted — and never
assumes the authenticatable is `App\Models\User`. Enforce that with an `instanceof` check in the body,
not with a parameter type hint.

## permission: and role: middleware are not a substitute for auth

Spatie's middleware throws `UnauthorizedException::notLoggedIn()` for an unauthenticated request,
which renders as a bare **403** rather than a redirect to the login screen. It also resolves the user
from `Auth::guard($guard)` independently of any `auth` middleware.

**Rule.** Every route or route group gated with `permission:`, `role:`, or `role_or_permission:` must
also carry `auth` (and `verified`, matching `routes/web.php`'s existing dashboard group). Apply the
gate on the group, not per-route, so a route added later cannot be forgotten:

```php
Route::middleware(['auth', 'verified'])->group(function (): void {
    Route::middleware('permission:products.view')->group(function (): void {
        // ...
    });
});
```

## An ability must cover every attribute that achieves its effect, not only the operation it is named after

Established by finding **F1** of task 0004's Phase 4 audit, and the most transferable rule that audit
produced. `App\Policies\UserPolicy` gates three *operations* on an `Administrator`-holding target
behind `roles.manage-administrators` — `promoteToAdministrator`, `downgrade`, `delete`. The Users
editor enforced all three faithfully. It was still bypassable, because two plain **columns** on the
same edit form reach the same outcome without going through any of them:

- `status` → set an `Administrator` to `Suspended` and story 0007 refuses their sign-in. Functionally
  a `delete`, reached through `users.edit`.
- `email` → park a new address in `pending_email`; the attacker controls the mailbox the confirmation
  link is sent to, so completing it hands them the account. Functionally a takeover, again through
  `users.edit`.

The guard set was drawn around the *verbs the policy names* rather than around the *effects the
policy exists to prevent*. The rule:

> When you write an ability that protects a class of target, enumerate every writable attribute of
> that target and ask, for each one, "does changing this achieve what the ability forbids?" Every
> `yes` belongs behind the same ability.

✅ Good — the shipped fix, an ability that composes the base check and then applies the same
target-class rule the operation-shaped abilities apply:

```php
// app/Policies/UserPolicy.php
public function updateSensitiveAttributes(User $actor, User $target): bool
{
    if (! $this->update($actor, $target)) {
        return false;
    }

    if (! $target->hasRole('Administrator', 'web')) {
        return true;
    }

    return $actor->hasPermissionTo('roles.manage-administrators');
}
```

Two details of the call site that are load-bearing, not incidental
([`app/Livewire/Users/Index.php`](../../app/Livewire/Users/Index.php), `updateExistingUser()`):

- **The change-detection comparison must use the same normalisation on both sides, and the same one
  the writer uses to decide whether it is writing.** The guard fires only when an attribute actually
  changed, so a comparison that is *stricter* than the writer's leaves an unguarded write:

  ```php
  $emailChanged = Str::lower((string) $validated['email']) !== Str::lower((string) $target->getRawOriginal('email'));
  ```

  Both sides are lowercased, and `getRawOriginal()` is used rather than `$target->email` because
  `User`'s `email` accessor lowercases on read — reading through the accessor on one side and the raw
  column on the other is exactly how a false "unchanged" verdict gets manufactured. This is
  byte-identical to the comparison `App\Actions\Users\UpdateUser` itself makes before delegating to
  `RequestEmailChange`, which is what guarantees the guard cannot disagree with the write.

- **The guard runs before the action, so a denial cannot leave a partial write.** `UpdateUser` is not
  transactional today; both `Gate::authorize()` calls precede it.

❌ Bad — the pre-fix shape: only the role comparison is gated, so an unchanged `roleId` (which is what
the edit modal prefills) short-circuits `authorizeRoleChange()` and nothing else is checked:

```php
// anti-pattern — the shape F1 found
if ($applyRoleAndStatus) {
    $this->authorizeRoleChange($target, (int) $validated['roleId']);
}

$updateUser($target, $name, $email, $roleId, $status, $applyRoleAndStatus, $requestEmailChange);
```

**Known residual, deliberately deferred** (tracked on stories 0008/0010, extending findings F2/F3):
the predicate is *role*-shaped (`hasRole('Administrator', 'web')`) while the privilege it protects is
*permission*-shaped. A target holding `roles.manage-administrators` through a direct
`model_has_permissions` grant, or through a custom role that is not literally named `Administrator`,
is **not** covered by any of these four abilities. That is inert today — the seeded catalog grants no
permission directly to a user and ships only two roles — and becomes live the moment story 0010 lets
operators build administrator-equivalent roles. Whoever centralises the administrator-level rule must
key it on the privilege, not on the role name.

## Confirmed safe: role-name collision is closed by the database, not by PHP

Worth recording because the reasoning is non-obvious and someone will re-open the question. The
Super Admin bypass keys on a **name string**, which invites the question "can an attacker create a
colliding role?". The two layers move in opposite directions and, together, close it:

- **PHP side** — `Collection::contains('name', 'Super Admin')` compares with `==`, which for two
  non-numeric strings in PHP 8 is a byte-exact, case-sensitive comparison. `super admin`,
  `SUPER ADMIN`, and `Super Admin ` (trailing space) all **fail** to match.
- **Database side** — `roles` carries `unique(name, guard_name)` under `utf8mb4_unicode_ci`
  (`config/database.php`), which is case- **and** accent-insensitive. Any variant that PHP *would*
  match must be byte-identical, and any byte-identical row is rejected as a duplicate.

So the only string that grants the bypass is already occupied by the seeded row. Do not "harden" this
by lowercasing or trimming the comparison — that would *widen* the set of matching names and break the
property above. The remaining hardening is guard-scoping (see
[Always pass the guard](#always-pass-the-guard-to-hasrole--hasanyrole)).

_Last updated: 2026-08-13 — Added "An ability must cover every attribute that achieves its effect"
during the Phase 4 **re-audit** of task 0004 (finding F1's fix), including the normalisation rule for
the change-detection comparison that arms such a guard and the deferred role-shaped-predicate
residual._

_2026-08-09 — Updated during the Phase 4 **re-audit** of task 0002: the `Gate::before`
snippets now show the shipped guard-scoped, `instanceof`-guarded closure; the guest-handling guidance was
corrected (a `mixed` parameter admits guests, so the body must guard, not the type hint); and the
literal-default section now documents why `config($key, $default)` alone does not cover a
present-but-`null` key._
