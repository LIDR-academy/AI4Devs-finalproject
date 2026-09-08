# Browser Test Setup (Pest 4, Playwright-driven)

This file is named `playwright-setup.md` for discoverability, but this project does **not** run a standalone Playwright / `playwright-bdd` / Cucumber toolchain. Browser tests are written with **Pest 4's built-in browser testing**, which drives a real browser via Playwright under the hood. This keeps browser tests inside the existing Pest suite (same `make:test`, same factories, same Laravel helpers) instead of introducing a parallel JavaScript test runner. See [README.md](README.md#tooling-decision-read-this-first) for the decision.

## Table of Contents

- [Current status: installed](#current-status-installed)
- [Folder structure](#folder-structure)
- [Real syntax](#real-syntax)
- [Waiting: one call is banned in this repo, and one is bounded](#waiting-one-call-is-banned-in-this-repo-and-one-is-bounded)
  - [A bare `wait(n)` is not a polling primitive, and a longer one can fail *because* it is longer](#a-bare-waitn-is-not-a-polling-primitive-and-a-longer-one-can-fail-because-it-is-longer)
  - [A real file upload cannot be driven through `visit()` in this environment](#a-real-file-upload-cannot-be-driven-through-visit-in-this-environment)
  - [A page embedding the same component twice duplicates every `data-test` hook](#a-page-embedding-the-same-component-twice-duplicates-every-data-test-hook)
  - [Orphaned Playwright processes re-accumulate on every browser-test run in this environment](#orphaned-playwright-processes-re-accumulate-on-every-browser-test-run-in-this-environment)
  - [A hung click with no error anywhere: check for occlusion with `document.elementFromPoint()` before suspecting a timing flake](#a-hung-click-with-no-error-anywhere-check-for-occlusion-with-documentelementfrompoint-before-suspecting-a-timing-flake)
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
               tests/Browser/UsersIndexTest.php (the Users screen, task 0006),
               tests/Browser/RolesIndexTest.php (the Roles screen, task 0011),
               tests/Browser/SalesRegionsIndexTest.php (the Sales Regions screen, task 0018),
               tests/Browser/Media/GalleryTest.php (the media gallery modal, story 0020),
               tests/Browser/Components/WysiwygEditorTest.php +
               tests/Browser/Components/WysiwygEditorOutputHtmlTest.php (the WYSIWYG editor, story 0021) and
               tests/Browser/Components/SearchableMultiSelectTest.php (this component, story 0022)
  Browser/Fixtures/  Real, checked-in binary fixtures a browser test needs as bytes on disk
                     (sample-upload.jpg) — never generated at runtime
  ```

> ⚠️ **Corrected 2026-08-31 (story 0022) — this file's own inventory omitted `RolesIndexTest.php` from every count below since it was first mentioned, understating the flat total by one at every step.** `tests/Browser/RolesIndexTest.php` has existed flat since task 0011 (2026-08-21) and was simply never added to this section's file list, its ✅ callout, or its closing paragraph — an under-count that survived four subsequent stories' own passes over this page. The numbers below are corrected in place, not merely appended to.
>
> ✅ **The mirrored-subfolder rule has now held three times running, and the flat files are the minority.** This page has said since task 0006 that the flat `UsersIndexTest.php` is debt and *"the next browser test goes in its mirrored subfolder"*; both task 0011 (`RolesIndexTest.php`) and task 0018 (`SalesRegionsIndexTest.php`) shipped flat anyway, which is why the lesson was re-aimed at Phase 2 — **a story file that names a test path is making a convention decision, so the path belongs in the review, not in the implementation.** Story 0020 is where that first landed (`tests/Browser/Media/GalleryTest.php`, named explicitly in its task file), story 0021 repeated it for both its files, and story 0022 repeats it a third time: `tests/Browser/Components/SearchableMultiSelectTest.php` sits under the mirrored `Components/` subfolder, matching `App\Livewire\Components\SearchableMultiSelect`'s own `tests/Feature/Components/` counterpart, with no departure to record. Three of eight files (`UsersIndexTest.php`, `RolesIndexTest.php`, `SalesRegionsIndexTest.php`) are still flat; that remains debt, and moving them is nobody's story yet — but the flat form is now clearly the minority a new test author would infer from counting files.

The suite is wired up (task 0006b). All four pieces are real and verifiable right now:

- **`tests/Browser/` exists**, holding `Auth/LoginSmokeTest.php` (plus `UsersIndexTest.php` since task 0006, `RolesIndexTest.php` since task 0011, `SalesRegionsIndexTest.php` since task 0018, `Media/GalleryTest.php` since story 0020, `Components/WysiwygEditorTest.php` + `Components/WysiwygEditorOutputHtmlTest.php` since story 0021, and `Components/SearchableMultiSelectTest.php` since story 0022) — a deliberately assertion-light canary that visits `/login`, asserts its user-visible text renders, and calls `assertNoJavaScriptErrors()`. Its job is proving the pipeline runs end to end, **not** covering sign-in behavior (that belongs to `tests/Feature/Auth/AuthenticationTest.php` and to whichever story owns sign-in browser coverage). Don't grow product assertions into it.
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

Mirror the app structure inside `tests/Browser/` (e.g. `tests/Browser/Auth/`, `tests/Browser/Settings/`) exactly as `tests/Feature/` already does — `Auth/LoginSmokeTest.php` establishes that. **Three of eight files depart from it.** Task 0006 shipped `tests/Browser/UsersIndexTest.php` **flat**, where the mirror would put it at `tests/Browser/Users/IndexTest.php` (its component-level counterpart *is* at `tests/Feature/Users/IndexRenderingTest.php`), and this file recorded it as "the real current state, not a second convention — put the next browser test in its mirrored subfolder". The next two browser tests both shipped flat too, for the identical reason (a path written into a story file before anyone opened this page): task 0011's `tests/Browser/RolesIndexTest.php` and task 0018's `tests/Browser/SalesRegionsIndexTest.php`. **That is where the drift stopped.** Story 0020's `tests/Browser/Media/GalleryTest.php`, story 0021's `tests/Browser/Components/WysiwygEditorTest.php` / `Components/WysiwygEditorOutputHtmlTest.php`, and story 0022's `tests/Browser/Components/SearchableMultiSelectTest.php` all shipped in their mirrored subfolders, each because the story's own task file named the path explicitly and cited this section as the reason — so the mirrored form is now a clear majority (five of eight) rather than the minority it was when this paragraph last said the opposite. **The mirrored subfolder is still, and has always been, the convention** (`tests/Browser/SalesRegions/IndexTest.php` is where a second Sales Regions browser file belongs, `tests/Browser/Roles/IndexTest.php` for a second Roles one), and the three flat files are debt, not precedent — but a reader counting files today would no longer mistake flat for the pattern. The practical lesson holds regardless of the count: **a story file that names a test path is making a convention decision, so the path belongs in the Phase 2 review** — the three stories that got this right did so for exactly that reason. Note the artisan-first workflow used everywhere else needs one manual step here: `php artisan make:test --pest LoginBrowserTest` still places the file under `tests/Feature/`, so move it into `tests/Browser/` after generating it.

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

### A bare `wait(n)` is not a polling primitive, and a longer one can fail *because* it is longer

Story 0020's Phase 5 finding **B-1**, traced by reading the plugin's own source rather than by trying values, and it is the reason the ⚠️ above says *short* and *bounded* rather than merely "with a reason". Two mechanics, both non-obvious:

- **`->wait(n)` gets none of the retry machinery an assertion gets.** `AwaitableWebpage::__call()` routes every non-exempt method through `Execution::waitForExpectation()`, whose loop only re-tries on a caught `ExpectationFailedException`. A real polling assertion (`assertVisible()`, `assertSee()`) throws one and gets retried; `wait()`'s callback is a plain async `delay()` with no assertion inside it to throw, so it is passed through the retry wrapper and given nothing by it.
- **A `wait(n)` large enough to matter races the plugin's own ceiling.** `Pest\Browser\Playwright\Playwright::$timeout` is **5000 ms**, and it applies to the call being awaited. `->wait(5)` therefore throws against its *own* budget rather than against the page — a self-inflicted failure that looks exactly like the load-latency flake it was widened to absorb. Story 0020 widened a `->wait(2)` to `->wait(5)` on precisely that theory, watched it fail *more*, and reverted.

**The rule: to buffer a just-triggered round trip, use the polling assertion for the state you actually want (`->assertVisible(...)`), not a longer sleep. Keep any bare `->wait()` at 1–2 s, the values already proven in this repo, and read it as a mitigation for a *known* residual rather than a way to buy time.**

✅ **Corrected 2026-09-02 (story 0024b) — the residual named below is now closed with the exact lever this section already predicted, not a fourth wait/assertion permutation.** `tests/Browser/Media/GalleryTest.php`'s reopen test was this repo's second honestly-recorded flaky browser test, alongside `SalesRegionsIndexTest.php`'s *"measurably reduces but does not provably eliminate"*. Its docblock records three prior fix attempts, each backed by execution rather than reasoning: `assertVisible()` (mechanically the correct primitive — still observed to fail at that line in one isolated run), a direct non-chained `Execution::instance()->wait(0.5)` to dodge the `__call()` routing entirely (no better), and `Playwright::usingTimeout(15000, ...)` around the `fill()` (**worse**). The evidence pointed at a real, occasional delay in the click → Livewire round trip → Alpine `fluxModal()` → native `<dialog>.showModal()` chain exceeding the 5000 ms ceiling — external timing variance, not something the test's own code could wait its way around. Story 0024b applied the lever this section had already named as the only one left untried: the **entire** real-browser flow (from `visit()` through the final assertion) is wrapped in Laravel's own `retry(3, ..., 250)` helper — no new dependency, no wait/assertion value touched. Verified green across 4 subsequent runs (2 isolated single-test runs plus 2 full-suite runs). This does not lower the per-attempt failure rate the test's own docblock measured across two independent 12-run experiments (25% and 50%) — it converts an intermittent per-run failure into a near-certain eventual pass by absorbing that rate across up to 3 independent attempts, which is exactly what "the next lever is a Pest-level retry" meant when it was written.

✅ **Fourth confirming instance — 2026-09-06 (same day), `tests/Browser/Products/AttributeTypesIndexTest.php`'s smoke test.** Same push, same CI run shape, same fix: `Timeout 5000ms exceeded` at `->click('@add-value')` inside the edit-type modal's repeater (`tests/Browser/Products/AttributeTypesIndexTest.php:443` at the time), 4/4 clean local runs under Sail (~9s each), never reproduced outside CI. Wrapped in the identical `retry(3, ..., 250)`. Two flakes surfacing in the same push, in two unrelated modals across two unrelated screens, is itself evidence for the CI-parallel-contention theory the paragraph below already gives rather than against it — a per-test client-side timing bug would not plausibly hit two independent components on the same day with an identical signature, while a shared runner under load from four concurrent browser workers would.

✅ **Third confirming instance — 2026-09-06, `tests/Browser/UsersIndexTest.php`'s smoke test, and the first of the three that never reproduced locally at all.** No story was in progress; a routine CI push failed with `Timeout 5000ms exceeded` at the edit modal's `->click('Cancel')` in *"the users screen produces no javascript errors on load and on every modal open and close"* — the identical class of residual `GalleryTest.php`'s reopen test already documents (a click → Livewire round trip → modal-close chain occasionally exceeding `Playwright::$timeout`'s 5000ms ceiling), on a *different* test and a *different* modal transition (closing via `Cancel`, not opening a native `<dialog>`). What is new here: `GalleryTest.php`'s and `SalesRegionsIndexTest.php`'s residuals were both established by *local* isolated-run experiments (12-run baselines, 25%/50% failure rates) — this one never reproduced locally at all. 4/4 isolated runs under Sail passed cleanly in ~9s each, with no flake across repeated attempts, yet the CI run failed at the same line on (at least) two separate pushes. The distinguishing variable is CI's own execution shape, not the test or the component: `.github/workflows/tests.yml` runs `php artisan test --parallel` with no `--processes`, so paratest auto-detects the GitHub-hosted runner's core count (`Parallel: 4 processes` in the failing run's own output) and spawns **four concurrent real-browser workers competing for that runner's CPU** — a resource-contention shape this repo's local Sail environment, run one test at a time during diagnosis, never exercises. The fix is the same lever as `GalleryTest.php`'s: the whole real-browser flow wrapped in `retry(3, ..., 250)`, with a docblock recording that local reproduction was clean and the CI-only, parallel-runner-contention theory rather than a bogus "12-run baseline" this repo's own convention would otherwise expect. **The generalised lesson: a browser-test flake that never reproduces locally is not evidence the test is fine — a shared, parallel CI runner is a genuinely different execution environment from a single local run, and `retry(3, ..., 250)` is a reasonable first mitigation for this exact residual class even without a local failure-rate baseline to cite**, precisely because the failure mode (an external timing race against a fixed client-side ceiling) is identical to the two already-proven cases, only the trigger differs.

### A real file upload cannot be driven through `visit()` in this environment

Story 0020, Phase 3 step 8 and its Phase 5 re-verification. Both halves were confirmed by **executing** the failing call and reading the plugin's source, not by inference — and together they mean an upload browser test cannot be written here at all today. Know this before planning one.

- **`attach()` is unusable for any file input, not just for drag-and-drop.** It calls Playwright's `setInputFiles` with a literal filesystem path, and Playwright's server refuses `localPaths` outright — *"localPaths are not allowed when the client is not local"* — whenever the client is not collocated with the server. It never is here: this plugin version always launches Playwright via `playwright run-server --mode launchServer` and connects over a WebSocket, a shape Playwright's own `prepareFilesForUpload()` never marks as collocated.
- **Even bypassing `attach()`, the upload never reaches PHP.** Constructing a `File` client-side, assigning a real `FileList` onto the hidden input's `.files` and dispatching `change` **does** work — Livewire's own `wire:model` listener picks it up and starts its temporary-upload XHR. That XHR then returns HTTP 200 with body `{"paths":[]}`: Livewire's `FileUploadController` received **zero** files despite a correct `multipart/form-data` Content-Type. The cause is in the plugin, and it is literal — `Drivers/LaravelHttpServer.php`'s `handleRequest()` builds the Symfony request it hands to Laravel's kernel with `[], // @TODO files...` in the files position. Its in-process HTTP server never parses a multipart body into `UploadedFile` objects, for any request.

**Consequences for test design, and they are not negotiable from application code.** Anything requiring an upload to *complete* — a new tile appearing, a per-file cap being enforced, a title derived from a filename — belongs in a Feature test driving the component directly, where it is fully provable. What a browser test *can* still cover is everything up to the XHR starting: story 0020's "the upload controls are inert while an upload is in flight" test passes, because it only needs `livewire-upload-start` to fire. **A browser test that needs a completed upload is `->skip()`'d with this finding as its reason** — an honest gap beats a green test proving the wrong thing.

### A page embedding the same component twice duplicates every `data-test` hook

Also story 0020, and a hazard any future multi-instance host page inherits. Its harness mounts two `<livewire:media.gallery>` instances, and **both are always in the DOM** — a `<dialog>` without the `open` attribute still has real children, merely hidden by the UA stylesheet. Every hook the component emits (`media-tile-{id}`, `media-search`, `media-cancel`, …) is therefore present twice at all times, and an unscoped `@media-*` shorthand hits Playwright's **strict-mode violation** the moment an assertion or action must resolve to exactly one element. `assertSee()`/`assertDontSee()` are unaffected — they tolerate multiple matches and check whether *any* is visible — which is what makes this fail selectively and confusingly. The fix is a scoping helper returning literal CSS (`Selector::isExplicit()` treats any selector containing `[` as literal and passes it straight to `page.locator()`):

```php
function inOpenGalleryModal(string $dataTest): string
{
    return 'dialog[open] [data-test="'.$dataTest.'"]';
}
```

**Rule: a `data-test` hook is unique per *component*, never per page. The moment a page mounts a component twice, every hook that component emits needs scoping.**

### Orphaned Playwright processes re-accumulate on every browser-test run in this environment

Story 0021's Phase 5 code review (finding F6), root-causing why a doubled flake-rate measurement on that same round turned out to be environmental rather than a code regression. Roughly fifty orphaned `playwright run-server`/`chrome-headless-shell` processes had accumulated across that session's many test runs with no clean shutdown, consuming enough memory (`free -h` showed 1.5 GiB of 2 GiB swap in use) to plausibly explain a measured flake-rate spike on its own, independent of anything this story's code changed.

**This is a *different* finding from the `->waitForEvent('networkidle')` incident two sections above, and it matters that they are not the same thing.** That entry describes a single catastrophic leak — one hung call, ~60 leaked processes, an OOM-killed MySQL container — triggered by one specific banned API call. This one is not triggered by anything unusual at all: **a normal, non-hanging browser-test session in this environment re-accumulates orphaned `playwright run-server` processes on every run**, with no single call to blame. Re-measured directly: 16 fresh `run-server` processes (~2.2 GB RSS) were already back within minutes of a full cleanup, from ordinary test runs alone.

**The mitigation is process hygiene, not a code fix, and it is needed after *any* browser-test session in this environment — not only after one that used `->waitForEvent('networkidle')` or otherwise looked like it hung:**

```bash
pkill -9 -f "playwright run-server"
```

This kills the leaked `run-server` processes and their child Chromium instances with them. Run it after finishing a session of `tests/Browser/` work — interactively, in CI-adjacent local debugging, or between rounds of a code review that re-runs the browser suite repeatedly — before trusting a subsequent run's timing or flake-rate measurement. If a browser-test session ever seems slower or flakier than a previous one with no code change to explain it, check `ps aux | grep "playwright run-server"` (or `free -h` for swap pressure) before concluding the tests themselves regressed.

### A hung click with no error anywhere: check for occlusion with `document.elementFromPoint()` before suspecting a timing flake

Story 0022, building the shared searchable multi-select's browser test: a real click on a chip's remove control hung until Playwright's own actionability timeout, with **no** PHP error, **no** console error, and **no** failed HTTP request — the exact absence-of-signal shape a genuine timing flake also produces, and the wrong instinct here is to reach for a longer `->wait(n)` (already established as [the wrong fix for a different reason](#a-bare-waitn-is-not-a-polling-primitive-and-a-longer-one-can-fail-because-it-is-longer)).

The real cause was a sibling element silently covering the target: an absolutely-positioned results dropdown, rendered before the chip row in source order with no explicit `top` offset, took its layout position from document flow and sat directly on top of the chip area's remove buttons the moment it had any rendered height. `Livewire::test()` never caught it, because it renders no real CSS layout at all — the defect was invisible to the entire component-level Feature suite. See [errors-log.md](../../errors-log.md#an-absolutely-positioned-element-with-no-explicit-top-takes-its-static-position-from-dom-order-and-can-silently-occlude-a-sibling--2026-08-31) for the fix.

**The diagnostic that found it, and the one to reach for first on any hung click with no error:**

```js
document.elementFromPoint(x, y)   // the target's real on-screen coordinates
```

This returns what the browser actually believes is on top at that point — here, the dropdown's own empty-state `<div>`, not the button underneath it. It is the fastest way to distinguish "something is covering the target" from "the handler never fired" from "this is a genuine async timing race", and it is a check `Livewire::test()`-only coverage can never run, since it depends on real layout. Reach for it **before** widening a wait or adding a retry — a wait cannot fix an element that will never become clickable no matter how long the test waits for it.

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

**CI runs the browser suite — on Chromium only.** `.github/workflows/tests.yml` runs `php artisan test --parallel`, pinned to a single PHP version (**`8.5`** since 2026-09-06 — see [../ci/pipeline-integration.md](../ci/pipeline-integration.md#current-state-real-as-of-this-writing)), and since the `Browser` testsuite is declared in `phpunit.xml`, that single command now executes browser tests too. Task 0006b added the step that makes this possible, immediately after `Install Node Dependencies`:

```yaml
# .github/workflows/tests.yml
- name: Install Playwright Browser (Chromium)
  run: npx --no playwright install --with-deps chromium
```

This step was not optional politeness: without it the pipeline would **hard-fail**, not skip. Verified empirically during task 0006b by hiding the browser binaries and rerunning the canary — the plugin throws (`PlaywrightOutdatedException`) and the run exits non-zero; it has no graceful-degradation path. Declaring a `Browser` testsuite and leaving `tests.yml` alone would have turned the run red. The `--no` flag is a deliberate supply-chain guard — see [../../security/ci-workflow-hardening.md](../../security/ci-workflow-hardening.md) for why bare `npx` was rejected. (This paragraph originally read "three green matrix legs" — stale since `tests.yml`'s PHP matrix was dropped to a single `8.5` version on 2026-09-06.)

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

_Last updated: 2026-09-06 (second pass, same day) — a further CI push surfaced a **fourth confirming instance** of the same residual, on `tests/Browser/Products/AttributeTypesIndexTest.php`'s smoke test (`->click('@add-value')` inside the edit-type modal, again 4/4 clean local runs), mitigated identically with `retry(3, ..., 250)`. Also updated the two stale "PHP 8.3/8.4/8.5 matrix" / "three matrix legs" references in the **CI integration** section: `tests.yml`'s PHP matrix was dropped to a single pinned `8.5` version the same day, at the maintainer's request. Two unrelated flakes in the same push, across two unrelated screens, is recorded as supporting evidence for the CI-parallel-contention theory rather than two coincidences._

_Previously: 2026-09-06 (first pass, same day) — No story in progress; a routine CI push surfaced a new flake. Added a **third confirming instance** of the click → Livewire round trip → modal-transition timing residual, on `tests/Browser/UsersIndexTest.php`'s smoke test — the first of the three that never reproduced locally at all (4/4 clean isolated runs under Sail) and failed only under GitHub Actions' `--parallel` run (4 concurrent browser-test workers on one shared runner). Mitigated with the same `retry(3, ..., 250)` lever `GalleryTest.php` already established, recorded with the generalised lesson that a CI-only, non-locally-reproducible flake in this exact residual class doesn't need its own local failure-rate baseline before reaching for the same fix. See [errors-log.md](../../errors-log.md) for the corresponding CI/AVIF entry from the same push (an unrelated finding on the same day)._

_Previously: 2026-09-02 — Story 0024b (Product category in-use delete guard). Corrected the ⚠️ on `GalleryTest.php`'s reopen-test residual to a ✅: the story applied this section's own predicted next lever, wrapping the whole real-browser flow in Laravel's `retry(3, ..., 250)` helper rather than a fourth wait/assertion permutation, verified green across 4 subsequent runs (2 isolated, 2 full-suite). No change to the two 12-run failure-rate baselines, the `->wait(n)` rules, or any other section — this story touches no new browser test, install step or CI workflow._

_Previously: 2026-08-31 — Story 0022 (Shared searchable, server-side-filtered multi-select component): the suite's **eighth** file, `tests/Browser/Components/SearchableMultiSelectTest.php`, in its mirrored subfolder — the third story running to name its test path explicitly at Phase 2 rather than let a mirroring question surface at implementation. Added a new subsection, [A hung click with no error anywhere: check for occlusion with `document.elementFromPoint()` before suspecting a timing flake](#a-hung-click-with-no-error-anywhere-check-for-occlusion-with-documentelementfrompoint-before-suspecting-a-timing-flake) — a real Playwright click hanging on its own actionability timeout with no PHP error, console error or failed request, caused by an absolutely-positioned sibling silently covering the target rather than a broken handler or a genuine timing race; see [errors-log.md](../../errors-log.md#an-absolutely-positioned-element-with-no-explicit-top-takes-its-static-position-from-dom-order-and-can-silently-occlude-a-sibling--2026-08-31) for the fix. **Corrected a stale under-count this page had carried since before task 0018**: the folder-structure inventory, its ✅ callout and its closing "mirror the app structure" paragraph had all omitted `tests/Browser/RolesIndexTest.php` (flat since task 0011) from every count, understating the flat total by one at every step across four subsequent stories' own passes over this page — now corrected in place to three of eight flat, five of eight mirrored. **Verified as unchanged rather than assumed:** the Current status, Real syntax, Selector strategy and CI integration sections — this story adds no new install step, no new CI workflow change, and no selector pattern beyond the per-row `data-test` hooks the icon-only-controls ⚠️ in Selector strategy already covers._

_Previously: 2026-08-31 — Story 0021 (Shared WYSIWYG rich-text editor component — frontend): the suite's **fifth and sixth** files, `tests/Browser/Components/WysiwygEditorTest.php` and `tests/Browser/Components/WysiwygEditorOutputHtmlTest.php`, both in their mirrored subfolder (updated in the folder-structure block, the file-inventory bullet, and the "mirror the app structure" paragraph, which now records four of six files mirrored rather than the two-of-four minority it said a story ago). Added a new subsection, [Orphaned Playwright processes re-accumulate on every browser-test run in this environment](#orphaned-playwright-processes-re-accumulate-on-every-browser-test-run-in-this-environment) (Phase 5 finding F6) — distinct from the `->waitForEvent('networkidle')` incident two sections above (one hung call causing one catastrophic ~60-process leak) in that this is an **ordinary** browser-test session re-accumulating orphaned `playwright run-server` processes on every run with no single call to blame (16 fresh processes, ~2.2 GB RSS, back within minutes of a full cleanup) — with the mitigation (`pkill -9 -f "playwright run-server"` after any browser-test session, not only a hung one) and the instruction to check for it before trusting a flake-rate or timing measurement that looks worse than a previous run with no code change to explain it. **Verified as unchanged rather than assumed:** the Current status, Real syntax, Selector strategy and CI integration sections — this story adds no new install step, no new CI workflow change, and introduces no selector pattern beyond the per-instance `data-test="wysiwyg-editor-{id}"` scoping root D10's own Phase 2 finding already anticipated in [the duplicated-hook subsection](#a-page-embedding-the-same-component-twice-duplicates-every-data-test-hook) immediately above the new one.

_Previously: 2026-08-29 — Story 0020 (Shared media gallery modal — frontend): the suite's **fourth** file, `tests/Browser/Media/GalleryTest.php`, plus the new `tests/Browser/Fixtures/` folder. This is the largest single addition this page has taken, because the story hit three separate tooling limits and each was root-caused by **reading the plugin's source and executing the failing call**, not by trying values. **`->wait(n)` is not a polling primitive** — `AwaitableWebpage::__call()` routes it through `Execution::waitForExpectation()`, whose loop only re-tries on a caught `ExpectationFailedException`, and `wait()`'s callback is a plain `delay()` with no assertion to throw one — **and a longer wait can fail *because* it is longer**, since `Playwright::$timeout` is 5000 ms and `->wait(5)` throws against its own budget. Story 0020 widened a `->wait(2)` to `->wait(5)` on exactly the wrong theory, watched it fail more, and reverted; the rule now says use the polling assertion for the state you want and keep any bare wait at 1–2 s. Its ⚠️ records this repo's **second** honestly-documented flaky browser test, with three execution-backed fix attempts that did not close it (`assertVisible()`, a direct non-chained `Execution::wait()`, and `usingTimeout(15000)` — the last made it *worse*) and the explicit note that the wait/assertion-permutation space is now exhausted, so the next lever is a Pest-level retry rather than a fourth permutation. **A real file upload cannot be driven through `visit()` here at all**, in two independent ways: `attach()` is refused by Playwright's server for *any* file input (`localPaths are not allowed when the client is not local` — this plugin always connects over a WebSocket, which is never collocated), and even the working client-side `FileList`+`change` mechanism dies server-side, because `Drivers/LaravelHttpServer.php` builds its Symfony request with a literal `[], // @TODO files...` and never parses a multipart body. So an upload's *completion* is Feature-test territory, permanently; a browser test can still cover everything up to the XHR starting, which is what story 0020's in-flight-controls test does. **A page embedding one component twice duplicates every `data-test` hook** — a closed `<dialog>` still has real children — so an unscoped shorthand hits Playwright strict mode on any single-element assertion while `assertSee()` silently tolerates it; the scoping-helper idiom is recorded. Finally, **the mirrored-subfolder rule held on the third try**, and the ✅ says why: the path was named in the story file and settled at Phase 2, which is exactly where the previous footer said it belonged._

_Previously: 2026-08-26 — Task 0018 (Sales Regions & Taxes screen — UI): the suite's **third** file, `tests/Browser/SalesRegionsIndexTest.php` (8 tests), recorded in the folder-structure block and the inventory bullet. Three additions beyond the arithmetic. **The folder-structure paragraph is sharpened rather than repeated**: this page has said since task 0006 that the flat `UsersIndexTest.php` is "the real current state, not a second convention — put the next browser test in its mirrored subfolder", and the next browser test shipped flat as well, so the flat form is now the majority and a reader is entitled to read the page as ambiguous. It is not — the mirrored subfolder is still the convention and the two flat files are debt — with the lesson aimed one step earlier than the test author: **a story file that names a test path is making a convention decision, so the path belongs in the Phase 2 review**. Twice now it has not been. **Added "Waiting: one call is banned in this repo, and one is bounded"** — `->waitForEvent('networkidle')` never settles in this environment (15+ minute hangs, ~60 leaked `playwright run-server` processes and an OOM-killed MySQL container in one session) and is banned outright, while a short, bounded `->wait(n)` with a stated reason is the accepted mitigation and the one carve-out from the checklist's fix-or-delete rule — plus the general lesson that produced both: **read the DOM's own ground truth (`[wire:snapshot]`) rather than waiting longer**, since "the click did not register" and "the click registered and the property did not sync" are indistinguishable from a red test. **Added a ⚠️ to the selector strategy**, because "prefer visible text" inverts on an admin list screen whose row controls are icon-only — with the two assertion traps that story's tests hit and that generalise: a page-global `assertSee('0%')` matches inside `10%`, and a disabled-state helper must match `disabled="disabled"` rather than a bare `disabled` substring, which Flux's own `disabled:opacity-75` utility class carries on the **enabled** branch too._

_Previously: 2026-08-16 — Task 0006 (Users list + create/edit modal UI): recorded the suite's second real file, `tests/Browser/UsersIndexTest.php`, in the folder-structure block and the inventory bullet, and noted that it sits flat rather than in the mirrored `Users/` subfolder the convention calls for._

_Previously: 2026-08-16 — Task 0006b (wire up the `tests/Browser/` suite): flipped all four pending bullets to their real done state (suite folder + `Auth/LoginSmokeTest.php`, the `Browser` testsuite in `phpunit.xml`, `RefreshDatabase` extended to `Browser` with the in-process-kernel reason it is correct, and the verified `/tests/Browser/Screenshots` ignore), updated the folder-structure block, and rewrote **CI integration**: CI now does run the browser suite, Chromium-only, via the new `Install Playwright Browser (Chromium)` step — with the trigger-policy and cross-browser questions explicitly still open._

_Previously, 2026-07-19 — Flipped setup status to installed (pest-plugin-browser ^4.3.1, playwright ^1.61.1, `npx playwright install` confirmed); added the missing-system-libraries caveat; kept the Browser suite/folder/CI wiring marked pending._
