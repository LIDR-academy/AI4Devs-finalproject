# [0072] Translatable content retrofit — Blog Categories backend

## Description
Applies the per-store-language translatable-content mechanism built by story
[0070](0070-translatable-content-mechanism-product-categories-backend.md) to the **Blog Categories**
taxonomy ([PRD Epic 5, Layer 2](../../docs/PRD/PRD.md#epic-5--internationalization); assumption 14
names "category/tag names" as translatable content, and Epic 5's own Gherkin lists **Blog category**
as a taxonomy whose name must be authorable per store language). It creates the
`blog_category_translations` child table, wires `App\Models\BlogCategory` to
`App\Concerns\HasTranslations`, re-scopes name uniqueness from global to per-store-language, backfills
every existing category into the store default language, and appends **one** entry to
[0068](0068-store-languages-catalog-backend.md)'s `translation_relations` registry.

**This story consumes a recipe; it does not write one.** `HasTranslations`, `SetTranslation` and
`StoreLanguage::defaultStoreLanguage()` are 0070's and are used **unmodified**. What this story owns is
the one place the recipe does not fit as written — see the box below.

> **Read this before anything else: this story diverges from 0070's pilot in exactly one structural
> way, and getting it wrong is a regression rather than an omission.**
>
> 0070 retrofits `product_categories`, whose story [0023](done/0023-product-categories-backend.md)
> enforces name uniqueness with a plain `unique('name')` index plus a PHP-only comparison. **Blog
> categories do not work that way.** Story [0058](0058-blog-categories-backend.md) specifies
> `blog_categories` with a stored, derived **`normalized_name`** column carrying the sole `UNIQUE`
> index, written by a `static::saving()` hook calling the shared `App\Actions\NormalizeForSearch` —
> the project-wide convention [0032's **D-N1**](0032-shipping-geography-catalog-seed.md) confirmed on
> 2026-08-18, which 0058's own **D-4** records that 0023 predates and is *"the outlier, not the
> standard"*.
>
> So 0070's literal migration snippet — `unique(['store_language_id', 'name'])` — **must not be copied
> here**. The faithful application of 0070's own *generalized* recipe (step 1: "optionally
> `unique(['store_language_id', <the field that was globally unique>])`") is
> `unique(['store_language_id', 'normalized_name'])`, because the field that was globally unique on
> `blog_categories` is `normalized_name`. Copying the pilot's literal shape would reopen the exact
> TOCTOU race 0058's D-4 already closed on the parent table. See **D-1** and **R-5**.

> **Neither dependency exists in code. Verified against the live tree at authoring time:**
> `app/Models/` holds only `User`, `Role`, `SalesRegion`, `Media`; `app/Actions/` holds only `Auth/`,
> `Fortify/`, `Media/`, `Roles/`, `SalesRegions/`, `Users/`; there is no `app/Actions/Blog/`, no
> `app/Actions/Translations/`, no `App\Actions\NormalizeForSearch`, and no `blog_categories`,
> `store_languages` or `product_categories` migration. There is **no `vendor/` directory**, so nothing
> here could be settled by executing Laravel code.
>
> **Stories 0058 (`blog_categories`), 0068 (`store_languages`) and 0070 (the mechanism) are all Phase 1
> files, not shipped code.** Everything below is designed against their *specified* shape. Phase 3
> must re-verify every signature named here against `HEAD` before writing a line of code — the
> [deferred-findings failure mode](../../docs/errors-log.md#a-deferred-storys-findings-were-claims-about-a-tree-that-no-longer-existed-and-one-of-them-would-have-reopened-a-bug-in-this-log--2026-08-23)
> this project already records once, and which applies **twice over** here (**R-12**).

## Type
backend | includes database-expert: **yes** (one new table, two migrations including a data backfill,
one retrofit of an existing table)

## 1. Refined user story

> **As** a blog editor maintaining a multilingual blog,
> **I want** each blog category's name to be stored and resolved per store language, falling back to
> the store default when a translation is missing,
> **so that** the blog taxonomy reads correctly in every language the store authors in, and a
> partially-translated catalog degrades gracefully instead of rendering blank or failing.

> **As** the engineer applying this pattern to a third and fourth entity (stories 0074, 0076, 0078),
> **I want** the one place where the pilot's recipe did **not** transfer cleanly to be recorded as a
> decision rather than rediscovered,
> **so that** an entity carrying a derived uniqueness key does not silently inherit a shape written for
> an entity that has none.

**Scope fence — this story ships no screen.** No Livewire component, no Blade view, no route, no
language tabs, no `config/modules.php` entry. The taxonomy language tabs PRD Epic 5 describes belong to
a UI story; see **R-6a**.

## Gherkin — 2. Detailed acceptance criteria (Given/When/Then)

Every scenario opens with a named business-role actor and carries exactly one `When`, per
[gherkin-guidelines.md](../../docs/testing/frontend/gherkin-guidelines.md) rules 1 and 3. The actor is
**"a blog editor"**, taken from the PRD's own Epic 4 scenarios and used consistently by 0058
(see 0058's OQ-3 glossary note, still open).

```gherkin
Feature: Per-store-language blog category names

  # --- Resolution and fallback ---

  Scenario: A blog editor reads a category translated into the requested language
    Given a blog editor, with a blog category named "Guías" in Spanish and "Guides" in French
    When the category's French name is requested
    Then "Guides" is returned

  Scenario: A missing translation falls back to the default store language
    Given a blog editor, with a blog category named "Guías" in the default store language
      and no French translation
    When the category's French name is requested
    Then "Guías" is returned, because the store default supplies the fallback

  Scenario: A category translated in neither the requested nor the default language resolves to nothing
    Given a blog editor, with a blog category holding no translation in any store language
    When the category's French name is requested
    Then no name is returned and no error is raised

  Scenario: A translation authored in a removed store language is still readable
    Given a blog editor, with a category translated into French and French since removed as a store language
    When the category's French name is requested
    Then "Guides" is returned, because removal preserves stored content

  # --- Writing a translation ---

  Scenario: A blog editor translates a category into an additional language
    Given a blog editor holding the blog edit permission, and French active as a store language
    When they set the category's French name to "Guides"
    Then the French translation is stored alongside the existing Spanish one

  Scenario: Re-translating a category replaces its existing translation for that language
    Given a blog editor, with a blog category already named "Guides" in French
    When they set the category's French name to "Guides d'achat"
    Then the French translation reads "Guides d'achat" and no second French row is created

  Scenario: Re-translating a category refreshes its stored comparison key
    Given a blog editor, with a blog category already named "Guías" in French
    When they set the category's French name to "Novedades"
    Then the stored comparison key for that French translation matches "Novedades" rather than "Guías"

  Scenario: Creating a category stores its name in the default store language
    Given a blog editor holding the blog create permission
    When they create a blog category named "Guías"
    Then the category holds exactly one translation, in the default store language

  Scenario: A blank translation is refused
    Given a blog editor holding the blog edit permission
    When they set a category's French name to a blank value
    Then the change is refused with a validation message and no translation row is written

  # --- Uniqueness, now scoped per store language ---

  Scenario: Two categories cannot share a name within one store language
    Given a blog editor, with a blog category named "Guías" in French
    When they set another category's French name to "Guías"
    Then the change is refused with a validation message

  Scenario: The same name in two different store languages is permitted
    Given a blog editor, with a blog category named "Guías" in French
    When they set another category's Spanish name to "Guías"
    Then the change is accepted, because uniqueness is scoped to one store language

  Scenario: Names differing only by accent still collide within one store language
    Given a blog editor, with a blog category named "Guías" in French
    When they set another category's French name to "Guias"
    Then the change is refused, because the comparison folds accents

  Scenario: Names differing only by accent do not collide across store languages
    Given a blog editor, with a blog category named "Guías" in French
    When they set another category's Spanish name to "Guias"
    Then the change is accepted, because the fold is scoped to one store language

  Scenario: A category keeps its own name when re-saved in the same language
    Given a blog editor, with a blog category named "Guías" in French
    When they save that same category's French name as "Guías" again
    Then the change is accepted rather than refused as a duplicate

  # --- Deletion ---

  Scenario: Deleting a category removes every language's name with it
    Given a blog editor, with a blog category translated into three store languages
    When they delete that category
    Then all three of its stored names are removed with it

  # --- Authorization ---

  Scenario: An administrator without the blog edit permission cannot translate a category
    Given a signed-in administrator who does not hold the blog edit permission
    When they attempt to set a blog category's French name
    Then the attempt is refused

  Scenario: A blog editor needs no store-language permission to author a translation
    Given a blog editor holding the blog edit permission and no store language permissions
    When they set a blog category's French name
    Then the translation is stored, because authoring content is not managing the language catalog

  # --- The removal warning this story extends ---

  Scenario: Removing a language in use reports the blog category content it affects
    Given a store administrator, with French active and holding blog category translations
    When the usage count for French is requested
    Then the count includes the French blog category translations
```

## Files to create/modify

### Create

- **`database/migrations/<timestamp>_create_blog_category_translations_table.php`** — the child table
  plus its backfill in one `up()`, following the precedent
  [`add_status_to_users_table`](../../database/migrations/2026_08_11_175426_add_status_to_users_table.php)
  sets for backfilling in the migration that creates the thing needing backfilling:

  ```php
  public function up(): void
  {
      Schema::create('blog_category_translations', function (Blueprint $table): void {
          $table->uuid('id')->primary();
          $table->foreignUuid('blog_category_id')->constrained('blog_categories')->cascadeOnDelete();
          $table->foreignUuid('store_language_id')->constrained('store_languages')->restrictOnDelete();
          $table->string('name', 255);              // must equal blog_categories.name's settled cap — R-3
          $table->string('normalized_name', 255);   // NOT NULL; no standalone unique() — D-1
          $table->timestamps();

          $table->unique(['blog_category_id', 'store_language_id']);   // the natural key
          $table->unique(['store_language_id', 'normalized_name']);    // per-language uniqueness — D-1
      });

      app(BackfillBlogCategoryTranslations::class)();
  }

  public function down(): void
  {
      Schema::dropIfExists('blog_category_translations');
  }
  ```

  Both `constrained()` calls pass the table name explicitly. For `blog_category_id` this is habit
  rather than necessity (it infers `blog_categories` correctly); for `store_language_id` it is
  **defensive readability only** — 0070's **R-8** already corrects 0068's backlog item 3 on exactly
  this point, and that correction transfers here unchanged. Do not read either as load-bearing.

  **No explicit `index()` on either FK column** — `constrained()` supplies what InnoDB requires.
  **Expect three indexes, not four** (**D-10**), and verify with
  `php artisan db:table blog_category_translations` rather than by reading the migration.

- **`database/migrations/<timestamp>_drop_name_columns_from_blog_categories_table.php`** — a
  **second, separate** migration ordered strictly after the first (**D-2**):

  ```php
  public function up(): void
  {
      Schema::table('blog_categories', function (Blueprint $table): void {
          $table->dropUnique(['normalized_name']);              // explicitly, before the column
          $table->dropColumn(['name', 'normalized_name']);
      });
  }

  public function down(): void
  {
      // KNOWINGLY NOT AN INVERSE. The values now live per-language on the child table, and a
      // parent row may hold zero, one or several translations -- there is no single value to
      // restore into a scalar column. Both columns therefore come back NULLABLE, and the UNIQUE
      // index is deliberately NOT re-added: over a column every row shows as NULL it would
      // protect nothing (NULLs are exempt from uniqueness on both MySQL and SQLite -- the same
      // property users.pending_email already relies on), while misrepresenting the state as
      // "restored". See D-11.
      Schema::table('blog_categories', function (Blueprint $table): void {
          $table->string('name', 255)->nullable()->after('id');
          $table->string('normalized_name', 255)->nullable()->after('name');
      });
  }
  ```

- **`app/Models/BlogCategoryTranslation.php`** — `use HasFactory, HasUuids;`,
  `#[Fillable(['name'])]`. `name` is genuinely form-supplied so it is fillable;
  `blog_category_id`, `store_language_id` and **`normalized_name`** are omitted — the last of these
  because it is *derived*, exactly the mass-assignment guard 0058 already applies on the parent. No
  `SoftDeletes`. `belongsTo` both parents. It carries the derivation hook that moves off the parent
  (**D-3**):

  ```php
  protected static function booted(): void
  {
      static::saving(function (self $translation): void {
          if ($translation->isDirty('name')) {
              $translation->normalized_name = app(NormalizeForSearch::class)($translation->name);
          }
      });
  }
  ```

  **`booted()`, not `boot()`** — this class extends `Model` directly with no vendor hooks to order
  against, so 0058's own reasoning (the `App\Models\Role` `boot()` precedent is a vendor-ordering
  workaround that does not apply) transfers verbatim. `app()` inside a model event is the one shape
  available, as 0058 already records.

- **`database/factories/BlogCategoryTranslationFactory.php`** — with a
  `forLanguage(StoreLanguage $language)` state, so no test hand-builds the FK pair. It **does not
  set `normalized_name`** — the hook derives it, which is itself a small proof the hook fires on the
  insert path (0058's own factory reasoning, applied to the child).

- **`app/Actions/Blog/BackfillBlogCategoryTranslations.php`** — the extracted, container-resolved
  backfill (**D-5**, **D-6**), fail-loud per
  [seeder-safety.md](../../docs/security/seeder-safety.md#a-catalog-seeder-must-fail-loudly-rather-than-commit-a-structurally-invalid-catalog):

  ```php
  public function __invoke(): int
  {
      $defaultLanguageId = DB::table('store_languages')->where('is_default', true)->value('id');

      throw_if($defaultLanguageId === null, new RuntimeException(
          'Cannot backfill blog_category_translations: no default store language exists. '
          .'Run StoreLanguageSeeder before this migration.',
      ));

      // Query builder, never the Eloquent model -- a migration must not depend on a model whose
      // shape a later story can change. Consequence: NO model event fires, so normalized_name is
      // written explicitly here, RECOMPUTED through the shared normaliser rather than copied from
      // the parent column. See D-5.
      // ... one row per existing category; name copied byte-for-byte; id via Str::uuid7()
  }
  ```

  It constructor-injects `App\Actions\NormalizeForSearch`. Chunking (`chunkById`) is an
  implementation detail Phase 3 may add; it is not a contract.

### Modify

- **`app/Models/BlogCategory.php`** (0058's) — `use HasTranslations;` plus the one thing the trait
  cannot infer:

  ```php
  protected function translationModel(): string
  {
      return BlogCategoryTranslation::class;
  }
  ```

  `#[Fillable(['name'])]` becomes **`#[Fillable([])]`** — the parent row has no mass-assignable
  column left. **Its `booted()`/`saving` hook is removed**, not relocated in place: the columns it
  derived no longer exist on this table, and its mirror is written fresh on
  `BlogCategoryTranslation`. `posts()` is 0061's and is untouched.

- **`app/Concerns/BlogCategoryValidationRules.php`** (0058's) — `nameRules()` gains a
  `string $storeLanguageId` parameter and its uniqueness check moves to the child table, scoped to
  that language. The shape and the exact Laravel API are Phase 3's latitude (the same latitude 0058
  leaves); **what is fixed is the table, the column, the language scope and the ignored row**:

  ```php
  Rule::unique('blog_category_translations', 'normalized_name')
      ->where('store_language_id', $storeLanguageId)
      ->ignore($blogCategoryId, 'blog_category_id'),   // the FK column -- NOT the PK. See D-4.
  ```

  The `NormalizeForSearch` parameter 0058 threads through is unchanged in kind.

- **`app/Actions/Blog/CreateBlogCategory.php`** and **`RenameBlogCategory.php`** (0058's) —
  **signatures unchanged** (`__invoke(string $name)` / `__invoke(BlogCategory $c, string $name)`),
  meaning narrowed to *"the default store language's name"* (**D-7**). Each additionally
  constructor-injects `App\Actions\Translations\SetTranslation`, per
  [code-style.md](../../docs/conventions/code-style.md#exception-an-actions-own-dependency-is-constructor-injected-when-the-method-signature-is-a-public-contract)'s
  documented exception. `CreateBlogCategory` writes the parent row and its default-language
  translation in **one transaction**. Both keep 0058's **D-13** authorize-first ordering and their
  `LogRefusedPrivilegedAttempt` refusal logging with `target_type: 'blog_category'` — unchanged.

- **`app/Actions/Blog/DeleteBlogCategory.php`** — **untouched.** `cascadeOnDelete()` removes
  translations with the parent. This file exists to be extended by story 0061's in-use guard, not by
  this one.

- **`config/store-languages.php`** (0068's) — **the entire production diff is one appended array
  literal**, which is 0068's **D8** contract:

  ```php
  'translation_relations' => [
      ['table' => 'product_category_translations', 'column' => 'store_language_id'],   // 0070's
      ['table' => 'blog_category_translations', 'column' => 'store_language_id'],      // this story's
  ],
  ```

  No closures; survives `config:cache`. No edit to `RemoveStoreLanguage`, to
  `StoreLanguage::translationUsageCount()`, to 0070's drift guard, or to any component.

- **`lang/en/blog.php`** / **`lang/es/blog.php`** — only if the re-scoped validation rules reference a
  new `attributes` leaf or refusal string, key-for-key identical across both locales. 0058 ships no
  `lang/` file, so this may be the first; if no new copy is needed, no file is added.

### Deliberately not touched

- **`database/seeders/RolePermissionSeeder.php`** — no new permission and no new module slug. Verified
  against shipped code: `'blog'` is already in `MODULES` (line 25), so `blog.view/create/edit/delete`
  exist today. The catalog stays at **42** permissions (**D-8**).
- **`app/Policies/BlogCategoryPolicy.php`** — no new ability. There is deliberately **no
  `TranslationPolicy`** (**D-8**).
- **`app/Concerns/HasTranslations.php`**, **`app/Actions/Translations/SetTranslation.php`**,
  **`App\Models\StoreLanguage`** — 0070's and 0068's, consumed **unmodified** (**D-12**).
- **`app/Actions/NormalizeForSearch.php`** — story 0022's, consumed unchanged. `Str::lower()` or
  `Str::ascii()` appearing anywhere in this story's diff is a review finding, per 0058's D-12(a).
- **`routes/**`**, **`resources/views/**`**, **`app/Livewire/**`**, **`config/modules.php`** — no
  screen, no route, no sidebar entry.
- **Stories 0062 and 0063's own files** — this story must not edit another story's file; the
  amendments it forces are recorded as a coordination action (**R-1**).

## Applying 0070's recipe — what transferred, and the one step that did not

0070's six-step recipe, walked in order, with this story's outcome against each:

| Step | Outcome here |
| --- | --- |
| 1. Create `<entity>_translations` with the FK pair, the natural-key unique, and optionally a unique on *"the field that was globally unique"* | **Applied, with the field correctly identified as `normalized_name`, not `name`** (**D-1**). This is the only step that does not transfer literally. |
| 2. Create `<Entity>Translation` with `HasFactory, HasUuids` and a translatable-fields-only `#[Fillable]` | Applied — plus the derivation hook the pilot's translation model has no need for (**D-3**). |
| 3. On the parent: `use HasTranslations;` + `translationModel()`; drop translated columns from `#[Fillable]` | Applied — plus **removing** the parent's now-orphaned `saving` hook (**D-2**). |
| 4. Re-scope the entity's `<Noun>ValidationRules` uniqueness by `store_language_id`, still folded through `NormalizeForSearch` | Applied, with the `->ignore()` target corrected (**D-4**). |
| 5. Reuse `SetTranslation` **unmodified** | Applied. A sibling is a consumer, never a re-implementer. |
| 6. Append **exactly one** `{table, column}` literal to `config/store-languages.php` | Applied. |

**What this story must NOT re-derive**, per 0070's own list: the per-field fallback chain (its D-5),
the default-language memo (its D-10), the authorization shape (its D-13), the `SetTranslation`
primitive, and the drift-guard test (its D-14) — which picks this story's new entry up **for free**,
because `blog_category_translations` matches the `*_translations` suffix the guard enumerates.

**What is genuinely new here and belongs to no other story:** the stored-fold-key interaction — the
hook's move to the child model, its composition with `SetTranslation`'s `updateOrCreate()`, the
`->ignore()` target change, and the first assertion anywhere that the entity-side FK really cascades.

## Tests to perform — 3. QA test cases / validation scenarios

Feature and Unit only. **No browser tests** — this story ships no screen.

> **Read this before writing any negative-validation test.** 0058's **D-13** makes all three actions
> authorize *before* they validate, so a direct call with no authenticated actor throws
> `AuthorizationException`, **not** `ValidationException`. Every validation test below must
> `actingAs()` an actor holding the relevant `blog.*` permission first, or it passes for entirely the
> wrong reason. **This trap is inherited unchanged and is not visible in 0070**, whose own actions
> descend from 0023 and predate the action-owns-the-rule convention — so a reader diffing this story
> against the pilot could reasonably assume it does not apply. It does (**R-8**).

### The stored fold key — the block that exists only because this entity is not the pilot
- [ ] Unit/Feature: the `saving` hook derives `normalized_name` **on insert** (`"Guías"` → `"guias"`),
      exercised through the model directly rather than through `SetTranslation`, so the hook is
      isolated from the write primitive.
- [ ] Feature: the hook **re-derives on a rename** — a second save changing `name` updates
      `normalized_name` with it. **Two assertions, not one**, per 0058's own instruction: a hook firing
      only on insert leaves a renamed translation's fold key pointing at the old name, which is
      simultaneously undiscoverable by search and invisible to the uniqueness rule while the row reads
      correctly in any UI.
- [ ] Feature: saving **without touching `name`** does not rewrite `normalized_name` — pins the
      `isDirty('name')` guard survived the move to the child.
- [ ] Feature: **composition with `SetTranslation`'s `updateOrCreate()`.** Call `SetTranslation` twice
      against the same `(BlogCategory, StoreLanguage)` pair with two different, non-fold-equivalent
      names and assert (a) exactly **one** row exists for the pair, (b) its `name` is the second value,
      (c) its `normalized_name` matches the *second* value's fold. *Risk if missing:* `updateOrCreate()`
      resolves to `firstOrNew()` → `fill()` → `save()`; on the second call the row is already hydrated,
      so the hook fires only if `fill()` marks `name` dirty. A caller that pre-trims or pre-normalises
      can make the dirty check disagree with reality, and the fold silently goes stale on exactly the
      path that is supposed to refresh it. **`updateOrCreate()`'s event behaviour could not be verified
      by execution here (no `vendor/`) and must be confirmed at Phase 3.**
- [ ] Feature: a forged `BlogCategoryTranslation::create(['name' => …, 'normalized_name' => 'hijacked'])`
      stores the **derived** value. *Risk if missing:* a caller decouples the fold key from the name it
      represents, defeating uniqueness and search in one write while the row looks correct.
- [ ] Feature: `SetTranslation` writes `normalized_name` in the **same** statement, not a follow-up
      `update()` — asserted as a write-query count of one. *Risk if missing:* someone "fixes" a missing
      fold by bolting a second write onto the action, reopening the two-writers drift the hook exists
      to prevent.
- [ ] Feature: `BlogCategoryTranslation` does **not** use `SoftDeletes` — a trashed translation would
      squat its `(store_language_id, normalized_name)` slot forever, and `Rule::unique()` does not apply
      the soft-delete scope (verified precedent on `users`).

### Uniqueness, re-scoped per language
- [ ] Feature: two categories, same normalised name, **same** language → refused **by validation**.
- [ ] Feature: two categories, **byte-identical** name, **different** languages → **accepted**. *Why this
      exact fixture:* it is the only test that proves the scope moved from global to per-language, and
      it must use the byte-identical string — a fixture differing in case or whitespace would pass under
      a rule that ignores language scoping entirely, because the incidental difference would do the work.
- [ ] Feature: **accent-folded pair across languages** — `"Guías"` in one language and `"Guias"` in
      another, which fold to the *same* `normalized_name`, are **accepted**. *Why this is separate from
      the test above:* a composite index accidentally written as `unique('normalized_name')` alone
      (a copy-paste of the parent's old single-column unique) passes the byte-identical test and fails
      this one. They exercise different index shapes.
- [ ] Feature: case-only and accent-only duplicates **within** one language still collide (`"Guías"` /
      `"Guias"`), proving the comparison still routes through the shared `NormalizeForSearch`.
- [ ] Feature: re-saving a category's own name in the same language is **accepted** — the
      `->ignore()` trap (**D-4**, **R-2**). Written as **three** assertions so a rule that rejects
      everything cannot pass trivially: (a) the no-op save succeeds; (b) the translation row is
      genuinely unchanged, `normalized_name` included; (c) a genuinely free name in the same language is
      still accepted, as the control.
- [ ] Feature: a **foreign-key** violation (a nonexistent `store_language_id`) is **not** misattributed
      as a duplicate-name validation error. *Why:* 0058's `23000` catch was written for a table with one
      unique constraint; this table has two `UNIQUE`s plus two FKs (**R-11**).
- [ ] Feature: blank and whitespace-only translations are refused on **every** language path, not only
      the default — a rule threaded through one call site and not the other fails silently in one
      direction only (0058's R-6, now with **two** threaded parameters rather than one).
- [ ] Feature: the full validation depth (blank / whitespace-only / length boundary pair) is re-asserted
      on the **rename** path independently, not assumed symmetric with create.

### The backfill
- [ ] Feature: invoked directly against N arranged categories, writes **exactly one** translation row
      each, in the default store language, with `name` **byte-identical** to the original — asserted
      **per row, never as a count**. *Why:* a count assertion passes even if every row got the wrong
      name or all rows collapsed to one value — the
      [count-assertion failure mode](../../docs/errors-log.md#a-count-based-assertion-over-rendered-html-counted-a-wrapper-element-it-never-meant-to-include--2026-08-21)
      this project records.
- [ ] Feature: the backfilled `normalized_name` equals a **fresh** `NormalizeForSearch` call on the
      name — not merely equal to the parent's old column value (**D-5**).
- [ ] Feature: names with leading/trailing whitespace and a name at the length boundary survive
      unchanged.
- [ ] Feature: the backfill with **no default store language** throws and writes nothing.
- [ ] The migration itself is **not** separately tested — `RefreshDatabase` proves it runs, and the
      extraction (**D-5**) is what makes the part that could be wrong testable. A deliberate application
      of [what-not-to-test.md](../../docs/testing/qa/what-not-to-test.md)'s migration rule, legitimate
      **only because** of the extraction.

### Deletion and cascade
- [ ] Feature: **cascade cleanliness.** A category translated into three languages, deleted, leaves
      **zero** `blog_category_translations` rows for it — asserted by direct query, not merely by the
      parent being gone. *Why this is new:* 0058's delete test predates the child table and cannot
      exercise it, and 0070 proves its cascade only against `product_category_translations`. If this
      table's two FK clauses were accidentally swapped (entity FK restrictive, language FK cascading),
      both compile and every delete of a translated category throws a constraint error — in production,
      caught by nothing in either sibling story's suite.
- [ ] Feature: the freed name is immediately reusable **in the same language** by a new category.

### Fallback resolution — deliberately thin
- [ ] Feature: **one wiring-proof test** with three assertions — a category translated into the default
      and one other language resolves the requested language, falls back to the default when the
      requested is absent, and returns `null` (without throwing) when neither exists. This exists to
      catch a wrong `translationModel()` or relation name, **not** to re-specify `HasTranslations`.
- [ ] Feature: a translation in a store language that has since been made **inactive** is still
      readable — the one fallback-adjacent property worth re-pinning per entity, because 0068's **D5**
      depends on it and a defensive `is_active` filter added at any layer would defeat it.

### Query shape
- [ ] Feature: rendering N categories through `withTranslationsFor()` issues a **bounded** number of
      queries regardless of N — proven able to move by removing the eager load. Re-run here against a
      **second** consuming model, which is what proves the trait generalises rather than having been
      tuned to fit one call site.
- [ ] Feature: `translated()` on a `BlogCategory` reads the already-loaded relation and issues **no**
      additional query. *Why:* `$model->translations()` (the relation method, always re-queries) and
      `$model->translations` (the property, respects eager loading) differ by one character and survive
      a copy from `ProductCategory` undetected.

### The registry
- [ ] Feature: `StoreLanguage::translationUsageCount()` includes this table's rows once the entry is
      registered.
- [ ] Feature: **regression run only** of 0070's drift guard, now against **two** registered entries
      rather than one. This is genuinely more informative than 0070's own launch, since a guard that
      merely checks "at least one entry resolves" is indistinguishable from a correct set-equality guard
      at N=1. **This story writes no drift guard of its own** (0070's D-14).
- [ ] Feature: `php artisan config:cache` succeeds with the appended entry — an assertion, not a review
      promise (0068's R-8).

### Authorization
- [ ] Feature: an actor without `blog.edit` cannot write a translation through any of the three actions;
      an actor with it can. Re-verified because the actions' **bodies** changed even though their
      signatures and abilities did not.
- [ ] Feature: an actor holding `blog.edit` and **zero** `store-languages.*` permissions can author a
      translation (**D-8**).
- [ ] Feature: `CreateBlogCategory` still requires `blog.create`, not `blog.edit`, even though it now
      writes a translation. *Risk if missing:* this is the exact bug that would follow from making
      `SetTranslation` self-authorize — 0070's **D-9**.
- [ ] **Regression only, no new tests:** 0058's `BlogCategoryPolicyTest` (four allow/deny pairs, the
      Super Admin bypass, the seeded-catalog assertion) and `BlogCategoryAuthorizationTest` (direct-call
      refusal + `target_type: 'blog_category'` logging). If any now fails, that is itself a finding — it
      would mean the retrofit touched the policy, which it must not.

### Deliberately NOT tested here
- [ ] **`NormalizeForSearch`'s own folding table** (ß, ç, CJK, whitespace, idempotence) — story 0022's,
      and re-asserting it creates a second specification of the fold that can drift from the first. This
      story proves names *go through* it via the case/accent cases above.
- [ ] **`HasTranslations`' contract** — the exhaustive fallback matrix, the **per-field** independent
      fallback, and the default-language-promotion re-pointing. All three are 0070's, proven once
      generically. The memo lives on `StoreLanguage` as a single static shared by every consumer
      (0070's D-10), so "the default changes and every entity re-points" is a property of one shared
      static, not something a second entity's wiring can independently break.
- [ ] **`SetTranslation`'s generic replace-not-duplicate behaviour** — 0070's; this story tests it only
      where the stored fold key introduces new risk.
- [ ] **`StoreLanguage`'s own CRUD and invariants** — 0068's.
- [ ] **The 0023 / 0058 uniqueness-design discrepancy** — 0058's D-4 records it as "not acted on"; it is
      outside this story's mandate.
- [ ] **Anything rendered** — no Livewire test, no Blade assertion, no language tabs.

## Expected outcome

`blog_categories` no longer carries `name` or `normalized_name`; every category's name lives in
`blog_category_translations`, one row per store language, with existing rows backfilled into the store
default. `BlogCategory::translated('name')` returns the requested language's name, the store default's
when that is absent, and `null` when neither exists — never an exception. A category can be translated
by an editor holding only `blog.edit`, with uniqueness enforced **per store language** through the same
shared fold the parent used, on a stored key the child model derives. Deleting a category removes every
language's name with it. `StoreLanguage::translationUsageCount()` now counts blog category translations
too, and 0070's drift guard covers a second registered entry with no change to the guard.

## Acceptance criteria

- [ ] `blog_category_translations` exists with a UUIDv7 primary key, two non-nullable UUID FKs, `name`,
      `normalized_name`, and timestamps.
- [ ] `php artisan db:table blog_category_translations` reports the index list, **verified rather than
      assumed**; the expectation is **three** (`primary` + the two composite `UNIQUE`s), and any fourth
      index is investigated rather than accepted (**D-10**, **R-4**).
- [ ] Per-language uniqueness is enforced on **`normalized_name`**, not on `name`, via
      `UNIQUE(store_language_id, normalized_name)`; there is **no** third `unique(store_language_id, name)`.
- [ ] The FK to `blog_categories` cascades on delete and is **proven** to by a test; the FK to
      `store_languages` restricts and is understood to be defensive-only.
- [ ] `blog_categories.name`, `blog_categories.normalized_name` and the `normalized_name` unique index
      are gone, dropped in a **separate** migration ordered after the child table is created and
      populated; `down()` restores both columns **nullable** and re-adds **no** unique index.
- [ ] Every pre-existing category holds exactly one translation row in the store default language, with
      its name preserved byte-for-byte and its `normalized_name` recomputed through the shared normaliser.
- [ ] The backfill aborts loudly when no default store language exists, and writes nothing.
- [ ] The `normalized_name` derivation hook exists on `BlogCategoryTranslation`, is guarded on
      `isDirty('name')`, fires on both insert and update, and is **removed** from `BlogCategory`.
- [ ] `Rule::unique()->ignore()` names the **translation** row (via the `blog_category_id` FK column),
      and saving a category under its own unchanged name in the same language is accepted.
- [ ] Authoring a translation requires `blog.*` and **no** `store-languages.*` permission; the
      permission catalog is unchanged at 42, `RolePermissionSeeder` is untouched, and no policy or
      ability is added.
- [ ] `config/store-languages.php` gains **exactly one** appended array literal, contains no closures,
      and survives `config:cache`; `RemoveStoreLanguage`, `StoreLanguage::translationUsageCount()`,
      0070's drift guard and every component are untouched.
- [ ] `HasTranslations`, `SetTranslation` and `NormalizeForSearch` are **consumed, not modified** — no
      fallback logic, no fold logic and no write primitive exists at any call site in this story's diff.

## Definition of Done
- [ ] Tests written and green (**full suite unscoped**, not `--filter`) — mandatory rather than
      advisory here, because this story adds a model event, whose blast radius is the whole suite by
      construction
- [ ] `vendor/bin/pint --format agent` run **unscoped**, not `--dirty`
- [ ] **Larastan level 7 run and recorded** — named explicitly because
      [errors-log.md](../../docs/errors-log.md#a-verification-record-that-lists-two-of-three-quality-gates-is-a-record-of-two-gates--2026-08-26)
      records three consecutive stories whose verification notes listed two of three gates and were read
      as records of all three. A record naming two gates is a record of two gates.
- [ ] Code reviewed (code-reviewer)
- [ ] No security findings (appsec-auditor)
- [ ] Documentation updated (docs-keeper) — at minimum `docs/database/schema.md` (a second
      per-language content table), `docs/database/migrations.md` (the **second** instance of a migration
      that removes a source-of-truth column after backfilling it elsewhere, and the first that drops a
      `NOT NULL UNIQUE` derived column), and `docs/conventions/naming.md` (`<Entity>Translation` as an
      established pattern rather than a pilot). **Verify whether 0070's own docs pass already made these
      claims** rather than restating them.
- [ ] **Recorded as a handoff, not done here:** the sibling-story amendments in **R-1**. This story
      edits no other story's file.
- [ ] Acceptance criteria met

## 4. Documented functional decisions

**D-1 — Per-language uniqueness binds `normalized_name`, not `name`, and this is a deliberate departure
from 0070's literal migration snippet.** The human has confirmed that a translated category name must
remain unique **per store language**; the only question this story resolves is *which column carries
it*. 0070's pilot writes `unique(['store_language_id', 'name'])` because `product_categories` has no
folded column at all — it retrofits 0023's raw-`name` design. `blog_categories` does have one, and
0058's **D-4** argues at length why: a pre-flight PHP check is **not a race guard**
([the rule this repo already states for `pending_email`](../../docs/security/signed-link-verification.md#a-pre-flight-check-is-not-a-race-guard--re-check-under-a-lock-and-let-the-unique-index-have-the-last-word)),
so two concurrent requests submitting `"Guías"` and `"Guias"` in the same language both pass a
byte-exact pre-flight, both insert, and a raw-`name` index catches neither. Porting the pilot's literal
shape would reopen that race on a table whose parent already closed it — a regression against the very
entity being retrofitted, not merely an inherited gap. **Also rejected: carrying both uniques.** Any two
rows colliding on `name` already collide on `normalized_name` by construction, so a raw-name unique
protects nothing while adding a second, collation-dependent notion of "duplicate" that can disagree with
the first — 0058's own argument for dropping `unique('name')` from the parent, applied unchanged.
0058's **D-7** anticipated precisely this story and states the outcome: *"the `normalized_name` column
and its derivation hook move to the translations table too, since each locale's name needs its own
folded key."*

**D-2 — Both `name` and `normalized_name` are dropped from `blog_categories`; the parent keeps no
denormalised mirror.** 0070's **D-4** made this call for `product_categories` and its reasoning transfers
without modification, so it is applied rather than re-argued: a mirror column is cheap only while the
thing it mirrors is stable, and the store default is explicitly **not** — PRD Epic 5 makes *"set French
as the store's default language"* a supported operation, and 0068 ships `SetDefaultStoreLanguage` to
perform it. Under a mirror design that one action would have to rewrite the mirror of every row of every
translatable table, which destroys 0068 **D8**'s promise that a later story extends the mechanism by
*"appending one array literal, and nothing else."* Dropping makes a default change free. *The cost,
stated plainly:* two already-written sibling stories break (**R-1**), and `down()` becomes knowingly
non-inverse (**D-11**). This story drops **two** columns and **one** index where the pilot dropped one
of each.

**D-3 — The derivation hook moves to `BlogCategoryTranslation`; it is not absorbed into
`SetTranslation`.** `SetTranslation` is a **generic, cross-entity primitive** (0070's **D-8**) that will
be imported by five unrelated areas; teaching it about one entity's derived column would make every
future sibling's write path depend on a per-entity concern, and there is no shape in which that
generalises (0076/0078 translate five fields with different derivation needs, or none). The hook belongs
on the model that owns the column, which is exactly where 0058 put it for the parent. **The rule
0058 cites is what forces it to be a hook at all rather than a line in each action:**
[an identity derived from a mutable column must be locked at the model layer as soon as code exists that
can mutate it](../../docs/security/authorization-patterns.md) — and this story *increases* the number of
writers, since `SetTranslation` joins `CreateBlogCategory` and `RenameBlogCategory`. *Rejected:* each
action computing and `forceFill`ing it, which re-splits one invariant across three implementations —
0058 records the identical rejection for the parent. **The parent's hook is deleted rather than left**,
because the columns it guards no longer exist there; leaving it is a silent no-op at best and a
`QueryException` at worst.

**D-4 — `Rule::unique()->ignore()` must name the *translation* row, and the naive port is a silent
no-op.** 0058's rule reads `Rule::unique('blog_categories', 'normalized_name')->ignore($blogCategoryId)`
— ignoring by primary key, which was correct while uniqueness lived on the parent. Post-retrofit the
ignored row is a **translation**, so a mechanical port that keeps passing the category's id compiles,
runs, and never matches anything, because no `blog_category_translations.id` will ever equal a
`blog_categories.id`. The failure is **silent and one-directional**: everything works except saving a
category under its own unchanged name, which starts failing as a duplicate. The fix is to ignore on the
FK column — `->ignore($blogCategoryId, 'blog_category_id')` — which is also more honest than threading
a translation-row id the callers do not hold. ⚠️ **This trap is recorded in neither 0058 nor 0070**, and
it is a *compound* of 0058's own **R-6** rather than a repeat: R-6 warns that a nullable id may be
threaded through one call site and not the other, which a reviewer can check; here the id is threaded
through **both** call sites and is the **wrong id** on both.

**D-5 — The backfill recomputes `normalized_name` through the shared normaliser rather than copying the
parent's column. (`database-expert` recommended copying; the dissent is recorded.)** Both options were
argued. Copying is cheaper and inherits whatever the parent's hook already guaranteed; `database-expert`
additionally warned that recomputing risks "the migration's copy of the fold drifting from the model's."
**That objection does not hold**, and it is worth saying why precisely: the backfill *calls*
`App\Actions\NormalizeForSearch`, which is the single-source-of-truth rule being obeyed — drift would
mean *reimplementing* the fold, which nothing here does. The decisive argument is one neither amigo made.
0070's **D-11** mandates the backfill use the **query builder, never Eloquent**, so **no model event
fires on either table** and `normalized_name` must be written explicitly whichever way its value is
obtained — the choice is purely *which value*. And 0058's **D-12(a)** records that a change to the
normaliser is a **re-seed/recompute event** for every stored `normalized_name` in the database. Copying
would therefore propagate a possibly-stale fold into the very table whose new `UNIQUE` index is being
built on it, where it would sit undetected until the first rename recomputed it — at which point a row
that was previously fine can collide. Recomputing produces a key consistent with what the new hook and
the re-scoped validation rule will produce from that point on, and makes the backfill's correctness
independently assertable rather than merely consistent with a prior value (`backend-qa`'s point).

**D-6 — The backfill lives in `app/Actions/Blog/`, following 0058's area-folder convention rather than
0070's entity-folder one.** 0070 placed its backfill in `app/Actions/ProductCategories/` — an *entity*
folder, which is Epic 2's shape. 0058's **D-14** deliberately chose an **area** folder for blog
(`app/Actions/Blog/` holding category, tag and post actions together) because one `blog.*` permission
tier gates all three entities, so the folder mirrors the gate. This story follows the convention of the
entity it is retrofitting, not the convention of the story it is copying. ⚠️ **Conditional on 0058's own
Phase 2**, which that story explicitly flags may prefer alignment with Epic 2 instead (**R-6**). Note
`SetTranslation` stays in `app/Actions/Translations/` regardless — it is a named cross-cutting concern
(0070's **D-8**), and nothing here changes that.

**D-7 — 0058's three action signatures are unchanged; their meaning narrows to "the default store
language".** `CreateBlogCategory::__invoke(string $name)` and
`RenameBlogCategory::__invoke(BlogCategory $c, string $name)` keep their shape and now write the
*default-language* translation rather than a scalar column. 0070's **D-12** applied unchanged.
*Rejected:* widening to `array $namesByLanguageId`, which changes a public contract story 0062 and every
direct-call test bind to, for a capability nothing yet asks for (the PRD's tab UI edits one language at a
time). Writing a **non-default** language goes through `SetTranslation` directly, called by whichever
action the UI story adds; this story ships no such caller, which is why `SetTranslation`'s interaction is
tested by calling it directly.

**D-8 — Translated content adds no permission, no ability and no policy.** Verified against shipped
code rather than against a task file: `'blog'` is already in
[`RolePermissionSeeder::MODULES`](../../database/seeders/RolePermissionSeeder.php) (line 25), so
`blog.view/create/edit/delete` all exist today with **zero** seeder change and the catalog stays at 42.
Authoring a translation is *using* an already-configured language, not managing the language catalog, so
it requires **no `store-languages.*` permission** — 0068's **D18** draws that boundary and 0070's
**D-13** applies it. There is deliberately **no `TranslationPolicy`**: a generic cross-entity translation
resource would need "may this actor touch this parent" logic, which is `BlogCategoryPolicy::update`
restated under a new name. **No step-up requirement** — re-typing a category's French name is neither
identity-sensitive nor hard to reverse. And **`SetTranslation` still does not self-authorize** (0070's
**D-9**): a self-authorizing `update` would make *creating* a category require `blog.edit` rather than
`blog.create`, locking out an actor granted exactly the permission for the job.

**D-9 — UUIDv7 primary key, per ADR 0001 Amendment 1; the pilot's recorded dissent is not reopened.**
0070's **D-2** records that `database-expert` argued for a `bigint` surrogate and was overruled. For this
story `database-expert` explicitly **agreed** with that resolution and declined to re-raise it, on the
observation that the volume argument is *weaker* here: blog categories are a much smaller domain than
product categories, so `blog_category_translations` (categories × active store languages) is smaller
still than the pilot's table. `HasUuids`, `@property string $id`, no `$keyType`/`$incrementing` restated.
No new ADR exception.

**D-10 — Expect three indexes, not four; 0070's own stated count is self-contradictory and is not
inherited.** `database-expert` found this and it is verified in 0070's text: line 243 asserts a fourth,
auto-created FK index on `store_language_id` *"which is not the leftmost column of either composite"* —
but the migration quoted four lines above writes `unique(['store_language_id', 'name'])`, in which
`store_language_id` **is** leftmost. By the same leftmost-prefix rule that lets
`unique(['blog_category_id', 'store_language_id'])` satisfy InnoDB's FK-index requirement for
`blog_category_id` for free, `unique(['store_language_id', 'normalized_name'])` satisfies it for
`store_language_id`. So: `primary` + two `UNIQUE`s = **three**. This could not be settled by execution
(no `vendor/`, no table), so the acceptance criterion is written as *verify with `db:table` and
investigate any fourth index* rather than as a bare number. ⚠️ If a fourth index does appear, that
finding belongs back on 0070 as well as here (**R-4**).

**D-11 — `down()` is knowingly not an inverse, and is *more* lossy than the pilot's.** 0070's
`product_categories.name` was nullable before and after, so its non-inverse `down()` restores a nullable
column with no data. `blog_categories.normalized_name` is `NOT NULL UNIQUE` today, and neither property
can be honestly restored: the values now live per-language on the child table, and a parent row may hold
zero, one or several translations, so there is no single value to restore into a scalar column. Both
columns therefore come back **nullable**, and the unique index is **deliberately not re-added** — over a
column every row shows as `NULL` it would protect nothing (NULLs are exempt from uniqueness on both
MySQL and SQLite, the same property `users.pending_email` relies on) while misrepresenting the state as
"restored". This is stated in a comment on the method itself, the way 0070 states its own. A rollback
across this pair is data-lossy in the same way
[ADR 0001's `users` conversion set](../../docs/decisions/0001-uuid-primary-keys.md#consequences) is.

**D-12 — The mechanism is consumed, not re-derived, and this story writes no drift guard.** No fallback
logic, no default-language memo, no write primitive and no schema-derived registry guard appears in this
diff. 0070's **D-14** guard enumerates tables matching the `*_translations` suffix and set-equates them
against the registry, so `blog_category_translations` is picked up **for free** — and its first run
against **two** entries is genuinely more informative than its launch against one, since a guard that
merely checks "at least one entry resolves" is indistinguishable from a correct set-equality guard at
N=1. If a sibling ever needs to edit that guard to accommodate its entry, the guard is wrong.

**D-13 — Cascade behaviour is asserted here for the first time in the project.** `cascadeOnDelete()` on
the entity FK and `restrictOnDelete()` on `store_language_id` are 0070's **D-3**, applied unchanged —
but `backend-qa` observed that **neither sibling story tests it**: 0058's delete test predates the child
table, and 0070 proves its cascade only against `product_category_translations`. Swapping this table's
two clauses compiles and passes everything except an actual delete of a translated category. The
cascade-cleanliness test is therefore this story's, not inherited. Note the interaction with story 0061,
which adds a hard-block guard refusing deletion while posts reference the category: that guard runs
*before* the delete, so it does not weaken the cascade argument — a category that reaches `->delete()`
is one no post uses, and its translations are exactly the data that has just become meaningless.

## 5. Dependencies, risks, open technical questions

### Dependencies

- **[Story 0058](0058-blog-categories-backend.md)** — hard, and **not yet implemented**. This story
  retrofits its table, its model, its validation trait and two of its three actions. See **R-2**, **R-3**.
- **[Story 0070](0070-translatable-content-mechanism-product-categories-backend.md)** — hard, and **not
  yet implemented**. Supplies `HasTranslations`, `SetTranslation`, `StoreLanguage::defaultStoreLanguage()`
  and the drift guard, all consumed unmodified. **0070's own Q1 is still open** (must every entity always
  hold a default-language translation?) and this story assumes its recommended answer **(a) yes** —
  `CreateBlogCategory` writes one and the backfill guarantees one. If 0070 resolves Q1 differently, this
  story's create-path acceptance criterion changes with it; it is not re-asked here.
- **[Story 0068](0068-store-languages-catalog-backend.md)** — hard, and not yet implemented. Supplies
  `store_languages`, the `is_default` row the fallback resolves through, and the registry.
- **Story 0022** — supplies `App\Actions\NormalizeForSearch`, consumed unchanged at both write time (the
  hook) and read time (the validation rule), per [0032's **D-N1**](0032-shipping-geography-catalog-seed.md).
- **Story 0061 depends on this story only incidentally** — it extends `DeleteBlogCategory` in place with
  the in-use guard, which this story does not touch.
- **No new Composer package.**

### Risks

- **R-1 — Dropping the parent's `name` (D-2) breaks two already-written sibling stories, and this story
  cannot fix them.** Verified by grep against `ai-spec/tasks/`:
  [`0062-blog-categories-ui.md`](0062-blog-categories-ui.md) line 370 specifies
  `BlogCategory::query()->withCount(...)->orderBy('name')->orderBy('id')`, and its component surface
  (line ~329) declares a row shape `array{id: string, name: string, postCount: int, canEdit: bool,
  canDelete: bool}` plus a `$deletingCategoryName` property, all fed from `$category->name`;
  [`0063-blog-posts-list-editor-ui.md`](0063-blog-posts-list-editor-ui.md) lines 792 and 978 specify
  `->with(['category:id,name', ...])` — a **partial column select**, which is a sharper break than an
  `orderBy` because it names the dropped column explicitly in the eager load. All are **unimplemented
  Phase 1 files**, so the cost is an amendment rather than a code break — but the amendment is real and
  is **not this story's to write**. Named as a required coordination action rather than left to be
  discovered when 0062's tests fail against a column that no longer exists. (This mirrors 0070's own
  **R-1** for 0025/0027/0060/0062 on the product side.)
- **R-2 — The sequencing between this story and 0058 changes what this story *is*.** The PRD roadmap puts
  Epic 5 last, so the realistic case is that 0058 has shipped and this is a genuine retrofit against live
  data — which is what the two migrations are written for. **If the coordinator resequences so 0072 lands
  before 0058 is implemented**, the far cheaper path is to amend 0058 so `blog_categories.name` /
  `normalized_name` are *never created*, deleting the second migration and the backfill entirely. That is
  a Phase 2 decision and is cheaper to make than to reverse.
- **R-3 — 0058's `Str::ascii()` length-expansion hazard (its R-4 / OQ-1) is inherited unresolved, and
  this story must not guess a third number.** `NormalizeForSearch` ends in `Str::ascii()`, a
  *transliteration* rather than a 1:1 map, so a max-length `name` can fold to a longer
  `normalized_name` — truncating the uniqueness key silently, and only for accented input. This story
  *moves* that column and so doubles the surface. **Whatever widths 0058's Phase 2 settles must be applied
  identically to `blog_category_translations`.** The expansion factor **could not be verified here**: this
  worktree has no `vendor/`, and per
  [this project's hedge rule](../../docs/errors-log.md#a-reviewers-correction-replaced-an-accurate-technical-explanation-with-a-wrong-one-unverified--2026-08-24)
  an unverified mechanism must not be written up as fact. What *is* verified is that `composer.lock` pins
  `voku/portable-ascii` 2.1.1 as the real library behind `Str::ascii()`, so the hazard is concrete rather
  than hypothetical. The command that settles it, at Phase 2/3:
  `php artisan tinker --execute 'dump(strlen(Str::ascii(str_repeat("ß", 255))));'`. **This is a reason to
  force 0058's OQ-1 closed before this story reaches Phase 3, not after.**
- **R-4 — 0070's stated index count contradicts its own migration** (**D-10**). Recorded so the number is
  verified rather than inherited, and so the finding reaches 0070 rather than being fixed only here.
- **R-5 — The single most likely implementation mistake is copying 0070's `unique([language, name])`
  verbatim.** It is the sibling story an implementer is told to imitate, and the copy compiles, migrates
  and passes every test that does not specifically pair an accent variant across two languages. It would
  reopen the TOCTOU race 0058 closed. **D-1** exists to pre-empt it and the acceptance criteria state the
  requirement positively so it cannot be satisfied by omission.
- **R-6 — Two folder/ownership questions are conditional on other stories' Phase 2.** (a) 0058's **D-14**
  area-vs-entity folder choice, which 0058 itself flags Phase 2 may reverse — **D-6** follows it, so
  reversing it moves the backfill class. (b) 0070's **Q3** (which story owns the taxonomy language-tabs
  UI) is still open in 0070's file. *Observation, offered as arithmetic rather than as a decision:* the
  confirmed 14-story decomposition spans ids 0066–0079, and every shipped file so far alternates
  backend/UI (0066 backend, 0067 UI, 0068 backend, 0069 UI, 0070 backend), which would make **0073** this
  story's paired Blog Categories UI. That is an inference from the id range, not a fact this debate can
  see; it is recorded so the gap is met rather than discovered.
- **R-7 — 0069's backlog item 3 is still unaddressed, and this is the *second* story that could have
  addressed it.** 0069's **R-7** records that re-adding a removed store language silently restores all its
  translations with no UI signal, and assigns "surface *this language was previously removed and still
  holds content*" to **the first story that creates a translation table**. 0070 is that story and does not
  do it (verified by grep). This story creates the second such table and inherits the same property.
  Recorded rather than solved, since the fix is a UI affordance and this story ships no screen.
- **R-8 — The authorize-before-validate trap is inherited from 0058 and is invisible in 0070.** 0058's
  actions self-authorize as their first statement (its **D-13**); 0070's descend from 0023 and do not, so
  a reader diffing this story against the pilot could reasonably conclude the trap does not apply. Every
  negative-validation test must `actingAs()` a permitted actor. Called out in a blockquote at the top of
  the test list rather than buried per-case.
- **R-9 — 0070's static-memo reset obligation (its R-6) is inherited.** A test that promotes a new default
  followed by one asserting against the original can read a stale cached row if process state is shared.
- **R-10 — N+1 is the mechanism's default failure mode, in two shapes** (0070's **R-4**): rendering a list
  without `withTranslationsFor()`, and `$model->translations()` (the relation method, always re-queries)
  instead of `$model->translations` (the property). They differ by one character and survive a copy from
  `ProductCategory` undetected. Related: a stale relation after a write renders the pre-save value
  (0070's **R-5**), invisible to `Livewire::test()`.
- **R-11 — 0058's blanket `23000` catch is newly unsafe.** It was written for a table with exactly one
  unique constraint; `blog_category_translations` has two `UNIQUE`s plus two FKs, so translating any
  `23000` to "name taken" would misreport an FK violation as a validation error on `name`.
- **R-12 — This story's design is provisional against three unshipped stories at once.** 0058's schema,
  0068's model and 0070's public API are all Phase 1 text. `backend-qa` raised this specifically: 0070
  warns siblings not to *re-derive* the mechanism but does not warn them to *re-verify its shipped shape*
  — a distinction that matters because if 0070's Phase 2/3 renames `scopeWithTranslationsFor()`, changes
  `translated()`'s signature or moves the memo, every test named here is wrong the moment it is written.
  **Phase 3 must re-verify every signature against `HEAD` first**, per the deferred-findings rule.
- **R-13 — This debate ran with two of three amigos.** `backend-expert` was dispatched and never returned
  (see Provenance). Its brief covered model wiring, the validation-trait signature, the action bodies,
  folder placement and authorization. Those questions **were** answered — by `database-expert` and
  `backend-qa` in passing, and by the facilitator's own verification against the tree — but they were not
  answered by the specialist whose primary brief they were. **Phase 2 should treat the "Modify" file list
  and D-3/D-4/D-6/D-7 as the least independently-corroborated parts of this story.**

### Open questions for the product owner

**None blocking, and deliberately none re-asked.** The one product-level question this story would
otherwise carry — whether translated names must be unique per store language — was **confirmed by the
product owner before this debate** and is applied directly as **D-1** (with only the *column* left to
decide, which is a technical question 0058's own D-4 already settles). 0070's **Q1** and **Q2** are
inherited rather than re-opened, and 0058's **OQ-1** is a dependency (**R-3**) rather than a question for
this story.

**Two inherited items must close before this story reaches Phase 3**, and neither is this debate's to
close:

1. **0058's OQ-1** — the `name` / `normalized_name` length pair and the `Str::ascii()` expansion hazard
   (**R-3**). Settleable only by execution, and this story doubles the number of columns it applies to.
2. **0070's Q1** — whether every entity must always hold a default-language translation. This story
   assumes **yes**, 0070's own recommendation; if that changes, the create-path criterion changes.

## 6. Technical tasks for later backlog creation

Derived from this debate; **none are in scope for 0072**.

1. **Amend stories [0062](0062-blog-categories-ui.md) and [0063](0063-blog-posts-list-editor-ui.md)** so
   their queries no longer reference a `blog_categories.name` column — an ordered join over the
   translation for the requested language, and a replacement for the `category:id,name` partial select
   (**R-1**). The coordinator's, not this story's. Note this is the blog half of the same amendment 0070's
   own backlog item 1 raises for 0025/0027/0060/0062.
2. **Carry the index-count finding back to [0070](0070-translatable-content-mechanism-product-categories-backend.md)**
   — its line 243 asserts a fourth auto-created FK index on a column its own migration makes leftmost in a
   composite `UNIQUE` (**D-10**, **R-4**). Verify with `db:table` on both tables and correct whichever is
   wrong.
3. **Close 0058's OQ-1 jointly with [0059](0059-blog-tags-backend.md)** before either Epic 5 taxonomy
   retrofit implements — the length trio is now a length *quintet* once the translation tables exist
   (**R-3**).
4. **Story 0074 (Blog Tags) inherits this story's D-1 verbatim, not 0070's.** `blog_tags` carries the same
   stored `normalized_name` design (0059), so its translation table's per-language unique binds
   `normalized_name` too. This is the first evidence that the pilot's literal snippet is the exception
   rather than the rule among the four siblings — worth stating in 0074's own debate rather than
   rediscovering it a third time.
5. **Surface "this language was previously removed and still holds content"** in 0069's picker — 0069's
   backlog item 3, assigned to the first story creating a translation table, still unaddressed after two
   (**R-7**).
6. **Re-dispatch a `backend-expert` review of this story's "Modify" file list at Phase 2** (**R-13**).
7. **`ModuleRouteAccessTest.php` still covers two routes while more exist** — inherited unclosed from
   stories 0017/0018/0068/0069, and untouched here since this story adds no route.

## Provenance

**Phase 1 Three Amigos debate, 2026-08-29.** Facilitator: `product-owner`. **Three amigos were dispatched
as real subagent calls; two returned.**

- **`database-expert` — returned and contributed.** The full migration shape, the `normalized_name`
  uniqueness column (**D-1**), the two-column drop and its non-inverse `down()` (**D-2**, **D-11**), the
  backfill design, the UUIDv7 agreement (**D-9**), the index-count discrepancy in 0070 (**D-10**), and the
  table-specific hazards behind **D-3** and **R-5**.
- **`backend-qa` — returned and contributed.** The full test design, the 0070/0072 ownership boundary, the
  three `updateOrCreate`-composition failure modes, the `->ignore()` trap (**D-4**), the inherited
  authorize-before-validate trap (**R-8**), the cascade-cleanliness gap (**D-13**), and four risks neither
  source story records (**R-12**, **R-13**'s framing, **R-4**, **R-1**'s sharper half).
- **`backend-expert` — dispatched, never returned.** No result was received before this file was written;
  the agent produced no output this debate could use. **Its contribution is absent, not summarised**, and
  nothing in this file is attributed to it. Its brief covered model wiring, the validation-trait signature,
  the action bodies, folder placement and authorization — questions answered here by the other two amigos
  and by the facilitator's own verification, and flagged as the least-corroborated part of this story in
  **R-13**. A re-dispatch was declined rather than left pending indefinitely; **backlog item 6** records it.

> ⚠️ **A facilitator error is recorded here rather than silently corrected.** Midway through this debate
> the facilitator stated that "both experts converge" and attributed the `Rule::unique()->ignore()` finding
> (**D-4**) to `backend-expert`, at a point when only `database-expert` had returned. That attribution was
> false: the observation was the facilitator's own, from reading 0058 line 263. It was corrected before
> this file was written, and `backend-qa` subsequently raised the same trap independently, so the finding
> is real and corroborated — only its original attribution was not. Recorded because this project's own
> rule is that a second-hand or unverified claim is a flag that nobody ran the code, and the same standard
> applies to claims about who said what.

**Where the two returning amigos converged:** the `normalized_name` uniqueness column over a raw-`name`
port of the pilot; dropping both parent columns; `cascadeOnDelete()` on the entity FK with a
defensive-only `restrictOnDelete()` on `store_language_id`; the backfill as an extracted, fail-loud,
query-builder class; no new permission, policy or step-up; and consuming rather than re-deriving 0070's
drift guard.

**They split on one point, resolved above with the dissent recorded.** *The backfill's `normalized_name`.*
`database-expert` recommended **copying** the parent's existing value (cheaper; avoids a second fold call
site). `backend-qa` recommended **recomputing** through the shared normaliser (self-correcting; independently
assertable). **Resolved in favour of recomputing (D-5)** on an argument neither made: 0070's D-11 mandates a
query-builder backfill, so *no* model event fires and the column is written explicitly either way — and
0058's D-12(a) records that a normaliser change is a re-seed/recompute event, so copying would carry a
possibly-stale fold into the table whose new `UNIQUE` index is built on it. `database-expert`'s drift
objection is addressed rather than dismissed: calling the shared class is the single-source-of-truth rule
being obeyed, not a second implementation.

**Facts verified by the facilitator against the real tree rather than taken from a task file:** `'blog'` is
already in `RolePermissionSeeder::MODULES` (line 25), so **D-8** needs no seeder change; `app/Models/` holds
only four classes and there is no `vendor/`; `composer.lock` pins `voku/portable-ascii` 2.1.1 (**R-3**);
0070 line 243's index claim contradicts its own line 226 migration (**D-10**); 0062 line 370, 0062's
component surface and 0063 lines 792/978 are the real downstream break sites (**R-1**); 0069's backlog
item 3 is unaddressed by 0070 (**R-7**); and 0058 line 263's `->ignore($blogCategoryId)` is a bare PK
ignore (**D-4**).

**One check the brief asked for, answered negatively and deliberately:** 0058 was checked for a repeat of
the stale *"SQLite in CI, MySQL in production"* premise that 0070's **R-7** corrects in 0023. **It does not
repeat it** — 0058's own **R-2** already identifies and corrects it, tracing the fix to commit `55ba248`.
The facilitator re-verified independently rather than trusting that citation: `phpunit.xml` line 29
(`DB_CONNECTION=mysql`), `.env.example` line 28, and `.github/workflows/tests.yml` line 42 are all MySQL.
**No correction is needed and 0058's file was not touched.**

**Nothing outside this file was created or modified.** No application code, migration or test was written,
and the files of stories 0023, 0058, 0059, 0061, 0062, 0063, 0068, 0069 and 0070 are untouched.

**Not run by this phase**, per [workflow.md](../../docs/workflow.md): the INVEST check (Phase 2), TDD
implementation (Phase 3), security audit (Phase 4), code review (Phase 5), or the docs pass (Phase 6).
