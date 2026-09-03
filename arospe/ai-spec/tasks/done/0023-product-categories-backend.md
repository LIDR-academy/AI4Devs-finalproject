# [0023] Product categories — backend (table, model, create/rename/delete, name validation)

## Description
Introduce the product category taxonomy as a first-class, standalone entity: a new
`product_categories` table (UUID v7 primary key per [ADR 0001](../../../docs/decisions/0001-uuid-primary-keys.md)),
its `App\Models\ProductCategory` model, and the create / rename / delete domain logic with name
validation. This is the foundational Epic 2 story every other product story builds on — it is
**backend only** (no screen, no route) and deliberately **independent from any future blog
taxonomy**: no shared table, no shared model, no polymorphic taxonomy.

Covers [PRD](../../../docs/PRD/PRD.md#22-products) §2.2's "Product categories (extends the prototype)"
scenarios *Create*, *Rename*, *Delete an unused category*, and *independent from blog categories*,
plus the CRUD half of Products acceptance criterion 2 and acceptance criterion 7. It does **not**
cover the "deleting a category still in use is hard-blocked with a count" scenario — see
[Scope fences](#scope-fences-what-this-story-must-not-do).

## Type
backend | includes database-expert: yes

## Gherkin
```gherkin
Feature: Product categories

  Scenario: Create a product category
    Given a catalog administrator
    When they create a product category named "Footwear"
    Then "Footwear" is saved in the product category catalog
    And it is available to be assigned to products

  Scenario: Rename a product category
    Given a catalog administrator, with a product category "Footwear"
    When they rename it to "Running shoes"
    Then the category is shown as "Running shoes" wherever it is used
    And no category named "Footwear" remains in the catalog

  Scenario: Saving a product category under its own current name is accepted
    Given a catalog administrator, with a product category "Footwear"
    When they save that same category with the name "Footwear" unchanged
    Then the save is accepted
    And the category keeps the name "Footwear"

  Scenario: Delete an unused product category
    Given a catalog administrator, with a product category "Footwear" assigned to no products
    When they delete "Footwear"
    Then "Footwear" is removed from the product category catalog
    And it is no longer available to be assigned to products

  Scenario Outline: A product category with an unacceptable name is refused
    Given a catalog administrator
    When they create a product category with <invalid_name>
    Then the creation is refused with a validation message
    And no category is added to the catalog

    Examples:
      | invalid_name                                  |
      | a blank name                                  |
      | a name made only of whitespace                |
      | a name longer than the accepted maximum       |

  Scenario: Creating a product category with a name already in the catalog is refused
    Given a catalog administrator, with a product category "Footwear"
    When they create another product category named "Footwear"
    Then the creation is refused with a validation message
    And the catalog still holds exactly one category named "Footwear"

  Scenario: Renaming a product category onto a name another category holds is refused
    Given a catalog administrator, with the product categories "Footwear" and "Apparel"
    When they rename "Apparel" to "Footwear"
    Then the rename is refused with a validation message
    And "Apparel" keeps its name

  Scenario: Product categories are independent from blog categories
    Given a catalog administrator
    When they view the product category catalog
    Then it contains only product categories, held in their own catalog
    And it shares no storage or identity with any blog taxonomy

  Scenario: An administrator without the products permission cannot manage the catalog
    Given a signed-in administrator who does not hold the products management permission
    When authorization to manage the product category catalog is evaluated for them
    Then the action is refused
```

> **Deliberately absent:** there is **no** scenario here for *"Deleting a product category still in
> use is hard-blocked with a count"*, even though it sits in the same PRD Gherkin block. At the
> point this story is implemented the `products` table does not exist, so no category can be "in
> use" and there is nothing to count. That scenario is owned by story **0024
> (products-core-crud-backend)**, which introduces `products.product_category_id` and retrofits the
> guard onto `DeleteProductCategory`. See [Scope fences](#scope-fences-what-this-story-must-not-do).

## Files to create/modify

**Migration**
- `database/migrations/<timestamp>_create_product_categories_table.php` — new. Greenfield UUID
  table per [migrations.md](../../../docs/database/migrations.md#uuid-primary-keys):

  ```php
  public function up(): void
  {
      Schema::create('product_categories', function (Blueprint $table): void {
          $table->uuid('id')->primary();
          $table->string('name');
          $table->timestamps();

          // Defence in depth only — the authoritative uniqueness check is the
          // normalised comparison in PHP. See D-4/D-5.
          $table->unique('name');
      });
  }

  public function down(): void
  {
      Schema::dropIfExists('product_categories');
  }
  ```

  `name` is a bare `string()` (`VARCHAR(255)`), matching `users.name` and `users.email` — and note
  `users.email` is already a `VARCHAR(255)` column carrying a `unique` index in this schema, so the
  1020-byte utf8mb4 key this creates is a shape the repo has accepted before, well inside InnoDB's
  3072-byte limit under the DYNAMIC row format (**D-5**). No `deleted_at` (decision **D-3**), no
  `slug` / `sort_order` / `description` (**D-6**), no FK to
  `products` (that column belongs to 0024, on the `products` side). `down()` is the exact inverse,
  per this repo's `down()`-symmetry rule.

**Model**
- `app/Models/ProductCategory.php` — new. `use HasFactory, HasUuids;`, `#[Fillable(['name'])]`,
  `@property string $id` (string, not int) per
  [base-standards.md](../../../docs/conventions/base-standards.md#uuid-primary-keys). No
  `$keyType`/`$incrementing` properties (the trait already overrides them as methods), no
  `SoftDeletes`, no `#[Hidden]` (nothing sensitive), no `casts()` beyond Eloquent's default
  timestamp handling.

**Factory**
- `database/factories/ProductCategoryFactory.php` — new, via
  `php artisan make:factory ProductCategoryFactory --model=ProductCategory --no-interaction`.
  `definition()` returns `['name' => fake()->unique()->words(2, true)]`, mirroring
  `UserFactory`'s `fake()->unique()->safeEmail()` handling of a unique column. Note Faker's
  `unique()` is a per-instance guard, **not** a database one — a test needing a guaranteed-distinct
  name passes it explicitly rather than relying on Faker.

**Validation trait**
- `app/Concerns/ProductCategoryValidationRules.php` — new, following
  [naming.md](../../../docs/conventions/naming.md#traits-and-their-methods)'s `<Noun>ValidationRules`
  / `<noun>Rules()` convention and `ProfileValidationRules`' two-method shape:

  ```php
  trait ProductCategoryValidationRules
  {
      /** @return array<string, array<int, ValidationRule|array<mixed>|string>> */
      protected function productCategoryRules(
          NormalizeForSearch $normalizeForSearch,
          ?string $productCategoryId = null,
      ): array {
          return ['name' => $this->nameRules($normalizeForSearch, $productCategoryId)];
      }

      /** @return array<int, ValidationRule|array<mixed>|string> */
      protected function nameRules(
          NormalizeForSearch $normalizeForSearch,
          ?string $productCategoryId = null,
      ): array {
          return [
              'required',
              'string',
              'max:255',
              // Uniqueness is compared against the SHARED normaliser's output in
              // PHP, never left to the connection's collation. utf8mb4_unicode_ci
              // WOULD reject a case-/accent-duplicate pair, but only as a raw
              // 23000 QueryException with no field-level message; the PHP
              // pre-check is what produces a clean ValidationException on `name`
              // before the database ever has to enforce it.
              // See D-4, D-12 and R-2.
              $this->uniqueNormalisedName($normalizeForSearch, $productCategoryId),
          ];
      }
  }
  ```

  Two things this shape is carrying deliberately:

  - **The `->ignore()` branch** is what makes "save a category under its own current name" succeed;
    it is also the branch that is only safe when the id it receives is server-authoritative — see
    [security/livewire-authorization.md](../../../docs/security/livewire-authorization.md) and the DoD
    hand-off note below.
  - **`uniqueNormalisedName()` is a closure/custom rule, not a bare `Rule::unique()`**, because a
    bare one compiles to `WHERE name = ?` and hands the case/accent decision to the connection's
    collation — the exact thing **D-4** exists to prevent. It compares the candidate's normalised
    form against the normalised form of existing names (excluding `$productCategoryId` when
    renaming). **The fold on both sides of that comparison is
    [`App\Actions\NormalizeForSearch`](../../../docs/conventions/base-standards.md#directory-structure)
    (`app/Actions/NormalizeForSearch.php`, `__invoke(string $value): string`) — the project's one
    shared text normaliser — never a private helper on this trait and never an inline
    `Str::lower()` / `Str::ascii()` pipeline (**D-12**).** The behaviour is unchanged from this
    story's original design (the same case- *and* accent-insensitive comparison **D-4** requires);
    only the implementation now delegates instead of reimplementing. The normaliser is
    **container-resolved and threaded through** the rule helpers as a parameter rather than resolved
    with `app()` inside the closure, matching this repo's per-method action-injection convention
    ([code-style.md](../../../docs/conventions/code-style.md#inject-single-purpose-actions-per-method)).

**Actions** — new subfolder `app/Actions/ProductCategories/`, one per domain area, same rule as
`app/Actions/Users/`:
- `CreateProductCategory.php` — `__invoke(string $name): ProductCategory`. Trims the name before
  validating/persisting, and catches `QueryException` code `23000` to rethrow as a
  `ValidationException` on `name`, exactly as
  [`App\Actions\Users\CreateUser`](../../../app/Actions/Users/CreateUser.php) does for `email` — the
  unique index is the last-word race guard behind the validation rule, not a 500.
- `RenameProductCategory.php` — `__invoke(ProductCategory $productCategory, string $name): ProductCategory`.
  Same trim + `23000` handling, with the uniqueness rule ignoring the target's own id.

  Both actions take `App\Actions\NormalizeForSearch` as a constructor-promoted dependency and pass
  it into `productCategoryRules()` / `nameRules()` (**D-12**). Neither action folds case or accents
  itself: `Str::lower()` or `Str::ascii()` appearing anywhere in `app/Actions/ProductCategories/`
  or in `ProductCategoryValidationRules` is a review finding.
- `DeleteProductCategory.php` — `__invoke(ProductCategory $productCategory): bool`. Today its body
  is a plain instance `->delete()`. **It exists as its own file now specifically so story 0024
  extends this one file** with the in-use hard-block guard, rather than introducing that rule in a
  new place (the same way story 0005 extended `UserPolicy::delete()` instead of duplicating it).

**Policy**
- `app/Policies/ProductCategoryPolicy.php` — new, via
  `php artisan make:policy ProductCategoryPolicy --model=ProductCategory --no-interaction`.
  Auto-discovered by name for `App\Models\ProductCategory`; **no** `AuthServiceProvider` is added
  (this repo has none and does not need one). Abilities `viewAny` / `create` / `update` / `delete`,
  each gating on the already-seeded `products.view` / `products.create` / `products.edit` /
  `products.delete` permissions (**D-8** / **RQ-1** — confirmed, no new module slug).

**Consumed, not created by this story**
- `app/Actions/NormalizeForSearch.php` (`App\Actions\NormalizeForSearch`) — the shared text
  normaliser, `__invoke(string $value): string`, implemented as `trim` → `Str::lower` →
  `Str::ascii` → collapse-whitespace. It is **created and unit-tested by story 0022**
  (`tests/Unit/Actions/NormalizeForSearchTest.php`) and consumed unchanged by 0023, 0026, 0032,
  0033 and 0034. This story must not redefine, wrap, fork or locally override it (**D-12**); if its
  folding behaviour turns out to be wrong for category names, that is an amendment to 0022's D13,
  not a second copy here. See the sequencing note under [Dependencies](#dependencies).

**Not touched by this story** (see [Scope fences](#scope-fences-what-this-story-must-not-do)):
`database/seeders/RolePermissionSeeder.php`, `routes/web.php`, `app/Livewire/**`,
`resources/views/**`, `lang/**`.

## Tests to perform

Backend only — **no browser tests** in this story, since it ships no screen.

**Unit — `tests/Unit/Concerns/ProductCategoryValidationRulesTest.php`**
- [x] `nameRules($normalizeForSearch, null)` and `nameRules($normalizeForSearch, $id)` return the
      expected rule arrays, and the second carries the `->ignore()` branch. This is the story's only
      genuinely unit-testable surface — everything else needs a real row for the uniqueness check.
- [x] The **exhaustive folding table is not re-asserted here.** `App\Actions\NormalizeForSearch`'s
      own behaviour (`ß`, `ç`, CJK, double spaces, idempotence) is owned and unit-tested by story
      0022 in `tests/Unit/Actions/NormalizeForSearchTest.php` (**D-12**); duplicating it would
      create a second specification of the fold that can drift from the first. What this story
      tests is that category name comparison *goes through* it — pinned end to end by the
      case-only and accent-only duplicate tests below.

**Feature — `tests/Feature/Models/ProductCategoryTest.php`** (mirrors `tests/Feature/Models/UserTest.php`)
- [x] A factory-created category's `id` is a UUID **v7** string (`Str::isUuid($id, 7)`), not an
      integer — proves `HasUuids` is actually wired, which is this app's usage rather than the
      trait's own correctness.
- [x] Two categories created in immediate succession sort lexicographically in creation order
      (`strcmp($first->id, $second->id) < 0`) — the same time-ordering assertion `UserTest` makes.
- [x] Creating and re-fetching a category persists `name` and populates both timestamps.
- [x] `name` is mass-assignable and nothing else is (guards against a future column being added to
      `#[Fillable]` by reflex).
- [x] The model does **not** use `SoftDeletes` — a regression guard on decision **D-3**, since
      adding the trait later silently changes what `Rule::unique()` and every future query see.

**Unit — `tests/Unit/ArchitectureTest.php` (extend the existing file)**
- [x] `arch()` assertion that `App\Models\ProductCategory` does not reference any blog-taxonomy
      class/namespace. Honest caveat: with no blog taxonomy in code yet this is a **scope fence
      expressed as a test**, not a behavioral assertion — it starts earning its keep the moment
      Epic 4 lands, and until then it documents the boundary in an executable place. See
      [Documented functional decisions](#documented-functional-decisions) D-11.

**Feature — `tests/Feature/ProductCategories/CreateProductCategoryTest.php`**
- [x] Creating with a valid name persists exactly one row with that name, and populates
      `created_at`/`updated_at`.
- [x] Creating with a blank name throws `ValidationException` on `name` and writes no row. Assert
      against the **action's own** validation (`expect(fn () => $action(''))->toThrow(...)` and
      inspect `->errors()['name']`) — there is no Livewire component in this story to assert
      through.
- [x] Creating with a **whitespace-only** name (`'   '`) is refused. This is the highest-value case
      in the story and it fails silently by default: Laravel's `required` treats a string of
      spaces as *present*, so with a bare `['required', 'string', 'max:100']` rule set a
      whitespace-only name validates and persists. The test proves the trim happens **before**
      validation, not after.
- [x] A name with leading/trailing whitespace is stored trimmed — assert the exact persisted
      value, not merely "no error". Without a trim, `'Footwear'` and `'  Footwear  '` are two rows
      that are indistinguishable to a human and do not collide as duplicates.
- [x] Length boundary **pair**: a name of exactly the maximum length is accepted, and one
      character over is refused (per `risk-based-testing.md`'s maximum-boundary question).
- [x] Creating a duplicate name is refused at the **validation** layer (`ValidationException`, not
      a `QueryException`).
- [x] A duplicate that bypasses validation (e.g. the action called directly with a colliding name
      under a simulated race) surfaces as a `ValidationException` on `name`, not a 500 — this is
      the test that proves the `23000` catch, and it must drive the collision through the real
      unique index rather than a hand-written assertion about the catch block. `Rule::unique()` is
      a pre-flight check, not a race guard — the rule
      [signed-link-verification.md](../../../docs/security/signed-link-verification.md#a-pre-flight-check-is-not-a-race-guard--re-check-under-a-lock-and-let-the-unique-index-have-the-last-word)
      already established for `pending_email`. The test asserts the *outcome* (a duplicate is
      refused cleanly, never as a 500), so it holds whichever way the action implements it.
- [x] Case-only-different duplicate: creating "footwear" alongside "Footwear" is refused **by
      validation** — asserting `ValidationException` on `name`, and **explicitly not** a
      `QueryException`. The exception *class* is the whole point of the test: MySQL's
      `utf8mb4_unicode_ci` index would also refuse this pair, so a test that only asserted "the
      second row was not created" would pass with the app-level comparison deleted. See **R-2** and
      **D-4**.
- [x] Accent-only-different duplicate: creating "Nino" alongside "Niño" is likewise refused **by
      validation** (same class assertion, same reason). This is the test that pins **D-4**'s "fold
      at least as aggressively as `utf8mb4_unicode_ci`" constraint — a normaliser folding case but
      not accents lets PHP accept this pair and hands the refusal to the index as a raw `23000`,
      which this test would catch as a wrong exception class.
      *(Corrected 2026-09-01 — both bullets previously required the assertion to "hold on both
      engines" and justified the second by SQLite CI accepting what MySQL rejects. There is one
      engine, MySQL, everywhere; the tests are kept unchanged in substance because they still catch
      a real regression — someone reverting `uniqueNormalisedName()` to a bare `Rule::unique()`, or
      dropping the accent fold — and the exception-class assertion is what makes them able to.)*

**Feature — `tests/Feature/ProductCategories/RenameProductCategoryTest.php`**
- [x] Renaming to a free name updates the row and leaves the old name unused.
- [x] Renaming onto another category's name is refused and the target keeps its original name.
- [x] Renaming a category to **its own current name** is accepted — the `Rule::unique()->ignore()`
      trap, and the single most likely bug in this story (it is precisely why
      `ProfileValidationRules::emailRules()` takes a nullable id). Write this as **three** tests,
      not one, so a rule that rejects everything cannot pass the first trivially: (a) the no-op
      rename to the identical name succeeds; (b) the category's row is genuinely unchanged
      afterwards; (c) a genuinely free name is still accepted, as the control.
- [x] The full validation depth (blank / whitespace-only / length boundary pair) is re-asserted on
      the **rename** path independently, not assumed symmetric with create. A `nameRules($id)`
      signature that forgets to thread `$id` through on one of the two paths is a real, silent bug
      class, and testing the trait once does not prove both call sites use it correctly.

**Feature — `tests/Feature/ProductCategories/DeleteProductCategoryTest.php`**
- [x] Deleting a category removes the row outright (`assertDatabaseMissing`, not
      `assertSoftDeleted`) — a hard delete, per **D-3**.
- [x] The freed name can immediately be reused by a new category (proves nothing lingers to hold
      the unique index, which is exactly what a soft delete would have broken).
- [x] Deleting an unknown or malformed-UUID category fails cleanly (`ModelNotFoundException` /
      404), not as a silent no-op — note `HasUuids`' `resolveRouteBindingQuery()` rejects a
      non-UUID parameter before querying.

**Feature — `tests/Feature/Policies/ProductCategoryPolicyTest.php`**
- [x] Every ability gets **both an allow and a deny test**, per
      [what-not-to-test.md](../../../docs/testing/qa/what-not-to-test.md)'s authorization rule: an
      actor holding the relevant `products.*` permission is allowed; an actor holding none is
      refused.
- [x] A `Super Admin` actor is allowed through `Gate::before`, consistent with every other policy
      in this repo.
- [x] The permission names are asserted against `RolePermissionSeeder`'s seeded catalog (the test
      seeds `RolePermissionSeeder` and calls `forgetCachedPermissions()` in `beforeEach`, as
      `tests/Feature/Users/CreateUserTest.php` does) — a permission string not in the catalog
      throws `PermissionDoesNotExist` at runtime, so this is a correctness test, not a style one.

**Explicitly not tested here**
- `HasUuids` itself, Eloquent timestamps, or `Rule::unique`'s own SQL — framework/vendor behaviour
  per [what-not-to-test.md](../../../docs/testing/qa/what-not-to-test.md).
- Migration `up()`/`down()` mechanics — `RefreshDatabase` proves every migration runs on every
  feature-test run; `down()` symmetry is a code-review concern.
- Anything about a category being "in use" by products — story 0024.

## Expected outcome
A `product_categories` table exists with a UUID v7 primary key and a unique `name`. A catalog
administrator's create / rename / delete operations are available as three invokable domain
actions with shared, trait-held name validation, and a `ProductCategoryPolicy` expresses who may
perform them. The product category catalog is a wholly separate table, model, action namespace and
policy from anything the blog will later introduce. Nothing is user-visible yet — the screen that
consumes these arrives in a later UI story, and the products that reference a category arrive in
0024.

## Acceptance criteria
- [x] `product_categories` exists with `id` (UUID v7 PK), `name` (unique), `created_at`,
      `updated_at` — and nothing else.
- [x] `App\Models\ProductCategory` uses `HasUuids`, exposes `name` as its only fillable attribute,
      and does **not** use `SoftDeletes`.
- [x] A category can be created with a valid name; blank, whitespace-only, over-length and
      duplicate names are all refused with a validation message on `name`.
- [x] A category can be renamed; renaming onto another category's name is refused, and saving a
      category under its own unchanged name is accepted.
- [x] A category can be deleted, the row is really gone, and its name becomes immediately
      reusable.
- [x] Authorization is expressed in `ProductCategoryPolicy` (not only in a future component), with
      both an allow and a deny test per ability.
- [x] Case-only and accent-only duplicates are refused **by validation** — a `ValidationException`
      on `name`, never a raw `QueryException`/500 from the `UNIQUE` index — and the fold behind that
      comparison is the shared `App\Actions\NormalizeForSearch` (**D-12**): no fold logic is inlined
      in `ProductCategoryValidationRules` or in the actions, and no second normaliser is added to
      the tree.
- [x] Product categories share no table, model, or namespace with any blog taxonomy.
- [x] No in-use/hard-block delete guard is implemented, and no permission-catalog, route, Livewire,
      view or `lang/` file is added by this story.

## Definition of Done
- [x] Tests written and green, plus the full existing suite (per
      [contracts.md](../../../docs/contracts.md)'s Full Test Suite Gate Rule).
- [x] `vendor/bin/pint --dirty --format agent` clean and Larastan level 7 passing.
- [x] Code reviewed (code-reviewer).
- [x] No security findings (appsec-auditor).
- [x] Documentation updated (docs-keeper): `docs/database/schema.md` gains a
      `product_categories` section and an ER-diagram entry; `docs/conventions/base-standards.md`'s
      UUID-PK subsection stops describing `User` as the only live example; ADR 0001's "still
      future" list drops Product Categories.
- [x] **Hand-off note recorded for the UI story and for 0024 — ✅ DISCHARGED 2026-09-03 by story
      0025.** Recorded in place with what it used to say, per this project's audit-authored-page
      convention: *"these actions perform **no authorization of their own** — matching
      `App\Actions\Users\CreateUser`/`UpdateUser`, where the caller (`App\Livewire\Users\Index`)
      calls `Gate::authorize()` first. Since this story ships no caller, `ProductCategoryPolicy` is
      created and tested but has **zero call sites** until the UI story wires it in. That story
      must (a) call `Gate::authorize()` before invoking every action, and (b) keep the id fed to
      `Rule::unique()->ignore()` server-authoritative (`#[Locked]` / re-read from the model), per
      [security/livewire-authorization.md](../../../docs/security/livewire-authorization.md)."*
      Both halves are closed: `CreateProductCategory`/`RenameProductCategory`/`DeleteProductCategory`
      each now authorize their own operation as their first statement (the actions self-authorize,
      not only the caller — a stricter shape than this note asked for, matching
      `App\Actions\Products\{Create,Update,Delete}Product`'s), and `App\Livewire\ProductCategories\Index`
      keeps `#[Locked] $editingCategoryId` assigned only from `$target->id`. `ProductCategoryPolicy`'s
      "zero call sites" is likewise false as of story 0025 — it is `App\Livewire\ProductCategories\Index`'s
      first and only caller, for all four abilities. See
      [docs/architecture/authorization.md](../../../docs/architecture/authorization.md#productcategorypolicy--the-fifth-policy-and-the-first-to-gain-its-call-site-in-a-later-story-than-the-one-that-created-it)
      and [docs/database/schema.md](../../../docs/database/schema.md#product_categories).
- [x] Acceptance criteria met.

## Documented functional decisions

- **D-1 — Domain artifacts only; no Livewire component, route or view.** Story 0004 (users
  backend) shipped a component alongside its actions because the component was the only planned
  consumer at the time. Here the UI is explicitly a separate later story, so building a screen now
  would either sit unrouted and untested end to end, or invent a route the product owner has not
  asked for. `app/Actions/Users/RequestEmailChange` / `ConfirmEmailChange` already establish that
  this repo ships domain actions whose HTTP/Livewire boundary arrives in a different unit of work.
- **D-2 — Three narrow actions, `Rename` not `Update`.** `CreateProductCategory`,
  `RenameProductCategory`, `DeleteProductCategory`, under `app/Actions/ProductCategories/`.
  "Rename" is the PRD's own verb and the entity has exactly one mutable field today; a generic
  `UpdateProductCategory` would generalize for fields that do not exist. This matches the repo's
  narrow-verb precedent (`RequestEmailChange`/`ConfirmEmailChange`, not `UpdateEmail`).
  `App\Actions\Users\UpdateUser` is deliberately *not* the model to copy — a `User` genuinely had
  four mutable fields from day one.
- **D-3 — Hard delete; `ProductCategory` does not use `SoftDeletes`.** `users` soft-deletes for
  reasons that do not generalize (identity retention, freeing an authentication identifier,
  relations that must survive). A lookup-table row has none of those. Three concrete costs of the
  other choice: (i) `Rule::unique()` does **not** apply the soft-delete scope (verified on `users`
  — see [schema.md](../../../docs/database/schema.md#soft-deletes)), so a trashed "Footwear" would
  squat its name forever unless every uniqueness check were made trashed-aware; (ii) `products`
  could reference a trashed parent in 0024, since `cascadeOnDelete()` never fires on a soft delete;
  (iii) 0024's guard is a *count-based gate that runs before the delete*, so it works identically
  against a hard delete — soft-delete buys it nothing. PRD assumption 17 rules out the
  audit/recycle-bin class of feature this phase, which is the only thing that would argue the
  other way.
- **D-4 — Name uniqueness is enforced in **two layers**: a normalised comparison in PHP as the
  primary guard, and a MySQL `UNIQUE` index as the defence-in-depth backstop.** *(Confirmed;
  resolves the former OQ-2.)* Two categories named "Footwear" is a data-integrity bug, and on a
  table of this size the index's write cost is negligible — but the index **should not be the
  primary guard here**, and that is the whole point of this decision.
  **Corrected 2026-09-01 (Phase 2 INVEST review):** this decision previously justified the split by
  claiming the suite runs on two engines (SQLite in CI, MySQL in production) so that a
  collation-backed rule "is literally a different rule in the two places". **That is false against
  `HEAD`** — `DB_CONNECTION=mysql` is pinned in `phpunit.xml`, `.env.example` and
  `.github/workflows/tests.yml` alike, so there is one engine everywhere; see the rewritten **R-2**
  and the amendment note at the end of this file. **The two-layer design is unchanged, on its own
  merits.** The real reason the index cannot be the primary guard is the *shape of its refusal*:
  `utf8mb4_unicode_ci` genuinely would reject a case- or accent-duplicate pair, but only as a raw
  `23000` `QueryException` — no field-level validation message, and a 500 if the catch is ever
  missed. The application-level check therefore normalises and compares explicitly in PHP so a
  duplicate is refused **cleanly, on the `name` field, before the database is ever asked**, and the
  `UNIQUE` index sits behind it purely as the last-word **race** guard for two concurrent creates
  that both pass validation — the same relationship
  [schema.md](../../../docs/database/schema.md#users) documents for `pending_email`, whose unique index
  is "the last-word guard behind the application checks". Both actions convert a `23000`
  `QueryException` into a `ValidationException` on `name`, the exact pattern
  [`CreateUser`](../../../app/Actions/Users/CreateUser.php) already uses for `email`.
  **Amended 2026-08-18 (D-12):** the PHP half of this decision is implemented by calling
  `App\Actions\NormalizeForSearch`, not by a helper this story writes. The rule D-4 states is
  unchanged — same two layers, same case- and accent-insensitive comparison, same
  `23000` → `ValidationException` conversion — only its implementation is now shared.
  **Consequence to implement knowingly:** for the two layers to agree, the PHP normalisation must
  fold **at least** as aggressively as `utf8mb4_unicode_ci` does — i.e. it folds both case *and*
  accents, so "Niño" and "Nino" are the same category name, refused by the application before the
  index ever sees them. Folding only case would let PHP accept a pair the MySQL index then rejects
  with a `23000`, which is exactly the raw, message-less refusal the PHP layer exists to prevent.
  This is forced by the column's own collation rather than by any cross-engine concern, and it is
  called out explicitly because an accent-folding catalog is a real product consequence for a
  Spanish-language store — Phase 2 should confirm it rather than discover it.
- **D-5 — `VARCHAR(255)` with `max:255`, matching this repo's existing name-like columns.**
  *(Confirmed; resolves the former OQ-3.)* `users.name` is `string()`/`max:255`, and — decisively —
  `users.email` is a `VARCHAR(255)` column that **already carries a `unique` index** in this schema,
  so a 1020-byte utf8mb4 unique key is a shape this project has accepted before and is comfortably
  inside InnoDB's 3072-byte limit under the DYNAMIC row format. Consistency with the existing
  precedent won over the narrower indexed 100.
  The earlier draft argued for 100 on the strength of
  [migrations.md](../../../docs/database/migrations.md#adding-a-column-to-an-existing-table)'s
  bare-`string()` warning; that rule is recorded here as **considered and not applied**, because its
  worked example is a 10-character *enum token* (`users.status`) whose ceiling is knowable from the
  value set, not a free-text human label with no natural maximum. The migration length and the
  validation `max:` must still stay in lockstep (**R-4**).
- **D-6 — No `slug`, no `sort_order`, no `description`, no FK.** None appear in PRD §2.2's
  scenarios or acceptance criteria for categories (contrast assumption 14, which names slug/SEO
  fields for *posts*). Ordering is `ORDER BY name` at query time; a stored `sort_order` is a cheap
  additive migration if manual drag-ordering is ever requested. A `slug` becomes necessary only if
  a public storefront route appears, or if Epic 5 needs a language-stable key once `name` becomes
  translatable.
- **D-7 — A plain `name` column now; Epic 5's translatable names are deferred, with the cost
  stated.** PRD assumption 14 puts category names in the Store Languages translation layer, but
  Epic 5 has its own Three Amigos pass and either shape it lands in (a
  `product_category_translations` child table, or a JSON column) needs its own migration
  regardless of what is built today. The foreseeable follow-up, written down so it is not a
  surprise: creating the translations table, backfilling one row per category into the default
  store locale, and **dropping this story's `unique('name')` index** — because uniqueness would
  then be per-locale on the child table, not global on the parent.
- **D-8 — Category CRUD gates on the already-seeded `products.*` permissions; no new module
  slug.** *(Confirmed in Phase 0 — this was never an open question and the earlier draft was wrong
  to reopen it.)* Product categories are a **product sub-resource**, so they inherit the Products
  module's permissions. `RolePermissionSeeder::MODULES` already contains `products`, so all four
  CRUD permissions exist today with zero seeder change, zero re-seed fallout, and zero impact on
  Epic 1's roles UI. PRD assumption 8 frames categories as part of the Products area, and nothing
  about category CRUD resembles the cross-cutting escalation risk that justified `roles.manage` /
  `roles.manage-administrators` sitting outside the module grid.
- **D-9 — `ProductCategoryPolicy` is created now even though it has no caller yet.**
  [security/livewire-authorization.md](../../../docs/security/livewire-authorization.md)'s rule is
  that a rule enforced only in a component is bypassed by every other call site of the action, so
  the policy is the right home for it regardless of which consumer arrives first. It is tested
  directly (`Gate::allows(...)`) rather than through a route, exactly as
  `tests/Feature/Policies/UserPolicyTest.php` does. The consequence is recorded as an explicit
  hand-off item in the Definition of Done rather than left implicit.
  **Recorded dissent (backend-qa):** QA's preference was to defer the policy entirely to the UI
  story and ship this one with *no* authorization surface, on the grounds that a policy with no
  call site cannot regress and that the permission slug might be renamed later anyway (OQ-1). The
  decision went the other way because the policy is independently testable today (it is a real
  allow/deny rule, not a stub), because deferring it would leave the actions looking
  self-protecting to the next reader, and because `what-not-to-test.md` requires every policy
  ability to carry both an allow and a deny test — which is only possible if the policy exists.
  Note the QA point that stands regardless: **the actions themselves do not self-authorize**, so
  the story genuinely ships no enforcement path, and that must read as a deliberate hand-off
  rather than an oversight. With **D-8** confirmed, the policy's permission strings are settled
  (`products.view` / `create` / `edit` / `delete`), so the "the slug might be renamed later" half
  of QA's objection no longer applies; the consumer that will call it is story **0025**.
- **D-10 — No in-use delete guard, and deliberately no Gherkin scenario for it.** At implementation
  time `products` does not exist, so no category can be in use and there is nothing to count. The
  guard, and the PRD scenario that describes it, belong to story 0024. `DeleteProductCategory`
  exists as its own file now precisely so 0024 extends that one file.
- **D-11 — Independence from the blog taxonomy is a structural scope fence, not a behavioral
  test.** With no blog taxonomy in code, "the product category list contains only product
  categories" cannot fail today. It is honoured by construction — own table, own model, own action
  namespace, own policy, no polymorphic taxonomy — and pinned with an `arch()` assertion in the
  existing `tests/Unit/ArchitectureTest.php`, which is the closest meaningful executable
  assertion and starts genuinely biting when Epic 4 lands.
- **D-12 — The app-level name fold is the project's shared `App\Actions\NormalizeForSearch`, not a
  helper this story owns. CONFIRMED 2026-08-18.** *(Amends the implementation half of **D-4**; the
  behaviour D-4 specifies is unchanged.)*
  **Why this was reopened after the story was already closed:** stories **0032** (shipping geography
  catalog) and **0033** (shipping zones) were amended in parallel on 2026-08-18 and independently
  arrived at the identical need — a case- **and** accent-insensitive comparison whose result must not
  depend on the connection collation. Their amendment surfaced the duplication: 0023 had invented its
  own application-level normalisation for the exact same class of problem, before a centralized
  utility existed, and 0033's **D-6** explicitly flagged that "0023 places its accent-folding helper
  inside `ProductCategoryValidationRules`" and "must consume the same utility". The centralized
  answer is 0022's **D13**: `App\Actions\NormalizeForSearch` — an invokable at
  `app/Actions/NormalizeForSearch.php`, `__invoke(string $value): string`, implemented as `trim` →
  `Str::lower` → `Str::ascii` → collapse whitespace. With this amendment, **0022, 0023, 0026, 0032,
  0033 and 0034 all share one normaliser**, so name-comparison behaviour is consistent everywhere
  this project searches or de-duplicates on a human-entered name.
  **What changes here:** `ProductCategoryValidationRules`' `uniqueNormalisedName()` folds by calling
  the shared utility (threaded in as a parameter, per the per-method action-injection convention),
  and `CreateProductCategory` / `RenameProductCategory` inject it. **What does not change:** the
  outcome — the same case- and accent-insensitive comparison, still authoritative over the
  collation — and **the MySQL `UNIQUE(name)` index backstop, which stays exactly as confirmed in
  D-4/RQ-2**, including the `23000` → `ValidationException` conversion in both actions.
  **The bug class this closes** is two implementations of "fold at least as aggressively as
  `utf8mb4_unicode_ci`" drifting apart *invisibly* — each side's tests stay green because each side
  is internally consistent, and nothing compares the two specifications against each other. One
  function means one specification, unit-tested once (0022's
  `tests/Unit/Actions/NormalizeForSearchTest.php`). *(Corrected 2026-09-01: this paragraph
  originally attributed the invisibility to SQLite reproducing neither engine's folding in CI. There
  is one engine — MySQL — everywhere; the drift risk is between the two **PHP** implementations, and
  it is real without any cross-engine story. See **R-2** and the amendment note at the end.)*
  **Two obligations that follow.** (i) `Str::lower()` or `Str::ascii()` appearing anywhere in this
  story's validation trait or actions is a review finding — no second copy, no wrapper, no local
  override. (ii) A change to the normaliser is a **cross-story event**: it re-specifies category
  uniqueness here *and* is a re-seed event for `geography_entries.normalized_name` (0032 **D-N1**),
  so it is an amendment to 0022's D13 rather than a local edit.

### Scope fences: what this story must NOT do
- No in-use / hard-block-with-count delete guard (story **0024b**, split out of story 0024 on 2026-09-01).
- No `products` table, no `product_category_id` column, no FK, no relationship method.
- No new permission module slug and no `RolePermissionSeeder` change.
- No Livewire component, route, or Blade view.
- No `lang/en|es/*.php` file (no UI copy is owned here; core `validation.php` messages suffice).
- No slug, sort order, description, translations table, or any other i18n scaffolding.
- No second text normaliser, and no local fold helper: `App\Actions\NormalizeForSearch` is consumed
  as-is and is neither created nor modified here (**D-12**; it is owned by story 0022).

## Dependencies, risks and resolved questions

### Dependencies
- **None inside Epic 2** for its schema, model, actions or policy. This is still the foundational
  story other Epic 2 product stories build on.
- **One shared class it consumes: `App\Actions\NormalizeForSearch`, owned by story 0022**
  (**D-12**, added 2026-08-18). This is a *file*-level dependency, not a design one — nothing about
  this story's schema or behaviour waits on 0022's widget. **Sequencing point for Phase 2 to
  settle, flagged rather than decided here:** 0022 creates the class and its unit test, but 0023
  carries the lower id, so if 0023 is implemented first, whoever picks it up needs an explicit
  instruction on whether to (a) create `app/Actions/NormalizeForSearch.php` plus
  `tests/Unit/Actions/NormalizeForSearchTest.php` to 0022's D13 spec verbatim and have 0022 then
  merely consume them, or (b) implement 0022 first. Either way the invariant is the same and
  non-negotiable: **exactly one normaliser exists in the tree**, matching D13's four steps.
- Depends only on what is already shipped: `spatie/laravel-permission` wired to `User` with the
  seeded catalog (story 0002), the `Gate::before` Super Admin bypass, and the policy
  auto-discovery convention (story 0004).
- **Story 0024 (products-core-crud-backend) depends on this one** and is the story that adds
  `products.product_category_id` and retrofits the hard-block-with-count guard onto
  `DeleteProductCategory`. Per [workflow.md](../../../docs/workflow.md#task-ordering-rule)'s task
  ordering rule, this story's lower id is deliberate.
- **Story 0025 (`product-categories-ui`)** is the dedicated management screen that consumes the
  actions and the policy built here — confirmed in Phase 0 as a screen of its own, not merely an
  inline create-on-the-fly control inside the product editor. It is the story that gives
  `ProductCategoryPolicy` its first call site (**D-9**).

### Risks
- **R-1 — The `Rule::unique()->ignore()` omission.** The single most likely bug: without it, saving
  a category under its own unchanged name fails. Caught by the dedicated rename-to-own-name test.
- **R-2 — A collation-backed uniqueness rule refuses a duplicate with a raw `23000`, not a
  validation message. There is exactly one engine everywhere, and that is what this risk is really
  about.**
  **Corrected 2026-09-01 (Phase 2 INVEST review) — see the amendment note at the end of this file.**
  As originally written, this risk claimed the suite runs on **two different engines** (SQLite in
  CI, MySQL locally and in production) because `phpunit.xml` pinned `DB_DATABASE` but not
  `DB_CONNECTION`, and `.env.example` defaulted to `sqlite`. **That is false against `HEAD`**, and
  was verified false at Phase 2 by reading the three files it named:
  `phpunit.xml` line 29 is `<env name="DB_CONNECTION" value="mysql"/>`; `.env.example` line 28 is
  `DB_CONNECTION=mysql`, under a comment reading *"never SQLite"*; and
  `.github/workflows/tests.yml` line 42 sets a job-level `DB_CONNECTION: mysql` against a
  `mysql` service container. **One engine, everywhere: MySQL, `utf8mb4_unicode_ci`** (per
  `config/database.php`). This story was debated on 2026-08-17/18 and the environment has changed
  under it since; that is the [deferred-findings failure mode](../../../docs/errors-log.md#a-deferred-storys-findings-were-claims-about-a-tree-that-no-longer-existed-and-one-of-them-would-have-reopened-a-bug-in-this-log--2026-08-23)
  this project already records — a claim about a tree, outliving the tree.
  **The real risk, which survives the correction and still justifies two layers.**
  `utf8mb4_unicode_ci` is case- **and** accent-insensitive, so the `UNIQUE(name)` index really does
  refuse "footwear" alongside "Footwear", and "Nino" alongside "Niño" (a live consequence for a
  Spanish-language catalog — see **D-4**). But the *only* thing an index-only rule can produce is a
  `QueryException` with SQLSTATE `23000`: **no `ValidationException`, no message bound to the `name`
  field, and — if the catch is ever missed — a 500 rather than a form error.** That is a bad
  administrator experience and a fragile contract, not a data-integrity hole. So the layering is:
  the **PHP-level normalised comparison is the primary guard**, because it is the only layer that
  can refuse a duplicate *cleanly*, with a field-level message, before the database is ever asked;
  the **`UNIQUE` index remains purely as a race-condition backstop** for two concurrent creates that
  both pass validation, exactly the relationship
  [schema.md](../../../docs/database/schema.md#users) documents for `pending_email`, whose unique index
  is "the last-word guard behind the application checks".
  **The residual risk, unchanged and still worth naming:** the PHP normalisation must fold **at
  least** as aggressively as `utf8mb4_unicode_ci`, or a pair PHP accepts gets rejected by the index
  as a `23000` — the ugly path the PHP layer exists to avoid. A test asserting that an
  accent-differing pair is refused *by validation* (`ValidationException`, not `QueryException`) is
  what pins this, and it is a meaningful test on MySQL: it distinguishes "the app refused it" from
  "the database refused it", which is precisely the property under test.
  **Further reduced 2026-08-18 (D-12):** the fold is the single shared
  `App\Actions\NormalizeForSearch` rather than a helper local to this story, so there is one
  specification of "folds at least as aggressively as `utf8mb4_unicode_ci`" to get right and one
  unit test pinning it, instead of one copy per consuming story drifting apart.
- **R-3 — ✅ CLOSED 2026-09-03 by story 0025.** Recorded in place with what it used to say: *"The
  policy has no call site. Nothing in this story can regress if the policy is wrong, because
  nothing calls it. Mitigated by direct `Gate::allows()` tests and the explicit DoD hand-off note;
  the residual risk is that the UI story invokes the actions without authorizing first."* Story
  0025's `App\Livewire\ProductCategories\Index` is now `ProductCategoryPolicy`'s first and only
  caller, and the residual risk named here did not materialise: the actions self-authorize (not
  only the UI story's own component), so an actions-level authorization test now exists alongside
  the component-level ones — see
  [docs/architecture/authorization.md](../../../docs/architecture/authorization.md#productcategorypolicy--the-fifth-policy-and-the-first-to-gain-its-call-site-in-a-later-story-than-the-one-that-created-it).
- **R-4 — The migration length and the validation `max:` drifting apart.** Both are 255 today
  (**D-5**); if either moves without the other, a validation refusal becomes a truncation or a
  `22001` database error. Caught by the length-boundary pair only if that test's boundary is
  derived from the same constant — keep them adjacent and cross-referenced.
- **R-5 — Faker uniqueness is not database uniqueness.** `fake()->unique()` guards within a Faker
  instance, not against a literal name a test seeded itself. Any test needing a distinct name
  passes it explicitly.
- **R-6 — Whitespace slipping through `required`.** Laravel's `required` treats `'   '` as
  present, so without an explicit trim a whitespace-only category persists, and `'Footwear'` /
  `'  Footwear  '` become two rows that look identical to a human and do not collide as
  duplicates. QA rated this the highest-value case in the story alongside R-1. Caught by the
  whitespace-only and the trim-on-store tests, both of which assert the exact persisted value
  rather than merely "no error".
- **R-7 — `nameRules()` reused asymmetrically.** A nullable-id rule helper whose `$id` is threaded
  through on one call path but not the other fails silently in only one direction. Caught by
  re-asserting the full validation depth on the rename path independently, rather than assuming
  symmetry with create.

### Resolved questions

All four questions raised during the debate were resolved before Phase 2. Recorded here with the
confirmed answer, so a later reader sees what was decided and why the alternatives were dropped.

- **RQ-1 (was OQ-1) — Which permission gates product category CRUD? → the seeded `products.*`
  module.** Product categories are a **product sub-resource** and inherit the Products module's
  permissions. No new module slug, no `RolePermissionSeeder` change. This was settled in Phase 0
  rather than being genuinely open. Implemented by **D-8**; the policy's four abilities map to
  `products.view` / `products.create` / `products.edit` / `products.delete`.

- **RQ-2 (was OQ-2) — How is name uniqueness enforced? → both layers: a normalised comparison in
  PHP as the primary guard, plus the MySQL `UNIQUE` index as defence in depth.**
  **Corrected 2026-09-01 (Phase 2 INVEST review):** this question was originally phrased *"given CI
  runs SQLite and production runs MySQL"*, and answered on the grounds that an index-only rule "is a
  different rule in each environment". **That premise is false against `HEAD`** — `DB_CONNECTION`
  is pinned to `mysql` in `phpunit.xml`, `.env.example` and `.github/workflows/tests.yml`, so tests,
  local development and production all run one engine on `utf8mb4_unicode_ci`; see the rewritten
  **R-2**. **The answer is unchanged, for a reason that still holds.** The application-level check
  is authoritative because it is the only layer that can refuse a duplicate as a
  **`ValidationException` on the `name` field**: the `UNIQUE` index *would* catch a case- or
  accent-duplicate (the collation is case- and accent-insensitive), but only as a raw `23000`
  `QueryException` — no field-level message, and a 500 if the catch is ever missed. Comparing
  normalised values in PHP puts the refusal in the form where the administrator can act on it; the
  index then sits behind it as the last-word **race** guard for two concurrent creates that both
  pass validation, the same relationship
  [schema.md](../../../docs/database/schema.md#users) documents for `pending_email`. Implemented by
  **D-4**, with its one implementation constraint spelled out there: the PHP normalisation must
  fold at least as aggressively as `utf8mb4_unicode_ci` (case **and** accents), or MySQL will
  reject with a `23000` a pair PHP just accepted.
  Dropped alternatives: relying on the collation alone (correct on data integrity, unacceptable as
  UX — a raw `23000` is not a form error), and adding an accent-sensitive column collation such as
  `utf8mb4_0900_as_ci` (would make the index disagree with the app-level rule rather than back it
  up).
  **Amended 2026-08-18 by D-12:** the answer itself stands unchanged — two layers, PHP primary,
  `UNIQUE` index as backstop. Only *where the PHP fold lives* moved: it is now the shared
  `App\Actions\NormalizeForSearch` rather than a helper this story writes.

- **RQ-3 (was OQ-3) — Maximum product category name length? → 255**, matching this repo's existing
  name-like columns rather than a narrower indexed 100. `users.email` is already a `VARCHAR(255)`
  carrying a `unique` index here, so the resulting 1020-byte utf8mb4 key is a shape this schema has
  accepted before. Implemented by **D-5**, which also records why
  [migrations.md](../../../docs/database/migrations.md#adding-a-column-to-an-existing-table)'s
  bare-`string()` warning was considered and not applied.

- **RQ-4 (was OQ-4) — Who owns the product category management screen? → story 0025
  (`product-categories-ui`)**, a dedicated screen, not an inline-only control in the product
  editor. Settled in Phase 0. Nothing in *this* story's code changes as a result; what it fixes is
  the hand-off — 0025 is the story that gives `ProductCategoryPolicy` its first call site and must
  carry the `Gate::authorize()` and `#[Locked]` obligations listed in the Definition of Done.

## Provenance
Phase 1 (Three Amigos) debate run on 2026-08-17 with `backend-expert` (files and approach),
`database-expert` (schema, index and soft-delete decisions) and `backend-qa` (test design), per
[workflow.md](../../../docs/workflow.md#phase-1--three-amigos-debate). Derived from
[PRD](../../../docs/PRD/PRD.md#22-products) §2.2's "Product categories (extends the prototype)"
Gherkin block and assumptions 8, 14, 17 and 19. The `products`-does-not-exist-yet scoping and the
0024 hand-off of the in-use delete guard are a confirmed Phase 0 decomposition decision, recorded
here so the missing guard is never read as an oversight.

All three amigos' contributions are reflected above, including one **recorded dissent** (D-9,
where authorization lives) and one finding this file originally recorded as verified independently
against `phpunit.xml`, `.env.example` and `.github/workflows/tests.yml`: *"the test suite runs on
SQLite in CI and MySQL locally, because `phpunit.xml` pins `DB_DATABASE` but not `DB_CONNECTION`"*.
**That finding is false against `HEAD` and is corrected throughout this file** — one engine, MySQL,
everywhere. The sentence is left standing as the record of what the debate asserted; the correction,
what each of the three files actually says, and why the two-layer design survives it regardless are
in **R-2** and in the amendment note directly below.

**Amended 2026-08-18 — D-12 (shared text normaliser).** After this story was written and closed,
the parallel Phase 1 amendments to stories **0032** (shipping geography catalog) and **0033**
(shipping zones) reached the same case/accent-insensitive comparison requirement from their own
direction and surfaced that 0023 had independently invented an equivalent app-level normalisation
before a centralized utility existed. 0033's **D-6** named the obligation explicitly, and 0022's
**D13** provides the utility. 0023 therefore now consumes `App\Actions\NormalizeForSearch` — the
same normaliser as 0022, 0026, 0032, 0033 and 0034 — so this project's search and uniqueness
features compare human-entered names identically everywhere. **Behaviour is unchanged; the MySQL
`UNIQUE(name)` backstop confirmed in D-4/RQ-2 is untouched.** Full statement in **D-12**; the
touched sections are the validation-trait and actions snippets, the unit-test list, D-4, R-2, RQ-2,
the acceptance criteria and the scope fences.

**All four open questions were resolved on 2026-08-18** and are recorded above as RQ-1…RQ-4, with
the decisions they drive folded into D-4, D-5, D-8 and D-9, the migration and trait snippets, the
test list, and R-2/R-4. Nothing in this story is blocked on a product decision any more.

**Amended 2026-09-01 — the two-engine premise behind R-2 / RQ-2 / D-4 / D-12 was false, and is
corrected in place.** Phase 2 (`code-reviewer` INVEST validation) ran on 2026-08-31/2026-09-01 and
**FAILED** this story on exactly one blocking finding, verified against this worktree's real files.

**What was wrong.** The story's central technical justification for its two-layer name-uniqueness
design claimed the test suite runs on **two different database engines** — SQLite in CI, MySQL
locally and in production — citing `phpunit.xml` as pinning `DB_DATABASE` but not `DB_CONNECTION`,
and `.env.example` as defaulting to `DB_CONNECTION=sqlite`. Re-read at Phase 2, all three cited
files say the opposite:

| File | Line | Actual content |
| --- | --- | --- |
| `phpunit.xml` | 29 | `<env name="DB_CONNECTION" value="mysql"/>` — **it is pinned** |
| `.env.example` | 28 | `DB_CONNECTION=mysql`, under a comment reading *"never SQLite"* |
| `.github/workflows/tests.yml` | 42 | job-level `DB_CONNECTION: mysql`, against a `mysql` service |

So there is **one engine everywhere** — MySQL on `utf8mb4_unicode_ci` — not two, and every sentence
in this file that reasoned from a CI/local split was reasoning from something that is not true.

**Why it happened, and why it is not a normal staleness.** This story was debated on 2026-08-17/18,
and the claim may well have held then; the environment has been changed by other work since. That is
precisely the [deferred-story failure mode](../../../docs/errors-log.md#a-deferred-storys-findings-were-claims-about-a-tree-that-no-longer-existed-and-one-of-them-would-have-reopened-a-bug-in-this-log--2026-08-23)
this project already records — *a finding is a claim about a tree, and the task file freezes while
the tree does not* — with the aggravating detail that the claim was written up as
**verified against three named files**, which is the hedge shape
[the 2026-08-29 entry](../../../docs/errors-log.md#one-docs-pass-reported-two-gaps-that-were-not-there-both-marked-verified--2026-08-29)
identifies as making a false claim *more* trusted rather than less.

**What changed, and what deliberately did not.** **No shipped behaviour changes.** The two-layer
design stands exactly as specified — the PHP-level normalised comparison via the shared
`App\Actions\NormalizeForSearch` (**D-12**), **plus** the MySQL `UNIQUE(name)` index with its
`23000` → `ValidationException` conversion in both actions — but it is now justified on the ground
that actually holds: `utf8mb4_unicode_ci` alone refuses a case/accent duplicate only as a **raw
`23000` with no field-level message** (and a 500 if the catch is ever missed), so the PHP pre-check
exists to surface a clean validation error before the database is ever asked, and the index remains
**purely a race-condition backstop**. Rewritten in place, each carrying its own dated correction
rather than being silently overwritten: **R-2**, **RQ-2**, **D-4** (both halves), **D-12**'s
bug-class paragraph, the `nameRules()` code comment in *Files to create/modify*, the two duplicate
tests under *Tests to perform*, the case/accent acceptance criterion, and the Provenance paragraph
above. **The tests are kept, not removed** — they still catch a real regression (someone reverting
`uniqueNormalisedName()` to a bare `Rule::unique()`, or dropping the accent fold) — with their
assertions sharpened from "on both engines" to the **exception class**, `ValidationException` on
`name` and never a `QueryException`, which is what distinguishes "the app refused it" from "the
database refused it" now that both layers really do refuse.

**Still open for Phase 2's re-run, unchanged by this correction:** **D-4**'s product-visible
consequence that the PHP normalisation folds accents as well as case, so "Niño" and "Nino" cannot
coexist as two categories. It follows from the column's own `utf8mb4_unicode_ci` collation rather
than from any cross-engine argument, but it remains a real outcome for a Spanish-language catalog
and deserves a deliberate confirmation rather than being inherited from a technical constraint.
Two minor `code-reviewer` notes were left unaddressed by this pass and are not blocking.

## Closure record — 2026-09-01 (Phase 7, `product-owner`)

**All seven phases passed. Every acceptance criterion and Definition of Done item above is checked
off against verified, shipped artifacts** — not against the plan: the migration
(`2026_09_01_084836_create_product_categories_table.php`, `uuid` PK + `string('name')->unique()` +
`timestamps()` and nothing else), `App\Models\ProductCategory` (`HasUuids`, `#[Fillable(['name'])]`,
**no** `SoftDeletes`), the three `app/Actions/ProductCategories/` actions, the
`ProductCategoryValidationRules` trait (whose `uniqueNormalisedName()` folds through the shared
`App\Actions\NormalizeForSearch` — **D-12** verified by grep: no `Str::lower()`/`Str::ascii()` in
this story's trait or actions), `App\Policies\ProductCategoryPolicy`, the factory, and the four test
files plus the extended `tests/Unit/ArchitectureTest.php`. Re-run at closure:
**42 passed, 104 assertions**. The scope fences held — `git status` confirms **no** change to
`database/seeders/`, `routes/`, `app/Livewire/`, `resources/views/` or `lang/`.

- **Phase 2 (INVEST): passed after one blocking correction**, recorded in full in the
  2026-09-01 amendment note above. The story's own central technical justification claimed the suite
  ran on **two** database engines (SQLite in CI, MySQL locally); re-reading the three files it cited
  showed `DB_CONNECTION=mysql` pinned in all three, so there is one engine everywhere. **No shipped
  behaviour changed** — the two-layer name-uniqueness design stands on the ground that actually
  holds (the index alone can only refuse with a raw `23000`, never a field-level
  `ValidationException`), and the case/accent tests were kept with their assertions sharpened from
  "holds on both engines" to the **exception class**. This is the
  [deferred-story failure mode](../../../docs/errors-log.md#a-deferred-storys-findings-were-claims-about-a-tree-that-no-longer-existed-and-one-of-them-would-have-reopened-a-bug-in-this-log--2026-08-23)
  caught by the phase designed to catch it.
- **Phase 3 (TDD): green.** Migration, model, factory, validation trait, three actions, policy, plus
  40 new tests.
- **Phase 4 (`appsec-auditor`): PASS, no findings.** Three informational notes recorded for later
  stories (all concerning the deliberate no-authorization hand-off to 0025).
- **Phase 5 (`code-reviewer`): PASS**, after one blocking Larastan level 7 finding and two
  low-severity test-comment/assertion nits were fixed.
- **Phase 6 (`docs-keeper`): complete.** `docs/database/schema.md` (new `product_categories`
  section), `docs/conventions/base-standards.md`, `docs/decisions/0001-uuid-primary-keys.md`
  (Amendment 2), `docs/README.md`, and `docs/architecture/authorization.md` — the last only because
  a fifth policy falsified two existing "four policies" counts. **No `docs/errors-log.md` entry**:
  evaluated against that log's own bar ("only entries that produced a lasting convention") and
  explicitly rejected.

**The two failing browser tests in Phase 5's full-suite run do not block closure, and this is the
record of why.** That run was **1185 tests / 1180 passed / 3 skipped / 2 failed**, the two being
`tests/Browser/Components/WysiwygEditorTest.php` and `tests/Browser/Media/GalleryTest.php` — both
**pre-existing and unrelated**, independently confirmed by the reviewer to reproduce in isolation on
a tree with none of this story's changes applied. Story 0023 touches **no** JS, Livewire component,
route, Blade view or browser-test file at all (verified against `git status`, above), so it has no
mechanism by which to affect either. Both belong to stories 0020 and 0021 and are already documented
as honestly-flaky in
[testing/frontend/playwright-setup.md](../../../docs/testing/frontend/playwright-setup.md).

**Two things this story deliberately handed off rather than closed — both now discharged, and
recorded here as closed rather than left reading as still-open.** Quoted in full first, per this
project's audit-authored-page convention: *"the three actions perform **no authorization of their
own**, and `ProductCategoryPolicy` therefore ships with **zero call sites** until story **0025**
(`product-categories-ui`) wires in `Gate::authorize()` before every action call and keeps the id fed
to the `->ignore()` branch server-authoritative (**D-9**, and the Definition of Done's hand-off
item); and the in-use hard-block delete guard belongs to story **0024**, which extends
`DeleteProductCategory` rather than introducing that rule anywhere new (**D-10**)."* **✅ Both
closed as of 2026-09-03.** The delete guard shipped as story **0024b** (split out of 0024 on
2026-09-01, not 0024 itself — see that story's own file for the mechanism). The authorization
hand-off closed with story **0025**: all three actions now self-authorize, `App\Livewire\ProductCategories\Index`
is `ProductCategoryPolicy`'s first and only caller for all four abilities, and `#[Locked] $editingCategoryId`
is assigned only from `$target->id`, exactly as D-9 specified. See
[docs/architecture/authorization.md](../../../docs/architecture/authorization.md#productcategorypolicy--the-fifth-policy-and-the-first-to-gain-its-call-site-in-a-later-story-than-the-one-that-created-it).
