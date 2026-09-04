# [0048] Order line-item editing backend

## Description
Make an **open** order's line items editable from the backend, per PRD
[§3.2 Orders](../../docs/PRD/PRD.md#32-orders): an administrator may add a line item, remove one, or
change one's quantity, and **the order's totals recalculate accordingly**. Editing is **hard-blocked**
once the order is `Enviado` or `Entregado`, with no confirmation path around it. This story owns three
single-purpose actions, one domain exception, and the recalculation rule — reusing story
[0045](0045-orders-core-crud-backend.md)'s schema **entirely**. No new column, no migration, no route,
no Livewire component, no Blade markup, no status transition, no refund, no tax resolution.

> ## ⛔ BLOCKED — inherited cross-epic dependency (read this before Phase 3)
>
> **This story is fully specified now, but its Phase 3 implementation cannot start until story
> [0045](0045-orders-core-crud-backend.md) is `done` — and 0045 is itself blocked on five PRD Epic 2
> stories:** [0024](done/0024-products-core-crud-backend.md) (Products),
> [0029](done/0029-product-variants-backend.md) (Product Variants),
> [0035](0035-shipping-carriers-backend.md) (Shipping Carriers),
> [0036](0036-shipping-rate-rules-backend.md) (Shipping Rates) and
> [0038](0038-payment-methods-bank-transfer-backend.md) (Payment Methods).
>
> This story writes to `orders` and `order_items`, resolves a **live product/variant** when a line item
> is added, and reads `orders.status` — none of which exist in code. **The block is inherited whole
> from 0045's [DR-1](0045-orders-core-crud-backend.md#dr-1--resolved-disagreement--fk-sequencing-vs-unconstrained-placeholder-columns);
> this story does not re-open that decision and must not work around it** by stubbing a table, a
> factory, or a column.
>
> **What is *not* blocked:** this document. Specifying it now is what keeps 0045's schema honest — the
> `refunded_quantity` column, the `unit_price` snapshot and the two status enums all exist so that a
> story like this one can be written against them.

> ## ⚠️ This story does **not** depend on 0049 (status transitions) — they are independent siblings
>
> Both stories are *adjacent to* `orders.status`, and the resemblance is superficial enough to invite a
> sequencing assumption nobody intended. State it plainly:
>
> - **0049 (status transitions)** *writes* `orders.status` and owns which transition is permitted, the
>   backward-transition confirmation, and the manual-cancellation guards.
> - **0048 (this story)** never writes `orders.status` at all. It **reads** it, once, as an input to a
>   hard block — the same way a validator reads a column without owning it.
>
> Neither is a precondition for the other. **Both depend only on 0045**, and they may be implemented in
> either order, in parallel, or by different people. The one real interaction is a *test* concern, not a
> dependency: 0049 introduces a confirmation mechanism for backward transitions, and this story's
> "no confirmation bypass exists" test asserts that mechanism — whatever shape it takes — does **not**
> unlock a shipped order's line items. That test is written here and is satisfiable whether 0049 has
> landed or not (see [**T-B**](#the-no-confirmation-bypass-test-and-why-it-is-written-here)).

## Type
backend | includes database-expert: **no**

### Three Amigos participants

- `backend-expert` — the three-action shape, the recalculation rule, the hard-block guard's placement
  and its refusal mechanism, the tax coupling.
- `backend-qa` — risk-based test design, the price-snapshot regression case, the both-statuses dataset,
  and the "no confirmation bypass exists" test.
- `database-expert` — **not convened.** This story reuses story
  [0045](0045-orders-core-crud-backend.md)'s `orders` / `order_items` schema column-for-column: no new
  column, no migration, no index, no FK, no seeder. `refunded_quantity` — the one column 0045 shipped
  inert for a later story — stays inert here too; it is 0051/0052's, not this story's (see
  [scope fences](#scope-fences-what-this-story-must-not-do)).

### Why this is one story and not three

Add, remove and change-quantity are three separate actions in three separate files (**D-3**), but they
are **one story** because they share a single invariant: *after any line-item write, the order's stored
totals equal the sum of its line items, and the historical unit prices are untouched*. Splitting them
would mean specifying that invariant three times and testing it three times against three different
definitions of "recalculate" — which is precisely the drift this project's conventions exist to
prevent. The hard block (**D-5**) is likewise one rule with three call sites, not three rules.

## Gherkin

```gherkin
Feature: Order line-item editing (backend)

  # --- Editing an open order's line items (PRD §3.2 Scenario Outline) ---

  Scenario: Add a line item to a pending order
    Given an order administrator, with an order in "Pendiente" and an existing product
    When they add a line item for that product to the order
    Then the order holds the additional line item and its totals reflect it

  Scenario: Add a line item to a processing order
    Given an order administrator, with an order in "Procesando" and an existing product
    When they add a line item for that product to the order
    Then the order holds the additional line item and its totals reflect it

  Scenario: Remove a line item from a pending order
    Given an order administrator, with an order in "Pendiente" carrying two line items
    When they remove one of those line items
    Then the order holds only the remaining line item and its totals reflect it

  Scenario: Remove a line item from a processing order
    Given an order administrator, with an order in "Procesando" carrying two line items
    When they remove one of those line items
    Then the order holds only the remaining line item and its totals reflect it

  Scenario: Change a line item's quantity on a pending order
    Given an order administrator, with an order in "Pendiente" whose line item has a quantity of one
    When they change that line item's quantity to three
    Then the line item records a quantity of three and the order's totals reflect it

  Scenario: Change a line item's quantity on a processing order
    Given an order administrator, with an order in "Procesando" whose line item has a quantity of one
    When they change that line item's quantity to three
    Then the line item records a quantity of three and the order's totals reflect it

  # --- Recalculation ---

  Scenario: A line item's total follows its new quantity
    Given an order administrator, with an order whose line item is priced at 10.00 for one unit
    When they change that line item's quantity to three
    Then the line item records a line total of 30.00

  Scenario: The order's subtotal is the sum of its line items
    Given an order administrator, with an order in "Pendiente" carrying one line item worth 10.00
    When they add a second line item worth 25.00
    Then the order records a subtotal of 35.00

  Scenario: Removing a line item lowers the order's subtotal by that line's total
    Given an order administrator, with an order carrying line items worth 10.00 and 25.00
    When they remove the line item worth 25.00
    Then the order records a subtotal of 10.00

  # --- The price at the time of order survives every edit ---

  Scenario: Changing a quantity does not re-price the line item
    Given an order administrator, with an order whose line item was priced at 10.00, and whose
      product's catalog price has since changed to 25.00
    When they change that line item's quantity to two
    Then the line item still records a unit price of 10.00

  Scenario: A newly added line item is priced from the live catalog
    Given an order administrator, with an order in "Pendiente" and a product priced at 25.00
    When they add a line item for that product to the order
    Then the new line item records a unit price of 25.00

  Scenario: A newly added line item's price is frozen from the moment it is added
    Given an order administrator, with an order carrying a line item added while its product
      was priced at 25.00
    When that product's catalog price is subsequently changed to 40.00
    Then the added line item still records a unit price of 25.00

  Scenario: A newly added line item records the product's name and code as they stand
    Given an order administrator, with an order in "Pendiente" and an existing product
    When they add a line item for that product to the order
    Then the new line item records that product's name and code alongside its reference

  # --- The hard block (PRD §3.2) ---

  Scenario: Adding a line item to a shipped order is blocked
    Given an order administrator, with an order in "Enviado"
    When they attempt to add a line item to it
    Then the attempt is blocked and the order's line items are unchanged

  Scenario: Removing a line item from a shipped order is blocked
    Given an order administrator, with an order in "Enviado"
    When they attempt to remove one of its line items
    Then the attempt is blocked and the order's line items are unchanged

  Scenario: Changing a line item's quantity on a shipped order is blocked
    Given an order administrator, with an order in "Enviado"
    When they attempt to change one of its line items' quantities
    Then the attempt is blocked and the order's line items are unchanged

  Scenario: Adding a line item to a delivered order is blocked
    Given an order administrator, with an order in "Entregado"
    When they attempt to add a line item to it
    Then the attempt is blocked and the order's line items are unchanged

  Scenario: Removing a line item from a delivered order is blocked
    Given an order administrator, with an order in "Entregado"
    When they attempt to remove one of its line items
    Then the attempt is blocked and the order's line items are unchanged

  Scenario: Changing a line item's quantity on a delivered order is blocked
    Given an order administrator, with an order in "Entregado"
    When they attempt to change one of its line items' quantities
    Then the attempt is blocked and the order's line items are unchanged

  Scenario: The block on a shipped order offers no confirmation path around it
    Given an order administrator, with an order in "Enviado"
    When they attempt to edit its line items having confirmed the action in every way the
      application otherwise accepts a confirmation
    Then the attempt is still blocked

  Scenario: A Super Admin is also blocked from editing a shipped order's line items
    Given a Super Admin, with an order in "Enviado"
    When they attempt to edit its line items
    Then the attempt is blocked, the block being a property of the order rather than of the actor

  # --- Rejecting an invalid edit ---

  Scenario: Removing the only remaining line item is rejected
    Given an order administrator, with an order in "Pendiente" carrying exactly one line item
    When they attempt to remove that line item
    Then the removal is rejected with a validation message and the line item remains

  Scenario: A quantity of zero is rejected
    Given an order administrator, with an order in "Pendiente" carrying a line item
    When they attempt to change that line item's quantity to zero
    Then the change is rejected with a validation message and the quantity is unchanged

  Scenario: A negative quantity is rejected
    Given an order administrator, with an order in "Pendiente" carrying a line item
    When they attempt to change that line item's quantity to a negative number
    Then the change is rejected with a validation message and the quantity is unchanged

  Scenario: Adding a line item with a quantity of zero is rejected
    Given an order administrator, with an order in "Pendiente" and an existing product
    When they attempt to add a line item for that product with a quantity of zero
    Then the addition is rejected with a validation message and no line item is stored

  Scenario: Adding a line item for an unknown product is rejected
    Given an order administrator, with an order in "Pendiente"
    When they attempt to add a line item naming a product that does not exist
    Then the addition is rejected with a validation message and no line item is stored

  Scenario: Removing a line item that belongs to a different order is rejected
    Given an order administrator, with two orders each carrying their own line items
    When they attempt to remove the second order's line item from the first order
    Then the attempt is rejected and neither order's line items change

  Scenario: A rejected edit leaves the order's totals untouched
    Given an order administrator, with an order in "Pendiente" carrying one line item
    When they attempt an edit that is rejected
    Then the order's stored subtotal and total are exactly what they were before

  # --- Tax recalculation coupling ---

  Scenario: An order with a resolved tax rate has its tax recomputed on a line-item edit
    Given an order administrator, with an order in "Pendiente" whose tax rate is already resolved
    When they change a line item's quantity
    Then the order's tax amount is recomputed from its new subtotal at that same rate

  Scenario: An order with no resolved tax rate has no tax invented for it
    Given an order administrator, with an order in "Pendiente" whose tax rate is unresolved
    When they change a line item's quantity
    Then the order's tax amount stays at zero and no sales region is resolved

  # --- Authorization ---

  Scenario: An administrator without the orders edit permission cannot add a line item
    Given a signed-in administrator whose role does not grant the orders edit permission
    When they attempt to add a line item to an order in "Pendiente"
    Then the attempt is refused and the order's line items are unchanged

  Scenario: An administrator without the orders edit permission cannot remove a line item
    Given a signed-in administrator whose role does not grant the orders edit permission
    When they attempt to remove a line item from an order in "Pendiente"
    Then the attempt is refused and the order's line items are unchanged

  Scenario: An administrator without the orders edit permission cannot change a quantity
    Given a signed-in administrator whose role does not grant the orders edit permission
    When they attempt to change a line item's quantity on an order in "Pendiente"
    Then the attempt is refused and the line item's quantity is unchanged

  Scenario: An administrator holding the orders edit permission can edit an open order
    Given a signed-in administrator whose role grants the orders edit permission
    When they change a line item's quantity on an order in "Pendiente"
    Then the change is applied

  Scenario: A Super Admin may edit an open order without holding the permission explicitly
    Given a Super Admin holding no individual orders permission
    When they change a line item's quantity on an order in "Pendiente"
    Then the change is applied
```

## Files to create/modify

### Exception — `app/Exceptions/OrderNotEditableException.php` (new)

The hard block's refusal. Follows [`RoleInUseException`](../../app/Exceptions/RoleInUseException.php)
exactly — a `RuntimeException` subclass with a `render()` method returning **409 Conflict**, both a
`JsonResponse` and a plain `Response` branch. `App\Exceptions\` is a stock Laravel location
([base-standards.md](../../docs/conventions/base-standards.md#directory-structure)), and this becomes
the repo's **fourth** response-rendering domain exception beside `ImmutableRoleException` (403),
`RoleInUseException` (409) and `PasswordConfirmationRequiredException` (423).

**409, not 403** — and the distinction is the same one `RoleInUseException`'s own docblock draws: the
request is well-formed and the actor **is** authorized; the *order* simply cannot be edited in its
current state. A 403 would be indistinguishable from "you lack `orders.edit`", which is a different
problem with a different fix. See **D-5** for why it is a direct throw rather than a `Gate` ability.

The thrown message is a **constant**, never interpolated with the order's id, number or status — the
same rule story 0015a's `PasswordConfirmationRequiredException` established
([security/step-up-authentication.md](../../docs/security/step-up-authentication.md)).

### Validation trait — `app/Concerns/OrderValidationRules.php` (**extend**, do not create)

Story [0045](0045-orders-core-crud-backend.md) creates this trait; this story appends to it rather than
introducing a second one — `<Noun>ValidationRules` is named after the model whose input it describes,
not after the screen or the action that submits it
([naming.md](../../docs/conventions/naming.md#traits-and-their-methods)). Three additions:

```php
protected function orderItemQuantityRules(): array;   // ['required','integer','min:1']
protected function orderItemProductRules(): array;    // adding: product exists, optional variant
protected function orderItemOwnershipRules(string $orderId): array;  // the item belongs to THIS order
```

- `orderItemQuantityRules()` is very likely **already present** (0045's `orderItemRules()` contains the
  identical `['required','integer','min:1']`). **Phase 3 must extract rather than duplicate:** if 0045
  shipped the quantity rule inline inside `orderItemRules()`, pull it out into its own method and have
  `orderItemRules()` call it. Two implementations of one rule is the drift
  [code-style.md](../../docs/conventions/code-style.md#centralize-shared-validation-in-traits) exists to
  prevent, and here the two would diverge silently — the create path would keep rejecting `0` while the
  edit path stopped.
- `orderItemOwnershipRules()` is what makes the cross-order scenario a **validation** failure rather
  than a 404 or a silent no-op: `Rule::exists('order_items', 'id')->where('order_id', $orderId)`. It is
  a correctness rule, not a nicety — without it, `RemoveOrderItem($order, $itemId)` deletes a row that
  belongs to somebody else's order and then recalculates the **wrong** order's totals, leaving two
  orders corrupt from one call.

### Action — `app/Actions/Orders/AddOrderItem.php` (new)

Invokable, imperative verb phrase, no `Action` suffix, **resolved from the container and never
`new`-ed** ([code-style.md](../../docs/conventions/code-style.md#exception-an-actions-own-dependency-is-constructor-injected-when-the-method-signature-is-a-public-contract)).
`__invoke(Order $order, string $productId, ?string $productVariantId, int $quantity): OrderItem`,
performing **in this order** (the ordering is part of the guard, not an implementation detail — see
[errors-log.md](../../docs/errors-log.md#two-of-the-three-security-audit-rounds-found-the-flaw-in-the-previous-rounds-fix--2026-08-19)):

1. **`$order->refresh()` / `$order->load('items')`** — read the state every later step decides on, from
   the database, before the first check reads it. A caller may hand over a stale instance.
2. **`Gate::authorize('orders.edit')`** as the first *check*. The permission refusal always wins over
   the state refusal (**D-6**).
3. **The hard-block guard** — a direct `throw new OrderNotEditableException(...)` when
   `$order->status` is `Shipped` or `Delivered` (**D-5**).
4. **Validate** through the trait: the product exists, the variant (when given) exists and belongs to
   that product, the quantity is `>= 1`.
5. **Resolve the catalog row from the database** and derive `unit_price`, `product_name`,
   `product_sku` from it. The caller supplies an *id* and a *quantity*; it never supplies a price, a
   name or a SKU (**D-4**). This is 0045's single sharpest rule, and it binds here identically.
6. **`DB::transaction()`**: insert the `order_items` row, then recompute and persist the parent's
   `subtotal` / `tax_amount` / `total` (**D-7**, **D-8**).

### Action — `app/Actions/Orders/RemoveOrderItem.php` (new)

`__invoke(Order $order, string $orderItemId): void`. Same six-step order, with steps 4–6 differing:

4. **Validate**: the item exists **and belongs to `$order`** (`orderItemOwnershipRules()`), **and the
   order would not be left with zero line items** (**D-1** — a `ValidationException`, not a silent
   refusal and not a 409).
5. No catalog resolution — nothing is snapshotted on a removal.
6. **`DB::transaction()`**: delete the row through the **model instance**
   (`$item->delete()`, never `OrderItem::where(...)->delete()`, per
   [base-standards.md](../../docs/conventions/base-standards.md#deleting-a-user-goes-through-the-model-not-the-query-builder)),
   then recompute and persist the parent's totals.

### Action — `app/Actions/Orders/UpdateOrderItemQuantity.php` (new)

`__invoke(Order $order, string $orderItemId, int $quantity): OrderItem`. Same six-step order:

4. **Validate**: the item belongs to `$order`; the quantity is `>= 1`.
5. **No catalog read whatsoever.** This is the story's highest-risk line and it is a *negative*
   instruction: the new `line_total` is `$item->unit_price * $quantity`, using the **existing**
   `unit_price` column. **Never** `$item->product->price`, never a re-resolution, never a "refresh the
   snapshot while we're here" (**D-4**, **R-1**).
6. **`DB::transaction()`**: write `quantity` and `line_total`, then recompute and persist the parent's
   totals.

> **`app/Actions/Orders/` is 0045's folder, created by `CreateOrder`.** This story adds three classes to
> it; it does not create a new area. One subfolder per domain, per
> [base-standards.md](../../docs/conventions/base-standards.md#directory-structure).

### Why three actions and not one `UpdateOrderItems($order, array $diff)`

`backend-expert` raised and rejected the god-action shape explicitly, and it is worth recording because
it is the obvious first instinct for a screen that will eventually submit a whole edited line-item
table at once:

| | Three single-purpose actions **(adopted)** | One diff-taking action (rejected) |
| --- | --- | --- |
| Catalog resolution | Lives in **one** place (`AddOrderItem`), because only an addition resolves the catalog | Lives in a branch inside a loop, alongside two operations that must **not** touch the catalog — one refactor away from re-pricing an existing line |
| Validation | Each operation validates exactly its own payload shape | One rule array covering three mutually exclusive shapes, most fields conditionally required |
| The hard block | One guard, three call sites, each testable in isolation | One guard, and a diff containing a blocked-in-principle operation alongside an allowed one has no obvious semantics |
| Naming | Imperative verb phrase per operation, matching every action in this repo | A noun-ish "apply this diff", matching none |

The trade this accepts is real and is accepted knowingly: a future screen editing several lines at once
issues several calls, so **the totals are recomputed once per call rather than once per submission**.
That is arithmetic over a handful of rows inside a transaction, and the correctness of "the stored
subtotal always equals the sum of the line items" is worth more than the saved statements. If a future
story genuinely needs one atomic multi-line edit, the right shape is a thin orchestrator wrapping these
three in a single transaction — **not** merging them.

### Explicitly **not** touched by this story

- `database/migrations/**` — **no migration at all.** Every column this story writes ships with 0045.
- `database/seeders/RolePermissionSeeder.php` — `orders.edit` is already seeded (**D-2**).
- `routes/*.php`, `config/modules.php`, `app/Livewire/**`, `resources/views/**` — story 0055's.
- `app/Policies/OrderPolicy.php` — **not created here**, see **D-2** and **D-9**.
- `app/Enums/OrderStatus.php`, `app/Enums/PaymentStatus.php` — read, never modified, and **no transition
  logic is added to either** (0049).
- `app/Actions/Orders/CreateOrder.php` — untouched. This story adds actions beside it; it does not
  refactor it. The one exception is the trait extraction named above, which changes
  `OrderValidationRules` rather than `CreateOrder`.
- `orders.status`, `orders.payment_status`, `order_items.refunded_quantity` — read (`status` only),
  never written.
- `lang/{en,es}/orders.php` — **one** new key group for the exception's message; no screen copy.

## Tests to perform

All Feature tests unless marked otherwise, in `tests/Feature/Orders/`. This story ships no route, so
**every** authorization test here is action-level; story 0055 owns the HTTP-level ones
([testing/README.md](../../docs/testing/README.md)).

> **Every money assertion is a decimal-**string** comparison.** `decimal(10,2)` casts to a string in
> Eloquent; `toBe(35.00)` fails confusingly and `toEqual(35.0)` passes for the wrong reason (0045's
> **R-3**, inherited unchanged).

### Recalculation — happy paths, both open statuses

- [ ] Integration test (**dataset over `Pendiente` and `Procesando`**): adding a line item persists the
      new `order_items` row and the parent's `subtotal` equals the sum of all line totals.
- [ ] Integration test (**same dataset**): removing a line item deletes the row and lowers `subtotal` by
      exactly that line's `line_total`.
- [ ] Integration test (**same dataset**): changing a quantity writes the new `quantity`, sets
      `line_total = unit_price × quantity`, and moves `subtotal` accordingly.
- [ ] Integration test: `total` equals `subtotal + tax_amount + shipping_amount` after every one of the
      three operations — asserted as the identity, not as `total === subtotal`, so it stays true once
      0053/0054/0037 populate the other terms (0045 **D-8**).

> **The `Procesando` half of each dataset is not padding.** PRD §3.2's Scenario Outline says
> *"an order in `Pendiente` **or** `Procesando`"*, and an implementation that hard-codes the block as
> "anything but `Pendiente`" passes every `Pendiente` test in this file. `backend-qa` called this out
> specifically: the dataset is what makes the "or" executable.

### The price snapshot — the highest-risk case

- [ ] **Dedicated regression test, not folded into a happy path:** create an order whose line item is
      priced at `10.00`; mutate the **product's** catalog price to `25.00` and save it; change the line
      item's quantity to `2`; re-fetch the **order item** from the database (`->fresh()`, never the
      in-memory instance) and assert `unit_price` is still `10.00` and `line_total` is `20.00`.
      **This is the single test that distinguishes a correct implementation from one that "refreshes"
      the snapshot while it has the product in hand**, and the failure is invisible until a price moves.
- [ ] Integration test: the same regression for `product_name` and `product_sku` — rename the product,
      change the quantity, assert the line item still carries the old name and code.
- [ ] Integration test: a **newly added** line item snapshots the product's *current* price, name and
      SKU at add-time (the positive half — without it, an implementation that never resolves the catalog
      at all passes the regression test above).
- [ ] Integration test: a newly added line item's snapshot is then **immutable** — change the product's
      price after the add, re-fetch, assert the added item is unmoved. This is what makes "its own
      snapshot from then on" (**D-4**) executable rather than prose.
- [ ] Integration test: adding a line item to an order **does not** re-price any of the order's
      pre-existing line items. Nothing in the implementation should touch them, and this test is what
      proves a recalculation loop iterating every item did not helpfully "update" them all.

### The hard block

- [ ] **Negative test (dataset: 3 operations × 2 statuses = 6 cases):** `AddOrderItem`,
      `RemoveOrderItem` and `UpdateOrderItemQuantity` each throw `OrderNotEditableException` against an
      order in `Enviado` and against one in `Entregado`, and **the order's line items and totals are
      byte-identical afterwards**. Asserting only the exception would pass against an implementation
      that writes first and throws second.
- [ ] Integration test: the exception renders **409**, not 403 — asserted through `render()` directly,
      since this story has no route.
- [ ] Negative test: a **Super Admin** is refused identically for all three operations. This is the test
      that proves the block is a direct throw rather than a `Gate` ability — a `Gate`-mediated check is
      inert for this actor via `Gate::before`
      ([security/authorization-patterns.md](../../docs/security/authorization-patterns.md#a-rule-that-must-bind-a-super-admin-actor-must-be-a-direct-throw-not-a-gate-check)),
      and every other authorization test in this file would still pass while the block was open.
- [ ] Integration test (positive control): the same three operations **succeed** against `Pendiente` and
      `Procesando`. Without it, a guard that blocks *everything* passes every negative case above.

#### The "no confirmation bypass" test — and why it is written here

- [ ] **Negative test — `T-B`:** attempt each of the three operations against an `Enviado` order **with
      whatever confirmation mechanism sibling story 0049 uses**, and assert the refusal is unchanged.

  PRD §3.2 states the block is *"always blocked, with no confirmation path around it"* — sitting three
  scenarios away from *"moving an order's status backward requires explicit confirmation"*. Two rules
  about the same order, one requiring a confirmation and one that must **ignore** every confirmation,
  specified adjacently. `backend-qa` flagged the precise failure mode: if 0049 introduces shared
  confirmation plumbing (a `$confirmed` flag on a request, a session key, a component property) and
  someone later reaches for it here "for consistency", the block quietly acquires the escape hatch the
  PRD forbids — **and every other test in this file still passes**, because they none of them assert a
  confirmed attempt.

  **This test is satisfiable in both worlds, which is why it belongs to this story rather than to 0049.**
  If 0049 has landed, assert against its real mechanism. If it has not, the assertion is that **no
  parameter, flag or session key of any kind alters the refusal** — express it by calling each action
  with every argument it accepts and confirming the outcome is invariant, and record in the test's own
  comment that it must be revisited to name 0049's mechanism once that exists. A test whose whole job is
  to fail on a bypass must be written *before* the bypass is available to reach for.

### Validation failures

- [ ] **Negative test: removing the last remaining line item** → `ValidationException`, the item is
      still present, and the order's `subtotal` / `total` are unchanged (**D-1**).
- [ ] Integration test (the boundary from the other side): removing one of **two** line items succeeds.
      A rule asserted only from its refusing side cannot distinguish `count <= 1` from `count <= 2`.
- [ ] Negative test (dataset): quantity `0`, `-1`, `'abc'` → `ValidationException` on both
      `UpdateOrderItemQuantity` and `AddOrderItem`, with no row written or changed.
- [ ] Negative test: `AddOrderItem` naming a product that does not exist → `ValidationException`, no row
      written, totals unchanged.
- [ ] Negative test: `AddOrderItem` naming a variant that exists but belongs to a **different** product
      → `ValidationException`.
- [ ] **Negative test (cross-order):** `RemoveOrderItem($orderA, $itemBelongingToOrderB)` and
      `UpdateOrderItemQuantity($orderA, $itemBelongingToOrderB, 5)` are both refused, **and order B is
      untouched** — its item still exists, its quantity is unchanged, its totals are unchanged. Assert
      **both** orders, since the sharp failure here is silent corruption of the order the caller never
      named.
- [ ] **Negative test (atomicity):** an operation that fails *after* the transaction opens leaves
      **neither** the `order_items` rows **nor** the parent's totals modified. Assert both tables, per
      0045's own atomicity precedent.

### Tax recalculation coupling

- [ ] Integration test: an order whose `tax_rate` is **non-null** has `tax_amount` recomputed as
      `subtotal × tax_rate` after each of the three operations (**D-8**).
- [ ] Integration test: an order whose `tax_rate` is **`NULL`** keeps `tax_amount` at `0.00` after each
      of the three operations, and its `sales_region_id` stays `NULL`. **The negative half is the
      point**: this story must not resolve a sales region, and a test asserting only "tax was computed"
      would pass against an implementation that helpfully resolved one (**R-2**).
- [ ] Integration test: `tax_rate` itself is **never written** by any of the three actions — assert it
      is unchanged, including on an order that already has one.

### Authorization

- [ ] Negative test (dataset over the three actions): an administrator holding `orders.view` but **not**
      `orders.edit` is refused with an `AuthorizationException`, and **nothing is written**.
- [ ] Integration test (dataset over the three actions): an administrator holding `orders.edit`
      succeeds — the positive case beside the 403, without which a mistyped ability passes silently
      ([authorization.md](../../docs/architecture/authorization.md)).
- [ ] Integration test: a Super Admin holding no individual `orders.*` grant succeeds against an **open**
      order, via `Gate::before` — the counterpart to the Super-Admin-is-still-blocked test above. **The
      pair together is the specification:** the Super Admin bypasses the *authorization* layer and does
      not bypass the *state* layer, and neither test means anything without the other.
- [ ] Negative test: the ability string is asserted **literally** (`orders.edit`) against
      `RolePermissionSeeder`'s catalog, so a typo cannot fail closed unnoticed.
- [ ] Negative test: **no new permission exists.** Assert the seeded catalog's size and contents are
      exactly what they were — the executable form of **D-2**.

### Ordering — the permission refusal wins

- [ ] Negative test: an actor lacking `orders.edit`, acting on an **`Enviado`** order, receives the
      **`AuthorizationException`** — not `OrderNotEditableException`. Both refusals apply; the
      authorization one must come first, exactly as story 0015a's step-up layer runs strictly after
      every `Gate::authorize()` on its branch
      ([architecture/authorization.md](../../docs/architecture/authorization.md#step-up-authentication--the-third-layer)).
      A 409 here would disclose the order's state to somebody with no permission to read it (**D-6**).

### Deliberately not tested

- Any status **transition**, backward-transition confirmation, or manual cancellation (0049/0050).
- Any refund, and anything reading or writing `refunded_quantity` (0051/0052).
- Any sales-region resolution or `flagged_for_review` behaviour (0053/0054).
- Shipping-rate selection or `shipping_amount` (0037/0054).
- Anything rendered (0055).
- Schema shape — no migration ships here; `orders` / `order_items` column assertions belong to 0045.

## Expected outcome

Once done, an administrator holding `orders.edit` can add a line item to an open order, remove one, or
change one's quantity, and the order's stored `subtotal`, `tax_amount` and `total` are correct
immediately afterwards, computed inside the same transaction as the line-item write. A **newly added**
line item takes its `unit_price`, `product_name` and `product_sku` from the live catalog at the moment
it is added and never moves again; an **existing** line item's `unit_price` is never re-read from the
catalog under any circumstance, so changing a quantity re-multiplies the historical price rather than
re-discovering the current one. Removing an order's **only** line item is refused with a validation
error.

Once an order reaches `Enviado` or `Entregado`, all three operations are refused with a **409** by a
guard that lives in each action, binds a Super Admin exactly as it binds anyone else, and has no
parameter, flag or confirmation that unlocks it.

**Nothing changes that this story does not own:** no order's `status` or `payment_status` moves, no
sales region is resolved, no `tax_rate` is written, `refunded_quantity` is neither read nor written, no
column is added, no route or screen exists, and the permission catalog is byte-identical to what 0045
found.

## Acceptance criteria

- [ ] `app/Actions/Orders/AddOrderItem.php`, `RemoveOrderItem.php` and `UpdateOrderItemQuantity.php`
      exist as three separate invokable actions in the folder 0045 created — **no** single action taking
      a diff array.
- [ ] Each of the three performs, in this order: reload the order's state → `Gate::authorize('orders.edit')`
      → the hard-block guard → validation → (for an add only) catalog resolution → a `DB::transaction()`
      containing both the line-item write and the parent's total recomputation.
- [ ] `App\Exceptions\OrderNotEditableException` exists, subclasses `RuntimeException`, renders **409**
      in both the JSON and non-JSON branch, and carries a **constant** message naming no order.
- [ ] The hard block is a **direct `throw`**, not a `Gate` ability and not an `OrderPolicy` method, and
      is proven by test to bind a **Super Admin**.
- [ ] `UpdateOrderItemQuantity` reads `order_items.unit_price` and **never** the product's live price —
      pinned by a mutate-the-catalog-then-edit regression test.
- [ ] `AddOrderItem` derives `unit_price`, `product_name` and `product_sku` from the freshly-read
      catalog row, and never from anything the caller passed.
- [ ] After any successful operation, `orders.subtotal` equals the sum of that order's
      `order_items.line_total`, and `orders.total` equals `subtotal + tax_amount + shipping_amount`.
- [ ] `tax_amount` is recomputed as `subtotal × tax_rate` when `tax_rate` is non-null, and left at
      `0.00` when it is `NULL`; `tax_rate` and `sales_region_id` are never written by this story.
- [ ] Removing an order's last remaining line item raises a `ValidationException`, leaves the item in
      place, and leaves the order's totals unchanged (**D-1**).
- [ ] A line item that does not belong to the order named in the call is refused, and the order it
      *does* belong to is unmodified.
- [ ] The permission is **`orders.edit`**, already seeded — `RolePermissionSeeder` is unchanged and the
      catalog's contents are asserted unchanged (**D-2**).
- [ ] No migration, no column, no index, no seeder change, no route, no Livewire component, no Blade
      view, no policy, no notification and no listener is added.
- [ ] `App\Enums\OrderStatus` and `App\Enums\PaymentStatus` are unchanged, and no code in this story
      writes `orders.status` or `orders.payment_status`.
- [ ] The quantity rule exists in **one** place in `App\Concerns\OrderValidationRules` and is shared with
      0045's creation path rather than duplicated.

## Definition of Done
- [ ] Tests written and green, plus the full existing suite (per
      [contracts.md](../../docs/contracts.md)'s Full Test Suite Gate Rule) — run **unscoped**
      (`php artisan test`, not `--filter`), per
      [base-standards.md](../../docs/conventions/base-standards.md#steps-1-and-2-are-the-iteration-forms-run-both-unscoped-before-declaring-the-work-done).
- [ ] `vendor/bin/pint --format agent` clean (unscoped, **not** `--dirty`) and Larastan level 7 passing.
- [ ] Code reviewed (code-reviewer).
- [ ] No security findings (appsec-auditor) — specifically: that no price, name, SKU or total can be
      supplied by a caller; that each action authorizes **before** its state guard and both before the
      first write; that the state guard cannot be bypassed by a Super Admin, by a parameter, or by any
      confirmation mechanism; and that a cross-order line-item id cannot mutate an order the caller
      never named.
- [ ] Documentation updated (docs-keeper):
  - [`architecture/authorization.md`](../../docs/architecture/authorization.md) — the **state-based
    refusal** as a distinct kind of guard from the three authorization layers already documented, with
    the ordering rule (permission first, state second) and why it is a direct throw. This is the
    reusable half; stories 0050/0051/0052 each add another one.
  - [`conventions/base-standards.md`](../../docs/conventions/base-standards.md) — the directory listing's
    `app/Actions/Orders/` entry gains the three actions, and `app/Exceptions/` gains
    `OrderNotEditableException → 409` beside its three siblings (an enumeration that becomes an
    **under-count** the moment this ships — the exact
    [bare-negative-claim](../../docs/errors-log.md#a-docs-this-app-has-no-x-yet-claim-outlived-the-x-by-two-tasks--2026-08-13)
    failure mode arriving as arithmetic).
  - [`database/schema.md`](../../docs/database/schema.md) — the `orders` / `order_items` sections gain a
    note that `subtotal` / `tax_amount` / `total` are **derived and re-derived** rather than
    write-once, and that `order_items.unit_price` is immutable after insert with this story as the
    proof. **No column, type or index changes.**
  - [`conventions/naming.md`](../../docs/conventions/naming.md) — verify only: the three action names and
    the exception name follow existing rules (imperative verb phrase, `<Thing>Exception`); list them,
    do not re-rule on them.
  - **Grep for bare negative claims this story falsifies** rather than trusting the change→doc mapping —
    in particular any statement that this app's only state-based refusal is `RoleInUseException`, and
    any "three domain exceptions" count.
- [ ] Acceptance criteria met.

## Documented functional decisions

Each resolves an open question raised during the debate. Every one is a **conservative, reversible
default the human may override** — the reasoning is recorded so an override is a decision rather than a
rediscovery.

- **D-1 — Removing an order's *last* remaining line item is rejected with a `ValidationException`.**
  *(Resolves `backend-qa`'s open question 1; `backend-qa` recommended rejecting and that recommendation
  is adopted.)* This is **symmetry with 0045's [D-5](0045-orders-core-crud-backend.md#documented-functional-decisions)**,
  and the symmetry is the argument: 0045 refuses to *create* an order with zero line items, for reasons
  that do not stop applying once the order exists.
  - **A zero-item order's tax basis is undefined.** Its `subtotal` is `0.00`, so stories 0053/0054 have
    nothing to resolve a rate against, and PRD §3.2's whole tax-resolution paragraph reads as a
    statement about an order that has line items.
  - **The 100%-refund auto-cancel rule is *vacuously true* for a zero-item order.** PRD §3.2: "when
    **every** line item becomes fully refunded, the order auto-transitions to `Cancelado`". Over an
    empty set, that is satisfied — so the moment this story allows a zero-item order, stories 0051/0052
    inherit an order that auto-cancels itself for no reason, from a rule they wrote correctly.
  - **The failure modes are asymmetric.** A refused removal is visible and immediately actionable ("this
    is the last line — cancel the order instead"). A zero-item order breaks four downstream assumptions
    silently.
  - **It is enforced in the action, not in the database**, for the same reason 0045 gives: no engine
    expresses "a parent must have at least one child" without a trigger.
  - **A `ValidationException` rather than the 409**, deliberately: `OrderNotEditableException` means
    *this order is closed to editing*, and this order is not — the specific edit is invalid. Conflating
    the two would make a "cancel the order instead" message impossible to write.
  - **Relaxing this later is a validation-only change** — no column moves, no exception changes — so the
    conservative direction is the cheap one. **The forward note:** if a product rule ever wants an empty
    open order, the right shape is almost certainly "removing the last line item cancels the order",
    which is a 0050 concern (manual cancellation), not a relaxation here.

- **D-2 — The permission is `orders.edit`, reused. No new sub-permission is created.**
  *(Resolves `backend-expert`'s open question 2.)* Line-item editing is a normal part of editing an open
  order — it is what "an order is fully editable from the backoffice" (PRD §3.2) *means* — and the
  seeded catalog already carries `orders.edit` via `RolePermissionSeeder::MODULES`. Four reasons, in
  order of weight:
  1. **Nothing here is disclosed or achieved beyond what `orders.edit` already implies.** This project
     does introduce stronger abilities than a screen's base one — `users.updateSensitiveAttributes`,
     `roles.manage-administrators` — but each exists because a *genuinely different* capability hid
     inside a broadly-named one (reading another user's pending email; granting a permission you do not
     hold). Changing a line item's quantity on an order you may already edit is not that case: an actor
     holding `orders.edit` can already change everything else about the order.
  2. **A permission that is granted to exactly the same set of roles as another permission is not a
     control, it is a maintenance burden** — one more row in the catalog, one more checkbox in story
     0011's matrix, and a new failure mode where a role holds `orders.edit` but not
     `orders.edit-line-items` and gets a refusal nobody can explain from the UI.
  3. **The real risk this story carries is a *state* risk, not a privilege risk**, and it is closed by
     **D-5**'s hard block — which a sub-permission would not have helped with, since the block must bind
     even a Super Admin.
  4. **Adding a permission later is cheap and non-breaking; removing one is not.** A new catalog entry
     starts held by nobody and is granted deliberately; withdrawing one silently narrows what existing
     roles can do.

  **Consequence to hold onto:** `AddOrderItem` / `RemoveOrderItem` / `UpdateOrderItemQuantity` and
  whatever story 0055 builds to edit an order's other fields authorize the **same** ability, so a role
  configured for "orders" behaves coherently. **The reversal path:** if a product rule ever separates
  them, it is a new catalog constant plus one changed `Gate::authorize()` argument per action — the
  ability's *location* (in the action, per
  [base-standards.md](../../docs/conventions/base-standards.md#an-authorization-rule-belongs-to-the-action-not-to-one-of-its-callers))
  does not move.

- **D-3 — Three single-purpose actions, not one diff-taking action.** *(`backend-expert`.)* The full
  comparison and the accepted trade are in
  [Why three actions](#why-three-actions-and-not-one-updateorderitemsorder-array-diff) above. The
  load-bearing half: **catalog resolution belongs to exactly one of the three operations**, and a shape
  that puts all three in one class puts the resolution one refactor away from the two operations that
  must never perform it.

- **D-4 — A quantity change re-multiplies the stored `unit_price`; only an *addition* resolves the live
  catalog.** *(`backend-expert`, and the story's central invariant.)* Story 0045's whole reason for
  existing is that `order_items.unit_price` is the price **at the time of order**; this story is the
  first code that could silently reopen it, because a quantity edit has both the item and its product in
  hand and "refreshing" the price while there looks tidy. Stated as three rules:
  - **`UpdateOrderItemQuantity` touches `quantity` and `line_total`, nothing else.**
    `line_total = unit_price × quantity`, reading the **column**.
  - **`AddOrderItem` resolves `unit_price` / `product_name` / `product_sku` from the live catalog at
    add-time**, and from that moment the new row is **its own immutable snapshot**, indistinguishable
    from one 0045 wrote. A line added today to an order placed last week carries today's price — which
    is correct, and is what "the price at the time of order" means for a line ordered today.
  - **No operation ever rewrites an existing row's snapshot columns.** Not on add, not on remove, not on
    quantity change, not "while we're recalculating".

- **D-5 — The hard block is a direct `throw` of a domain exception, in each action, and it is not a
  `Gate` ability.** *(`backend-expert`.)* PRD §3.2 is unusually explicit — *"always blocked, with no
  confirmation path around it"* — and three properties follow from that word "always":
  - **It must bind a Super Admin.** `Gate::before` grants a Super Admin every ability unconditionally,
    so a `Gate`-mediated check is **inert** against precisely the actor most likely to try. This is the
    same reasoning story 0008a's Super-Admin refusal and story 0015a's step-up guard both reached, and
    it is documented as a rule:
    [a rule that must bind a Super Admin actor must be a direct throw](../../docs/security/authorization-patterns.md#a-rule-that-must-bind-a-super-admin-actor-must-be-a-direct-throw-not-a-gate-check).
  - **It is not about the actor at all.** A policy answers "may *this actor* do this to *this target*";
    this rule answers "is this order editable", and the answer is the same for everyone. Putting it in
    an `OrderPolicy` would encode an actor-shaped question that has no actor-shaped answer.
  - **It lives in each action, not in a caller**, per
    [the action-owns-the-rule convention](../../docs/conventions/base-standards.md#an-authorization-rule-belongs-to-the-action-not-to-one-of-its-callers).
    Three copies of the `if` is the cost; the alternative — one guard in story 0055's component — leaves
    every non-dashboard caller (an API endpoint, an Artisan command, a queued job) completely unguarded.
    **If the three `if`s ever become four, extract a shared guard class** in the shape
    `EnsureRecentPasswordConfirmation` establishes (a throwing wrapper around a non-throwing predicate,
    so a future UI hint cannot drift from the rule) — but three call sites in one folder do not yet
    justify the indirection.

  **409 rather than 403** because the actor *is* authorized and the request *is* well-formed —
  `RoleInUseException`'s exact precedent. And the message is a **constant**: an interpolated one would
  disclose the order's state to a caller the ordering rule (**D-6**) may already have refused.

- **D-6 — The permission check runs strictly *before* the state guard.** *(`backend-qa`, raised as a
  test case; recorded here as the rule it implies.)* An actor lacking `orders.edit` who targets an
  `Enviado` order gets the **`AuthorizationException`**, never the 409. Inverting it would turn a
  permission refusal into a **disclosure**: the 409 tells its recipient both that the order exists and
  that it has shipped, to somebody with no permission to read either. This is the identical ordering
  rule story 0015a established for its step-up layer, and it generalises — **a refusal that reveals
  something about the target must never precede the check on whether the caller may look at the target
  at all.** Ordering is part of the guard, not an implementation detail
  ([errors-log.md](../../docs/errors-log.md#two-of-the-three-security-audit-rounds-found-the-flaw-in-the-previous-rounds-fix--2026-08-19)).

- **D-7 — Totals are recomputed by summing `order_items.line_total`, inside the same transaction as the
  write.** *(`backend-expert`.)* Not incrementally adjusted (`subtotal += $newLine`), which drifts the
  moment any single write is missed or repeated, and not recomputed after the commit, which leaves a
  window where the stored totals contradict the rows. **Recompute from the rows, in the transaction,
  every time** — the set is a handful of rows and the arithmetic is free relative to the correctness.
  ⚠️ **Phase 3 must read the transaction-side-effect rule before writing this**: wrapping work in a
  `DB::transaction()` relocates every side effect the wrapped code already performs
  ([errors-log.md](../../docs/errors-log.md#wrapping-existing-code-in-a-dbtransaction-moved-a-cache-flush-nobody-had-written--2026-08-21)).
  The specific forward constraint here: **if story 0046's notification, or any later order-changed
  event, is ever hooked to these actions, it dispatches *after* the commit** — a rolled-back edit must
  not notify anyone.

- **D-8 — Tax is recomputed only when a rate is already resolved; it is never *resolved* here.**
  *(`backend-expert`.)* Two branches, and the second is the load-bearing one:
  - **`orders.tax_rate` is non-null** → recompute `tax_amount = subtotal × tax_rate` on every subtotal
    change. Leaving a stale `tax_amount` beside a changed `subtotal` would ship a wrong total, which is
    worse than either extreme.
  - **`orders.tax_rate` is `NULL`** → leave `tax_amount` at `0.00`, write nothing to `tax_rate`, and
    **never resolve a sales region**. `NULL` means *not configured* and `0.000` means *a legitimate 0%*
    — the distinction `sales_regions.rate` established
    ([schema.md](../../docs/database/schema.md#sales_regions)) and 0045's **D-8** carried onto `orders`.
    Resolution is stories 0053/0054's **entire** scope, and a story that resolves one "helpfully" masks
    their work while looking like working behaviour (0045's **D-9**, and **R-2** below).

  `shipping_amount` is likewise read-and-summed, never computed (0037/0054).

- **D-9 — Still no `OrderPolicy`, and this story is not the one to create it.** 0045's **D-13** says the
  first of stories 0048–0052 to arrive should create `OrderPolicy`, on the grounds that those stories
  introduce row-state-dependent rules. **This story is that first arrival, and it deliberately does not
  create one** — the forward note's premise does not hold here. Its two rules are
  `orders.edit` (**D-2**, no row-level nuance at all — a policy method would be one line returning
  `$user->can()`) and the state block (**D-5**, which must *not* be a policy, since `Gate::before` would
  make it inert). So a policy created here would have exactly zero methods worth writing.
  **The forward note is re-pointed rather than dropped:** the first of 0050/0051/0052 to arrive with a
  genuine actor/target rule creates `OrderPolicy`, at which point `CreateOrder`'s and these three
  actions' `Gate::authorize()` calls **change target, not location**.

### Scope fences: what this story must NOT do

- Must **not** write `orders.status` or `orders.payment_status`, or add any transition logic to either
  enum (0049/0050).
- Must **not** read or write `order_items.refunded_quantity`, and must **not** implement the
  100%-refund auto-cancel (0051/0052) — note **D-1** exists partly so that rule stays sound.
- Must **not** resolve a Sales Region, write `tax_rate` or `sales_region_id`, or set
  `flagged_for_review` (0053/0054).
- Must **not** select or price a shipping rate, or compute `shipping_amount` (0037/0054).
- Must **not** dispatch, create or listen for any notification (0046).
- Must **not** add a route, a Livewire component, a Blade view, a `config/modules.php` entry, or screen
  copy beyond the one exception-message key (0055).
- Must **not** add a migration, column, index or FK — 0045's schema is used as shipped.
- Must **not** add a permission to `RolePermissionSeeder` (**D-2**).
- Must **not** create `app/Policies/OrderPolicy.php` (**D-9**).
- Must **not** refactor `CreateOrder`, beyond extracting the shared quantity rule into
  `OrderValidationRules` if 0045 left it inline.

## Dependencies, risks and open questions

### Dependencies

| Depends on | State | Verified how |
| --- | --- | --- |
| `orders` + `order_items` tables, `Order` / `OrderItem` models & factories, `OrderStatus`, `App\Concerns\OrderValidationRules`, `app/Actions/Orders/` | story [0045](0045-orders-core-crud-backend.md) — **hard dependency, and it is itself ⛔ blocked** | Every action here writes both tables, reads `orders.status`, and extends 0045's trait and folder |
| `products` / `product_variants` (live catalog) | stories [0024](done/0024-products-core-crud-backend.md) / [0029](done/0029-product-variants-backend.md) — **blocked, via 0045** | `AddOrderItem` resolves a real catalog row for its snapshot; the price-snapshot regression needs a mutable `products.price` |
| `orders.edit` in the seeded catalog | **shipped** | `RolePermissionSeeder::MODULES` carries `orders`, so all four `orders.*` abilities exist (**D-2**) |
| `Gate::before` Super Admin bypass | **shipped** (Epic 1) | [architecture/authorization.md](../../docs/architecture/authorization.md) — and this story tests both what it does and what it must not reach (**D-5**) |
| The rendering-domain-exception pattern | **shipped** (tasks 0008 / 0010 / 0015a) | [`RoleInUseException`](../../app/Exceptions/RoleInUseException.php)'s 409 `render()` is copied shape-for-shape |
| The direct-throw-for-Super-Admin-binding rule | **shipped** (task 0008a) | [security/authorization-patterns.md](../../docs/security/authorization-patterns.md#a-rule-that-must-bind-a-super-admin-actor-must-be-a-direct-throw-not-a-gate-check) |

**Not a dependency, stated explicitly:** story **0049** (status transitions). See the
[⚠️ banner](#-this-story-does-not-depend-on-0049-status-transitions--they-are-independent-siblings)
under [Type](#type) — the two are independent siblings, both depending only on 0045, and the only
interaction is the test **T-B** documents.

Also **not** a dependency: `database-expert`. This story is `includes database-expert: no` because it
adds no schema, and that is a claim to re-check at Phase 3 rather than assume — **if implementation
finds it needs a column, the story is wrong and comes back to Phase 1**, it does not grow a migration.

#### What depends on this story

- **0055** — the Orders detail UI, whose line-item editor calls these three actions and renders the 409
  as a disabled/absent control on a shipped order (the `Gate::allows()`-is-a-UI-hint pattern, extended
  to a **state** hint — and note the hint must mirror the same predicate the guard reads, per
  [authorization.md](../../docs/architecture/authorization.md#gateallows-in-a-list-query-is-a-ui-hint-not-a-layer)).
- **0050/0051/0052** — each adds another state-based refusal on `orders`; the first of them with a real
  actor/target rule creates `OrderPolicy` (**D-9**), and all of them should copy this story's
  direct-throw-plus-409 shape rather than re-deriving it.
- **0053/0054** — tax resolution. Once a rate is resolved, **D-8**'s first branch becomes the live path
  rather than the conditional one, and those stories inherit an order whose `subtotal` is guaranteed
  current.

### Risks

- **R-1 — The price snapshot is reopened silently by a "helpful" refresh.** `UpdateOrderItemQuantity`
  holds the item and can reach its product in one hop; re-reading the price there passes every
  happy-path test, because no test's product price has moved. This is 0045's **R-2** arriving one story
  later against code that is *more* tempting to get wrong. *Mitigation:* the dedicated
  mutate-then-edit-then-re-fetch regression test, as its own test group, plus **D-4** stating the rule
  as a prohibition rather than as a description.
- **R-2 — Tax "recalculation" quietly becomes tax *resolution*.** The phrase "and tax recalculate
  accordingly" in the PRD reads, to an implementer with an unresolved order in front of them, like an
  instruction to go and find a rate. That would mask stories 0053/0054's entire scope while looking like
  working behaviour. *Mitigation:* **D-8**'s two explicit branches, and the **negative** test asserting
  `tax_amount` stays `0.00` and `sales_region_id` stays `NULL` on an unresolved order.
- **R-3 — The hard block is implemented as "not `Pendiente`".** PRD §3.2 names two open statuses and
  two blocked ones, out of five. An implementation blocking everything except `Pendiente` passes every
  `Pendiente` test and every blocked-status test, and fails only on `Procesando` — and on `Cancelado`,
  where it would refuse an edit the PRD never asked to refuse. *Mitigation:* every happy-path test is a
  **dataset over both open statuses**, and the guard is specified as an allow-list of blocked states
  (`Shipped`, `Delivered`), not a deny-list of one permitted state.
- **R-4 — 0049's confirmation mechanism becomes this block's escape hatch.** Two adjacent PRD scenarios,
  one requiring a confirmation and one forbidding any, on the same order. *Mitigation:* test **T-B**,
  written here and now, before the mechanism exists to reach for.
- **R-5 — A cross-order line-item id corrupts an order the caller never named.** `RemoveOrderItem($orderA, $itemFromOrderB)`
  without an ownership check deletes B's row and recomputes A's totals: **two** orders wrong from one
  call, and A's totals now silently disagree with its own rows. *Mitigation:*
  `orderItemOwnershipRules()`, and a test asserting **both** orders afterwards.
- **R-6 — Money compared as floats.** Inherited verbatim from 0045's **R-3**: `decimal(10,2)` casts to a
  string. *Mitigation:* the test plan states decimal-string comparison for every money assertion.
- **R-7 — This document goes stale while it waits.** It is blocked behind 0045, which is itself blocked
  behind five stories, any of which may change during their own Phase 4/5 — and this file quotes 0045's
  column names, its trait's method names, and its folder. That is exactly the
  [stale-deferred-finding](../../docs/errors-log.md#a-deferred-storys-findings-were-claims-about-a-tree-that-no-longer-existed-and-one-of-them-would-have-reopened-a-bug-in-this-log--2026-08-23)
  failure. *Mitigation:* **Phase 3 re-verifies every referenced name against the shipped code before
  writing a line**, and the Phase 2 INVEST review is **re-run** immediately before Phase 3 rather than
  treated as passed on first reading. This file's identifiers are a reading aid, not a locator.

### Resolved questions

| Question raised | By | Resolved as |
| --- | --- | --- |
| Does `RemoveOrderItem` refuse dropping the last remaining line item? | backend-qa (recommended reject) / backend-expert (raised) | **D-1** — yes, rejected with a `ValidationException`, for symmetry with 0045's D-5 |
| Is the permission `orders.edit`, or its own sub-permission? | backend-expert | **D-2** — `orders.edit` reused; no catalog change |
| One action taking a diff, or three single-purpose actions? | backend-expert | **D-3** — three; catalog resolution must not sit beside the operations that must not perform it |
| Does a quantity change re-price the line? | backend-expert | **D-4** — never; the stored `unit_price` is re-multiplied |
| Does a newly added line snapshot at add-time? | backend-expert | **D-4** — yes, and it is immutable from then on |
| `Gate` ability or direct throw for the hard block? | backend-expert | **D-5** — direct throw, 409, because it must bind a Super Admin |
| Which refusal wins when both apply? | backend-qa | **D-6** — the permission refusal, always; the 409 would otherwise disclose the order's state |
| Incremental total adjustment or full recomputation? | backend-expert | **D-7** — recompute from the rows, in the transaction |
| Does this story resolve tax? | backend-expert | **D-8** — no; recompute only when a rate already exists, otherwise leave `0.00` |
| Does this story create `OrderPolicy`? | backend-expert | **D-9** — no; 0045's forward note is re-pointed to 0050/0051/0052 |

### Open questions

**OQ-1 — Should adding a line item to an order be blocked while its payment state is `Reembolsado`?
Non-blocking, defer to 0051/0052.** PRD §3.2 names the hard block purely in terms of *fulfilment*
status (`Enviado` / `Entregado`) and says nothing about the payment dimension. A fully-refunded order is
arguably as closed as a delivered one — but the refund rules, and the 100%-refund auto-cancel that would
have moved such an order to `Cancelado` anyway, all belong to 0051/0052. **This story implements exactly
what the PRD states and does not speculate a fourth blocked state.** Recorded so a later reader sees a
deliberate omission rather than an oversight.

**OQ-2 — Should a line-item edit be recorded anywhere for audit? Non-blocking, backlog.** PRD's
[Out of scope](../../docs/PRD/PRD.md#out-of-scope) explicitly excludes an audit/change-history log this
phase, so the answer today is no. Noted only because "who changed this order and when" is the single
most commonly requested addition to an editable order, and because story 0015b's
[refusal-logging pattern](../../docs/architecture/authorization.md#recording-a-refusal--what-every-gate-owes-the-audit-trail)
already exists for the *refused* half — so if a later story wants the successful half, it starts from a
shape this repo already has.

### Technical tasks for the backlog

Derived from this story, none of them in scope:

1. **Extract a shared state guard** in `app/Actions/Orders/` (a throwing wrapper around a non-throwing
   predicate, per `EnsureRecentPasswordConfirmation`'s shape) once a **fourth** call site for the
   editable-state check appears — likely with 0050 or 0055 (**D-5**).
2. **Create `OrderPolicy`** in whichever of 0050/0051/0052 first has a genuine actor/target rule, and
   re-point `CreateOrder`'s and these three actions' `Gate::authorize()` calls at it (**D-9**).
3. **A thin multi-line orchestrator** wrapping the three actions in one transaction, *if* story 0055's
   editor turns out to need one atomic submission (**D-3** — the orchestrator, never a merge).
4. **Revisit the payment-state dimension of the edit block** with 0051/0052 (**OQ-1**).

## Provenance

- **PRD source:** [§3.2 Orders](../../docs/PRD/PRD.md#32-orders) — specifically the `Scenario Outline:
  Edit the line items of an open order` (add / remove / change quantity, "the order totals and tax
  recalculate accordingly") and `Scenario: Editing line items after an order has shipped is
  hard-blocked` ("always blocked, with no confirmation path around it"), plus the two matching
  acceptance criteria. Status transitions, backward-transition confirmation, manual cancellation and
  refunds are the **siblings'** scenarios and are deliberately absent from this story's Gherkin.
- **Process:** [workflow.md](../../docs/workflow.md) Phase 1 — Three Amigos debate. Contributions from
  `backend-expert` and `backend-qa`, composed by `product-owner` as facilitator. `database-expert` was
  **not convened** by the [task-classification rule](../../docs/workflow.md#task-classification-rule):
  the story reuses [0045](0045-orders-core-crud-backend.md)'s schema entirely and adds no migration,
  column, index or query pattern. Two open questions were raised by the experts and resolved by the
  facilitator at composition: **D-1** (last-line-item removal) and **D-2** (permission reuse).
- **Gherkin conventions:** every scenario opens with a named business-role actor ("an order
  administrator", "a Super Admin") and carries exactly one `When`, per
  [gherkin-guidelines.md](../../docs/testing/frontend/gherkin-guidelines.md) rules 1 and 3 — mandatory
  across all Gherkin in this project, per the incident recorded in
  [errors-log.md](../../docs/errors-log.md). Note the PRD's own `Scenario Outline` is expanded into six
  named scenarios here rather than carried over as an outline: the outline's three examples cross the
  two open statuses, and writing that as a single outline hides which combination is actually asserted.
- **Stage:** `new`, and **blocked** — see the banner under [Description](#description). It moves to
  `ai-spec/tasks/in-progress/` at the start of Phase 3, and to `ai-spec/tasks/done/` at Phase 7 — both
  moves change this file's directory depth, so every relative link above must be re-resolved on each
  move (both directions), per
  [workflow.md](../../docs/workflow.md#link-integrity-check-on-every-stage-move).
- **Epic 3 decomposition:** one of the Orders editing stories. Siblings referenced by number (0046
  notification, 0047 order history, 0049 status transitions, 0050 cancellation guards, 0051–0052
  refunds, 0053–0054 tax resolution, 0055 UI) because their files may not exist yet.
