# [0060] Blog tags — management screen (list, create/edit modal, unconditional delete)

> ## ⚠️ Epic 5 amendments — read before implementing, 2026-08-30
>
> **This file was written on 2026-08-27, before Epic 5's translatable-content stories existed. Two of
> them change the ground it stands on, and the corrections are marked inline throughout rather than
> silently rewritten** — each carries a ⚠️ **Correction, 2026-08-30** block stating what this file used
> to say and why it is now wrong, so a reader can tell a decision from a stale sentence.
>
> - **[0074](0074-translatable-content-retrofit-blog-tags-backend.md) — Blog Tags translatable-content
>   retrofit (backend, Phase 1).** It **deletes `blog_tags.name` and `blog_tags.normalized_name`
>   entirely**, moving both into a `blog_tag_translations` child table — one row per
>   `(tag, store language)` — with name uniqueness re-scoped from global to **per store language** and
>   the read path becoming `BlogTag::translated('name')`. `BlogTag` becomes an identity-only model with
>   `#[Fillable([])]` (its **D-2**). Everything this file says about a `name` **column** is therefore
>   false, in three places: the [interface contract](#interface-contract-consumed-from-0059), the row
>   shape in the [component public surface](#component-public-surface), and `loadTags()`'s
>   `orderBy('name')` (**D-9**).
> - **[0075](0075-blog-tags-language-tabs-ui.md) — Blog Tags screen, language tabs (fullstack, Phase 1).**
>   It **modifies this story's own component, view, lang files and tests** to add one name input **per
>   active store language** behind a shared tab strip, and adds one backend class,
>   `App\Actions\Blog\SetBlogTagTranslation`. It is the story that owns the language-tabs UI; **this
>   file is not being expanded to cover it** (see the [scope note](#what-0075-takes-over-and-what-stays-here)).
>
> **What is *not* affected, stated because it is the larger half of this story.** The route, the
> `can:blog.view` gate, the sidebar group and registry entry (**D-4**), the namespace/view/route
> identifier family (**D-3**), the whole unconditional-delete design and its signature negative
> assertions (**D-2**, **D-5**), the `#[Locked]` `->ignore()` id contract (**D-6**), the refusal-logging
> obligations, `BlogTagPolicy` gaining its first component call site, and **D-1**'s
> component-does-not-validate rule are all **unchanged**. So is the shape of `CreateBlogTag` /
> `RenameBlogTag` / `DeleteBlogTag`: 0074 keeps every signature deliberately (its **D-7**), and 0075
> adds a *third* action beside them rather than altering them.
>
> **Sequencing.** 0074 must reach Phase 3 before this story does — 0075's **Q-2** records that
> 0060-as-written is broken in *both* orderings otherwise, because it binds `public string $name` to a
> column 0074 deletes. That is 0074's own **R-1** ("is this a retrofit at all?") arriving one layer up;
> it is recorded, not acted on here, and the 14-story decomposition stands.

### What 0075 takes over, and what stays here

**Deliberately not redesigned in this file.** The tab strip, the per-language `$names` array, the
per-language write path and the untranslated-state rendering are **0075's**, decided there and
reconciled against sibling story [0071](0071-product-categories-language-tabs-ui.md). This file is
amended only far enough to stop asserting things that are false; it is not being rewritten into a
language-tabs spec.

| Concern | Owner |
| --- | --- |
| Route, sidebar group + registry entry, lang file creation, delete flow, list screen shell | **0060** — unchanged |
| The **default store language**'s create and rename path, via `CreateBlogTag` / `RenameBlogTag` | **0060** — unchanged (0074 keeps both signatures; only their *meaning* narrows to "the default store language's name") |
| The `name` column → `blog_tag_translations` retrofit, per-language uniqueness, the re-signed `nameRules()` | **0074** |
| Language tabs, `public array $names`, `setActiveLanguageTab()`, per-language inputs and hooks, `SetBlogTagTranslation`, the untranslated-list placeholder | **0075** |

## Description
Build the blog tag management screen: a permission-gated list of tags, a create/edit modal carrying a
single `name` field, and a **plain** delete-confirmation modal — no usage count, no blocked state, no
reassign-first requirement. This is the **first and only call site** of `App\Policies\BlogTagPolicy`
and of the three `app/Actions/Blog/` tag actions that story
[0059](0059-blog-tags-backend.md) ships with zero consumers, and it discharges 0059's explicit
hand-off obligation to give that policy a component call site with a server-authoritative
`->ignore()` id.

Frontend only — no migration, no model, no action, no policy, no factory, no seeder change. Every
domain rule this screen enforces is consumed from 0059 as already-shipped code.

It is also, incidentally, **the first Blog-area story to touch `routes/`, `config/modules.php` or
`lang/` at all** — story [0058](0058-blog-categories-backend.md) fenced all three off explicitly, and
nothing blog-related exists anywhere in `app/`, `config/`, `routes/` or `lang/` today (verified; the
sole exception is the `blog` *permission label* leaf in `lang/{en,es}/roles.php`). So this story
creates the `blog` sidebar group that stories **0062** (blog categories UI) and **0063** (blog
posts list/editor UI) will later append to. See **D-4**.

Covers [PRD](../../docs/PRD/PRD.md#epic-4--blog) Epic 4's `Feature: Blog tags (extends the
prototype)` scenarios *Create a tag on the management screen*, *Rename a tag on the management
screen* and *Delete a tag on the management screen* — the **rendered** half of the "full CRUD
management screen" clause in Blog acceptance criterion 3. It does **not** cover the post editor's tag
field or create-on-the-fly; see [Scope fences](#scope-fences-what-this-story-must-not-do).

## Type
frontend | fullstack (related_task_id: **0059** — the paired blog-tags backend story) | includes database-expert: **no**

> **Unlike its 0025 analogue, this story has exactly one hard dependency.** 0025's **F-1** records
> that its `related_task_id` (0023) was *not* its real blocker — the delete guard, the counted
> relation and the lang file all came from a second story (0024). Here there is no second story:
> 0059 ships the model, all three actions, the validation trait and the policy, and this screen's
> headline delete behaviour needs **nothing added to any of them** precisely because the delete is
> unconditional (**D-2**). That is a genuine simplification, recorded so a reviewer diffing the two
> files does not go looking for a missing dependency.

## Three Amigos participants

`product-owner` (lead) + `frontend-expert` (files and approach) + `frontend-qa` (test design), per
[workflow.md](../../docs/workflow.md#task-classification-rule)'s Frontend classification. No
`backend-expert` or `database-expert` was convened — this story adds no backend or schema artifact.

Both contributions are reflected below, including **three recorded divergences** (**V-1** the browser
test path, **V-2** the `data-test` hook naming, **V-3** the Feature test folder — where the
facilitator's evidence overturned the expert's proposal) and **three findings neither the brief nor
the existing docs had right** (**F-1**, **F-2**, **F-3**).

## PRD coverage

[PRD](../../docs/PRD/PRD.md#epic-4--blog) Epic 4's `Feature: Blog tags (extends the prototype)` block
— this story owns the **rendered** half of its first three scenarios and **none** of the other four:

| PRD scenario | Owned here as | |
| --- | --- | --- |
| *Create a tag on the management screen* | the create modal | ✅ this story |
| *Rename a tag on the management screen* | the edit modal | ✅ this story |
| *Delete a tag on the management screen* | the plain delete-confirmation modal | ✅ this story (see **D-2**, **R-6**) |
| *Reuse an existing tag from the post editor* | — | ❌ story **0063** (`FindOrCreateBlogTag`) |
| *Create a new tag on the fly from the post editor* | — | ❌ story **0063** |
| *A post can hold more than one tag* | — | ❌ stories **0061** / **0063** |
| *Filter the blog list by taxonomy* | — | ❌ story **0063** |

Blog acceptance criterion 3, the **management-screen** half of its first clause ("Tags have a full
CRUD management screen **and** can be created on the fly from the post editor" — the second clause is
0063's). The CRUD rules themselves are 0059's; this story adds no rule of its own.

## Gherkin

Every scenario opens with a named business-role actor — **"a blog editor"**, the actor PRD Epic 4 and
story 0059 both already use — and carries exactly one `When`, per
[gherkin-guidelines.md](../../docs/testing/frontend/gherkin-guidelines.md) rules 1 and 3.

```gherkin
Feature: Blog tag management screen

  Scenario: A blog editor views the tag catalog
    Given a blog editor, with the blog tags "running" and "invierno"
    When they open the blog tag screen
    Then they see "running" and "invierno" listed

  Scenario: An empty catalog tells the blog editor there is nothing yet
    Given a blog editor, with no blog tags in the catalog
    When they open the blog tag screen
    Then they are told the catalog holds no blog tags

  Scenario: A blog editor creates a tag from the screen
    Given a blog editor
    When they submit a new blog tag named "running"
    Then "running" appears in the blog tag list

  Scenario Outline: A blog tag with an unacceptable name is refused on the screen
    Given a blog editor, with the blog tags "running" and "Niño"
    When they submit a new blog tag with <invalid_name>
    Then they are shown a validation message on the name field
    And no tag is added to the catalog

    Examples:
      | invalid_name                                            |
      | a blank name                                            |
      | a name made only of whitespace                          |
      | a name longer than the accepted maximum                 |
      | a name already in the catalog                           |
      | a name differing from an existing tag only in case      |
      | a name differing from an existing tag only in accents   |

  Scenario: A blog editor renames a tag from the screen
    Given a blog editor, with a blog tag "running"
    When they rename it to "trail running"
    Then the tag is shown as "trail running" in the list

  Scenario: Saving a tag under its own unchanged name is accepted on the screen
    Given a blog editor, with a blog tag "running"
    When they save that same tag with the name "running" unchanged
    Then the save is accepted and the tag keeps the name "running"

  Scenario: Renaming a tag onto another tag's name is refused on the screen
    Given a blog editor, with the blog tags "running" and "invierno"
    When they rename "invierno" to "running"
    Then they are shown a validation message on the name field
    And "invierno" keeps its name

  Scenario: A blog editor deletes a tag from the screen
    Given a blog editor, with a blog tag "running"
    When they confirm the deletion of "running"
    Then "running" no longer appears in the blog tag list

  Scenario: Deleting a tag from the screen is never blocked
    Given a blog editor, with a blog tag "running"
    When they open the delete confirmation for "running"
    Then they are shown a plain confirmation naming "running"
    And no usage count, blocked state or reassign-first instruction is shown

  Scenario: An administrator without the blog permission cannot reach the screen
    Given a signed-in administrator who does not hold the blog management permission
    When they try to open the blog tag screen
    Then access is refused

  Scenario: An administrator who may only view the catalog is offered no way to change it
    Given a signed-in administrator holding only the blog view permission
    When they open the blog tag screen
    Then the create, edit and delete controls are shown as unavailable
```

> **Two scenarios that deliberately do not exist here, both of which a reader coming from
> [0025](done/0025-product-categories-ui.md) will expect.** There is no *"deletion is blocked with a
> count"* scenario and no *"the screen offers no confirm-and-proceed control"* scenario — the second
> is meaningless without the first, and the first describes a guard this domain does not have
> (**D-2**). Writing either would be a ghost scenario under
> [rule 6](../../docs/testing/frontend/gherkin-guidelines.md#6-no-ghost-scenarios): PRD's tag Gherkin
> says deletion *"is removed from every post that used it"*, and 0059's own Gherkin spells out the
> consequence — *"the deletion is never blocked, whatever the tag is attached to"*.
>
> **The second half of PRD's delete sentence is also deliberately unscripted here.** *"Removed from
> every post that used it"* is not assertable on this screen: `blog_posts` and `blog_post_tag` do not
> exist (story 0061 owns both), so there is no post to detach from. This story asserts the half that
> is real — the tag is gone and the confirmation never blocks — exactly as 0059's **R-6** takes the
> same position one layer down. The mitigation is a hand-off, not a placeholder test; see **R-6**.

> ⚠️ **Correction, 2026-08-30 — every scenario above stays valid, read as being about the *store default
> language*.** None is deleted and none is rewritten here. Creating a tag genuinely is a
> default-language operation and stays one (0074 **D-7**, 0075 **D-4**), so the create scenarios are
> untouched; the rename and refusal scenarios describe the default language's field, whose refusals now
> render on the default tab. The delete and authorization scenarios are unaffected in every respect.
> **The per-language scenarios — one tab per active store language, an untranslated field showing the
> default's name only as guidance, the same name accepted in two different languages, a refusal
> bringing a hidden tab forward — belong to [0075](0075-blog-tags-language-tabs-ui.md)** and are
> written there. Adding them here would duplicate a scripted contract across two files, which is the
> drift this project's conventions spend most of their effort preventing.
>
> One scenario above acquires a second reason to be true, worth knowing before it is implemented:
> *"Renaming a tag onto another tag's name is refused"* is now refused **per store language** (0074
> **D-1**), so the same name in a *different* language is legitimately accepted — 0075 scripts that
> positive case, and this file's negative one is unchanged.

## Files to create/modify

**Owned by this story:**

| Path | Change | Why |
| --- | --- | --- |
| `app/Livewire/BlogTags/Index.php` | **New.** | Class-based component per [base-standards.md](../../docs/conventions/base-standards.md#livewire-component-convention-class-based-not-single-file). Namespace chosen in **D-3**. |
| `resources/views/livewire/blog-tags.blade.php` | **New — the *flat* path.** | Per the [`Index`-in-a-subfolder exception](../../docs/conventions/naming.md#exception-a-component-named-index-resolves-to-its-parent-folders-name), `App\Livewire\BlogTags\Index` drops `.index` and kebab-cases the folder on the way down, exactly as `SalesRegions\Index` → `sales-regions.blade.php`. **Do not create `livewire/blog-tags/index.blade.php`** — and check for one afterwards; task 0017's `artisan make:` scaffold deposited exactly that unused stub, which broke nothing and simply sat there. |
| `routes/blog-tags.php` | **New.** | One route, its own `auth`+`verified` group — the one-file-per-area convention. Snippet below. |
| `routes/web.php` | **Modify — one `require` line.** | `require __DIR__.'/blog-tags.php';`, matching the one-line diff every prior area file produced. |
| `config/modules.php` | **Modify — a `groups.blog` group + an `items.blog_tags` entry.** | The sidebar half of the module gate (**D-4**). Two appended array literals; the reading component is **not** touched. |
| `lang/en/navigation.php`, `lang/es/navigation.php` | **Modify — one `groups.blog` + one `items.blog_tags` leaf each.** | The registry-mirroring rule ([naming.md](../../docs/conventions/naming.md#translation-keys)). Key-for-key identical. |
| `lang/en/blog-tags.php`, `lang/es/blog-tags.php` | **New.** | This screen's own copy (**D-8**). Key-for-key identical. |
| `tests/Feature/Blog/BlogTagsIndexTest.php` | **New.** | Component + route authorization. Folder decided in **V-3**. |
| `tests/Feature/Blog/BlogTagsIndexRenderingTest.php` | **New.** | View-level rendering, including the **negative** structural assertions in **R-2**. |
| `tests/Browser/BlogTags/IndexTest.php` | **New.** | Pest 4 browser tests. Path decided in **V-1** — mirrored, not flat. |
| `tests/Feature/Navigation/SidebarModuleGatingTest.php` | **Modify.** | Three entry-specific assertions, per **D-4**. The two *generic* drift guards already cover the new entry for free — do not hand-write a redundant copy. |
| `tests/Unit/ArchitectureTest.php` | **Modify (optional — see OQ-5).** | One single-namespace fence, never `expect([...])`. |

```php
// routes/blog-tags.php
<?php

use App\Livewire\BlogTags\Index as BlogTagsIndex;   // aliased: `Index` is ambiguous across four areas now
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    // `can:blog.view`, not Spatie's `permission:` — same reason as users.index /
    // roles.index / sales-regions.index: Livewire 4's PersistentMiddleware
    // allowlist carries Laravel's `Authorize` (`can:`) but not Spatie's
    // `PermissionMiddleware`, so a `permission:`-gated route would protect the
    // initial GET only, leaving every save()/deleteTag() /livewire/update
    // round-trip unauthorized. See docs/architecture/authorization.md.
    Route::livewire('blog/tags', BlogTagsIndex::class)
        ->middleware(['can:blog.view'])
        ->name('blog-tags.index');
});
```

The verbatim duplication of that comment from `routes/roles.php` / `routes/sales-regions.php` is
**the convention, not an oversight** — a reader auditing one area file must not have to open another
to learn why.

**Explicitly NOT touched** (consumed as already-shipped code from 0059, so the boundary is
unambiguous):

| File | Owner |
| --- | --- |
| `database/migrations/*_create_blog_tags_table.php` | 0059 |
| `app/Models/BlogTag.php` | 0059 |
| `app/Actions/Blog/{Create,Rename,Delete}BlogTag.php` | 0059 |
| `app/Actions/Blog/FindOrCreateBlogTag.php` | 0059 (created) — **never called by this story**; its consumer is 0063 |
| `app/Concerns/BlogTagValidationRules.php` | 0059 |
| `app/Policies/BlogTagPolicy.php` | 0059 |
| `app/Actions/NormalizeForSearch.php` | 0022 (see 0059's **OQ-2**) |
| `database/factories/BlogTagFactory.php` | 0059 |
| `database/seeders/RolePermissionSeeder.php` | nobody — `blog` is already in `MODULES` (verified), so `blog.view`/`.create`/`.edit`/`.delete` all exist with **zero** seeder change |
| `resources/views/components/sidebar-nav.blade.php`, `resources/views/layouts/app/sidebar.blade.php` | 0013 — **append data to the registry, never edit the reader** |
| Blog categories' table/model/actions/screen | 0058 / **0062** |
| `blog_posts`, `blog_post_tag`, the post editor | **0061** / **0063** |

### Interface contract consumed from 0059

**Read the following as a claim about a task file, not about code — see F-1.**

```php
App\Models\BlogTag                                                 // HasUuids (v7), #[Fillable(['name'])], no SoftDeletes,
                                                                   //   normalized_name derived by a saving() hook (0059 D-4)
App\Policies\BlogTagPolicy                                         // viewAny/create/update/delete -> blog.view/create/edit/delete
                                                                   //   VIEW_/CREATE_/EDIT_/DELETE_PERMISSION public consts
App\Actions\Blog\CreateBlogTag::__invoke(string $name): BlogTag     // trims, AUTHORIZES, VALIDATES (nameRules), logs refusals,
                                                                   //   catches 23000 -> ValidationException on `name`
App\Actions\Blog\RenameBlogTag::__invoke(BlogTag $t, string $n): BlogTag  // same, with ->ignore($t->id) internal
App\Actions\Blog\DeleteBlogTag::__invoke(BlogTag $t): bool          // UNCONDITIONAL. No in-use guard, today or ever (0059 D-8)
App\Concerns\BlogTagValidationRules::nameRules(NormalizeForSearch $n, ?string $id = null): array   // format + uniqueness
App\Concerns\BlogTagValidationRules::nameFormatRules(): array       // format ONLY — this screen must never reach it (0059 D-9)
```

> ⚠️ **Correction, 2026-08-30 — two lines of that block are falsified by [0074](0074-translatable-content-retrofit-blog-tags-backend.md), and this is the correction 0075's own R-6 asks for by name** (its backlog item 1: *"correct 0060's stale interface contract in place"*). Both are corrected here rather than left for whoever implements this story to write against a shape that will not exist.
>
> **(a) The `BlogTag` line.** It says `#[Fillable(['name'])]` and *"`normalized_name` derived by a `saving()` hook (0059 D-4)"*. **Every clause of that is false after 0074:** the model becomes **identity-only** with `#[Fillable([])]` (0074 **D-2**), there is no `name` column and no `normalized_name` column on `blog_tags` at all, and the `saving()` hook **relocates** to `App\Models\BlogTagTranslation` (0074 **D-4** — which is also what lets `SetTranslation` stay unmodified). Read instead:
>
> ```php
> App\Models\BlogTag              // HasUuids (v7), #[Fillable([])], no SoftDeletes, identity-only.
>                                 //   use HasTranslations; translationModel() => BlogTagTranslation::class
>                                 //   Read a name with $tag->translated('name')  — NEVER $tag->name
> App\Models\BlogTagTranslation   // 0074's. (blog_tag_id, store_language_id) unique; name + normalized_name;
>                                 //   carries the relocated saving() hook. UNIQUE(store_language_id, normalized_name)
> ```
>
> **(b) `nameRules()`'s signature.** It is **re-signed** by 0074's **D-6**: uniqueness is now scoped per store language, and the self-exclusion is an explicit `blog_tag_id` clause rather than `->ignore()` — because `->ignore()` retargeted at `blog_tag_translations` would compile to `WHERE id != <a blog_tags id>`, a disjoint key space that silently matches nothing and refuses **every** same-name re-save in every language, permanently (0074 **R-5**). The shape is `nameRules(NormalizeForSearch $n, string $storeLanguageId, ?string $blogTagId = null)`, with 0074's **D-6** leaving the exact Laravel expression to its own Phase 3. `nameFormatRules()` is **unchanged** (0074 **D-13**), and this screen still must never reach it.
>
> **What this does *not* change.** `CreateBlogTag`, `RenameBlogTag` and `DeleteBlogTag` keep their signatures byte-for-byte (0074 **D-7**, **D-15**); `CreateBlogTag` gains an internal `DB::transaction()` and `RenameBlogTag` does not (0074 **D-5**), neither of which is visible to this caller. `BlogPolicy`'s four abilities and their constants are untouched. The *meaning* of both write actions narrows to **"the default store language's name"** — which is the whole reason 0075 has to add a third action for the other languages.
>
> **F-1 still binds, and now doubly.** This contract was already a claim about one unimplemented task file; it is now a claim about **two** (0059 and 0074). Re-verify every line against `HEAD` before Phase 3 and record each disposition, per [the deferred-findings rule](../../docs/errors-log.md#a-deferred-storys-findings-were-claims-about-a-tree-that-no-longer-existed-and-one-of-them-would-have-reopened-a-bug-in-this-log--2026-08-23). 0074's own **R-2** (whether `SetTranslation` can write `store_language_id` at all, given `#[Fillable]`) is unresolved and is 0070's to settle.

**Three obligations this story inherits verbatim from 0059's Definition of Done**, all
non-negotiable:

1. **This story is where `BlogTagPolicy` stops being a zero-call-site policy.** 0059 names 0060 by
   number as the story that gives it its first *component* call site.
2. **The id fed to `Rule::unique()->ignore()` must stay server-authoritative** — `#[Locked]`, and the
   rename must be performed against a model re-read from the database, never against a
   client-supplied string. See
   [security/livewire-authorization.md](../../docs/security/livewire-authorization.md) and **D-6**.
3. **The component authorizes too.** 0059's **D-12** is explicit that the component's own checks are
   *defence in depth, not duplication to remove* — they fail fast before the action opens anything
   and they make the per-row `canEdit`/`canDelete` hints honest.

### Component public surface

```php
namespace App\Livewire\BlogTags;

use App\Actions\Auth\LogRefusedPrivilegedAttempt;
use App\Actions\Blog\CreateBlogTag;
use App\Actions\Blog\DeleteBlogTag;
use App\Actions\Blog\RenameBlogTag;
use App\Models\BlogTag;
use Illuminate\Support\Facades\Gate;
use Livewire\Attributes\Locked;
use Livewire\Attributes\Title;
use Livewire\Component;

#[Title('Blog tags')]
class Index extends Component
{
    // NOTE: deliberately does NOT `use BlogTagValidationRules;` — see D-1.

    /** @var array<int, array{id: string, name: string, canEdit: bool, canDelete: bool}> */
    #[Locked]
    public array $tags = [];

    #[Locked]
    public ?string $editingTagId = null;      // written only from $tag->id, never from the argument

    public bool $showModal = false;

    public string $name = '';                 // never ?string — the "no wire:model-bound property is
                                              //   ever null" rule binds even with no <select> here

    public bool $showDeleteModal = false;

    #[Locked]
    public ?string $deletingTagId = null;

    #[Locked]
    public string $deletingTagName = '';

    public function mount(): void;                                              // Gate::authorize('viewAny', …) — unlogged
    public function openCreateModal(LogRefusedPrivilegedAttempt $l): void;      // ->authorize('create', BlogTag::class)
    public function openEditModal(string $tagId, LogRefusedPrivilegedAttempt $l): void;   // findOrFail, ->authorize('update', $tag)
    public function save(CreateBlogTag $c, RenameBlogTag $r, LogRefusedPrivilegedAttempt $l): void;
    public function closeModal(): void;                                          // + resetValidation()
    public function confirmDelete(string $tagId, LogRefusedPrivilegedAttempt $l): void;   // findOrFail, ->authorize('delete', $tag)
    public function deleteTag(DeleteBlogTag $d, LogRefusedPrivilegedAttempt $l): void;    // no try/catch — see D-2
    public function closeDeleteModal(): void;

    private function loadTags(): void;
}
```

> ⚠️ **Correction, 2026-08-30 — three items in the surface above are affected by [0074](0074-translatable-content-retrofit-blog-tags-backend.md) / [0075](0075-blog-tags-language-tabs-ui.md). The class is otherwise unchanged**, and in particular `$editingTagId` / `$deletingTagId` / `$deletingTagName` stay `#[Locked]`, every method still authorizes through `LogRefusedPrivilegedAttempt`, and `mount()` stays the one deliberate unlogged exclusion.
>
> **(a) The `$tags` row shape.** It is declared `array{id: string, name: string, canEdit: bool, canDelete: bool}`, and `name` reads as a column. **It is no longer one.** After 0074 there is no `blog_tags.name`, so the row's `name` is **derived** — `translated('name')` resolved for the **store default** store language (0075 **D-8**: the store default, *never* the admin UI locale, which PRD is explicit must not be conflated with it). It can legitimately be **absent**: 0074's **R-9** records that immediately after a store-default change this may be true of *most of the catalog*, and 0075 **D-8** renders that as the em-dash-style placeholder `users.blade.php` / `roles.blade.php` / `sales-regions.blade.php` already use — never a blank and never an error. **The four keys are otherwise unchanged, and the D-5 "no post/usage-count key" assertion is unaffected.** ⚠️ **Undecided, and flagged rather than guessed:** whether the PHP type becomes `name: ?string` (the component surfaces `null` and the view branches) or stays `name: string` (the component maps a missing translation to `''` and the view branches on empty). 0075 states the *behaviour* — placeholder, no error — but not the array shape, and this file cannot settle a property of a component 0075 rewrites. **Phase 2 decides**; whichever is chosen, 0060's own "no `wire:model`-bound property is ever `null`" rule does not reach it, because `$tags` is `#[Locked]` and bound to nothing.
>
> **(b) `loadTags()`'s `orderBy('name')` is no longer executable** — `frontend-expert`'s correction, recorded as 0075 **D-8**. There is no `name` column to sort on, so the SQL ordering has to become a **sort after fetch**, keeping the `id` tiebreak. **D-9** below carries the same correction. ⚠️ **Also undecided:** where a row whose default-language name resolves to *nothing* sorts. 0075 does not say, and this is a visible product choice on a screen where 0074's **R-9** makes that state common — first, last, or interleaved as an empty string. **Phase 2 decides.**
>
> **(c) `public string $name = ''` remains the *create* field, and stops being the whole edit form.** 0075 **D-4** keeps the create form exactly as specified here — one field, `CreateBlogTag`, no tabs — while the **edit** form becomes one input per active store language, held in a `public array $names` keyed by store-language id. The property is not deleted and the never-`null` rule (trap 4 below) still binds it. See the [view section's correction](#the-view-what-it-renders-and-its-data-test-hooks) for the markup consequence and the hook-naming ambiguity it raises.

`loadTags()` is private and builds the row array with
`BlogTag::query()->orderBy('name')->orderBy('id')->get()` — **superseded, see (b) above** — mapping
`canEdit`/`canDelete` from
`Gate::allows('update'|'delete', $tag)` — the *same* policy methods `save()` / `deleteTag()`
authorize against, so the disabled state cannot drift from what a click would actually do
([authorization.md](../../docs/architecture/authorization.md#gateallows-in-a-list-query-is-a-ui-hint-not-a-layer)).
There is **no `withCount()`** of any kind: `BlogTag` ships no `posts()` relation and `blog_post_tag`
does not exist (**D-5**).

`save()`'s full shape — note there is no `$this->validate()` call and no manual `trim()`:

```php
public function save(CreateBlogTag $createBlogTag, RenameBlogTag $renameBlogTag, LogRefusedPrivilegedAttempt $log): void
{
    if ($this->editingTagId === null) {
        $log->authorize('create', BlogTag::class);
        $createBlogTag($this->name);
    } else {
        $tag = BlogTag::query()->findOrFail($this->editingTagId);
        $log->authorize('update', $tag);
        $renameBlogTag($tag, $this->name);
    }

    $this->loadTags();
    $this->closeModal();
}
```

> ⚠️ **Correction, 2026-08-30 — the *create* branch above survives verbatim; the *rename* branch becomes one write per language, and [0075](0075-blog-tags-language-tabs-ui.md) owns that rewrite.**
>
> **What stays true, and is the reason this is a correction rather than a redesign.** `CreateBlogTag` and `RenameBlogTag` are called exactly as written, with exactly these signatures, for the **default store language** — 0074 **D-7** keeps both deliberately, and 0075 **D-12** explicitly *rejects* routing the default language through the new action, so `RenameBlogTag` stays the named writer of the default-language name. **D-1** below is unchanged: there is still no `$this->validate()` and no manual `trim()` here.
>
> **What 0075 adds.** The edit path loops the active store languages and calls a **third** action, `App\Actions\Blog\SetBlogTagTranslation::__invoke(BlogTag $t, StoreLanguage $l, string $name)`, for every **non-default** language whose value changed. That action is *self-sufficient* — it authorizes `update` on the **`BlogTag`** (never on the translation row) through `LogRefusedPrivilegedAttempt`, **above** its `SetTranslation` call, and then runs its own `Validator` — which is what keeps **D-1**'s "the component does not validate" rule intact rather than contradicting it. The whole loop is wrapped in a `DB::transaction()` so one refused language discards the entire save (0075 **D-9**). Authorization fires **once per language written**, never once for the active tab.
>
> ⚠️ **The consequence this file must not let a reader miss, because it lands squarely on D-1 and is worse here than anywhere else** (0075 **D-12**). `CreateBlogTag` and `RenameBlogTag` throw `ValidationException` keyed **`name`** — 0059's shape, frozen by 0074 **D-7** — while 0075's edit fields bind to **`names.{storeLanguageId}`**. An unadapted refusal therefore lands on a key no field renders: **the modal stays open with no message anywhere**, the silent-refusal failure mode task 0018 shipped as a blocking finding. On sibling screen [0071](0071-product-categories-language-tabs-ui.md) the same adapter guards *"realistically the `23000` race backstop"*, because that component validates first. **Here it sits on the primary path**: precisely because **D-1** forbids this component from validating, the action's throw is the *only* validation route for the default language, so **every** ordinary blank, over-length, duplicate, case-only and accent-only refusal on the default tab arrives keyed `name`. 0075's `save()` therefore catches and re-keys `name` → `names.{$defaultLanguageId}`. **The create path keeps the bare `name` key and must not grow an adapter** — the mismatch is a property of the edit form's array binding, not of the actions.
>
> **`save()`'s injected-actions assertion is extended, not replaced.** `SetBlogTagTranslation` joins the allow-list; **`FindOrCreateBlogTag` stays forbidden**, and every scope fence in this file about it is unchanged and still binding.

**Which methods authorize, and against what.** Every public method except the two `close*Modal()`
resets — matching `App\Livewire\SalesRegions\Index`'s allow-list exactly, and matching
`App\Livewire\Roles\Index` in gating **both** modal openers as well as the write methods.
`mount()` uses a bare `Gate::authorize()` and is **deliberately unlogged**, inheriting the recipe's
own reasoning verbatim: the route's `can:blog.view` checks the identical ability, and `can:` **is**
on Livewire's `PersistentMiddleware` allow-list, so a refusal there is unreachable over HTTP. Every
other site routes through `LogRefusedPrivilegedAttempt::authorize()` with `target_type: 'blog_tag'`
passed **explicitly** — `resolveTarget()` auto-resolves only `User` and `Role`, so a new domain must
pass it. See
[the third-admin-screen recipe](../../docs/architecture/authorization.md#copyable-what-a-third-admin-screen-inherits).

### The `->ignore()` id contract

`$editingTagId` is `#[Locked]` **and** is assigned only from `$tag->id` — the primary key of a row
just read back out of the database inside `openEditModal()` — never from the raw `string $tagId`
argument. At save time the component does not feed that property into a validation rule at all: it
re-fetches with `findOrFail()` and hands the **model instance** to `RenameBlogTag`, which derives the
`->ignore()` value from `$blogTag->id` internally.

**Without `#[Locked]`, a forged `->set('editingTagId', $otherId)` between opening the modal and
saving turns a uniqueness check into a rename-any-tag primitive** — identical to
[0025's **R-3**](done/0025-product-categories-ui.md), and exactly the vulnerability class 0059's hand-off
note names. The two lines are a pair; the dedicated retarget test in the plan below is what pins
them.

### The view: what it renders, and its `data-test` hooks

`resources/views/livewire/blog-tags.blade.php` is deliberately the **simplest list screen in the
repo** — one data column, no status badge, no count column, no permission matrix, no toggle, no
grouping, no nested rows:

- **Header** — the page title and a primary "New tag" `flux:button`, `data-test="create-blog-tag-button"`.
- **Table** — a `flux:table` whose only data column is the tag name, plus icon-only edit/delete row
  actions.
- **Empty state** — `blog-tags.index.empty` when `$tags` is empty.
- **Create/edit modal** — one `flux:input` bound to `name`, its inner content wrapped in
  `@if ($showModal)` so only one "Cancel" control is ever in the DOM (the pattern
  `users.blade.php` / `roles.blade.php` / `sales-regions.blade.php` all use).
  ⚠️ **Correction, 2026-08-30 — true of the *create* modal only.** [0075](0075-blog-tags-language-tabs-ui.md)
  **D-4** keeps the create form exactly as described (one field, no tabs); the **edit** modal becomes
  0071's shared `<x-language-tab-strip>` plus **one `flux:input` per active store language**, every one
  of them present in the DOM regardless of which tab is active. The `@if ($showModal)` wrapper and the
  single-"Cancel" rule are unchanged.
- **Delete-confirmation modal** — names the target via `$deletingTagName`, wrapped in
  `@if ($showDeleteModal)`, and carries **no error outlet of any kind**, because there is no
  refusal to render (**D-2**). Its copy should say plainly that the tag will be removed from any post
  using it — PRD's own wording — since there is genuinely no undo and no reassignment step.

**`data-test` hooks**, icon-only row actions present on **both** the enabled and the disabled branch
so a test selects the same control either way:

| Hook | On |
| --- | --- |
| `create-blog-tag-button` | the header's primary action |
| `edit-blog-tag-{id}` | the row's edit action, both branches |
| `delete-blog-tag-{id}` | the row's delete action, both branches |
| `blog-tag-name-input` | the modal's one field |
| `confirm-delete-blog-tag` | the delete modal's destructive button |
| `sidebar-group-blog`, `sidebar-link-blog_tags` | rendered by `<x-sidebar-nav />` from the registry keys — nothing to author |

The hook names carry the **full** domain (`blog-tag`, not `tag`) — see **V-2**.

> ⚠️ **Correction, 2026-08-30 — one row of that table changes, and [0075](0075-blog-tags-language-tabs-ui.md) adds two hook families this file cannot name.** Every other hook above (`create-blog-tag-button`, `edit-blog-tag-{id}`, `delete-blog-tag-{id}`, `confirm-delete-blog-tag`, and both sidebar hooks) is **unchanged**, and **V-2**'s full-domain rule is unchanged with them.
>
> - **`blog-tag-name-input` becomes `blog-tag-name-input-{storeLanguageId}`** on the edit form — one per active language, keyed on the **store-language id**, never on the ISO code or the language name (0075 **D-10**, and its **D-11** inheritance from 0071: *no assertion in that story may match on a language name or a two-letter code*). Every browser test that fills this hook is rewritten there.
> - **A tab hook this file's own V-2 rule deliberately does *not* govern.** The tab strip is a **shared** anonymous Blade component extracted by sibling story [0071](0071-product-categories-language-tabs-ui.md) and consumed by four screens, so it emits its own **generic** `data-test="language-tab-{storeLanguageId}"` — not a `blog-tag-`-prefixed one. 0075 **D-10** records this as a deliberate split rather than an inconsistency: *the shared strip's hooks are generic, this screen's own panel hooks are domain-prefixed*. Both of 0075's amigos independently proposed the prefixed form on V-2's reasoning before the reconciliation overturned it, so a reviewer arriving from V-2 will expect the wrong answer — which is why it is written down here.
>
> ⚠️ **Genuinely ambiguous, and not resolved here: what hook the *create* modal's single field carries.** 0075 states both *"`blog-tag-name-input` **becomes** `blog-tag-name-input-{storeLanguageId}`"* (its disposition table) **and** *"the create form is unchanged: one field, `CreateBlogTag`, no tabs"* (its acceptance criteria). Those cannot both be literally true of the create field. The two readings — it keeps the bare hook because it is unchanged, or it takes the default language's suffix for uniformity — have different consequences for 0060's own browser tests, which fill it. **Phase 2 should settle it in 0075**, not here; recorded so it is met as a decision rather than discovered in a failing selector.

Both `wire:click` arguments — `openEditModal(@js($tag['id']))` and
`confirmDelete(@js($tag['id']))` — are **single-argument** `@js()` calls, the shape
`roles.blade.php` already ships and the shape
[errors-log.md's dated correction](../../docs/errors-log.md#two-directive-calls-in-one-blade-component-tags-attribute-string-silently-fail-to-compile--2026-08-26)
confirms compiles correctly inside a `flux:` component tag. **This screen has no multi-argument
`wire:click` anywhere** — no `setActive(id, bool, replacement)`-shaped signature exists — so the trap
that killed every row toggle on the Sales Regions screen does not recur here structurally. Record
that in a one-line comment at each call site anyway, so a future "for consistency" edit does not
introduce one.

### Runtime traps — which apply, and which must not be defensively applied

**Apply:**

1. **`@js()` is mandatory** on both `wire:click` arguments. A value interpolated into a `wire:*`
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
5. **`closeModal()` must `resetValidation()`.** Livewire persists the error bag across requests via
   `SupportValidation::dehydrate()`/`hydrate()`. Both `Roles\Index` and `SalesRegions\Index` needed
   this, and 0018 shipped its omission as a **blocking** Phase 5 finding (B1). Do not rediscover it.

**Do NOT apply — recorded so nobody adds them "defensively":**

1. **No `null`-property / native-`<select>` trap.** There is no `<select>` anywhere on this screen —
   one text input, nothing else — so there is no `selectedIndex` state to desync. (Rule 4 above still
   holds, for the ordinary reason.)
2. **No two-`@js()`-in-one-attribute trap**, per the structural argument above.
3. **No `<input type="checkbox">` + `wire:click="$toggle(...)"` binding** — nothing on this screen
   toggles a boolean.
4. **No `<ui-checkbox` count-assertion trap** — no checkbox grid exists here.
5. **No `wire:model.live`** on anything — no field on this form needs to round-trip before Save.

## Tests to perform

Levels chosen per [coverage-policy.md](../../docs/testing/frontend/coverage-policy.md). **The
deliberate calibration is that this plan does not re-run 0059's suite one layer up**: 0059 already
proves normalisation, trimming, boundary and race behaviour exhaustively at the action layer, so this
story asserts only that the **component routes into the same shared rule**, with named canaries
rather than the full matrix.

> ⚠️ **Correction, 2026-08-30 — the calibration above is unchanged and is inherited by [0075](0075-blog-tags-language-tabs-ui.md) verbatim, but several cases below stop being valid once 0074/0075 land.** 0075's own §3 carries the authoritative disposition table and **that table is the source of truth**, not this note; it is summarised here only so a reader of *this* file does not write a test against a column that no longer exists. 0075's `frontend-qa` records the rewrite as **real scope rather than a byproduct** — the same warning 0074's **R-7** issues about 0059's suite, arriving one layer up.
>
> | Case in this plan | Disposition |
> | --- | --- |
> | *"The list is ordered by name"* | **Retargeted** — the ordering moves out of SQL (0075 **D-8**), so the assertion is unchanged in intent but must not be written against `orderBy('name')`. See the undecided sort position for untranslated rows, flagged above. |
> | *"Each row exposes exactly `{id, name, canEdit, canDelete}`"* | **Rewritten** — `name` is `translated('name')` for the store default and may be absent. **The "no post/usage-count key" half of this assertion is unaffected and must survive** (**D-5**). |
> | *"Blank / whitespace-only names produce `assertHasErrors(['name'])`"* | **Split** — the **create** path keeps the `name` key; the **edit** path's key becomes per-language, `names.{storeLanguageId}`. |
> | The exact-case, case-only and accent-only duplicate canaries | **Rewritten per language** — a duplicate *within* one language errors; the byte-identical string in a *different* language does not (0074 **D-1**). |
> | The length-boundary canary | **Survives**, retargeted at a per-language field. **OQ-2** (derive the maximum from the shared constant) still applies unchanged. |
> | *"`save()`'s injected actions are `CreateBlogTag` / `RenameBlogTag`, never `FindOrCreateBlogTag`"* | **Extended, not replaced** — `SetBlogTagTranslation` joins the allow-list; `FindOrCreateBlogTag` stays forbidden (**R-7** unchanged). |
> | The four rename tests, **including the `#[Locked]` retarget test** | **Re-derived per language** — the retarget test must throw whichever tab is active. The obligation itself (**D-6**, **R-1**) is unchanged and is still this story's hand-off from 0059. |
> | *"The create/edit modal contains exactly **one** input and no `<select>`"* | **Inverted for the edit modal** — it now holds exactly **N** inputs for N active languages, and the negative assertion becomes *an inactive language has no tab and no input*. **The create modal's version of this assertion survives unchanged.** |
> | Everything in the **delete** block, and every negative assertion behind **D-2** | **Untouched.** Deletion is not translatable and neither story goes near it. This story's signature test is unaffected. |
> | The whole **Authorization** block, the refusal-logging equivalence test, and the malformed-id cases | **Untouched** — no new ability, no new permission, catalog still **42** (0074 **D-12**, 0075 **D-11**). |
> | `tests/Feature/Navigation/SidebarModuleGatingTest.php` extensions | **Untouched** — 0075 adds no registry entry. |
> | `tests/Feature/Policies/BlogTagPolicyTest.php` | **Untouched** (0059's). |
>
> **One case in this plan gets *harder* rather than merely rewritten, and it is worth naming.** *"A duplicate name (exact case) produces `assertHasErrors(['name'])`"* on the **edit** path now depends on 0075's **D-12** re-key adapter working, because the refusal is thrown keyed `name` by `RenameBlogTag` while the field binds to `names.{defaultId}`. 0075 makes that its second-highest-value test, asserted as `assertHasErrors(['names.'.$defaultId])` **plus** an explicit `assertHasNoErrors(['name'])`. **R-3** below is also unchanged and still binds: this story's case/accent canaries cannot prove `NormalizeForSearch` ran, and that proof still lives entirely in 0059's two blocking whitespace tests.

**Feature — `tests/Feature/Blog/BlogTagsIndexTest.php`**

*Listing*
- [ ] The list is ordered by name. Create out of order, assert alphabetical. *Why it can fail:*
      nothing in the schema enforces order (0059 **D-6** ships no `sort_order`); only the query does,
      silently.
- [ ] Each row exposes exactly `{id, name, canEdit, canDelete}` — **and asserts the absence of any
      post/usage-count key.** *Why it can fail:* a developer mechanically adapting
      `ProductCategories\Index`'s specified `->withCount('products')` would reach for
      `->withCount('posts')` against a relation `BlogTag` does not have — or, worse, hardcode a `0`
      that reads as real data (**D-5**).

*Create*
- [ ] A valid name persists exactly one row and the modal closes.
- [ ] Blank and whitespace-only names produce `assertHasErrors(['name'])` and add zero rows. *Why:*
      proves `save()` reaches the action's own trim-then-validate rather than persisting the raw
      `wire:model` value (0059 **R-2**, one layer up).
- [ ] A duplicate name (exact case) produces `assertHasErrors(['name'])`.
- [ ] **One canary each** for a case-only and an accent-only duplicate — not the full matrix. *Why
      this is not redundant with 0059:* a component built independently could bypass the action and
      validate with a bare `Rule::unique('blog_tags', 'name')`, missing **D-3**'s normalised
      comparison entirely; this is the only test at this layer that would catch that. **See R-3 for
      why these two canaries cannot prove the normaliser ran.**
- [ ] **One** length-boundary canary (max accepted, max+1 refused), reading the maximum from the
      shared trait/constant rather than a hardcoded literal — 0059's **OQ-1** (100 vs 255) may still
      be open when this is written (**OQ-2**).
- [ ] **`save()`'s injected actions are `CreateBlogTag` / `RenameBlogTag`, never
      `FindOrCreateBlogTag`.** *Why it can fail:* swapping in the find-or-create action would make
      every duplicate-name submission silently **succeed** instead of erroring, quietly deleting half
      this story's Gherkin — and every `assertHasErrors()` test above would go red in a way that
      invites "fixing" the assertion rather than the call (**R-7**).

*Rename*
- [ ] Renaming to a free name updates the row.
- [ ] Saving under the tag's **own unchanged name** is accepted — 0059 **R-1**'s canary, exercised
      here for the first time against a component call site.
- [ ] **The `->ignore()` id is server-authoritative.** `->call('openEditModal', $a->id)
      ->set('editingTagId', $b->id)` must **throw**, not silently retarget the rename onto `$b`.
      *Why it earns its own test:* 0059's Definition of Done names this as **this story's** hand-off
      obligation by number, and nothing else in the plan proves it. **The single most important test
      in this file.**
- [ ] Renaming onto another tag's exact-case name is refused and the target keeps its name.

*Delete — the structural divergence from every prior taxonomy screen*
- [ ] Deleting a tag removes the row unconditionally and it disappears from the reloaded list.
- [ ] `deleteTag()` closes the modal in one round trip — there is no branch in which it stays open
      with an inline error, because `DeleteBlogTag` throws nothing to catch. *Why it can fail:* an
      implementer structurally copying `deleteProductCategory()` (built to leave the modal open on a
      caught `ValidationException`) would paste defensive branching around an exception that cannot
      occur here — harmless as code, and the seed of **R-2**.
- [ ] **No `force` / confirm-and-proceed path exists** — assert positively that the delete is
      unconditional, since the *absence* of a guard is this story's actual contract (**D-2**) and a
      later reader would otherwise read it as an oversight. This mirrors 0059's own "no in-use guard
      exists" test one layer up.

*Authorization*
- [ ] `viewAny` / `create` / `update` / `delete` each get **both an allow and a deny** at **two
      layers**: the route (`$this->get(route('blog-tags.index'))->assertOk()` / `assertForbidden()`)
      **and** the component (`Livewire::test()` mounting directly, and `save()` / `deleteTag()`
      throwing `AuthorizationException` for a denied actor). Genuinely not substitutes, per
      [testing/README.md](../../docs/testing/README.md) — the route test never exercises the
      component's own `Gate::authorize()`, and `/livewire/update` never runs most route middleware.
- [ ] A Super Admin holding zero permission rows passes all four via `Gate::before`.
- [ ] **One** global-state test that an actor holding only `blog.view` sees every row action
      disabled — deliberately **not** a Users-shaped per-row matrix (**D-7**, and **OQ-1**).
- [ ] **Every `Gate` refusal this component raises writes exactly one
      `Log::warning('Privileged action refused', …)` carrying `target_type: 'blog_tag'`**,
      set-equated against an existing screen's context keys in one `Log::spy()` session — the
      equivalence test the refusal-logging recipe mandates as step 4. *Why it can fail:* this is
      `BlogTagPolicy`'s **first component call site**; a component that authorizes correctly with a
      bare `Gate::authorize()` but never routes through the logging wrapper passes every other test
      in this file while silently breaking the observability convention every other admin screen
      follows. `mount()` is the one deliberate exclusion.

*Malformed / unknown ids*
- [ ] `openEditModal()` and `confirmDelete()` with an unknown or malformed UUID fail cleanly
      (`ModelNotFoundException`), not as a silent no-op. `HasUuids`' `resolveRouteBindingQuery()`
      rejects a non-UUID before querying.

**Feature — `tests/Feature/Blog/BlogTagsIndexRenderingTest.php`**
- [ ] The list renders each tag's name.
- [ ] The empty state renders when the catalog holds no tags.
- [ ] The create/edit modal contains exactly **one** input and **no `<select>`** — a cheap guard
      against a stray element copy-pasted in from a heavier screen.
- [ ] **The delete-confirmation modal renders no usage count, no "used by N posts" message, no
      "cannot be deleted" string and no blocked state, and its destructive button is never
      `disabled`.** ***The signature test of this story.*** *Why it can fail:* an implementer
      following 0025 as the named structural template could paste that screen's blocked-delete
      callout and conditional-disable logic. Because `DeleteBlogTag` has no guard to trigger it, the
      markup would be **dead but present**, and an ordinary "delete succeeds" test would still pass
      with it sitting in the DOM. Only this negative assertion catches it. Assert against the
      *rendered* modal, not the component's error bag.
- [ ] Validation messages appear next to the name field and the modal stays open.
- [ ] Row action `data-test` hooks are present on **both** the enabled and the disabled branch.
      *Why:* a browser test must select the same control either way; a hook present only when enabled
      makes the disabled-state test unwritable.
- [ ] A disabled row action's disabled state is asserted by matching `disabled="disabled"`, **never**
      a bare `disabled` substring — Flux's compiled class list carries the literal `disabled:opacity-75`
      on the *enabled* branch too, so the naive helper reports every control as disabled and the test
      can never fail.

**Feature — `tests/Feature/Navigation/SidebarModuleGatingTest.php` (extend)**
- [ ] A role holding exactly `blog.view` sees both `sidebar-group-blog` and `sidebar-link-blog_tags`.
- [ ] A role holding the related-but-different `blog.edit` sees **neither** — the entry gates on the
      exact ability its route does, not on any `blog.*`.
- [ ] The Blog group vanishes entirely, heading included, for a role without the ability — the
      filter-before-group property.
- [ ] **Do not hand-write a registry↔route cross-check.** Task 0018 verified that both generic drift
      guards already in this file pick a new entry up **for free**; 0018's own plan assumed the
      opposite and would have shipped a redundant copy.

**Browser — `tests/Browser/BlogTags/IndexTest.php`** (path per **V-1**)
- [ ] Opening the create form shows a blank field (no stale prefill leaking from a previous edit).
- [ ] Creating a tag through a real `fill()` + `click('Save')` round trip: the new name appears in the
      list, no JS errors. **This is the one test that proves `wire:model` actually delivers the typed
      value** — `Livewire::test()->set()` writes the property directly and never touches the DOM.
- [ ] Editing prefills the name; re-saving it unchanged preserves it.
- [ ] Cancelling the create form adds nothing.
- [ ] **Deleting a tag through the confirmation modal removes it in one click, with no intermediate
      count or blocked step ever appearing, and no JS errors.** ***The highest-value browser test in
      this story*** — and the exact inverse of
      [0025's highest-value test](done/0025-product-categories-ui.md#tests-to-perform), which proves a
      real block *does* render. Only a real DOM click proves the confirm control was never wired to a
      guard that does not exist server-side, and only a browser test goes through the compiled
      `wire:click` at all.
- [ ] Creating a duplicate name through the real form shows the inline error — proves the `@error`
      binding works in a browser, not merely in the component's error bag.
- [ ] One continuous smoke pass (open create → cancel → open edit → cancel → open delete → cancel)
      asserting `assertNoJavaScriptErrors()` after every step.

> **Browser-testing rules that bind this file**, from
> [playwright-setup.md](../../docs/testing/frontend/playwright-setup.md#waiting-one-call-is-banned-in-this-repo-and-one-is-bounded):
> `->waitForEvent('networkidle')` is **banned outright** — it never settles in this environment, and
> one debugging session's repeated hangs leaked ~60 `playwright run-server` processes and OOM-killed
> the MySQL container. A short bounded `->wait(n)` is the one accepted mitigation and needs a comment
> naming what it compensates for. When a browser test misbehaves here, read the DOM's own
> `[wire:snapshot]` ground truth rather than waiting longer.

**Unit — `tests/Unit/ArchitectureTest.php` (extend — optional, see OQ-5)**
- [ ] `App\Livewire\BlogTags\*` references no product-taxonomy namespace, written as **one
      `expect()` per namespace, never `expect([...])`** — that form is disjunctive and this repo has
      already shipped one vacuous `arch()` rule that way.

**Explicitly not tested here**, per
[what-not-to-test.md](../../docs/testing/qa/what-not-to-test.md):
- **0059's exhaustive normalisation / trim / boundary / race matrix**, including its two *blocking*
  whitespace tests. Owned at the action layer. Only the canaries above belong here; reimplementing
  the matrix is padding, which
  [coverage-review-checklist.md](../../docs/testing/qa/coverage-review-checklist.md) treats as a
  finding.
- **`FindOrCreateBlogTag`, entirely.** This screen never calls it. Any test referencing it is scope
  creep into 0063.
- **Anything asserting a tag was detached from a post, or that `blog_post_tag` reflects a deletion.**
  Neither table exists; such a test would either fail to compile or get "fixed" by someone inventing
  a throwaway pivot. Owned by 0061 (**R-6**).
- **Any blocked-delete count test, `trans_choice` singular/plural digit test, "Super Admin is refused
  identically" test, or "no confirm-and-proceed control" test.** All four are
  `ProductCategories`-specific concepts belonging to a guard that structurally does not exist in this
  domain (**D-2**).
- **`BlogTagPolicy`'s exhaustive allow/deny/narrowness matrix per ability** — owned by 0059's
  `tests/Feature/Policies/BlogTagPolicyTest.php`. This story needs only the wiring tests.
- **Blog categories' screen (0062)** — a sibling story, separate model, separate component.
- **`HasUuids`, Eloquent timestamps, `Rule::unique`'s own SQL, migration mechanics, `trans_choice`'s
  pluralisation engine** — vendor/framework behaviour.
- **Visual / pixel regression** — nothing in this story carries a stated visual-correctness
  requirement.

## Expected outcome

A blog editor holding `blog.view` reaches a **Tags** screen from a new **Blog** sidebar group and sees
every tag listed alphabetically. Holding `blog.create` / `blog.edit`, they create and rename tags
through a single-field modal, with blank, whitespace-only, over-length and duplicate names — including
case-only and accent-only duplicates — each refused inline on the name field. Holding `blog.delete`,
they delete a tag from a **plain** confirmation modal that names the target and states the tag will be
removed from any post using it.

That deletion is **never blocked**: there is no usage count, no reassign-first requirement and no
confirm-and-proceed control anywhere on the screen, because there is nothing to proceed past. This is
the deliberate inverse of the product-categories screen, and it is what PRD Epic 4 asks for.

An administrator without `blog.view` is refused at the route and again inside the component, sees no
Blog group in the sidebar at all, and every refusal is recorded in the audit trail with
`target_type: 'blog_tag'`. Nothing on the screen references blog posts, blog categories, or any
product taxonomy.

> ⚠️ **Correction, 2026-08-30 — one sentence above narrows.** *"sees every tag listed alphabetically"*
> is still the intent, but the name being listed is now `translated('name')` resolved for the **store
> default** language rather than a `blog_tags.name` column, the ordering happens after fetch rather
> than in SQL (**D-9**), and a tag with no default-language translation lists a **placeholder** instead
> of a name — a state 0074's **R-9** says may cover most of the catalog immediately after a
> store-default change. *"Refused inline on the name field"* likewise stays true, with the edit path's
> refusals landing on the per-language field via 0075's **D-12** adapter. **Everything else in this
> section is unchanged**, including the whole second paragraph about the delete never being blocked,
> which is this story's headline outcome and which neither 0074 nor 0075 touches.

## Acceptance criteria

> ⚠️ **Correction, 2026-08-30 — four of the criteria below are narrowed by 0074/0075; the rest are
> unchanged and are still the bar for this story.** Nothing here is *removed*: this story's contract is
> still the route, the gate, the registry entry, the unconditional delete, the `#[Locked]` id and the
> refusal logging.
>
> - *"The list renders every tag ordered by name"* — the name is `translated('name')` for the store
>   default, the sort happens **after fetch** (**D-9**), and an untranslated row renders a placeholder.
>   The `data-test` hooks half of that criterion is unchanged.
> - *"a modal whose only field is `name`"* — true of the **create** modal, which 0075 **D-4** keeps
>   exactly as specified. The **edit** modal holds one field per active store language.
> - *"refused with a message on the `name` field"* — the create path keeps the `name` key; the edit
>   path's key is `names.{storeLanguageId}`, reached for the default language through 0075 **D-12**'s
>   re-key adapter.
> - *"No model, migration, action, policy, factory, seeder, enum, validation trait or
>   permission-catalog change is made"* — **unchanged for 0060**, and worth reading precisely: 0074
>   changes the model, the migration and the validation trait, and 0075 adds one action. Neither is
>   this story doing it, and the **permission catalog stays at 42** across all three (0074 **D-12**,
>   0075 **D-11**).
>
> The two criteria a reviewer should confirm are *untouched* — because they are the ones a mechanical
> Epic 5 pass might erode — are the **unconditional delete** bullet (**D-2**) and the **`->ignore()` id
> is `#[Locked]` and read back out of the database** bullet (**D-6**). Both stand exactly as written.

- [ ] `/blog/tags` is registered as `blog-tags.index`, gated **`can:blog.view`** (never
      `permission:`), in its own `routes/blog-tags.php` inside that file's own `auth`+`verified`
      group, `require`d from `web.php` by a one-line diff.
- [ ] `config/modules.php` gains a `groups.blog` group and an `items.blog_tags` entry whose
      `permissions` is **exactly** `['blog.view']` — the same single ability the route's `can:`
      enforces — with matching leaves in `lang/{en,es}/navigation.php`. The registry key is
      `blog_tags`, **snake_case**, and is simultaneously the config key, the translation leaf and the
      rendered `data-test="sidebar-link-blog_tags"` hook. `sidebar-nav.blade.php` and
      `sidebar.blade.php` are **not** edited.
- [ ] The list renders every tag ordered by name, with an empty state when the catalog is empty, and
      icon-only row actions carrying `aria-label` plus `data-test="edit-blog-tag-{id}"` /
      `data-test="delete-blog-tag-{id}"` hooks **present on both the enabled and the disabled
      branch**.
- [ ] A tag can be created and renamed through a modal whose only field is `name`; blank,
      whitespace-only, over-length, duplicate, case-only-duplicate and accent-only-duplicate names are
      each refused with a message on the `name` field and add no row.
- [ ] Saving a tag under its own unchanged name is accepted.
- [ ] **A tag can be deleted unconditionally from a confirmation modal naming the target, and no
      usage count, blocked state, reassign-first instruction or confirm-and-proceed control exists
      anywhere on the screen.**
- [ ] The component does **not** compose `BlogTagValidationRules` and does **not** call
      `$this->validate()`; it calls the action and lets `ValidationException` propagate into the
      error bag (**D-1**). It never references `FindOrCreateBlogTag`.
- [ ] `Gate::authorize()` (through `LogRefusedPrivilegedAttempt`) is the first statement of every
      public method that mutates **or discloses**, `mount()` excepted and unlogged; every refusal logs
      `target_type: 'blog_tag'`.
- [ ] The id fed to `Rule::unique()->ignore()` is `#[Locked]` and read back out of the database, and a
      client-side retarget attempt throws.
- [ ] Per-row `canEdit` / `canDelete` come from the same `BlogTagPolicy` methods the mutating methods
      authorize against.
- [ ] `closeModal()` calls `resetValidation()`.
- [ ] Every user-facing string is a translation key in `lang/{en,es}/blog-tags.php` or a bare `__()`
      call per **D-8**; the two locale files stay key-for-key identical.
- [ ] No model, migration, action, policy, factory, seeder, enum, validation trait or
      permission-catalog change is made.
- [ ] Nothing on the screen references blog posts, blog categories or any product taxonomy.

## Definition of Done

- [ ] Tests written and green, plus the **full** existing suite in a single isolated run, per
      [contracts.md](../../docs/contracts.md#full-test-suite-gate-rule)'s Full Test Suite Gate Rule.
- [ ] **All three quality gates run unscoped and each result recorded, including "not run"** —
      `php artisan test`, `vendor/bin/pint --format agent`, and `vendor/bin/phpstan analyse`
      (Larastan level 7). The third is the one nothing else prompts you to run; see
      [errors-log.md](../../docs/errors-log.md#a-verification-record-that-lists-two-of-three-quality-gates-is-a-record-of-two-gates--2026-08-26).
- [ ] **Story 0059 is closed, with its two *blocking* whitespace tests intact** — a hard prerequisite,
      not a courtesy. See **R-3**: this story's own case/accent canaries cannot prove
      `NormalizeForSearch` is in the call path, and that proof lives entirely in 0059's suite.
      ⚠️ **Amended, 2026-08-30 — [0074](0074-translatable-content-retrofit-blog-tags-backend.md) joins
      0059 as a hard prerequisite, and the whitespace-test obligation travels with it.** 0074 **R-8**
      records that its own retrofit preserves the false-green exactly: `utf8mb4_unicode_ci` is case-
      *and* accent-insensitive, so an implementation that skips `NormalizeForSearch` entirely still
      passes every case and accent assertion against `blog_tag_translations`, leaving the two
      whitespace canaries the only proof the normaliser is in the call path. **Do not let a Phase 3
      simplification drop them as redundant on either side of the retrofit.** Sequencing: 0074 before
      0060 (0075 **Q-2** — this story is unbuildable as specified in the other order), and 0075 after
      both.
- [ ] Code reviewed (code-reviewer). Point the review specifically at **D-1** (validation lives in the
      action, confirmed against 0059's *shipped* code rather than its task file) and at **V-1**'s
      browser-test path, which is a convention decision the review is the right place to ratify.
- [ ] No security findings (appsec-auditor). Point the audit specifically at: the `#[Locked]` +
      server-read id pair behind `Rule::unique()->ignore()`; that every mutating **and disclosing**
      method gates before it acts; and that the registry entry's `permissions` set-equals the route's
      `can:` ability.
- [ ] Documentation updated (docs-keeper):
      [api/routes.md](../../docs/api/routes.md) gains a `blog-tags.index` subsection (what the view
      renders, its `data-test` hooks, the registry entry) and its "all three gated routes" sentence
      becomes **four**;
      [architecture/authorization.md](../../docs/architecture/authorization.md) records `BlogTagPolicy`'s
      first call site and the sidebar registry's **second** multi-word key;
      [conventions/naming.md](../../docs/conventions/naming.md)'s registry-mirroring rule gains
      `blog_tags` beside `sales_regions`;
      and [testing/frontend/playwright-setup.md](../../docs/testing/frontend/playwright-setup.md)'s
      folder-structure block is corrected — see **F-3**, which this story must fix rather than inherit.
- [ ] **0059's hand-off item is discharged and marked as such in that file**: "0060 gives
      `BlogTagPolicy` its first component call site and keeps the `->ignore()` id
      server-authoritative" is closed by this story.
- [ ] Acceptance criteria met.

## Documented functional decisions

- **D-1 — `save()` does not call `$this->validate()`, and the component does NOT compose
  `BlogTagValidationRules`.** Per 0059's own file, `CreateBlogTag` and `RenameBlogTag` *"trim before
  validating, and validate with `nameRules()`"` — the **action** composes the trait and runs a
  standalone `Validator::make(...)->validate()`, matching `App\Actions\Fortify\CreateNewUser::create()`'s
  idiom rather than the Livewire `$this->validate()` idiom `Roles\Index::saveRole()` uses. The
  component therefore calls the action and lets `ValidationException` propagate into Livewire's error
  bag automatically — the same "do not catch it; the throw aborts the method, which is what keeps the
  modal open by construction" discipline [0025's **D-2**](done/0025-product-categories-ui.md) states.
  *Rejected:* mirror `saveRole()` — compose the trait in the component, validate there, then call the
  action with a pre-validated string. Rejected on two grounds: it duplicates a rule 0059 deliberately
  put **inside** the action so that a non-dashboard caller inherits it (0059 **D-12**), and
  `nameRules()` requires a `NormalizeForSearch` instance, which is awkward to thread through a
  component-side `$this->validate()` call for no other purpose.
  ⚠️ **This is the highest-risk decision in the story** — it rests on 0059's *prose*, since 0059 is
  unshipped (**F-1**). Confirm it against real code at Phase 2 or 3; if 0059 lands with validation in
  the component after all, this whole `save()` design is rewritten. Raised as **OQ-3**.

  > ✅ **Amended, 2026-08-30 — D-1 is *unchanged and load-bearing*, not superseded, and this note exists
  > because a reader of [0075](0075-blog-tags-language-tabs-ui.md) could easily conclude the opposite.**
  > That story adds a **third** action, `App\Actions\Blog\SetBlogTagTranslation`, and a human
  > architectural decision (2026-08-30) confirmed the project-wide rule behind it: *a per-language write
  > is authorized and validated on both the front and the back — defence in depth, not either/or*.
  > **That rule does not put validation back into this component.** 0071's **D-13** addresses this
  > screen by name as *"the case that looks like an exception and is not"*: because **D-1** structurally
  > forbids the component from validating, there is no component-side validation layer to add, and the
  > principle still holds because the new action is **self-sufficient by construction** — it authorizes
  > and validates regardless of what any caller did. The reviewer's test is *"if I delete the component,
  > is the operation still protected?"*, and here it is. The asymmetry is easy to invert and is the
  > whole rule: **component-only is never acceptable** (task 0008a's finding); **action-only is
  > acceptable precisely where a component cannot validate without duplicating** a rule the action
  > already owns — which is exactly what
  > [base-standards.md](../../docs/conventions/base-standards.md#an-authorization-rule-belongs-to-the-action-not-to-one-of-its-callers)'s
  > *"move the rule, never copy it"* requires.
  >
  > **The component still authorizes**, exactly as this file already specifies, and 0059's **D-12**
  > *defence in depth, not duplication to remove* is unchanged. **What D-1 now costs**, and the reason
  > 0075 gives it a dedicated test rather than a footnote: with no component-side validation, the
  > `name`-keyed `ValidationException` from `RenameBlogTag` is the **only** validation route for the
  > default language, so 0075 **D-12**'s error-key adapter sits on the **primary** path here rather
  > than on a race backstop — see the [`save()` correction above](#component-public-surface).
  >
  > **OQ-3 is still open and still the one question that can force a redesign**, and it now has a second
  > dependent: 0075's **D-3** assumes the same answer this decision does. If 0059 ships with validation
  > in the component, both this design and 0075's are rewritten.

- **D-2 — No hard-block delete. No usage count in any refusal, no blocked state, no error-bag key for
  an in-use refusal, no confirm-and-proceed control — because there is nothing to proceed past.**
  This is the story's **one structural divergence from the 0025 template**, and it is a product
  requirement rather than a simplification. PRD Epic 4's tag Gherkin says deleting a tag *"is removed
  from every post that used it"*; 0059's own Gherkin states the consequence — *"the deletion is never
  blocked, whatever the tag is attached to"* — and its **D-8** makes `DeleteBlogTag` a bare
  `$blogTag->delete()` that **no later story extends**. The detach-from-posts behaviour is honoured by
  the **database**: story 0061's `blog_post_tag` pivot declares
  `foreignUuid('blog_tag_id')->constrained()->cascadeOnDelete()`.
  **Contrast is the point:** blog *categories* (0058 → **0062**) are hard-blocked with a count by PRD's
  own wording, exactly as product categories are. Two taxonomies in the same epic, opposite delete
  semantics. A reviewer who applies 0025's template mechanically will build the wrong screen, and the
  dead markup that results is invisible to every ordinary test — which is why **R-2** exists and why
  the negative rendering assertion is this story's signature test.
  *Rejected:* a confirmation modal that shows a post count "for information" once 0061 lands. Rejected
  as **D-5**, and separately because [0025's **D-3**](done/0025-product-categories-ui.md) records how easily
  a count column next to a delete control reads as a gate even when it is not one.

- **D-3 — Component namespace `App\Livewire\BlogTags\Index`, view `livewire/blog-tags.blade.php`,
  route name `blog-tags.index`, registry key `blog_tags`.** One identifier family, kebab-cased in the
  view path and the route name, snake_cased as the registry key, matching `sales-regions` /
  `sales_regions` exactly. `blog.*` being a **coarse** permission module covering categories, tags and
  posts alike does not make it one screen: Epic 4 ships three (**0060** tags, **0062** categories,
  **0063** posts). `blog-tags.index` leaves `blog-categories.index` and a bare `blog.index` — the
  natural name for 0063's post list — both free and unambiguous.
  *Rejected:* `App\Livewire\Blog\Tags` with route `blog.tags`. It reads well in isolation but breaks
  the `Index`-in-a-subfolder convention every other list screen in this repo follows, and it would
  make 0063's post list either `Blog\Index` (colliding conceptually with the area) or `Blog\Posts`
  (inconsistent with the other two).

- **D-4 — This story creates the `blog` sidebar group, and it is the first Blog-area story to touch
  `routes/`, `config/modules.php` or `lang/` at all.** 0058 fenced all three off explicitly, and
  nothing blog-related exists in any of them today (verified). The precedent is unambiguous and now
  twice-established: the story whose screen ships **first** creates the group its module needs —
  `settings` was created by 0013 for `roles`, `taxes` by 0018 for `sales_regions`. The group ships
  `expandable => false` with one entry today, exactly as `taxes` did, and 0062/0063 revisit that when
  they append their entries.
  *Rejected:* ship `blog-tags.index` with no registry entry, reachable only by URL, leaving the group
  to 0063. That is the **linkless half-state** `roles.index` sat in between 0010 and 0013 and
  `sales-regions.index` between 0017 and 0018 — recorded both times in
  [api/routes.md](../../docs/api/routes.md) as a real, if temporary, gap. There is no reason to repeat
  it a third time when the pattern that avoids it is this well-trodden.
  **Cross-story consequence, stated so 0062 and 0063 inherit it rather than re-deriving it:** both
  append **one `items.*` entry** to the group this story creates and touch no component. If either
  ever needs the group `expandable`, that is a one-key edit to a group they did not author — worth a
  line in their own files.

- **D-5 — No per-tag post-usage count column, this story.** `blog_posts` and `blog_post_tag` do not
  exist (0061 owns both) and 0059 ships **no** `posts()` relation on `BlogTag` and **no** stored
  `usage_count` (its **D-6**). A count here would therefore be either unbuildable or a hardcoded lie.
  *Rejected:* a greyed "—" placeholder column with an explanatory tooltip. It is UI purpose-built for
  a state lasting at most one release, and it invites exactly the "count column that secretly means
  nothing" confusion 0025's **D-3** works to avoid from the opposite direction. Once 0061 ships the
  pivot, adding `withCount('posts')` is a purely **additive** UI change for a later story — the same
  arc the product-category count took across 0023 → 0025. Raised as **OQ-4**.

- **D-6 — `$tags` is `#[Locked]`, as is every id-carrying property.** This follows the *newer*
  precedent — `App\Livewire\SalesRegions\Index::$regions` is `#[Locked]` (verified) — rather than
  [0025's **D-4**](done/0025-product-categories-ui.md), which deliberately leaves `$productCategories`
  unlocked on the reasoning that nothing reads it for a decision. Both are safe here, because every
  mutating method re-reads its target with `findOrFail()` and re-authorizes; locking is simply the
  stricter of two safe options and the one the most recent screen chose. Record the reason in the
  property's docblock, which neither `Users\Index` nor `SalesRegions\Index` does.

- **D-7 — Per-row `Gate::allows()` is kept, but the per-row *test* matrix is not.** `BlogTagPolicy` is
  expected to gate on the actor's permission alone with no target-dependent branch — the
  `SalesRegionPolicy` shape, which [api/routes.md](../../docs/api/routes.md) records as *"the first
  screen whose per-row `Gate::allows()` hint has no accepted drift"*. So every row answers identically
  for a given actor, and one global-state test replaces the Users-shaped matrix, which here would be
  padding rather than coverage. Per-row computation **stays** — negligible cost, consistent with the
  established pattern, and it survives the day a per-instance rule appears.
  ⚠️ That equivalence is a property of an empty policy body, **not a guarantee**. If 0059 ships
  `BlogTagPolicy` with a target-dependent branch, this decision and the hint must both be re-evaluated
  against a **re-fetched** row, exactly as `SalesRegionPolicy`'s own docblock requires. Raised as
  **OQ-1**.

- **D-8 — Copy lives in a new `lang/{en,es}/blog-tags.php`; no shared `blog.php`.** Matches every
  existing precedent exactly — one screen, one domain file (`users.php`, `roles.php`,
  `sales-regions.php`). `blog.*` being a single permission module does not imply a single lang file;
  `sales-regions.*` and `roles.*` are single modules with dedicated files too.
  *Rejected:* one shared `lang/{en,es}/blog.php` for tags, categories and posts. It recreates precisely
  the file-ownership hazard [0025's sequential-implementation note](done/0025-product-categories-ui.md)
  exists to warn about — two stories writing the same lang file, which the
  [Parallel Agent File-Ownership Rule](../../docs/contracts.md#parallel-agent-file-ownership-rule)
  makes a real scheduling constraint — for no benefit. Separate files mean 0060, 0062 and 0063 never
  block one another.
  Note `lang/{en,es}/navigation.php` **is** shared and **is** touched by all three — that is
  unavoidable (it is the registry's mirror) and is a two-leaf append, not a structural edit.

- **D-9 — Ordered `name ASC, id ASC`; no pagination, no search, no sort picker.**
  ⚠️ **Correction, 2026-08-30 — the *SQL* half of this decision is no longer executable.**
  [0074](0074-translatable-content-retrofit-blog-tags-backend.md) deletes `blog_tags.name`, so there is
  no column to `orderBy`. [0075](0075-blog-tags-language-tabs-ui.md) **D-8** carries the correction and
  it is `frontend-expert`'s: **sort after fetch, keeping the `id` tiebreak** — the same shape sibling
  story 0071 reached independently for Product Categories (its **D-12**), which is the strongest signal
  either file offers. The *intent* is unchanged: alphabetical by the name an editor actually sees,
  which is now `translated('name')` resolved for the **store default** language. Everything else in
  this decision stands — no pagination, no search, no sort picker, and the `id` tiebreak still costs
  nothing and is still meaningful under UUIDv7. ⚠️ Two things it leaves open, both flagged rather than
  guessed: **where a row with no default-language name sorts** (0074's **R-9** makes that state common
  right after a store-default change, and neither 0074 nor 0075 says), and whether an in-PHP sort
  should be collation-aware for accented names now that MySQL's `utf8mb4_unicode_ci` is no longer doing
  the comparison. **Phase 2 decides both.**

  *The decision as originally written, unchanged below except for the SQL mechanism corrected above:*
  Matches
  `Users\Index::loadUsers()` and `Roles\Index::roles()`, both unpaginated, and a tag catalog is a small
  backoffice lookup table. The `id` tiebreak costs nothing and is a meaningful creation-order tiebreak
  given UUIDv7, even though 0059's normalised uniqueness makes exact name collisions structurally
  impossible.
  ⚠️ **Revisit after 0063 ships.** Create-on-the-fly from the post editor is the one feature in this
  epic that can grow a taxonomy quickly, and it does not exist yet, so sizing this screen for it now
  would be speculation. Raised as **OQ-6**.

### Scope fences: what this story must NOT do

- **No `FindOrCreateBlogTag` call anywhere.** That action exists for the post editor (0063). A `save()`
  that reached for it would silently turn every duplicate-name refusal into a success (**R-7**).
- **No hard-block delete modal, no usage count, no in-use guard, no reassign-first flow, no
  confirm-and-proceed or force-delete control of any kind** (**D-2**, **D-5**).
- **No post-editor tag chip / autocomplete field, and no create-on-the-fly affordance** (0063).
- **No attach/detach of tags on a post** (0061 / 0063).
- **No `blog_posts` table, no `blog_post_tag` pivot, no `posts()` relation on `BlogTag`** (0061).
- **No blog categories table, model, action or screen** (0058 / **0062**). This story must not create,
  rename or restructure anything they own.
- **No migration, model, action, policy, factory, seeder, enum or validation trait** — all consumed
  from 0059 as shipped.
- **No new permission slug and no `RolePermissionSeeder` change** — `blog.*` is already seeded.
- **No fold logic anywhere in this story's files.** `App\Actions\NormalizeForSearch` is reached only
  indirectly, through the actions.
- **No edit to `resources/views/components/sidebar-nav.blade.php` or
  `resources/views/layouts/app/sidebar.blade.php`** — the registry is extended by appending **data**,
  never behavior.
- **No slug, description, sort order, usage count, translations table or other i18n scaffolding.**
  ⚠️ **Correction, 2026-08-30 — still binding *on this story*, and no longer a statement about the
  screen.** The fence is unchanged as a scope rule: 0060 creates no translations table and no language
  tabs. But the screen does not stay monolingual —
  [0074](0074-translatable-content-retrofit-blog-tags-backend.md) creates `blog_tag_translations` and
  [0075](0075-blog-tags-language-tabs-ui.md) adds the tabs by **modifying this story's own component,
  view, lang files and tests**. Read this bullet as *"not here, not by this story"*, never as *"this
  screen is single-language"* — the second reading is what would make someone rewrite 0075's work back
  out during a later pass.

## Dependencies, findings, risks and open questions

### Findings

- **F-1 — Story 0059 does not exist in code, so this entire interface contract is a claim about a task
  file.** Verified by `frontend-expert` against the tree: `app/Actions/Blog/`, `app/Models/BlogTag.php`
  and `app/Policies/BlogTagPolicy.php` do not exist, and `0059-blog-tags-backend.md` is still in
  `ai-spec/tasks/` (Phase 1), not `in-progress/` or `done/`. This mirrors [0025's own
  **F-2**](done/0025-product-categories-ui.md#findings) exactly. Recorded as a dependency, **not** a blocker
  to Phase 1 — but per [the deferred-findings rule](../../docs/errors-log.md#a-deferred-storys-findings-were-claims-about-a-tree-that-no-longer-existed-and-one-of-them-would-have-reopened-a-bug-in-this-log--2026-08-23),
  every statement in the **Interface contract** and **D-1** must be **re-verified against `HEAD`
  before this story enters Phase 3**, with each disposition recorded.
- **F-2 — `frontend-qa` cited `tests/Feature/ProductCategories/IndexTest.php` and
  `tests/Browser/ProductCategoriesIndexTest.php` as shape precedents; neither exists.** Verified by the
  facilitator: there is no `ProductCategories` directory under `tests/Feature/`, none under
  `tests/Browser/`, and no `app/Livewire/ProductCategories/`. Story 0025 is unimplemented, so those are
  *specified*, not shipped. The shape precedents that genuinely exist and should be read instead are
  `tests/Feature/Roles/{IndexTest,IndexUiTest}.php`,
  `tests/Feature/SalesRegions/{IndexTest,IndexRenderingTest,RefusalLoggingTest}.php` and
  `tests/Browser/{RolesIndexTest,SalesRegionsIndexTest,UsersIndexTest}.php`. This is the same class of
  mistake **F-1** describes, caught inside Phase 1 rather than after.
- **F-3 — [playwright-setup.md](../../docs/testing/frontend/playwright-setup.md#folder-structure)
  under-counts the browser suite, and this story must correct it rather than inherit it.** That page
  says the suite holds **three** files and names `UsersIndexTest.php` and `SalesRegionsIndexTest.php`
  as the two flat ones. `ls tests/Browser/` returns **four**: `Auth/LoginSmokeTest.php`,
  `UsersIndexTest.php`, `SalesRegionsIndexTest.php` **and `RolesIndexTest.php`** — a *third* flat file
  the doc never mentions. So the flat/mirrored ratio the page reasons from is 3:1, not 2:1. This is the
  [bare-negative-claim](../../docs/errors-log.md#a-docs-this-app-has-no-x-yet-claim-outlived-the-x-by-two-tasks--2026-08-13)
  failure mode arriving as arithmetic, and it is load-bearing here because that page's own count is
  part of the argument **V-1** adjudicates. Correcting it is named in the Definition of Done.

### Divergences recorded from the debate

- **V-1 — The browser test path. `frontend-expert` deferred it to Phase 2; `frontend-qa` recommended
  flat, on precedent. Decided: `tests/Browser/BlogTags/IndexTest.php` — mirrored.**
  QA's argument is real and was verified: three of the four existing browser files sit flat
  (**F-3** corrects the count *upward*, strengthening the observation), so flat is the majority
  practice. But the page that **owns** the question states the opposite in terms that leave no room —
  *"the mirrored subfolder is still the convention … and the two flat files are debt, not
  precedent"* — and it states the lesson this very decision is an instance of: **"a story file that
  names a test path is making a convention decision, so the path belongs in the Phase 2 review"**,
  noting that twice now it has not been and twice the convention has lost by default. This project's
  own rule is that **when an instruction contradicts `docs/`, the docs win**. Choosing flat here would
  be the third default-loss, and it would be a decision made by inertia rather than argument.
  Recorded as a divergence rather than settled silently, and **explicitly listed for Phase 2
  ratification** — if the reviewer prefers to bless the flat form as the real convention, that is a
  legitimate outcome, but it should then be written back into `playwright-setup.md` so the page stops
  saying one thing while the repo does another.
- **V-2 — `data-test` hook naming. `frontend-expert` proposed `edit-tag-{id}`; `frontend-qa` proposed
  `edit-blog-tag-{id}`. Decided: QA's.** The hook names the full domain, matching how every existing
  hook does (`edit-user-{id}`, `edit-role-{id}`, `edit-region-{id}` — each naming the model, not an
  abbreviation), and it forecloses a collision with **0062**'s blog-categories screen, which would
  otherwise be tempted toward a bare `-category-` shorthand in a codebase that already has product
  categories. The cost is four extra characters per hook.
- **V-3 — The Feature test folder. `frontend-expert` proposed `tests/Feature/BlogTags/`;
  `frontend-qa` proposed `tests/Feature/Blog/`. Decided: `tests/Feature/Blog/`, on evidence neither
  amigo cited.** The facilitator checked what the existing folders actually contain, and **every
  domain area keeps its component tests and its action tests in one folder**:
  `tests/Feature/SalesRegions/` holds `IndexTest.php` *and* `SetDefaultSalesRegionTest.php`;
  `tests/Feature/Users/` holds `IndexTest.php` *and* `CreateUserTest.php`;
  `tests/Feature/Roles/` holds `IndexTest.php` *and* `EnforceGrantorPermissionScopeTest.php`. Story
  0059 has already claimed `tests/Feature/Blog/` for its action tests. Choosing `BlogTags/` would
  therefore split one domain's tests across two folders for the first time in this repo. The file names
  carry the disambiguation instead (`BlogTagsIndexTest.php`, not `IndexTest.php`), because
  `tests/Feature/Blog/` will later also hold 0062's and 0063's.
  ⚠️ One consequence worth stating plainly: this folder is named after the **action/domain area**
  (`Blog`) while the component namespace is `BlogTags`, so the mirror is not exact. That is forced by
  co-location, and co-location is the stronger convention — but it is a first, and Phase 2 should
  confirm it rather than let it pass unremarked.

### Dependencies

- **[0059](0059-blog-tags-backend.md) — hard, blocking, and the only one.** The model, all three
  actions, the validation trait and the policy. **Not yet implemented (F-1).** Ordering is already
  correct per [workflow.md](../../docs/workflow.md#task-ordering-rule) (0059 < 0060).
- **`App\Actions\NormalizeForSearch` (story 0022) — transitively.** This story never touches it, but
  0059 cannot ship without it, and 0059's **OQ-2** records that it does not exist in the tree and that
  no 0022 task file is present in this worktree. A genuine sequencing question, owned by 0059.
- Depends on already-shipped work: the seeded `blog.*` permissions (0002, **verified**), the
  `Gate::before` Super Admin bypass, policy auto-discovery (0004), the Users screen's list+modal
  pattern (0006), the wired-up browser suite (0006b), the sidebar registry
  ([0013](done/0013-sidebar-module-gating-ui.md)), `LogRefusedPrivilegedAttempt` (0015b), and the
  Sales Regions screen (0018) as the most recent list-screen precedent.
- **No dependency on 0058, 0061, 0062 or 0063**, in either direction, for this story's own scope —
  though **D-4** creates the sidebar group 0062 and 0063 will append to, and **R-6**'s cascade
  hand-off is 0061's to honour.

### Risks

- **R-1 — The `->ignore()` id becoming client-controlled.** Dropping `#[Locked]`, or assigning
  `$this->editingTagId = $tagId` (the raw argument) instead of `$tag->id`, silently turns a uniqueness
  check into a rename-any-tag primitive. The two lines are a pair; the dedicated retarget test is what
  pins them, and nothing else in the plan would fail.
- **R-2 — A copied hard-block delete UI: this story's single most likely regression, and the one no
  ordinary test catches.** Because `DeleteBlogTag` has no guard, a blocked-delete callout or a
  conditionally-disabled confirm button lifted from 0025's Blade produces **dead markup that is never
  exercised** — every "delete succeeds" test still passes with it sitting in the DOM. Only the negative
  structural assertion in the rendering file and the one-click browser deletion catch it. Flag this to
  whoever implements: **the absence of a feature is the thing under test**, and absence-tests are
  precisely the ones people skip as pointless.
- **R-3 — The case/accent canaries passing for the wrong reason — 0059's own R-8, one layer up.**
  `utf8mb4_unicode_ci` is itself case- **and** accent-insensitive, so an implementation that never
  reaches `NormalizeForSearch` still passes every case-only and accent-only assertion in this file: the
  database folds both at the index and in the `WHERE` clause. **This story's canaries therefore cannot
  independently prove the normaliser ran.** That proof lives entirely in 0059's two *blocking*
  whitespace tests (`'  running  '`, `'trail  running'`), which no collation reaches. Consequence,
  written into the Definition of Done: **0059 being green with those two tests intact is a
  prerequisite for trusting this story's suite**, and a Phase 3 "simplification" that drops them as
  redundant with the case tests silently invalidates coverage here too.
- **R-4 — Icon-only selector traps**, verbatim from
  [playwright-setup.md](../../docs/testing/frontend/playwright-setup.md#selector-strategy). A
  disabled-state helper must match `disabled="disabled"`, never a bare `disabled` substring — Flux's
  compiled class list carries the literal `disabled:opacity-75` on the *enabled* branch too, so the
  naive helper reports every control as disabled and the test can never fail. The page-global
  substring trap (`assertSee('0%')` matching inside `10%`) is lower-risk here since this screen renders
  no numbers at all — but tag names are user-supplied free text, so a page-global `assertSee('running')`
  matches inside `trail running`, which is the *same* trap wearing different clothes. Assert a tag
  through its row-scoped hook.
- **R-5 — The `@js()` / component-tag-attribute compilation trap.** This screen's row actions each
  carry exactly **one** `@js()` argument, the shape `roles.blade.php` ships and the
  [dated correction](../../docs/errors-log.md#two-directive-calls-in-one-blade-component-tags-attribute-string-silently-fail-to-compile--2026-08-26)
  confirms is safe inside a `flux:` tag — so the failure that made every Sales Regions row toggle a
  silent no-op does not recur structurally. The underlying rule still binds: any `wire:click` argument
  carrying a UUID goes through `@js(...)`, verified by reading the **compiled** HTML rather than by the
  absence of an error, because `Livewire::test()->call()` never goes through a compiled `wire:click` at
  all and cannot see this class of bug.
- **R-6 — The PRD scenario this story cannot fully test.** *"Removed from every post that used it"* is
  half-unassertable here for the same reason it was in 0059 (**R-6** there): no `blog_posts`, no pivot.
  The mitigation is **not** a placeholder test — it is (a) the cross-story promise already written into
  `DeleteBlogTag`'s own docblock by 0059, (b) 0059's hand-off requiring 0061's pivot to declare
  `cascadeOnDelete()`, and (c) a required cascade test in **0061**. The residual is real and named: if
  0061 copies `sales_regions.parent_id`'s `restrictOnDelete()` habit, this screen's delete starts
  failing in production with an FK error while **every test in this story still passes**, because none
  of its fixtures has a post.
- **R-7 — Scope creep into `FindOrCreateBlogTag`.** If `save()` is ever wired to "reuse if it already
  exists" instead of strictly `CreateBlogTag` / `RenameBlogTag`, the entire duplicate-refusal half of
  this story's Gherkin silently stops being true — a duplicate would succeed rather than error. Worse,
  the resulting red `assertHasErrors()` tests invite "fixing the assertion" rather than the call. Pinned
  by the explicit injected-actions assertion in the plan.
- **R-8 — A stale validation error leaking between attempts.** Livewire persists the error bag across
  requests. Both `Roles\Index` and `SalesRegions\Index` needed an explicit `resetValidation()`, and
  0018 shipped its omission as a **blocking** finding. A refused create, then *Cancel*, then a
  legitimate edit on an unrelated row would otherwise render a stale `name` error beside a field that
  never triggered it.
- **R-9 — Modelling this screen too literally on its heavier siblings.** Three specific over-reaches to
  avoid, each of which inflates the work without adding coverage: a per-row authorization matrix
  (**D-7**), re-running 0059's normalisation suite one layer up, and defensively importing traps that
  structurally cannot apply here (the `<select>` trap, `$toggle`, the checkbox-count trap). Padding is a
  finding under
  [coverage-review-checklist.md](../../docs/testing/qa/coverage-review-checklist.md), not a courtesy.

### Open questions

Six, none blocking Phase 1 — but **OQ-3 can invalidate a design decision** and should be answered the
moment 0059's code exists. Each carries a recommendation, per
[contracts.md](../../docs/contracts.md)'s Uncertainty Handling Rule.

- **OQ-1 — Is `BlogTagPolicy` target-independent (the `SalesRegionPolicy` shape) or does
  `update`/`delete` branch per row (the `UserPolicy` shape)?** Unverifiable today (**F-1**).
  **(a) Assume target-independent (recommended)** — nothing in PRD Epic 4's tag scenarios describes a
  protected, seeded or system tag the way Users has Super-Admin-holding rows, and 0059 describes the
  policy as four flat permission checks. Write **one** global-state authorization test (**D-7**).
  (b) Write a per-row matrix defensively. Rejected as padding under a policy with no branch to
  exercise. **If 0059 ships a target-dependent branch, (a) is withdrawn**, the matrix comes back, and
  the per-row hint must be evaluated against a **re-fetched** row.

- **OQ-2 — What literal maximum name length backs the length-boundary canary?** 0059's own **OQ-1**
  (100 vs 255) is unresolved.
  **(a) Derive the boundary from the shared trait/constant at test time (recommended)** — the test then
  survives either resolution of 0059's OQ-1 with no edit here.
  (b) Hardcode the confirmed value, if 0059's Phase 2 settles it before this story reaches Phase 3 —
  cheaper and clearer once it is genuinely fixed.

- **OQ-3 — Does validation live in the action, as **D-1** assumes?** This is the one open question that
  can force a redesign rather than a tweak.
  **(a) Yes — the action validates; the component composes no trait and calls no `$this->validate()`
  (recommended)** — it is what 0059's file says (*"trims before validating, validates with
  `nameRules()`"*), it is what makes the rule inheritable by 0063's non-dashboard caller, and it
  matches how `sales-regions.index` already lets a `ValidationException` from its own layer land in the
  error bag.
  (b) The component validates and passes a clean string. Only correct if 0059 ships that way — in which
  case **D-1** is rewritten, `save()` gains a `$this->validate()` call, and `NormalizeForSearch` has to
  be threaded into the component. **Re-verify against `HEAD` before Phase 3** and record the
  disposition either way.

- **OQ-4 — Does the screen show a per-tag post count once 0061 lands?** Not now (**D-5**) — the
  question is what happens after.
  **(a) Add it in a small follow-up story once `blog_post_tag` exists, purely additively (recommended)**
  — the same arc the product-category count takes across 0023 → 0025, and it keeps this story honest
  about a table that does not exist.
  (b) Never add it — a tag catalog arguably does not need one, since nothing about the count changes
  what the editor may do (unlike categories, where the count *is* the block). Genuinely defensible;
  worth a product-owner call rather than a default.

  > ⚠️ **Whenever (a) is taken, the count must be explicit about trashed posts — and the direction of
  > the default is *contested*, so settle it by execution before writing the query.** Story
  > [0061](0061-blog-posts-core-crud-backend.md) is done, `BlogPost` uses `SoftDeletes` (its **D-7**),
  > and it adds `BlogTag::posts()` as a plain `BelongsToMany` with no default scope of its own. Its
  > **D-7c** hands this story a ⚠️ stating that a `withCount('posts')` here *"now includes trashed
  > posts unless scoped"*. **That claim is not reconcilable with this repo's own shipped precedent and
  > was not verified by execution here** (`vendor/` is absent from this worktree):
  > [`App\Livewire\Roles\Index`](../../app/Livewire/Roles/Index.php) is the structurally identical case
  > — a non-soft-deleting parent counting a soft-deleting related model across a many-to-many — and it
  > has to write `->withCount(['users' => fn ($query) => $query->withTrashed()])` with a docblock
  > reading *"a soft-deleted holder still counts"*, i.e. an explicit **opt-in** to include trashed,
  > which is only necessary if `withCount()` **excludes** them by default (as `Model::newQuery()`
  > applying the `SoftDeletingScope` would predict).
  >
  > Either way the obligation on this screen is the same and is what to act on: **never ship a bare
  > `withCount('posts')` here** — state the intent explicitly (`->withTrashed()` to include,
  > `->whereNull('deleted_at')`/the default to exclude), and pin it with a test that creates a tag with
  > one live and one trashed post and asserts the literal number. Per
  > [the hedge rule](../../docs/errors-log.md#a-reviewers-correction-replaced-an-accurate-technical-explanation-with-a-wrong-one-unverified--2026-08-24),
  > resolve which default actually applies by **running it** (one `tinker` call against `Role` +
  > a trashed holder settles it for both), and record the result in whichever story adds the count —
  > correcting 0061's **D-7c** if it turns out to be inverted. For an editor-facing count, excluding
  > trashed posts is almost certainly the *product* answer regardless of the framework default.

- **OQ-5 — Is the `tests/Unit/ArchitectureTest.php` fence worth adding at all?**
  **(a) Add one single-namespace rule (recommended, but low priority)** — `App\Livewire\BlogTags\*`
  references no product-taxonomy namespace. Cheap insurance, and it costs one line.
  (b) Skip it. Defensible: this screen shares nothing with the product taxonomy, so the rule asserts an
  absence with no plausible way to be violated — which is close to the vacuous-`arch()` failure mode
  this repo has already shipped once. **Do not** write it as `expect([...])` under either answer.

- **OQ-6 — Header summary line, and a search filter?** Two small UI questions with the same answer
  today.
  **(a) Neither (recommended)** — matching [0025's **D-7**](done/0025-product-categories-ui.md): nothing in
  the PRD or this brief asks for a count header, and unlike Users (which has an *active* dimension) a
  tag catalog has no second dimension to summarise. A filter is speculative until 0063's
  create-on-the-fly reveals how fast the catalog really grows (**D-9**).
  (b) Add a summary line for visual parity with every other list screen — genuinely a coin flip, raised
  only because every sibling has one and its absence could read as an oversight rather than a decision.
  Choosing (b) reinstates one lang key and one rendering test.

## Resolved in the debate

Recorded so a later reader does not reopen them:

- **The delete has no block, and that is a requirement rather than a shortcut.** Settled upstream by
  PRD Epic 4's own Gherkin and 0059's **D-8**, and reaffirmed independently by both amigos. The
  screen's delete-confirmation modal exists only to prevent an accidental click.
- **This story never calls `FindOrCreateBlogTag`.** Both amigos flagged the same creep risk from
  opposite directions — the expert as a scope fence, QA as a test assertion (**R-7**). Both are kept.
- **The usage count is omitted, not deferred to a placeholder.** Both amigos converged on omission,
  with the same reasoning, before either saw the other's answer.
- **The route/registry shape follows the `sales-regions.index` precedent** — nested URI, flat
  area-specific route name, entry `permissions` exactly equal to the route's `can:` ability. Both
  amigos proposed it independently.
- **`blog.*` is already seeded**, verified against `RolePermissionSeeder::MODULES` by both the expert
  and the facilitator. No seeder change, no re-seed fallout, no new module slug.

## Provenance

Phase 1 (Three Amigos) debate run on 2026-08-27 with `frontend-expert` (files, route/registry shape,
component surface and the **D-1** validation-placement analysis) and `frontend-qa` (Gherkin, the
layered test plan, level calibration and the false-green analysis behind **R-2** and **R-3**), per
[workflow.md](../../docs/workflow.md#phase-1--three-amigos-debate). Classified **Frontend** under the
[task classification rule](../../docs/workflow.md#task-classification-rule), so no `backend-expert` or
`database-expert` was convened — this story adds no backend or schema artifact. Derived from
[PRD](../../docs/PRD/PRD.md#epic-4--blog) Epic 4's `Feature: Blog tags (extends the prototype)` block
(first three scenarios) and the management-screen half of Blog acceptance criterion 3, grounded in full
readings of [0059](0059-blog-tags-backend.md) and [0025](done/0025-product-categories-ui.md), with
[0018](done/0018-sales-region-tax-configuration-ui.md)'s shipped screen and
[0013](done/0013-sidebar-module-gating-ui.md)'s registry as the most recent precedents.

Both amigos' contributions are reflected above. **Three divergences are recorded rather than
silently resolved** (**V-1** the browser-test path, **V-2** the `data-test` hook naming, **V-3** the
Feature test folder), and one of them went **against** the expert on facilitator-gathered evidence:
V-3's decision rests on the observation that every existing `tests/Feature/<Area>/` folder holds that
area's component tests *and* its action tests together, so choosing `tests/Feature/BlogTags/` while
0059 already owns `tests/Feature/Blog/` would split one domain across two folders for the first time
in this repo. Neither amigo cited that; it came from reading the real directory listings.

**Three findings are recorded that neither the brief nor the existing docs had right.** **F-1** is the
expert's, and is the most important: 0059 does not exist in code, so this story's entire interface
contract — **D-1** above all — is a claim about a task file rather than about a tree, and must be
re-verified against `HEAD` before Phase 3 under
[the deferred-findings rule](../../docs/errors-log.md#a-deferred-storys-findings-were-claims-about-a-tree-that-no-longer-existed-and-one-of-them-would-have-reopened-a-bug-in-this-log--2026-08-23).
**F-2** and **F-3** are the facilitator's, and both are instances of the same failure mode caught early:
QA cited two `ProductCategories` test files as shape precedents when neither exists (story 0025 is
unimplemented), and
[playwright-setup.md](../../docs/testing/frontend/playwright-setup.md#folder-structure) states the
browser suite holds three files while it holds four — the unnamed fourth, `RolesIndexTest.php`, being a
*third* flat file that changes the very ratio that page's own convention argument reasons from. F-3 is
load-bearing rather than cosmetic, because **V-1** adjudicates using that page's argument; correcting
the page is named in the Definition of Done rather than left for someone to rediscover.

**One thing this debate deliberately did not re-litigate:** whether the tag delete should be blocked
when a tag is in use. PRD states the behaviour directly, 0059's **D-8** builds for it, and 0059's
**D-7** already records the adjacent question (merge-on-rename) as refused-because-unbuildable with a
future story scoped against 0061. Reopening it here would be re-deciding a shipped upstream decision.

**Not yet run:** Phase 2 (`code-reviewer` INVEST validation). Four items deserve an explicit look there
rather than at implementation time. **Independence** is the fair challenge — **F-1** means this story
is gated behind an unshipped backend story, so INVEST's "Independent" holds only in the sequencing
sense. **OQ-3** can force a redesign of `save()` and should be closed the moment 0059's code exists.
**V-1** is a project-wide convention decision this story merely surfaces, and the page that owns it
explicitly asks for it to be made at Phase 2 rather than defaulted a third time. And **V-3**'s
folder-vs-namespace mismatch is a first for this repo and should be confirmed rather than pass
unremarked.
