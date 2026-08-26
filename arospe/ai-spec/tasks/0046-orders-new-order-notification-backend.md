# [0046] Orders — "new order" notification (backend)

## Description
When an order record is created, generate a **database notification** for every administrator who
holds `orders.view`. This closes the second of the four confirmed notification events in PRD
[§ Cross-cutting: global search & notifications](../../docs/PRD/PRD.md#cross-cutting-global-search--notifications)
and the "new order" acceptance criterion of [§3.2 Orders](../../docs/PRD/PRD.md#32-orders). This story
owns the `OrderCreated` notification, the recipient-resolution rule, and the dispatch site inside story
[0045](0045-orders-core-crud-backend.md)'s `CreateOrder`. **It renders nothing** — no bell, no dropdown,
no unread badge — and it adds **no migration**: the `notifications` table is story
[0043](0043-customers-new-customer-notification-backend.md)'s deliverable and already exists once that
story is `done`.

> ## ⛔ BLOCKED — inherited cross-epic dependency (read this before Phase 3)
>
> **This story is fully specified now, but its Phase 3 implementation cannot start until story
> [0045](0045-orders-core-crud-backend.md) is `done` — and 0045 is itself blocked until PRD Epic 2
> stories [0024](0024-products-core-crud-backend.md) (Products),
> [0029](0029-product-variants-backend.md) (Product Variants),
> [0035](0035-shipping-carriers-backend.md) (Shipping Carriers),
> [0036](0036-shipping-rate-rules-backend.md) (Shipping Rates) and
> [0038](0038-payment-methods-bank-transfer-backend.md) (Payment Methods) are all `done`.**
>
> The dispatch call lands **inside** 0045's `CreateOrder`, and every Feature test here needs a real
> `Order` — which needs `orders`, `order_items`, `OrderFactory` and the five tables those FK into. The
> full reasoning is 0045's [**DR-1**](0045-orders-core-crud-backend.md#dr-1--resolved-disagreement--fk-sequencing-vs-unconstrained-placeholder-columns);
> this story does not re-litigate it and does not get to route around it. **Do not stub an `Order`
> factory or a `notifications` table to make this story testable earlier** — that is option (b)
> arriving by the back door.
>
> **What is *not* blocked:** this document. Specifying it now is deliberate, for the same reason 0045's
> banner gives — it makes the forward dependency (a post-commit dispatch site inside `CreateOrder`)
> visible while it is still cheap to honour, and 0045's own task file already flags it.

> **Scope boundary, stated up front rather than discovered at review.** This repository has **no
> notification-viewing UI of any kind** — no bell, no dropdown, no unread indicator, no route that
> lists notifications. "A new-order notification is generated" is therefore fully testable (a
> `notifications` row plus `Notification::assertSentTo`) and produces **zero visible admin-facing
> behaviour**. A reviewer must not read that absence as an unmet acceptance criterion. **The viewer-UI
> gap is already tracked exactly once, at story 0043 ([its OQ-3](0043-customers-new-customer-notification-backend.md#open-questions)),
> and this story deliberately does not reopen it as a second open question** — it is one cross-cutting
> gap, not one per event producer.

## Type
backend | includes database-expert: **no**

### Three Amigos participants

- `backend-expert` — the notification class, the recipient query, the dispatch site inside 0045's
  action, and the confirmation that this is a **shape copy** of 0043 rather than a redesign.
- `backend-qa` — risk-based test design mirroring 0043's, plus the rollback case (the highest-value
  test here) and the payload key-set assertion.
- **No `database-expert`.** This story adds no table, no column, no index and no migration: `notifications`
  is 0043's, and `App\Models\User` already carries `use Notifiable;`. That is the whole reason the
  participant list is two rather than three.

### Why this is its own story and not part of 0045

The two are separable in both directions. 0045's order CRUD is complete and shippable with no
notification at all, and this story's deliverable is a notification class and a recipient rule that are
independently testable against an `Order` factory. What they share is exactly **one line** — the
dispatch call — which is why the coupling is called out explicitly in
[Dependencies](#dependencies-risks-and-open-questions) rather than left implicit. 0045's own
[scope fences](0045-orders-core-crud-backend.md#scope-fences-what-this-story-must-not-do) already say it
must *not* create, dispatch or listen for this notification.

### Why this is a shape copy of 0043, and what that means for review

`backend-expert` confirmed 0043's design **wholesale**: same channel decision, same recipient
mechanism, same non-queued dispatch, same PII-minimal payload, same after-commit constraint. Every
decision below is therefore 0043's decision applied by direct analogy, restated here so this file is
readable alone — **not re-derived, and not re-opened.** Two consequences a reviewer should hold:

- **There is no shared base class, interface or registry, and there must not be one.** 0043 stated this
  explicitly as the forward note for *this* story: 0046 copies the *shape* — resolve recipients by
  permission, `Notification::send`, one concrete class — and writes its own concrete
  `NotifyOrderCreated`. Building an abstraction for the second of four event producers is exactly the
  speculative design `CLAUDE.md` forbids. **Revisit only if a third event arrives and all three differ
  by nothing but a permission string.**
- **A decision that reads as "0043 does it this way" is a decision, not an assumption.** Where the two
  genuinely diverge — the payload's third key, and the absence of a migration — it is called out
  below.

## Gherkin

```gherkin
Feature: New-order notification

  # --- The notification is generated ---

  Scenario: Creating an order notifies an administrator who may view orders
    Given an order administrator whose role grants the orders view permission
    When another administrator creates an order record
    Then a new-order notification is stored for the first administrator

  Scenario: The notification identifies the order that was created
    Given an order administrator whose role grants the orders view permission
    When another administrator creates an order record
    Then the stored notification carries that order's identifier and order number

  Scenario: The notification names the customer the order was placed for
    Given an order administrator whose role grants the orders view permission
    When another administrator creates an order for a customer named "Ana Garcia"
    Then the stored notification carries that customer's name

  Scenario: Every administrator holding the orders view permission is notified
    Given three administrators whose roles all grant the orders view permission
    When an order record is created
    Then a new-order notification is stored for each of the three administrators

  # --- Who is deliberately not notified ---

  Scenario: An administrator without the orders view permission is not notified
    Given a blog editor whose role does not grant the orders view permission
    When an order record is created
    Then no new-order notification is stored for the blog editor

  Scenario: A Super Admin is not notified of routine order creation
    Given a Super Admin, who holds no explicit orders view grant
    When an order record is created
    Then no new-order notification is stored for the Super Admin

  Scenario: A soft-deleted administrator is not notified
    Given a soft-deleted administrator whose role granted the orders view permission
    When an order record is created
    Then no new-order notification is stored for the soft-deleted administrator

  # --- The notification is not generated ---

  Scenario: An order rejected for having no line items generates no notification
    Given an order administrator submitting an order with no line items
    When the creation is rejected with a validation message
    Then no new-order notification is stored

  Scenario: An unauthorized order creation generates no notification
    Given a signed-in administrator whose role does not grant the orders create permission
    When they attempt to create an order record
    Then no new-order notification is stored

  Scenario: An order creation that fails to persist generates no notification
    Given an order administrator whose order creation fails partway through and is rolled back
    When the creation transaction is rolled back
    Then no new-order notification is stored

  # --- Edge case ---

  Scenario: A creation with no eligible recipients still succeeds
    Given a store where no role grants the orders view permission
    When an order record is created
    Then the order is created and no notification is stored
```

## Files to create/modify

### No migration — the `notifications` table is story 0043's

**This story creates no migration and must not create one.** `notifications` is published, edited and
owned by story [0043](0043-customers-new-customer-notification-backend.md), including the
`$table->uuidMorphs('notifiable')` correction (the stock `morphs()` emits an `UNSIGNED BIGINT`
`notifiable_id`, which cannot hold this app's `CHAR(36)` `users.id`). A second `create_notifications_table`
migration would fail on `migrate:fresh` outright; a "safety" `Schema::hasTable()` guard around one would
be worse, because it would let this story ship against a table nobody in this story reviewed.

- **If 0043 has not landed when Phase 3 starts, this story is not ready.** See
  [Dependencies](#dependencies-risks-and-open-questions).
- **No model change.** `App\Models\User` already carries `use Notifiable;` (verified) — this story adds
  no trait, no column and no relation to `User`, and none to `Order` either.

### Notification — `App\Notifications\OrderCreated`

`app/Notifications/OrderCreated.php` — **new**. `app/Notifications/` is a stock Laravel location
(`make:notification`), so no folder approval is needed
([base-standards.md](../../docs/conventions/base-standards.md#directory-structure)). It will be the
folder's **fourth** class (`PendingEmailVerification`, `UserInvitation`, 0043's `CustomerCreated`).

```php
class OrderCreated extends Notification
{
    public function __construct(private readonly Order $order) {}

    /** @return array<int, string> */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /** @return array{order_id: string, order_number: string, customer_name: string} */
    public function toArray(object $notifiable): array
    {
        return [
            'order_id' => $this->order->id,
            'order_number' => $this->order->order_number,
            'customer_name' => $this->order->customer->name,
        ];
    }
}
```

- **`OrderCreated`, not `NewOrderCreated` or `OrderCreatedNotification`.** A statement of fact about what
  happened, matching `PendingEmailVerification` / `UserInvitation` / `CustomerCreated`, per
  [naming.md](../../docs/conventions/naming.md#classes). No `Notification` suffix.
- **`['database']` only — no `mail` channel.** See decision **D-2**.
- **Not `ShouldQueue`.** See decision **D-4**.
- **Three keys, and every one of them is a literal-string snapshot.** See decision **D-5** — including
  why `customer_name` is read from the relation *at dispatch time* and then frozen, and why the payload
  carries no total, no line items, no email and no address.
- **`$this->order->customer` must be loaded, not lazily hit N times.** `NotifyOrderCreated` resolves the
  order's customer once before dispatch (see below); the notification reads an already-loaded relation.
  Since `Notification::send()` calls `toArray()` **once per recipient**, a lazy relation here is a
  latent N-query loop that only appears once a second administrator exists — invisible in a
  single-recipient test.
- **No `type` discriminator inside `data`.** Laravel's `DatabaseChannel` already writes the
  notification's FQCN into the `notifications.type` column; a second copy inside the JSON would be
  redundant state that drifts on a class rename.
- **No `lang/` file in this story.** `data` stores structural values, never rendered copy. Baking
  `"New order ORD-2026-000001"` into an immutable JSON column would put an English string somewhere
  `lang/es/` can never reach. The copy belongs to whichever story renders the bell (0043's OQ-3).
  Note this story adds **nothing** to `lang/{en,es}/orders.php` — that file is 0045's (status labels)
  and 0055's (screen copy).

### Recipient resolution + dispatch — `App\Actions\Orders\NotifyOrderCreated`

`app/Actions/Orders/NotifyOrderCreated.php` — **new**, invokable, imperative verb-phrase name with no
`Action`/`Service` suffix per [naming.md](../../docs/conventions/naming.md#classes). It lands in the
`app/Actions/Orders/` subfolder **story 0045 creates** for `CreateOrder` — one subfolder per domain
area, per [base-standards.md](../../docs/conventions/base-standards.md#directory-structure).

```php
public function __invoke(Order $order): void
{
    // Default guard is `web` everywhere in this app; do not "simplify" this
    // against a second guard later.
    $recipients = User::permission('orders.view')->get();

    Notification::send($recipients, new OrderCreated($order));
}
```

- **Why a dedicated action rather than three lines inlined into `CreateOrder`.** It keeps this story's
  cross-story surface to exactly **one constructor-injected dependency and one call** inside 0045's
  action, gives the recipient rule its own directly-callable test, and matches this repo's established
  action convention. It is **not** an abstraction — no base class, no interface, no registry.
- **`User::permission('orders.view')` — Spatie's own scope, resolved at dispatch time.** It matches
  users holding the permission through a role *or* directly, and it is a live query, never a cached or
  snapshotted list, so a grant revoked a minute ago takes effect immediately. This is the "gate on
  permissions, never role names" convention in
  [architecture/authorization.md](../../docs/architecture/authorization.md) applied to a recipient set
  rather than to an access check. **`orders.view` already exists in the seeded catalog** —
  `RolePermissionSeeder::MODULES` carries `orders` (verified), so all four `orders.*` abilities exist;
  this story adds no permission and reseeds no grant.
- **Note the ability is `orders.view`, not `orders.create`.** The recipient set is "who may *look at*
  orders", which is deliberately wider than "who may create one" and is what a bell is for.
- **Soft-deleted administrators are excluded for free, and the story relies on that deliberately.**
  `User` uses `SoftDeletes`, so the `SoftDeletingScope` is already on `User::query()`; no `whereNull` is
  written and none should be added. The scenario above pins it, because a future refactor to
  `withTrashed()` would silently start notifying deleted accounts.
- **The order's `customer` relation is resolved here, once**, before constructing the notification —
  `$order->loadMissing('customer')` (or an already-eager-loaded relation handed in by `CreateOrder`).
  See the N-per-recipient note above.

### Dispatch site — inside story 0045's `CreateOrder`

**This is real cross-story coupling and the only file this story does not own.** `CreateOrder` is
0045's deliverable; this story adds a constructor-injected `NotifyOrderCreated` and one call:

```php
// app/Actions/Orders/CreateOrder.php -- owned by story 0045
public function __construct(
    private readonly NotifyOrderCreated $notifyOrderCreated,
) {}
```

Three constraints on **where** that call goes, all load-bearing:

1. **After the persistence transaction commits — never inside it.** 0045's action wraps its `orders` +
   `order_items` writes in `DB::transaction()`, so the dispatch must sit after the closure returns (or
   inside a `DB::afterCommit` registration), so a rollback cannot leave a notification announcing an
   order that does not exist. **0045's own task file already flags this forward-looking**, under its
   action's step 4, citing
   [the `DB::transaction()` entry in errors-log.md](../../docs/errors-log.md#wrapping-existing-code-in-a-dbtransaction-moved-a-cache-flush-nobody-had-written--2026-08-21):
   *wrapping existing code in a transaction is a change to every side effect that code already
   performed*. Read forward here rather than in hindsight.
2. **After `order_number` is finalized — i.e. after the retry loop, not before it.** 0045 **D-1** makes
   the UNIQUE index the last word on `order_number` and requires a `23000` `QueryException` catch with
   retry. A notification dispatched before that loop settles would snapshot an `order_number` that the
   retry then changed — and because the payload is an immutable JSON column with no update path
   (**D-5**), the wrong value would be permanent and invisible. This constraint has no analogue in
   0043 (a customer has no derived, retry-assigned identifier) and is the one genuinely new
   ordering rule this story adds.
3. **After authorization and validation, on the success path only.** A refused or invalid creation
   reaches no dispatch, which is what three of the Gherkin scenarios above assert.

- **Constructor injection, not a widened `__invoke()` signature.** `CreateOrder::__invoke(array $attributes)`
  is a public contract 0045's tests and story 0055's component must match verbatim; an internal
  collaborator belongs in the constructor, per the documented exception in
  [code-style.md](../../docs/conventions/code-style.md#exception-an-actions-own-dependency-is-constructor-injected-when-the-method-signature-is-a-public-contract).
  0045 already states `CreateOrder` must be resolved from the container and never `new`-ed, so this adds
  no new constraint on its call sites.
- **No model event, no observer.** A `created` event on `Order` would fire for factories, seeders and
  imports too, and — per the blast-radius rule in
  [base-standards.md](../../docs/conventions/base-standards.md#steps-1-and-2-are-the-iteration-forms-run-both-unscoped-before-declaring-the-work-done) —
  would bind every test in the repo. It would also fire for the `orders` row *before* its `order_items`
  and totals exist, violating constraint 1 by construction. The PRD's event is "an order was placed",
  which is an *action*, not a row insert.

### Explicitly NOT in this story

Listed so reviewers do not reopen them: the `notifications` migration (0043's); any bell / dropdown /
unread-badge UI, any route or Livewire component for reading notifications, a mark-as-read path,
`read_at` being written by anything, a `config/modules.php` entry, screen copy in `lang/`, browser
tests, mail or broadcast channels, notification preferences or per-user opt-out, notification
pruning/retention; any notification on an order **status change**, refund or cancellation (0048–0052 —
the PRD's confirmed event is order *creation* only); and the other two confirmed events (low/zero stock,
blog post published). The `Order` / `OrderItem` models, their migrations, `CreateOrder`'s own logic and
the `order_number` generator are **story 0045's**.

## Tests to perform

Both files live in the new `tests/Feature/Orders/` folder story 0045 creates. Every money- or
identifier-shaped assertion follows 0045's own conventions (decimal strings, never floats).

**`tests/Feature/Orders/NotifyOrderCreatedTest.php`** (`RefreshDatabase`, direct-call against
`app(NotifyOrderCreated::class)`)
- [ ] Unit: a user holding `orders.view` through a role is in the recipient set.
- [ ] Unit: a user holding `orders.view` granted **directly** (not via a role) is in the recipient set — `User::permission()` covers both, and a hand-rolled `whereHas('roles')` implementation would fail only this case.
- [ ] Negative (dataset): a user holding every *other* module's `.view` but not `orders.view` is not notified, and a user holding `orders.create`/`orders.edit`/`orders.delete` but not `orders.view` is not notified. **This is the permission-typo guard** — the single most plausible copy-paste slip when a story is a deliberate shape copy of another (`customers.view` left in place, or `orders.create` substituted).
- [ ] Negative: a **soft-deleted** holder is not notified. Regression guard for a future `withTrashed()`.
- [ ] Negative: a Super Admin (zero explicit grants) is not notified — the recorded consequence of decision **D-1**, asserted rather than assumed.
- [ ] Edge: with **no** eligible recipients the call is a clean no-op — no exception, no rows.
- [ ] **Recipients are resolved at dispatch time, not cached**: grant `orders.view` to a new role *after* the container has resolved the action, dispatch, and assert the new holder receives it.
- [ ] Query-count guard: dispatching to **three** recipients resolves the order's `customer` relation once, not once per recipient (`DB::listen` or an `->relationLoaded()` assertion before dispatch). A single-recipient test cannot see this.

**`tests/Feature/Orders/OrderCreatedNotificationTest.php`** (`RefreshDatabase`, driven through 0045's `CreateOrder`)
- [ ] Happy path with `Notification::fake()`: creating an order sends `OrderCreated` to each eligible administrator — `Notification::assertSentTo($recipients, OrderCreated::class)`.
- [ ] **Without** `Notification::fake()`: a real `notifications` row exists, with `notifiable_id` equal to the recipient's UUID and `type` equal to `OrderCreated::class`. **Both forms are required** — `assertSentTo` proves the dispatch happened but never touches the database, so it passes against a `morphs()`-shaped `notifiable_id` that cannot store the row at all. The migration is 0043's, but *this* story is the second consumer of it, and a second consumer is exactly where a wrong column type would otherwise surface in production rather than in CI.
- [ ] The stored `data` payload carries `order_id`, `order_number` and `customer_name` matching the created record, and **asserts the payload's exact key set** — so the deliberate exclusion of the total, the line items and every customer field beyond the name (decision **D-5**) cannot be silently reversed.
- [ ] The stored `order_number` **equals the persisted order's** `order_number` and is not empty — the assertion that pins dispatch-site constraint 2. A payload snapshotted before 0045's retry loop settles would diverge from the row.
- [ ] `read_at` is `null` on a freshly stored notification.
- [ ] Negative: a creation rejected by validation (zero line items) stores no notification, asserted with `Notification::assertNothingSent()` **and** a zero-row `notifications` count.
- [ ] Negative: a creation refused by authorization (`orders.create` absent) stores no notification.
- [ ] **Rollback: a creation that throws after the `orders` row is written stores no notification.** Force a failure inside 0045's transaction and assert zero `notifications` rows. **This is the highest-value test in the story** — it pins dispatch-site constraint 1, and without it a dispatch moved inside the transaction, or before it, passes every other test here. 0045's own inherited transaction-ordering warning is what makes it non-negotiable.
- [ ] Multiple eligible recipients each get their own row (count equals the number of holders), not one shared row.

**Deliberately not tested** (per [what-not-to-test.md](../../docs/testing/qa/what-not-to-test.md)):
the `notifications` migration's `up()`/`down()` mechanics (0043's, and `RefreshDatabase` runs every
migration each run); Laravel's `DatabaseChannel` write itself as a framework behaviour — exercise it
*through* the dispatch; the UUID generation of `notifications.id`; 0045's own order-creation behaviour
(its snapshots, totals and validation are 0045's test plan, re-asserted here only where a notification
consequence depends on them); anything in `tests/Browser/` (this story renders nothing to browse); and
unread-count / mark-as-read behaviour, which belongs to the viewer story that does not exist (0043 OQ-3).

## Expected outcome

Creating an order through the backoffice stores one `OrderCreated` database notification per
administrator holding `orders.view` at that moment — resolved live, excluding soft-deleted accounts,
and excluding the Super Admin, whose `Gate::before` bypass is an authorization construct and grants no
`role_has_permissions` row for a data query to match. The payload carries the order's identifier, its
human-readable order number and the customer's name, and nothing else. A creation that is refused,
invalid, or rolled back stores nothing, and the dispatch happens only after the transaction has
committed and the order number has been finalized.

**Nothing is visible in the admin panel as a result of this story**, because no notification viewer
exists anywhere in this repository. The observable outcome is a database row and a passing
`Notification::assertSentTo` — which is exactly what PRD §3.2 and the cross-cutting section ask for,
and no more.

## Acceptance criteria

- [ ] `App\Notifications\OrderCreated` exists, uses the `database` channel **only** (no mail), is **not** `ShouldQueue`, and its `toArray()` returns exactly `order_id`, `order_number` and `customer_name`.
- [ ] `customer_name` is stored as a **literal string snapshot** taken at dispatch time — not an id, not a relation read at render time (**D-5**).
- [ ] `App\Actions\Orders\NotifyOrderCreated` resolves recipients as `User::permission('orders.view')->get()` on the `web` guard, evaluated at dispatch time and never cached.
- [ ] The order's `customer` relation is resolved **once** per dispatch, not once per recipient.
- [ ] Soft-deleted users are excluded, by the existing `SoftDeletingScope` and not by a hand-written `whereNull`.
- [ ] A **Super Admin holding no explicit `orders.view` grant receives no notification** — a deliberate, documented, reversible decision (**D-1**), not an oversight.
- [ ] The dispatch happens inside story 0045's `CreateOrder`, via a constructor-injected `NotifyOrderCreated`, **after the persistence transaction commits**, **after `order_number` is finalized**, and only on the authorized, validated success path.
- [ ] No notification is stored for a rejected creation, an unauthorized creation, or a rolled-back creation.
- [ ] A creation with zero eligible recipients still succeeds, storing no notification and raising nothing.
- [ ] **No migration is added by this story**, and `notifications` is used exactly as story 0043 created it.
- [ ] `App\Models\User`, `App\Models\Order` and `App\Models\OrderItem` are **unchanged**, and the permission catalog is **unchanged** (`orders.view` is already seeded).
- [ ] No shared base class, interface or registry is introduced between `CustomerCreated` and `OrderCreated`, or between their two dispatch actions.
- [ ] **No notification-viewing UI is built**, and its absence is a gap already tracked once at story 0043 (OQ-3) rather than an unmet criterion here.

## Definition of Done
- [ ] Tests written and green, plus the **full** existing suite run **unscoped** (`php artisan test`, not `--filter`), per [contracts.md](../../docs/contracts.md)'s Full Test Suite Gate Rule and [base-standards.md](../../docs/conventions/base-standards.md#steps-1-and-2-are-the-iteration-forms-run-both-unscoped-before-declaring-the-work-done).
- [ ] `vendor/bin/pint --format agent` clean (unscoped, **not** `--dirty`) and Larastan level 7 passing.
- [ ] Code reviewed (code-reviewer).
- [ ] No security findings (appsec-auditor) — specifically: that the recipient query cannot be widened by caller-supplied input; that the payload leaks no customer or order field beyond `order_id` / `order_number` / `customer_name` (no email, no address, no total); that a dispatch cannot be triggered by an actor who failed the `orders.create` gate; and that adding this side effect to `CreateOrder` grants no capability to a less-privileged caller — the shared-code lesson from [errors-log.md](../../docs/errors-log.md#a-scope-exclusion-named-screens-while-the-story-edited-a-class-those-screens-share--2026-08-24). **`CreateOrder`'s caller list must be re-grepped at Phase 3** (`grep -rn "CreateOrder" app/`), not assumed to be one screen.
- [ ] Documentation updated (docs-keeper) — [conventions/base-standards.md](../../docs/conventions/base-standards.md#directory-structure) (`app/Notifications/` gains a fourth class; `app/Actions/Orders/` gains a second). **No schema or migration doc change**: this story adds no column, table or migration, and [database/schema.md](../../docs/database/schema.md)'s `notifications` section is story 0043's to write.
- [ ] **The Definition of Done explicitly does NOT include a notification-viewer UI**, for this story or for the Epic 3 batch as currently decomposed. See 0043's OQ-3.
- [ ] Acceptance criteria met.

## Dependencies, risks, and open questions

### Dependencies

| Depends on | State | Why |
| --- | --- | --- |
| [0045](0045-orders-core-crud-backend.md) — Orders core CRUD | **hard dependency, and itself ⛔ BLOCKED** | The dispatch call lands inside its `CreateOrder`; every Feature test here needs `Order`, `OrderItem` and `OrderFactory`. **Inherits 0045's full block** on [0024](0024-products-core-crud-backend.md), [0029](0029-product-variants-backend.md), [0035](0035-shipping-carriers-backend.md), [0036](0036-shipping-rate-rules-backend.md) and [0038](0038-payment-methods-bank-transfer-backend.md) |
| [0043](0043-customers-new-customer-notification-backend.md) — new-customer notification | **hard dependency** | Owns the `notifications` table and its `uuidMorphs('notifiable')` correction. This story adds **no** migration and cannot run a single Feature test without it |
| [0041](0041-customers-crud-backend.md) — Customers CRUD | **transitive, via 0045** | `customer_name` is read off the order's `customer` relation; `Customer` must exist with a resolvable display name |
| `orders.view` in the seeded catalog | **shipped** | `RolePermissionSeeder::MODULES` carries `orders` (verified) — no seeder change needed |
| `App\Models\User` `Notifiable` + `SoftDeletes` | **shipped** (Epic 1) | Verified; no model change in this story |

Per the [task ordering rule](../../docs/workflow.md#task-ordering-rule), 0043's and 0045's lower numbers
are not cosmetic — sequence both into Phase 3 ahead of this story.

### Risks

- **R-1 — The rollback window is invisible until it is exercised.** A dispatch placed inside 0045's
  transaction passes every happy-path and every negative-validation test, because nothing in those
  paths rolls back *after* a successful write. Mitigation: the forced-failure rollback test is listed as
  its own mandatory case, and dispatch-site constraint 1 is an acceptance criterion rather than a
  comment.
- **R-2 — The `order_number` ordering constraint has no 0043 analogue, so a shape-copy implementation
  will not think of it.** Copying 0043's dispatch placement verbatim ("after the commit") is *necessary
  but not sufficient* here: 0045's retry loop can change `order_number`, and this story's payload is
  immutable. Mitigation: constraint 2 is stated as its own numbered rule with its own test.
- **R-3 — A copy-paste permission string.** `customers.view` surviving into `NotifyOrderCreated` fails
  **closed and silently** — the wrong administrators get notified and nothing errors. Mitigation: the
  positive/negative dataset above asserts the literal ability, including the `orders.create`-not-`orders.view`
  confusion.
- **R-4 — Cross-story edit.** This story modifies a file story 0045 owns. If 0045 is still in flight
  when this reaches Phase 3, the two must not be implemented by concurrent agents, per the
  [Parallel Agent File-Ownership Rule](../../docs/contracts.md#parallel-agent-file-ownership-rule).
- **R-5 — Unbounded row growth with no reader.** Every order creation writes N rows that nothing ever
  reads or marks read while 0043's OQ-3 stays open. Orders are higher-volume than customers, so this
  story makes an already-recorded consequence larger — still negligible at backoffice volumes, and
  `model:prune` is deliberately not wired here. Recorded so it is known rather than a surprise.
- **R-6 — This document goes stale while it waits**, behind six stories rather than five. Mitigation:
  as with 0045's R-5, the Phase 2 INVEST review must be **re-run** immediately before Phase 3 rather
  than treated as passed on first reading, and **`Customer`'s display-name attribute must be
  re-verified against the shipped model** — this file assumes `$order->customer->name`, read from
  0043's own usage, and 0041's task file is itself still `new`. A name is a reading aid, not a locator
  ([errors-log.md](../../docs/errors-log.md#a-deferred-storys-findings-were-claims-about-a-tree-that-no-longer-existed-and-one-of-them-would-have-reopened-a-bug-in-this-log--2026-08-23)).

### Open questions

**None genuinely new.** This is stated explicitly rather than by omission: every question this story
could raise was already asked and answered in [0043](0043-customers-new-customer-notification-backend.md),
and inventing a fresh one to fill the section would be noise. The three inherited items and their
status here:

| Inherited from 0043 | Status for this story |
| --- | --- |
| **OQ-1** — should a `suspended`/`inactive` administrator receive notifications? | **Inherited unchanged; same default: notify them (no status filter).** A notification is a record, not access, and `users.status` is enforced at sign-in ([architecture/authentication.md](../../docs/architecture/authentication.md)). If the human overrides it for 0043, this story changes identically — one `->where('status', …)` clause in each action, and the two must not diverge |
| **OQ-2** — should the administrator who created the record be notified of their own action? | **Inherited unchanged; same default: no self-exclusion.** It keeps the recipient rule a single query with no actor parameter, and avoids reintroducing the caller-supplied-state shape [errors-log.md](../../docs/errors-log.md#a-guard-took-the-state-it-was-guarding-as-a-parameter-reopening-its-own-hole-one-level-up--2026-08-20) warns about. An order created by a future storefront or import has no acting administrator at all, so a self-exclusion branch would be dead code on that path — **an argument that is actually stronger here than it was for customers** |
| **OQ-3** — the missing notification-viewer UI | **Tracked once, at 0043. Deliberately not reopened here.** It is one cross-cutting gap covering all four event producers, not one gap per producer; re-raising it per story is how a single decision becomes four unresolved questions. This story is not blocked by it |

**The one real open item this story carried is resolved below as D-5**, not left open: whether
`customer_name` is a literal snapshot or a live read.

## Documented functional decisions

Each is 0043's decision applied by direct analogy, with the divergences named. Every one is a
conservative, reversible default the human may override — the reasoning is recorded so an override is a
decision rather than a rediscovery.

**D-1 — The Super Admin is deliberately excluded from this notification.** Same reasoning as 0043 D-1,
unchanged: `User::permission('orders.view')` is a **data** query against `role_has_permissions` /
`model_has_permissions`, while the Super Admin's access comes from the `Gate::before` bypass in
[architecture/authorization.md](../../docs/architecture/authorization.md) — an authorization-layer
construct that grants **no rows** for any query to match. A Super Admin therefore falls out of the
recipient set for free, and the decision is to **leave it that way**: the bypass exists so the account
that administers the system is never locked out of it, not so that account receives routine CRUD
awareness traffic. Bolting an `orWhereHas('roles', …)` union onto the recipient query would also make
this the second place in the codebase where the bypass is re-implemented as a data query — the exact
"gate on permissions, never role names" inversion the authorization doc forbids. **Cheaply reversible**
(a `union` with holders resolved through `Role::superAdminName()`, never a hardcoded role-name string),
and pinned by a test so a future change is a visible decision rather than a drift. **If the human
reverses it, it must be reversed for 0043 and 0046 together** — a store where new customers notify the
Super Admin and new orders do not is worse than either consistent answer.

**D-2 — Database channel only. No mail, confirmed.** `via()` returns `['database']` and nothing else.
The PRD's requirement is a **bell** — an in-panel indicator — and it says nothing about email. The
argument is *stronger* here than in 0043: orders are the highest-frequency event of the four, so a mail
channel would mean one outbound send per administrator per order, with no opt-out, no throttle and no
stated requirement. That is a spam vector arriving as an unasked-for feature. A `mail` channel remains a
one-line addition to `via()` if the business ever asks for it — with a throttle decision attached at
that point, not now.

**D-3 — The notification-viewer UI is out of scope for this story and for the Epic 3 batch as currently
decomposed.** Stated as an explicit Definition-of-Done line rather than left implicit, and **not**
re-escalated as an open question — 0043's OQ-3 owns it. The consequence a reviewer must accept: this
story's acceptance criteria are satisfied by database rows and `Notification::assertSentTo`, with **no**
admin-visible behaviour to click through and no browser test.

**D-4 — `OrderCreated` is not `ShouldQueue`.** The only channel is `database`, so the entire "delivery"
is a local `INSERT`. Queueing it would write a `jobs` row (this app runs `QUEUE_CONNECTION=database`) to
defer a write cheaper than the job row itself, and would put the notification behind a worker that must
be running for the feature to work at all — turning a synchronous, assertable side effect into an
eventual one that every test would need `Queue::fake()` to observe. It would also interact badly with
constraint 1: a queued dispatch registered inside a transaction is a second, subtler ordering hazard.
The precedent in [architecture/authentication.md](../../docs/architecture/authentication.md) cuts the
same way — `PendingEmailVerification` is queued because it performs an **outbound SMTP** call, while
`UserInvitation` deliberately is not. There is no outbound call here. Revisit only if a `mail` channel
is ever added (**D-2**).

**D-5 — The payload carries `order_id`, `order_number` and `customer_name`, each stored as an immutable
literal string; it carries no total, no line items, and no customer field beyond the name.**
*This is the one open item this story genuinely had, and it is resolved rather than deferred.*

- **`customer_name` is a literal snapshot, exactly like `order_number` — not a `customer_id` the viewer
  joins on, and not a relation read at render time.** This is the recommended answer and it is
  consistent with every other "never re-derive from a mutable source" decision across the Orders and
  Customers stories: 0045 **D-4** freezes the shipping and billing addresses onto the order rather than
  joining the customer live, and 0045's line items freeze `product_name` / `product_sku` / `unit_price`
  for the same reason. `notifications.data` is an immutable JSON snapshot with no update path, so
  storing an id and joining later would make a two-year-old bell entry silently re-render under a
  renamed customer — the exact drift those decisions exist to prevent. A rename after the fact is a
  *new* fact, and the notification is a record of what happened at the time.
- **The narrow divergence from 0043 is deliberate:** 0043 stores `customer_id` **and** `customer_name`
  because its subject *is* the customer and the bell must link to that record. Here the linkable subject
  is the **order**, so `order_id` carries the link and `customer_name` is context. Adding a
  `customer_id` was considered and **omitted** — the viewer that would use it does not exist, the order
  detail screen (0055) already reaches the customer through the order, and every key added to an
  immutable column is permanent for existing rows.
- **`order_number` rather than only `order_id`** because a UUID v7 is unreadable in a one-line bell
  entry, and 0045 **D-1** exists precisely so a human-usable reference exists. Both are stored: the id
  is the link, the number is the label.
- **No total, no currency, no line-item count, and no customer email or address**, following 0043
  **D-5**'s PII-minimalism precedent and extending it: financial figures on an order are mutable
  (0053/0054 fill in `tax_amount`, `shipping_amount` and `total`, and 0051/0052 can refund), so a
  snapshotted total would be *wrong* rather than merely stale for a large fraction of orders. The
  customer's email has a canonical home on the `customers` row and is reachable by no erasure routine
  this app has, so duplicating it into an immutable column creates a second copy nobody can revoke.
- **Honest statement of the tradeoff:** a notification for a hard-deleted order would render a dangling
  link. Acceptable — 0045 records no order deletion path in this phase (`Cancelado` is a status, not a
  delete). **Reversible, but asymmetrically:** adding a field to `toArray()` is one line and does
  **not** backfill existing rows, so a later addition means a mixed-shape column. Decide additions
  deliberately.

**D-6 — No shared abstraction between `CustomerCreated` and `OrderCreated`.** 0043 named this forward
for exactly this story and the answer is unchanged: two concrete notifications and two concrete
dispatch actions, each in its own domain subfolder. The duplication is four lines of a recipient query
and a `Notification::send` call; the abstraction would be a base class parameterised by a permission
string and a payload shape that already differ between the two (three keys here, two there — **D-5**).
**Revisit only if a third event producer arrives and all three differ by nothing but a permission
string** — at which point the refactor is mechanical and safe, which is precisely why it should wait.

## Resolved in the debate

- **This is a shape copy of 0043, confirmed wholesale by `backend-expert`, not a redesign** — recorded
  as such so a reviewer reads the decisions below as *applied*, not as re-derived.
- **Recipients are permission-driven (`orders.view`), never role-name-driven**, and the ability is
  deliberately the `.view` one rather than `.create`.
- **No migration.** The `notifications` table is 0043's; a second `create_notifications_table` here
  would fail on `migrate:fresh`, and a `Schema::hasTable()` guard around one would be worse. This is
  also why the participant list carries **no `database-expert`**.
- **`OrderCreated`, not `NewOrderCreated`** — the statement-of-fact naming rule, applied.
- **The dispatch has three ordering constraints, not two.** `backend-qa` and `backend-expert` agreed the
  after-commit rule copies from 0043; the **after-`order_number`-is-finalized** rule is new to this
  story and falls out of 0045 **D-1**'s retry loop meeting **D-5**'s immutable payload. Recorded as its
  own numbered constraint with its own test rather than folded into the commit rule.
- **The rollback test is the highest-value case in the plan**, per `backend-qa`, and it is listed as
  non-negotiable rather than as one bullet among many — 0045's own task file carries the inherited
  transaction-ordering warning that makes it so.
- **The viewer-UI gap is referenced, not reopened.** One cross-cutting gap, tracked once at 0043 OQ-3.
- **The "no visible behaviour" scope boundary is stated to the human explicitly**, at the top of this
  file, in the Expected outcome and in the Definition of Done — rather than being left for a reviewer to
  discover as an apparent gap.

## Provenance

- **PRD source:** [§3.2 Orders](../../docs/PRD/PRD.md#32-orders) and
  [§ Cross-cutting: global search & notifications](../../docs/PRD/PRD.md#cross-cutting-global-search--notifications).
- **Process:** [workflow.md](../../docs/workflow.md) Phase 1 — Three Amigos debate. Contributions from
  `backend-expert` (confirming 0043's shape wholesale, the file list, the recipient query, the dispatch
  site and its constraints, and the no-abstraction constraint) and `backend-qa` (the mirrored recipient
  and negative sets, the faked/un-faked pair, the payload key-set assertion, the rollback case named as
  the highest-value test, and the inherited-block flag), composed by `product-owner` as facilitator.
  **No `database-expert`**: this story adds no schema (see the Type section).
- **Sibling story this one mirrors:** [0043](0043-customers-new-customer-notification-backend.md) — its
  decisions D-1 through D-5 and open questions OQ-1/OQ-2/OQ-3 apply here by direct analogy and are
  resolved above rather than re-debated.
- **Gherkin conventions:** every scenario opens with a named business-role actor ("an order
  administrator", "a blog editor", "a Super Admin") and carries exactly one `When`, per
  [gherkin-guidelines.md](../../docs/testing/frontend/gherkin-guidelines.md) rules 1 and 3 — mandatory
  across all Gherkin in this project, per the incident recorded in
  [errors-log.md](../../docs/errors-log.md).
- **Verified against the working tree by `product-owner` rather than relayed:** no `notifications`
  migration exists in `database/migrations/`; `app/Notifications/` holds exactly two classes today
  (`PendingEmailVerification`, `UserInvitation`), so this story's class is the fourth once 0043 lands;
  `RolePermissionSeeder::MODULES` carries `orders`, so all four `orders.*` abilities are seeded; and
  `App\Models\User` already carries `use Notifiable;` and `SoftDeletes`.
- **Stage:** `new`, and **blocked** — see the banner under [Description](#description). It moves to
  `ai-spec/tasks/in-progress/` at the start of Phase 3, and to `ai-spec/tasks/done/` at Phase 7 — both
  moves change this file's directory depth, so every relative link above must be re-resolved on each
  move (both directions), per
  [workflow.md](../../docs/workflow.md#link-integrity-check-on-every-stage-move).
