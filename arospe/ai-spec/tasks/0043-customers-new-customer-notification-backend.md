# [0043] Customers — "new customer" notification (backend)

## Description
When a customer record is created, generate a **database notification** for every administrator who
holds `customers.view`. This closes the first of the four confirmed notification events in PRD
[§ Cross-cutting: global search & notifications](../../docs/PRD/PRD.md#cross-cutting-global-search--notifications)
and the last acceptance criterion of [§3.1 Customers](../../docs/PRD/PRD.md#31-customers). This story
owns the `notifications` table, the `CustomerCreated` notification, the recipient-resolution rule, and
the dispatch site inside story 0041's customer-create action. **It renders nothing** — no bell, no
dropdown, no unread badge.

> **Scope boundary, stated up front rather than discovered at review.** This repository has **no
> notification-viewing UI of any kind** — verified by grep across `resources/views/`, `app/Livewire/`
> and `config/modules.php`: there is no bell component, no dropdown, no unread indicator, and no route
> that lists notifications. "A new-customer notification is generated" is therefore fully testable
> (a `notifications` row plus `Notification::assertSentTo`) and produces **zero visible admin-facing
> behaviour**. A reviewer must not read that absence as an unfinished acceptance criterion — the
> viewer UI is a story that **does not exist in the current Epic 3 decomposition**, and OQ-3 below
> asks the human whether to add it to the backlog.

## Type
backend | includes database-expert: **yes**

### Why this is its own story and not part of 0041

The two are separable in both directions. 0041's customer CRUD is complete and shippable with no
notification at all (create, edit, soft-delete, duplicate-email rejection all stand alone), and this
story's deliverable is a table, a notification class and a recipient rule that are independently
testable against a `Customer` factory. What they share is exactly **one line** — the dispatch call —
which is why the coupling is called out explicitly in [Dependencies](#dependencies-risks-and-open-questions)
rather than left implicit. Merging them would put a greenfield `notifications` table, a
permission-driven recipient query, and full CRUD behind a single INVEST review.

## Gherkin

```gherkin
Feature: New-customer notification

  # --- The notification is generated ---

  Scenario: Creating a customer notifies an administrator who may view customers
    Given a customer administrator whose role grants the customers view permission
    When another administrator creates a customer record
    Then a new-customer notification is stored for the first administrator

  Scenario: The notification identifies the customer that was created
    Given a customer administrator whose role grants the customers view permission
    When another administrator creates a customer named "Ana Garcia"
    Then the stored notification carries that customer's identifier and name

  Scenario: Every administrator holding the customers view permission is notified
    Given three administrators whose roles all grant the customers view permission
    When a customer record is created
    Then a new-customer notification is stored for each of the three administrators

  # --- Who is deliberately not notified ---

  Scenario: An administrator without the customers view permission is not notified
    Given a blog editor whose role does not grant the customers view permission
    When a customer record is created
    Then no new-customer notification is stored for the blog editor

  Scenario: A Super Admin is not notified of routine customer creation
    Given a Super Admin, who holds no explicit customers view grant
    When a customer record is created
    Then no new-customer notification is stored for the Super Admin

  Scenario: A soft-deleted administrator is not notified
    Given a soft-deleted administrator whose role granted the customers view permission
    When a customer record is created
    Then no new-customer notification is stored for the soft-deleted administrator

  # --- The notification is not generated ---

  Scenario: A rejected customer creation generates no notification
    Given a customer administrator submitting a customer whose email duplicates an existing one
    When the creation is rejected with a validation message
    Then no new-customer notification is stored

  Scenario: An unauthorized customer creation generates no notification
    Given a signed-in administrator whose role does not grant the customers create permission
    When they attempt to create a customer record
    Then no new-customer notification is stored

  Scenario: Editing an existing customer generates no notification
    Given a customer administrator, with an existing customer record
    When they change that customer's shipping address
    Then no new-customer notification is stored

  Scenario: Deleting a customer generates no notification
    Given a customer administrator, with an existing customer record
    When they soft-delete that customer
    Then no new-customer notification is stored

  Scenario: A customer creation that fails to persist generates no notification
    Given a customer administrator whose customer creation fails partway through and is rolled back
    When the creation transaction is rolled back
    Then no new-customer notification is stored

  # --- Edge case ---

  Scenario: A creation with no eligible recipients still succeeds
    Given a store where no role grants the customers view permission
    When a customer record is created
    Then the customer is created and no notification is stored
```

## Files to create/modify

### Migration — `notifications`

`database/migrations/<ts>_create_notifications_table.php` — **new**, published with
`php artisan notifications:table` and then **edited**. Shape confirmed by `database-expert`.

```php
public function up(): void
{
    Schema::create('notifications', function (Blueprint $table) {
        $table->uuid('id')->primary();
        $table->string('type');
        $table->uuidMorphs('notifiable');   // NOT morphs() -- see below
        $table->text('data');
        $table->timestamp('read_at')->nullable();
        $table->timestamps();
    });
}

public function down(): void
{
    Schema::dropIfExists('notifications');
}
```

- **`$table->uuidMorphs('notifiable')`, never the stub's `$table->morphs('notifiable')`.** This is the
  one line that must change and the only way this story can fail at the schema level. `morphs()` emits
  an `UNSIGNED BIGINT` `notifiable_id`; `users.id` is a `CHAR(36)` UUID
  ([schema.md](../../docs/database/schema.md#users)), so the stock stub produces a column that cannot
  hold a single real recipient. `uuidMorphs()` emits `notifiable_type VARCHAR` +
  `notifiable_id CHAR(36)` plus their composite index. This is the same correction the historical
  `users` UUID conversion had to make to `spatie/laravel-permission`'s morph key
  (`model_id` → `model_uuid`, retyped) — but **far simpler here, because `notifications` is
  greenfield**: write it correctly once, with no rename, no backfill and no multi-migration dance. See
  [migrations.md](../../docs/database/migrations.md#uuid-primary-keys).
- **`php artisan notifications:table` publishes an app-owned stub into `database/migrations/`, and
  editing it is the expected step** — it is emphatically **not** a package-vendored migration in the
  sense of [migrations.md's Package-vendored migrations](../../docs/database/migrations.md#package-vendored-migrations).
  That rule exists for `create_permission_tables.php`, which reads its whole shape from
  `config('permission.*')` and must not be hand-edited. Laravel's notifications stub reads no config
  at all; once published it is ordinary repository source. Recorded because treating it as
  hands-off is exactly the mistake that would ship the broken `morphs()` column.
- **`notifiable_id` keeps its stock name — deliberately not renamed to `notifiable_uuid`.** The
  `model_id` → `model_uuid` rename in the permission tables was forced by that package's own
  `column_names.model_morph_key` config key; nothing here reads a configurable column name, and
  Laravel's `DatabaseNotification` model hardcodes the morph relation. `uuidMorphs()`'s standard naming
  is already idiomatic, and this repo's rename precedent does **not** generalise into a blanket
  renaming rule.
- **No explicit `$table->index(...)`.** `uuidMorphs()` already creates the composite
  `(notifiable_type, notifiable_id)` index, which is the only access path any future viewer UI needs
  ("my notifications, newest first"). Adding a second index would recreate the redundant
  `users_uuid_unique` mistake in [errors-log.md](../../docs/errors-log.md).
- **No index on `read_at`.** A per-user unread count filters on an already-indexed
  `(notifiable_type, notifiable_id)` prefix first; a boolean-ish column over a backoffice-sized table
  is the worst possible index candidate, the same reasoning [schema.md](../../docs/database/schema.md#users)
  gives for omitting one on `users.status`.
- **No foreign key to `users`.** The relation is polymorphic; an FK cannot be declared across a morph.
  This matches how `model_has_roles` already relates to `users` in this schema.
- **`down()` is the exact inverse of `up()`**, per [migrations.md](../../docs/database/migrations.md#structure).
- **No model change.** `App\Models\User` already carries `use Notifiable;`
  ([`app/Models/User.php`](../../app/Models/User.php), verified) — this story adds no trait, no column
  and no relation to `User`.

### Notification — `App\Notifications\CustomerCreated`

`app/Notifications/CustomerCreated.php` — **new**. `app/Notifications/` is a stock Laravel location
(`make:notification`), so no folder approval is needed
([base-standards.md](../../docs/conventions/base-standards.md#directory-structure)).

```php
class CustomerCreated extends Notification
{
    public function __construct(private readonly Customer $customer) {}

    /** @return array<int, string> */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /** @return array{customer_id: string, customer_name: string} */
    public function toArray(object $notifiable): array
    {
        return [
            'customer_id' => $this->customer->id,
            'customer_name' => $this->customer->name,
        ];
    }
}
```

- **`CustomerCreated`, not `NewCustomerCreated` or `CustomerCreatedNotification`.** A statement of fact
  about what happened, matching `PendingEmailVerification` / `UserInvitation` / the `ActivateVerifiedUser`
  listener, per [naming.md](../../docs/conventions/naming.md#classes). No `Notification` suffix.
- **`['database']` only — no `mail` channel.** See decision **D-2**.
- **Not `ShouldQueue`.** See decision **D-4**.
- **No `type` discriminator inside `data`.** Laravel's `DatabaseChannel` already writes the
  notification's FQCN into the `notifications.type` column, so a second copy inside the JSON payload
  would be redundant state that can drift on a class rename.
- **No `lang/` file in this story.** `data` stores structural values, never rendered copy — the same
  keys-not-copy reasoning [base-standards.md](../../docs/conventions/base-standards.md#an-app-owned-config-file-is-a-registry-and-must-survive-configcache)
  applies to `config/`. Baking `"New customer: Ana García"` into an immutable JSON column would put an
  English string somewhere `lang/es/` can never reach. The copy belongs to whichever story renders the
  bell (OQ-3).

### Recipient resolution + dispatch — `App\Actions\Customers\NotifyCustomerCreated`

`app/Actions/Customers/NotifyCustomerCreated.php` — **new**, invokable, imperative verb-phrase name
with no `Action`/`Service` suffix per [naming.md](../../docs/conventions/naming.md#classes). It lands
in the `app/Actions/Customers/` subfolder **story 0041 creates** for `CreateCustomer` — one subfolder
per domain area, per [base-standards.md](../../docs/conventions/base-standards.md#directory-structure).

```php
public function __invoke(Customer $customer): void
{
    $recipients = User::permission('customers.view')->get();

    Notification::send($recipients, new CustomerCreated($customer));
}
```

- **Why a dedicated action rather than three lines inlined into `CreateCustomer`.** It keeps this
  story's cross-story surface to exactly **one constructor-injected dependency and one call** inside
  0041's action, gives the recipient rule its own directly-callable test, and matches this repo's
  established action convention. It is **not** an abstraction: there is no base class, no interface and
  no registry. Story 0046 (`OrderCreated`) copies this file's *shape* — resolve recipients by
  permission, `Notification::send`, one concrete class — and writes its own concrete
  `NotifyOrderCreated`. Building a shared base for a second caller that does not exist yet is exactly
  the speculative design `CLAUDE.md` forbids; revisit only if a **third** event arrives and the three
  genuinely differ by nothing but a permission string.
- **`User::permission('customers.view')` — Spatie's own scope, resolved at dispatch time.** It matches
  users holding the permission through a role *or* directly, and it is a live query, never a cached or
  snapshotted list, so a grant revoked a minute ago takes effect immediately. This is the "gate on
  permissions, never role names" convention in
  [architecture/authorization.md](../../docs/architecture/authorization.md) applied to a recipient set
  rather than to an access check. `customers.view` already exists in the seeded catalog
  ([`RolePermissionSeeder::MODULES`](../../database/seeders/RolePermissionSeeder.php), verified) — this
  story adds no permission and reseeds no grant.
- **Soft-deleted administrators are excluded for free, and the story relies on that deliberately.**
  `User` uses `SoftDeletes`, so the `SoftDeletingScope` is already on `User::query()`; no `whereNull`
  is written and none should be added. The scenario above pins it, because a future refactor to
  `withTrashed()` would silently start notifying deleted accounts.
- **The guard is `web`.** `User::permission()` resolves against the default guard, which is `web`
  everywhere in this app; state it in the code comment so nobody "simplifies" it against a second guard
  later.

### Dispatch site — inside story 0041's `CreateCustomer`

**This is real cross-story coupling and the only file this story does not own.** `CreateCustomer` is
0041's deliverable; this story adds a constructor-injected `NotifyCustomerCreated` and one call:

```php
// app/Actions/Customers/CreateCustomer.php -- owned by story 0041
public function __construct(
    private readonly NotifyCustomerCreated $notifyCustomerCreated,
) {}
```

Two constraints on **where** that call goes, both load-bearing:

1. **After the persistence transaction commits — never inside it.** If `CreateCustomer` wraps its
   writes in `DB::transaction()`, the dispatch must sit after the closure returns (or inside a
   `DB::afterCommit` registration), so a rollback cannot leave a notification announcing a customer
   that does not exist. This is the same no-side-effect-on-rollback constraint story 0015 applied to
   its email dispatch, and it is a direct application of
   [the `DB::transaction()` entry in errors-log.md](../../docs/errors-log.md#wrapping-existing-code-in-a-dbtransaction-moved-a-cache-flush-nobody-had-written--2026-08-21):
   *wrapping existing code in a transaction is a change to every side effect that code already
   performed*. Read forward here rather than in hindsight.
2. **After authorization and validation, on the success path only.** A refused or invalid creation
   reaches no dispatch, which is what three of the Gherkin scenarios above assert.

- **Constructor injection, not a widened `__invoke()` signature.** `CreateCustomer::__invoke()`'s
  parameter list is a public contract 0041's Livewire component and every direct-call test must match
  verbatim; an internal collaborator belongs in the constructor, per the documented exception in
  [code-style.md](../../docs/conventions/code-style.md#exception-an-actions-own-dependency-is-constructor-injected-when-the-method-signature-is-a-public-contract).
  **This makes `CreateCustomer` un-`new`-able**, so every test must resolve it with
  `app(CreateCustomer::class)` — the constraint that page records after three actions broke ten call
  sites at once in story 0015b.
- **No model event, no observer.** A `created` event on `Customer` would fire for factories, seeders
  and imports too, and — per the blast-radius rule in
  [base-standards.md](../../docs/conventions/base-standards.md#steps-1-and-2-are-the-iteration-forms-run-both-unscoped-before-declaring-the-work-done) —
  would bind every test in the repo. The PRD's event is "an administrator created a customer", which
  is an *action*, not a row insert.

### Explicitly NOT in this story

Listed so reviewers do not reopen them: any bell / dropdown / unread-badge UI, any route or Livewire
component for reading notifications, a mark-as-read path, `read_at` being written by anything, a
`config/modules.php` entry, `lang/` copy, browser tests, mail or broadcast channels, notification
preferences or per-user opt-out, notification pruning/retention, and the other three confirmed events
(low/zero stock, new order — story 0046, blog post published). The `Customer` model, its migration,
its policy and its CRUD are **story 0041's**.

## Tests to perform

**`tests/Feature/Customers/NotifyCustomerCreatedTest.php`** (`RefreshDatabase`, direct-call against
`app(NotifyCustomerCreated::class)`)
- [ ] Unit: a user holding `customers.view` through a role is in the recipient set.
- [ ] Unit: a user holding `customers.view` granted **directly** (not via a role) is in the recipient set — `User::permission()` covers both, and a hand-rolled `whereHas('roles')` implementation would fail only this case.
- [ ] Negative: a user holding every *other* module's `.view` but not `customers.view` is not notified. This is the case that catches a wrong permission string, which is the single most plausible copy-paste slip here.
- [ ] Negative: a **soft-deleted** holder is not notified. Regression guard for a future `withTrashed()`.
- [ ] Negative: a Super Admin (zero explicit grants) is not notified — the recorded consequence of decision **D-1**, asserted rather than assumed.
- [ ] Edge: with **no** eligible recipients the call is a clean no-op — no exception, no rows.
- [ ] **Recipients are resolved at dispatch time, not cached**: grant `customers.view` to a new role *after* the container has resolved the action, dispatch, and assert the new holder receives it.

**`tests/Feature/Customers/CustomerCreatedNotificationTest.php`** (`RefreshDatabase`, driven through 0041's create path)
- [ ] Happy path with `Notification::fake()`: creating a customer sends `CustomerCreated` to each eligible administrator — `Notification::assertSentTo($recipients, CustomerCreated::class)`.
- [ ] **Without** `Notification::fake()`: a real `notifications` row exists, with `notifiable_id` equal to the recipient's UUID and `type` equal to `CustomerCreated::class`. **Both forms are required** — `assertSentTo` proves the dispatch happened but never touches the database, so it passes against a `morphs()`-shaped table that cannot store the row at all. This second test is the only thing that catches the migration's single most likely defect.
- [ ] The stored `data` payload carries `customer_id` and `customer_name` matching the created record, and **asserts the payload's exact key set** — so the deliberate exclusion of `email` (decision **D-5**) cannot be silently reversed.
- [ ] `read_at` is `null` on a freshly stored notification.
- [ ] Negative: a creation rejected by duplicate-email validation stores no notification, asserted with `Notification::assertNothingSent()` **and** a zero-row `notifications` count.
- [ ] Negative: a creation refused by authorization stores no notification.
- [ ] Negative: editing a customer stores no notification.
- [ ] Negative: soft-deleting a customer stores no notification.
- [ ] **Rollback: a creation that throws after the customer row is written stores no notification.** Force a failure inside the transaction and assert zero `notifications` rows. This is the assertion that pins constraint 1 of the dispatch site; without it, a dispatch moved inside the transaction — or before it — passes every other test here.
- [ ] Multiple eligible recipients each get their own row (count equals the number of holders), not one shared row.

**Deliberately not tested** (per [what-not-to-test.md](../../docs/testing/qa/what-not-to-test.md)):
migration `up()`/`down()` mechanics (`RefreshDatabase` runs every migration each run); Laravel's
`DatabaseChannel` write itself as a framework behaviour — exercise it *through* the dispatch, which is
what the app actually does; the UUID generation of `notifications.id`; anything in `tests/Browser/`
(this story renders nothing to browse); and unread-count / mark-as-read behaviour, which belongs to the
viewer story that does not exist (OQ-3).

## Expected outcome
A `notifications` table exists with a **UUID-compatible** polymorphic `notifiable` morph, so a real
`App\Models\User` row can actually be stored as a recipient. Creating a customer through the backoffice
stores one `CustomerCreated` database notification per administrator holding `customers.view` at that
moment — resolved live, excluding soft-deleted accounts, and excluding the Super Admin, whose
`Gate::before` bypass is an authorization construct and grants no `role_has_permissions` row for a data
query to match. The payload carries the new customer's identifier and name and nothing else. A creation
that is refused, invalid, or rolled back stores nothing; an edit or a delete stores nothing.

**Nothing is visible in the admin panel as a result of this story**, because no notification viewer
exists anywhere in this repository. The observable outcome is a database row and a passing
`Notification::assertSentTo` — which is exactly what PRD §3.1's last acceptance criterion ("Creating a
customer generates the confirmed 'new customer' notification") asks for, and no more.

## Acceptance criteria
- [ ] `notifications` exists, created from the published `notifications:table` stub **edited to use `$table->uuidMorphs('notifiable')`**, so `notifiable_id` is `CHAR(36)` and can hold a real `users.id`.
- [ ] The table carries `id` (uuid PK), `type`, `notifiable_type`/`notifiable_id`, `data`, nullable `read_at`, `timestamps` — with no extra index beyond the composite `uuidMorphs()` creates, and no FK.
- [ ] `App\Notifications\CustomerCreated` exists, uses the `database` channel **only** (no mail), is **not** `ShouldQueue`, and its `toArray()` returns exactly `customer_id` and `customer_name`.
- [ ] `App\Actions\Customers\NotifyCustomerCreated` resolves recipients as `User::permission('customers.view')->get()` on the `web` guard, evaluated at dispatch time and never cached.
- [ ] Soft-deleted users are excluded, by the existing `SoftDeletingScope` and not by a hand-written `whereNull`.
- [ ] A **Super Admin holding no explicit `customers.view` grant receives no notification** — a deliberate, documented, reversible decision (**D-1**), not an oversight.
- [ ] The dispatch happens inside story 0041's `CreateCustomer`, via a constructor-injected `NotifyCustomerCreated`, **after the persistence transaction commits** and only on the authorized, validated success path.
- [ ] No notification is stored for a rejected creation, an unauthorized creation, a rolled-back creation, an edit, or a delete.
- [ ] A creation with zero eligible recipients still succeeds, storing no notification and raising nothing.
- [ ] `App\Models\User` is **unchanged** (it already has `use Notifiable;`), and the permission catalog is **unchanged** (`customers.view` is already seeded).
- [ ] **No notification-viewing UI is built**, and its absence is recorded here as an out-of-scope gap (OQ-3) rather than as an unmet criterion.

## Definition of Done
- [ ] Tests written and green, plus the **full** existing suite (per the Full Test Suite Gate Rule in [contracts.md](../../docs/contracts.md)).
- [ ] Code reviewed (code-reviewer).
- [ ] No security findings (appsec-auditor) — specifically: that the recipient query cannot be widened by caller-supplied input; that the payload leaks no customer field beyond `customer_id`/`customer_name`; that a dispatch cannot be triggered by an actor who failed the `customers.create` gate; and that adding this side effect to `CreateCustomer` grants no capability to a less-privileged caller (the shared-code lesson from [errors-log.md](../../docs/errors-log.md)).
- [ ] Documentation updated (docs-keeper) — [database/schema.md](../../docs/database/schema.md) (new `notifications` section + ER diagram node, and the `uuidMorphs()`-not-`morphs()` rule), [database/migrations.md](../../docs/database/migrations.md#uuid-primary-keys) (a published-stub migration is app-owned source and must be edited for a UUID morph — explicitly distinguished from the package-vendored rule), and [conventions/base-standards.md](../../docs/conventions/base-standards.md#directory-structure) (`app/Notifications/` gains a third class; `app/Actions/Customers/` gains a second).
- [ ] **The Definition of Done explicitly does NOT include a notification-viewer UI**, for this story or for the Epic 3 batch as currently decomposed. See OQ-3.
- [ ] Acceptance criteria met.

## Dependencies, risks, and open questions

### Dependencies

- **Hard dependency on story 0041 (Customers CRUD backend), which must be implemented first.** The
  dispatch call lands inside 0041's `CreateCustomer` action, and every Feature test here needs the
  `Customer` model, its migration and its factory. Per the
  [task ordering rule](../../docs/workflow.md#task-ordering-rule), 0041's lower number is not
  cosmetic — sequence it into Phase 3 ahead of this story. (0041 is being composed in parallel and is
  referenced by id rather than by link, so this file carries no link to a path that may not exist yet;
  add the link once its filename is final.)
- **Depends on story 0002** only in that `customers.view` must already exist in the seeded catalog. It
  does; no seeder change is needed.
- **Story 0046 (new-order notification) will copy this story's shape**, not extend a shared class. The
  three facts to carry forward: `notifications` already exists after this story and needs no second
  migration; its own recipient permission is `orders.view`; and its dispatch inherits the same
  after-commit constraint.

### Risks

- **R-1 — The `morphs()`/`uuidMorphs()` trap is the highest-severity risk in this story, and it fails
  late.** `Notification::assertSentTo` passes against a broken table because it never touches the
  database. The mitigation is the mandatory second, un-faked test asserting a real row — it is listed
  as a test case rather than left to Phase 3 for exactly this reason.
- **R-2 — Cross-story edit.** This story modifies a file story 0041 owns. If 0041 is still in flight
  when this reaches Phase 3, the two must not be implemented by concurrent agents, per the
  [Parallel Agent File-Ownership Rule](../../docs/contracts.md#parallel-agent-file-ownership-rule).
- **R-3 — Unbounded row growth with no reader.** Every customer creation writes N rows that nothing
  ever reads or marks read while OQ-3 stays open. At backoffice volumes this is negligible, and
  `model:prune` is deliberately not wired here — recorded so it is a known consequence rather than a
  surprise if the viewer story is deferred indefinitely.

### Open questions

**OQ-1 — Should a `suspended` or `inactive` administrator receive notifications? Non-blocking; a
default is stated so Phase 3 is not blocked.** `User::permission()` filters on permissions and soft
deletes, not on `users.status`, so as specified all permission holders are notified regardless of
account state. **Recommended default: notify them (no status filter) _(recommended)_** — a notification
is a record, not access, and `users.status` is enforced at sign-in
([architecture/authentication.md](../../docs/architecture/authentication.md)); a suspended
administrator who is later reactivated then has an intact history rather than a silent gap. The
alternative — adding `->where('status', UserStatus::Active)` — is one line if the human prefers it.

**OQ-2 — Should the administrator who created the customer be notified of their own action?
Non-blocking; a default is stated.** As specified, yes: if they hold `customers.view` they are in the
recipient set like anyone else. **Recommended default: no self-exclusion _(recommended)_** — it keeps
the recipient rule a single query with no actor parameter, and a customer created by a future import or
external channel has no acting administrator at all, so a self-exclusion branch would be dead code on
that path. The alternative is passing the actor into `NotifyCustomerCreated` and rejecting them, which
reintroduces exactly the caller-supplied-state shape
[errors-log.md](../../docs/errors-log.md#a-guard-took-the-state-it-was-guarding-as-a-parameter-reopening-its-own-hole-one-level-up--2026-08-20)
warns about.

**OQ-3 — The notification-viewer UI is a genuinely missing story, and this is a decision for the
human, not an omission.** PRD [§ Cross-cutting](../../docs/PRD/PRD.md#cross-cutting-global-search--notifications)
carries four acceptance-criteria-bearing bell scenarios — an unread indicator, reading notifications
clearing that indicator, per-event generation, and no notification for unrelated changes. This story
delivers the **third** one for the customer event and nothing else, because **no story in the current
Epic 3 decomposition builds the bell**. That leaves two of the four PRD scenarios unowned by any
story anywhere in the backlog.

Three options, for the human to choose:

- **(a) Add a cross-cutting "notifications bell" story to the backlog now, sequenced after the last
  event producer _(recommended)_.** It is genuinely cross-cutting (its dropdown lists rows produced by
  Epic 2's stock event, Epic 3's customer and order events, and Epic 4's blog event), so it belongs to
  none of them and will otherwise keep being pushed into whichever epic notices last. Numbering it
  after the final producer means it can render every real event type rather than being retrofitted
  three times. This is the recommendation because the alternative is not "deferred" but "unowned" — and
  an unowned PRD criterion is precisely the failure mode this project's errors log keeps recording.
- **(b) Fold the bell into Epic 5 / the dashboard-shell work**, if a later epic already owns topbar
  chrome.
- **(c) Explicitly descope the bell for this phase**, and amend the PRD's cross-cutting section to say
  so. Acceptable, but it must be written down — leaving it silent means every future reviewer of every
  event-producing story re-asks whether the criterion was missed.

**This story is not blocked by OQ-3** and can pass Phase 2 with it open — it delivers exactly what PRD
§3.1's own acceptance criterion asks for. The question is about the *batch*, not about this file.

## Documented functional decisions

**D-1 — The Super Admin is deliberately excluded from this notification.** `User::permission('customers.view')`
is a **data** query against `role_has_permissions` / `model_has_permissions`, while the Super Admin's
access comes from the `Gate::before` bypass in
[architecture/authorization.md](../../docs/architecture/authorization.md) — an authorization-layer
construct that grants **no rows** for any query to match. A Super Admin therefore falls out of the
recipient set for free, and the decision is to **leave it that way**.

The reasoning is product, not technical convenience: the `Gate::before` bypass exists so the account
that administers the system is never locked out of it, not so that account receives routine CRUD
awareness traffic. A Super Admin who wants to see new customers can open the customers list directly,
which they can always reach. Bolting a `->orWhereHas('roles', …)` union onto the recipient query to
re-add them would also make this the only place in the codebase where the bypass is re-implemented as
a data query — the exact "gate on permissions, never role names" inversion the authorization doc
forbids.

**This is deliberate and cheaply reversible.** If the human wants Super Admins notified, the correct
shape is a `union` with the Super Admin role holders resolved through `Role::superAdminName()`, never a
hardcoded role-name string. `backend-expert` raised this as a genuine product call rather than
deciding it; it is decided here, recorded, and pinned by a test so a future change is a visible
decision rather than a drift.

**D-2 — Database channel only. No mail, confirmed.** `via()` returns `['database']` and nothing else.
The PRD's requirement is a **bell** — an in-panel indicator — and it says nothing about email. Adding
`mail` would introduce a per-customer-creation outbound send to every permission holder, with no
opt-out mechanism, no throttle, and no stated requirement, on a store that may import customers in
bulk. That is a spam vector arriving as an unasked-for feature. The `database` channel makes the
notification a queryable record the (future) bell reads, which is exactly the PRD's model. A mail
channel remains a one-line addition to `via()` if the business ever asks for it — with a throttle
decision attached at that point, not now.

**D-3 — The notification-viewer UI is out of scope for this story and for the Epic 3 batch as
currently decomposed.** Stated as an explicit Definition-of-Done line above rather than left implicit,
and escalated to the human as OQ-3 rather than silently assumed to be someone else's problem. The
consequence a reviewer must accept: this story's acceptance criteria are satisfied by database rows and
`Notification::assertSentTo`, with **no** admin-visible behaviour to click through and no browser test.

**D-4 — `CustomerCreated` is not `ShouldQueue`.** The only channel is `database`, so the entire
"delivery" is a single local `INSERT`. Queueing it would write a `jobs` row (this app runs
`QUEUE_CONNECTION=database`) to defer a write that is cheaper than the job row itself, and would put
the notification behind a worker that must be running for the feature to work at all — turning a
synchronous, assertable side effect into an eventual one that every test would need `Queue::fake()` to
observe. The precedent in [architecture/authentication.md](../../docs/architecture/authentication.md)
cuts the same way: `PendingEmailVerification` is queued because it performs an **outbound SMTP** call,
while `UserInvitation` deliberately is not. There is no outbound call here. Revisit only if a `mail`
channel is ever added (D-2), at which point queueing becomes the right answer for the same reason.

**D-5 — The payload carries `customer_id` and `customer_name`, and deliberately not the email.**
`backend-qa` proposed asserting name **and** email in the payload; this narrows that to name only, so
the disagreement is recorded rather than silently merged. `notifications.data` is an immutable JSON
snapshot with no update path: it survives the customer's soft-delete, survives any later email change,
and is reachable by no erasure routine this app has. Duplicating the customer's email into it creates a
stale second copy of a PII value whose canonical home already exists on the `customers` row. `name` is
kept because some human-readable label is needed for a one-line "New customer: …" entry, and `id`
because the bell must link to the record — everything else the viewer needs it can join for at render
time, against the live row rather than the snapshot. Honest statement of the tradeoff: this means a
notification for a **hard**-deleted customer would render a dangling link, which is acceptable because
PRD §3.1 mandates soft delete precisely so records are never physically removed. Reversible — adding a
field to `toArray()` is one line — but reversing it does **not** backfill existing rows, so a later
addition means a mixed-shape column. Decide additions deliberately.

## Resolved in the debate
- **Recipients are permission-driven (`customers.view`), never role-name-driven** — the repo's standing
  authorization convention, applied to a recipient set.
- **`notifications:table`'s published stub is app-owned source, not a package-vendored migration.**
  `database-expert` corrected `backend-expert`'s premise here, and the correction is load-bearing:
  treating the file as hands-off would have shipped the `morphs()` column that cannot store a UUID
  recipient. Recorded as a correction rather than merged silently.
- **`uuidMorphs()`, and `notifiable_id` keeps its stock name.** The `model_id` → `model_uuid` rename in
  the permission tables was forced by that package's config key and does not generalise.
- **A dedicated `NotifyCustomerCreated` action, with no shared base class or abstraction for the future
  `OrderCreated`.** Story 0046 copies the shape; it does not inherit from it.
- **`CustomerCreated`, not `NewCustomerCreated`** — the statement-of-fact naming rule, applied.
- **The "no visible behaviour" scope boundary is stated to the human explicitly**, at the top of this
  file, in the Expected outcome, in the Definition of Done and in OQ-3 — rather than being left for a
  reviewer to discover as an apparent gap.

## Provenance
Phase 1 three-way debate: `backend-expert` (the permission-driven recipient query and its
resolve-at-dispatch-time property, the database-only channel, the `CustomerCreated` naming, the
cross-story coupling flag, the no-speculative-abstraction constraint, and the Super Admin question
raised as a product call rather than decided), `backend-qa` (the `Notification::fake()` / `assertSentTo`
happy path, the positive and negative recipient sets, the Super Admin case as an explicit test whose
expected assertion follows the product decision, the no-dispatch-on-validation-failure cases, the
payload assertion, and the "generated ≠ visible" Definition-of-Done gap), and `database-expert` (the
correction that a published `notifications:table` stub is app-owned and editable, the mandatory
`uuidMorphs()` over `morphs()` with the `users.id` `CHAR(36)` reasoning, the greenfield-vs-conversion
contrast, the `read_at` and index decisions, and the recommendation against renaming `notifiable_id`).

Every claim of absence in this document was verified against the working tree by `product-owner` rather
than relayed: no `notifications` migration exists in `database/migrations/`; `App\Models\User` already
carries `use Notifiable;` and `SoftDeletes`; `customers.view` is present in `RolePermissionSeeder::MODULES`;
`app/Notifications/` holds exactly two classes; and `resources/views/` contains no notification, bell or
unread-indicator markup anywhere.
