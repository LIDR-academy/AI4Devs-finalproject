# Arospe: blog and ecommerce management dashboard

![PHP](https://img.shields.io/badge/PHP-8.5-777BB4?logo=php&logoColor=white)
![Laravel](https://img.shields.io/badge/Laravel-13-FF2D20?logo=laravel&logoColor=white)
![Livewire](https://img.shields.io/badge/Livewire-4-4E56A6?logo=livewire&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-blue)

Arospe is a Laravel + Livewire dashboard for managing a blog and an ecommerce operation (products, orders, taxes, and related entities). This README is aimed at a developer joining the team and covers everything needed to get the project running locally.

> The badges above are static (not live CI status). This repo's `.github/workflows/` (`lint.yml`, `tests.yml`) live under `arospe/`, not at the git repository root, so GitHub Actions does not currently pick them up automatically — worth confirming with the team if that's intentional.

## Tech stack

Confirmed against `composer.json` and `package.json`:

### Backend

- **PHP** `^8.3` (the container image ships PHP 8.5)
- **Laravel Framework** `^13.17`
- **Livewire** `^4.1`
- **Livewire Flux (Flux UI, free)** `^2.13.1`
- **Livewire Blaze** `^1.0`
- **Laravel Fortify** `^1.37.2` — authentication backend (login, registration, password reset, email verification, two-factor auth)
- **Laravel Tinker** `^3.0`
- **Laravel Chisel** `^0.1.0`
- **spatie/laravel-permission** `^8.3` — roles and permissions
- **symfony/html-sanitizer** `^8.1` — allow-list HTML sanitizer, applied to `products.description` on write before persistence (see [`docs/security/html-sanitization.md`](docs/security/html-sanitization.md))

### Frontend

- **Vite** `^8.0`
- **Tailwind CSS** `^4.0` (via `@tailwindcss/vite`)
- **laravel-vite-plugin** `^3.1`
- **@laravel/passkeys** `^0.2.0` — WebAuthn / passkey support

### Dev tooling

- **Pest** `^4.7` (+ `pest-plugin-laravel`) — test runner
- **Pest Browser Plugin** `^4.3` (`pest-plugin-browser`) + **Playwright** `^1.61.1` (in `package.json` dev dependencies) — real-browser end-to-end testing (see the [browser test setup guide](docs/testing/frontend/playwright-setup.md))
- **Laravel Sail** `^1.53` — Docker development environment
- **Laravel Pint** `^1.27` — code formatter
- **Larastan** `^3.9` — static analysis
- **Laravel Pail** `^1.2.5` — log tailing
- **Laravel Boost** `^2.2`
- **Faker**, **Mockery**, **Collision** — testing support

## Folder structure

High-level layout of the codebase:

```
app/
  Actions/Auth/        Cross-cutting auth-state actions (EnsureRecentPasswordConfirmation,
                       the step-up password-freshness guard; LogRefusedPrivilegedAttempt,
                       the refusal audit line)
  Actions/Fortify/    Fortify contract implementations (CreatesNewUsers, ResetsUserPasswords)
                      plus AuthenticateUser, the Fortify::authenticateUsing() callback
  Actions/Roles/       Roles-domain actions (EnforceAdministratorPermissionGrant,
                       EnforceGrantorPermissionScope)
  Actions/SalesRegions/ Sales-Regions-domain actions (UpdateSalesRegion, SetDefaultSalesRegion,
                       SetSalesRegionActive)
  Actions/Users/       Users-domain actions (RequestEmailChange, ConfirmEmailChange, CreateUser, UpdateUser)
  Concerns/            Shared traits (e.g. validation rule sets)
  Console/Commands/    Artisan commands
  Enums/               Backed enums for domain value sets (UserStatus, RoleName, SalesRegionKind)
  Exceptions/          Domain exceptions that render their own response (ImmutableRoleException,
                       RoleInUseException, PasswordConfirmationRequiredException)
  Http/Controllers/    Abstract base + domain controllers (HTTP boundary in front of an action)
  Listeners/           Event listeners (ActivateVerifiedUser, RejectNonActiveUserLogin)
  Livewire/            Livewire components, grouped by area (Actions/, Components/, Roles/,
                       SalesRegions/, Settings/, Users/, ...)
  Models/              Eloquent models (User, SalesRegion; Role, a spatie/laravel-permission subclass)
  Notifications/       Notification classes (PendingEmailVerification, UserInvitation)
  Policies/            Model policies (UserPolicy, RolePolicy, SalesRegionPolicy),
                       auto-discovered by name
  Providers/           Service providers
config/                Laravel + package configuration, plus modules.php (the app's own
                       declarative sidebar/module registry)
database/
  data/                 Bundled fixture data a seeder reads (iso-3166-countries.json)
  factories/
  migrations/
  seeders/
lang/                   Translation files, one folder per locale (en/, es/)
resources/
  views/
    components/         Blade components
    layouts/             Auth/app layout shells
    livewire/            Views for Livewire components
    partials/
routes/                  web.php plus one file per area it requires (settings.php, roles.php,
                         users.php, sales-regions.php, product-categories.php,
                         product-attribute-types.php, products.php)
tests/
  Feature/
  Unit/
docker/                  Sail-related Docker assets (e.g. MySQL test DB provisioning)
docs/                    Project documentation (architecture, database, conventions, decisions)
```

For a more detailed breakdown of conventions per folder, see [`docs/conventions/base-standards.md`](docs/conventions/base-standards.md).

## Documentation

- [Laravel 13 documentation](https://laravel.com/docs/13.x)
- [Livewire 4 documentation](https://livewire.laravel.com/docs)
- [Laravel Fortify documentation](https://laravel.com/docs/13.x/fortify)
- [Flux UI documentation](https://fluxui.dev/docs)
- [Pest documentation](https://pestphp.com/docs)
- [Project documentation index](docs/README.md) — architecture, database schema, API/route contracts, security rules, and coding conventions specific to this repo
- [Authorization](docs/architecture/authorization.md) — the seeded roles, the permission catalog, and how to gate a route or component
- [Multi-agent development workflow](docs/workflow.md) — the Three Amigos + TDD + security + docs orchestration process the project's Claude Code agents follow from task definition to closure

## Prerequisites

- **PHP** 8.3 or newer (only required if you run tooling outside of Docker; Sail provides PHP for you)
- **Composer**
- **Docker** (Docker Desktop) — used to run the local environment through Laravel Sail
- **Windows users must use WSL2.** Run all commands from inside your WSL2 (Ubuntu) shell, not from PowerShell or CMD.

## Local setup

Follow these steps in order.

### 1. Clone the repository

```bash
git clone <repository-url>
cd arospe
```

### 2. Create the `.env` file

Create a `.env` file at the project root. **The configuration values must be requested privately from Angel** — do not guess, invent, or reuse values from another environment. There is a `.env.example` in the repo showing which keys exist, but the working values (database credentials, app settings, etc.) come from Angel.

### 3. Install PHP dependencies

```bash
composer install
```

### 4. Start the services with Sail

```bash
./vendor/bin/sail up -d
```

### 5. Services started by Sail

The environment is defined in `compose.yaml`. Bringing it up starts the following services:

| Service | Image | Purpose |
| --- | --- | --- |
| `laravel.test` | `sail-8.5/app` (built from `docker/8.5`) | The application container running PHP 8.5. Serves the app (port `80` by default) and the Vite dev server (port `5173`). |
| `mysql` | `mysql:8.4` | Primary database (port `3306` by default). Also provisions a separate testing database via `docker/mysql/create-testing-database.sh`. |
| `redis` | `redis:alpine` | Redis instance (port `6379` by default) for caching, sessions, and queues. |

> **Note for Windows users**
>
> - **WSL2 is required.** Clone the project and run every command from inside your WSL2 (Ubuntu) shell.
> - **Docker Desktop must be running (started)** before you bring up the services with `sail up`.
> - **Docker Desktop must have WSL2 integration enabled for the Ubuntu distro you are using.** Enable it under **Settings → Resources → WSL Integration** and toggle on your corresponding distro. Without this, `./vendor/bin/sail` cannot reach the Docker daemon.

### 6. Migrate and seed the database

```bash
./vendor/bin/sail artisan migrate --seed
```

**Seeding is required, not optional.** `RolePermissionSeeder` is the only source of the application's roles and permission catalog (two roles, 42 permissions), so the app cannot authorize anything until it has run — this holds on every environment, deployments included. Locally, `--seed` also creates a `test@example.com` / `password` fixture account; that fixture is created **only** in `local` and `testing`, never in staging or production.

Optionally, set `SUPER_ADMIN_EMAIL` in `.env` before seeding to bootstrap a Super Admin account. If it matches a registered, email-verified user, that user is granted the role; if it matches no account at all, the seeder creates one and emails a password-reset link so you can claim it. See [`docs/architecture/authorization.md`](docs/architecture/authorization.md#super-admin-bootstrap) for all five branches, including the two that abort with an operator-facing error.

> **Accounts start `inactive`, and only an `active` account can sign in.** A newly registered user's `users.status` is `inactive` until their email is verified — completing Fortify's verification, setting a password from an invitation link, or confirming a pending email change all activate the account through the same listener. Until then, signing in is refused on **every** path (password, two-factor, passkey, remember-me) with "this account is not active", even though the credentials are correct; the one exception is the sign-in Fortify performs immediately after registration, which still works. So if a freshly created local account cannot log in, verify its email first (see the log-driver note below) rather than reaching for the password. Changing an email address never rewrites `users.email` on the spot: the new address is held as `pending_email` until the signed link sent to it is used. Mail runs on the `log` driver locally (`MAIL_MAILER=log`), so verification links show up in `storage/logs/laravel.log` — tail them with `sail artisan pail`. The email-change notification is queued and `QUEUE_CONNECTION=database`, so a worker has to be running (`composer dev`, or `sail artisan queue:work`) for the link to be written out at all. See [`docs/architecture/authentication.md`](docs/architecture/authentication.md#account-status-and-activation), and [the sign-in block](docs/architecture/authentication.md#sign-in-the-account-status-block) for where the status is enforced.

## Additional useful commands

All commands below run through Sail so they execute inside the container. If you have a local PHP/Composer/Node toolchain, you can drop the `./vendor/bin/sail` prefix where applicable.

### Frontend assets

Install and build (or watch) frontend assets:

```bash
./vendor/bin/sail npm install
./vendor/bin/sail npm run dev      # Vite dev server with hot reload
./vendor/bin/sail npm run build    # Production build
```

### Database

Run migrations and seed the database (see [step 6](#6-migrate-and-seed-the-database) — seeding is required):

```bash
./vendor/bin/sail artisan migrate
./vendor/bin/sail artisan migrate --seed
./vendor/bin/sail artisan db:seed
```

Rebuild the database from scratch:

```bash
./vendor/bin/sail artisan migrate:fresh --seed
```

On a deployed environment, seed with the narrow form so that no local-only fixture seeder can ever be picked up:

```bash
php artisan db:seed --class=RolePermissionSeeder
```

### Tests

The suite uses Pest:

```bash
./vendor/bin/sail artisan test
```

There is also a Composer `test` script that clears config, checks formatting, runs static analysis, and then runs the suite:

```bash
composer test
```

#### Browser tests (one-time setup)

Real-browser end-to-end tests run through the Pest browser plugin, which drives Playwright. Before running them on a fresh machine or CI runner, download the browser binaries once (they are cached in `~/.cache/ms-playwright/`, not committed to the repo):

```bash
npx playwright install
```

On some Linux hosts a few system libraries needed by Firefox/WebKit may be missing; Chromium (the default) still works. To install the OS-level dependencies as well, use `sudo npx playwright install --with-deps`.

The `tests/Browser/` suite is wired into `phpunit.xml`, so a plain `php artisan test` runs it alongside `Unit` and `Feature` — which means the binaries above are a prerequisite for the **full** suite, not just for browser-specific runs. To skip them, run a single suite: `php artisan test --testsuite=Feature`. See [docs/testing/frontend/playwright-setup.md](docs/testing/frontend/playwright-setup.md) for the full status, including what CI covers (Chromium only).

### Code quality

```bash
./vendor/bin/sail composer lint          # Fix code style with Pint
./vendor/bin/sail composer lint:check    # Check style without modifying files
./vendor/bin/sail composer types:check   # Static analysis with Larastan
```

### Logs

Tail application logs with Pail:

```bash
./vendor/bin/sail artisan pail
```

### Stopping the environment

```bash
./vendor/bin/sail down
```

## License

`composer.json` declares this project as `MIT`. There is no `LICENSE` file in the repository at this time — confirm with the team before treating this as the final word on distribution/licensing terms.
