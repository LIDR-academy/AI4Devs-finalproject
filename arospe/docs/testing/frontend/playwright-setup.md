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

4. ✅ **The `tests/Browser/` suite is wired up** (task 0006b) — the suite is declared in `phpunit.xml`, gets `RefreshDatabase` through `tests/Pest.php`, ignores its own screenshots, and holds a first real test. Details in [Folder structure](#folder-structure) below; CI's side of it in [CI integration](#ci-integration).

### Known caveat: missing system libraries on this host

During `npx playwright install`, host validation warned that several system libraries are missing on this machine — `libgtk-4`, various GStreamer libraries, `libflite`, `libmanette`, `libsecret`, and others (mostly WebKit/Firefox media/UI dependencies). This is **not a broken install**:

- **Chromium** — the default browser Pest drives — does not appear to need these libraries, so the default browser-test path works.
- **Firefox / WebKit** runs may be unreliable on this host until those libraries are present. Installing them is done with `sudo npx playwright install --with-deps`, which installs OS-level system packages. That is a **system change requiring separate approval** and was **not run** as part of this setup — it is out of scope here. Treat Firefox/WebKit runs as unverified on this machine until it is.

> This caveat is about **this developer host only**, and task 0006b did not change it. CI is a different machine and a different answer: the workflow step added by that task runs `npx --no playwright install --with-deps chromium`, so the GitHub-hosted runner installs its own OS-level packages on a fresh, disposable VM each run — no approval question there, because nothing persists. It installs them for **Chromium only**, so it is not evidence that Firefox/WebKit work anywhere.

## Folder structure

Browser tests live in `tests/Browser/`, a sibling of the existing suites. This mirrors how the repo already splits `tests/Unit/` and `tests/Feature/` (see the table in [../philosophy.md](../philosophy.md#unit-vs-integration-vs-feature-in-this-codebase)):

```
tests/
  Unit/        Pure logic, no DB (no RefreshDatabase)
  Feature/     Full request/Livewire lifecycle, real DB (RefreshDatabase applied via tests/Pest.php)
  Browser/     Real-browser end-to-end tests (Pest browser plugin), RefreshDatabase applied too;
               tests/Browser/Auth/LoginSmokeTest.php (the pipeline canary),
               tests/Browser/UsersIndexTest.php (the Users screen, task 0006) and
               tests/Browser/SalesRegionsIndexTest.php (the Sales Regions screen, task 0018)
```

The suite is wired up (task 0006b). All four pieces are real and verifiable right now:

- **`tests/Browser/` exists**, holding `Auth/LoginSmokeTest.php` (plus `UsersIndexTest.php` since task 0006 and `SalesRegionsIndexTest.php` since task 0018) — a deliberately assertion-light canary that visits `/login`, asserts its user-visible text renders, and calls `assertNoJavaScriptErrors()`. Its job is proving the pipeline runs end to end, **not** covering sign-in behavior (that belongs to `tests/Feature/Auth/AuthenticationTest.php` and to whichever story owns sign-in browser coverage). Don't grow product assertions into it.
- **`phpunit.xml` declares a third `Browser` testsuite** alongside `Unit` and `Feature`:

  ```xml
  <!-- phpunit.xml -->
  <testsuite name="Browser">
      <directory>tests/Browser</directory>
  </testsuite>
  ```

  So `php artisan test` discovers browser tests automatically, and `php artisan test --testsuite=Browser` runs only them.

- **`RefreshDatabase` applies to `Browser` too** — decided **yes**, and wired through the single existing binding in `tests/Pest.php` rather than a second `pest()->extend(...)` block:

  ```php
  // tests/Pest.php
  pest()->extend(TestCase::class)
      ->use(RefreshDatabase::class)
      ->in('Feature', 'Browser');
  ```

  It is correct here for a specific, verified reason: Pest's browser plugin dispatches the page's requests through the **same in-process Laravel kernel** (`vendor/pestphp/pest-plugin-browser/src/Drivers/LaravelHttpServer.php` resolves `HttpKernel` and calls `$kernel->handle(...)`), not a separate server process — so the test's open transaction is visible to the page under test, exactly as it is for `Feature`. That is what makes `actingAs()` and model factories usable from a browser test at all.

- **`.gitignore` ignores `/tests/Browser/Screenshots`** — the repo-root-anchored path matching `Pest\Browser\Support\Screenshot::dir()`, which hardcodes `rootPath.'/tests/Browser/Screenshots'`. Confirmed against that source and with `git check-ignore -v`, not guessed from the directory name. Worth knowing when you write a browser test: Pest auto-captures a screenshot on **any** failed browser assertion, not only when you call `->screenshot()` explicitly.

Mirror the app structure inside `tests/Browser/` (e.g. `tests/Browser/Auth/`, `tests/Browser/Settings/`) exactly as `tests/Feature/` already does — `Auth/LoginSmokeTest.php` establishes that. **Two of the three files already depart from it, and the second one is why this sentence is being sharpened rather than repeated.** Task 0006 shipped `tests/Browser/UsersIndexTest.php` **flat**, where the mirror would put it at `tests/Browser/Users/IndexTest.php` (its component-level counterpart *is* at `tests/Feature/Users/IndexRenderingTest.php`), and this file recorded it as "the real current state, not a second convention — put the next browser test in its mirrored subfolder". The next browser test was task 0018's `tests/Browser/SalesRegionsIndexTest.php`, and it shipped **flat too** — its path likewise came from a story file, written before anyone opened this page. So the flat form is now the majority, and a reader is entitled to treat this as ambiguous. It is not: **the mirrored subfolder is still the convention** (`tests/Browser/SalesRegions/IndexTest.php` is where a fourth Sales Regions browser file belongs), and the two flat files are debt, not precedent. The practical lesson is aimed one step earlier than the test author: **a story file that names a test path is making a convention decision, so the path belongs in the Phase 2 review** — twice now it has not been, and twice the convention has lost by default. Note the artisan-first workflow used everywhere else needs one manual step here: `php artisan make:test --pest LoginBrowserTest` still places the file under `tests/Feature/`, so move it into `tests/Browser/` after generating it.

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

## Waiting: one call is banned in this repo, and one is bounded

Task 0018 spent most of its Phase 3 on real-browser timing, and it produced two rules that are cheaper to read than to rediscover. Both are **environment findings about this repo**, not general Playwright advice.

- ❌ **Never use `->waitForEvent('networkidle')`.** It is the theoretically-correct semantic wait and it is *actively dangerous here*, not merely ineffective: in this dev environment it never settles, hanging 15+ minutes until Pest's own action timeout fires. Some background connection keeps the page permanently "busy" by that definition — plausibly Vite's HMR websocket — which is consistent with Playwright's own upstream guidance against relying on `networkidle` at all. The blast radius was real: repeated multi-minute hangs during one debugging session leaked ~60 `playwright run-server` processes and OOM-killed the MySQL container (exit 137). **Do not reintroduce it anywhere in `tests/Browser/` without first proving it settles promptly and repeatedly in this specific environment**, and if a browser run ever hangs for minutes, check the leaked-process count and the database container before assuming the test is at fault.
- ⚠️ **A short, bounded `->wait(n)` is an accepted mitigation — but only alongside a stated reason, and never as the fix for a real bug.** `SalesRegionsIndexTest.php` carries two, each with a comment naming what it is compensating for: one after a `<flux:select>` selection whose `wire:model` binding does not reliably reach `wire:snapshot` under automation (evidenced, not root-caused, and recorded as a residual rather than hidden), and one after an inline toggle click that read stale **only** under the full 899-test unscoped suite and never under `--filter`. Both were verified by consecutive full-suite runs rather than declared fixed. This is the one carve-out from [test-quality-checklist.md](test-quality-checklist.md)'s "fix or delete a flaky test" rule, and the carve-out has conditions: the wait is short, it is bounded, its comment says what it compensates for, and **nobody reaches for it before the alternative explanation is ruled out** — in this same story, a symptom that looked exactly like async flakiness turned out to be a Blade compile bug that made a `wire:click` a silent no-op ([errors-log.md](../../errors-log.md#two-directive-calls-in-one-blade-component-tags-attribute-string-silently-fail-to-compile--2026-08-26)). A longer wait would have hidden it forever.

The general lesson underneath both: **when a browser test misbehaves, the cheapest next step is to read the DOM's own ground truth rather than to wait longer.** 0018 settled the checkbox question by reading `document.querySelector('[wire:snapshot]')` directly — the actual payload the next Livewire request will send — which distinguished "the click did not register" from "the click registered and the property did not sync", two states that are indistinguishable from a red test. Same instinct as dumping the compiled HTML instead of reasoning about Blade.

## Selector strategy

**Prefer user-visible text and roles over brittle CSS/DOM selectors.** This app is well suited to it: its Blade/Flux views expose real labels and button text you can target directly.

- ✅ Buttons carry visible text: `{{ __('Log in') }}`, `{{ __('Remove passkey') }}`, `{{ __('Enable 2FA') }}` (see `resources/views/livewire/auth/login.blade.php` and `resources/views/livewire/settings/security.blade.php`). Target these with `->click('Log in')` / `->assertSee('Remove passkey')`.
- ✅ `flux:input` renders an accessible `:label` (e.g. `Email address`, `Password`), so `->fill('email', ...)` binds by name/label without a custom selector.
- ⚠️ `data-test` attributes already exist on a few elements (`data-test="login-button"` on the login submit, `data-test="update-password-button"` in the security view). These are the repo's existing hook style — **not** `data-testid`. Lean on visible text first; use an existing `data-test` hook only when text is genuinely ambiguous (e.g. two identically-labelled buttons on one page). Adding new `data-test` hooks is an application-code change — request it from a frontend owner rather than editing views from a docs/QA task.
- ⚠️ **On an admin list screen, "prefer visible text" inverts, and the story that builds the screen owns the hooks.** The Users, Roles and (since task 0018) Sales Regions screens render **icon-only** row controls across many rows, so no visible text identifies a row's action at all — `data-test="edit-region-{id}"` and its siblings are the *only* correct selector there, and each is present on both the enabled and the disabled branch precisely so a test selects the same control either way. Two further traps that screen's tests hit and that generalise: a **page-global substring assertion is unsafe once a second row exists** (`assertSee('0%')` matches inside `10%`, which is why that screen added a row-scoped `data-test="rate-region-{id}"` and a helper that reads only that cell), and a **disabled-state helper must match the real `disabled="disabled"` attribute**, never a bare `disabled` substring — Flux's compiled class list carries the literal `disabled:opacity-75` on the *enabled* branch too, so the naive helper reports every control as disabled and the test can never fail.

Rationale: a test that asserts "the user sees `Remove passkey`" survives markup refactors and verifies what the user actually experiences; a test keyed to `#submit-btn` or a Tailwind class breaks on cosmetic changes without any behavior changing. This is the same behavior-over-implementation principle as [../philosophy.md](../philosophy.md#3-tests-coupled-to-implementation-instead-of-behavior).

## Test tagging, naming, and parallelization

- **Naming:** follow the existing convention — name the test after the behavior and condition, not `it('works')`. See [../qa/coverage-review-checklist.md](../qa/coverage-review-checklist.md) and the philosophy doc's [naming anti-pattern](../philosophy.md#5-generic-names-like-test_it_works).
- **Tagging (proposal, not yet in place):** this repo has **no** `@smoke` / `@regression` tag convention today. Pest supports grouping via `->group('smoke')` on a test, which then runs with `php artisan test --group=smoke`. Adopting a `smoke` / `regression` grouping for browser tests is a reasonable proposal — but document it as *proposed*, exactly as the CI coverage gate is marked proposed-not-enacted in [../ci/pipeline-integration.md](../ci/pipeline-integration.md). Do not describe tags as if they already exist.
  - `TODO: team to decide whether to adopt Pest groups (e.g. smoke / regression / browser) for selective CI runs, and record the decision as an ADR in docs/decisions/.`
- **Parallelization:** Laravel's `--parallel` needs `brianium/paratest`, which is **not installed** (see [../ci/commands.md](../ci/commands.md#run-in-parallel)). Pest's own test **sharding** (splitting tests across parallel CI jobs) is listed as a Pest 4 feature in the skill file, but is likewise not configured here. Treat both as future options gated on real suite-runtime pain, not as available today.

## CI integration

**CI runs the browser suite — on Chromium only.** `.github/workflows/tests.yml` runs a plain `php artisan test` across a PHP 8.3/8.4/8.5 matrix (see [../ci/pipeline-integration.md](../ci/pipeline-integration.md#current-state-real-as-of-this-writing)), and since the `Browser` testsuite is declared in `phpunit.xml`, that single command now executes browser tests too. Task 0006b added the step that makes this possible, on all three matrix legs, immediately after `Install Node Dependencies`:

```yaml
# .github/workflows/tests.yml
- name: Install Playwright Browser (Chromium)
  run: npx --no playwright install --with-deps chromium
```

This step was not optional politeness: without it the pipeline would **hard-fail**, not skip. Verified empirically during task 0006b by hiding the browser binaries and rerunning the canary — the plugin throws (`PlaywrightOutdatedException`) and the run exits non-zero; it has no graceful-degradation path. Declaring a `Browser` testsuite and leaving `tests.yml` alone would have turned three green matrix legs red. The `--no` flag is a deliberate supply-chain guard — see [../../security/ci-workflow-hardening.md](../../security/ci-workflow-hardening.md) for why bare `npx` was rejected.

Two things this does **not** mean — do not overstate them:

- **It is not cross-browser CI coverage.** Only Chromium is installed and only Chromium is exercised. Firefox and WebKit remain unverified everywhere, per the [known caveat](#known-caveat-missing-system-libraries-on-this-host). Whether cross-browser runs are worth their runtime is still an open backlog decision.
- **There is no browser-specific trigger policy.** Browser tests simply inherit whatever `tests.yml` already does for everything else — every push/PR to `develop`/`main`/`master`/`workos`. Nobody has decided whether a growing browser suite should instead run on a schedule or behind a label to keep the pipeline fast; that question is still open and was explicitly left out of task 0006b's scope.

Coverage gating is a separate, still-unenacted proposal — see [../ci/pipeline-integration.md](../ci/pipeline-integration.md); adding the browser suite did not change it.

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

_Last updated: 2026-08-26 — Task 0018 (Sales Regions & Taxes screen — UI): the suite's **third** file, `tests/Browser/SalesRegionsIndexTest.php` (8 tests), recorded in the folder-structure block and the inventory bullet. Three additions beyond the arithmetic. **The folder-structure paragraph is sharpened rather than repeated**: this page has said since task 0006 that the flat `UsersIndexTest.php` is "the real current state, not a second convention — put the next browser test in its mirrored subfolder", and the next browser test shipped flat as well, so the flat form is now the majority and a reader is entitled to read the page as ambiguous. It is not — the mirrored subfolder is still the convention and the two flat files are debt — with the lesson aimed one step earlier than the test author: **a story file that names a test path is making a convention decision, so the path belongs in the Phase 2 review**. Twice now it has not been. **Added "Waiting: one call is banned in this repo, and one is bounded"** — `->waitForEvent('networkidle')` never settles in this environment (15+ minute hangs, ~60 leaked `playwright run-server` processes and an OOM-killed MySQL container in one session) and is banned outright, while a short, bounded `->wait(n)` with a stated reason is the accepted mitigation and the one carve-out from the checklist's fix-or-delete rule — plus the general lesson that produced both: **read the DOM's own ground truth (`[wire:snapshot]`) rather than waiting longer**, since "the click did not register" and "the click registered and the property did not sync" are indistinguishable from a red test. **Added a ⚠️ to the selector strategy**, because "prefer visible text" inverts on an admin list screen whose row controls are icon-only — with the two assertion traps that story's tests hit and that generalise: a page-global `assertSee('0%')` matches inside `10%`, and a disabled-state helper must match `disabled="disabled"` rather than a bare `disabled` substring, which Flux's own `disabled:opacity-75` utility class carries on the **enabled** branch too._

_Previously: 2026-08-16 — Task 0006 (Users list + create/edit modal UI): recorded the suite's second real file, `tests/Browser/UsersIndexTest.php`, in the folder-structure block and the inventory bullet, and noted that it sits flat rather than in the mirrored `Users/` subfolder the convention calls for._

_Previously: 2026-08-16 — Task 0006b (wire up the `tests/Browser/` suite): flipped all four pending bullets to their real done state (suite folder + `Auth/LoginSmokeTest.php`, the `Browser` testsuite in `phpunit.xml`, `RefreshDatabase` extended to `Browser` with the in-process-kernel reason it is correct, and the verified `/tests/Browser/Screenshots` ignore), updated the folder-structure block, and rewrote **CI integration**: CI now does run the browser suite, Chromium-only, via the new `Install Playwright Browser (Chromium)` step — with the trigger-policy and cross-browser questions explicitly still open._

_Previously, 2026-07-19 — Flipped setup status to installed (pest-plugin-browser ^4.3.1, playwright ^1.61.1, `npx playwright install` confirmed); added the missing-system-libraries caveat; kept the Browser suite/folder/CI wiring marked pending._
