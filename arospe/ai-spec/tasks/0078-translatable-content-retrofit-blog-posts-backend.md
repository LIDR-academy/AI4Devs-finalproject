# [0078] Translatable content retrofit — Blog Posts backend

## Description
Applies story [0070](0070-translatable-content-mechanism-product-categories-backend.md)'s
per-store-language translatable-content mechanism to **Blog Posts**
([PRD Epic 5, Layer 2](../../docs/PRD/PRD.md#epic-5--internationalization), whose translatable-content
list names *"Blog post **title** and **body**"* and *"**Slug / SEO fields** … on products and posts"*).
Story [0061](0061-blog-posts-core-crud-backend.md)'s `title`, `body` and `slug` columns move to a
`blog_post_translations` child table, one row per `(post, store language)`, with slug uniqueness
re-scoped from global to **per store language**. `status`, `published_at`, `blog_category_id` and tag
attachments stay on the parent — the PRD puts *"status, dates"* explicitly outside the language tabs.

**This story consumes a recipe; it does not write one.** `App\Concerns\HasTranslations`,
`App\Actions\Translations\SetTranslation` and `StoreLanguage::defaultStoreLanguage()` are 0070's and are
used **unmodified**.

> **Read this before anything else — this is the hardest of the four retrofits, and for three reasons
> no sibling had.**
>
> 1. **It is the first with more than one translatable field** (three: `title`, `body`, `slug`), so
>    0070's **D-5** per-field-fallback debt — deferred to *"0076 or 0078, whichever ships first"* —
>    **lands here** (**D-10**). ⚠️ **Correction, 2026-08-30 — this originally said "verified: `0076` does
>    not exist in `ai-spec/tasks/`", which was stale by the time this file was saved.** `0076` was
>    created before this file's own final save (its file mtime predates 0078's), so the honest claim is
>    "0076 shipped first" — Phase 3 must confirm which story's fallback proof actually lands in the tree
>    and treat the other's as a regression check, per **D-10**'s own framing, not assume this file's word
>    for it. Found by sibling story 0079 re-verifying rather than trusting the citation.
> 2. **It is the first whose parent model soft-deletes.** `BlogPost` uses `SoftDeletes` (0061's
>    **D-7**); `product_categories`, `blog_categories` and `blog_tags` all hard-delete. That changes the
>    backfill (**D-6**), and it is what 0061's slug-reservation-on-delete guarantee rests on (**D-5**).
> 3. **Its globally-unique column is `slug`, which is *derived* yet needs **no** separate stored fold** —
>    a third shape, distinct from both the pilot's raw `name` and 0072/0074's `normalized_name`
>    (**D-2**). Do **not** add a `normalized_slug`; 0061's **D-10** already names that a review finding.

> **No dependency exists in code. Verified against the live tree at authoring time:** `app/Models/`
> holds only `User`, `Role`, `SalesRegion`, `Media`; `app/Actions/` holds only `Auth/`, `Fortify/`,
> `Media/`, `Roles/`, `SalesRegions/`, `Users/`; `app/Concerns/` holds six validation traits and no
> `HasTranslations`; there is no `blog_*`, `store_languages` or `*_translations` migration; `lang/en/`
> holds `media.php`, `navigation.php`, `roles.php`, `sales-regions.php`, `users.php` and **no**
> `blog.php`. There is **no `vendor/` directory**, so nothing here was settled by executing PHP.
>
> **Stories 0061, 0068 and 0070 are all Phase 1 files, not shipped code.** Everything below is designed
> against their *specified* shape. **Phase 3 must re-verify every signature named here against `HEAD`
> before writing a line of code** — the
> [deferred-findings failure mode](../../docs/errors-log.md#a-deferred-storys-findings-were-claims-about-a-tree-that-no-longer-existed-and-one-of-them-would-have-reopened-a-bug-in-this-log--2026-08-23),
> which applies **three times over** here (**R-12**).

## Type
backend | includes database-expert: **yes** (one new table, two migrations including a data backfill,
one retrofit of an existing table)

## 1. Refined user story

> **As** a blog editor publishing in more than one language,
> **I want** each post's title, body and slug stored and resolved per store language, falling back to
> the store default when a translation is missing,
> **so that** the blog reads correctly in every language the store authors in, and a partially
> translated post degrades gracefully instead of rendering blank.

> **As** the engineer who owns the shared translation mechanism,
> **I want** the first entity with *several* translatable fields — one of them derived from another,
> one of them nullable, and all of them belonging to a **soft-deleting** parent — to prove the
> mechanism rather than special-case it,
> **so that** the per-field fallback the pilot could only assert synthetically is finally pinned
> against a real multi-field entity, and story 0076 inherits a proven shape.

**Scope fence — this story ships no screen.** No Livewire component, no Blade view, no route, no
language tabs, no `config/modules.php` entry. The post editor's language tabs belong to story 0063 and
whichever Epic 5 UI story pairs with this one (0070's **Q3**, still open).

## Gherkin — 2. Detailed acceptance criteria (Given/When/Then)

Every scenario opens with a named business-role actor and carries exactly one `When`, per
[gherkin-guidelines.md](../../docs/testing/frontend/gherkin-guidelines.md) rules 1 and 3. The actor term
**"blog editor"** is 0061's, taken from the PRD's own Epic 4 scenarios.

```gherkin
Feature: Per-store-language blog post content

  # --- Resolution and per-field fallback ---

  Scenario: A blog editor reads a post translated into the requested language
    Given a blog editor, with a post titled "Botas de invierno" in Spanish and "Bottes d'hiver" in French
    When the post's French title is requested
    Then "Bottes d'hiver" is returned

  Scenario: A missing translation falls back to the default store language
    Given a blog editor, with a post titled "Botas de invierno" in the default store language
      and no French translation
    When the post's French title is requested
    Then "Botas de invierno" is returned, because the store default supplies the fallback

  Scenario: A post translated in neither the requested nor the default language resolves to nothing
    Given a blog editor, with a post holding no translation in any store language
    When the post's French title is requested
    Then no title is returned and no error is raised

  Scenario: A field absent in the requested language falls back independently of its siblings
    Given a blog editor, with a post whose French title is present and whose French body is empty
    When the post's French body is requested
    Then the default store language's body is returned
    And the French title is still the one returned for the title

  Scenario: A post translated into a removed store language is still readable
    Given a blog editor, with a post translated into French and French since removed as a store language
    When the post's French title is requested
    Then "Bottes d'hiver" is returned, because removal preserves stored content

  # --- Writing a translation ---

  Scenario: A blog editor translates a post into an additional language
    Given a blog editor holding the blog edit permission, and French active as a store language
    When they set the post's French title to "Bottes d'hiver"
    Then the French translation is stored alongside the existing Spanish one

  Scenario: Re-translating a post replaces its existing translation for that language
    Given a blog editor, with a post already titled "Bottes d'hiver" in French
    When they set the post's French title to "Bottes de neige"
    Then the French translation reads "Bottes de neige" and no second French row is created

  Scenario: Creating a post stores its content in the default store language
    Given a blog editor holding the blog create permission
    When they create a post titled "Botas de invierno"
    Then the post holds exactly one translation, in the default store language

  # --- The slug, now derived per language ---

  Scenario: Translating a post derives that language's slug from that language's title
    Given a blog editor, with a post titled "Botas de invierno" in the default store language
    When they set the post's French title to "Bottes d'hiver"
    Then the post's French slug reads "bottes-d-hiver"

  Scenario: Retitling a post in one language leaves another language's slug untouched
    Given a blog editor, with a post titled in both Spanish and French
    When they retitle the post in French only
    Then the French slug is re-derived and the Spanish slug is unchanged

  Scenario: A blog editor cannot supply a slug directly
    Given a blog editor holding the blog edit permission
    When they submit a post translation carrying a slug of their own
    Then the stored slug is the one derived from the title, not the one submitted

  # --- Slug uniqueness, now scoped per store language ---

  Scenario: Two posts cannot share a slug within one store language
    Given a blog editor, with a post whose French slug is "bottes-d-hiver"
    When they set another post's French title to one that slugifies to "bottes-d-hiver"
    Then the change is refused with a validation message

  Scenario: The same slug in two different store languages is permitted
    Given a blog editor, with a post whose French slug is "botas-de-invierno"
    When they set another post's Spanish title to one that slugifies to "botas-de-invierno"
    Then the change is accepted, because uniqueness is scoped to one store language

  Scenario: A post keeps its own slug when re-saved in the same language
    Given a blog editor, with a post whose French slug is "bottes-d-hiver"
    When they save that same post's French title unchanged
    Then the change is accepted rather than refused as a duplicate

  Scenario: Two posts may still share a title within one store language
    Given a blog editor, with a post titled "Resumen semanal" in the default store language
    When they title another post "Resumen semanal" in the same language
    Then the change is accepted, because only the slug is unique

  # --- Soft delete: the reservation, now per language ---

  Scenario: A deleted post keeps its slug reserved in each language it was translated into
    Given a blog editor, with a deleted post whose French slug is "bottes-d-hiver"
    When they create a new post whose French title would take the slug "bottes-d-hiver"
    Then the new post is given a different French slug

  Scenario: A deleted post's slug is still free in a language it was never translated into
    Given a blog editor, with a deleted post translated only into the default store language
    When they create a new post taking that same slug in French
    Then the change is accepted, because the reservation is scoped to one store language

  Scenario: A restored post reclaims every language's content
    Given a blog editor, with a deleted post translated into Spanish and French
    When they restore that post
    Then the post carries its Spanish and French titles, bodies and slugs unchanged

  Scenario: Deleting a post permanently removes no translation
    Given a blog editor, with a post translated into three store languages
    When they delete that post
    Then all three of its translations are retained for a later restore

  # --- The category guard 0061 built, still counting what the foreign key counts ---

  Scenario: A deleted post still blocks its category's deletion
    Given a blog editor, with the blog category "Guías" assigned to 1 post that has been deleted
    When they try to delete "Guías"
    Then deletion is blocked with a message stating that 1 post uses it

  # --- Publication state is not translatable ---

  Scenario: Publishing a post announces it once regardless of how many languages it carries
    Given a blog editor, with a draft post translated into three store languages
    When they change that post's status to published
    Then a single published-post notification is raised for that post

  # --- Authorization ---

  Scenario: An administrator without the blog edit permission cannot translate a post
    Given a signed-in administrator who does not hold the blog edit permission
    When they attempt to set a post's French title
    Then the attempt is refused

  Scenario: A blog editor needs no store-language permission to author a translation
    Given a blog editor holding the blog edit permission and no store language permissions
    When they set a post's French title
    Then the translation is stored, because authoring content is not managing the language catalog

  # --- The removal warning this story extends ---

  Scenario: Removing a language in use reports the blog post content it affects
    Given a store administrator, with French active and holding blog post translations
    When the usage count for French is requested
    Then the count includes the French blog post translations
```

## Files to create/modify

### Create

- **`database/migrations/<timestamp>_create_blog_post_translations_table.php`** — the child table plus
  its backfill in one `up()`, following 0070's recipe step 1:

  ```php
  public function up(): void
  {
      Schema::create('blog_post_translations', function (Blueprint $table): void {
          $table->uuid('id')->primary();
          $table->foreignUuid('blog_post_id')->constrained('blog_posts')->cascadeOnDelete();
          $table->foreignUuid('store_language_id')->constrained('store_languages')->restrictOnDelete();
          $table->string('title', 255);            // must equal blog_posts.title's real width — R-4
          $table->mediumText('body')->nullable();  // type AND nullability carried over — 0061 D-4/D-4b
          $table->string('slug', 255);             // NOT NULL; derived, never supplied — D-4
          $table->timestamps();

          $table->unique(['blog_post_id', 'store_language_id']);   // the natural key
          $table->unique(['store_language_id', 'slug']);           // per-language uniqueness — D-2
      });

      app(BackfillBlogPostTranslations::class)();
  }

  public function down(): void
  {
      Schema::dropIfExists('blog_post_translations');
  }
  ```

  **No explicit `index()` on either FK column** — `constrained()` supplies what InnoDB requires, and
  both FKs are the leftmost column of one of the two composite `UNIQUE`s. **Expect three indexes**
  (**D-3**), and verify with `php artisan db:table blog_post_translations` rather than by reading the
  migration. Both `constrained()` calls pass the table name explicitly; for `blog_post_id` that is habit
  rather than necessity and for `store_language_id` it is defensive readability only — 0070's **R-8**
  transfers unchanged and neither is load-bearing.

- **`database/migrations/<timestamp>_drop_translatable_columns_from_blog_posts_table.php`** — a
  **second, separate** migration ordered strictly after the first (0070's **D-4**):

  ```php
  public function up(): void
  {
      Schema::table('blog_posts', function (Blueprint $table): void {
          $table->dropUnique(['slug']);                     // explicitly, before the column
          $table->dropColumn(['title', 'slug', 'body']);
      });
  }

  public function down(): void
  {
      // KNOWINGLY NOT AN INVERSE — see D-7. The values now live per-language on the child
      // table, and a post may hold zero, one or several translations, so there is no single
      // value to restore into a scalar column. All three come back NULLABLE and the UNIQUE
      // on `slug` is deliberately NOT re-added: over a column every row shows as NULL it
      // would protect nothing (NULLs are exempt from uniqueness on MySQL — the same property
      // users.pending_email relies on) while misrepresenting the state as "restored".
      Schema::table('blog_posts', function (Blueprint $table): void {
          $table->string('title', 255)->nullable()->after('blog_category_id');
          $table->string('slug', 255)->nullable()->after('title');
          $table->mediumText('body')->nullable()->after('slug');
      });
  }
  ```

- **`app/Models/BlogPostTranslation.php`** — `use HasFactory, HasUuids;`,
  **`#[Fillable(['title', 'body'])]`**. `slug` is omitted because it is **derived** (the same guard
  `normalized_name` gets on both sibling translation models, and that `Media` demonstrates most
  sharply); `blog_post_id` and `store_language_id` are omitted because only `SetTranslation`'s explicit
  key list may write them. **No `SoftDeletes`** — see **D-5**, where that absence is load-bearing rather
  than incidental. `belongsTo` both parents. It carries the relocated derivation hook (**D-4**):

  ```php
  protected static function booted(): void
  {
      static::saving(function (self $translation): void {
          if ($translation->isDirty('title')) {
              $translation->slug = Str::slug($translation->title);
          }
      });
  }
  ```

  **`booted()`, not `boot()`** — this class extends `Model` directly with no vendor hooks to order
  against, so 0061's own reasoning (the `App\Models\Role` `boot()` precedent is a vendor-ordering
  workaround) transfers verbatim. **`Str::slug()`, never `NormalizeForSearch`** — 0061's **D-10** ⚠️
  that they are different transforms for different jobs binds this model unchanged.

- **`app/Actions/Blog/BackfillBlogPostTranslations.php`** — the extracted, container-resolved backfill
  (0070's **D-11**), query builder only, never Eloquent, fail-loud per
  [seeder-safety.md](../../docs/security/seeder-safety.md#a-catalog-seeder-must-fail-loudly-rather-than-commit-a-structurally-invalid-catalog).
  **It must copy trashed posts too, and that is the story's sharpest implementation hazard — see D-6.**
  It copies `title`, `body` (including `NULL`) and `slug` byte-for-byte and **recomputes nothing**.

- **`database/factories/BlogPostTranslationFactory.php`** — with a `forLanguage(StoreLanguage $language)`
  state, so no test hand-builds the FK pair. It **does not set `slug`** — the hook derives it, which is
  itself a small proof the hook fires on the insert path.

### Modify

- **`app/Models/BlogPost.php`** (0061's) — `use HasTranslations;` plus the one thing the trait cannot
  infer:

  ```php
  protected function translationModel(): string
  {
      return BlogPostTranslation::class;
  }
  ```

  **`#[Fillable(['title', 'body', 'blog_category_id', 'status'])]` becomes
  `#[Fillable(['blog_category_id', 'status'])]` — *not* `#[Fillable([])]`, and this is the first
  retrofit where that is true** (**D-9**). The `saving` hook, the `title` / `slug` / `body` `@property`
  entries and the `Str::slug` import **leave this class entirely** (**D-4**). `SoftDeletes`, `casts()`,
  `category()`, `tags()`, `scopeForCategory()` and `scopeForTag()` are all **untouched**.

- **`app/Concerns/BlogPostValidationRules.php`** (0061's) — `titleRules()` gains a `string $storeLanguageId`
  parameter (unused today — see D-11's own admission below), and the trait gains its **first**
  `slugRules()` (**D-11**). ⚠️ Corrected 2026-08-30 — this previously also claimed `bodyRules($status)`
  gains the same parameter; that was an unjustified copy from `titleRules()`'s change, caught on review:
  **R-9**, the section specifically about `bodyRules()`'s new cross-table dependency, only ever needs the
  post's `status` (parent-resident, not language-dependent) and never establishes a need for
  `$storeLanguageId`. `bodyRules($status)`'s signature is **unchanged** from 0061.
  `blogCategoryIdRules()`, `statusRules()`, `publishedAtRules($status)` and `tagNamesRules()` are likewise
  **unchanged** — none of those fields is translatable. The self-exclusion is an explicit FK clause, not
  `->ignore()`, per 0074's **D-6**:

  ```php
  Rule::unique('blog_post_translations', 'slug')
      ->where(fn ($query) => $query
          ->where('store_language_id', $storeLanguageId)
          ->when($blogPostId !== null, fn ($q) => $q->where('blog_post_id', '!=', $blogPostId))),
  ```

- **`app/Actions/Blog/CreateBlogPost.php`** and **`UpdateBlogPost.php`** — **signatures unchanged**,
  meaning narrowed to *"the default store language's title, body and slug"* (**D-12**). Each additionally
  constructor-injects `SetTranslation`. **The body is still sanitized in the action, before the write,
  never inside `SetTranslation`** (**D-12**). 0061's **D-15** transaction already exists and simply
  widens to cover the translation write; the post-commit notification dispatch (**D-19**) stays outside
  it, and `UpdateBlogPost`'s `$blogPost->refresh()` stays its literal first statement (**D-19a**, ⚠️ corrected 2026-08-30 — this cited D-13 before, which is about the notification/refresh-guard being unaffected, not about establishing refresh-first ordering; that's 0061's own D-19a, confirmed by direct review).
- **`app/Actions/Blog/DeleteBlogPost.php`**, **`RestoreBlogPost.php`**, **`SyncBlogPostTags.php`** —
  **untouched** (**D-5**, **D-13**).
- **`app/Actions/Blog/DeleteBlogCategory.php`** — **untouched.** Its `withTrashed()` count (0061's
  **D-7d**) counts `blog_posts` rows, and no `blog_posts` row moved; see **D-5**.
- **`config/store-languages.php`** (0068's) — **the entire production diff is one appended array
  literal**, which is 0068's **D8** contract:

  ```php
  ['table' => 'blog_post_translations', 'column' => 'store_language_id'],
  ```

  No closures; survives `config:cache`. No edit to `RemoveStoreLanguage`, to
  `StoreLanguage::translationUsageCount()`, to 0070's drift guard, or to any component.
- **`lang/en/blog.php`** / **`lang/es/blog.php`** (0061 creates them) — **only if** the re-scoped rules
  need a new `attributes` leaf or refusal string, key-for-key identical across both locales. See
  **R-11** on the three-story ownership of these files.

### Deliberately not touched

- **`database/seeders/RolePermissionSeeder.php`** — no new permission, no new module slug. **Verified
  against the shipped file:** `MODULES` contains `'blog'` (line 25), so `blog.view/create/edit/delete`
  exist today; the catalog stays at **42** and `Administrator` at 41 of 42 (**D-14**).
- **`app/Policies/BlogPostPolicy.php`** — no new ability; its five abilities over four permission
  strings are unchanged. There is deliberately **no `TranslationPolicy`** (**D-14**).
- **`app/Concerns/HasTranslations.php`**, **`app/Actions/Translations/SetTranslation.php`**,
  **`App\Models\StoreLanguage`** — 0070's and 0068's, consumed **unmodified**.
- **`app/Actions/NormalizeForSearch.php`** — story 0022's, and this story **does not call it at all**,
  exactly as 0061's **D-10** requires. `Str::lower()` / `Str::ascii()` / any `NormalizeForSearch` import
  appearing in this story's diff is a review finding.
- **`blog_post_tag`**, **`App\Enums\BlogPostStatus`**, **0061's `(deleted_at, status, published_at)`
  index** — all unaffected (**D-8**).
- **`routes/**`**, **`resources/views/**`**, **`app/Livewire/**`**, **`config/modules.php`** — no
  screen, no route, no sidebar entry.
- **Stories 0063, 0064 and 0065's own files** — this story must not edit another story's file; the
  amendments it forces are recorded as coordination actions (**R-1**).

## Applying 0070's recipe — what transferred, and the two steps that did not

| Step | Outcome here |
| --- | --- |
| 1. Create `<entity>_translations` with the FK pair, the natural-key unique, and optionally a unique on *"the field that was globally unique"* | **Applied, with the field identified as `slug`** — and, uniquely among the four siblings, needing **no** separate stored fold (**D-2**). |
| 2. Create `<Entity>Translation` with `HasFactory, HasUuids` and a translatable-fields-only `#[Fillable]` | Applied — **three** translatable columns, of which one (`slug`) is derived and therefore omitted from `#[Fillable]` (**D-4**). |
| 3. On the parent: `use HasTranslations;` + `translationModel()`; drop translated columns from `#[Fillable]` | Applied — **but the parent keeps a non-empty `#[Fillable]`**, the first retrofit where that is true (**D-9**). |
| 4. Re-scope the entity's `<Noun>ValidationRules` uniqueness by `store_language_id` | Applied to **`slug`**, on a trait that had no slug rule at all before (**D-11**). `titleRules()` gains a language parameter but still carries **no** uniqueness rule. |
| 5. Reuse `SetTranslation` **unmodified** | Applied. A sibling is a consumer, never a re-implementer — and here that is what forces sanitization to stay in the actions (**D-12**). |
| 6. Append **exactly one** `{table, column}` literal to `config/store-languages.php` | Applied. |

**What this story must NOT re-derive**, per 0070's own list: the write primitive, the default-language
memo, the authorization shape, and the drift-guard test — which picks `blog_post_translations` up **for
free**, because it matches the `*_translations` suffix the guard enumerates.

**What is genuinely new here and belongs to no other story:** the multi-field per-field-fallback proof
(**D-10**), the whole soft-delete interaction (**D-5**, **D-6**), the derived-column-that-is-its-own-fold
shape (**D-2**), and the cross-table coupling between a parent-resident `status` and a child-resident
`body` (**Q-1**).

## Tests to perform — 3. QA test cases / validation scenarios

Feature and Unit only. **No browser tests** — this story ships no screen.

> ⚠️ **`backend-qa` did not return for this debate** (see [Provenance](#provenance)). This block is the
> facilitator's, derived from 0070/0072/0074's test designs and 0061's own. **Phase 2 must treat it as
> the least independently corroborated section of this story**, and the disposition table below as an
> estimate rather than a survey.

> **Read this before writing any negative-validation test.** 0061's **D-13** makes every action
> authorize *before* it validates, so a direct call with no authenticated actor throws
> `AuthorizationException`, **not** `ValidationException`. Every validation test below must
> `actingAs()` an actor holding the relevant `blog.*` permission first, or it passes for entirely the
> wrong reason. Inherited unchanged from 0061 and 0072's identical blockquote.

### Which of 0061's test files change

| File | Disposition |
| --- | --- |
| `tests/Feature/Policies/BlogPostPolicyTest.php` | **Unchanged.** No ability, permission or policy changes. A failure here is itself a finding. |
| `tests/Feature/Blog/BlogPostAuthorizationTest.php` | **Mostly unchanged**; "no write" sharpens to "no row in **either** table". |
| `tests/Unit/Concerns/BlogPostValidationRulesTest.php` | **Rewritten** — new language parameter on two methods, a new `slugRules()`, new table. |
| `tests/Feature/Models/BlogPostTest.php` | **Shrinks substantially.** Every `title` / `slug` / hook / mass-assignment case moves to a new `BlogPostTranslationTest.php`. The `SoftDeletes`, UUID-v7, relation and scope cases survive. |
| `tests/Feature/Blog/CreateBlogPostTest.php` | **Rewritten** — asserts against the child table, scoped to the default language. |
| `tests/Feature/Blog/UpdateBlogPostTest.php` | **Rewritten**, same reason. |
| `tests/Feature/Blog/DeleteBlogPostTest.php` | **Extended** — plus the translations-survive-a-soft-delete assertion. |
| `tests/Feature/Blog/RestoreBlogPostTest.php` | **Extended** — the round-trip now spans every language, and the slug-reclaim case becomes per-language. |
| `tests/Feature/Blog/BlogPostStatusAndPublicationDateTest.php` | **Largely unchanged** — nothing it asserts is translatable. Only body-related fixtures move. |
| `tests/Feature/Blog/BlogPostPublishedNotificationTest.php` | **Unchanged** (**D-13**) — this file never asserts payload content by design ("never assert on 0065's notification class, channel or payload"); the title-snapshot problem R-1c describes belongs to **0065's own** test, not this one. ⚠️ Corrected 2026-08-30 — the original wording here read as if this file needed a change. |
| `tests/Feature/Blog/BlogPostTagAssignmentTest.php` | **Largely unchanged** — tags are not translatable. |
| `tests/Feature/Blog/DeleteBlogCategoryTest.php` | **Unchanged** — the guard counts `blog_posts` rows, and none moved (**D-5**). |
| `tests/Feature/Blog/DeleteBlogTagTest.php` | **Unchanged** — added 2026-08-30, missing from the original table. A tag's `blog_post_tag` pivot detach touches no translatable column and no post-identity concept this retrofit changes, parallel to `DeleteBlogCategoryTest.php`'s row. |
| `tests/Feature/Models/BlogPostTranslationTest.php` | **New.** |

**This rewrite is real scope, not a byproduct of the code changes.** Budget for it explicitly (**R-7**).

### The multi-field per-field fallback — the block 0070 owes to this story
- [ ] **Per-field, not per-row**, with a three-assertion fixture: a post whose French row carries a
      title and a **null** body resolves the **French** title, the **default's** body, and the **French**
      slug. *Why this is the whole block:* under a per-**row** implementation the French row would be
      discarded wholesale the moment any field were missing, so the post would lose its French title
      **and** its French slug to get a Spanish body. That regression is structurally invisible to every
      single-field entity, which is why 0070's **D-5** could only approximate it synthetically and
      deferred the real proof to whichever sibling shipped first with several fields (**D-10**).
- [ ] The inverse control: a French row with **all three** fields populated resolves all three from
      French, so a resolver that always falls back cannot pass.
- [ ] A post with **no** translation in either the requested or the default language resolves `null` on
      all three fields and **throws nothing** (0070's **D-6**).
- [ ] A translation in a store language that has since been made **inactive** is still readable — the one
      fallback-adjacent property worth re-pinning per entity, because 0068's **D5** depends on it and a
      defensive `is_active` filter added at any layer would defeat it.

### The slug — derived, per language
- [ ] The hook derives `slug` **on insert** and **re-derives it on a retitle** — two assertions, not one.
      A hook firing only on insert leaves a retitled post's slug pointing at the old title, silently,
      while the row reads correctly in any UI (0061's **R-3**, one table over).
- [ ] **Retitling in one language does not touch another language's slug** — the assertion that proves
      the hook is per-row rather than per-post, and the one a naive port from 0061 (where the hook sat on
      the post) fails.
- [ ] Saving a translation **without touching `title`** does not rewrite `slug` — pins the
      `isDirty('title')` guard survived the move.
- [ ] A forged `BlogPostTranslation::create([... 'slug' => 'hijacked'])` stores the **derived** value.
- [ ] **Composition with `SetTranslation`'s `updateOrCreate()`**: call it twice for the same
      `(BlogPost, StoreLanguage)` pair with two different titles and assert (a) exactly **one** row
      exists, (b) its `title` is the second value, (c) its `slug` matches the **second** title's slug.
      *Risk if missing:* `updateOrCreate()` resolves to `firstOrNew()` → `fill()` → `save()`, so on the
      second call the hook fires only if `fill()` marks `title` dirty. **`updateOrCreate()`'s event
      behaviour could not be verified here (no `vendor/`) and must be confirmed at Phase 3** (**R-2**).

### Uniqueness, re-scoped per language
- [ ] Two posts, same slug, **same** language → refused **by validation**.
- [ ] Two posts, **byte-identical** slug, **different** languages → **accepted**. *Why this exact
      fixture:* it is the only test that proves the scope moved from global to per-language, and it must
      use the byte-identical string — a fixture differing in case would pass under a rule that ignores
      language scoping entirely, because the incidental difference would be doing the work.
- [ ] Re-saving a post's own title in the same language is **accepted** — the self-exclusion trap
      (**D-11**, **R-5**). Written as **three** assertions so a rule that rejects everything cannot pass
      trivially: (a) the no-op save succeeds; (b) the translation row is genuinely unchanged, `slug`
      included; (c) a genuinely free slug in the same language is still accepted, as the control.
- [ ] **Two posts may still share a `title` in one language** — the negative control proving the
      retrofit did not accidentally introduce a title uniqueness rule 0061's **D-10** deliberately
      never had.
- [ ] A **foreign-key** violation (a forged `store_language_id`) is **not** misattributed as a duplicate
      validation error — the table now carries two `UNIQUE`s and two FKs (**R-6**).
- [ ] Blank and whitespace-only titles refused on **every** language path, not only the default.

### Soft delete × translations — the block with no sibling precedent
- [ ] **Translation rows survive a soft delete.** Delete a post translated into three languages and
      assert **three** `blog_post_translations` rows remain, by direct query — never via
      `$post->translations`. *Can fail silently:* if the two FK clauses were accidentally swapped
      (entity FK restrictive, language FK cascading) the delete throws instead; if a `deleting` hook were
      ever added to clean translations up, the rows vanish with no error and the loss surfaces only when
      someone restores that post (**D-5**).
- [ ] **A trashed post's slug is still refused to a new post in the same language** — 0061's **D-7b**
      reservation, now per-language. Pair with the positive control below.
- [ ] **A trashed post's slug is free in a language it was never translated into** — the control that
      proves the reservation is scoped rather than global, and the one assertion distinguishing the
      per-language reservation from 0061's original.
- [ ] **The restore round-trip preserves every language's title, body and slug** — delete, restore, then
      assert per row and per language. *Why:* this is the assertion that makes 0061's **D-7**
      "recoverable" mean something once content lives in a second table.
- [ ] **`RestoreBlogPost` still needs no slug guard**, proven from the other side: while the post is
      trashed, attempt to claim its slug in the same language and confirm the refusal — so the slot the
      restore returns to was never free (0061's **D-20**).
- [ ] 0061's **D-7d** category-delete block still names the right count with a trashed, translated post
      — **regression run only**, since neither the count nor its table changed.

### The backfill
- [ ] **It includes trashed posts** — arrange a soft-deleted `BlogPost`, invoke the backfill directly,
      and assert it received a translation row. **This is the single highest-value test in the story**
      (**D-6**): the drop-columns migration destroys the source of truth immediately afterwards, so a
      backfill written `->whereNull('deleted_at')` silently and permanently empties every already-trashed
      post, and `translated()` never throws, so nothing detects it until someone restores one.
- [ ] N arranged posts each get **exactly one** translation row, in the default store language, with
      `title`, `body` and `slug` **byte-identical** to the originals — asserted **per row, never as a
      count** (the [count-assertion failure mode](../../docs/errors-log.md#a-count-based-assertion-over-rendered-html-counted-a-wrapper-element-it-never-meant-to-include--2026-08-21)).
- [ ] A **null** body survives as null, and a title at the length boundary survives unchanged.
- [ ] The backfill with **no default store language** throws and writes nothing.
- [ ] **One reassuring assertion, not a suite:** N pre-existing, already-globally-unique posts backfill
      without violating the new composite `UNIQUE`. **D-6** proves this cannot fail by construction; the
      test documents the proof rather than hunting a collision that structurally cannot occur.
- [ ] The migration itself is **not** separately tested — `RefreshDatabase` proves it runs, and the
      extraction is what makes the part that could be wrong testable. ⚠️ But see **R-3**: 0070's **D-11**
      rejects the obvious way to arrange a pre-backfill state and names no replacement, and that gap now
      bites a **third** story.

### Sanitization, now per language
- [ ] The body is stored **sanitized** on the default-language path, and an `<img src="https://…">` from
      the shared gallery **survives** intact — 0061's **D-14** regression, re-run because its call site
      moved.
- [ ] **The same pair on a non-default language path.** *Risk if missing:* `SetTranslation` sanitizes
      nothing (**D-12**), so a per-language write path that bypasses the actions writes raw HTML into a
      column 0063 will render unescaped. This is the one genuinely new XSS surface the retrofit opens
      (**R-8**).

### Query shape
- [ ] Rendering N posts through `withTranslationsFor()` issues a **bounded** number of queries
      regardless of N — proven able to move by removing the eager load.
- [ ] `translated()` reads the already-loaded relation and issues **no** additional query. `$model->translations()`
      (the relation method, always re-queries) and `$model->translations` (the property, respects eager
      loading) differ by one character and survive a copy from a sibling undetected (**R-10**).

### The registry
- [ ] `StoreLanguage::translationUsageCount()` includes this table's rows once the entry is registered.
- [ ] **Regression run only** of 0070's drift guard, now against a **fourth** registered entry. **This
      story writes no drift guard of its own** (0070's **D-14**).
- [ ] `php artisan config:cache` succeeds with the appended entry — an assertion, not a review promise.

### Authorization
- [ ] An actor without `blog.edit` cannot write a translation; an actor with it can. Re-verified because
      the actions' **bodies** changed even though their signatures and abilities did not.
- [ ] An actor holding `blog.edit` and **zero** `store-languages.*` permissions can author a translation.
- [ ] `CreateBlogPost` still requires `blog.create`, not `blog.edit`, even though it now writes a
      translation — the exact bug that would follow from making `SetTranslation` self-authorize (0070's
      **D-9**).

### Deliberately NOT tested here
- [ ] **`HasTranslations`' generic contract**, the default-language memo and the default-promotion
      re-pointing — 0070's, proven once. This story proves `BlogPost` **wires into** it, plus the
      multi-field property 0070 explicitly deferred here.
- [ ] **`SetTranslation`'s generic replace-not-duplicate behaviour** — 0070's; tested here only where the
      derived slug introduces new risk.
- [ ] **`StoreLanguage`'s own CRUD and invariants** — 0068's.
- [ ] **`Str::slug()`'s own transliteration table** — framework, per
      [what-not-to-test.md](../../docs/testing/qa/what-not-to-test.md).
- [ ] **`NormalizeForSearch`** — story 0022's, and this story does not call it at all.
- [ ] **Anything rendered** — no Livewire test, no Blade assertion, no language tabs.

## Expected outcome

`blog_posts` no longer carries `title`, `slug` or `body`; every post's authored content lives in
`blog_post_translations`, one row per store language, with existing rows — **including trashed ones** —
backfilled into the store default. `BlogPost::translated('title')` returns the requested language's
title, the store default's when that is absent, and `null` when neither exists, **resolved
independently per field**, never throwing. Each language derives its own slug from its own title, and
slug uniqueness is enforced per store language rather than globally. A soft-deleted post keeps every
language's content and keeps each language's slug reserved, so `RestoreBlogPost` still returns the post
whole. Publication state, dates, category and tags are untouched and remain single-valued.
`StoreLanguage::translationUsageCount()` now counts blog post translations, and 0070's drift guard
covers a fourth registered entry with no change to the guard.

## Acceptance criteria

- [ ] `blog_post_translations` exists with a UUIDv7 primary key, two non-nullable UUID FKs, `title`,
      a nullable `mediumText` `body`, a `NOT NULL` `slug`, and timestamps.
- [ ] `php artisan db:table blog_post_translations` reports the index list, **verified rather than
      assumed**; the expectation is **three** (`primary` + the two composite `UNIQUE`s), and any fourth
      index is investigated rather than accepted (**D-3**).
- [ ] Per-language uniqueness is enforced on **`slug`** via `UNIQUE(store_language_id, slug)`; there is
      **no** unique on `title` and **no `normalized_slug` column anywhere** (**D-2**).
- [ ] `blog_posts.title`, `blog_posts.slug`, `blog_posts.body` and the `slug` unique index are gone,
      dropped in a **separate** migration ordered after the child table is created and populated;
      `down()` restores all three **nullable** and re-adds **no** unique index.
- [ ] **Every pre-existing post — trashed included — holds exactly one translation row** in the store
      default language, with all three values preserved byte-for-byte; the backfill aborts loudly when no
      default store language exists (**D-6**).
- [ ] The slug derivation hook lives on `BlogPostTranslation`, is guarded on `isDirty('title')`, fires on
      both insert and update, and is **removed** from `BlogPost`.
- [ ] `App\Models\BlogPost` declares `translationModel()`, keeps `SoftDeletes`, and narrows to
      **`#[Fillable(['blog_category_id', 'status'])]`** — non-empty, unlike all three sibling retrofits.
- [ ] `translated()` resolves requested → default → `null` **per field**, proven with a fixture in which
      one field is present in the requested language and another is not (**D-10**).
- [ ] A soft-deleted post retains every translation row, keeps each language's slug reserved **in that
      language only**, and restores with all three fields intact in every language (**D-5**).
- [ ] The slug uniqueness rule's self-exclusion is an explicit `blog_post_id` clause, not `->ignore()`,
      and saving a post under its own unchanged title in the same language is accepted (**D-11**).
- [ ] Two posts may still share a `title` within one store language (**D-11**).
- [ ] The body is sanitized before persistence on **every** language path, through story 0024's existing
      allow-list, with **no second allow-list added** (**D-12**, **R-8**).
- [ ] `status`, `published_at`, `blog_category_id`, the tag pivot, 0061's `(deleted_at, status,
      published_at)` index and the published-post notification's trigger logic are all **unchanged**
      (**D-8**, **D-13**).
- [ ] Authoring a translation requires `blog.*` and **no** `store-languages.*` permission; the catalog is
      unchanged at **42**, `RolePermissionSeeder` is untouched, and no policy or ability is added.
- [ ] `config/store-languages.php` gains **exactly one** appended array literal, contains no closures,
      and survives `config:cache`; `RemoveStoreLanguage`, `StoreLanguage::translationUsageCount()`,
      0070's drift guard and every component are untouched.
- [ ] `HasTranslations`, `SetTranslation` and `StoreLanguage` are **consumed, not modified** — no
      fallback logic and no write primitive exists at any call site in this story's diff.
- [ ] `App\Actions\NormalizeForSearch` is **neither called nor modified** (0061's **D-10**).

## Definition of Done
- [ ] Tests written and green (**full suite unscoped**, not `--filter`) — mandatory rather than
      advisory: this story **relocates a model event**, whose blast radius is the whole suite by
      construction.
- [ ] `vendor/bin/pint --format agent` run **unscoped**, not `--dirty`
- [ ] **Larastan level 7 run and recorded** — named explicitly because
      [errors-log.md](../../docs/errors-log.md#a-verification-record-that-lists-two-of-three-quality-gates-is-a-record-of-two-gates--2026-08-26)
      records three consecutive stories whose verification notes listed two of three gates and were read
      as records of all three. **A record naming two gates is a record of two gates.**
- [ ] Index reality verified with `php artisan db:table blog_post_translations` after migrating — not by
      reading the migration.
- [ ] Code reviewed (code-reviewer)
- [ ] No security findings (appsec-auditor). **Point the audit at R-8 specifically**: that every
      per-language body write path sanitizes, and that `SetTranslation` was not taught to.
- [ ] Documentation updated (docs-keeper) — at minimum `docs/database/schema.md` (a fourth per-language
      content table, and the **first** whose parent soft-deletes), `docs/database/migrations.md` (the
      recipe's third retrofit pair, and the first that drops **three** columns including a `NOT NULL
      UNIQUE` derived one), and `docs/conventions/naming.md`. **Verify whether 0070's/0072's/0074's own
      docs passes already made these claims** rather than restating them.
- [ ] **Recorded as a handoff, not done here:** the sibling-story amendments in **R-1**. This story edits
      no other story's file.
- [ ] Acceptance criteria met

## 4. Documented functional decisions

**D-1 — All three of `title`, `body` and `slug` move; nothing else does.** PRD assumption 14 and Epic 5's
own translatable-content list both name *"post title/body"* and *"slug/SEO fields … on posts"*, and its
acceptance criteria repeat it. The same PRD puts *"price, stock, SKU, **status, dates**"* explicitly
outside the language tabs, which settles `status`, `published_at` and `blog_category_id` by name.
**Tags are not translatable here** — a post's tag *attachments* are a relationship that does not vary by
language, which is the answer 0074's own **Q-2** recommends; the tag *names* are 0074's, already
retrofitted. **Meta title/description are out of scope** — 0061 ships no such columns and creating them
would be a new feature rather than a translation of an existing one; escalated as **Q-2** rather than
assumed.

**D-2 — The per-language `UNIQUE` binds `slug`, and this entity is a *third* shape the recipe had not
yet met. (`database-expert`'s finding.)** 0070's recipe step 1 says *"optionally
`unique(['store_language_id', <the field that was globally unique>])`"*, and the only question is which
field that is. For `product_categories` it is the raw `name`; for `blog_categories`/`blog_tags` it is the
derived `normalized_name`, which is why 0072's **D-1** had to correct the pilot's literal snippet. For
`blog_posts` neither precedent describes it:

- **`title` carries no uniqueness rule at all** (0061's **D-10**: two posts may legitimately share a
  title — a series, a "Part 2"), so it is never the candidate.
- **`slug` is the only column that carried a `unique()`** (0061's **D-3**), so it is unambiguously *the
  field that was globally unique*.
- **`slug` needs no shadow fold column**, for the reason 0061's **D-10** already gives: `Str::slug()` is
  *itself* a lowercasing, accent-stripping, ASCII-hyphenating transform, so *"a `normalized_slug` would
  be indexing a fold of a fold."*

So the three shapes are now **raw column** (0070), **derived column needing a separate stored fold**
(0072/0074), and **derived column that *is* its own fold** (this story). ⚠️ **Do not add a
`normalized_slug`** — it would reintroduce one story early the exact mistake 0061 pre-emptively named a
review finding. This also means, unlike both blog siblings, **this story adds no re-seed/recompute
obligation to `NormalizeForSearch`**, because it never touches it.

**D-3 — Three indexes, not four.** `blog_post_id` is leftmost in `unique(['blog_post_id',
'store_language_id'])` and `store_language_id` is leftmost in `unique(['store_language_id', 'slug'])`, so
both FK columns are covered as a leftmost prefix and InnoDB auto-creates no separate FK index for either.
This is now the **fourth** independent derivation of the same result (0070's own 2026-08-29 correction,
0072's **D-10**, 0074's **D-3**, and `database-expert` here), all agreeing. **No third `UNIQUE`:**
`unique(['blog_post_id', 'slug'])` would add write cost for no correctness gain, since the write path
already yields one slug per `(post, language)`. ⚠️ **Predicted from documented InnoDB behaviour, not
executed** — no `vendor/`, nothing migrated. Verify at Phase 3 with `db:table`, and investigate rather
than accept any fourth index.

**D-4 — The slug-deriving hook moves to `BlogPostTranslation` and becomes per-language.** 0061 derives
`slug` from `title` in a `saving` hook on `BlogPost`, guarded on `isDirty('title')`. Both columns move, so
the hook moves with them — mechanically the same relocation 0072's **D-3** and 0074's **D-4** performed
for `normalized_name`, and **the consequence is the same and is the point**: because `SetTranslation` is
`$translatable->translations()->updateOrCreate([...], $attributes)` and `updateOrCreate` calls `save()`,
the child model's own `saving` event fires and derives the slug **without `SetTranslation` knowing the
column exists**. Teaching the shared primitive about one entity's derived column would make every future
sibling's write path depend on a per-entity concern. **The derivation stays within one row** — the French
title derives the French slug — which is what makes the per-language slug coherent rather than a second
value needing its own reconciliation. **The parent's hook is deleted, not left**: the columns it guards no
longer exist there, so leaving it is a silent no-op at best and a `QueryException` at worst.

**D-5 — 0061's slug-reservation-on-delete survives the retrofit intact, but its *mechanism* changes, and
that is worth stating loudly. This is the story's hardest interaction.** 0061's **D-7b** promises that a
trashed post keeps its slug reserved, and its **D-20** leans on that to let `RestoreBlogPost` restore
unconditionally — *"nothing could have claimed it"*. Both were designed around **one slug per post** on a
soft-deleting table. Working the four steps through precisely:

| # | Question | Answer |
| --- | --- | --- |
| a | Does `blog_post_id`'s `cascadeOnDelete()` fire on a soft delete? | **No.** `SoftDeletes::delete()` is an `UPDATE … SET deleted_at`, never a `DELETE`, so `ON DELETE CASCADE` never sees the event — the same property 0061's own **D-7c** already relies on for `blog_post_tag`. |
| b | Do translation rows survive a trashed post? | **Yes**, for exactly that reason. This is load-bearing for **D-7**'s "recoverable content" promise. |
| c | Does `UNIQUE(store_language_id, slug)` still bind them? | **Yes.** The index enforces uniqueness over every physically-present row in `blog_post_translations`, with no notion of an application-level soft-delete state on a *different* table. |
| d | Does `Rule::unique('blog_post_translations', 'slug')` see them? | **Yes**, and for a *stronger* reason than on `users`: the child table carries **no `deleted_at` at all**, so there is not even a `SoftDeletingScope` to fail to apply. |

**So the outcome is preserved and generalises: a trashed post reserves its slug *per language*,
independently.** But the reasoning has moved from *"a scope exists on this table and `Rule::unique()`
happens not to apply it"* to *"this table was never soft-deletable, and the cascade that ties it to the
parent structurally cannot fire through the ORM's normal delete path."* A reviewer who remembers only
0061's version of the argument will look for the wrong thing.

**Four ways to break it, named because each is a plausible reflex:**
1. **Adding `SoftDeletes` to `BlogPostTranslation`** — the "children of a soft-deletable parent should
   soft-delete too" instinct. It creates a `deleted_at` with no natural trigger, and invites (2).
2. **A `deleting` hook on `BlogPost` that removes or detaches translations.** The most direct break:
   the content is physically gone before `RestoreBlogPost` runs, permanently destroying the lossless
   restore **D-7** exists for.
3. **Any independent cleanup job** deleting translation rows on its own schedule.
4. A genuine `forceDelete()` firing the real cascade is **not** a break — 0061 ships no force-delete path
   and that is correct behaviour if one is ever added.

**Two consequences of the reservation becoming per-language, both intended.** A trashed post's slug is
now free in a language it was never translated into — correct, since a French URL and a Spanish URL are
different URLs. And ⚠️ **a per-language slug presupposes language-scoped URLs**; if a future public
storefront ever serves one flat `/blog/{slug}` namespace, per-language uniqueness is insufficient and
that story owns the reconciliation. There is no storefront this phase (PRD's Out of scope), and PRD making
the slug translatable at all only makes sense under language-scoped URLs — but the assumption is recorded
rather than buried.

**Finally: 0061's `DeleteBlogCategory` guard (its D-7d) is untouched.** It counts `blog_posts` rows with
`withTrashed()` in front of a `restrictOnDelete()` FK, and no `blog_posts` row moved — only three of its
columns did. The rule *"an in-use guard fronting a `restrict` FK counts exactly what the FK counts"*
still holds unchanged.

**D-6 — The backfill must include trashed posts, and getting this wrong is silent and permanent.
(`database-expert`'s sharpest finding, and it has no sibling precedent.)** 0070's **D-11** mandates a
query-builder backfill so a migration never depends on a model's changeable shape. Here that mandate is
*also* the only correct way to see every row: `DB::table('blog_posts')` applies no Eloquent global scope,
so it includes soft-deleted posts, whereas any Eloquent read would silently exclude them. **That is not a
convenience — it is mandatory**, and the reason is the ordering: the second migration drops
`blog_posts.title/slug/body` immediately afterwards, so the source of truth is *gone*. A backfill written
`->whereNull('deleted_at')` — a plausible-looking line — permanently empties every already-trashed post,
and because `translated()` never throws (0070's **D-6**) the loss is invisible in every screen, every
query and a fully green suite until someone restores that specific post and finds it blank.

**It copies `title`, `body` (including `NULL`) and `slug` byte-for-byte and recomputes nothing** — unlike
0072, which recomputes its fold, and unlike 0074, which copies one. There is nothing to recompute: `slug`
is already its own fold (**D-2**). **Provable safety, matching 0074's D-10 proof shape:** the pre-retrofit
`UNIQUE(slug)` guarantees every value is pairwise-distinct across all rows, trashed included; every
backfilled row lands in one constant `store_language_id` partition; a pairwise-distinct set in one
partition is trivially pairwise-distinct as `(store_language_id, slug)` tuples. The backfill therefore
**cannot** violate the new composite `UNIQUE`, by construction — which is why its test is one reassuring
assertion rather than a collision hunt.

**D-7 — `down()` follows the recipe's knowingly non-inverse precedent, with a *stronger* reason than
either blog sibling had.** All three columns come back **nullable** — `title` (today `NOT NULL`) and
`slug` (today `NOT NULL UNIQUE`) both lose their strictness; `body` was already nullable. The unique index
is **deliberately not re-added**, because over a column every row shows as `NULL` it would protect nothing
(NULLs are exempt from uniqueness on MySQL — the property `users.pending_email` relies on) while
misrepresenting the state as "restored". 0074's **D-11** records `database-expert` proposing a genuine
data-restoring `down()` there and being declined for consistency; **the argument for declining is stronger
here**, and `database-expert` said so unprompted: `slug` is *derived from* `title`, so even a
"restore the default partition" scheme would have to decide whose derivation applies once several
languages could each hold an independently-edited slug for one post. There is no principled single answer.
A rollback across this pair is data-lossy in the same way
[ADR 0001's `users` conversion set](../../docs/decisions/0001-uuid-primary-keys.md#consequences) is.

**D-8 — `blog_posts` becomes a thin parent, and the `SELECT *` discipline *relocates* rather than
disappearing. (`database-expert`.)** 0061's **D-4b**/**R-7** warn that a short `mediumText` stays inline
under InnoDB DYNAMIC and fattens the clustered index, which is why 0063's list must never `SELECT *`.
After the retrofit `blog_posts` holds only `id`, `blog_category_id`, `status`, `published_at`, timestamps
and `deleted_at` — no large inline text at all, so a parent-only query (0064's sweep, a status filter) is
strictly cheaper. **But the problem moves to `blog_post_translations`**, which now carries `title`, `slug`
*and* `body` together and which any list render must join just to show a title. So the discipline binds
the **eager-load side** from now on: a list query must scope its translation load to explicit columns
excluding `body` (`->with(['translations' => fn ($q) => $q->select('blog_post_id', 'store_language_id',
'title', 'slug')])`), never a bare `with('translations')`. That is a new obligation for story 0063
(**R-1a**). **0061's `(deleted_at, status, published_at)` composite index is unaffected** — it indexes
only parent-resident columns, none of which moved, and 0064's sweep still reads `blog_posts` alone with no
join.

**D-9 — The parent keeps a non-empty `#[Fillable]`, and this is the first retrofit where that is true.**
`ProductCategory`, `BlogCategory` and `BlogTag` all reach `#[Fillable([])]` because their only
mass-assignable column was the translated one. `BlogPost` keeps **`#[Fillable(['blog_category_id',
'status'])]`**: both are genuinely form-supplied and genuinely non-translatable. Stated explicitly because
a reviewer arriving from the three siblings will look for the zero-fillable shape and its absence is a
correct outcome rather than an omission. `slug` and `published_at` remain non-fillable for their original
0061 reasons — the first because it is derived (now on the child), the second because status governs it.
*(This corrects `database-expert`'s brief, which said the parent's `#[Fillable]` narrows to "none, today"
while naming the two surviving columns in the same sentence.)*

**D-10 — This story owes, and pays, 0070's deferred multi-field per-field-fallback proof.** 0070's **D-5**
argues that fallback must resolve **per field** rather than per row — a post correctly titled in French
but lacking a French body must keep its French **title** — and records that the property is
*"structurally invisible to every test `ProductCategory` alone can write"*, deferring the real proof to
*"0076 or 0078 — whichever ships first with more than one translatable field."* **Verified: `0076` does
not exist in `ai-spec/tasks/`**, so on current evidence this is that story. It has **three** translatable
fields, one of them (`body`) genuinely nullable, which is exactly the fixture 0070 could only approximate
synthetically. ⚠️ **Phase 3 must re-check whether 0076 landed first**; if it did, that story owns the
proof and this one runs it as a regression. What must not happen is both stories assuming the other paid
it.

**D-11 — The validation trait gains its first `slugRules()`, and the self-exclusion is an explicit FK
clause.** 0061's trait has **no** slug rule at all: the column was derived and the database `unique()` was
the only guard, since nothing user-submitted could collide without the hook. Post-retrofit a rule is
needed, because uniqueness is now conditional on a language and a bare `23000` cannot say which of two
`UNIQUE`s fired (**R-6**). Two things carried deliberately. **`titleRules()` gains a `$storeLanguageId`
parameter but still carries no uniqueness rule** — 0061's **D-10** is unchanged by translation, and a test
pins it, because "add uniqueness while you're re-scoping uniqueness" is a plausible drift. And the
self-exclusion is `->where('blog_post_id', '!=', $id)`, **not `->ignore()`**, adopting 0074's **D-6** and
its argument: `->ignore($blogPostId)` compiles to `WHERE id != $blogPostId` against the *translation*
row's own UUID — a disjoint key space that silently matches nothing, so every same-title re-save is
refused in every language, permanently, while the row looks correct throughout. Re-pointing it at the
translation row's id is no better, because **a retitle into a language the post is not yet translated into
is an *insert*** with no row id to pass — the undefined case sits exactly where the mechanism is most
used.

**D-12 — Signatures are unchanged; sanitization stays in the actions and must never enter
`SetTranslation`.** `CreateBlogPost::__invoke(string $title, string $body, string $blogCategoryId,
BlogPostStatus $status, ?string $publishedAt, array $tagNames)` and `UpdateBlogPost`'s equivalent keep
their shape, their meaning narrowing to *"the default store language's"* content — 0070's **D-12** applied
unchanged, and the same rejection stands: widening to `array $contentByLanguageId` changes a public
contract 0063 and every direct-call test bind to, for a capability nothing yet asks for (the PRD's tab UI
edits one language at a time). **The body must be sanitized before it is handed to `SetTranslation`**, per
0061's **D-14**, and the primitive must stay generic: `SetTranslation` deliberately neither authorizes
(0070's **D-9**) nor validates, and teaching it to sanitize would make every future sibling's write path
carry an HTML concern it has no use for. The ordering inside each action is therefore: `refresh()`
(update only, **D-19a**) → authorize → sanitize → validate → `DB::transaction(post row + translation +
tag sync)` → post-commit notification. ⚠️ **This leaves a real residual**: a per-language write path that
calls `SetTranslation` directly writes unsanitized HTML. See **R-8** and **Q-1**.

**D-13 — The published-post notification and its `refresh()` guard are unaffected, and that follows from
`status` not being translatable.** 0061's **D-19** fires on the *transition into* `Published`, read from
`getRawOriginal('status')` **before** the transaction and dispatched **after** the commit; **D-19a** makes
`$blogPost->refresh()` `UpdateBlogPost`'s literal first statement. `status` stays on the parent, so the
comparison reads the same column from the same table and none of that logic changes. Two notes worth
keeping. `refresh()` reloads the model **and its loaded relations**, so a `translations` relation loaded
before the call is re-read too — which is the correct direction and incidentally mitigates 0070's **R-5**
stale-relation hazard on this one path. And the transaction that **D-15** already established simply
widens to cover the translation write, so unlike 0074's **D-5** this story does not have to *add* one —
but the errors-log's
[transaction-wrapper rule](../../docs/errors-log.md#wrapping-existing-code-in-a-dbtransaction-moved-a-cache-flush-nobody-had-written--2026-08-21)
still binds: widening what sits inside a transaction is a change to every side effect inside it, and the
notification dispatch must stay **outside**.

**D-14 — Translated content adds no permission, no ability and no policy.** **Verified against the shipped
seeder rather than inherited:** `RolePermissionSeeder::MODULES` contains `'blog'` (line 25), so
`blog.view/create/edit/delete` exist today with zero seeder change and the catalog stays at **42**.
Authoring a translation is *using* an already-configured language, not managing the language catalog, so
it needs **no `store-languages.*` permission** — 0068's **D18** draws that boundary and 0070's **D-13**
applies it. There is deliberately **no `TranslationPolicy`**: it would restate `BlogPostPolicy::update`
under a new name, and [`SalesRegionPolicy`](../../app/Policies/SalesRegionPolicy.php)'s docblock records
that abilities nothing calls add untested surface. **No step-up** — re-typing a post's French title is
neither identity-sensitive nor hard to reverse. `BlogPostPolicy`'s five-abilities-over-four-permissions
mapping (0061's **D-20**) is untouched, `RestoreBlogPost` included. **One ordering constraint stays
load-bearing:** since `SetTranslation` authorizes nothing, each action's `Gate` call must sit **above** it
— there is no other checkpoint between the caller and the write once the primitive is in the path.

## 5. Dependencies, risks, open technical questions

### Dependencies

- **[Story 0061](0061-blog-posts-core-crud-backend.md)** — hard, and **not implemented**. This story
  retrofits its table, its model, its validation trait and two of its six actions. **Its OQ-2 is now
  closed** (✅ resolved 2026-08-30, option (b) — see **R-4**), which was this dependency's one remaining
  gate.
- **[Story 0070](0070-translatable-content-mechanism-product-categories-backend.md)** — hard, and not
  implemented. Supplies `HasTranslations`, `SetTranslation`, `StoreLanguage::defaultStoreLanguage()` and
  the drift guard, all consumed unmodified. **0070's Q1 is still open** (must every entity always hold a
  default-language translation?); this story assumes its recommended **(a) yes**, which is what makes a
  post never nameless. It is not re-asked here.
- **[Story 0068](0068-store-languages-catalog-backend.md)** — hard, and not implemented. Supplies
  `store_languages`, the `is_default` row the fallback resolves through, and the registry.
- **Story 0024** — soft, for the HTML sanitizer only, consumed exactly as 0061's **D-14** consumes it. Its
  ownership race with 0061 (0061's **OQ-4**) is inherited unresolved and is not this story's to settle.
- **Story 0022 — not a dependency.** Unlike both blog siblings, this story never calls
  `NormalizeForSearch` (**D-2**).
- **Stories 0063, 0064 and 0065 depend on this one** — see **R-1**.
- **No new Composer package.**

### Risks

- **R-1 — Dropping `blog_posts.title` breaks three already-written sibling stories, and this story cannot
  fix them.** Verified by grep against `ai-spec/tasks/`:
  - **(a) [0063](0063-blog-posts-list-editor-ui.md) is the worst-hit file in the whole Epic 5 plan.** Its
    **D-4** list query (line ~789) is
    `->select(['id', 'blog_category_id', 'title', 'status', 'published_at', 'created_at'])
    ->with(['category:id,name', 'tags:id,name'])` — a **partial column select naming `title`**, which is
    a sharper break than an `orderBy` because the column is named explicitly, **plus two more partial
    selects naming `name`** on tables that stories 0072 and 0074 respectively strip. So 0063 is broken by
    three Epic 5 stories at once and must be amended once, coherently. It also inherits **D-8**'s new
    eager-load obligation and, because it is the only paginated list in the domain, is where 0070's
    **R-4** N+1 hazard first meets pagination. ✅ One thing 0063 got *right* and needs no change: it
    deliberately orders by `created_at`, **not** `title` (its own note, line ~806), precisely because
    0061's **D-10** says posts carry no title uniqueness — so unlike 0062/0025 there is no `orderBy`
    break. Its line ~298 quote of `#[Fillable]` also goes stale (**D-9**).
  - **(b) [0064](0064-scheduled-post-auto-publish-backend.md)** asserts at line ~212 that *"only `status`
    and `updated_at` change"* by checking `title`, `slug` and `body` are untouched — those assertions must
    retarget the translation table. Its underlying reasoning gets **simpler**, not harder: its line ~709
    note that the slug is safe *"because 0061's hook is guarded on `isDirty('title')`"* is superseded by
    something stronger — after the retrofit the sweep writes only parent columns, which no longer include
    any translatable field, so the hook cannot fire at all.
  - **(c) [0065](0065-blog-post-published-notification-backend.md) forces a decision no sibling
    retrofit did.** Its **D-4** payload is `['blog_post_id' => …, 'title' => $this->post->title]` — a
    deliberately **frozen literal snapshot** of the title taken at publication (its own D-4 argues at
    length for a snapshot over a live join). `$this->post->title` stops existing, so the snapshot must
    now **choose a store language**. **Recommendation: the store default**, via `translated('title')` with
    no argument — the notification is admin-facing, the default is the canonical authoring language, and
    the fallback chain guarantees it resolves. Recorded as a coordination item because it is a *product*
    choice hiding inside a mechanical rename, and because 0065's whole snapshot argument depends on the
    value being resolvable at dispatch time.

  All three are **unimplemented Phase 1 files**, so the cost is an amendment rather than a code break —
  but the amendment is real and is **not this story's to write.**
- **R-2 — `updateOrCreate()`'s event behaviour is unverified.** **D-4** depends on the child model's
  `saving` hook firing on the *second* call, which requires `fill()` to mark `title` dirty. No `vendor/`,
  so it could not be read from source. **Phase 3 must verify by execution.** If broken, the fix belongs in
  **0070**, since it affects all four consumers — do not patch it locally. (0074's **R-2** raises the
  adjacent unverified question of whether `SetTranslation` can write `store_language_id` at all given it
  is omitted from `#[Fillable]`; that is 0070's contract and is inherited here unchanged.)
- **R-3 — 0070's D-11 rejects the obvious way to arrange a pre-backfill state and names no replacement,
  and this is now the *third* story to hit it.** After both migrations the source columns do not exist,
  but the backfill must be exercised against rows that have them. `RefreshDatabase` only ever gives the
  final schema. 0074's **R-3** proposed re-adding throwaway columns via `Schema::table()` in the Arrange
  step and flagged it as *a candidate, not a decision*. **It must be settled once, in 0070**, before three
  stories build it three different ways. Sharper here than in either sibling, because **D-6**'s
  trashed-post case makes the backfill's correctness genuinely load-bearing rather than reassuring.
- **R-4 — ✅ CLOSED 2026-08-30 — 0061's OQ-2 (slug collision handling) resolved to option (b), refuse with
  a validation error, exactly the shape this story already assumed.** No rework needed: this story's slug
  Gherkin, its `slugRules()`/uniqueness design, and its acceptance criteria were all written against
  option (b) from the start (see the file's own earlier note calling this out explicitly), so the
  contingency this risk originally flagged never materialises. What still must be **re-scoped**, per the
  original finding (`database-expert`): the collision probe is scoped **per `(store_language_id, slug)`**
  — a French collision must never block the identical slug in Spanish — and it must query
  `blog_post_translations`, not `blog_posts`. **This story must not blindly copy whatever implementation
  0061 lands; it must re-scope it.** The trashed-rows caveat (0061's own ⚠️ under OQ-2) still applies and
  is now satisfied structurally (**D-5**). Sibling story 0079 (Blog post editor language tabs) can now
  render the refusal on the **title** field for the language being edited, since there is no separate slug
  field to render it on.
- **R-5 — The self-exclusion trap fails silently and permanently, not loudly and once.** Wired with
  `->ignore()`, every same-title re-save is refused in every language forever while the row looks correct
  throughout. **D-11** closes it; the deliberate two-post test keeps it closed.
- **R-6 — 0061's blanket `23000` handling is newly unsafe.** Its `DeleteBlogCategory` catch is scoped to
  that action and is unaffected, but any `23000`→"slug taken" translation written for the new table would
  misreport an FK violation, since it now carries two `UNIQUE`s plus two FKs.
- **R-7 — Rewriting 0061's test suite is real scope in this story, not a byproduct.** Roughly six of its
  thirteen files change substantially and one new file appears. Budget for it explicitly; 0074's **R-7**
  records the same cost one entity over.
- **R-8 — A per-language body write path that bypasses the actions writes unsanitized HTML.** 0061's
  **D-14** guarantees safety by making the two actions the only writers, which is what will let 0063
  render the body unescaped. `SetTranslation` sanitizes nothing (**D-12**), so the moment a UI story adds
  a "save this language's body" path calling the primitive directly, the guarantee lapses — and the
  failure is invisible until rendered. **This is the one genuinely new security surface the retrofit
  opens**, it is why the sanitization test must run on a non-default language path, and it is the item to
  point the Phase 4 audit at.
- **R-9 — `bodyRules(BlogPostStatus $status)` now depends on a column living on a *different table*.
  (`database-expert`'s finding, and it has no sibling precedent.)** `status` stays on `blog_posts`;
  `body`'s legality depends on it. None of the three prior retrofits had a validation rule keyed on a
  sibling column, so there is no pattern to copy. Any single-language body-edit path must read the post's
  **currently persisted** status and apply `bodyRules($status)` *before* calling `SetTranslation`.
  Escalated as **Q-1**, because *which languages* the rule binds is a product call.
- **R-10 — N+1 in two shapes** (0070's **R-4**): rendering a list without `withTranslationsFor()`, and
  `$model->translations()` (the relation method, always re-queries) instead of `$model->translations`
  (the property). They differ by one character and survive a copy from a sibling undetected. Sharper here
  than in any sibling because 0063 is paginated and because `body` rides along on an unscoped eager load
  (**D-8**).
- **R-11 — `lang/*/blog.php` is claimed by four stories now** (0061 creates it; 0062, 0063 and possibly
  this one extend it). 0061's **R-13** already flags the three-way race; this story adds at most an
  `attributes` leaf and should add nothing if no new copy is needed. A key missing from `lang/es` renders
  as its own raw key with no error — the ❌ [naming.md](../../docs/conventions/naming.md) records as having
  already shipped once, on `roles.modules.media`.
- **R-12 — This story's design is provisional against three unshipped stories at once** — 0061's schema
  and actions, 0068's model, and 0070's public API are all Phase 1 text. 0074's **R-12** raises the
  distinction that matters: 0070 warns siblings not to *re-derive* the mechanism but does not warn them to
  *re-verify its shipped shape*. **Phase 3 must re-verify every signature named here against `HEAD`
  first.**
- **R-13 — This debate ran with one of three amigos.** `backend-expert` and `backend-qa` were both
  dispatched, both failed on an API connection error, and both were retried once and did not return (see
  [Provenance](#provenance)). Their briefs covered the model wiring, the action bodies and orderings, the
  validation trait, the authorization shape and the entire test design. **Those questions were answered —
  by `database-expert` in part and by the facilitator's own reading of 0061/0070/0072/0074 and
  verification against the tree — but not by the specialists whose primary brief they were.**

  ✅ **Closed, 2026-08-30 — a follow-up review dispatched `backend-expert` and `backend-qa` independently
  against the finished file, specifically to scrutinize the facilitator-only sections.** Both returned.
  `backend-expert` confirmed the model wiring, action ordering and authorization design as correct
  (finding the authorization design in particular required **no** change — a review premise describing a
  different, incorrect design did not survive its own verification against 0061's real text), and found
  two real defects, both fixed: a wrong decision citation (**D-19a**, not D-13, for the `refresh()`-first
  rule, corrected in two places) and an unjustified `$storeLanguageId` parameter on `bodyRules()` that had
  been copy-pasted from `titleRules()`'s change with no basis in R-9 (removed). `backend-qa` confirmed the
  multi-field fallback fixture and the soft-delete/slug-reservation test are both correctly designed for
  the risks they target, and found one completeness gap (`DeleteBlogTagTest.php` missing from the
  disposition table, added as an `Unchanged` row) plus one misleading cross-reference (the
  `BlogPostPublishedNotificationTest.php` row, corrected). **Since closed separately, 2026-08-30:** D-11's
  contingency on 0061's OQ-2 (see R-4) resolved to option (b), exactly what this file already assumed —
  no rework needed. It was, at the time of this review, a real, larger-than-stated blocker per
  `backend-expert`'s independent read — if OQ-2 resolves to its own recommended auto-suffix option rather
  than refuse-with-validation, `slugRules()` and this story's whole slug-uniqueness Gherkin block need a
  structural rewrite, not a reshape. Phase 2 should treat that dependency as a hard gate on Phase 3, not a
  risk to monitor in passing.
- **R-14 — Sequencing decides what this story *is*.** The PRD roadmap puts Epic 5 last, so the realistic
  case is that 0061 has shipped and this is a genuine retrofit against live data — which is what the two
  migrations are written for. **If the coordinator resequences so 0078 lands before 0061 is implemented**,
  the far cheaper path is to amend 0061 so `title`/`slug`/`body` are *never created* on `blog_posts`,
  deleting the second migration and the backfill entirely — and with them **D-6**'s trashed-post hazard,
  which is the sharpest thing in this story. This is 0070's **R-3** and 0074's **R-1** recurring; a Phase 2
  decision, cheaper to make than to reverse.
- **R-15 — 0069's backlog item 3 is still unaddressed after *three* translation tables.** Re-adding a
  removed store language silently restores all its translations with no UI signal; 0069 assigned
  "surface *this language was previously removed and still holds content*" to the first story creating a
  translation table. 0070, 0072 and 0074 all declined it. Recorded rather than solved, since the fix is a
  UI affordance and this story ships no screen.
- **R-16 — 0070's static default-language memo needs an explicit reset between tests** (its **R-6**), and
  this story's default-change fixtures are exactly the shape that trips it. Inherited, not new.

### Open questions for the product owner

Per [contracts.md](../../docs/contracts.md)'s Uncertainty Handling Rule, each carries a recommendation
rather than a silent assumption. **Neither blocks Phase 2 review; both must close before Phase 3.**

**Q-1 — Must a post carry a non-empty body in *every* active store language to be published, or only in
the store default? ✅ RESOLVED 2026-08-30 — option (a).** 0061's **D-4** (human-confirmed) says a `Draft` may be bodiless while `Published` and
`Scheduled` may not. Once `body` is per-language and `status` is not, that rule needs a scope, and
`database-expert` flagged the cross-table coupling as something it would not sign off without
(**R-9**).
- **(a) The default store language only — _(recommended)_.** A post is publishable once its
  default-language body exists; other languages fall back until translated. It is the only reading
  consistent with 0070's **D-6** graceful-degradation design and with 0070's **Q1(a)** (every entity
  always holds a default-language translation), it keeps publishing decoupled from translation progress,
  and it means adding a new store language can never retroactively unpublish anything.
- **(b) Every active store language.** Honest if the store must never serve a half-translated post — but
  it makes publishing impossible until every language is done, and **adding a French tab would
  immediately invalidate every published post in the catalog**, which is a severe and surprising
  side effect of a settings change.
- **(c) Only the language currently being edited.** Cheapest to implement and the weakest guarantee: a
  post could be published with no body in any language by editing a language that has one.
- The same question applies to `titleRules()`' `required`; **(a)** answers both consistently.

**Q-2 — Are the SEO meta fields (meta title, meta description) in scope for this story, or for another in
the 14-story plan? ✅ RESOLVED 2026-08-30 — option (a), out of scope here.** (Consistent with sibling
story 0076, which made its own independent SEO-field decision for Products — each entity's meta-field
scope is decided per story rather than forced to match; Products got them because 0076's own debate
recommended them, Blog Posts does not because 0061 ships no such columns and this story is a translation
retrofit, not a new-field story.) PRD assumption 14 and Epic 5's list both say *"slug/**SEO fields** (e.g. URL slug,
meta title/description)"*, but story 0061 ships **no** meta columns — only `slug`.
- **(a) Out of scope here — _(recommended)_.** This story is a *translation retrofit* of content that
  exists; creating two new columns is a new feature, and inventing scope the PRD names but no shipped
  story defines is exactly what 0058's **D-6** and 0061's **D-3** both argue against in the opposite
  direction. If meta fields are wanted, they belong in a story that adds them to `blog_posts` *and*
  `products` coherently — and adding them to `blog_post_translations` later is purely additive.
- **(b) In scope here**, adding `meta_title` / `meta_description` to the translation table directly. It
  satisfies the PRD's acceptance-criterion wording in one pass, at the cost of shipping columns no screen
  renders and no route reads — the speculative-scaffolding objection `backend-expert` raised against the
  slug itself in 0061's **D-3**.
- **This is a decomposition question about a confirmed 14-story plan this debate cannot see in full**,
  which is why it is escalated rather than decided.

## 6. Technical tasks for later backlog creation

Derived from this debate; **none are in scope for 0078.**

1. **Amend [0063](0063-blog-posts-list-editor-ui.md), [0064](0064-scheduled-post-auto-publish-backend.md)
   and [0065](0065-blog-post-published-notification-backend.md)** per **R-1**. 0063 needs one coherent
   amendment covering all three Epic 5 taxonomy/content retrofits at once, not three separate ones. The
   coordinator's, not this story's. **Include Q-1's resolution explicitly** (added 2026-08-30, QA review
   finding): 0063's future per-language body-edit path must scope `bodyRules($status)` so it does **not**
   require a body in every active language before publishing — only the default's, per Q-1(a) — or that
   screen silently reintroduces the retroactive-unpublish problem Q-1 was raised to avoid.
2. **Close 0061's OQ-2 before this story reaches Phase 3**, and re-scope its answer per language
   (**R-4**).
3. **Settle 0070's backfill-test arrange mechanism once, in 0070** (**R-3**) — now blocking a third
   story, and load-bearing here rather than reassuring.
4. **Verify `SetTranslation`'s `store_language_id` write path and `updateOrCreate()`'s event behaviour by
   execution, in 0070** (**R-2**). If either is broken the fix benefits four stories.
5. **Story 0076 (Products) should copy D-2's three-shapes framing and D-10's multi-field test block**
   rather than re-derive them — it is the other multi-field retrofit, and whichever of the two ships
   second must not re-pay 0070's D-5 debt.
6. **Reconcile the predicted index count once with `db:table`** across all four translation tables
   (**D-3**) — four stories now predict three, and one command settles it permanently.
7. **Surface "this language was previously removed and still holds content"** in 0069's picker — its
   backlog item 3, unaddressed after three translation tables (**R-15**).
8. **Re-dispatch `backend-expert` and `backend-qa` against this story at Phase 2** (**R-13**).
9. **`ModuleRouteAccessTest.php` still covers two routes while more exist** — inherited unclosed from
   0017/0018/0068/0070/0072/0074, and untouched here since this story adds no route.

## Provenance

**Phase 1 Three Amigos debate, 2026-08-29.** Facilitator: `product-owner`. **Three amigos were dispatched
as real subagent calls; one returned.**

- **`database-expert` — returned and contributed substantially.** The migration shape, the identification
  of `slug` as the globally-unique field and the **third-shape** framing that follows from it (**D-2**),
  the three-index prediction (**D-3**), the full four-step soft-delete analysis and its four named break
  vectors (**D-5**), the trashed-rows backfill hazard and its provable-safety argument (**D-6**), the
  `down()` reasoning including why declining a real restore is *stronger* here than in 0074 (**D-7**), the
  clustered-index relocation (**D-8**), and the cross-table `bodyRules`/`status` coupling (**R-9**) which
  became **Q-1**.
- **`backend-expert` — dispatched, failed, retried once, never returned.** Its first run terminated on an
  API connection error mid-response, emitting only a fragment with no analysis in it. It was resumed once
  via a tightened, deliberately compact brief and did not return before this file was written. **Its
  contribution is absent, not summarised, and nothing in this file is attributed to it.** Its brief
  covered model wiring, the action signatures and their internal ordering, the validation trait, the
  authorization shape, and the `bodyRules` scope question.
- **`backend-qa` — dispatched, failed, retried once, never returned.** Identical failure mode and
  identical handling. Its brief covered the whole test design, the disposition of 0061's existing suite,
  the multi-field block, the soft-delete block and the highest-value-test judgement.

**Consequently this debate ran with one of three specialists, which is worse than 0072's two of three, and
the flag is louder in proportion.** The sections those two would have owned were written by the
facilitator from 0061's, 0070's, 0072's and 0074's own texts plus direct verification against the tree.
**R-13** names them and backlog item 8 asks Phase 2 to re-dispatch both. A third retry was declined rather
than left pending indefinitely.

**Facts verified by the facilitator against the real tree rather than taken from a task file:**
`RolePermissionSeeder::MODULES` contains `'blog'` and `'store-languages'` at line 25, so **D-14** needs no
seeder change and the catalog stays at 42; `app/Models/` holds four classes, `app/Actions/` six folders,
`app/Concerns/` six validation traits, and there is no `vendor/`; there is no `blog_*`, `store_languages`
or `*_translations` migration; `lang/en/` holds five files and no `blog.php` (0061's **V-3** says four —
it predates `media.php` and is stale, though harmlessly so); `phpunit.xml` pins `DB_CONNECTION=mysql`, so
the *"SQLite in CI"* premise 0070's **R-7** corrects in 0023 is **not** repeated anywhere in this chain;
⚠️ **This bullet originally claimed `0076` does not exist in `ai-spec/tasks/`, which was already stale
at the time this file was saved** (0076's file predates this file's own final save — found by sibling
story 0079 re-verifying rather than trusting the citation, and corrected at the top of this file). Read
**D-10** with that correction in mind: "first multi-field retrofit" was never a claim this story could
actually verify from a snapshot in time, only from whichever of the two stories reaches Phase 3 first;
and the three downstream break sites in **R-1** were each
read at their cited lines — 0063's `select([... 'title' ...])` and its two `:id,name` partial selects,
0064's "only status and updated_at change" assertion, and 0065's `'title' => $this->post->title` snapshot.

**One correction to `database-expert`'s own brief is recorded rather than silently applied**, per this
project's rule that a second-hand claim is a flag that nobody checked: it stated the parent's
`#[Fillable]` narrows to *"none, today"* while naming `blog_category_id` and `status` as surviving columns
in the same sentence. Both **are** in 0061's `#[Fillable]` list and both survive, so the correct outcome is
`#[Fillable(['blog_category_id', 'status'])]` — making this the first retrofit whose parent does **not**
reach the zero-fillable shape, which is now stated as **D-9** rather than left as an inconsistency.

**Nothing outside this file was created or modified.** No application code, migration or test was written,
and the files of stories 0061, 0063, 0064, 0065, 0068, 0070, 0072 and 0074 are untouched.

**Not run by this phase**, per [workflow.md](../../docs/workflow.md): the INVEST check (Phase 2), TDD
implementation (Phase 3), security audit (Phase 4), code review (Phase 5), or the docs pass (Phase 6).
