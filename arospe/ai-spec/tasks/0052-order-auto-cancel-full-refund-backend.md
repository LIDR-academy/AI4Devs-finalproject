# [0052] Order auto-cancel on full refund backend

## Description
When every line item of an order becomes fully refunded, the order automatically transitions to
`Cancelado` as a **system-triggered side effect**, per PRD
[§3.2 Orders](../../docs/PRD/PRD.md#32-orders). This transition is deliberately **exempt from the
manual-cancellation guard** story [0050](0050-order-manual-cancellation-backend.md) enforces: a
shipped or delivered order cannot be cancelled by an administrator clicking a button, but it *is*
auto-cancelled when its last outstanding unit comes back. This story owns the `OrderFullyRefunded`
domain event, its listener, the `AutoCancelFullyRefundedOrder` action, and the one-line dispatch
story [0051](0051-order-payment-refund-state-backend.md) left for it. No route, no Livewire
component, no Blade markup, no notification, no schema change.

> ## ⛔ BLOCKED — inherited cross-epic dependency (read this before Phase 3)
>
> **This story is fully specified now, but its Phase 3 implementation cannot start until story
> [0051](0051-order-payment-refund-state-backend.md) is `done`** — and 0051 is itself blocked behind
> [0045](0045-orders-core-crud-backend.md), which is blocked behind five Epic 2 stories
> ([0024](done/0024-products-core-crud-backend.md), [0029](0029-product-variants-backend.md),
> [0035](0035-shipping-carriers-backend.md), [0036](0036-shipping-rate-rules-backend.md),
> [0038](0038-payment-methods-bank-transfer-backend.md)).
>
> Every column this story reads or writes — `orders.status`, `orders.payment_status`,
> `order_items.quantity`, `order_items.refunded_quantity` — is created by 0045, and the transition
> this story listens for is derived by 0051's `RecordRefund`. There is nothing to hook until that
> action exists.
>
> **What is *not* blocked:** this document. Specifying it now is what turns 0051's
> [**OQ-2**](0051-order-payment-refund-state-backend.md#open-questions) from a recommendation into a
> settled binding, and it is what makes the two 0051 tests this story falsifies visible **before**
> they are written rather than after.

## Type
backend | includes database-expert: **no**

**No `database-expert` participation, and that is a positive finding rather than an omission.** This
story adds **no table, no column, no migration and no index**. It writes `orders.status` — a column
0045 created — and reads `orders.payment_status`, `order_items.quantity` and
`order_items.refunded_quantity`, all of which already exist by the time Phase 3 begins. The
[task classification rule](../../docs/workflow.md#task-classification-rule) adds `database-expert`
when a task "touches the data model, migrations, or queries"; the only query here is a `SELECT … FOR
UPDATE` on a single row by primary key, which is not a schema question. Phase 3 must **verify** this
rather than inherit it: if the implementation finds itself reaching for a migration, the story's
scope has drifted.

### Three Amigos participants

- `backend-expert` — the binding mechanism (a post-commit domain event), the action's shape, the
  guard-bypass rationale, the idempotency and locking design, and the deliberate absence of a
  `Gate::authorize()` call.
- `backend-qa` — risk-based test design, the **same-fixture contrast test** that makes "distinct from
  the manual cancel action" executable rather than asserted twice, the atomicity case, the
  idempotency case, and the regression guard proving 0050's guard was not loosened.

### Why this is one story and not part of 0051

The derivation (`payment_status → Refunded`) and the consequence (`status → Cancelled`) are two
different domain facts with two different owners, and 0051 stops deliberately at the first one. They
are separable because the seam between them is observable: 0051's `payment_status` transition is a
persisted, testable outcome that this story consumes without needing to know how it was produced.
Folding them together would also have made 0051's own scope fence — *"a full refund leaves
`orders.status` unchanged"*, which 0051 ships as an executable test — impossible to state.

**There is no disagreement to record in this file.** `backend-expert`'s design and `backend-qa`'s
test plan were composed independently and validate the same shape: the post-commit event, the
re-fetch-under-lock, the direct `forceFill()` write past both status-transition classes, the
idempotent early return, and the absence of an authorization gate. `backend-qa`'s contrast test is
the executable form of `backend-expert`'s central claim. Where a sibling story recorded a genuine
expert conflict ([0045 **DR-1**](0045-orders-core-crud-backend.md#dr-1--resolved-disagreement--fk-sequencing-vs-unconstrained-placeholder-columns),
[0051 **DR-1**](0051-order-payment-refund-state-backend.md#dr-1--the-refund-model-line-item-quantities-not-an-arbitrary-monetary-amount)),
this one has none, and inventing daylight between two aligned contributions would misrepresent the
debate.

## Gherkin

```gherkin
Feature: Automatic order cancellation on full refund (backend)

  # --- The auto-cancel itself ---

  Scenario: Fully refunding every line item cancels the order
    Given an order administrator, with a paid order whose single line item is for three units
    When they record a refund of all three units
    Then the order's fulfilment status becomes cancelled

  Scenario: Fully refunding every line item of a multi-line order cancels it
    Given an order administrator, with a paid order carrying three line items, two already fully refunded
    When they record a refund of every outstanding unit of the third line item
    Then the order's fulfilment status becomes cancelled

  Scenario: The auto-cancel fires for an order that has already been shipped
    Given an order administrator, with a shipped order that has been paid for
    When they record a refund of every unit of every line item
    Then the order's fulfilment status becomes cancelled

  Scenario: The auto-cancel fires for an order that has already been delivered
    Given an order administrator, with a delivered order that has been paid for
    When they record a refund of every unit of every line item
    Then the order's fulfilment status becomes cancelled

  Scenario: The order's payment state still reads fully refunded after the auto-cancel
    Given an order administrator, with a paid order whose single line item is for two units
    When they record a refund of both units
    Then the order's payment state reads fully refunded alongside its cancelled fulfilment status

  # --- Distinct from the manual cancel action ---

  Scenario: A shipped order cannot be cancelled manually
    Given an order administrator, with a shipped order that has been paid for
    When they attempt to cancel that order manually
    Then the attempt is refused and the order's fulfilment status is unchanged

  Scenario: The same shipped order is still auto-cancelled by a full refund
    Given an order administrator, with a shipped order whose manual cancellation has just been refused
    When they record a refund of every unit of every line item
    Then the order's fulfilment status becomes cancelled

  Scenario: A partially refunded order still cannot be cancelled manually
    Given an order administrator, with a partially refunded order
    When they attempt to cancel that order manually
    Then the attempt is refused and the order's fulfilment status is unchanged

  # --- What does not trigger it ---

  Scenario: A partial refund does not cancel the order
    Given an order administrator, with a paid order whose single line item is for five units
    When they record a refund of two of those units
    Then the order's fulfilment status is unchanged

  Scenario: A refund emptying one line item of several does not cancel the order
    Given an order administrator, with a paid order carrying two line items
    When they record a refund of every unit of the first line item only
    Then the order's fulfilment status is unchanged

  Scenario: A refund touching every line item without emptying any does not cancel the order
    Given an order administrator, with a paid order carrying two line items of four units each
    When they record a refund of one unit from each line item
    Then the order's fulfilment status is unchanged

  Scenario: A rejected refund cancels nothing
    Given an order administrator, with a paid order carrying three line items
    When they attempt a refund whose third line item exceeds its outstanding units
    Then the order's fulfilment status is unchanged and no line item records any returned units

  Scenario: A refund refused for lack of permission cancels nothing
    Given a signed-in administrator whose role does not grant the orders refund permission
    When they attempt to record a full refund against a paid order
    Then the attempt is refused and the order's fulfilment status is unchanged

  # --- Repeating the trigger ---

  Scenario: An already cancelled order is left alone by a repeated trigger
    Given an order administrator, with an order already auto-cancelled by a full refund
    When the full-refund trigger is raised against that order a second time
    Then the order's fulfilment status remains cancelled and nothing else changes

  # --- What this story deliberately leaves alone ---

  Scenario: An auto-cancelled order sends no notification
    Given an order administrator, with a paid order whose single line item is for one unit
    When they record a refund of that unit
    Then no message is sent to anyone, the cancellation notice being a separate concern
```

## Files to create/modify

### Event — `app/Events/OrderFullyRefunded.php` (new file, **new folder**)

```php
namespace App\Events;

use Illuminate\Foundation\Events\Dispatchable;

/**
 * Raised by RecordRefund, after its transaction commits, when the refund it
 * just wrote left every line item of the order fully refunded.
 *
 * Carries the order's identifier only, never a hydrated Order: the listener
 * re-reads the row under a lock, so a stale in-memory instance must not be
 * reachable from here at all. See D-4.
 */
class OrderFullyRefunded
{
    use Dispatchable;

    public function __construct(
        public readonly string $orderId,
    ) {}
}
```

- **`app/Events/` does not exist in this repo yet and needs no approval to create.** It is a stock
  Laravel location (`php artisan make:event`), which
  [base-standards.md](../../docs/conventions/base-standards.md#directory-structure) puts in the same
  category as `app/Enums/`, `app/Exceptions/`, `app/Listeners/`, `app/Notifications/` and
  `app/Policies/` — *"creating one of them needs no approval; inventing a folder Laravel doesn't ship
  does."* Scaffold it with the artisan command rather than by hand
  ([base-standards.md](../../docs/conventions/base-standards.md#artisan-first-workflow)).
- **No `ShouldQueue`, no `SerializesModels`, no `InteractsWithSockets`, no `broadcastOn()`** —
  **D-3**. `make:event`'s stub ships `Dispatchable, InteractsWithSockets, SerializesModels`; strip
  the two this class does not use rather than leaving stub noise, and delete the generated
  `broadcastOn()` method.
- Named as a **statement about what happened**, past participle, matching this repo's listener and
  notification naming (`ActivateVerifiedUser`, `PendingEmailVerification` —
  [naming.md](../../docs/conventions/naming.md#classes)).

### Listener — `app/Listeners/CancelFullyRefundedOrder.php` (new)

A deliberately thin adapter with no logic of its own:

```php
public function handle(OrderFullyRefunded $event): void
{
    ($this->autoCancelFullyRefundedOrder)($event->orderId);
}
```

- Constructor-injects `App\Actions\Orders\AutoCancelFullyRefundedOrder`. The listener is resolved
  from the container by the event dispatcher, so it never `new`s the action
  ([code-style.md](../../docs/conventions/code-style.md#exception-an-actions-own-dependency-is-constructor-injected-when-the-method-signature-is-a-public-contract)).
- **No `ShouldQueue`** (**D-3**), and therefore no `SerializesModels` concern to reason about.
- Registered explicitly in `AppServiceProvider`, per the repo's existing precedent (**D-8**), which
  carries a real double-registration hazard Phase 3 must verify — see **R-2**.
- **Why a listener and an action rather than one class:** `app/Listeners/` holds framework glue and
  `app/Actions/` holds domain operations, and this repo already separates them (`ActivateVerifiedUser`
  is the counter-example — a listener carrying its own logic, from before `app/Actions/Users/`
  existed). Keeping the logic in an action is what makes the operation independently callable and
  directly testable without dispatching an event, and it is what lets a future non-refund caller
  (a support tool, an Artisan command) reach it — the same reasoning
  [base-standards.md](../../docs/conventions/base-standards.md#an-authorization-rule-belongs-to-the-action-not-to-one-of-its-callers)
  applies to authorization rules.

### Action — `app/Actions/Orders/AutoCancelFullyRefundedOrder.php` (new, in 0045's subfolder)

Invokable, imperative-verb-phrase class with no `Action` suffix, resolved from the container and
never `new`-ed.

```php
/**
 * Cancel an order whose every line item has been fully refunded.
 *
 * SYSTEM-TRIGGERED, DELIBERATELY UNGATED, AND DELIBERATELY PAST BOTH STATUS CLASSES.
 * See the task file's D-1, D-2 and D-6 before changing any of those three properties.
 */
public function __invoke(string $orderId): void
```

Performing, **in this order**:

1. **Open a `DB::transaction()`.** Everything below runs inside it, and it is this action's own
   transaction — 0051's has already committed by the time the event is dispatched (**D-5**).
2. **Re-read the order under a row lock**:
   `$order = Order::query()->lockForUpdate()->find($orderId);`
   Nothing is trusted from the event but the identifier (**D-4**).
3. **Return silently if the row is gone.** `find()` returning `null` is a legitimate outcome under
   concurrency and is not an error condition worth throwing over — the order this event names no
   longer exists, so there is nothing to cancel.
4. **Return silently if `$order->status === OrderStatus::Cancelled`.** The idempotency guard
   (**D-7**), placed immediately after the locked read so the lock is what serialises two concurrent
   triggers rather than the check racing itself.
5. **Write the status directly:** `$order->forceFill(['status' => OrderStatus::Cancelled])->save();`
   — bypassing both `TransitionOrderStatus` (0049) and `CancelOrder` (0050), each of which would
   refuse this exact transition and neither of which has a human actor to authorize against
   (**D-2**).
6. **Return `void`.** Nothing consumes a return value: the listener discards it and the event
   dispatcher discards the listener's.

> **No `Gate::authorize()` call anywhere in this action, and that is an accepted, documented
> exception rather than an oversight** (**D-1**). It is recorded in the class's own docblock as well
> as here, following the precedent
> [base-standards.md](../../docs/conventions/base-standards.md#an-authorization-rule-belongs-to-the-action-not-to-one-of-its-callers)
> set for `Index::deleteUser()`'s step-up guard placement: *"Record a placement like this in the
> method's own docblock so the next reader can tell 'this is where it belongs' from 'this is where it
> is until something better exists'."* Here the equivalent distinction is **"exempt"** versus
> **"forgotten"**, and only a written note carries it.

### Action — `app/Actions/Orders/RecordRefund.php` (modified — one line)

0051's own [**OQ-2**](0051-order-payment-refund-state-backend.md#open-questions) says this is *"a
one-line change to `RecordRefund` that 0052 makes; nothing here needs to anticipate it."* This story
makes it:

```php
// After the DB::transaction() closure returns — never inside it. See D-5.
if ($order->payment_status === PaymentStatus::Refunded) {
    OrderFullyRefunded::dispatch($order->id);
}
```

- Placed **after** the transaction closure returns, in `RecordRefund::__invoke()`'s body, before its
  `return`.
- Conditioned on the **final** `payment_status` read back from the committed order, not on a delta
  and not on a flag set inside the closure — the same "read final state, never a delta" rule 0051's
  own derivation follows (0051 **D-4**).
- 0051's step 11 already returns a refreshed `Order`; the condition reads that instance, so no extra
  query is added.

### Provider — `app/Providers/AppServiceProvider.php` (modified)

Register the listener beside the existing `ActivateVerifiedUser` registration, matching whatever
shape that one uses verbatim rather than introducing a second idiom (**D-8**). **Phase 3 must open
the file and copy the existing form** — this document deliberately does not quote it, because the
registration API is exactly the kind of detail that moves between framework versions and a quoted
snippet here would be a locator rather than a reading aid.

### Tests owned by 0051 that this story **falsifies and must update** (modified)

Two assertions 0051 ships as executable scope fences become false the moment this story lands. **They
are not deleted — they are inverted or narrowed**, so the coverage survives the transfer of ownership:

| 0051 test | Why it breaks | What replaces it |
| --- | --- | --- |
| *"a full refund leaves `orders.status` **unchanged** — including for an order in a shipped state"* (0051's "Scope fences, made executable") | This story is the behaviour that test existed to forbid | Invert it: a full refund now **does** set `status` to `Cancelled`, including from `Shipped`. The **partial**-refund half is kept and strengthened (see this story's own test plan) |
| *"recording a refund dispatches no notification and no event (`Notification::fake()` / `Event::fake()` asserting nothing)"* | `RecordRefund` now dispatches `OrderFullyRefunded` | Narrow it: a refund still dispatches **no notification** and no event **other than** `OrderFullyRefunded`, and dispatches **nothing at all** when the refund is partial |

**This is the highest-risk clerical item in the story.** Both tests live in files this story does not
otherwise open, both were written specifically to fail if someone implemented this feature early, and
a `--filter`ed run over this story's own new test file would report green while both are red — the
scoped-gate failure recorded in
[errors-log.md](../../docs/errors-log.md#both-of-this-projects-per-change-quality-gates-are-scoped-by-default-and-both-silently-passed--2026-08-20).
The Definition of Done therefore requires the **unscoped** run, and Phase 3 must **re-grep** for both
assertions rather than trusting this table's description of them — 0051's file is itself a claim about
a tree that does not exist yet ([errors-log.md](../../docs/errors-log.md#a-deferred-storys-findings-were-claims-about-a-tree-that-no-longer-existed-and-one-of-them-would-have-reopened-a-bug-in-this-log--2026-08-23)).

### Explicitly **not** touched by this story

- **`app/Actions/Orders/CancelOrder.php` (0050) — not modified, not read, not called.** See the
  purely-additive statement below.
- **`app/Actions/Orders/TransitionOrderStatus.php` (0049) — not modified, not read, not called.**
- `app/Policies/**` — no `OrderPolicy` is created (**D-9**).
- `database/migrations/**`, `app/Models/Order.php`, `app/Models/OrderItem.php` — **no schema change,
  no `#[Fillable]` change, no cast change**. `orders.status` was already omitted from `#[Fillable]`
  by 0045 and stays so; `forceFill()` is the sanctioned writer.
- `database/seeders/RolePermissionSeeder.php` — **no permission is added**. This story's write has no
  actor to authorize (**D-1**), so there is nothing to grant. The catalog count is untouched, which
  means **none** of the thirteen count assertions 0051 has to update are this story's problem.
- `routes/*.php`, `config/modules.php`, `app/Livewire/**`, `resources/views/**` — story 0055's.
- `app/Notifications/**` — an "order auto-cancelled" notification is **out of scope** (**D-10**).
- `lang/{en,es}/orders.php` — `orders.statuses.cancelled` already ships with 0045.

### This story is purely additive with respect to 0049 and 0050

**Stated as its own subsection because it is the property that lets this story be implemented
independently of exactly how 0050 phrases its guard.** Everything here is new: one event class, one
listener, one action, one dispatch line, one provider registration. **`CancelOrder`'s guard is not
loosened, not parameterised, not given a `$system` flag, and not called.** `OrderPolicy::cancel()` is
not consulted.

Three consequences follow, and each is worth being explicit about:

1. **A `$systemTriggered = true` parameter on `CancelOrder` was considered and rejected.** It is the
   obvious-looking alternative and it is the wrong shape: a boolean that switches off a guard is a
   one-argument bypass of the exact rule the guard exists to enforce, and it would sit in a
   **public** `__invoke()` signature every present and future caller can reach. That is the same
   failure mode as *"derive a security-relevant flag internally; never take it as a parameter"*
   ([base-standards.md](../../docs/conventions/base-standards.md#an-authorization-rule-belongs-to-the-action-not-to-one-of-its-callers)),
   and it converts 0050's guard from an invariant into a convention.
2. **The two paths are allowed to diverge, because they are different operations.** "An
   administrator decided to cancel this" and "this order's money has entirely gone back" share an
   outcome and share nothing else — different trigger, different actor (one has none), different
   permitted source states. One class implementing both would have to branch on which it was on
   every line that differs, which is most of them.
3. **This story is therefore reviewable against 0050 without reading 0050's code.** Its correctness
   claim is "we do not touch it", which a `git diff` settles.

## Tests to perform

All Feature tests unless marked otherwise; `tests/Feature/Orders/` (created by 0045), plus edits to
0051's existing test file. This story ships no route, so there is no HTTP-level test here at all —
story 0055 owns those ([testing/README.md](../../docs/testing/README.md)).

### The auto-cancel — happy paths

- [ ] **Integration test (dataset over the starting status):** an order in `Pending`, `Processing`,
      `Shipped` and `Delivered`, each `Paid`, each fully refunded through `RecordRefund` → `status`
      reads `Cancelled` in every case. **The `Shipped` / `Delivered` rows are the point of the
      dataset**, because those are exactly the two states 0050 blocks manual cancellation in; a
      dataset covering only `Pending` / `Processing` would pass against an implementation that
      correctly refused to auto-cancel a shipped order.
- [ ] Integration test: a multi-line order with two of three lines already fully refunded is
      cancelled by the refund that empties the third — the transition fires on the **last**
      outstanding unit across the whole order, not per line item.
- [ ] Integration test: after the auto-cancel, `payment_status` still reads `Refunded`. The two
      dimensions are independent and this story writes only one of them; an implementation that
      re-derived or overwrote `payment_status` would pass every other test here.
- [ ] Integration test: the action is callable directly (`app(AutoCancelFullyRefundedOrder::class)($orderId)`)
      and cancels the order without any event being dispatched — the operation is independently
      invocable, per the 0008a rule that an action must not depend on one particular caller.
- [ ] Integration test: `RecordRefund` dispatches exactly one `OrderFullyRefunded` carrying the
      order's id, asserted with `Event::fake()` — the dispatch and the effect are two different
      bugs and need two different assertions.

### Distinct from the manual cancel — the contrast, on one fixture

- [ ] **Integration test (the story's central assertion, and deliberately one test rather than
      two):** take a **single** `Shipped`, `Paid` order fixture; first assert that `CancelOrder`
      refuses it; then, **on that same order**, drive `RecordRefund` to 100% and assert `status` is
      `Cancelled`. Written as one test because "these two paths behave differently **for the same
      order**" is the actual requirement — two independent tests, each with its own fixture, assert
      two facts that happen to be true and never assert the contrast between them. This is
      `backend-qa`'s design and it is not negotiable down to a pair.
- [ ] **Regression guard:** `CancelOrder` still refuses `Shipped`, `Delivered` and
      `PartiallyRefunded` after this story ships — the same assertions 0050 makes, re-run here.
      Redundant on the day it is written and load-bearing the day someone "unifies" the two paths;
      this is the test that fails if a future story adds the `$systemTriggered` parameter rejected
      above.
- [ ] Integration test: `OrderPolicy::cancel()` (if 0050 created one) is **not** consulted by the
      auto-cancel path — asserted by running the auto-cancel with **no authenticated user at all**
      (`Auth::forgetGuards()` / no `actingAs`) and confirming it still succeeds. This is the
      executable form of **D-1**, and it doubles as the proof that a queued or Artisan caller would
      work.

### What must not trigger it

- [ ] Integration test: a partial refund (2 of 5) leaves `status` unchanged, and **no**
      `OrderFullyRefunded` is dispatched (`Event::fake()` asserting not dispatched). Both halves —
      an implementation that dispatches unconditionally and is saved by the listener's guard is a
      different, worse design that would pass a status-only assertion.
- [ ] Integration test: a refund emptying **one** line item of two leaves `status` unchanged.
- [ ] Integration test: a refund touching **every** line without emptying any leaves `status`
      unchanged. This is the mirror of 0051's derivation property **(a)** — the case a rule phrased
      as "some units came back from every line" gets wrong.
- [ ] **Negative test (atomicity):** a three-item refund whose third item exceeds its outstanding
      units leaves `status` unchanged, dispatches nothing, and — asserted in the same test — leaves
      every `refunded_quantity` at its prior value. Asserting only "the status did not change" would
      pass against an implementation that wrote the first two line items and then threw.
- [ ] Negative test: an actor lacking `orders.refund` is refused by `RecordRefund` and `status` is
      unchanged. The chain's authorization lives entirely at its entry point (**D-1**), so this is
      the test that proves the ungated action is not reachable by an unauthorized caller *through
      this path*.

### Atomicity across the seam

- [ ] **Integration test: a refund whose transaction rolls back cancels nothing.** Force a failure
      after the refund writes but before the commit (a `DB::transaction()` callback that throws, or
      an event-driven failure injected in Phase 3), then assert `status` is unchanged, no `refunds`
      row exists, and no `OrderFullyRefunded` was dispatched. **This is the executable form of
      D-5** — the post-commit dispatch's entire justification — and it is the test that fails if a
      later refactor moves the dispatch inside the closure. Note the assertion is *neither* wrote:
      not just "the order was not cancelled" but "the refund did not land either", because an
      implementation that dispatched pre-commit would fail only the first half.

### Idempotency and repetition

- [ ] Integration test: dispatching `OrderFullyRefunded` twice for the same order leaves it
      `Cancelled` with no exception, no second write, and no other column changed. Assert
      `updated_at` is unchanged by the second call as well as `status` — a guard that returns early
      and a guard that re-writes the same value are indistinguishable on `status` alone.
- [ ] Integration test: the action against an already-`Cancelled` order (reached by any route,
      including 0050's manual path) is a no-op rather than an error.
- [ ] Integration test: the action against an `orderId` matching no row returns silently rather than
      throwing — the concurrency case in step 3.

### Deliberately not tested

- **The listener's registration mechanism itself.** That `AppServiceProvider` wires the listener is
  proven transitively by every `RecordRefund`-driven test above, which goes through the real
  dispatcher. A test asserting `Event::assertListening()` on top of that adds no signal — but see
  **R-2**, whose double-fire hazard **is** covered, by the `updated_at` idempotency assertion.
- Concurrency under real parallel load (**R-1**) — the row lock is a code-review item, not a
  reliably testable one, matching 0051's identical position.
- Any refund mechanics 0051 already covers — the derivation, the over-refund guard, the ownership
  guard, `refunded_amount`. This story asserts the *consequence*, never re-asserts the cause.
- Anything rendered (0055), any notification (**D-10**), any manual transition (0049/0050 beyond the
  regression guard above).

## Expected outcome

Once done, recording a refund that returns the last outstanding unit of an order's last outstanding
line item **automatically cancels that order**. The transition happens as a system side effect with
no actor: `RecordRefund` commits its transaction, dispatches `OrderFullyRefunded` carrying the
order's identifier, and a synchronous listener hands it to `AutoCancelFullyRefundedOrder`, which
re-reads the row under a lock and writes `status = Cancelled` directly — past `TransitionOrderStatus`
and past `CancelOrder`, both of which would refuse this transition and neither of which has a person
to authorize against. It works from **every** starting status including `Enviado` and `Entregado`,
which is precisely the behaviour PRD §3.2 asks for and precisely what manual cancellation is still
forbidden to do.

**The manual cancel action is unchanged.** A `Shipped`, `Delivered` or `Parcialmente reembolsado`
order still refuses `CancelOrder`, and the same fixture that proves that refusal is then auto-cancelled
by a full refund in the same test — the contrast is executable rather than asserted twice.

**Nothing is changed that this story does not own:** no table, column, migration or index; no
permission; no policy; no route or screen; no notification. `payment_status` is 0051's and is never
written here, a partial refund dispatches nothing at all, a rolled-back refund cancels nothing, and
a repeated trigger against an already-cancelled order is a silent no-op.

## Acceptance criteria

- [ ] `App\Events\OrderFullyRefunded` exists, carries **only** the order's `string $orderId`, and
      implements neither `ShouldQueue` nor `ShouldBroadcast`.
- [ ] `App\Listeners\CancelFullyRefundedOrder` exists, implements **no** `ShouldQueue`, contains no
      logic beyond delegating to the action, and is registered in `AppServiceProvider` in the same
      form as the existing `ActivateVerifiedUser` registration.
- [ ] `App\Actions\Orders\AutoCancelFullyRefundedOrder` exists, takes a `string $orderId`, re-reads
      the order with `lockForUpdate()` **inside its own** `DB::transaction()`, returns silently for a
      missing row and for an already-`Cancelled` order, and writes `status` via `forceFill()`.
- [ ] The action contains **no** `Gate::authorize()`, no `Auth::user()` read, and no policy call, and
      its class docblock states that this is a documented exception rather than an omission.
- [ ] The action calls **neither** `TransitionOrderStatus` **nor** `CancelOrder`, and neither of
      those classes is modified by this story — verifiable from the diff alone.
- [ ] `RecordRefund` dispatches `OrderFullyRefunded` **after** its transaction closure returns,
      conditioned on the committed order's `payment_status` being `Refunded`, and dispatches nothing
      when it is not.
- [ ] A full refund cancels the order from **every** starting `OrderStatus`, pinned by a dataset that
      includes `Shipped` and `Delivered`.
- [ ] A partial refund leaves `status` unchanged **and** dispatches no event.
- [ ] A refund whose transaction rolls back leaves `status` unchanged, writes no `refunds` row, and
      dispatches nothing.
- [ ] A repeated trigger against an already-`Cancelled` order changes neither `status` nor
      `updated_at`.
- [ ] `payment_status` still reads `Refunded` after the auto-cancel; this story never writes it.
- [ ] `CancelOrder` still refuses `Shipped`, `Delivered` and `PartiallyRefunded` after this story
      ships, pinned by a regression test in this story's own file.
- [ ] The single-fixture contrast test exists: one order, manual cancel refused, then auto-cancelled
      by a full refund.
- [ ] **0051's two falsified tests are updated rather than deleted**, per the table above, and the
      partial-refund half of each survives.
- [ ] No migration, column, index, permission, policy, route, Livewire component, Blade view,
      notification or `config/modules.php` entry is added.

## Definition of Done
- [ ] Tests written and green, plus the full existing suite (per
      [contracts.md](../../docs/contracts.md)'s Full Test Suite Gate Rule) — run **unscoped**
      (`php artisan test`, not `--filter`), per
      [base-standards.md](../../docs/conventions/base-standards.md#steps-1-and-2-are-the-iteration-forms-run-both-unscoped-before-declaring-the-work-done).
      **Non-optional here rather than merely recommended:** this story falsifies two assertions in a
      test file it does not otherwise open, and it registers an **event listener**, which
      [base-standards.md](../../docs/conventions/base-standards.md#steps-1-and-2-are-the-iteration-forms-run-both-unscoped-before-declaring-the-work-done)
      names as having whole-suite blast radius by construction — *"a story that registers a model
      event, an observer, a global scope, or middleware has a blast radius of the whole suite,
      however narrowly its own feature is scoped."*
- [ ] `vendor/bin/pint --format agent` clean (unscoped, **not** `--dirty`) and Larastan level 7
      passing.
- [ ] Code reviewed (code-reviewer) — specifically that `CancelOrder` and `TransitionOrderStatus`
      appear nowhere in the diff, and that the dispatch line sits outside the transaction closure.
- [ ] No security findings (appsec-auditor) — specifically: that the **ungated** action is
      justified and reachable only from a gated entry point (**D-1**); that no caller can supply a
      status; that the write is `forceFill()` on a non-`#[Fillable]` column rather than a widening of
      the mass-assignment surface; and that bypassing two guard classes is a documented decision
      (**D-2**) rather than a discovered shortcut.
- [ ] Documentation updated (docs-keeper):
  - [`conventions/base-standards.md`](../../docs/conventions/base-standards.md)'s directory listing
    gains **`app/Events/`** — a folder that does not exist in this repo today, so this is a
    structural addition to that listing rather than a line edit — plus `CancelFullyRefundedOrder` in
    `app/Listeners/` and `AutoCancelFullyRefundedOrder` in `app/Actions/Orders/`. Its
    *"registered in AppServiceProvider"* note on `app/Listeners/` now covers two listeners.
  - [`architecture/authorization.md`](../../docs/architecture/authorization.md) — **the reusable
    fact, and the reason this story matters beyond Orders:** a system-triggered write may be ungated,
    and what makes that safe is that its only reachable entry point is itself gated. Record it beside
    the existing patterns, with the two properties that must hold (no actor is read, and no caller
    outside a gated path exists) and the docblock requirement that makes "exempt" distinguishable
    from "forgotten". This is the page that owns
    [Recording a refusal](../../docs/architecture/authorization.md#recording-a-refusal--what-every-gate-owes-the-audit-trail);
    an *absence* of a gate deserves the same treatment.
  - [`architecture/overview.md`](../../docs/architecture/overview.md) — its "Where things live" layer
    table gains `app/Events/**`. **Whether the request-lifecycle diagram changes is a judgement
    call to make against the real diagram, not a foregone conclusion**: task 0015b deliberately left
    it alone for a side effect of an existing node, while 0015a added a node for a genuinely new
    step. A post-commit domain event dispatched by an action is arguably the first, but it is the
    first *event* in this application, which argues for the second.
  - [`conventions/naming.md`](../../docs/conventions/naming.md) — verify rather than assume. The
    event's past-participle name follows the existing listener/notification rule and the action's
    imperative-verb-phrase name follows the existing action rule; if both are simply the existing
    rules applied, **list them rather than ruling on them again**, exactly as 0015a's pass did.
  - [`database/schema.md`](../../docs/database/schema.md) and
    [`database/migrations.md`](../../docs/database/migrations.md) — **verify as unchanged rather
    than assumed**. This story's diff contains no column, model or migration.
  - **Grep the tree for bare negative claims this story falsifies**, not just the mapped files —
    anything asserting this app dispatches no domain events, has no `app/Events/`, or that every
    mutation is `Gate`-authorized. That last one is the dangerous shape, because it is the kind of
    reassuring sentence a security page writes in passing. This is the
    [bare-negative-claim](../../docs/errors-log.md#a-docs-this-app-has-no-x-yet-claim-outlived-the-x-by-two-tasks--2026-08-13)
    failure mode.
- [ ] Acceptance criteria met.

## Documented functional decisions

Each resolves a question raised during the debate. Every one is a **conservative, reversible default
the human may override** — the reasoning is recorded so an override is a decision rather than a
rediscovery.

- **D-1 — `AutoCancelFullyRefundedOrder` performs no `Gate::authorize()`, deliberately.** There is no
  actor to authorize: the trigger is a state transition, not a person, and by the time the event
  fires the request that caused it has already been authorized against `orders.refund` by
  `RecordRefund`'s own first statement (0051). Three properties make the exemption safe, and **all
  three must hold for any future story that copies this shape**:
  - **The action reads no actor.** No `Auth::user()`, no `Auth::id()`, no `request()`. A guard that
    would have to consult an actor is a guard that belongs somewhere with one.
  - **Its only reachable entry point is gated.** Today the sole caller is a listener on an event only
    `RecordRefund` dispatches, and `RecordRefund` authorizes as its first statement. **A later story
    adding a second caller inherits the obligation to gate that caller** — this is precisely the
    *"adding an unbounded side effect to shared code is a capability grant to its least-privileged
    caller"* rule from
    [errors-log.md](../../docs/errors-log.md#a-scope-exclusion-named-screens-while-the-story-edited-a-class-those-screens-share--2026-08-24),
    read forwards instead of backwards.
  - **The exemption is written down in the class's own docblock**, not only here, so a reader who
    never opens this file can still tell "exempt" from "forgotten". This mirrors 0015a's precedent
    for `Index::deleteUser()`'s guard placement, where the docblock is what distinguishes a
    deliberate placement from an accident.

  A `Gate::before`-style bypass, a system-user account, and a `Gate::forUser(null)` call were all
  considered and rejected as ceremony that would make the absence of authorization *less* legible
  rather than more.
- **D-2 — The action bypasses both `TransitionOrderStatus` (0049) and `CancelOrder` (0050) and
  writes `orders.status` directly.** Not a shortcut — both would refuse this transition, which is the
  whole point of the story:
  - `CancelOrder` (0050) blocks `Shipped`, `Delivered` and `PartiallyRefunded`, and PRD §3.2
    explicitly requires the auto-cancel to fire in the first two.
  - `TransitionOrderStatus` (0049) governs the administrator-driven `Pendiente → Procesando → Enviado
    → Entregado` progression with a backward-transition confirmation; a system transition has nobody
    to confirm anything.

  Routing through either would therefore require **weakening it**, and the weakening would be a
  parameter — see [the purely-additive subsection](#this-story-is-purely-additive-with-respect-to-0049-and-0050)
  for why that is the wrong shape. `forceFill()` is the sanctioned writer for a non-`#[Fillable]`
  column in this codebase
  ([base-standards.md](../../docs/conventions/base-standards.md#model-conventions)), and
  `orders.status` was omitted from `#[Fillable]` by 0045 for exactly this reason: it must have named
  writers rather than form writers.
- **D-3 — Neither the event nor the listener is queued, and the dispatch is synchronous.**
  `ShouldQueue` is omitted from both. The listener therefore runs **inside the same request**,
  immediately after `RecordRefund`'s commit and before `RecordRefund::__invoke()` returns to its own
  caller — so the window between "the refund is committed" and "the order is cancelled" is
  sub-millisecond and confined to one process. Queueing would make that window unbounded and
  observable: story 0055's screen would re-render a fully refunded order still showing `Enviado`,
  and a queue worker being down would leave orders permanently in an inconsistent state with no
  visible error. The repo's queue is `database`-backed
  ([architecture/overview.md](../../docs/architecture/overview.md)), so a queued listener also adds a
  `jobs` row per refund for no benefit. **Note the deliberate asymmetry with a future notification**
  (**D-10**), which *should* be queued when it lands: a notification's latency is not a correctness
  property, and a status transition's is.
- **D-4 — The event carries `string $orderId` and never a hydrated `Order`.** A model instance in the
  event would be the state as `RecordRefund` last saw it, and the listener's whole job is to act on
  the state **as it is now, under a lock**. Passing the object would make the stale copy reachable —
  and a listener that reads `$event->order->status` looks correct, passes every single-threaded test,
  and is wrong under concurrency. This is the [errors-log](../../docs/errors-log.md#a-guard-took-the-state-it-was-guarding-as-a-parameter-reopening-its-own-hole-one-level-up--2026-08-20)
  rule — *a guard must derive the state it guards, never accept it* — applied to a listener's input.
  Passing the id makes the re-fetch structurally unavoidable rather than a discipline. It also keeps
  the event trivially serialisable if a later story ever does queue it (**D-3** notwithstanding),
  with no `SerializesModels` re-fetch semantics to reason about.
- **D-5 — The dispatch happens after the transaction commits, never inside it.** This is the
  decision `backend-expert` argued from this repo's own
  [errors-log entry](../../docs/errors-log.md#wrapping-existing-code-in-a-dbtransaction-moved-a-cache-flush-nobody-had-written--2026-08-21)
  on transaction-relocated side effects, and 0051's own action spec states the same constraint
  forward-looking: *"when story 0052 adds an auto-cancel side effect … it must fire after the commit,
  or a rolled-back refund cancels an order that was never refunded."* A synchronous listener firing
  inside `RecordRefund`'s transaction would run against uncommitted state and would **not** be rolled
  back if the outer transaction later failed — the cancel would be a fact about an order whose refund
  never happened. `DB::afterCommit()` and a `ShouldHandleEventsAfterCommit` listener were considered
  as alternative mechanisms and are **equivalent in effect but weaker in legibility**: a dispatch
  written plainly below the closure is impossible to misread, while an `afterCommit` marker is a
  property of the class rather than of the call site. The test plan makes the ordering executable
  (the rollback test), so a later refactor cannot quietly move it.
- **D-6 — The listener's action re-reads the order under `lockForUpdate()` inside its own
  transaction.** Two independent reasons. First, correctness under concurrency: the idempotency guard
  (**D-7**) reads the exact row it then writes, so checking outside a lock is a
  time-of-check/time-of-use gap two concurrent triggers walk straight through — the same reasoning
  0051 **D-12** applies to its own guards. Second, the transaction is what makes "read `status`,
  decide, write `status`" one atomic operation rather than three statements that happen to be
  adjacent. Note this is a **second, separate** transaction from `RecordRefund`'s, which has already
  committed — they are never nested.
- **D-7 — Idempotency is an explicit early return on `status === Cancelled`, immediately after the
  locked read.** Three realistic paths reach a duplicate trigger: two near-simultaneous partial
  refunds that both complete the last outstanding units, a duplicated event dispatch from a future
  refactor, and a manual cancellation that raced the refund. All three must be silent no-ops rather
  than errors, because none of them represents anything wrong having happened — the order's desired
  end state is already true. Placement matters and is not cosmetic: **after** the lock, so the lock
  serialises the check rather than the check racing itself. Tested by the `updated_at` assertion,
  because a re-write of the same value is indistinguishable from an early return on `status` alone.
- **D-8 — The listener is registered explicitly in `AppServiceProvider`, matching the existing
  `ActivateVerifiedUser` precedent, rather than relying on Laravel's listener auto-discovery.** One
  registration idiom per repo, and this repo already has one
  ([base-standards.md](../../docs/conventions/base-standards.md#directory-structure) names
  `app/Listeners/` as *"registered in AppServiceProvider"*). **This decision carries a real hazard
  Phase 3 must verify rather than assume** — see **R-2**: if auto-discovery is *also* active, an
  explicitly registered listener fires twice. The idempotency guard (**D-7**) makes a double fire
  harmless, which is a happy accident and not a reason to skip the check.
- **D-9 — No `OrderPolicy` is created here, narrowing 0045's backlog item 1 for a second time.**
  [0045 **D-13**](0045-orders-core-crud-backend.md#documented-functional-decisions) forecast that
  "whichever of stories 0048–0052 arrives first" would create one, and
  [0051 **DR-2**](0051-order-payment-refund-state-backend.md#dr-2--no-orderpolicy-here-despite-0045s-forward-note-naming-this-cluster)
  already declined on the grounds that its rules were about the *row*, not the *actor*. **This story
  declines for a stronger reason: it has no actor at all.** A policy method receives a `User` and this
  operation never has one. If 0049 or 0050 creates an `OrderPolicy`, nothing in this story changes —
  which is itself a useful property to record, since it means this story cannot be blocked by that
  decision going either way.
- **D-10 — An "order auto-cancelled" notification is out of scope, and this is `backend-expert`'s
  explicit recommendation rather than an omission.** Story [0046](0046-orders-new-order-notification-backend.md)
  ships a "new order received" notification, and it is tempting to read a cancellation notice as the
  same feature's other half. It is not: it has a different recipient question (the customer? the
  administrator? both?), a different content question (does it explain *why*?), and a different
  trigger surface (a manual cancellation via 0050 should presumably notify too, which puts the
  feature in neither this story nor 0046). Adding it here would be scope creep into a feature nobody
  has specified. **Recorded as backlog item 1**, with the note that when it lands it should be
  queued — unlike this story's listener (**D-3**), a notification's latency is not a correctness
  property.

### Scope fences: what this story must NOT do

- Must **not** modify `CancelOrder` (0050) or `TransitionOrderStatus` (0049) in any way — not a
  parameter, not a flag, not a new branch, not a widened guard. **The diff is the proof.**
- Must **not** loosen, parameterise or conditionally skip 0050's manual-cancellation guard; the
  regression test asserting it still refuses all three states is what enforces this.
- Must **not** write `orders.payment_status` — that is 0051's, and this story reads it once, at the
  dispatch condition.
- Must **not** add a migration, column, index, cast or `#[Fillable]` entry.
- Must **not** add a permission to `RolePermissionSeeder`, a policy, or a `Gate` definition.
- Must **not** create, dispatch or listen for any event other than `OrderFullyRefunded`, and must not
  send any notification (**D-10**).
- Must **not** queue the event or the listener (**D-3**).
- Must **not** add a route, a Livewire component, a Blade view, a `config/modules.php` entry, or any
  screen copy — story 0055's.
- Must **not** delete either of 0051's two falsified tests; they are inverted or narrowed, and their
  partial-refund halves survive.

## Dependencies, risks and open questions

### Dependencies

| Depends on | State | Verified how |
| --- | --- | --- |
| `RecordRefund` + the `payment_status` derivation | story [0051](0051-order-payment-refund-state-backend.md) — **hard dependency; ⛔ blocked until `done`** | This story adds the one-line dispatch 0051's **OQ-2** left for it, and hooks the `Refunded` transition it derives |
| `orders` / `order_items` tables, `Order` model, `OrderStatus` enum | story [0045](0045-orders-core-crud-backend.md) — **hard dependency, transitively via 0051** | `orders.status` is written here; `OrderStatus::Cancelled` is read |
| `app/Actions/Orders/` folder | story [0045](0045-orders-core-crud-backend.md) | `AutoCancelFullyRefundedOrder` lands beside `CreateOrder` and `RecordRefund` |
| `CancelOrder` + `OrderPolicy::cancel()` | story [0050](0050-order-manual-cancellation-backend.md) — **soft dependency** | Needed for the **contrast test** and the regression guard only; **no code in this story calls, imports or modifies either.** If 0050 is not yet `done`, the two tests that reference it are the only blocked items, and they are blocked on a *test fixture*, not on this story's design |
| `App\Enums\PaymentStatus::Refunded` | story [0045](0045-orders-core-crud-backend.md) | The dispatch condition reads it |
| `AppServiceProvider` listener registration precedent | **shipped** (Epic 1, `ActivateVerifiedUser`) | **D-8** copies its form; **R-2** is the hazard that comes with it |

#### Cross-check required against 0051's already-saved file

**0051 was composed before this story settled its binding mechanism, so this section is the
reconciliation** — the same shape as the 0053/0054 reconciliation done earlier in this epic.

**Finding: 0051 needs no design change.** Its
[**OQ-2**](0051-order-payment-refund-state-backend.md#open-questions) already recommends *exactly*
this mechanism, by name — *"a domain event (`OrderFullyRefunded`) dispatched by `RecordRefund` after
the transaction commits"* — for exactly the two reasons `backend-expert` gave independently (a model
event would fire for any `payment_status` write; a pre-commit listener could cancel an order whose
refund rolls back). It also already assigns the dispatch to this story: *"Adding the dispatch is a
one-line change to `RecordRefund` that 0052 makes; nothing here needs to anticipate it."* The two
documents agree without either having been written to match the other.

**What does need to happen, and it is this story's job rather than an edit to 0051:**

1. **Two of 0051's shipped tests must be updated by this story** — the table under
   [Files to create/modify](#tests-owned-by-0051-that-this-story-falsifies-and-must-update-modified) names
   both. They are 0051's *deliberate* scope fences, written to fail if this feature arrived early, so
   their falsification is the system working as designed. Not doing this is the most likely way this
   story ships red.
2. **0051's scope fence *"Must not dispatch or listen for any event"* remains correct as written** —
   it binds 0051, not this story, and 0051's own OQ-2 carves out the follow-up explicitly. No
   contradiction, and no edit needed.
3. **Optional, at this story's Phase 7 closure:** annotate 0051's OQ-2 to record that the
   recommendation was adopted, so a later reader sees a settled decision rather than an open
   question. That is a closure-time bookkeeping item for `docs-keeper`, not a prerequisite — it does
   not gate Phase 3 in either direction.

#### What depends on this story

- **0055 — the Orders UI.** Renders a `Cancelado` order that reached that state without anyone
  clicking cancel, and must not offer a manual-cancel control for it. Its detail screen is also where
  the `Cancelado` + `Reembolsado` combination first becomes visible to a human.
- **A future "order cancelled" notification** (**D-10**, backlog item 1) — it would listen on the
  same event, or on a broader one covering the manual path too, which is part of why it is not
  specified here.

### Risks

- **R-1 — Two near-simultaneous refunds both completing the last outstanding units.** Realistic
  rather than theoretical: a multi-line order where two administrators each refund a different line's
  final units at the same moment produces two `OrderFullyRefunded` dispatches. *Mitigation:* **D-6**'s
  `lockForUpdate()` serialises the two listener runs, and **D-7**'s guard makes the second a no-op.
  Note 0051's own row lock does **not** cover this — it protects the refund writes, and both
  transactions can legitimately commit; it is the *listener's* lock that matters here.
- **R-2 — The listener may fire twice if Laravel's listener auto-discovery is active alongside the
  explicit `AppServiceProvider` registration (D-8).** Laravel auto-discovers listeners in
  `app/Listeners/` whose `handle()` type-hints an event, and an explicitly registered listener that
  is *also* discovered is invoked twice per dispatch. This repo's `ActivateVerifiedUser` is
  registered explicitly and works, which tells us either discovery is off or its registration form
  avoids the collision — but **which of those is true has not been verified and must not be
  assumed.** *Mitigation, in order:* (a) **Phase 3 must determine the repo's actual configuration by
  execution**, not by reading the provider — dispatch the event once and count invocations, or
  inspect the dispatcher's registered listeners; (b) **D-7**'s idempotency guard makes a double fire
  harmless in effect, which is why this is a risk rather than a blocker; (c) the `updated_at`
  assertion in the idempotency test is what would catch a double *write* if the guard were ever
  removed. This is the [errors-log](../../docs/errors-log.md#a-reviewers-correction-replaced-an-accurate-technical-explanation-with-a-wrong-one-unverified--2026-08-24)
  rule applied preemptively: a hedge is a flag that nobody ran the code.
- **R-3 — A later story "unifying" the manual and automatic cancel paths would silently reopen the
  guard.** The obvious refactor — one `CancelOrder` with a `$systemTriggered` flag — looks like
  cleanup and would make a shipped order manually cancellable to anyone who passes `true`.
  *Mitigation:* the regression test asserting `CancelOrder` still refuses all three states lives in
  **this** story's test file, so the refactor breaks a test whose name explains why; and the
  rejection is written out in
  [the purely-additive subsection](#this-story-is-purely-additive-with-respect-to-0049-and-0050)
  rather than left as tribal knowledge.
- **R-4 — The auto-cancel is invisible in every happy-path refund test that does not assert it.** An
  implementation that never dispatches, or a listener that is never registered, fails **no** test in
  0051 and produces no error anywhere — the order simply stays `Enviado` forever. *Mitigation:* the
  dataset over starting statuses, plus the separate `Event::assertDispatched()` assertion, so the
  dispatch and its effect are pinned independently; an implementation that dispatches into a void
  fails the second group while passing neither.
- **R-5 — This document goes stale while it waits.** It is blocked behind 0051, itself blocked behind
  0045, itself blocked behind five Epic 2 stories — and it additionally depends on 0050, whose file
  did not exist when this one was composed. *Mitigation:* Phase 2's INVEST review must be **re-run**
  immediately before Phase 3 and must re-verify against the shipped code: `RecordRefund`'s real
  signature and return shape, `OrderStatus`'s cases and backing values, `CancelOrder`'s actual guard
  (which this story does not depend on but does test against), the `AppServiceProvider` registration
  form, and 0051's two falsified test names. **Every name in this file is a reading aid, not a
  locator** ([errors-log.md](../../docs/errors-log.md#a-deferred-storys-findings-were-claims-about-a-tree-that-no-longer-existed-and-one-of-them-would-have-reopened-a-bug-in-this-log--2026-08-23)).

### Resolved questions

| Question raised | By | Resolved as |
| --- | --- | --- |
| What binds the auto-cancel to the refund — model event, domain event, or direct call? | backend-expert (and 0051 **OQ-2**) | **Domain event**, dispatched post-commit. 0051's own recommendation, reached independently |
| Inside or outside `RecordRefund`'s transaction? | backend-expert | **D-5** — outside, after commit; pinned by the rollback test |
| Queued or synchronous? | backend-expert | **D-3** — synchronous; a status transition's latency is a correctness property |
| Does the event carry the `Order` or its id? | backend-expert | **D-4** — the id only; a hydrated model makes a stale read reachable |
| Does the auto-cancel go through `CancelOrder` or `TransitionOrderStatus`? | backend-expert | **D-2** — neither; both would refuse it, and weakening either is a one-argument bypass |
| Does the action authorize? | backend-expert | **D-1** — no, deliberately; documented exception with three conditions |
| How is a duplicate trigger handled? | backend-expert / backend-qa | **D-7** — early return on `Cancelled`, after the locked read |
| Does this story create the `OrderPolicy` 0045 forecast? | product-owner (from 0045 **D-13**) | **D-9** — no; it has no actor at all |
| Does this story notify anyone? | backend-expert | **D-10** — no; a separate, unspecified feature |
| Is "distinct from manual cancel" one test or two? | backend-qa | **One test, one fixture** — two independent tests never assert the contrast |

### Open questions

**OQ-1 — Should the auto-cancel write anything recording *why* the order was cancelled?
Non-blocking; backlog.** An order in `Cancelado` today is indistinguishable from one an administrator
cancelled manually, and support will eventually ask. Three shapes exist (a nullable
`orders.cancellation_reason`, a `cancelled_by` nullable FK where `NULL` means "the system", or an
entry in a future order-event log), and choosing between them properly needs 0055's screen to say
what it wants to display. **Not decided here because every option is a column**, and this story's
"no schema change" property is worth more than a speculative one — the same reasoning
[PRD assumption 17](../../docs/PRD/PRD.md#assumptions--confirmed-decisions) applies to change
history generally. Recorded as backlog item 2.

**OQ-2 — Should `AutoCancelFullyRefundedOrder` use the refusal-logging helper, or log the
transition at all? Non-blocking; recommended as a plain `Log::info`, deferred.**
`App\Actions\Auth\LogRefusedPrivilegedAttempt` is the wrong tool — nothing here is refused — but a
**system-performed** privileged write with no actor is arguably the single most valuable thing in
Epic 3 to have a trace of, precisely because no request log will explain it. This is the mirror image
of 0051's **OQ-6**, which asks the same question about a refused refund, and the two should be
answered together rather than one at a time. Not decided unilaterally because no amigo raised it and
neither `CreateOrder` nor `RecordRefund` logs today; adopting it here alone creates an inconsistency
inside one folder.

**OQ-3 — Should the dispatch condition be "payment_status became Refunded" rather than "is
Refunded"? Non-blocking; settle in Phase 3.** As specified, `RecordRefund` dispatches whenever the
committed order reads `Refunded` — which, given 0051 refuses a refund from `Refunded` outright, can
only be true on the transition that produced it. So the two readings are equivalent **today**, and
the "is" form is simpler and has no delta to get wrong (0051 **D-4**'s own rule). The reason this is
a question rather than a decision: if a later story ever makes `payment_status` writable by another
path, the "is" form would re-dispatch on every subsequent refund-adjacent write. **D-7**'s
idempotency guard makes that harmless, which is a second reason not to over-engineer it now.

### Technical tasks for the backlog

Derived from this story, none of them in scope:

1. **An "order cancelled" notification** covering both the automatic and the manual path, queued
   (**D-10**). Its recipient, content and trigger surface are all open questions.
2. **A record of *why* an order was cancelled** (**OQ-1**) — a column, an FK or an event log, chosen
   once story 0055 states what it needs to display.
3. **Decide the logging posture for `app/Actions/Orders/` as a whole** — this story's **OQ-2** and
   0051's **OQ-6** are the same question from two directions and should be answered in one pass
   across `CreateOrder`, `RecordRefund` and `AutoCancelFullyRefundedOrder`.
4. **Re-evaluate the ungated-action pattern** once a second system-triggered write exists in this
   codebase. **D-1**'s three conditions are stated as a rule but have exactly one instance; a second
   one is what would tell us whether they generalise or whether this case is special.

## Provenance

- **PRD source:** [§3.2 Orders](../../docs/PRD/PRD.md#32-orders) — the auto-cancel scenario and its
  explicit contrast with the manual cancel action.
- **Process:** [workflow.md](../../docs/workflow.md) Phase 1 — Three Amigos debate. Contributions
  from `backend-expert` and `backend-qa`, composed by `product-owner` as facilitator. **No
  `database-expert`**, per the [task classification rule](../../docs/workflow.md#task-classification-rule):
  this story adds no table, column, migration or index. **No disagreement was recorded** because
  there was none — the two contributions independently specify the same mechanism, and
  `backend-qa`'s contrast test is the executable form of `backend-expert`'s central claim.
- **Gherkin conventions:** every scenario opens with a named business-role actor ("an order
  administrator") and carries exactly one `When`, per
  [gherkin-guidelines.md](../../docs/testing/frontend/gherkin-guidelines.md) rules 1 and 3 —
  mandatory across all Gherkin in this project, per the incident recorded in
  [errors-log.md](../../docs/errors-log.md). Note the two scenarios whose `Given` carries prior
  state ("whose manual cancellation has just been refused", "already auto-cancelled by a full
  refund") — that state belongs in `Given`, which is what keeps the single-`When` rule intact for the
  contrast case.
- **Stage:** `new`, and **blocked** — see the banner under [Description](#description). It moves to
  `ai-spec/tasks/in-progress/` at the start of Phase 3, and to `ai-spec/tasks/done/` at Phase 7 —
  both moves change this file's directory depth, so every relative link above must be re-resolved on
  each move (both directions), per
  [workflow.md](../../docs/workflow.md#link-integrity-check-on-every-stage-move).
- **Epic 3 decomposition:** the last of the Orders status/refund cluster. Siblings referenced by
  number (0045 core CRUD, 0046 notification, 0049 status transitions, 0050 manual cancellation, 0051
  refund state, 0055 UI) because some of their files may not exist yet — **0050's did not exist when
  this one was composed**, which is exactly why this story's dependency on it is a *test* dependency
  rather than a code one.
