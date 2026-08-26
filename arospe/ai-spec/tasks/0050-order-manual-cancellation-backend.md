# [0050] Order manual cancellation backend

## Description
Give an administrator a way to **manually cancel an order**, per PRD
[§3.2 Orders](../../docs/PRD/PRD.md#32-orders): cancellation is permitted only while the order is
`Pendiente` or `Procesando`, and is **blocked** — with no confirmation path around it — while it is
`Enviado`, `Entregado`, or `Parcialmente reembolsado`. This story owns `CancelOrder`, the
`OrderPolicy::cancel()` ability it authorizes against, the `Order::isManuallyCancellable()` predicate
both read, and the 409 refusal. No refund is triggered, no route, no Livewire component, no Blade
markup, and **not** the 100%-refund auto-cancel, which is story 0052's.

> ## ⛔ BLOCKED — inherited from stories 0045, 0049 and 0051
>
> **This story is fully specified now, but its Phase 3 implementation cannot start until stories
> [0045](0045-orders-core-crud-backend.md), [0049](0049-order-status-transition-backend.md) and
> [0051](0051-order-payment-refund-state-backend.md) are all `done`** — and 0045 is itself blocked on
> five Epic 2 stories (0024 Products, 0029 Product Variants, 0035 Shipping Carriers, 0036 Shipping
> Rates, 0038 Payment Methods; see its
> [**DR-1**](0045-orders-core-crud-backend.md#dr-1--resolved-disagreement--fk-sequencing-vs-unconstrained-placeholder-columns)).
>
> There is nothing to cancel until an `orders` row exists (`App\Models\Order`, `OrderFactory`,
> `App\Enums\OrderStatus`, `App\Enums\PaymentStatus` are all 0045's), and this story **extends**
> `app/Policies/OrderPolicy.php`, which 0049 creates. **0051 became a hard dependency when the human
> product owner decided cancellation requires `orders.refund` as well as `orders.edit`** (**D-6**) —
> `hasPermissionTo('orders.refund')` throws `PermissionDoesNotExist` until 0051's seeder change has
> run, so this is a runtime dependency of the shipped guard, not only of a test. The blocking is
> transitive and adds no new cross-epic dependency of its own.
>
> **What is *not* blocked:** this document. Specifying it now is what lets 0049's forward note
> **D-6** be answered rather than guessed at, and what makes the `TransitionOrderStatus` /
> `CancelOrder` split visible while it is still cheap.

## Type
backend | includes database-expert: **no**

### Three Amigos participants

- `backend-expert` — the independent action and why it is not routed through 0049's
  `TransitionOrderStatus`, the guard's two dimensions, the direct-throw exception, the new policy
  ability and the permissions it requires, and the recommendation that 0049's own Cancelled-refusal
  branch be **left in place** rather than deleted. *(Their permission recommendation — `orders.edit`
  alone — was subsequently overridden by the human product owner; see **D-6**.)*
- `backend-qa` — risk-based test design: the `{Pending, Processing} × {Paid, PendingPayment}` success
  matrix, the guarded-state refusals, the **cross-dimension** `PartiallyRefunded` case singled out as
  the highest-risk test in the story, the "no confirmation bypass exists" structural assertion, and
  the authorization ordering test.
- `database-expert` — **not convened.** This story reuses 0045's `orders.status` and
  `orders.payment_status` columns entirely and ships **no migration, no column and no schema change**,
  which is why the **Type** line reads `includes database-expert: no`.

### Why this is its own story and not part of 0049

0049 owns a **total order**: the four linear statuses have ranks, and the question it answers is
*is the target ahead of or behind the current value*, with a confirmable refusal. Cancellation is a
**state-machine allow-list**: a per-state set of origins it is permitted from, spanning **two
dimensions** (`status` **and** `payment_status`), with an irreversible outcome and **no** confirmation
path. `OrderStatus::rank()` deliberately has no `Cancelled` arm — 0049's **D-3** makes reaching it a
`\UnhandledMatchError` — so cancellation cannot be expressed as a rank comparison at all without
reopening the very bug that guard exists to make structurally impossible. See **D-5**.

## Gherkin

```gherkin
Feature: Order manual cancellation (backend)

  # --- Cancelling in an early status (PRD §3.2, "Manually cancel an order in an early status") ---

  Scenario: Manually cancel an order that is still pending
    Given an order administrator, with an order in "Pendiente"
    When they cancel that order
    Then the order reflects the "Cancelado" status

  Scenario: Manually cancel an order that is being processed
    Given an order administrator, with an order in "Procesando"
    When they cancel that order
    Then the order reflects the "Cancelado" status

  Scenario: Cancelling an order awaiting payment is permitted
    Given an order administrator, with an order in "Pendiente" whose payment is still pending
    When they cancel that order
    Then the order reflects the "Cancelado" status

  Scenario: Cancelling a paid order in an early status is permitted
    Given an order administrator, with a paid order in "Procesando"
    When they cancel that order
    Then the order reflects the "Cancelado" status

  # --- Cancellation is blocked in the guarded states (PRD §3.2, "Manual cancellation is blocked
  #     in guarded states") ---

  Scenario: Cancelling a shipped order is blocked
    Given an order administrator, with an order in "Enviado"
    When they attempt to cancel that order
    Then the cancellation is blocked and the order remains "Enviado"

  Scenario: Cancelling a delivered order is blocked
    Given an order administrator, with an order in "Entregado"
    When they attempt to cancel that order
    Then the cancellation is blocked and the order remains "Entregado"

  Scenario: Cancelling a partially refunded order is blocked
    Given an order administrator, with an order in "Procesando" whose payment state is
      "Parcialmente reembolsado"
    When they attempt to cancel that order
    Then the cancellation is blocked and the order remains "Procesando"

  Scenario: A blocked cancellation offers no confirmation path
    Given an order administrator, with an order in "Enviado"
    When they attempt to cancel that order
    Then the refusal names the order's state as the reason, with no way to confirm past it

  # --- Cancelling an order that is already cancelled ---

  Scenario: Cancelling an already cancelled order is rejected
    Given an order administrator, with an order already in "Cancelado"
    When they attempt to cancel that order
    Then the attempt is rejected with a validation message and the order is unchanged

  # --- Cancellation does not move money ---

  Scenario: Cancelling an order leaves its payment state untouched
    Given an order administrator, with a paid order in "Procesando"
    When they cancel that order
    Then the order's payment state is still recorded as paid, refunding being a separate concern

  Scenario: Cancelling an order records no refund
    Given an order administrator, with a paid order in "Pendiente"
    When they cancel that order
    Then no refund is recorded against any of its line items

  # --- Authorization ---

  # Cancelling requires BOTH the orders edit permission AND the orders refund permission, because
  # a cancellation is administratively paired with a refund in practice (D-6, human product decision).

  Scenario: An administrator holding both the orders edit and orders refund permissions can cancel an order
    Given a signed-in administrator whose role grants both the orders edit permission and the orders
      refund permission
    When they cancel an order in "Pendiente"
    Then the order reflects the "Cancelado" status

  Scenario: An administrator without the orders edit permission cannot cancel an order
    Given a signed-in administrator whose role grants the orders refund permission but not the orders
      edit permission
    When they attempt to cancel an order in "Pendiente"
    Then the attempt is refused and the order's status is unchanged

  Scenario: An administrator without the orders refund permission cannot cancel an order
    Given a signed-in administrator whose role grants the orders edit permission but not the orders
      refund permission
    When they attempt to cancel an order in "Pendiente"
    Then the attempt is refused and the order's status is unchanged

  Scenario: A Super Admin may cancel an order without holding either permission explicitly
    Given a Super Admin holding no individual orders permission
    When they cancel an order in "Pendiente"
    Then the order reflects the "Cancelado" status

  Scenario: A Super Admin is still bound by the guarded states
    Given a Super Admin, with an order in "Enviado"
    When they attempt to cancel that order
    Then the cancellation is blocked and the order remains "Enviado"

  Scenario: A refused cancellation is refused for the permission before the order's state is considered
    Given a signed-in administrator whose role does not grant the orders edit permission, and an
      order in "Enviado"
    When they attempt to cancel that order
    Then the refusal is an authorization refusal, not a statement about the order's state
```

## Files to create/modify

### Model — `app/Models/Order.php` (**modify**, created by 0045)

One method is added. **No column, no cast, no `#[Fillable]` change, no relation, no migration** —
`status` and `payment_status` stay omitted from `#[Fillable]` exactly as 0045 left them.

```php
/**
 * May this order be cancelled by an administrator right now?
 *
 * Non-throwing predicate over BOTH status dimensions, per PRD §3.2: permitted
 * only from Pending/Processing, and never while the payment state is
 * PartiallyRefunded. CancelOrder's guard and OrderPolicy::cancel() are both
 * wrappers around exactly this call, so the rule has ONE implementation and a
 * later UI hint (story 0055's per-row Gate::allows()) cannot drift from the
 * rule that refuses. Same predicate/wrapper shape as
 * OrderStatus::isBackwardFrom() (story 0049 D-2) and
 * App\Actions\Auth\EnsureRecentPasswordConfirmation.
 *
 * Deliberately says nothing about the ACTOR, and nothing about the
 * already-Cancelled case, which CancelOrder rejects earlier and differently
 * (D-3). Reads `Cancelled` as simply not being in the permitted set.
 *
 * The 100%-refund auto-cancel (story 0052) does NOT consult this predicate:
 * it is a system side effect that cancels regardless of state, by design
 * (PRD §3.2, "distinct from the manual cancel action, which stays blocked in
 * those states").
 */
public function isManuallyCancellable(): bool
{
    return in_array($this->status, [OrderStatus::Pending, OrderStatus::Processing], true)
        && $this->payment_status !== PaymentStatus::PartiallyRefunded;
}
```

- **`in_array(..., strict: true)` over a `match`** — unlike `OrderStatus::rank()`, this method must
  answer for **every** case including `Cancelled`, so a total-but-throwing construct would be wrong
  here. It is a membership test, not a classification.
- **The method lives on the model, not on either enum.** It reads two columns of one row, and 0049
  established that `App\Enums\OrderStatus` "stays a value set with an ordering; every rule about
  *rows* lives in the action and the policy". A cross-dimension rule is a row rule.
- Named per [naming.md](../../docs/conventions/naming.md#boolean-properties)'s rule that a predicate
  must read unambiguously **out** of its class: `$order->isManuallyCancellable()` — "manually" is what
  separates it from 0052's auto-cancel, and dropping it would make the name a lie the moment 0052
  ships.

### Policy — `app/Policies/OrderPolicy.php` (**modify**, created by 0049)

**No new policy class.** 0049 creates this file with one ability; this story adds its second, in the
same file. See the parallel-write hazard under [Dependencies](#dependencies).

```php
public const ORDER_REFUND_PERMISSION = 'orders.refund';   // see the constant note below

public function cancel(User $user, Order $order): bool
{
    return $user->hasPermissionTo(self::ORDER_EDIT_PERMISSION)
        && $user->hasPermissionTo(self::ORDER_REFUND_PERMISSION)
        && $order->isManuallyCancellable();
}
```

- **Both permissions are required, not either one** (**D-6**, a human product decision taken during
  Phase 1 reconciliation). Cancelling an order is administratively paired with a refund in practice,
  so whoever may cancel must also be capable of handling the refund conversation that usually
  follows. This is a **precondition on the actor**, not a coupling of the operations: cancellation
  still triggers no refund whatsoever (**D-1**, unchanged).
- **`ORDER_EDIT_PERMISSION` is 0049's existing constant**, reused rather than re-typed — the
  name-it-once rule from [naming.md](../../docs/conventions/naming.md#permission-names).
- **`ORDER_REFUND_PERMISSION` is added by *this* story, and that is a correction to what D-6
  originally assumed.** Story [0051](0051-order-payment-refund-state-backend.md) creates the
  *permission* — `RolePermissionSeeder::ORDER_PERMISSIONS = ['orders.refund']` — but deliberately
  creates **no** `OrderPolicy` (its **DR-2**) and therefore no single-name constant for it;
  `RecordRefund` calls `Gate::authorize('orders.refund')` with a literal. `RolePermissionSeeder::ORDER_PERMISSIONS`
  is an *array* of catalog names, so it is not a reference a guard can name a single permission
  through, and indexing it (`ORDER_PERMISSIONS[0]`) would be worse than the literal. Per
  [naming.md](../../docs/conventions/naming.md#permission-names) — *name a permission once on the
  class that owns the rule, as a `public const` on the policy that decides with it* — this story is
  now the first class to decide with `orders.refund`, so the constant lands on `OrderPolicy` beside
  `ORDER_EDIT_PERMISSION`. **This story still adds no permission** to the catalog; it adds one
  constant naming a permission 0051 already seeds.
  - ⚠️ **Phase 2 must re-verify this against `HEAD`.** If 0051 (or any story between it and this one)
    has since put a single-name constant for `orders.refund` anywhere, **reuse that constant and do
    not declare a second one** — two constants for one permission name is exactly the drift the
    name-it-once rule exists to prevent. Aligning `RecordRefund`'s literal onto whichever constant
    wins is a *follow-up*, not this story's job (backlog item 6); this story does not modify
    `RecordRefund`.
- **The state clause is here so story 0055's UI hint is correct without re-deriving the rule**, and
  it agrees with the action's own guard *by construction* because both call the same predicate. It is
  **not** what enforces the block — see the ⚠️ below.
- The `Gate::before` Super Admin bypass reaches this method like any other; no special case is
  written, and one is asserted by test.

> ⚠️ **This policy's state clause is inert for a Super Admin, and that is why the action does not rely
> on it.** `Gate::before` returns `true` for a Super Admin before `cancel()` is ever called, so a
> policy-expressed state rule cannot bind the one actor most likely to try it — the pattern
> [security/authorization-patterns.md](../../docs/security/authorization-patterns.md#a-rule-that-must-bind-a-super-admin-actor-must-be-a-direct-throw-not-a-gate-check)
> already rules on, and the same reasoning story
> [0051](0051-order-payment-refund-state-backend.md)'s **DR-2** used to keep its refund-state refusal
> out of a policy entirely. **The enforcement is `CancelOrder`'s own direct throw**, which runs for
> every actor including a Super Admin, and the "a Super Admin is still bound by the guarded states"
> scenario above is what pins it. Read the policy clause as the *hint* half of the pair; deleting it
> would leave 0055 rendering an enabled control that always 409s.
>
> This is a narrower position than 0051's, not a contradiction of it: 0051 kept its state rule out of
> the policy because it had **no** UI-hint consumer needing it and a 403 would have been the only
> refusal shape. Here the state rule exists in **both** places on purpose, with the throw as the
> authority and the policy as the hint.

### Exception — `app/Exceptions/OrderCancellationBlockedException.php` (**new**)

Follows [`RoleInUseException`](../../app/Exceptions/RoleInUseException.php) and 0049's
`OrderStatusRegressionRequiresConfirmationException` in shape — a `RuntimeException` with a
`render()` returning **409 Conflict** for both the JSON and the HTML branch.

- **409, and deliberately not 403.** Nothing about this is an authorization failure: the actor holds
  both required permissions and may cancel a different order this instant. A 403 would tell story 0055 to render
  "you may not do this" when the truth is "this order may not be, by anyone".
- **409, and deliberately not the same 409 as 0049's.** Both render 409, and that is correct — both
  are "your request conflicts with this order's current state" — but they are **different classes
  with different messages**, because a caller must be able to tell "confirm and retry" (0049,
  retryable) from "there is no retry" (this one, terminal). A test asserts the class, not only the
  status.
- **The message is a constant** resolved from `lang/{en,es}/orders.php`, never interpolated with the
  order's number or either status — the message-is-a-constant rule from
  [authorization.md](../../docs/architecture/authorization.md#recording-a-refusal--what-every-gate-owes-the-audit-trail).
  It must **not** reuse `orders.transitions.cancellation_unsupported`, which is 0049's key for a
  different refusal (**D-4**).

### Action — `app/Actions/Orders/CancelOrder.php` (**new**, in 0045's subfolder)

Invokable, imperative-verb-phrase class with no `Action` suffix, resolved from the container and
never `new`-ed
([code-style.md](../../docs/conventions/code-style.md#exception-an-actions-own-dependency-is-constructor-injected-when-the-method-signature-is-a-public-contract)):

```php
public function __invoke(Order $order): Order
```

**One parameter. There is no `bool $confirmed`, and its absence is a specified property** (**D-7**),
asserted structurally by a test rather than left to review.

Performing, **in exactly this order** — the ordering is part of the guard, not an implementation
detail:

1. **`Gate::authorize('cancel', $order)` as the first statement.** The rule lives in the class that
   performs the operation, not in a caller that does not exist yet
   ([base-standards.md](../../docs/conventions/base-standards.md#an-authorization-rule-belongs-to-the-action-not-to-one-of-its-callers)).
   Story 0055's Livewire component will re-authorize on top of this, never instead of it.
2. **Reject if `$order->status === OrderStatus::Cancelled`** with a `ValidationException` on the
   `status` field, resolving `orders.cancellation.already_cancelled` (**D-3**). **This must run above
   step 3**, or an already-cancelled order falls into the blocked branch and returns the wrong
   refusal for the wrong reason.
3. **Refuse if `! $order->isManuallyCancellable()`** by throwing `OrderCancellationBlockedException`
   — a **direct throw**, never a second `Gate` check, so it binds a Super Admin (see the ⚠️ above).
4. **Write.** `status` is omitted from `Order`'s `#[Fillable]` by 0045, so the write is an explicit
   `forceFill(['status' => OrderStatus::Cancelled])->save()` — the
   omission-as-mass-assignment-guard convention working as designed. Return the order.

- **No `DB::transaction()`.** A single-row, single-column write with no second statement and no side
  effect; a transaction would wrap nothing. Recorded rather than left to inference, because 0045's
  `CreateOrder` opens one and a reader may expect symmetry — and because adding one later relocates
  every side effect the wrapped code performs, the mistake recorded in
  [errors-log.md](../../docs/errors-log.md#wrapping-existing-code-in-a-dbtransaction-moved-a-cache-flush-nobody-had-written--2026-08-21).
  If story 0052 or a "cancellation notification" story ever adds a side effect here, it fires **after**
  any commit, never inside it.
- **`payment_status` is never read for a decision beyond the predicate, and never written** (**D-1**).
  No `refunds` row, no `refunded_quantity`, no `refunded_amount`, no totals, no `flagged_for_review`.
- **It does not call `TransitionOrderStatus`, and `TransitionOrderStatus` does not call it** (**D-5**).
  The two are siblings, not layers.

### Translations — `lang/en/orders.php` + `lang/es/orders.php` (**modify**, created by 0045)

One new key group, `cancellation`, key-for-key identical across both locales
([naming.md](../../docs/conventions/naming.md#translation-keys)):

```php
'cancellation' => [
    'blocked' => 'This order can no longer be cancelled.',
    'already_cancelled' => 'This order is already cancelled.',
],
```

- **Two keys, two distinct refusals**, and neither replaces nor renames 0049's `transitions` group —
  in particular `transitions.cancellation_unsupported` **stays**, because the branch that resolves it
  stays (**D-4**).
- `statuses` and `payment_statuses` are **not** touched; 0045 already ships `statuses.cancelled`.
- No screen copy — story 0055 extends this file with button and dialog copy and does not rename these.

### Explicitly **not** touched by this story

- `database/migrations/**` — **no migration**; no column, no table, no index, no schema change of any
  kind.
- `app/Actions/Orders/TransitionOrderStatus.php` — **not modified, and specifically its
  Cancelled-refusal branch is not deleted** (**D-4**).
- `app/Actions/Orders/CreateOrder.php`, `RecordRefund.php` — 0045's and 0051's, unchanged. In
  particular this story does **not** re-point `RecordRefund`'s `Gate::authorize('orders.refund')`
  literal at the new `OrderPolicy::ORDER_REFUND_PERMISSION` constant (backlog item 6).
- `app/Enums/OrderStatus.php` — **no case, no `rank()` arm, no method**. Adding a `Cancelled` arm to
  `rank()` is forbidden by 0049's **D-3** and its `\UnhandledMatchError` test, and this story needs
  none.
- `app/Enums/PaymentStatus.php` — read only; no case, no method.
- `database/seeders/RolePermissionSeeder.php` — **no permission is added** (**D-6**), and no catalog
  count moves. **Both** `orders.edit` (0045-era, via `MODULES`) and `orders.refund` (0051's
  `ORDER_PERMISSIONS`) are consumed exactly as already seeded — the guard *reads* two permissions and
  *creates* neither, so this story ships no `RolePermissionSeeder` diff and none of the count
  assertions 0051 had to update move again.
- `routes/*.php`, `config/modules.php`, `app/Livewire/**`, `resources/views/**` — story 0055's.
- `app/Notifications/**`, `app/Listeners/**`, `app/Events/**` — nothing is dispatched or listened for.
- The 100%-refund auto-cancel in every form — story 0052's, and this story's tests assert it is not
  quietly implemented here.

## Tests to perform

All Feature tests unless marked otherwise, in the existing `tests/Feature/Orders/` (0045's folder)
plus `tests/Feature/Policies/OrderPolicyTest.php` (0049's file). This story ships no route, so
**every** authorization test here is action-level; story 0055 owns the HTTP-level ones
([testing/README.md](../../docs/testing/README.md)).

### The model predicate (Unit where possible, otherwise Feature)

- [ ] Test (dataset): `isManuallyCancellable()` is `true` for `{Pending, Processing}` × `{Paid,
      PendingPayment}` — all four combinations, as a dataset rather than one representative case.
- [ ] Test (dataset): `isManuallyCancellable()` is `false` for `Shipped` and `Delivered`, and for
      `Cancelled`.
- [ ] **Test: `isManuallyCancellable()` is `false` for `{Pending, Processing}` × `PartiallyRefunded`**
      — the cross-dimension case, asserted on the predicate as well as through the action, because
      these are two different layers.
- [ ] Test: `isManuallyCancellable()` **never throws** for any `OrderStatus` case, `Cancelled`
      included. It is a membership test, not a `match` — this is what keeps it structurally different
      from `OrderStatus::rank()`.

### Cancelling — happy paths

- [ ] Integration test (dataset): each of `{Pending, Processing}` × `{Paid, PendingPayment}` cancels
      successfully, and the order **re-fetched from the database** (`->fresh()`, never the in-memory
      instance) carries `OrderStatus::Cancelled` as an **enum instance**, not a string.
- [ ] Integration test: the action returns the `Order`, and the returned instance carries the new
      status (so a caller need not re-fetch).
- [ ] Integration test: a successful cancellation leaves `payment_status` **byte-identical** to what
      it was, asserted for a `Paid` order — the executable half of **D-1**.
- [ ] Integration test: a successful cancellation writes **no** `refunds` row and leaves every line
      item's `refunded_quantity` and the order's `refunded_amount` unchanged (**D-1**). *Applies once
      story 0051 has shipped; if it has not, assert `refunded_quantity` alone, which is 0045's.*

### Cancelling — the guarded states

- [ ] Integration test (dataset): `Shipped` and `Delivered` each throw
      `OrderCancellationBlockedException`, **and the order re-fetched from the database still carries
      its original status**. Asserting only the exception would pass against an implementation that
      writes first and throws afterwards.
- [ ] **Integration test: `PartiallyRefunded` blocks the cancellation even from `Pending` and from
      `Processing`** — its own dedicated test, deliberately **not** folded into the status-blocked
      dataset above. `backend-qa` named this the highest-risk case in the story: a guard copy-adapted
      from 0049's `TransitionOrderStatus`, which reads `status` and nothing else, would pass every
      other test in this file and silently miss the entire second dimension. Assert both the exception
      and the unchanged `status`.
- [ ] Integration test: the refusal renders **409**, asserted through the exception's own `render()`
      for both the JSON and the HTML branch — and explicitly **not 403 and not 422**.
- [ ] Integration test: the refusal is an `OrderCancellationBlockedException` and **not**
      `OrderStatusRegressionRequiresConfirmationException` — two classes, both 409, and a caller must
      be able to tell the retryable one from the terminal one.
- [ ] Integration test: the thrown message is the `orders.cancellation.blocked` key's value and
      interpolates neither status nor the order number.

### There is no confirmation bypass

- [ ] **Structural test: `CancelOrder::__invoke()` accepts exactly one parameter, an `Order`** —
      asserted by reflection over the method signature. PRD §3.2 says manual cancellation is *blocked*
      with no exception clause, unlike the backward transition it explicitly makes confirmable, so the
      absence of a `$confirmed`-shaped parameter is a **requirement** rather than an implementation
      choice. Without this test, a later story could add one and every other test here would stay
      green.
- [ ] Integration test: a blocked cancellation is not retryable — re-invoking immediately against the
      same order throws the same exception, and the order is still unchanged.

### Cancelling an already-cancelled order

- [ ] Negative test: cancelling an order already in `Cancelled` throws a `ValidationException` on the
      `status` field, and the order is unchanged (**D-3**).
- [ ] Negative test: that refusal is a `ValidationException` and **not**
      `OrderCancellationBlockedException` — proving the step-2-above-step-3 ordering. A guard written
      with the two checks transposed passes every other test in this file.

### Authorization

**Cancellation requires BOTH `orders.edit` and `orders.refund` (D-6), so every "the actor may
cancel" fixture in this file grants both, and the permission-refusal cases are a *pair* — one per
missing permission. Neither half is optional: a guard that checks only one of the two passes the
other half's test and fails nothing else.** All of these need `orders.refund` to exist in the seeded
catalog, so **the whole Authorization section applies only once story 0051 has shipped** — it is a
hard dependency of the code, not only of a fixture (see [Dependencies](#dependencies)).

- [ ] Negative test: an administrator holding `orders.view` and `orders.refund` but **not**
      `orders.edit` is refused by `CancelOrder` with an `AuthorizationException`, and the order's
      status is unchanged.
- [ ] **Negative test: an administrator holding `orders.edit` but *not* `orders.refund` is refused**
      by `CancelOrder` with an `AuthorizationException`, and the order's status is unchanged. **This
      is the test that pins the human product decision** (**D-6**) — it is the *only* test in this
      file that goes red against the single-permission guard D-6 originally specified, so without it
      the second `hasPermissionTo()` can be deleted with the suite staying green.
- [ ] Integration test: an administrator holding **both** `orders.edit` and `orders.refund` succeeds
      — the positive case beside the two 403s, without which a mistyped ability passes silently
      ([authorization.md](../../docs/architecture/authorization.md#the-copyable-module-gate-pattern-and-the-three-alternatives-rejected)).
      With two abilities in the guard there are now **two** strings that fail closed on a typo, so the
      positive case carries twice the weight it did.
- [ ] Integration test: a Super Admin holding no individual `orders.*` grant succeeds against a
      `Pending` order, via `Gate::before` — which bypasses **both** permission checks, so no Super
      Admin fixture needs either grant.
- [ ] **Integration test: a Super Admin is still refused against a `Shipped` order**, with
      `OrderCancellationBlockedException`. This is the test that proves the block is a direct throw
      rather than a `Gate`-mediated rule — it goes red the moment someone "simplifies" step 3 into a
      second `Gate::authorize()`.
- [ ] Test: both ability strings are asserted **literally** (`OrderPolicy::ORDER_EDIT_PERMISSION ===
      'orders.edit'` and `OrderPolicy::ORDER_REFUND_PERMISSION === 'orders.refund'`) and each is
      asserted to exist in `RolePermissionSeeder`'s seeded catalog, so a typo in the new constant
      cannot fail closed unnoticed. Mirrors 0049's identical test for its own constant.
- [ ] **Ordering test:** an actor lacking `orders.edit`, against an order in `Enviado`, gets the
      `AuthorizationException` — **never** `OrderCancellationBlockedException`. The permission refusal
      always wins
      ([authorization.md](../../docs/architecture/authorization.md#ordering-the-permission-refusal-always-wins)),
      and an inverted order would tell an unauthorized caller that the order exists and what state it
      is in. Assert the same for an actor lacking `orders.refund` — the ordering property belongs to
      the guard as a whole, not to whichever permission happens to be checked first.
- [ ] `tests/Feature/Policies/OrderPolicyTest.php`: `cancel()` returns `true` for a holder of **both**
      `orders.edit` and `orders.refund` against a `Pending` order; `false` for a holder of neither;
      **`false` for a holder of `orders.edit` alone**; **`false` for a holder of `orders.refund`
      alone**; `false` for a both-holder against a `Shipped` order and against a `PartiallyRefunded`
      one; and `true` for a Super Admin through `Gate::before` **even against a `Shipped` order** —
      the last asserted as the *documented* bypass rather than as correct behaviour, with a comment
      pointing at the ⚠️ above and at the action test that covers the real enforcement. Asserted with
      `Gate::forUser()` as well as through the action, since those are two different layers
      ([testing/README.md](../../docs/testing/README.md)). The two single-permission rows are best
      expressed as a dataset over `{edit only, refund only, neither}` → `false`.

### 0049 is unaffected — the regression this story most plausibly causes

- [ ] **Regression test: every one of 0049's `TransitionOrderStatus` tests still passes unmodified**,
      including its whole "`Cancelled` is refused in both directions" group. This story adds a second
      cancellation route; it does not open a path through the first (**D-4**).
- [ ] Integration test: `TransitionOrderStatus` still refuses a transition **to** `Cancelled` from
      every linear status, confirmed and unconfirmed, after `CancelOrder` exists — asserted here as
      well as in 0049's own file, because this is the story that makes someone want to delete that
      branch.
- [ ] Integration test: `OrderStatus::Cancelled->rank()` still throws `\UnhandledMatchError`. This
      story adds no arm and needs none; the test is 0049's and must stay green.

### Scope fences, made executable

- [ ] Integration test: cancelling dispatches **no** notification and **no** event
      (`Notification::fake()` / `Event::fake()` asserting nothing).
- [ ] Integration test: cancelling an order does **not** change any product's or variant's stock. This
      story restores nothing, because nothing in this phase decrements stock at order time — see
      **OQ-2**.

### Deliberately not tested

- The 100%-refund auto-cancel (0052) in any form — including the interaction where a fully-refunded
  order is already `Cancelled`. **D-2** explains why this story needs no code for it, and 0052 owns
  its tests.
- Any refund behaviour (0051), any line-item edit block (0048), any tax resolution (0053/0054),
  anything rendered (0055).
- Any status **history**: nothing records who cancelled an order or when, per 0049's **D-1**, so there
  is nothing to assert. `orders.updated_at` moves, which is not a transition log.
- Migration mechanics — this story ships no migration.

## Expected outcome

Once done, an administrator holding **both `orders.edit` and `orders.refund`** can cancel an order
through `App\Actions\Orders\CancelOrder`, which authorizes itself against the new
`OrderPolicy::cancel()` ability and then applies `OrderStatus::Cancelled` — but **only** while the
order is `Pending` or
`Processing` **and** its payment state is not `PartiallyRefunded`. In `Shipped`, `Delivered`, or
`PartiallyRefunded` the attempt is refused with a **409** `OrderCancellationBlockedException` that
**no caller can confirm past**, because the action takes no confirmation parameter at all — the
deliberate opposite of 0049's confirmable backward transition. Cancelling an order already in
`Cancelled` is a `ValidationException`, not a silent success. The refusal binds a **Super Admin** as
well, because it is a direct throw rather than a `Gate` check.

Cancellation **moves no money**: `payment_status` is read and never written, no `refunds` row is
created, and no refund is triggered — refunding stays a separate, separately-*performed* operation
(story 0051). Requiring `orders.refund` to cancel is a statement about **who may act**, not about
what the action does: the actor must be someone the business would also let handle the refund that
usually follows, and they still have to record that refund themselves, deliberately, through
`RecordRefund` (**D-1**). `App\Models\Order` gains one non-throwing predicate, `isManuallyCancellable()`, which
the policy's hint and the action's refusal are both wrappers around, so story 0055's per-row
`Gate::allows('cancel', …)` cannot disagree with what a click actually does.

**Nothing is added that this story does not own:** no migration, no column, no **permission** (one
`public const` *naming* a permission 0051 already seeds is not a catalog change), no route, no
component, no notification, no event, no second policy class — and 0049's own Cancelled-refusal
branch in `TransitionOrderStatus` is left standing rather than deleted (**D-4**).

## Acceptance criteria

- [ ] `App\Actions\Orders\CancelOrder` exists with the signature `__invoke(Order $order): Order`, is
      resolved from the container and never `new`-ed, including in tests.
- [ ] **`CancelOrder::__invoke()` carries no confirmation parameter of any shape**, pinned by a
      reflection test rather than by review.
- [ ] `App\Policies\OrderPolicy` gains exactly one ability, `cancel(User, Order)`, in the **existing**
      file 0049 created — no new policy class, and no `AuthServiceProvider`.
- [ ] **`OrderPolicy::cancel()` requires BOTH `orders.edit` AND `orders.refund`** (**D-6**) — holding
      either one alone is refused, pinned by a test per direction.
- [ ] `OrderPolicy::cancel()` names both permissions through `public const`s rather than literals:
      `orders.edit` through 0049's existing `ORDER_EDIT_PERMISSION`, and `orders.refund` through
      `ORDER_REFUND_PERMISSION`, added by this story on the same class **unless a single-name constant
      for it already exists at `HEAD`**, in which case that one is reused and no second is declared.
- [ ] `App\Models\Order::isManuallyCancellable()` exists as a non-throwing `bool` predicate reading
      **both** `status` and `payment_status`, and both `OrderPolicy::cancel()` and `CancelOrder`'s
      guard are wrappers around exactly that call rather than second comparisons.
- [ ] `CancelOrder` calls `Gate::authorize('cancel', $order)` as its **first** statement, is refused
      for an actor lacking **either** `orders.edit` **or** `orders.refund`, and passes for a Super
      Admin via the existing bypass.
- [ ] The action's four steps run in the documented order, pinned by the permission-wins test and by
      the already-cancelled-is-a-`ValidationException` test rather than by review.
- [ ] Cancellation **succeeds** from `Pending` and `Processing` for payment states `Paid` and
      `PendingPayment`, and the persisted status is `OrderStatus::Cancelled`.
- [ ] Cancellation is **refused** from `Shipped` and `Delivered`, and — independently of `status` —
      whenever `payment_status` is `PartiallyRefunded`, with an `OrderCancellationBlockedException`
      rendering **409** (not 403, not 422), leaving the persisted status unchanged.
- [ ] **A Super Admin is refused by the guarded states too**, because the refusal is a direct throw.
- [ ] Cancelling an order already in `Cancelled` raises a `ValidationException` on `status` and leaves
      the order unchanged.
- [ ] A successful cancellation leaves `payment_status`, `refunded_quantity` and `refunded_amount`
      untouched and records no refund.
- [ ] **No migration, column, table, index or schema change of any kind** — verified by the absence of
      any file under `database/migrations/` in the diff.
- [ ] No permission is added to `RolePermissionSeeder` and no catalog count moves; **both**
      `orders.edit` and 0051's `orders.refund` are used exactly as already seeded. `RolePermissionSeeder`
      is absent from the diff.
- [ ] No route, Livewire component, Blade view, notification, listener or event is added;
      `CreateOrder`, `RecordRefund`, `OrderItem`, both enums and every factory are unchanged.
- [ ] **`TransitionOrderStatus` is unchanged, including its Cancelled-refusal branch** (**D-4**), and
      all of story 0049's tests pass unmodified.
- [ ] `lang/en/orders.php` and `lang/es/orders.php` gain the same two `cancellation.*` keys, remain
      key-for-key identical, and 0049's `transitions.*` keys are neither renamed nor removed.
- [ ] All of story 0045's tests pass unmodified.

## Definition of Done
- [ ] Tests written and green, plus the full existing suite (per
      [contracts.md](../../docs/contracts.md)'s Full Test Suite Gate Rule) — run **unscoped**
      (`php artisan test`, not `--filter`), per
      [base-standards.md](../../docs/conventions/base-standards.md#steps-1-and-2-are-the-iteration-forms-run-both-unscoped-before-declaring-the-work-done).
      Note this story adds a **policy ability**, which binds every `Gate::allows('cancel', …)` /
      `authorize()` call against an `Order` anywhere in the suite — narrower blast radius than 0049's
      policy creation, but not zero.
- [ ] `vendor/bin/pint --format agent` clean (unscoped, **not** `--dirty`) and Larastan level 7 passing.
- [ ] Code reviewed (code-reviewer).
- [ ] No security findings (appsec-auditor) — specifically: that the permission check runs before any
      state is read or disclosed; that the guarded-state refusal is a **direct throw** and therefore
      binds a Super Admin, with the policy's parallel state clause understood as a UI hint rather than
      a control; that no caller-supplied value can bypass the guard (there is no second parameter);
      that the already-cancelled and blocked refusals cannot be transposed; and that the 409 discloses
      no more about the order than that the caller's own requested cancellation is not permitted.
- [ ] Documentation updated (docs-keeper):
  - [`architecture/authorization.md`](../../docs/architecture/authorization.md#policies) — `OrderPolicy`
    now has **two** abilities, not one; **re-count rather than assume**, the under-count failure mode
    recorded in
    [errors-log.md](../../docs/errors-log.md#a-docs-this-app-has-no-x-yet-claim-outlived-the-x-by-two-tasks--2026-08-13).
    Record the **hint-in-the-policy / authority-in-the-action** split and why it does not contradict
    0051's **DR-2** — that pairing is the reusable fact a later epic inherits. **Also record that
    `cancel()` is this repo's first ability requiring *two* permissions** (**D-6**), with the product
    reason (cancellation is administratively paired with a refund) and the two mechanical
    consequences a later epic inherits: an `AND` of `hasPermissionTo()` calls is how a
    "composed capability" is expressed here rather than by minting a third permission, and
    `hasPermissionTo()` **throws** rather than returning `false` for a name absent from the catalog,
    which makes every permission a composed ability names a hard dependency on its seeder.
  - [`conventions/base-standards.md`](../../docs/conventions/base-standards.md#directory-structure)'s
    directory listing gains `OrderCancellationBlockedException → 409` beside the exceptions already
    listed there. **Note two app exceptions now render 409** — check whether any nearby sentence
    claims `RoleInUseException` is the only one.
  - [`conventions/naming.md`](../../docs/conventions/naming.md#classes) gains the new exception row,
    and its boolean-predicate rule gains `isManuallyCancellable()` as the case where the *adverb*
    carries the meaning (dropping "manually" would make the name false once 0052 ships).
  - [`database/schema.md`](../../docs/database/schema.md) — **verify rather than assume**: this story
    changes no column, model attribute or migration, so the expected outcome is "no change", recorded
    as verified.
  - **Grep for bare negative claims this story falsifies** rather than trusting the change→doc
    mapping — "`OrderPolicy` has one ability", "the only 409 is …", "cancellation is not implemented".
- [ ] Acceptance criteria met.

## Documented functional decisions

Each resolves an open item raised during the debate. Every one is a **conservative, reversible
default the human may override** — the reasoning is recorded so an override is a decision rather than
a rediscovery.

> **One has been overridden, and the mechanism worked as intended.** **D-6** originally reduced
> cancellation to `orders.edit` alone and *rejected* `orders.refund` outright. The human product
> owner overrode that during Phase 1 reconciliation: cancellation now requires **both**. D-6 below is
> rewritten around the decision actually taken, with the superseded reasoning kept visible so the
> next reader sees a decision rather than an unexplained rule. **D-1's third argument is a casualty
> of it** and is corrected in place rather than quietly left standing.

- **D-1 — Cancelling an order **never** triggers a refund, in any state.** *(Resolves
  `backend-expert`'s first open item; their recommendation adopted.)* An administrator cancelling a
  `Paid` order that has not shipped very plausibly *also* wants to return the money — and this story
  deliberately does not do it for them. **Two surviving reasons, and one retired by the human's D-6
  override** (the ⚠️ below — kept visible so it is not re-proposed).
  - **The PRD keeps them apart.** §3.2 states cancellation and refunds as separate Gherkin scenarios
    with separate acceptance criteria, and the one place it *does* couple them runs the other way
    (a 100% refund auto-cancels; a cancellation does not auto-refund). Inventing the reverse coupling
    would be adding a requirement the PRD does not contain — the scope creep 0049's **D-8** names.
  - **Story [0051](0051-order-payment-refund-state-backend.md) already owns the complete refund
    mechanism**, and it is not a one-liner: a `refunds` event-log row per line item, `amount` derived
    from a snapshotted `unit_price`, `refunded_by` from `Auth::id()`, `refunded_quantity` and
    `refunded_amount` running totals, a row-locked over-refund guard, and a **derived**
    `payment_status`. Re-entering all of that from a cancellation means either calling `RecordRefund`
    with a synthesised full-quantity payload or duplicating it — the first makes cancellation a
    financial write, the second is drift by construction.
  - **A refund is a decision with parameters, and a cancellation supplies none of them.** 0051's
    `RecordRefund` needs a per-line-item quantity, and it accepts a `reason` (its **D-11**). A
    cancellation knows none of that: synthesising "all lines, full quantity, no reason" is the
    action *guessing* at a financial figure on the administrator's behalf, and it is wrong for every
    partial case — a restocking fee, an already-shipped line, a customer who agreed to store credit.
    The administrator has to state the amount, so the administrator has to perform the refund.

  > ⚠️ **D-1 originally had a third reason, and the human's override of D-6 retired it.** It read:
  > *"Decisively: the two operations are authorized differently. Cancellation reduces to `orders.edit`;
  > a refund requires `orders.refund`, created precisely so a business can grant order maintenance to
  > staff who may not move money. Auto-refunding from a cancellation would let an actor holding only
  > `orders.edit` cause a refund"* — the [least-privileged-caller capability grant](../../docs/errors-log.md#a-scope-exclusion-named-screens-while-the-story-edited-a-class-those-screens-share--2026-08-24)
  > failure arriving as a feature request. **That argument is now moot: under D-6 as decided, every
  > actor who can reach `CancelOrder` already holds `orders.refund`,** so an auto-refund would grant
  > that actor nothing they did not already have. Recorded rather than deleted, because a reader who
  > only sees the surviving two reasons might reasonably re-propose the auto-refund on exactly this
  > ground. **D-1's conclusion is unchanged and rests on the two reasons above** — the PRD's own
  > separation, and a refund being a parameterised decision the actor must make. What the override
  > removes is a *security* argument for the separation, not the product argument.

  **The consequence, stated rather than glossed:** an administrator cancelling a paid order must
  record the refund as a second, deliberate action, and until they do the order reads `Cancelado` /
  `Pagado`. That combination is legitimate — goods not yet shipped, money not yet returned — and story
  0055 may reasonably surface it as a prompt. **D-6 makes that prompt strictly actionable**, which is
  a genuine improvement the override buys: whoever just cancelled is guaranteed to hold
  `orders.refund`, so 0055 can never render a "record the refund" call-to-action the current actor is
  refused on. Making it a single action later is an additive change to a *caller*, never to
  `CancelOrder`.
- **D-2 — No explicit check for a fully `Refunded` payment state; its absence is a decision, not an
  oversight.** *(Resolves `backend-expert`'s second open item; their reasoning adopted.)* PRD §3.2's
  guarded-state list names `Enviado`, `Entregado` and `Parcialmente reembolsado` — and conspicuously
  **not** `Reembolsado`. That reads as a gap until the flow is traced, so it is recorded here so a
  later reader does not "fix" it:
  - A fully `Refunded` payment state is reachable only through story
    [0051](0051-order-payment-refund-state-backend.md)'s `RecordRefund`, whose derivation sets
    `Refunded` exactly when every line item is fully refunded.
  - That is precisely the 100%-refund event story **0052** listens on, and 0052 sets
    `status = Cancelled` as a system side effect **regardless of the order's current status** (PRD
    §3.2, and its acceptance criterion).
  - So any order carrying `payment_status = Refunded` is already `status = Cancelled`, which
    `isManuallyCancellable()` excludes structurally (`Cancelled ∉ {Pending, Processing}`) and which
    step 2 of the action rejects even earlier with its own message. **An explicit
    `payment_status !== Refunded` clause would be unreachable code**, and unreachable guard code is
    worse than none: it cannot be tested honestly, and its presence implies a path that does not exist.

  ⚠️ **This decision has a dependency, and it is on a story that does not exist yet.** It holds only
  while 0052 cancels on *every* 100%-refund. **If 0052 ships with any state in which it declines to
  auto-cancel, a `Refunded` order can exist in `Pending`/`Processing`, and this story must add the
  explicit clause** — one line in `isManuallyCancellable()` plus its dataset row. 0052's Phase 2 must
  re-read this decision; it is listed as backlog item 1.
- **D-3 — Cancelling an order that is already `Cancelled` is a validation ERROR, not an idempotent
  no-op.** *(Resolves the open item `backend-qa` and `backend-expert` raised independently;
  `backend-qa`'s recommendation to follow 0049's precedent adopted.)* 0049's **D-4** made the
  identical call for a same-status transition, and the reasoning transfers unchanged: a silent success
  makes three different situations indistinguishable at the call site — a deliberate re-apply, a
  double-submitted form, and a caller that computed the wrong target — and the third is a bug the
  rejection surfaces immediately instead of swallowing. Two consequences of following the precedent
  rather than inventing a second convention:
  - It is a `ValidationException` on the `status` field, **not** the 409, because it is exactly what
    validation is for (a well-formed request naming a value that is not acceptable for this target),
    and because it therefore renders as a field error in 0055's form with no extra handling — the same
    shape 0049's same-status refusal already produces.
  - It runs **above** the blocked-state check, which is load-bearing rather than cosmetic: `Cancelled`
    is not in `{Pending, Processing}`, so a transposed order silently reports "this order can no
    longer be cancelled" for an order that is already exactly what the caller asked for. Its own test
    pins the ordering.

  **Relaxing this later is a one-branch change**, so the strict direction is the cheap one.
- **D-4 — Story 0049's Cancelled-refusal branch in `TransitionOrderStatus` stays. This story does
  **not** delete it.** *(Resolves `backend-expert`'s explicit recommendation; adopted.)*
  [0049's **D-6**](0049-order-status-transition-backend.md#documented-functional-decisions) predicted
  the opposite — *"story 0050 will almost certainly **delete** this branch when it takes ownership of
  cancellation, so a class created here would be born with a scheduled removal"* — and used that
  prediction to justify raising the refusal as a `ValidationException` rather than a dedicated
  exception class. **That prediction is narrowed here, and the reason is that 0050 introduces a
  *second* cancellation route rather than relocating the first:**
  - `TransitionOrderStatus` remains a **valid, independently-callable direct-call path**, by the same
    0008a rule that makes every action in this repo independently callable. Deleting its
    Cancelled-refusal branch would let `TransitionOrderStatus($order, OrderStatus::Cancelled)` cancel
    an order **bypassing `CancelOrder`'s guards entirely** — no allow-list, no `payment_status`
    dimension, and reachable *backward* out of `Cancelled` with `confirmed: true`. That is not a
    cleanup; it is a hole.
  - It would also reach `OrderStatus::rank()` on a `Cancelled` value, which 0049's **D-3** makes an
    `\UnhandledMatchError` on purpose and pins with its own test.

  **Where this leaves 0049's own text:** its D-6 was phrased as a *prediction* ("will almost certainly
  delete"), not a commitment, so nothing in 0049 becomes wrong — but the sentence now reads as stale
  to anyone opening that file after this one. **Flagged as a Phase 2 note rather than an edit**: this
  story does not rewrite a sibling's decision record, and `code-reviewer` should decide whether 0049's
  D-6 gets a one-line "narrowed by 0050" annotation (recommended) or is left as the honest prediction
  it was. The two refusals stay distinguishable by construction: 0049's is a `ValidationException`
  resolving `orders.transitions.cancellation_unsupported`, this story's is a 409 resolving
  `orders.cancellation.blocked`.
- **D-5 — `CancelOrder` is an independent action, not a call into or out of
  `TransitionOrderStatus`.** *(Resolves `backend-expert`'s central design proposal; adopted.)*
  Cancellation is a **state-machine allow-list**, not a ladder comparison, and the difference is
  structural rather than stylistic:

  | | `TransitionOrderStatus` (0049) | `CancelOrder` (this story) |
  | --- | --- | --- |
  | Question asked | Is the target ahead of or behind the current value? | Is the current value in the permitted origin set? |
  | Dimensions read | `status` only | `status` **and** `payment_status` |
  | Mechanism | `rank()` comparison over a total order | membership test over an allow-list |
  | Refusal | confirmable (`$confirmed: true` retries) | **terminal**, no parameter to pass |
  | Target's rank | always defined | `Cancelled` has **none**, by 0049 **D-3** |

  Routing cancellation through the ladder would require giving `Cancelled` a rank — forbidden by
  0049's **D-3** and its `\UnhandledMatchError` test — or special-casing it *inside* the ladder, which
  is the "a status with no position compared against four that have one" bug that guard exists to make
  impossible. The two actions are siblings in `app/Actions/Orders/`, neither calling the other.
- **D-6 — Cancelling requires BOTH `orders.edit` AND `orders.refund`. No `orders.cancel` permission
  is created.** *(Raised by `backend-expert` as a permission question; the facilitator's original
  answer — `orders.edit` alone — was **overridden by explicit human product decision during Phase 1
  reconciliation**, and this entry records the decision actually taken.)*

  **The decision, and the reasoning given for it.** An order administrator may cancel an order only
  if their role grants **both** permissions. The business reasoning, in the product owner's own words:
  *"porque en el momento que se cancele un pedido, suele ir acompañado de un refund"* — cancelling an
  order is, in practice, administratively paired with refunding it. Whoever is trusted to cancel must
  therefore also be someone the business is willing to have handle the refund conversation that
  usually follows. Read it as a statement about **who the actor is**, not about what the action does.

  Two things this decision explicitly does **not** mean, both worth stating because the shape invites
  the misreading:
  - **It is not an auto-refund.** **D-1** is unchanged and unchallenged: cancelling writes no
    `refunds` row, touches no `payment_status`, and moves no money. The refund, if there is one, is a
    second deliberate act through 0051's `RecordRefund`. What D-6 requires is a *capability of the
    actor*, checked as a precondition; what D-1 forbids is a *side effect of the operation*. (D-1's
    own third argument was a casualty of this override and is retired there, in writing.)
  - **It is not `orders.refund` alone.** `orders.edit` remains required, so the split 0051's **D-3**
    created is not inverted: someone granted refund rights and nothing else still cannot cancel, and
    cancellation is still fundamentally a write to an `orders` column that order maintenance owns.
    The requirement is the **intersection** of the two, which is strictly narrower than either.

  **What this supersedes.** The facilitator's original D-6 reduced cancellation to `orders.edit`
  alone and rejected `orders.refund` *outright* — *"Not `orders.refund`, unambiguously. Cancellation
  moves no money (D-1) … Gating cancellation on it would invert the split"* — and specified a test
  asserting that *"an administrator holding `orders.refund` but not `orders.edit` is refused;
  cancellation does not ride on the refund permission"*. **That test's assertion survives verbatim
  and its stated reason does not**: refund-only is still refused, but because both are required, not
  because the refund permission is irrelevant. Its missing mirror — edit-only is *also* refused — is
  the behaviour change this override actually introduces, and is now specified in
  [Tests to perform](#authorization) as the one test that goes red against the superseded guard.

  ✅ **This also resolves the tension the original D-6 flagged, rather than leaving it open.** 0049's
  **D-7** states the rule as *"give an operation its own permission when it is **irreversible** or
  financially consequential"*. Cancellation **is** irreversible today (PRD §3.2 documents no path out
  of `Cancelado`, and 0049 refuses every transition out of it), so the original D-6 could only satisfy
  half of that two-part test and recorded the shortfall as an open reviewer concern — the honest
  answer being that `orders.edit` alone covered neither the irreversibility nor the financial
  dimension. **The human's resolution covers the financial dimension directly**: the guard now
  requires the very permission 0051 created *because* it is financially consequential, so
  cancellation is gated on a financial capability without inventing a third permission to express it.
  D-7's rule is satisfied by **composition of two existing permissions** rather than by a new one —
  which is the cheaper answer, and the one the human chose. **This is settled, not reviewer-negotiable.**

  **A dedicated `orders.cancel` was the alternative and was not taken.** It remains theoretically
  available (additive, in 0051 **D-3**'s exact shape — a non-CRUD permission on an existing module
  slug, its own constant, one `roles.actions.*` leaf per locale, plus that story's documented
  catalog-count blast radius), but the human answered this question with a *different* resolution, so
  it is **not** a backlog item and should not be re-proposed as one absent a new business reason.

  ⚠️ **The cost, stated rather than glossed: this makes 0051 a hard dependency of the shipped code.**
  `hasPermissionTo('orders.refund')` throws `PermissionDoesNotExist` when the permission is not in
  the catalog, so `OrderPolicy::cancel()` cannot run at all until 0051's seeder change has shipped —
  where the original D-6 depended on 0051 only for one test's realism. See the ⛔ banner and
  [Dependencies](#dependencies), both updated for it.
- **D-7 — There is no confirmation path, and no confirmation parameter.** PRD §3.2 says manual
  cancellation in the guarded states is *"blocked"*, full stop — with no *"not flatly forbidden"*
  clause of the kind it attaches to the backward transition, and no `Scenario` offering a confirmed
  override. The contrast is deliberate in the PRD and is preserved here:

  | | 0049's backward transition | This story's blocked cancellation |
  | --- | --- | --- |
  | PRD wording | "requires explicit confirmation … not flatly forbidden" | "manual cancellation is blocked" |
  | Signature | `__invoke(Order, OrderStatus, bool $confirmed = false)` | `__invoke(Order)` |
  | Refusal | `OrderStatusRegressionRequiresConfirmationException` → 409, **retryable** | `OrderCancellationBlockedException` → 409, **terminal** |

  **The absence is asserted structurally** — a reflection test over `__invoke()`'s parameter list —
  because "we did not add a parameter" is invisible to every behavioural test in the file, and a later
  story adding one would go unnoticed. **Loosening this later is an action-only change** with no
  schema consequence, so the restrictive direction is the cheap one, exactly as 0049's **D-4** is for
  its same-status rejection.

### Scope fences: what this story must NOT do

- Must **not** add a migration, a column, a table, an index or any schema change.
- Must **not** implement, dispatch, listen for or otherwise anticipate the 100%-refund auto-cancel
  (0052) — including any `payment_status`-driven branch that sets `status`.
- Must **not** record a refund, write `payment_status`, `refunded_quantity`, `refunded_amount`, or
  create a `refunds` row (**D-1**).
- Must **not** modify `App\Actions\Orders\TransitionOrderStatus`, and specifically must **not** delete
  its Cancelled-refusal branch (**D-4**).
- Must **not** add a `Cancelled` arm to `OrderStatus::rank()`, or any case or method to either enum
  (0049 **D-3**).
- Must **not** add a permission to `RolePermissionSeeder` (**D-6**) — `orders.edit` and
  `orders.refund` are both consumed exactly as seeded, and no catalog count moves. In particular,
  must **not** create `orders.cancel`: the human answered that question with the two-permission
  requirement instead.
- Must **not** declare a second constant for a permission that already has one — if `orders.refund`
  has acquired a single-name constant anywhere by Phase 3, reuse it (**D-6**).
- Must **not** modify `App\Actions\Orders\RecordRefund` to consume the new constant — that alignment
  is a follow-up, not this story.
- Must **not** create a second policy class — `OrderPolicy` exists, created by 0049.
- Must **not** add a policy ability that has no caller in this story.
- Must **not** block, permit or reason about **line-item editing** in any status (0048).
- Must **not** resolve a Sales Region, compute tax, or set `flagged_for_review` (0053/0054).
- Must **not** add a route, a Livewire component, a Blade view, a `config/modules.php` entry, or any
  screen copy to `lang/{en,es}/orders.php` beyond the two `cancellation.*` keys (0055).
- Must **not** restore stock, decrement it, or touch any product/variant row (**OQ-2**).

## Dependencies, risks and open questions

### Dependencies

| Depends on | State | Verified how |
| --- | --- | --- |
| `orders` table, `App\Models\Order`, `OrderFactory` | story [0045](0045-orders-core-crud-backend.md) — **hard dependency; ⛔ inherited BLOCKED** | there is no row to cancel without it; every test creates its order through `OrderFactory` |
| `App\Enums\OrderStatus` (five cases) and `App\Enums\PaymentStatus` (four cases) | story [0045](0045-orders-core-crud-backend.md) | the predicate reads both; **no case is added to either** |
| `app/Policies/OrderPolicy.php` | story [0049](0049-order-status-transition-backend.md) — **hard dependency** | this story adds an ability to that **existing** file and reuses its `ORDER_EDIT_PERMISSION` constant. **Not parallel-safe — see below** |
| `app/Actions/Orders/` folder | story [0045](0045-orders-core-crud-backend.md) | `CancelOrder` lands beside `CreateOrder` and `TransitionOrderStatus` |
| **`orders.refund` in the seeded catalog** | story [0051](0051-order-payment-refund-state-backend.md) — **hard dependency of the shipped guard** (**D-6**) | `OrderPolicy::cancel()` calls `hasPermissionTo('orders.refund')`, which throws `PermissionDoesNotExist` until `RolePermissionSeeder::ORDER_PERMISSIONS` exists. Verify by reading that constant at `HEAD`, not by assuming — see the note below |
| `orders.payment_status` reaching `PartiallyRefunded` | story [0051](0051-order-payment-refund-state-backend.md) — **hard dependency for the highest-risk test** | the guard reads a value only `RecordRefund` can derive |
| `orders.edit` in the seeded catalog | **shipped** | `RolePermissionSeeder::MODULES` carries `orders` |
| `Gate::before` Super Admin bypass | **shipped** (Epic 1) | [authorization.md](../../docs/architecture/authorization.md#the-super-admin-bypass) |
| The domain-exception-renders-its-own-status pattern | **shipped** | [`RoleInUseException`](../../app/Exceptions/RoleInUseException.php) → 409, copied in shape |

**On the 0051 dependency, precisely — and this is what the human's D-6 override changed most.** There
are now **two** dependencies on 0051, and they are of different strengths:

- **The `orders.refund` permission is a hard dependency of the shipped code.** Since D-6 was
  overridden, `OrderPolicy::cancel()` calls `hasPermissionTo('orders.refund')`, and Spatie throws
  `PermissionDoesNotExist` for a name absent from the catalog — so before 0051 ships, *every*
  cancellation attempt raises that exception rather than being allowed or refused, for every actor
  including a would-be Super Admin path. **There is no fixture workaround worth taking**: seeding the
  permission by hand in this story's tests would make them pass against a catalog production does not
  have, which is the same fail-open-in-a-fixture shape this repo already warns about. **0051 must be
  `done` first.** This is why it now appears in the ⛔ banner.
- **`PaymentStatus::PartiallyRefunded` is a test-realism dependency only.** That enum case is 0045's,
  not 0051's, so the *predicate* compiles and behaves correctly regardless; what 0051 provides is the
  only *legitimate* way to reach the state. Were the ordering ever different, that test would
  construct the state directly through `OrderFactory` / `forceFill()` and be marked as doing so — it
  must **not** be dropped, because the guard's second dimension is exactly what a copy-adapted 0049
  guard silently loses. In practice the first bullet makes this moot: 0051 is done before Phase 3
  starts either way.

**Phase 2 must verify the permission exists by reading `RolePermissionSeeder` at `HEAD`**, not by
trusting this file — 0051's own catalog constant is named `ORDER_PERMISSIONS` here as a reading aid,
and every name in this document is a reading aid rather than a locator (**R-5**).

> ⚠️ **This story is not parallel-safe with 0049, 0051, 0052 or 0055 — they all write
> `app/Policies/OrderPolicy.php`.** 0049's **D-5** flagged this in advance: *"0050, 0051, 0052 and 0055
> all add abilities to **this same file**"*, and it is the same-file-ownership hazard recorded in
> [errors-log.md](../../docs/errors-log.md#two-agents-dispatched-in-parallel-both-wrote-to-the-same-blade-view--2026-08-16)
> and governed by `contracts.md`'s Parallel Agent File-Ownership Rule. **Sequence them, or name the
> file's owner explicitly in both briefs.** Note 0051's **DR-2** has since decided that story adds
> **no** ability, so today the contended set is 0049 → 0050 → (0052, 0055). `lang/{en,es}/orders.php`
> is contended the same way, by a different set of stories and a different key group each.

#### What depends on this story

- **0052 — auto-cancel on 100% refund.** **This story is 0052's hard dependency, and the dependency is
  a *negative* one worth stating plainly: 0052 must **not** go through `CancelOrder`.** Its whole
  point is that a system-triggered cancellation applies *"regardless of its current status"* (PRD
  §3.2) — including from `Enviado` and `Entregado`, the exact states this story blocks, and while
  `payment_status` passes through `PartiallyRefunded` on its way to `Refunded`. Routing it through
  this action would make the auto-cancel refuse itself in precisely the cases the PRD names. 0052
  writes `status = Cancelled` by its own path, and it must **not** call
  `Order::isManuallyCancellable()` either — the predicate's name says who it is for. This story's
  **D-2** additionally depends on 0052 cancelling on *every* 100%-refund; if it does not, D-2 reopens.
- **0055 — the Orders UI.** Renders the cancel control and disables it in the guarded states, reusing
  `Gate::allows('cancel', $order)` rather than re-deriving the rule
  ([authorization.md](../../docs/architecture/authorization.md#gateallows-in-a-list-query-is-a-ui-hint-not-a-layer)),
  and renders the 409's message. Note the one accepted drift it inherits: a **Super Admin** sees the
  control render *enabled* on a `Shipped` order (`Gate::before` grants it) and gets a 409 on click —
  the same enabled-then-refused shape this repo already documents for the Users and Roles screens, and
  never the reverse.
- **0048 — the hard block on editing a shipped order's line items.** Independent of this story's code,
  but it shares `OrderPolicy` if it needs an ability of its own; see the ⚠️ above.

### Risks

- **R-1 — A guard copy-adapted from 0049 silently loses the second dimension.** `TransitionOrderStatus`
  reads `status` and nothing else, and it is the obvious file to crib from. A `CancelOrder` guard
  written as "is `status` in `{Pending, Processing}`" passes **every** scenario in this file except
  one, and the one it fails is the least obvious to think of. *Mitigation:* the `PartiallyRefunded`
  case is specified as its **own** dedicated test rather than folded into the status-blocked dataset,
  and the predicate is tested independently of the action so the loss is caught at two layers.
- **R-2 — The state block is easy to ship as a `Gate` check, where it is inert for a Super Admin.**
  Putting the whole rule in `OrderPolicy::cancel()` and having the action call
  `Gate::authorize('cancel', …)` and nothing else *looks* cleaner and passes every test whose actor is
  an ordinary administrator. *Mitigation:* the "a Super Admin is still refused against a `Shipped`
  order" test, which is the single test that distinguishes the two designs, plus the ⚠️ on the policy
  above stating the split at the site where it would be collapsed.
- **R-3 — Deleting 0049's dead-looking branch is a one-line hole.** Its own story predicted its removal
  (**D-4**), so a reader arriving at `TransitionOrderStatus` with this story in hand has written
  permission to delete it. *Mitigation:* **D-4** states the decision as a reversal of that prediction
  with the bypass spelled out, and two regression tests re-assert the branch from *this* story's test
  file, not only from 0049's.
- **R-4 — `Gate::authorize()` fails closed on a typo, silently — and since **D-6** there are now
  *three* strings to get wrong rather than one.** A misspelled ability denies everyone, and a denial
  looks exactly like a correct refusal. The ability name is **new** (`cancel`); `ORDER_EDIT_PERMISSION`
  is 0049's, already tested; and `ORDER_REFUND_PERMISSION` is **new in this story** and therefore the
  one carrying real risk — a misspelling there denies *every* actor, including one holding both
  permissions, and every other test in the file still passes. *Mitigation:* a **positive** success
  test for a both-holder beside the two 403s, the `OrderPolicyTest` coverage asserting the method by
  name, and a test asserting **both** constants literally *and* asserting each exists in
  `RolePermissionSeeder`'s catalog — the latter is what distinguishes a typo from a legitimate refusal.
- **R-6 — `hasPermissionTo()` on an unseeded name throws rather than returning `false`** (**D-6**).
  Spatie raises `PermissionDoesNotExist`, so if `orders.refund` is missing from the catalog the
  policy does not fail closed *quietly* — it raises a 500-shaped error from inside an authorization
  check, on a screen 0055 will call it from. *Mitigation:* the dependency is stated as hard and
  0051 is in the ⛔ banner; the catalog-existence assertion in R-4's mitigation is the test that
  catches it; and Phase 2 re-verifies the permission's presence against `HEAD` rather than against
  0051's task file.
- **R-5 — This document goes stale while it waits.** It is blocked behind 0045 and 0049, and 0045 is
  itself blocked behind five Epic 2 stories — the "a deferred finding is a claim about a tree, and the
  task file freezes while the tree does not" failure recorded in
  [errors-log.md](../../docs/errors-log.md#a-deferred-storys-findings-were-claims-about-a-tree-that-no-longer-existed-and-one-of-them-would-have-reopened-a-bug-in-this-log--2026-08-23).
  *Mitigation:* the Phase 2 INVEST review must be **re-run** immediately before Phase 3 and must
  re-verify against the **shipped code**, not against sibling task files: that `OrderPolicy` exists and
  what its constant is really called, **that `orders.refund` is really in the seeded catalog and
  whether it has since acquired a single-name constant this story should reuse instead of declaring
  one** (**D-6**), that `OrderStatus`/`PaymentStatus` still carry those cases with
  those backing values, that `Order::$status` / `$payment_status` are still cast to the enums and still
  omitted from `#[Fillable]`, that `TransitionOrderStatus`'s Cancelled branch still exists and in what
  form, and whether any sibling has already added an `isManuallyCancellable()`-shaped predicate.
  **Every name in this file is a reading aid, not a locator.**

### Resolved questions

| Question raised | By | Resolved as |
| --- | --- | --- |
| Does cancelling auto-refund anything? | backend-expert (raised, recommended, not resolved) | **D-1** — never; refunds stay 0051's separately-authorized operation |
| PRD's blocked list omits a fully `Refunded` payment state — a gap? | backend-expert (raised, recommended, not resolved) | **D-2** — no explicit check; the state is structurally unreachable from `{Pending, Processing}`, with a ⚠️ dependency on 0052 |
| Cancelling an already-`Cancelled` order: no-op or rejection? | backend-qa **and** backend-expert, independently | **D-3** — reject, as a `ValidationException` on `status`, per 0049's **D-4** precedent |
| Should 0049's Cancelled-refusal branch be deleted? | backend-expert (recommended keeping it) | **D-4** — keep it; 0050 adds a *second* route rather than relocating the first, so deleting it opens a bypass. Narrows 0049's D-6 prediction |
| Route cancellation through `TransitionOrderStatus`? | backend-expert | **D-5** — no; allow-list vs. ladder, and `Cancelled` has no rank |
| `orders.edit`, `orders.refund`, or a new `orders.cancel`? | backend-expert; **resolved by explicit human product decision**, overriding the facilitator's original answer | **D-6** — **BOTH `orders.edit` AND `orders.refund`**, because cancelling an order is administratively paired with refunding it. Not `orders.edit` alone (the superseded answer), not `orders.refund` alone, and **not** a new `orders.cancel` — so this is a resolution, not a deferral, and the dedicated permission is **not** a backlog item. Resolves 0049 **D-7**'s irreversible-or-financial rule by composing two existing permissions |
| Is there a confirmation path past the block? | backend-qa | **D-7** — no, and the parameter's absence is asserted by reflection |
| Does this story need a migration? | database-expert (consulted) | **No** — 0045's two columns are reused entirely; hence `includes database-expert: no` |

### Open questions

**OQ-1 — Should `CancelOrder`'s authorization refusal be recorded through
`App\Actions\Auth\LogRefusedPrivilegedAttempt`? Non-blocking; settle at Phase 2 or Phase 4.** The same
question 0049 raised as its **OQ-1** and 0051 as its **OQ-6**, arriving a third time — which is itself
the answer's shape: **this should be decided once for the whole `app/Actions/Orders/` folder, not
per-story.** Adopting it here alone would leave one of four Orders actions logging its refusals, which
is worse than none logging. *Recommended:* defer to a single "instrument the Orders area" story
covering `CreateOrder`, `TransitionOrderStatus`, `CancelOrder` and `RecordRefund` together, and log
**only** the authorization refusal — not the domain refusals (blocked state, already cancelled), which
are ordinary outcomes an authorized administrator reaches during normal work and which would make the
`'Privileged action refused'` channel unreadable
([authorization.md](../../docs/architecture/authorization.md#recording-a-refusal--what-every-gate-owes-the-audit-trail)).

**OQ-2 — Does cancelling an order restore stock? Non-blocking; recorded so it is not assumed.** PRD
§3.2 says nothing about it, and — verified against story 0045 rather than assumed — **`CreateOrder`
decrements no stock at order time**, so there is nothing for a cancellation to give back. *Recommended:
no*, and a test above asserts stock is untouched so the answer is executable rather than implicit. If
a later story makes order creation reserve or decrement stock, **that** story owns the release path and
must revisit this one; it is listed as backlog item 2.

**OQ-3 — Should cancelling capture a reason? Non-blocking; backlog.** "Why was this order cancelled"
is the single most predictable addition to a cancellation, and 0051's **D-11** shipped
`refunds.reason` early on exactly that reasoning. It is **not** copied here, and the asymmetry is
deliberate: 0051 could add its column to a table it was already creating, whereas an
`orders.cancellation_reason` is an `ALTER` on a table this story otherwise does not touch — and this
story's whole claim to `includes database-expert: no` rests on that. If the business wants it, it is a
small, clean, additive story of its own.

### Technical tasks for the backlog

Derived from this story, none of them in scope:

1. **Re-read D-2 during story 0052's Phase 2.** If 0052 ships with any state in which it declines to
   auto-cancel a 100%-refunded order, `isManuallyCancellable()` must gain an explicit
   `payment_status !== Refunded` clause and its dataset row.
2. **Revisit OQ-2** if a later story makes order creation reserve or decrement stock — the release
   path belongs to that story, and this action's "restores nothing" test becomes its business.
3. **Instrument the Orders area's privileged writes** with `LogRefusedPrivilegedAttempt`, as one story
   across all four `app/Actions/Orders/` classes (**OQ-1**; the same item 0049's backlog 3 and 0051's
   backlog 4 already name — **they are one task, not three**).
4. ~~**A dedicated `orders.cancel` permission**, if the human prefers it to **D-6**'s `orders.edit`
   reuse.~~ **Withdrawn — the human answered this question, and answered it differently.** **D-6** now
   requires **both** `orders.edit` and `orders.refund`, which satisfies 0049 **D-7**'s
   irreversible-or-financial rule by composing two permissions that already exist. A dedicated
   `orders.cancel` is therefore **not** pending anyone's preference and should not be re-raised as
   backlog; it would need a new business reason of its own. Kept struck through rather than deleted
   so a later reader sees a closed decision rather than an omission.
5. **A cancellation reason** (**OQ-3**), if the business asks.
6. **Align `RecordRefund`'s `Gate::authorize('orders.refund')` literal onto the constant** this story
   adds to `OrderPolicy` (**D-6**). 0051 shipped that call with a literal because it deliberately
   created no policy (its **DR-2**); once `OrderPolicy::ORDER_REFUND_PERMISSION` exists, the
   name-it-once rule in [naming.md](../../docs/conventions/naming.md#permission-names) wants the one
   remaining literal pointed at it. Cosmetic, one line, and explicitly **not** this story's job —
   0051's file is out of scope here.

## Provenance

- **PRD source:** [§3.2 Orders](../../docs/PRD/PRD.md#32-orders) — specifically the two manual
  cancellation scenarios (`Manually cancel an order in an early status`; the `Scenario Outline`
  `Manual cancellation is blocked in guarded states` over `Enviado` / `Entregado` /
  `Parcialmente reembolsado`) and the matching acceptance criterion. The `Fully refunding all line
  items auto-cancels the order` scenario in that same section is deliberately **excluded** — it is
  story 0052's, and its own text marks it *"distinct from the manual cancel action, which stays
  blocked in those states"*.
- **Process:** [workflow.md](../../docs/workflow.md) Phase 1 — Three Amigos debate. Contributions from
  `backend-expert` and `backend-qa`, composed by `product-owner` as facilitator. `database-expert` was
  consulted on one question — *does cancellation need a schema change?* — and the answer is **no**,
  which is why the **Type** line reads `includes database-expert: no`: the classification records the
  outcome, not an absence of consultation. **Two open items were raised without being resolved by the
  amigos who raised them** (auto-refund, and the omitted `Refunded` state) and both are recorded as
  decisions with their reasoning (**D-1**, **D-2**) rather than settled silently; a third was raised
  independently by both amigos (**D-3**), and a fourth reverses a prediction recorded in a *sibling*
  story (**D-4**).
- **Human product decision, post-composition.** **D-6** was subsequently **overridden by the human
  product owner** during Phase 1 reconciliation: cancellation requires **both** `orders.edit` **and**
  `orders.refund`, not `orders.edit` alone, *"porque en el momento que se cancele un pedido, suele ir
  acompañado de un refund"*. This document was revised around that decision — the guard, every
  authorization scenario and test, the Dependencies (0051 became a hard dependency of the shipped
  code), the ⛔ banner, **R-4**, the new **R-6**, D-1's now-retired third argument, and the withdrawal
  of the `orders.cancel` backlog item. **No other decision changed**; D-1 through D-5 and D-7 stand as
  originally composed except where they cited the permission guard directly. Recorded here because a
  decision the facilitator argued *against* and the human reversed is exactly the kind of provenance a
  later reader needs in order to tell a considered rule from an unexplained one.
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
- **Epic 3 decomposition:** the manual-cancellation story of the Orders cluster. Siblings are
  referenced by number (0045 orders foundation, 0048 line-item edit block, 0049 status transitions,
  0051 refunds, 0052 the 100%-refund auto-cancel, 0053–0054 tax resolution, 0055 UI) because several
  of their files may not exist yet; [0045](0045-orders-core-crud-backend.md),
  [0049](0049-order-status-transition-backend.md) and
  [0051](0051-order-payment-refund-state-backend.md) are the three that do.
```
