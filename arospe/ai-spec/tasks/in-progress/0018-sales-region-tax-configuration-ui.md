# [0018] Sales Regions & Taxes screen — list, grouping, edit modal and the default-toggle UX

## Description
Build the Livewire **view layer** for the Sales Regions screen of
[PRD Epic 2 §2.1](../../../docs/PRD/PRD.md#21-sales-regions--taxes): a list of seeded region entries
(code chip, name, description, rate %), Spain's five fiscal sub-territories grouped and expandable
beneath the "España" row, an edit modal (`code` / `description` / `rate`), an enable-disable control,
and the default-toggle UX that makes the single-default invariant legible — attempting to disable the
current default without naming a replacement is blocked with a clear message, and setting a new default
visibly clears the old one. The rate input accepts a Spanish-locale decimal comma. This story is
**markup, interaction and rendering tests only**: the component class, policy, actions, validation
trait, route and both `lang/*/sales-regions.php` files are sibling backend story
[0017](../done/0017-sales-region-tax-configuration-backend.md); the table, model, enum, factory and seeder are
[0016](../done/0016-sales-region-catalog-schema-and-seeder.md).

## Type
frontend (related_task_id: **0017**) | includes database-expert: **no**

> **Why this stays one story (INVEST — Small).** It is large by acceptance-criterion count (list,
> grouping, rate rendering, edit modal, active toggle, default swap, blocked-disable, empty/disabled
> affordances, sidebar entry, two test files), but every candidate split lands in the **same single
> Blade file**, `resources/views/livewire/sales-regions.blade.php`. Splitting it would mean a second
> story editing the first story's markup — the two-stories-one-file collision
> [contracts.md](../../../docs/contracts.md#parallel-agent-file-ownership-rule) exists to prevent, and
> the same reasoning [story 0006](../done/0006-users-list-editor-ui.md) recorded for the Users screen.

> ✅ **Dependency-state, updated 2026-08-26.** At the time this debate ran, the brief that commissioned it
> described 0017 as "already done" when it was not — `0016` and `0017` were both still at the **new** stage,
> and this story's design below was built against 0017's *specified but unbuilt* public surface (exactly the
> position 0006 was in against 0004). **Both have since completed Phase 7 and moved to `ai-spec/tasks/done/`**
> — verified against `HEAD`: `app/Models/SalesRegion.php`, `app/Livewire/SalesRegions/Index.php`,
> `app/Actions/SalesRegions/*`, `database/factories/SalesRegionFactory.php` and the `sales_regions` migration
> all exist and their tests are green. **The blocker this note originally raised is closed; Phase 3 may
> start.** The "Interface contract consumed from 0017" section below still needs reading against the real
> shipped code rather than the contract-driven draft, since one divergence was already found and corrected
> while resolving [Q4](#open-questions--resolved-before-phase-3) (the `setActive()` signature). See
> [Dependencies & risks](#dependencies--risks).

## Debate decisions (confirmed during Phase 1)

Reached by the two convened amigos (`frontend-expert`, `frontend-qa`) plus `product-owner`. Decisions
**D1–D10** are settled; the items that were genuinely open at the close of the debate are in
[Open questions](#open-questions--resolved-before-phase-3) and were **not** pre-decided here — all four
have since been resolved by the product owner (2026-08-26), three of them with binding additions.

| # | Decision | Reasoning |
|---|---|---|
| **D1** | **The rate input is `type="text" inputmode="decimal"` — never `type="number"`.** | The single most consequential markup decision in the story. A native `<input type="number">` performs its own client-side parsing: typing `21,5` is either refused as a keystroke or coerced before submission, so the comma **never reaches the wire payload** for 0017's component-side `str_replace(',', '.', …)` normalisation (D12) to act on. `type="text"` + `inputmode="decimal"` keeps the mobile numeric keypad while doing no coercion. Both amigos reached this independently. It is invisible to `Livewire::test()->set()` — see [test 10](#tests-to-perform). |
| **D2** | **Grouping is a view-side concern over the flat `$regions` array. No 0017 contract change.** | `$regions` already carries `parentId`, `kind` and `sortOrder` per row. The view groups at render time (`whereNull('parentId')->sortBy('sortOrder')`, then `where('parentId', $row['id'])->sortBy('sortOrder')` per parent). Because the view sorts, this also closes QA's flagged gap about `$regions`' ordering — the rendering does not depend on one, and the grouping test asserts by *relationship*, not by array position. **Corrected at Phase 2 against `HEAD`:** QA's gap was recorded as "0017 guarantees **no ordering**", which is no longer true — the shipped `loadRegions()` really does `orderBy('sort_order')->orderBy('name')`. That makes the view's own sort *redundant in practice* but it stays **mandatory in principle**: `$regions`' order is a private implementation detail of a method 0018 does not own, so the markup must not become the thing that depends on it. Keep both sorts; do not "simplify" the view to trust the query's order. |
| **D3** | **Spain's expansion is a client-side Alpine toggle, default-open.** | PRD §2.1's wording is *"When they **expand** Spain's entries"*, so an expand affordance is required rather than a bare indented list. Every child row is already in the locked array on first paint — there is nothing to fetch, so a `wire:click` round trip to toggle CSS visibility is the wrong tool. Default-**open** because five children framed by the PRD as inherent structure should not start hidden. Consequence QA asked for: this makes the grouping's *interactive* half a **browser** test and its *structural* half a component test. |
| **D4** | **Disabling the current default happens only inside the edit modal; the current default row's inline switch renders `disabled` with an explanatory tooltip.** | Follows from 0017's D4 caveat. The refusal arrives as a `ValidationException` keyed `replacementDefaultId`; if the inline switch called `setActive()` directly on the default row, that error would land in the bag with **no rendered field to attach it to** — an invisible failure, the worst outcome per 0017's own reasoning. Inside the modal the replacement `flux:select` is already on screen, so the message renders exactly where the administrator can act on it. This design adds **zero new Livewire properties**. |
| **D5** | **The inline row switch handles only the two always-safe transitions** — inactive → active, and active-but-not-default → inactive — calling `setActive($regionId, $newValue)` directly. | Neither can throw, so neither can produce an orphaned error. This is 0017's sanctioned "0018 may render an inline row switch, a modal field, or both" left deliberately as *both*, split by which transition can fail. |
| **D6** | **A `NULL` rate renders as an em dash; `0.000` renders as `0%`.** Rendered by string manipulation, never a float cast. | 0016/0017 D6 make "unconfigured" vs "a real 0%" load-bearing. `{{ $region['rate'] === null ? '—' : rtrim(rtrim($region['rate'], '0'), '.').'%' }}` — the `decimal:3` cast returns a **string**, and 0017's Larastan notes forbid comparing it numerically. The naive `@if ($region['rate'])` is the exact PHP-truthiness trap that would render a legitimate `0.000` identically to "not set". |
| **D7** | **`SalesRegionKind::label()` stays deferred — this story does not add it, and does not touch `app/Enums/`.** | 0016 deferred it to "the first story that actually renders `kind`", and 0017 restated the deferral. On this screen `kind` drives *structure and styling* (indentation, chevron presence, grouping-row treatment) and is **never rendered as text** — so it still has no consumer, and 0016's own stated rule ("nothing renders it yet") still applies. Keeping it out also keeps 0018 purely view-layer + tests + lang, and removes the `app/Enums/SalesRegionKind.php` file-collision risk with 0017 that `frontend-expert` flagged. **Escape hatch:** if Phase 3's design does surface a textual `kind`, adding `label()` plus its two lang keys is pre-authorised in writing by 0016 and is not scope creep — but it must then be recorded, not slipped in. |
| **D8** | **`data-test` row hooks: `edit-region-{id}`, `toggle-active-region-{id}`, `set-default-region-{id}`, plus `expand-region-{id}` on the chevron.** Present on **both** the enabled and the disabled branch of each control. | Extends the `edit-user-{id}` / `delete-user-{id}` convention verified in `resources/views/livewire/users.blade.php`. Mandatory here because these controls are icon-only and there may be ~255 rows, so no visible text uniquely identifies a row's action. Hook-on-both-branches is what lets a test select the same control regardless of whether it is enabled — the rule `docs/api/routes.md` records for the Users screen. |
| **D9** | **UI copy is English source strings through `__()`**, added **additively** to the `lang/{en,es}/sales-regions.php` files 0017 creates, key-for-key identical across both. | The same decision [0006](../done/0006-users-list-editor-ui.md) recorded: the PRD's Spanish copy is reference layout, not literal requirement, until Epic 5's language switcher. **Verified at Phase 2 against the shipped files:** 0017 owns **two** top-level groups, `errors.*` *and* `attributes.*` (the latter feeds `validate()`'s third argument, so renaming a leaf there breaks 0017's own messages) — 0018 adds `index.*` / `fields.*` / `labels.*` beside them and touches neither. |
| **D10** | **The "grouping" catalog concept is removed — this screen renders no supranational entries (no "Unión Europea", no "Internacional").** *(scope decision, 2026-08-18)* | The Sales Region catalog holds only individual countries plus Spain's five fiscal sub-territories, per the same decision applied to [0016](../done/0016-sales-region-catalog-schema-and-seeder.md). Consequences owned here: no top-level "grouping" siblings to render, no `kind === Grouping` branch anywhere in the markup, no `grouping()` factory state in test arrangement, and no separate "groupings" section or filter category in the list design — the list is countries + Spain's territories only. Row counts drop accordingly (see [Q1](#q1--how-should-the-screen-handle-the-248-inactive-unconfigured-country-rows--resolved-a-with-two-additions): 254 rows, of which **6** are business-relevant, not 8). **Spain's fiscal-territory *visual* grouping (D2/D3) is a different, unrelated concept and is deliberately unaffected.** |

Resolved directly from the docs, no decision needed: the view path is the **flat**
`resources/views/livewire/sales-regions.blade.php` per the
[`Index`-in-a-subfolder exception](../../../docs/conventions/naming.md#exception-a-component-named-index-resolves-to-its-parent-folders-name)
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
    Then that row's enable-disable control is disabled, with a tooltip that directs them
      to the entry's edit form to name a replacement default

  # --- The collapsed inactive-country section (Q1) ---

  Scenario: The seeded but unconfigured countries do not bury the configured entries
    Given a tax administrator viewing the seeded Sales Region catalog
    When they open the Sales Regions screen
    Then the active entries are shown, and the inactive countries are behind
      a single collapsed "Show all countries" section

  Scenario: The inactive countries can be narrowed by typing
    Given a tax administrator with the "Show all countries" section open
    When they type part of a country's name into the section's filter box
    Then only the entries matching what they typed remain visible in that section

  Scenario: An activated country joins the configured entries
    Given a tax administrator with "Francia" shown as inactive in the "Show all countries" section
    When they enable the "Francia" entry from its row
    Then the "Francia" row is shown among the active entries and no longer inside
      the "Show all countries" section

  Scenario: Enabling a country does not close the section it was found in
    Given a tax administrator who has opened the "Show all countries" section and filtered it
    When they enable one of the filtered entries from its row
    Then the section is still open and the filter box still holds what they typed

  # --- A refusal that arrives with no field on screen (Q4) ---

  Scenario: A refusal raised from a row control is still explained on the page
    Given a tax administrator whose row was made the default by someone else
      after the screen was last drawn
    When they disable that row from its enable-disable control
    Then a message explaining a replacement default must be named is shown above the table

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

> Scenarios follow [gherkin-guidelines.md](../../../docs/testing/frontend/gherkin-guidelines.md) rules 1
> (named business-role actor — *a tax administrator* / *a tax auditor*, never "I") and 3 (exactly one
> `When` per scenario).

## Files to create/modify

**Owned by this story:**

- `resources/views/livewire/sales-regions.blade.php` — **replace.** The whole screen. **Corrected at
  Phase 2:** this file was listed as *create*, and it already exists — 0017 shipped a **placeholder**
  (`<p>{{ count($regions) }}</p>` plus a comment naming 0018 as its owner) so its component could mount
  and render, exactly as 0004 did for `users.blade.php`. This story replaces that body wholesale. Two
  facts verified against `HEAD` so nobody rediscovers them mid-implementation: 0017's four test files
  (`IndexTest.php`, `SetSalesRegionActiveTest.php`, `SetDefaultSalesRegionTest.php`,
  `RefusalLoggingTest.php`) contain **no** `assertSee`/`assertSeeHtml`/`->html()` assertion at all, so
  nothing pins the placeholder's markup and the replacement breaks none of them — but every one of them
  goes through `Livewire::test()`, which **does** render this view, so a Blade error here fails 0017's
  suite too, not only this story's. **Do not create
  `resources/views/livewire/sales-regions/index.blade.php`** — that nested path is not what Livewire
  resolves for `App\Livewire\SalesRegions\Index` and would be a silently unused duplicate.
- `config/modules.php` — **modify** (see the sidebar note below). 0013's shipped registry splits `groups`
  and `items` — the entry sketched in this story's original Phase 1 draft (`'group' => 'Taxes', 'label' =>
  'Sales Regions'`, literal English copy) does **not** match it and would break `config:cache` in the same
  way `base-standards.md` warns against (a `group` value must name a real `groups` key; a `label` must be a
  translation key, never copy — `lang/es/` can never reach a literal string in `config/`). This story adds a
  **new `groups.taxes` entry** (no shipped group covers Taxes yet) plus one `items.sales_regions` entry:
  ```php
  // config/modules.php — new 'groups' entry
  'taxes' => [
      'heading' => 'navigation.groups.taxes',
      'icon' => 'receipt-percent',
      'expandable' => false,   // one entry today; revisit if a second Taxes screen ships
      'expanded_when' => null,
      'class' => null,
  ],
  ```
  ```php
  // config/modules.php — new 'items' entry
  'sales_regions' => [
      'group' => 'taxes',
      'label' => 'navigation.items.sales_regions',
      'icon' => 'globe-americas',
      'route' => 'sales-regions.index',
      'current_when' => 'sales-regions.*',
      'permissions' => ['sales-regions.view'],
  ],
  ```
  > 🔑 **The registry key is `sales_regions`, snake_case — corrected at Phase 2.** The original sketch
  > wrote `sales-regions`, and this is the project's **first genuinely multi-word registry key**, so it is
  > the first entry that has to choose. [naming.md](../../../docs/conventions/naming.md#translation-keys)
  > already decided it and even names this exact case: *"A future registry key that is genuinely
  > multi-word is snake_case on both sides (`items.sales_regions`), never kebab-case — unlike the
  > permission names above, whose kebab-case is imposed by the seeded catalog and mapped at lookup."*
  > Three identifiers move together and must agree, since `sidebar-nav.blade.php` renders
  > `data-test="sidebar-link-{{ $itemKey }}"` straight from the registry key: the `config/modules.php`
  > key, the `lang/*/navigation.php` leaf, and the hook a test selects — **`sidebar-link-sales_regions`**.
  > Only the three *values* keep their kebab-case, because they are not registry keys: the permission
  > `sales-regions.view` (seeded catalog, story 0002), the route name `sales-regions.index`, and its
  > `current_when` pattern. Verified against `HEAD`: all three shipped registry keys today
  > (`dashboard`, `users`, `roles`) are single lowercase words, which is exactly why nothing forced this
  > decision before.
  >
  > The item icon is `globe-americas` rather than a second `receipt-percent`: the shipped `settings`
  > group already establishes that a group and its item carry *different* icons (`cog-6-tooth` /
  > `shield-check`). Both icon stubs verified present in `vendor/livewire/flux/stubs/.../flux/icon/`.
- `lang/en/navigation.php`, `lang/es/navigation.php` — **modify, additively.** New leaves
  `groups.taxes` and `items.sales_regions`, mirroring the registry's own keys exactly per
  [naming.md](../../../docs/conventions/naming.md#translation-keys)'s registry-mirroring rule — not new files,
  0013 already created both, each holding exactly two `groups` leaves and three `items` leaves today.
- `lang/en/sales-regions.php`, `lang/es/sales-regions.php` — **modify, additively.** 0017 creates both
  for its `errors.*` copy; this story adds the list/label/field copy under new top-level groups, keeping
  the two files key-for-key identical.
- `tests/Feature/SalesRegions/IndexRenderingTest.php` — **new.** Rendering-level `Livewire::test()`
  coverage.
- `tests/Browser/SalesRegionsIndexTest.php` — **new.** Pest 4 browser tests for the JS-driven behaviour.
- `tests/Feature/Navigation/SidebarModuleGatingTest.php` — **modify.** **Reason corrected at Phase 2**,
  after reading the real file: its two Phase-4 guard tests (*"every ungated registry item is on the
  explicit allow-list"* and *"every gated registry item's permissions match exactly what its route's
  `can:` middleware enforces"*) both `foreach (config('modules.items') …)` **generically**, so the
  registry-vs-route drift cross-check picks the new entry up with **no edit at all** — the original
  reason given here was wrong, and acting on it would have produced a redundant hand-written copy of a
  check that already generalises. What genuinely needs adding is the per-entry coverage the generic
  tests cannot supply, all of it hook-based per that file's own stated rule (never
  `assertDontSee('Taxes')`, which collides with the page title and the URI `taxes/sales-regions`):
  - a role holding exactly `sales-regions.view` sees `sidebar-link-sales_regions` and
    `sidebar-group-taxes`;
  - a role holding a *related but different* `sales-regions.edit` sees **neither** — the same
    never-advertise-a-link-the-route-refuses case 0013 added for `users.create`, and the one that
    actually pins `permissions` to the route's single `can:sales-regions.view`;
  - the **Taxes group vanishes entirely** for a role without it (filter-before-group, its only entry);
  - three **existing** tests enumerate hooks positively or negatively and will pass while silently
    under-covering the new entry unless they are extended: *"a Super Admin … sees every registered
    module entry"*, *"a user with zero module permissions still sees the Dashboard entry"*, and *"a role
    holding neither users.view nor roles.manage sees neither gated entry"*.

> 📌 **The sidebar entry goes in `config/modules.php`, not in `sidebar.blade.php`.** [Story 0013](../done/0013-sidebar-module-gating-ui.md)
> has since **shipped and closed** (verified against `HEAD`, 2026-08-26): it introduced `config/modules.php`
> as the declarative, permission-gated nav registry and replaced the static `Platform` group in
> `resources/views/layouts/app/sidebar.blade.php` with `<x-sidebar-nav />`. **The "fallback if 0013 has not
> landed" path this note originally carried is moot and removed** — 0013 landed before 0018 started Phase 3,
> so the fallback path (an ungated `flux:sidebar.group` hand-added to `sidebar.blade.php`) must not be taken;
> use the registry, per the corrected entry above. A `groups.taxes` heading satisfies PRD §2.1's *"lives as a
> section **inside the Taxes area** (not a top-level sidebar item)"* exactly the way `groups.settings` does
> for Roles — see [architecture/authorization.md](../../../docs/architecture/authorization.md#the-second-half-of-a-module-gate-the-sidebar-registry)
> for the registry's five rules in full.

**Explicitly NOT this story** (listed so the boundary is unambiguous):

| File | Owner |
|---|---|
| `app/Livewire/SalesRegions/Index.php` | 0017 |
| `app/Concerns/SalesRegionValidationRules.php`, `app/Policies/SalesRegionPolicy.php` | 0017 |
| `app/Actions/SalesRegions/{UpdateSalesRegion,SetDefaultSalesRegion,SetSalesRegionActive}.php` | 0017 |
| `routes/sales-regions.php` — the `sales-regions.index` route (URI `taxes/sales-regions`) and its `can:sales-regions.view` middleware, plus web.php's one-line `require` | 0017 |
| `lang/{en,es}/sales-regions.php` — **creation** and the `errors.*` **and `attributes.*`** keys | 0017 |
| `tests/Feature/SalesRegions/IndexTest.php` (component logic, persistence, authorization) | 0017 |
| `tests/Feature/SalesRegions/SetSalesRegionActiveTest.php` | 0017 |
| `tests/Feature/SalesRegions/SetDefaultSalesRegionTest.php` | 0017 |
| `tests/Feature/SalesRegions/RefusalLoggingTest.php` | 0017 |
| `tests/Feature/Policies/SalesRegionPolicyTest.php` | 0017 |
| `app/Enums/SalesRegionKind.php` (incl. `label()`) | deferred — see **D7** |
| The `sales_regions` table, model, enum, ISO fixture, factory, seeder | 0016 |
| Tax-rate **resolution** for a product/order | 0026 |

> **Test-file ownership.** `tests/Feature/SalesRegions/IndexTest.php` is **0017's**, exactly as
> `tests/Feature/Users/IndexTest.php` was 0004's. This story gets `IndexRenderingTest.php` +
> `tests/Browser/SalesRegionsIndexTest.php`. 0006's own story file records that an earlier draft
> listed `IndexTest.php` as new and would have had two stories creating one file — do not repeat it.

### Interface contract consumed from 0017

**Corrected 2026-08-26 against the real shipped code** (`app/Livewire/SalesRegions/Index.php`), replacing
the contract-driven draft written before 0017 existed — the original block below is what the Q4 resolution
flagged as stale (a `setActive()` default that does not compile against the shipped signature):

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

public function mount(): void;   // no markup call site — runs on GET, before any view renders
public function openEditModal(string $regionId): void;
public function save(): void;
public function closeModal(): void;
public function setDefault(string $regionId): void;
public function setActive(string $regionId, bool $active, string $replacementDefaultId): void;
```

> ⚠️ **Every *mutating* method above also declares trailing, container-resolved parameters** — precisely
> (corrected at Phase 2 by reading the real signatures): `openEditModal()` takes
> `LogRefusedPrivilegedAttempt $log` only; `setDefault()` takes `SetDefaultSalesRegion` + `$log`;
> `setActive()` takes `SetSalesRegionActive` + `$log`; `save()` takes **two** action classes
> (`UpdateSalesRegion`, `SetSalesRegionActive`) plus `$log`. `closeModal()` **and `mount()`** take none —
> the original note said "every method except `closeModal()`", which over-counted `mount()`.
> **The markup never passes these**; Livewire resolves them from the container on every call,
> exactly like `wire:click="deleteUser(@js($user.id))"` on the Users screen never passes `Logout $logout`.
> Only the plain, data-shaped parameters shown above (with their real names) go in a `wire:click` call.
>
> **`setActive()`'s `$replacementDefaultId` has NO default value** — a defaulted parameter cannot precede
> the trailing container-resolved dependencies in the real signature. Every `wire:click="setActive(...)"` in
> this story's markup **must pass all three arguments explicitly**, an empty string when no replacement is
> named: `wire:click="setActive(@js($region.id), true, '')"`. This is what Q4's resolution corrected — the
> original D5 text said `setActive($regionId, $newValue)`, which does not compile against the shipped action.

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
>    [errors-log.md](../../../docs/errors-log.md).

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
  [errors-log.md](../../../docs/errors-log.md) — a written-out `@if`/`@else` branch that emits an explicit
  `<flux:tooltip>` wrapper on the disabled side (**never** a conditionally-bound `:tooltip="$cond ? … : null"`,
  which Blaze treats as present whenever the attribute is written at all), and `cursor-not-allowed!` on
  the **tooltip wrapper**, never on the `disabled:pointer-events-none` button. This screen has more
  disabled branches than Users did, so both traps will recur by construction.
- **Loading:** `wire:loading.attr="disabled"` scoped with `wire:target` to the specific row action, so
  one row's pending toggle does not disable the whole table.
- **Accessibility & theming:** `aria-label` on every icon-only control (edit, set-default, chevron,
  switch); `dark:` variants throughout on the `zinc` palette; every string through `__()`.

## Tests to perform

Level chosen per [coverage-policy.md](../../../docs/testing/frontend/coverage-policy.md) — browser tests
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
      `SalesRegion::count()` unchanged. *A bare `assertDontSee('Add region')` is refused as the anti-pattern [errors-log.md](../../../docs/errors-log.md) records and 0016/0017 both already declined.*
- [ ] 9. Clearing the rate field and saving renders the unconfigured marker again.
      *Retires a regression in 0017's D6 blank-clears semantics at the layer the administrator sees.*
- [ ] 9b. **The orphaned-refusal outlet (Q4, addition A4-a).** Call `setActive($id, false, '')` on a row
      that **is** the current default — the exact state a concurrent default swap produces between paint
      and click — and assert the `replacementDefaultId` message renders in the page-level outlet above
      the table, with the modal closed. Then assert the same message renders **exactly once** when the
      modal *is* open (the `@unless ($showModal)` guard).
      *Added at Phase 2: **A4-a had an acceptance criterion and no test.** This is reachable at component
      level without any race — `Livewire::test()->call('setActive', $defaultRow->id, false, '')` reproduces
      it deterministically, so it needs no browser test. Retires the one D4/D5 hole the resolution itself
      identified: a refusal whose only field lives inside a closed modal renders nowhere at all.*

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
- [ ] 16. **The collapsed section survives a round trip (Q1, addition A1-b).** Open "Show all countries",
      type into the filter, activate a country with its inline switch, then assert the section is still
      open, the filter still holds its text, and the activated row has moved into the active section
      (**A1-a**). *Retires the regression that would make Q4's inline switch worse than the modal it
      replaces — and it is invisible to component tests, since the state under test is entirely Alpine's.*
- [ ] 17. `->assertNoJavaScriptErrors()` on load and after every interaction above, per
      [test-quality-checklist.md](../../../docs/testing/frontend/test-quality-checklist.md).

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
  [coverage-review-checklist.md](../../../docs/testing/qa/coverage-review-checklist.md) warns about.
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
- [ ] The 6 active entries render open; the 248 inactive countries sit in one collapsed "Show all
      countries" section with a client-side text filter over `name`/`code`. *(Q1 (a))*
- [ ] Activating an entry from the collapsed section moves its row into the active section on the next
      render — no stability hack keeps it in place. *(Q1, addition A1-a)*
- [ ] The collapsed section stays open and the filter box keeps its text across an inline `setActive()`
      round trip. *(Q1, addition A1-b)*
- [ ] The Active control renders `is_active` only; "unconfigured" is carried by the Rate column's em
      dash (**D6**) and nowhere else — "España" renders active with an em-dash rate. *(Q2 (a))*
- [ ] The current default row's disabled switch carries a tooltip that routes the administrator to the
      entry's **edit form** to name a replacement, not a bare refusal. *(Q3, addition A3-a)*
- [ ] The inline switch calls `setActive('{id}', <bool>, '')` — three explicit arguments; the shipped
      0017 signature has **no default** for `$replacementDefaultId`. *(Q4 contract correction)*
- [ ] A `replacementDefaultId` error raised outside the modal renders in a page-level outlet above the
      table, shown only when the modal is closed so it can never render twice. *(Q4, addition A4-a)*
- [ ] The screen is reachable from a **Taxes** navigation heading, not as a top-level item, through a
      `config/modules.php` registry entry keyed **`sales_regions`** (snake_case) whose `permissions` is
      exactly `['sales-regions.view']` — the single ability `routes/sales-regions.php` gates the route on.
      *(PRD AC 1; [naming.md](../../../docs/conventions/naming.md#translation-keys)'s registry-key rule)*
- [ ] Every row control carries its `data-test` hook on **both** the enabled and the disabled branch. *(D8)*
- [ ] All UI copy is English source strings through `__()`, added key-for-key to both
      `lang/en/sales-regions.php` and `lang/es/sales-regions.php`; no hardcoded Spanish literals. *(D9)*
- [ ] The screen renders correctly in light and dark mode and produces no JavaScript console errors.
- [ ] No prototype HTML/CSS/JS is ported; the screen is Livewire + Blade + Flux + Tailwind only.

## Definition of Done
- [ ] Tests written and green (the full suite, not just this story's — per
      [contracts.md](../../../docs/contracts.md)'s Full Test Suite Gate Rule)
- [ ] Code reviewed (code-reviewer)
- [ ] No security findings (appsec-auditor)
- [ ] Documentation updated (docs-keeper)
- [ ] Acceptance criteria met
- [x] The [open questions](#open-questions--resolved-before-phase-3) answered by the product owner and
      folded in **before** Phase 3 starts — **done 2026-08-26.** All four resolved (Q1 (a), Q2 (a), Q3
      keep **D4**, Q4 keep **D5**), each with its rejected alternatives recorded. Phase 3 additionally
      inherits four binding items folded in with them: **A1-a/A1-b** (section membership derives from
      `isActive`; the disclosure state and filter text survive a Livewire round trip), **A3-a** (the
      disabled default switch's tooltip routes the administrator to the edit form), **A4-a** (a
      page-level `replacementDefaultId` error outlet, rendered only when the modal is closed), and the
      **`setActive()` three-argument contract correction** — all listed in
      [Acceptance criteria](#acceptance-criteria)
- [ ] **D1** (`type="text" inputmode="decimal"`) and **D6** (the `NULL`-vs-`0.000` string rendering)
      implemented as recorded — the two most likely to be "simplified" into the obvious-looking wrong form

## Dependencies & risks

**Dependencies**

- **[Story 0016](../done/0016-sales-region-catalog-schema-and-seeder.md) — hard, blocking. Satisfied.** Table,
  model, enum, factory. Closed and in `done/` as of 2026-08-20.
- **[Story 0017](../done/0017-sales-region-tax-configuration-backend.md) — hard, blocking. Satisfied.** The
  component class, the route, the policy, the actions, and the `lang/*/sales-regions.php` files this story
  grows. Closed and in `done/` as of 2026-08-26 — verified against `HEAD`, not merely against its own task
  file. **Both dependencies are met; Phase 3 may start.**
- **[Story 0013](../done/0013-sidebar-module-gating-ui.md) — soft. Satisfied.** Owns `config/modules.php`, this
  story's sidebar target. Closed and in `done/`; the fallback this bullet originally reserved (an ungated,
  hand-added `flux:sidebar.group` in `sidebar.blade.php`) is moot and must not be taken — see the corrected
  sidebar note in [Files](#files-to-createmodify).
- **[Story 0006b](../done/0006b-browser-test-infra-setup.md) — satisfied.** `tests/Browser/` is wired up
  and runs on Chromium in CI, so this story's browser tests can be written and run.
- **[Story 0002](../done/0002-seed-roles-permissions-catalog.md)** — the `sales-regions.*` permission
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
   [contracts.md](../../../docs/contracts.md#parallel-agent-file-ownership-rule)'s Parallel Agent
   File-Ownership Rule governs. D7 removes the second collision point (`app/Enums/SalesRegionKind.php`)
   by keeping this story out of `app/` entirely.
5. **DOM size.** 254 rows in one table. Mitigated by [Q1](#q1--how-should-the-screen-handle-the-248-inactive-unconfigured-country-rows--resolved-a-with-two-additions)'s
   answer (248 of them collapsed on first paint), but verify no perceptible jank on paint and modal open
   — and note the resolution leaves `x-show` vs. `<template x-if>` to Phase 3 precisely so this risk can
   be answered with a measurement. Flux ships a `skeleton` component as the cheap mitigation.
6. **`x-show="! $wire.active"` staleness** if the switch's binding is ever changed to a variant that
   does not sync until blur — the reveal would lag a keystroke. Test 11 exercises it.
7. ~~The sidebar entry may be ungated under the fallback path~~ — **moot, 2026-08-26.** 0013 shipped before
   0018 reached Phase 3, so the fallback path is removed (see the corrected sidebar note in
   [Files](#files-to-createmodify)); the entry goes through `config/modules.php`'s registry, which is gated
   on `sales-regions.view` by construction, verified by `SidebarModuleGatingTest.php`'s cross-check. The risk
   this bullet described cannot occur under the shipped path.

## Open questions — resolved before Phase 3

**All four are resolved. The Phase 1 open-questions gate is closed (product owner, 2026-08-26).** Each
was raised per [contracts.md](../../../docs/contracts.md)'s Uncertainty Handling Rule and is recorded below
with the answer, the reasoning that produced it, and the *rejected* alternatives — because a rejected
alternative written down is what stops a reviewer re-opening a settled question, the same convention
[0017's Locked decisions](../done/0017-sales-region-tax-configuration-backend.md#locked-decisions-confirmed-at-phase-1)
follows. Three carry **additions** beyond the recommended option; those additions are binding on Phase 3
and are cross-referenced into [Acceptance criteria](#acceptance-criteria) and
[Tests to perform](#tests-to-perform).

> **Seeded row counts, corrected against [database/schema.md](../../../docs/database/schema.md#sales_regions)
> and `database/data/iso-3166-countries.json` (249 entries, España among them).** The catalog is
> **254 rows**: 249 ISO countries + Spain's 5 fiscal territories. **6 are active** (España + its 5
> territories); **248 countries are inactive with a `NULL` rate**. The "~249 inactive / ~255 rows"
> figures used in the questions as originally drafted are each one too high; the resolutions below use
> the verified numbers, and Phase 3 should too.

---

### Q1 — How should the screen handle the 248 inactive, unconfigured country rows? — **RESOLVED: (a), with two additions**

**Decision: option (a) — client-side collapse + client-side filter.** The 6 active rows render open; the
248 inactive countries sit inside one Alpine-toggled "Show all countries" section, closed on first paint,
with a text filter over `name`/`code`. Confirmed as recommended, and the case for it is **stronger now
than when the debate ran**:

- **It needs no backend change, and "reopen 0017" is no longer a live option.** When this question was
  written, 0017 was still at the `new` stage and option (b) meant amending an unstarted contract. 0017
  has since completed Phase 7 and is in `done/` — its `$regions` loads the full catalog unfiltered and
  `#[Locked]`, with no `$search`, filter or pagination property. Option (b) is therefore no longer an
  amendment to a pending story; it is a **new backend story with its own seven phases**, blocking a UI
  story that is otherwise ready. That cost is not justified by 254 rows.
- **Option (b) would not even reduce the payload.** `$regions` must stay unfiltered regardless, because
  the edit modal has to reach an inactive country like "Francia" — a constraint the question itself
  names. So (a) and (c) carry identical server cost, and (b)'s only real gain is DOM size, which is the
  one thing a client-side collapse also addresses.
- **It matches how the data model already divides the catalog.** The split is `is_active`, a real
  column with a real meaning, not an invented UI concept. That is the same test Q2 below fails, and it
  is why the two questions resolve in opposite directions rather than together.
- **It matches the PRD's framing.** [PRD §2.1](../../../docs/PRD/PRD.md#21-sales-regions--taxes) describes
  administrators configuring seeded entries and enabling/disabling them; it never describes browsing
  249 countries as the primary task. Burying the 6 rows that carry rates under 248 that do not — option
  (c) — inverts the screen's purpose on first paint.

*Rejected:* **(b) server-side search/pagination** — a new backend story to solve a problem 254 rows do
not have, for no reduction in what the component must load anyway; revisit only if the catalog ever
grows a further order of magnitude, which a fixed ISO list will not. **(c) one flat table** — cheapest
to build and the worst screen to use; it is also the option most likely to make [risk 5](#dependencies--risks)
(DOM size / paint jank) bite with no mitigation available.

**Addition A1-a — a newly activated row moves into the active section, and that is intended.** Section
membership is derived from each row's `isActive` at render time, so activating "Francia" from the
collapsed section makes its row leave that section and appear among the configured entries on the next
render. This is deliberate: the row moving *is* the confirmation that the click took effect, and the
alternative (freezing section membership until a full page reload) would show an "inactive" row carrying
an on switch, which is worse. Phase 3 must not add a stability hack to keep the row in place.

**Addition A1-b — the disclosure state and the filter text must survive a Livewire round trip.** After
an inline `setActive()` call re-renders the table, the "Show all countries" section must still be open
and the filter box must still hold what the administrator typed. This is **binding, not a nicety**: it
is the entire difference between Q4's inline switch being a one-click bulk workflow and being a control
that closes the section it lives in on every use. Practically this means the Alpine state owning
`open` and the filter string must sit on an element Livewire's DOM morphing preserves, with stable
`wire:key`s on the rows beneath it — the same class of concern
[risk 6](#dependencies--risks) already flags for `x-show="! $wire.active"`. It gets an acceptance
criterion and a browser test (**test 16** — corrected at Phase 2 from "test 17", which is the
`assertNoJavaScriptErrors()` sweep, not this).

*Left to Phase 3:* whether the collapsed section's 248 rows are `x-show`-hidden (in the DOM, simplest,
consistent with **D3**'s Spain expansion) or deferred with `<template x-if>` (cheaper first paint).
Either satisfies the requirement, which is stated in terms of **visibility**, not DOM presence. If
measured paint jank makes deferral necessary, adopting it is pre-authorised here and is not scope creep
— but it must then be recorded, and it must not break the D3 grouping or the `data-test` hooks.

---

### Q2 — Does the "Active" column need to distinguish *inactive* from *unconfigured*? — **RESOLVED: (a), no distinction**

**Decision: option (a) — the Active control shows `is_active` and nothing else.** Confirmed as
recommended, on a stronger ground than the one the debate recorded ("a second visual axis invents a
concept the data model does not have"). Two facts settle it outright:

1. **The "unconfigured" axis is already rendered, in the Rate column, by D6.** A `NULL` rate shows an em
   dash and a `0.000` rate shows `0%`. Folding that same distinction into the Active control would say
   the same thing twice, in a column whose header promises something else — and it would be ambiguous
   about *what* is unconfigured (rate? code? description?), where the Rate column is precise.
2. **The two axes are genuinely orthogonal in the seeded data, and conflating them would misrepresent a
   real row.** "España" ships **active with a `NULL` rate** — deliberately, as a disclosure/parent node
   that is not independently rateable ([schema.md](../../../docs/database/schema.md#sales_regions)). An
   Active control that also meant "configured" would have to render España as some third thing, or lie
   about it. That single row is sufficient to refuse (b).

Under Q1's answer this is doubly moot: inside the collapsed section every row is inactive **by
construction** — that is what defines the section — so an "inactive" treatment there marks every row
identically and carries no information at all.

*Rejected:* **(b) an explicit "not configured" treatment on the Active control** — duplicates D6,
misdescribes España, and adds a second visual axis to the one control on the screen that must stay
unambiguous, since it is also the control D4 disables on the default row. **Not deferred, decided:** the
question's own "revisit if Q1 makes the collapsed section browsable" clause is answered — it does, and
the answer is still (a), for the two reasons above rather than for the "hard to notice either way" one.

---

### Q3 — Is D4's "disable the default only inside the edit modal" the UX you want? — **RESOLVED: keep D4, with one addition**

**Decision: keep D4 exactly as recorded.** Disabling the current default happens only inside the edit
modal; the current default row's inline switch renders `disabled` with a tooltip. Reasoning:

- **It is the only shape that guarantees the refusal is visible.** `SetSalesRegionActive` throws a
  `ValidationException` keyed `replacementDefaultId` (verified against the shipped
  `app/Actions/SalesRegions/SetSalesRegionActive.php`). An error keyed to a field that is not on screen
  is an invisible failure — the outcome 0017's own D4 reasoning, and this file's
  [test 4](#tests-to-perform), both name as the worst possible one. Inside the modal the replacement
  `flux:select` is already rendered, so the message lands where the administrator can act on it.
- **The cost of the alternative rose since the question was written.** The lighter purpose-built dialog
  as described (a new modal-open boolean plus a locked target id) is a change to 0017's public surface,
  and the question's own instruction — raise it with 0017's owner *before* its Phase 3 — can no longer
  be followed: **0017 completed Phase 7 and is closed.** It is now a new backend story.
- **The operation is rare and considered, so friction is not the right thing to optimise.** Moving the
  catalog default is a store-setup action, not a repeated one. Opening the entry's edit form on the way
  is *context* — the administrator sees the rate and code of the entry they are switching off — not an
  obstacle. This is the opposite of Q4's case, and the asymmetry is the point: **frequency is what
  decides how many surfaces a transition gets.**

*Rejected, and recorded so it is not re-proposed:* a **client-side-only confirmation dialog** — a
third path the debate did not name, in which an Alpine-only modal reuses the existing (unlocked)
`replacementDefaultId` property and calls `setActive()`, needing **no 0017 change at all**. It is
technically available and it is still refused: it would create a **second rendering surface for the
single most consequential refusal in the story** (PRD AC 4, the never-zero-defaults invariant),
doubling the failure-mode surface — including the error-bag-survives-the-round-trip fragility that
[risk 6](#dependencies--risks) already flags — for an operation that happens roughly once per store.
One surface, already specified and already covered by tests 4, 11 and 12, is worth more here than a
saved click.

**Addition A3-a — the disabled switch's tooltip must route the administrator, not just refuse them.**
D4 is only acceptable UX if the disabled control says where to go. The tooltip copy must name the edit
form as the place to name a replacement (e.g. *"This is the default entry. Open its edit form to name a
replacement default before disabling it."*), not merely *"not allowed"* or *"a replacement must be named
first"*. English source string through `__()` per **D9**, key-for-key in both lang files. This upgrades
the [Gherkin scenario](#gherkin) *"The current default cannot be switched off from its own row"* and
gets its own acceptance criterion.

---

### Q4 — Should the inline row switch exist at all (D5)? — **RESOLVED: keep D5, with one mandatory contract correction and one addition**

**Decision: keep D5 — both surfaces, split by which transition can fail.** Reasoning:

- **The split is principled, not a duplication.** Verified against the shipped
  `SetSalesRegionActive::__invoke()`: the *only* throwing branch is `! $active && $target->is_default`.
  So inactive → active and active-but-not-default → inactive genuinely cannot throw, and D5 is not "two
  surfaces for one rule" — it is one rule partitioned by failure mode, with every throwing transition
  routed to the one surface that can render its error (**D4/Q3**).
- **Q1's answer makes the inline switch load-bearing.** The common case on this screen is activating
  seeded-inactive countries out of the collapsed section — potentially several in a sitting. One click
  versus three (open modal, toggle, save) is the difference between a workable setup flow and a tedious
  one. Removing the inline switch would make Q1's collapsed section largely pointless to browse.
- **It matches the screen's own precedent.** The Users screen's row actions establish per-row controls
  for the common operation with a modal for the considered one; this is the same shape.

*Rejected:* **modal-only for every mutation** — simpler to test and document, and it makes the single
highest-frequency operation on a 254-row screen three times more expensive. The simplicity argument is
real but it is paid for by the administrator, repeatedly.

> ⚠️ **Mandatory contract correction — `setActive()` takes three arguments, with no default.** D5 as
> recorded says the inline switch calls `setActive($regionId, $newValue)`. **That call does not compile
> against the shipped 0017 component**, whose real signature is:
>
> ```php
> public function setActive(string $regionId, bool $active, string $replacementDefaultId, SetSalesRegionActive $setSalesRegionActive, LogRefusedPrivilegedAttempt $log): void
> ```
>
> `$replacementDefaultId` carries **no default value** — 0017's own docblock states why (a defaulted
> parameter cannot precede the trailing container-resolved dependencies) and states the obligation
> explicitly: *"Every caller (0018's Blade markup, every test) must pass all arguments explicitly, an
> empty string when no replacement is named."* The inline switch must therefore call
> **`setActive('{id}', true, '')`** / **`setActive('{id}', false, '')`**. The
> [Interface contract consumed from 0017](#interface-contract-consumed-from-0017) block above has been
> corrected to match — both blocks now agree, and both match `HEAD`. Phase 3 should still re-verify the real
> signatures before writing the markup rather than trusting either block on faith, exactly as
> [errors-log.md](../../../docs/errors-log.md) requires of any finding written against a tree that can move.

**Addition A4-a — an orphaned `replacementDefaultId` error must still surface.** D5's "these two
transitions cannot throw" is true of the *design*, but `SetSalesRegionActive` re-reads `is_default`
**under lock inside its transaction**, not from the instance the view rendered. So a row that became the
default between paint and click *can* refuse an inline disable, throwing the one error that has no field
on screen — the exact D4 failure mode, arriving through a race instead of through a design flaw. It is
rare (it needs a concurrent default swap by a second administrator) and it fails **closed**, so nothing
is corrupted; but a click that visibly does nothing and explains nothing is not acceptable. Phase 3 must
render a page-level outlet for `replacementDefaultId` above the table, shown only when the modal is
**not** open (`@unless ($showModal)`) so the message can never render twice. One element, one
acceptance criterion, no new property, and it closes the last hole in D4/D5's reasoning.

## Provenance

Both required Phase 1 participants **were convened and both returned their contributions before this
document was composed** — closing the process gap
[0017's own Provenance section](../done/0017-sales-region-tax-configuration-backend.md#provenance) records for
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

## Phase 1 open-questions gate — closed 2026-08-26 (product owner)

The Definition of Done's *"open questions answered by the product owner and folded in before Phase 3
starts"* gate is **met**. All four questions are resolved in
[Open questions](#open-questions--resolved-before-phase-3): **Q1 (a)** client-side collapse + filter,
**Q2 (a)** no second visual axis on the Active control, **Q3** keep **D4**, **Q4** keep **D5**. Each was
evaluated against [PRD §2.1](../../../docs/PRD/PRD.md#21-sales-regions--taxes) and the **shipped** code of
stories 0016/0017 rather than against the recommendation alone, which is what produced the four items
Phase 3 inherits beyond the recommended options — **A1-a**, **A1-b**, **A3-a**, **A4-a**, and the
`setActive()` three-argument correction. Two of those (**A4-a**, and the contract correction) exist only
because the resolution re-read the real `app/Livewire/SalesRegions/Index.php` and
`app/Actions/SalesRegions/SetSalesRegionActive.php`; neither was visible from this document's own text.

**What changed between the debate and this resolution, and why it mattered.** Stories **0016 and 0017
both completed Phase 7 and are now in `ai-spec/tasks/done/`.** The debate was conducted against their
*specified but unbuilt* surface, and the dependency-state ⚠️ at the head of this document reflects that
earlier state. This directly strengthened Q1 and Q3: both had an alternative whose stated cost was
"amends a 0017 contract confirmed at Phase 1", and for both that alternative is now a **new backend
story with its own seven phases** instead. Neither is worth that. The counts used in the questions as
drafted (~249 inactive, ~255 rows) were also verified and corrected to **248 inactive of 254 rows, 6
active**, against [database/schema.md](../../../docs/database/schema.md#sales_regions) and the 249-entry
ISO fixture.

**The two adjacent items this pass flagged have since been applied.** They were left out of the
open-questions pass itself, which was scoped to the gate alone, and both landed immediately afterwards on
2026-08-26: the dependency-state ⚠️ at the head of this document and the
[Dependencies & risks](#dependencies--risks) bullets now record 0016/0017/0013 as **closed and in
`done/`** rather than at the `new` stage, and the `config/modules.php` entry in
[Files](#files-to-createmodify) was rewritten against 0013's shipped `groups`/`items` registry with its
translation-key `heading`/`label` values, replacing the literal-English-copy sketch that would have broken
`config:cache`. **Nothing from this gate blocks Phase 3.**

## Phase 2 reconciliation (`code-reviewer`, 2026-08-26)

`code-reviewer` ran Phase 2 (INVEST + this project's "first specialist review") and returned **PASS with
five blocking findings, all fixed in place** — the same disposition style
[0017's own Phase 2](../done/0017-sales-region-tax-configuration-backend.md#phase-2-reconciliation-code-reviewer-2026-08-25)
used. Every finding came from verifying this document's claims against `HEAD` rather than trusting its
text, **including today's own corrections**. This section is the change log, not a second copy of the
reasoning — each fix is applied to the sections above.

**Blocking, fixed:**

- **F-1 — the registry key was kebab-case, contradicting the one convention that already decided this
  case by name.** The sketch wrote `items.sales-regions`; `naming.md`'s registry-mirroring rule names
  `items.sales_regions` **verbatim** as the multi-word example, and this is the project's first
  multi-word registry key, so the sketch would have shipped the convention's own counter-example.
  Corrected in both code blocks, the lang bullet and a new acceptance criterion, with the three
  identifiers that move together spelled out (`sidebar-nav.blade.php` renders
  `data-test="sidebar-link-{{ $itemKey }}"` straight from the key, so the hook is
  `sidebar-link-sales_regions`) and the three kebab-case *values* that correctly stay kebab
  (`sales-regions.view`, `sales-regions.index`, `current_when`).
- **F-2 — `resources/views/livewire/sales-regions.blade.php` was listed as *create* and already
  exists.** 0017 shipped a placeholder body, exactly as 0004 did for `users.blade.php`. Changed to
  **replace**, with two facts verified so Phase 3 does not rediscover them: 0017's four test files carry
  **no** rendering assertion (so the rewrite breaks none of them), but all four go through
  `Livewire::test()`, which renders this view — a Blade error here fails 0017's suite too.
- **F-3 — three of the four binding items from the Q1–Q4 resolutions never reached the Gherkin.**
  A1-a, A1-b and A4-a had acceptance criteria and (mostly) tests but no scenario, so `frontend-qa`
  translating Gherkin → browser tests would have produced coverage silently missing the collapsed
  section, its filter, the row-moves-on-activate behaviour and the orphaned refusal. Five scenarios
  added, all rule-1/rule-3 conformant.
- **F-4 — A3-a claimed to "upgrade" a Gherkin scenario that was never touched, and the untouched text
  said the exact thing A3-a rejects.** The scenario read *"a tooltip explaining a replacement must be
  named first"* — one of the two wordings A3-a explicitly refuses in favour of routing the administrator
  to the edit form. Rewritten to match the resolution.
- **F-5 — A4-a had an acceptance criterion and no test at all.** Added as **test 9b**, at component
  level rather than browser level: `call('setActive', $defaultRow->id, false, '')` reproduces the
  race's *state* deterministically with no concurrency, and the second half asserts the
  `@unless ($showModal)` guard so the message can never render twice.

**Non-blocking, fixed:**

- **F-6 — D2 asserted "0017 guarantees **no ordering** for `$regions`".** False against `HEAD`: the
  shipped `loadRegions()` does `orderBy('sort_order')->orderBy('name')`. Corrected while *keeping* the
  view-side sort mandatory — the ordering is a private detail of a method this story does not own.
- **F-7 — the boundary table named `routes/web.php`.** The route lives in its own
  `routes/sales-regions.php` (URI `taxes/sales-regions`), per the one-file-per-area convention.
- **F-8 — the boundary table omitted two shipped 0017 test files**, `SetDefaultSalesRegionTest.php` and
  `RefusalLoggingTest.php`. Added, so "these four files are 0017's" is enumerable rather than partial.
- **F-9 — the `SidebarModuleGatingTest.php` "modify" reason was wrong.** Both of 0013's Phase-4 guard
  tests iterate `config('modules.items')` **generically**, so the registry↔route drift cross-check needs
  no edit; acting on the stated reason would have hand-written a redundant copy of a check that already
  generalises. Replaced with what actually needs adding, including the three *existing* tests that
  enumerate hooks and will silently under-cover the new entry unless extended.
- **F-10 — the trailing-parameter ⚠️ over-counted.** `mount()` takes no container-resolved parameter
  either (not only `closeModal()`), and `save()` takes **two** action classes. Each of the four real
  signatures is now listed exactly.
- **F-11 — A1-b cross-referenced "test 17"**; it is test 16 (17 is the `assertNoJavaScriptErrors()`
  sweep).
- **F-12 — D9 credited 0017 with `errors.*` only.** It also owns `attributes.*`, which feeds
  `validate()`'s third argument — renaming a leaf there breaks 0017's own messages.
- **F-13 — the group and item shared one `receipt-percent` icon.** Item changed to `globe-americas`,
  matching the shipped `settings` group's own group-icon/item-icon split. Both stubs verified present.

**Verified as accurate rather than rewritten** (recorded so a later pass does not re-derive them): the
`$regions` row shape, all twelve keys, byte-for-byte against `loadRegions()`; `replacementCandidates()`'s
`{id, name}` "active, not-self" shape; `setActive()`'s three-argument no-default signature and the
`SetSalesRegionActive` docblock sentence quoted for it; the claim that the **only** throwing branch is
`! $active && $target->is_default`, and that it throws keyed `replacementDefaultId` (confirmed against
the action and `lang/*/sales-regions.php`); Q1's claim that `$regions` loads the full catalog unfiltered
and `#[Locked]` with no `$search`/filter/pagination property; the four runtime traps (`rate` is
`string|null` from `decimal:3`; `kind` casts to a `SalesRegionKind` **instance**; `$regions` and
`$editingRegionId` are `#[Locked]`; every bound property is non-null); the **254 / 6 active / 248
inactive** counts (249-entry ISO fixture + 5 territories, `is_active => $country['alpha2'] === 'ES'`);
D7 (no `label()` on the shipped enum) and D10 (no `Grouping` case); the four factory states
`fiscalTerritoryOf()` / `isDefault()` / `inactive()` / `withRate()`; 0013's registry shape and both
`navigation.php` files; Flux Free shipping **no** accordion/disclosure/tree component while `switch`,
`textarea`, `select`, `modal`, `table`, `tooltip`, `error` and `skeleton` all exist; and every one of
this file's 16 relative links resolving from its current two-levels-deep location.

**INVEST verdict — PASS, with *Small* at the ceiling.** The "stays one story" argument was re-verified
rather than accepted: every candidate split really does land in the one Blade file, and the only part
that *could* be split cleanly (the sidebar entry — `config/modules.php` + two lang leaves + test
extensions, no Blade collision) is three lines of registry data without which the screen this story
builds is unreachable from the UI, so splitting it would ship a screen nothing links to. **Independent**
✅ — all three dependencies (0016, 0017, 0013) are closed and in `done/`, verified against `HEAD` and not
merely against their task files. **Estimable / Testable** ✅. The size risk is real and is recorded rather
than waved through: if Phase 3 overruns, the carve-out candidates are the **client-side filter** inside
the collapsed section (test 16's filter half, and the Q1(a) criterion's filter clause) and **browser test
15** (the disabled-control hover/`pointer-events` check, which duplicates a technique already pinned on
two other screens) — in that order. Neither is blocking, and neither may be dropped silently.

**Two things Phase 3 must do before writing markup, not after:**

1. **Re-verify `App\Livewire\SalesRegions\Index`'s real signatures**, as the Q4 block already instructs —
   this review confirms them at today's `HEAD` and that guarantee expires the moment anything touches
   0017's component.
2. **Decide `x-show` vs `<template x-if>` for the 248 collapsed rows by measurement**, per Q1's
   *left to Phase 3* clause, and record the choice. Note the constraint the two interact on: A1-b
   requires the disclosure state and filter text to survive a Livewire round trip, so whichever is
   chosen, the Alpine state must live on an element the morph preserves, with stable `wire:key`s beneath
   it.

**Phase 3 may start.**

## Phase 3 reconciliation (`frontend-qa` + `frontend-expert`, 2026-08-26)

**Phase 3.1 (red tests).** `frontend-qa` wrote `tests/Feature/SalesRegions/IndexRenderingTest.php` (11
tests, the task file's numbered items 1–9 plus 9b) and `tests/Browser/SalesRegionsIndexTest.php` (8 tests,
items 10–17 in Phase 2's corrected numbering), against `App\Livewire\SalesRegions\Index`'s real, already-
shipped public surface — verified against `HEAD` before writing a single test, confirming this file's own
"Interface contract consumed from 0017" section still matched. All 19 tests confirmed genuinely red (a
missing element/hook, never a fatal/missing-class error) against the still-placeholder view.

**Phase 3.2 (implementation).** `frontend-expert` built the whole screen, the sidebar registry entry, and
the lang additions per this file's Technical approach / Files-to-create sections, making all 29 rendering
tests and 8 browser tests pass (component counts grew during the pass: 11→29 after two red-test-file fixes
described below, `IndexRenderingTest.php`'s own test count roughly tripling from dataset expansion already
present in `frontend-qa`'s draft).

**One deliberate deviation from D5's literal text, required by 0017's real (not draft) contract.** D5 reads
`setActive($regionId, $newValue)`. That does not compile: `App\Livewire\SalesRegions\Index::setActive()`'s
real signature is `setActive(string $regionId, bool $active, string $replacementDefaultId, SetSalesRegionActive $a, LogRefusedPrivilegedAttempt $log)`
— `$replacementDefaultId` has no default (a defaulted parameter cannot precede the trailing
container-resolved dependencies), already flagged in this file's own "Interface contract" section and in
Q4's resolution. The inline switch calls `setActive('{id}', true, '')` / `setActive('{id}', false, '')`,
passing an empty string explicitly. Not a new finding — recorded here only because it's where the literal
D5 text would have misled an implementer who didn't cross-reference the contract section.

**A real, non-trivial bug found and fixed in a test helper, not just the markup.**
`salesRegionsRowControlDisabled()` (in `IndexRenderingTest.php`, borrowed from
`Users/IndexRenderingTest.php`'s technique) matched a bare `\sdisabled` substring, which false-matched on
every `flux:button` regardless of state — Flux's compiled classlist carries the literal substring
`disabled:opacity-75` (a Tailwind variant-prefixed utility) on the ENABLED branch too. Re-anchored to
`\sdisabled="disabled"`, matching what `Users/IndexRenderingTest.php` actually does (the file this one's
own header claims to borrow the technique from, which had already gotten this right).

### ⚠️ Known, accepted residual risk: real-browser flakiness on the replacement-select interaction, documented rather than hidden

Getting `tests/Browser/SalesRegionsIndexTest.php`'s test 11 (the atomic default swap, D3's PRD-central
scenario) reliably green required real, hands-on debugging of a genuine Livewire+Playwright interaction bug
— not a flaw in 0017's component or in this story's business logic, both of which are proven correct at
the component level (all 29 `IndexRenderingTest.php` tests, exercising the same `setActive()`/`save()` via
`Livewire::test()->call()`, pass with zero flakiness).

**What was found, with the evidence, not just the symptom.** The edit modal's `active` checkbox, bound via
a bare `wire:model="active"`, left the DOM's own `wire:snapshot` attribute — read directly via
`document.querySelector('[wire:snapshot]')`, the actual ground truth of what the NEXT Livewire request will
send — stuck at the pre-click value, **even though** the checkbox's own DOM `.checked` state and Livewire's
client-side reactive proxy (`Livewire.first().active`) both correctly showed the toggled value immediately.
This is not a race that a longer wait closes: it reproduced 100% of the time in isolation, regardless of
`wire:model` vs `wire:model.live` vs `$wire.set(..., true)`, regardless of `->wait()` duration, and
regardless of whether `->waitForEvent('networkidle')` was inserted (which additionally proved dangerous in
this environment — see below). **Fixed** by binding the checkbox via `wire:click="$toggle('active')"` (a
genuine Livewire *action* call) instead of `wire:model` — the same mechanism the already-reliable
row-level `setActive()` switch uses. Re-verified via the same `wire:snapshot` inspection: correctly updated,
every time, in isolated testing.

**What was found but NOT fixed, recorded honestly.** The replacement `<flux:select>`'s own
`wire:model="replacementDefaultId"` binding exhibits the *same symptom* (DOM value correctly set by
`->select()`, but `wire:snapshot` never reflects it) — but unlike the checkbox, this did **not** resolve
under any tried mitigation: `wire:model.live`, `$wire.set()`, a manually-dispatched genuine bubbling
`change` event, a plain native `<select>` with no Flux wrapper at all, real keyboard-driven selection
(`ArrowDown`, which Playwright implements as trusted OS-level key events, ruling out an
event-trust/`isTrusted` theory), and generous settle waits before interacting. A `flux:dropdown` +
`flux:menu` (per-option `wire:click`) redesign — mirroring the checkbox's own proven fix — was prototyped
and did not complete testing within this pass's time budget; it remains the concrete next step if this
proves to be a recurring CI flakiness source, not a longer sleep. **Mitigated, not fixed**: a documented,
bounded `->wait(2)` after the selection (the same shape test 12 already used successfully), verified to pass
3/3 consecutive runs plus the full 8-test browser file and the full 895-test suite in this pass — not a
provable 100%, an honest residual.

**A second, independent finding from the same investigation, worth its own line: `->waitForEvent('networkidle')`
is actively dangerous in this environment**, not merely ineffective. It was tried as the theoretically
"correct" semantic wait and instead hung for 15+ minutes before Pest's own underlying action timeout
eventually fired — consistent with Playwright's own upstream guidance against relying on `networkidle`
(some background connection in this dev environment, plausibly Vite's HMR websocket, appears to keep the
page permanently "busy" by that definition). The multi-minute hangs this produced across several repeated
manual test runs during debugging accumulated ~60 leaked `playwright run-server` processes and OOM-killed
the `mysql` container mid-investigation (exit code 137) — recovered by restarting it and killing the leaked
processes, no data lost, full suite re-confirmed green afterward. **Do not reintroduce
`->waitForEvent('networkidle')` anywhere in this repo's browser tests without first proving it settles
promptly and repeatedly in this specific environment.**

**Verification, not merely applied and trusted:** the checkbox fix confirmed via direct `wire:snapshot`
inspection (not inferred from test pass/fail); test 11 run 3 consecutive times standalone (pass/pass/pass),
the full `SalesRegionsIndexTest.php` file (8/8), `IndexRenderingTest.php` (29/29), `SidebarModuleGatingTest.php`
(18/18), the full suite unscoped (895/895, 2580 assertions), `vendor/bin/pint --test --format agent`
(passed), and `vendor/bin/phpstan analyse` level 7 unscoped (0 errors) — all re-run clean *after* the MySQL
recovery, not only before.
