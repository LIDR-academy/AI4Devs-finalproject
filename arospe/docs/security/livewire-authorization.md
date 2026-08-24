# Livewire Component Authorization

Rules governing how a **full-page Livewire component** is authorized in this repo, established while
auditing task 0004 (`App\Livewire\Users\Index`, the first permission-gated screen). Everything here
was verified against the installed `livewire/livewire` v4 source, not inferred from the docs.

## Table of Contents

- [`/livewire/update` is a second entry point, and only an allow-listed subset of route middleware follows the component there](#livewireupdate-is-a-second-entry-point-and-only-an-allow-listed-subset-of-route-middleware-follows-the-component-there)
- [Gate at the top of every method that mutates or discloses](#gate-at-the-top-of-every-method-that-mutates-or-discloses)
  - [The shipped disclosure gates, and why the disclosure check is the *stronger* ability](#the-shipped-disclosure-gates-and-why-the-disclosure-check-is-the-stronger-ability)
- [`#[Locked]` is what makes `Rule::unique()->ignore()` safe here](#locked-is-what-makes-ruleunique-ignore-safe-here)
- [Every server-derived property is `#[Locked]`, not just the ids](#every-server-derived-property-is-locked-not-just-the-ids)
- [Authorization that lives only in the component is bypassed by every other call site of the action](#authorization-that-lives-only-in-the-component-is-bypassed-by-every-other-call-site-of-the-action)

## `/livewire/update` is a second entry point, and only an allow-listed subset of route middleware follows the component there

Every Livewire action (`save()`, `deleteUser()`, …) is a `POST /livewire/update`, **not** a request to
the component's own route. Livewire re-applies route middleware only for the classes hardcoded in
`Livewire\Mechanisms\PersistentMiddleware\PersistentMiddleware::$persistentMiddleware`. The installed
list (`vendor/livewire/livewire/src/Mechanisms/PersistentMiddleware/PersistentMiddleware.php`) is:

```php
protected static $persistentMiddleware = [
    \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
    \Laravel\Jetstream\Http\Middleware\AuthenticateSession::class,
    \Illuminate\Auth\Middleware\AuthenticateWithBasicAuth::class,
    \Illuminate\Routing\Middleware\SubstituteBindings::class,
    \App\Http\Middleware\RedirectIfAuthenticated::class,
    \Illuminate\Auth\Middleware\Authenticate::class,
    \Illuminate\Auth\Middleware\Authorize::class,
    \App\Http\Middleware\Authenticate::class,
];
```

Read it for what is **absent**, not only for what is present:

| Route middleware | Class | Follows the component to `/livewire/update`? |
| --- | --- | --- |
| `auth` | `Illuminate\Auth\Middleware\Authenticate` | ✅ yes |
| `can:<ability>` | `Illuminate\Auth\Middleware\Authorize` | ✅ yes |
| `permission:` / `role:` / `role_or_permission:` (Spatie) | `Spatie\Permission\Middleware\*` | ❌ **no** |
| `verified` | `Illuminate\Auth\Middleware\EnsureEmailIsVerified` | ❌ no |
| `password.confirm` | `Illuminate\Auth\Middleware\RequirePassword` | ❌ no |
| `throttle:` | `Illuminate\Routing\Middleware\ThrottleRequests` | ❌ no |

✅ Good — the real route, which gates with `can:` precisely because Spatie's middleware is not on that
list:

```php
// routes/users.php
Route::livewire('users', UsersIndex::class)
    ->middleware(['can:users.view'])
    ->name('users.index');
```

Spatie registers every permission as a Gate ability, so `can:users.view` is equivalent in meaning and
**is** re-applied on every action round-trip. `permission:users.view` would protect only the initial
`GET /users`.

❌ Bad — reads as equivalent, and leaves every `save()` / `deleteUser()` round-trip ungated at the
route layer:

```php
// anti-pattern — do not do this on a Livewire route
Route::livewire('users', UsersIndex::class)->middleware(['permission:users.view']);
```

Two corollaries that are easy to miss:

- **`throttle:` does not follow the component either.** Rate limiting a Livewire screen at the route
  is decorative; the limit has to live inside the action (as `App\Actions\Users\RequestEmailChange`
  does with `RateLimiter::attempt()`), or in a `Livewire::actionThrottle`-style guard inside the
  component. Do not assume a route-level `throttle:` covers a component method.
- **`password.confirm` does not follow the component either.** `settings/security` carries it at the
  route, so it protects the page load only — a hijacked session that already holds a rendered snapshot
  is not re-challenged per action.

## Gate at the top of every method that mutates or discloses

Because the route-level `can:` only proves the *page-level* ability (`users.view` here), each method
must still authorize its own, narrower ability, as its **first statement**, before it reads input or
touches the database:

```php
// app/Livewire/Users/Index.php
public function save(CreateUser $createUser, UpdateUser $updateUser, RequestEmailChange $requestEmailChange): void
{
    $target = null;

    if ($this->editingUserId === null) {
        Gate::authorize('create', User::class);
    } else {
        $target = User::findOrFail($this->editingUserId);
        Gate::authorize('update', $target);
    }

    $this->email = Str::lower($this->email);
    // ...
}
```

`mount()` authorizes too (`Gate::authorize('viewAny', User::class)`) — that is not redundant with the
route middleware, because `Livewire::test()` and any nested-component mount reach `mount()` without a
route.

The scope of the rule is **"mutates or discloses"**, not "mutates". A method such as
`openEditModal(string $userId)` writes no row, but it reads a target user and copies their attributes
into public component state — that is a disclosure step and it belongs behind the same ability the
subsequent write requires.

### The shipped disclosure gates, and why the disclosure check is the *stronger* ability

Task 0004's audit named that gap (finding **F7**); **task 0015 closed it.** Until then all three of
`App\Livewire\Users\Index`'s openers — `openCreateModal()`, `openEditModal()` and `confirmDelete()` —
performed **no** authorization at all, so any holder of `users.view` could call
`openEditModal($someId)` over `/livewire/update` and read back another user's `pending_email` and
`status` in the response snapshot. The three shipped gates:

```php
// app/Livewire/Users/Index.php
public function openCreateModal(): void
{
    Gate::authorize('create', User::class);
    // ...
}

public function openEditModal(string $userId): void
{
    $target = User::findOrFail($userId);

    if (! $target->is(Auth::user())) {
        Gate::authorize('updateSensitiveAttributes', $target);
    }
    // ... only now are $editingPendingEmail / $status / … assigned
}

public function confirmDelete(string $userId): void
{
    $target = User::findOrFail($userId);

    Gate::authorize('delete', $target);
    // ... only now are $deletingUserId / $deletingUserName assigned
}
```

Four properties, each of which is the answer to a question this shape reliably raises:

- **The edit opener asks a *stronger* ability than the write it precedes, and that is not an
  inversion.** `save()`'s edit branch authorizes plain `update`; the opener authorizes
  `updateSensitiveAttributes`. The asymmetry is correct because the two happen under different
  conditions: on the write path the stronger ability is asked by `UpdateUser` **conditionally** — only
  once a status or email change is actually detected (`$emailChanged || $statusChanged`) — whereas the
  opener discloses `pending_email` and `status` **unconditionally**, before the actor has decided
  anything. `UserPolicy::updateSensitiveAttributes()` is the ability named after exactly those two
  attributes, so the disclosure is gated on the ability that owns what is being disclosed. **Rule: a
  disclosure gate must cover every attribute the method copies out, not the operation the actor might
  go on to perform.**
- **The component performs no tier lookup to get there.** The obvious-looking alternative — "if the
  target holds `Administrator`, ask `updateSensitiveAttributes`, else ask `update`" — was rejected: it
  is the exact `administratorRoleId()` / `authorizeRoleChange()` shape task 0008a **deleted** from this
  same component (see [the section below](#authorization-that-lives-only-in-the-component-is-bypassed-by-every-other-call-site-of-the-action)).
  No branch is needed, because the policy already contains it: `updateSensitiveAttributes()` delegates
  to `update()` first and then returns `true` outright for any target that does not hold the
  Administrator role. The unconditional call is therefore **identical to `update` for an ordinary
  target and strictly stronger for an Administrator-holding one** — one call site, zero role knowledge
  in the component.
- **The one branch that does exist is an identity check, never a role check.** `$target->is(Auth::user())`
  exempts the actor's own row, mirroring the identity exemption `UpdateUser`'s `$isSelfEdit` already
  applies at the write layer: `pending_email` and `status` are not a disclosure to the row's own owner,
  who already reads both at `settings/profile`. Accepted side effect, recorded rather than discovered
  later: an actor holding only `users.view` can open **their own** edit modal, which is no regression
  (the method had no check at all before) and grants no write — `save()` and `UpdateUser` still refuse
  any actual change.
- **`confirmDelete()` gets no such exemption, deliberately.** Its gate protects an *irreversible
  action*, not a disclosure, so "my own row" is not a reason to relax it. The consequence is that an
  actor whose own row holds `Administrator` is refused at `confirmDelete()` with an
  `AuthorizationException` — the same refusal `UserPolicy::delete()` produces for any other
  Administrator-holding target — rather than reaching `deleteUser()`'s self-delete no-op (see
  [architecture/authorization.md](../architecture/authorization.md#gateallows-in-a-list-query-is-a-ui-hint-not-a-layer)).
  Stricter, and accepted as such.

Two consequences for tests, both of which task 0015 had to absorb: a test that used to prove a
mutating method refuses (`save()`, `deleteUser()`) can no longer reach it by calling the opener as an
under-privileged actor, because the opener now throws first — and it cannot skip the opener either,
since `#[Locked] $editingUserId` / `$deletingUserId` are writable only there. The shape that works,
already shipped twice in this repo, is to call the opener **while the actor still holds the
permission**, then revoke it and flush the permission cache, then call the mutating method
(`tests/Feature/Users/IndexTest.php`, `tests/Feature/Roles/IndexTest.php`). Second: an
exception-only assertion is not enough for a disclosure gate — assert the component's **state**
(`assertSet('editingPendingEmail', null)`), because a check placed *after* the assignments would pass
an exception-only test while having already disclosed the values.

## `#[Locked]` is what makes `Rule::unique()->ignore()` safe here

Laravel's validation documentation is explicit that user-controlled input must never reach
`Rule::unique()->ignore()`. The edit path here passes `$this->editingUserId` straight into it:

```php
// app/Concerns/ProfileValidationRules.php
Rule::unique(User::class)->ignore($userId)
```

```php
// app/Livewire/Users/Index.php
$validated = $this->validate([
    ...$this->profileRules($this->editingUserId),
    // ...
]);
```

That is safe for exactly two reasons, and both must hold:

1. `#[Locked] public ?string $editingUserId` — Livewire throws
   `CannotUpdateLockedPropertyException` on any client attempt to change it, so it is not request
   input.
2. The only writer is `openEditModal()`, and it assigns `$target->id` — a value read back **out of
   the database** (`User::findOrFail($userId)->id`), never the raw method argument.

If either changes — the attribute is dropped, or the id is assigned straight from the argument — the
`ignore()` call becomes a user-controlled value again. Treat those two lines as a pair.

## Every server-derived property is `#[Locked]`, not just the ids

A Livewire public property is client-writable unless locked. The distinction is not "is it an id" but
"is this value ever legitimate request input". Form fields (`$name`, `$email`, `$roleId`, `$status`)
are input. Anything the server computed and only renders back is not.

✅ Good — `App\Livewire\Settings\Security` locks its derived list as well as its target id:

```php
// app/Livewire/Settings/Security.php
/**
 * @var array<int, array{id: int, name: string, authenticator: string|null, created_at_diff: string, last_used_at_diff: string|null}>
 */
#[Locked]
public array $passkeys = [];

#[Locked]
public ?int $deletingPasskeyId = null;
```

Leaving a derived array unlocked means a client can rewrite the rows the view will render: it turns
every unescaped output in that view into a self-injection sink, and it lets the confirmation copy on a
destructive modal disagree with the locked id the action will actually operate on.

**`App\Livewire\Users\Index::$users` was the last unlocked one, and task 0015 (finding F4) locked it.**
That screen's markup has shipped since task 0006, so the sink above was live rather than theoretical.
The lock has one cost worth knowing before writing a test against a list component: **`Livewire::test()->set('users', [])` now raises `CannotUpdateLockedPropertyException`**, and two existing
tests used exactly that — one incidentally (proving `usersSummary()` computes from its own query rather
than from the array) and one as its *only* mechanism (the empty-state branch, unreachable through a
sign-in journey because `loadUsers()` always finds the acting administrator's own row). Both were
rewritten rather than deleted or weakened: the first asserts `usersSummary()` against database state
`$users` could not have supplied, the second empties the result set through the `SoftDeletingScope` —
a state production can never reach (see
[soft-delete-patterns.md](soft-delete-patterns.md)), which is what makes it a safe test-only mechanism.
**Rule: locking a derived property is a change to every test that wrote it — the coverage each one
carried must survive the rewrite, through a mechanism the application itself owns.**

## Authorization that lives only in the component is bypassed by every other call site of the action

The rule for this repo: **a privilege rule about *which* role may be assigned belongs in the action,
the policy, or the validation rule set — not in the screen that happens to be the only caller today.**
A Livewire component is a delivery mechanism; an Artisan command, a queued job, a future REST
controller or a sibling screen calling the same action inherits none of its `Gate::authorize()` calls.

**Task 0004's audit recorded this as an open gap on the Users screen; task 0008a closed it.** The
before/after is worth keeping, because the *shape* of the gap recurs on every module screen:

| Control | Where it lived (task 0004) | Where it lives now (task 0008a) |
| --- | --- | --- |
| "Super Admin is never assignable" | `UserValidationRules::roleRules()` — survives, if the caller validates | **also** a direct `throw` in `CreateUser` / `UpdateUser`, which survives regardless |
| "a Super Admin holder is not editable" | `UserPolicy::update()` — survives, if the caller gates | **also** a direct `throw` in `UpdateUser`, which additionally binds a Super Admin actor |
| "adding/removing `Administrator` needs `roles.manage-administrators`" | ❌ `App\Livewire\Users\Index::authorizeRoleChange()` only | ✅ `UpdateUser` / `CreateUser` themselves; the component method is deleted |
| "changing an `Administrator`'s `status`/`email` needs `roles.manage-administrators`" | ⚠️ the ability travelled (`UserPolicy::updateSensitiveAttributes()`) but the **decision that a change occurred** stayed in the component | ✅ both live in `UpdateUser`, which compares against `getRawOriginal()` |

That last row was the finer-grained case and the instructive one: pushing the *rule* into a policy is
not enough while the **trigger** — comparing the submission against stored state to decide whether the
ability applies at all — stays in the caller. A second caller inherits an ability nothing ever asks.

Two rules to carry forward, both proven by how this was closed:

- **Move the check, don't duplicate it.** The component still authorizes `create` / `update` / `delete`
  at its own call sites (defence in depth, and `deleteUser()` calls no action at all), but there is
  exactly **one** implementation of each tier rule. Two copies drift.
- **A caller-supplied flag is not a guard.** `UpdateUser` used to receive the self-lockout boolean from
  the component; it now derives it from `Auth::user()` itself. See
  [conventions/base-standards.md](../conventions/base-standards.md#an-authorization-rule-belongs-to-the-action-not-to-one-of-its-callers)
  for the convention, and
  [authorization-patterns.md](authorization-patterns.md#a-rule-that-must-bind-a-super-admin-actor-must-be-a-direct-throw-not-a-gate-check)
  for why the two Super Admin refusals are direct throws rather than `Gate` checks.

_Last updated: 2026-08-24 — Task 0015 (Users CRUD security hardening): the "mutates **or discloses**" rule had been stated here since task 0004's audit while the screen it was written about gated **none** of its three openers. It does now, so the section gains the shipped example — `openCreateModal()` → `create`, `confirmDelete()` → `delete`, `openEditModal()` → `updateSensitiveAttributes` — with the four properties that make it copyable: why the disclosure gate asks a **stronger** ability than the write it precedes (the write path asks it *conditionally*, once a status/email change is detected; the opener discloses those two attributes *unconditionally*), why the component performs **no** tier lookup to get there (`UserPolicy::updateSensitiveAttributes()` already contains the branch, so the unconditional call is identical to `update` for an ordinary target and strictly stronger for an Administrator-holding one — re-deriving it would reinstate the shape task 0008a deleted), why the one branch that exists is an **identity** check with its accepted side effect, and why `confirmDelete()` carries no such exemption. Plus the two test consequences: an under-privileged actor can no longer reach a mutating method through its opener, and a disclosure gate needs a **state** assertion rather than an exception-only one. Also recorded `$users` as `#[Locked]` (finding F4 — the last unlocked derived property on that screen) and the rule that locking one is a change to every test that wrote it._

_Previously: 2026-08-21 — Task 0012, Phase 6 link sweep: fixed this file's own table-of-contents anchor for the `#[Locked]` section — `Rule::unique()->ignore()` slugifies to `ruleunique-ignore`, not `ruleuniqueignore`, because the hyphen in `->` survives. Content unchanged._

_Previously: 2026-08-20 — Task 0040: the ✅ `can:`-gated route quote now cites
[`routes/users.php`](../../routes/users.php), the per-area file `users.index` moved into. The rule it
illustrates is untouched — the declaration, its middleware and the `PersistentMiddleware` allow-list
behind it are byte-identical; only the file the route is declared in changed._

_Previously, 2026-08-19 — Task 0008a: rewrote this section, whose claim that `CreateUser` /
`UpdateUser` "carry no authorization of their own" the story made false. The gap it documented is
closed; the before/after table is kept because the shape recurs on every module screen._

_Previously, 2026-08-13 — Created from the Phase 4 audit of task 0004 (Users list + create/edit
backend), the repo's first permission-gated Livewire screen; extended in the same task's Phase 4
re-audit with the `updateSensitiveAttributes` guard added by finding F1's fix._
