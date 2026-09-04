# Base Standards

Baseline stack versions and project-structure standards for this Laravel + Livewire application. This is the "what shape does new code take" reference; for line-level style (types, braces, PHPDoc) see [code-style.md](code-style.md), and for identifier naming see [naming.md](naming.md).

## Table of Contents

- [Stack versions](#stack-versions)
- [Directory structure](#directory-structure)
  - [Controllers sit in front of actions, not instead of them](#controllers-sit-in-front-of-actions-not-instead-of-them)
  - [An authorization rule belongs to the action, not to one of its callers](#an-authorization-rule-belongs-to-the-action-not-to-one-of-its-callers)
  - [An app-owned config file is a registry, and must survive `config:cache`](#an-app-owned-config-file-is-a-registry-and-must-survive-configcache)
- [Model conventions](#model-conventions)
  - [Deleting a user goes through the model, not the query builder](#deleting-a-user-goes-through-the-model-not-the-query-builder)
  - [UUID primary keys](#uuid-primary-keys)
- [Livewire component convention: class-based, not single-file](#livewire-component-convention-class-based-not-single-file)
- [A `wire:ignore`d client-owned region — the app's first instance](#a-wireignored-client-owned-region--the-apps-first-instance)
- [Flux Free's `ui-dropdown` requires a real `<button>` trigger descendant](#flux-frees-ui-dropdown-requires-a-real-button-trigger-descendant--confirmed-twice-not-a-one-off)
- [Artisan-first workflow](#artisan-first-workflow)
- [Quality gates](#quality-gates)
  - [Steps 1 and 2 are the *iteration* forms](#steps-1-and-2-are-the-iteration-forms-run-both-unscoped-before-declaring-the-work-done)

## Stack versions

From [`composer.json`](../../composer.json):

| Package | Constraint |
| --- | --- |
| `php` | `^8.3` |
| `laravel/framework` | `^13.17` |
| `laravel/fortify` | `^1.37.2` |
| `livewire/livewire` | `^4.1` |
| `livewire/flux` | `^2.13.1` |
| `spatie/laravel-permission` | `^8.3` |
| `pestphp/pest` (dev) | `^4.7` |
| `pestphp/pest-plugin-browser` (dev) | `^4.3` |
| `larastan/larastan` (dev) | `^3.9` |
| `laravel/pint` (dev) | `^1.27` |

Frontend: Tailwind CSS v4 + Vite (see [`vite.config.js`](../../vite.config.js), [`package.json`](../../package.json)). `pest-plugin-browser` drives real-browser tests through Playwright (`playwright` `^1.61.1` in `package.json` `devDependencies`); the wired-up `tests/Browser/` suite, its one-time browser-binary setup, and what CI does and does not cover live in [../testing/frontend/playwright-setup.md](../testing/frontend/playwright-setup.md). Story 0021 makes [`resources/js/app.js`](../../resources/js/app.js) the app's **first real JS module** — a hand-rolled `contenteditable`/`document.execCommand` Alpine component for the WYSIWYG editor, registered on `alpine:init` — with **no new npm dependency**: Alpine already ships bundled inside Livewire 4's own build (`window.Alpine`), and no rich-text library (TipTap/Quill/Trix) was added, a deliberate decision recorded in the story's own D1.

## Directory structure

Real top-level layout — stick to it; don't create new base folders without approval (per project `CLAUDE.md`):

```
app/
  Actions/NormalizeForSearch.php  The one class directly under Actions/, no subfolder (story 0022) —
                       a shared search-term normalizer belonging to no single domain; the "or
                       directly under app/Actions/ if it belongs to none" branch of the rule below,
                       with its first real occupant
  Actions/Auth/        Cross-cutting auth-state actions (EnsureRecentPasswordConfirmation — the
                       step-up freshness guard; LogRefusedPrivilegedAttempt — the refusal audit
                       line; not an area, and not Fortify's)
  Actions/Fortify/    Fortify contract implementations (CreatesNewUsers, ResetsUserPasswords)
  Actions/Media/       Domain actions for the Media Library area (StoreUploadedImage — the atomic
                       upload/convert/insert; GenerateImageConversions — the only class in the app
                       that imports the imaging library; UpdateMediaDetails — the inline
                       title/description write, and MediaPolicy::update()'s first caller)
  Actions/ProductCategories/ Domain actions for the Product Categories area (CreateProductCategory,
                       RenameProductCategory, DeleteProductCategory) — one action per operation
                       (story 0023). Unlike every other area's actions, none of the three authorize
                       their own operation; that is a deliberate, recorded hand-off to the not-yet-
                       built UI story (0025), not an oversight — see ProductCategoryPolicy below
  Actions/Products/    Domain actions for the Products area (CreateProduct, UpdateProduct,
                       DeleteProduct — each self-authorizes, unlike ProductCategories/ above;
                       SyncProductGallery — the single writer of featured_media_id and every
                       product_media row, which deliberately authorizes NOTHING because it is a
                       collaborator invoked only by the two actions that already authorized the
                       whole operation, never an independently-reachable entry point (story 0024);
                       SanitizeProductDescription — the only class in the app that imports
                       symfony/html-sanitizer, mirroring how GenerateImageConversions confines the
                       imaging library to one class; constructor-injected into CreateProduct/
                       UpdateProduct as their third collaborator, sanitizing `description` before
                       validation (story 0024a); SyncProductSalesRegions — the single writer of the
                       product_sales_region pivot, authorizing NOTHING for the identical structural
                       reason SyncProductGallery does; ResolveProductTaxRate + ResolvedTaxRate — the
                       two-tier tax-rate resolver and its answer value object; SearchSalesRegions —
                       story 0022's MultiSelectOptionsResolver implementation for the region picker
                       (story 0026)
  Actions/Roles/       Domain actions for the Roles area (EnforceAdministratorPermissionGrant,
                       EnforceGrantorPermissionScope — both pure transformers over a save payload)
  Actions/SalesRegions/ Domain actions for the Sales Regions area (UpdateSalesRegion,
                       SetDefaultSalesRegion, SetSalesRegionActive — each the single named writer
                       of the columns it owns; all three authorize their own operation)
  Actions/Users/       Domain actions for the Users area (RequestEmailChange, ConfirmEmailChange,
                       CreateUser, UpdateUser — the last two authorize their own operation)
  Concerns/            Shared traits (validation rule sets)
  Console/Commands/    Artisan commands
  Enums/               Backed enums for domain value sets (UserStatus, RoleName, SalesRegionKind,
                       ProductType, ProductStatus — exactly two persisted cases — and
                       ProductDisplayStatus, a badge-only third enum never persisted, never
                       validated and carrying no column or cast of its own)
  Exceptions/          Domain exceptions that render their own response (ImmutableRoleException → 403,
                       RoleInUseException → 409, PasswordConfirmationRequiredException → 423) —
                       plus, since story 0022, one that deliberately does NOT: UnresolvedSelectionException
                       carries no render() at all, because it must never reach the HTTP layer as a
                       status code (see below)
  Http/Controllers/    Abstract base + domain controllers used as HTTP boundaries in front of actions
  Listeners/           Event listeners (ActivateVerifiedUser), registered in AppServiceProvider
  Livewire/            Livewire components, grouped by area (Users/, Roles/, SalesRegions/,
                       Media/, ProductCategories/, Products/, Components/, Settings/,
                       Settings/TwoFactor/, Actions/). Dev/ (story 0020, the media-gallery-harness
                       scaffolding) was RETIRED by story 0027 once Products/Editor supplied a real
                       host page — see below. Components/ (story 0021, extended by 0022) is not a module area
                       like the others — it holds reusable, content-agnostic components a screen
                       embeds rather than one screen's own logic (WysiwygEditor, SearchableMultiSelect)
                       plus the one supporting interface a consumer implements
                       (MultiSelectOptionsResolver) rather than a component itself; see the
                       wire:ignore section below
  Models/              Eloquent models (User, SalesRegion, Media, ProductCategory, Product; Role,
                       which subclasses the package's role model). product_media, the gallery
                       pivot, has no model class of its own — reached only through
                       Product::gallery()'s BelongsToMany, the same shape the vendored permission
                       pivots use
  Notifications/       Notification classes (PendingEmailVerification, UserInvitation)
  Policies/            Eloquent model policies (UserPolicy, RolePolicy, SalesRegionPolicy,
                       MediaPolicy, ProductCategoryPolicy, ProductPolicy), auto-discovered by name
  Providers/           Service providers (AppServiceProvider, FortifyServiceProvider)
config/                Laravel + package config (fortify.php, permission.php,
                        intervention-image.php, livewire.php, ...), plus modules.php — the one
                        app-owned config file (see below)
database/
  data/                 Bundled, version-controlled fixture data a seeder reads — not seeder
                        classes (iso-3166-countries.json, plus its own README stating provenance)
  factories/
  migrations/
  seeders/
lang/                   Published translation files, one folder per locale (en/, es/), plus
                        app-owned domain files kept key-for-key identical across both
                        (users.php, roles.php, navigation.php, sales-regions.php, media.php,
                        components.php, products.php — the latter's categories.index subgroup is
                        story 0025's copy for the product categories screen)
resources/
  views/
    components/        Blade components — all anonymous (no app/View/Components/ in this repo)
    layouts/            Auth/app layout shells
    livewire/           Views for Livewire components AND plain auth Blade views (see naming.md)
    partials/
routes/                 web.php, plus one file per functional area that web.php requires
                        (settings.php, roles.php, users.php, sales-regions.php,
                        product-categories.php, products.php) — no api.php yet.
                        web.php no longer holds the story 0020/0021 environment-gated dev route
                        (story 0020's browser-test harness) — story 0027 retired it once
                        Products/Editor supplied a real host page; see ../api/routes.md
tests/
  Feature/              Feature tests, mirrors app structure (Actions/Auth/, Auth/, Settings/,
                        Seeders/, Users/, Roles/, SalesRegions/, Media/, ProductCategories/,
                        Products/, Components/, Models/, Policies/, Authorization/,
                        Navigation/, ...). Dev/ (story 0020's MediaGalleryHarnessRouteTest.php) was
                        deleted by story 0027 along with its subject
  Unit/                 Mirrors app structure too (Actions/ itself — NormalizeForSearchTest.php,
                        story 0022, sits directly here with no subfolder, matching the app class it
                        tests — plus Actions/Auth/, Actions/Media/, Concerns/ (story 0023's
                        ProductCategoryValidationRulesTest.php, the first trait-level unit test in
                        this folder, joined by story 0024's ProductValidationRulesTest.php),
                        Enums/ (ProductStatusTest.php / ProductTypeTest.php since story 0024),
                        Exceptions/, Listeners/, Models/), plus ArchitectureTest.php
  Support/              Test-only support code, not app code (story 0022, the suite's first use of
                        this base folder) — today just Livewire/ArrayMultiSelectOptionsResolver.php,
                        a conforming MultiSelectOptionsResolver double three later stories (0026,
                        0027, 0034) pattern-match their real resolvers against; autoloaded via
                        composer.json's existing "Tests\\": "tests/" mapping, no new autoload entry
  Browser/              Pest browser tests. Mirrors app structure (Auth/, Media/, Components/,
                        Products/ since story 0027) — but four of the eleven files sit flat instead
                        (UsersIndexTest.php, RolesIndexTest.php, SalesRegionsIndexTest.php,
                        ProductCategoriesIndexTest.php; the previous "three of eight" count here
                        missed ProductCategoriesIndexTest.php entirely, a gap present since story
                        0025 and corrected by story 0027's own pass); see
                        ../testing/frontend/playwright-setup.md#folder-structure
  Browser/Fixtures/     Real, checked-in binary fixtures a browser test needs as bytes on disk
                        (sample-upload.jpg) — never generated at runtime
  Pest.php, TestCase.php
```

`app/Enums/`, `app/Exceptions/`, `app/Listeners/`, `app/Notifications/`, `app/Policies/` and `lang/` are all **stock Laravel locations** (`make:enum`, `make:exception`, `make:listener`, `make:notification`, `make:policy`, `lang:publish`), not new base folders — creating one of them needs no approval; inventing a folder Laravel doesn't ship does.

`app/Policies/` in particular is **registration-free**: Laravel 13 auto-discovers `App\Policies\<Model>Policy` for `App\Models\<Model>`, so `UserPolicy` binds to `User` by naming alone. This repo has no `AuthServiceProvider` and does not need one — do not add one to register a conventionally-named policy. What each ability means lives in [architecture/authorization.md](../architecture/authorization.md#policies), not here.

`database/data/` is the one folder here that Laravel does **not** ship, so it needed the approval `CLAUDE.md` requires — it exists because [PRD §2.4](../PRD/PRD.md) mandates that the country list ship as a bundled fixture in this repository rather than as a Composer dependency (`league/iso3166`, `symfony/intl`). It holds **data a seeder reads**, never a seeder class and never generated output: today one JSON file plus [`database/data/README.md`](../../database/data/README.md), which states the fixture's provenance, its shape, what is deliberately excluded from it, and how to refresh it. A new file lands here only under the same test — bundled, reviewable in a diff, and read by something in `database/seeders/`.

**`app/Livewire/Dev/` (story 0020) was retired by story 0027, and this paragraph now records the retirement rather than the folder it used to describe.** It held `MediaGalleryHarness`, a throwaway host page whose only purpose was to give `App\Livewire\Media\Gallery` and (since story 0021) `App\Livewire\Components\WysiwygEditor` — both modal/embedded components with no route of their own — a URL a browser test could `visit()`. The four rules that separated that scaffolding from surface (a *registration*-time environment gate rather than middleware; `auth`+`verified` kept anyway as defence in depth; a test asserting absence from the route *collection*, not a 404; a named deletion trigger in every file it occupied) are recorded in this project's history rather than repeated here, since there is no longer a live instance to point them at. Story 0027's `App\Livewire\Products\Editor` — a real, routed page (`products.create`/`products.edit`) — turned out to be a strict superset of the harness (it embeds two `Gallery` instances and one `WysiwygEditor`, exactly the shape the harness mounted for its own tests), so both harness browser test files were re-pointed at it and made green **before** `App\Livewire\Dev\MediaGalleryHarness`, its view, its `routes/web.php` registration block and `tests/Feature/Dev/MediaGalleryHarnessRouteTest.php` were all deleted. **The scaffolding's own text said "if 0027 has shipped and this section still exists, it was not removed" — it does not, and it was.** See [api/routes.md](../api/routes.md#productsindex-productscreate-and-productsedit--the-fifth-permission-gated-route-family) for the migration itself.

`routes/` follows the same one-per-area shape: `web.php` declares only the app-wide routes (`home`, `dashboard`) and then `require`s one file per functional area — `settings.php`, `roles.php`, and `users.php` since task 0040, which moved `users.index` out of `web.php` so it stops being the one route that didn't follow the pattern, plus `sales-regions.php` since task 0017, `product-categories.php` since story 0025 and `products.php` since story 0027 (the first area file to register **two** routes, `products.create`/`products.edit`, onto one component). A new area's routes go in a new `routes/<area>.php` with its own middleware group, appended as another `require` line rather than inlined into `web.php`; what each route contract actually is belongs to [api/routes.md](../api/routes.md).

Task 0017 is the first area file written *from* this convention rather than into it, and it is worth reading as the copyable case: [`routes/sales-regions.php`](../../routes/sales-regions.php) is [`routes/roles.php`](../../routes/roles.php) with three strings changed, `web.php`'s entire diff is one `require` line, and and the `Index` class is imported **aliased** (`use App\Livewire\SalesRegions\Index as SalesRegionsIndex;`), matching what both existing area files already do: each file's own `use` statements can't actually collide, but `Index::class` read on its own line says nothing about which of the three areas it belongs to, and these files are read one at a time.

`app/Actions/` groups by concern, one subfolder per area: `Fortify/` holds the framework-contract implementations, `Users/`, `Roles/` and `SalesRegions/` the app's own domain actions for those areas. A new action goes in the subfolder for its domain (or directly under `app/Actions/` if it belongs to none) — never nested under an unrelated one. `Roles/` (task 0009) is the pattern to copy when a new module needs its first action: create the subfolder for the domain, even for a single class, rather than parking it in the nearest existing one. `SalesRegions/` (task 0017) is that rule applied unremarkably to a third module, which is the point — three classes, one folder, no discussion needed. `Media/` (story 0019, extended by 0020) is the fourth: three classes, one folder, and the split between them chosen for a reason worth copying rather than for tidiness — `GenerateImageConversions` is the **only** class in the application that imports the imaging library, so every other class is unaware of which package provides it, and a future "re-encode the whole library" Artisan command reuses it without touching `StoreUploadedImage`'s transaction, cleanup and row-insert logic. Story 0020's `UpdateMediaDetails` is the folder's third and the plainest possible instance of the rule below it: a two-column write that could have lived in the Livewire component, given its own class so that a non-Livewire caller inherits the same `Gate` check and the same `mediaDetailsRules()` validation.

`ProductCategories/` (story 0023) is the fifth: three classes, one folder, following `SalesRegions/`'s unremarkable shape exactly. **Corrected 2026-09-03 (story 0025) — the paragraph below described a deliberate, temporary gap that this story closed; it is quoted in full rather than silently rewritten, per this project's audit-authored-page convention.** It used to read: *"with one deliberate difference worth reading against the other four. Every action in `Users/`, `Roles/`, `SalesRegions/` and `Media/` authorizes its own operation (task 0008a's convention below); **none of `CreateProductCategory`, `RenameProductCategory` or `DeleteProductCategory` do**, because this story ships no caller at all — no route, no Livewire component — so there is nothing yet to authorize *against*. `App\Policies\ProductCategoryPolicy` is created and fully tested regardless (per [security/livewire-authorization.md](../security/livewire-authorization.md)'s "a rule enforced only in a component is bypassed by every other caller" reasoning), and the Definition of Done records the gap as an explicit hand-off: the not-yet-built UI story (0025) must call `Gate::authorize()` before invoking each action, the same way `App\Livewire\Users\Index` already does for `CreateUser`/`UpdateUser`."* Story 0025 is that hand-off, discharged: `CreateProductCategory`, `RenameProductCategory` and `DeleteProductCategory` now each authorize their own operation as their own first statement — `Users/`, `Roles/`, `SalesRegions/`, `Media/` and `ProductCategories/` all follow the same convention today, with `Products/` below the only folder whose fourth class (`SyncProductGallery`) is a documented exception rather than a gap. `App\Livewire\ProductCategories\Index` is `ProductCategoryPolicy`'s first and only call site, and it re-checks the same abilities in its own mutating/disclosing methods (`openCreateModal`, `openEditModal`, `save`, `confirmDelete`, `deleteProductCategory`) as defence in depth on top of the actions' own gates, matching the shape every other module screen on this page already uses.

`Products/` (story 0024) is the sixth, and it is **not** a repeat of `ProductCategories/`'s gap — it is a narrower, different shape worth distinguishing from it explicitly. `CreateProduct`, `UpdateProduct` and `DeleteProduct` **do** each authorize their own operation, exactly like `Users/`/`Roles/`/`SalesRegions/`/`Media/`. The fourth class in the folder, `SyncProductGallery`, is the one that authorizes nothing — but it is not `ProductCategories/`'s "nobody has built the caller yet" gap: it has real callers today (`CreateProduct`/`UpdateProduct`, inside the same transaction), and it authorizes nothing *because* both of them have already authorized the whole operation before calling it. A collaborator invoked only by an already-authorized action does not need its own gate — the reflexive `update` check on `SyncProductGallery`'s own target would in fact be **wrong**: `CreateProduct` inserts a row and calls it inside the same transaction, so `update` would be asked of an actor who legitimately holds only `products.create`, refusing a correct create halfway through. This is this codebase's **third** shipped instance of that exact pattern, not a bespoke exception — `App\Actions\Media\GenerateImageConversions` (constructor-injected into `StoreUploadedImage`, which authorizes `create`) and `App\Actions\Roles\EnforceGrantorPermissionScope` (a payload transformer called from `Roles\Index::saveRole()`, which authorizes first) are the two prior ones. What makes the omission structural rather than an oversight: the class's own docblock states it, its two callers are its only callers, and `tests/Feature/Products/ProductAuthorizationTest.php` asserts that no other class under `app/` references it — if a later story ever calls `SyncProductGallery` directly, that story owns adding the gate.

**Story 0026's `SyncProductSalesRegions` is this codebase's fourth shipped instance of the same pattern** — after `GenerateImageConversions`, `EnforceGrantorPermissionScope` and `SyncProductGallery` — and for the identical structural reason: it is the single writer of the `product_sales_region` pivot, invoked only inside its caller's already-authorized transaction. That caller was not yet built when this paragraph was written; **it is now `App\Livewire\Products\Editor::save()` (story 0027)**, and `tests/Feature/Products/ProductSalesRegionAssignmentTest.php`'s reachability assertion now names `Editor.php` as the one additional allowed file alongside `SyncProductSalesRegions.php` itself. The folder's other two new classes self-authorize nothing for a *different* reason each states in its own docblock, worth distinguishing from the collaborator pattern above: `ResolveProductTaxRate` is a pure read of values already visible to anyone holding `products.view` or `sales-regions.view` and may run from a queued job with no acting user at all, and `SearchSalesRegions` (the search/options resolver behind 0027's region picker) treats the Sales Region catalog data it discloses — name, active state, has-children — as uniformly visible to any authenticated admin reaching it, the identical reasoning `ResolveProductTaxRate` already gives for the same omission.

**Story 0022's [`App\Actions\NormalizeForSearch`](../../app/Actions/NormalizeForSearch.php) is the first real class to exercise the parenthetical half of the rule above** — "or directly under `app/Actions/` if it belongs to none" had named that branch since this convention was first written, with no example until now. It normalizes a search comparison value (trim → lowercase → accent-fold → collapse whitespace) for use by this codebase's shared searchable multi-select component and, per the task file's own consumer contract, by every later Epic 2 resolver that searches text (0026, 0032, 0033, 0034) — a concern that belongs to no single module area, so no subfolder is the correct shape rather than an omission. Its own docblock states the rule the class exists to enforce: no consumer may reimplement lowercasing, accent-stripping, trimming or whitespace collapsing inline — both sides of a search comparison route through this one class.

`Auth/` (task 0015a) is the first subfolder here that is **not** a module area, and it is worth reading as its own precedent. `EnsureRecentPasswordConfirmation` is called from three places in two different areas (`Actions/Users/UpdateUser`, `Actions/Users/CreateUser`, and `Livewire/Users/Index::deleteUser()`) and is expected to be called from more as later screens adopt step-up, so filing it under `Users/` would have made the next caller's import read as a cross-area dependency on a module it has nothing to do with. Note it is also **not** `Fortify/`: that folder is reserved for classes implementing a Fortify contract, and this one implements none — it only *reads* the session key Fortify's own controller writes. **The rule: a subfolder is either a module area or a named cross-cutting concern, and a class serving two areas belongs to the concern, not to whichever area called it first.** Do not add a `Shared/` or `Common/` folder for this — name the concern.

Task 0015b is the folder's second inhabitant and the case that confirms the rule rather than merely following it: `LogRefusedPrivilegedAttempt` is imported by **seven** classes across both module areas (`Livewire/Users/Index`, `Livewire/Roles/Index`, all three `Actions/Users/*` write actions, and both `Actions/Roles/*` transformers). Under an "it goes wherever the first caller lives" rule it would have landed in `Actions/Users/`, and the Roles side would import a Users class to record a Roles refusal. What it does — and the shape it shares with its folder-mate, a throwing wrapper around a non-throwing recorder — is in [architecture/authorization.md](../architecture/authorization.md#recording-a-refusal--what-every-gate-owes-the-audit-trail).

### An app-owned config file is a registry, and must survive `config:cache`

Every other file in `config/` is Laravel's or a package's. [`config/modules.php`](../../config/modules.php) (task 0013) is the first one this app wrote itself, and it establishes when that shape is right: **a config file is for a declarative registry that a later story extends by appending data — never for behavior, and never as a home for a value that has one caller.** The alternative considered and not taken was a PHP class or a service-provider `Gate::define()` loop; config won because appending an entry must not require reading code.

Two hard constraints come with it, both cheap to violate:

- **No closures, ever.** `php artisan config:cache` serialises the merged config with `var_export()`, which cannot represent a `Closure` — one closure anywhere in `config/` makes the command fail and, in a deployment that caches config, takes the whole app down. Every value must be a scalar, array, or `null`. Where a closure is the obvious reach (`'expanded_when' => fn () => request()->routeIs('roles.*')`), store the **data** instead (`'expanded_when' => 'roles.*'`) and let the consumer apply it. `tests/Feature/Navigation/SidebarModuleGatingTest.php` runs `config:cache` as an actual assertion rather than trusting review.
- **Store keys, not copy.** A registry entry holds a translation key (`'label' => 'navigation.items.users'`), resolved with `__()` at render. A literal English string in `config/` is unreachable from `lang/es/` — see [naming.md](naming.md#translation-keys).

✅ Good — the real registry entry, quoted verbatim; every value is a scalar or array, `label` is a translation key rather than copy, and `current_when` is the *pattern* (the consumer applies `request()->routeIs()` to it at render):

```php
// config/modules.php
'roles' => [
    'group' => 'settings',
    'label' => 'navigation.items.roles',
    'icon' => 'shield-check',
    'route' => 'roles.index',
    'current_when' => 'roles.*',
    'permissions' => ['roles.manage'],
],
```

❌ Bad — the same entry written the way it is tempting to (adapted to illustrate; not present in the repo). It breaks `config:cache` outright, and hardcodes English into a file `lang/es/` cannot reach:

```php
// anti-pattern — do not write this in any config/ file
'roles' => [
    'label' => 'Roles & permissions',
    'current_when' => fn () => request()->routeIs('roles.*'),
    'visible' => fn () => auth()->user()?->can('roles.manage'),
],
```

> ✅ **Task 0018 is the first story to extend this file, and it is the evidence for the paragraph above.** The Sales Regions screen's whole navigation change is two array literals appended to `config/modules.php` — a `groups.taxes` group and an `items.sales_regions` entry — plus one leaf per locale in `lang/{en,es}/navigation.php`. **No PHP class changed, and neither did the component that reads the registry**: `resources/views/components/sidebar-nav.blade.php` and `resources/views/layouts/app/sidebar.blade.php` are untouched by the story, verified against the diff. Both constraints above held on first contact — every appended value is a scalar or array (the entry's `expanded_when` is a literal `null`, never a closure over `request()`), and both `heading` and `label` are translation keys rather than copy, so `lang/es/` reaches them. The one thing the story had to *decide* rather than copy is the entry's key: `sales_regions` is this registry's first genuinely multi-word key, and [naming.md](naming.md#translation-keys) owns why it is snake_case on both sides.

> ⚠️ **[`config/html-sanitizer.php`](../../config/html-sanitizer.php) (story 0024a) is the app's second app-owned config file, and it does not fit the "registry a later story extends by appending data" shape this section describes — say so explicitly rather than forcing it in.** `config/modules.php` exists to be *appended to*: every later epic adds its own group/item entry, and the file's whole value is that appending never touches behavior. `config/html-sanitizer.php` is the opposite kind of thing — a **fixed security allow-list**. Its own task file states the rule directly: when Epic 4's blog body needs the identical sanitizer, it must **reuse this configuration exactly, not fork or extend it** with a second allow-list, because two allow-lists for the same trust boundary drift apart silently. There is no "later story adds a row" shape here at all — a later story is a *second consumer* of the whole file, never a *second contributor* to it. Both hard constraints from the paragraph above still hold and were verified rather than assumed: **no closures** — every value in the file is a scalar, string, or array of scalars/strings (`allowed_elements` maps tag names to attribute-name arrays, `dropped_elements`/`allowed_link_schemes`/`allowed_media_schemes` are plain string lists, `default_action` and `max_input_length` are a string and an int) — and **no user-facing copy**, which the file's own top-of-file comment states explicitly does not need the "translation key, not literal copy" half of the rule at all, since this file carries no copy of any kind, translatable or not. `App\Actions\Products\SanitizeProductDescription` is the one class that reads it, matching the "one config file, one reading component" shape `config/modules.php` established.

What this particular registry *means* — the gating rules, the per-entry ability requirement, and how a later epic plugs its module in — belongs to [architecture/authorization.md](../architecture/authorization.md#the-second-half-of-a-module-gate-the-sidebar-registry), not here.

### Controllers sit in front of actions, not instead of them

`App\Http\Controllers\ConfirmEmailChangeController` is this repo's first domain controller, and it exists for a specific reason worth generalizing: **a controller is added only when there is an HTTP-specific concern — route-parameter binding, building a redirect response — that an `app/Actions/` class should not absorb.** The action stays a plain domain operation; the controller adapts HTTP to it.

✅ Good — the real controller: it turns the URL's `{hash}` segment into a verified address, delegates, and branches on the action's `bool` result to pick a redirect:

```php
// app/Http/Controllers/ConfirmEmailChangeController.php
public function __invoke(User $user, string $hash, ConfirmEmailChange $confirmEmailChange): RedirectResponse
{
    if ($user->pending_email === null || ! hash_equals(sha1($user->pending_email), $hash)) {
        return redirect()->route('profile.edit')->with('status', __('users.email_change.refused'));
    }

    if (! $confirmEmailChange($user, $user->pending_email)) {
        return redirect()->route('profile.edit')->with('status', __('users.email_change.refused'));
    }

    return redirect()->route('profile.edit')->with('status', __('users.email_change.confirmed'));
}
```

Note the action is injected as a **trailing container-resolved parameter**, after the route parameters — the same per-method action-injection convention the Livewire components use (see [code-style.md](code-style.md#inject-single-purpose-actions-per-method)).

❌ Bad — routing the action class directly (adapted to illustrate; this is what the controller exists to avoid):

```php
// anti-pattern — do not do this
Route::get('settings/email/confirm/{user}/{hash}', ConfirmEmailChange::class);
```

`ConfirmEmailChange::__invoke(User $user, string $email)` takes the *address*, while the URL's second segment is `{hash}`. Laravel binds non-class-typed parameters positionally against the remaining route parameters, so the hash would land in `$email` and the equality check could never succeed — silently, with no error. On top of that, the action returns `bool`, which cannot be a response.

Corollary: don't invert this either. A controller that re-implements the domain logic instead of delegating to an action puts business rules somewhere the Livewire components and future admin screens can't reuse them.

### An authorization rule belongs to the action, not to one of its callers

Task 0008a established this by removing a real gap: the Administrator-tier guards lived only in `App\Livewire\Users\Index`, so `CreateUser` / `UpdateUser` were **completely ungated** for any other caller — a future API endpoint, Artisan command or queued job would have inherited nothing. The rule: **if an operation must not happen without a permission, the check lives in the class that performs the operation.** A caller may authorize too (defence in depth), but it may not be the only place the rule exists.

> **The converse is not true, and task 0015 is the case that shows it.** A check that guards something the *caller alone* does — a Livewire opener copying a target's attributes into public component state — belongs in the caller, and there is no action to move it to: no `app/Actions/` class performs that disclosure. `App\Livewire\Users\Index::openEditModal()`'s `Gate::authorize('updateSensitiveAttributes', $target)` is such a check, and it is **not** a regression of the rule above. Read it as: the rule follows the *operation*, and "hand these attributes to the client" is an operation the component owns. What still may not reappear in a component is a re-derivation of *who the target is* — the tier lookup 0008a deleted; see [security/livewire-authorization.md](../security/livewire-authorization.md#the-shipped-disclosure-gates-and-why-the-disclosure-check-is-the-stronger-ability).
>
> **Task 0015a adds the second, weaker case, and it is weaker on purpose.** Its step-up guard lives in `UpdateUser` and `CreateUser` — the actions — for role, status, email and Administrator-tier creation, exactly as the rule above demands. For **deletion** it lives in `App\Livewire\Users\Index::deleteUser()`, and only because there is no `DeleteUser` action to move it to: that method calls `$target->delete()` on the model directly. That is an accepted placement pending a class to hold it, not a second exception to the rule — **if a later story extracts a `DeleteUser` action, the guard moves with it.** Record a placement like this in the method's own docblock (as `deleteUser()` does) so the next reader can tell "this is where it belongs" from "this is where it is until something better exists".

✅ Good — the action authorizes as its own first statements, before opening any transaction:

```php
// app/Actions/Users/CreateUser.php
public function __invoke(string $name, string $email, string $roleId, UserStatus $status): User
{
    Gate::authorize('create', User::class);
    // ...
}
```

❌ Bad — the shape this replaced (adapted from the deleted `Index::createNewUser()`; the action itself checked nothing):

```php
// anti-pattern — the rule is a property of one caller, not of the operation
if ((int) $validated['roleId'] === $this->administratorRoleId()) {
    Gate::authorize('promoteToAdministrator', User::class);
}

$createUser(/* ... */);
```

Three constraints that come with it, each learned from this story's audits:

- **Move the rule, never copy it.** Two implementations of one rule is drift waiting to happen; `Index::authorizeRoleChange()` and `administratorRoleId()` were *deleted*, not converted.
- **Derive a security-relevant flag internally; never take it as a parameter.** `UpdateUser` used to receive `bool $applyRoleAndStatus` — the self-lockout guard — from its caller. Once an action is independently callable, that is a one-argument bypass, so the action now derives it from `Auth::user()` itself.
- **Authorize before the first write, and re-read what you authorize against.** Every check sits above the action's `DB::transaction()`, and any relation an authorization decision consults is reloaded before the first check that reads it — see [security/authorization-patterns.md](../security/authorization-patterns.md#authorization-that-consults-a-relation-must-reload-it-before-the-first-check-reads-it).

> **Task 0017 is the first story where this convention cost nothing, because it was applied at Phase 1 rather than found at Phase 4.** All three `app/Actions/SalesRegions/` actions authorize `update` as their own first statement, and `SetSalesRegionActive` additionally authorizes the **replacement default** row — the second row its operation writes — so a non-dashboard caller inherits the whole rule and not just the part about its named target. Two things generalise from it. **(a) Authorize every row the operation writes, not only the one it is named after** — the row-level counterpart of the [attribute-level rule](../security/authorization-patterns.md#an-ability-must-cover-every-attribute-that-achieves-its-effect-not-only-the-operation-it-is-named-after) task 0004 established. **(b) The component authorizing too is defence in depth, not duplication to remove.** `App\Livewire\SalesRegions\Index` re-checks the same ability on both rows before calling either action; the action's check is what a queued job or Artisan caller inherits, and the component's is what fails fast before a transaction opens and what makes the per-row `canEdit` hint honest. A reviewer who deletes one of the two has removed a layer, not a redundancy.
>
> ⚠️ **"Authorize before the first write" and "re-read what you authorize against" pull in opposite directions once an action locks its own rows,** and task 0017 is where they first meet. These actions authorize against the **caller-supplied** instance, *outside* the transaction — deliberately, so a refusal never opens one — and only then re-fetch the row under `lockForUpdate()`. That is safe only while `SalesRegionPolicy::update()` ignores its target entirely. The day any policy grows a branch that reads a target attribute, that branch must be evaluated against a re-fetched row; see [architecture/authorization.md](../architecture/authorization.md#salesregionpolicy--the-third-policy-and-the-first-with-no-target-branch) and [security/model-instance-trust.md](../security/model-instance-trust.md).

What the rules themselves say, and why a rule that must bind a Super Admin actor is a direct `throw` rather than a `Gate` check, belongs to [architecture/authorization.md](../architecture/authorization.md#the-guard-belongs-to-the-action-not-to-the-caller), not here.

## Model conventions

This codebase uses PHP 8 attributes for mass-assignment and serialization instead of the classic `$fillable`/`$hidden` properties, and a `casts()` method instead of a `$casts` property — both are Laravel 13 idioms:

```php
// app/Models/User.php
#[Fillable(['name', 'email', 'password'])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token'])]
class User extends Authenticatable implements PasskeyUser
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, PasskeyAuthenticatable, TwoFactorAuthenticatable;

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
}
```

✅ Good — new models follow the same attribute-based style (`#[Fillable]`, `#[Hidden]`, `casts()` method).
❌ Bad — mixing the old property-based style into a new model (adapted to illustrate; not present in the repo):
```php
// anti-pattern — do not introduce this alongside the attribute-based style
class Post extends Model
{
    protected $fillable = ['title', 'body'];
    protected $hidden = ['internal_notes'];
}
```
Mixing both styles in the same codebase makes it unclear which one governs a given model at a glance.

`casts()` also carries enum casts (`'status' => UserStatus::class`, `'deleted_at' => 'datetime'`), and the **omission** of a column from `#[Fillable]` *is* this codebase's mass-assignment guard: `users.status` and `users.pending_email` are deliberately absent from `User`'s `#[Fillable]` list, so the only way to write them is an explicit `forceFill()` **from one named place** — today the `app/Actions/Users/` actions that own the email-change flow, plus `User::delete()`'s obfuscation write (see below), each of which is the single writer of the columns it touches. When you add a column that no form may set, leave it out of `#[Fillable]` and write it that way — don't add it and then filter the input at each call site.

`SalesRegion` (task 0016) is the same convention at a larger scale and worth reading as the reference case: it declares `#[Fillable(['code', 'description', 'rate'])]` and leaves **eight** columns out, with `database/seeders/SalesRegionSeeder.php` as their single `forceFill()` writer. Two things generalise from it. First, the omission list is derived from *who may write the column*, not from how sensitive it looks: `slug` is omitted because a form that could change it would break the seeder's idempotency by duplicating the row, and `name` because a canonical name must stay refreshable on re-seed. Second, **columns coupled by an invariant are one mass-assignment decision, not two** — `is_active` is omitted *because* `is_default` is, since leaving one fillable invites exactly the split write the invariant forbids. See [security/seeder-safety.md](../security/seeder-safety.md#confirmed-safe-split-seeder-owned-from-administrator-configurable-columns-upsert-is-the-wrong-default).

`Media` (story 0019) is the same convention at its most lopsided, and the case to cite when someone argues an omission list is getting unwieldy: `#[Fillable(['title', 'description'])]` against **seven** omitted columns — `path`, `webp_path`, `avif_path`, `width`, `height`, `size_bytes` and `uploaded_by`. Every one is *server-derived*, which is the cleanest version of the test this convention actually applies: not "is this sensitive" but **"could a form legitimately supply this value at all"**. A width the client asserts is not a width; a path the client supplies is an arbitrary write into a web-served directory. The single writer is [`App\Actions\Media\StoreUploadedImage`](../../app/Actions/Media/StoreUploadedImage.php), which uses `Media::forceCreate([...])` with a literal key list — the same shape `App\Actions\Users\CreateUser` already uses, and the reason a plain `Media::create()` there would silently drop seven of nine columns rather than fail.

⚠️ **The omission is a mass-assignment guard, not an integrity guard, and this model is where the difference bites.** `save()` writes the whole dirty set rather than the `fill()` allow-list, so a caller who assigns `$media->path = …` directly still reaches the column — exactly the shape [security/model-instance-trust.md](../security/model-instance-trust.md) records for `SalesRegion`. **Story 0020 is where a `media` row first gets updated at all, and it is the case that shows the guard doing its job rather than the case that breaks it.** [`App\Actions\Media\UpdateMediaDetails`](../../app/Actions/Media/UpdateMediaDetails.php) writes through `$media->update(['title' => …, 'description' => …])` — the allow-listed path, with a literal two-key array rather than a `$request`-shaped payload — so the seven omitted columns are unreachable *and* the update is auditable by reading one line. The residual is unchanged and still worth knowing: nothing stops a *future* caller assigning a path column and calling `save()`, and no test would catch it. The convention's protection ends where `fill()` does.

Every property is documented with a `@property` PHPDoc block above the class, matching the actual database columns (see the block above `class User` in `app/Models/User.php`) — keep this block in sync with the migration whenever a column is added or removed (this is exactly the kind of drift the `docs-maintainer` skill and this file exist to catch).

### Deleting a user goes through the model, not the query builder

`App\Models\User` is the one model using `Illuminate\Database\Eloquent\SoftDeletes` today (task 0005), and it overrides `delete()` so that a delete also obfuscates the account's email, nulls `email_verified_at` / `pending_email`, and revokes the account's `password_reset_tokens` rows — all in one transaction. What those semantics *are* belongs to [database/schema.md](../database/schema.md#soft-deletes); the convention here is narrower and easy to break by accident: **an override on `delete()` only runs for instance deletes**, so the query builder is not an equivalent shortcut.

✅ Good — delete a resolved instance, which is what every call site in the repo does:

```php
// app/Livewire/Users/Index.php — deleteUser()
$target->delete();
```

❌ Bad — a bulk delete through the builder (adapted to illustrate; not present in the repo):

```php
// anti-pattern — never do this against users
User::whereIn('id', $ids)->delete();
```

`Builder::delete()` never instantiates a model, so it silently skips the override entirely: the rows are stamped `deleted_at` while keeping their live email addresses and their still-valid password-reset tokens. Same trap for any future model that puts real behavior on `delete()` — put the behavior on the model, then keep every call site on instances.

### UUID primary keys

> **Five live examples: `User` (Epic 1), `SalesRegion` (task 0016), `Media` (story 0019), `ProductCategory` (story 0023) and `Product` (story 0024).** All five are real UUID (v7) PK models. `User` got there by conversion, per [ADR 0001 — UUID primary keys](../decisions/0001-uuid-primary-keys.md); `SalesRegion` was the first model in this repo created that way from day one, and remains the one to copy for a plain greenfield table. **`sales_regions` and `media` are not among the ADR's original seven entities** — each shipped under a confirmed project-wide policy (UUID v7 for every new Epic 2 business entity, with a high-volume geography lookup table excepted and left `bigint`) recorded in [ADR 0001's Amendment 1](../decisions/0001-uuid-primary-keys.md#amendment-1-2026-08-27--the-scope-is-the-policy-not-the-list-of-seven) — landed with story 0019, no longer the "deferred follow-up task" this note used to say. **`product_categories` and `products` are the opposite case**: both are literally among the ADR's original seven named entities, so neither needed an amendment at all — see [ADR 0001's Amendment 2](../decisions/0001-uuid-primary-keys.md#amendment-2-2026-09-01--product-categories-lands-inside-the-original-seven) and [Amendment 3](../decisions/0001-uuid-primary-keys.md#amendment-3-2026-09-01--products-is-the-second-of-the-original-seven-to-ship). `product_media`, story 0024's gallery pivot, has **no UUID PK of its own at all** — a composite key over two already-UUID FKs, the same shape the vendored permission pivots use — so it falls outside this convention entirely rather than being a sixth example. Four of the ADR's originally-named six not-yet-implemented entities (product variants, blog categories, blog tags, blog posts) still do not exist in code. Read the ADR for rationale and [database/schema.md's Notes](../database/schema.md#notes) for what is actually keyed this way. This subsection is only the code-shape convention.

These models key on a UUID **version 7** generated by Laravel 13's native `HasUuids` trait (`Illuminate\Database\Eloquent\Concerns\HasUuids`), whose default `newUniqueId()` returns `Str::uuid7()` (time-ordered, not random UUIDv4). The convention:

- Add `use HasUuids;` to the model's trait list alongside whatever other traits it needs (e.g. `HasFactory`) — do not substitute a different UUID-generation trait or a custom `newUniqueId()` override (`HasUlids` was considered and rejected — see [ADR 0001](../decisions/0001-uuid-primary-keys.md)).
- Type the `@property` PHPDoc for `id` as `string`, not `int`.
- Do **not** declare `$keyType` or `$incrementing` as properties. The trait's `HasUniqueStringIds` concern already overrides `getKeyType()` / `getIncrementing()` as methods, so restating them as properties is redundant.
- Route-model binding needs no syntax change (`{model}` still binds on `id`). Note one behavioral change: `resolveRouteBindingQuery()` validates the parameter with `Str::isUuid()` first, so a malformed non-UUID route parameter throws `ModelNotFoundException` (a 404) immediately rather than running a doomed query.
- Factories need no change — the trait populates the key just before insert, exactly as today's auto-increment models never set `id` in their factory `definition()`.

✅ Good — the real, current shape, from `App\Models\User`: `HasUuids` sits in the trait list and `id` is `@property string`, with no `$keyType`/`$incrementing` properties:
```php
// app/Models/User.php
use Illuminate\Database\Eloquent\Concerns\HasUuids;

/**
 * @property string $id
 * @property string $name
 * // ...
 */
#[Fillable(['name', 'email', 'password'])]
class User extends Authenticatable implements PasskeyUser
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, HasRoles, HasUuids, Notifiable, PasskeyAuthenticatable, TwoFactorAuthenticatable;
}
```
❌ Bad — restating what the trait already provides (adapted to illustrate; not present in the repo):
```php
// anti-pattern — do not do this; HasUuids already overrides these as methods
class Product extends Model
{
    use HasUuids;

    protected $keyType = 'string';   // redundant
    public $incrementing = false;    // redundant
}
```

The migration side of this convention (`$table->uuid('id')->primary();`, `foreignUuid(...)`) is documented in [database/migrations.md](../database/migrations.md#uuid-primary-keys).

## Livewire component convention: class-based, not single-file

Livewire 4 supports single-file components (PHP + Blade in one `.blade.php`), but this project consistently uses the **class-based / multi-file** form: a `Livewire\Component` subclass in `app/Livewire/**` paired with a same-named kebab-case view in `resources/views/livewire/**` (see [naming.md](naming.md#livewire-components-and-views)):

```php
// app/Livewire/Settings/Appearance.php — minimal example of the pattern
namespace App\Livewire\Settings;

use Livewire\Attributes\Title;
use Livewire\Component;

#[Title('Appearance settings')]
class Appearance extends Component
{
    //
}
```

Every Livewire route in `routes/settings.php` is mounted with `Route::livewire('<uri>', <Component>::class)`, and every component declares its page `#[Title(...)]` attribute rather than setting the title from the Blade view. Follow this pattern for new settings/feature pages instead of introducing single-file components, to keep the codebase's one way of doing this.

## A `wire:ignore`d client-owned region — the app's first instance

Every Livewire component in this repo up to task 0021 lets Livewire own its whole rendered DOM: the server re-renders, Livewire morphs the difference into the page, and that is the entire lifecycle. [`App\Livewire\Components\WysiwygEditor`](../../app/Livewire/Components/WysiwygEditor.php) is the first to need a **carve-out** from that, and it establishes the shape a later component follows if it ever needs the same thing.

The problem a plain Livewire re-render cannot survive is a browser `Selection`/caret inside a `contenteditable` region a user is actively typing into: a server round trip that morphs that subtree — even one that produces byte-identical HTML — destroys the caret position and can discard in-flight input. The fix is `wire:ignore` on the editable `<div>` itself:

```blade
{{-- resources/views/livewire/components/wysiwyg-editor.blade.php --}}
<div
    x-ref="editor"
    wire:ignore
    contenteditable="{{ $disabled ? 'false' : 'true' }}"
    role="textbox"
    aria-multiline="true"
    data-test="wysiwyg-editor-region"
    x-on:input="onEditorInput()"
    x-on:blur="onEditorBlur()"
>{!! $value !!}</div>
```

Three rules come with a `wire:ignore`d region like this one, and they generalise past this one component:

- **The region is seeded from server state exactly once, in the initial server-rendered HTML, never re-injected by JS.** `{!! $value !!}` runs once, on first mount — because the div is `wire:ignore`d, Livewire never touches it again, so a *later* server-side write to the bound property (a host resetting its form, say) intentionally does **not** reach the DOM. This is a documented consequence for any consumer to know, not a bug: a `wire:ignore`d region has no built-in "refresh me" mechanism, and one must be added explicitly (an Alpine method the host can call) if a future consumer needs programmatic content replacement.
- **The region syncs back to the server at defined points only, never continuously.** `wire:model.live` on every keystroke was considered and rejected: it would round-trip the whole value on every character and make the caret's survival depend on Livewire's morph running successfully on every keystroke — the exact risk `wire:ignore` exists to remove — for no benefit, since the value is only needed when the host form saves. `WysiwygEditor` instead debounces `$wire.set('value', editorEl.innerHTML)` 400 ms after `input`, plus one explicit call after a discrete action that does not reliably fire a native `input` event (an image insertion via `execCommand('insertHTML', ...)`).
- **`{!! !!}` unescaped output is safe here only because of what the value already is, not because the region is client-owned.** The seeded value is untrusted HTML by construction (a `#[Modelable]` property a consumer's `wire:model` writes through), and this component performs **no** sanitization of its own — it is rendered back out exactly as received. That is a *load-bearing dependency on the consumer*, not a property of `wire:ignore`: whatever persisted column ends up bound here must be sanitized server-side on its own write path before this component ever renders it, or the `{!! !!}` becomes a stored-XSS sink. See [api/routes.md](../api/routes.md#applivewirecomponentswysiwygeditor--the-gallerys-first-real-consumer-and-the-second-routeless-gated-component) for which consumers already close this dependency and how.

**When to reach for this**: only for a region a browser API (here, `contenteditable`/`Selection`) actively owns and would fight a server re-render over. Do not reach for `wire:ignore` as a general performance shortcut — every other component in this app re-renders normally, and that remains the default.

## Flux Free's `ui-dropdown` requires a real `<button>` trigger descendant — confirmed twice, not a one-off

`flux:dropdown` (`ui-dropdown`) is this codebase's default open/close mechanism for a popover — it is what `resources/views/components/desktop-user-menu.blade.php` and `resources/views/layouts/app/sidebar.blade.php` already use, and both stories that needed a *new* popover assumed it would work the same way there. Neither could use it.

`ui-dropdown` resolves its trigger with a hard requirement, `this.querySelector("button")` (`vendor/livewire/flux/dist/flux.min.js`), and `ui-menu`'s own `boot()` unconditionally attaches a keydown listener to whatever that resolves to. A trigger element that renders no `<button>` descendant — `<flux:input>` renders only an `<input>` — makes `querySelector("button")` return `null`, and `w(null, "keydown", ...)` then throws `Cannot read properties of null (reading 'addEventListener')` on **every page load**, confirmed live via `assertNoJavaScriptErrors()` in both cases rather than assumed from reading the stub. `flux:dropdown` was never designed for "a text input triggers a live result list" — it is designed for "a button opens a static action menu" — and the trigger-resolution requirement is where that design assumption becomes a hard runtime failure rather than a styling mismatch.

The fallback is the same hand-assembled popover both stories independently reached for: an `x-data="{ open: false }"` wrapper, `x-show`/`x-cloak` on the popover body, `x-on:click.outside="open = false"`, and `x-on:keydown.escape.window` for dismissal — real Flux presentational subcomponents (`flux:menu.group`, `flux:menu.item`, and so on) kept for their styling, with only the outer `ui-dropdown`/`ui-menu` wrapper replaced. Story 0021's `wysiwyg-editor.blade.php` established this for its link-insertion popover; story 0022's `searchable-multi-select.blade.php` needed it again for its results dropdown, for the identical `querySelector("button")` reason, and its own file-banner comment documents the mechanism verified live rather than re-deriving it.

**The rule this confirms**: `flux:dropdown` is safe to reach for only when its trigger element genuinely renders a `<button>` — verify this by executing `assertNoJavaScriptErrors()` against the real page before trusting it, not by reading the Blade source, since the failure is entirely inside a vendored JS bundle no static read will show you. Any future popover trigger that is not itself a `<flux:button>`-rendering element (a `flux:input`, a custom trigger, a table cell) inherits the same constraint, and the manual `x-show`/`x-cloak`/`click.outside` shape above is the established fallback rather than something to reinvent per component.

## Artisan-first workflow

Per project `CLAUDE.md` (Laravel Boost guidelines): use `php artisan make:*` to scaffold new files (models, migrations, controllers, tests, etc.) instead of hand-writing boilerplate, and pass `--no-interaction` plus the correct options. Use `php artisan make:test --pest <Name>` for tests (see [pest-testing skill](../../.claude/skills/pest-testing/SKILL.md)).

## Quality gates

Every PHP change in this repo should pass, in this order, before being considered done:

1. `php artisan test --compact --filter=<Name>` — narrowest relevant test(s) first, matching [`tests/Feature/**`](../../tests) structure.
2. `vendor/bin/pint --dirty --format agent` — auto-fixes formatting against the `laravel` preset (`pint.json`).
3. Larastan level 7 (`phpstan.neon`) for static analysis on `app/`, `bootstrap/app.php`, `config/`, `database/`, `routes/`.

### Steps 1 and 2 are the *iteration* forms. Run both unscoped before declaring the work done

Both commands above take a scope argument, and **a narrowed gate reports "pass", not "not checked"** — nothing in either one's output distinguishes "I looked and found nothing" from "I looked at almost nothing". Task 0010 shipped past both of them at once (see [errors-log.md](../errors-log.md#both-of-this-projects-per-change-quality-gates-are-scoped-by-default-and-both-silently-passed--2026-08-20)), so the completion form is now stated explicitly:

```bash
vendor/bin/pint --format agent   # NOT --dirty
php artisan test                 # NOT --filter
```

- **`--dirty` inspects only files with *uncommitted* changes**, so it becomes a complete no-op the moment the work is committed — it is inversely coupled to commit hygiene, failing hardest exactly when the workflow is being followed best. It is the right tool mid-edit and the wrong last check on a committed branch.
- **`--filter` cannot observe a change's effect on the rest of the suite.** This matters far more often than it looks: a story that registers a **model event, an observer, a global scope, or middleware** has a blast radius of the whole suite by construction, however narrowly its own feature is scoped. `App\Models\Role`'s holder-count `deleting` guard was specified as part of the roles-CRUD story and reads as scoped to it — it binds every role in every test in the repo.

Use the scoped forms freely while iterating; the unscoped runs are what counts as the record.

**`php artisan test --parallel` is an equally valid unscoped record, and the faster one** (measured on this repo's own 950-test suite: ~2.6x on this project's dev container — see [testing/ci/commands.md#run-in-parallel](../testing/ci/commands.md#run-in-parallel)). It runs every test in every suite exactly like the plain unscoped form; `--parallel` changes how the work is distributed across processes, not what gets checked. CI runs it this way since the test-performance review that measured it. The one thing `--parallel` needs that the sequential form doesn't: `storage/framework/views` must sit on a filesystem that tolerates concurrent writes — see the ⚠️ in the linked section if you rebuild the Sail image and hit `tempnam()` errors under load.

_Last updated: 2026-09-04 — Story 0027 (Products list + editor UI). **Directory listing:** added `Products/` to the `app/Livewire/` grouping (`Index` — the list — and `Editor` — the routed create/edit screen, sharing one folder for the first time in this app), `products.php` to `routes/`, and `Products/` to `tests/Feature/`. **`app/Livewire/Dev/` and its harness are gone**, and this is the entry that records it: `App\Livewire\Dev\MediaGalleryHarness`, its view, `routes/web.php`'s environment-gated registration block, and `tests/Feature/Dev/MediaGalleryHarnessRouteTest.php` were all deleted once `Products/Editor` supplied the real host page 0020's own D16 and 0021's D13 named as the harness's expiry trigger — `Dev/` no longer appears in either the `app/Livewire/` or `tests/Feature/` listings. This story adds **no** new model, migration, action, policy, enum or validation rule — every class it consumes (`ProductPolicy`, the five `app/Actions/Products/*` classes, the two shared UI components) was already shipped with zero or partial call sites; this story is what gives all of them their first real caller. Also corrected two small forward-looking statements this pass found while reading rather than by the change→doc mapping: story 0026's own `SyncProductSalesRegions` paragraph named its "not-yet-built caller" as story 0027 in the future tense — now named as the real `Editor::save()` call site — and the `tests/Browser/` line's flat-file count, which undercounted even before this story (missing `ProductCategoriesIndexTest.php`, present since story 0025). **Verified as unchanged rather than assumed:** the stack-versions table, the model conventions and UUID-primary-keys blockquote, the app-owned-config-file section (`config/modules.php` gains one appended entry, exactly the shape that section already describes), the Livewire class-based convention (both new components follow it unmodified, including `Products\Index`'s use of the `Index`-in-a-subfolder exception — see [naming.md](naming.md#exception-a-component-named-index-resolves-to-its-parent-folders-name)), and the quality gates.

_Previously: 2026-09-03 — Story 0026 (Product ↔ Sales Region assignment and tax resolution backend). **Directory listing:** added four classes to the `Actions/Products/` line — `SyncProductSalesRegions`, `ResolveProductTaxRate` + `ResolvedTaxRate`, `SearchSalesRegions` — and a new paragraph recording `SyncProductSalesRegions` as this codebase's **fourth** shipped instance of "a collaborator invoked only by an already-authorized action needs no gate of its own" (after `GenerateImageConversions`, `EnforceGrantorPermissionScope` and `SyncProductGallery`), distinguished from the folder's other two new classes, which self-authorize nothing for the narrower reason each states in its own docblock (a pure read visible to any `products.view`/`sales-regions.view` holder; catalog data treated as uniformly visible to any authenticated admin). This story adds **no** new model, route, Livewire component, Blade view, permission or config file — see [database/schema.md](../database/schema.md#product_sales_region) for the new pivot table and [database/migrations.md](../database/migrations.md#an-fk-column-does-not-also-get-an-explicit-index-here) for its migration's confirming instance of the no-hand-written-FK-index rule. **Verified as unchanged rather than assumed:** the stack-versions table, the model conventions and UUID-primary-keys blockquote (`Product`/`SalesRegion` gain a relation and two scopes, not a new model), the app-owned-config-file section, the Livewire class-based convention (no component in this story), and the quality gates.

_Previously: 2026-09-03 — Story 0025 (Product categories — management screen: list, create/edit modal, blocked delete). **The `ProductCategories/` paragraph is corrected in place, not appended to** (old text quoted verbatim, per this project's audit-authored-page convention): it described `CreateProductCategory`/`RenameProductCategory`/`DeleteProductCategory` as deliberately unauthorized because no caller existed yet, and this story is the hand-off that closes that gap — all three now self-authorize as their own first statement, the identical shape `Products/`'s three actions already use, with `App\Livewire\ProductCategories\Index` as `ProductCategoryPolicy`'s first and only call site. **Directory listing:** added `ProductCategories/` to the `Livewire/` grouping, `product-categories.php` to both the top-level `routes/` line and the one-per-area convention paragraph, and noted `products.php`'s new `categories.index` subgroup on the `lang/` line. This story adds **no** model, migration, action, policy, factory, seeder or permission-catalog change — see [database/schema.md](../database/schema.md#product_categories) for the corrected schema-page note and [architecture/authorization.md](../architecture/authorization.md) for `ProductCategoryPolicy`'s first-call-site record. **Verified as unchanged rather than assumed:** the stack-versions table, the model conventions, the UUID-primary-keys blockquote, the Livewire class-based convention (`Index` follows it unmodified, including the `Index`-in-a-subfolder exception — see [naming.md](naming.md)), the app-owned-config-file section (`config/modules.php` gains one appended entry, exactly the shape that section already describes), and the quality gates._

_Previously: 2026-09-02 — Story 0024a (Product description — HTML sanitization on write). **Directory listing:** added `SanitizeProductDescription` to `Actions/Products/`'s class list — the only class in the app that imports `symfony/html-sanitizer`, the same "sole importer" precedent `GenerateImageConversions` already established for the imaging library — constructor-injected into `CreateProduct`/`UpdateProduct` as their third collaborator. **An app-owned config file is a registry** section: added a ⚠️ for [`config/html-sanitizer.php`](../../config/html-sanitizer.php), the app's **second** such file, explicitly stating why it does **not** fit this section's own "a registry a later story extends by appending data" framing — it is a fixed security allow-list a later consumer (Epic 4's blog body) must **reuse exactly**, never fork or append to, per the story's own scope fence — while confirming both hard constraints (no closures, no user-facing copy) still hold, verified by reading the real file rather than assumed. **Verified as unchanged rather than assumed:** the stack-versions table, the model conventions (no model or column change), the Livewire class-based convention (no Livewire component), the UUID-primary-keys blockquote, and the quality gates (all three run unscoped per the task file's own Definition of Done)._

_Previously: 2026-09-01 — Story 0024 (Products — core CRUD backend). **Directory listing:** added `Actions/Products/` (the sixth area folder) with a paragraph distinguishing its shape from `ProductCategories/`'s: `CreateProduct`/`UpdateProduct`/`DeleteProduct` **do** self-authorize (unlike every `ProductCategories/` action), and the folder's fourth class, `SyncProductGallery`, authorizes nothing for a narrower, structural reason — a collaborator invoked only by two actions that have already authorized, the codebase's **third** shipped instance of that pattern after `GenerateImageConversions` and `EnforceGrantorPermissionScope`, not a bespoke exception and not a repeat of `ProductCategories/`'s "no caller exists yet" gap. Added `Product` to `app/Models/` (with a note that `product_media`, the gallery pivot, has no model class of its own), `ProductType`/`ProductStatus`/`ProductDisplayStatus` to `app/Enums/`, `ProductPolicy` to `app/Policies/`, `Products/` to `tests/Feature/`, and `ProductValidationRulesTest.php`/`ProductStatusTest.php`/`ProductTypeTest.php` to the `tests/Unit/` listing. **Rewrote the UUID-primary-keys blockquote** again: five live examples now (`Product` the fifth), both `product_categories` and `products` needing no ADR amendment since both are named in the ADR's original seven, and a new sentence stating that `product_media` — a composite-PK pivot with no UUID of its own — falls outside this convention entirely rather than counting as a sixth example, the same standing exemption the vendored permission pivots already have. **Verified as unchanged rather than assumed:** the stack-versions table, the model conventions (`Product`'s `#[Fillable]` list follows the existing omission-as-guard convention — `featured_media_id` excluded, `SyncProductGallery` its single writer, the identical shape `SalesRegion`'s `is_default`/`is_active` already establishes), the app-owned-config rule (`config/modules.php` untouched — no route, no sidebar entry, per this story's own scope fence), the Livewire class-based convention (this story ships no Livewire component at all) and the quality gates (all three run unscoped and recorded in the task file's own Definition of Done)._

_Previously: 2026-09-01 — Story 0023 (Product categories — backend). **Directory listing:** added `Actions/ProductCategories/` (the fifth area folder, and the first whose actions deliberately do **not** authorize themselves — a recorded hand-off to the not-yet-built UI story 0025, not a regression of the action-owns-the-rule convention below), `ProductCategory` in `app/Models/`, `ProductCategoryPolicy` in `app/Policies/`, `ProductCategories/` in `tests/Feature/`, and `Concerns/` as a new `tests/Unit/` subfolder (this story's `ProductCategoryValidationRulesTest.php` is the first trait-level unit test in the suite). **Rewrote the UUID-primary-keys blockquote**, which was stale in two ways nobody had caught: it still described only two live examples (`User`/`SalesRegion`) though `Media` had been a third since story 0019, and it still called the ADR 0001 amendment "a deferred follow-up task" though [Amendment 1](../decisions/0001-uuid-primary-keys.md#amendment-1-2026-08-27--the-scope-is-the-policy-not-the-list-of-seven) landed with that same story. Now four live examples, with `ProductCategory` recorded as the case that needed **no** amendment at all — it is one of ADR 0001's own seven originally-named entities, unlike `sales_regions`/`media` — per the ADR's new [Amendment 2](../decisions/0001-uuid-primary-keys.md#amendment-2-2026-09-01--product-categories-lands-inside-the-original-seven). **Verified as unchanged rather than assumed:** the stack-versions table, the model conventions (`ProductCategory` follows the `#[Fillable]`-omission convention trivially — one fillable column, nothing to omit), the app-owned-config rule (`config/modules.php` untouched — no route, no sidebar entry, per the story's own D-1), the Livewire class-based convention (this story ships no Livewire component at all) and the quality gates._

_Previously: 2026-08-31 — Story 0022 (Shared searchable, server-side-filtered multi-select component). **Directory listing:** added `Actions/NormalizeForSearch.php` — the first real class living directly under `app/Actions/` with no subfolder, confirming the "or directly under `app/Actions/` if it belongs to none" branch of the one-subfolder-per-area rule with an actual example rather than only a parenthetical; `SearchableMultiSelect` and the `MultiSelectOptionsResolver` interface as `Components/`'s second and third occupants; `UnresolvedSelectionException` as the `Exceptions/` folder's first exception that deliberately carries **no** `render()`, because unlike its three siblings it must never reach the HTTP layer as a status code; `Actions/` itself (no subfolder) in the `tests/Unit/` listing, mirroring the app class it tests; and the new `tests/Support/` base folder — the suite's first, holding a conforming `MultiSelectOptionsResolver` test double three later stories (0026, 0027, 0034) will pattern-match their real resolvers against. **Corrected the `tests/Browser/` line**, which undercounted even before this story: it claimed "two of six files sit flat" (`UsersIndexTest.php`, `SalesRegionsIndexTest.php`), omitting `RolesIndexTest.php` — present since task 0011 — from both the total and the flat list. The real count, with this story's mirrored `Components/SearchableMultiSelectTest.php` added, is eight files, three flat. **Added a new top-level section, [Flux Free's `ui-dropdown` requires a real `<button>` trigger descendant](#flux-frees-ui-dropdown-requires-a-real-button-trigger-descendant--confirmed-twice-not-a-one-off)** — `flux:dropdown`'s trigger-resolution mechanism (`querySelector("button")`) throws on every page load when its trigger renders no real `<button>` (a `flux:input`, here), confirmed live via `assertNoJavaScriptErrors()` on two independent components (story 0021's link popover, story 0022's results dropdown) rather than assumed from the stub — both fall back to the same hand-assembled `x-show`/`x-cloak`/`click.outside` popover, which is now the documented, repeatable pattern rather than a one-off workaround. **Verified as unchanged rather than assumed:** the stack-versions table (no dependency added or bumped), the model conventions and UUID-primary-keys subsection (no model, column or migration in this story's diff), the app-owned-config rule (`config/modules.php` untouched — no route, no sidebar entry, per D7's "authorization belongs to the resolver, never the shell"), the action-owns-the-rule convention (this story ships no `Gate::authorize()` call at all — deliberately, see D7), the Livewire class-based convention (`SearchableMultiSelect` follows it unmodified), and the quality gates._

_Previously: 2026-08-31 — Story 0021 (Shared WYSIWYG rich-text editor component — frontend). **Directory listing:** added `Components/` to the `app/Livewire/` grouping (the first subfolder here that is neither a module area nor scaffolding — a *reusable, content-agnostic component* screens embed, with a one-line note pointing at the new `wire:ignore` section for why it needed one), `components.php` to the `lang/` line, `Components/` to both `tests/Feature/` and (mirrored) `tests/Browser/` — the latter now six files with two still flat, corrected from the prior "four files, two flat." **Added a new top-level section, [A `wire:ignore`d client-owned region — the app's first instance](#a-wireignored-client-owned-region--the-apps-first-instance)** — this repo's first component to opt a subtree out of Livewire's own re-render/morph cycle, and the shape a later component copies if it ever needs the same carve-out: seed from server state exactly once (never re-injected by JS, so a later server-side write to the bound property intentionally does not reach the DOM), sync back only at defined points (a debounced `input` plus explicit calls after discrete actions, never `wire:model.live`), and — the load-bearing caveat — an unescaped `{!! !!}` echo inside such a region is safe only because of what the seeded value *already is* (sanitized elsewhere on write), never because the region is client-owned. **Stack versions**: noted `resources/js/app.js` is now the app's first real JS module (a hand-rolled Alpine component, no new npm dependency — Alpine ships bundled inside Livewire 4) rather than the empty file it was through story 0020. **Verified as unchanged rather than assumed:** the model conventions and UUID-primary-keys subsection (no model, column or migration in this story's diff), the app-owned-config rule (`config/modules.php` untouched — no sidebar entry, deliberately, per the story's own D13/OQ-1 harness-only route), the action-owns-the-rule convention (this story adds no `app/Actions/` class at all), the Livewire class-based convention (`WysiwygEditor` follows it unmodified), and the quality gates — Pint and Larastan level 7 both clean unscoped, full suite unscoped at `{"tests":1058,"passed":1055,"skipped":3,"failed":0}` per the task file's own Phase 5 record._

_Previously: 2026-08-29 — Story 0020 (Shared media gallery modal — frontend). **Directory listing:** `UpdateMediaDetails` in `app/Actions/Media/` (the folder's third class, and `MediaPolicy::update()`'s first caller), `Dev/` in the `app/Livewire/` line, `Dev/` in `tests/Feature/`, `Media/` in `tests/Browser/` (which is now four files, two of them still flat), the new `tests/Browser/Fixtures/` folder, and a note on the `routes/` line that `web.php` holds one environment-gated dev route that is deliberately **not** an area file. **Added the `app/Livewire/Dev/` paragraph** — the first subfolder here that is neither a functional area nor permanent, which is a shape worth writing down once because the next story needing a test-only host page will otherwise re-derive it: the route is gated at **registration** time rather than by middleware (non-existence, not refusal), it carries `auth`+`verified` and a second `mount()`-level `abort_unless(…, 404)` for the stale-`route:cache` case the registration gate structurally cannot cover, its test asserts absence from the route **collection** rather than a 404, and it names its own deletion trigger (story 0027) in every file it occupies. Scaffolding without a named expiry is surface nobody has admitted to yet. **The `Media` `#[Fillable]` ⚠️ is updated rather than left forward-looking**: it predicted that story 0020's inline editing was where "no code updates a `media` row" stops being true, and it is — but the update lands through `$media->update([...])` with a literal two-key array, so this is the guard working, not the guard failing; the residual (a future caller assigning a path column and calling `save()`) is unchanged and restated. Also grew the `app/Actions/` grouping paragraph from two Media classes to three. **Verified as unchanged rather than assumed:** the stack-versions table (no dependency added or bumped), the UUID-primary-keys subsection and the delete-through-the-model rule (no model, column or migration in this story's diff), the app-owned-config rule (`config/modules.php` untouched — this story adds no sidebar entry, deliberately), the action-owns-the-rule convention (`UpdateMediaDetails` authorizes and validates itself, which is that rule applied for the third story running, not extended), the Livewire class-based convention, and the quality gates — Pint and Larastan level 7 both clean unscoped, and the full suite run unscoped at 1004 tests with one honestly-documented browser-test residual recorded in [testing/frontend/playwright-setup.md](../testing/frontend/playwright-setup.md#waiting-one-call-is-banned-in-this-repo-and-one-is-bounded)._

_Previously: 2026-08-28 — Test-suite parallelization: added the "`--parallel` is an equally valid unscoped record" paragraph to the Quality gates section, with the measured ~2.6x speedup and a pointer to the Sail/WSL2-specific `storage/framework/views` caveat in [testing/ci/commands.md](../testing/ci/commands.md#run-in-parallel). No directory-structure or convention change — `AppServiceProvider` gained one new private method (`configureParallelTesting()`) inside an existing file, not a new class or folder._

_Previously: 2026-08-27 — Story 0019 (Media Library upload and conversions — backend). **Directory listing:** `app/Actions/Media/`, `app/Livewire/Media/`, `Media` in `app/Models/`, `MediaPolicy` in `app/Policies/`, `media.php` in the `lang/` line, `Media/` in both `tests/Feature/` and `tests/Unit/Actions/`, and two more published vendor config files (`intervention-image.php`, `livewire.php`) — the latter two worth noticing because `config/` is no longer "Laravel + package config plus one app-owned file" by accident: `livewire.php` was published **for a security reason** (Livewire's own temporary-upload endpoint shipped a 12 MB, type-unrestricted default that any `media.view` holder could reach before this app's rules ever ran), not to change a default someone disliked. The `app/Actions/` grouping paragraph gains `Media/` as the fourth area — unremarkable, which is the point — with the one thing about its two-class split worth copying: `GenerateImageConversions` is the **only** class in the application that imports the imaging library, so nothing else knows which package provides it and a future re-encode command reuses it without touching the store action's transaction. **Model conventions:** added `Media` as the `#[Fillable]`-omission convention's most lopsided case — three fillable columns against **seven** omitted — because it makes the test this rule actually applies unusually clear: not "is this sensitive" but *could a form legitimately supply this value at all*, since a client-asserted width is not a width and a client-supplied path is an arbitrary write into a web-served directory. It carries the ⚠️ that the omission is a **mass-assignment** guard and not an integrity one (`save()` writes the whole dirty set), currently harmless only because story 0019 ships create-only and `MediaPolicy::update()` has no call site — story 0020 is where that changes. **Verified as unchanged rather than assumed:** the stack-versions table (one production dependency was added, `intervention/image-laravel` `^4.1`, which is not one of the packages this table pins), the UUID-primary-keys subsection (`Media` follows it exactly — `HasUuids` in the trait list, `@property string $id`, no `$keyType`/`$incrementing` — so it is the convention applied, not extended; the ADR-scope question it raises belongs to [ADR 0001's new Amendment 1](../decisions/0001-uuid-primary-keys.md#amendment-1-2026-08-27--the-scope-is-the-policy-not-the-list-of-seven)), the delete-through-the-model rule (`media` has no delete path at all), the app-owned-config rule (`config/modules.php` is untouched — this story adds no sidebar entry, deliberately), the action-owns-the-rule convention (followed at Phase 1 for the second story running, `StoreUploadedImage` authorizing `create` itself) and the Livewire class-based convention and quality gates, all three of which this story ran unscoped and recorded._

_Previously: 2026-08-26 — Task 0018 (Sales Regions & Taxes screen — UI): a view-layer story, so most of this page is untouched and two things needed saying. **The app-owned-config rule gained its ✅** — `config/modules.php` had never been extended by anything since task 0013 wrote it, so *"a declarative registry that a later story extends by appending data, never behavior"* was a claim about a file with exactly one author. Task 0018 is that later story, and it cost two appended array literals plus one lang leaf per locale with **no PHP class and no component change** (`sidebar-nav.blade.php` and `sidebar.blade.php` verified untouched against the diff); both hard constraints held on first contact, `expanded_when` going in as a literal `null` rather than as the closure over `request()` the rule warns about. **Corrected the `tests/Browser/` line of the directory listing**, which described the suite as mirroring the app structure while two of its three files sit flat — an under-count that predates this story (`UsersIndexTest.php`, task 0006) and that 0018 doubled rather than created (`SalesRegionsIndexTest.php`); the real state and the convention it departs from are owned by [testing/frontend/playwright-setup.md](../testing/frontend/playwright-setup.md#folder-structure). **Verified as unchanged rather than assumed:** the stack-versions table (no dependency changed), the whole `app/` directory listing (this story writes nothing under `app/` except one line in `App\Livewire\SalesRegions\Index::closeModal()` — a cross-story fix, no new class or folder), the model conventions and the UUID subsection (no model, column or migration), the action-owns-the-rule convention and its ⚠️ (no action added or moved), the Livewire class-based convention (followed) and the quality gates — all three of which this story ran unscoped and recorded, including the Larastan run [the entry above](../errors-log.md#a-verification-record-that-lists-two-of-three-quality-gates-is-a-record-of-two-gates--2026-08-26) exists because 0017 omitted._

_Previously: 2026-08-26 — Task 0017 (Sales Region tax configuration — backend): a third module area, and the first one where every convention on this page was **followed** rather than established or corrected. **Directory listing** — `app/Actions/SalesRegions/` (three actions), `app/Livewire/SalesRegions/`, `SalesRegionPolicy` beside the other two policies, `sales-regions.php` in both the `routes/` and `lang/` lines, and `SalesRegions/` in the `tests/Feature/` listing. The `app/Actions/` grouping paragraph and the `routes/` one-per-area paragraph both gained the new area, the latter with the copyable case spelled out (the new area file is `routes/roles.php` with three strings changed, `web.php`'s whole diff is one `require` line, and the `Index` import is aliased because the class name alone no longer says which of three areas it belongs to). **An authorization rule belongs to the action** gained a blockquote plus a ⚠️: the convention finally cost nothing because it was applied at Phase 1 rather than found at Phase 4, with the two things that generalise — **authorize every row the operation writes** (`SetSalesRegionActive` authorizes its replacement-default row too — the row-level counterpart of task 0004's attribute-level rule), and **a component that authorizes as well is a layer, not a redundancy** — and the ⚠️ that this page's own "authorize before the first write" and "re-read what you authorize against" rules pull in **opposite** directions once an action locks its own rows, which is exactly the tension task 0017's Phase 4 re-audit recorded as R-3. Verified as unchanged rather than assumed: the stack-versions table (no dependency changed), the model conventions and the UUID subsection (no model, column or migration in this story's diff — `sales_regions` is task 0016's), the app-owned-config-file rule (`config/modules.php` is untouched; this story ships **no** sidebar registry entry, which is story 0018's), the Livewire class-based convention (followed) and the quality gates — the last re-read deliberately, since this story's Phase 5 review found Larastan had never been run against it at all, a failure of the **practice** rather than of the rule already written here (now recorded in [errors-log.md](../errors-log.md#a-verification-record-that-lists-two-of-three-quality-gates-is-a-record-of-two-gates--2026-08-26))._

_Previously: 2026-08-24 — Task 0015b (log refused privileged attempts): two corrections to the same entry, both because `app/Actions/Auth/` gained its **second** class. The directory listing described the folder as holding only the step-up freshness guard — an enumeration that had silently become an under-count the moment `LogRefusedPrivilegedAttempt` landed — and the cross-cutting-concern paragraph beneath it now records that class as the case which **confirms** the rule rather than merely following it: it is imported by seven classes across **both** module areas, so an "it goes wherever the first caller lives" rule would have put it in `Actions/Users/` and left the Roles screen importing a Users class to record a Roles refusal. Verified as unchanged rather than assumed: the stack-versions table (no dependency changed), the model conventions (no model, column or migration in the diff), the `routes/` and `lang/` listings (untouched), the `tests/` listing (the story's four new test files land in the existing `tests/Feature/Users/` and `tests/Feature/Roles/`), the Livewire class-based convention and the quality gates._

_Previously: 2026-08-24 — Task 0015a (step-up authentication for privileged Users actions): four structural additions, no convention reversed. **Directory listing** — `app/Actions/Auth/` (with the paragraph explaining why it is a new *kind* of subfolder: the first one that is not a module area, and deliberately not `Fortify/`, which is reserved for classes implementing a Fortify contract — `EnsureRecentPasswordConfirmation` implements none, it only reads the session key Fortify's controller writes; the rule that falls out is **a class serving two areas belongs to the named concern, not to whichever area called it first**, and never to a `Shared/`/`Common/` catch-all); `PasswordConfirmationRequiredException → 423` beside `ImmutableRoleException` (403) and `RoleInUseException` (409); and `tests/Feature/Actions/Auth/` + `tests/Unit/Actions/Auth/` in the `tests/` listing (Phase 5 finding F-7 — the two new folders were the one part of this story the change→doc mapping does not route anywhere). **An authorization rule belongs to the action** gained a second blockquote for the story's deletion guard, which sits in `App\Livewire\Users\Index::deleteUser()` **only** because no `DeleteUser` action exists to hold it — an accepted placement pending a class, explicitly not a second exception, with the rule that such a placement is recorded in the method's own docblock so a reader can tell "belongs here" from "is here for now". Verified as unchanged rather than assumed: the stack-versions table (no dependency changed), the model conventions (no model, column or migration in the diff), the Livewire class-based convention, and the quality gates._

_Previously: 2026-08-24 — Task 0015 (Users CRUD security hardening): one addition only. **"An authorization rule belongs to the action, not to one of its callers"** gained a blockquote recording its **converse**, because this story adds a `Gate::authorize()` to a Livewire component and a reader applying the rule mechanically would try to "fix" it by moving the check into an action — there is none to move it to, since no `app/Actions/` class performs the disclosure the check guards. The rule follows the *operation*; what still may not reappear in a component is a re-derivation of the target's tier. Verified as unchanged rather than assumed: the directory listing (this story creates no folder — its five new test files land in the existing `tests/Feature/Users/`), the model conventions (no model, column or migration changed), the `lang/` entry (`users.php` gains one key, no structural change) and the quality gates._

_Previously: 2026-08-22 — Task 0013 (module/sidebar access gating — UI): added the **"An app-owned config file is a registry, and must survive `config:cache`"** subsection for [`config/modules.php`](../../config/modules.php), the first config file in this repo that is neither Laravel's nor a package's — when that shape is right (a declarative registry a later story extends by appending data, never behavior), and its two hard constraints with a real ✅/❌ pair: **no closures** (`ConfigCacheCommand` serialises with `var_export()` and throws `LogicException` on anything non-serialisable, so one closure in `config/` takes down a config-caching deploy — store the data and let the consumer apply it), and **store translation keys, not copy**. Corrected three lines of the directory listing that this story falsified or left vague: `config/` is no longer only Laravel + package config, `lang/` now names its three app-owned domain files, and `resources/views/components/` records that every Blade component here is anonymous (verified: this repo has no `app/View/` at all). What the registry *means* stays in [architecture/authorization.md](../architecture/authorization.md#the-second-half-of-a-module-gate-the-sidebar-registry)._

_Previously, 2026-08-20 — Task 0010 (Roles & permissions management — backend): added the **"Steps 1 and 2 are the iteration forms"** subsection to Quality gates — both `pint --dirty` and `test --filter` are scoped by default and report "pass" rather than "not checked", and this story shipped past both at once; the completion form is now the unscoped run of each, with the model-event/observer/global-scope blast-radius rule that makes the full suite non-optional. Updated the directory listing for `EnforceGrantorPermissionScope`, `RoleInUseException` (409, unlike `ImmutableRoleException`'s 403), `RolePolicy`, `app/Livewire/Users/` + `Roles/`, and the real `tests/Feature/` subfolders._

_Previously, 2026-08-20 — Task 0040: corrected the `routes/` line of the directory listing (`web.php` plus one file per functional area — `settings.php`, `roles.php`, `users.php`) and added a new "one-per-area" paragraph stating the convention behind it: `web.php` holds only the app-wide routes and `require`s an area file per module, so a new area gets a new `routes/<area>.php` rather than another inline block. `users.index` was the one route not following that shape until this story moved it._

_Previously, 2026-08-20 — Task 0009: added `app/Actions/Roles/` (`EnforceAdministratorPermissionGrant`) to the directory listing, and recorded it in the "one subfolder per area" paragraph as the pattern to copy — a new domain gets its own subfolder even for a single action, rather than being parked in the nearest existing one._

_Previously, 2026-08-20 — Task 0016 (Sales Region catalog schema + seeder): added `database/data/` to the directory listing with the paragraph explaining why a non-Laravel base folder was approved here (PRD-mandated bundled fixture) and what may go in it; noted `SalesRegion` beside `User` in `app/Models/` and `SalesRegionKind` in `app/Enums/`; added `SalesRegion` as the reference case for the `#[Fillable]`-omission guard (the omission list follows who may write the column, and invariant-coupled columns are one decision); and rewrote the UUID-primary-keys preamble, which claimed `User` was the only live example and implied ADR 0001's seven-entity list was exhaustive — `sales_regions` is an eighth, under a policy the ADR does not record until its deferred amendment lands._

_Previously, 2026-08-19 — Task 0008a: added the "An authorization rule belongs to the action, not to one of its callers" convention with its real ✅/❌ pair (the deleted `Index::createNewUser()` gate vs. `CreateUser`'s own first statement) and its three constraints — move the rule rather than copy it, derive a security-relevant flag internally rather than accept it as a parameter, and authorize before the first write against freshly-reloaded state. Noted `CreateUser` / `UpdateUser` in the `app/Actions/Users/` directory listing._

_Previously, 2026-08-18 — Task 0008: added `app/Exceptions/` to the directory listing and folded it into the "stock Laravel locations … needs no approval" sentence alongside `app/Enums/` and `app/Policies/`; noted `App\Models\Role` beside `User`, `RoleName` beside `UserStatus`, and `tests/Unit/`'s new `Exceptions/` folder and `ArchitectureTest.php`. What the role model's guards do lives in [architecture/authorization.md](../architecture/authorization.md#the-super-admin-roles-invariants), not here._

_Previously, 2026-08-16 — Task 0006b: added `tests/Browser/` to the directory-structure listing and corrected the browser-testing sentence, which still described the suite wiring as pending._

_Previously, 2026-08-14 — Task 0005: widened the `forceFill()` mass-assignment note from "in an action" to "from one named place" now that `User::delete()` is a second such writer, and added the "deleting a user goes through the model, not the query builder" convention with its ✅/❌ pair._
