# [0062] Blog categories — management screen (list, create/edit modal, blocked delete)

## Description
Build the blog category management screen: a permission-gated list of categories with their post
counts, a create/edit modal carrying a single `name` field, and a delete-confirmation modal that
renders the **hard-block-with-count** refusal ("This category is used by 5 posts — reassign them
before deleting") when the category still has posts assigned. This is the **first and only call
site** of the `BlogCategoryPolicy` and the three `app/Actions/Blog/*BlogCategory` actions that story
[0058](0058-blog-categories-backend.md) shipped with zero consumers, and it is the screen the delete
guard story [0061](0061-blog-posts-core-crud-backend.md) built its `blogCategoryId` error-bag
contract for.

Frontend only — no migration, no model, no action, no policy. Every domain rule this screen enforces
is consumed from 0058 and 0061 as already-shipped code.

## ⚠️ Epic 5 amendments — read before Phase 2 (added 2026-08-30)

**This file predates Epic 5's translatable-content retrofit and several of its statements are now
false.** Two later stories change the schema this screen reads:

- **[0072 — Translatable content retrofit, Blog Categories backend](0072-translatable-content-retrofit-blog-categories-backend.md)**
  **drops `blog_categories.name` and `blog_categories.normalized_name` entirely** (its **D-2**) and
  moves both into a `blog_category_translations` child table, one row per store language, read
  through `BlogCategory::translated('name')`. Uniqueness moves with them, re-scoped to
  `UNIQUE(store_language_id, normalized_name)` (its **D-1**).
- **[0073 — Blog Categories screen, language tabs](0073-blog-categories-language-tabs-ui.md)** is the
  UI half: it replaces this screen's single `name` input with **one name input per active store
  language** behind 0071's shared `<x-language-tab-strip>`, adds the backend action
  `App\Actions\Blog\SetBlogCategoryTranslation`, and **owns the replacement list query** (its
  **D-12**, resolving its own **Q-2**).

**The sequencing framing matters and is easy to get backwards.** This story is Epic 4 and ships
**first**, against the schema 0058 gives it — so the corrections below are **not** instructions to
build this screen against the translated schema. They mark statements that stop being true **once
0072 lands**, so that (a) Phase 2 accepts the supersession explicitly rather than discovering it, and
(b) nobody reading this file after Epic 5 mistakes a superseded line for current design. 0073's
**R-2** records the consequence honestly: this story's suite goes red at 0072's own Phase 3, and
0073 — not this story — writes the fix.

**Correction sites in this file**, each carrying its own dated ⚠️ block below:

| § | What is now false | Corrected by |
| --- | --- | --- |
| Description, above | *"a create/edit modal carrying a single `name` field"* | 0073 (one input per active language) |
| Interface contract consumed from 0058 and 0061 | `#[Fillable(['name'])]`, the `normalized_name` `saving()` hook on the parent, and the trait's signature | 0072 **D-2**, **D-3**, and its Modify list |
| Component public surface | the `{id, name: string, …}` row shape, and `public string $name = ''` | 0073 **D-2**, **D-12** |
| `loadCategories()` | `->orderBy('name')->orderBy('id')` — orders on a dropped column | 0073 **D-12** |
| `save()`'s full shape | no per-language write, no error-key adapter | 0073 **D-8** |
| The view / `data-test` hooks | *"one `flux:input` bound to `name`"*; the static `blog-category-name-input` hook | 0073 **D-11** |
| Runtime traps — "Apply, unconditionally" #4 | the never-`null` rule now binds array **values** | 0073 **D-2** |
| Tests — rendering | *"the modal contains exactly one input"* | 0073 |
| Acceptance criteria | *"ordered by name"*, *"a modal whose only field is `name`"* | 0073 |

**What is NOT affected, stated positively so a reader does not have to wonder:** the
**hard-block-with-count delete** — this story's headline requirement — is untouched by the retrofit.
Its count is `posts()->withTrashed()->count()`, a count of *rows referencing the category*, which has
no relationship to the category's own name column; its error key stays `blogCategoryId`; **D-5**'s
same-scope rule, **D-12**'s never-disable-on-count rule, **D-2**'s no-catch rule and the
no-force-delete fence all survive verbatim. 0073 lists the delete-confirmation modal, its
`blogCategoryId` key and the post-count column under **"Deliberately not touched"** and requires one
regression assertion proving it. The single knock-on is cosmetic and is flagged at the component
surface below: `$deletingCategoryName`'s *source* changes from `$category->name` to a resolved
translation.

## Type
frontend | fullstack (related_task_id: **0058** — the paired blog-categories backend story) | includes database-expert: **no**

> **`related_task_id` is 0058, but the hard blocker is 0061.** 0058 is this story's FE/BE split
> partner. 0061 is a *separate* pair (its partner is 0063) that this story nonetheless **cannot ship
> without**: the delete guard, the `BlogCategory::posts()` relation the count reads through, the
> `blogCategoryId` error-bag key, and `lang/{en,es}/blog.php` itself are all 0061's, not 0058's.
> This is the identical shape [0025](done/0025-product-categories-ui.md)'s **F-1** recorded for the
> product taxonomy, and it is recorded here as **F-1** rather than left implicit in the metadata.

## Three Amigos participants

`product-owner` (lead) + `frontend-expert` (files and approach) + `frontend-qa` (test design), per
[workflow.md](../../docs/workflow.md#task-classification-rule)'s Frontend classification. Both
contributions are reflected below, including **three divergences** (**V-1**, **V-2**, **V-3**) — all
three resolved on facilitator-gathered evidence from **shipped code**, and all three going against
the position that reasoned from an *unimplemented* task file.

## PRD coverage

[PRD](../../docs/PRD/PRD.md#epic-4--blog) Epic 4's `Feature: Blog categories (extends the prototype)`
Gherkin block (PRD line 1361) — this story owns the **rendered** half of every scenario in it:

| PRD scenario | Owned here as |
| --- | --- |
| *Create a blog category* | the create modal |
| *Rename a blog category* | the edit modal |
| *Delete an unused blog category* | the delete-confirmation modal's success path |
| *Deleting a blog category still in use is hard-blocked with a count* | the delete modal's inline refusal |
| *Blog categories are independent from product categories* | a structural scope fence — see **D-10** |

Blog acceptance criterion 2, the **rendered** half. The CRUD rules themselves are 0058's and the
count guard is 0061's; **this story adds no domain rule of its own.**

> **Note on the PRD's own wording.** Three of the five scenarios above phrase their `Then` in terms
> of *"the post editor's category selector"* — a surface this story does not build (it is 0063's).
> The Gherkin below therefore re-expresses those outcomes against **this** screen's list, which is
> the honest rendered half; the selector half is 0063's to satisfy. Recorded so a reviewer diffing
> the PRD against this file does not read the change as scope drift.

## Gherkin

Every scenario opens with a named business-role actor (**"a blog editor"**, the PRD's own Epic 4
actor, also used by 0058/0059/0060) and carries exactly one `When`, per
[gherkin-guidelines.md](../../docs/testing/frontend/gherkin-guidelines.md) rules 1 and 3.

```gherkin
Feature: Blog category management screen

  Scenario: A blog editor views the blog category catalog
    Given a blog editor, with the blog categories "Guías" and "Novedades"
    When they open the blog category screen
    Then they see "Guías" and "Novedades" listed

  Scenario: An empty catalog tells the blog editor there is nothing yet
    Given a blog editor, with no blog categories in the catalog
    When they open the blog category screen
    Then they are told the catalog holds no blog categories

  Scenario: A blog editor creates a blog category from the screen
    Given a blog editor
    When they submit a new blog category named "Guías"
    Then "Guías" appears in the blog category list

  Scenario Outline: A blog category with an unacceptable name is refused on the screen
    Given a blog editor, with a blog category "Guías"
    When they submit a new blog category with <invalid_name>
    Then they are shown a validation message on the name field
    And no category is added to the catalog

    Examples:
      | invalid_name                                                |
      | a blank name                                                |
      | a name made only of whitespace                              |
      | a name longer than the accepted maximum                     |
      | a name already in the catalog                               |
      | a name differing from an existing category only in case     |
      | a name differing from an existing category only in accents  |

  Scenario: A blog editor renames a blog category from the screen
    Given a blog editor, with a blog category "Guías"
    When they rename it to "Guías de compra"
    Then the category is shown as "Guías de compra" in the list

  Scenario: Saving a blog category under its own unchanged name is accepted on the screen
    Given a blog editor, with a blog category "Guías"
    When they save that same category with the name "Guías" unchanged
    Then the save is accepted and the category keeps the name "Guías"

  Scenario: Renaming a blog category onto a name another category holds is refused on the screen
    Given a blog editor, with the blog categories "Guías" and "Novedades"
    When they rename "Novedades" to "Guías"
    Then they are shown a validation message on the name field
    And "Novedades" keeps its name

  Scenario: A blog editor deletes an unused blog category from the screen
    Given a blog editor, with a blog category "Guías" assigned to no posts
    When they delete "Guías"
    Then "Guías" no longer appears in the blog category list

  Scenario: Deleting a blog category still in use is blocked on the screen with a count
    Given a blog editor, with the blog category "Guías" assigned to 5 posts
    When they try to delete "Guías"
    Then they are shown a message stating that 5 posts use it
    And "Guías" still appears in the blog category list

  Scenario: The block names a single post in the singular on the screen
    Given a blog editor, with the blog category "Guías" assigned to 1 post
    When they try to delete "Guías"
    Then they are shown a message stating that 1 post uses it

  Scenario: Unpublished posts count towards the block shown on the screen
    Given a blog editor, with the blog category "Guías" assigned to 3 posts, none of them published
    When they try to delete "Guías"
    Then they are shown a message stating that 3 posts use it

  Scenario: A trashed post still counts towards the block shown on the screen
    Given a blog editor, with the blog category "Guías" assigned to 1 post that has since been trashed
    When they try to delete "Guías"
    Then they are shown a message stating that 1 post uses it

  Scenario: The listed post count matches the count the block states
    Given a blog editor, with the blog category "Guías" assigned to 1 live post and 2 trashed posts
    When they try to delete "Guías"
    Then the count shown on the category's row and the count stated in the message are both 3

  Scenario: No privilege level can force a blocked deletion from the screen
    Given a signed-in Super Admin, with the blog category "Guías" assigned to 5 posts
    When they try to delete "Guías"
    Then deletion is blocked exactly as it is for any other blog editor

  Scenario: The screen offers no way to proceed past a blocked deletion
    Given a blog editor shown the blocked-deletion message for "Guías"
    When they look for a way to delete it anyway
    Then the screen offers no confirm-and-proceed control

  Scenario: An administrator without the blog permission cannot reach the screen
    Given a signed-in administrator who does not hold the blog management permission
    When they try to open the blog category screen
    Then access is refused

  Scenario: An administrator who may only view the catalog is offered no way to change it
    Given a signed-in administrator holding only the blog view permission
    When they open the blog category screen
    Then the create, edit and delete controls are shown as unavailable

  Scenario: The blog category screen references no product taxonomy
    Given a blog editor
    When they open the blog category screen
    Then it shows only blog categories, with no link or reference to any product taxonomy
```

> **Two scenarios deliberately *not* scripted**, both ghost-scenario checks per
> [rule 6](../../docs/testing/frontend/gherkin-guidelines.md#6-no-ghost-scenarios), raised by
> `frontend-qa`:
> - **"the block names posts I cannot reach."** The gap is real (**0061 D-7d**) but it is an
>   *accepted cost with a named owner* — story 0063's trashed-post affordance. Scripting it here as
>   a failure would assert a defect against a decision already taken upstream.
> - **"reassign the posts, then delete."** The PRD requires reassignment from the **post editor**
>   (0063), not from this screen. This screen only refuses and states the count.

## Files to create/modify

**Owned by this story:**

| Path | Change | Why |
| --- | --- | --- |
| `app/Livewire/BlogCategories/Index.php` | **New.** Class-based component. Deliberately does **not** compose `BlogCategoryValidationRules` — see **D-1**. | [base-standards.md](../../docs/conventions/base-standards.md#livewire-component-convention-class-based-not-single-file) |
| `resources/views/livewire/blog-categories.blade.php` | **New — the *flat* path.** `App\Livewire\BlogCategories\Index` drops `.index` and kebab-cases the folder on the way down, exactly as `SalesRegions\Index` → `sales-regions.blade.php`. **Do not create `livewire/blog-categories/index.blade.php`** — and check for one *afterwards*: task 0017's `artisan make:` scaffold deposited exactly that unused stub, which broke nothing and simply sat there. | [naming.md](../../docs/conventions/naming.md#exception-a-component-named-index-resolves-to-its-parent-folders-name) |
| `routes/blog-categories.php` | **New.** One route, its own `auth`+`verified` group — the one-file-per-area convention. Snippet below. | |
| `routes/web.php` | **Modify — one `require` line.** `require __DIR__.'/blog-categories.php';` | matches every prior area file's one-line diff |
| `config/modules.php` | **Modify — ONE appended `items.blog_categories` entry, joining the `groups.blog` group [0060](0060-blog-tags-ui.md) creates.** **Must not declare a second `groups.blog`** — see **D-4** and **R-3**. | [authorization.md](../../docs/architecture/authorization.md#the-second-half-of-a-module-gate-the-sidebar-registry) |
| `lang/en/navigation.php`, `lang/es/navigation.php` | **Modify — one `items.blog_categories` leaf each.** No `groups.blog` leaf: 0060 adds it. Key-for-key identical. | registry-mirroring rule |
| `lang/en/blog.php`, `lang/es/blog.php` | **Modify** (0061 **creates** both). Append a `categories.index` subgroup for this screen's own copy. **Never touch the `categories.delete_blocked` key**, which is 0061's — see **D-6**. | [naming.md](../../docs/conventions/naming.md#translation-keys) |
| `tests/Feature/Blog/BlogCategoriesIndexTest.php` | **New.** Component + route authorization + the delete-blocked contract. Folder is `Blog/`, not `BlogCategories/`, per 0060's **V-3**. | |
| `tests/Feature/Blog/BlogCategoriesIndexRenderingTest.php` | **New.** View-level rendering, including the **negative** no-force-delete assertion. | |
| `tests/Browser/BlogCategories/IndexTest.php` | **New — mirrored, not flat**, per 0060's **V-1**. | [playwright-setup.md](../../docs/testing/frontend/playwright-setup.md#folder-structure) |
| `tests/Feature/Navigation/SidebarModuleGatingTest.php` | **Modify.** Entry-specific assertions only — the two *generic* drift guards already cover the new entry for free. | |
| `tests/Unit/ArchitectureTest.php` | **Modify.** One single-namespace fence, never `expect([...])` (**D-10**). | |

```php
// routes/blog-categories.php
<?php

use App\Livewire\BlogCategories\Index as BlogCategoriesIndex;   // aliased: `Index` is ambiguous across five areas now
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    // `can:blog.view`, not Spatie's `permission:` — same reason as users.index /
    // roles.index / sales-regions.index / blog-tags.index: Livewire 4's
    // PersistentMiddleware allowlist carries Laravel's `Authorize` (`can:`) but
    // not Spatie's `PermissionMiddleware`, so a `permission:`-gated route would
    // protect the initial GET only, leaving every save() / deleteCategory()
    // /livewire/update round-trip unauthorized. See docs/architecture/authorization.md.
    Route::livewire('blog/categories', BlogCategoriesIndex::class)
        ->middleware(['can:blog.view'])
        ->name('blog-categories.index');
});
```

The verbatim duplication of that comment from `routes/roles.php` / `routes/sales-regions.php` /
`routes/blog-tags.php` is **the convention, not an oversight** — a reader auditing one area file must
not have to open another to learn why.

```php
// config/modules.php — the ONLY appended array literal this story needs.
// `groups.blog` already exists (created by story 0060); do NOT re-declare it.
'blog_categories' => [
    'group' => 'blog',
    'label' => 'navigation.items.blog_categories',
    'icon' => 'rectangle-stack',      // must differ visibly from items.blog_tags' icon — see OQ-1
    'route' => 'blog-categories.index',
    'current_when' => 'blog-categories.*',
    'permissions' => ['blog.view'],   // EXACTLY the ability the route's own can: enforces
],
```

Identifier family, following 0060's **D-3** exactly: route name `blog-categories.index` (kebab),
namespace `App\Livewire\BlogCategories\Index` (StudlyCase area folder), view
`livewire/blog-categories.blade.php` (kebab, flat), registry key `blog_categories`
(**snake_case** — the multi-word rule `sales_regions` established and `blog_tags` repeated, where one
identifier is simultaneously the config key, the `lang/*/navigation.php` leaf and the rendered
`data-test="sidebar-link-blog_categories"` hook). Only the *values* stay kebab, because none of them
is a registry key.

**Explicitly NOT touched** (consumed as already-shipped code, so the boundary is unambiguous):

| File | Owner |
| --- | --- |
| `database/migrations/*_create_blog_categories_table.php` | 0058 |
| `app/Models/BlogCategory.php` — including the `posts()` relation | 0058 (created), **0061** (relation) |
| `app/Actions/Blog/{Create,Rename,Delete}BlogCategory.php` | 0058 (created), **0061** (the delete guard) |
| `app/Concerns/BlogCategoryValidationRules.php`, `app/Policies/BlogCategoryPolicy.php` | 0058 |
| `database/factories/BlogCategoryFactory.php` | 0058 |
| `app/Actions/NormalizeForSearch.php` | 0022 — reached only *indirectly*, through the actions |
| `lang/{en,es}/blog.php`'s `categories.delete_blocked` key itself | **0061** |
| `database/seeders/RolePermissionSeeder.php` | nobody — `blog` is already in `MODULES` (**verified**), so `blog.view`/`.create`/`.edit`/`.delete` all exist with **zero** seeder change |
| `resources/views/components/sidebar-nav.blade.php`, `resources/views/layouts/app/sidebar.blade.php` | 0013 — **append data to the registry, never edit the reader** |
| Blog tags' table/model/actions/screen | 0059 / 0060 |
| `blog_posts`, `blog_post_tag`, the post editor and its trashed-post affordance | 0061 / **0063** |

> **Sequential-implementation requirement — two collision surfaces stack on this one story.**
> 0061 and 0062 both write `lang/{en,es}/blog.php`, **and** 0061 additionally edits
> `app/Actions/Blog/DeleteBlogCategory.php`, the very file this screen's delete modal depends on.
> Their Phase 3 work must **never be dispatched in the same batch**, per the
> [Parallel Agent File-Ownership Rule](../../docs/contracts.md#parallel-agent-file-ownership-rule).
> **0058 → 0061 → 0062 is a hard sequential chain**, and 0060 should precede 0062 as well
> (**R-3**). Raised independently by `frontend-expert` and recorded as a named dependency rather
> than a files-table footnote.
>
> ⚠️ **Correction, 2026-08-30 — the `lang/{en,es}/blog.php` collision is now FOUR stories, not two.**
> [0063](0063-blog-posts-list-editor-ui.md) appends its own group, and
> [0073](0073-blog-categories-language-tabs-ui.md) appends a `categories.index.tabs.*` group to this
> screen's own block. 0073 carries the four-story form of this fence and notes it is *"the worse of
> the two"* such collisions in flight (the other being `lang/*/products.php` at three). The rule is
> unchanged and simply binds more widely: **none of the four may be dispatched in the same batch.**

### Interface contract consumed from 0058 and 0061

> **Read the following as a claim about a task file, not about code — see F-2.**

```php
// From 0058 — all present, all with zero call sites until this story
App\Models\BlogCategory                                          // HasUuids (v7), #[Fillable(['name'])], no SoftDeletes,
                                                                 //   normalized_name derived by a saving() hook (0058 D-12)
App\Policies\BlogCategoryPolicy                                  // viewAny/create/update/delete -> blog.view/create/edit/delete
                                                                 //   VIEW_/CREATE_/EDIT_/DELETE_PERMISSION public consts
App\Actions\Blog\CreateBlogCategory::__invoke(string $name): BlogCategory
                                                                 // AUTHORIZES, trims, VALIDATES (nameRules), logs refusals,
                                                                 //   catches 23000 -> ValidationException on `name`
App\Actions\Blog\RenameBlogCategory::__invoke(BlogCategory $c, string $name): BlogCategory
                                                                 // same, with ->ignore($c->id) derived internally
App\Concerns\BlogCategoryValidationRules::blogCategoryRules(NormalizeForSearch $n, ?string $id = null): array
                                                                 // this screen must NEVER reach it directly — see D-1

// From 0061 — the retrofit onto 0058's seam
App\Models\BlogCategory::posts(): HasMany                        // what the guard AND this screen's count column read through
App\Actions\Blog\DeleteBlogCategory::__invoke(BlogCategory $c): bool
    // authorizes 'delete' (targetType: 'blog_category'), then:
    //   $inUseCount = $c->posts()->withTrashed()->count();      // unfiltered by status AND by deleted_at
    //   if ($inUseCount > 0) -> log(reason: 'category_still_in_use') then throw
    //       ValidationException::withMessages([
    //           'blogCategoryId' => trans_choice('blog.categories.delete_blocked', $count, ['count' => $count]),
    //       ]);
    //   catch (QueryException 23000) -> re-count withTrashed(), throw the same shape
lang/en|es/blog.php                                              // created by 0061, carrying categories.delete_blocked
```

> ⚠️ **Correction, 2026-08-30 — three lines of the contract above are falsified by [0072](0072-translatable-content-retrofit-blog-categories-backend.md), which had not been written when this file was.**
>
> | Line above, as written | After 0072 |
> | --- | --- |
> | `App\Models\BlogCategory` — *"`#[Fillable(['name'])]` … `normalized_name` derived by a `saving()` hook"* | **`#[Fillable([])]`** — the parent row has no mass-assignable column left — and **the `saving()` hook is removed from `BlogCategory` entirely**, not relocated in place. Its mirror is written fresh on the new `BlogCategoryTranslation` model, guarded on `isDirty('name')` (0072 **D-3**). The parent gains `use HasTranslations;` plus a `translationModel()` method. |
> | `CreateBlogCategory::__invoke(string $name)` / `RenameBlogCategory::__invoke(BlogCategory $c, string $name)` | **Signatures unchanged** — 0072 **D-7** explicitly declines to widen them to `array $namesByLanguageId`, *because* this story and its tests bind to them. Only their **meaning** narrows: `$name` becomes *the default store language's* name, and each action additionally constructor-injects `SetTranslation`. **This row is the good news: the two calls in `save()` below need no change.** |
> | `RenameBlogCategory` — *"with `->ignore($c->id)` derived internally"* | Still derived internally, but the **target changes**: the ignored row is now a *translation*, so the rule is `->ignore($blogCategory->id, 'blog_category_id')` — the **FK column, not the PK** (0072 **D-4**). A mechanical port that keeps passing the category's own id compiles, runs and **never matches anything**, failing silently and one-directionally on exactly *"save a category under its own unchanged name"* — which is a scenario in this file's own Gherkin and a test in its own plan. |
>
> **Unresolved, and deliberately not resolved here — the validation trait's method name.** This file
> names it `blogCategoryRules(NormalizeForSearch $n, ?string $id = null)`; 0072's Modify list names
> the method it re-scopes `nameRules()`, gaining a `string $storeLanguageId` parameter. **Both are
> Phase 1 prose about an unimplemented file** (**F-2**), and 0073's own Provenance records the same
> discrepancy and defers it: *"Phase 3 resolves by reading `HEAD` rather than by this file picking."*
> Same disposition here — this amendment does not pick a name. What is fixed either way is that after
> 0072 the rule binds `blog_category_translations.normalized_name` scoped by `store_language_id`, so
> **D-1**'s conclusion (the component does not compose the trait and does not call `$this->validate()`)
> is unaffected by the retrofit even though the trait's signature is not.

**Three obligations this story inherits verbatim**, all non-negotiable:

1. **This story is where `BlogCategoryPolicy` stops being a zero-call-site policy** — 0058's own
   hand-off names it.
2. **The id fed to `Rule::unique()->ignore()` must stay server-authoritative** — `#[Locked]`, and the
   rename performed against a model re-read from the database, never against a client-supplied
   string. See [security/livewire-authorization.md](../../docs/security/livewire-authorization.md)
   and **D-8**.
3. **The delete modal binds its `@error` outlet to the error-bag key `blogCategoryId` verbatim**,
   renders the `trans_choice()` message rather than composing its own count string, and offers **no**
   confirm-and-proceed control at any privilege level. 0061's Definition of Done states this as a
   hand-off to this story by number.

### Component public surface

```php
namespace App\Livewire\BlogCategories;

use App\Actions\Auth\LogRefusedPrivilegedAttempt;
use App\Actions\Blog\CreateBlogCategory;
use App\Actions\Blog\DeleteBlogCategory;
use App\Actions\Blog\RenameBlogCategory;
use App\Models\BlogCategory;
use Illuminate\Support\Facades\Gate;
use Livewire\Attributes\Locked;
use Livewire\Attributes\Title;
use Livewire\Component;

#[Title('Blog categories')]
class Index extends Component
{
    // NOTE: deliberately does NOT `use BlogCategoryValidationRules;` — see D-1.

    /** @var array<int, array{id: string, name: string, postCount: int, canEdit: bool, canDelete: bool}> */
    #[Locked]
    public array $categories = [];              // ⚠️ `name` becomes `?string` after 0072 — see the correction below

    #[Locked]
    public ?string $editingCategoryId = null;   // written only from $category->id, never from the argument

    public bool $showModal = false;

    public string $name = '';                   // never ?string
                                                // ⚠️ REPLACED by `public array $names` (keyed by store-language id)
                                                //    in 0073 D-2 — see the correction below

    public bool $showDeleteModal = false;

    #[Locked]
    public string $blogCategoryId = '';         // the delete target. NAMED FOR THE ERROR KEY — see D-3.

    #[Locked]
    public string $deletingCategoryName = '';

    public function mount(): void;                                              // Gate::authorize('viewAny', …) — unlogged
    public function openCreateModal(LogRefusedPrivilegedAttempt $l): void;      // ->authorize('create', BlogCategory::class)
    public function openEditModal(string $categoryId, LogRefusedPrivilegedAttempt $l): void;   // findOrFail, ->authorize('update', $c)
    public function save(CreateBlogCategory $c, RenameBlogCategory $r, LogRefusedPrivilegedAttempt $l): void;
    public function closeModal(): void;                                          // + resetValidation()
    public function confirmDelete(string $categoryId, LogRefusedPrivilegedAttempt $l): void;   // findOrFail, ->authorize('delete', $c)
    public function deleteCategory(DeleteBlogCategory $d, LogRefusedPrivilegedAttempt $l): void;   // no try/catch — see D-2
    public function closeDeleteModal(): void;                                    // + resetValidation('blogCategoryId')

    private function loadCategories(): void;
}
```

> ⚠️ **Correction, 2026-08-30 — [0073](0073-blog-categories-language-tabs-ui.md) supersedes part of this surface, and its own file records that it *"supersedes 0062's committed surface rather than extending it"* (its **R-1**).** What this file declares stays correct for this story's own delivery; the table records what 0073 changes.
>
> | Declared above | After 0073 |
> | --- | --- |
> | `public string $name = '';` | **Removed**, replaced by `public array $names = []` — keyed by store-language id, values are plain strings, `''` meaning "not typed", **never `null`** (0073 **D-2**). Keeping both would be two representations of one value that can drift. |
> | `$categories` row shape `{id, name: string, postCount, canEdit, canDelete}` | `name` becomes **`?string`**, because it is now `translated('name')`-derived and the fallback chain can legitimately resolve to `null` (0073 **D-12**). The list renders an **em dash** in that case. `postCount`, `canEdit` and `canDelete` are unchanged. |
> | — | **Three new properties**: `$storeLanguages` (`#[Locked]`, active only), `$originalTranslatedLanguageIds` (`#[Locked]` — it feeds the conditional-requiredness branch, and forging it would let an actor blank away a real translation), and `$activeLanguageId` (unlocked, drives an `@if`, never binds a `<select>`). Plus one new method, `setActiveLanguageTab(string $languageId)`, which carries **no** `Gate` check because it only changes which panel is visible. |
> | `save(CreateBlogCategory, RenameBlogCategory, LogRefusedPrivilegedAttempt)` | Gains a fourth method-injected parameter, `SetBlogCategoryTranslation` (0073 **D-8**). |
> | `mount` / `openCreateModal` / `openEditModal` / `closeModal` / `confirmDelete` / `deleteCategory` / `closeDeleteModal` | **Signatures unchanged.** |
>
> **The delete path declared above is untouched** — `$showDeleteModal`, `$blogCategoryId` and
> `$deletingCategoryName` all survive with the same names, the same `#[Locked]`, and the same error
> key, and 0073 lists them under its **"Deliberately not touched"** table.
>
> ✅ **Resolved 2026-08-30 — retype `?string`, render the em dash.** `$deletingCategoryName` is declared
> `public string` here and 0073 re-declares it `public string` too — but after 0072 its source is a
> resolved translation that **can be `null`** (the same `?string` the row shape above becomes).
> `confirmDelete()` assigning `$category->translated('name')` into a non-nullable `string` would be a
> `TypeError` for a category holding no default-language name — a state 0070 **D-6** / **R-2** say is
> reachable in normal operation after a default-language change. Retype the property `public ?string
> $deletingCategoryName = null;` and render the same em-dash placeholder the row shape already uses
> when it's `null`, in the delete modal's confirm sentence — consistent with how every other resolved
> translation on this screen already handles the "no default-language name" state, rather than
> inventing a second convention (a coalesced placeholder string) for one property. Applies identically
> to 0073's re-declaration of the same property.

`loadCategories()` is private and builds the row array with

```php
BlogCategory::query()
    // withTrashed(): the SAME scope DeleteBlogCategory's own guard counts with (0061 D-18).
    // A bare withCount('posts') applies BlogPost's SoftDeletingScope and would
    // undercount, so the row could read "2 posts" while the refusal cites 3. See D-5.
    ->withCount(['posts' => fn ($query) => $query->withTrashed()])
    ->orderBy('name')   // ⚠️ orders on a column 0072 DROPS — replaced by 0073 D-12, see below
    ->orderBy('id')
    ->get()
```

mapping `canEdit` / `canDelete` from `Gate::allows('update'|'delete', $category)` — the *same* policy
methods `save()` / `confirmDelete()` authorize against, so the disabled state cannot drift from what
a click would actually do
([authorization.md](../../docs/architecture/authorization.md#gateallows-in-a-list-query-is-a-ui-hint-not-a-layer)).

> ⚠️ **Correction, 2026-08-30 — `->orderBy('name')->orderBy('id')` sorts on a column
> [0072](0072-translatable-content-retrofit-blog-categories-backend.md) **D-2** drops.** This is the
> sharpest of the breaks: 0072's own **R-1** names this exact line (*"line 370"*) as the first of two
> downstream sites it invalidates and explicitly declines to fix, and 0073's **Q-2** resolved on
> 2026-08-30 that **0073 owns the replacement for this screen** — because splitting *"the modal gets
> tabs"* from *"the list stops throwing"* across two stories leaves a broken screen between them.
>
> The replacement, from 0073 **D-12** — resolution and sorting move into **PHP**, never a SQL join:
>
> ```php
> BlogCategory::query()
>     ->withCount(['posts' => fn ($query) => $query->withTrashed()])   // ← THIS STORY'S, UNCHANGED
>     ->withTranslationsFor()
>     ->get()
>     ->sortBy(fn (BlogCategory $c) => $c->translated('name'))
>     ->values()
> ```
>
> Three things about that replacement matter to *this* file. **(a) The `withCount` clause is this
> story's and must survive the rewrite verbatim** — its `withTrashed()` scope is what **D-5** exists
> to guarantee, and 0073 says so by name, because a retrofit that rewrites this query is exactly where
> that would be dropped by accident. **(b) A raw join filtered to the default language would bypass the
> fallback chain**, silently mis-ordering (or, with `INNER`, omitting) any row lacking a
> default-language translation. **(c) `withTranslationsFor()` with no argument is a single eager load**,
> so the N+1 that is this mechanism's default failure mode is avoided by construction.
>
> **Everything else in this paragraph is unaffected**: `canEdit` / `canDelete` still come from
> `Gate::allows('update'|'delete', $category)`, **D-11**'s no-accepted-drift argument still holds
> (the retrofit adds no target-dependent policy branch), and the row is still built by a private
> `loadCategories()`.

`save()`'s full shape — note there is no `$this->validate()` call and no manual `trim()` (**D-1**):

```php
public function save(CreateBlogCategory $createBlogCategory, RenameBlogCategory $renameBlogCategory, LogRefusedPrivilegedAttempt $log): void
{
    if ($this->editingCategoryId === null) {
        $log->authorize('create', BlogCategory::class, targetType: 'blog_category');
        $createBlogCategory($this->name);
    } else {
        $category = BlogCategory::query()->findOrFail($this->editingCategoryId);
        $log->authorize('update', $category, targetType: 'blog_category', targetId: $category->id);
        $renameBlogCategory($category, $this->name);
    }

    $this->loadCategories();
    $this->closeModal();
}
```

> ⚠️ **Correction, 2026-08-30 — `save()` grows a second write path and an error-key adapter in
> [0073](0073-blog-categories-language-tabs-ui.md) **D-8**.** The shape above stays the **default
> store language's** half and is not rewritten; three things are added around it.
>
> 1. **A per-language write.** Every *non*-default language whose tab was filled goes through the new
>    `App\Actions\Blog\SetBlogCategoryTranslation` (method-injected), **never** through
>    `CreateBlogCategory` / `RenameBlogCategory` and **never** through 0070's shared `SetTranslation`
>    primitive — 0073 asserts structurally that this component does not even *import* `SetTranslation`,
>    which is what keeps its authorization unbypassable from the screen. The default language keeps
>    calling the two actions quoted above, whose signatures 0072 **D-7** deliberately leaves unchanged
>    **because this file binds to them**.
> 2. **A `name` → `names.{defaultId}` error-key adapter.** 0058's two actions rethrow a `23000`
>    collision as `ValidationException::withMessages(['name' => …])`, while after 0073 every field on
>    this screen binds to `names.{languageId}`. Without the adapter a default-language refusal lands
>    on a key no field renders and the editor sees the modal stay open with **no message** — the exact
>    *"the save silently did nothing"* failure. 0073 rejected the alternative (widening 0058's actions
>    to key on `names.{id}`) precisely because it would break the public contract **this** file and
>    every direct-call test bind to.
> 3. **Two authorization layers, and a reviewer must not collapse them** (0073 **D-8**, a human
>    architectural decision of 2026-08-30). The component keeps the `LogRefusedPrivilegedAttempt`
>    gates shown above — layer 1 — **and** `SetBlogCategoryTranslation` independently authorizes
>    `update` and runs its own `Validator` — layer 2. That is this repo's existing rule applied, not a
>    new one: task 0008a establishes that a rule living only in a component leaves every non-dashboard
>    caller ungated, and task 0017 adds the converse — *"a component that authorizes as well is a
>    layer, not a redundancy."* **D-9**'s finding below (that this does **not** double-log, because
>    `LogRefusedPrivilegedAttempt` writes only on refusal) is what makes the second layer free of the
>    cost `frontend-expert` feared, and it generalises to this third gate unchanged.
>
> **`D-1` survives the retrofit.** `save()` still calls no `$this->validate()` for the default
> language and still lets `ValidationException` propagate into the error bag. 0073 adds component-side
> validation across *every* active language's key before any write, which is an addition rather than a
> reversal — the rule 0058 put inside the actions is still not duplicated in the component.

**Which methods authorize, and against what.** Every public method except the two `close*Modal()`
resets — matching `App\Livewire\SalesRegions\Index`'s allow-list and `App\Livewire\Roles\Index` in
gating **both** modal openers as well as the write methods. `mount()` uses a bare `Gate::authorize()`
and is **deliberately unlogged**, inheriting the recipe's reasoning verbatim: the route's
`can:blog.view` checks the identical ability and `can:` **is** on Livewire's `PersistentMiddleware`
allow-list, so a refusal there is unreachable over HTTP. Every other site routes through
`LogRefusedPrivilegedAttempt::authorize()` with `target_type: 'blog_category'` passed **explicitly**
— `resolveTarget()` auto-resolves only `User` and `Role`, so a new domain must pass it. See
[the third-admin-screen recipe](../../docs/architecture/authorization.md#copyable-what-a-third-admin-screen-inherits).

`deleteCategory()` **also** authorizes, and that is not a double-log — see **D-9**, which records the
verification, because `frontend-expert` argued the opposite.

### The `->ignore()` id contract

`$editingCategoryId` is `#[Locked]` **and** is assigned only from `$category->id` — the primary key of
a row just read back out of the database inside `openEditModal()` — never from the raw
`string $categoryId` argument. At save time the component does not feed that property into a
validation rule at all: it re-fetches with `findOrFail()` and hands the **model instance** to
`RenameBlogCategory`, which derives the `->ignore()` value from `$blogCategory->id` internally.

**Without `#[Locked]`, a forged `->set('editingCategoryId', $otherId)` between opening the modal and
saving turns a uniqueness check into a rename-any-category primitive** — identical to
[0025's **R-3**](done/0025-product-categories-ui.md) and 0060's **R-1**, and exactly the vulnerability
class 0058's hand-off note names. The two lines are a pair; the dedicated retarget test below is what
pins them.

### The view: what it renders, and its `data-test` hooks

`resources/views/livewire/blog-categories.blade.php` sits **structurally between** its two siblings:
0060's single-field simplicity (one `name` input, no status badge, no permission matrix, no toggle,
no grouping) *plus* 0025's count column and blocked-delete modal.

- **Header** — the page title and a primary "New category" `flux:button`,
  `data-test="create-blog-category-button"`. **No summary line** (**D-7**).
- **Table** — a `flux:table` with a name column, a **post-count column**, and icon-only edit/delete
  row actions.
- **Empty state** — `blog.categories.index.empty` when `$categories` is empty.
- **Create/edit modal** — one `flux:input` bound to `name`, its inner content wrapped in
  `@if ($showModal)` so only one "Cancel" control is ever in the DOM (the pattern
  `users.blade.php` / `roles.blade.php` / `sales-regions.blade.php` all use).
  ⚠️ **The single field is superseded by [0073](0073-blog-categories-language-tabs-ui.md)** — see the
  correction under the hook table below. The `@if ($showModal)` wrapper is **not** superseded and must
  survive the rewrite.
- **Delete-confirmation modal** — names the target via `$deletingCategoryName`, wrapped in
  `@if ($showDeleteModal)`, and — unlike 0060's tag modal — **carries an error outlet**:

```blade
{{-- resources/views/livewire/blog-categories.blade.php — delete modal, sketch --}}
@if ($showDeleteModal)
    <flux:modal wire:model="showDeleteModal" name="delete-blog-category">
        <flux:heading>{{ __('blog.categories.index.delete_title') }}</flux:heading>
        <flux:text>{{ __('blog.categories.index.delete_confirm', ['name' => $deletingCategoryName]) }}</flux:text>

        {{-- 0061 D-18's hand-off contract: the key is `blogCategoryId`, verbatim, and it is
             backed by a real declared public property so Livewire's SupportValidation::dehydrate()
             does not drop it on the next round-trip. See D-3. --}}
        @error('blogCategoryId')
            <flux:callout variant="danger" data-test="blog-category-delete-blocked">
                {{ $message }}
            </flux:callout>
        @enderror

        <div class="flex justify-end gap-2">
            <flux:button wire:click="closeDeleteModal">{{ __('Cancel') }}</flux:button>
            <flux:button variant="danger" wire:click="deleteCategory" data-test="confirm-delete-blog-category">
                {{ __('Delete') }}
            </flux:button>
        </div>
    </flux:modal>
@endif
```

The `@error()`-on-a-non-field-key pattern follows 0025's **D-2** precedent
(`resources/views/livewire/settings/security.blade.php`'s `@error('setupData')` block is the one
prior instance in this repo), **not** a toast: there is still no precedent anywhere in this codebase
for a toast raised from application code.

**`data-test` hooks**, carrying the **full** domain per 0060's **V-2** (which explicitly forecloses a
bare `-category-` shorthand in a codebase that already has product categories), present on **both**
the enabled and the disabled branch so a test selects the same control either way:

| Hook | On |
| --- | --- |
| `create-blog-category-button` | the header's primary action |
| `edit-blog-category-{id}` | the row's edit action, both branches |
| `delete-blog-category-{id}` | the row's delete action, both branches |
| `blog-category-post-count-{id}` | the row's count cell — see the assertion trap in **R-6** |
| `blog-category-name-input` | the modal's one field — ⚠️ **renamed** `blog-category-name-input-{id}` by 0073 **D-11**; see below |
| `confirm-delete-blog-category` | the delete modal's destructive button |
| `blog-category-delete-blocked` | the `@error('blogCategoryId')` callout |
| `sidebar-group-blog`, `sidebar-link-blog_categories` | rendered by `<x-sidebar-nav />` from the registry keys — nothing to author |

> ⚠️ **Correction, 2026-08-30 — the create/edit modal stops being a single-field form, and one hook is
> renamed.** [0073](0073-blog-categories-language-tabs-ui.md) replaces the one `flux:input` with
> **0071's shared `<x-language-tab-strip>` plus one panel — and one name input — per *active* store
> language**, the default language's tab selected on open. Four consequences for this section:
>
> - **`blog-category-name-input` becomes `blog-category-name-input-{id}`**, keyed by store-language
>   **id** (0073 **D-11**). If this story has already shipped, its own tests referencing the bare hook
>   break and 0073's diff updates them. The four other hooks in the table above are **unchanged**, and
>   0073 adds three of its own: `language-tab-{id}`, `language-tab-error-{id}`, `language-panel-{id}`.
> - **Keyed by `{id}`, never by the language `code`.** 0073's **C-3** records that its own debate first
>   chose `code` (`es`, `fr`) and was overruled: a two-letter code matches inside ordinary prose — `fr`
>   inside "from" and "confirm" — which is [the `assertSee('0%')`-inside-`10%` trap](../../docs/testing/frontend/playwright-setup.md#selector-strategy)
>   this repo already records, arriving through a second door. **No assertion may match on a language
>   name either**: tab labels are endonyms ("Español", "Français"), and a blog category could
>   legitimately *be named* "Français".
> - **The edit field reads the raw translation row, never `translated('name')`** (0073 **D-6**).
>   Binding the fallback into a non-default tab means an editor who saves without touching that tab
>   silently manufactures a translation byte-identical to the default one that they never typed — 0073
>   calls it the sharpest bug that story can ship. **The list cell is the opposite** and *does* read
>   `translated('name')`, rendering an **em dash** when it resolves to `null`.
> - **`@js()` stays correct for both `wire:click` arguments below**, and the paragraph that follows is
>   unaffected. 0073's tab controls use `{{ \Illuminate\Support\Js::from(…) }}` inside the strip, which
>   is the same rule read off [the errors-log's dated correction](../../docs/errors-log.md#two-directive-calls-in-one-blade-component-tags-attribute-string-silently-fail-to-compile--2026-08-26) —
>   prefer a `{{ }}` echo in a component-tag attribute, and verify the **compiled output** rather than
>   the absence of an error.
>
> **The delete-confirmation modal sketched above is untouched by all of this**, `@error('blogCategoryId')`
> callout and `confirm-delete-blog-category` hook included, and 0073 requires one regression assertion
> proving it still renders 0061's blocked-delete refusal unchanged.

Both `wire:click` arguments — `openEditModal(@js($category['id']))` and
`confirmDelete(@js($category['id']))` — are **single-argument** `@js()` calls, the shape
`roles.blade.php` already ships and the shape
[errors-log.md's dated correction](../../docs/errors-log.md#two-directive-calls-in-one-blade-component-tags-attribute-string-silently-fail-to-compile--2026-08-26)
confirms compiles correctly inside a `flux:` component tag. **This screen has no multi-argument
`wire:click` anywhere** — `deleteCategory` takes its target from `$blogCategoryId`, not from an
argument — so the trap that killed every row toggle on the Sales Regions screen does not recur here
structurally. Record that in a one-line comment at each call site anyway, so a future "for
consistency" edit does not introduce one.

### Runtime traps — which apply, and which must not be defensively applied

**Apply, unconditionally:**

1. **`@js()` is mandatory** on both `wire:click` id arguments. A value interpolated into a `wire:*`
   attribute lands in a JavaScript evaluator, where Blade's HTML escaping is undone by the parser
   ([blade-livewire-output-encoding.md](../../docs/security/blade-livewire-output-encoding.md)). The
   id being a UUIDv7 does **not** exempt it — the rule is unconditional.
2. **A disabled row action is a separate `@if`/`@else` branch wrapped in a hand-written
   `<flux:tooltip>`** — never `:tooltip="$cond ? … : null"`, which under `livewire/blaze` renders an
   empty tooltip bubble on every *enabled* row.
3. **`cursor-not-allowed!` belongs on that `flux:tooltip` wrapper, not on the button** — Flux's own
   `disabled:pointer-events-none` takes the disabled button out of hit-testing entirely.
4. **`public string $name = '';`, never `?string`** — the rule that no `wire:model`-bound property is
   ever `null` binds regardless of control type.
   ⚠️ **Correction, 2026-08-30:** the *property* is replaced by `public array $names` in
   [0073](0073-blog-categories-language-tabs-ui.md) **D-2**, and **the rule survives one level down** —
   every active language gets a real `''` entry at modal-open and **no value in `$names` is ever
   `null`**, which 0073 records as extending this repo's never-`null`-bound-property rule from scalars
   to array **values**. So this trap does not stop applying; its subject moves.
5. **TWO error-bag resets, in two different methods** — this screen needs both, where 0060's tag
   screen needed only the first:
   - `closeModal()` → `resetValidation()`, clearing the `name` field's errors (0018's **B1**, a
     *blocking* Phase 5 finding on a sibling screen).
   - `closeDeleteModal()` → `resetValidation('blogCategoryId')`, clearing the **block** message
     (0025's **R-6**). Distinct key, distinct modal.
   **Do not conflate these into one call in one method** — they clear different modals' state, and a
   user blocked on "Guías" who cancels and then opens the delete modal for an *unused* category would
   otherwise be shown the old refusal.

**Do NOT apply — recorded so nobody adds them "defensively":**

1. **No `null`-property / native-`<select>` trap.** There is no `<select>` anywhere on this screen —
   one text input, nothing else. (Rule 4 above still holds, for the ordinary reason.)
   ⚠️ **Correction, 2026-08-30:** after [0073](0073-blog-categories-language-tabs-ui.md) it is **N text
   inputs, one per active store language** — but the conclusion is unchanged, because **there is still
   no `<select>`**: 0073's tabs are driven by `$activeLanguageId` through an `@if`, deliberately not by
   a bound `<select>`, which is what keeps this trap structurally inapplicable rather than merely
   avoided. Do not add one defensively.
2. **No two-`@js()`-in-one-attribute trap**, per the structural argument above.
3. **No `<input type="checkbox">` + `wire:click="$toggle(...)"` binding** — nothing toggles a boolean.
4. **No `<ui-checkbox` count-assertion trap** — no checkbox grid exists here.
5. **No `wire:model.live`** on anything — no field on this form needs to round-trip before Save.

## Tests to perform

Levels chosen per [coverage-policy.md](../../docs/testing/frontend/coverage-policy.md) — browser
tests only where real-DOM/Livewire round-trip behaviour is the actual risk, everything else at the
cheaper component level. **The deliberate calibration is that this plan does not re-run 0058's or
0061's suites one layer up**: those prove normalisation, trimming, boundaries and the guard's count
semantics exhaustively at the action layer, so this story asserts only that the **component routes
into the same shared rule** and that the outcome **renders**.

**Feature — `tests/Feature/Blog/BlogCategoriesIndexTest.php`**

*Listing*
- [ ] The list is ordered by name. Create out of order, assert alphabetical. *Why it can fail:*
      nothing in the schema enforces order (0058 ships no `sort_order`); only the query does.
- [ ] Each row exposes exactly `{id, name, postCount, canEdit, canDelete}` — locks the view contract,
      and catches a developer adapting `ProductCategories\Index` who reaches for
      `withCount('products')` against a relation that does not exist here.

> ⚠️ **Correction, 2026-08-30 — both cases above survive [0072](0072-translatable-content-retrofit-blog-categories-backend.md)/[0073](0073-blog-categories-language-tabs-ui.md) in intent but not in fixture, and 0073 owns the edit.** The ordering test keeps its *"why it can fail"* reasoning verbatim — nothing in the schema enforces order, only the query does — but the ordering it asserts is produced by a **PHP `sortBy(translated('name'))`** rather than by `orderBy('name')`, so its arrangement must create *translations* rather than set a `name` column. The row-shape test's `name` becomes **`?string`**, and it gains a case a `string` shape could not express: a category with **no** default-language translation exposes `name => null` and renders an em dash. 0073's Modify table names `tests/Feature/Blog/BlogCategoriesIndexTest.php` and scopes its edit to *"only where its own cases assert against the dropped `name` column"* — these two are that set.

*Create*
- [ ] A valid name persists exactly one row and the modal closes.
- [ ] Blank and whitespace-only names produce `assertHasErrors(['name'])` and add zero rows. *Why:*
      proves `save()` routes through the action's shared rule rather than validating the raw
      `wire:model` value.
- [ ] A duplicate name (exact case) produces `assertHasErrors(['name'])`.
- [ ] **One canary each** for a case-only and an accent-only duplicate ("Guías" vs "Guias") — not the
      full matrix. *Why this is not redundant with 0058:* a Livewire form built independently could
      easily validate with a bare `Rule::unique('blog_categories', 'name')` that misses the
      `normalized_name` column entirely, and **0058's own history shows a Phase 1 draft that copied
      0023's pre-`normalized_name` design once already** (its "Revised 2026-08-27" note). This canary
      is the only test in the plan that would catch that recurrence.
- [ ] **One** length-boundary canary (max accepted, max+1 refused), derived from the same constant
      0058 uses — never a hand-typed number (**OQ-4**).

*Rename*
- [ ] Renaming to a free name updates the row.
- [ ] Saving under the category's **own unchanged name** is accepted.
- [ ] Renaming onto another category's exact-case name is refused and the target keeps its name.
- [ ] **The `->ignore()` id is server-authoritative.** Attempt to retarget the edit by setting the
      locked property from the client
      (`->call('openEditModal', $a->id)->set('editingCategoryId', $b->id)`) and assert it **throws**,
      not that it silently retargets `$b`. *Why it earns its own test:* this is the exact
      vulnerability class 0058's hand-off note and
      [livewire-authorization.md](../../docs/security/livewire-authorization.md) name, and nothing
      else in the plan proves it.

*Delete — unused*
- [ ] Deleting an unused category removes the row and it disappears from the reloaded list.

*Delete — blocked (requires 0061)*
- [ ] A blocked delete surfaces an error on the **`blogCategoryId`** key — the literal key, not
      `deletingCategoryId` — **and** the category still exists afterwards. A guard that threw *after*
      deleting would pass a throw-only test.
- [ ] **The count is correct**, as a dataset over N = 1, 2, 5, asserting the literal rendered digits,
      **with a decoy category holding its own posts in every case**. Without the decoy, a global
      `BlogPost::count()` and a scoped count are indistinguishable and the test cannot fail for the
      reason it exists. Never re-invoke `trans_choice()` with the same arguments — that is a
      tautology.
- [ ] Singular (N=1) and plural (N≥2) forms differ.
- [ ] **Unpublished posts count.** A category with 3 posts, none `Published` (a mix of `Draft` and
      `Scheduled`), is blocked with count 3. 0061 **D-18** names a stray status filter as "the
      likeliest implementation bug", because "in use" *reads* like "publicly visible".
- [ ] **Trashed posts count — two separate cases**, because they fail differently:
      1. A category whose **only** post is trashed still blocks, with count **1, not 0**. This is
         0061 **D-18**'s stated failure mode: a scoped count passes its own guard, hits the FK, and
         re-counts to zero — producing *"used by 0 posts"*, which fails **loudly but incoherently**
         and is easy to mistake for a passing test if the assertion only checks "refused".
      2. A category with 1 live + 2 trashed posts blocks with count **3**.
- [ ] **The rendered row count equals the refusal count.** Same fixture as case 2 above: assert the
      row's `blog-category-post-count-{id}` cell reads `3` **and** the block message says `3`. *Why
      it earns its own test:* the two numbers come from two different queries in two different files
      (`loadCategories()` and `DeleteBlogCategory`), and nothing but this test stops them drifting.
      See **D-5**.
- [ ] **A Super Admin is refused identically.** *The single most important authorization test in this
      story* — it proves the block is a **domain invariant** and not an authorization rule. 0061
      **D-18** states this explicitly (`category_still_in_use` is logged as a domain-invariant reason
      and never routed through `Gate`), so a Super Admin's `Gate::before` bypass must be provably
      irrelevant to it.
- [ ] **The `23000` race-recovery branch.** Manufacture the inconsistent intermediate state — assign
      a post to the category between the guard's count and the delete (a direct
      `DB::table('blog_posts')->update(...)` between two component calls) — and assert the catch
      re-counts and produces the **same** `blogCategoryId` error shape, never an unhandled
      `QueryException`. *Why it is called out:* this is the only test that exercises **D-18**'s
      fallback branch at all, and it is the first thing cut under time pressure because the
      happy-path guard already "handles" every scenario a naive author would think of (**R-7**).
- [ ] Calling delete twice in succession on the same in-use category is refused both times — no
      "confirmed" state accumulates.
- [ ] **`closeDeleteModal()` clears the stale `blogCategoryId` error.** Open the blocked modal,
      cancel, then open the delete modal for an *unused* category, and assert the old refusal does
      **not** render. Write this **before** the happy-path delete test, not after (**R-5**).

*Authorization*
- [ ] `viewAny` / `create` / `update` / `delete` each get **both an allow and a deny** test at **two
      layers**: the route (`$this->get(route('blog-categories.index'))->assertOk()` /
      `assertForbidden()`) **and** the component (`Livewire::test()` mounting directly, and calling
      `save()` / `deleteCategory()` throwing `AuthorizationException` for a denied actor). These are
      genuinely not substitutes — [testing/README.md](../../docs/testing/README.md) — because the
      route test never exercises the component's own gate, and `/livewire/update` never runs most
      route middleware.
- [ ] A Super Admin holding zero permission rows passes `viewAny`/`create`/`update` via
      `Gate::before`.
- [ ] **One** global-state test that an actor holding only `blog.view` sees every row action
      disabled. *Deliberately not a Users-shaped per-row matrix* — see **D-11**.
- [ ] **Every refusal logs `target_type: 'blog_category'`**, set-equated against an existing screen's
      context keys in one `Log::spy()` session, per the refusal recipe's step 4. This is
      `BlogCategoryPolicy`'s first component call site.

*Malformed / unknown ids*
- [ ] `openEditModal()` and `confirmDelete()` with an unknown or malformed UUID fail cleanly
      (`ModelNotFoundException`), not as a silent no-op.

**Feature — `tests/Feature/Blog/BlogCategoriesIndexRenderingTest.php`**
- [ ] The list renders each category's name and its post count.
- [ ] The empty state renders when the catalog holds no categories.
- [ ] The create/edit modal contains exactly one input and **no `<select>` markup** — a cheap guard
      against a stray element copy-pasted in from the Users view.
      ⚠️ **Correction, 2026-08-30:** the *"exactly one input"* half is falsified by
      [0073](0073-blog-categories-language-tabs-ui.md) — the modal holds **one input per active store
      language** — and 0073 lists this file's superseded cases in its own **R-1**. The **`<select>`**
      half is unaffected and should be kept: 0073 adds tabs but deliberately no `<select>`, so this
      remains a live guard rather than a stale one. Re-express the count as *N inputs for N active
      languages*, counted through the `blog-category-name-input-{id}` hooks and **never** by language
      name or code.
- [ ] **The blocked-delete message renders in the DOM** with the correct digit, singular and plural.
      A test asserting only `assertHasErrors()` never proves the human actually sees the sentence.
- [ ] **The delete modal renders no confirm-and-proceed control of any kind when blocked.** *Arguably
      the single highest-value test in this story:* an implementer under time pressure could add a
      "delete anyway (Super Admin)" affordance as reasonable-seeming UX, and **only a negative DOM
      assertion catches it**. Absence is the thing under test, which is exactly the kind of test
      people skip as pointless — the mirror image of 0060's **R-2**.
- [ ] Row `data-test` hooks are present on **both** the enabled and the disabled branch.
- [ ] The disabled-state assertion matches `disabled="disabled"`, **never** a bare `disabled`
      substring (**R-6**).
- [ ] Validation messages appear next to the name field and the modal stays open.

**Feature — `tests/Feature/Navigation/SidebarModuleGatingTest.php` (extend)**
- [ ] A role holding exactly `blog.view` sees `sidebar-link-blog_categories` inside
      `sidebar-group-blog`.
- [ ] A role holding the related-but-different `blog.edit` sees **neither**.
- [ ] **Do not hand-write a registry↔route cross-check.** The two *generic* drift guards already
      cover a new entry for free — task 0018 verified exactly this, and its own plan wrongly assumed
      the opposite.

**Browser — `tests/Browser/BlogCategories/IndexTest.php`**
- [ ] Opening the create form shows a blank field (no stale prefill leaking from a previous edit).
- [ ] Creating a category through a real `fill()` + `click('Save')` round-trip: the new name appears
      in the list, with no JS errors. **This is the one test that proves `wire:model` actually
      delivers the typed value** — `Livewire::test()->set()` writes the property directly and never
      touches the DOM.
- [ ] Editing prefills the name; re-saving it unchanged preserves it.
- [ ] Cancelling the create form adds nothing.
- [ ] Deleting an unused category through the confirmation modal removes it from the list.
- [ ] **Deleting a category that is in use**: the blocked message renders inline where a real user
      would see it, the category is still listed, no JS errors. ***The highest-value browser test in
      this story*** — only a real DOM render proves the confirmation UI does not *look* like it
      succeeded (closing, removing the row) while the delete was actually refused server-side. That
      is precisely the outcome this story exists to deliver. The in-use fixture is seeded with
      factories directly (**V-3**).
- [ ] Creating a duplicate name through the real form shows the inline error — proves the `@error`
      binding works in a browser, not merely in the component's error bag.
- [ ] One continuous smoke pass (open create → cancel → open edit → cancel → attempt blocked delete →
      cancel) asserting `assertNoJavaScriptErrors()` after every step.

**Unit — `tests/Unit/ArchitectureTest.php` (extend)**
- [ ] `App\Livewire\BlogCategories\*` references no product-taxonomy namespace — written as **one
      `expect()` per namespace, never `expect([...])`**, which is disjunctive (this repo has already
      shipped one vacuous `arch()` rule that way; the file carries the comment recording it).

**Explicitly not tested here**, per
[what-not-to-test.md](../../docs/testing/qa/what-not-to-test.md):
- The full case/accent normalisation matrix and the full length-boundary pair — 0058's own suite
  proves these exhaustively at the model/action layer. Only the canaries above belong here.
- **`BlogCategoryPolicy`'s exhaustive per-ability allow/deny/narrowness matrix** — 0058's own policy
  tests. This story needs only the wiring tests listed above.
- `DeleteBlogCategory`'s count query, its `withTrashed()` semantics and its `23000` catch **at the
  action layer** — 0061 owns and tests all three. This story confirms only that the same
  `blogCategoryId` key and the same digits surface *through the UI*, plus the one race-recovery test
  above, because a component test is the cheapest place to reach that branch through a realistic call
  sequence.
- The genuine cross-request race with no synthetic DB manipulation — it needs real concurrency
  against an open `RefreshDatabase` transaction and is untestable at this layer. 0061 already records
  fail-closed as the accepted behaviour.
- **The D-7d "administrator cannot see the posts named in the block" gap** — real, named, and
  explicitly owned by story 0063's Definition of Done. Not a defect for this screen to work around.
- `trans_choice`'s pluralisation engine, `HasUuids`, Eloquent timestamps, `Rule::unique`'s SQL, and
  `restrictOnDelete()`'s mechanics — vendor behaviour.
- Visual/pixel regression — nothing in this story carries a stated visual-correctness requirement.

## Expected outcome

A blog editor holding `blog.view` reaches a **Blog categories** screen from the Blog group in the
sidebar and sees every category listed alphabetically with the number of posts using it. Holding
`blog.create` / `blog.edit`, they create and rename categories through a single-field modal, with
blank, whitespace-only, over-length and duplicate names — including case-only and **accent-only**
duplicates, so "Guías" and "Guias" cannot coexist — each refused inline on the name field. Holding
`blog.delete`, they delete an unused category from a confirmation modal.

Attempting to delete a category that any post still references — drafts, scheduled posts and
**trashed** posts included — leaves the confirmation modal open with an inline message naming the
exact count ("This category is used by 5 posts — reassign them before deleting"), the category still
in the list, and **no control anywhere on the screen that would proceed anyway**. That refusal is
identical for a Super Admin, because it is a domain invariant and not an authorization rule. The
count on the category's row and the count in the refusal are always the same number.

An administrator without the relevant permission is refused at the route and again inside the
component, and the sidebar link is not rendered for them at all. Nothing on the screen references,
links to, or shares anything with the product taxonomy.

## Acceptance criteria

- [ ] `/blog/categories` is registered as `blog-categories.index`, gated **`can:blog.view`** (never
      `permission:`), in its own `routes/blog-categories.php` inside an `auth`+`verified` group,
      `require`d from `web.php` by one line.
- [ ] `config/modules.php` gains **exactly one** `items.blog_categories` entry, in the **existing**
      `groups.blog` group, whose `permissions` is exactly `['blog.view']` — the same single ability
      the route's own `can:` enforces. **No second `groups.blog` is declared**, and
      `sidebar-nav.blade.php` / `sidebar.blade.php` are not edited.
- [ ] The list renders every category ordered by name, with its post count, an empty state when the
      catalog is empty, and icon-only row actions carrying `aria-label` plus
      `data-test="edit-blog-category-{id}"` / `data-test="delete-blog-category-{id}"` hooks **present
      on both the enabled and the disabled branch**.
- [ ] A category can be created and renamed through a modal whose only field is `name`; blank,
      whitespace-only, over-length, duplicate, case-only-duplicate and accent-only-duplicate names
      are each refused with a message on the `name` field and add no row.
- [ ] Saving a category under its own unchanged name is accepted.

> ⚠️ **Correction, 2026-08-30 — three of the criteria above are superseded by
> [0073](0073-blog-categories-language-tabs-ui.md), which states in its own **R-1** that it
> *"supersedes 0062's committed contract"* and that Phase 2 must accept the amendments explicitly
> rather than discover them at implementation.**
>
> - *"ordered by name"* → ordered by the **default-language translation**, resolved and sorted in PHP
>   (0073 **D-12**). The post count, empty state and both row-action hooks are **unchanged**.
> - *"a modal whose only field is `name`"* → a modal carrying **one name field per active store
>   language** behind 0071's shared tab strip. Every refusal in the same sentence still holds — blank,
>   whitespace-only, over-length, duplicate, case-only and accent-only — but they are keyed
>   **`names.{languageId}`** rather than `name`, and **duplicate now means duplicate *within one store
>   language***: the same string is accepted across two languages and refused twice within one, and an
>   accent-only variant collides within one language while not colliding across two (0072 **D-1**).
> - *"Saving a category under its own unchanged name is accepted"* → **unchanged as a requirement and
>   sharper as a test.** After 0072 the ignored row is a *translation*, so the rule must ignore on the
>   **FK column** (`->ignore($category->id, 'blog_category_id')`), not the PK (0072 **D-4**). A
>   mechanical port keeping the PK compiles, runs and matches nothing — failing **silently and in one
>   direction only**, on exactly this criterion. 0073 calls this *"the only place a user meets"* that
>   rule and makes the scenario non-negotiable there.

- [ ] An unused category can be deleted from a confirmation modal naming the target.
- [ ] **Deleting a category assigned to N posts is blocked with an inline message stating N**, bound
      to the **`blogCategoryId`** error key verbatim and rendering 0061's `trans_choice()` message
      rather than a locally composed string; the modal stays open, the category survives, unpublished
      **and trashed** posts count towards N, the singular and plural forms differ, and the refusal is
      identical at every privilege level including Super Admin.
- [ ] **The post count rendered on a category's row is produced by the same `withTrashed()` scope
      `DeleteBlogCategory` counts with**, so the row and the refusal can never state different
      numbers.
- [ ] **No confirm-and-proceed / force-delete control exists anywhere on the screen**, at any
      privilege level.

> ✅ **Checked, 2026-08-30 — the hard-block delete is UNAFFECTED by Epic 5's translatable-content
> retrofit, and this is stated positively so a later reader does not have to re-derive it.** The
> block's count is `$category->posts()->withTrashed()->count()` — a count of **`blog_posts` rows
> referencing the category**, which touches neither `blog_categories.name` nor `normalized_name` and
> is therefore untouched by [0072](0072-translatable-content-retrofit-blog-categories-backend.md)
> dropping both. Verified against both later stories rather than assumed: 0072's *"Deliberately not
> touched"* list names `app/Actions/Blog/DeleteBlogCategory.php` as **untouched**, and
> [0073](0073-blog-categories-language-tabs-ui.md) lists the delete-confirmation modal, its
> `blogCategoryId` error key and the post-count column under its own *"Deliberately not touched"*
> table, requiring **one regression assertion** proving the blocked-delete refusal still renders —
> precisely because it rewrites the file containing it.
>
> So every part of this story's headline requirement survives verbatim: the `blogCategoryId` error
> key, the `trans_choice()` message, the singular/plural split, unpublished and trashed posts
> counting, the Super-Admin-refused-identically property (it is a **domain invariant**, not an
> authorization rule), the no-force-delete fence, **D-5**'s same-`withTrashed()`-scope rule, **D-12**'s
> never-disable-delete-on-count rule, **D-2**'s no-catch rule and **D-13**'s `findOrFail()` split.
> 0072 does add a `cascadeOnDelete()` on `blog_category_translations.blog_category_id`, so a delete
> that **succeeds** now also removes that category's translations — but a category only reaches
> `->delete()` once the block has passed, so the guard runs first and this changes nothing this screen
> renders.
>
> **One cosmetic knock-on, not a behavioural one:** `$deletingCategoryName`'s source moves from
> `$category->name` to a resolved translation, which can be `null` — the open typing question flagged
> at the component surface above.
- [ ] `Gate::authorize()` (via `LogRefusedPrivilegedAttempt::authorize()`, `target_type:
      'blog_category'`) is the first statement of every mutating **and disclosing** method except
      `mount()`, which uses a bare unlogged `Gate::authorize()`.
- [ ] The id fed to `Rule::unique()->ignore()` is `#[Locked]` and read back out of the database.
- [ ] Per-row `canEdit` / `canDelete` come from the same `BlogCategoryPolicy` methods the mutating
      methods authorize against, and the post count is **never** used to disable the delete action
      (**D-12**).
- [ ] `closeModal()` calls `resetValidation()` and `closeDeleteModal()` calls
      `resetValidation('blogCategoryId')`.
- [ ] Every user-facing string is a translation key or a bare `__()` call per **D-6**;
      `lang/en/blog.php` and `lang/es/blog.php` stay key-for-key identical, and this story adds no
      key under `categories.delete_blocked`.
- [ ] No model, migration, action, policy, factory, seeder or permission-catalog change is made.
- [ ] Nothing on the screen references any product taxonomy.

## Definition of Done

- [ ] Tests written and green, plus the **full** existing suite in a single isolated run, per
      [contracts.md](../../docs/contracts.md#full-test-suite-gate-rule)'s Full Test Suite Gate Rule.
- [ ] **All three quality gates run unscoped and each result recorded, including any "not run"** —
      `php artisan test` (not `--filter`), `vendor/bin/pint --format agent` (not `--dirty`), and
      **Larastan level 7**, which story 0017 omitted from three consecutive verification records
      ([errors-log.md](../../docs/errors-log.md#a-verification-record-that-lists-two-of-three-quality-gates-is-a-record-of-two-gates--2026-08-26)).
- [ ] Code reviewed (code-reviewer).
- [ ] No security findings (appsec-auditor). Point the audit specifically at: the `#[Locked]` +
      server-read id pair behind `Rule::unique()->ignore()`; that every mutating **and disclosing**
      method gates before it acts; and that `$categories` being `#[Locked]` is belt-and-braces
      because no method reads it for a decision (**D-8**).
- [ ] Documentation updated (docs-keeper): [api/routes.md](../../docs/api/routes.md) gains a
      `blog-categories.index` section describing what the view renders, its `data-test` hooks and its
      registry entry; [architecture/authorization.md](../../docs/architecture/authorization.md)
      records that `BlogCategoryPolicy` now has its first call site and that the sidebar registry has
      been extended a further time by appending data only.
- [ ] **0058's and 0061's hand-off items are discharged and marked as such** in both of those task
      files: 0058's "the policy has zero call sites", and 0061's `blogCategoryId` error-bag contract
      plus its "0062 must not try to fix the trashed-post visibility gap in its own copy" note.
- [ ] **F-3 is resolved by execution and its outcome recorded** — whether `withCount()` includes or
      excludes soft-deleted related rows by default, correcting 0061's **D-7c** and closing 0060's
      **OQ-4** if it proves inverted. The shipped code this story writes is correct either way
      (**D-5**), but the *documentation* is not, and this story is the one with the evidence in hand.
- [ ] Acceptance criteria met.

## Documented functional decisions

- **D-1 — `save()` does not call `$this->validate()`, and the component does NOT compose
  `BlogCategoryValidationRules`.** Per 0058, `CreateBlogCategory` and `RenameBlogCategory` authorize,
  trim and validate internally with `nameRules()`, and `blogCategoryRules()` requires a
  `NormalizeForSearch` instance that is awkward to thread through a component-side `$this->validate()`
  for no other purpose. The component calls the action and lets `ValidationException` propagate into
  Livewire's error bag automatically. This mirrors 0060's **D-1** exactly, so the two Epic 4 taxonomy
  screens cannot drift.
  *Rejected:* compose the trait in the component and validate there, then call the action with a
  pre-validated string. It duplicates a rule 0058 deliberately put **inside** the action so a
  non-dashboard caller inherits it.
  ⚠️ Like 0060's, this rests on 0058's *prose* (**F-2**). Confirm against real code at Phase 2 or 3;
  if 0058 lands with validation in the component after all, this `save()` design is rewritten.
- **D-2 — The blocked-delete message renders inline in the still-open delete modal, and
  `deleteCategory()` does not catch the exception.** 0061 **D-18** chose `ValidationException`
  *specifically* because it is "the one exception Livewire already routes into a component's error bag
  with no plumbing at the call site, so 0062's delete modal renders the message with an `@error` block
  and catches nothing" — so catching it would defeat the reason it was chosen. The throw aborts the
  method before `closeDeleteModal()` runs, which keeps the modal open **by construction** rather than
  by an explicit flag.
  *Rejected:* a toast. There is no precedent anywhere in this repo for a toast raised from application
  code, and a toast that appears *after* the modal closes reads as "deleted" for the moment it takes
  to read it.
- **D-3 — The delete target's property is named `$blogCategoryId`, to match the error key exactly.**
  This is a real constraint, not cosmetics. 0061 fixes the error key as `blogCategoryId`, and
  Livewire's `SupportValidation::dehydrate()` filters the persisted error bag through
  `Utils::hasProperty()` — **an error keyed on a name the component does not declare is silently
  dropped on the next round-trip**, which is precisely the trap story 0017 documented for
  `replacementDefaultId`. Both **shipped** hard-block screens back their key with a declared public
  property: `App\Livewire\Roles\Index` keys on `deletingRoleId`, and
  `app/Livewire/SalesRegions/Index.php:84` declares `public string $replacementDefaultId = ''`.
  Naming the property `$deletingCategoryId` while throwing on `blogCategoryId` would put this screen
  outside both precedents for no gain. See **V-2**, where `frontend-expert` argued the opposite from
  an unimplemented file.
- **D-4 — This story JOINS the `blog` sidebar group; it does not create one.** 0060's **D-4** creates
  `config/modules.php`'s `groups.blog` (`expandable => false`, one entry) and states the cross-story
  consequence explicitly: *"0062 and 0063 append one `items.*` entry to the group this story creates
  and touch no component."* This story is that append — **two appended leaves in `navigation.php` and
  one array literal in `config/modules.php`**, with the reading component untouched.
  *Rejected:* ship `blog-categories.index` with no registry entry, reachable only by URL. That is the
  **linkless half-state** `roles.index` sat in between 0010 and 0013 and `sales-regions.index` between
  0017 and 0018 — recorded both times in [api/routes.md](../../docs/api/routes.md) as a real gap.
  **If 0062 is implemented before 0060 lands**, it must create `groups.blog` itself, copying 0060's
  shape verbatim; see **R-3** for why sequencing 0060 first is strongly preferred instead.
- **D-5 — The row's post count uses the SAME `withTrashed()` scope the delete guard counts with. This
  is the sharpest correctness detail in the story.** `loadCategories()` writes
  `->withCount(['posts' => fn ($query) => $query->withTrashed()])`, never a bare `withCount('posts')`.
  The reason is not the framework default (which is disputed — **F-3**); it is that **a count rendered
  beside a hard-block control must count exactly what the block counts, or the screen contradicts
  itself inside a single interaction**: "this row says 2 posts" immediately followed by "cannot
  delete — used by 3 posts". `App\Livewire\Roles\Index` is the shipped precedent and states the same
  rule in its own docblock — *"the count in the refusal message can never disagree with the query that
  decided to refuse"* — writing the identical `withCount(['users' => fn ($query) => $query->withTrashed()])`
  at **both** its list query and its delete guard.
  **The generalisable form, worth carrying past this story: an informational count rendered next to a
  guarded action is part of that guard's contract, not decoration.** Pinned by a dedicated test
  asserting both numbers from one fixture.
  *Rejected:* excluding trashed posts from the row count as "more useful to the editor". It is the
  more intuitive product answer and it is wrong here, because it reintroduces the contradiction above.
  *Also rejected:* an "of which N trashed" breakdown — speculative UI ahead of the story that needs it
  (0063), and exactly what 0025's **D-3** and 0060's **D-5** independently warn against.
- **D-6 — Copy extends `lang/{en,es}/blog.php`; this story creates no lang file.** 0061 creates both,
  and its own ⚠️ names 0062 and 0063 as extenders. This story appends a `categories.index` subgroup
  (`empty`, `delete_title`, `delete_confirm`, `action_not_allowed`) and **never touches
  `categories.delete_blocked`**.
  Note this deliberately **diverges from 0060's D-8**, which chose a per-screen `blog-tags.php` file:
  0060 had a free choice because nothing else owned a blog lang file, whereas here 0061 has already
  created `blog.php` *and* placed this screen's own block message inside it. Splitting this screen's
  copy across `blog.php` (for the block) and a new `blog-categories.php` (for everything else) would
  be worse than either single-file option. Recorded because the divergence is real and a reviewer
  will notice it.
- **D-7 — No header summary line.** Matching 0025's **D-7** and 0060's **OQ-6(a)**: nothing in the PRD
  or the brief asks for one, and unlike Users (which has an *active* dimension) a category catalog has
  no second dimension to summarise. The per-row post count already carries the only number that
  matters here. Both amigos converged on this independently.
- **D-8 — `$categories` is `#[Locked]`, as is every id-carrying property.** Follows the *newer*
  precedent — `App\Livewire\SalesRegions\Index::$regions` and 0060's **D-6** — rather than 0025's
  **D-4**, which deliberately leaves `$productCategories` unlocked on the reasoning that nothing reads
  it for a decision. Both are safe here, because every mutating method re-reads its target with
  `findOrFail()` and re-authorizes; locking is simply the stricter of two safe options and the one
  every screen since task 0018 has chosen. **Record the reason in the property's docblock**, which
  neither `Users\Index` nor `SalesRegions\Index` does.
- **D-9 — `deleteCategory()` authorizes in the component as well, and this does NOT double-log.**
  `frontend-expert` argued the component must *not* authorize here, reasoning that
  `DeleteBlogCategory` already authorizes and logs internally, so a component-level call would emit
  two lines for one click. **Verified false against shipped code.** `LogRefusedPrivilegedAttempt`
  writes a line only on **refusal**: if the component's gate passes, nothing is logged and the action
  proceeds to its own (also passing, also silent) check before the *domain-invariant* refusal is
  logged once; if the component's gate fails, it throws and the action never runs. Either way: one
  click, one line. `App\Livewire\SalesRegions\Index::setActive()` is the shipped precedent, calling
  `$log->authorize('update', $target, targetType: 'sales_region', …)` in the component while all three
  `app/Actions/SalesRegions/` actions authorize internally too. Keeping the component check preserves
  the layer 0058/0061 both call defence in depth — it fails fast before a transaction opens and it is
  what makes the per-row `canDelete` hint honest. See **V-1**.
- **D-10 — Independence from the product taxonomy is a structural scope fence, not a behavioural
  test.** Honoured by construction (own route, own component, own permission module, own model, own
  table) and pinned two thin ways: the `arch()` assertion above, and one `assertDontSee` scoped to
  **the component's own `->html()`**, never the full page, since the shared sidebar legitimately
  carries product-taxonomy entries once Epic 2's screens ship and that has nothing to do with this
  screen. Write no more than those two.
  Note the direction is the mirror of 0058's own fence and of 0025's **D-9**: there the blog taxonomy
  did not exist, here the product taxonomy does — so this is the first of the pair that can actually
  be violated by an autocomplete accident (`ProductCategory` and `BlogCategory` are four characters
  apart).
- **D-11 — Per-row `Gate::allows()` is kept, but the per-row *test* matrix is not.**
  `BlogCategoryPolicy`'s four abilities gate on the actor's module permission alone with no
  target-dependent branch — the `SalesRegionPolicy` shape, which
  [api/routes.md](../../docs/api/routes.md) records as *"the first screen whose per-row
  `Gate::allows()` hint has no accepted drift"*. Every row therefore answers identically for a given
  actor, and one global-state test replaces the Users-shaped matrix, which here would be padding
  rather than coverage. Per-row computation **stays** — negligible cost, consistent with the
  established pattern, and it survives the day a per-instance rule appears.
  ⚠️ That equivalence is a property of an empty policy body, **not a guarantee**. If 0058 ships
  `BlogCategoryPolicy` with a target-dependent branch, this decision and the hint must both be
  re-evaluated against a **re-fetched** row, exactly as `SalesRegionPolicy`'s own docblock requires.
- **D-12 — The post count is shown as an informational column but is NEVER used to disable the delete
  action.** Carried from 0025's **D-3** and it is the sharpest *design* point here. Pre-disabling
  delete on `postCount > 0` would visually conflate the in-use refusal with the `canEdit`/`canDelete`
  **authorization** hint, which exists precisely to mirror what a `Gate::authorize()` would do. 0061
  **D-18** is explicit that this refusal is not an authorization denial — the actor holds
  `blog.delete` and the answer is still no — and that it can never be a policy method. Letting the
  editor attempt the delete and read the count in the modal is also the only path that satisfies the
  PRD's own wording, which requires the *message* to state the count. The column is what makes that
  outcome predictable rather than surprising.
- **D-13 — Delete eligibility is established by `confirmDelete()`'s own `findOrFail()`, not by
  matching a row out of the already-loaded array.** A small, deliberate divergence from 0025's stated
  "read the count off already-loaded data, no second query" rule, proposed by `frontend-expert` and
  corroborated by shipped code: `App\Livewire\Roles\Index::deleteRole()` re-fetches its target *with*
  the count at delete time rather than trusting the loaded array — the fail-closed shape that 0011's
  own Phase 4 finding **F3** produced. Here the split is: `findOrFail()` answers *"does this row still
  exist"* per click, the **action** re-counts for the refusal, and the loaded `postCount` is used for
  **display only**, never as a delete-eligibility gate. A category deleted or reassigned between page
  load and click therefore fails closed rather than reading as zero posts.

### Scope fences: what this story must NOT do

- No migration, model, action, policy, factory, seeder, enum or validation trait — all consumed from
  0058/0061 as shipped.
- **No confirm-and-proceed, force-delete, or bulk-delete control of any kind.** 0061 **D-18** makes
  this architecturally impossible server-side (`__invoke()` takes no `force` flag) and gives three
  independent reasons it can never exist; the UI must not invent a client-side equivalent.
- **No reassign-posts-then-delete flow.** The PRD requires the editor to reassign first, from the post
  editor (0063) — this screen only refuses and states the count.
- **No trashed-post affordance, indicator, breakdown or "restore" link.** 0061 **D-7d** assigns that
  exit to 0063 explicitly and tells this story not to work around it in its own copy.
- No inline create-category-on-the-fly affordance inside a post editor (0063).
- No post-count breakdown beyond the flat integer (no "3 published, 2 draft" split) — that is 0063's.
- **No `FindOrCreateBlogTag` call, no tag chip/autocomplete, no tag anything** — 0059/0060/0063.
- No new permission slug and no `RolePermissionSeeder` change — `blog.*` is already seeded.
- **No fold logic anywhere in this story's files.** `App\Actions\NormalizeForSearch` is reached only
  indirectly, through the actions; `Str::lower()` / `Str::ascii()` appearing in
  `app/Livewire/BlogCategories/` is a review finding.
- **No edit to `resources/views/components/sidebar-nav.blade.php` or
  `resources/views/layouts/app/sidebar.blade.php`** — the registry is extended by appending **data**,
  never behavior.
- No pagination, search, sort picker, drag-ordering, slug, description or i18n scaffolding.

## Dependencies, findings, risks and open questions

### Findings

- **F-1 — This story's hard blocker is 0061, not only 0058, and it stacks two collision surfaces.**
  The `related_task_id` metadata names 0058, correctly, as the FE/BE pair. But the delete-block
  behaviour that is *half this story's stated scope* comes entirely from 0061:
  `BlogCategory::posts()`, the count guard inside `DeleteBlogCategory`, the `blogCategoryId` error-bag
  key, and `lang/{en,es}/blog.php` itself. **Every blocked-delete test in the plan above is unwritable
  until 0061 ships**, since `BlogPost` and its factory do not exist before it. Recorded here rather
  than silently corrected in the metadata, exactly as 0025's **F-1** did for the product taxonomy.
- **F-2 — None of Epic 4 exists in code, so this entire interface contract is a claim about task
  files.** Verified against the tree by the facilitator: no `app/Models/BlogCategory.php`, no
  `app/Actions/Blog/`, no `app/Policies/BlogCategoryPolicy.php`, no `app/Livewire/BlogTags/` or
  `BlogCategories/`, no `routes/blog-*.php`, no `lang/*/blog*.php`, and `config/modules.php` holds
  only `platform` / `settings` / `taxes` with no `blog` group. 0058, 0059, 0060 and 0061 are all still
  in `ai-spec/tasks/` (Phase 1). Per
  [the deferred-findings rule](../../docs/errors-log.md#a-deferred-storys-findings-were-claims-about-a-tree-that-no-longer-existed-and-one-of-them-would-have-reopened-a-bug-in-this-log--2026-08-23),
  **every statement in the Interface contract and in D-1 must be re-verified against `HEAD` before
  this story enters Phase 3, with each disposition recorded.**
- **F-3 — 0061's D-7c states the `withCount()` soft-delete default in the direction opposite to this
  repo's own shipped code, and this story is where it matters most.** 0061 **D-7c** warns that a
  `withCount('posts')` *"now includes trashed posts unless scoped"*. The shipped counter-example is
  `App\Livewire\Roles\Index` (lines 324 and 408), which must write
  `->withCount(['users' => fn ($query) => $query->withTrashed()])` — an explicit **opt-in** to include
  trashed rows, which is only necessary if `withCount()` **excludes** them by default, as
  `Model::newQuery()` applying the `SoftDeletingScope` would predict. 0060's **OQ-4** reached the same
  conclusion independently and `frontend-qa` reached it a third time here. **Not verified by execution:
  `vendor/` is absent from this worktree**, and per
  [the hedge rule](../../docs/errors-log.md#a-reviewers-correction-replaced-an-accurate-technical-explanation-with-a-wrong-one-unverified--2026-08-24)
  an unverified mechanism must not be written up as fact.
  **The consequence for this story is nil, deliberately:** **D-5** requires the scope to be stated
  explicitly in both directions, so the shipped code is correct whichever way the default falls. What
  is *not* correct either way is the documentation — settling it by execution and correcting 0061's
  **D-7c** (and closing 0060's **OQ-4**) is named in this story's Definition of Done, because this is
  the first story that both renders such a count and has a second count to reconcile it against.

### Divergences recorded from the debate

- **V-1 — Whether `deleteCategory()` authorizes in the component. `frontend-expert` said no (to avoid
  double-logging); decided: yes, it authorizes.** Resolved on shipped code rather than on either
  amigo's reasoning — see **D-9**. `LogRefusedPrivilegedAttempt` logs only on refusal, so the feared
  second line cannot occur, and `SalesRegions\Index::setActive()` already ships the component-plus-action
  shape. Recorded rather than silently overridden because the expert's concern was specific,
  well-argued and would have removed a real layer.
- **V-2 — The delete target's property name. `frontend-expert` recommended keeping 0025's mismatched
  shape (`$deletingCategoryId` as the property, `blogCategoryId` as the error key), noting he could
  not verify Livewire's source; decided: name the property `$blogCategoryId`.** The expert's argument
  rested on 0025 being *"an existing, presumably-working precedent"* — but **0025 is unimplemented**
  (**F-2**), so it is a task file, not a precedent. That is precisely the mistake 0060's own **F-2**
  caught one story earlier. The two genuinely shipped hard-block screens both back the key with a
  declared property (`Roles\Index`, and `SalesRegions/Index.php:84`), and story 0017 documented the
  `Utils::hasProperty()` filtering that makes it load-bearing. See **D-3**.
- **V-3 — Whether the blocked-delete path gets a browser test. `frontend-expert` recommended
  component-only coverage (seeding an in-use category means bypassing the unbuilt post editor);
  `frontend-qa` called it the highest-value browser test in the story. Decided: QA's.** The expert's
  objection does not hold against
  [playwright-setup.md](../../docs/testing/frontend/playwright-setup.md#folder-structure), which
  records that Pest's browser plugin dispatches through the **same in-process Laravel kernel**, so the
  test's open transaction is visible to the page under test — *"what makes `actingAs()` and model
  factories usable from a browser test at all"*. Seeding posts with a factory in browser setup is
  therefore ordinary practice here and creates no dependency on 0063's editor. The scenario is also
  the one this story exists to deliver, and the specific failure it guards — a modal that *looks* like
  it succeeded while the server refused — is invisible to any non-DOM test.

### Dependencies

- **[0058](0058-blog-categories-backend.md) — hard, blocking.** The model, the three actions, the
  validation trait and the policy this screen calls. **Not yet implemented (F-2).**
- **[0061](0061-blog-posts-core-crud-backend.md) — hard, blocking (F-1).** The delete guard, the
  `posts()` relation, the `blogCategoryId` error key and `lang/{en,es}/blog.php`. **Not yet
  implemented (F-2).**
- **[0060](0060-blog-tags-ui.md) — soft, strongly preferred first.** It creates `config/modules.php`'s
  `groups.blog`. Not a functional blocker (this story can create the group itself if it lands first),
  but see **R-3** for why the coordination cost is real and one-directional.
- **`App\Actions\NormalizeForSearch` (story 0022) — transitively.** This story never touches it, but
  0058 cannot ship without it, and 0058's own notes record that it is absent from this worktree.
- Sequencing, enforced strictly: **0058 → 0061 → 0062**, each fully closed before the next starts, per
  [workflow.md](../../docs/workflow.md#task-ordering-rule) and the Parallel Agent File-Ownership note
  above, with 0060 ideally before 0062 as well.
- Depends on already-shipped work: the seeded `blog.*` permissions (0002, **verified**), the
  `Gate::before` Super Admin bypass, policy auto-discovery (0004), the Users screen's list+modal
  pattern (0006), the wired-up browser suite (0006b), the sidebar registry
  ([0013](done/0013-sidebar-module-gating-ui.md)), `LogRefusedPrivilegedAttempt` (0015b), and the
  Roles and Sales Regions screens as the two shipped hard-block/list precedents.
- **No dependency on 0063** in either direction — though **0063 owns the exit** for 0061's **D-7d**
  trashed-post gap that this screen surfaces.

> ⚠️ **Added 2026-08-30 — two *downstream* dependencies this file could not have known about.** These
> do not block this story; this story blocks **them**.
>
> - **[0072](0072-translatable-content-retrofit-blog-categories-backend.md)** retrofits the table this
>   screen reads, dropping `blog_categories.name` / `normalized_name`. Its **R-1** names this file's
>   `orderBy('name')` and its `{id, name, …}` row shape as breakage it **explicitly declines to fix**.
> - **[0073](0073-blog-categories-language-tabs-ui.md)** is the paired UI story and **owns the fix**
>   (its **Q-2**, resolved 2026-08-30 by analogy with 0071's **Q-3**). It also depends on **0071** for
>   the shared `<x-language-tab-strip>`, giving the strict order
>   **0058 → 0061 → 0062 → 0068 → 0070 → 0071 → 0072 → 0073**.
>
> **The window between 0072 and 0073 is a broken screen, and that is a live coordination hazard rather
> than a documentation one.** 0073's **R-2** states it plainly: if this story ships first — which it
> must, being Epic 4 — then when 0072 lands, **this story's suite goes red inside 0072's own Phase 3**,
> which [contracts.md](../../docs/contracts.md#full-test-suite-gate-rule)'s Full Test Suite Gate Rule
> forbids 0072 closing through. Neither 0072 nor 0073 owns closing that window.
>
> ✅ **Resolved 2026-08-30 — keep the roadmap order; do not resequence.** 0072's **R-2** offers a second
> path: *if* the coordinator resequences so that 0072 lands **before 0058 is implemented**, the cheaper
> move is to amend **0058** so `blog_categories.name` / `normalized_name` are never created at all. This
> is declined, for the same reason it's declined everywhere else in Epic 5: the PRD's own roadmap
> ([Roadmap & priority reasoning](../../docs/PRD/PRD.md#roadmap--priority-reasoning)) places
> Internationalization last *because* it cross-cuts Products and Blog, which must exist first — and
> every one of Epic 5's five retrofit stories (0070, 0072, 0074, 0076, 0078) is built on exactly this
> premise: a real column existing first, then being migrated into a translation table. Resequencing
> Blog Categories alone would special-case one of five identical retrofits for no reason specific to
> it, and would invalidate the finalized 0072/0073 pair, which are written and reviewed against the
> retrofit shape. **This file's corrections stand as written**: true now, superseded once 0072 lands.
>
> The **red-window** concern above is real but is a **Phase 3 implementation-sequencing** detail, not a
> story-scope one — nothing prevents 0072's implementer from also updating this screen's list query in
> the same change or the same day 0072 lands (0073 still "owns" the UI-facing fix per its Q-2; a
> same-day courtesy fix to the query that keeps the suite green is an implementation choice, not a
> rewrite of either story's scope). Recorded as a Phase 3 execution note, not a blocking Phase 2
> question.

### Risks

- **R-1 — Anchoring on the wrong sibling.** 0060 is the more recently debated Blog UI story and it has
  **no delete block at all** (its **D-2**), by product requirement. An implementer who skims "what did
  the last Blog UI story do" will build a screen with an unconditional delete and no count — silently
  wrong, and every "delete succeeds" test still passes. **The instruction: read 0025 for the
  delete-modal mechanics, and 0060 for the Blog-area conventions (namespace, routes, sidebar, lang
  ownership). Do not blend the two on the delete-semantics axis.** Both amigos raised this
  independently.
- **R-2 — Building this screen before 0061 lands.** Every blocked-delete test, including both trashed
  cases, is unwritable until `BlogPost`, its factory and the D-18 retrofit exist. If implementation
  starts early, each must be *deferred with the reason recorded*, never silently skipped — the delete
  block is the story's headline requirement, and a story that ships its list and modal while quietly
  dropping its hardest scenario would pass a filtered test run.
- **R-3 — A second `groups.blog` declaration in `config/modules.php`.** If 0060 and 0062 both create
  the group, PHP's array literal silently keeps the last one — no error, no schema, no test that
  targets it directly, and the group's icon/expandable settings quietly change to whichever story
  wrote last. Mitigated by sequencing 0060 first (**D-4**), and by the acceptance criterion above
  stating that this story appends exactly one `items.*` entry.
- **R-4 — The `->ignore()` id becoming client-controlled.** Dropping `#[Locked]`, or assigning
  `$this->editingCategoryId = $categoryId` (the raw argument) instead of `$category->id`, silently
  turns a uniqueness check into a rename-any-category primitive. The two lines are a pair; the
  dedicated retarget test is what pins them, and nothing else in the plan would fail.
- **R-5 — A stale `blogCategoryId` error leaking between delete attempts.** The block message lives in
  the error bag, not in a reset property, so `closeDeleteModal()` must clear it explicitly. Given that
  three sibling screens now share this pattern and 0018 shipped its omission as a **blocking** Phase 5
  finding, treat this as a near-certain implementation gap rather than an edge case — and write the
  stale-leak test *before* the happy-path delete test.
- **R-6 — Icon-only selector traps**, verbatim from
  [playwright-setup.md](../../docs/testing/frontend/playwright-setup.md#selector-strategy). A
  disabled-state helper must match `disabled="disabled"`, never a bare `disabled` substring — Flux's
  compiled class list carries the literal `disabled:opacity-75` on the *enabled* branch too, so the
  naive helper reports every control as disabled and the test can never fail. And a **page-global
  count assertion is unsafe once a second row exists**: `assertSee('3')` matches inside `13`, and
  matches a decoy row's own count, which is why `blog-category-post-count-{id}` exists and why every
  count assertion must go through it.
- **R-7 — The `23000` race-recovery test is the one most likely to be cut.** It requires deliberately
  manufacturing an inconsistent intermediate database state rather than exercising an obvious path,
  and the happy-path count guard already "handles" every scenario a naive author would think of.
  Flagged so it survives triage: it is the **only** test that reaches D-18's fallback branch.
- **R-8 — Asserting the refusal without asserting the digit.** A test that checks only "delete
  refused" passes against a guard that reports the *wrong count* — which is exactly the two failure
  modes D-18 names as likeliest (a stray status filter, a missing `withTrashed()`). Every
  blocked-delete test in the plan asserts the rendered digit for this reason.
- **R-9 — The case/accent canaries passing for the wrong reason.** `utf8mb4_unicode_ci` is itself case-
  **and** accent-insensitive, so an implementation that never reaches `NormalizeForSearch` still passes
  every case-only and accent-only assertion here: the database folds both at the index and in the
  `WHERE` clause. **This story's canaries therefore cannot independently prove the normaliser ran** —
  that proof lives in 0058's own whitespace tests, which no collation reaches. Consequence: **0058
  being green with those tests intact is a prerequisite for trusting this story's suite**, and a Phase
  3 "simplification" that drops them as redundant silently invalidates coverage here too. (0060's
  **R-3**, one taxonomy over.)
- **R-10 — Modelling this screen too literally on either sibling.** Three over-reaches to avoid, each
  inflating the work without adding coverage: a per-row authorization matrix (**D-11**), re-running
  0058's normalisation suite one layer up, and defensively importing traps that structurally cannot
  apply (the `<select>` trap, `$toggle`, the checkbox-count trap). Padding is a finding under
  [coverage-review-checklist.md](../../docs/testing/qa/coverage-review-checklist.md), not a courtesy.

### Open questions

Four, all genuine, none blocking Phase 2 on their own — each carrying a labelled recommendation per
[contracts.md](../../docs/contracts.md)'s Uncertainty Handling Rule.

- **OQ-1 — What icon does `items.blog_categories` carry, and does it read as distinct from
  `items.blog_tags`?** The two sit in the same sidebar group, so visually similar icons make them read
  as duplicates at a glance. 0060's task file **does not pin an icon** for its own entry (verified),
  so there is nothing to collide with yet, only to coordinate.
  **(a) `rectangle-stack` for categories, leaving `tag` free for tags _(recommended)_** — the
  container/label distinction is the one that matches the domain, and it keeps the obvious `tag` icon
  for the entry actually named "tags".
  (b) Defer both icons to whichever story implements second. Workable, but it makes an aesthetic
  decision a scheduling accident.

- **OQ-2 — Should the row's post count be rendered at all, given it counts posts the editor may not be
  able to see?** **D-5** requires that *if* rendered it matches the guard exactly; this asks whether to
  render it.
  **(a) Render it, `withTrashed()`-scoped _(recommended)_** — it is nearly free (`withCount`, served by
  the FK's own index), and it turns the delete block from a surprise into something the editor can see
  coming, which matters because the PRD's remedy is "reassign those posts first". Both amigos
  supported it.
  (b) Omit it and let the modal be the only place a count appears — strictly closer to the PRD's
  literal wording, a smaller screen, and it sidesteps the trashed-post confusion entirely.
  Flagged because it is a product-visible addition the PRD does not request, and because (b) is more
  defensible here than it was for product categories (0025's **OQ-3**), where no trashed dimension
  existed.

- **OQ-3 — Is the `tests/Unit/ArchitectureTest.php` fence worth adding?**
  **(a) Add one single-namespace rule _(recommended)_** — unlike 0060's equivalent (**OQ-5**), this one
  asserts an absence that **can** actually be violated: `ProductCategory` and `BlogCategory` are four
  characters apart and both exist, so an IDE autocomplete accident is a real mechanism. That is
  precisely what distinguishes a useful `arch()` rule from the vacuous kind this repo has already
  shipped once.
  (b) Skip it. **Do not** write it as `expect([...])` under either answer.

- **OQ-4 — What literal maximum name length backs the length-boundary canary?** 0058 specifies
  `string('name', 255)` but its own **OQ-1** leaves the number unsettled jointly with 0059, and its
  **R-4** records an unresolved `Str::ascii()` expansion hazard (a max-length `name` can overflow an
  equally-sized `normalized_name`, truncating the uniqueness key silently and only for accented
  input — which is a live concern for a Spanish-language blog).
  **(a) Derive the boundary from 0058's own shared constant at test time _(recommended)_** — the canary
  then cannot desync from whatever Phase 2 settles, and this story takes no position on a number that
  is not its to choose.
  (b) Hard-code 255. Rejected: it silently bakes in an answer to someone else's open question.

## Resolved in the debate

Recorded so a later reader does not reopen them:

- **The delete is hard-blocked with a count, and there is no confirm-and-proceed path at any privilege
  level.** Settled upstream by PRD Epic 4's own Gherkin (which states it twice) and by 0061's **D-18**,
  which adds two independent structural reasons: `blog_posts.blog_category_id` is `NOT NULL` so there
  is no coherent "proceed", and `restrictOnDelete()` means the database would refuse anyway. Both
  amigos treated it as given.
- **The block is a domain invariant, not an authorization rule** — which is why a Super Admin is
  refused identically and why it can never be a policy method. 0061 **D-18**; not re-litigated.
- **`ValidationException` over a domain exception**, with its acknowledged counter-argument (it
  conflates "your input was invalid" with "the world's state forbids this") already recorded in 0061
  **D-18**. Settled there, on the rendering argument.
- **Trashed posts count towards the block, and the resulting "blocked by posts I cannot see" gap is
  0063's to close, not this screen's.** 0061 **D-7d** states the cost, the reason it is forced (a
  foreign key has no notion of a soft delete), and the owner. Both amigos independently declined to
  soften it here.
- **The route/registry shape follows the `sales-regions.index` precedent** — nested URI, flat
  area-specific route name, entry `permissions` exactly equal to the route's `can:` ability. Both
  amigos proposed it independently.
- **`blog.*` is already seeded** — verified against `RolePermissionSeeder::MODULES` (which contains
  `'blog'`) and `ACTIONS` (the four CRUD verbs) by the facilitator. No seeder change, no new module
  slug.

## Provenance

Phase 1 (Three Amigos) debate run on 2026-08-27 with `frontend-expert` (files, route/registry shape,
component surface, the delete-modal markup and the `withTrashed()` count analysis) and `frontend-qa`
(Gherkin, the layered test plan, level calibration and the blocked-delete test design), per
[workflow.md](../../docs/workflow.md#phase-1--three-amigos-debate). Classified **Frontend** under the
[task classification rule](../../docs/workflow.md#task-classification-rule), so no `backend-expert` or
`database-expert` was convened — this story adds no backend or schema artifact. Derived from
[PRD](../../docs/PRD/PRD.md#epic-4--blog) Epic 4's `Feature: Blog categories (extends the prototype)`
block and the CRUD half of Blog acceptance criterion 2, grounded in full readings of
[0058](0058-blog-categories-backend.md) and [0061](0061-blog-posts-core-crud-backend.md), with
[0025](done/0025-product-categories-ui.md) as the structural template and [0060](0060-blog-tags-ui.md) as
the Blog-area convention source.

Both amigos' contributions are reflected above. **Three divergences are recorded rather than silently
resolved** (**V-1** whether `deleteCategory()` authorizes, **V-2** the delete target's property name,
**V-3** whether the blocked-delete path gets a browser test), and **all three went against the
position that reasoned from an unimplemented task file, on evidence gathered from shipped code** —
`App\Livewire\Roles\Index`, `app/Livewire/SalesRegions/Index.php:84` and
[playwright-setup.md](../../docs/testing/frontend/playwright-setup.md)'s in-process-kernel note
respectively. That pattern is itself worth carrying forward: with four unshipped Epic 4 stories in
flight, *"0025 does it this way"* is not a precedent claim, and 0060's own **F-2** caught the same
mistake one story earlier.

**Three findings are recorded that neither the brief nor the existing docs had right.** **F-1**, that
the hard blocker is 0061 rather than only 0058, and that it stacks *two* file-collision surfaces
(`lang/{en,es}/blog.php` and `DeleteBlogCategory.php`) rather than one. **F-2**, that none of Epic 4
exists in code, so the whole interface contract must be re-verified against `HEAD` before Phase 3.
And **F-3**, the sharpest: **0061's D-7c states the `withCount()` soft-delete default in the direction
opposite to this repo's own shipped `Roles\Index`**, which has to opt *in* to trashed rows explicitly.
Three independent readings (0060's OQ-4, `frontend-qa`'s, and the facilitator's grep) agree it is
inverted, and none could verify by execution because `vendor/` is absent from this worktree — so per
[the hedge rule](../../docs/errors-log.md#a-reviewers-correction-replaced-an-accurate-technical-explanation-with-a-wrong-one-unverified--2026-08-24)
it is recorded as an open question with a fix that is correct either way (**D-5**: state the scope
explicitly), and settling it is named in the Definition of Done.

The story's one genuinely new contribution to this repo's conventions is **D-5**'s generalisation:
**an informational count rendered beside a guarded action is part of that guard's contract, not
decoration** — it must be produced by the same query the guard counts with, or the screen contradicts
itself inside a single interaction. `App\Livewire\Roles\Index` already implements the rule and states
it in a docblock; no `docs/` page names it, and this is the second screen to need it.

**Not yet run:** Phase 2 (`code-reviewer` INVEST validation). Four items deserve an explicit look
there rather than at implementation time. **Independence** is the fair challenge — **F-1** means this
story is gated behind two unshipped backend stories, so INVEST's "Independent" holds only in the
sequencing sense. **F-3** should be settled by execution the moment `vendor/` is available, since it
is a documentation defect in a *closed* story. **V-2** changes a public property name and should be
ratified rather than inherited. And the **browser-test path** (`tests/Browser/BlogCategories/IndexTest.php`)
is a convention decision this file is making by naming it, which
[playwright-setup.md](../../docs/testing/frontend/playwright-setup.md#folder-structure) says
explicitly belongs in the Phase 2 review — twice now it has not been, and twice the mirrored
convention has lost by default.
