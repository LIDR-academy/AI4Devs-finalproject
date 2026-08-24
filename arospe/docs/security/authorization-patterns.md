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
- [An identity derived from a mutable column must be locked once code exists that can mutate it](#an-identity-derived-from-a-mutable-column-must-be-locked-once-code-exists-that-can-mutate-it)
- [Two guards on one payload must agree on what an omission means](#two-guards-on-one-payload-must-agree-on-what-an-omission-means)
- [A control omitted from the DOM is safe only for the one value whose guard preserves an omission](#a-control-omitted-from-the-dom-is-safe-only-for-the-one-value-whose-guard-preserves-an-omission)
- [A check over a submitted list must accept every shape the write accepts, and derive the "before" state itself](#a-check-over-a-submitted-list-must-accept-every-shape-the-write-accepts-and-derive-the-before-state-itself)
- [A registry that means "ungated" by *absence* fails open, silently](#a-registry-that-means-ungated-by-absence-fails-open-silently)
- [A rate limit keyed on the target alone becomes an attack on the target the moment a second caller exists](#a-rate-limit-keyed-on-the-target-alone-becomes-an-attack-on-the-target-the-moment-a-second-caller-exists)
- [Confirmed safe: a sidebar built on Gate::any() inherits the Super Admin bypass, and both refusal paths fail closed](#confirmed-safe-a-sidebar-built-on-gateany-inherits-the-super-admin-bypass-and-both-refusal-paths-fail-closed)
- [Confirmed safe: a `can:`-gated route's 403 names no permission — and `APP_DEBUG` is not what makes that true](#confirmed-safe-a-can-gated-routes-403-names-no-permission--and-app_debug-is-not-what-makes-that-true)
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

Three real call sites hold this shape today: [`database/seeders/RolePermissionSeeder.php`](../../database/seeders/RolePermissionSeeder.php)
(the ✅ above is its structure), and — since task 0012's Phase 4 audit found them missing it —
`saveRole()` and `deleteRole()` in [`app/Livewire/Roles/Index.php`](../../app/Livewire/Roles/Index.php).

> ⚠️ **The flush this rule is about is usually one nobody wrote.** Both roles-screen methods were
> already correct before task 0010 wrapped them in `DB::transaction()` for an unrelated finding: the
> only flush on either path is the vendor's own, fired from inside `syncPermissions()` and from
> `Role`'s `deleted` event. Introducing the transaction moved *that* flush pre-commit without any line
> being added, removed or reordered — the diff contained no flush at all, so a review looking for one
> found nothing to check. **Adding a `DB::transaction()` around existing code relocates every side
> effect that code already performed**, so treat it as a change to each of them. See
> [errors-log.md](../errors-log.md#wrapping-existing-code-in-a-dbtransaction-moved-a-cache-flush-nobody-had-written--2026-08-21).

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

> **Confirmed safe (task 0015, Phase 4) — and the reason the `load()`-not-`loadMissing()` clause above
> is now load-bearing rather than defensive.** Task 0015's audit-log work (finding F5) gave this action
> a **second pre-hydrating caller**, in the same request, one statement above the call:
> `App\Livewire\Users\Index::updateExistingUser()` captures the "before" role for its `Log::info` line
> by reading `$target->roles` — which hydrates the relation on the very instance it then hands to
> `UpdateUser`. The audit confirmed no finding: `__invoke()`'s `$user->load('roles')` **forces** a
> re-query, so the pre-hydrated collection is discarded before any check consults it, and this caller's
> collection was never stale to begin with (it comes from a fresh `User::findOrFail()` in the same
> request).
>
> The durable point is what would break it. When N1 was written, `loadMissing()` looked like a
> harmless micro-optimisation only a hypothetical attacker-controlled caller would punish. It is now
> one edit away from a real regression through **this repo's own code**: swapping `load()` for
> `loadMissing()` would make `UpdateUser` authorize against whatever the component happened to hydrate
> for a *logging* purpose. **Rule: a forced reload is not redundant merely because every caller you can
> see is trustworthy — count the callers that hydrate the relation before the call, and treat that
> count going up as a reason to re-read this section, not as a reason to skip the reload.** The
> "before"-state capture that pre-hydrates it must also stay above the call for its own reason (it
> reads pre-write values), so the two constraints are stable together rather than in tension.

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

## An identity derived from a mutable column must be locked once code exists that can mutate it

Established by task 0010's Phase 4 finding **F1** (High, two working privilege-escalation paths, both
verified live).

Task 0008a centralized the question "is this role the Administrator tier?" into one predicate,
`Role::isAdministratorRole()`, which compares the row's persisted `name` against
`RoleName::Administrator->value`. That was correct, and it was **safe only for as long as nothing could
change `roles.name`**. Task 0010's roles-management screen is that something. Two consequences arrived
together the moment it shipped:

- **Rename.** A `roles.manage-administrators` holder renames the seeded `Administrator` role. Nothing
  errors. But `isAdministratorRole()` now answers `false` for it, so every consumer of that predicate —
  `UserPolicy`'s Administrator branches, `CreateUser`, `UpdateUser`, `RolePolicy::update()` — silently
  stops protecting the tier. The role keeps its 37 permissions and every holder keeps their access; only
  the *protection* disappears.
- **Delete.** Once the role has no holders, the same actor deletes it outright. The catalog's base role
  is gone, and re-creating it by hand (exact byte-identical name, `web` guard, 37 of 38 permissions)
  is error-prone in a way nothing in the app would detect.

Neither is a bug in the predicate. The predicate reads a column, and the column became writable.

❌ Bad — the shape as found: an identity anchored to a column that application code can now write, with
no guard on the column:

```php
// app/Models/Role.php — as of task 0009: only the Super Admin tier had guards
public static function isAdministratorRole(self $role): bool
{
    return $role->persistedName() === RoleName::Administrator->value;
}
// ...and nothing in boot() refused a rename or a delete of that row.
```

✅ Good — the shipped fix. Three guards, mirroring the Super Admin tier's, registered in the **same**
`boot()` so the ordering decision stays in one place:

```php
// app/Models/Role.php
static::deleting(function (self $role): void {
    $role->guardAgainstAdministratorDeletion();
});

static::updating(function (self $role): void {
    // ...
    $role->guardAgainstRenamingAdministrator();     // pre-mutation name: the row AS IT IS today
    $role->guardAgainstAssumingAdministratorName(); // post-mutation name: renaming INTO the name
});
```

Four properties of the fix that are the actually transferable part:

- **Lock exactly what the identity depends on, and nothing more.** The Administrator row's *name* is
  locked and the row is undeletable; its **permission set stays fully editable**, because
  `syncPermissions()` does not change the answer to "is this the Administrator tier?" — and because
  [`EnforceAdministratorPermissionGrant`](#a-full-set-sync-behind-a-partially-visible-form-must-preserve-what-the-actor-cannot-see)
  exists precisely so that set *can* be changed. Copying the Super Admin tier's blanket
  `guardAgainstSuperAdminMutation()` here would have broken the feature one story earlier had shipped.
- **Guard both directions of a name.** A rename *of* the protected row and a rename *into* its name are
  different attacks and need different guards, reading different sources — see
  [the hydration rule](#a-guard-that-reads-a-rows-protected-identity-must-distinguish-not-hydrated-from-hydrated-but-null).
  The pre-mutation guard is additionally scoped to `isDirty('name')`, because ordinary saves of that row
  are legitimate.
- **A `creating`/`updating` guard needs a sanctioned bypass for the one legitimate writer.**
  `Role::firstOrCreateAdministratorRole()` (`withoutEvents()`, plus a byte-exact read-back of the
  persisted name against the case-insensitive `utf8mb4_unicode_ci` collation) is that bypass, and
  `RolePermissionSeeder` now calls it instead of the raw `firstOrCreate()` the new guard would refuse.
  Adding the guard **without** the bypass would have broken seeding, in production, on the next deploy.
- **The policy layer is not the fix; it is the companion.** `RolePolicy::delete()` also refuses the row
  categorically, but that branch is [unreachable for a Super Admin actor](../architecture/authorization.md#the-administrator-tiers-immutability-name-locked-undeletable-permissions-still-editable)
  — `Gate::before` only defers on a *Super Admin* target. The model-event guard is what binds every
  actor, for the same reason as
  [the direct-throw rule](#a-rule-that-must-bind-a-super-admin-actor-must-be-a-direct-throw-not-a-gate-check).

**Rule.** When a security decision is derived from a mutable attribute, the story that first ships code
able to mutate that attribute **owns locking it** — and the review question is not "does the new screen
authorize correctly?" but "**which existing invariants does this screen's write surface newly reach?**".
Enumerate every column the new code can write, then, for each, ask what elsewhere in the app reads it as
an identity. A predicate that was safe when it was written stays in the diff untouched while becoming
unsafe, so nothing about the change draws attention to it.

## Two guards on one payload must agree on what an omission means

Established by task 0010's Phase 4 re-audit, as a **forward-looking** rule: no live bypass exists
today, and the condition that would create one is named below so it is caught before it ships.

`App\Livewire\Roles\Index::saveRole()` runs two independent transformers over the same submitted
permission list, in this order:

```php
// app/Livewire/Roles/Index.php
$permissionNames = $enforceGrantorPermissionScope(Auth::user(), $permissionNames, $role);
$permissionNames = $enforceAdministratorPermissionGrant(Auth::user(), $permissionNames, $role);
```

They answer the same question — "may this actor move this permission?" — but they treat an **omission**
in opposite ways, and both are correct *for their own rule*:

| Action | On a new grant the actor may not make | On an omission of something already granted |
| --- | --- | --- |
| [`EnforceAdministratorPermissionGrant`](../../app/Actions/Roles/EnforceAdministratorPermissionGrant.php) | throws | **preserves** — re-adds the permission to the payload |
| [`EnforceGrantorPermissionScope`](../../app/Actions/Roles/EnforceGrantorPermissionScope.php) | throws | **ignores** — the sync revokes it |

That divergence is safe only because of a property of a *different* file: `permissionOptions()` returns
the **unfiltered** `web` catalog, so (almost) every permission a role currently holds is rendered as a
checked box and comes back in the payload.

> **Narrowed 2026-08-21 (task 0011's Phase 4 audit), now that the paired Blade view exists.** This
> section originally closed with "the second action never has to preserve anything, because nothing is
> ever invisibly absent" — written while `resources/views/livewire/roles.blade.php` was still 0011's
> unbuilt deliverable. The shipped view omits **exactly one** checkbox, and
> `EnforceAdministratorPermissionGrant`'s preserve branch is therefore live rather than dormant. The
> combination is still safe, for a reason worth stating on its own — see
> [the section below](#a-control-omitted-from-the-dom-is-safe-only-for-the-one-value-whose-guard-preserves-an-omission).

⚠️ **The hazard.** The natural reaction to the finding `EnforceGrantorPermissionScope` closes ("an actor
may not grant a permission they do not hold") is to stop rendering those checkboxes at all. Doing that —
in `permissionOptions()`, or in the paired Blade view — turns the second row of that table into the
exact silent-revoke bug the [section above](#a-full-set-sync-behind-a-partially-visible-form-must-preserve-what-the-actor-cannot-see)
documents: a narrow `roles.manage` holder editing a role that legitimately holds `products.delete` would
submit a payload omitting it, and `syncPermissions()` would strip it with no error anywhere.

❌ Bad — filtering the catalog to what the actor can grant, while the scope action still only throws:

```php
// anti-pattern — do NOT pair this with a grant-only guard
return Permission::query()
    ->whereIn('name', $actor->getAllPermissions()->pluck('name'))
    ->get(['id', 'name']);
```

✅ Good — either keep the catalog unfiltered (today's shipped state), or, if it is ever filtered, give
`EnforceGrantorPermissionScope` the same preserve branch its sibling already has, conditional on the
actor failing the ability rather than unconditional.

**Rule.** When more than one guard transforms the same full-replace payload, write down what each one
does with an **omission**, not only with an addition — and state the property of the form that makes the
combination safe, in the guard, so that changing the form cannot quietly invalidate it. A guard whose
correctness depends on a view rendering every value is only as safe as that view, and nothing in the
guard's own file or test suite will fail when the view changes.

Two corollaries verified during the same re-audit, both worth knowing before touching this pipeline:

- **Their *ordering* is not the safety mechanism, despite reading like it.** The two were verified to
  refuse identically when reversed. What keeps them from disagreeing about
  `roles.manage-administrators` is that `EnforceGrantorPermissionScope` **excludes that name from its
  own scope entirely** (`->reject(fn ($name) => $name === RolePolicy::ADMINISTRATOR_LEVEL_PERMISSION)`),
  deferring it to the action that owns it. Keep the exclusion; do not rely on call order.
- **A grant-scope rule is one-directional by construction.** `EnforceGrantorPermissionScope` restricts
  *granting* a permission the actor lacks; it deliberately does not restrict *revoking* one. A
  `roles.manage` holder can therefore strip any permission — including `roles.manage` itself — from any
  role they neither hold nor created, which is privilege *consolidation* rather than escalation
  (the Super Admin, who holds no revocable role, can always repair it). The self-lockout guard in
  `saveRole()` keys on `Auth::user()->hasRole($role->name, 'web')`, so it protects the actor's own
  access and nobody else's. If that asymmetry ever stops being acceptable, the fix is a second diff
  direction in the same action, not a new guard elsewhere.

## A control omitted from the DOM is safe only for the one value whose guard preserves an omission

Established by task 0011's Phase 4 audit — the view half of the roles screen, and the first place in
this repo where "do not render this control at all" is a *security* requirement rather than a
convenience.

The requirement has two halves that pull in opposite directions, and both are real:

- **It must be absent, not disabled.** A rendered-but-disabled checkbox tells a broad `roles.manage`
  holder that `roles.manage-administrators` exists and whether this role holds it — the escalation-adjacent
  fact the whole Super-Admin-only meta-rule exists to withhold. HTML also does not submit a disabled
  input, so "disabled" would be a silent revoke on top of a leak.
- **Absence is what a full-replace `sync*()` reads as a revoke.** Per the two sections above, an omitted
  value is destroyed unless some guard puts it back.

✅ Good — the shipped view, which resolves that by filtering the withheld permission out **once, before
grouping**, rather than per-item inside the render loop:

```blade
{{-- resources/views/livewire/roles.blade.php --}}
$visiblePermissions = $this->canGrantAdministratorLevel
    ? $this->permissionOptions
    : $this->permissionOptions->reject(
        fn ($permission) => $permission->name === \App\Policies\RolePolicy::ADMINISTRATOR_LEVEL_PERMISSION
    );

$permissionGroups = $visiblePermissions->groupBy(
    fn ($permission) => explode('.', $permission->name, 2)[0]
);
```

Verified by rendering rather than by reading: a broad `roles.manage` holder editing a role that holds
`roles.manage-administrators` gets **37** `value="…"` checkbox attributes and no matching label; a Super
Admin gets **38**. Saving an unrelated change from that broad actor's payload — which omits the
permission — leaves the role holding `roles.manage-administrators`, because
[`EnforceAdministratorPermissionGrant`](../../app/Actions/Roles/EnforceAdministratorPermissionGrant.php)
re-adds it. Every *other* permission the actor cannot grant (`products.delete`, say) is still rendered,
so nothing else can be invisibly absent.

❌ Bad — the shape this replaced (Phase 4 finding F2/F4, corrected in the same story before Phase 5):
a per-item condition inside the render loop, applied *after* grouping:

```blade
{{-- anti-pattern — superseded; do not reintroduce --}}
@foreach ($permissionGroups as $module => $permissions)
    @foreach ($permissions as $permission)
        @if ($permission->name === \App\Policies\RolePolicy::ADMINISTRATOR_LEVEL_PERMISSION)
            @if ($this->canGrantAdministratorLevel)
                <flux:checkbox value="{{ $permission->id }}" ... />
            @endif
        @else
            <flux:checkbox value="{{ $permission->id }}" ... />
        @endif
    @endforeach
@endforeach
```

Two independent problems with this shape, not one: it is easy to duplicate or diverge from (a second,
unrelated `@if` added to the same loop — see the next example — reads as "consistent" with this one even
though nothing enforces that), and applying the filter *after* grouping means a module whose only
permission is the withheld one still renders its heading and separator over an empty body — a structural
version of the same disclosure the omission itself exists to prevent. Filtering before `groupBy()` closes
both at once: a module that would end up empty never appears at all.

❌ Bad — a second omission in the same loop, the natural next edit once any per-item condition already
exists, and has no guard behind it:

```blade
{{-- anti-pattern — do NOT add a second condition here --}}
@if ($this->canGrant($permission->name))
    <flux:checkbox value="{{ $permission->id }}" ... />
@endif
```

`EnforceGrantorPermissionScope` **ignores** an omission, so this silently strips every permission the
editing actor happens not to hold, from every role they touch, with no error and no failing test — the
hazard the section above names, now one `@if` away instead of hypothetical.

**Rule.** When a control is deliberately withheld from the DOM, the withheld set must be **exactly**
the set of values some guard preserves on omission, and the code must say which guard that is. Keep the
condition to one expression (ideally applied once, before the grouping/rendering transform, rather than
per-item inside it), and pair it with a test asserting the rendered control count equals *catalog minus
withheld* — a count assertion fails when a second omission appears, whereas an
`assertDontSee()` on the withheld label passes just as happily when half the form has vanished.

**Accepted residual (Low), recorded so it is not rediscovered as new.** Withholding the *control* does
not withhold the *value*: `openEditModal()` assigns `$this->selectedPermissionIds` from the role's real
permission set, and that property is public and not `#[Locked]` (it must be writable — it is the form
field), so the withheld permission's integer **id** still reaches a non-Super-Admin's browser in the
Livewire snapshot. By elimination against the 37 rendered id→label pairs, the actor can infer that the
role holds a permission they are not shown. It confers nothing — granting it is refused with a 403 and
revoking it is undone by the preserve branch, both verified live. Closing it means filtering the id out
of `selectedPermissionIds` when `! $canGrantAdministratorLevel`, which is safe but puts the withholding
rule in a **second** file; if that is ever done, the two must be derived from one expression, because a
filter that also fires for the Super Admin turns preserve into revoke for the one actor allowed to
revoke.

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

## A registry that means "ungated" by *absence* fails open, silently

> **Status: closed, 2026-08-22 (story 0013).** Found as F1 by that story's Phase 4 audit and remediated
> in the same story by shape **(b)** below — the allow-list schema test, which shipped in
> [`tests/Feature/Navigation/SidebarModuleGatingTest.php`](../../tests/Feature/Navigation/SidebarModuleGatingTest.php)
> and is quoted verbatim under ✅. The ❌ is still the shipped filter expression, because the fix is a
> *test* rather than a rewrite of the component — read it as "the shape the guard test exists to
> protect", not as an outstanding hole. This section was written as a ❌/✅ pair with an explicit status
> banner precisely so this update was a one-line status flip rather than a re-framing, per
> [the audit-authored-page rule](../errors-log.md#a-security-page-documented-the-vulnerable-code-as-current-because-it-was-written-before-its-own-fix--2026-08-20).

Story 0013 introduced this repo's first **declarative permission registry** — `config/modules.php`,
read by `resources/views/components/sidebar-nav.blade.php` — and the registry is designed to be
*appended to by every later epic*. That makes the shape of its default the durable question, not the
two entries it holds today.

The registry expresses "this entry needs no permission" as an **empty** `permissions` array, and the
component's filter reads that with `empty()`:

❌ The filter as shipped — three distinct developer mistakes all resolve to "visible to everyone", with
no warning, no exception and no log line:

```blade
{{-- resources/views/components/sidebar-nav.blade.php --}}
->filter(fn (array $item): bool => empty($item['permissions']) || Gate::any($item['permissions']))
```

`empty()` is the one PHP construct that reads a missing array key **without emitting a warning**, so
all three of these render the entry unconditionally — verified by execution against the real component
with a `Gate::before` denying everything:

| Registry mistake | `empty()` says | Result |
| --- | --- | --- |
| `permissions` key omitted entirely | `true` | rendered for everyone |
| key misspelled (`'permission' => [...]`) | `true` | rendered for everyone |
| `'permissions' => null` | `true` | rendered for everyone |
| `'permissions' => 'users.view'` (string, not array) | `false` | fails **closed** — `Gate::any()` wraps it |
| `'group' => '<key not in groups>'` | n/a | silently dropped — fails **closed** |

Nothing is directly exploitable by an attacker: the route's own `can:` middleware still refuses the
request ([the module-gate pattern](../architecture/authorization.md#the-copyable-module-gate-pattern-and-the-three-alternatives-rejected)),
so the blast radius is an advertised link that 403s, plus disclosure of a module's existence and URL to
a role that may not use it. But it violates the story's own acceptance criterion — *never advertise a
link the route would refuse* — and it violates it **in the direction a registry is most likely to
drift**, because the mistake is an omission rather than a wrong value, and omissions do not appear in a
diff as anything.

Note the asymmetry that makes this worth writing down: the *safe* mistakes above are the loud-looking
ones, and the *unsafe* ones are the quiet ones. A permission name that is real but not in the seeded
catalog also fails closed — `PermissionRegistrar`'s `Gate::before` calls `checkPermissionTo()`, which
catches `PermissionDoesNotExist` and returns `false` — so a typo in the *value* hides the entry, while
a typo in the *key* reveals it.

Two shapes close it: **(a)** an explicit positive declaration at the registry level (`'ungated' => true`,
required whenever `permissions` is empty), or **(b)** a schema test over the real registry that
allow-lists the keys permitted to be ungated. **(b) is what shipped** — it is cheaper, adds no runtime
cost, and puts the allow-list somewhere a reviewer of the *registry* diff cannot avoid updating:

✅ Shipped — `tests/Feature/Navigation/SidebarModuleGatingTest.php`, quoted verbatim:

```php
// tests/Feature/Navigation/SidebarModuleGatingTest.php
test('every ungated registry item is on the explicit allow-list', function () {
    // Epic 1 ships exactly one deliberately ungated entry (Dashboard); this
    // is an allow-list, not a shape check, so a new item can only join it by
    // someone editing this line -- never silently by omission.
    $deliberatelyUngated = ['dashboard'];

    foreach (config('modules.items') as $key => $item) {
        expect($item)->toHaveKey('permissions')
            ->and($item['permissions'])->toBeArray();

        if ($item['permissions'] === []) {
            expect($key)->toBeIn($deliberatelyUngated);
        }
    }
});
```

**It asserts `toHaveKey('permissions')` alone rather than the full `toHaveKeys([...])` shape this
section originally recommended, and that narrowing is correct rather than a residual** — `permissions`
is the *only* registry key whose absence is silent. Verified against the real component and framework
source: `label`, `icon`, `route` and `current_when` are read by direct array access, so a missing one
raises `E_WARNING` "Undefined array key", which
[`HandleExceptions::handleError()`](../../vendor/laravel/framework/src/Illuminate/Foundation/Bootstrap/HandleExceptions.php)
rethrows as an `ErrorException` — a 500 on the dashboard, impossible to miss. A missing `group` is
silent but fails **closed**: `Collection::groupBy()` resolves it through `data_get()` and casts the
resulting `null` to `''`, so the item lands in a bucket no `config('modules.groups')` key ever matches
and is dropped. Only `empty()` both swallows the warning *and* fails open, so only `permissions` needs
pinning.

**Rule: in any registry where a permission list gates rendering, "no permission required" must be an
explicit value or an allow-listed key — never the absence of one. Do not read the gating key with
`empty()` / `??`, both of which erase the difference between "declared as ungated" and "the author
forgot".** This is the same family as [distinguishing "not hydrated" from "hydrated but null"](#a-guard-that-reads-a-rows-protected-identity-must-distinguish-not-hydrated-from-hydrated-but-null)
and [why `config($key, $default)` alone cannot cover a present-but-`null` key](#read-the-super-admin-role-name-with-a-literal-default),
arriving through a third door: a config array rather than a model attribute or a config scalar.

**Second half of the same rule: a registry entry's `permissions` must be pinned to its route's real
`can:` middleware by a test, not by a comment.** `config/modules.php` states the requirement in prose
("must be exactly the ability its route's `can:` middleware enforces") and it was correct as written —
but prose does not fail when someone changes one side. Found as F2 in the same audit and **closed in the
same story**; the check needs no fixtures:

✅ Shipped — `tests/Feature/Navigation/SidebarModuleGatingTest.php`, quoted verbatim:

```php
// tests/Feature/Navigation/SidebarModuleGatingTest.php
foreach (config('modules.items') as $item) {
    $route = Route::getRoutes()->getByName($item['route']);
    expect($route)->not->toBeNull();

    $gatedAbilities = collect($route->gatherMiddleware())
        ->filter(fn (string $middleware): bool => str_starts_with($middleware, 'can:'))
        ->map(fn (string $middleware): string => substr($middleware, strlen('can:')))
        ->values()
        ->all();

    expect($gatedAbilities)->toEqualCanonicalizing($item['permissions']);
}
```

Note it iterates **every** item including the ungated `dashboard`, whose route carries no `can:` gate at
all — `[]` on both sides, which is exactly the assertion that matters there. It also catches the inverse
drift the prose does not mention: an entry whose route *gains* a `can:` gate later while the registry
still lists none.

## A rate limit keyed on the target alone becomes an attack on the target the moment a second caller exists

Established by task 0015's finding **F6 part 2**, against a limiter that had been correct when it was
written and became a denial-of-service vector without a single line of it changing.

`App\Actions\Users\RequestEmailChange` throttled at `'email-change:'.$user->getKey()` — 3 per hour,
keyed on the **target**. That was right while `App\Livewire\Settings\Profile` was the only caller,
because there target ≡ actor and the key is really "this person's own allowance". Task 0004 added a
second, **cross-user** caller (an administrator editing someone else's row) and the same key silently
changed meaning: an administrator could now spend a victim's three attempts and leave them unable to
change their own address for the rest of the hour. Quota is a resource, and a shared key is a resource
one actor can consume on another's behalf.

**Neither obvious fix is sufficient alone**, which is the part worth carrying forward:

| Fix | Fixes the quota burn | Keeps the inbox-flood ceiling |
| --- | --- | --- |
| Re-key composite `(target, actor)` | ✅ | ❌ — N administrators each get their own 3/hour at one inbox |
| Add an actor-scoped limiter beside the unchanged target one | ❌ — the target's own 3 is still burnable | ✅ |
| **Both: composite key, plus a second target-aggregate limiter** | ✅ | ✅ |

✅ Good — the shipped shape ([`app/Actions/Users/RequestEmailChange.php`](../../app/Actions/Users/RequestEmailChange.php)),
with the four decisions that make it work:

```php
$actorKey = Auth::id() ?? 'unauthenticated';

// (1) narrower first — RateLimiter::attempt() CONSUMES on success
$key = 'email-change:'.$user->getKey().':'.$actorKey;   // 3/hour

$isSelfService = Auth::id() !== null && $user->is(Auth::user());

if (! $isSelfService) {
    $aggregateKey = 'email-change-target:'.$user->getKey();   // 10/hour
}
```

- **Check the narrower limiter first.** `RateLimiter::attempt()` consumes on success, so checking the
  aggregate first would burn shared quota on a request the composite key is about to refuse anyway.
  The residual asymmetry is fail-*closed* and accepted: when (1) passes and (2) refuses, the actor has
  spent one of *their own* attempts on a refused request — never one of the target's.
- **`Auth::id() ?? 'unauthenticated'` groups every session-less caller into one bucket.** This action
  has no `Gate` check of its own and is reachable without a session. Falling back to `$user->getKey()`
  would silently restore the burnable behaviour the composite key exists to remove.
- **The aggregate ceiling must exempt the target's own request** (Phase 4 re-audit finding **F-A**).
  Without the exemption, four administrators each staying inside their own composite cap exhaust the
  shared 10 and lock the target out of `settings/profile` for an hour — administrator activity
  producing exactly the outcome this whole change exists to prevent. The exemption is an **identity**
  check (`$user->is(Auth::user())`), the same idiom the Users screen uses for its own self-row rules.
- **An exemption removes a backstop, so the surviving control needs its own test** (re-audit finding
  **L-1**). Once the aggregate no longer applies to a self-service caller, the composite limiter is the
  *only* thing capping that caller's rate — and nothing in the suite proved it did, because every
  existing "self-service" test exhausted a *different* actor's allowance first, and the pre-existing
  throttle tests in `tests/Feature/Settings/EmailChangeTest.php` run with **no** `actingAs()` (so they
  exercise the `'unauthenticated'` path, where both limiters are live). The fix authenticates as the
  target and drives four real requests through `App\Livewire\Settings\Profile`.

**Rule.** A rate-limit key encodes an assumption about who the callers are. When an action gains a
caller for whom **target ≢ actor**, every key it uses has to be re-derived — and the replacement is
normally *two* limiters, because one key cannot express both "this person's own allowance" and "how
much traffic anyone may aim at this person". Same reasoning applies to any other consumable keyed on a
subject rather than on the actor: verification-code sends, invitation resends, export jobs.

## Confirmed safe: a sidebar built on `Gate::any()` inherits the Super Admin bypass, and both refusal paths fail closed

Recorded from story 0013's Phase 4 audit so a later epic plugging its module into `config/modules.php`
does not re-derive any of it. Every claim below was verified against the installed vendor source plus
a live render, not reasoned from the package's docs.

- **`Gate::any()` runs the whole `before`-callback chain.** `Gate::any()` → `check()` → `inspect()` →
  `raw()`, whose first act is `callBeforeCallbacks()`. So the sidebar filter and the route's `can:`
  middleware traverse the *identical* mechanism — they cannot disagree about guard resolution, about
  wildcard handling, or about the Super Admin. This is what makes the story's "no sidebar-local special
  case for the Super Admin" criterion true rather than coincidental.
- **The two `Gate::before` callbacks compose in either registration order.** Spatie's
  (`PermissionRegistrar::registerPermissions()`) returns `checkPermissionTo($ability) ?: null` — `null`
  on failure, never `false` — so it never short-circuits the chain, and this app's Super Admin closure
  in `AppServiceProvider` still gets its turn. A `before` callback that returned a hard `false` would
  break this; none does.
- **`hasAnyPermission()` would have been the inverse of the requirement**, and this is a correctness
  fork rather than a style preference: it is a `HasPermissions` trait method that queries the model's
  own relations and never reaches the Gate, so the Super Admin — who holds *zero* permission rows by
  design — would see an empty sidebar. Same for `hasPermissionTo()` and `hasRole()`.
- **An ability that is not a seeded permission denies rather than throws.** `checkPermissionTo()`
  catches `PermissionDoesNotExist` and returns `false`. A registry entry naming a permission the
  catalog does not hold therefore hides itself from everyone but the Super Admin — silently, which is
  the safe direction but is worth knowing when an entry mysteriously never appears.
- **A guest never reaches a positive result.** `Gate::any()` resolves a `null` user; Spatie's callback
  is skipped (its first parameter is typed `Authorizable`, non-nullable), this app's closure declines
  on `! $user instanceof User`, and an ability with no registered callback resolves to `null` → denied.
  The layout itself is unreachable while signed out anyway (`auth()->user()->name` on line 22), so this
  is a second line, not the first.
- **The rendered markup is escaped in every position.** Verified by rendering the component with
  hostile values injected into the group `heading`, the item `label`, the `class`, and both the group
  and item **array keys** (which land inside `data-test="…"`): all four emit HTML-entity-escaped output.
  The `wire:navigate` on each item is a bare directive with no interpolated argument, so
  [the `@js()` rule for `wire:*` values](blade-livewire-output-encoding.md#--inside-a-wire-directive-is-not-escaping--it-is-an-injection-sink)
  is not engaged here — it *would* be the moment an entry needs `wire:click="…($id)"`.
- **`flux:sidebar.group` renders its slot twice when it is both `expandable` and carries an `icon`** —
  exactly the "Settings" group. `data-test="sidebar-link-roles"` therefore appears **2×** in the real
  HTML while `data-test="sidebar-group-settings"` appears 1× (the group's `$attributes` land only on
  the `<ui-disclosure>` wrapper, not on the collapsed-sidebar `<flux:dropdown>` duplicate). Confirmed by
  counting the real render. Presence/absence assertions are unaffected; a **count** assertion would be
  off by a constant and read as correct — see [errors-log.md](../errors-log.md#a-count-based-assertion-over-rendered-html-counted-a-wrapper-element-it-never-meant-to-include--2026-08-21).

## Confirmed safe: a `can:`-gated route's 403 names no permission — and `APP_DEBUG` is not what makes that true

Established by task 0012's Phase 4 audit, which had to independently verify the "the refusal discloses
no permission name" acceptance criterion every future module route will inherit. The conclusion holds,
but **not for the reason it is intuitive to assume**, and the difference decides what can break it.

`can:<ability>` is `Illuminate\Auth\Middleware\Authorize`, which throws `AuthorizationException`.
`Handler::prepareException()` converts that to a Symfony `AccessDeniedHttpException` carrying the
generic message `This action is unauthorized.` — the ability string is never part of the exception.
From there:

```php
// vendor/laravel/framework/src/Illuminate/Foundation/Exceptions/Handler.php — prepareResponse()
if (! $this->isHttpException($e) && config('app.debug')) {
    return $this->toIlluminateResponse($this->convertExceptionToResponse($e), $e)->prepare($request);
}
// ... otherwise: renderHttpException($e) -> the errors::403 view
```

An `AccessDeniedHttpException` **is** an `HttpException`, so that first branch is unreachable for it:
a 403 is rendered by `errors::403` at *every* debug setting, and that view's whole body is
`@section('message', __($exception->getMessage() ?: 'Forbidden'))`. Verified by rendering the real
handler against the real `users.index` route rather than by reading: the HTML response is
**byte-identical (6605 bytes) with `app.debug` true and false**, and contains neither `users.view` nor
`can:users.view` nor the word `middleware` in either case.

That last point matters because the framework's debug error page **does** render the route's middleware
list — `Exception::applicationRouteContext()` returns `'middleware' => implode(', ', $route->gatherMiddleware())`,
which for this route is the literal `web, auth, verified, can:users.view`. It is simply never reached
by a 403. So:

- ❌ Do **not** write a test (or a comment) claiming `config(['app.debug' => false])` is what keeps the
  ability name out of a 403 body. It is inert on this path, and stating it hides the real mechanism.
- ✅ Do assert the **positive** half as well as the negative one. `assertForbidden()` plus
  `assertDontSee('users.view')` are *both* satisfied by an empty body, so the pair proves nothing on
  its own; add `assertSee('This action is unauthorized.')` so the test pins that the generic error page
  rendered and that the message is still the generic one.

**Rule.** The guarantee rests on exactly two things, and a change to either is what a future audit must
look for — not at `APP_DEBUG`:

1. **No app-owned `resources/views/errors/403.blade.php` exists.** `getHttpExceptionView()` prefers an
   application view over the framework's. A branded 403 that renders anything beyond the message (route
   context, a "you need X" hint, a debug dump) reopens the disclosure, and it is a *frontend* story that
   would do it.
2. **No gate on these routes returns `Response::deny('…')` with a message naming an ability.** The 403
   body is the exception message, so a custom deny string is printed verbatim to the refused actor. The
   two `assertDontSee` tests in `tests/Feature/Authorization/ModuleRouteAccessTest.php` do catch this
   one — keep them when adding a module gate.

One genuinely debug-dependent path remains, and it is not a permission disclosure:
[`bootstrap/app.php`](../../bootstrap/app.php) registers
`shouldRenderJsonWhen(fn ($request) => $request->is('api/*') || $request->expectsJson())`, and
`convertExceptionToArray()` adds `exception`, `file`, `line` and a full `trace` to a JSON 403 when
`app.debug` is true. Frame **arguments are stripped**, so the ability string still does not appear
(verified) — but absolute paths and vendor frames do. `.env.example` ships `APP_DEBUG=true`, so this is
one more reason a deployment must pin `APP_DEBUG=false`; it is not a reason to treat the HTML 403 as
debug-sensitive.

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

_Last updated: 2026-08-24 — Task 0015 (Users CRUD security hardening): added **"A rate limit keyed on the target alone becomes an attack on the target the moment a second caller exists"** (finding F6 part 2) — the `RequestEmailChange` limiter that was correct while `Settings\Profile` was its only caller and became a quota-burn vector when task 0004 added a cross-user one, with the table showing why **neither** obvious fix works alone, the four decisions in the shipped two-limiter shape (check the narrower key first because `RateLimiter::attempt()` consumes on success; `Auth::id() ?? 'unauthenticated'` and never `$user->getKey()`; the aggregate ceiling must exempt the target's **own** request, re-audit finding F-A; and an exemption that removes a backstop needs a dedicated test for the surviving control, re-audit finding L-1). Added a **Confirmed safe** block to **"Authorization that consults a relation must reload it before the first check reads it"**: this story's audit-log capture (finding F5) makes `App\Livewire\Users\Index::updateExistingUser()` a **second** caller that pre-hydrates `roles` one statement above the `UpdateUser` call, safe **only** because `__invoke()` uses `load()` rather than `loadMissing()` — so that clause is now load-bearing against this repo's own code rather than against a hypothetical caller. Nothing else on this page changed meaning; the disclosure-gate rule this story also produced belongs to [livewire-authorization.md](livewire-authorization.md#the-shipped-disclosure-gates-and-why-the-disclosure-check-is-the-stronger-ability) and is not duplicated here._

_Previously: 2026-08-22 — Task 0013, Phase 6 docs sync (sidebar module gating — UI): **closed** the registry section's F1/F2 status banner, which still read "open finding … as of story 0013's Phase 4 audit" while both remediations had already shipped in the same story (Phase 5 code-review finding). Both ✅ blocks are now the **real shipped tests** from [`tests/Feature/Navigation/SidebarModuleGatingTest.php`](../../tests/Feature/Navigation/SidebarModuleGatingTest.php), quoted verbatim, in place of the recommendation snippets they replaced. Recorded why the shipped allow-list test asserts `toHaveKey('permissions')` alone rather than the fuller `toHaveKeys([...])` shape originally recommended — **it is a correct narrowing, not a residual**: `permissions` is the only registry key whose absence is silent, because it is the only one read through `empty()`; the four keys read by direct array access raise an `E_WARNING` that `HandleExceptions::handleError()` rethrows as an `ErrorException` (a loud 500), and a missing `group` fails **closed** through `Collection::groupBy()`'s `data_get()` → `''` bucket. Both facts verified against framework source rather than assumed. The reusable pattern this registry establishes for later epics is now documented in [architecture/authorization.md](../architecture/authorization.md#the-second-half-of-a-module-gate-the-sidebar-registry), which this page points at rather than duplicating._

_Previously: 2026-08-21 — Task 0013, Phase 4 audit (sidebar module gating — UI): added two sections for this repo's first **declarative permission registry** (`config/modules.php`), whose whole design is that every later epic appends entries to it. **A registry that means "ungated" by absence fails open, silently** is an open finding written as a ❌/✅ pair — `empty($item['permissions'])` cannot distinguish "declared ungated" from "the author forgot the key", verified by execution across three silent fail-open shapes and two fail-closed ones, plus the recommendation that a registry entry's permissions be pinned to its route's real `can:` middleware by a test rather than by a comment. **Confirmed safe: a sidebar built on `Gate::any()`** records the six things a later epic should not re-derive — why `Gate::any()` traverses the identical mechanism as `can:` middleware, why the two `Gate::before` callbacks compose in either order, why `hasAnyPermission()` would have been the exact inverse of the requirement, why an unseeded ability and a guest both deny rather than throw, that the rendered markup is escaped in every position including the `data-test` array keys, and that `flux:sidebar.group` renders its slot twice when `expandable` and `icon` are combined._

_Previously: 2026-08-21 — Task 0012, Phase 6 docs sync: **Flush the permission cache after the transaction commits** gained the three real call sites that now hold its shape (`RolePermissionSeeder`, plus `saveRole()` / `deleteRole()` since this story's Phase 4 fix), and a ⚠️ recording why this rule was violated in the first place — the flush at issue was the **vendor's**, fired from inside `syncPermissions()` and `Role`'s `deleted` event, so task 0010's `DB::transaction()` wrapper moved it pre-commit with no flush line appearing anywhere in that diff. Generalised as: wrapping existing code in a transaction is a change to every side effect that code already performed. The [confirmed-safe 403 section](#confirmed-safe-a-can-gated-routes-403-names-no-permission--and-app_debug-is-not-what-makes-that-true) below was re-verified against the shipped `ModuleRouteAccessTest.php` in this pass — its code quotes, the `assertSee`/`assertDontSee` pairing and both named reopening conditions still match the real files, so it needed no correction (the [audit-authored-page rule](../errors-log.md#a-security-page-documented-the-vulnerable-code-as-current-because-it-was-written-before-its-own-fix--2026-08-20) says to check, not to assume)._

_Previously: 2026-08-21 — Task 0012 (module/sidebar access gating — backend), Phase 4 audit: added
"Confirmed safe: a `can:`-gated route's 403 names no permission — and `APP_DEBUG` is not what makes that
true". The story ships no production code, so this is a **confirmed-safe** entry rather than a bypass —
but the reason the guarantee holds is not the one the story's own test comment assumed, and the
difference decides what a future story could break: an app-owned `errors/403.blade.php` or a
`Response::deny('…')` message, never the debug flag. Verified by rendering the real exception handler
against the real `users.index` route at both debug settings (byte-identical 6605-byte body), and by
reading `Exception::applicationRouteContext()`, which **does** render `can:users.view` on the debug page
a 403 never reaches._

_Previously: 2026-08-20 — Task 0010, Phase 6 docs sync: added "An identity derived from a mutable
column must be locked once code exists that can mutate it", the durable rule behind that story's Phase 4
round-1 finding **F1** (High) — the only round-1 finding whose lesson was not already covered here. It
is the counterpart to task 0008a's centralization work: centralizing an identity onto a column is safe
until a screen can write that column, and the story that ships the screen owns locking it. Includes the
"lock exactly what the identity depends on, and nothing more" constraint (the Administrator row's
permission set stays editable on purpose) and the sanctioned-bypass requirement without which adding a
`creating` guard breaks the seeder in production._

_Previously: 2026-08-20 — Task 0010's Phase 4 re-audit (round 2): added "Two guards on one payload
must agree on what an omission means". Unlike every other section on this page it documents **no live
bypass** — the roles screen's two transformers handle omission in opposite ways, which is safe only
because `permissionOptions()` renders the permission catalog unfiltered. It is written as a
forward-looking rule because the obvious next step for the sibling UI story (hiding permissions the
actor cannot grant) is exactly what would turn the divergence into the silent-revoke bug the section
above it records. Also records that the two actions' call order is **not** what keeps them from
disagreeing (verified by reversing them), and that a grant-scope rule leaves revocation unrestricted
by construction._

_Previously: 2026-08-20 — Task 0009's three Phase 4 rounds: added "A full-set sync behind a
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
