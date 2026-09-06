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
                       (story 0026); CreateProductAttributeType, UpdateProductAttributeType,
                       DeleteProductAttributeType — each self-authorizes, matching CreateProduct/
                       UpdateProduct/DeleteProduct's shape; SyncProductAttributeValues — the single
                       writer of every product_attribute_values row for a type, authorizing NOTHING
                       for the identical structural reason SyncProductGallery/SyncProductSalesRegions
                       do (story 0028); CreateProductVariant, UpdateProductVariant,
                       DeleteProductVariant — each self-authorizes `update` on the variant's PARENT
                       Product, never a ProductVariantPolicy; HashVariantCombination,
                       DeriveVariantSku, TranslateProductVariantUniqueViolation — three pure,
                       dependency-free, never-`new`-ed classes (the combination hash, the SKU
                       derivation formula plus its `checked()` validating entry point, and the
                       shared disambiguator for product_variants' two unique-index race guards)
                       filed here rather than under an unapproved app/Support/ base folder, per the
                       "or directly under app/Actions/ if it belongs to none" branch below applied
                       one level narrower — domain-scoped rather than app-wide, so app/Actions/
                       Products/ rather than app/Actions/ itself (story 0029); GenerateProductVariant
                       Combinations — the cartesian "generate all combinations" batch action (story
                       0029b), which authorizes update on the parent Product ONCE, up front for the
                       whole batch, rather than once per generated row (see
                       architecture/authorization.md), re-implements nothing (every combination is
                       created through the ordinary CreateProductVariant, never a bulk insert()), and
                       constructor-injects all FOUR of LogRefusedPrivilegedAttempt/
                       CreateProductVariant/HashVariantCombination/DeriveVariantSku — the
                       code-style.md constructor-injection exception's next confirming instance after
                       CreateProductVariant's own four-collaborator shape, two of the four again pure
                       and dependency-free, with nothing new to decide there
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
                       validated and carrying no column or cast of its own; GeographyLevel, story
                       0032 — deliberately no label(), since this story ships no rendering site at
                       all, per naming.md's "add label() when a second consumer appears" rule)
  Exceptions/          Domain exceptions that render their own response (ImmutableRoleException → 403,
                       RoleInUseException → 409, PasswordConfirmationRequiredException → 423) —
                       plus, since story 0022, one that deliberately does NOT: UnresolvedSelectionException
                       carries no render() at all, because it must never reach the HTTP layer as a
                       status code (see below)
  Http/Controllers/    Abstract base + domain controllers used as HTTP boundaries in front of actions
  Listeners/           Event listeners (ActivateVerifiedUser), registered in AppServiceProvider
  Livewire/            Livewire components, grouped by area (Users/, Roles/, SalesRegions/,
                       Media/, ProductCategories/, Products/, Products/AttributeTypes/, Components/,
                       Settings/, Settings/TwoFactor/, Actions/). Dev/ (story 0020, the media-gallery-harness
                       scaffolding) was RETIRED by story 0027 once Products/Editor supplied a real
                       host page — see below. Components/ (story 0021, extended by 0022) is not a module area
                       like the others — it holds reusable, content-agnostic components a screen
                       embeds rather than one screen's own logic (WysiwygEditor, SearchableMultiSelect)
                       plus the one supporting interface a consumer implements
                       (MultiSelectOptionsResolver) rather than a component itself; see the
                       wire:ignore section below
  Models/              Eloquent models (User, SalesRegion, Media, ProductCategory, Product,
                       ProductAttributeType, ProductAttributeValue, ProductVariant, GeographyEntry
                       — story 0032, the only bigint-PK model in this app; Role, which subclasses
                       the package's role model). product_media, product_sales_region and
                       (story 0029) product_variant_values all have no model class of their own —
                       each reached only through the owning models' BelongsToMany (e.g.
                       Product::gallery(), ProductVariant::values()), the same shape the vendored
                       permission pivots use
  Notifications/       Notification classes (PendingEmailVerification, UserInvitation)
  Policies/            Eloquent model policies (UserPolicy, RolePolicy, SalesRegionPolicy,
                       MediaPolicy, ProductCategoryPolicy, ProductPolicy,
                       ProductAttributeTypePolicy), auto-discovered by name
  Providers/           Service providers (AppServiceProvider, FortifyServiceProvider)
config/                Laravel + package config (fortify.php, permission.php,
                        intervention-image.php, livewire.php, ...), plus modules.php — the one
                        app-owned config file (see below)
database/
  data/                 Bundled, version-controlled fixture data a seeder reads — not seeder
                        classes (iso-3166-countries.json, shared read-only with story 0032's own
                        GeographyCatalogSeeder; es-municipalities.csv, story 0032's ~8,130-row
                        Spanish municipio fixture; plus its own README stating provenance for both)
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
                        product-categories.php, product-attribute-types.php, products.php) — no
                        api.php yet. web.php no longer holds the story 0020/0021 environment-gated
                        dev route (story 0020's browser-test harness) — story 0027 retired it once
                        Products/Editor supplied a real host page; see ../api/routes.md
tests/
  Feature/              Feature tests, mirrors app structure (Actions/Auth/, Auth/, Settings/,
                        Seeders/, Users/, Roles/, SalesRegions/, Media/, ProductCategories/,
                        Products/, Components/, Models/, Policies/, Authorization/,
                        Navigation/, ...). Dev/ (story 0020's MediaGalleryHarnessRouteTest.php) was
                        deleted by story 0027 along with its subject
  Unit/                 Mirrors app structure too (Actions/ itself — NormalizeForSearchTest.php,
                        story 0022, sits directly here with no subfolder, matching the app class it
                        tests — plus Actions/Auth/, Actions/Media/, Actions/Products/ (story 0029's
                        HashVariantCombinationTest.php/DeriveVariantSkuTest.php, unit-testing the two
                        pure-function collaborators directly rather than only through the actions
                        that inject them), Concerns/ (story 0023's
                        ProductCategoryValidationRulesTest.php, the first trait-level unit test in
                        this folder, joined by story 0024's ProductValidationRulesTest.php),
                        Enums/ (ProductStatusTest.php / ProductTypeTest.php since story 0024),
                        Exceptions/, Listeners/, Models/, Seeders/ (story 0032's
                        GeographyCatalogSeederParsingTest.php — the CSV-parsing generator exercised
                        via reflection, no database — and GeographyFixtureIntegrityTest.php, which
                        parses the real bundled fixtures directly, its own file so a fast run can
                        exclude it), plus ArchitectureTest.php
  Support/              Test-only support code, not app code (story 0022, the suite's first use of
                        this base folder) — Livewire/ArrayMultiSelectOptionsResolver.php,
                        a conforming MultiSelectOptionsResolver double three later stories (0026,
                        0027, 0034) pattern-match their real resolvers against, and (story 0032)
                        Seeders/TestableGeographyCatalogSeeder.php, a GeographyCatalogSeeder
                        subclass whose fixture paths redirect to tests/Fixtures/geography/ — the
                        real seeder's own fixturePath() override hook exists specifically so this
                        test double can exist; autoloaded via composer.json's existing
                        "Tests\\": "tests/" mapping, no new autoload entry
  Browser/              Pest browser tests. Mirrors app structure (Auth/, Media/, Components/,
                        Products/ since story 0027) — but four of the eleven files sit flat instead
                        (UsersIndexTest.php, RolesIndexTest.php, SalesRegionsIndexTest.php,
                        ProductCategoriesIndexTest.php; the previous "three of eight" count here
                        missed ProductCategoriesIndexTest.php entirely, a gap present since story
                        0025 and corrected by story 0027's own pass); see
                        ../testing/frontend/playwright-setup.md#folder-structure
  Browser/Fixtures/     Real, checked-in binary fixtures a browser test needs as bytes on disk
                        (sample-upload.jpg) — never generated at runtime
  Fixtures/geography/   Real, checked-in CSV fixtures for story 0032's seeder tests — a small
                        (521-row, all 17 comunidades represented) municipality CSV plus malformed/
                        duplicate/quoting variants, so a test never has to seed the whole ~8,300-row
                        real catalog to exercise the seeder's own logic
  Pest.php, TestCase.php
```

`app/Enums/`, `app/Exceptions/`, `app/Listeners/`, `app/Notifications/`, `app/Policies/` and `lang/` are all **stock Laravel locations** (`make:enum`, `make:exception`, `make:listener`, `make:notification`, `make:policy`, `lang:publish`), not new base folders — creating one of them needs no approval; inventing a folder Laravel doesn't ship does.

`app/Policies/` in particular is **registration-free**: Laravel 13 auto-discovers `App\Policies\<Model>Policy` for `App\Models\<Model>`, so `UserPolicy` binds to `User` by naming alone. This repo has no `AuthServiceProvider` and does not need one — do not add one to register a conventionally-named policy. What each ability means lives in [architecture/authorization.md](../architecture/authorization.md#policies), not here.

`database/data/` is the one folder here that Laravel does **not** ship, so it needed the approval `CLAUDE.md` requires — it exists because [PRD §2.4](../PRD/PRD.md) mandates that the country list ship as a bundled fixture in this repository rather than as a Composer dependency (`league/iso3166`, `symfony/intl`). It holds **data a seeder reads**, never a seeder class and never generated output: today one JSON file plus [`database/data/README.md`](../../database/data/README.md), which states the fixture's provenance, its shape, what is deliberately excluded from it, and how to refresh it. A new file lands here only under the same test — bundled, reviewable in a diff, and read by something in `database/seeders/`.

**`app/Livewire/Dev/` (story 0020) was retired by story 0027, and this paragraph now records the retirement rather than the folder it used to describe.** It held `MediaGalleryHarness`, a throwaway host page whose only purpose was to give `App\Livewire\Media\Gallery` and (since story 0021) `App\Livewire\Components\WysiwygEditor` — both modal/embedded components with no route of their own — a URL a browser test could `visit()`. The four rules that separated that scaffolding from surface (a *registration*-time environment gate rather than middleware; `auth`+`verified` kept anyway as defence in depth; a test asserting absence from the route *collection*, not a 404; a named deletion trigger in every file it occupied) are recorded in this project's history rather than repeated here, since there is no longer a live instance to point them at. Story 0027's `App\Livewire\Products\Editor` — a real, routed page (`products.create`/`products.edit`) — turned out to be a strict superset of the harness (it embeds two `Gallery` instances and one `WysiwygEditor`, exactly the shape the harness mounted for its own tests), so both harness browser test files were re-pointed at it and made green **before** `App\Livewire\Dev\MediaGalleryHarness`, its view, its `routes/web.php` registration block and `tests/Feature/Dev/MediaGalleryHarnessRouteTest.php` were all deleted. **The scaffolding's own text said "if 0027 has shipped and this section still exists, it was not removed" — it does not, and it was.** See [api/routes.md](../api/routes.md#productsindex-productscreate-and-productsedit--the-fifth-permission-gated-route-family) for the migration itself.

`routes/` follows the same one-per-area shape: `web.php` declares only the app-wide routes (`home`, `dashboard`) and then `require`s one file per functional area — `settings.php`, `roles.php`, and `users.php` since task 0040, which moved `users.index` out of `web.php` so it stops being the one route that didn't follow the pattern, plus `sales-regions.php` since task 0017, `product-categories.php` since story 0025, `product-attribute-types.php` since story 0028, and `products.php` since story 0027 (the first area file to register **two** routes, `products.create`/`products.edit`, onto one component). A new area's routes go in a new `routes/<area>.php` with its own middleware group, appended as another `require` line rather than inlined into `web.php`; what each route contract actually is belongs to [api/routes.md](../api/routes.md).

Task 0017 is the first area file written *from* this convention rather than into it, and it is worth reading as the copyable case: [`routes/sales-regions.php`](../../routes/sales-regions.php) is [`routes/roles.php`](../../routes/roles.php) with three strings changed, `web.php`'s entire diff is one `require` line, and and the `Index` class is imported **aliased** (`use App\Livewire\SalesRegions\Index as SalesRegionsIndex;`), matching what both existing area files already do: each file's own `use` statements can't actually collide, but `Index::class` read on its own line says nothing about which of the three areas it belongs to, and these files are read one at a time.

`app/Actions/` groups by concern, one subfolder per area: `Fortify/` holds the framework-contract implementations, `Users/`, `Roles/` and `SalesRegions/` the app's own domain actions for those areas. A new action goes in the subfolder for its domain (or directly under `app/Actions/` if it belongs to none) — never nested under an unrelated one. `Roles/` (task 0009) is the pattern to copy when a new module needs its first action: create the subfolder for the domain, even for a single class, rather than parking it in the nearest existing one. `SalesRegions/` (task 0017) is that rule applied unremarkably to a third module, which is the point — three classes, one folder, no discussion needed. `Media/` (story 0019, extended by 0020) is the fourth: three classes, one folder, and the split between them chosen for a reason worth copying rather than for tidiness — `GenerateImageConversions` is the **only** class in the application that imports the imaging library, so every other class is unaware of which package provides it, and a future "re-encode the whole library" Artisan command reuses it without touching `StoreUploadedImage`'s transaction, cleanup and row-insert logic. Story 0020's `UpdateMediaDetails` is the folder's third and the plainest possible instance of the rule below it: a two-column write that could have lived in the Livewire component, given its own class so that a non-Livewire caller inherits the same `Gate` check and the same `mediaDetailsRules()` validation.

`ProductCategories/` (story 0023) is the fifth: three classes, one folder, following `SalesRegions/`'s unremarkable shape exactly. **Corrected 2026-09-03 (story 0025) — the paragraph below described a deliberate, temporary gap that this story closed; it is quoted in full rather than silently rewritten, per this project's audit-authored-page convention.** It used to read: *"with one deliberate difference worth reading against the other four. Every action in `Users/`, `Roles/`, `SalesRegions/` and `Media/` authorizes its own operation (task 0008a's convention below); **none of `CreateProductCategory`, `RenameProductCategory` or `DeleteProductCategory` do**, because this story ships no caller at all — no route, no Livewire component — so there is nothing yet to authorize *against*. `App\Policies\ProductCategoryPolicy` is created and fully tested regardless (per [security/livewire-authorization.md](../security/livewire-authorization.md)'s "a rule enforced only in a component is bypassed by every other caller" reasoning), and the Definition of Done records the gap as an explicit hand-off: the not-yet-built UI story (0025) must call `Gate::authorize()` before invoking each action, the same way `App\Livewire\Users\Index` already does for `CreateUser`/`UpdateUser`."* Story 0025 is that hand-off, discharged: `CreateProductCategory`, `RenameProductCategory` and `DeleteProductCategory` now each authorize their own operation as their own first statement — `Users/`, `Roles/`, `SalesRegions/`, `Media/` and `ProductCategories/` all follow the same convention today, with `Products/` below the only folder whose fourth class (`SyncProductGallery`) is a documented exception rather than a gap. `App\Livewire\ProductCategories\Index` is `ProductCategoryPolicy`'s first and only call site, and it re-checks the same abilities in its own mutating/disclosing methods (`openCreateModal`, `openEditModal`, `save`, `confirmDelete`, `deleteProductCategory`) as defence in depth on top of the actions' own gates, matching the shape every other module screen on this page already uses.

`Products/` (story 0024) is the sixth, and it is **not** a repeat of `ProductCategories/`'s gap — it is a narrower, different shape worth distinguishing from it explicitly. `CreateProduct`, `UpdateProduct` and `DeleteProduct` **do** each authorize their own operation, exactly like `Users/`/`Roles/`/`SalesRegions/`/`Media/`. The fourth class in the folder, `SyncProductGallery`, is the one that authorizes nothing — but it is not `ProductCategories/`'s "nobody has built the caller yet" gap: it has real callers today (`CreateProduct`/`UpdateProduct`, inside the same transaction), and it authorizes nothing *because* both of them have already authorized the whole operation before calling it. A collaborator invoked only by an already-authorized action does not need its own gate — the reflexive `update` check on `SyncProductGallery`'s own target would in fact be **wrong**: `CreateProduct` inserts a row and calls it inside the same transaction, so `update` would be asked of an actor who legitimately holds only `products.create`, refusing a correct create halfway through. This is this codebase's **third** shipped instance of that exact pattern, not a bespoke exception — `App\Actions\Media\GenerateImageConversions` (constructor-injected into `StoreUploadedImage`, which authorizes `create`) and `App\Actions\Roles\EnforceGrantorPermissionScope` (a payload transformer called from `Roles\Index::saveRole()`, which authorizes first) are the two prior ones. What makes the omission structural rather than an oversight: the class's own docblock states it, its two callers are its only callers, and `tests/Feature/Products/ProductAuthorizationTest.php` asserts that no other class under `app/` references it — if a later story ever calls `SyncProductGallery` directly, that story owns adding the gate.

**Story 0026's `SyncProductSalesRegions` is this codebase's fourth shipped instance of the same pattern** — after `GenerateImageConversions`, `EnforceGrantorPermissionScope` and `SyncProductGallery` — and for the identical structural reason: it is the single writer of the `product_sales_region` pivot, invoked only inside its caller's already-authorized transaction. That caller was not yet built when this paragraph was written; **it is now `App\Livewire\Products\Editor::save()` (story 0027)**, and `tests/Feature/Products/ProductSalesRegionAssignmentTest.php`'s reachability assertion now names `Editor.php` as the one additional allowed file alongside `SyncProductSalesRegions.php` itself. The folder's other two new classes self-authorize nothing for a *different* reason each states in its own docblock, worth distinguishing from the collaborator pattern above: `ResolveProductTaxRate` is a pure read of values already visible to anyone holding `products.view` or `sales-regions.view` and may run from a queued job with no acting user at all, and `SearchSalesRegions` (the search/options resolver behind 0027's region picker) treats the Sales Region catalog data it discloses — name, active state, has-children — as uniformly visible to any authenticated admin reaching it, the identical reasoning `ResolveProductTaxRate` already gives for the same omission.

**Story 0028 adds four more classes to `Actions/Products/` and this codebase's fifth shipped instance of the same collaborator pattern.** `CreateProductAttributeType`, `UpdateProductAttributeType` and `DeleteProductAttributeType` each self-authorize as their own first statement — the same shape `CreateProduct`/`UpdateProduct`/`DeleteProduct` already use, applied at Phase 1 rather than found at audit. `SyncProductAttributeValues`, the fourth, is the single writer of every `product_attribute_values` row for a given type and deliberately authorizes **nothing**, invoked only inside `CreateProductAttributeType`'s and `UpdateProductAttributeType`'s already-authorized transaction — after `GenerateImageConversions`, `EnforceGrantorPermissionScope`, `SyncProductGallery` and `SyncProductSalesRegions`, this is the pattern's **fifth** confirmed instance, and `tests/Feature/Products/SyncProductAttributeValuesTest.php` carries the matching reachability assertion. Unlike `SyncProductGallery`/`SyncProductSalesRegions`, which own a pivot, `SyncProductAttributeValues` owns a diff over a plain child table — it re-scopes every submitted value id against a fresh `$type->values()->pluck('id')` read before writing, which is what makes editing a type's value list never re-key a value that was not itself removed, the id-stability guarantee story 0029's future variant combinations depend on; see [database/schema.md](../database/schema.md#product_attribute_values).

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

> **Eight live examples: `User` (Epic 1), `SalesRegion` (task 0016), `Media` (story 0019), `ProductCategory` (story 0023), `Product` (story 0024), `ProductAttributeType` + `ProductAttributeValue` (story 0028), and `ProductVariant` (story 0029).** All eight are real UUID (v7) PK models. `User` got there by conversion, per [ADR 0001 — UUID primary keys](../decisions/0001-uuid-primary-keys.md); `SalesRegion` was the first model in this repo created that way from day one, and remains the one to copy for a plain greenfield table. **`sales_regions` and `media` are not among the ADR's original seven entities** — both shipped under a confirmed project-wide policy (UUID v7 for every new Epic 2 business entity, with a high-volume geography lookup table excepted and left `bigint`) recorded in [ADR 0001's Amendment 1](../decisions/0001-uuid-primary-keys.md#amendment-1-2026-08-27--the-scope-is-the-policy-not-the-list-of-seven). **`product_categories`, `products`, `product_attribute_types`/`product_attribute_values` and `product_variants` are the opposite case**: all are literally among the ADR's original seven named entities, so none needed an amendment — see [ADR 0001's Amendment 2](../decisions/0001-uuid-primary-keys.md#amendment-2-2026-09-01--product-categories-lands-inside-the-original-seven), [Amendment 3](../decisions/0001-uuid-primary-keys.md#amendment-3-2026-09-01--products-is-the-second-of-the-original-seven-to-ship) and [Amendment 4](../decisions/0001-uuid-primary-keys.md#amendment-4-2026-09-04--product-variants-is-the-third-of-the-original-seven-to-ship) (`product_attribute_types`/`product_attribute_values` are the exception among these four — they fall under Amendment 1's general policy rather than being named in the ADR's own seven, per the task file's own D9). `product_media` (story 0024), `product_sales_region` (story 0026) and `product_variant_values` (story 0029) all have **no UUID PK of their own at all** — composite keys over already-UUID FKs, the same shape the vendored permission pivots use — so all three fall outside this convention entirely rather than counting as additional examples. Three of the ADR's originally-named six not-yet-implemented entities (blog categories, blog tags, blog posts) still do not exist in code. Read the ADR for rationale and [database/schema.md's Notes](../database/schema.md#notes) for what is actually keyed this way. This subsection is only the code-shape convention.

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

_Last updated: 2026-09-06 — Story 0032 (Shipping geography catalog seed). Added `GeographyEntry`/`GeographyLevel`/`GeographyCatalogSeeder` to the directory-structure listing (`app/Models/`, `app/Enums/`, `database/data/`, `tests/Unit/`, `tests/Support/`), including the new `tests/Fixtures/geography/` sibling to `tests/Browser/Fixtures/`. No convention rule changed — every addition follows an existing pattern (the `Index`-in-a-subfolder-adjacent bigint-PK exception is ADR 0001's, not a new rule here; the deferred-`label()` and `app()`-resolution shapes are naming.md's/code-style.md's existing rules applied, not extended)._

_Previously: 2026-09-05 — Collapsed the accumulating `_Previously:` footer chain (spanning tasks 0004–story 0029b, ~40k characters) into this single line, per the doc-growth-management rule now codified in [contracts.md](../contracts.md#doc-growth-management-rule) and the docs-maintainer skill's Definition of Done. No convention content changed this pass.
