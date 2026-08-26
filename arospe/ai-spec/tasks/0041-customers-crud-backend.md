# [0041] Customers CRUD backend

## Description
Introduce the `customers` table and the write path behind PRD [§3.1 Customers](../../docs/PRD/PRD.md#31-customers):
a store end-customer is an admin-managed record (name, email, contact info, shipping/billing
address) that is **entirely separate from the Users/Roles/Permissions system** and can never
authenticate into the dashboard. This story owns the greenfield UUID migration, the `Customer`
model and factory, the validation rule set, the create/edit actions, duplicate-email rejection,
and the documented list-retrieval contract the UI story consumes. No Blade/Flux markup, no route,
no Livewire component, no browser tests.

> **This is the foundation story of Epic 3 and depends on nothing else in it.** Its three siblings
> — 0042 (soft delete), 0043 ("new customer" notification), 0044 (list + editor UI) — and, later,
> Orders' `customer_id` foreign key, all depend on this one. See
> [Dependencies](#dependencies) for the exact hand-off each of them inherits.

> **Four acceptance criteria of §3.1 are deliberately out of scope here**, because the human
> confirmed the Epic 3 decomposition before this debate: **soft-delete** behaviour belongs to
> **0042** (including its own `add_soft_deletes_to_customers_table` migration — this story's
> `create_*` file must not carry `deleted_at`), the **"new customer" notification** to **0043**,
> the **list and editor screens** to **0044**, and the **read-only order-history view** to **0047**
> (itself blocked until Orders exists). A reviewer must not treat any of the four as a gap in this
> story.

## Type
backend | includes database-expert: **yes**

### Why this is one story and not three

The table, the model/validation rules and the two write actions are one invariant: *a customer is
identified by an email address that must be unique and comparable identically on every database
engine this project runs on*. The schema cannot be specified without deciding what "unconfigured"
means for every non-identifying column (all nullable — see **D-3**), and the uniqueness rule cannot
be specified without deciding where the address is normalised (**D-5**), which is a property of the
write path rather than of the column. Splitting them would leave one half shipping a table nothing
writes and the other half validating against a constraint that does not exist yet.

## Three Amigos participants

- `backend-expert` — model, factory, validation trait, action shape, mass-assignment guard.
- `backend-qa` — risk-based test design, the "not a dashboard user" structural assertions, the
  case-collision and edit-keeps-own-email cases.
- `database-expert` — migration shape, column types and lengths, index discipline, the
  application-level email normalisation and the `deleted_at` deferral.

## Gherkin

```gherkin
Feature: Customer records (backend)

  # --- Creating a customer ---

  Scenario: Create a customer with full details
    Given a customer administrator
    When they create a customer with a name, an email, a phone number, and a shipping and billing address
    Then the customer record is stored with all of those details

  Scenario: Create a customer with only the identifying details
    Given a customer administrator, with only a name and an email available for a new customer
    When they create that customer without any contact or address details
    Then the customer record is stored with no contact or address details

  Scenario: A customer's email is stored in a canonical form
    Given a customer administrator
    When they create a customer whose email is written with capital letters
    Then the customer record is stored with that email in lowercase

  # --- Rejecting an invalid customer ---

  Scenario Outline: A customer without its identifying details is rejected
    Given a customer administrator
    When they create a customer <missing_detail>
    Then creation is rejected with a validation message and no customer record is stored

    Examples:
      | missing_detail        |
      | without a name        |
      | without an email      |
      | with a blank name     |
      | with a blank email    |

  Scenario: A malformed email is rejected
    Given a customer administrator
    When they create a customer whose email is not a well-formed address
    Then creation is rejected with a validation message and no customer record is stored

  Scenario Outline: An over-long field is rejected
    Given a customer administrator
    When they create a customer whose <field> exceeds its permitted length
    Then creation is rejected with a validation message and no customer record is stored

    Examples:
      | field                 |
      | name                  |
      | email                 |
      | phone number          |
      | shipping address line |
      | shipping city         |
      | billing postal code   |

  Scenario: A country written in a form other than a two-letter country code is rejected
    Given a customer administrator
    When they create a customer whose shipping country is written as a full country name
    Then creation is rejected with a validation message and no customer record is stored

  # --- Duplicate email rejection ---

  Scenario: A duplicate customer email is rejected
    Given a customer administrator, with an existing customer whose email is "cliente@example.com"
    When they create another customer with the email "cliente@example.com"
    Then creation is rejected with a validation message and no second customer record is stored

  Scenario: A duplicate customer email differing only in capitalisation is rejected
    Given a customer administrator, with an existing customer whose email is "cliente@example.com"
    When they create another customer with the email "CLIENTE@example.com"
    Then creation is rejected with a validation message and no second customer record is stored

  Scenario: A customer may hold the same email address as a dashboard user
    Given a customer administrator, with a dashboard user whose email is "admin@example.com"
    When they create a customer with the email "admin@example.com"
    Then the customer record is stored, because customer and dashboard-user addresses are independent

  # --- Editing a customer ---

  Scenario: Edit a customer's details
    Given a customer administrator, with an existing customer
    When they change that customer's name and phone number
    Then the customer record reflects the new name and phone number

  Scenario: Edit a customer without changing their email
    Given a customer administrator, with an existing customer
    When they save that customer keeping their existing email address unchanged
    Then the change is accepted, the address not being treated as a duplicate of the customer's own record

  Scenario: Editing a customer onto another customer's email is rejected
    Given a customer administrator, with two existing customers
    When they change the first customer's email to the second customer's email
    Then the change is rejected with a validation message and the first customer keeps their original email

  Scenario: A rejected edit leaves the stored record untouched
    Given a customer administrator, with an existing customer
    When they save that customer with a malformed email address
    Then the customer record is left exactly as it was

  Scenario: Changing a customer's email needs no mailbox confirmation
    Given a customer administrator, with an existing customer
    When they change that customer's email to a different valid address
    Then the new address is stored immediately, no confirmation link being sent to it

  # --- A customer is not a dashboard user ---

  Scenario: A customer holds no dashboard role or permission
    Given a customer administrator, with an existing customer record
    When they look for that customer among dashboard roles and permissions
    Then the customer holds no role and no permission

  Scenario: A customer cannot authenticate into the panel
    Given a customer administrator, with an existing customer record
    When that customer's credentials are offered to the dashboard sign-in
    Then no session is established, because a customer is not an authenticatable account

  # --- Authorization ---

  Scenario: An administrator without the customers create permission cannot create a customer
    Given a signed-in administrator whose role does not grant the customers create permission
    When they attempt to create a customer
    Then the attempt is refused and no customer record is stored

  Scenario: An administrator without the customers edit permission cannot edit a customer
    Given a signed-in administrator whose role does not grant the customers edit permission
    When they attempt to change an existing customer's name
    Then the attempt is refused and the customer record is left unchanged

  Scenario: A Super Admin may create a customer without holding the permission explicitly
    Given a Super Admin holding no individual customers permission
    When they create a customer
    Then the customer record is stored

  # --- List retrieval ---

  Scenario: Customers are listed in name order
    Given a customer administrator, with several existing customers
    When they retrieve the customer list
    Then every customer is returned, ordered by name

  Scenario: An empty catalog returns no customers
    Given a customer administrator, with no customers recorded
    When they retrieve the customer list
    Then no customers are returned
```

## Files to create/modify

### Migration — `customers` (new table)

`database/migrations/<ts>_create_customers_table.php` — **new**. Shape confirmed by
`database-expert` against this repo's greenfield-UUID precedent,
[`create_sales_regions_table`](../../docs/database/migrations.md#uuid-primary-keys).

```php
public function up(): void
{
    Schema::create('customers', function (Blueprint $table): void {
        $table->uuid('id')->primary();
        $table->string('name', 150);
        $table->string('email', 255)->unique();
        $table->string('phone', 30)->nullable();
        $table->string('shipping_address_line1', 255)->nullable();
        $table->string('shipping_address_line2', 255)->nullable();
        $table->string('shipping_city', 100)->nullable();
        $table->string('shipping_postal_code', 20)->nullable();
        $table->string('shipping_province', 100)->nullable();
        $table->string('shipping_country', 2)->nullable();   // ISO 3166-1 alpha-2
        $table->string('billing_address_line1', 255)->nullable();
        $table->string('billing_address_line2', 255)->nullable();
        $table->string('billing_city', 100)->nullable();
        $table->string('billing_postal_code', 20)->nullable();
        $table->string('billing_province', 100)->nullable();
        $table->string('billing_country', 2)->nullable();
        $table->timestamps();
    });
}

public function down(): void
{
    Schema::dropIfExists('customers');
}
```

Non-negotiable properties of this file, each with its reasoning in
[Documented functional decisions](#documented-functional-decisions):

- **No `deleted_at`** (**D-2**) — 0042 adds it in its own migration, mirroring
  `add_soft_deletes_to_users_table.php`.
- **No `sales_region_id`, no FK of any kind** (**D-8**).
- **Exactly one index beyond the primary key**: `email` UNIQUE. No index on `name`, on either
  country column, or on anything else (**D-10**).
- Every string column is **length-capped**; a bare `string()` is `VARCHAR(255)` and this project
  treats that as a defect on short tokens — see
  [migrations.md](../../docs/database/migrations.md#adding-a-column-to-an-existing-table).

### Model — `app/Models/Customer.php` (new)

Scaffolded with `php artisan make:model Customer -m -f --no-interaction`. Follows the repo's
attribute-based conventions ([base-standards.md](../../docs/conventions/base-standards.md#model-conventions)):

- `use HasFactory, HasUuids;` — UUID v7 per this project's Epic 2+ policy, `@property string $id`,
  and **no** `$keyType` / `$incrementing` properties (the trait already overrides both as methods).
- `#[Fillable([...])]` listing **all sixteen** writable columns (name, email, phone, and the twelve
  address columns). Unlike `SalesRegion` there are no seeder-owned columns here, so nothing is
  withheld — **D-7** records why that is a decision rather than an omission.
- **No `#[Hidden]`** — the model carries no secret.
- **No `SoftDeletes`** (0042), **no `HasRoles`**, **no `Authenticatable`**, **no `PasskeyUser`**
  (**D-11**, and the structural tests that pin it).
- A `@property` docblock listing every real column, kept in lockstep with the migration.

### Factory — `database/factories/CustomerFactory.php` (new)

Default state produces a fully-populated, valid customer (name, unique email, phone, both
addresses). Two named states for the cases the tests need repeatedly:

- `minimal()` — name and email only, every optional column `null`.
- `withEmail(string $email)` — for the collision cases, so a duplicate test never depends on
  Faker's uniqueness.

### Validation trait — `app/Concerns/CustomerValidationRules.php` (new)

Mirrors [`UserValidationRules`](../../app/Concerns/UserValidationRules.php) /
[`ProfileValidationRules`](../../app/Concerns/ProfileValidationRules.php) exactly — `<Noun>ValidationRules`
trait, `<noun>Rules()` methods returning rule arrays, flat and single-concern
([naming.md](../../docs/conventions/naming.md#traits-and-their-methods)):

```php
protected function customerRules(?string $customerId = null): array;   // the whole payload
protected function customerNameRules(): array;                         // ['required','string','max:150']
protected function customerEmailRules(?string $customerId = null): array;
protected function customerPhoneRules(): array;                        // ['nullable','string','max:30']
protected function customerAddressRules(string $prefix): array;        // shipping_* or billing_*
```

`customerEmailRules()` is the one with real content, and it deliberately differs from
`ProfileValidationRules::emailRules()` in **one** respect (**D-6**): it spans only the `customers`
table, never `users`, and there is no `pending_email` column to check.

```php
return [
    'required', 'string', 'email', 'max:255',
    $customerId === null
        ? Rule::unique(Customer::class)
        : Rule::unique(Customer::class)->ignore($customerId),
];
```

`customerAddressRules()` returns, per prefix, `nullable|string|max:<column length>` for the five
free-text columns and `['nullable','string','size:2','regex:/^[A-Za-z]{2}$/']` for `*_country`
(**D-9** — shape only, deliberately **not** membership in the seeded region catalog).

### Actions — new subfolder `app/Actions/Customers/`

- `CreateCustomer.php` — `__invoke(array $attributes): Customer`
- `UpdateCustomer.php` — `__invoke(Customer $customer, array $attributes): Customer`

Both are invokable, imperative-verb-phrase classes with no `Action` suffix, resolved from the
container and never `new`-ed ([code-style.md](../../docs/conventions/code-style.md#exception-an-actions-own-dependency-is-constructor-injected-when-the-method-signature-is-a-public-contract)).
Each performs, in this order:

1. `Gate::authorize('create', Customer::class)` / `Gate::authorize('update', $customer)` as its
   **first** statement — routed through `App\Policies\CustomerPolicy` (**D-12**), and living in the
   class that performs the operation rather than in a caller that does not exist yet
   ([base-standards.md](../../docs/conventions/base-standards.md#an-authorization-rule-belongs-to-the-action-not-to-one-of-its-callers)).
   Note `create` is asked **class-level** (no instance exists yet) while `update` takes the resolved
   `Customer`, exactly as `SalesRegionPolicy`'s own two abilities are asked.
2. Normalise the email with `Str::lower()` **before** validating, so the rule and the write see the
   same bytes — the shape [`CreateUser`](../../app/Actions/Users/CreateUser.php) and
   [`UpdateUser`](../../app/Actions/Users/UpdateUser.php) already use (**D-5**).
3. Validate the whole payload through the trait, passing `$customer->id` to
   `customerEmailRules()` on the update path so `->ignore()` cannot false-positive on the record's
   own address.
4. Write, catching a `23000` `QueryException` from the UNIQUE index and converting it to a
   `ValidationException` on `email` — the race guard, identical to `CreateUser`'s (**D-5**).

**No `RequestEmailChange`-style pending-email flow** (**D-13**): a customer's email is contact
data, not an authentication identifier.

### Policy — `app/Policies/CustomerPolicy.php` (new) — **this story creates the file**

Scaffolded with `php artisan make:policy CustomerPolicy --model=Customer --no-interaction`.
Auto-discovered by name, with no `AuthServiceProvider`
([base-standards.md](../../docs/conventions/base-standards.md#directory-structure)). Modelled
directly on the shipped [`SalesRegionPolicy`](../../app/Policies/SalesRegionPolicy.php) (story 0017)
— flat, tier-free abilities delegating straight to `hasPermissionTo()`, with the permission names
declared as constants on the class that owns the rule
([naming.md](../../docs/conventions/naming.md#permission-names)):

```php
class CustomerPolicy
{
    public const VIEW_PERMISSION = 'customers.view';

    public const CREATE_PERMISSION = 'customers.create';

    public const EDIT_PERMISSION = 'customers.edit';

    public function viewAny(User $actor): bool
    {
        return $actor->hasPermissionTo(self::VIEW_PERMISSION);
    }

    public function create(User $actor): bool
    {
        return $actor->hasPermissionTo(self::CREATE_PERMISSION);
    }

    public function update(User $actor, Customer $target): bool
    {
        return $actor->hasPermissionTo(self::EDIT_PERMISSION);
    }
}
```

Four properties, each copied from the precedent rather than re-derived (**D-12**):

- **No target-dependent branch on `update()`, and `$target` is deliberately ignored.** `UserPolicy`
  branches on the target's privilege tier because a `User` row *is* an actor; a customer is a passive
  record with none (**D-11**). The parameter is kept anyway so the per-row `Gate::allows()` UI hint
  0044 renders asks the **identical** method a future target-dependent rule would need — the reason
  `SalesRegionPolicy::update()` records for the same choice. **If such a branch is ever added, it must
  be evaluated against a freshly re-fetched row rather than the caller's instance**, per that file's
  own Phase 4 note.
- **Only the abilities a caller actually needs are defined.** `SalesRegionPolicy`'s docblock states
  the rule outright — *"Defining abilities nothing calls would add untested surface"* — and it ships
  two methods for that reason. Here `create` and `update` are called by this story's own two actions;
  `viewAny` is called by 0044's `mount()` and ships here because the file is created here and
  splitting one small class across two stories to add one method is worse than one forward-declared
  ability. **`delete()` is deliberately absent** — 0042 adds it to this same file (see
  [Dependencies](#dependencies)), so this story must not pre-declare it.
- **`hasPermissionTo()` inside a policy body is correct**, even though it does not itself consult
  `Gate::before`: a policy method is only ever reached *through* the Gate, and a Super Admin is
  granted before the policy is consulted at all. Pinned by the Super Admin test below rather than
  assumed.
- **No permission catalog change.** `customers.view/create/edit/delete` are already seeded; the
  constants name existing strings and add none.

### Explicitly **not** touched by this story

- `database/seeders/RolePermissionSeeder.php` — `customers` is **already** in `MODULES`
  (verified: line 25), so `customers.view` / `.create` / `.edit` / `.delete` already exist in the
  38-permission catalog. **No catalog change, no new permission, no re-seed.**
- `routes/*.php`, `config/modules.php`, `app/Livewire/**`, `resources/views/**` — 0044's.
- `lang/en/*`, `lang/es/*` — no user-facing copy ships here; 0044 adds `customers.php` (**D-14**).
- `app/Notifications/**`, `app/Listeners/**` — 0043's.
- `app/Policies/**` — this story creates `CustomerPolicy` with **three** abilities and nothing else
  (**D-12**). `delete()` is 0042's addition to the same file; no other policy is touched.

## Tests to perform

All Feature tests unless marked otherwise; new folders `tests/Feature/Customers/` and
`tests/Unit/Models/` (the latter already exists). Per
[testing/README.md](../../docs/testing/README.md), an authorization test at the action layer and an
HTTP one are not substitutes — this story ships no route, so **every** authorization test here is
action-level, and 0044 owns the HTTP-level ones.

### Model & schema

- [ ] Unit test: `Customer` uses `HasUuids` and a created customer's `id` is a 36-character UUID
      string, not an integer.
- [ ] Integration test: factory round-trip — a factory-made customer persists and reloads with
      every column byte-identical.
- [ ] Integration test: `minimal()` state persists with every optional column `null`.
- [ ] Integration test: a name containing non-ASCII characters ("Núñez", "Øyvind") round-trips
      byte-exactly.

### Creation — happy paths

- [ ] Integration test: creating with a full payload stores all sixteen columns.
- [ ] Integration test: creating with name + email only stores `null` in every optional column.
- [ ] Integration test: an email supplied in mixed case is stored lowercase.

### Creation — validation failures

- [ ] Negative test: missing `name` → `ValidationException` on `name`, zero rows written.
- [ ] Negative test: missing `email` → `ValidationException` on `email`, zero rows written.
- [ ] Negative test: blank (`''`) `name` and blank `email`, as separate cases.
- [ ] Negative test (dataset): malformed emails — `not-an-email`, `a@`, `@example.com`,
      `a b@example.com`, a 300-character local part.
- [ ] Negative test (dataset): boundary lengths — `name` at 150 accepted / 151 rejected; `email`
      at 255 accepted / 256 rejected; `phone` at 30/31; an address line at 255/256; a city at
      100/101; a postal code at 20/21. **Each boundary asserted from both sides**, so the test can
      tell `max:150` from `max:151`.
- [ ] Negative test (dataset): `shipping_country` / `billing_country` rejected for `España`,
      `ESP`, `E`, `E1`, `""`; accepted for `ES` and `es`.

### Duplicate email

- [ ] Negative test: a second customer with the identical email is rejected with a
      `ValidationException` on `email`, and exactly one row exists afterwards.
- [ ] Negative test: a second customer whose email differs **only in capitalisation** is rejected.
      This is the case that proves the normalisation rather than the collation is doing the work
      (**D-5**, **R-2**) — it must pass on SQLite *and* MySQL.
- [ ] Integration test: a customer may hold the same address as an existing `users` row (**D-6**).
- [ ] Negative test: the DB unique index has the last word — insert a colliding row directly
      through the query builder, bypassing the action, and assert a `23000` `QueryException`.
      Proves the constraint exists rather than only the rule.

### Editing

- [ ] Integration test: changing name and phone persists both, leaving every other column intact.
- [ ] Integration test: saving a customer with its **own** unchanged email succeeds — the
      `->ignore()` regression test.
- [ ] Negative test: changing customer A's email to customer B's is rejected, and A's stored email
      is re-read from the database and asserted unchanged.
- [ ] Negative test: a rejected edit leaves **every** column of the stored row unchanged (assert on
      a fresh `->refresh()`, not on the in-memory instance).
- [ ] Integration test: changing the email dispatches no notification and no mail —
      `Notification::fake()` + `Mail::fake()` asserting nothing was sent (**D-13**; also the
      regression guard that 0043's notification does not leak onto the update path).

### "A customer is not a dashboard user"

- [ ] Unit test (structural): `Customer` does **not** use `Spatie\Permission\Traits\HasRoles`.
- [ ] Unit test (structural): `Customer` does **not** implement
      `Illuminate\Contracts\Auth\Authenticatable`, and does not extend `Authenticatable`.
- [ ] Unit test (structural): `Customer` does **not** implement the passkeys `PasskeyUser` contract
      and does not use `SoftDeletes` (the latter is 0042's, and the assertion is deleted there —
      note it in the test's own comment so 0042 knows to remove it rather than work around it).
- [ ] Integration test: after creating a customer, `model_has_roles` and `model_has_permissions`
      hold **zero** rows referencing it.

### Authorization

- [ ] Negative test: an administrator holding `customers.view` but not `customers.create` is
      refused by `CreateCustomer` with an `AuthorizationException`, and zero rows are written.
- [ ] Negative test: an administrator holding `customers.view` but not `customers.edit` is refused
      by `UpdateCustomer`, and the row is unchanged.
- [ ] Integration test: an administrator holding the relevant permission succeeds — the positive
      200-beside-the-403 case a mistyped ability would otherwise pass silently
      ([authorization.md](../../docs/architecture/authorization.md)).
- [ ] Integration test: a Super Admin holding no individual customers permission succeeds on both
      actions, via the `Gate::before` bypass.
- [ ] Negative test: the permission strings `CustomerPolicy::VIEW_PERMISSION` /
      `CREATE_PERMISSION` / `EDIT_PERMISSION` are asserted **literally** (`customers.view`,
      `customers.create`, `customers.edit`) and asserted to exist in `RolePermissionSeeder`'s
      catalog, so a typo in a constant cannot fail closed unnoticed. Assert the constants, not
      re-typed literals — that is the point of naming them once.
- [ ] Unit test: `CustomerPolicy` defines `viewAny`, `create` and `update` and **not** `delete`
      (`method_exists()` in both directions). The negative half is what keeps 0042's addition a
      deliberate hand-off rather than a silent duplicate.
- [ ] Negative test: `CustomerPolicy::update()` returns the same answer for **any** target — an actor
      holding `customers.edit` is allowed against two different customers created by two different
      administrators. Pins the tier-free/ownership-free semantics so a later story cannot add
      ownership rules without a red test.

### List retrieval

- [ ] Integration test: several customers are returned ordered by `name` ascending (**D-15**).
- [ ] Integration test: with no rows, retrieval returns an empty collection rather than throwing.

## Expected outcome

Once done, the application has a persisted, admin-managed `Customer` entity with a UUID primary
key, a unique and canonically-lowercased email address, an optional phone number and optional
shipping and billing addresses stored as queryable columns. `CreateCustomer` and `UpdateCustomer`
authorize themselves against the already-seeded `customers.create` / `customers.edit` permissions,
validate their whole payload through a shared trait, reject a duplicate email in two layers
(normalised comparison in PHP, UNIQUE index as the last word), and are callable from anywhere —
a Livewire component, a console command, a future import — without inheriting a rule from their
caller. Nothing renders: there is no route, no screen and no notification, and a customer still
cannot authenticate, hold a role, or hold a permission.

## Acceptance criteria

- [ ] A `customers` table exists with a UUID v7 primary key and exactly the columns listed above.
- [ ] `customers.email` carries a UNIQUE index; no other index beyond the primary key exists,
      verified with `php artisan db:table customers` rather than by reading the migration.
- [ ] The `create_customers_table` migration contains **no** `deleted_at` column and **no** foreign
      key.
- [ ] `App\Models\Customer` uses `HasUuids` and `HasFactory`, declares `#[Fillable]` over all
      sixteen writable columns, and uses neither `SoftDeletes` nor `HasRoles`.
- [ ] `Customer` is not authenticatable: it implements no auth contract, holds no role, holds no
      permission, and produces no `model_has_roles` / `model_has_permissions` rows.
- [ ] `name` and `email` are required; `phone` and all twelve address columns are optional and
      persist as `null` when omitted.
- [ ] An email is stored lowercased, and a duplicate is rejected as a `ValidationException` on
      `email` whether it differs in capitalisation or not.
- [ ] Editing a customer while keeping its own email address succeeds; editing it onto another
      customer's address is rejected and the stored row is unchanged.
- [ ] A customer email may coincide with a `users` email — the uniqueness scope is the `customers`
      table alone.
- [ ] Both actions call `Gate::authorize()` as their first statement — `create` class-level, `update`
      against the resolved `Customer` — and are refused for an actor lacking the ability, while a
      Super Admin passes via the existing bypass.
- [ ] `App\Policies\CustomerPolicy` exists and defines exactly `viewAny`, `create` and `update`, each
      a flat `hasPermissionTo()` check against a permission-name constant on the class, with no
      privilege-tier, ownership or target-dependent branch. It defines **no `delete()`** — that is
      0042's addition to the same file.
- [ ] No permission is added to `RolePermissionSeeder`; the four `customers.*` abilities are used
      exactly as already seeded.
- [ ] No route, Livewire component, Blade view, translation file or notification is added. (A policy
      **is** added — see the criterion above; it is the one `app/` artifact beyond the model, factory,
      trait and two actions.)
- [ ] The documented list-retrieval contract (**D-15**) is stated in this file and pinned by a test.

## Definition of Done
- [ ] Tests written and green, plus the full existing suite (per
      [contracts.md](../../docs/contracts.md)'s Full Test Suite Gate Rule) — run **unscoped**
      (`php artisan test`, not `--filter`), per
      [base-standards.md](../../docs/conventions/base-standards.md#steps-1-and-2-are-the-iteration-forms-run-both-unscoped-before-declaring-the-work-done).
- [ ] `vendor/bin/pint --format agent` clean (unscoped, **not** `--dirty`) and Larastan level 7
      passing.
- [ ] Code reviewed (code-reviewer).
- [ ] No security findings (appsec-auditor).
- [ ] Documentation updated (docs-keeper): `docs/database/schema.md` gains a `customers` section
      and an ER-diagram node; `docs/conventions/base-standards.md`'s directory listing gains
      `app/Actions/Customers/`, `Customer` in `app/Models/`, and `CustomerPolicy` in the
      `app/Policies/` line — **that last one is an enumeration, so check it for an under-count rather
      than only appending**; `docs/architecture/authorization.md`'s Policies section gains
      `CustomerPolicy` as the second flat, tier-free policy in the repo (the first being
      `SalesRegionPolicy`), stated as the shape a domain entity with no privilege tier takes;
      `docs/decisions/0001-uuid-primary-keys.md`'s "still future" entity list is reconciled with a
      second non-ADR UUID table (the same deferred amendment `sales_regions` already flagged).
- [ ] **Hand-off notes recorded for 0042, 0043 and 0044** (real gaps, not formalities) — see
      [Dependencies](#dependencies). In particular 0042 must decide what a trashed customer's email
      does to `Rule::unique()`, which does **not** apply the soft-delete scope
      ([schema.md](../../docs/database/schema.md#soft-deletes)).
- [ ] Acceptance criteria met.

## Documented functional decisions

Each of these resolves an open question raised during the debate. Every one is a **conservative,
reversible default the human may override** — the reasoning is recorded so an override is a
decision rather than a rediscovery.

- **D-1 — Domain artifacts only; no route, component or view.** The UI is explicitly story 0044, so
  building a screen here would either sit unrouted and untested end to end, or invent a route the
  product owner has not asked for. Precedent: story 0023 (`ProductCategory`) shipped the same shape,
  and `App\Actions\Users\RequestEmailChange` / `ConfirmEmailChange` establish that this repo ships
  domain actions whose HTTP/Livewire boundary arrives in a different unit of work. **Consequence
  QA must plan around:** every authorization test in this story is action-level, not HTTP-level.
- **D-2 — `deleted_at` is deferred to 0042, in its own migration.** `users` established the
  precedent with a dedicated `add_soft_deletes_to_users_table.php` rather than a bundled column, and
  bundling here would make this story's rollback entangle a behaviour it does not implement. It also
  keeps the two stories' `down()` methods honest.
- **D-3 — `name` and `email` are required; everything else is optional.** *(Documented functional
  decision.)* PRD §3.1 says a customer record "holds name, email, contact info, and
  shipping/billing address" but never says an address must be present at creation, and the epic's
  own boundary restatement says records may originate from an external channel or partial manual
  entry. Requiring an address would block an administrator from recording a customer they only have
  a name and an email for — a real workflow, and the failure mode is worse than the alternative
  (a record with blank address fields is visibly incomplete; a record that cannot be created is
  invisible). Tightening later is a validation-only change; the columns are already nullable.
- **D-4 — Contact info is a single nullable `phone` column.** PRD says "contact info" without
  enumerating it. One phone number is the smallest thing that satisfies it. A second column
  (mobile/landline), a repeatable child table, or a JSON bag are all additive later and none is
  implied by any scenario. **No format validation** beyond `max:30`: international numbering plans
  vary, the PRD gives no rule, and a regex here would reject legitimate input for no stated benefit.
- **D-5 — Email uniqueness is enforced in two layers: normalisation + comparison in PHP as the
  primary guard, and the MySQL UNIQUE index as the backstop.** This is the decisive engineering
  decision in the story. The suite runs on **SQLite** (`BINARY`, case-sensitive) while production
  runs **MySQL** (`utf8mb4_unicode_ci`, case-insensitive), so a collation-backed rule is literally a
  different rule in the two places and CI cannot reproduce production's folding. Lowercasing at
  every write site — exactly what `App\Actions\Users\CreateUser` / `UpdateUser` /
  `RequestEmailChange` already do for `users.email` — gives identical behaviour on both engines,
  and the UNIQUE index sits behind it as the last-word race guard, the same relationship
  [schema.md](../../docs/database/schema.md#users) documents for `pending_email`. A `23000`
  `QueryException` is converted to a `ValidationException` on `email`. **Not a model accessor/mutator**:
  the normalisation must happen before validation runs, and a mutator fires after it — which would
  let a rule and a write see different bytes.
- **D-6 — Uniqueness is scoped to the `customers` table alone; a customer and a dashboard user may
  share an address.** *(Documented functional decision.)* They are different domains: a customer is
  contact data with no authentication meaning, a `users` row is a credential. The store owner is a
  plausible test customer of their own shop, and a cross-table check would refuse that for no
  security benefit — there is no privilege to confuse, because a customer holds none (**D-11**).
  Note this deliberately differs from `ProfileValidationRules::emailRules()`, which spans
  `users.email` **and** `users.pending_email`; that breadth exists because both columns can become
  a login identifier, and neither exists here.
- **D-7 — Every writable column is in `#[Fillable]`; nothing is withheld.** `SalesRegion` omits
  eight columns because a seeder owns them, and `User` omits `status` / `pending_email` because they
  are access-control state written from one named place. `customers` has neither category: every
  column is admin-form data with exactly one writer. Stating this explicitly matters because the
  repo's convention is that *omission is the mass-assignment guard* — a reviewer must be able to see
  that nothing was accidentally left fillable, rather than that nothing was considered.
- **D-8 — No `sales_region_id` on `customers`, and no FK of any kind.** *(Documented functional
  decision; the sharpest of the open questions.)* PRD §3.2 resolves an order's Sales Region from the
  **order's** shipping address (physical products) or billing address (virtual products) — a
  per-order resolution, not a per-customer attribute. A customer-level region column would be a
  second source of truth that silently disagrees with the order-level rule the moment a customer
  ships to a different address, and tax is the worst place in the system for two sources of truth.
  If a "default region" convenience is ever wanted, it is an additive nullable FK.
- **D-9 — Country is `char`-shaped ISO 3166-1 **alpha-2**, validated for shape only, never for
  membership in the seeded region catalog.** *(Documented functional decision; provisional pending
  Orders' tax-resolution debate.)* Two reasons membership validation is refused here. First, a
  customer may legitimately live in a country the tax catalog has not activated — refusing the
  address would block a record for a reason the administrator cannot fix from the Customers screen.
  Second, and decisively, `sales_regions.code` is **administrator-editable and nullable**
  ([schema.md](../../docs/database/schema.md#sales_regions)), so validating against it would make
  customer creation fail whenever an administrator blanks a code — a coupling with a silent,
  unrelated trigger. Stored uppercase for a canonical form; tightening to an FK against the catalog
  is an additive migration once Orders decides how a country maps to a region.
- **D-10 — One index beyond the primary key: `email` UNIQUE.** The unique index is a correctness
  constraint, not a performance one. `name`, both country columns and both city columns get none —
  the same cardinality reasoning applied to `users.status` and to `sales_regions`: a backoffice
  customer table is 10²–10⁴ rows, both a name lookup and a country filter resolve in a
  sub-millisecond scan, and each index costs a write on every insert and update. Verify the result
  with `php artisan db:table customers` after migrating, never by reading the migration
  ([migrations.md](../../docs/database/migrations.md#an-fk-column-does-not-also-get-an-explicit-index-here)).
- **D-11 — Structured address columns, duplicated for shipping and billing; no JSON blob, and no
  implicit "billing = shipping" fallback.** Structured because a later tax-resolution story must
  read `country` **per row** to resolve a region, and a JSON blob is unindexable and unqueryable for
  that. Duplicated rather than normalised into an `addresses` table because a customer has exactly
  two addresses by definition here, and a child table would buy nothing but a join. **No
  `billing_same_as_shipping` flag and no read-time fallback** *(documented functional decision)*: an
  implicit fallback means the stored billing country is ambiguous — `null` would mean both "unknown"
  and "same as shipping" — and PRD §3.2 resolves a **virtual** product's tax from the billing
  address specifically, so that ambiguity would land directly in a tax calculation. 0044 may offer a
  "same as shipping" copy affordance in the form; it copies the values at submit, and the backend
  stores exactly what it receives.
- **D-12 — `App\Policies\CustomerPolicy` exists, and this story creates it with three flat,
  tier-free abilities.** The actions authorize through the policy (`Gate::authorize('create',
  Customer::class)` / `Gate::authorize('update', $customer)`), never against a raw permission string.
  **The `SalesRegion` precedent is what settles this, and it settles it the opposite way to a first
  reading:** the shipped [`app/Policies/SalesRegionPolicy.php`](../../app/Policies/SalesRegionPolicy.php)
  (story 0017) **is** a policy — a no-policy domain entity is not a pattern this repo has. What that
  file establishes is not "skip the policy" but **what a policy looks like when the entity has no
  privilege tier**: flat ability methods delegating straight to `hasPermissionTo()`, permission names
  as constants on the class that owns the rule, no target-dependent branch on `update()`, and only
  the abilities something actually calls.
  <br><br>
  It is still true — and still the reason there is no tier logic — that a customer record can never be
  the acting user and holds no privilege tier, so every rule reduces to "does the actor hold
  `customers.<action>`" with zero row-level nuance. That makes the *bodies* trivial; it does not make
  the class pointless. Three things are bought by having it: the permission strings are named **once**
  on the class that owns the rule instead of being retyped at each `Gate::authorize()` call site (the
  convention `RolePolicy` sets and `UserPolicy`'s four literals are a recorded, deferred violation of);
  0044's per-row `Gate::allows()` UI hints ask the **same** method the write authorizes with, so the
  hint cannot drift from the click; and **if a later story does introduce a row-level rule** (a
  customer an actor may not view, a per-region restriction) it edits one method body rather than
  relocating every call site's target.
  <br><br>
  The abilities resolve through `spatie/laravel-permission`'s `Gate::before` hook, and this project's
  Super Admin bypass applies unchanged. **Ability ownership across the epic:** this story ships
  `viewAny`, `create` and `update`; **0042 adds `delete()` to the same file**, and no story defines an
  ability nothing calls.
- **D-13 — Changing a customer's email needs no verification link.** `users` parks an email change
  in `pending_email` behind a signed link because that address is an **authentication identifier**;
  a customer's is contact data and the customer has no account to take over
  ([assumption 16](../../docs/PRD/PRD.md#assumptions--confirmed-decisions): no customer portal this
  phase). Building a pending-email flow here would ship a mailbox-confirmation UX for a mailbox that
  logs into nothing. Tested negatively (`Notification::fake()`), so the absence is asserted rather
  than assumed.
- **D-14 — No `lang/{en,es}/customers.php` in this story.** Validation failures surface through
  Laravel's default messages; there is no user-facing copy until a screen exists. 0044 adds the file
  key-for-key in both locales. Adding it now would ship keys nothing reads, which the next story
  would then have to reconcile against its real labels.
- **D-15 — The list-retrieval contract is a specification, not a query scope.** The contract 0044
  must implement: **`Customer::query()->orderBy('name')`, returning every row, with no eager loading
  (no relation exists yet) and no query-level permission filter** (the route gate and the component
  own access, per the module-gate pattern). Ordered by `name` ascending because the list's primary
  job is looking a person up, not seeing what arrived most recently — and 0043's notification is
  what surfaces recency. **No scope method ships here**: a local scope whose only caller does not
  exist yet is speculative, and `Role::selectable()` — this repo's one local scope — exists for a
  *security* reason, not an ordering one. Pinned by a test in this story so the contract is
  executable rather than prose; 0044 pins it again at the component layer.

### Scope fences: what this story must NOT do

- Must **not** add `deleted_at`, `SoftDeletes`, or any restore path (0042).
- Must **not** create, dispatch, listen for, or reference a "new customer" notification (0043).
- Must **not** add a route, a Livewire component, a Blade view, a `config/modules.php` entry, or a
  translation file (0044).
- Must **not** define an `orders` relation, a `customer_id` FK, or an order-history query (0047 /
  Orders).
- Must **not** add a permission to `RolePermissionSeeder` — the four `customers.*` abilities are
  already seeded.
- Must **not** seed customer fixture data outside `DatabaseSeeder`'s `['local','testing']` gate;
  customers are user data, not required application data.

## Dependencies, risks and open questions

### Dependencies

**This story depends on no other Epic 3 story.** It is the foundation the rest of the epic builds
on, and it can start immediately. What it depends on is already shipped and verified:

| Depends on | State | Verified how |
| --- | --- | --- |
| `customers.*` permissions in the seeded catalog | **shipped** | `RolePermissionSeeder::MODULES` line 25 |
| `Gate::before` Super Admin bypass | **shipped** (Epic 1) | `docs/architecture/authorization.md` |
| The greenfield UUID migration pattern | **shipped** (task 0016) | `create_sales_regions_table` |
| The validation-trait convention | **shipped** | `app/Concerns/UserValidationRules.php` |

**What depends on this story** — the hand-offs to record at closure:

- **0042 (soft delete)** inherits a table with no `deleted_at` and must add it in its own migration.
  **The trap it must decide on, flagged here rather than discovered there:** `Rule::unique()` does
  **not** apply the soft-delete scope (verified on `users` —
  [schema.md](../../docs/database/schema.md#soft-deletes)), so a trashed customer's email stays
  taken forever unless 0042 either makes the uniqueness check trashed-aware or obfuscates the
  address on delete the way `User::delete()` does. It must also delete this story's
  "`Customer` does not use `SoftDeletes`" structural assertion rather than work around it.
  **It inherits `App\Policies\CustomerPolicy` and adds `delete()` to that existing file** — it does
  not create the class (**D-12**), and it must update this story's "defines no `delete()`" unit test
  rather than work around it, exactly as with the `SoftDeletes` assertion above.
- **0043 (notification)** hooks the "new customer" event onto `CreateCustomer`'s successful return.
  This story deliberately leaves that method a single, named place to hook — and ships a negative
  test asserting nothing is dispatched today, which 0043 inverts rather than deletes.
- **0044 (UI)** implements **D-15**'s retrieval contract, adds the route with `can:customers.view`
  **and** the matching `config/modules.php` entry naming the same single ability (a gated route
  without its registry entry is a screen nothing links to), calls `Gate::authorize()` **through this
  story's `CustomerPolicy`** before invoking each action — `viewAny` in `mount()` (its first and only
  caller), `create`, `update`, and 0042's `delete` — renders its per-row hints as
  `Gate::allows('update', $customer)` / `Gate::allows('delete', $customer)` so a hint asks the same
  question as the call it guards, keeps the id fed to `Rule::unique()->ignore()` server-authoritative
  (`#[Locked]` / re-read from the model), and adds `lang/{en,es}/customers.php`.
- **Orders (0045+)** adds `orders.customer_id` as a `foreignUuid` against this table. The delete
  behaviour it chooses is constrained by PRD §3.1's "orders are never orphaned" — which is what
  0042's soft delete exists to satisfy, so Orders must **not** add a `cascadeOnDelete`.

### Risks

- **R-1 — The story's own scope is easy to over-fill.** Four sibling stories carve behaviour out of
  one PRD section, and every one of them is *mentioned* in the same five scenarios. Mitigation: the
  [scope fences](#scope-fences-what-this-story-must-not-do) are enumerated as prohibitions, and each
  names its owning story number.
- **R-2 — CI and production disagree on string collation.** SQLite's `BINARY` is case-sensitive;
  MySQL's `utf8mb4_unicode_ci` is case- *and* accent-insensitive. A duplicate-email test that relies
  on the index alone would pass in CI and behave differently in production. Mitigated structurally
  by **D-5** (normalise in PHP, so both engines see the same bytes), and the mixed-case duplicate
  test is the specific case that proves it. **Note the residual:** accent folding is *not* addressed
  — MySQL would treat two emails differing only by an accented character as colliding while SQLite
  would not. This is accepted, because the `email` RFC space makes accented local parts vanishingly
  rare here, and because unlike story 0023's category names an email is not a human-chosen display
  label. Recorded so it is a known asymmetry rather than a surprise `23000`.
- **R-3 — The migration length and the validation `max:` must stay in lockstep.** Six columns carry
  a non-255 cap. A validation rule looser than its column silently produces a truncation or a
  `22001` in production; stricter is merely confusing. Mitigated by the both-sides boundary dataset
  in the test plan, which fails if either side moves alone.
- **R-4 — A mistyped ability fails closed, silently.** With the policy in place the risk moves rather
  than disappearing: `Gate::authorize('creat', Customer::class)` finds no policy method and denies
  everyone, and a typo inside `CustomerPolicy::CREATE_PERMISSION` denies everyone too. Either way,
  denial looks exactly like a correct refusal
  ([authorization.md](../../docs/architecture/authorization.md)). Mitigated by requiring a **positive**
  success test beside every 403 test, plus the literal-ability assertion against the seeded catalog.
- **R-5 — No customer seeder means no local data to click on** once 0044 lands. Accepted: customers
  are user data, and `DatabaseSeeder`'s `['local','testing']` fixture gate is where a demo dataset
  belongs if one is ever wanted. Called out so 0044 does not discover an empty screen and "fix" it
  by seeding production data.

### Resolved questions

Every question raised by the three contributors is resolved above; none is left open. For the
record, mapped to its decision:

| Question raised | By | Resolved as |
| --- | --- | --- |
| Shape of "contact info" | backend-expert | **D-4** — single nullable `phone`, no format rule |
| Structured vs. JSON address | backend-expert, database-expert | **D-11** — structured columns |
| Does billing default to "same as shipping"? | backend-expert | **D-11** — no, stored explicitly; copy is a UI affordance |
| Does `sales_region_id` belong on `customers`? | backend-expert | **D-8** — no, resolved per order |
| Global vs. scoped email uniqueness | backend-expert | **D-6** — unique within `customers` only |
| Required vs. optional fields at create | backend-qa | **D-3** — name + email required, rest optional |
| Does this story ship a route/component? | backend-qa | **D-1** — no; authorization tested at the action layer |
| Is `HasUuids` the PK strategy? | backend-qa | Settled — UUID v7, per this project's Epic 2+ policy |
| `phone` shape | database-expert | **D-4** — single nullable column |
| Country-code representation | database-expert | **D-9** — alpha-2, shape-validated, provisional |
| Schema impact from 0043? | database-expert | Confirmed none — the notification reads, never writes |
| Split `name` into first/last? | database-expert | **D-15's sibling:** single `name`, matching `users.name` and `sales_regions.name`; PRD says "a name" |

### Recorded dissent

**`backend-expert` recommended shipping no `app/Actions/Customers/` at all** — a plain
validate-then-save inside 0044's component, on the `SalesRegion` precedent, which was described in
the debate as having neither an action class nor a policy. The facilitator overruled this, and the
reasoning is recorded so it can be reversed knowingly.

> **The premise was checked against the real tree afterwards and does not hold.** `SalesRegion` has
> **both**: [`app/Policies/SalesRegionPolicy.php`](../../app/Policies/SalesRegionPolicy.php) and
> `app/Actions/SalesRegions/` (`UpdateSalesRegion`, `SetSalesRegionActive`, `SetDefaultSalesRegion`),
> all from story 0017. So the recommendation rested on a property the precedent does not have — which
> strengthens the overrule below rather than weakening it, and independently overturns this story's
> original **D-12**. Recorded rather than deleted, per the rule that a re-verified finding's
> disposition is written down instead of quietly dropped
> ([errors-log.md](../../docs/errors-log.md)).

1. **Two behaviours in this story need a single named home, and a component is not one.** Email
   lowercasing must happen at *every* write site (**D-5**), and the `23000` → `ValidationException`
   conversion must too. With no action, "every write site" means 0044's component plus every future
   caller — precisely the drift
   [base-standards.md](../../docs/conventions/base-standards.md#an-authorization-rule-belongs-to-the-action-not-to-one-of-its-callers)
   exists to prevent, and precisely the gap task 0008a had to close retroactively for `CreateUser` /
   `UpdateUser`.
2. **`SalesRegion` is not a parallel case.** It has no create path at all — the catalog is seeded,
   and an administrator edits three columns on existing rows. `customers` is a full-CRUD entity with
   a uniqueness invariant and an authorization rule, which is the `Users` shape, not the
   `SalesRegion` shape. (This point stands unchanged; only the parenthetical premise above was wrong.
   Note the two entities *do* now agree on the policy question — see **D-12**.)
3. **The human-confirmed scope for this story explicitly includes "create/edit backend validation
   logic, duplicate-email rejection".** A story shipping only a model and a trait has nowhere for
   the duplicate-rejection race guard to live.

`backend-expert`'s **no-policy** recommendation was accepted at the time, and has since been
**reversed**: **D-12** now ships `CustomerPolicy`. The reversal is not a re-litigation of the
debate's reasoning — the recommendation's own stated ground was the `SalesRegion` precedent, and that
precedent has a policy. What survives from the recommendation is its *semantic* claim, which D-12
keeps in full: no tier, no ownership, no row-level nuance.

## Provenance

- **PRD source:** [§3.1 Customers](../../docs/PRD/PRD.md#31-customers), plus
  [assumption 16](../../docs/PRD/PRD.md#assumptions--confirmed-decisions) (customers are backoffice-managed
  and cannot log in) and [assumption 19](../../docs/PRD/PRD.md#assumptions--confirmed-decisions) (UUID PKs).
- **Process:** [workflow.md](../../docs/workflow.md) Phase 1 — Three Amigos debate, run via the
  `three-amigos-debate` skill. Contributions from `backend-expert`, `backend-qa` and
  `database-expert`, composed by `product-owner` as facilitator.
- **Gherkin conventions:** every scenario opens with a named business-role actor and carries exactly
  one `When`, per
  [gherkin-guidelines.md](../../docs/testing/frontend/gherkin-guidelines.md) rules 1 and 3 —
  mandatory across all Gherkin in this project, per the incident recorded in
  [errors-log.md](../../docs/errors-log.md).
- **Stage:** `new`. Moves to `ai-spec/tasks/in-progress/` at the start of Phase 3, and to
  `ai-spec/tasks/done/` at Phase 7 — both moves change this file's directory depth, so every
  relative link above must be re-resolved on each move (both directions), per
  [workflow.md](../../docs/workflow.md#link-integrity-check-on-every-stage-move).
- **Epic 3 decomposition:** story 1 of 15. Siblings referenced by number only (0042 soft delete,
  0043 notification, 0044 UI, 0047 order history) because their files may not exist yet.
