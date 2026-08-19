# [0018] Sales Regions & Taxes screen — list, grouping, edit modal and the default-toggle UX

## Description
Build the Livewire **view layer** for the Sales Regions screen of
[PRD Epic 2 §2.1](../../docs/PRD/PRD.md#21-sales-regions--taxes): a list of seeded region entries
(code chip, name, description, rate %), Spain's five fiscal sub-territories grouped and expandable
beneath the "España" row, an edit modal (`code` / `description` / `rate`), an enable-disable control,
and the default-toggle UX that makes the single-default invariant legible — attempting to disable the
current default without naming a replacement is blocked with a clear message, and setting a new default
visibly clears the old one. The rate input accepts a Spanish-locale decimal comma. This story is
**markup, interaction and rendering tests only**: the component class, policy, actions, validation
trait, route and both `lang/*/sales-regions.php` files are sibling backend story
[0017](0017-sales-region-tax-configuration-backend.md); the table, model, enum, factory and seeder are
[0016](0016-sales-region-catalog-schema-and-seeder.md).

## Type
frontend (related_task_id: **0017**) | includes database-expert: **no**

> **Why this stays one story (INVEST — Small).** It is large by acceptance-criterion count (list,
> grouping, rate rendering, edit modal, active toggle, default swap, blocked-disable, empty/disabled
> affordances, sidebar entry, two test files), but every candidate split lands in the **same single
> Blade file**, `resources/views/livewire/sales-regions.blade.php`. Splitting it would mean a second
> story editing the first story's markup — the two-stories-one-file collision
> [contracts.md](../../docs/contracts.md#parallel-agent-file-ownership-rule) exists to prevent, and
> the same reasoning [story 0006](done/0006-users-list-editor-ui.md) recorded for the Users screen.

> ⚠️ **Dependency-state correction.** The brief that commissioned this debate described 0017 as
> "already done". It is **not**: `0016` and `0017` are both still at the **new** stage in
> `ai-spec/tasks/`, and `find`/`ls` confirm that `app/Models/SalesRegion.php`,
> `app/Livewire/SalesRegions/`, `database/factories/SalesRegionFactory.php` and any `sales_regions`
> migration **do not exist yet**. Everything below is therefore contract-driven design against 0017's
> *specified but unbuilt* public surface — exactly the position 0006 was in against 0004 — and
> **0018 cannot start Phase 3 until 0016 and 0017 have both completed their Phase 7.** See
> [Dependencies & risks](#dependencies--risks).

## Debate decisions (confirmed during Phase 1)

Reached by the two convened amigos (`frontend-expert`, `frontend-qa`) plus `product-owner`. Decisions
**D1–D10** are settled; the genuinely-open items are in [Open questions](#open-questions--confirm-before-phase-3)
and are **not** pre-decided here.

| # | Decision | Reasoning |
|---|---|---|
| **D1** | **The rate input is `type="text" inputmode="decimal"` — never `type="number"`.** | The single most consequential markup decision in the story. A native `<input type="number">` performs its own client-side parsing: typing `21,5` is either refused as a keystroke or coerced before submission, so the comma **never reaches the wire payload** for 0017's component-side `str_replace(',', '.', …)` normalisation (D12) to act on. `type="text"` + `inputmode="decimal"` keeps the mobile numeric keypad while doing no coercion. Both amigos reached this independently. It is invisible to `Livewire::test()->set()` — see [test 10](#tests-to-perform). |
| **D2** | **Grouping is a view-side concern over the flat `$regions` array. No 0017 contract change.** | `$regions` already carries `parentId`, `kind` and `sortOrder` per row. The view groups at render time (`whereNull('parentId')->sortBy('sortOrder')`, then `where('parentId', $row['id'])->sortBy('sortOrder')` per parent). Because the view sorts, this also closes QA's flagged gap that 0017 guarantees **no ordering** for `$regions` — the rendering does not depend on one, and the grouping test asserts by *relationship*, not by array position. |
| **D3** | **Spain's expansion is a client-side Alpine toggle, default-open.** | PRD §2.1's wording is *"When they **expand** Spain's entries"*, so an expand affordance is required rather than a bare indented list. Every child row is already in the locked array on first paint — there is nothing to fetch, so a `wire:click` round trip to toggle CSS visibility is the wrong tool. Default-**open** because five children framed by the PRD as inherent structure should not start hidden. Consequence QA asked for: this makes the grouping's *interactive* half a **browser** test and its *structural* half a component test. |
| **D4** | **Disabling the current default happens only inside the edit modal; the current default row's inline switch renders `disabled` with an explanatory tooltip.** | Follows from 0017's D4 caveat. The refusal arrives as a `ValidationException` keyed `replacementDefaultId`; if the inline switch called `setActive()` directly on the default row, that error would land in the bag with **no rendered field to attach it to** — an invisible failure, the worst outcome per 0017's own reasoning. Inside the modal the replacement `flux:select` is already on screen, so the message renders exactly where the administrator can act on it. This design adds **zero new Livewire properties**. |
| **D5** | **The inline row switch handles only the two always-safe transitions** — inactive → active, and active-but-not-default → inactive — calling `setActive($regionId, $newValue)` directly. | Neither can throw, so neither can produce an orphaned error. This is 0017's sanctioned "0018 may render an inline row switch, a modal field, or both" left deliberately as *both*, split by which transition can fail. |
| **D6** | **A `NULL` rate renders as an em dash; `0.000` renders as `0%`.** Rendered by string manipulation, never a float cast. | 0016/0017 D6 make "unconfigured" vs "a real 0%" load-bearing. `{{ $region['rate'] === null ? '—' : rtrim(rtrim($region['rate'], '0'), '.').'%' }}` — the `decimal:3` cast returns a **string**, and 0017's Larastan notes forbid comparing it numerically. The naive `@if ($region['rate'])` is the exact PHP-truthiness trap that would render a legitimate `0.000` identically to "not set". |
| **D7** | **`SalesRegionKind::label()` stays deferred — this story does not add it, and does not touch `app/Enums/`.** | 0016 deferred it to "the first story that actually renders `kind`", and 0017 restated the deferral. On this screen `kind` drives *structure and styling* (indentation, chevron presence, grouping-row treatment) and is **never rendered as text** — so it still has no consumer, and 0016's own stated rule ("nothing renders it yet") still applies. Keeping it out also keeps 0018 purely view-layer + tests + lang, and removes the `app/Enums/SalesRegionKind.php` file-collision risk with 0017 that `frontend-expert` flagged. **Escape hatch:** if Phase 3's design does surface a textual `kind`, adding `label()` plus its two lang keys is pre-authorised in writing by 0016 and is not scope creep — but it must then be recorded, not slipped in. |
| **D8** | **`data-test` row hooks: `edit-region-{id}`, `toggle-active-region-{id}`, `set-default-region-{id}`, plus `expand-region-{id}` on the chevron.** Present on **both** the enabled and the disabled branch of each control. | Extends the `edit-user-{id}` / `delete-user-{id}` convention verified in `resources/views/livewire/users.blade.php`. Mandatory here because these controls are icon-only and there may be ~255 rows, so no visible text uniquely identifies a row's action. Hook-on-both-branches is what lets a test select the same control regardless of whether it is enabled — the rule `docs/api/routes.md` records for the Users screen. |
| **D9** | **UI copy is English source strings through `__()`**, added **additively** to the `lang/{en,es}/sales-regions.php` files 0017 creates, key-for-key identical across both. | The same decision [0006](done/0006-users-list-editor-ui.md) recorded: the PRD's Spanish copy is reference layout, not literal requirement, until Epic 5's language switcher. 0017 owns `errors.*`; 0018 adds `index.*` / `fields.*` / `labels.*`. |
| **D10** | **The "grouping" catalog concept is removed — this screen renders no supranational entries (no "Unión Europea", no "Internacional").** *(scope decision, 2026-08-18)* | The Sales Region catalog holds only individual countries plus Spain's five fiscal sub-territories, per the same decision applied to [0016](0016-sales-region-catalog-schema-and-seeder.md). Consequences owned here: no top-level "grouping" siblings to render, no `kind === Grouping` branch anywhere in the markup, no `grouping()` factory state in test arrangement, and no separate "groupings" section or filter category in the list design — the list is countries + Spain's territories only. Row counts drop accordingly (see [Q1](#open-questions--confirm-before-phase-3): ~255 rows, of which **6** are business-relevant, not 8). **Spain's fiscal-territory *visual* grouping (D2/D3) is a different, unrelated concept and is deliberately unaffected.** |

Resolved directly from the docs, no decision needed: the view path is the **flat**
`resources/views/livewire/sales-regions.blade.php` per the
[`Index`-in-a-subfolder exception](../../docs/conventions/naming.md#exception-a-component-named-index-resolves-to-its-parent-folders-name)
(0017 flags the same trap); Flux **Free** v2 ships **no accordion / disclosure / tree component**
(verified against `vendor/livewire/flux/stubs/resources/views/flux/`), so D3's expansion is
hand-rolled Alpine; no prototype HTML/CSS is ported — images 09/10 are layout reference only.

## Gherkin

```gherkin
Feature: Sales Regions screen — configuring seeded entries and moving the default flag

  # --- Editing an entry, observable in the rendered list ---

  Scenario: A newly configured rate is visible in the list
    Given a tax administrator, with the "Canarias" entry carrying no rate
    When they save a tax rate on the "Canarias" entry
    Then the "Canarias" row shows that rate

  Scenario: A newly configured description is visible in the list
    Given a tax administrator, with the "Canarias" entry carrying no description
    When they save a description on the "Canarias" entry
    Then the "Canarias" row shows that description

  Scenario: A newly configured code is visible in the list
    Given a tax administrator, with the "Canarias" entry carrying no code
    When they save a code on the "Canarias" entry
    Then the "Canarias" row shows that code in its code chip

  Scenario: The edit form offers no control for a structural attribute
    Given a tax administrator viewing the seeded "Canarias" entry
    When they open the edit form for that entry
    Then the entry's name, slug and kind are shown as read-only context
      with no editable control of any kind

  # --- Rate rendering ---

  Scenario Outline: A configured rate and an unconfigured rate render distinctly
    Given a tax administrator, with a region entry whose rate is <rate_state>
    When they open the Sales Regions screen
    Then that entry's row shows <rendering>

    Examples:
      | rate_state          | rendering                                |
      | not yet configured  | an unconfigured marker, never "0%"       |
      | configured as zero  | "0%", never the unconfigured marker      |

  # --- The single-default invariant, as the administrator sees it ---

  Scenario: Marking a new default moves the badge in the list
    Given a tax administrator, with "España (Península)" shown as the default entry
      and "Portugal" active
    When they mark "Portugal" as the default
    Then the list shows "Portugal" as the default entry
      and no longer shows "España (Península)" as one

  Scenario: Disabling the current default on its own is blocked with a visible message
    Given a tax administrator, with "España (Península)" as the current default entry
    When they try to disable "España (Península)" without naming a replacement
    Then a validation message next to the replacement field explains the action is blocked

  Scenario: A blocked disable leaves the row visibly unchanged
    Given a tax administrator, with "España (Península)" as the current default entry
    When they try to disable "España (Península)" without naming a replacement
    Then the "España (Península)" row still shows as active and still carries the default badge

  Scenario: Disabling the default while naming a replacement updates both rows
    Given a tax administrator, with "España (Península)" as the current default entry
      and "Portugal" active
    When they disable "España (Península)" while naming "Portugal" as the new default
    Then the list shows "España (Península)" as inactive
      and "Portugal" carrying the default badge

  Scenario: The replacement field offers only entries that can actually hold the flag
    Given a tax administrator disabling the current default, with an inactive entry in the catalog
    When they open the replacement-default field
    Then the inactive entry is not offered as a replacement

  # --- Enabling and disabling a non-default entry ---

  Scenario: Enabling a seeded but inactive region entry from its row
    Given a tax administrator, with "Francia" seeded as an inactive entry
    When they enable the "Francia" entry from its row
    Then the "Francia" row shows as active

  Scenario: Disabling a region entry that is not the default
    Given a tax administrator, with "Italia" active and not the default entry
    When they disable the "Italia" entry from its row
    Then the "Italia" row shows as inactive

  # --- Rate validation, at the UI layer ---

  Scenario Outline: An invalid rate shows an inline error and keeps the form open
    Given a tax administrator editing a region entry that already carries a configured rate
    When they submit <invalid_rate> as the new rate
    Then a validation message appears next to the rate field, the form stays open,
      and the entry's previously configured rate is still shown in the list

    Examples:
      | invalid_rate        |
      | a negative value    |
      | a non-numeric value |
      | a value above 100   |

  Scenario: A rate typed with a decimal comma is accepted
    Given a tax administrator editing a region entry on a Spanish keyboard
    When they type a tax rate written with a decimal comma into the rate field and save
    Then the entry is saved and the list shows the equivalent decimal rate

  Scenario: Clearing an entry's rate returns it to unconfigured in the list
    Given a tax administrator, with an entry carrying a configured rate
    When they clear that entry's rate field and save
    Then that entry's row shows the unconfigured marker again

  # --- Structure ---

  Scenario: Spain's fiscal territories render grouped beneath the "España" entry
    Given a tax administrator viewing the seeded Sales Region catalog
    When they open the Sales Regions screen
    Then Península, Baleares, Canarias, Ceuta and Melilla are shown grouped beneath "España",
      each still separately configurable

  Scenario: Spain's fiscal territories can be collapsed out of the way
    Given a tax administrator viewing the "España" entry with its territories shown
    When they collapse the "España" entry
    Then its five fiscal territories are no longer visible, and "España" itself still is

  Scenario: A country with no fiscal sub-territories is listed as a top-level entry
    Given a tax administrator viewing the seeded Sales Region catalog
    When they open the Sales Regions screen
    Then "Portugal" is listed as a top-level entry, with no expand affordance

  # --- The catalog stays fixed ---

  Scenario: The screen offers no way to add a region entry
    Given a tax administrator viewing the seeded, fixed Sales Region catalog
    When they exercise every configuration control the screen offers
    Then the catalog holds exactly the same number of entries as before,
      and no add-a-country control is rendered anywhere on the screen

  # --- Affordances that must not be offered ---

  Scenario Outline: The set-default control is unavailable where it would be invalid
    Given a tax administrator, with a region entry that is <condition>
    When they open the Sales Regions screen
    Then that entry's row offers no enabled way to mark it as the default

    Examples:
      | condition           |
      | already the default |
      | inactive            |

  Scenario: The current default cannot be switched off from its own row
    Given a tax administrator, with "España (Península)" as the current default entry
    When they open the Sales Regions screen
    Then that row's enable-disable control is disabled,
      with a tooltip explaining a replacement must be named first

  Scenario: An administrator who may view but not edit sees every control disabled
    Given a tax auditor whose role grants only the permission to view Sales Regions
    When they open the Sales Regions screen
    Then every edit, enable-disable and set-default control is rendered disabled
      with an explanatory tooltip

  # --- Navigation ---

  Scenario: The screen is reachable from the Taxes area of the navigation
    Given a tax administrator holding the Sales Regions view permission
    When they look at the sidebar navigation
    Then a Sales Regions entry appears under a Taxes heading,
      rather than as a top-level navigation item
```

> Scenarios follow [gherkin-guidelines.md](../../docs/testing/frontend/gherkin-guidelines.md) rules 1
> (named business-role actor — *a tax administrator* / *a tax auditor*, never "I") and 3 (exactly one
> `When` per scenario).

## Files to create/modify

**Owned by this story:**

- `resources/views/livewire/sales-regions.blade.php` — **create.** The whole screen. **Do not create
  `resources/views/livewire/sales-regions/index.blade.php`** — that nested path is not what Livewire
  resolves for `App\Livewire\SalesRegions\Index` and would be a silently unused duplicate.
- `config/modules.php` — **modify** (see the sidebar note below). Add one entry:
  ```php
  'sales-regions' => ['group' => 'Taxes', 'label' => 'Sales Regions', 'icon' => 'receipt-percent',
                      'route' => 'sales-regions.index', 'permissions' => ['sales-regions.view']],
  ```
- `lang/en/sales-regions.php`, `lang/es/sales-regions.php` — **modify, additively.** 0017 creates both
  for its `errors.*` copy; this story adds the list/label/field copy under new top-level groups, keeping
  the two files key-for-key identical.
- `tests/Feature/SalesRegions/IndexRenderingTest.php` — **new.** Rendering-level `Livewire::test()`
  coverage.
- `tests/Browser/SalesRegionsIndexTest.php` — **new.** Pest 4 browser tests for the JS-driven behaviour.

> 📌 **The sidebar entry goes in `config/modules.php`, not in `sidebar.blade.php` — and this is a
> correction to the expert's file list, made after reading
> [story 0013](0013-sidebar-module-gating-ui.md).** 0013 introduces `config/modules.php` as the
> declarative, permission-gated nav registry and **replaces** the static `Platform` group in
> `resources/views/layouts/app/sidebar.blade.php` with `<x-sidebar-nav />`. Its `group` field is a
> nullable string, so `'group' => 'Taxes'` satisfies PRD §2.1's *"lives as a section **inside the Taxes
> area** (not a top-level sidebar item)"* precisely — a requirement a flat `flux:sidebar.item` could not
> meet. 0013 is numbered lower and is therefore sequenced first by
> [workflow.md](../../docs/workflow.md#task-ordering-rule)'s Task ordering rule.
>
> **Fallback if 0013 has not landed when 0018 starts Phase 3:** add a `flux:sidebar.group
> :heading="__('Taxes')"` containing one `flux:sidebar.item` to `sidebar.blade.php`, ungated —
> the same deliberately-cosmetic, deferred-gating posture 0006 took for the Users link (access is
> refused server-side by `can:sales-regions.view` regardless) — and record that 0013 must migrate it
> into `config/modules.php` when it lands. Do **not** silently do both.

**Explicitly NOT this story** (listed so the boundary is unambiguous):

| File | Owner |
|---|---|
| `app/Livewire/SalesRegions/Index.php` | 0017 |
| `app/Concerns/SalesRegionValidationRules.php`, `app/Policies/SalesRegionPolicy.php` | 0017 |
| `app/Actions/SalesRegions/{UpdateSalesRegion,SetDefaultSalesRegion,SetSalesRegionActive}.php` | 0017 |
| `routes/web.php` — the `sales-regions.index` route and its `can:` middleware | 0017 |
| `lang/{en,es}/sales-regions.php` — **creation** and the `errors.*` keys | 0017 |
| `tests/Feature/SalesRegions/IndexTest.php` (component logic, persistence, authorization) | 0017 |
| `tests/Feature/SalesRegions/SetSalesRegionActiveTest.php` | 0017 |
| `tests/Feature/Policies/SalesRegionPolicyTest.php` | 0017 |
| `app/Enums/SalesRegionKind.php` (incl. `label()`) | deferred — see **D7** |
| The `sales_regions` table, model, enum, ISO fixture, factory, seeder | 0016 |
| Tax-rate **resolution** for a product/order | 0026 |

> **Test-file ownership.** `tests/Feature/SalesRegions/IndexTest.php` is **0017's**, exactly as
> `tests/Feature/Users/IndexTest.php` was 0004's. This story gets `IndexRenderingTest.php` +
> `tests/Browser/SalesRegionsIndexTest.php`. 0006's own story file records that an earlier draft
> listed `IndexTest.php` as new and would have had two stories creating one file — do not repeat it.

### Interface contract consumed from 0017

This view binds to 0017's **Component public surface** section verbatim. Restated here only as the
names the markup depends on; **0017 is the authority, and any divergence is a contract change to be
re-agreed, not patched in the view**:

```php
#[Locked] public array $regions = [];   // rows: {id, slug, code, name, description, rate,
                                        //        kind, parentId, isDefault, isActive, sortOrder, canEdit}
#[Locked] public ?string $editingRegionId = null;
public bool $showModal = false;
public string $code = '';                 // never null
public string $description = '';          // never null
public string $rate = '';                 // '' == unconfigured
public bool $active = false;
public string $replacementDefaultId = ''; // '' == no replacement chosen

#[Computed] public function replacementCandidates(): array;   // [{id, name}] — active, not-self

public function openEditModal(string $regionId): void;
public function save(UpdateSalesRegion $u, SetSalesRegionActive $a): void;
public function setDefault(string $regionId, SetDefaultSalesRegion $s): void;
public function setActive(string $regionId, bool $active, string $replacementDefaultId = ''): void;
public function closeModal(): void;
```

> **Four runtime traps the markup must not fall into**, each traceable to a real recorded incident:
> 1. **`rate` is a `string|null` from a `decimal:3` cast.** Never `(float)` it, never compare it with
>    `==` / `<` / `>`, and never test it for truthiness — see **D6**.
> 2. **`$regions[n]['kind']` is a `SalesRegionKind` enum instance, not a string.** Branch on the enum
>    cases (`SalesRegionKind::FiscalTerritory`, etc.); a `=== 'country'` comparison is always false.
>    This is the identical trap `UserStatus` produced on the Users screen.
> 3. **`$regions` and `$editingRegionId` are `#[Locked]`.** Never bind either with `wire:model` —
>    it throws `CannotUpdateLockedPropertyException` on the next round-trip.
> 4. **Every `wire:model`-bound property is a non-null plain `string`/`bool` on purpose.** Do not
>    introduce a nullable one, and do not give the replacement `<select>` a placeholder whose value is
>    anything but `""` — see the `null`-property/native-`<select>` entry in
>    [errors-log.md](../../docs/errors-log.md).

### Technical approach

- **Table:** `flux:table` + `flux:table.columns/.column/.rows/.row/.cell`, mirroring
  `resources/views/livewire/users.blade.php`. Columns: **Code** (a monospaced chip, not a
  `flux:badge` — badges are reserved for Default/status semantics), **Name** (indented `pl-6` when
  `parentId !== null`, carrying the expand chevron on parent rows and an inline
  `flux:badge color="amber"` reading `__('Default')` when `isDefault`), **Description** (muted,
  truncated), **Rate %** (right-aligned, `tabular-nums`, rendered per **D6**), **Active**
  (`flux:switch`), **Actions** (edit + set-as-default).
- **Grouping (D2/D3):** group view-side from the flat array; wrap each parent's children in an Alpine
  `x-data="{ open: true }"` region with `x-show`, toggled by a chevron carrying
  `data-test="expand-region-{id}"` and an `aria-expanded` / `aria-label`. Rows with no children render
  no chevron — which, per **D10**, is every country except "España". There is no third row class: the
  catalog is countries plus Spain's five fiscal territories, nothing else.
- **Edit modal:** `flux:modal` bound to `showModal`. `code` → `flux:input maxlength="10"`;
  `description` → `flux:textarea` (255 chars would truncate visually in a single-line input);
  `rate` → the `type="text" inputmode="decimal"` input of **D1**. Name, slug and kind are rendered as
  **read-only context with no form control at all** — which is how the PRD's "a structural attribute
  cannot be changed" requirement is satisfied structurally rather than by filtering input.
- **Default-toggle UX (D4/D5):** the modal's `$active` switch, and — revealed by
  `x-show="! $wire.active"` when the entry being edited is the current default — the
  `replacementDefaultId` `flux:select` fed by `replacementCandidates()`. Pure client-side reveal, so no
  round trip is spent showing a field. `save()` is the single call that can produce the refusal, and the
  select is on screen when it does.
- **Disabled affordances:** apply **both** Flux/Blaze traps from
  [errors-log.md](../../docs/errors-log.md) — a written-out `@if`/`@else` branch that emits an explicit
  `<flux:tooltip>` wrapper on the disabled side (**never** a conditionally-bound `:tooltip="$cond ? … : null"`,
  which Blaze treats as present whenever the attribute is written at all), and `cursor-not-allowed!` on
  the **tooltip wrapper**, never on the `disabled:pointer-events-none` button. This screen has more
  disabled branches than Users did, so both traps will recur by construction.
- **Loading:** `wire:loading.attr="disabled"` scoped with `wire:target` to the specific row action, so
  one row's pending toggle does not disable the whole table.
- **Accessibility & theming:** `aria-label` on every icon-only control (edit, set-default, chevron,
  switch); `dark:` variants throughout on the `zinc` palette; every string through `__()`.

## Tests to perform

Level chosen per [coverage-policy.md](../../docs/testing/frontend/coverage-policy.md) — browser tests
only where real-DOM behaviour is the actual risk. Arrange **only** with `SalesRegionFactory`
(`fiscalTerritoryOf()`, `isDefault()`, `inactive()`, `withRate()`); **never** run
`SalesRegionSeeder`, which 0016 forbids outright (249 rows per test).

**Component — `tests/Feature/SalesRegions/IndexRenderingTest.php`:**

- [ ] 1. The list renders each entry's code chip, name, description and rate exactly as configured.
      *Retires: a persisted value that never reaches the rendered row — distinct from 0017's "does it persist".*
- [ ] 2. **Both directions of the rate distinction**, as two assertions: a `NULL` rate renders the
      unconfigured marker and **not** `0%`; a `0.000` rate renders `0%` and **not** the marker.
      *Retires the `if ($rate)` truthiness trap (**D6**) — a single-direction test passes on the broken implementation.*
- [ ] 3. After a default swap, the badge is present on the new row **and absent from the old one** —
      asserted on both rows in one test. *Retires a view that only ever adds the badge; the database is correct either way, so 0017's test cannot see this.*
- [ ] 4. Disabling the default with no replacement: the validation message renders next to the
      replacement field, the modal stays open, and the row still renders active + default.
      *Retires the worst failure mode — a UI that reports success on a refused write.*
- [ ] 5. The set-default control renders disabled on an already-default row and on an inactive row;
      the enable-disable control renders disabled on the current-default row. Assert via the `data-test`
      hook plus the `disabled` attribute — the technique `tests/Feature/Users/IndexRenderingTest.php`
      already establishes. *Retires a clickable control relying solely on 0017's D10 action guard to refuse silently.*
- [ ] 6. A row with `canEdit === false` renders edit, toggle **and** set-default all disabled, each
      inside the explicit `flux:tooltip` wrapper. *Retires re-shipping either documented Flux/Blaze bug on a second screen.*
- [ ] 7. Spain's five territories render grouped beneath "España" — asserted by **relationship**
      (all five present, marked as children of the España row), not by array position, per **D2**.
      A country with no children renders top-level with no expand affordance. *Retires a flat list silently dropping the PRD's central structural requirement.*
- [ ] 8. **The falsifiable no-create pair:** (a) the rendered HTML contains no create/add-region
      `data-test` hook or trigger; (b) driving every mutating control the render exposes leaves
      `SalesRegion::count()` unchanged. *A bare `assertDontSee('Add region')` is refused as the anti-pattern [errors-log.md](../../docs/errors-log.md) records and 0016/0017 both already declined.*
- [ ] 9. Clearing the rate field and saving renders the unconfigured marker again.
      *Retires a regression in 0017's D6 blank-clears semantics at the layer the administrator sees.*

**Browser — `tests/Browser/SalesRegionsIndexTest.php`:**

- [ ] 10. **The decimal comma, through the real input.** `fill()` `21,5` into the rendered rate field,
      save, assert the row shows the saved value. *This is the only test in the project that can catch **D1**: with `type="number"` the comma never reaches the wire payload, and `Livewire::test()->set('rate', '21,5')` writes the property directly, so it passes on the broken markup. Same lesson as the `null`/`<select>` entry.*
- [ ] 11. **The atomic default swap through the real replacement `<select>`.** Open the default row's
      edit modal, switch it off, pick a replacement by clicking a real `<option>`, save; assert both rows
      update and `SalesRegion::where('is_default', true)->count() === 1`. *Retires exactly the bug class errors-log documents: whether a real click delivers the value to a `wire:model`-bound property at all.*
- [ ] 12. Attempting the same with the replacement select left at its placeholder is blocked, with the
      message visible on the real page. *Confirms the absent pick arrives as `''`, not some other falsy-but-wrong value.*
- [ ] 13. Editing rate/description/code through the real modal inputs (`fill()`, not `->set()`),
      saving, and seeing the row update. *Retires a `wire:model` binding typo invisible to component tests.*
- [ ] 14. Collapsing and re-expanding "España" hides and re-shows exactly its five territories, with
      "España" itself still visible. *The interactive half of **D3**; pure Alpine state, untestable at component level.*
- [ ] 15. A tax-auditor session: disabled controls are genuinely inert under real pointer interaction,
      and hovering one surfaces the not-allowed tooltip and cursor — mirroring `UsersIndexTest.php`'s
      `elementFromPoint`-informed hover check, since the same `pointer-events-none` trap applies here.
- [ ] 16. `->assertNoJavaScriptErrors()` on load and after every interaction above, per
      [test-quality-checklist.md](../../docs/testing/frontend/test-quality-checklist.md).

**Highest-risk tests** — if only four were written, these retire the most risk: **11** (the PRD's central
invariant, at the one layer where the native-widget delivery risk meets the most consequential business
rule), **10** (a confirmed, sign-off-backed requirement that nothing else can prove), **4** (a UI that
reports success on a refused write is the worst outcome per 0017's D4), and **8** (the direct UI
expression of "the catalog does not allow inventing new countries", in its only falsifiable form).

**Deliberately not tested here, as decisions rather than gaps:**

- **Persistence, the string-vs-float cast, structural-column immutability at the write path, the
  single-default invariant at the database level, the atomicity-under-failure rollback, the seeder
  cross-check, and every route/method authorization allow-deny** — all 0017's, in `IndexTest.php`,
  `SetSalesRegionActiveTest.php` and `SalesRegionPolicyTest.php`. Re-asserting them here is the
  "does a test already exist for this risk" red flag
  [coverage-review-checklist.md](../../docs/testing/qa/coverage-review-checklist.md) warns about.
- **A bare "no add-region button exists" assertion** — replaced by the falsifiable pair in test 8.
- **Running `SalesRegionSeeder`** to arrange state — forbidden by 0016.
- **A pixel/screenshot comparison of the grouped rendering** — the requirement is "grouped and separately
  configurable", which structural assertions prove more robustly than a screenshot that breaks on theme drift.
- **Re-driving the sign-in form** in any test — arrange with `actingAs()` + role assignment.
- **Tax-rate resolution semantics** — 0026's, even though PRD §2.1's *"the default rate applies when no
  region matches"* scenario sits in the same block.

## Expected outcome
A tax administrator holding `sales-regions.edit` opens **Taxes → Sales Regions** and sees the seeded
catalog: each entry's code chip, name, description and rate %, with Spain's five fiscal territories
grouped and collapsible beneath "España", every other country as a top-level sibling, and an
amber badge on the single default entry. An unconfigured rate is visibly distinct from a configured 0%.
Editing an entry opens a modal exposing exactly `code`, `description` and `rate` — with name, slug and
kind shown as read-only context — and a rate field that accepts `21,5`. Entries can be enabled and
disabled inline, except the current default, whose control is disabled with a tooltip pointing to the
edit modal; disabling it there requires picking a replacement from a select offering only *active*
entries, and omitting one produces a message next to that field rather than a silent no-op or a 500.
Nowhere on the screen is there any way to add a country. A tax auditor sees the same screen with every
mutating control disabled and explained.

## Acceptance criteria
- [ ] The list renders each entry's code chip, name, description and rate %, matching the prototype's
      layout and structure (not its markup). *(PRD scenario: "Configure the tax rate on a seeded region entry"; PRD AC 1, 2)*
- [ ] A `NULL` rate renders distinctly from a `0.000` rate, in **both** directions, using no float cast
      and no truthiness test. *(D6; 0017 D6)*
- [ ] Spain's five fiscal territories render grouped beneath the "España" row and can be collapsed and
      re-expanded; each remains separately configurable; every other country renders top-level with no
      expand affordance. *(PRD scenario: "Spain exposes its fiscal sub-territories as separate entries"; PRD AC 1)*
- [ ] The edit modal exposes `code`, `description` and `rate` only; name, slug and kind appear as
      read-only context with no form control. *(PRD scenario: "The catalog does not allow inventing new countries")*
- [ ] The rate field is `type="text" inputmode="decimal"`, and a rate typed as `21,5` reaches the server
      with its comma intact. *(D1; 0017 D12)*
- [ ] An invalid rate renders a message next to the rate field, leaves the form open, and leaves the
      previously configured rate rendered in the list. *(PRD Scenario Outline: "An invalid tax rate is rejected"; PRD AC 6)*
- [ ] Setting a new default moves the badge: it appears on the new entry **and disappears from the old
      one**. *(PRD scenario: "Marking a new default clears the previous one"; PRD AC 3)*
- [ ] The current default's inline enable-disable control renders disabled with an explanatory tooltip,
      and disabling it is possible only through the edit modal with a replacement named there.
      *(PRD scenario: "Disabling the current default region is blocked unless a new default is set"; PRD AC 4)*
- [ ] Omitting the replacement renders a message next to the replacement field — not a silent no-op, not
      a 500, not an error with no visible field to attach to. *(0017 D4)*
- [ ] The replacement select offers only **active** entries other than the one being disabled. *(0017 D10)*
- [ ] The set-default control renders disabled on an already-default row and on an inactive row. *(0017 D10)*
- [ ] Every disabled affordance uses the two-branch `@if`/`@else` form with an explicit `flux:tooltip`
      wrapper, and any `cursor-not-allowed!` sits on that wrapper, never on the button. *(errors-log.md)*
- [ ] No create/add-region control exists anywhere on the screen, and no interaction the screen offers
      changes `SalesRegion::count()`. *(PRD scenario: "The catalog does not allow inventing new countries")*
- [ ] A row whose `canEdit` is false renders every mutating control disabled with a tooltip.
- [ ] The screen is reachable from a **Taxes** navigation heading, not as a top-level item. *(PRD AC 1)*
- [ ] Every row control carries its `data-test` hook on **both** the enabled and the disabled branch. *(D8)*
- [ ] All UI copy is English source strings through `__()`, added key-for-key to both
      `lang/en/sales-regions.php` and `lang/es/sales-regions.php`; no hardcoded Spanish literals. *(D9)*
- [ ] The screen renders correctly in light and dark mode and produces no JavaScript console errors.
- [ ] No prototype HTML/CSS/JS is ported; the screen is Livewire + Blade + Flux + Tailwind only.

## Definition of Done
- [ ] Tests written and green (the full suite, not just this story's — per
      [contracts.md](../../docs/contracts.md)'s Full Test Suite Gate Rule)
- [ ] Code reviewed (code-reviewer)
- [ ] No security findings (appsec-auditor)
- [ ] Documentation updated (docs-keeper)
- [ ] Acceptance criteria met
- [ ] The [open questions](#open-questions--confirm-before-phase-3) answered by the product owner and
      folded in **before** Phase 3 starts
- [ ] **D1** (`type="text" inputmode="decimal"`) and **D6** (the `NULL`-vs-`0.000` string rendering)
      implemented as recorded — the two most likely to be "simplified" into the obvious-looking wrong form

## Dependencies & risks

**Dependencies**

- **[Story 0016](0016-sales-region-catalog-schema-and-seeder.md) — hard, blocking.** Table, model,
  enum, factory. Still at the **new** stage.
- **[Story 0017](0017-sales-region-tax-configuration-backend.md) — hard, blocking.** The component
  class, the route, the policy, the actions, and the `lang/*/sales-regions.php` files this story grows.
  Still at the **new** stage, **contrary to the commissioning brief's claim that it is done.**
  **0018 cannot start Phase 3 until both have completed Phase 7.**
- **[Story 0013](0013-sidebar-module-gating-ui.md) — soft.** Owns `config/modules.php`, this story's
  preferred sidebar target. A documented fallback exists if the ordering slips (see the sidebar note
  in [Files](#files-to-createmodify)).
- **[Story 0006b](done/0006b-browser-test-infra-setup.md) — satisfied.** `tests/Browser/` is wired up
  and runs on Chromium in CI, so this story's browser tests can be written and run.
- **[Story 0002](done/0002-seed-roles-permissions-catalog.md)** — the `sales-regions.*` permission
  strings already exist (verified in `RolePermissionSeeder::MODULES`). No code dependency.

**Risks**

1. **Both Flux/Blaze traps will recur by construction**, not by accident — this screen has strictly more
   disabled branches than the Users screen that first produced them. Highest-probability regression in
   the story.
2. **`type="number"` sneaking into the rate field**, defeating D12 silently and invisibly to every
   component-level test. Test 10 is the only guard.
3. **A `(float)` cast creeping into the rate rendering** for "nicer" formatting, reintroducing the
   precision hazard 0017's Larastan notes warn about even on a read-only path.
4. **File collision with 0017** on `lang/{en,es}/sales-regions.php`: 0017 **creates** them, 0018 grows
   them additively. If the two ever run concurrently,
   [contracts.md](../../docs/contracts.md#parallel-agent-file-ownership-rule)'s Parallel Agent
   File-Ownership Rule governs. D7 removes the second collision point (`app/Enums/SalesRegionKind.php`)
   by keeping this story out of `app/` entirely.
5. **DOM size.** ~255 rows in one table even before Open question 1 is answered; verify no perceptible
   jank on paint and modal open. Flux ships a `skeleton` component as the cheap mitigation.
6. **`x-show="! $wire.active"` staleness** if the switch's binding is ever changed to a variant that
   does not sync until blur — the reveal would lag a keystroke. Test 11 exercises it.
7. **The sidebar entry may be ungated** under the fallback path, exposing a Taxes link to every
   authenticated user. Cosmetic only — `can:sales-regions.view` still refuses access server-side — but
   it must not be forgotten, exactly as 0006's ungated Users link was recorded and is still pending 0013.

## Open questions — confirm before Phase 3

Per [contracts.md](../../docs/contracts.md)'s Uncertainty Handling Rule, these are **not** pre-decided.

**Q1 — How should the screen handle the ~249 inactive, unconfigured country rows?** 0016 seeds ~249 ISO
countries **inactive with a `NULL` rate**, alongside just 6 business-relevant rows (España + its 5
fiscal territories — there are no grouping entries, per **D10**). 0017's contract has no `$search`, no filter and no pagination property, and
`$regions` must stay unfiltered because the edit modal has to reach an inactive country like "Francia".
Nothing in the PRD addresses it. Both amigos raised this independently.

- **(a) Client-side collapse + client-side filter (recommended).** The 6 active rows render open; the
  ~249 inactive countries sit inside one Alpine-toggled "Show all countries" section, closed on first
  paint, with a text filter over `name`/`code`. **Recommended because** it needs **no 0017 contract
  change**, sits entirely inside this story's file ownership, ships in 0018 alone, and matches the
  PRD's own framing — administrators configure the entries that matter, the rest await configuration.
- **(b) Server-side search/pagination.** Cleaner at very large scale, but it is a real amendment to a
  0017 contract already confirmed at Phase 1 (a new property plus query logic), so it re-opens a settled
  story.
- **(c) Ship one flat table of all ~255 rows.** Cheapest; buries the 6 rows that matter under 249 that
  do not. Advised against.

**Q2 — Does the "Active" column need to distinguish *inactive* from *unconfigured*?** Every one of the
~249 inactive countries is *also* rateless, so under option (a) the two states are visually
near-synonymous in the collapsed section. Options: **(a) no distinction (recommended)** — `is_active` is
the only state the PRD names, and a second visual axis invents a concept the data model does not have;
**(b)** add an explicit "not configured" treatment. Recommend (a) and revisit only if Q1's answer makes
the collapsed section browsable enough for the ambiguity to matter.

**Q3 — Is D4's "disable the default only inside the edit modal" the UX you want?** It is contract-clean
(zero new properties) and is the only shape that guarantees the `replacementDefaultId` error has a
rendered field to attach to. But a reviewer could reasonably prefer a **lighter, purpose-built
confirmation dialog** instead of routing through the full edit form. That alternative *is* a 0017
contract change (a new modal-open boolean plus a locked target id) and must be raised with 0017's owner
**before** its Phase 3, not worked around later. Recommend keeping **D4** as recorded.

**Q4 — Should the inline row switch exist at all (D5), or should every mutation go through the edit
modal?** 0017 explicitly leaves the trigger shape to this story. A single interaction surface is simpler
to test and document; two surfaces are faster to use for the common enable/disable. Recommend keeping
**D5** (both, split by which transition can fail), because the common case — activating one of the 249
seeded-inactive countries — is a one-click operation that a modal would make three.

## Provenance

Both required Phase 1 participants **were convened and both returned their contributions before this
document was composed** — closing the process gap
[0017's own Provenance section](0017-sales-region-tax-configuration-backend.md#provenance) records for
itself.

- **`frontend-expert`** contributed the file list, the technical approach, the grouping mechanism (D2/D3),
  the default-toggle design (D4/D5), the rate-rendering formula (D6), and Q1's option set. It verified
  against the installed `vendor/livewire/flux` that Flux **Free** ships no accordion/disclosure component.
- **`frontend-qa`** contributed the test-file ownership split, the Gherkin, the tiered test list, the
  highest-risk ranking, the deliberately-not-tested decisions, and the `$regions`-ordering and
  `data-test`-convention gaps.
- **`product-owner`** classified the task, composed the document, and made three corrections/additions
  the amigos did not have in view: the **sidebar target** (`config/modules.php` via story 0013, whose
  `group` field is what actually satisfies the PRD's "inside the Taxes area" requirement — the expert
  had proposed editing `sidebar.blade.php` directly, not having read 0013), **D7** (keeping
  `SalesRegionKind::label()` deferred, since this screen renders `kind` structurally and never as text —
  the expert had proposed adding it), and the **dependency-state correction** at the head of this
  document (0016 and 0017 are both still at the `new` stage, not done).

Both amigos independently reached **D1** (`type="text"`, never `type="number"`) from different
directions — the expert from the widget's coercion behaviour, QA from "what test could catch this" —
which is the strongest signal in this debate and the reason D1 is called out in the Definition of Done.

**Convergent findings, recorded as such:** the ownership split (`IndexTest.php` is 0017's,
`IndexRenderingTest.php` is 0018's), the recurrence risk of both Flux/Blaze traps, and the need for
`data-test` hooks on both branches of every row control were each raised by both participants
independently.
