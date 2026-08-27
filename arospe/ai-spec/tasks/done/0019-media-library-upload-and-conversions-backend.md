# [0019] Media library: upload, `.webp`/`.avif` conversions and search (backend)

## Description
Backend half of the Shared Media Gallery ([PRD §2.3](../../../docs/PRD/PRD.md#23-shared-media-gallery),
[assumption 11](../../../docs/PRD/PRD.md#assumptions--confirmed-decisions)): a `media` table, upload
handling with validation, local storage on the `public` disk (`storage/app/public`), automatic
generation of a `.webp` and an `.avif` variant alongside the kept original, and a
title/description search query the gallery modal (story **0020**, frontend) will call. It also
adds a tenth module slug — `media` — to the seeded permission catalog, growing it from 38 to 42
permissions.

This story owns **no modal markup, no drag-and-drop, no single/multi-select, no inline tile
editing** — all of that is story 0020. It ships the server-side surface that UI consumes, in the
same shape story 0004 shipped `App\Livewire\Users\Index` for story 0006 to dress.

## Type
backend | includes database-expert: **yes**

## Three Amigos participants

`product-owner` (lead) + `backend-expert` + `backend-qa` + `database-expert`.

> **Process note — how this debate was actually run.** The three expert roles were convened as
> subagents but the platform's concurrent-subagent pool was saturated and refused all three
> dispatches (hard limit, no retry). `product-owner` therefore performed the three contributions
> inline. To keep the contributions grounded rather than assumed, **every technical claim below
> that could be checked against this machine was executed, not reasoned about** — the PHP image
> extensions, the installed framework's class surface, the Sail/CI PHP configuration, the
> pluralisation of `Media`, and the exact line numbers of every test that hardcodes the
> permission-catalog size. Each such claim is marked **(verified)** with the command's result.
> Claims that could not be executed offline (the exact Composer constraint that resolves) are
> raised as open questions; all four were subsequently **resolved by the coordinator** and are
> recorded below as confirmed decisions.

## Gherkin

```gherkin
Feature: Media library upload, conversions and search

  Scenario: Uploading an image generates webp and avif variants
    Given a catalog administrator who holds media.create
    When they upload a valid .png or .jpg image with a title
    Then the original file is kept and a .webp and an .avif variant are stored alongside it

  Scenario: A successful upload is recorded in the media library
    Given a catalog administrator who holds media.create
    When they upload a valid image with a title and a description
    Then a media record is created carrying that title, that description and the path of all three files

  Scenario: A non-image upload is rejected
    Given a catalog administrator who holds media.create
    When they upload a file that is not an image
    Then the upload is rejected with an explanatory validation message and no media record is created

  Scenario: An oversized image upload is rejected
    Given a catalog administrator who holds media.create
    When they upload an image larger than the configured size limit
    Then the upload is rejected with an explanatory validation message and no media record is created

  Scenario: An image with excessive pixel dimensions is rejected
    Given a catalog administrator who holds media.create
    When they upload an image whose width or height exceeds the configured pixel ceiling
    Then the upload is rejected with an explanatory validation message and no media record is created

  Scenario: A failed conversion leaves nothing behind
    Given a catalog administrator who holds media.create
    When they upload an image whose variant generation fails
    Then no media record is created and no partial file is left on the disk

  Scenario: Searching the library matches an image title
    Given a catalog administrator who holds media.view
    When they search the media library for a word appearing in an image's title
    Then that image is returned in the results

  Scenario: Searching the library matches an image description
    Given a catalog administrator who holds media.view
    When they search the media library for a word appearing in an image's description
    Then that image is returned in the results

  Scenario: A search matching nothing returns an empty result set
    Given a catalog administrator who holds media.view
    When they search the media library for a term matching no title or description
    Then no images are returned

  Scenario: An administrator without media.create cannot upload
    Given a signed-in administrator who holds media.view but not media.create
    When they attempt to upload an image
    Then the upload is refused server-side with a 403

  Scenario: An administrator without media.view cannot browse the library
    Given a signed-in administrator who holds no media permission
    When they attempt to open the media gallery component
    Then access is refused server-side with a 403

  Scenario: The seeded catalog gains the media module
    Given an operator deploying the application
    When they run the database seeder
    Then the permission catalog contains media.view, media.create, media.edit and media.delete
```

---

## Verified environment findings that drive the decisions below

These were executed against this repository/machine during the debate. They are load-bearing —
several decisions would be wrong without them.

| # | Finding | How it was verified | Consequence |
|---|---|---|---|
| V1 | **`Illuminate\Support\Facades\Image` does not exist** in the installed `laravel/framework` **v13.19.0**. There is no `Image` facade, no `Illuminate/Image/` component, and no `intervention` reference anywhere in the framework's `src/` or its `composer.json`. | `grep -rln "Facades\\\\Image\|intervention" vendor/laravel/framework/src/` → empty; `find vendor -path "*Facades/Image.php"` → empty; `ls vendor/laravel/framework/src/Illuminate/` shows no `Image` directory. | The dependency is the **`intervention/image-laravel`** package (`Intervention\Image\Laravel\Facades\Image`), the Laravel facade wrapper over `intervention/image` — **confirmed by the coordinator**, resolved at Phase 3 to **v4.1.1 / intervention/image v4.3.1** (not the `^3` guessed here — see the correction under [D1](#d1--the-image-facade-comes-from-interventionimage-laravel-not-from-the-framework)). |
| V2 | **GD on this PHP 8.5 has WebP support but *no* AVIF support**; **Imagick 7.1.2-8 is loaded and reports both `AVIF` and `WEBP`** in `queryFormats()`. | `php -r 'print_r(gd_info());'` → `[AVIF Support] => ` (empty), `[WebP Support] => 1`. `php -r '(new Imagick)->queryFormats("*AVIF*")'` → `[0] => AVIF`. | Intervention **must be configured with the Imagick driver**. The GD driver would silently fail (or throw) on every `.avif` encode, which is exactly acceptance criterion 4. See [D2](#d2--intervention-runs-on-the-imagick-driver-not-gd). |
| V3 | Sail's image **does** install `php8.5-imagick`. | `grep -n imagick docker/8.5/Dockerfile` → line 57. | Local dev and the Sail container are fine as-is. |
| V4 | **CI does not guarantee Imagick.** `.github/workflows/tests.yml` uses `shivammathur/setup-php` with **no `extensions:` input**, across a PHP `['8.3','8.4','8.5']` matrix. Imagick is not a setup-php default. | Read `.github/workflows/tests.yml` lines 55–60 (the "Setup PHP" step; corrected at Phase 2 from an earlier, stale "lines 33–37" citation). | The workflow must gain `extensions: imagick`, or AC 4 has zero CI coverage. See [D3](#d3--ci-must-install-imagick-explicitly--a-skipped-test-is-not-coverage) and step 1 of [Technical tasks](#technical-tasks). |
| V5 | **No queue worker runs anywhere in this project.** `.env` sets `QUEUE_CONNECTION=database`, but `docker/8.5/supervisord.conf` supervises exactly one program (`php`) — there is no `queue:work` program. `phpunit.xml` pins `QUEUE_CONNECTION=sync`. | Read `.env`, `docker/8.5/supervisord.conf`, `phpunit.xml` line 32. | A queued conversion job **would never execute in local dev**, leaving every uploaded image variant-less indefinitely while the tests (on `sync`) pass. Decisive for [D4](#d4--conversions-run-synchronously-inline-not-on-a-queue). |
| V6 | Sail's PHP allows large uploads: `post_max_size = 100M`, `upload_max_filesize = 100M`. Livewire's own default temporary-upload rule is `['required','file','max:12288']` (12 MB) and this project has **no published `config/livewire.php`**, so that default is live. | `docker/8.5/php.ini` lines 2–3; `vendor/livewire/livewire/config/livewire.php` line 133; `ls config/` shows no `livewire.php`. | An application limit of **8 MB** sits comfortably inside both, so a rejection is a clean validation message rather than a hard 413 or a Livewire-layer error. See [D5](#d5--the-upload-limit-is-8-mb-8192-kb-plus-a-pixel-dimension-ceiling). |
| V7 | **Tests run on MySQL, not SQLite.** `phpunit.xml` overrides only `DB_DATABASE=testing`; `DB_CONNECTION` stays `.env`'s `mysql`, and `compose.yaml` mounts `docker/mysql/create-testing-database.sh` to create that database. | Read `phpunit.xml` lines 24–36 and `compose.yaml`. | A MySQL-only feature (e.g. `FULLTEXT`) *would* work in tests — so the decision not to use one is a scale judgement, not a portability constraint. See [D7](#d7--search-is-a-like-scan-with-no-index--deliberately). |
| V8 | **`Media` already resolves to the table `media`** under Eloquent's default convention. | `php -r 'echo Str::snake(Str::pluralStudly("Media"));'` → `media`. | The table name is correct by default, but it is *accidentally* correct (`Str::plural('Media')` returns `'Media'` unchanged). Declare it explicitly with `#[Table('media')]` — Laravel 13 ships `Illuminate\Database\Eloquent\Attributes\Table`, matching this repo's attribute-based model style. |
| V9 | **`composer.json`'s `setup` script never runs `php artisan storage:link`.** | Read `composer.json` `scripts.setup`. | Files under `storage/app/public` are not web-reachable on a fresh clone. This story is the first to put user-visible files there, so it owns fixing the setup script. |
| V10 | Exact list of tests that hardcode the catalog size — see [The cross-epic seeder amendment](#the-cross-epic-seeder-amendment-38--42). | `grep -rn` across `tests/`. | Eight assertions + one test name + one dataset must change. |

---

## Documented functional decisions

### D1 — The `Image` facade comes from `intervention/image-laravel`, not from the framework

**Confirmed by the coordinator.** Per **V1**, the class named in the original brief
(`Illuminate\Support\Facades\Image`) does not exist in `laravel/framework` v13.19.0. The
dependency is therefore the **`intervention/image-laravel`** Composer package, which registers
`Intervention\Image\Laravel\Facades\Image`.

> **Corrected during Phase 3 (technical-task step 2 — run, not guessed).** `composer require
> intervention/image-laravel` resolved **`intervention/image-laravel` v4.1.1**, depending on
> **`intervention/image` v4.3.1** — not the `^3` this section originally assumed (risk 2's
> "residual risk is only which constraint resolves" is what this is). Two things a v3 mental model
> gets wrong here: **the published config file is `config/intervention-image.php`, not
> `config/image.php`** (`php artisan vendor:publish --provider="Intervention\Image\Laravel\ServiceProvider"`,
> verified by running it — `vendor/intervention/image-laravel/config/intervention-image.php` is
> the only stub the package ships; a `config/image.php` is supported only as a *legacy* fallback
> `ServiceProvider::hasPublishedLegacyConfig()` checks for, never what a fresh publish creates),
> and the facade's `read()`/`encode()`/`save()` shape is otherwise unchanged, so
> `GenerateImageConversions` needs no different call pattern than the original brief assumed. Every
> other statement below (the facade class, the driver config key, the encoder classes) was verified
> against the real v4.1.1/v4.3.1 source and holds as written.

Concretely:

- `composer.json` `require` gains `intervention/image-laravel` (resolved: `^4.1`).
- The conversion action imports `Intervention\Image\Laravel\Facades\Image` — **never**
  `Illuminate\Support\Facades\Image`, which would be a fatal "class not found".
- `config/intervention-image.php` is published and edited (see D2).

**Only `App\Actions\Media\GenerateImageConversions` touches the imaging library.** Every other
class in this story is unaware of which package provides it.

### D2 — Intervention runs on the **Imagick** driver, not GD

**Confirmed by the coordinator.** Non-negotiable given **V2**: GD on this platform cannot encode
AVIF at all. `config/intervention-image.php` pins
`'driver' => \Intervention\Image\Drivers\Imagick\Driver::class` as a **literal, not
`env('IMAGE_DRIVER', ...)`** — the package's own stub defaults that key to GD via `env()`, which
this story removes rather than overrides, so no environment can silently fall back to a driver
that cannot produce AC 4's `.avif` variant. The conversion action must additionally fail loudly
(not silently skip the variant) when Imagick is unavailable — a silently missing `.avif` is a
broken acceptance criterion that no test would catch if the code treats it as optional.

**Prerequisite before Phase 3 starts:** PHP Imagick *with AVIF support* must be verified present
in both the local/Sail environment and CI. See risk 3 in
[Dependencies, risks & open technical questions](#dependencies-risks--open-technical-questions).

### D3 — CI must install Imagick explicitly — a skipped test is not coverage

Per **V4**, the CI job would run without Imagick. `.github/workflows/tests.yml` gains
`extensions: imagick` on the `setup-php` step. Guarding the conversion tests with
`->skip(fn () => ! extension_loaded('imagick'))` was considered and **rejected**: it converts the
single most important acceptance criterion of this story into a green tick that asserted nothing,
on all three PHP versions, invisibly.

Note this edits a workflow file governed by
[security/ci-workflow-hardening.md](../../../docs/security/ci-workflow-hardening.md) — the change is
an input to an already-SHA-pinned `uses:` step, adds no new third-party download, and must be
placed with the existing `setup-php` step (above the Flux-credentials step), so it stays inside
that document's rules.

### D4 — Conversions run **synchronously, inline**, not on a queue

**Recommended and decisive**, on **V5**: no `queue:work` process exists in `supervisord.conf`, so
a dispatched job would sit in the `jobs` table forever in local dev while `phpunit.xml`'s
`QUEUE_CONNECTION=sync` made the tests pass anyway — the worst possible combination (green suite,
broken product). Three supporting reasons:

1. The gallery must show a usable tile **immediately** after upload (PRD §2.3: "the image is
   added to the gallery as a selectable tile"), and a tile whose `.webp`/`.avif` are still
   pending needs a placeholder state, a polling mechanism and a retry story — all of which are
   scope this story does not have.
2. Bounded latency: with the 8 MB / 4000 px caps from **D5** (the pixel cap lowered from the
   originally-drafted 8000 px by Phase 4 finding F-1 — see D5's own note), a two-format Imagick
   encode is sub-second to a few seconds. Acceptable for an explicit, user-initiated backoffice
   upload.
3. The `media` row and its three files then commit or fail **together** (see D6), which is what
   makes the "a failed conversion leaves nothing behind" scenario expressible at all.

**Revisit trigger, recorded now:** if a bulk/multi-file upload path is ever added (0020 allows
dropping several files at once — confirm the per-file limit there), or if a worker is added to
`supervisord.conf`, re-evaluate. The conversion logic lives in its own action precisely so that
wrapping it in a job later is a new class, not a refactor.

### D5 — The upload limit is **8 MB (8192 KB)**, plus a pixel-dimension ceiling

- **Size: `max:8192` (8 MB).** Justification: comfortably inside Sail's 100 MB PHP limits and
  Livewire's 12 MB temporary-upload default (**V6**), so an over-limit file produces a proper
  validation message rather than a 413 or a Livewire transport error; and generously above real
  product photography (a full-frame JPEG is typically 3–8 MB), which is what this gallery is for.
- **Dimensions: `dimensions:max_width=4000,max_height=4000`.** A size cap alone does **not**
  bound decode cost — a highly-compressible PNG of 30000×30000 is a few hundred KB on disk and
  hundreds of megabytes decoded. Since **D4** makes decoding synchronous and in-request, this
  ceiling is a real availability control, not a nicety.

  > **Corrected at Phase 4 (finding F-1, High).** This constant was originally drafted as 8000,
  > and the `appsec-auditor` re-audit measured that a single 8000×8000, 182 KB upload could drive
  > this build's Imagick (Q16-HDRI, ~35–51 bytes/pixel depending on the decode/encode step
  > measured — see the security page's own note) to ~3.3 GB resident and ~29 s in one request,
  > because a pixel-count ceiling alone does not bound decoded memory on a build whose
  > bytes-per-pixel is far above the naive assumption. `MediaValidationRules::MAX_DIMENSION` is
  > now **4000**, and `GenerateImageConversions` additionally derives real `Imagick::setResourceLimit()`
  > ceilings from the same constant so the decoder enforces what this validation rule promises
  > rather than trusting the two to agree by convention. See
  > [security/image-upload-processing.md](../../../docs/security/image-upload-processing.md).
- **Types: `mimes:jpg,jpeg,png` plus the `image` rule.** PRD assumption 11 names exactly
  `.png`/`.jpg`/`.jpeg` as kept originals. GIF/SVG/BMP are deliberately excluded — SVG especially,
  which is an XSS vector when served from the app's own origin.
- The limit lives as a **constant on the validation trait**, not an `.env` key: no other tunable
  in this project is env-driven, and a per-environment upload limit would make a rejection
  irreproducible between dev and CI.

### D6 — The upload is atomic: files and row commit together, or neither

The store action writes the original, generates both variants, then inserts the row inside a
`DB::transaction`, and deletes any file it wrote if anything throws. Rationale: a row pointing at
a missing `.avif` renders a broken tile forever with no UI able to detect it, and an orphaned file
is invisible garbage nobody will ever collect (this project has no audit or cleanup job — PRD
assumption 17). This mirrors `App\Models\User::delete()`'s single-transaction discipline
([schema.md § Soft deletes](../../../docs/database/schema.md#soft-deletes)).

### D7 — Search is a `LIKE` scan with no index — deliberately

`WHERE title LIKE %term% OR description LIKE %term%`, no index. At this table's realistic size
(a backoffice media library is 10²–10³ rows) the scan resolves in well under a millisecond, while
a `FULLTEXT` index costs a write on every insert and changes match semantics (word-boundary and
minimum-token-length rules) in ways a user typing a partial filename would experience as "search
is broken". This is the same reasoning schema.md already records for
[`users.status`](../../../docs/database/schema.md#users) — and per **V7** it is a scale judgement,
not a portability one, since the test connection is MySQL and `FULLTEXT` *would* work.

The `LIKE` wildcards must be escaped (`%`, `_`, `\`) before interpolation so a user searching for
`50%` does not get a wildcard.

### D8 — Three explicit path columns, not a JSON blob and not a child table

Evaluated at the data layer:

| Design | Verdict |
|---|---|
| **(recommended)** `path`, `webp_path`, `avif_path` — three explicit `string` columns | PRD assumption 11 fixes the variant set at exactly two, mandatory, for every image. Three columns make "an image always has both variants" readable in the schema, queryable without JSON functions, and constrainable (`NOT NULL`). |
| `path` + a `conversions` JSON column | Buys flexibility this phase has no use for, at the cost of not being able to declare the variants required, and of every read needing JSON extraction. |
| A child `media_conversions` table | A join (or an eager load) on every gallery tile for a fixed, two-row-per-parent relationship. Correct if the format set were open-ended; it is not. |

**Do not derive variant paths at read time** ("same basename, swap the extension"). Storing them
explicitly is what lets a future re-encode change a naming scheme without a data migration, and
what makes an orphaned/missing variant detectable.

**Deliberately omitted, recorded so the omission is a decision and not an oversight:** a `disk`
column (PRD explicitly excludes cloud storage this phase; adding it later is a one-line migration
with a `'public'` backfill) and a `mime_type` column (derivable from the original's extension,
which is constrained to three values by validation).

### D9 — `media` uses a UUIDv7 primary key, extending ADR 0001's list

**Confirmed by the coordinator**, under the project-wide policy that *all* new Epic 2 business
entities take a UUID primary key, with the shipping geography catalog as the single named
exception. `media` is a business entity, so it uses **UUIDv7 via `HasUuids`**.

Two supporting reasons worth keeping on record: every greenfield domain entity in this project is
already UUID-keyed, and media ids will be interpolated into Blade and passed as `wire:click`
arguments across a gallery of tiles, where a sequential integer would leak total library volume.

[ADR 0001](../../../docs/decisions/0001-uuid-primary-keys.md) enumerates seven UUID entities and
`media` is not among them — it predates both this story and the project-wide policy above. That
makes this a **conscious extension of ADR 0001's scope**, so Phase 6 must amend that ADR (or add
a short successor note) rather than leave it silently contradicted — exactly the failure mode
[errors-log.md](../../../docs/errors-log.md) records for docs that assert a scope the code has since
outgrown.

### D10 — Story 0019 ships the Livewire component class; story 0020 ships its markup

This mirrors the repo's own precedent: story **0004** created `App\Livewire\Users\Index` with a
placeholder view and story **0006** built the real screen. So `App\Livewire\Media\Gallery` (class
+ minimal placeholder view) lands here with `mount()`, the upload method and the search property;
0020 replaces the view with the real modal.

Two consequences:

- **No route — confirmed, modal-only.** PRD §2.3 describes a *modal reused by Products and Blog*,
  and the coordinator has confirmed there is **no standalone Media Library page this phase**.
  Without a route there is no `can:` middleware, so **all** authorization is the component's own
  — `Gate::authorize()` in `mount()` and as the first statement of the upload method, per
  [security/livewire-authorization.md](../../../docs/security/livewire-authorization.md). Do not add
  a `GET /media` route or a sidebar entry in this story.
- The component is a thin shell over the actions, so a future Products/Blog embed calls the same
  action rather than reaching into the component.

### D11 — Scope of the `media.*` permissions in this story

The user confirmed the media gallery gets its **own** permission namespace rather than inheriting
`products.*`. This story exercises only `media.view` (browse/search) and `media.create` (upload).
`media.edit` (inline title/description editing — story 0020) and `media.delete` are seeded but
unused here; that is the normal state for this catalog, which is seeded ahead of its consumers by
design ([authorization.md](../../../docs/architecture/authorization.md#permission-catalog)).

**There is no delete capability this phase — confirmed.** No story implements media deletion, and
none should be added to Epic 2 without a further decision, because the referential question (what
happens to a product or post pointing at a deleted image) cannot be settled before those tables
exist. This is also why the `media` table carries no `deleted_at`
(see [risk 8](#dependencies-risks--open-technical-questions)).

---

## The cross-epic seeder amendment (38 → 42)

`database/seeders/RolePermissionSeeder.php` is owned by already-closed story
[0002](../done/0002-seed-roles-permissions-catalog.md). This story reopens it for
one line.

**The change:** add `'media'` to `MODULES`, and correct the constant's docblock, which currently
reads *"The nine PRD modules gated by the module x action permission grid."*

```php
public const MODULES = [
    'users', 'products', 'sales-regions', 'shipping', 'payment-methods',
    'customers', 'orders', 'blog', 'store-languages', 'media',
];
```

**Resulting counts:** 10 modules × 4 actions = 40, plus the 2 `ROLE_PERMISSIONS` = **42**
permissions. `Administrator` holds everything except `roles.manage-administrators` = **41**.

**No migration is required.** Permissions are *rows* seeded by `RolePermissionSeeder`, not schema.
Nothing in `create_permission_tables` or `config/permission.php` moves. The existing seeder body
already handles the growth correctly and needs no structural change:

- `allPermissionNames()` recomputes from the constants, so the four new names appear automatically.
- `Permission::firstOrCreate()` makes a re-seed idempotent — an already-seeded environment gains
  exactly the four new rows and duplicates nothing.
- `$administratorRole->syncPermissions(...)` re-syncs the full set, so an existing `Administrator`
  role **is** extended with the new grants on re-seed (there is already a passing test for exactly
  this re-sync behaviour at `tests/Feature/Seeders/RolePermissionSeederTest.php:116`).
- Both `PermissionRegistrar::forgetCachedPermissions()` calls (inside and after the transaction)
  already cover the new rows; the post-commit one is the reason a concurrent worker cannot cache
  the pre-media snapshot for Spatie's 24-hour TTL. **Do not touch either call.**

**Deployment note:** an already-deployed environment does not gain `media.*` until `db:seed` is
re-run. Seeding is already a documented required deployment step
([schema.md](../../../docs/database/schema.md#roles-permissions-model_has_roles-model_has_permissions)).

### Exact test updates this forces (verified line numbers, not guessed)

> **Corrected at Phase 2 (`code-reviewer`'s INVEST check).** The table below was originally written
> against a stale reading of these two files and every line number in it was wrong — off by one to
> nineteen lines, in the direction of a **later** line, and three sites were missing entirely (one
> in each file's "does re-seeding change anything" test, plus the `ProductionSeeder` case task 0016
> added to `DatabaseSeederTest.php`, which the original table never mentioned). Re-verified against
> this worktree's `HEAD` (`9cdd144`) with `grep -n "\b37\b\|\b38\b" tests/Feature/Seeders/*.php`
> before Phase 3 starts — per this project's own rule that a line number in a stored task is a
> reading aid to re-verify, never a locator to trust (see
> [errors-log.md](../../../docs/errors-log.md#a-deferred-storys-findings-were-claims-about-a-tree-that-no-longer-existed-and-one-of-them-would-have-reopened-a-bug-in-this-log--2026-08-23)).
> Total sites: **12** in `RolePermissionSeederTest.php` (not 10), **3** in `DatabaseSeederTest.php`
> (not 2) — **15**, not 12.

`tests/Feature/Seeders/RolePermissionSeederTest.php`:

| Line | Current | Change to |
|---|---|---|
| 33 | test name `'seeding creates exactly 38 permissions'` | `'seeding creates exactly 42 permissions'` |
| 36 | `expect(Permission::count())->toBe(38)` | `42` |
| 46–47 | inline module dataset `'users', 'products', … 'store-languages'` | append `'media'` |
| 77 | `expect($granted)->toHaveCount(37)` | `41` |
| 95 | test name `'…holds the same 37 permissions'` | `'…holds the same 41 permissions'` |
| 101 | `->and($administrator->permissions)->toHaveCount(37)` | `41` |
| 131 | `->and($administrator->fresh()->permissions)->toHaveCount(37)` | `41` |
| 167 | `expect($registrar->getPermissions())->toHaveCount(38)` | `42` |
| 347 | `->and(Permission::count())->toBe(38)` | `42` |
| 389 | `->and(Permission::count())->toBe(38)` | `42` |
| 487 | `->and(Permission::count())->toBe(38)` | `42` |
| 575 | `->and(Permission::count())->toBe(38)` | `42` |

`tests/Feature/Seeders/DatabaseSeederTest.php`:

| Line | Current | Change to |
|---|---|---|
| 44 | `->and(Permission::count())->toBe(38)` (production environment) | `42` |
| 94 | `->and(Permission::count())->toBe(38)` (staging environment) | `42` |
| 129 | `->and(Permission::count())->toBe(38)` (`ProductionSeeder`, added by story 0016 — missing from this table's first draft) | `42` |

**Keep the counts hardcoded.** Deriving them from `RolePermissionSeeder::MODULES` etc. was
considered and **rejected**: the assertion would then be `count(constants) === count(constants)`,
which passes no matter what the seeder writes to the database, silently deleting the coverage
these tests exist to provide. A literal `42` that must be edited deliberately is the point — it is
the tripwire that makes a catalog change a conscious act. The inline module dataset at lines 46–47
is the one exception worth keeping literal for the same reason.

**Before editing, re-run the verification grep once more** — this table is a reading aid, and any
commit landing between this Phase 2 fix and Phase 3 implementation could shift these lines again:
```bash
grep -rn "\b37\b\|\b38\b" tests/Feature/Seeders/RolePermissionSeederTest.php tests/Feature/Seeders/DatabaseSeederTest.php
```

---

## Files to create/modify

### Create

- `database/migrations/<ts>_create_media_table.php` — the `media` table (see schema below).
  Naming per [migrations.md](../../../docs/database/migrations.md#file-naming); `down()` is
  `Schema::dropIfExists('media')`.
- `app/Models/Media.php` — `#[Table('media')]` (**V8**), `#[Fillable(['title','description'])]`,
  `use HasFactory, HasUuids;`, `@property string $id`, no `$keyType`/`$incrementing`
  ([base-standards](../../../docs/conventions/base-standards.md#uuid-primary-keys)). The three path
  columns are **omitted from `#[Fillable]`** — they are server-derived and must never be
  mass-assignable, the same guard `users.status`/`pending_email` use. Carries the `#[Scope]`
  search scope and `url()`-style accessors for the three variants.
- `database/factories/MediaFactory.php` — fakes titles/descriptions and *plausible paths only*;
  it must **not** touch the disk, so search/authorization tests stay fast. A `withRealFiles()`
  state (writing fixture bytes to `Storage::fake('public')`) covers the tests that need them.
- `app/Policies/MediaPolicy.php` — `viewAny`, `create` (and `update`/`delete` returning their
  permissions, unused by this story but correct from the start). Auto-discovered by name; **do
  not** add an `AuthServiceProvider`.
- `app/Actions/Media/StoreUploadedImage.php` — **new `app/Actions/Media/` subfolder**, which
  base-standards' "one subfolder per area" rule explicitly sanctions
  ([directory structure](../../../docs/conventions/base-standards.md#directory-structure)). Invokable;
  stores the original on the `public` disk, delegates conversion, inserts the row, cleans up on
  failure (D6).
- `app/Actions/Media/GenerateImageConversions.php` — invokable; the **only** class that imports
  the imaging library. Returns the two written paths, throws on failure (never returns a partial
  result). Split from the store action so it is unit-testable without a database row and
  reusable by a future "re-encode the library" command.
- `app/Concerns/MediaValidationRules.php` — `<Noun>ValidationRules` trait with `<noun>Rules()`
  methods per [naming.md](../../../docs/conventions/naming.md#traits-and-their-methods):
  `imageUploadRules()` and `mediaDetailsRules()`. Holds the `MAX_UPLOAD_KB` / `MAX_DIMENSION`
  constants (D5). Flat and single-concern — it must not `use` another trait.
- `app/Livewire/Media/Gallery.php` + `resources/views/livewire/media/gallery.blade.php` —
  component class per D10, with a **placeholder** view. Note the view path follows the *normal*
  mirror rule (`Media\Gallery` → `livewire/media/gallery.blade.php`); the `Index`-in-a-subfolder
  exception does **not** apply because the class is not named `Index`.
- `lang/en/media.php` + `lang/es/media.php` — key-for-key identical, snake_case leaves, grouped
  (`media.upload.*`, `media.validation.*`, `media.gallery.*`). Every user-facing string here is
  new, so both files are created in the same change.
- `config/intervention-image.php` — published by the adapter (real filename in the resolved
  v4.1.1, corrected at Phase 3 from the originally-assumed `config/image.php` — see D1), edited to
  pin the Imagick driver as a literal, not `env()` (D2).
- Tests — see [Tests to perform](#tests-to-perform).

### Modify

- `composer.json` / `composer.lock` — add the imaging dependency (D1). Also add
  `"@php artisan storage:link"` to the `setup` script (**V9**), since this is the first story to
  put user-visible files under `storage/app/public`.
- `database/seeders/RolePermissionSeeder.php` — one line in `MODULES` + its docblock ("nine" →
  "ten"). Nothing else.
- `tests/Feature/Seeders/RolePermissionSeederTest.php` — 10 edits, listed above with line numbers.
- `tests/Feature/Seeders/DatabaseSeederTest.php` — 2 edits, listed above with line numbers.
- `.github/workflows/tests.yml` — `extensions: imagick` on the `setup-php` step (D3, **V4**),
  keeping its position above the Flux-credentials step per
  [ci-workflow-hardening.md](../../../docs/security/ci-workflow-hardening.md).
- **Docs (Phase 6, `docs-keeper`)** — the amendment touches documents that state the old
  numbers verbatim. Four carry the real narrative and need substantive rewrites:
  `docs/architecture/authorization.md` (the "38-permission catalog" claim, the
  9-modules-×-4 arithmetic, and the module table needs a `media` row),
  `docs/database/schema.md` (the seeded-rows table: `permissions` 38 → 42, `role_has_permissions`
  37 → 41, plus a new `media` table section and an ER-diagram entity),
  `docs/conventions/naming.md` (the quoted `MODULES` constant), and
  `docs/decisions/0001-uuid-primary-keys.md` (D9's scope extension). Plus `docs/README.md`'s index.
  **Corrected at Phase 2:** four more pages state "38" verbatim in a single passing sentence and
  were missing from this list entirely — `docs/architecture/overview.md:19` ("a 38-permission
  catalog"), `docs/security/authorization-patterns.md:673` ("37 of 38 permissions"),
  `docs/testing/backend/datasets-and-factories.md:74` ("38-permission catalog"), and
  `docs/testing/backend/feature-integration-tests.md:70` ("a seeded 38-permission catalog"). Each
  needs only the number changed (38→42, and the one 37→41), not a rewrite — but a doc that states a
  stale count in prose is exactly this project's own recorded
  [bare-negative/stale-arithmetic-claim](../../../docs/errors-log.md#a-docs-this-app-has-no-x-yet-claim-outlived-the-x-by-two-tasks--2026-08-13)
  failure mode, so `docs-keeper` must re-grep for `\b38\b` and `\b37\b` across `docs/` at Phase 6
  rather than trust this list to be exhaustive by then.

### Proposed `media` schema (database-expert contribution)

Physical column order as written in the migration:

| Column | Type | Null | Notes |
|---|---|---|---|
| `id` | `uuid` PK | no | UUIDv7 via `HasUuids` (D9). `$table->uuid('id')->primary();` |
| `title` | `string(255)` | no | searched; user-supplied |
| `description` | `text` | **yes** | searched; optional per PRD (the gallery tile shows it, does not require it) |
| `path` | `string(255)` | no | original, relative to the `public` disk root. **`unique`** |
| `webp_path` | `string(255)` | no | `NOT NULL` is the schema-level statement of AC 4 |
| `avif_path` | `string(255)` | no | same |
| `width` | `unsignedSmallInteger` | no | free at upload (the image is already decoded); impossible to backfill later without re-reading every file |
| `height` | `unsignedSmallInteger` | no | same. `SMALLINT` max 65 535 comfortably exceeds the 8 000 px ceiling (D5) |
| `size_bytes` | `unsignedInteger` | no | original's size; 4 GB ceiling ≫ the 8 MB limit |
| `uploaded_by` | `uuid` FK → `users.id` | **yes** | `foreignUuid(...)->nullable()->constrained()->nullOnDelete()` |
| `timestamps` | | | `created_at` is the gallery's default sort key (newest first) |

**Indexes — and the deliberate omissions.** Only two indexes: the PK, and `unique` on `path`.
The unique is a last-word guard, not the primary defence — Laravel's `store()` already generates a
40-character random basename, so a collision is already implausible; the constraint is what makes
"two rows can never point at the same file" a database invariant rather than a hope (the same
reasoning [schema.md](../../../docs/database/schema.md#users) records for `pending_email`).
**No index on `title`/`description`** (D7 — a leading-wildcard `LIKE` cannot use a B-tree anyway),
**no index on `uploaded_by`** (never filtered on in this story; add it with the feature that
needs it), **no `FULLTEXT`** (D7).

**On `uploaded_by` and soft-deleted users** — worth knowing before someone "fixes" it: `users` is
soft-deleted, so `nullOnDelete()` will essentially **never fire**, because a user delete is an
`UPDATE`, not a `DELETE`. The real runtime behaviour is that the FK stays populated and an
`uploadedBy()` relation resolves to `null` (the `SoftDeletingScope` hides the trashed row) unless
the call site opts into `withTrashed()`. The constraint is retained as correct-by-construction
protection against a genuine hard delete, not as the mechanism anything relies on.

**No `deleted_at` on `media`.** Deleting media is out of scope (D11), and the interesting question
— what happens to a product or post referencing a deleted image — cannot be answered before those
tables exist (Epic 2/4). Deferring is cheaper than guessing: adding `SoftDeletes` later is an
additive migration, whereas removing it after call sites depend on it is not.

---

## Tests to perform

Backend-QA contribution. `Storage::fake('public')` for everything that touches the disk; note
what it does *not* cover in the risks section.

**Unit — `tests/Unit/Actions/Media/GenerateImageConversionsTest.php`**
- [x] Unit: generating conversions from a real fixture image writes exactly two files.
- [x] Unit: the generated `.webp` file is genuinely WebP — assert on the **file signature**
      (`RIFF`…`WEBP` bytes) rather than the extension, so an encoder silently emitting the wrong
      format fails the test.
- [x] Unit: the generated `.avif` file is genuinely AVIF — assert the ISO-BMFF `ftyp` brand
      (`avif`) in the header bytes. Same reasoning.
- [x] Unit: the original file is left byte-identical (nothing re-encodes it in place).
- [x] Unit: a failure during encoding throws and leaves no partially-written variant behind.

**Feature — `tests/Feature/Media/UploadTest.php`**
- [x] Integration: a valid upload by a `media.create` holder creates one `media` row **and** three
      files on the faked disk, with all three column paths pointing at files that exist.
- [x] Integration: the created row carries the submitted title and description, and correct
      `width`/`height`/`size_bytes`.
- [x] Integration: `uploaded_by` is the acting user's id.
- [x] Negative: a `.txt` (or a `.txt` renamed to `.png` — the interesting case, since only content
      sniffing catches it) is rejected with a validation error; **zero** rows and **zero** files.
- [x] Negative: an image of 8193 KB is rejected; an image of 8191 KB is accepted (the boundary,
      tested from both sides — a one-sided limit test passes against a limit of zero).
- [x] Negative: an image exceeding the pixel ceiling is rejected.
- [x] Negative: an upload whose conversion throws leaves no row and no orphaned original on disk
      (D6) — drive it by faking a failing conversion action, not by crafting a corrupt file.
- [x] Authorization: a user holding `media.view` but not `media.create` is refused the upload
      (403), asserted through `Livewire::test()` **and** with the row count unchanged.
- [x] Authorization: a user holding no media permission cannot mount the component.
- [x] Authorization: a `Super Admin` holding zero explicit permission rows passes both, via the
      `Gate::before` bypass.

**Feature — `tests/Feature/Media/SearchTest.php`**
- [x] Integration: a term appearing in a title returns that row.
- [x] Integration: a term appearing only in a description returns that row.
- [x] Integration: a partial/substring term matches (this is the assertion `FULLTEXT` would break).
- [x] Integration: matching is case-insensitive.
- [x] Integration: a term matching nothing returns an empty collection.
- [x] Negative: a search term containing `%` or `_` is treated as a literal, not a wildcard (D7) —
      seed two rows where the unescaped query would over-match, so the test can actually fail.
- [x] Integration: an empty search term returns the full library rather than nothing.

**Feature — `tests/Feature/Policies/MediaPolicyTest.php`**
- [x] Unit/Feature: each ability returns true only for a holder of its permission.
- [x] Feature: a `Super Admin` passes every ability while holding zero permission rows (mirrors
      the existing `UserPolicyTest` case).

**Seeder regression (the cross-epic half)**
- [x] Update all 12 hardcoded assertions/name/dataset entries listed
      [above](#exact-test-updates-this-forces-verified-line-numbers-not-guessed).
- [x] Feature: the catalog contains `media.view`, `media.create`, `media.edit`, `media.delete`
      (covered automatically once `'media'` joins the dataset at lines 44–47).
- [x] Feature: re-seeding an environment already carrying the 38-permission catalog yields 42 and
      creates no duplicates — this is the *upgrade* path, and no existing test covers it.
- [x] **Full suite** must be green before Phase 7 per the
      [Full Test Suite Gate Rule](../../../docs/contracts.md).

**Deliberately not tested** (per [what-not-to-test.md](../../../docs/testing/qa/what-not-to-test.md)):
Intervention's own encoder correctness beyond "the output really is that format"; Laravel's
`Storage` facade; the `unique` constraint on `path` (a database guarantee, not app logic); and
the placeholder Blade view, which story 0020 replaces.

**Test-design traps to avoid**
- `UploadedFile::fake()->image('x.png')` produces a **GD-generated** file. Since GD here has no
  AVIF support (**V2**) but *can produce* a valid PNG, this is a fine *input* to an Imagick encode
  — but do not assume the reverse, and do not use `fake()->create('x.png', 100)` for conversion
  tests: that produces a zero-content file with a `.png` name that no decoder will accept, which
  is a great *negative* fixture and a useless positive one.
- `Storage::fake()` does not exercise real directory permissions, disk-full behaviour, or the
  `storage:link` symlink. The link is a deployment concern (**V9**), not something a test can
  assert; it belongs in the setup script and the docs.

---

## Expected outcome

An administrator holding `media.create` can upload a `.png`/`.jpg`/`.jpeg` under 8 MB with a title
and an optional description. The original is kept on the `public` disk and a `.webp` and an
`.avif` variant are generated alongside it, all three recorded on one `media` row. An
administrator holding `media.view` can search the library by title or description. Invalid uploads
(wrong type, oversized, oversized dimensions) are refused with a message and leave nothing behind.
The seeded catalog carries 42 permissions including the four `media.*` entries, and story 0020 has
a stable server-side surface to build the modal against.

## Acceptance criteria

- [x] **(PRD §2.3 AC 4)** Every uploaded image keeps its original `.png`/`.jpg`/`.jpeg` and
      additionally generates `.webp` and `.avif` variants; all are stored locally under
      `storage/app/public`.
- [x] **(PRD §2.3 AC 5)** Invalid uploads — non-image, over the size limit — are rejected with an
      explanatory message and create no record and no file.
- [x] The `media` table exists with a UUIDv7 primary key and the columns above; `title`,
      `description` and the three path columns are populated on every successful upload.
- [x] A title/description search surface exists and is callable by story 0020, matching partial
      terms case-insensitively on both fields and returning an empty result for a non-match.
- [x] Conversions run synchronously; a successful upload leaves nothing pending.
- [x] Upload and search are authorized against `media.create` / `media.view`, enforced inside the
      Livewire component (not only at a route), with `Gate::authorize()` as the first statement of
      every mutating method.
- [x] `RolePermissionSeeder::MODULES` contains `media`; seeding produces exactly 42 permissions
      and grants `Administrator` 41 of them; re-seeding an existing environment adds the four new
      rows idempotently.
- [x] Every existing test that hardcoded 38/37 has been updated, and the full suite is green.
- [x] CI installs Imagick, so the conversion tests actually execute on all three PHP versions.
- [x] No new user-facing string is hardcoded; `lang/en/media.php` and `lang/es/media.php` are
      key-for-key identical.

## Definition of Done

- [x] Tests written and green (full suite, isolated run — [contracts.md](../../../docs/contracts.md))
- [x] Code reviewed (code-reviewer)
- [x] No security findings (appsec-auditor)
- [x] Documentation updated (docs-keeper) — including the four documents that state the old
      permission counts and ADR 0001's entity list
- [x] Acceptance criteria met

---

## Technical tasks

Ordered; step 1 is a **prerequisite that gates the start of Phase 3**, the rest is the normal TDD
sequence (tests first, per [workflow.md](../../../docs/workflow.md) Phase 3).

1. **Verify the Imagick/AVIF prerequisite before any code is written.** Confirm PHP Imagick is
   installed *and reports AVIF in `queryFormats()`* in (a) the local/Sail environment and (b) CI.
   Sail already installs `php8.5-imagick` (**V3**); CI does not (**V4**). Where it is missing,
   adding it to `docker/8.5/Dockerfile` and/or `.github/workflows/tests.yml` (`extensions: imagick`
   on the SHA-pinned `setup-php` step, above the Flux-credentials step) is a **prerequisite task
   inside this story**, not a blocker on the story itself.
2. `composer require intervention/image-laravel`; publish and edit the real published config file
   (`config/intervention-image.php` — see D1) to pin the Imagick driver as a literal (D1, D2). Done
   — resolved to `intervention/image-laravel` v4.1.1 / `intervention/image` v4.3.1, recorded in
   `composer.json`.
3. Add `"@php artisan storage:link"` to `composer.json`'s `setup` script (**V9**).
4. Amend `RolePermissionSeeder::MODULES` with `'media'` + its docblock, and apply the 12 test edits
   in [the table above](#exact-test-updates-this-forces-verified-line-numbers-not-guessed).
5. `backend-qa` writes the failing tests from [Tests to perform](#tests-to-perform) (red).
6. Migration → `Media` model → `MediaFactory` → `MediaPolicy` (green, in that order — each is a
   dependency of the next).
7. `MediaValidationRules` trait, then `GenerateImageConversions`, then `StoreUploadedImage`.
8. `App\Livewire\Media\Gallery` + placeholder view; `lang/en/media.php` and `lang/es/media.php`.
9. Quality gates in order per [base-standards](../../../docs/conventions/base-standards.md#quality-gates):
   filtered tests → `vendor/bin/pint --dirty --format agent` → Larastan level 7 → full suite.

---

## Dependencies, risks & open technical questions

**Dependencies**
- [0002 — seed roles & permissions catalog](../done/0002-seed-roles-permissions-catalog.md)
  (**done**) — this story amends the file that story created and owns.
- Story **0020** (media gallery modal UI, frontend) **depends on this one** and must be numbered
  and sequenced after it, per workflow.md's
  [task ordering rule](../../../docs/workflow.md#task-ordering-rule).
**Risks**

1. **Cross-epic seeder amendment (highest).** **Fifteen** assertions across two already-green test
   files change in this story (corrected at Phase 2 from an original miscount of twelve — see
   [the corrected table](#exact-test-updates-this-forces-verified-line-numbers-not-guessed)). The
   risk is not the edit — it is *missing one*, which surfaces as a confusing failure in a file this
   story never mentions. Mitigated by the verified line-number table above; re-verify with
   `grep -rn "\b37\b\|\b38\b" tests/Feature/Seeders/` before Phase 5 rather than trusting the table
   after other work lands.
2. **The dependency is `intervention/image-laravel` (V1, D1 — confirmed).** Resolved at technical-task
   step 2 to **v4.1.1**, depending on `intervention/image` **v4.3.1** — not the `^3` guessed here.
   The adapter does support Laravel 13/PHP 8.5 (installed and boots cleanly); the residual
   surprise was the published config filename (`config/intervention-image.php`, not
   `config/image.php` — see D1), now corrected throughout this file. No fallback substitution was
   needed.
3. **Imagick with AVIF support must be verified installed before Phase 3 starts (V2, V4).**
   AVIF is unavailable on GD here, so any environment without Imagick cannot satisfy AC 4 at all.
   Verify it in **both** the local/Sail environment and CI: Sail installs `php8.5-imagick`
   (**V3**) but the CI `setup-php` step does not (**V4**), and neither check has been run against
   a *built* image. Where it is missing, **adding it to the Dockerfile / CI workflow is a
   prerequisite task within this story (technical-task step 1) — it does not block writing or
   validating this story.** A developer running PHP outside Sail will hit a hard failure, which is
   the correct behaviour (D2's "fail loudly"), but the README/docs must say so.
4. **Synchronous conversion is a request-duration and memory cost (D4).** Bounded by the 8 MB /
   4000 px caps (corrected here at the Phase 4 re-audit, finding N-6 — this bullet still said
   "8000 px" after finding F-1 lowered `MediaValidationRules::MAX_DIMENSION` from 8000 to 4000
   during the Phase 4 fix round; see risk 5 below and open technical question 1), but a slow
   upload is a real UX characteristic story 0020 must design a loading state for. Revisit if bulk
   upload lands.
5. **Decompression bombs — closed at Phase 4 (finding F-1, High).** The dimension rule alone did
   not bound decoded memory: bytes-per-pixel is a property of the installed ImageMagick build, not
   a constant, and this project's Q16-HDRI Imagick measured ~51 bytes/pixel against the ~4 the
   dimension cap alone assumed — a 182 KB, 8000×8000 upload could decode to ~3.3 GB / ~29s in one
   request. Closed with three changes together: `Imagick::setResourceLimit()` in
   `GenerateImageConversions`, derived from `MediaValidationRules::MAX_DIMENSION` so the decoder
   enforces the identical ceiling the validator promises; `MAX_DIMENSION` itself lowered from 8000
   to 4000 (measured ~850 MB peak at that ceiling, and a 64-megapixel source has no legitimate use
   for a gallery tile — within D5's own "explicitly left open for adjustment" latitude); and a rate
   limit (10/hour/user) on `Gallery::upload()`, since a single validated temporary-upload token
   could otherwise be replayed against the synchronous decode unboundedly.
6. **`storage:link` is missing from the setup script (V9).** Until fixed, a fresh clone stores
   files correctly and serves them 404. Cheap to fix, easy to forget, invisible in tests.
7. **ADR 0001 goes stale on merge (D9).** `media` becomes an eighth UUID entity while the ADR
   names seven. This is precisely the "a doc's claim outlived the code" failure already recorded in
   [errors-log.md](../../../docs/errors-log.md); Phase 6 must close it in the same pass.
8. **Media deletion is deliberately unimplemented (D11 — confirmed).** `media.delete` is seeded
   but nothing in Epic 2 uses it, and the referential question (a product/post pointing at a
   deleted image) cannot be settled before Epic 2's product tables exist. Decided and recorded,
   not guessed — the risk is only that a later story adds deletion without revisiting it.
9. **The kept original retains its embedded metadata (Phase 4 finding F-4, Low — accepted,
   recorded so it's a decision).** `config/intervention-image.php`'s `'strip' => false` and the
   original being stored byte-identical (D6/D8) together mean any EXIF/GPS/camera data embedded in
   an uploaded photo survives on the served original. The generated `.webp`/`.avif` variants do
   **not** carry it (already confirmed safe — Intervention's encoders don't propagate source
   metadata to those formats). Accepted for this phase: AC 4 requires keeping the original
   byte-identical, and this is a backoffice product-photography catalog, not a personal-photo
   upload surface where GPS disclosure would be the more common concern. Revisit if this gallery
   is ever exposed to non-administrator-sourced uploads.
10. **`MediaPolicy` throws `PermissionDoesNotExist` (a 500), not a denial, if the gallery is
    mounted on an environment that migrated this story's code but has not re-run `db:seed`
    (Phase 4 finding F-6, Low — accepted, not fixed here).** This is the same pre-existing,
    repo-wide pattern `UserPolicy`/`RolePolicy`/`SalesRegionPolicy` already carry — not something
    to fix in this story alone. The "Deployment note" below (`media.*` requires a re-seed) already
    implicitly covers the *symptom* an operator hits (no `media.*` permissions exist); recorded
    here so the *mechanism* (an uncaught `PermissionDoesNotExist` rather than a clean 403) is an
    explicit, cross-referenced decision rather than a surprise the next person re-discovers.
11. **`StoreUploadedImage` re-validates its own input and re-checks its own file-type/extension
    mapping (Phase 4 finding F-2, Medium — fixed).** Recorded here because F-1, F-4 and F-6 were
    the only three findings this section named before the Phase 4 re-audit (finding N-6 of that
    re-audit); F-2, F-3 and F-5 were fixed in the same fix round but never made it into this list.
    Without it, a caller reaching `StoreUploadedImage` other than through
    `App\Livewire\Media\Gallery::upload()` (D10's own stated future consumer — a Products/Blog
    embed, an Artisan command, a queued job) inherited **no** file-type check at all, and the
    stored extension was inferred by `Storage::putFile()`'s sniffed-MIME `hashName()` rather than
    an app-controlled allow-list — an attacker-controlled byte stream could reach a web-served
    directory with an attacker-influenced extension (`text/html` → `.html`, `image/svg+xml` →
    `.svg`), a stored-XSS path from the app's own origin. Closed by adding
    `Validator::make(['photo' => $photo], $this->imageUploadRules())->validate()` as the action's
    own first statement after `Gate::authorize()`, and by storing with `putFileAs()` against an
    explicit, allow-listed extension derived from the now-validated MIME
    (`extensionForValidatedMimeType()`) instead of trusting the inferred one. See
    `app/Actions/Media/StoreUploadedImage.php` and
    [security/image-upload-processing.md](../../../docs/security/image-upload-processing.md#never-let-the-storage-layer-infer-the-extension-of-a-web-served-file).
12. **`GenerateImageConversions` ignored `Storage::put()`'s return value on both variant writes
    (Phase 4 finding F-3, Medium — fixed).** `config/filesystems.php` sets `'throw' => false` on
    the `public` disk, so a failing write (full disk, permissions, quota) returns `false` rather
    than throwing — unchecked, a `media` row could commit pointing at a `.webp`/`.avif` variant
    that was never actually written. Closed by checking each write the same way
    `StoreUploadedImage::__invoke()` already checks its own (`?: throw new RuntimeException(...)`).
    Regression-tested by `tests/Unit/Actions/Media/GenerateImageConversionsFailedWriteTest.php`
    (extended at the Phase 4 re-audit, finding N-1, to also cover a failure on the *second* write —
    the first write failing alone never exercised the cleanup loop's body).
13. **Livewire's temporary-upload endpoint carried no `mimes` restriction and a looser size
    ceiling than this app's own rules (Phase 4 finding F-5, Low — fixed).** This project had no
    published `config/livewire.php`, so Livewire's vendor default applied
    (`['required', 'file', 'max:12288']` — 12 MB, no file-type check at all) to the endpoint a
    browser posts to *before* `Gallery::upload()` ever runs its own validation, reachable by
    anyone holding just `media.view`. Closed by publishing `config/livewire.php` and setting
    `temporary_file_upload.rules` to `['required', 'file', 'mimes:jpg,jpeg,png', 'max:8192']`,
    mirroring `MediaValidationRules::imageUploadRules()`. Strengthened at the Phase 4 re-audit
    (finding N-5) with `tests/Feature/Media/TemporaryUploadConfigTest.php` asserting the
    published `max:` value literally **equals** `MediaValidationRules::MAX_UPLOAD_KB`, not just
    that it currently reads `8192` — the original test could not have caught the two silently
    drifting apart.

> **N-3 (Phase 4 re-audit, Low) — where the rate limit added for F-1 lives, and why, recorded as
> a decision rather than left implicit.** The 10/hour throttle risk item 5 above describes lives
> in `App\Livewire\Media\Gallery::upload()` — **not** in `StoreUploadedImage`, where D10/F-2 place
> the `Gate::authorize()` and file-type checks. This is deliberate, not an oversight matching
> those two: `Gate::authorize()` and `imageUploadRules()` are checks a
> non-interactive caller (a queued job, an Artisan command, a future Products/Blog embed —
> D10's own stated future consumer) must inherit unconditionally, because "is this actor allowed"
> and "is this a valid image" do not depend on *how* the call arrived. A per-**interactive**-actor
> hourly throttle is different: it exists to bound how fast a **human, replaying a browser-issued
> temporary-upload token**, can force repeated synchronous Imagick decodes — a concern that does
> not apply to a trusted internal caller invoking the action directly (an Artisan command seeding
> a product catalog with fifty images in one run is not the attack this limiter defends against).
> Placing the limiter in the action would throttle that legitimate caller for no security benefit.
> Recorded explicitly here so a future embed's author meets a documented decision rather than a
> silent gap — per D10's own "a future Products/Blog embed calls the same action" statement.

**Open technical questions — none blocking**

All four questions this story originally raised were resolved by the coordinator and are now
recorded as confirmed decisions: the imaging package (D1), the Imagick driver (D2), modal-only
scope with no delete capability (D10, D11), and the UUIDv7 primary key (D9). Two non-blocking
items remain, neither of which gates Phase 2 or Phase 3:

1. **The 8 MB / 4000 px upload caps stand as `product-owner`'s recommended default** (D5; the
   pixel ceiling corrected here at the Phase 4 re-audit, finding N-6 — this bullet still said
   "8000 px" after finding F-1 lowered `MediaValidationRules::MAX_DIMENSION` to 4000 during the
   Phase 4 fix round), derived from platform limits (**V6**) rather than from a known asset
   inventory. Explicitly left open for adjustment: if the catalog's real product photography
   routinely exceeds 8 MB, the two constants on `MediaValidationRules` move and nothing else
   changes.
2. **CI cost of `extensions: imagick`.** It adds install time on every run of a 3-version matrix.
   Accepted as the price of actually executing AC 4 (D3), but worth a nod from whoever owns
   pipeline duration.

---

## Phase 2 reconciliation (`code-reviewer`)

**Verdict: FAIL, then PASS after one fix.** The design and INVEST criteria held from the first
draft; one blocking defect was found in the story's own "highest risk" mitigation. Every line
number in the original "Exact test updates" table (the cross-epic seeder amendment) was wrong —
off by one to nineteen lines, and three sites were missing entirely (the total was 15 sites, not
the originally-claimed 12). Corrected in place (see the blockquote above that table) with the
real, re-verified line numbers, plus two smaller corrections: the V4 finding's stale
`.github/workflows/tests.yml` line citation (55–60, not 33–37), and four documentation pages that
state the old "38-permission catalog" number verbatim and were missing from the Phase 6 docs list.
Re-verified against `HEAD` before Phase 3 began. No gates run yet at this phase — there is no code.

## Phase 3 reconciliation (`database-expert` + `backend-expert` + `backend-qa`)

TDD proceeded in the documented order: `backend-qa` wrote four RED test files
(`tests/Unit/Actions/Media/GenerateImageConversionsTest.php`,
`tests/Feature/Media/UploadTest.php`, `tests/Feature/Media/SearchTest.php`,
`tests/Feature/Policies/MediaPolicyTest.php`) against no application code at all, confirming each
failure mode was "class not found" rather than a syntax error in the test itself.
`database-expert` then built the migration, `App\Models\Media` and `MediaFactory`, bringing
`SearchTest.php` fully green and shifting the other three files' failures to the next missing
class. `backend-expert` then built `MediaPolicy`, `MediaValidationRules`,
`GenerateImageConversions`, `StoreUploadedImage`, `App\Livewire\Media\Gallery` and its placeholder
view, and both `lang/*/media.php` files, bringing all four frozen files green (31/31). A Larastan
pass the implementing agent had not run itself found 4 real errors (a `putFile()`/`put()` return
narrowed to `string|false` in `StoreUploadedImage`, and an ambiguous Faker overload in
`MediaFactory`) — fixed and re-verified before moving on, per this project's own recorded lesson
that a verification record must name all three gates, including a gate nobody ran.

Gates at the end of Phase 3, unscoped:
```
php artisan test --testsuite=Unit,Feature   → 902/902 passed
vendor/bin/pint --format agent              → passed
vendor/bin/phpstan analyse (level 7)        → 0 errors
```

## Phase 4 security audit (`appsec-auditor`, two rounds)

**Round 1 verdict: FAIL** — 1 High, 2 Medium (blocking), 3 Low, 5 Informational. F-1 (High): a
182 KB, 8000×8000 crafted PNG could drive this build's Imagick to ~3.3 GB resident / ~29 s in a
single synchronous request — a pixel-count validation rule does not bound decoded memory, because
bytes-per-pixel is a property of the installed ImageMagick build, not a constant. F-2 (Medium):
`StoreUploadedImage` performed no file-type validation of its own, relying entirely on its
Livewire caller — a real gap given D10 explicitly designs this action to be callable by a future
non-Livewire caller that would inherit no such check, and trusted `Storage::putFile()`'s
sniffed-content extension inference as the sole gate against an unexpected file type landing in a
web-served directory. F-3 (Medium): both `Storage::put()` calls in `GenerateImageConversions`
ignored their `string|false` return value, so a failing write (this project's `public` disk sets
`'throw' => false`) could commit a `media` row pointing at a variant that was never written — the
exact failure D6 exists to prevent. F-4/F-5/F-6 (Low) — see below.

**Fixes applied** (`backend-expert`): F-1 — `GenerateImageConversions` now derives real
`Imagick::setResourceLimit()` ceilings (`WIDTH`/`HEIGHT` at `MAX_DIMENSION`, `AREA`/`MEMORY`/`MAP`
at `MAX_DIMENSION² × 64` bytes, `DISK` at 0, `TIME` at 60s) from the same constant the validation
rule uses, so the decoder enforces what the validator promises; `MAX_DIMENSION` lowered from 8000
to 4000; `Gallery::upload()` rate-limited to 10/hour per actor; a resource-limit refusal is
translated to a normal validation message rather than a raw exception. F-2 —
`StoreUploadedImage::__invoke()` now re-validates `$photo` via `MediaValidationRules` as defence
in depth, and stores with an extension derived from an explicit allow-list of the *validated* MIME
type rather than `putFile()`'s inferred one. F-3 — both `Storage::put()` calls now
`?: throw new RuntimeException(...)`, engaging the existing cleanup path. F-5 (Low) —
`config/livewire.php` published and its `temporary_file_upload.rules` narrowed to match this
app's own `mimes:jpg,jpeg,png,max:8192`, closing a gap where any `media.view` holder could stage a
12 MB, type-unrestricted file via Livewire's own temp-upload endpoint. F-4 and F-6 (Low) were
**recorded as accepted decisions rather than fixed** — see the two blockquotes in the risk section
above — F-4 because the kept original retaining EXIF/GPS metadata is an accepted, revisit-triggered
disclosure given AC 4's byte-identical-original requirement and product-photography use case; F-6
because `MediaPolicy` throwing `PermissionDoesNotExist` (a 500) rather than denying pre-reseed is a
pre-existing pattern shared by `UserPolicy`/`RolePolicy`/`SalesRegionPolicy`, not this story's to
fix alone.

**Round 2 verdict: PASS**, with measured re-verification rather than a re-read of the fix: the
8000×8000 bomb that cost 3.3 GB/29s pre-fix now refuses in 0.00 s at ~39–59 MB; nineteen hostile
payloads (SVG+script, HTML+script, PHP webshells, a valid PNG with a PHP payload appended after
`IEND`, path traversal, NUL-byte names) driven directly at `StoreUploadedImage` — bypassing the
Livewire component entirely, the whole point of F-2 — were all correctly rejected or safely
stored; a real disk-write failure was induced (occupying the `.avif` target path with a directory
so only the second write failed) and confirmed the cleanup path deletes the already-written
`.webp`. The two new fixes were themselves audited as new code (per this project's own "audit the
remediation as new code" rule): the rate limiter's `'unauthenticated'` fallback key is provably
unreachable (`Gate::authorize()` runs first and refuses any non-`User` actor before the limiter is
ever reached); Imagick's resource limits are confirmed process-global but harmless here since
`GenerateImageConversions` is this app's only Imagick/Intervention consumer; the translated
`ValidationException` was proven not to leak a raw library error string (injected a message
containing a real filesystem path and confirmed only the generic translated string reached the
user-visible error bag). `appsec-auditor` also authored the project's eleventh security
knowledge-base page, [`docs/security/image-upload-processing.md`](../../../docs/security/image-upload-processing.md),
as a ❌/✅ pair from the outset — the first time that convention has been applied prospectively
rather than after a later pass caught drift.

Seven non-blocking findings (N-1 through N-7) were raised — none gating Phase 5 — and closed in a
follow-up pass before Phase 5 review: N-1 (the partial-write cleanup branch in
`GenerateImageConversions` was never actually exercised — added a case where only the *second*
write fails, proving the loop deletes the already-written `.webp`), N-2 (no test proved the
resource limits actually refuse anything, only that they're configured — added a real over-cap
fixture and asserted a throw), N-3 (documented, no code change: the rate limiter deliberately
lives in `Gallery::upload()` rather than `StoreUploadedImage`, since a per-interactive-actor
throttle should not bind a future non-interactive caller the way `Gate::authorize()` and file-type
validation correctly do — see the blockquote above), N-4 (the rate limiter was consumed by
validation-rejected attempts, so ten fumbled uploads could lock a user out for an hour having
never reached the expensive decode the limiter exists to bound — moved `RateLimiter::attempt()` to
run after `$this->validate()` succeeds), N-5 (the `config/livewire.php` ↔
`MediaValidationRules::MAX_UPLOAD_KB` coupling was guarded only by a comment — added a test
asserting the values are literally equal, not just both currently 8192), N-6 (this task file's own
Phase 4 record named only F-1/F-4/F-6, leaving F-2/F-3/F-5 invisible — closed by this section), N-7
(`docs/README.md`'s security-page count and `config/livewire.php`'s now-dead `preview_mimes`
entries for types `rules` already blocks — both corrected).

Gates after both rounds and the N-1..N-7 cleanup, unscoped:
```
php artisan test --testsuite=Unit,Feature   → 915/915 passed
vendor/bin/pint --format agent              → passed
vendor/bin/phpstan analyse (level 7)        → 0 errors
```

## Phase 5 code review (`code-reviewer`)

**Verdict: PASS.** All ten acceptance criteria verified against real code and tests (not the
prose describing them); every Definition of Done item complete except "Documentation updated",
correctly still outstanding since Phase 6 had not yet run. Independently re-ran all three gates
rather than trusting the record above:
```
php artisan test --testsuite=Unit,Feature   → 915/915 passed, 2600 assertions
vendor/bin/pint --format agent              → passed
vendor/bin/phpstan analyse (level 7)        → 0 errors
```
Confirmed the media test subset actually executes rather than being silently skipped
(`extension_loaded('imagick')` true in this environment, no `->skip()`/`->todo()` anywhere in the
story's tests) — 56 tests, 205 assertions. Confirmed both directions of the Phase 3 link-integrity
check on the task file's stage move (`new` → `in-progress/`) are clean. Verified `#[Title('Media
Library')]`'s literal string is *not* a violation of "no new user-facing string is hardcoded":
every one of the seven `#[Title(...)]` attributes in this app's `app/` is a literal string,
because a PHP attribute argument must be a compile-time constant expression and `__()` cannot
appear there at all — established, unavoidable precedent, not a gap.

Four findings, all addressed in this same pass rather than deferred: **N1 (Medium, fixed above)**
— D4/D5 still said "8000 px" after the Phase 4 fix round lowered `MAX_DIMENSION` to 4000, so the
one section a later story would actually read for the constant's rationale had the wrong number;
corrected in place with a blockquote recording why. **N2 (Medium, fixed by this section)** — no
phase-verdict/gate-record sections existed in this task file, the exact gap this project's own
[errors-log.md](../../../docs/errors-log.md#a-verification-record-that-lists-two-of-three-quality-gates-is-a-record-of-two-gates--2026-08-26)
entry warns about. **N3 (Low, fixed)** — the QA plan's named-but-undelivered seeder upgrade-path
test ("re-seeding an environment already carrying the 38-permission catalog yields 42 and creates
no duplicates") now exists as
`re-seeding an environment that predates the media module adds its four permissions idempotently`
in `RolePermissionSeederTest.php`. **N4 (Low, fixed)** — the security page's "~35 bytes/pixel"
(decode-plus-encode) and the code's "~51 bytes/pixel" (decode-only) figures read as one fact
stated twice inconsistently; both docblocks now state which measurement condition each number
belongs to.

## Phase 6 documentation sync (`docs-keeper`), plus two code gaps found while reading and fixed

`docs-keeper` synced 16 pages under `docs/` to the shipped state (the 38→42/37→41 counts across
seven pages beyond the six the task file's own docs list named, the new `media` schema section,
`MediaPolicy` as the fourth policy and the first behind no route at all, ADR 0001's closed
deferral, and the eleventh security-KB page's index entries). While reading the shipped code
against the doc it was writing, it found two real gaps outside its own read-only remit — both
fixed in this same pass rather than left for a future story:

1. **`lang/{en,es}/roles.php` had no `roles.modules.media` leaf.** The Roles & Permissions
   screen's permission matrix (story 0011) composes a label per module from this array at render
   time; without a `media` entry, the raw key `media` would have rendered in both locales the
   moment an administrator viewed the matrix — exactly the failure
   [naming.md](../../../docs/conventions/naming.md#translation-keys) has predicted since task 0011
   for a module label added without its lang leaf. Added `'media' => 'Media'` /
   `'media' => 'Medios'` to both files; `tests/Feature/Roles/IndexUiTest.php` (unmodified) still
   passes, confirming no other assumption depended on the count.
2. **Neither `App\Livewire\Media\Gallery` nor `App\Actions\Media\StoreUploadedImage` logged a
   refused attempt**, unlike every other admin screen and action this app ships (story 0015b's
   `LogRefusedPrivilegedAttempt` recipe, documented in
   [architecture/authorization.md](../../../docs/architecture/authorization.md#recording-a-refusal--what-every-gate-owes-the-audit-trail)).
   `Gallery::mount()` is a genuinely different case from `Users\Index::mount()` /
   `Roles\Index::mount()` / `SalesRegions\Index::mount()`, all three of which are deliberately
   *unlogged* because their routes' own `can:` gate already refuses before `mount()` ever runs —
   `Gallery` has no route at all (D10), so `mount()`'s refusal is the only gate a caller reaches
   and is exactly the one this recipe exists to record. Both `Gallery::mount()`/`upload()` and
   `StoreUploadedImage::__invoke()` now route their `Gate::authorize()` calls through
   `LogRefusedPrivilegedAttempt` (method-injected in the two Livewire methods, constructor-injected
   in the action per the same `SetSalesRegionActive`←`SetDefaultSalesRegion` precedent
   `$generateImageConversions` already follows). New `tests/Feature/Media/RefusalLoggingTest.php`
   covers all three sites plus a must-not-over-log case, mirroring
   `tests/Feature/SalesRegions/RefusalLoggingTest.php`'s shape.

Gates after both fixes, unscoped:
```
php artisan test --testsuite=Unit,Feature   → 920/920 passed, 2613 assertions
vendor/bin/pint --format agent              → passed
vendor/bin/phpstan analyse (level 7)        → 0 errors
```

## Phase 7 closure

Moved to `ai-spec/tasks/done/`; both link-integrity directions checked (workflow.md) — the seven
inbound bare-filename links from `0020`/`0024`/`0027`/`0029` (all still in `ai-spec/tasks/`) were
updated from `in-progress/0019-...` to `done/0019-...` and re-verified to resolve; the file's own
outbound links needed no change (`in-progress/` → `done/` is a same-depth move).

**Full Test Suite Gate Rule** (contracts.md), run immediately before this move, in isolation (no
concurrent process on the same database, confirmed via `ps aux`): the complete project — every
test, not only this story's — is green. Run as **two** separate invocations rather than one
combined `php artisan test`, for a reason specific to this host's CLI PHP rather than to the
story: this worktree runs on the host's `herd-lite` PHP (not Sail, whose container sets
`memory_limit = -1` per V6), whose CLI default is `memory_limit=128M`. Isolated, the Browser suite
fits comfortably under that; run immediately after the ~920 preceding Unit/Feature tests in the
same long-lived process, the cumulative memory footprint left too little headroom for Playwright's
own JSON client, and `LoginSmokeTest` (a pre-existing test story 0019 does not touch) failed with a
`Fatal error: Allowed memory size ... exhausted` inside `pest-plugin-browser`'s own client code —
verified as an environment artifact rather than a regression by running the Browser suite alone
immediately afterward, green, with no code change in between:
```
php artisan test --testsuite=Unit,Feature   → 920/920 passed, 2613 assertions
php artisan test --testsuite=Browser        → 29/29 passed, 188 assertions
```
949/949 across the whole project, zero failures. Definition of Done and every acceptance criterion
checked off above, each verified against real code/tests rather than trusted from prose, per
Phase 5's own independent re-verification.
