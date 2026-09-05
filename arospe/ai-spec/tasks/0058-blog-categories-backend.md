# [0058] Blog categories — backend (table, model, create/rename/delete, name validation)

## Description
Introduce the blog category taxonomy as a first-class, standalone entity: a new `blog_categories`
table (UUID v7 primary key per [ADR 0001](../../docs/decisions/0001-uuid-primary-keys.md) and
[PRD](../../docs/PRD/PRD.md#assumptions--confirmed-decisions) assumption 19), its
`App\Models\BlogCategory` model, and the create / rename / delete domain logic with name
validation. This is the foundational Epic 4 story the blog post and tag stories build on — it is
**backend only** (no screen, no route) and deliberately **independent from the product category
taxonomy**: no shared table, no shared model, no shared namespace, no polymorphic taxonomy.

Covers [PRD](../../docs/PRD/PRD.md#epic-4--blog) Epic 4's `Feature: Blog categories (extends the
prototype)` scenarios *Create*, *Rename*, *Delete an unused blog category* and *independent from
product categories*, plus the CRUD half of the Blog acceptance criterion "Blog categories have full
CRUD and are distinct from product categories" and the UUID-PK acceptance criterion. It does **not**
cover the "deleting a blog category still in use is hard-blocked with a count" scenario — see
[Scope fences](#scope-fences-what-this-story-must-not-do).

This story is the blog mirror image of [0023 (product-categories-backend)](done/0023-product-categories-backend.md),
and is deliberately written to be read against it. Its decisions **D-1**…**D-12** are numbered to
correspond to 0023's, so a reviewer can diff the two taxonomies decision by decision; **D-13** and
**D-14** are the two places this story genuinely departs from its sibling, and both departures are
argued rather than inherited.

## Type
backend | includes database-expert: yes

## Gherkin
```gherkin
Feature: Blog categories

  Scenario: Create a blog category
    Given a blog editor
    When they create a blog category named "Guías"
    Then "Guías" is saved in the blog category catalog
    And it is available to be assigned to posts

  Scenario: Rename a blog category
    Given a blog editor, with a blog category "Guías"
    When they rename it to "Guías de compra"
    Then the category is shown as "Guías de compra" wherever it is used
    And no category named "Guías" remains in the catalog

  Scenario: Saving a blog category under its own current name is accepted
    Given a blog editor, with a blog category "Guías"
    When they save that same category with the name "Guías" unchanged
    Then the save is accepted
    And the category keeps the name "Guías"

  Scenario: Delete an unused blog category
    Given a blog editor, with a blog category "Guías" assigned to no posts
    When they delete "Guías"
    Then "Guías" is removed from the blog category catalog
    And it is no longer available to be assigned to posts

  Scenario Outline: A blog category with an unacceptable name is refused
    Given a blog editor
    When they create a blog category with <invalid_name>
    Then the creation is refused with a validation message
    And no category is added to the catalog

    Examples:
      | invalid_name                                  |
      | a blank name                                  |
      | a name made only of whitespace                |
      | a name longer than the accepted maximum       |

  Scenario: Creating a blog category with a name already in the catalog is refused
    Given a blog editor, with a blog category "Guías"
    When they create another blog category named "Guías"
    Then the creation is refused with a validation message
    And the catalog still holds exactly one category named "Guías"

  Scenario: Creating a blog category whose name differs only by accent is refused
    Given a blog editor, with a blog category "Guías"
    When they create another blog category named "Guias"
    Then the creation is refused with a validation message
    And the catalog still holds exactly one category named "Guías"

  Scenario: Renaming a blog category onto a name another category holds is refused
    Given a blog editor, with the blog categories "Guías" and "Novedades"
    When they rename "Novedades" to "Guías"
    Then the rename is refused with a validation message
    And "Novedades" keeps its name

  Scenario: Blog categories are independent from product categories
    Given a blog editor
    When they view the blog category catalog
    Then it contains only blog categories, held in their own catalog
    And it shares no storage or identity with the product category catalog

  Scenario: An administrator without the blog permission cannot manage the catalog
    Given a signed-in administrator who does not hold the blog management permission
    When authorization to manage the blog category catalog is evaluated for them
    Then the action is refused
```

> **Deliberately absent:** there is **no** scenario here for *"Deleting a blog category still in use
> is hard-blocked with a count"*, even though it sits in the same PRD Gherkin block and is named in
> Epic 4's acceptance criteria. At the point this story is implemented the `blog_posts` table does
> not exist, so no category can be "in use" and there is nothing to count. That scenario is owned by
> story **0061 (blog-posts-core-crud-backend)**, which introduces `blog_posts.blog_category_id` and
> retrofits the guard onto `DeleteBlogCategory`. This is the identical scoping
> [0023](done/0023-product-categories-backend.md) applied to product categories, whose guard [0024b](done/0024b-product-category-in-use-delete-guard.md) owns (split out of 0024 on 2026-09-01).
> See [Scope fences](#scope-fences-what-this-story-must-not-do) and **D-10**.

> **Glossary note (OQ-3).** [gherkin-guidelines.md](../../docs/testing/frontend/gherkin-guidelines.md#todo--blog--ecommerce-vocabulary-undefined)
> carries an explicit `TODO (product owner)` stating that blog vocabulary is undefined and must not
> be invented. The two terms above — **"post"** (not "article") and **"blog editor"** as the actor —
> are taken verbatim from the PRD's own Epic 4 scenarios rather than coined here, but they are still
> not recorded in the glossary table. Filling that row in is a docs follow-up, flagged in the
> Definition of Done.

## Files to create/modify

**Migration**
- `database/migrations/<timestamp>_create_blog_categories_table.php` — new. Greenfield UUID table
  per [migrations.md](../../docs/database/migrations.md#uuid-primary-keys):

  ```php
  public function up(): void
  {
      Schema::create('blog_categories', function (Blueprint $table): void {
          $table->uuid('id')->primary();
          $table->string('name', 255);

          // The uniqueness rule lives HERE, not on `name` -- see D-4.
          // Both this index and every app-level lookup compare the output of
          // the one shared App\Actions\NormalizeForSearch, so there is no
          // second definition of "the same category name" to drift from the
          // first. Project-wide convention, confirmed by 0032's D-N1.
          $table->string('normalized_name', 255)->unique();

          $table->timestamps();
      });
  }

  public function down(): void
  {
      Schema::dropIfExists('blog_categories');
  }
  ```

  **There is deliberately no `unique('name')`** (**D-4**), no `deleted_at` (**D-3**), no `slug` /
  `sort_order` / `description` / `code` (**D-6**), and no FK in either direction —
  `blog_posts.blog_category_id` belongs to 0061, on the `blog_posts` side. `down()` is the exact
  inverse; dropping the table drops the index with it, so no companion `dropUnique()` is needed
  (contrast [`add_pending_email_to_users_table`](../../docs/database/migrations.md#drop-a-unique-index-explicitly-before-its-column),
  where the column outlives the table).

  **Index list is exactly two**: `primary` on `id`, and `blog_categories_normalized_name_unique`.
  There is no FK on this table, so InnoDB's mandatory-FK-index rule does not apply and no explicit
  `index()` is written. Confirm with `php artisan db:table blog_categories` **after** migrating,
  never by reading the migration — per
  [migrations.md](../../docs/database/migrations.md#an-fk-column-does-not-also-get-an-explicit-index-here)'s
  rule that a migration cannot show you an index nobody wrote.

  **On the length, and why it differs from [0059](0059-blog-tags-backend.md)'s `100`** (**OQ-1**):
  `name` is 255 here, matching 0023's product-category decision and this repo's free-text precedent
  (`users.name`, and `users.email`, which already carries a `unique` index at 255 in this very
  schema — so the 1020-byte utf8mb4 key is a shape this project has accepted before). A blog
  *category* is the direct analogue of a product category, whereas a *tag* is a genuinely shorter
  label, which is the substantive reason the two Epic 4 taxonomies can legitimately differ. Note
  0059's own length is **its** OQ-1 and therefore also unsettled, so Phase 2 should settle both
  numbers together rather than in isolation — and must resolve the expansion hazard in **R-4** at
  the same time, which neither story's number currently accounts for.

**Model**
- `app/Models/BlogCategory.php` — new:

  ```php
  /**
   * @property string $id
   * @property string $name
   * @property string $normalized_name
   * @property Carbon|null $created_at
   * @property Carbon|null $updated_at
   */
  #[Fillable(['name'])]
  class BlogCategory extends Model
  {
      /** @use HasFactory<BlogCategoryFactory> */
      use HasFactory, HasUuids;
  }
  ```

  `@property string $id` (string, never `int`) per
  [base-standards.md](../../docs/conventions/base-standards.md#uuid-primary-keys). Explicitly **not**
  declared: `$keyType` / `$incrementing` (the `HasUniqueStringIds` concern already overrides both as
  methods — restating them is the anti-pattern that page names), `SoftDeletes` (**D-3**), `#[Hidden]`
  (nothing sensitive on this row), and **no `casts()` method at all** — nothing here needs a cast
  beyond Eloquent's default timestamp handling, so an empty `casts(): array { return []; }` stub is
  not written. No relationship method either: `posts()` references a class and table that do not
  exist until 0061, matching 0023's identical restraint on `products()`.

  `normalized_name` is **omitted from `#[Fillable]`** — the mass-assignment guard this repo already
  uses for `users.status` / `users.pending_email` / every seeder-owned `sales_regions` column — and
  is derived by a model event (**D-12**), mirroring [0059](0059-blog-tags-backend.md)'s shape
  exactly so the two Epic 4 taxonomies cannot drift:

  ```php
  // app/Models/BlogCategory.php
  protected static function booted(): void
  {
      static::saving(function (self $category): void {
          if ($category->isDirty('name')) {
              $category->normalized_name = app(NormalizeForSearch::class)($category->name);
          }
      });
  }
  ```

  Note **`booted()`, not `boot()`**. [`App\Models\Role`](../../app/Models/Role.php) uses `boot()` for
  a reason that **does not apply here** — it subclasses a vendor model and must register ahead of the
  package's own hooks (see
  [authorization.md](../../docs/architecture/authorization.md#the-super-admin-roles-invariants)).
  `BlogCategory` extends `Model` directly with nothing to order against, so `booted()` is correct and
  `boot()` would be cargo-culting a workaround for a problem this class does not have. `app()` inside
  a model event is the one shape available here — a model boot hook takes no injectable parameters,
  the same necessity that justifies `app()` in a zero-parameter `#[Computed]` method per
  [code-style.md](../../docs/conventions/code-style.md#inject-single-purpose-actions-per-method);
  it is not licence to reach for `app()` in the actions, which constructor-inject.

**Factory**
- `database/factories/BlogCategoryFactory.php` — new, via
  `php artisan make:factory BlogCategoryFactory --model=BlogCategory --no-interaction`.
  `definition()` returns `['name' => fake()->unique()->words(3, true)]` and **does not set
  `normalized_name`** — the model event derives it, which is itself a small proof the hook fires on
  the insert path. Faker's `unique()` is a **per-instance** guard, not a database one (**R-5**): it
  stops Faker repeating itself within a run, but happily returns a string a test also hard-coded. Any
  test needing a guaranteed-distinct — or guaranteed-**colliding** — name passes it explicitly.

**Validation trait**
- `app/Concerns/BlogCategoryValidationRules.php` — new, following
  [naming.md](../../docs/conventions/naming.md#traits-and-their-methods)'s `<Noun>ValidationRules` /
  `<noun>Rules()` convention, where the noun is the **field**, not the model (the rule
  `SalesRegionValidationRules`' `rateRules()`/`codeRules()` established):

  ```php
  trait BlogCategoryValidationRules
  {
      /** @return array<string, array<int, ValidationRule|array<mixed>|string>> */
      protected function blogCategoryRules(
          NormalizeForSearch $normalizeForSearch,
          ?string $blogCategoryId = null,
      ): array {
          return ['name' => $this->nameRules($normalizeForSearch, $blogCategoryId)];
      }

      /** @return array<int, ValidationRule|array<mixed>|string> */
      protected function nameRules(
          NormalizeForSearch $normalizeForSearch,
          ?string $blogCategoryId = null,
      ): array {
          return [
              'required',
              'string',
              'max:255',
              // Compared against the normalized_name COLUMN -- the same column
              // the UNIQUE index guards -- using the same shared fold that
              // wrote it. See D-4, D-12, R-2.
              Rule::unique('blog_categories', 'normalized_name')
                  ->ignore($blogCategoryId),
          ];
      }
  }
  ```

  Two things this shape carries deliberately:

  - **The uniqueness rule targets `normalized_name`, never `name`.** A bare
    `Rule::unique('blog_categories', 'name')` compiles to `WHERE name = ?` against the *raw*
    submitted string and would not catch `"guías"` against a stored `"Guías"` on a byte-comparing
    engine — it is the wrong column for the rule this story enforces (**D-4**). The value compared
    must be the candidate's **normalised** form, produced by the same
    [`App\Actions\NormalizeForSearch`](../../docs/conventions/base-standards.md#directory-structure)
    call the model event uses to write the column, so the pre-flight check and the constraint can
    never disagree (**D-12**). It is container-resolved and **threaded through as a parameter**
    rather than resolved with `app()`, per
    [code-style.md](../../docs/conventions/code-style.md#inject-single-purpose-actions-per-method).
    Phase 3 settles the exact rule expression (a `Rule::unique()` fed the normalised value, or a
    small custom rule); what is fixed here is the **column it compares** and the **fold it uses**,
    not the Laravel API used to express it — the identical latitude 0059 leaves.
  - **The `->ignore()` branch** is what makes "save a category under its own current name" succeed.
    It is also the branch that is only safe while the id it receives is server-authoritative — see
    the hand-off note in the Definition of Done.

**Actions** — new subfolder **`app/Actions/Blog/`** (an *area* folder holding categories, tags and
posts alike, not an entity folder — this diverges from Epic 2's `ProductCategories/`; see **D-14**):

- `CreateBlogCategory.php` — `__invoke(string $name): BlogCategory`. Authorizes `create` on
  `BlogCategory::class` as its **first statement** (**D-13**), then trims the name before validating
  and persisting, and catches `QueryException` code `23000` to rethrow as a `ValidationException` on
  `name`, exactly as [`App\Actions\Users\CreateUser`](../../app/Actions/Users/CreateUser.php) does
  for `email`:

  ```php
  } catch (QueryException $e) {
      if ($e->getCode() === '23000') {
          throw ValidationException::withMessages([
              'name' => trans('validation.unique', ['attribute' => 'name']),
          ]);
      }

      throw $e;
  }
  ```

  The unique index is the last-word race guard *behind* the validation rule, never a 500.

- `RenameBlogCategory.php` — `__invoke(BlogCategory $blogCategory, string $name): BlogCategory`.
  Authorizes `update` on the target first (**D-13**), same trim + `23000` handling, with the
  uniqueness rule ignoring the target's own id.

- `DeleteBlogCategory.php` — `__invoke(BlogCategory $blogCategory): bool`. Authorizes `delete` on the
  target first (**D-13**); today the body is then a plain instance `->delete()`. **It exists as its
  own file now specifically so story 0061 extends this one file** with the in-use hard-block guard,
  rather than introducing that rule somewhere new — the same reasoning 0023's **D-10** gives for
  `DeleteProductCategory`, which 0024b's **D-14** then honours by modifying exactly that file.

  All three constructor-inject `App\Actions\NormalizeForSearch` and
  `App\Actions\Auth\LogRefusedPrivilegedAttempt`, and pass the normaliser into
  `blogCategoryRules()` / `nameRules()` (**D-12**). Constructor injection rather than method
  injection is required here, not stylistic: each `__invoke()` signature is a **public contract**
  matched verbatim by every direct-call test and by the future Livewire caller, so widening it with
  an internal collaborator is the anti-pattern
  [code-style.md](../../docs/conventions/code-style.md#exception-an-actions-own-dependency-is-constructor-injected-when-the-method-signature-is-a-public-contract)
  documents. **`Str::lower()` or `Str::ascii()` appearing anywhere in `app/Actions/Blog/` or in
  `BlogCategoryValidationRules` is a review finding.**

**Policy**
- `app/Policies/BlogCategoryPolicy.php` — new, via
  `php artisan make:policy BlogCategoryPolicy --model=BlogCategory --no-interaction`. Auto-discovered
  by name for `App\Models\BlogCategory`; **no** `AuthServiceProvider` is added (this repo has none
  and does not need one). **Four** abilities, each naming its permission once as a class constant per
  [naming.md](../../docs/conventions/naming.md#permission-names)'s "name a permission once on the
  class that owns the rule" rule, following `SalesRegionPolicy`'s shape rather than `UserPolicy`'s
  repeated literals:

  ```php
  class BlogCategoryPolicy
  {
      public const VIEW_PERMISSION = 'blog.view';
      public const CREATE_PERMISSION = 'blog.create';
      public const EDIT_PERMISSION = 'blog.edit';
      public const DELETE_PERMISSION = 'blog.delete';

      public function viewAny(User $actor): bool
      {
          return $actor->hasPermissionTo(self::VIEW_PERMISSION);
      }

      public function create(User $actor): bool
      {
          return $actor->hasPermissionTo(self::CREATE_PERMISSION);
      }

      public function update(User $actor, BlogCategory $target): bool
      {
          return $actor->hasPermissionTo(self::EDIT_PERMISSION);
      }

      public function delete(User $actor, BlogCategory $target): bool
      {
          return $actor->hasPermissionTo(self::DELETE_PERMISSION);
      }
  }
  ```

  All four gate on the already-seeded `blog.*` permissions (**D-8** — verified: `'blog'` is in
  `RolePermissionSeeder::MODULES`, and `ACTIONS` is the four CRUD verbs, so all four strings exist
  today with **zero seeder change**). Note this is four abilities where `SalesRegionPolicy` has two:
  there, `create`/`delete` were seeded-but-permanently-unused because that catalog is fixed and
  seeded. Here all four are real, exercised call sites, so all four belong (**D-9**).

**Consumed, not created by this story**
- `app/Actions/NormalizeForSearch.php` (`App\Actions\NormalizeForSearch`) — the shared text
  normaliser, `__invoke(string $value): string`, implemented as `trim` → `Str::lower` → `Str::ascii`
  → collapse-whitespace. It is **created and unit-tested by story 0022**
  (`tests/Unit/Actions/NormalizeForSearchTest.php`) and consumed unchanged by 0026, 0032, 0033, 0034
  and 0059. This story must not redefine, wrap, fork or locally override it (**D-12**). It is absent
  from this worktree today, which is **expected and not a blocker** — per
  [0032's D-N1](0032-shipping-geography-catalog-seed.md) it is 0022's deliverable and is expected to
  exist by the time any consuming story reaches Phase 3. See the Dependencies section.
- `app/Actions/Auth/LogRefusedPrivilegedAttempt.php` — the shared refusal recorder (story 0015b),
  already constructor-injected into eight domain actions.

**Not touched by this story** (see [Scope fences](#scope-fences-what-this-story-must-not-do)):
`database/seeders/RolePermissionSeeder.php`, any file in `routes/`, `config/modules.php`,
`app/Livewire/**`, `resources/views/**`, `lang/**`.

## Tests to perform

Backend only — **no browser tests** in this story, since it ships no screen.

> **Read this before writing any negative-validation test (D-13's consequence, and the single most
> likely way this story's test suite fails for the wrong reason).** Because the actions authorize
> themselves *before* they validate, a direct call from a test with no authenticated actor throws
> `AuthorizationException`, **not** `ValidationException`. Every validation test below must
> therefore `actingAs()` an actor holding the relevant `blog.*` permission first, or it will pass
> for entirely the wrong reason — green, and blind to the rule it claims to pin. This is a real
> ordering consequence of **D-13** and it is called out here because 0023's test list, written
> against actions that did not self-authorize, does not need it.

**Unit — `tests/Unit/Concerns/BlogCategoryValidationRulesTest.php`** (new)
- [ ] `nameRules($normalizeForSearch, null)` and `nameRules($normalizeForSearch, $id)` return the
      expected rule arrays, and the second carries the `->ignore()` branch. This is the story's only
      genuinely unit-testable surface — everything else needs a real row for the uniqueness check.
      *Risk if missing:* nothing else exercises the trait in isolation; the Feature tests prove the
      end-to-end effect but not that the trait itself is well-formed.
- [ ] The **exhaustive folding table is not re-asserted here.** `App\Actions\NormalizeForSearch`'s
      own behaviour (`ß`, `ç`, CJK, double spaces, idempotence) is owned and unit-tested by story
      0022 (**D-12**); duplicating it creates a second specification of the fold that can drift from
      the first. What this story tests is that category name comparison *goes through* it — pinned
      end to end by the case-only and accent-only duplicate tests below.

**Feature — `tests/Feature/Models/BlogCategoryTest.php`** (new; mirrors `tests/Feature/Models/UserTest.php`)
- [ ] A factory-created category's `id` is a UUID **v7** string (`Str::isUuid($id, 7)`), not an
      integer. *Risk if missing:* `HasUuids` silently not wired (typo'd trait, overridden
      `newUniqueId()`) ships a non-time-ordered or auto-increment id with no error anywhere else.
- [ ] Two categories created in immediate succession sort lexicographically in creation order
      (`strcmp($first->id, $second->id) < 0`) — the same time-ordering assertion `UserTest` makes,
      and the one that catches a v4 generator substituted for v7.
- [ ] Creating and re-fetching a category persists `name` and populates both timestamps.
- [ ] `name` is mass-assignable and **`normalized_name` is not** — a forged
      `BlogCategory::create(['name' => 'Guías', 'normalized_name' => 'hijacked'])` stores the
      *derived* value, not the supplied one. *Risk if missing:* a caller can decouple the folded key
      from the name it is supposed to represent, defeating both the uniqueness rule and search in one
      write, while the row looks correct in any UI.
- [ ] **The `saving` hook derives `normalized_name` on insert and re-derives it on a rename** — two
      assertions, not one. *Risk if missing:* a hook that fires only on insert leaves a renamed
      category's folded key pointing at the old name, which is the single most damaging silent
      failure in this story (**R-3a**).
- [ ] Saving a category **without touching `name`** does not rewrite `normalized_name` — pins the
      `isDirty('name')` guard. *Risk if missing:* the guard can be dropped with no visible effect
      until the normaliser's behaviour changes, at which point unrelated saves start silently
      rewriting keys.
- [ ] A name whose fold differs from it (`"Guías"` → `"guias"`) stores **both** columns correctly.
      *Risk if missing:* a hook that stores the raw name in both columns passes every ASCII-only
      test and fails only on the accented input this product is full of.
- [ ] The model does **not** use `SoftDeletes` — a regression guard on **D-3**. *Risk if missing:*
      someone answers a future accidental-delete complaint by bolting the trait on, which silently
      changes what `Rule::unique()` and every future query see, and lets a trashed "Guías" squat its
      name forever.

**Feature — `tests/Feature/Blog/CreateBlogCategoryTest.php`** (new)
- [ ] Creating with a valid name persists exactly one row with that name and populates both
      timestamps.
- [ ] Creating with a blank name throws `ValidationException` on `name` and writes no row. Assert
      against the **action's own** validation (`expect(fn () => $action(''))->toThrow(...)`, then
      inspect `->errors()['name']`) — there is no Livewire component in this story to assert
      through. **Remember the `actingAs()` precondition above.**
- [ ] Creating with a **whitespace-only** name (`'   '`) is refused. This is one of the two
      highest-value cases in the story and it fails silently by default: Laravel's `required` treats
      a string of spaces as *present*, so with a bare `['required', 'string', 'max:255']` rule set a
      whitespace-only name validates and persists. The test proves the trim happens **before**
      validation, not after.
- [ ] A name with leading/trailing whitespace is stored trimmed — assert the **exact persisted
      value**, not merely "no error". Without a trim, `'Guías'` and `'  Guías  '` are two rows
      indistinguishable to a human editor that do not collide as duplicates.
- [ ] Length boundary **pair**: a name of exactly the maximum length is accepted, and one character
      over is refused (per [risk-based-testing.md](../../docs/testing/qa/risk-based-testing.md)'s
      maximum-boundary question). Derive the boundary from the same constant the migration uses
      (**R-4**).
- [ ] Creating a duplicate name is refused at the **validation** layer (`ValidationException`, not a
      `QueryException`).
- [ ] A duplicate that bypasses validation (the action called directly with a colliding name under a
      simulated race) surfaces as a `ValidationException` on `name`, not a 500 — the test that proves
      the `23000` catch. It must drive the collision through the **real unique index** rather than a
      mocked exception or a hand-written assertion about the catch block. `Rule::unique()` is a
      pre-flight check, not a race guard — the rule
      [signed-link-verification.md](../../docs/security/signed-link-verification.md#a-pre-flight-check-is-not-a-race-guard--re-check-under-a-lock-and-let-the-unique-index-have-the-last-word)
      already established for `pending_email`. Assert the *outcome*, so it holds whichever way the
      action implements it.
- [ ] **Case-only-different duplicate**: creating `"guías"` alongside `"Guías"` is refused **by
      validation** (`ValidationException`, not `QueryException`) — proving the app-level normalised
      comparison did the work, not the collation.
- [ ] **Accent-only-different duplicate**: creating `"Guias"` alongside `"Guías"` is likewise refused
      **by validation**. This pins **D-4**'s "fold at least as aggressively as `utf8mb4_unicode_ci`"
      constraint. Note the fixtures are the PRD's **own** worked example word rather than a borrowed
      `"Niño"/"Nino"` pair, which is a genuine improvement over 0023's list and not a cosmetic one:
      blog category names in this product are Spanish by design (the PRD's examples are literally
      `"Guías"` → `"Guías de compra"`), so an accent-folding bug is a live content risk here rather
      than a hypothetical one.

**Feature — `tests/Feature/Blog/RenameBlogCategoryTest.php`** (new)
- [ ] Renaming to a free name updates the row, **and updates `normalized_name` with it** — assert
      both columns, not just `name`.
- [ ] Renaming onto another category's name is refused and the target keeps its original name.
- [ ] Renaming a category to **its own current name** is accepted — the `Rule::unique()->ignore()`
      trap, and the single most likely bug in this story (it is precisely why
      `ProfileValidationRules::emailRules()` takes a nullable id). Write this as **three** tests, not
      one, so a rule that rejects everything cannot pass the first trivially: (a) the no-op rename to
      the identical name succeeds; (b) the category's row is genuinely unchanged afterwards; (c) a
      genuinely free name is still accepted, as the control. A single assertion here is the classic
      "passes for the wrong reason" trap [coverage-review-checklist.md](../../docs/testing/qa/coverage-review-checklist.md)
      describes, made worse by the fact that **two** mechanisms must agree (the `->ignore()` id and
      the normalised-name exclusion must exclude the *same* row).
- [ ] The full validation depth (blank / whitespace-only / length boundary pair) is re-asserted on
      the **rename** path independently, not assumed symmetric with create. A `nameRules($id)`
      signature that threads `$id` through on one of the two call sites but not the other is a real,
      silent bug class in exactly one direction (**R-7**), and testing the trait once does not prove
      both call sites use it correctly.

**Feature — `tests/Feature/Blog/DeleteBlogCategoryTest.php`** (new)
- [ ] Deleting a category removes the row outright (`assertDatabaseMissing`, not `assertSoftDeleted`)
      — a hard delete, per **D-3**.
- [ ] The freed name can immediately be reused by a new category — proves nothing lingers to hold the
      unique index, which is exactly what a soft delete would have broken.
- [ ] Deleting an unknown or malformed-UUID category fails cleanly (`ModelNotFoundException` / 404),
      not as a silent no-op — note `HasUuids`' `resolveRouteBindingQuery()` rejects a non-UUID
      parameter before querying.
- [ ] **No in-use / hard-block test in this file.** `blog_posts` does not exist, so this file must
      **not** simulate "assigned to N posts" via a stubbed relation or a raw insert. Doing so would
      test behaviour the action does not implement and give false confidence that 0061's guard is
      already covered. This is the one item a reviewer should actively push back on if it appears.

**Feature — `tests/Feature/Policies/BlogCategoryPolicyTest.php`** (new; mirrors `UserPolicyTest.php`)
- [ ] **All four** abilities (`viewAny` / `create` / `update` / `delete`) get **both an allow and a
      deny test**, per [what-not-to-test.md](../../docs/testing/qa/what-not-to-test.md)'s
      authorization rule: an actor holding the relevant `blog.*` permission is allowed; an actor
      holding none is refused.
- [ ] A `Super Admin` actor is allowed through `Gate::before`, consistent with every other policy in
      this repo.
- [ ] The permission names are asserted against `RolePermissionSeeder`'s seeded catalog (seed it and
      call `forgetCachedPermissions()` in `beforeEach`, as `tests/Feature/Users/CreateUserTest.php`
      does) — a permission string not in the catalog throws `PermissionDoesNotExist` at runtime, so
      this is a correctness test, not a style one.

**Feature — `tests/Feature/Blog/BlogCategoryAuthorizationTest.php`** (new; **D-13**'s own coverage)
- [ ] Each of the three actions, called directly by an actor **without** the relevant `blog.*`
      permission, throws `AuthorizationException` and performs **no write**. This is what makes the
      policy more than a file with no call site — it is the test that proves a non-dashboard caller
      (an Artisan command, a queued job, a future second component) inherits the rule.
- [ ] A refusal is **logged** via `LogRefusedPrivilegedAttempt` with `target_type: 'blog_category'`,
      asserted against the context array rather than a rendered string, per
      [authorization.md](../../docs/architecture/authorization.md#recording-a-refusal--what-every-gate-owes-the-audit-trail).

**Unit — `tests/Unit/ArchitectureTest.php`** (extend the existing file) — **see OQ-2 before writing
this one**; its shape is not settled.
- [ ] An `arch()` assertion that `App\Models\BlogCategory` does not reference the product-category
      taxonomy. Written as its **own single-namespace rule**, never folded into an
      `expect([...])` array — Pest's `expect(array $targets)` is **disjunctive**, so a combined rule
      passes as soon as any one target satisfies it, which is exactly how an architecture test in
      this repo already shipped vacuous once
      ([errors-log-archive.md](../../docs/errors-log-archive.md#a-pest-arch-rule-over-an-array-of-namespaces-shipped-green-while-proving-nothing--2026-08-18)).
      Honest caveat, and the reason **OQ-2** exists: `App\Models\ProductCategory` **does not exist in
      this tree**, so a literal `->not->toUse(ProductCategory::class)` is a fatal class-not-found
      error at collection time, not a red test.

**Explicitly not tested here**
- `HasUuids` itself, Eloquent timestamps, or `Rule::unique`'s own SQL — framework/vendor behaviour
  per [what-not-to-test.md](../../docs/testing/qa/what-not-to-test.md).
- Migration `up()`/`down()` mechanics — `RefreshDatabase` proves every migration runs on every
  feature-test run; `down()` symmetry is a code-review concern.
- The normaliser's folding table — story 0022's unit test owns it (**D-12**).
- Rendering in "the post editor's category selector" — no post editor exists in this story's scope.
- Anything about a category being "in use" by a post — story 0061.

## Expected outcome
A `blog_categories` table exists with a UUID v7 primary key and a unique `name`. A blog editor's
create / rename / delete operations are available as three invokable domain actions with shared,
trait-held name validation, each authorizing itself and logging refusals, and a
`BlogCategoryPolicy` expresses who may perform them. The blog category catalog is a wholly separate
table, model, action namespace and policy from the product category taxonomy. Nothing is
user-visible yet — the management screen that consumes these arrives in a later UI story, and the
posts that reference a category arrive in 0061.

## Acceptance criteria
- [ ] `blog_categories` exists with `id` (UUID v7 PK), `name`, `normalized_name` (**unique**),
      `created_at`, `updated_at` — and nothing else. There is **no** `unique('name')`.
- [ ] `App\Models\BlogCategory` uses `HasUuids`, exposes `name` as its only fillable attribute,
      derives `normalized_name` via a `saving` hook on every write that changes `name`, and does
      **not** use `SoftDeletes`.
- [ ] A category can be created with a valid name; blank, whitespace-only, over-length and duplicate
      names are all refused with a validation message on `name`.
- [ ] A category can be renamed; renaming onto another category's name is refused, and saving a
      category under its own unchanged name is accepted.
- [ ] A category can be deleted, the row is really gone, and its name becomes immediately reusable.
- [ ] Case-only and accent-only duplicates are refused **by validation**, and a concurrent duplicate
      that races past validation is refused by the **`normalized_name` unique index** as a clean
      `ValidationException` rather than a 500 (**D-4**).
- [ ] The fold behind both the stored column and every lookup is the shared
      `App\Actions\NormalizeForSearch` (**D-12**) — no fold logic is inlined in the model, in
      `BlogCategoryValidationRules` or in the actions, and no second normaliser is added to the tree.
- [ ] Authorization is expressed in `BlogCategoryPolicy` **and enforced by each action itself**
      (**D-13**), with both an allow and a deny test per ability, and a direct-call refusal test per
      action.
- [ ] Blog categories share no table, model, or namespace with the product category taxonomy.
- [ ] No in-use/hard-block delete guard is implemented, and no permission-catalog, route, Livewire,
      view, `config/modules.php` or `lang/` file is added by this story.

## Definition of Done
- [ ] Tests written and green, plus the full existing suite (per
      [contracts.md](../../docs/contracts.md)'s Full Test Suite Gate Rule).
- [ ] All **three** quality gates run **unscoped** and each result recorded explicitly, including any
      that was not run: `php artisan test` (not `--filter`), `vendor/bin/pint --format agent` (not
      `--dirty`), and **Larastan level 7** (`vendor/bin/phpstan analyse`). The third is the one
      nothing else prompts you to run, and a verification record naming only two of the three is a
      record of two gates — see
      [errors-log.md](../../docs/errors-log.md#a-verification-record-that-lists-two-of-three-quality-gates-is-a-record-of-two-gates--2026-08-26).
- [ ] Code reviewed (code-reviewer).
- [ ] No security findings (appsec-auditor).
- [ ] Documentation updated (docs-keeper): `docs/database/schema.md` gains a `blog_categories`
      section and an ER-diagram entry; `docs/conventions/base-standards.md`'s directory listing gains
      `app/Actions/Blog/`, `App\Models\BlogCategory`, `BlogCategoryPolicy` and
      `BlogCategoryValidationRules`; ADR 0001's "still future" list drops Blog Categories (verify its
      current wording first rather than assuming — the list names six remaining entities today).
- [ ] **Glossary follow-up (OQ-3):** `docs/testing/frontend/gherkin-guidelines.md`'s
      `TODO — blog / ecommerce vocabulary (undefined)` block gains at minimum **"post"** (not
      "article") and **"blog editor"** as canonical terms, so a later browser-testing story does not
      re-derive the same choice.
- [ ] **Hand-off note recorded for the UI story and for 0061** (a real gap, not a formality). Unlike
      0023, these actions **do** authorize themselves (**D-13**), so `BlogCategoryPolicy` has real
      call sites from day one. The UI story must still (a) call `Gate::authorize()` in the component
      as well — defence in depth, a layer and not a redundancy, per the SalesRegions precedent — and
      (b) keep the id fed to `Rule::unique()->ignore()` server-authoritative (`#[Locked]` / re-read
      from the model), per
      [security/livewire-authorization.md](../../docs/security/livewire-authorization.md). Story 0061
      must extend `DeleteBlogCategory` **in place** rather than adding the guard elsewhere.
- [ ] Acceptance criteria met.

## Documented functional decisions

Decisions **D-1**…**D-12** correspond one-for-one to [0023](done/0023-product-categories-backend.md)'s, so
the two taxonomies can be diffed decision by decision. **D-13** and **D-14** are this story's own.

- **D-1 — Domain artifacts only; no Livewire component, route or view.** Story 0004 (users backend)
  shipped a component alongside its actions because the component was the only planned consumer at
  the time. Here the UI is explicitly a separate later story, so building a screen now would either
  sit unrouted and untested end to end, or invent a route the product owner has not asked for.
  `App\Actions\Users\RequestEmailChange` / `ConfirmEmailChange` already establish that this repo
  ships domain actions whose HTTP/Livewire boundary arrives in a different unit of work. This also
  means **no `config/modules.php` entry** — a module gate's sidebar half belongs with the screen, not
  with the backend.
- **D-2 — Three narrow actions, `Rename` not `Update`.** `CreateBlogCategory`, `RenameBlogCategory`,
  `DeleteBlogCategory`. "Rename" is the PRD's own verb ("*When they rename it to 'Guías de
  compra'*") and the entity has exactly one mutable field today; a generic `UpdateBlogCategory` would
  generalize for fields that do not exist. This matches the repo's narrow-verb precedent
  (`RequestEmailChange`/`ConfirmEmailChange`, not `UpdateEmail`). `App\Actions\Users\UpdateUser` is
  deliberately *not* the model to copy — a `User` genuinely had four mutable fields from day one.
- **D-3 — Hard delete; `BlogCategory` does not use `SoftDeletes`.** `users` soft-deletes for reasons
  that do not generalize (identity retention, freeing an authentication identifier, relations that
  must survive). A lookup-table row has none of those. Three concrete costs of the other choice:
  (i) `Rule::unique()` does **not** apply the soft-delete scope (verified on `users` — see
  [schema.md](../../docs/database/schema.md#soft-deletes)), so a trashed "Guías" would squat its name
  forever unless every uniqueness check were made trashed-aware; (ii) `blog_posts` could reference a
  trashed parent in 0061, since a cascade never fires on a soft delete; (iii) 0061's guard is a
  *count-based gate that runs before the delete*, so it works identically against a hard delete —
  soft-delete buys it nothing. PRD assumption 17 rules out the audit/recycle-bin class of feature
  this phase, which is the only thing that would argue the other way.
- **D-4 — Uniqueness is enforced on a stored `normalized_name` column carrying the `UNIQUE` index —
  not on `name`, and not by a PHP-only comparison behind a raw-`name` index.** This is the story's
  central design decision, and it is **not a stylistic choice**: it is the project-wide convention
  confirmed by [0032](0032-shipping-geography-catalog-seed.md)'s **D-N1** ("CONFIRMED 2026-08-18",
  agreed with the product owner across the Epic 2 Phase 1 debates), which requires that every story
  searching or uniquing a name-like column call the single shared `App\Actions\NormalizeForSearch`
  **both at write time** (into a stored `normalized_name`) **and at read time**. Stories 0022, 0026,
  0032, 0033 and 0034 already consume it, and [0059](0059-blog-tags-backend.md) (blog tags,
  debated in parallel with this story) arrived at the identical shape independently. Four reasons, in
  descending order of weight:

  1. **It closes a real TOCTOU race that a PHP-only check leaves open.** A pre-flight comparison in
     PHP is **not** a race guard — this repo's own
     [signed-link-verification.md](../../docs/security/signed-link-verification.md#a-pre-flight-check-is-not-a-race-guard--re-check-under-a-lock-and-let-the-unique-index-have-the-last-word)
     says exactly that for `pending_email`. Two concurrent requests submitting "Guías" and "guías"
     both pass their pre-flight (neither exists byte-for-byte yet), both insert, and an index on the
     raw `name` does **not** catch it because the two strings are byte-distinct. With the index on
     `normalized_name`, both fold to `guias` and the database refuses the second.
  2. **The index and the application agree on "the same name" by construction.** Both compare the
     output of the identical `NormalizeForSearch` call, so there is no second definition to drift
     from the first. 0023's design has to *require* that its PHP fold be "at least as aggressive as
     `utf8mb4_unicode_ci`" precisely because its two layers use two different rules; that
     requirement does not arise here at all.
  3. **It removes the database collation from the correctness argument entirely.** Whether the
     connection is MySQL `utf8mb4_unicode_ci`, a `_bin` collation, a read replica or a future SQLite
     dev setup, the stored key is already folded, so the answer does not change. This is what D-N1
     means by correctness never depending on collation.
  4. **It is the indexed read path a category filter or picker needs.** `WHERE normalized_name
     LIKE 'term%'` against a real BTREE index is the shape
     [0032's `geography_entries`](0032-shipping-geography-catalog-seed.md) was designed around for
     the same reason; folding every row in PHP per query is not a viable read path.

  **`unique('name')` is dropped, not kept alongside.** It is not harmless redundancy: any two rows
  colliding on `name` also collide on `normalized_name` (identical strings normalise identically), so
  it protects nothing, while costing a second index write per insert and creating a *second*,
  collation-dependent notion of duplicate that can disagree with the first. One uniqueness rule, one
  index. Both actions still convert a `23000` `QueryException` into a `ValidationException` on
  `name` — the pattern [`CreateUser`](../../app/Actions/Users/CreateUser.php) uses for `email` — so
  the race in point 1 surfaces as a clean validation error rather than a 500.

  **Consequence to implement knowingly:** the fold covers **accents as well as case**, so "Guías"
  and "Guias" cannot coexist as two categories. That is a real product-visible outcome for a
  Spanish-language blog, and Phase 2 should confirm it deliberately rather than inherit it — but note
  it is now a property of the *project's* normaliser, so changing it is an amendment to 0022's D13
  affecting six stories, not a local decision here.

  **Discrepancy recorded, not acted on:** [0023](done/0023-product-categories-backend.md)
  (product-categories-backend) still specifies the older `unique('name')` + PHP-only-comparison
  shape. 0023 predates D-N1's confirmation and is the **outlier, not the standard**. It is an Epic 2
  story outside this Epic 4 batch's mandate, so it is deliberately left untouched here; this note
  exists so whoever reconciles Epic 2's backlog finds the divergence already identified rather than
  discovering it as a surprise.
- **D-5 — `VARCHAR(255)` with `max:255`, written as a bare `string('name')`.** Matches this repo's
  existing name-like columns: `users.name` is `string()`/`max:255`, and — decisively — `users.email`
  is a `VARCHAR(255)` column that **already carries a `unique` index** in this schema, so a
  1020-byte utf8mb4 unique key is a shape this project has accepted before and is comfortably inside
  InnoDB's 3072-byte limit under the DYNAMIC row format.
  [migrations.md](../../docs/database/migrations.md#adding-a-column-to-an-existing-table)'s
  bare-`string()` warning is recorded here as **considered and not applied**, for the same reason
  0023 gives: its worked example is a 10-character *enum token* (`users.status`) whose ceiling is
  knowable from the value set, not a free-text human label with no natural maximum. `sales_regions`
  shows both kinds in one table — `code` capped at 10, `name` capped at 150 — and this column is the
  free-text kind. The migration length and the validation `max:` must stay in lockstep (**R-4**).
- **D-6 — No `slug`, no `sort_order`, no `description`, no `code`, no FK.** None appears in PRD Epic
  4's blog-categories Gherkin block or its acceptance criteria. Note the contrast is *sharper* here
  than it was for product categories: assumption 14 names slug/SEO fields explicitly, and names them
  for **posts** — so the PRD distinguishes the two, and inferring a category slug from a post
  requirement would be inventing scope. Ordering is `ORDER BY name` at query time; a stored
  `sort_order` is a cheap additive migration if manual drag-ordering is ever requested. A `slug`
  becomes necessary only if a public blog-category archive route appears (out of scope per PRD
  assumption 1 — backoffice only) or if Epic 5 needs a language-stable key once `name` becomes
  translatable. See **OQ-4**.
- **D-7 — A plain `name` column now; Epic 5's translatable names are deferred, with the cost
  stated.** PRD assumption 14 explicitly lists "category/tag names" among translatable content, and
  Epic 4's own taxonomies are named in it. Epic 5 has its own Three Amigos pass and either shape it
  lands in (a `blog_category_translations` child table, or a JSON column) needs its own migration
  regardless of what is built today. The foreseeable follow-up, written down so it is not a surprise:
  creating the translations table, backfilling one row per category into the default store locale,
  and **dropping this story's `unique('normalized_name')` index** — because uniqueness would then be
  per-locale on the child table, not global on the parent. Note the Epic 5 migration is *larger*
  under **D-4**'s design than it would have been under a raw-`name` index: the `normalized_name`
  column and its derivation hook move to the translations table too, since each locale's name needs
  its own folded key. That is a known and accepted cost, not an oversight — the alternative trades a
  live TOCTOU race today for a cheaper migration later. Do not skip the index now in anticipation of
  dropping it later; build the correct table for today's requirement and let Epic 5 pay its own cost.
- **D-8 — Category CRUD gates on the already-seeded `blog.*` permissions; no new module slug.** Blog
  categories are a **blog sub-resource**, so they inherit the Blog module's permissions.
  `RolePermissionSeeder::MODULES` already contains `'blog'` and `ACTIONS` is the four CRUD verbs, so
  all four permissions exist today with zero seeder change, zero re-seed fallout, and zero impact on
  Epic 1's roles UI. PRD Epic 1 frames "Blog (with categories & tags)" as **one** permission-gated
  module, so categories, tags and posts share the `blog.*` tier rather than splitting into three.
  Nothing about category CRUD resembles the cross-cutting escalation risk that justified
  `roles.manage` / `roles.manage-administrators` sitting outside the module grid.
- **D-9 — `BlogCategoryPolicy` is its own one-model policy with four abilities, not a shared
  `BlogPolicy` and not a two-ability subset.** Two sub-decisions, both argued:
  **(a) One model, one policy.** [naming.md](../../docs/conventions/naming.md#classes) records that
  `<Model>Policy` is not a style preference but a **binding**: Laravel 13 auto-discovers
  `App\Policies\BlogCategoryPolicy` for `App\Models\BlogCategory` by that exact name. A single
  `BlogPolicy` spanning categories, tags and posts is auto-discoverable for *none* of them and would
  require an explicit `Gate::policy()` registration — i.e. reintroducing the `AuthServiceProvider`
  that [base-standards.md](../../docs/conventions/base-standards.md#directory-structure) explicitly
  says not to add. It would also force every ability method to branch on the target's class, which is
  strictly more code than three small policies. The counter-argument (all three blog entities gate on
  the same four permission strings, so a shared policy deduplicates them) is real but loses:
  `app/Actions/` groups by **area** while `app/Policies/` groups by **model**, because policy binding
  is model-keyed by the framework itself — following the actions folder's shape into the policy
  folder conflates two different organizing principles. `UserPolicy`, `RolePolicy` and
  `SalesRegionPolicy` are all one-model-one-policy; there is no precedent here for anything else.
  **(b) Four abilities, not two.** `SalesRegionPolicy` defines only `viewAny`/`update` because
  `sales-regions.create`/`delete` are seeded but permanently unused — that catalog is fixed and
  seeded, so defining abilities nothing calls would add untested surface. The opposite is true here:
  this story ships a real create path and a real delete path, so all four abilities have call sites
  and all four carry both an allow and a deny test.
- **D-10 — No in-use delete guard, and deliberately no Gherkin scenario for it.** At implementation
  time `blog_posts` does not exist, so no category can be in use and there is nothing to count. The
  guard, and the PRD scenario that describes it, belong to story **0061**. `DeleteBlogCategory`
  exists as its own file now precisely so 0061 extends that one file — the same seam 0023's D-10
  created and 0024b's D-14 then used, which is the proof the pattern works rather than a hope that it
  will. **One forward note for 0061, flagged rather than decided:** the PRD's blog wording is
  stricter than its product wording — *"deletion is always blocked (no confirm-and-proceed path)"*
  and *"they must reassign those posts before it can be deleted"* — so 0061's Three Amigos pass must
  re-read the PRD rather than assume behavioural parity with 0024b's product-category guard.
- **D-11 — Independence from the product taxonomy is a structural scope fence, and its executable
  form is not settled here.** It is honoured by construction — own table, own model, own action
  namespace, own policy, own validation trait, no polymorphic taxonomy — and 0023 pins the mirror
  claim with an `arch()` assertion. **This story cannot simply mirror that**, because
  `App\Models\ProductCategory` does not exist in this tree: a literal
  `->not->toUse(ProductCategory::class)` is a fatal class-not-found at collection time, not a red
  test. The fence stands as a construction property and a documented rule; its test shape is
  **OQ-2**.
- **D-12 — The fold is the project's shared `App\Actions\NormalizeForSearch`, and `normalized_name`
  is derived by a `saving` model event rather than by each action.** Two halves, both mandated rather
  than chosen:

  **(a) One shared normaliser.** `App\Actions\NormalizeForSearch` (owned by story 0022's D13) is an
  invokable at `app/Actions/NormalizeForSearch.php`, `__invoke(string $value): string`, implemented
  as `trim` → `Str::lower` → `Str::ascii` → collapse whitespace. **0022, 0026, 0032, 0033, 0034 and
  0059 all share it** — per [0032's D-N1](0032-shipping-geography-catalog-seed.md) — and blog
  categories join that set rather than starting a second one. The bug class it closes is two
  implementations of the same fold drifting apart *invisibly*, each side's tests staying green
  because each side is internally consistent: if the write path folds accents and a read path only
  lowercases, "Guías" is stored as `guias` while the query stays `guías` and the row becomes
  unfindable — a silent zero-results bug no test on either side alone catches. **Two obligations
  follow.** (i) `Str::lower()` or `Str::ascii()` appearing anywhere in this story's model, validation
  trait or actions is a review finding — no second copy, no wrapper, no local override. (ii) A change
  to the normaliser is a **cross-story event**: it re-specifies category uniqueness here *and* is a
  **re-seed/recompute event** for every stored `normalized_name` in the database (D-N1's third
  obligation), so it is an amendment to 0022's D13, never a local edit.

  **(b) Derivation lives in a model event.** `normalized_name` is omitted from `#[Fillable]` and
  written by `static::saving()` guarded on `isDirty('name')`. The deciding argument is one this repo
  has already written down for a structurally identical problem —
  [security/authorization-patterns.md](../../docs/security/authorization-patterns.md)'s task-0010
  rule that **an identity derived from a mutable column must be locked at the model layer as soon as
  code exists that can mutate it.** `normalized_name` is exactly that: derived from the mutable
  `name`, with **two** independent writers in this story (`CreateBlogCategory`,
  `RenameBlogCategory`) and more arriving later. "Every writer remembers to recompute it" is a
  convention among callers; the hook is an enforcement. Getting it wrong is silent and severe — a
  stale `normalized_name` makes a category simultaneously undiscoverable by search and invisible to
  the uniqueness rule, while the row looks perfectly correct in any UI. Three constraints come with
  it: **`booted()`, not `boot()`** (the `App\Models\Role` precedent is a vendor-hook-ordering
  workaround that does not apply); **guard on `isDirty('name')`**, so an unrelated save does not
  rewrite the column; and **the blast radius is the whole suite**, since a model event binds every
  `BlogCategory` in every test — which is precisely the case
  [errors-log.md](../../docs/errors-log.md#both-of-this-projects-per-change-quality-gates-are-scoped-by-default-and-both-silently-passed--2026-08-20)
  records, making the unscoped `php artisan test` run mandatory rather than advisory.

  **Recorded alternative, rejected:** each action computes and `forceFill`s it explicitly, matching
  0023/0032's write-time shape. Rejected because it re-splits one invariant into two implementations
  — the exact drift half (a) exists to prevent — but it is a clean fallback if Phase 2 rejects the
  hook, at the stated cost. 0059 records the identical alternative and the identical rejection.
- **D-13 — The actions authorize themselves. Do NOT copy 0023's "these actions perform no
  authorization of their own" hand-off note.** This is the one place where mirroring the sibling
  story would actively regress this one, and it is recorded loudly because the sibling's text reads
  authoritative. 0023's Phase 1 debate ran **2026-08-17**; task **0008a** — which moved authorization
  *into* `CreateUser`/`UpdateUser` as their own first statement and established the
  [action-owns-the-rule convention](../../docs/conventions/base-standards.md#an-authorization-rule-belongs-to-the-action-not-to-one-of-its-callers)
  — landed **2026-08-19**, two days later. Verified at `HEAD`: `App\Actions\Users\CreateUser` opens
  with `Gate::authorize('create', User::class)`. 0023's note is therefore a true statement about a
  tree that no longer exists, which is precisely the failure mode
  [errors-log.md](../../docs/errors-log.md#a-deferred-storys-findings-were-claims-about-a-tree-that-no-longer-existed-and-one-of-them-would-have-reopened-a-bug-in-this-log--2026-08-23)
  records for deferred task files. Since 0058 is planned *now*, on a codebase where task 0017 already
  demonstrated the convention costs nothing when applied at Phase 1, all three actions authorize as
  their first statement — via `LogRefusedPrivilegedAttempt::authorize()` rather than a bare
  `Gate::authorize()`, so a refusal is recorded with `target_type: 'blog_category'` per the
  [refusal-logging recipe](../../docs/architecture/authorization.md#recording-a-refusal--what-every-gate-owes-the-audit-trail).
  The component that arrives with the UI story authorizes **as well** — that is a layer, not a
  redundancy. **This decision has a test-design consequence that is easy to miss and is called out at
  the top of the test list: authorization runs before validation, so every negative-validation test
  must `actingAs()` a permitted actor or it passes for the wrong reason.**
- **D-14 — Actions live in `app/Actions/Blog/` — an *area* folder — which knowingly diverges from
  Epic 2's entity folders.** [base-standards.md](../../docs/conventions/base-standards.md#directory-structure)
  states the rule as "one subfolder per area", and `app/Actions/SalesRegions/` is the shipped example
  holding all three of that area's actions. Epic 2's *planned* stories chose differently:
  `app/Actions/ProductCategories/` (0023) alongside `app/Actions/Products/` (0024) — two
  entity-named folders in one area. Blog follows the **area** reading, so `Blog/` will hold the
  category, tag and post actions together. The reason is that the area boundary here is not
  arbitrary: **one `blog.*` permission tier gates all three entities** (**D-8**), so the folder
  mirrors the gate, and a reader asking "what can a `blog.edit` holder do?" finds one folder rather
  than three. Recorded explicitly rather than left as an inconsistency for a reviewer to trip over —
  and flagged for Phase 2, which may reasonably prefer alignment with Epic 2 instead. The accepted
  cost is that `Blog/` plausibly reaches ten or more classes once posts and tags land, where
  `SalesRegions/` has three; that is a known and acceptable consequence of the area convention, not
  a reason to deviate now.

### Scope fences: what this story must NOT do
- No in-use / hard-block-with-count delete guard (story 0061).
- No `blog_posts` or `blog_tags` table, no `blog_category_id` column, no FK, no relationship method.
- No new permission module slug and no `RolePermissionSeeder` change.
- No Livewire component, route, Blade view, or `config/modules.php` registry entry.
- No `lang/en|es/*.php` file (no UI copy is owned here; core `validation.php` messages suffice).
- No slug, sort order, description, translations table, or any other i18n scaffolding.
- No second text normaliser and no local fold helper: `App\Actions\NormalizeForSearch` is consumed
  as-is and is neither created nor modified here (**D-12**; it is story 0022's deliverable per
  [0032's D-N1](0032-shipping-geography-catalog-seed.md)).
- No modification to any product-taxonomy file, and no shared/abstract base class extracted between
  the two taxonomies.

## Dependencies, risks and open questions

### Dependencies
- **None inside Epic 4** for its schema, model, actions or policy. This is the foundational story the
  other blog stories build on.
- **One shared class it consumes: `App\Actions\NormalizeForSearch`, owned by story 0022** (**D-12**).
  It is absent from this worktree today, and that is **expected and not a blocker** — the question is
  already settled at project level by [0032's **D-N1**](0032-shipping-geography-catalog-seed.md)
  ("CONFIRMED 2026-08-18"), which establishes the utility as story 0022's deliverable and the single
  source of truth every consuming story calls. Stories 0022, 0026, 0032, 0033, 0034, 0059 and this
  one all consume it on the same terms, and it is expected to exist by the time any of them reaches
  Phase 3. **This story neither creates nor modifies it**; the only local obligation is to *call* it
  (write-time and read-time alike) and never to fork, wrap or reimplement the fold. Recorded here as
  a dependency rather than an open question, and deliberately **not** re-litigated per story.
- Depends only on what is already shipped: `spatie/laravel-permission` wired to `User` with the
  seeded catalog including the `blog` module (story 0002), the `Gate::before` Super Admin bypass, the
  policy auto-discovery convention (story 0004), the action-owns-the-rule convention (story 0008a)
  and `App\Actions\Auth\LogRefusedPrivilegedAttempt` (story 0015b).
- **Story 0061 (blog-posts-core-crud-backend) depends on this one** and is the story that adds
  `blog_posts.blog_category_id` and retrofits the hard-block-with-count guard onto
  `DeleteBlogCategory`. Per [workflow.md](../../docs/workflow.md#task-ordering-rule)'s task ordering
  rule, this story's lower id is deliberate.
- **The blog categories management screen** is a later UI story and is the one that gives the policy
  its first *component* call site (it already has action call sites — **D-13**).

### Risks
- **R-1 — The `Rule::unique()->ignore()` omission.** The single most likely bug: without it, saving a
  category under its own unchanged name fails. Caught by the dedicated three-part rename-to-own-name
  test, which is written as three assertions precisely so a rule that rejects everything cannot pass
  it trivially.
- **R-2 — 0023's headline risk does NOT apply here, and inheriting its text would be wrong.** 0023's
  R-2 states, as "the highest-severity finding of the debate", that the suite runs **SQLite in CI and
  MySQL locally/production** because `phpunit.xml` pins `DB_DATABASE` but not `DB_CONNECTION`.
  **Verified false at `HEAD` on this worktree**, by reading the three files it cites rather than
  trusting either the sibling story or the reporting agent:

  | File | Value today |
  | --- | --- |
  | `phpunit.xml` | `<env name="DB_CONNECTION" value="mysql"/>` |
  | `.env.example` | `DB_CONNECTION=mysql` |
  | `.github/workflows/tests.yml` | job-level `DB_CONNECTION: mysql` |

  The change is commit `55ba248` — *"fix(ci): make MySQL the real, working default for CI and
  .env.example"* — an ancestor of current `HEAD`, tracked by
  [`ci-database-connection-gap.md`](ci-database-connection-gap.md), which records the fix as
  completed and verified on 2026-08-26 (866/866 passing against a real MySQL connection). **There is
  no engine split in this repo's test matrix today**, so a reviewer must not read this story as
  "R-2 still holds, verified".

  **This does not weaken D-4, because D-4 no longer rests on the engine split at all.** The stale
  premise is precisely why 0023's design needed the argument it did; the stored-`normalized_name`
  design adopted here removes the collation from the correctness argument entirely (**D-4**, point 3)
  and is justified primarily by the **TOCTOU race** (point 1), which is engine-independent and is a
  live defect on any database. The residual value of collation-independence is real but secondary:
  **if** a future change reintroduces a second engine, a read replica or a different collation, the
  stored folded key keeps behaviour identical for free.
- **R-3 — Whitespace slipping through `required`.** Laravel's `required` treats `'   '` as present,
  so without an explicit trim a whitespace-only category persists, and `'Guías'` / `'  Guías  '`
  become two rows that look identical to a human and do not collide as duplicates. Caught by the
  whitespace-only and the trim-on-store tests, both of which assert the exact persisted value rather
  than merely "no error".
- **R-4 — The length trio drifting apart, and the `Str::ascii()` expansion hazard neither Epic 4
  story currently accounts for.** **Three** numbers now carry the length, not two: the validation
  `max:255`, the migration's `string('name', 255)`, and `string('normalized_name', 255)`. If any
  moves without the others, a validation refusal becomes a truncation or a `22001`.

  ⚠️ **Matching them is necessary but not sufficient, and this is the part to settle before
  implementation.** `NormalizeForSearch` ends in `Str::ascii()`, which is a *transliteration*, not a
  1:1 map — it can make a string **longer** (`ß` → `ss`, `æ` → `ae`, and some symbols expand to three
  or more characters). A `name` of exactly 255 characters can therefore fold to a `normalized_name`
  **longer than 255**, which either truncates the uniqueness key silently (corrupting the invariant
  the column exists to hold, and doing so *only* for accented input) or throws a raw `22001`. Two
  candidate fixes, both cheap: size `normalized_name` with headroom above `name`'s cap, or cap the
  validation `max:` low enough that the worst-case fold still fits. **The expansion factor is not
  verified here** — this worktree has no `vendor/` directory, so `Str::ascii()` could not be executed
  — and per this project's own
  [hedge rule](../../docs/errors-log.md#a-reviewers-correction-replaced-an-accurate-technical-explanation-with-a-wrong-one-unverified--2026-08-24)
  an unverified mechanism must not be written up as fact. The one command that settles it, to be run
  at Phase 2/3: `php artisan tinker --execute 'dump(strlen(Str::ascii(str_repeat("ß", 255))));'`.
  **[0059](0059-blog-tags-backend.md) has the identical exposure at its own `100`/`100`** and its R-4
  states only that the two columns "must match each other", which does not close this direction —
  worth carrying back to that story rather than fixing only here (**OQ-1**).
- **R-5 — Faker uniqueness is not database uniqueness.** `fake()->unique()` guards within a Faker
  instance, not against a literal name a test seeded itself. Any test needing a distinct — or
  deliberately colliding — name passes it explicitly.
- **R-6 — `nameRules()` reused asymmetrically.** A nullable-id rule helper whose `$id` is threaded
  through on one call path but not the other fails silently in only one direction. Caught by
  re-asserting the full validation depth on the rename path independently, rather than assuming
  symmetry with create.
- **R-7 — An implementer copying 0023's stale authorization hand-off note.** This is a *process*
  risk unique to this story's provenance rather than a code risk: 0023's Definition of Done says its
  actions "perform no authorization of their own", which was true when written and is below the
  standard the codebase now holds. **D-13** exists to pre-empt it, and the acceptance criteria state
  the requirement positively so it cannot be satisfied by omission.
- **R-8 — Cross-branch divergence on the shared normaliser.** This story is being planned in a
  dedicated worktree while 0022/0023 are planned elsewhere. If two branches each add their own copy,
  the "exactly one normaliser in the tree" invariant is violated at *merge* time even though each
  branch is internally consistent — the same invisible-drift shape **D-12** exists to prevent,
  arriving through version control rather than through code. Mitigated by the fact that ownership is
  unambiguous (0022's deliverable, per [0032's D-N1](0032-shipping-geography-catalog-seed.md)) and by
  this story creating nothing; the residual is a merge-time review check, not a design question.
- **R-9 — A vacuous architecture test.** A `->not->toUse()` assertion is a negative claim and is
  green both when the invariant holds and when the test is structurally unable to fail. Whatever
  shape **OQ-2** settles on, it must be proven able to go red before it is counted as coverage, per
  [errors-log-archive.md](../../docs/errors-log-archive.md#a-pest-arch-rule-over-an-array-of-namespaces-shipped-green-while-proving-nothing--2026-08-18).

### Open questions

Per [contracts.md](../../docs/contracts.md)'s Uncertainty Handling Rule these are recorded rather
than guessed. None blocks Phase 2 review; **OQ-1 and OQ-2 must be settled before Phase 3.**

- **OQ-1 — The length trio, settled jointly with [0059](0059-blog-tags-backend.md), including the
  `Str::ascii()` expansion hazard.** Two coupled sub-questions, both cheap to answer and both
  genuinely open:
  - **(a) How long is `name`?** This story says **255** (matching 0023's product-category decision
    and this repo's free-text precedent, since a blog *category* is the direct analogue of a product
    category); 0059 says **100** for tags, and records that number as *its* own OQ-1, so neither
    figure is settled. A defensible outcome is that they legitimately differ — a tag is a genuinely
    shorter label than a category — but that should be a decision, not two stories independently
    guessing.
  - **(b) How long is `normalized_name`, given the fold can expand?** See **R-4**. Sizing it equal to
    `name` is what both stories currently specify and is **not obviously sufficient**, because
    `Str::ascii()` transliterates rather than maps 1:1. Either give `normalized_name` headroom above
    `name`'s cap *(recommended — it costs nothing, keeps the validation `max:` equal to the visible
    `name` limit an editor experiences, and fails safe)* or cap the validation `max:` low enough that
    the worst-case fold fits. **Settle by execution, not by reasoning** — the exact command is in
    R-4, and this worktree could not run it (`vendor/` absent).
- **OQ-2 — What shape does the "independent from product categories" architecture test take, given
  `App\Models\ProductCategory` does not exist in this tree?** A literal mirror of 0023's rule is a
  fatal class-not-found at collection time, not a red test.
  - **(a) Write it as a string-based namespace rule** (`expect('App\Models\BlogCategory')
    ->not->toUse('App\Models\ProductCategory')`) **after verifying against the installed Pest version
    that a non-existent target string resolves rather than throwing.** *(recommended, conditional on
    that verification)* — it keeps the fence executable from day one and degrades gracefully into a
    real assertion the moment 0023 lands.
  - **(b) Omit the test in 0058 and let whichever of 0023/0058 lands *second* add the cross-check in
    both directions.** Honest and zero-risk, at the cost of the fence being prose-only for a while.
  This must be settled by execution, not by reasoning about how `arch()` ought to behave.
- **OQ-3 — The blog glossary terms this story is forced to settle.**
  [gherkin-guidelines.md](../../docs/testing/frontend/gherkin-guidelines.md#todo--blog--ecommerce-vocabulary-undefined)'s
  `TODO (product owner)` explicitly asks whether a blog entry is a **"post"** or an **"article"**.
  This story's Gherkin uses "post" and "blog editor", both lifted from the PRD's own Epic 4
  scenarios rather than coined — but the glossary row is still empty, so the choice is currently
  made by precedent rather than by decision. **Recommendation: ratify "post" and "blog editor"** and
  record them, so the blog post and tag stories inherit a decision instead of re-deriving one.
- **OQ-4 — Will a blog category ever need a `slug`?** **D-6** defers it, consistent with 0023, on the
  grounds that PRD assumption 1 makes this backoffice-only and assumption 14 names slug/SEO fields
  for *posts* specifically. The residual question is whether a future public blog-category archive
  route (`/blog/category/{slug}`) is anticipated sooner than the equivalent product-category page. If
  yes, adding `slug` now is far cheaper than backfilling one across existing content later.
  **Recommendation: defer**, and treat it as an Epic 5 / storefront question rather than a
  gap in this story.

## Provenance
Phase 1 (Three Amigos) debate run on 2026-08-27 with `backend-expert` (files and approach),
`database-expert` (schema, index, collation and soft-delete decisions) and `backend-qa` (test
design), per [workflow.md](../../docs/workflow.md#phase-1--three-amigos-debate). Derived from
[PRD](../../docs/PRD/PRD.md#epic-4--blog) Epic 4's `Feature: Blog categories (extends the prototype)`
Gherkin block and its Blog acceptance criteria, plus assumptions 13, 14, 17 and 19. The
`blog_posts`-does-not-exist-yet scoping and the 0061 hand-off of the in-use delete guard mirror the
confirmed 0023 → 0024 decomposition, recorded here so the missing guard is never read as an
oversight.

All three amigos' contributions are reflected above. Three of their findings changed this document
rather than merely supporting it, and each was **independently verified by the facilitator against
the real tree before being accepted**, per this project's rule that a hedge or a second-hand claim is
a flag that nobody ran the code:

1. **`backend-expert` found that 0023's authorization hand-off note is stale** — written 2026-08-17,
   two days before task 0008a moved authorization into the actions. Confirmed by reading
   `app/Actions/Users/CreateUser.php` at `HEAD`, which opens with `Gate::authorize('create',
   User::class)`. Recorded as **D-13** and **R-7**, and stated positively in the acceptance criteria
   so it cannot be satisfied by omission. Without this, 0058 would have shipped three unauthorized
   actions by faithfully copying its sibling.
2. **`database-expert` found that 0023's headline risk R-2 is stale** — the SQLite-in-CI /
   MySQL-in-production engine split no longer exists. Confirmed by reading `phpunit.xml`,
   `.env.example` and `.github/workflows/tests.yml` directly, and traced to commit `55ba248` and the
   completed [`ci-database-connection-gap.md`](ci-database-connection-gap.md) infrastructure fix.
   This removed the *stated* justification for 0023's uniqueness design and is what made the
   post-debate revision below both necessary and easy.
3. **`backend-qa` found that 0023's `arch()` scope-fence test cannot be mirrored here**, because the
   class it would name does not exist in this tree and would fatal at collection time rather than
   fail. Recorded as **OQ-2**, with **D-11** narrowed to claim only what is actually true today.

**One conflict between contributions was resolved by the facilitator rather than left implicit.**
`backend-expert` recommends self-authorizing actions (**D-13**); `backend-qa`'s validation tests are
written in the direct-call form `expect(fn () => $action(''))->toThrow(ValidationException::class)`.
Those two are incompatible as written — with authorization running first, an unauthenticated direct
call throws `AuthorizationException`, so every negative-validation test would pass for the wrong
reason and prove nothing about validation at all. Resolved in favour of keeping **D-13** and adding
an explicit `actingAs()` precondition, called out in a blockquote at the top of the test list rather
than buried in individual cases. Neither amigo had visibility into the other's contribution, which is
exactly the class of gap the facilitator step exists to close.

**One decision diverges from Epic 2's precedent and is recorded as such rather than smoothed over:**
**D-14**, the `app/Actions/Blog/` area folder versus Epic 2's `ProductCategories/` + `Products/`
entity folders. Phase 2 may reasonably prefer alignment with Epic 2 instead; the argument for the
area reading (one `blog.*` permission tier gates all three blog entities, so the folder mirrors the
gate) is stated in full so that review is a real choice rather than a rubber stamp. Note
[0059](0059-blog-tags-backend.md) independently specifies the same `app/Actions/Blog/` folder and
explicitly describes it as shared with this story and 0061, so the two Epic 4 stories agree.

### Revised 2026-08-27 — uniqueness redesigned onto a stored `normalized_name` column

**This file's original Phase 1 draft copied 0023's `unique('name')` + PHP-only-comparison design.
That was wrong, and the revision is not a matter of taste.** Story [0059](0059-blog-tags-backend.md)
(blog tags), debated in parallel by a sibling agent, independently converged on a stored
`normalized_name` column carrying the `UNIQUE` index, derived through a `saving` model event calling
the shared normaliser. Checking that claim against the backlog rather than accepting it confirmed the
stronger fact: [0032](0032-shipping-geography-catalog-seed.md)'s **D-N1** — *"CONFIRMED 2026-08-18"*,
agreed with the product owner across the Epic 2 Phase 1 debates — **already establishes this as the
project-wide convention**, requiring the shared `App\Actions\NormalizeForSearch` at both write time
and read time precisely so correctness never depends on collation. Stories 0022, 0026, 0032, 0033
and 0034 already consume it. **0023 predates that confirmation and is the outlier, not the
standard** — so mirroring it propagated a superseded pattern into Epic 4.

What changed here: the migration (`normalized_name` unique, no `unique('name')`), the model (the
`saving`/`isDirty('name')` hook, the column omitted from `#[Fillable]`), the factory, the validation
rule's target column, **D-4** and **D-12** rewritten around the real reasons (the TOCTOU race,
construction-level agreement between index and application, collation independence, and the indexed
read path), **R-2** and **R-4**, the acceptance criteria, and five model/rename test cases. **D-4**
also now carries the discrepancy note about 0023, which is deliberately **left untouched**: it is an
Epic 2 story outside this Epic 4 batch's mandate, and the note exists so whoever reconciles Epic 2's
backlog finds the divergence already identified.

**One new finding came out of the revision, and it applies to 0059 as well as here.** Both stories
size `normalized_name` equal to `name`, and that is not obviously sufficient: `Str::ascii()` is a
transliteration, so the fold can be *longer* than its input (`ß` → `ss`), meaning a max-length `name`
can overflow an equally-sized `normalized_name` — truncating the uniqueness key silently, and only
for accented input. Recorded as **R-4** and **OQ-1** rather than fixed by guessing a number, because
this worktree has no `vendor/` directory and the expansion factor could not be verified by execution;
per this project's own hedge rule an unverified mechanism must not be written up as fact. **0059's
R-4 says only that the two columns must "match each other", which does not close this direction** —
worth carrying back to that story rather than fixing only here.

**Not yet run:** Phase 2 (`code-reviewer` INVEST validation). Five items deserve an explicit look
there rather than at implementation time, the first two settleable only **by execution**:

1. **OQ-1's length trio and the `Str::ascii()` expansion hazard** — jointly with 0059, since both
   stories carry the same exposure and neither number is settled.
2. **OQ-2**, the architecture test's shape, which must be proven able to go red (**R-9**).
3. **D-12(b)**, the `saving` model event — new to this codebase, whole-suite blast radius, and
   recorded with its rejected alternative so Phase 2 can take the fallback if it prefers.
4. **D-14**, the folder-convention divergence from Epic 2 (0059 agrees with this story).
5. **D-4**'s consequence that the fold covers accents as well as case, so "Guías" and "Guias" cannot
   coexist as two categories — a real product-visible outcome for a Spanish-language blog. Note this
   is now a property of the *project's* shared normaliser rather than of this story, so confirming it
   here is confirming it for six stories at once.
