# [0073] Blog Categories screen — language tabs

## Description
Retrofit story [0062](0062-blog-categories-ui.md)'s Blog Categories management screen so a category's
name is authored **per active store language** through language tabs, satisfying
[PRD Epic 5, Layer 2](../../docs/PRD/PRD.md#epic-5--internationalization)'s *"each active store
language surfaces as a tab … in the taxonomy management screens"* and its `Taxonomy names are
translatable per store language` scenario for the **Blog category** row. Consumes story
[0072](0072-translatable-content-retrofit-blog-categories-backend.md)'s retrofit — which **deletes
the `blog_categories.name` column this screen currently reads** — and story
[0071](0071-product-categories-language-tabs-ui.md)'s shared tab-strip pattern, both unchanged.

It also adds **one backend action**, `App\Actions\Blog\SetBlogCategoryTranslation`, so that writing a
translation is authorized and validated at **two independent layers** — the component *and* a
self-sufficient domain action — per the master pattern 0071's **D-13** establishes and names this
story by number.

> **Read this first: this story is the *second* consumer of a pattern story 0071 established, and it
> was reconciled against 0071 after the fact.**
>
> This debate began while `ai-spec/tasks/0071-product-categories-language-tabs-ui.md` **did not
> exist** — verified by directory listing at the time, and corroborated by
> [0074](0074-translatable-content-retrofit-blog-tags-backend.md)'s own Provenance, which records
> `0071`–`0073` as absent. 0071 was written **concurrently** and landed mid-debate. Its decisions
> were then read in full and **this file was rewritten to follow them**, because two taxonomy tab
> screens diverging on tab mechanics, error routing and hook naming is exactly the outcome
> [0071's **R-8**](0071-product-categories-language-tabs-ui.md) warns about ("the pattern this story
> sets is copied four times").
>
> **Four of this debate's own conclusions were overturned by 0071 and are recorded as corrections
> rather than quietly replaced** — see [What 0071 changed in this file](#what-0071-changed-in-this-file).
> Two of 0071's open questions (**Q-1**, **Q-2**) were resolved on 2026-08-30 and are consumed here
> as settled rather than re-asked.
>
> **This story is also the answer to [0070's **Q3**](0070-translatable-content-mechanism-product-categories-backend.md)**
> — *"which story owns the language-tabs UI for the taxonomy screens?"* — under its option **(a)**,
> for the Blog Categories taxonomy. 0071 answers it for Product Categories; 0075 completes the set
> for Blog Tags.

> **Nothing this story depends on exists in code.** Verified against the live tree at authoring time:
> `app/Livewire/` holds `Actions, Media, Roles, SalesRegions, Settings, Users` and no
> `BlogCategories/`; `app/Models/` holds `Media, Role, SalesRegion, User` and no `BlogCategory` or
> `StoreLanguage`; there is no `app/Actions/Blog/`, no `app/Concerns/HasTranslations.php`, no
> `lang/*/blog.php`, and `config/modules.php` holds only `platform`/`settings`/`taxes` with no `blog`
> group. `composer.json` requires **`livewire/flux` (free)** with no `livewire/flux-pro`, and a grep
> over `resources/views/` finds **no `flux:tab*` markup of any kind**. **There is no `vendor/`
> directory**, so nothing below was settled by executing Laravel, Livewire, Alpine or Flux code.
> Stories 0058, 0061, 0062, 0068, 0070, 0071 and 0072 are all Phase 1 files. **Phase 3 must
> re-verify every signature named here against `HEAD` before writing a line** — the
> [deferred-findings failure mode](../../docs/errors-log.md#a-deferred-storys-findings-were-claims-about-a-tree-that-no-longer-existed-and-one-of-them-would-have-reopened-a-bug-in-this-log--2026-08-23),
> at this story's widest exposure yet (**R-3**).

## Type
frontend | includes database-expert: **no** | consumes **0072** (the retrofit), **0071** (the tab strip), **0070** (the mechanism), **0068** (`StoreLanguage`), **0062** (the screen), **0058**/**0061** (the domain)

## Three Amigos participants

`product-owner` (facilitator) + `frontend-expert` + `frontend-qa`, per
[workflow.md](../../docs/workflow.md#task-classification-rule)'s Frontend classification. **Both
amigos were dispatched as real subagent calls and both returned.** Their contributions are reflected
below, including **three divergences between them** (**V-1**–**V-3**) and **four points where 0071
overruled the debate's own conclusion** (**C-1**–**C-4**), each recorded with what it used to say.

## 1. Refined user story

> **As** a blog editor maintaining a multilingual blog,
> **I want** each blog category's name to be editable per active store language through tabs on the
> same modal I already use,
> **so that** the blog taxonomy reads correctly in every language the store publishes in, without
> leaving the screen or learning a second workflow.

> **As** the engineer who will build story 0075 (Blog Tags) and 0079 (Blog Posts),
> **I want** this screen to reuse 0071's tab strip rather than fork a second one,
> **so that** the fourth and fifth taxonomy screens inherit one tested contract instead of choosing
> between two that drifted apart in the same week.

**Scope fence.** This story adds no route, model, migration, policy, permission or
`config/modules.php` entry. It widens one Livewire component and one Blade view, **adds one domain
action** (`SetBlogCategoryTranslation`), **consumes** 0071's shared tab strip, and appends one lang
group. The delete-confirmation modal, its hard-block-with-count refusal, and the post-count column are
0061/0062's and are **untouched**.

> **On the classification.** This story stays **frontend** while adding one `app/Actions/Blog/` class,
> which is the same shape 0071 ships. The action exists because the *screen* introduces a write path
> 0072 **D-7** explicitly declined to build (*"writing a non-default language goes through
> `SetTranslation` directly, called by whichever action the UI story adds; this story ships no such
> caller"*). Phase 2 should ratify the classification rather than inherit it — noting that splitting
> one small action into its own backend story would leave the paired frontend story unable to ship,
> which is why 0071 did not.

## Gherkin — 2. Detailed acceptance criteria (Given/When/Then)

Every scenario opens with a named business-role actor — **"a blog editor"**, the actor 0062 and 0072
both use, from the PRD's own Epic 4 scenarios — and carries exactly one `When`, per
[gherkin-guidelines.md](../../docs/testing/frontend/gherkin-guidelines.md) rules 1 and 3.

```gherkin
Feature: Blog category names authored per store language

  # --- The tabs themselves ---

  Scenario: A blog editor sees one tab per active store language
    Given a blog editor, with Spanish and French active as store languages
    When they open a blog category for editing
    Then a tab is offered for Spanish and a tab is offered for French

  Scenario: A removed store language is offered no tab
    Given a blog editor, with French removed as a store language
    When they open a blog category for editing
    Then no French tab is offered

  Scenario: The default store language's tab is the one shown first
    Given a blog editor, with Spanish as the store default and French also active
    When they open a blog category for editing
    Then the Spanish tab is the one shown

  # --- Reading a translation ---

  Scenario: A tab shows the name authored in its own language
    Given a blog editor, with a category named "Guias" in Spanish and "Guides" in French
    When they switch to the French tab
    Then the name field shows "Guides"

  Scenario: An untranslated language's tab shows an empty field rather than the fallback
    Given a blog editor, with a category named "Guias" in Spanish only
    When they switch to the French tab
    Then the name field is empty rather than showing "Guias"

  Scenario: An untranslated language's tab says the name is not yet translated
    Given a blog editor, with a category named "Guias" in Spanish only
    When they switch to the French tab
    Then they are told the category has no name in that language yet

  # --- Writing a translation ---

  Scenario: A blog editor translates a category into an additional language
    Given a blog editor, with a category named "Guias" in Spanish only
    When they save the category with "Guides" entered on the French tab
    Then the category reads "Guides" in French and still reads "Guias" in Spanish

  Scenario: A blog editor corrects a name in one language only
    Given a blog editor, with a category named "Guias" in Spanish and "Guides" in French
    When they save the category with the French tab changed to "Guides d'achat"
    Then the category reads "Guides d'achat" in French and still reads "Guias" in Spanish

  Scenario: Creating a category records a name entered on a non-default tab
    Given a blog editor with permission to create blog categories
    When they save a new category with "Guias" on the Spanish default tab and "Guides" on the French tab
    Then the category is created holding both names

  Scenario: Unsaved text on a hidden tab survives switching tabs
    Given a blog editor who has typed "Guides" on the French tab
    When they switch to the Spanish tab and back to the French tab
    Then the French tab still shows "Guides"

  # --- Validation, including on a tab the blog editor is not looking at ---

  Scenario: The default store language's name is required
    Given a blog editor editing a blog category
    When they save the category with the default language tab left blank
    Then they are shown a validation message on that tab's name field

  Scenario: Blanking a language that already had a name is refused
    Given a blog editor, with a category named "Guides" in French
    When they save the category with the French tab cleared
    Then they are shown a validation message on that tab's name field

  Scenario: Leaving an untranslated language blank is accepted
    Given a blog editor, with a category untranslated in French
    When they save the category without entering a French name
    Then the save is accepted and no French name is stored

  Scenario: A refusal on a hidden tab brings that tab into view
    Given a blog editor viewing the Spanish tab, with a duplicate name entered on the French tab
    When they save the category
    Then the French tab is brought into view carrying the validation message

  Scenario: A tab carrying a refusal is marked in the tab strip
    Given a blog editor whose save was refused because of the French tab's name
    When they switch away to the Spanish tab
    Then the French tab is still marked as carrying a problem

  # --- Uniqueness, scoped per store language and folded ---

  Scenario: Two categories cannot share a name within one store language
    Given a blog editor, with a category named "Guias" in French
    When they save another category with "Guias" entered on the French tab
    Then they are shown a validation message on that tab's name field

  Scenario: The same name in two different store languages is permitted
    Given a blog editor, with a category named "Guias" in French
    When they save another category with "Guias" entered on the Spanish tab
    Then the save is accepted

  Scenario: Names differing only by accent collide within one store language
    Given a blog editor, with a category named "Guias" in French
    When they save another category with "Guias" accented differently on the French tab
    Then they are shown a validation message on that tab's name field

  Scenario: A blog editor re-saves a category under its own unchanged name
    Given a blog editor, with a category named "Guides" in French
    When they save that category with its French tab unchanged
    Then the save is accepted

  # --- The list, which has no tabs ---

  Scenario: The list shows each category's name in the store's default language
    Given a blog editor, with a category named "Guias" in Spanish, the store default
    When they open the blog category screen
    Then the category is listed as "Guias"

  Scenario: A category with no name in the store default is listed without one
    Given a blog editor, with a category holding no name in the store default language
    When they open the blog category screen
    Then the category is listed with a placeholder in place of a name and no error is raised

  # --- Authorization, unchanged in kind ---

  Scenario: An administrator who may only view the catalog is offered no way to author a translation
    Given a signed-in administrator holding only the blog view permission
    When they open a blog category for editing
    Then the attempt is refused

  Scenario: A blog editor needs no store-language permission to author a translation
    Given a blog editor holding the blog edit permission and no store language permissions
    When they save a category with a name entered on the French tab
    Then the translation is stored

  # --- The backend layer, which protects callers that are not this screen ---

  Scenario: A caller without the blog edit permission cannot write a translation directly
    Given an administrator holding only the blog view permission
    When the translation writer is invoked directly to set a category's French name
    Then the attempt is refused and no translation is stored

  Scenario: A direct caller cannot store a blank translation
    Given a blog editor holding the blog edit permission
    When the translation writer is invoked directly with a blank French name
    Then the attempt is refused and no translation is stored

  Scenario: A direct caller cannot duplicate a name within one store language
    Given a blog editor, with a category named "Guias" in French
    When the translation writer is invoked directly to set another category's French name to "Guias"
    Then the attempt is refused and no translation is stored

  Scenario: A direct caller may reuse a name that is only taken in another store language
    Given a blog editor, with a category named "Guias" in French
    When the translation writer is invoked directly to set another category's Spanish name to "Guias"
    Then the translation is stored
```

> **Two scenarios deliberately *not* scripted**, both ghost-scenario checks per
> [rule 6](../../docs/testing/frontend/gherkin-guidelines.md#6-no-ghost-scenarios):
> - **"a blog editor removes a translation."** 0071's **Q-1** was resolved **(a) — no removal**, so
>   there is no such behaviour to script. See **D-4**.
> - **"a blog editor reads the name held in a removed language."** The data survives (0068 **D5**,
>   0070 **D-6**) but this screen deliberately offers no surface for it — see **D-5**. Scripting it
>   would assert a feature both this story and 0071 decline to build.

## Files to create/modify

### Create

| Path | Change |
| --- | --- |
| `app/Actions/Blog/SetBlogCategoryTranslation.php` | **New — layer 2.** The self-sufficient translation writer (**D-8**). `app/Actions/Blog/` is the **area** folder 0058 **D-14** established for this domain (verified: 0058 line 288), *not* an entity folder — this is the one place this story deliberately diverges from 0071, which files its action under `app/Actions/ProductCategories/` because Epic 2 uses entity folders. |
| `tests/Feature/Blog/SetBlogCategoryTranslationTest.php` | **New.** **Direct-call** tests for the action, with **no `Livewire::test()` anywhere in the file** — this is the layer that proves the action protects a caller that is not the screen (**D-8**). |
| `tests/Feature/Blog/BlogCategoryLanguageTabsTest.php` | **New.** Component-level behaviour. |
| `tests/Feature/Blog/BlogCategoryLanguageTabsRenderingTest.php` | **New.** DOM-level rendering. |
| `tests/Browser/BlogCategories/LanguageTabsTest.php` | **New — mirrored subfolder**, per 0071 **D-9**. |

**No new Blade component.** `resources/views/components/language-tab-strip.blade.php` is **0071's**;
this story is its **second consumer** and must not fork, copy or widen it (**D-1**).

⚠️ **`app/Actions/Blog/` is conditional on 0058's own Phase 2.** 0072 **D-6** records that 0058
flagged its area-vs-entity folder choice as something Phase 2 may reverse; if it does, this action
moves with the other three. The class **name** is fixed regardless, by 0071 **D-13**.

### Modify

| Path | Change |
| --- | --- |
| `app/Livewire/BlogCategories/Index.php` | **0062's.** `public string $name` → `public array $names`; adds `$activeLanguageId`, `$originalTranslatedLanguageIds`, `setActiveLanguageTab()`; `save()` gains `SetBlogCategoryTranslation` (method-injected) plus the `name` → `names.{defaultId}` error-key adapter; `loadCategories()` rewritten against the translated schema. See **D-2**, **D-3**, **D-8**, **D-12**. |
| `resources/views/livewire/blog-categories.blade.php` | **0062's.** The single-field modal becomes `<x-language-tab-strip>` plus one panel per active language. The list's name cell gains an em-dash branch. The delete modal is **untouched**. |
| `lang/en/blog.php`, `lang/es/blog.php` | **0061 creates, 0062 extends, this story extends again.** One `categories.index.tabs.*` group. Key-for-key identical. See **D-10** and the ⚠️ below. |
| `tests/Feature/Blog/BlogCategoriesIndexTest.php` | **0062's** — only where its own cases assert against the dropped `name` column (**R-1**). |

> ⚠️ **Four stories now write `lang/*/blog.php`** (0061 creates it, 0062 appends `categories.index`,
> 0063 appends its own, 0073 appends `categories.index.tabs`). Their Phase 3 work must **never** be
> dispatched in the same batch, per the
> [Parallel Agent File-Ownership Rule](../../docs/contracts.md#parallel-agent-file-ownership-rule).
> 0062 already carries the two-story form of this fence; this story makes it four. Note 0071 records
> the identical hazard for `lang/*/products.php` at three stories — this is the worse of the two.

### Deliberately not touched

| File | Owner |
| --- | --- |
| `resources/views/components/language-tab-strip.blade.php` | **0071** — **consumed, never edited** (**D-1**, **R-2**) |
| `app/Concerns/HasTranslations.php`, `app/Actions/Translations/SetTranslation.php` | 0070 — consumed, never re-implemented and never widened. `SetTranslation` is now reached **only** from inside `SetBlogCategoryTranslation`, never from the component (**D-8**) |
| `app/Models/BlogCategory.php`, `BlogCategoryTranslation.php`, `StoreLanguage.php` | 0072 / 0068 |
| `app/Concerns/BlogCategoryValidationRules.php` | 0058, re-scoped by **0072**; this story is a **consumer** of the re-scoped trait |
| `app/Actions/Blog/{Create,Rename,Delete}BlogCategory.php`, `app/Policies/BlogCategoryPolicy.php` | 0058 / 0061 / 0072 — signatures unchanged per 0072 **D-7** |
| `app/Actions/NormalizeForSearch.php` | 0022 — reached only *indirectly*, through the actions |
| `routes/blog-categories.php`, `config/modules.php`, `lang/*/navigation.php` | 0062 — **no route, no registry entry, no sidebar change** |
| `config/store-languages.php` | 0072 already appends `blog_category_translations` |
| `database/seeders/RolePermissionSeeder.php` | nobody — catalog stays at **42**; translating adds no permission (0072 **D-8**) |
| The delete-confirmation modal, its `blogCategoryId` error key and the post-count column | 0061 / 0062 — untouched by tabs |

### The component surface, diffed against 0062's

```php
namespace App\Livewire\BlogCategories;

#[Title('Blog categories')]
class Index extends Component
{
    use BlogCategoryValidationRules;   // 0072-re-scoped: the name rule gains a store-language parameter

    /** @var array<int, array{id: string, name: ?string, postCount: int, canEdit: bool, canDelete: bool}> */
    #[Locked]
    public array $categories = [];      // `name` is now ?string — the fallback can resolve to null (D-12)

    /** @var array<int, array{id: string, code: string, name: string, isDefault: bool}> */
    #[Locked]
    public array $storeLanguages = [];  // ACTIVE only, default first then name (D-5)

    /** @var array<string, string> keyed by store_language_id; '' means "not typed". NEVER null. */
    public array $names = [];           // REPLACES 0062's `public string $name = ''`  (D-2)

    /** @var array<int, string> language ids this category already held a translation in, at modal-open. */
    #[Locked]
    public array $originalTranslatedLanguageIds = [];   // feeds D-4's conditional requiredness

    public string $activeLanguageId = '';   // overwritten to a real id before first render (D-3)

    #[Locked] public ?string $editingCategoryId = null;
    public bool $showModal = false;

    // --- 0062's delete path, entirely unchanged ---
    public bool $showDeleteModal = false;
    #[Locked] public string $blogCategoryId = '';
    #[Locked] public string $deletingCategoryName = '';

    public function setActiveLanguageTab(string $languageId): void;   // NEW — no Gate check (D-3)
    public function save(
        CreateBlogCategory $c,
        RenameBlogCategory $r,
        SetBlogCategoryTranslation $t,          // layer 2 — method-injected (D-8)
        LogRefusedPrivilegedAttempt $l,
    ): void;
    // mount / openCreateModal / openEditModal / closeModal / confirmDelete /
    // deleteCategory / closeDeleteModal keep 0062's signatures.
}
```

**The component never imports `SetTranslation`.** It is reached only from inside
`SetBlogCategoryTranslation` — 0071 **D-13**'s *"no component imports `SetTranslation`"* rule, which
is what keeps layer 2 unbypassable from the screen.

### Layer 2 — `App\Actions\Blog\SetBlogCategoryTranslation`

```php
namespace App\Actions\Blog;

final class SetBlogCategoryTranslation
{
    use BlogCategoryValidationRules;

    public function __construct(
        private readonly NormalizeForSearch $normalizeForSearch,
        private readonly SetTranslation $setTranslation,
    ) {}

    public function __invoke(
        BlogCategory $blogCategory,
        StoreLanguage $language,
        string $name,
    ): BlogCategoryTranslation;
}
```

Following 0071 **D-13**'s contract verbatim, with the Blog-side specifics **verified against 0058
rather than ported from 0071**:

- **`Gate::authorize('update', $blogCategory)` as its own first statement** — which resolves to
  `blog.edit` through `BlogCategoryPolicy::EDIT_PERMISSION` (verified: 0058 lines 345/360). Not
  `blog.create`: translating an existing category is editing it, and 0070 **D-9** is explicit that a
  self-authorizing `update` inside the shared primitive is what would wrongly make *creating* require
  the edit permission — which is precisely why the ability lives on this per-entity action instead.
- **Then trims, then validates with its own `Validator::make(...)->validate()`**, reusing
  `BlogCategoryValidationRules` — never a locally written rule. The rule is 0072's language-scoped
  one, which on this entity binds the stored fold column:
  `Rule::unique('blog_category_translations', 'normalized_name')->where('store_language_id', $language->id)->ignore($blogCategory->id, 'blog_category_id')`.
  ⚠️ **The `->ignore()` target is the FK, not the PK** (0072 **D-4**) — a mechanical port from 0071
  passing the category's own id compiles, runs and matches nothing.
- **The error key is derived internally as `"names.{$language->id}"`**, never accepted as a
  parameter (0071 **D-13**). A caller-supplied key is the shape this project's errors log records as
  [a guard taking the state it guards as a parameter](../../docs/errors-log.md#a-guard-took-the-state-it-was-guarding-as-a-parameter-reopening-its-own-hole-one-level-up--2026-08-20).
- **Then calls `SetTranslation`**, whose `updateOrCreate()` on the `(category, language)` natural key
  makes re-translating replace rather than duplicate, and whose write fires 0072's
  `normalized_name` derivation hook on `BlogCategoryTranslation`.
- **Constructor-injects both collaborators** per
  [code-style.md](../../docs/conventions/code-style.md#exception-an-actions-own-dependency-is-constructor-injected-when-the-method-signature-is-a-public-contract)'s
  documented exception, and is **resolved from the container, never `new`-ed, including in tests**.
- ⚠️ **It must not copy 0058's blanket `23000` catch.** 0058's actions translate any `23000` into a
  `ValidationException` on `name`, which was safe on a table with exactly one unique constraint;
  `blog_category_translations` has **two** `UNIQUE`s plus **two** FKs (0072 **R-11**), so a blanket
  catch would report an FK violation as "name taken". Either re-check narrowly before re-throwing or
  let the exception surface — Phase 3's choice, but the constraint is fixed.

**This supersedes 0062's committed surface rather than extending it** — `public string $name = ''`
cannot survive 0072 **D-2** dropping `blog_categories.name` and `normalized_name`. Recorded as an
amendment needing explicit Phase 2 sign-off, not a silent override (**R-1**).

### What is genuinely this story's, and not 0071's

0071 retrofits `product_categories`, whose uniqueness is a plain `unique('name')` on the parent.
**Blog categories are not shaped that way**, and 0072's **D-1** and **D-4** are the reason this file
is not a find-and-replace of 0071:

- **Uniqueness binds a stored, derived `normalized_name`**, per `UNIQUE(store_language_id,
  normalized_name)` on the child table — so an **accent-only** duplicate collides within one language
  and is accepted across two, which 0071's screen cannot express.
- **The `->ignore()` target is the FK, not the PK** (0072 **D-4**): the ignored row is a
  *translation*, so a mechanical port passing the category's id compiles, runs and **never matches
  anything** — failing silently and one-directionally, exactly on "save a category under its own
  unchanged name". 0072 owns the rule; **this screen is where a user first meets it**, which is why
  the re-save scenario above and its test are non-negotiable here.
- **The actions authorize before they validate** (0058 **D-13**), which 0071's do not (0023 predates
  the convention). Every negative-validation test here must `actingAs()` a permitted actor first
  (**R-4**), and the new action inherits that ordering.
- **The new action lives in an *area* folder, `app/Actions/Blog/`** (0058 **D-14**, verified at 0058
  line 288), where 0071 files its equivalent under the *entity* folder `app/Actions/ProductCategories/`
  because Epic 2 uses entity folders. Same pattern, different folder convention — following the
  entity being retrofitted rather than the story being copied, exactly as 0072 **D-6** did.
- **The new action must not copy 0058's blanket `23000` catch**, because the child table has two
  `UNIQUE`s and two FKs rather than one unique constraint (0072 **R-11**) — a nuance with no analogue
  on the product side, where 0023's parent table carries a single unique index.

## 3. QA test cases / validation scenarios

**Calibration:** this story does **not** re-run 0072's, 0070's or 0062's suites one layer up. Those
prove the fold, the fallback chain, `SetTranslation`'s semantics, the cascade, the policy matrix and
the delete block at their own layers. This story asserts only that the **screen routes into those
rules and renders their outcome**.

> **Read before writing any negative-validation test.** 0058's **D-13** makes the actions authorize
> *before* they validate, so a direct call with no permitted actor throws `AuthorizationException`,
> **not** `ValidationException`. `actingAs()` an actor holding `blog.edit` first, or the test passes
> for entirely the wrong reason. Inherited from 0072's **R-8**, and **absent from 0071**, so a reader
> diffing the two screens will not find it there.

### Feature — `tests/Feature/Blog/SetBlogCategoryTranslationTest.php` — layer 2, direct-call only

> **This file must contain no `Livewire::test()` call anywhere.** Its entire purpose is to prove the
> action protects a caller that is **not** this screen; routing even one case through the component
> would make the file assert layer 1 while claiming to assert layer 2. The action is resolved with
> `app(SetBlogCategoryTranslation::class)`, **never** `new` — three actions gained their first
> constructor dependency in task 0015b and every `new` call site broke at once
> ([code-style.md](../../docs/conventions/code-style.md)).

- [ ] **Authorization, called directly.** An actor holding only `blog.view` throws
      `AuthorizationException` and writes **nothing** — asserted on the row count, not only on the
      throw. *Why:* this is the single case that proves 0008a's gap is closed; a component test cannot
      show it, and it is the whole reason layer 2 exists.
- [ ] An actor holding `blog.edit` and **zero** `store-languages.*` permissions succeeds (0072 **D-8**).
- [ ] **Authorization precedes validation.** A blank name submitted by an *unpermitted* actor throws
      `AuthorizationException`, **not** `ValidationException` — 0058 **D-13**'s ordering, at the new
      action. *Why:* it is the ordering every negative test in the other files depends on, and nothing
      else pins it here.
- [ ] **Validation, called directly:** blank, whitespace-only, and over-length names each throw
      `ValidationException` and write nothing. *Why:* `SetTranslation` validates nothing (0070
      **D-9**), so if this action does not, a direct caller writes junk the screen would have refused.
- [ ] **The error key is `names.{languageId}`**, derived internally — asserted by reading the thrown
      exception's key, and asserted for **two different languages** so a hardcoded default-language id
      cannot pass.
- [ ] **Per-language uniqueness, called directly:** the same name refused twice within one language,
      accepted across two, using a **byte-identical** fixture string in the accepted case.
- [ ] **The accent fold reaches the action:** an accent-only variant within one language is refused.
- [ ] **Re-saving a category's own unchanged name in the same language is accepted** — 0072 **D-4**'s
      FK-scoped `->ignore()`, exercised at the layer that owns the rule rather than only through the
      screen.
- [ ] **A row is replaced, not duplicated** — calling the action twice for the same
      `(category, language)` leaves exactly **one** row whose `name` is the second value and whose
      `normalized_name` matches the *second* value's fold. *Why:* this is the composition of
      `SetTranslation`'s `updateOrCreate()` with 0072's derivation hook, and it is where a stale fold
      key would hide.
- [ ] **An inactive store language is still writable through the action.** *Why:* the `is_active`
      filter belongs at the tab-rendering layer only (0070 **D-6**, **D-5**); an action that refused
      an inactive language would push the filter down a layer and break 0068's **D5**.
- [ ] **Not tested here:** the fold's own table (0022), `SetTranslation`'s generic semantics (0070),
      the policy matrix (0058). One canary each, as above.

### Feature — `tests/Feature/Blog/BlogCategoryLanguageTabsTest.php`

*Happy path*
- [ ] Saving with the default tab filled and one other language filled calls `CreateBlogCategory`
      with the default name **and** `SetBlogCategoryTranslation` with the second language — asserted
      as **two separate calls with two separate arguments**, never one call carrying both.
- [ ] Editing only the French tab calls `SetBlogCategoryTranslation` for French and does **not** call
      `RenameBlogCategory`. *Risk if missing:* the retrofit collapses back to "always rewrite the
      default row", silently corrupting a deliberately French-only edit.
- [ ] **The component never reaches `SetTranslation` directly** — asserted structurally, as an
      `arch()`-style or import assertion that `App\Livewire\BlogCategories\Index` does not reference
      `App\Actions\Translations\SetTranslation`. *Why:* 0071 **D-13**'s *"no component imports
      `SetTranslation`"* rule is what keeps layer 2 unbypassable, and it is invisible to every
      behavioural test — a component calling the primitive directly produces identical output while
      silently skipping the action's authorization and validation.
- [ ] The tab set equals `StoreLanguage::active()` — asserted as a **count** against an
      N-active-language fixture, never "contains Spanish and French" (**D-11**).

*Edge cases — the ones nobody writes by default*
- [ ] **The fallback does not leak into the edit field.** A category named in Spanish only, opened on
      the French tab, renders `''` — **not** "Guias". *Risk if missing:* **the sharpest bug this
      story can ship** (0071 **D-6**) — saving an untouched French tab manufactures a French
      translation byte-identical to Spanish that the editor never typed. Raised independently by both
      amigos here and by both of 0071's.
- [ ] **Blank-because-untranslated is distinguishable from blank-because-cleared** —
      `$names[$frenchId] === ''` with `$frenchId` absent from `$originalTranslatedLanguageIds` on the
      first, present on the second. *Risk if missing:* **D-4**'s conditional-requiredness branch
      cannot fire.
- [ ] **The store default changes under an existing catalog** (0070 **R-2**): a Spanish-only category,
      French promoted to default directly via 0068's action, modal reopened → the French tab renders
      blank without throwing and the Spanish tab still shows its name.
- [ ] **A translation in a since-removed language**: French deactivated → (a) the French tab is gone,
      and (b) the list row still renders a name through the fallback. **Two assertions, not one** —
      losing the tab is correct; losing the row's name would not be.
- [ ] Switching tabs preserves unsaved input in `$names` for the other languages.
- [ ] Re-saving an unchanged tab creates no second translation row (row **count**), not a
      re-derivation of `SetTranslation`'s own `updateOrCreate` semantics.

*Negative cases*
- [ ] **A validation error keyed to a non-visible tab.** Spanish tab active, duplicate name on the
      French tab, save → assert **both** `assertHasErrors(['names.'.$frenchId])` **and** that
      `$activeLanguageId` has moved to French. ***The single highest-value test in this story*** — the
      textbook "the save silently did nothing" bug, where the visible tab shows no error and nothing
      tells the editor why the modal stayed open.
- [ ] **Two tabs failing at once** mark both, and `$activeLanguageId` lands on the **first in strip
      order** — not merely "a tab with an error". *Risk if missing:* a marker computed from the
      single most recent error passes every one-error test.
- [ ] The default language's tab blank → refused, unconditionally (0070 **Q1(a)**).
- [ ] A previously-translated non-default tab blanked → **refused** (**D-4**); a previously-
      untranslated one left blank → **accepted and not written**.
- [ ] Same name, two different languages → accepted. Same name, same language, two categories →
      refused. **Byte-identical fixture string** in the accepted case — a fixture differing in case or
      whitespace would pass under a rule that ignores language scoping entirely.
- [ ] **One accent-only canary within a single language** (`"Guías"` / `"Guias"`) → refused. ⚠️ Per
      0062's **R-9**, `utf8mb4_unicode_ci` is itself accent-insensitive, so this **cannot
      independently prove the normaliser ran**; that proof is 0072's whitespace tests, and this
      suite is trustworthy only while they stay green (**R-6**).
- [ ] **Re-saving a category under its own unchanged name in the same language is accepted** — the
      `->ignore()` trap (0072 **D-4**). Written as **three** assertions so a rule that rejects
      everything cannot pass trivially: the no-op save succeeds; the translation row is genuinely
      unchanged; and a genuinely free name in the same language is still accepted, as the control.
- [ ] A forged `setActiveLanguageTab()` or per-tab write against an unknown or inactive language id
      fails cleanly via `findOrFail()`, never reaching `SetTranslation` with `null`.
- [ ] **The locked-id retarget guard on the non-default path**: forging `editingCategoryId` between
      opening the modal and saving throws rather than retargeting (0062's own test, at a second call
      site).

*Authorization — layer 1, and the seam between the layers*
- [ ] **An actor holding only `blog.view` cannot write *any* tab's translation**, including a
      non-default one. *Risk if missing:* if the per-tab path is gated less carefully than the
      default-language path, a view-only actor could translate a category into every active language
      while being refused the rename.
- [ ] An actor with `blog.edit` and **zero** `store-languages.*` permissions can translate
      (0072 **D-8**).
- [ ] **The component refuses *before* the action runs** — a denied actor's `save()` throws and
      `SetBlogCategoryTranslation` is never invoked (assert on a spy/mock, or on the absence of any
      row). *Why:* this is what "fails fast before a transaction opens" means concretely, and it is
      the only test that distinguishes layer 1 doing its job from layer 2 catching everything.
- [ ] **Layer 1 validates before layer 2 is reached** — a blank default-language name produces
      `assertHasErrors(['names.'.$defaultId])` with the action never invoked. *Why:* if layer 1 stops
      validating, every refusal still works (layer 2 catches it) but the error arrives on a key the
      screen may not render, and no other test would notice the regression.
- [ ] **The `name` → `names.{defaultId}` adapter works** (**D-8**'s ⚠️). Drive a default-language
      refusal out of `CreateBlogCategory`/`RenameBlogCategory` — realistically by forcing the `23000`
      backstop, as 0062's own race-recovery test already does — and assert the error surfaces on
      `names.{defaultId}`, **not** on `name`. *Risk if missing:* the modal stays open with no visible
      message, which is exactly the "the save silently did nothing" failure this story exists to
      prevent, arriving through the one path layer 1 does not pre-validate.
- [ ] Every refusal logs `target_type: 'blog_category'`, set-equated against an existing screen's
      context keys in one `Log::spy()` session, per 0062's own recipe — and **one click produces one
      line**, not two, even though two layers now authorize. *Why:* `LogRefusedPrivilegedAttempt`
      writes only on refusal, so a passing layer-1 gate logs nothing and a failing one throws before
      layer 2 runs; 0062 **D-9** records the same verification for its delete path.

### Feature — `tests/Feature/Blog/BlogCategoryLanguageTabsRenderingTest.php`

- [ ] N tab controls render for N active languages, counted via `data-test="language-tab-{id}"` hooks,
      **never by language name** (**D-11**).
- [ ] Each panel holds a plain text input, one per language.
- [ ] An untranslated tab renders an empty input **plus** its "not yet translated" hint — the DOM
      counterpart of the no-leak test. *Risk if missing:* the component property can be correctly `''`
      while the Blade still interpolates a stray `translated('name')` left over from 0062's
      single-field markup — exactly the residue a retrofit produces.
- [ ] A tab carrying an error renders its marker on the **tab header**, not only on the field inside it.
- [ ] The list's name cell renders the **resolved** (fallback-applied) name, and an em dash when it
      resolves to `null`.
- [ ] **The delete modal still renders 0062's blocked-delete refusal unchanged** — one regression
      assertion, because this story rewrites the file that contains it.

### Browser — `tests/Browser/BlogCategories/LanguageTabsTest.php`

- [ ] **Typing into the French tab, switching away and back, preserves the text.** *Why it cannot be
      cheaper:* `Livewire::test()->set('names.'.$id, …)` writes the property directly and never
      touches the DOM — it would pass even if the real switch destroys the input.
- [ ] A real `fill()` on a **non-default** tab followed by a real Save persists that language's text —
      the new code path this story adds.
- [ ] A real click on a tab actually shows that tab's panel — the only level at which a compiled-
      `wire:click` no-op is detectable (**D-9**).
- [ ] A refused save's error does not survive Cancel + reopening against a different category — the
      `resetValidation()` regression 0018 shipped as a blocking bug, now with N error keys.
- [ ] `->assertNoJavaScriptErrors()` on every test.
- [ ] **Not used anywhere:** `->waitForEvent('networkidle')` — banned in this repo (**R-5**). Read
      `[wire:snapshot]` before reaching for a bounded `->wait(n)`.

### Deliberately NOT tested here

| Not tested here | Owner |
| --- | --- |
| The fold matrix (case, accent, ß, ç, whitespace, idempotence) | 0022 / 0072 — one canary only here |
| `HasTranslations`' fallback contract, per-field independence, `translated()`'s null-safety | 0070, proven generically |
| `SetTranslation`'s `updateOrCreate` semantics | 0070 — one row-count assertion here |
| The `normalized_name` hook, the backfill, the cascade, the `translation_relations` registry | 0072 |
| `BlogCategoryPolicy`'s exhaustive per-ability matrix | 0058 |
| The delete block, its count, `trans_choice()`, the no-force-delete assertion | 0061 / 0062 |
| `<x-language-tab-strip>`'s own rendering contract | **0071** — this story asserts only that it is *wired up* |
| The sidebar registry entry and route gating | 0062 — **untouched; flag in review that no change is expected** |
| Alpine reactivity, Eloquent SQL, Flux internals | vendor |

## Expected outcome

A blog editor opening a blog category sees one tab per active store language, the store default
selected. Each tab holds that language's own name — blank, and visibly marked as untranslated, where
none exists, never silently pre-filled with the fallback. They type a French name, save once, and the
category reads "Guides" in French and "Guias" in Spanish. A duplicate is refused **per language and
through the shared accent fold**, so the same string is accepted in two languages and refused twice in
one, while "Guías" and "Guias" collide within either; re-saving a category under its own unchanged
name is accepted rather than refused as a duplicate. When the refusal belongs to a tab they were not
looking at, that tab is **brought into view** carrying the message and stays marked while they
navigate. The list renders each category's name resolved through the store default, with an em dash
where none has been authored there, and the delete modal's hard-block refusal is unchanged. Removing a
store language removes its tab and preserves its content, which reappears intact if the language is
re-added.

Underneath the screen, the same rules hold **without** it: an importer, Artisan command or queued job
calling `App\Actions\Blog\SetBlogCategoryTranslation` is refused without `blog.edit`, refused for a
blank or duplicate name, and gets its refusal on the same `names.{languageId}` key the screen renders
— because the action authorizes and validates on its own account, not because a component did it
first.

## Acceptance criteria

- [ ] The create/edit modal renders exactly one tab per **active** store language, via **0071's**
      `<x-language-tab-strip>` with the component exposing `setActiveLanguageTab(string $languageId)`,
      with the store default selected on open. **No second tab-strip implementation is added.**
- [ ] Each tab's field shows that language's **own** translation, read from the raw translation row —
      **never** through `translated()`'s fallback.
- [ ] A language with no translation renders an empty field carrying a "not yet translated" hint,
      distinguishable from a cleared one.
- [ ] Saving writes the default language through `CreateBlogCategory`/`RenameBlogCategory` and every
      other language through **`App\Actions\Blog\SetBlogCategoryTranslation`**.
- [ ] **Writing a translation is authorized *and* validated at two independent layers** — the
      component authorizes the whole batch and validates every active language's key before any write,
      **and** `SetBlogCategoryTranslation` independently authorizes `update` on the category
      (`blog.edit`) and runs its own `Validator` before calling `SetTranslation`. **Deleting either
      layer removes a layer, not a redundancy.** The action is provably sufficient on its own: a
      direct call by an unpermitted actor is refused with no component involved.
- [ ] **No component imports `App\Actions\Translations\SetTranslation`** — it is reached only from
      inside `SetBlogCategoryTranslation`.
- [ ] **A default-language refusal thrown by `CreateBlogCategory`/`RenameBlogCategory` on the `name`
      key is re-keyed to `names.{defaultId}`** by the component, so it renders on the default
      language's tab instead of vanishing.
- [ ] The default language's name is required; a previously-translated language's name may not be
      blanked; a previously-untranslated one may be left blank and is not written.
- [ ] A validation refusal keyed to a hidden tab **switches the active tab to that language** and
      marks it in the strip; two simultaneous refusals mark both and select the first in strip order.
- [ ] Uniqueness renders **per store language and through the shared fold** — the same name accepted
      across two languages, refused twice within one, and an accent-only variant refused within one.
- [ ] **Re-saving a category under its own unchanged name in the same language is accepted**, proving
      0072 **D-4**'s FK-scoped `->ignore()` reaches this screen correctly.
- [ ] The list renders the fallback-resolved name and an em dash when it resolves to `null`; it orders
      without reference to a `blog_categories.name` column.
- [ ] A removed store language contributes no tab, and its stored content is neither shown nor
      destroyed.
- [ ] Every tab, panel, field and error marker carries a `data-test` hook; **no assertion anywhere in
      this story matches on a language name or a two-letter code**.
- [ ] The delete-confirmation modal, its `blogCategoryId` error key and the post-count column are
      **behaviourally unchanged**, with one regression assertion proving it.
- [ ] `lang/en/blog.php` and `lang/es/blog.php` stay key-for-key identical, and this story adds no key
      under `categories.delete_blocked`.
- [ ] No route, model, migration, policy, factory, seeder or permission change; the catalog stays at
      **42** permissions. **Exactly one action is added** (`SetBlogCategoryTranslation`) and the three
      existing `app/Actions/Blog/*BlogCategory` actions are **unmodified**.

## Definition of Done
- [ ] Tests written and green (**full suite unscoped**, not `--filter`)
- [ ] `vendor/bin/pint --format agent` run **unscoped**, not `--dirty`
- [ ] **Larastan level 7 run and recorded** — named explicitly because
      [errors-log.md](../../docs/errors-log.md#a-verification-record-that-lists-two-of-three-quality-gates-is-a-record-of-two-gates--2026-08-26)
      records three consecutive stories whose verification notes listed two of three gates and were
      read as records of all three
- [ ] Code reviewed (code-reviewer) — ⚠️ **the two authorization/validation layers (D-8) are
      deliberate and must not be collapsed.** Flagged in the DoD because they read as duplication at a
      glance, and a "simplify this" pass deleting either one is the likeliest regression this story
      can suffer (**R-9**)
- [ ] No security findings (appsec-auditor) — point the audit at: **both** layers of the per-tab write
      path (a `blog.view` actor must not translate, whether through the screen **or** by calling
      `SetBlogCategoryTranslation` directly); that the action authorizes **before** it validates;
      that its error key is derived internally rather than accepted as a parameter;
      `$originalTranslatedLanguageIds` being `#[Locked]`; and the `#[Locked]` + server-read id pair
      behind `->ignore()`
- [ ] **Compiled output of the tab strip verified by rendering, not by absence of an error** (**D-9**)
- [ ] **0071's `<x-language-tab-strip>` consumed unmodified**, verified by `git diff` showing no change
      to `resources/views/components/language-tab-strip.blade.php` (**R-2**)
- [ ] Documentation updated (docs-keeper) — at minimum
      [api/routes.md](../../docs/api/routes.md)'s `blog-categories.index` section (the tabbed modal and
      its `data-test` hooks), and whichever page records that the tab strip now has **two** consumers
- [ ] **Recorded as a handoff, not done here:** the 0062 amendments in **R-1**. This story edits no
      other story's file.
- [ ] Acceptance criteria met

## 4. Documented functional decisions

**D-1 — This story consumes 0071's `<x-language-tab-strip>`; it does not build, fork or widen one.**
0071 extracted the strip as an **anonymous** Blade component (this repo's only kind — there is no
`app/View/`) with the prop contract `['languages' => Collection, 'active' => string,
'errorLanguageIds' => array<int, string>]`, and the constraint that **every consuming component must
expose `setActiveLanguageTab(string $languageId)` by that exact name**, because the strip hardcodes
the call. This story satisfies that contract and adds nothing to it. *Rejected:* a Blog-specific strip
— it would make the tab contract two implementations before the third and fourth screens (0075, 0079)
even choose, which is precisely what 0071's **R-8** exists to prevent. ⚠️ **If this screen needs
something the strip does not offer, the correct move is to widen the strip in a story that owns it,
not to fork it here** (**R-2**).

**D-2 — `$names` is an array keyed by store-language id, and 0062's `public string $name` is
*removed*, not kept alongside it.** The default language's value lives at `$names[$defaultId]` like
every other language's. Keeping both creates two representations of one value that can drift. `$names`
is **unlocked** (nothing reads it for a decision — every write re-derives its target from the
database) while `$originalTranslatedLanguageIds` **is** `#[Locked]`, because it feeds **D-4**'s
conditional-requiredness branch: a forged value would let an actor blank away a genuinely existing
translation without tripping the blank-is-refused rule, silently destroying content. That is a
data-integrity concern, locked for the same reason `$editingCategoryId` is. **No entry in `$names` is
ever `null`** — every active language gets a real `''` key at modal-open, extending this repo's
[never-`null`-bound-property rule](../../docs/errors-log-archive.md#a-null-livewire-property-bound-to-a-native-select-silently-dropped-the-users-own-pick--2026-08-16)
from scalars to array **values**.

**D-3 — Tabs switch on a server round trip via `public string $activeLanguageId`, not client-side
Alpine.** 0071's **D-2**, adopted whole, and **this reverses this debate's own first conclusion**
(**C-1**). The decisive reason is the error case: **a validation refusal can land on any tab, and only
the server knows which.** With `$activeLanguageId` driving an `@if`, `save()` sets the active tab to
the first erroring language *before* the failed-validation re-render, so the right panel is on screen
on the very next paint using the boring mechanism every other screen here already uses. An Alpine-only
switch cannot learn, after a failed `save()`, which language was refused. `$activeLanguageId` is
unlocked and never binds a `<select>` — it drives an `@if` — so the null-bound-`<select>` trap is
structurally inapplicable. `setActiveLanguageTab()` carries **no** `Gate` check: it changes only which
panel is visible and discloses nothing the modal has not already loaded.

**D-4 — Requiredness is conditional per tab, and blanking an existing translation is refused.**
0071's **D-7**, adopted unchanged. Three branches: the **default** language is always `required`
(0070 **Q1(a)**); a **non-default, previously untranslated** language is `nullable`, so leaving it
blank is a no-op rather than a refusal; a **non-default, previously translated** language is
`required`, so blanking it out is refused. That third branch is what makes 0072's *"A blank
translation is refused"* scenario hold at the UI layer, since `SetTranslation` performs no validation
of its own. The condition is expressed in the **component**, never pushed into
`BlogCategoryValidationRules` — "was this language translated when the modal opened" is a property of
the *session*, not of the field, and the trait must stay reusable by 0075/0079. **Consequence,
settled upstream:** [0071's **Q-1** was resolved on 2026-08-30 as option (a)](0071-product-categories-language-tabs-ui.md) —
a translation, once authored, can be corrected but not removed — so this story ships no removal path
and does not re-ask the question.

**D-5 — Only active store languages get a tab; content in a removed language is hidden, not shown
read-only.** Three sources agree and this debate did not have to choose. The **PRD's own Gherkin**:
*"And the French tab no longer appears in the editors."* **0069's D-8**: *"a removed language is, from
the UI's side, indistinguishable from one never added"*, with a separate "removed languages" list
explicitly rejected. **0068's D5**: the row survives, so re-adding the language restores the tab with
content intact. Critically, **0070's D-6 makes this story that layer**: *"the `is_active` filter
belongs one layer up, at the UI's 'which tabs do I render' decision — never inside the fallback."* So
`StoreLanguage::active()` gates the **tab strip only**, and no `is_active` clause may appear on any
read, relation or fallback path. ⚠️ The residual — no signal that stale content exists in a removed
language — is [0069's backlog item 3 / 0072's **R-7**](0072-translatable-content-retrofit-blog-categories-backend.md),
now passing unaddressed for a **fourth** time (0070, 0072, 0071, this story). Recorded by number
rather than locally patched (**R-7**); the signal already exists at the right layer, in
`StoreLanguage::translationUsageCount()` and 0069's removal warning.

**D-6 — The edit field reads the raw translation row; the list cell reads `translated()`.** 0071's
**D-6**, adopted, and independently reached by both amigos here. `translated('name', $frenchId)`
applies the fallback by design, which is **correct for the list** (a row must render *something*) and
**wrong for the edit input**: binding it into the French field means an editor who saves without
touching that tab silently creates a French translation byte-identical to the Spanish one. So the
modal loads `$category->load(['translations' => fn ($q) => $q->whereIn('store_language_id',
$activeIds)])` and reads each language's own row, rendering `''` where none exists. ⚠️
**`scopeWithTranslationsFor()` is the wrong tool for the modal** — it always widens to (requested,
default), at most two languages, because it was built for list resolution. The modal needs the raw
value for **every** active language. It **is** the right tool for the list (**D-12**).

**D-7 — Error keys are `names.{languageId}`, and this must be proven by execution before any markup
is written.** The dotted-array-key form is the standard idiom and `$names` is a declared public
property, so Livewire's `SupportValidation::dehydrate()` → `Utils::hasProperty()` filter should keep
it — the 0017 lesson applied to an array element rather than a flat name. **Not verified: `vendor/` is
absent.** 0071's **D-8** flags the identical uncertainty and notes the closest precedent
(`Roles\Index`'s `selectedPermissionIds`) validates with `selectedPermissionIds.*` rules but throws on
the **base** property name, which gets close without settling it. **The first thing Phase 3 proves,
with a minimal `Livewire::test()` case.** If it fails, the fallback is a flat sanitised key per
language, and **0071 must be told**, since both screens share the shape (**R-8**).

**D-8 — Writing a translation is authorized *and* validated at TWO independent layers: the component
*and* `SetBlogCategoryTranslation`. Neither is redundant, and a reviewer must not collapse them.**
*(Human architectural decision, 2026-08-30, established for real in 0071 **D-4**/**D-13** and applied
here verbatim — superseding this story's earlier component-only shape; see **C-2**.)*

| Layer | Where | What it does | What it protects |
| --- | --- | --- | --- |
| **1 — component** | `App\Livewire\BlogCategories\Index::save()` | `Gate::authorize()` on the whole batch, then `$this->validate()` across every active language's key | fails fast before a transaction opens, keeps the per-row `canEdit` hint honest, and renders every refusal on the right tab |
| **2 — action** | `App\Actions\Blog\SetBlogCategoryTranslation` | `Gate::authorize('update', $blogCategory)` then its own `Validator::make(...)->validate()` | binds **every** caller — a future importer, Artisan command or queued job inherits the whole rule with no component in sight |

**Why both.** This repo has ruled on the identical question twice, in the same direction.
[base-standards.md](../../docs/conventions/base-standards.md#an-authorization-rule-belongs-to-the-action-not-to-one-of-its-callers)
establishes that *"if an operation must not happen without a permission, the check lives in the class
that performs the operation"* — layer 2 — and task 0017's Sales Regions precedent adds the converse in
as many words: ***"a component that authorizes as well is a layer, not a redundancy … a reviewer who
deletes one of the two has removed a layer, not a redundancy."*** Layer 1 is what 0008a's finding
proves cannot be sufficient (a rule living only in a Livewire component leaves every non-dashboard
caller ungated); layer 2 is what 0017 proves cannot be sufficient *for the screen* (it opens a
transaction before failing, and it cannot key an error onto the tab the user is looking at).

**The asymmetry is the whole rule and is easy to get backwards** (0071 **D-13**): component-only is
**never** acceptable; action-only is acceptable wherever a component cannot validate without
duplicating a rule the action owns. The test is *"if I delete the component, is the operation still
protected?"* — here, yes.

Two mechanics, both existing conventions applied rather than new rules: the component authorizes the
**whole batch** before any action runs (task 0017's *"authorize every row the operation writes"*, one
layer up), while layer 2 re-authorizes **per row**, the correct granularity for a caller with no
batch; and `SetBlogCategoryTranslation` is **method-injected** into `save()` while its own two
collaborators are **constructor-injected** — the per-method rule and its documented exception, not a
third case.

> ⚠️ **The default-language path keys its refusals differently, and the component must adapt — the
> same mismatch 0071 found, confirmed to exist on the Blog side too.** Verified against 0058 rather
> than assumed: `CreateBlogCategory` / `RenameBlogCategory` catch `QueryException` `23000` and rethrow
> `ValidationException::withMessages(['name' => …])` (0058 lines 293–301), while every field on this
> screen binds to **`names.{languageId}`**. So a default-language refusal from those two actions —
> realistically the `23000` race backstop, since layer 1 validates first — would land on a key no
> field renders, and the editor would see the modal stay open with no message. **The component
> catches that `ValidationException` and re-keys `name` → `names.{defaultId}`.** *Rejected:* widening
> 0058's actions to key on `names.{id}`, which changes a public contract 0062 and every direct-call
> test bind to, in a story not allowed to edit either file. The adapter is three lines in one place;
> the alternative is a cross-story contract break.

**D-9 — Markup follows the errors-log's verified half, not its disproven mechanism.** What is verified
by execution is that **`@js()` fails to compile in the attribute of an anonymous `<x-…>` tag**; the
log's own dated correction says the *real* mechanism is **not established** and must not be guessed
at. The rules that survive: prefer `{{ \Illuminate\Support\Js::from(…) }}` for a dynamic value in a
component-tag attribute, and **verify the compiled output rather than the absence of an error**. So:
`{{ Js::from($language['id']) }}` inside the strip, `:`-bound expressions when passing props to
`<x-language-tab-strip>` (never `@js()`), and **render the modal and read the real HTML at Phase 3**.
A tab whose `wire:click` silently stringifies is a no-op with no PHP error, no console error and no
failed request — invisible to `Livewire::test()->call('setActiveLanguageTab', …)`.

**D-10 — Copy extends `lang/*/blog.php`; a language's own name is data, never a translation key.**
0062's **D-6** already commits this screen to `blog.php` rather than a per-screen file. This story
appends a small `categories.index.tabs.*` group (the untranslated-tab hint, the error marker's
`aria-label`) and **never touches `categories.delete_blocked`**, which is 0061's. **A language's
display name is read from `store_languages.name`** — the fixture's endonym — and must never be routed
through `__()`: there is no key for "Français", inventing one would duplicate 0068's fixture in a lang
file, and the tab labels **content**, not chrome. This is also the PRD's own two-layers rule: the
interface language (Layer 1, ES/EN only, story 0067) and store content languages (Layer 2) must not be
conflated.

**D-11 — No assertion in this story may match on a language name or a two-letter code.** 0071's
**D-11**, adopted, and the reason this story's hooks key on **`{id}`** rather than the `{code}` this
debate first chose (**C-3**). Three hazards, all real here: the tab labels **are** endonyms
("Español", "Français") and 0067's account-menu switcher renders the same strings in this page's own
chrome; **two-letter codes match inside ordinary prose** (`fr` inside "from", "confirm") — the
`assertSee('0%')`-inside-`10%` trap from 0018; and **a blog category could legitimately be named
"Français"** (a language-learning blog), so a fixture must never pick a category name colliding with
an active language's endonym. Every assertion goes through a `data-test` hook: `language-tab-{id}`,
`language-tab-error-{id}`, `language-panel-{id}`, `blog-category-name-input-{id}`. ⚠️ The last of
those **renames 0062's static `blog-category-name-input`**; if 0062 has shipped, its own tests
referencing the bare hook break and must be updated in this story's diff (**R-1**).

**D-12 — The list resolves and sorts in PHP through `translated()`, not through a SQL join.**

```php
BlogCategory::query()
    ->withCount(['posts' => fn ($query) => $query->withTrashed()])   // 0062 D-5, UNCHANGED
    ->withTranslationsFor()
    ->get()
    ->sortBy(fn (BlogCategory $c) => $c->translated('name'))
    ->values()
```

A raw join filtered to the default language **bypasses the fallback chain**, so it silently mis-orders
(or, with `INNER`, omits) any row lacking a default-language translation — a state 0070 **D-6**/**R-2**
says is reachable in normal operation after a default change. `translated()` degrades to `null` → em
dash, the convention `users.blade.php` and `roles.blade.php` already use. **The `withCount` clause is
0062's and must survive verbatim**: its `withTrashed()` scope is what keeps the row's post count equal
to the delete guard's count (0062 **D-5**), and a retrofit that rewrites this query is exactly where
that would be dropped by accident. `withTranslationsFor()` with no argument is a **single** eager load,
so N+1 (0070 **R-4**) is avoided by construction.

## What 0071 changed in this file

Recorded rather than silently overwritten, per this project's own standard for a conclusion that did
not survive verification.

| # | This debate first concluded | 0071's decision, now adopted | Why 0071 wins |
| --- | --- | --- | --- |
| **C-1** | Tabs switch **client-side (Alpine `x-show`)**; auto-switching to an erroring tab is unreliable because Livewire's morph preserves Alpine state, so rely on a per-tab marker plus a page-level callout instead. | **Server-side `$activeLanguageId`** (**D-3**), with `save()` setting it to the first erroring language. | The debate correctly identified that Alpine cannot learn *which* tab errored — and then designed around the limitation instead of removing it. 0071 removes it. The page-level callout is dropped as redundant once the offending tab is brought into view. |
| **C-2** | Add `App\Actions\Blog\TranslateBlogCategory`, because `SetTranslation` does not authorize and a component-only gate leaves a non-dashboard caller ungated. | **Both layers**: the component authorizes and validates the batch, *and* `App\Actions\Blog\SetBlogCategoryTranslation` authorizes and validates per row (**D-8**). | ✅ **Resolved by the human on 2026-08-30** — *"everything must be controlled from both front and back for security"*. `frontend-expert`'s original instinct (**V-1**) was right about the gap and understated the remedy: the answer is not action-*instead-of*-component but **both**. 0071 **D-13** makes it the master pattern and names this story by number; only the class name changed, to 0071's prescribed `Set<Entity>Translation` form. |
| **C-3** | `data-test` hooks key on the language **`code`** (`es`, `fr`) — stable across a fresh test database and human-legible. | Hooks key on **`{id}`**, and no assertion may match a name or code (**D-11**). | The debate missed that a two-letter code matches inside ordinary prose (`fr` in "from"/"confirm"). That is a live assertion hazard this repo has already been burned by in another form. |
| **C-4** | The create modal offers **only the default** language; other languages after the first save. | **Every tab on create** — [0071 **Q-2**, resolved 2026-08-30 as option (a)](0071-product-categories-language-tabs-ui.md). | Resolved upstream by the product owner. PRD Epic 5 does not distinguish create from edit, and the extra languages go through `SetBlogCategoryTranslation` exactly as on edit. |

**What this debate contributed that 0071 does not cover**, and which is the substance of this file:
the `normalized_name` fold reaching the UI (accent-only collisions within one language, accepted
across two), 0072 **D-4**'s FK-scoped `->ignore()` and the re-save scenario that is the only place a
user meets it, 0058 **D-13**'s authorize-before-validate trap (absent from 0071 entirely), and the
`withCount(['posts' => …withTrashed()])` clause that must survive the list-query rewrite.

## 5. Dependencies, risks, open technical questions

### Dependencies

- **[0072](0072-translatable-content-retrofit-blog-categories-backend.md)** — hard, blocking. The
  translation table, the model wiring, the re-scoped validation rule, the dropped `name` /
  `normalized_name` columns. **Specified, not implemented.**
- **[0071](0071-product-categories-language-tabs-ui.md)** — hard, blocking. Supplies
  `<x-language-tab-strip>` and the `setActiveLanguageTab()` contract. ⚠️ **A new dependency this
  debate did not originally have**, and the reason 0071 must be sequenced first.
- **[0062](0062-blog-categories-ui.md)** — hard, blocking. The component, view, route and sidebar
  entry this story widens. Itself blocked on 0058 → 0061.
- **[0070](0070-translatable-content-mechanism-product-categories-backend.md)** — hard.
  `HasTranslations`, `SetTranslation`, `defaultStoreLanguage()`. **0070's Q1 is still open**; this
  story assumes its recommended **(a) yes**.
- **[0068](0068-store-languages-catalog-backend.md)** — hard. `store_languages`, `scopeActive()`, and
  at least one active row, **without which the tab strip renders nothing at all**.
- Sequencing, strictly: **0058 → 0061 → 0062 → 0068 → 0070 → 0071 → 0072 → 0073**, each fully closed
  before the next starts. Seven unshipped dependencies.
- **No new package.** ⚠️ If Phase 2 overrides **D-1** toward a Flux Tabs component, that becomes a
  **paid dependency addition**, which `CLAUDE.md` requires approval for.

### Risks

- **R-1 — This story supersedes part of 0062's committed contract, and 0062 cannot be edited from
  here.** `public string $name = ''`, the "modal contains exactly one input" rendering test, the
  `orderBy('name')` list query, the `{id, name, …}` row shape and the static
  `blog-category-name-input` hook are all falsified. All are amendments **this story must not write**
  but that Phase 2 must accept explicitly rather than discover at implementation.
- **R-2 — 0071's R-1/R-2 gap has a Blog twin, and the window is a broken screen.** 0072 drops
  `blog_categories.name` while 0062's shipped `loadCategories()` reads `->orderBy('name')`. If 0062
  ships first (it must — it is Epic 4) and 0072 then lands, **0062's suite goes red at 0072's own
  Phase 3**, which [contracts.md](../../docs/contracts.md#full-test-suite-gate-rule)'s Full Test Suite
  Gate Rule forbids it closing through. 0072's **R-1** names the amendment and explicitly declines to
  own it. **D-12** supplies the replacement query; **Q-2** asks who owns applying it — the direct
  analogue of 0071's **Q-3**, which resolved as *"0071 owns it for its own screen"*, and the same
  answer is the obvious one here.
- **R-3 — Designed against seven unimplemented specs at once**, none verifiable by execution (no
  `vendor/`). Re-derive every signature against `HEAD` at Phase 3 rather than trust.
- **R-4 — The authorize-before-validate trap is inherited from 0058 and is invisible in 0071.** 0058's
  actions self-authorize as their first statement; 0071's descend from 0023 and do not, so a reader
  diffing this story against its sibling could reasonably conclude it does not apply. It does.
- **R-5 — Browser-test traps**, verbatim from
  [playwright-setup.md](../../docs/testing/frontend/playwright-setup.md#waiting-one-call-is-banned-in-this-repo-and-one-is-bounded).
  `->waitForEvent('networkidle')` is **banned outright** — it never settles here, and one session's
  hangs leaked ~60 `playwright run-server` processes and OOM-killed the MySQL container. A short
  bounded `->wait(n)` with a stated reason is the only accepted mitigation, and only after the
  alternative explanation is ruled out. A disabled-state helper must match `disabled="disabled"`,
  never a bare `disabled` substring.
- **R-6 — The accent canary cannot prove what it appears to prove.** `utf8mb4_unicode_ci` is itself
  case- and accent-insensitive, so an implementation that never reaches `NormalizeForSearch` still
  passes it. This suite is trustworthy **only while 0072's whitespace tests stay green** (0062's
  **R-9**, one layer up).
- **R-7 — The removed-language-still-holds-content gap passes unaddressed for a fourth time**
  (0069 backlog item 3 → 0070 → 0072 → 0071 → here). Recorded by number so a fifth story meets a
  decision rather than a silence.
- **R-8 — A defect in the shared strip, the error-key shape or the requiredness rule is reproduced
  four times before anyone re-examines it.** This story is the **first proof** that 0071's strip
  generalises — if it needs any modification to serve a second screen, that is a finding about 0071's
  contract, not a licence to fork (**D-1**). **D-7**'s unverified nested-error-key assumption is
  shared by both screens: if Phase 3 disproves it, 0071 must be told.
- **R-9 — ✅ CLOSED by the two-layer decision (D-8).** This risk previously read *"`SetTranslation` has
  no self-authorization and this story adds no intermediate action, so a future non-dashboard caller
  inherits nothing."* `SetBlogCategoryTranslation` is that intermediate action and closes it
  structurally. **What replaces it is a review risk, not a design one:** the two layers look like
  duplication to anyone reading `save()` and the action side by side, and the likeliest future defect
  is a "simplify this" pass deleting one of them. **D-8**'s table and the deletion test in the plan
  below exist to make that visible; the Definition of Done names it for the code reviewer explicitly.
- **R-10 — 0062's screen carries refusal logging and this story must not lose it.** 0062 specifies
  `LogRefusedPrivilegedAttempt::authorize()` with `target_type: 'blog_category'` on every mutating and
  disclosing method. The rewritten `save()` adds a new write path and must route through the same
  helper. Note this **differs from 0071**, whose **R-7** records that 0025's screen has no refusal
  logging at all — so the two sibling screens legitimately diverge here, and a reviewer diffing them
  should not "align" this one downward.

### Divergences recorded between the two amigos

- **V-1 — Whether a new action class is added.** `frontend-expert` said yes and called it "close to
  non-negotiable" on the action-owns-the-rule convention; `frontend-qa` (its **R-2**) leaned toward the
  component authorizing directly. **Decided: a new action *and* the component's own checks — both
  layers (D-8)**, by human architectural decision on 2026-08-30. **The expert's position was
  substantially right and QA's was not wrong either** — the confirmed answer is not one of the two
  they debated but the union of them: the expert correctly identified that a component-only gate
  leaves every non-dashboard caller ungated, while QA's instinct that the component must keep
  authorizing is what layer 1 preserves. *This entry previously read "Decided: no new action" — that
  resolution was superseded; see **C-2** and **Q-1**.*
- **V-2 — `data-test` hooks keyed by `code` or `id`.** `frontend-expert` argued `code`;
  `frontend-qa` proposed `{languageId}`. **Decided: `{id}` (D-11)**, matching 0071 and QA — the
  expert's stability argument is real but is outweighed by the prose-collision hazard.
- **V-3 — Browser-test file placement.** `frontend-expert` proposed extending 0062's
  `BlogCategories/IndexTest.php`; `frontend-qa` proposed a separate `LanguageTabsTest.php`.
  **Decided: QA's separate file**, matching 0071's own `ProductCategories/LanguageTabsTest.php`.

### Open questions for the product owner

**None remain open.** Both of this story's questions were resolved on 2026-08-30 — **Q-1** by an
explicit human architectural decision, **Q-2** by adopting the answer already confirmed for its
sibling. 0071's own Q-1 and Q-2 are likewise resolved and are consumed here rather than re-asked.
Both are kept below with their resolutions recorded rather than deleted, so a later reader sees a
decision instead of a silence.

**Q-1 — Should the per-tab translation write go through a domain action, in *both* 0071 and 0073?**
**✅ RESOLVED 2026-08-30 — both layers, neither optional.** The human's decision:
*"everything must be controlled from both front and back for security."* This story's draft
recommended option (a), *"keep 0071's component-authorizes-the-batch shape"* — that recommendation is
**superseded**. Option (a) is still what happens in the sense that this story follows 0071 rather than
diverging from it; what changed is that **0071's shape now includes the action**. The resolution is
implemented as **D-8** (the two-layer table), the new `SetBlogCategoryTranslation` in Files, its
dedicated direct-call test file, and the acceptance criteria below. `frontend-expert`'s **V-1**
position is recorded as substantially vindicated: it identified the right gap, and the human's answer
is stronger than the remedy it proposed, because it keeps layer 1 as well.

**Q-2 — Who applies the list-query fix that stops this screen throwing once 0072 drops
`blog_categories.name`? ✅ RESOLVED 2026-08-30 — option (a), by direct analogy.** 0071's **Q-3** is
the same question for the product side and resolved as *"0071 owns it for its own screen"*; the same
answer is adopted here. **Recorded honestly as adoption of a confirmed sibling precedent, not as an
independent ruling on this file.**
- **(a) 0073 owns it for the Blog Categories screen — _adopted_.** The list cannot render at all
  without it, and splitting "the modal gets tabs" from "the list stops throwing" across two stories
  leaves a broken screen between them. **D-12** supplies the replacement query. 0063's post-editor
  `category:id,name` partial select stays the coordinator's (backlog item 2).
- (b) A separate amendment story covering every affected screen. Tidier as a unit of work, but it
  blocks 0073 on a story that does not exist.

## 6. Technical tasks for later backlog creation

Derived from this debate; **none are in scope for 0073.**

1. **Amend [0062](0062-blog-categories-ui.md)** for the superseded component surface, the invalidated
   "exactly one input" rendering test, the `{id, name, …}` row shape, the `orderBy('name')` query and
   the renamed `blog-category-name-input` hook (**R-1**). Not this story's to write.
2. **Amend [0063](0063-blog-posts-list-editor-ui.md)**, whose `->with(['category:id,name'])` partial
   select names the dropped column explicitly (0072 **R-1**).
3. **Mark [0070's Q3](0070-translatable-content-mechanism-product-categories-backend.md) answered** —
   0071 for Product Categories, 0073 for Blog Categories, 0075 for Blog Tags.
4. **Stories 0075 / 0079** reuse `<x-language-tab-strip>`, expose `setActiveLanguageTab()`, add their
   own `SetBlogTagTranslation` / `SetBlogPostTranslation` per 0071 **D-13**, and re-derive none of
   **D-3**, **D-4**, **D-6**, **D-7**, **D-8** or **D-11**. Two things for those authors: **0079 is
   the first with multiple translatable fields per tab**, where **D-6**'s raw-read rule must
   generalise from one field to several and the error key becomes `"{$field}s.{$language->id}"`; and
   **0075 (Blog Tags) is 0071 D-13's named "looks like an exception and is not" case** — 0059 already
   makes its actions responsible for their own validation, so that screen legitimately has **no layer
   1 to add**, and adding one would duplicate a rule the action owns. Defence in depth still holds
   there because layer 2 is self-sufficient; the asymmetry is that component-only is never acceptable
   while action-only is.
5. **Surface "this language was previously removed and still holds content"** — 0069's backlog item 3,
   unaddressed after four stories (**R-7**).
6. **Widen [blade-livewire-output-encoding.md](../../docs/security/blade-livewire-output-encoding.md)
   from `wire:*` to any JavaScript-evaluated attribute**, Alpine's included — the rule's *mechanism* is
   parser-level and indifferent to which library reads the attribute, but its *statement* names only
   `wire:*`.
7. **`ModuleRouteAccessTest.php` still covers two routes while more exist** — inherited unclosed from
   0017/0018/0068/0069/0070/0072, untouched here since this story adds no route.

## Provenance

**Phase 1 Three Amigos debate, 2026-08-30.** Facilitator: `product-owner`. **Both amigos were
dispatched as real subagent calls and both returned and contributed.**

- **`frontend-expert` — returned and contributed.** The files table and the modify-0062's-deliverables
  framing; the `$names` array replacing `$name`; the never-`null`-array-value extension; the
  raw-read-not-`translated()` rule for the edit field; the PHP-side sort and `withTranslationsFor()`
  with no argument; the `@js()`/Alpine-attribute encoding gap; the action-owns-the-rule argument
  (**V-1**) — **which the human's 2026-08-30 decision substantially vindicated**: it identified the
  right gap, and the confirmed answer is stronger than the remedy it proposed, since it keeps the
  component layer as well as adding the action; and the
  Livewire-morph-preserves-Alpine-state observation that, read against 0071, is precisely the argument
  **for** server-side tab state (**C-1**).
- **`frontend-qa` — returned and contributed.** The full three-level test plan with a *why it can
  fail* per case; the six-case error-routing ladder including the two-tabs-at-once and
  false-positive-marker cases; the strict browser/non-browser split; the decoy-fixture and
  seed-then-deactivate fixture discipline; the three places a defensive `is_active` filter could creep
  in; the N+1 and stale-relation cases that belong here rather than in 0072 because this is the
  mechanism's first Blog list-rendering call site; and the page-global-`assertSee` hazard.

**Where the two amigos converged, independently:** the tab strip cannot assume a Flux component; the
fallback must never leak into an edit field; only active languages get tabs and the removed-language
item passes through unaddressed; sorting must happen after resolution; and neither sibling story's
suite should be re-run one layer up.

**Facts verified by the facilitator against the real tree rather than taken from a task file:**
`composer.json`/`composer.lock` carry `livewire/flux` with **no** `livewire/flux-pro`, and no
`flux:tab*` markup exists in `resources/views/`; there is **no `vendor/`**; `config/modules.php` holds
only `platform`/`settings`/`taxes`; `lang/en/` has no `blog.php`; `tests/Browser/` holds four files,
three of them flat; PRD lines 1450–1564 contain the Epic 5 Gherkin quoted in **D-5**; 0070's **D-6**
places the `is_active` filter at this layer by name; 0062 line 281 and 0072 line 326 name the
validation trait's method differently (`blogCategoryRules()` vs `nameRules()`), which **Phase 3
resolves by reading `HEAD`** rather than by this file picking; and `ai-spec/tasks/0071-*.md` **did not
exist** when this debate opened and **did** exist when it closed.

> ⚠️ **A process fact recorded rather than smoothed over.** This debate ran to completion, wrote its
> file, and only then discovered that 0071 had landed two minutes earlier. The file was rewritten
> against it; four of this debate's own conclusions were overturned (**C-1**–**C-4**) and are recorded
> in a table rather than silently replaced. **The lesson for the coordinator is not about this story:
> dispatching two Phase 1 debates for stories that share a pattern, concurrently, produces two
> independent designs and makes one of them wasted work.** That is the
> [Parallel Agent File-Ownership Rule](../../docs/contracts.md#parallel-agent-file-ownership-rule)'s
> reasoning applied to *design* rather than to files — the write sets did not overlap, but the
> decision spaces did.

**Amended 2026-08-30, after the debate closed, by human architectural decision.** The human confirmed
the master pattern — *"everything must be controlled from both front and back for security"* — which
0071 **D-4**/**D-13** establish and which **D-13 names this story by number**. Applied here as: the
new `App\Actions\Blog\SetBlogCategoryTranslation` (layer 2), the component keeping its own
authorization and validation (layer 1), a dedicated direct-call test file that contains no
`Livewire::test()` call, the `name` → `names.{defaultId}` adapter, and **Q-1** marked resolved. The
draft's own recommendation — *"keep 0071's component-authorizes-the-batch shape"* — is **superseded**
and recorded as such in **C-2** rather than deleted. Four Blog-side specifics were **verified against
0058 rather than ported from 0071**: the `app/Actions/Blog/` area folder (line 288),
`BlogCategoryPolicy::EDIT_PERMISSION = 'blog.edit'` gating `update()` (lines 345/360), all three
existing actions constructor-injecting `NormalizeForSearch` (line 321), and — the one that mattered —
that those actions really do rethrow `23000` as a `ValidationException` keyed **`name`** (lines
293–301), which is what makes the adapter necessary here and not merely copied from 0071.

**Nothing outside this file was created or modified.** No application code, migration, view or test
was written, and the files of stories 0058, 0061, 0062, 0063, 0068, 0069, 0070, 0071, 0072, 0074,
0075 and 0077 are untouched.

**Not run by this phase**, per [workflow.md](../../docs/workflow.md): the INVEST check (Phase 2), TDD
implementation (Phase 3), security audit (Phase 4), code review (Phase 5), or the docs pass (Phase 6).
