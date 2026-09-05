# [0055] Orders list + detail/editor UI

## Description
Build the Orders screens of PRD [§3.2 Orders](../../docs/PRD/PRD.md#32-orders): a permission-gated
`orders.index` list route, an `orders.show` detail route, the two Livewire components behind them, their
Blade/Flux views, and the `config/modules.php` sidebar entry without which the module is unreachable.
The detail screen is the **single consumer surface** for every write stories
[0048](0048-order-line-item-editing-backend.md)–[0052](0052-order-auto-cancel-full-refund-backend.md)
built — line-item editing, status transitions, manual cancellation, refunds — and the only place
[0053](0053-order-tax-region-resolution-physical-backend.md)/[0054](0054-order-tax-region-resolution-virtual-backend.md)'s
resolved tax basis and `flagged_for_review` flag become visible to a human. It adds **no backend rule**:
every control mirrors a predicate its own guard already reads.

> ## ⛔ BLOCKED — inherited cross-epic dependency (read this before Phase 3)
>
> **This story is fully specified now, but its Phase 3 implementation cannot start until every Orders
> backend story is `done`:** [0045](0045-orders-core-crud-backend.md),
> [0048](0048-order-line-item-editing-backend.md), [0049](0049-order-status-transition-backend.md),
> [0050](0050-order-manual-cancellation-backend.md),
> [0051](0051-order-payment-refund-state-backend.md),
> [0052](0052-order-auto-cancel-full-refund-backend.md),
> [0053](0053-order-tax-region-resolution-physical-backend.md) and
> [0054](0054-order-tax-region-resolution-virtual-backend.md) — **and 0045 is itself ⛔ blocked** on five
> PRD Epic 2 stories ([0024](done/0024-products-core-crud-backend.md),
> [0029](done/0029-product-variants-backend.md), [0035](0035-shipping-carriers-backend.md),
> [0036](0036-shipping-rate-rules-backend.md), [0038](0038-payment-methods-bank-transfer-backend.md)).
>
> **The chain is three links long, so state it once and check all three:** 0055 → {0045, 0048–0054} →
> 0045 → {0024, 0029, 0035, 0036, 0038}. There is nothing here that can be stubbed to proceed: a screen
> whose every control calls an action that does not exist is not a partial delivery, it is a mock.
>
> **What is *not* blocked:** this document. See [R-8](#risks) for why specifying it now is deliberate,
> and for the re-verification Phase 3 owes it — this file quotes **eight** sibling task files, every one
> of which is itself still `new`.

> ## ⚠️ This story has a **soft** dependency on a PENDING Epic 2 story, and ships an interim around it
>
> `AddOrderItem` needs a product/variant picker, and **nothing in this repo builds one yet.** The
> natural fit is Epic 2's [0022](done/0022-searchable-multi-select-component.md) (shared searchable,
> server-side-filtered multi-select), which is `new` and **has no committed timeline within this Epic 3
> decomposition**. This story therefore ships a **documented, intentional stopgap** — a plain
> `<flux:select>` over a bounded product query — rather than blocking on it. See **[D-1](#d-1)**, which
> records the exact acceptance-criterion wording that must change when 0022 lands, so the swap is a
> scheduled edit rather than a rediscovery.

## Type
frontend | includes database-expert: **no**

`database-expert` was **not convened**: this story adds no migration, no column, no index, no relation
and no query design. Its two `#[Computed]` queries implement retrieval contracts stories 0045
(**D-6**, **D-14**) already specified and pinned with their own tests; this story pins them a second
time at the component layer, which is what 0045's **D-6** asked for.

### Why this is one story

Four deliverables land here and none is separable from the others:

1. **The list route + component + view** — the module's entry point.
2. **The detail route + component + view** — **not a modal.** An order's detail is line items plus two
   status dimensions plus refunds plus a tax panel: unbounded and list-shaped, exactly the reasoning
   [0047](0047-customer-order-history-view-ui.md)'s **D-2** applied to an order *history*, applying with
   more force to an order *editor*.
3. **The `config/modules.php` entry + `lang/{en,es}/navigation.php` leaf** — a gated module route
   without its registry entry is a screen nothing links to
   ([routes.md](../../docs/api/routes.md#app-owned-routes)), which is the same half-delivery 0044 and
   0047 both refused.
4. **The screen copy in `lang/{en,es}/orders.php`** — 0045 created that file with two status groups and
   0049/0050/0054 appended three more; **every one of those stories deferred screen copy to this one by
   name.**

Splitting the list from the detail would ship a list whose rows link nowhere (0047's ghost-affordance
rule) or a detail page nothing reaches. Splitting the registry entry out would ship an unreachable
module.

## Three Amigos participants

- `frontend-expert` — the two-route/two-component split and why the detail is a page rather than a
  modal, the route file and its ordering constraint, both components' public surfaces, the list column
  set, the detail's five sections, the per-control UI-hint derivation for three *distinct* abilities,
  and the two open questions resolved below as **D-1** and **D-2**.
- `frontend-qa` — the test set across eight groups, the hard-block "no confirmation escape hatch"
  assertion, the refund **DOM-absence** case (a literal PRD acceptance criterion, distinct from
  disabled), the cross-dimension cancellation dataset, the per-control authorization dataset, the
  Super-Admin false-negative warning, and the browser-test **file-splitting** recommendation adopted as
  **D-3**.
- `database-expert` — **not convened** (see above).

## Gherkin

```gherkin
Feature: Orders list and detail/editor screens

  # --- Reaching the module ---

  Scenario: An order administrator sees the Orders entry in the sidebar
    Given an order administrator whose role grants the orders view permission
    When they look at the sidebar navigation
    Then an Orders entry is offered

  Scenario: An administrator without the orders view permission sees no Orders entry
    Given a signed-in administrator whose role grants neither the orders view permission nor a bypass
    When they look at the sidebar navigation
    Then no Orders entry is offered

  Scenario: An administrator without the orders view permission cannot open the list
    Given a signed-in administrator whose role grants neither the orders view permission nor a bypass
    When they open the orders list
    Then access is refused

  Scenario: A signed-out visitor cannot open the orders list
    Given a signed-out visitor
    When they open the orders list
    Then they are redirected to the sign-in screen

  # --- The list ---

  Scenario: An order administrator sees the order book newest first
    Given an order administrator whose role grants the orders view permission, with three orders placed on different dates
    When they open the orders list
    Then the most recently placed order is listed first

  Scenario: An order row shows its reference, customer, statuses and total
    Given an order administrator whose role grants the orders view permission, with one existing order
    When they open the orders list
    Then the row shows the order number, the customer's name, the fulfilment status, the payment status, the total and the date placed

  Scenario: An empty order book shows an explicit empty state
    Given an order administrator whose role grants the orders view permission, with no orders recorded
    When they open the orders list
    Then they see a message stating that no orders have been recorded

  Scenario: An order flagged for manual review is marked as needing attention
    Given an order administrator whose role grants the orders view permission, with an order flagged for manual review
    When they open the orders list
    Then that row carries a needs-attention marker

  Scenario: The needs-attention marker explains why the order was flagged
    Given an order administrator whose role grants the orders view permission, with an order flagged because its billing country contradicts its captured location
    When they inspect that row's needs-attention marker
    Then the recorded reason for the flag is offered alongside it

  Scenario: An order administrator opens an order's detail from the list
    Given an order administrator whose role grants the orders view permission, with one existing order
    When they activate that row's detail action
    Then that order's detail view is shown

  # --- The detail: customer summary ---

  Scenario: The detail view names the customer the order belongs to
    Given an order administrator whose role grants the orders view permission, with an existing order
    When they open that order's detail view
    Then they see the customer's name and the address the order was shipped to as it stood at order time

  Scenario: The customer summary links to the customer's own record
    Given an order administrator whose role grants the orders and customers view permissions, with an existing order
    When they activate the customer link on that order's detail view
    Then that customer's detail view is shown

  # --- The detail: line items ---

  Scenario: The detail view lists the order's line items
    Given an order administrator whose role grants the orders view permission, with an order carrying three line items
    When they open that order's detail view
    Then all three line items are listed with their quantity, unit price and line total

  Scenario: An order administrator adds a line item to a pending order
    Given an order administrator whose role grants the orders edit permission, with an order in "Pendiente"
    When they add a line item for an existing product
    Then the order's line items and totals are shown updated

  Scenario: An order administrator removes a line item from a pending order
    Given an order administrator whose role grants the orders edit permission, with an order in "Pendiente" carrying two line items
    When they remove one of those line items
    Then the order's remaining line item and updated totals are shown

  Scenario: An order administrator changes a line item's quantity
    Given an order administrator whose role grants the orders edit permission, with an order in "Procesando" carrying a line item
    When they change that line item's quantity
    Then the line item and the order's totals are shown updated

  Scenario: Removing an order's last remaining line item is refused on screen
    Given an order administrator whose role grants the orders edit permission, with an order in "Pendiente" carrying exactly one line item
    When they attempt to remove that line item
    Then the refusal is shown against the line items and the item remains listed

  Scenario: Every line-item control is unavailable on a shipped order
    Given an order administrator whose role grants the orders edit permission, with an order in "Enviado"
    When they open that order's detail view
    Then no line item can be added, removed or re-quantified

  Scenario: A shipped order offers no way to confirm past the line-item block
    Given an order administrator whose role grants the orders edit permission, with an order in "Enviado"
    When they inspect the line-item section
    Then no confirmation control of any kind is offered against the unavailable line-item actions

  Scenario: An administrator without the orders edit permission cannot edit line items
    Given a signed-in administrator whose role grants the orders view permission but not the orders edit permission, with an order in "Pendiente"
    When they open that order's detail view
    Then no line item can be added, removed or re-quantified

  # --- The detail: status transitions ---

  Scenario: An order administrator advances an order to the next status
    Given an order administrator whose role grants the orders edit permission, with an order in "Pendiente"
    When they change its status to "Procesando"
    Then the order is shown in "Procesando"

  Scenario: Advancing an order asks for no confirmation
    Given an order administrator whose role grants the orders edit permission, with an order in "Pendiente"
    When they change its status to "Procesando"
    Then the change is applied without any confirmation being requested

  Scenario: Moving an order's status backward asks for confirmation first
    Given an order administrator whose role grants the orders edit permission, with an order in "Enviado"
    When they choose to move its status back to "Pendiente"
    Then a confirmation is requested before the change is applied

  Scenario: Confirming a backward move applies it
    Given an order administrator whose role grants the orders edit permission, who has been asked to confirm moving an order back to "Pendiente"
    When they confirm the move
    Then the order is shown in "Pendiente"

  Scenario: Dismissing the backward-move confirmation leaves the order alone
    Given an order administrator whose role grants the orders edit permission, who has been asked to confirm moving an order back to "Pendiente"
    When they dismiss the confirmation
    Then the order is still shown in "Enviado"

  Scenario: Cancellation is not offered as a status choice
    Given an order administrator whose role grants the orders edit permission, with an order in "Procesando"
    When they inspect the status choices
    Then "Cancelado" is not among them

  Scenario: A cancelled order offers no status change at all
    Given an order administrator whose role grants the orders edit permission, with an order in "Cancelado"
    When they open that order's detail view
    Then no status change can be made

  # --- The detail: manual cancellation ---

  Scenario: An order administrator cancels an order that is still pending
    Given an order administrator whose role grants the orders edit permission, with an order in "Pendiente"
    When they cancel that order
    Then the order is shown in "Cancelado"

  Scenario: Cancelling is unavailable on a shipped order
    Given an order administrator whose role grants the orders edit permission, with an order in "Enviado"
    When they open that order's detail view
    Then the order cannot be cancelled

  Scenario: Cancelling is unavailable on a partially refunded order
    Given an order administrator whose role grants the orders edit permission, with an order in "Procesando" whose payment state is "Parcialmente reembolsado"
    When they open that order's detail view
    Then the order cannot be cancelled

  Scenario: An administrator without the orders edit permission cannot cancel an order
    Given a signed-in administrator whose role grants the orders view permission but not the orders edit permission, with an order in "Pendiente"
    When they open that order's detail view
    Then the order cannot be cancelled

  # --- The detail: refunds ---

  Scenario: An order administrator records a refund against a paid order
    Given an order administrator whose role grants the orders refund permission, with a paid order carrying a line item for three units
    When they record a refund of two of those units
    Then the order is shown as partially refunded with its refunded total updated

  Scenario: No refund control is offered while an order is awaiting payment
    Given an order administrator whose role grants the orders refund permission, with an order whose payment is still pending
    When they open that order's detail view
    Then no refund control is present on the page

  Scenario: No refund control is offered once an order is fully refunded
    Given an order administrator whose role grants the orders refund permission, with an order that is already fully refunded
    When they open that order's detail view
    Then no refund control is present on the page

  Scenario: An administrator without the orders refund permission cannot record a refund
    Given a signed-in administrator whose role grants the orders edit permission but not the orders refund permission, with a paid order
    When they open that order's detail view
    Then no refund can be recorded

  Scenario: An administrator without the orders edit permission can still record a refund
    Given a signed-in administrator whose role grants the orders refund permission but not the orders edit permission, with a paid order
    When they record a refund against that order
    Then the refund is applied

  # --- The detail: tax and region ---

  Scenario: A resolved order shows the region and rate its tax was based on
    Given an order administrator whose role grants the orders view permission, with an order resolved to a rated Sales Region
    When they open that order's detail view
    Then the resolved region and the rate recorded against the order are shown

  Scenario: An order flagged for review shows the reason instead of a confident tax basis
    Given an order administrator whose role grants the orders view permission, with an order flagged for manual review
    When they open that order's detail view
    Then a notice explaining why the order was flagged is shown in place of a resolved tax basis

  Scenario: An unresolved order does not present a rate it does not have
    Given an order administrator whose role grants the orders view permission, with an order whose Sales Region has never been resolved
    When they open that order's detail view
    Then the tax basis is shown as not yet resolved rather than as a zero rate

  # --- Detail access ---

  Scenario: An administrator without the orders view permission cannot open an order's detail
    Given a signed-in administrator whose role grants neither the orders view permission nor a bypass
    When they open an order's detail view
    Then access is refused

  Scenario: An unknown order reference is reported as not found
    Given an order administrator whose role grants the orders view permission
    When they open a detail view for an order reference that does not exist
    Then the record is reported as not found
```

## Files to create/modify

### Route — `routes/orders.php` (**new**) + one `require` line in `routes/web.php`

A new per-area route file, `require`d from `web.php` exactly the way `users.php`, `roles.php` and
`customers.php` are
([base-standards.md](../../docs/conventions/base-standards.md#directory-structure)):

```php
<?php

use App\Livewire\Orders\Index as OrdersIndex;
use App\Livewire\Orders\Show as OrdersShow;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    // `can:orders.view`, not Spatie's `permission:` — Livewire 4's
    // PersistentMiddleware allowlist carries Laravel's `Authorize` (`can:`)
    // but not Spatie's `PermissionMiddleware`, so a `permission:`-gated route
    // would protect the initial GET only, leaving every addLineItem() /
    // transitionStatus() / cancel() / recordRefund() /livewire/update
    // round-trip unauthorized. See docs/architecture/authorization.md.
    Route::livewire('orders', OrdersIndex::class)
        ->middleware(['can:orders.view'])
        ->name('orders.index');

    // `can:orders.view` only. Editing line items, transitioning status and
    // cancelling additionally require `orders.edit`; recording a refund
    // requires `orders.refund`. All three are per-control checks that live in
    // the component and in the actions behind it — a second `can:` here would
    // 403 the whole page, denying read access this actor's `orders.view`
    // grants. See D-5.
    Route::livewire('orders/{order}', OrdersShow::class)
        ->middleware(['can:orders.view'])
        ->name('orders.show');
});
```

- **Exactly one ability on each route gate: `orders.view`** (**D-5**). This mirrors 0047's **D-1**
  exactly — a page whose primary content one ability grants must not be 403'd for a *second* ability
  that governs only some of its controls.
- **`orders/{order}` is declared AFTER `orders`**, per 0047's route-ordering note: a parameterised route
  declared first can capture the literal segment under some route-cache orderings. A test pins that
  `GET /orders` still resolves to `orders.index`.
- **Route-model binding on `{order}`**, not a raw string id. `Order` is UUID-keyed via `HasUuids`, whose
  `resolveRouteBindingQuery()` validates the segment with `Str::isUuid()` first — so a malformed
  parameter is a **404 without a query**
  ([base-standards.md](../../docs/conventions/base-standards.md#uuid-primary-keys)). `Order` has **no**
  `SoftDeletes` (0045), so there is no trashed-row binding case to test here, unlike 0047's.
- **No permission catalog change.** `orders.view/create/edit/delete` are seeded by
  `RolePermissionSeeder::MODULES` and `orders.refund` is seeded by 0051's `ORDER_PERMISSIONS`. This
  story adds none and reseeds nothing.
- ⚠️ **Do not plan a `verified`-middleware test.** `App\Models\User` does not implement `MustVerifyEmail`,
  so `verified` refuses nobody on any route in this app; a test asserting it carries no signal
  ([errors-log.md](../../docs/errors-log.md#a-planned-test-asserted-a-refusal-by-verified-a-middleware-that-refuses-nobody-in-this-app--2026-08-20)).

### Component — `app/Livewire/Orders/Index.php` (**new**)

Class-based, `#[Title]` on the class
([base-standards.md](../../docs/conventions/base-standards.md#livewire-component-convention-class-based-not-single-file)).

| Member | Shape | Notes |
| --- | --- | --- |
| `mount()` | `void` | `Gate::authorize('orders.view')` as its first statement |
| `orders()` | `#[Computed]` | 0045 **D-6**'s list contract, implemented at the component layer |
| `ordersSummary()` | `#[Computed]` | `trans_choice('orders.index.summary', …)` |

- **No public method mutates anything.** The list is read-only: every write lives on the detail screen.
  Asserted by a reflection test, per 0047's precedent.
- **`orders()` implements 0045 **D-6** verbatim** — `Order::query()->with('customer')
  ->orderByDesc('created_at')->orderByDesc('id')->get()`, mapped to a row array. The `id` tie-break is
  not decoration: UUID v7 is time-ordered, so orders sharing a `created_at` second still sort
  deterministically and the ordering test is not flaky by construction.
- **`with('customer')` only — *not* 0045's **D-14** detail contract** (**D-6**). Nothing on a list row
  comes from `items`, `paymentMethod`, `salesRegion` or `shippingRate`; eager-loading five relations per
  row for zero rendered output is the per-row cost 0047's **D-8** already refused.
- **Row shape** (`array<int, array{…}>`, PHPDoc'd per
  [code-style.md](../../docs/conventions/code-style.md#phpdoc-array-shapes-over-inline-comments)):
  `{id, orderNumber, customerId, customerName, status, statusLabel, paymentStatus, paymentStatusLabel,
  total, createdAt, isFlagged, flagReasonLabel}`.
- **`total` is the stored decimal string, never cast** (**D-7**).

### Component — `app/Livewire/Orders/Show.php` (**new**)

This is the story's largest surface, and it is a page rather than a modal for the reason 0047's **D-2**
established and this screen amplifies: line items are unbounded, and the page additionally carries two
status dimensions, a cancellation control, a refund control and a tax panel.

| Member | Shape | Notes |
| --- | --- | --- |
| `mount(Order $order)` | `void` | `Gate::authorize('orders.view')` first, then `$this->orderId = $order->id` |
| `$orderId` | `#[Locked] public string` | **server-authoritative** — the client may never re-point the component at another order over `/livewire/update`, which the route gate would not re-evaluate |
| `$newProductId`, `$newProductVariantId`, `$newQuantity` | `public string` / `public string` / `public int` | the add-line-item form's bound fields (**D-1**) |
| `$editingQuantities` | `public array<string, int>` | per-line-item quantity inputs, keyed by line-item id |
| `$refundQuantities` | `public array<string, int>` | per-line-item refund inputs, keyed by line-item id |
| `$selectedStatus` | `public string` | the status select's bound value — a **backing value**, never a typed enum (**D-8**) |
| `$showBackwardConfirm`, `$showCancelConfirm`, `$showRefundModal` | `public bool` | dialog state |
| `$pendingStatus` | `#[Locked] public string` | the status a pending backward confirmation would apply |
| `order()` | `#[Computed]` | 0045 **D-14**'s detail contract, implemented verbatim |
| `lineItems()` | `#[Computed]` | the rendered line-item rows |
| `canEditLineItems()` | `#[Computed] bool` | **the fourth call site** — see **D-4** |
| `canTransitionStatus()` | `#[Computed] bool` | `Gate::allows('transitionStatus', $this->order())` |
| `canCancel()` | `#[Computed] bool` | `Gate::allows('cancel', $this->order())` (**D-9**) |
| `canRefund()` | `#[Computed] bool` | `Gate::allows('orders.refund')` — **a distinct ability** (**D-5**) |
| `isRefundable()` | `#[Computed] bool` | `payment_status ∈ {Paid, PartiallyRefunded}` — the **state** half, separate from the permission half (**D-10**) |
| `statusOptions()` | `#[Computed]` | the offered transitions (**D-8**) |
| `isBackwardTransition(string $target)` | `bool` | wraps `OrderStatus::from($target)->isBackwardFrom($this->order()->status)` (**D-11**) |
| `productOptions()` | `#[Computed]` | the interim product picker's options (**D-1**) |
| `variantOptions()` | `#[Computed]` | variants of the currently-selected product (**D-1**) |

Action methods, each `Gate::authorize()`-ing first and each delegating to the action that owns the rule:

| Method | Delegates to | Story |
| --- | --- | --- |
| `addLineItem(AddOrderItem $addOrderItem)` | `AddOrderItem` | 0048 |
| `removeLineItem(string $itemId, RemoveOrderItem $removeOrderItem)` | `RemoveOrderItem` | 0048 |
| `updateLineItemQuantity(string $itemId, UpdateOrderItemQuantity $update)` | `UpdateOrderItemQuantity` | 0048 |
| `requestStatusChange()` | — (opens the confirmation, or calls straight through) | **D-11** |
| `applyStatusChange(TransitionOrderStatus $transition)` | `TransitionOrderStatus` | 0049 |
| `confirmCancel()` / `cancelOrder(CancelOrder $cancelOrder)` | `CancelOrder` | 0050 |
| `openRefundModal()` / `recordRefund(RecordRefund $recordRefund)` | `RecordRefund` | 0051 |

- **Actions are method-injected**, per
  [code-style.md](../../docs/conventions/code-style.md#inject-single-purpose-actions-per-method) — these
  are Livewire action methods with no external contract, which is the rule's unmodified case.
- **Every mutating *and every disclosing* method authorizes as its first statement**, including
  `openRefundModal()` and `confirmCancel()`, which only open a dialog. That is the shipped rule
  ([livewire-authorization.md](../../docs/security/livewire-authorization.md)), and the reason task 0015
  had to retrofit it onto the Users screen.
- **The component re-authorizes; it does not re-derive.** No `in_array($order->status, [...])`, no
  payment-state comparison written a second time, no rank arithmetic. Every hint reads the **same**
  predicate its guard throws from — `Order::isManuallyCancellable()`, `OrderStatus::isBackwardFrom()`,
  `OrderPolicy::cancel()`/`::transitionStatus()`. This is the rule
  [authorization.md](../../docs/architecture/authorization.md#gateallows-in-a-list-query-is-a-ui-hint-not-a-layer)
  states and that 0049 **D-2**, 0050's predicate and 0048 **D-5** each built a predicate for
  specifically so this screen would not have to.
- **Domain refusals are caught and rendered, never allowed to 500 the page** (**D-12**).

### View — `resources/views/livewire/orders.blade.php` (**new** — the list)

**The *flat* path**, per the [`Index`-in-a-subfolder exception](../../docs/conventions/naming.md#exception-a-component-named-index-resolves-to-its-parent-folders-name):
`App\Livewire\Orders\Index` resolves to `livewire/orders.blade.php`, **not** `livewire/orders/index.blade.php`.
**Resolve the path by running the component, not by reasoning about it** — stories 0010 and 0011 both
wrote the wrong path into their own Phase 1 specs and found out at first render.

Structure: a header with `ordersSummary()`; a `flux:table` with **seven** columns; an explicit empty
state (`orders.index.empty`); no create button (**D-13**).

| Column | Content |
| --- | --- |
| Order | `orderNumber`, plus the needs-attention marker (below) |
| Customer | `customerName`, linked to `route('customers.show', $customerId)` (**D-14**) |
| Status | `flux:badge` coloured per `OrderStatus`, labelled `statusLabel` |
| Payment | `flux:badge` coloured per `PaymentStatus`, labelled `paymentStatusLabel` |
| Total | `<x-money :amount="$order['total']" />` (**D-7**) |
| Placed | `createdAt` |
| — | the row's detail action |

- **The needs-attention marker is not a column.** It is an inline `flux:icon` + `flux:tooltip` beside the
  order number, carrying `data-test="order-flagged-{id}"`, whose tooltip content is `flagReasonLabel`.
  An eighth column that is empty on almost every row is worse than a marker on the rows that have one.
- ⚠️ **Its copy must read "needs attention", never "error" or "invalid"** (**D-15**). 0053's **D-6**
  states the consequence plainly: *on a freshly seeded catalog, every order shipping outside Spain is
  flagged*, because `SalesRegionSeeder` activates only `es` and its five territories. That is correct
  behaviour, and copy implying a fault would train administrators to dismiss the one signal the tax
  chain has.
- **The detail action is a plain `<a>` / `flux:button :href`, not a `wire:click`** — a navigation, not a
  component action, so it needs no `@js()` and no server round-trip. It carries an `aria-label` and
  `data-test="view-order-{id}"`, and it **renders enabled for every actor who can see the list at all**,
  since the target route gates on the same `orders.view` that rendered the row (0047's identical
  reasoning for its own detail link).

### View — `resources/views/livewire/orders/show.blade.php` (**new** — the detail)

**The nested path, and this is *not* the `Index` exception.** `App\Livewire\Orders\Show` follows the
normal component ↔ view mirror. Its sibling `Index` resolves flat; the two live at different depths, which
[naming.md](../../docs/conventions/naming.md#exception-a-component-named-index-resolves-to-its-parent-folders-name)
records as expected rather than a mistake — and which 0047 already shipped once for `Customers`.

Five sections:

**1. Header** — a "Back to orders" link, the `order_number` as `flux:heading`, both status badges, and —
when `flagged_for_review` — a `flux:callout` carrying `flag_reason`'s label
(`data-test="order-flag-callout"`).

**2. Customer summary** — read-only, plain text (`flux:text`/`flux:subheading`), never a disabled
`flux:input`. The customer's name linked to `route('customers.show', …)`, plus the order's **own frozen**
shipping address (0045 **D-4**). **No editable address block and no billing/shipping form** — the
addresses are a historical snapshot this screen may not change, and 0047's **D-3** restraint applies
unchanged.

**3. Line items** — a `flux:table` of `{product_name, product_sku, quantity, unit_price, line_total,
refunded_quantity}` plus, when `canEditLineItems()`, a per-row quantity input with a save control and a
remove control, and an add-line-item row beneath (**D-1**).

**4. Status & lifecycle** — the status `flux:select` (**D-8**), the "Apply" control, and the Cancel
control (**D-9**).

**5. Totals & tax** — `subtotal`, `tax_amount`, `shipping_amount`, `total`, `refunded_amount`, each
through `<x-money>`; and the tax-basis block: the resolved `salesRegion->name` plus `tax_rate` rendered
as a percentage **string** with no arithmetic (**D-7**), **or** — when `flagged_for_review` — the flag
callout in its place, **or** — when `sales_region_id` is `null` and the order is not flagged — an
explicit "not yet resolved" state that is **distinguishable from a 0% rate** (**D-16**). The refund
control lives here, beside `refunded_amount` (**D-10**).

Markup rules inherited rather than invented:

1. **`@js(...)` around every `wire:click` argument.** This screen passes line-item ids into `wire:click`
   on three controls, so the rule is live here rather than theoretical
   ([blade-livewire-output-encoding.md](../../docs/security/blade-livewire-output-encoding.md)).
2. **An explicit `<flux:tooltip>` wrapper on the disabled branch, never a conditionally-bound `:tooltip`
   prop** — under `livewire/blaze` a Flux prop that decides whether a wrapper renders counts as *present*
   whenever the attribute is written on the tag at all
   ([errors-log.md](../../docs/errors-log.md#a-conditionally-bound-fluxbutton-tooltip-prop-rendered-an-empty-tooltip-on-every-enabled-row)).
3. **`cursor-not-allowed!` on that wrapper, not on the button** — Flux's own
   `disabled:pointer-events-none` takes a disabled button out of hit-testing
   ([errors-log.md](../../docs/errors-log.md#disabledcursor-not-allowed-on-a-flux-button-was-never-the-cursor-the-user-saw)).
   Do not "simplify" either back into the obvious form.
4. **Every `wire:model`-bound property has a real non-`null` value in the type the DOM expects** — the
   status select binds a `string` backing value and never a nullable enum
   ([errors-log-archive.md](../../docs/errors-log-archive.md#a-null-livewire-property-bound-to-a-native-select-silently-dropped-the-users-own-pick--2026-08-16)),
   which is **D-8**.
5. **`data-test` hooks on *both* branches of every gated control**, so a browser test selects the same
   way regardless of whether it is enabled.

### Component — `resources/views/components/confirm-dialog.blade.php` (**new**, anonymous) — **D-2**

A small **anonymous** Blade component (this repo has no `app/View/Components/` and every component in it
is anonymous — [base-standards.md](../../docs/conventions/base-standards.md#directory-structure)),
wrapping a `flux:modal` with a heading, a body, a dismiss control and a confirm control:

```blade
<x-confirm-dialog
    :show="$showBackwardConfirm"
    :heading="__('orders.transitions.confirm_backward_heading')"
    :body="__('orders.transitions.confirm_backward_body')"
    :confirm-label="__('orders.transitions.confirm_backward_action')"
    confirm-action="applyStatusChange"
    dismiss-action="dismissBackwardConfirm"
    test-prefix="backward-transition"
/>
```

Its rationale, its distinction from the Users/Roles bespoke delete modals, and the judgment call it
represents are **[D-2](#d-2)**.

### Sidebar registry — `config/modules.php` (**modify**) + `lang/{en,es}/navigation.php` (**modify**)

**One appended entry, no component edit** — the registry pattern
([authorization.md](../../docs/architecture/authorization.md#the-second-half-of-a-module-gate-the-sidebar-registry)):

```php
// config/modules.php — items
'orders' => [
    'group' => 'platform',
    'label' => 'navigation.items.orders',
    'icon' => 'shopping-bag',
    'route' => 'orders.index',
    'current_when' => 'orders.*',
    'permissions' => ['orders.view'],   // exactly the routes' own can: ability
],
```

- **`group: 'platform'`** — Orders is a top-level operational module like Users and Customers, not store
  configuration.
- **`current_when: 'orders.*'`** covers **both** routes, so the sidebar entry stays highlighted on the
  detail page with no second entry — the same property 0044's entry gave 0047 for free.
- **`permissions` must set-equal the routes' `can:` middleware.**
  `tests/Feature/Navigation/SidebarModuleGatingTest.php` asserts that mechanically for every entry, so
  the two halves cannot drift. Note that suite iterates registry **items** and resolves each entry's own
  `route` key — it never enumerates routes — so a *second* route under `orders.*` is outside its scope,
  exactly as 0047 verified for `customers.*`. **Verify that against the shipped test rather than
  assuming it.**
- **No closures, no literal copy** — `label` is a translation key, because `config:cache` serialises with
  `var_export()` and an English string in `config/` is unreachable from `lang/es/`
  ([base-standards.md](../../docs/conventions/base-standards.md#an-app-owned-config-file-is-a-registry-and-must-survive-configcache)).
- `lang/{en,es}/navigation.php` each gain **exactly one leaf**, `items.orders`, mirroring the registry
  key — which is simultaneously the config key, the translation leaf and the rendered
  `data-test="sidebar-link-orders"` hook
  ([naming.md](../../docs/conventions/naming.md#translation-keys)).

### Translations — `lang/en/orders.php` + `lang/es/orders.php` (**modify**)

This story adds the **screen copy** every Orders backend story deferred to it by name. It **appends key
groups** and renames none: `statuses` / `payment_statuses` (0045), `transitions` (0049), `cancellation`
(0050) and `flag_reasons` (0054) are all consumed as shipped.

```php
'index' => [
    'summary' => ':count order|:count orders',   // trans_choice, never a PHP ternary
    'empty' => '…',
    'flagged' => '…',                            // the needs-attention marker's label (D-15)
    'flagged_generic' => '…',                    // when flag_reason is NULL (D-15)
],
'detail' => [
    'back_to_list' => '…',
    'customer_heading' => '…', 'line_items_heading' => '…', 'lifecycle_heading' => '…',
    'totals_heading' => '…', 'tax_heading' => '…',
    'tax_unresolved' => '…',                     // distinct from a 0% rate (D-16)
    'action_not_allowed' => '…',                 // the shared disabled-control tooltip
],
'line_items' => ['add' => '…', 'remove' => '…', 'save_quantity' => '…', 'product' => '…', 'variant' => '…', 'quantity' => '…'],
'refund' => ['action' => '…', 'modal_title' => '…', 'units_to_refund' => '…', 'confirm' => '…'],
```

- **A count-dependent message is one key with a `|`-delimited plural, resolved with `trans_choice()`** —
  never a PHP ternary and **never inline in the Blade file**, where `lang/es/` cannot reach it. The
  giveaway is a `|` outside `lang/` ([naming.md](../../docs/conventions/naming.md#translation-keys), and
  the finding that made 0011 restate it).
- Both locale files ship in the same change, key-for-key identical.

### Explicitly **not** touched by this story

- `database/migrations/**` — no column, no index, no migration of any kind.
- `app/Models/**`, `app/Enums/**`, `app/Policies/OrderPolicy.php`, `app/Exceptions/**` — **read, never
  modified.** In particular this story adds **no** `OrderPolicy` ability: every control maps to an
  ability 0049/0050 already shipped, or to a raw `orders.refund` check 0051 already shipped.
- `app/Actions/Orders/**` — **called, never modified.** If this screen finds itself needing a rule an
  action does not already enforce, the rule belongs in that action and the story comes back to Phase 1.
- `app/Actions/Products/**`, `app/Actions/Customers/**` — untouched.
- `database/seeders/RolePermissionSeeder.php` — no permission is added; the catalog is byte-identical.
- `app/Notifications/**`, `app/Listeners/**`, `app/Events/**` — nothing is dispatched or listened for.
- **`routes/customers.php`, `app/Livewire/Customers/**`** — this story links *to* `customers.show`; it
  does not modify the Customers module. The reverse link (an order row on 0047's history table linking
  here) is **0047's backlog item 1**, which this story *unblocks* but does not implement (**D-14**).
- **`resources/views/livewire/customers/show.blade.php`** — one exception, and only one: the
  `<x-money>` retrofit in **D-7**, which is a *sequential* edit of a closed story's file, never a
  concurrent one.

## Tests to perform

Three suites. Per [testing/README.md](../../docs/testing/README.md), a `Livewire::test()` authorization
test and an HTTP one are **not substitutes for each other** — route middleware and the in-component gate
fail in different places, and `/livewire/update` does not re-run every route middleware. Both are
required wherever authorization is asserted.

> **Every money assertion is a decimal-*string* comparison.** `decimal(10,2)` casts to a string in
> Eloquent; `toBe(35.00)` fails confusingly and `toEqual(35.0)` passes for the wrong reason (0045 **R-3**,
> inherited unchanged through 0048, 0051, 0053 and 0054).

> ⚠️ **Every disabled-state assertion runs against a NON-Super-Admin actor, named as such in the test.**
> `Gate::before` grants a Super Admin every ability, so `canCancel()` / `canEditLineItems()` /
> `canRefund()` all render **enabled** for that actor while the action still refuses on click — the
> accepted enabled-then-refused drift 0050's own "what depends on this story" note documents. A disabled
> assertion written with a Super Admin fixture is a **guaranteed false negative**, and `frontend-qa`
> flagged it explicitly.

### Feature — `tests/Feature/Orders/IndexTest.php` (**new** — route + access)

- [ ] Integration test: a signed-out visitor requesting `route('orders.index')` is redirected to `login`.
- [ ] Negative test: a signed-in user holding no `orders.*` permission gets a **403**.
- [ ] **Positive** test: a user holding exactly `orders.view` gets a **200**. Required, not optional — a
      misspelled ability denies everyone and denial is indistinguishable from a correct refusal
      ([authorization.md](../../docs/architecture/authorization.md#the-copyable-module-gate-pattern-and-the-three-alternatives-rejected)).
- [ ] Integration test: a Super Admin (holding zero permission rows) gets a **200** via `Gate::before`.
- [ ] Integration test: the `orders.index` route's `can:` middleware set is **exactly** `['can:orders.view']`.
- [ ] Component test: `Livewire::test(Index::class)` mounted by a user without `orders.view` throws
      `AuthorizationException` — the in-component gate, distinct from the route refusal.
- [ ] **Reflection test:** the list component exposes no public method beyond `mount`, `orders`,
      `ordersSummary` and `render`. "The list writes nothing" is a claim a mutating method reachable over
      `/livewire/update` would falsify while every markup assertion still passed (0047's precedent).

### Feature — `tests/Feature/Orders/IndexRenderingTest.php` (**new** — markup + data contract)

- [ ] Integration test: three orders render their `order_number`, customer name, both status labels,
      total and date.
- [ ] **Ordering test:** three orders with distinct `created_at` values render newest-first. Assert on
      the **rendered position** (`strpos` of each order number in the response), not on the collection
      the component built — the component could sort correctly and the view still emit insertion order.
- [ ] **Ordering tie-break test:** two orders sharing a `created_at` second render deterministically
      (UUID v7 descending). Without this the newest-first test is flaky by construction.
- [ ] Edge case: zero orders renders `orders.index.empty` and **no** empty `flux:table` body.
- [ ] Integration test: each row carries `data-test="view-order-{id}"` whose `href` is
      `route('orders.show', $order)`.
- [ ] Integration test: a flagged order renders `data-test="order-flagged-{id}"`; an unflagged one does
      **not**.
- [ ] Integration test: a flagged order whose `flag_reason` is **`NULL`** still renders the marker, with
      the generic copy — the 0053-flagged / 0054-unreasoned combination (**D-15**), which is reachable
      today and which a test written only against 0054's mismatch reason would miss entirely.
- [ ] Integration test: `total` renders as the stored decimal string (`10.00`, not `10`), asserted as a
      **string**.
- [ ] Integration test: the customer cell's `href` is `route('customers.show', $customerId)`.

### Feature — `tests/Feature/Orders/ShowTest.php` (**new** — route + access + per-control authorization)

- [ ] The same five access tests as `IndexTest` above, against `orders.show`.
- [ ] Integration test: the `orders.show` route's `can:` middleware set is **exactly** `['can:orders.view']`
      — pinned mechanically, so a later story widening it to `orders.edit` has to change this line
      deliberately (**D-5**).
- [ ] Integration test: `GET /orders` still resolves to `orders.index` after the parameterised route is
      added — the route-ordering regression.
- [ ] Negative test: a malformed, non-UUID `{order}` segment is a **404**.
- [ ] **Per-control authorization dataset — four actors × the whole control set.** For each of
      `{edit-only, refund-only, both, neither}` (all four additionally holding `orders.view`), assert the
      rendered availability of: the line-item add/remove/quantity controls, the status select and apply
      control, the cancel control, and the refund control. `frontend-qa` specified this as a **dataset**
      rather than four hand-written tests precisely because the interesting cells are the mixed ones —
      an implementation that gates every control on one flag passes both single-ability rows and fails
      only the mixed pair.
- [ ] Integration test: an actor holding **`orders.refund` but not `orders.edit`** can record a refund
      and cannot edit line items. The independence of the two abilities in **that** direction is what
      proves `orders.refund` is not decorative (0051's own cross-gate reasoning, at the UI layer).

### Feature — `tests/Feature/Orders/ShowRenderingTest.php` (**new** — the detail's data contract)

- [ ] Integration test: the header renders `order_number` and both status labels.
- [ ] Integration test: the customer section renders the customer's name, the order's **own frozen**
      shipping address, and a link to `customers.show`.
- [ ] **Regression test:** change the *customer's* address after the order exists; re-render and assert
      the page still shows the address as it stood at order time. Same failure mode and same reason as
      0045's own snapshot regression — a live join instead of the frozen copy is invisible until someone
      moves house, and this screen is where it would first be *seen*.
- [ ] Integration test: line items render `product_name`, `product_sku`, `quantity`, `unit_price`,
      `line_total` and `refunded_quantity`.
- [ ] Integration test: the totals block renders `subtotal`, `tax_amount`, `shipping_amount`, `total`
      and `refunded_amount`, each as a decimal string.
- [ ] Integration test: `<x-money>` renders a decimal string unchanged apart from its currency affix —
      asserted on `10.00`, `0.00` and `1234.50`, so a formatter that quietly casts to float is caught.

### Feature — `tests/Feature/Orders/ShowLineItemsTest.php` (**new** — the hard block, at the UI layer)

- [ ] Integration test (**dataset over `Pendiente` and `Procesando`**): the add, remove and
      quantity-save controls all render **enabled** for a non-Super-Admin holding `orders.edit`. The
      `Procesando` row is not padding — an implementation hard-coding the block as "anything but
      `Pendiente`" passes every `Pendiente` case (0048 **R-3**).
- [ ] **Integration test (dataset: 2 statuses × 3 controls): on `Enviado` and `Entregado`, all three
      controls render disabled — and the add-line-item form is absent or disabled as a unit**, not one
      control at a time (**D-4**).
- [ ] **Integration test — the highest-value assertion in the story: on an `Enviado` order, the
      line-item section contains NO confirmation control of any kind.** Assert the absence of
      `data-test="confirm-dialog-*"` anywhere within the line-item section, and the absence of any
      `wire:click` targeting a line-item method. 0048's block has **no** confirmation path by design
      (PRD §3.2: *"always blocked, with no confirmation path around it"*), and 0049 ships a
      confirmation mechanism three scenarios away in the same PRD section. A UI "are you sure" here
      would be a **regression against a requirement**, not a nicety — and every other test in this file
      would stay green while it shipped. This is the UI half of 0048's own test **T-B**.
- [ ] Component test: `Livewire::test(Show::class, …)->call('addLineItem')` against an `Enviado` order
      surfaces `OrderNotEditableException`'s message as a rendered error rather than a 500 (**D-12**),
      and writes nothing.
- [ ] Component test: removing an order's **last** line item surfaces the `ValidationException`'s
      message against the line-item field and leaves the item listed (0048 **D-1**).
- [ ] Integration test (the boundary from the other side): removing one of **two** line items succeeds.
      A rule asserted only from its refusing side cannot distinguish `count <= 1` from `count <= 2`.
- [ ] Integration test: a quantity change re-renders the line total and the order's totals from the
      **stored** `unit_price` — mutate the product's catalog price first, and assert the rendered
      `unit_price` is unmoved (0048 **D-4**, at the layer where a wrong value would actually be read).

### Feature — `tests/Feature/Orders/ShowStatusTest.php` (**new**)

- [ ] Integration test: `statusOptions()` excludes `Cancelled` from every linear status (**D-8**).
- [ ] Integration test: `statusOptions()` excludes the order's **current** status — 0049 **D-4** makes a
      same-status transition a `ValidationException`, so offering it is offering a guaranteed refusal.
- [ ] Integration test: on a `Cancelado` order the status select renders **disabled** and
      `statusOptions()` is empty (**D-8**) — every transition out of `Cancelled` is refused by 0049 **D-6**.
- [ ] Integration test (dataset over the three adjacent forward pairs): choosing a forward status and
      applying it changes the order **without** opening a confirmation dialog.
- [ ] Integration test (dataset over the three adjacent backward pairs): choosing a backward status opens
      `data-test="confirm-dialog-backward-transition"` and **does not** write.
- [ ] Integration test: confirming applies the change with `confirmed: true` and the persisted status is
      the earlier one.
- [ ] Integration test: dismissing leaves the persisted status untouched **and** resets the select to the
      order's real status — a select left showing a value the server never accepted is the
      desync class of bug this repo has already paid for once.
- [ ] Integration test: a **backward skip** (`Delivered → Pending`) opens the dialog too — the rule is
      about direction, not distance (0049 **D-8**).
- [ ] Component test: a forged `applyStatusChange` call on a backward target with the confirmation never
      opened surfaces `OrderStatusRegressionRequiresConfirmationException`'s message as a rendered error
      and writes nothing (**D-11**'s defence-in-depth half).

### Feature — `tests/Feature/Orders/ShowCancellationTest.php` (**new**)

- [ ] **Integration test (cross-dimension dataset):** the cancel control renders **enabled** for
      `{Pending, Processing} × {Paid, PendingPayment}` and **disabled** for `Shipped`, `Delivered`,
      `Cancelled`, **and — independently of `status` — for `{Pending, Processing} × PartiallyRefunded`.**
      `frontend-qa` named the last cell the highest-risk case: a hint written as "is `status` in
      `{Pending, Processing}`" passes every other row (0050 **R-1**, arriving one layer up).
- [ ] Integration test: the disabled branch carries the same `data-test="cancel-order"` hook as the
      enabled one.
- [ ] Integration test: cancelling opens `data-test="confirm-dialog-cancel-order"` before writing —
      cancellation is irreversible and PRD documents no path out of `Cancelado`, so a bare click is not
      the affordance (**D-9**).
- [ ] Component test: a forged `cancelOrder` call against an `Enviado` order surfaces
      `OrderCancellationBlockedException`'s message as a rendered error and writes nothing (**D-12**).
- [ ] Integration test: cancelling an order leaves `payment_status` visibly unchanged on the page —
      0050 **D-1** means a cancelled paid order legitimately reads `Cancelado` / `Pagado`, and the screen
      must not imply otherwise.
- [ ] ⚠️ Documented-drift test: for a **Super Admin** against an `Enviado` order, the cancel control
      renders **enabled** and the click is refused with a 409. Asserted as the *documented* drift 0050
      records — with a comment pointing at it — rather than as correct behaviour, exactly as
      `IndexUiTest` pins the Roles screen's equivalent.

### Feature — `tests/Feature/Orders/ShowRefundTest.php` (**new**)

- [ ] **DOM-absence test (dataset over `PendingPayment` and `Refunded`): the refund control is ABSENT
      from the rendered response, not merely disabled.** This is a literal PRD §3.2 acceptance criterion
      — *"the refund action does not render"* — and it is the **UI half** of a defence-in-depth pair
      whose backend half 0051 owns. Assert the absence of `data-test="record-refund"` **and** of any
      `wire:click` targeting `openRefundModal` (**D-10**).
- [ ] Integration test (dataset over `Paid` and `PartiallyRefunded`): the control **is** present.
- [ ] **Integration test: the two dimensions are treated differently and independently.** For an actor
      **lacking** `orders.refund` against a `Paid` order, the control renders **disabled and present**
      (with its `data-test` hook on both branches); for an actor **holding** `orders.refund` against a
      `Refunded` order, it is **absent**. A single mechanism handling both would fail one of these two,
      and which one it fails is a security-relevant difference (**D-10**).
- [ ] Component test: `recordRefund` with valid units updates the rendered `refunded_amount`, the line
      item's `refunded_quantity` and the payment badge.
- [ ] Component test: an over-refund surfaces 0051's `ValidationException` message against the refund
      field and writes nothing.
- [ ] Integration test: a full refund of every unit re-renders the order as **`Cancelado`** — 0052's
      auto-cancel, observed where an administrator would actually see it. This is the one place the
      auto-cancel becomes visible, and a screen that cached `$order` across the write would show the
      stale status.

### Feature — `tests/Feature/Orders/ShowTaxDisplayTest.php` (**new**)

- [ ] Integration test: a resolved order renders its `salesRegion->name` and its `tax_rate` as a
      percentage string (`21.000` → the stored string plus `%`), with **no float anywhere** (**D-7**).
- [ ] **Integration test — atomicity of the tax panel:** a flagged order renders the flag callout and
      **no** confident rate figure. A flagged order carrying a plausible-looking rate is exactly what
      manual review rubber-stamps, which is why 0054's **D-5** forbids the state existing at all — this
      is the assertion that the *screen* does not reintroduce it presentationally.
- [ ] **Integration test: `sales_region_id` `null` renders "not yet resolved", and a resolved region at
      `'0.000'` renders a real 0% rate — and the two render DIFFERENTLY** (**D-16**). `null` and `0.000`
      collapsing into each other is the single likeliest silent bug in the whole tax chain, flagged
      independently by 0016, 0026, 0045, 0053 and 0054; this is its last opportunity to be introduced.
- [ ] Integration test: the flag callout resolves `orders.flag_reasons.*` for a reason token, and the
      generic copy for a `NULL` reason (**D-15**).

### Feature — `tests/Feature/Navigation/SidebarModuleGatingTest.php` (**extend** — 0013's file)

- [ ] Integration test: `data-test="sidebar-link-orders"` is **present** for a holder of `orders.view`
      and **absent** otherwise. Select by the hook, never by the word "Orders", which collides with other
      copy ([authorization.md](../../docs/architecture/authorization.md#the-second-half-of-a-module-gate-the-sidebar-registry)).
- [ ] The suite's existing set-equality guard covers the new entry automatically; assert it still passes
      **unmodified** with two routes under `orders.*`, and record that it was verified rather than
      assumed.
- [ ] The suite's existing `config:cache` assertion still passes — the new entry contains no closure.

### Browser — `tests/Browser/Orders/` (**new folder, six files**) — **D-3**

`frontend-qa`'s file-splitting recommendation is **adopted**: this page has more independently-gated
controls than any screen in the app, and one large file would make a failure's blast radius unreadable.

| File | Journey |
| --- | --- |
| `OrdersListTest.php` | Sidebar → list → click a row's detail action → land on the detail page |
| `OrderDetailLineItemsTest.php` | Add a line item through the interim picker, change a quantity, remove one — each driven the way a person drives it, asserting the **server-side** totals afterward |
| `OrderStatusTransitionTest.php` | Advance forward with no dialog; move backward, see the dialog, confirm; move backward, see the dialog, dismiss |
| `OrderCancellationTest.php` | Cancel a `Pendiente` order through the dialog; confirm the control is not clickable on an `Enviado` one |
| `OrderRefundVisibilityTest.php` | The refund control's presence/absence across the four payment states, and a full refund driving the visible auto-cancel |
| `OrderTaxRegionDisplayTest.php` | A resolved order's tax panel; a flagged order's callout in its place |

- **Select by `data-test` hook, never by visible text** — every row action here is icon-only, and
  "Orders"/"Cancel"/"Total" all collide with other copy on the page.
- **Drive the selects the way a person does**, not through a `selectOption()`-style API: the
  `null`-property/native-`<select>` desync recorded in
  [errors-log-archive.md](../../docs/errors-log-archive.md#a-null-livewire-property-bound-to-a-native-select-silently-dropped-the-users-own-pick--2026-08-16)
  is invisible to both `Livewire::test()->set()` and `selectOption()`, and this screen binds **three**
  selects (status, product, variant).
- **Prove each new browser test can fail** before counting it as coverage — the regression-proof
  discipline [testing/frontend/README.md](../../docs/testing/frontend/README.md) already requires.

### Deliberately **not** tested

- **Any backend rule 0045–0054 already pin.** This story asserts the UI *manifestation* of each rule
  (visible / hidden / disabled / rendered-error), never its derivation. Re-asserting "an over-refund is
  refused" at this layer would duplicate 0051's suite and go stale with it.
- **A `verified`-middleware refusal** — see the ⚠️ under [Route](#route--routesordersphp-new--one-require-line-in-routeswebphp).
- **A soft-deleted-order 404** — `Order` has no `SoftDeletes` (0045), so the case does not exist.
- **Pagination** (**D-13**), search or filters — none exists in this cut.
- **The interim product picker's search behaviour** — it has none by construction (**D-1**). The tests
  that would assert a debounced server-side search belong to 0022 and arrive with it.

## Expected outcome

An administrator holding `orders.view` sees an **Orders** entry in the sidebar, opens `/orders`, and
lands on a newest-first order book showing each order's number, customer, both status badges, total and
date, with a needs-attention marker on any order the tax chain flagged. Clicking a row opens
`/orders/{uuid}`: a detail page carrying the customer summary and the order's own frozen shipping
address, the line items, the status and lifecycle controls, and the totals and tax panel.

Every control on that page is available exactly when the operation behind it is. With `orders.edit`, line
items can be added, removed and re-quantified on a `Pendiente` or `Procesando` order — and **all three
controls are unavailable together, with no confirmation path of any kind**, once the order is `Enviado`
or `Entregado`. The status select offers only the transitions 0049 will accept, never `Cancelado` and
never the order's current status; a backward move opens a confirmation dialog first and applies only once
confirmed. The Cancel control is unavailable on a `Enviado`, `Entregado` or `Parcialmente reembolsado`
order. With `orders.refund` — a **distinct** ability, held independently of `orders.edit` — a refund can
be recorded against a `Pagado` or `Parcialmente reembolsado` order, and the refund control **does not
render at all** in the other two payment states. Refunding every unit re-renders the order as
`Cancelado`, which is where 0052's auto-cancel first becomes visible to a human.

The tax panel shows the resolved region and the rate snapshotted onto the order, or — when the order is
flagged — the recorded reason **in place of** a rate, never beside one. An order with no region resolved
reads "not yet resolved", which is visibly distinct from a legitimate 0%.

**Nothing is added that this story does not own:** no migration, no column, no permission, no policy
ability, no action, no notification, no event — and no rule this screen enforces that an action does not
enforce first.

## Acceptance criteria

- [ ] `routes/orders.php` exists, is `require`d from `routes/web.php`, and declares `orders.index`
      (`GET /orders`) and `orders.show` (`GET /orders/{order}`) — **in that order** — each gated
      `can:orders.view` and **only** that ability, inside one `['auth', 'verified']` group.
- [ ] `App\Livewire\Orders\Index` authorizes `orders.view` in `mount()`, exposes no mutating public
      method, and implements 0045 **D-6**'s ordering (`created_at desc, id desc`) with `with('customer')`
      and **not** 0045 **D-14**'s five-relation detail contract.
- [ ] `App\Livewire\Orders\Show` authorizes `orders.view` in `mount()`, holds `#[Locked] public string
      $orderId`, implements 0045 **D-14** verbatim, and authorizes as the **first statement** of every
      mutating **and** disclosing method — the two dialog openers included.
- [ ] `resources/views/livewire/orders.blade.php` (**flat**) and
      `resources/views/livewire/orders/show.blade.php` (**nested**) both exist and are the paths Livewire
      actually resolves, verified by running the components rather than by reasoning about them.
- [ ] The list renders seven columns, a needs-attention marker (not a column) whose copy reads as
      *needs attention* rather than as a fault, a `customers.show` link per row, an explicit empty state,
      and a `data-test="view-order-{id}"` detail action on every row.
- [ ] The detail page renders five sections, and its customer block is **read-only plain text** with no
      `flux:input` and no address form.
- [ ] **All three line-item controls are disabled together** when the order is `Enviado` or `Entregado`,
      derived from a single `#[Computed] canEditLineItems()` that mirrors 0048's own guard, and **no
      confirmation control of any kind is rendered against them** — pinned by a DOM-absence test.
- [ ] The status select excludes `Cancelado` and the order's current status, is disabled entirely on a
      `Cancelado` order, and binds a `public string` backing value that is never `null`.
- [ ] A backward transition opens a confirmation dialog **before** any call, decided by
      `OrderStatus::isBackwardFrom()` — the same predicate 0049's guard wraps — and applies with
      `confirmed: true` only after the administrator confirms.
- [ ] The Cancel control's availability comes from `Gate::allows('cancel', $order)`, which is
      `orders.edit` **and** `Order::isManuallyCancellable()`; the component re-derives neither the status
      set nor the `PartiallyRefunded` exclusion.
- [ ] The refund control is **absent from the DOM** when `payment_status` is `PendingPayment` or
      `Refunded`, and **present-but-disabled** when the actor lacks `orders.refund` — two different
      dimensions, two different treatments, both pinned by their own tests.
- [ ] `orders.refund` is gated **independently** of `orders.edit` and `orders.view`, with its own
      disabled hint, and an actor holding only `orders.refund` can refund without being able to edit.
- [ ] The tax panel renders the resolved region and rate, **or** the flag reason **in place of** a rate,
      **or** an explicit "not yet resolved" that is visibly distinct from a `0.000` rate.
- [ ] Every money and rate value renders from its stored **decimal string**; no `(float)`, `floatval()`
      or arithmetic appears anywhere in either component or either view.
- [ ] `config/modules.php` gains one `items.orders` entry whose `permissions` set-equals both routes'
      `can:` ability, with `current_when: 'orders.*'` covering the detail route, no closure and no
      literal copy; `lang/{en,es}/navigation.php` each gain exactly one `items.orders` leaf.
- [ ] `lang/en/orders.php` and `lang/es/orders.php` gain the same screen-copy groups, key-for-key, and
      **rename or remove none** of 0045/0049/0050/0054's existing groups.
- [ ] `resources/views/components/confirm-dialog.blade.php` exists as an **anonymous** Blade component
      and is used by both the backward-transition and the cancellation confirmations.
- [ ] Every gated control carries its `data-test` hook on **both** the enabled and the disabled branch,
      and the two Flux/Blaze markup rules are reused verbatim.
- [ ] **The add-line-item control ships the interim picker described in D-1**, and D-1's replacement
      acceptance criterion is recorded verbatim in this file for the story that lands 0022.
- [ ] No migration, no column, no permission, no policy ability, no action, no model change, no
      notification and no event ships.

## Definition of Done

- [ ] Tests written and green — the full suite **unscoped** (`php artisan test`, no `--filter`), not
      only the Orders-scoped run
      ([base-standards.md](../../docs/conventions/base-standards.md#steps-1-and-2-are-the-iteration-forms-run-both-unscoped-before-declaring-the-work-done)).
      **Non-optional rather than merely recommended here:** this story appends to `config/modules.php`,
      which `SidebarModuleGatingTest` iterates for **every** entry, and it edits a lang file four sibling
      stories also write.
- [ ] The six browser test files exist as separate files per **D-3**, each proven able to fail before
      being counted as coverage.
- [ ] `vendor/bin/pint --format agent` run **unscoped** (not `--dirty`), and Larastan level 7 clean.
- [ ] Code reviewed (`code-reviewer`) — and **specifically asked to rule on D-4** (whether 0048's
      shared-state-guard backlog item should be taken now that this screen is its fourth call site) and
      on **D-2** (whether the shared `confirm-dialog` component earns its existence at two call sites).
- [ ] No security findings (`appsec-auditor`) — specifically: that `$orderId` is `#[Locked]`; that every
      mutating **and** disclosing method authorizes as its first statement; that no control's
      availability is re-derived from a status set or payment state written a second time in the
      component; that the refund control's DOM absence is a presentation choice layered on top of 0051's
      own refusal and never a substitute for it; and that the interim product picker discloses no
      product the actor could not otherwise reach (**R-4**).
- [ ] Documentation updated (`docs-keeper`):
  - [`api/routes.md`](../../docs/api/routes.md) — `orders.index` and `orders.show` added to the
    app-owned routes table, with a subsection following `users.index`'s shape recording that the
    middleware column **understates** what protects the detail page: three distinct abilities govern its
    controls, all enforced in-method and therefore invisible there. **This is the third and fourth
    permission-gated route** — re-count rather than assume, per the
    [bare-negative-claim](../../docs/errors-log-archive.md#a-docs-this-app-has-no-x-yet-claim-outlived-the-x-by-two-tasks--2026-08-13)
    failure mode arriving as arithmetic.
  - [`architecture/authorization.md`](../../docs/architecture/authorization.md) — the
    `Gate::allows()`-is-a-UI-hint section gains its **first three-ability screen**, and its accepted-drift
    list gains the Super Admin/`Enviado` cancel case 0050 predicted. The **state-based refusal** rendered
    as a disabled control (rather than as a 403) is the reusable half a later epic inherits.
  - [`conventions/base-standards.md`](../../docs/conventions/base-standards.md) — the directory listing
    gains `app/Livewire/Orders/`, `routes/orders.php`, and `resources/views/components/confirm-dialog.blade.php`
    as the repo's first **shared** anonymous UI component that is not navigation chrome.
  - [`conventions/naming.md`](../../docs/conventions/naming.md) — the `Index`-flat / `Show`-nested depth
    asymmetry gains its **third** shipped case, in a second folder.
  - **Grep the tree for bare negative claims this story falsifies**, not only the change→doc mapping:
    `grep -rn "two permission-gated routes\|no Orders screen\|not yet built\|does not render yet" docs/`.
- [ ] Acceptance criteria met.

## Documented functional decisions

Each resolves a question raised during the debate. Every one is a **conservative, reversible default the
human may override** — the reasoning is recorded so an override is a decision rather than a rediscovery.

### D-1 — The product picker is an interim `flux:select`, to be replaced by story 0022's shared component <a id="d-1"></a>

*(Resolves `frontend-expert`'s open question 2 — the one real gap the debate found.)*

`AddOrderItem` (0048) needs a product and an optional variant. **Nothing in this repo builds a picker for
either**, and the natural fit — Epic 2's [0022](done/0022-searchable-multi-select-component.md), the shared
searchable, server-side-filtered multi-select — is `new`, is itself a dependency of three Epic 2 screens,
and **has no committed timeline within this Epic 3 decomposition**.

**Adopted: ship the interim, do not block.** Blocking this story on 0022 would add a *fourth* link to a
chain that is already three deep and would hold the entire Orders UI — the consumer surface for seven
backend stories — behind a component whose own schedule this decomposition does not control.

**The interim shape:**

- A `<flux:select>` bound to `$newProductId`, fed by a `#[Computed] productOptions()` returning a
  **bounded, name-ordered** query over the product catalog.
- A dependent `<flux:select>` bound to `$newProductVariantId`, fed by `#[Computed] variantOptions()`,
  rendered only when the selected product has variants. The product select therefore binds
  `wire:model.live` — the same DOM-contract knock-on task 0015a recorded for the Users role select, and
  the *only* live-bound field on this form.
- An explicit empty state when the catalog is empty, and a bounded result set with a visible notice when
  it is truncated (**R-4**).
- Both selects bind `public string` properties defaulting to `''`, never `null`
  ([errors-log-archive.md](../../docs/errors-log-archive.md#a-null-livewire-property-bound-to-a-native-select-silently-dropped-the-users-own-pick--2026-08-16)).

**This is logged as a stopgap, in three places** — here, in [Risks](#risks) as **R-4**, and in the
[backlog](#technical-tasks-for-the-backlog) as item 1 — because an undocumented interim becomes
permanent by default.

> #### The exact acceptance-criterion wording that changes when 0022 ships
>
> **Recorded verbatim so the swap is a scheduled edit rather than a rediscovery.** The story that lands
> 0022's Orders consumer **deletes** this criterion from `done/0055-orders-list-detail-editor-ui.md`'s
> record and ships the replacement:
>
> **REMOVE (this story's interim criterion):**
>
> > - [ ] The add-line-item control offers the product catalog through a plain `<flux:select>` bound to
> >       `$newProductId` (plus a dependent variant `<flux:select>` when the chosen product has
> >       variants), fed by a bounded, name-ordered server-side query, with an explicit empty state when
> >       the catalog is empty and a visible notice when the result set is truncated.
>
> **REPLACE WITH:**
>
> > - [ ] The add-line-item control offers the product catalog through the shared searchable,
> >       server-side-filtered multi-select from story 0022, bound in **single-select** mode, with its
> >       own `MultiSelectOptionsResolver` implementation for products (and a second for that product's
> >       variants), a debounced server-side search, and the component's own "no results" empty state.
> >       **The plain `<flux:select>` interim, `productOptions()`, `variantOptions()` and the product
> >       select's `wire:model.live` binding are all removed in the same change**, and no bounded/
> >       truncated-result notice remains.
>
> The replacement is **larger than a swap**: `wire:model.live` exists only because the interim needs a
> round-trip to populate the variant select, and 0022's component owns its own fetch. Leaving it behind
> would be a live round-trip per keystroke on a field nothing reads.

**Reversal path:** if the human prefers to block on 0022 after all, this story's Phase 3 stops until 0022
is `done` and the criterion above ships in its replacement form from the start. Nothing else in this file
changes — the picker is one form control on one section of one page.

### D-2 — A small reusable anonymous `confirm-dialog` component, flagged as a judgment call <a id="d-2"></a>

*(Resolves `frontend-expert`'s open question 1.)*

This story needs **two** confirmations — the backward status transition (0049) and the manual
cancellation (0050) — and `frontend-expert` correctly noted that **no generic confirm component exists
to reuse**: the Users and Roles delete modals are bespoke, per-screen, and each is welded to one
irreversible action and its own `#[Locked]` state (`$deletingUserId`, `$deletingRoleId`).

**Adopted: build `resources/views/components/confirm-dialog.blade.php`, anonymous, in this story.**

**Why this is a different kind of thing from the bespoke delete modals**, and therefore not a
contradiction of them:

| | Users/Roles delete modal | This component |
| --- | --- | --- |
| Guards | one irreversible destructive action | a **business-intent** decision — "did you mean this?" |
| State | its own locked target id + name, disclosed by an authorizing opener | the parent component's, passed in as props |
| Content | fixed copy about one operation | supplied per call site |
| Instances | one per screen | **two in this story alone** |

Two call sites in one story is the reuse threshold this repo already applies — 0009 created
`app/Actions/Roles/` for a single class *because the domain warranted a home*, and this is the same
judgment with the count already satisfied.

> ⚠️ **This is a judgment call the human may reasonably want simplified, and it is flagged rather than
> buried.** If "business-intent confirmation" does not recur elsewhere in the app, a shared component
> for two call sites in one file is indirection for its own sake. **The reversal cost is one file
> deleted and its markup inlined twice** into `orders/show.blade.php` — no test, no `data-test` hook and
> no behaviour changes either way, because the hooks are prop-supplied (`test-prefix`). The Definition
> of Done asks `code-reviewer` to rule on it explicitly.

Three constraints that bind either way:

- **It is anonymous.** This repo has no `app/View/Components/` at all
  ([base-standards.md](../../docs/conventions/base-standards.md#directory-structure)), and a class-based
  component here would be the first — a bigger decision than this story should make.
- **It holds no state and makes no decision.** `:show` is the parent's `bool`; `confirm-action` and
  `dismiss-action` are method names the parent owns. A dialog that decided *whether* to appear would be
  a second implementation of a rule an action already owns.
- **The two Flux/Blaze markup rules bind inside it**, and its inner content is wrapped in `@if ($show)`
  so only one dismiss control is ever in the DOM — the rule `users.blade.php` and `roles.blade.php` both
  follow.

### D-3 — Six browser test files, split by concern, not one <a id="d-3"></a>

*(Adopts `frontend-qa`'s recommendation as given.)* This page carries **five independently-gated control
groups** across **three distinct abilities** and **two status dimensions** — more than any screen in the
app, including Roles. A single `OrdersDetailTest.php` would make every failure's blast radius unreadable
and would guarantee the file becomes the one nobody opens. The split is by *concern*, not by test count,
so a failure names its own subject: a red `OrderRefundVisibilityTest` says what is wrong before anyone
reads the assertion. The Feature suite is split the same way and for the same reason.

### D-4 — `canEditLineItems()` is the block's **fourth** call site, and this story asks rather than decides <a id="d-4"></a>

0048's **D-5** put its hard-block guard in each of its three actions and stated the threshold explicitly:
*"If the three `if`s ever become four, extract a shared guard class"* in the shape
`EnsureRecentPasswordConfirmation` establishes — a throwing wrapper around a non-throwing predicate — and
filed it as its own **backlog item 1**.

**This screen is that fourth call site.** `canEditLineItems()` must answer the same question the three
actions answer, and the repo's own rule is that a hint must read the *same predicate* its guard throws
from, never a second comparison.

**This story does not take the refactor unilaterally**, because it would edit three closed sibling
actions to serve a UI need — and it does not skip it either, because a fourth hand-written
`in_array($status, [Shipped, Delivered])` in a Blade-adjacent component is exactly the drift 0048
predicted. **Two shapes, and `code-reviewer` is asked to rule at Phase 2:**

| | **(a) Extract now (recommended)** | **(b) Predicate on the model only** |
| --- | --- | --- |
| Shape | `App\Actions\Orders\EnsureOrderIsEditable` — a throwing `__invoke()` wrapping a non-throwing `isEditable(Order)`; the three actions call the thrower, this component calls the predicate | Add `Order::isLineItemEditable(): bool` beside 0050's `isManuallyCancellable()`; the three actions keep their `if`s but read the predicate |
| Files touched in sibling stories | three actions | three actions |
| Precedent | `EnsureRecentPasswordConfirmation` (0015a), which 0048 names by class | `Order::isManuallyCancellable()` (0050), which is **already** the predicate-on-the-model shape for the sibling rule |
| Cost | a new class in a folder that already has six | one method on a model that already carries one just like it |

**(b) is the narrower change and (a) is what 0048 asked for.** The facilitator's own lean is **(a)**,
because 0048 named the class shape and the threshold in advance and the threshold is now met — but it is
a sibling-editing decision and belongs to review, not to Phase 1. **Whichever is chosen, the component
reads a predicate and never re-derives the status set**, which is the part that is not negotiable.

### D-5 — Three abilities govern this screen, and only one of them gates the route

`orders.view` gates both routes and nothing else. `orders.edit` governs line-item editing, status
transitions and cancellation. `orders.refund` — 0051's dedicated non-CRUD permission — governs refunds
alone. A second `can:` on the detail route would 403 the whole page for a read-only actor, which is
0047's **D-1** reasoning applied to a screen with three abilities instead of two.

**Consequence to state plainly for Phase 3:** an actor with `orders.view` alone gets a **200** on both
routes, sees everything, and can do nothing. That is the specified behaviour, not a degraded one — and
it is exactly the role PRD's read-only order-desk case describes.

### D-6 — The list implements 0045 **D-6**, not **D-14**

`with('customer')` only. 0045's **D-14** eager-loads five relations *for the detail screen*, which
renders all of them on one page; the list renders none of them. Copying D-14 to the list would cost five
queries' worth of hydration per row for zero output, and would then look to a later reader like a
contract this story was required to honour — the exact divergence 0047's **D-8** recorded for the same
reason.

### D-7 — Money and rates render from their stored decimal strings, through one shared formatter

Every money column in this chain is `decimal(10,2)` and `orders.tax_rate` is `decimal(6,3)`; Eloquent
casts both to **strings**. There is no arithmetic anywhere on this screen — every figure is already
computed by 0045/0048/0051/0054 — so a `(float)` here would be pure loss.

**0047's backlog item 2 named the trigger for a shared money formatter as "once a second screen renders
a currency value — 0055 will be the second". This is that story, so the item is taken rather than
re-deferred:** an anonymous `resources/views/components/money.blade.php` rendering `{{ $amount }}` with
its currency affix and no casting whatsoever, plus a **sequential** retrofit of 0047's single
`€ {{ $order['total'] }}` call site.

⚠️ **The retrofit is a sequential edit of a closed story's file, never a concurrent one** — the same
constraint 0047's own **D-6** imposed when it edited 0044's view, and the same incident behind it
([errors-log-archive.md](../../docs/errors-log-archive.md#two-agents-dispatched-in-parallel-both-wrote-to-the-same-blade-view--2026-08-16)).
0047's rendering test must be re-run after it.

**`tax_rate` renders as its stored string plus `%`** — `21.000` → `21.000%`. Trimming trailing zeros is a
formatting nicety with a float-shaped trap in it, and is deliberately not done.

### D-8 — The status select binds a **backing value string**, excludes `Cancelled` and the current status, and is disabled entirely on a cancelled order

Three separate rules, each with its own reason:

- **A `public string` bound to a real backing value, never a nullable enum.** A `wire:model`-bound
  property that is `null` desynchronises a native `<select>` and silently drops the user's own pick
  ([errors-log-archive.md](../../docs/errors-log-archive.md#a-null-livewire-property-bound-to-a-native-select-silently-dropped-the-users-own-pick--2026-08-16)),
  and a *typed enum* property is hydrated through `$type::from($value)` **before** validation runs, so a
  forged value raises an unhandled `\ValueError` rather than a validation error (task 0015's F8). The
  shipped shape is the one both findings converge on: non-nullable `string`, defaulting to the order's
  own current backing value.
- **`Cancelled` is excluded from the options entirely.** 0049 **D-6** refuses every transition to or from
  it, confirmed or not, so offering it produces a **guaranteed-refused** option — an affordance that
  exists only to fail. Cancellation has its own control, with its own ability check and its own state
  rule (**D-9**).
- **The order's current status is excluded too**, because 0049 **D-4** makes a same-status transition a
  `ValidationException` rather than a no-op success.
- **On a `Cancelado` order the select is disabled and `statusOptions()` is empty** — every transition out
  of `Cancelled` is refused, so the whole control is inert. Disabled rather than absent, so the
  administrator can see the order *has* a status dimension and that it is closed.

### D-9 — The Cancel control's hint is `Gate::allows('cancel', $order)`, which **is** `isManuallyCancellable()`

`frontend-expert` proposed reading `Order::isManuallyCancellable()` directly. **Adopted with one
refinement, and the refinement matters:** the component asks `Gate::allows('cancel', $order)`, which
0050's `OrderPolicy::cancel()` defines as `orders.edit` **and** `isManuallyCancellable()`. That is the
same predicate, plus the permission half the control also needs — asking the policy gets both in one
call and matches 0050's own forward note, which names `Gate::allows('cancel', $order)` as what this
screen should use.

What is **not** negotiable either way: the component performs **no** status-set membership test and
**no** `PartiallyRefunded` comparison of its own. Both live in `isManuallyCancellable()`, which 0050
built as a shared predicate precisely so this screen would not re-derive them (its **R-1** is the guard
copy-adapted from 0049 that silently loses the payment dimension — the same mistake is available one
layer up).

**The accepted drift, inherited and documented rather than fixed:** a **Super Admin** sees the control
render *enabled* on an `Enviado` order, because `Gate::before` grants `cancel` before the policy's state
clause is ever consulted, and gets a **409** on click. That is the enabled-then-refused shape this repo
already documents for the Users and Roles screens — always in that direction, never the reverse. It is
pinned by a test that names it as documented drift.

**Cancellation is confirmed before it is applied**, through the same dialog component as the backward
transition. PRD documents no path out of `Cancelado` and 0049 refuses every one, so this is the most
irreversible control on the page.

### D-10 — The refund control's **state** dimension hides it; its **permission** dimension disables it

This screen's one deliberate departure from the repo's disabled-not-hidden default, and it is a **literal
PRD acceptance criterion** rather than a preference: PRD §3.2 asks that *"the refund action does not
render"* in `Pendiente de pago` and `Reembolsado`, and pairs it with 0051's independent backend refusal
as an explicit defence-in-depth pair. This story owns the UI half; 0051 owns the backend half, and
neither substitutes for the other.

| Dimension | Predicate | Treatment | Why |
| --- | --- | --- | --- |
| **Payment state** | `payment_status ∈ {Paid, PartiallyRefunded}` | **absent from the DOM** | PRD's own wording, asserted by a DOM-absence test |
| **Permission** | `Gate::allows('orders.refund')` | **disabled, present**, `data-test` on both branches | the repo's default, and the actor needs to see the capability exists |

**The two must not be collapsed into one flag.** An implementation that hides on either condition tells a
refund-less actor nothing about why; one that disables on both violates the PRD criterion. `frontend-qa`
specified the mixed pair as its own test for exactly this reason.

Note the withheld-control rule from
[security/authorization-patterns.md](../../docs/security/authorization-patterns.md#a-control-omitted-from-the-dom-is-safe-only-for-the-one-value-whose-guard-preserves-an-omission)
does **not** bite here: that rule governs a control omitted from a **full-replace payload**, where
absence is indistinguishable from removal. This control submits nothing; omitting it removes an
affordance and changes no submitted set.

### D-11 — A backward transition is **predicted** by `isBackwardFrom()`, not discovered by catching a 409

`frontend-expert` proposed calling `TransitionOrderStatus` and opening the confirmation on the 409.
**Adopted in the opposite order**, because 0049 built the machinery for it: its **D-2** states that
`OrderStatus::isBackwardFrom()` is a **non-throwing predicate** and that the throwing guard is a wrapper
around exactly that call, *"so a UI hint and the rule that refuses have one implementation between
them"*, naming *"story 0055's 'this will move the order backward' warning"* as the intended consumer.

So: `requestStatusChange()` asks `isBackwardFrom()`. Backward ⇒ open the dialog, and `applyStatusChange()`
passes `confirmed: true` only from the confirmed branch. Forward ⇒ call straight through with
`confirmed: false`.

**The 409 catch survives as defence in depth, not as the mechanism** (**D-12**): a forged or raced
`applyStatusChange` still reaches the action, still gets refused, and the message renders inline rather
than 500-ing the page. Both paths are tested.

### D-12 — Every domain refusal is caught and rendered; none is allowed to 500 the page

This screen can reach **four** distinct refusal shapes, and a Livewire component that lets any of them
escape shows the administrator a blank error page after a click that was, from their point of view,
reasonable:

| Refusal | From | Rendered as |
| --- | --- | --- |
| `AuthorizationException` (403) | any `Gate::authorize()` | not caught — the control was disabled or absent, so reaching it means tampering |
| `OrderNotEditableException` (409) | 0048's hard block | an inline error on the line-item section |
| `OrderStatusRegressionRequiresConfirmationException` (409) | 0049 | an inline error on the status field |
| `OrderCancellationBlockedException` (409) | 0050 | an inline error on the lifecycle section |
| `ValidationException` (422) | 0048's last-item rule, 0049's same-status rule, 0050's already-cancelled rule, 0051's four refusal rules | Flux's own `wire:model` error integration, no manual outlet |

- **The 403 is deliberately *not* caught.** An authorization refusal reaching this screen means the
  actor bypassed a disabled control, and swallowing it into a friendly message would hide tampering.
- **The three 409s are caught because they are reachable without tampering** — through a stale page, a
  concurrent edit by another administrator, or a race between render and click. Each renders the
  exception's own constant message; none re-derives the reason.

### D-13 — No "New order" control on this screen, and that is a scope statement rather than an omission

`CreateOrder` (0045) exists and is permission-gated, but an order-creation *form* is a materially larger
surface than anything here: a customer picker, a payment-method picker, an address block, and the same
product picker **D-1** is already shipping an interim for — plus the tax-resolution trigger question
0053's **OQ-2** and 0054's **OQ-2** both leave to "story 0055's", and which this story therefore also
leaves open (**OQ-1**). PRD §3.2's own framing is an administrator **working** an order book that
arrives from elsewhere.

Recorded as [backlog item 2](#technical-tasks-for-the-backlog) rather than left implicit, because "the
Orders screen has no create button" reads as an oversight to anyone who has not read this decision.

### D-14 — Order rows link **out** to `customers.show`; this story does not add the reverse link

The list's customer cell and the detail's customer block both link to `route('customers.show', …)`,
which [0047](0047-customer-order-history-view-ui.md) ships. That makes 0047 a hard dependency for the
link specifically — see [Dependencies](#dependencies) for the fallback if it has not landed.

The **reverse** link — an order row on 0047's history table linking to `orders.show` — is **0047's own
backlog item 1**, filed there against the ghost-affordance rule (*"a link to a route that has not
shipped"*). **This story unblocks it and deliberately does not implement it**, because it would be a
third edit of a closed sibling's view in one story, for a one-line addition that reads better as its
own small change against 0047's file. Recorded as [backlog item 3](#technical-tasks-for-the-backlog).

### D-15 — The flag marker reads "needs attention", and it must render when `flag_reason` is `NULL`

Two facts about `flagged_for_review` that the screen has to get right and that are easy to miss:

1. **On a freshly seeded catalog, every order shipping outside Spain is flagged.** 0053's **D-6** states
   the consequence in full: `SalesRegionSeeder` activates only `es` and its five territories, so every
   other country falls back to the default and flags. That is intended behaviour pending an
   administrator activating and rating a region (stories 0017/0018) — and it means the flag will be the
   **common** case on a new install, not the exception. Copy implying a fault ("Error", "Invalid") would
   train administrators to dismiss the tax chain's only signal.
2. **A flagged order may carry a `NULL` `flag_reason`.** `flag_reason` is 0054's column, and **0053 sets
   the flag without it** in all five of its fallback cases plus its mixed-basket branch. So
   `flagged_for_review = true, flag_reason = null` is not merely reachable — it is the *majority* of
   flagged orders today. The marker renders either way, with `orders.index.flagged_generic` when the
   reason is absent.

A test asserting only 0054's mismatch token would miss the entire 0053 population.

### D-16 — "Not yet resolved" and "0%" render differently, and neither is inferred from `tax_amount`

`sales_regions.rate` established the distinction (`NULL` = not configured, `0.000` = a legitimate 0%),
0045 carried it onto `orders.tax_rate`, and 0053, 0054, 0026 and 0016 each flag its collapse
independently as the likeliest silent bug in the tax chain. **This screen is its last opportunity to be
reintroduced** — presentationally, by a `@if ($order->tax_rate)` that treats `'0.000'` as falsy, or by
inferring the state from `tax_amount` (which is `0.00` in *both* cases).

The rendered states are three, branched on `sales_region_id` and `tax_rate` and never on `tax_amount`:

| `sales_region_id` | `tax_rate` | Rendered |
| --- | --- | --- |
| `null` | `null` | `orders.detail.tax_unresolved` |
| set | `null` | the region's name, plus `tax_unresolved` for the rate (0053 **D-6** case 5) |
| set | `'0.000'` | the region's name and **`0.000%`** — a real rate |

## Scope fences: what this story must NOT do

- Must **not** add a migration, a column, an index or any schema change.
- Must **not** add, modify or delete any `app/Actions/Orders/**` class. If a rule is missing, it belongs
  in the action and the story returns to Phase 1 rather than growing the component.
- Must **not** add a `OrderPolicy` ability, a permission, a policy class, a notification, a listener or
  an event.
- Must **not** re-derive **any** guard: no status-set membership test, no payment-state comparison, no
  rank arithmetic, no `PartiallyRefunded` exclusion written a second time.
- Must **not** offer `Cancelado` as a status option, or route cancellation through
  `TransitionOrderStatus` (0050 **D-5**).
- Must **not** render a confirmation control of any kind against the line-item hard block (0048's PRD
  wording, and its own test **T-B**).
- Must **not** implement an order-creation form (**D-13**), pagination, search or list filters.
- Must **not** implement a "clear this flag" / manual-review workflow — 0054's [backlog item 4](0054-order-tax-region-resolution-virtual-backend.md)
  explicitly leaves the review action unspecified.
- Must **not** render a per-refund event history (who/when) in this cut — the per-line
  `refunded_quantity` and the order's `refunded_amount` are what ships (**OQ-2**).
- Must **not** modify `app/Livewire/Customers/**`, `routes/customers.php`, or 0047's view **beyond** the
  single `<x-money>` retrofit in **D-7**.
- Must **not** introduce step-up authentication. It applies to no operation here — 0044's **D-7** and
  0047 both recorded the same non-application, and no Orders backend story asks for it.
- Must **not** add a class-based Blade component or an `app/View/Components/` folder (**D-2**).

## Dependencies, risks and open questions

### Dependencies

| Depends on | State | Verified how |
| --- | --- | --- |
| `orders` / `order_items` tables, `Order` / `OrderItem`, `OrderStatus`, `PaymentStatus`, `orders.statuses.*` + `payment_statuses.*` lang keys, the **D-6** list and **D-14** detail retrieval contracts | story [0045](0045-orders-core-crud-backend.md) — **hard, and itself ⛔ blocked** | every column rendered, both badge label sets, both `#[Computed]` queries |
| `AddOrderItem` / `RemoveOrderItem` / `UpdateOrderItemQuantity`, `OrderNotEditableException`, the `Enviado`/`Entregado` hard block | story [0048](0048-order-line-item-editing-backend.md) — **hard** | three controls and `canEditLineItems()` |
| `TransitionOrderStatus`, `OrderPolicy` (+ `transitionStatus()`), `OrderStatus::rank()` / `isBackwardFrom()`, `OrderStatusRegressionRequiresConfirmationException`, `orders.transitions.*` | story [0049](0049-order-status-transition-backend.md) — **hard** | the status select, the backward dialog, **D-11** |
| `CancelOrder`, `OrderPolicy::cancel()`, `Order::isManuallyCancellable()`, `OrderCancellationBlockedException`, `orders.cancellation.*` | story [0050](0050-order-manual-cancellation-backend.md) — **hard** | the Cancel control and **D-9** |
| `RecordRefund`, `orders.refund` permission, `refunds` table, `orders.refunded_amount`, `order_items.refunded_quantity` | story [0051](0051-order-payment-refund-state-backend.md) — **hard** | the refund control, the refunded totals, **D-10** |
| the 100%-refund auto-cancel | story [0052](0052-order-auto-cancel-full-refund-backend.md) — **hard, transitively via 0051** | this screen is where the auto-cancel first becomes visible; its test asserts the re-rendered status |
| `orders.sales_region_id` / `tax_rate` / `flagged_for_review` resolution (physical), plus `tax_amount`/`total` computation for physical orders (**D-13**, added when the tax_amount gap was closed) | story [0053](0053-order-tax-region-resolution-physical-backend.md) — **hard** | the tax panel, the flag marker, **D-15**, **D-16** |
| `orders.flag_reason` column + `orders.flag_reasons.*` lang group, virtual resolution, `tax_amount`/`total` computation for virtual orders (the identical shape 0053 mirrors) | story [0054](0054-order-tax-region-resolution-virtual-backend.md) — **hard** | the flag callout's copy; **the `flag_reason` column does not exist without it** |
| `customers.show` route + `App\Models\Customer` | story [0047](0047-customer-order-history-view-ui.md) — **hard, for the customer link only** — see below | **D-14** |
| the `can:`-gated Livewire route pattern, the sidebar registry, `Gate::before`, UUID route-model binding, the two Flux/Blaze markup rules, `data-test` conventions | **shipped** (tasks 0004/0010/0012/0013/0040, 0006) | `routes/users.php`, `config/modules.php`, `users.blade.php`, `roles.blade.php` |

#### ⛔ Blocked — the full inherited chain

**Phase 3 cannot begin until 0045, 0048, 0049, 0050, 0051, 0052, 0053 and 0054 are all `done`**, and
0045 is itself blocked on Epic 2's 0024, 0029, 0035, 0036 and 0038. **Confirm each is `done` — not
merely unblocked — before Phase 2 is re-run.**

There is nothing here to stub. Every control on the detail screen calls an action from that list; a
screen whose controls call nothing is a mock, not a partial delivery.

#### On the 0047 dependency, precisely

0047 is a hard dependency **for the customer link only** — `route('customers.show', …)` throws if the
route does not exist. Both stories are leaves off 0045 and either may land first. **If 0047 has not
shipped when Phase 3 starts, the customer name renders as plain text** and the link becomes a one-line
follow-up; that is a deliberate degradation rather than a ghost affordance, and it is recorded as
[backlog item 4](#technical-tasks-for-the-backlog). **Nothing else in this story changes.**

#### ⚠️ Soft dependency — story 0022, worked around rather than waited on

[0022](done/0022-searchable-multi-select-component.md) (the shared searchable multi-select) is `new` and has
**no committed timeline in this decomposition**. This story ships the interim in **D-1** and does not
block. The replacement criterion is recorded verbatim in D-1 so the swap is scheduled work.

#### ⚠️ Not parallel-safe with several siblings — shared files

| File | Also written by |
| --- | --- |
| `lang/{en,es}/orders.php` | 0045 (`statuses`, `payment_statuses`), 0049 (`transitions`), 0050 (`cancellation`), 0054 (`flag_reasons`) — **different key groups, same file** |
| `config/modules.php` | 0044 (`items.customers`), and every future module story |
| `lang/{en,es}/navigation.php` | same |
| `resources/views/livewire/customers/show.blade.php` | 0047 — the `<x-money>` retrofit only (**D-7**) |

All of these are **sequential** edits of closed stories' files, which is ordinary maintenance; a
**concurrent** one is the incident recorded in
[errors-log-archive.md](../../docs/errors-log-archive.md#two-agents-dispatched-in-parallel-both-wrote-to-the-same-blade-view--2026-08-16)
and governed by `contracts.md`'s Parallel Agent File-Ownership Rule. Since every listed sibling is a
hard dependency of this story, the ordering constraint costs nothing — it only needs stating.

#### What depends on this story

- **Nothing in Epic 3.** This is the epic's last story and a leaf.
- **0047's backlog item 1** (linking an order row on the customer's history to `orders.show`) becomes
  implementable the moment `orders.show` exists (**D-14**).
- **0053's OQ-2 and 0054's OQ-2** — "when is tax resolution triggered?" — were both deferred to "story
  0055's". This story **does not** answer them, because it ships no order-creation form (**D-13**) and
  therefore has no creation pipeline to hang a trigger on. See **OQ-1**.

### Risks

- **R-1 — A UI hint drifts from the guard it mirrors, and only fails for one actor/state pair.** Five
  controls across three abilities and two status dimensions is the largest hint surface in the app, and
  a hint written as its own comparison agrees with the guard on almost every input.
  *Mitigation:* every hint reads a **named predicate** (`isManuallyCancellable()`, `isBackwardFrom()`,
  a `Gate::allows()` against a policy ability), never a fresh comparison; **D-4** takes the same
  position for the one predicate that does not exist yet; and the per-control authorization dataset
  covers the mixed-ability cells single-ability tests cannot reach.
- **R-2 — A disabled-state test written with a Super Admin fixture is a guaranteed false negative.**
  `Gate::before` grants every ability, so every disabled assertion passes vacuously.
  *Mitigation:* the ⚠️ at the head of the test plan; every disabled assertion names a non-Super-Admin
  actor, and the one Super Admin case is written explicitly as **documented drift** with a comment
  pointing at 0050.
- **R-3 — A confirmation control creeps onto the line-item block.** 0049 ships a confirmation mechanism
  and **D-2** ships a reusable dialog, three scenarios away in the same PRD section from a rule that
  forbids any confirmation path. Reaching for the dialog "for consistency" is the single most natural
  wrong move on this screen, and **every other test in the file would stay green**.
  *Mitigation:* the DOM-absence test asserting no `data-test="confirm-dialog-*"` inside the line-item
  section — the UI counterpart of 0048's own **T-B**, written before the mechanism is available to
  reach for.
- **R-4 — The interim product picker renders the whole catalog into the DOM.** With no server-side
  search, `productOptions()` is bounded by whatever limit Phase 3 picks, and a catalog larger than that
  limit silently truncates — a *usability* failure that looks like a missing product. It is also a mild
  disclosure: every product name and SKU reaches any holder of `orders.edit`.
  *Mitigation:* an explicit bound with a **visible** truncation notice rather than a silent `limit()`;
  the disclosure is accepted because an `orders.edit` holder can already order any product, so the
  picker reveals nothing they could not otherwise reach — and it is named in the Definition of Done's
  security bullet so `appsec-auditor` reads a decision rather than an omission. **D-1**'s replacement
  removes both halves.
- **R-5 — `null` and `0.000` collapse presentationally.** Five sibling stories flag this at the data
  layer; this screen is where it would finally be *seen*, and the failure is a `@if ($order->tax_rate)`
  treating `'0.000'` as falsy.
  *Mitigation:* **D-16**'s three-state table, branched on `sales_region_id` and `tax_rate` and never on
  `tax_amount`, plus a test asserting the two render **differently**.
- **R-6 — The tax panel shows a rate beside a zero tax amount, and reads as a bug.** ✅ **RESOLVED —
  closed in the backend, as this risk required.** *(Was: ⚠️ a real inconsistency in the shipped backend,
  not a UI defect, and this story is where it becomes visible.)*

  **As raised:** 0053's **OQ-1** was explicitly *"BLOCKING for the epic"* and unresolved — 0053 resolved
  a **physical** order's region and rate but wrote **no** `tax_amount`, while 0054 **did** compute
  `tax_amount` and `total` for a virtual order, and 0048's **D-8** recomputed `tax_amount` from a
  resolved rate on any line-item edit. So a freshly created physical order showed `tax_rate 21.000%`
  beside `tax_amount 0.00` — until someone edited a line item, at which point the amount appeared.

  **Closed by** [0053](0053-order-tax-region-resolution-physical-backend.md)'s decision **D-13**, which
  extends `ResolveOrderTaxRegion` to derive `tax_amount` and re-derive `total` in the same write, using
  0054's computation verbatim. A resolved physical order and a resolved virtual order now carry the same
  five columns, so this panel has nothing inconsistent left to render. **This story is unchanged by the
  fix** — it still renders the stored values faithfully and invents no arithmetic (**D-7**), which is
  exactly why the escalation was the right call rather than a presentational workaround.

  ⚠️ **What Phase 3 must still verify rather than assume:** that 0053 and 0054 shipped the *same*
  arithmetic. 0053's **R-7** records the residual — the identical formula now exists in three places
  (both resolvers plus 0048's three line-item actions) with nothing enforcing agreement, and the symptom
  of a divergence is an order whose tax **changes** the first time somebody edits a line item. If this
  screen ever shows that, it is R-7 and not R-6, and the fix is again in the backend.
- **R-7 — `flag_reason` is `NULL` for most flagged orders, and a test written against 0054's token
  misses them.** 0053 sets the flag six ways without a reason; 0054's column is the only writer of one.
  *Mitigation:* **D-15**, plus a dedicated `NULL`-reason rendering test.
- **R-8 — This document goes stale while it waits.** It is blocked behind eight stories, one of which is
  blocked behind five more, and it quotes **every one of them** — `canEditLineItems()`'s guard shape,
  `isManuallyCancellable()`'s name, `isBackwardFrom()`'s signature, `OrderPolicy`'s two abilities and
  its constant, four exception class names, five lang key groups, `orders.refund`'s existence, and the
  `flag_reason` column. That is precisely the *"a deferred finding is a claim about a tree, and the task
  file freezes while the tree does not"* failure recorded in
  [errors-log.md](../../docs/errors-log.md#a-deferred-storys-findings-were-claims-about-a-tree-that-no-longer-existed-and-one-of-them-would-have-reopened-a-bug-in-this-log--2026-08-23).
  *Mitigation:* **Phase 2's INVEST review must be re-run immediately before Phase 3**, and must
  re-verify every quoted name against the **shipped code** rather than against a sibling task file —
  including whether 0050's **D-6** was overridden into a dedicated `orders.cancel` permission (its own
  reviewer-negotiable point), whether 0054's central IP decision was confirmed or overturned, whether
  0051's **OQ-1** settled `refunds.order_item_id` as `restrict` (which would make a refunded line item
  undeletable and change what `canEditLineItems()` should say), and whether 0048's **backlog item 1**
  was already taken (which decides **D-4**). **Every identifier in this file is a reading aid, not a
  locator.**

### Resolved questions

| Question raised | By | Resolved as |
| --- | --- | --- |
| Detail page or a modal? | frontend-expert | A page — line items + two status dimensions + refunds is unbounded, 0047 **D-2**'s reasoning amplified |
| What does the product picker use, given 0022 is pending? | frontend-expert (flagged as a real gap) | **D-1** — an interim `flux:select`, with the replacement acceptance criterion recorded verbatim |
| Generic reusable confirm dialog, or bespoke per-screen? | frontend-expert | **D-2** — a shared anonymous component, flagged as a judgment call for `code-reviewer` |
| One browser test file or several? | frontend-qa | **D-3** — six, split by concern |
| Where does the line-item block's predicate live, given this is the fourth call site? | frontend-expert | **D-4** — two shapes offered, `code-reviewer` rules at Phase 2; the component reads a predicate either way |
| Does the detail route gate on more than `orders.view`? | frontend-expert | **D-5** — no; three abilities govern controls, one gates the route (0047 **D-1**'s reasoning) |
| Does the list use 0045's detail eager-load contract? | facilitator | **D-6** — no; `with('customer')` only |
| Is `Cancelado` a status option? | frontend-expert | **D-8** — no; 0049 refuses it either way, so offering it is offering a guaranteed refusal |
| Is the Cancel hint the model predicate or the policy? | frontend-expert / facilitator | **D-9** — `Gate::allows('cancel', …)`, which **is** the predicate plus the permission |
| Is the refund control hidden or disabled? | frontend-qa | **D-10** — **both**, on two different dimensions: hidden by state (a PRD criterion), disabled by permission |
| Is the backward move predicted or discovered from the 409? | frontend-expert / facilitator | **D-11** — predicted via `isBackwardFrom()`, which 0049 **D-2** built for this consumer; the 409 catch survives as defence in depth |
| Does this screen create orders? | facilitator | **D-13** — no; a materially larger surface, backlogged |
| Does an order row link to the customer, or the customer's history to the order? | facilitator | **D-14** — this story links **out**; the reverse is 0047's backlog item, unblocked here |
| Is a shared money formatter taken now? | facilitator | **D-7** — yes; 0047's backlog item 2 named this story as its trigger |
| Does step-up authentication apply? | facilitator | **No** — no Orders backend story asks for it; 0044 **D-7** recorded the same non-application |

### Open questions

**OQ-1 — When is tax resolution triggered, and who computes `tax_amount` for a physical order?
◐ HALF RESOLVED. The `tax_amount` half is closed; the *trigger* half is still open and still NOT
resolvable by this story.** This question bundled two things, and they have come apart.

**✅ Closed — who computes `tax_amount` for a physical order.**
[0053](0053-order-tax-region-resolution-physical-backend.md)'s decision **D-13** answers it: its own
`ResolveOrderTaxRegion` derives `tax_amount` and re-derives `total` in the same write, using 0054's
computation verbatim, so the two resolvers agree column-for-column. That closes **R-6**'s visible
inconsistency **without any change to this story** — this screen still renders what the columns hold
and invents nothing (**D-7**). The `RecalculateOrderTotals` extraction below survives as 0053's
[backlog item 1](0053-order-tax-region-resolution-physical-backend.md), re-pointed from *"decide who
computes this"* to *"consolidate the three call sites that now do"*.

**◻ Still open — when resolution is triggered at all.** 0054's **OQ-2** deferred the *trigger* question
to "story 0055's", on the reasonable assumption that this story would own an order-creation pipeline.
**It does not** (**D-13** — this story's own, the no-creation-form decision): orders arrive from a
channel this application does not have, so there is no creation flow here to hang
`ResolveOrderTaxRegion($order)` / `ResolveVirtualOrderSalesRegion($order)` off. Both actions remain
"callable against a persisted order" with nothing in the system calling them.

> **Note on the citation, corrected while closing this:** the deferral above was attributed to
> *"0053's **OQ-2** and 0054's **OQ-2**"*. Only 0054's OQ-2 is the trigger question — 0053's OQ-2 is
> whether a flagged order blocks anything (this story's **OQ-3**), and 0053 settled the trigger in its
> **D-8** as "the caller's" rather than deferring it here at all.

Two options for the human, and **neither belongs to this story**:

1. **(recommended)** A small backend story owning the resolution **trigger** — invoked wherever an order
   enters the system. It gives the trigger a home that is not a screen. *(As first written this option
   also owned a `RecalculateOrderTotals` action; that half is superseded by 0053's **D-13**, and the
   extraction it described is now a pure refactor on 0053's backlog rather than a prerequisite.)*
2. An administrator-facing **"resolve this order's tax"** control on this detail page. Attractive
   because it is visible where the problem is, but it needs the authorizing operation 0053's **D-11**
   describes (both resolution actions deliberately authorize nothing), and it would have to override
   0053's **D-10** idempotency guard — two backend decisions a UI story must not make.

Until one lands, this screen renders what the columns hold and invents nothing. **Note the remaining
half is no longer epic-blocking in the way R-6 was:** an unresolved order renders correctly through
**D-16**'s three-state table, which was always the case — what R-6 objected to was a *resolved* order
rendering incoherently, and that is fixed.

**OQ-2 — Should the detail page show a per-refund event history? Non-blocking; a default is stated.**
0051 ships a `refunds` event log carrying `quantity`, `amount`, `refunded_by` and `created_at`, and names
this story as the consumer that "displays `refunded_amount` and the per-item refund history".
**Recommended default: show the per-line `refunded_quantity` and the order-level `refunded_amount` in
this cut, and defer the per-event table** *(recommended)* — the same restraint 0047 **D-3** applied in
showing three identity fields of sixteen. The running totals answer "how much has come back"; the event
log answers "who authorised the €40 and when", which is a support/audit question with its own layout and
its own disclosure question (`refunded_by` names a colleague). Adding it later is a `hasMany` on the
already-loaded `items` plus one table — no contract moves.

**OQ-3 — Should a flagged order block anything on this screen? Non-blocking; recorded so it is not
assumed.** 0053's **OQ-2** left open whether a flagged order may be advanced to `Enviado`.
`flagged_for_review` is currently **inert**: nothing reads it, and this screen only renders it.
**Recommended default: render, do not block** *(recommended)* — a UI story must not invent a
status-transition rule the backend does not enforce, and a control this screen disabled would be
enabled for every other caller of `TransitionOrderStatus`. If the business wants it, it is a rule in
0049's action and a hint here.

**OQ-4 — Does the list need pagination, search or filters? Non-blocking; backlog.** Consistent with
0044 **D-8**, 0047 **D-11** and both shipped list screens: none in this cut. **The order book is the
one list in this app that genuinely grows without bound**, though, so its trigger will arrive first —
and 0045's [backlog item 2](0045-orders-core-crud-backend.md) already ties its index decisions to
"what story 0055's list actually filters on". Revisit on a real volume signal, deciding the index and
the filter together.

### Technical tasks for the backlog

Derived from this story, none of them in scope:

1. **Replace the interim product picker with story [0022](done/0022-searchable-multi-select-component.md)'s
   shared searchable multi-select** (**D-1**), applying the recorded acceptance-criterion replacement
   verbatim and removing `productOptions()`, `variantOptions()` and the product select's
   `wire:model.live` binding in the same change.
2. **An order-creation form** (**D-13**), which is where **OQ-1**'s resolution trigger would naturally
   live — and which needs backlog item 1 to have landed first, since it needs the same picker.
3. **Link each order row on 0047's customer order history to `orders.show`** — 0047's own backlog item
   1, unblocked by this story (**D-14**). One `href` and one `data-test` hook against 0047's file.
4. **Add the customer link if 0047 lands after this story** (see the 0047 dependency note).
5. **A per-refund event history on the detail page** (**OQ-2**), including a decision on disclosing
   `refunded_by`.
6. **Pagination, search and filters on the order book** (**OQ-4**), decided together with 0045's
   deferred indexing item.
7. **A manual-review workflow** — how an administrator clears `flagged_for_review`, and whether clearing
   it re-triggers resolution. 0054's backlog item 4 already names it; this screen is what makes it
   visibly missing.

## Provenance

- **PRD source:** [§3.2 Orders](../../docs/PRD/PRD.md#32-orders) — this story is the **UI half** of that
  section in its entirety: the order list and detail/editor the Epic 3 preamble asks for ("the same list
  + detail/editor visual patterns established in Users and Products"), the line-item editing scenarios
  and their hard block, the status-transition and backward-confirmation scenarios, the manual
  cancellation scenarios and their guarded states, the refund scenarios and the *"the refund action does
  not render"* half of the defence-in-depth acceptance criterion, and the visible surface of the tax
  Sales-Region resolution and its manual-review flag. Every backend rule those scenarios describe is
  owned by stories 0045 and 0048–0054; this story's Gherkin deliberately restates none of them and
  asserts only their **UI manifestation** — visible, hidden, disabled, or rendered as an error.
- **Process:** [workflow.md](../../docs/workflow.md) Phase 1 — Three Amigos debate. Contributions from
  `frontend-expert` (the two-route/two-component split and its justification, the route file and its
  ordering constraint, both public surfaces, the list columns, the detail's five sections, the
  per-control hint derivation across three abilities, and two open questions) and `frontend-qa` (the
  eight test groups, the hard-block no-confirmation assertion named as the highest-value test, the
  refund DOM-absence case, the cross-dimension cancellation dataset, the per-control authorization
  dataset, the Super-Admin false-negative warning, and the file-splitting recommendation). Composed by
  `product-owner` as facilitator. `database-expert` was **not** convened — this story adds no schema,
  migration, index or query design.
- **Decisions resolved by the facilitator:** **D-1** resolves the product-picker gap by adopting the
  interim and recording the exact replacement wording; **D-2** resolves the confirmation-dialog question
  in favour of a shared anonymous component while flagging it as a reviewable judgment call; **D-3**
  adopts `frontend-qa`'s file split as the shipped Definition of Done shape; **D-4** declines to take a
  sibling-editing refactor unilaterally and hands it to `code-reviewer` with two costed shapes; **D-9**
  and **D-11** refine `frontend-expert`'s proposals to consume predicates sibling stories built for this
  exact consumer rather than re-deriving or catch-and-retrying; **D-5** through **D-8**, **D-10** and
  **D-12** through **D-16** resolve shape, ordering and rendering questions the contributions raised but
  did not settle. **R-6** and **OQ-1** recorded an unresolved *backend* inconsistency this screen makes
  visible, escalated rather than papered over — **and the escalation worked**: 0053 adopted decision
  **D-13** in response, closing **R-6** entirely and the `tax_amount` half of **OQ-1**, with **no change
  to this story**. The trigger half of **OQ-1** remains open and remains a backend question.
- **Gherkin conventions:** every scenario opens with a named business-role actor ("an order
  administrator", "a signed-in administrator", "a signed-out visitor") and carries exactly one `When`,
  per [gherkin-guidelines.md](../../docs/testing/frontend/gherkin-guidelines.md) rules 1 and 3 —
  mandatory across all Gherkin in this project, per the incident recorded in
  [errors-log.md](../../docs/errors-log.md).
- **Stage:** `new`, and **blocked** — see the banner under [Description](#description). It moves to
  `ai-spec/tasks/in-progress/` at the start of Phase 3 and to `ai-spec/tasks/done/` at Phase 7 — the
  first move changes this file's directory depth, so every relative link above must be re-resolved on
  each move, in **both** directions, per
  [workflow.md](../../docs/workflow.md#link-integrity-check-on-every-stage-move). **This file carries
  more inbound-link targets than any other in the epic** (eight sibling task files plus 0022 and 0047),
  so Direction 2 of that check is unusually load-bearing here.
- **Epic 3 decomposition:** story **15 of 15** — the last, and the only one that consumes rather than
  produces. Hard dependencies on 0045, 0047, 0048, 0049, 0050, 0051, 0052 (transitively via 0051), 0053
  and 0054; ⛔ blocked transitively through 0045 on Epic 2 stories 0024, 0029, 0035, 0036 and 0038; and
  a documented **soft** dependency on Epic 2's pending [0022](done/0022-searchable-multi-select-component.md),
  worked around per **D-1** rather than waited on.
