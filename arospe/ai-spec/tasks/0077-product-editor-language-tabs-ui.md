# [0077] Product editor — language tabs (UI)

## Description
Adds per-store-language tabs to the Product editor ([PRD Epic 5, Layer 2](../../docs/PRD/PRD.md#epic-5--internationalization): *"each active store language surfaces as a tab in the Product and Blog editors"*), so a catalog administrator can author a product's **five** translatable fields — `name`, `description`, `slug`, `meta_title`, `meta_description` — in every active store language from one screen. Non-translatable fields (`sku`, category, `type`, `status`, `price`, `stock`, imagery, sales regions) stay **outside** the tabs and render once, exactly as PRD requires.

**This story consumes two contracts and writes none.** [0076](0076-translatable-content-retrofit-products-backend.md) supplies the widened `CreateProduct` / `UpdateProduct` signatures, the three new validation-rule methods and the `product_translations` table; [0070](0070-translatable-content-mechanism-product-categories-backend.md) supplies `HasTranslations`, `SetTranslation` and `StoreLanguage::defaultStoreLanguage()`. Both are used **unmodified**.

> ✅ **Four of the five open questions are now closed and nothing blocks test authoring.** **Q-1** (an untranslated tab renders **empty**, never pre-filled) and **Q-2** (a blank tab creates **no row** and simply stays untranslated) were resolved by the human on 2026-08-30; **Q-3** (active languages only) and **Q-4** (blanking is not a delete path) are closed by [0071's **D-5**/**D-7**](0071-product-categories-language-tabs-ui.md). **Q-5** remains open and belongs to the 0027 amendment, not to this story. The exact validation shape Q-2 implies is specified at **D-18**; the raw-row hydration rule Q-1 implies is in **Q-1** itself and mirrors 0071's **D-6**.

> ⛔ **CORRECTION, added minutes after this file was first written — sibling story [0071](0071-product-categories-language-tabs-ui.md) exists and it owns the tab pattern. Four of this file's decisions conflict with it and are superseded or must be reconciled at Phase 2; see [Reconciliation with 0071](#reconciliation-with-0071--four-conflicts-found-after-this-file-was-written).** This story's debate was run and this file composed while `ai-spec/tasks/` contained **no** 0071/0073/0075 — verified twice by directory listing before the amigos were dispatched, and true at that moment. Three concurrent sessions wrote those files during this one: 0071 at 11:22:17, 0073 at 11:24:15 and 0075 at 11:24:49, against this file's 11:24:23. **0071 names this story by number four times** and states that 0073/0075/0077/0079 must reuse its `language-tab-strip.blade.php`, expose `setActiveLanguageTab()`, and re-derive none of its **D-2**, **D-6**, **D-7** or **D-8**. The conflicts are recorded rather than silently resolved, because two of them are genuine technical disagreements a human should settle — not drafting errors. This is [contracts.md](../../docs/contracts.md#parallel-agent-file-ownership-rule)'s parallel-write hazard arriving between *stories* rather than between agents editing one file.

> **Read this before anything else: this story is the consumer [0021](done/0021-wysiwyg-rich-text-editor-component.md) warned about, arriving a story earlier than it expected.** 0021's **D9** says, verbatim: *"because the region is `wire:ignore`d, **a server-side write to `$value` does not appear in the editor** … If a consumer ever needs programmatic content replacement, this component must gain an explicit client-side refresh hook — **it does not have one**, and 0027 should be told rather than discovering it."* Switching a language tab **is** programmatic content replacement of a rich-text region. **D-1** resolves it without editing 0021, and the resolution is why this story's markup is shaped the way it is rather than the obvious way.

> **Nothing this story binds to exists in code. Verified against the live tree at authoring time:** there is **no `vendor/` directory**, `app/Livewire/` holds no `Products/` and no `Components/`, `app/Models/` holds only `User`, `Role`, `SalesRegion` and `Media`, and `lang/en/` holds five files with no `products.php` and no `components.php`. Stories 0021, 0024, 0027, 0068, 0070 and 0076 are all **Phase 1 text, not shipped code**. Everything below is designed against their *specified* shape, and **Phase 3 must re-verify every signature against `HEAD` before writing a line of markup** — 0076's own **R-12** mandate, which applies here **doubly**, because this story binds to 0076's *widened* signature which itself binds to 0024's *unimplemented* one. See **R-11**.

## Type
frontend | includes database-expert: **no** (no migration, no model, no column, no query change — the read-side scope this screen needs, `scopeOrderByTranslatedName()`, is [0076's **D-14**](0076-translatable-content-retrofit-products-backend.md) and is consumed, not written)

> ⚠️ **Classification note — the same one [0071](0071-product-categories-language-tabs-ui.md) raises, resolved the same way, deliberately.** The 2026-08-30 defence-in-depth decision (**D-17**) adds one `app/Actions/` class to a story classified **frontend**, which [workflow.md](../../docs/workflow.md#task-classification-rule) would ordinarily read as *fullstack* and therefore split in two. **This file does not split**, matching 0071's decision rather than re-escalating a question the human has already answered once for this family: the action is a thin, self-authorizing, self-validating wrapper over a primitive 0070 already ships — no model, migration, schema, route or permission change, so `includes database-expert` stays **no** — and splitting would put the screen and the guard it depends on in different stories. **The one thing that differs from 0071 and is worth Phase 2's attention:** this action is the family's only **multi-field** one (five fields against one), so it carries a real validation body rather than a single rule, which is a larger backend surface inside a frontend story than any sibling's. It is still not a *database* surface. If Phase 2 prefers a split anyway, the action half is numbered **below** this story per the [task ordering rule](../../docs/workflow.md#task-ordering-rule).

## 1. Refined user story

> **As** a catalog administrator running a store that sells in more than one language,
> **I want** to author each product's title, description, slug and SEO fields per store language from tabs inside the one product editor, with the product's price, stock, SKU and status shown once outside them,
> **so that** I can translate a product without leaving the screen, and I can see at a glance which languages are still untranslated.

> **As** the engineer building the first language-tabs screen in this application,
> **I want** the tab pattern designed once, in a shape three simpler taxonomy screens can adopt without re-deriving it,
> **so that** stories 0071, 0073 and 0075 append a component and a documented state shape rather than inventing a fourth, fifth and sixth answer to the same question.

**Scope fence — this story ships no backend.** No migration, no model, no action, no validation-rule method, no permission, no policy, no route. It composes [0076](0076-translatable-content-retrofit-products-backend.md)'s `slugRules()` / `metaTitleRules()` / `metaDescriptionRules()` and adds none of its own. The one place it comes close to the line is **D-6**, which puts a `SanitizeProductDescription` call inside a Livewire component; that is a *third call site of an existing action*, never a second allow-list, and 0076's **D-8** explicitly permits exactly that — but it is flagged for Phase 2 rather than adopted quietly.

**Scope fence — this story does not amend 0027's list screen.** [0076's **R-1(a)/(b)**](0076-translatable-content-retrofit-products-backend.md) break `App\Livewire\Products\Index`'s `->select([… 'name' …])->orderBy('name')` and its `$deletingProductName`. Those are **0076's hand-off** (its technical task 1), they live in files this story does not open, and the amendment must be written **once** by whoever amends 0027. Named here so nobody assumes this story covers it — see **R-1**.

## Gherkin — 2. Detailed acceptance criteria (Given/When/Then)

Every scenario opens with a named business-role actor and carries exactly one `When`, per [gherkin-guidelines.md](../../docs/testing/frontend/gherkin-guidelines.md) rules 1 and 3. The actor is **"a catalog administrator"**, taken from 0024's and 0076's own scenarios. Scenarios marked ⚠️ are written against this story's *recommended* answer to an open question and are struck or inverted if the product owner chooses otherwise.

```gherkin
Feature: Per-store-language content in the product editor

  # --- The tab set ---

  Scenario: The editor offers one tab per active store language
    Given a catalog administrator, with Spanish and French active as store languages
    When they open a product in the editor
    Then a language tab is offered for Spanish and for French

  Scenario: The default store language's tab is the one shown first
    Given a catalog administrator, with Spanish as the default store language and French also active
    When they open a product in the editor
    Then the Spanish tab is the active one

  Scenario: A store with a single language still presents a coherent editor
    Given a catalog administrator, with Spanish as the only active store language
    When they open a product in the editor
    Then the translatable fields render without an unusable tab strip

  # --- Switching ---

  Scenario: Switching tabs shows the target language's title
    Given a catalog administrator, with a product titled "Zapatillas Running" in Spanish and "Chaussures de course" in French
    When they switch to the French tab
    Then the editor shows "Chaussures de course" as the product's title

  Scenario: Switching tabs shows the target language's description
    Given a catalog administrator, with a product described in Spanish and in French
    When they switch to the French tab
    Then the rich-text editor shows the French description and no longer the Spanish one

  Scenario: Switching tabs keeps unsaved work in the tab being left
    Given a catalog administrator who has typed a new Spanish title without saving
    When they switch to the French tab and back to the Spanish one
    Then their unsaved Spanish title is still there

  Scenario: Switching tabs stores nothing
    Given a catalog administrator with a product open in the editor
    When they switch to the French tab
    Then the product's stored content is unchanged in every store language

  Scenario: Switching tabs leaves the product's shared fields alone
    Given a catalog administrator with a product open in the editor
    When they switch to the French tab
    Then the SKU, price, stock, status, type, category, images and sales regions are unchanged

  Scenario: The product's shared fields are presented once, not once per language
    Given a catalog administrator, with three active store languages
    When they open a product in the editor
    Then the SKU, price, stock and status are each offered exactly once, outside the language tabs

  # --- Writing a translation ---

  Scenario: A catalog administrator translates a product into an additional language
    Given a catalog administrator, with a product titled only in Spanish and French active
    When they save the product with a French title
    Then the product carries a French translation alongside its Spanish one

  Scenario: Saving one language leaves the others untouched
    Given a catalog administrator, with a product titled in Spanish and in French
    When they save the product with only its French title changed
    Then the Spanish title is unchanged

  Scenario: Creating a product stores its content in the default store language
    Given a catalog administrator holding the products create permission
    When they create a product filling in only the default language's tab
    Then the product holds exactly one translation, in the default store language

  # --- Fallback (Q-1 and Q-2, both resolved 2026-08-30) ---

  Scenario: An untranslated tab opens empty and names what it falls back to
    Given a catalog administrator, with a product titled only in the default store language
    When they open the product's French tab
    Then the French fields are empty and the default store language's title is shown as the fallback

  Scenario: Saving an untranslated tab without filling it in creates no translation
    Given a catalog administrator viewing a product's empty French tab
    When they save the product without entering any French content
    Then the product still holds no French translation

  Scenario: A partially filled tab requires its title
    Given a catalog administrator who has entered a French slug and left the French title empty
    When they save the product
    Then the save is refused, because a translation cannot be stored without a title

  Scenario: A partially filled tab needs no slug or SEO content
    Given a catalog administrator who has entered a French title and left the French slug and SEO fields empty
    When they save the product
    Then the save is accepted and the French translation is stored without a slug

  Scenario: Emptying a language that was already translated is refused
    Given a catalog administrator, with a product already translated into French
    When they save the product with every French field cleared
    Then the save is refused, because clearing a tab is not how a translation is removed

  Scenario: A product translated in no language at all opens without error
    Given a catalog administrator, with a product holding no translation in any store language
    When they open the product in the editor
    Then every language tab opens with empty fields and no error is raised

  # --- Refusals ---

  Scenario: A blank title in a language being authored is refused
    Given a catalog administrator who has entered a French slug but no French title
    When they save the product
    Then the save is refused and no content is changed in any store language

  Scenario: A refusal in a language the administrator is not looking at is surfaced
    Given a catalog administrator on the Spanish tab, having entered a French slug but no French title
    When they save the product
    Then the French tab is marked as carrying the problem and becomes the active tab

  Scenario: A refusal in one language leaves every other language unwritten
    Given a catalog administrator who has entered a valid Spanish title and an invalid French one
    When they save the product
    Then neither the Spanish nor the French content is changed

  Scenario: Two products cannot share a slug within one store language
    Given a catalog administrator, with another product whose French slug is "chaussures-de-course"
    When they save this product's French slug as "chaussures-de-course"
    Then the save is refused with the reason shown beside the slug field

  Scenario: The same slug in two different store languages is permitted
    Given a catalog administrator, with a product whose French slug is "chaussures-de-course"
    When they save that same product's Spanish slug as "chaussures-de-course"
    Then the save is accepted, because slug uniqueness is scoped to one store language

  Scenario: A product keeps its own slug when re-saved in the same language
    Given a catalog administrator, with a product whose French slug is "chaussures-de-course"
    When they save that product again with its French slug unchanged
    Then the save is accepted rather than refused as a duplicate

  Scenario: A slug colliding only after canonicalisation is still refused
    Given a catalog administrator, with another product whose French slug is "chaussures-de-course"
    When they save this product's French slug as "  Chaussures De Course  "
    Then the save is refused, because the collision is judged on the canonical form

  Scenario: Two products may both be saved without a slug in the same language
    Given a catalog administrator, with another product holding no French slug
    When they save this product leaving its French slug empty
    Then the save is accepted, because an empty slug is stored as no slug at all

  Scenario Outline: Over-long SEO content is refused in any store language
    Given a catalog administrator, with French active as a store language
    When they save a product whose French <field> exceeds its allowed length
    Then the save is refused with the reason shown beside that field

    Examples:
      | field            |
      | meta title       |
      | meta description |

  # --- The slug affordance ---

  Scenario: An empty slug is pre-filled from the title of its own language
    Given a catalog administrator who has typed "Chaussures de course" as a product's French title
    When they leave the French title field
    Then the French slug field is pre-filled with "chaussures-de-course"

  Scenario: A slug the administrator already typed is never overwritten
    Given a catalog administrator, with a product whose French slug is "souliers"
    When they change the French title and leave the field
    Then the French slug still reads "souliers"

  # --- Content safety ---

  Scenario: A description written in a non-default language is stored safely
    Given a catalog administrator on a product's French tab
    When they save a French description containing a script tag
    Then the stored French description holds no script tag

  # --- Authorization and tampering ---

  Scenario: An administrator without the products edit permission cannot translate a product
    Given a signed-in administrator who does not hold the products edit permission
    When they submit a product save carrying a French title
    Then the save is refused and the product holds no French translation

  Scenario: Translating a product is refused without the editor, not only within it
    Given a signed-in administrator who does not hold the products edit permission
    When a product translation is requested directly, with no editor screen involved
    Then the request is refused and no translation is stored

  Scenario: A blank title is refused without the editor, not only within it
    Given a catalog administrator holding the products edit permission
    When a product translation is requested directly with a blank French title
    Then the request is refused and no translation is stored

  Scenario: A submission naming a store language the editor never offered writes nothing for it
    Given a catalog administrator, with French active and German not a store language at all
    When they submit a product save carrying content for German
    Then the product's stored translations cover only the active store languages
```

## Files to create/modify

**Every file in the "Modify" table is [0027](0027-products-list-and-editor-ui.md)'s.** Per [contracts.md](../../docs/contracts.md#parallel-agent-file-ownership-rule)'s Parallel Agent File-Ownership Rule and 0027's own sequential-implementation note, this story's Phase 3 must **never** be dispatched in the same batch as 0021, 0024, 0025, 0026, 0028 or 0076.

### Modify

| Path | Change |
| --- | --- |
| `app/Livewire/Products/Editor.php` | The `$translations` / `$languages` / `$defaultLanguageId` state (**D-2**), `mount()` hydration, `save()` recomposition (**D-5**), `prefillSlug()` (**D-9**), `#[Computed] languagesWithErrors()`, and the four private helpers `activeStoreLanguages()` / `translationPayloadFor()` / `nullIfBlank()` / `isBlankTranslation()`. **`public string $name` and `public string $description` are removed** — see **R-2**. |
| `resources/views/livewire/products/editor.blade.php` | The tab strip, N panels and N WYSIWYG embeds. Note this is the **nested** mirror and is correct: `Editor` is not named `Index`, so the [`Index`-in-a-subfolder exception](../../docs/conventions/naming.md#exception-a-component-named-index-resolves-to-its-parent-folders-name) does **not** apply. (`resources/views/livewire/products.blade.php` is the *list's* flat path — a different file, not touched here.) |
| `lang/en/products.php` / `lang/es/products.php` | Append an `editor.languages.*` group and the `attributes` leaves for `translations.*.{name,description,slug,metaTitle,metaDescription}`. Key-for-key identical. **Extend, never recreate** — 0024 creates them and 0025/0026/0028/0076 also extend. |
| `tests/Feature/Products/EditorTest.php` | Every `name` / `description` assertion retargets to `names.{defaultId}` / `descriptions.{defaultId}` (**D-2**). |
| `tests/Feature/Products/EditorRenderingTest.php` | The tab strip, the N-panels-present-simultaneously assertion (**D-1**), the per-language field hooks, the exactly-once count for non-translatable fields, the error indicator's absence when clean. |
| `tests/Feature/Products/AuthorizationTest.php` | The fourth table in the "writes nothing" assertion, and the translation write path (**D-8**). |
| `tests/Browser/Products/EditorJourneyTest.php` | The existing comprehensive journey gains one leg: author a **second** language before saving, reopen, verify both survived. Extending beats a second full journey — that page runs four hand-rolled JS surfaces at once and re-driving them buys no new signal. |

### Create

| Path | Purpose |
| --- | --- |
| ~~`resources/views/components/language-tabs.blade.php`~~ | ⛔ **WITHDRAWN — see [C-1](#reconciliation-with-0071--four-conflicts-found-after-this-file-was-written).** [0071](0071-product-categories-language-tabs-ui.md) shipped `resources/views/components/language-tab-strip.blade.php` first, with a **strip-only** split (panels belong to the consumer) that is the better shape. This story **consumes** it unmodified and creates no tab component of its own. **D-10's `@js()` warning still applies** — the strip is an anonymous component, so every dynamic value in its attributes must use `{{ Js::from(...) }}`. |
| `lang/en/components.php` / `lang/es/components.php` | A `components.language_tabs.*` group. ⚠️ **These files do not exist yet** and both [0021](done/0021-wysiwyg-rich-text-editor-component.md) (its **D12**) and [0022](0022-searchable-multi-select-component.md) also target them — the same first-to-land hand-off. Whoever reaches Phase 3 first creates the file; the rest extend under their own top-level key. |
| `app/Actions/Products/SetProductTranslation.php` | **New — the backend half of the two-layer rule (D-17).** Self-authorizes and self-validates, then wraps 0070's `SetTranslation`. The family's only multi-field member. Contract below. |
| `tests/Feature/Products/SetProductTranslationTest.php` | **New. Direct-call** action tests that mount **no component** — the layer a `Livewire::test()` structurally cannot prove. |
| `tests/Feature/Products/EditorTranslationsTest.php` | Its own file. The per-language save composition, **D-4**'s `''`→`NULL` boundary, **D-6**'s ordering, **D-3**'s payload narrowing and the default-vs-non-default write split are the *centre* of this story and belong somewhere findable from 0076's **D-8**/**D-18**. `EditorTest.php` is already called "the largest file" by its own author. |
| `tests/Feature/Products/EditorTranslationValidationTest.php` | Per-language slug uniqueness, canonicalisation-before-validate, blank-name refusals in active and non-active tabs, the SEO length rules, the four-table "a refused save writes nothing" assertion, and the stale-error-bag case. Split out for the same reason. |
| `tests/Browser/Products/EditorLanguageTabsTest.php` | The mirrored subfolder, per **D-13**. **Everything that can fail silently lives here** — see [Tests to perform](#tests-to-perform--3-qa-test-cases--validation-scenarios). |

### The new backend action — the layer that does not depend on a caller

Follows [0071's **D-13**](0071-product-categories-language-tabs-ui.md) master contract, `Set<Entity>Translation::__invoke(<Entity> $entity, StoreLanguage $language, ...$translatableFields): <Entity>Translation`, as the **first multi-field instance** of it. Neither [0076](0076-translatable-content-retrofit-products-backend.md) nor [0070](0070-translatable-content-mechanism-product-categories-backend.md) names this class — 0070's **D-12** anticipates it exactly (*"writing a **non-default** language goes through `SetTranslation` directly, called by whichever action the UI story adds; this story ships no such caller"*), and this is that story.

```php
namespace App\Actions\Products;

final class SetProductTranslation
{
    public function __construct(
        private readonly SanitizeProductDescription $sanitizeProductDescription,
        private readonly SetTranslation $setTranslation,
    ) {}

    /**
     * Authorize, validate and persist one product's translatable content in one store language.
     *
     * Named parameters, never an array (D-19). $name is required because
     * product_translations.name is NOT NULL (0076 D-2); the other four are nullable
     * for the reason that same decision gives.
     *
     * @throws AuthorizationException  when the actor lacks products.edit
     * @throws ValidationException     keyed "{$field}s.{$language->id}" (0071 D-13's
     *                                 multi-field form) — blank name, over-length meta,
     *                                 or a slug already taken in THIS store language
     */
    public function __invoke(
        Product $product,
        StoreLanguage $language,
        string $name,
        ?string $description = null,
        ?string $slug = null,
        ?string $metaTitle = null,
        ?string $metaDescription = null,
    ): ProductTranslation {
        Gate::authorize('update', $product);   // -> products.edit, via ProductPolicy

        // Layer 2 sanitizes too. Idempotent by 0024 D-16 constraint 2, and this is a
        // third CALL SITE, never a second allow-list (0076 D-8 permits exactly this).
        // It must run BEFORE validate(), or max: measures unsanitized markup (D-6).
        $description = $this->sanitizeProductDescription($description);

        $slug = filled($slug) ? Str::slug($slug) : null;   // canonicalize BEFORE the unique rule (0076 D-6)

        $id = $language->id;

        Validator::make([
            "names.{$id}" => $name,
            "descriptions.{$id}" => $description,
            "slugs.{$id}" => $slug,
            "metaTitles.{$id}" => $metaTitle,
            "metaDescriptions.{$id}" => $metaDescription,
        ], [
            "names.{$id}" => $this->productNameRules(),
            "descriptions.{$id}" => $this->descriptionRules(),
            "slugs.{$id}" => $this->slugRules($id, $product->id),   // per-language unique, product_id exclusion
            "metaTitles.{$id}" => $this->metaTitleRules(),
            "metaDescriptions.{$id}" => $this->metaDescriptionRules(),
        ])->validate();

        return ($this->setTranslation)($product, $language, [
            'name' => $name,
            'description' => $this->nullIfBlank($description),
            'slug' => $slug,
            'meta_title' => $this->nullIfBlank($metaTitle),
            'meta_description' => $this->nullIfBlank($metaDescription),
        ]);
    }
}
```

**Seven properties, each following an existing convention rather than inventing one:**

1. **`Gate::authorize('update', $product)` is the first statement**, outside any transaction, per [the action-owns-the-rule convention](../../docs/conventions/base-standards.md#an-authorization-rule-belongs-to-the-action-not-to-one-of-its-callers). `ProductPolicy::update()` maps to the already-seeded `products.edit` (0024's **D-15**), so **no new permission and no new ability — the catalog stays at 42.**
2. **It closes the same hole this story's D-3 closes at the component, one layer down.** The language arrives as a **typed `StoreLanguage` model**, never an id — so there is no key for a forged payload to smuggle, and the *caller* is forced to resolve (and therefore to have already narrowed) the language before it can call at all. That is the structural half of **D-3**; the component's `active()` intersection is the other half, and **neither is optional**.
3. **Named parameters, not `array $fields`** — see **D-19**.
4. **Error keys are `{field}s.{languageId}`**, derived from `$language->id` inside the action and **never accepted as a parameter** — 0071's **D-13** names this as a thing a sibling *must not re-derive*, and its parameterised form is the [guard-takes-the-state-it-guards](../../docs/errors-log.md#a-guard-took-the-state-it-was-guarding-as-a-parameter-reopening-its-own-hole-one-level-up--2026-08-20) shape.
5. **It reuses `ProductValidationRules`' methods and adds none** — 0076 ships all five; this story composes them in a second place. Note `slugRules($storeLanguageId, $productId)` takes the **explicit `product_id` exclusion**, not `->ignore()`, per 0076's **D-6**/**R-5**.
6. **Collaborators are constructor-injected**, per [code-style.md](../../docs/conventions/code-style.md#exception-an-actions-own-dependency-is-constructor-injected-when-the-method-signature-is-a-public-contract)'s documented exception — `__invoke()`'s parameter list is a public contract. It is therefore **resolved from the container, never `new`-ed, including in tests**.
7. **`SetTranslation` is reached from nowhere else.** After this story, `App\Actions\Translations\SetTranslation` must appear in **no** import under `app/Livewire/` — a greppable invariant, and 0071's **D-13** names it as the third thing a sibling must not re-derive.

### Deliberately not touched

- `app/Livewire/Components/WysiwygEditor.php` and its view — 0021's. **D-1** exists precisely so this stays true; the alternative shape would have required amending it.
- `app/Actions/Translations/SetTranslation.php`, `app/Concerns/HasTranslations.php` — 0070's, consumed unmodified.
- `app/Models/{Product,ProductTranslation,StoreLanguage}.php` — 0024's / 0076's / 0068's.
- `app/Actions/Products/{Create,Update,Delete}Product.php`, `SyncProductGallery.php`, `SanitizeProductDescription.php` — 0024's and 0076's. The widened signature is **consumed**; a diff in any of these means something leaked across the boundary. ⚠️ **This row no longer covers the whole folder** — this story *adds* `SetProductTranslation.php` beside them (**D-17**) and modifies none of the existing five.
- `app/Concerns/ProductValidationRules.php` — 0076 adds the three new rule methods; this story **composes** them and adds none.
- `app/Policies/ProductPolicy.php`, [`database/seeders/RolePermissionSeeder.php`](../../database/seeders/RolePermissionSeeder.php) — no new ability, no new permission; the catalog stays at **42** (**D-8**).
- `routes/**`, `config/modules.php`, `config/store-languages.php`, any migration — this story adds no route, no sidebar entry and no schema.
- **`app/Livewire/Products/Index.php` and `resources/views/livewire/products.blade.php`** — 0076's **R-1(a)/(b)** hand-off, not this story's. See **R-1**.

## Tests to perform — 3. QA test cases / validation scenarios

`frontend-qa`'s contribution, adopted essentially as delivered. **Test-level calibration is the story's defining QA property:** this screen lands in **all three** of this repo's recorded `Livewire::test()` blind spots at once — an uncompiled `wire:click`-style attribute, a `null`-bound form control, and a `wire:ignore`d region that never updates — which is unusual and is why it needs *more* browser coverage than 0018 did, not less. A component suite alone would ship all three failure modes green.

### Component level — `tests/Feature/Products/EditorLanguageTabsTest.php` *(new)*
- [ ] The tab set equals the **active** store languages, default first.
- [ ] Loading a product hydrates all five fields for every language, asserted **field-by-field across all five**, not spot-checked — 0076's **D-3** argument applies one layer up: with fewer than three fields disagreeing, a per-*row* swap and a per-*field* swap are hard to separate.
- [ ] Unsaved input in a tab survives switching away and back.
- [ ] Switching tabs writes **nothing** — `Product::count()`, `product_translations` count and the target's `updated_at` are all unchanged. *Risk if missing:* an implementation that "saves the current tab before switching" turns every tab click into a partial write, so a later refusal leaves half the languages committed — which **no** atomicity test in 0076 can catch, because the writes are separate requests.
- [ ] The whole set of non-translatable properties is byte-identical across a tab switch, snapshotted and compared **as one array** — never per-field, or the list silently stops covering whatever 0031 adds.
- [ ] **Tamper — the single most important test in the story.** A payload carrying a `translations` key for a language that is inactive, nonexistent, or simply never rendered writes **no row for it**. Assert the exact set of persisted `store_language_id` values **equals** the active set — `toContain` is not sufficient. *Risk if missing:* the wrong loop is an arbitrary-row-insert primitive into `product_translations`, bounded only by the FK (**D-3**).
- [ ] A forged `$productId` retarget is refused, **and** no translation row is written for the other product either (extending 0027's existing case).
- [ ] `product_id` / `store_language_id` are never passed inside the attributes array — 0076 covers the model-level `#[Fillable]` omission; this asserts the *caller*.
- [ ] A store with exactly **one** active language renders coherently. Degenerate, cheap, and it is the state every fresh install starts in (0068's **D2** bootstraps Spanish alone).

### Component level — `tests/Feature/Products/EditorTranslationsTest.php` *(new)*
- [ ] The default language is written through `CreateProduct` / `UpdateProduct`; every other language through **`SetProductTranslation`** — asserted as **two separate calls with two separate arguments**, never one call carrying both. Editing **only** the French tab calls `SetProductTranslation` for French and does **not** call `UpdateProduct`'s translation write for the default. *Risk if missing:* the save collapses back to "always rewrite the default row", silently corrupting a deliberately French-only edit.
- [ ] **D-18's three states, one test each.** *Untouched* (five blanks, never translated) → **no row**, no error, save succeeds. *Engaged* (any field filled) → `name` required for that language. *Blanked* (five blanks, previously translated) → refused, keyed `names.{id}`, row intact. The first two are the human's 2026-08-30 resolution of **Q-2**; the third is 0071's **D-7**. *Risk if missing:* the untouched and blanked cases look identical in the payload and differ only by `$originalTranslatedLanguageIds`, so one implementation satisfies whichever case is tested and silently fails the other.
- [ ] `$originalTranslatedLanguageIds` is `#[Locked]` — a forged value must not turn a *blanked* tab into an *untouched* one, which would silently delete content. A regression-proof against someone dropping the attribute.
- [ ] **D-4:** an empty slug is persisted as `NULL`, not `''`, and **two products may both hold a `NULL` French slug**. *Risk if missing:* this is the story's nastiest latent bug — see **D-4**; it is invisible until the second row exists and invisible in every single-fixture test.
- [ ] `meta_title`, `meta_description` and `description` are likewise `NULL` rather than `''` when blank, so the estate matches 0076's backfill (its **D-9**) and `translated()`'s `!== '' `guard is not the only thing papering over a split.
- [ ] **D-6:** a description whose *pre*-sanitisation length exceeds the rule but whose sanitised form does not is accepted **in every language identically** — the assertion that the ordering is symmetric.
- [ ] A `<script>` typed into the **French** description is stored sanitised. **One test only** — do not re-derive the allow-list, the scheme rules or idempotence; 0024's **D-16** and 0076's **D-8** own those.
- [ ] The three-level transaction holds: a failure in the region sync rolls back the core row **and every translation row**.

### Direct-call level — `tests/Feature/Products/SetProductTranslationTest.php` *(new)*
**Every test here calls `app(SetProductTranslation::class)(...)` and mounts no component.** This is the layer a `Livewire::test()` structurally cannot prove, and it is the whole point of **D-17** — 0071's **D-13** test for it: *"if I delete the component, is the operation still protected?"*
- [ ] An actor holding only `products.view` is refused with `AuthorizationException` and **writes nothing** — the same case asserted at the component in the file below. **The pair is deliberate: it is what proves the two layers are independent rather than one check observed twice.**
- [ ] A `products.edit` holder with **zero** `store-languages.*` permissions succeeds (0070's **D-13** — authoring content is not managing the catalog).
- [ ] A Super Admin passes via `Gate::before`.
- [ ] A blank `name` is refused, keyed `names.{languageId}`, with **no row written** — the `NOT NULL` guarantee proven at the layer that owns it rather than at the form.
- [ ] Over-length `metaTitle` / `metaDescription` refused on their own keys.
- [ ] The slug is **canonicalised before** the uniqueness rule runs: `"  Chaussures De Course  "` against an existing `chaussures-de-course` in the same language is refused (0076's **D-6** ⚠️).
- [ ] Per-language slug uniqueness: same slug two languages → accepted; same slug two products one language → refused; a product re-saving its own slug → accepted (the `product_id`-exclusion case, 0076's **R-5**).
- [ ] A description containing a `<script>` is stored sanitised **through this path**, proving layer 2 is self-sufficient rather than relying on the component's sanitise call (**D-6**).
- [ ] `''` arrives as `NULL` for all four optional columns (**D-4**), asserted on the persisted row.
- [ ] Re-invoking for the same `(product, language)` **updates rather than duplicates** — one row, `SetTranslation`'s `updateOrCreate` semantics observed through the action, not re-derived.
- [ ] The action is **resolved from the container, never `new`-ed**, in every test — it has two constructor dependencies, per [code-style.md](../../docs/conventions/code-style.md#exception-an-actions-own-dependency-is-constructor-injected-when-the-method-signature-is-a-public-contract)'s rule that a zero-argument constructor is not a contract.
- [ ] ⚠️ **Architecture guard:** `App\Actions\Translations\SetTranslation` appears in **no** import under `app/Livewire/` (0071's **D-13**, third non-re-derivable rule). A `grep`-shaped assertion, or an `arch()` rule — and per [the errors-log's vacuous-`arch()` entry](../../docs/errors-log.md#a-pest-arch-rule-over-an-array-of-namespaces-shipped-green-while-proving-nothing--2026-08-18), **one rule per namespace**, proven able to fail.

### Component level — `tests/Feature/Products/EditorTranslationValidationTest.php` *(new)*
- [ ] Same slug, two languages, one product → **accepted**, both rows present. The only test proving the scope is per-language rather than global.
- [ ] Same slug, two products, one language → **refused**, zero rows changed on both products.
- [ ] A product re-saving its **own** slug unchanged → accepted, with a second product holding a *different* slug present in the fixture, so `->ignore()` on the wrong id (0076's **R-5**) surfaces as a fast diagnosis rather than a generic failure.
- [ ] Canonicalisation happens **before** `validate()`: `"  Chaussures De Course  "` against an existing `chaussures-de-course` is refused. *Risk if missing:* the rule checks a value the database never stores and the collision arrives as an opaque `23000` at insert.
- [ ] Writing a slug into a language the product has **no row in yet** is accepted — the insert case, where a translation-row-id `->ignore()` has no id to pass.
- [ ] Blank name on an **engaged** tab refused, as **two** cases: engaged-and-blank in the **active** tab, and in a **non-active** one. (A *wholly* blank tab is not this case — it is **D-18**'s untouched state and must succeed.)
- [ ] The **default** language's blank name is refused unconditionally, with no engagement test (0070's **Q1(a)**).
- [ ] `metaTitle` > 160 and `metaDescription` > 500 refused on their own error keys, database unchanged.
- [ ] A refused save writes nothing across **four** tables — `products`, `product_translations` (asserted as an exact per-language row set), `product_media`, `product_sales_region`. 0027's equivalent asserts three; the fourth is the one table 0076 leaves structurally unguarded.
- [ ] The stale-error-bag case: a refused save carrying a French error, then a tab switch, does not render the French message on the Spanish tab. ⚠️ Livewire's `SupportValidation::dehydrate()` filters the bag through `Utils::hasProperty()`, so whether an error keyed `names.{uuid}` persists at all depends on `names` being a declared public property — which **D-2**'s revision to five parallel arrays makes trivially true for all five, where the original nested shape had one property to satisfy. A behavioural fork the test is written *against*, not around.

### Rendering level — `tests/Feature/Products/EditorRenderingTest.php` *(extend 0027's)*
- [ ] **All N panels are present in the DOM simultaneously** (**D-1**) — this is the assertion that catches someone "optimising" `x-show` into `@if`.
- [ ] Non-translatable fields render **exactly once**. Three rules make this assertion real rather than vacuous: match on `data-test="product-sku-input"` **including the closing quote** (the [`<ui-checkbox` / `<ui-checkbox-group` prefix trap](../../docs/errors-log.md#a-count-based-assertion-over-rendered-html-counted-a-wrapper-element-it-never-meant-to-include--2026-08-21)); use a **three-language** dataset, because at N=1 the assertion cannot fail and at N=2 an off-by-one is indistinguishable from a wrapper; and assert the translatable hooks against the *derived* language count, never a literal.
- [ ] Every translatable hook sits **inside** its `language-panel-{code}` and every non-translatable one sits **outside** — this makes "outside the tabs" a checked property rather than a rendering coincidence.
- [ ] The per-tab error indicator renders for the offending language and **is absent** from the DOM for the others.
- [ ] ⚠️ **Page-global `assertSee` is unsafe on this screen.** Every label, helper line and WYSIWYG control now appears N times, and the product's default-language name legitimately appears in the header too. Scope by panel hook, or use the `*In*` variants — the [`assertSee('0%')` matching inside `10%`](../../docs/testing/frontend/playwright-setup.md) trap in a new costume.

### Browser level — `tests/Browser/Products/EditorLanguageTabsTest.php` *(new; mirrored subfolder per D-13)*
Six tests, each closing with `assertNoJavaScriptErrors()`. Per [coverage-policy.md](../../docs/testing/frontend/coverage-policy.md), browser tests earn their place only where the real-DOM/JS round trip **is** the risk.
- [ ] **B-1 — a real click on a tab actually switches it.** The compiled-attribute case: this is the shape that made every Sales Regions row toggle a dead no-op with no PHP error, no console error and no failed request, and **`Livewire::test()` passes against a page where every tab is inert**. See **D-10**.
- [ ] **B-2 — the description swaps in the `wire:ignore`d region.** Three assertions, all load-bearing: the region **contains** the French fixture string, scoped to `[data-test="wysiwyg-editor-region"]`; the region **does not contain** the Spanish one — *this half is the actual test*, since an implementation that appends, renders both visibly, or leaves a stale copy passes the first half while being wrong; and no JS errors. The fixture needs **both** languages populated with distinct strings, or both assertions are trivially satisfiable and the test asserts nothing.
- [ ] **B-3 — unsaved input survives a switch, read off the DOM**, not off the property. Only this level catches a re-render dropping the rendered value while the property survives.
- [ ] **B-4 — a typed draft survives a switch past the 400 ms debounce.** Uses a short bounded `->wait(1)` — the [documented carve-out](../../docs/testing/frontend/playwright-setup.md#waiting-one-call-is-banned-in-this-repo-and-one-is-bounded), in its strongest form, because the reason is a **contract**: 0021's **D9** debounces `$wire.set` at 400 ms. The comment must say exactly that. `->waitForEvent('networkidle')` is **banned outright**.
- [ ] **B-5 — a non-active tab's refusal is visible without further clicking** (**D-14**).
- [ ] **B-6 — the slug pre-fill fires on a real blur** and does **not** overwrite a slug that is already set (**D-9**). A client-side pre-fill is invisible to every server-side test.

### Deliberately NOT tested here
Redundant-coverage discipline, per [what-not-to-test.md](../../docs/testing/qa/what-not-to-test.md). This story proves the **screen and its wiring**; it never re-derives a dependency's covered logic.

| Not tested here | Owner |
| --- | --- |
| `translated()`'s fallback chain, the `''`-is-absent rule, the default-language memo, `withTranslationsFor()`'s query bound | 0070 |
| Per-field fallback **as a mechanism** (0076's **D-3** fixture) — this story asserts only what the *form* shows | 0076 |
| The HTML sanitiser's allow-list, scheme rules and idempotence; the direct-`SetTranslation` bypass | 0024 **D-16** / 0076 **D-8** |
| Slug canonicalisation **as a model hook**; the backfill; the FK-vs-duplicate-slug misattribution | 0076 |
| SKU canonicalisation and its global uniqueness — a diff to `ProductSkuUniquenessTest.php` is itself a review finding (0076 **D-7**) | 0024 |
| The WYSIWYG's tag emission, caret restore, toolbar `aria-pressed`, link sanitisation | 0021 |
| The media gallery's search/upload/tile cap; the multi-select's debounce; `SearchSalesRegions`' matching | 0019/0020, 0022, 0026 |
| `StoreLanguage` CRUD and the add/remove/default-swap invariants | 0068 |
| `ProductPolicy` asked **directly** via `Gate::forUser(...)` — this story asks it *through the component*, the layer 0076 deliberately does not exercise | 0076 |

## Expected outcome

A catalog administrator opening `products/{product}/edit` sees a tab per active store language, defaulting to the store default's tab. Switching tabs swaps the five translatable fields — including the rich-text description — with no round trip and no loss of unsaved work, while the SKU, category, type, status, price, stock, imagery and sales regions stay on screen once, unchanged. Saving writes the default language through `CreateProduct` / `UpdateProduct` and every other **filled-in** language through `SetProductTranslation`, all inside one transaction; a tab left wholly blank writes nothing and the language keeps falling back. A refusal in any language marks that language's tab, activates it, and leaves every table unwritten. A language the editor never offered cannot be written to at all, whatever the payload says — and the same refusals hold for a caller with no editor at all, because `SetProductTranslation` authorizes and validates on its own.

## Acceptance criteria

- [ ] One tab renders per **active** store language (0068's `scopeActive()`), ordered default-first; the default's tab is active on load.
- [ ] The five translatable fields — `name`, `description`, `slug`, `meta_title`, `meta_description` — render **inside** the tab panels, once per language.
- [ ] `sku`, `product_category_id`, `type`, `status`, `price`, `stock`, imagery and sales regions render **exactly once**, outside the panels, and are unaffected by a tab switch.
- [ ] Switching tabs performs **no** server round trip and **no** write of any kind.
- [ ] Switching tabs preserves unsaved input in the tab being left, including rich-text content typed within the last 400 ms.
- [ ] The rich-text description shows the **active** language's content and not any other's, verified against the rendered DOM rather than the bound property.
- [ ] `save()` authorizes at the top, keyed `create` vs `update` (**D-8**) — **and** `SetProductTranslation` authorizes `products.edit` and validates independently, so a direct caller with no component is refused identically (**D-17**). **Both layers, neither optional.**
- [ ] Every non-default language is written through `SetProductTranslation`; **`SetTranslation` appears in no import under `app/Livewire/`** (**D-17**, greppable).
- [ ] `save()` reads each field array by the **server-derived** active-language list; a key naming any other language is dropped before validation and never written (**D-3**), and the action's typed `StoreLanguage` parameter closes the same hole structurally.
- [ ] An untranslated tab hydrates from its **own** translation row and renders **empty** — never from `translated()`'s fallback (**Q-1**, resolved).
- [ ] A wholly blank non-default tab writes **no row** and raises no error; an *engaged* tab requires `name`; a *blanked* previously-translated tab is refused (**D-18**).
- [ ] A blank optional field is persisted as `NULL`, never `''`, so two products may share an absent slug in one language (**D-4**).
- [ ] Slug uniqueness is refused per language and permitted across languages, judged on the **canonical** form.
- [ ] A refusal in a non-active language marks that tab and makes it active; no page-level duplicate outlet is added (**D-14**).
- [ ] An empty slug pre-fills from its **own** language's title on blur, and a non-empty slug is never overwritten (**D-9**).
- [ ] No `wire:model`-bound value is ever `null` — including every one of the 5 × N nested leaves.
- [ ] The tab strip's dynamic attribute values use `{{ Js::from(...) }}`, never `@js(...)` (**D-10**), verified against **compiled output** rather than the absence of an error.
- [ ] The `data-test` hook family of **D-11** is present, on every branch of every control.
- [ ] No new permission, ability, policy, route, migration or `config/modules.php` entry; the catalog stays at **42**. **Exactly one action is added** (`SetProductTranslation`); 0024's and 0076's five existing Product actions, 0070's `SetTranslation` and `ProductValidationRules` are all **unmodified**.
- [ ] `lang/en/products.php` and `lang/es/products.php` stay key-for-key identical; no user-facing string is hardcoded in the view.

## Definition of Done

- [ ] Tests written and green — including the six browser tests, which are the only level that can observe three of this story's failure modes
- [ ] Code reviewed (`code-reviewer`)
- [ ] No security findings (`appsec-auditor`) — **point the audit at: both layers of the per-tab write path (a `products.view` actor must be refused by the component *and* by `SetProductTranslation` called directly, D-17); that `SetTranslation` is reachable from nowhere but the action (grep `app/Livewire/`); that the action's error key is derived from `$language->id` and never accepted as a parameter; D-3 (client-controlled keys, now closed at both layers); D-4 (`''` vs `NULL`); D-6 (a sanitiser call site inside a component, and a second inside the action); `$originalTranslatedLanguageIds` being `#[Locked]` while the five field arrays are not (D-2, D-18); and the residual asymmetry D-17 names — the *translation* path is now two-layer while the *core-field* path is still one-layer via 0024's RQ-10**
- [ ] Q-1, Q-2 (human, 2026-08-30) and Q-3, Q-4 (0071) are reflected everywhere downstream — Gherkin, tests, AC and decisions — with no surviving text that treats them as open
- [ ] Documentation updated (`docs-keeper`) — this is the app's **first** language-tabs screen and the first reusable tab component; the state-shape convention in **D-15** must land somewhere 0071/0073/0075 will find it
- [ ] Acceptance criteria met
- [ ] ✅ Q-1 and Q-2 answered (human, 2026-08-30); Q-3 and Q-4 closed by 0071. **Q-5 is the only one left and belongs to the 0027 amendment**, so it does not gate this story's Phase 3
- [ ] The four [Reconciliation with 0071](#reconciliation-with-0071--four-conflicts-found-after-this-file-was-written) conflicts are settled at Phase 2 — **C-2 needs a human decision**, the other three have a stated winner

## 4. Documented functional decisions

**D-1 — The description problem is solved by rendering one `WysiwygEditor` per active language, all mounted, hidden with CSS — never by re-keying a single instance. (`frontend-expert`'s Option A, adopted over `frontend-qa`'s recommendation; the two amigos disagreed and the disagreement is recorded rather than smoothed.)** 0021's **D9** is explicit that the `wire:ignore`d region seeds from `$value` at client initialisation **only** and that a server-side write does not appear in the editor — and that the component has **no** refresh hook. Four options were weighed:

| Option | Verdict |
| --- | --- |
| **(a) N instances, all mounted, Alpine `x-show`** | **Adopted.** Each instance seeds once from **its own** `$value` at its own init, so programmatic replacement never happens and 0021's missing hook is never needed. **0021 is consumed byte-for-byte unmodified** — the only option that is both correct today and respects "this story edits no other story's file". |
| (b) One instance, re-keyed on the active language id | **Rejected.** `frontend-qa` recommended it as *"cheap and needs no edit to 0021 … discards caret/undo state, which is acceptable on a deliberate tab change"*. `frontend-expert` found the sharper objection and it is decisive: **it discards typed text, not merely caret state.** A re-key requires a server round trip, and 0021's **D9** syncs out on a **400 ms debounced** `input` — so typing and then switching tabs within 400 ms silently loses up to 400 ms of text, with no error, invisible to `Livewire::test()`. It also tears down and rebuilds the nested `Gallery` on every switch. |
| (c) Alpine reaching into the `wire:ignore`d region to swap `innerHTML` | **Rejected.** Reaching past a component's public surface into a region another story declares client-owned; the first 0021 change breaks it silently. |
| (d) Amend 0021 with `setContent()` + `flush()` client hooks | **Rejected for this story; recorded as the fallback.** Architecturally the cleanest single-instance answer and 0021 predicted it — but it edits an unimplemented story's contract, so it is a coordination action, and it needs **two** hooks not one (`setContent` alone still loses the outgoing debounce). If (a)'s page weight proves unacceptable, this is what replaces it. |

⚠️ **`@if` instead of `x-show` is the silent killer**, and it will look like an optimisation. It reintroduces (b)'s data loss *and* remounts the child, with no error and nothing visible to a component test. **B-3's browser test is the only thing that catches it**, which is why the rendering test additionally asserts all N panels are in the DOM at once.

**D-2 — ⚠️ REVISED to 0071's shape: five parallel arrays keyed by store-language id, not one nested array — see [C-4](#reconciliation-with-0071--four-conflicts-found-after-this-file-was-written).** `public array $names`, `$descriptions`, `$slugs`, `$metaTitles`, `$metaDescriptions`, each `array<string, string>` keyed by store-language id — plus `#[Locked] public array $languages`, `#[Locked] public string $defaultLanguageId`, `#[Locked] public array $originalTranslatedLanguageIds` (**D-18**) and the unlocked `public string $activeLanguageId` (**D-7**), all server-derived in `mount()`.

**Why this reverses the first draft.** This file originally specified one `public array $translations` keyed by language with nested field leaves, giving error keys `translations.{id}.{field}`. [0071's **D-13**](0071-product-categories-language-tabs-ui.md) specifies the multi-field form of its master contract as **`"{$field}s.{$language->id}"`** and names *"the derived-not-parameterised error key"* as one of three things a sibling **must not re-derive**. The error key and the state shape are not independent in Livewire — Flux's `wire:model` error integration and `SupportValidation`'s `Utils::hasProperty()` filter both key off the property path — so adopting 0071's key **is** adopting parallel arrays. The nested shape's advantage was real but small (one loop instead of a zip across five arrays); consistency across four sibling screens and one shared strip is worth more, and **`SetProductTranslation`'s `Validator` above is already written to these keys**, so the file is internally consistent only this way.

- **Keyed by id, not `code`** — `SetProductTranslation` takes a `StoreLanguage` **model** and 0076's `slugRules(string $storeLanguageId, …)` takes the id, so keying by code means a lookup at every use. UUIDs contain no `.`, so `names.019a…-…` resolves correctly as a validation key. This also matches 0071's **D-11** hook keying (**C-3**).
- **Not flat properties for the active tab only** — that puts unsaved non-active input in a server stash a forged payload can rewrite, and makes "show me every error" impossible without a second parallel structure.
- **camelCase array names** (`$metaTitles`) match 0076 **D-18**'s new parameters and make the `attributes` lang leaf byte-identical to the property path — the [camelCase-`attributes`-leaf exception](../../docs/conventions/naming.md) task 0017 established. The snake_case column names appear at exactly **one** place: `SetProductTranslation`'s `SetTranslation` attribute array.
- **None of the five arrays can be `#[Locked]`** — they are the `wire:model` targets, exactly as 0021 leaves `$value` and 0027 leaves `$regionIds`. That is what makes **D-3** necessary rather than optional, and it now applies to **five** arrays rather than one. `$originalTranslatedLanguageIds` **is** locked, because **D-18**'s branch reads it: a forged value would let an actor blank away an existing translation without tripping the refusal — 0071's **D-3** reaches the identical conclusion for the identical reason.
- ⚠️ **One consequence of the reversal worth stating**, since it is easy to miss: `Utils::hasProperty()` now resolves five separate declared properties instead of one, so a stale error bag persists per field-array. The stale-error test in the plan is unchanged in intent but must be written against whichever array it targets.

**D-3 — `save()` iterates the server-derived active-language list and intersects the client payload against it, before validating. (Found independently by both amigos — `frontend-expert`'s F-C and `frontend-qa`'s T-3 — which is the strongest signal in this debate.)** Because **D-2** leaves `$translations` unlocked, its **keys** are client-controlled, and those keys are written straight into a `store_language_id` FK column. A forged payload naming a real-but-inactive language (0068's **D5** makes removal an `is_active` flip, so the row still exists and the FK accepts it) writes a translation into a language the store has removed, which `translated()` will later resolve happily. Not privilege escalation — **data injection into a table every product render reads**.

The rule: `save()` builds `$languages` from `StoreLanguage::query()->active()->get()` and reads each field array **by that list's ids** — `$this->names[$language->id] ?? ''` — **before** `validate()` and before the write loop. Keys outside the set are dropped silently: not validated, not written. This is 0026's **D12** (`salesRegionIdRules($preserved)` reads server-side, never from the request) applied to a second screen, and the [errors-log's *guard took the state it was guarding as a parameter*](../../docs/errors-log.md#a-guard-took-the-state-it-was-guarding-as-a-parameter-reopening-its-own-hole-one-level-up--2026-08-20) shape one level down. ❌ **`foreach ($this->names as $id => $value)` is the bug**, and it is the natural way to write it — now in **five** places rather than one, since **D-2**'s revision makes every field its own iterable array.

> ✅ **Since 2026-08-30 this hole is closed twice over, and the second closure is structural rather than disciplined.** **D-17**'s `SetProductTranslation` takes a **typed `StoreLanguage` model**, never an id — so a caller must already have resolved (and therefore narrowed) the language before it can call at all, and there is no key left for a forged payload to smuggle. The component's intersection is the fail-fast layer; the action's signature is the one that binds a caller this story will never see. **Neither is optional**, and a reviewer removing either has removed a layer rather than a redundancy.

**D-4 — A blank optional field becomes `NULL` at exactly one boundary, and this closes a latent data-corrupting save failure nothing upstream names. (`frontend-expert`'s F-A — the sharpest finding in this debate.)** Two established rules collide here for the first time. The [`null`-`<select>` entry](../../docs/errors-log.md#a-null-livewire-property-bound-to-a-native-select-silently-dropped-the-users-own-pick--2026-08-16) and 0027's **D-5** require that **no `wire:model`-bound property is ever `null`** — so every one of the 5 × N leaves is `string` with `''` meaning empty. But 0076's **D-6** ships `UNIQUE(store_language_id, slug)`, and 0076's own test list requires that *two products may both hold a `NULL` slug in the same language* — a property MySQL gives for `NULL` and **not** for `''`.

So the first product saved with an empty French slug stores `''` and succeeds; the **second** dies on a `23000` surfacing as *"this slug is already taken"* against a slug the administrator never typed and cannot see. **It is invisible until the second row exists, invisible in every single-fixture test, and its trigger is leaving a field blank.**

The rule: `''` → `null` conversion happens at **the action boundary** — inside `SetProductTranslation`, where its `?string` parameters become `SetTranslation`'s attribute array — and applies uniformly to `slug`, `meta_title`, `meta_description` and `description`. Not per-field, not conditionally. ✅ **D-17 improves on this decision's first form**, which put the conversion in `save()`: a caller with no component now inherits it too, so `''` cannot reach the column by any path. `name` is exempt (it is `NOT NULL` per 0076's **D-2**, and **D-18** governs when it is required at all). Normalising the other three matters even without a constraint to violate: 0076's backfill writes `NULL` (its **D-9**), so a mixed estate makes *"a field emptied rather than left unwritten still falls back"* pass through two code paths, with `translated()`'s `!== ''` guard as the only thing papering over it.

**D-5 — Save composition: 0027's D-12 ordering survives unchanged; the translation loop goes inside its transaction.** Authorize → read server state → **narrow the payload (D-3)** → **sanitize (D-6)** → validate → `resolveSelected()` → open transaction → create/update (which syncs the gallery) → **`SetProductTranslation` per *engaged* non-default language (D-17, D-18)** → sync regions. A `ValidationException` must never travel through an open transaction (0026's **D13**), and every new step this story adds sits **before** the transaction opens.

The default language is written by `CreateProduct` / `UpdateProduct` through 0076 **D-18**'s widened signature; every **non-default** language is written through **`SetProductTranslation`** (**D-17**) — **never** through `SetTranslation` directly. 0070's **D-12** named the raw primitive as the pattern because no better caller existed when it was written and it explicitly deferred to *"whichever action the UI story adds"*; that action is **D-17**'s, and it is what the component calls. Skipping the default in the loop is clarity rather than correctness — a second write would be an idempotent no-op, but it would issue a redundant query and re-sanitize.

**Only an *engaged* non-default tab is written at all**, per **D-18**: the loop skips a language whose five fields are all blank and which held no translation before this edit, so an untouched tab creates no row and the language keeps falling back through `HasTranslations`.

⚠️ **Transaction nesting is now three deep** — this story's outer boundary → 0076 **D-15**'s new one inside `CreateProduct`/`UpdateProduct` → 0024 **D-17b**'s inside `SyncProductGallery`. Laravel turns each inner one into a savepoint, but 0076's **R-15** already demands this be **proven by execution rather than asserted** at two levels, and this story adds a third it did not anticipate. Same gate applies. See **R-6**.

**D-6 — Every language's description is sanitized before `validate()`, not only the default's. (`frontend-expert`'s F-B; flagged for Phase 2 rather than adopted quietly.)** 0024's **D-16** constraint 1, restated by 0076's **D-8**, is that the actions sanitize **before** `validate()`, so a description whose *pre*-sanitisation length exceeds `max:65535` but whose sanitized form does not is **accepted**. 0076's **D-8** adds the `ProductTranslation::saving` hook as layer 2 — correct as a security backstop, and exactly what makes the direct-`SetTranslation` path safe — but a `saving` hook fires **after** validation and therefore does **not** restore the ordering.

The consequence is produced entirely by this story and 0076 could not see it, because its scope fence excludes the caller: without a fix, the default language keeps the ordering (it goes through the actions) and every other language loses it. **A 70 KB paste that sanitizes to 10 KB would be accepted on the Spanish tab and refused on the French one, in the same form, on the same save.** ✅ **D-17 makes this structural rather than remembered**: `SetProductTranslation` sanitizes as its own second statement, *before* its `Validator` call, so the ordering is restored for every caller and not only for `save()`. The component sanitizes too (**R-14**) — deliberately, and the action's pass is the one that must survive a reviewer trimming the duplication.

So `save()` runs `SanitizeProductDescription` over each non-default language's description before `validate()`, mirroring the actions. This is a **third call site, never a second allow-list** — which 0076's **D-8** explicitly permits — and it is safe only because 0024's **D-16** constraint 2 already requires and tests idempotence. ⚠️ **It puts a sanitiser call inside a Livewire component, so it needs 0024's and 0076's blessing at Phase 2.** *Rejected:* accepting the asymmetry and documenting it — a validation rule that fires on one tab and not another, for the same input, is what an administrator reports as *"the form is broken"* and nobody can reproduce.

**D-7 — ⛔ SUPERSEDED IN PART by 0071's D-2 — see [C-2](#reconciliation-with-0071--four-conflicts-found-after-this-file-was-written).** The **active tab is tracked server-side** as `public string $activeLanguageId`, switched through the `setActiveLanguageTab(string $languageId)` method 0071's strip hardcodes a call to. What survives from this decision is the *other* axis, which 0071 bundled with it and which this story cannot concede: **the panels stay mounted (`x-show`), never `@if`** (**D-1**) — 0071's own ⚠️ already names that as its fallback and calls it *"a markup change, not a redesign"*. The reasoning below is retained because it is the argument for the half that survives, and because 0071's decisive point — *"a validation error can land on any tab, and only the server knows which"* — is the same problem **D-14** solves, more simply, once the active tab is a server property.
>
> ~~Tab switching is client-side Alpine with no round trip, and the server steers exactly one case.~~ Every panel is live (**D-1**), so visibility is presentation and nothing more; no round trip means nothing can race the WYSIWYG's debounce; and unsaved input in a hidden tab is safe **by construction**, since every input stays in the DOM and stays bound. That last property is the strongest argument for the whole design. Precedent: 0018's Sales Regions screen already uses an Alpine chevron *"with no round trip"* and an Alpine text filter — the house pattern for purely presentational state.

*Rejected:* `wire:click="switchLanguage($id)"` — a round trip per switch, a race with the debounce, and it makes the active tab a server property a forged payload can point at a non-active language: one more client-controlled input to validate for zero gain. Its only advantage (render one panel) is precisely **D-1**'s `@if` hazard.

**The one server-steered case** is **D-14**'s focus-on-refusal: `save()` catches its own `ValidationException`, dispatches `$this->dispatch('products-focus-language', languageId: …)` and rethrows. That is 0021's **D6 step 5** pattern reused — a same-component `$this->dispatch()` is a **bubbling** `CustomEvent` from that component's own root, so a **scoped** `x-on:` listener with **no `.window` modifier** catches it with zero collision risk (0021's **V8**). Do not use a page-global listener; it would need 0021 **D5**'s uniqueness machinery for no reason. ⚠️ But see **R-8** — the event name must be derived per-instance *now*, not after it costs a debugging session.

**D-8 — One `Gate::authorize()` at the top of `save()` is the entire perimeter, and adding a second one above the translation loop would be a bug.** Abilities are `products.create` / `products.edit` through `ProductPolicy::create()` / `update()`; route middleware stays `can:products.view` (0027's **D-2**), unchanged. Reasoned out rather than assumed:

1. 0070's **D-9** is explicit that `SetTranslation`'s correct ability is *a property of the calling operation, not of itself*, and that the caller authorizes before invoking it. The calling operation here is **one** operation — "save this product, in every language" — not N operations.
2. A second `Gate::authorize('update', $saved)` above the loop would be **actively wrong on the create path**, reproducing the exact counter-example 0070's **D-9** was written against: an actor holding `products.create` but not `products.edit` could create a Spanish-only product and would be 403'd for typing a French title **in the same form**. That is the create/update permission split, one story later.

⚠️ **0076's D-16 means this component is the *only* authorization anywhere in the write path — not the outer of two layers.** `CreateProduct`/`UpdateProduct` deliberately do not self-authorize (0024's **D-15**, confirmed at its **RQ-10**); `SetTranslation` authorizes nothing (0070's **D-9**). 0076's **D-16** instruction (b) — *"do not read it as safe"* — lands on **this file**. `AuthorizationTest.php` must assert a `products.view`-only actor cannot reach the translation write **through the component**, not merely that the policy would refuse.

Also: `mount()` on the edit path now **discloses** every language's content, which is [livewire-authorization.md](../../docs/security/livewire-authorization.md)'s *"gate every method that mutates **or discloses**"* rule. 0027's `mount()` already authorizes; this story widens what that gate protects. And `prefillSlug()` mutates component state, so it authorizes too — cheap, and it keeps the "every mutating method authorizes" claim true without an exception to explain.

**No new ability, no `ProductTranslationPolicy`, no `store-languages.*` requirement** — 0076's **D-16** / 0070's **D-13** / 0068's **D18**: authoring content in a language is *using* a configured language, not managing the catalog. The catalog stays at **42**.

**D-9 — The slug pre-fill is server-side, on blur, per language, and only into an empty field.** 0076's **D-6** assigns this affordance to the editor by name (*"deriving it from the name is a **UI affordance** (0027's editor pre-fills the field), never a model hook"*) — but 0027 has no slug field, because the slug arrives in 0076. **So the affordance is this story's, asserted as existing by a story that could not deliver it**, and this decision adopts it explicitly rather than leaving it stranded.

| Question | Answer |
| --- | --- |
| Per language? | **Yes** — the French slug pre-fills from the **French** name, never from the default's. A blank slug is a legitimate persisted state (**D-4**), not a hole to fill from elsewhere. |
| When? | On **`blur` of that language's name input**, and **only when that language's slug is currently empty**. |
| Live? | **No.** `wire:model.live` on a name field is a round trip per keystroke and would produce a slug for a half-typed name the administrator then has to delete. |
| Client or server? | **Server**, via `wire:blur="prefillSlug('<languageId>')"`. |

**Why server-side is fidelity rather than preference.** The client cannot compute `Str::slug()`. A JS `slugify` and PHP's `Str::slug()` (which routes through `Str::ascii()` transliteration) diverge on exactly the characters a Spanish/French catalog uses — `ñ`, `ç`, `ü`, and `ß` → `ss`. A client pre-fill would display one slug while the model hook stored another, silently, on save. One round trip per name-blur is a fair price.

**Four things that must NOT happen**, each a plausible-looking wrong turn: never overwrite a non-empty slug (on blur, on a later name change, or on save — once typed, it is the administrator's, which is the whole content of D-6's *"administrator-owned identifier"*); never derive on `save()` when the slug is blank (that invents a URL nobody reviewed — precisely what 0076's **D-9** rejects for the backfill, arriving through the form instead); never copy the default language's slug into an untouched language; and never auto-suffix on collision (0076's **D-6** rejects the suffix convention explicitly, and a duplicate slug is a refusal the administrator can act on — the entire argument for a typed slug over a derived one).

**D-10 — The tab strip is an anonymous Blade component, so every dynamic value in its attributes uses `{{ Js::from(...) }}` and never `@js(...)`. (Both amigos reached this from opposite directions.)** This repo has no `app/View/Components/`, so a reusable tab strip is necessarily an anonymous component — and the [errors-log entry's **2026-08-26 correction**](../../docs/errors-log.md#two-directive-calls-in-one-blade-component-tags-attribute-string-silently-fail-to-compile--2026-08-26) records, **verified by execution**, that **`@js()` inside an anonymous `<x-…>` component's attribute is uncompiled at *any* count, including one**. The argument count was never the discriminator; the component is.

So the natural design for this story (a per-language anonymous component) sits exactly on the one shape that is broken outright. If the tab controls' `wire:click` / `x-on` arguments were written with `@js()`, **the entire tab strip would be silently dead** — no PHP error, no console error, no failed request, and `Livewire::test()->call('switchLanguage', $id)` passing the whole time. **B-1 exists for this.** The acceptance criterion requires verifying **compiled output**, not the absence of an error.

**D-11 — Flux Free ships no tabs primitive, so the tab strip is hand-rolled. (Facilitator verification.)** [`composer.json`](../../composer.json) requires **`livewire/flux` `^2.13.1` only — there is no `livewire/flux-pro`** — and `flux:tab.group` / `flux:tabs` are Pro components. There is no `vendor/` directory, so this could not be settled by execution, but the dependency list is unambiguous. This is the fourth consecutive story to hit the same wall for a different primitive (0020's **V5**, 0021's **V10**, 0022's **D10**), and each hand-rolled. **Do not put `flux:tab` in the acceptance criteria**; the anonymous component's internals are `flux:button`s plus `role="tablist"` / `role="tab"` / `aria-selected`. Phase 3's first command is `ls vendor/livewire/flux/stubs/resources/views/flux/ | grep -i tab`.

**D-12 — The disabled-state and tooltip traps are carried forward verbatim.** Any tab or per-language control rendering disabled uses a written-out `@if`/`@else` with an explicit `<flux:tooltip>` wrapper — **never** `:tooltip="$cond ? … : null"`, which Blaze treats as *present* whenever the attribute is written on the tag — and `cursor-not-allowed!` on that wrapper rather than on the `pointer-events-none` button. Any disabled-state test helper matches `disabled="disabled"`, **never** a bare `disabled` substring, which Flux's own `disabled:opacity-75` class carries on the **enabled** branch too.

**D-13 — Browser tests go in the mirrored subfolder `tests/Browser/Products/`.** [playwright-setup.md](../../docs/testing/frontend/playwright-setup.md#folder-structure) records that **a story file naming a test path is making a convention decision, and the path belongs in the Phase 2 review** — twice now that step was skipped and the mirrored convention lost by default, leaving two flat files (`UsersIndexTest.php`, `SalesRegionsIndexTest.php`) that are **recorded debt, not precedent**. This story states the choice explicitly, and it matches what 0027 already chose for its own two browser files.

**D-14 — A refusal marks its tab and activates it; there is no page-level error outlet.** Three layers, each catching what the others miss: (a) a per-tab indicator derived server-side by taking the segment after the dot from every error key matching the five field-array prefixes (`names.`, `descriptions.`, `slugs.`, `metaTitles.`, `metaDescriptions.`), rendered only when that language has errors so **absence is the assertion**. That derived list is exactly what 0071's strip takes as its `errorLanguageIds` prop, so this story feeds a component contract rather than rendering its own marker; (b) auto-activating the first erroring tab in **tab order**, via **D-7**'s scoped dispatch — without it, an administrator on the Spanish tab clicks Save, the French slug is refused, and **the page appears to do nothing**, which is 0018's finding A-1 (*"the click looked frozen"*) and its B1 arriving together; (c) field errors rendering inside their own panel through Flux's `wire:model` error integration, plus one explicit `<flux:error>` beneath each WYSIWYG, which 0021's component does not render.

⚠️ **No page-level outlet.** 0018 needed one because an inline row toggle could refuse from outside its modal; here every `translations.*` error has a field on screen inside exactly one panel, so a page-level outlet would render the message **twice** whenever its tab is also visible — the double-render 0018's `@unless ($showModal)` guard exists to prevent. And 0018's blocking **B1** (a persisted error bag surviving a cancel) does **not** bite here: the editor is a **routed page** (0027's **D-1**), so navigating away is a fresh mount and no `resetValidation()` is needed. **Stated so it stays true** — the day someone puts this editor in a modal, it is needed.

**D-15 — ⛔ REVERSED by 0071 — see [C-1](#reconciliation-with-0071--four-conflicts-found-after-this-file-was-written). This story is a *consumer* of the tab pattern, not its author.** When this file was written, `ai-spec/tasks/` jumped 0070 → 0072 → 0074 → 0076 → 0078 with no 0071/0073/0075 — verified twice, and true at that moment — so this decision proposed the shared component. **0071 shipped it minutes earlier**, as `resources/views/components/language-tab-strip.blade.php`, and named this story as one of four consumers. The parts of this decision that survive are the two arguments 0071 reached independently and this story now merely confirms: **the extracted part is the strip, not a multi-field form builder** (0071's D-1 makes the same call, and this story is the evidence for it — a five-field panel and a one-field panel share the strip and nothing else), and **not a trait**, because a trait carrying `$translations` and a generic `save()` would be parameterised by exactly the field list it was extracted to hide.

Reusable: `resources/views/components/language-tabs.blade.php`, which renders the strip, the default badge, the per-tab error indicator and the panel wrappers, taking the panels' *contents* as a `$slot` so it knows nothing about fields. Plus the **state-shape convention**: `$translations` keyed by language id with `string` leaves; `#[Locked] $languages` built server-side; **`save()` iterates `$languages`, never `array_keys($translations)`** (**D-3**); `''` → `null` at one boundary (**D-4**); and the `language-tab-{code}` / `language-panel-{code}` hook family.

**Not a trait**, because a taxonomy screen translates **one** field: a trait carrying `$translations` and a generic `save()` would be parameterised by exactly the thing it was extracted to hide. The strip is the genuinely identical part.

⚠️ **The hard part of this story does not transfer, and saying so is the point.** **D-1** exists entirely because of the WYSIWYG's client-owned region. A taxonomy screen has one `flux:input` per language and no such region, so **D-1** collapses to *"render N inputs, hide all but one"* and needs no argument at all. Without this sentence, three taxonomy authors will each re-derive multi-instance reasoning for a case that does not have the problem.

**D-16 — ⛔ SUPERSEDED ON THE KEY by 0071's D-11 — see [C-3](#reconciliation-with-0071--four-conflicts-found-after-this-file-was-written); the hook *inventory* below still stands.** This decision keyed the hooks on the language `code` so a browser test would have a seed-stable selector. **0071 keys them on the `id`** (`data-test="language-tab-{id}"`) and goes further, forbidding any assertion that matches on a language *name or code* at all — because a two-letter code is precisely the kind of token that collides with unrelated page text, which is this repo's own [`assertSee('0%')`-inside-`10%`](../../docs/testing/frontend/playwright-setup.md) trap. That reason is better than this one, and the seed-stability problem it was solving is handled by capturing the id in the fixture. **Adopt the id.** What is *not* superseded is the inventory — the hooks this screen needs beyond the strip's own.

The hook family, **keyed by `{id}` per C-3**, each present on **every** branch of its control. The strip's own — `language-tabs`, `language-tab-{id}`, `language-tab-default-badge-{id}`, `language-tab-error-{id}` — come from 0071's component and are **consumed, not defined here**. This story defines only the panel and field hooks: `language-panel-{id}`, the four inputs `product-{name,slug,meta-title,meta-description}-{id}`, and `product-description-editor-{id}` wrapping each WYSIWYG — so 0021's own `wysiwyg-*` hooks, which now repeat N times, are always addressable within a scope.

⚠️ **This story must also add hooks 0027 does not promise.** Verified against 0027: it names `data-test` hooks only for **list row actions** plus the ones 0020 and 0021 already mandate. The editor's non-translatable inputs — `product-sku-input`, `product-price-input`, `product-stock-input`, `product-status-select`, `product-type-select`, `product-category-select` — have **no** promised hooks, and without them the "rendered exactly once" assertion, this story's highest-value cheap test, cannot be written at all.

**D-17 — Every per-language write is authorized and validated at *both* the component and a dedicated action. (Human decision, 2026-08-30: *"everything must be controlled from both front and back for security"*; the master pattern is [0071's **D-13**](0071-product-categories-language-tabs-ui.md), which names this story as a consumer.)** This story adds `App\Actions\Products\SetProductTranslation`, contract above.

| Layer | Where | What it enforces | Why it cannot be the only one |
| --- | --- | --- | --- |
| **1 — component** | `Editor::save()` | `Gate::authorize(create\|update)`, the active-language intersection (**D-3**), and the form-wide `validate()` that puts errors in the bag | It fails fast and it is what makes the *form* usable — but it binds **only this caller**. An Artisan command, importer or queued job inherits nothing from it. |
| **2 — action** | `SetProductTranslation` | `Gate::authorize('update', $product)` then its own `Validator`, then `SetTranslation` | It binds **every** caller, with no component in sight — and it is the layer a `Livewire::test()` structurally cannot prove, which is why it gets direct-call tests that mount nothing. |

**This closes a gap 0076's D-16 recorded and could not fix.** That decision found the whole product write path un-self-authorizing — `CreateProduct`/`UpdateProduct` by 0024's **D-15** (confirmed at its **RQ-10**), `SetTranslation` by 0070's **D-9** — and instructed: *"do not read it as safe … this story **widens** it, because `SetTranslation` adds a second, more generic entry point to the same data."* **D-17 narrows it back**: the new entry point is now the *guarded* one, and `SetTranslation` is reachable from nowhere but the action. ⚠️ **It does not close the gap for the core product row** — `CreateProduct` / `UpdateProduct` still self-authorize nothing, and this story has no mandate to change that (0024's **RQ-10** is a coordinator-confirmed decision). So after this story the *translation* path is protected at two layers and the *core-field* path at one, which is an asymmetry a reviewer should see as recorded rather than accidental.

⚠️ **0071's D-13 states the direction of the asymmetry and it is easy to get backwards**: component-only is **never** acceptable; action-only *is* acceptable where a component would have to duplicate a rule to add a layer. The test — *"if I delete the component, is the operation still protected?"* — must answer **yes**.

**D-18 — Q-2's resolution: a non-default language tab is all-or-nothing, and `name` is required only once the tab is engaged. (Human decision, 2026-08-30: a blank tab creates no row and the language simply stays untranslated.)** `product_translations.name` is `NOT NULL` (0076's **D-2**), so "write whatever they typed" is not available and the exact rule has to be stated. Three states per non-default language, evaluated **server-side** from the narrowed payload (**D-3**):

| State | Condition | Behaviour |
| --- | --- | --- |
| **Untouched** | all five fields blank, **and** the language held no translation before this edit | **Skipped.** No row written, no validation run, no error. The language keeps falling back through `HasTranslations` exactly as a never-translated one does. |
| **Engaged** | any one of the five fields non-blank | `name` becomes **`required` for that language**; the other four stay individually optional. |
| **Blanked** | all five blank, **but** the language *did* hold a translation (`$originalTranslatedLanguageIds`) | **Refused**, keyed `names.{id}`. Blanking is not a delete path — see **Q-4**, which 0071's **D-7** decides identically. |

**The default language is unconditionally required**, per 0070's **Q1(a)** (every entity always holds a default-language translation).

**Why `name`-only rather than all five required together.** The human's stated concern was *"silently saving with a `NULL` name and a real description"*, and requiring `name` on an engaged tab prevents exactly that — a row can never exist with content but no name. Requiring **all five** would also prevent it, but it directly contradicts 0076's **D-2**, whose stated reason for making the four SEO/description columns nullable is that *"an administrator who fills in a French name but has not yet written the French slug could not save at all — which would defeat the per-field fallback mechanism this very story exists to prove."* So all-or-nothing binds the **tab**, not the **field set**: the tab is either in play or it is not, and once it is in play only the `NOT NULL` column is mandatory. ⚠️ **"Engaged" is computed from the narrowed payload, never from a client-sent flag** — a boolean the client controls would be **D-3**'s hole in a new costume.

**D-19 — `SetProductTranslation` takes named parameters, not `array $fields`, and is called once per language rather than once per field.** 0071's **D-13** contract is `...$translatableFields`, and this is its first multi-field instance, so the choice needed making rather than inheriting. Three reasons for named parameters: **(a)** an `array $fields` is a pass-through surface — the action would have to whitelist the five keys anyway, and a forgotten whitelist is the [mass-assignment-is-not-an-integrity-guard](../../docs/conventions/base-standards.md#model-conventions) hazard `Media` already records, whereas named parameters make the whitelist **the signature**, unforgeable; **(b)** it matches 0076's **D-18**, which widened `CreateProduct`/`UpdateProduct` with three new named `?string` parameters rather than switching that same entity's actions to an array; **(c)** the required-vs-optional split is expressed in the signature (`string $name` against four `?string`), where an array hides it. *Rejected:* **per-field calls** — five `updateOrCreate` round trips per language, and a partially-applied language if the third throws. *Recorded cost:* seven parameters is a lot, and a sixth translatable field changes the signature for every caller — 0076's **D-18** already accepted that trade for this entity.

## Reconciliation with 0071 — four conflicts found after this file was written

[0071](0071-product-categories-language-tabs-ui.md) shipped the taxonomy tab pattern minutes before this file was written (see the ⛔ note at the top), and it explicitly binds this story: its technical-backlog item 2 requires 0073/0075/0077/0079 to *"reuse `language-tab-strip.blade.php`, expose `setActiveLanguageTab()`, and re-derive none of **D-2**, **D-6**, **D-7** or **D-8**."* Its **R-8** anticipates exactly this risk — *"the pattern this story sets is copied four times … any weakness in the strip's contract is reproduced by 0073/0075/0077/0079 before anyone re-examines it."*

**0075 adopted the strip; 0073 did not** (`grep -c "language-tab-strip\|setActiveLanguageTab"` returns 3 and 0). That inconsistency is a sibling-level gap, not this story's to fix, but Phase 2 should know the pattern is already 2-for-3.

| # | 0071's decision | This file's | Disposition |
| --- | --- | --- | --- |
| **C-1** | `resources/views/components/language-tab-strip.blade.php`, prop contract `['languages', 'active', 'errorLanguageIds']`, **strip only** — panels are the consumer's | **D-15** proposes `language-tabs.blade.php` taking the panels as a `$slot` | **0071 wins.** It shipped first, names this story, and its strip-only split is the better call for exactly the reason this story proves: a five-field panel and a one-field panel share the strip and nothing else. **This file's `language-tabs.blade.php` is withdrawn**; `resources/views/components/language-tab-strip.blade.php` is consumed unmodified, and this story's own file list must drop it as a *create* and treat it as a dependency. |
| **C-2** | **D-2** — tabs switch on a **server round trip**, `@if`-rendered panels, driven by `public string $activeLanguageId`; every consumer exposes `setActiveLanguageTab(string $languageId)` | **D-7** — client-side Alpine, no round trip; **D-1** — all panels mounted with `x-show` | **Split the axes; both are partly right — the sharpest reconciliation item and the one Phase 2 must actually decide.** These are *two* independent choices that 0071 bundled: (a) how the active tab is tracked, and (b) whether inactive panels stay in the DOM. **Adopt 0071's (a)** — a server-tracked `$activeLanguageId` plus `setActiveLanguageTab()`, whose decisive argument (*"a validation error can land on any tab, and only the server knows which"*) is the same problem this file's **D-14** solves with a dispatched event, and 0071's mechanism is simpler and already specified. **Keep this file's (b)** — panels **must** stay mounted via `x-show`, because `@if` tears down N `wire:ignore`d WYSIWYG regions, which is the whole subject of **D-1**. ✅ **0071 already anticipates this exact fallback**, in its own ⚠️: *"if it fails, D-2's panels must render with `x-show` … which is a markup change, not a redesign."* So the combined shape — server-tracked active tab, `x-show` panels — violates neither story. |
| **C-3** | **D-11** — hooks keyed by **id**: `data-test="language-tab-{id}"`; no assertion may match a language name or code | **D-16** — hooks keyed by **code**, so a browser test can select a stable value | **0071 wins, and its reason is better than this file's.** Keying on `code` was chosen here so a browser test has a seed-stable selector; 0071 forbids matching on a code *at all* because a two-letter code is exactly the kind of value that collides with unrelated page text. Its id-keyed hooks plus a fixture that captures the id are the safer form. **This file's D-16 is superseded on the key**; its list of *which* hooks are needed (the six editor inputs 0027 does not promise) still stands and is additive. |
| **C-4** | **D-8**/**D-13** — error keys are `names.{languageId}`, and **explicitly `"{$field}s.{$language->id}"` for a multi-field entity** | **D-2** (first draft) — `translations.{languageId}.{field}` | ⛔ **This row originally read "no conflict" and that was wrong — a re-read of 0071's D-13 found it *does* specify the multi-field form.** D-13 also names *"the derived-not-parameterised error key"* as one of three things a sibling must not re-derive. **0071 wins; D-2 is revised.** Because the error key and the state shape are coupled in Livewire (Flux's `wire:model` error integration and `SupportValidation`'s `Utils::hasProperty()` both key off the property path), adopting `{field}s.{id}` **is** adopting five parallel arrays — so this reverses D-2's "one nested array" bullet, whose advantage (one loop rather than a zip) was real but smaller than four-screen consistency. `SetProductTranslation`'s `Validator` is written to these keys, so the file is coherent only this way. |

**Two of this file's decisions are *confirmed* by 0071 rather than contradicted**, which is worth recording because they were reached independently: the never-`null` rule applied to every bound leaf (0071's **D-3** reaches the same place from the opposite direction, noting the trap is *structurally inapplicable* to its `@if`-driving `$activeLanguageId`), and **active-languages-only** — 0071's **D-5** already decides it, which means **Q-3 below is very likely closed rather than open**; see the note there.

## 5. Dependencies, risks, open technical questions

### Dependencies

- **[Story 0076](0076-translatable-content-retrofit-products-backend.md)** — hard, and **not implemented**. Supplies the widened `CreateProduct` / `UpdateProduct` signatures (**D-18**), `slugRules()` / `metaTitleRules()` / `metaDescriptionRules()`, the `product_translations` table and `scopeOrderByTranslatedName()`. Its **Q-1** and **Q-2** are both ✅ resolved (2026-08-30), so the five-field set and per-language slug uniqueness are settled inputs here rather than assumptions.
- **[Story 0027](0027-products-list-and-editor-ui.md)** — hard, and **not implemented**. Supplies the `Editor` component and view this story modifies throughout. See **R-2**.
- **[Story 0021](done/0021-wysiwyg-rich-text-editor-component.md)** — hard, and not implemented. Its **D9** is the constraint **D-1** is built around; consumed **unmodified**.
- **[Story 0070](0070-translatable-content-mechanism-product-categories-backend.md)** — hard. `HasTranslations`, `SetTranslation`, `defaultStoreLanguage()`, consumed unmodified. Its **Q3** is answered in part here (**R-4**).
- **[Story 0068](0068-store-languages-catalog-backend.md)** — hard. `StoreLanguage`, `scopeActive()`, `is_default`, `code`, `name`.
- **Stories 0020 and 0022** — the embedded `Gallery` and `SearchableMultiSelect`; consumed unchanged, but see **R-5** for the instance-count consequence.
- **No new Composer package**, and **no new permission** — the catalog stays at 42.

### Risks

- **R-1 — 0076's `R-1(a)/(b)` breaks live in files this story also opens, and must not be silently absorbed into it.** Dropping `products.name` breaks `App\Livewire\Products\Index`'s explicit-column `select()` / `orderBy('name')` and its `$deletingProductName`. Those are **0076's hand-off** (its technical task 1). They sit in `app/Livewire/Products/Index.php` and `resources/views/livewire/products.blade.php` — files this story deliberately does not touch — and the amendment must be written **once**, by whoever amends 0027, **before either story implements**. `tests/Feature/Products/IndexQueryTest.php` will therefore be **already red** when this story starts; that is not this story's regression and must not be "fixed" into it. Confirm its disposition before Phase 3, per the [deferred-findings rule](../../docs/errors-log.md#a-deferred-storys-findings-were-claims-about-a-tree-that-no-longer-existed-and-one-of-them-would-have-reopened-a-bug-in-this-log--2026-08-23).
- **R-2 — This story falsifies eight things in 0027, and every one is an amendment 0027 owns rather than an edit performed here.** *(1)* `Editor`'s public surface loses `public string $name` and `public string $description`, and its `<livewire:components.wysiwyg-editor wire:model="description">` snippet becomes a per-language binding. *(2)* **D-5**'s never-null table gains a fourth row — the rule now binds 5 × N nested array leaves, a different shape of the same rule. *(3)* **D-12**'s `save()` sketch needs the widened signature plus the `SetTranslation` loop; **the ordering survives unchanged**, stated explicitly because the temptation on reading it will be to assume it moved. *(4)* **D-8**'s arithmetic — *"three `Gallery` instances on one page"* — becomes **2 + N** (see **R-5**); 0021's **D5** derived-name mechanism holds at any N, so only the count is wrong, which is the [stale-arithmetic failure mode](../../docs/errors-log.md#a-docs-this-app-has-no-x-yet-claim-outlived-the-x-by-two-tasks--2026-08-13) at its most mechanical. *(5)* **D-1** gains corroboration rather than a correction: its argument 2 rejects a modal partly *because* `wire:ignore` makes a re-opened modal wrong, and the tabs are the same hazard **inside** the page. *(6)* **D-13**'s lossy-formatting notice becomes one above the tab strip rather than N copies of one sentence. *(7)* **D-14** step 3's re-entrancy assertion gets *stronger* (it now competes with two literals **and** N−1 sibling derived names), and its step 2 permission note gets sharper — the migrated harness tests now need `products.view` **and** `media.view` **and** at least two active store languages seeded, or the second panel never renders and the failure reads as a selector problem. *(8)* Its editor test files retarget.
- **R-3 — Three technical assumptions could not be verified, and one of them is design-gating.** No `vendor/`, nothing implemented. **(a) Does a dotted `wire:model` path bind a `#[Modelable]` child?** (`wire:model="translations.<uuid>.description"`.) Livewire supports dotted paths in ordinary `wire:model`; whether the parent↔child `#[Modelable]` binding resolves one is unexecuted. **This is the single assumption that would force a redesign** — if it fails, **D-1**'s Option (a) needs 0021's amendment after all (Option (d)). **Phase 3 technical task 1, before any markup is written.** **(b)** Does `validation.attributes` accept a wildcard leaf (`translations.*.metaTitle`)? Fallback is a `validationAttributes()` method with explicit per-language keys — mechanical. **(c)** Does Livewire's morph handle N sibling `wire:ignore`d regions given distinct `wire:key`s? Asserted from documented behaviour, not executed; a failure here would swap one language's content onto another's binding, which reads as corruption.
- **R-4 — ⛔ REWRITTEN: 0070's Q3 is *closed* by 0071, not open, and this story is a consumer rather than an author.** As written, this risk said *"no 0071/0073 file exists — still true, verified"*. That was true when verified and false minutes later. 0071 owns the taxonomy tabs and the shared strip; this story owns the **Products** tabs only. What remains genuinely open, and is now the real risk: **(a)** the four conflicts in [Reconciliation with 0071](#reconciliation-with-0071--four-conflicts-found-after-this-file-was-written), of which **C-2** needs a human decision rather than a merge; **(b)** `lang/{en,es}/components.php` — 0071 puts its copy in `lang/*/products.php` (its **D-10**, *"no new domain file"*), so this story's proposal to create `components.php` should be re-examined against that rather than adopted, and the 0021/0022 first-to-land hand-off may not need resolving at all; and **(c)** **the taxonomy screens are modals while this one is a routed page** (0025's category screen is a `flux:modal`, which 0027's **D-1** compares against directly), so 0071's strip must render correctly inside a native `<dialog>` *and* on a page — plausible for presentational markup, but untested until both consumers exist, and this story is the second one.
- **R-4b — Three sibling stories were written concurrently with this one and the pattern is already inconsistent between them.** `grep -c "language-tab-strip\|setActiveLanguageTab"` returns **3** for 0075 and **0** for 0073, so 0071's own **R-8** warning (*"any weakness in the strip's contract is reproduced by 0073/0075/0077/0079 before anyone re-examines it"*) has a sharper form than it anticipated: the contract is not being reproduced *uniformly*. Phase 2 should reconcile all four files against 0071 in one pass rather than story by story, since each was written without sight of the others.
- **R-5 — The page now mounts 2 + N `Gallery` instances, not three.** 0021's **D4** embeds one per WYSIWYG and 0027's **D-8** embeds two directly, so at three store languages that is **five**, each mounting and calling `Gate::authorize('viewAny', Media::class)`. Not a correctness problem — 0021's **D5** per-instance derived event name holds at any N — but a real page-weight and query-count one. Needs a bounded-query-count test **that can be proven to move**, per the count-assertion errors-log entry.
- **R-6 — Transaction nesting reaches three levels and 0076's execution-proof mandate now covers a level it did not anticipate.** **D-5**. 0076's **R-15** already asks that nesting be proven by execution at two levels; this story adds the third.
- **R-7 — The WYSIWYG's 400 ms debounce still races `save()`, and this story widens the blast radius without causing it.** **D-1** removes the tab-switch race; it does **not** remove "type, immediately click Save", a pre-existing 0027/0021 hazard. With 5 × N fields, "what did I lose" is bigger and harder to notice. The remedy is either a Save control that blurs the focused editor first (a variant of 0021's own `mousedown.prevent` toolbar rule) or a flush-on-blur in 0021 — **neither is this story's file to change unilaterally**. Coordination item.
- **R-8 — The focus-steering event name must be derived per-instance now, not later.** 0021's **V6** verified that Livewire registers listeners as page-global `window.addEventListener(name, …)` and that **the name string is the only thing separating instances**. **D-7**'s `products-focus-language` is scoped (`x-on:` on the component root, no `.window`), so it is safe **today** — but a screen mounting two tab strips, or a modal plus an inline strip, breaks silently. Derive it from the component id exactly as 0021's **D5** does.
- **R-9 — Every markup assertion on this screen now matches N times.** `assertSee('Nombre')` matches once per panel, and `assertDontSee` for a language is meaningless because every panel renders. The [count-assertion entry](../../docs/errors-log.md#a-count-based-assertion-over-rendered-html-counted-a-wrapper-element-it-never-meant-to-include--2026-08-21) applies verbatim, including its "include the delimiter that ends an element name" rule.
- **R-10 — This screen has no refusal logging, and neither 0027 nor 0076 mentions it.** `LogRefusedPrivilegedAttempt` and [the refusal-logging recipe](../../docs/architecture/authorization.md#recording-a-refusal--what-every-gate-owes-the-audit-trail) appear in neither story. `docs/README.md` already records the Media gallery shipping with **no** refusal logging at all as an open gap, on the screen where the recipe's argument is strongest; the Products editor is the next screen in that position, and **D-8** makes it the sole authorization perimeter for the entire product write path. This story adds no new gate, so the decision is **0027's** — flagged here so 0027's amendment meets a decision rather than a silence.
- **R-11 — This story's design is provisional against six unshipped stories at once**, one more than 0076's **R-12** had to contend with: 0021, 0024, 0027, 0068, 0070 and 0076. It binds to 0076's *widened* signature, which itself binds to 0024's *unimplemented* one. **Phase 3 must re-verify every signature against `HEAD` first.**
- **R-13 — The defence-in-depth action was added *after* both amigos reported, so neither reviewed it.** **D-17**, **D-18** and **D-19** come from a human decision relayed by the coordinator on 2026-08-30, composed by the facilitator against 0071's **D-13** contract. This is the same exposure 0076's **R-13** records — facilitator-only material in a file whose amigo-checked claims came back two-for-two wrong — and it lands on the three decisions with the largest security surface in the story. **Phase 2 should read D-17's contract with that in mind**, particularly the `Validator` shape and whether `slugRules($languageId, $productId)`'s exclusion behaves correctly when the action is called for a language the product has **no** row in yet (0076's **D-6** says it must; it is asserted here, not verified).
- **R-14 — `SetProductTranslation` re-sanitizes and re-validates content the component already sanitized and validated, and that duplication is the design rather than a smell.** It costs one extra sanitizer pass per non-default language per save — safe only because 0024's **D-16** constraint 2 requires and tests idempotence, which is the same argument 0076's **D-8** makes for its own second layer. ⚠️ **A reviewer optimising the double pass away must remove the *component's*, never the action's** — the action is the layer that binds a caller with no component, and 0071's **D-13** states the direction of the asymmetry explicitly.
- **R-12 — Two of this file's decisions overrule an amigo's stated recommendation**, and both are recorded rather than smoothed: **D-1** rejects `frontend-qa`'s re-key option in favour of `frontend-expert`'s multi-instance one, and **Q-3** below records a genuine head-to-head disagreement the facilitator declined to settle. Phase 2 should read both as live rather than closed.

### Open questions for the product owner

Per [contracts.md](../../docs/contracts.md#uncertainty-handling-rule)'s Uncertainty Handling Rule, each carries a recommendation rather than a silent assumption. **Q-1 and Q-2 are ✅ RESOLVED (human, 2026-08-30) and no longer block test authoring; Q-3 and Q-4 are closed by 0071. Only Q-5 remains open, and it belongs to 0027.**

**Q-1 — What does a tab for an untranslated language show: empty fields, or the fallback content? ✅ RESOLVED 2026-08-30 — option (a), empty.** The human confirmed empty inputs. This is also what [0071's **D-6**/**D-7**](0071-product-categories-language-tabs-ui.md) already do for the taxonomy screens — *the edit field reads the **raw translation row**, never `translated()`'s fallback* — reached there for the identical reason this file and `frontend-qa` both found independently: pre-filling silently manufactures a real translation out of an untouched tab. **The rule, stated for implementation:** a tab's five inputs are hydrated from that language's own `product_translations` row and from **nothing else**; a language with no row hydrates to five `''`s. `translated()` is for *rendering* (the list, the storefront), never for *editing*. The non-submitting fallback hint is retained as the affordance that keeps (a) usable — it shows the default's value beside the empty input, and ⚠️ it must be genuinely non-submitting, which is why it is a rendered hint and **not** a `placeholder` (option (c)'s trap: a plain `assertSee` cannot tell `placeholder="…"` from `value="…"`, so the test reads the attribute).
- ~~**(a) Empty inputs, plus a non-submitting hint showing the default language's value — _(recommended)_.**~~ **Adopted.** Pre-filling is a trap with a silent, permanent cost: an administrator who merely *opens* the French tab and saves has **materialised** the Spanish string as a real French translation, after which the per-field fallback can never fire for that field again. PRD Epic 5's *"a missing translation falls back to the default store language"* is destroyed by a no-op interaction, and **no backend test can see it**, because the backend faithfully persists whatever it is handed.
- **(b) Pre-fill the inputs with the default language's content.** Friendlier as a starting point for translating, and it is what a naive implementation does. Costs the fallback mechanism 0076 exists to prove.
- **(c) Show the default's value as a greyed `placeholder` attribute.** Visually similar to (a) but weaker — a placeholder is indistinguishable from a value at a glance, and ⚠️ a plain `assertSee` cannot tell `placeholder="Zapatillas"` from `value="Zapatillas"`, so the test has to read the attribute.

**Q-2 — What does Save do with a tab the administrator left blank, and is `name` required per language? ✅ RESOLVED 2026-08-30 — option (a): no row is created, and the language simply stays untranslated.** The human confirmed that a blank tab creates nothing and falls back normally through `HasTranslations`, with no validation error and no blocked save. **The exact all-or-nothing shape this implies is specified at [D-18](#4-documented-functional-decisions)**, which was written for it: all-or-nothing binds the **tab**, not the field set — an *engaged* tab (any of its five fields non-blank) requires `name` and leaves the other four individually optional, because requiring all five would contradict 0076's **D-2**, whose stated purpose in making those columns nullable is to let an administrator save a French name before they have written the French slug. D-18 also names the third state the human's phrasing did not have to cover: a tab that is blank **but previously held a translation** is refused rather than silently emptied (**Q-4**, and 0071's **D-7** decides it identically).
- ~~**(a) A language row is written only if at least one of its five fields is non-empty; once any is filled, `name` becomes required *for that language* — _(recommended)_.**~~ **Adopted, and refined by D-18.** Gives "leave the French tab blank → no French row" without forcing a complete translation before any save, which is exactly what 0070's **D-5** per-field fallback exists for.
- **(b) Every active language's `name` is always required.** Simple and unambiguous, but it means a three-language store can never save a product until all three are translated — contradicting 0076's **D-2**, whose stated reason for making the SEO columns nullable is that *"an administrator who fills in a French name but has not yet written the French slug could not save at all"*.
- **(c) Write a row for every active language, defaulting `name` to the default language's value.** Rejected as a recommendation: it is **Q-1(b)** by another route, materialising fallbacks server-side without the administrator even opening the tab.

**Q-3 — Does a language that is no longer active, but already holds content, still get a tab?** ✅ **Very likely already answered — [0071's **D-5**](0071-product-categories-language-tabs-ui.md) decides it: *"Only active store languages get a tab. Content in a removed language is hidden, not shown."*** That is option **(a)** below, the recommendation this file independently reached, and it is the same answer 0070's **D-6** routes to the UI layer. **Phase 2 should confirm rather than re-debate** — the one thing to check is that the decision is being applied identically here, since this story's **D-3** uses the same set to *narrow the write payload*, which 0071's single-field screen had less reason to think about. The two amigos on this story did recommend opposite answers, recorded below because the disagreement was real and because option (b)'s objection to (a) is not addressed by 0071 either.
- **(a) Active languages only get a tab — _(recommended, `frontend-expert`'s position)_.** Matches PRD Epic 5's own wording (*"each **active** store language surfaces as a tab"*) literally, keeps **D-3**'s narrowing set identical to `scopeActive()` with no second concept, and content authored in a removed language stays **readable** exactly as 0068's **D5** promises — just not editable from here.
- **(b) Also render a read-marked tab for an inactive language that holds content (`frontend-qa`'s position).** 0068's **D5** exists so removed content stays readable *and re-editable*; under (a) that content becomes unreachable from any screen, which is arguably half-breaking it. Costs a second concept in the narrowing set and a read-only rendering mode that nothing else in this app has.
- **(c) Render it fully editable.** Rejected — it makes "active" meaningless and lets an administrator author new content in a language the store has switched off.

**Q-4 — Can an administrator remove a translation by blanking every field in its tab? ✅ CLOSED — no, and [0071's **D-7**](0071-product-categories-language-tabs-ui.md) already decides it identically** (*"a previously-translated non-default tab blanked → refused; a previously-untranslated one left blank → accepted and not written"*), which is **D-18**'s third row. Retained below because the reasoning is still the reasoning, and because Q-2's resolution makes the *untouched* half of it a normal, silent, non-error path — so the two halves must not be conflated in a test.
- ~~**(a) No, not this phase — _(recommended)_.**~~ **Adopted.** Under **D-18** a blanked *existing* row fails `required` on `name`, so the refusal is an ordinary validation message rather than a silent delete. Deleting a translation row raises the same "what still references it" question story 0019 deferred for media.
- **(b) Yes — blanking every field deletes that language's row.** It is what an administrator will *try*, so (a) needs its refusal message to be clear about why. Genuinely useful, and cheap to add later; adding it now means designing a confirmation for a destructive action the PRD never asks for.

**Q-5 — Which store language does the products *list* screen render?** Raised here because this story makes the question visible, but it belongs to the **0027 amendment** (**R-1**), not to this story. 0076's **D-14** ships `scopeOrderByTranslatedName()` for the *ordering* and does not answer the *rendering* half.
- **(a) The store default — _(recommended)_.** The one language guaranteed to resolve for every product, so a list cell can never render blank.
- **(b) The administrator's UI locale.** Rejected as a recommendation: it conflates the two i18n axes 0068's own opening table draws apart deliberately, and the UI switcher is ES/EN-only while store languages are open-ended.

### Inherited open questions — listed, deliberately not resolved here

**0070's Q1** (must every entity always hold a default-language translation — **Q-2** depends on the answer being *yes*), **0070's Q3** (which story owns the taxonomy tabs — answered only in part, **R-4**), **0061's OQ-2** (blog-post slug collisions — the question 0076's **D-6** declines to inherit), and **0027's OQ-1 … OQ-9**, none of which this story touches.

## 6. Technical tasks for later backlog creation

Derived from this debate; **none are in scope for 0077**.

1. **Amend [0027](0027-products-list-and-editor-ui.md)** for the eight falsified items in **R-2**, and — separately and first — for 0076's **R-1(a)/(b)** list-query break. Both amendments land in the same story file and must be written once, before either 0076 or 0077 implements.
2. **Verify the dotted `#[Modelable]` binding by execution** (**R-3(a)**) before any markup is written. It is the one assumption whose failure forces a redesign. ⚠️ **D-2's revision to five parallel arrays changes the path but not the question** — the binding is now `wire:model="descriptions.{{ $id }}"` rather than `translations.{{ $id }}.description`, one level shallower, which is *more* likely to work but is still unexecuted.
2b. **Close the core-field authorization asymmetry D-17 leaves.** After this story the *translation* path self-authorizes at two layers while `CreateProduct` / `UpdateProduct` still self-authorize at none (0024's **D-15**, coordinator-confirmed at its **RQ-10**). That was a defensible call when the component was the only caller; **D-17** makes the same entity's *other* write path two-layer, so the asymmetry is now visible within one folder. Belongs to 0024/0076, not here.
3. **Decide whether 0021 gains `setContent()` / `flush()` client hooks** (**D-1** option (d), **R-7**). Not needed by this story's chosen shape, but it is the fallback for **R-3(a)** and the remedy for the save-race — and it is 0021's file, so it is a coordination action.
4. ⛔ **REPLACED — 0071/0073/0075 already exist** (written concurrently with this file; see the ⛔ note at the top). The real item is: **reconcile all four language-tab stories against 0071 in one Phase 2 pass**, resolving [C-1…C-4](#reconciliation-with-0071--four-conflicts-found-after-this-file-was-written) and the 0073-did-not-adopt-the-strip gap (**R-4b**) together, rather than story by story — none of the four was written with sight of the others. Carry forward the one note this item got right: **D-1**'s multi-instance/`x-show` reasoning is driven entirely by the WYSIWYG and does **not** transfer to a single-`flux:input` taxonomy screen, so 0071's `@if` is defensible there and is not defensible here.
5. **Decide refusal logging for the Products editor** (**R-10**) — 0027's call, but this story makes the component the entire authorization perimeter for the product write path, which strengthens the argument considerably.
6. **Decide where the tab strip's copy lives before any of the four implements.** This story proposed `lang/{en,es}/components.php` (a new domain file, colliding with 0021's **D12** and 0022's own claim on it); 0071's **D-10** instead extends `lang/*/products.php` and adds *no* new domain file. Those cannot both be right for one shared component — and if 0071's choice stands, the 0021/0022 first-to-land hand-off this item was written to resolve may not need resolving at all (**R-4(b)**).
7. **`ModuleRouteAccessTest.php` still covers two routes while more exist** — inherited unclosed from 0017/0018/0068/0070/0076, and untouched here since this story adds no route.

## Provenance

**Phase 1 Three Amigos debate, 2026-08-30.** Facilitator: `product-owner`. Classification was fixed as **frontend** by the coordinator; this is one story of a confirmed 14-story decomposition of PRD Epic 5, and no further decomposition was performed.

> ⚠️ **A concurrency incident is recorded here rather than quietly corrected, because it changed what this file contains — and because it is a failure mode this project's contracts anticipate between *agents* but not yet between *stories*.** The sibling-precedent check that opens this debate was run twice before the amigos were dispatched (`ls ai-spec/tasks/ | grep -E "^00(71|73|75|77)"`), and returned nothing both times: 0071, 0073 and 0075 genuinely did not exist. Both amigos were briefed on that basis, both independently confirmed it against the live tree, and this file was composed to *design* the tab pattern. **Three concurrent sessions wrote those stories during this one** — 0071 at 11:22:17, 0073 at 11:24:15, 0075 at 11:24:49, against this file's 11:24:23 — and 0071 not only shipped the pattern first but **names this story by number four times** as a bound consumer. The conflict was found by a routine `git status` after writing, not by anything in the process.
>
> **Two lessons, both cheap.** *(i)* A "does the precedent exist yet" check is a **read of a moving tree**, and its answer expires — under concurrent authorship it can expire within the same turn that acted on it. Where a story's design depends on being *first*, re-run the check immediately before writing the file, not only before dispatching the debate. *(ii)* [contracts.md](../../docs/contracts.md#parallel-agent-file-ownership-rule)'s Parallel Agent File-Ownership Rule is written in terms of agents whose **write sets** intersect; here no two sessions wrote the same file, so the rule was never violated — and the collision happened anyway, because what intersected was the **design space**, not the file set. Four stories that each create "the shared tab component" satisfy the rule as written and still produce four incompatible answers. **The rule needs a second clause for concurrently-authored stories that share a to-be-designed artifact**; that is a `docs-keeper` item, not this story's to write.
>
> **This file's corrections are surgical and reversible by design.** Nothing the amigos contributed was deleted: the four conflicting decisions are struck through in place with their reasoning retained, the reconciliation table records which story wins each point and why, and **C-2** is escalated rather than merged, because the WYSIWYG constraint that makes `x-show` non-negotiable here is exactly the constraint 0071 had no reason to consider.

**Both amigos were dispatched as real subagent calls and both returned normally**, within one dispatch and with no follow-up nudge required — recorded because 0076's own provenance documents a nine-hour stall on the same workflow, and because that story's facilitator composed a draft before two amigos reported and was contradicted on two substantive points. **This file was composed only after both contributions were in hand.**

- **`frontend-expert` — returned and contributed.** The three lead findings, of which **two appear in no existing story file**: **F-A**, the `''`-versus-`NULL` slug-uniqueness collision (**D-4**) — a delayed, data-corrupting save failure triggered by *leaving a field blank*, invisible in every single-fixture test; **F-B**, the sanitize-before-validate asymmetry between the default and non-default languages (**D-6**); and **F-C**, the client-controlled `$translations` keys (**D-3**). Also: the four-option analysis behind **D-1** and the decisive objection to re-keying (it discards *typed text*, not merely caret state); the component state shape and its three rejected alternatives (**D-2**); the client-side switching argument with its 0018 precedent (**D-7**); the authorization reasoning including *why a second `Gate` call above the translation loop would be actively wrong on the create path* (**D-8**); the server-side slug pre-fill and the `Str::ascii()`-versus-JS-`slugify` divergence that makes it fidelity rather than preference (**D-9**); the 2 + N `Gallery` arithmetic (**R-5**); the per-instance event-name warning (**R-8**); the eight-item 0027 falsification list (**R-2**); and the reusability analysis behind **D-15**, including the observation that this story's hardest problem deliberately does *not* transfer to the taxonomy screens.
- **`frontend-qa` — returned and contributed.** The entire test design, adopted essentially as delivered: the three-blind-spot analysis that calibrates the browser/component split; the **B-2** assertion's crucial negative half (*"the region does not contain the Spanish string — this half is the actual test"*) and the observation that a single-language fixture makes both halves vacuous; the four-table "a refused save writes nothing" requirement; the tamper matrix **T-1…T-6** including the `toContain`-is-insufficient rule; the three-language-dataset requirement that makes the "rendered exactly once" count able to fail at all; the `SupportValidation::hasProperty()` fork in the stale-error-bag test; the `placeholder`-versus-`value` assertion trap in **Q-1(c)**; the `data-test` hook inventory including the six editor hooks 0027 does not promise (**D-16**); the browser-test folder-convention decision (**D-13**); and the independent discovery of the client-controlled-keys hazard as **T-3**, which is the strongest corroboration in this debate.

**Two amigo positions were overruled by the facilitator, and both are recorded rather than quietly dropped** (**R-12**): `frontend-qa`'s **E-5** recommendation to re-key a single WYSIWYG instance, rejected at **D-1** on `frontend-expert`'s stronger objection; and the two amigos' opposite answers on inactive-language tabs, which the facilitator declined to settle unilaterally and escalated instead as **Q-3**, since 0070's **D-6** routes that decision here and it carries both a UX and a security consequence.

**One facilitator verification is recorded because neither amigo could perform it**: [`composer.json`](../../composer.json) requires `livewire/flux` only, with **no `livewire/flux-pro`**, so Flux's tabs primitive is unavailable and the strip is hand-rolled (**D-11**). `frontend-expert` expected this and named the check; the dependency list settles it without a `vendor/` directory.
