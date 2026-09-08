# [0035] Shipping carriers — backend (catalog table, seeded carriers, enable/disable toggle)

## Description
Create the `shipping_carriers` catalog: a seeded table of the four integrated carriers the
prototype ships with (SEUR, Correos, MRW, DHL Express) and the enable/disable toggle that drives
each carrier's active/inactive state. Carriers are seeded, not admin-creatable — the only
mutation this story ships is the toggle. No external carrier API is called, stubbed, or
depended on anywhere.

## Type
backend | includes database-expert: **yes**

Paired frontend sibling: the Shipping screen's Blade/Flux markup (carrier cards, toggle control,
ACTIVO/INACTIVO badge) is **not** in this story — it belongs to the Epic 2 frontend story that
owns the full Shipping screen. This story ships the component's public surface plus a placeholder
view, mirroring exactly how [0004](done/0004-users-list-editor-backend.md) shipped
`App\Livewire\Users\Index` ahead of [0006](done/0006-users-list-editor-ui.md)'s real markup.

Boundaries with siblings, referenced and never redefined here:
- **0032 / 0033** (shipping geography catalog and zones) — independent of this story; carriers and
  zones do not meet until 0036.
- **0036** (rate rules) owns `shipping_rates`, its `foreignUuid('shipping_carrier_id')`, the FK's
  `onDelete` behaviour, the grouped rate table, and the "a disabled carrier's rates become
  unusable" consequence. This story owns only the flag that consequence reads.
- The paired **frontend** story owns the carrier card markup, the toggle control, the per-carrier
  accent colour, and browser tests.

## Gherkin
```gherkin
Feature: Shipping carriers

  Scenario: Enable a carrier
    Given a shipping administrator, with the "MRW" carrier disabled
    When they enable the "MRW" carrier
    Then "MRW" is marked active

  Scenario: Disable a carrier
    Given a shipping administrator, with the "MRW" carrier enabled
    When they disable the "MRW" carrier
    Then "MRW" is marked inactive

  Scenario: A carrier's state survives leaving the screen
    Given a shipping administrator who has just disabled the "MRW" carrier
    When they reload the shipping screen
    Then "MRW" is still shown as inactive

  Scenario: The carrier catalog is seeded, not invented
    Given an operator running the database seeders on a fresh installation
    When the shipping carrier seeder runs
    Then exactly the four prototype carriers exist, each with its own code and display name

  Scenario: Configuring a carrier never contacts the carrier
    Given a shipping administrator, with the "MRW" carrier disabled
    When they enable the "MRW" carrier
    Then no outbound HTTP request is made to any external host

  Scenario: A user without the shipping edit permission cannot toggle a carrier
    Given a signed-in user who does not hold the "edit shipping" permission
    When they attempt to toggle the "MRW" carrier
    Then the attempt is refused and "MRW" keeps its previous state

  Scenario: A user without the shipping view permission cannot reach the screen
    Given a signed-in user who does not hold the "view shipping" permission
    When they request the shipping screen
    Then access is refused

  Scenario: Re-seeding does not resurrect a carrier an administrator disabled
    Given a shipping administrator who has disabled the "MRW" carrier
    When an operator re-runs the database seeders
    Then "MRW" is still disabled

  Scenario: Re-seeding does not duplicate a carrier an administrator renamed
    Given a shipping administrator who has renamed a carrier's display name
    When an operator re-runs the database seeders
    Then no second row is created for that carrier
```

## Files to create/modify

### Database
- `database/migrations/<timestamp>_create_shipping_carriers_table.php` — **new**. First real use of
  the greenfield UUID pattern documented in
  [`docs/database/migrations.md`](../../docs/database/migrations.md#uuid-primary-keys):

  ```php
  Schema::create('shipping_carriers', function (Blueprint $table): void {
      $table->uuid('id')->primary();
      $table->string('code', 10)->unique();
      $table->string('name');
      $table->string('description')->nullable();
      $table->boolean('is_active')->default(true);
      $table->timestamps();
  });
  ```

  `down()` is `Schema::dropIfExists('shipping_carriers');` — the unique index drops with the table,
  so no explicit `dropUnique()` is needed (contrast `add_pending_email_to_users_table`, which drops
  a column, not a table).

  Why each column, and why this is wider than "name + `is_active`": the PRD states carriers "match
  the prototype **almost as-is**" ([§2.4](../../docs/PRD/PRD.md#24-shipping)), and the prototype's
  own carrier record — verified in `docs/arospe-handoff/project/js/envios.js`, not inferred from
  the screenshot — is `{ name, tag, desc, enabled, hue }`:

  | Prototype key | Column | Verdict |
  | --- | --- | --- |
  | `tag` (`SEUR`/`CRRS`/`MRW`/`DHL`) | `code` | **required now** — the badge string, and the stable natural key the seeder matches on |
  | `name` (`SEUR`/`Correos`/`MRW`/`DHL Express`) | `name` | **required now** — editable display name, genuinely different from `code` |
  | `desc` (`24h · Península y Baleares`) | `description` | **required now** — the card tagline the paired frontend story renders |
  | `enabled` | `is_active` | **required now** — the subject of this story |
  | `hue` (`8`/`210`/`155`/`45`) | *(none)* | **deferred** — a static lookup keyed by `code`, not a column; nothing in the PRD makes the accent colour admin-editable |

  `code` and `description` are called required *now* rather than deferred specifically because the
  paired frontend story renders both directly from this row: deferring them buys nothing and costs
  a second alteration migration the moment that story starts.

  **No index on `is_active`** — the same reasoning
  [`docs/database/schema.md`](../../docs/database/schema.md#users) already records for
  `users.status`: four rows resolve in a sub-millisecond clustered scan while an index costs a
  write on every update. If one is ever needed it must be composite, never bare `is_active`.

- `app/Models/ShippingCarrier.php` — **new**. `use HasFactory, HasUuids;`,
  `#[Fillable(['code', 'name', 'description'])]` with **`is_active` deliberately omitted**, which is
  this codebase's mass-assignment guard (see
  [`docs/conventions/base-standards.md`](../../docs/conventions/base-standards.md#model-conventions)) —
  the toggle action below is the column's single writer. `casts()` returns
  `['is_active' => 'boolean']`. `@property` PHPDoc block with `@property string $id`, no
  `$keyType`/`$incrementing` properties.

- `database/factories/ShippingCarrierFactory.php` — **new**. Sequenced `code`, faker `name`,
  `is_active => true`, plus an `inactive()` state. A factory *can* set the non-fillable `is_active`;
  `UserFactory` already does exactly this with the non-fillable `status`, so this is verified by
  precedent, not assumed.

- `database/seeders/ShippingCarrierSeeder.php` — **new**, called from `DatabaseSeeder::run()`
  alongside `RolePermissionSeeder`. One `firstOrCreate` per carrier, **matched on `code`**:

  ```php
  ShippingCarrier::firstOrCreate(
      ['code' => 'CRRS'],
      ['name' => 'Correos', 'description' => 'Nacional · puntos de recogida', 'is_active' => true],
  );
  ```

  Two properties of this shape are load-bearing and must not be "simplified":
  - **`firstOrCreate`, never `updateOrCreate`.** Seeding is a required deployment step here (see
    [`docs/architecture/authorization.md`](../../docs/architecture/authorization.md)), so the seeder
    runs again after go-live. An `updateOrCreate` carrying `is_active` would silently re-enable a
    carrier an administrator disabled, on every deploy — the seeder undoing an admin's own decision.
  - **Match on `code`, not `name`.** `name` is editable display text; if an admin renames
    "DHL Express" → "DHL", a `name`-keyed match misses and the next reseed inserts a duplicate row.
    `code` never changes after seeding, so it is the only safe idempotency key. (This is the same
    class of bug as the string-keyed `password_reset_tokens` incident in
    [`docs/errors-log.md`](../../docs/errors-log.md) — match on the stable key, not the mutable one.)

### Application
- `app/Actions/Shipping/ToggleShippingCarrier.php` — **new**. Single-purpose invokable action per
  [`docs/conventions/naming.md`](../../docs/conventions/naming.md#classes) (imperative verb phrase,
  no `Action` suffix): `__invoke(ShippingCarrier $carrier): ShippingCarrier`, flipping `is_active`
  via `forceFill()->save()`. Being an action rather than an inline component method makes it the one
  call site any future screen reuses, and keeps the domain rule testable without a UI.

- `app/Livewire/Shipping/Index.php` — **new**. `#[Title('Shipping')]`, `#[Locked]` where applicable,
  a `carriers` list and a `toggleCarrier(string $carrierId, ToggleShippingCarrier $toggle)` method
  taking the action as a trailing container-resolved parameter (per-method action injection, per
  [`docs/conventions/code-style.md`](../../docs/conventions/code-style.md#inject-single-purpose-actions-per-method)).
  Authorizes `shipping.view` in `mount()` and `shipping.edit` as the **first statement** of
  `toggleCarrier()` — route middleware alone does not protect `/livewire/update`, per
  [`docs/security/livewire-authorization.md`](../../docs/security/livewire-authorization.md).

- `resources/views/livewire/shipping.blade.php` — **new placeholder**. Note the *flat* path: Livewire
  resolves `App\Livewire\Shipping\Index` to `livewire/shipping`, per the
  [`Index`-in-a-subfolder exception](../../docs/conventions/naming.md#exception-a-component-named-index-resolves-to-its-parent-folders-name).
  Real markup belongs to the paired frontend story.

- `routes/web.php` — **modify**. Inside the existing `auth` + `verified` group:

  ```php
  // `can:shipping.view`, not Spatie's `permission:` — see the users.index comment above.
  Route::livewire('shipping', ShippingIndex::class)
      ->middleware(['can:shipping.view'])
      ->name('shipping.index');
  ```

  `can:`, never `permission:` — Livewire 4's `PersistentMiddleware` allow-list carries Laravel's
  `Authorize` but not Spatie's middleware, so `permission:` would leave every `/livewire/update`
  round-trip ungated at the route layer. This is a correctness rule, not a style choice; see
  [`docs/api/routes.md`](../../docs/api/routes.md#usersindex--the-first-permission-gated-route).

- `lang/en/shipping.php` + `lang/es/shipping.php` — **new**, key-for-key identical. Carrier state
  labels (`statuses.active` / `statuses.inactive`) and screen copy. Keys from the start rather than
  literal strings, for the reason recorded in
  [0010's open question A](done/0010-role-permission-management-backend.md): PRD assumption 14 requires an
  admin UI language switcher, and retrofitting keys module-by-module later costs far more.

- **No policy.** `ShippingCarrierPolicy` would only re-wrap `hasPermissionTo('shipping.edit')`.
  `UserPolicy` exists because its abilities carry *per-target* rules (Super Admin protection,
  trashed-target refusal); a carrier toggle has no per-record nuance today. Revisit only if 0036
  introduces a per-carrier business rule.

## Tests to perform

### Unit — `tests/Unit/Models/ShippingCarrierTest.php`
- [ ] `is_active` casts to a real `bool`, not `0`/`1`.
- [ ] A factory-created carrier gets a UUID `id` the factory never sets (the `HasUuids` convention).

### Integration — `tests/Feature/Shipping/ToggleShippingCarrierTest.php`
- [ ] A shipping administrator enables a disabled carrier → `is_active` becomes `true`.
- [ ] A shipping administrator disables an active carrier → `is_active` becomes `false`.
- [ ] The new state is read back from the database after a fresh mount — guards against a toggle
      that only mutates the in-memory public property.
- [ ] Toggling an already-active carrier to active again is a no-op, not an error.
- [ ] **No outbound HTTP request is made.** `Http::preventStrayRequests()` in the file's
      `beforeEach`, then toggle in both directions. This belongs in the feature suite rather than as
      an `arch()` test: `preventStrayRequests()` proves *this action makes no call*, whereas an arch
      test could only assert "no `Http::` facade import", which a direct Guzzle/cURL call bypasses.

### Integration — `tests/Feature/Seeders/ShippingCarrierSeederTest.php`
- [ ] After seeding, exactly four carriers exist with exactly the expected `code`/`name` pairs
      (order-independent, one dataset-driven assertion — not four near-identical tests).
- [ ] Seeding twice leaves the count at four (idempotency).
- [ ] Seed → disable a carrier → seed again → it is **still disabled**. This is the sharpest risk in
      the story; it fails loudly against any `updateOrCreate` implementation.
- [ ] Seed → rename a carrier's `name` → seed again → **no duplicate row** is created (proves the
      match key is `code`, not `name`).
- [ ] The test neutralises any ambient config it depends on rather than inheriting the developer's
      `.env`, per the [`docs/errors-log.md`](../../docs/errors-log.md) entry on the seeder test that
      passed in CI and failed locally.

### Negative / authorization — `tests/Feature/Shipping/CarrierAuthorizationTest.php`
- [ ] A user without `shipping.view` gets 403 from `GET route('shipping.index')` (**HTTP layer**).
- [ ] A user without `shipping.edit` is refused by `toggleCarrier()` via `Livewire::test()`
      (**component layer**), and the carrier's state is unchanged afterwards.
      These are two tests on purpose, not one — per
      [`docs/security/livewire-authorization.md`](../../docs/security/livewire-authorization.md),
      an HTTP test and a `Livewire::test()` test cover different entry points and neither
      substitutes for the other.
- [ ] A Super Admin holding no explicit `shipping.edit` grant can still toggle, exercising the
      documented `Gate::before` bypass.
- [ ] Toggling a non-existent carrier id is refused (404 / `ModelNotFoundException`), not a silent
      no-op.

### Not worth writing
- Migration `up()`/`down()` mechanics — `RefreshDatabase` already exercises them every run.

## Expected outcome
`shipping_carriers` exists with four seeded rows (SEUR, Correos, MRW, DHL Express), each carrying a
short code, a display name, a tagline and an active flag. `/shipping` is reachable only with
`shipping.view`; a carrier's active state can be flipped only with `shipping.edit`, only through
`ToggleShippingCarrier`, and the change persists. Re-running the seeders is safe on a live database:
it never re-enables a carrier an administrator disabled and never duplicates one they renamed. No
code path in the story reaches the network.

## Acceptance criteria
- [ ] Carriers can be enabled and disabled, and each carrier exposes an active/inactive state
      (PRD [§2.4](../../docs/PRD/PRD.md#24-shipping) AC 1).
- [ ] **No external carrier API is called, stubbed, or configured** — proven by a test, not by
      inspection (PRD §2.4 AC 5; reinforced by the PRD's
      [Out of scope](../../docs/PRD/PRD.md#out-of-scope) entry "Real carrier API integration").
- [ ] The four prototype carriers are seeded with distinct `code` and `name` values.
- [ ] `is_active` is not mass-assignable; `ToggleShippingCarrier` is its only writer.
- [ ] Re-seeding is idempotent and never overwrites an administrator's toggle decision.
- [ ] The screen is gated on `shipping.view` at the route with `can:` (never `permission:`), and
      `toggleCarrier()` re-authorizes `shipping.edit` as its first statement.
- [ ] `down()` is the exact inverse of `up()`.
- [ ] No zone, geography-catalog, or rate-rule logic is introduced by this story.

## Definition of Done
- [ ] Tests written and green, plus the full existing suite
      ([`contracts.md`](../../docs/contracts.md) Full Test Suite Gate Rule).
- [ ] Code reviewed (code-reviewer).
- [ ] No security findings (appsec-auditor).
- [ ] Documentation updated (docs-keeper) — `docs/database/schema.md` (new table + ER diagram),
      `docs/api/routes.md` (the `shipping.index` route), `docs/architecture/authorization.md` (the
      second permission-gated route), `docs/conventions/base-standards.md` if the greenfield UUID
      pattern's first real use warrants a note.
- [ ] Acceptance criteria met.

## Dependencies and related work
- **Depends on 0002** (seeded role/permission catalog) — `shipping.view` / `shipping.edit` already
  exist in `RolePermissionSeeder::MODULES`; this story adds no new permission.
- **Independent of 0032 / 0033** (geography catalog, zones). Carriers and zones first meet in
  **0036** (rate rules), which will `foreignUuid('shipping_carrier_id')->constrained()` against this
  table — so this story must land before 0036, which the numbering already ensures.
- Follows the **0004 → 0006** backend-then-frontend precedent for the paired Shipping screen story.

## Resolved during Phase 1
Recorded so they are not reopened:
- **The toggle is an `app/Actions/Shipping/` action**, not an inline component method — one reusable
  call site, testable without a UI.
- **This story ships the route + Livewire component with a placeholder view**, rather than deferring
  both to the frontend story. `backend-expert` argued for deferral (the full Shipping screen also
  hosts rate rules, so building the component now risks rework). Overruled on precedent: 0004 shipped
  `App\Livewire\Users\Index` with a placeholder view and 0006 built the markup on top, and without a
  route the story's own Gherkin has no actor-facing entry point and QA has no HTTP layer to test.
- **Gate on the permission string, no policy** — no per-target rule exists to justify one.
- **`shipping.create` / `shipping.delete` are not used by this story.** Carriers are seeded and not
  admin-creatable; those two actions belong to rate rules and zones. Nobody should build a "create
  carrier" affordance from their mere existence in the catalog.

## Confirmed decisions
Raised during the Phase 1 debate and **confirmed with the product owner on 2026-08-18**. Nothing
here is open; recorded so the reasoning is not relitigated in Phase 3.

**A. The schema carries `code` + `name` + `description`**, wider than this task's originally handed
scope ("name, `is_active`, timestamps"). The basis is the PRD's "carriers match the prototype almost
as-is" plus the prototype's real carrier record in `docs/arospe-handoff/project/js/envios.js`
(`{ name, tag, desc, enabled, hue }`) — verified in source, not inferred from the screenshot. The
paired frontend story renders all three from this row, so deferring them would only buy a second
alteration migration; `code` is additionally the seeder's only safe idempotency key, since matching
on the mutable `name` duplicates the row the first time an administrator renames a carrier.

**B. All four carriers are seeded active.** The prototype ships MRW disabled and the PRD's Gherkin
opens with "Given the 'MRW' carrier disabled", but that is a scenario precondition for tests and
factories to arrange — not a mandate for a production seeder to ship a carrier switched off for
cosmetic fidelity.

**C. `code: 'DHL'`, `name: 'DHL Express'`.** The PRD prose names "DHL" while the prototype card
title is "DHL Express"; splitting code from display name satisfies both exactly. The same split
applies to Correos (`code: 'CRRS'`, `name: 'Correos'`).

**D. Disabling a carrier that still has rate rules is deferred to 0036.** No rate rules exist yet,
so deciding the warn-vs-block rule now would be designing against an absent table. AC 1's "its rates
become usable" wording is satisfied here by the flag alone.

**E. `description` stays mass-assignable** (`#[Fillable]`), so a later story can add an edit UI with
no model change. This story ships no such UI either way.

**F. UUID v7 primary key via `HasUuids`.** Project-wide policy is UUID v7 for all new Epic 2 business
entities, the shipping geography catalog (story 0032) being the single exception — so this table
follows it, which also keeps 0036's `foreignUuid` FK matched on both sides.
[ADR 0001](../../docs/decisions/0001-uuid-primary-keys.md) enumerates only `users` plus six Epic 2/4
entities and does not name this table; amending it to record that the list was illustrative rather
than exhaustive is a **follow-up task, not blocking** this story.

## Provenance
Phase 1 Three Amigos debate, 2026-08-17: `product-owner` + `backend-expert` + `backend-qa` +
`database-expert`, per [`docs/workflow.md`](../../docs/workflow.md#phase-1--three-amigos-debate)'s
classification rule (backend, touches the data model). Story scope derives from PRD
[§2.4 Shipping](../../docs/PRD/PRD.md#24-shipping) — the Gherkin scenarios "Enable a carrier" and
"Disable a carrier", acceptance criteria 1 and 5 — which that section confirms is the **unchanged**,
prototype-faithful part of Shipping; only the zone catalog diverges.
