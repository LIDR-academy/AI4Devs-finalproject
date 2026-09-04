# [0051] Order payment/refund state backend

## Description
Give the backoffice the ability to **record a refund against an order's line items** and have the
order's `payment_status` follow from it, per PRD
[§3.2 Orders](../../docs/PRD/PRD.md#32-orders). A refund is expressed as *units of specific line
items coming back*; the payment state (`Pagado` → `Parcialmente reembolsado` → `Reembolsado`) is
**derived** from the resulting line-item state and is never submitted. This story owns the `refunds`
event-log table, the `orders.refunded_amount` running total, the `orders.refund` permission,
`RecordRefund`, and the refusal rules that guard it. No route, no Livewire component, no Blade
markup, no auto-cancel.

> ## ⛔ BLOCKED — inherited cross-epic dependency (read this before Phase 3)
>
> **This story is fully specified now, but its Phase 3 implementation cannot start until story
> [0045](0045-orders-core-crud-backend.md) is `done`** — and 0045 is itself blocked on five Epic 2
> stories ([0024](done/0024-products-core-crud-backend.md), [0029](done/0029-product-variants-backend.md),
> [0035](0035-shipping-carriers-backend.md), [0036](0036-shipping-rate-rules-backend.md),
> [0038](0038-payment-methods-bank-transfer-backend.md)).
>
> Every column this story reads — `orders.payment_status`, `order_items.quantity`,
> `order_items.unit_price`, `order_items.refunded_quantity` — is created by 0045. `refunds.order_item_id`
> FKs `order_items`, a table that does not exist in code yet, and this story honours
> [0045's **DR-1**](0045-orders-core-crud-backend.md#dr-1--resolved-disagreement--fk-sequencing-vs-unconstrained-placeholder-columns)
> verbatim: **every FK is `constrained()` against an already-existing table, or the story waits.**
> Do not stub `order_items` to proceed.
>
> **What is *not* blocked:** this document. Specifying it now is what lets 0045's `refunded_quantity`
> column (its **D-3**) have a named consumer instead of being a bet, and it is what makes the
> permission-catalog change visible while it is still cheap.

## Type
backend | includes database-expert: **yes**

### Three Amigos participants

- `backend-expert` — the `RecordRefund` action, the derivation rule, the refusal shape, the
  validation-trait extension. Raised the refund-model question (**DR-1**) without resolving it.
- `backend-qa` — risk-based test design, the boundary case where the last unrefunded unit flips the
  state inside one call, the over-refund guard's *real* trigger, the atomicity case. Raised the
  permission question (**D-3**) independently.
- `database-expert` — the `refunds` table, `orders.refunded_amount`, delete behaviour per FK, index
  discipline, and the rejection of a scalar `refunded_at` column (**D-2**).

### Why this is one story and not two

The `refunds` table, the `refunded_quantity` increment and the `payment_status` derivation are a
single invariant: *the payment state is a function of how much of each line item has come back*.
Shipping the table without the derivation leaves a log nothing reads; shipping the derivation
without the table leaves a running total with no event history behind it and no way to answer
"which refund was the €40 for, and when". `orders.refunded_amount` joins them because it is the
sum the same transaction must keep consistent with both.

## Gherkin

```gherkin
Feature: Order payment and refund state (backend)

  # --- Recording a refund ---

  Scenario: Record a full refund from a paid order
    Given an order administrator, with a paid order whose single line item is for three units
    When they record a refund of all three units
    Then the order's payment state becomes fully refunded

  Scenario: Record a partial refund from a paid order
    Given an order administrator, with a paid order whose single line item is for five units
    When they record a refund of two of those units
    Then the order's payment state becomes partially refunded

  Scenario: A refund covering one of several line items is partial
    Given an order administrator, with a paid order carrying two line items
    When they record a refund of every unit of the first line item only
    Then the order's payment state becomes partially refunded

  Scenario: A refund touching every line item without emptying any is partial
    Given an order administrator, with a paid order carrying two line items of four units each
    When they record a refund of one unit from each line item
    Then the order's payment state becomes partially refunded

  Scenario: A partially refunded order can still be refunded
    Given an order administrator, with a partially refunded order whose line item has units outstanding
    When they record a further refund of one of those outstanding units
    Then the refund is accepted

  Scenario: Returning the last outstanding unit fully refunds the order
    Given an order administrator, with a partially refunded order holding exactly one outstanding unit
    When they record a refund of that last outstanding unit
    Then the order's payment state becomes fully refunded

  Scenario: A refund may span several line items in one action
    Given an order administrator, with a paid order carrying three line items
    When they record a single refund naming units from all three line items
    Then every named line item records its returned units

  # --- What a refund records ---

  Scenario: A refund records who performed it
    Given an order administrator, with a paid order
    When they record a refund
    Then the refund record names that administrator as the person who performed it

  Scenario: A refund records the amount returned
    Given an order administrator, with a paid order whose line item is priced at 10.00 per unit
    When they record a refund of two of those units
    Then the refund record carries an amount of 20.00

  Scenario: Each refund is recorded as its own event
    Given an order administrator, with a paid order whose line item has been refunded once already
    When they record a second refund against that same line item
    Then two separate refund records exist for that line item

  Scenario: The order accumulates the total amount refunded
    Given an order administrator, with a paid order already carrying a refund of 20.00
    When they record a further refund of 10.00
    Then the order's refunded total reads 30.00

  # --- Refusing a refund ---

  Scenario: A refund is refused while the order is awaiting payment
    Given an order administrator, with an order whose payment is still pending
    When they attempt to record a refund
    Then the attempt is refused with a validation message and nothing is recorded

  Scenario: A refund is refused once the order is fully refunded
    Given an order administrator, with an order that is already fully refunded
    When they attempt to record a further refund
    Then the attempt is refused with a validation message and nothing is recorded

  Scenario: Refunding more units than were ordered is refused
    Given an order administrator, with a paid order whose line item is for three units
    When they attempt to record a refund of four units of that line item
    Then the attempt is refused with a validation message and nothing is recorded

  Scenario: Refunding more units than remain outstanding is refused
    Given an order administrator, with a paid order whose line item is for five units, three already refunded
    When they attempt to record a refund of three further units of that line item
    Then the attempt is refused with a validation message and nothing is recorded

  Scenario: A refund of zero units is refused
    Given an order administrator, with a paid order
    When they attempt to record a refund of zero units
    Then the attempt is refused with a validation message and nothing is recorded

  Scenario: A refund of a negative number of units is refused
    Given an order administrator, with a paid order
    When they attempt to record a refund of a negative number of units
    Then the attempt is refused with a validation message and nothing is recorded

  Scenario: A refund naming no line items at all is refused
    Given an order administrator, with a paid order
    When they attempt to record a refund naming no line items
    Then the attempt is refused with a validation message and nothing is recorded

  Scenario: A refund naming another order's line item is refused
    Given an order administrator, with two paid orders each carrying their own line items
    When they attempt to record a refund against the first order naming the second order's line item
    Then the attempt is refused with a validation message and neither order records anything

  Scenario: A rejected multi-line refund leaves every line item untouched
    Given an order administrator, with a paid order carrying three line items
    When they attempt a refund whose third line item exceeds its outstanding units
    Then no line item records any returned units and the order's payment state is unchanged

  # --- Authorization ---

  Scenario: An administrator without the orders refund permission cannot record a refund
    Given a signed-in administrator whose role grants order editing but not order refunds
    When they attempt to record a refund against a paid order
    Then the attempt is refused and nothing is recorded

  Scenario: An administrator holding the orders refund permission can record a refund
    Given a signed-in administrator whose role grants the orders refund permission
    When they record a refund against a paid order
    Then the refund is recorded

  Scenario: A Super Admin may record a refund without holding the permission explicitly
    Given a Super Admin holding no individual orders permission
    When they record a refund against a paid order
    Then the refund is recorded

  Scenario: A missing permission is refused before the order's payment state is considered
    Given a signed-in administrator without the orders refund permission, and an already fully refunded order
    When they attempt to record a refund
    Then the refusal names the missing permission rather than the order's payment state

  # --- What this story deliberately leaves alone ---

  Scenario: A full refund does not change the order's fulfilment status
    Given an order administrator, with a paid order that has been shipped
    When they record a refund of every unit of every line item
    Then the order's fulfilment status is unchanged, the automatic cancellation being a separate concern
```

## Files to create/modify

### Migration 1 — `refunds` (new table)

`database/migrations/<ts>_create_refunds_table.php` — **new**. Adopted from `database-expert`'s
contribution unchanged in shape; the greenfield-UUID precedent is
[`create_sales_regions_table`](../../docs/database/migrations.md#uuid-primary-keys).

```php
Schema::create('refunds', function (Blueprint $table): void {
    $table->uuid('id')->primary();

    // See OQ-1 before writing this line — cascade vs. restrict is the one
    // schema question this story leaves open, and it is cheapest to settle now.
    $table->foreignUuid('order_item_id')->constrained()->cascadeOnDelete();

    $table->unsignedInteger('quantity');
    $table->decimal('amount', 10, 2);          // quantity x order_items.unit_price, snapshot at refund time (D-8)

    // restrictOnDelete: a refund must always name a real actor. Effectively insurance —
    // `users` is soft-deleted, so a delete never fires this FK (D-10).
    $table->foreignUuid('refunded_by')->constrained('users')->restrictOnDelete();

    $table->text('reason')->nullable();        // column now, behaviour later (D-11)

    $table->timestamps();                      // created_at IS the refund event timestamp (D-2)
});

// down(): Schema::dropIfExists('refunds');
```

### Migration 2 — `orders.refunded_amount` (alteration, later timestamp)

`database/migrations/<ts+1>_add_refunded_amount_to_orders_table.php` — **new**.

```php
public function up(): void
{
    Schema::table('orders', function (Blueprint $table): void {
        $table->decimal('refunded_amount', 10, 2)->default(0.00)->after('total');
    });
}

public function down(): void
{
    Schema::table('orders', function (Blueprint $table): void {
        $table->dropColumn('refunded_amount');
    });
}
```

**No backfill statement, and that is a decision rather than an omission.** The rule in
[migrations.md](../../docs/database/migrations.md#when-the-new-columns-default-is-wrong-for-existing-rows-backfill-in-the-same-up)
is to backfill when the default chosen for *new* rows mis-states the *old* ones. Here it does not:
no refund mechanism has ever existed, so `0.00` is the true value for every pre-existing order.
State that in the migration's docblock so a reader can tell "considered and unnecessary" from
"forgotten".

Non-negotiable properties of both files:

- **Every FK is `constrained()` against a table that already exists** at the time these run — 0045's
  [DR-1](0045-orders-core-crud-backend.md#dr-1--resolved-disagreement--fk-sequencing-vs-unconstrained-placeholder-columns),
  applied to this story's own table.
- **No explicit `$table->index()` anywhere.** `constrained()` already indexes `order_item_id` and
  `refunded_by`; a hand-written one produces the redundant index recorded in
  [errors-log.md](../../docs/errors-log.md#a-redundant-users_uuid_unique-index-survived-the-uuid-primary-key-conversion--2026-08-12).
  Verify with `php artisan db:table refunds` after migrating, **never** by reading the migration
  ([migrations.md](../../docs/database/migrations.md#an-fk-column-does-not-also-get-an-explicit-index-here)).
- **No index on `created_at`** — the same cardinality argument 0045 applied to `status`: a
  backoffice-sized table where the index costs a write per insert and buys a scan the optimizer
  would likely decline.
- **`amount` and `refunded_amount` are `decimal(10,2)`, never `float`**, matching
  `order_items.unit_price` and `orders.total` exactly. Binary floating point cannot hold `20.10`.
- **No `deleted_at` on `refunds`.** A refund is a recorded fact; correcting one is a business
  decision nobody has asked for (**OQ-4**).
- **Two migrations, not one combined file** (**D-7**).

### Model — `app/Models/Refund.php` (new)

Scaffolded with `php artisan make:model Refund -f --no-interaction`. Follows
[base-standards.md](../../docs/conventions/base-standards.md#model-conventions):

- `use HasFactory, HasUuids;`, `@property string $id`, and **no** `$keyType` / `$incrementing`.
- `#[Fillable]` lists **nothing a caller may set that is not already a caller's own input** — in
  practice `#[Fillable(['order_item_id', 'quantity', 'reason'])]`. `amount` and `refunded_by` are
  **omitted deliberately**: `amount` is derived arithmetic over a snapshotted price, and
  `refunded_by` is the actor's identity, which must be derived from `Auth::user()` and never
  accepted as input (the 0008a rule — *derive a security-relevant value internally; never take it as
  a parameter*). Omission from `#[Fillable]` **is** this codebase's mass-assignment guard.
- Relations: `belongsTo` → `orderItem`, `refundedBy` (`User`).
- **No `SoftDeletes`.**

### Model — `app/Models/Order.php` (modified)

- `#[Fillable]` gains **nothing**. `refunded_amount` joins the already-omitted derived columns
  (`subtotal`, `tax_amount`, `total`, …), written by `RecordRefund` via `forceFill()` alone.
- Add a `hasManyThrough` → `refunds` (through `OrderItem`) **only if** a test needs it; a relation
  whose only caller does not exist yet is speculative (0045 **D-6**'s rule). The list-of-refunds
  read contract belongs to story 0055.

### Model — `app/Models/OrderItem.php` (modified)

- `#[Fillable]` gains **nothing** — `refunded_quantity` was already omitted by 0045 and stays so.
- Relation: `hasMany` → `refunds`.

### Factory — `database/factories/RefundFactory.php` (new)

- Default state produces a refund of one unit against an existing `OrderItem`, with `amount` equal
  to that item's `unit_price`, `refunded_by` an existing `User`, and a `null` reason.
- **The factory may not produce a state this story's own guards would reject** — in particular it
  must not create a refund whose quantity exceeds its item's outstanding units, or the over-refund
  tests become meaningless (0045's identical rule for `OrderFactory`).

### Permission catalog — `database/seeders/RolePermissionSeeder.php` (modified)

**This is the first Epic 3 backend story that changes the seeded permission catalog**, and it is the
part of this story with the widest blast radius. `orders.refund` is a **non-CRUD permission under an
existing module slug** — not a new module, and not one of the four CRUD verbs — so it goes in a new
constant beside `ROLE_PERMISSIONS` rather than into `MODULES` or `ACTIONS`:

```php
/**
 * Non-CRUD permissions on the orders module that sit outside the module x action grid.
 *
 * @var array<int, string>
 */
public const ORDER_PERMISSIONS = ['orders.refund'];
```

…folded into `allPermissionNames()` alongside the existing two arrays:

```php
return [...$modulePermissions, ...self::ROLE_PERMISSIONS, ...self::ORDER_PERMISSIONS];
```

Consequences, all of which are this story's job to carry:

- **The catalog goes from 38 permissions to 39**, and `role_has_permissions` from 37 to 38 —
  `Administrator` picks up `orders.refund` automatically, because the seeder grants it everything
  except `roles.manage-administrators` via `array_diff`. That is the intended grant: an
  Administrator manages the store, and refunds are store management. `Super Admin` still holds none
  and still reaches it through `Gate::before`.
- **Thirteen hard-coded count assertions across two existing test files must be updated** —
  `tests/Feature/Seeders/RolePermissionSeederTest.php` (lines ~33, 36, 77, 95, 101, 131, 167, 347,
  389, 487, 575) and `tests/Feature/Seeders/DatabaseSeederTest.php` (lines ~44, 94, 129). **Those
  line numbers are a reading aid, not a locator** — re-grep for `38` / `37` before editing, per the
  deferred-findings rule in
  [errors-log.md](../../docs/errors-log.md#a-deferred-storys-findings-were-claims-about-a-tree-that-no-longer-existed-and-one-of-them-would-have-reopened-a-bug-in-this-log--2026-08-23).
  This alone is why the story's Definition of Done requires the **unscoped** suite run: a
  `--filter`ed run over `tests/Feature/Orders/` would report green while fourteen other tests are
  red ([base-standards.md](../../docs/conventions/base-standards.md#steps-1-and-2-are-the-iteration-forms-run-both-unscoped-before-declaring-the-work-done)).

### Translations — `lang/en/roles.php` + `lang/es/roles.php` (modified)

The Roles screen (story 0011) composes each permission's label as
`__('roles.modules.<module>').' — '.__('roles.actions.<action>')`, and anything whose action segment
is not one of the four CRUD verbs falls out of the matrix into the list rendered beneath it. Both
files' `actions` group carries exactly six leaves today (`view`, `create`, `edit`, `delete`,
`manage`, `manage_administrators`) — **`refund` is not among them**, so without this change the
Roles screen renders the raw key `roles.actions.refund` next to a checkbox nobody can identify.

Add one leaf to each, key-for-key identical
([naming.md](../../docs/conventions/naming.md#translation-keys)):

```php
// lang/en/roles.php — 'actions'
'refund' => 'Refund',
```

```php
// lang/es/roles.php — 'actions'
'refund' => 'Reembolsar',
```

`roles.modules.orders` already exists, so no module key is needed. **No other lang change**:
`lang/{en,es}/orders.php`'s two status groups are 0045's and are already correct — `payment_statuses.refunded`
and `payment_statuses.partially_refunded` ship there.

### Validation trait — `app/Concerns/OrderValidationRules.php` (modified)

Extends 0045's trait rather than creating a second one — same noun, same model's input
([naming.md](../../docs/conventions/naming.md#traits-and-their-methods)):

```php
protected function refundItemsRules(): array;     // ['required', 'array', 'min:1']
protected function refundQuantityRules(): array;  // ['required', 'integer', 'min:1']
```

Applied as `['items' => $this->refundItemsRules(), 'items.*' => $this->refundQuantityRules()]`, since
the payload is `array<order_item_id, quantity_to_refund>` — the ids are keys and the quantities are
values. `min:1` on the quantity rejects `0` and every negative in one rule; `integer` rejects `1.5`
and `'abc'`.

**The ownership guard and the over-refund guard are deliberately *not* rule arrays**, and the reason
is a rule this repo already paid for:

- A static rule array cannot see which order is being refunded. `Rule::exists('order_items', 'id')`
  alone would accept **another order's** line item — the exact cross-tenant confusion `backend-qa`
  flagged.
- More importantly, "how many units of this line have already come back" is *the state the guard
  exists to protect*, and a guard must **derive** that state rather than accept it or look it up
  loosely — the rule from
  [errors-log.md](../../docs/errors-log.md#a-guard-took-the-state-it-was-guarding-as-a-parameter-reopening-its-own-hole-one-level-up--2026-08-20).
  So both guards run inside `RecordRefund`, against the order's **own freshly-read, row-locked**
  `items` collection, and raise `ValidationException::withMessages(['items' => …])` on failure.

### Action — `app/Actions/Orders/RecordRefund.php` (new, in 0045's subfolder)

Invokable, imperative-verb-phrase class with no `Action` suffix, resolved from the container and
never `new`-ed
([code-style.md](../../docs/conventions/code-style.md#exception-an-actions-own-dependency-is-constructor-injected-when-the-method-signature-is-a-public-contract)).

```php
/**
 * @param  array<string, int>  $items  order_item_id => quantity_to_refund
 */
public function __invoke(Order $order, array $items): Order
```

Performing, **in this order**:

1. **`Gate::authorize('orders.refund')` as the first statement.** The rule lives in the class that
   performs the operation, not in a caller that does not exist yet
   ([base-standards.md](../../docs/conventions/base-standards.md#an-authorization-rule-belongs-to-the-action-not-to-one-of-its-callers)).
   `orders.refund` is a **new** permission (**D-3**), not one of 0045's four.
2. **Validate the payload shape** through the trait — the items array and every quantity.
3. **Open a `DB::transaction()`.** Everything below runs inside it.
4. **Re-read the order and its items under a row lock**:
   `$order->refresh(); $items = $order->items()->lockForUpdate()->get()->keyBy('id');`
   The lock is not decoration — see **R-1**. Reading the state *inside* the lock is what makes the
   guards below atomic with the writes that follow them.
5. **Refuse by payment state.** `PendingPayment` and `Refunded` → `ValidationException` (**D-5**).
   Accepted from `Paid` and `PartiallyRefunded`. Re-checked here, under the lock, rather than before
   the transaction, because a concurrent refund may have flipped it in between.
6. **Refuse by ownership.** Every key in `$items` must be present in the locked collection. An id
   naming another order's line item, or naming nothing at all, is a `ValidationException` — never a
   silent skip.
7. **Refuse by outstanding units.** For each item: `quantity_to_refund <= (quantity - refunded_quantity)`.
   Note the right-hand side reads the **current** `refunded_quantity`, not the original quantity —
   that is the guard's real trigger and the case `backend-qa` singled out.
8. **Write, per item:** insert a `refunds` row (`order_item_id`, `quantity`,
   `amount = quantity × unit_price`, `refunded_by = Auth::id()`, `reason = null`), then increment
   `order_items.refunded_quantity` by that quantity via `forceFill()`.
9. **Increment `orders.refunded_amount`** by the sum of the amounts just written.
10. **Derive and write `orders.payment_status`** (**D-4**), from the final state of the locked items
    — never from a delta.
11. **Return the refreshed `Order`.**

> **The derivation, written out because its edge cases are not obvious** (**D-4**):
>
> ```
> $everyLineFullyRefunded = items->every(fn ($i) => $i->refunded_quantity === $i->quantity);
> $anyLineRefunded        = items->contains(fn ($i) => $i->refunded_quantity > 0);
>
> $everyLineFullyRefunded  → PaymentStatus::Refunded
> $anyLineRefunded         → PaymentStatus::PartiallyRefunded
> otherwise                → unchanged
> ```
>
> Evaluated in exactly that order. Three properties follow, and each is separately tested:
> **(a)** an order where *every* line is partially refunded is `PartiallyRefunded`, not `Refunded` —
> a rule phrased as "some but not all lines have units returned" leaves that case unclassified;
> **(b)** the refund that returns the last outstanding unit flips `PartiallyRefunded` → `Refunded`
> **within the same call**, for free, because the derivation reads final state rather than a delta;
> **(c)** the third branch is structurally unreachable after a successful refund (validation
> guarantees at least one unit came back), but the derivation is written **total** anyway so it
> cannot silently fall through.

> **This derived transition is the seam story 0052 listens on.** This story ships **no event and no
> listener** — it ships the derivation and its observable outcome. 0052 (auto-cancel on 100% refund)
> chooses its own binding mechanism; **OQ-2** records the recommendation and why it is 0052's call.

> **Phase 3 must re-read the transaction-side-effect rule before writing step 3.** Wrapping work in
> a `DB::transaction()` relocates every side effect the wrapped code already performed — the mistake
> in [errors-log.md](../../docs/errors-log.md#wrapping-existing-code-in-a-dbtransaction-moved-a-cache-flush-nobody-had-written--2026-08-21).
> Here the forward constraint is specific: **when story 0052 adds an auto-cancel side effect, or a
> refund notification is ever added, it must fire *after* the commit**, or a rolled-back refund
> cancels an order that was never refunded.

### Explicitly **not** touched by this story

- `app/Policies/**` — no `OrderPolicy` is created (**DR-2**).
- `routes/*.php`, `config/modules.php`, `app/Livewire/**`, `resources/views/**` — story 0055's.
- `app/Notifications/**`, `app/Listeners/**`, `app/Events/**` — nothing is dispatched here.
- `orders.status` — never written. The 100%-refund auto-cancel is **0052's**, and a test asserts this
  story leaves `status` alone.
- `lang/{en,es}/orders.php` — 0045 already ships both payment-status labels.
- `RolePermissionSeeder::MODULES` / `::ACTIONS` — untouched; `orders.refund` is a non-CRUD
  permission on an existing module, added via a new constant.

## Tests to perform

All Feature tests unless marked otherwise; new folder `tests/Feature/Orders/` (created by 0045),
plus edits to two existing seeder test files. This story ships no route, so **every** authorization
test here is action-level; story 0055 owns the HTTP-level ones
([testing/README.md](../../docs/testing/README.md)).

### Schema, model & factory

- [ ] Integration test: `refunds` exists with exactly the columns listed above, verified with
      `php artisan db:table refunds`, and carries **only** the indexes `constrained()` created plus
      its primary key.
- [ ] Integration test: `orders.refunded_amount` exists and a newly created order reads `0.00`
      (decimal-string comparison, per **R-3**).
- [ ] Unit test: `Refund` uses `HasUuids`; a created refund's `id` is a 36-character UUID string.
- [ ] Integration test: factory round-trip — every column persists and reloads byte-identically.
- [ ] **Integration test (mass-assignment guard):** `Refund::create([... 'amount' => 0.01,
      'refunded_by' => $otherUserId ...])` writes neither. **The sharpest structural test in the
      story** — a fillable `amount` lets a caller set the value of a refund, and a fillable
      `refunded_by` lets a caller attribute their own refund to someone else. The
      omission-as-guard convention is only real if something fails when it is undone.
- [ ] Integration test: `Order::create([... 'refunded_amount' => 999.99 ...])` does not write it.

### Permission catalog

- [ ] Existing tests updated: `Permission::count()` is **39** and the `Administrator` role holds
      **38** — the thirteen hard-coded assertions named above. Re-grep rather than trusting the line
      numbers.
- [ ] Integration test: `orders.refund` exists in the seeded catalog, asserted **literally** as a
      string against `RolePermissionSeeder`, so a typo cannot fail closed unnoticed (**R-4**).
- [ ] Integration test: the seeded `Administrator` role holds `orders.refund`.
- [ ] Integration test: **every** seeded permission's action segment resolves a non-raw label in
      **both** `lang/en/roles.php` and `lang/es/roles.php`. Written generally rather than as a
      `refund`-specific assertion, so the next non-CRUD permission cannot ship a raw key onto the
      Roles screen either — the gap this story only found by inspection.

### Recording a refund — happy paths

- [ ] Integration test: a full refund of a single-line order sets `payment_status` to `Refunded`,
      `refunded_quantity` to the item's full quantity, writes one `refunds` row, and sets
      `orders.refunded_amount` to the line total.
- [ ] Integration test: a partial refund (2 of 5) sets `PartiallyRefunded`, `refunded_quantity` to
      `2`, and `refunded_amount` to `2 × unit_price`.
- [ ] Integration test: a two-line order with the **first line fully refunded** and the second
      untouched reads `PartiallyRefunded`.
- [ ] Integration test: a two-line order with **both lines partially refunded** reads
      `PartiallyRefunded` and **not** `Refunded` — derivation property **(a)**.
- [ ] Integration test: a further refund from `PartiallyRefunded` is accepted.
- [ ] **Boundary test:** refunding the **last outstanding unit** of a `PartiallyRefunded` order moves
      it to `Refunded` **inside the same call** — derivation property **(b)**, and the case a
      delta-based implementation gets wrong.
- [ ] Integration test: one call naming units from three line items writes three `refunds` rows and
      increments all three `refunded_quantity` values.
- [ ] Integration test: the `refunds` row records `refunded_by` as the **acting** user (assert
      against `Auth::id()`, not against a user passed in — there is no such parameter).
- [ ] Integration test: `amount` equals `quantity × unit_price` as a decimal string, asserted for
      quantity 1 and quantity 3 (**R-3**).
- [ ] Integration test: two successive refunds against the same line item produce **two** `refunds`
      rows with distinct `created_at` values. This is **D-2**'s justification made executable — a
      scalar `refunded_at` column could not represent it.
- [ ] **Consistency invariant:** after any number of refunds, each item's `refunded_quantity` equals
      the SUM of its `refunds` rows' `quantity`, and `orders.refunded_amount` equals the SUM of every
      `refunds` row's `amount` for that order. Asserted after a three-call sequence, not after one.

### Recording a refund — refusals

- [ ] **Negative test (dataset over PRD §3.2's own two-row outline):** `payment_status` is
      `PendingPayment` / `Refunded` → `ValidationException`, **zero** `refunds` rows, **zero** change
      to any `refunded_quantity`, and `payment_status` unchanged.
- [ ] Negative test (dataset): quantity `0`, `-1`, `1.5`, `'abc'` → `ValidationException`, nothing
      written.
- [ ] Negative test: an empty `items` array → `ValidationException` on `items`.
- [ ] Negative test: over-refund against a **pristine** line (item quantity 3, refund 4).
- [ ] **Negative test: over-refund against a line that already carries a partial
      `refunded_quantity`** (quantity 5, already refunded 3, refund 3 → refused). The guard's real
      trigger; a guard written against the original `quantity` alone passes the previous test and
      fails this one.
- [ ] Positive boundary beside it: quantity 5, already refunded 3, refund **2** → accepted, and the
      order flips to `Refunded`. Without this the over-refund guard could be off by one in the safe
      direction and nothing would notice.
- [ ] **Negative test (cross-order confusion):** refunding order A while naming order B's
      `order_item_id` → `ValidationException`, and **neither** order records anything. Assert both.
- [ ] Negative test: an `order_item_id` matching no row at all → `ValidationException`.
- [ ] **Negative test (atomicity):** a three-item refund whose **third** item exceeds its outstanding
      units writes **no** `refunds` row, leaves all three `refunded_quantity` values unchanged,
      leaves `orders.refunded_amount` unchanged, and leaves `payment_status` unchanged. Asserting
      only "the refund failed" would pass against an implementation that writes the first two rows
      and then throws.

### Authorization

- [ ] Negative test: an administrator holding `orders.edit` and `orders.view` but **not**
      `orders.refund` is refused with an `AuthorizationException`, and nothing is written. **This is
      the test that proves the two permissions are genuinely distinct** — without it, `orders.refund`
      could be an unused string.
- [ ] Integration test: an administrator holding `orders.refund` but **not** `orders.edit` succeeds.
      Independence in both directions, mirroring
      [`ModuleRouteAccessTest`](../../tests/Feature/Authorization/ModuleRouteAccessTest.php)'s
      cross-gate pattern.
- [ ] Integration test: a Super Admin holding no individual `orders.*` grant succeeds, via
      `Gate::before`.
- [ ] **Ordering test:** an actor lacking `orders.refund`, against an order already in `Refunded`,
      gets the **`AuthorizationException`** — not the `ValidationException`. The permission refusal
      wins, so the state is never disclosed to someone with no business reading it. This mirrors the
      ordering rule established for step-up authentication
      ([authorization.md](../../docs/architecture/authorization.md#step-up-authentication--the-third-layer)).

### Scope fences, made executable

- [ ] Integration test: a full refund leaves `orders.status` **unchanged** — including for an order
      in a shipped state. The 100%-refund auto-cancel is 0052's, and this test is what stops this
      story from quietly implementing it.
- [ ] Integration test: recording a refund dispatches no notification and no event
      (`Notification::fake()` / `Event::fake()` asserting nothing).

### Deliberately not tested

- The auto-cancel on 100% refund, any status transition, any transition confirmation (0048–0052).
- Anything rendered, and the "refund action does not render" half of PRD §3.2's UI/backend
  defence-in-depth pair — that half is story 0055's; **this story owns the backend half only**, and
  its refusal tests are exactly that half.
- Migration `up()`/`down()` mechanics — `RefreshDatabase` runs every migration each run
  ([what-not-to-test.md](../../docs/testing/qa/what-not-to-test.md)).
- Concurrency under real parallel load (**R-1**) — the row lock is a code-review item, not a
  reliably testable one.

## Expected outcome

Once done, an administrator holding `orders.refund` can record a refund against one or more of an
order's line items in a single action. Each refund is persisted as its own `refunds` row carrying the
units returned, the amount (`quantity × unit_price`, snapshotted), who performed it and when — so
"which refund was the €40 for, and when" is answerable — while `order_items.refunded_quantity` and
`orders.refunded_amount` are kept as the fast running totals that must always equal the sum of those
rows. The order's `payment_status` is **derived** from the resulting line-item state and written by
the same transaction: fully refunded everywhere → `Refunded`, anything returned but not everything →
`PartiallyRefunded`. A refund is refused — as a validation error, not a 403 — from `PendingPayment`
and from `Refunded`, and refused whenever it would return more units than a line still has
outstanding, name another order's line item, or name no line item at all. A rejected refund leaves
every row untouched.

**Nothing is changed that this story does not own:** `orders.status` never moves, no notification or
event is dispatched, no policy is created, no route or screen exists, and `refunds.reason` is a
column this story always writes `null` into. The permission catalog grows by exactly one entry —
`orders.refund`, 38 → 39 — and the Roles screen renders it with a real label in both locales.

## Acceptance criteria

- [ ] A `refunds` table exists with a UUID v7 primary key and exactly the columns listed above,
      verified with `php artisan db:table refunds`.
- [ ] `orders.refunded_amount` exists as `decimal(10,2)` defaulting to `0.00`, verified with
      `php artisan db:table orders`.
- [ ] Every foreign key on `refunds` is written as `constrained()` against an existing table; no
      explicit `$table->index()` exists on it, and the only indexes present are its primary key and
      the ones `constrained()` created.
- [ ] Delete behaviour is exactly: `refunds.order_item_id` → per **OQ-1**'s settled answer;
      `refunds.refunded_by` → `restrictOnDelete()`.
- [ ] `App\Models\Refund` uses `HasUuids` and `HasFactory` and omits `amount` and `refunded_by` from
      `#[Fillable]` — pinned by a test that fails if either omission is undone.
- [ ] `orders.refund` is seeded as a **new** permission via a new `RolePermissionSeeder` constant;
      `MODULES` and `ACTIONS` are unchanged; the catalog is 39 permissions and `Administrator` holds
      38.
- [ ] `roles.actions.refund` exists in **both** `lang/en/roles.php` and `lang/es/roles.php`, and no
      seeded permission resolves a raw translation key on the Roles screen.
- [ ] `RecordRefund` calls `Gate::authorize('orders.refund')` as its **first** statement, is refused
      for an actor lacking the ability, and passes for a Super Admin via the existing bypass.
- [ ] A refund is refused with a `ValidationException` — **not** an `AuthorizationException` and not
      a 403 — when `payment_status` is `PendingPayment` or `Refunded`, and accepted from `Paid` and
      `PartiallyRefunded`.
- [ ] A refund is refused when it would take any line item's `refunded_quantity` above its
      `quantity`, evaluated against the item's **current** `refunded_quantity`.
- [ ] A refund naming an `order_item_id` that does not belong to the order being refunded is refused,
      and neither order is modified.
- [ ] A refund spanning several line items is atomic: any single invalid item leaves **zero** rows
      written and **zero** columns changed across `refunds`, `order_items` and `orders`.
- [ ] `orders.payment_status` is **derived inside `RecordRefund`** from the final line-item state,
      never submitted by a caller and never computed from a delta; the last outstanding unit flips
      `PartiallyRefunded` → `Refunded` within the same call.
- [ ] After any sequence of refunds, each `order_items.refunded_quantity` equals the sum of its
      `refunds` rows' quantities, and `orders.refunded_amount` equals the sum of that order's
      `refunds` rows' amounts.
- [ ] `orders.status` is never written by this story, and no notification, event or listener is added.
- [ ] No route, Livewire component, Blade view or policy is added.

## Definition of Done
- [ ] Tests written and green, plus the full existing suite (per
      [contracts.md](../../docs/contracts.md)'s Full Test Suite Gate Rule) — run **unscoped**
      (`php artisan test`, not `--filter`), per
      [base-standards.md](../../docs/conventions/base-standards.md#steps-1-and-2-are-the-iteration-forms-run-both-unscoped-before-declaring-the-work-done).
      **Non-optional here rather than merely recommended:** this story changes the seeded permission
      catalog, so it breaks fourteen assertions in two test files it does not otherwise touch — the
      exact whole-suite blast radius that rule was written for.
- [ ] `vendor/bin/pint --format agent` clean (unscoped, **not** `--dirty`) and Larastan level 7
      passing.
- [ ] Code reviewed (code-reviewer).
- [ ] No security findings (appsec-auditor) — specifically: that no caller can supply `amount` or
      `refunded_by`; that the action authorizes **before** any state disclosure or write; that the
      over-refund and ownership guards read the order's own freshly-locked rows rather than the
      payload; and that the payment-state refusal is deliberately a `ValidationException` (**D-5**)
      rather than an authorization failure.
- [ ] Documentation updated (docs-keeper):
  - [`database/schema.md`](../../docs/database/schema.md) gains a `refunds` section, an
    `orders.refunded_amount` row, and the ER-diagram node plus its two edges
    (`REFUNDS }o--|| ORDER_ITEMS`, `REFUNDS }o--|| USERS`). **Its seeded-rows table also changes** —
    `permissions` 38 → 39 and `role_has_permissions` 37 → 38, with the note widened from "9 modules
    × 4 CRUD actions plus `roles.manage` and `roles.manage-administrators`".
  - [`architecture/authorization.md`](../../docs/architecture/authorization.md) — the permission
    catalog is 39, and this is the **first non-CRUD permission on a non-`roles` module**, which is
    the reusable fact: a module may carry an ability outside the four-verb grid, added via its own
    seeder constant, and it lands in the Roles screen's separately-rendered list rather than in the
    matrix. Three "38-permission catalog" mentions on that page.
  - [`conventions/naming.md`](../../docs/conventions/naming.md) — its permission-names section quotes
    the seeder's constants and states "16 keys per language … covering all 38 permissions"; both
    change, and `ORDER_PERMISSIONS` joins the quoted block.
  - [`conventions/base-standards.md`](../../docs/conventions/base-standards.md)'s directory listing
    gains `Refund` in `app/Models/`.
  - [`database/migrations.md`](../../docs/database/migrations.md) — **verify rather than assume**
    whether this story establishes anything new. Its "no backfill was needed, and why" note is the
    one candidate; a decimal column added with a correct default is otherwise the existing pattern.
  - **Grep the whole tree for the counts, not just the mapped files.** `38` / `37` appear in at least
    twelve places across `docs/README.md`, `architecture/authorization.md`,
    `architecture/overview.md`, `database/schema.md`, `conventions/naming.md`,
    `testing/backend/datasets-and-factories.md`, `testing/backend/feature-integration-tests.md` and
    `security/authorization-patterns.md` — several in files the change→doc mapping routes nowhere.
    This is the [bare-negative-claim](../../docs/errors-log.md#a-docs-this-app-has-no-x-yet-claim-outlived-the-x-by-two-tasks--2026-08-13)
    failure mode arriving as arithmetic.
- [ ] Acceptance criteria met.

## Resolved disagreements

### DR-1 — The refund model: line-item quantities, not an arbitrary monetary amount

**`backend-expert` raised this and explicitly declined to resolve it; `backend-qa` wrote their whole
test plan against one reading while flagging that it would need restating under the other.** It is
the story's central design question and is recorded here rather than settled silently.

| Position | Shape |
| --- | --- |
| **(a) Quantity-based** *(adopted)* | A refund names line items and a number of units of each. The amount is **derived** (`quantity × unit_price`). "Refund half of a €40 line" is expressed as returning units, not as returning money. |
| **(b) Amount-based** *(rejected)* | A refund is a monetary figure unrelated to any line item — a goodwill discount, a shipping-cost concession, a partial write-off. `refunded_quantity` would then be one of two parallel mechanisms rather than the mechanism. |

**Resolution: option (a) is adopted.** Three reasons.

1. **"Record a partial refund" reads most naturally as line items coming back**, and PRD §3.2's own
   auto-cancel rule — "when **every line item** becomes fully refunded" — is stated per line item.
   An amount-based model cannot express that rule at all without a second, quantity-based mechanism
   underneath it, which is (a) with extra steps.
2. **`order_items.refunded_quantity` was purpose-built for this.** 0045's
   [**D-3**](0045-orders-core-crud-backend.md#documented-functional-decisions) shipped that column
   early, with its default and its own test, precisely so this story would not need an `ALTER`
   against a table its siblings are already writing to. Adopting (b) would leave it as an
   unreferenced column and reopen exactly the deferred-schema-change pattern 0045's DR-1 argued
   against.
3. **An amount unrelated to any quantity is a materially different feature that the PRD does not
   describe.** A "goodwill credit" is not a refund: it does not return stock, it does not change what
   the customer received, and — decisively — it must **not** trigger the 100%-refund auto-cancel,
   since crediting a customer €5 for a late delivery cannot cancel their order. Modelling both
   through one column would make that distinction impossible to represent.

**If the business needs a goodwill credit later, it is a new, explicitly scoped story** with its own
column or its own table — not a variant of this one, and not a nullable `order_item_id` on `refunds`.
Recorded as backlog item 3.

### DR-2 — No `OrderPolicy` here, despite 0045's forward note naming this cluster

[0045 **D-13**](0045-orders-core-crud-backend.md#documented-functional-decisions) says an
`OrderPolicy` should be created by "whichever of stories 0048–0052 arrives first", because those
stories introduce "genuinely row-state-dependent rules" — and it names the refund rule as one of
them. **This story does not create one**, and the divergence is deliberate rather than an oversight.

The forward note conflates two different questions, and separating them is what resolves it:

| Question | Answer here | Refusal shape |
| --- | --- | --- |
| *May **this actor** record refunds at all?* | `orders.refund` — a flat capability with **zero** row-level nuance | `AuthorizationException` → **403** |
| *May **this order** be refunded right now?* | Its `payment_status` must be `Paid` or `PartiallyRefunded`, and the units must be outstanding | `ValidationException` → **422** (**D-5**) |

The second question is not about the actor at all: **no** actor may refund an already-fully-refunded
order, Super Admin included. Expressing it as a policy method would render it a 403, which is both
semantically wrong and — by this repo's own step-up reasoning — *indistinguishable from "you lack the
permission"* ([authorization.md](../../docs/architecture/authorization.md#step-up-authentication--the-third-layer)).
Worse, `Gate::before`'s Super Admin bypass would make a policy-expressed state rule inert for the one
actor most likely to try it, which is the pattern
[security/authorization-patterns.md](../../docs/security/authorization-patterns.md#a-rule-that-must-bind-a-super-admin-actor-must-be-a-direct-throw-not-a-gate-check)
already rules on.

**This narrows 0045's backlog item 1 rather than closing it.** Stories 0048/0049/0050 — the hard
block on editing a shipped order, and the manual-cancellation guards — may still warrant an
`OrderPolicy`, and whichever of them lands first should re-evaluate. If one is created, `RecordRefund`'s
`Gate::authorize('orders.refund')` **changes target, not location**.

## Documented functional decisions

Each resolves an open question raised during the debate. Every one is a **conservative, reversible
default the human may override** — the reasoning is recorded so an override is a decision rather than
a rediscovery.

- **D-1 — See [DR-1](#dr-1--the-refund-model-line-item-quantities-not-an-arbitrary-monetary-amount)**
  for the refund model and the rejected alternative.
- **D-2 — Refunds are an event log (`refunds`), not a scalar `refunded_at` column.**
  *(`database-expert`, adopted.)* A single timestamp cannot represent multiple refund events against
  the same line item over time — the same information-loss problem as a bare counter, which is why
  `refunded_quantity` alone is insufficient too. The two coexist by design: **`refunded_quantity` is
  the fast running total, `refunds` is the event log it is derived from**, and a test pins the
  invariant that one equals the sum of the other. On [assumption 17](../../docs/PRD/PRD.md#assumptions--confirmed-decisions)'s
  "no audit / change-history log this phase": that governs **observability logging of arbitrary field
  changes**, not core domain transactions. A refund is a business fact in the same category as an
  order itself — support and accounting genuinely need per-event history — and `refunds` is a domain
  table, not an audit table. `created_at` **is** the refund's event timestamp; no separate
  `refunded_at` column is added.
- **D-3 — `orders.refund` is its own permission, distinct from `orders.edit`.**
  *(`backend-qa`, adopted.)* This repo's precedent — established when task 0015 made the Users
  screen's modal openers ask a **stronger** ability than the write behind them — is that a
  consequential mutation warrants its own ability rather than riding on a broader one. A refund is
  financially irreversible in a way a name-only order edit is not, and separating the two lets a
  business grant order maintenance to staff who may not move money. It is a **non-CRUD permission on
  an existing module slug**, so `MODULES` and `ACTIONS` are untouched and it ships in a new
  `ORDER_PERMISSIONS` constant, mirroring `ROLE_PERMISSIONS`' shape. Both directions of independence
  are tested. **This is the first Epic 3 backend story to change the seeded catalog**, and its
  blast radius (fourteen count assertions, two lang files, twelve doc mentions) is why that fact is
  stated in three places in this document.
- **D-4 — `payment_status` is derived inside `RecordRefund`, never submitted.** The
  action-owns-the-rule convention
  ([base-standards.md](../../docs/conventions/base-standards.md#an-authorization-rule-belongs-to-the-action-not-to-one-of-its-callers))
  applied to **state** rather than to authorization: a caller supplies units, never a status. The
  derivation is written out under the action's step 10, reads **final state rather than a delta**,
  and is total. PRD §3.2 calls payment state "a manual admin-set status" — that phrasing means *no
  payment gateway sets it*, not *a form posts it*; nothing in the PRD asks an administrator to type
  "Reembolsado" next to a refund they just recorded, and letting them would permit a fully refunded
  order to read `Pagado`.
- **D-5 — Refusing a refund by payment state is a `ValidationException`, not an authorization
  failure.** The distinction is the one [DR-2](#dr-2--no-orderpolicy-here-despite-0045s-forward-note-naming-this-cluster)
  turns on, and the precedent is this repo's own: `deleteRole()` refuses a role that still has
  holders with a `ValidationException`, and the model-level guard behind it raises a **409**
  `RoleInUseException` — neither is a 403, because neither is about who is asking
  ([api/routes.md](../../docs/api/routes.md#rolesindex--the-second-permission-gated-route)). A
  refund from `PendingPayment` or `Refunded` is refused for the same kind of reason. **A dedicated
  domain exception was considered and not adopted**: `RoleInUseException` exists because a *model
  event* needed to refuse from a place that could not raise a validation error; here the refusal
  lives in the action, where `ValidationException` is directly available and renders the message on
  the field story 0055 will bind. If a later story ever needs to refuse from a model event, that is
  the point to extract one.
- **D-6 — The over-refund guard reads the item's *current* `refunded_quantity`.**
  `quantity_to_refund <= (quantity - refunded_quantity)`, evaluated against the row-locked value read
  inside the transaction. Stated as its own decision because the plausible-looking wrong version —
  comparing against `quantity` alone — passes every test written against a pristine line item and
  fails only once a line has been refunded twice, which is precisely the scenario a partial-refund
  feature exists to support. `backend-qa` named this the guard's real trigger and the test plan
  covers both sides of the boundary.
- **D-7 — Two migration files, not one combined.** This repo names table creation
  `create_<table>_table` and alteration `<verb>_<what>_to_<table>_table`
  ([migrations.md](../../docs/database/migrations.md#file-naming)); a single file could carry only
  one of the two names and would leave the other invisible to anyone grepping for it. They also touch
  different tables with independent `down()` bodies. `create_refunds_table` takes the earlier
  timestamp for readability — either order works, since neither depends on the other.
- **D-8 — `refunds.amount` is `quantity × unit_price`, snapshotted at refund time; no unit-price
  column is duplicated onto the refund.** `order_items.unit_price` is itself already a snapshot,
  frozen at order time by 0045 and immune to later catalog changes — so a refund row derived from it
  is derived from a value that cannot move. Storing the product only, rather than the multiplicand
  and the multiplier, keeps one number to reconcile against `orders.refunded_amount` instead of two.
  ⚠️ **The scope of `amount` is merchandise only** — see **R-2**.
- **D-9 — `refunds` carries no `order_id`.** The order is reachable as
  `refund->orderItem->order`, and a denormalised copy is a second source of truth for the same fact
  with nothing enforcing that the two agree. `orders.refunded_amount` already provides the
  order-level number a query would otherwise want the FK for, and the "sum this order's refunds"
  query story 0055 might need joins one table. Revisit only with a measured query problem, never
  pre-emptively (backlog item 2).
- **D-10 — `refunds.refunded_by` is `restrictOnDelete()` and NOT NULL, and the actor is derived from
  `Auth::id()` rather than accepted as a parameter.** A refund must always name a real person; a
  `nullOnDelete()` here would leave "who authorised this €400" unanswerable, which is most of the
  column's value. NOT NULL is safe because `Gate::authorize()` has already established an
  authenticated actor by the time the write happens — a guest never reaches step 8. The restrict is
  effectively **insurance**: `users` is soft-deleted, so `User::delete()` never fires this FK at all
  (the same "unreachable today, correct tomorrow" reasoning as 0045's **D-11** cascade). Deriving the
  actor internally rather than accepting it is the 0008a rule — a caller-supplied `refunded_by` is a
  one-argument attribution forgery.
- **D-11 — `refunds.reason` ships now, nullable, always written `null`.** Same shape and same
  justification as 0045's **D-3** (`refunded_quantity`) and **D-10** (`flagged_for_review`): the
  column lives on a table a sibling story will already be writing to, and adding it later is an
  `ALTER`. A refund reason is the single most predictable addition to a refund record, and `text`
  nullable costs nothing while unused. **The logic stays out of scope** — this story ships the column
  and nothing that reads or writes it. See **OQ-3** on whether `__invoke()` should accept it now.
- **D-12 — The whole refund is one `DB::transaction()`, and every guard runs inside it under a row
  lock.** Not merely for atomicity (which the test plan pins) but because the over-refund guard reads
  the exact rows it then writes: checking outside the transaction and writing inside it is a
  time-of-check/time-of-use gap that two concurrent refunds walk straight through. See **R-1**.

### Scope fences: what this story must NOT do

- Must **not** change any order's `status`, or write any code that branches on it — the 100%-refund
  auto-cancel is **0052's**, and this story's own tests assert `status` is untouched.
- Must **not** dispatch or listen for any event, notification or queued job. The derivation's
  observable outcome *is* the seam; the binding is 0052's (**OQ-2**).
- Must **not** create an `OrderPolicy` (**DR-2**).
- Must **not** accept a `payment_status`, an `amount`, or a `refunded_by` from any caller.
- Must **not** implement a monetary-amount refund path, or make `refunds.order_item_id` nullable to
  accommodate one (**DR-1**).
- Must **not** add a route, a Livewire component, a Blade view, a `config/modules.php` entry, or any
  screen copy — story 0055's. The "refund action does not render" half of PRD §3.2's defence-in-depth
  pair is 0055's; this story owns the backend half.
- Must **not** add a new module to `RolePermissionSeeder::MODULES` or a new verb to `::ACTIONS`.
- Must **not** touch `lang/{en,es}/orders.php` — 0045 already ships both payment-status labels.
- Must **not** compute or adjust tax or shipping amounts in response to a refund (0053/0054, and see
  **R-2**).

## Dependencies, risks and open questions

### Dependencies

| Depends on | State | Verified how |
| --- | --- | --- |
| `orders` + `order_items` tables, `Order` / `OrderItem` models | story [0045](0045-orders-core-crud-backend.md) — **hard dependency; ⛔ blocked until `done`** | `refunds.order_item_id` FKs `order_items`; the derivation reads `payment_status`, `quantity`, `refunded_quantity` |
| `order_items.refunded_quantity` column | story [0045](0045-orders-core-crud-backend.md) **D-3** — ships there, inert | This story is its **first and only** consumer; if 0045 shipped without it, this story adds it |
| `App\Enums\PaymentStatus` with all four cases | story [0045](0045-orders-core-crud-backend.md) | `Paid`, `PartiallyRefunded`, `Refunded`, `PendingPayment` are all read here |
| `App\Concerns\OrderValidationRules` | story [0045](0045-orders-core-crud-backend.md) | Extended, not replaced |
| `app/Actions/Orders/` folder | story [0045](0045-orders-core-crud-backend.md) | `RecordRefund` lands beside `CreateOrder` |
| `users` table + soft deletes | **shipped** (Epic 1) | `refunds.refunded_by` FKs it; **D-10** depends on the soft delete existing |
| `Gate::before` Super Admin bypass | **shipped** (Epic 1) | [authorization.md](../../docs/architecture/authorization.md) |
| The seeded permission catalog + Roles screen label composition | **shipped** (tasks 0002, 0011) | **D-3** extends the first; the second is why `roles.actions.refund` is required |

#### What depends on this story

- **0052 — auto-cancel on 100% refund.** **This story is 0052's hard dependency.** 0052 listens on
  the `PaymentStatus::Refunded` transition this story derives and moves `orders.status` to
  `Cancelled` as a system side effect, "distinct from the manual cancel action, which stays blocked
  in those states" (PRD §3.2). Its binding mechanism is **OQ-2**.
- **0055 — the Orders UI.** Renders the refund control, hides it in `PendingPayment` / `Refunded`
  (the UI half of PRD §3.2's defence-in-depth pair, whose backend half is here), displays
  `refunded_amount` and the per-item refund history, and passes a reason if **OQ-3** is answered yes.
- **0050 — manual-cancellation guards.** Reads `PartiallyRefunded`, one of the three states in which
  manual cancellation is blocked. It does not depend on this story's *code*, but it does depend on
  that state being reachable.
- **0053/0054 — tax resolution.** Once `tax_amount` is non-zero, `refunded_amount`'s merchandise-only
  scope becomes visible; see **R-2**.

### Risks

- **R-1 — Two concurrent refunds against the same order are a time-of-check/time-of-use race.**
  Without a lock, both read `refunded_quantity = 0`, both pass the over-refund guard, and both
  increment — leaving `refunded_quantity > quantity` and a `payment_status` derived from a state that
  never validly existed. *Mitigation:* **D-12** — the items are re-read with `lockForUpdate()`
  **inside** the transaction, and every guard runs against that locked read. A database `CHECK
  (refunded_quantity <= quantity)` was considered as a last-word backstop and **not adopted**: MySQL
  8.0.16+ supports it, but Laravel's schema builder has no first-class API for it, this repo has no
  CHECK-constraint precedent, and a raw-DDL constraint is invisible to `db:table` review. Recorded so
  a later story can adopt it deliberately rather than rediscover the option.
- **R-2 — `refunded_amount` is a *merchandise* total, not "money returned to the customer".** It sums
  `quantity × unit_price` and therefore excludes tax and shipping. Today that is exactly right,
  because 0045 creates every order with `tax_amount` and `shipping_amount` at `0.00` — but the moment
  stories 0053/0054/0037 populate them, a fully refunded order's `refunded_amount` will be **less
  than its `total`**, and a reader will reasonably assume that is a bug. *Mitigation:* the column's
  scope is stated in its schema docs, in the model's `@property` docblock and here; whether a refund
  should return proportional tax and shipping is a real product question those stories must answer,
  and it is recorded as **OQ-5** rather than pre-judged.
- **R-3 — Money compared as floats.** `decimal(10,2)` casts to a **string** in Eloquent. A test
  written as `expect($refund->amount)->toBe(20.00)` fails confusingly, and one written as
  `toEqual(20.0)` passes for the wrong reason. *Mitigation:* the test plan states decimal-string
  comparison explicitly for every money assertion — 0045's identical R-3, restated because this story
  writes money in three places.
- **R-4 — `Gate::authorize('orders.refund')` fails closed on a typo, silently.** A misspelled ability
  denies everyone, and denial looks exactly like a correct refusal — and unlike 0045's abilities,
  this one is **new**, so a typo would also mean the permission is never seeded and no test would
  notice the pairing. *Mitigation:* a positive success test beside the 403, plus the literal-ability
  assertion against the seeded catalog, plus the "every permission resolves a real label" test, which
  fails on an unseeded or misspelled name from a third direction.
- **R-5 — The permission-catalog change is the widest-blast-radius edit in Epic 3 so far, and most of
  it is invisible from this story's own folder.** Fourteen assertions in two seeder test files, two
  lang files, and at least twelve documentation mentions of "38"/"37". *Mitigation:* the unscoped
  suite run is stated as non-optional in the Definition of Done rather than inherited from the
  conventions page, and the docs bullet requires a **grep**, not the change→doc mapping.
- **R-6 — This document goes stale while it waits.** It is blocked behind 0045, which is itself
  blocked behind five Epic 2 stories, every one of which may change during its own Phase 4/5 — the
  "a deferred finding is a claim about a tree, and the task file freezes while the tree does not"
  failure recorded in
  [errors-log.md](../../docs/errors-log.md#a-deferred-storys-findings-were-claims-about-a-tree-that-no-longer-existed-and-one-of-them-would-have-reopened-a-bug-in-this-log--2026-08-23).
  *Mitigation:* Phase 2's INVEST review must be **re-run** immediately before Phase 3, and it must
  re-verify against the shipped code: `order_items.refunded_quantity`'s existence and type,
  `unit_price`'s precision, `PaymentStatus`'s four cases and their backing values, the trait's real
  method names, and the current permission count (which may no longer be 38 if a sibling story adds
  one first). **Every number and name in this file is a reading aid, not a locator.**

### Resolved questions

| Question raised | By | Resolved as |
| --- | --- | --- |
| Is a partial refund line-item quantities or an arbitrary monetary amount? | backend-expert (raised, explicitly unresolved) | **[DR-1](#dr-1--the-refund-model-line-item-quantities-not-an-arbitrary-monetary-amount)** — quantity-based; amount-based rejected as a different feature |
| Does refunding need its own permission, or does `orders.edit` cover it? | backend-qa | **D-3** — its own, `orders.refund`; a seeder change, the first in Epic 3 |
| Should `refunded_at` be a scalar column on `order_items`? | database-expert | **D-2** — no; a `refunds` event-log table instead |
| Does "no audit log this phase" forbid a `refunds` table? | database-expert | **D-2** — no; that assumption governs field-change observability, not core domain transactions |
| Where does the `payment_status` derivation live? | backend-expert | **D-4** — inside `RecordRefund`, from final state, never a delta |
| Is a state-based refund refusal a 403 or a validation error? | backend-expert | **D-5** — `ValidationException`; and **[DR-2](#dr-2--no-orderpolicy-here-despite-0045s-forward-note-naming-this-cluster)** for why that means no policy |
| Does this story create the `OrderPolicy` 0045 D-13 forecast? | product-owner (from 0045) | **[DR-2](#dr-2--no-orderpolicy-here-despite-0045s-forward-note-naming-this-cluster)** — no; 0045's backlog item is narrowed, not closed |
| What is the over-refund guard compared against? | backend-qa | **D-6** — the item's *current* `refunded_quantity`, not its original `quantity` |
| Does `refunds` carry an `order_id`? | database-expert | **D-9** — no; derivable via `orderItem->order` |
| Is `refunded_by` nullable? | database-expert | **D-10** — no; the gate guarantees an actor, and "who authorised this" is the column's value |
| One combined migration or two? | product-owner | **D-7** — two, per this repo's migration naming convention |

### Open questions

**OQ-1 — `refunds.order_item_id`: `cascadeOnDelete()` or `restrictOnDelete()`? Settle before Phase 3
— it changes this story's migration.** `database-expert`'s contribution specifies `cascadeOnDelete()`,
which is correct under 0045 **D-11**'s rule (*cascade when the child is part of the parent*) and is
unreachable today, since orders are never deleted. **But `order_items` rows are not orders**: story
0049 lets an administrator **remove a line item** from an order in `Pendiente`/`Procesando`, and such
an order can legitimately be `Pagado` or `Parcialmente reembolsado`. Under a cascade, removing a
refunded line item silently deletes its financial records and leaves `orders.refunded_amount`
overstating a sum that no longer has rows behind it.

- **(a) `restrictOnDelete()` (recommended)** — the database refuses to delete a line item that carries
  refunds, making "you cannot remove a line you have already refunded" an invariant rather than a rule
  0049 must remember. It fails loudly, in the one direction where silence is expensive, and it matches
  `sales_regions.parent_id`'s precedent (*restrict where a cascade would destroy configured data* —
  and financial records are strictly more valuable than configured data).
- **(b) `cascadeOnDelete()`** — as contributed, with a **forward constraint written into 0049**: a
  line item carrying refunds must not be deletable, enforced in the action. Cheaper here, but it moves
  the guarantee into a story that does not own this table, which is the shape
  [0045's DR-1](0045-orders-core-crud-backend.md#dr-1--resolved-disagreement--fk-sequencing-vs-unconstrained-placeholder-columns)
  spent three paragraphs refusing.

Changing this later is an `ALTER` on a live table, so it is materially cheaper to answer now. The
migration snippet above ships (b) as contributed, with a pointer to this question.

**OQ-2 — What does story 0052 bind to for the auto-cancel? Non-blocking; 0052's call, recorded so it
is a choice.** This story ships the derivation and stops. Three shapes exist: a model event on `Order`
(`updated` + `isDirty('payment_status')`), a domain event dispatched by `RecordRefund`, or a direct
call from `RecordRefund` into 0052's action. **Recommended: a domain event (`OrderFullyRefunded`)
dispatched by `RecordRefund` after the transaction commits** — a model event would fire for *any*
write to `payment_status` including a future manual one (which may be correct, but should be a
decision rather than a coincidence) and, per the transaction-side-effect rule, a listener firing
inside the transaction could cancel an order whose refund then rolls back. Adding the dispatch is a
one-line change to `RecordRefund` that 0052 makes; nothing here needs to anticipate it.

**OQ-3 — Should `RecordRefund::__invoke()` accept an optional `?string $reason = null` now?
Non-blocking; settle in Phase 3.** **D-11** ships the column but this story never writes it, so
`__invoke(Order $order, array $items)` is sufficient. **Recommended: add the trailing optional
parameter now.** `__invoke()`'s signature is a **public contract** that direct-call tests and every
future caller must match
([code-style.md](../../docs/conventions/code-style.md#exception-an-actions-own-dependency-is-constructor-injected-when-the-method-signature-is-a-public-contract)),
so widening it later is a real cost, while a trailing optional parameter is free and breaks nothing.
The counter-argument is equally valid and is why this is a question rather than a decision: an unused
parameter is speculative, and this file has argued twice against speculation.

**OQ-4 — Can a refund be corrected or reversed? Non-blocking; backlog.** `refunds` has no
`deleted_at` and `RecordRefund` only ever increments, so a mistyped refund is currently permanent.
That is the conservative direction — an immutable financial log — and nothing in the PRD asks for
reversal. Recorded only so nobody assumes it was overlooked; the answer, if one is ever needed, is a
compensating negative-quantity event rather than a delete, and that is a new story.

**OQ-5 — Does a refund return proportional tax and shipping? Non-blocking today; blocking for
0053/0054.** See **R-2**. Today every order has `tax_amount` and `shipping_amount` at `0.00`, so the
question is unobservable. It becomes real the moment tax resolution lands, and it belongs to the
story that populates those columns — not to this one, which would otherwise be guessing at
arithmetic against values that are always zero.

**OQ-6 — Should `RecordRefund`'s gate use the refusal-logging helper? Non-blocking; recommended.**
Task 0015b established `App\Actions\Auth\LogRefusedPrivilegedAttempt` as the copyable "recording a
refusal" pattern a later epic's privileged action inherits rather than re-invents
([authorization.md](../../docs/architecture/authorization.md#recording-a-refusal--what-every-gate-owes-the-audit-trail)).
**Recommended: adopt it here**, since a refused refund is the most consequential denied write in
Epic 3 and the cost is one constructor dependency. Not decided unilaterally because **no amigo raised
it** and sibling story 0045's `CreateOrder` does not use it — adopting it here alone creates an
inconsistency inside one folder. If adopted, backlog item 4 applies it to `CreateOrder` too.

### Technical tasks for the backlog

Derived from this story, none of them in scope:

1. **Create `OrderPolicy`** in whichever of stories 0048/0049/0050 first needs a genuinely
   actor-and-row-dependent rule, and re-point `RecordRefund`'s and `CreateOrder`'s `Gate::authorize()`
   at it. This **narrows** 0045's backlog item 1 rather than replacing it — see
   [DR-2](#dr-2--no-orderpolicy-here-despite-0045s-forward-note-naming-this-cluster).
2. **Revisit indexing on `refunds`** once story 0055's refund-history view exists and its real query
   shape is known — measure, never assume, and treat **D-9**'s no-`order_id` decision as revisitable
   at the same time if an order-level refund query proves hot.
3. **A goodwill-credit feature**, if the business ever needs a monetary adjustment unrelated to
   returned units ([DR-1](#dr-1--the-refund-model-line-item-quantities-not-an-arbitrary-monetary-amount)).
   Its defining constraint is already known: it must **not** trigger the 100%-refund auto-cancel.
4. **Apply the refusal-logging helper to `CreateOrder`** if **OQ-6** is answered yes, so the two
   `app/Actions/Orders/` classes do not diverge.
5. **A `CHECK (refunded_quantity <= quantity)` constraint** as a database-level backstop to **R-1**,
   if this repo ever adopts CHECK constraints generally.

## Provenance

- **PRD source:** [§3.2 Orders](../../docs/PRD/PRD.md#32-orders) — specifically the four refund
  scenarios (`Record a full refund`, `Record a partial refund`, `A partially-refunded order can still
  be refunded`, and both `Scenario Outline`s over `Pendiente de pago` / `Reembolsado`) and the
  acceptance criterion that *"a refund is only permitted from `Pagado` or `Parcialmente reembolsado`
  … and the backend independently rejects a refund attempted in those states (defense in depth)"*.
  The auto-cancel scenario is deliberately **excluded** — it is story 0052's.
- **Process:** [workflow.md](../../docs/workflow.md) Phase 1 — Three Amigos debate. Contributions from
  `backend-expert`, `backend-qa` and `database-expert`, composed by `product-owner` as facilitator.
  **Two questions were raised without being resolved by the amigos who raised them** — the refund
  model and the permission — and both are recorded as decisions with their rejected alternatives
  ([DR-1](#dr-1--the-refund-model-line-item-quantities-not-an-arbitrary-monetary-amount), **D-3**)
  rather than settled silently. A third, [DR-2](#dr-2--no-orderpolicy-here-despite-0045s-forward-note-naming-this-cluster),
  resolves a tension with a decision recorded in a *sibling* story.
- **Gherkin conventions:** every scenario opens with a named business-role actor ("an order
  administrator") and carries exactly one `When`, per
  [gherkin-guidelines.md](../../docs/testing/frontend/gherkin-guidelines.md) rules 1 and 3 —
  mandatory across all Gherkin in this project, per the incident recorded in
  [errors-log.md](../../docs/errors-log.md).
- **Stage:** `new`, and **blocked** — see the banner under [Description](#description). It moves to
  `ai-spec/tasks/in-progress/` at the start of Phase 3, and to `ai-spec/tasks/done/` at Phase 7 —
  both moves change this file's directory depth, so every relative link above must be re-resolved on
  each move (both directions), per
  [workflow.md](../../docs/workflow.md#link-integrity-check-on-every-stage-move).
- **Epic 3 decomposition:** the refund story of the Orders cluster. Siblings referenced by number
  (0045 orders foundation, 0048–0050 status transitions and cancellation guards, 0052 auto-cancel,
  0053–0054 tax resolution, 0055 UI) because several of their files may not exist yet.
