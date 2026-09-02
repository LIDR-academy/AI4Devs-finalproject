# [0059] Blog tags — backend (table, model, create/rename/delete, find-or-create, name validation)

## Description
Introduce the blog tag taxonomy as a first-class, standalone entity: a new `blog_tags` table (UUID v7
primary key per [ADR 0001](../../docs/decisions/0001-uuid-primary-keys.md), which names Blog Tags
explicitly), its `App\Models\BlogTag` model, and the create / rename / delete domain logic with name
validation — **plus** a reusable `FindOrCreateBlogTag` action that resolves-or-creates a tag by name,
which is what makes PRD Epic 4's "create a tag on the fly from the post editor" possible without the
post editor knowing anything about tag storage.

This is **backend only** (no screen, no route) and deliberately independent from the product category
taxonomy and from blog categories: no shared table, no shared model, no polymorphic taxonomy.

Covers [PRD](../../docs/PRD/PRD.md#epic-4--blog) Epic 4's `Feature: Blog tags (extends the prototype)`
scenarios *Create a tag*, *Rename a tag*, *Delete a tag*, *Reuse an existing tag from the post
editor* and *Create a new tag on the fly from the post editor*, plus the CRUD half of Blog acceptance
criterion 3 and acceptance criterion 6. It does **not** cover attaching tags to a post, the tag
management screen, or the post editor's chip field — see
[Scope fences](#scope-fences-what-this-story-must-not-do).

## Type
backend | includes database-expert: yes

## Gherkin
```gherkin
Feature: Blog tags

  Scenario: Create a tag
    Given a blog editor
    When they create a tag named "running"
    Then "running" is saved in the tag catalog
    And it becomes available to be attached to posts

  Scenario: Rename a tag
    Given a blog editor, with a tag "running"
    When they rename it to "trail running"
    Then the tag is shown as "trail running" wherever it is used
    And no tag named "running" remains in the catalog

  Scenario: Saving a tag under its own current name is accepted
    Given a blog editor, with a tag "running"
    When they save that same tag with the name "running" unchanged
    Then the save is accepted
    And the tag keeps the name "running"

  Scenario: Delete a tag
    Given a blog editor, with a tag "running"
    When they delete "running"
    Then "running" is removed from the tag catalog
    And the deletion is never blocked, whatever the tag is attached to

  Scenario: Reuse an existing tag by name
    Given a blog editor, with a tag "running" already existing
    When they resolve a tag for the name "Running"
    Then the existing "running" tag is returned
    And the catalog still holds exactly one tag for that name

  Scenario: Create a new tag by name when none matches
    Given a blog editor, with no tag named "invierno"
    When they resolve a tag for the name "invierno"
    Then a new "invierno" tag is created and returned
    And it becomes available to be attached to posts

  Scenario Outline: A tag with an unacceptable name is refused
    Given a blog editor
    When they create a tag with <invalid_name>
    Then the creation is refused with a validation message
    And no tag is added to the catalog

    Examples:
      | invalid_name                            |
      | a blank name                            |
      | a name made only of whitespace          |
      | a name longer than the accepted maximum |

  Scenario: Creating a tag with a name already in the catalog is refused
    Given a blog editor, with a tag "running"
    When they create another tag named "Running"
    Then the creation is refused with a validation message
    And the catalog still holds exactly one tag for that name

  Scenario: Renaming a tag onto a name another tag holds is refused
    Given a blog editor, with the tags "running" and "invierno"
    When they rename "invierno" to "running"
    Then the rename is refused with a validation message
    And "invierno" keeps its name

  Scenario: Blog tags are independent from the other taxonomies
    Given a blog editor
    When they view the tag catalog
    Then it contains only blog tags, held in their own catalog
    And it shares no storage or identity with blog categories or product categories

  Scenario: An administrator without the blog permission cannot manage the catalog
    Given a signed-in administrator who does not hold the blog management permission
    When authorization to manage the tag catalog is evaluated for them
    Then the action is refused
```

> **The delete scenario is deliberately scoped to the tag's own row.** PRD's wording is *"Then it is
> removed from every post that used it"*, and the second half of that sentence is **not** assertable
> in this story: `blog_posts` and `blog_post_tag` do not exist, so there is no post to detach from and
> no relation to call. The behaviour is honoured **by construction** — the pivot's tag-side foreign
> key cascades (see **D-8**) — and story **0061** owns both the pivot and the test that proves the
> cascade. What this story's suite *can* and must assert is the half that is real here: the delete
> succeeds unconditionally and removes the row, with no in-use guard anywhere. See
> [Scope fences](#scope-fences-what-this-story-must-not-do) and **R-6**.

> **Deliberately absent:** there is no scenario for *merging* two tags when a rename collides. PRD
> scripts no merge, and merging is **unbuildable in this story** — it means reassigning every
> `blog_post_tag` row from the source tag to the target before deleting the source, against a table
> that does not exist. This story refuses the collision (**D-7**).

## Files to create/modify

**Migration**
- `database/migrations/<timestamp>_create_blog_tags_table.php` — new. Greenfield UUID table per
  [migrations.md](../../docs/database/migrations.md#uuid-primary-keys):

  ```php
  public function up(): void
  {
      Schema::create('blog_tags', function (Blueprint $table): void {
          $table->uuid('id')->primary();
          $table->string('name', 100);

          // The uniqueness rule lives HERE, not on `name` -- see D-3.
          // Both this index and every app-level lookup compare the output of
          // the one shared App\Actions\NormalizeForSearch, so there is no
          // second definition of "the same tag name" to drift from the first.
          //
          // Deliberately WIDER than `name` (255 vs 100) rather than equal to
          // it: NormalizeForSearch ends in Str::ascii(), which TRANSLITERATES
          // rather than mapping 1:1, so a fold can be longer than its input.
          // The headroom is a cushion, not a proof -- R-4 requires Phase 3 to
          // measure the real worst-case expansion by execution before these
          // two numbers are final.
          $table->string('normalized_name', 255)->unique();

          $table->timestamps();
      });
  }

  public function down(): void
  {
      Schema::dropIfExists('blog_tags');
  }
  ```

  **There is deliberately no `unique('name')`** (**D-3**), no `slug` / `description` / `sort_order`
  (**D-6**), no `deleted_at` (**D-5**), and no foreign key of any kind — the `blog_post_tag` pivot is
  story 0061's, on 0061's side. `down()` is the exact inverse; dropping the table drops the index with
  it, so no companion `dropUnique()` is needed (contrast
  [`add_pending_email_to_users_table`](../../docs/database/migrations.md#drop-a-unique-index-explicitly-before-its-column),
  where the column outlives the table).

**Model**
- `app/Models/BlogTag.php` — new. `use HasFactory, HasUuids;`, `#[Fillable(['name'])]`,
  `@property string $id` / `$name` / `$normalized_name` per
  [base-standards.md](../../docs/conventions/base-standards.md#uuid-primary-keys). No
  `$keyType`/`$incrementing` (the trait overrides both as methods), no `SoftDeletes` (**D-5**), no
  `#[Hidden]` (nothing sensitive), no `casts()` beyond Eloquent's default timestamp handling.

  `normalized_name` is **omitted from `#[Fillable]`** and derived by a model event, which is this
  story's one genuinely new pattern (**D-4**):

  ```php
  // app/Models/BlogTag.php
  protected static function booted(): void
  {
      static::saving(function (self $tag): void {
          if ($tag->isDirty('name')) {
              $tag->normalized_name = app(NormalizeForSearch::class)($tag->name);
          }
      });
  }
  ```

  Note `booted()`, not `boot()`. [`App\Models\Role`](../../app/Models/Role.php) uses `boot()` for a
  reason that **does not apply here** — it subclasses a vendor model and has to register ahead of the
  package's own hooks (see
  [authorization.md](../../docs/architecture/authorization.md#the-super-admin-roles-invariants)).
  `BlogTag` extends `Model` directly with nothing to order against, so `booted()` is correct and
  `boot()` would be cargo-culting a workaround for a problem this class does not have.

**Factory**
- `database/factories/BlogTagFactory.php` — new, via
  `php artisan make:factory BlogTagFactory --model=BlogTag --no-interaction`. `definition()` returns
  `['name' => fake()->unique()->words(2, true)]` and **does not set `normalized_name`** — the model
  event derives it, which is itself a small proof the hook fires on the insert path. Faker's
  `unique()` is a per-instance guard, **not** a database one (**R-5**); a test needing a
  guaranteed-distinct name passes it explicitly.

**Validation trait**
- `app/Concerns/BlogTagValidationRules.php` — new, following
  [naming.md](../../docs/conventions/naming.md#traits-and-their-methods)'s `<Noun>ValidationRules` /
  `<noun>Rules()` convention. **Two name-rule methods, not one** — this is the trait's whole point and
  the shape a reviewer should check first (**D-9**):

  ```php
  trait BlogTagValidationRules
  {
      /**
       * Format only -- no uniqueness. The rule set FindOrCreateBlogTag uses,
       * where an existing name is a HIT, never an error.
       *
       * @return array<int, ValidationRule|array<mixed>|string>
       */
      protected function nameFormatRules(): array
      {
          return ['required', 'string', 'max:100'];
      }

      /**
       * Format PLUS uniqueness, compared against normalized_name. The rule set
       * CreateBlogTag / RenameBlogTag use, where an existing name is a refusal.
       *
       * @return array<int, ValidationRule|array<mixed>|string>
       */
      protected function nameRules(NormalizeForSearch $normalizeForSearch, ?string $blogTagId = null): array
      {
          return [
              ...$this->nameFormatRules(),
              Rule::unique('blog_tags', 'normalized_name')
                  ->where(fn ($query) => $query->where('normalized_name', $normalizeForSearch(/* the candidate */)))
                  ->ignore($blogTagId),
          ];
      }
  }
  ```

  Two things this shape carries deliberately:

  - **The uniqueness rule targets `normalized_name`, never `name`.** A bare
    `Rule::unique('blog_tags', 'name')` would compile to `WHERE name = ?` against the *raw* submitted
    string and would not catch `"Running"` against a stored `"running"` on a byte-comparing engine —
    it is the wrong column for the rule this story enforces (**D-3**).
  - **The `->ignore()` branch** is what makes "save a tag under its own current name" succeed, and it
    is only safe when the id it receives is server-authoritative — see
    [security/livewire-authorization.md](../../docs/security/livewire-authorization.md) and the
    hand-off note in the Definition of Done. Phase 3 should settle the exact rule expression (a
    `Rule::unique()` with a normalised value, or a small custom rule) — what is fixed here is the
    *column it compares* and the *fold it uses*, not the Laravel API used to express it.

  `max:100` and the migration's `string('name', 100)` / `string('normalized_name', 100)` must stay in
  lockstep (**R-4**), and the number itself is **OQ-1**.

**Actions** — new subfolder `app/Actions/Blog/`, one per domain area, the same rule
`app/Actions/Roles/` and `app/Actions/SalesRegions/` follow. This folder is **shared with stories 0058
(blog categories) and 0061 (blog posts)** — it is the Blog *area*, not a per-model folder.

- `CreateBlogTag.php` — `__invoke(string $name): BlogTag`. Trims before validating, validates with
  `nameRules()`, and catches `QueryException` code `23000` to rethrow as a `ValidationException` on
  `name`, exactly as [`App\Actions\Users\CreateUser`](../../app/Actions/Users/CreateUser.php)
  already does for `email` — the unique index is the last-word race guard behind the validation rule,
  not a 500.
- `RenameBlogTag.php` — `__invoke(BlogTag $blogTag, string $name): BlogTag`. Same trim + `23000`
  handling, with `nameRules()` ignoring the target's own id.
- `DeleteBlogTag.php` — `__invoke(BlogTag $blogTag): bool`. An unconditional instance
  `$blogTag->delete()`. **Unlike [0023's `DeleteProductCategory`](done/0023-product-categories-backend.md),
  this action is complete as shipped and no later story extends it** (**D-8**) — its docblock carries
  the cross-story promise that makes that true, quoted in **D-8**.
- `FindOrCreateBlogTag.php` — `__invoke(string $name): BlogTag`. The reusable resolver 0060 and 0061
  both call. Full shape and semantics in **D-9**/**D-10**.

  All four actions constructor-inject `App\Actions\NormalizeForSearch` and
  `App\Actions\Auth\LogRefusedPrivilegedAttempt`, per
  [code-style.md](../../docs/conventions/code-style.md#exception-an-actions-own-dependency-is-constructor-injected-when-the-method-signature-is-a-public-contract):
  each `__invoke()` signature is a public contract matched verbatim by 0060, 0061 and every
  direct-call test, so an internal dependency may not widen it. **No action folds case or accents
  itself** — `Str::lower()` or `Str::ascii()` appearing anywhere under `app/Actions/Blog/` or in
  `BlogTagValidationRules` is a review finding (**D-2**).

**Policy**
- `app/Policies/BlogTagPolicy.php` — new, via
  `php artisan make:policy BlogTagPolicy --model=BlogTag --no-interaction`. Auto-discovered by name;
  **no** `AuthServiceProvider` (this repo has none and must not gain one). Four abilities gating on
  the already-seeded `blog.*` catalog (**D-11**), with the permission names as `public const` on the
  class that owns the rule, following
  [`SalesRegionPolicy`](../../app/Policies/SalesRegionPolicy.php) rather than `UserPolicy`'s repeated
  literals:

  ```php
  public const VIEW_PERMISSION = 'blog.view';
  public const CREATE_PERMISSION = 'blog.create';
  public const EDIT_PERMISSION = 'blog.edit';
  public const DELETE_PERMISSION = 'blog.delete';
  ```

**Consumed, not created by this story**
- `app/Actions/NormalizeForSearch.php` (`App\Actions\NormalizeForSearch`) — the shared text
  normaliser, `__invoke(string $value): string`, implemented as `trim` → `Str::lower` → `Str::ascii`
  → collapse-whitespace. **Owned and unit-tested by story 0022** (D13) and consumed unchanged by
  0023, 0026, 0032, 0033, 0034 and now 0059. This story must not redefine, wrap, fork or locally
  override it (**D-2**). **It does not exist in the tree today** — see **OQ-2**, which is a real
  sequencing blocker rather than a footnote.
- `app/Actions/Auth/LogRefusedPrivilegedAttempt.php` — the refusal audit line (task 0015b), already
  shipped. See **D-12**.

**Not touched by this story** (see [Scope fences](#scope-fences-what-this-story-must-not-do)):
`database/seeders/RolePermissionSeeder.php`, `routes/**`, `config/modules.php`, `app/Livewire/**`,
`resources/views/**`, `lang/**`.

## Tests to perform

Backend only — **no browser tests**, since this story ships no screen.

**Unit — `tests/Unit/Concerns/BlogTagValidationRulesTest.php`**
- [ ] `nameFormatRules()` returns the format rules and **carries no uniqueness rule** — the assertion
      that keeps `FindOrCreateBlogTag` from silently acquiring a refusal it must not have.
- [ ] `nameRules($normalizeForSearch, null)` and `nameRules($normalizeForSearch, $id)` return the
      expected rule arrays, and the second carries the `->ignore()` branch.
- [ ] The **exhaustive folding table is not re-asserted here.** `App\Actions\NormalizeForSearch`'s own
      behaviour (`ß`, `ç`, CJK, double spaces, idempotence) is owned and unit-tested by story 0022 in
      `tests/Unit/Actions/NormalizeForSearchTest.php` (**D-2**); duplicating it would create a second
      specification of the fold that can drift from the first. What this story tests is that tag name
      comparison *goes through* it — pinned end to end by the whitespace tests below.

**Feature — `tests/Feature/Models/BlogTagTest.php`** (mirrors `tests/Feature/Models/UserTest.php`)
- [ ] A factory-created tag's `id` is a UUID **v7** string (`Str::isUuid($id, 7)`), not an integer —
      proves `HasUuids` is actually wired.
- [ ] Two tags created in immediate succession sort lexicographically in creation order
      (`strcmp($first->id, $second->id) < 0`) — the same time-ordering assertion `UserTest` makes.
- [ ] Creating and re-fetching a tag persists `name` and populates both timestamps.
- [ ] `name` is mass-assignable and **`normalized_name` is not** — a forged
      `BlogTag::create(['name' => 'running', 'normalized_name' => 'hijacked'])` stores the *derived*
      value, not the submitted one. This is the mass-assignment guard for the column the uniqueness
      rule depends on, so it is a correctness test rather than a style one.
- [ ] **The `saving` hook derives `normalized_name` on insert and re-derives it on a rename** — two
      assertions, not one. A hook that fires only on insert leaves a renamed tag's `normalized_name`
      pointing at its *old* name, which silently breaks both uniqueness and every future lookup while
      the row looks correct in the UI (**R-3**).
- [ ] Saving a tag **without touching `name`** does not rewrite `normalized_name` — pins the
      `isDirty('name')` guard, and is what stops the hook from becoming a per-save normaliser run.
- [ ] The model does **not** use `SoftDeletes` — a regression guard on **D-5**, which is load-bearing
      here rather than merely tidy: adding the trait would stop the pivot cascade firing at all.

**Feature — `tests/Feature/Blog/CreateBlogTagTest.php`**
- [ ] Creating with a valid name persists exactly one row with that name, populates both timestamps,
      and stores the correctly derived `normalized_name`.
- [ ] Creating with a blank name throws `ValidationException` on `name` and writes no row. Assert
      against the **action's own** validation (`expect(fn () => $action(''))->toThrow(...)` and
      inspect `->errors()['name']`) — there is no Livewire component in this story to assert through.
- [ ] Creating with a **whitespace-only** name (`'   '`) is refused. Laravel's `required` treats a
      string of spaces as *present*, so with a bare `['required', 'string', 'max:100']` rule set a
      whitespace-only name validates and persists. The test proves the trim happens **before**
      validation, not after (**R-2**).
- [ ] A name with leading/trailing whitespace is stored trimmed — assert the exact persisted `name`,
      not merely "no error".
- [ ] Length boundary **pair**: a name of exactly the maximum length is accepted, one character over
      is refused (**R-4**).
- [ ] Creating a duplicate name is refused at the **validation** layer (`ValidationException`, not a
      `QueryException`).
- [ ] A duplicate that bypasses validation surfaces as a `ValidationException` on `name`, not a 500 —
      the test that proves the `23000` catch. It must drive the collision through the **real unique
      index** (pre-insert the colliding row with `DB::table('blog_tags')->insert(...)`, bypassing the
      action entirely) rather than asserting about the catch block. The test asserts the *outcome*, so
      it holds whichever way the action implements it.
- [ ] Case-only-different duplicate: creating "Running" alongside "running" is refused **by
      validation**.
- [ ] Accent-only-different duplicate: creating "Nino" alongside "Niño" is refused **by validation**.

**Feature — `tests/Feature/Blog/RenameBlogTagTest.php`**
- [ ] Renaming to a free name updates the row, **and updates `normalized_name` with it**.
- [ ] Renaming onto another tag's name is refused and the target keeps its original name.
- [ ] Renaming a tag to **its own current name** is accepted — the `->ignore()` trap, and the single
      most likely bug in this story (**R-1**). Write this as **three** tests, not one, so a rule that
      rejects everything cannot pass the first trivially: (a) the no-op rename succeeds; (b) the row
      is genuinely unchanged afterwards; (c) a genuinely free name is still accepted, as the control.
- [ ] Renaming a tag to a **case variant of its own current name** ("running" → "Running") is
      accepted and updates the stored `name` — the `->ignore()` branch has to survive the normalised
      comparison, which is the one case where this story's uniqueness column and 0023's differ in a
      way a copied test would miss.
- [ ] The full validation depth (blank / whitespace-only / length boundary pair) is re-asserted on the
      **rename** path independently, not assumed symmetric with create (**R-7**).

**Feature — `tests/Feature/Blog/DeleteBlogTagTest.php`**
- [ ] Deleting a tag removes the row outright (`assertDatabaseMissing`, not `assertSoftDeleted`).
- [ ] The freed name can immediately be reused by a new tag, and by `FindOrCreateBlogTag` — proves
      nothing lingers to hold the unique index, which is exactly what a soft delete would have broken.
- [ ] Deleting an unknown or malformed-UUID tag fails cleanly (`ModelNotFoundException` / 404), not as
      a silent no-op — `HasUuids`' `resolveRouteBindingQuery()` rejects a non-UUID parameter before
      querying.
- [ ] **No in-use guard exists** — assert positively that the delete is unconditional, since the
      absence of a guard is this story's actual contract (**D-8**) and a later reader would otherwise
      read it as an oversight. See the honest limits of this in **R-6**.

**Feature — `tests/Feature/Blog/FindOrCreateBlogTagTest.php`** — the story's highest-value file; no
0023 precedent exists because 0023 has no find-or-create.
- [ ] Exact-match reuse: calling twice with byte-identical input returns the **same row id** both
      times and leaves exactly one row.
- [ ] Case-only reuse: "Running" resolves to the existing "running", no second row.
- [ ] Accent-only reuse: "Nino" resolves to the existing "Niño", no second row.
- [ ] **Whitespace-padded reuse** (`'  running  '` → existing `'running'`) — **blocking, not
      filler.** See **R-8**: this and the next case are the *only* assertions that distinguish "the
      app normalises" from "MySQL's collation happened to fold it for us".
- [ ] **Internal-whitespace-collapse reuse** (`'trail  running'`, double space → existing
      `'trail running'`) — **blocking**, same reason, and the strongest of the two because no
      collation folds internal whitespace under any setting.
- [ ] Brand-new create: an unmatched name creates exactly one row and returns it. The negative control
      — without it, every reuse assertion above could pass against an implementation that returns some
      arbitrary row regardless of input.
- [ ] `wasRecentlyCreated` is `true` on the create path and `false` on the reuse path — the flag 0061
      will read instead of this story inventing a return shape (**D-10**).
- [ ] Blank and whitespace-only input are **refused before any lookup or insert**, and no row of any
      kind is created as a side effect. This is a sharper failure mode than `CreateBlogTag`'s: a
      find-or-create that validates *after* looking up could resolve two different whitespace-only
      inputs to one shared empty-named row, a false-positive success rather than a caught error
      (**R-2**).
- [ ] Over-length input is refused.
- [ ] **Concurrency**: with a colliding row pre-inserted directly via
      `DB::table('blog_tags')->insert(...)` (simulating another process winning the race between the
      lookup and the insert), `FindOrCreateBlogTag` **returns that existing row** — it does not throw,
      and it does not create a second. Assert the returned id equals the pre-inserted row's. This is
      the assertion that keeps `CreateBlogTag`'s `23000` → `ValidationException` catch from being
      copy-pasted into an action whose core case it would break (**D-10**).
      A genuinely simultaneous two-connection race is not reachable under `RefreshDatabase`'s
      single-transaction strategy, so the *mechanism* is simulated and the *outcome* is what is
      asserted.
- [ ] Two clearly-different names never collide — a sanity check on the normaliser's aggressiveness,
      so an over-folding regression fails here rather than silently merging unrelated tags.

**Feature — `tests/Feature/Policies/BlogTagPolicyTest.php`** (shape copied from
`tests/Feature/Policies/SalesRegionPolicyTest.php`)
- [ ] Every ability gets **both an allow and a deny test**, per
      [what-not-to-test.md](../../docs/testing/qa/what-not-to-test.md)'s authorization rule.
- [ ] A **narrowness** test per ability: an actor holding a *related but wrong* `blog.*` permission
      (e.g. `blog.view` when the ability under test is `create`) is still denied. This catches a policy
      that accidentally checks "any `blog.*` permission" instead of the exact string.
- [ ] A `Super Admin` actor is allowed through `Gate::before`, consistent with every other policy here.
- [ ] The permission names are asserted against `RolePermissionSeeder`'s seeded catalog (seed it and
      call `forgetCachedPermissions()` in `beforeEach`) — a permission string not in the catalog throws
      `PermissionDoesNotExist` at runtime, so this is a correctness test.

**Feature — `tests/Feature/Blog/FindOrCreateBlogTagAuthorizationTest.php`** — its own file because
**D-11**'s conditional ability is the story's one novel authorization shape, and it needs a dataset
rather than a pair:
- [ ] An actor holding `blog.view` **but not** `blog.create` **reuses** an existing tag successfully.
- [ ] The same actor is **refused** when the name does not exist (the branch that would insert).
- [ ] An actor holding `blog.create` succeeds on both branches.
- [ ] An actor holding neither is refused on both.
- [ ] The refusal on the create branch is an `AuthorizationException`, and **no row is written**.
- [ ] Every one of the four `Gate` refusal sites writes exactly one `Log::warning('Privileged action
      refused', …)` line carrying `target_type: 'blog_tag'`, set-equated against an existing screen's
      context keys in one `Log::spy()` session — the equivalence test
      [the refusal-logging recipe](../../docs/architecture/authorization.md#copyable-what-a-third-admin-screen-inherits)
      mandates as step 4 (**D-12**).

**Explicitly not tested here**
- `HasUuids` itself, Eloquent timestamps, or `Rule::unique`'s own SQL — framework/vendor behaviour per
  [what-not-to-test.md](../../docs/testing/qa/what-not-to-test.md).
- Migration `up()`/`down()` mechanics — `RefreshDatabase` proves every migration runs on every feature
  test; `down()` symmetry is a code-review concern.
- **Anything asserting a tag is detached from a post, or that `blog_post_tag` reflects a deletion.**
  There is no `blog_posts` table and no pivot; such a test would either fail to compile or, worse, get
  "fixed" by someone inventing a throwaway pivot to make it pass. Owned by 0061 (**R-6**).
- **No `arch()` placeholder for the taxonomy-independence scenario**, deliberately diverging from
  0023's **D-11**. That story could assert `ProductCategory` references no blog-taxonomy namespace
  because a second namespace was nameable; here there is no sibling table to assert *against* that
  0058/0061 will not create anyway, so an `arch()` rule would be the vacuous-assertion failure mode
  [the errors log](../../docs/errors-log.md#a-pest-arch-rule-over-an-array-of-namespaces-shipped-green-while-proving-nothing--2026-08-18)
  already records. Independence is honoured structurally (own table, own model, own action namespace,
  own policy) and stated in prose. Recorded as a deliberate departure, not an inconsistency.

## Expected outcome
A `blog_tags` table exists with a UUID v7 primary key and a unique, application-derived
`normalized_name`. A blog editor's create / rename / delete operations are available as three
invokable domain actions with shared, trait-held name validation, and a fourth — `FindOrCreateBlogTag`
— resolves a tag by name for any caller, reusing an existing tag whatever its case, accents or
whitespace, and creating one only when nothing matches. `BlogTagPolicy` expresses who may perform each
operation, and every action authorizes itself so a non-dashboard caller inherits the rule. Nothing is
user-visible yet: the management screen is 0060, and the posts that attach a tag are 0061.

## Acceptance criteria
- [ ] `blog_tags` exists with `id` (UUID v7 PK), `name`, `normalized_name` (unique), `created_at`,
      `updated_at` — and nothing else. There is **no** unique index on `name`.
- [ ] `normalized_name` is sized **wider** than `name`, and Phase 3 has recorded the measured
      worst-case `Str::ascii()` expansion that justifies the chosen widths (**R-4**). A max-length
      **accented** name round-trips through create and rename without a `22001`.
- [ ] `App\Models\BlogTag` uses `HasUuids`, exposes `name` as its only fillable attribute, derives
      `normalized_name` on every write that changes `name`, and does **not** use `SoftDeletes`.
- [ ] A tag can be created with a valid name; blank, whitespace-only, over-length and duplicate names
      are all refused with a validation message on `name`.
- [ ] A tag can be renamed; renaming onto another tag's name is refused, saving a tag under its own
      unchanged name is accepted, and a case-only self-rename is accepted.
- [ ] A tag can be deleted **unconditionally** — no in-use guard exists, and the row is really gone —
      and its name becomes immediately reusable.
- [ ] `FindOrCreateBlogTag` returns the existing tag for a name differing only by case, accents or
      whitespace, creates one only when nothing matches, never refuses on a name collision, and
      resolves a lost insert race to the winning row rather than throwing.
- [ ] Case-, accent- and whitespace-only duplicates are refused (or reused) via the shared
      `App\Actions\NormalizeForSearch` — no fold logic is inlined in `BlogTagValidationRules`, in any
      `app/Actions/Blog/` class or in the model, and no second normaliser is added to the tree.
- [ ] Authorization is expressed in `BlogTagPolicy` **and** enforced by each action itself, with both
      an allow and a deny test per ability plus a narrowness test.
- [ ] Every `Gate` refusal is logged through `LogRefusedPrivilegedAttempt` with `target_type:
      'blog_tag'`, set-equated against an existing screen's context keys.
- [ ] Blog tags share no table, model, or namespace with blog categories or product categories.
- [ ] No permission-catalog, route, `config/modules.php`, Livewire, view or `lang/` file is added by
      this story, and no pivot table or `blog_posts` column is created.

## Definition of Done
- [ ] Tests written and green, plus the full existing suite (per
      [contracts.md](../../docs/contracts.md)'s Full Test Suite Gate Rule).
- [ ] **All three quality gates run unscoped and each result recorded, including "not run"** —
      `php artisan test`, `vendor/bin/pint --format agent`, and `vendor/bin/phpstan analyse` (Larastan
      level 7). The third is the one nothing else prompts you to run; see
      [errors-log.md](../../docs/errors-log.md#a-verification-record-that-lists-two-of-three-quality-gates-is-a-record-of-two-gates--2026-08-26).
      **This story registers a model event, so its blast radius is the whole suite by construction** —
      the unscoped run is not optional here.
- [ ] Code reviewed (code-reviewer).
- [ ] No security findings (appsec-auditor).
- [ ] Documentation updated (docs-keeper): `docs/database/schema.md` gains a `blog_tags` section and an
      ER-diagram entry; `docs/conventions/base-standards.md`'s directory listing gains
      `app/Actions/Blog/`; `docs/architecture/authorization.md` gains `BlogTagPolicy` as the fourth
      policy. **And — the one this story is uniquely placed to close —
      [ADR 0001](../../docs/decisions/0001-uuid-primary-keys.md)'s "still future" entity list drops
      Blog Tags**, along with the matching bullet in `docs/database/schema.md`'s Notes. `blog_tags` is
      one of the ADR's seven *named* entities (unlike `sales_regions`, which needed a "beyond ADR
      0001" caveat), so this is the first story to close one of them cleanly.
- [ ] **Hand-off note recorded for 0060 and 0061** (a real obligation, not a formality):
      - **0060** (tag management UI) gives `BlogTagPolicy` its first *component* call site. It must
        authorize before opening each modal and keep the id fed to `->ignore()` server-authoritative
        (`#[Locked]` / re-read from the model), per
        [security/livewire-authorization.md](../../docs/security/livewire-authorization.md).
      - **0061** (blog posts backend) **must** create `blog_post_tag` with
        `foreignUuid('blog_tag_id')->constrained()->cascadeOnDelete()`. The exact constraint, and why
        copying `sales_regions`' `restrictOnDelete()` habit would silently contradict this story's
        shipped delete test, is **D-8**.
- [ ] Acceptance criteria met.

## Documented functional decisions

- **D-1 — Domain artifacts only; no Livewire component, route, view or sidebar entry.** The UI is
  story 0060; building a screen now would either sit unrouted and untested end to end, or invent a
  route the product owner has not asked for. This follows 0023's D-1 and the
  `RequestEmailChange`/`ConfirmEmailChange` precedent — this repo ships domain actions whose
  HTTP/Livewire boundary arrives in a different unit of work. Note this also means **no
  `config/modules.php` entry**: per
  [api/routes.md](../../docs/api/routes.md#app-owned-routes), a gated module route and its registry
  entry ship together, and this story ships neither.

- **D-2 — The name fold is the project's shared `App\Actions\NormalizeForSearch`, never a helper this
  story owns.** `trim` → `Str::lower` → `Str::ascii` → collapse whitespace, owned by story 0022 (D13)
  and already consumed by 0023 (D-12), 0026, 0032 (D-N1), 0033 and 0034. This story adds a seventh
  consumer and **no** new fold. Two obligations follow, both stated so a reviewer can check them
  mechanically: (i) `Str::lower()` or `Str::ascii()` appearing anywhere in this story's model,
  actions or validation trait is a review finding; (ii) a change to the normaliser is a
  **cross-story event** — for this table it is not merely a re-specification but a **data migration**,
  because `normalized_name` is *stored*, so every existing row's value would need recomputing. That is
  strictly heavier than 0023's consequence (where the fold is computed per-comparison and a change is
  free) and lands this story in the same bucket as 0032's `geography_entries.normalized_name`, whose
  D-N1 already calls a normaliser change "a re-seed event". Record it in the migration's own comment.

- **D-3 — Uniqueness is enforced on a stored `normalized_name` column carrying the `UNIQUE` index —
  **not** on `name`, and **not** by a PHP-only comparison behind a raw-`name` index.** This is the
  story's central design decision and its one deliberate divergence from the 0023 template, and both
  the `database-expert` and the `backend-expert` arrived at it independently. Four reasons, in
  descending order of how much they matter:

  1. **It closes a real TOCTOU window that 0023's shape leaves open.** In 0023, the authoritative
     check is a PHP closure folding every existing row, and the index is on the *raw* `name`. A PHP
     pre-flight check is **not a race guard** — this repo's own
     [signed-link-verification.md](../../docs/security/signed-link-verification.md#a-pre-flight-check-is-not-a-race-guard--re-check-under-a-lock-and-let-the-unique-index-have-the-last-word)
     says so for `pending_email`. Two concurrent requests submitting "running" and "Running" both pass
     their pre-flight (neither exists byte-for-byte yet), both insert, and a raw-`name` index does not
     catch it because the two strings are byte-distinct. With the index on `normalized_name`, both
     normalise to `running` and the database refuses the second. For `product_categories` — an
     occasional admin form — that window is a tolerable residual. For a tag catalog written
     concurrently from *every post save*, it is a live defect.
  2. **The index and the application agree on "the same name" by construction.** Both compare the
     output of the identical `NormalizeForSearch` call, so there is no second definition to drift from
     the first. 0023's D-4 has to *require* that the PHP fold be "at least as aggressive as
     `utf8mb4_unicode_ci`" precisely because its two layers use two different rules; that requirement
     simply does not arise here.
  3. **It is the indexed read path story 0063's autocomplete needs.** The post editor's tag field
     queries on every keystroke. `WHERE normalized_name LIKE 'term%'` against a real BTREE index is
     the shape [0032's `geography_entries`](0032-shipping-geography-catalog-seed.md) was designed
     around for the identical reason — and the `UNIQUE` index serves both the constraint and the
     prefix scan, so no second index is needed. Folding every row in PHP per keystroke is not a
     viable read path.
  4. **It removes the CI/production engine question from the uniqueness rule entirely** — see **D-13**,
     which corrects a stale premise this story would otherwise have inherited.

  **`unique('name')` is dropped, not kept alongside.** It is not harmless redundancy: any two rows
  colliding on `name` also collide on `normalized_name` (identical strings normalise identically), so
  it protects nothing, while costing a second index write per insert and creating a *second*,
  collation-dependent notion of duplicate that can disagree with the first. One uniqueness rule, one
  index.

- **D-4 — `normalized_name` is derived by a `saving` model event, not by each action.** This is new to
  this codebase and is recorded as a deliberate choice rather than nodded through — the
  `backend-expert` proposed it and explicitly asked for a decision; every prior precedent
  (`sales_regions.slug`, 0032's `geography_entries.normalized_name`) computes such a column at the
  point of writing, in a seeder or an action.

  **Decision: adopt the model event.** The deciding argument is one this repo has already written
  down for a structurally identical problem —
  [security/authorization-patterns.md](../../docs/security/authorization-patterns.md)'s task-0010
  rule that **an identity derived from a mutable column must be locked at the model layer as soon as
  code exists that can mutate it.** `normalized_name` is exactly that: derived from the mutable
  `name`, and this story ships **three** independent writers of `name` (`CreateBlogTag`,
  `RenameBlogTag`, `FindOrCreateBlogTag`), with a fourth arriving in 0061 if a post save ever creates
  a tag inline. "Every writer remembers to recompute it" is a convention among callers; the hook is an
  enforcement. Getting it wrong is silent and severe — a stale `normalized_name` makes a tag
  simultaneously undiscoverable by search and invisible to the uniqueness rule, while the row looks
  perfectly correct in any UI.

  Three constraints that come with it:
  - **`booted()`, not `boot()`** — and the reason `App\Models\Role` uses `boot()` (vendor-hook
    ordering on a subclassed package model) does not apply to a class extending `Model` directly.
    Do not copy that workaround here.
  - **Guard on `isDirty('name')`**, so an unrelated save does not rewrite the column, and so the
    invariant is expressed as "recompute when the source changes" rather than "recompute always".
  - **The blast radius is the whole suite.** A model event binds every `BlogTag` in every test, which
    is precisely the case
    [errors-log.md](../../docs/errors-log.md#both-of-this-projects-per-change-quality-gates-are-scoped-by-default-and-both-silently-passed--2026-08-20)
    records — so the unscoped `php artisan test` run is mandatory, not advisory.

  **Recorded alternative, rejected:** each action computes and `forceFill`s it explicitly, matching
  0023/0032 exactly. Rejected because it re-splits one invariant into three implementations, the exact
  drift D-2 and D-3 exist to prevent — but it is a clean fallback if Phase 2 rejects the hook, at the
  stated cost.

- **D-5 — Hard delete; `BlogTag` does not use `SoftDeletes`.** 0023's D-3 reasoning transfers, and one
  of its three points transfers **inverted**, which makes the case here stronger rather than weaker:
  - (i) `Rule::unique()` does **not** apply the soft-delete scope, so a trashed "running" would squat
    its `normalized_name` forever, blocking legitimate re-creation *and* breaking find-or-create.
  - (ii) **A soft delete would silently break the PRD requirement itself.** A soft delete is an
    `UPDATE` stamping `deleted_at` — never a real `DELETE` — so the `cascadeOnDelete()` FK on
    `blog_post_tag.blog_tag_id` (**D-8**) **would not fire**. Every post would keep the association
    live while the tag became invisible everywhere else: the exact opposite of "removed from every
    post that used it", and silently, since nothing errors. It would also force `DeleteBlogTag` to
    reintroduce an explicit `$tag->posts()->detach()` — the redundant app-side code D-8 exists to make
    unnecessary. So this is not "soft delete buys nothing"; it is "soft delete actively fights the one
    behaviour this story is required to produce".
  - (iii) 0023's third point (a count-based in-use gate works identically against either) is **moot**
    here rather than applicable — there is no such gate (**D-8**).

  PRD assumption 17 rules out the audit/recycle-bin class of feature this phase, which is the only
  thing that would argue the other way.

- **D-6 — No `slug`, no `description`, no `sort_order`, no `usage_count`.** None appears in Epic 4's
  tag scenarios or acceptance criteria. A `slug` becomes necessary only if a public tag-archive route
  (`/blog/tag/{slug}`) appears — explicitly out of scope per PRD's
  [Out of scope](../../docs/PRD/PRD.md#out-of-scope) ("public storefront filtering/browsing of blog
  posts by category or tag"), and a cheap additive migration if Epic 4's public surface ever changes
  that. Ordering is `ORDER BY name` at query time. A denormalised usage count is deliberately not
  stored: it would need maintaining from the pivot, which does not exist yet, and `withCount('posts')`
  is the shape `Roles\Index` already uses for the same need.

- **D-7 — Renaming onto an existing tag's name is refused, not merged.** PRD scripts no merge, and
  merge is **unbuildable in this story**: it means reassigning every `blog_post_tag` row from source to
  target inside a transaction, against a table 0061 owns. So refuse is not merely the chosen answer,
  it is the only implementable one, and the refusal is identical in shape to `CreateBlogTag`'s
  duplicate refusal (a `ValidationException` on `name`).

  **Recorded for the product owner rather than silently decided:** if merge-on-rename is wanted, it is
  a **new story scoped against `blog_post_tag`**, not a retrofit here — merge and refuse are materially
  different operations (one touches two tables transactionally, one touches none), not two branches of
  one guard. Flagged as **OQ-4**.

- **D-8 — Delete is unconditional, and `DeleteBlogTag` is complete as shipped. This is the story's
  structural difference from every taxonomy story before it.** PRD's own Gherkin says deleting a tag
  *"is removed from every post that used it"* — there is no hard block, no count, no
  reassign-first requirement. Contrast blog **categories** (story 0058), which PRD hard-blocks with a
  count, exactly as [0023](done/0023-product-categories-backend.md) defers its in-use guard to [0024b](0024b-product-category-in-use-delete-guard.md).

  So where `DeleteProductCategory` exists as its own file *specifically so a later story can extend
  it*, `DeleteBlogTag` exists as its own file and **no later story extends it**. Its body is a bare
  instance `$blogTag->delete()`, today and permanently.

  **That is only safe because of a constraint story 0061 must honour**, and it is written into the
  action's own docblock as a load-bearing cross-story promise rather than left in this file:

  ```php
  // app/Actions/Blog/DeleteBlogTag.php
  /**
   * Deletes unconditionally -- there is no in-use guard, by design (story 0059, D-8).
   *
   * PRD Epic 4 requires that deleting a tag removes it from every post that
   * used it. That is honoured by the DATABASE, not here: story 0061's
   * blog_post_tag pivot MUST declare
   *
   *     $table->foreignUuid('blog_tag_id')->constrained()->cascadeOnDelete();
   *
   * Do NOT copy sales_regions.parent_id's restrictOnDelete() habit onto that
   * column. restrictOnDelete() is correct there because a child row carries
   * independently-configured data a cascade would destroy; a blog_post_tag row
   * carries no state of its own and is worthless once either side is gone --
   * the passkeys.user_id case, not the sales_regions.parent_id one. A
   * restricting FK would turn every in-use tag deletion into a database error,
   * silently contradicting this story's shipped test that an in-use tag
   * deletes successfully.
   */
  ```

  The expected pivot shape, for 0061 to build (**not** built here):

  ```php
  Schema::create('blog_post_tag', function (Blueprint $table): void {
      $table->foreignUuid('blog_tag_id')->constrained()->cascadeOnDelete();
      $table->foreignUuid('blog_post_id')->constrained()->cascadeOnDelete();
      $table->primary(['blog_tag_id', 'blog_post_id']);
  });
  ```

  Both sides cascade (a pivot row is worthless without either parent); the composite primary key
  matches `role_has_permissions`, this repo's existing pivot precedent, and no surrogate `id` is
  needed. **Neither column gets an explicit `$table->index()`** per
  [migrations.md](../../docs/database/migrations.md#an-fk-column-does-not-also-get-an-explicit-index-here)
  — `blog_tag_id` is covered as the PK's leftmost column and `blog_post_id` gets InnoDB's mandatory FK
  index automatically; 0061 confirms with `php artisan db:table blog_post_tag`, never by reading the
  migration. Neither table name needs an explicit argument to `constrained()` (unlike
  `sales_regions`' self-reference) — Laravel infers both correctly.

  **Why the cascade rather than an app-side `detach()` in this action:** it would be a second
  implementation of one rule — the drift this project's conventions spend most of their effort
  preventing — and it would be strictly worse, since the FK does it in the same statement rather than
  as a preceding round trip. The database is the single source of truth for "deleting a tag removes it
  from every post".

- **D-9 — Two name-rule methods, because create and find-or-create disagree about what an existing
  name means.** `nameRules()` carries the uniqueness rule and is used by `CreateBlogTag` /
  `RenameBlogTag`, where a name collision is a **refusal**. `nameFormatRules()` carries format only
  and is used by `FindOrCreateBlogTag`, where a name collision is a **hit**. This is the single most
  important structural fact about the trait: a `FindOrCreateBlogTag` that reached for `nameRules()`
  would refuse its own primary use case, and the failure would look like a validation bug rather than
  a design error. The unit test asserting `nameFormatRules()` carries no uniqueness rule exists to
  keep the two from being "unified" later.

  Note the naming follows
  [naming.md](../../docs/conventions/naming.md#traits-and-their-methods)'s rule that a `<noun>Rules()`
  method's noun is the **field**, not the model — hence `nameRules()`, not `blogTagNameRules()`.

- **D-10 — `FindOrCreateBlogTag` returns a `BlogTag`, never refuses on a name match, and resolves a
  lost race by re-fetching rather than throwing.** The shape:

  ```php
  public function __invoke(string $name): BlogTag
  ```

  Four semantics, each a decision:
  - **Return type is a plain `BlogTag`.** No tuple, no `wasCreated` flag — Eloquent already exposes
    `$tag->wasRecentlyCreated` on the instance, so inventing a return shape for a fact the framework
    tracks would be a contract 0061 has to destructure for no gain.
  - **It validates format, never uniqueness** (**D-9**).
  - **The lookup key is `normalized_name`**, computed from the trimmed input via the shared
    normaliser — the same column the unique index guards (**D-3**), so the check and the constraint
    cannot disagree.
  - **A `23000` on insert is caught and re-queried, returning the winning row.** This is the one place
    this story deliberately diverges from `CreateUser`'s established `23000` handling: `CreateUser`
    *refuses* a duplicate as a `ValidationException`, which is correct for a create; a find-or-create
    that did the same would throw on the exact case it exists to serve. Losing the race is not a
    refusal — it means someone else already created what the caller asked for, which is a success.
    Recorded explicitly because copying the sibling action's catch block verbatim is the obvious
    mistake, and it would only surface under concurrency.

  No `DB::transaction()` wrapper: the race is closed by the unique index plus the catch, and a
  transaction would neither prevent the collision nor change the resolution. Per
  [errors-log.md](../../docs/errors-log.md#wrapping-existing-code-in-a-dbtransaction-moved-a-cache-flush-nobody-had-written--2026-08-21),
  a transaction wrapper is a change to every side effect the wrapped code performs and is not added
  speculatively.

- **D-11 — Tag CRUD gates on the already-seeded `blog.*` permissions, and `FindOrCreateBlogTag` asks a
  *different ability per branch*.** The first half is settled by existing documentation rather than
  decided here: [architecture/authorization.md](../../docs/architecture/authorization.md) states that
  granularity is *"deliberately coarse per module: `products.*` covers categories and variants,
  `blog.*` covers categories and tags"*. `RolePermissionSeeder::MODULES` already contains `blog`, so
  all four permissions exist today with **zero** seeder change and zero re-seed fallout. There is no
  `blog-tags.*` slug and inventing one would be a catalog change, not a component detail.

  The second half is the story's one genuinely novel authorization shape, and it is recorded as a
  decision needing explicit confirmation (**OQ-3**) rather than assumed:

  | `FindOrCreateBlogTag` branch | Ability asked | Why |
  | --- | --- | --- |
  | The name matches an existing tag → reuse | `viewAny` (`blog.view`) | A pure lookup. Nothing in the tag catalog is written. |
  | The name matches nothing → insert | `create` (`blog.create`) | A real mutation to shared taxonomy — the same operation `CreateBlogTag` performs, so it asks the same ability. |

  **Why not one fixed ability up front.** Gating the whole action on `blog.create` would block an
  actor holding `blog.edit` but not `blog.create` from *attaching an already-existing tag* to a post
  they are otherwise entitled to edit — a plausible role shape in this app (PRD's own epics
  repeatedly exercise partial CRUD grants), and one that reads as a bug to the person hitting it
  ("why can I edit this post but not add an existing tag to it?"). Gating everything on `blog.view`
  would let a view-only actor mint taxonomy rows.

  **One objection considered and answered, since it is the first thing an auditor will ask:** does the
  branch-dependent refusal leak whether a given tag exists? Formally yes — an actor without
  `blog.create` gets success for an existing name and a refusal for a new one. It discloses nothing,
  because reaching either branch requires `blog.view`, which is precisely the permission to read the
  whole tag catalog. The oracle answers a question the actor may already ask directly. Had the reuse
  branch been gated on something *weaker* than catalog read access, this would be a real finding.

  **The recorded alternative** — always require `blog.create` up front, one line, simpler — is
  defensible if the product owner would rather no partial-grant role ever attaches tags. Either answer
  is acceptable; what is not acceptable is letting it fall out of whichever screen gets built first.

  `FindOrCreateBlogTag` deliberately asks **nothing** about posts. The caller (0061's post-save flow)
  independently authorizes "may I write this post", exactly as `SetSalesRegionActive` authorizes its
  own two rows without knowing which screen called it.

- **D-12 — Every action authorizes itself, and every refusal is logged.** All four actions call the
  policy as their own first statement, before reading or writing anything, following
  [`app/Actions/SalesRegions/`](../../app/Actions/SalesRegions/) — **not** 0023's D-9, which
  deliberately shipped its actions unauthorized with a hand-off note. That was an explicit, accepted
  gap at the time; the convention it deviates from
  ([base-standards.md](../../docs/conventions/base-standards.md#an-authorization-rule-belongs-to-the-action-not-to-one-of-its-callers))
  has since been reinforced twice, and task 0017 demonstrated it "cost nothing when applied at Phase
  1". The case here is *stronger* than 0023's: `FindOrCreateBlogTag` has **two independent callers by
  design** (0060's screen, 0061's post save), which is precisely the "operation reachable from more
  than one place" scenario the convention names. A rule living only in 0060's component would be
  inherited by nothing.

  The component authorizing too (0060) is **defence in depth, not duplication to remove** — it fails
  fast before a transaction opens and makes the per-row `canEdit`/`canDelete` hints honest.

  Refusal logging follows the
  [third-admin-screen recipe](../../docs/architecture/authorization.md#copyable-what-a-third-admin-screen-inherits)
  verbatim: every `Gate` refusal routes through `LogRefusedPrivilegedAttempt::authorize()` with
  `target_type: 'blog_tag'` passed **explicitly** (the recipe records that `resolveTarget()`
  auto-resolves only `User` and `Role`, so a new domain must pass it), and step 4's cross-screen
  equivalence test pins the shape. Step 3 (the log ceiling) has no occasion here — none of these
  actions carries a rate limiter, and none is shared with an unprivileged caller. **Worth stating
  because it will be true in 0061 and false thereafter:** if a later story lets an *unauthenticated*
  or self-service path reach `FindOrCreateBlogTag`, step 3 becomes mandatory, for exactly the reason
  [errors-log.md](../../docs/errors-log.md#a-scope-exclusion-named-screens-while-the-story-edited-a-class-those-screens-share--2026-08-24)
  records — an unbounded side effect on a shared class is a capability grant to its *least*-privileged
  caller.

- **D-13 — 0023's R-2 (the CI/production engine split) is STALE and is not inherited.** This story
  would otherwise copy a risk that no longer exists, so it is recorded as a correction rather than
  silently dropped. 0023's whole D-4 argument rests on *"the suite runs on SQLite in CI and MySQL
  locally"* — verified true when written. It is **false at `HEAD`**, and was closed on 2026-08-26 by
  [`ci-database-connection-gap.md`](ci-database-connection-gap.md). Re-verified for this story:

  | File | Value |
  | --- | --- |
  | `phpunit.xml` | `<env name="DB_CONNECTION" value="mysql"/>` |
  | `.env.example` | `DB_CONNECTION=mysql` |
  | `.github/workflows/tests.yml` | `services.mysql: image: mysql:8.4`, job-level `DB_CONNECTION: mysql` |

  CI, local and production now all run MySQL 8.4 with `utf8mb4_unicode_ci`. **What this changes:** the
  "a collation-backed rule is literally a different rule in the two places" argument no longer
  applies, so it must not be repeated in this story's own reasoning. **What it does not change:** the
  app-level normalised comparison is still the primary guard and the index still the backstop — that
  is the same defence-in-depth relationship [schema.md](../../docs/database/schema.md#users) documents
  for `pending_email`, and it holds regardless of engine parity, because relying on collation alone
  couples a correctness rule to a column setting nothing in `app/` protects. **D-3** stands on its own
  four arguments, none of which is the engine split.

  This is [the deferred-findings rule](../../docs/errors-log.md#a-deferred-storys-findings-were-claims-about-a-tree-that-no-longer-existed-and-one-of-them-would-have-reopened-a-bug-in-this-log--2026-08-23)
  applied at Phase 1 rather than at Phase 2: a premise inherited from a sibling task file is a claim
  about a tree, and it was re-verified before being carried.

- **D-14 — `normalized_name` keeps the connection's default `utf8mb4_unicode_ci` collation; no
  `utf8mb4_bin`.** Considered, because a binary collation would make the index enforce *exactly* the
  rule PHP computes, closing a theoretical gap: `utf8mb4_unicode_ci` folds some code points that
  `Str::ascii()` leaves distinct, so two values PHP considers different could still collide at the
  index and raise a `23000` the application did not predict.

  **Not adopted**, for three reasons. (i) That residual is *benign in direction* — the looser index can
  only ever merge more aggressively than PHP, and for a tag catalog "two near-identical tags collapsed
  into one" is the desired direction of error, not the dangerous one. (ii) Both actions already handle
  a `23000` correctly for it: `CreateBlogTag` surfaces a `ValidationException` on `name` (honest — the
  name *is* taken as far as the catalog is concerned), and `FindOrCreateBlogTag` re-queries, which
  **finds** the winning row precisely because the same loose collation makes the lookup match. (iii)
  Introducing a non-default column collation is a new pattern in this schema needing its own
  justification, and it would diverge from `geography_entries.normalized_name`, which this table is
  otherwise modelled on. Recorded so a future auditor sees a decision rather than an oversight.

### Scope fences: what this story must NOT do
- No `blog_posts` table, no `blog_post_tag` pivot, no FK, no `posts()` relationship method on
  `BlogTag` (story 0061).
- No app-side detach logic in `DeleteBlogTag` — the cascade is the mechanism (**D-8**).
- No in-use / hard-block-with-count delete guard. Unlike blog **categories** (0058), tags have none,
  ever.
- No merge-on-rename (**D-7**).
- No blog **categories** table, model or action — story 0058, a sibling in the same `app/Actions/Blog/`
  folder. This story must not create, rename or restructure anything 0058 owns.
- No new permission module slug and no `RolePermissionSeeder` change.
- No Livewire component, route, `config/modules.php` entry, or Blade view.
- No `lang/en|es/*.php` file — no UI copy is owned here; core `validation.php` messages suffice.
  (0060 owns the screen's copy.)
- No slug, description, sort order, usage count, translations table or any other i18n scaffolding.
- No second text normaliser and no local fold helper: `App\Actions\NormalizeForSearch` is consumed
  as-is and is neither created nor modified here **unless OQ-2 resolves the other way**.

## Dependencies, risks and open questions

### Dependencies
- **`App\Actions\NormalizeForSearch`, owned by story 0022** — a *file*-level dependency and this
  story's one real sequencing question. It does not exist in the tree. See **OQ-2**.
- **Story 0058 (blog-categories-backend)** shares `app/Actions/Blog/` and was written in parallel with
  this story on the same day. It landed while this file was being composed, and **was read rather than
  assumed** — with two results worth recording, because they point in opposite directions:

  **Agreement, confirmed (no reconciliation needed).** 0058 specifies a standalone
  `App\Policies\BlogCategoryPolicy` — one model, one policy, four abilities, permission names as
  `public const` following `SalesRegionPolicy`, and actions that authorize themselves. That is
  independently the same set of answers this story reached, so `App\Policies\BlogTagPolicy` is now
  **confirmed** rather than merely defaulted. 0058's **D-9(a)** additionally supplies a stronger
  argument than either was asked for, and it should be treated as settling the question for 0061 too:
  a shared `BlogPolicy` spanning categories, tags and posts is auto-discoverable for **none** of them
  and would require reintroducing the `AuthServiceProvider` this repo deliberately does not have.

  **A divergence that existed and has since been closed — see OQ-5.** When this file was first
  composed, 0058 specified `$table->unique('name')` with the comparison in PHP (0023's shape) against
  this story's `$table->unique('normalized_name')`. 0058 has since been revised to the stored-column
  shape and now carries `$table->string('normalized_name', 255)->unique()` with no `unique('name')`,
  citing 0032's **D-N1** as the project-wide convention. **Re-verified by reading 0058's migration
  snippet directly, not taken on report.** The two stories now agree, and the shared design is
  recorded in both.

  One inherited defect travelled with it, and is 0058's to fix rather than this story's: 0058 sizes
  `name` and `normalized_name` **both** at 255, which is the equal-width case **R-4** identifies as
  unsafe under `Str::ascii()`'s transliteration. Flagged to whoever owns 0058.
- **Story 0060 (`blog-tags-ui`)** is the management screen that gives `BlogTagPolicy` its first
  component call site, and **story 0061 (`blog-posts-core-crud-backend`)** is the second consumer of
  `FindOrCreateBlogTag` and the owner of the pivot contract in **D-8**. Per
  [workflow.md](../../docs/workflow.md#task-ordering-rule)'s ordering rule, this story's lower id is
  deliberate: both depend on it, and it depends on neither.
- Depends only on what is already shipped otherwise: `spatie/laravel-permission` wired to `User` with
  the seeded catalog (0002), the `Gate::before` Super Admin bypass, policy auto-discovery (0004), and
  `LogRefusedPrivilegedAttempt` (0015b).

### Risks
- **R-1 — The `->ignore()` omission.** Without it, saving a tag under its own unchanged name fails.
  Caught by the dedicated three-test rename-to-own-name block, plus the case-variant self-rename test
  that only this story needs (0023's version cannot exercise it, since its uniqueness rule reads a
  different column).
- **R-2 — Whitespace slipping through `required`.** `'   '` is *present* to Laravel, so without an
  explicit trim a whitespace-only tag persists. Sharper here than in 0023: in `FindOrCreateBlogTag`,
  two different whitespace-only inputs both normalise to `''` and the second would *reuse* the first's
  empty-named row — a false-positive success rather than a caught error. Caught by asserting the
  refusal happens **before** any lookup or insert, and that no row is created as a side effect.
- **R-3 — A `saving` hook that fires only on insert.** A rename would leave `normalized_name` pointing
  at the old name: the tag becomes undiscoverable by search *and* invisible to the uniqueness rule,
  while looking perfectly correct in any list. Caught by asserting derivation on **both** the insert
  and the rename path, as two separate tests.
- **R-4 — The three length constraints drifting apart — and `normalized_name` must be WIDER than
  `name`, not equal to it.** The validation `max:` and `name`'s column length are both 100 (**OQ-1**);
  if either moves without the other, a validation refusal becomes a `22001`. That much is the
  ordinary version of this risk. The non-obvious half, and the reason this story sizes
  `normalized_name` at **255** against a 100-character `name`:

  **`App\Actions\NormalizeForSearch` can produce output longer than its input.** Its pipeline ends in
  `Str::ascii()`, which **transliterates** rather than mapping one code point to one character —
  the commonly cited example is German `ß` → `ss`, and a Spanish-language catalog is exactly the
  input class where accented and ligatured characters arrive constantly. So a `name` sitting at the
  maximum length can fold to a `normalized_name` that does not fit an equally-sized column. Sizing
  the two columns identically — the shape this story shipped in its first draft, and the shape sibling
  story **0058** currently carries at `255`/`255` — leaves that case open in both.

  **What actually happens on overflow, stated accurately rather than assumed.**
  [`config/database.php`](../../config/database.php) sets `'strict' => true` on both MySQL
  connections, so an over-long insert raises a **`22001` "Data too long"** error — it does **not**
  silently truncate. That is fail-closed and therefore better than corruption, but it is still a real
  defect: a legitimate, in-policy tag name crashes the save, and it does so only for accented input,
  which is the input this product is full of and the input an English-language test fixture never
  produces. Note the fail-closed behaviour is a **config-dependent** property — with `strict` off, the
  same case becomes a silent truncation of the uniqueness key, which is the genuinely dangerous
  version.

  **Mitigation, in two parts, because headroom alone is a guess.**
  1. **Shipped now:** `normalized_name` is `255` against a `100` `name` — 2.55× headroom, costing
     nothing (utf8mb4 `VARCHAR(255)` is a 1020-byte index key, well inside InnoDB's 3072-byte DYNAMIC
     limit, and this is a small table).
  2. **Required of Phase 3, not optional:** measure the real worst-case expansion **by executing
     `Str::ascii()`** against a max-length input built from the highest-expansion characters
     available, and confirm the result fits. **The exact expansion factor is deliberately NOT stated
     as fact anywhere in this file** — `vendor/` is absent from this worktree, so it could not be
     verified here, and this project's
     [standing rule](../../docs/errors-log.md#a-reviewers-correction-replaced-an-accurate-technical-explanation-with-a-wrong-one-unverified--2026-08-24)
     is that an unverified mechanism written up confidently is worse than an open question written up
     plainly. Treat "`ß` → `ss`, therefore roughly 2×" as the *hypothesis to test*, not the answer.
  3. **If that measurement shows any in-policy input can still overflow, do not just grow the
     column** — bound the **normalized** value in validation, so the rule guarantees the fit instead
     of a cushion hoping for it. A `max:` that bounds only the *raw* input can always be defeated by
     a sufficiently expansion-heavy string; a bound on the fold cannot. Growing the column is the
     cheaper fix and is fine if the measurement says it suffices, but it is a cushion, not a
     guarantee, and the file should say which one shipped.

  A companion test belongs with whichever answer lands: a max-length **accented** name round-trips
  through create *and* rename without a `22001`. An ASCII-only length-boundary test cannot fail here
  no matter how wrong the sizing is, which is why the existing boundary pair does not cover this.

  **This applies to 0058 identically** (same normaliser, same equal-width columns, same Spanish input)
  and to 0023/0032 if they adopt the stored-column shape. Flagged here rather than fixed there —
  editing a sibling story's file is not this story's to do.
- **R-5 — Faker uniqueness is not database uniqueness.** `fake()->unique()` guards within a Faker
  instance, not against a literal name a test seeded itself. Any test needing a distinct name passes
  it explicitly.
- **R-6 — The PRD scenario this story cannot fully test.** *"Removed from every post that used it"* is
  half-unassertable here, and the mitigation is **not** a placeholder test — it is (a) the docblock
  promise in **D-8**, (b) the explicit hand-off in the Definition of Done, and (c) a required test in
  0061 asserting the cascade against a real pivot. The residual risk is real and named: if 0061 is
  written by someone who does not read `DeleteBlogTag`'s docblock and copies `sales_regions`'
  `restrictOnDelete()` habit, this story's own "delete succeeds" test still passes (no pivot in its
  fixtures) while production deletes start failing with an FK error. That is why the constraint is
  written where 0061's author will be reading — in the action they are integrating with — rather than
  only in this file.
- **R-7 — `nameRules()` reused asymmetrically.** A nullable-id rule helper whose `$id` is threaded
  through on one call path but not the other fails silently in one direction only. Caught by
  re-asserting the full validation depth on the rename path independently.
- **R-8 — A collation-only implementation passes the case and accent tests for the wrong reason, and
  this is the story's most likely false-green.** `utf8mb4_unicode_ci` is itself case- *and*
  accent-insensitive, exactly as
  [schema.md](../../docs/database/schema.md#roles-permissions-model_has_roles-model_has_permissions-role_has_permissions)
  documents for `roles.name`. So an implementation that skips `NormalizeForSearch` entirely — storing
  `normalized_name` as a verbatim copy of `name`, or looking up on `name` — **still passes** every
  case-only and accent-only assertion, because MySQL folds both at the index and in the `WHERE`
  clause. The tests would be green and the normaliser decorative.
  **Mitigation, and it is the reason two test cases are marked blocking:** no collation folds
  **whitespace**. `'  running  '` and `'trail  running'` (double space) match their canonical forms
  under *no* MySQL collation setting — only an explicit `trim` + collapse-whitespace fold reaches
  them. Those two assertions are the only ones in the suite that prove `NormalizeForSearch` is in the
  call path at all; treat them as load-bearing rather than as filler, and do not let a Phase 3
  simplification drop them for redundancy with the case tests.

### Open questions

Five, none blocking Phase 1 — but **OQ-5 blocks Phase 3 for more than one story** and is the one to
read first. Each carries a recommendation, per
[contracts.md](../../docs/contracts.md)'s Uncertainty Handling Rule.

- **OQ-5 — Is a user-typed taxonomy name deduped by a `unique(name)` index plus a PHP comparison, or
  by a stored, indexed `normalized_name`? RESOLVED for Epic 4; still open for 0023.** Re-verified
  against the real files rather than inferred, after 0058 was revised:

  | Story | Shape | Status |
  | --- | --- | --- |
  | 0023 (product categories) | `unique('name')` + PHP fold | specified, not implemented — **not yet aligned** |
  | 0032 (shipping geography) | stored `normalized_name` (**D-N1**) | specified, not implemented — the originating precedent |
  | 0058 (blog categories) | stored `normalized_name`, no index on `name` | **revised to align** |
  | 0059 (blog tags — this story) | stored `normalized_name`, no index on `name` | as specified |

  The stored-column shape is the project's standing convention, established by **0032's D-N1** and now
  carried by both Epic 4 taxonomy stories. What this story reached independently (**D-3**) turns out
  to be the convention rather than a divergence from it — 0023 is the outlier, and it is the outlier
  because it predates D-N1.

  **Remaining recommendation: align 0023 too (recommended)**, since **D-3**'s reasoning is not
  tag-specific — the TOCTOU window it closes exists in `product_categories` identically. One honest
  qualification, unchanged: the *hot-read-path* argument (**D-3**, reason 3) is genuinely stronger for
  tags than for either category taxonomy, since only tags get a per-keystroke autocomplete, so 0023's
  case rests on the race window and on consistency rather than on read performance. **None of these
  has shipped**, which is why it is worth doing now: aligning them today is a task-file edit; after
  Phase 3 it is a migration against live data.

  **Not this story's decision to make** — it belongs to 0023 — so it stays escalated rather than
  resolved here. Whichever way it goes, record it in that file.

  **Carry R-4 with the shape wherever it is adopted.** Both 0058 and 0032 size `name` and
  `normalized_name` equally; **R-4** explains why the normalized column needs headroom above the raw
  one, and that correction has to travel with the convention rather than being rediscovered per story.

- **OQ-1 — Maximum tag name length: 100 or 255?** The two experts disagreed, and it is a
  product-facing call rather than a purely technical one.
  **Recommendation: 100 (recommended).** `database-expert`'s argument: a tag is a short label typed
  into an autocomplete (`running`, `web development`), categorically unlike a category name or an
  email address, so 100 is generous headroom while keeping the row and the unique index tight —
  and this table carries the length on **two** columns, so the saving doubles.
  Against: 0023's **D-5** settled on 255 for `product_categories` on consistency grounds
  (`users.email` is already a `VARCHAR(255)` carrying a unique index), and `backend-expert` proposed
  the same here. The counter-argument to consistency is that D-5's own reasoning is about a
  *free-text human label with no natural maximum*, which a tag is not.
  Either answer is safe **for `name`**; what matters is that the validation `max:` moves with it, and
  that `normalized_name` keeps real headroom **above** whichever number is chosen rather than matching
  it — see **R-4**, which is the constraint that actually binds here. Note this makes OQ-1 narrower
  than it first looks: it decides `name` and the `max:` rule only, not the width of the uniqueness
  column. Confirm at Phase 2.

- **OQ-2 — Who creates `App\Actions\NormalizeForSearch`?** It does not exist in the tree, story 0022
  owns it, and 0022 is not in `ai-spec/tasks/` at all in this worktree. 0023 and 0032 carry the
  identical dependency and left the same question open. This is a genuine sequencing blocker for
  Phase 3, not a footnote, and `backend-qa` raised it as a dissent worth recording.
  **Recommendation: whichever of 0022 / 0023 / 0032 / 0059 reaches Phase 3 first creates
  `app/Actions/NormalizeForSearch.php` plus `tests/Unit/Actions/NormalizeForSearchTest.php` to 0022's
  D13 spec verbatim, and the others consume it unchanged (recommended)** — rather than blocking 0059
  on 0022, which would serialise four stories behind one widget for a four-line pure function.
  The invariant is non-negotiable either way: **exactly one normaliser exists in the tree**, matching
  D13's four steps. **What must not happen under time pressure is a local fold "just for now"** —
  that is precisely the mistake 0023 made and had to retrofit via its own D-12 amendment, and
  retrofitting it is a cross-story event that re-specifies every consumer's comparison behaviour at
  once. If Phase 2 prefers the other order, say so explicitly in writing.

- **OQ-3 — Should `FindOrCreateBlogTag` ask a different ability per branch (**D-11**)?**
  **Recommendation: yes, the conditional shape (recommended)** — `blog.view` to reuse, `blog.create`
  to insert. It is the only shape that does not either block a post editor holding `blog.edit` from
  attaching an existing tag, or let a view-only actor mint taxonomy rows. The existence-oracle
  objection is answered in **D-11** (the actor already holds catalog read access).
  The alternative — always require `blog.create` up front — is simpler and defensible if the product
  owner prefers that no partial-grant role ever attaches tags. This is **user-visible behaviour**, so
  it needs a deliberate answer rather than an inherited one; `backend-expert` explicitly asked for
  sign-off rather than baking it in.

- **OQ-4 — Confirm the case/accent-insensitive dedup policy is right for *editorial* content.**
  This story inherits D-12's project-wide fold, which was tuned for a fixed product catalog and a
  seeded geography catalog. `database-expert` flagged that a blog editorial team may have different
  tolerance for near-duplicate tags.
  **Recommendation: yes, keep it (recommended)** — "Running" and "running" are one tag to an editor,
  which is exactly what PRD's own reuse scenario describes, and a tag catalog that accumulates
  case-variant near-duplicates is the failure mode the create-on-the-fly feature would otherwise
  produce at speed. Worth one line of confirmation rather than silent inheritance, because the
  accent half has a real product consequence for a Spanish-language store: "Niño" and "Nino" cannot
  coexist as two tags.
  Related and already decided rather than open: whether renaming onto an existing name merges or
  refuses (**D-7** — refuses, because merge is unbuildable here); a future merge story is scoped
  against 0061.

## Provenance
Phase 1 (Three Amigos) debate run on 2026-08-27 with `backend-expert` (files, action shapes, the
find-or-create semantics and the conditional-ability proposal), `database-expert` (schema, the
`normalized_name` recommendation, the pivot contract and the soft-delete analysis) and `backend-qa`
(test design, the false-green analysis behind **R-8**, and the recorded dissent in **OQ-2**), per
[workflow.md](../../docs/workflow.md#phase-1--three-amigos-debate). Derived from
[PRD](../../docs/PRD/PRD.md#epic-4--blog) Epic 4's `Feature: Blog tags` block and assumptions 13, 17
and 19.

**All three amigos' contributions are reflected above.** Two things are worth recording about how the
debate went:

**The central design decision was reached independently by two participants.** `database-expert` and
`backend-expert` were asked different questions and neither saw the other's answer, and both arrived
at "store `normalized_name`, put the UNIQUE index there, drop `unique(name)`" — from different
directions (a hot autocomplete read path, and a TOCTOU window in 0023's PHP-only comparison). That
convergence is why **D-3** is stated as a decision rather than as an open question, despite being a
deliberate divergence from the 0023 template this story was asked to mirror. **The reconciliation
question was real, was raised as OQ-5, and has since been resolved in this story's favour.** Story
0058 (blog categories) landed while this file was being composed and initially specified
`unique('name')`; it has since been revised to the stored-`normalized_name` shape, citing **0032's
D-N1** as the project-wide convention. Both statements were verified by reading 0058's migration
snippet at each point rather than taken on report, and the superseded one is recorded here rather
than quietly overwritten. The upshot corrects this story's own framing: **D-3** is not a divergence
from the project's convention but an independent rediscovery of it — 0023 is the outlier, because it
predates D-N1, and aligning it is the only part of OQ-5 still open.

A defect travelled with the convention and is recorded in **R-4** rather than inherited silently:
0032 and 0058 both size `name` and `normalized_name` **equally** (255/255, verified in both files),
which `Str::ascii()`'s transliteration makes unsafe. This story sizes the normalized column wider and
requires Phase 3 to measure the real expansion by execution — deliberately without asserting a factor,
since `vendor/` is absent from this worktree and could not be consulted.

**One premise was verified rather than inherited, and it was stale.** 0023's **R-2** (CI runs SQLite,
production runs MySQL) is the load-bearing argument behind its whole uniqueness design, and this story
would have copied it. It was re-checked against `HEAD` — `phpunit.xml`, `.env.example` and
`.github/workflows/tests.yml` — and is **false**: the gap was closed on 2026-08-26 by
[`ci-database-connection-gap.md`](ci-database-connection-gap.md). Recorded as **D-13** rather than
silently dropped, because a later reader comparing the two task files will otherwise assume 0059
simply forgot the risk. This is
[the deferred-findings rule](../../docs/errors-log.md#a-deferred-storys-findings-were-claims-about-a-tree-that-no-longer-existed-and-one-of-them-would-have-reopened-a-bug-in-this-log--2026-08-23)
applied one phase earlier than it was written for.

Two decisions in this file are **new patterns rather than applications of an existing one**, and both
are flagged for deliberate Phase 2 attention rather than being nodded through: the model-event
derivation of `normalized_name` (**D-4**, supported by task 0010's "lock a derived identity at the
model layer" rule but never applied to a non-identity column here before), and the branch-dependent
ability in `FindOrCreateBlogTag` (**D-11** / **OQ-3**).

**Not yet run:** Phase 2 (`code-reviewer` INVEST validation). Beyond the four open questions, one item
deserves an explicit look there rather than at implementation time: **D-4**'s model event gives this
story whole-suite blast radius, which
[errors-log.md](../../docs/errors-log.md#both-of-this-projects-per-change-quality-gates-are-scoped-by-default-and-both-silently-passed--2026-08-20)
records as the exact shape that slips past a `--filter`ed test run. The Definition of Done names all
three quality gates unscoped for that reason.
