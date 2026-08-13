# Livewire Component Authorization

Rules governing how a **full-page Livewire component** is authorized in this repo, established while
auditing task 0004 (`App\Livewire\Users\Index`, the first permission-gated screen). Everything here
was verified against the installed `livewire/livewire` v4 source, not inferred from the docs.

## Table of Contents

- [`/livewire/update` is a second entry point, and only an allow-listed subset of route middleware follows the component there](#livewireupdate-is-a-second-entry-point-and-only-an-allow-listed-subset-of-route-middleware-follows-the-component-there)
- [Gate at the top of every method that mutates or discloses](#gate-at-the-top-of-every-method-that-mutates-or-discloses)
- [`#[Locked]` is what makes `Rule::unique()->ignore()` safe here](#locked-is-what-makes-ruleuniqueignore-safe-here)
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
// routes/web.php
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

Leaving a derived array unlocked means a client can rewrite the rows the view will render, which
matters as soon as the real markup lands: it turns every unescaped output in that view into a
self-injection sink, and it lets the confirmation copy on a destructive modal disagree with the
locked id the action will actually operate on.

## Authorization that lives only in the component is bypassed by every other call site of the action

`app/Actions/Users/CreateUser.php` and `app/Actions/Users/UpdateUser.php` carry **no** authorization
of their own: they apply whatever role and status they are handed. The administrator-level rules
(`promoteToAdministrator`, `downgrade`) are enforced in `App\Livewire\Users\Index` alone.

Contrast the two exclusions that *do* survive a second call site, and note why:

| Control | Where it lives | Survives a non-Livewire caller? |
| --- | --- | --- |
| "Super Admin is never assignable" | `UserValidationRules::roleRules()` — `Rule::exists(...)->whereNot('name', 'Super Admin')` | ✅ yes, if the caller validates |
| "a Super Admin holder is not editable" | `UserPolicy::update()` | ✅ yes, if the caller gates |
| "adding/removing `Administrator` needs `roles.manage-administrators`" | `App\Livewire\Users\Index::authorizeRoleChange()` | ❌ **no** |

The rule for this repo: **a privilege rule about *which* role may be assigned belongs in the policy or
the validation rule set, not in the screen that happens to be the only caller today.** A Livewire
component is a delivery mechanism; an Artisan command, a queued job, a future REST controller or a
sibling screen calling the same action inherits none of its `Gate::authorize()` calls. When a rule is
left in the component for scope reasons, say so in the action's docblock so the next caller has to
read it.

_Last updated: 2026-08-13 — Created from the Phase 4 audit of task 0004 (Users list + create/edit
backend), the repo's first permission-gated Livewire screen._
