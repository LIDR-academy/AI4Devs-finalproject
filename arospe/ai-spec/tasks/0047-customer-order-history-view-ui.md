# [0047] Customer detail — order history view UI

## Description
Build the customer **detail** screen of PRD [§3.1 Customers](../../docs/PRD/PRD.md#31-customers): a new
permission-gated `customers.show` route, the `App\Livewire\Customers\Show` component behind it, and the
Blade/Flux view that renders a compact read-only identity header plus that customer's **read-only order
history**. It also adds the `App\Models\Customer::orders()` relation that stories
[0041](0041-customers-crud-backend.md) and [0045](0045-orders-core-crud-backend.md) both deliberately
omitted and named this story as the owner of, and the "view detail" row affordance that
[0044](0044-customers-list-create-edit-ui.md)'s list does not yet carry — without which the screen is
unreachable.

> ## ⛔ BLOCKED — inherited cross-epic dependency (read this before Phase 3)
>
> **This story is fully specified now, but its Phase 3 implementation cannot start until story
> [0045](0045-orders-core-crud-backend.md) is `done` — and 0045 is itself ⛔ blocked on five PRD Epic 2
> stories ([0024](0024-products-core-crud-backend.md), [0029](0029-product-variants-backend.md),
> [0035](0035-shipping-carriers-backend.md), [0036](0036-shipping-rate-rules-backend.md),
> [0038](0038-payment-methods-bank-transfer-backend.md)).**
>
> This story renders `orders` rows, reads `App\Enums\OrderStatus`, and adds a `hasMany(Order::class)`
> relation. **None of `orders`, `order_items`, `App\Models\Order` or `OrderStatus` exists in code yet.**
> There is nothing here that can be stubbed to proceed: an order-history screen with no `orders` table
> is the ghost affordance [0044](0044-customers-list-create-edit-ui.md) explicitly refused to ship.
>
> **The blocking chain is two links long, so state it once and check both:** 0047 → 0045 → {0024, 0029,
> 0035, 0036, 0038}. Confirm 0045 is `done` — not merely unblocked — before Phase 2 is re-run.
>
> **What is *not* blocked:** this document. See [R-3](#risks) for why specifying it now is deliberate,
> and for the re-verification Phase 3 owes it.

## Type
frontend | includes database-expert: **no**

### Why this is one story

Three deliverables land here and none of them is separable from the other two:

1. **The detail route + component + view** — an order history is unbounded and list-shaped, so it cannot
   sanely nest inside 0044's Flux modal (**D-2**).
2. **The `Customer::orders()` relation** — the screen has nothing to query without it, and both 0041 and
   0045 named this story as its owner rather than shipping a relation with no reader.
3. **The "view detail" row affordance on 0044's list** — without it the route exists and nothing links
   to it, which is the same half-delivery a gated route without its `config/modules.php` entry would be
   ([routes.md](../../docs/api/routes.md#app-owned-routes)).

Splitting (3) out would ship a screen no administrator can reach; splitting (2) out would ship a
relation with no caller, which this repo has already rejected twice (0041 **D-15**, 0045 **D-6**, both
of which refused to ship a scope method ahead of its consumer).

`database-expert` was **not** convened: this story adds no migration, no column, no index and no schema
change of any kind. A `hasMany` declaration is a model-layer read path over an FK story 0045 already
designed and constrained.

## Three Amigos participants

- `frontend-expert` — the new-route-vs-modal-expansion scope decision, the route file, the component
  class and its public surface, the view structure, the order-row column set and ordering, the
  `Customer::orders()` relation, and the missing-link gap on 0044's list.
- `frontend-qa` — the test set: orders-present rendering, the empty state, the **provably read-only**
  assertion (markup-level, not "no visible button"), the authorization question that became **D-1**, and
  the soft-deleted-customer route behaviour flagged as "confirm, don't assume".
- `database-expert` — **not convened** (see above).

## Gherkin

```gherkin
Feature: Customer order history

  # --- The main case, adapted from PRD §3.1 ---

  Scenario: A customer administrator views a customer's order history
    Given a customer administrator whose role grants the customers view and orders view permissions, with a customer who has three orders
    When they open that customer's detail view
    Then they see a read-only list of that customer's three orders

  Scenario: The order history is ordered newest first
    Given a customer administrator whose role grants the customers view and orders view permissions, with a customer who has orders placed on different dates
    When they open that customer's detail view
    Then the most recently created order is listed first

  Scenario: An order row shows its reference, status and total
    Given a customer administrator whose role grants the customers view and orders view permissions, with a customer who has one order
    When they open that customer's detail view
    Then the order row shows the order number, the order status and the order total

  # --- The identity header ---

  Scenario: The detail view names the customer it belongs to
    Given a customer administrator whose role grants the customers view permission, with an existing customer
    When they open that customer's detail view
    Then they see that customer's name, email address and phone number

  # --- Empty and negative cases ---

  Scenario: A customer with no orders shows an empty order history
    Given a customer administrator whose role grants the customers view and orders view permissions, with a customer who has no orders
    When they open that customer's detail view
    Then they see a message stating that the customer has no orders

  Scenario: The order history is read only
    Given a customer administrator whose role grants the customers view, orders view, orders edit and orders delete permissions, with a customer who has one order
    When they open that customer's detail view
    Then no control for editing, cancelling or deleting an order is offered on any order row

  Scenario: An administrator without the orders view permission sees no order history
    Given a customer administrator whose role grants the customers view permission but not the orders view permission, with a customer who has three orders
    When they open that customer's detail view
    Then the customer's name, email address and phone number are shown
    And no order history section is shown

  Scenario: An administrator without the customers view permission cannot open the detail view
    Given a signed-in administrator whose role grants neither the customers view permission nor a bypass
    When they open a customer's detail view
    Then access is refused

  Scenario: A signed-out visitor cannot open the detail view
    Given a signed-out visitor
    When they open a customer's detail view
    Then they are redirected to the sign-in screen

  Scenario: A deleted customer's detail view is not found
    Given a customer administrator whose role grants the customers view permission, with a customer who has been deleted
    When they open that deleted customer's detail view
    Then the record is reported as not found

  # --- Reaching the screen from the list ---

  Scenario: A customer administrator opens a customer's detail view from the list
    Given a customer administrator whose role grants the customers view permission, with an existing customer
    When they activate that customer's row detail action on the customers list
    Then that customer's detail view is shown
```

## Files to create/modify

### Route — `routes/customers.php` (modify — 0044's file)

One route appended inside the file's **existing** `['auth', 'verified']` group. No new route file, no
second group:

```php
Route::middleware(['auth', 'verified'])->group(function () {
    Route::livewire('customers', CustomersIndex::class)
        ->middleware(['can:customers.view'])
        ->name('customers.index');

    // `can:customers.view` only. Rendering the order-history section
    // additionally requires `orders.view`, but that check is section-level
    // and lives in the component -- a second `can:` here would 403 the
    // whole page, denying access this actor's `customers.view` grants.
    // See D-1 in ai-spec/tasks/.../0047-customer-order-history-view-ui.md.
    Route::livewire('customers/{customer}', CustomersShow::class)
        ->middleware(['can:customers.view'])
        ->name('customers.show');
});
```

- **Exactly one ability on the route gate: `customers.view`** (**D-1**). Not `can:orders.view` as a
  second middleware — see D-1 for why, and for the alternative that was rejected.
- **`can:`, never Spatie's `permission:`** — the rule the sibling route files already state inline; a
  `permission:`-gated route protects the initial `GET` only
  ([authorization.md](../../docs/architecture/authorization.md#gating-a-livewire-route-use-can-never-permission)).
- **Route order matters.** `customers/{customer}` must be declared **after** `customers`, or a literal
  `customers` request risks binding as a parameter under some route-cache orderings. Declared in this
  order above; a test pins that `GET /customers` still resolves to `customers.index`.
- **Route-model binding on `{customer}`**, not a raw string id. `Customer` is UUID-keyed via `HasUuids`,
  whose `resolveRouteBindingQuery()` validates the segment with `Str::isUuid()` first — so a malformed
  parameter is a **404 without a query**
  ([base-standards.md](../../docs/conventions/base-standards.md#uuid-primary-keys)).
- ⚠️ **Do not plan a `verified`-middleware test.** `App\Models\User` does not implement `MustVerifyEmail`,
  so `verified` refuses nobody on any route in this app; a test asserting it carries no signal
  ([errors-log.md](../../docs/errors-log.md#a-planned-test-asserted-a-refusal-by-verified-a-middleware-that-refuses-nobody-in-this-app--2026-08-20)).

### Component — `app/Livewire/Customers/Show.php` (new)

Class-based, `#[Title]` on the class ([base-standards.md](../../docs/conventions/base-standards.md#livewire-component-convention-class-based-not-single-file)).

| Member | Shape | Notes |
| --- | --- | --- |
| `mount(Customer $customer)` | `void` | `Gate::authorize('customers.view')` first, then `$this->customerId = $customer->id` |
| `$customerId` | `#[Locked] public string` | **server-authoritative**; the only state this component holds (**D-7**) |
| `customer()` | `#[Computed]` | `Customer::findOrFail($this->customerId)` |
| `orders()` | `#[Computed]` | the order rows — **guarded**, see below (**D-1**) |
| `canViewOrderHistory()` | `#[Computed] bool` | `Gate::allows('orders.view')` — the one predicate both the guard and the view read |

- **No public method mutates anything.** There is no `save()`, no `delete*()`, no modal state, no
  `wire:model`-bound property. That is the story's central claim and it is asserted by a test, not left
  to inspection (see [Tests](#tests-to-perform)).
- **`orders()` guards before it queries** (**D-1**), and returns an empty collection rather than
  throwing:

  ```php
  #[Computed]
  public function orders(): Collection
  {
      if (! $this->canViewOrderHistory()) {
          return collect();
      }

      return $this->customer()->orders()
          ->orderByDesc('created_at')
          ->orderByDesc('id')
          ->get()
          ->map(fn (Order $order): array => [
              'id' => $order->id,
              'orderNumber' => $order->order_number,
              'status' => $order->status->value,
              'statusLabel' => $order->status->label(),
              'total' => $order->total,          // decimal STRING, never cast
              'createdAt' => $order->created_at->format('d/m/Y H:i'),
          ]);
  }
  ```

  **The early return is the disclosure gate, not the view's `@if`.** A view-only conditional would leave
  the query running and the rows in the component's render context — gating a method that *discloses* is
  the shipped rule
  ([livewire-authorization.md](../../docs/security/livewire-authorization.md#gate-at-the-top-of-every-method-that-mutates-or-discloses)),
  and the view branches on the **same** `canViewOrderHistory()` predicate so the two cannot drift. This
  is the non-throwing-predicate / guarded-consumer shape `EnsureRecentPasswordConfirmation` established.
- **Ordering is `orderByDesc('created_at')->orderByDesc('id')`** — 0045 **D-6**, applied to the relation
  rather than to `Order::query()`. The `id` tie-break is not decoration: UUID v7 is time-ordered, so
  orders sharing a `created_at` second still sort deterministically and the test is not flaky by
  construction.
- **No eager loading** (**D-8**). Nothing on an order row comes from `items`, `paymentMethod`,
  `salesRegion` or `shippingRate`, so 0045's **D-14** detail contract — which is story 0055's — must not
  be copied here. Eager-loading relations nothing renders is a per-row cost for no output.
- **`total` is a decimal string end to end.** Eloquent's `decimal:2` cast returns a string; a `(float)`
  anywhere in this component or its view is a defect (**D-9**, [R-4](#risks)).
- **Boolean/computed naming** follows [naming.md](../../docs/conventions/naming.md#boolean-properties):
  a predicate (`canViewOrderHistory()`), never a noun, never a `get*` prefix — and the rule binds a
  `#[Computed]` method exactly as it binds a property.

### View — `resources/views/livewire/customers/show.blade.php` (new)

**The nested path, and this is *not* the `Index` exception.** `App\Livewire\Customers\Show` follows the
normal component ↔ view mirror, so it resolves to `livewire/customers/show.blade.php` — while its
sibling `App\Livewire\Customers\Index` resolves to the **flat** `livewire/customers.blade.php`. The two
therefore live at different depths, which
[naming.md](../../docs/conventions/naming.md#exception-a-component-named-index-resolves-to-its-parent-folders-name)
records as expected rather than a mistake. **Resolve the path by running the component, not by reasoning
about it** — stories 0010 and 0011 both wrote the wrong path into their own Phase 1 specs and found out
at first render.

Structure:

- **Header** — a "Back to customers" `flux:button`/link to `route('customers.index')`, a `flux:heading`
  carrying the customer's name, and a compact read-only identity block (**D-3**):

  | Field | Rendering |
  | --- | --- |
  | Email | `customer.email` |
  | Phone | `customer.phone` or an em dash (0041 **D-3** makes it optional) |

  Plain text, `flux:text`/`flux:subheading` — **no `flux:input`, no `readonly` form control**. A disabled
  input reads as "editable elsewhere" and puts sixteen columns' worth of form surface on a page that
  owns none of it.
- **Order history section** — wrapped in `@if ($this->canViewOrderHistory())`, containing a
  `flux:heading` and a `flux:table` with **four** columns (**D-5**):

  | Column | Content |
  | --- | --- |
  | Order | `orderNumber` |
  | Status | `flux:badge` coloured per status value, labelled `statusLabel` |
  | Total | `€ {{ $order['total'] }}` — the stored decimal string |
  | Date | `createdAt` |

  **No actions column, no row link, no `wire:click` anywhere in this table** (**D-5**). The badge colour
  is chosen in the view from `$order['status']`, matching how `users.blade.php` colours `UserStatus`; the
  *label* comes from `OrderStatus::label()` in the component, never from a hardcoded string.
- **Empty state** — an explicit `customers.detail.no_orders` block when `orders()` is empty, never a bare
  table with no rows (0044's rule, and the general convention).
- **No section at all** when `canViewOrderHistory()` is false — no heading, no empty state, no "you lack
  permission" notice (**D-1**). An actor who cannot see orders should not learn from this page how many
  the customer has, nor that an order-history feature exists behind an ability they lack.

Markup rules inherited rather than invented:

1. **`@js(...)` around any `wire:click` argument** — there are none on this page today, and if one is
   ever added the rule binds
   ([blade-livewire-output-encoding.md](../../docs/security/blade-livewire-output-encoding.md)).
2. **`data-test` hooks** on the elements the tests select: `data-test="customer-detail-header"`,
   `data-test="customer-order-history"` (the section wrapper — its **absence** is what the
   `orders.view`-less test asserts), and `data-test="customer-order-{id}"` per row.
3. **No disabled-but-present row action.** Users and Roles render a refused row action `disabled` with
   its `data-test` hook on both branches; this page renders **no** order row action on any branch, so
   there is nothing for such a hook to hang on. Stated explicitly because the repo's dominant pattern is
   the opposite one, and a Phase 3 implementer copying `users.blade.php` would produce disabled controls
   this story's read-only claim forbids.

### Model — `app/Models/Customer.php` (modify — 0041's file)

One relation added, nothing else:

```php
/** @return HasMany<Order, $this> */
public function orders(): HasMany
{
    return $this->hasMany(Order::class, 'customer_id');
}
```

- **The FK is named explicitly** even though Laravel would infer `customer_id` — the repo's
  `constrained('sales_regions')` precedent is the same instinct: state the thing a reader would otherwise
  have to derive.
- **No default ordering on the relation** (**D-4**). Ordering lives in the query at the call site, so a
  future caller that needs a different order is not fighting a hidden global.
- **No `withTrashed()` concern in either direction.** `Order` has no `SoftDeletes` (0045), and this
  relation is read *from* a `Customer` that route-model binding has already resolved through the scoped
  query — so a trashed customer never reaches it (see the 404 test under
  [Tests](#feature--testsfeaturecustomersshowtestphp-new--route--component)).
- **This becomes shared infrastructure.** Every later Orders-adjacent Customer view — a per-customer
  order count on the list, a "customer since / last order" summary, a customer merge tool — reuses this
  relation rather than re-declaring one. It is added here because this story is its first *reader*, per
  the "no scope/relation ahead of its consumer" rule 0041 **D-15** and 0045 **D-6** both applied.
- ⚠️ **`@property-read`**: add `Collection<int, Order> $orders` to the model's `@property` docblock,
  which [base-standards.md](../../docs/conventions/base-standards.md#model-conventions) requires be kept
  in lockstep. Larastan level 7 will flag the relation's generics if the annotation is wrong, not merely
  missing.

### List row affordance — `resources/views/livewire/customers.blade.php` (modify — 0044's file)

The missing link. A **third** row action in the existing actions cell, ahead of edit and delete:

- An icon-only link (`eye` icon) with an `aria-label` and `data-test="view-customer-{id}"`, pointing at
  `route('customers.show', $customer['id'])`.
- **It is a plain `<a>`/`flux:button :href`, not a `wire:click`** — a navigation, not a component action,
  so it needs no `@js()` and no server round-trip.
- **It renders enabled for every actor who can see the list at all** (**D-1**): the target route gates on
  `customers.view`, which is the same ability that rendered this row. There is no per-row hint to derive
  and no disabled branch — deliberately unlike the edit/delete actions beside it, whose flat
  `Gate::allows('customers.edit')` / `('customers.delete')` hints (0044 **D-3**) genuinely can be false.
- **This is a sequential edit of a `done` story's file, not a concurrent one** (**D-6**).

### Translations — `lang/en/customers.php` + `lang/es/customers.php` (modify — 0044's files)

One new key group, key-for-key identical across both locales, snake_case leaves:

```php
'detail' => [
    'back_to_list' => '…',
    'order_history_heading' => '…',
    'no_orders' => '…',
    'view_detail' => '…',   // the list row action's aria-label
],
```

- **No `orders.*` key is added by this story.** `OrderStatus::label()` resolves `orders.statuses.*`,
  which 0045 ships; adding a status label here would be a second source of truth for the same string.
- **No `trans_choice()` key needed** — nothing on this page is count-dependent. (Should an order count
  ever be shown, it is one `|`-delimited key resolved with `trans_choice()`, never a PHP ternary and
  never inline in the Blade file — [naming.md](../../docs/conventions/naming.md#translation-keys).)
- Generic chrome (`Back`, `Email`, `Phone`, `Date`, `Total`) stays as bare `__('…')` literals matching
  `users.blade.php`; only domain copy goes in this file.
- Both locale files ship in the same change. `APP_LOCALE=en` today, so everything renders English until
  Epic 5 — accepted and documented, not a defect.

### Explicitly **not** touched by this story

- `database/migrations/**` — no column, no index, no migration. `orders.customer_id` and its FK are
  0045's; `customers.deleted_at` is 0042's.
- `app/Models/Order.php`, `app/Models/OrderItem.php`, `app/Enums/OrderStatus.php`,
  `app/Enums/PaymentStatus.php` — 0045's. This story **reads** them and changes none.
- `app/Actions/**` — none is created. This story performs no write, so it has no action to call.
- `app/Policies/**` — none is created (**D-1**'s last paragraph).
- `database/seeders/RolePermissionSeeder.php` — `customers.*` and `orders.*` are already seeded; no
  permission is added.
- `config/modules.php`, `lang/{en,es}/navigation.php` — no sidebar entry (**D-10**).
- `app/Livewire/Customers/Index.php` — the list **component** is unchanged; only its **view** gains the
  row link, and only its rendering test is extended.

## Tests to perform

Two suites. Per [testing/README.md](../../docs/testing/README.md), a `Livewire::test()` authorization
test and an HTTP one are **not substitutes for each other** — route middleware and the in-component gate
fail in different places, and `/livewire/update` does not re-run every route middleware. Both are
required wherever authorization is asserted.

### Feature — `tests/Feature/Customers/ShowTest.php` (new — route + component)

- [ ] Integration test: a signed-out visitor requesting `route('customers.show', $customer)` is
      redirected to `login`.
- [ ] Negative test: a signed-in user holding no `customers.*` permission gets a **403**.
- [ ] **Positive** test: a user holding exactly `customers.view` gets a **200**. Required, not optional —
      a misspelled ability denies everyone and denial is indistinguishable from a correct refusal
      ([authorization.md](../../docs/architecture/authorization.md#the-copyable-module-gate-pattern-and-the-three-alternatives-rejected)).
- [ ] Integration test: a Super Admin (holding zero permission rows) gets a **200** via `Gate::before`.
- [ ] Negative test: `route('customers.show', $trashedCustomer)` is a **404**. Route-model binding
      resolves through the scoped query, so a soft-deleted customer simply does not bind — **confirmed
      against 0042's own stated behaviour, not assumed**, and asserted here because this story is the
      first route in the repo to bind a `Customer`.
- [ ] Negative test: a malformed, non-UUID `{customer}` segment is a **404** (`HasUuids`'
      `resolveRouteBindingQuery()` refuses it before any query runs).
- [ ] Integration test: `GET /customers` still resolves to `customers.index` after the parameterised
      route is added — the route-ordering regression.
- [ ] Integration test: the `customers.show` route's `can:` middleware set is **exactly**
      `['can:customers.view']`. Pinned mechanically, so a later story widening the gate has to change
      this line deliberately.
- [ ] Integration test: `config('modules.items')` is **unchanged** by this story and
      `tests/Feature/Navigation/SidebarModuleGatingTest.php` still passes — that suite's set-equality
      guard iterates registry *items* and resolves each entry's own `route` key, so a second route under
      `customers.*` is outside its scope. **Verified against the shipped test, not assumed** (**D-10**).
- [ ] Component test: `Livewire::test(Show::class, ['customer' => $customer])` mounted by a user without
      `customers.view` throws `AuthorizationException` — the in-component `mount()` gate, distinct from
      the route refusal above.

### Feature — `tests/Feature/Customers/ShowRenderingTest.php` (new — markup + data contract)

- [ ] Integration test: for a customer with three orders, all three `order_number` values render, and
      each row shows its status label and its total.
- [ ] Integration test: the identity header renders the customer's `name`, `email` and `phone` as
      visible text.
- [ ] Edge case: a customer whose `phone` is `null` renders an em dash, not the string `null` and not a
      blank cell.
- [ ] **Ordering test**: three orders created with distinct `created_at` values render newest-first.
      Assert on the **rendered position** (e.g. `strpos` of each order number in the response), not on
      the collection the component built — the component could sort correctly and the view still emit
      them in insertion order.
- [ ] **Ordering tie-break test**: two orders sharing a `created_at` second render in a deterministic
      order (UUID v7 descending). Without this the newest-first test is flaky by construction.
- [ ] Edge case: a customer with **zero** orders renders the `customers.detail.no_orders` block and
      **no** empty `flux:table` body.
- [ ] **Read-only test — markup-level, not "no visible button".** For a customer with one order, and an
      actor holding `customers.view`, `orders.view`, `orders.edit` **and** `orders.delete`, assert that
      the rendered response contains **no** `data-test="edit-order-`, no `data-test="delete-order-`, and
      **no `wire:click` at all** within the order-history section. Asserting only "no visible button"
      is insufficient here: this repo's dominant row-action pattern renders a refused control
      **disabled but present**, with its `data-test` hook on both branches — so a hook a test mistakes
      for a control is exactly the failure mode this assertion exists to catch.
- [ ] **Read-only test — component-level.** By reflection, assert the component class exposes no public
      method beyond `mount`, `customer`, `orders`, `canViewOrderHistory` and `render`. "This screen
      writes nothing" is the story's central claim, and a public mutating method reachable over
      `/livewire/update` would satisfy every markup assertion above while falsifying it.
- [ ] **`orders.view`-absent test — the D-1 case, asserted twice over.** For an actor holding
      `customers.view` but **not** `orders.view`, against a customer with three orders:
      - the identity header **is** present (`data-test="customer-detail-header"`);
      - `data-test="customer-order-history"` is **absent**;
      - **none of the three `order_number` values appears anywhere in the response body.** The second
        assertion alone would pass a view that skipped the heading and still leaked the rows.
- [ ] **`orders.view`-present positive test**, beside the negative one — a misspelled `orders.view`
      would hide the section from everybody, and a hidden section looks exactly like a correct refusal
      ([R-5](#risks)).
- [ ] Integration test: `total` renders as the stored decimal string (e.g. `10.00`, not `10`), asserted
      as a **string** — `decimal(10,2)` casts to a string in Eloquent, and a float comparison here either
      fails confusingly or passes for the wrong reason.

### Unit — `tests/Unit/Models/CustomerTest.php` (new or extend)

- [ ] Unit test: `Customer::orders()` returns a `HasMany` whose related model is `Order` and whose
      foreign key is `customer_id`.
- [ ] Integration test: a customer's `orders` returns only **that** customer's orders — create two
      customers with orders each and assert no cross-contamination. Trivial-looking, and it is the one
      assertion that fails if the FK is ever mis-wired.
- [ ] Integration test: the relation carries **no** default ordering — assert the relation's query has no
      `orders` clause of its own (**D-4**), so the ordering in `Show::orders()` is provably the only one.

### Feature — `tests/Feature/Customers/IndexRenderingTest.php` (extend — 0044's file, do not duplicate)

- [ ] Integration test: each customer row renders `data-test="view-customer-{id}"` whose `href` is
      `route('customers.show', $customer)`.
- [ ] Integration test: that action renders for an actor holding **only** `customers.view` (no
      `customers.edit`, no `customers.delete`) — it has no disabled branch, unlike its two neighbours.

### Browser — `tests/Browser/Customers/CustomerDetailTest.php` (new — Pest 4, Chromium)

- [ ] Journey: from the customers list, click the row's detail action, land on the detail page, and see
      the customer's name and their order rows. One journey, driven the way a person drives it — the
      list→detail link is the affordance this story exists to add, and a Feature test asserting an
      `href` does not prove a click reaches the page.
- [ ] Journey: a customer with no orders shows the empty-history message.

### Deliberately **not** tested

- **Anything about how an order was created, priced or numbered** — 0045's tests own the price snapshot,
  the `order_number` generator and the totals arithmetic. This screen renders columns; asserting their
  derivation here would duplicate 0045's suite and go stale with it.
- **`payment_status`** — not rendered (**OQ-1**), so there is nothing to assert.
- **A `verified`-middleware refusal** — see the ⚠️ under [Route](#route--routescustomersphp-modify--0044s-file).
- **Pagination behaviour** — none exists in this cut (**D-11**).

## Expected outcome

An administrator holding `customers.view` can open a customer from the customers list and land on a
dedicated detail page at `/customers/{uuid}` showing that customer's name, email and phone, and — if they
also hold `orders.view` — a read-only, newest-first table of that customer's orders with each order's
number, status badge, total and date. A customer with no orders shows an explicit empty message rather
than a blank table. An administrator without `orders.view` sees the same page with the order-history
section entirely absent, learning nothing about how many orders exist. Nothing on the page writes
anything: there is no form, no modal, no row action and no mutating component method. A soft-deleted
customer's URL is a 404, and `App\Models\Customer` gains an `orders()` relation that every later
Orders-adjacent customer view reuses.

## Acceptance criteria

- [ ] A `customers.show` route exists at `GET /customers/{customer}`, gated `can:customers.view` and
      **only** that ability, declared after `customers.index` in the same `['auth', 'verified']` group.
- [ ] `App\Livewire\Customers\Show` authorizes `customers.view` in `mount()` and holds exactly one piece
      of state, `#[Locked] public string $customerId`.
- [ ] The page renders the customer's name, email and phone read-only, with an em dash for an absent
      phone.
- [ ] The order history renders `order_number`, a status badge from `OrderStatus::label()`, `total` as a
      decimal string, and `created_at` — four columns, no actions column, no row link.
- [ ] Orders render newest first, ordered `created_at desc, id desc` (0045 **D-6**).
- [ ] A customer with no orders renders an explicit empty-history message.
- [ ] **Rendering the order history requires `orders.view` in addition to `customers.view`**; without it
      the section is absent from the DOM and **no order data is present anywhere in the response** — and
      the page itself still renders 200, not 403.
- [ ] The order-history query does not run when `orders.view` is absent (the guard is in `orders()`, and
      the view's conditional reads the same predicate).
- [ ] No public method on the component mutates anything; no `wire:click` exists in the order-history
      section.
- [ ] `App\Models\Customer::orders()` is a `hasMany(Order::class, 'customer_id')` with no default
      ordering, and its `@property-read` annotation is added.
- [ ] The customers list carries a `data-test="view-customer-{id}"` link to `customers.show`, rendered
      for every actor who can see the list.
- [ ] A soft-deleted customer's detail URL is a 404; a malformed UUID is a 404.
- [ ] `lang/en/customers.php` and `lang/es/customers.php` gain the same `detail.*` leaves, key-for-key.
- [ ] No migration, no column, no permission, no `config/modules.php` entry and no sidebar change ships.

## Definition of Done

- [ ] Tests written and green — the full suite unscoped (`php artisan test`, no `--filter`), not only the
      Customers-scoped run
      ([base-standards.md](../../docs/conventions/base-standards.md#steps-1-and-2-are-the-iteration-forms-run-both-unscoped-before-declaring-the-work-done)).
- [ ] `vendor/bin/pint --format agent` run **unscoped** (not `--dirty`), and Larastan level 7 clean —
      the relation's generics are the likely finding.
- [ ] Code reviewed (`code-reviewer`).
- [ ] No security findings (`appsec-auditor`) — specifically: that the `orders.view` check gates the
      **query**, not merely the markup; that no order data reaches the response for an actor lacking it;
      that `$customerId` is `#[Locked]`; and that the absent-section branch discloses nothing about how
      many orders exist.
- [ ] Documentation updated (`docs-keeper`):
  - [`api/routes.md`](../../docs/api/routes.md) — `customers.show` added to the app-owned routes table,
    with a subsection recording that its middleware column **understates** what protects the page: the
    order-history section additionally requires `orders.view`, enforced in-method and therefore invisible
    there. This is the same "the middleware column understates what protects this route" note
    `users.index` and `roles.index` both carry.
  - [`architecture/authorization.md`](../../docs/architecture/authorization.md) — the
    [disclosure-gate section](../../docs/security/livewire-authorization.md#the-shipped-disclosure-gates-and-why-the-disclosure-check-is-the-stronger-ability)'s
    rule gains its **first cross-module** case: a screen owned by one module disclosing another module's
    records asks that other module's ability, and refuses by **omitting the section**, not by 403.
  - [`database/schema.md`](../../docs/database/schema.md) — the `customers` ⇄ `orders` relationship is now
    live in the model layer. **Verify rather than assume:** 0045 adds the FK and the ER edge; this story
    adds only the Eloquent relation, so the schema page may need no change at all — check, and record
    that it was checked.
  - [`conventions/naming.md`](../../docs/conventions/naming.md) — the `Index`-flat / `Show`-nested depth
    asymmetry now has a **shipped second case** in the same folder, which the existing "that asymmetry is
    expected, not a mistake" paragraph predicted but could not cite.
  - **Grep the tree for bare negative claims this story falsifies**, not only the change→doc mapping:
    `grep -rn "no relation exists\|no detail route\|only route\|does not exist yet" docs/` — 0041 **D-15**'s
    "no eager loading (no relation exists yet)" is quoted in at least two places and becomes an
    under-statement the moment `orders()` lands
    ([errors-log.md](../../docs/errors-log.md#a-docs-this-app-has-no-x-yet-claim-outlived-the-x-by-two-tasks--2026-08-13)).
- [ ] Acceptance criteria met.

## Documented functional decisions

Each resolves a question raised during the debate. Every one is a **conservative, reversible default the
human may override** — the reasoning is recorded so an override is a decision rather than a rediscovery.

### D-1 — Rendering the order history requires **both** `customers.view` and `orders.view`, and the second is a section-level check that omits the section rather than refusing the page

*(Resolves `frontend-qa`'s explicitly-unresolved authorization question, and `frontend-expert`'s open
question 2.)*

**The rule.** The route and `mount()` gate on `customers.view`. The order-history section additionally
requires `orders.view`, checked in `Show::orders()` before any query runs, with the view's conditional
reading the same predicate.

**Why a second ability at all.** This screen belongs to the Customers module and discloses **another
module's records**. The precedent is exact and already shipped: task 0015 closed finding F7 by gating
`App\Livewire\Users\Index`'s three modal openers, and the rule it established is *"a disclosure gate must
cover every attribute the method copies out, not the operation the actor might go on to perform"*
([livewire-authorization.md](../../docs/security/livewire-authorization.md#the-shipped-disclosure-gates-and-why-the-disclosure-check-is-the-stronger-ability)).
`openEditModal()` asks `updateSensitiveAttributes` — a **stronger** ability than the base `users.view`
that rendered the list — precisely because it copies out attributes that ability owns. Here the attributes
being copied out are `order_number`, `status` and `total`: they are owned by `orders.view`, and no reading
of `customers.view` covers them. A single-ability page would let a role scoped to customer contact data
read the store's order book by opening one customer at a time.

**Why the section is *omitted*, not a 403.** The page's primary content — the customer's identity — is
exactly what `customers.view` grants, so refusing the whole page would deny access the actor holds.
Rendering 403 would also be a worse disclosure than the one it prevents: it tells the actor that this
customer *has* an order-history surface behind an ability they lack. The section is therefore absent
entirely — no heading, no empty state, no "insufficient permission" notice — and an actor without
`orders.view` cannot distinguish a customer with fifty orders from one with none.

**Why the check is in the method, not only the view.** A view-only `@if` leaves the query running and the
rows in the render context; a template change, a debug dump or a future partial could surface them. The
guard belongs where the disclosure happens
([livewire-authorization.md](../../docs/security/livewire-authorization.md#gate-at-the-top-of-every-method-that-mutates-or-discloses)),
and the view reads the **same** `canViewOrderHistory()` predicate so the hint and the rule cannot drift —
the throwing-guard-around-non-throwing-predicate shape `EnsureRecentPasswordConfirmation` established.

**Two alternatives rejected:**

| Alternative | Why not |
| --- | --- |
| `->middleware(['can:customers.view', 'can:orders.view'])` on the route | Two `can:` middlewares AND together, so this works mechanically — but it 403s the **whole page**, denying identity data `customers.view` grants. It also puts an `orders.*` ability on a `customers.*` route, which is the shape the module-gate pattern's one-ability-per-route rule exists to prevent. |
| `customers.view` alone, order history visible to all who reach the page | The cross-module disclosure above, unmitigated. It is also *silently* wrong: nothing fails, and the leak is invisible in every happy-path test, which is why it needs its own negative test ([R-1](#risks)). |

**No `CustomerPolicy` or `OrderPolicy` is created.** Both checks reduce to "does the actor hold
`<module>.view`" with zero row-level nuance — 0041 **D-12** and 0045 **D-13** set that precedent for both
models. If a later story introduces a row-level rule (an order an actor may not see, a per-region
restriction), a policy is added then and these `Gate` calls **change target, not location**.

**Consequence to state plainly for Phase 3:** an actor with `customers.view` but not `orders.view` gets a
**200** with the identity header and no order-history section. That is the specified behaviour, not a
degraded one.

### D-2 — A new detail page and route, not an expansion of 0044's edit modal

*(Scope decision contributed by `frontend-expert`, adopted with its reasoning recorded.)* An order history
is **unbounded and list-shaped**: a customer may have one order or two hundred, and a Flux modal is sized
for a bounded form. Nesting a scrolling table inside a modal that already carries sixteen form fields
produces a scroll-within-scroll on every viewport and makes the modal's own "Cancel" ambiguous. The split
is also not this story's invention — **0044 anticipated it in its own OQ-3**, recommending that it "ships
modals only" and that "**0047 introduces the detail route** (`customers.show`) when it has something to
put on it", and listed the route as a backlog item owned by this story. Building it here rather than there
is exactly the ghost-affordance discipline 0044 applied: the route ships in the same change as the content
that justifies it.

### D-3 — The page carries a compact read-only identity header (name, email, phone), not the full sixteen columns

*(Resolves `frontend-expert`'s open question 1; recommended and adopted.)* PRD Epic 3's own framing asks
for the "**same list + detail/editor visual patterns** established in Users and Products (list with status
badges, a **detail/editor view**, modals for quick create/edit)" — which reads as a fuller detail view,
not a bare order table under an anonymous heading. A page whose entire content is orders forces the
administrator to keep a second window or modal open just to know whose orders they are reading.

**Three fields, not sixteen.** Name, email and phone are what identify a person at a glance; the twelve
address columns are consulted while *fulfilling* an order, which is story 0055's screen, and 0044's edit
modal is the canonical place to read or change them. Duplicating them read-only here creates a second
surface to keep in sync with no reader asking for it — the same restraint 0044 **D-6** applied when its
list showed five columns of sixteen. **Read-only means plain text**, never a disabled `flux:input`: a
greyed-out form field reads as "editable elsewhere, or later", which is a promise this page does not make.
Whether the header should link back to the list's edit modal is [OQ-3](#open-questions), deliberately not
decided here.

### D-4 — `Customer::orders()` carries no default ordering

The ordering (`created_at desc, id desc`) lives in `Show::orders()`, not in the relation. A relation with a
baked-in `orderBy` is a hidden global that every future caller inherits and must then fight — and this
relation is explicitly shared infrastructure (see [What depends on this story](#what-depends-on-this-story)),
so its first reader must not impose its own view's needs on the next one. It also keeps the ordering
**testable as a property of this screen**, which is what 0045 **D-6** specified and what this story's
rendering test pins.

### D-5 — Four columns, no row link, no row actions

*(Contributed by `frontend-expert`, extended by the facilitator.)* `order_number`, status, `total`,
`created_at` — the four values that let an administrator recognise an order at a glance. **No row action**
because order management belongs to Orders' own screens; rendering an edit or cancel control here would
duplicate story 0055's surface and its guards (0045 **D-13** notes the row-state-dependent rules those
stories introduce — editing blocked once `Enviado`, cancellation blocked in three states — none of which
exist yet and none of which this screen may re-derive). **No row *link* either**, because story 0055's
order-detail route does not exist: a link to a route that has not shipped is precisely the ghost
affordance 0044 refused. Adding it is a one-line backlog item once 0055 lands ([backlog item 1](#technical-tasks-for-the-backlog)).
`payment_status` is deliberately excluded — see [OQ-1](#open-questions).

### D-6 — This story edits 0044's Blade view and lang files, and that is safe only because it runs after 0044 is `done`

Three files here belong to a sibling story: `resources/views/livewire/customers.blade.php`,
`lang/{en,es}/customers.php` and `routes/customers.php`. This repo has a recorded incident about two
agents writing the same Blade view
([errors-log.md](../../docs/errors-log.md#two-agents-dispatched-in-parallel-both-wrote-to-the-same-blade-view--2026-08-16)),
and 0044's own "Why this is one story" section refused to split its view for the same reason.

**The rule for Phase 3: this story must not be implemented in parallel with 0044.** A *sequential* edit of
a closed story's file is ordinary maintenance; a *concurrent* one is the incident. 0044 is a hard
dependency here regardless (see [Dependencies](#dependencies)), so the ordering constraint costs nothing —
it only needs stating, because "0047 modifies 0044's files" is otherwise the kind of overlap an
orchestrator dispatching Epic 3 stories in a batch would not notice.

### D-7 — The component holds `#[Locked] public string $customerId`, not an `Order`/`Customer` model as public state

Route-model binding resolves `{customer}` in `mount(Customer $customer)` — which is what produces the 404
for a trashed or malformed id — and `mount()` then stores **only the id**, re-resolving through a
`#[Computed] customer()`. This is the server-authoritative-id idiom 0044 uses for `$editingCustomerId` and
the Users screen uses for `$deletingUserId`. `#[Locked]` because a client-writable id would let any holder
of `customers.view` re-point the component at a different customer over `/livewire/update` — which the
route gate would not re-evaluate, since route middleware is only partially re-applied there
([livewire-authorization.md](../../docs/security/livewire-authorization.md)).

### D-8 — No eager loading; 0045's **D-14** detail contract is story 0055's, not this one's

0045 specifies `with(['customer', 'items', 'paymentMethod', 'salesRegion', 'shippingRate'])` for the
**order detail** screen, which renders all of them on one page. This screen renders none of them: four
scalar columns off `orders` itself. Copying D-14 here would eager-load five relations per row for zero
rendered output — and would then look, to a later reader, like a contract this story was required to
honour. Recorded so the divergence reads as a decision.

### D-9 — Money renders as the stored decimal string; there is no float anywhere on this path

`orders.total` is `decimal(10,2)`, which Eloquent casts to a **string**. The view renders it as-is with a
`€` prefix. No `(float)`, no `floatval()`, no arithmetic — this screen performs none. 0045's **R-3**
records the two ways a float assertion fails here (confusingly, or silently for the wrong reason), and the
test plan above states string comparison explicitly. A shared money formatter is
[backlog item 2](#technical-tasks-for-the-backlog), not this story's to invent for one column.

### D-10 — No `config/modules.php` entry and no sidebar change

`customers.show` is a **detail route inside an existing module**, not a new module. 0044's registry entry
already carries `'current_when' => 'customers.*'`, so the sidebar's Customers item stays highlighted on the
detail page with no edit at all. Verified rather than assumed: `SidebarModuleGatingTest`'s set-equality
guard iterates `config('modules.items')` and resolves each entry's own `route` key — it never enumerates
routes — so a second route under `customers.*` is outside its scope. A test in this story re-asserts the
suite still passes, because "outside its scope" is a claim about a test file that a later story could
change.

### D-11 — No pagination on the order history in this cut

Consistent with 0044 **D-8** (no search, no filters, no pagination on the customers list) and with both
shipped list screens. A per-customer order count is bounded by that customer's own history, which is a far
smaller number than the store-wide order book story 0055 will have to paginate. Revisit on a **real**
volume signal, together with 0055's own list decisions — [backlog item 3](#technical-tasks-for-the-backlog).

### D-12 — A static `#[Title]`, not a per-customer dynamic one

`#[Title('Customer detail')]` on the class, matching every other component in this repo. A title carrying
the customer's name would put a stored, user-supplied value into the `<title>` element and into browser
history — a small disclosure surface for no operational gain, and the page's own `flux:heading` already
names the customer. Reversible in one line if the product asks.

## Scope fences: what this story must NOT do

- Must **not** add a migration, a column, an index or any schema change. The `orders.customer_id` FK is
  0045's and already exists by the time this runs.
- Must **not** create, edit, cancel, refund or delete an order, or render any control that could — 0048–0052.
- Must **not** read or branch on `payment_status`, `refunded_quantity`, `flagged_for_review`,
  `sales_region_id` or `shipping_rate_id` (0048–0054).
- Must **not** add an order-detail route, an Orders list, an Orders `config/modules.php` entry or any
  `App\Livewire\Orders\**` class — story 0055's.
- Must **not** link an order row anywhere (**D-5**).
- Must **not** add a permission to `RolePermissionSeeder` — `customers.*` and `orders.*` are both seeded.
- Must **not** create `CustomerPolicy` or `OrderPolicy` (**D-1**).
- Must **not** modify `app/Livewire/Customers/Index.php`, `app/Actions/Customers/**`,
  `app/Concerns/CustomerValidationRules.php`, or any 0041/0042/0043 behaviour. The list **view** gains one
  link; the list **component** is untouched.
- Must **not** add a restore/undelete path for a soft-deleted customer (0042 explicitly declined one).
- Must **not** introduce step-up authentication. It applies to no operation here — this screen performs no
  privileged write, and 0044 **D-7** already recorded the same non-application for the Customers module.

## Dependencies, risks and open questions

### Dependencies

| Depends on | State | Verified how |
| --- | --- | --- |
| `customers` table + `App\Models\Customer` | story [0041](0041-customers-crud-backend.md) — **hard dependency** | the relation is declared on that model; the header reads its `name`/`email`/`phone` |
| `customers.deleted_at` (soft delete) | story [0042](0042-customers-soft-delete-backend.md) — **hard dependency** | the 404-for-a-trashed-customer test asserts behaviour that only exists once `SoftDeletes` is on the model |
| The Customers screen: route file, list view, lang files, registry entry | story [0044](0044-customers-list-create-edit-ui.md) — **hard dependency**, and this story **edits three of its files** (**D-6**) | `routes/customers.php`, `resources/views/livewire/customers.blade.php`, `lang/{en,es}/customers.php` |
| `orders` table, `App\Models\Order`, `App\Enums\OrderStatus`, `orders.statuses.*` lang keys | story [0045](0045-orders-core-crud-backend.md) — **hard dependency, itself ⛔ blocked** | every order row column, the status badge label, and the `hasMany` target |
| `orders.view` in the seeded permission catalog | **shipped** (Epic 1) | `RolePermissionSeeder::MODULES` carries `orders`; all four CRUD actions are generated for it |
| `Gate::before` Super Admin bypass | **shipped** (Epic 1) | [authorization.md](../../docs/architecture/authorization.md) |
| The `can:`-gated Livewire route pattern | **shipped** (tasks 0004/0010/0040) | `routes/users.php`, `routes/roles.php` |
| UUID route-model binding | **shipped** (task 0001) | `HasUuids::resolveRouteBindingQuery()` — the malformed-id 404 |

#### ⛔ Blocked — inherited cross-epic dependency

**Phase 3 cannot begin until [0045](0045-orders-core-crud-backend.md) is `done`**, and 0045 is itself
blocked on [0024](0024-products-core-crud-backend.md), [0029](0029-product-variants-backend.md),
[0035](0035-shipping-carriers-backend.md), [0036](0036-shipping-rate-rules-backend.md) and
[0038](0038-payment-methods-bank-transfer-backend.md). The chain is **0047 → 0045 → five Epic 2 stories**.

There is nothing here to stub. An order-history screen with no `orders` table has no rows to render, no
enum to label and no relation to declare — and shipping the route with a placeholder is the empty-detail-
page 0044's OQ-3 explicitly refused. **If 0045 is not `done` when Phase 3 starts, the story is not ready.**

#### What depends on this story

- **Nothing in Epic 3 blocks on it** — this is a leaf story, which is part of why it is safe to specify
  early.
- **`App\Models\Customer::orders()` becomes shared infrastructure.** Every later Orders-adjacent Customer
  view reuses it rather than re-declaring one: a per-customer order count or "last order" column on the
  customers list, a customer-lifetime-value summary, a customer merge/dedupe tool, and story 0055's own
  "orders for this customer" filter if it grows one. Any story adding a second reader should use this
  relation and — per **D-4** — supply its own ordering rather than adding a default to the relation.

### Risks

- **R-1 — The `orders.view` leak is invisible in every happy-path test.** An implementation that gates
  only the view's `@if` (or that forgets the check entirely) renders correctly for the fully-permissioned
  actor every test is written against, and leaks the order book to a customer-support role nobody thought
  to test as. *Mitigation:* the `orders.view`-absent test is specified as a **three-part** assertion —
  header present, section hook absent, **and no `order_number` anywhere in the body** — because the
  section-hook assertion alone passes a view that drops the heading and still emits the rows.
- **R-2 — This story edits a `done` story's files.** *Mitigation:* **D-6** — sequential only, never in
  parallel with 0044; and the list-rendering assertions **extend** 0044's existing test file rather than
  creating a second one that would drift from it.
- **R-3 — This document goes stale while it waits.** It is blocked behind a story that is itself blocked
  behind five, each of which may change during its own Phase 4/5 — precisely the *"a deferred finding is a
  claim about a tree, and the task file freezes while the tree does not"* failure recorded in
  [errors-log.md](../../docs/errors-log.md#a-deferred-storys-findings-were-claims-about-a-tree-that-no-longer-existed-and-one-of-them-would-have-reopened-a-bug-in-this-log--2026-08-23).
  This file quotes 0045's `order_number`, `status`, `total` and `created_at` column shapes, its
  `OrderStatus` case set, and 0044's `data-test` conventions — **all read from task files that are
  themselves still `new`**. *Mitigation:* Phase 2's INVEST review must be **re-run** immediately before
  Phase 3 rather than treated as passed on first reading, and every quoted shape re-verified against the
  shipped code. **This file's identifiers are a reading aid, not a locator.**
- **R-4 — Money compared or rendered as a float.** `decimal(10,2)` casts to a string; `10.00` becomes
  `10` the moment anything casts it. *Mitigation:* **D-9**, plus an explicit string assertion in the
  rendering test.
- **R-5 — `Gate::allows('orders.view')` fails closed on a typo, silently.** A misspelled ability hides the
  section from everybody, and a hidden section is indistinguishable from a correct refusal — the
  fail-closed-and-unwarned hazard
  [authorization.md](../../docs/architecture/authorization.md#the-copyable-module-gate-pattern-and-the-three-alternatives-rejected)
  already records for `can:`. *Mitigation:* a **positive** rendering test beside the negative one, and the
  ability asserted against the seeded catalog rather than typed twice.
- **R-6 — The parameterised route shadowing the index route.** `customers/{customer}` declared before
  `customers` can capture the literal segment under some cache orderings. *Mitigation:* declaration order
  fixed in the spec above, plus a regression test that `GET /customers` still resolves to
  `customers.index`.

### Resolved questions

| Question raised | By | Resolved as |
| --- | --- | --- |
| Detail page or an expanded edit modal? | frontend-expert | **D-2** — a new page and route; 0044's OQ-3 already anticipated it |
| Does the order history need its own ability beyond `customers.view`? | frontend-qa (flagged unresolved) | **D-1** — yes, `orders.view`; section-level, omitted not 403 |
| Does the page show the customer's identity fields? | frontend-expert | **D-3** — yes, a compact read-only name/email/phone header; not the twelve address columns |
| Is a soft-deleted customer's detail route reachable? | frontend-qa (flagged "confirm, don't assume") | **Confirmed 404** — route-model binding resolves through the scoped query (0042's own stated behaviour), and this story pins it with a test rather than inheriting the assumption |
| Where does the "view detail" affordance live? | frontend-expert (gap flagged) | **This story**, as a third row action on 0044's list — **D-6** covers the shared-file constraint |
| What orders the history? | frontend-expert | 0045 **D-6** applied to the relation: `created_at desc, id desc` |
| Where does the ordering live — relation or query? | facilitator | **D-4** — the query; the relation stays unordered |
| Does an order row link to the order detail? | facilitator | **D-5** — no; story 0055's route does not exist and a link to it would be a ghost affordance |
| Is there a `CustomerPolicy` / `OrderPolicy`? | facilitator | **D-1** — neither; 0041 **D-12** and 0045 **D-13** set the precedent |

### Open questions

**OQ-1 — Should the order row also show `payment_status`? Non-blocking; a default is stated.**
0045 defines **two** independent status dimensions (`OrderStatus`, `PaymentStatus`) and this screen renders
only the first, so an order that is `Enviado` but `Pendiente de pago` looks unremarkable here.
**Recommended default: exclude it in this cut *(recommended)*** — the same restraint 0044 **D-6** applied
in showing five of sixteen columns, and the full payment picture is story 0055's detail screen. The
alternative (a second badge per row) is a one-line addition with no schema or contract consequence, so
deferring it is cheap and reversible. Recorded rather than decided silently because "the status badge does
not mean what you think it means" is a real support hazard.

**OQ-2 — Should the identity header link back to the list's edit modal? Non-blocking; a default is stated.**
**Recommended default: no *(recommended)*** — 0044's edit modal is opened by a `wire:click` on a component
this page does not host, so "link to it" means either a query parameter the list component interprets on
mount (new cross-page state, and a second way to open a modal) or a duplicated editor on this page (which
**D-3** just argued against). The "Back to customers" link is sufficient for this cut. Revisit if
administrators report the round trip as friction — it is a UX signal, not an architectural one.

**OQ-3 — Does the *customers list* eventually want an order count or "last order" column? Non-blocking,
backlog.** The `orders()` relation this story adds makes `withCount('orders')` a one-line addition to
0044's list query, and `roles.blade.php` already sets the precedent for a count column. Deliberately not
done here: it changes 0041's **D-15** retrieval contract, which 0044 is required to implement verbatim, so
it is a change to *that* contract rather than a view-only choice. Recorded so a later story knows the
relation is ready for it.

### Technical tasks for the backlog

Derived from this story, none of them in scope:

1. **Link each order row to the order detail screen**, once story 0055 ships `orders.show` (**D-5**). One
   `href` plus one `data-test` hook; the ghost-affordance constraint disappears the moment the route
   exists.
2. **A shared money formatter** (**D-9**), once a second screen renders a currency value — 0055 will be
   the second. Until then, one `€` prefix in one Blade file is not a helper.
3. **Pagination on both order lists** (**D-11**), driven by a real volume signal and decided together with
   story 0055's list, so the two do not diverge.
4. **An order-count / last-order column on the customers list** (**OQ-3**), which requires amending 0041's
   **D-15** retrieval contract first.
5. **`payment_status` on the order row** (**OQ-1**), if support reports the single badge as misleading.

## Provenance

- **PRD source:** [§3.1 Customers](../../docs/PRD/PRD.md#31-customers) — the *"View a customer's order
  history"* scenario is adapted above as this story's main case and split into three single-`When`
  scenarios (the history renders, it is ordered, a row shows its fields), per the single-action rule. The
  §3.1 acceptance criterion *"a customer record … shows a read-only order-history view"* is the one this
  story satisfies; the create, duplicate-email, soft-delete and notification criteria belong to 0041–0044.
  The Epic 3 preamble's *"same list + detail/editor visual patterns established in Users and Products …
  a detail/editor view"* is what **D-3** cites for a fuller detail page.
- **Process:** [workflow.md](../../docs/workflow.md) Phase 1 — Three Amigos debate. Contributions from
  `frontend-expert` (the new-route-vs-modal scope decision with its justification, the route/component/view
  shape, the column set and ordering, the `Customer::orders()` relation, and the missing-link gap on
  0044's list) and `frontend-qa` (the test set, the markup-level read-only assertion and why "no visible
  button" is insufficient given this repo's disabled-but-present row-action pattern, the authorization
  question flagged as explicitly unresolved, and the soft-delete route behaviour flagged as "confirm,
  don't assume"). Composed by `product-owner` as facilitator. `database-expert` was **not** convened —
  this story adds no schema, migration, index or query design.
- **Decisions resolved by the facilitator:** **D-1** resolves `frontend-qa`'s escalated authorization
  question, adopting the two-ability rule with the cited task-0015 disclosure-gate precedent and
  specifying the omit-the-section-not-403 consequence; **D-3** resolves `frontend-expert`'s first open
  question in favour of a compact header, with the PRD line as support; **D-2** and **D-5** adopt
  `frontend-expert`'s stated recommendations with the reasoning recorded; **D-4**, **D-6** through
  **D-12** resolve shape and ordering questions the contributions raised but did not settle. The
  soft-deleted-customer question is resolved as *confirmed*, with a test replacing the assumption.
- **Gherkin conventions:** every scenario opens with a named business-role actor and carries exactly one
  `When`, per [gherkin-guidelines.md](../../docs/testing/frontend/gherkin-guidelines.md) rules 1 and 3 —
  mandatory across all Gherkin in this project, per the incident recorded in
  [errors-log.md](../../docs/errors-log.md).
- **Stage:** `new`. Moves to `ai-spec/tasks/in-progress/` at the start of Phase 3 and to
  `ai-spec/tasks/done/` at Phase 7 — the first move changes this file's directory depth, so every relative
  link above must be re-resolved on each move, in **both** directions, per
  [workflow.md](../../docs/workflow.md#link-integrity-check-on-every-stage-move).
- **Epic 3 decomposition:** story 7 of 15. Hard dependencies on 0041, 0042, 0044 and 0045; ⛔ blocked
  transitively through 0045 on Epic 2 stories 0024, 0029, 0035, 0036 and 0038. Referenced by number only,
  their files not yet existing: 0046 (new-order notification), 0048–0054 (status/refund/tax), 0055 (Orders
  list and detail UI).
