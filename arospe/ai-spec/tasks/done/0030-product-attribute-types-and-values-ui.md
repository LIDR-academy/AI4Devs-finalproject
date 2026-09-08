# [0030] Product attribute types & values — management screen (UI)

## Description
Build the Livewire **view layer** for the product variant attribute taxonomy screen of
[PRD §2.2](../../docs/PRD/PRD.md#22-products): a list of attribute types ("Size", "Color",
"Material") showing each type's values, a create/edit modal holding the type name plus an inline,
reorderable **values repeater**, and a delete-confirmation modal. This story is
markup/interaction/navigation only — the two tables, both models, the validation trait, the four
actions, the route and the component class itself are the paired backend story **0028**, which must
close first. This screen is what makes PRD acceptance criterion *"Variant attribute types and values
are admin-configurable (not hardcoded)"* observable to a human.

## Type
frontend (related_task_id: **0028**) | includes database-expert: **no**

> **Why this stays one story (INVEST — Small).** Types table, create/edit modal, values repeater,
> delete modal and both empty states all land in the **same single Blade file**,
> `resources/views/livewire/products/attribute-types.blade.php`. Every candidate split (list vs.
> modal vs. repeater) would mean a second story editing the first story's markup — the
> two-stories-one-file collision [0006](0006-users-list-editor-ui.md) and
> [0039](../0039-payment-methods-ui.md) already documented and avoided.

## Debate decisions (confirmed before writing this story)

| # | Question | Decision |
|---|---|---|
| 1 | **The two-level UI pattern** (the central design question) | **Flat `flux:table` of types + full editing inside the existing create/edit modal** — structurally identical to the shipped Users screen. **Chosen because it requires zero additions to 0028's public surface**, and because 0028's contract was evidently written for it: a row carrying `valueCount` **and** a `valuePreview` *string* has no purpose except summarising a child list in a flat row — an accordion or a detail pane would render the live child list instead and would not need a preview at all. |
| 2 | Why **not** an accordion / expandable rows | Rejected on a verified fact, not taste: **Flux UI Free v2.15.0 ships no accordion/disclosure/sortable primitive** — confirmed by listing `vendor/livewire/flux/stubs/resources/views/flux/` (it has `dropdown`, `menu`, `navlist`, `navmenu`, `modal`, `table`; nothing accordion- or drag-shaped). Hand-rolling per-row Alpine open/closed state duplicates what `$showModal` already does, and would change what `openEditModal(string $typeId)` *means* — today it populates `$values` once for the modal; an accordion needs it to run per expand/collapse, which 0028 never signed up for. |
| 3 | Why **not** a master-detail split | Rejected hardest: it needs a **third piece of state 0028 never exposes** ("which type is selected for the detail pane") plus a save affordance separate from the list's create affordance — a real contract renegotiation. It also fights the domain's own scale: 0028 sizes both tables at 10¹–10² rows and specifies no pagination anywhere. A permanent split pane is disproportionate weight for an occasionally-touched taxonomy screen. |
| 4 | Reorder affordance: buttons or drag? | **Per-row up/down `chevron-up` / `chevron-down` buttons**, calling `moveValue($key, $direction)`. Drag-to-reorder is **deferred**, exactly as 0028's D5 permits. Not a preference: Flux Free ships nothing draggable, so drag means adding SortableJS or equivalent, and project `CLAUDE.md` forbids changing dependencies without approval. A `moveValue(key, direction)`-shaped signature is what buttons were designed for. |
| 5 | Row-action permission treatment | **Disabled with a tooltip, never hidden** — the per-row `Gate::allows()` **UI hint** convention already documented in [authorization.md](../../docs/architecture/authorization.md#gateallows-in-a-list-query-is-a-ui-hint-not-a-layer) and shipped on the Users rows. 0028's `$types` rows already carry `canEdit` / `canDelete` for exactly this. It is layered *on top of* the component's own `Gate::authorize()`, never instead of it. |
| 6 | Rendering `deletingTypeUsageCount` | **Render nothing usage-related at all.** That property is `#[Locked]` and **always `0` until story 0029**. A "used by 0 variants" line would be filler that also *implies a check exists when it does not*. This is the same discipline D7 states for code ("do not stub a model method that hardcodes `return 0`") applied to copy. The confirmation reads like the Users one ("This cannot be undone"). 0029 adds the count. |
| 7 | The zero-value type state | **A real, reachable state with its own inline empty treatment**, on the assumption 0028's **Q2a** is confirmed (a valueless type is legal and inert, matching story 0010's zero-permission role precedent). Inside the modal the repeater shows an explicit "No values yet" line rather than a blank gap; in the list the row renders a zero count. ⚠️ This decision **inherits 0028's Q2** — see [Open questions](#open-questions) OQ-9. |
| 8 | UI string language | **English source strings wrapped in `__()`**, matching the whole app today. Generic chrome (`Save`, `Cancel`, `Name`, `Values`) stays as bare `__('...')` literals exactly as [`users.blade.php`](../../resources/views/livewire/users.blade.php) does; only domain copy goes into `lang/*/products.php`. The Spanish switcher arrives with Epic 5. |
| 9 | Sidebar entry | This story adds navigation — a screen with no way to reach it is not delivered. **Which file it goes in depends on whether [0013](0013-sidebar-module-gating-ui.md) has landed by Phase 3**; both branches are specified in [Files to create/modify](#files-to-createmodify). |

Resolved directly from the docs, no decision needed: **view path** follows the
[`Index`-in-a-subfolder exception](../../docs/conventions/naming.md#exception-a-component-named-index-resolves-to-its-parent-folders-name)
— `App\Livewire\Products\AttributeTypes\Index` ↔ the **flat**
`resources/views/livewire/products/attribute-types.blade.php`, never a nested
`attribute-types/index.blade.php` (0028 flags the same trap for its own placeholder); **no
pagination** (0028 specifies none, at 10¹–10² rows); **no separate value CRUD screen** (0028 D4 —
values have no independent identity and are edited only inside their type's form).

## Gherkin

```gherkin
Feature: Product attribute types screen — list, create/edit modal, values repeater, delete

  # --- List rendering ---

  Scenario: A catalog administrator views the attribute types list
    Given a catalog administrator, with at least one existing attribute type
    When they open the attribute types screen
    Then they see each type's name, how many values it holds, and a preview of those values

  Scenario: The section header shows live totals
    Given a catalog administrator, with three attribute types holding a combined ten values
    When they open the attribute types screen
    Then the header shows three types and ten values

  Scenario: An empty state is shown when there are no attribute types
    Given a catalog administrator, with no attribute types defined
    When they open the attribute types screen
    Then an explicit empty state is shown instead of an empty table

  Scenario: A type holding no values is listed without error
    Given a catalog administrator, with an attribute type that holds no values
    When they open the attribute types screen
    Then that type is listed showing zero values, with no broken cell

  Scenario: Row actions are disabled for an administrator who may not use them
    Given a catalog administrator allowed to view but not to edit or delete attribute types
    When they open the attribute types screen
    Then each type's edit and delete actions are shown disabled with an explanation

  # --- Create / edit modal ---

  Scenario: A catalog administrator opens the create-type form
    Given a catalog administrator on the attribute types screen
    When they choose to define a new attribute type
    Then a form opens with an empty name and no value rows

  Scenario: A catalog administrator opens the edit form for an existing type
    Given a catalog administrator, with an attribute type "Size" holding the values 38, 39, and 40
    When they choose to edit that type
    Then the form opens showing "Size" and its three values in their saved order

  Scenario: A catalog administrator cancels the create-type form without saving
    Given a catalog administrator with the create-type form open and a name and values entered
    When they cancel without saving
    Then the form closes and no new attribute type appears in the list

  Scenario: Reopening the create form after cancelling starts blank again
    Given a catalog administrator who cancelled a create-type form that had values entered
    When they choose to define a new attribute type again
    Then the form opens with an empty name and no value rows

  Scenario Outline: Saving an attribute type is rejected with invalid details
    Given a catalog administrator with the type form open
    When they submit the form with <invalid_detail>
    Then a validation message is shown next to the offending field
    And the form remains open

    Examples:
      | invalid_detail                      |
      | a blank name                        |
      | a name already used by another type |

  # --- Values repeater ---

  Scenario: Adding a value row to an open type form
    Given a catalog administrator with the type form open for "Size", showing 38 and 39
    When they add the value 40
    Then the form shows 38, 39, and 40

  Scenario: Removing a value row from an open type form
    Given a catalog administrator with the type form open for "Size", showing 38, 39, and 40
    When they remove the value 39 from the form
    Then the form shows only 38 and 40, and no other value row changes

  Scenario: Renaming a value in an open type form
    Given a catalog administrator with the type form open for "Size", showing the value 38
    When they rename that value to "38 EU"
    Then the form shows "38 EU" in that value's place

  Scenario: Reordering the values in an open type form
    Given a catalog administrator with the type form open for "Size", showing 40, 38, and 39 in that order
    When they move the value 38 above 40
    Then the form shows 38, 40, and 39 in that new order

  Scenario: A type saved with no values at all is accepted
    Given a catalog administrator with the create-type form open, named "Material", with no value rows
    When they save the form
    Then "Material" appears in the list holding zero values

  Scenario: A duplicate value within the same type is rejected inline
    Given a catalog administrator with the type form open for "Size", showing the value 38
    When they try to save a second value 38 on that same type
    Then a validation message is shown against that value row
    And the type still holds a single value 38

  Scenario: The same value text is accepted under a second attribute type
    Given a catalog administrator, with an attribute type "Color" holding the value "Black"
    When they save an attribute type "Material" holding the value "Black"
    Then both types are listed, each holding its own "Black"

  # --- Delete ---

  Scenario: Deleting an attribute type asks for confirmation first
    Given a catalog administrator, with an existing attribute type "Material"
    When they choose to delete that type
    Then a confirmation naming "Material" is shown and the type is still listed

  Scenario: A catalog administrator confirms deleting an attribute type
    Given a catalog administrator who has been asked to confirm deleting "Material"
    When they confirm the deletion
    Then "Material" no longer appears in the attribute types list

  Scenario: A catalog administrator dismisses the delete confirmation
    Given a catalog administrator who has been asked to confirm deleting "Material"
    When they dismiss the confirmation
    Then "Material" still appears in the attribute types list
```

> Scenarios follow [gherkin-guidelines.md](../../docs/testing/frontend/gherkin-guidelines.md) rules 1
> (named business-role actor — "a catalog administrator", never "I") and 3 (exactly one `When` per
> scenario). **No in-use / hard-block deletion scenario is written**: per 0028 D7 that guard does not
> exist until story 0029, and inventing a scenario for it would be a ghost scenario (rule 6).

## Files to create/modify

**Owned by this story:**

- `resources/views/livewire/products/attribute-types.blade.php` — **modify.** 0028 ships this as a
  "minimal placeholder only" (its own Q6 wording) purely so the route does not 500 and its feature
  tests can render; this story replaces its content entirely with the types table, the create/edit
  modal + values repeater, the delete-confirmation modal, and both empty states. Exactly the
  0004 → 0006 relationship. ⚠️ **Do not create
  `resources/views/livewire/products/attribute-types/index.blade.php`** — that nested path is not
  what Livewire resolves and would be a silently unused duplicate.
- `lang/en/products.php` + `lang/es/products.php` — **modify.** 0028 **creates** both files; this
  story appends an `attribute_types` group mirroring `lang/en/users.php`'s `index.*` group — e.g.
  `attribute_types.summary` (`:total types · :values values`), `attribute_types.no_types`,
  `attribute_types.no_values`, `attribute_types.action_not_allowed`, `attribute_types.value_preview_more`.
  **If 0028 already shipped a key meaning the same thing, reuse it verbatim — do not add a second.**
  Both locale files stay key-for-key identical.
- **Navigation — one of two files, depending on what has landed at Phase 3:**
  - *If [0013](0013-sidebar-module-gating-ui.md) has **not** landed (expected):*
    `resources/views/layouts/app/sidebar.blade.php` — **modify.** Add one
    `<flux:sidebar.item icon="swatch" :href="route('product-attribute-types.index')" :current="request()->routeIs('product-attribute-types.*')" wire:navigate>`
    beside the existing Users entry, with a comment noting it is scaffolding 0013's registry will
    absorb. Static and ungated exactly like the Users link — a **cosmetic** leak only; access is
    refused by `can:products.view` on the route and re-checked in `mount()`, precisely as
    [api/routes.md](../../docs/api/routes.md#usersindex--the-first-permission-gated-route) already
    documents for Users. `swatch` is verified present in
    `vendor/livewire/flux/stubs/resources/views/flux/icon/` (as are `tag`, `rectangle-stack`,
    `adjustments-horizontal`) — see OQ-7.
  - *If 0013 **has** landed:* add a `config/modules.php` entry keyed on `products.view` instead, and
    **do not touch `sidebar.blade.php`**, which 0013 replaces with `<x-sidebar-nav />`.
- `tests/Feature/Products/AttributeTypesIndexRenderingTest.php` — **new.** Component-level rendering
  tests, mirroring `tests/Feature/Users/IndexRenderingTest.php`'s role.
- `tests/Browser/Products/AttributeTypesIndexTest.php` — **new.** Pest 4 browser tests for the
  repeater's real-DOM behaviour. This is the gap 0028 explicitly refuses to claim (its **FP8**:
  "claiming any backend test as coverage for the values repeater's DOM behaviour" is a false pass).
  The browser suite is wired up and green in CI (task 0006b, `done`).

**Explicitly NOT this story** (listed so the boundary is unambiguous):

| File | Owner |
|---|---|
| `database/migrations/*_create_product_attribute_types_table.php` + `*_values_table.php` | 0028 |
| `app/Models/ProductAttributeType.php`, `app/Models/ProductAttributeValue.php` | 0028 |
| `app/Concerns/ProductAttributeValidationRules.php` | 0028 |
| `app/Actions/Products/{Create,Update,Delete}ProductAttributeType.php`, `SyncProductAttributeValues.php` | 0028 |
| **`app/Livewire/Products/AttributeTypes/Index.php`** (every property and method in the contract below) | **0028** |
| `routes/web.php` — the `product-attribute-types.index` registration and its `can:products.view` middleware | 0028 |
| Both factories; the initial creation of `lang/*/products.php` | 0028 |
| `tests/Feature/Products/AttributeTypesIndexTest.php`, `SyncProductAttributeValuesTest.php`, `tests/Feature/Models/ProductAttributeTypeTest.php` | 0028 |
| `database/seeders/RolePermissionSeeder.php` — untouched by design (0028 D6) | nobody |
| The in-use deletion hard block and its usage count | 0029 |
| Product variants, combinations, any pivot | 0029 |
| Translatable attribute names | Epic 5 (0028 Q4a) |

> ⚠️ **`tests/Feature/Products/AttributeTypesIndexTest.php` is *not* this story's file.** 0028 claims
> it for component logic, persistence and authorization. This story takes
> `AttributeTypesIndexRenderingTest.php` instead — the exact same split 0006 was given against 0004's
> `IndexTest.php`, and the exact collision [errors-log.md](../../docs/errors-log.md) records. Do not
> recreate it and do not extend it; a rendering assertion that seems to belong there belongs in
> `AttributeTypesIndexRenderingTest.php`.

> ⚠️ **Sequential-implementation requirement.** 0028 and 0030 both write
> `resources/views/livewire/products/attribute-types.blade.php` and both write the two
> `lang/*/products.php` files. Their Phase 3 work must therefore **never be dispatched in the same
> batch**, per the
> [Parallel Agent File-Ownership Rule](../../docs/contracts.md#parallel-agent-file-ownership-rule):
> **0028 must be fully closed before 0030 starts.**

### Interface contract required from 0028

This view binds to the surface 0028 already specifies, reproduced here as the binding contract. It
requires **no additions** — that is decision 1's whole point — with **two exceptions flagged as
OQ-1 and OQ-2** rather than silently assumed:

```php
/** @var array<int, array{id: string, name: string, valueCount: int, valuePreview: string, canEdit: bool, canDelete: bool}> */
public array $types = [];

#[Locked] public ?string $editingTypeId = null;   // null => create mode
public bool $showModal = false;
public string $name = '';                          // never null — bound to a text input

/**
 * NOT #[Locked] — the form's own input, re-scoped server-side in save() (0028 D4 step 2).
 * @var array<int, array{id: string|null, key: string, value: string}>
 */
public array $values = [];

public bool $showDeleteModal = false;
#[Locked] public ?string $deletingTypeId = null;
#[Locked] public string $deletingTypeName = '';
#[Locked] public int $deletingTypeUsageCount = 0;   // always 0 until 0029 — NOT rendered (decision 6)

public function openCreateModal(): void;
public function openEditModal(string $typeId): void;
public function addValue(): void;
public function removeValue(string $key): void;      // by key, NOT by index
public function moveValue(string $key, int $direction): void;
public function save(CreateProductAttributeType $create, UpdateProductAttributeType $update): void;
public function confirmDelete(string $typeId): void;
public function deleteType(DeleteProductAttributeType $delete): void;

#[Computed] public function typesSummary(): array;   // ['total' => int, 'values' => int]
```

Validation errors must land in Livewire's standard `$errors` bag keyed `name` and
`values.{index}.value`, so `flux:input` renders them with no extra wiring — see trap 2 below for why
that keying is load-bearing and OQ-5 for the one part of it that is unresolved.

> **Four runtime traps the markup must not fall into.** Traps 1 and 2 are the two most important
> things this story carries; 0028 calls trap 1 "the single most important thing to hand the frontend
> story".
>
> 1. **`wire:key` on a repeater row is `$row['key']`, never `$loop->index`.** Removing row 1 shifts
>    row 2 into array index 1; with an index-based key, Livewire's DOM morph *reuses* the node keyed
>    `1` (which was row 2's `<input>`) instead of destroying and recreating it. The visible text
>    re-renders correctly on the next full round-trip, which is exactly why this hides — what does
>    **not** survive is any in-flight uncommitted keystroke in a sibling row and any client state
>    bound to that node (focus, caret, Alpine `x-data`). `Livewire::test()->set()` bypasses the DOM
>    entirely and can never detect it — the same lesson [errors-log.md](../../docs/errors-log.md)
>    records for the `null`-property `<select>` desync. It must be a **browser** test (B1–B3 below).
> 2. **`wire:model` binds by array index, `wire:key` binds by stable key — different axes, do not
>    conflate them.** Verified in `vendor/livewire/flux/stubs/resources/views/flux/input/index.blade.php`:
>    the `name` prop defaults to `$attributes->whereStartsWith('wire:model')->first()`, and
>    `flux/error.blade.php` does an exact-match lookup on that name first. So
>    `<flux:input wire:model="values.{{ $index }}.value" />` auto-derives `name="values.0.value"` and
>    renders the matching error with zero wiring — **but only because the model path is positional**.
>    Livewire's nested-array data binding *is* positional; "fixing" trap 1 by binding `wire:model` on
>    the row's `key` breaks array diffing outright.
> 3. **Every `wire:*` directive argument goes through `@js()`** — `wire:click="removeValue(@js($row['key']))"`,
>    `wire:click="openEditModal(@js($type['id']))"`. Mandatory, not stylistic: the value lands in a
>    JavaScript evaluator the HTML parser has already decoded, so `{{ }}` is not the right encoder.
>    See [security/blade-livewire-output-encoding.md](../../docs/security/blade-livewire-output-encoding.md).
> 4. **The two Flux/Blaze traps from the Users screen apply verbatim.** A `tooltip` prop cannot be
>    conditionally bound (`:tooltip="$cond ? … : null"` renders an empty bubble on *every* row under
>    Blaze) — write the two `@if`/`@else` branches out, wrapping the disabled branch in an explicit
>    `<flux:tooltip>`; and the `cursor-not-allowed!` class belongs on that wrapper, never on the
>    disabled `<button>`, which Flux's own `disabled:pointer-events-none` removes from hit-testing.
>    Both are recorded with their verification method in [errors-log.md](../../docs/errors-log.md).
>    This applies to the type row actions **and** to a boundary-disabled move button.

### Technical approach

- **Types table:** `flux:table` / `.columns` / `.rows` / `.row :key="$type['id']"` / `.cell` — four
  columns (Name · Values · *count* · Actions). The Values cell renders `valuePreview` as muted text
  with `valueCount` as a `flux:badge`; the row actions reuse `users.blade.php`'s enabled/disabled
  dual-branch pattern verbatim, with `data-test="edit-type-{id}"` / `"delete-type-{id}"`.
- **Values repeater:** no Flux repeater primitive exists (v2.15.0 inventory verified), so it is a
  hand-rolled `@foreach ($values as $index => $row)` of flex rows, each a `<div wire:key="{{ $row['key'] }}">`
  holding `<flux:input wire:model="values.{{ $index }}.value" />`, the two move buttons and the
  remove button. An "Add value" `flux:button icon="plus"` below calls `addValue()`.
- **Reorder controls:** two icon-only `flux:button` (`chevron-up` / `chevron-down`,
  `variant="ghost" size="sm"`) per row, with the up button disabled on `$loop->first` and the down
  button on `$loop->last` — computed in the view, requiring **no new component state**.
- **Modals:** `flux:modal` bound `wire:model="showModal"` / `wire:model="showDeleteModal"`, inner
  content wrapped in `@if ($showModal)` / `@if ($showDeleteModal)` so only one "Cancel" control is
  ever in the DOM — the rule `users.blade.php` already carries a comment for.
- **Two empty states, both real:** no types at all → the centred bordered `flux:text` block Users
  uses; a type with zero value rows → an inline "No values yet" line inside the repeater area, since
  0028 Q2a makes that a legal reachable state rather than defensive-only markup.
- **Loading states:** `wire:loading.attr="disabled"` with `wire:target` on Save and on the delete
  confirm button, matching Users.
- **Accessibility:** every icon-only button carries an `aria-label` naming its target
  (`Move :value up`, `Remove :value`) — icon-only markup without an accessible name is not
  acceptable, and browser tests target the `data-test` hook rather than the label either way.
- **Dark mode:** the same `zinc` neutral palette and `dark:` variants as `users.blade.php`. No new
  palette decisions, no ported prototype CSS.

## Tests to perform

Level chosen per [coverage-policy.md](../../docs/testing/frontend/coverage-policy.md): browser only
where DOM/Alpine/`wire:key` state is the actual risk; rendering, permission-driven disabled state and
validation-message placement are cheaper and equally reliable at the component level.

### Component tests — `tests/Feature/Products/AttributeTypesIndexRenderingTest.php`

- [ ] The list renders each type's name, `valueCount` and `valuePreview`.
- [ ] The header renders `typesSummary()`'s live totals (types and combined values).
- [ ] The empty state renders when no types exist.
- [ ] A type with zero values renders a zero count and the intended empty-preview treatment — **the
      exact rendering, not merely "no error"** (see FP-UI8, and OQ-3 for what that treatment is).
- [ ] Row actions render **disabled with the tooltip wrapper** for an actor holding `products.view`
      but neither `products.edit` nor `products.delete`, and **enabled without it** for a full
      administrator — **two separate actors** (FP-UI7).
- [ ] `openCreateModal()` renders an empty name field and zero value rows.
- [ ] `openEditModal()` renders the type's name and its values in `position ASC, value ASC` order.
- [ ] A blank name and a duplicate type name each render a message next to the name field with the
      modal still open.
- [ ] A duplicate value within one submission renders a message **against the offending value row**
      (FP-UI3), and the type still holds its single value.
- [ ] The same value text under two different types renders both, each holding its own.
- [ ] `confirmDelete()` renders a confirmation naming the type, read from `$deletingTypeName`.
- [ ] The delete confirmation renders **no usage-count copy at all** (decision 6) — a negative
      assertion, so the 0029 count cannot be added here by accident.
- [ ] `moveValue()` reorders `$values` and the rendered rows — asserted as an **exact ordered array**
      (`toBe`), never `toContain` (FP-UI1 / 0028 FP6).
- [ ] Saving a type with zero value rows succeeds and lists it (Q2a).

### Browser tests — `tests/Browser/Products/AttributeTypesIndexTest.php`

The shared discipline across all three repeater tests: **assert the database row after Save, never
only the DOM text after a click.** A re-render can show correct text while the bound array has the
wrong `id`↔`value` pairing; only a server-state read exposes that. This is the gap 0028's FP8 leaves
open, and closing it is the highest-value part of this story.

- [ ] **B1 — removing an earlier row must not desync a later row's edited text.** Arrange "Size" with
      38 (id A), 39 (id B), 40 (id C). Open the edit modal, **type** into the third row changing
      `40` → `40 EU`, then click the **first** row's remove button. Assert the DOM shows exactly `39`
      and `40 EU`. Save. Assert server-side that id B still reads `39`, **id C still exists and now
      reads `40 EU`**, and id A is gone. This is the test that goes red if the markup keys on
      `$loop->index`.
- [ ] **B2 — a newly added row's key never collides with an existing row's.** "Color" with Black
      (id A), White (id B). Edit Black → `Jet Black`, click "Add value", type `Red`, Save. Assert
      id A → `Jet Black`, id B → `White` unchanged, and a **genuinely new third id** holds `Red` —
      catching `addValue()` reusing a stale key, which would make 0028's `SyncProductAttributeValues`
      diff misfile the insert as an update.
- [ ] **B3 — removing the row currently being typed in discards only that row.** "Material" with
      Cotton (id A). Add a row, type the partial `Wo` into it, remove **that same row**. Assert one
      row remains showing `Cotton`; Save; assert only id A persists and the type holds exactly one
      value — no phantom partial row surviving as a `required` failure or a silent extra insert.
- [ ] Full create flow through the real repeater: name + several values added via the UI, Save,
      assert the persisted rows.
- [ ] Reorder through the real move buttons, Save, assert the persisted `position` order server-side —
      seeded so the `position ASC, value ASC` tiebreak would **not** produce the asserted order on its
      own (FP-UI5).
- [ ] Delete: the confirmation names the type; confirming removes the row; dismissing keeps it (three
      tests, mirroring the Users trio).
- [ ] Cancelling the create modal with values entered persists nothing.
- [ ] **Reopening create after that cancel renders zero value rows** — a distinct client-state-leak
      risk the persistence check above cannot cover (FP-UI6).
- [ ] `->assertNoJavaScriptErrors()` swept across load, create-modal open, add row, remove row,
      reorder, save, edit-modal open, and delete confirm/dismiss — mandatory per
      [test-quality-checklist.md](../../docs/testing/frontend/test-quality-checklist.md).

### Frontend false passes to design against

**FP-UI1 — ordering asserted with `assertSee`.** Three `assertSee` calls pass in any DOM order. A
`moveValue()` regression is invisible unless the assertion is on the exact ordered sequence.

**FP-UI2 — "a value was removed" proven by `assertDontSee('39')`.** Passes identically for "deleted
that one row" and for "deleted all three and recreated two with fresh ids" — 0028's single worst bug
(D4), transposed to the browser. Assert the surviving **ids** after saving.

**FP-UI3 — a validation message asserted without checking which row it is attached to.**
`assertSee('has already been taken')` passes even if the message renders at the top of the form or
under the wrong row. Scope the assertion to the offending row's own container/hook.

**FP-UI4 — duplicate rejection proven only by an unchanged row count.** Passes on
`distinct:ignore_case` alone (0028 FP1 transposed) — and, at browser level, *also* passes when a
silent JS error simply no-opped the click. Pair it with `assertNoJavaScriptErrors()` in the same flow.

**FP-UI5 — a reorder test whose fixture already sorts the asserted way.** With ties on `position = 0`
resolving by `value ASC` (D5), seeding values that the tiebreak would order correctly anyway proves
nothing about `moveValue()`.

**FP-UI6 — cancel tested only for "nothing persisted".** That proves the server was not written to,
not that the modal's client-visible repeater was cleared. It needs its own reopen assertion.

**FP-UI7 — the disabled-row-action test run with a single actor.** Unlike Users, attribute types have
**no per-row distinction** (0028 D6), so "an Administrator sees enabled buttons" says nothing at all
about the disabled branch. A second, deliberately under-permissioned actor is required.

**FP-UI8 — the zero-value type checked only for "no exception".** A structural false positive per the
checklist's question 6: it passes even if the entire repeater is broken, because nothing
repeater-related runs. Assert the intended rendering.

## Expected outcome
A signed-in administrator holding `products.*` reaches the attribute types screen from the sidebar and
sees a header with live type/value totals, a "New attribute type" button, and a table of types each
showing its name, its value count and a preview of its values, with edit and delete actions rendered
enabled or disabled according to their own permissions. "New attribute type" and the edit action open
one modal holding the type's name and an inline list of value rows that can be added, renamed,
reordered with up/down controls, and removed individually — and editing a type never re-keys the
values it did not change. Duplicate names and duplicate values within a type surface inline against
the offending field or row, with the modal still open. Deleting asks for confirmation naming the type.
With no types, an explicit empty state renders instead of a bare table. The screen renders correctly
in light and dark mode and produces no JavaScript console errors.

## Acceptance criteria
- [ ] The types list renders each type's name, value count and value preview, plus per-row edit/delete
      actions, and a header with live totals and a primary "New attribute type" button.
- [ ] A row's edit/delete action renders **disabled with a tooltip** when the acting administrator's
      `canEdit`/`canDelete` is false, and enabled otherwise — a UI hint layered on top of the
      component's own `Gate::authorize()`, never a substitute for it.
- [ ] "New attribute type" opens the modal blank; the per-row edit action opens it prefilled with the
      type's name and its values in their saved order.
- [ ] Value rows can be added, renamed, reordered and removed individually from within the modal, and
      every repeater row is keyed on its **server-generated stable `key`**, never on a loop index.
- [ ] A browser test proves that removing one value row does not desync or lose a sibling row's edited
      text, asserted against the **persisted rows** after saving — not against the DOM alone.
- [ ] Validation errors surface inline: the name error next to the name field, a value error against
      that specific value row, with the modal staying open in both cases.
- [ ] A type holding zero values renders correctly in both the list and the modal, and can be saved.
- [ ] Deleting requires confirming in a modal naming the type; dismissing leaves it listed. **No
      usage-count copy is rendered anywhere** until story 0029.
- [ ] An explicit empty state renders when no attribute types exist.
- [ ] The screen is reachable from the application navigation.
- [ ] All UI copy is wrapped in `__()` with English source strings; `lang/en/products.php` and
      `lang/es/products.php` remain key-for-key identical.
- [ ] Every `wire:*` directive argument is passed through `@js()`.
- [ ] The screen renders correctly in light and dark mode and produces no JavaScript console errors.
- [ ] No new frontend dependency is introduced (drag-to-reorder stays deferred).
- [ ] `docs/api/routes.md` is flagged to `docs-keeper` for Phase 6: what the
      `product-attribute-types.index` view actually renders, its `data-test` hooks, and the sidebar
      link's gating status.

## Dependencies & risks

- **Hard dependency on 0028 (`new`, not started).** The component class, both models, both
  migrations, the validation trait, the four actions, the route and the two `lang/*/products.php`
  files are all 0028's. This story cannot start — not even its component tests — until 0028 has
  closed. Same relationship as 0006 → 0004.
- **Shared-file risk with 0028**, on three files (the placeholder Blade view and both locale files).
  Mitigated by strict sequencing, not by scoping — see the Parallel Agent File-Ownership note above.
- **Inherited open questions.** 0028's own **Q2** (zero-value types legal?) and **Q5** (route name)
  are still open and this story *binds* to both: Q2 decides whether the zero-value empty state and
  its scenario exist at all, and Q5 is the literal string in `route(...)` and
  `request()->routeIs(...)`. See OQ-9.
- **Risk: the sidebar entry is deliberately ungated** on the pre-0013 branch, so every authenticated
  user would see the link. Cosmetic only — access is refused by `can:products.view` on the route and
  re-checked in `mount()` — but it is a second instance of a caveat the docs already carry once for
  Users, and it must not be forgotten when 0013 lands.
- **Risk: this is the first Products-area screen.** Stories 0025 (product categories UI) and 0027
  (products list/editor UI) are planned but unwritten, so whichever lands first sets the navigation
  grouping for the whole area — see OQ-6.

## Open questions

None blocks Phase 2 INVEST review; all are answerable in one PO pass, and OQ-1/OQ-2/OQ-9 should be
answered **before Phase 3** because Blade and browser tests bind to them literally.

**OQ-1 — 0028's contract has no `closeModal()` / `closeDeleteModal()`.** The Users contract lists
both, and `users.blade.php` uses them on the Cancel buttons and on `@close`. Without them, "cancel"
is a pure client-side `wire:model` toggle and the repeater's `$values` are **not** reset server-side,
which makes the "reopening create after cancel starts blank" scenario unprovable — and possibly
false.
- **OQ-1a (recommended)** — amend **0028** to add `closeModal()` (which resets `$name`, `$values`,
  `$editingTypeId`) and `closeDeleteModal()`. 0028 is still at the `new` stage, so it is free to
  change, and a frontend story must not write backend component code. This is the same fix
  [0039](../0039-payment-methods-ui.md)'s OQ-1 recommends for its own contract gap.
- OQ-1b — leave the reset to `openCreateModal()` instead, and drop the reopen scenario. Cheaper, but
  it leaves stale rows in the component between open and reopen, which is exactly the state-leak
  class 0006's Phase 4 finding F2 was raised about.

**OQ-2 — `moveValue(string $key, int $direction)`'s direction contract is unstated.** `int` alone
under-specifies it and the view must write the literal.
- **Recommended:** `-1` = up, `+1` = down, any other value rejected, and a call at the list boundary
  is a **no-op**, not an error — the view already disables the boundary button, so a boundary call
  can only arrive from a crafted payload.

**OQ-3 — `valuePreview` has no truncation rule and no zero-value rendering.** A type may hold up to
100 values (0028's `max:100`), so a naive comma-join overflows the cell.
- **Recommended:** join the first **five** values with `, ` and append a `+N more` suffix built from
  `valueCount`; render a zero-value type's preview as an em dash `—`, matching how a roleless user's
  role cell already renders in `users.blade.php`. ⚠️ `valuePreview` is **built by 0028's
  `loadTypes()`**, so if the truncation lives in the component this is a 0028 amendment; if it lives
  in the view, 0028 must send the full joined string. **Please state which** — it decides whose file
  the rule goes in.

**OQ-4 — `data-test` hook naming for the repeater.** Users established `edit-user-{id}` /
`delete-user-{id}`; browser tests B1–B3 cannot be written without the equivalents.
- **Recommended:** `edit-type-{id}`, `delete-type-{id}` on the row actions, and
  `value-input-{key}`, `remove-value-{key}`, `move-value-up-{key}`, `move-value-down-{key}` on the
  repeater — **scoped by the row's stable `key`, never by index**, so the hooks cannot themselves
  reintroduce the positional bug the tests exist to catch.

**OQ-5 — do `values.{index}.value` error keys go stale after a row is removed?** The error bag is
index-keyed while the rows are key-identified. If a validation failure leaves errors in the bag and
the administrator then removes an earlier row, message *n* would now sit against a different row.
- **Recommended:** `save()` re-validates from scratch on every call, and `removeValue()` /
  `addValue()` / `moveValue()` each clear the `values.*` error bag (`$this->resetValidation('values.*')`)
  so a stale message can never be attached to a row it does not describe. That is a **0028** change,
  small and local — please confirm rather than leaving it to Phase 3 to discover.

**OQ-6 — navigation grouping for the Products area.** Three product screens are coming (0025
categories, 0027 products, 0030 this one) and today the sidebar has a single flat `Platform` group.
- **OQ-6a (recommended)** — this story adds one flat item to `Platform`, exactly as
  [0039](../0039-payment-methods-ui.md) does, with a comment marking it as scaffolding, and leaves the
  grouping to **0013**, which replaces the whole file with a permission-aware registry. Avoids three
  stories inventing three different groupings.
- OQ-6b — introduce a `Catalog` group now. Better final shape, but 0025/0027 would then have to
  agree with a grouping decided by the story that happened to land first.

**OQ-7 — the sidebar/screen icon.** `swatch`, `tag`, `rectangle-stack` and `adjustments-horizontal`
are all present in the installed icon set (verified).
- **Recommended:** `swatch` — it reads as "a set of variant options" and does not collide with the
  `tag` that a future blog-tags screen has the better claim to.

**OQ-8 — `addValue()`'s shape.** The contract shows `addValue(): void`; confirm it appends **exactly
one** blank row at the end, with the `key` generated **server-side** and `value` initialised to `''`
(never `null` — the [errors-log.md](../../docs/errors-log.md) `null`-bound-property rule), and that
positional insert is not wanted. **Recommended: yes, append-only.**

**OQ-9 — two of 0028's own open questions are load-bearing here.** **Q2** (is a zero-value type
legal?) drives decision 7, one Gherkin scenario and two tests; **Q5** (route name) is the literal
`route('product-attribute-types.index')` this view and its sidebar entry call. Both are recommended
in 0028 (Q2a, and `product-attribute-types.index`) and this story is written against those
recommendations — but they must be **confirmed**, not inherited by assumption. 0028's Q3 (deletion
hard block) and Q4 (translatable names) do **not** affect this story: both land after it.

## Resolved in the debate

- **Flat table over accordion/master-detail**, decided on two verifiable grounds rather than taste —
  Flux Free v2.15.0 ships no accordion or drag primitive, and 0028's `valuePreview` field only makes
  sense for a flat summary row. Both alternatives would have required additions to a contract the
  backend story has already frozen, which is a cross-story renegotiation, not a UI choice.
- **`frontend-expert` initially framed the repeater's stable-key rule as a `wire:key` concern only;
  `frontend-qa` showed the failure is invisible to every server-side test.** Reconciled: the rule is
  stated as a markup requirement **and** carried by three named browser tests (B1–B3) whose
  assertions land on persisted rows, because a DOM-only assertion passes against the bug.
- **`wire:key` and `wire:model` use different keys on purpose.** Raised as a likely reviewer
  objection and settled explicitly, with the Flux stub verified: the stable key goes on `wire:key`,
  the positional index on `wire:model`. "Simplifying" them to one axis breaks either the DOM identity
  or Livewire's array diffing.
- **No usage-count copy in the delete modal**, extending D7's "do not stub a lying `return 0`" from
  code to UI text.
- **Drag-to-reorder deferred** on the dependency rule, not on effort.
- **`assertSee`-style assertions are insufficient for ordering, removal and duplicate rejection on
  this screen** — recorded as FP-UI1/2/4 so Phase 3 does not write them.

## Definition of Done
- [ ] Tests written and green, plus the **full** existing suite (per the
      [Full Test Suite Gate Rule](../../docs/contracts.md#full-test-suite-gate-rule)).
- [ ] Code reviewed (code-reviewer).
- [ ] No security findings (appsec-auditor) — specifically: that every `wire:*` directive argument is
      `@js()`-encoded; that the disabled row action is a UI hint layered on top of the component's own
      `Gate::authorize()`, never a substitute; that the delete modal reads the type's name from the
      `#[Locked] $deletingTypeName` rather than from the client-writable `$types` array; and that no
      value `id` displayed or submitted by the repeater is trusted without 0028's server-side
      re-scope (D4 step 2).
- [ ] Documentation updated (docs-keeper) — [api/routes.md](../../docs/api/routes.md) (what the
      `product-attribute-types.index` view renders, its `data-test` hooks, and the sidebar link's
      gating status) and, if the pre-0013 branch was taken, the ungated-sidebar caveat recorded
      alongside the Users one.
- [ ] Acceptance criteria met.

## Provenance
Phase 1 debate convened by `product-owner` with **`frontend-expert`** (the three-way UI-pattern
comparison and the "`valuePreview` proves the contract was written for a flat table" argument, the
verified Flux v2.15.0 component/icon inventory, the view-resolution and `lang/*` file-collision
boundaries, the `wire:key`-vs-`wire:model` axis distinction verified against `flux/input` and
`flux/error` stubs, and the four contract gaps) and **`frontend-qa`** (the component-vs-browser level
split, the three repeater-DOM regression tests B1–B3 with their server-state assertions, the eight
FP-UI false-pass traps, the Gherkin set, and the error-key staleness question). Both participated;
neither role had to be covered inline. Points of genuine under-specification — the missing
`closeModal()`, the `moveValue()` direction contract, `valuePreview` truncation, the `data-test`
convention, error-key staleness, navigation grouping, the icon, `addValue()`'s shape, and the two
inherited 0028 questions — are recorded above as open questions with labelled recommendations rather
than silently decided.
