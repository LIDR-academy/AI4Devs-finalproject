# [0074] Translatable content retrofit — Blog Tags backend

## Description
Applies story [0070](0070-translatable-content-mechanism-product-categories-backend.md)'s translatable-content mechanism to Blog Tags ([PRD Epic 5, Layer 2](../../docs/PRD/PRD.md#epic-5--internationalization), whose translatable-content list names *"Category and tag names"* explicitly). Story [0059](0059-blog-tags-backend.md)'s single-language `blog_tags.name` / `normalized_name` pair moves to a `blog_tag_translations` child table, one row per `(tag, store language)`, with name uniqueness re-scoped from global to **per store language**.

**This story is a consumer of a recipe, not an author of one.** `App\Concerns\HasTranslations`, `App\Actions\Translations\SetTranslation` and `StoreLanguage::defaultStoreLanguage()` are 0070's, reused unmodified. Nothing here re-derives the fallback chain, the write primitive, the default-language memo, the authorization shape or the drift guard.

**But it is the recipe's hardest test so far, and three things genuinely do not port unchanged** — each is a decision below rather than a silent carry-forward: the `->ignore()` clause (**D-6**), 0059's "no `DB::transaction()`" decision (**D-5**), and the store language an on-the-fly tag is authored in (**D-7**).

> **Read this before anything else: neither dependency exists in code.**
> Verified against the live tree at authoring time — `app/Models/` holds only `User`, `Role`, `SalesRegion`, `Media`; `app/Actions/` holds only `Auth/`, `Fortify/`, `Media/`, `Roles/`, `SalesRegions/`, `Users/`; `app/Concerns/` holds six validation traits and no `HasTranslations`; `ls database/migrations/` shows no `blog_tags` and no `store_languages`.
>
> **Stories 0059 (`blog_tags`), 0070 (the mechanism) and 0068 (`store_languages`) are all Phase 1 files in `ai-spec/tasks/`, not shipped code.** Everything below is designed against their *specified* shape. If any of their Phase 2/3 passes changes that shape, this story must be re-derived rather than silently trusted — the [deferred-findings failure mode](../../docs/errors-log.md#a-deferred-storys-findings-were-claims-about-a-tree-that-no-longer-existed-and-one-of-them-would-have-reopened-a-bug-in-this-log--2026-08-23) this project already records once. See **R-1**, which asks whether this should be a retrofit at all.

## Type
backend | includes database-expert: **yes** (one new table, two migrations including a data backfill, one retrofit of an existing table)

## 1. Refined user story

> **As** a blog editor working in a store that publishes in more than one language,
> **I want** each tag's name to be stored and resolved per store language, falling back to the store default when a translation is missing,
> **so that** the tag catalog reads correctly in every language the store authors in, and a partially-translated catalog degrades gracefully instead of rendering blank.

> **As** the engineer applying story 0070's recipe for the second time,
> **I want** the one entity whose name column is *derived and indexed* to go through the mechanism without modifying the shared write primitive,
> **so that** the recipe is proven against a hard case rather than only against the single-plain-column pilot it was written on.

**Scope fence — this story ships no screen.** No Livewire component, no Blade view, no language tabs. The taxonomy language tabs PRD Epic 5 describes belong to a UI story; 0070's **Q3** raises which one, and it is still open (see **Inherited open questions**).

## Gherkin — 2. Detailed acceptance criteria (Given/When/Then)

Every scenario opens with a named business-role actor and carries exactly one `When`, per [gherkin-guidelines.md](../../docs/testing/frontend/gherkin-guidelines.md) rules 1 and 3.

```gherkin
Feature: Per-store-language blog tag names

  # --- Resolution and fallback ---

  Scenario: A blog editor reads a tag translated into the requested language
    Given a blog editor, with a tag named "running" in Spanish and "course à pied" in French
    When the tag's French name is requested
    Then "course à pied" is returned

  Scenario: A missing tag translation falls back to the default store language
    Given a blog editor, with a tag named "running" in the default store language and no French translation
    When the tag's French name is requested
    Then "running" is returned, because the store default supplies the fallback

  Scenario: A tag translated in neither the requested nor the default language resolves to nothing
    Given a blog editor, with a tag holding no translation in any store language
    When the tag's French name is requested
    Then no name is returned and no error is raised

  Scenario: A tag translated into a removed store language is still readable
    Given a blog editor, with a tag translated into French and French since removed as a store language
    When the tag's French name is requested
    Then "course à pied" is returned, because removal preserves stored content

  Scenario: A catalog translated only into the previous default renders no name after a default change
    Given a blog editor, with a tag named only in Spanish and Spanish as the store default
    When a store administrator makes French the store default
    Then the tag's French name resolves to nothing and no error is raised

  # --- Writing a translation ---

  Scenario: A blog editor translates a tag into an additional language
    Given a blog editor holding the blog edit permission, and French active as a store language
    When they set the tag's French name to "course à pied"
    Then the French translation is stored alongside the existing Spanish one

  Scenario: Re-translating a tag replaces its existing translation for that language
    Given a blog editor, with a tag already named "course à pied" in French
    When they set the tag's French name to "trail"
    Then the French translation reads "trail" and no second French row is created

  Scenario: Creating a tag stores its name in the default store language
    Given a blog editor holding the blog create permission
    When they create a tag named "running"
    Then the tag holds exactly one translation, in the default store language

  Scenario: A blank translation is refused
    Given a blog editor holding the blog edit permission
    When they set a tag's French name to a blank value
    Then the change is refused with a validation error and no translation row is written

  # --- Uniqueness, now scoped per store language ---

  Scenario: Two tags cannot share a name within one store language
    Given a blog editor, with a tag named "course à pied" in French
    When they set another tag's French name to "course à pied"
    Then the change is refused with a validation error

  Scenario: The same name in two different store languages is permitted
    Given a blog editor, with a tag named "running" in French
    When they set another tag's Spanish name to "running"
    Then the change is accepted, because uniqueness is scoped to one store language

  Scenario: A tag keeps its own name when re-saved in the same language
    Given a blog editor, with a tag named "course à pied" in French
    When they set that same tag's French name to "course à pied" again
    Then the change is accepted rather than refused as a duplicate

  Scenario: A case-only self-rename within one language is accepted
    Given a blog editor, with a tag named "running" in the default store language
    When they rename that tag to "Running" in the same language
    Then the change is accepted and the stored name reads "Running"

  Scenario: Case-only duplicates still collide within one store language
    Given a blog editor, with a tag named "running" in French
    When they set another tag's French name to "Running"
    Then the change is refused with a validation error

  # --- Create-on-the-fly, the property no sibling taxonomy has ---

  Scenario: Resolving an existing tag name reuses it rather than duplicating it
    Given a blog editor, with a tag named "running" in the default store language
    When they resolve a tag for the name "Running"
    Then the existing tag is returned and the catalog still holds one tag for that name

  Scenario: Resolving an unmatched tag name creates one in the default store language
    Given a blog editor holding the blog create permission, with no tag named "invierno"
    When they resolve a tag for the name "invierno"
    Then a new tag is created holding one translation, in the default store language

  Scenario: Losing the insert race returns the winning tag rather than failing
    Given a blog editor, with another process having just created the tag "invierno"
    When they resolve a tag for the name "invierno"
    Then the existing tag is returned and no second tag row remains

  # --- Deletion ---

  Scenario: Deleting a tag removes its translations with it
    Given a blog editor, with a tag translated into Spanish and French
    When they delete that tag
    Then the tag and both of its translations are removed

  # --- Authorization ---

  Scenario: An administrator without the blog permission cannot translate a tag
    Given a signed-in administrator who does not hold the blog edit permission
    When they attempt to set a tag's French name
    Then the attempt is refused

  Scenario: An administrator needs no store-language permission to author a translation
    Given a blog editor holding the blog edit permission and no store language permissions
    When they set a tag's French name
    Then the translation is stored, because authoring content is not managing the language catalog
```

## Files to create/modify

### Create

- **`database/migrations/<timestamp>_create_blog_tag_translations_table.php`** — the child table plus its backfill in one `up()`, following 0070's recipe step 1 and [`add_status_to_users_table`](../../database/migrations/2026_08_11_175426_add_status_to_users_table.php)'s precedent of backfilling in the migration that creates the thing needing it:

  ```php
  public function up(): void
  {
      Schema::create('blog_tag_translations', function (Blueprint $table): void {
          $table->uuid('id')->primary();
          $table->foreignUuid('blog_tag_id')->constrained('blog_tags')->cascadeOnDelete();
          $table->foreignUuid('store_language_id')->constrained('store_languages')->restrictOnDelete();
          $table->string('name', 100);             // MUST track blog_tags.name's real width — see R-4
          $table->string('normalized_name', 255);  // deliberately WIDER — 0059's R-4 travels unchanged
          $table->timestamps();

          $table->unique(['blog_tag_id', 'store_language_id']);
          $table->unique(['store_language_id', 'normalized_name']);
      });

      app(BackfillBlogTagTranslations::class)();
  }

  public function down(): void
  {
      Schema::dropIfExists('blog_tag_translations');
  }
  ```

  **Both name columns move, and the per-language `UNIQUE` goes on `normalized_name` rather than `name`** (**D-1**). No explicit `index()` on either FK — `constrained()` supplies what InnoDB requires. **Expect three indexes, not 0070's four** (**D-3**), and verify with `php artisan db:table blog_tag_translations` rather than by reading the migration.

- **`database/migrations/<timestamp>_drop_translatable_columns_from_blog_tags_table.php`** — a **second, separate** migration ordered strictly after the first (0070's D-4):

  ```php
  public function up(): void
  {
      Schema::table('blog_tags', function (Blueprint $table): void {
          $table->dropUnique(['normalized_name']);   // explicitly, before the column
          $table->dropColumn(['name', 'normalized_name']);
      });
  }
  ```

  `down()` restores the two columns and the unique index but **cannot restore the values** — knowingly non-inverse, per **D-11**, which records `database-expert`'s dissent.

- **`app/Actions/Blog/BackfillBlogTagTranslations.php`** — the extracted, container-resolved backfill (0070's D-11), query builder only, never Eloquent. **Copies both `name` and `normalized_name` byte-for-byte; never recomputes the fold** (**D-10**). Fails loudly when no default store language exists.

- **`app/Models/BlogTagTranslation.php`** — `use HasFactory, HasUuids;`, `#[Fillable(['name'])]`. `normalized_name`, `blog_tag_id` and `store_language_id` are **omitted** from `#[Fillable]` — `normalized_name` because it is server-derived (the same guard [`Media`](../../app/Models/Media.php) demonstrates most sharply), the two FKs because only `SetTranslation`'s explicit key list may write them. `belongsTo` **both** parents — `blogTag()` and `storeLanguage()` — the first of which 0059 never needed and which **D-5**'s race re-query dereferences. Carries the relocated `saving` hook (**D-4**). See **R-2** before assuming the `store_language_id` write path works.

- **`database/factories/BlogTagTranslationFactory.php`** — with a `forLanguage(StoreLanguage $language)` state, so no test hand-builds the FK pair.

### Modify

- **`app/Models/BlogTag.php`** (0059's) — `use HasTranslations;` plus the one thing the trait cannot infer:

  ```php
  protected function translationModel(): string
  {
      return BlogTagTranslation::class;
  }
  ```

  `#[Fillable(['name'])]` becomes **`#[Fillable([])]`** — the same zero-fillable shape `ProductCategory` reaches. The `saving` hook, the `name` / `normalized_name` `@property` entries and the `NormalizeForSearch` import all **leave this class entirely** (**D-2**, **D-4**).

- **`app/Concerns/BlogTagValidationRules.php`** (0059's) — `nameRules()` gains a `string $storeLanguageId` parameter, retargets `blog_tag_translations`, and **replaces `->ignore()` with an explicit `blog_tag_id` exclusion** (**D-6**). `nameFormatRules()` is **completely unchanged** (**D-13**).

- **`app/Actions/Blog/CreateBlogTag.php`** — signature unchanged (`__invoke(string $name): BlogTag`), meaning narrows to *"the default store language's name"* (0070's D-12). Constructor-injects `SetTranslation`. **Gains a `DB::transaction()`** wrapping the parent-row create and the translation write. Its `23000` catch relocates to the translation insert.
- **`app/Actions/Blog/RenameBlogTag.php`** — signature unchanged. Constructor-injects `SetTranslation`. **Does not gain a transaction** — a rename is a single `updateOrCreate` against one table. `23000` catch retargeted.
- **`app/Actions/Blog/FindOrCreateBlogTag.php`** — signature unchanged (**D-7**). Lookup moves from `WHERE normalized_name = ?` on `blog_tags` to `WHERE store_language_id = ? AND normalized_name = ?` on `blog_tag_translations`, dereferencing `->blogTag`. **Gains a `DB::transaction()`, explicitly overriding 0059's D-10** (**D-5**). Both `Gate::authorize()` calls stay **above** the `SetTranslation` call, since `SetTranslation` authorizes nothing (0070's D-9).
- **`app/Actions/Blog/DeleteBlogTag.php`** — **untouched.** `cascadeOnDelete()` removes translations with the parent; 0059's D-8 unconditional delete is unaffected and gets strictly better (**D-15**).
- **`config/store-languages.php`** (0068's) — **the entire production diff is one appended array literal**, which is 0068's **D8** contract:

  ```php
  ['table' => 'blog_tag_translations', 'column' => 'store_language_id'],
  ```

  No edit to `RemoveStoreLanguage`, to `StoreLanguage::translationUsageCount()`, or to any component.

### Deliberately not touched

- **`database/seeders/RolePermissionSeeder.php`** — no new permission and no new module slug. **Verified against the shipped file rather than inherited from 0059:** `MODULES` already contains `blog`, so all four `blog.*` permissions exist today, the catalog stays at **42**, and `Administrator` stays at 41 of 42 (**D-12**).
- **`app/Policies/BlogTagPolicy.php`** — no new ability. There is deliberately no `BlogTagTranslationPolicy` (**D-12**).
- **`app/Actions/NormalizeForSearch.php`** — consumed unchanged; no second fold, no local helper. 0059's D-2 binds here identically.
- **`App\Concerns\HasTranslations`, `App\Actions\Translations\SetTranslation`, `StoreLanguage`** — consumed, never modified (**D-4** is what makes this possible).
- **`blog_post_tag`** — story 0061's, unaffected: `blog_tag_id` still points at `blog_tags.id`, which still exists.
- **`resources/views/**`**, **`app/Livewire/**`**, **`config/modules.php`**, **`routes/**`**, **`lang/**`** — no screen, no route, no sidebar entry, no UI copy.

## 3. QA test cases / validation scenarios

Feature and Unit only. **No browser tests** — this story ships no screen.

### Which of 0059's files survive

| File | Disposition |
| --- | --- |
| `tests/Feature/Policies/BlogTagPolicyTest.php` | **Unchanged.** The retrofit adds no ability and touches no permission. |
| `tests/Unit/Concerns/BlogTagValidationRulesTest.php` | **Rewritten** — new parameter, new table, new exclusion clause. |
| `tests/Feature/Models/BlogTagTest.php` | **Shrinks drastically** — `BlogTag` becomes identity-only. Everything about `name` / `normalized_name` / the `saving` hook moves out. |
| `tests/Feature/Blog/CreateBlogTagTest.php` | **Rewritten** — asserts against the child table, scoped to the default language. |
| `tests/Feature/Blog/RenameBlogTagTest.php` | **Rewritten** — the own-name trio re-derived against **D-6**'s exclusion. |
| `tests/Feature/Blog/DeleteBlogTagTest.php` | **Mostly survives**, plus a second, independent cascade assertion. |
| `tests/Feature/Blog/FindOrCreateBlogTagTest.php` | **Substantially rewritten** — see the two-table block below. |
| `tests/Feature/Blog/FindOrCreateBlogTagAuthorizationTest.php` | **Structure survives**; "no row is written" sharpens to "no row in **either** table". |
| `tests/Feature/Models/BlogTagTranslationTest.php` | **New.** |

**This rewrite is real scope, not a byproduct of the code changes** — every test asserting against `blog_tags.name` now asserts against a joined translation row (**R-7**).

### Fallback resolution
- [ ] Present for the requested language → that value returned.
- [ ] Missing for requested, present for default → **the default's specific value**, using two *different* fixture strings. *Why:* a non-null assertion passes against a resolver that picked the first translation row alphabetically.
- [ ] Missing for both → `null`, **no throw**.
- [ ] The requested language is **inactive** → still resolves. *Why:* 0068's **D5** exists so a removed language's content stays readable; a defensive `is_active` filter in `translated()` would defeat it.
- [ ] The store default is **changed** under a tag translated only into the old default → resolution re-points, and the old-default-only tag resolves to `null` without error.
- [ ] **No default store language row at all** (forced with `DB::table()->update()`) → the failure is loud and legible.
- [ ] **Not written:** a per-field independent-fallback test. `BlogTag` has exactly one translatable field, so a regression is as invisible here as on 0070's pilot; 0070's **D-5** already owns that contract and defers the real multi-field proof to 0076/0078.

### Uniqueness, re-scoped per language
- [ ] Same normalised name, **same** language → refused.
- [ ] **Identical** normalised name, **different** languages → **accepted**, using the byte-identical string in both. *Why this exact pairing:* it is the only test that proves the scope moved from global to per-language, and a fixture also differing in case would pass under a rule that ignores language scoping entirely, because the incidental difference would be doing the work.
- [ ] Rename to own current name — **three** tests, not one (0059's R-1): (a) the no-op rename succeeds, (b) the row is genuinely unchanged and no second translation row appeared, (c) a genuinely free name is still accepted, as the control.
- [ ] **The wrong-id catch, written deliberately rather than left implicit** (**D-6**, and see **R-5**): two tags, A named "chaussures" in French and B named "bottes" in French; re-save A's French name as "chaussures" unchanged; assert success. A generic self-rename assertion catches this too, but "A collided with itself" is a far faster diagnosis from failure output alone.
- [ ] Case-only and accent-only duplicates **within** one language still collide (`"Nino"` / `"Niño"`), proving the comparison still routes through `NormalizeForSearch`.
- [ ] The same accent-folded pair in **different** languages does **not** collide.
- [ ] A **foreign-key** violation (a forged `store_language_id`) is **not** misattributed as a duplicate-name validation error. *Why:* the table now carries two `UNIQUE`s and two FKs, so a blanket `23000` → "name taken" translation is newly wrong.
- [ ] Blank and whitespace-only translations refused on **every** language path, not only the default.

### `FindOrCreateBlogTag` under the retrofit — the story's highest-risk block
- [ ] **The orphan-row race — the single highest-value test in this story** (**D-5**). Pre-insert a colliding `(store_language_id, normalized_name)` row directly via `DB::table('blog_tag_translations')->insert(...)`, then call the action. Assert **both**: (i) it returns the **existing** tag that owns the pre-inserted translation, and (ii) the `blog_tags` row count did **not** increase. *Assertion (ii) is the whole point* — it is the only one that exercises whether the two-row write is transactional, and a naive port of 0059's action passes every other test in the file while failing this one only under real concurrency.
- [ ] A `BlogTag` with **zero** translation rows resolves to `null` on every field and throws nothing — defence in depth, in case a later refactor reopens the orphan path.
- [ ] Exact-match, case-only and accent-only reuse each return the **same row id** and leave one tag.
- [ ] **Whitespace-padded reuse** (`'  running  '`) and **internal-whitespace-collapse reuse** (`'trail  running'`) — **blocking, not filler.** 0059's **R-8** survives the retrofit with its target moved: `utf8mb4_unicode_ci` is itself case- *and* accent-insensitive, so an implementation that skips `NormalizeForSearch` entirely still passes every case and accent assertion. **No collation folds whitespace**, so these two remain the *only* assertions proving the normaliser is in the call path at all.
- [ ] Brand-new create makes exactly one tag **and** one translation row, in the default language — the negative control without which every reuse assertion could pass against an implementation returning an arbitrary row.
- [ ] `wasRecentlyCreated` is `true` on the create path and `false` on the reuse path.
- [ ] Blank and whitespace-only input refused **before any lookup or insert**, with no row created in **either** table.

### The backfill
- [ ] N arranged tags each get **exactly one** translation row, in the default store language, with `name` **and** `normalized_name` byte-identical to the originals — asserted **per row, never as a count**. *Why:* a count passes even if every row got the wrong name or all rows collapsed to one value — the [count-assertion failure mode](../../docs/errors-log.md#a-count-based-assertion-over-rendered-html-counted-a-wrapper-element-it-never-meant-to-include--2026-08-21) this project records.
- [ ] Names with leading/trailing whitespace and at the length boundary survive unchanged.
- [ ] The backfill with **no default store language** throws and writes nothing.
- [ ] **One reassuring assertion, not a suite:** N pre-existing, already-globally-unique tags backfill without violating the new composite `UNIQUE`. **D-10** proves this cannot fail by construction; the test documents the proof rather than hunting a collision that structurally cannot occur.
- [ ] The migration itself is **not** separately tested — but see **R-3**, which is a genuine unsolved problem this story inherits rather than a settled convention.

### The `BlogTagTranslation` model
- [ ] The `saving` hook derives `normalized_name` on **insert** and **re-derives it on rename** — two assertions, not one (0059's **R-3**). A hook firing only on insert leaves a renamed row's `normalized_name` pointing at the old name, silently breaking both uniqueness and lookup while the row looks correct in any UI.
- [ ] Saving without touching `name` does **not** rewrite `normalized_name` — pins the `isDirty('name')` guard.
- [ ] A forged mass-assignment of `normalized_name`, `blog_tag_id` or `store_language_id` is ignored.
- [ ] UUID v7 id; both `belongsTo` relations resolve.

### The rendered-fallback collision — tested as confirmed behaviour, not as a bug
- [ ] Tag A holds a stored French name "running"; tag B holds no French translation and a default-language name that normalises to "running". Assert both resolve to the **identical** string in a French context, and that **neither write raised an error**. Framed explicitly as accepted behaviour (**D-9**) so a future reviewer does not "fix" the fallback design out of an instinct that identical rendered output must mean a missed constraint.

### Deliberately NOT tested here
- [ ] **`NormalizeForSearch`'s folding table** (ß, ç, CJK, idempotence) — story 0022's. This story proves tag names *go through* it, via the whitespace cases above.
- [ ] **`HasTranslations`' generic mechanics** — the bounded-query eager load and the default-language memo reset are 0070's, tested once against `ProductCategory`. This story proves only that `BlogTag` **wires into** the mechanism.
- [ ] **`SetTranslation` in isolation**, including its deliberate lack of authorization — 0070's D-9; its correctness is implied by the create/rename/backfill tests.
- [ ] **The `translation_relations` drift guard** — 0070's **D-14** derives its expectation from the live schema and a `*_translations` suffix scan, so it picks up `blog_tag_translations` **for free** the moment the config literal is appended. Writing a second copy is exactly the redundancy that decision exists to prevent.
- [ ] **`StoreLanguage`'s own CRUD and invariants** — 0068's.
- [ ] **`BlogTagPolicy`'s abilities and the permission catalog** — orthogonal to the retrofit.
- [ ] **Anything touching `blog_post_tag`** — 0061's, and 0059's scope fence is unchanged here.

## Expected outcome

`blog_tags` no longer carries `name` or `normalized_name`; every tag's name lives in `blog_tag_translations`, one row per store language, with existing rows backfilled into the store default. `BlogTag::translated('name')` returns the requested language's name, the store default's when that is absent, and `null` when neither exists — never an exception. A tag can be translated into any store language by an editor holding only `blog.edit`, with uniqueness enforced per language. Create-on-the-fly still resolves-or-creates in one call, now atomically across two tables, and a lost race still returns the winning tag rather than throwing. `StoreLanguage::translationUsageCount()` counts blog tag translations with no component change.

## Acceptance criteria

- [ ] `blog_tag_translations` exists with a UUIDv7 primary key, two non-nullable UUID FKs, `name`, `normalized_name` and timestamps; `php artisan db:table blog_tag_translations` reports exactly **three** indexes (`primary` and the two composite `UNIQUE`s), with **no** separate single-column FK index — verified by that command, not by reading the migration.
- [ ] `normalized_name` is sized **wider** than `name`, and `name`'s width matches `blog_tags.name`'s real width at retrofit time (**R-4**).
- [ ] The FK to `blog_tags` cascades on delete; the FK to `store_languages` restricts and is understood to be defensive-only.
- [ ] `blog_tags.name`, `blog_tags.normalized_name` and the `unique('normalized_name')` index are gone, dropped in a **separate** migration ordered after the one that creates and populates the child table.
- [ ] Every pre-existing tag holds exactly one translation row in the store default language, with **both** name columns preserved byte-for-byte; the backfill aborts loudly when no default store language exists.
- [ ] `App\Models\BlogTag` is identity-only (`#[Fillable([])]`), declares `translationModel()`, and carries **no** `NormalizeForSearch` import and **no** `saving` hook.
- [ ] `App\Models\BlogTagTranslation` derives `normalized_name` on every write that changes `name`, on both the insert and the update path, and exposes `name` as its only fillable attribute.
- [ ] `App\Actions\Translations\SetTranslation` is consumed **byte-for-byte unmodified** — no translation-specific derivation logic exists at any call site.
- [ ] Name uniqueness is enforced per store language on `normalized_name`, through the shared `NormalizeForSearch` fold, with no `23000` misattribution across the table's four constraints.
- [ ] Re-saving a tag's own name in the same language is accepted — including a case-only variant — and the mechanism is an explicit `blog_tag_id` exclusion, not `->ignore()`.
- [ ] `FindOrCreateBlogTag` writes the parent row and its default-language translation **in one transaction**, leaves **no** orphaned translationless tag when it loses the insert race, and returns the winning tag.
- [ ] `DeleteBlogTag` is **untouched** and deleting a tag removes its translation rows.
- [ ] Authoring a translation requires the entity's own `blog.*` ability and **no** `store-languages.*` permission; the permission catalog is unchanged at **42**.
- [ ] `config/store-languages.php` gains **exactly one** appended array literal, contains no closures, and survives `config:cache`; no other file in 0068's or 0070's territory is edited.

## Definition of Done
- [ ] Tests written and green (**full suite unscoped**, not `--filter`) — this story relocates a **model event**, so its blast radius is the whole suite by construction
- [ ] `vendor/bin/pint --format agent` run **unscoped**, not `--dirty`
- [ ] **Larastan level 7 run and recorded** — named explicitly because [errors-log.md](../../docs/errors-log.md#a-verification-record-that-lists-two-of-three-quality-gates-is-a-record-of-two-gates--2026-08-26) records three consecutive stories whose verification notes listed two of three gates and were read as records of all three
- [ ] Code reviewed (code-reviewer)
- [ ] No security findings (appsec-auditor)
- [ ] Documentation updated (docs-keeper) — at minimum `docs/database/schema.md` (a second per-language content table, and the first whose translated column is *derived*), `docs/database/migrations.md` (the recipe's second retrofit pair), and `docs/architecture/authorization.md` (recording again that translated content adds **no** ability and **no** permission)
- [ ] **Recorded as a handoff, not done here:** the coordination items in **R-1**, **R-2** and **R-3**, each of which belongs to 0059, 0070 or the coordinator. This story edits no other story's file.
- [ ] Acceptance criteria met

## 4. Documented functional decisions

**D-1 — The translation table carries **both** `name` and `normalized_name`, and the per-language `UNIQUE` binds `normalized_name`.** The human confirmed that a translated name stays unique per store language, phrasing it as `UNIQUE(store_language_id, name)`. The faithful port is `UNIQUE(store_language_id, normalized_name)`, because **0059's established uniqueness rule is on `normalized_name`** (its **D-3**) — the human named the concept, not the column. This is 0070's recipe followed literally rather than bent: step 1 says *"optionally `unique(['store_language_id', <the field that was globally unique>])`"*, and for `blog_tags` that field **is** `normalized_name`. Three of D-3's four original reasons survive the retrofit undiminished — the TOCTOU window, index-and-app agreeing by construction, and the indexed read path a per-keystroke autocomplete needs — and the third gets **stronger**, since `(store_language_id, normalized_name)` is exactly the index a per-language prefix scan wants. `database-expert` noted that D-3's fourth reason ("removes the engine question") is now **moot** rather than merely weaker, since 0059's own **D-13** established that this app is MySQL-only everywhere; recorded so nobody cites a dead argument. *Rejected:* dropping `normalized_name` and putting the unique on `name`. Per-language scoping does not make a stored fold unnecessary — none of the surviving reasons depended on the uniqueness being global. **If the human intended the literal `name` column, this is the one decision to correct**, and it is stated this explicitly so the correction is cheap.

**D-2 — `blog_tags` becomes an identity-only table, and that is correct rather than a smell.** After the drop it holds `id` and timestamps and nothing else. Three reasons this is right. *(i)* It is the identity anchor `blog_post_tag.blog_tag_id` (story 0061) points at, and tag identity must survive a rename **in any language** — which is exactly what a separate parent row buys. *(ii)* 0059's **D-6** deliberately gave this entity no `slug`, `description`, `sort_order` or `usage_count`, so there was never a non-translatable column to keep; an entity that *did* have one would keep it here. *(iii)* It matches `ProductCategory`'s own post-retrofit `#[Fillable([])]` shape, so the recipe produces the same result twice. `database-expert` adds one honest note: `updated_at` on the parent will essentially never fire again outside an explicit `touch()`, which is harmless and not worth a design change. A future non-translatable column (a tag colour, say) goes on `blog_tags`, unaffected by any of this.

**D-3 — Three indexes, not 0070's four, and the difference is instructive.** 0070's `product_category_translations` expects four, because its second composite is `unique(['store_language_id', 'name'])` — and there, `store_language_id` **is** leftmost, giving the same three-index outcome... except 0070 explicitly predicts a fourth, auto-created FK index on `store_language_id`. Here `database-expert`'s reading is that InnoDB reuses **any** index having the FK column as a leftmost prefix, and both FKs are leftmost in one of the two composites (`blog_tag_id` in the first, `store_language_id` in the second), so neither needs its own. **This is a prediction from documented behaviour, not something executed** — `vendor/` is absent from this worktree and no migration has run. Phase 3 must settle it with `php artisan db:table blog_tag_translations`, which this repo's own convention already requires. If MySQL creates the redundant indexes anyway, it is a low-severity write-amplification cleanup, not a correctness issue — but the discrepancy with 0070's stated four should then be reconciled in one direction rather than left as two stories predicting different numbers for the same shape.

**D-4 — The `saving` hook moves to `BlogTagTranslation`, and this is what lets `SetTranslation` stay unmodified.** 0059's **D-4** derives `normalized_name` from `name` via a `saving` model event guarded by `isDirty('name')`. Both columns move to the child table, so the hook moves with them — mechanically obvious, but **the consequence is not**, and all three amigos converged on it. `SetTranslation` is `$translatable->translations()->updateOrCreate(['store_language_id' => $language->id], $attributes)`; `updateOrCreate` resolves-or-instantiates and calls `save()`, so the child model's own `saving` event fires and derives `normalized_name` **without `SetTranslation` knowing the column exists**. Had 0059 taken its own rejected alternative — each action computing and `forceFill`ing the value — every one of `CreateBlogTag` / `RenameBlogTag` / `FindOrCreateBlogTag` would have to stuff a derived column into the generic `$attributes` array, which is three implementations of one invariant *and* a modification to a primitive 0070 forbids modifying, inherited by every future translatable model that derives a search column. **0059 flagged D-4 as a new pattern needing deliberate Phase 2 attention; it is now load-bearing for the shared mechanism, and that raises the bar for rejecting it.** `booted()` not `boot()` still applies, for 0059's own stated reason: `BlogTagTranslation` extends `Model` directly and has no vendor hooks to order against. Do not "fix" a missing hook by copying it back onto `BlogTag`.

**D-5 — `FindOrCreateBlogTag` and `CreateBlogTag` require `DB::transaction()`; 0059's D-10 "no transaction" decision is explicitly overridden. (`backend-expert` and `backend-qa` reached this independently.)** 0059's D-10 reasoned that *"the race is closed by the unique index plus the catch, and a transaction would neither prevent the collision nor change the resolution"* — **correct at the time, for a single-table insert.** The retrofit changes the failure mode rather than the race: creating a tag is now two INSERTs, the parent identity row and its default-language translation, and the unique constraint has moved entirely onto the second table (`blog_tags` after the retrofit carries no name-shaped column to collide on at all). Without a transaction, a `23000` on the *translation* insert leaves the *parent* committed — a permanently orphaned tag with zero translations. `HasTranslations::translated()` returns `null` for it on every field, which throws nothing (0070's **D-6** makes that a normal outcome), so it is invisible in every screen, silently dropped by any name-sorted or name-filtered list, never cleaned up, and it violates the "one row = one tag" invariant every later `withCount()`-style query will assume. This is a defect the pre-retrofit single-statement shape **could not produce**. It matches what 0070 already specifies for `CreateProductCategory` ("writes the parent row and its default-language translation in **one transaction**"), so the retrofit is bringing this action into line with the recipe rather than inventing a wrapper. **`RenameBlogTag` does not gain one** — a rename is a single `updateOrCreate` against one table. Per [errors-log.md](../../docs/errors-log.md#wrapping-existing-code-in-a-dbtransaction-moved-a-cache-flush-nobody-had-written--2026-08-21), a transaction wrapper is a change to every side effect the wrapped code performs; here the wrapped code is two inserts and a model event, none of which has an out-of-transaction obligation.

**D-6 — The uniqueness rule's self-exclusion is an explicit `blog_tag_id` clause, not `->ignore()`. (The two experts proposed different fixes; the divergence is resolved here.)** 0059's `nameRules()` carries `Rule::unique('blog_tags', 'normalized_name')->ignore($blogTagId)`. Retargeted at `blog_tag_translations`, `->ignore($blogTagId)` compiles to `WHERE id != $blogTagId` against the **translation row's** own UUID — a disjoint key space from `blog_tags.id`, so the clause silently matches nothing and every same-name re-save is refused as a duplicate, in every language, permanently. That is 0059's **R-1** ("the single most likely bug in this story") reintroduced by the retrofit rather than fixed by it. `backend-qa` proposed passing the **translation row's** id instead; `backend-expert` proposed dropping `->ignore()` entirely for an explicit exclusion inside the `where()` closure. **`backend-expert`'s shape is adopted, on an argument neither made:** a rename into a language the tag is **not yet translated into** is an *insert*, so there is no translation row and no id to pass — the `->ignore($translationId)` shape has an undefined case exactly where the mechanism is most used. `where('blog_tag_id', '!=', $blogTagId)` answers "is this the same tag" with the key the caller already holds, uniformly across insert and update:

```php
protected function nameRules(NormalizeForSearch $normalizeForSearch, string $storeLanguageId, ?string $blogTagId = null): array
{
    return [
        ...$this->nameFormatRules(),
        Rule::unique('blog_tag_translations', 'normalized_name')
            ->where(fn ($query) => $query
                ->where('store_language_id', $storeLanguageId)
                ->where('normalized_name', $normalizeForSearch(/* the candidate */))
                ->when($blogTagId !== null, fn ($q) => $q->where('blog_tag_id', '!=', $blogTagId))),
    ];
}
```

Phase 3 settles the exact Laravel expression, matching 0059's own posture; what is fixed here is **the column compared, the fold used, and the key the self-exclusion keys on**.

**D-7 — An on-the-fly tag is authored in the **default** store language; `__invoke(string $name)` keeps its signature.** 0070's **D-12** is the direct precedent: it keeps `CreateProductCategory::__invoke(string $name)` unchanged and explicitly rejects widening it to carry a language *"for a capability nothing yet asks for"*. Four reasons the same answer holds here. *(i)* PRD Epic 5 puts per-language name editing in the **taxonomy management screens**, not in the post editor. *(ii)* It keeps `HasTranslations`' fallback always resolving, so an on-the-fly tag is never nameless in any locale — which is 0070's **Q1(a)** assumption, and this story is where that assumption stops being a preference and starts being load-bearing, since tags are created at speed with no curation step. *(iii)* The admin **UI** locale is ES/EN only and is explicitly a *different layer* PRD says not to conflate, so keying off it is wrong outright. *(iv)* `FindOrCreateBlogTag` has two callers (0060's screen, 0061's post save) and neither currently has a language to pass. *Rejected:* `__invoke(string $name, ?StoreLanguage $language = null)` — a widened public contract for a capability that may not exist, cheap to add later and expensive to un-add. **The cost is real and is escalated as Q-1**, because both `backend-expert` and `backend-qa` asked for this to be named rather than silently resolved.

**D-8 — The reuse lookup is scoped to exactly one store language, and that follows from the uniqueness rule rather than being a separate choice.** Under `UNIQUE(store_language_id, normalized_name)`, one normalised name can legitimately identify **two different tags** in two different languages. A cross-language lookup therefore has **no unique answer by construction** — it could match more than one row and would have to pick one arbitrarily. So the lookup is single-language, and under **D-7** that language is the store default. *Considered and not adopted:* mirroring `translated()`'s own fallback chain in the lookup (search the requested language, then the default). It is the right shape for a caller that **has** a language context, and there is none today; adding it now would be speculative, and it is the natural extension if **Q-1** resolves toward a language parameter.

**D-9 — Two tags may render identically in a non-default language, and that is accepted rather than a defect.** Per-language uniqueness binds **stored** rows. `translated()` falls back. So a tag with a stored French name "running" and a *different* tag with no French row whose default-language name normalises to "running" both render "running" in a French context, violating no constraint. Closing this requires either enforcing uniqueness over the **fallback-resolved** value across every language on every write — a global re-scan on every other tag's writes, multiplied by the active-language count, which is precisely the cost 0059's **D-3** already rejected in a different guise — or forcing every tag to hold an explicit translation in every active language, which defeats the entire point of graceful fallback. **Both fixes are worse than what they fix.** It is therefore tested as *confirmed behaviour* with a decision line beside it, so a future reviewer does not "fix" the fallback design out of an instinct that identical rendered output must mean a missed constraint. ⚠️ The *rendering* collision is benign; the **reuse-lookup** consequence of the same root cause is not, and is escalated as **Q-1** rather than absorbed here.

**D-10 — The backfill copies both name columns byte-for-byte and never recomputes the fold, and it cannot violate the new composite `UNIQUE`.** Copying removes a dependency on `NormalizeForSearch` being byte-identically deterministic across invocations — true in practice, but an assumption the migration would carry for no benefit — and, more importantly, it is what makes the safety **provable** rather than trusted to a second computation. **The proof:** the backfill writes exactly one row per existing `blog_tags` row, all sharing one `store_language_id` (the resolved default). The pre-retrofit schema's global `UNIQUE(normalized_name)` already guarantees every value is pairwise distinct. A pairwise-distinct set paired with one constant `store_language_id` is trivially pairwise-distinct as `(store_language_id, normalized_name)` tuples. This holds by construction, and it holds per-partition even if a later revision seeded every language. Note the backfill uses the query builder (0070's **D-11**), so the `saving` hook does **not** fire during it — which is exactly why both columns must be selected and copied rather than one derived.

**D-11 — `down()` follows 0070's knowingly non-inverse precedent. (`database-expert` recommended otherwise; the dissent is recorded, and its safety argument is correct.)** `database-expert` proposed a genuine restore — re-add both columns nullable, `UPDATE ... JOIN` the default-language partition back onto `blog_tags`, then re-apply `NOT NULL` and the unique index — and proved it safe: the restored values come from one language partition the new composite `UNIQUE` already guarantees is duplicate-free, so re-imposing a global unique over them is exactly as strict as the old constraint required. **The proof is right and the recommendation is still declined, for two reasons.** *(i)* It makes migration 2's `down()` **read from migration 1's table**, so a manual out-of-order `--step` rollback silently produces a wrong result rather than an error — `database-expert` flagged this itself. *(ii)* The recipe's whole value is that four sibling retrofits do the same thing; a per-table `down()` sophistication makes "how does this one roll back" a per-story question forever, which is the same argument 0070's **D-2** used to reject a per-story PK. `database-expert` explicitly deferred to consistency with 0070 rather than picking unilaterally, and asked for Phase 2 to reconcile it. **If Phase 2 prefers the real restore, it should be adopted in 0070 first and inherited here**, never adopted here alone.

**D-12 — Translated content adds no permission, no ability and no policy.** 0070's **D-13** applied unchanged. **Verified against the shipped `database/seeders/RolePermissionSeeder.php` rather than inherited from 0059:** `MODULES` already contains `blog`, so `blog.view/create/edit/delete` exist today with zero seeder change, the catalog stays at **42** and `Administrator` at 41 of 42. Authoring a translation is *using* a configured language, not managing the language catalog, so no `store-languages.*` permission is required (0068's **D18** draws exactly this boundary). There is deliberately no `BlogTagTranslationPolicy` — it would restate `BlogTagPolicy::update` under a new name, and [`SalesRegionPolicy`](../../app/Policies/SalesRegionPolicy.php)'s own docblock records that abilities nothing calls add untested surface. No step-up requirement. **One ordering constraint is newly load-bearing:** since `SetTranslation` authorizes nothing (0070's **D-9**), each action's `Gate::authorize()` calls must sit **above** the `SetTranslation` call — there is no other checkpoint between the caller and the write once the primitive is in the path.

**D-13 — `nameFormatRules()` is unchanged, and 0059's two-method split survives intact.** It carries format only (`['required', 'string', 'max:100']`), no uniqueness and no language, and remains what `FindOrCreateBlogTag` uses — where an existing name is a **hit**, not a refusal. This is the cleanest survival in the retrofit and is stated explicitly rather than assumed, because 0059's **D-9** calls the split *"the single most important structural fact about the trait"*: a `FindOrCreateBlogTag` that reached for `nameRules()` would refuse its own primary use case. The unit test asserting `nameFormatRules()` carries no uniqueness rule keeps the two from being "unified" later, and it survives this story unchanged.

**D-14 — The collation decision is 0059's D-14, and it travels unchanged.** `database-expert` raised, as something it would not sign off without an answer, whether `NormalizeForSearch` lowercases — since under `utf8mb4_unicode_ci` a value pair PHP considers distinct could still collide at the index. **Answered from 0059's own text rather than left open:** the normaliser is `trim` → `Str::lower` → `Str::ascii` → collapse-whitespace, so it *does* lowercase, and 0059's **D-14** already analysed the residual and decided to keep the connection's default collation rather than `utf8mb4_bin` — because the looser index can only ever merge *more* aggressively than PHP, which for a tag catalog is the desired direction of error, and because both actions already handle a `23000` correctly (`CreateBlogTag` surfaces a `ValidationException`, `FindOrCreateBlogTag` re-queries and **finds** the winning row precisely because the same loose collation makes the lookup match). Nothing about moving the column to a child table changes any of that. Recorded so the concern is visibly answered rather than dropped.

**D-15 — `DeleteBlogTag` is untouched, and deletion gets strictly better.** 0059's **D-8** unconditional `$blogTag->delete()` is unchanged. One `DELETE` now fires every `ON DELETE CASCADE` referencing the row — the translation rows *and* 0061's `blog_post_tag` rows — in one statement, with no new application code and no possibility of an orphaned translation. `DeleteProductCategory` was likewise untouched by 0070, so this is the recipe reproducing a result rather than a new finding. Two notes worth keeping: the bulk-vs-instance `delete()` trap this repo documents for `User` does **not** apply to `BlogTag` (no model-level `delete()` override exists, so the cascade is purely FK-driven) — but it *would* become live again if a future story ever gave `BlogTag` a `deleting` guard the way `Role` has one.

## 5. Dependencies, risks, open technical questions

### Dependencies

- **[Story 0059](0059-blog-tags-backend.md)** — hard dependency, **not implemented**. This story retrofits its table, its model, its validation trait and three of its four actions. See **R-1**, **R-4** and **R-7**.
- **[Story 0070](0070-translatable-content-mechanism-product-categories-backend.md)** — hard dependency, **not implemented**. Supplies `HasTranslations`, `SetTranslation`, `StoreLanguage::defaultStoreLanguage()`, the drift guard and the whole recipe. This story consumes all of it unmodified.
- **[Story 0068](0068-store-languages-catalog-backend.md)** — hard dependency, **not implemented**. Supplies `store_languages`, the `is_default` row the fallback resolves through, and the `translation_relations` registry this story appends to. Its backlog item 3 fixes the FK contract used above (`restrictOnDelete()`, **not nullable**, explicit table name, no explicit `index()`); this story follows it.
- **Story 0022** — supplies `App\Actions\NormalizeForSearch`, consumed unchanged. Its ownership question is 0059's **OQ-2** and is **not re-litigated here**.
- **Stories 0060 and 0061 depend on this story.** 0060 is the tag management screen; 0061's post-save flow is `FindOrCreateBlogTag`'s second caller and owns the `blog_post_tag` pivot contract. Both bind to signatures this story deliberately leaves unchanged (**D-7**).
- **No sibling to reconcile against.** Unlike 0059 — which could read 0058 mid-composition and align with it — `0071`, `0072` and `0073` **do not exist in `ai-spec/tasks/`**, verified at authoring time. Story **0072** (Blog Categories) will retrofit a table with the *same* `normalized_name` shape, so **D-1**, **D-4**, **D-5** and **D-6** should be treated as the reference answers for it rather than re-derived — and if 0072 lands first with different answers, this file is the one to reconcile.
- **No new Composer package.**

### Risks

- **R-1 — Whether this is a retrofit at all is an open sequencing question, not a fact. (Both experts raised it independently.)** `blog_tags` does not exist. If 0059 has not shipped when this story reaches Phase 3, the two-migration dance is pure waste: there is no data to backfill, no `down()` asymmetry to accept, and no orphan-row hazard to migrate around. The cheaper path is to **amend 0059** so `blog_tags` is greenfield with `name` living only in `blog_tag_translations` from day one. This is 0070's **R-3** recurring exactly, and it is recorded the same way rather than assumed away: the PRD roadmap puts Epic 5 last, which makes the retrofit shape *likely*, but likely is not certain. **Everything in this file applies to the mechanism either way**; only the migration count, the backfill class and **R-3** depend on the answer. This is a Phase 2 decision and is cheaper to make than to reverse.
- **R-2 — Whether `SetTranslation` can actually write `store_language_id` is unverified, and it is 0070's contract rather than this story's.** `SetTranslation` passes `['store_language_id' => $language->id]` as `updateOrCreate`'s first array. On the create path that array flows through `fill()`, which respects `#[Fillable]` — and both 0070's `ProductCategoryTranslation` and this story's `BlogTagTranslation` deliberately **omit** `store_language_id` from `#[Fillable]`. If the value is silently dropped, every translation insert fails on a `NOT NULL` FK column. `vendor/` is **absent from this worktree**, so the exact `HasOneOrMany::updateOrCreate()` / `firstOrNew()` path in the installed Laravel 13 could not be read, and this project's [standing rule](../../docs/errors-log.md#a-reviewers-correction-replaced-an-accurate-technical-explanation-with-a-wrong-one-unverified--2026-08-24) is that an unverified mechanism written up confidently is worse than an open question written up plainly. **Phase 3 must verify this by execution.** If it is broken, the fix (making the column fillable, or `forceFill`ing inside the primitive) belongs in **0070**, since it affects every consumer — do not patch it locally here.
- **R-3 — 0070's D-11 rejects the obvious way to arrange a pre-backfill state and does not say what to do instead, and that gap now bites the second story.** After both migrations, `blog_tags.name` does not exist, but the backfill must be exercised against rows that have one. `RefreshDatabase` only ever gives the final schema, and 0070's **D-11** explicitly rejects a partial `migrate --path=` run as *"fragile against every future migration reordering"* — without naming a replacement. `backend-qa`'s candidate: in the Arrange step, re-add a throwaway nullable `name` column via `Schema::table()`, insert raw rows with `DB::table()`, invoke the backfill directly, assert, and let `RefreshDatabase` discard the ad hoc column. **Flagged as a candidate, not a decision** — it is a guess at a mechanism 0070 must settle first, and building it twice differently is the outcome to avoid.
- **R-4 — This table's `name` width depends on an unresolved 0059 question.** 0059's **OQ-1** (100 vs 255) is still open. `blog_tag_translations.name` must copy `blog_tags.name`'s **real** width at retrofit time, not the number quoted in 0059's current draft — and if OQ-1 resolves to 255, `normalized_name` needs **re-measuring** rather than being assumed to stay at 255, since 0059's **R-4** requires the fold's real worst-case `Str::ascii()` expansion to be measured by execution rather than assumed. The composite key length is comfortable either way (`CHAR(36)` + `VARCHAR(255)` utf8mb4 ≈ 1056 bytes against InnoDB's 3072-byte ceiling), but verify if the widths move a lot.
- **R-5 — The `->ignore()` trap fails silently and permanently, not loudly and once.** Wired wrong, every same-name re-save is refused in every language forever, and the row looks perfectly correct throughout. **D-6** closes it; the deliberate two-tag test in the QA block is what keeps it closed.
- **R-6 — Under D-7, an editor authoring in a non-default language will mint near-duplicate tags, and this is the sharpest consequence of the whole retrofit. (`backend-expert`'s finding.)** Both the reuse lookup and the create write operate in the **default** language partition. So an editor reading French-rendered tag names and typing a French name gets a lookup against the *default* partition, which misses, and a new tag whose *default-language* name is that French string — even though a tag translated into French with that exact name may already exist. It is not merely the cosmetic rendering collision of **D-9**: the existing tag is **invisible to the reuse check entirely**. Because create-on-the-fly's whole point is speed with no curation step, "translated only into the default" may be the steady state for most tag rows rather than the rare case 0070's **D-6** frames it as. **Escalated as Q-1**, since closing it needs either a widened signature (**D-7**'s rejected option) or a product decision to push cross-language tag hygiene onto 0060's screen.
- **R-7 — Rewriting 0059's test suite is real scope in this story, not a byproduct.** Seven of its nine test files change, two of them substantially, because every assertion against `blog_tags.name` now targets a joined translation row. Only `BlogTagPolicyTest.php` survives untouched. Budget for it explicitly.
- **R-8 — 0059's R-8 false-green survives the retrofit with its target moved.** `utf8mb4_unicode_ci` is case- *and* accent-insensitive, so an implementation that skips `NormalizeForSearch` entirely still passes every case and accent assertion against `blog_tag_translations`. The whitespace-padded and internal-double-space reuse tests remain the **only** proof the normaliser is in the call path. Do not let a Phase 3 simplification drop them as redundant with the case tests.
- **R-9 — A changed store default reaches the deepest fallback branch in normal operation, and tags are where it hurts most.** 0070's **R-2** applies with more force here: the instant an administrator promotes a new default, every tag translated only into the *old* default resolves to `null`. On a taxonomy created at speed and rarely curated, that is potentially most of the catalog. Correct behaviour under 0070's **D-6**, pinned by a mandatory test, and flagged for whichever UI story renders tag names.
- **R-10 — 0070's static default-language memo needs an explicit reset between tests (its R-6), and this story's default-change test is exactly the shape that trips it.** Inherited, not new.
- **R-11 — A stale relation after a write renders the pre-save value** (0070's **R-5**). `SetTranslation` returns the translation row, not the parent, so a caller that saves and re-reads `$tag->translated('name')` without `->load('translations')` shows the old value.
- **R-12 — N+1 in two shapes** (0070's **R-4**): rendering a tag list without `withTranslationsFor()`, and `$model->translations()->where(...)->first()` (the relation **method**, always re-queries) instead of `$model->translations->firstWhere(...)` (the **property**, respects eager loading). They differ by one character. Worth a Phase 5 checklist line.

### Open questions for the product owner

Per [contracts.md](../../docs/contracts.md)'s Uncertainty Handling Rule, each carries a recommendation rather than a silent assumption.

**Q-1 — When a blog editor creates a tag on the fly while working in a non-default store language, which language is that tag's name stored in?** **D-7** decides *the store default* and **R-6** states the cost: the editor's typed name lands in the default-language partition, and a tag already translated into their language with that exact name is invisible to the reuse check, so near-duplicates accumulate at exactly the speed the create-on-the-fly feature was built to enable. Both `backend-expert` and `backend-qa` asked for this to be named rather than silently resolved.
- **(a) The store default, with `__invoke(string $name)` unchanged — _(recommended)_.** It is 0070's **D-12** applied faithfully, it keeps the fallback always resolving so no tag is ever nameless, it matches PRD putting per-language name editing in the *taxonomy management screens*, and it is cheap to widen later. The near-duplicate cost is real but is a **curation** problem, addressable on 0060's screen (surface untranslated tags, nudge toward translating an existing tag rather than typing a fresh one) without any contract change.
- **(b) Widen to `__invoke(string $name, ?StoreLanguage $language = null)`**, storing the name in the language the editor is actually working in, and mirror `translated()`'s fallback chain in the lookup (requested language, then default). It closes **R-6** properly and is the honest shape *if* editors really do author tags per language. Its cost is a widened public contract two unbuilt stories bind to, for a capability that may never be exercised — and a tag created only in French then resolves to `null` for every default-language reader until someone translates it, which is **R-9** arriving by design rather than by accident.
- **This is a product call about how a multilingual editorial team actually works**, not a technical one, which is why it is here rather than decided.

**Q-2 — Does the post editor's tag field sit inside or outside the language tabs?** This determines whether **Q-1** is even live: if tags are edited once per post regardless of language, (a) is clearly right; if the tag field lives inside a per-language tab, (b) becomes hard to avoid.
- **(a) Outside the tabs, shown once — _(recommended)_.** PRD's translatable-field list for posts is *title, body, slug/SEO* — **not** tags; and a post's tag *attachments* are a relationship that does not vary by language. PRD's own rule that non-translatable fields "stay outside the language tabs and are shown once" points the same way.
- **(b) Inside the tabs.** Only coherent if a post is meant to carry different tags per language, which nothing in the PRD suggests.
- **Owned by story 0061 (post editor backend) and its UI sibling, not by this story** — raised here because **D-7** silently assumes (a), and an assumption worth this much should be visible.

### Inherited open questions — listed, deliberately not resolved here

These belong to other stories. This story inherits whatever they land on and must not pre-empt them: 0059's **OQ-1** (tag name length 100 vs 255 — feeds **R-4**), **OQ-2** (who creates `NormalizeForSearch`), **OQ-3** (`FindOrCreateBlogTag`'s branch-dependent ability — **orthogonal to the retrofit**, since it turns on whether a match exists, not on how many tables the lookup spans), **OQ-4** (whether case/accent-insensitive dedup is right for editorial content) and **OQ-5** (aligning 0023 onto the stored-`normalized_name` shape); and 0070's **Q1** (must every entity always hold a default-language translation — **D-7** depends on the answer being yes) and **Q3** (which story owns the taxonomy language-tabs UI).

## 6. Technical tasks for later backlog creation

Derived from this debate; **none are in scope for 0074**.

1. **Settle 0070's backfill-test arrange mechanism once, in 0070** — **R-3**. Every sibling retrofit hits the identical problem, and the answer must be written where they will copy it from.
2. **Verify `SetTranslation`'s `store_language_id` write path by execution, in 0070** — **R-2**. If broken, the fix is 0070's and benefits four stories.
3. **Reconcile the predicted index count between 0070 and this story** — **D-3**. Two stories currently predict different numbers (four vs three) for structurally similar tables; one `php artisan db:table` run settles it.
4. **Decide the `down()` question once, in 0070** — **D-11**. `database-expert`'s provable real-restore is a legitimate improvement; if adopted, it should be adopted for all four retrofits, never for one.
5. **Story 0072 (Blog Categories) should copy D-1, D-4, D-5 and D-6 rather than re-derive them** — it retrofits a table with the same `normalized_name` shape, and every one of those four decisions is about that shape rather than about tags.
6. **A cross-language near-duplicate report or curation affordance for 0060**, if **Q-1** resolves to (a) — surfacing tags with no translation in a given language is the cheap mitigation for **R-6**.
7. **Correct 0059's D-10 in place** once this story's **D-5** is accepted, so its *"no `DB::transaction()` wrapper"* sentence does not read as current guidance to whoever implements 0059 first. This story does not edit that file.
8. **`ModuleRouteAccessTest.php` still covers two routes while more exist** — inherited unclosed from 0017/0018/0068/0070, and untouched here since this story adds no route.

## Provenance

**Phase 1 Three Amigos debate, 2026-08-29.** Participants: `product-owner` (facilitator), `backend-expert`, `database-expert`, `backend-qa` — all three dispatched as real subagents and all three returned. **Nothing outside this file was created or modified**: no application code, migration or test was written, and the files of stories 0059, 0068 and 0070 are untouched.

**Where the three converged:** both name columns move to the child table with the per-language `UNIQUE` on `normalized_name`; the `saving` hook relocates to `BlogTagTranslation`; `SetTranslation` survives unmodified *because* of that relocation; the backfill copies rather than recomputes and cannot violate the new constraint; deletion, authorization and the permission catalog are entirely unaffected.

**Two findings were reached independently by two participants each, which is why they are stated as decisions rather than as suggestions.**

*(a) The transaction requirement (**D-5**).* `backend-expert` and `backend-qa` were asked different questions, neither saw the other's answer, and both concluded that 0059's **D-10** *"no `DB::transaction()`"* stops being true under the retrofit — because the failure mode changes from "a single insert loses a race and leaves nothing" to "the second of two inserts loses a race and leaves a permanently orphaned, translationless tag". `backend-qa` independently named the corresponding test **the single highest-value test in the story**, on the grounds that it is a structural regression the retrofit itself introduces, invisible to every happy-path test and to 0059's entire inherited suite, which would ship silently precisely because 0059's own text still says no transaction is needed.

*(b) The `->ignore()` trap (**D-6**).* Both experts flagged it independently as a real bug rather than a style nit — 0059's **R-1** reintroduced through a new door.

**They split on three points, each resolved above with the dissent recorded rather than dropped.**

*(i) How to fix `->ignore()`.* `backend-qa` proposed re-pointing it at the translation row's own id; `backend-expert` proposed dropping it for an explicit `blog_tag_id` exclusion. **`backend-expert`'s shape adopted, on an argument neither made:** a rename into a language the tag has no translation in is an *insert*, so there is no translation row id to pass, and the re-pointed shape has an undefined case exactly where the mechanism is most exercised.

*(ii) `down()`.* `database-expert` recommended a genuine data-restoring `down()` and supplied a correct safety proof for it. **Declined in favour of 0070's precedent (D-11)**, on two grounds — it couples migration 2's `down()` to migration 1's table, silently misbehaving under an out-of-order rollback (which `database-expert` flagged itself), and a per-table rollback sophistication makes "how does this one roll back" a per-story question across four sibling retrofits. `database-expert` explicitly deferred to consistency rather than deciding unilaterally and asked Phase 2 to reconcile it; that request is honoured as backlog item 4.

*(iii) How bad the fallback collision is.* `backend-qa` analysed the *rendering* collision and pushed back hard on treating it as a defect, recommending it be tested as confirmed behaviour — adopted as **D-9**. `backend-expert` identified a **sharper, different** consequence of the same root cause: the existing tag is invisible to the **reuse lookup**, so non-default-language sessions mint duplicates. That is **R-6** and is escalated as **Q-1**, rather than being folded into D-9's "accepted residual" verdict, because the two have different costs and only one of them is benign.

**Three claims were verified by the facilitator rather than inherited.** *(1)* `blog` is already in the shipped `RolePermissionSeeder::MODULES`, read from the real file — so all four `blog.*` permissions exist today and the catalog stays at 42 (**D-12**). *(2)* This project is **MySQL 8.4 everywhere** (`phpunit.xml`, `.env.example`, `.github/workflows/tests.yml`), so the stale *"SQLite in CI"* premise 0070 found live in story 0023 is **not** repeated by 0059 — its **D-13** already records the correction independently, and this debate confirms it rather than re-finding it. *(3)* `0071`–`0073` do not exist in `ai-spec/tasks/`, so this story has no sibling to reconcile against.

**One expert concern was answered from a file the expert did not have in view rather than passed through as an open question.** `database-expert` would not sign off without knowing whether `NormalizeForSearch` lowercases, because a non-lowercasing fold under `utf8mb4_unicode_ci` would let the index and the application disagree about what a duplicate is. It does lowercase (`trim` → `Str::lower` → `Str::ascii` → collapse-whitespace, per 0059's **D-2**), and 0059's **D-14** had already analysed and accepted the remaining collation residual. Recorded as **D-14** so the concern is visibly closed rather than silently dropped.

**Two things this debate could not verify and deliberately did not assert.** `vendor/` is absent from this worktree, so neither the `HasOneOrMany::updateOrCreate()` mass-assignment path (**R-2**) nor InnoDB's exact index-reuse behaviour (**D-3**) could be read from source; both are recorded as predictions requiring execution at Phase 3, per this project's [standing rule](../../docs/errors-log.md#a-reviewers-correction-replaced-an-accurate-technical-explanation-with-a-wrong-one-unverified--2026-08-24) that an unverified mechanism written up confidently is worse than an open question written up plainly.

**Not run by this phase**, per [workflow.md](../../docs/workflow.md): the INVEST check (Phase 2), TDD implementation (Phase 3), security audit (Phase 4), code review (Phase 5), or the docs pass (Phase 6).
