# [0039] Payment methods — store-settings screen (UI)

## Description
Build the Livewire **view layer** for the Payment Methods store-settings screen of
[PRD §2.5](../../docs/PRD/PRD.md#25-payment-methods-store-settings): a card list of the available
payment methods — this phase, **bank transfer is the only one** — showing whether an IBAN is
configured, plus an edit modal for that single configurable field with the IBAN validation error
surfaced inline. This story is markup/interaction/navigation only; the table, model, seeder,
`Iban` rule, action, policy, route and the component class itself are the paired backend story
**0038**, which must land first.

## Type
frontend (related_task_id: **0038**) | includes database-expert: **no**

> **Why this stays one story (INVEST — Small).** Card list, edit modal, empty/"not configured"
> state and the disabled-action branch all land in the **same single Blade file**,
> `resources/views/livewire/payment-methods.blade.php`. Splitting it would mean a second story
> editing the first story's markup — the two-stories-one-file collision that
> [0006](done/0006-users-list-editor-ui.md) already documented and avoided.

## Debate decisions (confirmed before writing this story)

| # | Question | Decision |
|---|---|---|
| 1 | Card list or `flux:table`? | **Cards** (`flux:card` in a `grid gap-4 sm:grid-cols-2`). The PRD names the Shipping carrier cards as an acceptable pattern, and the technical argument is stronger than the aesthetic one: method #2 will almost certainly have a *different* configurable field (a PayPal account is not an IBAN), which a fixed-column table would have to absorb as conditional columns or a details sub-row. A card renders its own field set, so a second method fills the next grid cell with no redesign. This is a deliberate divergence from the Users screen, which is genuinely tabular. |
| 2 | Edit inline or in a modal? | **Modal** — not a free choice: 0038's component contract already names `openEditModal()` / `closeModal()`, so a `flux:modal` bound with `wire:model="showModal"` is what those methods mean. Inner content gated behind `@if ($showModal)`, mirroring [`users.blade.php`](../../resources/views/livewire/users.blade.php). |
| 3 | Is the configured IBAN masked? | **No masking, full display.** This is the store's own *receiving* account — §2.5 defines it as "the account customers must transfer payment to", i.e. a value the store will publish to customers, not a secret like a card number. A reveal interaction would be ceremony protecting nothing. Revisitable; see [Open questions](#open-questions) OQ-3. |
| 4 | Is the IBAN displayed grouped? | **Grouped into 4-character blocks at render time only** (`implode(' ', str_split($iban, 4))`), because that is how every bank prints one. **The grouping must never touch `$iban` itself and must never appear in the edit modal's `<flux:input wire:model="iban">`** — the input binds to the raw property, which 0038's normalisation already tolerates spaced or unspaced input. Formatting happens on the way *out*, never on the way in. |
| 5 | An actor with `payment-methods.view` but not `.edit` | The Configure/Edit action renders **disabled with a tooltip**, not hidden — the per-row `Gate::allows()` **UI hint** convention already documented in [authorization.md](../../docs/architecture/authorization.md#gateallows-in-a-list-query-is-a-ui-hint-not-a-layer) and shipped on the Users rows. The two permissions are distinct catalog entries, so this is a real role, not a hypothetical. The hint is layered *on top of* 0038's `Gate::authorize()` in `save()`, never instead of it. |
| 6 | Confirmation step before changing an already-configured IBAN? | **No — a deliberate "no", not an oversight.** Neither §2.5 nor 0038's Gherkin implies one, and inventing an unspecified confirm step is new behaviour nobody asked for. Recorded so it is a decision; see OQ-3. |
| 7 | UI string language | **English source strings wrapped in `__()`**, matching the whole app today. Generic chrome (`Payment methods`, `Save`, `Cancel`, `IBAN`) stays as bare `__('...')` literals exactly as `users.blade.php` does; only domain-specific copy goes into `lang/*/payment_methods.php`. The Spanish switcher arrives with Epic 5. |
| 8 | Sidebar entry | This story adds navigation — a screen with no way to reach it is not delivered. **Which file it goes in depends on whether [0013](in-progress/0013-sidebar-module-gating-ui.md) has landed by Phase 3**; both branches are specified in [Files to create/modify](#files-to-createmodify). |

Resolved directly from the docs, no decision needed: **view path** follows the
[`Index`-in-a-subfolder exception](../../docs/conventions/naming.md#exception-a-component-named-index-resolves-to-its-parent-folders-name)
— `App\Livewire\PaymentMethods\Index` ↔ the **flat** `resources/views/livewire/payment-methods.blade.php`,
never a nested `payment-methods/index.blade.php`; **no pagination** (one row); **no create/delete
affordance of any kind** in the markup, because 0038 deliberately ships no create/delete code path
and `PaymentMethodPolicy::create()`/`delete()` return `false`.

## Gherkin

```gherkin
Feature: Payment methods settings screen (bank transfer)

  # --- The catalog view ---

  Scenario: Bank transfer is the only payment method shown
    Given a store administrator on the payment methods settings
    When they view the available payment methods
    Then bank transfer is the only method listed

  Scenario: A freshly seeded store shows bank transfer as not yet configured
    Given a store administrator on a newly seeded store
    When they view the bank transfer method
    Then the screen shows that no IBAN is configured for it

  Scenario: A configured method shows its IBAN
    Given a store administrator, with an IBAN already configured for bank transfer
    When they view the bank transfer method
    Then the screen shows that method as configured with its IBAN

  # --- Opening the edit form ---

  Scenario: The edit form opens blank when no IBAN is configured yet
    Given a store administrator, with no IBAN configured for bank transfer
    When they choose to configure the bank transfer IBAN
    Then the form opens with an empty IBAN field

  Scenario: The edit form opens prefilled with the currently configured IBAN
    Given a store administrator, with an IBAN already configured for bank transfer
    When they choose to edit the bank transfer IBAN
    Then the form opens showing the currently configured IBAN

  # --- Saving ---

  Scenario: Saving a valid IBAN configures the bank transfer method
    Given a store administrator with the IBAN edit form open
    When they save a valid account IBAN
    Then the bank transfer method shows that IBAN as configured

  Scenario: A space-grouped IBAN is accepted and shown in its canonical form
    Given a store administrator with the IBAN edit form open
    When they save a valid account IBAN written in space-separated groups
    Then the bank transfer method shows that IBAN configured in its canonical form

  # --- Rejecting an invalid IBAN ---

  Scenario Outline: An invalid IBAN is rejected with an inline error
    Given a store administrator with the IBAN edit form open
    When they submit <invalid_iban>
    Then a validation message is shown next to the IBAN field
    And the form remains open

    Examples:
      | invalid_iban                            |
      | an IBAN that is not in valid IBAN format |
      | an IBAN whose check digits do not match  |

  Scenario: A rejected IBAN leaves the previously configured one in place
    Given a store administrator, with an IBAN already configured for bank transfer
    When they submit a value that fails IBAN validation
    Then the previously configured IBAN is still shown as configured

  # --- Cancelling ---

  Scenario: A store administrator cancels the IBAN edit form
    Given a store administrator with the IBAN edit form open and a new value entered
    When they cancel without saving
    Then the form closes and the previously configured IBAN is unchanged

  # --- Authorization in the UI ---

  Scenario: The configure action is unavailable without the edit permission
    Given a signed-in administrator whose role grants payment methods view but not edit
    When they view the bank transfer method
    Then the configure action is shown as unavailable

  Scenario: The payment methods settings are inaccessible without the view permission
    Given a signed-in administrator whose role does not grant the payment methods view permission
    When they try to open the payment methods settings
    Then access is refused
```

> Scenarios follow [gherkin-guidelines.md](../../docs/testing/frontend/gherkin-guidelines.md) rules
> 1 (named business-role actor — **"a store administrator"**, reused verbatim from 0038's own
> Gherkin per rule 5's shared-glossary requirement, never "I") and 3 (exactly one `When` per
> scenario). The invalid-IBAN outline carries **two representative failure classes** — structural
> and checksum — deliberately, not 0038's full ten-entry dataset, which 0038 owns; see
> [Tests to perform](#tests-to-perform).
>
> The last scenario is kept for specification completeness and maps to **no new test here**:
> 0038's `AuthorizationTest.php` already covers the route-level 403 and the component-level
> refusal at both layers.

## Files to create/modify

**Owned by this story:**

- `resources/views/livewire/payment-methods.blade.php` — **modify.** 0038 ships this as a minimal
  placeholder purely so `Livewire::test()` can render; this story replaces its content entirely
  with the card grid, the configured / not-configured states, the edit modal, and the
  enabled/disabled Configure action. Exactly the 0004 → 0006 relationship.
- `lang/en/payment_methods.php` + `lang/es/payment_methods.php` — **modify.** 0038 creates both
  files with `names.bank_transfer` and `iban.invalid`; this story appends an **`index` group**
  (`index.configured`, `index.not_configured`, `index.action_not_allowed`), mirroring
  `lang/en/users.php`'s `index.*` group. **If 0038 already shipped a "not yet configured" key,
  reuse it verbatim — do not add a second key meaning the same thing.** Both locale files stay
  key-for-key identical.
- **Navigation — one of two files, depending on what has landed at Phase 3:**
  - *If [0013](in-progress/0013-sidebar-module-gating-ui.md) has **not** landed (expected):*
    `resources/views/layouts/app/sidebar.blade.php` — **modify.** Add one
    `<flux:sidebar.item icon="banknotes" :href="route('payment-methods.index')" :current="request()->routeIs('payment-methods.*')" wire:navigate>`
    beside the existing Users entry, with a comment noting it is scaffolding 0013's registry will
    absorb. Static and ungated, exactly like the Users link — a **cosmetic** leak only; access is
    refused by `can:payment-methods.view` on the route and re-checked in `mount()`, precisely as
    [api/routes.md](../../docs/api/routes.md#usersindex--the-first-permission-gated-route) already
    documents for Users.
  - *If 0013 **has** landed:* add a `config/modules.php` entry keyed on `payment-methods.view`
    instead, and **do not touch `sidebar.blade.php`**, which 0013 replaces with `<x-sidebar-nav />`.
- `tests/Feature/PaymentMethods/IndexRenderingTest.php` — **new.** Component-level rendering tests
  (see below).
- `tests/Browser/PaymentMethodsIndexTest.php` — **new.** Pest 4 browser tests for the real-DOM
  behaviour. The browser suite is wired up and green in CI (task 0006b, `done`).

**Explicitly NOT this story** (listed so the boundary is unambiguous):

| File | Owner |
|---|---|
| `database/migrations/*_create_payment_methods_table.php` | 0038 |
| `app/Models/PaymentMethod.php`, `app/Enums/PaymentMethodCode.php` | 0038 |
| `app/Rules/Iban.php`, `app/Concerns/PaymentMethodValidationRules.php` | 0038 |
| `app/Actions/PaymentMethods/UpdatePaymentMethodIban.php` | 0038 |
| `app/Policies/PaymentMethodPolicy.php` | 0038 |
| **`app/Livewire/PaymentMethods/Index.php`** (including every property in the contract below) | **0038** |
| `routes/web.php` — the `payment-methods.index` registration and its `can:` middleware | 0038 |
| `database/seeders/PaymentMethodSeeder.php`, `database/factories/PaymentMethodFactory.php` | 0038 |
| `tests/Feature/PaymentMethods/UpdateIbanTest.php`, `AuthorizationTest.php` | 0038 |
| `tests/Feature/Seeders/PaymentMethodSeederTest.php`, `tests/Unit/**`, `tests/Datasets/Ibans.php` | 0038 |
| A create/delete path for payment methods, an `is_active` toggle | nobody — refused by design (0038) |
| An order referencing a payment method | Epic 3 (PRD AC 4) |

> **Sequential-implementation requirement.** 0038 and 0039 both write
> `resources/views/livewire/payment-methods.blade.php` and both write the two
> `lang/*/payment_methods.php` files. Their Phase 3 work must therefore **never be dispatched in
> the same batch**, per the
> [Parallel Agent File-Ownership Rule](../../docs/contracts.md#parallel-agent-file-ownership-rule):
> 0038 must be fully closed before 0039 starts.

### Interface contract required from 0038

This view binds to the following. **0038 currently specifies only `mount()`, `openEditModal()`,
`save()`, `closeModal()` and `public string $iban = '';` — the rest of this list is a real gap in
that story's spec, not an addition this story invents.** See OQ-1: the recommended fix is to amend
0038 (still at the `new` stage, so it is free to change) rather than to have a frontend story write
backend component code.

```php
// State
public array $paymentMethods = [];   // rows: array{id: string, code: string, label: string,
                                     //             iban: string|null, configured: bool, canEdit: bool}
                                     // loaded in mount(), reloaded after a successful save()
public bool $showModal = false;      // what openEditModal()/closeModal() toggle; bound with wire:model
public string $iban = '';            // already in 0038 — never ?string (see the traps below)

#[Locked] public ?string $editingMethodId = null;  // set server-side only, never wire:model

// Actions
public function openEditModal(string $methodId): void;  // takes the id even though one row exists
public function save(UpdatePaymentMethodIban $updateIban): void;
public function closeModal(): void;
```

Two contract points worth stating explicitly, both with reasoning rather than preference:

- **`openEditModal()` takes a `$methodId` from day one.** It costs nothing now and avoids a
  breaking signature change on a shipped contract the moment method #2 exists — the same reasoning
  0038 itself used to justify the `code` discriminator column on a one-row table.
- **`canEdit` comes from `Gate::allows('update', $method)`**, i.e. the *same* `PaymentMethodPolicy`
  method `save()` authorizes against, so the disabled state cannot drift from what a click would
  actually do.

Validation errors must land in Livewire's standard `$errors` bag keyed by `iban` — which 0038's
rule already does — so `flux:input` renders the message with **no extra wiring on the view side**.

> **Four runtime traps the markup must not fall into**, three of them already paid for in
> [errors-log.md](../../docs/errors-log.md):
> 1. **`@js()` is mandatory** on `wire:click="openEditModal(@js($method['id']))"`. A value
>    interpolated into a `wire:*` attribute lands in a JavaScript evaluator, where Blade's HTML
>    escaping is undone by the parser.
> 2. **The disabled Configure action must be a separate `@if`/`@else` branch wrapped in an explicit
>    `<flux:tooltip>`** — never `:tooltip="$cond ? … : null"`, which under Blaze renders an empty
>    tooltip bubble on every *enabled* row.
> 3. **`cursor-not-allowed!` belongs on that `flux:tooltip` wrapper, not on the button** — Flux's
>    own `disabled:pointer-events-none` takes the button out of hit-testing entirely.
> 4. **The outer "configured IBAN" display must read the row's persisted `iban` from
>    `$paymentMethods`, never `$this->iban`.** `save()` normalises `$this->iban` in place *before*
>    validating, so a rejected submission leaves that property holding the rejected value — an
>    outer display reading it would show the invalid string as though it were configured. This is
>    the highest-risk failure on this screen; see the browser test that targets it.

### Technical approach

- **Flux UI (Free v2):** `flux:card` per method in a `grid gap-4 sm:grid-cols-2`; `flux:heading`
  for the method label; `flux:badge` (`lime` configured / `zinc` not configured); `flux:button` for
  Configure/Edit; `flux:modal` bound with `wire:model="showModal"` and `@close="closeModal"`;
  `flux:input` with `:label="__('IBAN')"` inside it.
- **Copy differentiates first-time from subsequent edits:** the action reads **Configure** when
  `iban` is null and **Edit** once one is set.
- **Tailwind v4** utilities with `dark:` variants throughout, reusing the `zinc` neutral palette
  already used in `users.blade.php`. Hand-rolled body copy pairs `text-zinc-500 dark:text-zinc-400`.
- **Loading state:** `wire:loading.attr="disabled" wire:target="save"` on the modal's Save button,
  to prevent a double-submit race across the round trip.
- **Accessibility:** the Configure/Edit action is a labelled text button, so its visible label is
  its accessible name and no `aria-label` is needed (unlike Users' icon-only row actions). The IBAN
  field carries a real `:label`, never a placeholder standing in for one. `flux:modal` provides the
  focus trap.
- **Long IBANs (up to 34 characters) wrap naturally** on narrow viewports — no `whitespace-nowrap`,
  no horizontal-scroll container.

## Tests to perform

Levels chosen per [coverage-policy.md](../../docs/testing/frontend/coverage-policy.md) — browser
tests only where real-DOM/Livewire round-trip behaviour is the actual risk, everything else at the
cheaper component level.

**`tests/Feature/PaymentMethods/IndexRenderingTest.php`**

- [ ] Bank transfer renders as the **only** listed method, and the markup exposes no create/delete
      affordance.
- [ ] The "not configured" indicator renders when `iban` is null.
- [ ] The configured indicator and the IBAN render when `iban` is set.
- [ ] `openEditModal($id)` leaves `iban` as `''` when nothing is configured.
- [ ] `openEditModal($id)` prefills `iban` with the currently configured value.
- [ ] A rejected submission renders the inline message on the `iban` key **and** leaves
      `showModal` true — this proves the `flux:input` is bound to the `iban` error key at all,
      which is genuinely new risk because 0038 ships no real markup.
- [ ] An actor holding `payment-methods.view` but not `.edit` gets the Configure action rendered
      **disabled**, and one holding both gets it enabled.

**`tests/Browser/PaymentMethodsIndexTest.php`**

- [ ] **B1 — the real form saves.** Fill a valid, space-grouped, lowercase IBAN through the actual
      input, click Save, and assert the screen shows the method configured **and** the persisted
      row holds `ES9121000418450200051332` (uppercase, unspaced). `Livewire::test()->set()` writes
      the property directly and can never catch a missing or misspelled `wire:model` — this test
      is the only thing that proves the binding and the Save click are really wired. It folds the
      valid-save and the normalisation scenarios into one high-value test rather than three.
- [ ] **B2 — the highest-risk case: a rejection must not let the display drift.** Submit a
      structurally valid, checksum-invalid IBAN against a method that already has one configured,
      then assert **three** things: the inline error renders, the modal is still open, and the
      **outer** configured-IBAN region (scoped by its own `data-test` hook, not the modal's input)
      still shows the old value — corroborated by a fresh DB read. See the rationale below.
- [ ] **B3 — cancelling.** After typing a new value, Cancel closes the modal and the configured
      IBAN is unchanged.
- [ ] `->assertNoJavaScriptErrors()` chained through load and every modal open/close in B1–B3
      (mandatory per [test-quality-checklist.md](../../docs/testing/frontend/test-quality-checklist.md)).
      No separate smoke test — a fourth test re-driving the same page would be exactly the padding
      `coverage-policy.md` warns against.

**Why B2 is the highest-risk test.** 0038's `save()` mutates `$this->iban` to its normalised form
*before* validating, so after a failed submission that property holds the rejected value. An
implementation that renders the outer summary from `$this->iban` — a plausible, lazy reuse —
would display the rejected string as the configured account. **Every one of 0038's own tests stays
green** (they assert `fresh()->iban`, i.e. the database, which is indeed untouched), and the
component-level "inline error appears" test stays green too (the error does render). Only a test
that reads the *outer display region* of a really-rendered page after a rejection catches it.

**Assertion-quality rules for this file** (each closes a specific false-pass):

- **"Nothing persisted" is asserted two ways or not at all**: the outer display still shows the old
  value (proves user-visible state), *and* a fresh `PaymentMethod` query still holds it (proves
  actual state). Either alone passes against a real defect.
- **"Stored normalised" needs the DB assertion, not a success banner.** An implementation that
  strips spaces only for the checksum and persists the raw spaced string passes any
  success-only assertion while corrupting the column.
- **Never assert on the *formatted* IBAN string.** The 4-character grouping is display copy, and
  masking is explicitly revisitable (OQ-3). Assert the presence of the
  `payment-method-configured-iban` element with non-placeholder content, and corroborate the value
  via the database — the same "don't assert display copy Epic 5 owns" discipline 0038 applies to
  `PaymentMethodCode::label()`.
- **Text-based selectors are fragile here specifically**: the outer display and the modal's own
  input can hold the same IBAN substring simultaneously, so a bare `assertSee($iban)` cannot tell
  "shown as configured" from "still sitting in the form field".

**`data-test` hooks the markup must provide:**

| Hook | On |
|---|---|
| `payment-method-card-{id}` | each `flux:card` |
| `configure-bank-transfer` | the Configure/Edit action — **on both the enabled and the disabled branch** |
| `payment-method-configured-iban` | the outer configured-IBAN display (load-bearing for B2) |
| `payment-method-not-configured` | the not-configured placeholder |
| `payment-method-modal` | the modal container, to assert "the form remains open" structurally |

The IBAN `<input>` needs no extra hook — `fill('iban', …)` / `assertValue('iban', …)` work off its
`name`, as Users' browser tests already do.

**Deliberately NOT tested here** (per
[what-not-to-test.md](../../docs/testing/qa/what-not-to-test.md)): 0038's IBAN dataset — the four
valid and ten named-invalid entries stay in 0038's unit tests, and are **not** re-driven through a
browser (this story exercises exactly two representative failures, one per level); mod-97 as
mathematics; the route-level 403 and the component-level authorization refusals
(0038's `AuthorizationTest.php`); seeder idempotency and the `firstOrCreate` non-clobber
regression (0038); `Gate::denies('create'/'delete', …)` — and there is no create/delete UI to test,
by design.

## Expected outcome
An administrator holding `payment-methods.view` reaches the Payment methods screen from the sidebar
and sees one card: **Bank transfer**, badged either "not configured" or "configured" with its IBAN
shown in readable 4-character groups. Configure/Edit opens a modal with a single IBAN field,
prefilled when one is already set. Saving a valid IBAN — including one pasted with the spacing a
bank statement prints, or typed in lowercase — configures the method and shows it on the card,
stored canonically unspaced and uppercase. An IBAN that fails structure *or* the mod-97 checksum is
refused with a message beside the field, the modal stays open, and the card keeps showing the
previously configured account unchanged. An administrator who may view but not edit sees the
Configure action disabled with an explanatory tooltip. The screen renders correctly in light and
dark mode and produces no JavaScript console errors.

## Acceptance criteria
- [ ] The screen lists the available payment methods as cards, with **bank transfer the only one**,
      and exposes no create or delete affordance anywhere in the markup.
- [ ] A method with no IBAN renders an explicit "not configured" state; a method with one renders a
      configured state showing the IBAN.
- [ ] The Configure/Edit action opens a modal whose IBAN field is empty when nothing is configured
      and prefilled with the current value when something is.
- [ ] Saving a valid IBAN updates the card to the configured state showing that IBAN.
- [ ] A valid IBAN entered space-grouped or in lowercase is accepted, and the **stored** value is
      canonical (unspaced, uppercase) — asserted against the database, not against a success state.
- [ ] An IBAN failing structure or the mod-97 checksum renders a validation message next to the
      field, the modal stays open, and the card still shows the previously configured IBAN —
      verified both in the rendered page and against a fresh database read.
- [ ] Cancelling closes the modal and changes nothing.
- [ ] The Configure/Edit action renders **disabled with a tooltip** for an actor holding
      `payment-methods.view` but not `payment-methods.edit`, driven by the same `PaymentMethodPolicy`
      `update()` ability `save()` authorizes against.
- [ ] The screen is reachable from the sidebar (via `config/modules.php` if 0013 has landed,
      otherwise via a static `flux:sidebar.item`), and the ungated-link caveat is recorded.
- [ ] Displayed IBAN grouping is render-time only: `$iban` is never mutated for display, and the
      edit input binds to the raw property.
- [ ] The outer configured-IBAN display reads the persisted row, **never** `$this->iban`.
- [ ] All UI copy is wrapped in `__()` with English source strings; `lang/en/payment_methods.php`
      and `lang/es/payment_methods.php` stay key-for-key identical with no duplicate key meaning
      "not configured".
- [ ] The screen renders correctly in light and dark mode and produces no JavaScript console errors.
- [ ] Every `data-test` hook in the table above is present, including on the disabled branch of the
      Configure action.

## Dependencies & risks
- **Depends on 0038 (`ai-spec/tasks/0038-payment-methods-bank-transfer-backend.md`), which is still
  at the `new` stage.** Verified against the working tree: there is no `payment_methods` migration,
  no `App\Models\PaymentMethod`, no `PaymentMethodPolicy`, and `routes/web.php` registers no
  `payment-methods.index`. Per the
  [task ordering rule](../../docs/workflow.md#task-ordering-rule), 0038 must complete its Phase 7
  before this story enters Phase 3 — and, per the sequential-implementation note above, their
  implementation phases must never overlap.
- **Depends on 0006b (`done`)** for the `tests/Browser/` suite, which is wired up and running on
  Chromium in CI.
- **Blocking-ish gap: 0038's component contract is incomplete** (OQ-1). This story cannot be
  implemented as written until `$paymentMethods`, `$showModal`, `$editingMethodId`,
  `openEditModal(string $methodId)` and the per-row `canEdit` exist. Estimable only once that is
  settled.
- **Risk: the sidebar entry is ungated** on the pre-0013 branch. Every authenticated user would see
  the Payment methods link, exactly as they see the Users one today. Cosmetic only — the route's
  `can:payment-methods.view` and the component's own `mount()` authorization both still refuse
  access. Must not be forgotten when 0013 lands.
- **Risk: two stories write the same three files.** Mitigated by the sequential requirement above;
  called out because it is precisely the collision recorded in
  [errors-log.md](../../docs/errors-log.md).
- **Non-risk, recorded so it is not re-raised:** the `null`-property/native-`<select>` desync bug
  does not apply here — this screen has no `<select>`, and `$iban` is a `''`-defaulted string bound
  to a text input. It would apply immediately if a future field (a currency dropdown, a method
  toggle) were added.

## Open questions

**OQ-1 — 0038's Livewire component contract is under-specified, and this story cannot bind to it as
written. Blocking; needs a decision before Phase 2.** 0038 names only `mount()`,
`openEditModal()`, `save()`, `closeModal()` and `$iban`. A view needs at minimum the method list and
its per-row shape, a modal-visibility flag, the id of the row being edited, and the `canEdit` hint
(decision 5). Two ways to close it:

- **(a) Amend 0038's task file to add these to `app/Livewire/PaymentMethods/Index.php`'s spec
  _(recommended)_.** 0038 is still at the `new` stage, so amending it is free — no code exists to
  change. It also keeps this project's established boundary intact: the backend story owns the
  component class (0004 owned `app/Livewire/Users/Index.php`; 0006 owned only the Blade view, the
  sidebar and its tests), so a frontend story never writes backend component logic.
- **(b) Let 0039 add the missing properties to the component itself.** Faster in the short term,
  but it contradicts the 0004/0006 precedent, puts `app/Livewire/**` under two owners, and makes
  0038's own "Files to create/modify" section wrong the moment it lands.

**OQ-2 — the "not yet configured" translation key name is unpinned.** 0038 says its lang files ship
"the not-yet-configured copy" without naming the key; this story proposes `index.not_configured`.
Whichever story lands it, the other must reuse it rather than adding a synonym. Non-blocking:
resolvable at Phase 3 by reading the file 0038 actually shipped.

**OQ-3 — two product calls made here, both reversible, both flagged rather than buried.** Decision
3 (the configured IBAN is shown in full, unmasked) and decision 6 (no confirmation step when
*changing* an already-configured IBAN) are both grounded in what §2.5 says — and §2.5 is silent on
both. They are the right defaults for a field whose whole purpose is to be handed to customers, but
this field is also where the store's money arrives, so if either should be tightened, now is the
cheap moment. Non-blocking.

## Resolved in the debate
- **Cards, not a table** — decided on the "method #2 has different fields" argument rather than on
  taste, and recorded so a reviewer does not read the divergence from the Users screen as an
  inconsistency.
- **Display formatting is strictly one-way.** `frontend-expert` proposed 4-character grouping for
  readability; `frontend-qa` flagged that any formatted-string assertion couples the suite to copy
  Epic 5 owns. Reconciled: format on render only, and assert via `data-test` element presence plus
  a database read — never via the formatted string.
- **The post-rejection input shows the *normalised* attempt, not the user's original spacing.**
  `save()` mutates `$this->iban` before validating, so the tidied form is what re-renders. Accepted:
  it is identical to `Users\Index::save()`'s `Str::lower($this->email)` precedent, and arguably
  helps — a wrong check digit is easier to spot in the canonical form.
- **The invalid-IBAN dataset stays in 0038.** Both amigos agreed the UI layer proves *wiring*
  (does the error reach the field, does the display stay honest), not *rule correctness*; two
  representative cases suffice here.
- **No masking, no change-confirmation step** — see decision 3, decision 6 and OQ-3.

## Definition of Done
- [ ] Tests written and green, plus the **full** existing suite (per the
      [Full Test Suite Gate Rule](../../docs/contracts.md#full-test-suite-gate-rule)).
- [ ] Code reviewed (code-reviewer).
- [ ] No security findings (appsec-auditor) — specifically: that the IBAN and the method id are
      never interpolated into a `wire:*` directive without `@js()`; that the disabled Configure
      action is a UI hint layered on top of `save()`'s own `Gate::authorize()`, never a substitute;
      and that no client-writable property is trusted as the source of the displayed configured
      value.
- [ ] Documentation updated (docs-keeper) — [api/routes.md](../../docs/api/routes.md) (what the
      `payment-methods.index` view actually renders, its `data-test` hooks, and the sidebar link's
      gating status) and, if the pre-0013 branch was taken, the ungated-sidebar caveat recorded
      alongside the Users one.
- [ ] Acceptance criteria met.

## Provenance
Phase 1 debate: `frontend-expert` (the card-vs-table argument and the grid that degrades for a
second method, the modal confirmation off 0038's method names, the render-time-only grouping rule,
the enumerated interface-contract gap, the three Flux/Blaze/`@js()` traps, the sidebar options) and
`frontend-qa` (the Gherkin set and its two-representative-failures discipline, the
component-vs-browser level split, the B2 highest-risk analysis of `$this->iban` drifting after a
rejection, the two-way "nothing persisted" assertion rule, the `data-test` hooks and why text
selectors are fragile on this screen specifically, the not-tested-here boundary against 0038).
Points of genuine disagreement or under-specification — the 0038 contract gap, IBAN masking, the
change-confirmation step — are recorded above as open questions with recommendations rather than
silently decided.
