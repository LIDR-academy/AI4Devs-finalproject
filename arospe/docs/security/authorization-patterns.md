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
- [A guard that reads a row's protected identity must distinguish "not hydrated" from "hydrated but null"](#a-guard-that-reads-a-rows-protected-identity-must-distinguish-not-hydrated-from-hydrated-but-null)
- [A rule that must bind a Super Admin actor must be a direct throw, not a Gate check](#a-rule-that-must-bind-a-super-admin-actor-must-be-a-direct-throw-not-a-gate-check)
- [Authorization that consults a relation must reload it before the first check reads it](#authorization-that-consults-a-relation-must-reload-it-before-the-first-check-reads-it)
- [A full-set sync behind a partially-visible form must preserve what the actor cannot see](#a-full-set-sync-behind-a-partially-visible-form-must-preserve-what-the-actor-cannot-see)
- [A check over a submitted list must accept every shape the write accepts, and derive the "before" state itself](#a-check-over-a-submitted-list-must-accept-every-shape-the-write-accepts-and-derive-the-before-state-itself)
- [Confirmed safe: role-name collision is closed by a creation/rename guard, not by the database alone](#confirmed-safe-role-name-collision-is-closed-by-a-creationrename-guard-not-by-the-database-alone)

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

Since task 0008 the shipped instance of this pattern lives in exactly one place —
`App\Models\Role::superAdminName()` — and `AppServiceProvider`'s `Gate::before` bypass calls it rather
than inlining its own copy, so the snippet above is now the *rule*, not a quotation of the code. That
centralisation is itself the point: with two copies, dropping the `??` from one would have left the
bypass granting the role while every guard, scope, policy and seeder protected nothing.

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

    if (! $target->hasRole(RoleName::Administrator->value, 'web')) {
        return true;
    }

    return $actor->hasPermissionTo('roles.manage-administrators');
}
```

Two details of the call site that are load-bearing, not incidental. Task 0008a moved that call site out
of the Livewire component and into the action itself
([`app/Actions/Users/UpdateUser.php`](../../app/Actions/Users/UpdateUser.php),
`authorizeRoleAndStatusChange()`), and both details survived the move — they are properties of the
*comparison*, not of where it lives:

- **The change-detection comparison must use the same normalisation on both sides, and the same one
  the writer uses to decide whether it is writing.** The guard fires only when an attribute actually
  changed, so a comparison that is *stricter* than the writer's leaves an unguarded write:

  ```php
  // app/Actions/Users/UpdateUser.php
  $emailChanged = $email !== Str::lower((string) $user->getRawOriginal('email'));
  $statusChanged = $status->value !== $user->getRawOriginal('status');
  ```

  Both sides are lowercased (`$email` is normalised at the top of `__invoke()`), and `getRawOriginal()`
  is used rather than `$user->email` / `$user->status` for two reasons that both produce a false
  "unchanged" verdict: `User`'s `email` accessor lowercases on read, so reading through the accessor on
  one side and the raw column on the other manufactures a mismatch — and, since the comparison now runs
  *inside* the action, a caller that had already staged `$user->status = $status` before invoking it
  would otherwise make the status comparison silently false, skipping the gate for a change that is
  about to be persisted regardless (task 0008a's finding F2). The email comparison is byte-identical to
  the one `UpdateUser` makes before delegating to `RequestEmailChange`, which is what guarantees the
  guard cannot disagree with the write.

- **The guard runs before the first write, so a denial cannot leave a partial write.** Every
  authorization check in `UpdateUser` precedes its `DB::transaction()` block, and `CreateUser`'s
  precede its own.

❌ Bad — the pre-fix shape (adapted from the deleted `Index::updateExistingUser()`): only the role
comparison is gated, so an unchanged `roleId` — which is what the edit modal prefills — short-circuits
the guard and nothing else is checked:

```php
// anti-pattern — the shape F1 found
if ($applyRoleAndStatus) {
    $this->authorizeRoleChange($target, (int) $validated['roleId']);
}

$updateUser($target, $name, $email, $roleId, $status, $applyRoleAndStatus, $requestEmailChange);
```

That snippet carries a second, independent flaw task 0008a closed: the whole guard hangs off
`$applyRoleAndStatus`, a **caller-supplied** boolean. See
[the direct-throw rule below](#a-rule-that-must-bind-a-super-admin-actor-must-be-a-direct-throw-not-a-gate-check).

**Known residual, now a confirmed product decision rather than a deferral** (findings F2/F3; settled by
story 0008a): the predicate is *role*-shaped (`hasRole(RoleName::Administrator->value, 'web')`) while
the privilege it protects is *permission*-shaped. A target holding `roles.manage-administrators`
through a direct `model_has_permissions` grant, or through a custom role that is not literally named
`Administrator`, is **not** covered by any of these four abilities. That is inert today — the seeded
catalog grants no permission directly to a user and ships only two roles — and becomes live the moment
story 0009 lets operators build administrator-equivalent roles.

Story 0008a centralised the rule (one predicate, `App\Models\Role::isAdministratorRole()`) and
deliberately **kept it keyed on the name**: administrator-level is defined by the role's identity, not
by its permission set. That is a PRD-scoped limitation with the human decision recorded on story 0009,
and it is pinned by a test — a custom role holding *every* permission the seeded `Administrator` holds
is assignable with a bare `users.edit`. Re-opening it is a deliberate, visible change to that test, not
a silent redefinition. See
[architecture/authorization.md](../architecture/authorization.md#one-predicate-two-shapes).

## A guard that reads a row's protected identity must distinguish "not hydrated" from "hydrated but null"

Established by task 0008's Phase 4 **re-audit** (finding R1), which was a working, executable bypass of
the Super Admin role's immutability guard — found *after* a first fix for the adjacent case had already
shipped and been reviewed. The rule generalises to every model-level guard this repo adds from here on.

A model event guard answers "is the row being mutated the protected one?" by reading an attribute. Three
different sources are available at guard time and they disagree with each other in exactly the situation
an attacker controls:

| Source | On a rename, mid-`updating` | On a partially-hydrated instance |
| --- | --- | --- |
| `$this->getAttribute('name')` | the **new**, attacker-supplied name | the new name |
| `$this->getOriginal('name')` | the persisted name ✅ | `null` — the column was never selected |
| database read-back | the persisted name ✅ | the persisted name ✅ |

`getOriginal('name')` is the right source, but it returns `null` for **two different reasons** — "the
persisted value is null" and "the column was never hydrated" — and `??` cannot tell them apart. That is
what made the first fix wrong:

❌ Bad — the shipped-then-fixed form. The database read-back was added deliberately for the unhydrated
case, and `??` short-circuits before ever reaching it:

```php
// anti-pattern — this is the exact code finding R1 bypassed
$name = $this->getOriginal('name') ?? $this->getAttribute('name');
```

On `Role::query()->select('id')->whereKey($id)->firstOrFail()->update(['name' => 'Pwned'])`, `fill()`
has already run by the time `updating` fires, so `getOriginal('name')` is `null` (never selected) while
`getAttribute('name')` is `'Pwned'` — non-null, so the `??` returns the attacker's own new name, the
comparison against `superAdminName()` fails, and the rename of the Super Admin role succeeds. Note the
near miss: the same partially-hydrated instance mutating **`guard_name`** *is* caught by the broken form,
because `getAttribute('name')` is then `null` and the `??` falls through. A test covering only the
`guard_name` case passes on the vulnerable code — the identifying attribute must be the one under test.

✅ Good — the current form in [`app/Models/Role.php`](../../app/Models/Role.php). `array_key_exists()`
asks the question `??` cannot, and the in-memory attribute is never consulted for a persisted row.
Task 0008a extracted this resolution into `persistedName()` so that **every** identity check on this
model shares one implementation — the Super Admin guards, the row-shaped `isSuperAdminRoleRow()`, and
the Administrator tier's `isAdministratorRole()`:

```php
private function persistedName(): ?string
{
    if ($this->exists && $this->getKey() !== null) {
        return array_key_exists('name', $this->getOriginal())
            ? $this->getOriginal('name')
            : static::query()->whereKey($this->getKey())->value('name');
    }

    return $this->getAttribute('name');
}
```

**Extending a guard is the moment to extract, not to copy.** A second tier needing the same
"read this row's real name" logic is a second chance to get it subtly wrong, and the wrong version
passes every test that doesn't specifically load a partial row.

Four things about this shape are load-bearing:

- **`array_key_exists`, not `isset`/`??`.** All three of `isset()`, `?:` and `??` collapse "absent" and
  "null" into one branch; only `array_key_exists()` separates them.
- **The `$this->exists && $this->getKey() !== null` gate is what keeps the `creating` path from
  attempting a keyless lookup.** Verified by query log: creating an ordinary role issues an `INSERT` and
  the permission-cache flush, and no `SELECT`.
- **Keep the "what name is being written" check as a separate method.** `guardAgainstAssumingSuperAdminName()`
  deliberately *does* read the in-memory attribute, because its job is refusing a create/rename **into**
  the protected name. Two guards, two sources, opposite directions — merging them reintroduces R1.
- **Verify with a rename, not with a delete.** Delete and `guard_name` mutation both pass on the
  vulnerable form.

The same trap has now bitten this repo twice from different directions: see also
[login-status-enforcement.md](login-status-enforcement.md)'s `getPrevious()`-not-`getOriginal()` rule,
where the pre-save value a listener needed had already been overwritten by `syncOriginal()`. Whenever a
security decision depends on a model's **pre-mutation** state, name the exact source and prove it holds
on a partially-hydrated instance — Eloquent offers several plausible-looking readers and they diverge
precisely under attacker control.

Residual, **narrowed by task 0008a and closed by task 0009** (finding F4). Through 0008a,
`App\Policies\RolePolicy`'s Super Admin branch and the `Gate::before` deferral in `AppServiceProvider`
both compared `$role->name` — the in-memory attribute — so a *partially-hydrated* or mid-rename Super
Admin role passed to `Gate::authorize()` was not recognised at the policy layer and the check returned
the actor's ordinary `roles.manage` answer instead of a categorical `false`. It was never exploitable
(the model-level guard above still refused the mutation, and no call site passed a `Role` to
`authorize()`), but it left two layers disagreeing about one row shape.

Both sites now call `Role::isSuperAdminRoleRow($role)`, which reads `persistedName()` — so every
identity question in the app is hydration-safe by construction. The generalisation worth keeping:
**a fix for this class of bug is not finished until every layer that answers the same identity
question has been converted.** 0008a fixed the model guard and extracted the helper; the policy and
the `Gate::before` deferral kept the old attribute read for a further story, and a partial conversion
is exactly the state in which two layers can be pointed at the same row and return different answers.
When you extract an identity helper, grep for every remaining comparison against the same attribute
in the same pass.

## A rule that must bind a Super Admin actor must be a direct throw, not a `Gate` check

Established by task 0008a's Phase 4 audit (finding F1) and its re-audit (finding N2), both of which
were live privilege paths through `App\Actions\Users\CreateUser` / `UpdateUser`.

`Gate::before` runs **before any policy method**, and this app's bypass returns `true` for a Super
Admin. So every `Gate::authorize()` / `Gate::allows()` / `$user->can()` call is, for that one actor, a
guaranteed grant — no matter what the policy behind it says. A rule written as a `Gate` check is
therefore a rule that **does not apply to the most privileged actor in the system**, which is usually
the exact actor a categorical invariant exists to bind.

❌ Bad — the shape N2 found. The intent is "nobody may demote the platform's own Super Admin", and it
is inert for a Super Admin actor, who is the only actor who could otherwise reach it:

```php
// anti-pattern — Gate::before grants before UserPolicy::update() is ever consulted
if ($target->hasRole(Role::superAdminName(), 'web')) {
    Gate::authorize('update', $target);   // returns true for a Super Admin actor
}
```

✅ Good — the shipped form in [`app/Actions/Users/UpdateUser.php`](../../app/Actions/Users/UpdateUser.php).
The refusal is a statement, not a question, so nothing can grant past it:

```php
if ($currentRoles->contains(fn (Role $role): bool => Role::isSuperAdminRoleRow($role))) {
    throw new AuthorizationException('A Super Admin holder cannot be modified through this action.');
}
```

Three corollaries:

- **Decide "must this bind the Super Admin too?" before choosing where the rule lives.** If yes, it
  belongs in the model (a `boot()` guard or a method override) or in the action — never in a policy.
  This is the same reasoning that puts the role model's own invariants in
  [layers 1 and 2](../architecture/authorization.md#three-guard-layers) rather than in `RolePolicy`,
  and why `UserPolicy::delete()`'s trashed-target refusal is knowingly *not* binding on a Super Admin.
- **Throw `AuthorizationException`, so the refusal is indistinguishable from a policy denial** — the
  caller still sees a 403, and a Livewire action still fails the same way at the same point.
- **A `Gate::allows()`-driven UI hint cannot see such a rule**, so the disabled state of a row action
  can legitimately drift from what a click does. Accept the drift in the *enabled-then-refused*
  direction only, and record it; never "fix" it by moving the rule back under `Gate`. The live
  instance is documented in
  [architecture/authorization.md](../architecture/authorization.md#gateallows-in-a-list-query-is-a-ui-hint-not-a-layer).

The mirror-image mistake is just as costly and was the *other* half of F1/N2: checking only the value
being **submitted** and never the target's **current** state. `UpdateUser` originally refused assigning
the Super Admin role but happily *removed* it, because `syncRoles()` replaces the entire role set — an
irrecoverable lockout, since `Gate::before` is the only route to unrestricted access. **A guard on a
protected identity must check both directions: what is being written, and what the row already is.**

## Authorization that consults a relation must reload it before the first check reads it

Established by task 0008a's Phase 4 re-audit (finding N1), which appeared *while fixing* an earlier
finding — the reload existed, but it sat below the `Gate::authorize()` call that needed it.

`$target->hasRole(...)` reads the roles collection **already loaded on the instance** when there is
one, and only queries when there is not. A policy that identifies its target by role therefore reads
whatever the caller hydrated. That is attacker-influenced input the moment the action is callable from
anywhere but one trusted component: `->with('roles')` is the natural, performance-motivated idiom
(`App\Livewire\Users\Index::loadUsers()` already uses it), so handing the action a deliberately stale
collection is a one-line evasion of `UserPolicy::update()`'s Super Admin-target exclusion.

✅ Good — the shipped form. The reload is the **literal first statement**, above even the `Gate` call:

```php
// app/Actions/Users/UpdateUser.php — __invoke()
$user->load('roles');

Gate::authorize('update', $user);
```

❌ Bad — the same two statements in the opposite order (adapted to illustrate; this is the ordering N1
found):

```php
// anti-pattern — the Gate call resolves the policy against the caller's stale collection
Gate::authorize('update', $user);

$user->load('roles');   // too late: the exclusion has already been evaluated
```

**Rule.** In an action or policy-calling method, reload every relation an authorization decision
depends on **before the first check that consults it** — not merely somewhere before the write. Two
things make this easy to get wrong: the reload is usually added for a *different* reason (here, making
"is the target an Administrator?" read the whole collection rather than an unordered `first()`), so its
placement is chosen for that purpose and never re-examined against the checks above it; and the stale
path fails **open** and silently, since a missing role is indistinguishable from a role the target
genuinely does not hold. `load()` (not `loadMissing()`) is what the rule needs — `loadMissing()` is
precisely a no-op when the caller already supplied the stale collection.

## A full-set sync behind a partially-visible form must preserve what the actor cannot see

Established by task 0009's Phase 4 audit (finding F1), whose correct resolution required a **human
product decision** rather than a derivation.

Two facts that are individually reasonable combine into a privilege *loss*:

- `Role::syncPermissions()` — like `syncRoles()`, and like every `sync*()` in Eloquent — **replaces the
  entire set**. What is absent from the payload is removed, not left alone.
- The `roles.manage-administrators` toggle is rendered **only** to the Super Admin
  ([`RolePolicy::grantAdministratorPermission`](../architecture/authorization.md#who-may-grant-a-permission--the-meta-rule-layer)),
  and rendered as *absent from the DOM*, not merely disabled.

So a broad administrator holding `roles.manage`, editing an unrelated field on a role that legitimately
holds the administrator-level permission, submits a payload that **omits** it — not as a decision, but
because the field was never in their form. A guard that only asks "does the payload contain the
protected permission?" passes that request happily, and the sync silently revokes a Super Admin's
grant. Verified against the real vendor code, not reasoned about: `syncPermissions()` detaches
everything not present.

❌ Bad — the shape F1 found. It reads as a complete guard, and covers only half the diff:

```php
// anti-pattern — nothing here notices a REMOVAL the actor was never shown
if (in_array($administratorLevelPermission, $submittedNames, true)) {
    Gate::forUser($actor)->authorize('grantAdministratorPermission', Role::class);
}
```

✅ Good — the shipped form in
[`app/Actions/Roles/EnforceAdministratorPermissionGrant.php`](../../app/Actions/Roles/EnforceAdministratorPermissionGrant.php),
which diffs both directions and re-adds what an unprivileged actor could not have meant to remove:

```php
if ($isSubmittedGranted && ! $wasGranted) {
    Gate::forUser($actor)->authorize('grantAdministratorPermission', Role::class);
}

if ($wasGranted && ! $isSubmittedGranted && Gate::forUser($actor)->denies('grantAdministratorPermission', Role::class)) {
    $submittedPermissions[] = RolePolicy::ADMINISTRATOR_LEVEL_PERMISSION;
}
```

**Rule.** Whenever a **full-replace** write is driven by a form that shows the actor only *part* of the
set, absence in the payload does not mean "remove this" — it means "the actor had no opinion". Diff
the submitted set against the current one and authorize **each direction separately**: adding a value
the actor may not add, and removing a value the actor may not remove, are two different abilities that
happen to share one form.

Three corollaries:

- **Which behaviour is correct is a product decision, not a security one.** *Preserve* (keep the value,
  let the rest of the save succeed) and *deny* (refuse the whole request) are both defensible: the
  first can hide from the actor that their submission was partly ignored, the second blocks routine
  edits on any role that happens to hold a protected value. Task 0009 stopped mid-audit and asked the
  human, who chose **preserve**. Record the choice next to the code — an unrecorded one reads as an
  oversight to the next auditor, who will "fix" it in whichever direction they'd have picked.
- **Preserve must not become "nobody can ever revoke it".** The re-add is conditional on the actor
  *failing* the grant ability, so the Super Admin's own "remove it by omitting it" path still works.
  A guard that preserves unconditionally converts a permission into an irrevocable one.
- **The same shape applies to `syncRoles()`, and it has already bitten this repo once** — see the
  mirror-image note under [A rule that must bind a Super Admin actor](#a-rule-that-must-bind-a-super-admin-actor-must-be-a-direct-throw-not-a-gate-check),
  where `UpdateUser` refused *assigning* the Super Admin role while happily removing it.

## A check over a submitted list must accept every shape the write accepts, and derive the "before" state itself

Established by task 0009's Phase 4 rounds 1–3 (findings F2, then N1/N2/N3 against the fix for F2, then
NR1). Every round found the same hole one level further up.

**Half one — shape.** `Role::syncPermissions()` accepts names, integer ids, `Permission` model
instances, and arrays or `Collection`s of any of those, flattening the lot through
`HasPermissions::collectPermissions()`. A membership check written against bare name strings therefore
sees a different set than the write does: submitting the protected permission **by id**, or nested one
level deep inside an array element, was proven live to bypass the guard while still being honoured by
the sync.

✅ Good — normalise with the *identical* flattening the write uses, then compare:

```php
// app/Actions/Roles/EnforceAdministratorPermissionGrant.php — normalizeNames()
foreach (Collection::make($permissions)->flatten() as $permission) {
    if ($permission instanceof Permission) {
        $names[] = $permission->name;
    } elseif (is_numeric($permission)) {
        $ids[] = $permission;
    } else {
        $names[] = (string) $permission;
    }
}
```

**Half two — provenance.** The first fix for F1/F2 took the "before" snapshot as a caller-supplied
`array $currentPermissionNames` parameter. That reopened the identical hole at the call site: a caller
asserting an untrue "before" makes a genuine new grant look pre-existing (N2), and the two snapshots
were normalised asymmetrically so the diff silently mismatched (N3). Replacing the parameter with
`?Role $role` — from which the action loads the permissions itself — removed both **structurally**,
not by adding a validation.

```php
// the action reads its own "before" state; a caller cannot assert one
$role->load('permissions');
$currentNames = $role->permissions->pluck('name')->all();
```

**Rule.** A guard must derive every input its decision depends on from an authoritative source it
controls, and must interpret the submitted input **exactly** as the write that follows will. Concretely:

- **Never accept "what the record currently is" as a parameter.** That is the state being guarded; a
  caller that can assert it can defeat the guard. Take the model and read it — with `load()`, not
  `loadMissing()`, per [the reload rule](#authorization-that-consults-a-relation-must-reload-it-before-the-first-check-reads-it).
- **Read the vendor source for the accepted input shapes rather than assuming the well-behaved one.**
  "Callers pass names" is a convention, and a convention is not a boundary.
- **A nullable parameter that means "nothing yet" must not carry a default** (finding NR1). `?Role
  $role` with `= null` turns a forgotten argument at a future call site into a silent "nothing is
  currently granted" for what may be an existing, already-granted row. Nullable, but required.
- **Re-audit the fix, not just the finding.** Three consecutive rounds here each found a flaw in the
  *previous round's remediation*, all shipped past review because each fix was read against the finding
  it answered rather than as new code with its own attack surface.

## Confirmed safe: role-name collision is closed by a creation/rename guard, not by the database alone

Worth recording because the reasoning is non-obvious and someone will re-open the question. The
Super Admin bypass keys on a **name string**, which invites the question "can an attacker create a
colliding role?". Two facts about string comparison still hold and are worth keeping in mind:

- **PHP-side comparisons are byte-exact.** `==`/`===` against a non-numeric string in PHP 8 is
  case-sensitive with no normalisation. `super admin`, `SUPER ADMIN`, and `Super Admin ` (trailing
  space) all **fail** to match `'Super Admin'`.
- **Database-side, `roles` carries `unique(name, guard_name)`** under `utf8mb4_unicode_ci`
  (`config/database.php`), which is case- **and** accent-insensitive. Any variant that PHP *would*
  match must be byte-identical, and any byte-identical row on the *same* `(name, guard_name)` pair is
  rejected as a duplicate.

**What this does NOT close on its own — corrected during task 0008's Phase 4 re-audit (finding F3).**
An earlier version of this section concluded "the only string that grants the bypass is already
occupied by the seeded row," reasoning from the unique index alone. That conclusion stopped being true
the moment `config('auth.super_admin.role')` became overridable (task 0008): the unique index only
forbids a *second* row sharing an already-occupied `(name, guard_name)` pair — it says nothing about a
role being created or renamed to match whatever name `superAdminName()` currently resolves to, and
before task 0008's Phase 3 landed, nothing else stopped that either. Verified directly: with no guard
in place, both `Role::create(['name' => 'Super Admin', ...])` and renaming an ordinary role into that
name succeeded and the resulting role inherited the full `Gate::before` bypass — reachable on a fresh
install before seeding, or whenever the config names a role that hasn't been seeded yet.

**What actually closes it today.** `App\Models\Role::boot()` registers a `creating` listener and the
post-mutation half of its `updating` listener (`guardAgainstAssumingSuperAdminName()`), both of which
throw `ImmutableRoleException` when a role's in-memory `name` equals `Role::superAdminName()` at save
time — refusing the role from ever being *created with*, or *renamed into*, the currently-configured
Super Admin name. The one sanctioned exception is `Role::firstOrCreateSuperAdminRole()`
(`RolePermissionSeeder`'s call site), which bypasses model events via `withoutEvents()` specifically to
create the real row. The database's `unique(name, guard_name)` index remains a second, independent
backstop for the narrower case these two facts above describe (an exact-byte-match duplicate on an
*already-occupied* pair) — it is not what stops acquisition of a currently-unoccupied configured name.
Do not "harden" the name comparisons themselves by lowercasing or trimming — that would *widen* the set
of matching names and break the property the byte-exact match above relies on. The remaining hardening
is guard-scoping (see [Always pass the guard](#always-pass-the-guard-to-hasrole--hasanyrole)).

_Last updated: 2026-08-20 — Task 0009's three Phase 4 rounds: added "A full-set sync behind a
partially-visible form must preserve what the actor cannot see" (finding F1 — `syncPermissions()`
replaces the whole set while the administrator-level toggle is rendered only to the Super Admin, so an
unprivileged actor's routine edit silently revoked a grant; the preserve-vs-deny resolution was a human
product decision, recorded as such) and "A check over a submitted list must accept every shape the
write accepts, and derive the 'before' state itself" (findings F2/N1 — id, model-instance and nested
shapes evaded a name-only membership check the sync still honoured; N2/N3/NR1 — the first fix took the
"before" snapshot as a caller-supplied array, reopening the hole one level up, closed structurally by
taking the `Role` instead). **Closed** the policy-layer residual under "A guard that reads a row's
protected identity…": `RolePolicy` and the `Gate::before` deferral both read `isSuperAdminRoleRow()`
now (finding F4), and the paragraph carries the generalisation about finishing a partial identity-helper
conversion in one pass._

_Previously: 2026-08-19 — Task 0008a's three Phase 4 rounds: added "A rule that must bind a Super
Admin actor must be a direct throw, not a `Gate` check" (findings F1/N2 — `Gate::before` grants before
any policy method runs, so a `Gate`-mediated invariant is inert for exactly the actor it must bind;
plus the mirror-image mistake of checking only the submitted value and never the target's current
state) and "Authorization that consults a relation must reload it before the first check reads it"
(finding N1 — a caller's `->with('roles')` hydration is attacker-influenced input, and the reload added
for a different reason sat below the `Gate` call that needed it). Rewrote the "not hydrated" section's
now-stale `isSuperAdminRole()` code quote for the extracted `persistedName()`, and narrowed its
policy-layer residual: the fix is now a call to `Role::isSuperAdminRoleRow()` rather than a design
task. Corrected the deferred role-shaped-predicate residual under "An ability must cover every
attribute…" — 0008a centralised that rule and deliberately kept it keyed on the name, so it is a
recorded product decision, not an open item._

_Previously, 2026-08-18 — Task 0008 Phase 6 (docs sync): noted in "Read the Super Admin role name with
a literal default" that the shipped instance of that double fallback now lives solely in
`App\Models\Role::superAdminName()`, so its snippet reads as the rule rather than a code quotation._

_Previously, 2026-08-17 — Task 0008's **third** Phase 4 pass (finding R1): added "A guard that reads a
row's protected identity must distinguish 'not hydrated' from 'hydrated but null'", the rule behind a
working rename bypass of the Super Admin immutability guard that survived the first fix, plus the
recorded policy-layer residual under partial hydration._

_Previously, 2026-08-17 — Corrected during task 0008's Phase 4 **re-audit** (finding F3): the section
previously claimed the unique index alone closed role-name acquisition of the Super Admin name: it does
not, once `config('auth.super_admin.role')` is overridable. Documents the `creating`/`updating` guards
on `App\Models\Role` that actually close it, and the sanctioned `firstOrCreateSuperAdminRole()`
exception the seeder uses._

_Previously, 2026-08-13 — Added "An ability must cover every attribute that achieves its effect"
during the Phase 4 **re-audit** of task 0004 (finding F1's fix), including the normalisation rule for
the change-detection comparison that arms such a guard and the deferred role-shaped-predicate
residual._

_2026-08-09 — Updated during the Phase 4 **re-audit** of task 0002: the `Gate::before`
snippets now show the shipped guard-scoped, `instanceof`-guarded closure; the guest-handling guidance was
corrected (a `mixed` parameter admits guests, so the body must guard, not the type hint); and the
literal-default section now documents why `config($key, $default)` alone does not cover a
present-but-`null` key._
