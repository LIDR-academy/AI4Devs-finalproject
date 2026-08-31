# Livewire Component Authorization

Rules governing how a Livewire component is authorized in this repo, established while
auditing task 0004 (`App\Livewire\Users\Index`, the first permission-gated screen). Everything here
was verified against the installed `livewire/livewire` v4 source, not inferred from the docs.

**Since story 0020 this page covers two shapes, not one.** Everything through task 0018 was about a
**full-page** component sitting behind its own route; `App\Livewire\Media\Gallery` is the first
**embedded child** with no route of its own, and the difference is not cosmetic — it is which of
these rules still has a backstop behind it. Read
[the routeless case](#the-routeless-case-a-component-with-no-route-has-no-per-request-backstop-at-all)
before applying anything here to an embedded component.

## Table of Contents

- [`/livewire/update` is a second entry point, and only an allow-listed subset of route middleware follows the component there](#livewireupdate-is-a-second-entry-point-and-only-an-allow-listed-subset-of-route-middleware-follows-the-component-there)
  - [The worked example for the `password.confirm` row (task 0015a)](#the-worked-example-for-the-passwordconfirm-row-task-0015a)
- [Gate at the top of every method that mutates or discloses](#gate-at-the-top-of-every-method-that-mutates-or-discloses)
  - [The shipped disclosure gates, and why the disclosure check is the *stronger* ability](#the-shipped-disclosure-gates-and-why-the-disclosure-check-is-the-stronger-ability)
  - [Gating a method is not the same as knowing when the gate fired](#gating-a-method-is-not-the-same-as-knowing-when-the-gate-fired)
  - [The routeless case: a component with no route has no per-request backstop at all](#the-routeless-case-a-component-with-no-route-has-no-per-request-backstop-at-all)
- [`#[Locked]` is what makes `Rule::unique()->ignore()` safe here](#locked-is-what-makes-ruleunique-ignore-safe-here)
- [Every server-derived property is `#[Locked]`, not just the ids](#every-server-derived-property-is-locked-not-just-the-ids)
  - [Confirmed safe: `wire:click="$toggle('prop')"` is the same write channel as `wire:model`, and `#[Locked]` still binds it](#confirmed-safe-wireclicktoggleprop-is-the-same-write-channel-as-wiremodel-and-locked-still-binds-it)
- [A save-time gate and its display-only twin must share one resolution method, or the two will drift](#a-save-time-gate-and-its-display-only-twin-must-share-one-resolution-method-or-the-two-will-drift)
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

### The worked example for the `password.confirm` row (task 0015a)

That row sat in the table above as a bare ❌ from task 0004 until task 0015a became the **first code in
this repo to act on it**. It is the clearest case in the table, because the naive fix is not merely
weaker than the shipped one — it is *inert* for the thing it would be added to protect.

❌ Bad — the shape a reader who has not internalised the allow-list will reach for (adapted to
illustrate; deliberately **not** present in `routes/users.php`, which task 0015a leaves unchanged):

```php
// anti-pattern on a Livewire route — guards the initial GET /users and nothing else.
// save() and deleteUser() run on /livewire/update, where RequirePassword never executes.
Route::livewire('users', UsersIndex::class)
    ->middleware(['can:users.view', 'password.confirm']);
```

Two failures at once, and the second is easy to miss: every privileged mutation stays unguarded, **and**
a name-only edit — which the step-up layer deliberately exempts — would now be blocked, because route
middleware cannot see which operation a round trip is about to perform.

✅ Good — the check moves into the method that performs the operation, reading the *same* session key
and timeout the middleware would have:

```php
// app/Actions/Users/UpdateUser.php — last statement of authorizeRoleAndStatusChange(),
// which __invoke() reaches only when ! $isSelfEdit
if (! $isNoOpRoleChange || $emailChanged || $statusChanged) {
    ($this->ensureRecentPasswordConfirmation)();
}
```

```php
// app/Livewire/Users/Index.php — deleteUser(), after Gate::authorize('delete', $target)
try {
    $ensureRecentPasswordConfirmation();
} catch (PasswordConfirmationRequiredException) { /* log, then redirect to re-confirm */ }
```

Three properties generalise to the next screen that needs step-up:

- **Route middleware being unavailable is what forces the guard into the method — not a preference.**
  The same reasoning that makes `can:` mandatory over `permission:` on this route makes an in-method
  check mandatory over `password.confirm` on it.
- **An in-method guard can be conditional; route middleware cannot.** This is a genuine gain rather
  than a workaround: the guard fires on a role, status or third-party email change and on nothing
  else, which route middleware could never express.
- **The guard runs after every `Gate::authorize()` on its branch**, so a permission refusal is never
  converted into a credential prompt. See [step-up-authentication.md](step-up-authentication.md),
  which owns the full rule set.

⚠️ **`settings/security` is still the ❌ row's unfixed case.** It relies on route middleware alone, so
its own `/livewire/update` round trips are not re-challenged. Pre-existing, out of task 0015a's scope,
and named as a residual rather than left implicit.

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

### Gating a method is not the same as knowing when the gate fired

Everything above is about making a method **refuse**. Task 0015b added the half that was missing for two years of stories: a refusal that nobody records is correct and invisible, and on a component reached over `/livewire/update` that matters more than on an ordinary route. An actor probing `openEditModal($someId)` against one target id after another is doing so through an endpoint with **no server-rendered page load per attempt**, so there is not even an access-log line shaped like the attempt — the whole surface is `POST /livewire/update`, identical for a successful save and for the fiftieth refused probe.

**Rule: every method gated by the section above records its own refusal, through the one shared helper, before the exception propagates.**

✅ Good — the shipped call sites. `Gate::authorize()` is replaced by the helper's own throwing wrapper, which logs and then performs the identical check:

```php
// app/Livewire/Users/Index.php — openEditModal()
public function openEditModal(string $userId, LogRefusedPrivilegedAttempt $logRefusedPrivilegedAttempt): void
{
    $target = User::findOrFail($userId);

    if (! $target->is(Auth::user())) {
        $logRefusedPrivilegedAttempt->authorize('updateSensitiveAttributes', $target);
    }
    // ...
}
```

❌ Bad — the shape every one of these sites had until task 0015b, and the one a new method will be written with unless the rule is stated (adapted from the pre-0015b code, which is otherwise identical):

```php
// anti-pattern — refuses correctly, records nothing
Gate::authorize('updateSensitiveAttributes', $target);
```

Three things specific to a Livewire component, each of which a reader hits within minutes of copying this:

- **The helper is a method-injected parameter, not a constructor dependency.** These are Livewire action methods, called only through `wire:click` and `Livewire::test()->call()`, so they follow this repo's ordinary per-method action-injection convention — and adding the parameter changes nothing at either call site, because Livewire resolves an unmatched typed parameter from the container after the client-supplied arguments. The **actions** behind the screen constructor-inject the same class instead, for the documented reason that their `__invoke()` signature is a public contract; see [conventions/code-style.md](../conventions/code-style.md#exception-an-actions-own-dependency-is-constructor-injected-when-the-method-signature-is-a-public-contract).
- **`mount()` is the one deliberate exception, and the reason is the allow-list table at the top of this page.** `UserPolicy::viewAny()` / `RolePolicy::viewAny()` check the *identical* abilities the routes' `can:users.view` / `can:roles.manage` enforce, and `can:` — unlike `permission:` — **is** on `PersistentMiddleware`, so it re-applies on `/livewire/update` too. An actor who would fail `mount()` is refused by the route on every real request and never reaches the component; a log there could only ever fire from a `Livewire::test()` mount. The check stays as defence in depth, unlogged, with the tripwire recorded in both docblocks: *if `viewAny()` ever gains a condition the route's own `can:` ability does not check, this refusal becomes reachable over HTTP and must be logged.* Note the asymmetry with the `password.confirm` row directly above — that middleware's **absence** from the allow-list is what forced a guard into the method; `can:`'s **presence** is what makes one unnecessary here. Same table, opposite conclusions, and reading it in only one direction gets one of the two wrong.
- **A disclosure gate's test needs the same state assertion it always did, plus the log.** An exception-only assertion cannot tell a gate that ran before the assignments from one that ran after; adding `Log::spy()` does not change that. `tests/Feature/Users/RefusalLoggingTest.php` asserts the throw, the recorded context array, **and** that `editingPendingEmail` / `status` stayed unpopulated.

What the line actually contains, why its keys are generic, the two message strings a defender must filter for, and the log-ceiling rule for a rate-limit site shared with an unprivileged caller are owned by [architecture/authorization.md](../architecture/authorization.md#recording-a-refusal--what-every-gate-owes-the-audit-trail) — not repeated here.

> **`App\Livewire\Media\Gallery::mount()` is the exception's own exception, and it logs.** The middle bullet above excludes `mount()` because the route's `can:` refuses first. That component has no route (story 0020), so nothing refuses first and `mount()` is the only gate a real caller reaches — which is precisely the refusal the recipe exists to record. Same table, third conclusion.

### The routeless case: a component with no route has no per-request backstop at all

Story 0020's Phase 4 **F-1** (Medium). This is the sharpest real case this page's own *"gate every method that mutates or discloses"* rule has produced, because it is the one component where that rule is not one layer of two — it is the only layer there is.

**The mechanism is the allow-list table at the top of this page, read for a component that has no middleware of its own.** Livewire's `PersistentMiddleware` re-applies a component's **route's** middleware on every `/livewire/update` round trip, which is why `can:users.view` keeps refusing a revoked actor on `App\Livewire\Users\Index` regardless of what the component does. `App\Livewire\Media\Gallery` is an **embedded child** — a modal Products and Blog mount inside their own screens — so there is no route, and therefore no `can:media.view` to replay. What Livewire replays is the **host page's** middleware, which says nothing about `media.*`.

The consequence is exact and easy to miss in review: **`mount()` runs once, on the initial render. Every subsequent call arrives with no authorization behind it whatsoever.**

❌ Bad — the shipped first implementation. It gates `mount()`, which is what the three routed screens in this repo do, and it reads correct:

```php
// as found by Phase 4 round 1 — do not copy onto a routeless component
public function mount(LogRefusedPrivilegedAttempt $log): void
{
    $log->authorize('viewAny', Media::class);
}

#[Computed]
public function tiles(): array { /* returns the whole library */ }

public function toggleSelect(string $id): void { /* … */ }
public function confirmSelection(): void      { /* … */ }
```

An actor opens the gallery legitimately, has `media.view` revoked mid-session, and keeps browsing, searching and selecting the entire media library — over `POST /livewire/update`, indistinguishable in an access log from ordinary use — for as long as the page stays open.

✅ Good — the shipped fix. Each of the three re-checks, and the render-path one does it differently on purpose:

```php
// app/Livewire/Media/Gallery.php
#[Computed]
public function tiles(): array
{
    if (Gate::denies('viewAny', Media::class)) {
        return [];                                  // fails CLOSED, never throws
    }
    // …
}

public function toggleSelect(string $id, LogRefusedPrivilegedAttempt $log): void
{
    $log->authorize('viewAny', Media::class);       // throws, and records
    // …
}
```

Three rules, and the third is the one a reviewer is most likely to get backwards:

1. **Enumerate the *methods*, not the abilities.** "Is this screen gated" is the wrong question for a component with no route; "can this method be called on its own over `/livewire/update`" is the right one, and for any public method on a mounted component the answer is yes. The two ungated methods here — `cancel()` and `cancelEditing()` — are ungated only because each writes nothing but the component's own form state.
2. **A `#[Computed]` property is a method.** `tiles()` reads like data and is a full entry point: the whole library, re-queried each request, filtered by whatever `$search` the client last set. Nothing about the `#[Computed]` attribute makes it internal.
3. **A render-path gate fails closed; an action-path gate throws — do not unify them.** `tiles()` is reached from `render()`, so an `AuthorizationException` there propagates out of the *child* and takes down the **host** page — turning a revoked media permission into a 500 on the product editor, which is the exact failure the consumer's `@can('viewAny', \App\Models\Media::class)` wrapper exists to prevent, arriving one layer lower. A throwing `tiles()` and a silently-empty `confirmSelection()` are both wrong: the first breaks an unrelated screen, the second hands the consumer an empty selection with no refusal recorded anywhere.

Two further properties, both already rules on this page and both worth re-reading in this shape:

- **The `@can` wrapper at the consumer site is a layer, never the gate.** It decides whether the child is rendered into the host page at all — reachable only during the host's own render, and not from `/livewire/update`. It is what stops a `media.view`-less actor from 403-ing a screen they are otherwise entitled to; it protects nothing.
- **A disclosure gate here is legitimately *stronger* than its neighbours.** `startEditing()` asks `update` (`media.edit`) where `toggleSelect()` beside it asks `viewAny` (`media.view`), because its effect is opening a **write form**, not disclosing a value the tile already renders — [the same rule](#the-shipped-disclosure-gates-and-why-the-disclosure-check-is-the-stronger-ability) `Users\Index::openEditModal()` follows. Phase 5's finding F-8 records this on the method's own docblock specifically so a reviewer does not "fix" the pair into a matching `viewAny`/`viewAny` and weaken the one gate that needs to be strong.

Where this pattern sits relative to the module gate, the sidebar registry and the refusal recipe is [architecture/authorization.md](../architecture/authorization.md#a-routeless-livewire-component-has-no-per-request-authorization-backstop)'s to own; the mechanism above is this page's.

> ✅ **Story 0021's `App\Livewire\Components\WysiwygEditor` is this section's second real instance, and rule 1 held it to account exactly as designed.** It is itself routeless, and it embeds `Gallery` the same way a host screen does — so it is simultaneously a `Gallery` consumer and a second routeless surface of its own. Its first implementation gated neither `openGallery()` nor `insertImage()`, the same ❌ shape this section documents; Phase 4 finding F-2 fixed both as an ordinary application of rule 1 (`Gate::authorize('viewAny', Media::class)` via `LogRefusedPrivilegedAttempt` as each method's own first statement), and `insertImage()` additionally re-derives the selected `Media` row from the database rather than trusting the client-supplied `url`/`title` fields — the same "derive the state, never accept it" discipline [model-instance-trust.md](model-instance-trust.md) already states for a caller-supplied instance, applied here to a caller-supplied array instead. Neither method is a `#[Computed]` property, so rule 3's fails-closed/throws split does not apply to either — both are ordinary user-triggered actions and both throw and log, matching `toggleSelect()`/`confirmSelection()` rather than `tiles()`.

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

> ✅ **Story 0022's `App\Livewire\Components\SearchableMultiSelect` is this rule's next real instance, and it broadens what "server-derived" means rather than merely repeating the pattern.** Phase 4 finding F-1 (Medium) locked `$disabled` for the same reason story 0021's `WysiwygEditor::$disabled` finding did — a tampered `updates` payload setting `disabled: false` directly would bypass every `if ($this->disabled)` guard in `selectOption()`/`removeOption()`/`updatedSearch()` — and F-3 (Medium) went further, locking `$minSearchLength`, `$debounceMs` and `$resultLimit` too, none of which is server-*computed* at all: they are values a **consumer sets once from its own Blade attribute** and never legitimately writes again. `$resultLimit` is the sharpest case — it drives `$fetchLimit` (`resultLimit + 1 + count($selected)`) inside `updatedSearch()`, so a client-supplied `resultLimit: 999999` would defeat the whole "a bounded fetch is what makes an 8,100-row resolver safe" contract D9 exists to guarantee, turning a display-tuning knob into a resource-exhaustion lever the moment it is left writable. `$optionResolver` (F-1's sibling finding) and `$maxChipAreaHeight`/`$unresolvableSelected`/`$selectedOptions`/`$results` complete the set — **seven** locked properties in total against two deliberately-unlocked ones (`$search`, the live search box, and `$selected`, the `#[Modelable]` binding D4 requires stay writable). The rule from `App\Livewire\Settings\Security` at the top of this section — "is this value ever legitimate request input", not "is it an id" — is what all seven answer identically to `no`, whether the value is computed by the server or merely *configured once* by a trusted caller and never meant to move again.

### Confirmed safe: `wire:click="$toggle('prop')"` is the same write channel as `wire:model`, and `#[Locked]` still binds it

Task 0018 replaced a bare `wire:model="active"` with `wire:click="$toggle('active')"` on the Sales
Regions edit modal's checkbox, for a real-browser automation reason unrelated to security (recorded in
that story's own task file). Because it *looks* like a method call, the question it raises is whether it
opens a second, ungated write path. **It does not** — and the reasoning is worth keeping so the next
screen that makes the same substitution does not re-derive it.

Verified against the installed vendor source, not inferred:

```js
// vendor/livewire/livewire/dist/livewire.esm.js
wireProperty("$toggle", (component) => (name, live = true) => {
  return component.$wire.set(name, !component.$wire.get(name), live);
});

wireProperty("$set", (component) => async (property, value, live = true) => {
  dataSet(component.reactive, property, value);
  if (live) {
    component.queueUpdate(property, value);      // <-- the `updates` payload, same as wire:model
    return fireAction(component, "$set");
  }
  return Promise.resolve();
});
```

Four properties follow, and each one is why this is a non-event:

- **`$toggle` is client-side sugar with no server counterpart.** It resolves to `$set`, whose only
  server-visible effect is `queueUpdate()` — an entry in the request's **`updates`** payload, the
  identical channel a `wire:model` write uses. There is no second pipeline.
- **The `$set` *call* is a no-op server-side.** `Livewire\Features\SupportMagicActions` lists `$set`
  in `$magicActions` and `$returnEarly()`s on it, so no method is dispatched and no new callable
  surface exists.
- **`#[Locked]` binds it**, because locking is enforced on the `updates` channel via
  `SupportLockedProperties\BaseLocked::update()`. Confirmed by execution rather than by reading:
  `Livewire::test(SalesRegions\Index::class)->set('regions', [])` and `->set('editingRegionId', 'forged')`
  both raise `CannotUpdateLockedPropertyException`.
- **The markup grants the client nothing it did not already have.** The property name is a literal in
  the compiled Blade, but an attacker never needed it — a hand-crafted `updates` payload can name any
  *unlocked* public property regardless of what the view binds. The markup is not the boundary;
  `#[Locked]` is.

**Rule: choosing between `wire:model`, `wire:model.live` and `wire:click="$toggle(...)"` is a
reactivity decision, never an authorization one.** All three land in the same `updates` payload, none
of them runs a `Gate` check, and none of them persists anything — the persisting method
(`save()` here) is where the ability is asked. The one behavioural difference worth knowing is
unrelated to security: `$toggle` defaults to `live = true`, so it forces a `/livewire/update` round
trip per click where a deferred `wire:model` would batch with the next action.

## A save-time gate and its display-only twin must share one resolution method, or the two will drift

`App\Livewire\Components\SearchableMultiSelect` ships **no** `Gate::authorize()` call of its own — by design (decision D7 in the task file, restated in the component's own docblock): the shell owns no table and no domain knowledge, so authorization belongs entirely to whatever `MultiSelectOptionsResolver` a consumer supplies. Nothing in this section's rules 1–3 apply to it directly. But story 0022's Phase 4 finding **F-2** (Medium) is the identical *shape* of failure one layer down, in a component whose "gate" is a validation check rather than a permission check — worth recording here because the drift it closes is the same one this whole page's `canEdit`/`canDelete` UI-hint pattern already guards against, just without a `Gate` anywhere in the picture.

The component exposes two methods that both answer "is this selection fully resolved": `refreshSelectedOptions()` (called on `mount()` and after every select/remove, to decide what to render — an unresolved id becomes a distinct "unavailable" chip) and `assertSelectionResolvable()` (the consumer's save-time gate, per decision D12 — a selection carrying any unresolvable id must refuse the entire save with a `ValidationException`, never persist a subset). **The first implementation gave each its own resolution logic**, and `assertSelectionResolvable()`'s caught only a thrown `UnresolvedSelectionException` — so a resolver that (wrongly) returns a *short array* instead of throwing, per D12's own total-function contract, passed the save-time gate silently while the display path already knew better. A consumer's own `MultiSelectOptionsResolver` implementation getting the contract wrong is exactly the failure D12 exists to make impossible; a gate that only *sometimes* catches it is worse than no gate, because it looks tested and green until the one implementation that gets it wrong ships.

The fix is the shape this page's ability-hint rule already generalizes: **one private method, `resolveIdsAllowingPartialFailure()`, is now the single place that decides "is this id set fully resolved" — both `refreshSelectedOptions()` and `assertSelectionResolvable()` call it and nothing else**, so the two can never independently drift about what counts as resolved. It folds a short-array return into the same `missingIds` result a thrown exception produces, regardless of which shape the resolver actually used — closing the gap for a misbehaving resolver on the save path, not only the display path.

**The rule, stated to generalize past this one component:** when a component exposes both a *display-time* check and a *save-time* (or otherwise consequential) gate that must answer the same yes/no question, the two must call one shared method — never two independently-maintained versions of "is this OK", however similar they look on the day both are written. This is the non-`Gate` sibling of [the `canEdit`/`canDelete` UI-hint rule](../architecture/authorization.md#gateallows-in-a-list-query-is-a-ui-hint-not-a-layer) elsewhere in this doc set: there, a rendered hint must mirror the exact `Gate` call it precedes or the two can disagree about what a click will do; here, there is no `Gate` at all, but a display flag and a refusal gate answering the same question are held to the identical discipline.

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

_Last updated: 2026-08-31 — Story 0022 (Shared searchable, server-side-filtered multi-select component, Phase 4 audit). Widened [Every server-derived property is `#[Locked]`](#every-server-derived-property-is-locked-not-just-the-ids) with a ✅ for `App\Livewire\Components\SearchableMultiSelect`'s **seven** locked properties — the pattern's next real instance, and the one that broadens its own rule: `$disabled`/`$optionResolver` repeat story 0021's `WysiwygEditor::$disabled` finding, while `$minSearchLength`/`$debounceMs`/`$resultLimit` are the first locked properties in this app that are not server-*computed* display state at all, but a **consumer-set-once configuration value** — `$resultLimit` being the sharpest case, since a client-writable value there would defeat D9's whole bounded-fetch contract against an 8,100-row resolver. Added a new section, [A save-time gate and its display-only twin must share one resolution method, or the two will drift](#a-save-time-gate-and-its-display-only-twin-must-share-one-resolution-method-or-the-two-will-drift), for Phase 4 finding F-2: the component ships **no** `Gate::authorize()` call of its own (D7 — authorization belongs to the resolver), so this is the first pattern on this page about two checks answering one yes/no question with no `Gate` anywhere in it — `refreshSelectedOptions()` (the display path) and `assertSelectionResolvable()` (the consumer's save-time gate) independently missed a resolver that returns a short array instead of throwing (D12's total-function contract), until both were rewritten to share one `resolveIdsAllowingPartialFailure()` method. Explicitly cross-referenced as the non-`Gate` sibling of [the `canEdit`/`canDelete` UI-hint rule](../architecture/authorization.md#gateallows-in-a-list-query-is-a-ui-hint-not-a-layer) on the authorization page. **Verified as unchanged rather than assumed:** the `PersistentMiddleware` allow-list table, the "Gate at the top of every method" section and its routeless-case subsection (this component has no `Gate` call to place there at all — D7), the `Rule::unique()->ignore()` section, and the `$toggle` confirmed-safe subsection._

_Previously: 2026-08-31 — Story 0021 (Shared WYSIWYG rich-text editor component, Phase 4 audit): added a ✅ to [The routeless case](#the-routeless-case-a-component-with-no-route-has-no-per-request-backstop-at-all) recording its second real instance — `App\Livewire\Components\WysiwygEditor` is itself routeless and is simultaneously a `Gallery` consumer, and its first implementation shipped with `openGallery()`/`insertImage()` ungated, the identical shape this section's ❌ names. Fixed as an ordinary application of rule 1 (Phase 4 finding F-2): both methods now gate as their own first statement, and `insertImage()` additionally re-derives the selected `Media` row from the database rather than trusting the client-supplied payload — the same "derive, never accept" discipline [model-instance-trust.md](model-instance-trust.md) already states for a caller-supplied model instance. Neither method is a `#[Computed]` property, so both throw-and-log rather than fail-closed, matching `toggleSelect()`/`confirmSelection()` rather than `tiles()`. **Verified as unchanged rather than assumed:** the `PersistentMiddleware` allow-list table, the `#[Locked]`/`Rule::unique()->ignore()` section, the `$toggle` confirmed-safe subsection, and the action-vs-component section — this story adds no `app/Actions/` class and no new server-derived property shape beyond what that section already covers._

_Previously: 2026-08-29 — Story 0020 (Shared media gallery modal, Phase 4 audit): added [The routeless case](#the-routeless-case-a-component-with-no-route-has-no-per-request-backstop-at-all), and **corrected this page's opening sentence**, which had scoped the whole document to a *"full-page Livewire component"* since task 0004 — true of every component audited through task 0018 and false as of `App\Livewire\Media\Gallery`, the first **embedded child** with no route of its own. That distinction is not cosmetic: it decides whether any rule on this page still has a backstop behind it. Story 0020's finding **F-1** (Medium) is the shipped proof — `tiles()`/`toggleSelect()`/`confirmSelection()` gated only `mount()`, which is exactly what the three routed screens here do and is exactly right *for them*, because `can:` **is** on `PersistentMiddleware` and is replayed on every `/livewire/update` round trip. A component with no route has no middleware to replay: Livewire replays the **host page's**, which says nothing about `media.*`, so `mount()` runs once and every later call arrives unauthorized. An actor kept browsing, searching and selecting the whole media library after `media.view` was revoked mid-session. The section carries the ❌/✅ pair, three rules (**enumerate methods, not abilities**; a `#[Computed]` property **is** a method; and **a render-path gate fails closed while an action-path gate throws** — a throwing `#[Computed]` propagates out of the child and 500s the *host* page, which is the failure the consumer's `@can` wrapper exists to prevent, one layer lower) and two re-readings of existing rules in the new shape: the consumer-side `@can` is a layer and never the gate, and a disclosure gate may be legitimately **stronger** than its neighbours (`startEditing()` asks `update` where `toggleSelect()` asks `viewAny` — recorded on the docblock at Phase 5's F-8 so it is not "fixed" into a matching pair). Also added a `>` note to the `mount()`-exclusion bullet: `Media\Gallery::mount()` is the exception's own exception and **does** log, because the exclusion's reasoning (the route's `can:` refuses first) has no route to rest on. **Verified as accurate rather than rewritten:** the `PersistentMiddleware` allow-list table and its `password.confirm` worked example, the `#[Locked]`/`Rule::unique()->ignore()` section, the `$toggle` confirmed-safe subsection, and the action-vs-component section — story 0020 adds a `#[Locked]` property set that follows the existing rule and an action (`App\Actions\Media\UpdateMediaDetails`) that authorizes itself, which is that section applied, not extended._

_Previously: 2026-08-26 — Task 0018 (Sales Regions & Taxes screen, Phase 4 audit): added the **confirmed-safe** subsection on `wire:click="$toggle('prop')"`, this repo's first use of a Livewire magic action as a form binding. That story swapped a bare `wire:model` for it on the edit modal's `active` checkbox for a real-browser-automation reason, and the substitution *looks* like it opens a second, ungated write path. It does not: `$toggle` is client-side sugar resolving to `$set`, whose only server-visible effect is `queueUpdate()` — the same `updates` payload `wire:model` writes to — while the `$set` **call** is `$returnEarly()`d by `SupportMagicActions`, so no method is dispatched. `#[Locked]` binds it unchanged, verified by execution (`->set('regions', [])` / `->set('editingRegionId', …)` both raise `CannotUpdateLockedPropertyException` on the shipped component), which is the load-bearing half: the markup is not the boundary, the lock is. Recorded as a rule — choosing between `wire:model`, `wire:model.live` and `$toggle` is a **reactivity** decision, never an authorization one — so the next screen hitting the same automation bug does not re-open the question. **Nothing else on this page changed meaning**: story 0018 is view-layer only, adds no `#[Locked]` property, no gate and no component-only rule, and every gate on that screen lives in story 0017's already-audited component class._

_Previously: 2026-08-24 — Task 0015b (log refused privileged attempts): this page's central rule — gate every method that mutates **or discloses** — has been stated since task 0004 and shipped in full since task 0015, and it turns out to be only half a property. Added **"Gating a method is not the same as knowing when the gate fired"**, the observability half, with the ✅/❌ pair (the shipped `$logRefusedPrivilegedAttempt->authorize(...)` call site against the bare `Gate::authorize(...)` every one of these sites carried until this story) and why it matters **more** on a Livewire component than on an ordinary route: every probe is the same `POST /livewire/update`, so a refused fiftieth attempt leaves no access-log line shaped like the attempt. Three component-specific consequences: the helper is **method**-injected here (Livewire resolves the unmatched typed parameter, so no call site changes) while the actions behind the screen constructor-inject it for the documented `__invoke()`-is-a-public-contract reason; `mount()` is the one deliberate exception, and the reason is **this page's own allow-list table read in the opposite direction** from the `password.confirm` row directly above it (`can:`'s *presence* on `PersistentMiddleware` is what makes a log there unreachable over HTTP, where `RequirePassword`'s *absence* is what forced a guard into the method) — with the tripwire that would reverse it; and a disclosure gate still needs its state assertion, since `Log::spy()` cannot distinguish a gate that ran before the assignments from one that ran after. The line's own shape, its two message strings and the shared-action log ceiling are pointed at in [architecture/authorization.md](../architecture/authorization.md#recording-a-refusal--what-every-gate-owes-the-audit-trail) rather than duplicated. **Nothing else on this page changed meaning** — verified against the diff: this story adds no `#[Locked]` property, no new disclosure gate, no component-only rule, and changes no refusal's class, status or message._

_Previously: 2026-08-24 — Task 0015a (step-up authentication for privileged Users actions): the `password.confirm` row of the `PersistentMiddleware` table has carried a bare ❌ since task 0004 with nothing in the repo acting on it; this story is that code, so the row gains its **worked example** as a new subsection. It is the clearest case in the table because the naive fix is not merely weaker — `->middleware(['password.confirm'])` on `routes/users.php` is *inert* against the mutations it would be added for (they run on `/livewire/update`) while simultaneously blocking a name-only edit the step-up layer deliberately exempts. Kept to the ❌/✅ pair plus the three properties that generalise (route middleware being unavailable is what **forces** the guard into the method; an in-method guard can be conditional where middleware cannot, which is a gain rather than a workaround; and it runs after every `Gate::authorize()` on its branch), with the full rule set pointed at in the new [step-up-authentication.md](step-up-authentication.md) rather than duplicated. Recorded `settings/security` as the row's still-unfixed case. **Nothing else on this page changed meaning** — verified against the diff rather than assumed: this story adds no `#[Locked]` property, no disclosure gate, and no component-only rule (its one component-level guard, `deleteUser()`'s, is documented as belonging there because no `DeleteUser` action exists to move it to)._

_Previously: 2026-08-24 — Task 0015 (Users CRUD security hardening): the "mutates **or discloses**" rule had been stated here since task 0004's audit while the screen it was written about gated **none** of its three openers. It does now, so the section gains the shipped example — `openCreateModal()` → `create`, `confirmDelete()` → `delete`, `openEditModal()` → `updateSensitiveAttributes` — with the four properties that make it copyable: why the disclosure gate asks a **stronger** ability than the write it precedes (the write path asks it *conditionally*, once a status/email change is detected; the opener discloses those two attributes *unconditionally*), why the component performs **no** tier lookup to get there (`UserPolicy::updateSensitiveAttributes()` already contains the branch, so the unconditional call is identical to `update` for an ordinary target and strictly stronger for an Administrator-holding one — re-deriving it would reinstate the shape task 0008a deleted), why the one branch that exists is an **identity** check with its accepted side effect, and why `confirmDelete()` carries no such exemption. Plus the two test consequences: an under-privileged actor can no longer reach a mutating method through its opener, and a disclosure gate needs a **state** assertion rather than an exception-only one. Also recorded `$users` as `#[Locked]` (finding F4 — the last unlocked derived property on that screen) and the rule that locking one is a change to every test that wrote it._

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
