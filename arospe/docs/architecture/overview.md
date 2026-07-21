# Architecture Overview

## Table of Contents

- [What this application is](#what-this-application-is)
- [Request lifecycle](#request-lifecycle)
- [Runtime dependencies](#runtime-dependencies)
- [Cross-cutting concerns](#cross-cutting-concerns)
- [Where things live](#where-things-live)

## What this application is

`arospe` (Composer package `laravel/livewire-starter-kit`) is a Laravel 13 + Livewire 4 monolith built on the official Laravel Livewire starter kit. There is no separate frontend SPA and no REST API yet — Livewire components render server-driven UI directly.

Two concerns are layered on top of the starter kit baseline:

- **Authentication** via `laravel/fortify` (registration, login, password reset, email verification, 2FA, passkeys). See [Authentication](authentication.md).
- **Authorization** via `spatie/laravel-permission` (roles & permissions), added in `database/migrations/2026_07_12_181045_create_permission_tables.php`. See [Authorization](authorization.md).

The domain layer beyond `App\Models\User` does not exist yet in the current codebase — `app/Models/` contains only `User.php`. This document (and this skill) will grow new `architecture/<module>.md` files as real domain modules land.

## Request lifecycle

```mermaid
flowchart LR
    Browser["Browser"]

    subgraph Laravel["Laravel 13 app"]
        Routes["routes/web.php\nroutes/settings.php"]
        Livewire["Livewire 4 components\napp/Livewire/**"]
        Fortify["Fortify actions\napp/Actions/Fortify/**"]
        Models["Eloquent models\napp/Models/User.php"]
    end

    DB[("MySQL\nmysql:8.4 (compose.yaml)")]
    Queue[("database queue\njobs table")]
    Session[("database sessions\nsessions table")]
    Cache[("database cache\ncache table")]
    Mail["Mail (log driver)"]

    Browser -->|"HTTP GET/POST"| Routes
    Routes -->|"Route::livewire(...)"| Livewire
    Livewire -->|"delegates create/reset/2FA"| Fortify
    Fortify --> Models
    Livewire --> Models
    Models --> DB
    Livewire --> Session
    Livewire --> Cache
    Fortify -.->|"email verification, password reset"| Mail
    Laravel -.->|"queued jobs"| Queue
```

- Web entry points are declared in [`routes/web.php`](../../routes/web.php) and [`routes/settings.php`](../../routes/settings.php); there is no `routes/api.php` in this app yet.
- Fortify-owned routes (login, register, password reset, 2FA challenge, `.well-known/passkey-endpoints`) are registered by the `FortifyServiceProvider` from `config/fortify.php`, not by hand-written controllers.
- Session, cache, and queue all use the `database` driver (`SESSION_DRIVER`, `CACHE_STORE`, `QUEUE_CONNECTION` in `.env`), backed by the `sessions`, `cache`, and `jobs` tables created in `database/migrations/0001_01_01_000000_create_users_table.php` and `0001_01_01_000001_create_cache_table.php` / `0001_01_01_000002_create_jobs_table.php`.
- `MAIL_MAILER=log` in `.env` — outgoing mail (email verification, password reset) is written to the log, not actually delivered, in this environment.

## Runtime dependencies

| Concern | Driver (from `.env`) |
| --- | --- |
| Database | `mysql` |
| Session | `database` |
| Cache | `database` |
| Queue | `database` |
| Broadcasting | `log` |
| Mail | `log` |

No external services (S3, Redis, third-party APIs) are configured in this environment. When one is added, add it to this table and to the flowchart above.

## Cross-cutting concerns

Documented once, linked everywhere else — do not duplicate these explanations in other files:

- **Authentication, 2FA, passkeys** → [architecture/authentication.md](authentication.md)
- **Roles & permissions** → [architecture/authorization.md](authorization.md)
- **Database schema** → [database/schema.md](../database/schema.md)
- **Route/component contracts** → [api/routes.md](../api/routes.md)

## Where things live

| Layer | Path |
| --- | --- |
| Routes | `routes/web.php`, `routes/settings.php` |
| Livewire components | `app/Livewire/**` |
| Fortify actions | `app/Actions/Fortify/**` |
| Shared validation rules | `app/Concerns/**` (e.g. [`ProfileValidationRules`](../../app/Concerns/ProfileValidationRules.php), [`PasswordValidationRules`](../../app/Concerns/PasswordValidationRules.php)) |
| Models | `app/Models/**` |
| Views | `resources/views/livewire/**`, `resources/views/layouts/**` |
| Migrations | `database/migrations/**` |

_Last updated: 2026-07-19 — Corrected the database driver from SQLite to MySQL (`mysql:8.4` via `compose.yaml`), matching the real `.env`._
