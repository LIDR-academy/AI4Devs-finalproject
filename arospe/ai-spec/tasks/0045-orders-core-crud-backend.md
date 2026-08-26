# [0045] Orders core CRUD backend

## Description
Introduce the `orders` and `order_items` tables and the creation write path behind PRD
[§3.2 Orders](../../docs/PRD/PRD.md#32-orders): an order references a **Customer**, one or more
**product/variant line items** (each carrying a quantity and **the price at the time of order**), a
**payment method**, and — later — the **Sales Region** used for tax and the **shipping rate/carrier**
selected for delivery. This story owns the two greenfield UUID migrations, the `Order` / `OrderItem`
models and factories, the two status enums, the validation rule set, `CreateOrder`, and the documented
detail- and list-retrieval contracts its sibling stories consume. No route, no Livewire component, no
Blade markup, no notification, no status transitions, no refunds, no tax resolution.

> ## ⛔ BLOCKED — cross-epic dependency (read this before Phase 3)
>
> **This story is fully specified now, but its Phase 3 implementation cannot start until PRD Epic 2
> stories [0024](0024-products-core-crud-backend.md) (Products), [0029](0029-product-variants-backend.md)
> (Product Variants), [0035](0035-shipping-carriers-backend.md) (Shipping Carriers),
> [0036](0036-shipping-rate-rules-backend.md) (Shipping Rates) and
> [0038](0038-payment-methods-bank-transfer-backend.md) (Payment Methods) are all `done`.**
>
> `orders` and `order_items` carry foreign keys into `products`, `product_variants`, `shipping_rates`
> and `payment_methods` — four tables that **do not exist in code yet**. Every FK in this repository,
> without exception, is written as `constrained()` against an already-existing table, and this story
> is not the one to invent an alternative. The full reasoning, including the alternative that was
> proposed and rejected, is recorded as [**DR-1**](#dr-1--resolved-disagreement--fk-sequencing-vs-unconstrained-placeholder-columns).
>
> **What is *not* blocked:** this document. Debating and schema-designing the story now is deliberate
> — it lets Epic 2's remaining stories land against a known consumer, and it makes the forward
> dependencies visible while they are still cheap to honour.

## Type
backend | includes database-expert: **yes**

### Three Amigos participants

- `backend-expert` — model/enum/action/trait shape, the write path, the permission it authorizes on.
- `backend-qa` — risk-based test design, the price-snapshot regression case, the "nothing is falsely
  resolved" assertions, the two open items resolved as **D-5** and **D-6**.
- `database-expert` — the two migrations, column types and precisions, delete behaviour per FK, index
  discipline, and the four open questions resolved as **D-1** through **D-4**.

### Why this is one story and not two

`orders` and `order_items` are a single invariant: *an order is a customer plus at least one priced
line item, and the price is frozen at the moment of ordering*. The parent table cannot be specified
without deciding what a line item snapshots (**D-2**, **D-4**), and the child table cannot be written
at all without its parent's key. Splitting them would leave one half shipping a table nothing writes
and the other half unable to migrate. `CreateOrder` joins them because the totals on `orders` are
derived from the rows in `order_items` inside one transaction — see **D-8**.

## Gherkin

```gherkin
Feature: Order records (backend)

  # --- Creating an order ---

  Scenario: Create an order with a single line item
    Given an order administrator, with an existing customer and an existing product
    When they create an order for that customer with one line item
    Then the order record is stored with that single line item

  Scenario: Create an order with several line items
    Given an order administrator, with an existing customer and three existing products
    When they create an order for that customer with three line items
    Then the order record is stored with all three line items

  Scenario: Create an order for a specific product variant
    Given an order administrator, with an existing product that has variants
    When they create an order whose line item names one of those variants
    Then the line item is stored against that variant as well as its product

  Scenario: A new order is assigned a human-readable order number
    Given an order administrator, with an existing customer
    When they create an order for that customer
    Then the order record carries a unique, support-usable order number distinct from its identifier

  Scenario: A new order opens in the earliest status
    Given an order administrator, with an existing customer
    When they create an order for that customer
    Then the order is recorded as pending, with its payment recorded as pending payment

  Scenario: A new order references a configured payment method
    Given an order administrator, with bank transfer configured as a payment method
    When they create an order naming that payment method
    Then the order record references that configured payment method

  # --- The price at the time of order ---

  Scenario: A line item stores the price at the time of order
    Given an order administrator, with an existing product priced at 10.00
    When they create an order with one line item for that product
    Then the line item records a unit price of 10.00

  Scenario: A later product price change does not move an existing order's line item
    Given an order administrator, with an existing order whose line item was priced at 10.00
    When the product's catalog price is changed to 25.00
    Then the existing order's line item still records a unit price of 10.00

  Scenario: A line item stores the product's name and code at the time of order
    Given an order administrator, with an existing product
    When they create an order with one line item for that product
    Then the line item records that product's name and code alongside its reference

  Scenario: A line item's total is the unit price multiplied by its quantity
    Given an order administrator, with an existing product priced at 10.00
    When they create an order with one line item for three of that product
    Then the line item records a line total of 30.00

  # --- The order's address is frozen at order time ---

  Scenario: An order stores the customer's addresses as they stood at order time
    Given an order administrator, with a customer holding a shipping and a billing address
    When they create an order for that customer
    Then the order record holds its own copy of both addresses

  Scenario: A later change to the customer's address does not move an existing order
    Given an order administrator, with an existing order for a customer
    When that customer's shipping address is subsequently changed
    Then the existing order still holds the shipping address as it stood at order time

  # --- Rejecting an invalid order ---

  Scenario: An order with no line items is rejected
    Given an order administrator, with an existing customer
    When they create an order for that customer with no line items at all
    Then creation is rejected with a validation message and no order record is stored

  Scenario: A line item with a quantity of zero is rejected
    Given an order administrator, with an existing customer and an existing product
    When they create an order whose line item has a quantity of zero
    Then creation is rejected with a validation message and no order record is stored

  Scenario: A line item with a negative quantity is rejected
    Given an order administrator, with an existing customer and an existing product
    When they create an order whose line item has a negative quantity
    Then creation is rejected with a validation message and no order record is stored

  Scenario: An order naming no customer is rejected
    Given an order administrator, with an existing product
    When they create an order without naming a customer
    Then creation is rejected with a validation message and no order record is stored

  Scenario: An order naming an unknown customer is rejected
    Given an order administrator, with an existing product
    When they create an order naming a customer that does not exist
    Then creation is rejected with a validation message and no order record is stored

  Scenario: An order naming no payment method is rejected
    Given an order administrator, with an existing customer and an existing product
    When they create an order without naming a payment method
    Then creation is rejected with a validation message and no order record is stored

  Scenario: A line item naming an unknown product is rejected
    Given an order administrator, with an existing customer
    When they create an order whose line item names a product that does not exist
    Then creation is rejected with a validation message and no order record is stored

  Scenario: A rejected order leaves no line items behind
    Given an order administrator, with an existing customer and two existing products
    When they create an order whose second line item is invalid
    Then no order record and no line item record is stored

  # --- What this story deliberately leaves unresolved ---

  Scenario: A new order has no sales region resolved yet
    Given an order administrator, with an existing customer
    When they create an order for that customer
    Then the order record carries no sales region, tax resolution being a separate concern

  Scenario: A new order has no shipping rate selected yet
    Given an order administrator, with an existing customer
    When they create an order for that customer
    Then the order record carries no shipping rate, delivery selection being a separate concern

  Scenario: A new order is not flagged for manual review
    Given an order administrator, with an existing customer
    When they create an order for that customer
    Then the order record is not flagged for manual review

  # --- Authorization ---

  Scenario: An administrator without the orders create permission cannot create an order
    Given a signed-in administrator whose role does not grant the orders create permission
    When they attempt to create an order
    Then the attempt is refused and no order record is stored

  Scenario: An administrator holding the orders create permission can create an order
    Given a signed-in administrator whose role grants the orders create permission
    When they create an order
    Then the order record is stored

  Scenario: A Super Admin may create an order without holding the permission explicitly
    Given a Super Admin holding no individual orders permission
    When they create an order
    Then the order record is stored

  # --- Detail retrieval ---

  Scenario: An order's detail includes its customer
    Given an order administrator, with an existing order
    When they retrieve that order's detail
    Then the order's customer is returned with it

  Scenario: An order's detail includes its line items
    Given an order administrator, with an existing order carrying three line items
    When they retrieve that order's detail
    Then all three line items are returned with it

  Scenario: An order's detail reports an unresolved sales region as unresolved
    Given an order administrator, with an existing order whose sales region has not been resolved
    When they retrieve that order's detail
    Then the sales region is reported as absent rather than as a resolved value

  # --- List retrieval ---

  Scenario: Orders are listed newest first
    Given an order administrator, with several existing orders created at different times
    When they retrieve the order list
    Then every order is returned, most recently created first

  Scenario: An empty order book returns no orders
    Given an order administrator, with no orders recorded
    When they retrieve the order list
    Then no orders are returned
```

## Files to create/modify

### Migration 1 — `orders` (new table)

`database/migrations/<ts>_create_orders_table.php` — **new**. Shape confirmed by `database-expert`
against this repo's greenfield-UUID precedent,
[`create_sales_regions_table`](../../docs/database/migrations.md#uuid-primary-keys), and against
[`create_customers_table`](0041-customers-crud-backend.md) for the address-column lengths.

```php
Schema::create('orders', function (Blueprint $table): void {
    $table->uuid('id')->primary();
    $table->string('order_number', 20)->unique();                       // D-1
    $table->foreignUuid('customer_id')->constrained()->restrictOnDelete();

    $table->string('status', 20)->default(OrderStatus::Pending->value);            // D-7
    $table->string('payment_status', 20)->default(PaymentStatus::PendingPayment->value);

    // Nullable, and NULL at creation: resolution is a sibling story's job (D-9).
    $table->foreignUuid('sales_region_id')->nullable()->constrained()->restrictOnDelete();
    $table->foreignUuid('shipping_rate_id')->nullable()->constrained()->restrictOnDelete();

    // NOT nullable: PRD §3.2 requires every order to reference a configured method.
    $table->foreignUuid('payment_method_id')->constrained()->restrictOnDelete();

    $table->decimal('tax_rate', 6, 3)->nullable();                      // snapshot; mirrors sales_regions.rate
    $table->decimal('subtotal', 10, 2);
    $table->decimal('tax_amount', 10, 2);
    $table->decimal('shipping_amount', 10, 2);
    $table->decimal('total', 10, 2);

    $table->boolean('flagged_for_review')->default(false);              // D-10

    // Address snapshot — frozen at order time, never a live join (D-4).
    // Lengths mirror `customers` column-for-column.
    $table->string('shipping_address_line1', 255)->nullable();
    $table->string('shipping_address_line2', 255)->nullable();
    $table->string('shipping_city', 100)->nullable();
    $table->string('shipping_postal_code', 20)->nullable();
    $table->string('shipping_province', 100)->nullable();
    $table->string('shipping_country', 2)->nullable();
    $table->string('billing_address_line1', 255)->nullable();
    $table->string('billing_address_line2', 255)->nullable();
    $table->string('billing_city', 100)->nullable();
    $table->string('billing_postal_code', 20)->nullable();
    $table->string('billing_province', 100)->nullable();
    $table->string('billing_country', 2)->nullable();

    $table->timestamps();
});

// down(): Schema::dropIfExists('orders');
```

### Migration 2 — `order_items` (new table, later timestamp)

`database/migrations/<ts+1>_create_order_items_table.php` — **new**. It FKs into `orders`, so its
timestamp must be later; Laravel rolls back in reverse timestamp order, so the `dropIfExists` pair is
symmetric with no manual FK drops.

```php
Schema::create('order_items', function (Blueprint $table): void {
    $table->uuid('id')->primary();

    // cascadeOnDelete, diverging from every other FK in this story ON PURPOSE:
    // an order_item has no independent meaning without its order. See D-11.
    $table->foreignUuid('order_id')->constrained()->cascadeOnDelete();

    // nullOnDelete, NOT restrictOnDelete: catalog cleanup must never be blocked by
    // historical orders, and the snapshot columns below survive the null. See D-2.
    $table->foreignUuid('product_id')->nullable()->constrained()->nullOnDelete();
    $table->foreignUuid('product_variant_id')->nullable()->constrained()->nullOnDelete();

    // Snapshots — the line item's identity survives its catalog row being deleted.
    $table->string('product_name', 255);      // matches products.name
    $table->string('product_sku', 128);       // matches product_variants.sku, the longer of the two

    $table->unsignedInteger('quantity');
    $table->decimal('unit_price', 10, 2);     // price at the time of order — the story's core invariant
    $table->decimal('line_total', 10, 2);

    $table->unsignedInteger('refunded_quantity')->default(0);   // D-3 — column only; the logic is 0051/0052

    $table->timestamps();
});

// down(): Schema::dropIfExists('order_items');
```

Non-negotiable properties of both files:

- **Every FK is `constrained()` against a table that already exists** at the time these migrations
  run. That is what [**DR-1**](#dr-1--resolved-disagreement--fk-sequencing-vs-unconstrained-placeholder-columns)
  buys, and it is the reason the story is blocked rather than partially shipped.
- **No explicit `$table->index()` anywhere.** `constrained()` already leaves every FK column indexed;
  writing one by hand emits a second DDL statement and produces the redundant index recorded in
  [errors-log.md](../../docs/errors-log.md#a-redundant-users_uuid_unique-index-survived-the-uuid-primary-key-conversion--2026-08-12).
  Verify with `php artisan db:table orders` / `db:table order_items` after migrating, never by reading
  the migration ([migrations.md](../../docs/database/migrations.md#an-fk-column-does-not-also-get-an-explicit-index-here)).
- **`order_number` UNIQUE** is the only non-FK index on either table (**D-1**).
- **No index on `status` or `payment_status`** — the cardinality argument applied to `users.status` and
  to `sales_regions`: two low-cardinality tokens over a backoffice-sized table, where the index costs a
  write on every insert and update and buys a scan the optimizer would likely decline anyway.
- **No `deleted_at` on either table.** Orders are never deleted in this phase; `Cancelado` is the
  terminal state PRD §3.2 defines, and it is a `status` value, not a soft delete.
- Every string column is **length-capped**; every money-like column is `decimal`, never `float`
  ([migrations.md](../../docs/database/migrations.md#uuid-primary-keys)).

### Enums — `app/Enums/` (new)

```php
// app/Enums/OrderStatus.php
enum OrderStatus: string
{
    case Pending = 'pending';
    case Processing = 'processing';
    case Shipped = 'shipped';
    case Delivered = 'delivered';
    case Cancelled = 'cancelled';

    public function label(): string
    {
        return __('orders.statuses.'.$this->value);
    }
}
```

```php
// app/Enums/PaymentStatus.php
enum PaymentStatus: string
{
    case PendingPayment = 'pending_payment';
    case Paid = 'paid';
    case Refunded = 'refunded';
    case PartiallyRefunded = 'partially_refunded';

    public function label(): string
    {
        return __('orders.payment_statuses.'.$this->value);
    }
}
```

- **TitleCase keys, lowercase snake_case backing values** — the `UserStatus` / `SalesRegionKind`
  precedent ([naming.md](../../docs/conventions/naming.md#classes)). PRD §3.2 states the vocabulary in
  Spanish (`Pendiente → Procesando → Enviado → Entregado`, `Pendiente de pago`, …); the **backing
  values stay English tokens** and the Spanish is a translation, exactly as `users.statuses.*` handles
  it. `App\Enums\RoleName` is the only enum here whose backing values are not lowercase tokens, and
  that exception exists because those values are compared byte-for-byte against a database row — not
  the case here.
- **Two lang groups, not one.** `orders.statuses.*` and `orders.payment_statuses.*` are separate key
  groups, mirroring the two separate dimensions PRD §3.2 defines. (`backend-expert`'s contribution
  named `orders.statuses.` for both; a single group would collide on nothing today but conflates two
  vocabularies that evolve independently.)
- **No transition logic on either enum.** Which status may follow which — and the backward-transition
  confirmation, the hard block on editing a shipped order, the 100%-refund auto-cancel — are stories
  0048–0052. This story ships the value set and nothing that reasons about it.

### Model — `app/Models/Order.php` (new)

Scaffolded with `php artisan make:model Order -m -f --no-interaction`. Follows
[base-standards.md](../../docs/conventions/base-standards.md#model-conventions):

- `use HasFactory, HasUuids;`, `@property string $id`, and **no** `$keyType` / `$incrementing`.
- `casts()` carries `'status' => OrderStatus::class`, `'payment_status' => PaymentStatus::class`.
  Money columns cast to strings by Eloquent's `decimal` handling and are compared as strings in tests
  — never as floats.
- `#[Fillable]` lists the administrator-writable columns only. **Deliberately omitted**, written via
  `forceFill()` from `CreateOrder` alone: `order_number` (derived, **D-1**), `status`,
  `payment_status`, `subtotal`, `tax_amount`, `shipping_amount`, `total`, `tax_rate`,
  `flagged_for_review`, `sales_region_id`, `shipping_rate_id`. Omission **is** this codebase's
  mass-assignment guard, and every one of these is either derived arithmetic, a status a later story
  owns, or a tax input — none may ever arrive from a form.
- Relations: `belongsTo` → `customer`, `paymentMethod`, `salesRegion` (nullable), `shippingRate`
  (nullable); `hasMany` → `items` (`OrderItem`).
- **No `SoftDeletes`.**

### Model — `app/Models/OrderItem.php` (new)

- `use HasFactory, HasUuids;`, same conventions.
- `#[Fillable]` covers `product_id`, `product_variant_id`, `quantity`. Everything else —
  `product_name`, `product_sku`, `unit_price`, `line_total`, `refunded_quantity` — is **omitted**: all
  five are derived by `CreateOrder` from the catalog row, and a fillable `unit_price` would hand a
  caller the ability to set its own price, which is the single sharpest write in this story.
- Relations: `belongsTo` → `order`, `product` (nullable), `productVariant` (nullable).

### Factories — `database/factories/OrderFactory.php`, `OrderItemFactory.php` (new)

- `OrderFactory` default state produces a valid pending order with a customer and payment method, no
  sales region, no shipping rate, `flagged_for_review => false`. Named states: `withItems(int $n)`,
  `paid()`, and `forCustomer(Customer $c)`.
- `OrderItemFactory` default state produces a line item with a product, a quantity and a unit price
  matching the product's current price. Named state: `forVariant(ProductVariant $v)`.
- Neither factory may produce a state this story's own validation would reject — a factory that can
  create a zero-line-item order makes **D-5**'s test meaningless.

### Validation trait — `app/Concerns/OrderValidationRules.php` (new)

Mirrors [`UserValidationRules`](../../app/Concerns/UserValidationRules.php) /
[`CustomerValidationRules`](0041-customers-crud-backend.md) exactly — `<Noun>ValidationRules` trait,
`<noun>Rules()` methods returning rule arrays, flat and single-concern
([naming.md](../../docs/conventions/naming.md#traits-and-their-methods)):

```php
protected function orderRules(): array;              // the whole payload
protected function orderCustomerRules(): array;      // ['required','uuid', Rule::exists(Customer::class, 'id')]
protected function orderPaymentMethodRules(): array; // ['required','uuid', Rule::exists(PaymentMethod::class, 'id')]
protected function orderItemsRules(): array;         // ['required','array','min:1']   <- D-5
protected function orderItemRules(): array;          // per-item: product, optional variant, quantity
```

- `orderItemsRules()` is what makes **D-5** executable: `min:1` on the items array is the entire
  zero-line-item rejection, and it is a rule rather than a database constraint because no engine can
  express "a parent row must have at least one child" without a trigger.
- Quantity: `['required','integer','min:1']`. `min:1` rejects both `0` and a negative, and `integer`
  rejects `1.5` — three of the story's negative scenarios resolve to this one rule.
- `Rule::exists()` on `customer_id` uses the **default** (soft-delete-scoped-unaware) query, which
  means a soft-deleted customer's id would pass. That is deliberate and recorded as **D-12**.

### Action — `app/Actions/Orders/CreateOrder.php` (new subfolder)

Invokable, imperative-verb-phrase class with no `Action` suffix, resolved from the container and never
`new`-ed ([code-style.md](../../docs/conventions/code-style.md#exception-an-actions-own-dependency-is-constructor-injected-when-the-method-signature-is-a-public-contract)).
`__invoke(array $attributes): Order`, performing in this order:

1. **`Gate::authorize('orders.create')` as the first statement.** The rule lives in the class that
   performs the operation, not in a caller that does not exist yet
   ([base-standards.md](../../docs/conventions/base-standards.md#an-authorization-rule-belongs-to-the-action-not-to-one-of-its-callers)).
   No `OrderPolicy` (**D-13**). `orders.create` is **already seeded** —
   `RolePermissionSeeder::MODULES` carries `orders`, so all four `orders.*` abilities exist; **no
   catalog change, no new permission, no re-seed.**
2. **Validate the whole payload** through the trait, including the per-item rules.
3. **Resolve every catalog row it will snapshot** — the products and variants named by the line items,
   and the customer — reading each from the database rather than trusting anything in the payload.
   A caller supplies an *id* and a *quantity*; it never supplies a name, a SKU or a price.
4. **Open a `DB::transaction()`** and, inside it: write the `orders` row (with the frozen address
   snapshot copied from the resolved `Customer`, **D-4**), write each `order_items` row with its
   derived `product_name` / `product_sku` / `unit_price` / `line_total`, then write the derived totals
   back onto the parent (**D-8**).
5. **Assign `order_number`** under the constraints in **D-1**, catching a `23000` `QueryException`
   from the UNIQUE index and retrying rather than surfacing it.

> **Phase 3 must re-read the transaction-side-effect rule before writing step 4.** Wrapping work in a
> `DB::transaction()` relocates every side effect the wrapped code already performed — the mistake
> recorded in [errors-log.md](../../docs/errors-log.md#wrapping-existing-code-in-a-dbtransaction-moved-a-cache-flush-nobody-had-written--2026-08-21).
> Here the constraint is forward-looking and specific: **story 0046's "new order received"
> notification must be dispatched *after* the commit, never inside it**, or a rolled-back order mails
> a customer about an order that does not exist.

### Translations — `lang/en/orders.php` + `lang/es/orders.php` (new)

Two key groups only — `statuses` and `payment_statuses` — key-for-key identical across both locales
([naming.md](../../docs/conventions/naming.md#translation-keys)). These ship here rather than with the
UI story because the two enums' `label()` methods resolve them, exactly as `UserStatus::label()`
resolves `users.statuses.*`. **No screen copy, no validation-message overrides, no button labels** —
those belong to story 0055, which extends this file rather than creating it.

### Explicitly **not** touched by this story

- `database/seeders/RolePermissionSeeder.php` — `orders` is already in `MODULES`.
- `routes/*.php`, `config/modules.php`, `app/Livewire/**`, `resources/views/**` — story 0055's.
- `app/Notifications/**`, `app/Listeners/**` — story 0046's ("new order received").
- `app/Policies/**` — none is created (**D-13**).
- `App\Models\Customer` — no `orders()` relation is added here; story 0047 (customer order history)
  owns it.
- Anything that *reads* a status to decide whether something is permitted — stories 0048–0052.

## Tests to perform

All Feature tests unless marked otherwise; new folder `tests/Feature/Orders/`, plus
`tests/Unit/Enums/`. This story ships no route, so **every** authorization test here is action-level;
story 0055 owns the HTTP-level ones ([testing/README.md](../../docs/testing/README.md)).

### Model, enum & schema

- [ ] Unit test: `OrderStatus` and `PaymentStatus` each expose exactly the cases PRD §3.2 names, with
      the expected backing values, asserted as a set — so a case added or renamed fails loudly.
- [ ] Unit test: each enum's `label()` resolves a translation key rather than returning the raw value,
      and every case has a key present in **both** `lang/en/orders.php` and `lang/es/orders.php`.
- [ ] Unit test: `Order` and `OrderItem` use `HasUuids`; a created order's `id` is a 36-character UUID
      string.
- [ ] Integration test: factory round-trip for both models — every column persists and reloads
      byte-identically.
- [ ] Integration test (mass-assignment guard): `Order::create([... 'total' => 999.99 ...])` does not
      write `total`, and `OrderItem::create([... 'unit_price' => 0.01 ...])` does not write
      `unit_price`. **This is the sharpest structural test in the story** — the omission-as-guard
      convention is only real if something fails when it is undone.

### Creation — happy paths

- [ ] Integration test: an order with one line item persists both rows, with `order_items.order_id`
      pointing at the parent.
- [ ] Integration test: an order with three line items persists exactly three child rows.
- [ ] Integration test: a line item naming a variant persists **both** `product_id` and
      `product_variant_id`.
- [ ] Integration test: a new order's `status` is `Pending` and its `payment_status` is
      `PendingPayment`, read back as enum instances rather than strings.
- [ ] Integration test: `order_number` is non-empty, ≤ 20 characters, and **differs from** the order's
      `id` — a test that asserts only "not null" would pass against an implementation that copies the
      UUID in.
- [ ] Integration test: creating two orders in the same request produces two **different**
      `order_number` values (the minimum collision check; the concurrency case is **R-1**).

### The price-at-time-of-order snapshot — the highest-risk case

- [ ] **Dedicated regression test, not folded into a happy path:** create an order for a product
      priced at `10.00`; mutate the product's `price` to `25.00` and save it; re-fetch the **order**
      from the database (`->fresh()`, never the in-memory instance) and assert the line item's
      `unit_price` is still `10.00`. `backend-qa` named this the single highest-risk behaviour in the
      story, because the failure mode — a live join instead of a snapshot — is invisible until a price
      changes, and by then the historical data is already wrong.
- [ ] Integration test: the same regression for `product_name` and `product_sku` — rename the product
      after the order exists and assert the line item still carries the old name and code.
- [ ] Integration test: `line_total` equals `unit_price × quantity`, asserted for quantity 1 and
      quantity 3, on **decimal string** comparison rather than float equality.
- [ ] Integration test: deleting the catalog product nulls `order_items.product_id` while
      `product_name` / `product_sku` / `unit_price` survive intact (**D-2**'s `nullOnDelete()`
      behaviour, asserted rather than assumed).

### The address snapshot

- [ ] Integration test: an order for a customer with both addresses copies all twelve columns onto the
      order row.
- [ ] **Regression test:** change the customer's `shipping_city` after the order exists, re-fetch the
      order, and assert its own `shipping_city` is unchanged. Same failure mode as the price snapshot,
      and the reason **D-4** exists.
- [ ] Integration test: an order for a customer holding **no** addresses persists twelve `null`s rather
      than failing — a customer may legitimately have none (story 0041 **D-3**).

### Creation — validation failures

- [ ] Negative test: **zero line items** → `ValidationException` on `items`, and **zero rows in both
      tables** (**D-5**).
- [ ] Negative test (dataset): quantity `0`, `-1`, `1.5`, `'abc'` → `ValidationException` on the item's
      quantity, no rows written.
- [ ] Negative test: missing `customer_id`, and a `customer_id` naming no row — as two separate cases.
- [ ] Negative test: missing `payment_method_id`, and one naming no row — two separate cases.
- [ ] Negative test: a line item naming a product that does not exist.
- [ ] **Negative test (atomicity):** an order whose *second* line item is invalid writes **no** `orders`
      row and **no** `order_items` row. Asserting only "the order was not created" would pass against
      an implementation that writes the parent, fails, and leaves it orphaned — assert both tables are
      empty.

### Nothing is falsely resolved

`backend-qa` flagged this group explicitly: a false "resolved" state here would mask stories 0053 /
0054 / 0037's actual work, and it would do so *silently*, because a populated column looks like a
working feature.

- [ ] Integration test: a newly created order's `sales_region_id` is `null`.
- [ ] Integration test: a newly created order's `shipping_rate_id` is `null`.
- [ ] Integration test: a newly created order's `tax_rate` is `null` — **not** `0.000`. The two must
      not share a meaning, exactly as `sales_regions.rate` documents
      ([schema.md](../../docs/database/schema.md#sales_regions)).
- [ ] Integration test: a newly created order's `flagged_for_review` is `false`.
- [ ] Integration test: `tax_amount` and `shipping_amount` are `0.00` and `total` equals `subtotal`
      (**D-8**), asserted as decimal strings.

### Authorization

- [ ] Negative test: an administrator holding `orders.view` but not `orders.create` is refused by
      `CreateOrder` with an `AuthorizationException`, and **zero rows are written in both tables**.
- [ ] Integration test: an administrator holding `orders.create` succeeds — the positive case beside
      the 403, without which a mistyped ability passes silently
      ([authorization.md](../../docs/architecture/authorization.md)).
- [ ] Integration test: a Super Admin holding no individual `orders.*` grant succeeds, via
      `Gate::before`.
- [ ] Negative test: the ability string is asserted **literally** (`orders.create`) against
      `RolePermissionSeeder`'s catalog, so a typo cannot fail closed unnoticed.

### Detail retrieval

- [ ] Integration test: the detail contract (**D-14**) returns the order with its `customer` and its
      `items` relations loaded, asserted **without** additional queries (`DB::listen` or an
      `->relationLoaded()` assertion) so the eager-load contract is executable rather than prose.
- [ ] Integration test: an order whose `sales_region_id` / `shipping_rate_id` are `null` returns
      `null` for both relations rather than throwing.

### List retrieval

- [ ] Integration test: three orders created at distinct timestamps are returned **newest first**
      (**D-6**). Set `created_at` explicitly rather than relying on insertion speed — three rows
      inserted in one test share a second, and an ordering test that cannot distinguish them carries
      no signal.
- [ ] Integration test: two orders sharing an identical `created_at` are returned in a **deterministic**
      order (**D-6**'s `id` tie-break), asserted by running the query twice and comparing.
- [ ] Integration test: with no rows, retrieval returns an empty collection rather than throwing.

### Blocked until a sibling ships — recorded, not silently dropped

- [ ] **A line item naming a non-existent product** is testable as written above once `products`
      exists; `backend-qa` originally flagged this whole group as blocked, and
      [**DR-1**](#dr-1--resolved-disagreement--fk-sequencing-vs-unconstrained-placeholder-columns) is
      what unblocks it — the story's own precondition is that `ProductFactory`, `ProductVariantFactory`,
      `ShippingRateFactory` and a seeded `PaymentMethod` all exist before Phase 3 begins. **If any of
      them is missing when Phase 3 starts, the story is not ready; do not stub a factory to proceed.**

### Deliberately not tested

- Any status **transition** (0048–0052), any refund (0051/0052), any tax resolution (0053/0054), any
  notification (0046), anything rendered (0055).
- Migration `up()`/`down()` mechanics — `RefreshDatabase` runs every migration each run; `down()`
  symmetry is a code-review item ([what-not-to-test.md](../../docs/testing/qa/what-not-to-test.md)).
- The `refunded_quantity` column's *behaviour*. This story ships the column and its `0` default and
  nothing that reads it; a test asserting "it defaults to 0" is worth having, but a test asserting what
  happens when it is set is 0051/0052's and would be a ghost test here.

## Expected outcome

Once done, the application can record an order: a persisted `orders` row with a UUID primary key, a
unique human-readable `order_number`, a `restrictOnDelete` reference to a `Customer`, a required
reference to a configured payment method, its own frozen copy of the shipping and billing addresses as
they stood at order time, and one or more `order_items` rows each carrying a quantity plus the
product's **name, code and unit price at the time of order** — values that survive both a later catalog
price change and the catalog row's own deletion. `CreateOrder` authorizes itself against the
already-seeded `orders.create` permission, validates its whole payload, refuses an order with no line
items, and writes both tables inside one transaction so a rejected order leaves nothing behind. Both
status dimensions are recorded as backed enums in their earliest states.

**Nothing is resolved that this story does not own:** `sales_region_id`, `shipping_rate_id` and
`tax_rate` are `null`, `flagged_for_review` is `false`, `tax_amount` and `shipping_amount` are `0.00`,
and no status ever changes. Nothing renders, nothing notifies, and no order can be edited, cancelled,
refunded or advanced — those are stories 0046 and 0048 through 0055, every one of which now has a
table to build against.

## Acceptance criteria

- [ ] An `orders` table exists with a UUID v7 primary key and exactly the columns listed above,
      verified with `php artisan db:table orders`.
- [ ] An `order_items` table exists with a UUID v7 primary key and exactly the columns listed above,
      verified with `php artisan db:table order_items`.
- [ ] **Every foreign key on both tables is written as `constrained()` against an existing table.**
      No placeholder `uuid()` column, no deferred-FK comment, no retrofit migration
      ([**DR-1**](#dr-1--resolved-disagreement--fk-sequencing-vs-unconstrained-placeholder-columns)).
- [ ] Delete behaviour is exactly: `orders.customer_id`, `sales_region_id`, `shipping_rate_id`,
      `payment_method_id` → `restrictOnDelete()`; `order_items.order_id` → `cascadeOnDelete()`;
      `order_items.product_id`, `product_variant_id` → `nullOnDelete()`.
- [ ] `order_number` carries a UNIQUE index; no explicit `$table->index()` exists on either table, and
      the only other indexes present are the ones `constrained()` created.
- [ ] `App\Enums\OrderStatus` and `App\Enums\PaymentStatus` exist with PRD §3.2's exact value sets,
      lowercase snake_case backing values, and `label()` resolving `orders.statuses.*` /
      `orders.payment_statuses.*` respectively, with both lang files key-for-key identical.
- [ ] `Order` and `OrderItem` use `HasUuids` and `HasFactory`, cast both status columns to their enums,
      and omit every derived, status and tax column from `#[Fillable]` — pinned by a test that fails if
      the omission is undone.
- [ ] An order cannot be created with zero line items; the rejection is a `ValidationException` on the
      items field and leaves both tables empty.
- [ ] A line item records `product_name`, `product_sku` and `unit_price` as of order time, and those
      values are unaffected by a later change to — or deletion of — the catalog row.
- [ ] An order holds its own copy of the customer's shipping and billing addresses, unaffected by a
      later change to the customer record.
- [ ] `CreateOrder` calls `Gate::authorize('orders.create')` as its first statement, is refused for an
      actor lacking the ability, and passes for a Super Admin via the existing bypass.
- [ ] A newly created order has `sales_region_id`, `shipping_rate_id` and `tax_rate` all `null`,
      `flagged_for_review` `false`, `tax_amount` and `shipping_amount` `0.00`, and `total` equal to
      `subtotal`.
- [ ] No permission is added to `RolePermissionSeeder`; the four `orders.*` abilities are used exactly
      as already seeded.
- [ ] No route, Livewire component, Blade view, policy, notification or listener is added, and
      `App\Models\Customer` gains no `orders()` relation.
- [ ] The detail-retrieval (**D-14**) and list-retrieval (**D-6**) contracts are stated in this file
      and each pinned by a test.

## Definition of Done
- [ ] Tests written and green, plus the full existing suite (per
      [contracts.md](../../docs/contracts.md)'s Full Test Suite Gate Rule) — run **unscoped**
      (`php artisan test`, not `--filter`), per
      [base-standards.md](../../docs/conventions/base-standards.md#steps-1-and-2-are-the-iteration-forms-run-both-unscoped-before-declaring-the-work-done).
- [ ] `vendor/bin/pint --format agent` clean (unscoped, **not** `--dirty`) and Larastan level 7 passing.
- [ ] Code reviewed (code-reviewer).
- [ ] No security findings (appsec-auditor) — specifically: that no price, name, SKU or total can be
      supplied by a caller; that the action authorizes before its first write; and that the
      `Rule::exists()` on `customer_id` is soft-delete-unaware **by decision** (**D-12**) rather than by
      oversight.
- [ ] Documentation updated (docs-keeper):
  - [`database/schema.md`](../../docs/database/schema.md) gains `orders` and `order_items` sections
    plus their ER-diagram nodes and edges.
  - [`conventions/base-standards.md`](../../docs/conventions/base-standards.md)'s directory listing
    gains `app/Actions/Orders/`, `Order` / `OrderItem` in `app/Models/`, and `OrderStatus` /
    `PaymentStatus` in `app/Enums/`.
  - [`database/migrations.md`](../../docs/database/migrations.md) — this repo's **first
    `cascadeOnDelete()` on a UUID FK** and its **first `nullOnDelete()` anywhere**. Both diverge from
    `create_sales_regions_table`'s `restrictOnDelete()` and both do so for stated reasons (**D-11**,
    **D-2**); record the three-way rule rather than leaving a reader to infer it from three files.
  - **Grep for bare negative claims this story falsifies**, rather than trusting the change→doc
    mapping — the failure mode recorded in
    [errors-log.md](../../docs/errors-log.md#a-docs-this-app-has-no-x-yet-claim-outlived-the-x-by-two-tasks--2026-08-13).
- [ ] Acceptance criteria met.

## Resolved disagreement

### DR-1 — Resolved disagreement — FK sequencing vs. unconstrained placeholder columns

**`backend-expert` and `database-expert` did not agree on the central design question of this story,
and it is recorded here in full rather than silently settled.**

The problem: `orders` and `order_items` need FK columns into `products`, `product_variants`,
`shipping_rates` and `payment_methods`. **None of those four tables exists in code.** Epic 2 is still
in progress; of everything this story references, only `sales_regions` (task 0016) and `customers`
(story [0041](0041-customers-crud-backend.md)) are real, shipped tables.

| Position | Proposed by | Shape |
| --- | --- | --- |
| **(b)** Ship now with placeholder columns | `backend-expert` | The four columns ship as plain nullable `uuid()` with **no** `constrained()` call, each carrying an explicit `$table->index()` (since there is no FK to auto-create one), plus a documented forward dependency: a later `ALTER` migration — owned by each Epic 2 sibling story — retrofits the real `constrained()` FK once its table exists. Rationale: Orders can exist and be tested now, rather than blocking all of Epic 3 on Epic 2's remaining backlog. |
| **(a)** Sequence the implementation | `database-expert` | The story is **debated and schema-designed now** (this document) but **blocked from Phase 3** until 0024, 0029, 0035, 0036 and 0038 land. Rationale: every FK in this repository, without exception, uses `constrained()` against an already-existing table; there is zero precedent for an unconstrained-then-retrofitted FK, and this repo's own [errors-log.md](../../docs/errors-log.md) records two separate incidents of exactly the "ship it now, fix it properly later" pattern causing real drift. |

**Resolution: option (a) is adopted.** Three reasons, in order of weight.

1. **The precedent is not merely strong, it is exceptionless — and it was verified rather than
   recalled.** [`database/migrations.md`](../../docs/database/migrations.md) documents four FK
   examples across three tables (`passkeys.user_id`, `sales_regions.parent_id`, and the re-added
   passkeys FK in the UUID finalize migration), and **every single one** is `constrained()` against a
   table that already exists. The document's own rules are written *around* that assumption: "let
   `constrained()` supply the FK's index" is stated as **the** rule for FK indexing, and option (b)
   would require writing explicit `$table->index()` calls on four columns — reintroducing, by design,
   precisely the hand-written index the
   [redundant `users_uuid_unique`](../../docs/errors-log.md#a-redundant-users_uuid_unique-index-survived-the-uuid-primary-key-conversion--2026-08-12)
   entry exists to prevent. Then, when the retrofit `ALTER` lands, `constrained()` would find a
   suitable index already present or create a second — and nobody would notice either way, because an
   index nobody wrote is not visible in a diff.

2. **This project's errors log records two independent incidents of the deferred-fix pattern, and both
   share option (b)'s exact failure signature: the cleanup is invisible.** The redundant
   `users_uuid_unique` index survived a five-migration conversion because "the migration diff will not
   show you an index that nobody removed". The
   [`DB::transaction()` wrapper](../../docs/errors-log.md#wrapping-existing-code-in-a-dbtransaction-moved-a-cache-flush-nobody-had-written--2026-08-21)
   relocated a permission-cache flush that appeared nowhere in the diff. Option (b) creates four
   obligations of the same shape, spread across five *other* stories, each of which must remember to
   add an `ALTER` migration for a table it does not own. That is not a forward dependency; it is four
   forward dependencies filed against people who have no reason to open this document.

3. **The stated benefit is smaller than it looks.** Option (b) does not actually let this story be
   *tested* now: `backend-qa`'s own test plan needs a `ProductFactory`, a `ProductVariantFactory` and a
   seeded `PaymentMethod` to create a single valid order, and the price-snapshot regression — the
   highest-risk case in the story — is untestable without a real `products.price` to mutate. So option
   (b) would ship a schema and a partially-exercised action, with the story's central invariant unproven
   until the same five stories land anyway. Given that, the sequencing cost is largely nominal and the
   drift risk is not.

**What was *accepted* from `backend-expert`'s position, unchanged:** everything else in their
contribution — the file list, the enum shape and backing values, the self-authorizing action, the
"no route/component/policy" boundary, and the confirmation that `orders.*` permissions are already
seeded. The disagreement is narrow and is confined to sequencing.

**How to reverse this if the schedule demands it.** If Epic 2's remaining backlog slips far enough that
Epic 3 stalling becomes the larger cost, option (b) becomes a legitimate trade — but it must then be
taken **explicitly, with the four retrofit `ALTER` migrations created as numbered backlog stories in the
same change**, not as prose in a task file. A forward dependency that exists only as a sentence is the
thing this resolution is refusing.

### DR-2 — A smaller conflict, resolved: defaults on `status` / `payment_status`

`database-expert`'s schema specifies `default(Pending)` / `default(PendingPayment)` on the two status
columns; `backend-expert`'s contribution states there should be **no** default, since the creation flow
always sets both explicitly. Both are reasonable and the repo carries both precedents —
`products.status` defaults to `Draft`, while `sales_regions.kind` deliberately carries **no** default
because "a default would let a mis-seeded row pass as a `Country`".

**Resolution: keep the defaults, and keep `CreateOrder` writing both explicitly anyway.** The
distinguishing principle, recorded so the next enum column does not have to re-derive it: **a default
is safe when it is the domain's genuine "nothing has happened yet" state and no invariant couples the
column to another; it is unsafe when it is a *classification* a mis-written row could silently
inherit.** `Pending` and `PendingPayment` are the former — the least-advanced, least-privileged value
in each dimension, so a row that somehow skips the action reads as *less* progressed than reality, never
more. `sales_regions.kind` is the latter, and its `kind ⟺ parent_id IS NOT NULL` invariant is exactly
the coupling this rule names. `backend-expert`'s point survives intact as a requirement on the action
rather than on the column, and the acceptance criteria assert the values on a created order rather than
the column's default.

## Documented functional decisions

Each resolves an open question raised during the debate. Every one is a **conservative, reversible
default the human may override** — the reasoning is recorded so an override is a decision rather than a
rediscovery.

- **D-1 — `orders` carries an `order_number`: a support-usable reference distinct from the UUID.**
  *(Resolves `database-expert`'s open question 1.)* A UUID v7 is unreadable over the phone and
  unwriteable on a delivery note, and PRD §3.2's whole framing is a human administrator working an
  order book. **The column and its UNIQUE index are this story's job; the exact generator is a Phase 3
  implementation detail** — but three constraints on it are not negotiable and are stated here so
  Phase 3 does not invent something unsafe:
  - **Format:** `ORD-{YYYY}-{sequential}`, zero-padded to six digits (`ORD-2026-000001`). Fifteen
    characters, comfortably inside `VARCHAR(20)`, and the year segment makes the sequence resettable
    annually without a collision.
  - **The UNIQUE index has the last word.** Whatever generator is chosen, `CreateOrder` catches a
    `23000` `QueryException` and retries — never surfaces it. Two administrators creating an order in
    the same instant is a real scenario, and a "max + 1" `SELECT` is a race by construction (**R-1**).
  - **`order_number` is never mass-assignable and never caller-supplied.** It is derived, written with
    `forceFill()` from the action alone.
- **D-2 — `order_items.product_id` / `product_variant_id` are `nullOnDelete()`, not
  `restrictOnDelete()`.** *(Resolves `database-expert`'s open question 2; adopted as recommended.)*
  A `restrict` here would make historical orders block catalog cleanup forever: an administrator
  retiring a discontinued product would be refused for a reason they cannot act on, and the older the
  store gets the more products become undeletable. `nullOnDelete()` is safe **only because the snapshot
  columns exist** — `product_name`, `product_sku` and `unit_price` survive the null, so the line item
  remains fully legible as history with a dangling reference rather than becoming a blank row. Note the
  dependency direction: this decision is what makes **D-4**'s snapshot reasoning load-bearing rather
  than merely tidy. Both directions are asserted by a test.
- **D-3 — `order_items.refunded_quantity` ships now, with its `0` default, even though nothing reads
  it.** *(Resolves `database-expert`'s open question 3; adopted as recommended, and it is the one
  decision in this file that argues *for* adding something early.)* PRD §3.2's "when **every** line item
  becomes fully refunded, the order auto-transitions to `Cancelado`" is per-line-item bookkeeping, so
  stories 0051/0052 need a per-line-item column. Adding it later means an `ALTER` against a table those
  same sibling stories are already writing to — which is exactly the deferred-schema-change pattern
  [**DR-1**](#dr-1--resolved-disagreement--fk-sequencing-vs-unconstrained-placeholder-columns) has just
  argued against, applied to this story's own table. **Consistency requires taking the same position
  twice.** The *logic* stays firmly out of scope: this story ships a column with a default and a test
  asserting that default, and nothing that reads it. A `refunded_at` timestamp was considered and
  **omitted** — unlike the quantity, nothing about the 100%-refund rule needs it, and 0051/0052 can add
  it with full knowledge of what they need it for.
- **D-4 — `orders` carries its own frozen copy of the shipping and billing addresses.**
  *(Resolves `database-expert`'s open question 4; adopted as recommended.)* Twelve columns mirroring
  `customers` column-for-column, written from the resolved `Customer` at creation and never re-read
  from it afterwards. Two reasons, the second decisive:
  - **The same rule already applied to `unit_price`.** Never re-derive historical financial data from a
    mutable source. A customer who moves house must not retroactively change where an order from two
    years ago was shipped.
  - **PRD §3.2's tax resolution says "the **order's** shipping address" and "the **billing** address",
    and stories 0053/0054 will read exactly that.** If those columns do not exist, "the order's
    address" can only mean a live join to `customers` — so a customer moving from Península to Canarias
    would silently change the tax basis of every past order. That is the worst possible place in this
    system for a mutable source of truth, and it is the reason this is not deferred to the tax stories:
    by the time they need it, the wrong reading is already the obvious one.
  - Nullable throughout, because story 0041 **D-3** makes a customer's addresses optional. An order for
    an address-less customer stores twelve `null`s; making tax resolvable from an absent address is
    0053/0054's problem, not this story's.
- **D-5 — An order must have at least one line item; zero is rejected with a validation error.**
  *(Resolves `backend-qa`'s first open item — conservative default.)* PRD §3.2 states an order
  references "**one or more** product/variant line items", which reads as a requirement rather than a
  description. The failure modes are asymmetric: an order that cannot be created is visible and
  immediately actionable, while an empty order silently breaks every downstream assumption at once — its
  subtotal is 0.00, its tax basis is undefined, and the 100%-refund auto-cancel rule
  ("**every** line item is fully refunded") is vacuously true for an order with no line items, which
  would auto-cancel it. Enforced as `['required','array','min:1']` rather than a database constraint,
  since no engine expresses "a parent must have at least one child" without a trigger. **Relaxing this
  later is a validation-only change** — no column moves — so the conservative direction is the cheap one.
- **D-6 — The list-retrieval contract is `Order::query()->orderByDesc('created_at')->orderByDesc('id')`.**
  *(Resolves `backend-qa`'s second open item.)* Newest first, deliberately unlike story 0041's
  alphabetical `Customer` list, and for a domain reason rather than a stylistic one: **an order book is
  a queue, not a directory.** A customer list's primary job is looking a known person up by name; an
  order list's is seeing what has arrived and needs working. Reverse-chronological is what every
  order-management screen in the industry does, and it is what makes the list usable before any filter
  exists. The `id` tie-break is not decoration: UUID v7 is time-ordered, so it produces a stable,
  meaningful secondary sort for rows sharing a `created_at` second — without it, a list of orders
  created in the same request has no deterministic order and its test is flaky by construction. **Like
  0041 D-15, this is a specification and not a scope method**: a local scope whose only caller does not
  exist yet is speculative. It is pinned by a test here so the contract is executable, and story 0055
  pins it again at the component layer.
- **D-7 — See [DR-2](#dr-2--a-smaller-conflict-resolved-defaults-on-status--payment_status)** for the
  status-column defaults and the rule that governs the next enum column.
- **D-8 — At creation, `subtotal` is derived from the line items, `tax_amount` and `shipping_amount`
  are `0.00`, and `total = subtotal + tax_amount + shipping_amount`.** The arithmetic identity is
  written out in full rather than assigning `total = subtotal`, so it stays true unchanged the moment
  stories 0053/0054/0037 populate the other two terms — a later story fills a value in, it does not
  rewrite the formula. `tax_rate` stays **`NULL`**, never `0.000`: `sales_regions.rate` already
  establishes that "not configured" and "a legitimate 0%" cannot share a representation
  ([schema.md](../../docs/database/schema.md#sales_regions)), and an order whose tax has not been
  resolved must be distinguishable from one resolved to a zero-rated region.
- **D-9 — `sales_region_id` and `shipping_rate_id` are nullable and `NULL` at creation.** This story
  creates the reference points; resolving them is stories 0053/0054 (tax) and 0037/0054 (shipping).
  `backend-qa` flagged the risk directly: a false "resolved" state here would look like working
  behaviour and mask those stories' actual work, so the "nothing is falsely resolved" test group
  asserts each of them absent rather than leaving it to inspection.
- **D-10 — `flagged_for_review` is a column here and a behaviour elsewhere.** PRD §3.2's geo/fraud check
  — a virtual product whose billing address does not match the purchaser's IP-derived location gets
  flagged rather than auto-resolving tax — belongs to the tax-resolution story. The column ships now for
  the same reason as **D-3**: it lives on a table a sibling story will already be writing to, and adding
  it later is an `ALTER` against live rows. It defaults to `false` and nothing in this story ever sets
  it to `true`.
- **D-11 — `order_items.order_id` is `cascadeOnDelete()`, the only cascade in this story.** It diverges
  from every other FK here, and from `sales_regions.parent_id`'s `restrictOnDelete()`, on purpose: an
  `order_item` has **no independent meaning** without its order, exactly as a passkey has none without
  its user (`create_passkeys_table`'s own `cascadeOnDelete()`). The rule the two cases share, and which
  the docs pass must record: **cascade when the child is a part of the parent; restrict when the child
  is a peer whose data would be destroyed.** Note this cascade is close to unreachable today — orders
  are never deleted in this phase (`Cancelado` is a status, not a delete) — so it is insurance against a
  future hard-delete path rather than a live behaviour.
- **D-12 — `Rule::exists()` on `customer_id` is soft-delete-unaware, deliberately.** `Rule::exists()`
  does **not** apply the `SoftDeletingScope`
  ([schema.md](../../docs/database/schema.md#soft-deletes)), so a soft-deleted customer's id passes
  validation. That is the *correct* behaviour here and is left as-is: story
  [0042](0042-customers-soft-delete-backend.md) soft-deletes customers precisely so their order history
  survives, and PRD §3.1's stated reason is "so a customer's orders are never orphaned". Refusing to
  record an order against a trashed customer would fight that. Recorded explicitly so `appsec-auditor`
  sees a decision rather than an oversight, and so a later story does not "fix" it. **If a product rule
  ever says an order may not be *created* for a deleted customer, that is a rule on the action, not a
  change to the FK or the validator.**
- **D-13 — No `OrderPolicy`; the action authorizes with the raw permission ability.** This story's only
  write is a creation, and "may this actor create an order" reduces to `orders.create` with zero
  row-level nuance — a policy would be one method returning `$user->can()`. Story 0041 **D-12** set this
  precedent for `Customer`. **The forward note matters more than the decision:** unlike customers,
  orders almost certainly *will* need a policy, because stories 0048–0052 introduce genuinely
  row-state-dependent rules (editing line items is blocked once `Enviado`; manual cancellation is
  blocked in three states; a refund is refused outside `Pagado` / `Parcialmente reembolsado`). Whichever
  of those stories arrives first should create `OrderPolicy` — at which point `CreateOrder`'s
  `Gate::authorize()` **changes target, not location**.
- **D-14 — The detail-retrieval contract:** `Order::query()->with(['customer', 'items', 'paymentMethod',
  'salesRegion', 'shippingRate'])->findOrFail($id)`, returning the order with its customer, its line
  items and its payment method loaded, and `salesRegion` / `shippingRate` as `null` while unresolved.
  Eager-loaded rather than lazy because story 0055's detail screen renders all of them on one page, and
  a lazy `items` relation makes an N+1 the default. Like **D-6**, a specification pinned by a test rather
  than a scope method — and the test asserts the relations are *loaded*, not merely retrievable, since
  those are different bugs.

### Scope fences: what this story must NOT do

- Must **not** change any order's `status` or `payment_status` after creation, or write any code that
  branches on either (0048–0052).
- Must **not** implement any refund path, or read `refunded_quantity` (0051/0052).
- Must **not** resolve a Sales Region, compute a tax amount, or set `flagged_for_review` (0053/0054).
- Must **not** select or price a shipping rate (0037/0054).
- Must **not** create, dispatch or listen for a "new order received" notification (0046).
- Must **not** add a route, a Livewire component, a Blade view, a `config/modules.php` entry, or any
  screen copy to `lang/{en,es}/orders.php` beyond the two status-label groups (0055).
- Must **not** add an `orders()` relation to `App\Models\Customer` or an order-history query (0047).
- Must **not** add a permission to `RolePermissionSeeder` — the four `orders.*` abilities are already
  seeded.
- Must **not** seed order fixture data outside `DatabaseSeeder`'s `['local','testing']` gate; orders are
  user data, not required application data.

## Dependencies, risks and open questions

### Dependencies

| Depends on | State | Verified how |
| --- | --- | --- |
| `customers` table + `App\Models\Customer` | story [0041](0041-customers-crud-backend.md) — **hard dependency; confirm it is `done` before Phase 3** | `orders.customer_id` FKs it; the address snapshot copies its twelve columns |
| `customers.deleted_at` (soft delete) | story [0042](0042-customers-soft-delete-backend.md) — **related; confirm its state at the same time** | **D-12** depends on it existing; 0042's own forward note prescribes `restrictOnDelete()` on `orders.customer_id`, which this story honours verbatim. If 0042 has not landed, **D-12** is simply not yet reachable — it does not change this story's schema |
| `sales_regions` table | task 0016 — **done (shipped)** | `docs/database/schema.md` § `sales_regions`; `orders.tax_rate`'s `decimal(6,3)` mirrors `sales_regions.rate` |
| `orders.*` permissions in the seeded catalog | **shipped** | `RolePermissionSeeder::MODULES` carries `orders` |
| `Gate::before` Super Admin bypass | **shipped** (Epic 1) | `docs/architecture/authorization.md` |
| The greenfield UUID migration pattern | **shipped** (task 0016) | `create_sales_regions_table` |

#### ⛔ Blocked — cross-epic dependency

**Phase 3 cannot begin until all five of these are `done`:**

| Blocking story | Provides | Consumed by |
| --- | --- | --- |
| [0024](0024-products-core-crud-backend.md) — Products | `products` table, `products.price` / `.name` / `.sku`, `ProductFactory` | `order_items.product_id`; the price/name/SKU snapshots and their regression tests |
| [0029](0029-product-variants-backend.md) — Product Variants | `product_variants` table, `ProductVariantFactory` | `order_items.product_variant_id`; the variant line-item scenario |
| [0035](0035-shipping-carriers-backend.md) — Shipping Carriers | `shipping_carriers` | transitively, via `shipping_rates` |
| [0036](0036-shipping-rate-rules-backend.md) — Shipping Rates | `shipping_rates` table | `orders.shipping_rate_id` |
| [0038](0038-payment-methods-bank-transfer-backend.md) — Payment Methods | `payment_methods` table, the seeded bank-transfer row | `orders.payment_method_id` (NOT NULL — no order can be created without it) |

The reasoning is [**DR-1**](#dr-1--resolved-disagreement--fk-sequencing-vs-unconstrained-placeholder-columns).
**If any of the five is missing when Phase 3 starts, the story is not ready.** Do not stub a table, stub
a factory, or drop a `constrained()` call to proceed — that is option (b) arriving by the back door,
one file at a time.

#### What depends on this story

**This story is a hard dependency for every remaining Orders story in Epic 3** — nothing else in the
epic can be implemented until `orders` and `order_items` exist:

- **0046** — "new order received" notification. Hooks `CreateOrder`'s successful return; must dispatch
  **after** the transaction commits (see the note under the action's step 4).
- **0047** (+ **0044**) — the customer's read-only order history. Adds the `orders()` relation to
  `App\Models\Customer` that this story deliberately omits, and the detail view that renders it inside
  0044's Customers screen.
- **0048–0052** — status transitions, the backward-transition confirmation, the hard block on editing a
  shipped order, manual-cancellation guards, refunds and the 100%-refund auto-cancel. These read
  `status` / `payment_status` / `refunded_quantity`, all of which ship here as inert columns, and they
  are where `OrderPolicy` should be created (**D-13**).
- **0053–0054** — Sales Region resolution and tax computation. These fill in `sales_region_id`,
  `tax_rate`, `tax_amount`, `flagged_for_review`, and they read the **order's own** frozen address
  snapshot rather than the customer's live one (**D-4**).
- **0055** — the Orders list and detail UI. Implements **D-6** and **D-14**, adds the route with
  `can:orders.view` **and** the matching `config/modules.php` entry naming the same single ability (a
  gated route without its registry entry is a screen nothing links to), and extends
  `lang/{en,es}/orders.php` with screen copy.

### Risks

- **R-1 — `order_number` generation is a race by construction.** Any "read the max, add one" generator
  produces duplicates the moment two administrators create an order concurrently. *Mitigation:*
  **D-1** makes the UNIQUE index the last word and requires a `23000` catch with retry; the test plan
  asserts two orders in one request differ, and Phase 3 must not treat that as proof of concurrency
  safety — it is the minimum, not the case.
- **R-2 — The price snapshot is invisible when it is wrong.** An implementation that reads
  `$product->price` at *render* time instead of writing it at *creation* time passes every happy-path
  test, because nothing has changed the price yet. *Mitigation:* the dedicated mutate-then-re-fetch
  regression test, called out as its own test group rather than folded into a creation test — this is
  `backend-qa`'s highest-risk call and it is not negotiable down to an implicit assertion.
- **R-3 — Money compared as floats.** `decimal(10,2)` casts to a **string** in Eloquent. A test written
  as `expect($item->unit_price)->toBe(10.00)` fails confusingly, and one written as `toEqual(10.0)`
  passes for the wrong reason. *Mitigation:* the test plan states decimal-string comparison explicitly
  for every money assertion.
- **R-4 — The five blocking stories may land with column shapes different from what this file assumes.**
  This document quotes `products.sku` at 64 and `product_variants.sku` at 128 (hence
  `order_items.product_sku` at 128, the longer), `products.name` at 255, and both `products.price` and
  `shipping_rates.price` at `decimal(10,2)` — read from those stories' own task files, which are
  themselves still `new`. *Mitigation:* **Phase 3 must re-verify every one of those five shapes against
  the shipped migrations before writing this story's, exactly as the deferred-findings rule requires**
  ([errors-log.md](../../docs/errors-log.md#a-deferred-storys-findings-were-claims-about-a-tree-that-no-longer-existed-and-one-of-them-would-have-reopened-a-bug-in-this-log--2026-08-23)).
  This file's numbers are a reading aid, not a locator.
- **R-5 — This document goes stale while it waits.** It is blocked on five stories, each of which may
  itself change during its own Phase 4/5. That is precisely the "a deferred finding is a claim about a
  tree, and the task file freezes while the tree does not" failure recorded in the errors log.
  *Mitigation:* the Phase 2 INVEST review must be **re-run** immediately before Phase 3 rather than
  treated as passed on first reading, and R-4's re-verification is part of it.
- **R-6 — `Gate::authorize('orders.create')` fails closed on a typo, silently.** A misspelled ability
  denies everyone, and denial looks exactly like a correct refusal. *Mitigation:* a **positive** success
  test beside the 403, plus the literal-ability assertion against the seeded catalog.

### Resolved questions

| Question raised | By | Resolved as |
| --- | --- | --- |
| Ship FK columns now, unconstrained, or sequence the story? | backend-expert vs. database-expert | **[DR-1](#dr-1--resolved-disagreement--fk-sequencing-vs-unconstrained-placeholder-columns)** — sequence; option (a) |
| Defaults on `status` / `payment_status`? | backend-expert vs. database-expert | **[DR-2](#dr-2--a-smaller-conflict-resolved-defaults-on-status--payment_status)** — keep them, and set both explicitly anyway |
| Does an order carry a human-readable number? | database-expert | **D-1** — yes; column + UNIQUE here, generator in Phase 3 under three constraints |
| Delete behaviour for the product FKs | database-expert | **D-2** — `nullOnDelete()`, safe because the snapshots survive |
| Per-line-item refund tracking | database-expert | **D-3** — `refunded_quantity` column ships now; the logic does not |
| Address snapshot on `orders`? | database-expert | **D-4** — yes, twelve columns frozen at order time |
| Is a zero-line-item order valid? | backend-qa | **D-5** — no; `min:1`, rejected with a validation error |
| What does the order list order by? | backend-qa | **D-6** — `created_at desc`, with an `id` tie-break |
| What are the totals at creation? | backend-qa | **D-8** — subtotal derived; tax/shipping `0.00`; `tax_rate` `NULL` |
| Is `sales_region_id` resolved here? | backend-qa | **D-9** — no; `NULL`, and asserted `NULL` |
| Is there an `OrderPolicy`? | backend-expert | **D-13** — not here; 0048–0052 will need one |
| Does a soft-deleted customer block order creation? | backend-qa | **D-12** — no, by decision |
| Enum backing values: Spanish or English? | backend-expert | English lowercase tokens; Spanish via `lang/es/orders.php` |

### Open questions

**OQ-1 — Does `order_number` reset annually, and what happens at the year boundary? Non-blocking,
settle in Phase 3.** **D-1**'s `ORD-{YYYY}-{NNNNNN}` format permits either a global sequence or a
per-year one. A per-year reset is the more conventional and is what the year segment implies, but it
introduces a boundary case (the first order of a new year) worth a deliberate test. Not decided here
because it is a generator detail with no schema consequence either way.

**OQ-2 — Should `orders` eventually carry a `notes` / internal-comment field? Non-blocking, backlog.**
PRD §3.2 does not ask for one and nothing here needs it. Recorded only because "admin notes on an
order" is the single most commonly requested addition to an order table, and adding it later is a
trivial nullable column — so nobody should feel pressure to speculate it in now.

### Technical tasks for the backlog

Derived from this story, none of them in scope:

1. **Create `OrderPolicy`** in whichever of stories 0048–0052 arrives first, and re-point
   `CreateOrder`'s `Gate::authorize()` at it (**D-13**).
2. **Revisit indexing on `orders`** once a real order volume and a real list-filter set exist — the same
   provisional-YAGNI shape story 0042 recorded for `customers.deleted_at`, with the same requirement to
   measure rather than assume, and with the second column driven by what story 0055's list actually
   filters on.
3. **A `refunded_at` timestamp on `order_items`**, if stories 0051/0052 turn out to need one (**D-3**
   deliberately omits it).
4. **Order-number sequence behaviour at the year boundary** (**OQ-1**).

## Provenance

- **PRD source:** [§3.2 Orders](../../docs/PRD/PRD.md#32-orders), plus
  [§3.1 Customers](../../docs/PRD/PRD.md#31-customers) (the customer an order references and the
  soft-delete rationale) and [assumption 19](../../docs/PRD/PRD.md#assumptions--confirmed-decisions)
  (UUID PKs).
- **Process:** [workflow.md](../../docs/workflow.md) Phase 1 — Three Amigos debate. Contributions from
  `backend-expert`, `backend-qa` and `database-expert`, composed by `product-owner` as facilitator.
  **This story's debate produced a genuine disagreement between two experts**, resolved and recorded in
  full as [DR-1](#dr-1--resolved-disagreement--fk-sequencing-vs-unconstrained-placeholder-columns)
  rather than settled silently, with the reversal path named.
- **Gherkin conventions:** every scenario opens with a named business-role actor ("an order
  administrator") and carries exactly one `When`, per
  [gherkin-guidelines.md](../../docs/testing/frontend/gherkin-guidelines.md) rules 1 and 3 — mandatory
  across all Gherkin in this project, per the incident recorded in
  [errors-log.md](../../docs/errors-log.md).
- **Stage:** `new`, and **blocked** — see the banner under [Description](#description). It moves to
  `ai-spec/tasks/in-progress/` at the start of Phase 3, and to `ai-spec/tasks/done/` at Phase 7 — both
  moves change this file's directory depth, so every relative link above must be re-resolved on each
  move (both directions), per
  [workflow.md](../../docs/workflow.md#link-integrity-check-on-every-stage-move).
- **Epic 3 decomposition:** the Orders foundation story. Siblings referenced by number (0046
  notification, 0047 order history, 0048–0052 status/refunds, 0053–0054 tax resolution, 0055 UI)
  because their files may not exist yet.
