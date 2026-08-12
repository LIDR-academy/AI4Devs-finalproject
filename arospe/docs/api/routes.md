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

_Last updated: 2026-08-12 — Task 0003: documented `email-change.confirm`, the first app-owned route deliberately registered outside the `auth` groups (`signed` + `throttle:6,1` only), its two response shapes, and the `ValidateSignature`/`SubstituteBindings` priority change it required._
