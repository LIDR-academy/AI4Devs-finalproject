# [0076] Translatable content retrofit — Products backend

## Description
Applies story [0070](0070-translatable-content-mechanism-product-categories-backend.md)'s per-store-language translatable-content mechanism to **Products** ([PRD Epic 5, Layer 2](../../docs/PRD/PRD.md#epic-5--internationalization); [assumption 14](../../docs/PRD/PRD.md#assumptions--confirmed-decisions) names *"product title/description"* and *"slug/SEO fields … on products"* as translatable content). Story [0024](done/0024-products-core-crud-backend.md)'s `products.name` and `products.description` move to a `product_translations` child table, one row per `(product, store language)`, and the **slug/SEO fields arrive for the first time — created directly on that child table, never on the parent.**

**This story consumes a recipe; it does not write one.** `App\Concerns\HasTranslations`, `App\Actions\Translations\SetTranslation` and `StoreLanguage::defaultStoreLanguage()` are 0070's and are used **unmodified**.

> **Read this before anything else: this is the recipe's hardest application, and six things genuinely do not port from the three single-field siblings.** Each is a decision below rather than a silent carry-forward.
>
> 1. **There is no uniqueness to re-scope.** 0070's recipe step 4 (*"re-scope the entity's existing uniqueness by `store_language_id`"*) is a **no-op for `name`** — `products.name` has never carried a unique index or a `Rule::unique()`, and inventing one here would be a business rule the PRD never asked for (**D-4**).
> 2. **Three of the five translatable columns are new**, not retrofitted. `slug`, `meta_title` and `meta_description` have no parent version to move, which changes the backfill, the signatures and the drop migration (**D-5**, **D-9**, **D-18**).
> 3. **The action signatures widen, they do not merely narrow in meaning** — the opposite of every sibling, and for the reason above (**D-18**).
> 4. **This is the first multi-field translation table**, so 0070's **D-5** (fallback resolves per *field*, not per row) stops being an untestable claim and becomes this story's to prove (**D-3**).
> 5. **`description` carries sanitized HTML**, and the retrofit puts the deliberately sanitizer-free `SetTranslation` in front of the column whose safety 0024's **D-16** guarantees on the grounds that *"the actions are the only way a description reaches the column"* (**D-8** — the story's primary design decision).
> 6. ⚠️ **SUPERSEDED 2026-09-01 — see the warning on D-16.** This read: *"The only `Gate` check in the whole write path lives in a component that does not exist yet.* 0024's **D-15**, confirmed by the coordinator at its **RQ-10**, deliberately keeps `CreateProduct` / `UpdateProduct` un-self-authorizing …*must not be "fixed" by a false parallel to them."* [0024](done/0024-products-core-crud-backend.md) **reversed** D-15/RQ-10 at its split (its **C-1**), so those actions now self-authorize and Products is **no longer** structurally different from the taxonomy siblings. The residual is smaller and still real: 0070's **D-9** `SetTranslation` authorizes nothing, so *that* entry point is the gap this story widens.

> **Neither the parent nor the mechanism exists in code. Verified against the live tree at authoring time:** `app/Models/` holds only `User`, `Role`, `SalesRegion`, `Media`; `app/Actions/` holds only `Auth/`, `Fortify/`, `Media/`, `Roles/`, `SalesRegions/`, `Users/`; `app/Concerns/` holds six `*ValidationRules` traits and no `HasTranslations`; `database/migrations/` ends at `create_media_table` — there is no `products`, no `product_categories`, no `store_languages`. There is **no `vendor/` directory**, so nothing here could be settled by executing Laravel code.
>
> **Stories 0024 (`products`), 0068 (`store_languages`) and 0070 (the mechanism) are all Phase 1 files, not shipped code.** Everything below is designed against their *specified* shape. **Phase 3 must re-verify every signature named here against `HEAD` before writing a line of code** — the [deferred-findings failure mode](../../docs/errors-log.md#a-deferred-storys-findings-were-claims-about-a-tree-that-no-longer-existed-and-one-of-them-would-have-reopened-a-bug-in-this-log--2026-08-23) this project records once, and which applies three times over here (**R-12**).

## Type
backend | includes database-expert: **yes** (one new table, two migrations including a data backfill, one retrofit of an existing table)

## 1. Refined user story

> **As** a catalog administrator running a store that sells in more than one language,
> **I want** each product's title, description and slug/SEO fields to be stored and resolved per store language, falling back to the store default when a translation is missing,
> **so that** the catalog reads correctly in every language the store authors in, and a partially-translated catalog degrades gracefully instead of rendering blank or failing.

> **As** the engineer applying story 0070's recipe to its first genuinely multi-field entity,
> **I want** per-field fallback proven against real fields rather than a synthetic fixture, and the one write path that bypasses the description sanitizer closed before the caller that would exploit it is built,
> **so that** the mechanism is safe for the language-tab UI story that has not been written yet, rather than safe only because nobody has written it.

**Scope fence — this story ships no screen.** No Livewire component, no Blade view, no route, no language tabs, no `config/modules.php` entry. The per-language tabs PRD Epic 5 describes belong to a UI story; 0070's **Q3** raises which one and it is still open — and **R-1** records that for Products that story is a materially larger lift than any sibling's.

## Gherkin — 2. Detailed acceptance criteria (Given/When/Then)

Every scenario opens with a named business-role actor and carries exactly one `When`, per [gherkin-guidelines.md](../../docs/testing/frontend/gherkin-guidelines.md) rules 1 and 3. The actor is **"a catalog administrator"**, taken from 0024's own scenarios.

```gherkin
Feature: Per-store-language product content

  # --- Resolution and fallback ---

  Scenario: A catalog administrator reads a product translated into the requested language
    Given a catalog administrator, with a product titled "Zapatillas Running" in Spanish and "Chaussures de course" in French
    When the product's French title is requested
    Then "Chaussures de course" is returned

  Scenario: A missing translation falls back to the default store language
    Given a catalog administrator, with a product titled "Zapatillas Running" in the default store language and no French translation
    When the product's French title is requested
    Then "Zapatillas Running" is returned, because the store default supplies the fallback

  Scenario: A product translated in neither the requested nor the default language resolves to nothing
    Given a catalog administrator, with a product holding no translation in any store language
    When the product's French title is requested
    Then no title is returned and no error is raised

  # --- Per-field fallback: the property three single-field siblings could not prove ---

  Scenario: A half-translated product keeps its translated fields and falls back only on the rest
    Given a catalog administrator, with a product whose French title and slug are present and whose French description and meta title are absent
    When the product's French description is requested
    Then the store default's description is returned
    And the French title and slug are still the ones returned for those fields

  Scenario: A product's title falls back without dragging its description with it
    Given a catalog administrator, with a product whose French description is present and whose French title is absent
    When the product's French title is requested
    Then the store default's title is returned
    And the French description is still the one returned for the description

  Scenario: A field emptied rather than left unwritten still falls back
    Given a catalog administrator, with a product whose French description was saved as an empty value
    When the product's French description is requested
    Then the store default's description is returned

  # --- Store-language lifecycle ---

  Scenario: A translation authored in a removed store language is still readable
    Given a catalog administrator, with a product translated into French and French since removed as a store language
    When the product's French title is requested
    Then "Chaussures de course" is returned, because removal preserves stored content

  Scenario: A catalog translated only into the previous default renders no title after a default change
    Given a catalog administrator, with a product titled only in Spanish and Spanish as the store default
    When a store administrator makes French the store default
    Then the product's French title resolves to nothing and no error is raised

  # --- Writing a translation ---

  Scenario: A catalog administrator translates a product into an additional language
    Given a catalog administrator holding the products edit permission, and French active as a store language
    When they set the product's French title to "Chaussures de course"
    Then the French translation is stored alongside the existing Spanish one

  Scenario: Re-translating a product replaces its existing translation for that language
    Given a catalog administrator, with a product already titled "Chaussures de course" in French
    When they set the product's French title to "Souliers de sport"
    Then the French translation reads "Souliers de sport" and no second French row is created

  Scenario: Creating a product stores its title in the default store language
    Given a catalog administrator holding the products create permission
    When they create a product titled "Zapatillas Running"
    Then the product holds exactly one translation, in the default store language

  Scenario: A blank title is refused
    Given a catalog administrator holding the products edit permission
    When they set a product's French title to a blank value
    Then the change is refused with a validation message and no translation row is written

  # --- Description HTML stays sanitized on every language path ---

  Scenario: A description saved in the default store language is stored sanitized
    Given a catalog administrator holding the products edit permission
    When they save a product description containing a script tag
    Then the stored description holds no script tag

  Scenario: A description saved in a non-default store language is stored sanitized
    Given a catalog administrator holding the products edit permission, and French active as a store language
    When they save a French product description containing a script tag
    Then the stored French description holds no script tag

  Scenario: A product without a description translates without one
    Given a catalog administrator, with a product carrying no description
    When the product's French description is requested
    Then no description is returned and no error is raised

  # --- Titles are deliberately NOT unique ---

  Scenario: Two products may share a title within one store language
    Given a catalog administrator, with a product titled "Camiseta básica" in Spanish
    When they title another product "Camiseta básica" in Spanish
    Then the change is accepted, because a product title carries no uniqueness rule

  # --- The slug ---

  Scenario: A slug is stored in its canonical form
    Given a catalog administrator holding the products edit permission
    When they save a product's French slug as "  Chaussures De Course  "
    Then the stored slug reads "chaussures-de-course"

  Scenario: A product may be saved without a slug
    Given a catalog administrator holding the products edit permission
    When they save a product leaving its French slug empty
    Then the change is accepted, because no storefront resolves a product by slug this phase

  Scenario: Two products cannot share a slug within one store language
    Given a catalog administrator, with a product whose French slug is "chaussures-de-course"
    When they set another product's French slug to "chaussures-de-course"
    Then the change is refused with a validation message

  Scenario: The same slug in two different store languages is permitted
    Given a catalog administrator, with a product whose French slug is "chaussures-de-course"
    When they set another product's Spanish slug to "chaussures-de-course"
    Then the change is accepted, because slug uniqueness is scoped to one store language

  Scenario: A product keeps its own slug when re-saved in the same language
    Given a catalog administrator, with a product whose French slug is "chaussures-de-course"
    When they save that same product's French slug as "chaussures-de-course" again
    Then the change is accepted rather than refused as a duplicate

  # --- Deletion ---

  Scenario: Deleting a product removes every language's content with it
    Given a catalog administrator, with a product translated into three store languages
    When they delete that product
    Then all three of its stored translations are removed with it

  # --- Authorization ---

  Scenario: An administrator without the products edit permission cannot translate a product
    Given a signed-in administrator who does not hold the products edit permission
    When authorization to update the product is evaluated for them
    Then the action is refused

  Scenario: A catalog administrator needs no store-language permission to author a translation
    Given a catalog administrator holding the products edit permission and no store language permissions
    When they set a product's French title
    Then the translation is stored, because authoring content is not managing the language catalog

  # --- The removal warning this story extends ---

  Scenario: Removing a language in use reports the product content it affects
    Given a store administrator, with French active and holding product translations
    When the usage count for French is requested
    Then the count includes the French product translations
```

> ⚠️ **The four slug scenarios above assume Q-2 resolves to option (a).** They are written against this story's recommendation rather than hedged, so the acceptance criteria are testable as they stand — but if the product owner chooses (b) or (c), the three uniqueness scenarios are struck and only *"A slug is stored in its canonical form"* and *"A product may be saved without a slug"* survive. Recorded so the dependency is visible rather than discovered at Phase 2.

## Files to create/modify

### Create

- **`database/migrations/<timestamp>_create_product_translations_table.php`** — the child table plus its backfill in one `up()`, following 0070's recipe step 1 and [`add_status_to_users_table`](../../database/migrations/2026_08_11_175426_add_status_to_users_table.php)'s precedent of backfilling in the migration that creates the thing needing it. Its timestamp must be **strictly later** than both `create_products_table` and `create_store_languages_table`, since both FKs are declared inline:

  ```php
  public function up(): void
  {
      Schema::create('product_translations', function (Blueprint $table): void {
          $table->uuid('id')->primary();                                                    // D-17
          $table->foreignUuid('product_id')->constrained('products')->cascadeOnDelete();     // live cascade — D-19
          $table->foreignUuid('store_language_id')->constrained('store_languages')->restrictOnDelete();  // defensive-only — D-19
          $table->string('name', 255);                          // NOT NULL — tracks products.name; D-2
          $table->mediumText('description')->nullable();         // tracks products.description exactly; D-2
          $table->string('slug', 160)->nullable();               // NEW — no parent value exists; D-5, D-6
          $table->string('meta_title', 160)->nullable();         // NEW — D-5
          $table->string('meta_description', 500)->nullable();   // NEW — width escalated as Q-1; D-5
          $table->timestamps();

          $table->unique(['product_id', 'store_language_id']);   // the natural key
          $table->unique(['store_language_id', 'slug']);         // per-language slug uniqueness — D-6, Q-2
      });

      app(BackfillProductTranslations::class)();
  }

  public function down(): void
  {
      Schema::dropIfExists('product_translations');
  }
  ```

  **Two things are deliberately absent.** There is **no `unique` on `name`** — `products.name` was never globally unique, so there is nothing to re-scope (**D-4**). And there is **no fold column** (`normalized_name` or equivalent) — unlike a display label, a slug is a machine identifier, canonicalized in place rather than shadowed by a comparison column (**D-6**).

  Both `constrained()` calls pass the table name explicitly. For `product_id` this is habit rather than necessity; for `store_language_id` it is **defensive readability only** — 0070's **R-8** corrects 0068's backlog item 3 on exactly this point. Do not read either as load-bearing.

  **No explicit `index()` on either FK column**, and **do not write an expected index count into a test as a bare number** — it is a *function of the Q-2 decision* (**D-11**). Verify with `php artisan db:table product_translations`, never by reading the migration.

- **`database/migrations/<timestamp>_drop_translatable_columns_from_products_table.php`** — a **second, separate** migration ordered strictly after the first (0070's **D-4**):

  ```php
  public function up(): void
  {
      // Only two columns. Unlike blog_categories/blog_tags, products.name never had a
      // unique index and there is no fold column -- so there is NO dropUnique() call here.
      // slug/meta_title/meta_description never existed on products at all.
      Schema::table('products', function (Blueprint $table): void {
          $table->dropColumn(['name', 'description']);
      });
  }

  public function down(): void
  {
      // KNOWINGLY NOT AN INVERSE (D-12). The values now live per-language on the child
      // table, and a parent row may hold zero, one or several translations -- there is no
      // single value to restore into a scalar column. Both columns come back NULLABLE,
      // with no data, and no index is re-added because none ever existed.
      Schema::table('products', function (Blueprint $table): void {
          $table->string('name', 255)->nullable()->after('product_category_id');
          $table->mediumText('description')->nullable()->after('stock');
      });
  }
  ```

  **The absence of `dropUnique()` is the point.** Every sibling retrofit opens this migration by dropping the parent's unique index before its column; a Phase 3 implementer copying 0072's or 0074's migration will write a `dropUnique(['name'])` that fails at runtime against an index that never existed.

- **`app/Models/ProductTranslation.php`** — `use HasFactory, HasUuids;`, `#[Fillable(['name', 'description', 'slug', 'meta_title', 'meta_description'])]`. `product_id` and `store_language_id` are omitted — only `SetTranslation`'s explicit key list writes them. No `SoftDeletes`: a trashed translation would squat its `(store_language_id, slug)` slot forever, and `Rule::unique()` does not apply the soft-delete scope (verified precedent on `users`). `belongsTo` both parents. It carries **two** `saving` hooks' worth of behaviour — the relocated sanitizer (**D-8**) and the slug canonicalizer (**D-6**):

  ```php
  protected static function booted(): void
  {
      static::saving(function (self $translation): void {
          if ($translation->isDirty('description')) {
              $translation->description = app(SanitizeProductDescription::class)($translation->description);
          }

          if ($translation->isDirty('slug') && filled($translation->slug)) {
              $translation->slug = Str::slug($translation->slug);   // canonicalize IN PLACE — D-6
          }
      });
  }
  ```

  **`booted()`, not `boot()`** — this class extends `Model` directly with no vendor hooks to order against, so 0061's and 0072's reasoning (the `App\Models\Role` `boot()` precedent is a vendor-ordering workaround) transfers verbatim. `app()` inside a model event is the one shape available and **is precedented**: `BlogCategoryTranslation` and `BlogTagTranslation` both resolve `NormalizeForSearch` the same way. What is new is the resolved *class*, not the shape — see **R-2**.

- **`database/factories/ProductTranslationFactory.php`** — with a `forLanguage(StoreLanguage $language)` state, so no test hand-builds the FK pair. It does **not** set `slug` (the hook canonicalizes it, which is itself a small proof the hook fires on insert) and does not default `description` to markup requiring sanitization.

- **`app/Actions/Products/BackfillProductTranslations.php`** — the extracted, container-resolved backfill (0070's **D-11**), in `app/Actions/Products/` (the entity folder 0024 already creates — no folder ambiguity here, unlike 0072's area-versus-entity dilemma), fail-loud per [seeder-safety.md](../../docs/security/seeder-safety.md#a-catalog-seeder-must-fail-loudly-rather-than-commit-a-structurally-invalid-catalog), and **split into a pure writer plus a thin reader** (**D-13**):

  ```php
  /** The glue half: the only part that touches the columns about to be dropped. */
  public function __invoke(): int
  {
      $defaultLanguageId = DB::table('store_languages')->where('is_default', true)->value('id');

      throw_if($defaultLanguageId === null, new RuntimeException(
          'Cannot backfill product_translations: no default store language exists. '
          .'Run StoreLanguageSeeder before this migration.',
      ));

      // Query builder, never the Eloquent model -- a migration must not depend on a model
      // whose shape a later story can change. Consequence: NO model event fires, so the
      // description is copied BYTE-FOR-BYTE and never re-sanitized (D-9), and no slug is
      // generated (D-9's rejected alternative).
      $rows = DB::table('products')->select('id', 'name', 'description')->get();

      return $this->write($rows->map(fn ($r) => (array) $r)->all(), $defaultLanguageId);
  }

  /**
   * The pure half: directly unit-testable with fabricated rows, with no dependency on a
   * schema state that no longer exists by the time a test body runs. See D-13.
   *
   * @param  array<int, array{id: string, name: string, description: ?string}>  $rows
   */
  public function write(array $rows, string $defaultLanguageId): int { /* ... */ }
  ```

  `slug`, `meta_title` and `meta_description` are **left `NULL`** for every backfilled row (**D-9**).

### Modify

- **`app/Models/Product.php`** (0024's) — `use HasTranslations;` plus the one thing the trait cannot infer:

  ```php
  protected function translationModel(): string
  {
      return ProductTranslation::class;
  }
  ```

  `#[Fillable]` loses **`name` and `description` only**. **This is the first retrofit whose parent does not become zero-fillable** — `product_category_id`, `sku`, `type`, `status`, `price`, `stock` and `featured_media_id` all stay, because none is translatable (PRD lists price, stock, SKU, status and dates among the fields *"shown once"*, outside the tabs). A reader pattern-matching against `ProductCategory` and `BlogTag`, both of which reach `#[Fillable([])]`, will get this wrong; it has its own test (**D-10**). The `@property` block loses two entries; `casts()`, `isOutOfStock()`, `displayStatus()` and all three relations are unaffected.

  It also gains the read-side scope 0027 consumes (**D-14**):

  ```php
  public function scopeOrderByTranslatedName(Builder $query, ?string $storeLanguageId = null): void
  ```

- **`app/Concerns/ProductValidationRules.php`** (0024's) — the changes are unusually *asymmetric*, and the asymmetry is the story:

  | Method | Change |
  | --- | --- |
  | `productNameRules()` | **Unchanged.** `['required', 'string', 'max:255']`. No uniqueness to re-scope, no `$storeLanguageId` to thread (**D-4**). |
  | `descriptionRules()` | **Unchanged.** `['nullable', 'string', 'max:65535']`. Its ordering relationship with the sanitizer is what changes, not the rule (**D-8**). |
  | `skuRules()` | **Explicitly untouched.** SKU is not translatable, stays on `products`, keeps its global `UNIQUE` and its `->ignore($productId)`. Any diff here is a review finding (**D-7**). |
  | `slugRules()` | **New.** `slugRules(string $storeLanguageId, ?string $productId = null)` — the per-language unique with an explicit `product_id` exclusion, **not** `->ignore()` (**D-6**). |
  | `metaTitleRules()` / `metaDescriptionRules()` | **New.** `['nullable', 'string', 'max:160']` and `['nullable', 'string', 'max:500']`, matching the column widths. |

  The slug rule's shape, with the exact Laravel expression left to Phase 3 exactly as 0072 and 0074 both leave their own:

  ```php
  Rule::unique('product_translations', 'slug')
      ->where(fn ($query) => $query
          ->where('store_language_id', $storeLanguageId)
          ->when($productId !== null, fn ($q) => $q->where('product_id', '!=', $productId))),
  ```

  ⚠️ **The rule must compare the canonicalized slug**, not the raw submitted string — the same residual 0024's **D-13** trap (b) records for SKU: the canonicalisation must happen **before** `validate()`, or the uniqueness rule checks a value the database never stores.

- **`app/Actions/Products/CreateProduct.php`** — **signature widens** with `?string $slug`, `?string $metaTitle`, `?string $metaDescription` (**D-18**); `$name` / `$description` narrow in meaning to *"the default store language's"*. Constructor-injects `SetTranslation`. **Gains an outer `DB::transaction()`** wrapping the parent-row insert, the translation write and the `SyncProductGallery` call (**D-15**). It keeps calling `SanitizeProductDescription` **before** `validate()` (**D-8** layer 1).
- **`app/Actions/Products/UpdateProduct.php`** — same widening, same sanitize-before-validate ordering, and **it gains a transaction too** — a sharper requirement than 0074's "a rename needs none", because this action already wrote two tables before the retrofit (**D-15**).
- **`app/Actions/Products/DeleteProduct.php`** — **untouched.** `cascadeOnDelete()` removes translations with the parent, and this file exists to be extended by Epic 3's order-reference guard, not by this one.
- **`app/Actions/Products/SyncProductGallery.php`** — **untouched.** Its own `DB::transaction()` becomes a savepoint inside the caller's (**D-15**).
- **`app/Actions/ProductCategories/DeleteProductCategory.php`** — **untouched.** Its guard counts through `products.product_category_id`, a column this story does not move.
- **`config/store-languages.php`** (0068's) — **the entire production diff is one appended array literal**, which is 0068's **D8** contract:

  ```php
  ['table' => 'product_translations', 'column' => 'store_language_id'],
  ```

  No closures; survives `config:cache`. No edit to `RemoveStoreLanguage`, to `StoreLanguage::translationUsageCount()`, to 0070's drift guard, or to any component.
- **`lang/en/products.php`** / **`lang/es/products.php`** (0024's — **extend, never recreate**, per its own hand-off note) — the `attributes` leaves for the three new fields and the slug-taken refusal string, key-for-key identical across both locales.

### Deliberately not touched

- **`database/seeders/RolePermissionSeeder.php`** — no new permission and no new module slug. **Verified against the shipped file:** `MODULES` already contains `products`, the catalog stays at **42** and `Administrator` at 41 of 42 (**D-16**).
- **`app/Policies/ProductPolicy.php`** — no new ability, and deliberately no `ProductTranslationPolicy` (**D-16**).
- **`app/Concerns/HasTranslations.php`**, **`app/Actions/Translations/SetTranslation.php`**, **`App\Models\StoreLanguage`** — 0070's and 0068's, consumed **unmodified**. **D-8** is what makes this possible.
- **`app/Actions/NormalizeForSearch.php`** — story 0022's, and **this story does not use it at all**. Products has no folded comparison column, because it has no name uniqueness to fold for (**D-4**) and its slug is canonicalized in place rather than shadowed (**D-6**). `NormalizeForSearch` appearing anywhere in this diff is a review finding.
- **`app/Actions/Products/SanitizeProductDescription.php`** and **`config/html-sanitizer.php`** — [0024a](done/0024a-product-description-html-sanitization.md)'s, consumed unchanged. This story adds a **second call site**, never a second allow-list (**D-8**).
- **Stories 0027, 0045 and 0048's own files** — this story must not edit another story's file; the amendments it forces are coordination actions (**R-1**, **R-3**).
- **`routes/**`**, **`resources/views/**`**, **`app/Livewire/**`**, **`config/modules.php`** — no screen, no route, no sidebar entry.

## Applying 0070's recipe — what transferred, and the two steps that did not

| Step | Outcome here |
| --- | --- |
| 1. Create `<entity>_translations` with the FK pair, the natural-key unique, and optionally a unique on *"the field that was globally unique"* | **Partially applied.** The FK pair and natural key transfer. The optional unique has **no candidate field** (**D-4**); the one this table carries is on `slug`, a column that did not exist before this story (**D-6**). |
| 2. Create `<Entity>Translation` with `HasFactory, HasUuids` and a translatable-fields-only `#[Fillable]` | Applied — plus **two** hooks where the blog siblings relocated one, and neither is a fold (**D-6**, **D-8**). |
| 3. On the parent: `use HasTranslations;` + `translationModel()`; drop translated columns from `#[Fillable]` | Applied — but the parent keeps **seven** fillable columns rather than reaching `#[Fillable([])]` (**D-10**). |
| 4. Re-scope the entity's `<Noun>ValidationRules` uniqueness by `store_language_id`, still folded through `NormalizeForSearch` | **Not applied, deliberately.** No uniqueness on `name`, no fold anywhere in this entity (**D-4**). Replaced by three *new* rule methods for the slug/SEO fields. |
| 5. Reuse `SetTranslation` **unmodified** | Applied. A sibling is a consumer, never a re-implementer. |
| 6. Append **exactly one** `{table, column}` literal to `config/store-languages.php` | Applied. |

**What this story must NOT re-derive**, per 0070's own list: the fallback chain's general mechanics, the default-language memo, the authorization shape, the `SetTranslation` primitive, and the drift-guard test — which picks `product_translations` up **for free**, because the table name matches the `*_translations` suffix the guard enumerates. **Do not rename the table**; the suffix is load-bearing.

**What is genuinely new here and belongs to no other story:** the multi-field per-field fallback proof (**D-3**), the sanitization relocation (**D-8**), the in-place-canonicalized slug (**D-6**), the widened signatures (**D-18**), the three-way transaction (**D-15**), the split backfill (**D-13**), and the translated-name ordering scope (**D-14**).

## Tests to perform — 3. QA test cases / validation scenarios

Feature and Unit only. **No browser tests** — this story ships no screen. This section is `backend-qa`'s contribution, adopted essentially as delivered.

### Per-field fallback — the proof three single-field siblings could not write
- [ ] Feature: **one fixture, at least two fields present in the requested language and at least one absent.** A product with a default-language row (`name`, `description`, `slug`, `meta_title` all populated) and a French row carrying `name` and `slug` only. Assert in one test that `name` and `slug` resolve **French**, while `description` and `meta_title` resolve the **default's**. *Risk if missing (`backend-qa`'s sharpening of the brief, adopted):* a per-**row** resolver returns the default's `name` and `slug` too — wrong — and **a two-field fixture cannot detect this at all**, because with only one field disagreeing there is nothing for a per-row implementation to wrongly override. The brief's premise that three single-field siblings *"could only approximate this"* is confirmed and extended: a two-field fixture also only approximates it.
- [ ] Feature: **the mirror** — French `description` present, French `name` absent.
- [ ] Feature: **`''` is treated as absent, not as a value.** A French row whose `description` is the empty string falls back to the default's. *Risk if missing (`backend-qa`'s finding):* `HasTranslations::translated()` guards with `$value !== null && $value !== ''`, and a version written with `??` instead would fall through for `null` but not for `''` — which matters concretely here, because a WYSIWYG editor plausibly submits `''` rather than `null` for an emptied field.
- [ ] Feature: missing in both languages → `null`, **no throw**, per field.
- [ ] Feature: the requested language is **inactive** → still resolves. *Risk if missing:* 0068's **D5** exists so a removed language's content stays readable; a defensive `is_active` filter at any layer defeats it.
- [ ] Feature: the store default is **changed** under a product translated only into the old default → resolution re-points, and the old-default-only product resolves to `null` without error.

### The description sanitizer — the story's highest-value block
- [ ] Feature: **the bypass test.** Call `SetTranslation` **directly**, with no `CreateProduct`/`UpdateProduct` in the path, passing a `description` containing `<script>alert(1)</script>`, and assert the **persisted** value is sanitized. *Risk if missing:* this is the entire argument for **D-8**. Without the hook this test fails — correctly, because the gap it proves is the one the language-tab UI story would ship into.
- [ ] Feature: sanitize-before-length ordering survives on the action path — a description whose **pre**-sanitization length exceeds `max:65535` but whose sanitized form does not is **accepted** (0024a **D-16** constraint 1), asserted independently on **both** the create and the update path rather than assumed symmetric.
- [ ] Feature: **idempotence**, re-asserted here rather than inherited — `sanitize(sanitize($x)) === sanitize($x)` on a value traversing both layers. *Risk if missing:* **D-8** applies the sanitizer twice on the action path, and that is safe **only** because idempotence holds.
- [ ] Feature: a save not touching `description` does not rewrite it — pins the `isDirty('description')` guard, and stops a no-op save re-sanitizing historical content under a drifted allow-list.
- [ ] Feature: every existing `ProductDescriptionSanitizationTest` case (allowed-tag round-trip, script/handler/scheme stripping, mangled-tag non-reassembly, null/empty pass-through) **retargeted** to the translation row. The logic under test is unchanged — `SanitizeProductDescription` is untouched — so this is a mechanical rewrite of roughly ten cases, not a redesign.

### The slug
- [ ] Feature: a submitted slug is **canonicalized in place** — `"  Chaussures De Course  "` stores as `"chaussures-de-course"` (**D-6**).
- [ ] Feature: canonicalization is **idempotent** — re-saving an already-canonical slug does not change it.
- [ ] Feature: two products, same canonical slug, **same** language → refused by validation.
- [ ] Feature: two products, **byte-identical** slug, **different** languages → accepted. *Why this exact fixture:* it is the only test proving the scope is per-language rather than global.
- [ ] Feature: re-saving a product's own slug in the same language is accepted — **three** assertions: (a) the no-op save succeeds, (b) the row is genuinely unchanged, (c) a genuinely free slug is still accepted, as the control.
- [ ] Feature: **the wrong-key catch, written deliberately** (**D-6**, **R-5**): product A with French slug `"chaussures"` and product B with `"bottes"`; re-save A's unchanged; assert success. A generic self-save assertion catches this too, but *"A collided with itself"* is a far faster diagnosis from failure output alone.
- [ ] Feature: writing a slug into a language the product has **no translation row in yet** is accepted — the insert case, exactly where a translation-row-id-keyed `->ignore()` has no id to pass.
- [ ] Feature: two products may both hold a `NULL` slug in the same language — the nullable-unique property MySQL provides and [`users.pending_email`](../../docs/database/schema.md#users) already relies on.
- [ ] Feature: uniqueness is checked against the **canonical** form, so `"Chaussures De Course"` collides with a stored `"chaussures-de-course"`. *Risk if missing:* the canonicalization-before-validate residual 0024's **D-13** trap (b) records for SKU, arriving here on a second column.
- [ ] Feature: a **foreign-key** violation (a forged `store_language_id`) is **not** misattributed as a duplicate-slug validation error — this table carries two `UNIQUE`s plus two FKs.

### Titles are deliberately not unique — a tripwire, not decoration
- [ ] Feature: two different products hold the **byte-identical** name in the **same** store language, both save, both round-trip. *Risk if missing (`backend-qa`'s argument, adopted):* 0072 and 0074 both added a per-language unique on their name column, so the reflex to add a third is strong, and the result would be a silently invented business rule.
- [ ] Unit: `productNameRules()` still carries **no** uniqueness rule — a direct guard against that same reflex at the trait level.
- [ ] Definition-of-Done check: `php artisan db:table product_translations` reports **no** unique index whose leftmost column is `name`.
- [ ] **Not written:** any `Rule::unique()` / `->ignore()` suite for `name`. There is no index to guard, and such a suite would pass trivially while giving false confidence that the "uniqueness re-scoped" step was applied — when faithful application here means *not applying it*.

### Atomicity — three writes, not two
- [ ] Feature: force a `QueryException` inside `SyncProductGallery`'s pivot insert during a `CreateProduct` call, then assert **zero** rows in `products`, **zero** in `product_translations` **and** zero in `product_media` — all three in one assertion block. *Risk if missing (`backend-qa`'s, adopted):* a test checking only the pivot passes against an implementation that already leaks the translation row. This is the hardest orphan to produce and the one no sibling had to consider, because none had a third write.
- [ ] Feature: the cheaper complementary case — force the failure on the **second** write via a test-registered `ProductTranslation::saving` listener that throws, isolating *"does `CreateProduct` wrap the translation write at all"* from the gallery-nesting question.
- [ ] Feature: the same atomicity assertion on the **update** path (**D-15**).
- [ ] Feature: a `ValidationException` never travels through an open transaction — refusal happens before one is opened.

### The backfill
- [ ] Unit: `BackfillProductTranslations::write()` against fabricated rows produces **exactly one** translation row each, in the default store language, with `name` **and** `description` byte-identical to the input — asserted **per row, never as a count**. *Why:* a count passes even if every row got the wrong value or all rows collapsed to one — the [count-assertion failure mode](../../docs/errors-log.md#a-count-based-assertion-over-rendered-html-counted-a-wrapper-element-it-never-meant-to-include--2026-08-21) this project records.
- [ ] Unit: a `null` description backfills as `null`, not `''`. *Why:* the first sibling backfill facing an **optional** field; all three predecessors moved a `NOT NULL` column.
- [ ] Unit: a description containing every tag in 0024a's allow-list backfills **byte-identically** — asserted as equality, not as "still contains no script tag" (**D-9**).
- [ ] Unit: `slug`, `meta_title` and `meta_description` are left `NULL` for every row, and **no slug is generated** (**D-9**).
- [ ] Feature: the backfill with **no default store language** throws and writes nothing.
- [ ] The migration itself is **not** separately tested — `RefreshDatabase` proves it runs, and **D-13**'s split is what makes the part that could be wrong directly testable without arranging a schema state that no longer exists.

### Wiring, model and query shape
- [ ] Feature: a wiring proof — a product translated into the default and one other language resolves the requested language, falls back, and returns `null` when neither exists. This catches a wrong `translationModel()` or relation name; it does **not** re-specify `HasTranslations`.
- [ ] Feature: `Product`'s `#[Fillable]` is **not** empty — `name` and `description` are gone, the other seven remain, and a forged `Product::create(['name' => …])` no longer writes anything (**D-10**).
- [ ] Feature: a forged mass-assignment of `product_id` or `store_language_id` on `ProductTranslation` is ignored.
- [ ] Feature: rendering N products through `withTranslationsFor()` issues a **bounded** number of queries regardless of N — proven able to move by removing the eager load.
- [ ] Feature: `translated()` reads the already-loaded relation and issues **no** additional query. *Why:* `$model->translations()` (the method, always re-queries) and `$model->translations` (the property, respects eager loading) differ by one character.
- [ ] Feature: `scopeOrderByTranslatedName()` orders by the requested language and falls back to the default for a product untranslated in it (**D-14**).

### Cascade, registry and authorization
- [ ] Feature: a product translated into three languages, deleted, leaves **zero** `product_translations` rows for it — asserted by direct query, not merely by the parent being gone. *Why this is worth its own test here:* the cascade is **genuinely live** for Products (**D-19**), unlike the soft-deleted-parent case elsewhere in this repo.
- [ ] Feature: `StoreLanguage::translationUsageCount()` includes this table's rows once the entry is registered.
- [ ] Feature: **regression run only** of 0070's drift guard, now against a further registered entry. **This story writes no drift guard of its own.**
- [ ] Feature: `php artisan config:cache` succeeds with the appended entry — an assertion, not a review promise.
- [ ] Feature: `Gate::forUser($denied)->authorize('update', $product)` throws while a holder passes — asserted against `ProductPolicy` directly. ⚠️ **The stated reason no longer holds (2026-09-01)**: this said *"not through the actions, because the actions deliberately do not authorize (**D-16**)"*, and [0024](done/0024-products-core-crud-backend.md) reversed that decision at its split — the actions **do** authorize, and 0024 ships its own allow/deny pair per action. Asserting against the policy directly is still fine as a *unit-level* check; add the through-the-action assertion too, or drop this case as a duplicate of 0024's.
- [ ] **Regression only, no new tests:** `ProductPolicyTest`. If it fails, that is itself a finding — it would mean the retrofit touched the policy, which it must not.

### Deliberately NOT tested here
- [ ] **SKU canonicalization, uniqueness and its race-collision catch** — untouched (**D-7**). `ProductSkuUniquenessTest.php` running unmodified in the full suite **is** the regression check, and a diff to that file is itself a signal something leaked across the wrong boundary.
- [ ] **`NormalizeForSearch`'s folding table** — story 0022's, and this story does not use the class at all (**D-4**, **D-6**).
- [ ] **`HasTranslations`' generic mechanics, the default-language memo, `SetTranslation` in isolation, and the drift guard's own mechanics** — 0070's.
- [ ] **`StoreLanguage`'s own CRUD and invariants** — 0068's.
- [ ] **Stock, price, status, type, category-assignment and gallery behaviour** — 0024's, and untouched.
- [ ] **A specific index-count assertion**, until **Q-2** settles. Writing "expect three" now and having it silently become four is exactly the stale-arithmetic claim this project's errors log records. Assert the **rule** (verify with `db:table`), not the number.
- [ ] **Anything rendered** — no Livewire test, no Blade assertion, no language tabs.

### Disposition of 0024's and 0027's existing test files

`backend-qa`'s table, adopted. **Size, stated honestly:** roughly **four of thirteen** files rewritten, two of them mechanically — materially smaller than 0074's "seven of nine", and for a specific reason: Products' name has no uniqueness machinery to retrofit.

| File | Disposition | Why |
| --- | --- | --- |
| `Unit/Enums/ProductStatusTest.php`, `ProductTypeTest.php` | **Unchanged** | Neither is translated. |
| `Unit/Concerns/ProductValidationRulesTest.php` | **Mostly unchanged; one guard added** | `productNameRules()` / `descriptionRules()` / `skuRules()` assertions unchanged; one new test asserting `productNameRules()` still carries **no** uniqueness rule; three new rule methods gain their own. |
| `Feature/Models/ProductTest.php` | **Rewritten (partial)** | `name`/`description` round-trips move to `translated()`; the `#[Fillable]` assertion narrows by two keys, **not** to `[]`; every column-type assertion unchanged. |
| `Feature/Products/CreateProductTest.php` | **Rewritten (partial)** | Name/description persistence moves to the translation row and gains "one product row + one translation row in the default language"; the type-required, status-defaults-to-Draft and SKU datasets unchanged. |
| `Feature/Products/ProductSkuUniquenessTest.php` | **Unchanged** | **This file needing edits is itself a red flag** (**D-7**). |
| `Feature/Products/ProductBoundariesTest.php` | **Rewritten (partial)** | The `name` length-boundary pair retargets to the translation row; `sku`/`price`/`stock` boundaries untouched. |
| `ProductStockStatusTest.php`, `ProductCategoryAssignmentTest.php`, `ProductMediaTest.php` | **Unchanged** | None touches translated content. |
| `Feature/Products/ProductDescriptionSanitizationTest.php` | **Rewritten, heaviest** | Every assertion retargets to the translation row; gains the direct-`SetTranslation` bypass test, the byte-identical backfill test and the nullable pass-through. |
| `Feature/ProductCategories/DeleteProductCategoryTest.php` | **Unchanged** | Counts through `products.product_category_id`, which never moves. |
| `Feature/Policies/ProductPolicyTest.php` | **Unchanged** | **D-16**: no ability, no permission. |
| `Unit/ArchitectureTest.php` | **Unchanged** | No new namespace boundary. |
| **0027's `IndexQueryTest.php`** | **Broken outright — a hand-off, not a silent patch** | **R-1**. |

## Expected outcome

`products` no longer carries `name` or `description`; every product's title, description and — new in this story — slug and SEO meta live in `product_translations`, one row per store language, with existing rows backfilled into the store default. `Product::translated('name')` and `translated('description')` each resolve the requested language, the store default's when absent, and `null` when neither exists — **independently of each other**, which is the property three single-field siblings could not demonstrate. A description reaches the column sanitized whichever write path it arrives by, including the direct `SetTranslation` path the language-tab UI story will use and which does not exist yet. A product title may repeat freely; a product slug may not, within one store language, and is stored canonical. Deleting a product removes every language's content with it, and `StoreLanguage::translationUsageCount()` counts product translations with no component change.

## Acceptance criteria

- [ ] `product_translations` exists with a UUIDv7 primary key, two non-nullable UUID FKs, a `NOT NULL` `name`, and nullable `description`, `slug`, `meta_title`, `meta_description`, plus timestamps.
- [ ] `php artisan db:table product_translations` reports the index list, **verified rather than assumed**; the expectation is **three** under **Q-2(a)**, **four** under **Q-2(b)** and **three by a different mechanism** under **Q-2(c)** — investigate a discrepancy rather than accepting any number blind (**D-11**).
- [ ] There is **no** unique index on `name` in any position, and `ProductValidationRules::productNameRules()` is byte-identical to 0024's (**D-4**).
- [ ] A submitted slug is stored canonical, canonicalized **before** the uniqueness rule runs, and its self-exclusion keys on **`product_id`** rather than `->ignore()` (**D-6**).
- [ ] The FK to `products` cascades on delete and is **proven** to by a test; the FK to `store_languages` restricts and is understood to be defensive-only (**D-19**).
- [ ] `products.name` and `products.description` are gone, dropped in a **separate** migration ordered after the child table is created and populated, with **no** `dropUnique()` call; `down()` restores both **nullable** and is documented as knowingly non-inverse (**D-12**).
- [ ] Every pre-existing product holds exactly one translation row in the store default language, with `name` and `description` preserved **byte-for-byte** — a `null` description as `null` — and `slug` / `meta_title` / `meta_description` left `NULL` with **no slug generated** (**D-9**); the backfill aborts loudly when no default store language exists.
- [ ] A `description` written through **`SetTranslation` directly**, with no domain action in the path, is stored sanitized (**D-8**).
- [ ] `App\Actions\Translations\SetTranslation` is consumed **byte-for-byte unmodified**, and no sanitization, canonicalization or fallback logic exists at any call site in this story's diff.
- [ ] `App\Models\Product`'s `#[Fillable]` retains its seven non-translatable columns and is **not** empty (**D-10**).
- [ ] `App\Actions\Products\SanitizeProductDescription` and `config/html-sanitizer.php` are unchanged — a second call site, never a second allow-list.
- [ ] `CreateProduct` and `UpdateProduct` each write every table they touch **in one transaction**, and a failure in any of the three leaves **none** of them (**D-15**).
- [ ] `ProductValidationRules::skuRules()` is untouched and `ProductSkuUniquenessTest.php` passes unmodified (**D-7**).
- [ ] Authoring a translation requires no `store-languages.*` permission; the permission catalog is unchanged at **42**, `RolePermissionSeeder` is untouched, and no policy or ability is added (**D-16**).
- [ ] `config/store-languages.php` gains **exactly one** appended array literal, contains no closures, and survives `config:cache`; `RemoveStoreLanguage`, `StoreLanguage::translationUsageCount()`, 0070's drift guard and every component are untouched.

## Definition of Done
- [ ] Tests written and green (**full suite unscoped**, not `--filter`) — mandatory rather than advisory here, because this story adds a **model event**, whose blast radius is the whole suite by construction
- [ ] `vendor/bin/pint --format agent` run **unscoped**, not `--dirty`
- [ ] **Larastan level 7 run and recorded** — named explicitly because [errors-log.md](../../docs/errors-log.md#a-verification-record-that-lists-two-of-three-quality-gates-is-a-record-of-two-gates--2026-08-26) records three consecutive stories whose verification notes listed two of three gates and were read as records of all three. A record naming two gates is a record of two gates.
- [ ] Code reviewed (code-reviewer)
- [ ] No security findings (appsec-auditor) — **point the audit at D-8 and D-16 specifically**: the sanitizer now has two layers and one of them is a model event, and the write path this story ships contains no `Gate` check at any layer it owns
- [ ] Documentation updated (docs-keeper) — at minimum `docs/database/schema.md` (the first translation table with more than one translatable column, and the first carrying a nullable `MEDIUMTEXT`), `docs/database/migrations.md` (the recipe's third retrofit pair, and the first whose parent-drop migration has **no** index to drop), and `docs/architecture/authorization.md` (recording again that translated content adds no ability and no permission)
- [ ] **Recorded as a handoff, not done here:** the coordination items in **R-1**, **R-3** and **R-6**. This story edits no other story's file.
- [ ] Acceptance criteria met

## 4. Documented functional decisions

**D-1 — PRD's "product title" is `products.name`, and the column is not renamed.** [PRD assumption 14](../../docs/PRD/PRD.md#assumptions--confirmed-decisions) and Epic 5 both say *"product title/description"*, while story 0024 ships the column as `name` — and no other candidate column exists. *Rejected:* renaming it to `title` as part of the retrofit; it would break 0027, 0029, 0045 and 0048 for a vocabulary alignment with no functional content. **Stated explicitly because `backend-expert` asked for it to be**: without it, an implementer may create a `title` column believing it is new.

**D-2 — Column types track the parent's; `name` stays `NOT NULL` and everything else is nullable, and the nullability is what makes D-3 testable at all.** `name` is `VARCHAR(255)` and `description` `mediumText` nullable, matching `products` exactly — narrowing either during a data move risks silent truncation. `name` stays `NOT NULL` because a translation row without a name is not meaningfully a translation. **The other four are nullable for a reason `database-expert` identified and which is stronger than convention:** if `slug` (or any SEO field) were `NOT NULL`, an administrator who fills in a French name but has not yet written the French slug could not save at all — which would defeat the per-field fallback mechanism (0070's **D-5**) that this very story exists to prove. Nullability is not laxity here; it is the precondition for the feature.

⚠️ **One part of 0024's D-4 reasoning transfers to a *different* table, and one consequence is new.** D-4 argued that a short `MEDIUMTEXT` stays inline in InnoDB DYNAMIC and fattens the clustered index — which is why 0024's **R-9** prohibits `SELECT *` on the products list. `database-expert` confirms the mechanism is table-agnostic: it now fattens `product_translations`' own clustered index instead. The new consequence is a **read** hazard rather than a write one, because that table is eager-loaded whole by a generic trait — see **R-7**.

**D-3 — This story owns the multi-field per-field fallback proof, and the fixture needs more than two fields.** 0070's **D-5** establishes that fallback resolves per **field**, and states that the property is *"invisible on the single-field pilot and is the whole mechanism on 0076/0078"*; its backlog item 4 assigns the real proof to whichever ships first. 0076 is that story. `backend-qa` sharpened the design in a way worth recording: **a two-field fixture also only approximates it.** With one field present and one absent, a per-row resolver and a per-field resolver are still hard to separate cleanly; the fixture needs **at least two fields present in the requested language and at least one absent**, so a per-row implementation has something to visibly, wrongly override. This is a test obligation rather than a code change — 0070's implementation is already correct; what has never existed is a fixture that can distinguish it from the wrong one.

**D-4 — There is no name uniqueness to re-scope, and none is invented.** Verified against 0024's **D-13** (`['required', 'string', 'max:255']`, no `Rule::unique()`) and independently from the consuming side by 0027's **D-4**, in a parenthesis it relies on for its own pagination reasoning: *"two products sharing a name (permitted — only `sku` is unique)"*. All three amigos confirmed this independently. So 0070's recipe step 1 has **no candidate field** and step 4 is a **no-op**. Three consequences a Phase 3 implementer copying 0072 or 0074 would get wrong:

- **No fold column and no `NormalizeForSearch`.** 0072's **D-1** and 0074's **D-1** bind their per-language unique to a stored, folded column *because their parents already had one*. Products never did — 0024's **D-11** solved its only uniqueness (SKU) by canonicalising on write instead of folding on compare, and explicitly declined `NormalizeForSearch` for it.
- **The `->ignore()` trap does not apply to `name`.** 0072's **D-4** and 0074's **D-6** are about a self-exclusion clause on a uniqueness rule; there is none here. It applies in full to the **slug** (**D-6**), and the two must not be conflated — `backend-qa` flagged that a single paragraph reading "maybe applies, maybe not" would be worse than two separate profiles, and this file separates them.
- **The absence needs a positive test, not merely an omission** (**D-4**'s tripwire, above). `backend-qa`'s framing, adopted: *"nothing replaces it; the absence itself is the finding"*, and manufacturing a uniqueness block to fill the space 0072/0074 occupy would be coverage for its own sake.

*Stated plainly:* nothing prevents two products carrying the identical French title, and nothing did before this story either. That is 0024's existing product decision, unchanged.

**D-5 — The SEO field set is `slug`, `meta_title` and `meta_description`, at 160/160/500. (The set is escalated as Q-1; `meta_description`'s width is escalated with it, at `database-expert`'s explicit request.)** PRD names them with an *"e.g."*, which leaves the set open. All three amigos independently recommended exactly these three and no more — *"don't invent a fourth (canonical URL, OG tags) — PRD names none of them"* (`backend-expert`). They also land on the count 0070's **D-1** already anticipated when it argued for a child table over JSON on the grounds that *"0076/0078 translate five fields"*. Widths are `database-expert`'s: 160 for `slug` and `meta_title` (search engines truncate well below that, and this table already carries a `MEDIUMTEXT`, so not defaulting every string to `VARCHAR(255)` out of habit is worth real bytes here), and **`VARCHAR(500)` for `meta_description` rather than `TEXT`** — bounding free text with a natural ceiling, consistent with `sales_regions.description`. `backend-expert` proposed `text` for that column instead; `database-expert`'s bounded form is adopted, and **`database-expert` explicitly asked that the width not be nodded through as a database detail**, so it is part of **Q-1**.

**D-6 — The slug is administrator-supplied, canonicalized in place, and nullable; its uniqueness scope is escalated. (This is the story's sharpest technical finding, and the amigos split three ways on the uniqueness half.)** 0070's backlog item 5 assigns this decision here explicitly. The obvious shape is [story 0061's](0061-blog-posts-core-crud-backend.md) — a slug derived from the title by a `saving` hook and carrying a `UNIQUE`, which is what `blog_posts` ships. **That shape is structurally impossible for Products, and the reason is D-4.** A derived-and-unique slug requires the field it derives from to be unique, and `products.name` deliberately is not. Two legitimately identically-named products — *"Camiseta básica"* in two different categories, the normal case rather than the pathological one — derive the identical slug, and the second insert dies on a `23000` the administrator cannot resolve, because the name is exactly what they wanted. 0061 ships that shape and leaves *"what happens on a collision"* open as its own **OQ-2**; Products would inherit an unresolved question into a strictly worse case. **`database-expert` reached the same wall from the other end**, finding that a *generating* backfill would need a dedup-suffix pass for exactly this reason — the same collision, surfacing in the migration rather than at the form.

So: **the slug is a typed, administrator-owned identifier**, and deriving it from the name is a **UI affordance** (0027's editor pre-fills the field), never a model hook. Four reasons this is right rather than merely workable. *(i)* It is the only option respecting both *"product names may legitimately repeat"* and *"a slug identifies exactly one product"*. *(ii)* It needs no invented suffix convention. *(iii)* It **mirrors `sku`**, which this codebase already ships as an administrator-typed identifier canonicalized on write (0024 **D-11**) — so the remedy is in the administrator's hands and the refusal is actionable, which a derived slug's refusal is not. *(iv)* `NULL` is honest while nothing resolves a product by slug.

**Canonicalization is in place, not shadowed, and it lives in the model hook** — `database-expert`'s synthesis, adopted: a slug is a *machine identifier* like `sku`, not a display label like `name`, so it takes 0024 **D-11**'s lighter mechanism (`Str::slug()` on write, stored already-canonical, compared like-for-like) rather than 0072/0074's separate fold column. The hook placement is 0072 **D-3**'s argument rather than 0024's "each caller canonicalizes", because the write now goes through a shared primitive multiple future actions call. ⚠️ **`database-expert` flagged this as its own construction — a synthesis of two precedents neither sibling had to combine — and asked that it not be treated as inherited.** It is recorded as a decision, not a carry-forward, and **R-14** names it as needing Phase 2 attention.

**The self-exclusion is an explicit `product_id` exclusion, not `->ignore()`** — 0074's **D-6** applied for its own reason rather than by analogy: writing a slug into a language the product has **no translation row in yet** is an *insert*, so there is no translation-row id to pass, and `->ignore($productId)` against `product_translations.id` compiles, runs and matches nothing, silently refusing every same-slug re-save forever.

*Rejected:* derived + unique (impossible, above). *Rejected:* derived + auto-suffixed — invents a convention the PRD never describes and 0061 left open. *Rejected:* derived + not unique — a slug that does not identify one thing fails at the only job a slug has.

**D-7 — `sku` is not translatable and does not move.** PRD Epic 5 lists SKU among the fields that *"stay **outside** the language tabs and are shown once"*, and its own scenario spells it out. So `sku` keeps its column, its global `UNIQUE`, its canonicalisation-on-write (0024 **D-11**) and its `->ignore($productId)`. `skuRules()` is byte-identical after this story and `ProductSkuUniquenessTest.php` passes unmodified — which is not merely permitted but **is** the regression check. `backend-qa`'s framing is adopted: a diff touching that file signals something leaked across the wrong boundary. Stated as a decision because the omission is easy to misread as an oversight.

**D-8 — Description sanitization becomes two layers: the actions keep theirs, and `ProductTranslation` gains a `saving` hook. This is the story's primary design decision.** 0024's **D-16** rests its entire security claim on one property: *"the actions are the only way a description reaches the column, so a seeder, an Artisan command, a future import or a REST controller all inherit the guarantee without knowing it exists."* **The retrofit falsifies that sentence.** `SetTranslation` sanitizes nothing and must not be modified (0070's **D-8**/**D-9**), and 0070's **D-12** names writing a non-default language through it directly as *the* pattern — which is exactly what PRD Epic 5's tabs will do. That caller does not exist yet, and the mechanism must be safe **before** it is written.

Neither single layer suffices, which is why there are two:

- **A model hook alone breaks D-16 constraint 1.** A `saving` event fires *after* validation, so `max:65535` would measure unsanitized markup — the precise bug that constraint names.
- **The actions alone leave the `SetTranslation` path open** — the gap above.

So the actions keep sanitizing before `validate()` (layer 1, preserving the ordering), and `ProductTranslation::booted()` sanitizes on `saving` when `description` is dirty (layer 2, binding every writer). **Applying the sanitizer twice on the action path is safe only because 0024a's D-16 constraint 2 already requires and tests idempotence** — the same argument 0072/0074 already make for their fold, as `backend-expert` noted independently. Note this is a **pure addition, not a relocation**: unlike `BlogCategory`/`BlogTag`, `Product` never had a model-level hook to move, because sanitization lived only in the actions.

*Rejected:* relocating sanitization wholly into the hook — it trades a security gap for a correctness one. *Rejected:* leaving it action-level with a documented rule that no other caller may use `SetTranslation` for `description` — a discipline-only guard on a shared primitive four entities import, which is the failure mode this project's errors log records repeatedly.

⚠️ **`backend-qa`'s second pass proposed a different resolution and it is recorded rather than dropped.** It argued for leaving the gap open and pinning it with a **characterization test** that asserts the unsanitized value *is* persisted — documenting a dormant hole rather than closing it, on the grounds that closing it requires the non-default-language action this story's scope fence excludes. **Not adopted**, because the hook closes the gap without building that action and without touching `SetTranslation`, and a documented-but-open stored-XSS path is a worse resting state than a hook. Its underlying instruction is adopted in full, though: any future action writing a non-default-language description inherits the guarantee automatically under **D-8**, and no longer needs to remember.

**D-9 — The backfill copies `description` byte-for-byte, never re-sanitizes it, and generates no slug.** 0070's **D-11** mandates a query-builder backfill, so no model event fires and every value is written explicitly — the choice is purely *which* value. Copying is correct for a sanitization-specific reason (`backend-qa`'s): re-running `SanitizeProductDescription` during the migration would produce different output if `config/html-sanitizer.php`'s allow-list has drifted since the original write, **silently mutating historical editorial content during what is presented as a schema change**. A migration must not be an editorial event.

**The slug is left `NULL` rather than generated, and `database-expert`'s dissent is what settles it.** `database-expert` designed a generating backfill (`Str::slug($name)` per row) and correctly identified that it **requires a dedup pass by construction**: two products whose names slugify identically collide against the very `UNIQUE` the same migration just created, mid-backfill. That is a real finding, and it is the argument for *not* generating: the dedup suffix is precisely the invented convention **D-6** rejects at the form, and a migration is the worst place to invent it, because the resulting `camiseta-basica-2` is a URL nobody chose and nobody reviewed. `NULL` is available (**D-2**), honest, and costs nothing while no storefront resolves a product by slug. `backend-expert` independently recommended the same. *Recorded as a dissent rather than a consensus:* `database-expert` assumed generation was required and designed for it well; the disagreement is about whether to generate at all, not about how.

**D-10 — `products` does not become identity-only, and the parent keeps a non-empty `#[Fillable]`.** All three prior retrofits leave their parent at `#[Fillable([])]`; `products` has nine columns of which two are translatable, so it keeps seven as ordinary non-translatable fields, exactly as PRD requires. Recorded as a decision because it is the single most likely thing a reader pattern-matching against the two zero-fillable siblings gets wrong, and it has its own test.

**D-11 — The expected index count is a function of the Q-2 decision, so the acceptance criterion states the rule rather than a number.** The three amigos' analyses combine into a clean table:

| Q-2 option | Indexes | Mechanism |
| --- | --- | --- |
| **(a) per-language `UNIQUE(store_language_id, slug)`** | **3** | `primary` + two composites; each FK is leftmost of one, so InnoDB auto-creates neither |
| **(b) global `UNIQUE(slug)`** | **4** | `store_language_id` is leftmost of nothing, so InnoDB auto-creates a standalone FK index |
| **(c) no slug unique at all** | **3** | `primary` + the natural key + an auto-created FK index on `store_language_id` |

Note (a) and (c) both yield three **by different mechanisms**, so the count alone does not distinguish them — which is precisely why `backend-qa` declined to write a number into a test before **Q-2** settles, and why the criterion says *investigate a discrepancy* rather than *expect three*. Verify with `php artisan db:table product_translations` after migrating, never by reading the migration, which cannot show an index nobody wrote — the rule this repo learned from the `users_uuid_unique` incident and which 0070's own text got wrong about itself until corrected.

**D-12 — `down()` is knowingly not an inverse, and is *less* lossy than two of the three siblings'.** The values now live per-language and a parent row may hold zero, one or several translations, so there is no single value to restore into a scalar column; both columns come back **nullable**. Unlike 0072's and 0074's, this `down()` re-adds **no** unique index, because the parent never had one on either column (**D-4**) — there is nothing to misrepresent as restored. `database-expert`'s data-restoring alternative was declined for 0074 (its **D-11**) on two grounds that transfer unchanged: it couples migration 2's `down()` to migration 1's table, and a per-table rollback sophistication makes *"how does this one roll back"* a per-story question across four sibling retrofits. **If Phase 2 prefers the real restore, it should be adopted in 0070 first and inherited here**, never adopted here alone.

**D-13 — The backfill splits into a pure writer and a thin reader, and this story proposes closing 0074's R-3 for the whole family. (`backend-qa`'s design, adopted.)** 0070's **D-11** rejects a partial `migrate --path=` run as the way to arrange a pre-backfill state and names no replacement; 0074's **R-3** records that the gap *"now bites the second story"*. This is the fourth sibling to hit it, and continuing to defer produces four ad-hoc workarounds across four migration files. The split sidesteps rather than works around: `write(array $rows, string $defaultLanguageId)` takes fabricated legacy rows and is fully unit-testable with no schema timing involved, because it never reads the dropped columns; `__invoke()` is the thin glue that does, and is untestable *and should be* — DDL-adjacent plumbing covered by the existing "`RefreshDatabase` proves the migration runs" rule. **Recorded as a coordination item (R-6) rather than done here**: the split belongs in 0070's recipe so 0078 copies it. `backend-qa` explicitly flagged that four stories solving this identically-but-separately is itself the outcome to avoid.

**D-14 — This story ships `scopeOrderByTranslatedName()` rather than handing 0027 a join to invent. (`backend-qa`'s recommendation, adopted.)** 0070 shipped `scopeWithTranslationsFor()` so no consumer writes its own eager load; the ordering counterpart has not been needed until now, because the three retrofitted taxonomies are small, unpaginated lookup lists. `products` is the first table in this application with **no natural size bound** (0027's **D-4**), it is paginated, and it orders by the very column this story moves. **The exact expression is Phase 3's latitude** — a `leftJoin` on the requested language plus a `COALESCE` through the default is the obvious shape — matching how 0072 and 0074 both leave their validation-rule expressions to Phase 3. What is fixed is the method name, its `?string $storeLanguageId` parameter and its fallback semantics.

**D-15 — `CreateProduct` **and** `UpdateProduct` gain an outer `DB::transaction()`; `SyncProductGallery` keeps its own and becomes a savepoint.** 0074's **D-5** established that a two-table create needs a transaction its single-table predecessor did not. Products is a **three**-way write — the `products` row, the translation row, and `SyncProductGallery`'s `featured_media_id` plus pivot rows — and 0024 never states that `CreateProduct` wraps all of it, only that `SyncProductGallery` wraps its own. Without an outer boundary, a gallery failure leaves a committed product and translation with no imagery, and a translation failure leaves a product that `translated()` resolves to `null` on every field — throwing nothing (0070's **D-6** makes that normal), so it is invisible in every screen and never cleaned up. The realistic failure vector is **not** a uniqueness collision on `name` (there is none — **D-4**) but a forged or invalidated media id, which 0024 already treats as attacker-controlled `wire:click` input.

**`UpdateProduct` gains one too, and this is a sharper call than 0074's.** 0074 declined a transaction for `RenameBlogTag` because a rename is one statement against one table. `UpdateProduct` is not analogous: `backend-expert` points out it already potentially writes `products` **and** `product_media` before this retrofit, and now adds `product_translations` on top — so if 0024 ships it untransactional, that is a pre-existing gap this retrofit should close rather than compound.

Nesting is safe in principle — Laravel implements a nested `DB::transaction()` as a savepoint — but **both amigos independently asked that it be proven by execution rather than asserted** (**R-15**). Per [errors-log.md](../../docs/errors-log.md#wrapping-existing-code-in-a-dbtransaction-moved-a-cache-flush-nobody-had-written--2026-08-21), a transaction wrapper is a change to every side effect the wrapped code performs — **this was checked**: the wrapped code performs database writes, a pure sanitizer call and a `23000` catch, with no mail, no event dispatch, no cache flush and no queued job.

**D-16 — Translated content adds no permission, ability or policy — and the write path this story ships contains no `Gate` check at any layer it owns. (`backend-expert`'s correction to the facilitator's draft, verified and adopted.)** The first half is 0070's **D-13** unchanged: `MODULES` already contains `products`, the catalog stays at **42**, authoring a translation is *using* a configured language rather than managing the catalog so no `store-languages.*` permission is required (0068's **D18**), there is deliberately no `ProductTranslationPolicy`, and there is no step-up requirement.

> ⚠️ **The second half below was overtaken on 2026-09-01 and must be re-derived before Phase 3.**
> [0024](done/0024-products-core-crud-backend.md) **reversed** its **D-15**/**RQ-10** at its three-way split:
> the original decision rested on a claim that `App\Actions\Users\CreateUser`/`UpdateUser` contain no
> `Gate` call, which is **false** (`CreateUser::__invoke()` line 66 authorizes `create`, `UpdateUser`
> carries seven such calls), and the documented convention is that the check lives in the class
> performing the operation. `CreateProduct` / `UpdateProduct` / `DeleteProduct` **now self-authorize**,
> and `ProductPolicy` ships with real call sites. **What that means here, concretely:** instruction
> **(a)** below inverts — making `CreateProduct` self-authorize is no longer "a false parallel to the
> taxonomy siblings", it is what 0024 ships, so this story must place its `SetTranslation` call
> **below** those existing `Gate` calls exactly as the three taxonomy siblings do. Instruction **(b)**
> is **narrowed rather than withdrawn**: the residual gap is now only `SetTranslation`'s own generic
> entry point (0070 **D-9** authorizes nothing), not the whole write path — so `appsec-auditor` should
> still be pointed here, at a smaller target. The first half of D-16 (no new permission, ability or
> policy) is **unaffected**.

**The second half is a genuine structural divergence from all three taxonomy siblings, and the facilitator's first draft got it backwards.** That draft asserted the sibling rule — *"each action's `Gate::authorize()` calls must sit above the `SetTranslation` call"* — which is true for `CreateProductCategory`, `CreateBlogCategory` and `CreateBlogTag`, all of which self-authorize. **It is false for Products.** 0024's **D-15**, over a recorded `backend-qa` dissent and **confirmed by the coordinator at its RQ-10**, deliberately keeps `CreateProduct` / `UpdateProduct` un-self-authorizing, handing authorization to 0027's component and recording the gap as an explicit acknowledged item. Combined with 0070's **D-9** (`SetTranslation` authorizes nothing), the whole write path from caller to row contains **no authorization in any file this story touches** — the invariant is satisfied one layer further up, in a Livewire component that does not exist yet.

Two instructions follow, and they pull in opposite directions on purpose. **(a) Do not "fix" this** by making `CreateProduct` self-authorize as a false parallel to the taxonomy siblings; that would silently reverse a decision the coordinator confirmed, in a story that has no mandate to revisit it. **(b) Do not read it as safe.** It is an inherited, acknowledged gap that this story *widens* — because `SetTranslation` adds a second, more generic entry point to the same data — and it is why the Definition of Done points `appsec-auditor` here as well as at **D-8**.

**D-17 — UUIDv7 primary key, per ADR 0001 Amendment 1; the pilot's recorded dissent is not reopened, and `database-expert` adds a reason to close it for good.** 0070's **D-2** records a `bigint` argument and overrules it; 0072's **D-9** and 0074's **D-9** both declined to re-raise it. `database-expert` declines here too and supplies an argument specific to this table that is stronger than consistency: **Amendment 1's single named exception is scoped to a "high-volume internal geography lookup table" — a shape defined as much by being internal plumbing as by row count.** `product_translations` is the opposite: user-authored content whose rows are directly addressed from the UI (a specific translation row edited via a language tab, a `wire:click` argument switching which translation is shown), which is exactly the enumeration-safety property Amendment 1 says fits `media` and does *not* fit `sales_regions`. It flags honestly that this is nonetheless likely the **largest table in the schema** at real catalog scale, and that the per-row cost of a 36-byte key over an 8-byte one is real — but not a correctness problem, and already priced project-wide by the amendment. Reopening a fourth time would make *"what PK does a translation table use"* a per-story question forever.

**D-18 — The action signatures **widen**; they do not merely narrow in meaning. (`backend-expert`'s correction to the facilitator's draft, adopted.)** 0070's **D-12** and 0074's **D-7** keep `__invoke()` byte-for-byte identical and re-interpret the existing parameters as *"the default store language's"*, and the facilitator's draft copied that. **It does not transfer**, for a reason specific to this story: those siblings moved fields that already existed, so there was an existing parameter to reinterpret. Three of Products' five translatable fields are **new** (**D-5**), so `CreateProduct` and `UpdateProduct` must **add** `?string $slug`, `?string $metaTitle` and `?string $metaDescription`. `$name` and `$description` do narrow in meaning exactly as the siblings' do; the three new parameters are additions with no sibling precedent. This is a public-contract change that 0027 binds to, which is why it is a decision rather than an implementation detail.

**D-19 — The `products` FK cascade is genuinely live, unlike the defensive cascades elsewhere in this repo.** `product_id → products.id` is `cascadeOnDelete()`, matching 0070's **D-3** (*"a translation has no meaning without its parent"*) — and here the cascade **actually fires**, because `products` has **no `SoftDeletes`** (0024's **D-12**) and `DeleteProduct` performs a plain instance `->delete()`. That makes it materially different from `media.uploaded_by`'s `nullOnDelete()`, which [migrations.md](../../docs/database/migrations.md) records as documentation rather than behaviour because its parent is soft-deleted. It is consistent with `product_media.product_id`, which 0024 already declares the same way. `store_language_id → store_languages.id` is `restrictOnDelete()` and **is** defensive-only, per 0068's **D5**, which makes removal an `is_active` flip and never a delete. `database-expert` raised the distinction; it is recorded because the cascade test in this story asserts something real rather than something vacuous.

## 5. Dependencies, risks, open technical questions

### Dependencies

- **[Story 0024](done/0024-products-core-crud-backend.md)** — hard, and **not implemented**. This story retrofits its table, its model, its validation trait and two of its four actions, and adds a second call site to its sanitizer. See **R-4**.
- **[Story 0070](0070-translatable-content-mechanism-product-categories-backend.md)** — hard, and **not implemented**. Supplies `HasTranslations`, `SetTranslation`, `StoreLanguage::defaultStoreLanguage()` and the drift guard, all consumed unmodified. **0070's Q1 is still open** (must every entity always hold a default-language translation?) and this story assumes its recommended answer **(a) yes**.
- **[Story 0068](0068-store-languages-catalog-backend.md)** — hard, and not implemented. Supplies `store_languages`, the `is_default` row the fallback resolves through, and the registry.
- **Story 0022** — supplies `App\Actions\NormalizeForSearch`, which this story **does not use** (**D-4**, **D-6**). Listed so its absence reads as a decision rather than an omission.
- **Stories 0027, 0045 and 0048 depend on this story** and are broken by it — **R-1**, **R-3**.
- **No new Composer package.** `symfony/html-sanitizer` is [0024a](done/0024a-product-description-html-sanitization.md)'s, already approved there.

### Risks

- **R-1 — Dropping `products.name` breaks story [0027](0027-products-list-and-editor-ui.md) in three ways, and the third is a scope question rather than an amendment.** *(a)* Its **D-4** list query is quoted verbatim as `->select(['id', …, 'name', 'sku', …])->orderBy('name')->orderBy('id')` — a named column in an explicit select, which throws `QueryException: column not found` rather than returning nothing. **D-14**'s scope exists so the fix is a consumption rather than an invention. *(b)* Its `Index` declares `#[Locked] public string $deletingProductName = ''`, fed from the dropped column. *(c)* **Its `Editor` is a materially larger lift than any sibling's UI story** — `backend-expert`'s finding: once slug and SEO land, the editor needs language tabs across **five** translatable fields, not one, where the taxonomy screens need tabs over a single name. This is not a signature change, and 0070's **Q3** (which story owns the tabs) is still open. ⚠️ **Note this is a *second, independent* breakage that 0070's own R-1 does not cover** — that R-1 names 0027 as a casualty of the *ProductCategory* retrofit (the category dropdown's `orderBy('name')`); this is 0027's own `products` list query, and it belongs to this story's hand-off, not 0070's. All are unimplemented Phase 1 files, so the cost is an amendment — but it is **not this story's to write**.
- **R-2 — The sanitization hook's container resolution is unverified.** Whether `updateOrCreate()`'s dirty-checking reliably fires a `saving` hook resolving a non-static invokable service could not be confirmed — no `vendor/`. The *shape* is precedented (0072 and 0074 both resolve `NormalizeForSearch` identically), so the residual is narrower than `backend-qa` first framed it, but not zero: a sanitizer is a heavier collaborator than a pure fold. **Phase 3 must verify by execution.** Inherited and related: 0074's **R-2** asks whether `SetTranslation` can write the non-fillable `store_language_id` at all; if it cannot, **the fix belongs in 0070**, since it affects every consumer.
- **R-3 — `order_items.product_name` is a frozen snapshot with no language, and this story makes that a real question.** Story [0045](0045-orders-core-crud-backend.md) writes it (`string(255)`, commented *"matches products.name"*) by resolving the live catalog row at order time, and [0048](0048-order-line-item-editing-backend.md) does the same on the edit path. Once `name` is per-language, `$product->name` becomes `$product->translated('name', ???)` and **something must choose the language an order freezes** — a product decision about a financial record, not a mechanical port. Raised as **Q-3**; it belongs to 0045/0048 and this story edits neither.
- **R-4 — The sequencing between this story and 0024 changes what this story *is*.** The PRD roadmap puts Epic 5 last, so the realistic case is a genuine retrofit against live data. **If the coordinator resequences so 0076 lands before 0024 is implemented**, the far cheaper path is to amend 0024 so `name` and `description` are *never created* on `products` and the slug/SEO columns are born on the child table, deleting the second migration and the backfill entirely. This is 0070's **R-3** and 0074's **R-1** recurring a third time; cheaper to decide than to reverse.
- **R-5 — The slug's self-exclusion fails silently and permanently, not loudly and once.** Wired as a naive `->ignore($productId)`, every same-slug re-save is refused in every language forever while the row looks correct throughout. **D-6** closes it; the deliberate two-product test keeps it closed.
- **R-6 — Two improvements this story makes belong upstream in 0070, and this story cannot put them there.** The split backfill (**D-13**) and the ordering scope (**D-14**). Both should be retrofitted into 0070's recipe so 0078 copies them rather than deriving a fifth and sixth answer. **This story edits no other story's file.**
- **R-7 — `withTranslationsFor()` now drags a `MEDIUMTEXT` into every list render, and the fix is 0070's. (Found independently by the facilitator and `database-expert`.)** 0024's **R-9** makes avoiding `SELECT *` on the products list a standing obligation because `description` fattens the row. 0070's scope eager-loads **whole translation rows** with no column selection — harmless for a single-`name` sibling, but for Products a paginated 25-row list pulls 50 translation rows each carrying a description the list never displays, plus both SEO strings. A caller cannot narrow it: the column set is inside 0070's own closure. **The fix (an optional column list on `scopeWithTranslationsFor()`) belongs in 0070, where it benefits four stories** — the same routing 0074's **R-2** applies. Do not patch it locally.
- **R-8 — 0070's static default-language memo needs an explicit reset between tests** (its **R-6**), and this story's default-change scenario is exactly the shape that trips it. Inherited.
- **R-9 — N+1 in two shapes** (0070's **R-4**): rendering a product list without `withTranslationsFor()`, and `$model->translations()->where(...)->first()` (the relation **method**) instead of `$model->translations->firstWhere(...)` (the **property**). They differ by one character. Worth a Phase 5 checklist line.
- **R-10 — A stale relation after a write renders the pre-save value** (0070's **R-5**). `SetTranslation` returns the translation row, not the parent.
- **R-11 — Rewriting 0024's test suite is real scope, not a byproduct** — roughly four of thirteen files, one heavily. Smaller than 0074's seven of nine, for the specific reason that Products has no uniqueness machinery to retrofit. Budget for it explicitly.
- **R-12 — This story's design is provisional against three unshipped stories at once.** 0024's schema, 0068's model and 0070's public API are all Phase 1 text. **Phase 3 must re-verify every signature against `HEAD` first** — including 0024's real `#[Fillable]` array and the exact parameter order on `CreateProduct` / `UpdateProduct`, which `backend-expert` notes 0024 renders with an ellipsis in places.
- **R-13 — Two of this story's own claims were wrong in its first draft and were caught by the amigos, which is a signal about the rest.** The facilitator composed a complete draft before two of three amigos had reported, and both of them contradicted it: the action signatures (**D-18**) and the authorization placement (**D-16**). Both are now corrected and verified against 0024's own text. **Phase 2 should read the remaining un-contradicted facilitator-only material with that in mind** — principally the Gherkin, **D-3**'s framing and the recipe-comparison table.
- **R-14 — The slug canonicalization mechanism is a synthesis, not an inherited decision.** `database-expert` combined 0024's SKU canonicalize-on-write with 0072's hook-placement argument — a pairing neither sibling had to make — and explicitly asked that it be reviewed rather than treated as settled. **D-6** records it; Phase 2 should confirm it.
- **R-15 — Nested `DB::transaction()` behaviour is asserted, not executed.** `SyncProductGallery`'s internal transaction inside `CreateProduct`'s new outer one is standard Laravel savepoint behaviour, and both `backend-expert` and `backend-qa` independently asked that it be **proven by execution** rather than trusted — particularly given this repo's own recorded incident of a transaction wrapper silently relocating a side effect.

### Open questions for the product owner

Per [contracts.md](../../docs/contracts.md)'s Uncertainty Handling Rule, each carries a recommendation rather than a silent assumption.

**Q-1 — Which SEO fields ship, and how wide is `meta_description`? ✅ RESOLVED 2026-08-30 — option (a).** PRD names them with an *"e.g."*. **D-5** assumes the enumerated three; `database-expert` explicitly asked that the width not be nodded through as a database detail.
- **(a) `slug`, `meta_title` (160), `meta_description` (500) — _(recommended)_.** Exactly PRD's own parenthetical, exactly the five-field total 0070's **D-1** anticipated, and all three amigos independently proposed this set and no more. The widths bound free text with a natural ceiling on a table already carrying a `MEDIUMTEXT`.
- **(b) The same three, with `meta_description` as unbounded `TEXT`** (`backend-expert`'s variant). Marginally more permissive; costs the natural ceiling and invites pasted prose into a field with a hard rendering limit.
- **(c) `slug` only**, deferring the meta fields. Cheaper, but leaves PRD's own acceptance criterion (*"slug/SEO fields"*, plural) unmet, and adding two nullable columns later is a second migration for no saving today.
- **(d) A wider set** — Open Graph image, canonical URL, meta keywords. Plausible for a real store, **named by nothing in the PRD**, so shipping them would be inventing scope.

**Q-2 — Does the product slug carry a uniqueness constraint, and at what scope? ✅ RESOLVED 2026-08-30 — option (a), per-language.** The human confirmed `UNIQUE(store_language_id, slug)`, explicitly noting consistency with sibling story 0078, which is independently landing the same per-language shape for `blog_posts`' own slug (superseding 0061's global unique) — so the cross-story reconciliation this question raised (0061 vs. 0070's recipe) resolves in the recipe's favour for both entities, not just this one. The three amigos split three ways, which was itself the finding; **D-6** settles the *technical* half (derived-and-unique is structurally impossible here) and the canonicalization; what remains was a routing/URL-scheme call that **`database-expert` stated plainly it could not settle from the database side** — now settled by the human instead. The acceptance criteria already written against option (a) (the four slug scenarios, D-11's index table) are confirmed correct as written; no further edit needed there.
- **(a) Per-language: `UNIQUE(store_language_id, slug)` — _(recommended; the facilitator's and `database-expert`'s position)_.** It is the recipe's natural extension, it costs **nothing extra in indexes** (three either way — **D-11**), and it is correct if the eventual storefront is locale-prefixed (`/fr/produit/…` vs `/es/producto/…`). It also keeps a duplicate slug an actionable validation refusal rather than a silent future collision.
- **(b) Global: `UNIQUE(slug)`.** This is **`blog_posts`' own shipped precedent** (0061 **D-3**), whose argument — *"two posts silently competing for one URL"* — transfers to products unchanged **if the storefront is not locale-prefixed**, in which case (a) would silently permit two products in two languages to collide under one flat URL. `database-expert` flagged this as a **live competing precedent within this codebase for the identical kind of field**, and Products is where the two prior stories' disagreement first has to be resolved rather than silently inherited from whichever is read first. Costs a genuine fourth index.
- **(c) No uniqueness at all this phase (`backend-expert`'s position).** Nothing resolves a product by slug yet, so a constraint would enforce an invariant for a reader that does not exist — the untested-surface pattern `SalesRegionPolicy`'s own docblock argues against, and consistent with 0024's *"a column no route reads is speculative scaffolding"* reasoning. Cheapest today; the cost is that retrofitting the constraint later means resolving whatever duplicates accumulated in live data, not merely changing DDL — which `database-expert` names as the reason it wants the answer **now, at schema time**.
- **The deciding input is the storefront URL scheme, which does not exist yet.** If the coordinator has any signal about locale-prefixed product URLs, it should override the recommendation above.

**Q-3 — Which store language does an order line item freeze in `order_items.product_name`?** **R-3**. Not this story's to decide — it belongs to 0045 and 0048 — but it is raised here because this story creates the question.
- **(a) The store default language — _(recommended)_.** The one language guaranteed to resolve for every product (0070's **Q1(a)**), so a line item can never freeze a `null`; and an order denominated consistently is easier to reconcile than one whose language varies by who entered it.
- **(b) The language the order was placed in**, once orders carry one. More faithful to the customer's experience — but nothing in Epic 3 gives an order a language today, so this would be inventing a field to answer a question.

### Inherited open questions — listed, deliberately not resolved here

**0070's Q1** (must every entity always hold a default-language translation — **Q-3(a)** depends on yes), **0070's Q2** (per-language name uniqueness — **moot for this entity**, since Products has no name uniqueness in any scope; recorded so its absence does not read as an oversight), **0070's Q3** (which story owns the language-tabs UI — sharpened by **R-1(c)**, since for Products that story spans five fields), **0074's R-3** (the backfill arrange mechanism — which **D-13** answers here and proposes to close for the family), and **0061's OQ-2** (blog post slug collisions — the question **D-6** declines to inherit).

## 6. Technical tasks for later backlog creation

Derived from this debate; **none are in scope for 0076**.

1. **Amend story [0027](0027-products-list-and-editor-ui.md)** for all three breaks in **R-1** — the explicit-column select and `orderBy('name')` (consuming **D-14**'s scope rather than inventing a join), `$deletingProductName`, and the five-field language-tab editor, which is a scope decision rather than an amendment.
2. **Answer Q-3 in stories [0045](0045-orders-core-crud-backend.md) and [0048](0048-order-line-item-editing-backend.md)** — which language an order line item's `product_name` snapshot freezes (**R-3**).
3. **Retrofit D-13's split backfill and D-14's ordering scope into [0070](0070-translatable-content-mechanism-product-categories-backend.md)'s recipe** so 0078 copies them rather than deriving a fifth answer (**R-6**). 0074's **R-3** has now been carried unresolved by three stories.
4. **Add an optional column list to `scopeWithTranslationsFor()` in 0070** so a list render does not eager-load a `MEDIUMTEXT` it never displays (**R-7**). The fix benefits four stories and must not be patched locally.
5. **Verify `SetTranslation`'s `store_language_id` write path by execution, in 0070** — 0074's **R-2**, still open, still 0070's.
6. **Reconcile the slug-uniqueness precedent between [0061](0061-blog-posts-core-crud-backend.md) and 0070's recipe** once **Q-2** is answered — 0061 ships a global unique and the recipe implies a per-language one, and story 0078 will meet the same fork on `blog_posts` itself.
7. **`ModuleRouteAccessTest.php` still covers two routes while more exist** — inherited unclosed from 0017/0018/0068/0070, and untouched here since this story adds no route.

## Provenance

**Phase 1 Three Amigos debate, 2026-08-29.** Facilitator: `product-owner`. **All three amigos were dispatched as real subagent calls and all three returned**, though not without incident — see the process note below.

- **`backend-expert` — returned and contributed.** The **signature-widening correction** (**D-18**), the **authorization correction** (**D-16**) — the sharpest single contribution in this debate, since the facilitator's draft asserted the opposite of what 0024 **D-15**/**RQ-10** decide — the `UpdateProduct` transaction argument (**D-15**), the recommendation of no slug uniqueness (**Q-2(c)**), the partial-backfill framing (**D-9**), the observation that the sanitization hook is a pure *addition* rather than a relocation (**D-8**), the five-field editor lift (**R-1(c)**), and the note that 0027's `products` breakage is independent of the one 0070's R-1 already covers.
- **`database-expert` — returned and contributed.** The full `Schema::create` block and every column width (**D-5**), the **nullability-enables-fallback** argument (**D-2**), the in-place slug canonicalization synthesis (**D-6**, flagged by itself as needing review — **R-14**), the generating-backfill design whose dedup requirement became the argument *against* generating (**D-9**), the three-way index table (**D-11**), the row-size and index-length figures, the live-versus-defensive cascade distinction (**D-19**), the strengthened UUID argument (**D-17**), and the independent discovery of the `withTranslationsFor()` `MEDIUMTEXT` hazard (**R-7**). It explicitly declined to settle **Q-2** unilaterally, on the grounds that it is a routing decision rather than a database one.
- **`backend-qa` — returned and contributed.** The entire test design and disposition table, the sharpened per-field fallback fixture (**D-3** — *"a two-field fixture also only approximates it"*), the direct-`SetTranslation` bypass test and the argument that sanitization is this story's primary Phase 2 decision (**D-8**), the three-way atomicity assertion (**D-15**), the `''`-versus-`null` fallback regression, the never-re-sanitize backfill argument (**D-9**), the split-backfill answer to 0074's R-3 (**D-13**), the `scopeOrderByTranslatedName()` recommendation (**D-14**), the "two products may share a title" tripwire (**D-4**), the non-zero-`#[Fillable]` warning (**D-10**), and the refusal to assert an index count before **Q-2** settles (**D-11**).

> ⚠️ **A facilitator process failure is recorded here rather than quietly corrected, because it changed what this file contains.** All three agents were dispatched at 14:03–14:04 and the facilitator ended its turn awaiting completion notifications that never arrived; the debate then sat idle for roughly nine hours until the coordinator asked why no file existed. **The two silent agents were not dead.** Their transcripts had stopped being written minutes after dispatch — as had `backend-qa`'s, which nonetheless returned a complete result the moment it was sent a direct follow-up. All three returned within minutes of being nudged, having run for nine and a half hours each. **Two lessons, both cheap and both learned the expensive way.** *(i)* A stalled transcript is not evidence of a dead agent, and waiting on an asynchronous notification without a bounded follow-up is not a strategy. *(ii)* **The facilitator then compounded it**: with one amigo returned it composed and wrote a complete story file attributing the other two as *"dispatched, never returned"* — and both promptly returned and contradicted it on two substantive points (**D-16**, **D-18**). This file is the corrected second version. **R-13** records that the remaining facilitator-only material deserves the same scepticism at Phase 2, since the sample of facilitator claims the amigos did check came back two-for-two wrong.

**Where the three converged**, independently and without seeing each other's answers: that `products.name` carries no uniqueness and none should be invented; that the SEO set is exactly `slug` + `meta_title` + `meta_description`; that the backfill copies `name`/`description` and leaves the three new columns `NULL`; that `SetTranslation` must not be modified and that the description sanitizer therefore belongs in a `saving` hook on `ProductTranslation`; that `CreateProduct` needs an outer transaction; that the `->ignore()` trap does not apply to `name` but would apply to a unique `slug`; and that 0027's list query breaks outright.

**They split on one question, and the split is escalated rather than resolved** — **Q-2**, the slug's uniqueness. `database-expert` recommends per-language and stresses it cannot settle a routing question from the database side; `backend-expert` recommends **no** constraint at all, on the grounds that nothing reads a slug this phase; the facilitator's own analysis (**D-6**) settles only the half that is technical. All three positions are in **Q-2** with their arguments intact, together with `database-expert`'s observation that **0061 and 0070 already answer this question differently for the same kind of field**, and that Products is where that disagreement first has to be reconciled.

**Facts verified by the facilitator against the real tree or the real sibling files, rather than inherited:**

1. `RolePermissionSeeder::MODULES` contains `products` — read from the shipped file — so **D-16** needs no seeder change and the catalog stays at 42.
2. `products.name` carries **no** uniqueness: 0024's **D-13** rule table, and 0027's **D-4** relying on the same fact from the consuming side. Checked from both directions rather than once, and independently confirmed by all three amigos.
3. ⚠️ **SUPERSEDED 2026-09-01.** This read *"0024's D-15 and RQ-10 — read directly after `backend-expert` contradicted the draft — confirm the Products actions deliberately do not self-authorize (**D-16**)."* That was an accurate reading of 0024 as it then stood, and **0024 has since reversed those very entries** at its three-way split (its **C-1**), on the finding that D-15's own premise about `CreateUser`/`UpdateUser` was false. The Products actions **do** self-authorize. Ironically the facilitator's original draft — which asserted the sibling rule and was corrected here — was right about the destination, for the wrong reason. See the ⚠️ on **D-16** above; this story must re-derive that half rather than inherit either version.
4. 0024's scope fence states verbatim *"No `slug`, no SEO meta, no translation table or any other i18n scaffolding (Epic 5)"* — so this story **introduces** those columns, unlike `blog_posts`, whose story 0061 **D-3** already ships a global-unique, title-derived slug that story 0078 must reconcile differently.
5. 0070's own backlog assigns **two** items to this story by name: item 4 (the multi-field fallback proof) and item 5 (*"A `slug` uniqueness decision for 0076/0078"*). Both are discharged, as **D-3** and **D-6**/**Q-2**.
6. 0070's **D-1** anticipated that *"0076/0078 translate five fields"*, which is what **D-5**'s set reaches — corroboration, not authority.
7. 0070's index-count correction dated 2026-08-29 (three, not four) was read and applied; **D-11** records why the number is conditional here in a way it is not for the single-field siblings.
8. The three downstream break sites in **R-1** were read in 0027's own file, and the `order_items.product_name` derivation in **R-3** in 0045's and 0048's.
9. `users.pending_email`'s nullable-unique precedent, which **D-6** relies on, was verified in [docs/database/schema.md](../../docs/database/schema.md#users) rather than assumed.

**One point on which the facilitator narrowed an amigo's finding rather than adopting it wholesale.** `backend-qa` flagged the sanitization hook's container resolution as *"genuinely new ground… a shape no sibling has tried"*. The **shape** is precedented — 0072's and 0074's translation models both call `app(NormalizeForSearch::class)` inside a `saving` closure — and `backend-expert` independently treated it as routine. What is new is only that the resolved class wraps a third-party sanitizer rather than a pure fold, so the residual is narrower than stated but not zero. Recorded as **R-2** with the narrowing explicit, rather than repeating the stronger claim or dropping the concern.

**One point on which an amigo corrected the facilitator's brief, adopted.** The brief described the sanitizer ordering constraint as applying *"now on a per-language write path"*, which presupposes a second caller that does not exist yet. Only one write path is reachable today; the tests are designed to prove the mechanism safe for a caller that has not been written, which is the right target, but the brief overstated what is currently reachable. **D-8** is worded accordingly.

**One `backend-qa` recommendation was declined, and the dissent is recorded rather than dropped.** Its second pass argued for leaving the sanitization gap open and pinning it with a **characterization test** asserting the unsanitized value *is* persisted, on the grounds that closing it needs the non-default-language action this story's scope fence excludes. **D-8** declines it — the hook closes the gap without building that action and without touching `SetTranslation` — while adopting its underlying instruction in full.

**One question an amigo raised that the facilitator resolved rather than escalated.** `backend-qa` asked whether slug/SEO is in scope for 0076 at all, noting nothing it had read commits this story to shipping it. The **story brief scopes it in explicitly** — the confirmed decomposition names this as the first retrofit where slug/SEO fields are in scope — so the *scope* is settled and not reopened. What genuinely remains open is the field set (**Q-1**) and the uniqueness policy (**Q-2**).

**Nothing outside this file was created or modified.** No application code, migration or test was written, and the files of stories 0024, 0027, 0045, 0048, 0061, 0068, 0070, 0072 and 0074 are untouched.

**Not run by this phase**, per [workflow.md](../../docs/workflow.md): the INVEST check (Phase 2), TDD implementation (Phase 3), security audit (Phase 4), code review (Phase 5), or the docs pass (Phase 6).
