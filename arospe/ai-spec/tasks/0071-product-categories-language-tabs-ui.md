# [0071] Product Categories taxonomy screen — language tabs (frontend)

## Description
Retrofit story [0025](0025-product-categories-ui.md)'s Product Categories management screen so a
category's name is authored **per active store language** through language tabs, satisfying
[PRD Epic 5, Layer 2](../../docs/PRD/PRD.md#epic-5--internationalization)'s *"each active store
language surfaces as a tab … in the taxonomy management screens"* and its `Taxonomy names are
translatable per store language` scenario. Consumes story [0070](0070-translatable-content-mechanism-product-categories-backend.md)'s
mechanism (`HasTranslations`, `SetTranslation`, per-language uniqueness) unchanged.

**This story establishes the repo's first tabbed UI**, and four siblings (0073 Blog Categories,
0075 Blog Tags, 0077 Products, 0079 Blog Posts) will copy it. Verified at authoring time:
`grep -rn "flux:tab\|role=\"tab\"" resources/` returns **zero hits** — no tabbed markup of any
kind exists in this repo today.

> ## ⭐ This file is the master pattern for the translatable-taxonomy UI stories
>
> **Human architectural decision, 2026-08-30:** *"the component authorizes and validates the batch,
> but it must ALSO be controlled from the backend — everything must be controlled from both front
> and back for security."*
>
> Writing a non-default-language translation is therefore protected at **two independent layers**,
> and this story ships the missing backend one: a new domain action
> [`App\Actions\ProductCategories\SetProductCategoryTranslation`](#the-new-backend-action--the-layer-that-does-not-depend-on-a-caller)
> that **self-authorizes and self-validates**, wrapping 0070's deliberately-unguarded
> `SetTranslation` primitive. The component authorizes and validates too, before calling it.
> **Neither layer is redundant** — see **D-4**, which a reviewer must read before "simplifying"
> either away.
>
> **Stories 0073, 0075, 0077 and 0079 copy this shape**, including the one case where it looks
> different: a component that structurally cannot validate (0060's Blog Tags, whose actions already
> own validation per 0059) ships **only** the action layer, and defence in depth still holds because
> the action is self-sufficient regardless of its caller. See **D-13**.

> **Read this first: this story retrofits a screen that does not exist yet.** Verified against
> the live tree — `app/Livewire/` holds `Actions, Media, Roles, SalesRegions, Settings, Users`
> and no `ProductCategories/`; `app/Models/` holds `Media, Role, SalesRegion, User` and no
> `ProductCategory` or `StoreLanguage`; `app/Concerns/` holds no `HasTranslations`. **Stories
> 0023, 0024, 0025, 0068 and 0070 are all unimplemented Phase 1 files.** This story is therefore
> designed against *four* written contracts simultaneously and must be re-derived rather than
> silently trusted if any of their Phase 2/3 work changes shape — the
> [deferred-findings failure mode](../../docs/errors-log.md#a-deferred-storys-findings-were-claims-about-a-tree-that-no-longer-existed-and-one-of-them-would-have-reopened-a-bug-in-this-log--2026-08-23)
> this project records, at its widest exposure yet.

## Type
frontend | includes database-expert: **no** | consumes **0070** (mechanism), **0068** (`StoreLanguage`), **0025** (the screen), **0023**/**0024** (the domain)

> ⚠️ **Classification note, raised rather than silently resolved.** The 2026-08-30 defence-in-depth
> decision adds one `app/Actions/` class to a story classified **frontend**, which
> [workflow.md](../../docs/workflow.md#task-classification-rule) would ordinarily read as
> *fullstack* and therefore **split into two tasks**. This file deliberately does **not** split,
> for two reasons: the action is a thin, self-authorizing wrapper over a primitive 0070 already
> ships (no model, migration, schema, route or permission change — `includes database-expert`
> stays **no**), and splitting would put the screen and the guard it depends on in different
> stories, reproducing exactly the broken-window sequencing **R-2** already flags. **The
> coordinator owns this call**; if Phase 2 prefers a split, the action half is numbered *below*
> this story per the [task ordering rule](../../docs/workflow.md#task-ordering-rule), and
> `backend-expert` / `backend-qa` join its debate.

---

## 1. Refined user story

> **As** a catalog administrator working in a multilingual store,
> **I want** each product category's name to be editable per active store language through tabs on
> the same modal I already use,
> **so that** the catalog reads correctly in every language the store authors in, without leaving
> the screen or learning a second workflow.

> **As** the engineer who will build stories 0073, 0075, 0077 and 0079,
> **I want** the tab strip, its state contract and its per-language error handling to exist as one
> reusable, tested pattern,
> **so that** adding tabs to a fourth taxonomy screen is a partial include plus a property, not a
> fifth independent re-derivation of tab switching and per-language validation.

**Scope fence.** This story adds no route, model, migration, action, policy or permission. It
widens one Livewire component and one Blade view, extracts one shared partial, and appends one
lang group. Deletion, the in-use hard block and the product-count column are 0024/0025's and are
untouched.

## Gherkin — 2. Detailed acceptance criteria (Given/When/Then)

Every scenario opens with a named business-role actor and carries exactly one `When`, per
[gherkin-guidelines.md](../../docs/testing/frontend/gherkin-guidelines.md) rules 1 and 3.

```gherkin
Feature: Product category names authored per store language

  # --- The tabs themselves ---

  Scenario: A catalog administrator sees one tab per active store language
    Given a catalog administrator, with Spanish and French active as store languages
    When they open a product category for editing
    Then a tab is offered for Spanish and a tab is offered for French

  Scenario: A removed store language is offered no tab
    Given a catalog administrator, with French removed as a store language
    When they open a product category for editing
    Then no French tab is offered

  Scenario: The default store language's tab is the one shown first
    Given a catalog administrator, with Spanish as the store default and French also active
    When they open a product category for editing
    Then the Spanish tab is the one shown

  # --- Reading a translation ---

  Scenario: A tab shows the name authored in its own language
    Given a catalog administrator, with a category named "Calzado" in Spanish and "Chaussures" in French
    When they switch to the French tab
    Then the name field shows "Chaussures"

  Scenario: An untranslated language's tab shows an empty field rather than the fallback
    Given a catalog administrator, with a category named "Calzado" in Spanish only
    When they switch to the French tab
    Then the name field is empty rather than showing "Calzado"

  Scenario: An untranslated language's tab says the name is not yet translated
    Given a catalog administrator, with a category named "Calzado" in Spanish only
    When they switch to the French tab
    Then they are told the category has no name in that language yet

  # --- Writing a translation ---

  Scenario: A catalog administrator translates a category into an additional language
    Given a catalog administrator, with a category named "Calzado" in Spanish only
    When they save the category with "Chaussures" entered on the French tab
    Then the category reads "Chaussures" in French and still reads "Calzado" in Spanish

  Scenario: A catalog administrator corrects a name in one language only
    Given a catalog administrator, with a category named "Calzado" in Spanish and "Chaussures" in French
    When they save the category with the French tab changed to "Souliers"
    Then the category reads "Souliers" in French and still reads "Calzado" in Spanish

  Scenario: Creating a category records the name entered on the default language tab
    Given a catalog administrator with permission to create product categories
    When they save a new category with "Calzado" entered on the Spanish default tab
    Then the category is created holding a Spanish name of "Calzado"

  Scenario: Unsaved text on a hidden tab survives switching tabs
    Given a catalog administrator who has typed "Chaussures" on the French tab
    When they switch to the Spanish tab and back to the French tab
    Then the French tab still shows "Chaussures"

  # --- Validation, including on a tab the administrator is not looking at ---

  Scenario: The default store language's name is required
    Given a catalog administrator editing a product category
    When they save the category with the default language tab left blank
    Then they are shown a validation message on that tab's name field

  Scenario: A refusal on a hidden tab brings that tab into view
    Given a catalog administrator viewing the Spanish tab, with a duplicate name entered on the French tab
    When they save the category
    Then the French tab is brought into view carrying the validation message

  Scenario: A tab carrying a refusal is marked in the tab strip
    Given a catalog administrator whose save was refused because of the French tab's name
    When they switch away to the Spanish tab
    Then the French tab is still marked as carrying a problem

  Scenario: Two categories cannot share a name within one store language
    Given a catalog administrator, with a category named "Chaussures" in French
    When they save another category with "Chaussures" entered on the French tab
    Then they are shown a validation message on that tab's name field

  Scenario: The same name in two different store languages is permitted
    Given a catalog administrator, with a category named "Chaussures" in French
    When they save another category with "Chaussures" entered on the Spanish tab
    Then the save is accepted

  # --- The list, which has no tabs ---

  Scenario: The list shows each category's name in the store's default language
    Given a catalog administrator, with a category named "Calzado" in Spanish, the store default
    When they open the product category screen
    Then the category is listed as "Calzado"

  Scenario: A category with no name in the store default is listed without one
    Given a catalog administrator, with a category holding no name in the store default language
    When they open the product category screen
    Then the category is listed with a placeholder in place of a name and no error is raised

  # --- Authorization, unchanged in kind ---

  Scenario: An administrator who may only view the catalog cannot author a translation
    Given a signed-in administrator holding only the products view permission
    When they open a product category for editing
    Then every language tab's name field is shown as unavailable

  Scenario: An administrator needs no store-language permission to author a translation
    Given a catalog administrator holding the products edit permission and no store language permissions
    When they save a category with a name entered on the French tab
    Then the translation is stored

  # --- The backend layer, which holds independently of the screen ---

  Scenario: Translating a category is refused for an actor lacking the products edit permission
    Given a signed-in administrator who does not hold the products edit permission
    When a product category's French name is set through the translation service
    Then the attempt is refused and no translation is stored

  Scenario: A blank translation is refused by the backend regardless of caller
    Given a catalog administrator holding the products edit permission
    When a product category's French name is set to a blank value through the translation service
    Then the attempt is refused with a validation error and no translation is stored

  Scenario: A duplicate name within one store language is refused by the backend regardless of caller
    Given a catalog administrator, with a product category named "Chaussures" in French
    When another category's French name is set to "Chaussures" through the translation service
    Then the attempt is refused with a validation error

  Scenario: A background importer receives the same protection as the screen
    Given a scheduled import running as an actor holding the products edit permission
    When it sets a product category's French name through the translation service
    Then the translation is stored under the same rules the screen enforces
```

## Files to create/modify

### Create

| Path | Change |
| --- | --- |
| `app/Actions/ProductCategories/SetProductCategoryTranslation.php` | **New.** The backend layer of the 2026-08-30 defence-in-depth decision — self-authorizes, self-validates, wraps 0070's `SetTranslation`. See **D-4** and the contract below. |
| `resources/views/components/language-tab-strip.blade.php` | **New.** The repo's first tabbed UI, extracted as an **anonymous** Blade component (this repo has no `app/View/Components/`). The **strip only** — never the panel bodies; see **D-1**. |
| `tests/Feature/ProductCategories/SetProductCategoryTranslationTest.php` | **New.** **Direct-call** action tests, independent of any component — the layer a `Livewire::test()` structurally cannot prove. |
| `tests/Feature/ProductCategories/LanguageTabsTest.php` | **New.** Component-level behaviour. |
| `tests/Feature/ProductCategories/LanguageTabsRenderingTest.php` | **New.** DOM-level rendering. |
| `tests/Browser/ProductCategories/LanguageTabsTest.php` | **New.** **Mirrored subfolder**, per **D-9**. |

### Modify

| Path | Change |
| --- | --- |
| `app/Livewire/ProductCategories/Index.php` | **0025's.** `public string $name` → `public array $names`; adds `$activeLanguageId`, `$originalTranslatedLanguageIds`, `setActiveLanguageTab()`; `save()` gains `SetProductCategoryTranslation`. See **D-3**. |
| `resources/views/livewire/product-categories.blade.php` | **0025's.** The single-field modal becomes a tab strip plus one panel per active language. The list's name cell gains a `data-test` hook and an em-dash branch. |
| `lang/en/products.php` + `lang/es/products.php` | **0024 creates, 0025 extends, this story extends again.** One `categories.index.tabs.*` group. Key-for-key identical. See **D-10** and the ⚠️ below. |

> ⚠️ **Three stories now write `lang/*/products.php`** (0024 creates it, 0025 appends `categories.index`, 0071 appends `categories.index.tabs`). Verified absent from the tree today. Their Phase 3 work must **never** be dispatched in the same batch, per the
> [Parallel Agent File-Ownership Rule](../../docs/contracts.md#parallel-agent-file-ownership-rule) —
> 0024, then 0025, then 0071, each fully closed before the next starts. 0025 already carries the
> two-story form of this fence; this story makes it three.

### Deliberately not touched

| File | Owner |
| --- | --- |
| `app/Concerns/HasTranslations.php`, `app/Actions/Translations/SetTranslation.php` | 0070 — **consumed, never re-implemented** |
| `app/Models/ProductCategory.php`, `StoreLanguage.php`, `ProductCategoryTranslation.php` | 0070 / 0068 |
| `app/Concerns/ProductCategoryValidationRules.php` | 0070 widens it; this story is a **consumer** of the widened trait and adds no method to it |
| `app/Actions/ProductCategories/{Create,Rename,Delete}ProductCategory.php`, `app/Policies/ProductCategoryPolicy.php` | 0023 / 0024 / 0070 — **note this row no longer covers the whole folder**: this story *adds* `SetProductCategoryTranslation.php` beside them (see above), and changes none of the three existing actions |
| `routes/web.php`, `config/modules.php`, `lang/*/navigation.php` | 0025 — no route and no sidebar entry is added or changed |
| `config/store-languages.php` | 0070 already appends `product_category_translations` |
| `database/seeders/RolePermissionSeeder.php` | nobody — catalog stays at **42**; translating adds no permission (0070 **D-13**) |
| The delete-confirmation modal and its in-use hard block | 0024 / 0025 — untouched by tabs |

### The new backend action — the layer that does not depend on a caller

```php
namespace App\Actions\ProductCategories;

final class SetProductCategoryTranslation
{
    public function __construct(
        private readonly NormalizeForSearch $normalizeForSearch,
        private readonly SetTranslation $setTranslation,
    ) {}

    /**
     * Authorize, validate and persist one product category's name in one store language.
     *
     * @throws AuthorizationException  when the actor lacks products.edit
     * @throws ValidationException     keyed "names.{$language->id}" — blank, over-length,
     *                                 or duplicate within that store language
     */
    public function __invoke(
        ProductCategory $productCategory,
        StoreLanguage $language,
        string $name,
    ): ProductCategoryTranslation {
        Gate::authorize('update', $productCategory);          // -> products.edit, via ProductCategoryPolicy

        $name = trim($name);

        Validator::make(
            ["names.{$language->id}" => $name],
            ["names.{$language->id}" => $this->nameRules(
                $this->normalizeForSearch, $language->id, $productCategory->id,
            )],
        )->validate();

        return ($this->setTranslation)($productCategory, $language, ['name' => $name]);
    }
}
```

Five things in that block, each following an existing convention rather than inventing one:

- **`Gate::authorize('update', $productCategory)` is the first statement**, outside any transaction, per [the action-owns-the-rule convention](../../docs/conventions/base-standards.md#an-authorization-rule-belongs-to-the-action-not-to-one-of-its-callers). Verified against 0023: `ProductCategoryPolicy`'s four abilities map to the already-seeded `products.view/create/edit/delete`, so `update` **is** `products.edit`. No new permission, no new ability, catalog unchanged at **42** (0070 **D-13**).
- **It authorizes `update` on the parent category, not on the translation row.** Translating is editing the category; there is deliberately no `TranslationPolicy` (0070 **D-13**), and inventing one would restate `ProductCategoryPolicy::update` under a new name.
- **Both dependencies are constructor-injected**, per [code-style.md's documented exception](../../docs/conventions/code-style.md#exception-an-actions-own-dependency-is-constructor-injected-when-the-method-signature-is-a-public-contract) — `__invoke()`'s parameter list is a public contract every direct caller matches verbatim, so an internal collaborator must not widen it. This mirrors `SetSalesRegionActive` constructor-injecting `SetDefaultSalesRegion`, and 0023's own actions constructor-injecting `NormalizeForSearch`. **Resolve it from the container, never `new` it, including in tests.**
- **It reuses 0070's widened `nameRules()` unchanged** and adds no method to `ProductCategoryValidationRules` — the trait stays reusable by the four siblings. The `23000` catch 0023 established still applies as the last-word race guard, with 0070's caveat that the translations table has **three** constraints, so a blanket `23000` → "name taken" is newly unsafe and must discriminate.
- **The error key is *derived*, never accepted as a parameter.** `"names.{$language->id}"` is computed from the language the action was handed, so no caller can tell it what to key on — the [errors-log rule](../../docs/errors-log.md#a-guard-took-the-state-it-was-guarding-as-a-parameter-reopening-its-own-hole-one-level-up--2026-08-20) against a guard accepting its own state. An Artisan or queued caller simply receives a `ValidationException` carrying that key, which is harmless; a Livewire caller gets one that lands on the right tab's field for free. **The `names.` prefix is therefore a deliberate shared contract across all five taxonomy screens, not a leak** — every consuming component declares `public array $names` (**D-3**).

### The component surface, diffed against 0025's

```php
namespace App\Livewire\ProductCategories;

#[Title('Product categories')]
class Index extends Component
{
    use ProductCategoryValidationRules;   // 0070-widened: nameRules(string $storeLanguageId, ?string $categoryId = null)

    /** @var array<int, array{id: string, name: ?string, productCount: int, canEdit: bool, canDelete: bool}> */
    public array $productCategories = [];        // `name` is now ?string — the fallback can resolve to null (D-6)

    #[Locked] public ?string $editingCategoryId = null;
    public bool $showModal = false;

    /** @var array<string, string> keyed by store_language_id; '' means "not typed". NEVER null. */
    public array $names = [];                     // REPLACES 0025's `public string $name = ''`

    /** @var array<int, string> language ids this category already held a translation in, at modal-open. */
    #[Locked] public array $originalTranslatedLanguageIds = [];

    public string $activeLanguageId = '';         // overwritten to a real id before first render

    public bool $showDeleteModal = false;
    #[Locked] public ?string $deletingCategoryId = null;
    #[Locked] public string $deletingCategoryName = '';

    public function setActiveLanguageTab(string $languageId): void;   // NEW — no Gate check (D-4)

    // +1 action. NOTE it injects SetProductCategoryTranslation, NOT 0070's raw SetTranslation —
    // the component must never reach the unguarded primitive directly (D-4).
    public function save(
        CreateProductCategory $c,
        RenameProductCategory $r,
        SetProductCategoryTranslation $t,
    ): void;

    // mount/openCreateModal/openEditModal/closeModal/confirmDelete/deleteProductCategory/closeDeleteModal
    // keep 0025's signatures.
}
```

**This supersedes 0025's committed surface rather than extending it** — `public string $name = ''`
cannot survive 0070 **D-4** dropping `product_categories.name`. Recorded as an amendment needing
explicit Phase 2 sign-off, not a silent override (**R-1**).

⚠️ **`App\Actions\Translations\SetTranslation` must not appear in this component's imports at all.**
It is 0070's deliberately-unguarded persistence primitive, and the whole point of the new action is
that nothing reaches it without passing an authorization and a validation first. A `SetTranslation`
import under `app/Livewire/` is a Phase 5 review finding, and worth an explicit grep at Phase 4.

---

## Tests to perform — 3. QA test cases / validation scenarios

**Calibration, inherited from 0025 and re-stated because it binds harder here:** this story does
**not** re-run 0070's suite one layer up. 0070 proves the fallback chain, per-field resolution,
the normalised uniqueness fold and the backfill exhaustively at the action/unit layer. This story
asserts only that the **screen routes into those rules and renders their outcome**.

### Feature — `tests/Feature/ProductCategories/SetProductCategoryTranslationTest.php`

**Direct-call only — every test here resolves the action from the container
(`app(SetProductCategoryTranslation::class)(...)`) and mounts no component.** This is the layer a
`Livewire::test()` structurally *cannot* prove: a component test exercises the action **through**
its caller, so it passes identically whether the action authorizes or the component does. 0068
states the same requirement for its own five actions, and this file is that discipline applied to
the new one.

- [ ] An actor holding `products.edit` sets a French name → the translation is stored and returned.
- [ ] An actor **lacking** `products.edit` → `AuthorizationException`, and **no row is written**. *Risk if missing:* the defence-in-depth decision is unverified — the whole point is that this holds with no component in the picture.
- [ ] A **Super Admin holding zero permission rows** succeeds, via `Gate::before`.
- [ ] A blank and a whitespace-only name → `ValidationException`, no row written. *Risk if missing:* 0070's "a blank translation is refused" scenario has no enforcement point at all, since `SetTranslation` validates nothing.
- [ ] An over-length name → `ValidationException`. One canary, not 0070's boundary matrix.
- [ ] A duplicate name **within one language** → `ValidationException`; the **same name in another language** → accepted. The one pairing that proves the uniqueness scope is per-language at *this* layer, not just in the component.
- [ ] Re-setting the same category's own name in the same language → accepted, not refused as a duplicate (the `->ignore()` branch).
- [ ] The thrown `ValidationException`'s key is **`names.{$language->id}`**, asserted literally. *Risk if missing:* the key is what makes a refusal land on the right tab; a silent change to it breaks the screen with every action test still green.
- [ ] The name is **trimmed** before persistence.
- [ ] Calling twice for the same `(category, language)` updates rather than duplicating — one row-count assertion, not a re-derivation of `SetTranslation`'s `updateOrCreate`.
- [ ] An **inactive** store language is still writable through the action. *Risk if missing:* someone adds a defensive `is_active` guard here and silently defeats 0070 **D-6**, whose whole point is that removal preserves editable content. Tab *rendering* filters on active (**D-5**); the write path must not.
- [ ] The action is **resolved from the container, never `new`-ed**, in every test — it has two constructor dependencies, and `new SetProductCategoryTranslation` would not compile once either changes.

### Feature — `tests/Feature/ProductCategories/LanguageTabsTest.php`

*Happy path*
- [ ] Saving with the default tab filled and one other language filled calls `CreateProductCategory` with the default name **and** `SetProductCategoryTranslation` with the second language's model — asserted as **two separate calls with two separate arguments**, never one call carrying both.
- [ ] Editing only the French tab calls `SetProductCategoryTranslation` for French and does **not** call `RenameProductCategory`. *Risk if missing:* the retrofit collapses back to "always rewrite the default row", silently corrupting a deliberately French-only edit.
- [ ] **The component never reaches `SetTranslation` directly** — asserted structurally, as an `arch()` rule that `App\Livewire\ProductCategories\*` does not use `App\Actions\Translations\SetTranslation`, written as **one `expect()` per namespace, never `expect([...])`**, which is disjunctive (this repo has already shipped one vacuous arch rule that way). *Risk if missing:* the unguarded primitive is one import away, and a future edit that "skips a layer for simplicity" leaves no failing test behind.
- [ ] The tab set equals `StoreLanguage::active()` — asserted as a **count** against an N-active-language fixture, never "contains Spanish and French". *Risk if missing:* a query that drops the `active()` scope renders a tab for every language ever added, including removed ones, which **D-5** forbids.

*Edge cases — the ones nobody writes by default*
- [ ] **The fallback does not leak into the edit field.** A category named in Spanish only, opened on the French tab, renders `''` — **not** "Calzado". *Risk if missing:* **the sharpest bug this story can ship.** `translated('name', $frenchId)` legitimately returns the Spanish fallback for *display*, so binding it into the *edit input* means saving an untouched French tab silently manufactures a French translation byte-identical to Spanish that the administrator never typed. Raised independently by both amigos.
- [ ] **Blank-because-untranslated is distinguishable from blank-because-cleared** in component state — `$names[$frenchId] === ''` with `$frenchId` absent from `$originalTranslatedLanguageIds` on the first, present on the second. *Risk if missing:* the two collapse and **D-7**'s conditional-requiredness rule cannot fire.
- [ ] **The store default changes under an existing catalog** (0070 **R-2**): a Spanish-only category, French promoted to default via 0068's action directly, modal reopened → the French tab renders blank without throwing, and the Spanish tab still shows "Calzado". *Risk if missing:* `translated()`'s "resolves to nothing" branch is reached in **normal operation**, and a `null` bound into a text input is the failure this repo already paid for once.
- [ ] **A translation in a since-removed language**: French deactivated → (a) the French tab is gone, and (b) the list row still renders a name through the fallback. Two assertions, not one — losing the tab is correct; losing the row's name would not be.
- [ ] Switching tabs preserves unsaved input in `$names` for the other languages.
- [ ] Re-saving an unchanged tab creates no second translation row (row count), not a re-derivation of `SetTranslation`'s own `updateOrCreate` semantics.

*Negative cases*
- [ ] **A validation error keyed to a non-visible tab.** Spanish tab active, duplicate name on the French tab, save → assert **both** `assertHasErrors(['names.'.$frenchId])` **and** that `$activeLanguageId` has moved to French. *Risk if missing:* the textbook "the save silently did nothing" bug — the visible tab shows no error and nothing tells the administrator why the modal stayed open. **The single highest-value test in this story.**
- [ ] The default language's tab blank → refused, unconditionally (0070 **Q1(a)**).
- [ ] A previously-translated non-default tab blanked → refused (**D-7**); a previously-untranslated one left blank → accepted and **not** written.
- [ ] Same name, two different languages → accepted. Same name, same language, two categories → refused. **One canary each**, not the case/accent matrix (0070's).
- [ ] A forged `setActiveLanguageTab()` / per-tab write against an unknown or inactive language id fails cleanly via `findOrFail()`, never reaching `SetProductCategoryTranslation` with `null`. *Risk if missing:* 0069's ⚠️ about `find()` vs `findOrFail()`, at this screen's per-tab writer.
- [ ] **An actor holding only `products.view` cannot write *any* tab's translation**, including a non-default one — asserted **at the component**, with the same case asserted **at the action** in the direct-call file above. The pair is deliberate: it is what proves the two layers are independent rather than one check observed twice. *Risk if missing:* 0070's `SetTranslation` self-authorizes nothing, so a per-tab path gated less carefully than the default-language path would let a view-only actor translate a category into every active language while being refused the ability to rename it.
- [ ] **A default-language refusal renders on the default tab's field.** Force `RenameProductCategory` to throw its `name`-keyed `ValidationException` and assert the component surfaces it as `names.{defaultId}`. *Risk if missing:* the key-adapter in **D-4**'s ⚠️ is silently dropped and a race-path refusal renders nowhere, leaving the modal open with no message — the exact "the save silently did nothing" bug, on the one path layer 1 cannot pre-empt.
- [ ] An actor with `products.edit` and **zero** `store-languages.*` permissions can translate (0070 **D-13**).

### Feature — `tests/Feature/ProductCategories/LanguageTabsRenderingTest.php`

- [ ] N tab controls render for N active languages, counted via `data-test="language-tab-{id}"` hooks, never by language name (**D-11**).
- [ ] Each panel holds a **plain text input**, one per language.
- [ ] An untranslated tab renders an empty input **plus** its "not yet translated" hint — the DOM counterpart of the no-leak test. *Risk if missing:* the component property can be correctly `''` while the Blade still interpolates a stray `{{ $category->translated('name') }}` left over from 0025's single-field markup — exactly the residue a retrofit produces.
- [ ] A tab carrying an error renders its marker on the **tab header**, not only on the field inside it.
- [ ] The list's name cell renders the **resolved** (fallback-applied) name, and an em dash when it resolves to `null`.

### Browser — `tests/Browser/ProductCategories/LanguageTabsTest.php`

- [ ] **Typing into the French tab, switching away and back, preserves the text.** *Why it cannot be cheaper:* `Livewire::test()->set('names.'.$id, …)` writes the property directly and never touches the DOM — it would pass even if the real switch destroyed the input. Under **D-2**'s `x-show` the input is never unmounted, so this is a **regression guard on the markup** (an `x-show` expression matching the wrong tab id renders plausibly and is invisible to `Livewire::test()`), not the load-bearing verification it would have been under `@if`.
- [ ] **An inactive panel is still present in the DOM, merely hidden** — assert `data-test="language-panel-{id}"` exists for a *non-active* language. *Risk if missing:* nothing else in the suite would catch a future "optimisation" back to `@if`, which is precisely the change 0077's **C-2** shows breaks a stateful consumer. This is the one test that pins **D-2**'s universal rendering mode.
- [ ] A real `fill()` on a **non-default** tab followed by a real Save persists that language's text — the new code path this story adds.
- [ ] A real click on a tab actually shows that tab's panel — the only level at which a compiled-`wire:click` no-op is detectable (**D-8**).
- [ ] A refused save's error does not survive Cancel + reopening against a different category — the `resetValidation()` regression 0018 shipped as a blocking bug, now with N error keys instead of one.
- [ ] `->assertNoJavaScriptErrors()` on every test.
- [ ] **Not used anywhere:** `->waitForEvent('networkidle')` — banned in this repo. Read `[wire:snapshot]` before reaching for a bounded `->wait(n)`.

### Deliberately NOT tested here

- **The fallback chain, per-field resolution and `translated()`'s null-safety** — 0070's.
- **The uniqueness fold, the accent/case matrix, the composite `UNIQUE` backstop and the `23000` misattribution guard** — 0070's. Two canaries only here, one per scoping direction.
- **`SetTranslation`'s `updateOrCreate` semantics** — 0070's; one row-count assertion here, no re-derivation.
- **`StoreLanguage::active()`'s own correctness and the `defaultStoreLanguage()` memo** — 0068's / 0070's **D-10**.
- **The delete guard, the in-use block and the `productCategoryId` error key** — 0024's; untouched by tabs.
- **`ProductCategoryPolicy`'s abilities in the abstract** — 0023's / 0025's. No new ability (0070 **D-13**).
- **`trans_choice`'s pluralisation engine, `HasUuids`, Eloquent timestamps** — vendor.

## Expected outcome

A catalog administrator opening a product category sees one tab per active store language, the
store default selected. Each tab holds that language's own name — blank, and visibly marked as
untranslated, where none exists, never silently pre-filled with the fallback. They type a French
name, save once, and the category now reads "Chaussures" in French and "Calzado" in Spanish. A
duplicate name is refused per language, so the same string is accepted in two languages and
refused twice in one; when the refusal belongs to a tab they were not looking at, that tab is
brought into view carrying the message and stays marked while they navigate. The list renders each
category's name resolved through the store default, with an em dash where a name has not been
authored there. Removing a store language removes its tab and preserves its content, which
reappears intact if the language is re-added.

Behind the screen, `App\Actions\ProductCategories\SetProductCategoryTranslation` authorizes
`products.edit` and validates the name — blank, over-length, duplicate-within-a-language — before
any translation is persisted, **independently of who called it**. An administrator refused at the
screen is refused identically by a direct call from an Artisan command, a queued job or a future
importer, and 0070's unguarded `SetTranslation` primitive is reachable from nowhere else in the
application.

## Acceptance criteria

- [ ] The create/edit modal renders exactly one tab per **active** store language, resolved through `StoreLanguage::active()`, with the store default selected on open.
- [ ] **Every language panel is mounted and hidden with `x-show`; no panel is conditionally rendered with `@if`** — the shared component's single rendering mode, pinned by a test asserting a non-active panel is still present in the DOM (**D-2**).
- [ ] Each tab's field shows that language's **own** translation, read from the raw translation row — **never** through `translated()`'s fallback (**D-6**).
- [ ] A language with no translation renders an empty field carrying a "not yet translated" hint, distinguishable from a cleared one.
- [ ] Saving writes the default language through `CreateProductCategory`/`RenameProductCategory` and every other language through **`SetProductCategoryTranslation`** — never through `SetTranslation` directly, which appears in no import under `app/Livewire/` (**D-4**).
- [ ] **`SetProductCategoryTranslation` authorizes `update` on the category and validates the name itself**, so a direct caller with no component — an Artisan command, queued job or importer — is refused identically; proven by direct-call tests that mount no component.
- [ ] **The component authorizes and validates too, before calling it**, and both layers are covered by their own tests. Neither layer may be removed as "duplication" (**D-4**, **D-13**).
- [ ] A refusal from either layer lands on `names.{languageId}` and renders on that language's tab, including a default-language refusal re-keyed from the `name` key 0023's actions throw (**D-4** ⚠️).
- [ ] The permission catalog is unchanged at **42** and no new ability, policy or `TranslationPolicy` is added (0070 **D-13**).
- [ ] The default language's name is required; a previously-translated language's name may not be blanked; a previously-untranslated one may be left blank and is not written (**D-7**).
- [ ] A validation refusal keyed to a hidden tab **switches the active tab to that language** and marks it in the strip; the marker persists while the administrator navigates away.
- [ ] Name uniqueness renders per language — the same name accepted across two languages, refused twice within one.
- [ ] The list renders the fallback-resolved name and an em dash when it resolves to `null`; it orders without reference to a `product_categories.name` column (**D-12**).
- [ ] A removed store language contributes no tab, and its stored content is neither shown nor destroyed.
- [ ] Every tab, panel, field and error marker carries a `data-test` hook; **no assertion anywhere in this story matches on a language name or a two-letter code** (**D-11**).
- [ ] `lang/en/products.php` and `lang/es/products.php` stay key-for-key identical.
- [ ] No route, model, migration, policy, factory, seeder or permission change. **Exactly one action is added** (`SetProductCategoryTranslation`); 0023's three existing Product Category actions, 0070's `SetTranslation` and `ProductCategoryValidationRules` are all unmodified.

## Definition of Done
- [ ] Tests written and green (**full suite unscoped**, not `--filter`)
- [ ] `vendor/bin/pint --format agent` run **unscoped**, not `--dirty`
- [ ] **Larastan level 7 run and recorded** — named explicitly because [errors-log.md](../../docs/errors-log.md#a-verification-record-that-lists-two-of-three-quality-gates-is-a-record-of-two-gates--2026-08-26) records three consecutive stories whose verification notes listed two of three gates and were read as records of all three
- [ ] Code reviewed (code-reviewer)
- [ ] No security findings (appsec-auditor) — point the audit at: **both layers of the per-tab write path** (a `products.view` actor must be refused by the component *and* by `SetProductCategoryTranslation` called directly), that `SetTranslation` is reachable from nowhere but the new action (grep `app/Livewire/` for the import), that the action's error key is derived from `$language->id` and never accepted as a parameter, `$originalTranslatedLanguageIds` being `#[Locked]`, and `$names` being unlocked (**D-3**)
- [ ] **Compiled output of the tab strip verified by rendering, not by absence of an error** (**D-8**)
- [ ] Documentation updated (docs-keeper) — at minimum `docs/api/routes.md` (the screen's tabbed modal and its `data-test` hooks), `docs/conventions/naming.md` (the first shared anonymous component whose consuming class must expose a fixed method name), and `docs/testing/frontend/playwright-setup.md` if the language-name assertion hazard generalises
- [ ] **Recorded as a handoff, not done here:** the sibling amendments in **R-1** and **R-2**. This story edits no other story's file.
- [ ] Acceptance criteria met

---

## 4. Documented functional decisions

**D-1 — The tab *strip* is an extracted anonymous Blade component; the *panels* are not.** Four
siblings will render different panel shapes (this screen: one field; 0077 Products: title,
description, slug, meta) behind identical tab-switching UI. Extracting only the strip captures the
part that genuinely does not vary — headers, active state, error markers — without prematurely
abstracting a multi-field form builder nobody has specified. This repo's Blade components are
**all anonymous** (verified: no `app/View/` directory exists), so an anonymous component is the
convention; a nested Livewire child component is rejected as unprecedented here and unverifiable
with `vendor/` absent. *Rejected:* inline markup duplicated per screen — it would make the tab
contract five independent implementations, which is exactly what this story exists to prevent.

Prop contract:

```php
['languages' => Collection, 'active' => string, 'errorLanguageIds' => array<int, string>]
```

**The strip hardcodes a call to `setActiveLanguageTab(string $languageId)`.** Every consuming
component must expose a method by that exact name — a real constraint on 0073/0075/0077/0079 and
part of the copyable recipe, stated the way 0070 states the shapes its siblings must reproduce.

**Two obligations the strip places on the panels it does not render**, both binding on every
consumer:

- **Each panel is always mounted and hidden with `x-show`, never `@if`** (**D-2**). The strip owns
  the headers; the consumer owns the panels; the *rendering mode* is part of the shared contract
  rather than a per-screen choice, because a consumer embedding something stateful in a panel
  (0077's WYSIWYG) is broken by `@if` and cannot discover that from the strip's props.
- Each panel carries `data-test="language-panel-{languageId}"` so a hidden panel is still
  selectable — which under `x-show` it always is, since it remains in the DOM.

**D-2 — Tabs switch on a server round trip, not client-side Alpine. This is a deliberate
divergence from 0069 D-6, and the reason is the error case.** 0069 chose Alpine for its language
picker; three properties held there that do not hold here. *(i) Cardinality* — 184 fixture rows
versus a realistic 2–6 active languages, so the round-trip cost that justified Alpine is absent.
*(ii) Shape of the control* — the picker's rows are act-now buttons with no bound state, while a
tab reveals a panel of live `wire:model` inputs. *(iii)* **The decisive one: a validation error can
land on any tab, and only the server knows which.** An Alpine-only switch has no way to learn,
after a failed `save()`, which language was refused; solving it client-side would need a
cross-render signalling mechanism nobody in this repo has built and that cannot be verified with
`vendor/` absent — precisely the unverified-guess trap 0069 **D-12** refuses for a smaller
decision. A plain `public string $activeLanguageId` lets `save()` set the active tab to the first
erroring language *before* the failed-validation re-render, so the right panel is visible on the
very next paint using the boring mechanism every other screen here already uses.

**Every panel stays mounted and is hidden with `x-show`, never `@if`. This is the shared
component's one and only rendering mode.** The two axes are independent and must not be re-bundled:
*how the active tab is tracked* (server-side, above) and *whether an inactive panel stays in the
DOM* (it does). This story's first draft chose `@if` and named `x-show` as a contingent fallback;
**that is reversed — `x-show` is the design, and `@if` is not offered as an option to any
consumer.** Three reasons, in order of weight:

1. **`@if` cannot survive a stateful panel, and one sibling already proves it.** Story
   [0077](0077-product-editor-language-tabs-ui.md)'s **C-2** found that `@if` tears down N
   `wire:ignore`d WYSIWYG regions on every tab switch — story 0021's editor has no client-side
   refresh hook (its own **D9** says so in as many words), so a torn-down region does not come
   back correctly. That is not a Products-only quirk; it is what happens to **anything stateful**
   inside a panel — an editor, a media picker, a map, a partially-filled child form.
2. **One mode is simpler for four consumers to reason about than two.** A shared component whose
   rendering mode depends on what its consumer embeds is a contract with a hidden conditional, and
   this story's **R-8** is precisely that any weakness here is copied four times before anyone
   re-examines it. 0073 and 0075 already consume the strip as specified; making `x-show` universal
   means **they inherit the fix with no change on their end**.
3. **It costs this screen nothing.** A plain-text panel has no teardown cost worth avoiding, and N
   is a realistic 2–6. `x-show` is strictly more robust here and strictly not worse.

> ⚠️ **One supporting claim was NOT verified, and `x-show` is what makes it stop mattering.**
> `frontend-expert` stated that Livewire always sends every dirty deferred `wire:model` property on
> any action call, so text typed into a hidden tab survives a switch. That is standard Livewire
> behaviour and very likely true — but `vendor/` is absent, it could not be confirmed by reading
> source, and this project's [hedge rule](../../docs/errors-log.md#a-reviewers-correction-replaced-an-accurate-technical-explanation-with-a-wrong-one-unverified--2026-08-24)
> says an unverified mechanism written up confidently is worse than an open question written up
> plainly. **Under `x-show` the inputs are never removed from the DOM at all**, so the
> "unsaved input lost on tab switch" failure mode is closed structurally rather than by relying on
> that claim — which is the fourth reason `x-show` is the better default. The browser test
> "typing, switching away and back preserves the text" is **retained** regardless: it is now a
> regression guard on the `x-show` markup itself (an `x-show` expression matching the wrong tab id
> is invisible to `Livewire::test()`), not the load-bearing verification it would have been under
> `@if`.

**D-3 — `$names` is an unlocked array keyed by store-language id; `$originalTranslatedLanguageIds`
is `#[Locked]`.** `$names` follows 0025 **D-4**'s own reasoning for `$productCategories`: nothing
reads it for a decision — every write re-derives its target from the database — and every value it
holds is already client-visible the moment the modal opens, since Livewire ships the whole snapshot
regardless of which tab is "active". `$originalTranslatedLanguageIds` **is** locked, because it
feeds **D-7**'s conditional-requiredness branch: a forged value would let an actor blank away a
genuinely existing translation without tripping the blank-is-refused rule, silently destroying
content. That is a data-integrity concern rather than a privilege one, and it is locked for the
same reason `$editingCategoryId` is locked for `Rule::unique()->ignore()`. `$activeLanguageId`
stays unlocked and never binds a `<select>` — it drives an `x-show` comparison, so the
[null-bound-`<select>` trap](../../docs/errors-log.md#a-null-livewire-property-bound-to-a-native-select-silently-dropped-the-users-own-pick--2026-08-16)
is **structurally inapplicable** here, recorded so nobody "defensively" applies it.

**D-4 — Writing a translation is authorized and validated at TWO independent layers: the component
*and* a new self-sufficient backend action. Neither is redundant, and a reviewer must not collapse
them.** *(Human architectural decision, 2026-08-30 — superseding this story's original
component-only shape.)*

This is the concrete answer to the half 0070 **D-9** left open — *"the calling action authorizes
before invoking it … this story ships no such caller"*. 0070's `SetTranslation` deliberately
authorizes and validates **nothing**, for a specific structural reason (a self-authorizing `update`
would make *creating* a category require `products.edit`). That decision is sound and unchanged —
but it means the primitive is only as safe as its caller, and a component is the one caller that
**cannot** protect a future Artisan command, queued job or importer. So this story adds the caller
0070 said it was not shipping, as a real domain action rather than as component code:

| Layer | Where | What it does | What it protects |
| --- | --- | --- | --- |
| **1 — component** | `App\Livewire\ProductCategories\Index::save()` | `Gate::authorize()` on the whole batch, then `$this->validate()` across every active language's key | fails fast before a transaction opens, keeps the per-row `canEdit` hint honest, and renders every refusal on the right tab |
| **2 — action** | `App\Actions\ProductCategories\SetProductCategoryTranslation` | `Gate::authorize('update', $category)` then its own `Validator::make(...)->validate()` | binds **every** caller — a future importer, command or job inherits the whole rule by calling the action, with no component in sight |

**Why both, stated so it survives a "simplify this" review.** This repo has already ruled on the
identical question twice, in the same direction. [base-standards.md](../../docs/conventions/base-standards.md#an-authorization-rule-belongs-to-the-action-not-to-one-of-its-callers)
establishes that *"if an operation must not happen without a permission, the check lives in the
class that performs the operation"* — layer 2 — and task 0017's Sales Regions precedent adds the
converse in as many words: ***"a component that authorizes as well is a layer, not a redundancy…
a reviewer who deletes one of the two has removed a layer, not a redundancy."*** Layer 1 is what
0008a's own finding proves cannot be sufficient (a rule living only in a Livewire component leaves
every non-dashboard caller ungated); layer 2 is what task 0017 proves cannot be sufficient *for
the screen* (it opens a transaction before failing, and it cannot key an error onto the tab the
user is looking at).

Two mechanics that follow, both already-established conventions rather than new rules:

- **The component still authorizes the whole batch before any action runs**, because one `save()`
  click writes the default-language row **and** N other translation rows as one logical operation
  — task 0017's *"authorize every row the operation writes, not only the one it is named after"*,
  applied one layer up. Layer 2 then re-authorizes per row, which is the correct granularity for a
  caller that has no batch.
- **`SetProductCategoryTranslation` is method-injected into `save()`** (per-method action
  injection), while its *own* two collaborators are constructor-injected (the documented exception,
  because its `__invoke()` is a public contract). Both halves of that split are the existing rule
  applied, not a third case.

> ⚠️ **The default-language path keys its refusals differently, and the component must adapt.**
> Found while verifying 0023 rather than assumed: `CreateProductCategory` / `RenameProductCategory`
> throw `ValidationException` keyed **`name`** (0023's shape, frozen by 0070 **D-12**), while every
> field on this screen is bound to **`names.{languageId}`**. So a default-language refusal thrown by
> those two actions — realistically the `23000` race backstop, since layer 1 validates first —
> would land on a key no field renders, and the user would see the modal stay open with no message.
> **The component catches that `ValidationException` and re-keys `name` → `names.{defaultId}`.**
> *Rejected:* widening 0070's two actions to key on `names.{id}`, because that changes a public
> contract 0025 and every direct-call test bind to, for a story that is not allowed to edit either
> file. The adapter is three lines in one place; the alternative is a cross-story contract break.

**D-5 — Only active store languages get a tab. Content in a removed language is hidden, not shown
read-only.** 0070 **D-6** is emphatic that `translated()` must never filter on `is_active` and that
*"the `is_active` filter belongs one layer up, at the UI's 'which tabs do I render' decision"* —
this story is that layer, and this is that decision. The costs are asymmetric. *Hiding* costs an
administrator no signal on this screen that stale content exists in a removed language — but that
signal already exists at the right layer, in `StoreLanguage::translationUsageCount()` and 0069's
removal warning, so duplicating it here is redundant. *Showing it* costs an extra query per modal
open, a third tab state with its own copy, and an affordance the administrator structurally cannot
act on (reactivating a language is a `store-languages` operation), which is the same
"UI debt with unclear value" 0069 **D-8** rejected for the analogous case. **No content is lost
either way**: 0070 **D-6** guarantees it survives and becomes editable again the instant the
language is reactivated, with zero code in this story needed to make that true.

**D-6 — The edit field reads the raw translation row; the list cell reads `translated()`. These are
different reads and conflating them is the sharpest bug this story can ship.** Both amigos reached
this independently. `translated('name', $frenchId)` applies the fallback by design, which is
**correct for the list** (a row must render *something*) and **wrong for the edit input**: binding
it into the French field means an administrator who saves without touching that tab silently
creates a French translation byte-identical to the Spanish one, which they never typed and cannot
tell apart afterwards. So the modal loads
`$target->load(['translations' => fn ($q) => $q->whereIn('store_language_id', $activeIds)])` and
reads each language's own row, rendering `''` where none exists.

> ⚠️ **`scopeWithTranslationsFor()` is the wrong tool for the modal, and this is a genuine
> limitation of 0070's contract rather than a misuse of it.** That scope always widens to
> (requested, default) — at most two languages — because it was built for single-language-with-
> fallback resolution on a *list* path. The modal needs the raw value for **every** active
> language. 0070 ships no UI and never anticipated this read. Recorded so a Phase 3 author does
> not reach for the shared scope on the assumption that it is always the right one; it **is** the
> right one for the list (**D-12**).

**D-7 — Requiredness is conditional per tab, and the condition is a fact about this edit session.**
Three branches: the **default** language is always `required` (0070 **Q1(a)** — every category
must hold a default-language name); a **non-default, previously untranslated** language is
`nullable`, so leaving it blank is a no-op rather than a refusal; a **non-default, previously
translated** language is `required`, so blanking it out is refused. That third branch is what makes
0070's *"A blank translation is refused"* scenario hold at the UI layer, since `SetTranslation`
performs no validation of its own. The condition is expressed in the component, **not** pushed into
`ProductCategoryValidationRules` — "was this language translated when the modal opened" is a
property of the session, not of the field, and the trait must stay reusable by 0073/0075/0077/0079.
⚠️ **The consequence is that this story ships no way to *remove* a translation** — see **Q-1**.

**D-8 — Error keys are `names.{languageId}`, and the compiled output of the strip must be verified
by rendering.** The dotted-array-key form is the standard Laravel/Livewire idiom and `$names` is a
declared public property, so Livewire's `SupportValidation::dehydrate()` →
`Utils::hasProperty()` filter should keep it — the 0017/0069-**D-15** lesson applied to an array
element rather than a flat name. **This is flagged for explicit Phase 3 confirmation rather than
assumed**: `vendor/` is absent, and the closest precedent in this repo (`Roles\Index`'s
`selectedPermissionIds`) validates with `selectedPermissionIds.*` rules but throws every
`ValidationException` on the **base** property name, so it gets close without settling it.

> ⚠️ **A markup landmine, with its scope corrected.** `frontend-expert` flagged that `@js()` is
> broken inside an anonymous component and recommended `@include` over `<x-…>` on that basis.
> **Checked against the errors log rather than propagated:** what is verified by execution is that
> `@js()` fails to compile **in the attribute of an `<x-…>` tag at the call site**; the log
> establishes nothing about `@js()` inside the partial's own template, and its own dated correction
> says the real mechanism is **not established** and must not be guessed at. The rules that
> actually survive are the two the log states: prefer `{{ \Illuminate\Support\Js::from(…) }}` for a
> dynamic value in a component-tag attribute, and **verify the compiled output rather than the
> absence of an error**. So: use `{{ Js::from($language['id']) }}` inside the strip, pass props to
> `<x-language-tab-strip>` with `:`-bound expressions (never `@js()`), and **render the modal and
> read the real HTML at Phase 3** before trusting either. A tab whose `wire:click` silently
> stringifies is a no-op with no PHP error, no console error and no failed request — invisible to
> `Livewire::test()->call('setActiveLanguageTab', …)`, which never goes through compiled markup.

**D-9 — The browser test goes in the mirrored subfolder, `tests/Browser/ProductCategories/`.**
0025 names the **flat** `tests/Browser/ProductCategoriesIndexTest.php`, but that file was written
2026-08-18, before 0069 **D-17** established the mirrored form and before
[playwright-setup.md](../../docs/testing/frontend/playwright-setup.md)'s lesson that *"a story file
that names a test path is making a convention decision, and the path belongs in the Phase 2
review"*. **Verified against the tree: there are now three flat files** (`UsersIndexTest.php`,
`SalesRegionsIndexTest.php`, `RolesIndexTest.php`) and one mirrored (`Auth/LoginSmokeTest.php`) —
so 0069 D-17's own "the two existing flat files" is already an under-count. This story does not add
a fourth to the pile.

**D-10 — Copy extends `lang/*/products.php`; no new domain file, and language names are never
translation keys.** 0025 **D-6** already rules out a `product-categories.php` file. This story
appends a small `categories.index.tabs.*` group (the untranslated-tab hint, the tab-error marker's
`aria-label`). **A language's own display name is data**, read from `store_languages.name` (the
fixture's endonym), and must never be routed through `__()` — there is no key for "Français" and
inventing one would duplicate 0068's fixture in a lang file.

**D-11 — No assertion in this story may match on a language name or a two-letter code.** This
screen has a **sharper** version of 0069 **R-3**'s hazard than 0069 itself, because the colliding
strings appear twice in one DOM: the tab labels *are* endonyms ("Español", "Français"), and 0067's
account-menu switcher renders the same strings in the page chrome of this very page. Worse,
two-letter codes match inside ordinary prose (`fr` inside "from", "confirm") — the
`assertSee('0%')`-inside-`10%` trap from 0018. Every assertion goes through a `data-test` hook.
`frontend-qa` added a third hazard worth recording: **a category could legitimately be named
"Français"** (a store selling language-learning materials), so a fixture must never pick a category
name colliding with an active language's endonym, or a passing assertion passes for the wrong
reason.

**D-12 — The list resolves and sorts in PHP through `translated()`, not through a SQL join.**

```php
ProductCategory::query()->withCount('products')->withTranslationsFor()->get()
    ->sortBy(fn (ProductCategory $c) => $c->translated('name'))->values();
```

A raw join on `product_category_translations` filtered to the default language **bypasses the
fallback chain**, so it silently mis-orders (or, with `INNER`, omits) any row lacking a
default-language translation — a state 0070 **D-6**/**R-2** says is reachable in normal operation
after a default change. `translated()` degrades to `null` → em dash, the convention `users.blade.php`
and `roles.blade.php` already use. 0025 **D-10** commits this screen to **no pagination**, so the
whole table is in PHP regardless and the sort costs nothing extra. `withTranslationsFor()` with no
argument is still a **single** eager load for the whole list, so N+1 (0070 **R-4**) is avoided by
construction — and this is the read for which that scope **is** the right tool, unlike the modal's
(**D-6**).

**D-13 — The two-layer shape is the master pattern for 0073 / 0075 / 0077 / 0079, and it survives a
component that cannot validate.** Each sibling adds one action beside its own entity's existing
ones — `SetBlogCategoryTranslation`, `SetBlogTagTranslation`, `SetProductTranslation`,
`SetBlogPostTranslation` — following the contract above verbatim:

```php
Set<Entity>Translation::__invoke(<Entity> $entity, StoreLanguage $language, ...$translatableFields): <Entity>Translation
```

with `Gate::authorize('update', $entity)` as its first statement, its own `Validator` call reusing
that entity's existing `<Noun>ValidationRules`, an error key derived as `"names.{$language->id}"`
(or `"{$field}s.{$language->id}"` for a multi-field entity), constructor-injected collaborators,
and `SetTranslation` called internally and reached from nowhere else. **What a sibling must not
re-derive:** the two-layer split itself, the derived-not-parameterised error key, the rule that no
component imports `SetTranslation`, or the `x-show` panel-rendering mode (**D-2**) — which 0073 and
0075, already written against this component, **inherit with no change on their end**.

**The case that looks like an exception and is not.** 0060's Blog Tags screen consumes actions that
[0059](0059-blog-tags-backend.md) already made responsible for their own validation, so its
component does **not** validate — there is no layer 1 to add, and adding one would duplicate a rule
the action owns and invite the two to drift, which is exactly what [base-standards.md](../../docs/conventions/base-standards.md#an-authorization-rule-belongs-to-the-action-not-to-one-of-its-callers)'s
*"move the rule, never copy it"* forbids. **Defence in depth still holds there, because layer 2 is
self-sufficient by construction**: the action authorizes and validates regardless of what any
caller did or did not do. The principle is *"the operation is protected without relying on its
caller"*, not *"the check appears in exactly two files"* — a sibling with one layer has satisfied
it whenever that layer is the action, and has **failed** it whenever that layer is the component.

> ⚠️ **The direction of the asymmetry is the whole rule, and it is easy to get backwards.**
> Component-only is never acceptable (0008a's finding: every non-dashboard caller inherits nothing).
> Action-only is acceptable, and is the right shape wherever a component cannot validate without
> duplicating. A sibling author choosing between them should ask *"if I delete the component, is
> the operation still protected?"* — if no, the story is not done.

---

## 5. Dependencies, risks, open technical questions

### Dependencies

- **[0070](0070-translatable-content-mechanism-product-categories-backend.md)** — hard, blocking. `HasTranslations`, `SetTranslation`, the widened validation trait, the dropped `name` column. **Specified, not implemented.**
- **[0025](0025-product-categories-ui.md)** — hard, blocking. The component, view, route and sidebar entry this story widens. **Specified, not implemented.**
- **[0068](0068-store-languages-catalog-backend.md)** — hard. `StoreLanguage`, `scopeActive()`, `defaultStoreLanguage()`. **Specified, not implemented.**
- **[0023](0023-product-categories-backend.md) / [0024](0024-products-core-crud-backend.md)** — hard, transitively via 0025.
- Sequencing, strictly: **0023 → 0024 → 0025 → 0068 → 0070 → 0071**, each fully closed before the next starts.
- **No new package.** No tabs library, no searchable-select; story 0022 stays unbuilt.

### Risks

- **R-1 — This story supersedes part of 0025's committed contract, and 0025 cannot be edited from here.** `public string $name = ''`, the "modal contains exactly one input" rendering test, the `orderBy('name')` list query and the `{id, name, …}` row shape are all falsified by 0070 **D-4**. All are amendments to 0025 that **this story must not write** (it edits no other story's file) but that Phase 2 must accept explicitly, not discover at implementation.
- **R-2 — 0070's R-1 has no owner, and the gap is a broken screen.** 0070 records that 0025/0027/0060/0062 all `orderBy('name')` against a column it deletes, and assigns the amendment to *"the coordinator, not this story"*. If 0025 ships before 0070, the Product Categories list **throws a SQL error** until 0071 lands — a window in which a shipped screen is broken. **D-12** supplies the replacement query; **Q-3** asks who owns applying it.
- **R-3 — Designed against four unimplemented specs at once.** 0023, 0024, 0025, 0068 and 0070 are all Phase 1 files. Any Phase 2/3 change to `HasTranslations`'s signature, the widened `nameRules()` shape, or 0025's component surface invalidates part of this story. Re-derive rather than trust.
- **R-4 — A stale relation after a per-tab write renders the pre-save value** (0070 **R-5**). `SetProductCategoryTranslation` returns the *translation row* it wrote, not the parent — it inherits that return shape from `SetTranslation` — so `save()` must `$category->load('translations')` before reloading the list. Invisible to `Livewire::test()`, which never renders.
- **R-5 — Two sibling-story claims are already stale and were corrected here rather than inherited.** 0069 **D-3** states `flux:separator` is *"used nowhere in `resources/views/`"* — it is used at `resources/views/components/settings/layout.blade.php:10` (`flux:card` genuinely appears nowhere, so that half stands). 0069 **D-17** states there are *"two existing flat"* browser files — there are **three**. Both verified by grep at authoring time. Neither changes a decision here; recorded because this project's [stale-claim failure mode](../../docs/errors-log.md#a-docs-this-app-has-no-x-yet-claim-outlived-the-x-by-two-tasks--2026-08-13) is exactly how a false premise reaches a third story.
- **R-6 — `vendor/` is absent, so no Flux component's availability is verified.** **D-1** works around it by building the strip from `flux:button` variants already proven in `sales-regions.blade.php`. A Phase 3 author with dependencies installed should confirm whether Flux Free ships a `flux:tabs` before permanently rejecting it — and if it does, adopting it is a legitimate simplification, but it must be **run**, not reasoned.
- **R-7 — Neither layer logs its refusals, and the new action makes that a live question rather than an inherited one.** Verified: `App\Livewire\SalesRegions\Index` method-injects `LogRefusedPrivilegedAttempt` into every mutating method per [the recipe](../../docs/architecture/authorization.md#recording-a-refusal--what-every-gate-owes-the-audit-trail), and 0025's specified surface does not. The component half is **0025's gap, inherited not created here**. The *action* half is new: `SetProductCategoryTranslation` is a fresh `Gate::authorize()` site, and the recipe's own argument applies to it directly — its refusals are otherwise indistinguishable from successes in any log. **Deliberately not adopted here**, because doing so unilaterally would make this the only Product Categories write path that logs while its three siblings (`Create`/`Rename`/`Delete`) stay silent, which is worse than consistent silence. Raised as backlog item 5 and flagged for Phase 2, so it is met as a decision rather than a silence — the same gap story 0019 left on the Media gallery and that `docs/architecture/authorization.md` records as a ⚠️.
- **R-8 — The pattern this story sets is copied four times.** Any weakness in the strip's contract, the error-key shape or the requiredness rule is reproduced by 0073/0075/0077/0079 before anyone re-examines it. That is the argument for extracting the strip (**D-1**) and for pinning the hook set at Phase 2 rather than discovering it mid-implementation.

### Open questions for the product owner

Per [contracts.md](../../docs/contracts.md)'s Uncertainty Handling Rule, each carries a
recommendation rather than a silent assumption.

**Q-1 — Can an administrator *remove* a translation once it exists? ✅ RESOLVED 2026-08-30 — option (a).**
**D-7** makes a previously-translated language `required`, so blanking it is refused — which means
this story as written ships **no way to delete a translation**. 0070 never answered this: its
Gherkin refuses a blank translation but says nothing about removing an existing one.
- **(a) No — a translation, once authored, can be corrected but not removed — _(recommended)_.** It is the faithful reading of 0070's *"A blank translation is refused"*, it keeps the write path a single `updateOrCreate`, and the practical remedy (remove the store language) already exists and preserves content. The cost is a typo'd French name that can be fixed but never withdrawn.
- **(b) Yes — blanking a non-default tab deletes that translation row.** Genuinely useful for undoing a mistaken translation, but it needs a delete path `SetTranslation` does not have, a confirmation affordance this story has not designed, and it makes "blank" mean two different things depending on the tab's history.

**Q-2 — Does the create modal offer every language tab, or only the store default? ✅ RESOLVED 2026-08-30 — option (a).**
0070 **D-12** keeps `CreateProductCategory::__invoke(string $name)` writing only the default
language, and its Gherkin says a created category *"holds one translation"*. This story's **D-4**
save path offers all tabs on create and calls `SetProductCategoryTranslation` for the extras.
- **(a) Offer every tab on create — _(recommended)_.** PRD Epic 5 says an administrator *"can provide its name per active store language via language tabs"* without distinguishing create from edit, and forcing a save-then-reopen round trip to add a French name is friction with no stated reason. It changes no 0070 signature — the extra languages go through `SetProductCategoryTranslation`, exactly as they do on edit, and that action is fully authorized and validated on both paths.
- **(b) Default language only on create; other languages via a subsequent edit.** Strictly closer to 0070's Gherkin, and a slightly smaller create path — at the cost of a two-step workflow for the ordinary case of adding a category the store already knows the name of in two languages.

**Q-3 — Who applies 0070's R-1 fix to this screen's list query? ✅ RESOLVED 2026-08-30 — option (a).** **D-12** specifies the
replacement, but 0070 explicitly scopes the amendment to the coordinator.
- **(a) 0071 owns it for *this* screen — _(recommended)_.** This is the story that makes the Product Categories screen translation-aware; the list cannot render at all without it, and splitting "the modal gets tabs" from "the list stops throwing" across two stories leaves a broken screen between them. The other three screens (0027/0060/0062) stay the coordinator's.
- **(b) A separate amendment story covering all four screens at once.** Tidier as a unit of work, but it blocks 0071 on a story that does not exist, and 0071 cannot ship a screen whose list query throws.

## 6. Technical tasks for later backlog creation

Derived from this debate; **none are in scope for 0071**.

1. **Amend 0025** for the superseded component surface, the invalidated "exactly one input" rendering test, the `{id, name, …}` row shape and the flat browser-test path (**R-1**). Not this story's to write.
2. **Stories 0073 / 0075 / 0077 / 0079** reuse `language-tab-strip.blade.php`, expose `setActiveLanguageTab()`, **each add their own `Set<Entity>Translation` action per D-13**, and re-derive none of **D-2**, **D-4**, **D-6**, **D-7**, **D-8** or **D-13**. 0077/0079 are the first with **multiple** translatable fields per tab and are where **D-6**'s raw-read rule must be generalised from one field to several. **0073, 0075 and 0077 are already written and predate the 2026-08-30 two-layer decision** — the coordinator is propagating it to them separately, with this file as the reference.
3. **Retire the three flat `tests/Browser/` files** into mirrored subfolders — 0069's backlog item 5, now one file larger than when it was written (**D-9**).
4. **Correct 0069's D-3 and D-17 stale claims** (**R-5**), so a fourth Epic 5 UI story does not inherit them.
5. **Decide whether the Product Categories write paths adopt refusal logging** (**R-7**) — 0025's component gap plus the new `Gate::authorize()` site this story adds, which makes it a live question rather than an inherited one. The honest unit of work is all four Product Category actions at once, not the new one alone.
6. **Revisit `flux:tabs`** once a Phase 3 author with `vendor/` installed can confirm what Flux Free ships (**R-6**).
7. **Surface "this language holds content but is no longer active"** somewhere an administrator can act on it — 0069's backlog item 3, which becomes meaningful for the first time once this story's translations exist (**D-5**).

## Provenance

**Phase 1 Three Amigos debate, 2026-08-30.** Participants: `product-owner` (facilitator),
`frontend-expert`, `frontend-qa` — both dispatched as real subagents, both returned full
contributions. Classification (frontend) was fixed by the coordinator; this story is one of a
human-confirmed 14-story decomposition of PRD Epic 5 and **no further decomposition was
performed**. **Nothing outside this file was created or modified** — no application code, test,
view, config or lang file, and no sibling story's file, including 0025, 0068, 0069 and 0070.

**Where the two converged, independently:** that the edit field must read the **raw** translation
row rather than `translated()`'s fallback (**D-6**) — `frontend-qa` reached it from the test side
as "the fallback must not leak into the input", `frontend-expert` from the contract side as
"`withTranslationsFor()` is the wrong tool here"; that a validation error on a hidden tab is the
story's sharpest risk and needs both a server-side switch and a persistent marker; that only
active languages get tabs; that 0025's "exactly one input" test and `orderBy('name')` query are
actively invalidated; and that language names and two-letter codes make page-global assertions
unsafe on this screen specifically.

**Where the facilitator decided rather than either participant.** `frontend-qa` deliberately left
the tab-switching mechanism open (its DQ-1), testing under both branches; `frontend-expert`
recommended server-side. **Adopted server-side (D-2)**, on the participant's own strongest
argument — only the server knows which tab was refused — with the addition that the claim about
dirty-property transmission is **unverified**.

**Second post-debate amendment, 2026-08-30 — `x-show` is the universal panel-rendering mode.**
The original **D-2** bundled two independent choices: how the active tab is tracked (server-side)
and whether an inactive panel stays in the DOM (originally `@if`, with `x-show` named only as a
contingent fallback in that decision's own ⚠️). Sibling story
[0077](0077-product-editor-language-tabs-ui.md)'s **C-2** separated the axes and showed the second
one was wrong: `@if` tears down `wire:ignore`d WYSIWYG regions on every switch, and story 0021's
editor has no client-side refresh hook to recover from it. **The tracking axis is unchanged; the
rendering axis is now `x-show` for every consumer**, which removes the divergence rather than
leaving one story on a documented exception — 0073 and 0075 inherit it with no edit. It also
retires the ⚠️'s dependence on the unverified dirty-property claim, since an input that is never
unmounted cannot lose its value on a switch. Read as: **0077 did not need a carve-out; it found a
defect in the shared default**, which is exactly what **R-8** predicted would happen and the
reason the pattern is centralised in one component at all.

**One participant claim was verified and corrected rather than propagated.**
`frontend-expert` flagged that `@js()` is broken inside an anonymous Blade component and
recommended `@include` over `<x-…>` on that basis. Checked against
[errors-log.md](../../docs/errors-log.md#two-directive-calls-in-one-blade-component-tags-attribute-string-silently-fail-to-compile--2026-08-26):
what is verified by execution is that `@js()` fails in the **attribute of an `<x-…>` tag at the
call site**, and the entry's own dated correction states the real mechanism is **not established
and must not be guessed at**. The recommendation is therefore narrowed to the two rules that
actually survive — use `{{ Js::from(…) }}`, and verify the compiled output — rather than adopting
a broader claim the log does not support (**D-8**).

**Three claims were verified by the facilitator against the live tree rather than inherited.**
*(1)* No tabbed markup exists anywhere in `resources/views/` — this story genuinely establishes the
first, and 0074 independently confirmed at its own authoring time that 0071–0073 did not exist, so
there is no sibling to reconcile against. *(2)* 0069 **D-3**'s claim that `flux:separator` is used
nowhere is **false** — it is used in `components/settings/layout.blade.php` (**R-5**). *(3)* 0069
**D-17**'s "two existing flat browser files" is now **three** (**R-5**, **D-9**).

**Two things this debate deliberately did not re-litigate**, both settled upstream: that a child
table beats a JSON column (0070 **D-1**), and that `SetTranslation` does not self-authorize
(0070 **D-9**) — this story answers only the half 0070 left open, namely which caller does.

**Post-debate amendment, 2026-08-30 — a human architectural decision, not a debate output.** The
original **D-4** made the *component* the sole authorizing and validating caller. The human ruled
that both layers are required: *"the component authorizes and validates the batch, but it must ALSO
be controlled from the backend — everything must be controlled from both front and back for
security."* **D-4** was rewritten around the two-layer table, **D-13** was added to make this the
master pattern for 0073/0075/0077/0079 (including the action-only shape for a component that cannot
validate), and `App\Actions\ProductCategories\SetProductCategoryTranslation` was added with its own
direct-call test file. The decision aligns with this repo's own existing rulings rather than
overriding them — [base-standards.md](../../docs/conventions/base-standards.md#an-authorization-rule-belongs-to-the-action-not-to-one-of-its-callers)'s
action-owns-the-rule convention and task 0017's *"a component that authorizes as well is a layer,
not a redundancy"* — which is why it is recorded as an amendment with its reasoning rather than
folded silently into the original text.

Three consequences the amendment surfaced, none of them anticipated by either participant, all
found by verifying against 0023 rather than by applying the instruction mechanically: the
**default-language error-key mismatch** (0023's actions key on `name`, this screen's fields on
`names.{id}` — **D-4**'s ⚠️ and its adapter); the **classification tension** of adding an
`app/Actions/` class to a frontend-classified story (raised under **Type**, not silently resolved);
and **R-7** turning from an inherited 0025 gap into a live question, because the story now adds a
`Gate::authorize()` site of its own.

**Not run by this phase**, per [workflow.md](../../docs/workflow.md): the INVEST check (Phase 2),
TDD implementation (Phase 3), security audit (Phase 4), code review (Phase 5), or the docs pass
(Phase 6).
