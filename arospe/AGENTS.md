# AGENTS.md

Guidelines for AI coding tools working in this repository. This is a **tool-agnostic mirror of
[`CLAUDE.md`](CLAUDE.md)** — the two must never drift apart. If you change one, change the other in
the same pass. Where `CLAUDE.md` references Claude-Code-specific tooling (the Laravel Boost MCP
server, skills, `@docs/...` file references), this file states the equivalent in plain terms.

## Foundational context

This is a Laravel application. Abide by these specific packages and versions:

| Package | Version |
| --- | --- |
| `php` | 8.5 |
| `laravel/framework` | 13 |
| `laravel/fortify` | 1 |
| `laravel/prompts` | 0 |
| `livewire/livewire` | 4 |
| `livewire/flux` (Flux UI free) | 2 |
| `larastan/larastan` | 3 |
| `laravel/boost` | 2 |
| `laravel/mcp` | 0 |
| `laravel/pail` | 1 |
| `laravel/pint` | 1 |
| `laravel/sail` | 1 |
| `pestphp/pest` | 4 |
| `phpunit/phpunit` | 12 |
| `tailwindcss` | 4 |

## Conventions

- Follow all existing code conventions used in this application. When creating or editing a file,
  check sibling files for the correct structure, approach, and naming.
- Use descriptive names for variables and methods — `isRegisteredForDiscounts`, not `discount()`.
- Check for an existing component to reuse before writing a new one.

## Application structure & architecture

- Stick to the existing directory structure; do not create new base folders without approval.
- Do not change the application's dependencies without approval.

## Documentation files

- Only create documentation files if explicitly requested. (The exception is the project's own
  `docs/` maintenance workflow — see [Project documentation](#project-documentation) below.)

## Verification scripts

- Do not create verification scripts or use `tinker` when tests already cover that functionality and
  prove it works. Unit and feature tests matter more.

## Frontend bundling

- If a frontend change is not reflected in the UI, the developer may need to run `npm run build`,
  `npm run dev`, or `composer run dev`. Ask them.

## Artisan

- Run Artisan commands directly (e.g. `php artisan route:list`). Use `php artisan list` to discover
  commands and `php artisan [command] --help` to check parameters.
- Pass `--no-interaction` to every Artisan command so it works without user input, plus the correct
  options.
- Inspect routes with `php artisan route:list`, filtered by `--method=`, `--name=`, `--path=`,
  `--except-vendor`, `--only-vendor`.
- Read configuration with `php artisan config:show <key>` (dot notation), or read the file in
  `config/` directly.

## Tinker

- Use it to execute PHP in app context for debugging. Do not create models without user approval —
  prefer tests with factories. Prefer existing Artisan commands over custom tinker code.
- Always use single quotes to prevent shell expansion:
  `php artisan tinker --execute 'User::where("active", true)->count();'`

## PHP

- Always use curly braces for control structures, even for single-line bodies.
- Use PHP 8 constructor property promotion: `public function __construct(public GitHub $github) { }`.
  Do not leave empty zero-parameter `__construct()` methods unless the constructor is private.
- Use explicit return types and type hints on every method parameter:
  `function isAccessible(User $user, ?string $path = null): bool`
- Use TitleCase for enum keys: `FavoritePerson`, `BestLake`, `Monthly`.
- Prefer PHPDoc blocks over inline comments. Only add inline comments for exceptionally complex
  logic.
- Use array-shape type definitions in PHPDoc blocks.

## Laravel

- Use `php artisan make:` commands to create new files (migrations, controllers, models, tests, …).
  For a generic PHP class, use `php artisan make:class`.
- When creating a new model, create useful factories and seeders for it too.
- For APIs, default to Eloquent API Resources and API versioning — unless existing API routes do not,
  in which case follow the existing application convention. (This app has no REST API yet.)
- When linking to other pages, prefer named routes and the `route()` helper.
- If you hit `Illuminate\Foundation\ViteException: Unable to locate file in Vite manifest`, run
  `npm run build`, or ask the user to run `npm run dev` / `composer run dev`.

## Livewire

- Livewire builds dynamic, reactive interfaces in PHP without writing JavaScript. Use Alpine.js for
  client-side interactions rather than a JavaScript framework.
- Keep state server-side so the UI reflects it. Validate and authorize in actions exactly as you
  would in HTTP requests.

## Testing

- Every change must be programmatically tested. Write a new test or update an existing one, then run
  the affected tests and make sure they pass.
- Run the minimum number of tests needed: `php artisan test --compact` with a specific filename or
  `--filter`.
- This project uses Pest. Create tests with `php artisan make:test --pest {name}` (add `--unit` for a
  unit test). The `{name}` argument must not include the suite directory — `SomeFeatureTest`, not
  `Feature/SomeFeatureTest`. Most tests should be feature tests.
- Use model factories in tests, and check for an existing custom state before setting attributes by
  hand.
- Faker: use `$this->faker->word()` or `fake()->randomDigit()`, following whichever convention the
  surrounding tests already use.
- Do **not** delete tests without approval.

## Code formatting

- After modifying any PHP file, run `vendor/bin/pint --dirty` before finalizing, so the code matches
  the project's expected style. Do not run it in `--test` mode as a substitute for fixing.

## Deployment

- Laravel can be deployed with [Laravel Cloud](https://cloud.laravel.com/).
- `php artisan db:seed --class=RolePermissionSeeder` is a **required** deploy step: that seeder is the
  only source of the app's roles and permission catalog. See
  [`docs/architecture/authorization.md`](docs/architecture/authorization.md#seeding).

## Project documentation

The `docs/` directory is the source of truth for this repository's architecture, conventions, and
process. Read it before writing code; keep it accurate when behavior changes.

Full index: [`docs/README.md`](docs/README.md).

**Read regardless of the task:**

- [`docs/contracts.md`](docs/contracts.md) — behavioral contracts governing what an AI agent may and
  may not do here (notably: ask instead of assuming, and never run `git commit` without a human
  reviewing the staged diff first).
- [`docs/workflow.md`](docs/workflow.md) — the multi-agent Three Amigos + TDD + security + review +
  docs process, phase by phase.
- [`docs/architecture/`](docs/architecture/) — overview, authentication, authorization.
- [`docs/conventions/base-standards.md`](docs/conventions/base-standards.md) — stack versions,
  directory layout, model and Livewire component conventions, quality gates.

**Read when relevant to the task:**

| When | Read |
| --- | --- |
| gating access, or touching auth, roles/permissions, seeders, secrets | [`docs/security/`](docs/security/README.md) |
| you need the database schema | [`docs/database/schema.md`](docs/database/schema.md) |
| you need migration conventions | [`docs/database/migrations.md`](docs/database/migrations.md) |
| you need route/Livewire contracts | [`docs/api/routes.md`](docs/api/routes.md) |
| you need code-style examples | [`docs/conventions/code-style.md`](docs/conventions/code-style.md) |
| you need naming conventions | [`docs/conventions/naming.md`](docs/conventions/naming.md) |
| you write or review tests | [`docs/testing/README.md`](docs/testing/README.md) |
| you need past architectural context | [`docs/decisions/`](docs/decisions/README.md) |
| before repeating a past mistake | [`docs/errors-log.md`](docs/errors-log.md) |

_Last updated: 2026-08-10 — Created as the tool-agnostic mirror of `CLAUDE.md`, matching its pointer
section after task 0002 (roles & permissions foundation) added `docs/security/` and made
`db:seed --class=RolePermissionSeeder` a required deploy step._
