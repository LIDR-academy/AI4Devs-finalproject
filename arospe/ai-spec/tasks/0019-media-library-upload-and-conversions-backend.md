# [0019] Media library: upload, `.webp`/`.avif` conversions and search (backend)

## Description
Backend half of the Shared Media Gallery ([PRD §2.3](../../docs/PRD/PRD.md#23-shared-media-gallery),
[assumption 11](../../docs/PRD/PRD.md#assumptions--confirmed-decisions)): a `media` table, upload
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
| V1 | **`Illuminate\Support\Facades\Image` does not exist** in the installed `laravel/framework` **v13.19.0**. There is no `Image` facade, no `Illuminate/Image/` component, and no `intervention` reference anywhere in the framework's `src/` or its `composer.json`. | `grep -rln "Facades\\\\Image\|intervention" vendor/laravel/framework/src/` → empty; `find vendor -path "*Facades/Image.php"` → empty; `ls vendor/laravel/framework/src/Illuminate/` shows no `Image` directory. | The dependency is the **`intervention/image-laravel`** package (`Intervention\Image\Laravel\Facades\Image`), the Laravel facade wrapper over `intervention/image` v3 — **confirmed by the coordinator**. See [D1](#d1--the-image-facade-comes-from-interventionimage-laravel-not-from-the-framework). |
| V2 | **GD on this PHP 8.5 has WebP support but *no* AVIF support**; **Imagick 7.1.2-8 is loaded and reports both `AVIF` and `WEBP`** in `queryFormats()`. | `php -r 'print_r(gd_info());'` → `[AVIF Support] => ` (empty), `[WebP Support] => 1`. `php -r '(new Imagick)->queryFormats("*AVIF*")'` → `[0] => AVIF`. | Intervention **must be configured with the Imagick driver**. The GD driver would silently fail (or throw) on every `.avif` encode, which is exactly acceptance criterion 4. See [D2](#d2--intervention-runs-on-the-imagick-driver-not-gd). |
| V3 | Sail's image **does** install `php8.5-imagick`. | `grep -n imagick docker/8.5/Dockerfile` → line 57. | Local dev and the Sail container are fine as-is. |
| V4 | **CI does not guarantee Imagick.** `.github/workflows/tests.yml` uses `shivammathur/setup-php` with **no `extensions:` input**, across a PHP `['8.3','8.4','8.5']` matrix. Imagick is not a setup-php default. | Read `.github/workflows/tests.yml` lines 33–37. | The workflow must gain `extensions: imagick`, or AC 4 has zero CI coverage. See [D3](#d3--ci-must-install-imagick-explicitly--a-skipped-test-is-not-coverage) and step 1 of [Technical tasks](#technical-tasks). |
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
`Intervention\Image\Laravel\Facades\Image`, publishes `config/image.php`, and depends on
`intervention/image` `^3`.

Concretely:

- `composer.json` `require` gains `intervention/image-laravel`.
- The conversion action imports `Intervention\Image\Laravel\Facades\Image` — **never**
  `Illuminate\Support\Facades\Image`, which would be a fatal "class not found".
- `config/image.php` is published and edited (see D2).

**Only `App\Actions\Media\GenerateImageConversions` touches the imaging library.** Every other
class in this story is unaware of which package provides it.

### D2 — Intervention runs on the **Imagick** driver, not GD

**Confirmed by the coordinator.** Non-negotiable given **V2**: GD on this platform cannot encode
AVIF at all. `config/image.php` pins
`'driver' => \Intervention\Image\Drivers\Imagick\Driver::class`, and the conversion action must
fail loudly (not silently skip the variant) when Imagick is unavailable — a silently missing
`.avif` is a broken acceptance criterion that no test would catch if the code treats it as
optional.

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
[security/ci-workflow-hardening.md](../../docs/security/ci-workflow-hardening.md) — the change is
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
2. Bounded latency: with the 8 MB / 8000 px caps from **D5**, a two-format Imagick encode is
   sub-second to a few seconds. Acceptable for an explicit, user-initiated backoffice upload.
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
- **Dimensions: `dimensions:max_width=8000,max_height=8000`.** A size cap alone does **not**
  bound decode cost — a highly-compressible PNG of 30000×30000 is a few hundred KB on disk and
  hundreds of megabytes decoded. Since **D4** makes decoding synchronous and in-request, this
  ceiling is a real availability control, not a nicety.
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
([schema.md § Soft deletes](../../docs/database/schema.md#soft-deletes)).

### D7 — Search is a `LIKE` scan with no index — deliberately

`WHERE title LIKE %term% OR description LIKE %term%`, no index. At this table's realistic size
(a backoffice media library is 10²–10³ rows) the scan resolves in well under a millisecond, while
a `FULLTEXT` index costs a write on every insert and changes match semantics (word-boundary and
minimum-token-length rules) in ways a user typing a partial filename would experience as "search
is broken". This is the same reasoning schema.md already records for
[`users.status`](../../docs/database/schema.md#users) — and per **V7** it is a scale judgement,
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

[ADR 0001](../../docs/decisions/0001-uuid-primary-keys.md) enumerates seven UUID entities and
`media` is not among them — it predates both this story and the project-wide policy above. That
makes this a **conscious extension of ADR 0001's scope**, so Phase 6 must amend that ADR (or add
a short successor note) rather than leave it silently contradicted — exactly the failure mode
[errors-log.md](../../docs/errors-log.md) records for docs that assert a scope the code has since
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
  [security/livewire-authorization.md](../../docs/security/livewire-authorization.md). Do not add
  a `GET /media` route or a sidebar entry in this story.
- The component is a thin shell over the actions, so a future Products/Blog embed calls the same
  action rather than reaching into the component.

### D11 — Scope of the `media.*` permissions in this story

The user confirmed the media gallery gets its **own** permission namespace rather than inheriting
`products.*`. This story exercises only `media.view` (browse/search) and `media.create` (upload).
`media.edit` (inline title/description editing — story 0020) and `media.delete` are seeded but
unused here; that is the normal state for this catalog, which is seeded ahead of its consumers by
design ([authorization.md](../../docs/architecture/authorization.md#permission-catalog)).

**There is no delete capability this phase — confirmed.** No story implements media deletion, and
none should be added to Epic 2 without a further decision, because the referential question (what
happens to a product or post pointing at a deleted image) cannot be settled before those tables
exist. This is also why the `media` table carries no `deleted_at`
(see [risk 8](#dependencies-risks--open-technical-questions)).

---

## The cross-epic seeder amendment (38 → 42)

`database/seeders/RolePermissionSeeder.php` is owned by already-closed story
[0002](../../ai-spec/tasks/done/0002-seed-roles-permissions-catalog.md). This story reopens it for
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
([schema.md](../../docs/database/schema.md#roles-permissions-model_has_roles-model_has_permissions)).

### Exact test updates this forces (verified line numbers, not guessed)

`tests/Feature/Seeders/RolePermissionSeederTest.php`:

| Line | Current | Change to |
|---|---|---|
| 32 | test name `'seeding creates exactly 38 permissions'` | `'seeding creates exactly 42 permissions'` |
| 35 | `expect(Permission::count())->toBe(38)` | `42` |
| 44–47 | inline module dataset `'users', 'products', … 'store-languages'` | append `'media'` |
| 76 | `expect($granted)->toHaveCount(37)` | `41` |
| 116 | `->and($administrator->fresh()->permissions)->toHaveCount(37)` | `41` |
| 152 | `expect($registrar->getPermissions())->toHaveCount(38)` | `42` |
| 332 | `->and(Permission::count())->toBe(38)` | `42` |
| 374 | `->and(Permission::count())->toBe(38)` | `42` |
| 472 | `->and(Permission::count())->toBe(38)` | `42` |
| 560 | `->and(Permission::count())->toBe(38)` | `42` |

`tests/Feature/Seeders/DatabaseSeederTest.php`:

| Line | Current | Change to |
|---|---|---|
| 41 | `->and(Permission::count())->toBe(38)` | `42` |
| 73 | `->and(Permission::count())->toBe(38)` | `42` |

**Keep the counts hardcoded.** Deriving them from `RolePermissionSeeder::MODULES` etc. was
considered and **rejected**: the assertion would then be `count(constants) === count(constants)`,
which passes no matter what the seeder writes to the database, silently deleting the coverage
these tests exist to provide. A literal `42` that must be edited deliberately is the point — it is
the tripwire that makes a catalog change a conscious act. The inline module dataset at lines 44–47
is the one exception worth keeping literal for the same reason.

---

## Files to create/modify

### Create

- `database/migrations/<ts>_create_media_table.php` — the `media` table (see schema below).
  Naming per [migrations.md](../../docs/database/migrations.md#file-naming); `down()` is
  `Schema::dropIfExists('media')`.
- `app/Models/Media.php` — `#[Table('media')]` (**V8**), `#[Fillable(['title','description'])]`,
  `use HasFactory, HasUuids;`, `@property string $id`, no `$keyType`/`$incrementing`
  ([base-standards](../../docs/conventions/base-standards.md#uuid-primary-keys)). The three path
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
  ([directory structure](../../docs/conventions/base-standards.md#directory-structure)). Invokable;
  stores the original on the `public` disk, delegates conversion, inserts the row, cleans up on
  failure (D6).
- `app/Actions/Media/GenerateImageConversions.php` — invokable; the **only** class that imports
  the imaging library. Returns the two written paths, throws on failure (never returns a partial
  result). Split from the store action so it is unit-testable without a database row and
  reusable by a future "re-encode the library" command.
- `app/Concerns/MediaValidationRules.php` — `<Noun>ValidationRules` trait with `<noun>Rules()`
  methods per [naming.md](../../docs/conventions/naming.md#traits-and-their-methods):
  `imageUploadRules()` and `mediaDetailsRules()`. Holds the `MAX_UPLOAD_KB` / `MAX_DIMENSION`
  constants (D5). Flat and single-concern — it must not `use` another trait.
- `app/Livewire/Media/Gallery.php` + `resources/views/livewire/media/gallery.blade.php` —
  component class per D10, with a **placeholder** view. Note the view path follows the *normal*
  mirror rule (`Media\Gallery` → `livewire/media/gallery.blade.php`); the `Index`-in-a-subfolder
  exception does **not** apply because the class is not named `Index`.
- `lang/en/media.php` + `lang/es/media.php` — key-for-key identical, snake_case leaves, grouped
  (`media.upload.*`, `media.validation.*`, `media.gallery.*`). Every user-facing string here is
  new, so both files are created in the same change.
- `config/image.php` — published by the adapter, edited to pin the Imagick driver (D2).
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
  [ci-workflow-hardening.md](../../docs/security/ci-workflow-hardening.md).
- **Docs (Phase 6, `docs-keeper`)** — the amendment touches four documents that state the old
  numbers verbatim: `docs/architecture/authorization.md` (the "38-permission catalog" claim, the
  9-modules-×-4 arithmetic, and the module table needs a `media` row),
  `docs/database/schema.md` (the seeded-rows table: `permissions` 38 → 42, `role_has_permissions`
  37 → 41, plus a new `media` table section and an ER-diagram entity),
  `docs/conventions/naming.md` (the quoted `MODULES` constant), and
  `docs/decisions/0001-uuid-primary-keys.md` (D9's scope extension). Plus `docs/README.md`'s index.

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
reasoning [schema.md](../../docs/database/schema.md#users) records for `pending_email`).
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
- [ ] Unit: generating conversions from a real fixture image writes exactly two files.
- [ ] Unit: the generated `.webp` file is genuinely WebP — assert on the **file signature**
      (`RIFF`…`WEBP` bytes) rather than the extension, so an encoder silently emitting the wrong
      format fails the test.
- [ ] Unit: the generated `.avif` file is genuinely AVIF — assert the ISO-BMFF `ftyp` brand
      (`avif`) in the header bytes. Same reasoning.
- [ ] Unit: the original file is left byte-identical (nothing re-encodes it in place).
- [ ] Unit: a failure during encoding throws and leaves no partially-written variant behind.

**Feature — `tests/Feature/Media/UploadTest.php`**
- [ ] Integration: a valid upload by a `media.create` holder creates one `media` row **and** three
      files on the faked disk, with all three column paths pointing at files that exist.
- [ ] Integration: the created row carries the submitted title and description, and correct
      `width`/`height`/`size_bytes`.
- [ ] Integration: `uploaded_by` is the acting user's id.
- [ ] Negative: a `.txt` (or a `.txt` renamed to `.png` — the interesting case, since only content
      sniffing catches it) is rejected with a validation error; **zero** rows and **zero** files.
- [ ] Negative: an image of 8193 KB is rejected; an image of 8191 KB is accepted (the boundary,
      tested from both sides — a one-sided limit test passes against a limit of zero).
- [ ] Negative: an image exceeding the pixel ceiling is rejected.
- [ ] Negative: an upload whose conversion throws leaves no row and no orphaned original on disk
      (D6) — drive it by faking a failing conversion action, not by crafting a corrupt file.
- [ ] Authorization: a user holding `media.view` but not `media.create` is refused the upload
      (403), asserted through `Livewire::test()` **and** with the row count unchanged.
- [ ] Authorization: a user holding no media permission cannot mount the component.
- [ ] Authorization: a `Super Admin` holding zero explicit permission rows passes both, via the
      `Gate::before` bypass.

**Feature — `tests/Feature/Media/SearchTest.php`**
- [ ] Integration: a term appearing in a title returns that row.
- [ ] Integration: a term appearing only in a description returns that row.
- [ ] Integration: a partial/substring term matches (this is the assertion `FULLTEXT` would break).
- [ ] Integration: matching is case-insensitive.
- [ ] Integration: a term matching nothing returns an empty collection.
- [ ] Negative: a search term containing `%` or `_` is treated as a literal, not a wildcard (D7) —
      seed two rows where the unescaped query would over-match, so the test can actually fail.
- [ ] Integration: an empty search term returns the full library rather than nothing.

**Feature — `tests/Feature/Policies/MediaPolicyTest.php`**
- [ ] Unit/Feature: each ability returns true only for a holder of its permission.
- [ ] Feature: a `Super Admin` passes every ability while holding zero permission rows (mirrors
      the existing `UserPolicyTest` case).

**Seeder regression (the cross-epic half)**
- [ ] Update all 12 hardcoded assertions/name/dataset entries listed
      [above](#exact-test-updates-this-forces-verified-line-numbers-not-guessed).
- [ ] Feature: the catalog contains `media.view`, `media.create`, `media.edit`, `media.delete`
      (covered automatically once `'media'` joins the dataset at lines 44–47).
- [ ] Feature: re-seeding an environment already carrying the 38-permission catalog yields 42 and
      creates no duplicates — this is the *upgrade* path, and no existing test covers it.
- [ ] **Full suite** must be green before Phase 7 per the
      [Full Test Suite Gate Rule](../../docs/contracts.md).

**Deliberately not tested** (per [what-not-to-test.md](../../docs/testing/qa/what-not-to-test.md)):
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

- [ ] **(PRD §2.3 AC 4)** Every uploaded image keeps its original `.png`/`.jpg`/`.jpeg` and
      additionally generates `.webp` and `.avif` variants; all are stored locally under
      `storage/app/public`.
- [ ] **(PRD §2.3 AC 5)** Invalid uploads — non-image, over the size limit — are rejected with an
      explanatory message and create no record and no file.
- [ ] The `media` table exists with a UUIDv7 primary key and the columns above; `title`,
      `description` and the three path columns are populated on every successful upload.
- [ ] A title/description search surface exists and is callable by story 0020, matching partial
      terms case-insensitively on both fields and returning an empty result for a non-match.
- [ ] Conversions run synchronously; a successful upload leaves nothing pending.
- [ ] Upload and search are authorized against `media.create` / `media.view`, enforced inside the
      Livewire component (not only at a route), with `Gate::authorize()` as the first statement of
      every mutating method.
- [ ] `RolePermissionSeeder::MODULES` contains `media`; seeding produces exactly 42 permissions
      and grants `Administrator` 41 of them; re-seeding an existing environment adds the four new
      rows idempotently.
- [ ] Every existing test that hardcoded 38/37 has been updated, and the full suite is green.
- [ ] CI installs Imagick, so the conversion tests actually execute on all three PHP versions.
- [ ] No new user-facing string is hardcoded; `lang/en/media.php` and `lang/es/media.php` are
      key-for-key identical.

## Definition of Done

- [ ] Tests written and green (full suite, isolated run — [contracts.md](../../docs/contracts.md))
- [ ] Code reviewed (code-reviewer)
- [ ] No security findings (appsec-auditor)
- [ ] Documentation updated (docs-keeper) — including the four documents that state the old
      permission counts and ADR 0001's entity list
- [ ] Acceptance criteria met

---

## Technical tasks

Ordered; step 1 is a **prerequisite that gates the start of Phase 3**, the rest is the normal TDD
sequence (tests first, per [workflow.md](../../docs/workflow.md) Phase 3).

1. **Verify the Imagick/AVIF prerequisite before any code is written.** Confirm PHP Imagick is
   installed *and reports AVIF in `queryFormats()`* in (a) the local/Sail environment and (b) CI.
   Sail already installs `php8.5-imagick` (**V3**); CI does not (**V4**). Where it is missing,
   adding it to `docker/8.5/Dockerfile` and/or `.github/workflows/tests.yml` (`extensions: imagick`
   on the SHA-pinned `setup-php` step, above the Flux-credentials step) is a **prerequisite task
   inside this story**, not a blocker on the story itself.
2. `composer require intervention/image-laravel`; publish and edit `config/image.php` to pin the
   Imagick driver (D1, D2). Record the resolved constraint in `composer.json`.
3. Add `"@php artisan storage:link"` to `composer.json`'s `setup` script (**V9**).
4. Amend `RolePermissionSeeder::MODULES` with `'media'` + its docblock, and apply the 12 test edits
   in [the table above](#exact-test-updates-this-forces-verified-line-numbers-not-guessed).
5. `backend-qa` writes the failing tests from [Tests to perform](#tests-to-perform) (red).
6. Migration → `Media` model → `MediaFactory` → `MediaPolicy` (green, in that order — each is a
   dependency of the next).
7. `MediaValidationRules` trait, then `GenerateImageConversions`, then `StoreUploadedImage`.
8. `App\Livewire\Media\Gallery` + placeholder view; `lang/en/media.php` and `lang/es/media.php`.
9. Quality gates in order per [base-standards](../../docs/conventions/base-standards.md#quality-gates):
   filtered tests → `vendor/bin/pint --dirty --format agent` → Larastan level 7 → full suite.

---

## Dependencies, risks & open technical questions

**Dependencies**
- [0002 — seed roles & permissions catalog](../../ai-spec/tasks/done/0002-seed-roles-permissions-catalog.md)
  (**done**) — this story amends the file that story created and owns.
- Story **0020** (media gallery modal UI, frontend) **depends on this one** and must be numbered
  and sequenced after it, per workflow.md's
  [task ordering rule](../../docs/workflow.md#task-ordering-rule).
**Risks**

1. **Cross-epic seeder amendment (highest).** Twelve assertions across two already-green test
   files change in this story. The risk is not the edit — it is *missing one*, which surfaces as a
   confusing failure in a file this story never mentions. Mitigated by the verified line-number
   table above; re-verify with `grep -rn "toBe(38)\|toHaveCount(37)" tests/` before Phase 5 rather
   than trusting the table after other work lands.
2. **The dependency is `intervention/image-laravel` (V1, D1 — confirmed).** The residual risk is
   only which *constraint* resolves against PHP 8.5 / Laravel 13; that is settled by running
   `composer require` at technical-task step 2, not asserted here. If the adapter turns out not to
   support Laravel 13, the fallback (plain `intervention/image ^3` + `ImageManager` injection) is
   a one-file change by design — but it must be raised and *decided*, never silently substituted.
3. **Imagick with AVIF support must be verified installed before Phase 3 starts (V2, V4).**
   AVIF is unavailable on GD here, so any environment without Imagick cannot satisfy AC 4 at all.
   Verify it in **both** the local/Sail environment and CI: Sail installs `php8.5-imagick`
   (**V3**) but the CI `setup-php` step does not (**V4**), and neither check has been run against
   a *built* image. Where it is missing, **adding it to the Dockerfile / CI workflow is a
   prerequisite task within this story (technical-task step 1) — it does not block writing or
   validating this story.** A developer running PHP outside Sail will hit a hard failure, which is
   the correct behaviour (D2's "fail loudly"), but the README/docs must say so.
4. **Synchronous conversion is a request-duration and memory cost (D4).** Bounded by the 8 MB /
   8000 px caps, but a slow upload is a real UX characteristic story 0020 must design a loading
   state for. Revisit if bulk upload lands.
5. **Decompression bombs.** A small file can decode to hundreds of megabytes. The dimension rule
   is the app-level guard; `appsec-auditor` should additionally consider Imagick resource limits
   (`Imagick::setResourceLimit`) in Phase 4 — flagged here rather than pre-decided.
6. **`storage:link` is missing from the setup script (V9).** Until fixed, a fresh clone stores
   files correctly and serves them 404. Cheap to fix, easy to forget, invisible in tests.
7. **ADR 0001 goes stale on merge (D9).** `media` becomes an eighth UUID entity while the ADR
   names seven. This is precisely the "a doc's claim outlived the code" failure already recorded in
   [errors-log.md](../../docs/errors-log.md); Phase 6 must close it in the same pass.
8. **Media deletion is deliberately unimplemented (D11 — confirmed).** `media.delete` is seeded
   but nothing in Epic 2 uses it, and the referential question (a product/post pointing at a
   deleted image) cannot be settled before Epic 2's product tables exist. Decided and recorded,
   not guessed — the risk is only that a later story adds deletion without revisiting it.

**Open technical questions — none blocking**

All four questions this story originally raised were resolved by the coordinator and are now
recorded as confirmed decisions: the imaging package (D1), the Imagick driver (D2), modal-only
scope with no delete capability (D10, D11), and the UUIDv7 primary key (D9). Two non-blocking
items remain, neither of which gates Phase 2 or Phase 3:

1. **The 8 MB / 8000 px upload caps stand as `product-owner`'s recommended default** (D5), derived
   from platform limits (**V6**) rather than from a known asset inventory. Explicitly left open
   for adjustment: if the catalog's real product photography routinely exceeds 8 MB, the two
   constants on `MediaValidationRules` move and nothing else changes.
2. **CI cost of `extensions: imagick`.** It adds install time on every run of a 3-version matrix.
   Accepted as the price of actually executing AC 4 (D3), but worth a nod from whoever owns
   pipeline duration.
