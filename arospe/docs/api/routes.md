# Routes (no REST API yet)

## Table of Contents

- [Why this file exists](#why-this-file-exists)
- [App-owned routes](#app-owned-routes)
- [Fortify-owned auth routes](#fortify-owned-auth-routes)
- [Passkeys-owned routes](#passkeys-owned-routes)
- [Adding a real API](#adding-a-real-api)

## Why this file exists

This app has **no `routes/api.php`** and no `Illuminate\Http\Resources\Json\JsonResource` classes — there is nothing that fits `api/<resource>.md` yet. This file documents the real contract surface that exists today: server-rendered/Livewire routes, one domain controller, plus the auth routes registered by `laravel/fortify` and `laravel/passkeys`. When real API resource controllers are added, split this file into `api/<resource>.md` per resource and update this file to link to them, per the placement rule in the `docs-maintainer` skill.

Full current route list can always be regenerated with `php artisan route:list`.

## App-owned routes

Declared in [`routes/web.php`](../../routes/web.php) and [`routes/settings.php`](../../routes/settings.php).

| Method | URI | Name | Middleware | Handler |
| --- | --- | --- | --- | --- |
| GET | `/` | `home` | — | `view('welcome')` |
| GET | `/dashboard` | `dashboard` | `auth`, `verified` | `view('dashboard')` |
| GET | `/users` | `users.index` | `auth`, `verified`, `can:users.view` | `App\Livewire\Users\Index` |
| ANY | `/settings` | — | `auth` | redirect → `settings/profile` |
| GET | `/settings/profile` | `profile.edit` | `auth` | `App\Livewire\Settings\Profile` |
| GET | `/settings/appearance` | `appearance.edit` | `auth`, `verified` | `App\Livewire\Settings\Appearance` |
| GET | `/settings/security` | `security.edit` | `auth`, `verified`, `password.confirm` | `App\Livewire\Settings\Security` |
| GET | `/settings/email/confirm/{user}/{hash}` | `email-change.confirm` | `signed`, `throttle:6,1` (**no `auth`**) | `App\Http\Controllers\ConfirmEmailChangeController` |
| GET | `/.well-known/passkey-endpoints` | `well-known.passkeys` | — | inline closure, returns JSON `{enroll, manage}` |

```php
// routes/settings.php
Route::middleware(['auth', 'verified'])->group(function () {
    Route::livewire('settings/security', Security::class)
        ->middleware(['password.confirm'])
        ->name('security.edit');
});
```

`security.edit` is the only route with the extra `password.confirm` requirement, because it manages 2FA and passkeys (see [architecture/authentication.md](../architecture/authentication.md)).

### `users.index` — the first permission-gated route

Every other app-owned route gates on *being signed in*; this one is the first to gate on a **catalog permission**. It lives in [`routes/web.php`](../../routes/web.php), inside the existing `auth` + `verified` group:

```php
// routes/web.php
Route::livewire('users', UsersIndex::class)
    ->middleware(['can:users.view'])
    ->name('users.index');
```

**`can:users.view`, not `permission:users.view`** — the two express the same rule but are not interchangeable on a `Route::livewire(...)` route. Livewire re-applies route middleware to `/livewire/update` round-trips only for classes on its `PersistentMiddleware` allow-list, which carries Laravel's `Authorize` (`can:`) but not Spatie's `PermissionMiddleware`; gating with `permission:` would protect the initial `GET /users` only, leaving every `save()` / `deleteUser()` unauthorized at the route layer. The route file carries an inline comment saying so — do not "normalise" it. See [architecture/authorization.md](../architecture/authorization.md#gating-a-livewire-route-use-can-never-permission).

Six consequences for anyone reading this table as a contract:

- **The middleware column understates what protects this route.** `verified` is *also* not on that allow-list, so route middleware alone is not what secures the component's actions. [`App\Livewire\Users\Index`](../../app/Livewire/Users/Index.php) re-authorizes in `mount()` and as the first statement of every mutating method; that, not the table row, is the real contract. See [security/livewire-authorization.md](../security/livewire-authorization.md). Since task 0008a the write path is protected **twice over**: [`CreateUser`](../../app/Actions/Users/CreateUser.php) and [`UpdateUser`](../../app/Actions/Users/UpdateUser.php) authorize the whole operation themselves, and the Administrator-tier rules (`promoteToAdministrator`, `downgrade`, `updateSensitiveAttributes`) now live **only** there — see [architecture/authorization.md](../architecture/authorization.md#the-guard-belongs-to-the-action-not-to-the-caller).
- **The view behind it renders the whole screen.** `resources/views/livewire/users.blade.php` — the *flat* path Livewire resolves for `App\Livewire\Users\Index`, per the [`Index`-in-a-subfolder exception](../conventions/naming.md#exception-a-component-named-index-resolves-to-its-parent-folders-name) — consumes the component's public surface (`$users` rows of `{id, name, email, pendingEmail, role, status, canEdit, canDelete}`, `usersSummary()`, `roleOptions()`, plus the locked `$editingPendingEmail` / `$deletingUserName`) and renders: a header with the live total/active count and a primary "New user" button; a `flux:table` of users (initials `flux:avatar`, name over email with a muted pending-address notice beneath it when `pendingEmail` is set, the role name or an em dash when the user has none, a `flux:badge` coloured per `UserStatus` — `lime`/`zinc`/`red` — and per-row edit/delete actions rendered enabled or disabled according to that row's `canEdit`/`canDelete`); a create/edit modal (name, email, a role `flux:select` fed by `roleOptions()`, a status `flux:select` over `UserStatus::cases()`); a delete-confirmation modal naming the target; and an explicit empty state when `$users` is empty. Both modals' inner content is wrapped in `@if ($showModal)` / `@if ($showDeleteModal)` so only one "Cancel" control is ever in the DOM.
- **Its row actions are icon-only, so they are not selectable by visible text.** Each carries an `aria-label` plus a `data-test="edit-user-{id}"` / `data-test="delete-user-{id}"` hook — target those hooks from a browser test, never the button label. Both `wire:click` arguments are passed through `@js(...)`, which is mandatory rather than stylistic: a value interpolated into a `wire:*` attribute lands in a JavaScript evaluator, where Blade's HTML escaping is undone by the parser. See [security/blade-livewire-output-encoding.md](../security/blade-livewire-output-encoding.md).
- **A row action the acting user may not perform renders `disabled`, not merely failing on click.** `loadUsers()` puts `canEdit` / `canDelete` on every row from `Gate::allows('update', $user)` / `Gate::allows('delete', $user)` — the very same `UserPolicy` methods `save()` and `deleteUser()` authorize against, so the disabled state matches what a click would do in every case but one. **The exception, since task 0008a:** a **Super Admin actor** viewing a **Super Admin-holding target** sees `canEdit` render `true` (the `Gate::before` bypass grants it) while `UpdateUser` refuses the save with a direct, deliberately non-`Gate`-mediated throw — so the row appears enabled and 403s on click. That is a known, accepted gap; the drift only ever runs enabled-then-refused, never the reverse. This is a UI hint layered *on top of* the component's own authorization, never a replacement for it; the rule, the exception, and why `Gate::allows()` rather than `Gate::authorize()`, are in [architecture/authorization.md](../architecture/authorization.md#gateallows-in-a-list-query-is-a-ui-hint-not-a-layer). The `data-test` hook is present on both branches, so a browser test selects the row action the same way regardless of whether it is enabled.
- **Two markup rules the disabled branch establishes, both non-obvious and both load-bearing.** The disabled action is written as a separate `@if`/`@else` branch wrapped in an explicit `<flux:tooltip>` rather than as one button carrying a bound `:tooltip="$cond ? … : null"`: with `livewire/blaze` installed, a Flux prop that decides whether a wrapper renders counts as *present* whenever the attribute is written on the tag at all, so the conditional binding produced an empty tooltip bubble on every enabled row. And the `cursor-not-allowed!` class sits on that `flux:tooltip` wrapper, not on the button — Flux's own `disabled:pointer-events-none` takes a disabled button out of hit-testing, so a cursor rule placed there is never rendered. Both are recorded with their verification method in [errors-log.md](../errors-log.md); do not "simplify" either back into the obvious form.
- **`/users` is linked from the sidebar with no permission gating.** [`resources/views/layouts/app/sidebar.blade.php`](../../resources/views/layouts/app/sidebar.blade.php) renders a static `flux:sidebar.item` to `route('users.index')` for every authenticated user. This is deliberate and cosmetic only — access is still refused by `can:users.view` on the route and re-checked inside the component; permission-aware navigation arrives with the Roles & Permissions story.

### `email-change.confirm` — the first app-owned route deliberately outside `auth`

Every other `settings/*` route sits inside one of this file's two `auth` groups. This one is registered at the **file's top level**, next to `well-known.passkeys`, and its complete middleware list is `signed` + `throttle:6,1` — nothing else:

```php
// routes/settings.php — file top level, NOT inside either Route::middleware([...])->group(...)
Route::get('settings/email/confirm/{user}/{hash}', ConfirmEmailChangeController::class)
    ->middleware(['signed', 'throttle:6,1'])
    ->name('email-change.confirm');
```

The omission is the point, not an oversight: what the link proves is control of the **mailbox** (signed, address-bound, single-use, 60 minutes), not an authenticated session. Requiring `auth` would deadlock the case an administrator most needs it for — changing the address of an `Inactive` user, who cannot sign in and so could never reach the link that would activate them. `tests/Feature/Settings/EmailChangeTest.php` carries a dedicated "reachable while signed out" test precisely because every other test in that file runs `actingAs()` and would miss the regression.

Two more facts about this route:

- **It is also this repo's first signed route with a route-model-bound parameter**, which is why `bootstrap/app.php` now globally prepends `ValidateSignature` ahead of `SubstituteBindings` in the middleware priority list — otherwise a tampered `{user}` would 404 (binding failure) while any other tampering 403s, an oracle for "does this user id exist". The reasoning and the verified side effects across the whole `web` pipeline are in [security/signed-link-verification.md](../security/signed-link-verification.md#validatesignature-must-run-before-substitutebindings).
- **It responds in two shapes.** A tampered or expired link fails the signature check with a **403**; a still-validly-signed link whose address no longer matches (replay, supersede, cancel) is refused by the controller with a **302** to `profile.edit` carrying a `status` flash. Don't assert 403 for both.

The controller behind it is the repo's first domain controller — the convention it establishes (an HTTP boundary in front of an `app/Actions/` class) is documented in [conventions/base-standards.md](../conventions/base-standards.md#controllers-sit-in-front-of-actions-not-instead-of-them).

## Fortify-owned auth routes

Registered by `laravel/fortify` from `config/fortify.php`, not hand-written in this repo. Listed here because they are part of the real, callable contract surface (verified via `php artisan route:list`):

| Method | URI | Name |
| --- | --- | --- |
| GET/POST | `/register` | `register` / `register.store` |
| GET/POST | `/login` | `login` / `login.store` |
| POST | `/logout` | `logout` |
| GET/POST | `/forgot-password` | `password.request` / `password.email` |
| GET/POST | `/reset-password/{token}` | `password.reset` / `password.update` |
| GET/POST | `/email/verify`, `/email/verify/{id}/{hash}` | `verification.notice` / `verification.verify` |
| POST | `/email/verification-notification` | `verification.send` |
| GET/POST | `/two-factor-challenge` | `two-factor.login` / `two-factor.login.store` |
| GET/POST/DELETE | `/user/confirm-password`, `/user/confirmed-password-status` | `password.confirm*` |
| POST/DELETE | `/user/two-factor-authentication` | `two-factor.enable` / `two-factor.disable` |
| POST | `/user/confirmed-two-factor-authentication` | `two-factor.confirm` |
| GET | `/user/two-factor-qr-code`, `/user/two-factor-secret-key`, `/user/two-factor-recovery-codes` | `two-factor.qr-code` / `two-factor.secret-key` / `two-factor.recovery-codes` |
| POST | `/user/two-factor-recovery-codes` | `two-factor.regenerate-recovery-codes` |

Which of these are active depends on `config('fortify.features')` — see [architecture/authentication.md](../architecture/authentication.md) for what's actually enabled.

## Passkeys-owned routes

Registered by `laravel/passkeys`:

| Method | URI | Name |
| --- | --- | --- |
| GET/POST | `/passkeys/login`, `/passkeys/login/options` | `passkey.login` / `passkey.login-options` |
| GET/POST | `/passkeys/confirm`, `/passkeys/confirm/options` | `passkey.confirm` / `passkey.confirm-options` |
| GET/POST | `/user/passkeys`, `/user/passkeys/options` | `passkey.store` / `passkey.registration-options` |
| DELETE | `/user/passkeys/{passkey}` | `passkey.destroy` |

Consumed from `App\Livewire\Settings\Security` (list/add/delete UI) — see [architecture/authentication.md](../architecture/authentication.md).

Not listed: asset/dev-tool routes with no domain meaning (`flux/*`, `livewire-*/js|css/*`, `storage/{path}`, `up`, Boost's `_boost/browser-logs`).

## Adding a real API

When `routes/api.php` and API resource controllers appear, replace this file's structure with one `api/<resource>.md` per resource, each documenting real request/response JSON pulled from the controller/resource classes — do not add one preemptively.

_Last updated: 2026-08-19 — Task 0008a (centralize Administrator-level role identification): recorded that the write path behind `users.index` is now authorized twice over — the Administrator-tier abilities moved out of the component and into `CreateUser` / `UpdateUser` — and corrected the row-action bullet's "the disabled state cannot drift" claim, which now carries the one accepted exception (a Super Admin actor viewing a Super Admin-holding target renders enabled and is refused on click)._

_Previously: 2026-08-16 — Task 0006 follow-up: recorded that each row's edit/delete action now renders enabled or disabled from the per-row `canEdit` / `canDelete` values `loadUsers()` derives from `UserPolicy` (with the `data-test` hook present on both branches), extended the `$users` array shape accordingly, and added the two markup rules the disabled branch established — why the tooltip is a written-out `flux:tooltip` wrapper instead of a conditionally-bound `tooltip` prop under Blaze, and why the `cursor-not-allowed!` class sits on that wrapper rather than on the `pointer-events-none` button._

_Previously: 2026-08-16 — Task 0006 (Users list + create/edit modal UI): replaced the stale "the view behind it is a placeholder" claim with what `resources/views/livewire/users.blade.php` really renders now (table, status badges, pending-email marker, create/edit and delete modals, empty state), added the icon-only row-action selectors (`data-test="edit-user-{id}"` / `"delete-user-{id}"`) and the mandatory `@js()` rule for `wire:click` arguments, and recorded the deliberately ungated sidebar link to `/users`._

_Previously: 2026-08-13 — Task 0004: added `users.index`, the first permission-gated route, with the `can:` vs `permission:` rule that governs every future Livewire route and the caveat that its middleware column understates what actually protects the component's actions._
