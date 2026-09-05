# [0049] Order status transition backend

## Description
Give an existing order a way to move through PRD [§3.2 Orders](../../docs/PRD/PRD.md#32-orders)'s
linear status vocabulary (`Pendiente → Procesando → Enviado → Entregado`): a self-authorizing
`TransitionOrderStatus` action that advances an order freely, and refuses a **backward** move unless
the caller explicitly confirms it. This story also creates **`OrderPolicy`** — the shared
authorization surface stories 0050, 0051, 0052 and 0055 all extend — per story
[0045](0045-orders-core-crud-backend.md)'s forward note **D-13**. No cancellation, no refunds, no tax,
no route, no Livewire component, no Blade markup, no status-history table.

> ## ⛔ BLOCKED — inherited from story 0045
>
> **This story is fully specified now, but its Phase 3 implementation cannot start until story
> [0045](0045-orders-core-crud-backend.md) is `done`** — and 0045 is itself blocked on five Epic 2
> stories (0024 Products, 0029 Product Variants, 0035 Shipping Carriers, 0036 Shipping Rates, 0038
> Payment Methods; see its [**DR-1**](0045-orders-core-crud-backend.md#dr-1--resolved-disagreement--fk-sequencing-vs-unconstrained-placeholder-columns)).
>
> There is nothing to transition until an `orders` row exists. `App\Enums\OrderStatus`,
> `App\Models\Order` and `OrderFactory` are all 0045's deliverables, and every test in this file
> creates an order through that factory.
>
> **What is *not* blocked:** this document. The blocking is transitive and adds no new dependency of
> its own — this story depends on exactly one thing, and that thing is already specified.

## Type
backend | includes database-expert: **no**

### Three Amigos participants

- `backend-expert` — the action's signature and refusal ordering, the two `OrderStatus` methods, the
  new `OrderPolicy`, the confirmation mechanism and the exception it throws.
- `backend-qa` — risk-based test design: the forward/backward adjacent-pair matrix, the
  confirmed-backward path proven to actually work, the same-status and rank-skip resolutions, and the
  explicit non-scope guard that `Cancelled` is never reasoned about here.
- `database-expert` — consulted on one question only: **does this story need an
  `order_status_history` table?** The answer is **no** (**D-1**), so this story ships **no migration,
  no column and no schema change**, and the `includes database-expert: no` classification above is
  the *outcome* of that consultation rather than a decision taken without it.

### Why this is its own story and not part of 0050/0051

The linear four-status ladder and the `Cancelado` terminal state are two different rules with two
different shapes. Advancing and regressing along `Pendiente → Procesando → Enviado → Entregado` is a
**total order** question — is the target ahead of or behind the current value — and its refusal is a
*confirmable* one. Cancellation is a **state-machine** question with a per-state allow-list, an
irreversible outcome, and a system-triggered twin (the 100%-refund auto-cancel). Folding them
together would put a status with no position in the ladder into the same comparison as four statuses
that have one, which is exactly the bug **D-3** exists to make structurally impossible.

## Gherkin

```gherkin
Feature: Order status transitions (backend)

  # --- Advancing (PRD §3.2, "Advance an order to the next status") ---

  Scenario: Advance an order to the next status
    Given an order administrator, with an order in "Procesando"
    When they change its status to "Enviado"
    Then the order reflects the "Enviado" status

  Scenario: Advance an order from its earliest status
    Given an order administrator, with an order in "Pendiente"
    When they change its status to "Procesando"
    Then the order reflects the "Procesando" status

  Scenario: Advance an order to its final status
    Given an order administrator, with an order in "Enviado"
    When they change its status to "Entregado"
    Then the order reflects the "Entregado" status

  Scenario: Advancing needs no confirmation
    Given an order administrator, with an order in "Pendiente"
    When they change its status to "Procesando" without confirming anything
    Then the order reflects the "Procesando" status

  Scenario: An order may skip forward over an intermediate status
    Given an order administrator, with an order in "Pendiente"
    When they change its status directly to "Entregado"
    Then the order reflects the "Entregado" status

  # --- Moving backward (PRD §3.2, "Moving an order's status backward requires explicit
  #     confirmation") ---

  Scenario: Moving an order's status backward is refused without explicit confirmation
    Given an order administrator, with an order in "Enviado"
    When they move its status back to "Pendiente" without confirming
    Then the change is refused as needing confirmation and the order remains "Enviado"

  Scenario: Moving an order's status backward succeeds once explicitly confirmed
    Given an order administrator, with an order in "Enviado"
    When they move its status back to "Pendiente" with an explicit confirmation
    Then the order reflects the "Pendiente" status

  Scenario: A backward move is refused rather than forbidden
    Given an order administrator, with an order in "Entregado"
    When they move its status back to "Procesando" without confirming
    Then the refusal names confirmation as the missing step rather than denying the action outright

  Scenario: A backward skip over an intermediate status also requires confirmation
    Given an order administrator, with an order in "Entregado"
    When they move its status back to "Pendiente" without confirming
    Then the change is refused as needing confirmation and the order remains "Entregado"

  # --- Transitioning to the status it already has ---

  Scenario: Transitioning an order to the status it already holds is rejected
    Given an order administrator, with an order in "Procesando"
    When they change its status to "Procesando"
    Then the change is rejected with a validation message and the order is unchanged

  Scenario: Confirming does not make a same-status transition valid
    Given an order administrator, with an order in "Procesando"
    When they change its status to "Procesando" with an explicit confirmation
    Then the change is rejected with a validation message and the order is unchanged

  # --- Cancellation is not this story's concern ---

  Scenario: Moving an order to cancelled is refused here
    Given an order administrator, with an order in "Procesando"
    When they change its status to "Cancelado"
    Then the change is refused outright and the order remains "Procesando"

  Scenario: Moving an order out of cancelled is refused here
    Given an order administrator, with an order in "Cancelado"
    When they change its status to "Procesando"
    Then the change is refused outright and the order remains "Cancelado"

  Scenario: Confirming does not open a path to cancellation here
    Given an order administrator, with an order in "Procesando"
    When they change its status to "Cancelado" with an explicit confirmation
    Then the change is refused outright and the order remains "Procesando"

  # --- Authorization ---

  Scenario: An administrator without the orders edit permission cannot transition an order
    Given a signed-in administrator whose role does not grant the orders edit permission
    When they attempt to change an order's status
    Then the attempt is refused and the order's status is unchanged

  Scenario: An administrator holding the orders edit permission can transition an order
    Given a signed-in administrator whose role grants the orders edit permission
    When they change an order's status to the next one
    Then the order reflects the new status

  Scenario: A Super Admin may transition an order without holding the permission explicitly
    Given a Super Admin holding no individual orders permission
    When they change an order's status to the next one
    Then the order reflects the new status

  Scenario: A refused transition is refused for the permission before anything else is considered
    Given a signed-in administrator whose role does not grant the orders edit permission
    When they attempt a backward transition without confirming
    Then the refusal is an authorization refusal, not a request for confirmation
```

## Files to create/modify

### Enum — `app/Enums/OrderStatus.php` (**modify**, created by 0045)

Two methods are added. **No case is added, renamed or removed**, and `label()` is untouched — 0045's
enum test asserts the case set as a set, and this story must leave it green unchanged.

```php
/**
 * The status's position on the linear order ladder.
 *
 * Deliberately covers ONLY the four linear statuses. `Cancelled` has no rank
 * because it has no position: it is a terminal state reachable from several
 * places, not a step on the ladder. The `match` therefore has no Cancelled
 * arm, so calling this on it raises \UnhandledMatchError rather than
 * inventing a number — a fail-loud guarantee PHP gives for free.
 *
 * Every caller must refuse a Cancelled status BEFORE reaching this method
 * (see TransitionOrderStatus's ordering rule and D-3).
 */
public function rank(): int
{
    return match ($this) {
        self::Pending => 0,
        self::Processing => 1,
        self::Shipped => 2,
        self::Delivered => 3,
    };
}

/**
 * Is this status behind the one given — i.e. would moving to it be a
 * regression?
 *
 * Non-throwing predicate. TransitionOrderStatus's guard is a wrapper around
 * exactly this call, so the rule has one implementation and a later UI hint
 * (story 0055's "this will move the order backward" warning) cannot drift
 * from the rule that refuses. Same shape as
 * App\Actions\Auth\EnsureRecentPasswordConfirmation's predicate/wrapper
 * split — see docs/security/step-up-authentication.md.
 */
public function isBackwardFrom(self $current): bool
{
    return $this->rank() < $current->rank();
}
```

- `rank()` returns `int`, not `?int`. A nullable return would make `isBackwardFrom()` silently
  answer `false` for `Cancelled` — the fail-**open** direction, and precisely the "a status with no
  position compared against four that have one" bug **D-3** exists to prevent.
- `isBackwardFrom()` is asked of the **target**: `$newStatus->isBackwardFrom($order->status)`. Named
  as a predicate that reads unambiguously out of its class, per
  [naming.md](../../docs/conventions/naming.md#boolean-properties)'s `isRecentlyConfirmed()` rule.
- Neither method reads the database, and neither knows what an `Order` is. The enum stays a value
  set with an ordering; every rule about *rows* lives in the action and the policy.

### Policy — `app/Policies/OrderPolicy.php` (**new**) — shared infrastructure

Auto-discovered by name for `App\Models\Order`; no registration, no `AuthServiceProvider`
([base-standards.md](../../docs/conventions/base-standards.md#directory-structure)).

```php
class OrderPolicy
{
    public const ORDER_EDIT_PERMISSION = 'orders.edit';

    public function transitionStatus(User $user, Order $order): bool
    {
        return $user->hasPermissionTo(self::ORDER_EDIT_PERMISSION);
    }
}
```

- **One ability, no speculative others.** `viewAny`, `view`, `update` and `delete` are not written
  here: a policy method with no caller is unreviewable and untestable, and the sibling that needs one
  adds it in the same change that calls it.
- **The permission name is a class constant**, per
  [naming.md](../../docs/conventions/naming.md#permission-names)'s task-0009 rule — read by the
  policy, by `TransitionOrderStatus`'s test, and by whichever sibling adds the next ability.
  `UserPolicy`'s four re-typed literals are the known ❌, not the pattern.
- **`transitionStatus()` reduces to `orders.edit` today and takes the `Order` anyway.** The parameter
  is unused by the current body and that is deliberate: every sibling ability *will* be
  row-state-dependent (0050 branches on the current status, 0051 on the payment state), and a policy
  method that has to change its signature to acquire a target is a worse starting point than one that
  ignores an argument it already receives.
- `orders.edit` is **already seeded** — `RolePermissionSeeder::MODULES` carries `orders`, so all four
  `orders.*` abilities exist. **No catalog change, no new permission, no re-seed.**
- The `Gate::before` Super Admin bypass reaches this method like any other
  ([authorization.md](../../docs/architecture/authorization.md#the-super-admin-bypass)); no special
  case is written and one is asserted by test.

> **This policy is the shared surface every remaining Orders story inherits.** 0050 (cancellation),
> 0051 (refunds), 0052 (the 100%-refund auto-cancel) and 0055 (the UI's per-row `Gate::allows()`
> hints) each add their own ability method to **this file**. See **D-5** for what that means for
> whoever schedules them.

### Exception — `app/Exceptions/OrderStatusRegressionRequiresConfirmationException.php` (**new**)

Follows [`RoleInUseException`](../../app/Exceptions/RoleInUseException.php) exactly in shape — a
`RuntimeException` with a `render()` that returns **409 Conflict** for both the JSON and the HTML
branch:

```php
public function render(Request $request): SymfonyResponse
{
    if ($request->expectsJson()) {
        return new JsonResponse(['message' => $this->getMessage()], SymfonyResponse::HTTP_CONFLICT);
    }

    return new Response($this->getMessage(), SymfonyResponse::HTTP_CONFLICT);
}
```

- **409, and deliberately not 423.** `App\Exceptions\PasswordConfirmationRequiredException` renders
  423 for a *credential* freshness problem — "prove you are still the person at the keyboard". This
  refusal is not about the person at all: the actor is authenticated, authorized and recent, and the
  request is simply in conflict with the order's current state until they say they meant it. Reusing
  423 would conflate two refusals that need two different UI responses, and story 0055 must be able to
  tell "open the password prompt" from "open the confirm dialog". See **D-2**.
- **409, and deliberately not 403.** Nothing about this is an authorization failure; the actor may
  perform the transition, and will, on the very next call. A 403 would tell story 0055 to render
  "you may not do this", which is the opposite of PRD §3.2's *"it is not flatly forbidden"*.
- The thrown message is a constant resolved from `lang/{en,es}/orders.php`, never interpolated with
  the order's number or either status — the message-is-a-constant rule from
  [authorization.md](../../docs/architecture/authorization.md#recording-a-refusal--what-every-gate-owes-the-audit-trail).

### Action — `app/Actions/Orders/TransitionOrderStatus.php` (**new**, in 0045's subfolder)

Invokable, imperative-verb-phrase class with no `Action` suffix, resolved from the container and
never `new`-ed
([code-style.md](../../docs/conventions/code-style.md#exception-an-actions-own-dependency-is-constructor-injected-when-the-method-signature-is-a-public-contract)):

```php
public function __invoke(Order $order, OrderStatus $newStatus, bool $confirmed = false): Order
```

Performing, **in exactly this order** — the ordering is part of the guard, not an implementation
detail (**D-3**):

1. **`Gate::authorize('transitionStatus', $order)` as the first statement.** The rule lives in the
   class that performs the operation, not in a caller that does not exist yet
   ([base-standards.md](../../docs/conventions/base-standards.md#an-authorization-rule-belongs-to-the-action-not-to-one-of-its-callers)).
   Story 0055's Livewire component will re-authorize on top of this, never instead of it.
2. **Refuse if `$order->status` *or* `$newStatus` is `OrderStatus::Cancelled`** — both directions,
   with **no confirmation path** and before any `rank()` call can be reached (**D-3**, **D-6**).
3. **Refuse if `$newStatus === $order->status`** with a `ValidationException` on the `status` field
   (**D-4**). `$confirmed` is not consulted.
4. **Refuse if `$newStatus->isBackwardFrom($order->status)` and `$confirmed` is `false`**, by
   throwing `OrderStatusRegressionRequiresConfirmationException` (**D-2**).
5. **Write.** `status` is omitted from `Order`'s `#[Fillable]` by 0045, so the write is an explicit
   `forceFill(['status' => $newStatus])->save()` — the omission-as-mass-assignment-guard convention
   working as designed. Return the order.

- **`$confirmed` is a parameter of this action, not a step-up check.** PRD §3.2 asks for *explicit
  confirmation*, which is a UI intent signal, not a re-proof of identity — no password is
  re-requested and `EnsureRecentPasswordConfirmation` is **not** called. See **D-2**.
- **No `DB::transaction()`.** This is a single-row, single-column write with no second statement and
  no side effect, so a transaction would wrap nothing. Deliberately recorded rather than left to
  inference, because 0045's `CreateOrder` opens one and a reader may expect symmetry — and because
  adding one later relocates every side effect the wrapped code performs, the mistake recorded in
  [errors-log.md](../../docs/errors-log.md#wrapping-existing-code-in-a-dbtransaction-moved-a-cache-flush-nobody-had-written--2026-08-21).
- **Nothing else is written.** `payment_status`, `updated_at` aside, is untouched; no
  `refunded_quantity`, no totals, no `flagged_for_review`.

### Translations — `lang/en/orders.php` + `lang/es/orders.php` (**modify**, created by 0045)

One new key group, `transitions`, key-for-key identical across both locales
([naming.md](../../docs/conventions/naming.md#translation-keys)):

```php
'transitions' => [
    'requires_confirmation' => 'Moving this order backward requires explicit confirmation.',
    'same_status'           => 'This order already has that status.',
    'cancellation_unsupported' => 'Cancelling or reopening an order is not available here.',
],
```

- Three keys, three distinct refusals, no screen copy — story 0055 extends this file with button and
  dialog copy, and does not rename these.
- `statuses` and `payment_statuses` are **not** touched.

### Explicitly **not** touched by this story

- `database/migrations/**` — **no migration**; this story ships no column and no table (**D-1**).
- `app/Models/Order.php`, `OrderItem.php`, both factories — 0045's, unchanged.
- `App\Actions\Orders\CreateOrder` — **not re-pointed** at the new policy (**D-5**).
- `database/seeders/RolePermissionSeeder.php` — `orders` is already in `MODULES`.
- `routes/*.php`, `config/modules.php`, `app/Livewire/**`, `resources/views/**` — story 0055's.
- Anything about `Cancelled` beyond refusing to touch it — story 0050's.
- Anything about `payment_status`, refunds or `refunded_quantity` — stories 0051/0052's.
- The hard block on editing a **shipped order's line items** — story 0048's. This story changes a
  status; it does not read one to decide whether an *edit* is permitted.

## Tests to perform

All Feature tests unless marked otherwise, in the existing `tests/Feature/Orders/` (0045's folder)
plus `tests/Feature/Policies/` and `tests/Unit/Enums/`. This story ships no route, so **every**
authorization test here is action-level; story 0055 owns the HTTP-level ones
([testing/README.md](../../docs/testing/README.md)).

### The enum's two new methods (Unit)

- [ ] Unit test: `rank()` returns `0/1/2/3` for `Pending`/`Processing`/`Shipped`/`Delivered`,
      asserted as an exact map so a reordering fails loudly.
- [ ] Unit test: `OrderStatus::Cancelled->rank()` throws `\UnhandledMatchError`. **This is the test
      that makes "Cancelled has no rank" a property rather than a comment** — without it, a later
      story adding a `self::Cancelled => 4` arm would pass every other test in this file while
      silently making cancellation a rankable, skippable step on the ladder.
- [ ] Unit test (dataset): `isBackwardFrom()` is `true` for every ordered pair where the target ranks
      lower, `false` for every pair where it ranks higher, and `false` for a status compared with
      itself — all twelve ordered pairs plus the four identities, as a dataset rather than four
      hand-picked cases.
- [ ] Unit test: 0045's existing case-set assertion still passes unmodified — this story adds no case.

### Advancing — happy paths

- [ ] Integration test (dataset): each **adjacent forward** pair — `Pending→Processing`,
      `Processing→Shipped`, `Shipped→Delivered` — succeeds with `confirmed: false`, and the order
      re-fetched from the database (`->fresh()`, never the in-memory instance) carries the new status
      as an `OrderStatus` **enum instance**, not a string.
- [ ] Integration test (dataset): each **forward skip** — `Pending→Shipped`, `Pending→Delivered`,
      `Processing→Delivered` — succeeds with `confirmed: false` (**D-8**). Tested explicitly rather
      than assumed: "direction, not distance" is a decision, and an implementation that quietly
      required adjacency would pass every adjacent-pair test above.
- [ ] Integration test: the action returns the `Order`, and the returned instance carries the new
      status (so a caller need not re-fetch).
- [ ] Integration test: a successful transition leaves `payment_status` untouched.

### Moving backward

- [ ] Integration test (dataset): each **adjacent backward** pair — `Processing→Pending`,
      `Shipped→Processing`, `Delivered→Shipped` — with `confirmed: false` throws
      `OrderStatusRegressionRequiresConfirmationException`, **and the order re-fetched from the
      database still carries its original status**. Asserting only the exception would pass against
      an implementation that writes first and throws afterwards.
- [ ] Integration test (dataset): each of those same pairs with `confirmed: true` **succeeds**, and
      the persisted status is the earlier one. `backend-qa` called this out specifically: a test suite
      that only proves the refusal would stay green against an implementation where the confirmation
      path is unreachable, and the feature would be discovered broken by an administrator.
- [ ] Integration test: a **backward skip** (`Delivered→Pending`) with `confirmed: false` is refused
      and with `confirmed: true` succeeds — the same rule, at distance greater than one.
- [ ] Integration test: the refusal renders **409**, asserted through the exception's own `render()`
      for both the JSON and the HTML branch — and explicitly **not 423 and not 403** (**D-2**).
- [ ] Integration test: the thrown message is the `orders.transitions.requires_confirmation` key's
      value and interpolates neither status nor the order number.

### Transitioning to the current status

- [ ] Negative test: `Processing→Processing` throws a `ValidationException` on the `status` field,
      and the order is unchanged (**D-4**).
- [ ] Negative test: the same call with `confirmed: true` is **still** a `ValidationException` —
      confirmation is not a way past it, and the two refusals are different in kind.
- [ ] Negative test (dataset): the identity transition is rejected from all four linear statuses, not
      just one.

### `Cancelled` is refused in both directions — the non-scope guard

`backend-qa` asked for this group explicitly, and its purpose is inverted from the rest of the file:
it exists so that story 0050 finds an untouched problem rather than a half-implemented one. A generic
rank comparison that happened to accept a `Cancelled` value — in either position — would be a silent
pre-emption of 0050's design.

- [ ] Negative test (dataset): transitioning **to** `Cancelled` from each of the four linear statuses
      is refused, with `confirmed: false` **and** with `confirmed: true`, and the order is unchanged.
- [ ] Negative test (dataset): transitioning **from** `Cancelled` to each of the four linear statuses
      is refused, both confirmed and unconfirmed, and the order is unchanged.
- [ ] Negative test: `Cancelled→Cancelled` is refused by the cancellation guard, **not** by the
      same-status validation — proving the ordering in **D-3**, since a same-status check running
      first would reach `rank()` for the other Cancelled cases.
- [ ] Negative test: the cancellation refusal is **not** an
      `OrderStatusRegressionRequiresConfirmationException` — a caller must not be able to retry it
      with `confirmed: true` and succeed.
- [ ] Negative test: no `\UnhandledMatchError` escapes the action for any Cancelled-involving call.
      **This is the structural proof of the ordering rule**: the guard at step 2 is what keeps
      `rank()` unreachable, and if it were ever reordered below the regression check this test is the
      one that goes red.

### Authorization

- [ ] Negative test: an administrator holding `orders.view` but **not** `orders.edit` is refused by
      `TransitionOrderStatus` with an `AuthorizationException`, and the order's status is unchanged.
- [ ] Integration test: an administrator holding `orders.edit` succeeds — the positive case beside the
      403, without which a mistyped ability passes silently
      ([authorization.md](../../docs/architecture/authorization.md#the-copyable-module-gate-pattern-and-the-three-alternatives-rejected)).
- [ ] Integration test: a Super Admin holding no individual `orders.*` grant succeeds, via
      `Gate::before`.
- [ ] Test: the ability string is asserted **literally** (`OrderPolicy::ORDER_EDIT_PERMISSION ===
      'orders.edit'`) and asserted to exist in `RolePermissionSeeder`'s catalog, so a typo cannot fail
      closed unnoticed (**R-2**).
- [ ] **Ordering test:** an actor lacking `orders.edit` attempting an *unconfirmed backward*
      transition gets the `AuthorizationException`, **never** the confirmation exception. The
      permission refusal always wins — the same ordering rule step-up authentication documents
      ([authorization.md](../../docs/architecture/authorization.md#ordering-the-permission-refusal-always-wins)),
      and an inverted order would tell an unauthorized caller that the order exists and what state it
      is in.
- [ ] `tests/Feature/Policies/OrderPolicyTest.php`: `transitionStatus()` returns `true` for a holder
      of `orders.edit`, `false` for a non-holder, and passes for a Super Admin through `Gate::before`
      — asserted with `Gate::forUser()` as well as through the action, since those are two different
      layers ([testing/README.md](../../docs/testing/README.md)).

### `CreateOrder` is unaffected by the new policy — the regression this story most plausibly causes

- [ ] **Regression test:** every one of 0045's `CreateOrder` authorization tests still passes with
      `OrderPolicy` present. Introducing a policy for a model is the kind of change that silently
      re-routes an existing `Gate` call, and 0045's action authorizes with the bare ability string
      `Gate::authorize('orders.create')` and **no model argument** — which resolves through Spatie's
      permission gate, not through a policy. **Verify that by execution rather than by reasoning**
      (the hedge rule from
      [errors-log.md](../../docs/errors-log.md#a-reviewers-correction-replaced-an-accurate-technical-explanation-with-a-wrong-one-unverified--2026-08-24)):
      if adding the policy turns out to change that resolution, **D-5** is wrong and the story stops
      to re-decide rather than patching around it.

### Deliberately not tested

- Any cancellation *behaviour* (0050), any refund (0051/0052), any auto-cancel (0052), any tax
  resolution (0053/0054), anything rendered (0055).
- Any line-item edit block (0048) — this story writes a status and reads none to permit anything else.
- Any status **history**: nothing records who transitioned an order or when, by decision (**D-1**), so
  there is nothing to assert.
- `payment_status` transitions in either direction — a separate dimension with a separate story.

## Expected outcome

Once done, an existing order can be moved along PRD §3.2's linear ladder by
`App\Actions\Orders\TransitionOrderStatus`, which authorizes itself against the already-seeded
`orders.edit` ability through the new `App\Policies\OrderPolicy`. A forward move — adjacent or
skipping ahead — applies immediately with no confirmation. A backward move is refused with a **409**
`OrderStatusRegressionRequiresConfirmationException` until the caller passes `confirmed: true`, at
which point it applies: refused, per PRD, rather than forbidden. A transition to the status the order
already holds is a `ValidationException`, not a silent success. Any transition touching `Cancelled` —
in either direction, confirmed or not — is refused outright, because cancellation is story 0050's
entire subject and this story must not pre-empt it.

`App\Enums\OrderStatus` gains `rank()` and `isBackwardFrom()`, the first covering only the four linear
statuses so that `Cancelled` raises `\UnhandledMatchError` rather than acquiring a position it does
not have, and the second a non-throwing predicate the throwing guard wraps — so story 0055's UI
warning and this story's refusal can never disagree.

**Nothing is added that this story does not own:** no migration, no column, no status-history table,
no route, no component, no notification, no second permission, and no policy ability beyond the one
with a caller.

## Acceptance criteria

- [ ] `App\Actions\Orders\TransitionOrderStatus` exists with the signature
      `__invoke(Order $order, OrderStatus $newStatus, bool $confirmed = false): Order`, is resolved
      from the container and never `new`-ed, including in tests.
- [ ] `App\Policies\OrderPolicy` exists with exactly one ability, `transitionStatus(User, Order)`,
      naming `orders.edit` through a `public const` rather than a literal, and is auto-discovered
      with no `AuthServiceProvider` added.
- [ ] `TransitionOrderStatus` calls `Gate::authorize('transitionStatus', $order)` as its **first**
      statement, is refused for an actor lacking `orders.edit`, and passes for a Super Admin via the
      existing bypass.
- [ ] The action's five steps run in the documented order, and the ordering is pinned by the
      permission-wins test and by the no-`UnhandledMatchError`-escapes test rather than by review.
- [ ] `OrderStatus::rank()` covers exactly `Pending`/`Processing`/`Shipped`/`Delivered`, returns
      non-nullable `int`, and raises `\UnhandledMatchError` for `Cancelled` — asserted by test.
- [ ] `OrderStatus::isBackwardFrom()` is a non-throwing predicate, and the action's refusal is a
      wrapper around exactly that call rather than a second comparison.
- [ ] A forward transition, adjacent **or skipping**, succeeds with `confirmed: false`.
- [ ] A backward transition, adjacent or skipping, throws
      `OrderStatusRegressionRequiresConfirmationException` (rendering **409**, not 403 and not 423)
      with `confirmed: false`, leaves the persisted status unchanged, and **succeeds** with
      `confirmed: true`.
- [ ] A transition to the order's current status raises a `ValidationException` on `status`
      regardless of `confirmed`, and the order is unchanged.
- [ ] Every transition to or from `Cancelled` is refused outright, in both directions, with and
      without confirmation, by a refusal a caller cannot retry past — and no `rank()` call is ever
      reached on a `Cancelled` value.
- [ ] **No migration, column, table or schema change of any kind**, and no `order_status_history`
      table (**D-1**) — verified by the absence of any file under `database/migrations/` in the diff.
- [ ] No permission is added to `RolePermissionSeeder`; `orders.edit` is used exactly as seeded.
- [ ] No route, Livewire component, Blade view, notification or listener is added; `CreateOrder`,
      `Order`, `OrderItem` and both factories are unchanged.
- [ ] `lang/en/orders.php` and `lang/es/orders.php` gain the same three `transitions.*` keys and
      remain key-for-key identical.
- [ ] All of story 0045's tests pass unmodified, `CreateOrder`'s authorization tests included.

## Definition of Done
- [ ] Tests written and green, plus the full existing suite (per
      [contracts.md](../../docs/contracts.md)'s Full Test Suite Gate Rule) — run **unscoped**
      (`php artisan test`, not `--filter`), per
      [base-standards.md](../../docs/conventions/base-standards.md#steps-1-and-2-are-the-iteration-forms-run-both-unscoped-before-declaring-the-work-done).
      Note this story introduces a **policy**, which binds every `Gate` call against an `Order`
      anywhere in the suite — blast radius by construction, so the unscoped run is not optional.
- [ ] `vendor/bin/pint --format agent` clean (unscoped, **not** `--dirty`) and Larastan level 7 passing.
- [ ] Code reviewed (code-reviewer).
- [ ] No security findings (appsec-auditor) — specifically: that the permission check runs before any
      state is read or disclosed; that `$confirmed` is an intent signal and is never treated as, or
      substituted for, a re-authentication (**D-2**); that a `Cancelled` value cannot reach `rank()`;
      and that the 409 refusal discloses no more about the order than the fact that the caller's own
      requested transition is backward.
- [ ] Documentation updated (docs-keeper):
  - [`architecture/authorization.md`](../../docs/architecture/authorization.md#policies) gains
    `OrderPolicy` as the **third** policy — and the "`UserPolicy` has seven abilities / `RolePolicy`
    has five" enumerations nearby are re-counted rather than assumed, the under-count failure mode
    recorded in [errors-log-archive.md](../../docs/errors-log-archive.md#a-docs-this-app-has-no-x-yet-claim-outlived-the-x-by-two-tasks--2026-08-13).
  - [`conventions/base-standards.md`](../../docs/conventions/base-standards.md#directory-structure)'s
    directory listing gains `OrderPolicy` in `app/Policies/` and
    `OrderStatusRegressionRequiresConfirmationException → 409` beside the three exceptions already
    listed there.
  - [`conventions/naming.md`](../../docs/conventions/naming.md#classes) gains the two new class rows.
  - **Record the confirmation-versus-step-up distinction** somewhere a later story will find it: this
    is the app's **second** "are you sure" mechanism and the first that is *not* about identity, and a
    reader who knows only `EnsureRecentPasswordConfirmation` will reach for 423 by reflex (**D-2**).
  - **Grep for bare negative claims this story falsifies** rather than trusting the change→doc
    mapping — "this app has two policies", "the only 409 is `RoleInUseException`".
- [ ] Acceptance criteria met.

## Documented functional decisions

Each resolves an open item raised during the debate. Every one is a **conservative, reversible
default the human may override** — the reasoning is recorded so an override is a decision rather than
a rediscovery.

- **D-1 — No `order_status_history` table. Status transitions are applied, not recorded.**
  *(Resolves `backend-expert`'s fourth open question, referred to `database-expert`, whose
  recommendation is adopted as given.)* Four reasons, in order of weight.
  - **This repository has no audit-log table anywhere, and that is a stated project position, not an
    omission.** [PRD assumption 17](../../docs/PRD/PRD.md#assumptions--confirmed-decisions) says "no
    audit / change-history log this phase", and
    [schema.md](../../docs/database/schema.md#soft-deletes) states it again in the concrete — "this
    app has no audit-log table" is the reason a deleted user's original address is gone rather than
    archived. Introducing the first one as a **side effect of a scope-narrow transition story** would
    make an architectural decision in the wrong place: an audit trail is its own named story, with its
    own retention, access-control and PII questions, none of which belong here.
  - **Enforcing does not require remembering.** The backward-confirmation rule is a pure request-time
    comparison between the row's current status and the requested one. The caller passes
    `confirmed: true`; the action refuses without it. Nothing in the rule — now or in stories
    0050–0052 as specified — reads a previous transition.
  - **It is cheap to add later, additively.** A pure append-only child table with an FK to `orders`
    touches no existing column and rewrites no existing row, so adding it is a plain `create_*`
    migration rather than an `ALTER` against live data. This is the *opposite* shape from 0045's
    **D-3** (`refunded_quantity`), which ships early precisely because it would otherwise be an
    `ALTER` on a table its sibling stories are already writing to — the two decisions apply one rule,
    not two.
  - **The tradeoff, stated rather than glossed:** support and dispute questions of the form *"when
    did this ship?"* or *"who moved this order back to Pendiente, and when?"* are answerable only
    **approximately** — from `orders.status` plus `orders.updated_at`, which gives the current state
    and the time of the most recent write to the row *by any cause*, never the full transition
    sequence and never the actor. A confirmed backward move in particular leaves **no trace that it
    was backward or that anyone confirmed it**. That is accepted, and deferred to a genuinely future
    "order timeline" story if the business asks for it.
- **D-2 — The confirmation is an action parameter, not step-up authentication, and its refusal is a
  409.** *(Resolves `backend-expert`'s confirmation-mechanism question.)* PRD §3.2 asks that the
  administrator *"must explicitly confirm the action before it is applied"* and states that it *"is
  not flatly forbidden"* — an intent signal about the operation, not a re-proof of identity. So
  `EnsureRecentPasswordConfirmation` is **not** called, no password is re-requested, and
  `config('auth.password_timeout')` is irrelevant here. The distinction is worth stating flatly
  because the app now has two "are you sure" mechanisms and they are not interchangeable:

  | | Step-up (0015a) | This story's confirmation |
  | --- | --- | --- |
  | Question asked | *Is the person at the keyboard still the account holder?* | *Did you mean to move this order backward?* |
  | Satisfied by | Re-entering a password on Fortify's screen | A `true` passed with the same call |
  | Expires | Yes — `auth.password_timeout` | No — it is per-call, and carries nothing |
  | Refusal status | **423 Locked** | **409 Conflict** |
  | Who it binds | The session | The single request |

  What **is** borrowed from step-up, deliberately, is its *shape*: the throwing guard is a wrapper
  around the non-throwing `isBackwardFrom()` predicate, so a UI hint and the rule that refuses have
  one implementation between them
  ([step-up-authentication.md](../../docs/security/step-up-authentication.md)).
- **D-3 — The action's five checks run in a fixed order, and the order is load-bearing.**
  Permission → cancellation → same-status → regression → write. Three properties depend on it, each
  pinned by its own test rather than by a comment:
  - **The permission refusal always wins.** An unauthorized caller must not learn the order's current
    status from a confirmation prompt — the identical ordering rule step-up authentication documents
    ([authorization.md](../../docs/architecture/authorization.md#ordering-the-permission-refusal-always-wins)).
  - **The cancellation guard runs above every `rank()` call**, which is what makes
    `OrderStatus::rank()`'s missing `Cancelled` arm safe rather than a latent 500. A branch with no
    preceding guard is not an exemption.
  - **Same-status runs above the regression check.** `$new === $current` implies equal ranks, so the
    regression branch would not fire — but relying on that couples a validation outcome to an
    arithmetic accident, and `Cancelled→Cancelled` would reach `rank()` on the way.
- **D-4 — Transitioning to the status an order already holds is a validation ERROR, not a no-op
  success.** *(Resolves `backend-expert`'s first open question, `backend-qa`'s recommendation
  adopted.)* Accepting it as a silent success would make three different situations indistinguishable
  at the call site: a deliberate re-apply, a double-submitted form, and a caller that computed the
  wrong target status — and the third is a bug this rejection surfaces immediately instead of
  swallowing. An explicit *"nothing to do"* is more honest than a `200` that changed nothing, and
  story 0055 needs the distinction to decide whether to show a success toast. Rejected as a
  `ValidationException` on the `status` field rather than as a domain exception, because it is exactly
  what validation is for — a well-formed request naming a value that is not acceptable for this
  target — and because it therefore renders as a field error in 0055's form with no extra handling.
  **Relaxing this later is a validation-only change**, so the strict direction is the cheap one.
- **D-5 — This story creates `OrderPolicy` with one ability, and does *not* re-point `CreateOrder` at
  it.** Story 0045's **D-13** predicted that whichever of 0048–0052 arrives first should create the
  policy; this is that story, and it does. The second half of 0045's note — *"`CreateOrder`'s
  `Gate::authorize()` changes target, not location"* — is **deliberately not acted on here**, and the
  divergence is recorded rather than left as a silent omission:
  - `CreateOrder` authorizes with the bare ability string `Gate::authorize('orders.create')` and **no
    model argument**, which resolves through Spatie's permission gate rather than through any policy.
    Introducing `OrderPolicy` therefore does not change its behaviour — a claim this story's own
    regression test **verifies by execution** rather than asserting from reasoning.
  - Re-pointing it would mean adding a `create()` ability with no independent rule (it would return
    `$user->can('orders.create')`), editing a shipped sibling's action, and putting 0045's own
    acceptance criteria at risk for no behavioural gain. It is filed as backlog item 1 instead, to be
    taken when a second ability makes the policy the obviously better home.
  - **Scheduling consequence, and the reason this is flagged rather than buried:** 0050, 0051, 0052
    and 0055 all add abilities to **this same file**. Two of them running in parallel is the
    same-file-ownership hazard recorded in
    [errors-log-archive.md](../../docs/errors-log-archive.md#two-agents-dispatched-in-parallel-both-wrote-to-the-same-blade-view--2026-08-16)
    and governed by `contracts.md`'s Parallel Agent File-Ownership Rule — sequence them, or name the
    owner explicitly in both briefs.
- **D-6 — Any transition to or from `Cancelled` is refused outright, with no confirmation path.**
  `Cancelled` is story 0050's entire subject: PRD §3.2 gives it a per-state allow-list (blocked from
  `Enviado`, `Entregado`, `Parcialmente reembolsado`), a system-triggered twin (the 100%-refund
  auto-cancel, story 0052) that is *explicitly distinct from the manual action*, and no documented
  path back out. None of that is expressible as a rank comparison, so this story refuses to answer the
  question rather than answering it cheaply and being overridden later. The refusal is **not** the
  regression exception — a caller must not be able to retry it with `confirmed: true` — and it is
  **not** a 403, since the actor's permission is not what is missing.
  > **Recommended shape, and the one thing here a reviewer may reasonably want changed:** raise it as a
  > `ValidationException` on the `status` field, resolving `orders.transitions.cancellation_unsupported`.
  > **(recommended)** because it needs no new exception class — and story 0050 will almost certainly
  > *delete* this branch when it takes ownership of cancellation, so a class created here would be
  > born with a scheduled removal. The alternative considered was a dedicated
  > `OrderCancellationUnsupportedException`, which reads more precisely at the call site but leaves
  > 0050 with an extra file to remove; if the human prefers it, only this branch changes and every
  > test above stays as written.
- **D-7 — `orders.edit` is reused; no `orders.transition-status` permission is created.** *(Resolves
  `backend-expert`'s third open question.)* Changing an order's status **is** editing it: it is a
  write to an `orders` column, performed by the same administrator working the same order book, with
  no separate delegation story behind it. A permission exists to let a role hold one capability
  without another, and there is no coherent role that may edit an order's line items but not advance
  it from `Procesando` to `Enviado`.

  **Why story 0051 (refunds) will nonetheless get its own dedicated permission, so nobody reads the
  two as inconsistent:** the distinguishing property is **reversibility**, not importance. A status
  transition is fully reversible *through this very story's own confirmed-backward mechanism* — an
  administrator who advances an order by mistake confirms their way back with no residue and no
  financial consequence. Recording a refund is not: it changes `payment_status`, it is the thing a
  finance process reconciles against, and PRD §3.2 gives it its own guarded states and its own
  server-side rejection *"independently of the UI"*. **The rule, stated so the next Orders story does
  not have to re-derive it: give an operation its own permission when it is irreversible or
  financially consequential, not when it merely feels significant** — and if this story's confirmed
  backward path is ever removed, D-7's own premise is gone and `orders.edit` stops being the right
  answer here.
- **D-8 — A forward transition may skip an intermediate status, and needs no confirmation to do so.**
  *(Resolves `backend-expert`'s second open question, `backend-qa`'s reading adopted.)* PRD §3.2's
  rule is stated about **direction** — *"moving an order's status backward requires explicit
  confirmation"* — and says nothing about distance. Inventing a "must be sequential" restriction would
  be scope creep in the opposite direction from the usual one: adding a requirement the PRD does not
  contain, and one with a real cost, since `Pendiente → Entregado` in a single move is a legitimate
  correction for an order that was already delivered before anyone touched the backoffice.
  Deliberately **tested rather than assumed** — an implementation that quietly required adjacency
  would pass every adjacent-pair test in this file. **Tightening this later is an action-only change**
  with no schema consequence, so the permissive direction is the cheap one here, exactly as the
  restrictive one is for **D-4**.

### Scope fences: what this story must NOT do

- Must **not** add a migration, a column, a table or any schema change — including an
  `order_status_history` table (**D-1**).
- Must **not** implement, permit or reason about cancellation beyond refusing to touch it (0050).
- Must **not** read or write `payment_status`, `refunded_quantity`, or any refund path (0051/0052).
- Must **not** block, permit or reason about **line-item editing** in any status (0048).
- Must **not** resolve a Sales Region, compute tax, or set `flagged_for_review` (0053/0054).
- Must **not** add a route, a Livewire component, a Blade view, a `config/modules.php` entry, or any
  screen copy to `lang/{en,es}/orders.php` beyond the three `transitions.*` keys (0055).
- Must **not** add a permission to `RolePermissionSeeder` — `orders.edit` is already seeded.
- Must **not** add a policy ability that has no caller in this story.
- Must **not** modify `App\Models\Order`, `App\Models\OrderItem`, either factory, or
  `App\Actions\Orders\CreateOrder` (**D-5**).
- Must **not** add a `Cancelled` arm to `OrderStatus::rank()` (**D-3**).

## Dependencies, risks and open questions

### Dependencies

| Depends on | State | Verified how |
| --- | --- | --- |
| `orders` table, `App\Models\Order`, `OrderFactory` | story [0045](0045-orders-core-crud-backend.md) — **hard dependency, and the only one; ⛔ inherited BLOCKED** | there is no row to transition without it; every test creates its order through `OrderFactory` |
| `App\Enums\OrderStatus` with its five cases | story [0045](0045-orders-core-crud-backend.md) | this story adds two methods to it and no case |
| `orders.*` permissions in the seeded catalog | **shipped** | `RolePermissionSeeder::MODULES` carries `orders` |
| `Gate::before` Super Admin bypass | **shipped** (Epic 1) | [authorization.md](../../docs/architecture/authorization.md#the-super-admin-bypass) |
| Policy auto-discovery by name | **shipped** (Epic 1, task 0004) | `UserPolicy` / `RolePolicy` bind with no `AuthServiceProvider` |
| The domain-exception-renders-its-own-status pattern | **shipped** | [`RoleInUseException`](../../app/Exceptions/RoleInUseException.php) → 409 is copied verbatim in shape |

**Nothing else.** In particular this story does **not** depend on 0024/0029/0035/0036/0038 directly —
it inherits their block only through 0045, and adds no sixth dependency of its own.

### Sibling relationships

- **Independent sibling of story 0048.** Both depend only on 0045 and neither depends on the other, so
  they may be implemented in either order or in parallel — with one caveat, below.
- **This story creates shared infrastructure.** `App\Policies\OrderPolicy` is consumed and extended by
  **0050** (cancellation abilities), **0051** (the refund ability, with its own permission per
  **D-7**), **0052** (the auto-cancel path's authorization, if any — a system-triggered transition may
  legitimately have no actor) and **0055** (per-row `Gate::allows()` UI hints, which must reuse the
  same ability methods rather than re-deriving the rules —
  [authorization.md](../../docs/architecture/authorization.md#gateallows-in-a-list-query-is-a-ui-hint-not-a-layer)).
  **If story 0048 also needs a policy ability** (a "may this order's line items be edited" rule is the
  obvious candidate), then the two stories are no longer file-independent: they both write
  `app/Policies/OrderPolicy.php`, and the parallel-write hazard in **D-5** applies. Sequence them, or
  name the file's owner in both briefs.
- **Also extended by 0055 at the translation layer** — `lang/{en,es}/orders.php` gains this story's
  `transitions` group and 0055's screen copy; same file, different key groups.

### Risks

- **R-1 — `Cancelled` acquiring a rank is a silent, one-line regression.** A later story adding
  `self::Cancelled => 4` to `rank()` — for a plausible-sounding reason, such as wanting to sort a list
  by progress — would immediately make cancellation a skippable forward step and un-cancelling a
  merely-confirmable backward one, with no refusal anywhere. *Mitigation:* the
  `\UnhandledMatchError` unit test, which exists for exactly this and fails the moment an arm is
  added; plus the docblock on `rank()` stating the constraint at the site where it would be violated.
- **R-2 — `Gate::authorize()` fails closed on a typo, silently.** A misspelled ability denies
  everyone, and a denial looks exactly like a correct refusal. *Mitigation:* a **positive** success
  test beside the 403, plus the literal-ability assertion against the seeded catalog, plus naming the
  permission once as a class constant so there is one string to get wrong.
- **R-3 — The confirmed-backward path is easy to ship broken and hard to notice.** A test suite that
  proves only the refusal stays green against an implementation where `confirmed: true` also refuses
  (an inverted condition, a `!` in the wrong place) — and the feature is then discovered by an
  administrator who cannot correct a mis-advanced order. *Mitigation:* the confirmed-succeeds dataset
  is specified as a first-class test group, over every adjacent backward pair plus a skip, asserting
  the **persisted** status rather than the returned instance.
- **R-4 — Introducing a policy has whole-suite blast radius.** `OrderPolicy` binds every `Gate` call
  against an `Order` anywhere in the repository, present and future — the same property that made
  story 0010's role-model event guard break an unrelated test
  ([errors-log.md](../../docs/errors-log.md#both-of-this-projects-per-change-quality-gates-are-scoped-by-default-and-both-silently-passed--2026-08-20)).
  *Mitigation:* the unscoped `php artisan test` run is called out in the Definition of Done with the
  reason attached, and the `CreateOrder` regression test is specified explicitly rather than left to
  the full-suite run to discover.
- **R-5 — This document goes stale while it waits.** It is blocked behind 0045, which is itself
  blocked behind five stories, each of which may change during its own Phase 4/5 — the "a deferred
  finding is a claim about a tree, and the task file freezes while the tree does not" failure
  ([errors-log.md](../../docs/errors-log.md#a-deferred-storys-findings-were-claims-about-a-tree-that-no-longer-existed-and-one-of-them-would-have-reopened-a-bug-in-this-log--2026-08-23)).
  *Mitigation:* the Phase 2 INVEST review must be **re-run** immediately before Phase 3, and must
  re-verify against the shipped code — not against 0045's task file — that `OrderStatus` still has
  exactly those five cases, that `Order::$status` is still cast to the enum and still omitted from
  `#[Fillable]`, that `CreateOrder` still authorizes with a bare ability string, and that no sibling
  has already created `OrderPolicy`. **If a sibling has created it, this story extends that file
  rather than creating it, and D-5 is updated rather than re-argued.**

### Resolved questions

| Question raised | By | Resolved as |
| --- | --- | --- |
| Does this story need an `order_status_history` table? | backend-expert → database-expert | **D-1** — no; enforcing does not require remembering, and the tradeoff is recorded |
| What mechanism carries "explicit confirmation"? | backend-expert | **D-2** — a `$confirmed` action parameter, **not** step-up; refusal renders 409 |
| Same-rank ("transition" to the current status): reject or no-op? | backend-expert / backend-qa | **D-4** — reject, as a `ValidationException` on `status` |
| Rank-skip forward (`Pendiente → Entregado`): allowed or must be adjacent? | backend-expert / backend-qa | **D-8** — allowed, no confirmation; the PRD rule is about direction, not distance |
| Reuse `orders.edit` or add `orders.transition-status`? | backend-expert | **D-7** — reuse; the dedicated-permission rule is irreversibility, which 0051's refund has and this does not |
| Who creates `OrderPolicy`? | 0045 **D-13** (forward note) | **D-5** — this story, with one ability; `CreateOrder` is *not* re-pointed |
| How is `Cancelled` handled here? | backend-expert / backend-qa | **D-6** — refused outright in both directions, no confirmation path; 0050 owns it |
| Does the ordering of the action's checks matter? | backend-qa | **D-3** — yes; three properties depend on it, each pinned by a test |

### Open questions

**OQ-1 — Should this action's authorization refusal be recorded through
`App\Actions\Auth\LogRefusedPrivilegedAttempt`? Non-blocking; settle at Phase 2 or Phase 4.** Story
0015b established
[recording a refusal](../../docs/architecture/authorization.md#recording-a-refusal--what-every-gate-owes-the-audit-trail)
as the copyable pattern *"a third admin screen inherits"*, and this is a privileged write on a
financial record. Neither this story's contributions nor story 0045's raised it, and 0045's
`CreateOrder` does **not** log its own `Gate` refusal — so adopting it here without also retrofitting
`CreateOrder` would leave the Orders area logging one of its two privileged writes, which is worse
than logging neither. Two options:
- **(recommended)** Adopt it in **both** places as one change — this story's `Gate` refusal *and*
  `CreateOrder`'s — and log **only** the authorization refusal, not the three domain refusals
  (same-status, cancellation-unsupported, unconfirmed regression), which are ordinary outcomes an
  authorized administrator reaches during normal work and which would make the
  `'Privileged action refused'` channel unreadable. This is consistent with 0015b's own
  [deliberate exclusions](../../docs/architecture/authorization.md#what-is-deliberately-not-logged).
- Defer both to a single "instrument the Orders area" story, keeping this story's diff to exactly
  what was debated.
It is raised rather than decided because it edits a file this story otherwise declares out of scope
(**D-5**), and a scope exclusion that a decision quietly crosses is the exact failure recorded in
[errors-log.md](../../docs/errors-log.md#a-scope-exclusion-named-screens-while-the-story-edited-a-class-those-screens-share--2026-08-24).

**OQ-2 — Should a forward transition ever be confirmable too? Non-blocking, backlog.** PRD §3.2 asks
for confirmation on backward moves only, and this story implements exactly that. Recorded because
`Entregado` is the ladder's terminal state and marking an order delivered by accident is the one
forward move with a real-world consequence — but it is fully reversible by **D-2**'s own mechanism, so
nothing here is unsafe. If the business asks, it is an action-only change with no schema consequence.

### Technical tasks for the backlog

Derived from this story, none of them in scope:

1. **Re-point `CreateOrder`'s `Gate::authorize()` at `OrderPolicy`**, adding a `create()` ability,
   once a second ability makes the policy the obviously better home (**D-5**; completes 0045's
   **D-13**).
2. **An order timeline / status-history story**, if support or dispute-resolution needs the full
   transition sequence and its actor rather than `status` + `updated_at` (**D-1**'s stated tradeoff).
   It is a purely additive `create_*` migration whenever it lands.
3. **Instrument the Orders area's privileged writes** with `LogRefusedPrivilegedAttempt`, if **OQ-1**
   is deferred rather than adopted here.
4. **Confirmation on the forward move to `Entregado`**, if the business asks (**OQ-2**).

## Provenance

- **PRD source:** [§3.2 Orders](../../docs/PRD/PRD.md#32-orders) — specifically the two
  status-transition scenarios ("Advance an order to the next status"; "Moving an order's status
  backward requires explicit confirmation", including its *"it is not flatly forbidden"* clause) and
  the status vocabulary `Pendiente → Procesando → Enviado → Entregado` plus `Cancelado`. The
  cancellation, refund and line-item-edit scenarios in that same section belong to stories 0048,
  0050, 0051 and 0052 and are deliberately **not** implemented here.
- **Process:** [workflow.md](../../docs/workflow.md) Phase 1 — Three Amigos debate. Contributions from
  `backend-expert`, `backend-qa` and `database-expert`, composed by `product-owner` as facilitator.
  `database-expert` participated on one question (**D-1**) whose answer is "no schema change", which
  is why the **Type** line reads `includes database-expert: no` — the classification records the
  outcome, not an absence of consultation.
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
- **Epic 3 decomposition:** the first of the status-and-refund stories. Siblings are referenced by
  number (0048 line-item edit block, 0050 cancellation, 0051 refunds, 0052 the 100%-refund
  auto-cancel, 0053–0054 tax resolution, 0055 UI) because their files may not exist yet; story
  [0045](0045-orders-core-crud-backend.md) is the one that does.
