# [0042] Customers — soft delete (backend)

## Description
Make deleting a customer a **soft** delete, per PRD [§3.1 Customers](../../docs/PRD/PRD.md#31-customers):
*"deletion never physically removes the record, so a customer's orders are never orphaned."* This story
adds `customers.deleted_at`, puts `SoftDeletes` on `App\Models\Customer`, and confirms the
`customers.delete` authorization gate. It ships **no** email obfuscation and **no** `Customer::delete()`
override — see [D-1](#d-1--a-soft-deleted-customers-email-stays-reserved-decided-not-deferred) and
[D-2](#d-2--no-customerdelete-override-and-no-email-obfuscation) for why the `users` precedent
deliberately does not transfer.

> **The PRD's stated *reason* for soft-deleting — "so their orders are not orphaned" — is not testable
> in this story, and that is not a gap.** The `orders` table does not exist until Epic 3's Orders
> story. What this story owes that story is narrower and is fully delivered below: **a customer row
> that survives deletion with its identity intact and a stable primary key an `orders.customer_id`
> can reference.** A reviewer must not read the absent order assertion as missing coverage; see
> [Dependencies and related work](#dependencies-and-related-work) for what the Orders story inherits.

## Type
backend | includes database-expert: **yes**

## Gherkin
```gherkin
Feature: Soft-deleting a customer

  # --- The record survives ---

  Scenario: Deleting a customer preserves the record
    Given a customer administrator, with an existing customer record
    When they delete that customer
    Then the customer record still exists, marked as deleted

  Scenario: A deleted customer leaves the active customer list
    Given a customer administrator, with an existing customer record
    When they delete that customer
    Then the customer no longer appears in the active customers list

  Scenario: A deleted customer is still retrievable when deleted records are included
    Given a customer administrator, with a customer who has been deleted
    When they look that customer up including deleted records
    Then the customer record is returned

  Scenario: Deleting a customer leaves their contact details intact
    Given a customer administrator, with an existing customer record
    When they delete that customer
    Then the customer's name, email and address are unchanged on the preserved record

  # --- The email stays reserved (decision D-1) ---

  Scenario: A deleted customer's email address stays reserved
    Given a customer administrator, with a customer who has been deleted
    When they try to create a new customer with that same email address
    Then creation is rejected with a duplicate-email validation message

  # --- Authorization ---

  Scenario: A customer administrator with the delete permission can delete a customer
    Given a signed-in administrator whose role grants the customers delete permission
    When they delete an existing customer
    Then the customer is marked as deleted

  Scenario: An administrator without the delete permission cannot delete a customer
    Given a signed-in administrator whose role does not grant the customers delete permission
    When they attempt to delete an existing customer
    Then the attempt is refused and the customer remains active

  Scenario: Any holder of the delete permission may delete any customer
    Given a signed-in administrator whose role grants the customers delete permission
    When they delete a customer they did not create
    Then the customer is marked as deleted

  # --- Repeating the action ---

  Scenario: Deleting an already-deleted customer is not found
    Given a customer administrator, with a customer who has been deleted
    When they attempt to delete that customer again
    Then the customer is reported as not found and nothing changes
```

> **No `restore` / `force delete` scenario, deliberately.** PRD §3.1 has no restore acceptance
> criterion, and this repo already carries the precedent: `SoftDeletes::restore()` exists on `User`
> for free and has **no call site anywhere in the app** (see
> [schema.md](../../docs/database/schema.md#soft-deletes)). Inventing one here would be a
> [ghost scenario](../../docs/testing/frontend/gherkin-guidelines.md#6-no-ghost-scenarios). Recorded
> in [Technical tasks for the backlog](#technical-tasks-for-the-backlog) instead.

## Files to create/modify

### Migration — `add_soft_deletes_to_customers_table`

`database/migrations/<ts>_add_soft_deletes_to_customers_table.php` — **new**. Shape confirmed by
`database-expert`; it is a byte-for-byte mirror of
`database/migrations/2026_08_14_183432_add_soft_deletes_to_users_table.php`, which is the file to
copy:

```php
public function up(): void
{
    Schema::table('customers', function (Blueprint $table): void {
        $table->softDeletes()->after('updated_at');
    });
}

public function down(): void
{
    Schema::table('customers', function (Blueprint $table): void {
        $table->dropColumn('deleted_at');
    });
}
```

- **`Schema::table(...)`, not a change to story 0041's `create_customers_table`.** Story 0041 defines
  `customers` deliberately **without** `deleted_at`; this story adds it in its own alteration
  migration, per [migrations.md](../../docs/database/migrations.md#adding-a-column-to-an-existing-table).
  Do not "tidy" the column into 0041's `create_*` file — that would make the two stories inseparable
  and break the historical-migrations-are-immutable convention this repo follows for `users`.
- **`->after('updated_at')`**, so `deleted_at` is physically the last column, matching `users`.
- **No backfill statement.** `softDeletes()` is nullable with no default, and `NULL` is exactly right
  for every pre-existing row ("not deleted"). This is the case that migrations.md's
  [backfill rule](../../docs/database/migrations.md#when-the-new-columns-default-is-wrong-for-existing-rows-backfill-in-the-same-up)
  explicitly does **not** apply to — recorded so nobody adds a defensive `UPDATE` that does nothing.
- **`down()` is the exact inverse of `up()`**, per [migrations.md](../../docs/database/migrations.md#structure).

#### Index decision — none for now, and the `users` reasoning does **not** transfer

**No standalone index on `deleted_at`.** But the justification is *not* the one
[schema.md](../../docs/database/schema.md#users) gives for `users`, and copying that sentence across
would be wrong — `database-expert` raised this explicitly and it is recorded here rather than
silently inherited.

| | `users` | `customers` |
| --- | --- | --- |
| Expected row count | 10²–10³ (backoffice staff) | plausibly 10⁴–10⁵ (a store's end-customers) |
| Nature of the argument | **structural** — the table cannot grow large, so an index can never pay for itself | **provisional** — the table *can* grow large; today it is empty |

So: **this is a YAGNI call against the current dataset size, not a structural argument, and it must be
revisited once real customer volume exists.** Two constraints for whoever revisits it:

- The right shape is **composite, leading with `deleted_at`**, never a standalone `deleted_at` — the
  `SoftDeletingScope` puts `deleted_at IS NULL` into every query built on `Customer::query()`, so the
  index has to serve that predicate plus whatever the list actually filters or sorts on. Unlike
  `users`, where `status` was the obvious second column, **there is no obvious second column yet**:
  it comes from story 0041's list query, which this story does not define.
- At that point measure rather than assume. `deleted_at IS NULL` matching the large majority of rows
  is exactly the selectivity profile the optimizer often declines to use an index for.

### Model — `App\Models\Customer` (modify)

Story 0041 creates this class; this story adds two things to it and nothing else.

```php
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @property string $id
 * // ... 0041's properties ...
 * @property Carbon|null $deleted_at
 */
class Customer extends Model
{
    /** @use HasFactory<CustomerFactory> */
    use HasFactory, HasUuids, SoftDeletes;
}
```

- **`use SoftDeletes;` and the `@property Carbon|null $deleted_at` PHPDoc line.** Keeping that block
  in sync with the migration is the drift
  [base-standards.md](../../docs/conventions/base-standards.md#model-conventions) exists to catch.
- **Do *not* restate `'deleted_at' => 'datetime'` in `casts()`.** The trait's own
  `initializeSoftDeletes()` merges the date cast in, so restating it is the same redundancy
  base-standards names for `$keyType` / `$incrementing` under
  [UUID primary keys](../../docs/conventions/base-standards.md#uuid-primary-keys) — the rule is
  "don't restate what the trait already provides". Note `User` *does* restate it; that is the older
  shape, not the one to copy.
- **No `#[Fillable]` change.** `deleted_at` is written by the framework, never by a form. It is
  omitted from `#[Fillable]` by simply not being added to it — the omission-as-mass-assignment-guard
  convention, applied by doing nothing.

#### **No `Customer::delete()` override.** This is the story's most load-bearing negative

`App\Models\User` overrides `delete()` to obfuscate the email, null `email_verified_at` /
`pending_email`, and revoke `password_reset_tokens` rows. **None of that applies here, and
`Customer` must not copy it.** Both `backend-expert` and `database-expert` reached this independently;
the reasoning is in [D-2](#d-2--no-customerdelete-override-and-no-email-obfuscation). A bare
`use SoftDeletes;` is the whole implementation.

Three corollaries, each recorded so `appsec-auditor` sees a decision rather than rediscovering an
absence:

- **The `SoftDeletingScope` on `Customer` carries no authentication weight.** For `User`, that scope
  *is* the sign-in refusal with no second check behind it
  ([soft-delete-patterns.md](../../docs/security/soft-delete-patterns.md#the-global-scope-is-the-sign-in-refusal--there-is-no-second-check)).
  A customer **cannot authenticate at all** — PRD §3.1 is explicit that customers have no dashboard
  login, no role and no permissions — so here the scope is purely a list/lookup concern. Losing it
  would be a data-visibility bug, not an authentication bypass. The two must not be reasoned about
  interchangeably.
- **The Spatie detach-on-delete trap does not apply.** [That rule](../../docs/security/soft-delete-patterns.md#adding-softdeletes-silently-stops-spatie-from-detaching-role-grants)
  binds a model using `HasRoles`. `Customer` has no roles and no permissions by product definition,
  so adding `SoftDeletes` detaches nothing and there is nothing to preserve.
- **The "delete through the model instance, never the query builder" rule is not load-bearing for
  `Customer` today** — with no override, `Customer::where(...)->delete()` and `$customer->delete()`
  produce the same soft delete. Keep every call site instance-based anyway, as a cheap forward
  guarantee: the moment any later story puts behavior on `Customer::delete()`, a builder-based call
  site becomes the silent bug that rule describes. This is a **code-review checklist item, not an
  automated test** — see [Tests to perform](#tests-to-perform).

### Policy — `App\Policies\CustomerPolicy` (**modify**) — one added ability

**This story does not create the class.** Story 0041 creates
[`app/Policies/CustomerPolicy.php`](../../app/Policies/CustomerPolicy.php) with `viewAny`, `create`
and `update` (its **D-12**), modelled on the shipped
[`SalesRegionPolicy`](../../app/Policies/SalesRegionPolicy.php). This story **adds one method and one
constant to that existing file** and changes nothing else in it. Auto-discovered by name, no
`AuthServiceProvider`
([base-standards.md](../../docs/conventions/base-standards.md#directory-structure)).

The ability is a **flat permission check** and nothing more, matching its three siblings exactly —
including the permission name as a constant on the class that owns the rule
([naming.md](../../docs/conventions/naming.md#permission-names)), never a re-typed literal:

```php
// added to the existing App\Policies\CustomerPolicy
public const DELETE_PERMISSION = 'customers.delete';

public function delete(User $actor, Customer $target): bool
{
    return $actor->hasPermissionTo(self::DELETE_PERMISSION);
}
```

Note the parameter names match 0041's (`$actor` / `$target`, the `SalesRegionPolicy` spelling), and
`$target` is ignored for the same reason `update()` ignores it — see the tier note below.

- **No privilege-tier logic, unlike `UserPolicy`.** `UserPolicy::delete()` carries an
  Administrator-tier refusal and a trashed-target branch because a `User` row *is* an actor with
  privileges. A customer is a passive record with no privileges of any kind, so **any holder of
  `customers.delete` may delete any customer**. Stated affirmatively so the absence reads as a
  decision rather than an oversight.
- **No permission catalog change.** `customers.view/create/edit/delete` already exist in
  [`RolePermissionSeeder::MODULES`](../../database/seeders/RolePermissionSeeder.php) and are already
  granted to `Administrator`. This story adds no permission and reseeds no grant.
- **The `Gate::before` Super Admin bypass reaches this ability**, exactly as it reaches every other
  policy method here — a Super Admin holds no `customers.*` row and passes anyway. That is expected,
  and it has a test below rather than being assumed.
- **The class already exists when this story starts; the `delete()` method does not.** 0041 ships
  `viewAny` / `create` / `update` and deliberately stops there, with a unit test asserting
  `delete()` is **absent**. This story adds the method and **updates that test** rather than working
  around it — the same hand-off shape as 0041's "`Customer` does not use `SoftDeletes`" structural
  assertion, which this story also inverts. Nothing about the three existing abilities changes.

### Factory — `database/factories/CustomerFactory.php` (modify)

Add a `trashed()` state so tests can arrange a deleted customer without a delete round-trip:

```php
public function trashed(): static
{
    return $this->state(fn (array $attributes): array => ['deleted_at' => now()]);
}
```

Deliberately a **state**, not a default — a factory whose default row is deleted would silently break
every 0041 test.

### Translations — `lang/en/customers.php` + `lang/es/customers.php` (modify)

Any delete-confirmation / delete-success copy this story introduces goes in both files, key-for-key
identical, per [naming.md](../../docs/conventions/naming.md#translation-keys). `APP_LOCALE=en` today,
so everything renders English until Epic 5 — accepted and documented, not a defect. 0041 ships **no**
lang file (its **D-14** defers `customers.php` to 0044), so if this story introduces delete copy it
**creates** both files and 0044 extends them; the keys are disjoint either way. See 0044's
Dependencies section, which records the same ordering detail from the other side.

### Explicitly NOT in this story

Listed so reviewers do not reopen them:

- **All Blade/Flux markup, `data-test` hooks and browser tests** — the Customers UI is a paired
  frontend story.
- **`orders`, `orders.customer_id`, any relation on `Customer`, and the read-only order-history
  view** — Epic 3's Orders story, PRD §3.2.
- **A "cannot delete a customer with active/undelivered orders" guard** — not implementable: `orders`
  does not exist. This is a **forward dependency** recorded below, not deferred work this story is
  choosing to skip.
- **A restore / undelete flow, and a force-delete path.** No PRD acceptance criterion asks for either.
- **Email reuse after deletion.** Decided against in [D-1](#d-1--a-soft-deleted-customers-email-stays-reserved-decided-not-deferred);
  reversible, with the named migration path recorded there.
- **The "new customer created" notification** and every other create/read/update behavior — story 0041.

## Tests to perform

**`tests/Feature/Customers/SoftDeleteTest.php`** (`RefreshDatabase`)

- [ ] **Deleting a customer stamps `deleted_at` and the row physically survives** — `assertSoftDeleted('customers', ['id' => $customer->id])`. Assert **both** halves: `assertDatabaseMissing` alone would pass against a hard delete only if it were wrong, and `assertSoftDeleted` is the assertion that distinguishes the two.
- [ ] A deleted customer is **absent from a default query** — `Customer::query()->find($id)` is `null` and `Customer::count()` excludes it.
- [ ] A deleted customer **is returned by `withTrashed()`**, and **is** returned by `onlyTrashed()`. Two assertions, because a scope that never applies passes the first and fails the second.
- [ ] **The customer's identifying columns are untouched by the delete** — re-read the trashed row and assert `name`, `email` and the address columns are byte-identical to what was written. This is the direct regression guard for [D-2](#d-2--no-customerdelete-override-and-no-email-obfuscation): a future contributor "helpfully" copying `User::delete()`'s obfuscation into `Customer` fails exactly here, and nothing else in the suite would catch it.
- [ ] `deleted_at` casts to a `Carbon` instance (proves the trait's cast is live without restating it in `casts()`).

**`tests/Feature/Customers/DeletedEmailReservationTest.php`** (`RefreshDatabase`) — the whole file exists to pin [D-1](#d-1--a-soft-deleted-customers-email-stays-reserved-decided-not-deferred)

- [ ] **Creating a new customer with a soft-deleted customer's email is rejected with a validation error on the `email` field** — assert the validator's own result (`assertHasErrors(['email' => 'unique'])`), **not** a database exception. `Rule::unique(Customer::class)` does **not** apply the soft-delete scope (verified for `users` and recorded in [schema.md](../../docs/database/schema.md#soft-deletes)), so the app layer refuses first and the `23000` never fires. A test that asserts on a `QueryException` would be asserting the wrong layer and would start failing the moment validation is corrected.
- [ ] **The still-deleted customer is unchanged after the rejected attempt** — no row rewritten, still exactly one customer holding that address.
- [ ] Creating a customer with an email belonging to **no** row (deleted or otherwise) succeeds — the negative control that proves the test above is measuring reservation and not a broken create path.

**`tests/Feature/Customers/DeleteAuthorizationTest.php`** (`RefreshDatabase`)

- [ ] An actor holding `customers.delete` deletes a customer successfully.
- [ ] An actor with **no role** is refused **and the customer is still active afterwards**. Both halves: asserting only that an exception was thrown passes against an implementation that deletes first and authorizes second.
- [ ] **An actor holding every *other* module's `delete` permission but not `customers.delete` is refused.** This is the case that catches the ability checking the wrong permission string — a very plausible copy-paste slip when adding a fourth method beside three near-identical siblings, where the only difference between them is the constant they read. Precedent: `IndexTest`'s "a blog editor whose role does not grant `users.view` is denied server-side".
- [ ] **`CustomerPolicy`'s three pre-existing abilities still answer as 0041 specified** — a holder of `customers.view` alone still passes `viewAny` and still fails `create` / `update` / `delete`. Cheap, and it is what catches an edit to the shared file that changes more than the one method this story owns.
- [ ] **A `Super Admin` — who holds no direct `customers.*` grant and reaches it only through the `Gate::before` bypass — can delete a customer.** Regression guard for the bypass coverage gap in [authorization.md](../../docs/architecture/authorization.md).
- [ ] **Any holder may delete any customer** — assert explicitly that a second administrator can delete a customer created by a first. This pins the "no tier system" decision so a later story cannot quietly add ownership semantics without a red test.
- [ ] **The HTTP-level refusal and the `Livewire::test()` refusal are both asserted.** They are **not** substitutes for each other — see [testing/README.md](../../docs/testing/README.md); route middleware and the in-component gate fail in different places, and Livewire's `/livewire/update` round-trip does not re-run every route middleware.

**Idempotency / repeat action**

- [ ] **Deleting an already-deleted customer is a 404, not a domain branch.** Route-model binding resolves through the default (scoped) query, so a trashed id simply does not bind — assert the 404 and assert that no second `deleted_at` write happened (the original timestamp is unchanged). Recorded explicitly because "we need an already-deleted guard" is the obvious-but-wrong conclusion; there is no branch to write.

**Deliberately not tested** (per [what-not-to-test.md](../../docs/testing/qa/what-not-to-test.md))

- Migration `up()` / `down()` mechanics — `RefreshDatabase` runs every migration each run; `down()` symmetry is a code-review item.
- The `SoftDeletes` trait itself as framework behavior. Exercise it *through* `Customer`, which is what the app actually uses.
- **Bulk delete through the query builder.** With no `Customer::delete()` override there is nothing for a builder call to bypass, so a test here would assert framework behavior and would carry no signal — the same "prove the control can refuse someone before asserting that it refuses" lesson recorded in [errors-log.md](../../docs/errors-log.md) for the dead `verified` middleware. It stays a **code-review checklist item** for as long as no override exists.
- Anything involving `orders` — the table does not exist (see the note under [Description](#description)).
- Anything in `tests/Browser/` — paired frontend story.

## Expected outcome

Deleting a customer from the backoffice stamps `customers.deleted_at` and leaves the row physically
present, with its name, email and address exactly as they were. The customer disappears from every
query built on `Customer::query()` — the active list, counts, and route-model binding — while
remaining retrievable through `withTrashed()` / `onlyTrashed()` for support and for the order history
Epic 3 will attach to it. Deleting requires `customers.delete`, checked by `CustomerPolicy::delete()`
as a flat permission with no privilege-tier logic, and reachable by a Super Admin through the standard
`Gate::before` bypass. A deleted customer's email address stays reserved: attempting to create a new
customer on that address is refused with a validation error on the `email` field.

Epic 3's Orders story inherits a customer record that survives deletion with a stable primary key it
can reference. **It does not inherit a foreign key, a relation, or an `orders` table** — those are
Epic 3's to create, along with the "cannot delete a customer with active orders" guard this story
cannot implement.

## Acceptance criteria

- [ ] `customers.deleted_at` exists (nullable timestamp, added `after('updated_at')`) via its **own** alteration migration with an exact-inverse `down()`; story 0041's `create_customers_table` is unmodified.
- [ ] `App\Models\Customer` uses `Illuminate\Database\Eloquent\SoftDeletes`, its `@property` block names `deleted_at`, and `casts()` does **not** restate the date cast the trait already provides.
- [ ] `App\Models\Customer` has **no `delete()` override**: no email obfuscation, no column nulling, no token revocation. A deleted customer's `name`, `email` and address columns are unchanged, and this is pinned by a test.
- [ ] Deleting a customer marks the row deleted and never removes it; the row is absent from default queries and present under `withTrashed()`.
- [ ] `CustomerPolicy::delete()` is **added to 0041's existing `app/Policies/CustomerPolicy.php`** (the class is not created here and its three existing abilities are unchanged), gates flatly on a `DELETE_PERMISSION` constant with **no** privilege-tier or ownership branch, and the Super Admin `Gate::before` bypass reaches it. 0041's "`CustomerPolicy` defines no `delete()`" unit test is **updated**, not deleted or worked around.
- [ ] The permission catalog and `RolePermissionSeeder` are **unchanged** — `customers.delete` already exists and is already granted to `Administrator`.
- [ ] A soft-deleted customer's email stays reserved: creating a new customer on that address is refused with a validation error on the `email` field, and the `customers.email` unique index is **untouched** by this story.
- [ ] Deleting an already-deleted customer resolves as not-found (route-model binding), with no domain-level "already deleted" branch written.
- [ ] No standalone `deleted_at` index is added, and the reason is recorded as a **provisional** size call for `customers` rather than the structural argument `users` carries.
- [ ] The order-orphaning rationale, the active-orders delete guard, and `orders.customer_id` are recorded as **Epic 3 scope**, not as gaps in this story.

## Definition of Done

- [ ] Tests written and green, plus the **full** existing suite (per the Full Test Suite Gate Rule in [contracts.md](../../docs/contracts.md)), and both quality gates run **unscoped** — `vendor/bin/pint --format agent` (not `--dirty`) and `php artisan test` (not `--filter`), per [base-standards.md](../../docs/conventions/base-standards.md#steps-1-and-2-are-the-iteration-forms-run-both-unscoped-before-declaring-the-work-done).
- [ ] Code reviewed (code-reviewer) — including the "every `Customer` delete call site is instance-based" checklist item, which no test covers.
- [ ] No security findings (appsec-auditor) — specifically: that the delete path re-authorizes rather than trusting route middleware; that the `SoftDeletingScope`'s role here is data visibility and **not** an authentication control (unlike `User`'s); and that no `Customer` query anywhere uses `withTrashed()` where the active list is meant.
- [ ] Documentation updated (docs-keeper):
  - [`database/schema.md`](../../docs/database/schema.md) — `customers` gains `deleted_at` and its own **Soft deletes** subsection, written as an explicit **contrast** with the `users` one (no obfuscation, no token revocation, no authentication weight, email stays reserved) rather than a copy of it. The ER diagram gains the column.
  - **Two existing sentences become false and must be corrected in the same pass, not appended to.** [`database/schema.md`](../../docs/database/schema.md#soft-deletes) says *"`App\Models\User` is the only model in this codebase using `Illuminate\Database\Eloquent\SoftDeletes` (task 0005)"*, and [`conventions/base-standards.md`](../../docs/conventions/base-standards.md#deleting-a-user-goes-through-the-model-not-the-query-builder) says *"`App\Models\User` is the one model using `Illuminate\Database\Eloquent\SoftDeletes` today (task 0005)"*. Both are an under-count the moment this story lands — the same [bare-negative-claim](../../docs/errors-log-archive.md#a-docs-this-app-has-no-x-yet-claim-outlived-the-x-by-two-tasks--2026-08-13) failure mode this repo has already had to fix five times in one pass. **Grep for `SoftDeletes` across `docs/` rather than relying on the change→doc mapping**, which routes to the docs describing the change and never to the ones asserting it hasn't happened.
  - [`security/soft-delete-patterns.md`](../../docs/security/soft-delete-patterns.md) — that page is written end to end about an **authenticatable**. A second soft-deleted model that is deliberately *not* one is a real addition: which of its rules bind `Customer` (none of the three above) and why, so a later story does not inherit `User`'s obfuscation reasoning by proximity.
  - [`architecture/authorization.md`](../../docs/architecture/authorization.md) — `CustomerPolicy::delete()` as the first flat, tier-free **delete** ability in this repo, and why that is correct for a passive record. **Verify the surrounding claim rather than assuming it:** 0041 will already have added `CustomerPolicy` to that page as the second flat, tier-free *policy* (after `SalesRegionPolicy`), so this pass extends an existing entry by one ability — it does not introduce the shape. Check whether any ability **count** on that page became an under-count.
  - [`database/migrations.md`](../../docs/database/migrations.md) — **verify, do not assume.** This migration establishes no new convention; it mirrors an existing file exactly. Expect no change and record that it was checked.
- [ ] Acceptance criteria met.

## Documented functional decisions

### D-1 — A soft-deleted customer's email stays reserved. Decided, not deferred

**Decision: leave `customers.email`'s plain `UNIQUE` index completely untouched.** A deleted
customer's email address remains unavailable to a new customer record, and attempting to reuse it is
refused with a duplicate-email validation error.

This was the debate's one genuinely open question, and both `backend-expert` and `database-expert`
converged on this answer as the simpler, lower-risk default. Neither raised a security concern against
it — which is the pivot, because the `users` behavior everyone reaches for first exists *entirely* for
a security reason that does not exist here.

**Why the `users` precedent does not transfer.** `User::delete()` obfuscates the email to
`deleted+{id}@deleted.invalid` and deletes the account's `password_reset_tokens` rows because
`users.email` is a **live authentication identifier**: recycling it without revoking everything keyed
by that string handed the deleted user's still-valid reset link to whoever claimed the address next —
a real, working account-takeover path found in a Phase 4 audit and recorded in
[errors-log.md](../../docs/errors-log.md). `customers.email` is a contact field. There is no customer
login, no `password_reset_tokens` row keyed by it, no session, no passkey, no notification routing.
**Freeing it safely is a problem this domain does not have, so freeing it buys nothing.**

**What reservation costs, stated plainly rather than glossed.** An administrator who deletes a
customer and then re-creates one on the same address gets a duplicate-email error *for a record they
can no longer see in the list*. That is a genuine usability wrinkle and it is the single visible
symptom of this decision. It is accepted here on the grounds that the alternative costs more (below),
and the mitigation is recorded as backlog work, not as part of this story.

**Alternatives considered and rejected:**

| Option | Verdict |
| --- | --- |
| **(a) Leave the unique index untouched** — a deleted customer's email stays reserved | ✅ **Chosen.** Zero code, zero migration, zero new failure mode. |
| **(b) Obfuscate the email on delete, mirroring `User::delete()`** | ❌ Rejected. It **destroys the identifying data soft delete exists to preserve** — the PRD's whole rationale is that a deleted customer's orders stay attributable to a named person, and an order pointing at `deleted+{uuid}@deleted.invalid` defeats that. It also adds an override, a transaction and a `23000` catch to solve a security problem this domain does not have. |
| **(c) Composite unique on `(email, deleted_at)`** | ❌ Rejected as **unsafe on MySQL**, for the reason [schema.md](../../docs/database/schema.md#soft-deletes) already records for `users`: `NULL <> NULL` for uniqueness purposes, so every **live** customer (`deleted_at IS NULL`) would stop being constrained against sharing an address. It regresses the exact invariant PRD §3.1 requires ("duplicates are rejected") in order to relax a different one. |
| **(d) `STORED` generated column (`CASE WHEN deleted_at IS NULL THEN email END`) + `UNIQUE` on it** | ❌ Not now — but this is the **correct** shape, and it is the named path if D-1 is ever revisited. Unique indexes ignore `NULL`s, so it enforces "unique among live customers" without touching live-row uniqueness. Rejected today only as complexity nothing has asked for. |

**This decision is reversible and cheap to reverse.** Reversing it means one alteration migration
(drop the plain unique, add option (d)'s generated column and index) plus a validation-rule change to
scope the uniqueness check. **No data rewrite, and no existing row becomes invalid.** A future story
should revisit it if the business reports the wrinkle above as a real operational problem — that is a
product signal, not an engineering one, and it should not be pre-empted here.

**One mechanical fact worth knowing before implementing:** `Rule::unique(Customer::class)` does **not**
apply the soft-delete scope (verified for `users`, recorded in
[schema.md](../../docs/database/schema.md#soft-deletes)). So D-1's behavior arrives with **zero code**
— validation already sees trashed rows and refuses at the app layer, before the database constraint is
reached. The reservation is not something this story builds; it is something this story decides not to
remove.

### D-2 — No `Customer::delete()` override, and no email obfuscation

**Decision: `use SoftDeletes;` and nothing else.** No override, no obfuscation, no column nulling, no
token revocation, no transaction.

This follows directly from D-1 and from the same asymmetry: every clause of `User::delete()` exists to
make an **authentication identifier** safe to recycle, and `Customer` has no authentication identifier
to recycle. Copying the override would be cargo-culting a fix for a threat model this entity does not
have, and — per D-1 option (b) — it would actively destroy the record's identifying value.

Both `backend-expert` and `database-expert` recommended this independently and firmly, and it is
recorded as a decision rather than an omission precisely because "the other soft-deleted model has an
override, this one doesn't" is exactly the shape a reviewer flags on sight. **The regression guard is
a test** (the identifying-columns-unchanged assertion above), so a later contributor adding the
override fails a red test rather than passing review on plausibility.

### D-3 — `CustomerPolicy::delete()` is a flat permission check with no tier system

**Decision: any holder of `customers.delete` may delete any customer.** No Administrator-tier branch,
no ownership check, no self-target guard.

`UserPolicy` carries all of those because a `User` row **is an actor** — deleting one can be a
privilege operation against a peer or a superior. A customer is a **passive record** with no roles, no
permissions and no ability to authenticate (PRD §3.1, stated as a hard boundary). There is no
privilege to escalate through a customer row, so there is no tier to defend. Recorded affirmatively,
with a dedicated test, so the absence reads as a decision and so a later story cannot add ownership
semantics without a failing test to justify.

**This reasoning is unchanged by the resolution of the file-ownership question**, which was settled
in 0041's favour: the ability lives in a `CustomerPolicy` that 0041 creates, and this story adds one
method to it. What the debate framed as a choice between "a policy" and "a raw ability" was only ever
about *where the check lives*, never about its semantics — and the semantics above are what both
sides agreed on. The added method is the fourth flat, tier-free ability on that class, identical in
shape to its three siblings and to both of `SalesRegionPolicy`'s.

### D-4 — No `deleted_at` index, provisionally

Covered in full under [the migration's index decision](#index-decision--none-for-now-and-the-users-reasoning-does-not-transfer).
The decision itself is "no index"; the *documented* part is that the `users` justification is
structural and this one is not, so it expires when the table grows.

## Dependencies and related work

### Depends on story 0041 — Customers CRUD backend (must ship first)

**Hard dependency.** Story 0041 creates the `customers` table and `App\Models\Customer`; this story
alters both. It cannot enter Phase 3 before 0041 is done, and its number is higher for exactly that
reason, per the [task ordering rule](../../docs/workflow.md#task-ordering-rule).

Two specifics carried over from 0041's stated shape:

- `customers` is created **without** `deleted_at`. That is deliberate and correct — this story owns
  the column, in its own alteration migration.
- `customers.email` is a plain `string(255)` `unique`. D-1 leaves it exactly as 0041 defines it.

A third specific, **settled after both files were composed** (0041 and 0042 were written in
parallel, and the delete-path boundary was briefly an open question in both):

- 0041 creates `app/Policies/CustomerPolicy.php` with `viewAny` / `create` / `update`. This story
  **adds `delete()` to that file**; it does not create the class, and it does not ship a delete
  *code path* — no component method and no `wire:click` handler, because 0041 ships no Livewire
  component either. **The UI half of delete belongs to 0044** (its **D-4**). See
  [Resolved questions](#resolved-questions).

### Forward dependency this story creates for Epic 3's Orders story

Three notes to carry forward, none actionable here:

1. **`orders.customer_id` must be `foreignUuid('customer_id')->constrained('customers')->restrictOnDelete()`** —
   `foreignUuid`, never `foreignId`, because `customers` keys on a `CHAR(36)` UUID v7; and
   `restrictOnDelete()` rather than `cascadeOnDelete()`, mirroring `sales_regions.parent_id`'s
   precedent in [migrations.md](../../docs/database/migrations.md#uuid-primary-keys) — a customer's
   order history is not worthless without the customer row, so a delete must be refused rather than
   silently propagate. **Do not add an explicit `$table->index('customer_id')`**: `constrained()`
   already leaves the column indexed, and adding one on top recreates this repo's own redundant-index
   mistake.
2. **That FK never actually fires on a soft delete**, because a soft delete is an `UPDATE`, not a
   `DELETE`. It is SQL-level insurance against a stray hard `DELETE` (a tinker session, a future
   force-delete path, a migration), so it creates **zero friction** for this story's design. Recorded
   so nobody reads the `restrictOnDelete()` recommendation as a conflict with soft deletion.
3. **The "cannot delete a customer with active/undelivered orders" guard belongs to whichever Orders
   story is best positioned to add it — explicitly not this one.** It is not implementable today:
   `orders` does not exist, there is no order-status vocabulary in the schema, and "active" is defined
   by PRD §3.2's status set (`Pendiente → Procesando → Enviado → Entregado`, plus `Cancelado`), which
   no code carries yet. This story's soft delete is not blocked by any order state, and that is the
   correct behavior **until** such a guard is specified — not a hole in it.

### Related PRD acceptance criteria owned elsewhere

- *"A customer record ... shows a read-only order-history view"* — Epic 3 Orders + the Customers UI
  story.
- *"Creating a customer generates the confirmed 'new customer' notification"* — story 0041.
- *"Customer email is validated; duplicates are rejected"* — story 0041 owns the rule; this story
  extends its **reach** to trashed rows by decision D-1 and tests that reach.

## Risks

- **R-1 — A later contributor copies `User::delete()` onto `Customer`.** The two models sit side by
  side, one has an elaborate override, and "consistency" is a plausible-sounding reason. *Mitigation:*
  D-2 is written as a decision with reasoning, and the identifying-columns-unchanged test fails
  immediately if the override lands.
- **R-2 — The email-reservation wrinkle surfaces as a support complaint rather than as a decision.**
  An administrator hitting "email already taken" for an invisible record will read it as a bug.
  *Mitigation:* D-1 records it as an accepted, named cost with a cheap reversal path; the backlog item
  below covers the message improvement.
- **R-3 — The provisional index call quietly becomes permanent.** A YAGNI decision with no trigger
  attached never gets revisited. *Mitigation:* D-4 states the trigger (real customer volume) and the
  required shape (composite, leading with `deleted_at`), and the docs pass records both.
- **R-4 — 0041 and 0042 disagreed about who owns the delete path.** Both stories were in Phase 1 at
  the same time. **Resolved** — see [Resolved questions](#resolved-questions): 0041 owns the policy
  *class*, this story owns the `delete()` *ability*, and 0044 owns the delete *code path*. The
  residual risk is only that an implementer reads a stale copy of either file, which is why the
  resolution is stated in all three rather than in one.

## Resolved questions

**RQ-1 — Where does the delete path live across 0041 / 0042 / 0044? — RESOLVED.**

This was raised as an open question in both this file and 0044 while the three stories were composed
in parallel. It is settled, and the answer is stated identically in all three:

| Artifact | Owner | Note |
| --- | --- | --- |
| `app/Policies/CustomerPolicy.php` — the **class**, with `viewAny` / `create` / `update` | **0041** | Its **D-12**. Modelled on the shipped `SalesRegionPolicy`. |
| `CustomerPolicy::delete()` — the **ability** | **this story** | Added to the existing file. 0041's "defines no `delete()`" test is updated here. |
| `customers.deleted_at`, `SoftDeletes`, the soft-delete semantics | **this story** | Unchanged from the original scope. |
| `confirmDelete()` / `deleteCustomer()` — the **code path** | **0044** | Its **D-4**. Neither 0041 nor this story ships a Livewire component, so neither can hold a `wire:click` handler. |

Two consequences worth stating, because the original framing pointed the other way:

- **No hard delete ever exists in the repo, not even transiently.** The `users` precedent the debate
  cited (0004 shipped `deleteUser()` + `UserPolicy::delete()`, 0005 added `SoftDeletes`) does **not**
  repeat here, because 0041 deliberately ships no component at all — so there is no delete path for
  0041 to have shipped as a hard delete. That is a cleaner outcome than the precedent, not a
  divergence from it that needs defending.
- **This story's unit of change is unchanged** from what `backend-expert` scoped: a migration, the
  model, the factory — plus **one method and one constant** appended to an existing policy file.

## Open questions

**OQ-1 — Should the duplicate-email message distinguish "taken by a deleted customer"? Non-blocking,
backlog.** D-1's accepted cost is an error message about an invisible record. A distinct message
(*"this email belongs to a deleted customer"*) would remove the confusion at the cost of disclosing
the existence of a deleted record to anyone who can create customers — which, given the actor already
holds `customers.create` and customers are not privileged records, is plausibly fine. **Not decided
here**: it is UI copy, it belongs with the screen that renders it, and it should not be settled in a
backend story. Recorded so it is a deliberate later choice rather than an accident.

## Technical tasks for the backlog

Derived from this story, none of them in scope:

1. **Orders story — the FK.** `orders.customer_id` as `foreignUuid(...)->constrained('customers')->restrictOnDelete()`, with no explicit `index()`.
2. **Orders story — the active-orders delete guard.** Refuse deleting a customer holding orders in an active status, once "active" is a thing the schema can express.
3. **Customers UI story — the duplicate-email message** ([OQ-1](#open-questions)).
4. **A customer restore flow**, if the business ever asks for one. Note `SoftDeletes::restore()` exists on the model for free the moment this story lands and will have **no call site** — the same state `User` has been in since story 0005. Do not treat its availability as a shipped feature.
5. **Revisit the `deleted_at` index** (D-4) once real customer volume exists — composite, leading with `deleted_at`, second column driven by what the list actually filters on, and measured rather than assumed.
6. **Revisit email reuse** (D-1) only on a product signal, via the generated-column partial unique named there.

## Provenance

Phase 1 three-way debate: `backend-expert` (the three-file unit of change, the no-override
recommendation with the authentication-identifier reasoning, the flat `CustomerPolicy::delete()`, and
the forward-dependency flag for the active-orders guard), `database-expert` (the exact migration, the
firm no-obfuscation / untouched-unique-index recommendation, the `restrictOnDelete()` guidance for
Epic 3 with the "the FK never fires on a soft delete" clarification, and the insistence that the
`users` index reasoning **not** be silently copied across), and `backend-qa` (the soft-delete
assertion set, the email-preserved and email-reservation cases, the wrong-permission-string
authorization case, the idempotency-is-a-404 observation, and the judgement that the builder-bypass
check is a review item rather than a test here).

The one open question the debate raised — email reuse after deletion — was resolved by
`product-owner` as [D-1](#d-1--a-soft-deleted-customers-email-stays-reserved-decided-not-deferred),
adopting both experts' converged recommendation and recording the rejected alternatives, the accepted
cost, and the named reversal path, so it stands as a deliberate reversible decision rather than a TBD.
