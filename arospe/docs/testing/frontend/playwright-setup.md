# Browser Test Setup (Pest 4, Playwright-driven)

This file is named `playwright-setup.md` for discoverability, but this project does **not** run a standalone Playwright / `playwright-bdd` / Cucumber toolchain. Browser tests are written with **Pest 4's built-in browser testing**, which drives a real browser via Playwright under the hood. This keeps browser tests inside the existing Pest suite (same `make:test`, same factories, same Laravel helpers) instead of introducing a parallel JavaScript test runner. See [README.md](README.md#tooling-decision-read-this-first) for the decision.

## Table of Contents

- [Current status: installed](#current-status-installed)
- [Folder structure](#folder-structure)
- [Real syntax](#real-syntax)
- [Selector strategy](#selector-strategy)
- [Test tagging, naming, and parallelization](#test-tagging-naming-and-parallelization)
- [CI integration](#ci-integration)
- [Correct vs. incorrect examples](#correct-vs-incorrect-examples)

## Current status: installed

The browser-testing plugin is now a real dependency of this project. The two install steps below are **done** (verified against `composer.json`, `composer.lock`, and `package.json`):

1. ✅ **Pest browser plugin added** — `pestphp/pest-plugin-browser` (`^4.3`, resolved to `v4.3.1`) is in `composer.json`'s `require-dev` and installed under `vendor/pestphp/pest-plugin-browser/`. It pulled in a set of `amphp/*` transitive dependencies; those are internal to the plugin and not something you interact with directly.

   ```bash
   composer require pestphp/pest-plugin-browser --dev
   ```

2. ✅ **Playwright installed as a dev dependency** — `playwright` (`^1.61.1`) is in `package.json`'s `devDependencies`.

   ```bash
   npm install playwright@latest --save-dev
   ```

3. ✅ **Browser binaries downloaded** — the confirmed command is `npx playwright install` (no TODO — this is the real command that was run). It downloads the Chromium, Firefox, and WebKit binaries into `~/.cache/ms-playwright/`, which is a **machine-local cache, not committed to the repo**. Anyone setting up a fresh machine or a CI runner must run it once before browser tests can execute:

   ```bash
   npx playwright install
   ```

### Known caveat: missing system libraries on this host

During `npx playwright install`, host validation warned that several system libraries are missing on this machine — `libgtk-4`, various GStreamer libraries, `libflite`, `libmanette`, `libsecret`, and others (mostly WebKit/Firefox media/UI dependencies). This is **not a broken install**:

- **Chromium** — the default browser Pest drives — does not appear to need these libraries, so the default browser-test path works.
- **Firefox / WebKit** runs may be unreliable on this host until those libraries are present. Installing them is done with `sudo npx playwright install --with-deps`, which installs OS-level system packages. That is a **system change requiring separate approval** and was **not run** as part of this setup — it is out of scope here. Treat Firefox/WebKit runs as unverified on this machine until it is.

## Folder structure

Browser tests live in `tests/Browser/`, a sibling of the existing suites. This mirrors how the repo already splits `tests/Unit/` and `tests/Feature/` (see the table in [../philosophy.md](../philosophy.md#unit-vs-integration-vs-feature-in-this-codebase)):

```
tests/
  Unit/        Pure logic, no DB (no RefreshDatabase)
  Feature/     Full request/Livewire lifecycle, real DB (RefreshDatabase applied via tests/Pest.php)
  Browser/     Real-browser end-to-end tests (Pest browser plugin) — NOT created yet (see pending work below)
```

The plugin is installed, but the suite is **not yet wired up**. The following are still pending and must not be described as done:

- `tests/Browser/` **does not exist yet** — no browser test files have been created.
- `phpunit.xml` still declares only the `Unit` and `Feature` testsuites — there is **no `Browser` testsuite** yet.
- `tests/Pest.php` still applies `RefreshDatabase` only to the `Feature` suite. Whether browser tests should also get `RefreshDatabase` (they usually should) is **still undecided** and must be wired in `tests/Pest.php` when the suite is added — don't assume it's inherited.
- `.gitignore` does not yet ignore `tests/Browser/Screenshots`.

When the suite is created, use the same artisan-first workflow used everywhere else — `php artisan make:test --pest LoginBrowserTest` places the file under `tests/Feature/` by default, so move browser tests into `tests/Browser/` (or configure the suite). Mirror the app structure inside it (e.g. `tests/Browser/Auth/`, `tests/Browser/Settings/`) exactly as `tests/Feature/` already does.

## Real syntax

All examples below use only syntax shown in [`.claude/skills/pest-testing/SKILL.md`](../../../.claude/skills/pest-testing/SKILL.md) — don't invent methods it doesn't demonstrate.

A browser test visits a URL, asserts on user-visible content, drives the page, and always checks for JavaScript errors:

```php
// Shape from .claude/skills/pest-testing/SKILL.md — adapt route/labels to this app
it('may reset the password', function () {
    Notification::fake();

    $this->actingAs(User::factory()->create());

    $page = visit('/sign-in');

    $page->assertSee('Sign In')
        ->assertNoJavaScriptErrors()
        ->click('Forgot Password?')
        ->fill('email', 'nuno@laravel.com')
        ->click('Send Reset Link')
        ->assertSee('We have emailed your password reset link!');

    Notification::assertSent(ResetPassword::class);
});
```

The building blocks available:

| Call | Purpose |
| --- | --- |
| `visit('/login')` | Open a page in a real browser; returns a page object to chain on. |
| `->assertSee('Log in')` | Assert user-visible text is present (prefer this over selectors). |
| `->assertNoJavaScriptErrors()` | Fail if the page threw any JS error — a cheap, high-value check; include it in every browser test. |
| `->click('Log in')` | Click by visible text/label. |
| `->fill('email', 'ada@example.com')` | Type into a field by its name/label. |
| `->assertNoConsoleLogs()` | Assert no stray console output (used in smoke testing). |

**Laravel helpers work inside browser tests** — reuse them instead of driving the UI to set up state:

- `$this->actingAs(User::factory()->create())` to start authenticated.
- Model factories, including custom states such as `User::factory()->withTwoFactor()` (used in `tests/Feature/Auth/TwoFactorChallengeTest.php`).
- `Notification::fake()` / `Notification::assertSent(...)` for password-reset and recovery-code mail.
- `RefreshDatabase` for a clean DB per test.

**Smoke testing** multiple pages for JS errors in one shot — a fast first line of defense across this app's real routes:

```php
// Real routes from docs/api/routes.md
$pages = visit(['/', '/login', '/register']);

$pages->assertNoJavaScriptErrors()->assertNoConsoleLogs();
```

Authenticated routes (`/dashboard`, `/settings/profile`) need `actingAs` first, and `/settings/security` additionally needs a confirmed password in the session (`password.confirm` middleware) — see [../../architecture/authentication.md](../../architecture/authentication.md) and [../../api/routes.md](../../api/routes.md).

## Selector strategy

**Prefer user-visible text and roles over brittle CSS/DOM selectors.** This app is well suited to it: its Blade/Flux views expose real labels and button text you can target directly.

- ✅ Buttons carry visible text: `{{ __('Log in') }}`, `{{ __('Remove passkey') }}`, `{{ __('Enable 2FA') }}` (see `resources/views/livewire/auth/login.blade.php` and `resources/views/livewire/settings/security.blade.php`). Target these with `->click('Log in')` / `->assertSee('Remove passkey')`.
- ✅ `flux:input` renders an accessible `:label` (e.g. `Email address`, `Password`), so `->fill('email', ...)` binds by name/label without a custom selector.
- ⚠️ `data-test` attributes already exist on a few elements (`data-test="login-button"` on the login submit, `data-test="update-password-button"` in the security view). These are the repo's existing hook style — **not** `data-testid`. Lean on visible text first; use an existing `data-test` hook only when text is genuinely ambiguous (e.g. two identically-labelled buttons on one page). Adding new `data-test` hooks is an application-code change — request it from a frontend owner rather than editing views from a docs/QA task.

Rationale: a test that asserts "the user sees `Remove passkey`" survives markup refactors and verifies what the user actually experiences; a test keyed to `#submit-btn` or a Tailwind class breaks on cosmetic changes without any behavior changing. This is the same behavior-over-implementation principle as [../philosophy.md](../philosophy.md#3-tests-coupled-to-implementation-instead-of-behavior).

## Test tagging, naming, and parallelization

- **Naming:** follow the existing convention — name the test after the behavior and condition, not `it('works')`. See [../qa/coverage-review-checklist.md](../qa/coverage-review-checklist.md) and the philosophy doc's [naming anti-pattern](../philosophy.md#5-generic-names-like-test_it_works).
- **Tagging (proposal, not yet in place):** this repo has **no** `@smoke` / `@regression` tag convention today. Pest supports grouping via `->group('smoke')` on a test, which then runs with `php artisan test --group=smoke`. Adopting a `smoke` / `regression` grouping for browser tests is a reasonable proposal — but document it as *proposed*, exactly as the CI coverage gate is marked proposed-not-enacted in [../ci/pipeline-integration.md](../ci/pipeline-integration.md). Do not describe tags as if they already exist.
  - `TODO: team to decide whether to adopt Pest groups (e.g. smoke / regression / browser) for selective CI runs, and record the decision as an ADR in docs/decisions/.`
- **Parallelization:** Laravel's `--parallel` needs `brianium/paratest`, which is **not installed** (see [../ci/commands.md](../ci/commands.md#run-in-parallel)). Pest's own test **sharding** (splitting tests across parallel CI jobs) is listed as a Pest 4 feature in the skill file, but is likewise not configured here. Treat both as future options gated on real suite-runtime pain, not as available today.

## CI integration

`.github/workflows/tests.yml` currently runs a plain `php artisan test` across a PHP 8.3/8.4/8.5 matrix (see [../ci/pipeline-integration.md](../ci/pipeline-integration.md#current-state-real-as-of-this-writing)). It does **not**:

- install the Pest browser plugin,
- install Playwright browser binaries, or
- run any browser tests.

Adding browser tests to CI is a **follow-up**, not something already wired up — even though the plugin itself is now installed. It would require: a step to install browser binaries (`npx playwright install`, and likely `npx playwright install --with-deps` on a fresh runner so the WebKit/Firefox system libraries noted in the [known caveat](#known-caveat-missing-system-libraries-on-this-host) are present), and a decision on whether browser tests run on every push or only on a schedule/label to keep the pipeline fast. Do not claim CI runs browser tests until `tests.yml` actually does.

## Correct vs. incorrect examples

❌ Incorrect — brittle, keyed to implementation detail, and no JS-error check:

```php
it('logs in', function () {
    visit('/login')
        ->fill('#email-input-field', 'ada@example.com')
        ->fill('#password-input-field', 'password')
        ->click('.btn.btn-primary.w-full'); // breaks on any CSS refactor
});
```

✅ Correct — targets visible text/labels, asserts observable outcome, checks for JS errors:

```php
// Real routes/labels: routes/web.php, resources/views/livewire/auth/login.blade.php
it('signs an existing user in and lands them on the dashboard', function () {
    $user = User::factory()->create();

    visit('/login')
        ->assertNoJavaScriptErrors()
        ->fill('email', $user->email)
        ->fill('password', 'password')
        ->click('Log in')
        ->assertSee('Dashboard');
});
```

_Last updated: 2026-07-19 — Flipped setup status to installed (pest-plugin-browser ^4.3.1, playwright ^1.61.1, `npx playwright install` confirmed); added the missing-system-libraries caveat; kept the Browser suite/folder/CI wiring marked pending._
