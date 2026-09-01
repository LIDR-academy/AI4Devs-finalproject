# [0070] Translatable content mechanism — backend, piloted on Product Categories

## Description
The **foundational** story of [PRD Epic 5, Layer 2](../../docs/PRD/PRD.md#epic-5--internationalization): the per-store-language translatable-content mechanism, built once and piloted on Product Categories. It ships three things — a `<entity>_translations` child-table convention, a shared read-side contract (`App\Concerns\HasTranslations`) implementing the PRD's *"a missing translation falls back to the default store language"* rule, and one cross-cutting write primitive (`App\Actions\Translations\SetTranslation`) — then applies all three to `product_categories`, retrofitting story [0023](in-progress/0023-product-categories-backend.md)'s single `name` column onto the new shape and appending the first real entry to [0068](0068-store-languages-catalog-backend.md)'s `translation_relations` registry.

**This story's output is a recipe, not a feature.** Four sibling stories (**0072** Blog Categories, **0074** Blog Tags, **0076** Products, **0078** Blog Posts) apply this pattern to their own tables without re-deriving any of it. Every decision below is therefore written to be copied.

> **Read this before anything else: neither dependency exists in code.**
> Verified against the live tree at authoring time — `app/Models/` holds only `User`, `Role`, `SalesRegion`, `Media`; `app/Actions/` holds only `Auth/`, `Fortify/`, `Media/`, `Roles/`, `SalesRegions/`, `Users/`; `ls database/migrations/` shows no `product_categories` and no `store_languages` table.
>
> **Story 0023 (`product_categories`) and story 0068 (`store_languages`) are both Phase 1 files in `ai-spec/tasks/`, not shipped code.** Everything in this story is designed against their *specified* shape. If either story's Phase 2/3 changes that shape, this story must be re-derived rather than silently trusted — the [deferred-findings failure mode](../../docs/errors-log.md#a-deferred-storys-findings-were-claims-about-a-tree-that-no-longer-existed-and-one-of-them-would-have-reopened-a-bug-in-this-log--2026-08-23) this project already records once.

## Type
backend | includes database-expert: **yes** (one new table, two migrations including a data backfill, one retrofit of an existing table)

## 1. Refined user story

> **As** a store administrator managing a multilingual catalog,
> **I want** each Product Category's name to be stored and resolved per store language, falling back to the store default when a translation is missing,
> **so that** the catalog reads correctly in every language the store authors in, and a partially-translated catalog degrades gracefully instead of rendering blank or failing.

> **As** the engineer who will build stories 0072, 0074, 0076 and 0078,
> **I want** the translation table shape, the fallback resolution and the write primitive to exist as one shared, tested mechanism,
> **so that** adding translations to a fourth or fifth entity is a migration plus two lines of model wiring, not a fifth independent re-derivation of the same rule.

**Scope fence — this story ships no screen.** No Livewire component, no Blade view, no language tabs. The tabs described in PRD Epic 5 are a UI story's; see **Q3** for the coordination question about which one.

## Gherkin — 2. Detailed acceptance criteria (Given/When/Then)

Every scenario opens with a named business-role actor and carries exactly one `When`, per [gherkin-guidelines.md](../../docs/testing/frontend/gherkin-guidelines.md) rules 1 and 3.

```gherkin
Feature: Per-store-language content, piloted on Product Categories

  # --- Resolution and fallback: the PRD's own rule ---

  Scenario: A catalog administrator reads a category translated into the requested language
    Given a catalog administrator, with a product category named "Calzado" in Spanish and "Chaussures" in French
    When the category's French name is requested
    Then "Chaussures" is returned

  Scenario: A missing translation falls back to the default store language
    Given a catalog administrator, with a product category named "Calzado" in the default store language
      and no French translation
    When the category's French name is requested
    Then "Calzado" is returned, because the store default supplies the fallback

  Scenario: A category translated in neither the requested nor the default language resolves to nothing
    Given a catalog administrator, with a product category holding no translation in any store language
    When the category's French name is requested
    Then no name is returned and no error is raised

  Scenario: A field absent in the requested language falls back independently of its siblings
    Given a catalog administrator, with a translatable entry whose French title is present and whose French description is absent
    When the entry's French description is requested
    Then the default store language's description is returned
    And the French title is still the one returned for the title

  Scenario: A translation authored in a removed store language is still readable
    Given a catalog administrator, with a product category translated into French and French since removed as a store language
    When the category's French name is requested
    Then "Chaussures" is returned, because removal preserves stored content

  # --- The store default changing under an existing catalog ---

  Scenario: Promoting a new default store language re-points the fallback
    Given a catalog administrator, with a product category named only in Spanish and Spanish as the store default
    When a store administrator makes French the store default
    Then the category's fallback name resolves through French rather than Spanish

  Scenario: A catalog only translated into the previous default renders no name after a default change
    Given a catalog administrator, with a product category named only in Spanish and Spanish as the store default
    When a store administrator makes French the store default
    Then the category's French name resolves to nothing and no error is raised

  # --- Writing a translation ---

  Scenario: A catalog administrator translates a category into an additional language
    Given a catalog administrator with permission to edit products, and French active as a store language
    When they set the category's French name to "Chaussures"
    Then the French translation is stored alongside the existing Spanish one

  Scenario: Re-translating a category replaces its existing translation for that language
    Given a catalog administrator, with a product category already named "Chaussures" in French
    When they set the category's French name to "Souliers"
    Then the French translation reads "Souliers" and no second French row is created

  Scenario: Creating a category stores its name in the default store language
    Given a catalog administrator with permission to create products
    When they create a product category named "Calzado"
    Then the category holds one translation, in the default store language

  Scenario: A blank translation is refused
    Given a catalog administrator with permission to edit products
    When they set a category's French name to a blank value
    Then the change is refused with a validation error and no translation row is written

  # --- Uniqueness, now scoped per language ---

  Scenario: Two categories cannot share a name within one store language
    Given a catalog administrator, with a product category named "Chaussures" in French
    When they set another category's French name to "Chaussures"
    Then the change is refused with a validation error

  Scenario: The same name in two different store languages is permitted
    Given a catalog administrator, with a product category named "Chaussures" in French
    When they set another category's Spanish name to "Chaussures"
    Then the change is accepted, because uniqueness is scoped to one store language

  Scenario: A category keeps its own name when re-saved in the same language
    Given a catalog administrator, with a product category named "Chaussures" in French
    When they set that same category's French name to "Chaussures" again
    Then the change is accepted rather than refused as a duplicate

  # --- Authorization ---

  Scenario: An administrator without the products edit permission cannot translate a category
    Given a signed-in administrator who does not hold the products edit permission
    When they attempt to set a product category's French name
    Then the attempt is refused

  Scenario: An administrator needs no store-language permission to author a translation
    Given a catalog administrator holding the products edit permission and no store language permissions
    When they set a product category's French name
    Then the translation is stored, because authoring content is not managing the language catalog

  # --- The removal warning this story completes ---

  Scenario: Removing a language in use reports the content it affects
    Given a store administrator, with French active and holding product category translations
    When the usage count for French is requested
    Then it reports the number of French translations held
```

## Files to create/modify

### Create — the reusable mechanism

- **`app/Concerns/HasTranslations.php`** — the shared read-side contract, mixed into every translatable model. One implementation, five consumers.

  ```php
  namespace App\Concerns;

  use App\Models\StoreLanguage;
  use Illuminate\Database\Eloquent\Model;
  use Illuminate\Database\Eloquent\Relations\HasMany;

  trait HasTranslations
  {
      /** Set by the consuming model; never inferred. */
      abstract protected function translationModel(): string;

      /** @return HasMany<Model, $this> */
      public function translations(): HasMany
      {
          return $this->hasMany($this->translationModel());
      }

      /**
       * Resolve one translatable field for a store language, falling back to the store
       * default when the field is absent there. Returns null when neither supplies it —
       * NEVER throws, because this runs on a list-rendering path (D-6).
       */
      public function translated(string $field, ?string $storeLanguageId = null): ?string
      {
          $requestedId = $storeLanguageId ?? StoreLanguage::defaultStoreLanguage()->id;
          $defaultId = StoreLanguage::defaultStoreLanguage()->id;

          // Reads the ALREADY-LOADED relation collection, never the relation method —
          // ->translations() would re-query per call and defeat eager loading (R-4).
          $value = $this->translations->firstWhere('store_language_id', $requestedId)?->{$field};

          if ($value !== null && $value !== '') {
              return $value;
          }

          return $this->translations->firstWhere('store_language_id', $defaultId)?->{$field};
      }

      /** Eager-load only the two languages a render actually needs, never every locale (R-4). */
      public function scopeWithTranslationsFor(Builder $query, ?string $storeLanguageId = null): void
      {
          $ids = array_unique(array_filter([$storeLanguageId, StoreLanguage::defaultStoreLanguage()->id]));

          $query->with(['translations' => fn ($q) => $q->whereIn('store_language_id', $ids)]);
      }
  }
  ```

  **`translated()` is per-field, not per-row, and that is load-bearing** — see **D-5**. It is invisible on this pilot (a category has one field) and becomes the whole point on 0076/0078.

- **`app/Actions/Translations/SetTranslation.php`** — the single write primitive, in a **new cross-cutting-concern folder**, not a module area (**D-8**):

  ```php
  namespace App\Actions\Translations;

  final class SetTranslation
  {
      /** @param  array<string, string|null>  $attributes */
      public function __invoke(Model $translatable, StoreLanguage $language, array $attributes): Model
      {
          return $translatable->translations()->updateOrCreate(
              ['store_language_id' => $language->id],
              $attributes,
          );
      }
  }
  ```

  **This action deliberately does not authorize, and the reason is specific rather than an exemption** — see **D-9**. It is `updateOrCreate` on the `(entity, language)` natural key, which is what makes re-translating replace rather than duplicate.

### Create — the Product Categories pilot

- **`database/migrations/<timestamp>_create_product_category_translations_table.php`** — the child table plus its backfill, in one `up()`, following [`add_status_to_users_table`](../../database/migrations/2026_08_11_175426_add_status_to_users_table.php)'s precedent of backfilling in the same migration that creates the thing needing backfilling:

  ```php
  public function up(): void
  {
      Schema::create('product_category_translations', function (Blueprint $table): void {
          $table->uuid('id')->primary();
          $table->foreignUuid('product_category_id')->constrained('product_categories')->cascadeOnDelete();
          $table->foreignUuid('store_language_id')->constrained('store_languages')->restrictOnDelete();
          $table->string('name', 255);
          $table->timestamps();

          $table->unique(['product_category_id', 'store_language_id']);
          $table->unique(['store_language_id', 'name']);
      });

      app(BackfillProductCategoryTranslations::class)();
  }

  public function down(): void
  {
      Schema::dropIfExists('product_category_translations');
  }
  ```

  Four decisions in that block, each argued below: the UUIDv7 PK (**D-2**), the two *different* `onDelete` behaviours (**D-3**), the `unique(['store_language_id', 'name'])` per-language uniqueness backstop (**D-7**, and the subject of open question **Q2**), and the backfill living in an **extracted, testable class** rather than inline (**D-11**).

  `constrained('product_categories')` and `constrained('store_languages')` both pass the table name **explicitly**. For `product_category_id` this is required — Laravel would infer `product_categories` correctly here, but the habit is what [migrations.md](../../docs/database/migrations.md#an-fk-column-does-not-also-get-an-explicit-index-here) records. For `store_language_id` it is **defensive readability only**: `store_language_id` → `store_language` → `store_languages` resolves correctly unaided. 0068's backlog item 3 describes passing it as required "per migrations.md's rule"; that rule is about *inference failure* (`parent_id` → `parents`, `uploaded_by` → `uploadeds`), which does not apply here. Recorded so nobody reads it as load-bearing when it is not (**R-8**).

  ⚠️ **Correction, 2026-08-29 — this originally claimed four indexes; it is three.** No explicit `index()` on either FK column — `constrained()` supplies what InnoDB requires, but re-reading the migration above: `store_language_id` **is** the leftmost column of the *second* `unique(['store_language_id', 'name'])`, not merely the first. So both FK columns are covered as a leftmost prefix of one of the two `UNIQUE`s — `product_category_id` by the first, `store_language_id` by the second — and InnoDB auto-creates no separate FK index for either. Expect **three** real indexes: `primary` and the two `UNIQUE`s. Verify with `php artisan db:table product_category_translations` rather than by reading the migration, as the rule below already says — this file's own first draft is the reason that rule exists. Sibling stories 0072 and 0074, applying this same shape to their own tables, independently found three and flagged this file's "four" as self-contradictory; this correction reconciles it rather than leaving three files disagreeing about one pattern.

- **`database/migrations/<timestamp>_drop_name_from_product_categories_table.php`** — a **second, separate** migration, ordered strictly after the first (**D-4**):

  ```php
  public function up(): void
  {
      Schema::table('product_categories', function (Blueprint $table): void {
          $table->dropUnique(['name']);   // explicitly, before the column — migrations.md's own rule
          $table->dropColumn('name');
      });
  }

  public function down(): void
  {
      Schema::table('product_categories', function (Blueprint $table): void {
          $table->string('name')->nullable();
          $table->unique('name');
      });
  }
  ```

  **`down()` is deliberately not a perfect inverse, and that is stated rather than hidden**: it restores the column and index but cannot restore the values, which now live in the child table. It is `nullable()` for exactly that reason — a non-nullable restore would fail against any existing row. This is the one place in this story where the repo's `down()`-symmetry rule is knowingly bent; a rollback across this pair is data-lossy in the same way [ADR 0001's own `users` conversion set](../../docs/decisions/0001-uuid-primary-keys.md#consequences) is, and for the same reason.

- **`app/Actions/ProductCategories/BackfillProductCategoryTranslations.php`** — the extracted backfill (**D-11**), fail-loud per [seeder-safety.md](../../docs/security/seeder-safety.md#a-catalog-seeder-must-fail-loudly-rather-than-commit-a-structurally-invalid-catalog)'s posture:

  ```php
  public function __invoke(): int
  {
      $defaultLanguageId = DB::table('store_languages')->where('is_default', true)->value('id');

      throw_if($defaultLanguageId === null, new RuntimeException(
          'Cannot backfill product_category_translations: no default store language exists. '
          .'Run StoreLanguageSeeder before this migration.',
      ));

      // ... one row per existing category, name copied byte-for-byte, id generated per HasUuids
  }
  ```

  Query builder, never the Eloquent model — a migration must not depend on a model whose shape a later story can change, matching `add_status_to_users_table`'s precedent of importing an enum for a *value* but never a model for control flow.

- **`app/Models/ProductCategoryTranslation.php`** — `use HasFactory, HasUuids;`, `#[Fillable(['name'])]`. `name` **is** fillable here (unlike `Media`'s server-derived columns) because it is genuinely form-supplied; `product_category_id` and `store_language_id` are omitted and written only by `SetTranslation`'s explicit key list. `belongsTo` both parents.
- **`database/factories/ProductCategoryTranslationFactory.php`** — with a `forLanguage(StoreLanguage $language)` state, so no test has to hand-build the FK pair.

### Modify — the Product Categories pilot

- **`app/Models/ProductCategory.php`** (0023's) — `use HasTranslations;` plus the one thing the trait cannot infer:

  ```php
  protected function translationModel(): string
  {
      return ProductCategoryTranslation::class;
  }
  ```

  `#[Fillable(['name'])]` becomes **`#[Fillable([])]`** — the parent row now has no mass-assignable column at all, the same zero-fillable shape 0068's `StoreLanguage` reaches by a different route.

- **`app/Models/StoreLanguage.php`** (0068's) — gains **one** method, the memoised default resolver (**D-10**):

  ```php
  private static ?self $defaultCache = null;

  public static function defaultStoreLanguage(): self
  {
      return self::$defaultCache ??= static::query()->where('is_default', true)->firstOrFail();
  }
  ```

  **The memo lives on `StoreLanguage`, never inside `HasTranslations`** — PHP gives each consuming class its own copy of a trait's static properties, so a trait-resident memo would silently become one cache per translatable model, each independently querying for the same global row.

- **`app/Concerns/ProductCategoryValidationRules.php`** (0023's) — `nameRules()` gains a `string $storeLanguageId` parameter and its uniqueness check is scoped to that language. The two-layer scheme 0023's **D-4** established is unchanged in kind — normalised PHP comparison through the shared `App\Actions\NormalizeForSearch` as the primary guard, DB unique index as the backstop — only re-scoped from global to per-language.
- **`app/Actions/ProductCategories/CreateProductCategory.php`** and **`RenameProductCategory.php`** (0023's) — **signatures unchanged** (`__invoke(string $name)` / `__invoke(ProductCategory $c, string $name)`), meaning narrowed to *"the default store language's name"* (**D-12**). Each constructor-injects `SetTranslation`, per [code-style.md](../../docs/conventions/code-style.md#exception-an-actions-own-dependency-is-constructor-injected-when-the-method-signature-is-a-public-contract)'s documented exception. `CreateProductCategory` writes the parent row and its default-language translation in **one transaction**.
- **`app/Actions/ProductCategories/DeleteProductCategory.php`** — **untouched.** `cascadeOnDelete()` removes translations with the parent; nothing about translatability touches deletion, and this file exists to be extended by story 0024's in-use guard, not by this one.
- **`config/store-languages.php`** (0068's) — **the entire production diff is one appended array literal**, which is 0068's **D8** contract:

  ```php
  'translation_relations' => [
      ['table' => 'product_category_translations', 'column' => 'store_language_id'],
  ],
  ```

  No closures, survives `config:cache`. No edit to `RemoveStoreLanguage`, to `StoreLanguage::translationUsageCount()`, or to any component — that is the property being verified, not merely asserted.

- **`lang/en/products.php`** / **`lang/es/products.php`** — the validation `attributes` leaf and any refusal copy the changed rules reference, key-for-key identical.

### Deliberately not touched

- **`database/seeders/RolePermissionSeeder.php`** — no new permission, no new module slug. The catalog stays at **42** permissions, `Administrator` at 41 of 42. Translating a category authorizes against the *same* `products.*` abilities 0023's **D-8** already established (**D-13**).
- **`app/Policies/ProductCategoryPolicy.php`** — no new ability. There is deliberately **no `TranslationPolicy`** (**D-13**).
- **`app/Actions/StoreLanguages/*`**, **`app/Models/LocaleSetting.php`**, **`app/Http/Middleware/SetUiLocale.php`** — all 0068/0066 territory. This story adds one method to `StoreLanguage` and touches nothing else in that domain.
- **`resources/views/**`**, **`app/Livewire/**`**, **`config/modules.php`** — no screen, no sidebar entry.

## The public contract siblings 0072 / 0074 / 0076 / 0078 consume

```php
// App\Concerns\HasTranslations — mixed into every translatable model
public function translations(): HasMany;
public function translated(string $field, ?string $storeLanguageId = null): ?string;   // null-safe, never throws
public function scopeWithTranslationsFor(Builder $query, ?string $storeLanguageId = null): void;
abstract protected function translationModel(): string;                                 // the one thing each model declares

// App\Models\StoreLanguage — one added method
public static function defaultStoreLanguage(): self;   // memoised per request

// App\Actions\Translations\SetTranslation
public function __invoke(Model $translatable, StoreLanguage $language, array $attributes): Model;
```

**The copyable recipe, in the order a sibling performs it:**

1. Create `<entity>_translations`: UUIDv7 PK; `foreignUuid('<entity>_id')->constrained('<entities>')->cascadeOnDelete()`; `foreignUuid('store_language_id')->constrained('store_languages')->restrictOnDelete()`; one column per translatable field, sized to match the parent's original; `unique(['<entity>_id', 'store_language_id'])`; optionally `unique(['store_language_id', <the field that was globally unique>])`; `timestamps()`. No explicit `index()` on either FK.
2. Create `<Entity>Translation` — `HasFactory, HasUuids`, `#[Fillable([...translatable fields only])]`.
3. On the parent: `use HasTranslations;` plus `translationModel()`. Drop the now-translated columns from `#[Fillable]`.
4. Re-scope the entity's existing `<Noun>ValidationRules` uniqueness by `store_language_id`, still folded through the shared `NormalizeForSearch`.
5. Reuse `SetTranslation` **unmodified** — a sibling is a consumer, never a re-implementer.
6. Append **exactly one** `{table, column}` literal to `config/store-languages.php`.

**What a sibling must NOT re-derive:** the per-field fallback chain (**D-5**), the default-language memo (**D-10**), the authorization shape (**D-13**), the `SetTranslation` primitive, and the drift-guard test (**D-14**) — which picks a new entry up for free.

**What does NOT generalise, and is 0070's alone:** the backfill and its tests. This story retrofits a table that already holds untranslated rows; siblings whose parent tables are greenfield have nothing to migrate.

## Tests to perform — 3. QA test cases / validation scenarios

Feature and Unit only. **No browser tests** — this story ships no screen.

### Fallback resolution (the highest-value block)
- [ ] Unit: translation present for the requested language → that value returned.
- [ ] Unit: missing for requested, present for default → **the default's value specifically**, not merely "non-null". *Why the distinction matters:* a non-null assertion passes even if the resolver silently picked the first translation alphabetically rather than the actual default.
- [ ] Unit: missing for both → returns `null` and **does not throw** (**D-6**).
- [ ] Unit: **per-field** fallback — a row present in the requested language with one field populated and another `null` resolves each field independently. *Risk if missing:* this is invisible on the single-field pilot and is the whole mechanism on 0076/0078; it must be pinned here, on the story that owns the contract, using a two-field fixture even though `ProductCategory` has one field.
- [ ] Unit: the requested language is **inactive** → the translation still resolves (**D-6**). *Risk if missing:* a future defensive `is_active` filter would silently defeat 0068's **D5**, whose entire purpose is that removal preserves readable content.
- [ ] Feature: the default store language is **changed** under a catalog translated only into the old default → resolution re-points to the new default and the old-default-only category resolves to `null` without error. *Why:* this is a normal operation, not data corruption — see **R-2**.
- [ ] Feature: **no default store language row at all** (forced with `DB::table()->update()` to bypass 0068's actions) → the failure is loud and legible, not an unhandled null-property error.

### Uniqueness, re-scoped per language
- [ ] Feature: two categories, same normalised name, **same** language → refused.
- [ ] Feature: two categories, **identical normalised name**, **different** languages → **accepted**. *Why this exact pairing:* it is the only test that proves the scope moved from global to per-language. It must use the byte-identical string in both languages — a fixture that also differs in case or whitespace would pass under a rule that ignores language scoping entirely, because the incidental difference would be doing the work.
- [ ] Feature: re-saving a category's own name in the same language → accepted, not refused as a duplicate.
- [ ] Feature: case-only and accent-only duplicates **within** one language still collide (`"Nino"` / `"Niño"`), proving the comparison still routes through `NormalizeForSearch`.
- [ ] Feature: the same accent-folded pair in **different** languages does **not** collide.
- [ ] Feature: a **foreign-key** violation (a nonexistent `store_language_id`) is **not** misattributed as a duplicate-name validation error. *Why:* 0023's `23000` catch was written for a table with exactly one unique constraint; this table has two `UNIQUE`s plus two FKs, so a blanket `23000` → "name taken" translation is newly wrong here.
- [ ] Feature: blank and whitespace-only translations are refused on **every** language path, not only the default. *Why:* 0023's blank-name refusal must be re-derived for the per-language write path; a rule threaded through one call site and not the other fails silently in one direction only.

### The backfill
- [ ] Feature: `BackfillProductCategoryTranslations` invoked directly against N arranged categories writes **exactly one** translation row each, in the default store language, with the name **byte-identical** to the original — asserted per row, **never** as a row count. *Why:* a count assertion passes even if every row got the wrong name, an empty string, or all rows collapsed to one value — the [count-assertion failure mode](../../docs/errors-log.md#a-count-based-assertion-over-rendered-html-counted-a-wrapper-element-it-never-meant-to-include--2026-08-21) this project records.
- [ ] Feature: names with leading/trailing whitespace and a name at the 255-character boundary survive the backfill unchanged.
- [ ] Feature: the backfill with **no default store language** throws and writes nothing.
- [ ] The migration itself is **not** separately tested — `RefreshDatabase` proves it runs, and extracting the logic (**D-11**) is what makes the part that could actually be wrong testable. This is a deliberate application of [what-not-to-test.md](../../docs/testing/qa/what-not-to-test.md)'s migration rule, legitimate **only because** of the extraction; left inline it would be an untested data transform wearing a green checkmark.

### The `translation_relations` registry
- [ ] Feature: `StoreLanguage::translationUsageCount()` returns the **true count** of translations in a given language, now that a real entry is registered. This is what turns 0068's **R-7** from a negative assertion into a verified one.
- [ ] Feature (**the drift guard**, 0068 backlog item 2 — **D-14**): every registered `{table, column}` pair resolves against the live schema (`Schema::hasTable()` / `Schema::hasColumn()`), **and** every table matching the `*_translations` suffix appears in the registry. The second half is the likelier failure — a sibling story forgetting to append its entry — and it is derived from the live schema rather than a hardcoded list, so it never goes stale and no sibling ever writes its own.
- [ ] Feature: `php artisan config:cache` succeeds with the appended entry — run as an assertion, not trusted to review (0068 **R-8**).
- [ ] **Not written:** an assertion that `config('store-languages.translation_relations')` equals a literal array. That duplicates the file without verifying behaviour — [what-not-to-test.md](../../docs/testing/qa/what-not-to-test.md)'s static-config rule. The drift guard asserts a **schema fact**, which is why it is real coverage and this would not be.

### Query shape
- [ ] Feature: rendering N categories through `withTranslationsFor()` issues a **bounded** number of queries regardless of N — asserted with a query count, and proven able to move by removing the eager load.
- [ ] Feature: `translated()` reads the already-loaded relation and issues **no** additional query per call. *Why:* `$model->translations()` (the relation *method*) and `$model->translations` (the *property*) look near-identical and only the second respects eager loading.

### Authorization
- [ ] Feature: an actor without `products.edit` cannot write a translation; an actor with it can.
- [ ] Feature: an actor holding `products.edit` and **zero** `store-languages.*` permissions can author a translation (**D-13**).
- [ ] Feature: `CreateProductCategory` still requires `products.create`, not `products.edit`, even though it now writes a translation. *Risk if missing:* this is the exact bug that would follow from making `SetTranslation` self-authorize `update` — see **D-9**.
- [ ] Unit: `ProductCategoryPolicy`'s four abilities are unchanged in meaning — no new ability, tested for a holder and a non-holder.

### Deliberately NOT tested here
- [ ] **`NormalizeForSearch`'s own folding table** (ß, ç, CJK, whitespace, idempotence) — owned and unit-tested by story 0022. Duplicating it creates a second specification of the fold that can drift from the first; this story proves category names *go through* it via the case/accent cases above.
- [ ] **`StoreLanguage`'s own CRUD and invariants** (add/remove/default-swap, last-active guard, default-must-be-active) — 0068's. This story tests only the *interaction* points where behaviour is genuinely new.
- [ ] **Anything rendered** — no Livewire test, no Blade assertion, no language tabs.

## Expected outcome

`product_categories` no longer carries a `name` column; every category's name lives in `product_category_translations`, one row per store language, with existing rows backfilled into the store default. `ProductCategory::translated('name')` returns the requested language's name, the store default's when that is absent, and `null` when neither exists — never an exception, on any path. A category can be translated into any store language by an administrator holding only `products.edit`, with uniqueness enforced per language rather than globally. `StoreLanguage::translationUsageCount()` returns a real number for the first time, so story 0069's removal-warning line renders without any component change. Four sibling stories can now add translations to their own entities by writing one migration, one model, two lines of parent-model wiring and one appended config literal.

## Acceptance criteria

- [ ] `product_category_translations` exists with a UUIDv7 primary key, two non-nullable UUID FKs, a `name`, and timestamps; `php artisan db:table product_category_translations` reports exactly **three** indexes (`primary` and both `UNIQUE`s — `store_language_id` is the leftmost column of the second `UNIQUE`, so no separate FK index is auto-created; corrected 2026-08-29, see the note above the migration block).
- [ ] The FK to `product_categories` cascades on delete; the FK to `store_languages` restricts, and is understood to be defensive-only because 0068's **D5** never deletes a row.
- [ ] `product_categories.name` and its `unique('name')` index are gone, dropped in a **separate** migration ordered after the one that creates and populates the child table.
- [ ] Every pre-existing category holds exactly one translation row in the store default language, with its name preserved byte-for-byte.
- [ ] The backfill aborts loudly when no default store language exists, and writes nothing.
- [ ] `translated()` resolves requested → default → `null`, **per field**, and never throws.
- [ ] A translation authored in a store language that is later removed remains readable.
- [ ] Name uniqueness is enforced per store language, through the shared `NormalizeForSearch` fold, with the composite `UNIQUE` as the backstop and no `23000` misattribution across the table's **three** constraints (corrected from "four" — see above).
- [ ] Authoring a translation requires the entity's own `products.*` ability and **no** `store-languages.*` permission; the permission catalog is unchanged at 42.
- [ ] `config/store-languages.php` gains **exactly one** appended array literal, contains no closures, and survives `config:cache`; `RemoveStoreLanguage`, `StoreLanguage::translationUsageCount()` and every component are untouched.
- [ ] The drift-guard test fails when a registered pair is broken **and** when a `*_translations` table exists unregistered.
- [ ] `HasTranslations` and `SetTranslation` are consumed, not re-implemented, by the pilot — no fallback logic exists at any call site.

## Definition of Done
- [ ] Tests written and green (**full suite unscoped**, not `--filter`)
- [ ] `vendor/bin/pint --format agent` run **unscoped**, not `--dirty`
- [ ] **Larastan level 7 run and recorded** — named explicitly because [errors-log.md](../../docs/errors-log.md#a-verification-record-that-lists-two-of-three-quality-gates-is-a-record-of-two-gates--2026-08-26) records three consecutive stories whose verification notes listed two of three gates and were read as records of all three
- [ ] Code reviewed (code-reviewer)
- [ ] No security findings (appsec-auditor)
- [ ] Documentation updated (docs-keeper) — at minimum `docs/database/schema.md` (a new domain table, and the **first** table in this app whose rows are per-language content), `docs/database/migrations.md` (the first migration in this repo that **removes** a source-of-truth column after backfilling it elsewhere, and the first knowingly non-inverse `down()`), `docs/conventions/base-standards.md` (`app/Actions/Translations/` as a **cross-cutting concern** folder, and `HasTranslations` as the first app-owned behavioural trait in `app/Concerns/` that is not a validation-rules trait), `docs/conventions/naming.md` (`<Entity>Translation` and `<entity>_translations` as the pattern four siblings copy), and `docs/architecture/authorization.md` (recording that translated content adds **no** ability and **no** permission — a deliberate non-addition worth stating so a later story does not add one)
- [ ] **Recorded as a handoff, not done here:** the sibling-story amendments in **R-1** and **R-3**. This story edits no other story's file.
- [ ] Acceptance criteria met

## 4. Documented functional decisions

**D-1 — A child table, not a JSON column.** 0023's **D-7** left this open ("a `product_category_translations` child table, or a JSON column"); it resolves decisively toward the child table, and the first reason alone would settle it. **(i) 0068's registry structurally requires a real column.** Its **D8** already committed to `DB::table($table)->where($column, $languageId)->count()` as the *entire* generalized removal-warning mechanism for every future translation table. That is a plain equality filter on a real column; a JSON blob cannot satisfy it without `JSON_CONTAINS` special-casing inside a helper that must stay generic. Choosing JSON does not merely cost something here — it breaks a contract 0070 does not get to renegotiate, since 0068 is closed-spec on it. **(ii) Per-language uniqueness needs something indexable.** 0023's **D-4** two-layer scheme (normalised PHP comparison primary, DB index backstop) has no backstop at all against a JSON column, reducing a deliberately two-layer guarantee to one. **(iii) No referential integrity.** A JSON object's keys are strings with no FK; a stale or typo'd language reference sits invisibly inside a blob forever. **(iv) Multi-field generalisation.** 0076/0078 translate five fields; one row per `(entity, language)` with a column per field is the shape that composes with Eloquent eager loading, while JSON degenerates into either five blobs or one blob that makes "which products lack a French title" unanswerable without decoding every row. The one thing JSON would buy — no join on a single-language read — is worth nothing here, because **D-10**'s eager-load shape reaches two total queries for a whole list anyway, and this repo has **zero** precedent for business data in a JSON column.

**D-2 — UUIDv7 primary key, following ADR 0001 Amendment 1 unchanged; no new ADR exception. (`database-expert` recommended otherwise; the dissent is recorded.)** [Amendment 1](../../docs/decisions/0001-uuid-primary-keys.md#amendment-1-2026-08-27--the-scope-is-the-policy-not-the-list-of-seven) states the policy as *"every new business entity is UUIDv7"*, with **one** named exception for a high-volume internal geography lookup table. `database-expert` argued for a `bigint` surrogate on the grounds that a translation row is never addressed by its own id (its natural key is the `(entity, language)` pair, which every read path already holds), that enumeration safety therefore cannot apply, and that this becomes the highest-row-count table the repo has created — asking for the same explicit ADR-amendment treatment stories 0016 and 0019 received. **Rejected, for three reasons.** *(i)* The volume argument does not reach the named exception's bar: products × store languages in a backoffice catalog is 10³–10⁴ rows, three to four orders of magnitude below a geography lookup table, and 36 bytes across 10⁴ rows is not a cost worth a policy carve-out. *(ii)* 0068's **D19** precedent is a *different structural case* — a singleton, where a second row can never exist to enumerate toward — and importing its reasoning here would stretch it past what it argued. *(iii)* Amendment 1 explicitly weighs this trade already and records that **a mixed-PK domain is worse than an over-provisioned key**; adding a third exception in the story that is supposed to establish a pattern four siblings copy would make "what PK does a translation table use" a per-story question forever. The upside of the rejected option — a genuinely smaller key — is real but small; the upside of the chosen one is that **no sibling has to think about it**, which is this story's whole purpose. *Also rejected:* a true composite PK with no surrogate — no model in this repo uses one, and Eloquent's `find()`/route-binding/factory tooling all assume a single key column.

**D-3 — The two foreign keys behave differently on delete, and the asymmetry is the point.** `product_category_id` is **`cascadeOnDelete()`** — a translation has no meaning without its parent; it *is* the parent's dependent data, the same "worthless without its owner" test [`create_passkeys_table`](../../database/migrations/2024_01_01_000000_create_passkeys_table.php) already applies. This is the **first** cascade in this repo's own domain tables, and it is deliberate: `sales_regions.parent_id` uses `restrictOnDelete()` precisely because a cascade there would destroy administrator-configured tax rates, whereas here the cascade destroys exactly the data that has just become meaningless. `store_language_id` is **`restrictOnDelete()`** per 0068 backlog item 3, and is **defensive only — it will essentially never fire**, because 0068's **D5** makes removal an `is_active` flip and never a delete. That makes it the third instance of a pattern [migrations.md](../../docs/database/migrations.md) already documents for `media.uploaded_by`: keep the clause because it is correct against a genuine hard delete, but never write code that relies on it running.

**D-4 — `product_categories.name` is dropped, not kept as a denormalised mirror. (`database-expert` recommended keeping it; this is the story's most consequential reversal of an expert recommendation.)** The alternative — keep `name` on the parent as a cached copy of the default-language translation, with a single named writer — is genuinely attractive: it breaks nothing, and this repo has a precedent for a seeder-owned denormalised column in `SalesRegion.name`. **It was rejected because the store default is not fixed.** PRD Epic 5 makes *"set French as the store's default language"* an explicit, supported operation, and 0068 ships `SetDefaultStoreLanguage` to perform it. Under the mirror design, that single action would have to rewrite the mirror column of **every row of every translatable table in the application** to stay correct — a cross-table resync that 0068 never anticipated, that would put real behaviour inside an action this story is forbidden to edit, and that would destroy **D8**'s central promise that a later story extends the mechanism by *"appending one array literal, and nothing else"*. A denormalised copy is cheap only while the thing it denormalises is stable; here it demonstrably is not. Dropping the column makes a default change **free** — the fallback simply resolves through a different row. *The cost, stated plainly and not minimised:* four already-written sibling stories order by a parent `name` column that will not exist (**R-1**), and `down()` becomes knowingly non-inverse. Both are one-time, reviewable costs; the resync obligation would have been permanent and silent.

**D-5 — Fallback resolves per **field**, not per row.** A naive reading of the PRD sentence (*"a missing translation falls back to the default store language"*) suggests: if the requested language's row is absent, use the default's row. That is indistinguishable from per-field resolution on this pilot, because a category has exactly one translatable field — and it is **wrong** the moment 0076 ships. Per-row fallback means a product correctly titled in French but with no French description loses its French **title** too, because the whole row is discarded in favour of the default's. Per-field costs nothing here, degrades to identical behaviour for single-field entities, and is the only version that stays correct for the multi-field siblings. **It must nonetheless be tested here**, on the story that owns the contract, with a two-field fixture — a regression is structurally invisible to every test `ProductCategory` alone can write.

**D-6 — Missing in both languages returns `null`; the mechanism never throws, and an inactive language is never refused.** Two branches, one reason. *(a) Missing everywhere → `null`.* This is **not** purely a data-corruption state: the moment an administrator promotes a new default (**R-2**), every entity translated only into the *old* default reaches this branch, in normal operation, on a live store. Throwing would take down an entire list render because one row is under-translated — the failure mode this repo already guards against by using `Gate::allows()` rather than `authorize()` in a list query. The rendering layer applies the em-dash convention `users.blade.php` and `roles.blade.php` already use for "nothing here". *(b) An inactive requested language still resolves.* 0068's **D5** exists specifically so a removed language's content survives and stays re-editable; a read path that silently refused an inactive `store_language_id` would defeat half of that decision's own reasoning. **The `is_active` filter belongs one layer up**, at the UI's "which tabs do I render" decision — never inside the fallback. Recorded emphatically because adding that guard is a plausible defensive reflex for a later reviewer, and it would be a regression. *Deliberately unresolved by the mechanism:* whether the flagged default row is itself active. 0068's **D6** makes that unreachable through its actions, and re-validating it on every read would be [a domain invariant enforced in the wrong place](../../docs/architecture/authorization.md#a-domain-invariant-is-not-an-authorization-rule-and-does-not-live-here).

**D-7 — Uniqueness moves from global to per-language, keeping 0023's two-layer scheme unchanged in kind.** 0023's **D-4**/**D-12** made category-name uniqueness a normalised PHP comparison through the shared `App\Actions\NormalizeForSearch`, with `unique('name')` as a defence-in-depth backstop. The direct port is `UNIQUE(store_language_id, name)` plus the same PHP fold scoped by language. Two consequences worth stating. *(i)* The same name in two different languages must be **permitted** — a store may legitimately hold a category named "Chaussures" in French and another named "Chaussures" in Spanish, and the test proving this is the only one that can catch a missing language scope in the `WHERE` clause. *(ii)* The `23000` catch 0023 wrote for a single-constraint table is **newly unsafe**: this table has two `UNIQUE`s and two FKs, so blanket-translating `23000` to "name taken" would misreport an FK violation. Whether uniqueness should bind in *non-default* languages at all is a genuine product question — raised as **Q2**.

**D-8 — `app/Actions/Translations/` is a new cross-cutting-concern folder, not a module area.** [base-standards.md](../../docs/conventions/base-standards.md#directory-structure) is explicit that a subfolder is either a module area or a **named cross-cutting concern**, and that a class serving two areas belongs to the concern rather than to whichever area called it first — the rule `app/Actions/Auth/` established and `LogRefusedPrivilegedAttempt` confirmed by being imported from seven classes across two areas. `SetTranslation` will be imported by ProductCategories, Products, BlogCategories, BlogTags and BlogPosts equally; filing it under `ProductCategories/` would make every later sibling's import read as a cross-area dependency on a module it has nothing to do with. `Translations` names the concern; a `Shared/` or `Common/` catch-all is explicitly forbidden by the same rule.

**D-9 — `SetTranslation` deliberately does **not** authorize, and the reason is structural rather than an exemption.** [base-standards.md](../../docs/conventions/base-standards.md#an-authorization-rule-belongs-to-the-action-not-to-one-of-its-callers)'s rule is that an authorization rule belongs to the action performing the operation, so the obvious move is `Gate::authorize('update', $translatable)` inside `SetTranslation` — generic, and it would work. **It is wrong, and the counter-example is concrete:** `CreateProductCategory` calls `SetTranslation` to write the new category's default-language name. If the primitive authorizes `update`, then *creating* a category would require `products.edit` rather than `products.create`, silently locking out an actor granted exactly the permission for the job. The alternative — passing the ability name in as a parameter — is the shape this project's own errors log records as [a guard taking the state it guards as a parameter](../../docs/errors-log.md#a-guard-took-the-state-it-was-guarding-as-a-parameter-reopening-its-own-hole-one-level-up--2026-08-20), making the guard only as strong as every present and future call site. So: **`SetTranslation` is a persistence primitive whose correct ability is a property of the calling operation, not of itself**, and the calling action authorizes before invoking it. `backend-expert` reached the same conclusion by analogy to `DeleteProductCategory`; the create/update permission split above is the harder reason and is recorded as the operative one. ⚠️ This is a genuine narrowing of the action-owns-the-rule convention and must be read narrowly: it applies to a primitive shared across operations with *different* abilities, never as licence to leave a domain action ungated.

**D-10 — The default-language lookup is memoised in a static on `StoreLanguage`, with no cache layer.** 0068's **D27** settled the identical question for `LocaleSetting` and its reasoning transfers without modification: `CACHE_STORE=database` in this app today, so a cache *hit* is an indexed read against the `cache` table replacing an indexed read against a table that starts at one row and stays in the dozens — no gain, plus an invalidation obligation and a staleness class of bug. What actually needs solving is **query count within one request**, which a static memo solves for free on this NTS, Octane-free stack. **The memo lives on `StoreLanguage`, never in `HasTranslations`** — PHP gives each consuming class its own copy of a trait's static properties, so a trait-resident memo would become one independent cache per translatable model, each querying for the same global row. Two obligations follow, neither of which 0068 had to name: the memo needs an explicit reset between Pest cases if process state is shared (**R-6**), and the list read path must eager-load via `withTranslationsFor()` restricted to the requested + default language ids, never `with('translations')` unbounded, which would load every language for every row.

**D-11 — The backfill is an extracted, container-resolved class, not logic inside the migration closure.** [what-not-to-test.md](../../docs/testing/qa/what-not-to-test.md) legitimately excuses migration mechanics because `RefreshDatabase` proves every migration runs — but that argument covers **DDL**, not a **data transform** embedded in one. "The `ALTER TABLE` succeeded" and "every pre-existing category got exactly one translation row with its exact original name" are different claims, and `RefreshDatabase` proves only the first. Worse, the transform is *structurally unarrangeable* in a test that uses `RefreshDatabase`: by the time a test body runs, the backfill has already executed against zero rows, so there is no point at which pre-existing rows can be arranged. Extracting the logic makes it directly callable and directly testable, exactly as `SalesRegionSeeder::assertValidCountryFixture()` and 0068's **D17** fixture reader already do for the same defensive reason. Left inline, this would be an untested data-transform branch — the [vacuous-coverage failure](../../docs/errors-log.md#a-pest-arch-rule-over-an-array-of-namespaces-shipped-green-while-proving-nothing--2026-08-18) this project records twice. *Rejected:* orchestrating a partial `migrate --path=` run to arrange a genuine pre-backfill state — possible, but fragile against every future migration reordering.

**D-12 — 0023's two write actions keep their signatures; their meaning narrows to "the default store language".** `CreateProductCategory::__invoke(string $name)` and `RenameProductCategory::__invoke(ProductCategory $c, string $name)` are unchanged in shape and now write the *default-language* translation rather than a scalar column. *Rejected:* widening them to `array $namesByLanguageId` — that changes a public contract story 0025 and every direct-call test bind to, for a capability nothing yet asks for (the PRD's tab UI edits one language at a time). *Rejected:* replacing them with a single generic action — it would erase the create/update permission distinction **D-9** depends on. Writing a **non-default** language goes through `SetTranslation` directly, called by whichever action the UI story adds; this story ships no such caller, which is why `SetTranslation`'s own tests call it directly.

**D-13 — Translated content adds no permission, no ability, and no policy.** Verified against 0023's **D-8**: product categories gate on the seeded **`products.view/create/edit/delete`** permissions — there is no `product-categories.*` slug in `RolePermissionSeeder::MODULES` and none should be added. Authoring a translation is *using* an already-configured language, not managing the language catalog, so it requires **no `store-languages.*` permission** — 0068's **D18** draws precisely this boundary, and requiring a second permission would invent a requirement the PRD never states. There is deliberately **no `TranslationPolicy`**: a generic cross-entity translation resource would need "may this actor touch this parent" logic, which is just `ProductCategoryPolicy::update` restated under a new name, and [`SalesRegionPolicy`](../../app/Policies/SalesRegionPolicy.php)'s own docblock records that defining abilities nothing calls adds untested surface. **No step-up requirement**, for the reason 0068's **D13** gives and this story reuses rather than re-derives: step-up binds identity-sensitive, hard-to-reverse operations, and re-typing a category's French name is neither.

**D-14 — The drift guard derives its expectation from the live schema, never from a list.** 0068's backlog item 2 assigns the first translation story the guard that every registered `{table, column}` pair actually exists. Its **easy** half is `Schema::hasTable()` / `hasColumn()` over the registry. Its **hard and more valuable** half is the inverse — a translation table that exists but was never registered, which is the likelier real failure, since a sibling story appending its entry is a step a human can simply forget. Writing that against a hardcoded expected list would defeat the entire point, because every sibling would then have to edit the test — destroying **D8**'s "append one array literal and nothing else" property. So this story establishes the `<entity>_translations` **suffix as a naming convention** and the guard enumerates tables matching it, set-equating that against the registry. One short stable string is hardcoded; the list of tables never is. This mirrors what task 0018 recorded for `config/modules.php` — both generic drift guards picked a new entry up for free.

## 5. Dependencies, risks, open technical questions

### Dependencies

- **[Story 0023](in-progress/0023-product-categories-backend.md)** — hard dependency, and **not yet implemented**. This story retrofits its table, its model, its validation trait and two of its three actions. See **R-1** and **R-3**.
- **[Story 0068](0068-store-languages-catalog-backend.md)** — hard dependency, and **not yet implemented**. Supplies `store_languages`, the `is_default` row this story's fallback resolves through, and the `translation_relations` registry this story populates. This story adds **one method** to `StoreLanguage` and touches nothing else in that domain.
- **Story 0022** — supplies `App\Actions\NormalizeForSearch`, which the re-scoped uniqueness rule keeps using unchanged. *Verified:* despite its "searchable-multi-select-component" title, 0022's **D13** genuinely does own that class, so 0023's citation is correct and not a mis-reference.
- **[Story 0069](0069-store-languages-settings-ui.md) depends on this story** in one visible way: its removal-confirmation line renders a usage count only when that count exceeds zero, which cannot happen until this story appends the first registry entry. Its own note says *"from story 0070 onward it appears automatically with no component change"* — this story is what makes that true.
- **No new Composer package.** No `spatie/laravel-translatable` or equivalent; the mechanism is ~60 lines of first-party code and a dependency would import conventions this repo has not agreed to.

### Risks

- **R-1 — Dropping `product_categories.name` (D-4) breaks four already-written sibling stories, and this story cannot fix them.** Verified by grep: `0025-product-categories-ui.md` specifies `ProductCategory::query()->withCount('products')->orderBy('name')->orderBy('id')`, and `0027`, `0060` and `0062` specify the same `orderBy('name')` shape for their own models. All four are **unimplemented Phase 1 files**, so the cost is an amendment rather than a code break — but the amendment is real and is **not** this story's to write (it must not edit another story's file). Each becomes an order over the joined translation for the requested language. **Named as a required coordination action**, not left to be discovered when 0025's tests fail against a column that no longer exists.
- **R-2 — A changed store default reaches the deepest fallback branch in normal operation, not only under data corruption.** The instant an administrator promotes French to default, every entity translated only into the *old* default has no translation in the *new* default and resolves to `null`. This is correct behaviour under **D-6**, but any UI story that assumes "every row always resolves to something" will render blanks it did not plan for. Flagged for the UI story rather than solved here, and pinned by a mandatory test above.
- **R-3 — The sequencing between this story and 0023 changes what this story *is*.** The PRD roadmap puts Epic 5 last, so the realistic case is that 0023–0065 have shipped and this is a genuine retrofit against live data — which is what the migrations above are written for. **If the coordinator instead resequences so 0070 lands before 0023 is implemented**, the far cheaper path is to amend 0023 so `product_categories.name` and its unique index are *never created*, deleting both the second migration and the backfill entirely. That is a Phase 2 decision, and it is cheaper to make than to reverse.
- **R-4 — N+1 is the default failure mode of this mechanism, in two distinct shapes.** The obvious one is rendering a list without `withTranslationsFor()`. The subtle one is `$model->translations()->where(...)->first()` (the relation **method**, which always re-queries) instead of `$model->translations->firstWhere(...)` (the **property**, which reads the hydrated collection). They differ by one character and only the second respects eager loading. Worth an explicit code-review checklist line at Phase 5.
- **R-5 — A stale relation after a write renders the pre-save value.** `SetTranslation` returns the translation row, not the parent, so a component that saves and then re-reads `$category->translated('name')` without `->load('translations')` shows the old value. Invisible to `Livewire::test()->call(...)`, which never renders — the recurring lesson that a passing component-level test proves nothing about compiled output.
- **R-6 — The static memo (D-10) needs an explicit reset between tests.** A test that promotes a new default followed by one asserting against the original can read a stale cached row if process state is shared. 0068's **D27** did not have to name this because nothing consumed its memo yet; this story is the first consumer.
- **R-7 — 0023's stated rationale rests on a premise that is false against the current repo, and both experts repeated it.** 0023's **D-4**/**R-2** justify the normalised PHP comparison partly on *"SQLite in CI, MySQL locally and in production."* **Verified false:** `phpunit.xml` sets `DB_CONNECTION=mysql` and `DB_DATABASE=testing`, `.github/workflows/tests.yml` runs a `mysql:8.4` service with `DB_CONNECTION: mysql`, and `.env.example` is MySQL — a fact [docs/database/schema.md](../../docs/database/schema.md#media) independently relies on when it notes `FULLTEXT` "genuinely would work" here. **The conclusion survives the premise:** a PHP `===` is still *weaker* than a `utf8mb4_unicode_ci` index, so the normalised comparison is still required to stop the index raising `23000` on a pair PHP accepted. But this story must not propagate the stale reason, and 0023's own text should be corrected. Recorded because both `database-expert` and `backend-qa` restated it from 0023 without verifying — `backend-qa` at least hedged it ("if that's still true"), which is the discipline that caught it.
- **R-8 — One claim in 0068's backlog item 3 is defensive advice presented as a rule.** It says `store_language_id`'s `constrained()` needs the table name passed explicitly *"per migrations.md"*. That rule is about **inference failure** (`parent_id` → a nonexistent `parents`, `uploaded_by` → `uploadeds`); `store_language_id` resolves to `store_languages` correctly unaided. Passing it is good practice and this story does, but a reader should not infer that omitting it would break — recorded so the sibling stories copying this migration know which parts are load-bearing.
- **R-9 — `Schema::getTableListing()` is unverified in this environment.** The drift guard's inverse half (**D-14**) needs a portable table listing, and this worktree has **no `vendor/` directory**, so the method's availability and signature in the installed Laravel 13 could not be confirmed by reading framework source. Phase 3 must verify it before building the guard on it; if unavailable, the fallback is `Schema::hasTable()` over a convention-derived candidate set, which is weaker and should be flagged rather than silently substituted.
- **R-10 — This is the first `cascadeOnDelete()` in the app's own domain tables.** Every existing domain FK either restricts (`sales_regions.parent_id`) or nulls (`media.uploaded_by`); the only cascade is the vendored `passkeys.user_id`. The cascade is right here (**D-3**), but it means `DeleteProductCategory` — today an unguarded `->delete()` until story 0024 adds its in-use guard — now silently destroys translation rows too. That is intended, and stated so it is met as a decision.

### Open questions for the product owner

Per [contracts.md](../../docs/contracts.md)'s Uncertainty Handling Rule, each carries a recommendation rather than a silent assumption.

**Q1 — Must every entity always hold a translation in the default store language?** This story assumes **yes** — `CreateProductCategory` writes one, and the backfill guarantees one for every pre-existing row — which keeps **D-6**'s "resolves to nothing" branch a rare state rather than the normal condition of a new category.
- **(a) Yes — a create always writes the default-language translation, and it is required — _(recommended)_.** It is the only reading under which 0023's **D-7** backfill makes sense, it keeps the deepest fallback branch exceptional, and it means a category can never be invisible in the catalog it belongs to.
- **(b) No — a category may exist with no translations**, becoming visible only once someone names it. Cheaper for a bulk-import flow, but every list screen must then render nameless rows, and "which categories are nameless" becomes a real support question.

**Q2 — Should name uniqueness be enforced in *every* store language, or only in the default?** This story assumes **every language** (**D-7**), as the direct port of 0023's confirmed "duplicate names are refused" criterion.
- **(a) Every language — _(recommended)_.** It is the faithful port of an already-confirmed rule, it keeps the mechanism uniform across siblings, and a duplicate French name is as confusing in a French-language storefront as a duplicate Spanish one is in a Spanish one.
- **(b) Default language only**, leaving other languages unconstrained. Its real advantage is workflow: mid-translation, an administrator may legitimately want two categories both temporarily reading "Chaussures" in French before finishing. Its cost is that duplicates become permanent and undetectable in every non-default language, and the `UNIQUE(store_language_id, name)` index would have to go.
- This is a genuine product call about how administrators translate in practice, not a technical one, which is why it is here rather than decided.

**Q3 — Which story owns the language-tabs UI for the taxonomy screens?** PRD Epic 5 requires each active store language to surface as a tab *"in the taxonomy management screens"*, but story **0025** (Product Categories UI) predates Epic 5 and specifies a single-name form. Nothing in the four story files read for this debate identifies a UI story for taxonomy tabs, and no `0071`/`0073` file exists in `ai-spec/tasks/` today.
- **(a) A dedicated Epic 5 UI story per taxonomy**, paired with each backend story — consistent with this project's backend-then-frontend pairing rule.
- **(b) Retrofit 0025 (and its blog equivalents) in place**, amending those files to render tabs from the start.
- **No recommendation offered**, because this is a decomposition question about a 14-story plan the product owner has already confirmed and this debate cannot see in full. Raised so the gap is met rather than discovered.

## 6. Technical tasks for later backlog creation

Derived from this debate; **none are in scope for 0070**.

1. **Amend stories 0025, 0027, 0060 and 0062** so their list queries order by the joined translation rather than a parent `name` column — **R-1**. The coordinator's, not this story's.
2. **Correct story 0023's D-4/R-2 "SQLite in CI" premise** — **R-7**. The design conclusion stands; only its stated reason is wrong, and leaving it is how a false premise gets repeated by the next three stories that read it (as it already was, twice, in this debate).
3. **Stories 0072 / 0074 / 0076 / 0078** each follow the copyable recipe above and append **one** `translation_relations` literal. None writes its own drift guard, its own fallback, or its own write primitive.
4. **0076 or 0078 — whichever ships first with more than one translatable field — must add the multi-field per-field-fallback test** that this pilot can only approximate with a synthetic fixture (**D-5**).
5. **A `slug` uniqueness decision for 0076/0078.** PRD makes slug/SEO fields translatable; whether two products may share a French slug is a routing question those stories must answer explicitly, following **D-7**'s per-language scoping reasoning rather than re-deriving it.
6. **Revisit D-10's no-cache decision when Redis lands** (PRD assumption 18), together with 0068's **D27**, which records the flush-after-commit ordering so it need not be re-derived.
7. **`ModuleRouteAccessTest.php` still covers two routes while four exist** — inherited unclosed from stories 0017/0018/0068, and untouched here since this story adds no route.

## Provenance

**Phase 1 Three Amigos debate, 2026-08-29.** Participants: `product-owner` (facilitator), `backend-expert`, `database-expert`, `backend-qa` — all three dispatched as real subagents and all three returned. **Nothing outside this file was created or modified**: no application code, migration or test was written, and the files of stories 0023, 0066, 0067, 0068 and 0069 are untouched.

**Where the three converged:** a child table over a JSON column (`database-expert` argued it from the registry contract, `backend-expert` from Eloquent composition, and neither dissented); `cascadeOnDelete()` on the parent with a defensive-only `restrictOnDelete()` on `store_language_id`; per-language uniqueness re-scoped from 0023's existing two-layer scheme; no new permission, no `TranslationPolicy`, no step-up; and a schema-derived rather than list-derived drift guard.

**They split on three points, each resolved above with the dissent recorded rather than dropped.**

*(a) The primary key.* `database-expert` recommended a `bigint` surrogate as a third named exception to ADR 0001 Amendment 1, on the ground that a translation row is never addressed by its own id and that this becomes the repo's highest-row-count table — and explicitly asked for sign-off rather than deciding it. `backend-expert` recommended UUIDv7, reasoning that a translation row holds real authored content. **Resolved in favour of UUIDv7 (D-2)**, on a third argument neither made: the amendment already weighs this exact trade and records that a mixed-PK domain costs more than an over-provisioned key, and a story whose purpose is to produce a pattern four siblings copy is the worst possible place to make the PK a per-story question. `database-expert`'s procedural point — that any divergence deserves explicit ADR treatment — is honoured by *not* diverging, which is the outcome that needs no amendment at all.

*(b) The parent `name` column.* `database-expert` recommended **keeping** it as a denormalised default-language mirror with a single named writer, to avoid breaking downstream consumers. `backend-expert` recommended it **never be created**, by amending 0023 before it ships. **Resolved by rejecting both as stated (D-4):** the column is dropped by migration, because the mirror carries a permanent, silent obligation neither expert priced — a store-default change would force `SetDefaultStoreLanguage` to resync every translatable table, putting real behaviour inside an action this story may not edit and breaking 0068 **D8**'s "append one array literal" promise outright. `backend-expert`'s amend-0023 path is preserved as the cheaper option **if** sequencing allows it (**R-3**), rather than assumed away.

*(c) Whether `SetTranslation` authorizes.* `backend-expert` said no, by analogy to `DeleteProductCategory`. The facilitator initially reached the opposite conclusion from [base-standards.md](../../docs/conventions/base-standards.md#an-authorization-rule-belongs-to-the-action-not-to-one-of-its-callers)'s action-owns-the-rule convention, then found the concrete counter-example that settles it: a self-authorizing `update` would make *creating* a category require `products.edit`. **`backend-expert`'s conclusion is adopted, with the create/update permission split recorded as the operative reason (D-9)** rather than the analogy it originally rested on.

**Two claims in the facilitator's own briefs were wrong and are corrected here rather than quietly dropped**, in the spirit of 0068's **R-18**. The brief to `backend-expert` referred to *"the existing `product-categories.*` permissions"*; **no such slug exists** — `RolePermissionSeeder::MODULES` holds ten module slugs and product categories gate on `products.*` per 0023's **D-8** (**D-13**). And the brief to `database-expert` repeated 0068's characterisation of the explicit-table-name rule; `database-expert` caught and corrected it (**R-8**).

**One claim both experts made was verified false by the facilitator** — 0023's *"SQLite in CI, MySQL in production"* premise, which `database-expert` restated as established fact and `backend-qa` restated with a hedge. `phpunit.xml`, `.github/workflows/tests.yml` and `.env.example` are all MySQL. The design conclusion survives; the stated reason does not (**R-7**, backlog item 2).

**Not run by this phase**, per [workflow.md](../../docs/workflow.md): the INVEST check (Phase 2), TDD implementation (Phase 3), security audit (Phase 4), code review (Phase 5), or the docs pass (Phase 6).
