# [0044] Customers — list + create/edit UI

## Description
Build the Customers screen of PRD [§3.1 Customers](../../docs/PRD/PRD.md#31-customers): a permission-gated
`/customers` route, the `App\Livewire\Customers\Index` component behind it, and the Blade/Flux view that
renders a customer list plus create/edit and delete-confirmation modals. This story wires the screen
against the contracts stories **0041** (table, model, validation trait, `CreateCustomer` / `UpdateCustomer`,
the documented list-retrieval contract), **0042** (soft delete) and **0043** (the "new customer"
notification, which fires inside 0041's create action and needs nothing from this screen) already define —
it does not re-implement any of them. It also adds the `config/modules.php` sidebar entry and the
`lang/{en,es}/customers.php` file 0041 deliberately deferred here.

> **Three of §3.1's acceptance criteria are satisfied by stories this one consumes, not by this one.**
> Duplicate-email rejection is 0041's rule (this screen surfaces it inline), soft delete is 0042's
> semantics (this screen dispatches the delete and stops showing the row), and the "new customer"
> notification is 0043's dispatch inside `CreateCustomer` (this screen triggers it by calling that action
> and asserts nothing about it). A reviewer must not read any of the three as re-implemented here.

> **The read-only order-history view is story 0047 and is deliberately absent from this screen.** No tab,
> no placeholder panel, no "Orders" column, no stub link — `orders` does not exist, and shipping an empty
> affordance would be a [ghost scenario](../../docs/testing/frontend/gherkin-guidelines.md). See
> [Scope fences](#scope-fences-what-this-story-must-not-do).

## Type
frontend | includes database-expert: **no**

### Why this is one story

The list table, both modals, the empty state and the disabled-row-action branch all land in the **same
single Blade file**, `resources/views/livewire/customers.blade.php`. Splitting them would mean a second
story editing the first story's markup — the two-stories-one-file collision
[0006](done/0006-users-list-editor-ui.md) already documented and avoided, and the concurrent-write hazard
recorded in [errors-log.md](../../docs/errors-log.md). The route, the component and the registry entry come
with it because a gated module route without its `config/modules.php` entry is a screen nothing links to
([routes.md](../../docs/api/routes.md#app-owned-routes)) — half a delivery, not a smaller one.

## Three Amigos participants

- `frontend-expert` — route file, component class and its public surface, view structure, the
  shipping/billing field blocks and the copy affordance, the sidebar registry entry, the lang file.
- `frontend-qa` — browser and component test design: the happy-path create, the duplicate-email inline
  rejection, the stale-prefill and no-op-resave cases, the delete/cancel pair, the authorization and
  sidebar-absence cases, and the two Flux/Blaze markup traps that bind here.
- `database-expert` — **not convened.** This story adds no migration, no column, no index and no query
  beyond 0041's already-specified retrieval contract (**D-15**), which it implements verbatim rather than
  designs.

## Gherkin

```gherkin
Feature: Customers screen

  # --- Reaching the screen ---

  Scenario: A customer administrator opens the customers screen
    Given a signed-in administrator whose role grants the customers view permission
    When they open the customers screen
    Then the list of customers is shown

  Scenario: An administrator without the customers view permission cannot open the screen
    Given a signed-in administrator whose role does not grant the customers view permission
    When they open the customers screen
    Then access is refused

  Scenario: The customers link is absent for an administrator who may not view customers
    Given a signed-in administrator whose role does not grant the customers view permission
    When they look at the sidebar navigation
    Then no customers link is present

  Scenario: The customers link is shown to an administrator who may view customers
    Given a signed-in administrator whose role grants the customers view permission
    When they look at the sidebar navigation
    Then a customers link is present

  # --- The list ---

  Scenario: Customers are listed in name order
    Given a customer administrator, with several existing customers
    When they open the customers screen
    Then every customer is listed in name order

  Scenario: A store with no customers shows an empty state
    Given a customer administrator, with no customers recorded
    When they open the customers screen
    Then an explicit empty state is shown instead of an empty table

  Scenario: Each listed customer shows its identifying and shipping-location details
    Given a customer administrator, with an existing customer
    When they view that customer's row
    Then the row shows the customer's name, email, phone and shipping city and country

  # --- Creating a customer (PRD §3.1: "Create a customer record manually") ---

  Scenario: Create a customer with full details
    Given a customer administrator on the customers screen
    When they submit the create form with a name, an email, a phone number and a shipping and billing address
    Then the new customer appears in the customers list

  Scenario: Create a customer with only the identifying details
    Given a customer administrator on the customers screen
    When they submit the create form with only a name and an email
    Then the new customer appears in the customers list

  Scenario: Copying the shipping address into the billing address
    Given a customer administrator who has filled in the shipping address on the create form
    When they choose to use the same address for billing
    Then the billing address fields are filled with the shipping address values

  Scenario: A customer administrator without the create permission sees no create action
    Given a signed-in administrator whose role grants the customers view but not the customers create permission
    When they open the customers screen
    Then no enabled create action is offered

  # --- Rejecting an invalid customer (PRD §3.1: "A duplicate customer email is rejected") ---

  Scenario: A duplicate customer email is rejected
    Given a customer administrator, with an existing customer whose email is "cliente@example.com"
    When they submit the create form with the email "cliente@example.com"
    Then the form stays open showing a duplicate-email message and no second customer appears in the list

  Scenario: A duplicate customer email differing only in capitalisation is rejected
    Given a customer administrator, with an existing customer whose email is "cliente@example.com"
    When they submit the create form with the email "CLIENTE@example.com"
    Then the form stays open showing a duplicate-email message and no second customer appears in the list

  Scenario: A customer without a name is rejected
    Given a customer administrator on the customers screen
    When they submit the create form leaving the name blank
    Then the form stays open showing a required-name message and no customer is added to the list

  Scenario: A malformed email is rejected
    Given a customer administrator on the customers screen
    When they submit the create form with an email that is not a well-formed address
    Then the form stays open showing an invalid-email message and no customer is added to the list

  # --- Editing a customer ---

  Scenario: The edit form opens pre-filled with the customer's stored details
    Given a customer administrator, with an existing customer
    When they open that customer's edit form
    Then every field shows that customer's currently stored value

  Scenario: Edit a customer's details
    Given a customer administrator, with an existing customer
    When they change that customer's name in the edit form and save
    Then the customers list shows the new name

  Scenario: Saving an edit form without changing anything leaves the customer as it was
    Given a customer administrator, with an existing customer
    When they open that customer's edit form and save it unchanged
    Then the customer's stored details are exactly as they were

  Scenario: Editing a customer while keeping its own email is accepted
    Given a customer administrator, with an existing customer
    When they change that customer's phone number in the edit form and save, leaving the email unchanged
    Then the change is accepted, the address not being treated as a duplicate of the customer's own record

  Scenario: A customer administrator without the edit permission cannot open the edit form
    Given a signed-in administrator whose role grants the customers view but not the customers edit permission
    When they view an existing customer's row
    Then the edit action is shown as unavailable

  # --- Deleting a customer (PRD §3.1: "Deleting a customer soft-deletes the record") ---

  Scenario: Deleting a customer removes it from the active list
    Given a customer administrator, with an existing customer
    When they confirm deletion of that customer
    Then the customer no longer appears in the customers list

  Scenario: A deleted customer's record is preserved
    Given a customer administrator, with an existing customer
    When they confirm deletion of that customer
    Then the customer record still exists, marked as deleted

  Scenario: Cancelling a deletion leaves the customer untouched
    Given a customer administrator who has opened the delete confirmation for a customer
    When they cancel the confirmation
    Then the customer still appears in the customers list

  Scenario: A customer administrator without the delete permission cannot delete
    Given a signed-in administrator whose role grants the customers view but not the customers delete permission
    When they view an existing customer's row
    Then the delete action is shown as unavailable
```

## Files to create/modify

### Route — `routes/customers.php` (new) + one `require` line in `routes/web.php`

A new per-area route file, `require`d from `web.php` exactly the way `users.php` and `roles.php` are
([base-standards.md](../../docs/conventions/base-standards.md#directory-structure)):

```php
<?php

use App\Livewire\Customers\Index as CustomersIndex;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    // `can:customers.view`, not Spatie's `permission:` — Livewire 4's
    // PersistentMiddleware allowlist carries Laravel's `Authorize` (`can:`)
    // but not Spatie's `PermissionMiddleware`, so a `permission:`-gated route
    // would protect the initial GET only, leaving every save()/deleteCustomer()
    // /livewire/update round-trip unauthorized. See
    // docs/architecture/authorization.md.
    Route::livewire('customers', CustomersIndex::class)
        ->middleware(['can:customers.view'])
        ->name('customers.index');
});
```

- **The inline comment is deliberate duplication**, matching `routes/roles.php` verbatim — a reader
  auditing one route file must not have to open another to learn why. The rule and its three rejected
  alternatives are owned by
  [authorization.md](../../docs/architecture/authorization.md#the-copyable-module-gate-pattern-and-the-three-alternatives-rejected).
- **Exactly one ability on the gate: `customers.view`.** Not a broader set, because the
  `config/modules.php` entry below must set-equal it and a test pins that equality.
- **No permission catalog change.** `customers.view/create/edit/delete` are already seeded
  ([`RolePermissionSeeder::MODULES`](../../database/seeders/RolePermissionSeeder.php)); this story adds
  none and reseeds nothing.
- ⚠️ **Do not plan a `verified`-middleware test.** `App\Models\User` does not implement `MustVerifyEmail`,
  so `verified` refuses nobody on any route in this app — a test asserting it carries no signal. Recorded
  in [errors-log.md](../../docs/errors-log.md) after exactly that mistake on `routes/users.php`.

### Component — `app/Livewire/Customers/Index.php` (new)

Class-based, not single-file; `#[Title]` on the class rather than in the view
([base-standards.md](../../docs/conventions/base-standards.md#livewire-component-convention-class-based-not-single-file)).
Public surface the view consumes:

| Member | Shape | Notes |
| --- | --- | --- |
| `$name`, `$email`, `$phone` | `public string` | form fields, `wire:model` |
| `$shippingAddressLine1` … `$shippingCountry` | `public string` | six shipping fields |
| `$billingAddressLine1` … `$billingCountry` | `public string` | six billing fields |
| `$showModal`, `$showDeleteModal` | `public bool` | modal state |
| `$editingCustomerId` | `#[Locked] public ?string` | **server-authoritative**; the id fed to `Rule::unique()->ignore()` |
| `$deletingCustomerId`, `$deletingCustomerName` | `#[Locked] public ?string` | delete-confirmation state |
| `customers()` | `#[Computed]` | the row set — see below |
| `customersSummary()` | `#[Computed]` | `trans_choice('customers.index.summary', …)` |
| `isEditing()` | `#[Computed] bool` | drives the modal's title/button copy |

- **Every form property is a `string`, never `null`.** A `wire:model`-bound property that is actually
  `null` desynchronises a native control and silently swallows the user's own input — the bug recorded in
  [errors-log-archive.md](../../docs/errors-log-archive.md#a-null-livewire-property-bound-to-a-native-select-silently-dropped-the-users-own-pick--2026-08-16).
  There is no `<select>` on this form today (see **D-2**), but the rule binds every bound control, and an
  empty string is the correct "not filled in" value for all thirteen optional fields. The actions convert
  `''` → `null` at the boundary, or the component does before calling them — **pick one and state it in a
  docblock**; what must not happen is a blank string landing in a nullable column.
- **Boolean/computed naming** follows [naming.md](../../docs/conventions/naming.md#boolean-properties):
  a predicate name (`isEditing()`), never a noun, never a `get*` prefix.
- **`customers()` implements 0041's **D-15** contract literally**:

  ```php
  Customer::query()->orderBy('name')->get()
  ```

  no eager loading (no relation exists), no query-level permission filter (the route gate and the
  component own access), then mapped to per-row arrays carrying
  `{id, name, email, phone, shippingCity, shippingCountry, canEdit, canDelete}`. **A test in this story
  re-asserts that contract at the component layer**, as 0041's Dependencies section requires.
- **`#[Computed]`, not a `#[Locked] public array` populated by a `loadCustomers()` method** (**D-5**).
- **Authorization on every method that mutates *or discloses***
  ([livewire-authorization.md](../../docs/security/livewire-authorization.md)):

  Every gate is asked **through `App\Policies\CustomerPolicy`** (created by 0041, extended by 0042),
  never against a raw permission string — so each ability here is the identical method the action or
  the row hint asks:

  | Method | First statement |
  | --- | --- |
  | `mount()` | `Gate::authorize('viewAny', Customer::class)` |
  | `openCreateModal()` | `Gate::authorize('create', Customer::class)` |
  | `openEditModal(string $id)` | `Gate::authorize('update', $customer)` |
  | `confirmDelete(string $id)` | `Gate::authorize('delete', $customer)` |
  | `save()` | delegates to `CreateCustomer` / `UpdateCustomer`, which authorize themselves against the same policy; the component authorizes too, as defence in depth |
  | `deleteCustomer()` | `Gate::authorize('delete', $customer)`, then `$customer->delete()` — see **D-4** |
  | `copyShippingToBilling()` | **no gate** — see **D-1** |

  `viewAny` and `create` are asked **class-level** because no instance exists at that point;
  `update` and `delete` take the resolved `Customer`. `mount()` is `viewAny`'s **first and only
  caller** — 0041 ships the ability forward-declared for exactly this method.

  The two openers are gated because each **discloses** a stored record into client-visible component
  state before any write is attempted — the rule whose shipped example is the Users screen's three
  previously-ungated openers (task 0015, finding F7).
- **`save()` calls the actions, never `Customer::create()`/`->update()` directly**, and resolves them by
  **method injection** (`save(CreateCustomer $create, UpdateCustomer $update)`), per
  [code-style.md](../../docs/conventions/code-style.md#inject-single-purpose-actions-per-method). A
  Livewire action method has no external signature contract, so the constructor-injection exception does
  not apply here. **Never `new CreateCustomer`** — 0043 gives that action a constructor dependency
  (`NotifyCustomerCreated`), so a `new` call site breaks the moment 0043 lands.
- **Validation reuses 0041's `App\Concerns\CustomerValidationRules`** — `use CustomerValidationRules;` on
  the component, passing `$this->editingCustomerId` to `customerEmailRules()` on the edit path. **No rule
  array is written inline in this component**
  ([code-style.md](../../docs/conventions/code-style.md#centralize-shared-validation-in-traits)).

### View — `resources/views/livewire/customers.blade.php` (new)

**The flat path.** `App\Livewire\Customers\Index` resolves to `livewire/customers`, not
`livewire/customers/index.blade.php` — the
[`Index`-in-a-subfolder exception](../../docs/conventions/naming.md#exception-a-component-named-index-resolves-to-its-parent-folders-name).
A nested file would be a silently unused duplicate. **Resolve the path by running the component, not by
reasoning about it** — stories 0010 and 0011 both wrote the nested path into their own Phase 1 specs and
found out at first render.

Structure, mirroring the shipped `users.blade.php` / `roles.blade.php` shape:

- **Header** — `flux:heading`, the live `customersSummary()` count, and a primary "New customer" button
  (rendered disabled with a tooltip when `Gate::allows('create', Customer::class)` is false — the
  same policy ability `openCreateModal()` authorizes with).
- **List** — a `flux:table` with **five** columns, not sixteen (**D-6**):

  | Column | Content |
  | --- | --- |
  | Customer | name (bold) over email (muted), the `users.blade.php` two-line cell |
  | Phone | `phone` or an em dash |
  | Shipping location | `shipping_city` + `shipping_country`, or an em dash when neither is set |
  | *(actions)* | icon-only edit / delete |

- **Create/edit modal** — one modal serving both, its inner content wrapped in `@if ($showModal)` so only
  one "Cancel" control is ever in the DOM (the `users.blade.php` / `roles.blade.php` rule). Field order:
  1. **Identity** — name, email, phone.
  2. **Shipping address** block — `flux:heading` + line 1, line 2, city, postal code, province, country.
  3. **Billing address** block — the same six fields, preceded by the **"Same as shipping" copy
     affordance** (**D-1**): a `flux:button` firing `wire:click="copyShippingToBilling"`.
  - Country fields are a plain `flux:input` (**D-2**), `maxlength="2"`, with a `flux:description` naming
    the expected two-letter code.
  - Validation errors render through Flux's own `wire:model` error integration on each `flux:input`, so
    no manual `<flux:error>` outlet is needed — the same arrangement `roles.blade.php` documents. **The
    duplicate-email error therefore surfaces inline on the email field**, which is what the Gherkin above
    asserts.
- **Delete-confirmation modal** — names the target (`$deletingCustomerName`), inner content wrapped in
  `@if ($showDeleteModal)`.
- **Empty state** — an explicit `customers.index.empty` block when the row set is empty, never a bare
  table with no rows.

Four markup rules, all inherited rather than invented, all load-bearing:

1. **`@js(...)` around every `wire:click` argument.** `wire:click="openEditModal(@js($customer['id']))"`.
   A value interpolated into a `wire:*` attribute lands in a JavaScript evaluator, where the HTML parser
   hands the decoded quote back — `{{ }}` is not enough there
   ([blade-livewire-output-encoding.md](../../docs/security/blade-livewire-output-encoding.md)).
2. **`data-test="edit-customer-{id}"` / `data-test="delete-customer-{id}"` on *both* branches** of each
   row action. The actions are icon-only with an `aria-label`, so they are not selectable by visible text,
   and a browser test must select the same way whether the action is enabled or disabled.
3. **A disabled row action is a separate `@if`/`@else` branch wrapped in an explicit `<flux:tooltip>`** —
   never one button carrying `:tooltip="$cond ? … : null"`. Under `livewire/blaze` a Flux prop that decides
   whether a wrapper renders counts as *present* whenever the attribute is written on the tag at all, so
   the conditional binding produces an empty tooltip bubble on every **enabled** row
   ([errors-log.md](../../docs/errors-log.md)).
4. **`cursor-not-allowed!` goes on that `flux:tooltip` wrapper, not on the disabled button.** Flux's own
   `disabled:pointer-events-none` takes a disabled button out of hit-testing, so a cursor rule placed
   there never renders (same log entry). Do not "simplify" either of these back into the obvious form.

### Sidebar registry — `config/modules.php` (modify) + `lang/{en,es}/navigation.php` (modify)

**One appended entry, no component edit** — the registry pattern
([authorization.md](../../docs/architecture/authorization.md#the-second-half-of-a-module-gate-the-sidebar-registry)):

```php
// config/modules.php — items
'customers' => [
    'group' => 'platform',
    'label' => 'navigation.items.customers',
    'icon' => 'user-group',
    'route' => 'customers.index',
    'current_when' => 'customers.*',
    'permissions' => ['customers.view'],   // exactly the route's own can: ability
],
```

- **`group: 'platform'`** — Customers is a top-level operational module like Users, not store
  configuration; the `settings` group holds configuration screens.
- **`permissions` must set-equal the route's `can:` middleware.** `tests/Feature/Navigation/SidebarModuleGatingTest.php`
  asserts that mechanically for every entry, so the two halves cannot drift — this story adds no new rule,
  it satisfies an existing one.
- **No closures, no literal copy** — `label` is a translation key, because `config:cache` serialises with
  `var_export()` and an English string in `config/` is unreachable from `lang/es/`
  ([base-standards.md](../../docs/conventions/base-standards.md#an-app-owned-config-file-is-a-registry-and-must-survive-configcache)).
- `lang/{en,es}/navigation.php` each gain **exactly one leaf**, `items.customers`, mirroring the registry
  key — which is simultaneously the config key, the translation leaf and the rendered
  `data-test="sidebar-link-customers"` hook
  ([naming.md](../../docs/conventions/naming.md#translation-keys)).

### Translations — `lang/en/customers.php` + `lang/es/customers.php` (new)

The file 0041 deliberately deferred to this story (its **D-14**). Key-for-key identical across both
locales, snake_case leaves, grouped by feature:

```php
'index' => [
    'summary' => ':count customer|:count customers',   // trans_choice, never a PHP ternary
    'empty' => '…',
    'action_not_allowed' => '…',
],
'form' => [
    'shipping_heading' => '…', 'billing_heading' => '…', 'same_as_shipping' => '…',
    'country_hint' => '…',
],
'delete' => ['confirm_title' => '…', 'confirm_body' => '…'],
```

- **A count-dependent message is one key with a `|`-delimited plural, resolved with `trans_choice()`** —
  never two keys, never a `$count === 1 ? … : …` in PHP, and **never inline in the Blade file**, which is
  exactly how `roles.index.permission_count` shipped its first draft and had to be fixed
  ([naming.md](../../docs/conventions/naming.md#translation-keys)).
- Generic chrome (`Save`, `Cancel`, `Name`, `Email`) stays as bare `__('…')` literals matching
  `users.blade.php`; only domain copy goes in this file.
- `APP_LOCALE=en` today, so everything renders English until Epic 5 — accepted and documented, not a
  defect. Both files ship in the same change regardless.

### Explicitly **not** touched by this story

- `database/migrations/**`, `app/Models/Customer.php`, `database/factories/CustomerFactory.php` — 0041 /
  0042. This story adds no column, no cast and no model change.
- `app/Actions/Customers/**` — 0041 (`CreateCustomer`, `UpdateCustomer`) and 0043
  (`NotifyCustomerCreated`). This story **calls** them and changes neither.
- `app/Concerns/CustomerValidationRules.php` — 0041's. Reused verbatim; if a rule needs changing, that is
  a finding against 0041, not an edit here.
- `app/Notifications/**` — 0043's.
- `database/seeders/RolePermissionSeeder.php` — no permission is added.
- `app/Policies/**` — `CustomerPolicy` is created by 0041 (`viewAny` / `create` / `update`) and
  extended by 0042 (`delete`). This story **consumes** all four abilities and adds, removes or edits
  none of them. If an ability needs changing, that is a finding against its owning story — the same
  rule as for `CustomerValidationRules` above. See **D-3**.

## Tests to perform

Two suites. Per [testing/README.md](../../docs/testing/README.md), a `Livewire::test()` authorization
test and an HTTP one are **not substitutes for each other** — route middleware and the in-component gate
fail in different places, and `/livewire/update` does not re-run every route middleware. Both are required
where marked.

### Feature — `tests/Feature/Customers/IndexTest.php` (route + component)

- [ ] Integration test: a guest hitting `route('customers.index')` is redirected to login.
- [ ] Negative test: an administrator **without** `customers.view` gets a **403**, and the response names
      no permission.
- [ ] Integration test: an administrator **with** `customers.view` gets a **200**. **The positive case is
      mandatory beside every 403** — a misspelled ability denies silently, so a 403-only suite passes
      against a typo ([authorization.md](../../docs/architecture/authorization.md)).
- [ ] Integration test: a Super Admin holding no individual `customers.*` grant gets a 200, via
      `Gate::before`.
- [ ] Integration test: **the list-retrieval contract at the component layer** — several customers render
      in `name` ascending order, every row is present, and no permission filter narrows the set.
      Re-asserts 0041's **D-15** as that story's Dependencies section requires.
- [ ] Integration test: an empty catalog renders the `customers.index.empty` state rather than an empty
      table.
- [ ] Negative test (Livewire): `openCreateModal()` / `openEditModal()` / `confirmDelete()` each throw
      `AuthorizationException` for an actor holding only `customers.view` — **and the component's state is
      asserted unchanged**, because a gate that runs *after* the assignments still throws (the
      `Log::spy()`-cannot-distinguish caveat in
      [livewire-authorization.md](../../docs/security/livewire-authorization.md)).
- [ ] Negative test: an actor holding every *other* module's `.view` but not `customers.view` is refused.
      The case that catches a wrong permission string — the most plausible copy-paste slip when scaffolding
      from `routes/users.php`.

### Feature — `tests/Feature/Customers/IndexRenderingTest.php` (markup contract)

- [ ] Integration test: a row renders the customer's name, email, phone and shipping city + country.
- [ ] Integration test: a customer with **no** phone and **no** address renders em dashes, not blanks or
      `null`.
- [ ] Integration test (dataset over the three actor tiers): the row's edit/delete actions render
      **enabled** for a holder of `customers.edit` / `customers.delete` and **disabled** for a
      view-only actor, with the `data-test` hook present on **both** branches.
- [ ] Integration test: the create button renders disabled for an actor without `customers.create`.
- [ ] **Count assertion, scoped and proven movable**: the create/edit modal renders exactly the sixteen
      bound inputs. Scope the selector by a string that cannot match a sibling or wrapper element and
      include the delimiter that ends the element name, then **prove the count can move** by removing one
      field and confirming it changes by exactly one — an over-count by a constant reads as the true
      number ([errors-log.md](../../docs/errors-log.md)).
- [ ] Integration test: `resources/views/livewire/customers/index.blade.php` does **not** exist (the flat
      path is the real one) — cheap, and it fails loudly if someone "restores" the mirror rule.

### Feature — `tests/Feature/Navigation/SidebarModuleGatingTest.php` (extend, do not duplicate)

- [ ] Integration test: `data-test="sidebar-link-customers"` is **present** for a holder of
      `customers.view`.
- [ ] Negative test: it is **absent** — not merely hidden — for an actor without it. Assert on the
      `data-test` hook, never on the word "Customers", which collides with other copy.
- [ ] The file's existing mechanical assertions (every entry's `permissions` set-equals its route's real
      `can:` middleware; the registry survives `config:cache`) pick the new entry up automatically. **Verify
      that rather than re-writing it** — if either needs a change, the entry is wrong.

### Browser — `tests/Browser/Customers/CustomersScreenTest.php` (Pest 4, Chromium)

Per [testing/frontend/README.md](../../docs/testing/frontend/README.md). Select by `data-test` hook,
never by label text. Every test asserts **no JavaScript console errors**.

- [ ] **Happy path create**: open the create modal, fill name/email/phone and both address blocks, save →
      the modal closes and the new customer appears in the list.
- [ ] **Minimal create**: name + email only → the customer appears, its optional cells rendering em dashes.
- [ ] **Duplicate email, inline**: submitting an existing customer's address → the **modal stays open**, an
      error is shown on the email field, and the list still holds exactly one such customer. The
      modal-stays-open half is the assertion that catches a form that closes and silently discards input.
- [ ] **Duplicate email differing only in capitalisation** → same outcome. This is the case that proves
      0041's **D-5** normalisation reaches the screen; it must pass on SQLite *and* MySQL.
- [ ] **Edit pre-fills**: open a customer's edit modal → every field shows that customer's **stored** value.
      A stale prefill is a silent data-corruption bug, not a cosmetic one — the same reasoning the Users
      screen's edit-modal tests carry.
- [ ] **No-op resave**: open the edit modal and save without changing anything → the stored record is
      re-read from the database and asserted **byte-identical** across every column.
- [ ] **Edit keeps its own email**: change only the phone and save → accepted, no duplicate-email error
      (the `Rule::unique()->ignore()` regression case, driven through the real form).
- [ ] **Copy affordance**: fill the shipping block, click "Same as shipping" → the six billing inputs hold
      the six shipping values. Then **change a shipping field afterwards and assert billing does *not*
      follow** — the assertion that pins **D-1**'s one-time-copy semantics against a live binding.
- [ ] **Delete confirm**: confirm deletion → the row leaves the list, and `Customer::withTrashed()` still
      finds the record (the soft-delete half, 0042's semantics observed from the UI).
- [ ] **Delete cancel**: cancel the confirmation → the row is still present and `deleted_at` is still null.
- [ ] **Disabled row actions**: a view-only actor sees both row actions rendered disabled, selected by
      `data-test` hook.

### Deliberately **not** tested

- The validation rules themselves — 0041 owns them and tests them at the action layer. This story tests
  that a rejection **surfaces on the right field and leaves the modal open**, not that `max:150` is 150.
- The soft-delete mechanics (`assertSoftDeleted`, `withTrashed()`/`onlyTrashed()` symmetry) — 0042's.
- The "new customer" notification — 0043's. **This screen's create tests must not assert it**, in either
  direction; asserting its absence here would go red the moment 0043 lands.
- **Step-up / password re-confirmation** — it does not apply to this screen at all (**D-7**). Building a
  test for it would be a ghost scenario for behaviour nothing implements.
- Anything involving orders (0047).

## Expected outcome

`GET /customers` renders a permission-gated Customers screen linked from the sidebar to exactly the
administrators who hold `customers.view`. The screen lists every customer in name order with their name,
email, phone and shipping location, offers a create/edit modal covering all sixteen writable fields
grouped as identity / shipping address / billing address with a one-click "same as shipping" copy, and a
delete confirmation naming the target. Creating and editing go through 0041's `CreateCustomer` /
`UpdateCustomer`, so a duplicate email — including one differing only in capitalisation — is refused
inline on the email field with the modal still open and nothing written. Deleting dispatches 0042's soft
delete, so the row leaves the list while the record survives. Every row action an actor may not perform
renders disabled with a tooltip rather than failing on click, and every mutating and disclosing component
method re-authorizes regardless.

Nothing about orders appears anywhere on this screen, and nothing about notifications is visible — 0043
writes a database row that no UI in this repository reads yet.

## Acceptance criteria

- [ ] `routes/customers.php` exists, is `require`d from `routes/web.php`, and declares
      `customers.index` inside an `['auth','verified']` group with **exactly** `can:customers.view`.
- [ ] `App\Livewire\Customers\Index` renders `resources/views/livewire/customers.blade.php` — the **flat**
      path; no `livewire/customers/index.blade.php` exists.
- [ ] The row set is `Customer::query()->orderBy('name')->get()` with no eager loading and no query-level
      permission filter, pinned by a component-layer test (0041 **D-15**).
- [ ] `mount()`, both modal openers, `save()` and `deleteCustomer()` each authorize as their first
      statement, **through `CustomerPolicy`** (`viewAny` / `create` / `update` / `delete`) rather than
      against a raw permission string; `$editingCustomerId` / `$deletingCustomerId` /
      `$deletingCustomerName` are `#[Locked]`.
- [ ] Create and edit call 0041's `CreateCustomer` / `UpdateCustomer` — resolved from the container, never
      `new`-ed — and validate through 0041's `CustomerValidationRules`; no rule array is written inline.
- [ ] A duplicate email (identical, or differing only in capitalisation) leaves the modal **open**, shows
      the error on the email field, and writes nothing.
- [ ] Deleting a customer removes it from the list while the record survives, and the delete goes through
      the model **instance** (`$customer->delete()`), never the query builder.
- [ ] Per-row `canEdit` / `canDelete` are `Gate::allows('update', $customer)` /
      `Gate::allows('delete', $customer)` — the **policy** abilities, not raw permission strings, and the
      same ones the openers authorize with — flat, with **no** self-row or ownership carve-out; the
      disabled branch carries the same `data-test` hook as the enabled one.
- [ ] Every `wire:click` argument passes through `@js(...)`; the disabled action uses an explicit
      `<flux:tooltip>` wrapper carrying `cursor-not-allowed!`, never a conditionally-bound `:tooltip`.
- [ ] `config/modules.php` gains one `items.customers` entry whose `permissions` set-equals the route's
      `can:` ability, with `lang/{en,es}/navigation.php` gaining exactly the matching leaf.
- [ ] `lang/en/customers.php` and `lang/es/customers.php` exist and are key-for-key identical; every
      count-dependent string is a single `trans_choice()` key, and no `|`-delimited plural appears in the
      Blade file.
- [ ] No migration, model, factory, action, notification, policy or permission is added or changed by this
      story.
- [ ] **No order-history affordance of any kind** appears in the markup, and **no step-up password
      re-confirmation** is added (**D-7**).

## Definition of Done
- [ ] Tests written and green, plus the **full** existing suite (per the Full Test Suite Gate Rule in
      [contracts.md](../../docs/contracts.md)), with both quality gates run **unscoped** —
      `vendor/bin/pint --format agent` (not `--dirty`) and `php artisan test` (not `--filter`), per
      [base-standards.md](../../docs/conventions/base-standards.md#steps-1-and-2-are-the-iteration-forms-run-both-unscoped-before-declaring-the-work-done).
- [ ] `npm run build` succeeds and the browser suite passes on Chromium.
- [ ] Code reviewed (code-reviewer).
- [ ] No security findings (appsec-auditor) — specifically: that every disclosing method is gated and not
      only every mutating one; that `$editingCustomerId` is `#[Locked]` so the id fed to
      `Rule::unique()->ignore()` cannot be forged; that the per-row `Gate::allows()` hints are a hint and
      never the only check; and that `copyShippingToBilling()` moves only client-supplied form state and
      discloses nothing (**D-1**).
- [ ] Documentation updated (docs-keeper):
  - [`api/routes.md`](../../docs/api/routes.md) — `customers.index` joins the app-owned routes table as the
    **third** permission-gated route, with its own subsection following the `users.index` / `roles.index`
    shape (what the view renders, the `data-test` hooks, the two Flux/Blaze markup rules reused verbatim,
    the sidebar bullet).
  - [`architecture/authorization.md`](../../docs/architecture/authorization.md) — the sidebar registry's
    **third** entry, and the first module gate written by an epic other than Epic 1: confirmation that the
    copyable pattern was appended to rather than edited. **Note explicitly that this screen does *not*
    adopt step-up authentication and why** (**D-7**), so the layer's scope stays a stated boundary rather
    than an apparent omission.
  - [`conventions/base-standards.md`](../../docs/conventions/base-standards.md) — the `routes/` listing
    gains `customers.php`, the `app/Livewire/` listing gains `Customers/`, and the `lang/` listing gains
    `customers.php`. **Each of those is an enumeration that becomes an under-count the moment this story
    lands** — the [bare-negative-claim](../../docs/errors-log-archive.md#a-docs-this-app-has-no-x-yet-claim-outlived-the-x-by-two-tasks--2026-08-13)
    failure mode arriving as arithmetic. **Grep `docs/` for "three per-area files", "two module routes"
    and similar counts** rather than trusting the change→doc mapping, which routes only to the docs
    describing the change.
  - [`conventions/naming.md`](../../docs/conventions/naming.md) — a **third** row in the
    `Index`-in-a-subfolder exception table (`App\Livewire\Customers\Index` → `livewire/customers.blade.php`).
  - [`database/schema.md`](../../docs/database/schema.md) / [`migrations.md`](../../docs/database/migrations.md) —
    **verify, do not assume.** This story contains no column, model or migration; expect no change and
    record that it was checked.
- [ ] Acceptance criteria met.

## Documented functional decisions

Each resolves a question raised during the debate. Every one is a conservative, reversible default the
human may override — the reasoning is recorded so an override is a decision rather than a rediscovery.

### D-1 — "Same as shipping" is a one-time server round-trip, not a live client-side binding

**Decision: a `flux:button` firing `wire:click="copyShippingToBilling"`, a Livewire method that copies the
six shipping properties into the six billing properties once.** Adopted from `frontend-expert`'s
recommendation.

Three reasons, in order of weight:

1. **It matches what 0041's backend actually stores.** **D-11** there is explicit: there is no
   `billing_same_as_shipping` flag and no read-time fallback, because an implicit fallback makes a `null`
   billing country mean both "unknown" and "same as shipping" — and PRD §3.2 resolves a **virtual**
   product's tax from the billing address specifically, so that ambiguity would land directly in a tax
   calculation. A one-time copy writes six real values; a live binding would recreate the ambiguity in the
   UI layer, one story after the backend deliberately refused it.
2. **State stays server-side, which is this project's Livewire convention.** An Alpine-only copy would put
   form state in two places, and a subsequent server render could disagree with what the user sees.
3. **It is observable and therefore testable.** The browser test asserts the six values arrive *and* that
   changing shipping afterwards does **not** move billing — an assertion a live binding would fail, which
   is exactly what makes the semantics pinned rather than assumed.

**No `Gate` call on this method**, and that is a decision rather than an omission: it moves values the
client already supplied from six of its own form properties into six others, discloses nothing that is not
already on the client, and persists nothing. The write it precedes is gated in `UpdateCustomer` /
`CreateCustomer`. Recorded here so `appsec-auditor` reads a decision.

**Reversible** — swapping it for an Alpine binding is a view-only change, but it would have to re-answer
reason 1 first.

### D-2 — The country fields are a plain free-text input this phase, not a `sales_regions`-fed picker

**Decision: `flux:input`, `maxlength="2"`, with a hint naming the expected two-letter code.** Adopted from
`frontend-expert`'s recommendation.

0041's **D-9** forbids validating a customer's country against the seeded region catalog, for two reasons
that bind the UI just as hard as the backend: a customer may legitimately live in a country the tax catalog
has not activated, and `sales_regions.code` is **administrator-editable and nullable**
([schema.md](../../docs/database/schema.md#sales_regions)), so a picker sourced from it would silently lose
options whenever an administrator blanks a code. A dropdown that offers fewer countries than the validator
accepts is worse than a text field: it makes a legal value unreachable through the UI.

Two supporting facts. The Sales Regions **screen** does not exist yet either (story 0018), so there is no
shipped precedent for how this catalog is presented. And a `<select>` here would reintroduce the
null-property/native-`<select>` desync class of bug for no gain
([errors-log-archive.md](../../docs/errors-log-archive.md#a-null-livewire-property-bound-to-a-native-select-silently-dropped-the-users-own-pick--2026-08-16)).

**Revisit once Sales Regions UI ships**, and only if the *product* wants a constrained list — at which
point the right shape is a searchable picker over the full ISO catalog (which the seeder already holds as
~249 rows, active or not), never over the *active* subset. Recorded in
[Technical tasks for the backlog](#technical-tasks-for-the-backlog).

### D-3 — Per-row hints are flat permission checks, with no self-row carve-out

**Decision: `canEdit = Gate::allows('update', $customer)` and `canDelete = Gate::allows('delete', $customer)`,
asked through `App\Policies\CustomerPolicy` — the same abilities `openEditModal()` / `confirmDelete()`
authorize with, and the same ones `UpdateCustomer` authorizes with.**

The Users screen's hints carry a self-row identity branch (`$user->is(Auth::user()) || …`) and an accepted
enabled-then-refused drift, because a `User` row **is an actor** and can be the acting user. A customer is
a passive record that can never be the acting user, holds no role, no permission and no privilege tier
(0041 **D-12**, 0042 **D-3**), so every rule reduces to "does the actor hold the ability" with zero
row-level nuance. **Stated affirmatively so the absence reads as a decision**, and pinned by the
"any holder may edit/delete any customer" tier dataset in the rendering test.

**`CustomerPolicy::update()` / `::delete()` ignore their `$target` parameter entirely** — that is 0041's
and 0042's decision, not this story's, and it is why passing `$customer` costs nothing while buying the
forward property those files record: the day a target-dependent rule is added, this hint inherits it with
no change here. Passing the instance rather than the class is what makes that true.

Two consequences worth naming. First, **the hints cannot drift from what a click does** here — the one
structural cause of drift on the other two screens is a rule deliberately living outside `Gate`, and there
is none. Second, the hint is still a **hint**: it is layered on top of the component's own
`Gate::authorize()` and the actions' own, never instead of either
([authorization.md](../../docs/architecture/authorization.md#gateallows-in-a-list-query-is-a-ui-hint-not-a-layer)).

### D-4 — The delete **code path** lives in this component, calling `$customer->delete()` directly

**Decision: `confirmDelete()` / `deleteCustomer()` are this story's, and `deleteCustomer()` calls
`$customer->delete()` on the resolved model instance after `Gate::authorize('delete', $customer)`.**

This is the residue of the delete-path ownership question, now settled in all three files (0042's
[Resolved questions](0042-customers-soft-delete-backend.md#resolved-questions) carries the ownership
table): 0041 ships **no Livewire component** (its **D-1**), and 0042 is a backend story owning a column,
a trait and one added policy method. Neither can hold a `wire:click` handler, so the delete path's *UI
half* is necessarily here — while the *ability* it authorizes against is 0042's.

Three constraints on it:

- **Instance delete, never the query builder.** `Customer::where(...)->delete()` bypasses any future
  `delete()` override. 0042 records that there is nothing to bypass **today** — and that keeping every
  call site instance-based is a cheap forward guarantee, plus a code-review checklist item no test covers
  ([base-standards.md](../../docs/conventions/base-standards.md#deleting-a-user-goes-through-the-model-not-the-query-builder)).
- **No `DeleteCustomer` action exists**, so the guard sits in the component by necessity rather than by
  design — the *weaker* placement case
  [base-standards.md](../../docs/conventions/base-standards.md#an-authorization-rule-belongs-to-the-action-not-to-one-of-its-callers)
  records for `Users\Index::deleteUser()`. **Record that in the method's own docblock**, so the next
  reader can tell "this belongs here" from "this is here until something better exists", and so a later
  story extracting the action knows to move the guard with it.
- **No self-delete guard, no tier guard, no "already deleted" branch.** The first two have no meaning for
  a passive record (**D-3**); the third is unreachable, because a trashed id does not resolve through the
  default scoped query at all (0042's idempotency note).

### D-5 — The row set is a `#[Computed]` method, not a `#[Locked] public array` populated in `mount()`

**Decision: `#[Computed] customers()`, the `Roles\Index` shape rather than the older `Users\Index`
`loadUsers()` shape.**

Both are shipped precedents, so this is a real choice. `#[Computed]` wins on three counts: there is no
client-writable array to lock (the whole class of "a public property with no `wire:model` is still
client-writable" hazard simply does not arise), the set re-derives after every save and delete with no
`loadCustomers()` call to forget, and it keeps 0041's **D-15** contract expressible as one readable query
in one method. The `Users` shape is not wrong; it is older, and `Roles` is the direction this repo has
moved.

**Consequence to plan for:** a `#[Computed]` property is memoised **per request**, so a mutation and a
re-read in the same round trip need `unset($this->customers)` after the write. State that in the method's
docblock rather than discovering it as a stale-list bug.

### D-6 — The list table shows five columns, not sixteen

**Decision: Customer (name over email), Phone, Shipping location (city + country), and the actions
column.** Every other field is modal-only. Adopted from `frontend-expert`.

Sixteen columns is not a table, it is a spreadsheet — it would scroll horizontally on every viewport, and
this project's rule is that wide content scrolls inside its own container rather than the page body. The
list's primary job, per 0041's **D-15** ordering rationale, is **looking a person up**; city + country is
the smallest discriminator that distinguishes two customers with similar names, which is why it earns a
column while postal code and both address lines do not. **Billing address gets no column at all**: it is
the same data shape as shipping in the overwhelming majority of records (**D-1**'s copy affordance
guarantees that), so a second location column would be visually redundant most of the time and confusing
the rest.

**Reversible and cheap** — adding a column is a view-only change. Removing one after people rely on it is
not, which is why the first cut is narrow.

### D-7 — Step-up authentication does **not** apply to this screen. A stated non-application, not an omission

**Decision: no operation on the Customers screen requires a recently confirmed password, and none of
`App\Actions\Auth\EnsureRecentPasswordConfirmation`'s call sites is added here.**

Task 0015a's step-up layer covers **five** operations behind `users.index`, and every one of them is a
privileged write against an **actor**: changing another user's **role**, their **status**, or their
**email**; **deleting** a user; and creating an **Administrator-tier** user. The layer exists because route
middleware asks about the *account* and a policy asks about the *actor/target pair*, while step-up asks
about **the person at the keyboard** — a question worth asking only when the write can escalate or destroy
privilege ([authorization.md](../../docs/architecture/authorization.md#step-up-authentication--the-third-layer)).

Mapped against this screen, **none of the five has a counterpart**:

| Step-up-gated Users operation | Customers equivalent |
| --- | --- |
| Change another user's **role** | **None.** A customer holds no role — PRD §3.1's hard boundary, pinned by 0041's structural tests. |
| Change another user's **status** | **None.** There is no `customers.status` column and no account state; the only lifecycle state is `deleted_at`. |
| Change another user's **email** | **Not equivalent.** `users.email` is an authentication identifier behind a signed pending-email flow; `customers.email` is contact data with no login, no reset token, no session and no passkey keyed to it (0041 **D-13**). Changing it takes over nothing. |
| **Delete** a user | **Not equivalent.** Deleting a customer removes a passive record from a list while preserving it (0042); it revokes no access and can lock nobody out. |
| Create an **Administrator-tier** user | **None.** There is no privilege tier concept for customers at all. |

So the layer would have nothing to bind. Two further reasons to state this rather than leave it silent:

- **Over-blocking is step-up's failure mode**, and this project's testing guide says a step-up layer's
  *exempt* cases must be tested as deliberately as its refusals. Adding a password prompt in front of
  routine contact-data entry would be a real usability regression bought with no security gain.
- **`frontend-qa` explicitly flagged the risk of building it anyway**, on the grounds that "the Users
  screen has it" is a plausible-sounding reason. Nothing in 0041, 0042 or 0043 requires it, and inventing
  it here would be a ghost scenario. **If a later story ever puts a privileged capability on a customer
  record, that story adds step-up — and this decision is the thing it must knowingly reverse.**

### D-8 — No search box, no filters and no pagination in this first cut

**Decision: the screen renders the full name-ordered list with no search input, no filter controls and no
pagination.** Adopted from `frontend-expert`.

Precedent first: `users.blade.php` and `roles.blade.php` both shipped their first cut this way, and neither
has needed more since. §3.1 asks for no search, and the PRD's **global** search
([§ Cross-cutting](../../docs/PRD/PRD.md#cross-cutting-global-search--notifications)) spans users, products
and blog posts — not a per-screen customer filter, so building one here would be inventing a requirement
rather than satisfying one.

**The honest caveat, recorded rather than glossed:** 0041 sizes `customers` at plausibly 10⁴–10⁵ rows at
real volume, which is a genuinely different scale from `users` (10²–10³) — so unlike the two screens above,
this omission has a **known expiry**. It is correct today because the table is empty (0041's **R-5**: there
is no customer seeder, deliberately) and because search, filtering and pagination are one coherent piece of
work rather than three, best specified against real usage. **The trigger is real customer volume**, and it
arrives with the same trigger as 0042's provisional `deleted_at` index decision (**D-4** there) — which is
why the backlog item below pairs them.

## Scope fences: what this story must NOT do

- Must **not** add, remove or alter a migration, column, index, model, cast or factory (0041 / 0042).
- Must **not** edit `CreateCustomer`, `UpdateCustomer`, `NotifyCustomerCreated` or
  `CustomerValidationRules` — it calls them. A needed change there is a finding against its owning story.
- Must **not** create, dispatch or assert the "new customer" notification (0043), in either direction.
- Must **not** render an order-history tab, panel, column, count or stub link, and must **not** define an
  `orders` relation (0047 / Orders).
- Must **not** add a permission to `RolePermissionSeeder` — the four `customers.*` abilities are seeded.
- Must **not** add a step-up / password-reconfirmation prompt (**D-7**).
- Must **not** add a restore or force-delete affordance — no PRD criterion asks for either, and
  `SoftDeletes::restore()` having no call site is this repo's documented status quo for `User` too.
- Must **not** seed customer fixture data. Customers are user data; a demo dataset belongs inside
  `DatabaseSeeder`'s `['local','testing']` gate if one is ever wanted (0041 **R-5**).

## Dependencies, risks and open questions

### Dependencies

**Hard dependency on all three sibling backend stories. This story cannot enter Phase 3 until 0041, 0042
and 0043 are done**, per the [task ordering rule](../../docs/workflow.md#task-ordering-rule) — its number
is higher for exactly that reason.

| Depends on | What this story consumes from it | Why it is hard, not soft |
| --- | --- | --- |
| [0041](0041-customers-crud-backend.md) | `customers` table, `App\Models\Customer`, `CustomerValidationRules`, `CreateCustomer`, `UpdateCustomer`, the **D-15** retrieval contract | Every property this view binds, every rule it validates against and every write it dispatches is defined there. Nothing renders without it. |
| [0042](0042-customers-soft-delete-backend.md) | `customers.deleted_at`, `SoftDeletes` on the model, the `customers.delete` gate | The delete affordance's *semantics* — "leaves the list, record survives" — are 0042's. Without it, this screen's delete button would hard-delete. |
| [0043](0043-customers-new-customer-notification-backend.md) | Nothing at the view layer — but `CreateCustomer` gains a **constructor dependency** | That is what makes `new CreateCustomer` break. This story must resolve the action from the container; landing before 0043 would let a `new` call site through review and break it later. |

**Two inconsistencies between the sibling files, both composed in parallel. The first is now resolved;
the second is a benign ordering detail.**

1. **`CustomerPolicy` — RESOLVED.** 0041's **D-12** originally stated there was **no** `CustomerPolicy`
   and that the actions authorized with the raw ability, while 0042's file list specified
   `CustomerPolicy::delete()`. The policy ships: **0041 creates the class** with `viewAny` / `create` /
   `update`, **0042 adds `delete()`** to that same file, and this story consumes all four and defines
   none. The deciding fact is that 0041's D-12 rested on `SalesRegion` being a no-policy domain entity,
   and it is not — [`app/Policies/SalesRegionPolicy.php`](../../app/Policies/SalesRegionPolicy.php)
   ships from story 0017, and is the shape all four `CustomerPolicy` abilities copy: flat, tier-free,
   delegating to `hasPermissionTo()`, with permission names as constants on the class. All three files
   now say this; if any copy still reads otherwise, it is stale.
2. **`lang/{en,es}/customers.php` ownership.** 0041's **D-14** defers the file to *this* story; 0042's
   file list says it *modifies* the file for delete copy. Since 0042 ships first, whichever of the two
   lands first **creates** the file and the other extends it — the keys are disjoint either way. Recorded
   so it is a known ordering detail rather than a merge surprise.

**What depends on this story:** **0047** (read-only order history) attaches its panel to this screen's
detail affordance, and will be the first story to need a customer **detail** view rather than a modal —
see [Technical tasks for the backlog](#technical-tasks-for-the-backlog).

### Risks

- **R-1 — The four Flux/Blaze and Livewire traps are reused, not rediscovered.** The conditionally-bound
  `:tooltip`, the `cursor-not-allowed!` placement, the `@js()` requirement and the `null`-bound-property
  desync are each recorded in [errors-log.md](../../docs/errors-log.md) with the exact verification method
  that found them. *Mitigation:* all four are stated as markup rules above, and the instruction is to copy
  `users.blade.php`'s shipped shape verbatim rather than write the obvious form and rediscover why it is
  wrong.
- **R-2 — Sixteen bound fields is the largest form in this app, and every one of them is a chance to bind
  a `null`.** *Mitigation:* every form property is typed `public string` with an `''` default, stated as a
  hard rule above, plus the "does an empty string reach a nullable column" question resolved explicitly at
  the action boundary rather than left implicit.
- **R-3 — The duplicate-email test can pass for the wrong reason.** A test asserting only "no second
  customer exists" passes against a form that silently swallowed the submission. *Mitigation:* every
  rejection case asserts **three** things — the modal is still open, the error is on the `email` field, and
  the row count is unchanged.
- **R-4 — A count assertion over the rendered modal is the exact shape this repo has already got wrong.**
  *Mitigation:* the test plan requires a delimiter-terminated selector that cannot match a wrapper element,
  **and** a proof that the count moves by one when a field is removed.
- **R-5 — The screen ships against an empty table** (0041's **R-5**: no customer seeder, deliberately).
  *Mitigation:* the empty state is an explicit acceptance criterion and a test, so "nothing to click on"
  is the designed first-run experience rather than a bug — and nobody "fixes" it by seeding production
  data.
- **R-6 — `config/modules.php` and `routes/customers.php` can drift.** A registry entry naming a broader
  permission than its route's gate advertises a screen the route then 403s. *Mitigation:* the existing
  mechanical set-equality test in `SidebarModuleGatingTest.php` picks the new entry up automatically —
  which this story **verifies** rather than re-writes.

### Open questions

**OQ-1 — Should the customers list paginate before search exists? Non-blocking; a default is stated.**
**Recommended default: no pagination in this cut _(recommended)_**, per **D-8** — it is the shipped
precedent on both existing list screens, and pagination without search solves the wrong half of a
large-list problem (you still cannot *find* anyone; you just page through more slowly). The alternative,
adding `->paginate()` now, is cheap but changes the **D-15** retrieval contract this story is required to
implement verbatim, so it would need 0041's contract amended first rather than being a view-only choice.

**OQ-2 — Does a customer need a detail *view* rather than a modal, and if so, is that this story's or
0047's? Non-blocking; a default is stated.** PRD §3.1 says a customer record "shows a read-only
order-history view", which is 0047's, and an order history is not modal-shaped. **Recommended default:
this story ships modals only _(recommended)_**, and **0047 introduces the detail route** (`customers.show`)
when it has something to put on it. The alternative — building an empty detail page now — ships a screen
whose only content is a heading, which is the ghost-affordance this file's opening note refuses. Recorded
so 0047 knows the route is its to add rather than assuming one exists.

## Technical tasks for the backlog

Derived from this story, none of them in scope:

1. **Customer search + filtering + pagination**, as one coherent piece of work, triggered by real customer
   volume (**D-8**). Pair it with revisiting 0042's provisional `deleted_at` index (**D-4** there), since
   the composite index's second column is driven by whatever the list actually filters on — a question this
   story deliberately leaves unanswered.
2. **Revisit the country field** (**D-2**) once the Sales Regions screen (story 0018) ships, and only on a
   product signal. If it becomes a picker, it is sourced from the **full** ISO catalog, never the active
   subset.
3. **A customer detail route** (`customers.show`), owned by 0047 (**OQ-2**).
4. **The duplicate-email message for a *deleted* customer** — 0042's OQ-1, which that story correctly
   routed to "the screen that renders it". This screen renders it, and this story does **not** resolve it:
   distinguishing "taken by a deleted customer" discloses the existence of a deleted record, which is a
   product call, not a markup one. Left explicitly open rather than decided silently in a UI story.

## Provenance

- **PRD source:** [§3.1 Customers](../../docs/PRD/PRD.md#31-customers) — the create, duplicate-email and
  soft-delete scenarios are adapted above; the **order-history** scenario is deliberately excluded as
  story 0047's, and the "a customer is not a dashboard user" scenario is 0041's structural concern with no
  UI surface.
- **Process:** [workflow.md](../../docs/workflow.md) Phase 1 — Three Amigos debate. Contributions from
  `frontend-expert` (files, component surface, view structure, the three open questions) and `frontend-qa`
  (the browser/component test set, the two Flux/Blaze trap confirmations, the sidebar-absence assertion,
  and the "don't build a ghost step-up scenario" caution that became **D-7**), composed by `product-owner`
  as facilitator. `database-expert` was **not** convened — this story adds no schema, migration or query
  design.
- **Decisions resolved by the facilitator:** **D-1**, **D-2** and **D-8** adopt `frontend-expert`'s three
  stated recommendations with the reasoning recorded; **D-7** promotes `frontend-qa`'s caution from a
  warning into an explicit, documented non-application; **D-3** through **D-6** resolve shape questions the
  contributions raised but did not settle.
- **Gherkin conventions:** every scenario opens with a named business-role actor and carries exactly one
  `When`, per [gherkin-guidelines.md](../../docs/testing/frontend/gherkin-guidelines.md) rules 1 and 3 —
  mandatory across all Gherkin in this project, per the incident recorded in
  [errors-log.md](../../docs/errors-log.md).
- **Stage:** `new`. Moves to `ai-spec/tasks/in-progress/` at the start of Phase 3 and to
  `ai-spec/tasks/done/` at Phase 7 — the first move changes this file's directory depth, so every relative
  link above must be re-resolved on each move, in **both** directions, per
  [workflow.md](../../docs/workflow.md#link-integrity-check-on-every-stage-move).
- **Epic 3 decomposition:** story 4 of 15. Depends on 0041, 0042 and 0043; sibling 0047 (order history)
  referenced by number only, its file not yet existing.
